import assert from 'node:assert/strict';
import test from 'node:test';

import {
  CV_LIVE_INSPECT_TOOL_NAME,
  createCvLiveObservation,
} from '../../src/static-pages/js/live-observation/index.js';

const REAL_ELEMENT_METHODS = new WeakSet();

function layoutNode(panelId, { collapsed = false, connected = true, visible = true } = {}) {
  const attrs = new Set(['layout-node']);
  if (collapsed) attrs.add('collapsed');
  const hosted = { localName: `${panelId}-panel` };
  return {
    localName: 'layout-node',
    dataset: { panelId: '' },
    id: '',
    children: [],
    isConnected: connected,
    hasAttribute: (name) => attrs.has(name),
    getBoundingClientRect: () => ({ width: visible ? 300 : 0, height: visible ? 400 : 0 }),
    querySelectorAll: (selector) => (selector === '*' ? [hosted] : []),
  };
}

function treeRow(treeId, { selected = false, visible = true } = {}) {
  return {
    dataset: { treeId },
    getAttribute: (name) => (name === 'aria-selected' ? String(selected) : null),
    isConnected: true,
    getBoundingClientRect: () => ({ width: visible ? 220 : 0, height: visible ? 28 : 0 }),
    querySelectorAll: () => [],
  };
}

function fakeDocument({ panels = [], rows = [], withLayout = true } = {}) {
  return {
    querySelectorAll: (selector) => {
      if (selector === 'layout-node' || selector === 'layout-node[node-type="panel"]') return panels;
      if (selector === '.sn-tree-row[data-tree-id]') return rows;
      return [];
    },
    querySelector: (selector) => {
      if (selector === 'panel-layout') return withLayout ? {} : null;
      return null;
    },
    addEventListener() {},
    removeEventListener() {},
  };
}

test('panel observation reports state and available transitions from collapsed state', () => {
  const doc = fakeDocument({ panels: [layoutNode('tree', { collapsed: false })] });
  const surface = createCvLiveObservation({ document: doc });
  const result = surface.registry.observe({ targetId: 'panel.tree' });
  assert.equal(result.observation.targetId, 'panel.tree');
  assert.equal(result.observation.presence, 'present');
  assert.equal(result.observation.state.collapsed, false);
  assert.deepEqual([...result.observation.capabilities.supported], ['open', 'close']);
  assert.deepEqual([...result.observation.capabilities.available], ['close']);
  assert.deepEqual(result.observation.capabilities.unavailable, [
    { id: 'open', reason: 'already-open' },
  ]);
  surface.dispose();
});

test('collapsed panel flips available transitions to open-only', () => {
  const doc = fakeDocument({ panels: [layoutNode('graph', { collapsed: true })] });
  const surface = createCvLiveObservation({ document: doc });
  const { observation } = surface.registry.observe({ targetId: 'panel.graph' });
  assert.equal(observation.state.collapsed, true);
  assert.deepEqual([...observation.capabilities.available], ['open']);
  assert.deepEqual(observation.capabilities.unavailable, [
    { id: 'close', reason: 'already-closed' },
  ]);
  surface.dispose();
});

test('hidden panel (zero-size) reports presence hidden', () => {
  const doc = fakeDocument({ panels: [layoutNode('viewer', { visible: false })] });
  const surface = createCvLiveObservation({ document: doc });
  const { observation } = surface.registry.observe({ targetId: 'panel.viewer' });
  assert.equal(observation.presence, 'hidden');
  surface.dispose();
});

test('known-layout but absent panel id reports unmounted, unknown reports unknown', () => {
  const doc = fakeDocument({ panels: [layoutNode('tree')] });
  const surface = createCvLiveObservation({ document: doc });
  const unmounted = surface.registry.observe({ targetId: 'panel.media' });
  assert.equal(unmounted.observation.presence, 'unmounted');
  const noLayout = createCvLiveObservation({ document: fakeDocument({ withLayout: false }) });
  const unknown = noLayout.registry.observe({ targetId: 'panel.media' });
  // No layout at all AND no observation produced → registry-level 'unknown'.
  assert.equal(unknown.observation.presence, 'unknown');
  surface.dispose();
  noLayout.dispose();
});

