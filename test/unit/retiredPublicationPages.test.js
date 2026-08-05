import assert from 'node:assert/strict';
import test from 'node:test';

import { getPortfolioPage } from '../../src/static-pages/portfolioPage.js';

test('retired internal publication routes render a localized tombstone', async () => {
  let page = await getPortfolioPage({
    basePath: '../../../../',
    publicationId: 'pulse/canonical-virtual-media-sequence-modeling',
  });

  assert.match(
    page,
    /<link rel="canonical" href="https:\/\/MakerDrive\.github\.io\/cv\/projects\/symbiote-workspace\/pulse\/symbiote-workspace-retrospective\/">/,
  );
  assert.match(page, /<meta name="robots" content="noindex, follow">/);
  assert.match(page, /data-retirement-locale="en"/);
  assert.match(page, /data-retirement-locale="ru"/);
  assert.match(page, /data-retirement-locale="es"/);
  assert.match(page, />Open the canonical publication<\/a>/);
  assert.match(page, />Открыть каноническую публикацию<\/a>/);
  assert.match(page, />Abrir la publicación canónica<\/a>/);
  assert.doesNotMatch(page, /<script>(?!\s*<\/script>)/);
  assert.doesNotMatch(page, /<portfolio-workspace/);
  assert.doesNotMatch(page, /pulse-projects-data/);
  assert.doesNotMatch(page, /content\/publications\/canonical-virtual-media-sequence-modeling/);
});
