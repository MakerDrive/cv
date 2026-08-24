import '../../../ui-components/client-only/tour-player/tour-player.js';
import { createPresenterCursor } from 'symbiote-ui/chat/presenter-cursor.js';
import { TOUR_LOCALE_MESSAGES } from '../../data/tourTranslations.js';
import { createTourActionRunner } from './actions.js';

const TOUR_PANEL_BEHAVIOR = Object.freeze({
  importance: 89,
  minInlineSize: 320,
  minBlockSize: 280,
  collapse: 'manual',
  mobileDock: 'end',
  swipeControl: 'rail',
});

function getLocaleMessage(key) {
  const locale = document.documentElement.lang || 'en';
  const messages = TOUR_LOCALE_MESSAGES[locale] || TOUR_LOCALE_MESSAGES.en;
  return messages[key] || TOUR_LOCALE_MESSAGES.en[key] || '';
}

class PortfolioTourPanel extends HTMLElement {
  connectedCallback() {
    if (this._ready) return;
    this._ready = true;
    this.setAttribute('role', 'region');
    this.setAttribute('aria-label', getLocaleMessage('panel.tour'));
    const player = /** @type {HTMLElement & { focusFirstControl?: () => void }} */ (
      document.createElement('tour-player')
    );
    this.append(player);
    player.focusFirstControl?.();
  }

  disconnectedCallback() {
    /** @type {HTMLElement & { stopTour?: () => void } | null} */ (
      this.querySelector('tour-player')
    )?.stopTour?.();
  }
}

if (!customElements.get('portfolio-tour-panel')) {
  customElements.define('portfolio-tour-panel', PortfolioTourPanel);
}

function findTreeRow(workspace, entryId) {
  return Array.from(workspace.querySelectorAll('.sn-tree-row'))
    .find((row) => row.dataset.treeId === entryId) || null;
}

function resolveTargetElement(workspace, runtime, targetId) {
  if (targetId === 'portfolio/header') return document.querySelector('body > header');
  if (targetId === 'portfolio/workspace') return workspace;
  if (targetId === 'portfolio/viewer') return runtime.viewer || workspace.querySelector('.portfolio-viewer');
  if (runtime.entries.has(targetId)) {
    return findTreeRow(workspace, targetId) || runtime.viewer || workspace.querySelector('.portfolio-viewer');
  }
  return null;
}

function abortError() {
  return new DOMException('Tour action cancelled', 'AbortError');
}

function waitForCondition(check, observeRoot, signal, timeoutMs = 2_000) {
  if (signal.aborted) return Promise.reject(abortError());
  return new Promise((resolve, reject) => {
    let frame = 0;
    /** @type {ReturnType<typeof setTimeout> | null} */
    let timer = null;
    let observer = null;
    let settled = false;
    const cleanup = () => {
      if (frame) cancelAnimationFrame(frame);
      if (timer !== null) clearTimeout(timer);
      observer?.disconnect();
      signal.removeEventListener('abort', onAbort);
    };
    const finish = (value, error) => {
      if (settled) return;
      settled = true;
      cleanup();
      if (error) reject(error);
      else resolve(value);
    };
    const onAbort = () => finish(null, abortError());
    const inspect = () => {
      frame = 0;
      const value = check();
      if (value) finish(value);
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(inspect);
    };
    signal.addEventListener('abort', onAbort, { once: true });
    observer = new MutationObserver(schedule);
    observer.observe(observeRoot, { childList: true, subtree: true, attributes: true });
    timer = globalThis.setTimeout(() => finish(null, new Error('Tour visual action did not settle')), timeoutMs);
    schedule();
  });
}

function waitForTarget(workspace, runtime, targetId, signal) {
  return waitForCondition(
    () => resolveTargetElement(workspace, runtime, targetId),
    workspace,
    signal,
  ).catch((error) => {
    if (error?.name === 'AbortError') throw error;
    return null;
  });
}

function targetIsVisible(target) {
  if (!target?.isConnected) return false;
  const rect = target.getBoundingClientRect();
  const style = getComputedStyle(target);
  return rect.width > 0 && rect.height > 0 && style.visibility !== 'hidden' && style.display !== 'none';
}

function settleSelection(workspace, runtime, targetId, target, signal) {
  return waitForCondition(
    () => {
      const currentTarget = resolveTargetElement(workspace, runtime, targetId) || target;
      return runtime.selectedId === targetId && targetIsVisible(currentTarget);
    },
    workspace,
    signal,
  );
}

