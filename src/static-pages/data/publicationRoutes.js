import { getPublicPublications, PUBLICATIONS } from './publications.js';

export function getPublicationRouteManifest(publications = PUBLICATIONS) {
  return getPublicPublications(publications).flatMap((publication) => {
    if (publication.primaryProjectId) {
      const primaryProjectSlug = publication.primaryProjectId.replace(/^projects\//, '');
      return [
        {
          id: publication.id,
          slug: publication.slug,
          path: `/projects/${primaryProjectSlug}/pulse/${publication.slug}/`,
        },
        {
          id: publication.id,
          slug: publication.slug,
          path: `/pulse/${publication.slug}/`,
          isAlias: true,
        },
      ];
    }
    return [
      {
        id: publication.id,
        slug: publication.slug,
        path: `/pulse/${publication.slug}/`,
      },
    ];
  });
}
export function resolvePublicationMetadata(publicationId, baseTitle = '') {
  if (!publicationId) return null;
  const publication = PUBLICATIONS.find((p) => p.id === publicationId);
  if (!publication) return null;
  const localeEn = /** @type {any} */ (publication.locales?.en || {});
  const title = localeEn.title ? (baseTitle ? `${localeEn.title} | ${baseTitle}` : localeEn.title) : undefined;
  const description = localeEn.summary || undefined;
  const canonicalPath = publication.primaryProjectId
    ? `/projects/${publication.primaryProjectId.replace(/^projects\//, '')}/pulse/${publication.slug}/`
    : `/pulse/${publication.slug}/`;
  const siteBaseUrl = 'https://MakerDrive.github.io/cv';
  const canonicalUrl = `${siteBaseUrl}${canonicalPath}`;
  return {
    title,
    description,
    canonicalUrl,
    primaryProjectId: publication.primaryProjectId,
  };
}
