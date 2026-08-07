import assert from 'node:assert/strict';
import test from 'node:test';

import {
  PUBLICATIONS,
  getPublicationContentPath,
  validatePublication,
  validateAll,
  getPublicationsByProject,
  getLatestPublications,
  getPublicPublications,
  getRetiredPublications,
  validateRetirementTargets,
} from '../../src/static-pages/data/publications.js';
import { loadPortfolioMarkdownContent } from '../../src/static-pages/data/markdownContent.js';
import {
  PORTFOLIO_PROJECT_IDS,
  PORTFOLIO_PROJECT_SLUGS,
} from '../../src/static-pages/data/portfolioProjectIds.js';

import {
  loadProjectContent,
  loadProjectEntries,
} from '../../src/static-pages/data/projects.js';
import { PROJECT_TRANSLATIONS } from '../../src/static-pages/data/projectTranslations.js';

const KEEP_PUBLICATION_SLUGS = new Set([
  'photopizza-retrospective',
  'project-graph-mcp-retrospective',
  'agent-pool-mcp-retrospective',
  'context-x-mcp-retrospective',
  'terminal-x-mcp-retrospective',
  'symbiote-engine-retrospective',
]);

const REMOVED_PUBLICATION_SLUGS = new Set([
  'whats-wrong-with-web-components',
  'symbiote-super-power-1',
  'symbiote-superpowers-2',
  'rd-process',
]);

const DIRECT_RETIREMENT_TARGETS = new Map([
  ['context-x-mcp-context-x-mcp-initial', 'pulse/context-x-mcp-retrospective'],
  ['boothbot-flash-relay-degradation', 'pulse/boothbot-retrospective'],
  ['complexscan-autobox-synchronization', 'pulse/complexscan-retrospective'],
  ['portable-action-message-parts-inline-embedding', 'pulse/symbiote-ui-retrospective'],
  ['animated-presenter-cursor-scenario-implementation', 'pulse/symbiote-ui-retrospective'],
  ['audio-provider-contracts-cryptographic-tts-receipts', 'pulse/symbiote-engine-retrospective'],
  ['evidence-backed-presentation-lessons-tts-validation', 'pulse/symbiote-workspace-retrospective'],
  ['canonical-virtual-media-sequence-modeling', 'pulse/symbiote-workspace-retrospective'],
  ['web-dashboard-spa-extensible-registry', 'pulse/agent-portal-retrospective'],
  ['mlops-flywheel-token-trajectory-compression', 'pulse/agent-portal-retrospective'],
  ['browser-safe-execution-vs-node-runtime', 'pulse/symbiote-engine-retrospective'],
  ['content-addressed-media-artifacts-receipt', 'pulse/symbiote-video-studio-retrospective'],
  ['browser-x-mcp-browser-automation-context-bridge', 'pulse/browser-x-mcp-retrospective'],
  ['f360-studio-studio-automation-state-machine', 'pulse/f360-studio-retrospective'],
  ['symbiote-video-studio-ai-video-editing-structures', 'pulse/symbiote-video-studio-retrospective'],
]);

