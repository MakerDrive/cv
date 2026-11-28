import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import {
  CvShowMdError,
  compileCueLine,
  parseCvShowMd,
} from '../../src/static-pages/js/show-md/cvShowMdFormat.js';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const mdDir = path.join(rootDir, 'src/static-pages/copy-cv-show-md');

const SAMPLE = `---
id: sample
lang: ru-RU
---

# Sample

## [sample | mode=read] Sample scene
@audio ../copy-cv-show-audio/x/clips/a.opus
@align ../copy-cv-show-audio/x/aligned/a.json
Первая фраза сцены. Вторая фраза сцены.
@navigate projects/complexscan lead:7850
@focus project-card.one at:"Вторая фраза" lead:1450
@marker oval article.two at:"Первая фраза" occ:2 edge:end lead:100
@select article.three at:"Вторая фраза" quote:"эфир" lead:50
@media media/one/youtube/abc mode:full-with-media-audio
`;

test('parses one scene with media, narration and canonical cues', () => {
  let doc = parseCvShowMd(SAMPLE);
  assert.equal(doc.id, 'sample');
  assert.equal(doc.lang, 'ru-RU');
  assert.equal(doc.scenes.length, 1);
  let scene = doc.scenes[0];
  assert.equal(scene.audioUrl, '../copy-cv-show-audio/x/clips/a.opus');
  assert.equal(scene.alignUrl, '../copy-cv-show-audio/x/aligned/a.json');
  assert.equal(scene.speech, 'Первая фраза сцены. Вторая фраза сцены.');
  assert.equal(scene.cues.length, 5);
});

test('a turn-start cue compiles to a segment anchor and clamps its lead to scene start', () => {
  let cue = compileCueLine('@navigate projects/complexscan lead:7850', { cueId: 'c1' });
  assert.deepEqual(cue.at, { anchor: 'turn-start', offsetMs: -7850 });
  assert.deepEqual(cue.directive, { version: 'symbiote-show-v1', type: 'attention', mode: 'click', targetId: 'projects/complexscan' });
  assert.equal(cue.turnIndex, 0);
});

test('a phrase anchor compiles to the canonical speech anchor with lead as negative offset', () => {
  let cue = compileCueLine('@focus project-card.one at:"Вторая фраза" lead:1450', { cueId: 'c2' });
  assert.deepEqual(cue.at, {
    anchor: 'speech',
    quote: 'Вторая фраза',
    occurrence: 1,
    edge: 'start',
    offsetMs: -1450,
  });
  assert.equal(cue.directive.mode, 'frame');
});

test('occurrence and edge are carried into the canonical anchor', () => {
  let cue = compileCueLine('@marker oval article.two at:"Первая фраза" occ:2 edge:end lead:100', { cueId: 'c3' });
  assert.equal(cue.at.occurrence, 2);
  assert.equal(cue.at.edge, 'end');
  assert.equal(cue.directive.marker, 'oval');
  assert.equal(cue.directive.mode, 'marker');
});

test('a select cue may carry the native selection quote', () => {
  let cue = compileCueLine('@select article.three at:"Вторая фраза" quote:"эфир" lead:50', { cueId: 'c4' });
  assert.equal(cue.directive.mode, 'native-selection');
  assert.equal(cue.directive.quote, 'эфир');
});

test('a media cue names its media and mode', () => {
  let cue = compileCueLine('@media media/one/youtube/abc mode:full-with-media-audio', { cueId: 'c5' });
  assert.deepEqual(cue.directive, {
    version: 'symbiote-show-v1',
    type: 'media',
    mediaId: 'media/one/youtube/abc',
    mode: 'full-with-media-audio',
  });
});

test('unknown cues and malformed anchors fail loudly with the line number', () => {
  assert.throws(() => parseCvShowMd(`${SAMPLE}\n@dance target`), (error) => error instanceof CvShowMdError && /unknown cue/.test(error.message));
  assert.throws(() => compileCueLine('@focus x edge:middle', { cueId: 'bad', lineNumber: 9 }), /edge must be start or end.*line 9/);
  assert.throws(() => compileCueLine('@marker target', { cueId: 'bad' }), /needs a shape and a target/);
  assert.throws(() => compileCueLine('@focus x lead:soon', { cueId: 'bad' }), /lead must be an integer/);
});

test('every generated CV scene parses into one scene with its cues', async () => {
  let files = (await readdir(mdDir)).filter((name) => name.endsWith('.show.md')).sort();
  assert.equal(files.length, 30);
  let report = JSON.parse(await readFile(path.join(mdDir, 'conversion-report.json'), 'utf8'));
  let reportById = new Map(report.scenes.map((scene) => [scene.id, scene]));
  for (let file of files) {
    let doc = parseCvShowMd(await readFile(path.join(mdDir, file), 'utf8'));
    assert.equal(doc.scenes.length, 1, file);
    let expected = reportById.get(doc.scenes[0].id);
    assert.ok(expected, `report entry for ${file}`);
    assert.equal(doc.scenes[0].cues.length, expected.cues, file);
    assert.ok(doc.scenes[0].cues.every(({ cueId }) => !cueId.includes('#')), `${file}: every cue is named`);
    assert.ok(doc.scenes[0].speech.length > 0, file);
  }
});
