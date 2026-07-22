if (!document.querySelector('side-panel[disabled]')) {
  await import('../../ui-components/universal/side-panel/logic.js');
}

import { socialLinks } from '../data/socialLinks.js';
import { PORTFOLIO_LOCALE_MESSAGES } from '../data/portfolioTranslations.js';
import { PROJECT_TRANSLATIONS } from '../data/projectTranslations.js';
import { getPublicPublications, getPublicationsByProject, PUBLICATIONS } from '../data/publications.js';
import {
  createPublicationSourceLinkPresentation,
  formatArticleLinkMarkdown,
  formatLocaleDate,
  getGlobalPulseArticleIds,
  renderGlobalFeed,
  renderProjectUpdates,
} from './feedPresentation.js';
import {
  createPortfolioEntryHref,
  createPortfolioNavigationEntries,
  createPortfolioTreeOccurrences,
  createPortfolioTreeStorageKey,
  resolvePortfolioTreeHighlightId,
  resolvePulseFocusIds,
  resolveProjectUpdatesSlotKey,
  resolvePulseKindMessageKey,
  buildPortfolioTreeProjection,
  resolvePortfolioEntryIdFromHref,
  shouldHandleInAppActivation,
  shouldHandlePulseInAppActivation,
} from './portfolioPulseRuntime.js';
import { PORTFOLIO_MEDIA_CATALOG } from '../data/portfolioMediaCatalog.js';
import {
  composePortfolioArticleMedia,
  composePortfolioPublicationMedia,
  createPortfolioArticleMediaAssignments,
  createPortfolioMediaFragmentId,
  createPortfolioMediaSlotKey,
  createPortfolioMediaNavigationUrl,
  getPortfolioAssignedMediaDescriptors,
  getPortfolioMediaIdFromFragment,
  resolvePortfolioMediaArticleTarget,
  stripPortfolioArticleBlockMarkers,
} from '../data/portfolioArticleMedia.js';
import {
  createPortfolioMediaGraphModel as buildPortfolioMediaGraphModel,
  createPortfolioMediaLeafNode,
  getProjectMediaDescriptors,
  getPortfolioMediaFit,
} from '../data/portfolioMediaGraph.js';
import {
  createPortfolioMediaFocusScheduler,
  PORTFOLIO_MEDIA_READING_ROOT_MARGIN,
  pickPortfolioActiveMediaId,
  resolvePortfolioMediaVisibilityChange,
} from '../data/portfolioMediaVisibility.js';
import { createPortfolioImsMediaAdapter } from './portfolioImsMediaAdapter.js';
import {
  capturePortfolioNavigationRuntimeState,
  createPortfolioNavigationController,
  initPortfolioThemeSharing,
  navigatePortfolioLocale,
  restorePortfolioNavigationRuntimeState,
  restorePortfolioNavigationPresentation,
  routePortfolioMediaArticle as routePortfolioMediaArticleSelection,
} from './portfolioThemeSharing.js';
import {
  PORTFOLIO_PROFILE_ITEM_ROUTES,
  PORTFOLIO_PROJECT_RELATIONS,
  PORTFOLIO_SKILL_PROJECT_RELATIONS,
} from '../data/portfolioRelations.js';
import {
  createPortfolioRelationEdge,
  createPortfolioRelationPlan,
} from '../data/portfolioRelationClassifier.js';
import {
  PORTFOLIO_CONTENT_SPLIT_RATIO,
  PORTFOLIO_DEFAULT_GRAPH_VIEW_MODE,
  PORTFOLIO_DEFAULT_STRUCTURED_LAYOUT,
  PORTFOLIO_GRAPH_PANEL_IMPORTANCE,
  PORTFOLIO_GRAPH_PANEL_MIN_INLINE_SIZE,
  PORTFOLIO_LAYOUT_MIN_INLINE_SIZE,
  PORTFOLIO_LAYOUT_RESPONSIVE_BREAKPOINT,
  PORTFOLIO_MEDIA_ACTIVE_NODE_SCALE,
  PORTFOLIO_MEDIA_FOCUS_ZOOM,
  PORTFOLIO_MEDIA_FORCE_LAYOUT_OPTIONS,
  PORTFOLIO_MEDIA_IMAGE_NODE_WEIGHT,
  PORTFOLIO_MEDIA_INFO_PANEL_SCALE,
  PORTFOLIO_MEDIA_PULSE_NODE_WEIGHT,
  PORTFOLIO_PROFILE_MEDIA_HUB_WEIGHT,
  PORTFOLIO_STRUCTURED_LAYOUT_IDS,
  PORTFOLIO_TREE_PANEL_IMPORTANCE,
  PORTFOLIO_TREE_PANEL_MIN_INLINE_SIZE,
  PORTFOLIO_VIEWER_PANEL_MIN_INLINE_SIZE,
  getPortfolioMediaHubWeight,
} from '../data/portfolioLayoutConfig.js';
import {
  PORTFOLIO_STRUCTURED_LAYOUT_ACTIONS,
  createPortfolioStructuredLayoutMenuActions,
  createPortfolioStructuredLayoutOptions,
  getPortfolioStructuredLayoutFromSearch,
  normalizePortfolioStructuredLayout,
  setPortfolioStructuredLayoutInUrl,
} from '../data/portfolioStructuredLayout.js';

const {
  CanvasGraph,
  Connection,
  Input,
  LayoutTree,
  Node,
  NodeEditor,
  Output,
  Socket,
  buildResourceTreeFromEntries,
  GRAPH_PATH_STYLE_MENU_ITEMS,
  createGraphPathStyleMenuActions,
  createGraphViewModeController,
  configureBrowserLocalization,
  ensureMaterialSymbols,
  highlightTreePath,
  resolveGraphPathStyleAction,
  resolveInitialGraphViewMode,
  registerMediaProvider,
  setTreeItems,
  setupTreePanel,
  showTree,
  translate,
} = await import('symbiote-ui/ui');

registerMediaProvider('ims', createPortfolioImsMediaAdapter());

const PORTFOLIO_LOCALE_STORAGE_KEY = 'cv-portfolio-locale';
const PORTFOLIO_SUPPORTED_LOCALES = ['en', 'ru', 'es'];
const PORTFOLIO_LINKEDIN_URL = 'https://www.linkedin.com/in/v-matiasevich/';
const PORTFOLIO_TELEGRAM_URL = 'https://t.me/text2code';
const PORTFOLIO_ONLINE_CV_URL = 'https://MakerDrive.github.io/cv/';
const PORTFOLIO_PDF_DOWNLOADS = Object.freeze([
  { locale: 'en', href: 'downloads/vladimir-matiasevich-cv-en.pdf' },
  { locale: 'ru', href: 'downloads/vladimir-matiasevich-cv-ru.pdf' },
  { locale: 'es', href: 'downloads/vladimir-matiasevich-cv-es.pdf' },
]);

function normalizePortfolioLocale(value) {
  let locale = String(value || '').trim().toLowerCase();
  return PORTFOLIO_SUPPORTED_LOCALES.includes(locale) ? locale : '';
}

function getStoredPortfolioLocale() {
  try {
    let storage = globalThis.localStorage;
    return normalizePortfolioLocale(storage?.getItem?.(PORTFOLIO_LOCALE_STORAGE_KEY));
  } catch {
    return '';
  }
}

function setStoredPortfolioLocale(locale) {
  try {
    globalThis.localStorage?.setItem?.(PORTFOLIO_LOCALE_STORAGE_KEY, locale);
    return true;
  } catch {
    return false;
  }
}

function getQueryPortfolioLocale() {
  if (typeof location === 'undefined') return '';
  let urlParams = new URLSearchParams(location.search);
  return normalizePortfolioLocale(urlParams.get('lang'));
}

function getInitialPortfolioLocale() {
  return getQueryPortfolioLocale() || getStoredPortfolioLocale();
}

function applyPortfolioDocumentLocale(locale) {
  let html = document.documentElement;
  html.lang = locale;
  html.dataset.locale = locale;
}

let initialPortfolioLocale = getInitialPortfolioLocale();
let portfolioLocalization = configureBrowserLocalization({
  force: true,
  messages: PORTFOLIO_LOCALE_MESSAGES,
  ...(initialPortfolioLocale ? { locale: initialPortfolioLocale, explicit: true } : {}),
});
applyPortfolioDocumentLocale(portfolioLocalization.locale);

function tPortfolio(key, params = {}) {
  return translate(`portfolio.${key}`, params);
}

const PORTFOLIO_STRUCTURED_LAYOUT_MESSAGES = Object.freeze({
  'graph.layoutGroup': () => tPortfolio('graph.layoutGroup'),
  'graph.layout.crystal': () => tPortfolio('graph.layout.crystal'),
  'graph.layout.crystalTitle': () => tPortfolio('graph.layout.crystalTitle'),
  'graph.layout.auto': () => tPortfolio('graph.layout.auto'),
  'graph.layout.autoTitle': () => tPortfolio('graph.layout.autoTitle'),
  'graph.layout.tree': () => tPortfolio('graph.layout.tree'),
  'graph.layout.treeTitle': () => tPortfolio('graph.layout.treeTitle'),
});

function translatePortfolioStructuredLayout(key) {
  let resolver = PORTFOLIO_STRUCTURED_LAYOUT_MESSAGES[key];
  if (!resolver) {
    throw new Error(`Unknown structured layout message "${key}".`);
  }
  return resolver();
}

function getProfileOnlineCvUrl(locale = portfolioLocalization.locale) {
  let url = new URL(PORTFOLIO_ONLINE_CV_URL);
  url.searchParams.set('lang', normalizePortfolioLocale(locale) || 'en');
  return url.href;
}

function getProfileContactText() {
  let links = [];
  if (PORTFOLIO_TELEGRAM_URL) links.push(`[Telegram](${PORTFOLIO_TELEGRAM_URL})`);
  links.push(`[LinkedIn](${PORTFOLIO_LINKEDIN_URL})`);
  return links.join(' · ');
}

function getProfileMetaText() {
  return [
    '|  |  |',
    '| --- | --- |',
    `| **${tPortfolio('profile.statusTitle')}** | ${tPortfolio('profile.statusDetails')} |`,
    `| **${tPortfolio('profile.locationLabel')}** | ${tPortfolio('profile.locationValue')} |`,
    `| **${tPortfolio('profile.availabilityLabel')}** | ${tPortfolio('profile.availability')} |`,
    `| **${tPortfolio('profile.languagesLabel')}** | ${tPortfolio('profile.languagesValue')} |`,
    `| **${tPortfolio('profile.experienceLabel')}** | ${tPortfolio('profile.experienceSummary')} |`,
    `| **${tPortfolio('profile.contactLabel')}** | ${getProfileContactText()} |`,
    `| **CV** | [${tPortfolio('profile.onlineCv')}](${getProfileOnlineCvUrl()}) |`,
  ].join('\n');
}

function getProfileSections() {
  return [
    {
      title: tPortfolio('profile.professionalTitle'),
      body: tPortfolio('profile.details'),
    },
    {
      title: tPortfolio('profile.collaborationTitle'),
      body: tPortfolio('profile.workFormatDetails'),
    },
    {
      title: tPortfolio('profile.expertiseTitle'),
      items: [
        {
          label: tPortfolio('profile.expertise.ai.label'),
          details: tPortfolio('profile.expertise.ai.details'),
        },
        {
          label: tPortfolio('profile.expertise.fullStack.label'),
          details: tPortfolio('profile.expertise.fullStack.details'),
        },
        {
          label: tPortfolio('profile.expertise.rnd.label'),
          details: tPortfolio('profile.expertise.rnd.details'),
        },
        {
          label: tPortfolio('profile.expertise.hardware.label'),
          details: tPortfolio('profile.expertise.hardware.details'),
        },
      ],
    },
    {
      title: tPortfolio('profile.impactTitle'),
      items: [
        {
          label: tPortfolio('profile.impact.aiTooling.label'),
          details: tPortfolio('profile.impact.aiTooling.details'),
          href: getPortfolioEntryHref(PORTFOLIO_PROFILE_ITEM_ROUTES.impact.aiTooling),
        },
        {
          label: tPortfolio('profile.impact.museumScanning.label'),
          details: tPortfolio('profile.impact.museumScanning.details'),
          href: getPortfolioEntryHref(PORTFOLIO_PROFILE_ITEM_ROUTES.impact.museumScanning),
        },
        {
          label: tPortfolio('profile.impact.hardware.label'),
          details: tPortfolio('profile.impact.hardware.details'),
          href: getPortfolioEntryHref(PORTFOLIO_PROFILE_ITEM_ROUTES.impact.hardware),
        },
        {
          label: tPortfolio('profile.impact.mediaProduction.label'),
          details: tPortfolio('profile.impact.mediaProduction.details'),
          href: getPortfolioEntryHref(PORTFOLIO_PROFILE_ITEM_ROUTES.impact.mediaProduction),
        },
      ],
    },
    {
      title: tPortfolio('profile.productsTitle'),
      body: tPortfolio('profile.productsIntro'),
      items: [
        {
          label: tPortfolio('profile.product.agentToolchain.label'),
          details: tPortfolio('profile.product.agentToolchain.details'),
          href: getPortfolioEntryHref(PORTFOLIO_PROFILE_ITEM_ROUTES.products.agentToolchain),
        },
        {
          label: tPortfolio('profile.product.symbiote.label'),
          details: tPortfolio('profile.product.symbiote.details'),
          href: getPortfolioEntryHref(PORTFOLIO_PROFILE_ITEM_ROUTES.products.symbiote),
        },
        {
          label: tPortfolio('profile.product.videoStudio.label'),
          details: tPortfolio('profile.product.videoStudio.details'),
          href: getPortfolioEntryHref(PORTFOLIO_PROFILE_ITEM_ROUTES.products.videoStudio),
        },
        {
          label: tPortfolio('profile.product.messaging.label'),
          details: tPortfolio('profile.product.messaging.details'),
          href: getPortfolioEntryHref(PORTFOLIO_PROFILE_ITEM_ROUTES.products.messaging),
        },
        {
          label: tPortfolio('profile.product.hardware.label'),
          details: tPortfolio('profile.product.hardware.details'),
          href: getPortfolioEntryHref(PORTFOLIO_PROFILE_ITEM_ROUTES.products.hardware),
        },
        {
          label: tPortfolio('profile.product.photopizza.label'),
          details: tPortfolio('profile.product.photopizza.details'),
          href: getPortfolioEntryHref(PORTFOLIO_PROFILE_ITEM_ROUTES.products.photopizza),
        },
        {
          label: tPortfolio('profile.product.objetArt.label'),
          details: tPortfolio('profile.product.objetArt.details'),
          href: getPortfolioEntryHref(PORTFOLIO_PROFILE_ITEM_ROUTES.products.objetArt),
        },
        {
          label: tPortfolio('profile.product.boothbot.label'),
          details: tPortfolio('profile.product.boothbot.details'),
          href: getPortfolioEntryHref(PORTFOLIO_PROFILE_ITEM_ROUTES.products.boothbot),
        },
      ],
    },
    {
      title: tPortfolio('profile.experienceTitle'),
      items: [
        {
          label: tPortfolio('profile.role.rndPro.label'),
          details: tPortfolio('profile.role.rndPro.details'),
          href: 'https://rnd-pro.com/',
        },
        {
          label: tPortfolio('profile.role.f360.label'),
          details: tPortfolio('profile.role.f360.details'),
          href: getPortfolioEntryHref(PORTFOLIO_PROFILE_ITEM_ROUTES.experience.f360),
        },
        {
          label: tPortfolio('profile.role.megavisor.label'),
          details: tPortfolio('profile.role.megavisor.details'),
          href: getPortfolioEntryHref(PORTFOLIO_PROFILE_ITEM_ROUTES.experience.megavisor),
        },
        {
          label: tPortfolio('profile.role.ziq.label'),
          details: tPortfolio('profile.role.ziq.details'),
        },
      ],
    },
  ];
}

