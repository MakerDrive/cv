import assert from 'node:assert/strict';
import test from 'node:test';
import { PORTFOLIO_MEDIA_CATALOG } from '../../src/static-pages/data/portfolioMediaCatalog.js';
import { loadProjectEntries } from '../../src/static-pages/data/projects.js';
import {
  getPublicPublications,
  PUBLICATIONS,
} from '../../src/static-pages/data/publications.js';
import {
  SOCIAL_CARD_HEIGHT,
  SOCIAL_CARD_WIDTH,
  getSocialCardFileName,
  getSocialCardLocalUrl,
} from '../../src/static-pages/data/socialCardPaths.js';
import {
  SOCIAL_CARD_ASSETS,
  resolveSocialCardUrl,
} from '../../src/static-pages/data/socialCards.js';
import { createSocialCardManifest } from '../../scripts/social-card-manifest.js';
import {
  getPortfolioPage,
  resolveProjectPageId,
} from '../../src/static-pages/portfolioPage.js';

test('social card manifest derives every public project and publication from registries', () => {
  let projects = loadProjectEntries();
  let publications = getPublicPublications();
  let manifest = createSocialCardManifest();
  let expectedIds = new Set([
    ...projects.map((project) => `projects/${project.slug}`),
    ...publications.map((publication) => publication.id),
  ]);

  assert.equal(manifest.length, expectedIds.size);
  assert.deepEqual(new Set(manifest.map((card) => card.id)), expectedIds);
  assert.equal(new Set(manifest.map((card) => card.outputPath)).size, manifest.length);
  assert.ok(manifest.every((card) => card.width === 1200 && card.height === 630));
  assert.ok(manifest.every((card) => card.title && card.outputPath.endsWith('.png')));
  assert.ok(
    PUBLICATIONS
      .filter((publication) => publication.status !== 'published')
      .every((publication) => !expectedIds.has(publication.id)),
  );
});

test('social card sources prefer direct media, then project media and project cover', () => {
  let projects = [{ slug: 'alpha', title: 'Alpha', image: 'https://cdn.test/cover.svg' }];
  let publications = [{
    id: 'pulse/alpha-update',
    slug: 'alpha-update',
    status: 'published',
    primaryProjectId: 'projects/alpha',
    locales: { en: { title: 'Alpha update' } },
  }];
  let mediaCatalog = [
    {
      id: 'media/alpha/youtube/project',
      kind: 'youtube',
      poster: 'https://cdn.test/project-frame.jpg',
      targetIds: ['projects/alpha'],
    },
    {
      id: 'media/alpha/image/update',
      kind: 'image',
      poster: 'https://cdn.test/update-image.jpg',
      targetIds: ['pulse/alpha-update'],
    },
  ];
  let manifest = createSocialCardManifest({ projects, publications, mediaCatalog });
  let projectCard = manifest.find((card) => card.id === 'projects/alpha');
  let publicationCard = manifest.find((card) => card.id === 'pulse/alpha-update');

  assert.deepEqual(projectCard.sources, [
    'https://cdn.test/project-frame.jpg',
    'https://cdn.test/cover.svg',
  ]);
  assert.deepEqual(publicationCard.sources, [
    'https://cdn.test/update-image.jpg',
    'https://cdn.test/project-frame.jpg',
    'https://cdn.test/cover.svg',
  ]);
});

test('social card path contract is stable and rejects invalid public IDs', () => {
  assert.equal(SOCIAL_CARD_WIDTH, 1200);
  assert.equal(SOCIAL_CARD_HEIGHT, 630);
  assert.equal(getSocialCardFileName('pulse/alpha-update'), 'pulse-alpha-update.png');
  assert.equal(
    getSocialCardLocalUrl('projects/alpha'),
    'https://MakerDrive.github.io/cv/social-cards/projects-alpha.png',
  );
  assert.throws(() => getSocialCardFileName('../alpha'), /Invalid social card page ID/);
});

test('project entrypoints derive their project ID from their own module URL', () => {
  assert.equal(
    resolveProjectPageId('file:///repo/src/static-pages/projects/agent-portal/index.html.js'),
    'projects/agent-portal',
  );
});

test('unregistered publication stubs are noindex and do not claim a generated card', async () => {
  let html = await getPortfolioPage({
    basePath: '../../../../',
    publicationId: 'pulse/unregistered-stub',
  });

  assert.match(html, /<meta name="robots" content="noindex, follow">/);
  assert.doesNotMatch(html, /og:image:width/);
  assert.doesNotMatch(html, /social-cards\/pulse-unregistered-stub\.png/);
});

test('social card URLs prefer CIT and always retain a generated local fallback', () => {
  let assetPath = './cit/cit-store/social/pulse-alpha-update-a1b2c3d4e5f6.png';

  assert.equal(
    resolveSocialCardUrl('pulse/alpha-update', {
      [assetPath]: { cdnId: 'card-123' },
    }, {
      'pulse/alpha-update': assetPath,
    }),
    'https://rnd-pro.com/idn/card-123/public',
  );
  assert.equal(
    resolveSocialCardUrl('pulse/alpha-update', {}, {}),
    'https://MakerDrive.github.io/cv/social-cards/pulse-alpha-update.png',
  );
  assert.equal(resolveSocialCardUrl(undefined, {}, SOCIAL_CARD_ASSETS), undefined);
});

test('production manifest can resolve media without a handwritten card list', () => {
  let manifest = createSocialCardManifest({
    projects: loadProjectEntries(),
    publications: getPublicPublications(),
    mediaCatalog: PORTFOLIO_MEDIA_CATALOG,
  });

  assert.ok(manifest.some((card) => card.id === 'pulse/agent-portal-retrospective'));
  assert.ok(manifest.some((card) => card.id === 'projects/symbiote-ui'));
  assert.equal(manifest.some((card) => card.id === 'pulse/agent-portal'), false);
});
