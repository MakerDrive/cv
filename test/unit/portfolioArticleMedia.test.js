import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

import { loadProjectEntries } from '../../src/static-pages/data/projects.js';
import { PROJECT_TRANSLATIONS } from '../../src/static-pages/data/projectTranslations.js';
import { PORTFOLIO_MEDIA_CATALOG } from '../../src/static-pages/data/portfolioMediaCatalog.js';
import { getProjectMediaDescriptors } from '../../src/static-pages/data/portfolioMediaGraph.js';
import {
  PORTFOLIO_ARTICLE_MEDIA_PLACEMENTS,
  composePortfolioArticleMedia,
  composePortfolioPublicationMedia,
  createPortfolioArticleMediaAssignments,
  createPortfolioMediaFragmentId,
  createPortfolioMediaSlotKey,
  createPortfolioMediaNavigationUrl,
  getPortfolioAssignedMediaDescriptors,
  getPortfolioMediaIdFromFragment,
  normalizePortfolioMediaLinkIdentity,
  parsePortfolioArticleBlocks,
  resolvePortfolioMediaArticleTarget,
  stripPortfolioArticleBlockMarkers,
} from '../../src/static-pages/data/portfolioArticleMedia.js';
import {
  PORTFOLIO_MEDIA_FOCUS_DELAY_MS,
  PORTFOLIO_MEDIA_READING_ROOT_MARGIN,
  createPortfolioMediaFocusScheduler,
  pickPortfolioActiveMediaId,
  resolvePortfolioMediaVisibilityChange,
} from '../../src/static-pages/data/portfolioMediaVisibility.js';

test('article media assignments preserve catalog order and choose the first public target', () => {
  let catalog = [
    {
      id: 'media/one',
      kind: 'image',
      targetIds: ['pulse/missing', 'pulse/update', 'projects/demo'],
      activation: { provider: 'image' },
    },
    {
      id: 'media/two',
      kind: 'image',
      targetIds: ['projects/demo', 'pulse/update'],
      activation: { provider: 'image' },
    },
    {
      id: 'media/unowned',
      kind: 'image',
      relatedProjectIds: ['projects/demo'],
      targetIds: [],
      activation: { provider: 'image' },
    },
  ];
  let assignments = createPortfolioArticleMediaAssignments(
    catalog,
    new Set(['projects/demo', 'pulse/update']),
  );

  assert.deepEqual(assignments.map(({ descriptor, targetId }) => ({
    id: descriptor.id,
    targetId,
    targetIds: descriptor.targetIds,
  })), [
    {
      id: 'media/one',
      targetId: 'pulse/update',
      targetIds: ['pulse/missing', 'pulse/update', 'projects/demo'],
    },
    {
      id: 'media/two',
      targetId: 'projects/demo',
      targetIds: ['projects/demo', 'pulse/update'],
    },
  ]);
  assert.deepEqual(
    getPortfolioAssignedMediaDescriptors(assignments, 'pulse/update').map(({ id }) => id),
    ['media/one'],
  );
});

test('publication media compose at the lead and stay out of source markdown', () => {
  let descriptors = [
    { id: 'media/pulse/one' },
    { id: 'media/pulse/two' },
  ];
  let rendered = composePortfolioPublicationMedia({
    summary: 'Summary',
    details: 'Body',
    descriptors,
  });
  let source = composePortfolioPublicationMedia({
    summary: 'Summary',
    details: 'Body',
    descriptors,
    interactive: false,
  });

  assert.equal(rendered.summary, [
    'Summary',
    `:::content-slot ${createPortfolioMediaSlotKey('media/pulse/one')}`,
    `:::content-slot ${createPortfolioMediaSlotKey('media/pulse/two')}`,
  ].join('\n\n'));
  assert.equal(rendered.details, 'Body');
  assert.deepEqual(rendered.placedMediaIds, ['media/pulse/one', 'media/pulse/two']);
  assert.deepEqual(source, {
    summary: 'Summary',
    details: 'Body',
    placedMediaIds: [],
  });
});

test('portfolio media fragments round-trip node ids containing slashes', () => {
  let mediaId = 'media/megavisor/youtube/ySBWZPHZqsw';
  let fragment = createPortfolioMediaFragmentId(mediaId);

  assert.equal(fragment, 'media-media%2Fmegavisor%2Fyoutube%2FySBWZPHZqsw');
  assert.equal(getPortfolioMediaIdFromFragment(`#${fragment}`), mediaId);
  assert.equal(getPortfolioMediaIdFromFragment('#unrelated'), '');
  assert.match(createPortfolioMediaSlotKey(mediaId), /^media-[A-Za-z0-9_-]+$/);
});

