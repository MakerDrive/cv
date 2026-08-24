import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { publishSocialCards } from '../../scripts/social-card-sync.js';

test('CIT publishing versions cards and retains superseded objects for 30 days', async () => {
  let rootDir = await fs.mkdtemp(path.join(os.tmpdir(), 'cv-social-card-sync-'));
  let now = new Date('2026-08-23T12:00:00.000Z');
  let oldDate = '2026-07-01T12:00:00.000Z';
  let outputPath = 'cit/cit-store/social/projects-alpha.png';
  let source = Buffer.from('new-card-content');
  let hash = createHash('sha256').update(source).digest('hex').slice(0, 12);
  let newPath = `./cit/cit-store/social/projects-alpha-${hash}.png`;
  let previousPath = './cit/cit-store/social/projects-alpha.png';
  let expiredPath = './cit/cit-store/social/pulse-expired-deadbeef0000.png';
  let cardsPath = path.join(rootDir, 'cit/social-cards.json');
  let syncDataPath = path.join(rootDir, 'cit/cit-sync-data.json');
  let uploads = [];
  let removals = [];
  let connector = {
    upload: async (bytes, fileName) => {
      uploads.push({ bytes: Buffer.from(bytes), fileName });
      return { cdnId: 'new-card-id', uploadDate: now.toISOString() };
    },
    remove: async (cdnId) => {
      removals.push(cdnId);
    },
  };

  try {
    await fs.mkdir(path.join(rootDir, 'cit/cit-store/social'), { recursive: true });
    await fs.writeFile(path.join(rootDir, outputPath), source);
    await fs.writeFile(cardsPath, `${JSON.stringify({
      'projects/alpha': previousPath,
      'pulse/removed': expiredPath,
    })}\n`);
    await fs.writeFile(syncDataPath, `${JSON.stringify({
      [previousPath]: { cdnId: 'previous-card-id', uploadDate: oldDate },
      [expiredPath]: {
        cdnId: 'expired-card-id',
        uploadDate: oldDate,
        retiredAt: oldDate,
      },
    })}\n`);

    let first = await publishSocialCards({
      rootDir,
      cardsPath,
      syncDataPath,
      manifest: [{
        id: 'projects/alpha',
        kind: 'project',
        title: 'Alpha',
        outputPath,
      }],
      connector,
      cfg: {},
      now,
    });

    assert.equal(first.cards['projects/alpha'], newPath);
    assert.equal(first.cards['pulse/removed'], undefined);
    assert.equal(first.syncData[newPath].cdnId, 'new-card-id');
    assert.equal(first.syncData[previousPath].retiredAt, now.toISOString());
    assert.equal(first.syncData[expiredPath], undefined);
    assert.deepEqual(removals, ['expired-card-id']);
    assert.equal(uploads.length, 1);

    let afterRetention = await publishSocialCards({
      rootDir,
      cardsPath,
      syncDataPath,
      manifest: [{
        id: 'projects/alpha',
        kind: 'project',
        title: 'Alpha',
        outputPath,
      }],
      connector,
      cfg: {},
      now: new Date('2026-09-23T12:00:00.000Z'),
    });

    assert.equal(afterRetention.syncData[previousPath], undefined);
    assert.equal(afterRetention.syncData[newPath].cdnId, 'new-card-id');
    assert.deepEqual(removals, ['expired-card-id', 'previous-card-id']);
    assert.equal(uploads.length, 1, 'unchanged content must reuse the content-addressed object');
  } finally {
    await fs.rm(rootDir, { recursive: true, force: true });
  }
});
