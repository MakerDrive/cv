import {
  ShowAlignedMediaRuntime,
  validateShowAlignedSequence,
} from 'symbiote-ui/chat/show-runtime';
import { getCvShowRuntimeAuthority } from './cvShowRuntimeAuthority.js';
import {
  createCvShowEntryTuple,
  projectCvShowDirective,
} from './presentationProjectAdapter.js';
import {
  loadCvShowWebAudioRelease,
  resolveCvShowWebAudioConfig,
} from './webAudioRelease.js';

const cvShowRuntimeAuthority = getCvShowRuntimeAuthority();

function invalidAlignment(reason) {
  return Object.assign(
    new TypeError(`CV Show audio alignment is invalid: ${reason}`),
    { code: 'CV_SHOW_AUDIO_ALIGNMENT_INVALID' },
  );
}

function captureAuthoringView(getAuthoringView) {
  const source = getAuthoringView?.();
  if (
    !source?.project
    || !source?.base
    || !source?.identity?.snapshot
    || !source?.identity?.media
    || !source?.mediaRegistry
  ) {
    throw invalidAlignment('authoring view');
  }
  return Object.freeze({
    base: Object.freeze({
      revision: source.base.revision,
      authoringProjectHash: source.base.authoringProjectHash,
    }),
    identity: Object.freeze(structuredClone(source.identity)),
    project: structuredClone(source.project),
    mediaRegistry: structuredClone(source.mediaRegistry),
  });
}

async function sha256Hex(bytes) {
  if (!globalThis.crypto?.subtle) throw invalidAlignment('SHA-256 unavailable');
  const digest = await globalThis.crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest), (value) => value.toString(16).padStart(2, '0')).join('');
}

async function readAlignedSequenceResponse(response, clip) {
  if (!response?.ok) throw invalidAlignment(`HTTP ${response?.status || 0}`);
  if (typeof response.arrayBuffer !== 'function') {
    throw invalidAlignment(`raw aligned sequence bytes ${clip.id}`);
  }
  const bytes = new Uint8Array(await response.arrayBuffer());
  const observedHash = await sha256Hex(bytes);
  if (observedHash !== clip.alignedSequenceSha256) {
    throw invalidAlignment(`raw aligned sequence hash ${clip.id}`);
  }
  try {
    return JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes));
  } catch {
    throw invalidAlignment(`aligned sequence JSON ${clip.id}`);
  }
}

export function resolveCvShowAudioAnchor(directive, index, total) {
  void index;
  void total;
  const timing = directive?.timing;
  if (timing?.phase === 'setup') {
    return Object.freeze({ anchor: 'turn-start', offsetMs: 0 });
  }
  if (
    timing?.phase !== 'speech'
    || timing.anchor !== 'speech'
    || !String(timing.quote || '')
    || !(Number(timing.offsetMs) < 0)
  ) {
    throw invalidAlignment(`directive timing ${directive?.id || ''}`);
  }
  return Object.freeze({
    anchor: 'speech',
    quote: timing.quote,
    occurrence: Number(timing.occurrence) || 1,
    edge: timing.edge === 'end' ? 'end' : 'start',
    offsetMs: Number(timing.offsetMs),
  });
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
    if (source?.timing?.phase === 'setup') {
      sceneSetup.push(source);
    } else {
      const at = resolveCvShowAudioAnchor(source, index, directives.length);
      scheduled.push(Object.freeze({ index, source, at }));
    }
  }
  return Object.freeze({
    sceneSetup: Object.freeze(sceneSetup),
    scheduled: Object.freeze(scheduled),
  });
}

export function requireCvShowSceneSetupSuccess(receipt, entryId = '') {
  const setupActions = receipt?.receipts;
  const setupAction = setupActions?.[0];
  if (
    receipt?.status === 'success'
    && Array.isArray(setupActions)
    && setupActions.length === 1
    && setupAction?.status === 'success'
    && setupAction.result?.status === 'completed'
  ) {
    return receipt;
  }
  const status = String(receipt?.status || 'missing');
  throw Object.assign(
    new Error(`CV Show scene setup failed: ${entryId}/${status}`),
    { code: 'CV_SHOW_SCENE_SETUP_FAILED', receipt },
  );
}

