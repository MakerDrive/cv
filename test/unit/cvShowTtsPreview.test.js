import assert from 'node:assert/strict';
import test from 'node:test';

import { CV_SHOW_PRESENTATION_TIMELINE } from '../../src/static-pages/data/cvShowPresentationProject.js';
import {
  buildCvShowTtsPreview,
  CV_SHOW_TTS_PREVIEW_FLAG_NORMALIZED,
  CV_SHOW_TTS_PREVIEW_FLAG_TARGET_NOT_APPLIED,
  renderCvShowTtsPreviewListing,
  splitCvShowNarrationSentences,
} from '../../scripts/cv-show-tts-preview-lib.js';
import { listCvShowPronunciationTargets } from '../../src/static-pages/js/tour-player/ttsNormalize.js';

test('splitCvShowNarrationSentences keeps sentence order and indices', () => {
  const sentences = splitCvShowNarrationSentences('Первое. Второе! Третье… Четвёртое?');
  assert.deepEqual(
    sentences.map((entry) => entry.text),
    ['Первое.', 'Второе!', 'Третье…', 'Четвёртое?'],
  );
  assert.deepEqual(sentences.map((entry) => entry.index), [0, 1, 2, 3]);
  assert.deepEqual(splitCvShowNarrationSentences(''), []);
  assert.deepEqual(splitCvShowNarrationSentences(undefined), []);
});

test('buildCvShowTtsPreview normalizes branded terms before TTS', () => {
  const timeline = {
    turns: [{
      id: 'demo',
      text: 'Мы назвали её PhotoPizza. Платформа PhotoSnail шла следом.',
    }],
  };
  const preview = buildCvShowTtsPreview(timeline);
  assert.equal(preview.schema, 'cv-show-tts-preview-v1');
  assert.equal(preview.documents.length, 2);
  const first = preview.documents[0];
  assert.equal(first.sceneId, 'demo');
  assert.equal(first.sentenceIndex, 0);
  assert.equal(first.sourceText, 'Мы назвали её PhotoPizza.');
  assert.equal(first.ttsText, 'Мы назвали её Фото Пицца.');
  assert.deepEqual([...first.matchedTargets], ['PhotoPizza']);
  assert.deepEqual([...first.unappliedTargets], []);
  assert.deepEqual([...first.flags], [CV_SHOW_TTS_PREVIEW_FLAG_NORMALIZED]);
});

test('buildCvShowTtsPreview flags target spellings the dictionary leaves verbatim', () => {
  const timeline = {
    turns: [{
      id: 'demo',
      text: 'PHOTOPIZZA выросла в целый модельный ряд. Megavisor был облачной платформой.',
    }],
  };
  const preview = buildCvShowTtsPreview(timeline);
  const [verbatim, normalized] = preview.documents;
  // PHOTOPIZZA matches no dictionary key exactly, so the engine gets the raw
  // spelling and the reviewer sees the unapplied PhotoPizza target.
  assert.equal(verbatim.ttsText, 'PHOTOPIZZA выросла в целый модельный ряд.');
  assert.deepEqual([...verbatim.unappliedTargets], ['PhotoPizza']);
  assert.deepEqual([...verbatim.flags], [CV_SHOW_TTS_PREVIEW_FLAG_TARGET_NOT_APPLIED]);
  // The mixed-case spelling now has its own dictionary key, so the sentence is
  // rewritten and no sibling-key spelling is reported as unapplied.
  assert.equal(normalized.ttsText, 'Mega visor был облачной платформой.');
  assert.deepEqual([...normalized.unappliedTargets], []);
  assert.deepEqual([...normalized.flags], [CV_SHOW_TTS_PREVIEW_FLAG_NORMALIZED]);
});

test('buildCvShowTtsPreview skips sentences without any target term', () => {
  const timeline = { turns: [{ id: 'demo', text: 'Простая фраза без брендов.' }] };
  assert.equal(buildCvShowTtsPreview(timeline).documents.length, 0);
});

test('preview documents cover every scene of the real timeline that needs review', () => {
  const preview = buildCvShowTtsPreview(CV_SHOW_PRESENTATION_TIMELINE);
  const scenes = new Set(preview.documents.map((doc) => doc.sceneId));
  for (const expected of ['positioning', 'photopizza', 'f360-studio', 'symbiote-ui']) {
    assert.ok(scenes.has(expected), `expected preview documents for scene ${expected}`);
  }
  for (const doc of preview.documents) {
    const turn = CV_SHOW_PRESENTATION_TIMELINE.turns.find((entry) => entry.id === doc.sceneId);
    assert.ok(turn, `document references unknown scene ${doc.sceneId}`);
    assert.ok(turn.text.includes(doc.sourceText), 'source text must appear verbatim in the turn');
    assert.notEqual(doc.sourceText, '', 'source text is never empty');
    assert.notEqual(doc.ttsText, '', 'tts text is never empty');
  }
  // The narration spells the Auto Box scenes with a space, which no dictionary
  // key covers, so the review listing must surface that genuine mismatch.
  const unapplied = preview.documents.filter((doc) => doc.unappliedTargets.includes('AUTOBOX'));
  assert.ok(unapplied.length >= 1, 'Auto Box spelling mismatch must be visible in the preview');
});

test('renderCvShowTtsPreviewListing groups entries per scene for review', () => {
  const timeline = {
    turns: [{
      id: 'f360-studio',
      text: 'Я основал и вёл F360 Studio. Позже появился BoothBot.',
    }],
  };
  const listing = renderCvShowTtsPreviewListing(buildCvShowTtsPreview(timeline));
  assert.match(listing, /Scene: f360-studio/);
  assert.match(listing, /source text \[sentence 0\]: "Я основал и вёл F360 Studio\."/);
  assert.match(listing, /→ tts_text: "Я основал и вёл Эфф триста шестьдесят Studio\."/);
  assert.match(listing, /targets: F360/);
});

test('listCvShowPronunciationTargets exposes the dictionary keys as the default target set', () => {
  const targets = listCvShowPronunciationTargets();
  assert.ok(targets.includes('PhotoPizza'));
  assert.ok(targets.includes('MEGAVISOR'));
  assert.ok(targets.includes('Wi-Fi'));
  assert.throws(() => targets.push('nope'));
});
