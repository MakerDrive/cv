import styles from '../../common-styles/styles.css.js';

export default /*css*/ `
${styles}

:root {
  --pulse-surface: var(--sn-sys-surface, hsl(0 0% 10%));
  --pulse-surface-panel: var(--sn-sys-surface-panel, hsl(0 0% 13%));
  --pulse-surface-raised: var(--sn-sys-surface-raised, var(--pulse-surface-panel));
  --pulse-text: var(--sn-sys-on-surface, hsl(0 0% 94%));
  --pulse-text-dim: var(--sn-sys-on-surface-dim, hsl(0 0% 60%));
  --pulse-outline: var(--sn-sys-outline, hsl(0 0% 62% / 0.24));
  --pulse-accent: var(--sn-sys-accent, hsl(205 74% 58%));
  --pulse-hover-surface: color-mix(in oklab, var(--pulse-surface-raised) 86%, var(--pulse-accent) 14%);
  --sn-sys-on-accent: var(--pulse-surface);
}

body {
  background: var(--pulse-surface);
  color: var(--pulse-text);
}

body:has(.pulse-screen) {
  padding-left: 0;
  --calc-top-pan-height: var(--sn-app-topbar-height, 40px);
  --pulse-workspace-block-size: calc(100vh - var(--calc-top-pan-height));
  background-color: var(--pulse-surface);
  background-image: linear-gradient(to bottom, var(--pulse-surface-raised), var(--pulse-surface));
  background-repeat: no-repeat;
  background-size: 100% var(--sn-shell-top-gradient-size, 78px);
}

@supports (height: 100dvh) {
  body:has(.pulse-screen) {
    --pulse-workspace-block-size: calc(100dvh - var(--calc-top-pan-height));
  }
}

side-panel[disabled],
side-panel[hidden] {
  display: none;
}

body:has(.pulse-screen) > footer {
  display: none;
}

body > header,
body > footer {
  background: color-mix(in srgb, var(--pulse-surface-panel) 92%, transparent);
  color: var(--pulse-text);
  border-color: var(--pulse-outline);
}

body:has(.pulse-screen) > header {
  position: relative;
  top: auto;
  min-width: 0;
  justify-content: space-between;
  gap: var(--sn-shell-menu-action-gap, 12px);
  padding: var(--sn-app-topbar-padding, 0 16px);
  border: 0;
  background: transparent;
  background-color: transparent;
  color: var(--pulse-text);
  font-family: var(--sn-font, Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif);
  font-size: var(--sn-app-title-size, 13px);
  line-height: 1;
  z-index: var(--pulse-header-z, 100);
}

.pulse-header-title {
  flex: 1 1 auto;
  min-width: 0;
  overflow: hidden;
  color: var(--pulse-text);
  font-size: var(--sn-app-title-size, 13px);
  font-weight: 700;
  letter-spacing: var(--sn-app-title-letter-spacing, 0.5px);
  line-height: 1;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.pulse-header-menu-button {
  display: none;
}

.pulse-theme-widget {
  flex: 0 0 auto;
  margin-inline-start: 0;
  --sn-theme-widget-z: var(--pulse-theme-widget-z, 20030);
}

.pulse-locale-toggle {
  flex: 0 0 auto;
  border: 0;
  color: var(--sn-sys-on-surface-dim, var(--pulse-text-dim));
  --sn-step-1: 0px;
  --sn-segmented-bg: transparent;
  --sn-segmented-border: transparent;
  --sn-segmented-radius: var(--sn-layout-header-button-radius, 4px);
  --sn-segmented-gap: 0px;
  --sn-segmented-font-size: var(--sn-shell-menu-action-size, 11px);
  --sn-segmented-font-weight: 600;
  --sn-segmented-line-height: 1;
  --sn-segmented-padding: var(--sn-shell-menu-action-padding, 4px 10px);
  --sn-segmented-item-min-height: var(--sn-shell-menu-action-height, 26px);
}

.pulse-locale-toggle > button {
  min-inline-size: 0;
  border-radius: var(--sn-layout-header-button-radius, 4px);
  letter-spacing: 0;
}

.pulse-locale-toggle > slot {
  display: none;
}

.pulse-theme-widget .ctw-trigger {
  display: inline-flex;
}

.pulse-header-menu-button,
.pulse-theme-widget .ctw-trigger {
  align-items: center;
  justify-content: center;
  gap: var(--sn-shell-menu-action-inner-gap, 6px);
  min-height: var(--sn-shell-menu-action-height, 26px);
  padding: var(--sn-shell-menu-action-padding, 4px 10px);
  border: 1px solid transparent;
  border-radius: var(--sn-layout-header-button-radius, 4px);
  background: var(--sn-shell-menu-action-bg, transparent);
  color: var(--sn-sys-on-surface-dim, var(--pulse-text-dim));
  font: inherit;
  font-size: var(--sn-shell-menu-action-size, 11px);
  font-weight: 600;
  letter-spacing: var(--sn-shell-menu-action-letter-spacing, 0.5px);
  line-height: 1;
  white-space: nowrap;
  cursor: pointer;
}

.pulse-header-menu-button .material-symbols-outlined {
  font-size: var(--sn-shell-menu-action-icon-size, var(--sn-layout-header-icon-size, 16px));
  line-height: 1;
}

.pulse-header-menu-button:hover,
.pulse-header-menu-button:focus-visible,
.pulse-theme-widget .ctw-trigger:hover,
.pulse-theme-widget .ctw-trigger[active] {
  border-color: var(--sn-sys-outline, var(--pulse-outline));
  background: color-mix(in oklch, var(--sn-sys-accent, var(--pulse-accent)) var(--sn-sys-state-hover-mix, 14%), transparent);
  color: var(--sn-sys-on-surface, var(--pulse-text));
}

main > article {
  max-width: none;
  min-height: var(--pulse-workspace-block-size);
  padding: 0;
}

.pulse-screen {
  position: relative;
  display: block;
  min-height: var(--pulse-workspace-block-size);
  overflow: hidden;
  background: var(--pulse-surface);
}

.pulse-workspace {
  display: block;
  min-width: 0;
  min-height: 0;
  width: 100%;
  height: var(--pulse-workspace-block-size);
  background: var(--pulse-surface);
  color: var(--pulse-text);
}

portfolio-workspace,
.portfolio-layout,
portfolio-tree-panel,
portfolio-graph-panel,
portfolio-viewer-panel,
portfolio-theme-panel,
.portfolio-tree,
.portfolio-viewer,
.portfolio-theme-editor,
.portfolio-canvas,
.portfolio-flat-graph {
  min-width: 0;
  min-height: 0;
}

portfolio-workspace,
.portfolio-layout,
portfolio-tree-panel,
portfolio-graph-panel,
portfolio-viewer-panel,
portfolio-theme-panel {
  inline-size: 100%;
  block-size: 100%;
}

portfolio-graph-panel {
  position: relative;
}

portfolio-graph-panel[data-loading]::after {
  content: '';
  position: absolute;
  inset-block-start: 50%;
  inset-inline-start: 50%;
  inline-size: 30px;
  block-size: 30px;
  margin: -15px 0 0 -15px;
  border: 2px solid color-mix(in oklab, var(--pulse-text) 22%, transparent);
  border-block-start-color: var(--pulse-accent);
  border-radius: 50%;
  pointer-events: none;
  z-index: 3;
  animation: portfolio-graph-loading-spin 0.72s linear infinite;
}

@keyframes portfolio-graph-loading-spin {
  to {
    transform: rotate(360deg);
  }
}

.portfolio-layout layout-node .panel-content {
  padding: 0;
  overflow: hidden;
}

.portfolio-layout layout-node .panel-content:has(> portfolio-theme-panel) {
  overflow: auto;
}

.portfolio-tree,
.portfolio-viewer {
  display: block;
  inline-size: 100%;
  block-size: 100%;
}

portfolio-theme-panel,
.portfolio-theme-editor {
  display: block;
  inline-size: 100%;
  block-size: auto;
  min-block-size: 100%;
}

.portfolio-tree {
  --sn-icon-font: 'Material Symbols Outlined';
  --sn-font: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  --sn-font-family: var(--sn-font);
  --sn-tree-panel-content-padding: 6px;
  --sn-tree-panel-gap: 4px;
  --sn-tree-panel-indent: 14px;
  --sn-tree-toggle-width: 18px;
  --sn-tree-icon-width: 18px;
  --sn-tree-row-height: 26px;
  --sn-tree-row-min-height: 26px;
  --sn-tree-row-padding-block: 1px;
  --sn-tree-panel-row-min-height: 26px;
  --sn-tree-row-radius: 5px;
  --sn-tree-icon-size: 16px;
  --sn-tree-panel-icon-size: 16px;
  --sn-tree-label-color: var(--pulse-text);
  --sn-tree-panel-label-weight: 500;
  --sn-tree-row-selected-bg: color-mix(in oklab, var(--pulse-accent) 22%, transparent);
  --sn-tree-row-hover-bg: color-mix(in oklab, var(--pulse-accent) 12%, transparent);
}

.portfolio-tree .sn-tree-panel-toolbar {
  align-items: center;
}

.portfolio-tree .sn-tree-panel-filter {
  min-height: 26px;
}

.portfolio-tree .sn-tree-row {
  grid-template-columns: var(--sn-tree-toggle-width) var(--sn-tree-icon-width) minmax(0, 1fr);
  column-gap: 5px;
}

.portfolio-tree .sn-tree-toggle,
.portfolio-tree .sn-tree-icon,
.portfolio-tree .sn-tree-panel-toolbar-icon {
  font-family: var(--sn-icon-font);
  font-weight: normal;
  font-style: normal;
  text-transform: none;
  letter-spacing: 0;
  white-space: nowrap;
  direction: ltr;
  -webkit-font-feature-settings: 'liga';
  -webkit-font-smoothing: antialiased;
  font-feature-settings: 'liga';
}

.portfolio-tree .sn-tree-kind,
.portfolio-tree .sn-tree-badges {
  display: none;
}

.portfolio-canvas {
  display: block;
  inline-size: 100%;
  block-size: 100%;
  --sn-node-radius: 8px;
  --sn-port-outline: var(--sn-conn-dot-stroke);
}

.portfolio-flat-graph {
  display: block;
  inline-size: 100%;
  block-size: 100%;
}

.portfolio-media-graph {
  position: relative;
  display: block;
  inline-size: 100%;
  block-size: 100%;
  overflow: hidden;
}

.portfolio-article-media-item {
  display: block;
  inline-size: 100%;
  margin-block: var(--sn-step-8, 18px) var(--sn-step-10, 28px);
  scroll-margin-block: var(--sn-step-10, 28px);
  border: 1px solid var(--pulse-outline);
  border-radius: var(--sn-node-radius, 8px);
  overflow: hidden;
  background: var(--pulse-surface-raised);
  container-type: inline-size;
}

.portfolio-article-media-item:focus-visible {
  outline: 2px solid var(--pulse-accent);
  outline-offset: 3px;
}

.portfolio-article-media-host {
  --sn-media-bg: var(--pulse-surface-raised);
  --sn-media-poster-bg: var(--pulse-surface-raised);
  --color-bg: var(--pulse-surface-raised);
  --color-fg: var(--pulse-text);
  background: var(--pulse-surface-raised);
}

.portfolio-article-media-host,
.portfolio-article-youtube,
.portfolio-article-media-host .sn-media-poster,
.portfolio-article-media-host ims-viewer {
  display: block;
  inline-size: 100%;
  aspect-ratio: 16 / 9;
}

.portfolio-article-youtube {
  border: 0;
}

.portfolio-article-media-host ims-viewer {
  block-size: auto;
  min-block-size: min(520px, 56.25cqi);
}

.portfolio-canvas[hidden],
.portfolio-flat-graph[hidden],
.portfolio-media-graph[hidden] {
  display: none !important;
}

.portfolio-canvas .sn-conn-dot,
.portfolio-canvas .sn-free-dot {
  fill: var(--sn-conn-dot-fill);
  stroke: var(--sn-conn-dot-stroke);
}

.portfolio-canvas .sn-conn-path {
  stroke: var(--sn-conn-color);
}

.portfolio-canvas port-item .sn-socket {
  --socket-color: var(--sn-conn-color);
}

.portfolio-canvas port-item .sn-socket::after {
  background: var(--socket-color, var(--sn-conn-color));
  border-color: var(--sn-conn-dot-stroke);
}

.portfolio-canvas graph-node[node-id="profile/photo"] {
  --sn-shape-disc-stroke: transparent;
  --sn-shape-stroke-width: 0;
}

.portfolio-canvas graph-node[node-id="profile/photo"] .sn-node-body {
  text-align: center;
}

.portfolio-canvas graph-node[node-type="directory"] {
  --sn-node-min-width: 108px;
  --sn-node-max-width: 108px;
  --sn-node-circle-size: 108px;
}

.portfolio-canvas graph-node[node-type="bio"],
.portfolio-canvas graph-node[node-type="skill"] {
  --sn-node-min-width: 290px;
  --sn-node-max-width: 320px;
}

.portfolio-canvas graph-node[node-type="project"] {
  --sn-node-min-width: 300px;
  --sn-node-max-width: 330px;
}

.portfolio-canvas graph-node[node-type="pulse"] {
  --sn-node-min-width: 260px;
  --sn-node-max-width: 300px;
}

.portfolio-canvas graph-node[node-type="project"] .sn-node-media {
  block-size: 108px;
}

body > footer a {
  color: currentColor;
  font-weight: 700;
}

.article-page {
  max-width: 760px;
  margin: 0 auto;
  padding-block: clamp(24px, 6vh, 72px);
  color: var(--pulse-text);
}

.article-page h1 {
  margin: 0 0 18px;
  font-size: clamp(32px, 6vw, 56px);
  line-height: 1;
}

.article-page p {
  color: var(--pulse-text-dim);
  font-size: 18px;
  line-height: 1.65;
}

.article-page code {
  padding: 2px 6px;
  border-radius: 6px;
  background: var(--pulse-hover-surface);
  color: var(--pulse-text);
}

.article-kicker {
  margin: 0 0 12px;
  color: var(--pulse-accent) !important;
  font-size: 13px !important;
  font-weight: 800;
  line-height: 1.2 !important;
  text-transform: uppercase;
}

@media (max-width: 640px) {
  body {
    padding-left: 0;
  }

  .pulse-screen {
    min-height: var(--pulse-workspace-block-size);
  }

  .pulse-workspace {
    height: auto;
    min-height: var(--pulse-workspace-block-size);
  }
}

@media (max-width: 520px) {
  body > header {
    font-size: 1rem;
  }

  body:has(.pulse-screen) {
    --calc-top-pan-height: var(--sn-app-topbar-mobile-height, 56px);
  }

  body:has(.pulse-screen) > header {
    gap: var(--pulse-mobile-header-gap, 10px);
    padding: var(--sn-app-topbar-mobile-padding, 6px 10px);
  }

  .pulse-header-menu-button {
    display: inline-flex;
  }

  .pulse-header-menu-button,
  .pulse-theme-widget .ctw-trigger {
    inline-size: var(--pulse-header-action-size, 44px);
    block-size: var(--pulse-header-action-size, 44px);
    min-inline-size: var(--pulse-header-action-size, 44px);
    min-block-size: var(--pulse-header-action-size, 44px);
    padding: 0;
  }

  .pulse-locale-toggle {
    --sn-segmented-padding: 4px 7px;
    --sn-segmented-item-min-height: 32px;
  }

  .pulse-locale-toggle > button {
    min-inline-size: 30px;
  }

  .pulse-header-title {
    font-size: 0.88rem;
  }

  main > article {
    padding: 14px;
  }

  main > article {
    padding: 0;
  }
}

/* Pulse Feed & Card Styles */
.pulse-feed {
  display: flex;
  flex-direction: column;
  gap: var(--sn-step-12);
  max-width: 800px;
  margin: 0 auto;
  padding: var(--sn-step-10) var(--sn-step-8);
  font-family: var(--sn-font);
}

.pulse-feed-section {
  display: flex;
  flex-direction: column;
  gap: var(--sn-step-8);
}

.pulse-section-heading {
  margin: 0;
  font-size: var(--sn-markdown-h2-size);
  font-weight: var(--sn-tree-panel-title-weight);
  color: var(--pulse-text);
  border-bottom: var(--sn-node-border-width) solid var(--pulse-outline);
  padding-bottom: var(--sn-step-4);
}

.pulse-card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  align-items: start;
  gap: var(--sn-step-9);
}

.pulse-card {
  min-height: 0;
  height: auto;
  padding: 0;
  background: var(--sn-card-bg);
  border: var(--sn-dialog-border-width) solid var(--sn-card-border);
  border-radius: var(--sn-card-radius);
  overflow: hidden;
  transition: transform var(--sn-transition-fast) var(--sn-transition-easing),
    border-color var(--sn-transition-fast) var(--sn-transition-easing),
    box-shadow var(--sn-transition-fast) var(--sn-transition-easing),
    background-color var(--sn-transition-fast) var(--sn-transition-easing);
}

.pulse-card:hover,
.pulse-card:focus-within {
  transform: translateY(calc(-1 * var(--sn-step-1)));
  border-color: var(--sn-card-hover-border);
  box-shadow: var(--sn-shadow-md);
  background: var(--sn-card-hover-bg);
}

.pulse-card-link-wrapper {
  display: flex;
  flex-direction: column;
  height: auto;
  min-height: 0;
  padding: var(--sn-step-9);
  text-decoration: none;
  color: var(--pulse-text);
  box-sizing: border-box;
  outline: none;
}

.pulse-card-link-wrapper:focus-visible {
  box-shadow: var(--sn-button-focus-ring);
}

.pulse-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--sn-step-6);
  font-size: var(--sn-text-sm);
  text-transform: uppercase;
}

.pulse-card-type {
  color: var(--pulse-accent);
  font-weight: var(--sn-card-title-weight);
}

.pulse-card-date {
  color: var(--pulse-text-dim);
}

.pulse-card-title {
  margin: 0 0 var(--sn-step-5) 0;
  font-size: var(--sn-markdown-h3-size);
  font-weight: var(--sn-tree-panel-title-weight);
  line-height: var(--sn-toolbar-title-line-height);
  color: var(--pulse-text);
}

.pulse-card-summary {
  margin: 0 0 var(--sn-step-9) 0;
  font-size: var(--sn-text-lg);
  line-height: var(--sn-field-control-line-height);
  color: var(--pulse-text-dim);
  flex: 1 1 auto;
}

.pulse-card-footer {
  display: flex;
  align-items: center;
  font-size: var(--sn-text-lg);
  font-weight: var(--sn-card-title-weight);
  color: var(--pulse-accent);
}

.pulse-card-read-more {
  display: flex;
  align-items: center;
  gap: var(--sn-button-gap);
}

.pulse-card-read-more .material-symbols-outlined {
  font-size: var(--sn-text-xl);
  transition: transform var(--sn-transition-fast) var(--sn-transition-easing);
}

.pulse-card:hover .pulse-card-read-more .material-symbols-outlined,
.pulse-card:focus-within .pulse-card-read-more .material-symbols-outlined {
  transform: translateX(var(--sn-step-2));
}

.pulse-feed-empty,
.pulse-project-updates-empty {
  margin: 0;
  font-size: var(--sn-empty-state-font-size);
  font-style: var(--sn-empty-state-font-style);
  line-height: var(--sn-empty-state-line-height);
  color: var(--sn-empty-state-color);
  text-align: center;
  padding: var(--sn-empty-state-padding);
}

/* Project Updates List */
.pulse-project-updates {
  margin-top: var(--sn-step-12);
  padding-top: var(--sn-step-10);
  border-top: var(--sn-dialog-border-width) solid var(--pulse-outline);
  font-family: var(--sn-font);
}

.pulse-project-updates-heading {
  margin: 0 0 var(--sn-step-9) 0;
  font-size: var(--sn-markdown-h2-size);
  font-weight: var(--sn-tree-panel-title-weight);
  color: var(--pulse-text);
}

.pulse-project-updates-subgroup {
  margin-bottom: var(--sn-step-10);
}

.pulse-project-updates-subheading {
  margin: 0 0 var(--sn-step-6) 0;
  font-size: var(--sn-markdown-h3-size);
  font-weight: var(--sn-field-label-weight);
  text-transform: uppercase;
  color: var(--pulse-text-dim);
}

.pulse-project-updates-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: var(--sn-list-item-gap);
}

.pulse-project-updates-item {
  background: var(--sn-list-item-bg);
  border: var(--sn-dialog-border-width) solid var(--pulse-outline);
  border-radius: var(--sn-list-item-radius);
  transition: border-color var(--sn-transition-fast) var(--sn-transition-easing),
    background-color var(--sn-transition-fast) var(--sn-transition-easing);
}

.pulse-project-updates-item:hover,
.pulse-project-updates-item:focus-within {
  border-color: var(--pulse-accent);
  background: var(--sn-list-item-hover-bg);
}

.pulse-project-update-link {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--sn-list-item-padding);
  text-decoration: none;
  color: var(--pulse-text);
  gap: var(--sn-list-item-gap);
  outline: none;
}

.pulse-project-update-link:focus-visible {
  box-shadow: var(--sn-button-focus-ring);
  border-radius: var(--sn-list-item-radius);
}

.pulse-project-update-title {
  font-size: var(--sn-list-item-label-size);
  font-weight: var(--sn-list-item-label-weight);
}

.pulse-project-update-meta {
  font-size: var(--sn-list-item-meta-size);
  color: var(--pulse-text-dim);
  white-space: nowrap;
}

@media (prefers-reduced-motion: reduce) {
  .pulse-card,
  .pulse-project-updates-item,
  .pulse-card-read-more .material-symbols-outlined {
    transition: none !important;
    transform: none !important;
    animation: none !important;
  }
}

/* Theme sharing feedback overlays */
dialog.sn-theme-share-copy-overlay {
  border: 0;
  padding: 0;
  background: transparent;
  color: inherit;
  max-width: none;
  max-height: none;
  width: 100%;
  height: 100%;
  margin: 0;
  display: none;
  align-items: center;
  justify-content: center;
  z-index: 99999;
}

dialog.sn-theme-share-copy-overlay[open] {
  display: flex;
}

dialog.sn-theme-share-copy-overlay::backdrop {
  background: color-mix(in srgb, var(--pulse-surface) 70%, transparent);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

.sn-theme-share-copy-overlay {
  position: fixed;
  inset: 0;
  background: color-mix(in srgb, var(--pulse-surface) 70%, transparent);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 99999;
  animation: sn-fade-in 0.2s ease-out;
}

.sn-theme-share-copy-card {
  --theme-share-padding: var(--sn-step-10, 24px);
  --theme-share-gap: var(--sn-step-6, 16px);
  --theme-share-font-size-title: var(--sn-step-7, 18px);
  --theme-share-font-size-desc: var(--sn-step-5, 14px);
  --theme-share-font-size-input: var(--sn-step-4, 13px);
  --theme-share-input-padding: var(--sn-step-5, 10px 12px);
  --theme-share-btn-padding: var(--sn-step-5, 8px 16px);
  --theme-share-btn-font-size: var(--sn-step-5, 14px);

  background: var(--pulse-surface-panel);
  border: 1px solid var(--pulse-outline);
  border-radius: 12px;
  padding: var(--theme-share-padding);
  width: 90%;
  max-width: 480px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
  animation: sn-slide-up 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  display: flex;
  flex-direction: column;
  gap: var(--theme-share-gap);
}

.sn-theme-share-copy-card h3 {
  margin: 0;
  font-size: var(--theme-share-font-size-title);
  font-weight: 700;
  color: var(--pulse-text);
}

.sn-theme-share-copy-card p {
  margin: 0;
  font-size: var(--theme-share-font-size-desc);
  color: var(--pulse-text-dim);
  line-height: 1.5;
}

.sn-theme-share-copy-input {
  width: 100%;
  padding: var(--theme-share-input-padding);
  background: color-mix(in srgb, var(--pulse-surface) 60%, transparent);
  border: 1px solid var(--pulse-outline);
  border-radius: 6px;
  color: var(--pulse-text);
  font-family: inherit;
  font-size: var(--theme-share-font-size-input);
  outline: none;
}

.sn-theme-share-copy-input:focus {
  border-color: var(--pulse-accent);
}

.sn-theme-share-copy-close {
  align-self: flex-end;
  padding: var(--theme-share-btn-padding);
  background: var(--pulse-accent);
  color: var(--sn-sys-on-accent, var(--pulse-surface));
  border: none;
  border-radius: 6px;
  font-weight: 600;
  font-size: var(--theme-share-btn-font-size);
  cursor: pointer;
  transition: opacity var(--sn-transition-fast);
}

.sn-theme-share-copy-close:hover {
  opacity: 0.9;
}

.sn-theme-share-toast {
  --theme-share-toast-padding: var(--sn-step-6, 12px 18px);
  --theme-share-toast-font-size: var(--sn-step-5, 14px);
  --theme-share-toast-gap: var(--sn-step-4, 8px);

  position: fixed;
  bottom: 24px;
  right: 24px;
  background: var(--pulse-surface-panel);
  border: 1px solid var(--pulse-outline);
  border-radius: 8px;
  padding: var(--theme-share-toast-padding);
  color: var(--pulse-text);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
  font-size: var(--theme-share-toast-font-size);
  z-index: 99999;
  display: flex;
  align-items: center;
  gap: var(--theme-share-toast-gap);
  animation: sn-toast-slide-in 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.sn-theme-share-toast.error {
  border-color: hsl(0 80% 60% / 0.4);
  background: color-mix(in srgb, var(--pulse-surface-panel) 90%, hsl(0 80% 60% / 0.1));
}

@keyframes sn-fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes sn-slide-up {
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

@keyframes sn-toast-slide-in {
  from { transform: translateY(10px) scale(0.95); opacity: 0; }
  to { transform: translateY(0) scale(1); opacity: 1; }
}
`;
