const PORTFOLIO_MAP_TARGET_PREFIX = 'portfolio.map.';

const PORTFOLIO_MAP_NODE_TARGETS = Object.freeze({
  'historical-branch': 'projects/photopizza',
  'engineering-scale-route': 'projects/agent-portal',
});

function escapeAttributeSelectorValue(value) {
  if (globalThis.CSS?.escape) return globalThis.CSS.escape(String(value));
  return String(value).replaceAll('\\', '\\\\').replaceAll('"', '\\"');
}

/**
 * Resolves semantic Show map targets to the graph's live DOM projection.
 * The finale deliberately traces one historical hardware/software node to one
 * current agent-workspace node. Targeting the whole canvas or the same Projects
 * hub twice would hide the transition and make focus geometry viewport-sized.
 */
export function resolvePortfolioMapTarget(workspace, targetId) {
  if (!String(targetId || '').startsWith(PORTFOLIO_MAP_TARGET_PREFIX)) return null;
  const canvas = workspace?.querySelector?.('node-canvas, sn-canvas-graph') || null;
  if (!canvas) return null;

  const semanticTarget = String(targetId).slice(PORTFOLIO_MAP_TARGET_PREFIX.length);
  const nodeId = PORTFOLIO_MAP_NODE_TARGETS[semanticTarget];
  if (!nodeId) return null;
  return canvas.querySelector?.(
    `graph-node[node-id="${escapeAttributeSelectorValue(nodeId)}"]`,
  ) || null;
}

function normalizedText(value) {
  return String(value || '').replace(/\s+/gu, ' ').trim();
}

function semanticExcerpt(value, maxLength = 80) {
  const text = normalizedText(value);
  if (!text) return '';
  const sentence = text.match(/^.*?[.!?](?=\s|$)/u)?.[0] || text;
  if (sentence.length <= maxLength) return sentence;
  const bounded = sentence.slice(0, maxLength + 1);
  const wordBoundary = bounded.lastIndexOf(' ');
  return bounded.slice(0, wordBoundary > 0 ? wordBoundary : maxLength).trim();
}

/**
 * Keeps the authored selection phrase when it belongs to the rendered locale.
 * CV narration currently has one language while articles are switchable, so a
 * semantic article block supplies a deterministic first-sentence fallback.
 */
export function resolveCvShowSelectionQuote(target, action) {
  const targetText = normalizedText(target?.textContent);
  const authoredQuote = normalizedText(action?.quote);
  if (!targetText) return '';
  if (authoredQuote && targetText.includes(authoredQuote)) return authoredQuote;
  return semanticExcerpt(targetText);
}

export function isShowTargetReadyForAction(target, action) {
  if (!target) return false;
  if (action?.type !== 'native-selection') return true;
  return Boolean(resolveCvShowSelectionQuote(target, action));
}

function abortError(signal) {
  if (signal?.reason instanceof Error) return signal.reason;
  const error = new Error('CV Show scroll was aborted');
  error.name = 'AbortError';
  return error;
}

function scrollContainers(target, document) {
  const containers = [];
  const seen = new Set();
  const add = (element) => {
    if (!element || seen.has(element)) return;
    const scrollable = Number(element.scrollHeight) > Number(element.clientHeight) + 1
      || Number(element.scrollWidth) > Number(element.clientWidth) + 1;
    if (!scrollable) return;
    seen.add(element);
    containers.push(element);
  };
  let current = target?.parentElement || target?.getRootNode?.()?.host || null;
  while (current) {
    add(current);
    const next = current.parentElement || current.getRootNode?.()?.host || null;
    if (next === current) break;
    current = next;
  }
  add(document?.scrollingElement || document?.documentElement || null);
  return containers;
}

function offsets(containers) {
  return containers.map((element) => ({
    element,
    left: Number(element.scrollLeft) || 0,
    top: Number(element.scrollTop) || 0,
  }));
}

function applyOffsets(rows, progress) {
  for (const row of rows) {
    row.element.scrollLeft = row.startLeft + (row.endLeft - row.startLeft) * progress;
    row.element.scrollTop = row.startTop + (row.endTop - row.startTop) * progress;
  }
}

function easeInOutCubic(progress) {
  return progress < 0.5
    ? 4 * progress * progress * progress
    : 1 - ((-2 * progress + 2) ** 3) / 2;
}

/**
 * Runs the authored CV scroll with a deterministic upper duration while the
 * shared readiness layer remains responsible for native `scrollend` and stable
 * frame evidence. Native smooth-scroll duration is browser-selected and can
 * exceed the Project's hard event cell even when the visual motion is done.
 */
export function animateCvShowScrollIntoView(
  target,
  { document, signal, durationMs = 300 } = {},
) {
  if (!target?.scrollIntoView) return Promise.resolve();
  if (signal?.aborted) return Promise.reject(abortError(signal));
  const view = document?.defaultView || globalThis;
  const requestFrame = view?.requestAnimationFrame?.bind(view);
  const cancelFrame = view?.cancelAnimationFrame?.bind(view) || (() => {});
  if (!requestFrame) {
    target.scrollIntoView({ block: 'center', inline: 'nearest', behavior: 'instant' });
    return Promise.resolve();
  }

  const containers = scrollContainers(target, document);
  const before = offsets(containers);
  target.scrollIntoView({ block: 'center', inline: 'nearest', behavior: 'instant' });
  const after = offsets(containers);
  const rows = before.map((row, index) => ({
    element: row.element,
    startLeft: row.left,
    startTop: row.top,
    endLeft: after[index]?.left ?? row.left,
    endTop: after[index]?.top ?? row.top,
  }));
  applyOffsets(rows, 0);
  const reducedMotion = view?.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches === true;
  const duration = reducedMotion ? 0 : Math.max(0, Number(durationMs) || 0);
  if (!duration || rows.every((row) => (
    row.startLeft === row.endLeft && row.startTop === row.endTop
  ))) {
    applyOffsets(rows, 1);
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    let frameId = null;
    let startedAt = null;
    const cleanup = () => signal?.removeEventListener?.('abort', onAbort);
    const onAbort = () => {
      if (frameId !== null) cancelFrame(frameId);
      cleanup();
      reject(abortError(signal));
    };
    const step = (timestamp) => {
      if (signal?.aborted) return onAbort();
      if (startedAt === null) startedAt = timestamp;
      const progress = Math.min(1, Math.max(0, (timestamp - startedAt) / duration));
      applyOffsets(rows, easeInOutCubic(progress));
      if (progress < 1) {
        frameId = requestFrame(step);
        return;
      }
      cleanup();
      resolve();
    };
    signal?.addEventListener?.('abort', onAbort, { once: true });
    frameId = requestFrame(step);
  });
}
