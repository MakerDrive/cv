import { applyCascadeGeometryRegister } from 'symbiote-ui/themes/cascade-theme.js';
import installMobileShowResize from './mobileShowResize.js';
import installHeadingMotion from './heading-motion.js';

/**
 * @typedef {HTMLElement & {
 *   getBackground?: () => { stop?: () => void },
 *   setBackgroundState?: (config: { state: string }) => void
 * }} ThemeChatWorkspace
 */

const TOKEN_GROUPS = {
  background: 'sys-surface sys-surface-sunken bg canvas-graph-bg source-bg source-editor-bg cell-bg',
  card: 'sys-surface-panel sys-surface-raised panel-bg node-bg node-header-bg layout-sidebar-header-bg '
    + 'source-header-bg card-bg chat-bg chat-agent-message-bg toolbar-bg toolbar-occlusion-bg '
    + 'minimap-bg dialog-bg tabs-bg',
  popover: 'sys-surface-overlay ctx-bg',
  foreground: 'sys-on-surface sys-focus-ring button-border button-color button-hover-border '
    + 'segmented-border text tree-label-color tabs-active-color source-editor-color cell-dot '
    + 'toolbar-color toolbar-title-color dialog-color field-control-color field-label-color '
    + 'field-control-focus-border badge-color badge-neutral-color ctx-color minimap-node-stroke '
    + 'cat-default cat-directory cat-module cat-control',
  'muted-foreground': 'sys-on-surface-dim text-dim tree-muted-color tree-icon-color tree-badge-color '
    + 'field-hint-color field-placeholder-color composer-placeholder-color chat-item-icon-color',
  border: 'sys-outline sys-outline-subtle outline-color node-header-border node-item-border '
    + 'composer-border field-control-subtle-border tabs-divider',
  frame: 'layout-border layout-sidebar-header-border source-border fullscreen-tab-bar-border '
    + 'fullscreen-tab-border node-border node-active-border toolbar-border ctx-border dialog-border '
    + 'card-border card-hover-border badge-border badge-neutral-border tabs-border tabs-active-border shape-stroke',
  field: 'field-control-bg composer-bg',
  'control-edge': 'portfolio-control-edge field-control-border slider-thumb-border',
  destructive: 'sys-danger button-danger-color button-danger-border toolbar-danger-color',
  muted: 'segmented-bg tree-row-selected-bg source-action-bg chat-message-bg '
    + 'field-toggle-bg slider-track-bg progress-bg badge-bg badge-neutral-bg',
  received: 'chat-user-message-bg portfolio-received',
  tool: 'composer-action-bg portfolio-tool-bg',
  secondary: 'button-bg',
  'secondary-hover': 'button-hover-bg segmented-hover-bg source-action-hover-bg '
    + 'code-table-row-hover-bg toolbar-hover ctx-hover node-hover card-hover-bg tabs-hover-bg',
  primary: 'button-primary-bg button-primary-border segmented-selected-bg tabs-accent '
    + 'fullscreen-tab-active-bg node-selected toolbar-active slider-active-bg slider-thumb-bg '
    + 'progress-fill progress-ring-stroke field-toggle-thumb-active-bg',
  'primary-hover': 'composer-send-hover-bg portfolio-ink-hover',
  'primary-foreground': 'button-primary-color segmented-selected-color fullscreen-tab-active-color',
  'signal-text': 'sys-accent',
  signal: 'node-accent portfolio-signal cat-server conn-color',
  'on-signal': 'sys-on-accent portfolio-on-signal',
  'signal-hover': 'portfolio-signal-hover',
  dot: 'grid-dot',
  scrim: 'dialog-backdrop',
};

