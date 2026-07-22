import assert from 'node:assert/strict';
import test from 'node:test';
import { buildResourceTreeFromEntries } from 'symbiote-ui/ui';
import {
  createPortfolioEntryHref,
  createPortfolioTreeStorageKey,
  resolvePortfolioTreeHighlightId,
  resolvePulseFocusIds,
  resolveProjectUpdatesSlotKey,
  resolvePulseKindMessageKey,
  createPortfolioTreeOccurrences,
  buildPortfolioTreeProjection,
  resolvePortfolioEntryIdFromHref,
  shouldHandleInAppActivation,
  shouldHandlePulseInAppActivation,
} from '../../src/static-pages/js/portfolioPulseRuntime.js';

test('tree storage keys keep the v6 namespace isolated by locale', () => {
  assert.equal(createPortfolioTreeStorageKey('en'), 'cv-portfolio-materials-tree-v6:en');
  assert.equal(createPortfolioTreeStorageKey('ru'), 'cv-portfolio-materials-tree-v6:ru');
});

test('Pulse focus follows global and project containment', () => {
  let publications = [
    {
      id: 'pulse/global',
      slug: 'global',
      status: 'published',
      relatedProjectIds: [],
    },
    {
      id: 'pulse/associated',
      slug: 'associated',
      status: 'published',
      relatedProjectIds: ['projects/one', 'projects/two'],
    },
    {
      id: 'pulse/draft',
      slug: 'draft',
      status: 'draft',
      relatedProjectIds: [],
    },
  ];

  assert.deepEqual(
    resolvePulseFocusIds('pulse/index', publications),
    ['group/pulse', 'pulse/global'],
  );
  assert.deepEqual(
    resolvePulseFocusIds('pulse/index', publications, { containerId: 'pulse/index' }),
    ['pulse/index', 'pulse/global'],
  );
  assert.deepEqual(
    resolvePulseFocusIds('pulse/global', publications),
    ['group/pulse', 'pulse/global'],
  );
  assert.deepEqual(
    resolvePulseFocusIds('pulse/associated', publications),
    ['projects/one', 'projects/two', 'pulse/associated'],
  );
  assert.deepEqual(
    resolvePulseFocusIds('pulse/associated', publications, { containerId: 'pulse/index' }),
    ['projects/one', 'projects/two', 'pulse/associated'],
  );
  assert.equal(resolvePulseFocusIds('pulse/associated', publications).includes('group/pulse'), false);
});

test('publication routes highlight the single Pulse tree entry', () => {
  assert.equal(resolvePortfolioTreeHighlightId('pulse/project-graph-mcp'), 'pulse/index');
  assert.equal(resolvePortfolioTreeHighlightId('pulse/index'), 'pulse/index');
  assert.equal(resolvePortfolioTreeHighlightId('projects/project-graph-mcp'), 'projects/project-graph-mcp');
});

test('shouldHandlePulseInAppActivation accepts only unhandled primary activations for valid pulse slugs', () => {
  const createMockEvent = (button = 0, modifiers = {}) => ({
    button,
    metaKey: modifiers.metaKey || false,
    ctrlKey: modifiers.ctrlKey || false,
    shiftKey: modifiers.shiftKey || false,
    altKey: modifiers.altKey || false,
  });

  const createMockAnchor = (attrs = {}) => ({
    hasAttribute: (name) => name in attrs,
    getAttribute: (name) => attrs[name] || null,
  });

  let evValid = createMockEvent(0);
  let elValid = createMockAnchor({ 'data-publication-id': 'pulse/my-slug' });
  assert.equal(shouldHandlePulseInAppActivation(evValid, elValid), true);

  let evMeta = createMockEvent(0, { metaKey: true });
  assert.equal(shouldHandlePulseInAppActivation(evMeta, elValid), false);

  let evRight = createMockEvent(1);
  assert.equal(shouldHandlePulseInAppActivation(evRight, elValid), false);

  let elDownload = createMockAnchor({ 'data-publication-id': 'pulse/slug', download: '' });
  assert.equal(shouldHandlePulseInAppActivation(evValid, elDownload), false);

  let elBlank = createMockAnchor({ 'data-publication-id': 'pulse/slug', target: '_blank' });
  assert.equal(shouldHandlePulseInAppActivation(evValid, elBlank), false);

  let elInvalidId = createMockAnchor({ 'data-publication-id': 'project/slug' });
  assert.equal(shouldHandlePulseInAppActivation(evValid, elInvalidId), false);
  assert.equal(
    shouldHandlePulseInAppActivation({ ...evValid, defaultPrevented: true }, elValid),
    false,
  );
  assert.equal(
    shouldHandlePulseInAppActivation(evValid, createMockAnchor({ 'data-publication-id': 'pulse/' })),
    false,
  );
});

