import assert from 'node:assert/strict';
import test from 'node:test';

import { createNodeCanvasRenderSnapshot } from 'symbiote-ui/manifest';
import {
  PORTFOLIO_GRAPH_SNAPSHOT_MANIFEST_SCHEMA,
  PORTFOLIO_GRAPH_SNAPSHOT_VISUAL_LAYER,
  createPortfolioGraphConnectionId,
  createPortfolioGraphRouteFingerprint,
  hashPortfolioGraphSnapshotValue,
  selectPortfolioGraphSnapshotEntry,
  validatePortfolioGraphSnapshotBinding,
  validatePortfolioGraphSnapshotManifest,
} from '../../src/static-pages/data/portfolioGraphSnapshot.js';
import {
  createPortfolioGraphSnapshotRuntime,
  readPortfolioGraphRouteFingerprint,
} from '../../src/static-pages/js/portfolioGraphSnapshot.js';

function createFingerprint(overrides = {}) {
  return createPortfolioGraphRouteFingerprint({
    canonicalGraph: { nodes: ['a', 'b'], connections: ['a-b'] },
    localeContent: { locale: 'ru', labels: ['А', 'Б'] },
    nodePositions: [{ id: 'a', x: 0, y: 0 }],
    nodeSizes: [{ id: 'a', width: 10, height: 10 }],
    fontMetrics: [{ id: 'a', font: '10px sans-serif' }],
    ...overrides,
  });
}

function createSnapshot(routeFingerprint) {
  return createNodeCanvasRenderSnapshot({
    routeFingerprint,
    nodeRects: [{ id: 'a', x: 0, y: 0, width: 10, height: 10 }],
    routes: [{
      connectionId: 'a-b',
      signature: 'a-b:0,0:10,10',
      path: 'M 0 0 L 10 10',
      points: [{ x: 0, y: 0 }, { x: 10, y: 10 }],
    }],
  });
}

test('snapshot runtime pre-arms an invisible cheap path before editor binding', (t) => {
  let previousDocument = globalThis.document;
  globalThis.document = { querySelector: () => null };
  t.after(() => {
    globalThis.document = previousDocument;
  });
  let calls = [];
  let canvas = {
    setAttribute: (name, value) => calls.push(['attribute', name, value]),
    setTransientPathStyle: (style, source) => calls.push(['path-style', style, source]),
  };
  let panel = {};
  let runtime = createPortfolioGraphSnapshotRuntime(panel, canvas);

  runtime.prepare();
  runtime.prepare();

  assert.deepEqual(calls, [
    ['attribute', 'data-snapshot-pending', ''],
    ['path-style', 'bezier', 'portfolio-startup'],
  ]);
});

test('graph snapshot hashing is stable across object key order and changes with RU content', () => {
  assert.equal(
    hashPortfolioGraphSnapshotValue({ b: 2, a: 1 }),
    hashPortfolioGraphSnapshotValue({ a: 1, b: 2 }),
  );
  assert.notEqual(
    createFingerprint().localeContent,
    createFingerprint({ localeContent: { locale: 'ru', labels: ['А', 'В'] } }).localeContent,
  );
});

test('connection IDs are deterministic and distinguish semantic edges', () => {
  let edge = { from: 'projects/maximo', to: 'skills/rnd', kind: 'uses' };
  assert.equal(createPortfolioGraphConnectionId(edge), createPortfolioGraphConnectionId({
    kind: 'uses',
    to: 'skills/rnd',
    from: 'projects/maximo',
  }));
  assert.notEqual(
    createPortfolioGraphConnectionId(edge),
    createPortfolioGraphConnectionId({ ...edge, kind: 'produces' }),
  );
  assert.match(createPortfolioGraphConnectionId(edge), /^conn_[a-f0-9]{16}$/);
});