const THEME_CONTROL_LABEL_GETTERS = Object.freeze({
  brightness: () => tPortfolio('theme.control.brightness'),
  contrast: () => tPortfolio('theme.control.contrast'),
  chroma: () => tPortfolio('theme.control.chroma'),
  hue: () => tPortfolio('theme.control.hue'),
  pattern: () => tPortfolio('theme.control.pattern'),
});
const CANVAS_GRAPH_TYPE_LABEL_GETTERS = Object.freeze({
  data: () => tPortfolio('graph.type.data'),
  action: () => tPortfolio('graph.type.action'),
  output: () => tPortfolio('graph.type.output'),
  config: () => tPortfolio('graph.type.config'),
  external: () => tPortfolio('graph.type.external'),
  style: () => tPortfolio('graph.type.style'),
  docs: () => tPortfolio('graph.type.docs'),
  asset: () => tPortfolio('graph.type.asset'),
  group: () => tPortfolio('graph.type.group'),
});
const PANEL_MENU_GROUP_LABEL_GETTERS = Object.freeze({
  layout: () => tPortfolio('layout.menu.layout'),
  path: () => tPortfolio('layout.menu.connections'),
  graph: () => tPortfolio('layout.menu.graph'),
  panel: () => tPortfolio('layout.menu.panel'),
});
const PANEL_MENU_ACTION_LABEL_GETTERS = Object.freeze({
  'layout:split-horizontal': () => [tPortfolio('layout.action.splitHorizontal'), tPortfolio('layout.action.splitHorizontalTitle')],
  'layout:split-vertical': () => [tPortfolio('layout.action.splitVertical'), tPortfolio('layout.action.splitVerticalTitle')],
  'layout:duplicate': () => [tPortfolio('layout.action.duplicate'), tPortfolio('layout.action.duplicateTitle')],
  'layout:collapse-toggle': () => [tPortfolio('layout.action.collapse'), tPortfolio('layout.action.collapseTitle')],
  'layout:remove': () => [tPortfolio('layout.action.remove'), tPortfolio('layout.action.removeTitle')],
  'layout:close-ui-panel': () => [tPortfolio('layout.action.close'), tPortfolio('layout.action.closeTitle')],
  'layout:remove-ui-panel': () => [tPortfolio('layout.action.removeTemporary'), tPortfolio('layout.action.removeTemporaryTitle')],
});
let portfolioChromeLocalizationFrame = 0;
let portfolioChromeObserver = null;

function setLocalizedText(element, value) {
  if (element && element.textContent !== value) element.textContent = value;
}

function setLocalizedAttribute(element, name, value) {
  if (element && element.getAttribute(name) !== value) element.setAttribute(name, value);
}

function setLocalizedButtonChrome(element, label) {
  setLocalizedAttribute(element, 'title', label);
  setLocalizedAttribute(element, 'aria-label', label);
}

function localizePortfolioThemeWidget() {
  setLocalizedAttribute(
    document.querySelector('.pulse-theme-widget'),
    'share-label',
    tPortfolio('theme.share')
  );
  for (let widget of document.querySelectorAll('cascade-theme-widget')) {
    let triggerLabel = widget.querySelector('.ctw-trigger-label');
    let trigger = widget.querySelector('.ctw-trigger');
    setLocalizedText(triggerLabel, tPortfolio('panel.theme'));
    setLocalizedButtonChrome(trigger, tPortfolio('theme.quickControls'));
  }

  for (let popover of document.querySelectorAll('.ctw-popover')) {
    setLocalizedAttribute(popover, 'aria-label', tPortfolio('theme.quickControls'));
    setLocalizedText(popover.querySelector('.ctw-header strong'), tPortfolio('panel.theme'));
    setLocalizedButtonChrome(popover.querySelector('[data-action="copy"]'), tPortfolio('theme.copy'));
    setLocalizedButtonChrome(popover.querySelector('[data-action="reset"]'), tPortfolio('theme.reset'));
    setLocalizedButtonChrome(popover.querySelector('[data-action="open-full"]'), tPortfolio('theme.openFull'));
    setLocalizedAttribute(popover.querySelector('.ctw-mode'), 'aria-label', tPortfolio('theme.mode'));
    setLocalizedText(popover.querySelector('[data-theme-mode="dark"]'), tPortfolio('theme.dark'));
    setLocalizedText(popover.querySelector('[data-theme-mode="light"]'), tPortfolio('theme.light'));

    for (let [controlName, getLabel] of Object.entries(THEME_CONTROL_LABEL_GETTERS)) {
      setLocalizedText(popover.querySelector(`label[for="ctw-${controlName}"]`), getLabel());
    }
  }
}

function localizePortfolioLayoutChrome() {
  for (let button of document.querySelectorAll('.panel-menu-toggle')) {
    setLocalizedButtonChrome(button, tPortfolio('layout.panelActions'));
  }
  for (let panel of document.querySelectorAll('sn-tree-panel.portfolio-tree')) {
    setLocalizedAttribute(panel, 'aria-label', tPortfolio('tree.navigation'));
    setLocalizedAttribute(panel, 'title', tPortfolio('tree.navigation'));
  }
  for (let [groupId, getLabel] of Object.entries(PANEL_MENU_GROUP_LABEL_GETTERS)) {
    for (let row of document.querySelectorAll(`[data-menu-group="${groupId}"]`)) {
      setLocalizedText(row.querySelector('.panel-menu-row-label'), getLabel());
    }
  }
  for (let [actionId, getLabels] of Object.entries(PANEL_MENU_ACTION_LABEL_GETTERS)) {
    let [label, title] = getLabels();
    for (let button of document.querySelectorAll(`[data-menu-action-id="${actionId}"]`)) {
      setLocalizedText(button.querySelector('.panel-menu-action-label'), label);
      setLocalizedButtonChrome(button, title);
    }
  }
}

function localizePortfolioChrome() {
  localizePortfolioThemeWidget();
  localizePortfolioLayoutChrome();
}

function schedulePortfolioChromeLocalization() {
  if (portfolioChromeLocalizationFrame) return;
  let scheduleFrame = globalThis.requestAnimationFrame || globalThis.setTimeout;
  portfolioChromeLocalizationFrame = scheduleFrame(() => {
    portfolioChromeLocalizationFrame = 0;
    localizePortfolioChrome();
  });
}

function onPortfolioCascadeThemeChange() {
  schedulePortfolioChromeLocalization();
}

function startPortfolioChromeLocalization() {
  localizePortfolioChrome();
  for (let tagName of ['cascade-theme-widget', 'panel-layout', 'sn-tree-panel']) {
    customElements.whenDefined(tagName).then(schedulePortfolioChromeLocalization).catch(() => {});
  }
  document.addEventListener('cascade-theme-change', onPortfolioCascadeThemeChange);
  document.addEventListener('cascade-theme-open-full', schedulePortfolioChromeLocalization);
  if (typeof MutationObserver !== 'function' || portfolioChromeObserver || !document.body) return;
  portfolioChromeObserver = new MutationObserver(schedulePortfolioChromeLocalization);
  portfolioChromeObserver.observe(document.body, {
    attributes: true,
    attributeFilter: ['aria-label', 'class', 'hidden', 'title'],
    childList: true,
    subtree: true,
  });
}

function getPortfolioCanvasGraphTypeLabel(type) {
  return CANVAS_GRAPH_TYPE_LABEL_GETTERS[type]?.() || type;
}

function buildPortfolioFlatGraphInfoLines(graph, node) {
  let lines = [];
  lines.push(node.label);
  if (node.id !== node.label) lines.push(node.id);
  lines.push('');
  lines.push(`${tPortfolio('graph.info.type')}: ${getPortfolioCanvasGraphTypeLabel(node.type)}`);

  let connections = graph.adjMap?.get?.(node.id)?.size || 0;
  if (connections > 0) lines.push(`${tPortfolio('graph.info.connections')}: ${connections}`);
  if (node.children?.length > 0) lines.push(`${tPortfolio('graph.info.children')}: ${node.children.length}`);
  if (Array.isArray(node.exports) && node.exports.length > 0) {
    lines.push('');
    lines.push(`${tPortfolio('graph.info.exports')}:`);
    for (let item of node.exports.slice(0, 8)) lines.push(`  ${item}`);
    if (node.exports.length > 8) lines.push(`  ... +${node.exports.length - 8}`);
  }
  if (node.lines) lines.push(`${tPortfolio('graph.info.lines')}: ${node.lines}`);
  return lines;
}

function getSocialLinkSummary(summaryKey) {
  switch (summaryKey) {
    case 'social.facebook.summary':
      return tPortfolio('social.facebook.summary');
    case 'social.github.summary':
      return tPortfolio('social.github.summary');
    case 'social.linkedin.summary':
      return tPortfolio('social.linkedin.summary');
    case 'social.youtube.summary':
      return tPortfolio('social.youtube.summary');
    default:
      return '';
  }
}

function getPortfolioPdfDownloadLabel(locale) {
  switch (locale) {
    case 'en':
      return tPortfolio('pdf.en');
    case 'ru':
      return tPortfolio('pdf.ru');
    case 'es':
      return tPortfolio('pdf.es');
    default:
      return tPortfolio('pdf.downloads');
  }
}

document.title = tPortfolio('page.title');
document.querySelector('.pulse-header-title')?.replaceChildren(tPortfolio('page.title'));
let localeToggle = /** @type {any} */ (document.querySelector('.pulse-locale-toggle'));
let headerMenuButton = document.querySelector('.pulse-header-menu-button');
headerMenuButton?.setAttribute('aria-label', tPortfolio('header.openMaterials'));
headerMenuButton?.setAttribute('title', tPortfolio('header.openMaterials'));
localeToggle?.setAttribute('aria-label', tPortfolio('header.language'));
localeToggle?.setAttribute('title', tPortfolio('header.language'));
localeToggle?.setAttribute('value', portfolioLocalization.locale);
function openMaterialsDrawerFromHeader() {
  document.dispatchEvent(new CustomEvent('portfolio-open-materials', {
    detail: { source: 'portfolio-header' },
  }));
}
function setPortfolioLocale(locale) {
  locale = normalizePortfolioLocale(locale);
  if (!locale) {
    if (localeToggle) localeToggle.value = portfolioLocalization.locale;
    return false;
  }
  if (locale === portfolioLocalization.locale) {
    if (localeToggle) localeToggle.value = portfolioLocalization.locale;
    return true;
  }
  if (typeof location === 'undefined') {
    setStoredPortfolioLocale(locale);
    return true;
  }
  return navigatePortfolioLocale({
    locale,
    currentLocale: portfolioLocalization.locale,
    control: localeToggle,
    currentUrl: location.href,
    prepareNavigationUrl: (url) => themeSharingController
      ? themeSharingController.prepareNavigationUrl(url)
      : url,
    setStoredLocale: setStoredPortfolioLocale,
    assign: (href) => globalThis.location.assign(href),
  });
}
headerMenuButton?.addEventListener('click', (event) => {
  event.preventDefault();
  event.stopPropagation();
  openMaterialsDrawerFromHeader();
});
localeToggle?.addEventListener('sn-segmented-change', (event) => {
  let locale = normalizePortfolioLocale(event.detail?.value);
  if (localeToggle && locale) localeToggle.value = locale;
  if (!setPortfolioLocale(locale) && localeToggle) {
    localeToggle.value = portfolioLocalization.locale;
  }
});
document.addEventListener('click', (event) => {
  let target = event.target;
  if (target instanceof Element && target.closest('.pulse-header-menu-button')) {
    event.preventDefault();
    openMaterialsDrawerFromHeader();
    return;
  }

  const path = typeof event.composedPath === 'function' ? event.composedPath() : [event.target];
  const anchor = /** @type {HTMLAnchorElement | undefined} */ (
    path.find((el) => el instanceof HTMLAnchorElement || (el && typeof el === 'object' && 'nodeName' in el && el.nodeName === 'A'))
  );
  if (!anchor) return;

  const targetId = shouldHandleInAppActivation(event, anchor, {
    entries: portfolioRuntime?.entries,
    basePath: getPortfolioBasePath(),
  });

  if (targetId && portfolioRuntime?.entries?.has(targetId)) {
    event.preventDefault();
    if (anchor.getAttribute('target') === '_blank') {
      anchor.removeAttribute('target');
    }
    portfolioRuntime.select(targetId, { focus: true });
  }
}, true);
document.querySelector('.pulse-screen')?.setAttribute('aria-label', tPortfolio('page.aria'));

startPortfolioChromeLocalization();

let themeSharingController = initPortfolioThemeSharing();

const TREE_STORAGE_KEY = createPortfolioTreeStorageKey(portfolioLocalization.locale);
const projectsElement = document.getElementById('pulse-projects-data');
const projects = projectsElement ? JSON.parse(projectsElement.textContent || '[]') : [];
const publicPublications = getPublicPublications();
const publicArticleEntryIds = new Set([
  ...projects.map((project) => `projects/${project.slug}`),
  ...publicPublications.map((publication) => publication.id),
]);
const portfolioArticleMediaAssignments = createPortfolioArticleMediaAssignments(
  PORTFOLIO_MEDIA_CATALOG,
  publicArticleEntryIds,
);
const INITIAL_FOCUS_IDS = [
  'profile/photo',
  'bio/about',
  'projects/index',
  'skills/index',
];

const relationSocket = new Socket('portfolio', {
  color: 'var(--sn-conn-color, var(--pulse-accent))',
});

const skillEntries = [
  {
    id: 'skills/agentic-ai',
    label: tPortfolio('skill.agenticAi.label'),
    icon: 'account_tree',
    category: 'server',
    summary: tPortfolio('skill.agenticAi.summary'),
    details: tPortfolio('skill.agenticAi.details'),
  },
  {
    id: 'skills/rnd-engineering',
    label: tPortfolio('skill.rnd.label'),
    icon: 'science',
    category: 'server',
    summary: tPortfolio('skill.rnd.summary'),
    details: tPortfolio('skill.rnd.details'),
  },
  {
    id: 'skills/product-ui',
    label: tPortfolio('skill.productUi.label'),
    icon: 'web_asset',
    category: 'module',
    summary: tPortfolio('skill.productUi.summary'),
    details: tPortfolio('skill.productUi.details'),
  },
  {
    id: 'skills/hardware-capture',
    label: tPortfolio('skill.hardwareCapture.label'),
    icon: 'precision_manufacturing',
    category: 'instance',
    summary: tPortfolio('skill.hardwareCapture.summary'),
    details: tPortfolio('skill.hardwareCapture.details'),
  },
];

const PROJECT_TREE_GROUPS = [
  {
    id: 'agentic-ai',
    label: tPortfolio('skill.agenticAi.label'),
    treeLabel: tPortfolio('projectGroup.agenticAi.label'),
    icon: 'account_tree',
    skillId: 'skills/agentic-ai',
    slugs: new Set([
      'agent-portal',
      'mcp-agent-portal',
      'project-graph-mcp',
      'agent-pool-mcp',
      'browser-x-mcp',
      'context-x-mcp',
      'terminal-x-mcp',
      'symbiote-workspace',
      'symbiote-engine',
    ]),
  },
  {
    id: 'product-ui',
    label: tPortfolio('skill.productUi.label'),
    treeLabel: tPortfolio('projectGroup.productUi.label'),
    icon: 'web_asset',
    skillId: 'skills/product-ui',
    slugs: new Set([
      'symbiote-video-studio',
      'megavisor',
      'lifecycle-messaging-platform',
      'symbiote-ui',
      'photopizza-remote',
      'photosnail-public',
    ]),
  },
  {
    id: 'archive',
    label: tPortfolio('projectGroup.archive.label'),
    treeLabel: tPortfolio('projectGroup.archive.label'),
    icon: 'history',
    skillId: 'skills/rnd-engineering',
    slugs: new Set([
      'symbiote-node',
    ]),
  },
  {
    id: 'hardware-capture',
    label: tPortfolio('skill.hardwareCapture.label'),
    treeLabel: tPortfolio('projectGroup.hardware.label'),
    icon: 'precision_manufacturing',
    skillId: 'skills/hardware-capture',
    slugs: new Set([
      'autobox-v1',
      'f360-studio',
      'complexscan',
      'boothbot',
      'photopizza',
    ]),
  },
];

const PROJECT_TREE_GROUP_PRIORITIES = Object.freeze({
  'agentic-ai': [
    'agent-portal',
    'symbiote-workspace',
    'symbiote-engine',
    'project-graph-mcp',
    'agent-pool-mcp',
  ],
});

