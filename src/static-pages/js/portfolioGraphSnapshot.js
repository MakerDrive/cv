import { createRuntimeAssetUrl } from './runtimeAssetUrl.js';
import {
  createPortfolioGraphRouteFingerprint,
  selectPortfolioGraphSnapshotEntry,
  validatePortfolioGraphSnapshotBinding,
} from '../data/portfolioGraphSnapshot.js';

const MANIFEST_URL = 'portfolio-graph-snapshots/manifest.json';

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
 * @param {string} locale
 * @param {{requireFullPcb?: boolean, signal?: AbortSignal, nodeCount: number, routeCount: number}} options
 * @returns {Promise<object>}
 */
export async function settlePortfolioGraphForSnapshot(
  canvas,
  locale,
  { requireFullPcb = false, signal, nodeCount, routeCount },
) {
  await customElements.whenDefined('cascade-theme-widget');
  await document.fonts?.ready;
  let graphReady = requireFullPcb
    ? await waitForFullLivePcb(canvas, routeCount, signal)
    : await waitForLiveGraphGeometry(
      canvas,
      nodeCount,
      routeCount,
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
  return { locale, theme, viewport: 'wide' };
}

function revealLiveGraph(panel, resolution) {
  panel.dataset.graphSnapshot = resolution;
  panel.querySelector('node-canvas')?.removeAttribute('data-snapshot-pending');
  panel.querySelector('.portfolio-graph-snapshot')?.remove();
}

function waitForFullLivePcb(canvas, expectedRouteCount, signal) {
  return new Promise((resolve) => {
    let frame = 0;
    let previous = '';
    let progress = '';
    let stablePasses = 0;
    /** @type {ReturnType<typeof globalThis.setTimeout>|undefined} */
    let timeout;
    let finish = (ready) => {
      cancelAnimationFrame(frame);
      globalThis.clearTimeout(timeout);
      signal?.removeEventListener('abort', onAbort);
      resolve(ready);
    };
    let onAbort = () => finish(false);
    let check = () => {
      if (signal?.aborted) return finish(false);
      let paths = [...canvas.querySelectorAll('.sn-conn-path')];
      let geometry = JSON.stringify({
        nodes: getGraphNodes(canvas),
        paths: paths.map((path) => [
          path.getAttribute('data-conn-id'),
          path.getAttribute('data-pcb-quality'),
          path.getAttribute('d'),
        ]),
      });
      if (geometry !== progress) {
        progress = geometry;
        globalThis.clearTimeout(timeout);
        timeout = globalThis.setTimeout(() => finish(false), 15_000);
      }
      let nodes = [...canvas.querySelectorAll('graph-node')];
      let cardsReady = nodes.length > 0 && nodes.every((node) => (
        node.querySelector('.sn-node-label')?.textContent.trim()
          === (node.getAttribute('node-label') || '').trim()
        && !node.querySelector('.sn-node-summary')?.textContent.includes('{{')
      ));
      let ready = cardsReady
        && document.fonts.status === 'loaded'
        && !canvas.hasAttribute('data-viewport-animating')
        && paths.length === expectedRouteCount
        && paths.length > 0
        && paths.every((path) => path.getAttribute('data-pcb-quality') === 'full');
      stablePasses = ready && geometry === previous ? stablePasses + 1 : 0;
      previous = geometry;
      if (stablePasses >= 2) return finish(true);
      frame = requestAnimationFrame(check);
    };
    signal?.addEventListener('abort', onAbort, { once: true });
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
 * @param {any} editor
 * @returns {object}
 */
export function createPortfolioGraphSnapshotRuntime(panel, canvas, editor) {
  let abortController = null;
  let prepared = false;

  let prepare = () => {
    if (prepared) return;
    prepared = true;
    canvas.setAttribute('data-snapshot-pending', '');
    canvas.setTransientPathStyle?.('bezier', 'portfolio-startup', {});
    let placeholder = document.querySelector('.portfolio-graph-snapshot');
    if (placeholder) {
      if (placeholder.parentElement !== panel) panel.prepend(placeholder);
      let { locale, theme } = resolveVariant();
      if (locale !== 'ru' || theme !== 'light') {
        placeholder.setAttribute('src', createRuntimeAssetUrl(
          `portfolio-graph-snapshots/initial-${locale}-${theme}.webp`,
        ).href);
      }
    }
  };

  let fail = async (reason, signal) => {
    let receipt = await failClosed(
      panel, canvas, reason, editor.getConnections().length, signal,
    );
    prepared = false;
    return receipt;
  };

  return {
    prepare,
    async adopt() {
      abortController?.abort();
      abortController = new AbortController();
      let { signal } = abortController;
      prepare();
      try {
        let routeFingerprint = await settlePortfolioGraphForSnapshot(
          canvas,
          document.documentElement.lang || 'en',
          {
            signal,
            nodeCount: editor.getNodes().length,
            routeCount: editor.getConnections().length,
          },
        );
        let manifestResponse = await fetch(createRuntimeAssetUrl(MANIFEST_URL), {
          signal,
        });
        if (!manifestResponse.ok) {
          return fail('manifest-unavailable', signal);
        }
        let manifest = await manifestResponse.json();
        let entry = selectPortfolioGraphSnapshotEntry(manifest, resolveVariant());
        if (!entry) {
          return fail('manifest-variant-missing', signal);
        }
        let snapshotResponse = await fetch(createRuntimeAssetUrl(entry.snapshot), {
          signal,
        });
        if (!snapshotResponse.ok) {
          return fail(
            'snapshot-unavailable',
            signal,
          );
        }
        let snapshot = await snapshotResponse.json();
        let binding = validatePortfolioGraphSnapshotBinding(snapshot, routeFingerprint);
        if (!binding.valid) {
          return fail(
            binding.reason,
            signal,
          );
        }
        let receipt = canvas.adoptPcbRouteSnapshot?.(binding.snapshot, { routeFingerprint });
        if (!receipt?.adopted) {
          return fail(
            receipt?.reason || 'provider-rejected',
            signal,
          );
        }
        canvas.setTransientPathStyle?.('', 'portfolio-startup', {});
        let ready = await waitForFullLivePcb(
          canvas, editor.getConnections().length, signal,
        );
        if (!ready) return { adopted: false, reason: 'live-pcb-not-ready' };
        prepared = false;
        revealLiveGraph(panel, 'cached-pcb');
        return receipt;
      } catch (error) {
        if (error?.name === 'AbortError') return { adopted: false, reason: 'aborted' };
        return fail('runtime-error', signal);
      }
    },
    stop() {
      abortController?.abort();
      abortController = null;
      if (prepared) canvas.setTransientPathStyle?.('', 'portfolio-startup', {});
      prepared = false;
      canvas.removeAttribute?.('data-snapshot-pending');
      panel.querySelector('.portfolio-graph-snapshot')?.remove();
    },
  };
}

/**
 * @param {HTMLElement} panel
 * @param {any} canvas
 * @param {any} editor
 * @returns {Promise<object>}
 */
export async function capturePortfolioGraphRenderSnapshot(panel, canvas, editor) {
  canvas.setTransientPathStyle?.('', 'portfolio-startup', {});
  canvas.setPathStyle?.('pcb');
  let routeFingerprint = await settlePortfolioGraphForSnapshot(
    canvas,
    document.documentElement.lang || 'en',
    {
      requireFullPcb: true,
      nodeCount: editor.getNodes().length,
      routeCount: editor.getConnections().length,
    },
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
