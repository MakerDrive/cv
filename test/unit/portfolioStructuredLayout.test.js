import assert from 'node:assert/strict';
import test from 'node:test';

const mockPublications = [
  {
    id: 'pulse/agent-portal',
    slug: 'agent-portal',
    kind: 'retrospective',
    status: 'published',
    relatedProjectIds: ['projects/agent-portal'],
    primaryProjectId: 'projects/agent-portal',
    locales: {
      en: { title: 'Agent Portal', summary: 'Summary of Agent Portal' }
    }
  },
  {
    id: 'pulse/two-project-update',
    slug: 'two-project-update',
    kind: 'retrospective',
    status: 'published',
    relatedProjectIds: ['projects/agent-portal', 'projects/project-graph-mcp'],
    primaryProjectId: 'projects/agent-portal',
    locales: {
      en: { title: 'Two Project Update', summary: 'Summary of Two Project Update' }
    }
  },
  {
    id: 'pulse/global-update',
    slug: 'global-update',
    kind: 'retrospective',
    status: 'published',
    relatedProjectIds: [],
    primaryProjectId: null,
    locales: {
      en: { title: 'Global Update', summary: 'Summary of Global Update' }
    }
  },
  {
    id: 'pulse/draft-update',
    slug: 'draft-update',
    kind: 'retrospective',
    status: 'draft',
    relatedProjectIds: [],
    primaryProjectId: null,
    locales: {
      en: { title: 'Draft Update', summary: 'Summary of Draft Update' }
    }
  },
  {
    id: 'pulse/scheduled-update',
    slug: 'scheduled-update',
    kind: 'update',
    status: 'scheduled',
    relatedProjectIds: ['projects/agent-portal'],
    primaryProjectId: 'projects/agent-portal',
    locales: {
      en: { title: 'Scheduled Update', summary: 'Summary of Scheduled Update' }
    }
  },
  {
    id: 'invalid-id-update',
    slug: 'invalid-id-update',
    kind: 'retrospective',
    status: 'published',
    relatedProjectIds: [],
    primaryProjectId: null,
    locales: {
      en: { title: 'Invalid ID Update', summary: 'Summary of Invalid ID Update' }
    }
  }
];

const layoutPublications = [
  ...mockPublications,
  {
    id: 'pulse/autobox-v1',
    slug: 'autobox-v1',
    kind: 'retrospective',
    status: 'published',
    relatedProjectIds: ['projects/autobox-v1'],
    primaryProjectId: 'projects/autobox-v1',
    locales: {
      en: { title: 'AUTOBOX v1', summary: 'Summary of AUTOBOX v1' }
    }
  },
];

import {
  PORTFOLIO_DEFAULT_STRUCTURED_LAYOUT,
  PORTFOLIO_STRUCTURED_LAYOUT_IDS,
  PORTFOLIO_STRUCTURED_LAYOUT_ROOT_ID,
} from '../../src/static-pages/data/portfolioLayoutConfig.js';
import { PORTFOLIO_MEDIA_CATALOG } from '../../src/static-pages/data/portfolioMediaCatalog.js';
import { PORTFOLIO_LOCALE_MESSAGES } from '../../src/static-pages/data/portfolioTranslations.js';
import {
  PORTFOLIO_STRUCTURED_LAYOUT_ACTIONS,
  createPortfolioStructuredLayoutMenuActions,
  createPortfolioStructuredLayoutOptions,
  createPortfolioStructuredMediaGroups,
  getPortfolioStructuredLayoutFromSearch,
  normalizePortfolioStructuredLayout,
  setPortfolioStructuredLayoutInUrl,
} from '../../src/static-pages/data/portfolioStructuredLayout.js';

const EXPECTED_MEDIA_COUNTS = Object.freeze({
  'projects/agent-portal': 1,
  'projects/autobox-v1': 9,
  'projects/boothbot': 1,
  'projects/complexscan': 2,
  'projects/megavisor': 4,
  'projects/photopizza': 6,
  'projects/symbiote-video-studio': 1,
  'pulse/autobox-v1': 1,
});

