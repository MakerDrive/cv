import assert from 'node:assert/strict';
import test from 'node:test';

import {
  createYouTubeNoCookieEmbedUrl,
} from '../../src/static-pages/js/tour-player/youtubeEmbedUrl.js';

test('ordinary article YouTube embeds keep the privacy host without autoplay', () => {
  const url = new URL(createYouTubeNoCookieEmbedUrl('M7lc1UVf-VE', {
    origin: 'https://portfolio.example:8443',
  }));

  assert.equal(url.origin, 'https://www.youtube-nocookie.com');
  assert.equal(url.pathname, '/embed/M7lc1UVf-VE');
  assert.equal(url.searchParams.get('rel'), '0');
  assert.equal(url.searchParams.get('enablejsapi'), '1');
  assert.equal(url.searchParams.get('origin'), 'https://portfolio.example:8443');
  assert.equal(url.searchParams.get('playsinline'), '1');
  assert.equal(url.searchParams.has('autoplay'), false);
});