const MERGE_RETIREMENT_TARGETS = new Map([
  ['agent-portal-t2-token-contract-migration', 'pulse/symbiote-ui-tiered-cascade-token-architecture'],
  ['photopizza-remote-retrospective', 'pulse/photopizza-remote-browser-hardware-control'],
  ['terminal-x-mcp-terminal-x-mcp-initial-architecture', 'pulse/terminal-x-mcp-retrospective'],
  ['symbiote-engine-deterministic-graph-execution', 'pulse/symbiote-engine-retrospective'],
  ['symbiote-node-symbiote-monorepo-decomposition', 'pulse/symbiote-node-retrospective'],
  ['photopizza-3d-scanning-support', 'pulse/photopizza-retrospective'],
  ['photogrammetry-3d-scanning-workflows', 'pulse/photopizza-retrospective'],
  ['frame-cache-keys-scope-based-invalidation', 'pulse/symbiote-video-studio-retrospective'],
  ['native-encoded-segment-compatibility-concat-planning', 'pulse/symbiote-video-studio-retrospective'],
  ['real-time-capacity-admission-control-pre-dispatch', 'pulse/symbiote-engine-retrospective'],
  ['unified-dispatch-registry-cli-mcp', 'pulse/symbiote-workspace-retrospective'],
  ['unified-mcp-gateway-singleton-backend', 'pulse/distributed-master-client-mcp-orchestration'],
  ['mcp-smart-gateway-meta-tools-routing', 'pulse/distributed-master-client-mcp-orchestration'],
  ['stategraph-reactive-state-sync-websocket', 'pulse/agent-portal-retrospective'],
  ['context-compression-minification-llms', 'pulse/project-graph-mcp-retrospective'],
  ['non-blocking-delegation-cli-workers', 'pulse/agent-pool-mcp-retrospective'],
  ['multi-step-pipelines-handoff', 'pulse/agent-pool-mcp-retrospective'],
  ['host-neutral-graph-first-execution', 'pulse/symbiote-engine-retrospective'],
  ['engine-owned-handler-execution-queues', 'pulse/symbiote-engine-retrospective'],
  ['boothbot-robotic-camera-sync', 'pulse/boothbot-retrospective'],
  ['mcp-agent-portal-mcp-function-calling-contracts', 'pulse/mcp-agent-portal-retrospective'],
  ['megavisor-interactive-photo-360-player', 'pulse/megavisor-retrospective'],
  ['symbiote-node-package-workspace-migration', 'pulse/symbiote-node-retrospective'],
]);

const RETIREMENT_TARGETS = new Map([
  ...DIRECT_RETIREMENT_TARGETS,
  ...MERGE_RETIREMENT_TARGETS,
]);

const PROJECT_SOURCE_HREFS = new Map([
  ['projects/agent-portal', 'https://rnd-pro.com/projects/agent-portal/'],
  ['projects/symbiote-video-studio', 'https://rnd-pro.com/projects/svs/'],
  ['projects/autobox-v1', 'https://rnd-pro.com/pulse/autobox-v1/'],
  ['projects/f360-studio', 'https://sketchfab.com/F360-Studio'],
  ['projects/complexscan', 'https://rnd-pro.com/pulse/complex-scan/'],
  ['projects/boothbot', 'https://rnd-pro.com/projects/boothbot/'],
  ['projects/photopizza', 'https://rnd-pro.com/projects/photopizza/'],
  ['projects/megavisor', 'https://rnd-pro.com/projects/megavisor/'],
  ['projects/project-graph-mcp', 'https://github.com/rnd-pro/project-graph-mcp'],
  ['projects/agent-pool-mcp', 'https://github.com/rnd-pro/agent-pool-mcp'],
  ['projects/browser-x-mcp', 'https://github.com/rnd-pro/browser-x-mcp'],
  ['projects/context-x-mcp', 'https://github.com/rnd-pro/context-x-mcp'],
  ['projects/terminal-x-mcp', 'https://github.com/rnd-pro/terminal-x-mcp'],
  ['projects/symbiote-workspace', 'https://github.com/rnd-pro/symbiote-workspace'],
  ['projects/symbiote-ui', 'https://github.com/rnd-pro/symbiote-ui'],
  ['projects/symbiote-node', 'https://github.com/rnd-pro/symbiote-node'],
  ['projects/symbiote-engine', 'https://github.com/rnd-pro/symbiote-engine'],
  ['projects/photopizza-remote', 'https://github.com/PhotoPizza/remote'],
  ['projects/photosnail-public', 'https://github.com/PhotoSnail/public'],
]);

const FIRST_DEPLOYMENT_SLUGS = new Set([
  'agent-pool-mcp-transparent-task-diagnostics',
  'project-graph-mcp-compact-code-mode-v1-5',
  'symbiote-ui-tiered-cascade-token-architecture',
  'browser-x-mcp-browser-x-mcp-v1-beta',
  'symbiote-workspace-workspace-presentation-journey-v1',
  'photopizza-remote-photopizza-remote-android-release',
  'symbiote-video-studio-live-ui-render',
]);

