import test from 'node:test';
import assert from 'node:assert/strict';
import {
  CV_SHOW_RECOVERY,
  createCascadeTracker,
  createPresentationReceiptSummary,
  normalizePresentationFailure,
  resolveFailureRecovery,
} from '../../src/static-pages/js/tour-player/failurePolicy.js';
import { createPresentationPlaybackPump } from '../../src/static-pages/js/tour-player/presentationPlaybackPump.js';

test('engine-shape failure receipts normalize with top-level identity', () => {
  const normalized = normalizePresentationFailure({
    cellId: 'cv-show:cue:example.marker',
    kind: 'attention',
    status: 'failed',
    reason: { code: 'PRESENTATION_EFFECT_ADMISSION_REJECTED', message: 'rejected' },
  });
  assert.equal(normalized.cellId, 'cv-show:cue:example.marker');
  assert.equal(normalized.kind, 'attention');
  assert.equal(normalized.code, 'PRESENTATION_EFFECT_ADMISSION_REJECTED');
  assert.equal(normalized.status, 'failed');
});

test('pump-shape failure receipts normalize from details', () => {
  const normalized = normalizePresentationFailure({
    status: 'failed',
    reason: 'PRESENTATION_PLAYBACK_CELL_FAILED',
    details: {
      cellId: 'cv-show:cue:example.frame',
      kind: 'attention',
      layerId: 'cv-show:layer:focus',
      cause: 'PRESENTATION_EFFECT_DEADLINE_MISSED',
    },
  });
  assert.equal(normalized.cellId, 'cv-show:cue:example.frame');
  assert.equal(normalized.kind, 'attention');
  assert.equal(normalized.layerId, 'cv-show:layer:focus');
  assert.equal(normalized.code, 'PRESENTATION_PLAYBACK_CELL_FAILED');
});

test('both receipt shapes yield the same policy input', () => {
  const engine = normalizePresentationFailure({
    cellId: 'x',
    kind: 'attention',
    layerId: 'cv-show:layer:annotation',
    status: 'failed',
    reason: { code: 'PRESENTATION_EFFECT_DEADLINE_MISSED' },
  });
  const pump = normalizePresentationFailure({
    status: 'failed',
    reason: 'PRESENTATION_PLAYBACK_CELL_FAILED',
    details: {
      cellId: 'x',
      kind: 'attention',
      layerId: 'cv-show:layer:annotation',
      cause: 'PRESENTATION_EFFECT_DEADLINE_MISSED',
    },
  });
  for (const key of ['cellId', 'kind', 'layerId', 'status']) {
    assert.equal(engine[key], pump[key]);
  }
});

test('decorative failures degrade regardless of reason code', () => {
  for (const code of [
    'PRESENTATION_EFFECT_ADMISSION_REJECTED',
    'PRESENTATION_EFFECT_DEADLINE_MISSED',
    'CV_SHOW_PRESENTATION_OPERATION_FAILED',
  ]) {
    assert.equal(
      resolveFailureRecovery({
        kind: 'attention',
        layerId: 'cv-show:layer:annotation',
        code,
        narrationStarted: true,
      }),
      CV_SHOW_RECOVERY.DEGRADE,
    );
    assert.equal(
      resolveFailureRecovery({
        kind: 'attention',
        layerId: 'cv-show:layer:focus',
        code,
        narrationStarted: false,
      }),
      CV_SHOW_RECOVERY.DEGRADE,
    );
  }
});

test('.optional policy always skips', () => {
  assert.equal(
    resolveFailureRecovery({
      kind: 'interaction',
      layerId: 'cv-show:layer:interaction',
      policy: 'optional',
      narrationStarted: true,
    }),
    CV_SHOW_RECOVERY.SKIP,
  );
});

test('interaction failures pause-retry only before narration started', () => {
  assert.equal(
    resolveFailureRecovery({
      kind: 'interaction',
      layerId: 'cv-show:layer:interaction',
      narrationStarted: false,
    }),
    CV_SHOW_RECOVERY.PAUSE_RETRY,
  );
  assert.equal(
    resolveFailureRecovery({
      kind: 'interaction',
      layerId: 'cv-show:layer:interaction',
      narrationStarted: true,
    }),
    CV_SHOW_RECOVERY.PAUSE_REPORT,
  );
});

