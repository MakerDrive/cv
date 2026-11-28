import { CvShowMdError, tokenizeCueLine } from './cvShowMdFormat.js';

/**
 * CV Show Markdown as the authoring source of the presentation project.
 *
 * A `.show.md` cue line carries the whole cue cell: its id, anchor, lead, gesture length, settlement, the barriers
 * it waits for and its directive policy. `cueCellToMdLine()` writes a cell as a line and `mdLineToCueCell()` reads
 * it back; `applyCvShowMdScenes()` replaces the cue cells of each md scene in a project. Converting a project to md
 * and applying it back yields the same project, so the md files can become the source without losing semantics.
 *
 * Cue line, in addition to the timing syntax of cvShowMdFormat.js:
 *   `#<id>`              cell `cv-show:cue:<id>`
 *   `gesture:<ms>`       timing.gestureDurationMs (required)
 *   `settle:anchor`      timing.settleBy (default `none`)
 *   `until:turn-end`     timing.until (default none)
 *   `after:<id>[,<id>]`  waits until those cues settle
 *   `clip:<nn>[,<nn>]`   waits until those narration clips of the scene end
 *   `policy:<policy>`    directive policy (`required` | `optional`); omitted means no directive entry
 *   `series:` `label:` `intent:` and `quote:` describe a marker annotation
 *
 * Directive refinements (safe paths, gallery frames) are not authored in md: an existing cue keeps them by id.
 */

const CUE_PREFIX = 'cv-show:cue:';
const CLIP_PREFIX = 'cv-show:audio-clip:';

const LAYERS = Object.freeze({
  focus: 'cv-show:layer:focus',
  annotation: 'cv-show:layer:annotation',
  interaction: 'cv-show:layer:interaction',
});

const INTERACTIONS = new Set(['scroll', 'navigate', 'click', 'select']);

const defaultIntent = (marker) => (marker === 'arrow' ? 'pointer' : 'emphasize');

/**
 * @param {string} value
 * @param {string} cellId
 */
function quoted(value, cellId) {
  let text = String(value);
  if (text.includes('"')) throw new Error(`cue ${cellId}: quote contains a double quote`);
  return `"${text}"`;
}

/**
 * @param {string} id
 * @param {string} prefix
 * @param {string} cellId
 */
function stripPrefix(id, prefix, cellId) {
  if (!String(id).startsWith(prefix)) throw new Error(`cue ${cellId}: "${id}" is not a ${prefix} id`);
  return id.slice(prefix.length);
}

/**
 * Writes one cue cell (and its directive entry) as an md cue line.
 * @param {Record<string, any>} cell
 * @param {Record<string, any> | undefined} directiveEntry `script.metadata.cvShow.directives[cell.id]`
 * @returns {string}
 */
