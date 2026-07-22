import assert from 'node:assert/strict';
import test from 'node:test';
import {
  createPublicationSourceLinkPresentation,
  formatArticleLinkMarkdown,
  formatLocaleDate,
  getGlobalPulseArticleIds,
  renderPublicationCard,
  renderGlobalFeed,
  renderProjectUpdates
} from '../../src/static-pages/js/feedPresentation.js';
import { createPortfolioEntryHref } from '../../src/static-pages/js/portfolioPulseRuntime.js';

const hrefBuilder = (slug, locale) => createPortfolioEntryHref(`pulse/${slug}`, {
  basePath: '/',
  locale,
});

const mockPublications = [
  {
    id: 'pub-dated-1',
    slug: 'dated-slug-1',
    kind: 'research-note',
    status: 'published',
    publishedAt: '2026-07-15T12:00:00-03:00',
    subjectPeriod: null,
    relatedProjectIds: ['project-a'],
    tags: ['research', 'shared'],
    locales: {
      en: { title: 'Dated One EN', summary: 'Summary One EN', body: 'Body One EN' },
      ru: { title: 'Dated One RU', summary: 'Summary One RU', body: 'Body One RU' },
      es: { title: 'Dated One ES', summary: 'Summary One ES', body: 'Body One ES' }
    }
  },
  {
    id: 'pub-dated-2',
    slug: 'dated-slug-2',
    kind: 'update',
    status: 'published',
    publishedAt: '2026-07-17T12:00:00-03:00',
    subjectPeriod: null,
    relatedProjectIds: ['project-a', 'project-b'],
    tags: ['release', 'shared'],
    locales: {
      en: { title: 'Dated Two EN', summary: 'Summary Two EN', body: 'Body Two EN' },
      ru: { title: 'Dated Two RU', summary: 'Summary Two RU', body: 'Body Two RU' },
      es: { title: 'Dated Two ES', summary: 'Summary Two ES', body: 'Body Two ES' }
    }
  },
  {
    id: 'pub-undated-legacy',
    slug: 'legacy-slug',
    kind: 'retrospective',
    status: 'published',
    publishedAt: null,
    subjectPeriod: '2020-2022',
    relatedProjectIds: ['project-a'],
    tags: ['history'],
    locales: {
      en: { title: 'Legacy Retro EN', summary: 'Summary Retro EN', body: 'Body Retro EN' },
      ru: { title: 'Legacy Retro RU', summary: 'Summary Retro RU', body: 'Body Retro RU' },
      es: { title: 'Legacy Retro ES', summary: 'Summary Retro ES', body: 'Body Retro ES' }
    }
  },
  {
    id: 'pub-draft',
    slug: 'draft-slug',
    kind: 'update',
    status: 'draft',
    publishedAt: '2026-07-16T12:00:00-03:00',
    subjectPeriod: null,
    relatedProjectIds: ['project-b'],
    tags: ['draft'],
    locales: {
      en: { title: 'Draft EN', summary: 'Summary Draft', body: 'Body Draft' },
      ru: { title: 'Draft RU', summary: 'Summary Draft', body: 'Body Draft' },
      es: { title: 'Draft ES', summary: 'Summary Draft', body: 'Body Draft' }
    }
  }
];

test('formatLocaleDate works correctly across different locales', () => {
  const dateStr = '2026-07-17T12:00:00-03:00';

  const enFormatted = formatLocaleDate(dateStr, 'en');
  const ruFormatted = formatLocaleDate(dateStr, 'ru');
  const esFormatted = formatLocaleDate(dateStr, 'es');

  assert.match(enFormatted, /July|17|2026/);
  assert.match(ruFormatted, /июля|17|2026/);
  assert.match(esFormatted, /julio|17|2026/);

  assert.equal(formatLocaleDate('', 'en'), '');
  assert.equal(formatLocaleDate(null, 'en'), '');
});