let colorValue = (source, state, preset) => {
  let signal = source.startsWith('signal') || source === 'destructive';
  let neutral = ['foreground', 'muted-foreground', 'frame', 'primary', 'primary-hover', 'on-signal']
    .includes(source);
  let hue = neutral ? 0 : state.hue - preset.hue;
  let accentChroma = state.accentChroma < 0 ? state.chroma : state.accentChroma;
  let presetAccentChroma = preset.accentChroma < 0 ? preset.chroma : preset.accentChroma;
  let chroma = neutral ? 0 : signal ? accentChroma / presetAccentChroma : state.chroma / preset.chroma;
  let dark = state.mode === 'dark';
  let lightness = (state.brightness - preset.brightness) * (dark ? 0.18 : -0.32);
  if (['foreground', 'primary', 'primary-hover', 'frame', 'on-signal'].includes(source)) {
    lightness = (state.contrast - preset.contrast) * (dark ? 0.12 : -0.26);
  }
  if (source === 'muted-foreground') {
    lightness = (state.contrast - preset.contrast) * (dark ? 0.18 : -0.22);
  }
  if (signal) lightness = (state.contrast - preset.contrast) * (dark ? 0.12 : -0.10);
  let explicitLightness = source === 'background' ? state.bgLightness
    : source === 'card' ? state.surfaceLightness : signal ? state.accentLightness : -1;
  let alpha = ['border', 'frame'].includes(source) ? state.outline / preset.outline
    : source === 'dot' ? state.pattern / preset.pattern : 1;
  let color = `var(--notchset-${source === 'frame' ? 'foreground' : source})`;
  if (!hue && (neutral || chroma === 1) && !lightness && alpha === 1 && explicitLightness < 0) {
    return color;
  }
  let lightnessChannel = explicitLightness >= 0
    ? `${explicitLightness}%` : `calc(l + ${lightness.toFixed(2)})`;
  return `hsl(from ${color} calc(h + ${hue}) calc(s * ${chroma.toFixed(3)}) `
    + `${lightnessChannel} / calc(alpha * ${alpha.toFixed(3)}))`;
};

/**
 * @param {Object} state
 * @param {{ light: Object, dark: Object }} presets
 * @returns {Object<string, string>}
 */
export function getPortfolioNotchsetOverrides(state, presets) {
  let preset = presets[state.mode];
  let overrides = {
    '--sn-font': 'var(--notchset-font-reading)',
    '--sn-font-ui': 'var(--notchset-font-reading)',
    '--sn-portfolio-font-display': 'var(--notchset-font-display)',
    '--sn-font-mono': 'var(--notchset-font-mono)',
    '--sn-node-shadow': 'none',
    '--sn-accent-glow': 'none',
    '--sn-panel-shadow': 'none',
    '--sn-dialog-shadow': 'none',
    '--sn-shadow-sm': 'none',
    '--sn-shadow-md': 'none',
    '--sn-shadow-lg': 'none',
    '--sn-shadow-xl': 'none',
    '--sn-chat-item-child-shadow': 'none',
    '--sn-slider-thumb-shadow': 'none',
    '--sn-node-border-width': 'var(--notchset-rule-width)',
    '--sn-dialog-border-width': 'var(--notchset-rule-width)',
    '--sn-field-control-border-width': 'var(--notchset-rule-width)',
    '--sn-cell-glare': 'transparent',
    '--sn-cell-vignette-mid': 'transparent',
    '--sn-cell-vignette-edge': 'transparent',
    '--sn-cell-noise': 'none',
    '--sn-chat-cell-base-alpha': (0.04 * state.pattern / preset.pattern).toFixed(3),
    '--sn-chat-cell-alpha-span': (0.16 * state.pattern / preset.pattern).toFixed(3),
    '--sn-chat-show-font-family': 'var(--sn-font)',
    '--sn-effect-focus-ring': 'var(--notchset-focus-stroke) solid var(--sn-sys-focus-ring)',
    '--sn-button-focus-ring': '0 0 0 var(--notchset-focus-stroke) var(--sn-sys-focus-ring)',
    '--sn-field-control-focus-shadow': 'none',
    '--sn-field-control-focus-ring': 'var(--sn-effect-focus-ring)',
    '--sn-app-topbar-height': 'calc(64px * var(--sn-theme-density))',
    '--sn-code-markdown-padding': 'calc(24px * var(--sn-theme-density))',
    '--sn-code-markdown-size': 'calc(16px * var(--sn-theme-type-scale))',
    '--sn-markdown-h2-size': 'calc(28px * var(--sn-theme-type-scale) * var(--sn-theme-heading-scale))',
    '--sn-layout-header-block-size': 'calc(40px * var(--sn-theme-density))',
    '--sn-source-header-block-size': 'calc(32px * var(--sn-theme-density))',
    '--sn-layout-header-padding': '0 var(--sn-step-4)',
    '--sn-tree-panel-title-padding': 'var(--sn-step-6) var(--sn-step-4)',
    '--sn-tree-panel-title-size': 'var(--sn-text-2xs)',
    '--sn-tree-panel-input-size': 'var(--sn-text-md)',
    '--sn-tree-panel-input-padding': '0 var(--sn-step-6)',
    '--sn-transition-fast': 'calc(var(--notchset-fade) * var(--sn-theme-motion-scale))',
    '--sn-transition-normal': 'calc(var(--notchset-travel) * var(--sn-theme-motion-scale))',
    '--sn-transition-slow': 'calc(var(--notchset-unfold) * var(--sn-theme-motion-scale))',
    '--sn-transition-easing': 'var(--notchset-ease-glide)',
  };
  for (let [source, targets] of Object.entries(TOKEN_GROUPS)) {
    let value = colorValue(source, state, preset);
    for (let target of targets.split(' ')) overrides[`--sn-${target}`] = value;
  }
  return overrides;
}

