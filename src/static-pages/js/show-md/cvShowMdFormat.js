import { normalizeShowDirective } from 'symbiote-ui/chat/show-runtime';

/**
 * CV Show Markdown: one `.show.md` file per scene. A scene is one step with one recorded clip
 * (`@audio`) and its Whisper aligned sequence (`@align`). Cues are lines that compile to the canonical
 * Show objects used by `createShowAlignedCueSchedule()`: an anchor `{ turnIndex, anchor, quote, occurrence,
 * edge, offsetMs }` and a generic directive. No anchor format of its own.
 *
 * Cue syntax:
 *   `@<name> [<shape>] <target> [at:"<quote>"] [occ:<n>] [edge:start|end] [lead:<ms>] [quote:"<text>"]`
 *   names: focus, marker (requires <shape>), click, navigate, select, scroll, media (<mediaId> mode:<mode>)
 *   `at:` anchors to the recognized words of the scene; without it the cue fires at scene start.
 *   `lead:` fires the cue that many milliseconds before the anchor (canonical offsetMs = -lead).
 */

export const CV_SHOW_MD_CUE_NAMES = Object.freeze([
  'focus',
  'marker',
  'click',
  'navigate',
  'select',
  'scroll',
  'media',
]);

const PARAM_KEYS = new Set(['at', 'occ', 'edge', 'lead', 'quote', 'mode']);
const TOKEN_RE = /[a-z]+:"[^"]*"|"[^"]*"|\S+/gu;
const STEP_HEADING_RE = /^##\s+\[([^\]]+)\]\s+(.+)$/u;

export class CvShowMdError extends SyntaxError {
  constructor(message, line = 0) {
    super(line ? `${message} (line ${line})` : message);
    this.name = 'CvShowMdError';
    this.line = line;
  }
}

/**
 * @param {string} line
 * @param {number} lineNumber
 * @returns {{ name: string, positional: string[], params: Record<string, string> }}
 */
export function tokenizeCueLine(line, lineNumber = 0) {
  let match = /^@([a-z]+)\s*(.*)$/u.exec(line.trim());
  if (!match) throw new CvShowMdError(`not a cue line: ${line}`, lineNumber);
  let [, name, rest] = match;
  let positional = [];
  /** @type {Record<string, string>} */
  let params = {};
  for (let token of rest.match(TOKEN_RE) || []) {
    let paramMatch = /^([a-z]+):(.*)$/u.exec(token);
    if (paramMatch && PARAM_KEYS.has(paramMatch[1])) {
      params[paramMatch[1]] = paramMatch[2].replace(/^"(.*)"$/u, '$1');
    } else {
      positional.push(token.replace(/^"(.*)"$/u, '$1'));
    }
  }
  return { name, positional, params };
}

/**
 * @param {string | undefined} value
 * @param {number} lineNumber
 * @param {string} key
 * @returns {number | undefined}
 */
function integerParam(value, lineNumber, key) {
  if (value === undefined) return undefined;
  if (!/^-?\d+$/u.test(value)) throw new CvShowMdError(`${key} must be an integer: ${value}`, lineNumber);
  return Number(value);
}

/**
 * Compiles one cue line into the canonical cue record (anchor + generic directive).
 * @param {string} line
 * @param {{ cueId: string, lineNumber?: number }} options
 */
export function compileCueLine(line, { cueId, lineNumber = 0 }) {
  let { name, positional, params } = tokenizeCueLine(line, lineNumber);
  if (!CV_SHOW_MD_CUE_NAMES.includes(name)) {
    throw new CvShowMdError(`unknown cue "@${name}"`, lineNumber);
  }
  let leadMs = integerParam(params.lead, lineNumber, 'lead') || 0;
  let occurrence = integerParam(params.occ, lineNumber, 'occ') || 1;
  let at = params.at !== undefined
    ? {
      anchor: 'speech',
      quote: params.at,
      occurrence,
      edge: params.edge || 'start',
      offsetMs: -leadMs,
    }
    : { anchor: 'turn-start', offsetMs: -leadMs };
  if (params.edge !== undefined && !['start', 'end'].includes(params.edge)) {
    throw new CvShowMdError(`edge must be start or end: ${params.edge}`, lineNumber);
  }

  let directive;
  if (name === 'media') {
    directive = { type: 'media', mediaId: positional[0], mode: params.mode || 'short-muted-montage' };
  } else if (name === 'marker') {
    if (positional.length < 2) throw new CvShowMdError('@marker needs a shape and a target', lineNumber);
    directive = { type: 'attention', mode: 'marker', marker: positional[0], targetId: positional[1] };
  } else {
    let targetId = positional[0];
    if (!targetId) throw new CvShowMdError(`@${name} needs a target`, lineNumber);
    let mode = {
      focus: 'frame',
      click: 'click',
      navigate: 'click',
      select: 'native-selection',
      scroll: 'cursor',
    }[name];
    directive = {
      type: 'attention',
      mode,
      targetId,
      ...(params.quote !== undefined ? { quote: params.quote } : {}),
    };
  }

  let normalized;
  try {
    normalized = normalizeShowDirective(directive);
  } catch (error) {
    throw new CvShowMdError(error.message, lineNumber);
  }
  return Object.freeze({
    cueId,
    turnIndex: 0,
    at: Object.freeze(at),
    directive: normalized,
    name,
    sourceLine: line.trim(),
  });
}

/**
 * @param {string} markdown
 * @returns {Record<string, any>}
 */
export function parseCvShowMd(markdown) {
  let lines = String(markdown || '').replace(/\r\n/gu, '\n').split('\n');
  let meta = {};
  let title = '';
  let scenes = [];
  let current = null;
  let inFrontmatter = false;

  lines.forEach((raw, index) => {
    let lineNumber = index + 1;
    let line = raw.trim();
    if (index === 0 && line === '---') {
      inFrontmatter = true;
      return;
    }
    if (inFrontmatter) {
      if (line === '---') {
        inFrontmatter = false;
        return;
      }
      let metaMatch = /^([a-zA-Z0-9_-]+):\s*(.*)$/u.exec(line);
      if (metaMatch) meta[metaMatch[1]] = metaMatch[2].trim();
      return;
    }
    if (!line) return;

    let heading = STEP_HEADING_RE.exec(line);
    if (heading) {
      let parts = heading[1].split('|').map((part) => part.trim()).filter(Boolean);
      let mode = 'read';
      let page = null;
      for (let part of parts.slice(1)) {
        let [key, value] = part.split('=').map((token) => token.trim());
        if (key === 'mode' && value) mode = value;
        if (key === 'page' && Number(value) > 0) page = Number(value);
      }
      current = {
        id: parts[0] || 'scene',
        mode,
        page,
        title: heading[2].trim(),
        speech: '',
        audioUrl: '',
        alignUrl: '',
        cues: [],
        paragraphs: [],
      };
      scenes.push(current);
      return;
    }
    if (/^#\s+/u.test(line) && !current) {
      title = line.replace(/^#\s+/u, '').trim();
      return;
    }
    if (!current) throw new CvShowMdError('content before the first scene heading', lineNumber);

    if (line.startsWith('@audio ')) {
      current.audioUrl = line.slice('@audio '.length).trim();
    } else if (line.startsWith('@align ')) {
      current.alignUrl = line.slice('@align '.length).trim();
    } else if (line.startsWith('@')) {
      current.cues.push(compileCueLine(line, { cueId: `${current.id}#${current.cues.length + 1}`, lineNumber }));
    } else {
      current.paragraphs.push(line);
    }
  });

  for (let scene of scenes) {
    scene.speech = scene.paragraphs.join(' ');
    delete scene.paragraphs;
    if (!scene.speech) throw new CvShowMdError(`scene "${scene.id}" has no narration`);
  }
  return Object.freeze({
    id: meta.id || '',
    lang: meta.lang || 'ru-RU',
    title: title || meta.title || '',
    scenes: Object.freeze(scenes),
  });
}
