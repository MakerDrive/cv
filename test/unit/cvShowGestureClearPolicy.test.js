import { test } from 'node:test';
import assert from 'node:assert/strict';
import { resolveCvShowGestureClear } from '../../src/static-pages/js/tour-player/gestureClearPolicy.js';

test('keeps gesture graphics on transport pause and resume of the same content', () => {
  assert.equal(resolveCvShowGestureClear({
    type: 'pointerdown',
    button: 0,
    inPlayer: true,
    isPlayPause: true,
  }).clear, false);
});

test('keeps gesture graphics on right-click and context menu', () => {
  assert.equal(resolveCvShowGestureClear({ type: 'contextmenu' }).clear, false);
  assert.equal(resolveCvShowGestureClear({ type: 'pointerdown', button: 2 }).clear, false);
  assert.equal(resolveCvShowGestureClear({ type: 'pointerdown', button: 1 }).clear, false);
});

test('keeps gesture graphics on hover movement and player settings', () => {
  assert.equal(resolveCvShowGestureClear({ type: 'pointermove', button: -1 }).clear, false);
  assert.equal(resolveCvShowGestureClear({ type: 'pointermove', button: 0 }).clear, false);
  assert.equal(resolveCvShowGestureClear({
    type: 'pointerdown',
    button: 0,
    inPlayer: true,
    isPlayerSettings: true,
  }).clear, false);
});

test('clears on manual drawer/panel toggling', () => {
  const decision = resolveCvShowGestureClear({
    type: 'pointerdown',
    button: 0,
    isDrawerToggle: true,
  });
  assert.equal(decision.clear, true);
  assert.equal(decision.reason, 'gesture-panel-toggle');
});

test('clears on player transport advance (next, previous, stop, timeline, seek)', () => {
  const decision = resolveCvShowGestureClear({
    type: 'pointerdown',
    button: 0,
    inPlayer: true,
  });
  assert.equal(decision.clear, true);
  assert.equal(decision.reason, 'gesture-transport-advance');
});

test('clears on a navigation/selection pointer action over content', () => {
  const decision = resolveCvShowGestureClear({
    type: 'pointerdown',
    button: 0,
    isNavigationTarget: true,
  });
  assert.equal(decision.clear, true);
  assert.equal(decision.reason, 'gesture-user-pointer');
});

test('neutral pointer click on plain content does not clear', () => {
  const decision = resolveCvShowGestureClear({ type: 'pointerdown', button: 0 });
  assert.equal(decision.clear, false);
});

test('clears once a manual drag actually moves the pointer', () => {
  const decision = resolveCvShowGestureClear({
    type: 'pointermove',
    button: 0,
    dragStarted: true,
  });
  assert.equal(decision.clear, true);
  assert.equal(decision.reason, 'gesture-drag');
});

test('clears on real wheel scroll, not on zero-delta wheel', () => {
  assert.equal(resolveCvShowGestureClear({ type: 'wheel', wheelDelta: 120 }).clear, true);
  assert.equal(resolveCvShowGestureClear({ type: 'wheel', wheelDelta: 0 }).clear, false);
});

test('clears on text input into any entry field', () => {
  const decision = resolveCvShowGestureClear({ type: 'input', isTextEntry: true });
  assert.equal(decision.clear, true);
  assert.equal(decision.reason, 'gesture-text-input');
  assert.equal(resolveCvShowGestureClear({ type: 'input', isTextEntry: false }).clear, false);
});

test('clears on player keyboard seeks only', () => {
  assert.equal(resolveCvShowGestureClear({ type: 'keydown', isSeekKey: true }).clear, true);
  assert.equal(resolveCvShowGestureClear({ type: 'keydown', isSeekKey: false }).clear, false);
  assert.equal(resolveCvShowGestureClear({ type: 'keydown' }).clear, false);
});

test('unknown event types never clear', () => {
  assert.equal(resolveCvShowGestureClear({ type: 'mousemove' }).clear, false);
  assert.equal(resolveCvShowGestureClear({ type: 'pointerenter' }).clear, false);
});
