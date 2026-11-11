import assert from 'node:assert/strict';
import test from 'node:test';
import { createCascadeTheme } from 'symbiote-ui/themes/cascade-theme.js';
import installPortfolioNotchsetTheme, {
  getPortfolioNotchsetOverrides,
} from '../../src/static-pages/js/notchset-theme/index.js';
import {
  PORTFOLIO_THEME_LIGHT_STATE,
  PORTFOLIO_THEME_DARK_STATE,
} from '../../src/static-pages/data/portfolioThemeDefaults.js';

const PRESETS = { light: PORTFOLIO_THEME_LIGHT_STATE, dark: PORTFOLIO_THEME_DARK_STATE };

test('Notchset source aliases survive the public bounded Cascade override contract', () => {
  for (let state of Object.values(PRESETS)) {
    let overrides = getPortfolioNotchsetOverrides(state, PRESETS);
    let theme = createCascadeTheme({ params: state, overrides });
    for (let [key, value] of Object.entries(overrides)) assert.equal(theme.tokens[key], value);
    assert.equal(theme.tokens['--sn-sys-surface'], 'var(--notchset-background)');
    assert.equal(theme.tokens['--sn-sys-on-surface'], 'var(--notchset-foreground)');
    assert.equal(theme.tokens['--sn-portfolio-signal'], 'var(--notchset-signal)');
  }
});

test('Cascade edits transform the source palette instead of replacing or freezing it', () => {
  let state = { ...PRESETS.light, hue: 120, brightness: 30, outline: 20 };
  let overrides = getPortfolioNotchsetOverrides(state, PRESETS);
  let theme = createCascadeTheme({ params: state, overrides });
  for (let [key, value] of Object.entries(overrides)) assert.equal(theme.tokens[key], value);
  assert.match(theme.tokens['--sn-sys-surface'], /^hsl\(from var\(--notchset-background\)/);
  assert.match(theme.tokens['--sn-sys-outline'], /alpha \* 0\.364/);
  assert.match(theme.tokens['--sn-portfolio-signal'], /h \+ 108/);
});

test('Modern accents stay vivid while frame and text colors remain neutral', () => {
  let state = { ...PRESETS.dark, themeVariant: 'modern', hue: 218, chroma: 89, outline: 55 };
  let overrides = getPortfolioNotchsetOverrides(state, PRESETS);
  assert.equal(overrides['--sn-layout-border'], 'var(--notchset-foreground)');
  assert.equal(overrides['--sn-sys-on-surface'], 'var(--notchset-foreground)');
  assert.equal(overrides['--sn-button-primary-bg'], 'var(--notchset-primary)');
  assert.match(overrides['--sn-portfolio-signal'], /h \+ 206/);
  assert.match(overrides['--sn-portfolio-signal'], /s \* 0\.890/);
});

test('theme bridge follows root state changes and leaves isolated scopes alone', () => {
  let doc = Object.assign(new EventTarget(), { documentElement: { dataset: {} }, querySelectorAll: () => [] });
  let calls = [];
  let stop = installPortfolioNotchsetTheme(doc, PRESETS, (...args) => calls.push(args));
  let emit = (detail) => doc.dispatchEvent(new CustomEvent('cascade-theme-change', { detail }));
  emit({ state: PRESETS.dark, targetSelector: ':root' });
  assert.equal(doc.documentElement.dataset.portfolioThemeMode, 'dark');
  assert.equal(calls[0][1].tokens['--sn-sys-surface'], 'var(--notchset-background)');
  assert.equal(calls[0][1].name, 'notchset');
  emit({ state: PRESETS.light, targetSelector: '#isolated-preview' });
  assert.equal(calls.length, 1);
  doc.state = PRESETS.light;
  doc.dispatchEvent(new CustomEvent('cascade-geometry-register-change', {
    detail: { register: 'tool', targetSelector: ':root' },
  }));
  assert.equal(doc.documentElement.dataset.portfolioThemeMode, 'light');
  assert.equal(calls.length, 2);
  stop();
  emit({ state: PRESETS.light });
  assert.equal(calls.length, 2);
});

test('automatic colour controls keep source surfaces and inherit global chroma', () => {
  let state = {
    ...PRESETS.light,
    bgLightness: -1,
    surfaceLightness: -1,
    accentLightness: -1,
    accentChroma: -1,
  };
  let overrides = getPortfolioNotchsetOverrides(state, PRESETS);
  assert.equal(overrides['--sn-sys-surface'], 'var(--notchset-background)');
  assert.equal(overrides['--sn-sys-surface-panel'], 'var(--notchset-card)');
  assert.equal(overrides['--sn-portfolio-signal'], 'var(--notchset-signal)');
  let grayscale = getPortfolioNotchsetOverrides({ ...state, chroma: 0 }, PRESETS);
  assert.match(grayscale['--sn-portfolio-signal'], /s \* 0\.000/);
  assert.deepEqual(createCascadeTheme({ params: state, overrides }).overrides, overrides);
});

test('motion control stops the chat background and resumes its existing semantic phase', () => {
  let stopped = 0;
  let resumed = [];
  let workspace = {
    dataset: { backgroundState: 'responding' },
    getBackground: () => ({ stop: () => { stopped++; } }),
    setBackgroundState: (state) => resumed.push(state),
  };
  let doc = Object.assign(new EventTarget(), {
    documentElement: { dataset: {} },
    querySelectorAll: (selector) => selector === 'chat-workspace' ? [workspace] : [],
  });
  let stop = installPortfolioNotchsetTheme(doc, PRESETS, () => {});
  let emit = (motion) => doc.dispatchEvent(new CustomEvent('cascade-theme-change', {
    detail: { state: { ...PRESETS.light, motion }, targetSelector: ':root' },
  }));
  emit(0);
  assert.equal(stopped, 1);
  emit(100);
  assert.deepEqual(resumed, [{ state: 'responding' }]);
  stop();
  emit(0);
  assert.equal(stopped, 1);
});
