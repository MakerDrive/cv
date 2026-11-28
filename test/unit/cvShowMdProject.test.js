import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { CV_SHOW_AUTHORING_PROJECT_INPUT } from '../../src/static-pages/data/cvShowPresentationProject.js';
import { CvShowMdError, parseCvShowMd } from '../../src/static-pages/js/show-md/cvShowMdFormat.js';
import {
  applyCvShowMdScenes,
  cueCellToMdLine,
  mdLineToCueCell,
} from '../../src/static-pages/js/show-md/cvShowMdProject.js';
import {
  attachCvShowMdEngine,
  cvShowMdEnginePending,
  isCvShowMdEngineRequested,
} from '../../src/static-pages/js/show-md/cvShowMdRuntimeSource.js';

const mdDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '../../src/static-pages/copy-cv-show-md');
const project = CV_SHOW_AUTHORING_PROJECT_INPUT;
const directives = project.script.metadata.cvShow.directives;

async function readScenes() {
  let names = (await readdir(mdDir)).filter((name) => name.endsWith('.show.md'));
  let scenes = [];
  for (let name of names) scenes.push(...parseCvShowMd(await readFile(path.join(mdDir, name), 'utf8')).scenes);
  return scenes;
}

test('the md scenes compile back into exactly the presentation project', async () => {
  let scenes = await readScenes();
  assert.equal(scenes.length, 30);
  let compiled = applyCvShowMdScenes(project, scenes);
  assert.equal(JSON.stringify(compiled.cells), JSON.stringify(project.cells));
  assert.deepStrictEqual(compiled.script, project.script);
});

test('every cue cell survives a line round-trip', () => {
  for (let cell of project.cells.filter(({ kind }) => kind === 'cue')) {
    let line = cueCellToMdLine(cell, directives[cell.id]);
    let { cell: back, policy } = mdLineToCueCell(line, { turnId: cell.turnId });
    assert.equal(JSON.stringify(back), JSON.stringify(cell), line);
    assert.equal(policy, directives[cell.id]?.policy ?? null, line);
  }
});

test('an edited cue line changes only that cell and keeps its directive refinements', async () => {
  let scenes = await readScenes();
  let target = 'cv-show:cue:complexscan.line:scroll';
  let edited = scenes.map((scene) => (scene.id !== 'complexscan' ? scene : {
    ...scene,
    cues: scene.cues.map((cue) => (cue.cueId !== 'complexscan.line:scroll' ? cue : {
      ...cue,
      sourceLine: cue.sourceLine.replace('lead:2500', 'lead:3100').replace('gesture:800', 'gesture:1400'),
    })),
  }));
  let compiled = applyCvShowMdScenes(project, edited);
  let changed = compiled.cells.filter((cell, index) => JSON.stringify(cell) !== JSON.stringify(project.cells[index]));
  assert.deepEqual(changed.map(({ id }) => id), [target]);
  assert.equal(changed[0].timing.leadMs, 3100);
  assert.equal(changed[0].timing.gestureDurationMs, 1400);
  assert.deepStrictEqual(compiled.script, project.script);
});

test('md that cannot describe the recorded show is refused with its line', async () => {
  let [scene] = (await readScenes()).filter(({ id }) => id === 'complexscan');
  assert.throws(
    () => applyCvShowMdScenes(project, [{ ...scene, speech: `${scene.speech} Ещё одна фраза.` }]),
    /narration differs from the recorded audio/u,
  );
  assert.throws(
    () => mdLineToCueCell('@focus article.x at:"слово" gesture:800', { turnId: 'complexscan', lineNumber: 7 }),
    (error) => error instanceof CvShowMdError && error.line === 7 && /needs an #id/u.test(error.message),
  );
  assert.throws(
    () => mdLineToCueCell('@focus article.x #a', { turnId: 'complexscan', lineNumber: 3 }),
    /needs gesture/u,
  );
  assert.throws(
    () => parseCvShowMd('## [s] s\nТекст.\n@focus a #x gesture:1\n@focus b #x gesture:1\n'),
    /duplicate cue id "x"/u,
  );
});

test('the md engine is attached only on ?showEngine=md and a start can wait for it', async () => {
  assert.equal(isCvShowMdEngineRequested('https://example.test/cv/?showEngine=md'), true);
  assert.equal(isCvShowMdEngineRequested('https://example.test/cv/?showEngine=classic'), false);
  assert.equal(isCvShowMdEngineRequested(undefined), false);

  let attached = [];
  let authority = { attachSource: (source) => { attached.push(source); return () => {}; } };
  assert.equal(await attachCvShowMdEngine({ authority, location: 'https://example.test/cv/' }), null);
  assert.equal(cvShowMdEnginePending(), null);

  let scenes = await readScenes();
  let attach = attachCvShowMdEngine({
    authority,
    location: 'https://example.test/cv/?showEngine=md',
    load: async () => scenes,
  });
  assert.equal(cvShowMdEnginePending(), attach);
  assert.equal(typeof await attach, 'function');
  assert.equal(cvShowMdEnginePending(), null);
  assert.equal(attached.length, 1);
  assert.equal(attached[0].getView().playable, true);
  assert.equal(attached[0].read().project.cells.length, project.cells.length);
});

test('a failing md source leaves the built-in project in place', async () => {
  let authority = { attachSource: () => assert.fail('must not attach') };
  let detach = await attachCvShowMdEngine({
    authority,
    location: 'https://example.test/cv/?showEngine=md',
    load: async () => { throw new CvShowMdError('broken scene', 4); },
  });
  assert.equal(detach, null);
});