test('audio and unknown critical failures never auto-restart', () => {
  assert.equal(
    resolveFailureRecovery({ kind: 'audio', layerId: 'cv-show:layer:audio' }),
    CV_SHOW_RECOVERY.PAUSE_REPORT,
  );
  assert.equal(
    resolveFailureRecovery({ kind: 'state', layerId: 'cv-show:layer:state', narrationStarted: true }),
    CV_SHOW_RECOVERY.PAUSE_REPORT,
  );
});

test('degraded provider receipt stays machine-readable in the summary', () => {
  const summary = createPresentationReceiptSummary();
  summary.record({
    cellId: 'cv-show:cue:a',
    status: 'first-frame',
    providerReceipt: { degraded: true, outcome: 'budget-exceeded', fallback: 'none-skipped' },
  });
  summary.record({
    cellId: 'cv-show:cue:a',
    status: 'settled',
    providerReceipt: { degraded: true, outcome: 'budget-exceeded', fallback: 'none-skipped' },
  });
  summary.record({ cellId: 'cv-show:cue:b', status: 'settled' });
  summary.record({ cellId: 'cv-show:cue:c', status: 'skipped' });
  summary.record({
    cellId: 'cv-show:cue:d',
    status: 'failed',
    reason: { code: 'UNEXPECTED' },
  });
  assert.deepEqual(summary.snapshot(), {
    success: 1,
    degraded: 1,
    skipped: 1,
    cascadeSkipped: 0,
    failedCritical: 1,
    byReason: {
      'budget-exceeded': 1,
      UNEXPECTED: 1,
    },
    byFallback: { 'none-skipped': 1 },
    cascadeByRoot: {},
  });
});

test('summary counts one class per cell irrespective of duplicate receipts', () => {
  const summary = createPresentationReceiptSummary();
  summary.record({ cellId: 'c', status: 'settled' });
  summary.record({ cellId: 'c', status: 'settled' });
  summary.record({ cellId: 'c', status: 'ended' });
  assert.equal(summary.snapshot().success, 1, 'one cell counts exactly once');
});


function createFakeExecution({ cells, activeCellId = '' }) {
  // note: an always-active narration cell
  const terminal = [];
  const barriers = [];
  let mediaTimeMs = 0;
  const samples = [];
  const terminalSet = new Set();
  const pendingIdle = [];
  const expiryMs = new Map(cells.map((cell) => [cell.id, cell.expiryMs ?? Infinity]));
  const snapshot = () => Object.freeze({
    state: 'running',
    terminal: terminal.map((item) => Object.freeze({ ...item })),
    barriers: barriers.map((item) => Object.freeze({ ...item })),
    activeCellId,
    activeCount: activeCellId ? 1 : 0,
    mediaTimeMs,
  });
  const flushIdle = () => {
    const pending = pendingIdle.splice(0);
    for (const resolve of pending) resolve();
  };
  const mark = (cellId, status) => {
    if (terminalSet.has(cellId)) return;
    terminalSet.add(cellId);
    terminal.push({ cellId, status });
    if (status === 'completed' || status === 'skipped' || status === 'degraded-complete') {
      const entry = barriers.find((item) => item.cellId === cellId)
        || barriers[barriers.push({ cellId, barriers: [] }) - 1];
      entry.barriers.push('ended');
    }
  };
  return Object.freeze({
    marked: mark,
    samples,
    get snapshot() { return snapshot(); },
    sample(input) {
      samples.push(input.mediaTimeMs);
      mediaTimeMs = input.mediaTimeMs;
      if (activeCellId && mediaTimeMs >= 4_000) mark(activeCellId, 'completed');
      flushIdle();
      for (const cell of cells) {
        if (!terminalSet.has(cell.id) && mediaTimeMs >= expiryMs.get(cell.id)) {
          mark(cell.id, 'skipped');
        }
      }
      return snapshot();
    },
    async whenIdle() {
      // The pump awaits the active narration operation for the whole clip;
      // an instant-resolving fake would spin the run loop without ever
      // yielding to the media clock. Wait until the next media tick.
      if (!activeCellId || terminalSet.has(activeCellId)) return snapshot();
      await new Promise((resolve) => pendingIdle.push(resolve));
      return snapshot();
    },
    resume() { return snapshot(); },
    async pause() { return snapshot(); },
    async stop() { return snapshot(); },
    async dispose() { return snapshot(); },
  });
}