test('Pulse links preserve the deployment base path and locale', () => {
  assert.equal(
    createPortfolioEntryHref('pulse/symbiote-ui', { basePath: '/cv/', locale: 'ru' }),
    '/cv/pulse/symbiote-ui/?lang=ru',
  );
  assert.equal(
    createPortfolioEntryHref('pulse/index', { basePath: '/', locale: 'es' }),
    '/pulse/?lang=es',
  );
});

test('publication kinds resolve to the exact five locale keys', () => {
  assert.deepEqual(
    ['retrospective', 'update', 'release', 'research-note', 'field-note']
      .map(resolvePulseKindMessageKey),
    [
      'pulse.type.retrospective',
      'pulse.type.update',
      'pulse.type.release',
      'pulse.type.research-note',
      'pulse.type.field-note',
    ],
  );
  assert.throws(() => resolvePulseKindMessageKey('research'), /Unsupported publication kind/);
});

test('project publication references use the dedicated Updates content slot', () => {
  let publications = [
    {
      status: 'published',
      relatedProjectIds: ['projects/symbiote-ui'],
    },
    {
      status: 'draft',
      relatedProjectIds: ['projects/agent-portal'],
    },
  ];

  assert.equal(
    resolveProjectUpdatesSlotKey(publications, 'projects/symbiote-ui'),
    'project-updates',
  );
  assert.equal(resolveProjectUpdatesSlotKey(publications, 'projects/agent-portal'), '');
});

test('resolvePortfolioTreeHighlightId maps canonical publication to primary occurrence ID', () => {
  let publications = [
    {
      id: 'pulse/my-cool-pub',
      slug: 'my-cool-pub',
      status: 'published',
      primaryProjectId: 'projects/cool-project',
      relatedProjectIds: ['projects/cool-project'],
    },
    {
      id: 'pulse/global-pub',
      slug: 'global-pub',
      status: 'published',
      primaryProjectId: null,
      relatedProjectIds: [],
    }
  ];

  assert.equal(
    resolvePortfolioTreeHighlightId('pulse/my-cool-pub', publications),
    'occurrence/cool-project/pulse/my-cool-pub'
  );
  assert.equal(
    resolvePortfolioTreeHighlightId('pulse/global-pub', publications),
    'pulse/index'
  );
  assert.equal(
    resolvePortfolioTreeHighlightId('pulse/non-existent', publications),
    'pulse/index'
  );
  assert.equal(
    resolvePortfolioTreeHighlightId('pulse/index', publications),
    'pulse/index'
  );
  assert.equal(
    resolvePortfolioTreeHighlightId(
      'projects/cool-project',
      publications,
      new Map([['Projects/AI/Cool Project', 'projects/cool-project']])
    ),
    'Projects/AI/Cool Project'
  );
});

