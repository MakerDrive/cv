import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import portfolioCss from '../../src/static-pages/css/index.css.js';

test('portfolio header follows the symbiote shell topbar contract', async () => {
  let source = portfolioCss;
  let shellSource = await readFile(
    new URL('../../node_modules/symbiote-ui/layout/LayoutShellMenu/LayoutShellMenu.css.js', import.meta.url),
    'utf8',
  );
  let themeWidgetSource = await readFile(
    new URL('../../node_modules/symbiote-ui/themes/CascadeThemeWidget/CascadeThemeWidget.css.js', import.meta.url),
    'utf8',
  );

  assert.match(shellSource, /height: var\(--sn-app-topbar-height, 40px\);/);
  assert.match(shellSource, /padding: var\(--sn-app-topbar-padding, 0 16px\);/);
  assert.match(shellSource, /background-image: linear-gradient\(to bottom, var\(--sn-sys-surface-raised\), var\(--sn-sys-surface\)\);/);
  assert.match(shellSource, /background-size: 100% var\(--sn-shell-top-gradient-size, 78px\);/);
  assert.match(shellSource, /min-height: var\(--sn-shell-menu-action-height, 26px\);/);
  assert.match(themeWidgetSource, /min-height: var\(--sn-shell-menu-action-height, 26px\);/);

  assert.match(source, /body:has\(\.pulse-screen\) \{\s*padding-left: 0;\s*--calc-top-pan-height: var\(--sn-app-topbar-height, 40px\);/);
  assert.match(source, /body:has\(\.pulse-screen\) \{[^}]*background-image: linear-gradient\(to bottom, var\(--pulse-surface-raised\), var\(--pulse-surface\)\);[^}]*background-size: 100% var\(--sn-shell-top-gradient-size, 78px\);/s);
  assert.match(source, /--sn-sys-on-accent: var\(--pulse-surface\);/);
  assert.match(source, /body:has\(\.pulse-screen\) > header \{[^}]*position: relative;[^}]*padding: var\(--sn-app-topbar-padding, 0 16px\);[^}]*border: 0;[^}]*background: transparent;/s);
  assert.match(source, /\.pulse-header-title \{[^}]*font-size: var\(--sn-app-title-size, 13px\);[^}]*font-weight: 700;[^}]*letter-spacing: var\(--sn-app-title-letter-spacing, 0\.5px\);/s);
  assert.match(source, /\.pulse-header-menu-button,\s*\.pulse-theme-widget \.ctw-trigger \{[^}]*min-height: var\(--sn-shell-menu-action-height, 26px\);[^}]*padding: var\(--sn-shell-menu-action-padding, 4px 10px\);[^}]*border: 1px solid transparent;[^}]*border-radius: var\(--sn-layout-header-button-radius, 4px\);[^}]*background: var\(--sn-shell-menu-action-bg, transparent\);/s);
  assert.match(source, /\.pulse-locale-toggle \{[^}]*border: 0;[^}]*--sn-step-1: 0px;[^}]*--sn-segmented-bg: transparent;[^}]*--sn-segmented-border: transparent;[^}]*--sn-segmented-item-min-height: var\(--sn-shell-menu-action-height, 26px\);/s);
  assert.doesNotMatch(source, /--sn-segmented-selected-bg:/);
  assert.doesNotMatch(source, /--sn-segmented-hover-bg:/);
  assert.match(source, /body:has\(\.pulse-screen\) \{\s*--calc-top-pan-height: var\(--sn-app-topbar-mobile-height, 56px\);/);

  assert.doesNotMatch(source, /body:has\(\.pulse-screen\) > header \{[^}]*font-size: clamp/s);
  assert.doesNotMatch(source, /body:has\(\.pulse-screen\) > header \{[^}]*border-color:/s);
});

test('portfolio shell chrome selectors do not affect semantic component chrome', () => {
  assert.match(portfolioCss, /body:has\(\.pulse-screen\) > footer \{\s*display: none;/);
  assert.match(portfolioCss, /body > header,\s*body > footer \{/);
  assert.match(portfolioCss, /body > footer a \{/);
  assert.doesNotMatch(portfolioCss, /body:has\(\.pulse-screen\) footer \{/);
  assert.doesNotMatch(portfolioCss, /body:has\(\.pulse-screen\) header \{/);
  assert.doesNotMatch(portfolioCss, /(?:^|\n)header \{/);
  assert.doesNotMatch(portfolioCss, /(?:^|\n)footer \{/);
  assert.doesNotMatch(portfolioCss, /(?:^|\n)header,\s*\nfooter \{/);
  assert.doesNotMatch(portfolioCss, /(?:^|\n)footer a \{/);
});

test('pulse cards and controls use theme tokens and preserve accessible motion states', () => {
  const pulseSelectorIndex = portfolioCss.indexOf('.pulse-feed {');
  assert.notEqual(pulseSelectorIndex, -1);
  const pulseSource = portfolioCss.slice(pulseSelectorIndex);

  assert.match(pulseSource, /\.pulse-card:hover,\s*\.pulse-card:focus-within \{[^}]*box-shadow: var\(--sn-shadow-md\);/s);
  assert.match(pulseSource, /\.pulse-card \{[^}]*background: var\(--sn-card-bg\);[^}]*border-radius: var\(--sn-card-radius\);/s);
  assert.match(pulseSource, /\.pulse-card \{[^}]*min-height: 0;[^}]*height: auto;[^}]*padding: 0;/s);
  assert.match(pulseSource, /\.pulse-card-grid \{[^}]*align-items: start;/s);
  assert.match(pulseSource, /\.pulse-project-updates-item \{[^}]*border-radius: var\(--sn-list-item-radius\);/s);
  assert.match(pulseSource, /\.pulse-feed-empty,\s*\.pulse-project-updates-empty \{[^}]*padding: var\(--sn-empty-state-padding\);/s);
  assert.match(pulseSource, /transition: transform var\(--sn-transition-fast\) var\(--sn-transition-easing\)/);
  assert.match(pulseSource, /font-size: var\(--sn-markdown-h2-size\);/);
  assert.match(pulseSource, /@media \(prefers-reduced-motion: reduce\) \{[^}]*\.pulse-card,/s);
  assert.doesNotMatch(pulseSource, /--sn-sys-shadow/);
  assert.doesNotMatch(pulseSource, /(?:gap|padding(?:-(?:top|right|bottom|left|block|inline))?|margin(?:-(?:top|right|bottom|left|block|inline))?|font-size|letter-spacing)\s*:\s*-?\d+(?:\.\d+)?(?:px|rem)/);
  assert.doesNotMatch(pulseSource, /transition:[^;]*(?:\d+(?:\.\d+)?(?:ms|s))/);
});
