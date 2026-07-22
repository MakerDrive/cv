export const PORTFOLIO_MEDIA_READING_ROOT_MARGIN = '-33% 0px -60% 0px';
export const PORTFOLIO_MEDIA_FOCUS_DELAY_MS = 150;

/**
 * @param {Object} [options]
 * @param {(mediaId: string) => void} [options.focus]
 * @param {(mediaId: string) => boolean} [options.isCurrent]
 * @param {number} [options.delayMs]
 * @param {(callback: () => void, delayMs: number) => any} [options.setTimer]
 * @param {(timerId: any) => void} [options.clearTimer]
 */
export function createPortfolioMediaFocusScheduler({
  focus,
  isCurrent = () => true,
  delayMs = PORTFOLIO_MEDIA_FOCUS_DELAY_MS,
  setTimer = globalThis.setTimeout?.bind(globalThis),
  clearTimer = globalThis.clearTimeout?.bind(globalThis),
} = {}) {
  if (typeof focus !== 'function') {
    throw new TypeError('Portfolio media focus scheduler requires a focus callback');
  }

  let pendingId = '';
  let timerId = null;
  let revision = 0;

  let cancel = () => {
    revision += 1;
    if (timerId !== null) clearTimer?.(timerId);
    timerId = null;
    pendingId = '';
  };

  let schedule = (mediaId) => {
    let id = String(mediaId || '').trim();
    if (!id) {
      cancel();
      return false;
    }

    revision += 1;
    let scheduledRevision = revision;
    if (timerId !== null) clearTimer?.(timerId);
    pendingId = id;
    if (typeof setTimer !== 'function') {
      timerId = null;
      pendingId = '';
      if (!isCurrent(id)) return false;
      focus(id);
      return true;
    }

    timerId = setTimer(() => {
      if (scheduledRevision !== revision) return;
      timerId = null;
      pendingId = '';
      if (isCurrent(id)) focus(id);
    }, delayMs);
    return true;
  };

  return Object.freeze({
    cancel,
    schedule,
    get pendingId() {
      return pendingId;
    },
  });
}

function getRectCenter(rect) {
  if (!rect) return Number.POSITIVE_INFINITY;
  let top = Number(rect.top);
  let bottom = Number(rect.bottom);
  if (!Number.isFinite(top) || !Number.isFinite(bottom)) return Number.POSITIVE_INFINITY;
  return top + (bottom - top) / 2;
}

export function pickPortfolioActiveMediaId(candidates, previousId = '') {
  let visible = Array.from(candidates || []).filter((candidate) => (
    candidate?.isIntersecting && String(candidate.mediaId || '').trim()
  ));
  if (!visible.length) return String(previousId || '');

  let rootBounds = visible.find((candidate) => candidate.rootBounds)?.rootBounds;
  let readingLine = getRectCenter(rootBounds);
  visible.sort((left, right) => {
    let distance = Math.abs(getRectCenter(left.rect) - readingLine)
      - Math.abs(getRectCenter(right.rect) - readingLine);
    if (distance) return distance;
    let order = Number(left.order) - Number(right.order);
    if (order) return order;
    return String(left.mediaId).localeCompare(String(right.mediaId));
  });
  return String(visible[0].mediaId);
}

export function resolvePortfolioMediaVisibilityChange({ candidateId, expectedId = '', previousId = '' }) {
  let candidate = String(candidateId || '');
  let expected = String(expectedId || '');
  let previous = String(previousId || '');
  if (!candidate) return { mediaId: previous, expectedId: expected, changed: false };
  if (expected && candidate !== expected) {
    return { mediaId: previous, expectedId: expected, changed: false };
  }
  return {
    mediaId: candidate,
    expectedId: expected,
    changed: candidate !== previous,
  };
}