test('renderPublicationCard generates correct elements, escaping, and canonical links', () => {
  const pub = mockPublications[0];

  const enCard = renderPublicationCard(pub, 'en', { hrefBuilder });
  assert.match(enCard, /href="\/pulse\/dated-slug-1\/\?lang=en"/);
  assert.match(enCard, /class="pulse-card-type">R&amp;D note<\/span>/);
  assert.match(enCard, /Dated One EN/);
  assert.match(enCard, /Summary One EN/);
  assert.match(enCard, /<time class="pulse-card-date" datetime="2026-07-15T12:00:00-03:00">/);

  const ruCard = renderPublicationCard(pub, 'ru', { hrefBuilder });
  assert.match(ruCard, /href="\/pulse\/dated-slug-1\/\?lang=ru"/);
  assert.match(ruCard, /class="pulse-card-type">R&amp;D-заметка<\/span>/);
  assert.match(ruCard, /Dated One RU/);
  assert.match(ruCard, /Summary One RU/);

  const legacyPub = mockPublications[2];
  const esLegacyCard = renderPublicationCard(legacyPub, 'es', { hrefBuilder });
  assert.match(esLegacyCard, /href="\/pulse\/legacy-slug\/\?lang=es"/);
  assert.match(esLegacyCard, /class="pulse-card-type">Retrospectiva<\/span>/);
  assert.match(esLegacyCard, /<span class="pulse-card-date">2020-2022<\/span>/);
  assert.match(esLegacyCard, /Legacy Retro ES/);
});

test('renderPublicationCard safely escapes malicious content', () => {
  const unsafePub = {
    id: 'pub-unsafe',
    slug: 'unsafe-slug',
    kind: 'update',
    status: 'published',
    publishedAt: '2026-07-15T12:00:00-03:00',
    locales: {
      en: {
        title: 'Title <script>alert("xss")</script> & "quotes"',
        summary: 'Summary <img src="x" onerror="alert(1)">',
      }
    }
  };

  const cardHtml = renderPublicationCard(unsafePub, 'en', { hrefBuilder });
  assert.doesNotMatch(cardHtml, /<script>/);
  assert.doesNotMatch(cardHtml, /<img/);
  assert.match(cardHtml, /Title &lt;script&gt;alert\(&quot;xss&quot;\)&lt;\/script&gt; &amp; &quot;quotes&quot;/);
  assert.match(cardHtml, /Summary &lt;img src=&quot;x&quot; onerror=&quot;alert\(1\)&quot;&gt;/);
});

test('renderGlobalFeed groups dated vs undated context and sorts by date desc', () => {
  const feedAllEn = renderGlobalFeed(mockPublications, 'en', { hrefBuilder });

  assert.match(feedAllEn, /Latest updates/);
  assert.match(feedAllEn, /Historical context/);
  assert.doesNotMatch(feedAllEn, /Draft EN/);

  const dated2Pos = feedAllEn.indexOf('dated-slug-2');
  const dated1Pos = feedAllEn.indexOf('dated-slug-1');
  assert.ok(dated2Pos < dated1Pos, 'dated-slug-2 should appear before dated-slug-1');
});

test('renderGlobalFeed omits an empty Latest section when historical context exists', () => {
  const historicalOnly = [mockPublications[2]];

  for (const locale of ['en', 'ru', 'es']) {
    const html = renderGlobalFeed(historicalOnly, locale, { hrefBuilder });
    assert.doesNotMatch(html, /id="latest-updates"|pulse-feed-empty/);
    assert.match(html, /id="historical-context"/);
  }
});

test('renderGlobalFeed shows a localized empty state only when no publication exists', () => {
  for (const [locale, emptyText] of [
    ['en', 'No updates found'],
    ['ru', 'Нет обновлений'],
    ['es', 'No hay actualizaciones'],
  ]) {
    const html = renderGlobalFeed([], locale, { hrefBuilder });
    assert.match(html, new RegExp(`<p class="pulse-feed-empty">${emptyText}<\\/p>`));
    assert.doesNotMatch(html, /id="latest-updates"|id="historical-context"/);
  }
});

test('feed and project references use canonical IDs as the equal-time tie-breaker', () => {
  const tiedPublications = [
    {
      ...mockPublications[0],
      id: 'pulse/zeta',
      slug: 'zeta',
      publishedAt: '2026-07-17T15:00:00Z',
      locales: {
        ...mockPublications[0].locales,
        en: { title: 'Zeta', summary: 'Zeta summary', body: 'Zeta body' }
      }
    },
    {
      ...mockPublications[0],
      id: 'pulse/alpha',
      slug: 'alpha',
      publishedAt: '2026-07-17T12:00:00-03:00',
      locales: {
        ...mockPublications[0].locales,
        en: { title: 'Alpha', summary: 'Alpha summary', body: 'Alpha body' }
      }
    }
  ];

  const feed = renderGlobalFeed(tiedPublications, 'en', { hrefBuilder });
  const projectUpdates = renderProjectUpdates(tiedPublications, 'project-a', 'en', { hrefBuilder });

  assert.ok(feed.indexOf('Alpha') < feed.indexOf('Zeta'));
  assert.ok(projectUpdates.indexOf('Alpha') < projectUpdates.indexOf('Zeta'));
});

