import { translate, encodeCascadeThemeShare, decodeCascadeThemeShare } from 'symbiote-ui/ui';

const IMPORT_DIALOG_TAG = 'sn-theme-import-dialog';
const THEME_STORAGE_KEY = 'symbiote-ui:cascade-theme-editor';
let manualDialogSequence = 0;

function translateOr(key, fallback) {
  return translate(key) || fallback;
}

function classifyImportError(error) {
  if (error?.code === 'OVERSIZED') return 'oversized';
  if (error?.code === 'UNSUPPORTED_VERSION') return 'unsupported';
  if (['INVALID_ENCODING', 'INVALID_NAME', 'INVALID_PAYLOAD'].includes(error?.code)) return 'invalid';
  return 'generic';
}

function getFeedbackMessage(type, errorCode = '') {
  if (type === 'success') {
    return translateOr('portfolio.theme.share.success', 'Theme link copied to clipboard!');
  }
  if (type === 'share-error') {
    return translateOr('portfolio.theme.share.error', 'Failed to copy theme link.');
  }
  const messages = {
    invalid: ['portfolio.theme.import.error.invalid', 'Error: Invalid theme parameters.'],
    multiple: ['portfolio.theme.import.error.multiple', 'Error: Multiple theme parameters detected.'],
    oversized: ['portfolio.theme.import.error.oversized', 'Error: Theme parameters are too large.'],
    unsupported: ['portfolio.theme.import.error.unsupported', 'Error: Unsupported theme version.'],
  };
  const [key, fallback] = messages[errorCode] || [
    'portfolio.theme.import.error.generic',
    'Error: Failed to import theme.',
  ];
  return translateOr(key, fallback);
}

function getImportMessages() {
  return {
    title: translate('portfolio.theme.import.title'),
    promptPrefix: translate('portfolio.theme.import.prompt.prefix'),
    promptSuffix: translate('portfolio.theme.import.prompt.suffix'),
    unnamedTheme: translate('portfolio.theme.import.unnamed'),
    closeLabel: translate('portfolio.theme.import.close'),
    cancelLabel: translate('portfolio.theme.import.cancel'),
    saveOnlyLabel: translate('portfolio.theme.import.saveOnly'),
    saveApplyLabel: translate('portfolio.theme.import.saveAndApply'),
    statusDecoded: translate('portfolio.theme.import.status.decoded'),
    statusFinalizing: translate('portfolio.theme.import.status.finalizing'),
    statusSuccessAddApply: translate('portfolio.theme.import.status.successAddApply'),
    statusSuccessSaveOnly: translate('portfolio.theme.import.status.successSaveOnly'),
    statusCancel: translate('portfolio.theme.import.status.cancel'),
    failParse: translate('portfolio.theme.import.fail.parse'),
    failSave: translate('portfolio.theme.import.fail.save'),
    failApply: translate('portfolio.theme.import.fail.apply'),
    failRollback: translate('portfolio.theme.import.fail.rollback'),
  };
}

export function syncImportedPortfolioThemeControls(detail = {}, controls) {
  if (detail.action !== 'add-and-apply' || !detail.state || typeof detail.state !== 'object') {
    return 0;
  }

  const themeControls = controls ?? (
    typeof document === 'undefined'
      ? []
      : document.querySelectorAll('cascade-theme-widget, cascade-theme-editor')
  );
  const hasRegister = Object.hasOwn(detail, 'register');
  const state = hasRegister
    ? { ...detail.state, register: detail.register }
    : { ...detail.state };
  let synchronized = 0;

  for (const control of themeControls) {
    const storageKey = control.storageKey
      || control.getAttribute?.('storage-key')
      || THEME_STORAGE_KEY;
    if (storageKey !== THEME_STORAGE_KEY || typeof control.setState !== 'function') continue;

    control.setState(state, { source: 'cascade-theme-import' });
    if (hasRegister && 'geometryRegister' in control) {
      control.geometryRegister = detail.register;
    }
    synchronized += 1;
  }

  return synchronized;
}

