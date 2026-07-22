import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

import {
  PORTFOLIO_PDF_EXPERTISE_ROUTES,
  PORTFOLIO_PDF_IMPACT_ROUTES,
  PORTFOLIO_PDF_PRODUCT_ROUTES,
  PORTFOLIO_PROFILE_ITEM_ROUTES,
  PORTFOLIO_PROJECT_RELATIONS,
  PORTFOLIO_SKILL_PROJECT_RELATIONS,
} from '../../src/static-pages/data/portfolioRelations.js';
import { PORTFOLIO_LOCALE_MESSAGES } from '../../src/static-pages/data/portfolioTranslations.js';
import { loadProjectEntries } from '../../src/static-pages/data/projects.js';

const PROJECT_ROUTES = new Set(loadProjectEntries().map((project) => `projects/${project.slug}`));
const SKILL_ROUTES = new Set([
  'skills',
  'skills/agentic-ai',
  'skills/rnd-engineering',
  'skills/product-ui',
  'skills/hardware-capture',
]);

function assertKnownRoute(route) {
  assert.ok(PROJECT_ROUTES.has(route) || SKILL_ROUTES.has(route), `unknown portfolio route: ${route}`);
}

function markdownBulletCount(value) {
  return String(value || '').split('\n').filter((line) => /^\s*[-*]\s+/.test(line)).length;
}

test('curated portfolio relations resolve to known project entries', () => {
  const projectSlugs = new Set(loadProjectEntries().map((project) => project.slug));

  for (const slugs of Object.values(PORTFOLIO_SKILL_PROJECT_RELATIONS)) {
    assert.ok(slugs.length >= 3 && slugs.length <= 5);
    for (const slug of slugs) assert.ok(projectSlugs.has(slug), `unknown skill relation: ${slug}`);
  }

  for (const [source, targets] of Object.entries(PORTFOLIO_PROJECT_RELATIONS)) {
    assert.ok(projectSlugs.has(source), `unknown project relation source: ${source}`);
    for (const target of targets) assert.ok(projectSlugs.has(target), `unknown project relation target: ${target}`);
  }

  assert.deepEqual(PORTFOLIO_PROJECT_RELATIONS['agent-portal'], [
    'mcp-agent-portal',
    'project-graph-mcp',
    'agent-pool-mcp',
    'browser-x-mcp',
    'context-x-mcp',
    'terminal-x-mcp',
  ]);
  assert.deepEqual(PORTFOLIO_PROJECT_RELATIONS['f360-studio'], ['autobox-v1', 'complexscan', 'photopizza']);
});

test('profile and PDF route mappings resolve to canonical localized pages', () => {
  const routes = [
    ...Object.values(PORTFOLIO_PROFILE_ITEM_ROUTES.impact),
    ...Object.values(PORTFOLIO_PROFILE_ITEM_ROUTES.products),
    ...Object.values(PORTFOLIO_PROFILE_ITEM_ROUTES.experience),
    ...PORTFOLIO_PDF_IMPACT_ROUTES,
    ...PORTFOLIO_PDF_EXPERTISE_ROUTES,
    ...PORTFOLIO_PDF_PRODUCT_ROUTES,
  ];

  for (const route of routes) assertKnownRoute(route);
  assert.equal(PORTFOLIO_PROFILE_ITEM_ROUTES.experience.f360, 'projects/f360-studio');
  assert.equal(PORTFOLIO_PROFILE_ITEM_ROUTES.products.objetArt, 'projects/autobox-v1');
  assert.equal(PORTFOLIO_PROFILE_ITEM_ROUTES.products.hardware, 'projects/complexscan');
  assert.equal(PORTFOLIO_PROFILE_ITEM_ROUTES.products.boothbot, 'projects/boothbot');
  assert.equal(PORTFOLIO_PROFILE_ITEM_ROUTES.impact.mediaProduction, 'projects/megavisor');

  for (const locale of ['en', 'ru', 'es']) {
    assert.equal(
      markdownBulletCount(PORTFOLIO_LOCALE_MESSAGES[locale]['portfolio.pdf.impactDetails']),
      PORTFOLIO_PDF_IMPACT_ROUTES.length,
    );
    assert.equal(
      markdownBulletCount(PORTFOLIO_LOCALE_MESSAGES[locale]['portfolio.pdf.expertiseDetails']),
      PORTFOLIO_PDF_EXPERTISE_ROUTES.length,
    );
  }
});

test('portfolio runtime exposes curated backlinks without replacing skill inference', async () => {
  const source = await readFile(new URL('../../src/static-pages/js/index.js', import.meta.url), 'utf8');

  assert.match(source, /PORTFOLIO_SKILL_PROJECT_RELATIONS/);
  assert.match(source, /PORTFOLIO_PROJECT_RELATIONS/);
  assert.match(source, /relatedLinks,/);
  assert.match(source, /let result = \['skills\/rnd-engineering'\];/);
  assert.match(source, /item\.href \? `\*\*\[\$\{item\.label\}\]\(\$\{item\.href\}\)\*\*`/);
});
