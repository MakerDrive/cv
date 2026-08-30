import { SHOW_ALIGNED_SEQUENCE_VERSION } from 'symbiote-ui/chat/show-runtime';
import { CV_SHOW_AUDIO_RELEASE } from '../../data/cvShowPresentationProject.js';

const SELECTOR_SCHEMA = 'cv-show-web-audio-selector-v1';
const RELEASE_SCHEMA = 'cv-show-web-audio-release-v1';
const PROFILE_ID = 'ogg-opus-mono-48khz-48kbps-voip-v1';
const SETTINGS_STORAGE_KEY = 'cv-show-settings';
const RELEASE_ID_RE = /^cv-show-web-audio-release-v1:[a-f0-9]{64}$/u;
const MASTER_RELEASE_ID_RE = /^cv-show-audio-release-v1:[a-f0-9]{64}$/u;
const REVISION_RE = /^[a-f0-9]{64}$/u;
const VOICE_ID_RE = /^[a-z0-9][a-z0-9-]*$/u;
const SHA256_RE = /^[a-f0-9]{64}$/u;
const SHA256_HASH_RE = /^sha256:[a-f0-9]{64}$/u;
const AUTHORING_PROJECT_HASH_RE = /^workspace-presentation-authoring-project-v1:sha256-[A-Za-z0-9+/]{43}=$/u;
const ALIGNED_HASH_RE = /^workspace-aligned-sequence-v3:sha256-[A-Za-z0-9+/]{43}=$/u;
const TIMELINE_HASH_RE = /^presentation-timeline-v3:sha256-[A-Za-z0-9+/]{43}=$/u;
const DELIVERY_FILE_RE = /^clips\/[a-z0-9][a-z0-9._-]*-([a-f0-9]{12,64})\.opus$/u;
const SEQUENCE_FILE_RE = /^aligned\/[a-z0-9][a-z0-9._-]*\.json$/u;
const SELECTOR_KEYS = Object.freeze([
  'schemaVersion',
  'releaseId',
  'sourceMasterReleaseId',
  'voiceId',
  'locale',
  'revision',
  'manifest',
]);
const SELECTOR_MANIFEST_KEYS = Object.freeze(['path', 'sha256', 'bytes']);
const RELEASE_KEYS = Object.freeze([
  'schemaVersion',
  'releaseId',
  'revision',
  'source',
  'story',
  'locale',
  'voiceId',
  'alignedSequenceVersion',
  'profile',
  'clips',
]);
const SOURCE_KEYS = Object.freeze([
  'masterReleaseId',
  'masterArtifactTreeHash',
  'projectRevision',
  'authoringProjectHash',
  'voiceIdentityHash',
  'audioInputHash',
  'audioManifestSha256',
  'alignmentInputHash',
  'alignmentManifestSha256',
]);
const STORY_KEYS = Object.freeze([
  'version',
  'contractRevision',
  'narrationLocale',
  'shortCount',
  'detailCount',
]);
const PROFILE_KEYS = Object.freeze([
  'id',
  'extension',
  'mimeType',
  'codecType',
  'container',
  'codec',
  'channels',
  'sampleRate',
  'targetBitrate',
  'application',
  'frameDurationMs',
  'packetLoss',
  'fec',
  'durationToleranceMs',
  'commandSha256',
  'toolchainIdentity',
]);
const CLIP_KEYS = Object.freeze([
  'index',
  'kind',
  'order',
  'id',
  'speech',
  'speechSha256',
  'masterWavSha256',
  'masterDurationMs',
  'deliveryFile',
  'deliverySha256',
  'deliveryBytes',
  'alignedSequenceFile',
  'alignedSequenceSha256',
  'alignedSequenceHash',
  'timelineHash',
]);

let releaseCache = new Map();

function primaryLocale(value) {
  return String(value || '').trim().toLowerCase().split(/[-_]/u)[0];
}

function storyEntries(story) {
  return [
    ...(story?.scenes || []).map((entry) => ({ kind: 'short', entry })),
    ...Object.values(story?.branches || {}).map((entry) => ({ kind: 'detail', entry })),
  ];
}

function freezeDeep(value) {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
  for (let child of Object.values(value)) freezeDeep(child);
  return Object.freeze(value);
}

function invalidRelease(reason) {
  return Object.assign(
    new TypeError(`CV Show web audio release is invalid: ${reason}`),
    { code: 'CV_SHOW_WEB_AUDIO_RELEASE_INVALID' },
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

function hasExactKeys(value, keys) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  let actual = Object.keys(value);
  return actual.length === keys.length && keys.every((key) => actual.includes(key));
}

async function sha256Hex(bytes) {
  if (!globalThis.crypto?.subtle) throw invalidRelease('SHA-256 unavailable');
  let digest = await globalThis.crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest), (value) => (
    value.toString(16).padStart(2, '0')
  )).join('');
}

