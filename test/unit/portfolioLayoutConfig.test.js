import { normalizeCascadeThemeOptions } from 'symbiote-ui/themes/cascade-theme.js';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

import {
  PORTFOLIO_CONTENT_SPLIT_RATIO,
  PORTFOLIO_DEFAULT_GRAPH_VIEW_MODE,
  PORTFOLIO_GRAPH_PANEL_IMPORTANCE,
  PORTFOLIO_GRAPH_PANEL_MIN_INLINE_SIZE,
  PORTFOLIO_LAYOUT_MIN_INLINE_SIZE,
  PORTFOLIO_LAYOUT_RESPONSIVE_BREAKPOINT,
  PORTFOLIO_MEDIA_ACTIVE_NODE_SCALE,
  PORTFOLIO_MEDIA_FOCUS_ZOOM,
  PORTFOLIO_MEDIA_FORCE_LAYOUT_OPTIONS,
  PORTFOLIO_MEDIA_IMAGE_NODE_WEIGHT,
  PORTFOLIO_MEDIA_INFO_PANEL_SCALE,
  PORTFOLIO_TREE_PANEL_IMPORTANCE,
  PORTFOLIO_TREE_PANEL_MIN_INLINE_SIZE,
  PORTFOLIO_VIEWER_PANEL_MIN_INLINE_SIZE,
} from '../../src/static-pages/data/portfolioLayoutConfig.js';
import {
  PORTFOLIO_THEME_DARK_STATE,
  PORTFOLIO_THEME_DEFAULT_STATE,
  PORTFOLIO_THEME_LIGHT_STATE,
} from '../../src/static-pages/data/portfolioThemeDefaults.js';
import { getPage, versionAssetPath } from '../../src/static-pages/getPage.js';

test('portfolio layout keeps drawer mode below desktop auto-collapse widths', () => {
  assert.ok(PORTFOLIO_LAYOUT_RESPONSIVE_BREAKPOINT < PORTFOLIO_LAYOUT_MIN_INLINE_SIZE);
  assert.equal(PORTFOLIO_LAYOUT_RESPONSIVE_BREAKPOINT, 760);
});