/**
 * @param {{
 *   url?: string,
 *   baseUrl?: string,
 *   fetchImpl?: typeof globalThis.fetch,
 *   appConfig?: any,
 *   userSettings?: any,
 *   getAuthoringView?: () => any,
 * }} [options]
 */
export function createCvShowAlignmentController({
  url = globalThis.location?.href,
  baseUrl = globalThis.document?.baseURI,
  fetchImpl = globalThis.fetch,
  appConfig,
  userSettings,
  getAuthoringView = () => cvShowRuntimeAuthority.getView(),
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
        const sequence = await readAlignedSequenceResponse(response, clip);
        validateShowAlignedSequence(sequence);
        if (
          sequence.hash !== clip.alignedSequenceHash
          || sequence.media?.hash !== `sha256:${clip.masterWavSha256}`
          || sequence.timelineHash !== clip.timelineHash
          || sequence.media?.durationMs !== clip.masterDurationMs
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
        version: manifest?.schemaVersion || '',
        schemaVersion: manifest?.schemaVersion || '',
        releaseId: manifest?.releaseId || '',
        clipCount: manifest?.clips?.length || 0,
        timingCoverage: controller.available ? 1 : 0,
      });
    },
    async prepare(story) {
      cancel('CV Show alignment configuration changed');
      manifest = null;
      config = resolveCvShowWebAudioConfig({ url, baseUrl, appConfig, userSettings });
      if (!config || typeof fetchImpl !== 'function') return controller.snapshot;
      manifestController = new AbortController();
      try {
        manifest = await loadCvShowWebAudioRelease({
          story,
          config,
          fetchImpl,
          signal: manifestController.signal,
        });
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
    /** @param {{ entry?: any, media?: any, audioClip?: any, checkpointMs?: number | null, runPresentationOperation?: any, onReceipt?: any, onReset?: any, onSeekFailure?: any }} [options] */
    async createEntryRuntime(options = {}) {
      const authoringView = captureAuthoringView(getAuthoringView);
      const {
        entry,
        media,
        audioClip,
        checkpointMs = null,
        runPresentationOperation,
        onReceipt,
        onReset,
        onSeekFailure,
      } = options;
      if (!controller.available || !entry || !media) return null;
      if (typeof runPresentationOperation !== 'function') {
        throw invalidAlignment(`presentation adapter ${entry.id}`);
      }
      retain([entry.id]);
      const sequence = await loadSequence(entry.id);
      const alignmentClip = manifest.byId.get(entry.id);
      let tuple = null;
      const adapterMethod = async (operation, kind) => runPresentationOperation(Object.freeze({
        ...operation,
        kind,
        source: projectCvShowDirective(operation.projectCell, tuple.project),
      }));
      tuple = createCvShowEntryTuple(authoringView.project, entry.id, sequence, {
        checkpointMs,
        mediaAdmission: { audioClip, alignmentClip },
        mediaAncestry: authoringView.mediaRegistry,
        adapter: {
          runInteraction: (operation) => adapterMethod(operation, 'interaction'),
          runAttention: (operation) => adapterMethod(operation, 'attention'),
          waitForState: (operation) => adapterMethod(operation, 'state'),
        },
        onReceipt,
      });
      if (
        tuple.masterProjectHash !== authoringView.base.authoringProjectHash
        || tuple.masterRevision !== authoringView.base.revision
      ) {
        throw invalidAlignment(`authoring base ${entry.id}`);
      }
      const mediaRuntime = new ShowAlignedMediaRuntime({
        media,
        schedule: [],
        onReset,
        onSeekFailure,
      });
      let disposed = false;
      const sampleExecution = (reason) => {
        if (disposed || tuple.execution.snapshot.state !== 'running') {
          return tuple.execution.snapshot;
        }
        const mediaTimeMs = tuple.schedule.presentationStartMs
          + Math.max(0, Math.round(Number(media.currentTime || 0) * 1_000));
        try {
          return tuple.execution.sample({ mediaTimeMs, reason });
        } catch (error) {
          onSeekFailure?.(Object.freeze({
            status: 'failed',
            reason: error.code || 'presentation-sample-failed',
            operationId: tuple.execution.snapshot.activeOperationId,
            requestedMs: mediaTimeMs,
            observedMs: tuple.execution.snapshot.mediaTimeMs,
            phase: 'presentation-sample',
          }));
          return tuple.execution.snapshot;
        }
      };
      const mediaListeners = {
        play: () => {
          if (tuple.execution.snapshot.state === 'paused') tuple.execution.resume();
          sampleExecution('media-play');
        },
        playing: () => sampleExecution('media-playing'),
        timeupdate: () => sampleExecution('media-timeupdate'),
        ended: () => sampleExecution('media-ended'),
      };
      for (let [type, listener] of Object.entries(mediaListeners)) {
        media.addEventListener?.(type, listener);
      }
      const runSetup = async () => {
        tuple.execution.sample({ mediaTimeMs: 0, reason: 'entry-setup' });
        const snapshot = await tuple.execution.whenIdle();
        const setupCell = tuple.schedule.cells.find((cell) => (
          cell.kind !== 'narration' && cell.startMs === 0
        ));
        const terminal = snapshot.terminal.find(({ cellId }) => cellId === setupCell?.cellId);
        if (terminal?.status !== 'completed') {
          throw Object.assign(
            new Error(`CV Show presentation setup failed: ${entry.id}`),
            { code: 'CV_SHOW_SCENE_SETUP_FAILED', snapshot },
          );
        }
        return snapshot;
      };
      const runtime = Object.freeze({
        media,
        async loadAndRestorePlayback(snapshot, context) {
          await runSetup();
          await tuple.execution.pause();
          return mediaRuntime.loadAndRestorePlayback(snapshot, context);
        },
        pause() {
          return mediaRuntime.pause();
        },
        resume() {
          tuple.execution.resume();
          sampleExecution('runtime-resume');
          return mediaRuntime.resume();
        },
        whenIdle: () => tuple.execution.whenIdle(),
        stop() {
          void tuple.execution.stop();
          return mediaRuntime.pause();
        },
        dispose() {
          if (disposed) return;
          disposed = true;
          for (let [type, listener] of Object.entries(mediaListeners)) {
            media.removeEventListener?.(type, listener);
          }
          void tuple.execution.dispose();
          mediaRuntime.dispose();
        },
      });
      const captionTrack = Object.freeze((sequence.turns || []).flatMap((turn) => (
        (turn.words || []).map((word) => Object.freeze({
          text: String(word.text || ''),
          startMs: Number(word.startMs) || 0,
          endMs: Number(word.endMs) || Number(word.startMs) || 0,
        }))
      )));
      return Object.freeze({
        runtime,
        authoringBase: authoringView.base,
        authoringIdentity: authoringView.identity,
        masterProjectHash: tuple.masterProjectHash,
        masterRevision: tuple.masterRevision,
        schedule: tuple.schedule,
        project: tuple.project,
        timeline: tuple.timeline,
        alignedSequence: tuple.alignedSequence,
        captionTrack,
        alignedSequenceHash: tuple.alignedSequence.hash,
        sourceAlignedSequenceHash: sequence.hash,
        mediaHash: sequence.media.hash,
        speechGroupCount: tuple.includedSpeechDirectiveIds.length,
        execution: tuple.execution,
        includedSpeechDirectiveIds: tuple.includedSpeechDirectiveIds,
      });
    },
  };
  return Object.freeze(controller);
}