const PUBLICATION_MEDIA_DESCRIPTORS = Object.freeze([
  Object.freeze({
    id: 'media/global-update/youtube/global',
    targetIds: Object.freeze(['pulse/global-update']),
  }),
  Object.freeze({
    id: 'media/two-project-update/youtube/associated',
    targetIds: Object.freeze([
      'pulse/two-project-update',
      'projects/project-graph-mcp',
    ]),
  }),
  Object.freeze({
    id: 'media/agent-portal/youtube/project-first',
    targetIds: Object.freeze([
      'projects/agent-portal',
      'pulse/agent-portal',
    ]),
  }),
]);

test('structured layout policy has one stable root and exactly three arrangements', () => {
  assert.equal(PORTFOLIO_STRUCTURED_LAYOUT_ROOT_ID, 'profile/photo');
  assert.equal(PORTFOLIO_DEFAULT_STRUCTURED_LAYOUT, 'crystal');
  assert.deepEqual(PORTFOLIO_STRUCTURED_LAYOUT_IDS, ['crystal', 'auto', 'tree']);
  assert.deepEqual(
    PORTFOLIO_STRUCTURED_LAYOUT_ACTIONS.map((action) => action.id),
    ['graph-layout:crystal', 'graph-layout:auto', 'graph-layout:tree']
  );
  assert.equal(PORTFOLIO_STRUCTURED_LAYOUT_ACTIONS.length, 3);

  for (let layout of PORTFOLIO_STRUCTURED_LAYOUT_IDS) {
    assert.equal(normalizePortfolioStructuredLayout(layout), layout);
  }
  assert.equal(normalizePortfolioStructuredLayout('flow'), PORTFOLIO_DEFAULT_STRUCTURED_LAYOUT);
  assert.equal(normalizePortfolioStructuredLayout(''), PORTFOLIO_DEFAULT_STRUCTURED_LAYOUT);
});

test('every curated media descriptor belongs to exactly one owning article group', () => {
  let groups = createPortfolioStructuredMediaGroups(PORTFOLIO_MEDIA_CATALOG);
  let memberships = new Map();

  assert.equal(PORTFOLIO_MEDIA_CATALOG.length, 25);
  assert.deepEqual(
    Object.fromEntries(
      Object.entries(groups).map(([ownerId, nodeIds]) => [ownerId, nodeIds.length - 1])
    ),
    EXPECTED_MEDIA_COUNTS
  );

  for (let [ownerId, nodeIds] of Object.entries(groups)) {
    assert.equal(nodeIds[0], ownerId);
    for (let mediaId of nodeIds.slice(1)) {
      let owners = memberships.get(mediaId) || [];
      owners.push(ownerId);
      memberships.set(mediaId, owners);
    }
  }

  for (let descriptor of PORTFOLIO_MEDIA_CATALOG) {
    assert.deepEqual(memberships.get(descriptor.id), [descriptor.targetIds[0]]);
    assert.doesNotMatch(descriptor.id, /\/(?:cover|logo)(?:\/|$)/);
  }
  assert.equal(memberships.size, PORTFOLIO_MEDIA_CATALOG.length);
});

test('structured media ownership follows the first canonical article target', () => {
  let projectIds = ['projects/agent-portal', 'projects/project-graph-mcp'];
  let targetSnapshots = PUBLICATION_MEDIA_DESCRIPTORS.map((descriptor) => [
    descriptor.id,
    [...descriptor.targetIds],
  ]);
  let groups = createPortfolioStructuredMediaGroups(PUBLICATION_MEDIA_DESCRIPTORS, {
    projectIds,
    publications: mockPublications,
  });

  assert.deepEqual(groups, {
    'projects/agent-portal': [
      'projects/agent-portal',
      'media/agent-portal/youtube/project-first',
    ],
    'pulse/global-update': [
      'pulse/global-update',
      'media/global-update/youtube/global',
    ],
    'pulse/two-project-update': [
      'pulse/two-project-update',
      'media/two-project-update/youtube/associated',
    ],
  });
  assert.deepEqual(
    PUBLICATION_MEDIA_DESCRIPTORS.map((descriptor) => [descriptor.id, [...descriptor.targetIds]]),
    targetSnapshots,
  );
});

