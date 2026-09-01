const PORTFOLIO_MAP_TARGET_PREFIX = 'portfolio.map.';

/**
 * @typedef {{
 *   presentationBudgetMs?: number,
 *   settlementReserveMs?: number,
 * }} PortfolioMapFocusOptions
 */

/**
 * @typedef {{
 *   document?: Document,
 *   signal?: AbortSignal,
 *   timeoutMs?: number,
 *   stableFrameCount?: number,
 *   epsilonPx?: number,
 *   requestAnimationFrame?: (callback: FrameRequestCallback) => number,
 *   cancelAnimationFrame?: (handle: number) => void,
 * }} PortfolioMapSettlementOptions
 */

/**
 * @typedef {{
 *   document?: Document,
 *   signal?: AbortSignal,
 * }} HeldAttentionRestoreOptions
 */

const PORTFOLIO_MAP_NODE_TARGETS = Object.freeze({
  'historical-branch': 'projects/photopizza',
  'engineering-scale-route': 'projects/agent-portal',
});
const PORTFOLIO_MAP_FOCUS_HOLD_MS = 12_000;

export function isPortfolioMapTarget(targetId) {
  return String(targetId || '').startsWith(PORTFOLIO_MAP_TARGET_PREFIX);
}

/** Ensures a direct Details entry renders the article that owns its semantic target. */
export function ensureCvShowArticleProject(runtime, targetId) {
  const match = String(targetId || '').match(
    /^article\.([a-z0-9][a-z0-9-]*)\.[a-z0-9][a-z0-9-]*$/u,
  );
  if (!match) return null;
  const projectId = `projects/${match[1]}`;
  if (!runtime?.entries?.has?.(projectId)) return null;
  if (runtime.selectedId === projectId) return Object.freeze({ projectId, changed: false });
  const selected = runtime.select?.(projectId, { focus: true, updateUrl: false });
  if (selected === false) return null;
  return Object.freeze({ projectId, changed: true });
}

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
  if (!isPortfolioMapTarget(targetId)) return null;
  const canvas = workspace?.querySelector?.('node-canvas, sn-canvas-graph') || null;
  if (!canvas) return null;

  const semanticTarget = String(targetId).slice(PORTFOLIO_MAP_TARGET_PREFIX.length);
  const nodeId = PORTFOLIO_MAP_NODE_TARGETS[semanticTarget];
  if (!nodeId) return null;
  return canvas.querySelector?.(
    `graph-node[node-id="${escapeAttributeSelectorValue(nodeId)}"]`,
  ) || null;
}

/** Moves the public graph viewport to one semantic Show node without changing selection. */
function portfolioMapMotionScale(canvas) {
  const view = canvas?.ownerDocument?.defaultView || globalThis;
  const styles = view?.getComputedStyle?.(canvas);
  const scale = Number(styles?.getPropertyValue?.('--sn-theme-motion-scale'));
  return Number.isFinite(scale) && scale > 0 ? scale : 1;
}

/**
 * @param {any} workspace
 * @param {string} targetId
 * @param {PortfolioMapFocusOptions} [options]
 */
export function focusPortfolioMapTarget(workspace, targetId, {
  presentationBudgetMs,
  settlementReserveMs = 300,
} = {}) {
  if (!isPortfolioMapTarget(targetId)) return false;
  const semanticTarget = String(targetId).slice(PORTFOLIO_MAP_TARGET_PREFIX.length);
  const nodeId = PORTFOLIO_MAP_NODE_TARGETS[semanticTarget];
  if (!nodeId) return false;
  const canvas = workspace?.querySelector?.('node-canvas, sn-canvas-graph') || null;
  if (typeof canvas?.focusNodes !== 'function') return false;
  const budget = Number(presentationBudgetMs);
  const transitionOptions = {};
  const focusHoldMs = Math.max(
    PORTFOLIO_MAP_FOCUS_HOLD_MS,
    Number.isFinite(budget) && budget > 0 ? budget : 0,
  );
  const graphPanel = canvas?.closest?.('portfolio-graph-panel')
    || workspace?.querySelector?.('portfolio-graph-panel');
  graphPanel?.holdShowMapFocus?.(focusHoldMs);
  if (Number.isFinite(budget) && budget > 0) {
    const actualDurationMs = Math.max(0, budget - Math.max(0, settlementReserveMs));
    const normalizedDurationMs = actualDurationMs / portfolioMapMotionScale(canvas);
    transitionOptions.transitionMs = normalizedDurationMs;
    const transitionStartTime = Number(
      canvas?.ownerDocument?.defaultView?.performance?.now?.(),
    );
    if (Number.isFinite(transitionStartTime)) {
      transitionOptions.transitionStartTime = transitionStartTime;
    }
  }
  return canvas.focusNodes(nodeId, {
    select: false,
    padding: 56,
    maxZoom: 0.8,
    marker: false,
    ...transitionOptions,
  }) !== false;
}

