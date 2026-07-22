import assert from 'node:assert/strict';
import test from 'node:test';

import {
  PUBLICATIONS,
  validatePublication,
  validateAll,
  getPublicationsByProject,
  getLatestPublications,
  getPublicPublications,
} from '../../src/static-pages/data/publications.js';
import {
  PORTFOLIO_PROJECT_IDS,
  PORTFOLIO_PROJECT_SLUGS,
} from '../../src/static-pages/data/portfolioProjectIds.js';

import { loadProjectEntries } from '../../src/static-pages/data/projects.js';
import { PROJECT_TRANSLATIONS } from '../../src/static-pages/data/projectTranslations.js';

function deepFreeze(obj) {
  if (obj && typeof obj === 'object') {
    Object.freeze(obj);
    Object.keys(obj).forEach(key => {
      if (typeof obj[key] === 'object') {
        deepFreeze(obj[key]);
      }
    });
  }
  return obj;
}

const MOCK_FIXTURES = deepFreeze([
  {
    id: 'pulse/boothbot-dated',
    slug: 'boothbot-dated',
    kind: 'retrospective',
    status: 'published',
    publishedAt: '2026-07-17T12:00:00Z',
    updatedAt: null,
    subjectPeriod: '2026',
    relatedProjectIds: ['projects/boothbot'],
    primaryProjectId: 'projects/boothbot',
    tags: [],
    sourceLinks: [],
    locales: {
      en: { title: 'BoothBot Dated', summary: 'Summary', body: 'Body' },
      ru: { title: 'BoothBot Dated', summary: 'Summary', body: 'Body' },
      es: { title: 'BoothBot Dated', summary: 'Summary', body: 'Body' }
    }
  },
  {
    id: 'pulse/photopizza-dated',
    slug: 'photopizza-dated',
    kind: 'update',
    status: 'published',
    publishedAt: '2026-07-18T12:00:00Z',
    updatedAt: null,
    subjectPeriod: '2026',
    relatedProjectIds: ['projects/photopizza'],
    primaryProjectId: 'projects/photopizza',
    tags: [],
    sourceLinks: [],
    locales: {
      en: { title: 'PhotoPizza Dated', summary: 'Summary', body: 'Body' },
      ru: { title: 'PhotoPizza Dated', summary: 'Summary', body: 'Body' },
      es: { title: 'PhotoPizza Dated', summary: 'Summary', body: 'Body' }
    }
  },
  {
    id: 'pulse/two-project-update',
    slug: 'two-project-update',
    kind: 'release',
    status: 'published',
    publishedAt: '2026-07-17T12:00:00-03:00',
    updatedAt: null,
    subjectPeriod: '2026',
    relatedProjectIds: ['projects/agent-portal', 'projects/project-graph-mcp'],
    primaryProjectId: null,
    tags: [],
    sourceLinks: [],
    locales: {
      en: { title: 'Two Project Update', summary: 'Summary', body: 'Body' },
      ru: { title: 'Two Project Update', summary: 'Summary', body: 'Body' },
      es: { title: 'Two Project Update', summary: 'Summary', body: 'Body' }
    }
  },
  {
    id: 'pulse/global-update',
    slug: 'global-update',
    kind: 'research-note',
    status: 'published',
    publishedAt: '2026-07-17T12:00:00-03:00',
    updatedAt: null,
    subjectPeriod: '2026',
    relatedProjectIds: [],
    primaryProjectId: null,
    tags: [],
    sourceLinks: [],
    locales: {
      en: { title: 'Global Update', summary: 'Summary', body: 'Body' },
      ru: { title: 'Global Update', summary: 'Summary', body: 'Body' },
      es: { title: 'Global Update', summary: 'Summary', body: 'Body' }
    }
  },
  {
    id: 'pulse/draft-update',
    slug: 'draft-update',
    kind: 'field-note',
    status: 'draft',
    publishedAt: '2026-07-17T12:00:00-03:00',
    updatedAt: null,
    subjectPeriod: '2026',
    relatedProjectIds: ['projects/agent-portal'],
    primaryProjectId: null,
    tags: [],
    sourceLinks: [],
    locales: {
      en: { title: 'Draft Update', summary: 'Summary', body: 'Body' },
      ru: { title: 'Draft Update', summary: 'Summary', body: 'Body' },
      es: { title: 'Draft Update', summary: 'Summary', body: 'Body' }
    }
  }
]);