function getProjectTreeGroup(project) {
  return PROJECT_TREE_GROUPS.find((group) => group.slugs.has(project.slug)) || PROJECT_TREE_GROUPS[0];
}

function getProjectTreeGroupLabel(group) {
  return group.treeLabel || group.label;
}

function orderProjectsForTree(projectItems) {
  let originalIndex = new Map(projectItems.map((project, index) => [project.slug, index]));
  return [...projectItems].sort((a, b) => {
    let groupA = getProjectTreeGroup(a);
    let groupB = getProjectTreeGroup(b);
    if (groupA.id !== groupB.id) {
      return (originalIndex.get(a.slug) ?? 0) - (originalIndex.get(b.slug) ?? 0);
    }

    let priority = PROJECT_TREE_GROUP_PRIORITIES[groupA.id];
    if (!priority) {
      return (originalIndex.get(a.slug) ?? 0) - (originalIndex.get(b.slug) ?? 0);
    }

    let orderA = priority.indexOf(a.slug);
    let orderB = priority.indexOf(b.slug);
    let rankA = orderA === -1 ? Number.MAX_SAFE_INTEGER : orderA;
    let rankB = orderB === -1 ? Number.MAX_SAFE_INTEGER : orderB;
    return rankA - rankB || (originalIndex.get(a.slug) ?? 0) - (originalIndex.get(b.slug) ?? 0);
  });
}

function getSkillIdsForProject(project) {
  let text = `${project.title} ${project.summary}`.toLowerCase();
  let result = ['skills/rnd-engineering'];
  if (/agent|agentic|mcp|model routing|ai-assisted|code-intelligence|developer/.test(text)) {
    result.push('skills/agentic-ai');
  }
  if (/video|editor|ui|media|studio|interface|publishing|workspace|web component|platform|marketing|campaign|customer|crm/.test(text)) {
    result.push('skills/product-ui');
  }
  if (/robot|scan|360|photo|capture|turntable|hardware|photogrammetry|booth|equipment|3d/.test(text)) {
    result.push('skills/hardware-capture');
  }
  return result;
}

const PROJECT_LINK_SUMMARY_GETTERS = Object.freeze({
  'Public source repository': () => tPortfolio('project.linkSummary.publicSourceRepository'),
  'Published npm package': () => tPortfolio('project.linkSummary.publishedNpmPackage'),
  'YouTube channel with photogrammetry and capture workflow demos': () => tPortfolio('project.linkSummary.youtubePhotogrammetry'),
  'YouTube channel with product updates and demos': () => tPortfolio('project.linkSummary.youtubeProductUpdates'),
  'Cultural heritage platform': () => tPortfolio('project.linkSummary.culturalHeritagePlatform'),
  'Cultural-heritage 3D visualizations': () => tPortfolio('project.linkSummary.culturalHeritageVisualizations'),
  'Hermitage netsuke scanning story': () => tPortfolio('project.linkSummary.hermitageNetsukeStory'),
  'Benin bronze digitization record': () => tPortfolio('project.linkSummary.beninDigitization'),
  'F360 Studio 3D model portfolio': () => tPortfolio('project.linkSummary.f360Sketchfab'),
});

function getProjectTranslation(project) {
  return PROJECT_TRANSLATIONS[portfolioLocalization.locale]?.[project.slug] || {};
}

function getProjectKicker(project) {
  let translation = getProjectTranslation(project);
  if (translation.kicker) return translation.kicker;

  let kicker = String(project?.kicker || '').trim();
  if (kicker === 'Selected project') return tPortfolio('project.kicker.selected');
  if (kicker === 'Author project') return tPortfolio('project.kicker.author');
  return kicker || project?.date || '';
}

function getProjectSummary(project) {
  return getProjectTranslation(project).summary || project.summary || '';
}

function getProjectDetails(project) {
  return getProjectTranslation(project).details || project.details || '';
}

function getProjectLinkLabel(project) {
  let label = String(project?.linkLabel || '').trim();
  if (!label || label === 'View project') return tPortfolio('link.learnMore');
  if (label === 'View repository') return tPortfolio('link.viewRepository');
  return label;
}

function getProjectLinkSummary(summary) {
  return PROJECT_LINK_SUMMARY_GETTERS[summary]?.() || summary;
}

function getProjectLinks(project) {
  return (project.links || []).map((item) => ({
    ...item,
    summary: getProjectLinkSummary(item.summary),
  }));
}

function _resolveBasePath() {
  if (typeof document === 'undefined' || typeof location === 'undefined') return '/';
  let base = document.querySelector('base')?.getAttribute('href') || './';
  let pathname = new URL(base, location.href).pathname;
  return pathname.endsWith('/') ? pathname : `${pathname}/`;
}

const _cachedBasePath = _resolveBasePath();

function getPortfolioBasePath() {
  return _cachedBasePath;
}

function getPortfolioEntryHref(id) {
  return createPortfolioEntryHref(id, {
    basePath: getPortfolioBasePath(),
    locale: portfolioLocalization.locale,
  });
}

function protectMarkdownLinkTargets(markdown) {
  return String(markdown || '').replace(/\]\(([^)\n]+)\)/g, (match, href) => `](${href.replaceAll('_', '%5F')})`);
}

function createMarkdown(entry, { interactive = true } = {}) {
  if (entry.id === 'pulse/index') {
    let lines = [
      `# ${entry.label}`,
      '',
      entry.summary || '',
      '',
      ':::content-slot pulse-feed'
    ];
    return protectMarkdownLinkTargets(lines.join('\n').trim());
  }

  let article = entry.type === 'pulse'
    ? composePortfolioPublicationMedia({
        summary: entry.summary,
        details: entry.details,
        descriptors: entry.mediaDescriptors,
        interactive,
      })
    : interactive
      ? composePortfolioArticleMedia({
          slug: entry.mediaSlug,
          summary: entry.summary,
          details: entry.details,
          descriptors: entry.mediaDescriptors,
        })
      : {
          summary: entry.summary,
          details: stripPortfolioArticleBlockMarkers(entry.details),
        };
  let lines = [`# ${entry.label}`, ''];
  if (entry.period) {
    lines.push(entry.period, '');
  }
  if (entry.kicker) {
    lines.push(`**${entry.kicker}**`, '');
  }
  lines.push(article.summary || tPortfolio('node.fallback'), '');
  if (entry.meta) {
    lines.push(entry.meta, '');
  }
  if (article.details) {
    lines.push(article.details, '');
  }
  if (entry.sections?.length) {
    for (let section of entry.sections) {
      lines.push(`## ${section.title}`, '');
      if (section.body) lines.push(section.body, '');
      for (let item of section.items || []) {
        const label = item.href ? `**[${item.label}](${item.href})**` : `**${item.label}**`;
        lines.push(label, '', item.details, '');
      }
    }
  }
  if (entry.downloads?.length) {
    lines.push(`## ${entry.downloadsTitle || tPortfolio('pdf.downloads')}`, '');
    for (let item of entry.downloads) {
      lines.push(`[${item.label}](${item.href})`, '');
    }
  }
  if (entry.links?.length) {
    lines.push(`## ${entry.linksTitle || tPortfolio('profile.links')}`, '');
    for (let item of entry.links) {
      lines.push(formatArticleLinkMarkdown(item), '');
    }
  }
  if (entry.href) {
    lines.push(`[${entry.linkLabel || tPortfolio('link.learnMore')}](${entry.href})`, '');
  }
  if (entry.projectUpdatesSlot) {
    lines.push(`:::content-slot ${entry.projectUpdatesSlot}`, '');
  }
  if (entry.related?.length) {
    lines.push(`## ${entry.relatedTitle || tPortfolio('markdown.related')}`, '');
    for (let item of entry.relatedLinks || []) {
      lines.push(`- [${item.label}](${item.href})`);
    }
    for (let item of entry.related) lines.push(`- ${item}`);
  } else if (entry.relatedLinks?.length) {
    lines.push(`## ${entry.relatedTitle || tPortfolio('markdown.related')}`, '');
    for (let item of entry.relatedLinks) {
      lines.push(`- [${item.label}](${item.href})`);
    }
  }

  return protectMarkdownLinkTargets(lines.join('\n').trim());
}

function makeEntry(entry) {
  return {
    type: 'note',
    category: 'data',
    shape: 'rect',
    icon: 'article',
    focusIds: [entry.id],
    params: {},
    ...entry,
  };
}



function createPortfolioEntries() {
  const locale = portfolioLocalization.locale;
  let projectTitleBySlug = new Map(projects.map((project) => [project.slug, project.title]));

  const projectHrefBySlug = new Map(
    projects.map((p) => [p.slug, getPortfolioEntryHref(`projects/${p.slug}`)])
  );
  const projectFocusIdsBySlug = new Map(
    projects.map((p) => [p.slug, ['projects/index', `projects/${p.slug}`, ...getSkillIdsForProject(p)]])
  );

  let entries = [
    makeEntry({
      id: 'profile/photo',
      label: 'Vladimir Matiasevich',
      type: 'profile-photo',
      displayType: tPortfolio('entry.type.profile'),
      category: 'server',
      shape: 'disc',
      icon: 'person',
      meta: getProfileMetaText(),
      summary: tPortfolio('profile.summary'),
      sections: getProfileSections(),
      downloadsTitle: tPortfolio('pdf.downloads'),
      downloads: PORTFOLIO_PDF_DOWNLOADS.map((item) => ({
        href: item.href,
        label: getPortfolioPdfDownloadLabel(item.locale),
      })),
      linksTitle: tPortfolio('profile.links'),
      links: socialLinks.map((item) => ({
        ...item,
        summary: getSocialLinkSummary(item.summaryKey),
      })),
      focusIds: INITIAL_FOCUS_IDS,
      params: {
        avatar: 'https://rnd-pro.com/idn/93c81af5-aaae-4b92-f288-1f0499726500/public',
        avatarAlt: tPortfolio('profile.avatarAlt'),
        size: 220,
        summary: tPortfolio('profile.summary'),
      },
    }),
    makeEntry({
      id: 'bio/about',
      label: tPortfolio('bio.label'),
      type: 'bio',
      displayType: tPortfolio('entry.type.summary'),
      category: 'data',
      icon: 'person',
      summary: tPortfolio('bio.summary'),
      details: tPortfolio('bio.details'),
      focusIds: ['profile/photo', 'bio/about', 'skills/index'],
    }),
    makeEntry({
      id: 'projects/index',
      label: tPortfolio('projects.label'),
      type: 'directory',
      displayType: tPortfolio('entry.type.projects'),
      category: 'directory',
      shape: 'circle',
      icon: 'folder',
      summary: tPortfolio('projects.summary'),
      details: tPortfolio('projects.details'),
      focusIds: ['profile/photo', 'projects/index', ...projects.slice(0, 2).map((item) => `projects/${item.slug}`)],
      params: { hideContent: true, tone: 'inverse' },
    }),
    makeEntry({
      id: 'pulse/index',
      label: tPortfolio('pulse.label'),
      type: 'directory',
      displayType: tPortfolio('pulse.label'),
      category: 'control',
      shape: 'circle',
      icon: 'article',
      summary: tPortfolio('pulse.summary'),
      details: '',
      focusIds: resolvePulseFocusIds('pulse/index', publicPublications, {
        containerId: 'pulse/index',
      }),
      params: { hideContent: true, tone: 'inverse' },
    }),
    makeEntry({
      id: 'skills/index',
      label: tPortfolio('skills.label'),
      type: 'directory',
      displayType: tPortfolio('entry.type.skills'),
      category: 'module',
      shape: 'circle',
      icon: 'hub',
      summary: tPortfolio('skills.summary'),
      details: tPortfolio('skills.details'),
      focusIds: ['profile/photo', 'skills/index', ...skillEntries.map((item) => item.id)],
      params: { hideContent: true, tone: 'inverse' },
    }),
  ];

  for (let skill of skillEntries) {
    const relatedProjectSlugs = (PORTFOLIO_SKILL_PROJECT_RELATIONS[skill.id] || [])
      .filter((slug) => projectTitleBySlug.has(slug));
    const relatedLinks = relatedProjectSlugs.map((slug) => ({
      label: projectTitleBySlug.get(slug),
      href: projectHrefBySlug.get(slug),
    }));
    entries.push(makeEntry({
      ...skill,
      type: 'skill',
      displayType: tPortfolio('entry.type.skill'),
      details: skill.details,
      relatedTitle: tPortfolio('markdown.representativeProjects'),
      relatedLinks,
      focusIds: ['skills/index', skill.id, ...relatedProjectSlugs.map((slug) => `projects/${slug}`)],
    }));
  }

  for (let project of projects) {
    let relatedSkillIds = getSkillIdsForProject(project);
    let projectKicker = getProjectKicker(project);
    let projectSummary = getProjectSummary(project);
    let projectDetails = getProjectDetails(project);
    let projectLinkLabel = getProjectLinkLabel(project);
    let projectLinks = getProjectLinks(project);
    const projectId = `projects/${project.slug}`;
    const projectFocusIds = projectFocusIdsBySlug.get(project.slug);
    let mediaDescriptors = getPortfolioAssignedMediaDescriptors(
      portfolioArticleMediaAssignments,
      projectId,
    );

    entries.push(makeEntry({
      id: projectId,
      label: project.title,
      type: 'project',
      displayType: tPortfolio('entry.type.project'),
      category: 'data',
      icon: 'work',
      kicker: projectKicker,
      period: project.period,
      summary: projectSummary,
      details: projectDetails,
      mediaSlug: project.slug,
      mediaDescriptors,
      href: project.href,
      linkLabel: projectLinkLabel,
      linksTitle: tPortfolio('project.links'),
      links: projectLinks,
      projectUpdatesSlot: resolveProjectUpdatesSlotKey(PUBLICATIONS, projectId),
      relatedLinks: [
        ...relatedSkillIds
          .map((id) => skillEntries.find((skill) => skill.id === id))
          .filter(Boolean)
          .map((skill) => ({
            label: skill.label,
            href: getPortfolioEntryHref(skill.id),
          })),
        ...(PORTFOLIO_PROJECT_RELATIONS[project.slug] || [])
          .filter((slug) => projectTitleBySlug.has(slug))
          .map((slug) => ({
            label: `${tPortfolio('entry.type.project')}: ${projectTitleBySlug.get(slug)}`,
            href: projectHrefBySlug.get(slug),
          })),
      ],
      focusIds: projectFocusIds,
      params: {
        kicker: projectKicker,
        summary: projectSummary,
        image: project.image,
        imageFit: getPortfolioMediaFit(project.image, project.imageFit),
        imageAlt: project.alt,
        href: project.href,
        linkLabel: projectLinkLabel,
      },
    }));
  }

  for (let pub of publicPublications) {
    const loc = pub.locales[locale] || pub.locales.en || {};
    entries.push(makeEntry({
      id: `pulse/${pub.slug}`,
      label: loc.title || '',
      type: 'pulse',
      displayType: tPortfolio(resolvePulseKindMessageKey(pub.kind)),
      category: 'module',
      icon: 'article',
      kicker: pub.publishedAt ? formatLocaleDate(pub.publishedAt, locale) : '',
      period: pub.publishedAt ? '' : pub.subjectPeriod,
      summary: loc.summary || '',
      details: loc.body || '',
      mediaDescriptors: getPortfolioAssignedMediaDescriptors(
        portfolioArticleMediaAssignments,
        pub.id,
      ),
      ...createPublicationSourceLinkPresentation(pub, tPortfolio('pulse.sources')),
      focusIds: resolvePulseFocusIds(pub.id, publicPublications, {
        containerId: 'pulse/index',
      }),
      relatedLinks: pub.relatedProjectIds.map(projId => {
        const slug = projId.replace('projects/', '');
        return {
          label: projectTitleBySlug.get(slug) || projId,
          href: projectHrefBySlug.get(slug) || getPortfolioEntryHref(projId),
        };
      }),
    }));
  }

  return entries.map((entry) => ({
    ...entry,
    markdown: entry.markdown || createMarkdown(entry),
    sourceMarkdown: entry.sourceMarkdown || createMarkdown(entry, { interactive: false }),
  }));
}

