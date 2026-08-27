import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
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
import { createPortfolioGraphSnapshotRuntime } from '../../src/static-pages/js/portfolioGraphSnapshot.js';

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
    viewport: 'narrow',
    svg: `portfolio-graph-snapshots/${'a'.repeat(64)}.svg`,
    snapshot: `portfolio-graph-snapshots/${'b'.repeat(64)}.snapshot.json`,
    routeFingerprint: createFingerprint(),
  };
  let manifest = {
    schema: PORTFOLIO_GRAPH_SNAPSHOT_MANIFEST_SCHEMA,
    visualLayer: PORTFOLIO_GRAPH_SNAPSHOT_VISUAL_LAYER,
    entries: [entry],
  };
  assert.equal(validatePortfolioGraphSnapshotManifest(manifest).valid, true);
  assert.equal(
    validatePortfolioGraphSnapshotManifest({ ...manifest, visualLayer: 'full-raster' }).reason,
    'manifest-visual-layer',
  );
  assert.equal(
    selectPortfolioGraphSnapshotEntry(manifest, {
      locale: 'ru',
      theme: 'dark',
      viewport: 'narrow',
    })?.snapshot,
    entry.snapshot,
  );
  assert.equal(selectPortfolioGraphSnapshotEntry(manifest, {
    locale: 'en',
    theme: 'dark',
    viewport: 'narrow',
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

test('runtime snapshot fingerprint uses intrinsic canvas geometry and retains PCB fallback', async () => {
  let source = await readFile(new URL('../../src/static-pages/js/portfolioGraphSnapshot.js', import.meta.url), 'utf8');
  assert.match(source, /node\.offsetWidth \|\| node\._cachedW/);
  assert.match(source, /node\.offsetHeight \|\| node\._cachedH/);
  assert.match(source, /node\.style\?\.transform/);
  assert.match(source, /translate\(\?:3d\)\?/);
  assert.doesNotMatch(source, /let rect = node\.getBoundingClientRect\(\)/);
  assert.doesNotMatch(source, /scrollWidth|scrollHeight/);
  assert.match(source, /fontFamily: style\.fontFamily/);
  assert.match(source, /fontSize: style\.fontSize/);
  assert.doesNotMatch(source, /setTransientPathStyle\?\.\('straight', 'portfolio-startup'/);
  assert.match(source, /waitForLiveGraphGeometry\(/);
  assert.match(source, /requireFullPcb: true/);
  assert.match(source, /waitForFullLivePcb\(canvas, expectedRouteCount, signal\)/);
  assert.match(source, /revealLiveGraph\(panel, 'live-pcb'\)/);
  let workspace = await readFile(new URL('../../src/static-pages/js/index.js', import.meta.url), 'utf8');
  assert.doesNotMatch(workspace, /setProgressiveConnectionRendering\?\.\(false/);
  let page = await readFile(new URL('../../src/static-pages/portfolioPage.js', import.meta.url), 'utf8');
  assert.match(page, /<img[\s\S]*class="portfolio-graph-snapshot"[\s\S]*aria-hidden="true"/);
  assert.match(page, /data-graph-visual-layer="connections-only"/);
  assert.doesNotMatch(page, /<object[\s\S]*class="portfolio-graph-snapshot"/);
  let css = await readFile(new URL('../../src/static-pages/css/index.css.js', import.meta.url), 'utf8');
  assert.match(css, /portfolio-canvas\[data-snapshot-pending\] \.sn-connections/);
});

test('six measured subpixel nodes are stabilized without weakening the exact fingerprint', async () => {
  let source = await readFile(new URL('../../src/static-pages/css/index.css.js', import.meta.url), 'utf8');
  for (let nodeId of [
    'media/autobox-v1/ims/spinner',
    'media/autobox-v1/youtube/FugBzpZqXZ0',
    'media/autobox-v1/youtube/us3vQHuTYPw',
    'projects/photopizza-remote',
    'projects/photosnail-public',
    'pulse/terminal-x-mcp-terminal-execution-state',
  ]) {
    assert.match(source, new RegExp(`node-id=\\"${nodeId.replaceAll('/', '\\/')}\\"`));
  }
  assert.match(source, /padding-block-end: 0\.5px/);
  assert.match(source, /padding-inline-end: 0\.5px/);
  assert.doesNotMatch(source, /route-fingerprint-tolerance|Math\.(?:floor|ceil)\([^)]*(?:width|height)/);
});

test('narrow snapshot capture opens the graph panel in its owning layout, not the Agent dock', async () => {
  let source = await readFile(
    new URL('../../scripts/render-portfolio-graph-snapshots.js', import.meta.url),
    'utf8',
  );
  assert.match(source, /panel\.closest\('panel-layout'\)/);
  assert.doesNotMatch(source, /document\.querySelector\('panel-layout'\)/);
});