function makePub(overrides = {}) {
  const slug = overrides.slug || 'agent-portal';
  return {
    id: `pulse/${slug}`,
    slug: slug,
    kind: 'retrospective',
    status: 'published',
    publishedAt: null,
    updatedAt: null,
    subjectPeriod: '2025-2026',
    relatedProjectIds: [`projects/${slug}`],
    primaryProjectId: `projects/${slug}`,
    tags: [],
    sourceLinks: [],
    locales: {
      en: { title: 'English Title', summary: 'English summary', body: 'English body content' },
      ru: { title: 'Russian Title', summary: 'Russian summary', body: 'Russian body content' },
      es: { title: 'Spanish Title', summary: 'Spanish summary', body: 'Spanish body content' }
    },
    ...overrides
  };
}

test('Production PUBLICATIONS registry integrity', () => {
  assert.equal(PUBLICATIONS.length, 21, 'Production registry must contain exactly 21 publications');
  for (const pub of PUBLICATIONS) {
    assert.equal(pub.kind, 'retrospective', `Publication ${pub.id} must be a retrospective`);
    assert.equal(pub.status, 'published', `Publication ${pub.id} must be published`);
    assert.equal(pub.publishedAt, null, `Publication ${pub.id} publishedAt must be null (undated retrospective)`);
    assert.equal(pub.updatedAt, null, `Publication ${pub.id} updatedAt must be null`);
  }

  assert.deepEqual(
    [...PORTFOLIO_PROJECT_SLUGS].sort(),
    loadProjectEntries().map((project) => project.slug).sort(),
    'Browser-safe canonical project IDs must match the project source files'
  );

  assert.doesNotThrow(() => validateAll(PUBLICATIONS));
});

test('Production publication titles are distinct across locales and from linked project titles', () => {
  let projectsBySlug = new Map(loadProjectEntries().map(project => [project.slug, project]));

  for (let pub of PUBLICATIONS) {
    let project = projectsBySlug.get(pub.slug);
    assert.ok(project, `Could not find project for publication slug: ${pub.slug}`);

    let localizedTitles = ['en', 'ru', 'es'].map(locale => pub.locales[locale].title.trim());
    assert.equal(
      new Set(localizedTitles).size,
      localizedTitles.length,
      `${pub.slug} publication titles must be distinct across en, ru, and es`,
    );

    for (let locale of ['en', 'ru', 'es']) {
      let localizedProjectTitle = PROJECT_TRANSLATIONS[locale]?.[pub.slug]?.title || project.title;
      assert.notEqual(
        pub.locales[locale].title.trim(),
        localizedProjectTitle.trim(),
        `${locale}:${pub.slug} publication title must not repeat the project title`,
      );
    }
  }
});

test('Required publication fields are always present', () => {
  const requiredFields = [
    'id',
    'slug',
    'kind',
    'status',
    'publishedAt',
    'updatedAt',
    'subjectPeriod',
    'relatedProjectIds',
    'primaryProjectId',
    'tags',
    'sourceLinks',
    'locales',
  ];

  for (const field of requiredFields) {
    const pub = makePub();
    delete pub[field];
    assert.throws(
      () => validatePublication(pub),
      new RegExp(`must have a "${field}" field`),
      `Missing ${field} must be rejected`
    );
  }
});

test('Unique publication identity in validateAll', () => {
  const p1 = makePub({ slug: 'agent-portal' });
  const p2 = makePub({ slug: 'agent-portal' });

  assert.throws(() => validateAll([p1, p2]), /Duplicate publication ID/);
});

