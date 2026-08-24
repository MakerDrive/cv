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
