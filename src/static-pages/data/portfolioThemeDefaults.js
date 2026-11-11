const PORTFOLIO_THEME_GEOMETRY = Object.freeze({
  cellRadius: 0,
  composerRadius: 0,
  density: 100,
  frameGap: 0,
  frameRadius: 0,
  heading: 100,
  hue: 12,
  motion: 100,
  outline: 55,
  pattern: 28,
  radius: 0,
  scrollShadow: 12,
  tabRadius: 0,
  tabShape: 'frame',
  themeVariant: 'classic',
  type: 100,
});

export const PORTFOLIO_THEME_LIGHT_STATE = Object.freeze({
  ...PORTFOLIO_THEME_GEOMETRY,
  accentChroma: 100,
  accentLightness: 39,
  bgLightness: 92,
  brightness: 18,
  chroma: 4,
  contrast: 100,
  mode: 'light',
  surfaceLightness: 97,
});

export const PORTFOLIO_THEME_DARK_STATE = Object.freeze({
  ...PORTFOLIO_THEME_GEOMETRY,
  accentChroma: 100,
  accentLightness: 59,
  bgLightness: 5,
  brightness: 0,
  chroma: 4,
  contrast: 92,
  mode: 'dark',
  surfaceLightness: 9,
});

export const PORTFOLIO_THEME_DEFAULT_STATE = PORTFOLIO_THEME_LIGHT_STATE;

export const PORTFOLIO_THEME_DEFAULT_STATE_ATTR = JSON.stringify(PORTFOLIO_THEME_DEFAULT_STATE);
