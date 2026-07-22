import assert from 'node:assert/strict';
import test from 'node:test';

import {
  classifyPortfolioRelation,
  createPortfolioRelationEdge,
  createPortfolioRelationPlan,
} from '../../src/static-pages/data/portfolioRelationClassifier.js';

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
    relatedProjectIds: ['projects/agent-portal'],
    primaryProjectId: 'projects/agent-portal',
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
    relatedProjectIds: ['projects/agent-portal'],
    primaryProjectId: 'projects/agent-portal',
    locales: {
      en: { title: 'Invalid ID Update', summary: 'Summary of Invalid ID Update' }
    }
  }
];

const PROJECT = Object.freeze({
  projectId: 'projects/agent-portal',
  skillIds: ['skills/agentic-ai'],
  mediaIds: ['media/agent-portal/ims/gallery'],
});

test('relation classifier limits flow markers to article-owned directed content', () => {
  const media = classifyPortfolioRelation(PROJECT.projectId, PROJECT.mediaIds[0], 'gallery');
  const note = classifyPortfolioRelation(PROJECT.projectId, 'pulse/agent-portal', 'pulse');
  const publicationMedia = classifyPortfolioRelation(
    'pulse/agent-portal',
    PROJECT.mediaIds[0],
    'has-media',
  );
  const containment = classifyPortfolioRelation('projects/index', PROJECT.projectId, 'project');
  const association = classifyPortfolioRelation(PROJECT.skillIds[0], PROJECT.projectId, 'uses');

  assert.deepEqual(media, { kind: 'has-media', direction: 'forward', markerRole: 'flow' });
  assert.deepEqual(note, { kind: 'has-publication', direction: 'forward', markerRole: 'flow' });
  assert.deepEqual(publicationMedia, { kind: 'has-media', direction: 'forward', markerRole: 'flow' });
  assert.deepEqual(containment, { kind: 'containment', direction: 'none', markerRole: 'none' });
  assert.deepEqual(association, { kind: 'uses', direction: 'none', markerRole: 'none' });
});

test('relation classifier normalizes media formats and unknown legacy kinds', () => {
  for (const kind of ['gallery', 'image', 'pdf', 'spinner', 'video', 'vimeo', 'youtube']) {
    const semantic = classifyPortfolioRelation(PROJECT.projectId, PROJECT.mediaIds[0], kind);
    assert.deepEqual(semantic, { kind: 'has-media', direction: 'forward', markerRole: 'flow' });
  }

  assert.deepEqual(
    classifyPortfolioRelation('external/source', 'external/target', 'youtube'),
    { kind: 'link', direction: 'none', markerRole: 'none' },
  );
});

test('relation edge exposes the graph provider marker contract', () => {
  assert.deepEqual(createPortfolioRelationEdge(PROJECT.projectId, 'pulse/agent-portal', 'pulse'), {
    from: PROJECT.projectId,
    to: 'pulse/agent-portal',
    type: 'has-publication',
    kind: 'has-publication',
    direction: 'forward',
    design: { marker: { role: 'flow' } },
  });
});

test('flat relation plan contains directed flows for publications and no gates', () => {
  const edges = createPortfolioRelationPlan({
    mode: 'flat',
    skillIds: PROJECT.skillIds,
    projects: [PROJECT],
    publications: mockPublications,
  });
  const flowEdges = edges.filter((edge) => edge.design.marker.role === 'flow');

  const expectedFlows = [
    {
      from: PROJECT.projectId,
      to: 'pulse/agent-portal',
      kind: 'has-publication',
    },
    {
      from: PROJECT.projectId,
      to: 'pulse/two-project-update',
      kind: 'has-publication',
    }
  ];

  assert.deepEqual(flowEdges.map(({ from, to, kind }) => ({ from, to, kind })), expectedFlows);
  assert.equal(edges.some((edge) => edge.design.marker.role === 'gate'), false);
  assert.equal(edges.every((edge) => edge.design.marker.role !== 'flow' || edge.direction === 'forward'), true);

  const globalContainment = edges.filter((edge) => (
    edge.from === 'group/pulse'
    && edge.to === 'pulse/global-update'
    && edge.kind === 'containment'
  ));
  assert.equal(globalContainment.length, 1);
  assert.equal(
    edges.some((edge) => edge.kind === 'containment' && edge.to === 'pulse/agent-portal'),
    false,
  );
  assert.equal(
    edges.some((edge) => edge.kind === 'containment' && edge.to === 'pulse/two-project-update'),
    false,
  );
});

