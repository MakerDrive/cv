import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath, pathToFileURL } from 'node:url';

import { CV_SHOW_AUTHORING_PROJECT_INPUT } from '../src/static-pages/data/cvShowPresentationProject.js';
import { CV_SHOW_WEB_AUDIO_RELEASE } from '../src/static-pages/data/cvShowWebAudioRelease.js';
import { parseCvShowMd } from '../src/static-pages/js/show-md/cvShowMdFormat.js';
import { scheduleSceneCues } from '../src/static-pages/js/show-md/cvShowMdTiming.js';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const audioBase = path.join(rootDir, 'src/static-pages/copy-cv-show-audio');
const outputBase = path.join(rootDir, 'src/static-pages/copy-cv-show-md');

/** Canonical interaction types that map one-to-one onto md cue names. */
const INTERACTION_NAMES = Object.freeze({
  scroll: 'scroll',
  navigate: 'navigate',
  click: 'click',
  select: 'select',
});

/**
 * @param {string} value
 * @param {string} cellId
 */
function quoted(value, cellId) {
  let text = String(value);
  if (text.includes('"')) throw new Error(`cue ${cellId}: quote contains a double quote`);
  return text;
}

/**
 * Converts one cue cell into an md cue line (or reports why it cannot be expressed).
 * @param {Record<string, any>} cell
 * Fields the md form cannot express are returned in `dropped`, so the report lists them instead of hiding them.
 * @returns {{ line: string | null, dropped: string[], unmapped: string | null, leadClamped: boolean }}
 */
export function cueCellToMdLine(cell) {
  let dropped = [];
  let timing = cell.timing || {};
  let at = timing.at || {};
  let offsetMs = Number(at.offsetMs || 0);
  let leadMs = Number(timing.leadMs || 0);
  let lead = leadMs - offsetMs;

  let name = null;
  let target = cell.cue?.targetId;
  if (cell.cue?.kind === 'focus') {
    name = 'focus';
  } else if (cell.cue?.kind === 'annotation') {
    let marker = cell.cue.annotation?.marker;
    if (!marker) return { line: null, dropped, unmapped: 'annotation without marker shape', leadClamped: false };
    name = `marker ${marker}`;
    if (cell.cue.annotation.series) dropped.push('annotation.series');
  } else if (cell.cue?.kind === 'interaction') {
    let type = cell.cue.interaction?.type;
    if (!INTERACTION_NAMES[type]) {
      return { line: null, dropped, unmapped: `interaction type "${type}" has no md cue`, leadClamped: false };
    }
    name = INTERACTION_NAMES[type];
  } else {
    return { line: null, dropped, unmapped: `cue kind "${cell.cue?.kind}" has no md cue`, leadClamped: false };
  }

  let parts = [`@${name}`, target];
  if (at.anchor === 'speech') {
    if (!at.quote) return { line: null, dropped, unmapped: 'speech anchor without quote', leadClamped: false };
    parts.push(`at:"${quoted(at.quote, cell.id)}"`);
    if (at.occurrence && at.occurrence !== 1) parts.push(`occ:${at.occurrence}`);
    if (at.edge === 'end') parts.push('edge:end');
  } else if (at.anchor !== 'turn-start') {
    return { line: null, dropped, unmapped: `anchor "${at.anchor}" has no md form`, leadClamped: false };
  }
  // A turn-start cue with a lead resolves before the scene starts: the md runtime fires it at the scene start.
  let leadClamped = at.anchor !== 'speech' && lead > 0;
  if (lead > 0) parts.push(`lead:${lead}`);
  if (timing.until) dropped.push('timing.until');
  if (timing.settleBy && timing.settleBy !== 'none') dropped.push(`timing.settleBy:${timing.settleBy}`);
  if (timing.gestureDurationMs !== undefined) dropped.push('timing.gestureDurationMs');
  for (let entry of cell.dependsOn || []) dropped.push(`dependsOn:${entry.barrier}:${entry.cellId}`);
  return { line: parts.join(' '), dropped, unmapped: null, leadClamped };
}

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

    let report = { id, cues: 0, expressed: 0, dropped: [], unmapped: [], leadClamped: [] };
    let lines = [];
    for (let cell of cells) {
      if (cell.kind !== 'cue' || cell.turnId !== id) continue;
      report.cues += 1;
      let result = cueCellToMdLine(cell);
      if (result.unmapped) {
        report.unmapped.push({ cellId: cell.id, reason: result.unmapped });
        continue;
      }
      report.expressed += 1;
      if (result.leadClamped) report.leadClamped.push(cell.id);
      for (let field of result.dropped) report.dropped.push({ cellId: cell.id, field });
      lines.push(result.line);
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
    expressed: sum.expressed + item.expressed,
    unmapped: sum.unmapped + item.unmapped.length,
    dropped: sum.dropped + item.dropped.length,
    fallbacks: sum.fallbacks + item.anchorFallbacks.length,
  }), { cues: 0, expressed: 0, unmapped: 0, dropped: 0, fallbacks: 0 });
  process.stdout.write(`wrote ${files.length} scenes to ${path.relative(rootDir, outputBase)}\n`);
  process.stdout.write(`cues ${totals.cues}: expressed ${totals.expressed}, unmapped ${totals.unmapped}; dropped fields ${totals.dropped}\n`);
  process.stdout.write(`anchors falling back to segment start: ${totals.fallbacks}\n`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await main();
}
