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
function makeWorkspace({ graphOpen, rail = false, railExcluded = true }) {
  // The rail host marks a `swipeControl: none` panel and hides its node, so the
  // map stays closed on mobile even though the rail is the active projection.
  const graphNode = el({ hasAttribute: (a) => rail && railExcluded && a === 'mobile-panel-rail-excluded' });
  const graphPanel = el({ dataset: { panelId: 'g' }, querySelector: (s) => (s === 'portfolio-graph-panel' ? null : null), prepareShowTarget: noop, observeGraphPanelVisibility: noop, closest: () => graphNode });
  const canvas = el();
  const viewerPanel = el();
  const layout = el({
    $: {
      layoutTree: { type: 'split', first: { type: 'panel', id: 'g', panelType: 'portfolio-graph', collapsed: false, behavior: { mobileDock: 'end' } }, second: null },
      drawerStartOpen: false,
      drawerEndOpen: rail ? false : graphOpen,
      drawerStartPanelId: '',
      drawerEndPanelId: rail ? '' : (graphOpen ? 'g' : ''),
    },
    hasAttribute: (a) => !rail && (a === 'drawer-mode-active' || (a === 'drawer-end-open' && graphOpen)),
    querySelector: (s) => (s === 'portfolio-graph-panel' ? graphPanel : s === 'portfolio-viewer-panel' ? viewerPanel : null),
    openDrawer: noop, closeDrawer: noop,
  });
  const railLayout = el({
    hasAttribute: (a) => rail && a === 'mobile-panel-rail-enabled',
    scrollToPanelCalls: [],
    scrollToPanel(panelId) { this.scrollToPanelCalls.push(panelId); return true; },
  });
  const agentDock = el({
    ref: { layout: rail ? railLayout : layout },
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
  return { workspace, railLayout };
}

test('adapter.awaitTarget: visible unresolved rejects; hidden graph defers (null)', async () => {
  const createPanelActionAdapter = await loadAdapter();
  const runtime = { entries: new Map(), selectedId: '', viewer: null };
  const action = { id: 'cv-show:cue:finale.history', target: 'portfolio.map.unresolved-node' };
  const context = { scrollOperation: false };

  const visibleWs = makeWorkspace({ graphOpen: true }).workspace;
  const visibleAdapter = createPanelActionAdapter(visibleWs, runtime, {});
  await assert.rejects(
    visibleAdapter.awaitTarget({ action, context, signal: null }),
    (err) => /readiness timed out|ShowReadinessError|timed out/i.test(String(err?.message || err)),
    'visible unresolved target must reject (no false defer-success)',
  );

  const hiddenWs = makeWorkspace({ graphOpen: false }).workspace;
  const hiddenAdapter = createPanelActionAdapter(hiddenWs, runtime, {});
  const hiddenResult = await hiddenAdapter.awaitTarget({ action, context, signal: null });
  assert.equal(hiddenResult, null, 'hidden graph map action defers (null target)');
}, { timeout: 20000 });

test('rail mode keeps the swipe-excluded map deferred and reveals rail panels', async () => {
  const createPanelActionAdapter = await loadAdapter();
  const runtime = { entries: new Map(), selectedId: '', viewer: null };
  const action = { id: 'cv-show:cue:finale.history', target: 'portfolio.map.unresolved-node' };
  const context = { scrollOperation: false };
  globalThis.innerWidth = 390;
  try {
    const excluded = makeWorkspace({ graphOpen: true, rail: true });
    const excludedAdapter = createPanelActionAdapter(excluded.workspace, runtime, {});
    const excludedInspected = excludedAdapter.inspect({ action });
    assert.equal(excludedInspected.railMode, true, 'the dock rail is the active mobile projection');
    assert.equal(excludedInspected.railRevealed, false, 'a swipeControl: none panel is not a rail slide');
    assert.equal(excludedInspected.open, false, 'the hidden map stays closed under the rail');
    const excludedReveal = excludedAdapter.reveal({ action, inspected: excludedInspected });
    assert.equal(excludedReveal.mapDeferred, true, 'the map cue defers instead of forcing a reveal');
    assert.deepEqual(excluded.railLayout.scrollToPanelCalls, [], 'a deferred panel is never scrolled to');
    assert.equal(await excludedAdapter.awaitTarget({ action, context, signal: null }), null,
      'the deferred map reports success-by-deferral instead of timing the scene out');

    const included = makeWorkspace({ graphOpen: true, rail: true, railExcluded: false });
    const includedAdapter = createPanelActionAdapter(included.workspace, runtime, {});
    const includedInspected = includedAdapter.inspect({ action });
    assert.equal(includedInspected.railRevealed, true);
    assert.equal(includedInspected.open, true, 'a rail slide is revealed by scrolling to it');
    includedAdapter.reveal({ action, inspected: includedInspected });
    assert.deepEqual(included.railLayout.scrollToPanelCalls, ['g'],
      'the host Layout API owns the rail selection and snap position');
  } finally {
    delete globalThis.innerWidth;
  }
}, { timeout: 20000 });
