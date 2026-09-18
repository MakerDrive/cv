import assert from 'node:assert/strict';
import test from 'node:test';

import { createPresentationPlaybackPump } from '../../src/static-pages/js/tour-player/presentationPlaybackPump.js';
import { createCvShowGateQueue } from '../../src/static-pages/js/tour-player/gateQueue.js';

class FakeGateExecution {
  constructor() {
    this.state = 'running';
    this.active = null;
    this.terminal = [{ cellId: 'a', status: 'completed' }];
    this.samples = [];
    this.waiter = null;
    this.paused = 0;
  }

  get snapshot() {
    return {
      state: this.state,
      activeCount: this.active ? 1 : 0,
      activeCellId: this.active || '',
      mediaTimeMs: 100,
      terminal: [...this.terminal],
      barriers: [{ cellId: 'a', barriers: ['ended'] }],
    };
  }

  sample() {
    this.active = 'b';
    return this.snapshot;
  }

  whenIdle() {
    if (!this.active) return Promise.resolve(this.snapshot);
    return new Promise((resolve) => { this.waiter = resolve; });
  }

  finishActive() {
    if (this.active === 'b') {
      this.terminal.push({ cellId: 'b', status: 'completed' });
      this.active = null;
    }
    this.waiter?.(this.snapshot);
  }

  pause() { this.paused += 1; this.state = 'paused'; return Promise.resolve(this.snapshot); }
  resume() { this.state = 'running'; return this.snapshot; }
  stop() { return this.pause(); }
  dispose() { this.state = 'disposed'; return this.pause(); }
}

function fakeMedia() {
  const calls = [];
  return {
    currentTime: 0,
    pause() { calls.push('pause'); },
    play() { calls.push('play'); },
    calls,
  };
}

const plan = {
  cells: [
    { id: 'a', kind: 'interaction', span: { startMs: 0, endMs: 100 }, dependsOn: [] },
    { id: 'b', kind: 'interaction', span: { startMs: 100, endMs: 200 }, dependsOn: [{ cellId: 'a', barrier: 'ended' }] },
  ],
};

const settle = () => new Promise((resolve) => setImmediate(resolve));

test('registered gate runs exactly at a safe boundary and resumes afterwards', async () => {
  const queue = createCvShowGateQueue();
  const execution = new FakeGateExecution();
  const media = fakeMedia();
  let gateEnsure = 0;
  const gateResult = queue.register(
    { targetId: 'panel.graph', state: { collapsed: false } },
    async () => {
      gateEnsure += 1;
      assert.equal(execution.active, null, 'gate must run at a boundary: no active cell');
      assert.equal(media.calls.includes('pause'), true, 'media was paused for the gate');
      assert.equal(media.calls.includes('play'), false, 'media not yet resumed mid-gate');
      return { status: 'achieved' };
    },
  );
  const pump = createPresentationPlaybackPump({
    execution,
    playbackPlan: plan,
    media,
    gate: { hasPending: () => queue.hasPending, run: () => queue.run() },
  });
  pump.resume('start');
  for (let i = 0; i < 20; i += 1) await settle();
  assert.equal(gateEnsure, 1);
  assert.deepEqual(media.calls, ['pause', 'play'], 'gate paused then resumed the composition');
  assert.equal(execution.active, 'b', 'next cell sampled AFTER the gate');
  const gateResultValue = await gateResult;
  assert.equal(gateResultValue.status, 'achieved');
  execution.finishActive();
  await settle();
  await pump.dispose('done');
});

test('a failing gate produces PRESENTATION_GATE_FAILED and no resume', async () => {
  const queue = createCvShowGateQueue();
  const execution = new FakeGateExecution();
  const media = fakeMedia();
  queue.register(
    { targetId: 'panel.graph', state: { collapsed: false } },
    async () => ({ status: 'failed', reason: 'verification-mismatch' }),
  );
  const failures = [];
  const pump = createPresentationPlaybackPump({
    execution,
    playbackPlan: plan,
    media,
    gate: { hasPending: () => queue.hasPending, run: () => queue.run() },
    onFailure: (error) => failures.push(error),
  });
  pump.resume('start');
  for (let i = 0; i < 20; i += 1) await settle();
  assert.equal(failures.length, 1);
  assert.equal(failures[0].code, 'PRESENTATION_GATE_FAILED');
  assert.equal(media.calls.includes('play'), false, 'composition stays paused on gate failure');
  await pump.dispose('done');
});

test('queue passes aggregate failure but still settles every pending promise', async () => {
  const queue = createCvShowGateQueue();
  const first = queue.register({ targetId: 'x.a', state: {} }, async () => ({ status: 'failed' }));
  const second = queue.register({ targetId: 'x.b', state: {} }, async () => ({ status: 'achieved' }));
  const aggregate = await queue.run();
  assert.equal(aggregate.status, 'failed');
  assert.equal((await second).status, 'achieved');
  assert.equal((await first).status, 'failed');
});
