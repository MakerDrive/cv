import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  resolveCvShowPanelRevealState,
  shouldDeferMapAction,
} from '../../src/static-pages/js/tour-player/panelRevealPolicy.js';

test('hidden graph-targeted action defers (autonomous hidden map)', () => {
  assert.equal(shouldDeferMapAction({
    panelType: 'portfolio-graph',
    open: false,
    actionId: 'cv-show:cue:finale.map',
    target: 'projects/index',
  }), true);
  assert.equal(shouldDeferMapAction({
    panelType: 'portfolio-graph',
    open: false,
    actionId: 'cue-x',
    target: 'portfolio.map.historical-branch',
  }), true);
});

test('visible map with unresolved target must NOT falsely defer', () => {
  assert.equal(shouldDeferMapAction({
    panelType: 'portfolio-graph',
    open: true,
    actionId: 'cv-show:cue:finale.map',
    target: 'projects/index',
  }), false);
});

test('non-graph or non-map actions never defer as hidden map', () => {
  assert.equal(shouldDeferMapAction({
    panelType: 'portfolio-viewer',
    open: false,
    actionId: 'positioning.open',
    target: 'profile/photo',
  }), false);
  assert.equal(shouldDeferMapAction({
    panelType: 'portfolio-graph',
    open: false,
    actionId: 'positioning.open',
    target: 'profile/photo',
  }), false);
});

test('mobile primary panel is always open and never a drawer', () => {
  const state = resolveCvShowPanelRevealState({
    mobile: true,
    mobileDock: 'primary',
    panelId: 'viewer',
    drawerEndOpen: false,
    drawerStartOpen: false,
    visible: true,
  });
  assert.equal(state.open, true);
  assert.equal(state.dock, '');
  assert.equal(state.primary, true);
});

test('mobile viewer target does not open the end drawer when closed', () => {
  // Regression contract for the tour map auto-open: article/profile targets
  // live in the primary; a closed end drawer must stay closed.
  const state = resolveCvShowPanelRevealState({
    mobile: true,
    mobileDock: 'primary',
    panelId: 'viewer',
    drawerEndOpen: false,
    drawerStartOpen: false,
    visible: true,
  });
  assert.equal(state.open, true);
  assert.notEqual(state.dock, 'end');
});

test('mobile end drawer panel is closed while the drawer is closed', () => {
  const state = resolveCvShowPanelRevealState({
    mobile: true,
    mobileDock: 'end',
    panelId: 'graph',
    drawerEndOpen: false,
    activeEndPanelId: 'graph',
    visible: true,
  });
  assert.equal(state.open, false);
  assert.equal(state.dock, 'end');
});

test('mobile end drawer panel is open only when it is the active drawer panel', () => {
  const active = resolveCvShowPanelRevealState({
    mobile: true,
    mobileDock: 'end',
    panelId: 'graph',
    drawerEndOpen: true,
    activeEndPanelId: 'graph',
  });
  assert.equal(active.open, true);
  const otherActive = resolveCvShowPanelRevealState({
    mobile: true,
    mobileDock: 'end',
    panelId: 'graph',
    drawerEndOpen: true,
    activeEndPanelId: 'theme',
  });
  assert.equal(otherActive.open, false);
});

test('mobile start drawer follows the same rule', () => {
  const state = resolveCvShowPanelRevealState({
    mobile: true,
    mobileDock: 'start',
    panelId: 'tree',
    drawerStartOpen: false,
  });
  assert.equal(state.open, false);
  assert.equal(state.dock, 'start');
});

test('desktop open state follows visible and collapsed flags', () => {
  assert.equal(resolveCvShowPanelRevealState({
    mobile: false,
    visible: true,
    collapsed: false,
  }).open, true);
  assert.equal(resolveCvShowPanelRevealState({
    mobile: false,
    visible: true,
    collapsed: true,
  }).open, false);
  assert.equal(resolveCvShowPanelRevealState({
    mobile: false,
    visible: false,
  }).open, false);
});