test('tree rows expose tree.<id> with selection state and stable identity', () => {
  const doc = fakeDocument({
    rows: [
      treeRow('projects/symbiote-engine', { selected: true }),
      treeRow('projects/photopizza'),
    ],
  });
  const surface = createCvLiveObservation({ document: doc });
  const selected = surface.registry.observe({ targetId: 'tree.projects/symbiote-engine' });
  assert.equal(selected.observation.state.selected, true);
  assert.deepEqual([...selected.observation.capabilities.available], ['deselect']);
  const list = surface.registry.observe();
  const ids = list.observations.map((entry) => entry.targetId);
  assert.deepEqual(ids.sort(), ['tree.projects/photopizza', 'tree.projects/symbiote-engine']);
  surface.dispose();
});

test('remount stability: a re-created row with the same tree id keeps identity', () => {
  let rows = [treeRow('projects/photopizza', { selected: false })];
  const doc = fakeDocument({ rows });
  const surface = createCvLiveObservation({ document: doc });
  const before = surface.registry.observe({ targetId: 'tree.projects/photopizza' });
  // Simulate a remount: new element instance, same semantic tree id.
  rows = [treeRow('projects/photopizza', { selected: false })];
  doc.querySelectorAll = (selector) => (selector === '.sn-tree-row[data-tree-id]' ? rows : []);
  const after = surface.registry.observe({ targetId: 'tree.projects/photopizza' });
  assert.equal(before.observation.targetId, after.observation.targetId);
  assert.equal(after.observation.presence, 'present');
  surface.dispose();
});

test('state change by an external actor is visible on re-inspection', () => {
  let collapsed = false;
  const panels = [{
    localName: 'layout-node',
    dataset: { panelId: 'graph' },
    isConnected: true,
    hasAttribute: (name) => name === 'collapsed' && collapsed,
    getBoundingClientRect: () => ({ width: 300, height: 400 }),
  }];
  const doc = fakeDocument({ panels });
  const surface = createCvLiveObservation({ document: doc });
  const before = surface.registry.observe({ targetId: 'panel.graph' });
  assert.equal(before.observation.state.collapsed, false);
  // External actor (user/test harness) collapses the panel.
  collapsed = true;
  const after = surface.registry.observe({ targetId: 'panel.graph' });
  assert.equal(after.observation.state.collapsed, true);
  assert.deepEqual([...after.observation.capabilities.available], ['open']);
  surface.dispose();
});

test('live inspect tool descriptor is read-only and carries the generic schema', () => {
  const surface = createCvLiveObservation({ document: fakeDocument({}) });
  assert.equal(surface.descriptor.name, CV_LIVE_INSPECT_TOOL_NAME);
  assert.equal(surface.descriptor.annotations.readOnlyHint, true);
  assert.equal(surface.descriptor.annotations.domain, 'live-application-state');
  assert.equal(surface.descriptor.annotations.schemaVersion, 'symbiote-webmcp-live-observation-v1');
  assert.deepEqual(Object.keys(surface.descriptor.inputSchema.properties), ['targetId']);
  surface.dispose();
});

test('read-only guarantee: providers do not mutate the document', () => {
  const panel = layoutNode('tree');
  const before = JSON.stringify([
    [...Object.keys(panel)].sort(),
    panel.dataset.panelId,
  ]);
  const doc = fakeDocument({ panels: [panel] });
  const surface = createCvLiveObservation({ document: doc });
  surface.registry.observe();
  surface.registry.observe({ targetId: 'panel.tree' });
  assert.equal(JSON.stringify([
    [...Object.keys(panel)].sort(),
    panel.dataset.panelId,
  ]), before);
  surface.dispose();
});

test('observations never leak CSS selectors or DOM paths', () => {
  const doc = fakeDocument({
    panels: [layoutNode('tree')],
    rows: [treeRow('projects/photopizza')],
  });
  const surface = createCvLiveObservation({ document: doc });
  const dump = JSON.stringify(surface.registry.observe());
  assert.ok(!dump.includes('querySelector'), 'no DOM query leakage');
  assert.ok(!dump.includes('.sn-tree-row'), 'no CSS class leakage');
  assert.ok(!dump.includes('getBoundingClientRect'), 'no geometry leakage');
  surface.dispose();
});