function finiteRect(element) {
  const rect = element?.getBoundingClientRect?.();
  if (!rect) return null;
  const left = Number(rect.left);
  const top = Number(rect.top);
  const width = Number(rect.width);
  const height = Number(rect.height);
  const right = Number.isFinite(Number(rect.right)) ? Number(rect.right) : left + width;
  const bottom = Number.isFinite(Number(rect.bottom)) ? Number(rect.bottom) : top + height;
  if (![left, top, right, bottom, width, height].every(Number.isFinite)) return null;
  if (width <= 0 || height <= 0) return null;
  return Object.freeze({ left, top, right, bottom, width, height });
}

function rectInside(inner, outer, tolerancePx = 1) {
  if (!inner || !outer) return false;
  return inner.left >= outer.left - tolerancePx
    && inner.top >= outer.top - tolerancePx
    && inner.right <= outer.right + tolerancePx
    && inner.bottom <= outer.bottom + tolerancePx;
}

function rectInsideViewport(rect, view, tolerancePx = 1) {
  const width = Number(view?.innerWidth);
  const height = Number(view?.innerHeight);
  if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) {
    return true;
  }
  return rectInside(rect, {
    left: 0,
    top: 0,
    right: width,
    bottom: height,
  }, tolerancePx);
}

function rectStable(previous, current, epsilonPx) {
  if (!previous || !current) return false;
  return ['left', 'top', 'right', 'bottom', 'width', 'height']
    .every(key => Math.abs(previous[key] - current[key]) <= epsilonPx);
}

/**
 * A graph focus mutates transform state asynchronously. DOM presence alone is
 * not settlement evidence: the promoted node can retain valid geometry far
 * outside the clipped canvas while the camera is still flying to it.
 *
 * @param {any} workspace
 * @param {string} targetId
 * @param {PortfolioMapSettlementOptions} [options]
 */
export function waitForPortfolioMapTargetVisualSettlement(workspace, targetId, {
  document = globalThis.document,
  signal,
  timeoutMs = 2_500,
  stableFrameCount = 2,
  epsilonPx = 0.1,
  requestAnimationFrame: requestFrameOption,
  cancelAnimationFrame: cancelFrameOption,
} = {}) {
  if (signal?.aborted) return Promise.reject(abortError(signal));
  const view = document?.defaultView || globalThis;
  const requestFrameMethod = requestFrameOption || view?.requestAnimationFrame;
  const cancelFrameMethod = cancelFrameOption || view?.cancelAnimationFrame;
  const requestFrame = typeof requestFrameMethod === 'function'
    ? callback => requestFrameMethod.call(view, callback)
    : callback => setTimeout(() => callback(Date.now()), 16);
  const cancelFrame = typeof cancelFrameMethod === 'function'
    ? frameId => cancelFrameMethod.call(view, frameId)
    : frameId => clearTimeout(frameId);
  const requiredStableFrames = Math.max(2, Number.parseInt(String(stableFrameCount), 10) || 2);

  return new Promise((resolve, reject) => {
    let frameId = null;
    let timeoutId = null;
    let stableFrames = 0;
    let previousRect = null;
    let done = false;
    const cleanup = () => {
      if (frameId !== null) cancelFrame(frameId);
      if (timeoutId !== null) clearTimeout(timeoutId);
      signal?.removeEventListener?.('abort', onAbort);
    };
    const fail = (error) => {
      if (done) return;
      done = true;
      cleanup();
      reject(error);
    };
    const onAbort = () => fail(abortError(signal));
    const scheduleFrame = () => {
      frameId = requestFrame(step);
    };
    const step = () => {
      frameId = null;
      if (signal?.aborted) return onAbort();
      const canvas = workspace?.querySelector?.('node-canvas, sn-canvas-graph') || null;
      const target = resolvePortfolioMapTarget(workspace, targetId);
      const canvasViewport = canvas?.ref?.canvasContainer || canvas;
      const canvasRect = finiteRect(canvasViewport);
      const targetRect = finiteRect(target);
      const viewportAnimating = canvas?.hasAttribute?.('data-viewport-animating') === true;
      const visible = target?.isConnected !== false
        && !viewportAnimating
        && rectInside(targetRect, canvasRect)
        && rectInsideViewport(targetRect, view);
      if (visible && rectStable(previousRect, targetRect, epsilonPx)) stableFrames += 1;
      else stableFrames = visible ? 1 : 0;
      previousRect = visible ? targetRect : null;
      if (stableFrames < requiredStableFrames) {
        scheduleFrame();
        return;
      }
      done = true;
      cleanup();
      resolve(Object.freeze({
        target,
        visualSettlement: Object.freeze({
          status: 'settled',
          motion: 'graph-focus',
          reason: 'exact-map-node-visible',
        }),
      }));
    };

    signal?.addEventListener?.('abort', onAbort, { once: true });
    if (Number(timeoutMs) > 0) {
      timeoutId = setTimeout(() => {
        /** @type {Error & { code?: string }} */
        const error = new Error('CV Show portfolio map focus timed out');
        error.name = 'ShowReadinessError';
        error.code = 'timeout';
        fail(error);
      }, Number(timeoutMs));
    }
    scheduleFrame();
  });
}

