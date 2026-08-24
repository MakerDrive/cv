import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { getPage } from './getPage.js';
import { loadProjectEntries } from './data/projects.js';
import { PORTFOLIO_LOCALE_MESSAGES } from './data/portfolioTranslations.js';
import { resolvePublicationMetadata } from './data/publicationRoutes.js';
import { resolveSocialCardUrl } from './data/socialCards.js';
import {
  SOCIAL_CARD_HEIGHT,
  SOCIAL_CARD_WIDTH,
} from './data/socialCardPaths.js';
import { TOUR_STORY } from './data/tourScripts.js';

const projects = loadProjectEntries();
const PAGE_TITLE = PORTFOLIO_LOCALE_MESSAGES.en['portfolio.page.title'];
const RETIREMENT_COPY = Object.freeze({
  en: {
    title: 'Publication retired',
    description: 'This permalink is preserved for references to the former Pulse publication.',
    link: 'Open the canonical publication',
  },
  ru: {
    title: 'Публикация снята',
    description: 'Адрес сохранён для переходов к прежней публикации раздела Pulse.',
    link: 'Открыть каноническую публикацию',
  },
  es: {
    title: 'Publicación retirada',
    description: 'Esta dirección se conserva para referencias a la publicación anterior del Pulso.',
    link: 'Abrir la publicación canónica',
  },
});
const PORTFOLIO_HEADER_CONTROLS = /*html*/ `
  <span class="pulse-header-title">${PAGE_TITLE}</span>
  <button
    class="pulse-tour-button"
    type="button"
    aria-label="Interactive Tour"
    title="Interactive Tour"
  >
    <span class="material-symbols-outlined" aria-hidden="true">play_circle</span>
  </button>
  <sn-segmented-control
    class="pulse-locale-toggle"
    name="portfolio-locale"
    aria-label="Portfolio language"
  >
    <button type="button" value="en">EN</button>
    <button type="button" value="ru">RU</button>
    <button type="button" value="es">ES</button>
  </sn-segmented-control>
  <cascade-theme-widget
    class="pulse-theme-widget"
    share-label="Share theme"
  ></cascade-theme-widget>
`;

function escapeHtml(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function renderRetirementContent(targetUrl) {
  let localizedContent = Object.entries(RETIREMENT_COPY).map(([locale, copy]) => /*html*/ `
    <section lang="${locale}" data-retirement-locale="${locale}">
      <h1>${copy.title}</h1>
      <p>${copy.description}</p>
      <p><a href="${escapeHtml(targetUrl)}">${copy.link}</a></p>
    </section>
  `).join('');

  return localizedContent;
}

/**
 * @param {string} sourceUrl
 * @returns {string}
 */
export function resolveProjectPageId(sourceUrl) {
  let sourcePath = fileURLToPath(sourceUrl);
  let slug = path.basename(path.dirname(sourcePath));
  return `projects/${slug}`;
}

/**
 * @param {string} sourceUrl
 * @returns {Promise<string>}
 */
export function getProjectPage(sourceUrl) {
  return getPortfolioPage({
    basePath: '../../',
    projectId: resolveProjectPageId(sourceUrl),
  });
}

/**
 * @param {Object} [options]
 * @param {string} [options.basePath]
 * @param {string} [options.publicationId]
 * @param {string} [options.projectId]
 * @returns {Promise<string>}
 */
export async function getPortfolioPage({
  basePath = './',
  publicationId,
  projectId,
} = {}) {
  let pageTitle = PAGE_TITLE;
  let pageDescription = undefined;
  let canonicalUrl = undefined;

  let robots = undefined;
  let metadata = resolvePublicationMetadata(publicationId, PAGE_TITLE);
  if (metadata) {
    if (metadata.title) pageTitle = metadata.title;
    pageDescription = metadata.description;
    canonicalUrl = metadata.canonicalUrl;
    if (metadata.retired || (metadata.primaryProjectId && basePath === '../../')) {
      robots = 'noindex, follow';
    }
  } else if (publicationId) {
    robots = 'noindex, follow';
  } else if (projectId) {
    const projectSlug = projectId.replace(/^projects\//, '');
    const project = projects.find((entry) => entry.slug === projectSlug);
    if (project) {
      pageTitle = `${project.title} | ${PAGE_TITLE}`;
      pageDescription = project.summary;
    }
  }

  let isRetired = Boolean(metadata?.retired);
  let headerMenuButton = isRetired ? '' : /*html*/ `
      <button
        class="pulse-header-menu-button"
        type="button"
        aria-label="Open portfolio navigation"
        title="Open portfolio navigation"
      >
        <span class="material-symbols-outlined" aria-hidden="true">folder</span>
      </button>
    `;
  let headerContent = `${headerMenuButton}${PORTFOLIO_HEADER_CONTROLS}`;
  let content = isRetired
    ? renderRetirementContent(metadata.retirementTargetUrl)
    : /*html*/ `
      <script type="application/json" id="pulse-projects-data">
        ${JSON.stringify(projects).replace(/</g, '\\u003c')}
      </script>
      <script type="application/json" id="pulse-tour-story">
        ${JSON.stringify(TOUR_STORY).replace(/</g, '\\u003c')}
      </script>
      <section class="pulse-screen" aria-label="Vladimir Matiasevich portfolio">
        <portfolio-workspace class="pulse-workspace"></portfolio-workspace>
      </section>
    `;
  let socialCardId = metadata && !isRetired ? publicationId : projectId;

  return getPage({
    BASE_PATH: basePath,
    TITLE: pageTitle,
    DESCRIPTION: pageDescription,
    OG_IMAGE: metadata?.socialImage || resolveSocialCardUrl(socialCardId),
    OG_IMAGE_WIDTH: socialCardId ? SOCIAL_CARD_WIDTH : undefined,
    OG_IMAGE_HEIGHT: socialCardId ? SOCIAL_CARD_HEIGHT : undefined,
    CANONICAL_URL: canonicalUrl,
    ROBOTS: robots,
    publicationId,
    BODY_ATTRS: 'data-side-panel="off"',
    HEADER_CONTENT: headerContent,
    CONTENT: content,
    FOOTER_CONTENT: /*html*/ `
      <span>Built with JSDA and symbiote-ui</span>
      <a href="https://github.com/MakerDrive/cv">GitHub source</a>
    `,
    SIDE_PANEL_ATTRS: 'disabled hidden',
  });
}

export default await getPortfolioPage();