const SECOND_DEPLOYMENT_SLUGS = new Set([
  'hardware-arch-opensource-turntables',
  'espruino-multi-platform-control',
  'xr-spatial-evidence-and-projections',
  'multi-voice-narrated-tour-architecture',
  'deterministic-browser-capture-offline-rendering',
  'chat-intent-driven-workspace-construction-protocol',
  'strict-export-import-portable-workspace-configs',
  'no-reload-browser-updates-workspace-patching',
  'dual-mode-transport-stdio-http',
  'dynamic-workspace-registration-deduplication',
  'distributed-master-client-mcp-orchestration',
  'cross-model-peer-review',
  'atomic-cron-scheduling-local-agents',
  'workspace-vs-global-team-memory',
  'path-traversal-process-isolation',
  'ast-codebase-analysis-acorn',
  'multi-language-regex-parsers',
  'incremental-analysis-caching',
  'code-quality-analysis',
  'composable-automation-packs-node-types',
  'autobox-v1-photogrammetry-data-workflow',
  'photopizza-remote-browser-hardware-control',
  'photosnail-public-motion-control-object-tracking',
]);

const UNDATED_PUBLICATION_SLUGS = new Set([
  'agent-portal-retrospective',
  'symbiote-video-studio-retrospective',
  'autobox-v1-retrospective',
  'f360-studio-retrospective',
  'complexscan-retrospective',
  'boothbot-retrospective',
  'photopizza-retrospective',
  'megavisor-retrospective',
  'mcp-agent-portal-retrospective',
  'project-graph-mcp-retrospective',
  'agent-pool-mcp-retrospective',
  'browser-x-mcp-retrospective',
  'context-x-mcp-retrospective',
  'terminal-x-mcp-retrospective',
  'symbiote-workspace-retrospective',
  'symbiote-ui-retrospective',
  'symbiote-node-retrospective',
  'symbiote-engine-retrospective',
  'photosnail-public-retrospective',
  'lifecycle-messaging-platform-retrospective',
  'autobox-v1-hardware-lighting-sync-postmortem',
  'complexscan-mesh-decimation-tradeoffs',
  'f360-studio-photogrammetry-lighting-rig',
  'lifecycle-messaging-platform-gsm-modem-pool-isolation',
  'mcp-agent-portal-agent-browser-context-lost',
  'megavisor-gate9-logistics-bottleneck',
  'photosnail-public-arduino-interrupt-limitations',
  'autobox-v1-hardware-cross-polarization-museum',
  'lifecycle-messaging-platform-gsm-modem-pool-orchestration',
  'terminal-x-mcp-terminal-execution-state',
]);

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

function getPublicationBody(publication, locale) {
  return publication.locales[locale].body
    || loadPortfolioMarkdownContent(getPublicationContentPath(publication, locale));
}

test('Production PUBLICATIONS registry integrity', () => {
  assert.equal(PUBLICATIONS.length, 98, 'Production registry must contain exactly 98 portfolio publications');
  for (const pub of PUBLICATIONS) {
    assert.ok(['retrospective', 'article', 'release', 'field-note', 'research-note'].includes(pub.kind), `Publication ${pub.id} must be a retrospective, article, release, field-note or research-note`);
    assert.ok(['published', 'retired'].includes(pub.status), `Publication ${pub.id} must be published or retired`);
    if ((pub.kind === 'retrospective' || pub.kind === 'field-note') && pub.publishedAt === null) {
      assert.ok(pub.subjectPeriod, `Publication ${pub.id} must have a subjectPeriod`);
    } else {
      assert.ok(pub.publishedAt, `Publication ${pub.id} publishedAt must be set`);
    }
    assert.equal(pub.updatedAt, null, `Publication ${pub.id} updatedAt must be null`);
  }

  assert.deepEqual(
    [...PORTFOLIO_PROJECT_SLUGS].sort(),
    loadProjectEntries().map((project) => project.slug).sort(),
    'Browser-safe canonical project IDs must match the project source files'
  );

  assert.doesNotThrow(() => validateAll(PUBLICATIONS));
  assert.doesNotThrow(() => validateRetirementTargets(PUBLICATIONS));
});