function visibleSemanticElement(element, document) {
  if (!element || element.isConnected === false) return false;
  const rect = element.getBoundingClientRect?.();
  if (rect && (!(Number(rect.width) > 0) || !(Number(rect.height) > 0))) return false;
  const style = document?.defaultView?.getComputedStyle?.(element);
  return style?.display !== 'none' && style?.visibility !== 'hidden';
}

function normalizedHref(value, document) {
  try {
    return new URL(String(value || ''), document?.baseURI || 'https://cv.invalid/').href;
  } catch {
    return '';
  }
}

function projectLinkHref(runtime, slug, linkKind, document) {
  const entry = runtime?.entries?.get?.(`projects/${slug}`);
  if (!entry) return '';
  const links = [
    ...(entry.href ? [{ label: entry.linkLabel || '', href: entry.href }] : []),
    ...(Array.isArray(entry.links) ? entry.links : []),
  ];
  const normalizedKind = String(linkKind || '').toLowerCase();
  const labeled = links.find(({ label }) => String(label || '').trim().toLowerCase() === normalizedKind);
  const inferred = links.find(({ href }) => {
    const hostname = (() => {
      try { return new URL(String(href), document?.baseURI).hostname.toLowerCase(); } catch { return ''; }
    })();
    if (normalizedKind === 'github') return hostname === 'github.com';
    if (normalizedKind === 'demo') return hostname.endsWith('github.io');
    return false;
  });
  return normalizedHref((labeled || inferred)?.href, document);
}

/** Resolves Show-only semantic UI ids without relying on positional selectors. */
export function resolveCvShowSemanticTarget(workspace, runtime, targetId, {
  document = globalThis.document,
} = {}) {
  const normalizedTargetId = String(targetId || '');
  if (normalizedTargetId.startsWith('media/')) {
    const viewer = runtime?.viewer || workspace?.querySelector?.('.portfolio-viewer');
    return Array.from(viewer?.querySelectorAll?.('[data-media-id]') || []).find((host) => (
      host?.dataset?.mediaId === normalizedTargetId
      && visibleSemanticElement(host, document)
    )) || null;
  }
  if (normalizedTargetId.startsWith('project-link.')) {
    const parts = normalizedTargetId.slice('project-link.'.length).split('.');
    const linkKind = parts.pop() || '';
    const slug = parts.join('.');
    const href = projectLinkHref(runtime, slug, linkKind, document);
    if (!href) return null;
    const viewer = runtime?.viewer || workspace?.querySelector?.('.portfolio-viewer');
    return Array.from(viewer?.querySelectorAll?.('a[href]') || []).find((anchor) => (
      normalizedHref(anchor.href || anchor.getAttribute?.('href'), document) === href
      && visibleSemanticElement(anchor, document)
    )) || null;
  }
  if (normalizedTargetId.startsWith('chat.action.')) {
    const parts = normalizedTargetId.slice('chat.action.'.length).split('.');
    const actionId = parts.pop() || '';
    const sceneId = parts.join('.');
    if (!sceneId || !actionId) return null;
    return workspace?.querySelector?.(
      `.actions-card[data-actions-id="${escapeAttributeSelectorValue(`${sceneId}.actions`)}"] `
      + `[data-action-id="${escapeAttributeSelectorValue(actionId)}"]`,
    ) || null;
  }
  return null;
}