function validateSelector(selector) {
  if (
    !hasExactKeys(selector, SELECTOR_KEYS)
    || selector.schemaVersion !== SELECTOR_SCHEMA
    || !RELEASE_ID_RE.test(String(selector.releaseId || ''))
    || !String(selector.sourceMasterReleaseId || '')
    || !VOICE_ID_RE.test(String(selector.voiceId || ''))
    || !String(selector.locale || '')
    || !REVISION_RE.test(String(selector.revision || ''))
    || selector.releaseId !== `${RELEASE_SCHEMA}:${selector.revision}`
    || !hasExactKeys(selector.manifest, SELECTOR_MANIFEST_KEYS)
    || selector.manifest.path !== `${selector.voiceId}/${selector.revision}/manifest.json`
    || !SHA256_RE.test(String(selector.manifest.sha256 || ''))
    || !Number.isSafeInteger(selector.manifest.bytes)
    || selector.manifest.bytes <= 0
  ) {
    throw invalidRelease('selector');
  }
  return selector;
}

function validateProfile(profile) {
  if (
    !hasExactKeys(profile, PROFILE_KEYS)
    || profile.id !== PROFILE_ID
    || profile.extension !== '.opus'
    || profile.mimeType !== 'audio/ogg'
    || profile.codecType !== 'audio/ogg; codecs=opus'
    || profile.container !== 'ogg'
    || profile.codec !== 'opus'
    || profile.channels !== 1
    || profile.sampleRate !== 48_000
    || profile.targetBitrate !== 48_000
    || profile.application !== 'voip'
    || profile.frameDurationMs !== 20
    || profile.packetLoss !== 0
    || profile.fec !== 0
    || profile.durationToleranceMs !== 10
    || !SHA256_RE.test(String(profile.commandSha256 || ''))
    || typeof profile.toolchainIdentity !== 'string'
    || profile.toolchainIdentity.length === 0
  ) {
    throw invalidRelease('profile');
  }
}

function validateSource(source) {
  let expected = {
    masterArtifactTreeHash: CV_SHOW_AUDIO_RELEASE.artifactTreeHash,
    voiceIdentityHash: CV_SHOW_AUDIO_RELEASE.acceptedProvenance.voiceIdentityHash,
    audioManifestSha256: CV_SHOW_AUDIO_RELEASE.manifests.audio.sha256,
    alignmentManifestSha256: CV_SHOW_AUDIO_RELEASE.manifests.alignment.sha256,
  };
  if (!hasExactKeys(source, SOURCE_KEYS)) throw invalidRelease('source');
  if (!MASTER_RELEASE_ID_RE.test(String(source.masterReleaseId || ''))) {
    throw invalidRelease('source masterReleaseId');
  }
  if (!Number.isSafeInteger(source.projectRevision) || source.projectRevision < 1) {
    throw invalidRelease('source projectRevision');
  }
  if (!AUTHORING_PROJECT_HASH_RE.test(String(source.authoringProjectHash || ''))) {
    throw invalidRelease('source authoringProjectHash');
  }
  for (let [key, value] of Object.entries(expected)) {
    if (source[key] !== value) throw invalidRelease(`source ${key}`);
  }
  if (!SHA256_HASH_RE.test(String(source.audioInputHash || ''))) {
    throw invalidRelease('source audioInputHash');
  }
  if (!SHA256_HASH_RE.test(String(source.alignmentInputHash || ''))) {
    throw invalidRelease('source alignmentInputHash');
  }
}

function validateStory(manifestStory, story) {
  let expected = {
    version: story?.version,
    contractRevision: story?.contractRevision,
    narrationLocale: story?.narrationLocale,
    shortCount: story?.scenes?.length,
    detailCount: Object.keys(story?.branches || {}).length,
  };
  if (!hasExactKeys(manifestStory, STORY_KEYS)) throw invalidRelease('story');
  for (let [key, value] of Object.entries(expected)) {
    if (manifestStory[key] !== value) throw invalidRelease(`story ${key}`);
  }
}

function resolveReleaseFile(file, manifestUrl, reason) {
  let root = new URL('.', manifestUrl);
  let url = new URL(file, root);
  if (url.origin !== root.origin || !url.pathname.startsWith(root.pathname)) {
    throw invalidRelease(reason);
  }
  return url.href;
}

