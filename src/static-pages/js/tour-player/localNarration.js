const LOCAL_AUDIO_MANIFEST_VERSION = 'cv-show-local-audio-manifest-v1';
const LOCAL_AUDIO_MODE = 'local';
const DEFAULT_VOICE_SELECTION = 'maximo-default-male';
const VOICE_SELECTIONS = Object.freeze(['maximo-default-male', 'custom-user']);
const SETTINGS_STORAGE_KEY = 'cv-show-settings';
const HASHED_MANIFEST_FILE_RE = /^[a-f0-9]{16,64}\/manifest\.json$/u;
const AUDIO_FILE_RE = /^[a-z0-9][a-z0-9._-]*-[a-f0-9]{12,64}\.(?:m4a|mp3|ogg|opus|wav)$/u;

function primaryLocale(value) {
  return String(value || '').trim().toLowerCase().split(/[-_]/u)[0];
}

function storyEntries(story) {
  return [
    ...(story?.scenes || []).map((entry) => ({ kind: 'short', entry })),
    ...Object.values(story?.branches || {}).map((entry) => ({ kind: 'detail', entry })),
  ];
}

function invalidManifest(reason) {
  return Object.assign(
    new TypeError(`CV Show local audio manifest is invalid: ${reason}`),
    { code: 'CV_SHOW_LOCAL_AUDIO_INVALID' },
  );
}

function readJsonConfig(source) {
  try {
    let value = JSON.parse(String(source || ''));
    return value && typeof value === 'object' && !Array.isArray(value) ? value : null;
  } catch {
    return null;
  }
}

function readAppConfig(documentRef) {
  return readJsonConfig(documentRef?.getElementById?.('pulse-show-config')?.textContent);
}

function readUserSettings(storage) {
  try {
    return readJsonConfig(storage?.getItem?.(SETTINGS_STORAGE_KEY));
  } catch {
    return null;
  }
}

export function resolveCvShowLocalAudioConfig({
  url = globalThis.location?.href,
  baseUrl = globalThis.document?.baseURI || url,
  appConfig = readAppConfig(globalThis.document),
  userSettings = readUserSettings(globalThis.localStorage),
} = {}) {
  if (!url || !baseUrl) return null;
  let locationUrl;
  let documentBase;
  try {
    locationUrl = new URL(url);
    documentBase = new URL(baseUrl);
  } catch {
    return null;
  }
  let queryMode = locationUrl.searchParams.get('showAudio');
  let requestedMode = queryMode || userSettings?.audio || appConfig?.audio || '';
  if (requestedMode !== LOCAL_AUDIO_MODE) return null;
  let requestedSelection = locationUrl.searchParams.get('showVoice')
    || userSettings?.voice
    || appConfig?.voice
    || DEFAULT_VOICE_SELECTION;
  let selection = VOICE_SELECTIONS.includes(requestedSelection)
    ? requestedSelection
    : DEFAULT_VOICE_SELECTION;
  let locale = primaryLocale(userSettings?.locale || appConfig?.locale || 'ru');
  let configuredManifests = {
    ...(appConfig?.audioManifests || {}),
    ...(userSettings?.audioManifests || {}),
  };
  let manifestFile = String(configuredManifests[selection] || '');
  if (!HASHED_MANIFEST_FILE_RE.test(manifestFile)) return null;
  let voiceRoot = new URL(`cv-show-audio-private/${selection}/`, documentBase);
  let manifestUrl = new URL(manifestFile, voiceRoot);
  if (
    manifestUrl.origin !== locationUrl.origin
    || !manifestUrl.pathname.startsWith(voiceRoot.pathname)
  ) return null;
  let alignmentManifest = String(
    userSettings?.alignmentManifest || appConfig?.alignmentManifest || 'alignment/manifest.json',
  );
  return Object.freeze({
    mode: LOCAL_AUDIO_MODE,
    locale,
    selection,
    manifestUrl: manifestUrl.href,
    manifestRevision: manifestFile.split('/')[0],
    alignmentManifest,
  });
}

export function validateCvShowLocalAudioManifest(manifest, story, config) {
  if (!manifest || typeof manifest !== 'object' || Array.isArray(manifest)) {
    throw invalidManifest('payload');
  }
  if (manifest.version !== LOCAL_AUDIO_MANIFEST_VERSION) throw invalidManifest('version');
  if (primaryLocale(manifest.locale) !== primaryLocale(story?.narrationLocale)) {
    throw invalidManifest('locale');
  }
  if (manifest.story?.contractRevision !== story?.contractRevision) {
    throw invalidManifest('story revision');
  }
  if (manifest.voiceSelection?.id !== config?.selection) throw invalidManifest('voice selection');
  let expected = storyEntries(story);
  if (expected.length !== 30 || manifest.clips?.length !== expected.length) {
    throw invalidManifest('clip count');
  }
  let byId = new Map();
  let manifestUrl = new URL(config.manifestUrl);
  for (let [index, expectedItem] of expected.entries()) {
    let clip = manifest.clips[index];
    let entry = expectedItem.entry;
    if (
      clip?.index !== index + 1
      || clip.kind !== expectedItem.kind
      || clip.id !== entry.id
      || clip.speech !== entry.speech
      || !(Number(clip.sampleRate) > 0)
      || !/^[a-f0-9]{64}$/u.test(String(clip.sha256 || ''))
      || !AUDIO_FILE_RE.test(String(clip.file || ''))
    ) {
      throw invalidManifest(`clip ${index + 1}`);
    }
    let audioUrl = new URL(clip.file, manifestUrl);
    if (audioUrl.origin !== manifestUrl.origin) throw invalidManifest(`clip origin ${index + 1}`);
    byId.set(clip.id, Object.freeze({ ...clip, audioUrl: audioUrl.href }));
  }
  return Object.freeze({
    version: manifest.version,
    locale: primaryLocale(manifest.locale),
    inputHash: String(manifest.inputHash || ''),
    voiceSelection: Object.freeze({ ...manifest.voiceSelection }),
    clips: Object.freeze([...byId.values()]),
    byId,
  });
}

/**
 * @param {{ story?: any, config?: any, fetchImpl?: typeof globalThis.fetch, signal?: AbortSignal }} [options]
 */
export async function loadCvShowLocalAudioManifest({
  story,
  config,
  fetchImpl = globalThis.fetch,
  signal,
} = {}) {
  if (!config || typeof fetchImpl !== 'function') return null;
  let response = await fetchImpl(config.manifestUrl, {
    cache: 'default',
    credentials: 'same-origin',
    signal,
  });
  if (!response?.ok) throw invalidManifest(`HTTP ${response?.status || 0}`);
  let manifest = await response.json();
  return validateCvShowLocalAudioManifest(manifest, story, config);
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
        Promise.resolve(audio.play?.()).catch((error) => {
          if (
            token !== generation
            || active?.audio !== audio
            || active.playAttempt !== attempt
          ) return;
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
        if (options.startPaused !== true) play();
      }).catch(onFailed);
      return true;
    },
    pause() {
      if (!active) return;
      active.playAttempt += 1;
      active.audio.pause?.();
    },
    resume() {
      if (!active) return false;
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
      let config = resolveCvShowLocalAudioConfig({ url, baseUrl, appConfig, userSettings });
      if (!config) return controller.snapshot;
      if (primaryLocale(config.locale) !== primaryLocale(story?.narrationLocale)) {
        return controller.snapshot;
      }
      try {
        let manifest = await loadCvShowLocalAudioManifest({
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
