import { createHash } from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';

export const SOCIAL_CARD_RETENTION_MS = 30 * 24 * 60 * 60 * 1000;

const MANAGED_ASSET_PATTERN = /^\.\/cit\/cit-store\/social\/[a-z0-9-]+(?:-[a-f0-9]{12})?\.png$/;

function asSyncPath(rootDir, filePath) {
  let relativePath = path.relative(rootDir, filePath).replace(/\\/g, '/');
  return `./${relativePath}`;
}

function createVersionedPath(filePath, source) {
  let hash = createHash('sha256').update(source).digest('hex').slice(0, 12);
  return filePath.replace(/\.png$/, `-${hash}.png`);
}

async function readJson(filePath) {
  return JSON.parse(await fs.readFile(filePath, 'utf8'));
}

async function writeJson(filePath, value) {
  let tempPath = `${filePath}.tmp-${process.pid}`;
  await fs.writeFile(tempPath, `${JSON.stringify(value, null, 2)}\n`);
  await fs.rename(tempPath, filePath);
}

function reconcileMappings(cards, manifestIds) {
  for (let cardId of Object.keys(cards)) {
    if (!manifestIds.has(cardId)) delete cards[cardId];
  }
}

function markUnusedAssets(syncData, activePaths, retiredAt) {
  for (let [assetPath, record] of Object.entries(syncData)) {
    if (!MANAGED_ASSET_PATTERN.test(assetPath)) continue;
    if (activePaths.has(assetPath)) {
      delete record.retiredAt;
    } else if (!record.retiredAt) {
      record.retiredAt = retiredAt;
    }
  }
}

function getExpiredAssetPaths(syncData, activePaths, now) {
  let cutoff = now.getTime() - SOCIAL_CARD_RETENTION_MS;
  return Object.entries(syncData)
    .filter(([assetPath, record]) => (
      MANAGED_ASSET_PATTERN.test(assetPath)
      && !activePaths.has(assetPath)
      && typeof record.retiredAt === 'string'
      && Number.isFinite(Date.parse(record.retiredAt))
      && Date.parse(record.retiredAt) <= cutoff
    ))
    .map(([assetPath]) => assetPath);
}

/**
 * @param {Object} options
 * @param {string} options.rootDir
 * @param {string} options.cardsPath
 * @param {string} options.syncDataPath
 * @param {Array<Object>} options.manifest
 * @param {{ upload: Function, remove: Function }} options.connector
 * @param {Object} options.cfg
 * @param {Date} [options.now]
 * @returns {Promise<{ cards: Object, syncData: Object, published: string[], removed: string[] }>}
 */
export async function publishSocialCards({
  rootDir,
  cardsPath,
  syncDataPath,
  manifest,
  connector,
  cfg,
  now = new Date(),
}) {
  if (!connector?.upload || !connector?.remove) {
    throw new Error('A CIT connector with upload and remove operations is required.');
  }
  let cards = await readJson(cardsPath);
  let syncData = await readJson(syncDataPath);
  let published = [];
  let removed = [];
  let nowIso = now.toISOString();

  for (let card of manifest) {
    let sourcePath = path.resolve(rootDir, card.outputPath);
    let source = await fs.readFile(sourcePath);
    let versionedPath = createVersionedPath(sourcePath, source);
    let versionedSyncPath = asSyncPath(rootDir, versionedPath);
    await fs.copyFile(sourcePath, versionedPath);

    if (!syncData[versionedSyncPath]) {
      let upload = await connector.upload(source, path.basename(versionedPath), cfg);
      if (!upload?.cdnId) {
        throw new Error(`CIT did not return a cdnId for social card "${card.id}".`);
      }
      syncData[versionedSyncPath] = {
        cdnId: upload.cdnId,
        uploadDate: upload.uploadDate || nowIso,
        imageName: path.basename(versionedPath),
        alt: card.title,
        tags: ['social-card', card.kind],
        width: '1200',
        height: '630',
        aspectRatio: '40/21',
        srcFormat: 'PNG',
      };
      published.push(card.id);
      await writeJson(syncDataPath, syncData);
    }

    cards[card.id] = versionedSyncPath;
    delete syncData[versionedSyncPath].retiredAt;
    await writeJson(cardsPath, cards);
  }

  let manifestIds = new Set(manifest.map((card) => card.id));
  reconcileMappings(cards, manifestIds);
  let activePaths = new Set(Object.values(cards));
  markUnusedAssets(syncData, activePaths, nowIso);
  await writeJson(cardsPath, cards);
  await writeJson(syncDataPath, syncData);

  let expiredPaths = getExpiredAssetPaths(syncData, activePaths, now);
  for (let assetPath of expiredPaths) {
    let record = syncData[assetPath];
    if (!record?.cdnId) {
      throw new Error(`Expired social card "${assetPath}" has no CIT cdnId.`);
    }
    await connector.remove(record.cdnId, cfg);
    delete syncData[assetPath];
    await fs.rm(path.resolve(rootDir, assetPath.slice(2)), { force: true });
    await writeJson(syncDataPath, syncData);
    removed.push(assetPath);
  }

  return { cards, syncData, published, removed };
}
