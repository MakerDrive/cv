import { PORTFOLIO_MEDIA_CATALOG } from '../src/static-pages/data/portfolioMediaCatalog.js';
import { loadProjectEntries } from '../src/static-pages/data/projects.js';
import { getPublicPublications } from '../src/static-pages/data/publications.js';
import {
  SOCIAL_CARD_HEIGHT,
  SOCIAL_CARD_WIDTH,
  getSocialCardFileName,
  getSocialCardOutputPath,
} from '../src/static-pages/data/socialCardPaths.js';

function uniqueSources(sources) {
  return [...new Set(sources.filter(Boolean))];
}

function getMediaSources(targetId, mediaCatalog) {
  return mediaCatalog
    .filter((descriptor) => descriptor.targetIds?.includes(targetId))
    .map((descriptor) => descriptor.poster || descriptor.activation?.src)
    .filter(Boolean);
}

function createCard(id, kind, title, sources) {
  return Object.freeze({
    id,
    kind,
    title,
    sources: Object.freeze(uniqueSources(sources)),
    fileName: getSocialCardFileName(id),
    outputPath: getSocialCardOutputPath(id),
    width: SOCIAL_CARD_WIDTH,
    height: SOCIAL_CARD_HEIGHT,
  });
}

/**
 * @param {Object} [options]
 * @param {Array<Object>} [options.projects]
 * @param {Array<Object>} [options.publications]
 * @param {Array<Object>} [options.mediaCatalog]
 * @returns {Array<Object>}
 */
export function createSocialCardManifest({
  projects = loadProjectEntries(),
  publications = getPublicPublications(),
  mediaCatalog = PORTFOLIO_MEDIA_CATALOG,
} = {}) {
  let projectById = new Map(
    projects.map((project) => [`projects/${project.slug}`, project]),
  );
  let projectCards = projects.map((project) => {
    let projectId = `projects/${project.slug}`;
    return createCard(projectId, 'project', project.title, [
      ...getMediaSources(projectId, mediaCatalog),
      project.image,
    ]);
  });
  let publicationCards = publications
    .filter((publication) => publication.status === 'published')
    .map((publication) => {
      let project = projectById.get(publication.primaryProjectId);
      return createCard(
        publication.id,
        'publication',
        publication.locales?.en?.title || publication.slug,
        [
          ...getMediaSources(publication.id, mediaCatalog),
          ...getMediaSources(publication.primaryProjectId, mediaCatalog),
          project?.image,
        ],
      );
    });

  return Object.freeze([...projectCards, ...publicationCards]);
}
