import fs from 'node:fs/promises';
import sharp from 'sharp';
import createSocialCardTemplate, { SOCIAL_CARD_MEDIA } from './social-card-template.js';
import { SOCIAL_CARD_THEME } from './social-card-theme.js';
import { SOCIAL_CARD_HEIGHT, SOCIAL_CARD_WIDTH } from '../src/static-pages/data/socialCardPaths.js';

let loadSource = async (source) => {
  if (!/^https?:\/\//.test(source)) return fs.readFile(source);
  let response = await fetch(source, { signal: AbortSignal.timeout(10_000) });
  if (!response.ok) {
    throw new Error(`Social card source ${source} returned HTTP ${response.status}.`);
  }
  return Buffer.from(await response.arrayBuffer());
};

let resolveMedia = async (card, sourceLoader) => {
  let attempts = [];
  for (let source of card.sources || []) {
    try {
      let input = await sourceLoader(source);
      let buffer = await sharp(input)
        .resize(SOCIAL_CARD_MEDIA.width, SOCIAL_CARD_MEDIA.height, {
          fit: 'contain',
          position: 'centre',
          background: SOCIAL_CARD_THEME.surface,
        })
        .flatten({ background: SOCIAL_CARD_THEME.surface })
        .png()
        .toBuffer();
      attempts.push({ source, ok: true });
      return { buffer, selected: source, attempts };
    } catch (error) {
      attempts.push({ source, ok: false, reason: error?.message || String(error) });
    }
  }
  return { buffer: null, selected: null, attempts };
};

/**
 * @param {{ id: string, title: string, kind?: string, sources?: string[] }} card
 * @param {{ loadSource?: (source: string) => Promise<Buffer>, out?: Object }} [options]
 * @returns {Promise<Buffer>}
 */
export async function renderSocialCardBuffer(card, { loadSource: sourceLoader = loadSource, out = null } = {}) {
  let resolution = await resolveMedia(card, sourceLoader);
  let layers = resolution.buffer
    ? [{ input: resolution.buffer, left: SOCIAL_CARD_MEDIA.left, top: SOCIAL_CARD_MEDIA.top }]
    : [];
  let buffer = await sharp(createSocialCardTemplate(card, !!resolution.buffer))
    .composite(layers)
    .png({ compressionLevel: 9 })
    .toBuffer();
  if (out) {
    out.selected = resolution.selected;
    out.fallback = !resolution.buffer;
    out.diagnostics = Object.freeze({ sources: Object.freeze(resolution.attempts) });
    out.facts = Object.freeze({ width: SOCIAL_CARD_WIDTH, height: SOCIAL_CARD_HEIGHT });
  }
  return buffer;
}