function awaitPresentation(promise, signal, timeoutMs = 5_000) {
  if (!promise || typeof promise.then !== 'function') return Promise.resolve();
  if (signal.aborted) return Promise.reject(abortError());
  return new Promise((resolve, reject) => {
    let settled = false;
    const timer = globalThis.setTimeout(() => finish(new Error('Tour presentation timed out')), timeoutMs);
    const onAbort = () => finish(abortError());
    const finish = (error) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      signal.removeEventListener('abort', onAbort);
      if (error) reject(error);
      else resolve();
    };
    signal.addEventListener('abort', onAbort, { once: true });
    Promise.resolve(promise).then(() => finish(), finish);
  });
}

export function installPortfolioTour({ layout, workspace, runtime, title }) {
  layout.registerPanelType('portfolio-tour', {
    title,
    icon: 'play_circle',
    component: 'portfolio-tour-panel',
    behavior: TOUR_PANEL_BEHAVIOR,
  });

  const getPlayer = () => workspace.querySelector('portfolio-tour-panel tour-player');
  const cursor = createPresenterCursor();
  const runner = createTourActionRunner({
    runtime,
    resolveTarget: (targetId, signal) => waitForTarget(workspace, runtime, targetId, signal),
    presentTarget: (target, intent, phase, signal) => awaitPresentation(
      cursor.moveTo(target, { actionId: intent.provenanceId, label: '', phase }),
      signal,
    ),
    settleTarget: (targetId, target, signal) => settleSelection(workspace, runtime, targetId, target, signal),
    clearPresenter: () => cursor.clear(),
  });

  let originTargetId = '';
  let running = false;

  const restoreOrigin = () => {
    if (!running) return;
    running = false;
    runner.cancel();
    if (originTargetId && runtime.entries.has(originTargetId)) {
      runtime.select(originTargetId, { focus: true, updateUrl: false });
    }
    originTargetId = '';
  };

  const onOpen = () => {
    const panelId = layout.openPanel('portfolio-tour', {
      direction: 'horizontal',
      ratio: 0.72,
      behavior: TOUR_PANEL_BEHAVIOR,
      source: 'tour-button',
      uiInvoked: true,
    });
    if (panelId && layout.hasAttribute('drawer-mode-active')) {
      layout.openDrawer?.('end', panelId);
    }
    queueMicrotask(() => requestAnimationFrame(() => requestAnimationFrame(
      () => getPlayer()?.focusFirstControl?.(),
    )));
  };

  const onStart = () => {
    originTargetId = runtime.selectedId;
    running = true;
  };

  const onPhase = async (event) => {
    const player = getPlayer();
    const requestId = event.detail?.requestId;
    try {
      const result = await runner.run(event.detail?.intents || []);
      if (!player || result.status === 'cancelled') return;
      player.dispatchEvent(new CustomEvent('portfolio-tour-result', {
        detail: { requestId, ...result },
      }));
    } catch (error) {
      if (error?.name === 'AbortError' || !player) return;
      player.dispatchEvent(new CustomEvent('portfolio-tour-result', {
        detail: { requestId, status: 'required-missing', error: error?.message || String(error) },
      }));
    }
  };

  const onTerminal = () => restoreOrigin();

  const onClose = (event) => {
    if (event.detail?.panelType !== 'portfolio-tour') return;
    getPlayer()?.stopTour?.();
    runner.cancel();
    /** @type {HTMLElement | null} */ (document.querySelector('.pulse-tour-button'))?.focus();
  };

  document.addEventListener('portfolio-open-tour', onOpen);
  workspace.addEventListener('portfolio-tour-start', onStart);
  workspace.addEventListener('portfolio-tour-phase', onPhase);
  workspace.addEventListener('portfolio-tour-stop', onTerminal);
  workspace.addEventListener('portfolio-tour-complete', onTerminal);
  layout.addEventListener('layout-ui-panel-close', onClose);

  return () => {
    document.removeEventListener('portfolio-open-tour', onOpen);
    workspace.removeEventListener('portfolio-tour-start', onStart);
    workspace.removeEventListener('portfolio-tour-phase', onPhase);
    workspace.removeEventListener('portfolio-tour-stop', onTerminal);
    workspace.removeEventListener('portfolio-tour-complete', onTerminal);
    layout.removeEventListener('layout-ui-panel-close', onClose);
    getPlayer()?.stopTour?.();
    runner.cancel();
  };
}
