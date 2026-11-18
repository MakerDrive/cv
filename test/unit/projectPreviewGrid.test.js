import assert from 'node:assert/strict';
import test from 'node:test';
import {
  orderProjectsForPreview,
  renderProjectPreviewGrid,
} from '../../src/static-pages/js/projectPreviewGrid.js';

const projects = [
  { slug: 'alpha', title: 'Alpha' },
  { slug: 'beta', title: 'Beta "B"' },
  { slug: 'gamma', title: 'Gamma' },
];
const options = {
  hrefBuilder: (slug) => `/cv/projects/${slug}/?lang=en`,
  imageUrlBuilder: (slug) => `/cv/social-cards/projects-${slug}.png`,
};

test('story order comes first, the rest follow in catalog order', () => {
  assert.deepEqual(
    orderProjectsForPreview(projects, ['gamma', 'alpha']).map(({ slug }) => slug),
    ['gamma', 'alpha', 'beta'],
  );
});

test('an ordered slug without a project is ignored, not rendered', () => {
  assert.deepEqual(
    orderProjectsForPreview(projects, ['missing', 'beta']).map(({ slug }) => slug),
    ['beta', 'alpha', 'gamma'],
  );
});

test('every project becomes one linked social card with a tour target', () => {
  const html = renderProjectPreviewGrid(projects, { ...options, order: ['beta'] });
  const cards = html.match(/<a class="project-preview-card"/g) || [];
  assert.equal(cards.length, 3);
  assert.ok(html.indexOf('projects/beta/') < html.indexOf('projects/alpha/'));
  assert.ok(html.includes('data-tour-target="project-preview.gamma"'));
  assert.ok(html.includes('class="project-preview-grid" data-tour-target="project-preview.grid"'));
  assert.ok(html.includes('src="/cv/social-cards/projects-alpha.png"'));
  assert.ok(html.includes('href="/cv/projects/alpha/?lang=en"'));
});

test('titles are escaped inside the image alt text', () => {
  const html = renderProjectPreviewGrid(projects, options);
  assert.ok(html.includes('alt="Beta &quot;B&quot;"'));
  assert.ok(!html.includes('alt="Beta "B""'));
});

test('missing builders are rejected', () => {
  assert.throws(() => renderProjectPreviewGrid(projects, {}), TypeError);
});