function textNodesWithin(target, document) {
  if (!document?.createTreeWalker) return [];
  const walker = document.createTreeWalker(target, 4);
  const nodes = [];
  let node;
  while ((node = walker.nextNode())) nodes.push(node);
  return nodes;
}

function occurrenceOffset(text, quote, occurrence) {
  let offset = -1;
  let from = 0;
  for (let index = 0; index < occurrence; index += 1) {
    offset = text.indexOf(quote, from);
    if (offset < 0) return -1;
    from = offset + quote.length;
  }
  return offset;
}

function rangeBoundary(nodes, absoluteOffset) {
  let traversed = 0;
  for (const node of nodes) {
    const length = String(node.data ?? node.textContent ?? '').length;
    if (absoluteOffset <= traversed + length) {
      return { node, offset: Math.max(0, absoluteOffset - traversed) };
    }
    traversed += length;
  }
  return null;
}

function unionRangeRect(range) {
  const rects = Array.from(range?.getClientRects?.() || []).filter((rect) => (
    Number(rect.width) > 0 && Number(rect.height) > 0
  ));
  if (!rects.length) {
    const rect = range?.getBoundingClientRect?.();
    if (Number(rect?.width) > 0 && Number(rect?.height) > 0) rects.push(rect);
  }
  if (!rects.length) return null;
  const left = Math.min(...rects.map((rect) => Number(rect.left)));
  const top = Math.min(...rects.map((rect) => Number(rect.top)));
  const right = Math.max(...rects.map((rect) => Number(rect.right ?? rect.left + rect.width)));
  const bottom = Math.max(...rects.map((rect) => Number(rect.bottom ?? rect.top + rect.height)));
  return Object.freeze({ left, top, right, bottom, width: right - left, height: bottom - top });
}

/**
 * Narrows marker geometry to an authored quote using the browser's public Range
 * abstraction. The returned element-like proxy keeps clipping ancestry and
 * document timing attached to the rendered article block.
 */