/**
 * @param {Document} doc
 * @param {{ light: Object, dark: Object }} presets
 * @param {Function} applyTheme
 * @returns {() => void}
 */
export default function installPortfolioNotchsetTheme(doc, presets, applyTheme) {
  let active = true;
  let stopMobileShowResize = installMobileShowResize(doc);
  let previousMotion = null;
  let stopHeadingMotion = installHeadingMotion(doc);
  let stopBackgroundWhenOff = (event) => {
    if (doc.documentElement.dataset.portfolioMotion !== 'off') return;
    let background = /** @type {any} */ (event.target);
    background.stop?.();
  };
  doc.addEventListener('cell-bg-animation-start', stopBackgroundWhenOff);
  let apply = (event) => {
    let { targetSelector } = event.detail || {};
    let control = /** @type {any} */ (event.target);
    let state = event.detail?.state || control.state;
    if (!state || (targetSelector && ![':root', 'html'].includes(targetSelector))) return;
    let root = doc.documentElement;
    root.dataset.portfolioMotion = state.motion === 0 ? 'off' : 'on';
    for (let element of doc.querySelectorAll('chat-workspace')) {
      let workspace = /** @type {ThemeChatWorkspace} */ (element);
      if (state.motion === 0) {
        workspace.getBackground?.()?.stop?.();
      } else if (previousMotion === 0) {
        workspace.setBackgroundState?.({ state: workspace.dataset.backgroundState || 'idle' });
      }
    }
    previousMotion = state.motion;
    if (state.themeVariant !== 'default') {
      let wasHostTheme = Boolean(root.dataset.portfolioThemeMode);
      delete root.dataset.portfolioThemeMode;
      let nativeTokens = event.detail?.theme?.tokens || {};
      if (wasHostTheme) {
        let hostTokens = getPortfolioNotchsetOverrides(state, presets);
        for (let key of Object.keys(hostTokens)) {
          if (!Object.hasOwn(nativeTokens, key)) root.style.removeProperty(key);
        }
        for (let overlay of doc.querySelectorAll('[data-overlay-portal]')) {
          for (let key of Object.keys(hostTokens)) {
            /** @type {HTMLElement} */ (overlay).style.removeProperty(key);
          }
        }
      }
      if (Object.keys(nativeTokens).length) {
        applyTheme(root, { tokens: nativeTokens });
        if (event.detail?.register && event.detail.register !== 'default') {
          applyCascadeGeometryRegister(root, event.detail.register);
        }
      }
      return;
    }
    root.dataset.portfolioThemeMode = state.mode;
    let overrides = getPortfolioNotchsetOverrides(state, presets);
    applyTheme(root, { name: 'notchset', tokens: overrides });
    queueMicrotask(() => {
      if (!active || !root.dataset.portfolioThemeMode) return;
      let overlays = doc.querySelectorAll(':is(.ctw-popover, quick-toolbar, context-menu, panel-menu)[data-overlay-portal]');
      if (!overlays.length) return;
      let computed = doc.defaultView.getComputedStyle(root);
      let tokens = Object.fromEntries(Object.keys(overrides)
        .map((key) => [key, computed.getPropertyValue(key)]));
      for (let overlay of overlays) applyTheme(overlay, { name: 'notchset', tokens });
    });
  };
  let events = ['cascade-theme-change', 'cascade-geometry-register-change'];
  for (let name of events) doc.addEventListener(name, apply);
  return () => {
    active = false;
    stopMobileShowResize();
    stopHeadingMotion();
    doc.removeEventListener('cell-bg-animation-start', stopBackgroundWhenOff);
    for (let name of events) doc.removeEventListener(name, apply);
  };
}