test('Timezone-aware dates validation', () => {
  const validPub = makePub({ publishedAt: '2026-07-17T12:00:00-03:00' });
  assert.doesNotThrow(() => validatePublication(validPub));

  const validPubZ = makePub({ publishedAt: '2026-07-17T12:00:00Z' });
  assert.doesNotThrow(() => validatePublication(validPubZ));

  const legacyPub = makePub({ publishedAt: null, subjectPeriod: '2025-2026' });
  assert.doesNotThrow(() => validatePublication(legacyPub));

  const naivePub = makePub({ publishedAt: '2026-07-17T12:00:00' });
  assert.throws(() => validatePublication(naivePub), /publishedAt/i);

  const dateOnlyPub = makePub({ publishedAt: '2026-07-17' });
  assert.throws(() => validatePublication(dateOnlyPub), /publishedAt/i);

  const invalidPub = makePub({ publishedAt: 'not-a-date' });
  assert.throws(() => validatePublication(invalidPub), /publishedAt/i);
});

test('Timezone-aware dates reject impossible calendar instants', () => {
  let invalidPublishedAt = makePub({ publishedAt: '2026-02-30T12:00:00Z' });
  assert.throws(() => validatePublication(invalidPublishedAt), /publishedAt/i);

  let invalidUpdatedAt = makePub({ updatedAt: '2025-13-01T12:00:00-03:00' });
  assert.throws(() => validatePublication(invalidUpdatedAt), /updatedAt/i);
});

test('Published non-retrospectives require an actual publication instant', () => {
  let undatedUpdate = makePub({
    kind: 'update',
    publishedAt: null,
    subjectPeriod: '2025-2026',
  });

  assert.throws(() => validatePublication(undatedUpdate), /publishedAt/i);
});

test('Legacy retrospectives requirements', () => {
  const validLegacy = makePub({ publishedAt: null, subjectPeriod: '2021-2022' });
  assert.doesNotThrow(() => validatePublication(validLegacy));

  const invalidLegacy = makePub({ publishedAt: null, subjectPeriod: null });
  assert.throws(() => validatePublication(invalidLegacy), /subjectPeriod/i);
});

test('Project relations and validation rules', () => {
  const invalidProjIdFormat = makePub({
    relatedProjectIds: ['agent-portal'],
    primaryProjectId: 'agent-portal'
  });
  assert.throws(() => validatePublication(invalidProjIdFormat), /must start with "projects\/"/);

  const invalidSlug = makePub({
    relatedProjectIds: ['projects/non-existent-slug'],
    primaryProjectId: 'projects/non-existent-slug'
  });
  assert.throws(() => validatePublication(invalidSlug), /references invalid project ID/);

  assert.throws(
    () => getPublicationsByProject('agent-portal'),
    /canonical "projects\/<slug>" format/,
    'Reverse-index lookup must reject bare project slugs'
  );
  assert.throws(
    () => getPublicationsByProject('projects/non-existent-slug'),
    /Unknown canonical project ID/,
    'Reverse-index lookup must reject unknown project IDs'
  );

  assert.deepEqual(
    PORTFOLIO_PROJECT_IDS,
    PORTFOLIO_PROJECT_SLUGS.map((slug) => `projects/${slug}`)
  );

  const invalidPrimaryId = makePub({
    relatedProjectIds: ['projects/agent-portal'],
    primaryProjectId: 'projects/complexscan'
  });
  assert.throws(() => validatePublication(invalidPrimaryId), /primaryProjectId.*must be in relatedProjectIds/);

  const invalidTags = makePub({ tags: [123] });
  assert.throws(() => validatePublication(invalidTags), /tags must contain only strings/);

  const invalidSourceLinks = makePub({ sourceLinks: 'not-an-array' });
  assert.throws(() => validatePublication(invalidSourceLinks), /sourceLinks must be an array/);
});

test('Source links require plain objects with valid text fields', () => {
  let validSourceLinks = makePub({
    sourceLinks: [{ label: 'Project source', href: 'https://example.com', summary: '' }],
  });
  assert.doesNotThrow(() => validatePublication(validSourceLinks));

  let invalidShape = makePub({
    sourceLinks: [
      Object.assign(new Date(), { label: 'Source', href: 'https://example.com' }),
    ],
  });
  assert.throws(() => validatePublication(invalidShape), /sourceLinks.*plain object/i);

  let missingLabel = makePub({
    sourceLinks: [{ label: ' ', href: 'https://example.com' }],
  });
  assert.throws(() => validatePublication(missingLabel), /sourceLinks.*label/i);

  let missingHref = makePub({ sourceLinks: [{ label: 'Source', href: '' }] });
  assert.throws(() => validatePublication(missingHref), /sourceLinks.*href/i);

  let invalidSummary = makePub({
    sourceLinks: [{ label: 'Source', href: 'https://example.com', summary: 42 }],
  });
  assert.throws(() => validatePublication(invalidSummary), /sourceLinks.*summary/i);
});