test('relation classifier preserves unrelated project relation kinds without inferring publications', () => {
  for (const kind of ['bio', 'containment', 'has-media', 'link', 'skill', 'uses']) {
    assert.deepEqual(
      classifyPortfolioRelation('projects/agent-portal', 'projects/f360-studio', kind),
      { kind, direction: 'none', markerRole: 'none' },
    );
  }

  assert.deepEqual(
    classifyPortfolioRelation('projects/agent-portal', 'projects/f360-studio', 'has-publication'),
    { kind: 'link', direction: 'none', markerRole: 'none' },
  );
  assert.deepEqual(
    classifyPortfolioRelation('projects/agent-portal', 'projects/f360-studio', 'pulse'),
    { kind: 'link', direction: 'none', markerRole: 'none' },
  );
});

test('structured relation plan links each media node to its article, supports global updates and has-publication', () => {
  const edges = createPortfolioRelationPlan({
    mode: 'structured',
    skillIds: PROJECT.skillIds,
    projects: [PROJECT],
    publications: mockPublications,
  });
  const mediaEdge = edges.find((edge) => edge.to === PROJECT.mediaIds[0]);
  const noteEdge = edges.find((edge) => edge.to === 'pulse/agent-portal' && edge.from === PROJECT.projectId);

  assert.deepEqual(mediaEdge, createPortfolioRelationEdge(PROJECT.projectId, PROJECT.mediaIds[0], 'media'));
  assert.deepEqual(noteEdge, createPortfolioRelationEdge(PROJECT.projectId, 'pulse/agent-portal', 'pulse'));
  assert.equal(edges.some((edge) => edge.design.marker.role === 'gate'), false);
  assert.equal(new Set(edges.map((edge) => `${edge.from}\u001f${edge.to}`)).size, edges.length);

  const p2p = classifyPortfolioRelation('projects/agent-portal', 'projects/f360-studio', 'pulse');
  assert.deepEqual(p2p, { kind: 'link', direction: 'none', markerRole: 'none' });

  const hasPub = classifyPortfolioRelation(PROJECT.projectId, 'pulse/agent-portal', 'has-publication');
  assert.deepEqual(hasPub, { kind: 'has-publication', direction: 'forward', markerRole: 'flow' });

  const globalEdge = edges.find((edge) => edge.from === 'pulse/index' && edge.to === 'pulse/global-update');
  assert.ok(globalEdge, 'should have a containment edge for global-update from pulse/index');
  assert.equal(globalEdge.kind, 'containment');

  const containmentEdge = edges.find((edge) => edge.from === 'pulse/index' && edge.to === 'pulse/agent-portal');
  assert.equal(containmentEdge, undefined, 'associated publication should not get containment edge from pulse/index');

  const draftEdge = edges.find((edge) => edge.to === 'pulse/draft-update');
  assert.equal(draftEdge, undefined, 'draft publications should be omitted');
  const scheduledEdge = edges.find((edge) => edge.to === 'pulse/scheduled-update');
  assert.equal(scheduledEdge, undefined, 'non-published publications should be omitted');
  const invalidIdEdge = edges.find((edge) => edge.to === 'invalid-id-update');
  assert.equal(invalidIdEdge, undefined, 'publications with invalid IDs should be omitted');
});
