import { PORTFOLIO_LOCALE_MESSAGES } from '../data/portfolioTranslations.js';

function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str).replace(/[&<>'"]/g, tag => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;'
  }[tag] || tag));
}

function localeMessage(locale, key) {
  return PORTFOLIO_LOCALE_MESSAGES[locale]?.[key]
    || PORTFOLIO_LOCALE_MESSAGES.en[key]
    || '';
}

function requireHrefBuilder(options) {
  if (typeof options?.hrefBuilder !== 'function') {
    throw new TypeError('A base-aware hrefBuilder function is required');
  }
  return options.hrefBuilder;
}

export function formatLocaleDate(dateString, locale) {
  if (!dateString) return '';
  try {
    const match = dateString.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (match) {
      const year = parseInt(match[1], 10);
      const month = parseInt(match[2], 10) - 1;
      const day = parseInt(match[3], 10);
      const utcDate = new Date(Date.UTC(year, month, day));
      return utcDate.toLocaleDateString(locale, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        timeZone: 'UTC'
      });
    }
    const date = new Date(dateString);
    return date.toLocaleDateString(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch {
    return dateString;
  }
}

function comparePublishedAtDescending(left, right) {
  return Date.parse(right.publishedAt) - Date.parse(left.publishedAt)
    || left.id.localeCompare(right.id);
}

export function createPublicationSourceLinkPresentation(publication, title) {
  const links = Array.isArray(publication?.sourceLinks)
    ? publication.sourceLinks.map(link => ({ ...link }))
    : [];
  return links.length > 0 ? { linksTitle: title, links } : {};
}

export function formatArticleLinkMarkdown(link) {
  const summary = link.summary ? ` - ${link.summary}` : '';
  return `[${link.label}](${link.href})${summary}`;
}

export function getGlobalPulseArticleIds(publications) {
  return publications
    .filter(publication => publication.status === 'published'
      && publication.relatedProjectIds.length === 0)
    .map(publication => `pulse/${publication.slug}`);
}

const KIND_TRANSLATION_KEYS = Object.freeze({
  'retrospective': 'portfolio.pulse.type.retrospective',
  'research-note': 'portfolio.pulse.type.research-note',
  'update': 'portfolio.pulse.type.update',
  'release': 'portfolio.pulse.type.release',
  'field-note': 'portfolio.pulse.type.field-note'
});

export function renderPublicationCard(pub, locale, options = {}) {
  const localData = pub.locales?.[locale] || pub.locales?.en || {};
  const title = localData.title || '';
  const summary = localData.summary || '';
  const hrefBuilder = requireHrefBuilder(options);
  const canonicalUrl = hrefBuilder(pub.slug, locale);
  const kindKey = KIND_TRANSLATION_KEYS[pub.kind];
  if (!kindKey) {
    throw new TypeError(`Unsupported publication kind: ${pub.kind}`);
  }
  const kindLabel = localeMessage(locale, kindKey);
  const dateMeta = pub.publishedAt
    ? formatLocaleDate(pub.publishedAt, locale)
    : (pub.subjectPeriod || '');

  const dateHtml = pub.publishedAt
    ? `<time class="pulse-card-date" datetime="${escapeHtml(pub.publishedAt)}">${escapeHtml(dateMeta)}</time>`
    : `<span class="pulse-card-date">${escapeHtml(dateMeta)}</span>`;

  const readMoreText = localeMessage(locale, 'portfolio.pulse.readMore');

  return `
<article class="pulse-card" data-kind="${escapeHtml(pub.kind)}" data-id="${escapeHtml(pub.id)}">
  <a href="${escapeHtml(canonicalUrl)}" class="pulse-card-link-wrapper" data-publication-id="${escapeHtml(pub.id)}">
    <div class="pulse-card-header">
      <span class="pulse-card-type">${escapeHtml(kindLabel)}</span>
      ${dateHtml}
    </div>
    <h3 class="pulse-card-title">${escapeHtml(title)}</h3>
    <p class="pulse-card-summary">${escapeHtml(summary)}</p>
    <div class="pulse-card-footer">
      <span class="pulse-card-read-more">
        ${escapeHtml(readMoreText)}
        <span class="material-symbols-outlined" aria-hidden="true">arrow_forward</span>
      </span>
    </div>
  </a>
</article>
  `.trim();
}

export function renderGlobalFeed(publications, locale, options = {}) {
  const hrefBuilder = requireHrefBuilder(options);
  const publicPubs = publications.filter(pub => pub.status === 'published');
  const dated = publicPubs
    .filter(pub => pub.publishedAt !== null)
    .sort(comparePublishedAtDescending);
  const undated = publicPubs
    .filter(pub => pub.publishedAt === null);

  const emptyText = localeMessage(locale, 'portfolio.pulse.empty');
  const datedHtml = dated.length > 0 ? `
<section class="pulse-feed-section" id="latest-updates">
  <h2 class="pulse-section-heading">${escapeHtml(localeMessage(locale, 'portfolio.pulse.feedHeading'))}</h2>
  <div class="pulse-card-grid">
    ${dated.map(pub => renderPublicationCard(pub, locale, { hrefBuilder })).join('\n')}
  </div>
</section>
  `.trim() : '';

  let undatedHtml = '';
  if (undated.length > 0) {
    const legacyHeading = localeMessage(locale, 'portfolio.pulse.legacyGroup');
    undatedHtml = `
<section class="pulse-feed-section" id="historical-context">
  <h2 class="pulse-section-heading">${escapeHtml(legacyHeading)}</h2>
  <div class="pulse-card-grid">
    ${undated.map(pub => renderPublicationCard(pub, locale, { hrefBuilder })).join('\n')}
  </div>
</section>
    `.trim();
  }

  return `
<div class="pulse-feed">
  ${datedHtml}
  ${undatedHtml}
  ${dated.length === 0 && undated.length === 0
    ? `<p class="pulse-feed-empty">${escapeHtml(emptyText)}</p>`
    : ''}
</div>
  `.trim();
}

export function renderProjectUpdates(publications, projectId, locale, options = {}) {
  const hrefBuilder = requireHrefBuilder(options);
  const projectPubs = publications.filter(pub =>
    pub.status === 'published' &&
    pub.relatedProjectIds.includes(projectId)
  );
  if (projectPubs.length === 0) {
    return '';
  }
  const dated = projectPubs
    .filter(pub => pub.publishedAt !== null)
    .sort(comparePublishedAtDescending);
  const undated = projectPubs
    .filter(pub => pub.publishedAt === null);

  let datedSection = '';
  if (dated.length > 0) {
    const sectionTitle = localeMessage(locale, 'portfolio.pulse.projectSection');
    const publicationCount = new Intl.NumberFormat(locale).format(dated.length);
    const latestHeading = localeMessage(locale, 'portfolio.pulse.feedHeading');
    datedSection = `
<section class="pulse-project-updates" id="project-updates-section">
  <h2 class="pulse-project-updates-heading">${escapeHtml(`${sectionTitle} (${publicationCount})`)}</h2>
  <div class="pulse-project-updates-subgroup" id="project-latest-updates">
    <h3 class="pulse-project-updates-subheading">${escapeHtml(latestHeading)}</h3>
    <ul class="pulse-project-updates-list">
      ${dated.map(pub => {
        const canonicalUrl = hrefBuilder(pub.slug, locale);
        const title = pub.locales?.[locale]?.title || pub.locales?.en?.title || '';
        const dateStr = formatLocaleDate(pub.publishedAt, locale);
        return `
    <li class="pulse-project-updates-item" data-id="${escapeHtml(pub.id)}">
      <a href="${escapeHtml(canonicalUrl)}" class="pulse-project-update-link" data-publication-id="${escapeHtml(pub.id)}">
        <span class="pulse-project-update-title">${escapeHtml(title)}</span>
        <time class="pulse-project-update-meta" datetime="${escapeHtml(pub.publishedAt)}">${escapeHtml(dateStr)}</time>
      </a>
    </li>
      `.trim();
      }).join('\n')}
    </ul>
  </div>
</section>
    `.trim();
  }

  let historicalSection = '';
  if (undated.length > 0) {
    const legacyHeading = localeMessage(locale, 'portfolio.pulse.legacyGroup');
    historicalSection = `
<section class="pulse-project-updates" id="project-historical-context">
  <h2 class="pulse-project-updates-heading">${escapeHtml(legacyHeading)}</h2>
  <ul class="pulse-project-updates-list">
    ${undated.map(pub => {
      const canonicalUrl = hrefBuilder(pub.slug, locale);
      const title = pub.locales?.[locale]?.title || pub.locales?.en?.title || '';
      const periodStr = pub.subjectPeriod || '';
      return `
    <li class="pulse-project-updates-item" data-id="${escapeHtml(pub.id)}">
      <a href="${escapeHtml(canonicalUrl)}" class="pulse-project-update-link" data-publication-id="${escapeHtml(pub.id)}">
        <span class="pulse-project-update-title">${escapeHtml(title)}</span>
        <span class="pulse-project-update-meta">${escapeHtml(periodStr)}</span>
      </a>
    </li>
      `.trim();
    }).join('\n')}
  </ul>
</section>
    `.trim();
  }

  return [datedSection, historicalSection].filter(Boolean).join('\n');
}
