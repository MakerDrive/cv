import fs from 'fs';
import { applyData } from 'jsda-kit/iso/applyData.js';
import { md } from 'jsda-kit/node/md.js';
import ICONS_LINK from '../icons/link.html.js';

const template = fs.readFileSync('./src/static-pages/page.tpl.html', 'utf8');

const SITE_BASE_URL = 'https://MakerDrive.github.io/cv/';
const SITE_OG_IMAGE = 'https://rnd-pro.com/idn/93c81af5-aaae-4b92-f288-1f0499726500/public';
const SITE_DEFAULT_DESCRIPTION =
  'Vladimir Matiasevich — lead AI & full-stack R&D engineer. Custom agent tooling and product platforms, with media systems and process automation as supporting lines, from idea to production.';

function escapeAttr(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function buildHeadMeta(pageData) {
  if (typeof pageData.HEAD_META === 'string') return pageData.HEAD_META;
  let description = pageData.DESCRIPTION || SITE_DEFAULT_DESCRIPTION;
  let title = pageData.OG_TITLE || pageData.TITLE;
  let image = pageData.OG_IMAGE || SITE_OG_IMAGE;
  let tags = [
    `<meta name="description" content="${escapeAttr(description)}">`,
    `<meta property="og:type" content="website">`,
    `<meta property="og:title" content="${escapeAttr(title)}">`,
    `<meta property="og:description" content="${escapeAttr(description)}">`,
    `<meta property="og:image" content="${escapeAttr(image)}">`,
    `<meta name="twitter:card" content="summary_large_image">`,
    `<meta name="twitter:title" content="${escapeAttr(title)}">`,
    `<meta name="twitter:description" content="${escapeAttr(description)}">`,
    `<meta name="twitter:image" content="${escapeAttr(image)}">`,
  ];
  if (pageData.CANONICAL_URL) {
    tags.push(`<link rel="canonical" href="${escapeAttr(pageData.CANONICAL_URL)}">`);
    tags.push(`<meta property="og:url" content="${escapeAttr(pageData.CANONICAL_URL)}">`);
  }
  if (pageData.ROBOTS) {
    tags.push(`<meta name="robots" content="${escapeAttr(pageData.ROBOTS)}">`);
  }
  return tags.join('\n  ');
}

function getAssetVersion() {
  return String(process.env.CV_ASSET_VERSION || process.env.GITHUB_SHA || '').trim();
}

function versionAssetPath(path) {
  let version = getAssetVersion();
  if (!version || path.includes('?') || path.startsWith('http')) return path;
  return `${path}?v=${encodeURIComponent(version.slice(0, 12))}`;
}

/**
 * @typedef {Object} PageData
 * @property {String} TITLE
 * @property {String} [BASE_PATH]
 * @property {String} [BODY_ATTRS]
 * @property {String} [CSS_PATH]
 * @property {String} [JS_PATH]
 * @property {String} HEADER_CONTENT
 * @property {String} [MD_URL]
 * @property {String} [CONTENT]
 * @property {String} [FOOTER_CONTENT]
 * @property {String} [SIDE_PANEL_ATTRS]
 * @property {String} [SIDE_PANEL_HTML]
 * @property {Object<string, string>} [SIDE_PANEL_DATA]
 * @property {String} [publicationId]
 * @property {String} [DESCRIPTION]
 * @property {String} [CANONICAL_URL]
 * @property {String} [ROBOTS]
 */

/**
 *
 * @param {PageData} pageData
 * @returns
 */
export async function getPage(pageData) {
  return applyData(template, {
    ICONS_LINK,
    TITLE: pageData.TITLE,
    HEAD_META: buildHeadMeta(pageData),
    BODY_ATTRS: pageData.BODY_ATTRS || '',
    BASE_PATH: pageData.BASE_PATH || './',
    CSS_PATH: versionAssetPath(pageData.CSS_PATH || 'css/index.css'),
    JS_PATH: versionAssetPath(pageData.JS_PATH || 'js/index.js'),
    HEADER_CONTENT: pageData.HEADER_CONTENT,
    CONTENT: pageData.CONTENT || await md(pageData.MD_URL),
    FOOTER_CONTENT: pageData.FOOTER_CONTENT || `JSDA Template &copy; ${new Date().getFullYear()}`,
    SIDE_PANEL_ATTRS: pageData.SIDE_PANEL_ATTRS || '',
  });
};

export { versionAssetPath };
