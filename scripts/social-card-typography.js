import { openSync } from 'fontkit';
import { fileURLToPath } from 'node:url';
import { SOCIAL_CARD_DISPLAY_AXES, SOCIAL_CARD_MONO_AXES } from './social-card-theme.js';

let display = openSync(fileURLToPath(new URL('./fonts/archivo-variable.ttf', import.meta.url)))
  .getVariation(SOCIAL_CARD_DISPLAY_AXES);
let mono = openSync(fileURLToPath(new URL('./fonts/martian-mono-variable.ttf', import.meta.url)))
  .getVariation(SOCIAL_CARD_MONO_AXES);
const FONTS = { display, mono };

/**
 * @param {string} text
 * @param {number} size
 * @param {'display' | 'mono'} [role]
 * @returns {number}
 */
export function measureCardText(text, size, role = 'display') {
  let font = FONTS[role];
  return font.layout(text).advanceWidth * size / font.unitsPerEm;
}

/**
 * @param {string} text
 * @param {number} width
 * @param {number} size
 * @param {'display' | 'mono'} [role]
 * @returns {string[]}
 */
export function wrapCardText(text, width, size, role = 'display') {
  let lines = [];
  let line = '';
  for (let word of text.trim().split(/\s+/)) {
    let next = line ? `${line} ${word}` : word;
    if (measureCardText(next.toUpperCase(), size, role) > width && line) {
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
 * @param {string} text
 * @param {{ x: number, y: number, size: number, fill: string, role?: 'display' | 'mono' }} options
 * @returns {string}
 */
export function drawCardText(text, { x, y, size, fill, role = 'display' }) {
  let font = FONTS[role];
  let run = font.layout(text);
  let scale = size / font.unitsPerEm;
  let cursor = 0;
  let paths = run.glyphs.map((glyph, index) => {
    if (glyph.id === 0) throw new Error(`Social card font cannot render "${text}"; extend its font asset.`);
    let position = run.positions[index];
    let translateX = x + (cursor + position.xOffset) * scale;
    let translateY = y - position.yOffset * scale;
    cursor += position.xAdvance;
    return `<path transform="translate(${translateX} ${translateY}) scale(${scale} ${-scale})" `
      + `d="${glyph.path.toSVG()}"/>`;
  }).join('');
  return `<g fill="${fill}">${paths}</g>`;
}
