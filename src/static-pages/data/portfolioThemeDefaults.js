const PORTFOLIO_THEME_SHARED_STATE = Object.freeze({
  accentChroma: -1,
  accentLightness: -1,
  bgLightness: -1,
  cellRadius: 0,
  chroma: 100,
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
  surfaceLightness: -1,
  tabRadius: 0,
  tabShape: 'frame',
  themeVariant: 'default',
  type: 100,
});

export const PORTFOLIO_THEME_LIGHT_STATE = Object.freeze({
  ...PORTFOLIO_THEME_SHARED_STATE,
  brightness: 18,
  contrast: 100,
  mode: 'light',
});

export const PORTFOLIO_THEME_DARK_STATE = Object.freeze({
  ...PORTFOLIO_THEME_SHARED_STATE,
  brightness: 0,
  contrast: 92,
  mode: 'dark',
});

export const PORTFOLIO_THEME_DEFAULT_STATE = PORTFOLIO_THEME_LIGHT_STATE;

export const PORTFOLIO_THEME_DEFAULT_STATE_ATTR = JSON.stringify(PORTFOLIO_THEME_DEFAULT_STATE);
