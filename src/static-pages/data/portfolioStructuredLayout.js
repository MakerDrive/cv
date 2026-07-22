import {
  PORTFOLIO_DEFAULT_STRUCTURED_LAYOUT,
  PORTFOLIO_STRUCTURED_LAYOUT_IDS,
  PORTFOLIO_STRUCTURED_LAYOUT_ROOT_ID,
} from './portfolioLayoutConfig.js';
import { PORTFOLIO_PROJECT_IDS } from './portfolioProjectIds.js';
import { getPublicPublications, PUBLICATIONS } from './publications.js';

const PORTFOLIO_STRUCTURED_LAYOUT_GROUP = Object.freeze({
  id: 'graph-layout',
  labelKey: 'graph.layoutGroup',
  order: 22,
});

export const PORTFOLIO_STRUCTURED_LAYOUT_ACTIONS = Object.freeze([
  Object.freeze({
    id: 'graph-layout:crystal',
    layout: 'crystal',
    icon: 'hub',
    labelKey: 'graph.layout.crystal',
    titleKey: 'graph.layout.crystalTitle',
  }),
  Object.freeze({
    id: 'graph-layout:auto',
    layout: 'auto',
    icon: 'schema',
    labelKey: 'graph.layout.auto',
    titleKey: 'graph.layout.autoTitle',
  }),
  Object.freeze({
    id: 'graph-layout:tree',
    layout: 'tree',
    icon: 'account_tree',
    labelKey: 'graph.layout.tree',
    titleKey: 'graph.layout.treeTitle',
  }),
]);

/**
 * @param {unknown} value
 * @returns {'crystal'|'auto'|'tree'}
 */
export function normalizePortfolioStructuredLayout(value) {
  let layout = String(value || '').trim();
  return PORTFOLIO_STRUCTURED_LAYOUT_IDS.includes(layout)
    ? /** @type {'crystal'|'auto'|'tree'} */ (layout)
    : PORTFOLIO_DEFAULT_STRUCTURED_LAYOUT;
}

/**
 * @param {string} search
 * @returns {'crystal'|'auto'|'tree'}
 */
export function getPortfolioStructuredLayoutFromSearch(search = '') {
  let params = new URLSearchParams(search);
  return normalizePortfolioStructuredLayout(params.get('layout'));
}

/**
 * @param {string|URL} input
 * @param {unknown} value
 * @returns {URL}
 */
export function setPortfolioStructuredLayoutInUrl(input, value) {
  let url = new URL(String(input));
  let layout = normalizePortfolioStructuredLayout(value);
  if (layout === PORTFOLIO_DEFAULT_STRUCTURED_LAYOUT) {
    url.searchParams.delete('layout');
  } else {
    url.searchParams.set('layout', layout);
  }
  return url;
}

function getCanonicalPublishedPublications(publications) {
  return getPublicPublications(Array.isArray(publications) ? publications : [])
    .filter((publication) => (
      typeof publication?.id === 'string'
      && typeof publication?.slug === 'string'
      && publication.id === `pulse/${publication.slug}`
    ));
}

function getPortfolioMediaOwnerId(descriptor, { projectIds, publicationIds }) {
  let mediaId = String(descriptor?.id || '').trim();
  if (!mediaId) {
    throw new Error('Structured media descriptor requires a non-empty id.');
  }
  if (mediaId.split('/').some((part) => part === 'cover' || part === 'logo')) {
    throw new Error(`Structured media descriptor "${mediaId}" cannot be a cover or logo.`);
  }
  let ownerIds = (Array.isArray(descriptor?.targetIds) ? descriptor.targetIds : [])
    .map((id) => String(id || '').trim());
  if (new Set(ownerIds).size !== ownerIds.length) {
    throw new Error(`Structured media descriptor "${mediaId}" requires unique targetIds.`);
  }
  if (ownerIds.length === 0 || ownerIds.some((ownerId) => !ownerId)) {
    throw new Error(`Structured media descriptor "${mediaId}" requires a canonical article owner.`);
  }
  let ownerId = ownerIds.find((candidateId) => {
    let isProject = /^projects\/[^/]+$/.test(candidateId) && candidateId !== 'projects/index';
    let isPublication = /^pulse\/[^/]+$/.test(candidateId) && candidateId !== 'pulse/index';
    return (isProject && projectIds.has(candidateId))
      || (isPublication && publicationIds.has(candidateId));
  });
  if (!ownerId) {
    let invalidTarget = ownerIds[0];
    throw new Error(
      `Structured media descriptor "${mediaId}" has an invalid or unpublished target "${invalidTarget}".`
    );
  }
  return ownerId;
}

/**
 * @param {Array<Object>} descriptors
 * @returns {Object<string, string[]>}
 */