function createFakeMedia() {
  let time = 0;
  const listeners = new Map();
  return {
    get currentTime() { return time; },
    seeking: false,
    addEventListener(type, fn) { listeners.set(type, fn); },
    removeEventListener(type) { listeners.delete(type); },
    tick(seconds = 0.1) {
      time += seconds;
      listeners.get('timeupdate')?.();
    },
    pause() {},
  };
}

const pumpPlan = (cells) => Object.freeze({
  cells: cells.map((cell) => Object.freeze({
    id: cell.id,
    kind: cell.kind || 'attention',
    dependsOn: cell.dependsOn || [],
    span: Object.freeze({ startMs: cell.startMs ?? 0, endMs: cell.endMs ?? 10_000 }),
    ...(cell.audio ? { audio: Object.freeze({ ...cell.audio }) } : {}),
  })),
});

test('pump tolerates degraded chain: blocked cells expire, no escalation, samples monotonic', async () => {
  const media = createFakeMedia();
  const execution = createFakeExecution({
    cells: [
      { id: 'marker', expiryMs: 500 },
      { id: 'after-marker', expiryMs: 900 },
    ],
    activeCellId: 'narration-audio',
  });
  // The marker failed after activation (deadline race). Its dependent chain
  // must expire with the media clock instead of restarting or deadlocking.
  execution.marked('marker', 'failed');
  const tolerated = new Set(['marker']);
  const failures = [];
  const pump = createPresentationPlaybackPump({
    execution,
    playbackPlan: pumpPlan([
      {
        id: 'narration-audio',
        kind: 'audio-clip',
        startMs: 0,
        endMs: 4_000,
        audio: { sourceInMs: 0, sourceOutMs: 4_000 },
      },
      { id: 'marker', startMs: 0, endMs: 400 },
      { id: 'after-marker', startMs: 400, endMs: 800, dependsOn: [{ cellId: 'marker', barrier: 'settled' }] },
    ]),
    media,
    isFailureTolerated: (cellId) => tolerated.has(cellId),
    onFailure: (error) => failures.push(error),
  });
  pump.resume('start');
  // Audio keeps playing; expired cells get skipped as the clock advances.
  for (let step = 0; step < 12; step += 1) {
    media.tick(0.1);
    await new Promise((resolve) => setTimeout(resolve, 150));
  }
  assert.deepEqual(failures, [], 'tolerated failure never escalates');
  const terminal = Object.fromEntries(
    execution.snapshot.terminal.map(({ cellId, status }) => [cellId, status]),
  );
  assert.equal(terminal.marker, 'failed');
  assert.equal(terminal['after-marker'], 'skipped');
  const samples = execution.samples;
  assert.ok(samples.every((value, index) => index === 0 || value >= samples[index - 1]),
    'the execution media clock never moves backward');
  await pump.dispose('done');
});

test('pump escalates untolerated failures (unchanged default)', async () => {
  const media = createFakeMedia();
  const execution = createFakeExecution({ cells: [{ id: 'nav' }] });
  execution.marked('nav', 'failed');
  const failures = [];
  const pump = createPresentationPlaybackPump({
    execution,
    playbackPlan: pumpPlan([{ id: 'nav' }]),
    media,
    isFailureTolerated: () => false,
    onFailure: (error) => failures.push(error),
  });
  pump.resume('start');
  await new Promise((resolve) => setTimeout(resolve, 50));
  assert.equal(failures.length, 1);
  assert.equal(failures[0].code, 'PRESENTATION_PLAYBACK_CELL_FAILED');
  await pump.dispose('done');
});

