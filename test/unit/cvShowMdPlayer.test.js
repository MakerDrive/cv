import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import { parseCvShowMd } from '../../src/static-pages/js/show-md/cvShowMdFormat.js';
import { createCvShowMdPlayer } from '../../src/static-pages/js/show-md/cvShowMdPlayer.js';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const mdDir = path.join(rootDir, 'src/static-pages/copy-cv-show-md');

async function loadScene(id) {
  let doc = parseCvShowMd(await readFile(path.join(mdDir, `${id}.show.md`), 'utf8'));
  let scene = doc.scenes[0];
  let aligned = JSON.parse(await readFile(path.join(mdDir, scene.alignUrl), 'utf8'));
  return { scene, aligned };
}

function fakeTarget(id) {
  return { id, getBoundingClientRect: () => ({ top: 0, bottom: 10 }), scrollIntoView() {} };
}

function fakeMedia() {
  let media = Object.assign(new EventTarget(), {
    currentTime: 0,
    paused: false,
    src: '',
    ownerDocument: null,
    play: () => Promise.resolve(),
  });
  return media;
}

const noClock = { request: () => 1, cancel() {} };

test('recorded voice fires each cue once at its anchor and gives scrolls the room to the next anchor', async () => {
  let { scene, aligned } = await loadScene('complexscan');
  let media = fakeMedia();
  let fired = [];
  let scrolls = [];
  let presented = [];
  let diagnostics = [];
  let player = createCvShowMdPlayer({
    scene,
    voice: 'recorded',
    media,
    fetchJson: async () => aligned,
    resolveTarget: (targetId) => fakeTarget(targetId),
    scrollInto: (target, budgetMs) => scrolls.push({ id: target.id, budgetMs }),
    attention: { present: (request) => presented.push(request), cancel() {} },
    onCueFired: (entry) => fired.push(entry),
    onDiagnostic: (entry) => diagnostics.push(entry),
    playbackClock: noClock,
  });
  let done = player.start();
  // The aligned sequence loads asynchronously; the runtime attaches to the media once it is scheduled.
  await new Promise((resolve) => setImmediate(resolve));
  let schedule = player.getSchedule();
  let last = schedule.at(-1).timeMs;
  for (let time = 0; time <= last + 500; time += 250) {
    media.currentTime = time / 1000;
    media.dispatchEvent(new Event('timeupdate'));
  }
  media.dispatchEvent(new Event('ended'));
  await done;

  assert.deepEqual(fired.map((entry) => entry.cueId), schedule.map((item) => item.cueId), 'every cue fires once, in schedule order');
  for (let entry of fired) {
    let item = schedule.find((candidate) => candidate.cueId === entry.cueId);
    assert.ok(entry.cueTimeMs >= item.timeMs, `${entry.cueId} fires at or after its anchor`);
  }
  let first = fired[0];
  let next = schedule[1].timeMs;
  assert.equal(scrolls[0].budgetMs, Math.max(0, next - first.cueTimeMs), 'scroll budget is the time until the next anchor');
  assert.ok(presented.length > 0, 'attention is presented');
  assert.ok(diagnostics.every((entry) => entry.kind !== 'target-unresolved'), 'every target resolves');
});

test('browser voice drives the same schedule from the speech word clock', async () => {
  let { scene, aligned } = await loadScene('complexscan');
  let words = aligned.turns[0].words;
  let positionMs = 0;
  let speechDone = null;
  let frames = [];
  let fired = [];
  let speech = {
    speak: () => new Promise((resolve) => { speechDone = resolve; }),
    getClock: () => ({ playing: true, positionMs, words: words.map((word) => ({ text: word.text, startMs: word.startMs, endMs: word.endMs })) }),
    stop() {},
  };
  let player = createCvShowMdPlayer({
    scene,
    voice: 'browser',
    speech,
    resolveTarget: (targetId) => fakeTarget(targetId),
    scrollInto: () => {},
    onCueFired: (entry) => fired.push(entry),
    frame: (callback) => { frames.push(callback); return frames.length; },
    cancelFrame: () => {},
  });
  let done = player.start();
  let pump = () => {
    let queue = frames;
    frames = [];
    queue.forEach((callback) => callback());
  };
  pump();
  let end = words.at(-1).endMs;
  for (positionMs = 0; positionMs <= end + 200; positionMs += 300) pump();
  speechDone({ status: 'completed' });
  await done;

  let expected = player.getSchedule().map((item) => item.cueId);
  assert.deepEqual(fired.map((entry) => entry.cueId), expected);
  assert.equal(new Set(fired.map((entry) => entry.cueId)).size, fired.length, 'no cue fires twice');
});
