import { PUBLICATIONS } from './publications.js';
import { resolveSocialCardUrl } from './socialCards.js';

const SITE_BASE_URL = 'https://MakerDrive.github.io/cv';

function getPublicationCanonicalUrl(publication) {
  let canonicalPath = publication.primaryProjectId
    ? `/projects/${publication.primaryProjectId.replace(/^projects\//, '')}/pulse/${publication.slug}/`
    : `/pulse/${publication.slug}/`;
  return `${SITE_BASE_URL}${canonicalPath}`;
}

function resolveRetirementTargetUrl(publication) {
  let target = publication.retirementTarget;
  if (target.startsWith('https://')) return target;

  let targetPublication = PUBLICATIONS.find(candidate => candidate.id === target);
  if (!targetPublication || targetPublication.status !== 'published') {
    throw new Error(
      `Retired publication ${publication.id} must target a currently published publication`,
    );
  }
  return getPublicationCanonicalUrl(targetPublication);
}

export function getPublicationRouteManifest(publications = PUBLICATIONS) {
  let routeEntries = [];

  let routeable = publications.filter(
    p => p.status === 'published' || p.status === 'retired',
  );

  for (let publication of routeable) {
    let isRetired = publication.status === 'retired';

    if (publication.primaryProjectId) {
      let primaryProjectSlug = publication.primaryProjectId.replace(/^projects\//, '');
      routeEntries.push({
        id: publication.id,
        slug: publication.slug,
        path: `/projects/${primaryProjectSlug}/pulse/${publication.slug}/`,
        ...(isRetired ? { retired: true, retirementTarget: publication.retirementTarget } : {}),
      });
      routeEntries.push({
        id: publication.id,
        slug: publication.slug,
        path: `/pulse/${publication.slug}/`,
        isAlias: true,
        ...(isRetired ? { retired: true, retirementTarget: publication.retirementTarget } : {}),
      });
    } else {
      routeEntries.push({
        id: publication.id,
        slug: publication.slug,
        path: `/pulse/${publication.slug}/`,
        ...(isRetired ? { retired: true, retirementTarget: publication.retirementTarget } : {}),
      });
    }
  }

  return routeEntries;
}

export function resolvePublicationMetadata(publicationId, baseTitle = '') {
  if (!publicationId) return null;
  let publication = PUBLICATIONS.find(candidate => candidate.id === publicationId);
  if (!publication) return null;

  if (publication.status === 'retired') {
    let targetUrl = resolveRetirementTargetUrl(publication);
    let title = baseTitle ? `Publication retired | ${baseTitle}` : 'Publication retired';
    return {
      title,
      description: 'This Pulse publication has been retired. '
        + 'Its permalink points to the canonical publication.',
      canonicalUrl: targetUrl,
      primaryProjectId: publication.primaryProjectId,
      socialImage: null,
      retired: true,
      retirementTarget: publication.retirementTarget,
      retirementTargetUrl: targetUrl,
    };
  }

  let localeEn = /** @type {any} */ (publication.locales?.en || {});
  let title = localeEn.title ? (baseTitle ? `${localeEn.title} | ${baseTitle}` : localeEn.title) : undefined;
  let description = localeEn.summary || undefined;
  let canonicalUrl = getPublicationCanonicalUrl(publication);
  return {
    title,
    description,
    canonicalUrl,
    primaryProjectId: publication.primaryProjectId,
    socialImage: resolveSocialCardUrl(publication.id),
  };
}