export function cueCellToMdLine(cell, directiveEntry = undefined) {
  let { cue, timing } = cell;
  let parts = [];
  if (cue.kind === 'focus') {
    if (cue.focus?.mode !== 'frame') throw new Error(`cue ${cell.id}: focus mode "${cue.focus?.mode}" has no md form`);
    parts.push('@focus', cue.targetId);
  } else if (cue.kind === 'annotation') {
    let annotation = cue.annotation;
    parts.push('@marker', annotation.marker, cue.targetId);
    if (annotation.intent !== defaultIntent(annotation.marker)) parts.push(`intent:${annotation.intent}`);
    if (annotation.label !== undefined) parts.push(`label:${annotation.label}`);
    if (annotation.series !== undefined) parts.push(`series:${annotation.series}`);
    if (annotation.quote !== undefined) {
      if (annotation.occurrence !== 1) throw new Error(`cue ${cell.id}: marker quote occurrence must be 1`);
      parts.push(`quote:${quoted(annotation.quote, cell.id)}`);
    }
  } else if (cue.kind === 'interaction') {
    let type = cue.interaction?.type;
    if (!INTERACTIONS.has(type) || cue.interaction.reversible !== false) {
      throw new Error(`cue ${cell.id}: interaction "${type}" has no md form`);
    }
    parts.push(`@${type}`, cue.targetId);
  } else {
    throw new Error(`cue ${cell.id}: cue kind "${cue.kind}" has no md form`);
  }

  let at = timing.at;
  if (at.offsetMs !== 0) throw new Error(`cue ${cell.id}: anchor offset has no md form, use lead`);
  if (at.anchor === 'speech') {
    parts.push(`at:${quoted(at.quote, cell.id)}`);
    if (at.occurrence !== 1) parts.push(`occ:${at.occurrence}`);
    if (at.edge !== 'start') parts.push(`edge:${at.edge}`);
  } else if (at.anchor !== 'turn-start') {
    throw new Error(`cue ${cell.id}: anchor "${at.anchor}" has no md form`);
  }
  if (timing.leadMs) parts.push(`lead:${timing.leadMs}`);
  parts.push(`#${stripPrefix(cell.id, CUE_PREFIX, cell.id)}`);
  parts.push(`gesture:${timing.gestureDurationMs}`);
  if (timing.settleBy !== 'none') parts.push(`settle:${timing.settleBy}`);
  if (timing.until) {
    if (timing.until.anchor !== 'turn-end' || timing.until.offsetMs !== 0) {
      throw new Error(`cue ${cell.id}: until has no md form`);
    }
    parts.push('until:turn-end');
  }

  let after = [];
  let clips = [];
  for (let dependency of cell.dependsOn || []) {
    if (dependency.barrier === 'settled') {
      after.push(stripPrefix(dependency.cellId, CUE_PREFIX, cell.id));
    } else if (dependency.barrier === 'ended') {
      let clip = stripPrefix(dependency.cellId, `${CLIP_PREFIX}${cell.turnId}:`, cell.id);
      clips.push(clip);
    } else {
      throw new Error(`cue ${cell.id}: barrier "${dependency.barrier}" has no md form`);
    }
  }
  if (after.length && clips.length && cell.dependsOn[0].barrier !== 'settled') {
    throw new Error(`cue ${cell.id}: clip barriers before cue barriers have no md form`);
  }
  if (after.length) parts.push(`after:${after.join(',')}`);
  if (clips.length) parts.push(`clip:${clips.join(',')}`);
  if (directiveEntry) parts.push(`policy:${directiveEntry.policy}`);
  return parts.join(' ');
}

/**
 * @param {string | undefined} value
 * @param {string} key
 * @param {number} lineNumber
 */
function nonNegativeInteger(value, key, lineNumber) {
  if (!/^\d+$/u.test(String(value))) throw new CvShowMdError(`${key} must be a non-negative integer`, lineNumber);
  return Number(value);
}

/**
 * Reads one md cue line as a cue cell of scene `turnId`.
 * @param {string} line
 * @param {{ turnId: string, lineNumber?: number }} options
 * @returns {{ cell: Record<string, any>, policy: string | null }}
 */
export function mdLineToCueCell(line, { turnId, lineNumber = 0 }) {
  let { name, positional, params } = tokenizeCueLine(line, lineNumber);
  if (!params.id) throw new CvShowMdError(`@${name} needs an #id`, lineNumber);
  let id = `${CUE_PREFIX}${params.id}`;

  let cue;
  let layerId;
  if (name === 'focus') {
    cue = { focus: { mode: 'frame' }, kind: 'focus', targetId: positional[0] };
    layerId = LAYERS.focus;
  } else if (name === 'marker') {
    let [marker, targetId] = positional;
    // Keys in alphabetical order, as the canonical project writes them.
    let annotation = {
      intent: params.intent || defaultIntent(marker),
      ...(params.label !== undefined ? { label: params.label } : {}),
      marker,
      ...(params.quote !== undefined ? { occurrence: 1, quote: params.quote } : {}),
      ...(params.series !== undefined ? { series: params.series } : {}),
    };
    cue = { annotation, kind: 'annotation', targetId };
    layerId = LAYERS.annotation;
  } else if (INTERACTIONS.has(name)) {
    cue = { interaction: { reversible: false, type: name }, kind: 'interaction', targetId: positional[0] };
    layerId = LAYERS.interaction;
  } else {
    throw new CvShowMdError(`@${name} has no presentation cue`, lineNumber);
  }
  if (!cue.targetId) throw new CvShowMdError(`@${name} needs a target`, lineNumber);

  let at = params.at !== undefined
    ? {
      anchor: 'speech',
      edge: params.edge || 'start',
      occurrence: params.occ === undefined ? 1 : nonNegativeInteger(params.occ, 'occ', lineNumber),
      offsetMs: 0,
      quote: params.at,
    }
    : { anchor: 'turn-start', offsetMs: 0 };
  if (params.gesture === undefined) throw new CvShowMdError(`@${name} #${params.id} needs gesture:<ms>`, lineNumber);
  if (params.settle !== undefined && !['anchor', 'none'].includes(params.settle)) {
    throw new CvShowMdError(`settle must be anchor or none: ${params.settle}`, lineNumber);
  }
  if (params.until !== undefined && params.until !== 'turn-end') {
    throw new CvShowMdError(`until must be turn-end: ${params.until}`, lineNumber);
  }
  if (params.policy !== undefined && !['required', 'optional'].includes(params.policy)) {
    throw new CvShowMdError(`policy must be required or optional: ${params.policy}`, lineNumber);
  }
  let list = (value) => (value === undefined ? [] : value.split(',').map((item) => item.trim()).filter(Boolean));
  let dependsOn = [
    ...list(params.after).map((cueId) => ({ barrier: 'settled', cellId: `${CUE_PREFIX}${cueId}` })),
    ...list(params.clip).map((clip) => ({ barrier: 'ended', cellId: `${CLIP_PREFIX}${turnId}:${clip}` })),
  ];

  return {
    cell: {
      cue,
      dependsOn,
      id,
      kind: 'cue',
      layerId,
      timing: {
        at,
        gestureDurationMs: nonNegativeInteger(params.gesture, 'gesture', lineNumber),
        leadMs: params.lead === undefined ? 0 : nonNegativeInteger(params.lead, 'lead', lineNumber),
        settleBy: params.settle || 'none',
        until: params.until ? { anchor: 'turn-end', offsetMs: 0 } : null,
      },
      turnId,
    },
    policy: params.policy || null,
  };
}

