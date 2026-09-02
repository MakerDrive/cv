import {
  ShowAlignedMediaRuntime,
  validateShowAlignedSequence,
} from 'symbiote-ui/chat/show-runtime';
import { getCvShowRuntimeAuthority } from './cvShowRuntimeAuthority.js';
import {
  createCvShowEntryTuple,
  projectCvShowPlaybackCheckpoint,
  projectCvShowDirective,
} from './presentationProjectAdapter.js';
import {
  loadCvShowWebAudioRelease,
  resolveCvShowWebAudioConfig,
} from './webAudioRelease.js';
import { playPresentationAudioClip } from './presentationAudioTransport.js';
import { createPresentationPlaybackPump } from './presentationPlaybackPump.js';

const cvShowRuntimeAuthority = getCvShowRuntimeAuthority();
const MAX_PRESENTATION_PREROLL_MEDIA_DRIFT_MS = 50;
const CV_SHOW_PRESENTATION_SAMPLE_INTERVAL_MS = 250;

/**
 * Keeps the presentation executor sampled even when a browser throttles or
 * coalesces native `timeupdate` events. The aligned runtime owns pause, seek,
 * visibility and disposal lifecycle for this clock, while execution still
 * rejects every cell before its authored start.
 */
export function createCvShowPresentationSamplingSchedule(mediaDurationMs, {
  intervalMs = CV_SHOW_PRESENTATION_SAMPLE_INTERVAL_MS,
} = {}) {
  const duration = Math.max(0, Math.round(Number(mediaDurationMs) || 0));
  const interval = Math.max(1, Math.round(Number(intervalMs) || 0));
  if (!duration) return Object.freeze([]);
  const schedule = [];
  for (let timeMs = interval; timeMs < duration; timeMs += interval) {
    schedule.push(Object.freeze({
      cueId: `cv-show:presentation-sample:${timeMs}`,
      timeMs,
      alignment: Object.freeze({
        provenance: Object.freeze({ mediaDurationMs: duration }),
      }),
    }));
  }
  schedule.push(Object.freeze({
    cueId: `cv-show:presentation-sample:${duration}`,
    timeMs: duration,
    alignment: Object.freeze({
      provenance: Object.freeze({ mediaDurationMs: duration }),
    }),
  }));
  return Object.freeze(schedule);
}

function invalidAlignment(reason) {
  return Object.assign(
    new TypeError(`CV Show audio alignment is invalid: ${reason}`),
    { code: 'CV_SHOW_AUDIO_ALIGNMENT_INVALID' },
  );
}

function boundedOperationText(value, limit = 120) {
  const text = String(value ?? '').replace(/\s+/gu, ' ').trim();
  return text ? text.slice(0, limit) : '';
}

/**
 * Extracts the inner cause of a failed presentation operation: the missing
 * directive receipts and provider details carried by the operation error.
 */
function describePresentationOperationCause(error) {
  const missing = (error?.result?.receipts || [])
    .filter(({ status }) => status === 'missing')
    .map(({ id, target, reason }) => `${target || id}:${reason}`);
  const providerReason = String(error?.details?.providerReceipt?.status || '');
  return Object.freeze({
    ...(missing.length ? { targets: missing.join(', ') } : {}),
    ...(missing.length === 1 ? { cause: missing[0].split(':').pop() } : {}),
    ...(!missing.length && providerReason ? { cause: providerReason } : {}),
  });
}

function attentionGateFailure(entryId, cellId, receipt = null, snapshot = null) {
  const status = receipt?.status || snapshot?.state || 'missing';
  return Object.assign(
    new Error(`CV Show pre-audio attention gate failed: ${entryId}/${cellId}/${status}`),
    {
      code: 'CV_SHOW_SCENE_SETUP_FAILED',
      receipt,
      snapshot,
    },
  );
}