/**
 * @param {Object} [options]
 * @param {() => void} [options.restoreTree]
 * @param {string} [options.graphMode]
 * @param {string} [options.selectedEntryId]
 * @param {any} [options.structuredCanvas]
 * @param {string} [options.structuredNodeId]
 * @param {any} [options.mediaGraph]
 * @param {string} [options.activeMediaId]
 * @param {any} [options.flatGraph]
 * @param {string} [options.flatNodeId]
 * @returns {boolean}
 */
export function restorePortfolioNavigationPresentation({
  restoreTree,
  graphMode,
  selectedEntryId,
  structuredCanvas,
  structuredNodeId,
  mediaGraph,
  activeMediaId,
  flatGraph,
  flatNodeId,
} = {}) {
  restoreTree?.();

  if (graphMode === 'structured') {
    if (!structuredNodeId || typeof structuredCanvas?.selectNode !== 'function') return false;
    return structuredCanvas.selectNode(structuredNodeId) !== false;
  }

  if (graphMode === 'media') {
    mediaGraph?.setSelectedEntry?.(selectedEntryId || '', { focus: false });
    if (
      activeMediaId
      && typeof mediaGraph?.activateMediaNode === 'function'
      && mediaGraph.activateMediaNode(activeMediaId, { fit: false }) === true
    ) {
      return true;
    }
    if (!selectedEntryId || typeof mediaGraph?.activateNode !== 'function') return false;
    return mediaGraph.activateNode(selectedEntryId, {
      transition: false,
      marker: false,
    }) === true;
  }

  if (graphMode === 'flat') {
    if (!flatNodeId || typeof flatGraph?.activateNode !== 'function') return false;
    return flatGraph.activateNode(flatNodeId, {
      transition: false,
      marker: false,
    }) === true;
  }

  return false;
}

const PORTFOLIO_RUNTIME_STATE_KEYS = [
  'selectedId',
  'mediaFragment',
  'activeArticleMediaId',
  'expectedArticleMediaId',
  'expectedStructuredMediaId',
];

/**
 * @typedef {Object} PortfolioNavigationSnapshot
 * @property {string} selectedId
 * @property {string} mediaFragment
 * @property {string} [activeArticleMediaId]
 * @property {string} [expectedArticleMediaId]
 * @property {string} [expectedStructuredMediaId]
 * @property {string} [url]
 */

/** @returns {PortfolioNavigationSnapshot | null} */
export function capturePortfolioNavigationRuntimeState(runtime) {
  if (!runtime) return null;
  return /** @type {PortfolioNavigationSnapshot} */ (Object.fromEntries(
    PORTFOLIO_RUNTIME_STATE_KEYS.map((key) => [key, runtime[key]])
  ));
}

export function restorePortfolioNavigationRuntimeState(runtime, snapshot) {
  if (!runtime || !snapshot) return false;
  const restoreFields = () => {
    for (const key of PORTFOLIO_RUNTIME_STATE_KEYS) runtime[key] = snapshot[key];
  };

  restoreFields();
  try {
    runtime.syncViewer?.();
    restoreFields();
    const restored = runtime.restorePresentation?.() !== false;
    restoreFields();
    return restored;
  } catch {
    restoreFields();
    return false;
  }
}

/**
 * @param {Object} [options]
 * @param {string} [options.locale]
 * @param {string} [options.currentLocale]
 * @param {any} [options.control]
 * @param {string | URL} [options.currentUrl]
 * @param {(url: URL) => URL | string | null} [options.prepareNavigationUrl]
 * @param {(locale: string) => unknown} [options.setStoredLocale]
 * @param {(href: string) => unknown} [options.assign]
 * @returns {boolean}
 */
export function navigatePortfolioLocale({
  locale,
  currentLocale,
  control,
  currentUrl,
  prepareNavigationUrl = (url) => url,
  setStoredLocale = () => {},
  assign = () => {},
} = {}) {
  const restoreControl = () => {
    if (control) control.value = currentLocale || '';
  };

  if (!locale) {
    restoreControl();
    return false;
  }
  if (locale === currentLocale) {
    restoreControl();
    return true;
  }

  let nextUrl;
  try {
    nextUrl = new URL(currentUrl);
    nextUrl.searchParams.set('lang', locale);
    nextUrl = prepareNavigationUrl(nextUrl);
  } catch {
    restoreControl();
    return false;
  }

  if (!nextUrl) {
    restoreControl();
    return false;
  }

  const href = typeof nextUrl === 'string' ? nextUrl : nextUrl.href;
  try {
    if (!href || href === new URL(currentUrl).href) {
      restoreControl();
      return false;
    }
  } catch {
    restoreControl();
    return false;
  }

  try {
    assign(href);
  } catch (err) {
    restoreControl();
    return false;
  }

  try {
    setStoredLocale(locale);
  } catch (err) {
    // best-effort persistence after successful assign
  }

  return true;
}