test('pump keeps hard dependency blocking for non-tolerated chains', async () => {
  const media = createFakeMedia();
  const execution = createFakeExecution({
    cells: [{ id: 'gate' }],
  });
  const failures = [];
  const pump = createPresentationPlaybackPump({
    execution,
    playbackPlan: pumpPlan([
      // Blocked forever on a dependency that is not a tolerated failure.
      { id: 'held', startMs: 0, endMs: 100, dependsOn: [{ cellId: 'gate', barrier: 'settled' }] },
    ]),
    media,
    isFailureTolerated: () => false,
    onFailure: (error) => failures.push(error),
  });
  pump.resume('start');
  await new Promise((resolve) => setTimeout(resolve, 50));
  assert.equal(failures.length, 1);
  assert.equal(failures[0].code, 'PRESENTATION_PLAYBACK_DEPENDENCY_BLOCKED');
  await pump.dispose('done');
});

test('cascade tracker maps multi-level skipped chains to the original failure', () => {
  const tracker = createCascadeTracker([
    { id: 'a', dependsOn: [] },
    { id: 'b', dependsOn: [{ cellId: 'a', barrier: 'settled' }] },
    { id: 'c', dependsOn: [{ cellId: 'b', barrier: 'settled' }] },
    { id: 'd', dependsOn: [{ cellId: 'c', barrier: 'settled' }] },
    { id: 'unrelated', dependsOn: [] },
  ]);
  tracker.markFailure('a');
  assert.deepEqual(tracker.classifySkip('b'), { cascadeFrom: 'a', rootCauseCellId: 'a' });
  assert.deepEqual(tracker.classifySkip('c'), { cascadeFrom: 'b', rootCauseCellId: 'a' });
  assert.deepEqual(tracker.classifySkip('d'), { cascadeFrom: 'c', rootCauseCellId: 'a' });
  assert.equal(tracker.classifySkip('unrelated'), null);
  assert.equal(tracker.cascadeSkippedCount, 3);
  assert.deepEqual(tracker.cascadeByRoot, { a: 3 });
});

test('summary precedence keeps the final outcome per cell', () => {
  const summary = createPresentationReceiptSummary();
  // degraded completion first (adapter-side degrade), terminal failed later
  // should NEVER upgrade to success; precedence failed > degraded.
  summary.record({
    cellId: 'x',
    status: 'first-frame',
    providerReceipt: { degraded: true, outcome: 'budget-exceeded' },
  });
  summary.record({
    cellId: 'x',
    status: 'settled',
    providerReceipt: { degraded: true, outcome: 'budget-exceeded' },
  });
  assert.equal(summary.snapshot().degraded, 1);
  assert.equal(summary.snapshot().success, 0);
  // A failed terminal of the same cell upgrades the class.
  summary.record({ cellId: 'x', status: 'failed', reason: { code: 'POST' } });
  assert.equal(summary.snapshot().degraded, 0);
  assert.equal(summary.snapshot().failedCritical, 1);
});

test('cascade-skipped cells group under their root failure', () => {
  const summary = createPresentationReceiptSummary();
  summary.record({ cellId: 'a', status: 'failed', reason: { code: 'PRESENTATION_EFFECT_DEADLINE_MISSED' } });
  summary.record({
    cellId: 'b',
    status: 'skipped',
    providerReceipt: { outcome: 'dependency-failed', cascadeFrom: 'a', rootCauseCellId: 'a' },
  });
  summary.record({
    cellId: 'c',
    status: 'skipped',
    providerReceipt: { outcome: 'dependency-failed', cascadeFrom: 'b', rootCauseCellId: 'a' },
  });
  summary.record({ cellId: 'plain', status: 'skipped' });
  const snap = summary.snapshot();
  assert.equal(snap.failedCritical, 1);
  assert.equal(snap.cascadeSkipped, 2);
  assert.equal(snap.skipped, 1);
  assert.deepEqual(snap.cascadeByRoot, { a: 2 });
});
