import palette from './notchset-palette.css.js';
import fonts from './notchset-fonts.css.js';
import components from './notchset-components.css.js';
import motion from './notchset-motion.css.js';

export default /*css*/ `
${fonts}
${palette}

:root {
  --notchset-font-reading: 'Inter Variable', Arial, sans-serif;
  --notchset-font-display: 'Archivo Variable', 'Noto Sans', Arial, sans-serif;
  --notchset-font-mono: 'Martian Mono Variable', monospace;
  --notchset-rule-width: 1px;
  --notchset-square: var(--sn-layout-header-button-radius);
  --notchset-plate-offset: 2px;
  --notchset-ruler-height: 4px;
  --notchset-ruler-step: 8px;
  --notchset-ruler-width: 1px;
  --notchset-ruler-inset: 8px;
  --notchset-focus-inset: -5px;
  --notchset-focus-corner: 8px;
  --notchset-focus-stroke: 2px;
  --notchset-label-tracking: 0.06em;
  --notchset-legend-tracking: 0.1em;
  --notchset-heading-tracking: -0.01em;
  --notchset-heading-width: 62%;
  --notchset-heading-weight: 800;
  --notchset-heading-size: calc(clamp(2rem, 9.1cqi, 3.4rem) * var(--sn-theme-type-scale) * var(--sn-theme-heading-scale));
  --notchset-heading-leading: 0.95;
  --notchset-control-size: calc(12px * var(--sn-theme-type-scale));
  --notchset-control-weight: 500;
  --notchset-control-height: calc(32px * var(--sn-theme-density));
  --notchset-control-touch-height: 44px;
  --notchset-control-padding: calc(12px * var(--sn-theme-density));
  --notchset-shadow-plate: 2px 2px 0 var(--sn-portfolio-control-edge);
  --notchset-link-duration: 280ms;
  --notchset-frame-inset: var(--sn-step-8);
  --notchset-corner-length: var(--sn-step-11);
  --notchset-field-height: calc(40px * var(--sn-theme-density));
  --notchset-field-trace: 2px;
  --notchset-field-tracking: 0.01em;
  --notchset-field-border-time: 140ms;
  --notchset-field-trace-time: 200ms;
  --notchset-legend-size: var(--sn-text-xs);
  --notchset-reading-leading: 1.5;
}

@scope (:root[data-portfolio-theme-mode]) {

body:has(.pulse-screen) > header {
  min-block-size: var(--sn-app-topbar-height);
  padding-inline: var(--sn-step-10);
  background: var(--pulse-surface-panel);
  border-block-end: var(--notchset-rule-width) solid var(--pulse-outline);
}

.pulse-header-title {
  text-decoration: none;
  font-family: var(--sn-portfolio-font-display);
  font-size: var(--sn-text-2xl);
  font-stretch: var(--notchset-heading-width);
  font-weight: var(--notchset-heading-weight);
  text-transform: uppercase;
  letter-spacing: var(--notchset-heading-tracking);
}

.pulse-header-title:focus-visible {
  outline: var(--notchset-focus-stroke) solid currentColor;
  outline-offset: var(--sn-step-2);
}

body:has(.pulse-screen) button:where(:not(.material-symbols-outlined)) {
  font-family: var(--sn-font-mono);
  letter-spacing: var(--notchset-label-tracking);
  font-weight: var(--notchset-control-weight);
}

.pulse-workspace {
  box-sizing: border-box;
  padding: var(--notchset-frame-inset);
}

.pulse-workspace::before,
.pulse-workspace::after {
  content: '';
  position: absolute;
  inline-size: var(--notchset-corner-length);
  block-size: var(--notchset-corner-length);
  pointer-events: none;
  z-index: 1;
  border-color: var(--pulse-text);
}

.pulse-workspace::before {
  inset: var(--sn-step-4) auto auto var(--sn-step-4);
  border-block-start: var(--notchset-focus-stroke) solid;
  border-inline-start: var(--notchset-focus-stroke) solid;
}

.pulse-workspace::after {
  inset: auto var(--sn-step-4) var(--sn-step-4) auto;
  border-block-end: var(--notchset-focus-stroke) solid;
  border-inline-end: var(--notchset-focus-stroke) solid;
}

portfolio-workspace code-block .cb-flow {
  container-type: inline-size;
}

portfolio-workspace code-block .cb-md {
  counter-reset: notchset-section;
  line-height: var(--notchset-reading-leading);
}

portfolio-workspace code-block h2.md-h {
  counter-increment: notchset-section;
}

portfolio-workspace .sn-tree-panel-title {
  font-family: var(--sn-font-mono);
  font-weight: var(--notchset-control-weight);
  letter-spacing: var(--notchset-legend-tracking);
}

portfolio-workspace code-block .md-h {
  margin-block: var(--sn-step-12) var(--sn-step-8);
}

portfolio-workspace code-block .cb-md:first-child > h1.md-h:first-child {
  margin-block-start: 0;
}

portfolio-workspace code-block h2.md-h::before {
  content: counter(notchset-section, decimal-leading-zero) ' /';
  display: block;
  margin-block-end: var(--sn-step-4);
  color: var(--pulse-text-dim);
  font-family: var(--sn-font-mono);
  font-size: var(--notchset-legend-size);
  font-stretch: normal;
  font-weight: var(--notchset-control-weight);
  letter-spacing: var(--notchset-legend-tracking);
}

portfolio-workspace code-block .md-table {
  margin-block: var(--sn-step-8) var(--sn-step-12);
}

portfolio-workspace code-block .md-table td:first-child {
  font-family: var(--sn-font-mono);
  font-size: var(--notchset-legend-size);
  font-weight: var(--notchset-control-weight);
  letter-spacing: var(--notchset-legend-tracking);
  text-transform: uppercase;
  vertical-align: top;
}

portfolio-workspace .sn-tree-panel-filter {
  min-block-size: var(--notchset-field-height);
  font-family: var(--sn-font-mono);
  letter-spacing: var(--notchset-field-tracking);
  border: var(--notchset-rule-width) solid var(--sn-portfolio-control-edge);
  border-radius: var(--notchset-square);
  background-color: var(--pulse-surface);
  background-image: linear-gradient(var(--pulse-text), var(--pulse-text));
  background-position: left bottom;
  background-repeat: no-repeat;
  background-size: 0 var(--notchset-field-trace);
  caret-color: var(--sn-portfolio-signal);
  outline: none;
  transition: border-color calc(var(--notchset-field-border-time) * var(--sn-theme-motion-scale)) linear,
    background-size calc(var(--notchset-field-trace-time) * var(--sn-theme-motion-scale))
    var(--notchset-ease-travel);
}

portfolio-workspace .sn-tree-panel-filter:is(:focus, :focus-visible) {
  outline: none;
}

portfolio-workspace .sn-tree-panel-filter:is(:hover, :focus-visible) {
  border-color: var(--pulse-text);
}

portfolio-workspace .sn-tree-panel-filter:focus-visible {
  background-size: 100% var(--notchset-field-trace);
  transition-duration: calc(var(--notchset-field-border-time) * var(--sn-theme-motion-scale)),
    calc(var(--notchset-travel) * var(--sn-theme-motion-scale));
}

portfolio-workspace .sn-tree-row[aria-selected='true'] {
  background: var(--sn-segmented-selected-bg);
  --sn-tree-label-color: var(--sn-segmented-selected-color);
  --sn-tree-icon-color: var(--sn-segmented-selected-color);
  color: var(--sn-segmented-selected-color);
}

@media (max-width: 760px) {
  .pulse-workspace { padding: 0; }
  .pulse-workspace::before,
  .pulse-workspace::after { display: none; }
  body:has(.pulse-screen) > header { padding-inline: var(--sn-step-4); }
}

@media (max-width: 520px) {
  body:has(.pulse-screen) > header {
    min-block-size: var(--sn-app-topbar-mobile-height, 56px);
  }
}

@media (forced-colors: active) {
  portfolio-workspace .sn-tree-panel-filter:focus-visible {
    outline: var(--notchset-field-trace) solid Highlight;
    outline-offset: var(--notchset-field-trace);
  }
}

body:has(.pulse-screen) :is(.pulse-tour-button, .pulse-header-menu-button, .ctw-trigger) {
  position: relative;
  isolation: isolate;
  border-radius: var(--notchset-square);
  border: var(--notchset-rule-width) solid var(--sn-button-border);
  color: var(--pulse-text);
  min-block-size: var(--notchset-control-height);
  padding-inline: var(--notchset-control-padding);
  font-family: var(--sn-font-mono);
  font-size: var(--notchset-control-size);
  font-weight: var(--notchset-control-weight);
  text-transform: uppercase;
  letter-spacing: var(--notchset-label-tracking);
  transition:
    background-color calc(var(--notchset-fade) * var(--sn-theme-motion-scale)) var(--notchset-ease-fade),
    color calc(var(--notchset-fade) * var(--sn-theme-motion-scale)) var(--notchset-ease-fade),
    translate calc(var(--notchset-key-up) * var(--sn-theme-motion-scale)) var(--notchset-ease-key-up),
    border-color calc(var(--notchset-fade) * var(--sn-theme-motion-scale)) var(--notchset-ease-fade);
}

body:has(.pulse-screen) :is(.pulse-header-menu-button, .ctw-trigger):is(:hover, :focus-visible, [active]) {
  color: var(--pulse-text);
  border-color: var(--sn-button-border);
  background: var(--sn-button-hover-bg);
}

body:has(.pulse-screen) .pulse-tour-button {
  color: var(--sn-portfolio-on-signal);
  border-color: var(--sn-portfolio-signal);
  background: var(--sn-portfolio-signal);
  box-shadow: var(--notchset-shadow-plate);
}

body:has(.pulse-screen) .pulse-tour-button:is(:hover, :focus-visible) {
  background: var(--sn-portfolio-signal-hover);
  border-color: var(--sn-portfolio-signal-hover);
}

body:has(.pulse-screen) :is(.pulse-tour-button, .pulse-header-menu-button, .ctw-trigger)
  :is(.material-symbols-outlined) {
  pointer-events: none;
}

body:has(.pulse-screen)
  :is(.pulse-tour-button, .pulse-header-menu-button, .ctw-trigger):not(:disabled):active {
  translate: var(--notchset-plate-offset) var(--notchset-plate-offset);
  transition-duration: calc(var(--notchset-key-down) * var(--sn-theme-motion-scale));
  transition-timing-function: var(--notchset-ease-key-down);
  box-shadow: none;
}

body:has(.pulse-screen) :is(.pulse-tour-button, .ctw-trigger)::before {
  content: '';
  position: absolute;
  inset: auto var(--notchset-ruler-inset) var(--notchset-rule-width);
  block-size: var(--notchset-ruler-height);
  pointer-events: none;
  opacity: 0;
  background: repeating-linear-gradient(to right,
    currentColor 0 var(--notchset-ruler-width),
    transparent var(--notchset-ruler-width) var(--notchset-ruler-step));
  transition: opacity calc(var(--notchset-fade) * var(--sn-theme-motion-scale)) var(--notchset-ease-fade);
}

body:has(.pulse-screen) :is(.pulse-tour-button, .ctw-trigger):is(:hover, :focus-visible)::before {
  opacity: 0.4;
}

.pulse-locale-toggle {
  border: var(--notchset-rule-width) solid var(--sn-button-border);
  --sn-segmented-item-min-height: var(--notchset-control-height);
  --sn-segmented-padding: 0 var(--notchset-control-padding);
  --sn-segmented-font-size: var(--notchset-control-size);
  --sn-segmented-font-weight: var(--notchset-control-weight);
  --sn-segmented-radius: var(--notchset-square);
}

.pulse-locale-toggle > button {
  font-family: var(--sn-font-mono);
  border-radius: var(--notchset-square);
}

portfolio-workspace code-block .md-h {
  font-family: var(--sn-portfolio-font-display);
  font-weight: var(--notchset-heading-weight);
  font-stretch: var(--notchset-heading-width);
  text-transform: uppercase;
  letter-spacing: var(--notchset-heading-tracking);
}

portfolio-workspace code-block h1.md-h {
  font-size: var(--notchset-heading-size);
  line-height: var(--notchset-heading-leading);
  border-block-end: 0;
  padding-block-end: 0;
}

portfolio-workspace code-block .md-link {
  color: var(--pulse-text);
  text-decoration: none;
  background-image: linear-gradient(currentColor, currentColor),
    linear-gradient(var(--pulse-outline), var(--pulse-outline));
  background-repeat: no-repeat;
  background-position: right bottom, left bottom;
  background-size: 0 var(--notchset-rule-width), 100% var(--notchset-rule-width);
  transition: background-size calc(var(--notchset-link-duration) * var(--sn-theme-motion-scale)) var(--notchset-ease-travel),
    color calc(var(--notchset-fade) * var(--sn-theme-motion-scale)) linear;
}

portfolio-workspace code-block .md-link:is(:hover, :focus-visible, :active) {
  background-position: left bottom, left bottom;
  background-size: 100% var(--notchset-rule-width), 100% var(--notchset-rule-width);
}


.pulse-locale-toggle {
  position: relative;
  isolation: isolate;
  --notchset-thumb-index: 0;
  --notchset-thumb-duration: calc(340ms * var(--sn-theme-motion-scale));
  --notchset-thumb-delay: calc(80ms * var(--sn-theme-motion-scale));
}

.pulse-locale-toggle:has(> button:nth-of-type(2)[aria-checked='true']) {
  --notchset-thumb-index: 1;
}

.pulse-locale-toggle:has(> button:nth-of-type(3)[aria-checked='true']) {
  --notchset-thumb-index: 2;
}

.pulse-locale-toggle::before {
  content: '';
  position: absolute;
  inset-block: 0;
  left: calc(var(--notchset-thumb-index) * 100% / 3);
  right: calc((2 - var(--notchset-thumb-index)) * 100% / 3);
  background: var(--sn-segmented-selected-bg);
  pointer-events: none;
  transition: left var(--notchset-thumb-duration) var(--notchset-ease-glide)
    var(--notchset-thumb-delay), right var(--notchset-thumb-duration) var(--notchset-ease-glide);
}

.pulse-locale-toggle > button {
  position: relative;
  z-index: 1;
  flex: 1 0 0;
}

.pulse-locale-toggle > button[aria-checked='true'] {
  background: transparent;
  box-shadow: none;
}

body:has(.pulse-screen)
  :is(.pulse-tour-button, .pulse-header-menu-button, .ctw-trigger):focus-visible::after {
  content: '';
  position: absolute;
  inset: var(--notchset-focus-inset);
  pointer-events: none;
  --c: var(--pulse-text);
  background:
    linear-gradient(var(--c), var(--c)) top left / var(--notchset-focus-corner) var(--notchset-focus-stroke),
    linear-gradient(var(--c), var(--c)) top left / var(--notchset-focus-stroke) var(--notchset-focus-corner),
    linear-gradient(var(--c), var(--c)) top right / var(--notchset-focus-corner) var(--notchset-focus-stroke),
    linear-gradient(var(--c), var(--c)) top right / var(--notchset-focus-stroke) var(--notchset-focus-corner),
    linear-gradient(var(--c), var(--c)) bottom left / var(--notchset-focus-corner) var(--notchset-focus-stroke),
    linear-gradient(var(--c), var(--c)) bottom left / var(--notchset-focus-stroke) var(--notchset-focus-corner),
    linear-gradient(var(--c), var(--c)) bottom right / var(--notchset-focus-corner) var(--notchset-focus-stroke),
    linear-gradient(var(--c), var(--c)) bottom right / var(--notchset-focus-stroke) var(--notchset-focus-corner);
  background-repeat: no-repeat;
}


.pulse-workspace layout-node .panel-menu-row {
  border-color: var(--sn-layout-border);
}

.pulse-workspace layout-node .panel-menu-row-label {
  border-color: var(--pulse-outline);
  font-family: var(--sn-font-mono);
  font-weight: var(--notchset-control-weight);
  opacity: 1;
}

.pulse-workspace layout-node :is(.header-btn, .panel-menu-action),
.pulse-workspace source-viewer .sv-action,
.pulse-workspace .fullscreen-tab {
  border: var(--notchset-rule-width) solid var(--sn-layout-border);
  border-radius: var(--notchset-square);
  background: var(--sn-sys-surface-panel);
  color: var(--pulse-text);
  font-family: var(--sn-font-mono);
  font-weight: var(--notchset-control-weight);
  letter-spacing: var(--notchset-label-tracking);
  transition:
    background-color calc(var(--notchset-fade) * var(--sn-theme-motion-scale)) linear,
    color calc(var(--notchset-fade) * var(--sn-theme-motion-scale)) linear,
    border-color calc(var(--notchset-fade) * var(--sn-theme-motion-scale)) linear;
}

.pulse-workspace layout-node :is(.header-btn, .panel-menu-action):hover,
.pulse-workspace source-viewer .sv-action:hover,
.pulse-workspace .fullscreen-tab:hover {
  background: var(--sn-button-hover-bg);
  color: var(--pulse-text);
}

.pulse-workspace layout-node :is(.header-btn, .panel-menu-action):is(:active, [active]),
.pulse-workspace source-viewer[mode-raw] .sv-action,
.pulse-workspace .fullscreen-tab[active] {
  border-color: var(--sn-layout-border);
  background: var(--sn-button-primary-bg);
  color: var(--sn-button-primary-color);
}

.pulse-workspace layout-node :is(.header-btn, .panel-menu-action):focus-visible,
.pulse-workspace source-viewer .sv-action:focus-visible,
.pulse-workspace .fullscreen-tab:focus-visible {
  outline: var(--notchset-focus-stroke) solid var(--pulse-text);
  outline-offset: calc(-1 * var(--notchset-focus-stroke));
}

.pulse-workspace layout-node :is(.header-btn, .panel-menu-action)[active]:focus-visible,
.pulse-workspace source-viewer[mode-raw] .sv-action:focus-visible,
.pulse-workspace .fullscreen-tab[active]:focus-visible {
  outline-color: var(--sn-button-primary-color);
}

.pulse-workspace layout-node:not([mobile-panel-rail-item]):is([collapsed], [drawer-rail-collapsed])
  > .panel-view > .panel-header .header-btn {
  border: 0;
  background: transparent;
}

.pulse-workspace layout-node:is([collapsed], [drawer-rail-collapsed])
  > .panel-view > .panel-header .collapse-btn:is(:hover, :focus-visible) {
  background: var(--sn-button-hover-bg);
}

.pulse-workspace layout-node[drawer-rail-collapsed] {
  border: var(--notchset-rule-width) solid var(--sn-layout-border);
  box-sizing: border-box;
}

.pulse-workspace layout-node[drawer-rail-collapsed] > .panel-view,
.pulse-workspace layout-node[drawer-rail-collapsed] > .panel-view > .panel-header {
  box-sizing: border-box;
  block-size: 100%;
  min-block-size: 0;
  border: 0;
}

.pulse-workspace agent-dock-shell[show-panel-mobile-active] {
  --sn-layout-resizer-thickness: 0px;
  --cv-show-main-ratio: 0.76;
  --sn-agent-dock-mobile-show-main-ratio: calc(var(--cv-show-main-ratio) * 100%);
}

.pulse-workspace agent-dock-shell[show-panel-mobile-active] .agent-show-panel-node {
  border-block-start: 0;
}

.pulse-workspace agent-dock-shell[show-panel-mobile-active]
  .split-view[direction='vertical']:has(> .split-second > .agent-show-panel-node)
  > .split-resizer {
  position: relative;
  overflow: visible;
  touch-action: none;
}

.pulse-workspace agent-dock-shell[show-panel-mobile-active]
  .split-view[direction='vertical']:has(> .split-second > .agent-show-panel-node)
  > .split-resizer::before {
  content: '';
  position: absolute;
  inset-inline: 0;
  inset-block-start: calc(-1 * var(--sn-step-8) / 2);
  block-size: var(--sn-step-8);
  cursor: row-resize;
  touch-action: none;
}

.pulse-workspace agent-dock-shell[show-panel-mobile-active]
  > panel-layout[drawer-mode-active] > .layout-root > layout-node
  > .split-view[direction='horizontal'] > .split-second
  > layout-node[drawer-rail][drawer-rail-collapsed][mobile-dock='end'] {
  block-size: calc((100% - var(--sn-layout-resizer-thickness, 2px))
    * var(--cv-show-main-ratio)) !important;
  height: calc((100% - var(--sn-layout-resizer-thickness, 2px))
    * var(--cv-show-main-ratio)) !important;
}

.pulse-workspace .portfolio-tree .sn-tree-panel-collapse {
  --sn-button-border: var(--sn-layout-border);
  --sn-button-hover-border: var(--sn-layout-border);
  --sn-button-hover-bg: var(--sn-button-bg);
}

@media (max-width: 760px) {
  .pulse-workspace > agent-dock-shell {
    min-block-size: 0;
    block-size: auto;
  }

  .pulse-workspace > agent-dock-shell > panel-layout[mobile-panel-rail-enabled] {
    scroll-snap-type: inline mandatory;
  }

  .pulse-workspace .portfolio-show-static-region:not(:empty) {
    container: cv-show / size;
    box-sizing: border-box;
    display: block;
    flex: 0 0 var(--cv-show-height, min(34%, 260px));
    min-block-size: 120px;
    overflow: hidden;
    border-block-start: 0;
    background: var(--pulse-surface-panel);
  }

  .pulse-workspace .portfolio-mobile-navigation {
    display: block;
    flex: 0 0 auto;
    background: var(--sn-layout-border);
  }

  .pulse-workspace:has(> .portfolio-show-static-region:not(:empty)) > .portfolio-show-resizer {
    display: block;
    position: relative;
    z-index: 2;
    flex: 0 0 0;
    touch-action: none;
    cursor: row-resize;
    background: transparent;
  }

  .portfolio-show-resizer::before {
    content: '';
    position: absolute;
    inset-inline: 0;
    inset-block: -6px;
  }

  .portfolio-show-resizer:focus-visible {
    outline: var(--notchset-focus-stroke) solid var(--pulse-accent);
  }

  .pulse-workspace > .portfolio-show-static-region > chat-show-player {
    border-block-start: 0;
    display: flex;
    flex-direction: column;
    min-block-size: 0;
  }

  .pulse-workspace > .portfolio-show-static-region .chat-show-progress {
    margin-block-start: auto;
    flex-shrink: 0;
  }

  .pulse-workspace > .portfolio-show-static-region :is(.chat-show-header, .chat-show-controls) {
    flex-shrink: 0;
  }

  .pulse-workspace .portfolio-mobile-navigation > .mobile-panel-rail {
    display: grid;
    grid-auto-flow: column;
    grid-auto-columns: minmax(0, 1fr);
    gap: var(--notchset-rule-width);
    min-inline-size: 0;
  }

  /* The grid above is an author rule, so it would beat the user-agent's
     [hidden] display:none and leave a disabled rail focusable. */
  .pulse-workspace .portfolio-mobile-navigation > .mobile-panel-rail[hidden] {
    display: none;
  }

  .pulse-workspace .portfolio-mobile-navigation > .mobile-panel-rail > button {
    min-inline-size: 0;
    min-block-size: var(--notchset-control-touch-height);
    padding-inline: var(--sn-step-2);
    border: 0;
    border-radius: 0;
    background: var(--pulse-surface-panel);
    color: var(--pulse-text);
    font-size: var(--notchset-control-size);
    line-height: 1.1;
    overflow-wrap: anywhere;
    transition: background-color var(--notchset-fade), color var(--notchset-fade);
  }

  .pulse-workspace .portfolio-mobile-navigation > .mobile-panel-rail > button[aria-current='page'] {
    background: var(--sn-button-primary-bg);
    color: var(--sn-button-primary-color);
  }

  .pulse-workspace .portfolio-mobile-navigation > .mobile-panel-rail > button:focus-visible {
    position: relative;
    z-index: 1;
    outline: var(--notchset-focus-stroke) solid var(--sn-button-focus-ring);
    outline-offset: calc(-1 * var(--notchset-focus-stroke));
  }
}

@media (pointer: coarse) {
  body:has(.pulse-screen) :is(.pulse-tour-button, .pulse-header-menu-button, .ctw-trigger) {
    min-block-size: var(--notchset-control-touch-height);
  }
}
}

@media (prefers-reduced-motion: reduce) {
  :root {
    --notchset-fade: 0ms;
    --notchset-field-border-time: 0ms;
    --notchset-field-trace-time: 0ms;
    --notchset-key-down: 0ms;
    --notchset-key-up: 0ms;
    --notchset-link-duration: 0ms;
    --notchset-travel: 0ms;
    --notchset-unfold: 0ms;
  }
  body:has(.pulse-screen)
    :is(.pulse-tour-button, .pulse-header-menu-button, .ctw-trigger):not(:disabled):active {
    translate: none;
  }
  .pulse-locale-toggle {
    --notchset-thumb-duration: 0ms;
    --notchset-thumb-delay: 0ms;
  }
}

:root[data-portfolio-motion='off'] body:has(.pulse-screen)
  :is(.pulse-tour-button, .pulse-header-menu-button, .ctw-trigger):not(:disabled):active {
  translate: none;
}

:root[data-portfolio-motion='off'] .pulse-locale-toggle {
  --notchset-thumb-duration: 0ms;
  --notchset-thumb-delay: 0ms;
}

:root[data-portfolio-motion='off'] {
  --notchset-fade: 0ms;
  --notchset-field-border-time: 0ms;
  --notchset-field-trace-time: 0ms;
  --notchset-key-down: 0ms;
  --notchset-key-up: 0ms;
  --notchset-link-duration: 0ms;
}

${components}
${motion}
`;
