import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import { validateShowAlignedSequence } from 'symbiote-ui/chat/show-runtime';
import { parseCvShowMd } from '../../src/static-pages/js/show-md/cvShowMdFormat.js';
import { createBrowserVoiceAlignedSequence, scheduleSceneCues } from '../../src/static-pages/js/show-md/cvShowMdTiming.js';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const mdDir = path.join(rootDir, 'src/static-pages/copy-cv-show-md');

async function loadScene(id) {
  let doc = parseCvShowMd(await readFile(path.join(mdDir, `${id}.show.md`), 'utf8'));
  let scene = doc.scenes[0];
  let aligned = JSON.parse(await readFile(path.join(mdDir, scene.alignUrl), 'utf8'));
  return { scene, aligned };
}

test('browser-voice timeline is a valid aligned sequence with monotonic words', () => {
  let sequence = createBrowserVoiceAlignedSequence({
    words: [
      { text: 'Первая', startMs: 0, endMs: 400 },
      { text: 'фраза', startMs: 380, endMs: 380 },
      { text: 'сцены.', startMs: 500, endMs: 900.4 },
    ],
    lang: 'ru',
  });
  validateShowAlignedSequence(sequence);
  let words = sequence.turns[0].words;
  assert.equal(words[1].startMs, 400, 'overlap is pushed to the end of the previous word');
  assert.ok(words[1].endMs > words[1].startMs, 'zero-length word gets a non-empty span');
  assert.equal(sequence.media.durationMs, words.at(-1).endMs);
});

test('recorded anchor resolves to the start of the phrase in the aligned words', async () => {
  let { scene, aligned } = await loadScene('complexscan');
  let { schedule } = scheduleSceneCues(aligned, scene.cues);
  let cue = scene.cues.find((item) => item.at.quote === 'Основой стали профессиональные поворотные платформы');
  let item = schedule.find((entry) => entry.cueId === cue.cueId);
  assert.equal(item.alignment.resolution, 'exact');
  let words = aligned.turns[0].words;
  let index = words.findIndex((word) => word.text.startsWith('Основой'));
  assert.equal(item.timeMs, words[index].startMs + cue.at.offsetMs, 'lead is applied before the phrase');
});

test('both voices resolve the same phrase to the same timing when their words match', async () => {
  let { scene, aligned } = await loadScene('complexscan');
  let recorded = scheduleSceneCues(aligned, scene.cues);
  let browser = scheduleSceneCues(createBrowserVoiceAlignedSequence({
    words: aligned.turns[0].words.map((word) => ({ text: word.text, startMs: word.startMs, endMs: word.endMs })),
    lang: 'ru',
  }), scene.cues);
  assert.equal(recorded.schedule.length, browser.schedule.length);
  recorded.schedule.forEach((item, index) => {
    assert.equal(item.cueId, browser.schedule[index].cueId);
    assert.equal(item.timeMs, browser.schedule[index].timeMs, item.cueId);
  });
});

test('an anchor whose phrase is not in the recognized words falls back to the segment and is reported', async () => {
  let { scene, aligned } = await loadScene('photopizza');
  let { fallbacks } = scheduleSceneCues(aligned, scene.cues);
  assert.ok(fallbacks.length > 0, 'photopizza has quotes with Latin names the recognizer wrote differently');
  assert.ok(fallbacks.every((item) => item.reason === 'word-anchor-missing' || item.reason === 'word-evidence-unreliable'));
});
