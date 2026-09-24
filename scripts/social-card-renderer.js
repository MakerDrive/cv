import fs from 'node:fs/promises';
import sharp from 'sharp';
import {
  SOCIAL_CARD_HEIGHT,
  SOCIAL_CARD_WIDTH,
} from '../src/static-pages/data/socialCardPaths.js';

const TITLE_LEFT = 72;
const TITLE_BOTTOM = 560;
const TITLE_MAX_WIDTH = SOCIAL_CARD_WIDTH - (TITLE_LEFT * 2);
const MIN_FONT_SIZE = 38;
const MAX_FONT_SIZE = 72;
const MAX_TITLE_LINES = 4;

function escapeXml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function wrapTitle(title, maxCharacters) {
  let words = String(title).trim().split(/\s+/).filter(Boolean);
  let lines = [];
  let line = '';
  for (let word of words) {
    let next = line ? `${line} ${word}` : word;
    if (line && next.length > maxCharacters) {
      lines.push(line);
      line = word;
    } else {
      line = next;
    }
  }
  if (line) lines.push(line);
  return lines;
}

/**
 * @param {string} title
 * @returns {{ lines: string[], fontSize: number, lineHeight: number, baseline: number }}
 */
export function layoutSocialCardTitle(title) {
  let selected;
  for (let fontSize = MAX_FONT_SIZE; fontSize >= MIN_FONT_SIZE; fontSize -= 2) {
    let maxCharacters = Math.max(12, Math.floor(TITLE_MAX_WIDTH / (fontSize * 0.54)));
    let lines = wrapTitle(title, maxCharacters);
    if (lines.length <= MAX_TITLE_LINES) {
      selected = { lines, fontSize };
      break;
    }
  }
  if (!selected) {
    selected = {
      lines: wrapTitle(title, Math.floor(TITLE_MAX_WIDTH / (MIN_FONT_SIZE * 0.54))),
      fontSize: MIN_FONT_SIZE,
    };
  }
  let lineHeight = Math.round(selected.fontSize * 1.18);
  let baseline = TITLE_BOTTOM - ((selected.lines.length - 1) * lineHeight);
  return { ...selected, lineHeight, baseline };
}

export function createTitleOverlay(title, { withShade = true } = {}) {
  let layout = layoutSocialCardTitle(title);
  let text = layout.lines.map((line, index) => (
    `<text x="${TITLE_LEFT}" y="${layout.baseline + (index * layout.lineHeight)}" `
      + `fill="#ffffff" font-family="Arial, sans-serif" font-size="${layout.fontSize}" `
      + `font-weight="700">${escapeXml(line)}</text>`
  )).join('');
  const shade = withShade ? '<rect width="100%" height="100%" fill="url(#shade)"/>' : '';
  return Buffer.from(/*svg*/ `
    <svg width="${SOCIAL_CARD_WIDTH}" height="${SOCIAL_CARD_HEIGHT}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="shade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#07111d" stop-opacity="0.08"/>
          <stop offset="42%" stop-color="#07111d" stop-opacity="0.38"/>
          <stop offset="100%" stop-color="#07111d" stop-opacity="0.94"/>
        </linearGradient>
      </defs>
${shade}
      <rect x="${TITLE_LEFT}" y="${layout.baseline - layout.fontSize - 12}" width="72" height="6" rx="3" fill="#8b5cf6"/>
      ${text}
    </svg>
  `);
}

function createFallbackBackground() {
  return Buffer.from(/*svg*/ `
    <svg width="${SOCIAL_CARD_WIDTH}" height="${SOCIAL_CARD_HEIGHT}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="background" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#16213a"/>
          <stop offset="55%" stop-color="#101827"/>
          <stop offset="100%" stop-color="#080d16"/>
        </linearGradient>
        <radialGradient id="glow" cx="82%" cy="12%" r="68%">
          <stop offset="0%" stop-color="#8b5cf6" stop-opacity="0.38"/>
          <stop offset="100%" stop-color="#8b5cf6" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#background)"/>
      <rect width="100%" height="100%" fill="url(#glow)"/>
    </svg>
  `);
}

async function loadSource(source) {
  if (!/^https?:\/\//.test(source)) return fs.readFile(source);
  let response = await fetch(source, { signal: AbortSignal.timeout(10_000) });
  if (!response.ok) {
    throw new Error(`Social card source ${source} returned HTTP ${response.status}.`);
  }
  return Buffer.from(await response.arrayBuffer());
}

/**
 * Resolve the card background via the sourced cascade. Every failed source
 * is recorded as `{ source, reason }` — corruption and HTTP errors are not
 * silently swallowed; the last resort is the local branded fallback card.
 *
 * @param {{ id: string, sources?: string[] }} card
 * @param {(source: string) => Promise<Buffer>} sourceLoader
 * @returns {Promise<{ pipeline: sharp.Sharp, selected: string | null, failures: Array<{ source: string, reason: string }>, fallback: boolean }>}
 */
async function resolveBackground(card, sourceLoader) {
  let failures = [];
  for (let source of card.sources || []) {
    try {
      let input = await sourceLoader(source);
      let pipeline = sharp(input).resize(SOCIAL_CARD_WIDTH, SOCIAL_CARD_HEIGHT, {
        fit: 'cover',
        position: 'centre',
      });
      // Decode is lazy: verify now so a corrupt payload falls through to the
      // next source instead of failing the card compose step.
      try {
        await pipeline.clone().metadata();
      } catch (error) {
        failures.push(Object.freeze({
          source,
          reason: error?.message || String(error),
        }));
        continue;
      }
      return {
        pipeline,
        selected: source,
        failures: Object.freeze(failures),
        fallback: false,
      };
    } catch (error) {
      failures.push(Object.freeze({
        source,
        reason: error?.code || error?.message || String(error),
      }));
    }
  }
  return {
    pipeline: sharp(createFallbackBackground()),
    selected: null,
    failures: Object.freeze(failures),
    fallback: true,
  };
}

/**
 * @param {{ id: string, title: string, sources: string[] }} card
 * @param {Object} [options]
 * @param {(source: string) => Promise<Buffer>} [options.loadSource]
 * @param {{ renderSocialCardBuffer?: boolean }} [options]
 * @returns {Promise<{ buffer: Buffer, selected: string | null, fallback: boolean, diagnostics: { sources: Array<{ source: string, ok: boolean, reason?: string }> }, facts: { width: number, height: number } }>}
 */
export async function renderSocialCardBuffer(card, { loadSource: sourceLoader = loadSource, out = null } = {}) {
  /**
   * Image render returns the final PNG buffer. Diagnostics that matter to an
   * irresponsible caller (e.g. which source was chosen, what else failed) are
   * collected through `out` — a mutable object injected by the caller.
   */
  let resolution = await resolveBackground(card, sourceLoader);
  let buffer = await resolution.pipeline
    .composite([{ input: createTitleOverlay(card.title), top: 0, left: 0 }])
    .png({ compressionLevel: 9 })
    .toBuffer();
  if (out) {
    out.selected = resolution.selected;
    out.fallback = resolution.fallback;
    out.diagnostics = Object.freeze({
      sources: Object.freeze((card.sources || []).map((source) => {
        let failure = resolution.failures.find((entry) => entry.source === source);
        return failure
          ? { source, ok: false, reason: failure.reason }
          : { source: resolution.selected, ok: true };
      })),
    });
    out.facts = Object.freeze({ width: SOCIAL_CARD_WIDTH, height: SOCIAL_CARD_HEIGHT });
  }
  return buffer;
}
