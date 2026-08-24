export const SOCIAL_CARD_WIDTH = 1200;
export const SOCIAL_CARD_HEIGHT = 630;

const SOCIAL_CARD_ID_PATTERN = /^(?:projects|pulse)\/[a-z0-9]+(?:-[a-z0-9]+)*$/;
const SOCIAL_CARD_SITE_BASE_URL = 'https://MakerDrive.github.io/cv/social-cards/';

/**
 * @param {string} pageId
 * @returns {string}
 */
export function getSocialCardFileName(pageId) {
  if (!SOCIAL_CARD_ID_PATTERN.test(pageId || '')) {
    throw new Error(
      `Invalid social card page ID "${pageId}". Expected projects/<slug> or pulse/<slug>.`,
    );
  }
  return `${pageId.replace('/', '-')}.png`;
}

/**
 * @param {string} pageId
 * @returns {string}
 */
export function getSocialCardOutputPath(pageId) {
  return `cit/cit-store/social/${getSocialCardFileName(pageId)}`;
}

/**
 * @param {string} pageId
 * @returns {string}
 */
export function getSocialCardLocalUrl(pageId) {
  return `${SOCIAL_CARD_SITE_BASE_URL}${getSocialCardFileName(pageId)}`;
}
