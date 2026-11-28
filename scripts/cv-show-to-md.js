import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath, pathToFileURL } from 'node:url';

import { CV_SHOW_AUTHORING_PROJECT_INPUT } from '../src/static-pages/data/cvShowPresentationProject.js';
import { CV_SHOW_WEB_AUDIO_RELEASE } from '../src/static-pages/data/cvShowWebAudioRelease.js';
import { parseCvShowMd } from '../src/static-pages/js/show-md/cvShowMdFormat.js';
import { cueCellToMdLine } from '../src/static-pages/js/show-md/cvShowMdProject.js';
import { scheduleSceneCues } from '../src/static-pages/js/show-md/cvShowMdTiming.js';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const audioBase = path.join(rootDir, 'src/static-pages/copy-cv-show-audio');
const outputBase = path.join(rootDir, 'src/static-pages/copy-cv-show-md');

/**
 * @param {Record<string, any>} projectInput CV show authoring project input
 * @param {{ manifest: Record<string, any>, manifestDir: string, outputRelativeBase?: string }} options
 *   `manifestDir` is the audio folder that holds `manifest.json`, relative to `copy-cv-show-audio`.
 */
export function convertCvShowProjectToMd(projectInput, { manifest, manifestDir, outputRelativeBase = '../copy-cv-show-audio' }) {
  let cells = projectInput.cells || [];
  let narrations = cells.filter((cell) => cell.kind === 'narration');
  let files = [];
  let reports = [];
  for (let narration of narrations) {
    let id = narration.turnId;
    let clip = manifest.clips.find((item) => item.id === id);
    if (!clip) throw new Error(`no manifest clip for scene "${id}"`);
    let audioUrl = `${outputRelativeBase}/${manifestDir}/${clip.deliveryFile}`;
    let alignUrl = `${outputRelativeBase}/${manifestDir}/${clip.alignedSequenceFile}`;

    let directives = projectInput.script.metadata.cvShow.directives;
    let report = { id, cues: 0 };
    let lines = [];
    for (let cell of cells) {
      if (cell.kind !== 'cue' || cell.turnId !== id) continue;
      report.cues += 1;
      lines.push(cueCellToMdLine(cell, directives[cell.id]));
    }

    let text = [
      '---',
      `id: ${id}`,
      'lang: ru-RU',
      'source: cv-show-presentation-project',
      `revision: ${projectInput.revision}`,
      '---',
      '',
      '# CV Show',
      '',
      `## [${id} | mode=read] ${id}`,
      `@audio ${audioUrl}`,
      `@align ${alignUrl}`,
      narration.turn.text.replace(/\s+/gu, ' ').trim(),
      ...lines,
      '',
    ].join('\n');
    files.push({ id, text });
    reports.push(report);
  }
  return { files, reports };
}

async function main() {
  let manifestRelativePath = CV_SHOW_WEB_AUDIO_RELEASE.manifest.path;
  let manifestDir = path.dirname(manifestRelativePath);
  let manifest = JSON.parse(await readFile(path.join(audioBase, manifestRelativePath), 'utf8'));
  let { files, reports } = convertCvShowProjectToMd(CV_SHOW_AUTHORING_PROJECT_INPUT, { manifest, manifestDir });

  await mkdir(outputBase, { recursive: true });
  for (let file of files) {
    await writeFile(path.join(outputBase, `${file.id}.show.md`), file.text, 'utf8');
  }

  // Each written scene is parsed back and its anchors resolved against its own aligned sequence: a quote that the
  // recognizer did not write as those words falls back to the segment start, and the report lists it.
  for (let [index, file] of files.entries()) {
    let scene = parseCvShowMd(file.text).scenes[0];
    let aligned = JSON.parse(await readFile(path.join(outputBase, scene.alignUrl), 'utf8'));
    let { fallbacks } = scheduleSceneCues(aligned, scene.cues);
    reports[index].anchorFallbacks = fallbacks.map((item) => ({ cueId: item.cueId, quote: item.quote, reason: item.reason }));
  }
  await writeFile(path.join(outputBase, 'conversion-report.json'), `${JSON.stringify({ scenes: reports }, null, 2)}\n`, 'utf8');

  let totals = reports.reduce((sum, item) => ({
    cues: sum.cues + item.cues,
    fallbacks: sum.fallbacks + item.anchorFallbacks.length,
  }), { cues: 0, fallbacks: 0 });
  process.stdout.write(`wrote ${files.length} scenes to ${path.relative(rootDir, outputBase)}\n`);
  process.stdout.write(`cues ${totals.cues}\n`);
  process.stdout.write(`anchors falling back to segment start: ${totals.fallbacks}\n`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await main();
}
