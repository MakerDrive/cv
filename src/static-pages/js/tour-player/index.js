import { getShowLog } from '../show-log/index.js';
import '../../../ui-components/client-only/tour-player/tour-player.js';
import { createPresenterCursor } from 'symbiote-ui/chat/presenter-cursor.js';
import { createCvShowSound } from './showSound.js';
import {
  ShowAttentionController,
  ShowAudioArbiter,
  ShowMediaController,
  monitorMeaningfulShowInteractions,
  waitForShowDomReadiness,
  waitForShowVisualSettlement,
} from 'symbiote-ui/chat/show-runtime';
import { TOUR_LOCALE_MESSAGES } from '../../data/tourTranslations.js';
import { PORTFOLIO_LAYOUT_RESPONSIVE_BREAKPOINT } from '../../data/portfolioLayoutConfig.js';
import { activateCvShowTarget, activateCvShowUserAction } from './activation.js';
import { getCvShowRuntimeAuthority } from './cvShowRuntimeAuthority.js';
import {
  createCvShowDirectiveRunner,
  createCvShowRuntimeCleanup,
  isDeferredMapAction,
  runCvShowPresentationOperation,
} from './showAdapter.js';
import { createCvShowPlaybackEntries } from './presentationContext.js';
import { isCvShowQuietRestoreActive } from './presentationQuietRestore.js';
import {
  canonicalizeCvShowRoute,
  createCvShowRouteRequestCoordinator,
  createCvShowSectionUrl,
  resolveCvShowEntryForPortfolioRoute,
  stripCvShowRoute,
} from './routing.js';
import {
  cvShowGlobalTimeOf,
  createCvShowCompositionTimeline,
} from './compositionTime.js';
import {
  animateCvShowScrollIntoView,
  scrollCvShowSpaceIntoView,
  createCvShowTextMarkerTarget,
  ensureCvShowArticleProject,
  ensureCvShowMediaProject,
  focusPortfolioMapTarget,
  isPortfolioMapTarget,
  isShowTargetReadyForAction,
  resolveCvShowActionTargetScroll,
  resolveCvShowScrollDuration,
  resolveCvShowSelectionQuote,
  resolveCvShowSemanticTarget,
  resolvePortfolioMapTarget,
  restoreCvShowHeldAttentionTarget,
  shouldRestoreCvShowSetupAttentionTarget,
  shouldBypassCvShowScrollSettlement,
  shouldDeferCvShowNavigationTarget,
  waitForPortfolioMapTargetVisualSettlement,
} from './targetResolution.js';
import {
  CV_SHOW_SEEK_KEYS,
  pathMatchesSelector,
  pointerAffordanceFromPath,
  resolveCvShowGestureClear,
} from './gestureClearPolicy.js';
import { resolveCvShowPanelRevealState, shouldDeferMapAction } from './panelRevealPolicy.js';
import { bindStaleNavDrawerCloser, createStaleNavDrawerCloser, shouldCloseStaleNavDrawer } from './drawerTransitionPolicy.js';
import { createCvShowMediaTargetResolver } from './showMediaTargetResolution.js';
import { createImsShowMediaTarget } from './imsShowMediaAdapter.js';
import { createCvShowPauseGate } from './pauseGate.js';
import { createYouTubeNoCookieEmbedUrl } from './youtubeEmbedUrl.js';
import { resolveVisibleShowPlayer } from '../showPlayerResolver.js';
import { resolvePortfolioTreeHighlightId } from '../portfolioPulseRuntime.js';

export const cvShowRuntimeAuthority = getCvShowRuntimeAuthority();

/** Keeps the real player visible while Show cues remain passive and never press Play. */
export function configurePortfolioYouTubeIframe(iframe, videoId) {
  if (!iframe) return false;
  iframe.dataset.youtubeVideoId = videoId;
  iframe.src = createYouTubeNoCookieEmbedUrl(videoId, { origin: location.origin });
  return true;
}

function getLocaleMessage(key) {
  const locale = document.documentElement.lang || 'en';
  const messages = TOUR_LOCALE_MESSAGES[locale] || TOUR_LOCALE_MESSAGES.en;
  return messages[key] || TOUR_LOCALE_MESSAGES.en[key] || '';
}

function findTreeRow(workspace, entryId, runtime) {
  let treeId = resolvePortfolioTreeHighlightId(entryId, [], runtime?.treeDirectorySelection);
  let rows = Array.from(workspace.querySelectorAll('.sn-tree-row'));
  return rows.find((row) => row.dataset.treeId === treeId) || null;
}

function firstVisibleSibling(anchor) {
  let sibling = anchor?.nextElementSibling;
  while (sibling?.classList?.contains('portfolio-tour-target')) sibling = sibling.nextElementSibling;
  return sibling || anchor?.parentElement || anchor;
}

function escapeAttributeSelectorValue(value) {
  if (globalThis.CSS?.escape) return globalThis.CSS.escape(String(value));
  return String(value).replaceAll('\\', '\\\\').replaceAll('"', '\\"');
}

function findVisibleProfileExperience(viewer, valueOnly = false) {
  const row = Array.from(viewer?.querySelectorAll?.('tbody tr') || []).find((candidate) => {
    const rect = candidate.getBoundingClientRect?.();
    return rect?.width > 0 && rect.height > 0 && candidate.textContent?.includes('15+');
  });
  return valueOnly ? row?.querySelector?.('td:nth-child(2)') || row : row;
}

const SPINNER_PLAY_MEDIA_ID = 'media/photopizza/ims/spinner';

function mediaSlotElement(targetId) {
  try {
    return document.querySelector(
      `[data-media-id="${escapeAttributeSelectorValue(targetId)}"]`,
    ) || null;
  } catch {
    return null;
  }
}

/**
 * Resolves the PhotoPizza 360 spinner target to its real toolbar Play button
 * inside shadow DOM so the focus frame and cursor land on the physical
 * control. Falls back to the media host when the button is unreachable;
 * never throws. Other targets are unaffected.
 */
function resolveSpinnerMediaTarget(targetId) {
  if (targetId !== SPINNER_PLAY_MEDIA_ID) return null;
  try {
    const slot = mediaSlotElement(targetId);
    if (!slot) return null;
    const host = slot.matches?.('sn-media-host')
      ? slot
      : slot.querySelector?.('sn-media-host');
    const scope = host || slot;
    const viewer = scope.querySelector?.('ims-viewer')
      || (scope.matches?.('ims-viewer') ? scope : null);
    const spinner = viewer?.shadowRoot?.querySelector?.('ims-spinner')
      || viewer?.querySelector?.('ims-spinner');
    const toolbar = spinner?.shadowRoot?.querySelector?.('ims-spinner-toolbar')
      || spinner?.querySelector?.('ims-spinner-toolbar');
    const button = toolbar?.shadowRoot?.querySelector?.('ims-button')
      || toolbar?.querySelector?.('ims-button');
    return visibleElement(button) || visibleElement(host || slot) || null;
  } catch {
    return null;
  }
}

/**
 * Whether most of an element is visible: inside the viewport and inside every scrolling ancestor.
 * @param {Element} element
 */
function isElementInView(element) {
  const rect = element.getBoundingClientRect();
  if (!(rect.width > 0 || rect.height > 0)) return false;
  let top = Math.max(0, rect.top);
  let bottom = Math.min(globalThis.innerHeight, rect.bottom);
  for (let parent = element.parentElement; parent; parent = parent.parentElement) {
    const overflowY = globalThis.getComputedStyle(parent).overflowY;
    if (overflowY !== 'auto' && overflowY !== 'scroll') continue;
    const box = parent.getBoundingClientRect();
    top = Math.max(top, box.top);
    bottom = Math.min(bottom, box.bottom);
  }
  const visible = Math.max(0, bottom - top);
  // A block taller than the view only needs its top part showing.
  return visible >= Math.min(rect.height, globalThis.innerHeight * 0.5) * 0.9;
}

function resolveTargetElement(workspace, runtime, targetId) {
  if (!targetId) return null;
  const spinnerMedia = resolveSpinnerMediaTarget(targetId);
  if (spinnerMedia) return spinnerMedia;
  // Chat action cues name the logical action group (`chat.actions.finale`),
  // while the shared chat renders the concrete card as `${entry}.actions`.
  // Resolve that card before falling back to the dock shell: the shell has no
  // stable attention geometry and therefore cannot satisfy provider admission.
  if (targetId.startsWith('chat.actions.')) {
    const actionId = `${targetId.slice('chat.actions.'.length)}.actions`;
    const actionCard = document.querySelector(
      `[data-actions-id="${escapeAttributeSelectorValue(actionId)}"]`,
    );
    if (visibleElement(actionCard)) return actionCard;
    // Some authored final actions are persistent controls on the native Show
    // player rather than transcript cards. Use that stable host when the
    // logical card has not been emitted, instead of the outer dock shell.
    const showPlayer = resolveVisibleShowPlayer(workspace);
    if (visibleElement(showPlayer)) return showPlayer;
  }
  const direct = document.querySelector(`[data-tour-target="${escapeAttributeSelectorValue(targetId)}"]`);
  const directTarget = direct ? firstVisibleSibling(direct) : null;
  if (directTarget?.matches?.('video, audio')) return directTarget;
  if (visibleElement(directTarget)) return directTarget;
  const semanticTarget = resolveCvShowSemanticTarget(workspace, runtime, targetId, { document });
  if (semanticTarget) return semanticTarget;
  if (targetId === 'portfolio/header') return document.querySelector('body > header');
  if (targetId === 'portfolio/workspace') return workspace;
  if (targetId === 'portfolio/viewer') return runtime.viewer || workspace.querySelector('.portfolio-viewer');
  if (targetId === 'portfolio.show-stage' || targetId.startsWith('chat.')) {
    return resolveVisibleShowPlayer(workspace)
      || workspace.querySelector('agent-dock-shell');
  }
  if (targetId.startsWith('portfolio.map.')) {
    return resolvePortfolioMapTarget(workspace, targetId);
  }
  if (targetId.startsWith('project-card.')) {
    return findTreeRow(workspace, `projects/${targetId.slice('project-card.'.length)}`, runtime);
  }
  if (targetId.startsWith('profile.')) {
    const viewer = runtime.viewer || workspace.querySelector('.portfolio-viewer');
    if (targetId === 'profile.experience') {
      return findVisibleProfileExperience(viewer) || viewer;
    }
    if (targetId === 'profile.experience.15-plus') {
      return findVisibleProfileExperience(viewer, true) || viewer;
    }
    if (targetId === 'profile.contacts') {
      return viewer?.querySelector(
        'a[href*="linkedin.com"], a[href*="github.com"], a[href*="youtube.com"], a[href*="facebook.com"], a[href*="t.me/"]'
      ) || viewer;
    }
    return viewer;
  }
  if (runtime.entries.has(targetId)) {
    return findTreeRow(workspace, targetId, runtime) || runtime.viewer || workspace.querySelector('.portfolio-viewer');
  }
  return null;
}

function panelTypeForTarget(targetId, runtime, actionId = '') {
  if (String(actionId).endsWith('.map')) return 'portfolio-graph';
  if (targetId.startsWith('project-card.') || runtime.entries.has(targetId)) {
    return 'portfolio-tree';
  }
  if (targetId.startsWith('portfolio.map.')) return 'portfolio-graph';
  if (
    targetId.startsWith('article.')
    || targetId.startsWith('project-preview.')
    || targetId.startsWith('profile.')
    || targetId.startsWith('project-link.')
  ) {
    return 'portfolio-viewer';
  }
  return '';
}

