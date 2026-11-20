import test from 'node:test';
import assert from 'node:assert/strict';
import { watchPresenterCues } from 'symbiote-ui/chat/show-soundscape-cues.js';

function fixture() {
  class FakeElement {
    constructor() { this.classList = { contains: (name) => this.classes.has(name) }; this.classes = new Set(); this.box = { left: 100, top: 100, width: 0, height: 0 }; }
    getBoundingClientRect() { return { ...this.box }; }
    contains(node) { return node === this; }
    getAttribute() { return null; }
  }
  const marquee = new FakeElement();
  const observers = [];
  const win = {
    Element: FakeElement,
    innerWidth: 1000,
    innerHeight: 800,
    requestAnimationFrame: (fn) => setTimeout(fn, 0),
    MutationObserver: class { constructor(fn) { this.fn = fn; observers.push(this); } observe() {} disconnect() {} },
  };
  const doc = { defaultView: win, addEventListener() {}, removeEventListener() {}, getSelection: () => null };
  const overlay = { ownerDocument: doc, querySelector: () => marquee };
  const grow = (width, height) => {
    marquee.box = { left: 100, top: 100, width, height };
    // Rects are cached per frame; a new frame is simulated by a fresh observer batch after a tick.
    observers[0].fn([{ type: 'attributes', target: marquee, attributeName: 'style' }]);
  };
  return { overlay, grow };
}

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

test('the frame sound follows its size, ends when growth stops and powers down like a robot', async () => {
  const { overlay, grow } = fixture();
  const calls = [];
  const stop = watchPresenterCues(
    overlay,
    () => {},
    (kind, value) => calls.push(['sustain', kind, Number(value.toFixed(3))]),
    (kind, detail) => calls.push(['release', kind, detail?.robot === true]),
  );
  grow(20, 10);
  await wait(5);
  grow(120, 60);
  await wait(5);
  grow(240, 160);
  assert.equal(calls.filter((c) => c[0] === 'release').length, 0, 'still growing');
  await wait(200);
  assert.deepEqual(calls.at(-1), ['release', 'drag', true], 'ends shortly after the frame stops growing');
  const values = calls.filter((c) => c[0] === 'sustain').map((c) => c[2]);
  assert.ok(values[2] > values[1] && values[1] > values[0], 'a larger frame sounds higher');
  const releases = calls.filter((c) => c[0] === 'release').length;
  grow(240, 160);
  await wait(200);
  assert.equal(calls.filter((c) => c[0] === 'release').length, releases, 'a frame that does not change does not sound again');
  stop();
});

test('height and width both set the pitch', async () => {
  const first = fixture();
  const tallCalls = [];
  watchPresenterCues(first.overlay, () => {}, (_k, value) => tallCalls.push(value), () => {});
  first.grow(100, 240);
  const second = fixture();
  const wideCalls = [];
  watchPresenterCues(second.overlay, () => {}, (_k, value) => wideCalls.push(value), () => {});
  second.grow(100, 60);
  assert.ok(tallCalls[0] > wideCalls[0], 'a taller frame of the same width sounds higher');
});
