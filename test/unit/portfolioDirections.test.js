import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import test from 'node:test';

import {
  PORTFOLIO_DIRECTION_CONTENT_PATHS,
  PORTFOLIO_DIRECTION_INDEX_CONTENT_PATHS,
  PORTFOLIO_DIRECTION_INDEX_ID,
  PORTFOLIO_DIRECTIONS,
  getDirectionContentPath,
} from '../../src/static-pages/data/portfolioDirections.js';
import { PORTFOLIO_PAGE_METADATA } from '../../src/static-pages/data/portfolioPageMetadata.js';
import { PUBLICATIONS, getPublicPublications } from '../../src/static-pages/data/publications.js';
import { getPublicationRouteManifest } from '../../src/static-pages/data/publicationRoutes.js';
import { PORTFOLIO_LOCALE_MESSAGES } from '../../src/static-pages/data/portfolioTranslations.js';
import { loadProjectEntries } from '../../src/static-pages/data/projects.js';
import { getPortfolioPage } from '../../src/static-pages/portfolioPage.js';

const LOCALES = ['en', 'ru', 'es'];
const PROJECT_SLUGS = new Set(loadProjectEntries().map((project) => project.slug));
const DIRECTION_SOURCE_SLUGS = [
  'fullstack-systems-integration',
  'ai-infrastructure-deployment-control',
  'web-form-application-automation',
  'digital-employee-delegation-to-action',
];

test('three directions are registered with stable ids, routes and pages', async () => {
  assert.equal(PORTFOLIO_DIRECTIONS.length, 3);
  assert.equal(new Set(PORTFOLIO_DIRECTIONS.map((direction) => direction.id)).size, 3);
  assert.equal(new Set(PORTFOLIO_DIRECTIONS.map((direction) => direction.slug)).size, 3);

  for (const direction of PORTFOLIO_DIRECTIONS) {
    assert.equal(direction.id, `directions/${direction.slug}`);
    assert.ok(Object.hasOwn(PORTFOLIO_PAGE_METADATA, direction.id), `${direction.id} must be registered`);
    assert.ok(Object.hasOwn(PORTFOLIO_PAGE_METADATA, PORTFOLIO_DIRECTION_INDEX_ID));
    await access(new URL(`../../src/static-pages/directions/${direction.slug}/index.html.js`, import.meta.url));
    const page = await getPortfolioPage({ pageId: direction.id, basePath: '../../' });
    assert.match(page, new RegExp(`<title>${PORTFOLIO_LOCALE_MESSAGES.en[direction.labelKey.replace(/^/, 'portfolio.')].replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`), direction.id);
    assert.ok(direction.projectSlugs.length >= 3, `${direction.slug} must be evidenced by projects`);
    for (const slug of direction.projectSlugs) {
      assert.ok(PROJECT_SLUGS.has(slug), `${direction.slug} references unknown project ${slug}`);
    }
  }
});