function validateReleaseHeader(manifest, story, config) {
  if (!hasExactKeys(manifest, RELEASE_KEYS)) throw invalidRelease('payload');
  if (
    manifest.schemaVersion !== RELEASE_SCHEMA
    || manifest.releaseId !== config?.releaseId
    || manifest.revision !== config?.revision
    || manifest.releaseId !== `${RELEASE_SCHEMA}:${manifest.revision}`
    || manifest.source?.masterReleaseId !== config?.sourceMasterReleaseId
    || manifest.voiceId !== config?.selection
    || manifest.locale !== config?.locale
    || manifest.alignedSequenceVersion !== SHOW_ALIGNED_SEQUENCE_VERSION
  ) {
    throw invalidRelease('selector binding');
  }
  validateSource(manifest.source);
  validateStory(manifest.story, story);
  validateProfile(manifest.profile);
}

/**
 * @param {Record<string, any>} selector
 * @returns {Readonly<Record<string, any>>}
 */
export function projectCvShowWebAudioReleaseConfig(selector) {
  validateSelector(selector);
  return freezeDeep({
    audio: 'local',
    locale: selector.locale,
    voice: selector.voiceId,
    webAudioRelease: {
      schemaVersion: selector.schemaVersion,
      releaseId: selector.releaseId,
      sourceMasterReleaseId: selector.sourceMasterReleaseId,
      voiceId: selector.voiceId,
      locale: selector.locale,
      revision: selector.revision,
      manifest: { ...selector.manifest },
    },
  });
}

export function resolveCvShowWebAudioConfig({
  url = globalThis.location?.href,
  baseUrl = globalThis.document?.baseURI || url,
  appConfig = readAppConfig(globalThis.document),
  userSettings = readUserSettings(globalThis.localStorage),
} = {}) {
  if (!url || !baseUrl) return null;
  let locationUrl;
  let documentBase;
  let selector;
  try {
    locationUrl = new URL(url);
    documentBase = new URL(baseUrl);
    selector = validateSelector(appConfig?.webAudioRelease);
  } catch {
    return null;
  }
  let mode = locationUrl.searchParams.get('showAudio')
    || userSettings?.audio
    || appConfig?.audio
    || '';
  if (mode !== 'local' || documentBase.origin !== locationUrl.origin) return null;
  let selection = locationUrl.searchParams.get('showVoice')
    || userSettings?.voice
    || appConfig?.voice
    || '';
  let locale = primaryLocale(userSettings?.locale || appConfig?.locale || '');
  if (
    selection !== selector.voiceId
    || locale !== primaryLocale(selector.locale)
    || appConfig?.voice !== selector.voiceId
    || primaryLocale(appConfig?.locale) !== primaryLocale(selector.locale)
  ) return null;
  let audioRoot = new URL('cv-show-audio/', documentBase);
  let manifestUrl = new URL(selector.manifest.path, audioRoot);
  if (
    manifestUrl.origin !== locationUrl.origin
    || !manifestUrl.pathname.startsWith(audioRoot.pathname)
  ) return null;
  return freezeDeep({
    mode: 'local',
    locale,
    selection,
    releaseId: selector.releaseId,
    sourceMasterReleaseId: selector.sourceMasterReleaseId,
    revision: selector.revision,
    manifestUrl: manifestUrl.href,
    manifestSha256: selector.manifest.sha256,
    manifestBytes: selector.manifest.bytes,
  });
}

/**
 * @param {Record<string, any>} manifest
 * @param {Record<string, any>} story
 * @param {Record<string, any>} config
 * @returns {Promise<Readonly<Record<string, any>>>}
 */
