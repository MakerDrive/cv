export default /*css*/ `
/* The player is an inverted surface of the active theme: dark ink on a light page and the
   other way round. It is built from the theme's own tokens (not a colour filter), so every
   cascade theme and variant, and its accent, stay intact. The page values are captured
   first, because a token cannot be redefined from itself. */
html[data-portfolio-theme-mode] {
  --cv-surface: var(--sn-sys-surface-panel);
  --cv-ink: var(--sn-sys-on-surface);
  --cv-line: var(--sn-layout-border);
}

html[data-portfolio-theme-mode] chat-show-player {
  --sn-sys-surface-panel: var(--cv-ink);
  --sn-sys-surface: var(--cv-ink);
  --sn-sys-on-surface: var(--cv-surface);
  --sn-sys-on-surface-dim: color-mix(in srgb, var(--cv-surface) 60%, var(--cv-ink));
  --sn-layout-border: var(--cv-surface);
  --sn-node-border: var(--cv-surface);
  --sn-node-selected: var(--cv-surface);
  --sn-portfolio-tool-bg: var(--cv-ink);
  --sn-button-color: var(--cv-surface);
  --sn-button-border: var(--cv-surface);
  --sn-button-hover-border: var(--cv-surface);
  --sn-button-primary-border: var(--cv-surface);
  /* The current row is a selected (light) bar here: its text is the dark ink. */
  --sn-fullscreen-tab-active-color: var(--cv-ink);
  --sn-node-bg: var(--cv-ink);
  --sn-node-hover: color-mix(in srgb, var(--cv-surface) 14%, var(--cv-ink));
  --sn-panel-bg: var(--cv-ink);
  --sn-sys-surface-raised: color-mix(in srgb, var(--cv-surface) 8%, var(--cv-ink));
  --sn-sys-outline: var(--cv-surface);
  --sn-card-border: var(--cv-surface);
  --sn-sys-focus-ring: var(--cv-surface);
  --sn-text: var(--cv-surface);
  --sn-text-dim: color-mix(in srgb, var(--cv-surface) 60%, var(--cv-ink));
  --notchset-muted-foreground: color-mix(in srgb, var(--cv-surface) 60%, var(--cv-ink));
  background: var(--cv-ink);
  color: var(--cv-surface);
  border-color: var(--cv-surface);
}

/* The presenter robot takes the same theme tokens: paper, ink and accent. */
html[data-portfolio-theme-mode] .symbiote-presenter-cursor {
  --presenter-hose-outline: var(--sn-sys-surface-panel);
  --presenter-hose-ink: var(--sn-sys-on-surface);
  --presenter-hose-accent: var(--sn-sys-accent);
}

html[data-portfolio-theme-mode] code-block :is(.cb-gutter, .cb-pre, .cb-pre code) {
  font-family: var(--sn-font-mono);
}

html[data-portfolio-theme-mode] code-block .cb-gutter {
  color: var(--sn-sys-on-surface-dim);
}

html[data-portfolio-theme-mode] .sn-theme-import-dialog {
  border-radius: var(--notchset-square);
  box-shadow: none;
}

html[data-portfolio-theme-mode] .sn-theme-import-dialog::backdrop {
  background: var(--notchset-scrim);
  backdrop-filter: none;
}

html[data-portfolio-theme-mode] .sn-theme-import-dialog .sn-dialog-panel {
  --sn-font: var(--notchset-font-reading);
  --sn-sys-on-surface: var(--notchset-foreground);
  --sn-sys-on-surface-dim: var(--notchset-muted-foreground);
  --sn-sys-outline-subtle: var(--notchset-border);
  --sn-sys-surface-toolbar: var(--notchset-card);
  --sn-sys-focus-ring: var(--notchset-foreground);
  --sn-button-bg: var(--notchset-secondary);
  --sn-button-color: var(--notchset-foreground);
  --sn-button-border: var(--notchset-foreground);
  --sn-button-hover-bg: var(--notchset-secondary-hover);
  --sn-button-hover-border: var(--notchset-foreground);
  --sn-button-primary-bg: var(--notchset-primary);
  --sn-button-primary-border: var(--notchset-foreground);
  --sn-button-primary-color: var(--notchset-primary-foreground);
  --sn-button-radius: var(--notchset-square);
  --sn-radius-sm: var(--notchset-square);
  border: var(--notchset-rule-width) solid var(--notchset-foreground);
  border-radius: var(--notchset-square);
  background: var(--notchset-card);
  color: var(--notchset-foreground);
}

html[data-portfolio-theme-mode] .sn-theme-import-dialog .sn-dialog-title {
  font-family: var(--notchset-font-display);
  font-stretch: var(--notchset-heading-width);
  font-weight: var(--notchset-heading-weight);
  text-transform: uppercase;
}

html[data-portfolio-theme-mode] .sn-theme-import-prompt strong {
  margin-inline: var(--sn-step-1);
}

html[data-portfolio-theme-mode] .sn-theme-import-dialog :is(.sn-dialog-btn, .sn-dialog-close-btn) {
  border: var(--notchset-rule-width) solid var(--notchset-foreground);
}

html[data-portfolio-theme-mode] .sn-theme-import-dialog .sn-dialog-btn-primary:hover:not(:disabled) {
  background: var(--notchset-primary-hover);
  color: var(--notchset-primary-foreground);
}

html[data-portfolio-theme-mode] :is(quick-toolbar .toolbar, context-menu, panel-menu .menu-container,
  .ctw-popover, .sn-theme-share-copy-card, .sn-theme-share-toast,
  node-search .search-bar, node-search .search-results, node-minimap, graph-breadcrumb) {
  border: var(--notchset-rule-width) solid var(--sn-layout-border);
  border-radius: var(--sn-node-radius);
  background: var(--sn-sys-surface-panel);
  box-shadow: none;
  backdrop-filter: none;
  -webkit-backdrop-filter: none;
}

html[data-portfolio-theme-mode] quick-toolbar .tb-btn {
  --sn-button-radius: var(--sn-layout-header-button-radius);
}

html[data-portfolio-theme-mode] quick-toolbar .toolbar {
  clip-path: inset(var(--sn-toolbar-clip-top, 0px) var(--sn-toolbar-clip-right, 0px)
    var(--sn-toolbar-clip-bottom, 0px) var(--sn-toolbar-clip-left, 0px)
    round var(--sn-node-radius));
}

html[data-portfolio-theme-mode] context-menu {
  --sn-ctx-border: var(--sn-layout-border);
  --sn-ctx-shadow-color: none;
  --sn-ctx-divider-color: var(--sn-sys-outline);
  --sn-ctx-check-color: var(--sn-sys-on-surface);
}

html[data-portfolio-theme-mode] :is(.toolbar-title, .insp-header, .cte-title,
  .ctw-title, .chat-show-title, .chat-show-progress-time, .chat-show-row-speaker,
  .tool-header, .pulse-card-header, .pulse-project-update-meta) {
  font-family: var(--sn-font-mono);
  font-weight: var(--notchset-control-weight);
  letter-spacing: var(--notchset-label-tracking);
}

html[data-portfolio-theme-mode] chat-show-player .chat-show-controls .chat-show-speed-control {
  font-family: var(--sn-font-mono);
  font-size: var(--notchset-control-size);
  font-weight: var(--notchset-control-weight);
  font-variation-settings: normal;
  letter-spacing: 0;
  line-height: 1;
}

/* The header holds many actions (link, expand, presenter, music, subtitles, sound,
   close): in a narrow player they wrap onto a second row instead of being cut off. */
html[data-portfolio-theme-mode] chat-show-player .chat-show-header {
  flex-wrap: wrap;
  row-gap: var(--sn-space-xs, 4px);
}

/* The icon and the "CV Show" title are not shown: the room goes to the actions, which push
   to the end of the row. */
html[data-portfolio-theme-mode] chat-show-player .chat-show-header > :is(.chat-show-icon, .chat-show-title) {
  display: none;
}

/* One spacing for the player in every layout (narrow dock and wide panel): the same padding and
   row gap, rows of progress, words and transport, with the transport pinned to the bottom edge
   and the words taking the spare height in between. Hidden panels leave no tracks behind. */
html[data-portfolio-theme-mode] chat-show-player,
html[data-portfolio-theme-mode] chat-show-player[panel-layout] {
  padding: var(--sn-space-sm, 8px);
  gap: var(--sn-space-sm, 8px);
  grid-template-rows: auto auto 1fr auto;
  grid-auto-rows: auto;
}

html[data-portfolio-theme-mode] chat-show-player .chat-show-header {
  grid-row: 1;
}

html[data-portfolio-theme-mode] chat-show-player .chat-show-progress {
  grid-row: 2;
}

html[data-portfolio-theme-mode] chat-show-player .chat-show-caption {
  grid-row: 3;
  grid-column: 1 / -1;
}

html[data-portfolio-theme-mode] chat-show-player .chat-show-controls {
  grid-row: 4;
}

/* Narrow dock: the header actions are one Notchset toolbar, icon buttons joined in a single
   frame with shared dividers, as wide as the progress bar below. */
html[data-portfolio-theme-mode] chat-show-player:not([panel-layout]) .chat-show-header {
  gap: 0;
  border: var(--notchset-rule-width) solid var(--sn-layout-border);
}

html[data-portfolio-theme-mode] chat-show-player:not([panel-layout]) .chat-show-header > .chat-show-header-action {
  flex: 1 1 0;
  inline-size: auto;
  min-inline-size: 0;
  border: 0;
  border-inline-start: var(--notchset-rule-width) solid var(--sn-layout-border);
  border-radius: 0;
}

html[data-portfolio-theme-mode] chat-show-player:not([panel-layout]) .chat-show-header > .chat-show-header-action[data-cv-show-action] {
  border-inline-start: 0;
}

/* Wide panel: the library hides the player's header, which left the toggles unreachable. They
   come back in the transport row as three groups: what is shown on the left (link, presenter,
   subtitles), the transport in the centre, the sound on the right (music, effects). Expand and
   close are already in the panel header. */
html[data-portfolio-theme-mode] chat-show-player[panel-layout] .chat-show-header {
  display: flex;
  grid-row: 4;
  grid-column: 1 / -1;
  align-items: center;
  gap: 0;
  pointer-events: none;
}

html[data-portfolio-theme-mode] chat-show-player[panel-layout] .chat-show-header > :is(
  .chat-show-icon, .chat-show-title, .chat-show-header-action[data-cv-show-expand],
  .chat-show-header-action[data-header-action]) {
  display: none;
}

html[data-portfolio-theme-mode] chat-show-player[panel-layout] .chat-show-header > .chat-show-header-action {
  flex: 0 0 auto;
  pointer-events: auto;
  position: relative;
  z-index: 1;
  margin-inline-end: calc(-1 * var(--notchset-rule-width));
}

html[data-portfolio-theme-mode] chat-show-player[panel-layout] .chat-show-header > [data-cv-show-action] { order: 1; }
html[data-portfolio-theme-mode] chat-show-player[panel-layout] .chat-show-header > [data-cv-show-rig] { order: 2; }
html[data-portfolio-theme-mode] chat-show-player[panel-layout] .chat-show-header > [data-cv-show-subtitle-toggle] {
  order: 3;
  margin-inline-end: 0;
}
html[data-portfolio-theme-mode] chat-show-player[panel-layout] .chat-show-header > [data-cv-show-music] {
  order: 4;
  margin-inline-start: auto;
}
html[data-portfolio-theme-mode] chat-show-player[panel-layout] .chat-show-header > [data-cv-show-sound] {
  order: 5;
  margin-inline-end: 0;
}

html[data-portfolio-theme-mode] chat-show-player[panel-layout] .chat-show-controls {
  grid-row: 4;
  grid-column: 1 / -1;
}

/* The player's settings menu only repeated the expand action, which has its
   own header button, so the menu button is not shown. */
html[data-portfolio-theme-mode] .chat-show-header-action[data-header-action='settings'] {
  display: none;
}

/* A pressed header toggle (the flying presenter) reads as inverted. */
html[data-portfolio-theme-mode] .chat-show-header-action[aria-pressed='true'],
html[data-portfolio-theme-mode] .chat-show-header-action[aria-pressed='true']:hover {
  background: var(--sn-sys-on-surface);
  color: var(--sn-sys-surface-panel);
}

html[data-portfolio-theme-mode] :is(sn-button, .sn-btn, .sn-minimap-toggle, .insp-fire-btn, .insp-enter-btn, .composer-footer-btn,
  .chat-show-header-action, .chat-show-menu-action, .chat-show-video-control,
  .chat-show-controls button, .cte-mode button, .cte-icon-button,
  .ctw-mode button, .ctw-header-actions button, .sn-theme-share-copy-close):where(:not([variant='danger'], [variant='success'], .tb-btn--danger, .approve, .reject)) {
  border: var(--notchset-rule-width) solid var(--sn-layout-border);
  border-radius: var(--sn-button-radius);
  background: var(--sn-sys-surface-panel);
  color: var(--sn-sys-on-surface);
  box-shadow: none;
  transition: background-color var(--sn-transition-fast) var(--notchset-ease-fade),
    border-color var(--sn-transition-fast) var(--notchset-ease-fade),
    color var(--sn-transition-fast) var(--notchset-ease-fade);
  &:not(:disabled):not([disabled]):hover {
    background: var(--sn-button-hover-bg);
    color: var(--sn-sys-on-surface);
    box-shadow: none;
  }
}

html[data-portfolio-theme-mode] :is(sn-button[variant='primary'],
  .sn-btn[data-variant='primary'], .sn-minimap-toggle[data-active], .composer-footer-btn.active, .chat-show-primary-control,
  .cte-mode button[aria-pressed='true'], .ctw-mode button[aria-pressed='true']) {
  background: var(--sn-button-primary-bg);
  color: var(--sn-button-primary-color);
  border-color: var(--sn-layout-border);
}

html[data-portfolio-theme-mode] :is(.sn-ctx-btn, .composer-footer-btn,
  .chat-show-controls button):focus-visible {
  outline: var(--notchset-focus-stroke) solid currentColor;
  outline-offset: calc(-1 * var(--notchset-focus-stroke));
}

html[data-portfolio-theme-mode] :is(.sn-ctx-btn, panel-menu .menu-item):is(:hover, :focus-visible) {
  background: var(--sn-ctx-hover);
}

html[data-portfolio-theme-mode] :is(inspector-panel, node-search) {
  border-color: var(--sn-layout-border);
}

html[data-portfolio-theme-mode] :is(inspector-panel input, inspector-panel select,
  node-search input, .sn-field-control, .cte-import-text, .sn-theme-share-input) {
  border-color: var(--sn-field-control-border);
  border-radius: var(--sn-field-control-radius);
  background: var(--sn-field-control-bg);
  color: var(--sn-field-control-color);
  box-shadow: none;
  caret-color: var(--sn-portfolio-signal);
}

.pulse-workspace .portfolio-canvas graph-node {
  border-color: var(--sn-node-border);
  box-shadow: none;
  transition: border-color var(--sn-transition-fast) var(--notchset-ease-fade),
    opacity var(--sn-transition-fast) var(--notchset-ease-fade);
}

.pulse-workspace .portfolio-canvas graph-node[data-selected] {
  border-color: var(--sn-portfolio-signal);
  box-shadow: none;
}

.pulse-workspace .portfolio-canvas graph-node .sn-node-header {
  border-color: var(--sn-node-border);
}

.pulse-workspace .portfolio-canvas :is(.sn-node-label, .sn-node-item-kicker) {
  font-family: var(--sn-font-mono);
  letter-spacing: var(--notchset-label-tracking);
}

.pulse-workspace .portfolio-canvas port-item .sn-socket::after {
  transition: transform var(--sn-transition-fast) var(--notchset-ease-key-up);
  box-shadow: none;
}

.pulse-workspace .portfolio-canvas port-item .sn-socket:hover::after {
  box-shadow: none;
}

html[data-portfolio-theme-mode] chat-composer .composer-body,
html[data-portfolio-theme-mode] chat-composer .voice-preview {
  border: var(--notchset-rule-width) solid var(--sn-layout-border);
}

html[data-portfolio-theme-mode] chat-composer sn-button.btn-send[variant='icon'] {
  --sn-button-radius: var(--sn-composer-radius);
  --sn-button-bg: var(--sn-button-primary-bg);
  --sn-button-color: var(--sn-button-primary-color);
  border: var(--notchset-rule-width) solid var(--sn-layout-border);
  border-radius: var(--sn-composer-radius);
  background: var(--sn-button-primary-bg);
  color: var(--sn-button-primary-color);
  box-shadow: none;
}

html[data-portfolio-theme-mode] chat-composer sn-button.btn-send[variant='icon']:hover {
  background: var(--sn-composer-send-hover-bg);
  color: var(--sn-button-primary-color);
  transform: none;
}

html[data-portfolio-theme-mode] chat-composer sn-button.btn-send.btn-stop {
  background: var(--sn-sys-danger);
}

html[data-portfolio-theme-mode] chat-message-item .msg-content {
  border-radius: var(--sn-node-radius);
}

html[data-portfolio-theme-mode] chat-message-item .message.user .msg-content {
  border: var(--notchset-rule-width) solid var(--sn-sys-outline);
}

html[data-portfolio-theme-mode] chat-message-item :is(.tool-card, .status-card, .action-card, .approval-card,
  .artifact-card, .attachment-card, .display-card, .confirm-pill, .source-badge) {
  border: var(--notchset-rule-width) solid var(--sn-layout-border);
  border-radius: var(--sn-node-radius);
  background: var(--sn-portfolio-tool-bg);
}

html[data-portfolio-theme-mode] chat-message-item .tool-card[open] {
  background: var(--sn-portfolio-tool-bg);
}

html[data-portfolio-theme-mode] chat-show-player :is(.chat-show-progress-segment,
  .chat-show-progress-thumb) {
  border-radius: var(--sn-node-radius);
}

html[data-portfolio-theme-mode] chat-show-player .chat-show-progress-segments {
  gap: var(--sn-step-1);
}

html[data-portfolio-theme-mode] chat-show-player .chat-show-progress-segment {
  margin-inline-start: 0;
}

/* The passed part of the bar is pale: only the unplayed track stays bright and the thumb
   marks the position. */
html[data-portfolio-theme-mode] chat-show-player .chat-show-progress-fill {
  background: color-mix(in srgb, var(--sn-node-border, var(--sn-sys-outline)) 30%, var(--sn-portfolio-tool-bg));
}

html[data-portfolio-theme-mode] chat-show-player .chat-show-progress-thumb {
  inset-inline-start: calc(var(--cv-compact-progress, 0) * 100%);
}

html[data-portfolio-theme-mode] chat-show-player .chat-show-timeline {
  block-size: calc(1lh + var(--sn-step-4));
}

html[data-portfolio-theme-mode] chat-show-player[panel-layout] .chat-show-timeline {
  block-size: calc(1lh + var(--sn-step-4));
}

@container cv-show (max-width: 360px) {
  html[data-portfolio-theme-mode] chat-show-player .chat-show-icon,
  html[data-portfolio-theme-mode] chat-show-player .chat-show-row-speaker {
    display: none;
  }
  /* Subtitles off (the header toggle): the player's own caption is hidden too;
   the presenter's cloud is switched off by the rig itself. */
html[data-cv-show-subtitles='off'] chat-show-player .chat-show-caption {
  display: none !important;
}

html[data-portfolio-theme-mode] chat-show-player .chat-show-row {
    grid-template-columns: minmax(0, 1fr);
  }
}

@container cv-show (max-height: 190px) {
  html[data-portfolio-theme-mode] chat-show-player .chat-show-timeline {
    display: none;
  }
}

@container cv-show (max-height: 150px) {
  html[data-portfolio-theme-mode] chat-show-player {
    gap: var(--sn-step-1);
    padding-block: var(--sn-step-2);
  }
}

html[data-portfolio-theme-mode] chat-show-player .chat-show-caption {
  font-family: var(--sn-font);
  overflow-wrap: anywhere;
  white-space: normal;
}

/* The section title row above the progress bar is not shown in any presenter mode: the
   section is named by the counter under the bar and by the words on screen. */
html[data-portfolio-theme-mode] chat-show-player .chat-show-timeline {
  display: none;
}

html[data-portfolio-theme-mode] chat-show-player .chat-show-row {
  border: var(--notchset-rule-width) solid var(--sn-layout-border);
  border-radius: var(--sn-node-radius);
  background: var(--sn-sys-surface-panel);
  transition: background-color var(--sn-transition-fast) var(--notchset-ease-fade),
    color var(--sn-transition-fast) var(--notchset-ease-fade);
}

html[data-portfolio-theme-mode] chat-show-player .chat-show-row-speaker {
  color: var(--notchset-muted-foreground);
  font-family: var(--sn-font-mono);
  font-size: var(--sn-text-2xs);
  letter-spacing: var(--notchset-label-tracking);
  text-transform: uppercase;
}

html[data-portfolio-theme-mode] chat-show-player .chat-show-row[current] {
  border-color: var(--sn-node-selected, var(--sn-sys-accent));
  background: var(--sn-node-selected, var(--sn-sys-accent));
  color: var(--sn-fullscreen-tab-active-color, var(--sn-sys-on-accent));
}

html[data-portfolio-theme-mode] chat-show-player .chat-show-row:focus-visible {
  outline: var(--notchset-focus-stroke) solid var(--sn-sys-focus-ring);
  outline-offset: calc(-1 * var(--notchset-focus-stroke));
}

html[data-portfolio-theme-mode] chat-show-player .chat-show-row[current] .chat-show-row-speaker {
  color: inherit;
}

html[data-portfolio-theme-mode] .pulse-card {
  border-color: var(--sn-card-border);
}

html[data-portfolio-theme-mode] .portfolio-article-media-item {
  border-color: var(--sn-card-border);
}

html[data-portfolio-theme-mode] .pulse-card:is(:hover, :focus-within) {
  transform: none;
  box-shadow: none;
}

html[data-portfolio-theme-mode] .pulse-card-title {
  font-family: var(--sn-portfolio-font-display);
  font-stretch: var(--notchset-heading-width);
  font-weight: var(--notchset-heading-weight);
  text-transform: uppercase;
}

html[data-portfolio-theme-mode] :is(sn-button[variant='primary'],
  .sn-btn[data-variant='primary'], .chat-show-primary-control):not(:disabled):not([disabled]):hover {
  background: var(--sn-portfolio-ink-hover);
  color: var(--sn-button-primary-color);
  filter: none;
}

html[data-portfolio-theme-mode] :is(.ctw-control input, .cte-control input)[type='range'] {
  accent-color: var(--sn-slider-active-bg);
}

html[data-portfolio-theme-mode] .cte-control input[type='range']::-webkit-slider-thumb {
  background: var(--sn-slider-thumb-bg);
  border-color: var(--sn-slider-thumb-border);
}

html[data-portfolio-theme-mode] .cte-control input[type='range']::-webkit-slider-runnable-track {
  background: linear-gradient(to right, var(--sn-slider-active-bg) 0 var(--cte-range-progress),
    var(--sn-slider-track-bg) var(--cte-range-progress) 100%);
}

html[data-portfolio-theme-mode] .sn-theme-share-copy-overlay:not(dialog),
html[data-portfolio-theme-mode] dialog.sn-theme-share-copy-overlay::backdrop {
  background: var(--sn-dialog-backdrop);
  backdrop-filter: none;
  -webkit-backdrop-filter: none;
}

html[data-portfolio-theme-mode] dialog.sn-theme-share-copy-overlay {
  background: transparent;
}

html[data-portfolio-theme-mode] .sn-theme-share-copy-input {
  border: var(--notchset-rule-width) solid var(--sn-field-control-border);
  border-radius: var(--sn-field-control-radius);
  background: var(--sn-field-control-bg);
  color: var(--sn-field-control-color);
}

html[data-portfolio-theme-mode] chat-message-item :is(.status-board, .actions-card) {
  border: 0;
  background: transparent;
}

html[data-portfolio-theme-mode] chat-message-item :is(.error-card, .status-card-event,
  .meta-chip, .message.system .msg-content) {
  border-radius: var(--sn-node-radius);
}

html[data-portfolio-theme-mode] chat-message-item .status-card[data-status='error'] {
  border-color: var(--sn-sys-danger);
}

html[data-portfolio-theme-mode] chat-message-item .status-card[data-status='running'] {
  border-color: var(--sn-portfolio-signal);
}

/* Chat, in the manner of the reference: every message carries a small mono caption (who and
   its number), the user's messages are inverted and sit on the right, a status card shows its
   state as a dot, and the actions of one message are a single segmented group. */
/* The Show player floats on the chat background: its band has no fill and no top rule of its own. */
html[data-portfolio-theme-mode] agent-show-chat .agent-show-player-region {
  background: transparent;
  border-block-start: 0;
}

html[data-portfolio-theme-mode] chat-message-list,
html[data-portfolio-theme-mode] .chat-message-list {
  counter-reset: notchset-msg;
}

html[data-portfolio-theme-mode] chat-message-item .message {
  counter-increment: notchset-msg;
}

html[data-portfolio-theme-mode] chat-message-item .message::before {
  display: block;
  margin-block-end: var(--sn-step-3);
  color: var(--pulse-text-dim);
  font-family: var(--sn-font-mono);
  font-size: var(--notchset-legend-size);
  letter-spacing: var(--notchset-legend-tracking);
  text-transform: uppercase;
}

html[data-portfolio-theme-mode] chat-message-item .message.agent::before {
  content: 'CV · ' counter(notchset-msg, decimal-leading-zero);
}

html[data-portfolio-theme-mode] chat-message-item .message.system::before {
  content: 'SYS · ' counter(notchset-msg, decimal-leading-zero);
}

html[data-portfolio-theme-mode] chat-message-item .message.user::before {
  content: 'YOU · ' counter(notchset-msg, decimal-leading-zero);
  text-align: end;
}

html[data-portfolio-theme-mode] chat-message-item .message.user .msg-content {
  background: var(--pulse-text);
  color: var(--pulse-surface);
}

html[data-portfolio-theme-mode] chat-message-item .status-card-header::after {
  content: '';
  margin-inline-start: auto;
  inline-size: 8px;
  block-size: 8px;
  border: var(--notchset-rule-width) solid currentColor;
  border-radius: 50%;
}

html[data-portfolio-theme-mode] chat-message-item .status-card[data-status='running'] .status-card-header::after {
  background: var(--sn-portfolio-signal);
  border-color: var(--sn-portfolio-signal);
}

html[data-portfolio-theme-mode] chat-message-item .status-card[data-status='error'] .status-card-header::after {
  background: var(--sn-sys-danger);
  border-color: var(--sn-sys-danger);
}

html[data-portfolio-theme-mode] chat-message-item .actions-group {
  display: inline-flex;
  gap: 0;
}

html[data-portfolio-theme-mode] chat-message-item .actions-group > .sn-btn + .sn-btn {
  margin-inline-start: calc(-1 * var(--notchset-rule-width));
}

/* Agent messages carry the same corner crosses as the figures, and the voice input preview is a
   Notchset bar: a mono state label, square joined buttons, no round or coloured buttons. */
html[data-portfolio-theme-mode] chat-message-item .message.agent .msg-content {
  position: relative;
  border: var(--notchset-rule-width) solid var(--sn-layout-border);
}

html[data-portfolio-theme-mode] chat-message-item .message.agent .msg-content::after {
  content: '';
  position: absolute;
  inset: -5px;
  pointer-events: none;
  color: var(--pulse-text-dim);
  background:
    linear-gradient(currentColor, currentColor) 0 4px / 9px 1px no-repeat,
    linear-gradient(currentColor, currentColor) 4px 0 / 1px 9px no-repeat,
    linear-gradient(currentColor, currentColor) 100% 4px / 9px 1px no-repeat,
    linear-gradient(currentColor, currentColor) calc(100% - 4px) 0 / 1px 9px no-repeat,
    linear-gradient(currentColor, currentColor) 0 calc(100% - 4px) / 9px 1px no-repeat,
    linear-gradient(currentColor, currentColor) 4px 100% / 1px 9px no-repeat,
    linear-gradient(currentColor, currentColor) 100% calc(100% - 4px) / 9px 1px no-repeat,
    linear-gradient(currentColor, currentColor) calc(100% - 4px) 100% / 1px 9px no-repeat;
}

html[data-portfolio-theme-mode] chat-composer .voice-preview-status {
  color: var(--pulse-text-dim);
  font-family: var(--sn-font-mono);
  font-size: var(--notchset-legend-size);
  letter-spacing: var(--notchset-legend-tracking);
  text-transform: uppercase;
}

html[data-portfolio-theme-mode] chat-composer .voice-preview-actions {
  gap: 0;
}

html[data-portfolio-theme-mode] chat-composer .voice-preview-btn {
  inline-size: var(--sn-button-icon-size);
  block-size: var(--sn-button-icon-size);
  min-inline-size: var(--sn-button-icon-size);
  border: var(--notchset-rule-width) solid var(--sn-layout-border);
  border-radius: 0;
  background: var(--sn-sys-surface-panel);
  color: var(--sn-sys-on-surface);
  box-shadow: none;
}

html[data-portfolio-theme-mode] chat-composer .voice-preview-btn + .voice-preview-btn {
  margin-inline-start: calc(-1 * var(--notchset-rule-width));
}

html[data-portfolio-theme-mode] chat-composer .voice-preview-btn:is(.send, .approve) {
  background: var(--sn-sys-on-surface);
  color: var(--sn-sys-surface-panel);
}

html[data-portfolio-theme-mode] chat-message-item :is(.card-title, .display-card-meta) {
  font-family: var(--sn-font-mono);
  letter-spacing: var(--notchset-label-tracking);
}

html[data-portfolio-theme-mode] .sn-btn {
  text-transform: uppercase;
  letter-spacing: var(--notchset-label-tracking);
}

html[data-portfolio-theme-mode] panel-menu .menu-item[active] {
  color: var(--sn-sys-on-surface);
  background: var(--sn-portfolio-received);
}

html[data-portfolio-theme-mode] :is(.search-hint, .insp-fire-btn, .insp-enter-btn) {
  border-radius: var(--sn-node-radius);
}

.pulse-workspace .portfolio-canvas graph-node .error-frame {
  box-shadow: none;
}
`;
