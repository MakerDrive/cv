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
 * Semantic failure classes for authored CV Show cells, resolved from the
 * portable directive refinements map (Option A: the Authoring Project stays
 * the single source of truth; no new canonical schema).
 *
 *   'soft'   visual attention/scroll/selection/decoration: a missed effect
 *            degrades or skips in place and NEVER pauses/rewinds/terminates
 *            narration once it started (CONTINUITY invariant)
 *   'gate'   required scene/state/navigation transitions: a failure pauses
 *            and retries before narration starts, pauses-and-reports after
 *   'critical' audio/narration: always pause-and-report, never auto-restart
 *
 * Any cell without an explicit resolvable class stays conservative
 * ('unknown' -> treated as gate/critical), so unclassified authored cells
 * can never silently degrade.
 */
export const CV_SHOW_FAILURE_SEMANTICS = Object.freeze({
  SOFT: 'soft',
  GATE: 'gate',
  CRITICAL: 'critical',
  UNKNOWN: 'unknown',
});

const SOFT_CONTINUITY_VALUES = new Set(['soft']);

/**
 * Resolves the semantic failure class of an authored CV Show cell.
 *
 * Preference order:
 *   1. explicit `continuity` refinement ('soft' — portable authored intent);
 *   2. focus/annotation layers and attention kind (always decorative);
 *   3. interaction/state kind or layer: soft only when the operation role is
 *      a visual scroll-for-attention or native text selection gesture
 *      (never when it navigates, activates media, or is unknown);
 *   4. audio/narration -> critical; anything else -> unknown (conservative).
 *
 * @param {object} input
 * @param {string} [input.kind]
 * @param {string} [input.layerId]
 * @param {object|string} [input.refinements] authored directive refinements
 *   (portable map) or the serialized directive carrying them
 * @param {string} [input.operationRole] concrete gesture role of the cell,
 *   e.g. 'scroll' | 'select' | 'navigate' | 'select-native' — resolved from
 *   the authored cue, never inherited from an owner directive
 */
export function resolveCvShowFailureSemantics({
  kind = '',
  layerId = '',
  refinements = null,
  operationRole = '',
} = {}) {
  const continuity = typeof refinements === 'object' && refinements
    ? String(refinements.continuity || '')
    : '';
  if (SOFT_CONTINUITY_VALUES.has(continuity)) {
    return CV_SHOW_FAILURE_SEMANTICS.SOFT;
  }
  if (
    CV_SHOW_DECORATIVE_LAYER_IDS.includes(layerId)
    || kind === 'attention'
  ) {
    return CV_SHOW_FAILURE_SEMANTICS.SOFT;
  }
  if (kind === 'audio' || layerId === 'cv-show:layer:audio' || kind === 'narration') {
    return CV_SHOW_FAILURE_SEMANTICS.CRITICAL;
  }
  if (
    CV_SHOW_INTERACTION_LAYER_IDS.includes(layerId)
    || kind === 'interaction'
    || kind === 'state'
  ) {
    const role = String(operationRole || '');
    // Only pure visual preparation/decoration gestures are soft. Real state
    // transitions (navigate) and unknown operation roles stay hard.
    if (role === 'scroll' || role === 'select-native' || role === 'select') {
      return CV_SHOW_FAILURE_SEMANTICS.SOFT;
    }
    return CV_SHOW_FAILURE_SEMANTICS.GATE;
  }
  return CV_SHOW_FAILURE_SEMANTICS.UNKNOWN;
}

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
 * Semantics-first resolution (see `resolveCvShowFailureSemantics`):
 *   soft     -> degrade in place once narration started (CONTINUITY);
 *               bounded scene-setup retry before narration started
 *   gate     -> pause-retry before narration, pause-and-report after
 *   optional -> explicit skip (authored non-critical intent)
 *   critical/unknown -> pause-and-report; never auto-restart an entry once
 *               narration could have been heard; explicit user replay only
 *
 * @param {object} input
 * @param {string} [input.kind] presentation cell kind (attention, interaction, ...)
 * @param {string} [input.layerId] authoring layer id
 * @param {string} [input.policy] authored directive policy ('optional' | 'required')
 * @param {string} [input.code] failure code
 * @param {boolean} [input.narrationStarted] whether narration of the owning
 *   entry has already physically started; with narration started no recovery
 *   may re-present the entry from zero
 * @param {object|string} [input.refinements] authored portable refinements map
 * @param {string} [input.operationRole] concrete gesture role of the cell
 */
