import {
  createPortfolioGraphRouteFingerprint,
  selectPortfolioGraphSnapshotEntry,
  validatePortfolioGraphSnapshotBinding,
} from '../data/portfolioGraphSnapshot.js';

const MANIFEST_URL = 'portfolio-graph-snapshots/manifest.json';
const PORTFOLIO_GRAPH_NODE_COUNT = 119;
const PORTFOLIO_GRAPH_ROUTE_COUNT = 180;

function roundMetric(value) {
  return Math.round(Number(value || 0) * 1000) / 1000;
}

function normalizeText(value) {
  return String(value || '').replace(/\s+/g, ' ').trim();
}

function readLogicalNodePosition(node) {
  let position = node._position;
  if (Number.isFinite(position?.x) && Number.isFinite(position?.y)) {
    return position;
  }

  // NodeCanvas stores layout coordinates in the inline transform. The private
  // position mirror can be absent after a connected canvas is reparented, but
  // the transform remains in the same unscaled logical coordinate space used
  // by the build snapshot and ConnectionRenderer.
  let match = String(node.style?.transform || '').match(
    /translate(?:3d)?\(\s*(-?(?:\d+\.?\d*|\.\d+))px\s*,\s*(-?(?:\d+\.?\d*|\.\d+))px/,
  );
  if (!match) return { x: 0, y: 0 };
  return { x: Number(match[1]), y: Number(match[2]) };
}

function getGraphNodes(canvas) {
  return [...canvas.querySelectorAll('graph-node')]
    .map((node) => {
      let position = readLogicalNodePosition(node);
      let style = getComputedStyle(node);
      return {
        id: node.getAttribute('node-id') || '',
        type: node.getAttribute('node-type') || '',
        category: node.getAttribute('node-category') || '',
        shape: node.getAttribute('node-shape') || '',
        label: node.getAttribute('node-label') || '',
        text: normalizeText(node.textContent),
        x: roundMetric(position.x),
        y: roundMetric(position.y),
        // ConnectionRenderer routes in the canvas' logical coordinate space.
        // Viewport rectangles include the canvas zoom transform and therefore
        // cannot participate in the provider/build fingerprint.
        width: roundMetric(node.offsetWidth || node._cachedW),
        height: roundMetric(node.offsetHeight || node._cachedH),
        fontFamily: style.fontFamily,
        fontSize: style.fontSize,
        fontWeight: style.fontWeight,
        lineHeight: style.lineHeight,
        letterSpacing: style.letterSpacing,
      };
    })
    .filter((node) => node.id)
    .sort((left, right) => left.id.localeCompare(right.id));
}

function getGraphConnectionIds(canvas) {
  return [...canvas.querySelectorAll('.sn-conn-path')]
    .map((path) => path.getAttribute('data-conn-id') || '')
    .filter(Boolean)
    .sort();
}

/**
 * @param {any} canvas
 * @param {string} locale
 * @returns {object}
 */
export function readPortfolioGraphRouteFingerprint(canvas, locale) {
  let nodes = getGraphNodes(canvas);
  let connectionIds = getGraphConnectionIds(canvas);
  return createPortfolioGraphRouteFingerprint({
    canonicalGraph: {
      nodes: nodes.map(({ id, type, category, shape }) => ({ id, type, category, shape })),
      connectionIds,
    },
    localeContent: {
      locale,
      nodes: nodes.map(({ id, label, text }) => ({ id, label, text })),
    },
    nodePositions: nodes.map(({ id, x, y }) => ({ id, x, y })),
    nodeSizes: nodes.map(({ id, width, height }) => ({ id, width, height })),
    fontMetrics: nodes.map(({
      id,
      fontFamily,
      fontSize,
      fontWeight,
      lineHeight,
      letterSpacing,
    }) => ({
      id,
      fontFamily,
      fontSize,
      fontWeight,
      lineHeight,
      letterSpacing,
    })),
  });
}

/**
 * @param {any} canvas
 * @param {string} [locale]
 * @param {{requireFullPcb?: boolean, signal?: AbortSignal}} [options]
 * @returns {Promise<object>}
 */
export async function settlePortfolioGraphForSnapshot(
  canvas,
  locale = document.documentElement.lang || 'en',
  { requireFullPcb = false, signal } = {},
) {
  await customElements.whenDefined('cascade-theme-widget');
  await document.fonts?.ready;
  let graphReady = requireFullPcb
    ? await waitForFullLivePcb(canvas, PORTFOLIO_GRAPH_ROUTE_COUNT, signal)
    : await waitForLiveGraphGeometry(
      canvas,
      PORTFOLIO_GRAPH_NODE_COUNT,
      PORTFOLIO_GRAPH_ROUTE_COUNT,
      signal,
    );
  if (!graphReady) return readPortfolioGraphRouteFingerprint(canvas, locale);
  let previous = '';
  let stablePasses = 0;
  let fingerprint = null;
  for (let pass = 0; pass < 12; pass++) {
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    fingerprint = readPortfolioGraphRouteFingerprint(canvas, locale);
    let serialized = JSON.stringify(fingerprint);
    stablePasses = serialized === previous ? stablePasses + 1 : 0;
    if (stablePasses >= 2) return fingerprint;
    previous = serialized;
  }
  return fingerprint;
}

function waitForLiveGraphGeometry(canvas, expectedNodeCount, expectedRouteCount, signal) {
  return new Promise((resolve) => {
    let observer = null;
    /** @type {ReturnType<typeof globalThis.setTimeout>|undefined} */
    let timeout;
    let finish = (ready) => {
      observer?.disconnect();
      globalThis.clearTimeout?.(timeout);
      signal?.removeEventListener?.('abort', onAbort);
      resolve(ready);
    };
    let onAbort = () => finish(false);
    let check = () => {
      let nodes = [...canvas.querySelectorAll('graph-node')];
      let paths = [...canvas.querySelectorAll('.sn-conn-path')];
      if (
        nodes.length === expectedNodeCount
        && paths.length === expectedRouteCount
        && nodes.every((node) => (node.offsetWidth || node._cachedW) > 0)
        && nodes.every((node) => (node.offsetHeight || node._cachedH) > 0)
      ) {
        finish(true);
      }
    };
    observer = new MutationObserver(check);
    observer.observe(canvas, { attributes: true, childList: true, subtree: true });
    signal?.addEventListener?.('abort', onAbort, { once: true });
    timeout = globalThis.setTimeout?.(() => finish(false), 15_000);
    check();
  });
}

function resolveVariant() {
  let locale = document.documentElement.lang || 'en';
  let widget = /** @type {any} */ (document.querySelector('cascade-theme-widget'));
  let theme = widget?.state?.mode === 'dark' ? 'dark' : 'light';
  let viewport = matchMedia('(max-width: 899px)').matches ? 'narrow' : 'wide';
  return { locale, theme, viewport };
}

function revealLiveGraph(panel, resolution) {
  panel.dataset.graphSnapshot = resolution;
  panel.querySelector('node-canvas')?.removeAttribute('data-snapshot-pending');
  let object = panel.querySelector('.portfolio-graph-snapshot');
  if (!object) return;
  object.setAttribute('data-removing', '');
  globalThis.setTimeout?.(() => object.remove(), 180);
}

function waitForFullLivePcb(canvas, expectedRouteCount, signal) {
  return new Promise((resolve) => {
    let observer = null;
    /** @type {ReturnType<typeof globalThis.setTimeout>|undefined} */
    let timeout;
    let finish = (ready) => {
      observer?.disconnect();
      globalThis.clearTimeout?.(timeout);
      signal?.removeEventListener?.('abort', onAbort);
      resolve(ready);
    };
    let onAbort = () => finish(false);
    let check = () => {
      let paths = [...canvas.querySelectorAll('.sn-conn-path')];
      let fullCount = paths.filter((path) => path.getAttribute('data-pcb-quality') === 'full').length;
      if (
        paths.length > 0
        && fullCount === paths.length
        && (!expectedRouteCount || paths.length === expectedRouteCount)
      ) {
        finish(true);
      }
    };
    observer = new MutationObserver(check);
    observer.observe(canvas, {
      attributes: true,
      attributeFilter: ['data-pcb-quality'],
      childList: true,
      subtree: true,
    });
    signal?.addEventListener?.('abort', onAbort, { once: true });
    timeout = globalThis.setTimeout?.(() => finish(false), 15_000);
    check();
  });
}

async function failClosed(panel, canvas, reason, expectedRouteCount, signal) {
  panel.dataset.graphSnapshot = 'live-pcb-pending';
  panel.dataset.graphSnapshotReason = reason;
  canvas.setTransientPathStyle?.('', 'portfolio-startup', {});
  canvas.invalidatePcbRouteSnapshot?.(reason);
  canvas.refreshConnections?.();
  let ready = await waitForFullLivePcb(canvas, expectedRouteCount, signal);
  if (ready) revealLiveGraph(panel, 'live-pcb');
  return {
    adopted: false,
    reason,
    resolution: ready ? 'live-pcb' : 'snapshot-retained',
  };
}

/**
 * @param {HTMLElement} panel
 * @param {any} canvas
 * @returns {object}
 */
export function createPortfolioGraphSnapshotRuntime(panel, canvas) {
  let abortController = null;
  let prepared = false;

  let prepare = () => {
    if (prepared) return;
    prepared = true;
    canvas.setAttribute('data-snapshot-pending', '');
    canvas.setTransientPathStyle?.('bezier', 'portfolio-startup', {});
    let placeholder = document.querySelector('.portfolio-graph-snapshot');
    if (placeholder && placeholder.parentElement !== panel) panel.prepend(placeholder);
  };

  let fail = async (reason, expectedRouteCount, signal) => {
    let receipt = await failClosed(panel, canvas, reason, expectedRouteCount, signal);
    prepared = false;
    return receipt;
  };

  return {
    prepare,
    async adopt() {
      abortController?.abort();
      abortController = new AbortController();
      prepare();
      try {
        let routeFingerprint = await settlePortfolioGraphForSnapshot(
          canvas,
          document.documentElement.lang || 'en',
          { signal: abortController.signal },
        );
        let manifestResponse = await fetch(new URL(MANIFEST_URL, document.baseURI), {
          signal: abortController.signal,
        });
        if (!manifestResponse.ok) {
          return fail('manifest-unavailable', 0, abortController.signal);
        }
        let manifest = await manifestResponse.json();
        let entry = selectPortfolioGraphSnapshotEntry(manifest, resolveVariant());
        if (!entry) {
          return fail('manifest-variant-missing', 0, abortController.signal);
        }
        let snapshotResponse = await fetch(new URL(entry.snapshot, document.baseURI), {
          signal: abortController.signal,
        });
        if (!snapshotResponse.ok) {
          return fail(
            'snapshot-unavailable',
            entry.routeCount,
            abortController.signal,
          );
        }
        let snapshot = await snapshotResponse.json();
        let binding = validatePortfolioGraphSnapshotBinding(snapshot, routeFingerprint);
        if (!binding.valid) {
          return fail(
            binding.reason,
            entry.routeCount,
            abortController.signal,
          );
        }
        let receipt = canvas.adoptPcbRouteSnapshot?.(binding.snapshot, { routeFingerprint });
        if (!receipt?.adopted) {
          return fail(
            receipt?.reason || 'provider-rejected',
            entry.routeCount,
            abortController.signal,
          );
        }
        canvas.setTransientPathStyle?.('', 'portfolio-startup', {});
        prepared = false;
        revealLiveGraph(panel, 'cached-pcb');
        return receipt;
      } catch (error) {
        if (error?.name === 'AbortError') return { adopted: false, reason: 'aborted' };
        return fail('runtime-error');
      }
    },
    stop() {
      abortController?.abort();
      abortController = null;
      if (prepared) canvas.setTransientPathStyle?.('', 'portfolio-startup', {});
      prepared = false;
      canvas.removeAttribute?.('data-snapshot-pending');
    },
  };
}

/**
 * Build-only capture seam used after the graph and fonts have settled.
 * @param {HTMLElement} panel
 * @param {any} canvas
 * @returns {Promise<object>}
 */
export async function capturePortfolioGraphRenderSnapshot(panel, canvas) {
  canvas.setTransientPathStyle?.('', 'portfolio-startup', {});
  canvas.setPathStyle?.('pcb');
  let routeFingerprint = await settlePortfolioGraphForSnapshot(
    canvas,
    document.documentElement.lang || 'en',
    { requireFullPcb: true },
  );
  let snapshot = canvas.capturePcbRouteSnapshot?.(routeFingerprint);
  let rect = panel.getBoundingClientRect();
  return {
    routeFingerprint,
    snapshot,
    rect: {
      x: roundMetric(rect.x),
      y: roundMetric(rect.y),
      width: roundMetric(rect.width),
      height: roundMetric(rect.height),
    },
  };
}
