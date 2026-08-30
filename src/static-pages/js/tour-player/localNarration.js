import {
  loadCvShowWebAudioRelease,
  resolveCvShowWebAudioConfig,
} from './webAudioRelease.js';

function primaryLocale(value) {
  return String(value || '').trim().toLowerCase().split(/[-_]/u)[0];
}

/**
 * @param {{ manifest?: any, createAudio?: () => HTMLAudioElement }} [options]
 */
export function createLocalAudioSpeechController({
  manifest,
  createAudio = () => new Audio(),
} = {}) {
  let generation = 0;
  let active = null;
  let prefetchedId = '';
  let lastError = '';

  const releaseAudio = (audio, { releaseSource = false } = {}) => {
    audio?.pause?.();
    if (releaseSource) {
      if (typeof audio?.removeAttribute === 'function') audio.removeAttribute('src');
    }
  };

  const clear = ({ releaseSource = false } = {}) => {
    if (!active) return;
    active.audio.removeEventListener?.('ended', active.onEnded);
    active.audio.removeEventListener?.('error', active.onFailed);
    releaseAudio(active.audio, { releaseSource });
    active = null;
  };

  const clearPrefetch = () => {
    prefetchedId = '';
  };

  const cancel = () => {
    generation += 1;
    clear({ releaseSource: true });
    clearPrefetch();
  };

  let controller = {
    available: Boolean(manifest?.byId?.size),
    get media() {
      return active?.audio || null;
    },
    get snapshot() {
      return Object.freeze({
        source: 'local',
        activeId: active?.id || '',
        paused: active ? Boolean(active.audio.paused) : true,
        prefetchedId,
        generationReceipt: active?.generationReceipt || null,
        playBlocked: Boolean(active?.playBlocked),
        lastError,
      });
    },
    prefetch(id) {
      let clip = manifest?.byId?.get?.(String(id || ''));
      if (!clip || active?.id === clip.id || prefetchedId === clip.id) return false;
      prefetchedId = clip.id;
      return true;
    },
    speak(text, options = {}) {
      let clip = manifest?.byId?.get?.(String(options.id || ''));
      if (!clip || clip.speech !== String(text || '')) return false;
      if (primaryLocale(options.lang) !== manifest.locale) return false;
      generation += 1;
      clear({ releaseSource: true });
      const audio = createAudio();
      clearPrefetch();
      lastError = '';
      let token = generation;
      let onEnded = () => {
        if (token !== generation || active?.audio !== audio) return;
        clear();
        options.onEnd?.();
      };
      let onFailed = (error) => {
        if (token !== generation || active?.audio !== audio) return;
        if (error?.name === 'NotAllowedError') {
          active.playBlocked = true;
          lastError = 'autoplay-blocked';
          releaseAudio(audio);
          options.onBlocked?.(lastError, error);
          return;
        }
        let mediaError = audio.error;
        const receipt = error?.receipt || (error?.status ? error : null);
        lastError = receipt
          ? `aligned-media-${receipt.status}-${receipt.reason || receipt.terminalReason || 'unknown'}`
          : error?.name
          || mediaError?.message
          || (mediaError?.code ? `media-error-${mediaError.code}` : 'local-audio-error');
        clear({ releaseSource: true });
        options.onError?.(lastError, receipt);
      };
      audio.addEventListener?.('ended', onEnded, { once: true });
      audio.addEventListener?.('error', onFailed, { once: true });
      const play = () => {
        if (token !== generation || active?.audio !== audio) return false;
        const attempt = active.playAttempt + 1;
        active.playAttempt = attempt;
        Promise.resolve(audio.play?.()).then(() => {
          if (token === generation && active?.audio === audio && active.playAttempt === attempt) {
            active.playBlocked = false;
            lastError = '';
          }
        }).catch((error) => {
          if (token !== generation || active?.audio !== audio || active.playAttempt !== attempt) return;
          onFailed(error);
        });
        return true;
      };
      active = {
        id: clip.id,
        audio,
        onEnded,
        onFailed,
        play,
        playAttempt: 0,
        playBlocked: false,
        resumeRequested: false,
        generationReceipt: null,
      };
      let setup;
      try {
        setup = options.onMedia?.(audio, clip);
      } catch (error) {
        onFailed(error);
        return false;
      }
      Promise.resolve(setup).then((receipt) => {
        if (token !== generation || active?.audio !== audio) return;
        if (receipt?.status !== 'completed') {
          let error = Object.assign(new Error('Aligned media generation did not complete'), {
            name: 'AlignedMediaGenerationError',
            receipt: receipt || Object.freeze({
              status: 'failed',
              reason: 'missing-terminal-receipt',
            }),
          });
          onFailed(error);
          return;
        }
        active.generationReceipt = receipt;
        if (options.startPaused !== true || active.resumeRequested) play();
      }).catch(onFailed);
      return true;
    },
    pause() {
      if (!active) return;
      active.playAttempt += 1;
      active.resumeRequested = false;
      active.audio.pause?.();
    },
    resume() {
      if (!active) return false;
      if (active.generationReceipt?.status !== 'completed') {
        active.resumeRequested = true;
        return true;
      }
      return active.play();
    },
    transition(id) {
      generation += 1;
      clear({ releaseSource: true });
      if (prefetchedId !== String(id || '')) clearPrefetch();
    },
    cancel,
  };
  return Object.freeze(controller);
}

