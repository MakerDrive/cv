export default /*css*/ `
:root {
  --notchset-row-enter: 260ms;
  --notchset-popover-enter: 180ms;
  --notchset-ease-settle: cubic-bezier(0.16, 1, 0.3, 1);
  --notchset-row-travel: var(--sn-step-2);
}

portfolio-workspace .cb-flow h1[data-notchset-decoding] {
  position: relative;
}

portfolio-workspace .notchset-heading-label {
  opacity: 0;
}

portfolio-workspace .notchset-heading-overlay {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
}

@keyframes portfolio-notchset-arrive {
  from { opacity: 0; translate: 0 var(--notchset-row-travel); }
  to { opacity: 1; translate: 0 0; }
}

html[data-portfolio-theme-mode] chat-message-item .message {
  animation: portfolio-notchset-arrive
    calc(var(--notchset-row-enter) * var(--sn-theme-motion-scale))
    var(--notchset-ease-settle) both;
}

html[data-portfolio-theme-mode] :is(context-menu:popover-open,
  .ctw-popover:not([hidden]), .sn-theme-share-copy-card) {
  animation: portfolio-notchset-arrive
    calc(var(--notchset-popover-enter) * var(--sn-theme-motion-scale))
    var(--notchset-ease-settle) both;
}

html[data-portfolio-theme-mode] quick-toolbar .toolbar {
  animation-name: portfolio-notchset-arrive;
  animation-duration: calc(var(--notchset-popover-enter) * var(--sn-theme-motion-scale));
  animation-timing-function: var(--notchset-ease-settle);
}

html[data-portfolio-theme-mode] chat-show-player:not(:has([data-control='play'][aria-pressed])) .chat-show-row[current]::after {
  animation-play-state: paused;
}

@media (prefers-reduced-motion: reduce) {
  html[data-portfolio-theme-mode] :is(chat-message-item .message, context-menu,
    .ctw-popover, .sn-theme-share-copy-card, quick-toolbar .toolbar) {
    animation: none;
    translate: none;
  }
  html[data-portfolio-theme-mode] chat-show-player .chat-show-row[current]::after {
    animation: none;
  }
}

:root[data-portfolio-motion='off'] :is(chat-message-item .message, context-menu,
  .ctw-popover, .sn-theme-share-copy-card, quick-toolbar .toolbar) {
  animation: none;
  translate: none;
}

:root[data-portfolio-motion='off'] chat-show-player .chat-show-row[current]::after {
  animation: none;
}
`;