test('renderProjectUpdates filters by project, structures sections, escapes text and sets semantic elements', () => {
  const projectAEn = renderProjectUpdates(mockPublications, 'project-a', 'en', { hrefBuilder });
  assert.match(projectAEn, /<h2 class="pulse-project-updates-heading">Updates \(2\)<\/h2>/);
  assert.match(projectAEn, /<h3 class="pulse-project-updates-subheading">Latest updates<\/h3>/);
  assert.match(projectAEn, /<h2 class="pulse-project-updates-heading">Historical context<\/h2>/);
  assert.match(projectAEn, /<\/section>\n<section class="pulse-project-updates" id="project-historical-context">/);
  assert.match(projectAEn, /dated-slug-2/);
  assert.match(projectAEn, /dated-slug-1/);
  assert.match(projectAEn, /legacy-slug/);
  assert.match(projectAEn, /<time class="pulse-project-update-meta" datetime="2026-07-17T12:00:00-03:00">/);

  const projectBEn = renderProjectUpdates(mockPublications, 'project-b', 'en', { hrefBuilder });
  assert.match(projectBEn, /Updates \(1\)/);
  assert.match(projectBEn, /Latest updates/);
  assert.doesNotMatch(projectBEn, /Historical context/);
  assert.match(projectBEn, /dated-slug-2/);

  const emptyFeed = renderProjectUpdates(mockPublications, 'non-existent', 'en', { hrefBuilder });
  assert.equal(emptyFeed, '');
});

test('historical-only project references are localized without an Updates section', () => {
  const historicalOnly = [mockPublications[2]];
  const expectations = {
    en: ['Updates', 'Latest updates', 'Historical context'],
    ru: ['Обновления', 'Последние обновления', 'Исторический контекст'],
    es: ['Actualizaciones', 'Últimas actualizaciones', 'Contexto histórico'],
  };

  for (const [locale, [updatesHeading, latestHeading, historicalHeading]] of Object.entries(expectations)) {
    const html = renderProjectUpdates(historicalOnly, 'project-a', locale, { hrefBuilder });
    assert.doesNotMatch(html, new RegExp(`<h2[^>]*>${updatesHeading} \\(`));
    assert.doesNotMatch(html, new RegExp(`<h3[^>]*>${latestHeading}<`));
    assert.doesNotMatch(html, /pulse-project-updates-empty|id="project-updates-section"|id="project-latest-updates"/);
    assert.ok(html.includes(`<h2 class="pulse-project-updates-heading">${historicalHeading}</h2>`));
    assert.match(html, /id="project-historical-context"/);
  }
});

test('publication source links project onto the existing article links contract', () => {
  const sourceLinks = [
    { label: 'Primary source', href: 'https://example.com/source', summary: 'Reference' },
  ];
  const presentation = createPublicationSourceLinkPresentation({ sourceLinks }, 'Sources');

  assert.deepEqual(presentation, {
    linksTitle: 'Sources',
    links: sourceLinks,
  });
  assert.notEqual(presentation.links, sourceLinks);
  assert.deepEqual(createPublicationSourceLinkPresentation({ sourceLinks: [] }, 'Sources'), {});
  assert.equal(
    formatArticleLinkMarkdown(sourceLinks[0]),
    '[Primary source](https://example.com/source) - Reference',
  );
  assert.equal(
    formatArticleLinkMarkdown({ label: 'Source without summary', href: 'https://example.com/plain' }),
    '[Source without summary](https://example.com/plain)',
  );
});

test('the Pulse graph group contains only global publications', () => {
  assert.deepEqual(getGlobalPulseArticleIds([
    {
      status: 'published',
      slug: 'global-update',
      relatedProjectIds: [],
    },
    {
      status: 'published',
      slug: 'project-update',
      relatedProjectIds: ['projects/symbiote-ui'],
    },
    {
      status: 'draft',
      slug: 'global-draft',
      relatedProjectIds: [],
    },
  ]), ['pulse/global-update']);
});

