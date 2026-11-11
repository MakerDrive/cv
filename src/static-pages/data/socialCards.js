import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { getSocialCardLocalUrl, getSocialCardOutputPath } from './socialCardPaths.js';

const syncDataPath = path.resolve('cit/cit-sync-data.json');
const socialCardsPath = path.resolve('cit/social-cards.json');
const cdnUrlTemplate = 'https://rnd-pro.com/idn/{UID}/public';

export const SOCIAL_CARD_ASSETS = Object.freeze(
  JSON.parse(fs.readFileSync(socialCardsPath, 'utf8')),
);

function loadSyncData() {
  if (!fs.existsSync(syncDataPath)) return {};
  return JSON.parse(fs.readFileSync(syncDataPath, 'utf8'));
}

export function resolveSocialCardUrl(
  pageId,
  syncData = loadSyncData(),
  assets = SOCIAL_CARD_ASSETS,
  { rootDir = process.cwd() } = {},
) {
  if (!pageId) return undefined;
  let generatedPath = path.resolve(rootDir, getSocialCardOutputPath(pageId));
  let version = fs.existsSync(generatedPath)
    ? createHash('sha256').update(fs.readFileSync(generatedPath)).digest('hex').slice(0, 12)
    : '';
  let assetPath = assets[pageId];
  let cdnId = assetPath && syncData[assetPath]?.cdnId;
  let currentCdn = cdnId && (!version || assetPath.endsWith(`-${version}.png`));
  return currentCdn
    ? cdnUrlTemplate.replace('{UID}', cdnId)
    : getSocialCardLocalUrl(pageId, version);
}
