import '../../../ui-components/client-only/tour-player/tour-player.js';
import { createPresenterCursor } from 'symbiote-ui/chat/presenter-cursor.js';
import {
  ShowAttentionController,
  ShowAudioArbiter,
  ShowMediaController,
  monitorMeaningfulShowInteractions,
  waitForShowDomReadiness,
} from 'symbiote-ui/chat/show-runtime';
import { TOUR_LOCALE_MESSAGES } from '../../data/tourTranslations.js';
import { activateCvShowTarget, activateCvShowUserAction } from './activation.js';
import { createCvShowDirectiveRunner } from './showAdapter.js';

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

function resolveTargetElement(workspace, runtime, targetId) {
  if (!targetId) return null;
  const direct = document.querySelector(`[data-tour-target="${escapeAttributeSelectorValue(targetId)}"]`);
  const directTarget = direct ? firstVisibleSibling(direct) : null;
  if (directTarget?.matches?.('video, audio')) return directTarget;
  if (visibleElement(directTarget)) return directTarget;
  if (targetId === 'portfolio/header') return document.querySelector('body > header');
  if (targetId === 'portfolio/workspace') return workspace;
  if (targetId === 'portfolio/viewer') return runtime.viewer || workspace.querySelector('.portfolio-viewer');
  if (targetId === 'portfolio.show-stage' || targetId.startsWith('chat.')) {
    return workspace.querySelector('agent-dock-shell chat-show-player')
      || workspace.querySelector('agent-dock-shell');
  }
  if (targetId.startsWith('portfolio.map.')) return workspace.querySelector('sn-canvas-graph') || workspace;
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

function resolveMediaElement(workspace, runtime, targetId) {
  const target = resolveTargetElement(workspace, runtime, targetId);
  if (!target) return null;
  if (target.matches?.('video, audio')) return target;
  return target.querySelector?.('video, audio')
    || target.parentElement?.querySelector?.('video, audio')
    || null;
}

function panelTypeForTarget(targetId, runtime) {
  if (targetId.startsWith('project-card.') || runtime.entries.has(targetId)) {
    return 'portfolio-tree';
  }
  if (targetId.startsWith('portfolio.map.')) return 'portfolio-graph';
  if (targetId.startsWith('article.') || targetId.startsWith('profile.')) {
    return 'portfolio-viewer';
  }
  return '';
}

function findPanelNode(node, panelType) {
  if (!node || !panelType) return null;
  if (node.type === 'panel' && node.panelType === panelType) return node;
  return findPanelNode(node.first, panelType) || findPanelNode(node.second, panelType);
}

function findPanelElement(layout, panelId) {
  return Array.from(layout?.querySelectorAll?.('layout-node') || [])
    .find((node) => node.dataset?.panelId === panelId || node.$?.nodeId === panelId)
    || null;
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

function inspectTargetPanel(workspace, runtime, targetId) {
  const panelType = panelTypeForTarget(targetId, runtime);
  const layout = /** @type {any} */ (workspace.querySelector('.portfolio-layout'));
  const panel = findPanelNode(layout?.$.layoutTree, panelType);
  const agentDock = /** @type {any} */ (workspace.querySelector('agent-dock-shell'));
  const outerMobile = Boolean(agentDock?.ref?.layout?.hasAttribute?.('drawer-mode-active'));
  const outerOpen = Boolean(agentDock?.hasAttribute?.('open'));
  if (!layout || !panel) {
    return Object.freeze({
      targetId,
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
  const dock = panel.behavior?.mobileDock === 'start' ? 'start' : 'end';
  const drawerOpen = layout.hasAttribute(`drawer-${dock}-open`);
  const activeDrawerId = dock === 'start' ? layout.$.drawerStartPanelId : layout.$.drawerEndPanelId;
  return Object.freeze({
    targetId,
    panelType,
    panelId: panel.id,
    mobile,
    dock,
    open: mobile ? drawerOpen && (!activeDrawerId || activeDrawerId === panel.id) : !panel.collapsed,
    outerMobile,
    outerOpen,
  });
}

function createPanelActionAdapter(workspace, runtime) {
  const inspect = ({ action }) => inspectTargetPanel(workspace, runtime, action.target);
  const reveal = ({ action, inspected }) => {
    const layout = /** @type {any} */ (workspace.querySelector('.portfolio-layout'));
    const agentDock = /** @type {any} */ (workspace.querySelector('agent-dock-shell'));
    const innerChanged = Boolean(inspected?.panelId && !inspected.open);
    const outerChanged = Boolean(inspected?.outerMobile && inspected.outerOpen);
    if (innerChanged && inspected.mobile) layout?.openDrawer?.(inspected.dock, inspected.panelId);
    else if (innerChanged) {
      layout?.dispatchEvent?.(new CustomEvent('panel-collapse-toggle', {
        bubbles: true,
        composed: true,
        detail: { panelId: inspected.panelId, collapsed: false },
      }));
    }
    if (outerChanged) agentDock?.close?.('show-action');
    return {
      changed: innerChanged || outerChanged,
      innerChanged,
      outerChanged,
      ...inspectTargetPanel(workspace, runtime, action.target),
    };
  };
  const awaitTransition = async ({ action, inspected, signal }) => {
    if (!inspected?.panelId && !inspected?.outerMobile) return { ready: true, panelId: '' };
    const ready = await waitForShowDomReadiness({
      document,
      target: () => {
        const state = inspectTargetPanel(workspace, runtime, action.target);
        const layout = workspace.querySelector('.portfolio-layout');
        const outerReady = !inspected.outerMobile
          || !inspected.outerOpen
          || !state.outerOpen;
        if (!outerReady) return null;
        if (!inspected.panelId) return visibleElement(workspace);
        const target = visibleElement(resolveTargetElement(workspace, runtime, action.target));
        if (target) return target;
        return state.open ? visibleElement(findPanelElement(layout, state.panelId)) : null;
      },
      signal,
      timeoutMs: 2_500,
      scroll: false,
    });
    return { ready: true, panelId: inspected.panelId, target: ready.target };
  };
  const awaitTarget = ({ action, signal }) => waitForShowDomReadiness({
    document,
    target: () => visibleElement(resolveTargetElement(workspace, runtime, action.target)),
    signal,
    timeoutMs: 2_500,
  });
  const restore = ({ action, inspected, reveal: revealReceipt }) => {
    if (revealReceipt?.changed !== true || inspected?.open || !inspected?.panelId) {
      if (revealReceipt?.outerChanged) {
        workspace.querySelector('agent-dock-shell')?.open?.('show-action');
        return { changed: true, outerRestored: true };
      }
      return { changed: false };
    }
    const layout = /** @type {any} */ (workspace.querySelector('.portfolio-layout'));
    const current = inspectTargetPanel(workspace, runtime, action.target);
    if (revealReceipt.innerChanged && current.mobile) layout?.closeDrawer?.(current.dock);
    else if (revealReceipt.innerChanged) {
      layout?.dispatchEvent?.(new CustomEvent('panel-collapse-toggle', {
        bubbles: true,
        composed: true,
        detail: { panelId: inspected.panelId, collapsed: true },
      }));
    }
    if (revealReceipt.outerChanged) {
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

  const createPresenterSession = () => {
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
      resolveMedia: (targetId) => resolveMediaElement(workspace, runtime, targetId),
      resolveText: getLocaleMessage,
      activateTarget: (target, directive) => activateCvShowTarget(target, directive).handled,
      emit: (directive) => getChat()?.emitShowDirective?.(directive),
      actionAdapter: createPanelActionAdapter(workspace, runtime),
    });
    return { cursor, attention, runner };
  };

  let originTargetId = '';
  let running = false;
  let alignedGeneration = 0;
  let alignedQueue = Promise.resolve();
  /** @type {ReturnType<typeof createPresenterSession> | null} */
  let presenter = null;

  const ensurePresenter = () => {
    presenter ||= createPresenterSession();
    return presenter;
  };

  const invalidateAlignedQueue = () => {
    alignedGeneration += 1;
    alignedQueue = Promise.resolve();
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
    invalidateAlignedQueue();
    if (event.detail?.reason === 'meaningful-interaction') {
      presenter?.runner.meaningfulInteraction();
    } else {
      presenter?.runner.pause();
    }
    scheduleDocumentSelectionClear();
  };

  const disposePresenter = () => {
    invalidateAlignedQueue();
    if (!presenter) return;
    const session = presenter;
    presenter = null;
    session.runner.stop();
    session.attention.dispose();
    session.cursor.dispose();
    scheduleDocumentSelectionClear();
  };

  const ensureChat = () => {
    let chat = getChat();
    if (chat) return chat;
    let dock = getDock();
    if (!dock) return null;
    chat = document.createElement('portfolio-show-chat');
    chat.hidden = true;
    chat.agentDock = dock;
    chat.audioArbiter = audioArbiter;
    chat.setAttribute('aria-label', title);
    workspace.append(chat);
    return chat;
  };

  const restoreOrigin = () => {
    const wasRunning = running;
    running = false;
    disposePresenter();
    media.stop('show-terminal');
    audioArbiter.release({ reason: 'show-terminal' });
    if (wasRunning && originTargetId && runtime.entries.has(originTargetId)) {
      runtime.select(originTargetId, { focus: true, updateUrl: false });
    }
    originTargetId = '';
    scheduleDocumentSelectionClear();
  };

  const onOpen = () => {
    let dock = getDock();
    let chat = ensureChat();
    dock?.open?.('tour-button');
    chat?.openShow?.();
    queueMicrotask(() => requestAnimationFrame(() => requestAnimationFrame(
      () => getChat()?.focusFirstControl?.(),
    )));
  };

  const onStart = () => {
    ensurePresenter();
    originTargetId = runtime.selectedId;
    running = true;
    let chat = getChat();
    if (chat) chat.audioArbiter = audioArbiter;
  };

  const dispatchResult = (chat, requestId, result) => {
    if (!chat || result.status === 'cancelled') return;
    chat.dispatchEvent(new CustomEvent('portfolio-show-result', {
      detail: { requestId, ...result },
    }));
  };

  const onPhase = async (event) => {
    const chat = getChat();
    const requestId = event.detail?.requestId;
    const complete = event.detail?.complete;
    if (typeof complete === 'function') event.detail.handled = true;
    invalidateAlignedQueue();
    const { runner } = ensurePresenter();
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
    invalidateAlignedQueue();
    const reason = event.detail?.receipt?.reason || '';
    if (reason === 'branch-return') ensurePresenter().runner.branchReturn();
    else if (reason.includes('seek')) ensurePresenter().runner.seek();
    else ensurePresenter().runner.beginPhase();
  };

  const onAlignedCue = (event) => {
    const generation = alignedGeneration;
    const requestId = event.detail?.requestId;
    const source = event.detail?.source;
    if (!source) return;
    alignedQueue = alignedQueue.then(async () => {
      if (generation !== alignedGeneration) return;
      const chat = getChat();
      try {
        const result = await ensurePresenter().runner.run([source], { continuePhase: true });
        if (generation !== alignedGeneration) return;
        dispatchResult(chat, requestId, result);
      } catch (error) {
        if (error?.name === 'AbortError' || !chat || generation !== alignedGeneration) return;
        chat.dispatchEvent(new CustomEvent('portfolio-show-result', {
          detail: { requestId, status: 'required-missing', error: error?.message || String(error) },
        }));
      }
    });
  };

  const onDockChange = (event) => {
    if (event.detail?.source === 'show-action') return;
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

  const onSkipMedia = () => media.skip();

  const interactionMonitor = monitorMeaningfulShowInteractions(document, {
    accept: (event) => !getDock()?.contains(event.target),
    pause: () => getChat()?.pauseShow?.('meaningful-interaction'),
  });

  document.addEventListener('portfolio-open-tour', onOpen);
  workspace.addEventListener('portfolio-show-start', onStart);
  document.addEventListener('portfolio-show-pause', pausePresenter, { capture: true });
  workspace.addEventListener('portfolio-show-phase', onPhase);
  workspace.addEventListener('portfolio-show-aligned-reset', onAlignedReset);
  workspace.addEventListener('portfolio-show-aligned-cue', onAlignedCue);
  workspace.addEventListener('portfolio-show-stop', restoreOrigin);
  workspace.addEventListener('portfolio-show-complete', restoreOrigin);
  workspace.addEventListener('portfolio-show-action', onShowAction);
  workspace.addEventListener('portfolio-show-skip-media', onSkipMedia);
  getDock()?.addEventListener('agent-dock-change', onDockChange);

  return () => {
    document.removeEventListener('portfolio-open-tour', onOpen);
    workspace.removeEventListener('portfolio-show-start', onStart);
    document.removeEventListener('portfolio-show-pause', pausePresenter, { capture: true });
    workspace.removeEventListener('portfolio-show-phase', onPhase);
    workspace.removeEventListener('portfolio-show-aligned-reset', onAlignedReset);
    workspace.removeEventListener('portfolio-show-aligned-cue', onAlignedCue);
    workspace.removeEventListener('portfolio-show-stop', restoreOrigin);
    workspace.removeEventListener('portfolio-show-complete', restoreOrigin);
    workspace.removeEventListener('portfolio-show-action', onShowAction);
    workspace.removeEventListener('portfolio-show-skip-media', onSkipMedia);
    getDock()?.removeEventListener('agent-dock-change', onDockChange);
    interactionMonitor.dispose();
    getChat()?.stopShow?.();
    disposePresenter();
    media.stop('tour-disposed');
    audioArbiter.release({ reason: 'tour-disposed' });
  };
}
