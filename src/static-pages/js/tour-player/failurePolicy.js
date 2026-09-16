/**
 * CV Show failure recovery policy.
 *
 * The shared presentation engine terminalizes a failed cell, but it never
 * rewinds playback by itself. The host used to escalate every `failed`
 * terminal into a full entry restart (`presentEntry(positionMs = 0)`), which
 * replayed already-heard narration whenever any cell — including purely
 * decorative markers — failed. This module is the single place that decides
 * what a failure means:
 *
 *   resolveFailureRecovery(...) -> recovery class
 *
 * Recovery classes (never an implicit rewind):
 *   'retry-local'   adapter-level: complete the visual lifecycle degraded
 *   'degrade'       visual intent not met, lifecycle completed, continue
 *   'skip'          tolerated terminal failure, dependent chain degrades
 *   'pause-retry'   pause playback, retry the failed scene setup locally
 *   'pause-report'  stop advancing, surface a recoverable error
 *   'fatal'         unrecoverable, surface a fatal error
 *
 * Hard invariant: AUTO REWIND IS FORBIDDEN. Once narration of an entry has
 * physically started, no recovery path may re-present that entry from zero.
 */

export const CV_SHOW_RECOVERY = Object.freeze({
  RETRY_LOCAL: 'retry-local',
  DEGRADE: 'degrade',
  SKIP: 'skip',
  PAUSE_RETRY: 'pause-retry',
  PAUSE_REPORT: 'pause-report',
  FATAL: 'fatal',
});

/**
 * Decorative layers: their failure must never block, pause, or rewind
 * narration. The outcome degrades to either an adapter-side degraded
 * completion (barriers open, dependents continue) or a tolerated terminal
 * failure whose dependent chain expires gracefully.
 */
export const CV_SHOW_DECORATIVE_LAYER_IDS = Object.freeze([
  'cv-show:layer:focus',
  'cv-show:layer:annotation',
]);

export const CV_SHOW_INTERACTION_LAYER_IDS = Object.freeze([
  'cv-show:layer:interaction',
]);

/**
 * Derives the semantic layer of a cell without depending on the authoring
 * projection internals: prefers the explicit layerId, falls back to the cue
 * kind classification used by the master project validator.
 */
export function cvShowCellLayerId(cell) {
  const explicit = String(cell?.layerId || '');
  if (explicit) return explicit;
  const kind = String(cell?.kind || '');
  if (kind === 'narration') return 'cv-show:layer:narration';
  if (kind === 'audio-clip') return 'cv-show:layer:audio';
  const cueKind = String(cell?.cue?.kind || '');
  if (cueKind === 'focus') return 'cv-show:layer:focus';
  if (cueKind === 'annotation') return 'cv-show:layer:annotation';
  if (cueKind === 'interaction') return 'cv-show:layer:interaction';
  return '';
}

export function isCvShowDecorativeCell(cell) {
  return CV_SHOW_DECORATIVE_LAYER_IDS.includes(cvShowCellLayerId(cell));
}

/**
 * @typedef {{
 *   cellId: string,
 *   kind: string,
 *   layerId: string,
 *   status: string,
 *   code: string,
 *   message: string,
 * }} CvShowPresentationFailure
 */

/**
 * Normalizes both failure receipt shapes into one classification input:
 *
 * - engine receipt:  { cellId, kind, status, reason: { code }, ... }
 * - pump-path seek failure: { status:'failed', reason: '<code string>',
 *   details: { cellId, kind, layerId, terminalStatus, cause, message } }
 *
 * Returns null for inputs that do not carry a failure identity at all.
 *
 * @param {any} receipt
 * @returns {CvShowPresentationFailure | null}
 */
export function normalizePresentationFailure(receipt) {
  if (!receipt || typeof receipt !== 'object') return null;
  const details = typeof receipt.details === 'object' && receipt.details
    ? receipt.details
    : {};
  const cellId = String(receipt.cellId || details.cellId || '');
  const status = String(receipt.status || details.terminalStatus || '');
  if (!cellId && status !== 'failed') return null;
  const code = typeof receipt.reason === 'string'
    ? receipt.reason
    : String(receipt.reason?.code || details.cause || '');
  return Object.freeze({
    cellId,
    kind: String(receipt.kind || details.kind || ''),
    layerId: String(receipt.layerId || details.layerId || ''),
    status,
    code,
    message: String(receipt.reason?.message || details.message || ''),
  });
}

