import fs from 'node:fs';
import path from 'node:path';

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

export function resolveSocialCardUrl(publicationId, syncData = loadSyncData()) {
  const assetPath = SOCIAL_CARD_ASSETS[publicationId];
  const cdnId = assetPath && syncData[assetPath]?.cdnId;
  return cdnId ? cdnUrlTemplate.replace('{UID}', cdnId) : undefined;
}
