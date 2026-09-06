import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseHTML } from 'linkedom';


// Install minimal browser globals once; modules use them at import/eval time.
function ensureGlobals() {
  const set = (name, value) => {
    if (!(name in globalThis)) {
      try { globalThis[name] = value; } catch { Object.defineProperty(globalThis, name, { value, configurable: true, writable: true }); }
    }
  };
  set('window', globalThis);
  set('navigator', {});
  set('customElements', { get: () => null, define: () => {}, whenDefined: () => Promise.resolve() });
  set('HTMLElement', function () {});
  set('location', { href: 'http://x/cv/' });
  set('history', { replaceState() {}, pushState() {} });
  class CSSStyleSheet { replaceSync() {} cssRules = []; }
  set('CSSStyleSheet', CSSStyleSheet);
}

async function loadAdapter() {
  ensureGlobals();
  const { document } = parseHTML('<!doctype html><html><body></body></html>');
  globalThis.document = document;
  const m = await import(new URL('../../src/static-pages/js/tour-player/index.js', import.meta.url).href);
  return m.createPanelActionAdapter;
}

function visibleRect() {
  return { x: 0, y: 0, width: 420, height: 600, left: 0, top: 0, right: 420, bottom: 600 };
}
const noop = () => {};
function el(extra = {}) {
  return Object.assign({ getBoundingClientRect: visibleRect, querySelector: () => null, querySelectorAll: () => [], contains: () => false, addEventListener: noop, removeEventListener: noop, style: {}, classList: { add: noop, remove: noop, contains: () => false }, dataset: {} }, extra);
}
function makeWorkspace({ graphOpen }) {
  const graphPanel = el({ dataset: { panelId: 'g' }, querySelector: (s) => (s === 'portfolio-graph-panel' ? null : null), prepareShowTarget: noop, observeGraphPanelVisibility: noop });
  const canvas = el();
  const viewerPanel = el();
  const layout = el({
    $: {
      layoutTree: { type: 'split', first: { type: 'panel', id: 'g', panelType: 'portfolio-graph', collapsed: false, behavior: { mobileDock: 'end' } }, second: null },
      drawerStartOpen: false,
      drawerEndOpen: graphOpen,
      drawerStartPanelId: '',
      drawerEndPanelId: graphOpen ? 'g' : '',
    },
    hasAttribute: (a) => a === 'drawer-mode-active' || (a === 'drawer-end-open' && graphOpen),
    querySelector: (s) => (s === 'portfolio-graph-panel' ? graphPanel : s === 'portfolio-viewer-panel' ? viewerPanel : null),
    openDrawer: noop, closeDrawer: noop,
  });
  const agentDock = el({
    ref: { layout },
    hasAttribute: () => false,
    querySelector: () => null,
    getChat: () => null,
  });
  const workspace = el({
    querySelector: (s) => {
      if (s === 'agent-dock-shell') return agentDock;
      if (s === '.portfolio-layout') return layout;
      if (s === 'portfolio-graph-panel') return graphPanel;
      if (s === 'portfolio-viewer-panel') return viewerPanel;
      if (s === 'node-canvas, sn-canvas-graph') return canvas;
      return null;
    },
  });
  return workspace;
}

test('adapter.awaitTarget: visible unresolved rejects; hidden graph defers (null)', async () => {
  const createPanelActionAdapter = await loadAdapter();
  const runtime = { entries: new Map(), selectedId: '', viewer: null };
  const action = { id: 'cv-show:cue:finale.history', target: 'portfolio.map.unresolved-node' };
  const context = { scrollOperation: false };

  const visibleWs = makeWorkspace({ graphOpen: true });
  const visibleAdapter = createPanelActionAdapter(visibleWs, runtime, {});
  await assert.rejects(
    visibleAdapter.awaitTarget({ action, context, signal: null }),
    (err) => /readiness timed out|ShowReadinessError|timed out/i.test(String(err?.message || err)),
    'visible unresolved target must reject (no false defer-success)',
  );

  const hiddenWs = makeWorkspace({ graphOpen: false });
  const hiddenAdapter = createPanelActionAdapter(hiddenWs, runtime, {});
  const hiddenResult = await hiddenAdapter.awaitTarget({ action, context, signal: null });
  assert.equal(hiddenResult, null, 'hidden graph map action defers (null target)');
}, { timeout: 20000 });
