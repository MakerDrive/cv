import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  getPublicPublications,
  PUBLICATIONS,
} from '../../src/static-pages/data/publications.js';
import {
  getPublicationRouteManifest,
  resolvePublicationMetadata,
} from '../../src/static-pages/data/publicationRoutes.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '../..');
const pulseDir = path.join(rootDir, 'src', 'static-pages', 'pulse');

test('Project-owned publication keeps its Pulse canonical when source links exist', () => {
  let publication = PUBLICATIONS.find(candidate => candidate.id === 'pulse/agent-portal-retrospective');
  assert.ok(publication?.primaryProjectId);
  assert.equal(publication.sourceLinks[0].href, 'https://rnd-pro.com/projects/agent-portal/');

  let metadata = resolvePublicationMetadata(publication.id);
  assert.equal(
    metadata.canonicalUrl,
    'https://MakerDrive.github.io/cv/projects/agent-portal/pulse/agent-portal-retrospective/',
  );
});

test('Removed publications have no metadata or route projection', () => {
  let removedIds = [
    'pulse/whats-wrong-with-web-components',
    'pulse/symbiote-super-power-1',
    'pulse/symbiote-superpowers-2',
    'pulse/rd-process',
  ];
  let manifestIds = new Set(getPublicationRouteManifest().map(route => route.id));

  for (let publicationId of removedIds) {
    assert.equal(resolvePublicationMetadata(publicationId), null);
    assert.equal(manifestIds.has(publicationId), false);
  }
});

test('Retired publication with an internal target canonicalizes to the target Pulse route', () => {
  let metadata = resolvePublicationMetadata('pulse/photopizza-remote-retrospective');
  assert.equal(
    metadata.canonicalUrl,
    'https://MakerDrive.github.io/cv/projects/photopizza-remote/pulse/photopizza-remote-browser-hardware-control/',
  );
});

test('Route projection includes canonical and alias paths for project-owned publications, and only canonical for global', () => {
  const fixtures = [
    {
      id: 'pulse/retrospective',
      slug: 'retrospective',
      kind: 'retrospective',
      status: 'published',
      primaryProjectId: 'projects/proj-a',
    },
    {
      id: 'pulse/global-pub',
      slug: 'global-pub',
      kind: 'update',
      status: 'published',
      primaryProjectId: null,
    },
    {
      id: 'pulse/retired',
      slug: 'retired',
      kind: 'field-note',
      status: 'retired',
      primaryProjectId: 'projects/proj-b',
      retirementTarget: 'pulse/global-pub',
    },
    {
      id: 'pulse/draft',
      slug: 'draft',
      kind: 'update',
      status: 'draft',
      primaryProjectId: 'projects/proj-b',
    },
  ];

  assert.deepEqual(
    getPublicationRouteManifest(fixtures),
    [
      { id: 'pulse/retrospective', slug: 'retrospective', path: '/projects/proj-a/pulse/retrospective/' },
      { id: 'pulse/retrospective', slug: 'retrospective', path: '/pulse/retrospective/', isAlias: true },
      { id: 'pulse/global-pub', slug: 'global-pub', path: '/pulse/global-pub/' },
      {
        id: 'pulse/retired',
        slug: 'retired',
        path: '/projects/proj-b/pulse/retired/',
        retired: true,
        retirementTarget: 'pulse/global-pub',
      },
      {
        id: 'pulse/retired',
        slug: 'retired',
        path: '/pulse/retired/',
        isAlias: true,
        retired: true,
        retirementTarget: 'pulse/global-pub',
      },
    ]
  );
});