/**
 * @param {{
 *   browserSpeech?: any,
 *   fetchImpl?: typeof globalThis.fetch,
 *   createAudio?: () => HTMLAudioElement,
 *   url?: string,
 *   baseUrl?: string,
 *   appConfig?: any,
 *   userSettings?: any,
 * }} [options]
 */
export function createCvShowNarrationController({
  browserSpeech,
  fetchImpl = globalThis.fetch,
  createAudio,
  url,
  baseUrl,
  appConfig,
  userSettings,
} = {}) {
  let localSpeech = null;
  let activeSpeech = null;
  let source = browserSpeech?.available ? 'browser' : 'none';
  let prepareController = null;

  let controller = {
    get available() {
      return Boolean(localSpeech?.available || browserSpeech?.available);
    },
    get snapshot() {
      return Object.freeze({
        source,
        active: source === 'local' ? localSpeech?.snapshot || null : null,
      });
    },
    get media() {
      return source === 'local' ? localSpeech?.media || null : null;
    },
    async prepare(story) {
      prepareController?.abort(new DOMException('CV Show narration configuration changed', 'AbortError'));
      prepareController = new AbortController();
      localSpeech?.cancel?.();
      localSpeech = null;
      activeSpeech = null;
      source = browserSpeech?.available ? 'browser' : 'none';
      let config = resolveCvShowWebAudioConfig({ url, baseUrl, appConfig, userSettings });
      if (!config) return controller.snapshot;
      if (primaryLocale(config.locale) !== primaryLocale(story?.narrationLocale)) {
        return controller.snapshot;
      }
      try {
        let manifest = await loadCvShowWebAudioRelease({
          story,
          config,
          fetchImpl,
          signal: prepareController.signal,
        });
        localSpeech = createLocalAudioSpeechController({ manifest, createAudio });
        source = localSpeech.available ? 'local' : source;
      } catch (error) {
        if (error?.name === 'AbortError') return controller.snapshot;
        localSpeech = null;
        source = browserSpeech?.available ? 'browser' : 'none';
      }
      return controller.snapshot;
    },
    prefetch(id) {
      return localSpeech?.prefetch?.(id) || false;
    },
    speak(text, options = {}) {
      if (localSpeech?.speak(text, options)) {
        activeSpeech = localSpeech;
        source = 'local';
        return true;
      }
      activeSpeech = browserSpeech || null;
      source = browserSpeech?.available ? 'browser' : 'none';
      return browserSpeech?.speak?.(text, options) || false;
    },
    pause() {
      activeSpeech?.pause?.();
    },
    resume() {
      return activeSpeech?.resume?.() ?? false;
    },
    transition(id) {
      localSpeech?.transition?.(id);
      browserSpeech?.cancel?.();
      activeSpeech = null;
    },
    cancel() {
      prepareController?.abort(new DOMException('CV Show narration stopped', 'AbortError'));
      prepareController = null;
      localSpeech?.cancel?.();
      browserSpeech?.cancel?.();
      activeSpeech = null;
      source = localSpeech?.available
        ? 'local'
        : browserSpeech?.available ? 'browser' : 'none';
    },
  };
  return Object.freeze(controller);
}