export function createPortfolioStructuredMediaGroups(descriptors = [], {
  projectIds = PORTFOLIO_PROJECT_IDS,
  publications = PUBLICATIONS,
} = {}) {
  let mediaByOwner = new Map();
  let mediaIds = new Set();
  let canonicalProjectIds = new Set(projectIds);
  let publishedPublicationIds = new Set(
    getCanonicalPublishedPublications(publications).map((publication) => publication.id)
  );
  let sortedDescriptors = [...descriptors].sort((a, b) => (
    String(a?.id || '').localeCompare(String(b?.id || ''))
  ));

  for (let descriptor of sortedDescriptors) {
    let mediaId = String(descriptor?.id || '').trim();
    let ownerId = getPortfolioMediaOwnerId(descriptor, {
      projectIds: canonicalProjectIds,
      publicationIds: publishedPublicationIds,
    });
    if (mediaIds.has(mediaId)) {
      throw new Error(`Structured media descriptor id "${mediaId}" must be unique.`);
    }
    mediaIds.add(mediaId);
    let ownerMediaIds = mediaByOwner.get(ownerId) || [];
    ownerMediaIds.push(mediaId);
    mediaByOwner.set(ownerId, ownerMediaIds);
  }

  return Object.fromEntries(
    [...mediaByOwner.entries()]
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([ownerId, ownerMediaIds]) => [ownerId, [ownerId, ...ownerMediaIds]])
  );
}

function createPortfolioStructuredAutoGroups({ projectIds, skillIds, mediaGroups, publicationIds, publications = PUBLICATIONS }) {
  const publicPubs = getCanonicalPublishedPublications(publications);
  const pubMap = new Map(publicPubs.map(pub => [pub.id, pub]));
  const projectIdSet = new Set(projectIds);

  let rawPubIds = publicationIds || publicPubs.map((pub) => pub.id);
  let selectedPubs = rawPubIds
    .filter((id, index) => pubMap.has(id) && rawPubIds.indexOf(id) === index)
    .map((id) => pubMap.get(id));
  let pubsByProject = new Map();
  let globalPubs = [];
  for (let pub of selectedPubs) {
    let relatedProjectIds = Array.isArray(pub.relatedProjectIds) ? pub.relatedProjectIds : [];
    if (relatedProjectIds.length === 0) {
      globalPubs.push(pub);
      continue;
    }
    let ownerId = projectIdSet.has(pub.primaryProjectId)
      ? pub.primaryProjectId
      : relatedProjectIds.find((projectId) => projectIdSet.has(projectId));
    if (!ownerId) continue;
    let ownedPubs = pubsByProject.get(ownerId) || [];
    ownedPubs.push(pub);
    pubsByProject.set(ownerId, ownedPubs);
  }

  let projectNodeIds = [];
  for (let projectId of projectIds) {
    projectNodeIds.push(projectId, ...(mediaGroups[projectId] || []).slice(1));
    for (let pub of pubsByProject.get(projectId) || []) {
      projectNodeIds.push(pub.id, ...(mediaGroups[pub.id] || []).slice(1));
    }
  }
  let pulseIds = [];
  for (let pub of globalPubs) {
    pulseIds.push(pub.id, ...(mediaGroups[pub.id] || []).slice(1));
  }

  return {
    biography: [PORTFOLIO_STRUCTURED_LAYOUT_ROOT_ID, 'bio/about'],
    skills: ['skills/index', ...skillIds],
    projects: ['projects/index', ...projectNodeIds],
    pulse: ['pulse/index', ...pulseIds],
  };
}

/**
 * @param {Object} options
 * @returns {Object}
 */
export function createPortfolioStructuredLayoutOptions({
  layout,
  projectIds = [],
  skillIds = [],
  descriptors = [],
  publicationIds,
  publications = PUBLICATIONS,
} = {}) {
  let algorithm = normalizePortfolioStructuredLayout(layout);
  if (algorithm === 'tree') {
    return {
      algorithm,
      startX: 60,
      startY: 60,
      gapX: 120,
      gapY: 56,
      fit: true,
    };
  }

  let mediaGroups = createPortfolioStructuredMediaGroups(descriptors, {
    projectIds,
    publications,
  });
  if (algorithm === 'auto') {
    const publicPubs = getCanonicalPublishedPublications(publications);
    const pubMap = new Map(publicPubs.map(pub => [pub.id, pub]));
    let finalPubIds = (publicationIds || publicPubs.map((pub) => pub.id))
      .filter((id) => pubMap.has(id));
    return {
      algorithm,
      groups: createPortfolioStructuredAutoGroups({ projectIds, skillIds, mediaGroups, publicationIds: finalPubIds, publications }),
      direction: 'LR',
      startX: 0,
      startY: 0,
      gapX: 120,
      gapY: 56,
      maxLayerRows: 4,
      fit: true,
      overlap: {
        paddingX: 40,
        paddingY: 32,
        passes: 16,
      },
    };
  }

  return {
    algorithm,
    rootNodeId: PORTFOLIO_STRUCTURED_LAYOUT_ROOT_ID,
    groups: mediaGroups,
    startX: 0,
    startY: 0,
    fit: true,
  };
}

/**
 * @param {Object} options
 * @returns {Array<Object>}
 */
export function createPortfolioStructuredLayoutMenuActions({ layout, translate } = {}) {
  if (typeof translate !== 'function') {
    throw new Error('Structured layout menu requires a translate function.');
  }
  let activeLayout = normalizePortfolioStructuredLayout(layout);
  return PORTFOLIO_STRUCTURED_LAYOUT_ACTIONS.map((action) => ({
    id: action.id,
    label: translate(action.labelKey),
    icon: action.icon,
    title: translate(action.titleKey),
    group: PORTFOLIO_STRUCTURED_LAYOUT_GROUP.id,
    groupLabel: translate(PORTFOLIO_STRUCTURED_LAYOUT_GROUP.labelKey),
    groupOrder: PORTFOLIO_STRUCTURED_LAYOUT_GROUP.order,
    active: activeLayout === action.layout,
  }));
}