test('media nodes resolve the first existing canonical project or publication article target', () => {
  let node = {
    targetId: 'pulse/demo',
    params: {
      targetIds: ['projects/demo', 'pulse/demo'],
      media: { targetIds: ['projects/demo', 'pulse/demo'] },
    },
  };

  assert.equal(
    resolvePortfolioMediaArticleTarget(node, new Set(['projects/demo', 'pulse/demo'])),
    'projects/demo',
  );
  assert.equal(resolvePortfolioMediaArticleTarget(node, new Set(['pulse/demo'])), 'pulse/demo');
  assert.equal(resolvePortfolioMediaArticleTarget(node, new Set()), '');

  let publicationFirst = { params: { targetIds: ['pulse/demo', 'projects/demo'] } };
  assert.equal(
    resolvePortfolioMediaArticleTarget(publicationFirst, new Set(['projects/demo', 'pulse/demo'])),
    'pulse/demo',
  );
});

test('media article targets reject unknown IDs, indexes, nested paths, and other domains', () => {
  let node = {
    params: {
      targetIds: [
        'pulse/missing',
        'pulse/index',
        'pulse/demo/child',
        'skills/demo',
        'projects/missing',
      ],
    },
  };

  assert.equal(resolvePortfolioMediaArticleTarget(node, new Set([
    'pulse/index',
    'pulse/demo/child',
    'skills/demo',
  ])), '');
});

test('semantic article block ids stay aligned across English, Russian, and Spanish', () => {
  let projects = new Map(loadProjectEntries().map((project) => [project.slug, project]));
  for (let slug of Object.keys(PORTFOLIO_ARTICLE_MEDIA_PLACEMENTS)) {
    let ids = parsePortfolioArticleBlocks(projects.get(slug).details).map((block) => block.id);
    assert.ok(ids.length > 0, `${slug}:en`);
    for (let locale of ['ru', 'es']) {
      assert.deepEqual(
        parsePortfolioArticleBlocks(PROJECT_TRANSLATIONS[locale][slug].details).map((block) => block.id),
        ids,
        `${slug}:${locale}`,
      );
    }
  }
});

test('every embeddable article media descriptor has one explicit semantic placement', () => {
  for (let project of loadProjectEntries()) {
    let placements = PORTFOLIO_ARTICLE_MEDIA_PLACEMENTS[project.slug];
    if (!placements) continue;
    let descriptorIds = getProjectMediaDescriptors(project, PORTFOLIO_MEDIA_CATALOG)
      .map((descriptor) => descriptor.id);
    assert.deepEqual(Object.keys(placements).sort(), descriptorIds.sort(), project.slug);
    assert.ok(descriptorIds.every((id) => !id.endsWith('/cover')), `${project.slug}: no cover node`);
  }
});

test('MEGAVISOR product promo is the article lead media', () => {
  assert.equal(
    PORTFOLIO_ARTICLE_MEDIA_PLACEMENTS.megavisor['media/megavisor/youtube/c3cCmDqO04c'],
    'lead',
  );
});

test('composition removes only the matching media link and inserts its slot beside the same block', () => {
  let descriptor = {
    id: 'media/megavisor/youtube/6CpdVcjtZoU',
    href: 'https://youtu.be/6CpdVcjtZoU?t=3',
    activation: { provider: 'youtube', videoId: '6CpdVcjtZoU' },
  };
  let result = composePortfolioArticleMedia({
    slug: 'megavisor',
    summary: 'Lead',
    details: ':::article-block media-production\nA [studio promo](https://www.youtube.com/watch?v=6CpdVcjtZoU) and [near miss](https://www.youtube.com/watch?v=6CpdVcjtZoa).',
    descriptors: [descriptor],
  });

  assert.match(result.details, /A studio promo and \[near miss\]/);
  assert.match(result.details, new RegExp(`:::content-slot ${createPortfolioMediaSlotKey(descriptor.id)}$`));
  assert.equal(result.placedMediaIds[0], descriptor.id);
  assert.equal(
    normalizePortfolioMediaLinkIdentity('https://www.youtube.com/embed/6CpdVcjtZoU'),
    normalizePortfolioMediaLinkIdentity(descriptor.href),
  );
});

