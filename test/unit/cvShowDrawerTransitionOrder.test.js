import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  bindStaleNavDrawerCloser,
  createStaleNavDrawerCloser,
  shouldCloseStaleNavDrawer,
} from '../../src/static-pages/js/tour-player/drawerTransitionPolicy.js';

function flush() {
  return new Promise((resolve) => {
    queueMicrotask(() => queueMicrotask(resolve));
  });
}

test('entry schedules deferred close; Stop before microtask never closes manual drawer', async () => {
  const calls = [];
  let active = true;
  const closer = createStaleNavDrawerCloser({
    isActive: () => active,
    onClose: () => calls.push('close'),
  });

  closer.schedule(); // playback entry event
  assert.equal(closer.pending, true);
  active = false; // Stop/complete before the microtask runs
  await flush();
  assert.deepEqual(calls, [], 'deferred close must not fire after Stop');
  assert.equal(closer.pending, false);
});

test('active transition closes stale drawer; authored reveal after entry stays open', async () => {
  const calls = [];
  let active = true;
  const closer = createStaleNavDrawerCloser({
    isActive: () => active,
    onClose: () => calls.push('close'),
  });

  closer.schedule();
  await flush();
  assert.deepEqual(calls, ['close']);

  // Authored reveal opens drawer in a later task; nothing pending cancels it.
  calls.length = 0;
  await flush();
  assert.deepEqual(calls, [], 'authored reveal is not cancelled');
});

test('rapid new entry while a close is pending re-schedules once', async () => {
  const calls = [];
  let active = true;
  const closer = createStaleNavDrawerCloser({
    isActive: () => active,
    onClose: () => calls.push('close'),
  });

  closer.schedule(); // entry A
  closer.schedule(); // rapid entry B while still pending -> no duplicate
  assert.equal(closer.pending, true);
  await flush();
  assert.deepEqual(calls, ['close'], 'exactly one close runs');
});

test('stop/restart while pending cancels the stale close', async () => {
  const calls = [];
  let active = true;
  const closer = createStaleNavDrawerCloser({
    isActive: () => active,
    onClose: () => calls.push('close'),
  });

  closer.schedule();
  closer.cancel(); // stop/restart clears pending
  await flush();
  assert.deepEqual(calls, []);
  active = true;
  closer.schedule();
  await flush();
  assert.deepEqual(calls, ['close']);
});

test('registration seam: authored reveal CustomEvent cancels pending close, dispose unhooks', async () => {
  const calls = [];
  let active = true;
  const closer = createStaleNavDrawerCloser({
    isActive: () => active,
    onClose: () => calls.push('close'),
  });
  const target = new EventTarget();
  const binder = bindStaleNavDrawerCloser(target, closer);

  closer.schedule(); // entry B close pending
  target.dispatchEvent(new CustomEvent('cv-show-start-drawer-opened')); // authored reveal
  assert.equal(closer.pending, false, 'pending stale close cancelled by authored reveal signal');
  await flush();
  assert.deepEqual(calls, [], 'no late close after reveal cancelled pending');

  // Dispose removes handler: a later reveal no longer cancels an active close.
  binder.dispose();
  target.dispatchEvent(new CustomEvent('cv-show-start-drawer-opened'));
  closer.schedule();
  await flush();
  assert.deepEqual(calls, ['close'], 'close runs after binder disposed (reveal no longer cancels)');
});

test('policy is inert when tour inactive and active when drawer stale+open', () => {
  assert.equal(shouldCloseStaleNavDrawer({ layoutDrawerMode: true, drawerStartOpen: true, dockOpen: false, tourActive: false }), false);
  assert.equal(shouldCloseStaleNavDrawer({ layoutDrawerMode: true, drawerStartOpen: true, dockOpen: false, tourActive: true }), true);
  assert.equal(shouldCloseStaleNavDrawer({ layoutDrawerMode: false, drawerStartOpen: true, tourActive: true }), false);
});
