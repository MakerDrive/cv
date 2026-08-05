import { createHash } from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { CFG, cdnConnector } from 'cloud-images-toolkit/src/node/CFG.js';
import { PUBLICATIONS } from '../src/static-pages/data/publications.js';

const cardsPath = path.resolve('cit/social-cards.json');
const syncDataPath = path.resolve('cit/cit-sync-data.json');
const cardOutputs = Object.freeze({
  'pulse/agent-portal-retrospective': 'cit/cit-store/social/pulse-agent-portal.png',
  'pulse/f360-studio-retrospective': 'cit/cit-store/social/pulse-f360-studio.png',
  'pulse/photopizza-retrospective': 'cit/cit-store/social/pulse-photopizza.png',
  'pulse/complexscan-retrospective': 'cit/cit-store/social/pulse-complexscan.png',
});

function asSyncPath(filePath) {
  return `./${filePath}`;
}

async function syncCard(cardId, sourcePath, cards, syncData) {
  const source = await fs.readFile(sourcePath);
  const hash = createHash('sha256').update(source).digest('hex').slice(0, 12);
  const versionedPath = sourcePath.replace(/\.png$/, `-${hash}.png`);
  const versionedSyncPath = asSyncPath(versionedPath);
  const previousPath = cards[cardId];
  const previous = syncData[previousPath];

  if (!syncData[versionedSyncPath]) {
    await fs.copyFile(sourcePath, versionedPath);
    const upload = await cdnConnector.upload(source, path.basename(versionedPath), CFG);
    syncData[versionedSyncPath] = {
      cdnId: upload.cdnId,
      uploadDate: upload.uploadDate,
      imageName: path.basename(versionedPath),
      alt: '',
      tags: [],
      width: '1200',
      height: '630',
      aspectRatio: '40/21',
      srcFormat: 'PNG',
    };
  }

  cards[cardId] = versionedSyncPath;
  const publication = PUBLICATIONS.find((item) => item.id === cardId);
  if (publication?.primaryProjectId) {
    cards[publication.primaryProjectId] = versionedSyncPath;
  }
  for (const [relatedCardId, assetPath] of Object.entries(cards)) {
    if (assetPath === previousPath && relatedCardId.startsWith('projects/')) cards[relatedCardId] = versionedSyncPath;
  }

  await fs.writeFile(cardsPath, `${JSON.stringify(cards, null, 2)}\n`);
  await fs.writeFile(syncDataPath, `${JSON.stringify(syncData, null, 2)}\n`);

  if (previous && previousPath !== versionedSyncPath) {
    await cdnConnector.remove(previous.cdnId, CFG);
    delete syncData[previousPath];
    await fs.rm(previousPath, { force: true });
    await fs.writeFile(syncDataPath, `${JSON.stringify(syncData, null, 2)}\n`);
  }

  console.log(`Published ${cardId}: ${syncData[versionedSyncPath].cdnId}`);
}

if (!cdnConnector) throw new Error('A CIT CDN connector is required to publish social cards.');

const cards = JSON.parse(await fs.readFile(cardsPath, 'utf8'));
const syncData = JSON.parse(await fs.readFile(syncDataPath, 'utf8'));
for (const [cardId, sourcePath] of Object.entries(cardOutputs)) {
  await syncCard(cardId, sourcePath, cards, syncData);
}
