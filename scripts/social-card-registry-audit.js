import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { createSocialCardManifest } from './social-card-manifest.js';

const CARDS_JSON_REL = 'cit/social-cards.json';
const SOCIAL_STORE_REL = 'cit/cit-store/social';

function contentHash(buffer) {
  return createHash('sha256').update(buffer).digest('hex').slice(0, 12);
}

/**
 * Audits cit/social-cards.json against the local social store and the
 * current manifest. Classifies every entry as:
 *  - 'ok' — entry path exists and its file name hash equals the file content;
 *  - 'missing-file' — the registry points at a file that does not exist;
 *  - 'hash-stale' — the file exists but its bytes do not match the
 *    versioned name (content drift after publish);
 *  - 'registry-stale' — current manifest has an entry with no registry row;
 *  - 'orphan-file' — store file not referenced by the registry (and not produced
 *    by the current manifest at any path).
 *
 * @param {{ rootDir?: string, manifest?: Array<Object> }} [options]
 * @returns {Promise<{ perId: Object<string, string>, extraFiles: string[], summary: { byReason: Object<string, number> }, healthy: boolean }>}
 */
export async function auditSocialCardRegistry({ rootDir = process.cwd(), manifest } = {}) {
  let cardsText = await fs.readFile(path.join(rootDir, CARDS_JSON_REL), 'utf8').catch(() => '{}');
  let cards = JSON.parse(cardsText);
  let storeNames = new Set();
  try {
    for (let entry of await fs.readdir(path.join(rootDir, SOCIAL_STORE_REL))) {
      storeNames.add(`${SOCIAL_STORE_REL}/${entry}`);
    }
  } catch { /* empty store */ }
  let outputPaths = new Set((manifest || createSocialCardManifest()).map((card) => card.outputPath));

  let perId = {};
  for (let [id, entry] of Object.entries(cards)) {
    let storePath = String(entry).replace(/^\.\//, '');
    let absolute = path.join(rootDir, storePath);
    let exists = await fs.stat(absolute).then((s) => s.isFile()).catch(() => false);
    if (!exists) {
      perId[id] = 'missing-file';
      continue;
    }
    let bytes = await fs.readFile(absolute);
    // The registry pins content by embedding the byte hash in the file
    // name: `<descriptive>-<sha256-first-12>.png`. Detect drift by comparing
    // against bytes of the mapped file, not the path itself.
    let expected = `-${contentHash(bytes)}.png`;
    perId[id] = storePath.endsWith(expected) ? 'ok' : 'hash-stale';
  }
  for (let card of manifest || createSocialCardManifest()) {
    if (!Object.hasOwn(cards, card.id)) perId[card.id] = 'registry-stale';
  }
  let unusedFiles = [...storeNames].filter((name) => (
    !Object.values(cards).map((entry) => String(entry).replace(/^\.\//, '')).includes(name)
      && !outputPaths.has(name.replace(/\\/g, '/'))
  ));
  let byReason = Object.values(perId).reduce((acc, reason) => {
    acc[reason] = (acc[reason] || 0) + 1;
    return acc;
  }, {});
  let healthy = byReason['ok'] === Object.keys(perId).length && unusedFiles.length === 0;
  return Object.freeze({
    perId: Object.freeze(perId),
    extraFiles: Object.freeze(unusedFiles),
    summary: Object.freeze({ byReason: Object.freeze(byReason) }),
    healthy,
  });
}

if (process.argv[1] && process.argv[1].endsWith('social-card-registry-audit.js')) {
  let audit = await auditSocialCardRegistry();
  process.stdout.write(`${JSON.stringify(audit.summary, null, 2)}\n`);
  process.stdout.write(`extraFiles: ${audit.extraFiles.length}\n`);
  if (!audit.healthy) process.exitCode = 1;
}