function waitForVisiblePresentationFrames(media) {
  const document = media?.ownerDocument;
  const requestFrame = document?.defaultView?.requestAnimationFrame?.bind(document.defaultView);
  if (typeof requestFrame !== 'function' || document.visibilityState === 'hidden') {
    return Promise.resolve();
  }
  return new Promise((resolve) => {
    requestFrame(() => requestFrame(resolve));
  });
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
 *   playbackClock?: { request?: Function, cancel?: Function, document?: Document },
 * }} [options]
 */
export function createCvShowAlignmentController({
  url = globalThis.location?.href,
  baseUrl = globalThis.document?.baseURI,
  fetchImpl = globalThis.fetch,
  appConfig,
  userSettings,
  getAuthoringView = () => cvShowRuntimeAuthority.getView(),
  playbackClock,
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
    /** @param {{ entry?: any, media?: any, audioClip?: any, checkpointMs?: number | null, deferPresentationUntilPlayback?: boolean, restorePausedCheckpoint?: boolean, beforeDeferredPresentation?: (() => Promise<any> | any) | null, runPresentationOperation?: any, onReceipt?: any, onReset?: any, onSeekFailure?: any }} [options] */
    async createEntryRuntime(options = {}) {
      const authoringView = captureAuthoringView(getAuthoringView);
      const {
        entry,
        media,
        audioClip,
        checkpointMs = null,
        deferPresentationUntilPlayback = false,
        restorePausedCheckpoint = false,
        beforeDeferredPresentation = null,
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
      let mediaRuntime = null;
      const receiptObservers = new Set();
      const terminalReasons = new Map();
      const operationCauses = new Map();
      const terminalReasonCode = (reason) => (
        typeof reason === 'string' ? reason : String(reason?.code || '')
      );
      const receiveAcceptedReceipt = (receipt) => {
        if (
          ['failed', 'rejected', 'cancelled', 'stale', 'skipped'].includes(receipt?.status)
          && receipt?.cellId
        ) {
          terminalReasons.set(receipt.cellId, Object.freeze({
            status: receipt.status,
            code: terminalReasonCode(receipt.reason),
          }));
        }
        onReceipt?.(receipt);
        for (const observer of [...receiptObservers]) observer(receipt);
      };
      const adapterMethod = async (operation, kind) => {
        const source = projectCvShowDirective(operation.projectCell, tuple.project);
        try {
          return await runPresentationOperation(Object.freeze({
            ...operation,
            kind,
            source,
          }));
        } catch (error) {
          const missing = (error?.result?.receipts || [])
            .filter(({ status }) => status === 'missing')
            .map(({ id, target, reason }) => `${target || id}:${reason}`);
          if (missing.length) {
            operationCauses.set(operation.projectCell.id, Object.freeze({
              targets: missing.join(', '),
              cause: missing[0].split(':').pop() || '',
            }));
          } else if (error?.message) {
            operationCauses.set(operation.projectCell.id, Object.freeze({
              cause: error.code || '',
              message: boundedOperationText(error.message),
            }));
          }
          throw error;
        }
      };
      tuple = createCvShowEntryTuple(authoringView.project, entry.id, sequence, {
        checkpointMs,
        mediaAdmission: { audioClip, alignmentClip },
        mediaAncestry: authoringView.mediaRegistry,
        adapter: {
          playAudioClip: (operation) => playPresentationAudioClip(media, operation, {
            seekTransport: (mediaTimeMs) => mediaRuntime.seekTransport(mediaTimeMs, {
              reason: `project-audio-clip:${operation.projectCell.id}`,
            }),
          }),
          runInteraction: (operation) => adapterMethod(operation, 'interaction'),
          runAttention: (operation) => adapterMethod(operation, 'attention'),
          waitForState: (operation) => adapterMethod(operation, 'state'),
        },
        onReceipt: receiveAcceptedReceipt,
      });
      if (
        tuple.masterProjectHash !== authoringView.base.authoringProjectHash
        || tuple.masterRevision !== authoringView.base.revision
      ) {
        throw invalidAlignment(`authoring base ${entry.id}`);
      }
      let disposed = false;
      let attentionGateInProgress = false;
      let physicalPlaybackStarted = false;
      let playbackRequested = false;
      let deferredPresentationStarted = false;
      let deferredPresentationCompleted = false;
      let deferredPresentationPromise = null;
      let deferredPresentationError = null;
      let deferredMediaStartSeconds = 0;
      let restoredProjectPositionMs = 0;
      let playbackPump = null;
      const deferPresentation = deferPresentationUntilPlayback && !restorePausedCheckpoint;
      const mutedAdmission = deferPresentation && media.muted === true;
      const normalizeDeferredMediaStart = () => {
        const observedSeconds = Math.max(0, Number(media.currentTime || 0));
        const driftMs = Math.abs(observedSeconds - deferredMediaStartSeconds) * 1_000;
        if (
          media.paused === true
          && (mutedAdmission || driftMs <= MAX_PRESENTATION_PREROLL_MEDIA_DRIFT_MS)
          && driftMs > 0
        ) {
          mediaRuntime.seek(Math.round(deferredMediaStartSeconds * 1_000), {
            reason: 'presentation-preroll-normalization',
          });
        }
      };
      mediaRuntime = new ShowAlignedMediaRuntime({
        media,
        schedule: [],
        onReset,
        onSeekFailure,
        playbackClock,
      });
      playbackPump = createPresentationPlaybackPump({
        execution: tuple.execution,
        playbackPlan: tuple.playbackPlan,
        media,
        onFailure: (error) => {
          const failedCellId = String(error?.details?.cellId || '');
          const terminalReason = terminalReasons.get(failedCellId);
          const operationCause = operationCauses.get(failedCellId);
          onSeekFailure?.(Object.freeze({
            status: 'failed',
            reason: error?.code || 'presentation-playback-failed',
            operationId: tuple.execution.snapshot.activeOperationId,
            requestedMs: tuple.execution.snapshot.mediaTimeMs || 0,
            observedMs: Math.max(0, Math.round(Number(media.currentTime || 0) * 1_000)),
            phase: 'presentation-playback',
            details: Object.freeze({
              message: String(error?.message || error || ''),
              ...(terminalReason?.status ? { terminalStatus: terminalReason.status } : {}),
              ...(operationCause?.targets || operationCause?.cause || operationCause?.message
                ? {
                  targets: operationCause.targets || '',
                  cause: operationCause.cause || '',
                  operationMessage: operationCause.message || '',
                }
                : {}),
              ...(terminalReason?.code && !operationCause?.cause
                ? { cause: terminalReason.code }
                : {}),
              ...(!operationCause && describePresentationOperationCause(error)),
            }),
          }));
        },
      });
      const mediaListeners = {
        playing: () => {
          physicalPlaybackStarted = true;
          playbackRequested = true;
          if (deferPresentation && !deferredPresentationCompleted) {
            if (!deferredPresentationStarted) void startDeferredPresentation();
            return;
          }
          playbackPump.resume('media-playing');
        },
        seeking: () => {
          if (attentionGateInProgress) void tuple.execution.seek();
        },
      };
      for (let [type, listener] of Object.entries(mediaListeners)) {
        media.addEventListener?.(type, listener);
      }
      const runSetup = async () => {
        const prerollCells = tuple.schedule.cells.filter((cell) => (
          cell.kind !== 'narration'
          && cell.startMs < tuple.schedule.presentationStartMs
          && Number.isFinite(cell.plannedBarriers?.settled)
          && cell.plannedBarriers.settled <= tuple.schedule.presentationStartMs
        ));
        let snapshot = tuple.execution.snapshot;
        for (const cell of prerollCells) {
          tuple.execution.sample({
            mediaTimeMs: cell.startMs,
            reason: cell.startMs === 0 ? 'entry-setup' : 'entry-preroll',
          });
          snapshot = await tuple.execution.whenIdle();
          const terminal = snapshot.terminal.find(({ cellId }) => cellId === cell.cellId);
          if (terminal?.status !== 'completed') {
            const reason = terminalReasons.get(cell.cellId);
            throw Object.assign(
              new Error(`CV Show presentation setup failed: ${entry.id}/${cell.cellId}`),
              {
                code: 'CV_SHOW_SCENE_SETUP_FAILED',
                snapshot,
                details: Object.freeze({
                  terminalStatus: terminal?.status || 'missing',
                  ...(reason?.code ? { cause: reason.code } : {}),
                }),
              },
            );
          }
        }
        return snapshot;
      };
      const projectCellById = new Map(tuple.project.cells.map((cell) => [cell.id, cell]));
      const crossBoundaryAttentionCells = tuple.schedule.cells.filter((cell) => {
        const projectCell = projectCellById.get(cell.cellId);
        return cell.kind !== 'narration'
          && cell.kind !== 'interaction'
          && cell.kind !== 'state'
          && cell.startMs < tuple.schedule.presentationStartMs
          && Number.isFinite(cell.plannedBarriers?.settled)
          && cell.plannedBarriers.settled > tuple.schedule.presentationStartMs
          && projectCell
          && projectCvShowDirective(projectCell, tuple.project).policy === 'required';
      });
      const waitForAcceptedAttentionSettlement = (cell) => {
        let settled = false;
        let firstFrameReceipt = null;
        let resolvePromise;
        let rejectPromise;
        const finish = (settle, value) => {
          if (settled) return;
          settled = true;
          receiptObservers.delete(observe);
          settle(value);
        };
        const observe = (receipt) => {
          if (receipt.cellId !== cell.cellId || receipt.kind !== 'attention') return;
          if (receipt.status === 'first-frame') {
            firstFrameReceipt = receipt;
            return;
          }
          if (receipt.status === 'settled' && firstFrameReceipt) {
            finish(resolvePromise, Object.freeze({
              firstFrame: firstFrameReceipt,
              settled: receipt,
            }));
            return;
          }
          finish(
            rejectPromise,
            attentionGateFailure(entry.id, cell.cellId, receipt, tuple.execution.snapshot),
          );
        };
        const promise = new Promise((resolve, reject) => {
          resolvePromise = resolve;
          rejectPromise = reject;
        });
        receiptObservers.add(observe);
        return Object.freeze({
          promise,
          cancel(error) {
            finish(rejectPromise, error);
          },
        });
      };
      const requirePausedMediaAtStart = async (cell, receipt = null) => {
        if (
          media.paused === true
          && Math.abs(Number(media.currentTime) - deferredMediaStartSeconds) < 0.0005
        ) return;
        await tuple.execution.pause();
        throw attentionGateFailure(
          entry.id,
          cell.cellId,
          receipt,
          tuple.execution.snapshot,
        );
      };
      const requireCurrentAcceptedAttentionSettlement = (cell, receipts) => {
        const snapshot = tuple.execution.snapshot;
        const barrier = snapshot.barriers.find(({ cellId }) => cellId === cell.cellId);
        if (
          snapshot.state === 'running'
          && snapshot.generation === receipts.firstFrame.generation
          && snapshot.generation === receipts.settled.generation
          && barrier?.barriers.includes('first-frame')
          && barrier?.barriers.includes('settled')
        ) return;
        throw attentionGateFailure(entry.id, cell.cellId, receipts.settled, snapshot);
      };
      const runCrossBoundaryAttentionGate = async () => {
        if (crossBoundaryAttentionCells.length === 0) return tuple.execution.snapshot;
        attentionGateInProgress = true;
        try {
          for (let index = 0; index < crossBoundaryAttentionCells.length; index += 1) {
            const cell = crossBoundaryAttentionCells[index];
            await requirePausedMediaAtStart(cell);
            if (index > 0) {
              const idle = await tuple.execution.whenIdle();
              const previous = crossBoundaryAttentionCells[index - 1];
              const terminal = idle.terminal.find(({ cellId }) => cellId === previous.cellId);
              if (terminal?.status !== 'completed') {
                throw attentionGateFailure(entry.id, previous.cellId, null, idle);
              }
            }
            await waitForVisiblePresentationFrames(media);
            await requirePausedMediaAtStart(cell);
            if (tuple.execution.snapshot.state === 'paused') tuple.execution.resume();
            const settlement = waitForAcceptedAttentionSettlement(cell);
            let sampled;
            try {
              sampled = tuple.execution.sample({
                mediaTimeMs: tuple.schedule.presentationStartMs,
                reason: 'entry-attention-preroll',
              });
            } catch (error) {
              settlement.cancel(error);
              await settlement.promise;
            }
            if (sampled.activeCellId !== cell.cellId) {
              const error = attentionGateFailure(entry.id, cell.cellId, null, sampled);
              settlement.cancel(error);
              await settlement.promise;
            }
            const receipts = await settlement.promise;
            await requirePausedMediaAtStart(cell, receipts.settled);
            requireCurrentAcceptedAttentionSettlement(cell, receipts);
            const idle = await tuple.execution.whenIdle();
            const terminal = idle.terminal.find(({ cellId }) => cellId === cell.cellId);
            if (terminal?.status !== 'completed') {
              throw attentionGateFailure(entry.id, cell.cellId, receipts.settled, idle);
            }
          }
          return tuple.execution.snapshot;
        } finally {
          attentionGateInProgress = false;
        }
      };
      const heldAttentionCells = tuple.heldAttentionDirectiveIds.map((directiveId) => (
        tuple.schedule.cells.find(({ cellId }) => cellId === `cv-show:cue:${directiveId}`)
      )).filter(Boolean);
      const runHeldCheckpointAttention = async () => {
        for (const cell of heldAttentionCells) {
          tuple.execution.sample({
            mediaTimeMs: cell.gesture?.startMs ?? cell.startMs,
            reason: 'checkpoint-attention-restore',
          });
          const idle = await tuple.execution.whenIdle();
          const terminal = idle.terminal.find(({ cellId }) => cellId === cell.cellId);
          if (terminal?.status !== 'completed') {
            throw attentionGateFailure(entry.id, cell.cellId, null, idle);
          }
        }
        return tuple.execution.snapshot;
      };
      const startDeferredPresentation = () => {
        if (deferredPresentationStarted || disposed) {
          return deferredPresentationPromise || Promise.resolve(tuple.execution.snapshot);
        }
        deferredPresentationStarted = true;
        deferredPresentationPromise = (async () => {
          mediaRuntime.pause();
          normalizeDeferredMediaStart();
          await beforeDeferredPresentation?.();
          if (disposed) return tuple.execution.snapshot;
          if (tuple.execution.snapshot.state === 'paused') tuple.execution.resume();
          await runSetup();
          await runCrossBoundaryAttentionGate();
          await runHeldCheckpointAttention();
          deferredPresentationCompleted = true;
          if (!disposed && playbackRequested) {
            normalizeDeferredMediaStart();
            if (mutedAdmission) media.muted = false;
            playbackPump.resume('deferred-presentation-ready');
          }
          return tuple.execution.snapshot;
        })().catch((error) => {
          deferredPresentationCompleted = true;
          deferredPresentationError = error;
          playbackRequested = false;
          const failedTerminal = error?.snapshot?.terminal?.find?.(({ status }) => (
            status !== 'completed'
          )) || null;
          onSeekFailure?.(Object.freeze({
            status: 'failed',
            reason: error?.code || 'presentation-preroll-failed',
            operationId: tuple.execution.snapshot.activeOperationId,
            requestedMs: 0,
            observedMs: Math.max(0, Math.round(Number(media.currentTime || 0) * 1_000)),
            phase: 'presentation-preroll',
            details: Object.freeze({
              message: String(error?.message || ''),
              cellId: String(error?.receipt?.cellId || failedTerminal?.cellId || ''),
              receiptStatus: String(error?.receipt?.status || ''),
              terminal: failedTerminal,
              provider: error?.details || null,
            }),
          }));
          return tuple.execution.snapshot;
        });
        return deferredPresentationPromise;
      };
      const runtime = Object.freeze({
        media,
        get presentationPositionMs() {
          return Math.max(restoredProjectPositionMs, playbackPump.positionMs);
        },
        async loadAndRestorePlayback(snapshot, context) {
          const requestedProjectTimeMs = Math.max(
            0,
            Math.round(Number(snapshot?.positionMs) || 0),
          );
          const checkpoint = tuple.playbackCheckpoint?.projectTimeMs === requestedProjectTimeMs
            ? tuple.playbackCheckpoint
            : projectCvShowPlaybackCheckpoint(tuple.playbackPlan, requestedProjectTimeMs);
          const presentationComplete = checkpoint.phase === 'after'
            && checkpoint.projectTimeMs >= tuple.projectDurationMs;
          restoredProjectPositionMs = checkpoint.projectTimeMs;
          deferredMediaStartSeconds = checkpoint.sourceTimeMs / 1_000;
          if (!deferPresentation) {
            await beforeDeferredPresentation?.();
            await runSetup();
            await runHeldCheckpointAttention();
          }
          await tuple.execution.pause();
          if (presentationComplete) {
            media.pause?.();
            if (!deferPresentation) await runCrossBoundaryAttentionGate();
            return Object.freeze({
              status: 'completed',
              reason: 'presentation-complete',
              requestedMs: checkpoint.sourceTimeMs,
              observedMs: checkpoint.sourceTimeMs,
              presentationComplete: true,
            });
          }
          const generation = await mediaRuntime.loadAndRestorePlayback({
            ...snapshot,
            positionMs: checkpoint.sourceTimeMs,
          }, context);
          if (generation?.status !== 'completed') return generation;
          if (!deferPresentation) await runCrossBoundaryAttentionGate();
          return Object.freeze({
            ...generation,
            presentationComplete,
          });
        },
        pause() {
          playbackRequested = false;
          return playbackPump.pause('runtime-pause');
        },
        resume() {
          if (attentionGateInProgress) {
            playbackRequested = true;
            return true;
          }
          if (deferPresentation && !physicalPlaybackStarted) {
            playbackRequested = true;
            return mediaRuntime.resume();
          }
          if (
            deferPresentation
            && deferredPresentationStarted
            && !deferredPresentationCompleted
          ) {
            playbackRequested = true;
            return true;
          }
          playbackRequested = true;
          if (mutedAdmission) media.muted = false;
          return playbackPump.resume('runtime-resume');
        },
        async whenIdle() {
          if (deferredPresentationPromise) await deferredPresentationPromise;
          if (deferredPresentationError) throw deferredPresentationError;
          return tuple.execution.whenIdle();
        },
        stop() {
          playbackRequested = false;
          return playbackPump.stop('runtime-stop');
        },
        dispose() {
          if (disposed) return;
          disposed = true;
          playbackRequested = false;
          for (let [type, listener] of Object.entries(mediaListeners)) {
            media.removeEventListener?.(type, listener);
          }
          void playbackPump.dispose('runtime-dispose');
          mediaRuntime.dispose();
        },
      });
      const captionTrack = Object.freeze(tuple.audioComposition.clips.flatMap((clip) => (
        (clip.words || []).map((word) => Object.freeze({
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
        playbackPlan: tuple.playbackPlan,
        audioComposition: tuple.audioComposition,
        alignedSequence: tuple.alignedSequence,
        captionTrack,
        alignedSequenceHash: tuple.alignedSequence.hash,
        sourceAlignedSequenceHash: sequence.hash,
        mediaHash: sequence.media.hash,
        speechGroupCount: tuple.includedSpeechDirectiveIds.length,
        execution: tuple.execution,
        includedSpeechDirectiveIds: tuple.includedSpeechDirectiveIds,
        heldAttentionDirectiveIds: tuple.heldAttentionDirectiveIds,
      });
    },
  };
  return Object.freeze(controller);
}