export function resolveFailureRecovery({
  kind = '',
  layerId = '',
  policy = '',
  code = '',
  narrationStarted = false,
  refinements = null,
  operationRole = '',
} = {}) {
  const semantics = resolveCvShowFailureSemantics({
    kind,
    layerId,
    refinements,
    operationRole,
  });
  if (semantics === CV_SHOW_FAILURE_SEMANTICS.SOFT) {
    // CONTINUITY invariant: once narration started, a soft effect failure
    // can only degrade in place. It can never pause, terminate, or rewind
    // the narration. Before narration starts the established bounded
    // scene-setup retry stays available (nothing audible has been played).
    // Decorative attention effects always degraded in place historically;
    // soft interaction gestures keep the bounded pre-narration setup retry.
    return narrationStarted
      || kind === 'attention'
      || CV_SHOW_DECORATIVE_LAYER_IDS.includes(layerId)
      ? CV_SHOW_RECOVERY.DEGRADE
      : CV_SHOW_RECOVERY.PAUSE_RETRY;
  }
  if (policy === 'optional') return CV_SHOW_RECOVERY.SKIP;
  if (semantics === CV_SHOW_FAILURE_SEMANTICS.GATE) {
    return narrationStarted ? CV_SHOW_RECOVERY.PAUSE_REPORT : CV_SHOW_RECOVERY.PAUSE_RETRY;
  }
  // Audio / narration / unknown semantics: never auto-restart an entry once
  // narration could have been heard; the user may explicitly replay.
  return CV_SHOW_RECOVERY.PAUSE_REPORT;
}

export const CV_SHOW_RECOVERY_SKIP_BRANCH = 'skip-branch';

/**
 * Whether a presentation receipt records a terminal failure of a cell.
 * Present in both shapes: engine receipts (top-level cellId/status) and the
 * pump-path envelope (details.cellId / details.terminalStatus).
 */
export function isTerminalFailureReceipt(receipt) {
  if (!receipt || typeof receipt !== 'object') return false;
  return String(receipt.status || receipt.details?.terminalStatus || '') === 'failed';
}

/**
 * Builds the dependency graph of a playback plan so an engine-side tolerated
 * failure can be traced into an explicit cascade: every cell downstream of a
 * tolerated failed cell is skipped as part of a `skip-branch` recovery, and
 * each cascade receipt carries:
 *
 *   outcome:         'dependency-failed'
 *   cascadeFrom:     the direct failed/ancestor cell this skip follows from
 *   rootCauseCellId: the original tolerated failure that started the cascade
 *
 * The outcome map is cellId -> rootCause tracking so multi-level cascades
 * report the same root.
 */
