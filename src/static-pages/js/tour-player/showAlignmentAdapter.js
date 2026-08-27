import {
  SHOW_ALIGNED_SEQUENCE_VERSION,
  ShowAlignedMediaRuntime,
  createShowAlignedCueSchedule,
  validateShowAlignedSequence,
} from 'symbiote-ui/chat/show-runtime';
import { resolveCvShowLocalAudioConfig } from './localNarration.js';
import { adaptCvShowDirective } from './showAdapter.js';

const ALIGNMENT_MANIFEST_VERSION = 'cv-show-whisper-alignment-manifest-v1';
const ALIGNMENT_MODEL = 'large-v3-turbo';
const JSON_FILE_RE = /^(?:aligned\/)?[a-z0-9][a-z0-9._/-]*\.json$/u;

const CV_SHOW_AUDIO_ANCHORS = Object.freeze({
  'positioning.experience-frame': Object.freeze({
    anchor: 'speech', quote: 'За годы работы', occurrence: 1, edge: 'start', offsetMs: 0,
  }),
  'positioning.tenure-marker': Object.freeze({
    anchor: 'speech', quote: 'задачи менялись', occurrence: 1, edge: 'start', offsetMs: 0,
  }),
  'positioning.team-pause': Object.freeze({
    anchor: 'speech', quote: 'вместе с командой', occurrence: 1, edge: 'start', offsetMs: 0,
  }),
  'positioning.workspace-transition': Object.freeze({
    anchor: 'speech', quote: 'А дальше', occurrence: 1, edge: 'start', offsetMs: 0,
  }),
  'workspace.intro-frame': Object.freeze({
    anchor: 'speech', quote: 'В 2026 году', occurrence: 1, edge: 'start', offsetMs: 0,
  }),
  'workspace.portable-config': Object.freeze({
    anchor: 'speech', quote: 'Результат сохраняется', occurrence: 1, edge: 'start', offsetMs: 0,
  }),
  'workspace.agent-portal-card': Object.freeze({
    anchor: 'speech', quote: 'Agent Portal', occurrence: 1, edge: 'start', offsetMs: 0,
  }),
  'workspace.video-studio-card': Object.freeze({
    anchor: 'speech', quote: 'Video Studio', occurrence: 1, edge: 'start', offsetMs: 0,
  }),
});

function primaryLocale(value) {
  return String(value || '').trim().toLowerCase().split(/[-_]/u)[0];
}

function storyEntries(story) {
  return [
    ...(story?.scenes || []).map((entry) => ({ kind: 'short', entry })),
    ...Object.values(story?.branches || {}).map((entry) => ({ kind: 'detail', entry })),
  ];
}

function invalidAlignment(reason) {
  return Object.assign(
    new TypeError(`CV Show audio alignment is invalid: ${reason}`),
    { code: 'CV_SHOW_AUDIO_ALIGNMENT_INVALID' },
  );
}

export function resolveCvShowAlignmentConfig(options = {}) {
  const audio = resolveCvShowLocalAudioConfig(options);
  if (!audio) return null;
  const manifestUrl = new URL(audio.alignmentManifest, audio.manifestUrl);
  if (manifestUrl.origin !== new URL(audio.manifestUrl).origin) return null;
  return Object.freeze({ ...audio, alignmentManifestUrl: manifestUrl.href });
}

