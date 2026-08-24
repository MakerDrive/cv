import path from 'node:path';
import { CFG, cdnConnector } from 'cloud-images-toolkit/src/node/CFG.js';
import { createSocialCardManifest } from './social-card-manifest.js';
import { publishSocialCards } from './social-card-sync.js';

if (!cdnConnector) {
  throw new Error('A CIT CDN connector is required to publish social cards.');
}

let rootDir = process.cwd();
let result = await publishSocialCards({
  rootDir,
  cardsPath: path.resolve(rootDir, 'cit/social-cards.json'),
  syncDataPath: path.resolve(rootDir, 'cit/cit-sync-data.json'),
  manifest: createSocialCardManifest(),
  connector: cdnConnector,
  cfg: CFG,
});

process.stdout.write(
  `Published ${result.published.length} new social cards; `
    + `removed ${result.removed.length} expired cards.\n`,
);
