import assert from 'node:assert/strict';
import test from 'node:test';

import {
  PORTFOLIO_MEDIA_ACTIVE_NODE_SCALE,
  PORTFOLIO_MEDIA_FORCE_LAYOUT_OPTIONS,
  PORTFOLIO_MEDIA_HUB_WEIGHT_CAP,
  PORTFOLIO_MEDIA_IMAGE_NODE_WEIGHT,
  PORTFOLIO_PROFILE_MEDIA_HUB_WEIGHT,
  getPortfolioMediaHubWeight,
} from '../../src/static-pages/data/portfolioLayoutConfig.js';

test('portfolio media graph keeps visual media leaves readable against project hubs', async () => {
  let { getNodeRadius } = await import('../../node_modules/symbiote-ui/canvas/CanvasGraph/CanvasGraphGeometry.js');
  let imageNode = { id: 'media/sample', weight: PORTFOLIO_MEDIA_IMAGE_NODE_WEIGHT };
  let imageRadius = getNodeRadius(imageNode, 1);
  let projectHub = {
    id: 'projects/sample',
    isGroup: true,
    children: Array.from({ length: 7 }, (_, index) => `media/sample/${index}`),
    weight: getPortfolioMediaHubWeight(7),
  };

  let restHubRadius = getNodeRadius(projectHub, 12);
  let activeHubRadius = getNodeRadius(projectHub, 12, {
    scale: PORTFOLIO_MEDIA_ACTIVE_NODE_SCALE,
  });

  assert.equal(PORTFOLIO_MEDIA_ACTIVE_NODE_SCALE, 1.5);
  assert.ok(imageRadius >= 8);
  assert.ok(restHubRadius / imageRadius <= 1.6);
  assert.ok(activeHubRadius / imageRadius <= 2.25);
  assert.ok(activeHubRadius / imageRadius >= 1.25);
  assert.ok(PORTFOLIO_PROFILE_MEDIA_HUB_WEIGHT <= PORTFOLIO_MEDIA_HUB_WEIGHT_CAP);
  assert.ok(getPortfolioMediaHubWeight(1) < getPortfolioMediaHubWeight(7));
  assert.ok(getPortfolioMediaHubWeight(7) <= PORTFOLIO_MEDIA_HUB_WEIGHT_CAP);
});

test('portfolio media force options keep crystal layout compact while preserving collision room', async () => {
  let { getNodeRadius } = await import('../../node_modules/symbiote-ui/canvas/CanvasGraph/CanvasGraphGeometry.js');
  let imageRadius = getNodeRadius({ id: 'media/sample', weight: PORTFOLIO_MEDIA_IMAGE_NODE_WEIGHT }, 1);
  let activeHubRadius = getNodeRadius({
    id: 'projects/sample',
    isGroup: true,
    children: Array.from({ length: 7 }, (_, index) => `media/sample/${index}`),
    weight: getPortfolioMediaHubWeight(7),
  }, 12, { scale: PORTFOLIO_MEDIA_ACTIVE_NODE_SCALE });
  let minimumReadableDistance = activeHubRadius + imageRadius + 32;

  assert.equal(PORTFOLIO_MEDIA_FORCE_LAYOUT_OPTIONS.layoutAlgorithm, 'crystal');
  assert.ok(PORTFOLIO_MEDIA_FORCE_LAYOUT_OPTIONS.linkDistance >= minimumReadableDistance);
  assert.ok(PORTFOLIO_MEDIA_FORCE_LAYOUT_OPTIONS.groupDistance >= minimumReadableDistance);
  assert.ok(PORTFOLIO_MEDIA_FORCE_LAYOUT_OPTIONS.linkDistance >= 68);
  assert.ok(PORTFOLIO_MEDIA_FORCE_LAYOUT_OPTIONS.linkDistance <= 76);
  assert.ok(PORTFOLIO_MEDIA_FORCE_LAYOUT_OPTIONS.groupDistance >= 86);
  assert.ok(PORTFOLIO_MEDIA_FORCE_LAYOUT_OPTIONS.groupDistance <= 94);
  assert.ok(PORTFOLIO_MEDIA_FORCE_LAYOUT_OPTIONS.chargeStrength <= -100);
  assert.ok(PORTFOLIO_MEDIA_FORCE_LAYOUT_OPTIONS.chargeStrength >= -120);
  assert.ok(PORTFOLIO_MEDIA_FORCE_LAYOUT_OPTIONS.collideStrength >= 1.2);
  assert.ok(PORTFOLIO_MEDIA_FORCE_LAYOUT_OPTIONS.wellRepulsion >= 7);
  assert.ok(PORTFOLIO_MEDIA_FORCE_LAYOUT_OPTIONS.crystalStrength >= 0.14);
  assert.ok(PORTFOLIO_MEDIA_FORCE_LAYOUT_OPTIONS.crystalStrength <= 0.2);
  assert.ok(PORTFOLIO_MEDIA_FORCE_LAYOUT_OPTIONS.crystalRingDistance >= 38);
  assert.ok(PORTFOLIO_MEDIA_FORCE_LAYOUT_OPTIONS.crystalRingDistance <= 44);
  assert.equal(PORTFOLIO_MEDIA_FORCE_LAYOUT_OPTIONS.crystalSpokes, 6);
  assert.ok(PORTFOLIO_MEDIA_FORCE_LAYOUT_OPTIONS.crystalAngleJitter <= 0.1);
});