export function validateCvShowAlignmentManifest(manifest, story, config) {
  if (!manifest || typeof manifest !== 'object' || Array.isArray(manifest)) {
    throw invalidAlignment('payload');
  }
  if (manifest.version !== ALIGNMENT_MANIFEST_VERSION) throw invalidAlignment('version');
  if (manifest.model !== ALIGNMENT_MODEL) throw invalidAlignment('model');
  if (manifest.alignedSequenceVersion !== SHOW_ALIGNED_SEQUENCE_VERSION) {
    throw invalidAlignment('aligned sequence version');
  }
  if (primaryLocale(manifest.locale) !== primaryLocale(story?.narrationLocale)) {
    throw invalidAlignment('locale');
  }
  if (manifest.story?.contractRevision !== story?.contractRevision) {
    throw invalidAlignment('story revision');
  }
  const expected = storyEntries(story);
  if (expected.length !== 30 || manifest.clips?.length !== expected.length) {
    throw invalidAlignment('clip count');
  }
  const manifestUrl = new URL(config.alignmentManifestUrl);
  const byId = new Map();
  for (let [index, expectedItem] of expected.entries()) {
    const clip = manifest.clips[index];
    const entry = expectedItem.entry;
    if (
      clip?.index !== index + 1
      || clip.kind !== expectedItem.kind
      || clip.id !== entry.id
      || !String(clip.sourceAudioSha256 || '')
      || !String(clip.alignedSequenceHash || '').startsWith(`${SHOW_ALIGNED_SEQUENCE_VERSION}:`)
      || !JSON_FILE_RE.test(String(clip.alignedSequenceFile || ''))
      || clip.metrics?.timingCoverage !== 1
    ) {
      throw invalidAlignment(`clip ${index + 1}`);
    }
    const sequenceUrl = new URL(clip.alignedSequenceFile, manifestUrl);
    if (sequenceUrl.origin !== manifestUrl.origin) throw invalidAlignment(`clip origin ${index + 1}`);
    byId.set(clip.id, Object.freeze({ ...clip, sequenceUrl: sequenceUrl.href }));
  }
  return Object.freeze({
    version: manifest.version,
    locale: primaryLocale(manifest.locale),
    model: manifest.model,
    story: Object.freeze({ ...manifest.story }),
    aggregate: Object.freeze({ ...manifest.aggregate }),
    clips: Object.freeze([...byId.values()]),
    byId,
  });
}

export function resolveCvShowAudioAnchor(directive, index, total) {
  const exact = CV_SHOW_AUDIO_ANCHORS[directive?.id];
  if (exact) return exact;
  if (directive?.type === 'idle' || directive?.type === 'chat-action' || index === total - 1) {
    return Object.freeze({ anchor: 'turn-end', offsetMs: 0 });
  }
  return Object.freeze({ anchor: 'turn-start', offsetMs: 0 });
}

/**
 * Separates fresh-scene navigation setup from narration-timed directives.
 * Setup runs before a paused media generation can project turn-start cues as fired.
 *
 * @param {Array<Record<string, any>>} [directives]
 */
export function partitionCvShowAlignedDirectives(directives = []) {
  const sceneSetup = [];
  const scheduled = [];
  for (let [index, source] of directives.entries()) {
    const at = resolveCvShowAudioAnchor(source, index, directives.length);
    if (source?.type === 'navigate' && at.anchor === 'turn-start' && at.offsetMs === 0) {
      sceneSetup.push(source);
    } else {
      scheduled.push(Object.freeze({ index, source, at }));
    }
  }
  return Object.freeze({
    sceneSetup: Object.freeze(sceneSetup),
    scheduled: Object.freeze(scheduled),
  });
}

/**
 * @param {{
 *   url?: string,
 *   baseUrl?: string,
 *   fetchImpl?: typeof globalThis.fetch,
 *   appConfig?: any,
 *   userSettings?: any,
 * }} [options]
 */
