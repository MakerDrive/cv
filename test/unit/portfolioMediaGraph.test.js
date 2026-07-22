import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
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
    id: 'pulse/no-media-update',
    slug: 'no-media-update',
    kind: 'update',
    status: 'published',
    relatedProjectIds: ['projects/no-media'],
    primaryProjectId: 'projects/no-media',
    locales: {
      en: { title: 'No Media Update', summary: 'Summary of No Media Update' }
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

import { PORTFOLIO_MEDIA_CATALOG } from '../../src/static-pages/data/portfolioMediaCatalog.js';
import { getPublicPublications } from '../../src/static-pages/data/publications.js';
import {
  createPortfolioMediaGraphModel,
  createPortfolioMediaLeafNode,
  getProjectMediaDescriptors,
} from '../../src/static-pages/data/portfolioMediaGraph.js';

const WEIGHTS = Object.freeze({
  image: 1.6,
  pulse: 1.35,
  profile: 1.8,
});

const EXPECTED_CATALOG_IDS = Object.freeze({
  megavisor: Object.freeze([
    'media/megavisor/youtube/c3cCmDqO04c',
    'media/megavisor/youtube/f1cB4X1wI50',
    'media/megavisor/youtube/cFPJqtcWNSU',
    'media/megavisor/youtube/6CpdVcjtZoU',
  ]),
  photopizza: Object.freeze([
    'media/photopizza/youtube/2lO2VsZFAz0',
    'media/photopizza/youtube/6CpdVcjtZoU',
    'media/photopizza/youtube/f1cB4X1wI50',
    'media/photopizza/youtube/cFPJqtcWNSU',
    'media/photopizza/youtube/HeLMIjuMZac',
    'media/photopizza/ims/spinner',
  ]),
  complexscan: Object.freeze([
    'media/complexscan/youtube/MHfWHxVSgn4',
    'media/complexscan/youtube/PFPoitVEWcE',
  ]),
  'autobox-v1': Object.freeze([
    'media/autobox-v1/ims/spinner',
    'media/autobox-v1/youtube/IPEY0yiVb-I',
    'media/autobox-v1/youtube/NWpMtNZjrzI',
    'media/autobox-v1/youtube/8XsSHyQFtV8',
    'media/autobox-v1/youtube/zb47xAYQBcE',
    'media/autobox-v1/youtube/us3vQHuTYPw',
    'media/autobox-v1/youtube/FugBzpZqXZ0',
    'media/autobox-v1/youtube/iNqxRJgrqM8',
    'media/autobox-v1/youtube/M0cHqy3cScc',
    'media/autobox-v1/youtube/o4XzMKW8a2E',
  ]),
  'agent-portal': Object.freeze(['media/agent-portal/ims/gallery']),
  boothbot: Object.freeze(['media/boothbot/ims/gallery']),
  'symbiote-video-studio': Object.freeze(['media/symbiote-video-studio/image/interface']),
});

function createBaseModel(slug = 'demo') {
  return {
    version: 'graph-model-v1',
    nodes: [
      { id: `projects/${slug}`, label: 'Demo', params: {} },
      { id: `pulse/${slug}`, label: 'Demo article', params: {} },
    ],
    edges: [],
    groups: [],
    rootNodes: [],
  };
}

test('project media descriptors ignore prose links and stay locale-invariant', () => {
  let catalog = [
    {
      id: 'media/demo/youtube/abcdefghijk',
      kind: 'youtube',
      label: 'Demo overview',
      poster: 'https://img.youtube.com/vi/abcdefghijk/hqdefault.jpg',
      alt: 'Demo overview',
      fit: 'cover',
      href: 'https://www.youtube.com/watch?v=abcdefghijk',
      targetIds: ['projects/demo'],
      activation: { provider: 'youtube', videoId: 'abcdefghijk' },
    },
  ];
  let base = {
    slug: 'demo',
    title: 'Demo',
    image: 'https://example.com/cover.webp',
    href: 'https://example.com/demo',
  };
  let withLinks = {
    ...base,
    links: [{ label: 'Video', href: 'https://www.youtube.com/watch?v=zzzzzzzzzzz' }],
    details: '[Another video](https://www.youtube.com/watch?v=yyyyyyyyyyy)',
  };
  let withoutLinks = { ...base, links: [], details: '' };

  let itemsWith = getProjectMediaDescriptors(withLinks, catalog);
  let itemsWithout = getProjectMediaDescriptors(withoutLinks, catalog);

  assert.deepEqual(
    itemsWith.map((item) => item.id),
    ['media/demo/youtube/abcdefghijk']
  );
  assert.deepEqual(
    itemsWith.map((item) => item.id),
    itemsWithout.map((item) => item.id)
  );
  assert.ok(itemsWith.every((item) => item.activation.provider !== 'youtube'
    || item.activation.videoId === 'abcdefghijk'));
});

test('catalog contains the exact curated publication media for every audited project', () => {
  let idsBySlug = Object.fromEntries(Object.keys(EXPECTED_CATALOG_IDS).map((slug) => [slug, []]));
  for (let item of PORTFOLIO_MEDIA_CATALOG) {
    let slug = item.targetIds
      ?.find((targetId) => targetId.startsWith('projects/'))
      ?.replace(/^projects\//, '');
    assert.ok(Object.hasOwn(idsBySlug, slug), `unexpected catalog target: ${slug}`);
    idsBySlug[slug].push(item.id);
  }

  assert.deepEqual(idsBySlug, EXPECTED_CATALOG_IDS);
  let catalogText = PORTFOLIO_MEDIA_CATALOG.map((item) => item.id).join('\n');
  for (let excluded of [
    'ySBWZPHZqsw',
    '492LvEkyhbg',
    't1xKxyPIY3I',
    '8qdqL6bmxAY',
    '1p85AtUFtiI',
    'b96RgkYhu2k',
    'ocshAWL1mxE',
    'NUiDC-XoRbE',
    'b0DFDyXdZOY',
    'xJxLpNYibgI',
    '/cit/gallery',
    '/cit/pano',
  ]) {
    assert.doesNotMatch(catalogText, new RegExp(excluded.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  }
});

test('catalog includes media owned by a canonical published Pulse article', () => {
  let publishedPublicationIds = new Set(
    getPublicPublications().map((publication) => publication.id)
  );
  let publicationTargets = PORTFOLIO_MEDIA_CATALOG.flatMap((item) => (
    item.targetIds
      .filter((targetId) => targetId.startsWith('pulse/'))
      .map((targetId) => ({ mediaId: item.id, targetId }))
  ));

  assert.ok(publicationTargets.length > 0);
  assert.ok(publicationTargets.every(({ targetId }) => publishedPublicationIds.has(targetId)));
  assert.deepEqual(publicationTargets, [{
    mediaId: 'media/autobox-v1/ims/spinner',
    targetId: 'pulse/autobox-v1',
  }]);
  assert.deepEqual(
    PORTFOLIO_MEDIA_CATALOG.find((item) => item.id === publicationTargets[0].mediaId)?.targetIds,
    ['pulse/autobox-v1', 'projects/autobox-v1'],
  );
});

test('media graph contains every canonical published publication without requiring project media', () => {
  let project = {
    slug: 'no-media',
    title: 'No Media',
    image: 'https://example.com/cover.webp',
    href: 'https://example.com/no-media',
    links: [],
    details: '',
  };
  let publications = mockPublications.filter((publication) => new Set([
    'pulse/global-update',
    'pulse/no-media-update',
    'pulse/draft-update',
    'pulse/scheduled-update',
    'invalid-id-update',
  ]).has(publication.id));
  let model = createPortfolioMediaGraphModel({
    baseModel: {
      ...createBaseModel(),
      nodes: [{ id: 'projects/no-media', label: 'No Media', params: {} }],
    },
    projects: [project],
    catalog: [],
    weights: WEIGHTS,
    publications,
  });

  assert.deepEqual(
    model.edges.map(({ from, to, kind, direction }) => ({ from, to, kind, direction })),
    [
      {
        from: 'pulse/index',
        to: 'pulse/global-update',
        kind: 'containment',
        direction: 'none',
      },
      {
        from: 'projects/no-media',
        to: 'pulse/no-media-update',
        kind: 'has-publication',
        direction: 'forward',
      },
    ]
  );
  assert.deepEqual(
    model.nodes.map((node) => node.id).sort(),
    [
      'projects/no-media',
      'pulse/global-update',
      'pulse/index',
      'pulse/no-media-update',
    ]
  );
  for (let publicationId of [
    'pulse/global-update',
    'pulse/no-media-update',
  ]) {
    assert.equal(model.nodes.filter((node) => node.id === publicationId).length, 1);
  }
  assert.equal(model.edges.filter((edge) => edge.to === 'pulse/global-update').length, 1);
  assert.equal(model.edges.some((edge) => (
    edge.from === 'pulse/index' && edge.to === 'pulse/no-media-update'
  )), false);
  assert.equal(model.nodes.some((node) => node.id === 'pulse/draft-update'), false);
  assert.equal(model.nodes.some((node) => node.id === 'pulse/scheduled-update'), false);
  assert.equal(model.nodes.some((node) => node.id === 'invalid-id-update'), false);
});

test('media graph keeps publication targets explicit and rejects draft or unknown targets', () => {
  let projects = [
    { slug: 'agent-portal', title: 'Agent Portal', links: [], details: '' },
    { slug: 'project-graph-mcp', title: 'Project Graph MCP', links: [], details: '' },
  ];
  let catalog = [
    {
      id: 'media/agent-portal/ims/gallery',
      kind: 'gallery',
      label: 'Agent Portal gallery',
      poster: 'https://example.com/poster.jpg',
      targetIds: ['projects/agent-portal'],
      activation: { provider: 'ims', srcData: 'https://example.com' },
    },
    {
      id: 'media/project-graph-mcp/youtube/123',
      kind: 'youtube',
      label: 'Project Graph video',
      poster: 'https://example.com/video.jpg',
      targetIds: [
        'pulse/two-project-update',
        'projects/project-graph-mcp',
        'pulse/draft-update',
        'pulse/missing-update',
      ],
      activation: { provider: 'youtube', videoId: '123' },
    },
    {
      id: 'media/pulse/global-update/image/diagram',
      kind: 'image',
      label: 'Global update diagram',
      poster: 'https://example.com/global-update.png',
      targetIds: [
        'pulse/global-update',
        'pulse/draft-update',
        'pulse/missing-update',
      ],
      activation: { provider: 'image', src: 'https://example.com/global-update.png' },
    },
  ];
  let nodes = projects.flatMap((p) => [
    { id: `projects/${p.slug}`, label: p.title, params: {} },
  ]);
  let model = createPortfolioMediaGraphModel({
    baseModel: { ...createBaseModel(), nodes },
    projects,
    catalog,
    weights: WEIGHTS,
    publications: mockPublications,
  });

  const publishedIds = mockPublications
    .filter((publication) => publication.status === 'published')
    .filter((publication) => publication.id === `pulse/${publication.slug}`)
    .map((publication) => publication.id);
  for (let publicationId of publishedIds) {
    assert.equal(model.nodes.filter((node) => node.id === publicationId).length, 1);
  }

  const twoProjectPubNode = model.nodes.find((node) => node.id === 'pulse/two-project-update');
  assert.ok(twoProjectPubNode, 'two-project-update node should exist');

  const edgesToTwoProjectPub = model.edges.filter((edge) => edge.to === 'pulse/two-project-update');
  assert.equal(edgesToTwoProjectPub.length, 2);
  const sources = edgesToTwoProjectPub.map((edge) => edge.from).sort();
  assert.deepEqual(sources, ['projects/agent-portal', 'projects/project-graph-mcp']);
  assert.ok(edgesToTwoProjectPub.every((edge) => edge.kind === 'has-publication'));

  const globalEdge = model.edges.find((edge) => (
    edge.from === 'pulse/index' && edge.to === 'pulse/global-update'
  ));
  assert.ok(globalEdge, 'global-update should have a containment edge from pulse/index');
  assert.equal(globalEdge.kind, 'containment');

  const galleryLeaf = model.nodes.find((n) => n.id === 'media/agent-portal/ims/gallery');
  assert.deepEqual(galleryLeaf.params.targetIds, ['projects/agent-portal']);
  assert.equal(model.edges.some((edge) => (
    edge.to === galleryLeaf.id && edge.from.startsWith('pulse/')
  )), false);

  const videoLeaf = model.nodes.find((node) => (
    node.id === 'media/project-graph-mcp/youtube/123'
  ));
  assert.deepEqual(videoLeaf.params.targetIds, [
    'pulse/two-project-update',
    'projects/project-graph-mcp',
  ]);
  assert.equal(videoLeaf.targetId, 'pulse/two-project-update');
  assert.equal(videoLeaf.params.targetId, 'pulse/two-project-update');
  const explicitPublicationEdge = model.edges.find((edge) => (
    edge.from === 'pulse/two-project-update' && edge.to === videoLeaf.id
  ));
  assert.equal(explicitPublicationEdge?.kind, 'has-media');
  assert.equal(explicitPublicationEdge?.direction, 'forward');
  assert.equal(explicitPublicationEdge?.design.marker.role, 'flow');
  assert.equal(model.edges.some((edge) => (
    ['pulse/draft-update', 'pulse/missing-update'].includes(edge.from)
    && edge.to === videoLeaf.id
  )), false);

  const publicationOnlyLeaf = model.nodes.find((node) => (
    node.id === 'media/pulse/global-update/image/diagram'
  ));
  assert.equal(publicationOnlyLeaf.targetId, 'pulse/global-update');
  assert.equal(publicationOnlyLeaf.params.targetId, 'pulse/global-update');
  assert.deepEqual(publicationOnlyLeaf.params.targetIds, ['pulse/global-update']);
  assert.equal(publicationOnlyLeaf.params.mediaParentId, '');
  assert.equal(model.groups.some((group) => group.nodeIds.includes(publicationOnlyLeaf.id)), false);
  const publicationOnlyEdge = model.edges.find((edge) => (
    edge.from === 'pulse/global-update' && edge.to === publicationOnlyLeaf.id
  ));
  assert.equal(publicationOnlyEdge?.kind, 'has-media');
  assert.equal(publicationOnlyEdge?.direction, 'forward');
  assert.equal(publicationOnlyEdge?.design.marker.role, 'flow');

  assert.equal(model.nodes.some((node) => node.id === 'pulse/draft-update'), false);
  assert.equal(model.nodes.some((node) => node.id === 'pulse/scheduled-update'), false);
  assert.equal(model.nodes.some((node) => node.id === 'invalid-id-update'), false);
  assert.equal(new Set(model.nodes.map((node) => node.id)).size, model.nodes.length);
  assert.equal(
    new Set(model.edges.map((edge) => `${edge.from}\u001f${edge.to}`)).size,
    model.edges.length
  );
});

test('media graph keeps project-scoped nodes when projects share a catalog video', () => {
  let videoId = 'abcdefghijk';
  let catalog = ['first', 'second'].map((slug) => ({
    id: `media/${slug}/youtube/${videoId}`,
    kind: 'youtube',
    label: `${slug} video`,
    poster: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
    alt: `${slug} video`,
    fit: 'cover',
    href: `https://www.youtube.com/watch?v=${videoId}`,
    targetIds: [`projects/${slug}`],
    activation: { provider: 'youtube', videoId },
  }));
  let projects = ['first', 'second'].map((slug) => ({ slug, title: slug, links: [], details: '' }));
  let nodes = projects.flatMap((project) => [
    { id: `projects/${project.slug}`, label: project.title, params: {} },
    { id: `pulse/${project.slug}`, label: `${project.title} article`, params: {} },
  ]);
  let model = createPortfolioMediaGraphModel({
    baseModel: { ...createBaseModel(), nodes },
    projects,
    catalog,
    weights: WEIGHTS,
    publications: mockPublications,
  });

  for (let project of projects) {
    let mediaId = `media/${project.slug}/youtube/${videoId}`;
    assert.ok(model.nodes.some((node) => node.id === mediaId));
    let edge = model.edges.find((edge) => (
      edge.from === `projects/${project.slug}` && edge.to === mediaId
    ));
    assert.deepEqual(edge, {
      from: `projects/${project.slug}`,
      to: mediaId,
      type: 'has-media',
      kind: 'has-media',
      direction: 'forward',
      design: { marker: { role: 'flow' } },
    });
  }
});

test('catalog IMS items use remote srcData with an rnd-pro poster and no inline data', () => {
  let imsItems = PORTFOLIO_MEDIA_CATALOG.filter((item) => item.kind === 'spinner' || item.kind === 'gallery');

  assert.ok(imsItems.length > 0);
  assert.ok(imsItems.every((item) => new Set(['spinner', 'gallery']).has(item.kind)));
  for (let item of imsItems) {
    assert.equal(item.activation.provider, 'ims');
    assert.equal(typeof item.activation.srcData, 'string');
    assert.match(item.activation.srcData, /^https:\/\//);
    assert.equal(item.activation.data, undefined);
    assert.ok(item.poster.startsWith('https://rnd-pro.com/idn/'));
  }
});

test('only the AUTOBOX spinner opts in to autoplay', () => {
  let autoplayIds = PORTFOLIO_MEDIA_CATALOG
    .filter((item) => item.activation?.autoplay === true)
    .map((item) => item.id);

  assert.deepEqual(autoplayIds, ['media/autobox-v1/ims/spinner']);
});

test('one AUTOBOX IMS node keeps publication ownership and both explicit article relations', () => {
  let nodes = ['projects/autobox-v1', 'pulse/autobox-v1']
    .map((id) => ({ id, label: id, params: {} }));
  let projects = [
    { slug: 'autobox-v1', title: 'AUTOBOX', links: [], details: '' },
  ];
  let model = createPortfolioMediaGraphModel({
    baseModel: { ...createBaseModel(), nodes },
    projects,
    catalog: PORTFOLIO_MEDIA_CATALOG,
    weights: WEIGHTS,
    publications: [{
      id: 'pulse/autobox-v1',
      slug: 'autobox-v1',
      status: 'published',
      relatedProjectIds: ['projects/autobox-v1'],
      primaryProjectId: 'projects/autobox-v1',
      locales: { en: { title: 'AUTOBOX v1', summary: 'Summary' } },
    }],
  });
  let spinner = model.nodes.find((node) => node.id === 'media/autobox-v1/ims/spinner');
  let spinnerEdges = model.edges.filter((edge) => edge.to === 'media/autobox-v1/ims/spinner');

  assert.equal(spinner.targetId, 'pulse/autobox-v1');
  assert.deepEqual(spinner.params.targetIds, ['pulse/autobox-v1', 'projects/autobox-v1']);
  assert.deepEqual(
    new Set(spinnerEdges.map((edge) => edge.from)),
    new Set(['pulse/autobox-v1', 'projects/autobox-v1'])
  );
  assert.ok(spinnerEdges.every((edge) => edge.kind === 'has-media'));
  assert.ok(spinnerEdges.every((edge) => edge.direction === 'forward'));
  assert.ok(spinnerEdges.every((edge) => edge.design.marker.role === 'flow'));
});

test('catalog node ids are never derived from prose links', () => {
  let idRe = /^media\/[a-z0-9-]+\/(youtube\/[\w-]+|ims\/(spinner|gallery)|image\/[a-z0-9-]+)$/;
  for (let item of PORTFOLIO_MEDIA_CATALOG) {
    assert.match(item.id, idRe);
    for (let targetId of item.targetIds) {
      assert.match(targetId, /^(?:projects|pulse)\/[a-z0-9-]+$/);
    }
  }
});

test('portfolio keeps graph media poster-only and mounts players in article content', async () => {
  let source = await readFile(new URL('../../src/static-pages/js/index.js', import.meta.url), 'utf8');
  let mediaGraphSource = source.slice(
    source.indexOf('class PortfolioMediaCanvasGraph'),
    source.indexOf('class PortfolioGraphPanel'),
  );

  assert.match(source, /registerMediaProvider\('ims', createPortfolioImsMediaAdapter\(\)\);/);
  assert.match(source, /let media = getMediaGraphDescriptor\(mediaGraph, path\);/);
  assert.match(source, /selectMediaNode\(path, mediaGraph\)/);
  assert.match(source, /renderContentSlots/);
  assert.match(source, /createElement\('sn-media-host'\)/);
  assert.doesNotMatch(source, /showMediaPreview|closeMediaPreview/);
  assert.doesNotMatch(source, /measureNodePlaqueAnchor|addPostSceneRenderer/);
  assert.doesNotMatch(mediaGraphSource, /_buildInfoLines|_measureInfoPanelLayout|_drawInfoPanel/);
  assert.doesNotMatch(mediaGraphSource, /document\.createElement\('canvas'\)/);
});

function createLeafDescriptor(overrides = {}) {
  return {
    id: 'media/demo/youtube/abcdefghijk',
    kind: 'youtube',
    label: 'Demo overview',
    poster: 'https://img.youtube.com/vi/abcdefghijk/hqdefault.jpg',
    alt: 'Demo alt text',
    fit: 'cover',
    href: 'https://www.youtube.com/watch?v=abcdefghijk',
    source: 'youtube',
    rank: 90,
    targetIds: ['projects/demo'],
    activation: { provider: 'youtube', videoId: 'abcdefghijk' },
    ...overrides,
  };
}

test('createPortfolioMediaLeafNode media satisfies the graph-node media descriptor contract', () => {
  let node = createPortfolioMediaLeafNode(createLeafDescriptor(), { parentId: 'projects/demo' });

  assert.equal(typeof node.params.media.kind, 'string');
  assert.ok(node.params.media.kind.length > 0);
  assert.equal(typeof node.params.media.activation.provider, 'string');
  assert.ok(node.params.media.activation.provider.length > 0);
});

test('createPortfolioMediaLeafNode maps descriptor fields onto the structured leaf node', () => {
  let descriptor = createLeafDescriptor();
  let node = createPortfolioMediaLeafNode(descriptor, { parentId: 'projects/demo' });

  assert.equal(node.id, descriptor.id);
  assert.equal(node.label, descriptor.label);
  assert.equal(node.type, 'asset');
  assert.equal(node.summary, descriptor.alt);
  assert.equal(node.targetId, 'projects/demo');
  assert.equal(node.params.targetId, 'projects/demo');
  assert.deepEqual(node.params.targetIds, descriptor.targetIds);
  assert.equal(node.params.mediaParentId, 'projects/demo');
  assert.equal(node.params.href, descriptor.href);
  assert.equal(node.params.mediaKind, descriptor.kind);
  assert.equal(node.params.mediaSource, descriptor.source);
  assert.equal(node.params.mediaFit, descriptor.fit);
});

test('createPortfolioMediaLeafNode falls back to label and empty defaults for sparse descriptors', () => {
  let descriptor = createLeafDescriptor({ alt: '', href: '', targetIds: [] });
  let node = createPortfolioMediaLeafNode(descriptor);

  assert.equal(node.summary, descriptor.label);
  assert.equal(node.targetId, '');
  assert.equal(node.params.targetId, '');
  assert.deepEqual(node.params.targetIds, []);
  assert.equal(node.params.href, '');
  assert.equal(node.params.mediaParentId, '');
});

test('structured leaf nodes reuse the explicit catalog membership exactly with no cover or logo', () => {
  for (let slug of Object.keys(EXPECTED_CATALOG_IDS)) {
    let descriptors = getProjectMediaDescriptors({ slug }, PORTFOLIO_MEDIA_CATALOG);
    let leafIds = descriptors.map((descriptor) => (
      createPortfolioMediaLeafNode(descriptor, { parentId: `projects/${slug}` }).id
    ));

    assert.deepEqual(leafIds, descriptors.map((descriptor) => descriptor.id));
    assert.deepEqual(new Set(leafIds), new Set(EXPECTED_CATALOG_IDS[slug]));
    for (let id of leafIds) {
      assert.doesNotMatch(id, /\/(cover|logo)$/);
    }
  }
});

test('structured leaf node ids stay locale-invariant because descriptors are catalog-derived', () => {
  for (let slug of Object.keys(EXPECTED_CATALOG_IDS)) {
    let ru = {
      slug,
      title: 'Проект',
      links: [{ label: 'Видео', href: 'https://www.youtube.com/watch?v=zzzzzzzzzzz' }],
      details: 'Смотрите демонстрацию [здесь](https://www.youtube.com/watch?v=yyyyyyyyyyy)',
    };
    let en = { slug, title: 'Project', links: [], details: 'Watch the demo.' };
    let leafIds = (project) => getProjectMediaDescriptors(project, PORTFOLIO_MEDIA_CATALOG)
      .map((descriptor) => createPortfolioMediaLeafNode(descriptor, { parentId: `projects/${slug}` }).id);

    assert.deepEqual(leafIds(ru), leafIds(en));
  }
});

test('createPortfolioMediaGraphModel builds media leaf nodes from the shared helper', () => {
  let videoId = 'abcdefghijk';
  let catalog = [{
    id: `media/demo/youtube/${videoId}`,
    kind: 'youtube',
    label: 'Demo overview',
    poster: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
    alt: 'Demo overview',
    fit: 'cover',
    href: `https://www.youtube.com/watch?v=${videoId}`,
    targetIds: ['projects/demo'],
    activation: { provider: 'youtube', videoId },
  }];
  let projects = [{ slug: 'demo', title: 'Demo', links: [], details: '' }];
  let model = createPortfolioMediaGraphModel({
    baseModel: createBaseModel(),
    projects,
    catalog,
    weights: WEIGHTS,
    publications: mockPublications,
  });
  let descriptor = getProjectMediaDescriptors(projects[0], catalog)[0];
  let expected = createPortfolioMediaLeafNode(descriptor, { parentId: 'projects/demo' });
  let mediaNode = model.nodes.find((node) => node.id === descriptor.id);

  assert.deepEqual(mediaNode, { ...expected, weight: WEIGHTS.image });
});

test('media graph deduplicates edge pairs', () => {
  let projects = [{ slug: 'agent-portal', title: 'Agent Portal', links: [], details: '' }];
  let catalog = [{
    id: 'media/agent-portal/ims/gallery',
    kind: 'gallery',
    label: 'Agent Portal gallery',
    poster: 'https://example.com/poster.jpg',
    targetIds: ['projects/agent-portal'],
    activation: { provider: 'ims', srcData: 'https://example.com' },
  }];
  let baseModel = {
    version: 'graph-model-v1',
    nodes: [
      { id: 'projects/agent-portal', label: 'Agent Portal', params: {} },
      { id: 'pulse/agent-portal', label: 'Agent Portal article', params: {} }
    ],
    edges: [
      { from: 'projects/agent-portal', to: 'pulse/agent-portal', kind: 'has-publication' }
    ],
    groups: [],
    rootNodes: []
  };
  let model = createPortfolioMediaGraphModel({
    baseModel,
    projects,
    catalog,
    weights: WEIGHTS,
    publications: mockPublications
  });

  const relevantEdges = model.edges.filter(e => e.from === 'projects/agent-portal' && e.to === 'pulse/agent-portal');
  assert.equal(relevantEdges.length, 1, 'duplicate edges should be deduplicated');
  assert.equal(relevantEdges[0].kind, 'has-publication');
  assert.equal(relevantEdges[0].direction, 'forward');
  assert.equal(relevantEdges[0].design.marker.role, 'flow');
});

test('media model module imports without browser globals', async () => {
  assert.equal(typeof globalThis.document, 'undefined');
  let module = await import('../../src/static-pages/data/portfolioMediaGraph.js');
  assert.equal(typeof module.createPortfolioMediaGraphModel, 'function');
});