/**
 * @param {Object} [options]
 * @param {string} [options.id]
 * @param {any} [options.options]
 * @param {(id: string, options: any) => boolean} [options.select]
 * @param {() => void} [options.onAccepted]
 * @returns {boolean}
 */
export function attemptPortfolioSelection({
  id,
  options,
  select,
  onAccepted,
} = {}) {
  if (!id || typeof select !== 'function') return false;
  const accepted = select(id, options) === true;
  if (accepted) onAccepted?.();
  return accepted;
}

/**
 * Owns the synchronous selection boundary used by the portfolio runtime.
 * Navigation is accepted before article, tree, or graph presentation changes,
 * and synchronous selection events cannot re-enter an active transition.
 *
 * @param {Object} [options]
 * @param {(id: string) => boolean} [options.hasEntry]
 * @param {(mediaId: string) => string} [options.createMediaFragment]
 * @param {() => PortfolioNavigationSnapshot | null} [options.getSelection]
 * @param {(selection: {selectedId: string, mediaFragment: string}) => string | null} [options.prepareNavigation]
 * @param {(selection: {
 *   id: string,
 *   mediaFragment: string,
 *   focus: boolean,
 *   focusScope: string,
 * }) => void} [options.commitSelection]
 * @param {(preparedUrl: string, selection: {selectedId: string, mediaFragment: string}) => void} [options.pushUrl]
 * @param {(snapshot: PortfolioNavigationSnapshot | null) => boolean} [options.restorePresentation]
 */
export function createPortfolioNavigationController({
  hasEntry,
  createMediaFragment,
  getSelection,
  prepareNavigation,
  commitSelection,
  pushUrl,
  restorePresentation,
} = {}) {
  let phase = 'idle';

  const restore = (snapshot) => {
    phase = 'restoring';
    try {
      if (snapshot && typeof history !== 'undefined' && typeof location !== 'undefined') {
        if (snapshot.url && location.href !== snapshot.url) {
          try {
            history.replaceState(
              { selectedId: snapshot.selectedId, mediaFragment: snapshot.mediaFragment },
              '',
              snapshot.url
            );
          } catch {
            // Ignore history restore errors during rollback
          }
        }
      }
      return restorePresentation?.(snapshot) !== false;
    } catch {
      return false;
    } finally {
      phase = 'idle';
    }
  };

  const select = (
    id,
    { focus = false, updateUrl = true, focusScope = 'node', mediaId = '' } = {},
  ) => {
    if (phase !== 'idle') return false;
    phase = 'selecting';

    let oldSelection = null;
    try {
      if (getSelection) {
        oldSelection = getSelection();
        if (oldSelection) {
          oldSelection.url = typeof location !== 'undefined' ? location.href : '';
        }
      }
    } catch {
      phase = 'idle';
      return false;
    }

    try {
      if (!id || hasEntry?.(id) !== true) {
        restore(oldSelection);
        return false;
      }

      let mediaFragment;
      try {
        mediaFragment = createMediaFragment?.(mediaId);
      } catch {
        restore(oldSelection);
        return false;
      }
      if (typeof mediaFragment !== 'string') {
        restore(oldSelection);
        return false;
      }

      let preparedUrl = null;
      if (updateUrl) {
        try {
          preparedUrl = prepareNavigation?.({ selectedId: id, mediaFragment });
        } catch {
          restore(oldSelection);
          return false;
        }
        if (!preparedUrl) {
          restore(oldSelection);
          return false;
        }
      }

      phase = 'committing';
      try {
        commitSelection?.({ id, mediaFragment, focus, focusScope });
      } catch {
        restore(oldSelection);
        return false;
      }

      if (updateUrl && preparedUrl) {
        try {
          pushUrl?.(preparedUrl, { selectedId: id, mediaFragment });
        } catch {
          restore(oldSelection);
          return false;
        }
      }

      return true;
    } finally {
      if (phase !== 'restoring') {
        phase = 'idle';
      }
    }
  };

  /**
   * @param {Object} [treeSelection]
   * @param {string} [treeSelection.id]
   * @param {any} [treeSelection.options]
   * @param {() => void} [treeSelection.onAccepted]
   */
  const selectTreeItem = ({ id, options, onAccepted } = {}) => {
    const accepted = select(id, options);
    if (accepted) onAccepted?.();
    return accepted;
  };

  return Object.freeze({
    select,
    selectTreeItem,
    get phase() { return phase; },
  });
}