test('Locale versions validation', () => {
  const missingTitle = makePub({
    locales: {
      en: { summary: 'summary', body: 'body' },
      ru: { title: 'ru-title', summary: 'ru-summary', body: 'ru-body' },
      es: { title: 'es-title', summary: 'es-summary', body: 'es-body' }
    }
  });
  assert.throws(() => validatePublication(missingTitle), /locale/i);

  const missingRuLocale = makePub({
    locales: {
      en: { title: 'en-title', summary: 'en-summary', body: 'en-body' },
      es: { title: 'es-title', summary: 'es-summary', body: 'es-body' },
    }
  });
  assert.throws(() => validatePublication(missingRuLocale), /locale/i);

  const emptyBody = makePub({
    locales: {
      en: { title: 'en-title', summary: 'en-summary', body: '' },
      ru: { title: 'ru-title', summary: 'ru-summary', body: 'ru-body' },
      es: { title: 'es-title', summary: 'es-summary', body: 'es-body' }
    }
  });
  assert.throws(() => validatePublication(emptyBody), /locale/i);
});

test('Validation supports all 5 kinds and draft isolation', () => {
  assert.doesNotThrow(() => validateAll(MOCK_FIXTURES));

  const kinds = ['retrospective', 'update', 'release', 'research-note', 'field-note'];
  for (const kind of kinds) {
    const pub = makePub({
      kind,
      slug: `pub-${kind}`,
      id: `pulse/pub-${kind}`,
      publishedAt: kind === 'retrospective' ? null : '2026-07-17T12:00:00Z',
      relatedProjectIds: [],
      primaryProjectId: null,
    });
    assert.doesNotThrow(() => validatePublication(pub));
  }

  const publicPubs = getPublicPublications(MOCK_FIXTURES);
  assert.equal(publicPubs.length, 4);
  assert.ok(!publicPubs.some(p => p.status === 'draft'), 'Drafts must be isolated');

  const projPubs = getPublicationsByProject('projects/agent-portal', MOCK_FIXTURES);
  assert.equal(projPubs.length, 1);
  assert.equal(projPubs[0].slug, 'two-project-update');
  assert.ok(!projPubs.some(p => p.status === 'draft'), 'Drafts must be isolated in project helper');
  const projectGraphPubs = getPublicationsByProject('projects/project-graph-mcp', MOCK_FIXTURES);
  assert.equal(projectGraphPubs.length, 1);
  assert.equal(projectGraphPubs[0], projPubs[0]);

  const latestPubs = getLatestPublications(MOCK_FIXTURES);
  assert.equal(latestPubs.length, 4);
  assert.ok(!latestPubs.some(p => p.status === 'draft'), 'Drafts must be isolated in latest helper');

  assert.equal(latestPubs[0].slug, 'photopizza-dated');
  assert.equal(latestPubs[1].slug, 'global-update');
  assert.equal(latestPubs[2].slug, 'two-project-update');
  assert.equal(latestPubs[3].slug, 'boothbot-dated');
});

test('Additional strict validation tests', () => {
  const invalidGlobal = makePub({
    id: 'pulse/invalid-global',
    slug: 'invalid-global',
    kind: 'update',
    status: 'published',
    publishedAt: '2026-07-17T12:00:00-03:00',
    relatedProjectIds: [],
    primaryProjectId: 'projects/agent-portal'
  });
  assert.throws(() => validatePublication(invalidGlobal), /is global.*must not have a primaryProjectId/);

  const validGlobal = makePub({
    id: 'pulse/valid-global',
    slug: 'valid-global',
    kind: 'update',
    status: 'published',
    publishedAt: '2026-07-17T12:00:00-03:00',
    relatedProjectIds: [],
    primaryProjectId: null
  });
  assert.doesNotThrow(() => validatePublication(validGlobal));

  const invalidRelated = makePub({
    id: 'pulse/invalid-related',
    slug: 'invalid-related',
    relatedProjectIds: ['projects/agent-portal', 'projects/agent-portal'],
    primaryProjectId: 'projects/agent-portal'
  });
  assert.throws(() => validatePublication(invalidRelated), /contains duplicate/);

  const invalidKind = makePub({
    kind: 'invalid-kind'
  });
  assert.throws(() => validatePublication(invalidKind), /kind must be one of/);
});

