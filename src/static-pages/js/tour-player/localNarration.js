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
    active.audio.removeEventListener?.('playing', active.onPlaying);
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
      // The immutable media clip is admitted by its Project/manifest binding.
      // Authored captions may intentionally use display spelling that differs
      // from the synthesis transcript carried by the audio release.
      if (!clip || !String(text || '').trim()) return false;
      if (primaryLocale(options.lang) !== manifest.locale) return false;
      generation += 1;
      clear({ releaseSource: true });
      const audio = createAudio();
      clearPrefetch();
      lastError = '';
      let token = generation;
      let onEnded = () => {
        if (token !== generation || active?.audio !== audio || active.ending) return;
        if (active.playRequested !== true) {
          active.endPending = true;
          return;
        }
        active.endPending = false;
        if (typeof options.beforeEnd !== 'function') {
          clear();
          options.onEnd?.();
          return;
        }
        active.ending = true;
        let alignedCompletion;
        try {
          alignedCompletion = options.beforeEnd();
        } catch (error) {
          onFailed(error);
          return;
        }
        Promise.resolve(alignedCompletion).then(() => {
          if (token !== generation || active?.audio !== audio) return;
          clear();
          options.onEnd?.();
        }).catch(onFailed);
      };
      let onFailed = (error) => {
        if (token !== generation || active?.audio !== audio) return;
        if (error?.name === 'NotAllowedError') {
          active.playBlocked = true;
          active.playRequested = false;
          active.reportStarted = null;
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
      let onPlaying = () => active?.reportStarted?.();
      audio.addEventListener?.('playing', onPlaying);
      const play = ({ deferMedia = false } = {}) => {
        if (
          token !== generation
          || active?.audio !== audio
          || active.playRequested !== true
        ) return false;
        if (active.generationReceipt?.presentationComplete === true) {
          onEnded();
          return true;
        }
        const attempt = active.playAttempt + 1;
        active.playAttempt = attempt;
        const reportStarted = () => {
          if (token === generation && active?.audio === audio && active.playAttempt === attempt) {
            active.playBlocked = false;
            lastError = '';
            if (active.reportedStartAttempt !== attempt && active.playRequested === true) {
              active.reportedStartAttempt = attempt;
              options.onStart?.();
            }
          }
        };
        active.reportStarted = reportStarted;
        if (deferMedia) return true;
        let result;
        try {
          result = audio.play?.();
        } catch (error) {
          onFailed(error);
          return false;
        }
        if (typeof result?.then === 'function') {
          Promise.resolve(result).then(reportStarted).catch((error) => {
            if (token !== generation || active?.audio !== audio || active.playAttempt !== attempt) return;
            onFailed(error);
          });
        }
        return true;
      };
      active = {
        id: clip.id,
        audio,
        onEnded,
        onFailed,
        onPlaying,
        play,
        playAttempt: 0,
        playBlocked: false,
        playRequested: options.startPaused !== true,
        endPending: false,
        ending: false,
        reportStarted: null,
        reportedStartAttempt: 0,
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
        if (active.playRequested) play();
      }).catch(onFailed);
      return true;
    },
    pause() {
      if (!active) return;
      active.playAttempt += 1;
      active.playRequested = false;
      active.reportStarted = null;
      active.audio.pause?.();
    },
    resume(options = {}) {
      if (!active) return false;
      active.playRequested = true;
      if (active.generationReceipt?.status !== 'completed') {
        return true;
      }
      return active.play(options);
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
    resume(options = {}) {
      return activeSpeech?.resume?.(options) ?? false;
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