/**
 * @param {Object} [options]
 * @param {any} [options.node]
 * @param {string} [options.mediaId]
 * @param {Map<string, any>} [options.entries]
 * @param {(node: any, entries: Map<string, any>) => string} [options.resolveTarget]
 * @param {(id: string, options: any) => boolean} [options.select]
 * @returns {boolean}
 */
export function routePortfolioMediaArticle({
  node,
  mediaId,
  entries,
  resolveTarget,
  select,
} = {}) {
  if (typeof resolveTarget !== 'function') return false;
  const targetId = resolveTarget(node, entries);
  return attemptPortfolioSelection({
    id: targetId,
    options: { focus: false, mediaId },
    select,
  });
}

export async function handleShareRequest(event, options = {}) {
  const isActive = options.isActive || (() => true);
  const onSuccess = options.onSuccess || (() => {});
  const onManualCopy = options.onManualCopy || (() => {});
  const onError = options.onError || (() => {});

  try {
    const detail = event?.detail || {};
    /** @type {{state: any, register?: any, name?: any}} */
    const sharePayload = { state: detail.state };
    if (Object.hasOwn(detail, 'register')) sharePayload.register = detail.register;
    if (Object.hasOwn(detail, 'name')) sharePayload.name = detail.name;
    const token = encodeCascadeThemeShare(sharePayload);
    const shareUrl = new URL(window.location.href);
    shareUrl.searchParams.set('sn-theme', token);
    const text = shareUrl.toString();

    let copied = false;
    try {
      copied = Boolean(
        navigator.clipboard
        && typeof navigator.clipboard.writeText === 'function'
        && await navigator.clipboard.writeText(text).then(() => true, () => false)
      );
    } catch {
      copied = false;
    }

    if (!isActive()) return { status: 'cancelled', url: text };
    if (copied) {
      onSuccess();
      return { status: 'copied', url: text };
    }
    onManualCopy(text);
    return { status: 'manual', url: text };
  } catch (error) {
    if (isActive()) onError(error);
    return { status: 'error', error };
  }
}