test('Production route manifest corresponds exactly to tracked route stubs', () => {
  const manifest = getPublicationRouteManifest(PUBLICATIONS);

  const pulseEntries = fs.readdirSync(pulseDir, { withFileTypes: true });
  const routeDirectories = pulseEntries
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();

  assert.deepEqual(
    pulseEntries.filter((entry) => !entry.isDirectory() && entry.name !== 'index.html.js').map((entry) => entry.name),
    [],
    'Pulse route source must not contain unexpected files'
  );

  const uniqueManifestSlugs = [...new Set(manifest.map((entry) => entry.slug))].sort();
  assert.deepEqual(
    routeDirectories,
    uniqueManifestSlugs,
    'Tracked Pulse route directories must match the unique slugs in the manifest exactly'
  );

  for (const route of manifest) {
    if (route.isAlias) {
      const aliasDir = path.join(rootDir, 'src', 'static-pages', 'pulse', route.slug);
      const indexPath = path.join(aliasDir, 'index.html.js');
      assert.ok(fs.existsSync(indexPath), `Alias index.html.js for slug '${route.slug}' should exist on disk`);

      const content = fs.readFileSync(indexPath, 'utf8');
      const expectedContent = `import { getPortfolioPage } from '../../portfolioPage.js';\n\nexport default await getPortfolioPage({ basePath: '../../', publicationId: '${route.id}' });\n`;
      assert.equal(content.replace(/\r\n/g, '\n'), expectedContent, `index.html.js content for alias '${route.slug}' should export getPortfolioPage exactly`);
    } else {
      // Canonical route
      const isProjectOwned = route.path.startsWith('/projects/');
      if (isProjectOwned) {
        const pathParts = route.path.split('/'); // ["", "projects", "project-slug", "pulse", "pub-slug", ""]
        const projectSlug = pathParts[2];
        const pubSlug = pathParts[4];

        const canonicalDir = path.join(rootDir, 'src', 'static-pages', 'projects', projectSlug, 'pulse', pubSlug);
        const indexPath = path.join(canonicalDir, 'index.html.js');
        assert.ok(fs.existsSync(indexPath), `Canonical index.html.js for project '${projectSlug}' pub '${pubSlug}' should exist on disk`);

        const content = fs.readFileSync(indexPath, 'utf8');
        const expectedContent = `import { getPortfolioPage } from '../../../../portfolioPage.js';\n\nexport default await getPortfolioPage({ basePath: '../../../../', publicationId: '${route.id}' });\n`;
        assert.equal(content.replace(/\r\n/g, '\n'), expectedContent, `index.html.js content for canonical project-owned '${route.slug}' should export getPortfolioPage exactly`);
      } else {
        // Global canonical route
        const globalDir = path.join(rootDir, 'src', 'static-pages', 'pulse', route.slug);
        const indexPath = path.join(globalDir, 'index.html.js');
        assert.ok(fs.existsSync(indexPath), `Global canonical index.html.js for slug '${route.slug}' should exist on disk`);

        const content = fs.readFileSync(indexPath, 'utf8');
        const expectedContent = `import { getPortfolioPage } from '../../portfolioPage.js';\n\nexport default await getPortfolioPage({ basePath: '../../', publicationId: '${route.id}' });\n`;
        assert.equal(content.replace(/\r\n/g, '\n'), expectedContent, `index.html.js content for global canonical '${route.slug}' should export getPortfolioPage exactly`);
      }
    }
  }

  const routeablePubs = PUBLICATIONS.filter(publication => (
    publication.status === 'published' || publication.status === 'retired'
  ));
  const projectOwnedCount = routeablePubs.filter(publication => publication.primaryProjectId).length;
  const aliasRoutes = manifest.filter(r => r.isAlias);
  assert.equal(
    aliasRoutes.length,
    projectOwnedCount,
    'Number of legacy aliases should equal number of project-owned publications',
  );
  assert.equal(
    manifest.length,
    routeablePubs.length + projectOwnedCount,
    'Manifest length must match routeable publications count + project-owned count',
  );
  assert.ok(
    getPublicPublications(PUBLICATIONS).every(publication => publication.status === 'published'),
    'Public route projections must exclude retired records',
  );
});