test('unplaced media has no generic tail fallback and authored markers stay out of exports', () => {
  let details = ':::article-block one\nFirst.\n\n:::article-block two\nSecond.';
  let result = composePortfolioArticleMedia({
    slug: 'unmapped',
    summary: 'Lead',
    details,
    descriptors: [{ id: 'media/unmapped/cover' }],
  });
  assert.doesNotMatch(result.details, /content-slot/);
  assert.equal(stripPortfolioArticleBlockMarkers(details), 'First.\n\nSecond.');
});

test('media navigation preserves search parameters and adds an article fragment', () => {
  let url = createPortfolioMediaNavigationUrl({
    currentUrl: 'http://localhost:3001/projects/other/?lang=ru&mode=media',
    pathname: '/projects/megavisor/',
    fragmentId: 'media-media%2Fmegavisor%2Fyoutube%2FySBWZPHZqsw',
  });

  assert.equal(
    url.href,
    'http://localhost:3001/projects/megavisor/?lang=ru&mode=media#media-media%2Fmegavisor%2Fyoutube%2FySBWZPHZqsw',
  );
});

test('reading-band media selection prefers the block nearest the band center', () => {
  let rootBounds = { top: 330, bottom: 400 };
  let candidates = [
    {
      mediaId: 'small-edge',
      order: 1,
      isIntersecting: true,
      rect: { top: 370, bottom: 410 },
      rootBounds,
      intersectionRatio: 1,
    },
    {
      mediaId: 'tall-reading-block',
      order: 0,
      isIntersecting: true,
      rect: { top: 100, bottom: 620 },
      rootBounds,
      intersectionRatio: 0.4,
    },
  ];

  assert.equal(PORTFOLIO_MEDIA_READING_ROOT_MARGIN, '-33% 0px -60% 0px');
  assert.equal(pickPortfolioActiveMediaId(candidates), 'tall-reading-block');
});

test('reading-band media selection is stable for ties and empty gaps', () => {
  let rootBounds = { top: 300, bottom: 400 };
  let tied = [
    { mediaId: 'second', order: 2, isIntersecting: true, rect: { top: 340, bottom: 360 }, rootBounds },
    { mediaId: 'first', order: 1, isIntersecting: true, rect: { top: 340, bottom: 360 }, rootBounds },
  ];

  assert.equal(pickPortfolioActiveMediaId(tied), 'first');
  assert.equal(pickPortfolioActiveMediaId([], 'first'), 'first');
});

test('deep-link media latch ignores layout transients until user input releases it', () => {
  assert.deepEqual(resolvePortfolioMediaVisibilityChange({
    candidateId: 'media/intermediate',
    expectedId: 'media/target',
    previousId: 'media/target',
  }), {
    mediaId: 'media/target',
    expectedId: 'media/target',
    changed: false,
  });
  assert.deepEqual(resolvePortfolioMediaVisibilityChange({
    candidateId: 'media/target',
    expectedId: 'media/target',
    previousId: 'media/intermediate',
  }), {
    mediaId: 'media/target',
    expectedId: 'media/target',
    changed: true,
  });
});

test('media focus scheduling keeps only the latest settled article anchor', () => {
  let callbacks = new Map();
  let cleared = [];
  let focused = [];
  let activeId = 'media/a';
  let nextTimerId = 0;
  let scheduler = createPortfolioMediaFocusScheduler({
    focus: (mediaId) => focused.push(mediaId),
    isCurrent: (mediaId) => mediaId === activeId,
    setTimer: (callback, delayMs) => {
      assert.equal(delayMs, PORTFOLIO_MEDIA_FOCUS_DELAY_MS);
      let timerId = ++nextTimerId;
      callbacks.set(timerId, callback);
      return timerId;
    },
    clearTimer: (timerId) => cleared.push(timerId),
  });

  scheduler.schedule('media/a');
  let staleCallback = callbacks.get(1);
  activeId = 'media/b';
  scheduler.schedule('media/b');
  activeId = 'media/c';
  scheduler.schedule('media/c');

  staleCallback();
  assert.deepEqual(focused, []);
  callbacks.get(3)();
  assert.deepEqual(focused, ['media/c']);
  assert.deepEqual(cleared, [1, 2]);
  assert.equal(scheduler.pendingId, '');
});