test('createPortfolioTreeOccurrences generates occurrences for project-publication pairs', () => {
  let projectNavigationEntries = [
    {
      id: 'projects/index',
      path: 'Projects/Overview.md',
      label: 'Overview',
    },
    {
      id: 'projects/first-project',
      path: 'Projects/AI/First Project.md',
      label: 'First Project',
    },
    {
      id: 'projects/second-project',
      path: 'Projects/Hardware/Second Project.md',
      label: 'Second Project',
    }
  ];

  let publications = [
    {
      id: 'pulse/pub-one',
      slug: 'pub-one',
      status: 'published',
      relatedProjectIds: ['projects/first-project', 'projects/second-project'],
      locales: {
        en: { title: 'Publication English One' },
        ru: { title: 'Publication Russian One' },
      }
    },
    {
      id: 'pulse/pub-two',
      slug: 'pub-two',
      status: 'published',
      relatedProjectIds: ['projects/first-project'],
      locales: {
        en: { title: 'Publication Two' },
      }
    },
    {
      id: 'pulse/pub-draft',
      slug: 'pub-draft',
      status: 'draft',
      relatedProjectIds: ['projects/first-project'],
      locales: {
        en: { title: 'Draft Pub' },
      }
    },
    {
      id: 'pulse/global-pub',
      slug: 'global-pub',
      status: 'published',
      relatedProjectIds: [],
      locales: {
        en: { title: 'Global Pub' },
      }
    }
  ];

  let occurrencesEn = createPortfolioTreeOccurrences(projectNavigationEntries, publications, 'en');

  assert.deepEqual(occurrencesEn, [
    {
      id: 'occurrence/first-project/pulse/pub-one',
      path: 'Projects/AI/First Project/Publication English One.md',
      label: 'Publication English One',
      icon: 'article',
      kind: 'occurrence',
      draggable: false,
      metadata: {
        targetId: 'pulse/pub-one',
      }
    },
    {
      id: 'occurrence/first-project/pulse/pub-two',
      path: 'Projects/AI/First Project/Publication Two.md',
      label: 'Publication Two',
      icon: 'article',
      kind: 'occurrence',
      draggable: false,
      metadata: {
        targetId: 'pulse/pub-two',
      }
    },
    {
      id: 'occurrence/second-project/pulse/pub-one',
      path: 'Projects/Hardware/Second Project/Publication English One.md',
      label: 'Publication English One',
      icon: 'article',
      kind: 'occurrence',
      draggable: false,
      metadata: {
        targetId: 'pulse/pub-one',
      }
    }
  ]);

  let occurrencesRu = createPortfolioTreeOccurrences(projectNavigationEntries, publications, 'ru');
  let firstRu = occurrencesRu.find(o => o.id === 'occurrence/first-project/pulse/pub-one');
  assert.equal(firstRu.label, 'Publication Russian One');
  assert.equal(firstRu.path, 'Projects/AI/First Project/Publication Russian One.md');

  let secondRu = occurrencesRu.find(o => o.id === 'occurrence/first-project/pulse/pub-two');
  assert.equal(secondRu.label, 'Publication Two');
});

