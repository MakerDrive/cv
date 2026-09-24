import assert from 'node:assert/strict';
import test from 'node:test';
import sharp from 'sharp';
import {
  layoutSocialCardTitle,
  renderSocialCardBuffer,
} from '../../scripts/social-card-renderer.js';

test('social card renderer produces a 1200 by 630 PNG fallback', async () => {
  let output = await renderSocialCardBuffer({
    id: 'pulse/fallback',
    title: 'A deterministic fallback title for social previews',
    sources: [],
  });
  let metadata = await sharp(output).metadata();

  assert.equal(metadata.width, 1200);
  assert.equal(metadata.height, 630);
  assert.equal(metadata.format, 'png');
});

test('social card title layout keeps long titles complete and inside the card', () => {
  let title = 'A very long publication title that still needs to remain complete on the card';
  let layout = layoutSocialCardTitle(title);

  assert.equal(layout.lines.join(' '), title);
  assert.ok(layout.lines.length >= 2 && layout.lines.length <= 4);
  assert.ok(layout.fontSize >= 38 && layout.fontSize <= 72);
  assert.ok(layout.baseline > 0);
  assert.ok(layout.baseline + ((layout.lines.length - 1) * layout.lineHeight) <= 560);
});

test('social card renderer tries later media sources before using the fallback', async () => {
  let requested = [];
  let image = await sharp({
    create: {
      width: 1200,
      height: 630,
      channels: 4,
      background: '#ff0000',
    },
  }).png().toBuffer();
  let output = await renderSocialCardBuffer({
    id: 'projects/media',
    title: 'Media source',
    sources: ['https://cdn.test/missing.jpg', 'https://cdn.test/available.jpg'],
  }, {
    loadSource: async (source) => {
      requested.push(source);
      if (source.includes('missing')) throw new Error('missing');
      return image;
    },
  });
  let pixel = await sharp(output)
    .extract({ left: 20, top: 20, width: 1, height: 1 })
    .raw()
    .toBuffer();

  assert.deepEqual(requested, [
    'https://cdn.test/missing.jpg',
    'https://cdn.test/available.jpg',
  ]);
  assert.ok(pixel[0] > pixel[1]);
});

test('social card diagnostics record every source failure and the chosen one', async () => {
  let image = await sharp({
    create: { width: 1200, height: 630, channels: 4, background: '#113355' },
  }).png().toBuffer();
  let out = {};
  await renderSocialCardBuffer({
    id: 'projects/md',
    title: 'B',
    sources: ['https://cdn.test/dead.png', 'https://cdn.test/corrupt.png', 'https://cdn.test/ok.png'],
  }, {
    loadSource: async (source) => {
      if (source.includes('dead')) throw new Error('HTTP 404');
      if (source.includes('corrupt')) return Buffer.from('not-exactly-a-png');
      return image;
    },
    out,
  });

  assert.equal(out.selected, 'https://cdn.test/ok.png');
  assert.equal(out.fallback, false);
  assert.deepEqual(out.diagnostics.sources, [
    { source: 'https://cdn.test/dead.png', ok: false, reason: 'HTTP 404' },
    { source: 'https://cdn.test/corrupt.png', ok: false, reason: 'Input buffer contains unsupported image format' },
    { source: 'https://cdn.test/ok.png', ok: true },
  ]);
});

test('social card falls back to the branded layout with exposure of every failure', async () => {
  let out = {};
  await renderSocialCardBuffer({
    id: 'projects/all-missing',
    title: 'Nothing works',
    sources: ['https://a.test/x.png', '/definitely/absent.png'],
  }, {
    loadSource: async (source) => {
      if (source.startsWith('/')) throw new Error(`ENOENT: no such file`);
      throw new Error('HTTP 500');
    },
    out,
  });

  assert.equal(out.fallback, true);
  assert.equal(out.selected, null);
  assert.equal(out.diagnostics.sources.every(({ ok }) => !ok), true);
});

test('long titles never bleed into the protected right or left edges', async () => {
  // Render the title overlay alone on transparent space and scan the raw
  // pixels: ink must never reach the outermost 1px frame outside the text
  // track (x >= TITLE_LEFT and x <= WIDTH - TITLE_LEFT).
  const { createTitleOverlay } = await import('../../scripts/social-card-renderer.js');
  const title = 'Retail Supply Chains with Zero-Touch Production Feedback Loops';
  // Title overlay WITHOUT the shade gradient — alpha pixels mean pure text ink.
  const overlay = createTitleOverlay(title, { withShade: false });
  const png = await sharp(overlay).png().toBuffer();
  const { data: raw, info } = await sharp(png).raw().toBuffer({ resolveWithObject: true });
  const stride = info.width * info.channels;
  const ink = (x, y) => raw[y * stride + x * info.channels + 3] > 0;
  let minX = info.width, maxX = -1;
  for (let y = 0; y < info.height; y++) {
    for (let x = 0; x < info.width; x++) {
      if (ink(x, y)) { minX = Math.min(minX, x); maxX = Math.max(maxX, x); }
    }
  }
  assert.ok(minX >= 72, `ink begins at ${minX}px — left margin breached`);
  assert.ok(maxX <= 1200 - 72, `ink reaches ${maxX}px — right margin breached`);
});