test('Production editorial classification matches the current 6/54/23/15 matrix', () => {
  let retired = getRetiredPublications(PUBLICATIONS);
  let published = getPublicPublications(PUBLICATIONS);
  let bySlug = new Map(PUBLICATIONS.map(publication => [publication.slug, publication]));

  assert.equal(PUBLICATIONS.length, 98);
  assert.equal(KEEP_PUBLICATION_SLUGS.size, 6);
  assert.equal(DIRECT_RETIREMENT_TARGETS.size, 15);
  assert.equal(MERGE_RETIREMENT_TARGETS.size, 23);
  assert.equal(RETIREMENT_TARGETS.size, 38);
  assert.equal(retired.length, 38);
  assert.equal(published.length, 60);

  for (let slug of KEEP_PUBLICATION_SLUGS) {
    assert.equal(bySlug.get(slug)?.status, 'published', `${slug} must remain published`);
  }
  for (let [slug, target] of RETIREMENT_TARGETS) {
    let publication = bySlug.get(slug);
    assert.ok(publication, `${slug} must remain in the registry`);
    assert.equal(publication.status, 'retired', `${slug} must be retired`);
    assert.equal(publication.retirementTarget, target, `${slug} must use its locked target`);
  }

  let rewriteSlugs = published
    .map(publication => publication.slug)
    .filter(slug => !KEEP_PUBLICATION_SLUGS.has(slug));
  assert.equal(rewriteSlugs.length, 54);
  assert.deepEqual(
    retired.map(publication => publication.slug).sort(),
    [...RETIREMENT_TARGETS.keys()].sort(),
  );
});

test('Retirement targets accept published internal IDs and absolute HTTPS URLs only', () => {
  let target = makePub({
    slug: 'canonical-target',
    relatedProjectIds: ['projects/agent-portal'],
    primaryProjectId: 'projects/agent-portal',
  });
  let internal = makePub({
    slug: 'internal-retired',
    status: 'retired',
    retirementTarget: target.id,
    relatedProjectIds: ['projects/agent-portal'],
    primaryProjectId: 'projects/agent-portal',
  });
  let external = makePub({
    slug: 'external-retired',
    status: 'retired',
    retirementTarget: 'https://example.com/canonical/',
    relatedProjectIds: ['projects/agent-portal'],
    primaryProjectId: 'projects/agent-portal',
  });

  assert.doesNotThrow(() => validatePublication(internal));
  assert.doesNotThrow(() => validateRetirementTargets([target, internal, external]));
  assert.throws(
    () => validateRetirementTargets([target, { ...external, retirementTarget: 'https://' }]),
    /valid absolute HTTPS URL/,
  );
  assert.throws(
    () => validateRetirementTargets([target, { ...external, retirementTarget: 'http://example.com/' }]),
    /published pulse ID or a valid absolute HTTPS URL/,
  );
  assert.throws(
    () => validateRetirementTargets([target, { ...internal, retirementTarget: 'pulse/missing' }]),
    /currently published publication/,
  );
  assert.throws(
    () => validateRetirementTargets([
      { ...target, status: 'retired', retirementTarget: external.retirementTarget },
      internal,
    ]),
    /currently published publication/,
  );
  assert.throws(
    () => validatePublication({ ...target, retirementTarget: internal.id }),
    /not retired.*must not have a retirementTarget/,
  );
});

