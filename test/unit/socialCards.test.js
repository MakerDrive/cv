import assert from 'node:assert/strict';
import test from 'node:test';
import { SOCIAL_CARD_ASSETS, resolveSocialCardUrl } from '../../src/static-pages/data/socialCards.js';

test('publication social cards resolve to their CIT public variant', () => {
  const assetPath = SOCIAL_CARD_ASSETS['pulse/agent-portal'];
  assert.match(assetPath, /^\.\/cit\/cit-store\/social\/pulse-agent-portal(?:-[a-f0-9]{12})?\.png$/);
  assert.equal(SOCIAL_CARD_ASSETS['projects/agent-portal'], assetPath);
  assert.equal(
    resolveSocialCardUrl('pulse/agent-portal', {
      [assetPath]: { cdnId: 'card-123' },
    }),
    'https://rnd-pro.com/idn/card-123/public',
  );
});

test('publication social cards fall back until CIT has uploaded them', () => {
  assert.equal(resolveSocialCardUrl('pulse/agent-portal', {}), undefined);
  assert.equal(resolveSocialCardUrl('pulse/unknown', {}), undefined);
});
