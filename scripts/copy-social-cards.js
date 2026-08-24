import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createSocialCardManifest } from './social-card-manifest.js';

/**
 * @param {Object} [options]
 * @param {Array<Object>} [options.manifest]
 * @param {string} [options.rootDir]
 * @param {string} [options.outputDir]
 * @returns {Promise<Array<string>>}
 */
export async function copySocialCards({
  manifest = createSocialCardManifest(),
  rootDir = process.cwd(),
  outputDir = 'dist/social-cards',
} = {}) {
  let targetDir = path.resolve(rootDir, outputDir);
  await fs.mkdir(targetDir, { recursive: true });
  return Promise.all(manifest.map(async (card) => {
    let sourcePath = path.resolve(rootDir, card.outputPath);
    let targetPath = path.join(targetDir, card.fileName);
    await fs.copyFile(sourcePath, targetPath);
    return targetPath;
  }));
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  let outputs = await copySocialCards();
  process.stdout.write(`Copied ${outputs.length} social cards into dist.\n`);
}