export function createCvShowAlignmentController({
  url = globalThis.location?.href,
  baseUrl = globalThis.document?.baseURI,
  fetchImpl = globalThis.fetch,
  appConfig,
  userSettings,
} = {}) {
  let manifest = null;
  let config = null;
  const sequenceCache = new Map();
  let manifestController = null;

  const abortEntry = (id, reason = 'CV Show alignment request superseded') => {
    const cached = sequenceCache.get(id);
    if (!cached) return;
    cached.controller?.abort(new DOMException(reason, 'AbortError'));
    sequenceCache.delete(id);
  };

  const cancel = (reason = 'CV Show alignment stopped') => {
    manifestController?.abort(new DOMException(reason, 'AbortError'));
    manifestController = null;
    for (const id of [...sequenceCache.keys()]) abortEntry(id, reason);
  };

  const retain = (ids) => {
    const keep = new Set(ids.map(String));
    for (const id of [...sequenceCache.keys()]) {
      if (!keep.has(id)) abortEntry(id);
    }
  };

  const loadSequence = async (id) => {
    const clip = manifest?.byId.get(String(id || ''));
    if (!clip) throw invalidAlignment(`entry ${id || ''}`);
    if (!sequenceCache.has(clip.id)) {
      while (sequenceCache.size >= 2) abortEntry(sequenceCache.keys().next().value);
      const requestController = new AbortController();
      /** @type {{ controller: AbortController, promise: Promise<any> | null }} */
      const cached = { controller: requestController, promise: null };
      cached.promise = (async () => {
        const response = await fetchImpl(clip.sequenceUrl, {
          cache: 'default',
          credentials: 'same-origin',
          signal: requestController.signal,
        });
        if (!response?.ok) throw invalidAlignment(`HTTP ${response?.status || 0}`);
        const sequence = await response.json();
        validateShowAlignedSequence(sequence);
        if (
          sequence.hash !== clip.alignedSequenceHash
          || sequence.media?.hash !== `sha256:${clip.sourceAudioSha256}`
          || sequence.timelineHash !== clip.timelineHash
          || sequence.media?.durationMs !== clip.mediaDurationMs
        ) {
          throw invalidAlignment(`provenance ${clip.id}`);
        }
        return sequence;
      })().catch((error) => {
        if (sequenceCache.get(clip.id) === cached) sequenceCache.delete(clip.id);
        throw error;
      });
      sequenceCache.set(clip.id, cached);
    }
    return sequenceCache.get(clip.id).promise;
  };

  const controller = {
    get available() {
      return Boolean(manifest?.byId?.size);
    },
    get snapshot() {
      return Object.freeze({
        available: controller.available,
        version: manifest?.version || '',
        model: manifest?.model || '',
        clipCount: manifest?.clips?.length || 0,
        timingCoverage: manifest?.aggregate?.timingCoverage || 0,
      });
    },
    async prepare(story) {
      cancel('CV Show alignment configuration changed');
      config = resolveCvShowAlignmentConfig({ url, baseUrl, appConfig, userSettings });
      if (!config || typeof fetchImpl !== 'function') return controller.snapshot;
      manifestController = new AbortController();
      try {
        const response = await fetchImpl(config.alignmentManifestUrl, {
          cache: 'default',
          credentials: 'same-origin',
          signal: manifestController.signal,
        });
        if (!response?.ok) throw invalidAlignment(`HTTP ${response?.status || 0}`);
        manifest = validateCvShowAlignmentManifest(await response.json(), story, config);
      } catch (error) {
        if (error?.name === 'AbortError') return controller.snapshot;
        manifest = null;
        cancel('CV Show alignment preparation failed');
      }
      return controller.snapshot;
    },
    prefetch(id) {
      const clipId = String(id || '');
      if (!manifest?.byId.has(clipId) || sequenceCache.has(clipId)) return false;
      void loadSequence(clipId).catch(() => {});
      return true;
    },
    transition(id) {
      retain([String(id || '')]);
    },
    cancel,
    /** @param {{ entry?: any, media?: any, resolveText?: any, onCue?: any, onReset?: any, onSeekFailure?: any }} [options] */
    async createEntryRuntime(options = {}) {
      const {
        entry,
        media,
        resolveText,
        onCue,
        onReset,
        onSeekFailure,
      } = options;
      if (!controller.available || !entry || !media) return null;
      retain([entry.id]);
      const sequence = await loadSequence(entry.id);
      const sourceById = new Map();
      const { scheduled } = partitionCvShowAlignedDirectives(entry.directives);
      const cues = scheduled.map(({ source, index, at }) => {
        const adapted = adaptCvShowDirective(source, { resolveText });
        const cueId = `${String(index).padStart(3, '0')}:${source.id}`;
        sourceById.set(cueId, source);
        return {
          cueId,
          turnIndex: 0,
          at,
          directive: adapted.directive,
        };
      });
      const clip = manifest.byId.get(entry.id);
      const schedule = createShowAlignedCueSchedule(sequence, cues, {
        isWordReliable: () => (
          clip.metrics?.timingCoverage === 1
          && clip.metrics?.observedWordsMatch === true
        ),
      });
      const runtime = new ShowAlignedMediaRuntime({
        media,
        schedule,
        onReset,
        onSeekFailure,
        onCue: (receipt) => onCue?.(Object.freeze({
          ...receipt,
          source: sourceById.get(receipt.cue.cueId),
        })),
      });
      return Object.freeze({
        runtime,
        schedule,
        alignedSequenceHash: sequence.hash,
        mediaHash: sequence.media.hash,
        exactCueCount: schedule.filter((cue) => (
          cue.alignment.resolution === 'exact' || cue.alignment.resolution === 'occurrence'
        )).length,
        segmentCueCount: schedule.filter((cue) => cue.alignment.resolution === 'segment').length,
      });
    },
  };
  return Object.freeze(controller);
}