export async function validateCvShowWebAudioRelease(manifest, story, config) {
  validateReleaseHeader(manifest, story, config);
  let expected = storyEntries(story);
  if (
    expected.length !== 30
    || !Array.isArray(manifest.clips)
    || manifest.clips.length !== expected.length
  ) {
    throw invalidRelease('clip count');
  }
  let byId = new Map();
  let deliveryFiles = new Set();
  let sequenceFiles = new Set();
  for (let [index, expectedItem] of expected.entries()) {
    let clip = manifest.clips[index];
    let entry = expectedItem.entry;
    let expectedOrder = expectedItem.kind === 'short'
      ? index + 1
      : index + 1 - story.scenes.length;
    let deliveryFileMatch = String(clip?.deliveryFile || '').match(DELIVERY_FILE_RE);
    if (
      !hasExactKeys(clip, CLIP_KEYS)
      || clip.index !== index + 1
      || clip.kind !== expectedItem.kind
      || clip.order !== expectedOrder
      || clip.id !== entry.id
      || clip.speech !== entry.speech
      || !SHA256_RE.test(String(clip.speechSha256 || ''))
      || !SHA256_RE.test(String(clip.masterWavSha256 || ''))
      || !Number.isSafeInteger(clip.masterDurationMs)
      || clip.masterDurationMs <= 0
      || !deliveryFileMatch
      || !SHA256_RE.test(String(clip.deliverySha256 || ''))
      || !clip.deliverySha256.startsWith(deliveryFileMatch?.[1] || '')
      || clip.deliverySha256 === clip.masterWavSha256
      || !Number.isSafeInteger(clip.deliveryBytes)
      || clip.deliveryBytes <= 0
      || !SEQUENCE_FILE_RE.test(String(clip.alignedSequenceFile || ''))
      || !SHA256_RE.test(String(clip.alignedSequenceSha256 || ''))
      || !ALIGNED_HASH_RE.test(String(clip.alignedSequenceHash || ''))
      || !TIMELINE_HASH_RE.test(String(clip.timelineHash || ''))
    ) {
      throw invalidRelease(`clip ${index + 1}`);
    }
    let speechSha256 = await sha256Hex(new TextEncoder().encode(clip.speech));
    if (speechSha256 !== clip.speechSha256) {
      throw invalidRelease(`clip speech hash ${clip.id}`);
    }
    if (deliveryFiles.has(clip.deliveryFile) || sequenceFiles.has(clip.alignedSequenceFile)) {
      throw invalidRelease(`clip file ${clip.id}`);
    }
    deliveryFiles.add(clip.deliveryFile);
    sequenceFiles.add(clip.alignedSequenceFile);
    let audioUrl = resolveReleaseFile(clip.deliveryFile, config.manifestUrl, `clip audio ${clip.id}`);
    let sequenceUrl = resolveReleaseFile(
      clip.alignedSequenceFile,
      config.manifestUrl,
      `clip alignment ${clip.id}`,
    );
    byId.set(clip.id, freezeDeep({ ...clip, audioUrl, sequenceUrl }));
  }
  return freezeDeep({
    schemaVersion: manifest.schemaVersion,
    releaseId: manifest.releaseId,
    revision: manifest.revision,
    source: { ...manifest.source },
    story: { ...manifest.story },
    locale: primaryLocale(manifest.locale),
    voiceId: manifest.voiceId,
    alignedSequenceVersion: manifest.alignedSequenceVersion,
    profile: { ...manifest.profile },
    clips: [...byId.values()],
    byId,
  });
}

async function readVerifiedRelease(fetchImpl, config) {
  let response = await fetchImpl(config.manifestUrl, {
    cache: 'default',
    credentials: 'same-origin',
  });
  if (!response?.ok) throw invalidRelease(`HTTP ${response?.status || 0}`);
  if (typeof response.arrayBuffer !== 'function') throw invalidRelease('raw manifest bytes');
  let bytes = new Uint8Array(await response.arrayBuffer());
  if (bytes.byteLength !== config.manifestBytes) throw invalidRelease('manifest byte count');
  let hash = await sha256Hex(bytes);
  if (hash !== config.manifestSha256) throw invalidRelease('manifest hash');
  try {
    return JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes));
  } catch {
    throw invalidRelease('manifest JSON');
  }
}

function waitForRelease(promise, signal) {
  if (!signal) return promise;
  if (signal.aborted) return Promise.reject(signal.reason);
  return new Promise((resolve, reject) => {
    let settle = (callback, value) => {
      signal.removeEventListener('abort', abort);
      callback(value);
    };
    let abort = () => settle(reject, signal.reason);
    signal.addEventListener('abort', abort, { once: true });
    promise.then(
      (value) => settle(resolve, value),
      (error) => settle(reject, error),
    );
  });
}

/**
 * @param {{ story?: any, config?: any, fetchImpl?: typeof globalThis.fetch, signal?: AbortSignal }} [options]
 */
export async function loadCvShowWebAudioRelease({
  story,
  config,
  fetchImpl = globalThis.fetch,
  signal,
} = {}) {
  if (!config || typeof fetchImpl !== 'function') return null;
  let key = `${config.manifestUrl}\n${config.manifestSha256}\n${config.manifestBytes}`;
  if (!releaseCache.has(key)) {
    let promise = readVerifiedRelease(fetchImpl, config).catch((error) => {
      if (releaseCache.get(key) === promise) releaseCache.delete(key);
      throw error;
    });
    releaseCache.set(key, promise);
  }
  let manifest = await waitForRelease(releaseCache.get(key), signal);
  return validateCvShowWebAudioRelease(manifest, story, config);
}

export function clearCvShowWebAudioReleaseCache() {
  releaseCache = new Map();
}
