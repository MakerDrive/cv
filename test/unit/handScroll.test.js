import test from 'node:test';
import assert from 'node:assert/strict';
import { animateCvShowScrollWithHand } from '../../src/static-pages/js/tour-player/targetResolution.js';

function fixture({ distance = 400, height = 600 } = {}) {
  let now = 0;
  const frames = [];
  const view = {
    innerWidth: 1000,
    innerHeight: height,
    requestAnimationFrame: (fn) => { frames.push(fn); return frames.length; },
    cancelAnimationFrame: () => {},
    matchMedia: () => ({ matches: false }),
  };
  const panel = {
    scrollTop: 0, scrollLeft: 0, scrollHeight: 5000, clientHeight: height, scrollWidth: 100, clientWidth: 100,
    parentElement: null,
    getBoundingClientRect: () => ({ left: 100, top: 50, width: 600, height }),
  };
  const root = { scrollTop: 0, scrollLeft: 0, scrollHeight: 100, clientHeight: 100, scrollWidth: 100, clientWidth: 100, parentElement: null, getBoundingClientRect: () => ({ left: 0, top: 0, width: 1000, height }) };
  const document = { defaultView: view, scrollingElement: root, documentElement: root, visibilityState: 'visible' };
  const target = {
    parentElement: panel,
    classList: { contains: () => false },
    scrollIntoView() { panel.scrollTop = distance; },
    getRootNode: () => ({}),
  };
  const calls = [];
  const cursor = {
    planApproach: () => ({ durationMs: 300, render: (elapsed) => calls.push(['approach', Math.round(elapsed)]) }),
    presentCursorFrame: (_el, frame) => { calls.push(['hand', Math.round(frame.point.y), panel.scrollTop]); return { presented: true }; },
    setGrip: (closed) => calls.push(['grip', closed]),
    returnHome: () => calls.push(['home']),
  };
  const run = async (options = {}) => {
    const promise = animateCvShowScrollWithHand(target, { document, cursor, durationMs: 1800, ...options });
    for (let guard = 0; guard < 4000 && frames.length; guard += 1) {
      now += 16;
      frames.shift()(now);
      await Promise.resolve();
    }
    await promise;
  };
  return { panel, calls, run, target, document, cursor };
}

test('the hand pushes the page: content moves as far as the claw, upward for a downward scroll', async () => {
  const { panel, calls, run } = fixture({ distance: 200 });
  await run();
  assert.equal(panel.scrollTop, 200);
  const hand = calls.filter((c) => c[0] === 'hand');
  assert.ok(hand.length > 5);
  assert.ok(hand.at(-1)[1] < hand[0][1], 'the claw moved up while the page scrolled down');
  const first = hand[0];
  const last = hand.at(-1);
  assert.ok(Math.abs((first[1] - last[1]) - (last[2] - first[2])) < 40, 'claw travel equals page travel');
  assert.deepEqual(calls.filter((c) => c[0] === 'grip').map((c) => c[1]), [true, false]);
  assert.ok(!calls.some((c) => c[0] === 'home'), 'the claw stays for the next gesture');
});

test('a long way takes several pushes with the claw letting go in between', async () => {
  const { panel, calls, run } = fixture({ distance: 1500 });
  await run({ durationMs: 4000 });
  assert.equal(panel.scrollTop, 1500);
  const grips = calls.filter((c) => c[0] === 'grip').map((c) => c[1]);
  assert.ok(grips.filter(Boolean).length >= 3, 'gripped once per push');
  assert.equal(grips.at(-1), false);
});

test('without a presenter the scroll falls back to the plain animation', async () => {
  const { panel, run } = fixture({ distance: 300 });
  await run({ cursor: null, durationMs: 400 });
  assert.equal(panel.scrollTop, 300);
});

test('a tiny distance does not bother the hand', async () => {
  const { panel, calls, run } = fixture({ distance: 20 });
  await run();
  assert.equal(panel.scrollTop, 20);
  assert.equal(calls.length, 0);
});

test('an abort lets go of the page and rejects', async () => {
  const { calls, run } = fixture({ distance: 400 });
  const controller = new AbortController();
  const outcome = run({ signal: controller.signal }).then(() => 'done', (error) => error.name);
  controller.abort();
  assert.equal(await outcome, 'AbortError');
  assert.ok(calls.some((c) => c[0] === 'grip' && c[1] === false) || calls.length === 0);
});