test('mobile panel navigation is library-owned and sits below the static Show host', async () => {
  let source = await readFile(new URL('../../src/static-pages/js/index.js', import.meta.url), 'utf8');
  let styles = await readFile(new URL('../../src/static-pages/css/notchset.css.js', import.meta.url), 'utf8');
  let baseStyles = await readFile(new URL('../../src/static-pages/css/index.css.js', import.meta.url), 'utf8');
  let dockEnd = source.indexOf('</agent-dock-shell>');
  let showStart = source.indexOf('<div class="portfolio-show-static-region"');
  let navStart = source.indexOf('<div class="portfolio-mobile-navigation">');

  assert.ok(dockEnd >= 0 && showStart > dockEnd, 'the static Show host must follow the full player/chat dock');
  assert.ok(navStart > showStart, 'the panel navigation must sit below the static Show host');
  assert.doesNotMatch(source, /class="portfolio-mobile-nav"/, 'no hand-written mobile navigation survives');
  assert.doesNotMatch(source, /data-mobile-destination|markMobileDestination/,
    'the fixed three-destination footer is replaced by the dynamic rail');
  assert.doesNotMatch(source, /scrollIntoView/, 'rail navigation must not scroll ancestor containers');
  assert.match(baseStyles, /\.portfolio-mobile-navigation\s*\{\s*display: none;/,
    'the navigation stays hidden until the mobile rail is enabled');
  assert.match(baseStyles, /\.portfolio-show-static-region:empty\s*\{\s*display: none !important;/,
    'an empty static host must not reserve space on desktop');
  assert.match(styles, /@media \(max-width: 760px\)[\s\S]*?\.pulse-workspace \.portfolio-mobile-navigation\s*\{\s*display: block;/);
  assert.match(styles, /\.pulse-workspace \.portfolio-mobile-navigation > \.mobile-panel-rail\s*\{\s*display: grid;/,
    'one button per panel, in rail order');
  assert.match(styles, /\.pulse-workspace \.portfolio-mobile-navigation > \.mobile-panel-rail\[hidden\]\s*\{\s*display: none;/,
    'the author grid rule must not outspecify [hidden] and leave a disabled rail reachable');
  assert.match(styles, /\.pulse-workspace \.portfolio-mobile-navigation > \.mobile-panel-rail > button\s*\{[\s\S]*?min-block-size: var\(--notchset-control-touch-height\);/,
    'every rail button keeps a touch-sized target');
  assert.match(styles, /\.pulse-workspace \.portfolio-mobile-navigation > \.mobile-panel-rail > button\[aria-current='page'\]\s*\{/,
    'the active panel is marked on its button');
  assert.match(styles, /\.pulse-workspace \.portfolio-mobile-navigation > \.mobile-panel-rail > button:focus-visible\s*\{[\s\S]*?outline:/,
    'rail buttons stay visible to the keyboard');
  assert.match(styles, /> agent-dock-shell > panel-layout\[mobile-panel-rail-enabled\]\s*\{\s*scroll-snap-type: inline mandatory;/,
    'the rail keeps the snapping contract that settles a panel under the finger');
});

test('rail mode adds to the layout projection instead of replacing it', async () => {
  let source = await readFile(new URL('../../src/static-pages/js/tour-player/index.js', import.meta.url), 'utf8');

  // A width test alone made every narrow viewport look like a rail slide, so a
  // visible map whose target could not resolve was reported as hidden and the
  // action falsely succeeded instead of rejecting.
  assert.match(
    source,
    /const mobile = railMode \|\| layout\.hasAttribute\('drawer-mode-active'\);/,
    'the layout keeps its own projection state and the rail only adds to it',
  );
  assert.doesNotMatch(source, /const mobile = window\.innerWidth <=/,
    'panel reveal must not infer the projection from the viewport width');
  assert.match(source, /const railExcluded = Boolean\(railMode/,
    'the rail-excluded panel is measured from the layout node, not assumed open');
  assert.match(source, /const railRevealed = railMode && !railExcluded;/);
  assert.match(source, /if \(inspected\?\.railRevealed && inspected\.panelId\) \{\s*railLayout\?\.scrollToPanel\?\./,
    'only a panel that is a rail slide is scrolled to');
});

test('portfolio supplies separate light and dark presets through the public cascade contract', () => {
  assert.equal(PORTFOLIO_THEME_DEFAULT_STATE, PORTFOLIO_THEME_LIGHT_STATE);
  assert.equal(PORTFOLIO_THEME_LIGHT_STATE.mode, 'light');
  assert.equal(PORTFOLIO_THEME_DARK_STATE.mode, 'dark');
  for (let preset of [PORTFOLIO_THEME_LIGHT_STATE, PORTFOLIO_THEME_DARK_STATE]) {
    let normalized = normalizeCascadeThemeOptions(preset);
    assert.deepEqual(normalized, preset, 'provider must accept every preset value without clamping');
  }
});

test('portfolio auto-collapse prefers graph before file navigation', () => {
  assert.ok(PORTFOLIO_GRAPH_PANEL_IMPORTANCE < PORTFOLIO_TREE_PANEL_IMPORTANCE);
  assert.ok(PORTFOLIO_GRAPH_PANEL_MIN_INLINE_SIZE > PORTFOLIO_TREE_PANEL_MIN_INLINE_SIZE);
});

test('portfolio gives reading content two thirds of the space after navigation', async () => {
  let source = await readFile(new URL('../../src/static-pages/js/index.js', import.meta.url), 'utf8');

  assert.equal(PORTFOLIO_CONTENT_SPLIT_RATIO, 2 / 3);
  assert.equal(PORTFOLIO_VIEWER_PANEL_MIN_INLINE_SIZE, PORTFOLIO_GRAPH_PANEL_MIN_INLINE_SIZE);
  assert.match(
    source,
    /LayoutTree\.createSplit\(\s*'horizontal',\s*viewerPanel,\s*graphPanel,\s*PORTFOLIO_CONTENT_SPLIT_RATIO,[\s\S]*?\{ lockRatio: true \}/
  );
});

test('portfolio graph defaults to structured mode', async () => {
  let source = await readFile(new URL('../../src/static-pages/js/index.js', import.meta.url), 'utf8');

  assert.equal(PORTFOLIO_DEFAULT_GRAPH_VIEW_MODE, 'structured');
  assert.match(source, /if \(typeof location === 'undefined'\) return PORTFOLIO_DEFAULT_GRAPH_VIEW_MODE;/);
  assert.match(source, /if \(!modeParam\) return PORTFOLIO_DEFAULT_GRAPH_VIEW_MODE;/);
  assert.match(source, /if \(modeParam === 'media'\) return 'media';/);
  assert.match(source, /if \(modeParam === 'flat'\) return 'flat';/);
  assert.match(source, /if \(modeParam === 'structured'\) return 'structured';/);
  assert.match(source, /if \(this\.viewMode === PORTFOLIO_DEFAULT_GRAPH_VIEW_MODE\) {\s*nextUrl\.searchParams\.delete\('mode'\);/);
  assert.match(source, /nextUrl\.searchParams\.set\('mode', this\.viewMode\);/);
  assert.match(source, /group: 'graph-view',\s*groupLabel: tPortfolio\('graph\.viewGroup'\),\s*groupOrder: 18,\s*active: viewMode === 'media'/);
  assert.match(source, /group: 'graph-view',\s*groupLabel: tPortfolio\('graph\.viewGroup'\),\s*groupOrder: 18,\s*active: viewMode === 'flat'/);
  assert.match(source, /group: 'graph-view',\s*groupLabel: tPortfolio\('graph\.viewGroup'\),\s*groupOrder: 18,\s*active: viewMode === 'structured'/);
  assert.match(source, /pathStyleActions = \[\],/);
  assert.match(source, /\.\.\.pathStyleActions,/);
  assert.match(source, /group: 'graph-tools',\s*groupLabel: tPortfolio\('graph\.toolsGroup'\),\s*groupOrder: 30,/);
  assert.match(source, /function getGraphPathStyleMenuActionOptions\(\) {/);
  assert.match(source, /groupLabel: tPortfolio\('graph\.connectionsGroup'\),/);
  assert.match(source, /GRAPH_PATH_STYLE_MENU_ITEMS,/);
  assert.match(source, /Object\.values\(GRAPH_PATH_STYLE_MENU_ITEMS\)\.map\(\(item\) => item\.icon\)\.filter\(Boolean\)/);
  assert.match(source, /let pathStyleActionOptions = getGraphPathStyleMenuActionOptions\(\);/);
  assert.match(source, /let pathStyleActions = this\.structuredMode\s*\? this\.graphController\?\.getPathStyleMenuActions\?\.\(pathStyleActionOptions\)\s*\|\| createGraphPathStyleMenuActions\({\s*\.\.\.pathStyleActionOptions,\s*mode: this\.viewMode,\s*pathStyle: this\.pathStyle,/);
  assert.match(source, /runPathStyleMenuAction\(actionId\) {\s*if \(!this\.structuredMode\) return false;\s*if \(this\.graphController\?\.runPathStyleMenuAction\?\.\(actionId\)\) {/);
  assert.match(source, /let style = resolveGraphPathStyleAction\(actionId\);/);
  assert.match(source, /syncStructuredPathStyleSideEffects\(\) {/);
  assert.match(source, /function normalizeGraphInnerMenuActions\(actions = \[\]\) {/);
  assert.match(source, /!String\(action\.id\)\.startsWith\('graph-layout:'\)/);
  assert.match(source, /groupOrder: Number\.isFinite\(Number\(action\.groupOrder\)\) \? Math\.max\(35, Number\(action\.groupOrder\)\) : 35,/);
  assert.match(source, /this\.addEventListener\('panel-menu-actions', \(event\) => this\.onInnerPanelMenuActions\(event\)\);/);
  assert.match(source, /this\.syncPanelMenuActions\(\);\s*if \(this\._ready\) {/);
  assert.match(source, /onInnerPanelMenuActions\(event\) {\s*if \(event\.target === this\) return;\s*event\.stopPropagation\(\);/);
  assert.match(source, /innerMenuActions: this\.structuredMode \? this\.innerMenuActions : \[\],/);
  assert.match(source, /runInnerPanelMenuAction\(event\) {\s*let actionId = event\.detail\?\.actionId \|\| '';/);
  assert.match(source, /this\.canvas\.dispatchEvent\(new CustomEvent\('panel-menu-action', {\s*bubbles: false,\s*composed: false,\s*detail: event\.detail,/);
  assert.match(source, /color: 'var\(--sn-conn-color, var\(--pulse-accent\)\)'/);
  assert.doesNotMatch(source, /var\(--sn-conn-color, var\(--sn-node-selected\)\)/);
});

test('portfolio initial graph load focuses the selected node', async () => {
  let source = await readFile(new URL('../../src/static-pages/js/index.js', import.meta.url), 'utf8');

  assert.match(source, /setCanvas\(canvas\) {\s*this\.canvas = canvas;\s*this\.syncCanvas\({ focus: true, focusScope: 'node' }\);/);
  assert.match(source, /setGraphController\(controller\) {\s*this\.graphController = controller;\s*this\.syncCanvas\({ focus: true, focusScope: 'node' }\);/);
  assert.match(source, /portfolioRuntime\.select\(id, { focus: true, focusScope: 'group' }\);/);
});

test('portfolio graph panel lazily creates only the active renderer', async () => {
  let source = await readFile(new URL('../../src/static-pages/js/index.js', import.meta.url), 'utf8');

  assert.doesNotMatch(source, new RegExp('<node-canvas class="portfolio-canvas"></node-canvas>\\s*<canvas-graph'));
  assert.match(source, /ensureActiveGraphRenderer\(\) {\s*return this\.ensureGraphRenderer\(this\.viewMode\);/);
  assert.match(source, /ensureMediaGraphRenderer\(\) {\s*if \(this\.mediaGraph\) return this\.mediaGraph;\s*let mediaGraph = .*document\.createElement\('portfolio-media-canvas-graph'\)/);
  assert.match(source, /class PortfolioMediaCanvasGraph extends PortfolioCanvasGraphBase/);
  assert.match(source, /mediaGraph\.setGraphModel\?\.\(mediaModel\);/);
  assert.match(source, /ensureStructuredGraphRenderer\(\) {\s*if \(this\.canvas\) return this\.canvas;\s*let canvas = .*document\.createElement\('node-canvas'\)/);
  assert.match(source, /ensureFlatGraphRenderer\(\) {\s*if \(this\.flatGraph\) return this\.flatGraph;\s*let flatGraph = .*document\.createElement\('canvas-graph'\)/);
  assert.match(source, /this\.graphController\?\.connect\?\.\({\s*structuredCanvas: canvas,/);
  assert.match(source, /this\.graphController\?\.connect\?\.\({\s*flatGraph,/);
  assert.match(source, /this\.canvas\?\.suspendLayout\?\.\({ reason: 'panel-disconnected' }\);/);
  assert.match(source, /this\.flatGraph\?\.suspendLayout\?\.\({ reason: 'panel-disconnected' }\);/);
});

test('portfolio media graph keeps the CanvasGraph contract explicit', async () => {
  let source = await readFile(new URL('../../src/static-pages/js/index.js', import.meta.url), 'utf8');
  let mediaModelSource = await readFile(
    new URL('../../src/static-pages/data/portfolioMediaGraph.js', import.meta.url),
    'utf8'
  );
  let mediaCatalogSource = await readFile(
    new URL('../../src/static-pages/data/portfolioMediaCatalog.js', import.meta.url),
    'utf8'
  );
  let canvasGraphSource = await readFile(new URL('../../node_modules/symbiote-ui/canvas/CanvasGraph/CanvasGraph.js', import.meta.url), 'utf8');
  let canvasMediaSource = await readFile(
    new URL('../../node_modules/symbiote-ui/canvas/canvas-graph-media.js', import.meta.url),
    'utf8'
  );

  assert.match(source, /class PortfolioMediaCanvasGraph extends PortfolioCanvasGraphBase/);
  assert.doesNotMatch(source, /_drawNodeIcon\(ctx, node, pos, radius, typeRgb, layerOpacity\) {/);
  assert.doesNotMatch(source, /syncMediaImages\(\) {/);
  assert.match(canvasGraphSource, /drawCanvasGraphNodeMedia\(/);
  assert.match(canvasGraphSource, /this\._mediaImages/);
  assert.match(canvasMediaSource, /export function drawCanvasGraphNodeMedia\(/);
  assert.match(canvasMediaSource, /export class CanvasGraphMediaImages/);
  assert.match(canvasMediaSource, /export function drawCanvasGraphMediaBadge\(/);
  assert.match(mediaModelSource, /function getPortfolioMediaFit\(src, explicitFit = ''\) {/);
  assert.match(mediaModelSource, /isTransparentPortfolioMediaSrc\(src\) \? 'contain' : 'cover'/);
  assert.match(source, /resolveMediaGraphPrimaryFocusId\(entryId\) {/);
  assert.match(source, /this\.flyToNode\?\.\(ids\[0\], {\s*zoom: PORTFOLIO_MEDIA_FOCUS_ZOOM,\s*transitionRoutePadding: 128,\s*transitionRouteMaxZoom: 1\.15,/);
  assert.match(source, /let focusIds = new Set\(\[this\.resolveMediaGraphPrimaryFocusId\(id\), id\]\.filter\(Boolean\)\);/);
  assert.match(source, /if \(targetIds\.some\(\(targetId\) => focusIds\.has\(targetId\)\)\) addNodeId\(node\.id\);/);
  assert.equal(PORTFOLIO_MEDIA_IMAGE_NODE_WEIGHT, 1.6);
  assert.equal(PORTFOLIO_MEDIA_ACTIVE_NODE_SCALE, 1.5);
  assert.equal(PORTFOLIO_MEDIA_INFO_PANEL_SCALE, 1);
  assert.equal(PORTFOLIO_MEDIA_FOCUS_ZOOM, 1.8);
  assert.equal(PORTFOLIO_MEDIA_FORCE_LAYOUT_OPTIONS.layoutAlgorithm, 'crystal');
  assert.equal(PORTFOLIO_MEDIA_FORCE_LAYOUT_OPTIONS.linkDistance, 72);
  assert.equal(PORTFOLIO_MEDIA_FORCE_LAYOUT_OPTIONS.groupDistance, 90);
  assert.match(source, /this\.setForceLayoutOptions\?\.\(PORTFOLIO_MEDIA_FORCE_LAYOUT_OPTIONS\);/);
  assert.match(source, /mediaGraph\.setAttribute\('active-node-scale', String\(PORTFOLIO_MEDIA_ACTIVE_NODE_SCALE\)\);/);
  assert.match(source, /mediaGraph\.setAttribute\('info-panel-scale', String\(PORTFOLIO_MEDIA_INFO_PANEL_SCALE\)\);/);
  assert.doesNotMatch(source, /mediaGraph\.setVisualOptions\?\.\(\{/);
  assert.doesNotMatch(source, /_drawInfoPanel\(ctx, dpr\) {/);
  assert.doesNotMatch(source, /draw\(\) \{\s*if \(this\.activeNode && !this\.deactivating\)/);
  assert.match(mediaModelSource, /mediaParentId: parentId \|\| '',/);
  assert.match(mediaModelSource, /createPortfolioMediaLeafNode\((?:item|enrichedItem), \{ parentId: projectId \}\)/);
  assert.match(mediaModelSource, /children = mediaItems\.map\(\(item\) => item\.id\)/);
  assert.match(mediaModelSource, /projectNode\.weight = getHubWeight\(mediaItems\.length\)/);
  assert.match(mediaModelSource, /for \(let targetId of item\.targetIds \|\| \[\]\) {/);
  assert.match(mediaModelSource, /groups: groups\.filter\(\(group\) => group\.nodeIds\.length > 1\)/);
  assert.doesNotMatch(mediaModelSource, /github|npmjs|linkedin|facebook/);
  assert.match(source, /for \(let focusId of focusIds\) addNodeId\(focusId\);/);
  assert.doesNotMatch(source, /mediaOverlay/);
  assert.doesNotMatch(source, /syncMediaOverlay/);
  assert.doesNotMatch(source, /getMediaTileUrl/);
  assert.doesNotMatch(source, /weight: getMediaCanvasNodeWeight/);
  assert.doesNotMatch(source, /hitTestMediaOverlay/);
  assert.doesNotMatch(mediaModelSource, /makeImageDescriptor|media\/\$\{project\.slug\}\/cover/);
  assert.match(mediaModelSource, /mediaFit: descriptor\.fit,/);
  assert.match(mediaModelSource, /for \(let item of catalog\) {/);
  assert.doesNotMatch(mediaModelSource, /extractMarkdownLinks|makeYouTubeDescriptor|getYouTubeVideoId/);
  assert.match(mediaCatalogSource, /function youtube\(videoId, slug, label, \{ targetIds \} = \{\}\) {/);
  assert.match(mediaCatalogSource, /function ims\(slug, kind, \{/);
  assert.match(mediaCatalogSource, /srcData: 'https:\/\/rnd-pro\.com\/ims-data\//);
  assert.doesNotMatch(mediaCatalogSource, /imsType:|activation: Object\.freeze\(\{ provider: 'ims', data:/);
  assert.match(source, /mediaGraph\.addEventListener\('file-selected'/);
  assert.match(source, /mediaGraph\.addEventListener\('group-selected'/);
  assert.match(source, /let mediaGraphInitialFocusDone = false;/);
  assert.match(source, /let mediaGraphInitialFocusUntil = 0;/);
  assert.match(source, /let disarmMediaGraphInitialFocus = \(\) => {/);
  assert.match(source, /mediaGraph\.removeEventListener\('layout-tick', refocusMediaGraphAfterLayout\);/);
  assert.match(source, /if \(this\.viewMode !== 'media'\) {\s*disarmMediaGraphInitialFocus\(\);\s*return;\s*}/);
  assert.match(source, /if \(!mediaGraphInitialFocusUntil\) mediaGraphInitialFocusUntil = now \+ 3000;/);
  assert.match(source, /portfolioRuntime\.syncCanvas\({ focus: true, focusScope: 'node-fit' }\);/);
  assert.match(source, /if \(now >= mediaGraphInitialFocusUntil\) {\s*disarmMediaGraphInitialFocus\(\);/);
  assert.doesNotMatch(source, /event\?\.type === 'layout-done' \|\| now >= mediaGraphInitialFocusUntil/);
  assert.doesNotMatch(source, /if \(mediaGraph\.activeNode\) {\s*disarmMediaGraphInitialFocus\(\);\s*return;\s*}/);
  assert.match(source, /mediaGraph\.addEventListener\('layout-tick', refocusMediaGraphAfterLayout\);/);
  assert.match(source, /mediaGraph\.addEventListener\('layout-done', refocusMediaGraphAfterLayout\);/);
  assert.match(source, /mediaGraph\.addEventListener\('pointerdown', disarmMediaGraphInitialFocus, \{ once: true \}\);/);

  assert.match(canvasGraphSource, /_drawNodeIcon\(ctx, node, pos, radius, typeRgb, layerOpacity\) {/);
  assert.match(canvasGraphSource, /algorithm === 'spring' \|\| algorithm === 'organic' \|\| algorithm === 'oil-cloud' \|\| algorithm === 'crystal'/);
  assert.match(canvasGraphSource, /'crystalStrength'/);
  assert.match(canvasGraphSource, /'crystalRingDistance'/);
  assert.match(canvasGraphSource, /'crystalSpokes'/);
  assert.match(canvasGraphSource, /'crystalAngleJitter'/);
  assert.match(canvasGraphSource, /setGraphModel\(model\) {/);
  assert.match(canvasGraphSource, /setVisualOptions\(options = \{\}\) {/);
  assert.match(canvasGraphSource, /focusNodes\(nodeIds, options = {}\) {/);
  assert.match(canvasGraphSource, /getSmooth\(id\) {/);
  assert.match(canvasGraphSource, /getVisualLayerTransform\(depth = 0\) {/);
  assert.match(canvasGraphSource, /hitTestScreen\(sx, sy\) {/);
});

test('portfolio structured graph toolbar routes content actions', async () => {
  let source = await readFile(new URL('../../src/static-pages/js/index.js', import.meta.url), 'utf8');

  assert.match(source, /canvas\.addEventListener\('toolbar-action', \(event\) => this\.onStructuredGraphToolbarAction\(event\)\);/);
  assert.match(source, /onStructuredGraphToolbarAction\(event\) {/);
  assert.match(source, /if \(action === 'explore'\) {\s*portfolioRuntime\.select\(id, { focus: true, focusScope: 'group' }\);/);
  assert.match(source, /if \(action === 'view-code'\) {\s*portfolioRuntime\.select\(id, { focus: false }\);/);
});

test('portfolio mobile header toggles the file navigation drawer through layout API', async () => {
  let source = await readFile(new URL('../../src/static-pages/js/index.js', import.meta.url), 'utf8');

  assert.match(source, /document\.dispatchEvent\(new CustomEvent\('portfolio-open-materials'/);
  assert.match(source, /layout\.toggleDrawer\('start'\);/);
  assert.doesNotMatch(source, /document\.querySelector\('\\.portfolio-layout \\.layout-drawer-handle-stack-start/);
});

test('portfolio appearance delegates persistent initial state to the library controls', async () => {
  let source = await readFile(new URL('../../src/static-pages/js/index.js', import.meta.url), 'utf8');
  let pageSource = await readFile(new URL('../../src/static-pages/portfolioPage.js', import.meta.url), 'utf8');

  assert.match(source, /const projectTreeGroupDirectoryIds = PROJECT_TREE_GROUPS\.map/);
  assert.match(source, /storageKey: TREE_STORAGE_KEY/);
  assert.doesNotMatch(source, /CASCADE_THEME_DEFAULTS/);
  assert.doesNotMatch(source, /applyCascadeTheme\(document\.documentElement/);
  assert.match(source, /function onPortfolioCascadeThemeChange\(\) {\s*schedulePortfolioChromeLocalization\(\);\s*}/);
  assert.doesNotMatch(source, /portfolioRuntime\.resetVisualState\(\)/);
  assert.doesNotMatch(source, /resetVisualState\(\) {/);
  assert.match(source, /document\.addEventListener\('cascade-theme-change', onPortfolioCascadeThemeChange\);/);
  assert.match(source, /startPortfolioChromeLocalization\(\);\s*\n\s*let themeSharingController = initPortfolioThemeSharing\(\);/);
  assert.match(source, /setGraphPanel\(panel\) {\s*this\.graphPanel = panel \|\| null;\s*}/);
  assert.match(source, /connectedCallback\(\) {\s*portfolioRuntime\.setGraphPanel\(this\);/);
  assert.match(source, /if \(portfolioRuntime\.graphPanel === this\) portfolioRuntime\.setGraphPanel\(null\);/);
  assert.doesNotMatch(source, /PORTFOLIO_CASCADE_THEME_DEFAULT_STATE/);
  assert.doesNotMatch(source, /seedPortfolioCascadeThemeDefaultStateStorage/);
  assert.match(source, /default-state/);
  assert.match(source, /PORTFOLIO_THEME_DEFAULT_STATE_ATTR/);
  assert.doesNotMatch(source, /THEME_STORAGE_KEY/);
  assert.doesNotMatch(source, /THEME_TARGET_SELECTOR/);
  assert.doesNotMatch(pageSource, /default-state=/);
  assert.doesNotMatch(pageSource, /storage-key=/);
  assert.doesNotMatch(pageSource, /target-selector=/);
  assert.doesNotMatch(source, /document\.addEventListener\('cascade-theme-change', this\._onThemeReset\);/);
  assert.doesNotMatch(source, /globalThis\.localStorage\?\.removeItem\?\.\(TREE_STORAGE_KEY\);/);
});

test('portfolio shell CSS consumes cascade system tokens through a local adapter', async () => {
  let source = await readFile(new URL('../../src/static-pages/css/index.css.js', import.meta.url), 'utf8');
  let commonSource = await readFile(new URL('../../src/common-styles/common.css.js', import.meta.url), 'utf8');

  assert.match(source, /--pulse-surface: var\(--sn-sys-surface,/);
  assert.match(source, /--pulse-surface-panel: var\(--sn-sys-surface-panel,/);
  assert.match(source, /--pulse-text: var\(--sn-sys-on-surface,/);
  assert.match(source, /--pulse-text-dim: var\(--sn-sys-on-surface-dim,/);
  assert.match(source, /--pulse-outline: var\(--sn-sys-outline,/);
  assert.match(source, /--pulse-accent: var\(--sn-sys-accent,/);
  assert.match(commonSource, /--clr-1: var\(--sn-sys-surface,/);
  assert.match(commonSource, /--clr-2: var\(--sn-sys-on-surface,/);

  for (let staleToken of [
    '--sn-bg',
    '--sn-text',
    '--sn-text-dim',
    '--sn-node-bg',
    '--sn-node-border',
    '--sn-node-selected',
    '--sn-node-hover',
  ]) {
    let reference = new RegExp(`var\\(${staleToken}(?:\\s*[,)]|\\s*$)`, 'm');
    assert.doesNotMatch(source, reference, staleToken);
    assert.doesNotMatch(commonSource, reference, staleToken);
  }
});

test('portfolio appearance panel owns its constrained scroll area', async () => {
  let source = await readFile(new URL('../../src/static-pages/css/index.css.js', import.meta.url), 'utf8');

  assert.match(source, /\.portfolio-layout layout-node \.panel-content \{[\s\S]*?overflow: hidden;/);
  assert.match(
    source,
    /\.portfolio-layout layout-node \.panel-content:has\(> portfolio-theme-panel\) \{[\s\S]*?overflow: auto;/,
  );
  assert.match(
    source,
    /portfolio-theme-panel,[\s\S]*?\.portfolio-theme-editor \{[\s\S]*?block-size: auto;[\s\S]*?min-block-size: 100%;/,
  );
});

test('portfolio mobile workspace uses dynamic viewport height when available', async () => {
  let source = await readFile(new URL('../../src/static-pages/css/index.css.js', import.meta.url), 'utf8');

  assert.match(source, /--pulse-workspace-block-size: calc\(100vh - var\(--calc-top-pan-height\)\);/);
  assert.match(source, /@supports \(height: 100dvh\)/);
  assert.match(source, /--pulse-workspace-block-size: calc\(100dvh - var\(--calc-top-pan-height\)\);/);
  assert.match(source, /height: var\(--pulse-workspace-block-size\);/);
  assert.match(source, /min-height: var\(--pulse-workspace-block-size\);/);
});

test('portfolio static pages version local CSS and JS assets with the shared build identity', async () => {
  let previousVersion = process.env.CV_ASSET_VERSION;
  let previousGithubSha = process.env.GITHUB_SHA;

  try {
    delete process.env.GITHUB_SHA;
    process.env.CV_ASSET_VERSION = 'abcdef1234567890';

    let html = await getPage({ TITLE: 'Test', HEADER_CONTENT: '' });
    let buildId = /name="cv-build-id" content="([^"]+)"/.exec(html)[1];
    assert.equal(versionAssetPath('js/index.js'), `js/index.js?v=abcdef123456-${buildId}`);
    assert.equal(versionAssetPath('css/index.css'), `css/index.css?v=abcdef123456-${buildId}`);
    assert.equal(versionAssetPath('js/index.js?v=current'), 'js/index.js?v=current');
    assert.equal(versionAssetPath('https://example.com/index.js'), 'https://example.com/index.js');

    delete process.env.CV_ASSET_VERSION;
    assert.equal(versionAssetPath('js/index.js'), `js/index.js?v=${buildId}`);
  } finally {
    if (previousVersion === undefined) {
      delete process.env.CV_ASSET_VERSION;
    } else {
      process.env.CV_ASSET_VERSION = previousVersion;
    }

    if (previousGithubSha === undefined) {
      delete process.env.GITHUB_SHA;
    } else {
      process.env.GITHUB_SHA = previousGithubSha;
    }
  }
});

test('portfolio structured graph applies layout only on binding, explicit selection, and URL change', async () => {
  let source = await readFile(new URL('../../src/static-pages/js/index.js', import.meta.url), 'utf8');
  let bindingStart = source.indexOf('  bindStructuredGraphRenderer({ allowHidden = false } = {}) {');
  let bindingEnd = source.indexOf('  setStructuredGraphLoading(active) {', bindingStart);
  let bindingSource = source.slice(bindingStart, bindingEnd);
  let selectionStart = source.indexOf('  setGraphLayout(layoutAlgo) {');
  let selectionEnd = source.indexOf('  runPathStyleMenuAction(actionId) {', selectionStart);
  let selectionSource = source.slice(selectionStart, selectionEnd);

  assert.equal((source.match(/setNodePositions\(this\.canvas/g) || []).length, 3);
  assert.equal((bindingSource.match(/setNodePositions\(this\.canvas/g) || []).length, 1);
  assert.equal((bindingSource.match(/portfolioRuntime\.syncCanvas/g) || []).length, 1);
  assert.doesNotMatch(bindingSource, /refreshConnections/);
  assert.equal((selectionSource.match(/setNodePositions\(this\.canvas/g) || []).length, 1);
  assert.equal((selectionSource.match(/portfolioRuntime\.syncCanvas/g) || []).length, 1);
  assert.doesNotMatch(selectionSource, /refreshConnections|selectedId\s*=|expectedStructuredMediaId\s*=/);
  assert.match(selectionSource, /setPortfolioStructuredLayoutInUrl\(location\.href, this\.graphLayout\)/);
  assert.doesNotMatch(source, /\/\/ setNodePositions|icon: 'snowflake'/);
});

test('mock agent provider is wired during site bootstrap regardless of CV Show', async () => {
  let source = await readFile(new URL('../../src/static-pages/js/index.js', import.meta.url), 'utf8');
  let connectionIndex = source.indexOf('this.replaceChildren(template.content)');
  let providerIndex = source.indexOf('this._dock?.setAgentProvider?.(');

  assert.match(
    source,
    /import\s*\{[^}]*\bcreateCvShowMockAgentProvider\b[^}]*\}\s*from '\.\/tour-player\/mockAgentProvider\.js'/,
    'portfolio workspace must import the mock agent provider factory itself',
  );
  assert.ok(connectionIndex >= 0, 'dock template connection must exist');
  assert.ok(providerIndex >= 0, 'workspace bootstrap must wire the mock agent provider');
  assert.ok(
    providerIndex > connectionIndex,
    'provider wiring must run after the dock template is connected, not before upgrade',
  );
  assert.match(
    source,
    /customElements\.whenDefined\('agent-dock-shell'\)\.then\(/,
    'provider wiring must wait for the dock definition so the public method exists',
  );
});
