import { CASCADE_THEME_REGISTER_STORAGE_SUFFIX } from 'symbiote-ui/themes/cascade-theme.js';

const BUILD_STORAGE_KEY = 'cv:theme-build-id';
const THEME_STORAGE_KEY = 'symbiote-ui:cascade-theme-editor';

/**
 * @param {string} buildId
 * @param {Storage} storage
 * @returns {boolean}
 */
export default function resetPortfolioThemeForBuild(buildId, storage) {
  if (!buildId) throw new Error('Missing CV build identity; rebuild the site before publishing.');
  if (storage.getItem(BUILD_STORAGE_KEY) === buildId) return false;
  storage.removeItem(THEME_STORAGE_KEY);
  storage.removeItem(THEME_STORAGE_KEY + CASCADE_THEME_REGISTER_STORAGE_SUFFIX);
  storage.setItem(BUILD_STORAGE_KEY, buildId);
  return true;
}