function panelActionSurfaceForTarget(targetId) {
  const normalizedTargetId = String(targetId || '');
  return normalizedTargetId === 'portfolio.show-stage' || normalizedTargetId.startsWith('chat.')
    ? 'outer-dock'
    : 'main-workspace';
}

function resolvePanelActionTarget(workspace, runtime, action) {
  if (String(action?.id || '').endsWith('.map')) {
    const nodeId = escapeAttributeSelectorValue(action?.target || '');
    const panel = workspace.querySelector('portfolio-graph-panel');
    const node = panel?.querySelector(`graph-node[node-id="${nodeId}"]`);
    const canvas = panel?.querySelector('node-canvas, sn-canvas-graph');
    return visibleElement(node)
      || visibleElement(canvas)
      || visibleElement(panel)
      || node
      || canvas
      || panel;
  }
  return resolveTargetElement(workspace, runtime, action?.target);
}

function findPanelNode(node, panelType) {
  if (!node || !panelType) return null;
  if (node.type === 'panel' && node.panelType === panelType) return node;
  return findPanelNode(node.first, panelType) || findPanelNode(node.second, panelType);
}

function findPanelElement(layout, panelId, panelType = '') {
  const typedOwner = panelType
    ? layout?.querySelector?.(`${panelType}-panel`)?.closest?.('layout-node')
    : null;
  if (typedOwner) return typedOwner;
  const owner = layout?.querySelector?.(
    `[data-panel-id="${escapeAttributeSelectorValue(panelId)}"]`,
  )?.closest?.('layout-node');
  if (owner) return owner;
  return Array.from(layout?.querySelectorAll?.('layout-node') || [])
    .find((node) => node.dataset?.panelId === panelId || node.$?.nodeId === panelId)
    || null;
}

function setDesktopPanelCollapsed(layout, panelId, panelType, collapsed) {
  const panel = findPanelElement(layout, panelId, panelType);
  if (typeof panel?._setCollapsed === 'function') {
    panel._setCollapsed(collapsed);
    return;
  }
  layout?.dispatchEvent?.(new CustomEvent('panel-collapse-toggle', {
    bubbles: true,
    composed: true,
    detail: { panelId, collapsed },
  }));
}

function visibleElement(element) {
  if (!element?.isConnected) return null;
  const rect = element.getBoundingClientRect?.();
  const style = document.defaultView?.getComputedStyle?.(element);
  return rect?.width > 0
    && rect.height > 0
    && style?.display !== 'none'
    && style?.visibility !== 'hidden'
    ? element
    : null;
}

/**
 * Presents one real click on a visible media control (gallery toolbar
 * buttons) with the presenter cursor: travel → press → release. Returns a
 * distinct reason for every failure path, so callers never have to guess
 * why a click did not fire: 'quiet-restore' / 'control-absent' /
 * 'control-hidden' / 'cursor-absent' / 'aborted' / 'click-error' /
 * 'fired-false'. Quiet restores never present clicks.
 * @param {() => any} getCursor
 * @param {any} element
 * @param {{ signal?: AbortSignal, intent?: string }} [options]
 * @returns {Promise<{ presented: boolean, fired: boolean, reason: string }>}
 */
async function presentMediaControlClick(getCursor, element, { signal, intent } = {}) {
  const miss = (reason, extra = {}) => ({ presented: false, fired: false, reason, ...extra });
  if (signal?.aborted) return miss('aborted');
  if (isCvShowQuietRestoreActive()) return miss('quiet-restore');
  if (!element) return miss('control-absent');
  const target = visibleElement(element);
  if (!target) {
    // Diagnostics: rect and style visibility facts, not conjecture.
    let rect = null;
    try { rect = element.getBoundingClientRect?.(); } catch {}
    return miss('control-hidden', {
      rect: rect && { width: rect.width, height: rect.height },
      connected: element?.isConnected === true,
    });
  }
  await waitForShowVisualSettlement(target, {
    document,
    signal,
    inactivityMs: 150,
    timeoutMs: 600,
  }).catch(() => null);
  if (signal?.aborted) return miss('aborted');
  const cursor = getCursor();
  if (typeof cursor?.clickElement !== 'function') return miss('cursor-absent');
  const onAbort = () => cursor.clear?.({ reason: 'media-control-aborted' }) ?? undefined;
  signal?.addEventListener?.('abort', onAbort, { once: true });
  try {
    const receipt = await cursor.clickElement(target, {
      gestureId: `cv-show-media:${intent || 'control'}`,
    });
    if (signal?.aborted) return miss('aborted');
    return {
      presented: receipt?.fired === true,
      fired: receipt?.fired === true,
      reason: receipt?.fired === true ? 'ok' : 'fired-false',
    };
  } catch (error) {
    return miss(
      signal?.aborted || error?.name === 'AbortError' ? 'aborted' : 'click-error',
    );
  } finally {
    signal?.removeEventListener?.('abort', onAbort);
  }
}

/**
 * Finds the navigation tree view that renders portfolio entries. Only the
 * portfolio tree panel is considered: other trees on the page (if any) must
 * not receive tour gestures.
 */
function findPortfolioTreeView(workspace) {
  const panel = workspace.querySelector('sn-tree-panel.portfolio-tree');
  const scoped = panel?.querySelector?.('sn-tree-view');
  if (scoped) return scoped;
  return workspace.querySelector('sn-tree-panel sn-tree-view')
    || workspace.querySelector('sn-tree-view')
    || null;
}

/**
 * Expands every ancestor branch of the requested entry so its row renders.
 * Tree items carry their own id list; walking them is the only reliable way
 * because directory ids are localized display paths, not entry ids. The
 * expansion naturally persists with the tree (selection does as well) —
 * the gesture shows exactly the action a visitor would take.
 */
function expandTreeBranchTo(workspace, treeId) {
  const tree = findPortfolioTreeView(workspace);
  if (!tree || typeof tree !== 'object') return false;
  const items = Array.isArray(tree.items) ? tree.items : [];
  const chain = [];
  const visit = (nodes, ancestors) => {
    for (const item of nodes || []) {
      const id = String(item?.id || item?.path || '');
      if (id === treeId) {
        chain.push(...ancestors);
        return true;
      }
      if (Array.isArray(item?.children) && item.children.length > 0) {
        if (visit(item.children, [...ancestors, id])) return true;
      }
    }
    return false;
  };
  if (!visit(items, []) || chain.length === 0) return false;
  tree.expandedIds = [...new Set([...(tree.expandedIds || []), ...chain])];
  return true;
}

/**
 * Presents the authored navigation gesture: reveal/expansion already ran in
 * the action lifecycle; here the row is scrolled into the visible band, the
 * geometry settles, the presenter cursor travels to the row and performs the
 * single click at its own position. Returns true when the click was shown on
 * the real row; false means "no honest gesture target" — callers then fall
 * back to a silent programmatic selection instead of painting a click on a
 * wrong element (never at the article center).
 */
async function presentNavigationGesture(workspace, runtime, entryId, {
  cursor = null,
  signal = null,
} = {}) {
  if (signal?.aborted) return false;
  // Expanding only helps when the row was hidden by a collapsed branch; rows
  // already rendered stay untouched.
  const existing = visibleElement(findTreeRow(workspace, entryId, runtime));
  if (!existing) {
    let treeId = resolvePortfolioTreeHighlightId(entryId, [], runtime?.treeDirectorySelection);
    expandTreeBranchTo(workspace, treeId);
  }
  const ready = await waitForShowDomReadiness({
    document,
    target: () => visibleElement(findTreeRow(workspace, entryId, runtime)),
    signal,
    timeoutMs: 1_200,
    scroll: false,
  }).catch(() => null);
  const row = ready?.target;
  if (!row) return false;
  // The navigation tree scrolls like everything else: the claw pushes it when the row is off screen.
  await scrollCvShowSpaceIntoView(row, {
    document,
    signal,
    cursor,
    budgetMs: 1_800,
    durationMs: 260,
  }).catch(() => {});
  await waitForShowVisualSettlement(row, {
    document,
    signal,
    inactivityMs: 250,
    timeoutMs: 1_200,
  }).catch(() => null);
  if (signal?.aborted) return false;
  const settledRow = visibleElement(findTreeRow(workspace, entryId, runtime));
  if (!settledRow) return false;
  if (typeof cursor?.clickElement === 'function') {
    // Stop the in-flight travel/press the moment the tour is cancelled so a
    // stop or seek never leaves a pending real click behind.
    const onAbort = () => cursor.clear?.({ reason: 'nav-gesture-aborted' }) ?? undefined;
    signal?.addEventListener?.('abort', onAbort, { once: true });
    let receipt = null;
    try {
      receipt = await cursor.clickElement(settledRow, {
        gestureId: `cv-show-nav:${entryId}`,
      });
    } catch (error) {
      if (signal?.aborted || error?.name === 'AbortError') throw error;
      return false;
    } finally {
      signal?.removeEventListener?.('abort', onAbort);
    }
    if (signal?.aborted) {
      const abortError = signal.reason instanceof Error
        ? signal.reason
        : new Error('CV Show navigation gesture was aborted');
      abortError.name = 'AbortError';
      throw abortError;
    }
    // A settled click host may still report `fired: false` (no real dispatch
    // happened): that is "not presented", not success.
    return receipt?.fired === true;
  }
  return false;
}

/**
 * Opens a collapsed desktop panel the way a person would: the claw clicks its expand button. Resolves to
 * whether the panel is open afterwards; false lets the caller expand it programmatically instead.
 * @param {any} layout
 * @param {string} panelId
 * @param {string} panelType
 * @param {any} cursor presenter cursor
 * @param {AbortSignal} [signal]
 */
async function expandPanelWithClaw(layout, panelId, panelType, cursor, signal) {
  if (typeof cursor?.clickElement !== 'function' || isCvShowQuietRestoreActive()) return false;
  const node = findPanelElement(layout, panelId, panelType);
  const button = visibleElement(node?.querySelector?.('.collapse-btn'));
  if (!node || !button || !node.hasAttribute('collapsed')) return false;
  try {
    await cursor.clickElement(button, { gestureId: `cv-show-expand:${panelId}` });
  } catch (error) {
    if (signal?.aborted || error?.name === 'AbortError') throw error;
    return false;
  }
  const deadline = Date.now() + 700;
  while (node.hasAttribute('collapsed') && Date.now() < deadline) {
    await new Promise((resolve) => setTimeout(resolve, 40));
  }
  return !node.hasAttribute('collapsed');
}