function addPorts(node) {
  node.addInput('in', new Input(relationSocket, 'in'));
  node.addOutput('out', new Output(relationSocket, 'out'));
}

function connect(editor, nodes, edge) {
  let from = nodes.get(edge.from);
  let to = nodes.get(edge.to);
  if (!from || !to) return;
  let conn = new Connection(from, 'out', to, 'in');
  conn.kind = edge.kind;
  conn.direction = edge.direction;
  conn.design = edge.design;
  editor.addConnection(conn);
}

function resourcePathSegment(value) {
  return String(value || 'Untitled')
    .replace(/[\\/]+/g, '-')
    .replace(/\s+/g, ' ')
    .trim();
}

function createTreeItems(projectItems) {
  let profileEntries = [
    {
      id: 'profile/photo',
      path: `${tPortfolio('bio.label')}/Vladimir Matiasevich.md`,
      label: 'Vladimir Matiasevich',
      icon: 'person',
      kind: 'profile',
      draggable: false,
    },
    {
      id: 'bio/about',
      path: `${tPortfolio('bio.label')}/${tPortfolio('bio.about')}.md`,
      label: tPortfolio('bio.about'),
      icon: 'article',
      kind: 'bio',
      draggable: false,
    }
  ];

  let skillEntriesForTree = [
    {
      id: 'skills/index',
      path: `${tPortfolio('skills.label')}/${tPortfolio('skills.overview')}.md`,
      label: tPortfolio('skills.overview'),
      icon: 'hub',
      kind: String(skillEntries.length),
      draggable: false,
    },
    ...skillEntries.map((skill) => ({
      id: skill.id,
      path: `${tPortfolio('skills.label')}/${resourcePathSegment(skill.label)}.md`,
      label: skill.label,
      icon: skill.icon,
      kind: 'skill',
      draggable: false,
    }))
  ];

  let projectIndexEntry = {
    id: 'projects/index',
    path: `${tPortfolio('projects.label')}/${tPortfolio('projects.overview')}.md`,
    label: tPortfolio('projects.overview'),
    icon: 'folder',
    kind: String(projectItems.length),
    draggable: false,
  };

  let projection = buildPortfolioTreeProjection({
    projectItems,
    publications: PUBLICATIONS,
    locale: portfolioLocalization.locale,
    tPortfolio,
    getProjectTreeGroup,
    getProjectTreeGroupLabel,
    profileEntries,
    skillEntries: skillEntriesForTree,
  });

  let resourceEntries = [
    ...projection.resourceEntries.slice(0, profileEntries.length),
    projectIndexEntry,
    ...projection.resourceEntries.slice(profileEntries.length),
  ];

  const treeItems = buildResourceTreeFromEntries(resourceEntries, {
    directoryIcon: 'folder',
    fileIcon: 'article',
    draggable: false,
    sort: false,
  });

  return {
    treeItems,
    projectDirectorySelections: projection.projectDirectorySelections,
  };
}

function getStructuredPortfolioMediaDescriptors() {
  let mediaIds = new Set();
  return portfolioArticleMediaAssignments
    .map((assignment) => assignment.descriptor)
    .filter((descriptor) => {
      if (mediaIds.has(descriptor.id)) return false;
      mediaIds.add(descriptor.id);
      return true;
    });
}

function setNodePositions(canvas, projectItems, layout = getCurrentGraphLayout()) {
  return canvas.applyLayout(createPortfolioStructuredLayoutOptions({
    layout,
    projectIds: projectItems.map((project) => `projects/${project.slug}`),
    skillIds: skillEntries.map((skill) => skill.id),
    descriptors: getStructuredPortfolioMediaDescriptors(),
    publicationIds: publicPublications.map((publication) => publication.id),
    publications: PUBLICATIONS,
  }));
}

