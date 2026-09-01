import assert from 'node:assert/strict';
import test from 'node:test';

import { createCvShowMediaTargetResolver } from '../../src/static-pages/js/tour-player/showMediaTargetResolution.js';

test('Show media resolution exposes only the approved BoothBot gallery target', () => {
  const iframe = { localName: 'iframe' };
  const viewer = { localName: 'ims-viewer' };
  const slots = new Map([
    ['media/photopizza/youtube/demo', {
      querySelector: selector => selector.includes('iframe') ? iframe : null,
    }],
    ['media/photopizza/ims/spinner', {
      querySelector: selector => selector === 'ims-viewer' ? viewer : null,
    }],
    ['media/boothbot/ims/gallery', {
      querySelector: selector => selector === 'ims-viewer' ? viewer : null,
    }],
  ]);
  const document = {
    querySelector(selector) {
      const match = selector.match(/^\[data-media-id="(.+)"\]$/u);
      return match ? slots.get(match[1]) || null : null;
    },
  };
  const imsTargets = [];
  const resolve = createCvShowMediaTargetResolver({
    document,
    resolveTarget: () => null,
    createImsTarget(element) {
      const target = { kind: 'ims-target', element };
      imsTargets.push(target);
      return target;
    },
  });

  assert.equal(resolve('media/photopizza/youtube/demo'), null);
  assert.equal(resolve('media/photopizza/ims/spinner'), null);
  const ims = resolve('media/boothbot/ims/gallery');
  assert.equal(ims.element, viewer);
  assert.equal(resolve('media/boothbot/ims/gallery'), ims);
  assert.equal(imsTargets.length, 1);
});

test('Show media resolution does not expose native HTML media playback', () => {
  const video = {
    localName: 'video',
    matches: selector => selector === 'video, audio',
  };
  const resolve = createCvShowMediaTargetResolver({
    document: { querySelector: () => null },
    resolveTarget: () => ({
      matches: () => false,
      querySelector: selector => selector === 'video, audio' ? video : null,
    }),
  });

  assert.equal(resolve('article.example.video'), null);
});

test('IMS resolution returns one stable host target before the async viewer mount', () => {
  let viewer = null;
  const mediaHost = {
    descriptor: { activation: { provider: 'ims' } },
    matches: selector => selector === 'sn-media-host',
    querySelector: selector => selector === 'ims-viewer' ? viewer : null,
  };
  const slot = {
    matches: () => false,
    querySelector(selector) {
      if (selector === 'sn-media-host') return mediaHost;
      if (selector === 'ims-viewer') return viewer;
      return null;
    },
  };
  const created = [];
  const resolve = createCvShowMediaTargetResolver({
    document: { querySelector: () => slot },
    createImsTarget(element) {
      const target = { kind: 'ims-target', element };
      created.push(target);
      return target;
    },
  });

  const beforeMount = resolve('media/boothbot/ims/gallery');
  assert.ok(beforeMount);
  assert.equal(beforeMount.element, mediaHost);
  viewer = { localName: 'ims-viewer' };
  assert.equal(resolve('media/boothbot/ims/gallery'), beforeMount);
  assert.equal(created.length, 1);
});
