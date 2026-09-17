import assert from 'node:assert/strict';
import test from 'node:test';

import {
  CV_LIVE_ENSURE_TOOL_NAME,
  createCvLiveEnsure,
} from '../../src/static-pages/js/live-observation/index.js';

function layoutNode(panelId, { collapsed = false, layout = null } = {}) {
  const state = { collapsed };
  return {
    localName: 'layout-node',
    nodeType: 'panel',
    dataset: { panelId: '' },
    id: '',
    children: [],
    isConnected: true,
    hasAttribute: (name) => name === 'collapsed' && state.collapsed,
    getBoundingClientRect: () => ({ width: 300, height: 400 }),
    querySelectorAll: (selector) => (selector === '*' ? [{ localName: `${panelId}-panel` }] : []),
    closest: (selector) => (selector === 'panel-layout' ? layout : null),
    __state: state,
  };
}

function fakeLayout(nodes) {
  const calls = [];
  return {
    calls,
    openPanel(panelType) {
      calls.push(['openPanel', panelType]);
      for (const node of nodes) {
        if (node.__state && node.__state.collapsed) node.__state.collapsed = false;
      }
    },
    closeUiPanel(panelType) {
      calls.push(['closeUiPanel', panelType]);
      for (const node of nodes) {
        if (node.__state && !node.__state.collapsed) node.__state.collapsed = true;
      }
    },
  };
}

function fakeDocument({ panels = [], layout = null } = {}) {
  return {
    querySelectorAll: (selector) => (
      selector === 'layout-node[node-type="panel"]' ? panels : []
    ),
    querySelector: () => (selector === 'panel-layout' ? layout : null),
    addEventListener() {},
    removeEventListener() {},
  };
}

test('ensure(panel.graph, { collapsed: false }) opens the panel through the public layout API', async () => {
  const nodes = [layoutNode('graph', { collapsed: true })];
  const layout = fakeLayout(nodes);
  for (const node of nodes) node.closest = (selector) => (selector === 'panel-layout' ? layout : null);
  const surface = createCvLiveEnsure({ document: fakeDocument({ panels: nodes, layout }) });
  const result = await surface.controller.ensure('panel.graph', { collapsed: false });
  assert.equal(result.status, 'achieved');
  assert.deepEqual(layout.calls, [['openPanel', 'graph']]);
  surface.dispose();
});

test('already-satisfied panel state never touches the layout', async () => {
  const nodes = [layoutNode('graph', { collapsed: false })];
  const layout = fakeLayout(nodes);
  for (const node of nodes) node.closest = () => layout;
  const surface = createCvLiveEnsure({ document: fakeDocument({ panels: nodes, layout }) });
  const result = await surface.controller.ensure('panel.graph', { collapsed: false });
  assert.equal(result.status, 'already-satisfied');
  assert.deepEqual(layout.calls, []);
});

test('close transition collapses via closeUiPanel', async () => {
  const nodes = [layoutNode('viewer', { collapsed: false })];
  const layout = fakeLayout(nodes);
  for (const node of nodes) node.closest = () => layout;
  const surface = createCvLiveEnsure({ document: fakeDocument({ panels: nodes, layout }) });
  const result = await surface.controller.ensure('panel.viewer', { collapsed: true });
  assert.equal(result.status, 'achieved');
  assert.deepEqual(layout.calls, [['closeUiPanel', 'viewer']]);
});

test('unknown target reports target-unknown and invokes nothing', async () => {
  const layout = fakeLayout([]);
  const surface = createCvLiveEnsure({ document: fakeDocument({ panels: [], layout }) });
  const result = await surface.controller.ensure('panel.missing', { collapsed: false });
  assert.equal(result.status, 'target-unknown');
  assert.deepEqual(layout.calls, []);
});

test('tree targets stay read-only: no invoker claims select/deselect', async () => {
  // Tree capabilities advertise transitions but no effects, so ensure must
  // refuse to guess — the no-transition path is the guarded behavior for
  // non-panel targets until semantic invokers exist for them.
  const rows = [{
    dataset: { treeId: 'projects/photopizza' },
    getAttribute: () => 'false',
    isConnected: true,
    getBoundingClientRect: () => ({ width: 200, height: 24 }),
    querySelectorAll: () => [],
  }];
  const doc = {
    querySelectorAll: (selector) => (
      selector === '.sn-tree-row[data-tree-id]' ? rows : []
    ),
    querySelector: () => null,
    addEventListener() {},
    removeEventListener() {},
  };
  const surface = createCvLiveEnsure({ document: doc });
  const result = await surface.controller.ensure('tree.projects/photopizza', { selected: true });
  assert.equal(result.status, 'no-transition');
  surface.dispose();
});

test('live ensure descriptor exposes the mutating contract', () => {
  const surface = createCvLiveEnsure({ document: fakeDocument({}) });
  assert.equal(surface.descriptor.name, CV_LIVE_ENSURE_TOOL_NAME);
  assert.equal(surface.descriptor.annotations.readOnlyHint, false);
  assert.deepEqual(surface.descriptor.inputSchema.required, ['targetId', 'state']);
  surface.dispose();
});