test('structured media ownership rejects invalid article targets and duplicate identities', () => {
  let options = {
    projectIds: ['projects/agent-portal'],
    publications: mockPublications,
  };
  let descriptor = (id, targetIds) => ({ id, targetIds });

  for (let [id, targetIds] of [
    ['media/unknown-project/image/item', ['projects/unknown']],
    ['media/unknown-publication/image/item', ['pulse/unknown']],
    ['media/draft/image/item', ['pulse/draft-update']],
    ['media/scheduled/image/item', ['pulse/scheduled-update']],
    ['media/nested/image/item', ['pulse/global-update/child']],
    ['media/index/image/item', ['pulse/index']],
    ['media/project-index/image/item', ['projects/index']],
  ]) {
    assert.throws(
      () => createPortfolioStructuredMediaGroups([descriptor(id, targetIds)], options),
      /invalid or unpublished target/,
    );
  }

  assert.throws(
    () => createPortfolioStructuredMediaGroups([
      descriptor('media/duplicate-target/image/item', [
        'projects/agent-portal',
        'projects/agent-portal',
      ]),
    ], options),
    /unique targetIds/,
  );
  assert.throws(
    () => createPortfolioStructuredMediaGroups([
      descriptor('media/duplicate/image/item', ['projects/agent-portal']),
      descriptor('media/duplicate/image/item', ['projects/agent-portal']),
    ], options),
    /descriptor id.*must be unique/,
  );
  assert.throws(
    () => createPortfolioStructuredMediaGroups([
      descriptor('media/agent-portal/image/cover', ['projects/agent-portal']),
    ], options),
    /cannot be a cover or logo/,
  );
  assert.throws(
    () => createPortfolioStructuredMediaGroups([
      descriptor('media/agent-portal/image/logo', ['projects/agent-portal']),
    ], options),
    /cannot be a cover or logo/,
  );
});

test('structured layout options retain article ownership for crystal and grouped auto', () => {
  let projectIds = Object.keys(EXPECTED_MEDIA_COUNTS)
    .filter((ownerId) => ownerId.startsWith('projects/'));
  let skillIds = ['skills/rnd', 'skills/product-ui'];
  let crystal = createPortfolioStructuredLayoutOptions({
    layout: 'crystal',
    projectIds,
    skillIds,
    descriptors: PORTFOLIO_MEDIA_CATALOG,
    publications: layoutPublications,
  });
  let auto = createPortfolioStructuredLayoutOptions({
    layout: 'auto',
    projectIds,
    skillIds,
    descriptors: PORTFOLIO_MEDIA_CATALOG,
    publications: layoutPublications,
  });
  let tree = createPortfolioStructuredLayoutOptions({
    layout: 'tree',
    projectIds,
    skillIds,
    descriptors: PORTFOLIO_MEDIA_CATALOG,
    publications: layoutPublications,
  });

  assert.equal(crystal.algorithm, 'crystal');
  assert.equal(crystal.rootNodeId, PORTFOLIO_STRUCTURED_LAYOUT_ROOT_ID);
  assert.deepEqual(
    Object.fromEntries(
      Object.entries(crystal.groups).map(([ownerId, nodeIds]) => [ownerId, nodeIds.length - 1])
    ),
    EXPECTED_MEDIA_COUNTS
  );

  assert.equal(auto.algorithm, 'auto');
  assert.equal(auto.groups.projects.filter((id) => id.startsWith('media/')).length, 25);
  assert.equal(new Set(auto.groups.projects).size, auto.groups.projects.length);
  assert.ok(auto.groups.projects.includes('pulse/agent-portal'));
  assert.ok(auto.groups.projects.includes('pulse/two-project-update'));
  let autoboxPublicationIndex = auto.groups.projects.indexOf('pulse/autobox-v1');
  assert.ok(autoboxPublicationIndex > auto.groups.projects.indexOf('projects/autobox-v1'));
  assert.equal(
    auto.groups.projects[autoboxPublicationIndex + 1],
    'media/autobox-v1/ims/spinner',
  );

  assert.ok(auto.groups.pulse.includes('pulse/index'));
  assert.ok(auto.groups.pulse.includes('pulse/global-update'), 'should include global publication in structured layout');
  assert.equal(auto.groups.pulse.includes('pulse/agent-portal'), false, 'should omit project retrospective publication from pulse auto group');
  assert.equal(auto.groups.pulse.includes('pulse/draft-update'), false, 'should omit draft publications from pulse auto group');
  assert.equal(auto.groups.pulse.includes('pulse/scheduled-update'), false, 'should omit non-published publications from pulse auto group');
  assert.equal(auto.groups.pulse.includes('invalid-id-update'), false, 'should omit invalid ID publications from pulse auto group');

  assert.equal(tree.algorithm, 'tree');
  assert.equal(Object.hasOwn(tree, 'groups'), false);
});