const portfolioEntries = new Map(createPortfolioEntries().map((entry) => [entry.id, entry]));
const orderedPortfolioProjects = orderProjectsForTree(projects);
const treeDirectorySelection = new Map([
  [tPortfolio('bio.label'), 'profile/photo'],
  [tPortfolio('projects.label'), 'projects/index'],
  [tPortfolio('pulse.label'), 'pulse/index'],
  [tPortfolio('skills.label'), 'skills/index'],
]);
for (let group of PROJECT_TREE_GROUPS) {
  treeDirectorySelection.set(
    `${tPortfolio('projects.label')}/${resourcePathSegment(getProjectTreeGroupLabel(group))}`,
    group.skillId
  );
}
const { treeItems: portfolioTreeItems, projectDirectorySelections } = createTreeItems(orderedPortfolioProjects);
for (let [dirPath, targetId] of projectDirectorySelections) {
  treeDirectorySelection.set(dirPath, targetId);
}
const projectTreeGroupDirectoryIds = PROJECT_TREE_GROUPS.map((group) => (
  `${tPortfolio('projects.label')}/${resourcePathSegment(getProjectTreeGroupLabel(group))}`
));
const defaultExpandedTreeIds = [
  tPortfolio('bio.label'),
  tPortfolio('projects.label'),
  ...projectTreeGroupDirectoryIds,
  tPortfolio('pulse.label'),
  tPortfolio('skills.label'),
];
const flatGroupSelection = new Map([
  ['group/biography', 'profile/photo'],
  ['group/projects', 'projects/index'],
  ['group/pulse', 'pulse/index'],
  ['group/skills', 'skills/index'],
]);
const portfolioRouteById = new Map(
  [...portfolioEntries.keys()].map((id) => {
    if (id.startsWith('pulse/') && id !== 'pulse/index') {
      const slug = id.slice('pulse/'.length);
      const pub = PUBLICATIONS.find((p) => p.slug === slug);
      if (pub && pub.primaryProjectId) {
        const projectSlug = pub.primaryProjectId.replace(/^projects\//, '');
        return [id, `projects/${projectSlug}/pulse/${slug}`];
      }
    }
    return [
      id,
      id.endsWith('/index') ? id.slice(0, -'/index'.length) : id,
    ];
  })
);
const portfolioIdByRoute = new Map();
for (const [id, route] of portfolioRouteById.entries()) {
  portfolioIdByRoute.set(route, id);
  if (id.startsWith('pulse/') && id !== 'pulse/index') {
    portfolioIdByRoute.set(id, id);
  }
}
portfolioIdByRoute.set('', 'profile/photo');
const directoryEntryIds = new Set([
  'projects/index',
  'pulse/index',
  'skills/index',
]);
const flatGraphGroups = [
  { id: 'group/biography', label: tPortfolio('bio.label'), type: 'data', children: ['profile/photo', 'bio/about'] },
  { id: 'group/projects', label: tPortfolio('projects.label'), type: 'asset', children: orderedPortfolioProjects.map((project) => `projects/${project.slug}`) },
  { id: 'group/pulse', label: tPortfolio('pulse.label'), type: 'docs', children: getGlobalPulseArticleIds(getPublicPublications()) },
  { id: 'group/skills', label: tPortfolio('skills.label'), type: 'action', children: skillEntries.map((skill) => skill.id) },
];

const GRAPH_PATH_STYLE_ICON_NAMES = Object.freeze(
  Object.values(GRAPH_PATH_STYLE_MENU_ITEMS).map((item) => item.icon).filter(Boolean)
);

const GRAPH_ACTION_PATHS = Object.freeze({
  article: 'M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zM13 9V3.5L18.5 9H13zM8 13h8v2H8v-2zm0 4h8v2H8v-2z',
  branch: 'M12 2l2 4h-4l2-4zm0 20l-2-4h4l-2 4zm10-10l-4 2v-4l4 2zM2 12l4-2v4l-4-2zm10-4a4 4 0 100 8 4 4 0 000-8z',
  open: 'M14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7zM5 5h5V3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-5h-2v5H5V5z',
});

function collectTreeIconNames(items, result = new Set()) {
  for (let item of items || []) {
    if (item?.icon) result.add(item.icon);
    collectTreeIconNames(item?.children, result);
  }
  return result;
}

function preloadPortfolioIcons() {
  let iconNames = collectTreeIconNames(portfolioTreeItems, new Set([
    'account_tree',
    'article',
    'center_focus_strong',
    'chevron_left',
    'chevron_right',
    'close',
    'code',
    'content_copy',
    'dashboard',
    'delete',
    'edit',
    'folder',
    'fullscreen',
    'fullscreen_exit',
    'hub',
    'image',
    'keyboard_arrow_down',
    'more_horiz',
    'palette',
    'person',
    'visibility_off',
    'web_asset',
    'work',
  ]));
  for (let entry of portfolioEntries.values()) {
    if (entry.icon) iconNames.add(entry.icon);
  }
  for (let action of PORTFOLIO_STRUCTURED_LAYOUT_ACTIONS) iconNames.add(action.icon);
  for (let iconName of GRAPH_PATH_STYLE_ICON_NAMES) iconNames.add(iconName);
  ensureMaterialSymbols([...iconNames]);
}

preloadPortfolioIcons();

function createPortfolioNodeActionItems() {
  return [
    { action: 'content', label: tPortfolio('graph.action.content'), path: GRAPH_ACTION_PATHS.article },
    { action: 'branch', label: tPortfolio('graph.action.branch'), path: GRAPH_ACTION_PATHS.branch },
    { action: 'open', label: tPortfolio('graph.action.open'), path: GRAPH_ACTION_PATHS.open },
  ];
}

function getCurrentGraphLayout() {
  if (typeof location === 'undefined') return PORTFOLIO_DEFAULT_STRUCTURED_LAYOUT;
  return getPortfolioStructuredLayoutFromSearch(location.search);
}

function getCurrentGraphViewMode() {
  if (typeof location === 'undefined') return PORTFOLIO_DEFAULT_GRAPH_VIEW_MODE;
  let urlParams = new URLSearchParams(location.search);
  let modeParam = urlParams.get('mode');
  if (!modeParam) return PORTFOLIO_DEFAULT_GRAPH_VIEW_MODE;
  if (modeParam === 'media') return 'media';
  if (modeParam === 'flat') return 'flat';
  if (modeParam === 'structured') return 'structured';
  return resolveInitialGraphViewMode(urlParams);
}

function normalizeRoutePath(path) {
  return String(path || '')
    .replace(/^\/+|\/+$/g, '')
    .replace(/\/index$/, '');
}

function getInitialPortfolioSelection() {
  if (typeof location === 'undefined') return 'profile/photo';
  let basePath = getPortfolioBasePath();
  let pathname = location.pathname;
  let relativePath = pathname.startsWith(basePath)
    ? pathname.slice(basePath.length)
    : pathname.replace(/^\/+/, '');
  let route = normalizeRoutePath(decodeURIComponent(relativePath));
  return portfolioIdByRoute.get(route) || 'profile/photo';
}

function getPortfolioPath(id) {
  let route = portfolioRouteById.get(id) || '';
  let basePath = getPortfolioBasePath();
  return route ? `${basePath}${route}/`.replace(/\/{2,}/g, '/') : basePath;
}

function createGraphPanelMenuActions({
  editable = true,
  viewMode = getCurrentGraphViewMode(),
  graphLayout = getCurrentGraphLayout(),
  pathStyleActions = [],
  innerMenuActions = [],
} = {}) {
  return [
    ...(viewMode === 'structured'
      ? createPortfolioStructuredLayoutMenuActions({
          layout: graphLayout,
          translate: translatePortfolioStructuredLayout,
        })
      : []),
    {
      id: 'graph:media-mode',
      label: tPortfolio('graph.media'),
      icon: 'image',
      title: tPortfolio('graph.mediaTitle'),
      group: 'graph-view',
      groupLabel: tPortfolio('graph.viewGroup'),
      groupOrder: 18,
      active: viewMode === 'media',
    },
    {
      id: 'graph:flat-mode',
      label: tPortfolio('graph.flat'),
      icon: 'account_tree',
      title: tPortfolio('graph.flatTitle'),
      group: 'graph-view',
      groupLabel: tPortfolio('graph.viewGroup'),
      groupOrder: 18,
      active: viewMode === 'flat',
    },
    {
      id: 'graph:structured-mode',
      label: tPortfolio('graph.structured'),
      icon: 'hub',
      title: tPortfolio('graph.structuredTitle'),
      group: 'graph-view',
      groupLabel: tPortfolio('graph.viewGroup'),
      groupOrder: 18,
      active: viewMode === 'structured',
    },
    ...pathStyleActions,
    {
      id: 'graph:fit',
      label: tPortfolio('graph.fit'),
      icon: 'center_focus_strong',
      title: tPortfolio('graph.fitTitle'),
      group: 'graph-tools',
      groupLabel: tPortfolio('graph.toolsGroup'),
      groupOrder: 30,
    },
    {
      id: 'graph:edit-toggle',
      label: tPortfolio('graph.edit'),
      icon: 'edit',
      title: tPortfolio('graph.editTitle'),
      group: 'graph-tools',
      groupLabel: tPortfolio('graph.toolsGroup'),
      groupOrder: 30,
      active: editable,
    },
    ...normalizeGraphInnerMenuActions(innerMenuActions),
  ];
}

function normalizeGraphInnerMenuActions(actions = []) {
  if (!Array.isArray(actions)) return [];
  return actions
    .filter((action) => (
      action
      && action.id
      && !String(action.id).startsWith('graph:')
      && !String(action.id).startsWith('graph-layout:')
      && !String(action.id).startsWith('path:')
    ))
    .map((action) => ({
      ...action,
      group: action.group || 'graph-inner',
      groupLabel: action.groupLabel || tPortfolio('graph.innerToolsGroup'),
      groupOrder: Number.isFinite(Number(action.groupOrder)) ? Math.max(35, Number(action.groupOrder)) : 35,
    }));
}

function getGraphPathStyleMenuActionOptions() {
  let labels = {
    pcb: tPortfolio('graph.path.pcb'),
    orthogonal: tPortfolio('graph.path.orthogonal'),
    bezier: tPortfolio('graph.path.bezier'),
    straight: tPortfolio('graph.path.straight'),
  };
  let titles = Object.fromEntries(
    Object.entries(labels).map(([style, label]) => [style, tPortfolio('graph.pathTitle', { label })])
  );
  return {
    labels,
    titles,
    groupLabel: tPortfolio('graph.connectionsGroup'),
  };
}

function resolveTreeSelection(item) {
  if (!item) return '';
  if (item.metadata?.targetId) return item.metadata.targetId;
  if (portfolioEntries.has(item.id)) return item.id;
  if (portfolioEntries.has(item.path)) return item.path;
  return treeDirectorySelection.get(item.id) || treeDirectorySelection.get(item.path) || '';
}

function resolveFlatGraphSelection(path) {
  if (portfolioEntries.has(path)) return path;
  return flatGroupSelection.get(path) || '';
}

function resolveMediaGraphSelection(graph, path) {
  if (portfolioEntries.has(path)) return path;
  let node = graph?.graphDB?.nodes?.get?.(path);
  let targetId = node?.params?.targetId || node?.targetId || '';
  return portfolioEntries.has(targetId) ? targetId : '';
}

function getMediaGraphDescriptor(graph, path) {
  let node = graph?.graphDB?.nodes?.get?.(path);
  return node?.params?.media?.activation?.provider ? node.params.media : null;
}

function getPortfolioArticleMediaDescriptors(entryId) {
  return portfolioEntries.get(entryId)?.mediaDescriptors
    || getPortfolioAssignedMediaDescriptors(portfolioArticleMediaAssignments, entryId);
}

function createPortfolioYouTubeIframe(descriptor) {
  let videoId = String(descriptor?.activation?.videoId || '').trim();
  if (!/^[A-Za-z0-9_-]+$/.test(videoId)) return null;
  let iframe = document.createElement('iframe');
  iframe.className = 'portfolio-article-youtube';
  iframe.src = `https://www.youtube-nocookie.com/embed/${encodeURIComponent(videoId)}?rel=0`;
  iframe.title = String(descriptor.alt || descriptor.label || 'YouTube video');
  iframe.loading = 'lazy';
  iframe.referrerPolicy = 'strict-origin-when-cross-origin';
  iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
  iframe.allowFullscreen = true;
  return iframe;
}

function renderPortfolioArticleMediaSlot(host, { descriptor, mediaId, viewer }) {
  if (!host || !descriptor) return false;
  let descriptorId = String(descriptor.id || '');
  let mediaFragment = createPortfolioMediaFragmentId(descriptorId);
  host.classList.add('portfolio-article-media-item');
  host.id = mediaFragment;
  host.dataset.mediaId = descriptorId;
  host.tabIndex = -1;
  host.setAttribute('role', 'figure');
  host.setAttribute('aria-label', String(descriptor.alt || descriptor.label || ''));

  let youtube = descriptor.kind === 'youtube' ? createPortfolioYouTubeIframe(descriptor) : null;
  let mediaHost = null;
  if (youtube) {
    host.append(youtube);
  } else {
    mediaHost = /** @type {any} */ (document.createElement('sn-media-host'));
    mediaHost.className = 'portfolio-article-media-host';
    mediaHost.descriptor = descriptor;
    host.append(mediaHost);
    mediaHost.activate();
  }

  if (descriptorId === mediaId) {
    viewer.scrollToFragment(mediaFragment);
    host.focus({ preventScroll: true });
  }
  return true;
}

function getFlatGraphFocusId(entry) {
  if (!entry?.id) return '';
  if (entry.id === 'projects/index') return 'group/projects';
  if (entry.id === 'pulse/index') return 'group/pulse';
  if (entry.id === 'skills/index') return 'group/skills';
  return entry.id;
}

function getFlatGraphFocusIds(entry) {
  let focusId = getFlatGraphFocusId(entry);
  if (!focusId) return [];
  if (entry.id === 'profile/photo') {
    return ['profile/photo', 'bio/about', 'group/projects', 'group/pulse', 'group/skills'];
  }
  if (entry.id === 'projects/index') {
    return ['group/projects', ...projects.slice(0, 3).map((project) => `projects/${project.slug}`)];
  }
  if (entry.id === 'pulse/index') {
    return resolvePulseFocusIds(entry.id, publicPublications);
  }
  if (entry.id === 'skills/index') {
    return ['group/skills', ...skillEntries.slice(0, 5).map((skill) => skill.id)];
  }
  if (entry.id.startsWith('projects/')) {
    let project = projects.find((item) => `projects/${item.slug}` === entry.id);
    let ids = ['group/projects', entry.id];
    if (project) {
      const pubs = getPublicationsByProject(entry.id);
      for (let pub of pubs) {
        ids.push(`pulse/${pub.slug}`);
      }
      ids.push(...getSkillIdsForProject(project).slice(0, 3));
    }
    return ids;
  }
  if (entry.id.startsWith('pulse/')) {
    return resolvePulseFocusIds(entry.id, publicPublications)
      .filter((id) => id === 'group/pulse' || portfolioEntries.has(id));
  }
  if (entry.id.startsWith('skills/')) {
    let linkedProjects = projects
      .filter((project) => getSkillIdsForProject(project).includes(entry.id))
      .slice(0, 3)
      .map((project) => `projects/${project.slug}`);
    return ['group/skills', entry.id, ...linkedProjects];
  }
  return [focusId];
}

function getCanvasGraphNodeType(entry) {
  if (entry.type === 'project') return 'asset';
  if (entry.type === 'pulse') return 'docs';
  if (entry.type === 'skill') return 'action';
  return 'data';
}

function getPortfolioRelationProjects({ includeMedia = false } = {}) {
  return projects.map((project) => {
    let projectId = `projects/${project.slug}`;
    return {
      projectId,
      skillIds: getSkillIdsForProject(project),
      mediaIds: includeMedia
        ? getProjectMediaDescriptors(project, PORTFOLIO_MEDIA_CATALOG)
            .map((descriptor) => descriptor.id)
        : [],
    };
  });
}

function createPortfolioFlatGraphModel() {
  let nodes = [];
  let edges = [];
  for (let group of flatGraphGroups) {
    nodes.push({
      id: group.id,
      label: group.label,
      type: group.type,
      summary: tPortfolio('graph.groupSummary', { label: group.label }),
      isGroup: true,
      children: group.children,
    });
  }

  for (let entry of portfolioEntries.values()) {
    if (directoryEntryIds.has(entry.id)) continue;
    nodes.push({
      id: entry.id,
      label: entry.label,
      type: getCanvasGraphNodeType(entry),
      summary: entry.summary,
    });
  }

  let flatNodeIds = new Set(nodes.map((node) => node.id));
  let relationPlan = createPortfolioRelationPlan({
    mode: 'flat',
    skillIds: skillEntries.map((skill) => skill.id),
    projects: getPortfolioRelationProjects(),
  });
  for (let edge of relationPlan) {
    if (flatNodeIds.has(edge.from) && flatNodeIds.has(edge.to)) edges.push(edge);
  }

  return {
    nodes,
    edges,
    groups: flatGraphGroups.map((group) => ({
      id: group.id,
      label: group.label,
      nodeIds: group.children,
    })),
    rootNodes: nodes.map((node) => node.id),
  };
}

function createPortfolioMediaGraphModel() {
  let profileEntry = portfolioEntries.get('profile/photo');
  let avatar = String(profileEntry?.params?.avatar || '').trim();
  let profileMedia = avatar ? {
    kind: 'image',
    poster: avatar,
    alt: tPortfolio('profile.avatarAlt'),
    fit: 'cover',
    targetIds: ['profile/photo'],
    activation: { provider: 'image', src: avatar },
  } : null;
  return buildPortfolioMediaGraphModel({
    baseModel: createPortfolioFlatGraphModel(),
    projects: orderedPortfolioProjects,
    catalog: PORTFOLIO_MEDIA_CATALOG,
    profileMedia,
    weights: {
      image: PORTFOLIO_MEDIA_IMAGE_NODE_WEIGHT,
      pulse: PORTFOLIO_MEDIA_PULSE_NODE_WEIGHT,
      profile: PORTFOLIO_PROFILE_MEDIA_HUB_WEIGHT,
    },
    getHubWeight: getPortfolioMediaHubWeight,
  });
}
const portfolioRuntime = {
  entries: portfolioEntries,
  treeItems: portfolioTreeItems,
  treeDirectorySelection,
  selectedId: getInitialPortfolioSelection(),
  graphMode: getCurrentGraphViewMode(),
  /** @type {any} */
  tree: null,
  /** @type {any} */
  graphPanel: null,
  /** @type {any} */
  canvas: null,
  /** @type {any} */
  graphController: null,
  /** @type {any} */
  mediaGraph: null,
  /** @type {any} */
  viewer: null,
  mediaFragment: typeof location === 'undefined' ? '' : String(location.hash || '').replace(/^#/, ''),
  /** @type {IntersectionObserver | null} */
  articleMediaObserver: null,
  /** @type {Element | null} */
  articleMediaScrollRoot: null,
  /** @type {EventListener | null} */
  articleMediaScrollListener: null,
  articleMediaCandidates: new Map(),
  /** @type {AbortController | null} */
  articleMediaInputAbort: null,
  articleMediaFocusScheduler: null,
  activeArticleMediaId: '',
  expectedArticleMediaId: '',
  expectedStructuredMediaId: '',

  setTree(panel) {
    this.tree = panel;
    this.syncTree();
  },

  setGraphPanel(panel) {
    this.graphPanel = panel || null;
  },

  setCanvas(canvas) {
    this.canvas = canvas;
    this.syncCanvas({ focus: true, focusScope: 'node' });
  },

  setMediaGraph(mediaGraph) {
    this.mediaGraph = mediaGraph;
    this.syncCanvas({ focus: true, focusScope: 'node' });
    this.activateArticleMediaNode(this.activeArticleMediaId, { fit: true });
  },

  setGraphController(controller) {
    this.graphController = controller;
    this.syncCanvas({ focus: true, focusScope: 'node' });
  },

  setGraphMode(mode) {
    this.graphMode = ['media', 'flat', 'structured'].includes(mode) ? mode : PORTFOLIO_DEFAULT_GRAPH_VIEW_MODE;
    if (this.graphMode === 'media' || this.graphMode === 'structured') {
      this.activateArticleMediaNode(this.activeArticleMediaId, { fit: true });
    }
  },

  setViewer(viewer) {
    this.viewer = viewer;
    this.syncViewer();
  },

  select(id, { focus = false, updateUrl = true, focusScope = 'node', mediaId = '' } = {}) {
    return portfolioNavigationController.select(id, {
      focus,
      updateUrl,
      focusScope,
      mediaId,
    });
  },

  selectTreeItem(id, options, onAccepted) {
    return portfolioNavigationController.selectTreeItem({ id, options, onAccepted });
  },

  getSelectedEntry() {
    return this.entries.get(this.selectedId) || this.entries.get('profile/photo');
  },

  restorePresentation() {
    let entry = this.getSelectedEntry();
    if (!entry) return false;
    let activeMediaId = String(this.activeArticleMediaId || '').trim();
    let previousExpectedMediaId = this.expectedStructuredMediaId;
    if (this.graphMode === 'structured' && activeMediaId) {
      this.expectedStructuredMediaId = activeMediaId;
    }
    try {
      return restorePortfolioNavigationPresentation({
        restoreTree: () => this.syncTree({ scroll: false }),
        graphMode: this.graphMode,
        selectedEntryId: entry.id,
        structuredCanvas: this.canvas,
        structuredNodeId: activeMediaId || entry.id,
        mediaGraph: this.mediaGraph,
        activeMediaId,
        flatGraph: this.graphPanel?.flatGraph,
        flatNodeId: getFlatGraphFocusId(entry),
      });
    } finally {
      this.expectedStructuredMediaId = previousExpectedMediaId;
    }
  },

  syncTree({ scroll = true } = {}) {
    if (!this.tree?.setItems) return;
    this.tree.defaultExpandedIds = defaultExpandedTreeIds;
    setTreeItems({ ref: { panel: this.tree } }, this.treeItems);
    showTree({ ref: { panel: this.tree } });
    let highlightId = resolvePortfolioTreeHighlightId(
      this.selectedId,
      PUBLICATIONS,
      treeDirectorySelection
    );
    highlightTreePath({ ref: { panel: this.tree } }, highlightId, { scroll });
  },

  disconnectArticleMediaObserver({ clearState = false } = {}) {
    this.articleMediaFocusScheduler?.cancel?.();
    this.articleMediaObserver?.disconnect?.();
    this.articleMediaObserver = null;
    this.articleMediaInputAbort?.abort?.();
    this.articleMediaInputAbort = null;
    this.articleMediaScrollRoot?.removeEventListener?.('scroll', this.articleMediaScrollListener);
    this.articleMediaScrollListener = null;
    this.articleMediaScrollRoot = null;
    this.articleMediaCandidates.clear();
    if (clearState) {
      this.activeArticleMediaId = '';
      this.expectedArticleMediaId = '';
    }
  },

  activateArticleMediaNode(mediaId, { fit = false } = {}) {
    this.articleMediaFocusScheduler?.cancel?.();
    let id = String(mediaId || '').trim();
    if (!id) return false;
    if (this.graphMode === 'media') {
      return this.mediaGraph?.activateMediaNode?.(id, { fit }) === true;
    }
    if (this.graphMode !== 'structured' || !this.canvas) return false;
    if (!this.graphPanel?._structuredEditor?.getNode?.(id)) return false;
    this.expectedStructuredMediaId = id;
    if (fit) {
      this.canvas.focusNodes?.(id, {
        select: id,
        transition: true,
        padding: 56,
        zoom: 0.8,
      });
    } else {
      this.canvas.selectNode?.(id);
    }
    return true;
  },

  ensureArticleMediaObserver(scrollRoot) {
    if (!scrollRoot?.addEventListener) return false;
    if (this.articleMediaObserver && this.articleMediaScrollRoot === scrollRoot) return true;
    this.disconnectArticleMediaObserver();

    let IntersectionObserverCtor = globalThis.IntersectionObserver;
    if (typeof IntersectionObserverCtor !== 'function') return false;
    this.articleMediaScrollRoot = scrollRoot;
    this.articleMediaScrollListener = () => {
      let pendingId = this.articleMediaFocusScheduler?.pendingId;
      if (pendingId) this.articleMediaFocusScheduler.schedule(pendingId);
    };
    scrollRoot.addEventListener('scroll', this.articleMediaScrollListener, { passive: true });
    this.articleMediaObserver = new IntersectionObserverCtor((entries) => {
      for (let entry of entries) {
        let candidate = this.articleMediaCandidates.get(entry.target);
        if (!candidate) continue;
        candidate.isIntersecting = entry.isIntersecting;
        candidate.rect = entry.boundingClientRect;
        candidate.rootBounds = entry.rootBounds;
      }
      let candidateId = pickPortfolioActiveMediaId(
        this.articleMediaCandidates.values(),
        this.activeArticleMediaId,
      );
      let change = resolvePortfolioMediaVisibilityChange({
        candidateId,
        expectedId: this.expectedArticleMediaId,
        previousId: this.activeArticleMediaId,
      });
      this.expectedArticleMediaId = change.expectedId;
      if (!change.changed) return;
      this.activeArticleMediaId = change.mediaId;
      this.articleMediaFocusScheduler?.schedule?.(change.mediaId);
    }, {
      root: scrollRoot,
      rootMargin: PORTFOLIO_MEDIA_READING_ROOT_MARGIN,
      threshold: 0,
    });

    let AbortControllerCtor = globalThis.AbortController;
    if (typeof AbortControllerCtor === 'function') {
      this.articleMediaInputAbort = new AbortControllerCtor();
      let releaseExpectedMedia = () => {
        this.expectedArticleMediaId = '';
        this.articleMediaInputAbort?.abort?.();
        this.articleMediaInputAbort = null;
      };
      let signal = this.articleMediaInputAbort.signal;
      scrollRoot.addEventListener('wheel', releaseExpectedMedia, { passive: true, signal });
      scrollRoot.addEventListener('pointerdown', releaseExpectedMedia, { signal });
      scrollRoot.addEventListener('keydown', releaseExpectedMedia, { signal });
    }
    return true;
  },

  observeArticleMediaHost(host, descriptor, order, scrollRoot) {
    let mediaId = String(descriptor?.id || '').trim();
    if (!mediaId || !this.ensureArticleMediaObserver(scrollRoot)) return false;
    for (let [candidateHost] of this.articleMediaCandidates) {
      if (candidateHost === host || scrollRoot.contains(candidateHost)) continue;
      this.articleMediaObserver?.unobserve?.(candidateHost);
      this.articleMediaCandidates.delete(candidateHost);
    }
    this.articleMediaCandidates.set(host, {
      mediaId,
      order,
      isIntersecting: false,
      rect: null,
      rootBounds: null,
    });
    this.articleMediaObserver.observe(host);
    return true;
  },

  syncViewer() {
    this.disconnectArticleMediaObserver({ clearState: true });
    let entry = this.getSelectedEntry();
    if (!entry || !this.viewer?.showFile) return;
    this.viewer.showFile({
      path: `${resourcePathSegment(entry.label)}.md`,
      lang: 'md',
      raw: entry.sourceMarkdown,
      renderedRaw: entry.markdown,
      statsText: entry.displayType || entry.type,
    });
    this.viewer.scrollToTop({ behavior: 'auto' });
    let descriptors = entry.mediaDescriptors || getPortfolioArticleMediaDescriptors(entry.id);
    let descriptorBySlotKey = new Map(descriptors.map((descriptor, order) => [
      createPortfolioMediaSlotKey(descriptor.id),
      { descriptor, order },
    ]));
    let mediaId = getPortfolioMediaIdFromFragment(this.mediaFragment);
    this.activeArticleMediaId = mediaId;
    this.expectedArticleMediaId = mediaId;
    this.activateArticleMediaNode(mediaId, { fit: true });
    const locale = portfolioLocalization.locale;
    const resolvePublicationHref = (slug) => {
      const pub = PUBLICATIONS.find(p => p.slug === slug);
      if (pub && pub.primaryProjectId) {
        let projectSlug = pub.primaryProjectId.replace(/^projects\//, "");
        return getPortfolioEntryHref(`projects/${projectSlug}/pulse/${slug}`);
      }
      return getPortfolioEntryHref(`pulse/${slug}`);
    };
    const handleInAppNavigation = (event) => {
      const path = typeof event.composedPath === 'function' ? event.composedPath() : [event.target];
      const anchor = /** @type {HTMLAnchorElement | undefined} */ (
        path.find((el) => el instanceof HTMLAnchorElement || (el && typeof el === 'object' && 'nodeName' in el && el.nodeName === 'A'))
      );
      if (!anchor) return;
      const targetId = shouldHandleInAppActivation(event, anchor, {
        entries: this.entries,
        basePath: getPortfolioBasePath(),
      });
      if (targetId && this.entries.has(targetId)) {
        event.preventDefault();
        if (anchor.getAttribute('target') === '_blank') {
          anchor.removeAttribute('target');
        }
        this.select(targetId, { focus: true });
      }
    };
    this.viewer.renderContentSlots((host, slotKey, context = {}) => {
      if (slotKey === 'pulse-feed') {
        host.innerHTML = renderGlobalFeed(PUBLICATIONS, locale, {
          hrefBuilder: resolvePublicationHref,
        });
        host.onclick = handleInAppNavigation;
      } else if (slotKey === 'project-updates') {
        host.innerHTML = renderProjectUpdates(PUBLICATIONS, entry.id, locale, {
          hrefBuilder: resolvePublicationHref,
        });
        host.onclick = handleInAppNavigation;
      } else {
        let item = descriptorBySlotKey.get(slotKey);
        renderPortfolioArticleMediaSlot(host, {
          descriptor: item?.descriptor,
          mediaId,
          viewer: this.viewer,
        });
        this.observeArticleMediaHost(host, item?.descriptor, item?.order, context.scrollRoot);
      }
    });
    if (this.viewer.$) this.viewer.$.showGraphAction = false;
  },

  routeToMediaArticle(node, mediaId) {
    return routePortfolioMediaArticleSelection({
      node,
      mediaId,
      entries: this.entries,
      resolveTarget: resolvePortfolioMediaArticleTarget,
      select: (id, options) => this.select(id, options),
    });
  },

  selectMediaNode(path, graph) {
    let node = graph?.graphDB?.nodes?.get?.(path);
    let media = getMediaGraphDescriptor(graph, path);
    if (!node || !media) return false;
    return this.routeToMediaArticle(node, path);
  },

  syncCanvas({ focus = false, focusScope = 'node' } = {}) {
    let entry = this.getSelectedEntry();
    if (!entry) return;
    let shouldFocusMediaEntry = focus && this.graphMode === 'media' && !this.activeArticleMediaId;
    this.mediaGraph?.setSelectedEntry?.(entry.id, { focus: shouldFocusMediaEntry });
    if (this.graphMode === 'media') {
      this.activateArticleMediaNode(this.activeArticleMediaId, { fit: focus });
      return;
    }
    if (
      this.graphMode === 'structured'
      && this.activeArticleMediaId
      && this.activateArticleMediaNode(this.activeArticleMediaId, { fit: focus })
    ) {
      return;
    }
    if (!focus) return;
    let useGroupFocus = focusScope === 'group';
    let useNodeFitFocus = focusScope === 'node-fit';
    let structuredFocusTarget = useGroupFocus
      ? entry.focusIds || [entry.id]
      : useNodeFitFocus
        ? [entry.id]
        : entry.id;
    let flatFocusId = getFlatGraphFocusId(entry);
    let flatNodeIds = useGroupFocus ? getFlatGraphFocusIds(entry) : flatFocusId ? [flatFocusId] : [];
    if (this.graphController) {
      this.graphController.focusNode({
        nodeId: entry.id,
        structuredNodeIds: structuredFocusTarget,
        flatNodeId: flatFocusId,
        flatNodeIds,
        structuredOptions: {
          padding: 56,
          maxZoom: useNodeFitFocus
            ? 0.8
            : Array.isArray(structuredFocusTarget) && structuredFocusTarget.length > 1 ? 1 : 0.92,
          select: entry.id,
        },
        flatOptions: {
          padding: 96,
          maxZoom: 1.05,
          select: getFlatGraphFocusId(entry),
        },
      });
      return;
    }
    if (!this.canvas) return;
    this.canvas.focusNodes?.(structuredFocusTarget, {
      padding: 56,
      maxZoom: useNodeFitFocus
        ? 0.8
        : Array.isArray(structuredFocusTarget) && structuredFocusTarget.length > 1 ? 1 : 0.92,
      select: entry.id,
    });
  },

  syncUrl({ selectedId = this.selectedId, mediaFragment = this.mediaFragment } = {}) {
    if (typeof location === 'undefined' || typeof history === 'undefined') return true;
    let nextUrl = createPortfolioMediaNavigationUrl({
      currentUrl: location.href,
      pathname: getPortfolioPath(selectedId),
      fragmentId: mediaFragment,
    });
    if (themeSharingController) {
      nextUrl = themeSharingController.prepareNavigationUrl(nextUrl);
      if (!nextUrl) return false;
    }
    const nextUrlStr = typeof nextUrl === 'string' ? nextUrl : (nextUrl?.href || String(nextUrl));
    const currentUrlStr = typeof location !== 'undefined' ? location.href : '';
    if (nextUrlStr !== currentUrlStr) {
      history.pushState({ selectedId, mediaFragment }, '', nextUrlStr);
    }
    return true;
  },

};

const portfolioNavigationController = createPortfolioNavigationController({
  hasEntry: (id) => portfolioRuntime.entries.has(id),
  createMediaFragment: createPortfolioMediaFragmentId,
  getSelection() {
    return capturePortfolioNavigationRuntimeState(portfolioRuntime);
  },
  prepareNavigation({ selectedId, mediaFragment }) {
    if (typeof location === 'undefined') return '';
    let nextUrl = createPortfolioMediaNavigationUrl({
      currentUrl: location.href,
      pathname: getPortfolioPath(selectedId),
      fragmentId: mediaFragment,
    });
    if (themeSharingController) {
      nextUrl = themeSharingController.prepareNavigationUrl(nextUrl);
      if (!nextUrl) return '';
    }
    return typeof nextUrl === 'string' ? nextUrl : (nextUrl?.href || String(nextUrl));
  },
  pushUrl(preparedUrl, { selectedId, mediaFragment }) {
    if (typeof history === 'undefined' || typeof location === 'undefined') return;
    if (preparedUrl !== location.href) {
      history.pushState({ selectedId, mediaFragment }, '', preparedUrl);
    }
  },
  restorePresentation(snapshot) {
    return restorePortfolioNavigationRuntimeState(portfolioRuntime, snapshot);
  },
  commitSelection({ id, mediaFragment, focus, focusScope }) {
    portfolioRuntime.selectedId = id;
    portfolioRuntime.mediaFragment = mediaFragment;
    portfolioRuntime.syncTree();
    portfolioRuntime.syncViewer();
    portfolioRuntime.syncCanvas({ focus, focusScope });
  },
});

portfolioRuntime.articleMediaFocusScheduler = createPortfolioMediaFocusScheduler({
  focus(mediaId) {
    portfolioRuntime.activateArticleMediaNode(mediaId, { fit: true });
  },
  isCurrent(mediaId) {
    return mediaId === portfolioRuntime.activeArticleMediaId;
  },
});

if (typeof window !== 'undefined') {
  window.addEventListener('popstate', () => {
    let id = getInitialPortfolioSelection();
    if (!id) return;
    portfolioRuntime.graphPanel?.syncGraphLayoutFromUrl?.();
    let mediaId = getPortfolioMediaIdFromFragment(location.hash);
    portfolioRuntime.select(id, { focus: true, updateUrl: false, mediaId });
  });
}

function createPortfolioLayoutTree() {
  let treePanel = LayoutTree.createPanel('portfolio-tree', {}, {
    importance: PORTFOLIO_TREE_PANEL_IMPORTANCE,
    minInlineSize: PORTFOLIO_TREE_PANEL_MIN_INLINE_SIZE,
    minBlockSize: 180,
    collapse: 'auto',
    mobileDock: 'start',
    swipeControl: 'rail',
  });
  let graphPanel = LayoutTree.createPanel('portfolio-graph', {}, {
    importance: PORTFOLIO_GRAPH_PANEL_IMPORTANCE,
    minInlineSize: PORTFOLIO_GRAPH_PANEL_MIN_INLINE_SIZE,
    minBlockSize: 320,
    collapse: 'auto',
    mobileDock: 'end',
    swipeControl: 'rail',
  });
  let viewerPanel = LayoutTree.createPanel('portfolio-viewer', {}, {
    importance: 100,
    minInlineSize: PORTFOLIO_VIEWER_PANEL_MIN_INLINE_SIZE,
    minBlockSize: 240,
    collapse: 'never',
    mobileDock: 'primary',
  });
  let contentSplit = LayoutTree.createSplit(
    'horizontal',
    viewerPanel,
    graphPanel,
    PORTFOLIO_CONTENT_SPLIT_RATIO,
    {
      importance: 90,
      minInlineSize: 740,
      minBlockSize: 320,
      collapse: 'never',
      responsiveMode: 'swipe',
    },
    { lockRatio: true }
  );
  return LayoutTree.createSplit('horizontal', treePanel, contentSplit, 0.22, {
    importance: 90,
    minInlineSize: PORTFOLIO_LAYOUT_MIN_INLINE_SIZE,
    minBlockSize: 420,
    collapse: 'never',
    responsiveMode: 'swipe',
  });
}

function createPortfolioEditor() {
  let editor = new NodeEditor();
  let nodes = new Map();
  for (let entry of portfolioRuntime.entries.values()) {
    let node = new Node(entry.label, {
      id: entry.id,
      type: entry.type,
      category: entry.category,
      shape: entry.shape,
      icon: entry.icon,
    });
    node.params = {
      summary: entry.summary,
      href: entry.href,
      linkLabel: entry.linkLabel,
      ...(entry.params || {}),
    };
    addPorts(node);
    editor.addNode(node);
    nodes.set(entry.id, node);
  }

  for (let { descriptor, targetId } of portfolioArticleMediaAssignments) {
    let leaf = createPortfolioMediaLeafNode(descriptor, { parentId: targetId });
    if (nodes.has(leaf.id)) continue;
    let node = new Node(leaf.label, {
      id: leaf.id,
      type: leaf.type,
      category: 'data',
      shape: 'rect',
      icon: 'movie',
    });
    node.params = leaf.params;
    addPorts(node);
    editor.addNode(node);
    nodes.set(leaf.id, node);
  }

  let relationPlan = createPortfolioRelationPlan({
    mode: 'structured',
    skillIds: skillEntries.map((skill) => skill.id),
    projects: getPortfolioRelationProjects({ includeMedia: true }),
  });
  let relationKeys = new Set(relationPlan.map((edge) => `${edge.from}\u001f${edge.to}`));
  for (let { descriptor } of portfolioArticleMediaAssignments) {
    for (let targetId of descriptor.targetIds) {
      if (!targetId.startsWith('pulse/') || portfolioRuntime.entries.get(targetId)?.type !== 'pulse') {
        continue;
      }
      let key = `${targetId}\u001f${descriptor.id}`;
      if (relationKeys.has(key)) continue;
      relationKeys.add(key);
      relationPlan.push(createPortfolioRelationEdge(targetId, descriptor.id, 'has-media'));
    }
  }
  for (let edge of relationPlan) connect(editor, nodes, edge);

  return editor;
}

class PortfolioTreePanel extends HTMLElement {
  connectedCallback() {
    if (this._ready) return;
    this._ready = true;
    this.innerHTML = /*html*/ `
      <sn-tree-panel
        class="portfolio-tree"
        title="${tPortfolio('tree.navigation')}"
        aria-label="${tPortfolio('tree.navigation')}"
        filter-placeholder="${tPortfolio('tree.filter')}"
        collapse-title="${tPortfolio('tree.collapse')}"></sn-tree-panel>
    `;
    let panel = /** @type {any} */ (this.querySelector('sn-tree-panel'));
    this.ref = { panel };
    Promise.all([
      customElements.whenDefined('sn-tree-panel'),
      customElements.whenDefined('sn-tree-view'),
    ]).then(() => {
      setupTreePanel(this, {
        storageKey: TREE_STORAGE_KEY,
        defaultExpandedIds: defaultExpandedTreeIds,
        onSelect: (item) => {
          let id = resolveTreeSelection(item);
          portfolioRuntime.selectTreeItem(id, { focus: true }, () => {
            let layout = /** @type {any} */ (this.closest('panel-layout'));
            layout?.closeDrawer?.('start');
          });
        },
      });
      portfolioRuntime.setTree(panel);
    });
  }
}

const PortfolioCanvasGraphBase = /** @type {any} */ (CanvasGraph);

class PortfolioMediaCanvasGraph extends PortfolioCanvasGraphBase {
  selectedEntryId = '';

  initCallback() {
    super.initCallback();
    this.classList.add('portfolio-media-graph');
    this.setForceLayoutOptions?.(PORTFOLIO_MEDIA_FORCE_LAYOUT_OPTIONS);
  }

  setSelectedEntry(entryId, { focus = false } = {}) {
    this.selectedEntryId = entryId || '';
    if (focus) this.focusEntry(entryId);
  }

  activateMediaNode(mediaId, { fit = false } = {}) {
    let id = String(mediaId || '').trim();
    if (!getMediaGraphDescriptor(this, id)) return false;
    if (fit && this.fitNodes?.([id], {
      animate: true,
      includeInfoPanel: true,
      maxZoom: PORTFOLIO_MEDIA_FOCUS_ZOOM,
      padding: 64,
      select: id,
      transition: true,
    }) === true) return true;
    return this.activateNode?.(id, { transition: false, marker: false }) === true;
  }

  resolveMediaGraphPrimaryFocusId(entryId) {
    return String(entryId || '');
  }

  focusEntry(entryId) {
    let ids = this.getMediaNodeIdsForEntry(entryId);
    if (ids.length === 0) return;
    this.flyToNode?.(ids[0], {
      zoom: PORTFOLIO_MEDIA_FOCUS_ZOOM,
      transitionRoutePadding: 128,
      transitionRouteMaxZoom: 1.15,
    });
  }

  getMediaNodeIdsForEntry(entryId) {
    let id = String(entryId || '');
    if (!id) return [];
    let ids = [];
    let focusIds = new Set([this.resolveMediaGraphPrimaryFocusId(id), id].filter(Boolean));
    let addNodeId = (nodeId) => {
      if (!nodeId || ids.includes(nodeId) || !this.graphDB?.nodes?.has?.(nodeId)) return;
      ids.push(nodeId);
    };
    for (let focusId of focusIds) addNodeId(focusId);
    for (let node of this.graphDB?.nodes?.values?.() || []) {
      let targetIds = [
        node?.params?.targetId,
        node?.targetId,
        ...(Array.isArray(node?.params?.targetIds) ? node.params.targetIds : []),
      ].filter(Boolean);
      if (targetIds.some((targetId) => focusIds.has(targetId))) addNodeId(node.id);
    }
    return ids;
  }
}
class PortfolioGraphPanel extends HTMLElement {
  editable = true;
  viewMode = getCurrentGraphViewMode();
  graphLayout = getCurrentGraphLayout();
  pathStyle = 'pcb';
  innerMenuActions = [];
  /** @type {any} */
  canvas = null;
  /** @type {any} */
  flatGraph = null;
  /** @type {any} */
  mediaGraph = null;
  /** @type {any} */
  graphController = null;

  get flatMode() {
    return this.viewMode === 'flat';
  }

  get structuredMode() {
    return this.viewMode === 'structured';
  }

  connectedCallback() {
    portfolioRuntime.setGraphPanel(this);
    if (!this._menuActionBridgeReady) {
      this._menuActionBridgeReady = true;
      this.addEventListener('panel-menu-actions', (event) => this.onInnerPanelMenuActions(event));
    }
    this.syncPanelMenuActions();
    if (this._ready) {
      this.observeGraphPanelVisibility();
      return;
    }
    this._ready = true;
    this.observeGraphPanelVisibility();
    Promise.all([
      customElements.whenDefined('node-canvas'),
      customElements.whenDefined('canvas-graph'),
    ]).then(() => this.initializeGraphCanvases());
  }

  disconnectedCallback() {
    if (portfolioRuntime.graphPanel === this) portfolioRuntime.setGraphPanel(null);
    this._graphResizeObserver?.disconnect?.();
    this._graphResizeObserver = null;
    this._graphDrawerObserver?.disconnect?.();
    this._graphDrawerObserver = null;
    this.cancelVisibleGraphFocus();
    this.cancelDeferredVisibleGraphFocus();
    this._graphWasVisible = false;
    this._graphVisibleFocusUntil = 0;
    this.cancelStructuredGraphBinding();
    this.cancelStructuredPathUpgrade({ clear: true });
    this.canvas?.suspendLayout?.({ reason: 'panel-disconnected' });
    this.flatGraph?.suspendLayout?.({ reason: 'panel-disconnected' });
  }

  observeGraphPanelVisibility() {
    if (!this.isConnected || this._graphResizeObserver) return;
    this.observeGraphDrawerState();
    let ResizeObserverCtor = globalThis.ResizeObserver;
    if (typeof ResizeObserverCtor !== 'function') {
      this.scheduleVisibleGraphFocus();
      return;
    }
    this._graphResizeObserver = new ResizeObserverCtor(() => this.scheduleVisibleGraphFocus());
    this._graphResizeObserver.observe(this);
    this.scheduleVisibleGraphFocus();
  }

  observeGraphDrawerState() {
    if (this._graphDrawerObserver) return;
    let MutationObserverCtor = globalThis.MutationObserver;
    let drawerNode = this.closest?.('layout-node');
    if (typeof MutationObserverCtor !== 'function' || !drawerNode) return;
    this._graphDrawerObserver = new MutationObserverCtor(() => {
      this._graphWasVisible = false;
      this.scheduleVisibleGraphFocus();
    });
    this._graphDrawerObserver.observe(drawerNode, {
      attributes: true,
      attributeFilter: ['drawer-open', 'drawer-expanded', 'drawer-rail-collapsed', 'style'],
    });
  }

  scheduleVisibleGraphFocus() {
    if (this._visibleGraphFocusFrame) return;
    let scheduleFrame = globalThis.requestAnimationFrame || globalThis.setTimeout;
    this._visibleGraphFocusFrame = scheduleFrame(() => {
      this._visibleGraphFocusFrame = 0;
      this.focusGraphAfterVisibleResize();
    });
  }

  cancelVisibleGraphFocus() {
    if (!this._visibleGraphFocusFrame) return;
    let cancelFrame = globalThis.cancelAnimationFrame || globalThis.clearTimeout;
    cancelFrame?.(this._visibleGraphFocusFrame);
    this._visibleGraphFocusFrame = 0;
  }

  scheduleDeferredVisibleGraphFocus() {
    let setTimer = globalThis.setTimeout;
    if (typeof setTimer !== 'function') return;
    this.cancelDeferredVisibleGraphFocus();
    this._deferredGraphFocusTimer = setTimer(() => {
      this._deferredGraphFocusTimer = 0;
      this._graphVisibleFocusUntil = 0;
      if (this.isGraphPanelVisible()) {
        this.focusVisibleGraphNow();
        this.scheduleStructuredPathUpgrade();
      }
    }, 360);
  }

  cancelDeferredVisibleGraphFocus() {
    if (!this._deferredGraphFocusTimer) return;
    globalThis.clearTimeout?.(this._deferredGraphFocusTimer);
    this._deferredGraphFocusTimer = 0;
  }

  isGraphPanelVisible() {
    let rect = this.getBoundingClientRect?.();
    if (!rect || rect.width < 128 || rect.height < 128) return false;

    let drawerNode = this.closest?.('layout-node');
    if (!drawerNode) return true;
    if (drawerNode.hasAttribute('drawer-rail-collapsed')) return false;
    if (
      drawerNode.hasAttribute('drawer-rail')
      && !drawerNode.hasAttribute('drawer-open')
      && !drawerNode.hasAttribute('drawer-expanded')
    ) {
      return false;
    }
    return true;
  }

  focusGraphAfterVisibleResize() {
    if (!this.isGraphPanelVisible()) {
      this._graphWasVisible = false;
      this._graphVisibleFocusUntil = 0;
      this.cancelDeferredVisibleGraphFocus();
      return;
    }
    if (!this._graphReady) return;
    if (this.structuredMode && !this._structuredBound) {
      this.scheduleStructuredGraphBinding();
    }

    let now = globalThis.performance?.now?.() || Date.now();
    if (!this._graphWasVisible) {
      this._graphWasVisible = true;
      this._graphVisibleFocusUntil = now + 600;
      this.focusVisibleGraphNow();
      this.scheduleDeferredVisibleGraphFocus();
      this.scheduleStructuredPathUpgrade();
      return;
    }

    if (this._graphVisibleFocusUntil && now <= this._graphVisibleFocusUntil) {
      this.focusVisibleGraphNow();
      this.scheduleDeferredVisibleGraphFocus();
      this.scheduleStructuredPathUpgrade();
    }
  }

  focusVisibleGraphNow() {
    this.canvas?.refreshConnections?.();
    portfolioRuntime.syncCanvas({ focus: true, focusScope: 'node-fit' });
  }

  initializeGraphCanvases() {
    if (this._graphReady) return;
    this._graphReady = true;
    this.graphController = createGraphViewModeController({
      mode: this.flatMode ? 'flat' : 'structured',
      pathStyle: this.pathStyle,
      flatPath: null,
    });
    this.ensureActiveGraphRenderer();
    this.applyGraphMode();
    this.applyGraphViewMode();
    this.applyPathStyle();
    this.addEventListener('panel-menu-action', (event) => this.onPanelMenuAction(event));

    requestAnimationFrame(() => {
      portfolioRuntime.setGraphMode(this.viewMode);
      portfolioRuntime.setCanvas(this.canvas);
      portfolioRuntime.setGraphController(this.graphController);
      this.scheduleVisibleGraphFocus();
      this.syncPanelMenuActions();
    });
  }

  ensureActiveGraphRenderer() {
    return this.ensureGraphRenderer(this.viewMode);
  }

  ensureGraphRenderer(mode) {
    if (mode === 'media') {
      this.ensureMediaGraphRenderer();
      return this.mediaGraph;
    }
    if (mode === 'flat') {
      this.ensureFlatGraphRenderer();
      return this.flatGraph;
    }
    this.ensureStructuredGraphRenderer();
    return this.canvas;
  }

  ensureStructuredGraphRenderer() {
    if (this.canvas) return this.canvas;
    let canvas = /** @type {any} */ (document.createElement('node-canvas'));
    canvas.className = 'portfolio-canvas';
    if (this.firstChild) {
      this.insertBefore(canvas, this.firstChild);
    } else {
      this.append(canvas);
    }
    this.canvas = canvas;
    canvas.setPanels(false);
    canvas.setViewportLocked(false);
    canvas.setProgressiveConnectionRendering?.(false, 'portfolio-visible-stability');
    this.setStructuredGraphLoading(!this._structuredBound && this.structuredMode);
    this.applyGraphMode();
    this.graphController?.connect?.({
      structuredCanvas: canvas,
      mode: this.flatMode ? 'flat' : 'structured',
    });
    canvas.addEventListener('selection-changed', (event) => {
      let [id] = event.detail?.nodes || [];
      if (!id) return;
      let node = this._structuredEditor?.getNode?.(id);
      if (node?.params?.media?.activation?.provider) {
        let expected = id === portfolioRuntime.expectedStructuredMediaId;
        let previousExpectedMediaId = portfolioRuntime.expectedStructuredMediaId;
        portfolioRuntime.expectedStructuredMediaId = '';
        if (!expected && !portfolioRuntime.routeToMediaArticle(node, id)) {
          portfolioRuntime.expectedStructuredMediaId = previousExpectedMediaId;
        }
        return;
      }
      if (id !== portfolioRuntime.selectedId) {
        portfolioRuntime.select(id, { focus: false });
      }
    });
    canvas.addEventListener('sn-media-activate', (event) => {
      let nodeId = event.detail?.nodeId || '';
      let node = this._structuredEditor?.getNode?.(nodeId);
      if (!node) return;
      let previousExpectedMediaId = portfolioRuntime.expectedStructuredMediaId;
      portfolioRuntime.expectedStructuredMediaId = '';
      if (!portfolioRuntime.routeToMediaArticle(node, nodeId)) {
        portfolioRuntime.expectedStructuredMediaId = previousExpectedMediaId;
      }
    });
    let releaseStructuredExpectedMedia = () => {
      portfolioRuntime.expectedStructuredMediaId = '';
    };
    canvas.addEventListener('pointerdown', releaseStructuredExpectedMedia, { capture: true });
    canvas.addEventListener('keydown', releaseStructuredExpectedMedia, { capture: true });
    canvas.addEventListener('toolbar-action', (event) => this.onStructuredGraphToolbarAction(event));
    this.scheduleStructuredGraphBinding();
    return canvas;
  }

  scheduleStructuredGraphBinding() {
    if (
      this._structuredBound
      || this._structuredBindingTimer
      || this._structuredBindingFrame
      || this._structuredBindingIdleFrame
      || !this.canvas
    ) return;
    if (!this.isGraphPanelVisible()) {
      this.setStructuredGraphLoading(false);
      return;
    }
    this._structuredBindingTimer = globalThis.setTimeout(() => {
      this._structuredBindingTimer = 0;
      if (!this.structuredMode || !this.canvas || this._structuredBound) return;
      this.queueStructuredGraphBinding();
    }, 450);
  }

  queueStructuredGraphBinding() {
    if (this._structuredBindingFrame || this._structuredBindingIdleFrame) return;
    this.setStructuredGraphLoading(true);
    let callback = () => {
      this._structuredBindingFrame = 0;
      this._structuredBindingIdleFrame = 0;
      this.bindStructuredGraphRenderer();
    };
    if (typeof globalThis.requestIdleCallback === 'function') {
      this._structuredBindingIdleFrame = globalThis.requestIdleCallback(callback, { timeout: 600 });
      return;
    }
    this._structuredBindingFrame = globalThis.setTimeout(callback, 0);
  }

  cancelStructuredGraphBinding() {
    if (this._structuredBindingTimer) {
      globalThis.clearTimeout?.(this._structuredBindingTimer);
      this._structuredBindingTimer = 0;
    }
    if (this._structuredBindingFrame) {
      globalThis.clearTimeout?.(this._structuredBindingFrame);
      this._structuredBindingFrame = 0;
    }
    if (this._structuredBindingIdleFrame) {
      globalThis.cancelIdleCallback?.(this._structuredBindingIdleFrame);
      this._structuredBindingIdleFrame = 0;
    }
  }

  bindStructuredGraphRenderer() {
    if (this._structuredBound || !this.structuredMode || !this.canvas) return;
    if (!this.isGraphPanelVisible()) {
      this.setStructuredGraphLoading(false);
      return;
    }
    this.setStructuredGraphLoading(true);
    this.setStructuredStartupPath();
    try {
      let editor = this._structuredEditor || createPortfolioEditor();
      this._structuredEditor = editor;
      this.graphController?.setStructuredEditor?.(editor);
      setNodePositions(this.canvas, orderedPortfolioProjects);
      this.canvas._layoutReleasedDom = false;
      this._structuredBound = true;
      this._structuredPathReady = false;
      this._structuredPathReadyStyle = '';
      portfolioRuntime.syncCanvas({ focus: true, focusScope: 'node-fit' });
      this.scheduleStructuredPathUpgrade();
    } finally {
      this.setStructuredGraphLoading(false);
    }
  }

  setStructuredGraphLoading(active) {
    this.toggleAttribute('data-loading', Boolean(active));
    this.setAttribute('aria-busy', active ? 'true' : 'false');
  }

  setStructuredStartupPath() {
    if (!this.canvas) return;
    this.canvas.setTransientPathStyle?.(
      '',
      'portfolio-startup',
      {}
    );
  }

  scheduleStructuredPathUpgrade() {
    this.cancelStructuredPathUpgrade();
    if (!this.canvas || !this.structuredMode) {
      this.setStructuredStartupPath();
      return;
    }
    if (this._structuredPathReady && this._structuredPathReadyStyle === this.pathStyle) return;
    this.setStructuredStartupPath();
    this._structuredPathReady = true;
    this._structuredPathReadyStyle = this.pathStyle;
  }

  cancelStructuredPathUpgrade({ clear = false } = {}) {
    if (clear) {
      this.setStructuredStartupPath();
      this._structuredPathReady = false;
      this._structuredPathReadyStyle = '';
    }
  }

  ensureMediaGraphRenderer() {
    if (this.mediaGraph) return this.mediaGraph;
    let mediaGraph = /** @type {any} */ (document.createElement('portfolio-media-canvas-graph'));
    mediaGraph.className = 'portfolio-media-graph';
    mediaGraph.setAttribute('device-orientation-parallax', '');
    mediaGraph.setAttribute('device-orientation-parallax-strength', '28');
    mediaGraph.setAttribute('device-orientation-parallax-max-tilt', '32');
    mediaGraph.setAttribute('active-node-scale', String(PORTFOLIO_MEDIA_ACTIVE_NODE_SCALE));
    mediaGraph.setAttribute('info-panel-scale', String(PORTFOLIO_MEDIA_INFO_PANEL_SCALE));
    this.append(mediaGraph);
    this.mediaGraph = mediaGraph;
    let mediaModel = this._mediaModel || createPortfolioMediaGraphModel();
    this._mediaModel = mediaModel;
    mediaGraph.setGraphModel?.(mediaModel);
    mediaGraph.setActionItems?.(createPortfolioNodeActionItems());
    mediaGraph.addEventListener('file-selected', (event) => {
      let path = event.detail?.path || '';
      let media = getMediaGraphDescriptor(mediaGraph, path);
      if (media) {
        portfolioRuntime.selectMediaNode(path, mediaGraph);
        return;
      }
      let id = resolveMediaGraphSelection(mediaGraph, path);
      if (id && id !== portfolioRuntime.selectedId) {
        portfolioRuntime.select(id, { focus: false });
      }
    });
    mediaGraph.addEventListener('group-selected', (event) => {
      let id = resolveMediaGraphSelection(mediaGraph, event.detail?.path || '');
      if (id && id !== portfolioRuntime.selectedId) {
        portfolioRuntime.select(id, { focus: false });
      }
    });
    let mediaGraphInitialFocusDone = false;
    let mediaGraphInitialFocusUntil = 0;
    let disarmMediaGraphInitialFocus = () => {
      if (mediaGraphInitialFocusDone) return;
      mediaGraphInitialFocusDone = true;
      mediaGraph.removeEventListener('layout-tick', refocusMediaGraphAfterLayout);
      mediaGraph.removeEventListener('layout-done', refocusMediaGraphAfterLayout);
      mediaGraph.removeEventListener('pointerdown', disarmMediaGraphInitialFocus);
    };
    let refocusMediaGraphAfterLayout = (event) => {
      if (mediaGraphInitialFocusDone) return;
      if (this.viewMode !== 'media') {
        disarmMediaGraphInitialFocus();
        return;
      }
      let rect = mediaGraph.canvas?.getBoundingClientRect?.() || mediaGraph.getBoundingClientRect?.();
      if (!rect || rect.width < 128 || rect.height < 128) return;
      let now = globalThis.performance?.now?.() || Date.now();
      if (!mediaGraphInitialFocusUntil) mediaGraphInitialFocusUntil = now + 3000;
      portfolioRuntime.syncCanvas({ focus: true, focusScope: 'node-fit' });
      if (now >= mediaGraphInitialFocusUntil) {
        disarmMediaGraphInitialFocus();
      }
    };
    mediaGraph.addEventListener('layout-tick', refocusMediaGraphAfterLayout);
    mediaGraph.addEventListener('layout-done', refocusMediaGraphAfterLayout);
    mediaGraph.addEventListener('pointerdown', disarmMediaGraphInitialFocus, { once: true });
    mediaGraph.addEventListener('toolbar-action', (event) => this.onMediaGraphToolbarAction(event));
    mediaGraph.addEventListener('orientation-parallax-status', (event) => this.onFlatGraphOrientationParallaxStatus(event));
    portfolioRuntime.setMediaGraph(mediaGraph);
    return mediaGraph;
  }

  ensureFlatGraphRenderer() {
    if (this.flatGraph) return this.flatGraph;
    let flatGraph = /** @type {any} */ (document.createElement('canvas-graph'));
    flatGraph.className = 'portfolio-flat-graph';
    flatGraph.setAttribute('device-orientation-parallax', '');
    flatGraph.setAttribute('device-orientation-parallax-strength', '28');
    flatGraph.setAttribute('device-orientation-parallax-max-tilt', '32');
    this.append(flatGraph);
    this.flatGraph = flatGraph;
    flatGraph._buildInfoLines = (node) => buildPortfolioFlatGraphInfoLines(flatGraph, node);
    let flatModel = this._flatModel || createPortfolioFlatGraphModel();
    this._flatModel = flatModel;
    this.graphController?.connect?.({
      flatGraph,
      flatModel,
      flatPath: null,
      mode: this.flatMode ? 'flat' : 'structured',
    });
    flatGraph.setActionItems?.(createPortfolioNodeActionItems());
    flatGraph?.addEventListener('file-selected', (event) => {
      let id = resolveFlatGraphSelection(event.detail?.path || '');
      if (id && id !== portfolioRuntime.selectedId) {
        portfolioRuntime.select(id, { focus: false });
      }
    });
    flatGraph?.addEventListener('group-selected', (event) => {
      let id = resolveFlatGraphSelection(event.detail?.path || '');
      if (id && id !== portfolioRuntime.selectedId) {
        portfolioRuntime.select(id, { focus: false });
      }
    });
    flatGraph?.addEventListener('toolbar-action', (event) => this.onFlatGraphToolbarAction(event));
    flatGraph?.addEventListener('orientation-parallax-status', (event) => this.onFlatGraphOrientationParallaxStatus(event));
    return flatGraph;
  }

  onStructuredGraphToolbarAction(event) {
    let action = event.detail?.action || '';
    let id = event.detail?.nodeId || '';
    let mediaNode = this._structuredEditor?.getNode?.(id);
    if (mediaNode?.params?.media?.activation?.provider) {
      let previousExpectedMediaId = portfolioRuntime.expectedStructuredMediaId;
      portfolioRuntime.expectedStructuredMediaId = '';
      if (!portfolioRuntime.routeToMediaArticle(mediaNode, id)) {
        portfolioRuntime.expectedStructuredMediaId = previousExpectedMediaId;
      }
      return;
    }
    if (!portfolioRuntime.entries.has(id)) return;

    if (action === 'explore') {
      portfolioRuntime.select(id, { focus: true, focusScope: 'group' });
      return;
    }

    if (action === 'view-code') {
      portfolioRuntime.select(id, { focus: false });
    }
  }

  onMediaGraphToolbarAction(event) {
    let action = event.detail?.action || '';
    let graph = event.currentTarget || this.mediaGraph;
    let nodeId = event.detail?.nodeId || '';
    if (action === 'content' && getMediaGraphDescriptor(graph, nodeId)) {
      portfolioRuntime.selectMediaNode(nodeId, graph);
      return;
    }
    let id = resolveMediaGraphSelection(graph, nodeId);
    if (!id) return;
    let entry = portfolioRuntime.entries.get(id);
    if (!entry) return;
    let node = graph?.graphDB?.nodes?.get?.(nodeId);
    let href = node?.params?.href || entry.href || '';

    if (action === 'open') {
      if (href && typeof globalThis.open === 'function') {
        globalThis.open(href, '_blank', 'noopener');
        return;
      }
      portfolioRuntime.select(id, { focus: false });
      return;
    }

    if (action === 'branch') {
      portfolioRuntime.select(id, { focus: true, focusScope: 'group' });
      return;
    }

    if (action === 'content') {
      portfolioRuntime.select(id, { focus: false });
    }
  }

  onFlatGraphToolbarAction(event) {
    let action = event.detail?.action || '';
    let id = resolveFlatGraphSelection(event.detail?.nodeId || '');
    if (!id) return;
    let entry = portfolioRuntime.entries.get(id);
    if (!entry) return;

    if (action === 'open') {
      if (entry.href && typeof globalThis.open === 'function') {
        globalThis.open(entry.href, '_blank', 'noopener');
        return;
      }
      portfolioRuntime.select(id, { focus: false });
      return;
    }

    if (action === 'branch') {
      portfolioRuntime.select(id, { focus: true, focusScope: 'group' });
      return;
    }

    if (action === 'content') {
      portfolioRuntime.select(id, { focus: false });
    }
  }

  onFlatGraphOrientationParallaxStatus(event) {
    let detail = event.detail || {};
    let target = event.currentTarget || this.flatGraph;
    target?.setAttribute?.(
      'data-orientation-parallax',
      detail.enabled ? 'enabled' : detail.reason || detail.permission || 'disabled'
    );
  }

  applyGraphMode() {
    if (!this.canvas) return;
    this.canvas.setReadonly(!this.editable);
    this.canvas.setReadonlyNodeDragging(false);
  }

  applyGraphViewMode() {
    let mode = this.viewMode;
    this.ensureGraphRenderer(mode);
    portfolioRuntime.setGraphMode(mode);
    this.setAttribute('data-mode', mode);
    if (mode === 'flat' || mode === 'structured') {
      this.graphController?.setMode(mode, { notify: false });
    }
    if (this.mediaGraph) this.mediaGraph.hidden = mode !== 'media';
    if (this.flatGraph) this.flatGraph.hidden = mode !== 'flat';
    if (this.canvas) this.canvas.hidden = mode !== 'structured';
    if (mode === 'structured') {
      this.scheduleStructuredGraphBinding();
      if (this._structuredBound) this.scheduleStructuredPathUpgrade();
    } else {
      this.cancelStructuredGraphBinding();
      this.cancelStructuredPathUpgrade({ clear: true });
      this.setStructuredGraphLoading(false);
      if (this.canvas?._layoutReleasedDom) {
        this._structuredBound = false;
      }
    }
    portfolioRuntime.syncCanvas({ focus: true, focusScope: 'group' });
  }

  setGraphViewMode(mode) {
    this.viewMode = ['media', 'flat', 'structured'].includes(mode) ? mode : PORTFOLIO_DEFAULT_GRAPH_VIEW_MODE;
    this.applyGraphViewMode();
    if (typeof location !== 'undefined' && typeof history !== 'undefined') {
      let nextUrl = new URL(location.href);
      if (this.viewMode === PORTFOLIO_DEFAULT_GRAPH_VIEW_MODE) {
        nextUrl.searchParams.delete('mode');
      } else {
        nextUrl.searchParams.set('mode', this.viewMode);
      }
      if (nextUrl.href !== location.href) {
        history.replaceState(history.state, '', nextUrl);
      }
    }
    this.dispatchEvent(new CustomEvent('graph-shell-mode-change', {
      bubbles: true,
      composed: true,
      detail: { mode: this.viewMode },
    }));
  }

  applyPathStyle() {
    if (this.graphController) {
      this.graphController.setPathStyle(this.pathStyle);
      this.syncStructuredPathStyleSideEffects();
      return;
    }
    this.canvas?.setPathStyle?.(this.pathStyle);
    this.canvas?.refreshConnections?.();
  }

  syncStructuredPathStyleSideEffects() {
    if (this.pathStyle === 'straight') {
      this.cancelStructuredPathUpgrade({ clear: true });
    } else if (this._structuredBound && this.structuredMode) {
      this._structuredPathReady = false;
      this._structuredPathReadyStyle = '';
      this.scheduleStructuredPathUpgrade();
    }
  }

  syncPanelMenuActions() {
    let pathStyleActionOptions = getGraphPathStyleMenuActionOptions();
    let pathStyleActions = this.structuredMode
      ? this.graphController?.getPathStyleMenuActions?.(pathStyleActionOptions)
        || createGraphPathStyleMenuActions({
          ...pathStyleActionOptions,
          mode: this.viewMode,
          pathStyle: this.pathStyle,
        })
      : [];
    this.dispatchEvent(new CustomEvent('panel-menu-actions', {
      bubbles: true,
      composed: true,
      detail: {
        actions: createGraphPanelMenuActions({
          ...this,
          pathStyleActions,
          innerMenuActions: this.structuredMode ? this.innerMenuActions : [],
        }),
      },
    }));
  }

  onInnerPanelMenuActions(event) {
    if (event.target === this) return;
    event.stopPropagation();
    this.innerMenuActions = Array.isArray(event.detail?.actions) ? event.detail.actions : [];
    this.syncPanelMenuActions();
  }

  onPanelMenuAction(event) {
    let actionId = event.detail?.actionId || '';
    if (actionId === 'graph:fit') {
      this.graphController?.fitView();
    } else if (actionId === 'graph:edit-toggle') {
      this.editable = !this.editable;
      this.applyGraphMode();
    } else if (actionId === 'graph:media-mode') {
      this.setGraphViewMode('media');
    } else if (actionId === 'graph:flat-mode') {
      this.setGraphViewMode('flat');
    } else if (actionId === 'graph:structured-mode') {
      this.setGraphViewMode('structured');
    } else if (actionId.startsWith('path:')) {
      if (!this.runPathStyleMenuAction(actionId)) return;
    } else if (actionId.startsWith('graph-layout:')) {
      let layoutAlgo = actionId.slice('graph-layout:'.length);
      if (!this.setGraphLayout(layoutAlgo)) return;
    } else if (this.runInnerPanelMenuAction(event)) {
      return;
    } else {
      return;
    }
    this.syncPanelMenuActions();
  }

  syncGraphLayoutFromUrl() {
    let graphLayout = getCurrentGraphLayout();
    if (graphLayout === this.graphLayout) return false;
    this.graphLayout = graphLayout;
    if (this.canvas && this.structuredMode && this._structuredBound) {
      setNodePositions(this.canvas, orderedPortfolioProjects, this.graphLayout);
    }
    this.syncPanelMenuActions();
    return true;
  }

  setGraphLayout(layoutAlgo) {
    if (!PORTFOLIO_STRUCTURED_LAYOUT_IDS.includes(layoutAlgo)) return false;
    this.graphLayout = normalizePortfolioStructuredLayout(layoutAlgo);
    if (typeof location !== 'undefined' && typeof history !== 'undefined') {
      let nextUrl = setPortfolioStructuredLayoutInUrl(location.href, this.graphLayout);
      if (nextUrl.href !== location.href) {
        history.replaceState(history.state, '', nextUrl);
      }
    }
    if (this.canvas && this.structuredMode && this._structuredBound) {
      setNodePositions(this.canvas, orderedPortfolioProjects, this.graphLayout);
      portfolioRuntime.syncCanvas({ focus: true, focusScope: 'node-fit' });
    }
    return true;
  }

  runPathStyleMenuAction(actionId) {
    if (!this.structuredMode) return false;
    if (this.graphController?.runPathStyleMenuAction?.(actionId)) {
      this.pathStyle = this.graphController.getState?.().pathStyle || this.pathStyle;
      this.syncStructuredPathStyleSideEffects();
      return true;
    }
    let style = resolveGraphPathStyleAction(actionId);
    if (!style) return false;
    this.pathStyle = style;
    this.applyPathStyle();
    return true;
  }

  runInnerPanelMenuAction(event) {
    let actionId = event.detail?.actionId || '';
    if (!this.structuredMode || !this.canvas || !this.innerMenuActions.some((action) => action.id === actionId)) {
      return false;
    }
    this.canvas.dispatchEvent(new CustomEvent('panel-menu-action', {
      bubbles: false,
      composed: false,
      detail: event.detail,
    }));
    return true;
  }
}

class PortfolioViewerPanel extends HTMLElement {
  connectedCallback() {
    if (this._ready) return;
    this._ready = true;
    this.innerHTML = /*html*/ `<source-viewer class="portfolio-viewer"></source-viewer>`;
    let viewer = /** @type {any} */ (this.querySelector('source-viewer'));
    if (!viewer) return;
    portfolioRuntime.setViewer(viewer);
  }
}

class PortfolioThemePanel extends HTMLElement {
  connectedCallback() {
    if (this._ready) return;
    this._ready = true;
    this.innerHTML = /*html*/ `<cascade-theme-editor class="portfolio-theme-editor"></cascade-theme-editor>`;
    this.querySelector('cascade-theme-editor')?.setAttribute('share-label', tPortfolio('theme.share'));
  }
}

class PortfolioWorkspace extends HTMLElement {
  connectedCallback() {
    if (this._ready) return;
    this._ready = true;
    this.innerHTML = /*html*/ `
      <panel-layout
        class="portfolio-layout"
        min-panel-size="150"
        min-panel-inline-size="220"
        min-panel-block-size="180"
        responsive-mode="swipe"
        responsive-breakpoint="${PORTFOLIO_LAYOUT_RESPONSIVE_BREAKPOINT}"
        swipe-control="rail"
        overflow-mode="collapse"></panel-layout>
    `;
    let layout = /** @type {any} */ (this.querySelector('panel-layout'));
    if (!layout) return;
    layout.registerPanelType('portfolio-tree', {
      title: tPortfolio('panel.materials'),
      icon: 'folder',
      component: 'portfolio-tree-panel',
      behavior: {
        importance: PORTFOLIO_TREE_PANEL_IMPORTANCE,
        minInlineSize: PORTFOLIO_TREE_PANEL_MIN_INLINE_SIZE,
        collapse: 'auto',
        mobileDock: 'start',
        swipeControl: 'rail',
      },
    });
    layout.registerPanelType('portfolio-graph', {
      title: tPortfolio('panel.graph'),
      icon: 'hub',
      component: 'portfolio-graph-panel',
      behavior: {
        importance: PORTFOLIO_GRAPH_PANEL_IMPORTANCE,
        minInlineSize: PORTFOLIO_GRAPH_PANEL_MIN_INLINE_SIZE,
        collapse: 'auto',
        mobileDock: 'end',
        swipeControl: 'rail',
      },
      menuActions: createGraphPanelMenuActions(),
    });
    layout.registerPanelType('portfolio-viewer', {
      title: tPortfolio('panel.content'),
      icon: 'article',
      component: 'portfolio-viewer-panel',
      behavior: {
        importance: 100,
        minInlineSize: PORTFOLIO_VIEWER_PANEL_MIN_INLINE_SIZE,
        collapse: 'never',
        mobileDock: 'primary',
      },
    });
    layout.registerPanelType('portfolio-theme', {
      title: tPortfolio('panel.theme'),
      icon: 'palette',
      component: 'portfolio-theme-panel',
      behavior: { importance: 88, minInlineSize: 320, minBlockSize: 280, collapse: 'manual', mobileDock: 'end', swipeControl: 'rail' },
    });
    this._onThemeOpenFull = () => {
      layout.openPanel('portfolio-theme', {
        direction: 'horizontal',
        ratio: 0.72,
        behavior: { importance: 88, minInlineSize: 320, minBlockSize: 280, collapse: 'manual', mobileDock: 'end', swipeControl: 'rail' },
        source: 'cascade-theme-widget',
        uiInvoked: true,
      });
    };
    this._onOpenMaterials = () => {
      if (typeof layout.toggleDrawer === 'function' && layout.hasAttribute('drawer-mode-active')) {
        layout.toggleDrawer('start');
        return;
      }
      let handle = layout.querySelector('.layout-drawer-handle-stack-start [data-drawer-panel-id]');
      if (handle) {
        handle.click();
      }
    };
    document.addEventListener('cascade-theme-open-full', this._onThemeOpenFull);
    document.addEventListener('portfolio-open-materials', this._onOpenMaterials);
    layout.setLayout(createPortfolioLayoutTree());
  }

  disconnectedCallback() {
    if (this._onThemeOpenFull) {
      document.removeEventListener('cascade-theme-open-full', this._onThemeOpenFull);
    }
    if (this._onOpenMaterials) {
      document.removeEventListener('portfolio-open-materials', this._onOpenMaterials);
    }
  }
}

customElements.define('portfolio-tree-panel', PortfolioTreePanel);
customElements.define('portfolio-media-canvas-graph', /** @type {any} */ (PortfolioMediaCanvasGraph));
customElements.define('portfolio-graph-panel', PortfolioGraphPanel);
customElements.define('portfolio-viewer-panel', PortfolioViewerPanel);
customElements.define('portfolio-theme-panel', PortfolioThemePanel);
customElements.define('portfolio-workspace', PortfolioWorkspace);
