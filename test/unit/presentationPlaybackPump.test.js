import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

import {
  createPresentationPlaybackPump,
} from '../../src/static-pages/js/tour-player/presentationPlaybackPump.js';
import {
  playPresentationAudioClip,
} from '../../src/static-pages/js/tour-player/presentationAudioTransport.js';
import {
  createCvShowEntryTuple,
} from '../../src/static-pages/js/tour-player/presentationProjectAdapter.js';
import {
  CV_SHOW_PRESENTATION_PROJECT,
} from '../../src/static-pages/data/cvShowPresentationProject.js';

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

test('pump still reports an actual failed Project terminal', async () => {
  const execution = new FakeExecution();
  const failures = [];
  execution.terminal.push({ cellId: 'setup', status: 'failed' });
  const pump = createPresentationPlaybackPump({
    execution,
    playbackPlan: plan,
    media: { currentTime: 0, pause() {} },
    onFailure: (error) => failures.push(error),
  });

  pump.resume('failed-terminal');
  await nextTurn();
  assert.equal(failures.length, 1);
  assert.equal(failures[0].code, 'PRESENTATION_PLAYBACK_CELL_FAILED');
  assert.equal(failures[0].details.status, 'failed');
  await pump.dispose('test-dispose');
});

class ControlledMedia extends EventTarget {
  currentTime = 0;
  paused = true;
  seeking = false;

  play() {
    this.paused = false;
    return Promise.resolve();
  }

  pause() {
    this.paused = true;
  }
}

function operationReceipt(operation, statuses) {
  for (const status of statuses) {
    operation.reportReceipt({
      status,
      observedAt: {
        domain: 'performance',
        timeOriginMs: performance.timeOrigin,
        monotonicTimeMs: performance.now(),
      },
      providerReceipt: {},
    });
  }
}

async function settleTurns(count = 12) {
  for (let index = 0; index < count; index += 1) await nextTurn();
}

test('real finale execution settles native audio end without a final timeupdate or a playback failure', async () => {
  const media = new ControlledMedia();
  const failures = [];
  const sequence = JSON.parse(await readFile(new URL(
    '../../src/static-pages/copy-cv-show-audio/barzana-2/d36ab3bd2685565d0e816a1e5602c3891eae3384be277bc2b3b7222c5688b8b5/aligned/16-short-finale.json',
    import.meta.url,
  ), 'utf8'));
  const tuple = createCvShowEntryTuple(
    CV_SHOW_PRESENTATION_PROJECT,
    'finale',
    sequence,
    {
      adapter: {
        playAudioClip(operation) {
          return playPresentationAudioClip(media, operation);
        },
        runInteraction(operation) { operationReceipt(operation, ['acted', 'settled']); },
        runAttention(operation) { operationReceipt(operation, ['first-frame', 'settled']); },
        waitForState(operation) { operationReceipt(operation, ['ready']); },
      },
    },
  );
  const pump = createPresentationPlaybackPump({
    execution: tuple.execution,
    playbackPlan: tuple.playbackPlan,
    media,
    onFailure: (error) => failures.push(error),
  });

  pump.resume('native-end');
  await settleTurns();
  assert.equal(tuple.execution.snapshot.activeCellId.endsWith(':01'), true);

  // Real browsers may emit `ended` at source duration without a last
  // `timeupdate`. The transport must acknowledge the clip exactly once and
  // the Project execution must reach a terminal, non-failing state.
  const audioCell = tuple.playbackPlan.cells.find(({ kind }) => kind === 'audio-clip');
  assert.ok(audioCell?.audio);
  media.currentTime = audioCell.audio.sourceOutMs / 1_000;
  media.dispatchEvent(new Event('ended'));
  await settleTurns();

  assert.deepEqual(
    tuple.execution.snapshot.terminal.filter(({ cellId }) => cellId.includes(':audio-clip:')),
    [{ cellId: 'cv-show:audio-clip:finale:01', status: 'completed' }],
  );
  assert.equal(tuple.execution.snapshot.activeCount, 0);
  assert.equal(tuple.execution.snapshot.pendingCount, 0);
  assert.equal(tuple.execution.snapshot.terminal.length, tuple.playbackPlan.cells.length);
  assert.deepEqual(failures, []);

  // A duplicate browser notification cannot restart a completed Project
  // execution or fabricate another audio completion.
  media.dispatchEvent(new Event('ended'));
  await settleTurns(2);
  assert.equal(tuple.execution.snapshot.activeCount, 0);
  assert.deepEqual(
    tuple.execution.snapshot.terminal.filter(({ cellId }) => cellId.includes(':audio-clip:')),
    [{ cellId: 'cv-show:audio-clip:finale:01', status: 'completed' }],
  );
  assert.deepEqual(failures, []);
  await pump.dispose('test-dispose');
});