export function initPortfolioThemeSharing() {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return {
      ready: Promise.resolve(),
      cancelPreview() { return true; },
      prepareNavigationUrl(url) { return url; },
      destroy() { return true; },
    };
  }

  let destroyed = false;
  let destructionResult = true;
  let importGeneration = 0;
  let shareGeneration = 0;
  let importDialogAppended = false;
  let importFocusOrigin = null;
  let toastElement = null;
  let toastTimer = /** @type {ReturnType<typeof setTimeout> | 0} */ (0);
  let manualDialog = null;
  let manualFocusOrigin = null;

  const importDialog = /** @type {any} */ (document.createElement(IMPORT_DIALOG_TAG));

  function clearToast() {
    if (toastTimer) {
      clearTimeout(toastTimer);
      toastTimer = 0;
    }
    toastElement?.remove();
    toastElement = null;
  }

  function showFeedback(type, errorCode = '') {
    if (destroyed) return;
    clearToast();
    const toast = document.createElement('div');
    toast.className = `sn-theme-share-toast ${type}`;
    toast.setAttribute('role', type === 'success' ? 'status' : 'alert');
    toast.setAttribute('aria-live', type === 'success' ? 'polite' : 'assertive');
    toast.textContent = getFeedbackMessage(type, errorCode);
    toastElement = toast;
    document.body.appendChild(toast);
    toastTimer = setTimeout(() => {
      if (toastElement === toast) {
        toast.remove();
        toastElement = null;
        toastTimer = 0;
      }
    }, 4000);
  }

  function closeManualDialog({ restoreFocus = true } = {}) {
    const dialog = manualDialog;
    if (!dialog) return;
    manualDialog = null;
    const focusOrigin = manualFocusOrigin;
    manualFocusOrigin = null;
    dialog.removeEventListener('close', onManualDialogClose);
    dialog.removeEventListener('cancel', onManualDialogCancel);
    if (dialog.open) dialog.close();
    dialog.remove();
    if (restoreFocus && focusOrigin && typeof focusOrigin.focus === 'function') {
      focusOrigin.focus();
    }
  }

  function onManualDialogClose() {
    closeManualDialog();
  }

  function onManualDialogCancel(event) {
    event.preventDefault();
    closeManualDialog();
  }

  function showManualCopyDialog(url) {
    if (destroyed) return;
    const focusOrigin = manualDialog ? manualFocusOrigin : document.activeElement;
    closeManualDialog({ restoreFocus: false });
    manualFocusOrigin = focusOrigin;

    const dialog = document.createElement('dialog');
    dialog.className = 'sn-theme-share-copy-overlay';
    const id = `sn-theme-share-manual-${++manualDialogSequence}`;
    const titleId = `${id}-title`;
    const descriptionId = `${id}-description`;
    const inputId = `${id}-input`;
    dialog.setAttribute('aria-labelledby', titleId);
    dialog.setAttribute('aria-describedby', descriptionId);

    const container = document.createElement('div');
    container.className = 'sn-theme-share-copy-card';

    const title = document.createElement('h3');
    title.id = titleId;
    title.textContent = translateOr('portfolio.theme.share.manual.title', 'Copy Theme Link');
    container.appendChild(title);

    const description = document.createElement('p');
    description.id = descriptionId;
    description.textContent = translateOr(
      'portfolio.theme.share.manual.desc',
      'Copying to clipboard failed. Please copy the link manually:'
    );
    container.appendChild(description);

    const label = document.createElement('label');
    label.setAttribute('for', inputId);
    label.textContent = title.textContent;
    label.hidden = true;
    container.appendChild(label);

    const input = document.createElement('input');
    input.type = 'text';
    input.id = inputId;
    input.readOnly = true;
    input.value = url;
    input.className = 'sn-theme-share-copy-input';
    input.setAttribute('aria-label', title.textContent);
    input.addEventListener('click', () => input.select());
    container.appendChild(input);

    const closeButton = document.createElement('button');
    closeButton.type = 'button';
    closeButton.className = 'sn-theme-share-copy-close';
    closeButton.textContent = translateOr('portfolio.theme.share.manual.close', 'Close');
    closeButton.addEventListener('click', () => closeManualDialog());
    container.appendChild(closeButton);

    dialog.appendChild(container);
    dialog.addEventListener('close', onManualDialogClose);
    dialog.addEventListener('cancel', onManualDialogCancel);
    manualDialog = dialog;
    document.body.appendChild(dialog);
    try {
      dialog.showModal();
      input.focus();
      input.select();
    } catch (error) {
      closeManualDialog();
      showFeedback('share-error');
    }
  }

  const onImportSuccess = (event) => {
    try {
      syncImportedPortfolioThemeControls(event?.detail);
    } finally {
      cleanupImportDialog();
    }
  };

  const onImportCancel = () => {
    cleanupImportDialog();
  };

  const onImportError = (event) => {
    if (event?.detail?.error?.code === 'IMPORT_ROLLBACK_FAILED') {
      return;
    }
    cleanupImportDialog();
  };

  function cleanupImportDialog({ restoreFocus = true } = {}) {
    if (!importDialogAppended) return;
    importDialogAppended = false;
    importDialog.removeEventListener('cascade-theme-import-success', onImportSuccess);
    importDialog.removeEventListener('cascade-theme-import-cancel', onImportCancel);
    importDialog.removeEventListener('cascade-theme-import-error', onImportError);
    importDialog.remove();
    const focusOrigin = importFocusOrigin;
    importFocusOrigin = null;
    if (restoreFocus && focusOrigin && typeof focusOrigin.focus === 'function') {
      focusOrigin.focus();
    }
  }

  function isTerminalCancelResult(result) {
    if (result === true) return true;
    if (result && typeof result === 'object') {
      const { state, outcome } = result;
      if (state === 'settled' || outcome === 'cancelled' || outcome === 'already-settled' || outcome === 'closed') {
        return true;
      }
    }
    return false;
  }

  function cancelPreview() {
    importGeneration += 1;
    if (!importDialogAppended) return true;
    try {
      const result = typeof importDialog.cancel === 'function'
        ? importDialog.cancel()
        : importDialog.close?.();
      if (!importDialogAppended) return true;
      if (isTerminalCancelResult(result)) {
        cleanupImportDialog();
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  function prepareNavigationUrl(url) {
    const currentUrl = new URL(window.location.href);
    if (!cancelPreview()) {
      showFeedback('error', 'generic');
      return null;
    }
    try {
      const nextUrl = new URL(url, currentUrl);
      nextUrl.searchParams.delete('sn-theme');
      return nextUrl;
    } catch {
      showFeedback('error', 'generic');
      return null;
    }
  }

  const shareHandler = (event) => {
    const requestGeneration = ++shareGeneration;
    void handleShareRequest(event, {
      isActive: () => !destroyed && requestGeneration === shareGeneration,
      onSuccess: () => showFeedback('success'),
      onManualCopy: showManualCopyDialog,
      onError: () => showFeedback('share-error'),
    });
  };
  document.addEventListener('cascade-theme-share-request', shareHandler);

  const popstateHandler = (event) => {
    if (cancelPreview()) return;
    event.stopImmediatePropagation?.();
    showFeedback('error', 'generic');
  };
  window.addEventListener('popstate', popstateHandler);

  const url = new URL(window.location.href);
  const themeTokens = url.searchParams.getAll('sn-theme');
  let ready = Promise.resolve();

  if (themeTokens.length > 1) {
    showFeedback('error', 'multiple');
  } else if (themeTokens.length === 1) {
    const token = themeTokens[0];
    let valid = false;
    try {
      decodeCascadeThemeShare(token);
      valid = true;
    } catch (error) {
      showFeedback('error', classifyImportError(error));
    }

    if (valid) {
      const requestGeneration = importGeneration;
      ready = customElements.whenDefined(IMPORT_DIALOG_TAG).then(() => {
        if (destroyed || requestGeneration !== importGeneration) return;

        importFocusOrigin = document.activeElement;
        importDialog.addEventListener('cascade-theme-import-success', onImportSuccess);
        importDialog.addEventListener('cascade-theme-import-cancel', onImportCancel);
        importDialog.addEventListener('cascade-theme-import-error', onImportError);
        document.body.appendChild(importDialog);
        importDialogAppended = true;

        const messages = getImportMessages();
        try {
          importDialog.show({
            token,
            target: document.documentElement,
            storageKey: THEME_STORAGE_KEY,
            labels: messages,
            messages,
          });
        } catch (error) {
          showFeedback('error', classifyImportError(error));
          if (!cancelPreview()) showFeedback('error', 'generic');
          return;
        }

        const cleanUrl = new URL(window.location.href);
        cleanUrl.searchParams.delete('sn-theme');
        try {
          window.history.replaceState(window.history.state, '', cleanUrl.toString());
        } catch {
          const cancelled = cancelPreview();
          showFeedback('error', 'generic');
          if (!cancelled) return;
        }
      });
    }
  }

  function destroy() {
    if (destroyed) return destructionResult;
    shareGeneration += 1;
    closeManualDialog();
    clearToast();
    destructionResult = cancelPreview();
    if (!destructionResult && importDialogAppended) return false;
    destroyed = true;
    document.removeEventListener('cascade-theme-share-request', shareHandler);
    window.removeEventListener('popstate', popstateHandler);
    return destructionResult;
  }

  return {
    ready,
    cancelPreview,
    prepareNavigationUrl,
    destroy,
  };
}