test('buildPortfolioTreeProjection resolves tree projection without project duplication', () => {
  let projectItems = [
    { slug: 'pub-project', title: 'Pub Project' },
    { slug: 'no-pub-project', title: 'No Pub Project' }
  ];
  let publications = [
    {
      id: 'pulse/my-pub',
      slug: 'my-pub',
      status: 'published',
      primaryProjectId: 'projects/pub-project',
      relatedProjectIds: ['projects/pub-project'],
      locales: { en: { title: 'My Pub' } }
    }
  ];

  let tPortfolio = (key) => {
    if (key === 'projects.label') return 'Projects';
    return key;
  };
  let getProjectTreeGroup = (p) => 'rnd';
  let getProjectTreeGroupLabel = (g) => 'R&D';

  let result = buildPortfolioTreeProjection({
    projectItems,
    publications,
    locale: 'en',
    tPortfolio,
    getProjectTreeGroup,
    getProjectTreeGroupLabel,
    profileEntries: [{ id: 'profile/photo', path: 'Bio/Vladimir.md', label: 'Vladimir' }],
    skillEntries: [{ id: 'skills/one', path: 'Skills/One.md', label: 'One' }]
  });

  let selectionMap = new Map(result.projectDirectorySelections);
  assert.equal(selectionMap.get('Projects/R&D/Pub Project'), 'projects/pub-project');

  const tree = buildResourceTreeFromEntries(result.resourceEntries, {
    directoryIcon: 'folder',
    fileIcon: 'article',
    draggable: false,
    sort: false,
  });

  function findNodesByLabel(nodes, label) {
    let found = [];
    for (let node of nodes) {
      if (node.label === label) {
        found.push(node);
      }
      if (node.children) {
        found.push(...findNodesByLabel(node.children, label));
      }
    }
    return found;
  }

  const pubProjectNodes = findNodesByLabel(tree, 'Pub Project');
  assert.equal(pubProjectNodes.length, 1);
  const pubProjectNode = pubProjectNodes[0];
  assert.ok(pubProjectNode.children);
  assert.equal(pubProjectNode.children.length, 1);
  assert.equal(pubProjectNode.children[0].label, 'My Pub');
  assert.equal(pubProjectNode.children[0].id, 'occurrence/pub-project/pulse/my-pub');

  const noPubProjectNodes = findNodesByLabel(tree, 'No Pub Project');
  assert.equal(noPubProjectNodes.length, 1);
  assert.equal(noPubProjectNodes[0].id, 'projects/no-pub-project');
  assert.ok(!noPubProjectNodes[0].children);
});

test('resolvePortfolioEntryIdFromHref resolves internal links and rejects external/download links', () => {
  const entries = new Set([
    'projects/lifecycle-messaging-platform',
    'projects/agent-portal',
    'pulse/autobox-v1',
    'skills/agentic-ai',
    'bio/about',
  ]);

  assert.equal(
    resolvePortfolioEntryIdFromHref('projects/lifecycle-messaging-platform/?lang=ru', { entries }),
    'projects/lifecycle-messaging-platform'
  );
  assert.equal(
    resolvePortfolioEntryIdFromHref('/cv/projects/agent-portal/', { entries, basePath: '/cv/' }),
    'projects/agent-portal'
  );
  assert.equal(
    resolvePortfolioEntryIdFromHref('pulse/autobox-v1', { entries }),
    'pulse/autobox-v1'
  );
  assert.equal(
    resolvePortfolioEntryIdFromHref('projects/agent-portal/pulse/autobox-v1', { entries }),
    'pulse/autobox-v1'
  );
  assert.equal(
    resolvePortfolioEntryIdFromHref('https://objet.art/', { entries }),
    null
  );
  assert.equal(
    resolvePortfolioEntryIdFromHref('downloads/vladimir-matiasevich-cv-ru.pdf', { entries }),
    null
  );
});

test('shouldHandleInAppActivation processes anchor clicks for internal SPA targets', () => {
  const entries = new Set(['projects/agent-portal', 'pulse/my-pub']);
  const createMockEvent = (button = 0, modifiers = {}) => ({
    button,
    metaKey: modifiers.metaKey || false,
    ctrlKey: modifiers.ctrlKey || false,
    shiftKey: modifiers.shiftKey || false,
    altKey: modifiers.altKey || false,
  });

  const createMockAnchor = (attrs = {}) => ({
    hasAttribute: (name) => name in attrs,
    getAttribute: (name) => attrs[name] || null,
  });

  let evValid = createMockEvent(0);
  let elPulse = createMockAnchor({ 'data-publication-id': 'pulse/my-pub' });
  let elProjectHref = createMockAnchor({ href: 'projects/agent-portal/?lang=en' });
  let elExternalHref = createMockAnchor({ href: 'https://objet.art/' });

  assert.equal(shouldHandleInAppActivation(evValid, elPulse, { entries }), 'pulse/my-pub');
  assert.equal(shouldHandleInAppActivation(evValid, elProjectHref, { entries }), 'projects/agent-portal');
  assert.equal(shouldHandleInAppActivation(evValid, elExternalHref, { entries }), null);
});

