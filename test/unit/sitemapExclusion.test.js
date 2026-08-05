import assert from 'node:assert/strict';
import test from 'node:test';
import projectConfig from '../../project.cfg.js';
import { getPublicationRouteManifest } from '../../src/static-pages/data/publicationRoutes.js';

const EXISTING_SITEMAP_EXCLUSIONS = [
  '/dashboard/',
  '/404/',
  '/login/',
];

test('sitemap excludes every retired publication route and preserves existing exclusions', () => {
  let retiredPaths = getPublicationRouteManifest()
    .filter(route => route.retired)
    .map(route => route.path);
  let excludedPaths = new Set(projectConfig.sitemap.exclude);
  let missingRetiredPaths = retiredPaths.filter(path => !excludedPaths.has(path));
  let missingExistingPaths = EXISTING_SITEMAP_EXCLUSIONS.filter(path => !excludedPaths.has(path));

  assert.ok(retiredPaths.length > 0, 'Publication route manifest must expose retired routes');
  assert.deepEqual(
    missingRetiredPaths,
    [],
    `Sitemap exclusions are missing retired publication routes: ${missingRetiredPaths.join(', ')}`,
  );
  assert.deepEqual(
    missingExistingPaths,
    [],
    `Sitemap exclusions dropped existing paths: ${missingExistingPaths.join(', ')}`,
  );
});