test('Agent tooling publications preserve article-derived R&D accents', () => {
  const getBody = (slug, locale) => {
    const pub = PUBLICATIONS.find(p => p.slug === slug);
    assert.ok(pub, `Could not find publication for slug: ${slug}`);
    return pub.locales[locale].body;
  };

  assert.match(getBody('agent-portal', 'en'), /resource groups route work/);
  assert.match(getBody('agent-portal', 'en'), /RAG-style retrieval/);
  assert.match(getBody('agent-portal', 'en'), /human-in-the-loop/);
  assert.match(getBody('project-graph-mcp', 'en'), /10-50x reduction/);
  assert.match(getBody('project-graph-mcp', 'en'), /GraphRAG-style retrieval/);
  assert.match(getBody('project-graph-mcp', 'en'), /faster model can extract structure/);
  assert.match(getBody('agent-pool-mcp', 'en'), /cross-model consensus/);
  assert.match(getBody('agent-pool-mcp', 'en'), /eval-style checks/);
  assert.match(getBody('agent-pool-mcp', 'en'), /cheaper\/faster workers/);

  assert.match(getBody('agent-portal', 'ru'), /resource groups распределяют работу/);
  assert.match(getBody('agent-portal', 'ru'), /RAG-style retrieval/);
  assert.match(getBody('agent-portal', 'ru'), /human-in-the-loop контроль/);
  assert.match(getBody('project-graph-mcp', 'ru'), /10-50 раз/);
  assert.match(getBody('project-graph-mcp', 'ru'), /GraphRAG-style retrieval/);
  assert.match(getBody('project-graph-mcp', 'ru'), /быстрая модель извлекает структуру/);
  assert.match(getBody('agent-pool-mcp', 'ru'), /кросс-модельный консенсус/);
  assert.match(getBody('agent-pool-mcp', 'ru'), /eval-style проверки/);
  assert.match(getBody('agent-pool-mcp', 'ru'), /более дешёвым\/быстрым воркерам/);

  assert.match(getBody('agent-portal', 'es'), /resource groups enrutan trabajo/);
  assert.match(getBody('agent-portal', 'es'), /RAG-style retrieval/);
  assert.match(getBody('agent-portal', 'es'), /human-in-the-loop/);
  assert.match(getBody('project-graph-mcp', 'es'), /10-50x/);
  assert.match(getBody('project-graph-mcp', 'es'), /GraphRAG-style retrieval/);
  assert.match(getBody('project-graph-mcp', 'es'), /modelo rápido extrae estructura/);
  assert.match(getBody('agent-pool-mcp', 'es'), /consenso entre modelos/);
  assert.match(getBody('agent-pool-mcp', 'es'), /checks tipo eval/);
  assert.match(getBody('agent-pool-mcp', 'es'), /workers más baratos\/rápidos/);
});

test('Publications stay distinct from project case descriptions', () => {
  const projects = loadProjectEntries();

  for (const project of projects) {
    const pub = PUBLICATIONS.find(p => p.slug === project.slug);
    assert.ok(pub, `Could not find publication for project slug: ${project.slug}`);

    assert.notEqual(
      pub.locales.en.body,
      project.details,
      `en:${project.slug} publication body must not duplicate project details`
    );

    for (const locale of ['ru', 'es']) {
      assert.notEqual(
        pub.locales[locale].body,
        PROJECT_TRANSLATIONS[locale][project.slug].details,
        `${locale}:${project.slug} publication body must not duplicate project details`
      );
    }
  }
});
