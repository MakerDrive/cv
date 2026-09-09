import '../../../ui-components/client-only/tour-player/tour-player.js';
import { createPresenterCursor } from 'symbiote-ui/chat/presenter-cursor.js';
import {
  ShowAttentionController,
  ShowAudioArbiter,
  ShowMediaController,
  monitorMeaningfulShowInteractions,
  waitForShowDomReadiness,
  waitForShowVisualSettlement,
} from 'symbiote-ui/chat/show-runtime';
import { TOUR_LOCALE_MESSAGES } from '../../data/tourTranslations.js';
import { activateCvShowTarget, activateCvShowUserAction } from './activation.js';
import { getCvShowRuntimeAuthority } from './cvShowRuntimeAuthority.js';
import {
  createCvShowDirectiveRunner,
  createCvShowRuntimeCleanup,
  isDeferredMapAction,
  runCvShowPresentationOperation,
} from './showAdapter.js';
import { createCvShowPlaybackEntries } from './presentationContext.js';
import {
  canonicalizeCvShowRoute,
  createCvShowRouteRequestCoordinator,
  resolveCvShowEntryForPortfolioRoute,
  serializeCvShowRoute,
  stripCvShowRoute,
} from './routing.js';
import {
  animateCvShowScrollIntoView,
  createCvShowTextMarkerTarget,
  ensureCvShowArticleProject,
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
import { createYouTubeNoCookieEmbedUrl } from './youtubeEmbedUrl.js';

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
  let rows = Array.from(workspace.querySelectorAll('.sn-tree-row'));
  let exact = rows.find((row) => row.dataset.treeId === entryId);
  if (exact) return exact;
  let label = runtime?.entries?.get?.(entryId)?.label;
  return label
    ? rows.find((row) => row.textContent?.includes(label)) || null
    : null;
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

function resolveTargetElement(workspace, runtime, targetId) {
  if (!targetId) return null;
  const spinnerMedia = resolveSpinnerMediaTarget(targetId);
  if (spinnerMedia) return spinnerMedia;
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
    return workspace.querySelector('agent-dock-shell chat-show-player')
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
      return viewer?.querySelector('a[href*="linkedin.com"], a[href*="t.me/"]') || viewer;
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

function inspectTargetPanel(workspace, runtime, targetId, actionId = '') {
  const panelType = panelTypeForTarget(targetId, runtime, actionId);
  const surface = panelActionSurfaceForTarget(targetId);
  const layout = /** @type {any} */ (workspace.querySelector('.portfolio-layout'));
  const panel = findPanelNode(layout?.$.layoutTree, panelType);
  const panelComponent = panelType ? layout?.querySelector?.(`${panelType}-panel`) : null;
  const panelId = panel?.id || panelComponent?.dataset?.panelId || '';
  const agentDock = /** @type {any} */ (workspace.querySelector('agent-dock-shell'));
  const outerMobile = Boolean(agentDock?.ref?.layout?.hasAttribute?.('drawer-mode-active'));
  const outerOpen = Boolean(agentDock?.hasAttribute?.('open'));
  if (!layout || !panelId) {
    return Object.freeze({
      targetId,
      surface,
      panelType,
      panelId: '',
      mobile: false,
      dock: '',
      open: true,
      outerMobile,
      outerOpen,
    });
  }
  const mobile = layout.hasAttribute('drawer-mode-active');
  const revealState = resolveCvShowPanelRevealState({
    mobile,
    mobileDock: panel?.behavior?.mobileDock,
    collapsed: panel?.collapsed,
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
    dock: revealState.dock,
    open: revealState.open,
    outerMobile,
    outerOpen,
  });
}

export function createPanelActionAdapter(workspace, runtime, { prepareMedia = null } = {}) {
  const inspect = ({ action }) => inspectTargetPanel(workspace, runtime, action.target, action.id);
  const reveal = ({ action, inspected }) => {
    const layout = /** @type {any} */ (workspace.querySelector('.portfolio-layout'));
    const agentDock = /** @type {any} */ (workspace.querySelector('agent-dock-shell'));
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
      setDesktopPanelCollapsed(layout, inspected.panelId, inspected.panelType, false);
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
    if (
      inspected?.panelType === 'portfolio-graph'
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
        const outerReady = !inspected.outerMobile
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
    if (action?.id === 'finale.contacts') {
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
      { action },
    );
    const scrollDurationMs = bypassScrollSettlement
      ? 0
      : resolveCvShowScrollDuration(context?.presentationBudgetMs);
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
    const visualSettlement = await waitForShowVisualSettlement(ready.target, {
      document,
      signal,
      inactivityMs: 2_500,
      start: () => animateCvShowScrollIntoView(ready.target, {
        document,
        signal,
        durationMs: scrollDurationMs,
      }),
    });
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
  let lastPlaybackEntryId = '';
  let lastRouteSemanticKey = '';
  let reconcileRouteWhenIdle = false;
  let stripRouteWhenIdle = false;

  const isMobileDock = () => Boolean(getDock()?.querySelector?.('panel-layout[drawer-mode-active]'));

  const clearMobileShowPlacement = () => {
    const chat = getDock()?.getChat?.();
    const player = chat?.getShowPlayer?.();
    player?.setShowSettings?.(true);
    player?.setShowClose?.(true);
    player?.setShowLayoutAction?.(true);
    player?.setResizable?.(false);
    player?.requestLayoutPlacement?.('inline');
    player?.removeAttribute?.('compact-caption');
    workspace._mobileShowActive = false;
    workspace.classList.remove('portfolio-show-mobile-active');
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
    // The dock honors show-panel-mobile by opening the native Show panel in
    // drawer mode; the chat drawer stays closed so the panel is visible
    // immediately on launch. Order matters: closing first lets the layout
    // collapse-toggle settle on the chat drawer, so it never slams the
    // just-opened Show drawer shut (both share the end dock).
    dock?.close?.('show-mobile-player');
    player.requestLayoutPlacement?.('panel');
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
    const detailParents = Object.fromEntries(
      Object.values(story?.branches || {}).map((branch) => [branch.id, branch.sceneId]),
    );
    return {
      entryIdsByMode: {
        short: new Set(createCvShowPlaybackEntries(story, 'short').map(({ id }) => id)),
        full: new Set(createCvShowPlaybackEntries(story, 'full').map(({ id }) => id)),
      },
      detailParents,
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

  const writeRouteState = (state, { push = false } = {}) => {
    if (typeof history === 'undefined' || typeof location === 'undefined' || !state?.mode) return;
    let url;
    try {
      url = serializeCvShowRoute(location.href, state, routePolicy());
    } catch {
      return;
    }
    if (url.href === location.href) return;
    history[push ? 'pushState' : 'replaceState'](history.state, '', url.href);
    lastRouteWriteAt = Date.now();
  };

  const stripRouteState = () => {
    if (typeof location === 'undefined') return;
    replaceRouteUrl(stripCvShowRoute(location.href));
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
  const resolveShowMedia = createCvShowMediaTargetResolver({
    document,
    resolveTarget: (targetId) => resolveTargetElement(workspace, runtime, targetId),
  });

  const createPresenterSession = () => {
    const gestureSeed = globalThis.crypto?.randomUUID?.()
      || `${Date.now()}:${Math.random()}`;
    const cursor = createPresenterCursor();
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
      emit: (directive) => getChat()?.emitShowDirective?.(directive),
      actionAdapter: createPanelActionAdapter(workspace, runtime, {
        prepareMedia: (targetId, options) => (
          resolveShowMedia(targetId)?.prepareShowMedia?.(options)
        ),
      }),
      reportRuntimeError,
      gestureSeed,
    });
    return { cursor, attention, runner };
  };

  let originTargetId = '';
  let running = false;
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
    presenter?.runner.pause();
  };

  const resumePresenter = (event) => {
    if (event.target !== getChat()) return;
    presenter?.runner.resume();
  };

  const disposePresenter = () => {
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
    clearMobileShowPlacement();
    cancelPendingRouteWrite();
    const wasRunning = running;
    const wasPresenting = Boolean(presenter);
    const reason = event?.detail?.reason || '';
    const routeDriven = reason.startsWith('route-');
    running = false;
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
    } else if (!routeDriven) {
      if (routeRequests.applying) stripRouteWhenIdle = true;
      else stripRouteState();
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
    if (!state?.mode || !state.entryId) return;
    const semanticKey = [state.mode, state.entryId, state.detailId, state.play ? '1' : '0'].join('|');
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
        return await chat.applyShowRoute?.(state) || false;
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
    if (parsed.changed) replaceRouteUrl(parsed.url);
    return applyRouteState(parsed.state);
  };

  const onOpen = (event) => {
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
    const state = { mode: 'short', entryId, detailId: '', timeMs: 0, play: true };
    writeRouteState(state, { push: true });
    void applyRouteState(state);
  };

  const onSourceViewerAction = (event) => {
    if (event.detail?.action?.intent !== 'cv-show') return;
    onOpen({ detail: { entryId: event.detail.action.payload?.entryId || runtime.selectedId } });
  };

  const onRouteChange = (event) => {
    if (event.target !== getChat()) return;
    if (routeRequests.applying) {
      reconcileRouteWhenIdle = true;
      return;
    }
    scheduleRouteStateWrite(event.detail?.state);
  };

  const onDockResponsiveChange = () => {
    queueMicrotask(syncMobileShowPlacement);
  };

  const onShowPlayerMounted = () => {
    queueMicrotask(syncMobileShowPlacement);
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
    ensurePresenterLifecycle();
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
    runner.beginPhase();
    const directives = event.detail?.directives || [];
    if (event.detail?.aligned && !directives.length) {
      complete?.(Object.freeze({ status: 'success', receipts: Object.freeze([]) }));
      return;
    }
    try {
      const result = await runner.run(directives, { continuePhase: true });
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
      || reason === 'paused-checkpoint'
      || reason === 'presentation-preroll-normalization'
    ) return;
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

  const onShowAction = (event) => {
    const targetByAction = {
      projects: 'projects/index',
      resume: 'profile/photo',
      contact: 'profile/photo',
    };
    const targetId = targetByAction[event.detail?.action];
    if (!targetId || !runtime.entries.has(targetId)) return;
    runtime.select(targetId, { focus: true, updateUrl: false });
    if (event.detail?.action === 'contact') {
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
  workspace.addEventListener('portfolio-show-start', onStart);
  workspace.addEventListener('portfolio-show-player-mounted', onShowPlayerMounted);
  workspace.addEventListener('portfolio-show-seek', onSeek);
  workspace.addEventListener('portfolio-show-route-change', onRouteChange);
  workspace.addEventListener('portfolio-show-route-change', onPlaybackEntryChange);
  document.addEventListener('portfolio-show-pause', pausePresenter, { capture: true });
  document.addEventListener('portfolio-show-resume', resumePresenter, { capture: true });
  workspace.addEventListener('portfolio-show-phase', onPhase);
  workspace.addEventListener('portfolio-show-aligned-reset', onAlignedReset);
  workspace.addEventListener('portfolio-show-presentation-operation', onPresentationOperation);
  workspace.addEventListener('portfolio-show-before-advance', onBeforeAdvance);
  workspace.addEventListener('portfolio-show-stop', restoreOrigin);
  workspace.addEventListener('portfolio-show-complete', restoreOrigin);
  workspace.addEventListener('portfolio-show-action', onShowAction);
  workspace.addEventListener('portfolio-show-skip-media', onSkipMedia);
  getDock()?.addEventListener('agent-dock-change', onDockChange);
  getDock()?.addEventListener('agent-dock-responsive-change', onDockResponsiveChange);
  const drawerLevelRailSelector = 'layout-node[drawer-rail][drawer-rail-collapsed][data-drawer-dock="end"]';
  const drawerLevelPrimarySelector = 'layout-node[mobile-dock="primary"]';
  /** @type {ReturnType<typeof setTimeout> | number} */
  let drawerLevelTimer = 0;
  let innerDrawerObserver = null;
  let outerDrawerObserver = null;
  const clearDrawerLevelInline = () => {
    const outerLayout = getDock()?.ref?.layout;
    if (!outerLayout) return;
    outerLayout.querySelectorAll('layout-node[drawer-rail][data-drawer-dock="end"]')
      .forEach((node) => {
        node.style.removeProperty('visibility');
        node.style.removeProperty('pointer-events');
      });
    outerLayout.querySelector(drawerLevelPrimarySelector)
      ?.style.removeProperty('inset-inline-end');
  };
  const applyDrawerLevelSuppression = () => {
    const dock = getDock();
    const outerLayout = dock?.ref?.layout;
    const inner = workspace.querySelector('.portfolio-layout');
    if (!dock || !outerLayout || !inner || !workspace.isConnected) {
      clearDrawerLevelInline();
      return;
    }
    const mobile = Boolean(outerLayout.hasAttribute('drawer-mode-active'));
    const innerEndOpen = inner.hasAttribute('drawer-end-open');
    const chatOpen = dock.hasAttribute('open');
    const suppress = mobile && innerEndOpen && !chatOpen;
    if (!suppress) {
      clearDrawerLevelInline();
      return;
    }
    const rail = outerLayout.querySelector(drawerLevelRailSelector);
    const primary = outerLayout.querySelector(drawerLevelPrimarySelector);
    // Hide the rail visually and make it inert. Do not toggle `display`:
    // the provider projection writes its own inline display rules when a
    // drawer closes, so display:none can stay stuck; visibility/pointer
    // events are untouched by the projection and always restore.
    if (rail) {
      rail.style.setProperty('visibility', 'hidden', 'important');
      rail.style.setProperty('pointer-events', 'none', 'important');
    }
    if (primary) primary.style.setProperty('inset-inline-end', '0px', 'important');
  };
  const syncDrawerLevel = () => {
    applyDrawerLevelSuppression();
    if (drawerLevelTimer) return;
    // The drawer projection settles over a few frames after the attribute
    // change; re-apply on a short schedule so the chat rail reliably returns.
    const reapply = [0, 120, 320].map((delay) => setTimeout(() => {
      if (!drawerLevelTimer) return;
      applyDrawerLevelSuppression();
    }, delay));
    drawerLevelTimer = setTimeout(() => {
      drawerLevelTimer = 0;
      for (const t of reapply) clearTimeout(t);
      applyDrawerLevelSuppression();
    }, 420);
  };
  const onDrawerLevelChange = () => {
    queueMicrotask(syncDrawerLevel);
  };
  if (typeof MutationObserver === 'function') {
    const innerLayout = workspace.querySelector('.portfolio-layout');
    if (innerLayout) {
      innerDrawerObserver = new MutationObserver(onDrawerLevelChange);
      innerDrawerObserver.observe(innerLayout, {
        attributes: true,
        attributeFilter: ['drawer-end-open', 'drawer-mode-active'],
      });
    }
    const outerLayout = getDock()?.ref?.layout;
    if (outerLayout) {
      outerDrawerObserver = new MutationObserver(onDrawerLevelChange);
      outerDrawerObserver.observe(outerLayout, {
        attributes: true,
        attributeFilter: ['drawer-end-open', 'drawer-end-rail', 'drawer-mode-active'],
      });
    }
  }
  getDock()?.addEventListener('agent-dock-change', onDrawerLevelChange);
  getDock()?.addEventListener('agent-dock-responsive-change', onDrawerLevelChange);
  queueMicrotask(syncDrawerLevel);  queueMicrotask(() => { void applyLocationRoute({ source: 'load' }); });

  return () => {
    document.removeEventListener('portfolio-open-tour', onOpen);
    document.removeEventListener('source-viewer-action', onSourceViewerAction);
    globalThis.removeEventListener?.('popstate', onPopState);
    workspace.removeEventListener('portfolio-show-start', onStart);
    workspace.removeEventListener('portfolio-show-player-mounted', onShowPlayerMounted);
    workspace.removeEventListener('portfolio-show-seek', onSeek);
    workspace.removeEventListener('portfolio-show-route-change', onRouteChange);
    workspace.removeEventListener('portfolio-show-route-change', onPlaybackEntryChange);
    document.removeEventListener('portfolio-show-pause', pausePresenter, { capture: true });
    document.removeEventListener('portfolio-show-resume', resumePresenter, { capture: true });
    workspace.removeEventListener('portfolio-show-phase', onPhase);
    workspace.removeEventListener('portfolio-show-aligned-reset', onAlignedReset);
    workspace.removeEventListener('portfolio-show-presentation-operation', onPresentationOperation);
    workspace.removeEventListener('portfolio-show-before-advance', onBeforeAdvance);
    workspace.removeEventListener('portfolio-show-stop', restoreOrigin);
    workspace.removeEventListener('portfolio-show-complete', restoreOrigin);
    workspace.removeEventListener('portfolio-show-action', onShowAction);
    workspace.removeEventListener('portfolio-show-skip-media', onSkipMedia);
    getDock()?.removeEventListener('agent-dock-change', onDockChange);
    getDock()?.removeEventListener('agent-dock-responsive-change', onDockResponsiveChange);
    getDock()?.removeEventListener('agent-dock-change', onDrawerLevelChange);
    getDock()?.removeEventListener('agent-dock-responsive-change', onDrawerLevelChange);
    innerDrawerObserver?.disconnect();
    innerDrawerObserver = null;
    outerDrawerObserver?.disconnect();
    outerDrawerObserver = null;
    if (drawerLevelTimer) {
      clearTimeout(drawerLevelTimer);
      drawerLevelTimer = 0;
    }
    applyDrawerLevelSuppression();
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
