import { PORTFOLIO_PAGE_METADATA } from '../src/static-pages/data/portfolioPageMetadata.js';
import { SOCIAL_CARD_HEIGHT, SOCIAL_CARD_WIDTH } from '../src/static-pages/data/socialCardPaths.js';
import { drawCardText, measureCardText, wrapCardText } from './social-card-typography.js';
import { SOCIAL_CARD_THEME } from './social-card-theme.js';

export const SOCIAL_CARD_MEDIA = Object.freeze({ left: 808, top: 160, width: 344, height: 318 });
const TITLE = { left: 64, top: 200, width: 696, bottom: 486 };
let identity = PORTFOLIO_PAGE_METADATA['site/index'].title.split(' | ');

let text = (value, x, y, size, fill = SOCIAL_CARD_THEME.ink, role = 'mono') =>
  drawCardText(value, { x, y, size, fill, role });

/**
 * @param {string} title
 * @param {{ bottom?: number }} [options]
 * @returns {{ lines: string[], fontSize: number, lineHeight: number, baseline: number }}
 */
export function layoutSocialCardTitle(title, { bottom = TITLE.bottom } = {}) {
  for (let size = 112; size >= 32; size -= 2) {
    let lines = wrapCardText(title, TITLE.width - 8, size);
    let lineHeight = Math.round(size * 1.02);
    let baseline = TITLE.top + size * 0.75;
    if (lines.length <= 5 && baseline + (lines.length - 1) * lineHeight <= bottom
      && lines.every((line) => measureCardText(line.toUpperCase(), size) <= TITLE.width - 8)) {
      return { lines, fontSize: size, lineHeight, baseline };
    }
  }
  throw new Error(`Social card title cannot fit without truncation: "${title}". Shorten its English title.`);
}

/**
 * @param {string} title
 * @returns {Buffer}
 */
export function createTitleOverlay(title) {
  let layout = layoutSocialCardTitle(title);
  let paths = layout.lines.map((line, index) => text(line.toUpperCase(), TITLE.left,
    layout.baseline + index * layout.lineHeight, layout.fontSize, SOCIAL_CARD_THEME.ink, 'display'));
  return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${SOCIAL_CARD_WIDTH}" `
    + `height="${SOCIAL_CARD_HEIGHT}">${paths.join('')}</svg>`);
}

/**
 * @param {{ id: string, title: string, kind?: string }} card
 * @param {boolean} hasMedia
 * @returns {Buffer}
 */
export default function createSocialCardTemplate(card, hasMedia) {
  let { paper, ink, surface, signal, muted } = SOCIAL_CARD_THEME;
  let profile = ['site/index', 'profile/photo'].includes(card.id);
  let title = profile ? identity[1] : card.title;
  let layout = layoutSocialCardTitle(title, { bottom: profile ? 392 : TITLE.bottom });
  let heading = layout.lines.map((line, index) => text(line.toUpperCase(), TITLE.left,
    layout.baseline + index * layout.lineHeight, layout.fontSize, ink, 'display')).join('');
  let supporting = profile ? wrapCardText(identity.slice(2).join(' | '), TITLE.width, 18, 'mono')
    .map((line, index) => text(line.toUpperCase(), TITLE.left, 430 + index * 24, 18)).join('') : '';
  let kind = card.kind === 'publication' || card.id.startsWith('pulse/') ? 'PUBLICATION'
    : card.id.startsWith('projects/') ? 'PROJECT'
      : card.id.startsWith('skills/') ? 'SKILL' : 'PROFILE';
  let pathSize = Math.min(15, 1072 / measureCardText(card.id.toUpperCase(), 1, 'mono'));
  let hatching = Array.from({ length: 26 }, (_, index) => {
    let x = 782 + index * 16;
    return `<path d="M${x} 136l16-16"/>`;
  }).join('');
  let artwork = hasMedia
    ? `<rect x="807.5" y="159.5" width="345" height="319" fill="${surface}" stroke="${ink}"/>`
    : `<g stroke="${ink}" stroke-width="2" fill="none">
        <path d="M944 267h96v112H904M894 317v53"/>
        <rect x="844" y="217" width="100" height="100"/>
        <rect x="840" y="370" width="64" height="64"/>
        <circle cx="1040" cy="379" r="50" fill="${ink}"/>
        <circle cx="1120" cy="184" r="22" fill="${ink}"/>
        <circle cx="844" cy="267" r="5" fill="${paper}"/>
      </g>`;
  return Buffer.from(/*svg*/ `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">
    <rect width="1200" height="630" fill="${paper}"/>
    <rect x="32.5" y="32.5" width="1135" height="565" fill="${surface}" stroke="${ink}"/>
    <rect x="792" y="120" width="376" height="398" fill="${signal}"/>
    <path d="M32 120.5H1168M792.5 120V518M32 518.5H1168" fill="none" stroke="${ink}"/>
    <path d="M20 54V20h34M1146 610h34v-34" fill="none" stroke="${ink}" stroke-width="2"/>
    <svg x="792" y="120" width="376" height="16" overflow="hidden">
      <g transform="translate(-792 -120)" stroke="${ink}" stroke-width="2">${hatching}</g>
    </svg>
    <path d="M792 136.5H1168" stroke="${ink}"/>
    <rect x="936" y="54" width="200" height="40" fill="${ink}"/>
    ${text(identity[0].toUpperCase(), 64, 76, 20)}
    ${text(identity[1].toUpperCase(), 64, 101, 12, muted)}
    ${text(kind, 954, 80, 15, paper)}
    ${text('PORTFOLIO / ' + kind, 64, 164, 14, muted)}
    ${heading}${supporting}${artwork}
    ${text(hasMedia ? (profile ? 'PROFILE PORTRAIT' : 'SELECTED WORK') : 'SYSTEMS / CONNECTIONS', 808, 501, 12)}
    ${text(card.id.toUpperCase(), 64, 551, pathSize)}
    ${text('SOFTWARE / MEDIA / HARDWARE', 64, 579, 13, muted)}
    <rect x="1116" y="562" width="20" height="20" fill="${signal}"/>
  </svg>`);
}
