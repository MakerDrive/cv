import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseHTML } from 'linkedom';
import {
  resolveCvShowGestureClear,
  pointerAffordanceFromPath,
} from '../../src/static-pages/js/tour-player/gestureClearPolicy.js';

function pathOf(target) {
  const path = [];
  let node = target;
  while (node) { path.push(node); node = node.parentNode; }
  return path;
}

function decisionFor(target) {
  const path = pathOf(target);
  const affordance = pointerAffordanceFromPath(path);
  return resolveCvShowGestureClear({
    type: 'pointerdown',
    button: 0,
    ...affordance,
  });
}

test('neutral non-actionable node inside an OPEN drawer keeps marker', () => {
  const { document } = parseHTML(`<div class="layout-root"><layout-node data-drawer-dock="end"><div class="panel-content"><div class="tree"><span id="neutral">text</span></div></div></layout-node></div>`);
  const neutral = document.getElementById('neutral');
  const decision = decisionFor(neutral);
  assert.equal(decision.clear, false);
  assert.equal(decision.reason, '');
});

test('drawer collapsed rail toggle clears marker', () => {
  const { document } = parseHTML(`<layout-node data-drawer-dock="end" drawer-rail drawer-rail-collapsed></layout-node>`);
  const rail = document.querySelector('layout-node');
  const affordance = pointerAffordanceFromPath(pathOf(rail));
  assert.equal(affordance.isDrawerToggle, true);
  assert.equal(resolveCvShowGestureClear({ type: 'pointerdown', button: 0, isDrawerToggle: true }).clear, true);
});

test('actionable tree row / button selection clears marker', () => {
  const { document } = parseHTML(`<div class="sn-tree-row"><button class="x">open</button></div>`);
  const row = document.querySelector('.sn-tree-row');
  assert.equal(resolveCvShowGestureClear({ type: 'pointerdown', button: 0, isNavigationTarget: pointerAffordanceFromPath(pathOf(row)).isNavigationTarget }).clear, true);
  const button = document.querySelector('button');
  assert.equal(decisionFor(button).clear, true);
});

test('static data-tour-target text node is not an affordance', () => {
  const { document } = parseHTML(`<p data-tour-target="x">static</p>`);
  const decision = decisionFor(document.querySelector('[data-tour-target]'));
  assert.equal(decision.clear, false);
});
