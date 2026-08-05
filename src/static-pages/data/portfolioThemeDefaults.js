/**
 * Default Cascade theme states for the portfolio site.
 * Light state decoded from the canonical share URL token.
 * Dark state provided explicitly with its own parameter set.
 */
export const PORTFOLIO_THEME_LIGHT_STATE = Object.freeze({
  accentChroma: 100,
  accentLightness: 30,
  bgLightness: 90,
  brightness: 83,
  cellRadius: 25,
  chroma: 78,
  composerRadius: 100,
  contrast: 67,
  density: 101,
  frameGap: 0,
  frameRadius: 29,
  heading: 91,
  hue: 190,
  mode: 'light',
  motion: 100,
  outline: 8,
  pattern: 100,
  radius: 28,
  scrollShadow: 17,
  surfaceLightness: 100,
  tabRadius: 17,
  tabShape: 'classic-ear',
  themeVariant: 'classic',
  type: 106,
});

export const PORTFOLIO_THEME_DARK_STATE = Object.freeze({
  accentChroma: -1,
  accentLightness: -1,
  bgLightness: -1,
  brightness: 8,
  cellRadius: 25,
  chroma: 71,
  composerRadius: 100,
  contrast: 100,
  density: 101,
  frameGap: 0,
  frameRadius: 29,
  heading: 91,
  hue: 190,
  mode: 'dark',
  motion: 100,
  outline: 8,
  pattern: 100,
  radius: 28,
  scrollShadow: 17,
  surfaceLightness: -1,
  tabRadius: 17,
  tabShape: 'classic-ear',
  themeVariant: 'classic',
  type: 106,
});

/**
 * The portfolio supplies its light preset as a consumer-level default,
 * independent from the library default theme.
 */
export const PORTFOLIO_THEME_DEFAULT_STATE = PORTFOLIO_THEME_LIGHT_STATE;

/**
 * JSON string of the default state for the `default-state` attribute.
 */
export const PORTFOLIO_THEME_DEFAULT_STATE_ATTR = JSON.stringify(PORTFOLIO_THEME_DEFAULT_STATE);
