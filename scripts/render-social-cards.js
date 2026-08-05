import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import { PUBLICATIONS } from '../src/static-pages/data/publications.js';
import { PORTFOLIO_MEDIA_CATALOG } from '../src/static-pages/data/portfolioMediaCatalog.js';

const WIDTH = 1200;
const HEIGHT = 630;
const TITLE_LEFT = 72;
const TITLE_BOTTOM = 560;
const TITLE_MAX_WIDTH = WIDTH - (TITLE_LEFT * 2);
const cards = Object.freeze([
  {
    publicationId: 'pulse/agent-portal-retrospective',
    source: 'cit/social-card-sources/agent-portal-project-graph.jpg',
    output: 'cit/cit-store/social/pulse-agent-portal.png',
  },
  {
    publicationId: 'pulse/f360-studio-retrospective',
    output: 'cit/cit-store/social/pulse-f360-studio.png',
  },
  {
    publicationId: 'pulse/photopizza-retrospective',
    output: 'cit/cit-store/social/pulse-photopizza.png',
  },
  {
    publicationId: 'pulse/complexscan-retrospective',
    output: 'cit/cit-store/social/pulse-complexscan.png',
  },
]);

function escapeXml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function wrapTitle(title, maxLength = 32) {
  const words = title.split(/\s+/);
  const lines = [];
  let line = '';
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (line && next.length > maxLength) {
      lines.push(line);
      line = word;
    } else {
      line = next;
    }
  }
  if (line) lines.push(line);
  return lines.slice(0, 3);
}

function createTitleOverlay(title) {
  const lines = wrapTitle(title);
  const longestLine = Math.max(...lines.map((line) => line.length));
  const fontSize = Math.max(44, Math.min(72, Math.floor(TITLE_MAX_WIDTH / (longestLine * 0.54))));
  const lineHeight = Math.round(fontSize * 1.18);
  const baseline = TITLE_BOTTOM - ((lines.length - 1) * lineHeight);
  const text = lines.map((line, index) => (
    `<text x="${TITLE_LEFT}" y="${baseline + index * lineHeight}" fill="#ffffff" font-family="Arial, sans-serif" font-size="${fontSize}" font-weight="700">${escapeXml(line)}</text>`
  )).join('');
  return Buffer.from(`
    <svg width="${WIDTH}" height="${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="shade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#07111d" stop-opacity="0"/>
          <stop offset="45%" stop-color="#07111d" stop-opacity="0.34"/>
          <stop offset="100%" stop-color="#07111d" stop-opacity="0.9"/>
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#shade)"/>
      <rect x="${TITLE_LEFT}" y="${baseline - fontSize - 10}" width="72" height="6" rx="3" fill="#8b5cf6"/>
      ${text}
    </svg>
  `);
}

function createFallbackBackground() {
  return Buffer.from(`
    <svg width="${WIDTH}" height="${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="background" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#16213a"/>
          <stop offset="55%" stop-color="#101827"/>
          <stop offset="100%" stop-color="#080d16"/>
        </linearGradient>
        <radialGradient id="glow" cx="82%" cy="12%" r="68%">
          <stop offset="0%" stop-color="#8b5cf6" stop-opacity="0.32"/>
          <stop offset="100%" stop-color="#8b5cf6" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#background)"/>
      <rect width="100%" height="100%" fill="url(#glow)"/>
    </svg>
  `);
}

function getYouTubePoster(publication) {
  const targetIds = new Set([publication.id, publication.primaryProjectId]);
  return PORTFOLIO_MEDIA_CATALOG.find((item) => (
    item.kind === 'youtube' && item.targetIds.some((targetId) => targetIds.has(targetId))
  ))?.poster;
}

async function loadBackground(card, publication) {
  if (card.source) {
    try {
      await fs.access(card.source);
      return sharp(card.source)
        .resize(WIDTH, HEIGHT, { fit: 'cover', position: 'centre' });
    } catch {
      console.log(`Local source is unavailable for ${card.publicationId}; trying portfolio media.`);
    }
  }

  const poster = getYouTubePoster(publication);
  if (poster) {
    try {
      const response = await fetch(poster);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return sharp(Buffer.from(await response.arrayBuffer()))
        .resize(WIDTH, HEIGHT, { fit: 'cover', position: 'centre' });
    } catch (error) {
      console.log(`YouTube poster is unavailable for ${card.publicationId}: ${error.message}`);
    }
  }

  console.log(`Rendering fallback for ${card.publicationId}: no usable illustration or video poster.`);
  return sharp(createFallbackBackground());
}

async function renderCard(card) {
  const publication = PUBLICATIONS.find((item) => item.id === card.publicationId);
  if (!publication) throw new Error(`Unknown publication: ${card.publicationId}`);
  const background = await loadBackground(card, publication);
  const title = publication.locales.en.title;
  await fs.mkdir(path.dirname(card.output), { recursive: true });
  await background
    .composite([{ input: createTitleOverlay(title), top: 0, left: 0 }])
    .png({ compressionLevel: 9 })
    .toFile(card.output);
  console.log(`Rendered ${card.output}`);
}

await Promise.all(cards.map(renderCard));