function inspectTargetPanel(workspace, runtime, targetId, actionId = '') {
  const panelType = panelTypeForTarget(targetId, runtime, actionId);
  const surface = panelActionSurfaceForTarget(targetId);
  const layout = /** @type {any} */ (workspace.querySelector('.portfolio-layout'));
  const panel = findPanelNode(layout?.$.layoutTree, panelType);
  const panelComponent = panelType ? layout?.querySelector?.(`${panelType}-panel`) : null;
  const panelId = panel?.id || panelComponent?.dataset?.panelId || '';
  const agentDock = /** @type {any} */ (workspace.querySelector('agent-dock-shell'));
  const outerLayout = agentDock?.ref?.layout;
  const railMode = window.innerWidth <= PORTFOLIO_LAYOUT_RESPONSIVE_BREAKPOINT
    && Boolean(outerLayout?.hasAttribute?.('mobile-panel-rail-enabled'));
  const outerMobile = railMode || Boolean(outerLayout?.hasAttribute?.('drawer-mode-active'));
  const outerOpen = railMode || Boolean(agentDock?.hasAttribute?.('open'));
  if (!layout || !panelId) {
    return Object.freeze({
      targetId,
      surface,
      panelType,
      panelId: '',
      mobile: false,
      railMode,
      railRevealed: false,
      dock: '',
      open: true,
      outerMobile,
      outerOpen,
    });
  }
  // The layout's own projection stays the source of truth: a rail slide and a
  // drawer panel are both "responsive", while a wide desktop split is neither.
  const mobile = railMode || layout.hasAttribute('drawer-mode-active');
  // A `swipeControl: none` panel is hidden from the rail, so it is not revealed
  // by scrolling to it: it keeps the closed-panel policy and defers.
  const railExcluded = Boolean(railMode
    && findPanelElement(layout, panelId, panelType)?.hasAttribute?.('mobile-panel-rail-excluded'));
  const railRevealed = railMode && !railExcluded;
  const revealState = resolveCvShowPanelRevealState({
    mobile,
    mobileDock: railRevealed ? '' : panel?.behavior?.mobileDock,
    collapsed: railRevealed ? false : panel?.collapsed,
    drawerStartOpen: Boolean(layout.$.drawerStartOpen),
    drawerEndOpen: Boolean(layout.$.drawerEndOpen),
    activeStartPanelId: layout.$.drawerStartPanelId,
    activeEndPanelId: layout.$.drawerEndPanelId,
    panelId,
    visible: Boolean(visibleElement(panelComponent)),
  });
  return Object.freeze({
    targetId,
    surface,
    panelType,
    panelId,
    mobile,
    railMode,
    railRevealed,
    dock: revealState.dock,
    open: revealState.open,
    outerMobile,
    outerOpen,
  });
}

export function createPanelActionAdapter(workspace, runtime, { prepareMedia = null, getCursor = () => null } = {}) {
  const inspect = ({ action }) => inspectTargetPanel(workspace, runtime, action.target, action.id);
  const reveal = async ({ action, inspected, signal }) => {
    const layout = /** @type {any} */ (workspace.querySelector('.portfolio-layout'));
    const agentDock = /** @type {any} */ (workspace.querySelector('agent-dock-shell'));
    const railLayout = agentDock?.ref?.layout;
    const mapClosed = Boolean(
      inspected?.panelType === 'portfolio-graph'
      && inspected.panelId
      && !inspected.open,
    );
    if (mapClosed) {
      // The project map is autonomous: tour actions never force-open a hidden
      // map (and never pre-bind it behind the scenes). The hidden map stays
      // lazy; a map the user opens themselves is served by the normal visible
      // focus path below (awaitTransition/awaitTarget) without reveal.
      return {
        changed: false,
        mapDeferred: true,
        ...inspectTargetPanel(workspace, runtime, action.target, action.id),
      };
    }
    if (inspected?.railRevealed && inspected.panelId) {
      railLayout?.scrollToPanel?.(inspected.panelId, { layout });
      return {
        changed: false,
        railSelected: true,
        ...inspectTargetPanel(workspace, runtime, action.target, action.id),
      };
    }
    const innerChanged = Boolean(inspected?.panelId && !inspected.open);
    const outerShouldOpen = inspected?.surface === 'outer-dock';
    const outerChanged = Boolean(
      inspected?.outerMobile && inspected.outerOpen !== outerShouldOpen,
    );
    const outerOpened = outerChanged && outerShouldOpen;
    const outerClosed = outerChanged && !outerShouldOpen;
    if (innerChanged && inspected.mobile) {
      layout?.openDrawer?.(inspected.dock, inspected.panelId);
    } else if (innerChanged) {
      // A person clicks the collapsed panel open; the claw does the same, and only if that cannot be
      // done (no claw, quiet restore, no button) is the panel opened programmatically.
      const opened = await expandPanelWithClaw(layout, inspected.panelId, inspected.panelType, getCursor(), signal);
      if (!opened) setDesktopPanelCollapsed(layout, inspected.panelId, inspected.panelType, false);
    }
    // An authored navigation reveal opens (or keeps open) the start drawer:
    // cancel any stale deferred close so the reveal intent is never lost,
    // even when the panel was already open (innerChanged false).
    if (inspected?.mobile && inspected.dock === 'start' && inspected.panelType === 'portfolio-tree') {
      workspace.dispatchEvent(new CustomEvent('cv-show-start-drawer-opened', {
        bubbles: true,
        composed: true,
        detail: { panelId: inspected.panelId, source: 'reveal', opened: innerChanged },
      }));
    }
    if (outerOpened) agentDock?.open?.('show-action');
    else if (outerClosed) agentDock?.close?.('show-action');
    return {
      changed: innerChanged || outerChanged,
      innerChanged,
      outerChanged,
      outerOpened,
      outerClosed,
      ...inspectTargetPanel(workspace, runtime, action.target, action.id),
    };
  };
  const awaitTransition = async ({ action, inspected, signal }) => {
    if (!inspected?.panelId && !inspected?.outerMobile) return { ready: true, panelId: '' };
    // The nested panel and outer dock share the one mobile rail; the host
    // Layout API owns both selection and the snap position, so only the
    // deferred-hidden map may short-circuit this wait.
    const railReveal = inspected?.railRevealed && inspected.panelId;
    if (
      !railReveal
      && inspected?.panelType === 'portfolio-graph'
      && inspected.panelId
      && !inspected.open
    ) {
      // Hidden map: nothing was (or will be) revealed; do not poll for an
      // opening that is intentionally deferred to the user.
      return { ready: true, panelId: inspected.panelId };
    }
    const ready = await waitForShowDomReadiness({
      document,
      target: () => {
        const state = inspectTargetPanel(workspace, runtime, action.target, action.id);
        const layout = workspace.querySelector('.portfolio-layout');
        const outerReady = inspected.railMode
          || !inspected.outerMobile
          || state.outerOpen === (inspected.surface === 'outer-dock');
        if (!outerReady) return null;
        if (!inspected.panelId) {
          return inspected.surface === 'outer-dock'
            ? visibleElement(resolvePanelActionTarget(workspace, runtime, action))
            : visibleElement(workspace);
        }
        if (state.open && state.panelType === 'portfolio-graph') {
          // The user opened the map: escalate its lazy renderer (visible-only),
          // never bind it behind a hidden drawer.
          layout?.querySelector?.('portfolio-graph-panel')?.prepareShowTarget?.();
        }
        const target = visibleElement(resolvePanelActionTarget(workspace, runtime, action));
        if (target) return target;
        return state.open
          ? visibleElement(findPanelElement(layout, state.panelId, state.panelType))
          : null;
      },
      signal,
      timeoutMs: 2_500,
      scroll: false,
    });
    return { ready: true, panelId: inspected.panelId, target: ready.target };
  };
  const awaitTarget = async ({ action, context, signal }) => {
    const current = inspectTargetPanel(workspace, runtime, action.target, action.id);
    if (shouldDeferMapAction({
      panelType: current.panelType,
      open: current.open,
      actionId: action.id,
      target: action.target,
    })) {
      // The map stayed hidden: report the target as ready-by-deferral. The
      // lifecycle stores this bare null as the target (an object with a null
      // `target` field would be coalesced into the object itself), the act
      // phase satisfies map-deferred cues silently, and no drawer opens.
      return null;
    }
    // The final contact affordance is optional: persistent chat actions remain
    // available when the profile contact section is not mounted on this route.
    // Return a ready null target so the shared lifecycle reaches the product
    // skip branch instead of timing out during its target phase and retrying
    // the whole scene.
    if (String(action?.id || '').startsWith('finale.contacts')) {
      const contactTarget = visibleElement(resolvePanelActionTarget(workspace, runtime, action));
      if (!contactTarget) return { ready: true, panelId: current.panelId, target: null };
    }
    // The finale workspace focus is optional, but its attention cell still
    // uses the native provider contract. When the project card is absent,
    // focus the visible article/workspace surface as a stable fallback so the
    // provider can admit and settle the authored gesture without retrying.
    if (action?.id === 'finale.workspace') {
      return {
        ready: true,
        panelId: current.panelId,
        target: visibleElement(
          runtime.viewer
          || workspace.querySelector('.portfolio-viewer')
          || workspace,
        ),
      };
    }
    ensureCvShowArticleProject(runtime, action?.target);
    ensureCvShowMediaProject(runtime, action?.target);
    // Graph culling hides offscreen nodes. Focus the exact semantic node after
    // panel reveal/settlement and before requiring visible target geometry.
    focusPortfolioMapTarget(workspace, action?.target, {
      presentationBudgetMs: context?.presentationBudgetMs,
    });
    const ready = await waitForShowDomReadiness({
      document,
      target: () => {
        const target = shouldDeferCvShowNavigationTarget(action)
          ? visibleElement(runtime.viewer || workspace.querySelector('.portfolio-viewer'))
          : visibleElement(resolvePanelActionTarget(workspace, runtime, action));
        return isShowTargetReadyForAction(target, action) ? target : null;
      },
      signal,
      timeoutMs: 2_500,
      scroll: resolveCvShowActionTargetScroll(action, context),
    });
    if (
      action?.checkpointMode === 'restore-held'
      || shouldRestoreCvShowSetupAttentionTarget(action, context)
    ) {
      const visualSettlement = await restoreCvShowHeldAttentionTarget(ready.target, {
        document,
        signal,
      });
      return Object.freeze({ ...ready, visualSettlement });
    }
    if (
      context?.scrollOperation === true
      && action?.type === 'media'
      && String(action?.target || '').startsWith('media/')
      && typeof prepareMedia === 'function'
    ) {
      try {
        const preparation = prepareMedia(action.target, { signal });
        void Promise.resolve(preparation).catch(() => undefined);
      } catch {}
    }
    if (context?.scrollOperation === true && isPortfolioMapTarget(action?.target)) {
      const mapSettlement = await waitForPortfolioMapTargetVisualSettlement(
        workspace,
        action?.target,
        {
          document,
          signal,
          timeoutMs: signal ? 0 : 2_500,
        },
      );
      return Object.freeze({
        ...ready,
        target: mapSettlement.target,
        visualSettlement: mapSettlement.visualSettlement,
      });
    }
    if (context?.scrollOperation !== true || !ready.target?.scrollIntoView) return ready;
    const bypassScrollSettlement = shouldBypassCvShowScrollSettlement(
      context?.presentationBudgetMs,
    );
    const scrollDurationMs = bypassScrollSettlement
      ? 0
      : resolveCvShowScrollDuration(context?.presentationBudgetMs);
    // The hand pushes the page when the cell has room for it (the browser voice has no hard deadline, and
    // a bare gesture is unbounded); a short recorded cell keeps the plain animated scroll.
    const handBudgetMs = Number(context?.presentationBudgetMs) > 0 ? Number(context.presentationBudgetMs) : 2_200;
    const scrollMotion = (durationMs) => scrollCvShowSpaceIntoView(ready.target, {
      document,
      signal,
      cursor: bypassScrollSettlement ? null : getCursor(),
      budgetMs: handBudgetMs,
      durationMs,
    });
    if (bypassScrollSettlement) {
      await animateCvShowScrollIntoView(ready.target, {
        document,
        signal,
        durationMs: scrollDurationMs,
      });
      return Object.freeze({
        ...ready,
        visualSettlement: Object.freeze({
          status: 'settled',
          motion: 'instant',
          reason: 'hard-deadline-instant-scroll',
        }),
      });
    }
    // The authored scroll animation is bounded (`animateCvShowScrollIntoView`
    // caps its own duration), so late platform evidence must not eat the
    // authored hard deadline. Cap the stability wait by the remaining budget
    // and settle truthfully when only the evidence is late.
    const scrollBudgetMs = Number(context?.presentationBudgetMs) || 0;
    const settleInactivityMs = Number.isFinite(scrollBudgetMs) && scrollBudgetMs > 0
      ? Math.max(150, Math.min(2_500, scrollBudgetMs - 1_000))
      : 2_500;
    let visualSettlement;
    try {
      visualSettlement = await waitForShowVisualSettlement(ready.target, {
        document,
        signal,
        inactivityMs: settleInactivityMs,
        start: () => scrollMotion(scrollDurationMs),
      });
    } catch (evidenceError) {
      visualSettlement = Object.freeze({
        status: 'settled',
        motion: 'scroll',
        reason: 'budget-bound-evidence',
        evidenceError: String(evidenceError?.code || evidenceError?.message || evidenceError),
      });
    }
    return Object.freeze({ ...ready, visualSettlement });
  };
  const restore = ({ action, context, inspected, reveal: revealReceipt }) => {
    // Map-open retention used to keep the drawer open after `.map` actions.
    // The map is now autonomous: tour actions never reveal it (reveal returns
    // changed:false for a closed graph), so opened panels restore normally
    // and a user-opened map is never touched because nothing changed.
    if (context?.retainRevealedPanel === true) {
      return { changed: false, retainedOpen: true };
    }
    if (revealReceipt?.changed !== true || inspected?.open || !inspected?.panelId) {
      if (revealReceipt?.outerOpened) {
        workspace.querySelector('agent-dock-shell')?.close?.('show-action');
        return { changed: true, outerRestored: true };
      }
      if (revealReceipt?.outerClosed) {
        workspace.querySelector('agent-dock-shell')?.open?.('show-action');
        return { changed: true, outerRestored: true };
      }
      return { changed: false };
    }
    const layout = /** @type {any} */ (workspace.querySelector('.portfolio-layout'));
    const current = inspectTargetPanel(workspace, runtime, action.target, action.id);
    if (revealReceipt.innerChanged && current.mobile) layout?.closeDrawer?.(current.dock);
    else if (revealReceipt.innerChanged) {
      setDesktopPanelCollapsed(layout, inspected.panelId, inspected.panelType, true);
    }
    if (revealReceipt.outerOpened) {
      workspace.querySelector('agent-dock-shell')?.close?.('show-action');
    } else if (revealReceipt.outerClosed) {
      workspace.querySelector('agent-dock-shell')?.open?.('show-action');
    }
    return {
      changed: true,
      panelId: inspected.panelId,
      restoredOpen: false,
      outerRestored: revealReceipt.outerChanged === true,
    };
  };
  return Object.freeze({ inspect, reveal, awaitTransition, awaitTarget, restore });
}

