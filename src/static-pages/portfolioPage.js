import { getPage } from './getPage.js';
import { loadProjectEntries } from './data/projects.js';
import { PORTFOLIO_LOCALE_MESSAGES } from './data/portfolioTranslations.js';
import { resolvePublicationMetadata } from './data/publicationRoutes.js';

const projects = loadProjectEntries();
const PAGE_TITLE = PORTFOLIO_LOCALE_MESSAGES.en['portfolio.page.title'];

/**
 * @param {Object} [options]
 * @param {string} [options.basePath]
 * @param {string} [options.publicationId]
 * @returns {Promise<string>}
 */
export async function getPortfolioPage({
  basePath = './',
  publicationId,
} = {}) {
  let pageTitle = PAGE_TITLE;
  let pageDescription = undefined;
  let canonicalUrl = undefined;

  let robots = undefined;
  const metadata = resolvePublicationMetadata(publicationId, PAGE_TITLE);
  if (metadata) {
    if (metadata.title) pageTitle = metadata.title;
    pageDescription = metadata.description;
    canonicalUrl = metadata.canonicalUrl;
    if (metadata.primaryProjectId && basePath === '../../') {
      robots = 'noindex, follow';
    }
  }

  return getPage({
    BASE_PATH: basePath,
    TITLE: pageTitle,
    DESCRIPTION: pageDescription,
    CANONICAL_URL: canonicalUrl,
    ROBOTS: robots,
    publicationId,
    BODY_ATTRS: 'data-side-panel="off"',
    HEADER_CONTENT: /*html*/ `
      <button class="pulse-header-menu-button" type="button" aria-label="Open portfolio navigation" title="Open portfolio navigation">
        <span class="material-symbols-outlined" aria-hidden="true">folder</span>
      </button>
      <span class="pulse-header-title">${PAGE_TITLE}</span>
      <sn-segmented-control class="pulse-locale-toggle" name="portfolio-locale" aria-label="Portfolio language">
        <button type="button" value="en">EN</button>
        <button type="button" value="ru">RU</button>
        <button type="button" value="es">ES</button>
      </sn-segmented-control>
      <cascade-theme-widget class="pulse-theme-widget" share-label="Share theme"></cascade-theme-widget>
    `,
    CONTENT: /*html*/ `
      <script type="application/json" id="pulse-projects-data">${JSON.stringify(projects).replace(/</g, '\\u003c')}</script>
      <section class="pulse-screen" aria-label="Vladimir Matiasevich portfolio">
        <portfolio-workspace class="pulse-workspace"></portfolio-workspace>
      </section>
    `,
    FOOTER_CONTENT: /*html*/ `
      <span>Built with JSDA and symbiote-ui</span>
      <a href="https://github.com/MakerDrive/cv">GitHub source</a>
    `,
    SIDE_PANEL_ATTRS: 'disabled hidden',
  });
}

export default await getPortfolioPage();