export function createCascadeTracker(cells) {
  const deps = new Map();
  for (const cell of cells || []) {
    const id = String(cell?.id || cell?.cellId || '');
    if (!id) continue;
    deps.set(id, (cell.dependsOn || []).map((dep) => String(dep.cellId || '')));
  }
  const roots = new Map(); // failedCellId -> rootCause
  const cascaded = new Map(); // skippedCellId -> { cascadeFrom, rootCauseCellId }
  /** @param {string} cellId */
  const markFailure = (cellId) => {
    roots.set(String(cellId), String(cellId));
  };
  /**
   * @param {string} cellId terminal-skipped cell
   * @returns {{ cascadeFrom: string, rootCauseCellId: string } | null}
   */
  const classifySkip = (cellId) => {
    const id = String(cellId || '');
    const parents = deps.get(id) || [];
    for (const parent of parents) {
      if (roots.has(parent)) {
        const rootCauseCellId = roots.get(parent);
        cascaded.set(id, Object.freeze({ cascadeFrom: parent, rootCauseCellId }));
        return cascaded.get(id);
      }
      if (cascaded.has(parent)) {
        const ancestor = cascaded.get(parent);
        cascaded.set(id, Object.freeze({
          cascadeFrom: parent,
          rootCauseCellId: ancestor.rootCauseCellId,
        }));
        return cascaded.get(id);
      }
    }
    return null;
  };
  return Object.freeze({
    markFailure,
    classifySkip,
    get cascadeByRoot() {
      const groups = {};
      for (const [, value] of cascaded) {
        const root = value.rootCauseCellId;
        groups[root] = (groups[root] || 0) + 1;
      }
      return Object.freeze({ ...groups });
    },
    get cascadeSkippedCount() {
      return cascaded.size;
    },
  });
}
export function createPresentationReceiptSummary() {
  const degradedCells = new Map();
  const outcomes = new Map(); // cellId -> { klass, rootCauseCellId? }
  const summary = {
    success: 0,
    degraded: 0,
    skipped: 0,
    cascadeSkipped: 0,
    failedCritical: 0,
    byReason: {},
    byFallback: {},
    cascadeByRoot: {},
  };
  const PRIORITY = {
    failed: 4,
    degraded: 3,
    'cascade-skipped': 2,
    skipped: 2,
    success: 1,
  };
  const bump = (bucket, key) => {
    const name = String(key || '');
    if (!name) return;
    bucket[name] = (bucket[name] || 0) + 1;
  };
  const decrement = (klass, rootCauseCellId) => {
    if (klass === 'success') summary.success -= 1;
    else if (klass === 'degraded') summary.degraded -= 1;
    else if (klass === 'skipped') summary.skipped -= 1;
    else if (klass === 'cascade-skipped') {
      summary.cascadeSkipped -= 1;
      if (rootCauseCellId) {
        summary.cascadeByRoot[rootCauseCellId] = Math.max(
          0,
          (summary.cascadeByRoot[rootCauseCellId] || 0) - 1,
        );
      }
    } else if (klass === 'failed') summary.failedCritical -= 1;
  };
  const setOutcome = (cellId, klass, meta = {}) => {
    if (!cellId) return;
    const previous = outcomes.get(cellId);
    if (previous) {
      if (PRIORITY[previous.klass] >= PRIORITY[klass]) return;
      decrement(previous.klass, previous.rootCauseCellId);
    }
    outcomes.set(cellId, { klass, ...meta });
    if (klass === 'success') summary.success += 1;
    else if (klass === 'degraded') summary.degraded += 1;
    else if (klass === 'skipped') summary.skipped += 1;
    else if (klass === 'cascade-skipped') {
      summary.cascadeSkipped += 1;
      const root = String(meta.rootCauseCellId || '');
      if (root) summary.cascadeByRoot[root] = (summary.cascadeByRoot[root] || 0) + 1;
    } else if (klass === 'failed') summary.failedCritical += 1;
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
      if (['ended', 'settled', 'ready'].includes(status)) {
        const degradation = degradedCells.get(cellId);
        if (degradation) {
          setOutcome(cellId, 'degraded', {
            reason: degradation.reason,
            fallback: degradation.fallback,
          });
          bump(summary.byReason, degradation.reason || 'degraded');
          bump(summary.byFallback, degradation.fallback || 'none');
        } else {
          setOutcome(cellId, 'success');
        }
      } else if (status === 'skipped') {
        const cascade = providerReceipt && providerReceipt.outcome === 'dependency-failed'
          ? providerReceipt
          : null;
        if (cascade) {
          setOutcome(cellId, 'cascade-skipped', {
            reason: 'dependency-failed',
            rootCauseCellId: String(cascade.rootCauseCellId || ''),
          });
        } else {
          setOutcome(cellId, 'skipped');
        }
      } else if (status === 'failed') {
        const code = typeof receipt.reason === 'string'
          ? receipt.reason
          : String(receipt.reason?.code || '');
        setOutcome(cellId, 'failed', { reason: code });
        bump(summary.byReason, code || 'failed');
      }
      return summary;
    },
    snapshot() {
      return Object.freeze({
        success: summary.success,
        degraded: summary.degraded,
        skipped: summary.skipped,
        cascadeSkipped: summary.cascadeSkipped,
        failedCritical: summary.failedCritical,
        byReason: Object.freeze({ ...summary.byReason }),
        byFallback: Object.freeze({ ...summary.byFallback }),
        cascadeByRoot: Object.freeze({ ...summary.cascadeByRoot }),
      });
    },
  });
}