test('media focus scheduling cancels pending work and rejects stale targets', () => {
  let callback;
  let focused = [];
  let activeId = 'media/a';
  let scheduler = createPortfolioMediaFocusScheduler({
    focus: (mediaId) => focused.push(mediaId),
    isCurrent: (mediaId) => mediaId === activeId,
    setTimer: (nextCallback) => {
      callback = nextCallback;
      return 1;
    },
    clearTimer() {},
  });

  scheduler.schedule('media/a');
  scheduler.cancel();
  callback();
  assert.deepEqual(focused, []);

  scheduler.schedule('media/a');
  activeId = 'media/b';
  callback();
  assert.deepEqual(focused, []);
});

test('continuous scrolling reschedules the same anchor until it settles', () => {
  let callbacks = [];
  let focused = [];
  let scheduler = createPortfolioMediaFocusScheduler({
    focus: (mediaId) => focused.push(mediaId),
    isCurrent: () => true,
    setTimer: (callback) => {
      callbacks.push(callback);
      return callbacks.length;
    },
    clearTimer() {},
  });

  scheduler.schedule('media/current');
  scheduler.schedule('media/current');
  callbacks[0]();
  scheduler.schedule('media/current');
  callbacks[1]();
  assert.deepEqual(focused, []);

  callbacks[2]();
  assert.deepEqual(focused, ['media/current']);
});