test('direction bodies exist per locale and keep the section contract', async () => {
  const expectedPaths = [
    ...Object.values(PORTFOLIO_DIRECTION_INDEX_CONTENT_PATHS),
    ...PORTFOLIO_DIRECTIONS.flatMap((direction) => Object.values(direction.contentPaths)),
  ];
  assert.equal(PORTFOLIO_DIRECTION_CONTENT_PATHS.length, expectedPaths.length);

  for (const contentPath of expectedPaths) {
    assert.match(contentPath, /^content\/directions\/[a-z-]+\/(?:en|ru|es)\.md$/);
    const body = await readFile(new URL(`../../src/static-pages/copy-content/${contentPath.replace(/^content\//, '')}`, import.meta.url), 'utf8');
    assert.ok(body.trim(), `${contentPath} must carry a substantive body`);
  }

  for (const direction of PORTFOLIO_DIRECTIONS) {
    for (const locale of LOCALES) {
      assert.equal(getDirectionContentPath(direction.slug, locale), `content/directions/${direction.slug}/${locale}.md`);
      const body = await readFile(new URL(`../../src/static-pages/copy-content/directions/${direction.slug}/${locale}.md`, import.meta.url), 'utf8');
      assert.match(body, /\]\(\.\.\/\.\.\/projects\//, `${direction.slug}/${locale} must link its evidence projects`);
      assert.match(body, /t\.me\/text2code/, `${direction.slug}/${locale} must carry a contact route`);

    }
  }

  for (const locale of LOCALES) {
    const overview = await readFile(new URL(`../../src/static-pages/copy-content/directions/overview/${locale}.md`, import.meta.url), 'utf8');
    for (const direction of PORTFOLIO_DIRECTIONS) {
      assert.ok(overview.includes(`(${direction.slug}/)`), `overview/${locale} must link ${direction.slug}`);
    }
    assert.match(overview, /skills\//, `overview/${locale} must relate to the Skills section`);
  }
});

test('direction labels and summaries are localized in every locale', () => {
  for (const direction of PORTFOLIO_DIRECTIONS) {
    const labels = LOCALES.map((locale) => PORTFOLIO_LOCALE_MESSAGES[locale][`portfolio.${direction.labelKey}`]);
    const summaries = LOCALES.map((locale) => PORTFOLIO_LOCALE_MESSAGES[locale][`portfolio.${direction.summaryKey}`]);
    assert.ok(labels.every(Boolean), `${direction.slug} label missing`);
    assert.ok(summaries.every(Boolean), `${direction.slug} summary missing`);
    assert.equal(new Set(labels).size, 3, `${direction.slug} labels must differ per locale`);
    assert.equal(new Set(summaries).size, 3, `${direction.slug} summaries must differ per locale`);
  }
  const navLabels = LOCALES.map((locale) => PORTFOLIO_LOCALE_MESSAGES[locale]['portfolio.directions.label']);
  assert.equal(new Set(navLabels).size, 3);
  for (const locale of LOCALES) {
    assert.ok(PORTFOLIO_LOCALE_MESSAGES[locale]['portfolio.directions.summary']);
    assert.ok(PORTFOLIO_LOCALE_MESSAGES[locale]['portfolio.entry.type.direction']);
    assert.ok(PORTFOLIO_LOCALE_MESSAGES[locale]['portfolio.profile.directionsTitle']);
  }
});

test('retired direction articles keep their address and point at the section', () => {
  const manifest = getPublicationRouteManifest();
  for (const slug of DIRECTION_SOURCE_SLUGS) {
    const publication = PUBLICATIONS.find((candidate) => candidate.slug === slug);
    assert.equal(publication.status, 'retired', slug);
    const routes = manifest.filter((route) => route.slug === slug);
    assert.deepEqual(routes.map((route) => route.retired), [true, true], slug);
    assert.ok(routes.some((route) => route.path === `/pulse/${slug}/`), slug);
    assert.ok(routes.every((route) => /^https:\/\/MakerDrive\.github\.io\/cv\/directions\//.test(route.retirementTarget)), slug);
  }
  assert.equal(getPublicPublications().filter((publication) => DIRECTION_SOURCE_SLUGS.includes(publication.slug)).length, 0);
});

test('the reorganization note is a dated Pulse update, not a new practice start', () => {
  const note = PUBLICATIONS.find((publication) => publication.slug === 'directions-section');
  assert.ok(note);
  assert.equal(note.kind, 'update');
  assert.equal(note.status, 'published');
  assert.equal(note.primaryProjectId, null);
  assert.ok(Number.isFinite(Date.parse(note.publishedAt)));
  for (const locale of LOCALES) {
    assert.ok(note.locales[locale].title);
    assert.ok(note.locales[locale].summary);
  }
  assert.equal(new Set(LOCALES.map((locale) => note.locales[locale].title)).size, 3);
});