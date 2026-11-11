export default /*css*/ `
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
