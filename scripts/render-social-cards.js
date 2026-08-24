import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createSocialCardManifest } from './social-card-manifest.js';
import { renderSocialCardBuffer } from './social-card-renderer.js';

/**
 * @param {Object} [options]
 * @param {Array<Object>} [options.manifest]
 * @param {string} [options.rootDir]
 * @returns {Promise<Array<string>>}
 */
export async function renderSocialCards({
  manifest = createSocialCardManifest(),
  rootDir = process.cwd(),
} = {}) {
  let sourceCache = new Map();
  let loadSource = async (source) => {
    if (!sourceCache.has(source)) {
      sourceCache.set(source, (async () => {
        if (!/^https?:\/\//.test(source)) return fs.readFile(path.resolve(rootDir, source));
        let response = await fetch(source, { signal: AbortSignal.timeout(10_000) });
        if (!response.ok) {
          throw new Error(`Social card source ${source} returned HTTP ${response.status}.`);
        }
        return Buffer.from(await response.arrayBuffer());
      })());
    }
    return sourceCache.get(source);
  };
  let outputs = await Promise.all(manifest.map(async (card) => {
    let outputPath = path.resolve(rootDir, card.outputPath);
    let output = await renderSocialCardBuffer(card, { loadSource });
    await fs.mkdir(path.dirname(outputPath), { recursive: true });
    await fs.writeFile(outputPath, output);
    return card.outputPath;
  }));
  return outputs;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  let outputs = await renderSocialCards();
  process.stdout.write(`Rendered ${outputs.length} social cards.\n`);
}