/**
 * Decides the recovery class for a normalized failure.
 *
 * @param {object} input
 * @param {string} [input.kind] presentation cell kind (attention, interaction, ...)
 * @param {string} [input.layerId] authoring layer id
 * @param {string} [input.policy] authored directive policy ('optional' | 'required')
 * @param {string} [input.code] failure code
 * @param {boolean} [input.narrationStarted] whether narration of the owning
 *   entry has already physically started; with narration started no recovery
 *   may re-present the entry from zero
 */
export function resolveFailureRecovery({
  kind = '',
  layerId = '',
  policy = '',
  code = '',
  narrationStarted = false,
} = {}) {
  if (policy === 'optional') return CV_SHOW_RECOVERY.SKIP;
  if (
    CV_SHOW_DECORATIVE_LAYER_IDS.includes(layerId)
    || kind === 'attention'
  ) {
    return CV_SHOW_RECOVERY.DEGRADE;
  }
  if (
    CV_SHOW_INTERACTION_LAYER_IDS.includes(layerId)
    || kind === 'interaction'
    || kind === 'state'
  ) {
    return narrationStarted
      ? CV_SHOW_RECOVERY.PAUSE_REPORT
      : CV_SHOW_RECOVERY.PAUSE_RETRY;
  }
  // Audio / narration / unknown critical cells: never auto-restart an entry
  // once narration could have been heard; the user may explicitly replay.
  return CV_SHOW_RECOVERY.PAUSE_REPORT;
}

/**
 * Per-show aggregate of presentation receipts. Distinguishes lifecycle
 * completion from semantic success: a cell whose visual intent degraded is
 * counted separately and keeps its machine-readable reason/fallback so the
 * preview/self-healing loop can target it.
 */
export function createPresentationReceiptSummary() {
  const degradedCells = new Map();
  const seenTerminal = new Set();
  const summary = {
    success: 0,
    degraded: 0,
    skipped: 0,
    failedCritical: 0,
    byReason: {},
    byFallback: {},
  };
  const bump = (bucket, key) => {
    const name = String(key || '');
    if (!name) return;
    bucket[name] = (bucket[name] || 0) + 1;
  };
  return Object.freeze({
    /** @param {object} receipt */
    record(receipt) {
      if (!receipt || typeof receipt !== 'object') return summary;
      const cellId = String(receipt.cellId || '');
      const providerReceipt = typeof receipt.providerReceipt === 'object'
        ? receipt.providerReceipt
        : null;
      const degradedMeta = providerReceipt?.degraded === true
        || providerReceipt?.effect?.degraded === true;
      if (degradedMeta && cellId && !degradedCells.has(cellId)) {
        degradedCells.set(cellId, Object.freeze({
          reason: String(
            providerReceipt.outcome
            || providerReceipt.effect?.outcome
            || receipt.reason?.code
            || '',
          ),
          fallback: String(
            providerReceipt.fallback
            || providerReceipt.effect?.fallback
            || '',
          ),
        }));
      }
      const status = String(receipt.status || '');
      // The engine emits per-cell *terminal* receipts for skipped/failed and
      // milestone receipts for healthy completion; a cell's final milestone
      // ('ended' for audio, 'settled' for attention/interaction, 'ready' for
      // state) is its success signal. Count exactly one class per cell.
      const isSuccessMilestone = ['ended', 'settled', 'ready'].includes(status);
      if (!isSuccessMilestone && !['skipped', 'failed'].includes(status)) {
        return summary;
      }
      const terminalKey = `${cellId}:${status}`;
      if (seenTerminal.has(terminalKey)) return summary;
      seenTerminal.add(terminalKey);
      if (isSuccessMilestone) {
        const degradation = degradedCells.get(cellId);
        if (degradation) {
          summary.degraded += 1;
          bump(summary.byReason, degradation.reason || 'degraded');
          bump(summary.byFallback, degradation.fallback || 'none');
        } else {
          summary.success += 1;
        }
      } else if (status === 'skipped') {
        summary.skipped += 1;
      } else if (status === 'failed') {
        summary.failedCritical += 1;
        const code = typeof receipt.reason === 'string'
          ? receipt.reason
          : String(receipt.reason?.code || '');
        bump(summary.byReason, code || 'failed');
      }
      return summary;
    },
    snapshot() {
      return Object.freeze({
        success: summary.success,
        degraded: summary.degraded,
        skipped: summary.skipped,
        failedCritical: summary.failedCritical,
        byReason: Object.freeze({ ...summary.byReason }),
        byFallback: Object.freeze({ ...summary.byFallback }),
      });
    },
  });
}