test('portfolio routes selected media into article content instead of a graph player', async () => {
  let source = await readFile(new URL('../../src/static-pages/js/index.js', import.meta.url), 'utf8');
  let css = await readFile(new URL('../../src/static-pages/css/index.css.js', import.meta.url), 'utf8');

  assert.match(source, /renderContentSlots\(\(host, slotKey, context = \{\}\) =>/);
  assert.match(source, /raw: entry\.sourceMarkdown/);
  assert.match(source, /renderedRaw: entry\.markdown/);
  assert.match(source, /createElement\('sn-media-host'\)/);
  assert.match(source, /createElement\('iframe'\)/);
  assert.match(source, /youtube-nocookie\.com\/embed/);
  assert.match(source, /iframe\.loading = 'lazy'/);
  assert.match(source, /iframe\.referrerPolicy = 'strict-origin-when-cross-origin'/);
  assert.doesNotMatch(source, /youtube-nocookie\.com\/embed\/[^`]*autoplay=1/);
  let syncViewer = source.slice(
    source.indexOf('syncViewer() {'),
    source.indexOf('routeToMediaArticle', source.indexOf('syncViewer() {')),
  );
  let showFileAt = syncViewer.indexOf('this.viewer.showFile({');
  let scrollToTopAt = syncViewer.indexOf("this.viewer.scrollToTop({ behavior: 'auto' });");
  let renderContentSlotsAt = syncViewer.indexOf('this.viewer.renderContentSlots(');
  assert.ok(showFileAt >= 0, 'article navigation renders the selected document');
  assert.ok(scrollToTopAt > showFileAt, 'the new document resets after rendering');
  assert.ok(
    renderContentSlotsAt > scrollToTopAt,
    'media slot composition and fragment focus happen after the viewport reset',
  );
  assert.match(syncViewer, /this\.activateArticleMediaNode\(mediaId, \{ fit: true \}\)/);
  let slotRenderer = source.slice(
    source.indexOf('function renderPortfolioArticleMediaSlot'),
    source.indexOf('function getFlatGraphFocusId'),
  );
  assert.match(slotRenderer, /host\.append\(mediaHost\);\n    mediaHost\.activate\(\);/);
  assert.doesNotMatch(slotRenderer, /mediaHost\?\.activate/);
  assert.doesNotMatch(slotRenderer, /requestAnimationFrame|setTimeout/);
  assert.match(source, /resolvePortfolioMediaArticleTarget/);
  assert.match(source, /if \(media\) \{\s*portfolioRuntime\.selectMediaNode\(path, mediaGraph\);\s*return;\s*\}/);
  assert.match(source, /context\.scrollRoot/);
  assert.match(source, /rootMargin: PORTFOLIO_MEDIA_READING_ROOT_MARGIN/);
  assert.match(source, /activateNode\?\.\(id, \{ transition: false, marker: false \}\)/);
  assert.match(source, /this\.articleMediaFocusScheduler\?\.schedule\?\.\(change\.mediaId\)/);
  assert.match(source, /this\.fitNodes\?\.\(\[id\], \{/);
  assert.match(source, /includeInfoPanel: true/);
  assert.match(source, /maxZoom: PORTFOLIO_MEDIA_FOCUS_ZOOM/);
  assert.match(source, /padding: 64/);
  assert.match(source, /select: id/);
  assert.match(source, /transition: true/);
  assert.match(source, /let shouldFocusMediaEntry = focus && this\.graphMode === 'media' && !this\.activeArticleMediaId/);
  assert.match(source, /this\.activateArticleMediaNode\(this\.activeArticleMediaId, \{ fit: focus \}\)/);
  let observerRuntime = source.slice(
    source.indexOf('ensureArticleMediaObserver(scrollRoot)'),
    source.indexOf('syncViewer()', source.indexOf('ensureArticleMediaObserver(scrollRoot)')),
  );
  assert.match(source, /disconnectArticleMediaObserver[\s\S]*?this\.articleMediaFocusScheduler\?\.cancel\?\.\(\)/);
  assert.match(
    source,
    /addEventListener\('scroll', this\.articleMediaScrollListener, \{ passive: true \}\)/,
  );
  assert.match(
    source,
    /removeEventListener\?\.\('scroll', this\.articleMediaScrollListener\)/,
  );
  assert.match(
    source,
    /let pendingId = this\.articleMediaFocusScheduler\?\.pendingId;\s*if \(pendingId\) this\.articleMediaFocusScheduler\.schedule\(pendingId\)/,
  );
  assert.match(observerRuntime, /this\.articleMediaFocusScheduler\?\.schedule\?\.\(change\.mediaId\)/);
  assert.doesNotMatch(observerRuntime, /this\.activateArticleMediaNode\(change\.mediaId, \{ fit: true \}\)/);
  assert.doesNotMatch(observerRuntime, /this\.(?:select|syncUrl|syncViewer|syncCanvas)\(/);
  assert.doesNotMatch(observerRuntime, /(?:flyToNode|focusEntry|pulseNode|\.activate)\(/);
  assert.match(
    source,
    /portfolioRuntime\.articleMediaFocusScheduler = createPortfolioMediaFocusScheduler\(\{[\s\S]*?portfolioRuntime\.activateArticleMediaNode\(mediaId, \{ fit: true \}\)/,
  );
  assert.doesNotMatch(source, /showMediaPreview|closeMediaPreview|ensureMediaPlaqueController/);
  assert.doesNotMatch(source, /createCanvasHtmlPlaqueController|resolveCanvasHtmlPlaqueEligibility/);
  assert.doesNotMatch(css, /portfolio-graph-media-preview/);
  assert.doesNotMatch(css, /\.portfolio-article-media\s*\{/);
  assert.match(css, /\.portfolio-article-media-host/);
  assert.match(css, /\.portfolio-article-youtube/);
  assert.match(css, /background: var\(--pulse-surface-raised\)/);
  assert.match(css, /--sn-media-bg: var\(--pulse-surface-raised\)/);
  assert.match(css, /--sn-media-poster-bg: var\(--pulse-surface-raised\)/);
  assert.match(css, /--color-bg: var\(--pulse-surface-raised\)/);
  assert.match(css, /--color-fg: var\(--pulse-text\)/);
  assert.match(
    css,
    /\.portfolio-article-media-item \{[\s\S]*?border: 1px solid var\(--pulse-outline\);/,
  );
  assert.doesNotMatch(
    css,
    /\.portfolio-article-media-item \{[\s\S]*?border: 1px solid color-mix\(/,
  );
});

test('article media CSS preserves IMS widget host display contracts', async () => {
  let css = await readFile(new URL('../../src/static-pages/css/index.css.js', import.meta.url), 'utf8');
  let mediaCss = css.slice(
    css.indexOf('.portfolio-article-media-item'),
    css.indexOf('.portfolio-canvas[hidden]'),
  );
  let displayBlockSelectors = [...mediaCss.matchAll(/([^{}]+)\{\s*display:\s*block;/g)]
    .map((match) => match[1]);
  let displayBlockSelector = displayBlockSelectors
    .find((selector) => selector.includes('ims-viewer')) || '';

  assert.match(displayBlockSelector, /ims-viewer/);
  assert.doesNotMatch(
    mediaCss,
    /\.portfolio-article-media-host ims-(?:spinner|gallery|pano)/,
  );
});

test('structured graph builds explicit media leaves through the shared node factory', async () => {
  let source = await readFile(new URL('../../src/static-pages/js/index.js', import.meta.url), 'utf8');

  assert.match(
    source,
    /import \{[^}]*createPortfolioMediaLeafNode[^}]*\} from '\.\.\/data\/portfolioMediaGraph\.js'/s,
  );

  let editor = source.slice(
    source.indexOf('function createPortfolioEditor'),
    source.indexOf('class PortfolioTreePanel'),
  );
  assert.match(editor, /createPortfolioMediaLeafNode\(descriptor, \{ parentId: /);
  assert.match(editor, /shape: 'rect'/);
  assert.match(editor, /icon: 'movie'/);
  assert.match(editor, /node\.params = leaf\.params/);
  assert.match(editor, /createPortfolioRelationPlan\(\{/);
  assert.match(editor, /getPortfolioRelationProjects\(\{ includeMedia: true \}\)/);
  assert.match(editor, /for \(let edge of relationPlan\) connect\(editor, nodes, edge\)/);
});

test('activateArticleMediaNode gains a structured branch driven by the public transition API', async () => {
  let source = await readFile(new URL('../../src/static-pages/js/index.js', import.meta.url), 'utf8');

  let activate = source.slice(
    source.indexOf('activateArticleMediaNode(mediaId'),
    source.indexOf('ensureArticleMediaObserver(scrollRoot)'),
  );
  assert.match(activate, /this\.mediaGraph\?\.activateMediaNode\?\.\(id, \{ fit \}\)/);
  assert.match(activate, /this\.graphPanel\?\._structuredEditor\?\.getNode\?\.\(id\)/);
  assert.match(activate, /this\.expectedStructuredMediaId = id/);
  assert.match(
    activate,
    /this\.canvas\.focusNodes\?\.\(id, \{\s*select: id,\s*transition: true,\s*padding: 56,\s*zoom: 0\.8,\s*\}\)/,
  );
  assert.match(activate, /this\.canvas\.selectNode\?\.\(id\)/);
});

test('the async structured expected-target guard is a string set before selection and consumed on selection-changed', async () => {
  let source = await readFile(new URL('../../src/static-pages/js/index.js', import.meta.url), 'utf8');

  assert.match(source, /expectedStructuredMediaId: ''/);
  assert.doesNotMatch(source, /expectedStructuredMediaId: (?:false|true)/);

  let renderer = source.slice(
    source.indexOf('ensureStructuredGraphRenderer() {'),
    source.indexOf('scheduleStructuredGraphBinding() {'),
  );
  assert.match(renderer, /id === portfolioRuntime\.expectedStructuredMediaId/);
  assert.match(renderer, /portfolioRuntime\.expectedStructuredMediaId = ''/);
  assert.match(renderer, /addEventListener\('pointerdown',[\s\S]*?\{ capture: true \}\)/);
  assert.match(renderer, /addEventListener\('keydown',[\s\S]*?\{ capture: true \}\)/);
});

test('structured selection sinks route explicit media nodes to the owning article via shared routing', async () => {
  let source = await readFile(new URL('../../src/static-pages/js/index.js', import.meta.url), 'utf8');

  assert.match(source, /routeToMediaArticle\(node, mediaId\) \{/);
  assert.match(source, /return routePortfolioMediaArticleSelection\(\{/);
  assert.match(source, /resolveTarget: resolvePortfolioMediaArticleTarget/);
  assert.match(source, /if \(media\) \{\s*portfolioRuntime\.selectMediaNode\(path, mediaGraph\);\s*return;\s*\}/);

  let renderer = source.slice(
    source.indexOf('ensureStructuredGraphRenderer() {'),
    source.indexOf('scheduleStructuredGraphBinding() {'),
  );
  assert.match(renderer, /addEventListener\('sn-media-activate'/);
  assert.match(renderer, /routeToMediaArticle\(node,/);
  assert.match(renderer, /node\?\.params\?\.media\?\.activation\?\.provider/);

  let toolbar = source.slice(
    source.indexOf('onStructuredGraphToolbarAction(event) {'),
    source.indexOf('onMediaGraphToolbarAction(event) {'),
  );
  assert.match(toolbar, /_structuredEditor\?\.getNode\?\.\(id\)/);
  assert.match(toolbar, /routeToMediaArticle\(/);
});

test('mode transitions keep the focused structured media node instead of overriding it', async () => {
  let source = await readFile(new URL('../../src/static-pages/js/index.js', import.meta.url), 'utf8');

  assert.match(source, /this\.graphMode === 'media' \|\| this\.graphMode === 'structured'/);
  assert.match(
    source,
    /this\.graphMode === 'structured'\s*&&\s*this\.activeArticleMediaId\s*&&\s*this\.activateArticleMediaNode\(this\.activeArticleMediaId, \{ fit: focus \}\)/,
  );
});
