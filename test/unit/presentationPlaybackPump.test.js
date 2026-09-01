import assert from 'node:assert/strict';
import test from 'node:test';

import {
  createPresentationPlaybackPump,
} from '../../src/static-pages/js/tour-player/presentationPlaybackPump.js';

class FakeExecution {
  constructor() {
    this.samples = [];
    this.state = 'running';
    this.active = null;
    this.waiter = null;
    this.terminal = [{ cellId: 'setup', status: 'completed' }];
    this.barriers = [{ cellId: 'setup', barriers: ['settled'] }];
  }

  get snapshot() {
    return {
      state: this.state,
      mediaTimeMs: this.samples.at(-1)?.mediaTimeMs ?? 0,
      activeCount: this.active ? 1 : 0,
      activeCellId: this.active || '',
      terminal: this.terminal.map((value) => ({ ...value })),
      barriers: this.barriers.map((value) => ({
        ...value,
        barriers: [...value.barriers],
      })),
    };
  }

  sample({ mediaTimeMs, reason }) {
    const expected = this.nextCell;
    this.samples.push({ cellId: expected.id, mediaTimeMs, reason });
    this.active = expected.id;
    return this.snapshot;
  }

  whenIdle() {
    if (!this.active) return Promise.resolve(this.snapshot);
    return new Promise((resolve) => { this.waiter = resolve; });
  }

  finish(cellId, barrier) {
    assert.equal(this.active, cellId);
    this.active = null;
    this.terminal.push({ cellId, status: 'completed' });
    this.barriers.push({ cellId, barriers: [barrier] });
    const resolve = this.waiter;
    this.waiter = null;
    resolve?.(this.snapshot);
  }

  pause() {
    this.state = 'paused';
    if (this.active) {
      this.active = null;
      const resolve = this.waiter;
      this.waiter = null;
      resolve?.(this.snapshot);
    }
    return Promise.resolve(this.snapshot);
  }

  resume() {
    this.state = 'running';
    return this.snapshot;
  }

  stop() {
    this.state = 'stopped';
    return this.pause();
  }

  dispose() {
    this.state = 'disposed';
    return this.pause();
  }
}

const plan = {
  cells: [
    { id: 'setup', kind: 'interaction', span: { startMs: 0, endMs: 100 }, dependsOn: [] },
    {
      id: 'clip-1',
      kind: 'audio-clip',
      span: { startMs: 100, endMs: 1_100 },
      audio: { sourceInMs: 0, sourceOutMs: 1_000 },
      dependsOn: [{ cellId: 'setup', barrier: 'settled' }],
    },
    {
      id: 'marker',
      kind: 'attention',
      span: { startMs: 1_100, endMs: 1_900 },
      dependsOn: [{ cellId: 'clip-1', barrier: 'ended' }],
    },
    {
      id: 'clip-2',
      kind: 'audio-clip',
      span: { startMs: 1_900, endMs: 2_900 },
      audio: { sourceInMs: 1_000, sourceOutMs: 2_000 },
      dependsOn: [{ cellId: 'marker', barrier: 'settled' }],
    },
  ],
};

function nextTurn() {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

test('pump waits for each actual barrier before sampling the next Project layer cell', async () => {
  const execution = new FakeExecution();
  const media = { currentTime: 0, pause() {} };
  const pump = createPresentationPlaybackPump({ execution, playbackPlan: plan, media });
  Object.defineProperty(execution, 'nextCell', {
    get: () => plan.cells.find(({ id }) => !execution.terminal.some((item) => item.cellId === id)
      && id !== execution.active),
  });

  pump.resume('test-start');
  await nextTurn();
  assert.deepEqual(execution.samples.map(({ cellId }) => cellId), ['clip-1']);
  media.currentTime = 0.4;
  assert.equal(pump.positionMs, 500);

  execution.finish('clip-1', 'ended');
  await nextTurn();
  assert.deepEqual(execution.samples.map(({ cellId }) => cellId), ['clip-1', 'marker']);
  assert.equal(pump.positionMs, 1_100);

  execution.finish('marker', 'settled');
  await nextTurn();
  assert.deepEqual(execution.samples.map(({ cellId }) => cellId), ['clip-1', 'marker', 'clip-2']);
});

test('pump resumes an interrupted audio clip from the shared source position', async () => {
  const execution = new FakeExecution();
  const media = { currentTime: 0, pause() {} };
  const pump = createPresentationPlaybackPump({ execution, playbackPlan: plan, media });
  Object.defineProperty(execution, 'nextCell', {
    get: () => plan.cells.find(({ id }) => !execution.terminal.some((item) => item.cellId === id)
      && id !== execution.active),
  });

  pump.resume('test-start');
  await nextTurn();
  media.currentTime = 0.4;
  assert.equal(pump.positionMs, 500);
  await pump.pause('test-pause');
  pump.resume('test-resume');
  await nextTurn();

  assert.equal(execution.samples.at(-1).cellId, 'clip-1');
  assert.equal(execution.samples.at(-1).mediaTimeMs, 500);
});