/**
 * Replaces the cue cells (and their directive entries) of every md scene in the project. Scenes without an md
 * file keep their cells. The md narration must match the recorded turn: changing the words needs new audio.
 *
 * @param {Record<string, any>} projectInput
 * @param {Array<{ id: string, speech: string, cues: Array<{ sourceLine: string }> }>} scenes parsed md scenes
 * @returns {Record<string, any>} a new project input
 */
export function applyCvShowMdScenes(projectInput, scenes) {
  let directives = { ...projectInput.script.metadata.cvShow.directives };
  let byTurn = new Map();
  for (let scene of scenes) {
    let narration = projectInput.cells.find((cell) => cell.kind === 'narration' && cell.turnId === scene.id);
    if (!narration) throw new CvShowMdError(`md scene "${scene.id}" has no narration in the project`);
    let recorded = narration.turn.text.replace(/\s+/gu, ' ').trim();
    if (scene.speech.replace(/\s+/gu, ' ').trim() !== recorded) {
      throw new CvShowMdError(`md scene "${scene.id}" narration differs from the recorded audio`);
    }
    if (byTurn.has(scene.id)) throw new CvShowMdError(`md scene "${scene.id}" is defined twice`);
    let cells = scene.cues.map((cue) => {
      let { cell, policy } = mdLineToCueCell(cue.sourceLine, { turnId: scene.id });
      let previous = directives[cell.id];
      if (policy) directives[cell.id] = { policy, refinements: previous?.refinements || {} };
      else delete directives[cell.id];
      return cell;
    });
    byTurn.set(scene.id, cells);
  }
  for (let [turnId] of byTurn) {
    for (let cell of projectInput.cells) {
      if (cell.kind === 'cue' && cell.turnId === turnId && !byTurn.get(turnId).some(({ id }) => id === cell.id)) {
        delete directives[cell.id];
      }
    }
  }

  let ids = new Set();
  let cells = [];
  let placed = new Set();
  for (let cell of projectInput.cells) {
    if (cell.kind !== 'cue' || !byTurn.has(cell.turnId)) {
      cells.push(cell);
      continue;
    }
    if (placed.has(cell.turnId)) continue;
    placed.add(cell.turnId);
    cells.push(...byTurn.get(cell.turnId));
  }
  for (let [turnId, turnCells] of byTurn) {
    if (placed.has(turnId)) continue;
    let narrationIndex = cells.findIndex((cell) => cell.kind === 'narration' && cell.turnId === turnId);
    cells.splice(narrationIndex + 1, 0, ...turnCells);
  }
  for (let cell of cells) {
    if (ids.has(cell.id)) throw new CvShowMdError(`cell id "${cell.id}" is used twice`);
    ids.add(cell.id);
  }

  return {
    ...projectInput,
    cells,
    script: {
      ...projectInput.script,
      metadata: {
        ...projectInput.script.metadata,
        cvShow: { ...projectInput.script.metadata.cvShow, directives },
      },
    },
  };
}