export function installPortfolioTour({ workspace, runtime, title }) {
  const getDock = () => /** @type {any} */ (workspace.querySelector('agent-dock-shell'));
  const getChat = () => /** @type {any} */ (workspace.querySelector('portfolio-show-chat'));
  const audioArbiter = new ShowAudioArbiter();
  const routeRequests = createCvShowRouteRequestCoordinator();
  let routeWriteTimer = null;
  let lastRouteWriteAt = 0;
  // Show playback moves the address onto each section's own page so a shared
  // link previews that section. The page the viewer was standing on is remembered
  // only while the show holds the address, and the stop hands it back.
  let preShowPathname = '';
  let lastPlaybackEntryId = '';
  let lastRouteSemanticKey = '';
  let mobileShowPlacementRequested = false;
  let reconcileRouteWhenIdle = false;
  let stripRouteWhenIdle = false;
  let showLayoutObserver = null;
  let showLayoutPlayer = null;
  let showLayoutButton = null;
  let presenterRigButton = null;
  let soundButton = null;
  let musicButton = null;
  let subtitlesButton = null;

  const isMobileDock = () => (
    typeof window !== 'undefined' && window.innerWidth <= PORTFOLIO_LAYOUT_RESPONSIVE_BREAKPOINT
  ) || Boolean(getDock()?.querySelector?.('panel-layout[drawer-mode-active]'));

  const syncShowExpandButton = (player = null) => {
    const active = player
      || getDock()?.getChat?.()?.getShowPlayer?.()
      || getChat()?.getShowPlayer?.();
    const button = active?.querySelector?.('[data-cv-show-expand]');
    if (!button) return;
    button.hidden = active.parentElement?.classList?.contains('portfolio-show-static-region')
      || active.hasAttribute('panel-layout');
    active.setShowLayoutAction?.(false);
  };

  const clearMobileShowPlacement = () => {
    const chat = getDock()?.getChat?.();
    const player = chat?.getShowPlayer?.();
    // The settings menu only repeated the expand action, which has its own
    // header button here, so the menu stays hidden on every layout.
    player?.setShowSettings?.(false);
    player?.setShowClose?.(true);
    player?.setShowLayoutAction?.(false);
    player?.setResizable?.(false);
    player?.requestLayoutPlacement?.('inline');
    player?.removeAttribute?.('compact-caption');
    workspace._mobileShowActive = false;
    mobileShowPlacementRequested = false;
    workspace.classList.remove('portfolio-show-mobile-active');
    syncShowExpandButton(player);
  };

  const syncMobileShowPlacement = () => {
    const dock = getDock();
    const chat = dock?.getChat?.();
    const mobile = isMobileDock();
    if (!chat || !chat.getShowPlayer?.()) {
      if (!mobile) {
        clearMobileShowPlacement();
      }
      return;
    }
    if (!mobile) {
      clearMobileShowPlacement();
      return;
    }
    workspace._mobileShowActive = true;
    const player = chat.getShowPlayer();
    player.setResizable?.(false);
    player.setShowSettings?.(false);
    // Close stays visible in the native mobile Show panel: the player close
    // request flows through the library chat to the show controller, which
    // stops the show and restores the placement via clearMobileShowPlacement.
    player.setShowClose?.(true);
    player.setShowLayoutAction?.(false);
    // The mobile panel is a compact transport host: hide the caption block
    // there only; the desktop chat keeps its caption.
    player.setAttribute('compact-caption', '');
    workspace.classList.add('portfolio-show-mobile-active');
    syncShowExpandButton(player);
    let staticHost = dock.getStaticShowHost?.();
    if (staticHost) {
      dock.setStaticShowHost(staticHost);
      syncShowExpandButton(player);
      return;
    }
    if (player.parentElement?.classList?.contains('portfolio-show-static-region')
      || player.hasAttribute?.('panel-layout') || mobileShowPlacementRequested) return;
    mobileShowPlacementRequested = true;
    player.requestLayoutPlacement?.('panel');
  };

  const onShowLayoutChange = (event) => {
    syncShowExpandButton(event.detail?.player);
    if (event.detail?.placement === 'panel' || event.detail?.placement === 'inline') {
      mobileShowPlacementRequested = false;
    }
  };

  const closeStaleStartDrawer = () => {
    // A tour-driven material transition (new playback entry) must not leave
    // the navigation/start drawer over the viewer. The close is deferred to a
    // microtask, so it only runs while the tour is still active: if the show
    // is stopped/completed before the microtask executes, a manually opened
    // panel is never closed later. Authored cues reopen the drawer themselves.
    const layout = workspace.querySelector('.portfolio-layout');
    if (!shouldCloseStaleNavDrawer({
      layoutDrawerMode: Boolean(layout?.hasAttribute?.('drawer-mode-active')),
      drawerStartOpen: Boolean(layout?.hasAttribute?.('drawer-start-open')),
      dockOpen: Boolean(getDock()?.hasAttribute?.('open')),
      tourActive: running,
    })) return;
    layout?.closeDrawer?.('start');
  };

  const onSceneSound = () => { showSound.cue('scene'); showSound.nextSection(); };

  const onPlaybackEntryChange = (event) => {
    if (event.target !== getChat()) return;
    const state = event.detail?.state;
    if (!state?.entryId) return;
    if (state.entryId === lastPlaybackEntryId) return;
    lastPlaybackEntryId = state.entryId;
    staleNavDrawerCloser.schedule();
  };

  const cancelPendingRouteWrite = () => {
    if (routeWriteTimer) clearTimeout(routeWriteTimer);
    routeWriteTimer = null;
    lastRouteSemanticKey = '';
    reconcileRouteWhenIdle = false;
    stripRouteWhenIdle = false;
  };

  const routePolicy = () => {
    const view = cvShowRuntimeAuthority.getView();
    const story = view.story;
    return {
      story,
      timeline: createCvShowCompositionTimeline(story),
    };
  };

  const currentSceneEntryId = (requestedEntryId = '') => {
    const view = cvShowRuntimeAuthority.getView();
    const routeId = requestedEntryId || runtime.selectedId;
    const selectedEntry = runtime.entries.get(routeId);
    const ownerProjectId = (selectedEntry?.focusIds || [])
      .find((id) => String(id).startsWith('projects/')) || '';
    return resolveCvShowEntryForPortfolioRoute(view.story, routeId, { ownerProjectId })
      || view.story?.short?.[0]
      || '';
  };

  const replaceRouteUrl = (url) => {
    if (typeof history === 'undefined' || typeof location === 'undefined') return;
    if (url.href !== location.href) history.replaceState(history.state, '', url.href);
  };

  const sectionUrl = (state) => createCvShowSectionUrl(location.href, state, {
    ...routePolicy(),
    baseHref: document.baseURI,
  });

  const writeRouteState = (state, { push = false } = {}) => {
    if (typeof history === 'undefined' || typeof location === 'undefined' || !state?.mode) return;
    let url;
    try {
      url = sectionUrl(state);
    } catch {
      return;
    }
    if (url.pathname !== location.pathname && !preShowPathname) preShowPathname = location.pathname;
    if (url.href === location.href) return;
    history[push ? 'pushState' : 'replaceState'](history.state, '', url.href);
    lastRouteWriteAt = Date.now();
  };

  const stripRouteState = () => {
    if (typeof location === 'undefined') return;
    const url = stripCvShowRoute(location.href);
    if (preShowPathname && url.pathname !== preShowPathname) url.pathname = preShowPathname;
    preShowPathname = '';
    replaceRouteUrl(url);
  };
  const media = new ShowMediaController({
    audioArbiter,
    onEvent: (event) => {
      const chat = /** @type {any} */ (getChat());
      if (event.type === 'show:media-start' && event.mode === 'full-with-media-audio') {
        chat?.beginMediaPlayback?.({ skippable: event.skippable });
      }
      if (event.type === 'show:media-stop' && event.mode === 'full-with-media-audio') {
        chat?.endMediaPlayback?.();
      }
    },
  });
  const reportRuntimeError = (detail) => workspace.dispatchEvent(new CustomEvent(
    'portfolio-show-runtime-error',
    { bubbles: true, composed: true, detail },
  ));
  const runtimeCleanup = createCvShowRuntimeCleanup({
    media,
    audioArbiter,
    reportError: reportRuntimeError,
  });
  // One gate per show session: the transport pause and the effects it freezes
  // share the same "time is stopped" fact, so a gallery montage suspends on
  // its current frame instead of advancing or spending its frame hold.
  const showPauseGate = createCvShowPauseGate();
  const resolveShowMedia = createCvShowMediaTargetResolver({
    document,
    resolveTarget: (targetId) => resolveTargetElement(workspace, runtime, targetId),
    createImsTarget: (root) => createImsShowMediaTarget(root, {
      // Gallery controls are presented with the same presenter cursor as the
      // navigation row clicks; the click goes through the gallery's own
      // toolbar buttons so the audience sees one honest interaction per
      // frame instead of silent programmatic frame jumps.
      presentMediaControl: (element, options) => (
        presentMediaControlClick(() => presenter?.cursor, element, options)
      ),
      pauseGate: showPauseGate,
    }),
  });

  // The flying avatar with two claw arms is the default presenter; the single
  // hose from the player stays available with `?showRig=hose` (the header
  // toggle). Phones always keep the hose.
  const RIG_MASK_KEY = 'cvShowMask';
  const readRigMask = () => {
    const fromUrl = new URLSearchParams(globalThis.location?.search || '').get('showMask');
    if (fromUrl) return fromUrl;
    try { return globalThis.localStorage?.getItem(RIG_MASK_KEY) || undefined; } catch { return undefined; }
  };
  const saveRigMask = (name) => {
    try { globalThis.localStorage?.setItem(RIG_MASK_KEY, name); } catch { /* optional */ }
  };
  // Subtitles: the speech cloud of the presenter and the player's own caption.
  // Subtitles are on at every load (`?showSubtitles=0` turns them off for that load only);
  // the header switch changes them for the running show.
  let subtitlesOn = new URLSearchParams(globalThis.location?.search || '').get('showSubtitles') !== '0';
  const readSubtitles = () => subtitlesOn;
  const applySubtitles = (on) => {
    subtitlesOn = on;
    document.documentElement.dataset.cvShowSubtitles = on ? 'on' : 'off';
    presenter?.cursor.setSubtitles?.(on);
  };
  const isPresenterRigOn = () => (
    new URLSearchParams(globalThis.location?.search || '').get('showRig') !== 'hose'
  );
  // Techno bed and accent sounds; they play while the narration clock runs.
  const showSound = createCvShowSound({
    // The bed follows the show, not the narration clock: the clock stops for a
    // moment between sections, and the music must not drop out there.
    isPlaying: () => {
      const state = getChat()?.$;
      return state?.isRunning === true && state.isPaused !== true;
    },
  });
  const RIG_CUES = { 'start-event': 'arm-out', 'retire-arm': 'arm-in' };
  const presenterRigOptions = () => (
    isPresenterRigOn() && !isMobileDock()
      ? {
          avatarSrc: new URL('avatar/index.webp', document.baseURI).href,
          onTrace: (type, data) => {
            getShowLog()[type === 'state' ? 'debug' : 'info']('rig', type, data);
            if (RIG_CUES[type]) showSound.cue(RIG_CUES[type], { pan: data?.arm === 0 ? -0.6 : 0.6 });
          },
          // The mouth follows the narration clock, not the coarse caption highlight.
          speechClock: () => getChat()?.getSpeechClock?.() || null,
          // The face mask: `?showMask=astro|walle|bot`, else the one picked last
          // (a double click on the presenter tries the next face).
          mask: readRigMask(),
          // The cloud hides on pause and follows the subtitles switch.
          isPaused: () => getChat()?.$?.isPaused === true,
          subtitles: readSubtitles(),
        }
      : null
  );
  const setPresenterRigParam = (on) => {
    const url = new URL(location.href);
    if (on) url.searchParams.delete('showRig');
    else url.searchParams.set('showRig', 'hose');
    if (url.href !== location.href) history.replaceState(history.state, '', url.href);
  };

  const createPresenterSession = () => {
    const gestureSeed = globalThis.crypto?.randomUUID?.()
      || `${Date.now()}:${Math.random()}`;
    const cursor = createPresenterCursor(document, {
      presenterRig: presenterRigOptions(),
      resolveHoseAnchor: () => {
        const dock = getDock();
        const player = dock?.getChat?.()?.getShowPlayer?.()
          || getChat()?.getShowPlayer?.() || null;
        if (!player) return null;
        const host = player.parentElement;
        if (!isMobileDock() || !host?.classList?.contains('portfolio-show-static-region')) {
          return player;
        }
        let anchor = host.querySelector('.portfolio-show-hose-anchor');
        if (!anchor) {
          anchor = document.createElement('span');
          anchor.className = 'portfolio-show-hose-anchor';
          anchor.setAttribute('aria-hidden', 'true');
          host.append(anchor);
        }
        return anchor;
      },
    });
    // The newest overlay is this session's cursor (an older one may still be fading out).
    // The presenter is on stage from the moment the show session exists, paused or playing.
    requestAnimationFrame(() => cursor.present?.());
    showSound.watchOverlay([...document.querySelectorAll('.symbiote-presenter-cursor')].pop() || null);
    const attention = new ShowAttentionController({
      cursor,
      resolveTarget: (target) => target,
    });
    const runner = createCvShowDirectiveRunner({
      document,
      runtime,
      attention,
      media,
      resolveTarget: (targetId) => resolveTargetElement(workspace, runtime, targetId),
      resolveMedia: resolveShowMedia,
      resolveMarkerTarget: (target, directive) => (
        createCvShowTextMarkerTarget(target, directive)
      ),
      resolveText: getLocaleMessage,
      resolveSelectionQuote: (source, target) => resolveCvShowSelectionQuote(target, source),
      activateTarget: (target, directive) => activateCvShowTarget(target, directive).handled,
      /** @param {Record<string, any>} source @param {{ signal?: AbortSignal }} [options] */
      presentNavigationGesture: (source, { signal } = {}) => presentNavigationGesture(
        workspace,
        runtime,
        source?.target,
        { cursor, signal },
      ),
      isQuietRestore: isCvShowQuietRestoreActive,
      emit: (directive) => {
        showSound.directive(directive);
        getChat()?.emitShowDirective?.(directive);
      },
      actionAdapter: createPanelActionAdapter(workspace, runtime, {
        prepareMedia: (targetId, options) => (
          resolveShowMedia(targetId)?.prepareShowMedia?.(options)
        ),
        getCursor: () => cursor,
      }),
      reportRuntimeError,
      gestureSeed,
    });
    return { cursor, attention, runner };
  };

  let originTargetId = '';
  let running = false;
  const syncHeaderShowButton = (active = running || getChat()?.$?.isRunning === true) => {
    let button = /** @type {HTMLElement | null} */ (document.querySelector('.pulse-tour-button'));
    if (!button) return;
    button.hidden = false;
    let icon = button.querySelector('.material-symbols-outlined');
    let paused = active && getChat()?.$?.isPaused === true;
    if (icon) icon.textContent = active && !paused ? 'stop' : 'play_circle';
    let label = getLocaleMessage(paused ? 'tour.resume' : active ? 'tour.stop' : 'panel.tour');
    button.setAttribute('aria-label', label);
    button.setAttribute('title', label);
    button.toggleAttribute('data-show-active', active);
    button.toggleAttribute('data-show-paused', paused);
  };
  const staleNavDrawerCloser = createStaleNavDrawerCloser({
    isActive: () => running,
    onClose: closeStaleStartDrawer,
  });
  const staleNavDrawerBinder = bindStaleNavDrawerCloser(workspace, staleNavDrawerCloser);
  const activePresentationOperations = new Set();
  /** @type {ReturnType<typeof createPresenterSession> | null} */
  let presenter = null;

  const ensurePresenter = () => {
    presenter ||= createPresenterSession();
    return presenter;
  };

  const ensurePresenterLifecycle = () => {
    const session = ensurePresenter();
    originTargetId ||= runtime.selectedId;
    const chat = getChat();
    if (chat) chat.audioArbiter = audioArbiter;
    return session;
  };

  const clearDocumentSelection = () => document.getSelection?.()?.removeAllRanges();

  const scheduleDocumentSelectionClear = () => {
    clearDocumentSelection();
    queueMicrotask(clearDocumentSelection);
    requestAnimationFrame(() => {
      clearDocumentSelection();
      requestAnimationFrame(clearDocumentSelection);
    });
  };

  const pausePresenter = (event) => {
    if (event.target !== getChat()) return;
    showPauseGate.pause();
    presenter?.runner.pause();
    void presenter?.cursor.returnHome();
  };

  const onMobilePanelNavigation = (event) => {
    if (!(event.target instanceof Element)) return;
    if (!event.target.closest('.portfolio-mobile-navigation .mobile-panel-rail > button')) return;
    if (getChat()?.$?.isPaused === true) void presenter?.cursor.returnHome();
  };

  const resumePresenter = (event) => {
    if (event.target !== getChat()) return;
    presenter?.runner.resume();
    showPauseGate.resume();
  };

  const disposePresenter = () => {
    // A stopped show owns no paused time: reopen the gate so a later show in
    // the same page never starts against a suspension nothing will clear.
    showPauseGate.resume();
    if (!presenter) return;
    const session = presenter;
    presenter = null;
    session.runner.stop();
    session.attention.dispose();
    session.cursor.dispose();
    scheduleDocumentSelectionClear();
  };

  const ensureChat = () => {
    const configurePresentationProjection = (target) => {
      target?.setPresentationDirectiveFilter?.((directive) => {
        if (!isDeferredMapAction(directive)) return true;
        return inspectTargetPanel(workspace, runtime, directive.target, directive.id).open;
      });
      return target;
    };
    let chat = getChat();
    if (chat) return configurePresentationProjection(chat);
    let dock = getDock();
    if (!dock) return null;
    chat = document.createElement('portfolio-show-chat');
    chat.hidden = true;
    chat.agentDock = dock;
    chat.audioArbiter = audioArbiter;
    chat.setAttribute('aria-label', title);
    workspace.append(chat);
    return configurePresentationProjection(chat);
  };

  const restoreOrigin = (event) => {
    const naturalEnd = event?.type === 'portfolio-show-complete'
      && event.detail?.reason === 'natural-end';
    if (naturalEnd) {
      // Natural completion already moved the shared player to the first
      // paused segment. Keep that native placement mounted; tearing it down
      // here makes the route reconciler recreate the old terminal segment.
      cancelPendingRouteWrite();
      running = false;
      syncHeaderShowButton(false);
      disposePresenter();
      void runtimeCleanup.stopAndRelease('show-terminal', {
        operation: 'show-terminal-cleanup',
      });
      originTargetId = '';
      lastPlaybackEntryId = '';
      staleNavDrawerCloser?.cancel();
      scheduleDocumentSelectionClear();
      // The player has already moved to its first paused checkpoint. Persist
      // that checkpoint rather than the old finale URL so a reconciliation or
      // reload cannot re-enter the terminal segment.
      scheduleRouteStateWrite(event.detail?.routeState);
      return;
    }
    clearMobileShowPlacement();
    cancelPendingRouteWrite();
    const wasRunning = running;
    const wasPresenting = Boolean(presenter);
    const reason = event?.detail?.reason || '';
    const routeDriven = reason.startsWith('route-');
    running = false;
    syncHeaderShowButton(false);
    disposePresenter();
    void runtimeCleanup.stopAndRelease('show-terminal', {
      operation: 'show-terminal-cleanup',
    });
    if (
      !routeDriven
      && (wasRunning || wasPresenting)
      && originTargetId
      && runtime.entries.has(originTargetId)
    ) {
      runtime.select(originTargetId, { focus: true, updateUrl: false });
    }
    originTargetId = '';
    lastPlaybackEntryId = '';
    staleNavDrawerCloser?.cancel();
    scheduleDocumentSelectionClear();
    if (event?.type === 'portfolio-show-complete' && event.detail?.routeState?.mode) {
      // A completed route is terminal. Keeping mode/entry in the URL makes
      // the location reconciler start the tour again after the final scene.
      // Clear the route while leaving explicit resume/return actions alive in
      // the chat history for a deliberate re-entry.
      stripRouteState();
    } else if (routeDriven) {
      // A route-driven stop leaves the section address as the route: nothing
      // is handed back, and the next episode starts from the address it sees.
      preShowPathname = '';
    } else if (routeRequests.applying) {
      stripRouteWhenIdle = true;
    } else {
      stripRouteState();
    }
  };

  const ensureTourOpen = () => {
    let dock = getDock();
    let chat = ensureChat();
    // In mobile the show opens in the native bottom panel, not in the chat
    // drawer: keep the drawer closed so the panel is visible immediately
    // instead of flashing the drawer open and shut.
    if (isMobileDock()) dock?.close?.('tour-button');
    else dock?.open?.('tour-button');
    chat?.openShow?.();
    queueMicrotask(syncMobileShowPlacement);
    queueMicrotask(() => requestAnimationFrame(() => requestAnimationFrame(
      () => getChat()?.focusFirstControl?.(),
    )));
    return chat;
  };

  const scheduleRouteStateWrite = (state) => {
    if (!state?.mode) return;
    // Global composition time is the only written coordinate; entry/detail
    // ids never enter the URL. Throttling keeps refresh-light replaceState
    // writes at entry-boundary granularity instead of per-frame churn.
    const semanticKey = [
      state.mode,
      state.entryId || '',
      state.detailId || '',
      state.play ? '1' : '0',
      state.completed ? '1' : '0',
    ].join('|');
    const immediate = semanticKey !== lastRouteSemanticKey;
    lastRouteSemanticKey = semanticKey;
    if (routeWriteTimer) clearTimeout(routeWriteTimer);
    const write = () => {
      routeWriteTimer = null;
      writeRouteState(state);
    };
    if (immediate || Date.now() - lastRouteWriteAt >= 1_000) write();
    else routeWriteTimer = setTimeout(write, Math.max(0, 1_000 - (Date.now() - lastRouteWriteAt)));
  };

  const reconcilePendingRouteState = () => {
    if (routeRequests.applying) return;
    if (stripRouteWhenIdle) {
      stripRouteWhenIdle = false;
      reconcileRouteWhenIdle = false;
      stripRouteState();
      return;
    }
    if (!reconcileRouteWhenIdle) return;
    reconcileRouteWhenIdle = false;
    scheduleRouteStateWrite(getChat()?.routeSnapshot);
  };

  const applyRouteState = async (state) => {
    try {
      return await routeRequests.run(async () => {
        const chat = ensureTourOpen();
        if (!chat) return false;
        const applied = await chat.applyShowRoute?.(state) || false;
        if (chat.$?.isPaused === true) void presenter?.cursor.returnHome();
        return applied;
      });
    } finally {
      reconcilePendingRouteState();
    }
  };

  const applyLocationRoute = async ({ source = 'location' } = {}) => {
    if (typeof location === 'undefined') return false;
    const parsed = canonicalizeCvShowRoute(location.href, routePolicy());
    if (parsed.status === 'invalid') {
      routeRequests.cancel();
      replaceRouteUrl(parsed.url);
      return false;
    }
    if (parsed.status === 'absent') {
      const chat = getChat();
      if (chat?.routeSnapshot?.running) {
        return routeRequests.run(async () => {
          chat.stopShow?.({ reason: `route-${source}` });
          return false;
        });
      }
      routeRequests.cancel();
      return false;
    }
    // A completed route is terminal — do not re-apply it to avoid restarting the show.
    if (parsed.state?.completed === true) return false;
    if (parsed.changed) replaceRouteUrl(parsed.url);
    return applyRouteState(parsed.state);
  };

  const onOpen = (event) => {
    if (event.detail?.source === 'portfolio-header'
      && (running || getChat()?.$?.isRunning === true)) {
      if (getChat()?.$?.isPaused === true) {
        getDock()?.getChat?.()?.getShowPlayer?.()?.control('toggle');
        queueMicrotask(() => syncHeaderShowButton());
        return;
      }
      getChat()?.stopShow?.({ reason: 'header-stop' });
      syncHeaderShowButton(false);
      return;
    }
    // Ask the host shell to atomically clear every existing overlay before
    // projecting the shared Show player. The shell owns the concrete layout;
    // this semantic request keeps header activation independent of its shape.
    (getDock() || workspace).dispatchEvent(new CustomEvent('portfolio-show-overlay-coordinate', {
      bubbles: true,
      composed: true,
      detail: { action: 'prepare-show', source: event.detail?.source || 'show' },
    }));
    const requestedEntryId = String(event.detail?.entryId || '').trim();
    if (!requestedEntryId) {
      ensureTourOpen();
      return;
    }
    const entryId = currentSceneEntryId(requestedEntryId);
    if (!entryId) {
      ensureTourOpen();
      return;
    }
    // The header intends "start the scene for this project" — convert the
    // semantic entry intent into the canonical global coordinate once; the
    // URL keeps only showMode + showTime.
    const timeline = routePolicy().timeline;
    const state = {
      mode: 'short',
      timeMs: cvShowGlobalTimeOf(timeline, entryId, 0),
      play: true,
      // entryId stays in the in-memory state for the player; it never
      // reaches the URL (serializer ignores it).
      entryId,
    };
    // An explicit header activation supersedes any load-time route
    // reconciliation that may still be writing the paused canonical URL.
    cancelPendingRouteWrite();
    routeRequests.cancel();
    writeRouteState(state, { push: true });
    void applyRouteState(state);
  };

  const onPlayerCloseRequest = () => {
    routeRequests.cancel();
    cancelPendingRouteWrite();
    getChat()?.stopShow?.({ reason: 'player-close' });
  };

  const onSourceViewerAction = (event) => {
    if (event.detail?.action?.intent !== 'cv-show') return;
    onOpen({ detail: { entryId: event.detail.action.payload?.entryId || runtime.selectedId } });
  };

  const onRouteChange = (event) => {
    if (event.target !== getChat()) return;
    syncHeaderShowButton();
    if (routeRequests.applying) {
      reconcileRouteWhenIdle = true;
      return;
    }
    scheduleRouteStateWrite(event.detail?.state);
  };

  // The player asks for the address of the segment it is showing; this runtime
  // is the only owner of the Show URL scheme, so it answers and the player
  // decides what to do with the answer.
  const onSectionLinkRequest = (event) => {
    const state = getChat()?.routeSnapshot;
    if (!state?.mode) return;
    event.detail.url = sectionUrl(state).href;
  };

  const onDockResponsiveChange = () => {
    if (running) return;
    queueMicrotask(syncMobileShowPlacement);
  };

  const onShowPlayerMounted = () => {
    queueMicrotask(() => {
      syncMobileShowPlacement();
      const player = getDock()?.getChat?.()?.getShowPlayer?.() || getChat()?.getShowPlayer?.();
      const header = player?.querySelector?.('.chat-show-header');
      if (!player || !header) return;
      if (showLayoutPlayer !== player) {
        showLayoutObserver?.disconnect();
        showLayoutButton?.remove();
        presenterRigButton?.remove();
        soundButton?.remove();
        musicButton?.remove();
        header.querySelectorAll('[data-cv-show-volume]').forEach((panel) => panel.remove());
        subtitlesButton?.remove();
        showLayoutPlayer = player;
      }
      showLayoutButton = header.querySelector('[data-cv-show-expand]') || document.createElement('button');
      showLayoutButton.type = 'button';
      showLayoutButton.className = 'chat-show-header-action material-symbols-outlined';
      showLayoutButton.dataset.cvShowExpand = '';
      showLayoutButton.onclick = () => {
        player.requestLayoutPlacement?.('panel');
      };
      if (!showLayoutButton.isConnected) header.insertBefore(showLayoutButton,
        header.querySelector('[data-header-action="settings"]'));
      const syncButton = () => {
        const key = 'tour.expand';
        showLayoutButton.textContent = 'open_in_full';
        showLayoutButton.setAttribute('aria-label', getLocaleMessage(key));
        showLayoutButton.title = getLocaleMessage(key);
        syncShowExpandButton(player);
      };
      syncButton();
      showLayoutObserver?.disconnect();
      showLayoutObserver = new MutationObserver(syncButton);
      showLayoutObserver.observe(player, {
        attributes: true, attributeFilter: ['panel-layout'],
      });
      // Toggle between the hose from the player and the flying presenter.
      presenterRigButton = header.querySelector('[data-cv-show-rig]') || document.createElement('button');
      presenterRigButton.type = 'button';
      presenterRigButton.className = 'chat-show-header-action material-symbols-outlined';
      presenterRigButton.dataset.cvShowRig = '';
      presenterRigButton.textContent = 'smart_toy';
      presenterRigButton.hidden = isMobileDock();
      const rigLabel = getLocaleMessage('tour.rig');
      presenterRigButton.setAttribute('aria-label', rigLabel);
      presenterRigButton.title = rigLabel;
      presenterRigButton.setAttribute('aria-pressed', String(isPresenterRigOn()));
      presenterRigButton.onclick = () => {
        const next = !isPresenterRigOn();
        setPresenterRigParam(next);
        presenterRigButton.setAttribute('aria-pressed', String(next));
        presenter?.cursor.setPresenterRig?.(presenterRigOptions());
      };
      if (!presenterRigButton.isConnected) header.insertBefore(presenterRigButton,
        header.querySelector('[data-header-action="settings"]'));
      // Two switches, remembered: the techno bed (off by default) and the action sounds.
      const soundSwitch = (current, attr, key, icons, isOn, toggle) => {
        const button = current || header.querySelector(`[${attr}]`) || document.createElement('button');
        button.type = 'button';
        button.className = 'chat-show-header-action material-symbols-outlined';
        button.setAttribute(attr, '');
        const sync = () => {
          const label = getLocaleMessage(key);
          button.textContent = isOn() ? icons[0] : icons[1];
          button.setAttribute('aria-label', label);
          button.title = label;
          button.setAttribute('aria-pressed', String(isOn()));
        };
        button.onclick = () => { toggle(); sync(); };
        sync();
        if (!button.isConnected) header.insertBefore(button, header.querySelector('[data-header-action="settings"]'));
        return button;
      };
      // Hovering (or focusing) a sound switch slides a volume panel up over it, as wide as the button.
      const volumePanel = (button, key, labelKey, get, set) => {
        header.querySelector(`[data-cv-show-volume="${key}"]`)?.remove();
        const panel = document.createElement('div');
        panel.className = 'cv-show-volume';
        panel.dataset.cvShowVolume = key;
        const range = document.createElement('input');
        range.type = 'range';
        range.min = '0';
        range.max = '100';
        range.step = '1';
        range.className = 'cv-show-volume-range';
        range.setAttribute('aria-label', getLocaleMessage(labelKey));
        range.title = getLocaleMessage(labelKey);
        range.value = String(Math.round(get() * 100));
        range.addEventListener('input', () => set(Number(range.value) / 100));
        panel.append(range);
        header.append(panel);
        /** @type {any} */
        let hideTimer = 0;
        const place = () => {
          panel.style.left = `${button.offsetLeft}px`;
          panel.style.width = `${button.offsetWidth}px`;
        };
        const show = () => { clearTimeout(hideTimer); place(); range.value = String(Math.round(get() * 100)); panel.dataset.open = ''; };
        const hide = () => { clearTimeout(hideTimer); hideTimer = setTimeout(() => { delete panel.dataset.open; }, 220); };
        for (const element of [button, panel]) {
          element.addEventListener('pointerenter', show);
          element.addEventListener('pointerleave', hide);
          element.addEventListener('focusin', show);
          element.addEventListener('focusout', hide);
        }
        return panel;
      };
      // Music and effects sit side by side, each with its own volume.
      musicButton = soundSwitch(musicButton, 'data-cv-show-music', 'tour.music', ['music_note', 'music_off'],
        () => showSound.isMusic(), () => showSound.toggleMusic());
      soundButton = soundSwitch(soundButton, 'data-cv-show-sound', 'tour.sound', ['volume_up', 'volume_off'],
        () => showSound.isSounds(), () => showSound.toggleSounds());
      subtitlesButton = soundSwitch(subtitlesButton, 'data-cv-show-subtitle-toggle', 'tour.subtitles', ['subtitles', 'subtitles_off'],
        () => readSubtitles(), () => applySubtitles(!readSubtitles()));
      document.documentElement.dataset.cvShowSubtitles = readSubtitles() ? 'on' : 'off';
      volumePanel(musicButton, 'music', 'tour.musicVolume',
        () => showSound.getMusicVolume(), (value) => showSound.setMusicVolume(value));
      volumePanel(soundButton, 'sound', 'tour.soundVolume',
        () => showSound.getSoundsVolume(), (value) => showSound.setSoundsVolume(value));
    });
  };

  const onPopState = () => {
    cancelPendingRouteWrite();
    routeRequests.cancel();
    // Cancelling the coordinator only suppresses a stale result. The player
    // owns separate async media preparation, so invalidate that transport too
    // before applying the newer browser location.
    getChat()?.stopShow?.({ reason: 'route-popstate-replace' });
    queueMicrotask(() => { void applyLocationRoute({ source: 'popstate' }); });
  };

  const onStart = () => {
    // A real mobile start can originate from the chat itself. Close that
    // outer surface before presenter work begins so the first scene ink is
    // never painted beneath an already-open chat overlay. Manual reopening
    // remains available after the start.
    const dock = getDock();
    const outerLayout = dock?.ref?.layout;
    if (dock?.hasAttribute('open') && outerLayout?.hasAttribute('drawer-mode-active')) {
      dock.close?.('show-start');
    }
    running = true;
    syncHeaderShowButton(true);
    ensurePresenterLifecycle().cursor.present?.();
  };

  const onSeek = () => {
    if (!running && !presenter) return;
    ensurePresenterLifecycle().runner.seek();
  };

  const dispatchResult = (chat, requestId, result) => {
    if (!chat || result.status === 'cancelled') return;
    chat.dispatchEvent(new CustomEvent('portfolio-show-result', {
      detail: { requestId, ...result },
    }));
  };

  const onPhase = async (event) => {
    if (event.target !== getChat()) return;
    if (
      !running
      && event.detail?.restorePausedCheckpoint !== true
      && getChat()?.$.isRunning !== true
    ) return;
    const chat = getChat();
    const requestId = event.detail?.requestId;
    const complete = event.detail?.complete;
    if (typeof complete === 'function') event.detail.handled = true;
    const { runner } = ensurePresenterLifecycle();
    // A timed cue continues the phase its entry opened; only the opening event starts a new one.
    if (event.detail?.continuation !== true) runner.beginPhase();
    const directives = event.detail?.directives || [];
    if (event.detail?.aligned && !directives.length) {
      complete?.(Object.freeze({ status: 'success', receipts: Object.freeze([]) }));
      return;
    }
    try {
      // A timed cue of the browser voice carries its authored gesture slot like a recorded-show cell: the
      // presenter plans the whole gesture inside it (planned admission), so the claw starts where it rests.
      const budgetMs = Number(event.detail?.budgetMs) || 0;
      const isScroll = event.detail?.scroll === true;
      const slot = budgetMs > 0
        ? {
            kind: 'attention',
            budgetMs,
            requiresProviderAdmission: !isScroll,
            decorative: false,
            reportStatus() {},
            reportAdmission() {},
            reportMilestone() {},
            reportDegraded() {},
            acceptTerminal: (settlement) => settlement,
            providerFailure: (reason) => new Error(`cue provider failure: ${reason}`),
          }
        : null;
      // A gesture brings its own target into view: whatever the authored scroll cues did or did not do, a
      // frame, marker or selection is never drawn on something hidden or off screen. The scroll operation
      // runs the whole focus: it reveals what is collapsed (panel, branch, project) and then pushes the
      // page to the target.
      if (!isScroll && event.detail?.continuation === true) {
        const subject = directives[0];
        if (subject?.target && ['frame', 'marker', 'native-selection', 'activate'].includes(subject.type)) {
          const element = resolveTargetElement(workspace, runtime, subject.target);
          if (!element || !isElementInView(element)) {
            // A target that cannot be focused must not hold the gesture back: it presents on its own.
            await runner.scroll(subject).catch((error) => {
              if (error?.name === 'AbortError') throw error;
            });
          }
        }
      }
      const result = isScroll
        ? await runner.scroll(directives[0], slot ? { presentation: slot } : undefined)
        : await runner.run(directives, { continuePhase: true, ...(slot ? { presentation: slot } : {}) });
      if (getChat()?.$.isPaused === true) {
        void presenter?.cursor.returnHome();
      }
      dispatchResult(chat, requestId, result);
      complete?.(result);
    } catch (error) {
      if (error?.name === 'AbortError' || !chat) {
        complete?.(Object.freeze({ status: 'cancelled', receipts: Object.freeze([]) }));
        return;
      }
      const result = Object.freeze({
        requestId,
        status: 'required-missing',
        error: error?.message || String(error),
      });
      chat.dispatchEvent(new CustomEvent('portfolio-show-result', { detail: result }));
      complete?.(result);
    }
  };

  const onAlignedReset = (event) => {
    if (!running && !presenter) return;
    const reason = event.detail?.receipt?.reason || '';
    // Caption-clock initialization establishes a media-time baseline. Neither
    // its first sample nor the owned source-load restore replaces the
    // presentation generation that is executing the scene setup cell.
    if (
      reason === 'initial'
      || reason === 'alignment-ready'
      || reason === 'presentation-preroll-normalization'
    ) return;
    if (reason === 'paused-checkpoint') {
      void Promise.allSettled([...activePresentationOperations]).then(() => {
        requestAnimationFrame(() => {
          if (getChat()?.$?.isPaused === true) void presenter?.cursor.returnHome();
        });
      });
      return;
    }
    if (reason === 'branch-return') ensurePresenterLifecycle().runner.branchReturn();
    else if (reason.includes('seek')) ensurePresenterLifecycle().runner.seek();
    else ensurePresenterLifecycle().runner.beginPhase();
  };

  const onPresentationOperation = (event) => {
    if (event.target !== getChat()) return;
    if (
      !running
      && event.detail?.restorePausedCheckpoint !== true
      && getChat()?.$.isRunning !== true
    ) return;
    const complete = event.detail?.complete;
    const operation = event.detail?.operation;
    if (typeof complete !== 'function' || !operation) return;
    event.detail.handled = true;
    const pending = runCvShowPresentationOperation(
      ensurePresenterLifecycle().runner,
      operation,
    );
    activePresentationOperations.add(pending);
    void pending.then(
      (receipts) => complete(receipts),
      (error) => complete(null, error),
    ).finally(() => activePresentationOperations.delete(pending));
  };

  /**
   * A paused deep link, a reload or a seek can land inside a gallery montage.
   * The show asks for the frame it was reading, not for the sequence again: the
   * adapter restores the frame through the media API, with no control click and
   * no frame hold, and the audience's own state is left alone.
   *
   * The restore is not awaited by the show — it is pausing, and the gallery
   * mounts lazily — but a failed restore is reported, never swallowed: a
   * gallery left on the wrong frame is a visible defect the audience would
   * otherwise read as the show's own state.
   */
  const onMediaCheckpoint = (event) => {
    const target = resolveShowMedia(String(event.detail?.target || ''));
    if (!target) return;
    target.restoreShowMediaCheckpoint({ frame: event.detail?.frame }).catch((error) => {
      reportRuntimeError(Object.freeze({
        operation: 'ims-gallery-checkpoint',
        code: error?.code || 'ims-gallery-checkpoint-restore-failed',
        message: error?.message || String(error),
      }));
    });
  };

  const onBeforeAdvance = (event) => {
    const complete = event.detail?.complete;
    if (typeof complete !== 'function') return;
    event.detail.handled = true;
    void Promise.allSettled([...activePresentationOperations]).then(() => complete(
      Object.freeze({ status: 'completed' }),
    ));
  };

  const onDockChange = (event) => {
    if (['show-action', 'show-mobile-player'].includes(event.detail?.source)) return;
    if (event.detail?.open !== false) return;
    getChat()?.stopShow?.();
    disposePresenter();
    /** @type {HTMLElement | null} */ (document.querySelector('.pulse-tour-button'))?.focus();
  };

  const SOCIAL_HREFS = {
    'contact-github': 'https://github.com/MakerDrive',
    'contact-linkedin': 'https://www.linkedin.com/in/v-matiasevich/',
    'contact-youtube': 'https://www.youtube.com/@VladimirMatiasevich',
    'contact-facebook': 'https://www.facebook.com/v.matiasevich',
  };

  const openShowActionHref = (href) => {
    if (!href) return;
    globalThis.open?.(href, '_blank', 'noopener,noreferrer');
  };

  const onShowAction = (event) => {
    const targetByAction = {
      projects: 'projects/index',
      resume: 'profile/photo',
      contact: 'profile/photo',
      'contact-github': 'profile/photo',
      'contact-linkedin': 'profile/photo',
      'contact-youtube': 'profile/photo',
      'contact-facebook': 'profile/photo',
      'pdf-download': 'profile/photo',
    };
    const action = String(event.detail?.action || '');
    const targetId = targetByAction[action];
    if (!targetId || !runtime.entries.has(targetId)) return;
    if (SOCIAL_HREFS[action]) {
      openShowActionHref(SOCIAL_HREFS[action]);
      return;
    }
    if (action === 'pdf-download') {
      const locale = String(document.documentElement.lang || 'en').split(/[-_]/u)[0];
      const pdfLocale = ['en', 'ru', 'es'].includes(locale) ? locale : 'en';
      openShowActionHref(`downloads/vladimir-matiasevich-cv-${pdfLocale}.pdf`);
      return;
    }
    runtime.select(targetId, { focus: true, updateUrl: false });
    if (action === 'contact') {
      queueMicrotask(() => {
        const contact = resolveTargetElement(workspace, runtime, 'profile.contacts');
        contact?.focus?.();
        activateCvShowUserAction('contact', contact);
      });
    }
  };

  const onSkipMedia = () => {
    void runtimeCleanup.skip({ operation: 'media-skip' });
  };

  const interactionMonitor = monitorMeaningfulShowInteractions(document, {
    accept: (event) => !(typeof event.composedPath === 'function'
      ? event.composedPath()
      : [event.target]
    ).some((node) => node?.matches?.('chat-workspace, chat-show-player')),
    pause: () => {
      let chat = getChat();
      // A show that has not started yet has nothing to pause; pausing it here
      // would cancel the pending play intent of the click that opened it.
      if (!chat?.$?.isRunning || chat.$.isPaused) return;
      getChat()?.pauseShow?.('meaningful-interaction');
    },
  });

  const gestureClearPresentations = (reason) => {
    if (!presenter) return false;
    const attention = presenter.attention;
    if (!attention) return false;
    // Cancel any in-flight gesture animation first so a scheduled frame can
    // never repaint the dismissed stroke, then drop transient visuals and the
    // accumulated marker/annotation set. The cursor stays (pause policy) and
    // neither the narration nor the transport state is touched.
    attention.clearTransient?.(reason, { preserveInk: false, preserveCursor: true });
    attention.clearMarkers?.();
    return true;
  };

  const runGestureClearDecision = (input) => {
    const decision = resolveCvShowGestureClear(input);
    if (decision.clear) gestureClearPresentations(decision.reason);
    return decision;
  };

  const gestureEventPath = (event) => (
    typeof event.composedPath === 'function' ? event.composedPath() : [event.target]
  );
  let gestureDragStart = null;
  const onGesturePointerDown = (event) => {
    if (!presenter) return;
    const path = gestureEventPath(event);
    const inPlayer = pathMatchesSelector(path, 'chat-show-player');
    // Single source of affordance selectors lives in gestureClearPolicy.js.
    const affordance = pointerAffordanceFromPath(path);
    runGestureClearDecision({
      type: 'pointerdown',
      button: event.button,
      inPlayer,
      isPlayPause: inPlayer && pathMatchesSelector(
        path,
        '[data-control="play"], [data-control="toggle"], .chat-show-primary-control',
      ),
      isPlayerSettings: inPlayer && pathMatchesSelector(
        path,
        '[data-header-action="settings"], [data-show-menu-action]',
      ),
      ...affordance,
    });
    if (event.button !== 0 || inPlayer || pathMatchesSelector(path, 'chat-workspace')) {
      gestureDragStart = null;
      return;
    }
    gestureDragStart = { x: event.clientX, y: event.clientY, cleared: false };
  };
  const onGesturePointerMove = (event) => {
    if (!gestureDragStart || gestureDragStart.cleared || !presenter) return;
    const distance = Math.hypot(
      event.clientX - gestureDragStart.x,
      event.clientY - gestureDragStart.y,
    );
    if (distance < 24) return;
    gestureDragStart.cleared = true;
    runGestureClearDecision({ type: 'pointermove', button: 0, dragStarted: true });
  };
  const clearGestureDragStart = () => {
    gestureDragStart = null;
  };
  const onGestureWheel = (event) => {
    if (!presenter) return;
    const delta = Math.abs(Number(event.deltaY) || 0) + Math.abs(Number(event.deltaX) || 0);
    if (delta <= 0) return;
    runGestureClearDecision({ type: 'wheel', wheelDelta: delta });
  };
  const onGestureTextInput = (event) => {
    if (!presenter) return;
    const target = /** @type {any} */ (event.target);
    const isTextEntry = Boolean(
      target?.matches?.('input, textarea') || target?.isContentEditable,
    );
    if (isTextEntry) runGestureClearDecision({ type: 'input', isTextEntry });
  };
  const onGestureSeekKey = (event) => {
    if (!presenter) return;
    if (!pathMatchesSelector(gestureEventPath(event), 'chat-show-player')) return;
    runGestureClearDecision({
      type: 'keydown',
      isSeekKey: CV_SHOW_SEEK_KEYS.includes(event.key),
    });
  };
  document.addEventListener('pointerdown', onGesturePointerDown, { capture: true });
  document.addEventListener('pointermove', onGesturePointerMove, { capture: true });
  document.addEventListener('pointerup', clearGestureDragStart, { capture: true });
  document.addEventListener('pointercancel', clearGestureDragStart, { capture: true });
  document.addEventListener('wheel', onGestureWheel, { capture: true, passive: true });
  document.addEventListener('input', onGestureTextInput, { capture: true });
  document.addEventListener('keydown', onGestureSeekKey, { capture: true });

  document.addEventListener('portfolio-open-tour', onOpen);
  document.addEventListener('source-viewer-action', onSourceViewerAction);
  globalThis.addEventListener?.('popstate', onPopState);

  // Force-flush the shareable global coordinate at semantic boundaries.
  // Normal progress goes through the 1s-throttled writer; without this
  // flush a tab close between throttled writes restores a stale position,
  // which is worst exactly next to a branch/entry boundary.
  const flushRouteNow = () => {
    const snapshot = getChat()?.routeSnapshot;
    if (!snapshot?.mode || snapshot.running !== true) return;
    if (routeRequests.applying) return;
    cancelPendingRouteWrite();
    writeRouteState(snapshot);
  };
  const onVisibilityFlush = () => {
    if (document.visibilityState === 'hidden') flushRouteNow();
  };
  document.addEventListener('visibilitychange', onVisibilityFlush);
  globalThis.addEventListener?.('pagehide', flushRouteNow);

  workspace.addEventListener('portfolio-show-start', onStart);
  workspace.addEventListener('click', onMobilePanelNavigation, { capture: true });
  workspace.addEventListener('chat-show-close-request', onPlayerCloseRequest, { capture: true });
  const onHeaderPlaybackChange = () => queueMicrotask(() => syncHeaderShowButton());
  workspace.addEventListener('portfolio-show-pause', onHeaderPlaybackChange);
  workspace.addEventListener('portfolio-show-resume', onHeaderPlaybackChange);
  workspace.addEventListener('portfolio-show-player-mounted', onShowPlayerMounted);
  workspace.addEventListener('portfolio-show-seek', onSeek);
  workspace.addEventListener('portfolio-show-route-change', onRouteChange);
  workspace.addEventListener('portfolio-show-route-change', onPlaybackEntryChange);
  workspace.addEventListener('portfolio-show-section-link-request', onSectionLinkRequest);
  document.addEventListener('portfolio-show-pause', pausePresenter, { capture: true });
  document.addEventListener('portfolio-show-resume', resumePresenter, { capture: true });
  workspace.addEventListener('portfolio-show-phase', onPhase);
  workspace.addEventListener('portfolio-show-aligned-reset', onAlignedReset);
  workspace.addEventListener('portfolio-show-presentation-operation', onPresentationOperation);
  workspace.addEventListener('portfolio-show-media-checkpoint', onMediaCheckpoint);
  workspace.addEventListener('portfolio-show-before-advance', onBeforeAdvance);
  workspace.addEventListener('portfolio-show-stop', restoreOrigin);
  workspace.addEventListener('portfolio-show-complete', restoreOrigin);
  workspace.addEventListener('portfolio-show-action', onShowAction);
  workspace.addEventListener('portfolio-show-skip-media', onSkipMedia);
  getDock()?.addEventListener('agent-dock-change', onDockChange);
  getDock()?.addEventListener('agent-dock-responsive-change', onDockResponsiveChange);
  getDock()?.addEventListener('agent-show-layout-change', onShowLayoutChange);
  syncHeaderShowButton();
  queueMicrotask(() => { void applyLocationRoute({ source: 'load' }); });

  return () => {
    document.removeEventListener('portfolio-open-tour', onOpen);
    document.removeEventListener('source-viewer-action', onSourceViewerAction);
    globalThis.removeEventListener?.('popstate', onPopState);
    document.removeEventListener('visibilitychange', onVisibilityFlush);
    globalThis.removeEventListener?.('pagehide', flushRouteNow);
    workspace.removeEventListener('portfolio-show-start', onStart);
    workspace.removeEventListener('click', onMobilePanelNavigation, { capture: true });
    workspace.removeEventListener('chat-show-close-request', onPlayerCloseRequest, { capture: true });
    workspace.removeEventListener('portfolio-show-pause', onHeaderPlaybackChange);
    workspace.removeEventListener('portfolio-show-resume', onHeaderPlaybackChange);
    workspace.removeEventListener('portfolio-show-player-mounted', onShowPlayerMounted);
    showLayoutObserver?.disconnect();
    showLayoutButton?.remove();
    presenterRigButton?.remove();
    soundButton?.remove();
    musicButton?.remove();
    document.querySelectorAll('[data-cv-show-volume]').forEach((panel) => panel.remove());
    subtitlesButton?.remove();
    showSound.dispose();
    workspace.removeEventListener('portfolio-show-seek', onSeek);
    workspace.removeEventListener('portfolio-show-route-change', onRouteChange);
    workspace.removeEventListener('portfolio-show-route-change', onPlaybackEntryChange);
    workspace.removeEventListener('portfolio-show-route-change', onSceneSound);
    workspace.removeEventListener('portfolio-show-section-link-request', onSectionLinkRequest);
    document.removeEventListener('portfolio-show-pause', pausePresenter, { capture: true });
    document.removeEventListener('portfolio-show-resume', resumePresenter, { capture: true });
    workspace.removeEventListener('portfolio-show-phase', onPhase);
    workspace.removeEventListener('portfolio-show-aligned-reset', onAlignedReset);
    workspace.removeEventListener('portfolio-show-presentation-operation', onPresentationOperation);
    workspace.removeEventListener('portfolio-show-media-checkpoint', onMediaCheckpoint);
    workspace.removeEventListener('portfolio-show-before-advance', onBeforeAdvance);
    workspace.removeEventListener('portfolio-show-stop', restoreOrigin);
    workspace.removeEventListener('portfolio-show-complete', restoreOrigin);
    workspace.removeEventListener('portfolio-show-action', onShowAction);
    workspace.removeEventListener('portfolio-show-skip-media', onSkipMedia);
    getDock()?.removeEventListener('agent-dock-change', onDockChange);
    getDock()?.removeEventListener('agent-dock-responsive-change', onDockResponsiveChange);
    getDock()?.removeEventListener('agent-show-layout-change', onShowLayoutChange);
    interactionMonitor.dispose();
    document.removeEventListener('pointerdown', onGesturePointerDown, { capture: true });
    document.removeEventListener('pointermove', onGesturePointerMove, { capture: true });
    document.removeEventListener('pointerup', clearGestureDragStart, { capture: true });
    document.removeEventListener('pointercancel', clearGestureDragStart, { capture: true });
    document.removeEventListener('wheel', onGestureWheel, { capture: true });
    document.removeEventListener('input', onGestureTextInput, { capture: true });
    document.removeEventListener('keydown', onGestureSeekKey, { capture: true });
    cancelPendingRouteWrite();
    staleNavDrawerBinder?.dispose?.();
    staleNavDrawerCloser?.cancel();
    routeRequests.cancel();
    getChat()?.stopShow?.();
    disposePresenter();
    void runtimeCleanup.stopAndRelease('tour-disposed', {
      operation: 'tour-disposed-cleanup',
    });
  };
}