test('manifest selects the exact RU viewport and theme variant', () => {
  let entry = {
    locale: 'ru',
    theme: 'dark',
    viewport: 'wide',
    preview: `portfolio-graph-snapshots/${'a'.repeat(64)}.webp`,
    previewNodeIds: ['a'],
    width: 600,
    height: 400,
    snapshot: `portfolio-graph-snapshots/${'b'.repeat(64)}.snapshot.json`,
    routeFingerprint: createFingerprint(),
  };
  let manifest = {
    schema: PORTFOLIO_GRAPH_SNAPSHOT_MANIFEST_SCHEMA,
    visualLayer: PORTFOLIO_GRAPH_SNAPSHOT_VISUAL_LAYER,
    entries: [entry],
  };
  assert.equal(validatePortfolioGraphSnapshotManifest(manifest).valid, true);
  assert.equal(validatePortfolioGraphSnapshotManifest({
    ...manifest, entries: [{ ...entry, previewNodeIds: [] }],
  }).valid, false);
  assert.equal(
    validatePortfolioGraphSnapshotManifest({ ...manifest, visualLayer: 'full-raster' }).reason,
    'manifest-visual-layer',
  );
  assert.equal(
    selectPortfolioGraphSnapshotEntry(manifest, {
      locale: 'ru',
      theme: 'dark',
      viewport: 'wide',
    })?.snapshot,
    entry.snapshot,
  );
  assert.equal(selectPortfolioGraphSnapshotEntry(manifest, {
    locale: 'en',
    theme: 'dark',
    viewport: 'wide',
  }), null);
});

test('snapshot binding accepts the full fingerprint and rejects locale drift', () => {
  let fingerprint = createFingerprint();
  let snapshot = createSnapshot(fingerprint);
  assert.equal(validatePortfolioGraphSnapshotBinding(snapshot, fingerprint).valid, true);
  let drifted = createFingerprint({ localeContent: { locale: 'en', labels: ['A', 'B'] } });
  assert.deepEqual(validatePortfolioGraphSnapshotBinding(snapshot, drifted), {
    valid: false,
    reason: 'route-fingerprint-mismatch',
    snapshot: null,
  });
});

test('route fingerprint retains logical geometry when the viewport is transformed', (t) => {
  let previousGetComputedStyle = globalThis.getComputedStyle;
  let fontMetrics = {
    fontFamily: 'sans-serif',
    fontSize: '12px',
    fontWeight: '400',
    lineHeight: '18px',
    letterSpacing: '0px',
  };
  globalThis.getComputedStyle = () => fontMetrics;
  t.after(() => { globalThis.getComputedStyle = previousGetComputedStyle; });
  let attributes = {
    'node-id': 'a',
    'node-type': 'asset',
    'node-category': 'data',
    'node-shape': 'rect',
    'node-label': 'Node A',
  };
  let viewport = { x: 700, y: 300, width: 240, height: 160 };
  let node = {
    style: { transform: 'translate3d(25px, -10px, 0px)' },
    offsetWidth: 120,
    offsetHeight: 80,
    textContent: ' Node   A ',
    getAttribute: (name) => attributes[name] || '',
    getBoundingClientRect: () => viewport,
  };
  let canvas = {
    querySelectorAll: (selector) => selector === 'graph-node'
      ? [node]
      : [{ getAttribute: () => 'a-b' }],
  };
  let expected = createPortfolioGraphRouteFingerprint({
    canonicalGraph: {
      nodes: [{ id: 'a', type: 'asset', category: 'data', shape: 'rect' }],
      connectionIds: ['a-b'],
    },
    localeContent: {
      locale: 'en',
      nodes: [{ id: 'a', label: 'Node A', text: 'Node A' }],
    },
    nodePositions: [{ id: 'a', x: 25, y: -10 }],
    nodeSizes: [{ id: 'a', width: 120, height: 80 }],
    fontMetrics: [{ id: 'a', ...fontMetrics }],
  });
  assert.deepEqual(readPortfolioGraphRouteFingerprint(canvas, 'en'), expected);
  viewport = { x: 0, y: 0, width: 60, height: 40 };
  assert.deepEqual(readPortfolioGraphRouteFingerprint(canvas, 'en'), expected);
  node.offsetWidth = 121;
  assert.notEqual(readPortfolioGraphRouteFingerprint(canvas, 'en').nodeSizes, expected.nodeSizes);
});