test('Production publication titles are distinct across locales and from linked project titles', () => {
  let projectsBySlug = new Map(loadProjectEntries().map(project => [project.slug, project]));

  for (let pub of PUBLICATIONS) {
    if (pub.kind === 'retrospective') {
      let projectSlug = pub.primaryProjectId.replace('projects/', '');
      let project = projectsBySlug.get(projectSlug);
      assert.ok(project, `Could not find project for publication slug: ${pub.slug}`);

      let localizedTitles = ['en', 'ru', 'es'].map(locale => pub.locales[locale].title.trim());
      assert.equal(
        new Set(localizedTitles).size,
        localizedTitles.length,
        `${pub.slug} publication titles must be distinct across en, ru, and es`,
      );

      for (let locale of ['en', 'ru', 'es']) {
        let localizedProjectTitle = PROJECT_TRANSLATIONS[locale]?.[projectSlug]?.title || project.title;
        assert.notEqual(
          pub.locales[locale].title.trim(),
          localizedProjectTitle.trim(),
          `${locale}:${pub.slug} publication title must not repeat the project title`,
        );
      }
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

test('All 21 projects have at least one Pulse publication', () => {
  const coveredProjectIds = new Set(
    getPublicPublications(PUBLICATIONS).map(pub => pub.primaryProjectId),
  );
  const missingProjects = PORTFOLIO_PROJECT_IDS.filter(id => !coveredProjectIds.has(id));
  
  assert.equal(missingProjects.length, 0, `The following projects are missing from Pulse: ${missingProjects.join(', ')}`);
});

test('All articles must have original source links (Canonical protection)', () => {
  const articles = getPublicPublications(PUBLICATIONS).filter(pub => pub.kind === 'article');
  for (const pub of articles) {
    assert.ok(Array.isArray(pub.sourceLinks) && pub.sourceLinks.length > 0, `Article publication ${pub.id} must have non-empty sourceLinks`);
    assert.ok(pub.sourceLinks.every(link => {
      try {
        new URL(link.href);
        return typeof link.href === 'string' && typeof link.label === 'string';
      } catch {
        return false;
      }
    }), `Article publication ${pub.id} sourceLinks must have valid href URL and label`);
  }
});

test('Production registry contains only current publication records', () => {
  let bySlug = new Map(PUBLICATIONS.map(publication => [publication.slug, publication]));
  for (let slug of REMOVED_PUBLICATION_SLUGS) {
    assert.equal(bySlug.has(slug), false, `${slug} must stay outside the registry`);
  }

  for (const publication of PUBLICATIONS) {
    for (const sourceLink of publication.sourceLinks) {
      assert.ok(
        !sourceLink.href.startsWith('https://habr.com/'),
        `${publication.slug} has an unexpected Habr source link`,
      );
    }
  }
});

test('Published articles are associated with projects', () => {
  const globalArticles = getPublicPublications(PUBLICATIONS)
    .filter(publication => publication.kind === 'article' && publication.primaryProjectId === null);
  assert.deepEqual(globalArticles, []);
});

test('Published project records use their authoritative HTTPS project source', () => {
  let projectPublications = getPublicPublications(PUBLICATIONS)
    .filter(publication => publication.primaryProjectId !== null);
  let lifecyclePublications = projectPublications
    .filter(publication => publication.primaryProjectId === 'projects/lifecycle-messaging-platform');
  let sourcedPublications = projectPublications
    .filter(publication => publication.primaryProjectId !== 'projects/lifecycle-messaging-platform');

  assert.ok(lifecyclePublications.length > 0);
  for (let publication of lifecyclePublications) {
    assert.deepEqual(publication.sourceLinks, [], `${publication.slug} must remain confidential`);
  }

  for (let publication of sourcedPublications) {
    let expectedHref = PROJECT_SOURCE_HREFS.get(publication.primaryProjectId);
    assert.ok(expectedHref, `${publication.primaryProjectId} must have a source mapping`);
    assert.deepEqual(
      publication.sourceLinks.map(link => link.href),
      [expectedHref],
      `${publication.slug} must use its authoritative project source`,
    );
    assert.ok(
      publication.sourceLinks.every(link => new URL(link.href).protocol === 'https:'),
      `${publication.slug} source links must use HTTPS`,
    );
  }
});

test('CV-native dated publications use the exact first public deployment cohorts', () => {
  let datedProjectPublications = getPublicPublications(PUBLICATIONS)
    .filter(publication => publication.primaryProjectId !== null && publication.publishedAt !== null);
  let expectedSlugs = new Set([...FIRST_DEPLOYMENT_SLUGS, ...SECOND_DEPLOYMENT_SLUGS]);

  assert.deepEqual(
    datedProjectPublications.map(publication => publication.slug).sort(),
    [...expectedSlugs].sort(),
  );
  for (let publication of datedProjectPublications) {
    let expectedDate = FIRST_DEPLOYMENT_SLUGS.has(publication.slug)
      ? '2026-07-31T18:50:57Z'
      : '2026-07-31T22:20:44Z';
    assert.equal(publication.publishedAt, expectedDate, publication.slug);
  }
});

test('Undated retrospectives and historical field notes remain undated', () => {
  let undatedProjectPublications = getPublicPublications(PUBLICATIONS)
    .filter(publication => publication.primaryProjectId !== null && publication.publishedAt === null);

  assert.deepEqual(
    undatedProjectPublications.map(publication => publication.slug).sort(),
    [...UNDATED_PUBLICATION_SLUGS].sort(),
  );
  for (let slug of UNDATED_PUBLICATION_SLUGS) {
    let publication = PUBLICATIONS.find(candidate => candidate.slug === slug);
    assert.equal(publication?.publishedAt, null, slug);
  }
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
    const pub = PUBLICATIONS.find(p => p.slug === `${slug}-retrospective`);
    assert.ok(pub, `Could not find publication for slug: ${slug}`);
    return getPublicationBody(pub, locale);
  };

  assert.match(getBody('agent-portal', 'en'), /detached singleton backend/);
  assert.match(getBody('agent-portal', 'en'), /versioned operations/);
  assert.match(getBody('agent-portal', 'en'), /full snapshot/);
  assert.match(getBody('project-graph-mcp', 'en'), /vendored Acorn parser/);
  assert.match(getBody('project-graph-mcp', 'en'), /Compact mode preserves identifiers/);
  assert.match(getBody('project-graph-mcp', 'en'), /\.ctx` files hold documentation contracts/);
  assert.match(getBody('agent-pool-mcp', 'en'), /returns a task identifier immediately/);
  assert.match(getBody('agent-pool-mcp', 'en'), /five-field cron parser/);
  assert.match(getBody('agent-pool-mcp', 'en'), /acceptance and architectural decisions stay with the orchestrator/);

  assert.match(getBody('agent-portal', 'ru'), /detached singleton backend/);
  assert.match(getBody('agent-portal', 'ru'), /версионированные операции/);
  assert.match(getBody('agent-portal', 'ru'), /полный snapshot/);
  assert.match(getBody('project-graph-mcp', 'ru'), /vendored-парсером Acorn/);
  assert.match(getBody('project-graph-mcp', 'ru'), /Compact mode сохраняет идентификаторы/);
  assert.match(getBody('project-graph-mcp', 'ru'), /`.ctx`-файлы хранят контракты документации/);
  assert.match(getBody('agent-pool-mcp', 'ru'), /сразу возвращает идентификатор задачи/);
  assert.match(getBody('agent-pool-mcp', 'ru'), /parser пяти полей cron/);
  assert.match(getBody('agent-pool-mcp', 'ru'), /решение о приёмке и архитектуре принадлежит оркестратору/);

  assert.match(getBody('agent-portal', 'es'), /backend singleton desacoplado/);
  assert.match(getBody('agent-portal', 'es'), /operaciones versionadas/);
  assert.match(getBody('agent-portal', 'es'), /snapshot completo/);
  assert.match(getBody('project-graph-mcp', 'es'), /copia vendorizada de Acorn/);
  assert.match(getBody('project-graph-mcp', 'es'), /Compact mode conserva los identificadores/);
  assert.match(getBody('project-graph-mcp', 'es'), /archivos `.ctx` guardan contratos de documentación/);
  assert.match(getBody('agent-pool-mcp', 'es'), /devuelve de inmediato un identificador de tarea/);
  assert.match(getBody('agent-pool-mcp', 'es'), /parser cron de cinco campos/);
  assert.match(getBody('agent-pool-mcp', 'es'), /decisiones de arquitectura pertenecen al orquestador/);
});

test('Published metadata uses article-backed claims in every locale', () => {
  const summaries = new Map(
    PUBLICATIONS
      .filter(publication => publication.status === 'published')
      .map(publication => [publication.slug, publication.locales]),
  );
  const expected = new Map([
    ['symbiote-video-studio-retrospective', ['graph, timeline, provider, and render contracts', 'контракты графа, таймлайна, провайдеров и рендера', 'contratos de grafo, timeline, proveedores y render']],
    ['symbiote-node-retrospective', ['migration facade', 'миграционный фасад', 'fachada de migración']],
    ['symbiote-engine-retrospective', ['browser-safe entry point', 'browser-safe entry point', 'browser-safe entry point']],
    ['multi-voice-narrated-tour-architecture', ['speechSynthesis', 'speechSynthesis', 'speechSynthesis']],
    ['deterministic-browser-capture-offline-rendering', ['renderClock', 'renderClock', 'renderClock']],
    ['strict-export-import-portable-workspace-configs', ['Portable JSON', 'Переносимый JSON', 'JSON portátil']],
    ['no-reload-browser-updates-workspace-patching', ['validated config patches', 'проверенные патчи конфигурации', 'parches de configuración validados']],
    ['chat-intent-driven-workspace-construction-protocol', ['planning, provider selection, and validation', 'планирование, выбор провайдеров и проверку', 'planificación, selección de proveedores y validación']],
    ['complexscan-mesh-decimation-tradeoffs', ['capture system', 'съёмочную систему', 'sistema de captura']],
    ['lifecycle-messaging-platform-gsm-modem-pool-isolation', ['delivery subsystem', 'подсистемы доставки', 'subsistema de entrega']],
    ['mcp-agent-portal-agent-browser-context-lost', ['probes the stored Playwright page', 'проверку и перезапуск', 'comprobación y reinicio']],
    ['photosnail-public-arduino-interrupt-limitations', ['require separate evidence', 'требуют отдельных свидетельств', 'requieren evidencias separadas']],
    ['photosnail-public-motion-control-object-tracking', ['implements carriage movement and capture settings', 'реализует движение каретки и настройки съёмки', 'implementa movimiento y ajustes de captura']],
    ['cross-model-peer-review', ['orchestrator retains acceptance authority', 'решение о приёмке остаётся у оркестратора', 'orquestador conserva la aceptación']],
  ]);

  for (const [slug, localeFragments] of expected) {
    const locales = summaries.get(slug);
    assert.ok(locales, `Missing published metadata for ${slug}`);
    ['en', 'ru', 'es'].forEach((locale, index) => {
      assert.match(locales[locale].summary, new RegExp(localeFragments[index]));
    });
  }

  for (const publication of PUBLICATIONS.filter(item => item.status === 'published')) {
    assert.doesNotMatch(publication.locales.es.title, /[А-Яа-яЁё]/);
    assert.doesNotMatch(publication.locales.es.summary, /[А-Яа-яЁё]/);
  }
});

test('Publications stay distinct from project case descriptions', () => {
  const projects = loadProjectEntries();

  for (const project of projects) {
    const pub = PUBLICATIONS.find(
      (publication) => publication.status === 'published'
        && publication.primaryProjectId === `projects/${project.slug}`,
    );
    assert.ok(pub, `Could not find publication for project slug: ${project.slug}`);

    assert.notEqual(
      getPublicationBody(pub, 'en'),
      project.details,
      `en:${project.slug} publication body must not duplicate project details`
    );

    for (const locale of ['ru', 'es']) {
      assert.notEqual(
        getPublicationBody(pub, locale),
        loadProjectContent(project.slug, locale),
        `${locale}:${project.slug} publication body must not duplicate project details`
      );
    }
  }
});