export function createCvShowTextMarkerTarget(target, directive = {}) {
  const quote = String(directive.quote || '');
  const occurrence = Math.max(1, Number.parseInt(directive.occurrence, 10) || 1);
  const document = target?.ownerDocument || globalThis.document;
  if (!target || !quote || !document?.createRange) return target;
  const nodes = textNodesWithin(target, document);
  const text = nodes.map((node) => String(node.data ?? node.textContent ?? '')).join('');
  const startOffset = occurrenceOffset(text, quote, occurrence);
  if (startOffset < 0) return target;
  const start = rangeBoundary(nodes, startOffset);
  const end = rangeBoundary(nodes, startOffset + quote.length);
  if (!start || !end) return target;
  const range = document.createRange();
  range.setStart(start.node, start.offset);
  range.setEnd(end.node, end.offset);
  if (!unionRangeRect(range)) return target;
  return Object.freeze({
    id: target.id ? `${target.id}--show-marker-quote` : '',
    ownerDocument: document,
    parentElement: target.parentElement || null,
    parentNode: target,
    isConnected: target.isConnected !== false,
    getRootNode: target.getRootNode?.bind(target),
    scrollIntoView: target.scrollIntoView?.bind(target),
    getBoundingClientRect: () => unionRangeRect(range),
    getClientRects: () => Object.freeze([unionRangeRect(range)].filter(Boolean)),
  });
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

/**
 * Navigation first selects the destination and then resolves the rendered
 * article. Scrolling its stale tree row before selection is redundant and can
 * leave responsive panel motion waiting past the setup deadline.
 */
export function resolveCvShowActionTargetScroll(action, context = {}) {
  return false;
}

/**
 * A Details branch can open while its article retains a previous scroll
 * position. Setup attention still owns the semantic destination, so the
 * runtime may position that article block before provider admission without
 * inventing a second authored timeline event.
 */
export function shouldRestoreCvShowSetupAttentionTarget(action, context = {}) {
  if (context?.scrollOperation === true || action?.timing?.phase !== 'setup') return false;
  if (!String(action?.target || '').startsWith('article.')) return false;
  return ['frame', 'native-selection', 'marker', 'activate'].includes(action?.type);
}

/**
 * A checkpoint can restore an attention cue whose paired scroll has already
 * elapsed. Recreate only that missing visual position, synchronously and
 * without spending the attention provider's hard gesture budget on a native
 * smooth scroll. Normal playback keeps using the authored `:scroll` cell.
 *
 * @param {any} target
 * @param {HeldAttentionRestoreOptions} [options]
 */
export function restoreCvShowHeldAttentionTarget(target, {
  document = globalThis.document,
  signal,
} = {}) {
  if (signal?.aborted) return Promise.reject(abortError(signal));
  if (!target?.scrollIntoView) return Promise.resolve(Object.freeze({
    status: 'unavailable',
    frames: 0,
  }));
  target.scrollIntoView({
    block: 'center',
    inline: 'nearest',
    behavior: 'instant',
  });
  const view = document?.defaultView || globalThis;
  const requestFrameMethod = view?.requestAnimationFrame;
  const cancelFrameMethod = view?.cancelAnimationFrame;
  if (
    typeof requestFrameMethod !== 'function'
    || document?.visibilityState === 'hidden'
  ) {
    return Promise.resolve(Object.freeze({ status: 'settled', frames: 0 }));
  }
  const requestFrame = callback => requestFrameMethod.call(view, callback);
  const cancelFrame = typeof cancelFrameMethod === 'function'
    ? frameId => cancelFrameMethod.call(view, frameId)
    : () => {};
  return new Promise((resolve, reject) => {
    let frameId = null;
    let frameCount = 0;
    let done = false;
    const cleanup = () => {
      if (frameId !== null) cancelFrame(frameId);
      signal?.removeEventListener?.('abort', onAbort);
    };
    const finish = (settle, value) => {
      if (done) return;
      done = true;
      cleanup();
      settle(value);
    };
    const onAbort = () => finish(reject, abortError(signal));
    const onFrame = () => {
      frameId = null;
      if (signal?.aborted) return onAbort();
      frameCount += 1;
      if (frameCount < 2) {
        frameId = requestFrame(onFrame);
        return;
      }
      finish(resolve, Object.freeze({ status: 'settled', frames: frameCount }));
    };
    signal?.addEventListener?.('abort', onAbort, { once: true });
    frameId = requestFrame(onFrame);
  });
}

export function shouldDeferCvShowNavigationTarget(action) {
  return action?.type === 'navigate' && !String(action?.id || '').endsWith('.map');
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
 * Keeps authored scroll motion inside the presentation cell's hard deadline.
 * Readiness, native scrollend and stable-frame evidence retain a fixed 800 ms
 * reserve; longer cells keep the normal 300 ms motion.
 */
export function resolveCvShowScrollDuration(budgetMs, {
  maxDurationMs = 300,
  settlementReserveMs = 800,
} = {}) {
  const budget = Number(budgetMs);
  if (!Number.isFinite(budget) || budget <= 0) return maxDurationMs;
  return Math.max(0, Math.min(maxDurationMs, budget - settlementReserveMs));
}

/**
 * Frame-only article media needs an immediate authored scroll: loading the
 * static player shell can otherwise consume the whole presentation deadline.
 * @param {number} budgetMs
 * @param {{ action?: { type?: string, target?: string } }} [options]
 */
export function shouldBypassCvShowScrollSettlement(budgetMs, { action } = {}) {
  if (
    action?.type === 'frame'
    && String(action?.target || '').startsWith('media/')
  ) return true;
  const budget = Number(budgetMs);
  return Number.isFinite(budget) && budget > 0 && resolveCvShowScrollDuration(budget) === 0;
}

/**
 * Runs the authored CV scroll with a deterministic upper duration while the
 * shared readiness layer remains responsible for native `scrollend` and stable
 * frame evidence. Native smooth-scroll duration is browser-selected and can
 * exceed the Project's hard event cell even when the visual motion is done.
 * @param {Element} target
 * @param {{ document?: Document, signal?: AbortSignal, durationMs?: number }} [options]
 * @returns {Promise<void>}
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
