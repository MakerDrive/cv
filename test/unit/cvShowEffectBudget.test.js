import assert from 'node:assert/strict';
import test from 'node:test';
import {
  CV_SHOW_EFFECT_GRACE_MS,
  CV_SHOW_SCROLL_GRACE_SHARE_MS,
  createNavigationBudget,
} from '../../src/static-pages/js/tour-player/effectBudget.js';
import { createCvShowDirectiveRunner } from '../../src/static-pages/js/tour-player/showAdapter.js';

test('a scroll spends at most part of the engine grace on motion', () => {
  assert.ok(CV_SHOW_SCROLL_GRACE_SHARE_MS > 0);
  assert.ok(CV_SHOW_SCROLL_GRACE_SHARE_MS <= CV_SHOW_EFFECT_GRACE_MS / 2);
});

const NAVIGATE = Object.freeze({
  id: 'example.open',
  type: 'navigate',
  target: 'projects/example',
  policy: 'required',
});

function createHarness({ presentNavigationGesture, readiness = async ({ target }) => ({ target: target() }) }) {
  let order = [];
  let viewer = { id: 'viewer', getAttribute: () => null };
  let runtime = {
    entries: new Map([['projects/example', {}]]),
    selectedId: 'profile/photo',
    viewer,
    select(id) {
      order.push(`select:${id}`);
      this.selectedId = id;
      return true;
    },
  };
  let runner = createCvShowDirectiveRunner({
    document: {},
    runtime,
    attention: {
      present() { return { presented: true }; },
      clearMarkers() {},
      clearTransient() {},
    },
    presentNavigationGesture: (source, options) => presentNavigationGesture(source, options, order),
    resolveTarget: () => viewer,
    resolveText: (key) => key,
    waitForReadiness: readiness,
  });
  return { order, runtime, runner };
}

function createPresentation({ budgetMs, elapsedMs }) {
  let receipts = [];
  return {
    receipts,
    presentation: {
      kind: 'interaction',
      requiresProviderAdmission: false,
      budgetMs,
      activatedAt: performance.now() - elapsedMs,
      reportStatus(status, observedAt, evidence) {
        receipts.push({ status, at: performance.now(), evidence });
      },
    },
  };
}

function abortable(signal, order) {
  return new Promise((resolve, reject) => {
    signal.addEventListener('abort', () => {
      order.push('gesture-aborted');
      let error = new Error('gesture cleared');
      error.name = 'AbortError';
      reject(error);
    }, { once: true });
  });
}

test('navigation budget leaves the outcome reserve out of the gesture share', () => {
  let now = 10_000;
  let budget = createNavigationBudget({ budgetMs: 800, activatedAt: 10_000, now: () => now });
  assert.equal(budget.bounded, true);
  assert.equal(budget.gestureMs(), 800 + CV_SHOW_EFFECT_GRACE_MS - 700);
  assert.equal(budget.settleMs(), 800 + CV_SHOW_EFFECT_GRACE_MS - 150);
  now = 10_500;
  assert.equal(budget.canGesture(), true);
  now = 11_000 + 900;
  assert.equal(budget.gestureMs(), 0);
  assert.equal(budget.canGesture(), false);
});

test('navigation budget without an authored window stays unbounded', () => {
  let budget = createNavigationBudget({ budgetMs: 0, activatedAt: 0 });
  assert.equal(budget.bounded, false);
  assert.equal(budget.gestureMs(), Infinity);
  assert.equal(budget.canGesture(), true);
});

test('a gesture that outlives its share is aborted before the programmatic navigation', async () => {
  let { order, runtime, runner } = createHarness({
    presentNavigationGesture: (source, { signal }, log) => {
      log.push(`gesture:${source.target}`);
      return abortable(signal, log);
    },
  });
  let { presentation, receipts } = createPresentation({ budgetMs: 800, elapsedMs: 700 });
  let deadline = presentation.activatedAt + 800 + CV_SHOW_EFFECT_GRACE_MS;

  let result = await runner.run([NAVIGATE], { presentation });

  assert.equal(result.status, 'success');
  assert.deepEqual(order, ['gesture:projects/example', 'gesture-aborted', 'select:projects/example']);
  assert.equal(runtime.selectedId, 'projects/example');
  let settled = receipts.find(({ status }) => status === 'settled');
  assert.ok(settled.at < deadline, 'settled lands inside the engine deadline');
  assert.deepEqual(settled.evidence, {
    navigation: { gesture: 'budget-expired', readiness: 'ready' },
  });
});

test('no gesture starts when its share is already spent', async () => {
  let { order, runner } = createHarness({
    presentNavigationGesture: (source, options, log) => {
      log.push('gesture');
      return true;
    },
  });
  let { presentation, receipts } = createPresentation({ budgetMs: 800, elapsedMs: 1_200 });

  let result = await runner.run([NAVIGATE], { presentation });

  assert.equal(result.status, 'success');
  assert.deepEqual(order, ['select:projects/example']);
  assert.equal(receipts.at(-1).evidence.navigation.gesture, 'budget-skipped');
});

test('a slow article mount settles as pending readiness inside a bounded effect', async () => {
  let { order, runner } = createHarness({
    presentNavigationGesture: () => false,
    readiness: async ({ target, timeoutMs, scroll }) => {
      if (scroll !== false) return { target: typeof target === 'function' ? target() : target };
      await new Promise((resolve) => setTimeout(resolve, timeoutMs));
      throw Object.assign(new Error('show target readiness timed out'), { code: 'timeout' });
    },
  });
  let { presentation, receipts } = createPresentation({ budgetMs: 800, elapsedMs: 1_500 });

  let result = await runner.run([NAVIGATE], { presentation });

  assert.equal(result.status, 'success');
  assert.deepEqual(order, ['select:projects/example']);
  assert.deepEqual(receipts.at(-1).evidence, {
    navigation: { gesture: 'budget-skipped', readiness: 'pending' },
  });
});

test('a row click that lands in time is the only selection and carries no fallback evidence', async () => {
  let { order, runtime, runner } = createHarness({
    presentNavigationGesture: (source, options, log) => {
      log.push('row-click');
      runtime.selectedId = source.target;
      return true;
    },
  });
  let { presentation, receipts } = createPresentation({ budgetMs: 5_800, elapsedMs: 0 });

  let result = await runner.run([NAVIGATE], { presentation });

  assert.equal(result.status, 'success');
  assert.deepEqual(order, ['row-click']);
  assert.equal(receipts.at(-1).evidence, null);
});

test('stopping the show during a budgeted gesture cancels without navigating', async () => {
  let controller = new AbortController();
  let { order, runner } = createHarness({
    presentNavigationGesture: (source, { signal }, log) => {
      setTimeout(() => controller.abort(), 10);
      return abortable(signal, log);
    },
  });
  let { presentation } = createPresentation({ budgetMs: 5_800, elapsedMs: 0 });

  let result = await runner.run([NAVIGATE], { presentation, signal: controller.signal });

  assert.equal(result.status, 'cancelled');
  assert.deepEqual(order, ['gesture-aborted']);
});