test('accessibility, dates, and escaping properties verification', () => {
  const pub = mockPublications[0];
  const cardHtml = renderPublicationCard(pub, 'en', { hrefBuilder });
  assert.match(cardHtml, /<article[^>]+role="[^"]*"|class="pulse-card"[^>]*>/);
  assert.match(cardHtml, /<h3 class="pulse-card-title"/);
  assert.match(cardHtml, /<time class="pulse-card-date" datetime="2026-07-15T12:00:00-03:00">/);

  const cardWithUnsafeDate = renderPublicationCard({
    id: 'pub-unsafe-date',
    slug: 'unsafe-date',
    kind: 'update',
    status: 'published',
    publishedAt: '2026-07-17<script>alert(1)</script>',
    locales: { en: { title: 'T', summary: 'S' } }
  }, 'en', { hrefBuilder });
  assert.doesNotMatch(cardWithUnsafeDate, /<script>/);
  assert.match(cardWithUnsafeDate, /datetime="2026-07-17&lt;script&gt;alert\(1\)&lt;\/script&gt;"/);
});

test('renderPublicationCard uses custom hrefBuilder if provided', () => {
  const pub = mockPublications[0];
  const customBuilder = (slug, locale) => `/custom-base/${locale}/${slug}`;
  const card = renderPublicationCard(pub, 'en', { hrefBuilder: customBuilder });
  assert.match(card, /href="\/custom-base\/en\/dated-slug-1"/);
});

test('renderProjectUpdates uses custom hrefBuilder if provided', () => {
  const html = renderProjectUpdates(mockPublications, 'project-a', 'en', {
    hrefBuilder: (slug, locale) => `/custom-proj/${locale}/${slug}`
  });
  assert.match(html, /href="\/custom-proj\/en\/dated-slug-1"/);
});

test('renderGlobalFeed propagates the supplied base-path hrefBuilder', () => {
  const html = renderGlobalFeed(mockPublications, 'es', {
    hrefBuilder: (slug, locale) => `/cv/pulse/${slug}/?lang=${locale}`
  });

  assert.match(html, /href="\/cv\/pulse\/dated-slug-1\/\?lang=es"/);
  assert.match(html, /href="\/cv\/pulse\/dated-slug-2\/\?lang=es"/);
});

test('all five publication kinds have localized labels', () => {
  const expectedLabels = {
    en: {
      retrospective: 'Retrospective',
      update: 'Update',
      release: 'Release',
      'research-note': 'R&amp;D note',
      'field-note': 'Field note'
    },
    ru: {
      retrospective: 'Ретроспектива',
      update: 'Обновление',
      release: 'Релиз',
      'research-note': 'R&amp;D-заметка',
      'field-note': 'Практическая заметка'
    },
    es: {
      retrospective: 'Retrospectiva',
      update: 'Actualización',
      release: 'Lanzamiento',
      'research-note': 'Nota de I+D',
      'field-note': 'Nota de campo'
    }
  };
  const kinds = Object.keys(expectedLabels.en);
  const publications = kinds.map(kind => ({
    id: `pub-${kind}`,
    slug: `slug-${kind}`,
    kind,
    status: 'published',
    publishedAt: '2026-07-15T12:00:00-03:00',
    relatedProjectIds: [],
    tags: [],
    locales: {
      en: { title: `Title ${kind}`, summary: `Summary ${kind}` }
    }
  }));

  for (const [locale, labels] of Object.entries(expectedLabels)) {
    for (const publication of publications) {
      const card = renderPublicationCard(publication, locale, { hrefBuilder });
      assert.ok(
        card.includes(`<span class="pulse-card-type">${labels[publication.kind]}</span>`),
        `${locale}.${publication.kind} should use its localized kind label`
      );
    }
  }

  assert.throws(
    () => renderPublicationCard({ ...publications[0], kind: 'research' }, 'en', { hrefBuilder }),
    /Unsupported publication kind: research/
  );
});

test('renderPublicationCard and renderProjectUpdates generate data-publication-id attribute', () => {
  const pub = mockPublications[0];
  const card = renderPublicationCard(pub, 'en', { hrefBuilder });
  assert.match(card, /data-publication-id="pub-dated-1"/);

  const projectUpdates = renderProjectUpdates(mockPublications, 'project-a', 'en', { hrefBuilder });
  assert.match(projectUpdates, /data-publication-id="pub-dated-1"/);
  assert.match(projectUpdates, /data-publication-id="pub-dated-2"/);
  assert.match(projectUpdates, /data-publication-id="pub-undated-legacy"/);
});

test('feed renderers require an explicit base-aware hrefBuilder', () => {
  assert.throws(
    () => renderPublicationCard(mockPublications[0], 'en'),
    /base-aware hrefBuilder function is required/,
  );
  assert.throws(
    () => renderGlobalFeed(mockPublications, 'en'),
    /base-aware hrefBuilder function is required/,
  );
  assert.throws(
    () => renderProjectUpdates(mockPublications, 'project-a', 'en'),
    /base-aware hrefBuilder function is required/,
  );
});
