/**
 * Wall-clock grace the presentation engine adds to an interaction's authored
 * gesture window before it fails the effect (symbiote-workspace
 * `EFFECT_OPERATION_GRACE_MS`). The engine does not hand the deadline to the
 * adapter, so the value is mirrored here; it must never exceed the engine's.
 */
export const CV_SHOW_EFFECT_GRACE_MS = 1_000;

/**
 * Part of the engine grace a scroll may spend on slower motion. The rest stays
 * for main-thread stalls, so a smoother push never turns into a missed deadline.
 */
export const CV_SHOW_SCROLL_GRACE_SHARE_MS = Math.round(CV_SHOW_EFFECT_GRACE_MS * 0.4);

const OUTCOME_RESERVE_MS = 700;
const SETTLE_MARGIN_MS = 150;
const MIN_GESTURE_MS = 300;

/**
 * Splits one navigation effect's hard window between its two strategies: the
 * presenter gesture may use everything except the outcome reserve, and the
 * programmatic selection plus article readiness always keep that reserve. A
 * slow gesture therefore degrades into a plain navigation instead of failing
 * the effect, and the fallback never starts while a gesture can still land.
 *
 * Without an authored budget or activation time the budget is unbounded and
 * the navigation behaves as before.
 *
 * @param {{ budgetMs?: number, activatedAt?: number, now?: () => number }} [options]
 */
export function createNavigationBudget({
  budgetMs,
  activatedAt,
  now = () => performance.now(),
} = {}) {
  let budget = Number(budgetMs);
  let start = Number(activatedAt);
  if (!(budget > 0) || !Number.isFinite(start)) {
    return Object.freeze({
      bounded: false,
      gestureMs: () => Infinity,
      settleMs: () => Infinity,
      canGesture: () => true,
    });
  }
  let hardDeadline = start + budget + CV_SHOW_EFFECT_GRACE_MS;
  let remaining = (until) => Math.max(0, Math.round(until - now()));
  let gestureMs = () => remaining(hardDeadline - OUTCOME_RESERVE_MS);
  return Object.freeze({
    bounded: true,
    gestureMs,
    settleMs: () => remaining(hardDeadline - SETTLE_MARGIN_MS),
    canGesture: () => gestureMs() >= MIN_GESTURE_MS,
  });
}

/**
 * Runs the presenter gesture inside its share of the budget. The gesture gets
 * its own abort signal: when its share runs out it is aborted (the cursor
 * clears, no late click can land) and the caller continues with the
 * programmatic selection. An abort of the whole run still propagates.
 *
 * @param {(signal: AbortSignal, budgetMs: number) => Promise<boolean> | boolean} present
 * @param {{ signal: AbortSignal, budget: ReturnType<typeof createNavigationBudget> }} options
 * @returns {Promise<'row-click' | 'unavailable' | 'budget-expired' | 'budget-skipped'>}
 */
export async function runBudgetedNavigationGesture(present, { signal, budget }) {
  if (!budget.canGesture()) return 'budget-skipped';
  let gestureController = new AbortController();
  let onRunAbort = () => gestureController.abort(signal.reason);
  signal.addEventListener('abort', onRunAbort, { once: true });
  let timer = null;
  let budgetExpired = false;
  let gestureMs = budget.gestureMs();
  let expiry = Number.isFinite(gestureMs)
    ? new Promise((resolve) => {
      timer = setTimeout(() => {
        budgetExpired = true;
        let reason = new DOMException('navigation gesture budget spent', 'TimeoutError');
        gestureController.abort(reason);
        resolve('budget-expired');
      }, gestureMs);
    })
    : null;
  let gesture = Promise.resolve()
    .then(() => present(gestureController.signal, gestureMs))
    .then(
      (presented) => (presented === true ? 'row-click' : 'unavailable'),
      (error) => {
        if (signal.aborted) throw error;
        if (budgetExpired) return 'budget-expired';
        if (error?.name === 'AbortError') throw error;
        return 'unavailable';
      },
    );
  try {
    return await (expiry ? Promise.race([gesture, expiry]) : gesture);
  } finally {
    clearTimeout(timer);
    signal.removeEventListener('abort', onRunAbort);
    gesture.catch(() => {});
  }
}