test('publication-owned media stays with its publication structural group', () => {
  let projectIds = ['projects/agent-portal', 'projects/project-graph-mcp'];
  let crystal = createPortfolioStructuredLayoutOptions({
    layout: 'crystal',
    projectIds,
    descriptors: PUBLICATION_MEDIA_DESCRIPTORS,
    publications: mockPublications,
  });
  let auto = createPortfolioStructuredLayoutOptions({
    layout: 'auto',
    projectIds,
    descriptors: PUBLICATION_MEDIA_DESCRIPTORS,
    publications: mockPublications,
  });

  assert.deepEqual(crystal.groups['pulse/global-update'], [
    'pulse/global-update',
    'media/global-update/youtube/global',
  ]);
  assert.deepEqual(crystal.groups['pulse/two-project-update'], [
    'pulse/two-project-update',
    'media/two-project-update/youtube/associated',
  ]);

  let associatedPublicationIndex = auto.groups.projects.indexOf('pulse/two-project-update');
  assert.ok(associatedPublicationIndex > auto.groups.projects.indexOf('projects/agent-portal'));
  assert.equal(
    auto.groups.projects[associatedPublicationIndex + 1],
    'media/two-project-update/youtube/associated',
  );
  let globalPublicationIndex = auto.groups.pulse.indexOf('pulse/global-update');
  assert.ok(globalPublicationIndex > auto.groups.pulse.indexOf('pulse/index'));
  assert.equal(
    auto.groups.pulse[globalPublicationIndex + 1],
    'media/global-update/youtube/global',
  );

  let allAutoNodes = Object.values(auto.groups).flat();
  for (let id of [
    'pulse/global-update',
    'media/global-update/youtube/global',
    'pulse/two-project-update',
    'media/two-project-update/youtube/associated',
  ]) {
    assert.equal(allAutoNodes.filter((nodeId) => nodeId === id).length, 1);
  }
  assert.equal(allAutoNodes.includes('pulse/draft-update'), false);
  assert.equal(allAutoNodes.includes('pulse/scheduled-update'), false);
});

test('structured layout URL state remains orthogonal to graph mode and path style', () => {
  let source = new URL(
    'https://example.test/projects/megavisor/?mode=media&path=bezier&layout=tree#media-node'
  );
  let autoUrl = setPortfolioStructuredLayoutInUrl(source, 'auto');
  let defaultUrl = setPortfolioStructuredLayoutInUrl(autoUrl, 'crystal');

  assert.equal(getPortfolioStructuredLayoutFromSearch(source.search), 'tree');
  assert.equal(getPortfolioStructuredLayoutFromSearch('?layout=flow'), 'crystal');
  assert.equal(autoUrl.searchParams.get('layout'), 'auto');
  assert.equal(autoUrl.searchParams.get('mode'), 'media');
  assert.equal(autoUrl.searchParams.get('path'), 'bezier');
  assert.equal(autoUrl.hash, '#media-node');
  assert.equal(defaultUrl.searchParams.has('layout'), false);
  assert.equal(defaultUrl.searchParams.get('mode'), 'media');
  assert.equal(defaultUrl.searchParams.get('path'), 'bezier');
});

test('structured layout menu exposes localized labels and accessible titles', () => {
  for (let locale of ['en', 'ru', 'es']) {
    let translate = (key) => PORTFOLIO_LOCALE_MESSAGES[locale][`portfolio.${key}`];
    let actions = createPortfolioStructuredLayoutMenuActions({
      layout: 'auto',
      translate,
    });

    assert.equal(actions.length, 3);
    assert.equal(actions.filter((action) => action.active).length, 1);
    assert.equal(actions.find((action) => action.active)?.id, 'graph-layout:auto');
    for (let action of actions) {
      assert.equal(action.group, 'graph-layout');
      assert.ok(action.groupLabel);
      assert.ok(action.label);
      assert.ok(action.title);
      assert.doesNotMatch(action.id, /^layout:/);
    }
  }
});
