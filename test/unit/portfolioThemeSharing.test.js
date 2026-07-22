import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import {
  configureBrowserLocalization,
  decodeCascadeThemeShare,
  encodeCascadeThemeShare,
} from 'symbiote-ui/ui';

import { PORTFOLIO_LOCALE_MESSAGES } from '../../src/static-pages/data/portfolioTranslations.js';
import {
  capturePortfolioNavigationRuntimeState,
  createPortfolioNavigationController,
  handleShareRequest,
  initPortfolioThemeSharing,
  navigatePortfolioLocale,
  restorePortfolioNavigationRuntimeState,
  restorePortfolioNavigationPresentation,
  routePortfolioMediaArticle,
  syncImportedPortfolioThemeControls,
} from '../../src/static-pages/js/portfolioThemeSharing.js';

function createDeferred() {
  let resolve;
  const promise = new Promise((done) => { resolve = done; });
  return { promise, resolve };
}

function installBrowserStubs(initialUrl = 'https://example.com/', options = {}) {
  const originalDescriptors = new Map();
  const createdElements = [];
  const order = [];
  const definition = createDeferred();
  const clipboard = createDeferred();
  let currentUrl = new URL(initialUrl);
  let replaceStateCall = null;
  let replaceStateFailure = false;
  let clipboardMode = 'success';
  let cancelMode = 'success';
  let showError = null;

  function stubGlobal(name, value) {
    originalDescriptors.set(name, Object.getOwnPropertyDescriptor(globalThis, name));
    Object.defineProperty(globalThis, name, {
      value,
      configurable: true,
      writable: true,
    });
  }

  function addEventTarget(target) {
    const listeners = new Map();
    target.addEventListener = (name, handler) => {
      if (!listeners.has(name)) listeners.set(name, new Set());
      listeners.get(name).add(handler);
    };
    target.removeEventListener = (name, handler) => listeners.get(name)?.delete(handler);
    target.dispatchEvent = (event) => {
      event.target ||= target;
      event.currentTarget = target;
      event.immediatePropagationStopped ||= false;
      event.stopImmediatePropagation ||= function stopImmediatePropagation() {
        this.immediatePropagationStopped = true;
      };
      for (const handler of [...(listeners.get(event.type) || [])]) {
        handler.call(target, event);
        if (event.immediatePropagationStopped) break;
      }
      return !event.defaultPrevented;
    };
    target.listenerCount = (name) => listeners.get(name)?.size || 0;
    return target;
  }

  const focusOrigin = {
    focusCalls: 0,
    focus() { this.focusCalls += 1; },
  };

  const documentElement = addEventTarget({
    tagName: 'HTML',
    attributes: {},
    setAttribute(name, value) { this.attributes[name] = String(value); },
    getAttribute(name) { return this.attributes[name] ?? null; },
  });

  const fakeDocument = addEventTarget({
    activeElement: focusOrigin,
    documentElement,
    body: null,
    createElement: null,
    querySelectorAll(selector) {
      return selector === 'cascade-theme-widget, cascade-theme-editor'
        ? options.themeControls || []
        : [];
    },
  });

  function createFakeElement(tagName) {
    const classNames = new Set();
    let className = '';
    const element = addEventTarget({
      tagName: tagName.toUpperCase(),
      attributes: {},
      children: [],
      classList: classNames,
      id: '',
      hidden: false,
      open: false,
      removed: false,
      textContent: '',
      value: '',
      focusCalls: 0,
      selectCalls: 0,
      get className() { return className; },
      set className(value) {
        className = String(value || '');
        classNames.clear();
        className.split(/\s+/).filter(Boolean).forEach((name) => classNames.add(name));
      },
      setAttribute(name, value) { this.attributes[name] = String(value); },
      getAttribute(name) { return this.attributes[name] ?? null; },
      appendChild(child) { this.children.push(child); return child; },
      remove() {
        this.removed = true;
        const index = fakeDocument.body.children.indexOf(this);
        if (index >= 0) fakeDocument.body.children.splice(index, 1);
      },
      focus() { this.focusCalls += 1; fakeDocument.activeElement = this; },
      select() { this.selectCalls += 1; },
      showModal() {
        if (options.showModalFailure) throw new Error('showModal failed');
        this.open = true;
        this.showModalCalled = true;
      },
      close() {
        this.closeCalled = true;
        if (!this.open) return;
        this.open = false;
        this.dispatchEvent({ type: 'close', defaultPrevented: false });
      },
      cancel() {
        this.cancelCalled = true;
        if (cancelMode === 'error-then-throw') {
          this.dispatchEvent({
            type: 'cascade-theme-import-error',
            detail: { error: Object.assign(new Error('rollback failed'), { code: 'IMPORT_ROLLBACK_FAILED' }) },
            defaultPrevented: false,
          });
          throw new Error('rollback failed');
        }
        if (cancelMode === 'throw') throw new Error('rollback failed');
        if (cancelMode === 'pending') return undefined;
        this.dispatchEvent({
          type: 'cascade-theme-import-cancel',
          defaultPrevented: false,
        });
        return undefined;
      },
      show(showOptions) {
        order.push('show');
        this.showArgs = showOptions;
        if (showError) throw showError;
      },
    });
    createdElements.push(element);
    return element;
  }

  fakeDocument.body = {
    children: [],
    appendChild(element) {
      element.removed = false;
      this.children.push(element);
      return element;
    },
  };
  fakeDocument.createElement = createFakeElement;

  const fakeHistory = {
    state: { selectedId: 'projects/autobox-v1', retained: true },
    replaceState(state, title, url) {
      order.push('replaceState');
      replaceStateCall = { state, title, url };
      if (replaceStateFailure) throw new Error('replaceState failed');
      currentUrl = new URL(url, currentUrl);
    },
  };

  const fakeLocation = {
    get href() { return currentUrl.toString(); },
    get search() { return currentUrl.search; },
    assign(url) { currentUrl = new URL(url, currentUrl); },
  };

  const fakeCustomElements = {
    whenDefinedCalls: [],
    whenDefined(tagName) {
      this.whenDefinedCalls.push(tagName);
      return options.deferDefinition ? definition.promise : Promise.resolve();
    },
  };

  const fakeNavigator = {
    clipboard: {
      writeText(text) {
        fakeNavigator.clipboard.text = text;
        if (clipboardMode === 'failure') return Promise.reject(new Error('clipboard failed'));
        if (clipboardMode === 'deferred') return clipboard.promise;
        return Promise.resolve();
      },
      text: null,
    },
  };

  const fakeWindow = addEventTarget({
    location: fakeLocation,
    history: fakeHistory,
    navigator: fakeNavigator,
  });

  stubGlobal('window', fakeWindow);
  stubGlobal('document', fakeDocument);
  stubGlobal('customElements', fakeCustomElements);
  stubGlobal('navigator', fakeNavigator);
  stubGlobal('location', fakeLocation);
  stubGlobal('history', fakeHistory);

  configureBrowserLocalization({
    force: true,
    locale: options.locale || 'en',
    explicit: true,
    messages: PORTFOLIO_LOCALE_MESSAGES,
  });

  return {
    createdElements,
    document: fakeDocument,
    focusOrigin,
    history: fakeHistory,
    order,
    window: fakeWindow,
    currentUrl: () => new URL(currentUrl),
    activeElements: (tagName) => fakeDocument.body.children.filter(
      (element) => !element.removed && element.tagName === tagName.toUpperCase()
    ),
    replaceStateCall: () => replaceStateCall,
    resolveDefinition: () => definition.resolve(),
    resolveClipboard: () => clipboard.resolve(),
    setCancelMode: (value) => { cancelMode = value; },
    setClipboardMode: (value) => { clipboardMode = value; },
    setReplaceStateFailure: (value) => { replaceStateFailure = value; },
    setShowError: (error) => { showError = error; },
    teardown() {
      for (const [name, descriptor] of originalDescriptors) {
        if (descriptor) Object.defineProperty(globalThis, name, descriptor);
        else delete globalThis[name];
      }
    },
  };
}

function validToken(name = 'Test Theme') {
  return encodeCascadeThemeShare({
    state: { hue: 120, mode: 'dark' },
    register: 'product',
    name,
  });
}

function tokenWithInvalidName() {
  const token = validToken('Valid');
  const payload = JSON.parse(Buffer.from(token.slice(3), 'base64url').toString('utf8'));
  payload.name = '\u0001';
  return `v1.${Buffer.from(JSON.stringify(payload)).toString('base64url')}`;
}

function dispatch(target, type, detail) {
  const event = {
    type,
    detail,
    defaultPrevented: false,
    preventDefault() { this.defaultPrevented = true; },
  };
  target.dispatchEvent(event);
  return event;
}

async function flushAsyncWork() {
  await Promise.resolve();
  await Promise.resolve();
  await new Promise((resolve) => setImmediate(resolve));
}

function createNavigationHarness({ graphMode = 'structured', acceptUrl = true } = {}) {
  const calls = [];
  const state = {
    selectedId: 'projects/current',
    mediaFragment: 'media-current',
    articleId: 'projects/current',
    treeId: 'projects/current',
    graphId: 'projects/current',
    url: 'https://example.com/projects/current/',
  };
  let controller;
  const restorePresentation = () => {
    calls.push(['restore', controller.phase]);
    assert.equal(controller.select('projects/reentrant'), false);
    return restorePortfolioNavigationPresentation({
      restoreTree: () => {
        calls.push(['tree-restore', state.selectedId, false]);
        state.treeId = state.selectedId;
      },
      graphMode,
      selectedEntryId: state.selectedId,
      structuredCanvas: {
        selectNode(id) {
          calls.push(['structured-restore', id]);
          state.graphId = id;
        },
        focusNodes() {
          calls.push(['unexpected-focus']);
        },
      },
      structuredNodeId: state.selectedId,
      mediaGraph: {
        setSelectedEntry(id, options) {
          calls.push(['media-entry-restore', id, options]);
          state.graphId = id;
        },
        activateNode(id, options) {
          calls.push(['media-restore', id, options]);
          state.graphId = id;
          return true;
        },
        focusNodes() {
          calls.push(['unexpected-focus']);
        },
      },
      flatGraph: {
        activateNode(id, options) {
          calls.push(['flat-restore', id, options]);
          state.graphId = id;
          return true;
        },
        focusNodes() {
          calls.push(['unexpected-focus']);
        },
      },
      flatNodeId: state.selectedId,
    });
  };

  controller = createPortfolioNavigationController({
    hasEntry: (id) => ['projects/current', 'projects/new', 'projects/reentrant'].includes(id),
    createMediaFragment: (mediaId) => mediaId ? `media-${mediaId}` : '',
    getSelection() {
      return {
        selectedId: state.selectedId,
        mediaFragment: state.mediaFragment,
      };
    },
    prepareNavigation({ selectedId, mediaFragment }) {
      calls.push(['url-gate', selectedId, mediaFragment, state.selectedId, state.articleId]);
      if (acceptUrl === 'throw') throw new Error('navigation gate failed');
      if (!acceptUrl) return null;
      return `https://example.com/${selectedId}/#${mediaFragment}`;
    },
    pushUrl(preparedUrl) {
      state.url = preparedUrl;
    },
    restorePresentation(snapshot) {
      if (snapshot) {
        state.selectedId = snapshot.selectedId;
        state.mediaFragment = snapshot.mediaFragment;
      }
      return restorePresentation();
    },
    commitSelection({ id, mediaFragment, focus, focusScope }) {
      calls.push(['commit', id, mediaFragment, focus, focusScope, controller.phase]);
      assert.equal(controller.select('projects/reentrant'), false);
      state.selectedId = id;
      state.mediaFragment = mediaFragment;
      state.articleId = id;
      state.treeId = id;
      state.graphId = id;
    },
  });

  return { calls, controller, state };
}

test('production navigation controller gates URL before presentation and suppresses commit re-entry', () => {
  const { calls, controller, state } = createNavigationHarness();

  assert.equal(controller.select('projects/new', {
    focus: true,
    focusScope: 'group',
    mediaId: 'asset-one',
  }), true);
  assert.equal(controller.phase, 'idle');
  assert.deepEqual(calls, [
    ['url-gate', 'projects/new', 'media-asset-one', 'projects/current', 'projects/current'],
    ['commit', 'projects/new', 'media-asset-one', true, 'group', 'committing'],
  ]);
  assert.deepEqual(state, {
    selectedId: 'projects/new',
    mediaFragment: 'media-asset-one',
    articleId: 'projects/new',
    treeId: 'projects/new',
    graphId: 'projects/new',
    url: 'https://example.com/projects/new/#media-asset-one',
  });
});

test('refused URL gate restores the previous structured presentation without route, article, or focus drift', () => {
  const { calls, controller, state } = createNavigationHarness({ acceptUrl: false });
  const snapshot = structuredClone(state);

  assert.equal(controller.select('projects/new', { focus: true, mediaId: 'asset-one' }), false);
  assert.equal(controller.phase, 'idle');
  assert.deepEqual(state, snapshot);
  assert.deepEqual(calls, [
    ['url-gate', 'projects/new', 'media-asset-one', 'projects/current', 'projects/current'],
    ['restore', 'restoring'],
    ['tree-restore', 'projects/current', false],
    ['structured-restore', 'projects/current'],
  ]);
  assert.equal(calls.some(([name]) => name === 'unexpected-focus'), false);
  assert.equal(calls.some(([name]) => name === 'commit'), false);
});

test('invalid selection restores once and reentrant restore events cannot recurse or mutate URL/article state', () => {
  const { calls, controller, state } = createNavigationHarness();
  const snapshot = structuredClone(state);

  assert.equal(controller.select('projects/missing', { focus: true }), false);
  assert.equal(controller.phase, 'idle');
  assert.deepEqual(state, snapshot);
  assert.deepEqual(calls, [
    ['restore', 'restoring'],
    ['tree-restore', 'projects/current', false],
    ['structured-restore', 'projects/current'],
  ]);
});

test('thrown URL synchronization failure restores once without route or presentation drift', () => {
  const { calls, controller, state } = createNavigationHarness({ acceptUrl: 'throw' });
  const snapshot = structuredClone(state);

  assert.equal(controller.select('projects/new', { focus: true }), false);
  assert.equal(controller.phase, 'idle');
  assert.deepEqual(state, snapshot);
  assert.deepEqual(calls, [
    ['url-gate', 'projects/new', '', 'projects/current', 'projects/current'],
    ['restore', 'restoring'],
    ['tree-restore', 'projects/current', false],
    ['structured-restore', 'projects/current'],
  ]);
});

test('refused TreeView selection restores the previous item and keeps the drawer open', () => {
  const { controller, state } = createNavigationHarness({ acceptUrl: false });
  state.treeId = 'projects/new';
  const drawer = { closeCalls: 0 };
  const accepted = controller.selectTreeItem({
    id: 'projects/new',
    options: { focus: true },
    onAccepted: () => { drawer.closeCalls += 1; },
  });

  assert.equal(accepted, false);
  assert.equal(state.treeId, 'projects/current');
  assert.equal(drawer.closeCalls, 0);
});

test('accepted TreeView selection closes the drawer once after the presentation commit', () => {
  const { calls, controller, state } = createNavigationHarness();
  const drawer = { closeCalls: 0 };
  const accepted = controller.selectTreeItem({
    id: 'projects/new',
    options: { focus: true },
    onAccepted() {
      calls.push(['drawer-close', state.treeId]);
      drawer.closeCalls += 1;
    },
  });

  assert.equal(accepted, true);
  assert.equal(drawer.closeCalls, 1);
  assert.deepEqual(calls.at(-1), ['drawer-close', 'projects/new']);
});

test('refused locale navigation restores the preselected segmented-control value', () => {
  const control = { value: 'ru' };
  let storedLocale = '';
  let assignedUrl = '';
  const accepted = navigatePortfolioLocale({
    locale: 'ru',
    currentLocale: 'en',
    control,
    currentUrl: 'https://example.com/projects/autobox-v1/?lang=en#media-a',
    prepareNavigationUrl: () => null,
    setStoredLocale: (locale) => { storedLocale = locale; },
    assign: (url) => { assignedUrl = url; },
  });

  assert.equal(accepted, false);
  assert.equal(control.value, 'en');
  assert.equal(storedLocale, '');
  assert.equal(assignedUrl, '');
});

test('structured rollback activates the previous node through selectNode', () => {
  const calls = [];
  const accepted = restorePortfolioNavigationPresentation({
    graphMode: 'structured',
    selectedEntryId: 'projects/current',
    structuredCanvas: {
      selectNode(id) { calls.push(id); },
    },
    structuredNodeId: 'media/current',
  });

  assert.equal(accepted, true);
  assert.deepEqual(calls, ['media/current']);
});

test('structured rollback does not touch the inactive media graph', () => {
  const calls = [];
  const accepted = restorePortfolioNavigationPresentation({
    graphMode: 'structured',
    selectedEntryId: 'projects/current',
    structuredCanvas: { selectNode() { return true; } },
    structuredNodeId: 'projects/current',
    mediaGraph: {
      setSelectedEntry() { calls.push('media-entry'); },
      activateNode() { calls.push('media-node'); return true; },
    },
  });

  assert.equal(accepted, true);
  assert.deepEqual(calls, []);
});

test('media rollback restores the selected entry and active media through public APIs', () => {
  const calls = [];
  const mediaGraph = {
    setSelectedEntry(id, options) { calls.push(['entry', id, options]); },
    activateMediaNode(id, options) { calls.push(['media', id, options]); return true; },
    activateNode(id, options) { calls.push(['node', id, options]); return true; },
  };
  const accepted = restorePortfolioNavigationPresentation({
    graphMode: 'media',
    selectedEntryId: 'projects/current',
    mediaGraph,
    activeMediaId: 'media/current',
  });

  assert.equal(accepted, true);
  assert.deepEqual(calls, [
    ['entry', 'projects/current', { focus: false }],
    ['media', 'media/current', { fit: false }],
  ]);
});

test('media rollback falls back to the previous article hub when no media is active', () => {
  const calls = [];
  const accepted = restorePortfolioNavigationPresentation({
    graphMode: 'media',
    selectedEntryId: 'projects/current',
    mediaGraph: {
      setSelectedEntry() {},
      activateNode(id, options) { calls.push([id, options]); return true; },
    },
  });

  assert.equal(accepted, true);
  assert.deepEqual(calls, [[
    'projects/current',
    { transition: false, marker: false },
  ]]);
});

test('flat rollback activates the previous mapped node through activateNode', () => {
  const calls = [];
  const accepted = restorePortfolioNavigationPresentation({
    graphMode: 'flat',
    selectedEntryId: 'projects/index',
    flatGraph: {
      activateNode(id, options) { calls.push([id, options]); return true; },
    },
    flatNodeId: 'group/projects',
  });

  assert.equal(accepted, true);
  assert.deepEqual(calls, [[
    'group/projects',
    { transition: false, marker: false },
  ]]);
});

test('media route returns the underlying selection result without converting refusal to success', () => {
  const calls = [];
  const options = {
    node: { id: 'media/new' },
    mediaId: 'media/new',
    entries: new Map([['projects/new', {}]]),
    resolveTarget: () => 'projects/new',
    select(id, selectionOptions) {
      calls.push([id, selectionOptions]);
      return false;
    },
  };

  assert.equal(routePortfolioMediaArticle(options), false);
  options.select = () => true;
  assert.equal(routePortfolioMediaArticle(options), true);
  assert.deepEqual(calls, [[
    'projects/new',
    { focus: false, mediaId: 'media/new' },
  ]]);
});

test('controller exposes the lifecycle API and removes listeners idempotently', () => {
  const env = installBrowserStubs();
  try {
    const first = initPortfolioThemeSharing();
    assert.equal(env.document.listenerCount('cascade-theme-share-request'), 1);
    assert.equal(env.window.listenerCount('popstate'), 1);
    assert.equal(first.destroy(), true);
    assert.equal(first.destroy(), true);
    assert.equal(env.document.listenerCount('cascade-theme-share-request'), 0);
    assert.equal(env.window.listenerCount('popstate'), 0);

    const second = initPortfolioThemeSharing();
    assert.equal(env.document.listenerCount('cascade-theme-share-request'), 1);
    assert.equal(second.cancelPreview(), true);
    assert.equal(typeof second.prepareNavigationUrl, 'function');
    assert.ok(second.ready instanceof Promise);
    second.destroy();
  } finally {
    env.teardown();
  }
});

test('valid preview starts before URL cleanup and preserves history state, path, query, and hash', async () => {
  const token = validToken();
  const historyUrl = `https://example.com/projects/autobox-v1/?lang=ru&keep=1&sn-theme=${token}#media-a`;
  const env = installBrowserStubs(historyUrl);
  try {
    const controller = initPortfolioThemeSharing();
    await controller.ready;
    const dialog = env.activeElements('sn-theme-import-dialog')[0];
    assert.ok(dialog);
    assert.deepEqual(env.order.slice(0, 2), ['show', 'replaceState']);
    assert.strictEqual(env.replaceStateCall().state, env.history.state);
    const cleanUrl = new URL(env.replaceStateCall().url);
    assert.equal(cleanUrl.pathname, '/projects/autobox-v1/');
    assert.equal(cleanUrl.searchParams.get('lang'), 'ru');
    assert.equal(cleanUrl.searchParams.get('keep'), '1');
    assert.equal(cleanUrl.searchParams.has('sn-theme'), false);
    assert.equal(cleanUrl.hash, '#media-a');
    assert.deepEqual(dialog.showArgs.labels, dialog.showArgs.messages);
    controller.destroy();
  } finally {
    env.teardown();
  }
});

test('navigation before custom-element definition invalidates the pending preview', async () => {
  const token = validToken();
  const env = installBrowserStubs(`https://example.com/?sn-theme=${token}`, { deferDefinition: true });
  try {
    const controller = initPortfolioThemeSharing();
    const nextUrl = controller.prepareNavigationUrl('https://example.com/next?keep=1#target');
    assert.equal(nextUrl.href, 'https://example.com/next?keep=1#target');
    env.resolveDefinition();
    await controller.ready;
    assert.equal(env.activeElements('sn-theme-import-dialog').length, 0);
    assert.deepEqual(env.order, []);
    controller.destroy();
  } finally {
    env.teardown();
  }
});

test('popstate before custom-element definition also invalidates the pending preview', async () => {
  const token = validToken();
  const env = installBrowserStubs(`https://example.com/?sn-theme=${token}`, { deferDefinition: true });
  try {
    const controller = initPortfolioThemeSharing();
    dispatch(env.window, 'popstate');
    env.resolveDefinition();
    await controller.ready;
    assert.equal(env.activeElements('sn-theme-import-dialog').length, 0);
    controller.destroy();
  } finally {
    env.teardown();
  }
});

test('rollback failure refuses navigation and keeps the owned import dialog', async () => {
  const token = validToken();
  const env = installBrowserStubs(`https://example.com/?sn-theme=${token}`);
  try {
    const controller = initPortfolioThemeSharing();
    await controller.ready;
    env.setCancelMode('throw');
    const result = controller.prepareNavigationUrl('https://example.com/next');
    assert.equal(result, null);
    assert.equal(env.activeElements('sn-theme-import-dialog').length, 1);
    assert.equal(env.activeElements('div').some((element) => element.classList.has('error')), true);
    assert.equal(controller.cancelPreview(), false);
    env.setCancelMode('success');
    assert.equal(controller.cancelPreview(), true);
    controller.destroy();
  } finally {
    env.teardown();
  }
});

test('rollback failure stops later popstate listeners without hiding the owned preview', async () => {
  const token = validToken();
  const env = installBrowserStubs(`https://example.com/?sn-theme=${token}`);
  try {
    const controller = initPortfolioThemeSharing();
    await controller.ready;
    let laterListenerCalls = 0;
    env.window.addEventListener('popstate', () => { laterListenerCalls += 1; });

    env.setCancelMode('throw');
    const refusedEvent = dispatch(env.window, 'popstate');
    assert.equal(refusedEvent.immediatePropagationStopped, true);
    assert.equal(refusedEvent.defaultPrevented, false);
    assert.equal(laterListenerCalls, 0);
    assert.equal(env.activeElements('sn-theme-import-dialog').length, 1);

    env.setCancelMode('success');
    const acceptedEvent = dispatch(env.window, 'popstate');
    assert.equal(acceptedEvent.immediatePropagationStopped, false);
    assert.equal(laterListenerCalls, 1);
    assert.equal(env.activeElements('sn-theme-import-dialog').length, 0);
    controller.destroy();
  } finally {
    env.teardown();
  }
});

test('failed destroy cleans independent UI while retaining ownership for a safe retry', async () => {
  const env = installBrowserStubs(`https://example.com/?sn-theme=${validToken()}`);
  try {
    const controller = initPortfolioThemeSharing();
    await controller.ready;
    const importDialog = env.activeElements('sn-theme-import-dialog')[0];

    dispatch(env.document, 'cascade-theme-share-request', { state: { hue: 120 } });
    await flushAsyncWork();
    env.setClipboardMode('failure');
    dispatch(env.document, 'cascade-theme-share-request', { state: { hue: 180 } });
    await flushAsyncWork();
    assert.equal(env.activeElements('div').length, 1);
    assert.equal(env.activeElements('dialog').length, 1);

    env.setCancelMode('throw');
    assert.equal(controller.destroy(), false);
    assert.equal(env.activeElements('div').length, 0);
    assert.equal(env.activeElements('dialog').length, 0);
    assert.equal(env.activeElements('sn-theme-import-dialog').length, 1);
    assert.equal(importDialog.listenerCount('cascade-theme-import-success'), 1);
    assert.equal(importDialog.listenerCount('cascade-theme-import-cancel'), 1);
    assert.equal(importDialog.listenerCount('cascade-theme-import-error'), 1);
    assert.equal(env.document.listenerCount('cascade-theme-share-request'), 1);
    assert.equal(env.window.listenerCount('popstate'), 1);

    env.setCancelMode('success');
    assert.equal(controller.destroy(), true);
    assert.equal(env.activeElements('sn-theme-import-dialog').length, 0);
    assert.equal(importDialog.listenerCount('cascade-theme-import-success'), 0);
    assert.equal(importDialog.listenerCount('cascade-theme-import-cancel'), 0);
    assert.equal(importDialog.listenerCount('cascade-theme-import-error'), 0);
    assert.equal(env.document.listenerCount('cascade-theme-share-request'), 0);
    assert.equal(env.window.listenerCount('popstate'), 0);
    assert.equal(controller.destroy(), true);
  } finally {
    env.teardown();
  }
});

test('terminal rollback error finalizes listener cleanup but remains a truthful failed destroy', async () => {
  const env = installBrowserStubs(`https://example.com/?sn-theme=${validToken()}`);
  try {
    const controller = initPortfolioThemeSharing();
    await controller.ready;
    const importDialog = env.activeElements('sn-theme-import-dialog')[0];
    env.setCancelMode('error-then-throw');

    assert.equal(controller.destroy(), false);
    assert.equal(env.activeElements('sn-theme-import-dialog').length, 1);
    assert.equal(importDialog.listenerCount('cascade-theme-import-success'), 1);
    assert.equal(importDialog.listenerCount('cascade-theme-import-cancel'), 1);
    assert.equal(importDialog.listenerCount('cascade-theme-import-error'), 1);
    assert.equal(env.document.listenerCount('cascade-theme-share-request'), 1);
    assert.equal(env.window.listenerCount('popstate'), 1);

    env.setCancelMode('success');
    assert.equal(controller.destroy(), true);
    assert.equal(env.activeElements('sn-theme-import-dialog').length, 0);
  } finally {
    env.teardown();
  }
});

test('history cleanup failure retains token, cancels preview, and exposes an error', async () => {
  const token = validToken();
  const initialUrl = `https://example.com/project/?keep=1&sn-theme=${token}#anchor`;
  const env = installBrowserStubs(initialUrl);
  env.setReplaceStateFailure(true);
  try {
    const controller = initPortfolioThemeSharing();
    await controller.ready;
    assert.equal(env.currentUrl().searchParams.get('sn-theme'), token);
    assert.equal(env.currentUrl().hash, '#anchor');
    assert.equal(env.activeElements('sn-theme-import-dialog').length, 0);
    assert.equal(env.activeElements('div').some((element) => element.classList.has('error')), true);
    controller.destroy();
  } finally {
    env.teardown();
  }
});

test('show failure retains token and cleans up the preview host', async () => {
  const token = validToken();
  const env = installBrowserStubs(`https://example.com/?sn-theme=${token}`);
  const error = new Error('show failed');
  error.code = 'INVALID_PAYLOAD';
  env.setShowError(error);
  try {
    const controller = initPortfolioThemeSharing();
    await controller.ready;
    assert.equal(env.currentUrl().searchParams.get('sn-theme'), token);
    assert.equal(env.replaceStateCall(), null);
    assert.equal(env.activeElements('sn-theme-import-dialog').length, 0);
    controller.destroy();
  } finally {
    env.teardown();
  }
});

for (const eventType of [
  'cascade-theme-import-success',
  'cascade-theme-import-cancel',
  'cascade-theme-import-error',
]) {
  test(`${eventType} removes the import element and restores focus exactly once`, async () => {
    const env = installBrowserStubs(`https://example.com/?sn-theme=${validToken()}`);
    try {
      const controller = initPortfolioThemeSharing();
      await controller.ready;
      const dialog = env.activeElements('sn-theme-import-dialog')[0];
      dispatch(dialog, eventType, { action: 'add-and-apply' });
      assert.equal(env.activeElements('sn-theme-import-dialog').length, 0);
      assert.equal(env.focusOrigin.focusCalls, 1);
      dispatch(dialog, eventType);
      assert.equal(env.focusOrigin.focusCalls, 1);
      controller.destroy();
    } finally {
      env.teardown();
    }
  });
}

test('successful add-and-apply import synchronizes mounted library theme controls', async () => {
  const widgetCalls = [];
  const editorCalls = [];
  const widget = {
    storageKey: 'symbiote-ui:cascade-theme-editor',
    setState(state, options) { widgetCalls.push({ state, options }); },
  };
  const editor = {
    storageKey: 'symbiote-ui:cascade-theme-editor',
    geometryRegister: '',
    setState(state, options) { editorCalls.push({ state, options }); },
  };
  const unrelated = {
    storageKey: 'another-theme',
    setState() { throw new Error('unrelated control must not be synchronized'); },
  };
  const env = installBrowserStubs(
    `https://example.com/?sn-theme=${validToken()}`,
    { themeControls: [widget, editor, unrelated] },
  );

  try {
    const controller = initPortfolioThemeSharing();
    await controller.ready;
    const dialog = env.activeElements('sn-theme-import-dialog')[0];
    dispatch(dialog, 'cascade-theme-import-success', {
      action: 'add-and-apply',
      state: { hue: 42, contrast: 100 },
      register: 'product',
    });

    assert.deepEqual(widgetCalls, [{
      state: { hue: 42, contrast: 100, register: 'product' },
      options: { source: 'cascade-theme-import' },
    }]);
    assert.deepEqual(editorCalls, [{
      state: { hue: 42, contrast: 100, register: 'product' },
      options: { source: 'cascade-theme-import' },
    }]);
    assert.equal(editor.geometryRegister, 'product');
    assert.equal(env.activeElements('sn-theme-import-dialog').length, 0);
    assert.equal(env.focusOrigin.focusCalls, 1);
    controller.destroy();
  } finally {
    env.teardown();
  }
});

test('save-without-applying import does not change mounted theme controls', () => {
  let calls = 0;
  const synchronized = syncImportedPortfolioThemeControls({
    action: 'save-without-applying',
    state: { hue: 42 },
    register: 'product',
  }, [{
    storageKey: 'symbiote-ui:cascade-theme-editor',
    setState() { calls += 1; },
  }]);

  assert.equal(synchronized, 0);
  assert.equal(calls, 0);
});

test('strict invalid-name payload is classified as invalid and retained in the URL', async () => {
  const token = tokenWithInvalidName();
  const env = installBrowserStubs(`https://example.com/?sn-theme=${token}`);
  try {
    assert.throws(() => decodeCascadeThemeShare(token), { code: 'INVALID_NAME' });
    const controller = initPortfolioThemeSharing();
    await controller.ready;
    const toast = env.activeElements('div').find((element) => element.classList.has('error'));
    assert.match(toast.textContent, /invalid/i);
    assert.equal(env.currentUrl().searchParams.get('sn-theme'), token);
    controller.destroy();
  } finally {
    env.teardown();
  }
});

test('share URL preserves route, other query values, and hash while replacing duplicate theme params', async () => {
  const env = installBrowserStubs('https://example.com/project/?keep=1&sn-theme=old&sn-theme=older#media');
  try {
    let copied = false;
    const result = await handleShareRequest({
      detail: { state: { hue: 120 }, register: 'product', name: 'Shared' },
    }, {
      onSuccess: () => { copied = true; },
    });
    assert.equal(result.status, 'copied');
    assert.equal(copied, true);
    const url = new URL(result.url);
    assert.equal(url.pathname, '/project/');
    assert.equal(url.searchParams.get('keep'), '1');
    assert.equal(url.searchParams.getAll('sn-theme').length, 1);
    assert.equal(url.hash, '#media');
    assert.equal(decodeCascadeThemeShare(url.searchParams.get('sn-theme')).name, 'Shared');
  } finally {
    env.teardown();
  }
});

test('clipboard fallback owns one accessible native dialog with unique ids and restores focus', async () => {
  const env = installBrowserStubs();
  env.setClipboardMode('failure');
  try {
    const controller = initPortfolioThemeSharing();
    const detail = { state: { hue: 120 } };
    dispatch(env.document, 'cascade-theme-share-request', detail);
    await flushAsyncWork();
    const first = env.activeElements('dialog')[0];
    assert.ok(first);
    const firstLabelId = first.getAttribute('aria-labelledby');
    assert.ok(firstLabelId);
    assert.ok(first.getAttribute('aria-describedby'));
    assert.equal(first.showModalCalled, true);

    dispatch(env.document, 'cascade-theme-share-request', detail);
    await flushAsyncWork();
    const dialogs = env.activeElements('dialog');
    assert.equal(dialogs.length, 1);
    assert.notEqual(dialogs[0].getAttribute('aria-labelledby'), firstLabelId);
    assert.equal(first.removed, true);

    dispatch(dialogs[0], 'cancel');
    assert.equal(env.activeElements('dialog').length, 0);
    assert.equal(env.focusOrigin.focusCalls, 1);
    controller.destroy();
  } finally {
    env.teardown();
  }
});

test('clipboard completion after destroy creates no feedback UI', async () => {
  const env = installBrowserStubs();
  env.setClipboardMode('deferred');
  try {
    const controller = initPortfolioThemeSharing();
    dispatch(env.document, 'cascade-theme-share-request', { state: { hue: 120 } });
    controller.destroy();
    env.resolveClipboard();
    await flushAsyncWork();
    assert.equal(env.activeElements('dialog').length, 0);
    assert.equal(env.activeElements('div').length, 0);
  } finally {
    env.teardown();
  }
});

for (const locale of ['en', 'ru', 'es']) {
  test(`import dialog receives complete public ${locale} labels and messages`, async () => {
    const env = installBrowserStubs(`https://example.com/?sn-theme=${validToken()}`, { locale });
    try {
      const controller = initPortfolioThemeSharing();
      await controller.ready;
      const dialog = env.activeElements('sn-theme-import-dialog')[0];
      assert.deepEqual(dialog.showArgs.labels, dialog.showArgs.messages);
      assert.equal(dialog.showArgs.messages.title, PORTFOLIO_LOCALE_MESSAGES[locale]['portfolio.theme.import.title']);
      assert.equal(dialog.showArgs.messages.closeLabel, PORTFOLIO_LOCALE_MESSAGES[locale]['portfolio.theme.import.close']);
      assert.equal(dialog.showArgs.messages.saveApplyLabel, PORTFOLIO_LOCALE_MESSAGES[locale]['portfolio.theme.import.saveAndApply']);
      assert.equal(dialog.showArgs.messages.failRollback, PORTFOLIO_LOCALE_MESSAGES[locale]['portfolio.theme.import.fail.rollback']);
      assert.equal(Object.values(dialog.showArgs.messages).every(Boolean), true);
      controller.destroy();
    } finally {
      env.teardown();
    }
  });
}

test('index keeps direct public share labels without private share controls', async () => {
  const source = await readFile(new URL('../../src/static-pages/js/index.js', import.meta.url), 'utf8');
  const pageSource = await readFile(new URL('../../src/static-pages/portfolioPage.js', import.meta.url), 'utf8');
  assert.doesNotMatch(source, /\[data-action=["']share["']\]/);
  assert.doesNotMatch(source, /\bencodeTheme\b/);
  assert.doesNotMatch(source, /for \(let editor of document\.querySelectorAll\('cascade-theme-editor'\)\)/);
  assert.doesNotMatch(source, /setLocalizedAttribute\(widget, 'share-label'/);
  assert.match(source, /document\.querySelector\('\.pulse-theme-widget'\),\s*'share-label'/);
  assert.match(source, /querySelector\('cascade-theme-editor'\)\?\.setAttribute\('share-label'/);
  assert.match(pageSource, /<cascade-theme-widget class="pulse-theme-widget" share-label="Share theme">/);
});

test('presentation commit throw restores the old selection and URL state', () => {
  const { calls, state } = createNavigationHarness();

  const mockController = createPortfolioNavigationController({
    hasEntry: (id) => ['projects/current', 'projects/new'].includes(id),
    createMediaFragment: (mediaId) => mediaId ? `media-${mediaId}` : '',
    getSelection() {
      return { selectedId: state.selectedId, mediaFragment: state.mediaFragment };
    },
    prepareNavigation({ selectedId, mediaFragment }) {
      return `https://example.com/${selectedId}/#${mediaFragment}`;
    },
    pushUrl(preparedUrl) {
      state.url = preparedUrl;
    },
    restorePresentation(snapshot) {
      calls.push(['restore', snapshot]);
      state.selectedId = snapshot.selectedId;
      state.mediaFragment = snapshot.mediaFragment;
      return true;
    },
    commitSelection() {
      throw new Error('commit failed');
    },
  });

  const snapshot = { ...state };
  assert.equal(mockController.select('projects/new', { mediaId: 'asset-one' }), false);
  assert.deepEqual(state.selectedId, snapshot.selectedId);
  assert.deepEqual(state.mediaFragment, snapshot.mediaFragment);
  assert.equal(calls.length, 1);
  assert.equal(calls[0][0], 'restore');
  assert.deepEqual(calls[0][1].selectedId, snapshot.selectedId);
});

test('pushUrl throw restores the old selection and URL state', () => {
  const { calls, state } = createNavigationHarness();

  const mockController = createPortfolioNavigationController({
    hasEntry: (id) => ['projects/current', 'projects/new'].includes(id),
    createMediaFragment: (mediaId) => mediaId ? `media-${mediaId}` : '',
    getSelection() {
      return { selectedId: state.selectedId, mediaFragment: state.mediaFragment };
    },
    prepareNavigation({ selectedId, mediaFragment }) {
      return `https://example.com/${selectedId}/#${mediaFragment}`;
    },
    pushUrl() {
      throw new Error('pushUrl failed');
    },
    restorePresentation(snapshot) {
      calls.push(['restore', snapshot]);
      state.selectedId = snapshot.selectedId;
      state.mediaFragment = snapshot.mediaFragment;
      return true;
    },
    commitSelection({ id, mediaFragment }) {
      state.selectedId = id;
      state.mediaFragment = mediaFragment;
    },
  });

  const snapshot = { ...state };
  assert.equal(mockController.select('projects/new', { mediaId: 'asset-one' }), false);
  assert.deepEqual(state.selectedId, snapshot.selectedId);
  assert.deepEqual(state.mediaFragment, snapshot.mediaFragment);
  assert.equal(calls.length, 1);
  assert.equal(calls[0][0], 'restore');
});

test('runtime rollback restores the rendered article and exact media focus state', () => {
  const calls = [];
  const runtime = {
    selectedId: 'projects/current',
    mediaFragment: 'media-current',
    activeArticleMediaId: 'media/current/active',
    expectedArticleMediaId: 'media/current/expected',
    expectedStructuredMediaId: 'media/current/structured',
    syncViewer() {
      calls.push(['viewer', this.selectedId, this.mediaFragment]);
      this.activeArticleMediaId = 'derived-active';
      this.expectedArticleMediaId = 'derived-expected';
      this.expectedStructuredMediaId = 'derived-structured';
    },
    restorePresentation() {
      calls.push([
        'presentation',
        this.selectedId,
        this.activeArticleMediaId,
        this.expectedStructuredMediaId,
      ]);
      return true;
    },
  };
  const snapshot = capturePortfolioNavigationRuntimeState(runtime);

  Object.assign(runtime, {
    selectedId: 'projects/new',
    mediaFragment: 'media-new',
    activeArticleMediaId: 'media/new/active',
    expectedArticleMediaId: 'media/new/expected',
    expectedStructuredMediaId: 'media/new/structured',
  });

  assert.equal(restorePortfolioNavigationRuntimeState(runtime, snapshot), true);
  assert.deepEqual(capturePortfolioNavigationRuntimeState(runtime), snapshot);
  assert.deepEqual(calls, [
    ['viewer', 'projects/current', 'media-current'],
    ['presentation', 'projects/current', 'media/current/active', 'media/current/structured'],
  ]);
});

test('updateUrl false commit failure restores old presentation and runtime state', () => {
  const { calls, state } = createNavigationHarness();

  const mockController = createPortfolioNavigationController({
    hasEntry: (id) => ['projects/current', 'projects/new'].includes(id),
    createMediaFragment: (mediaId) => mediaId ? `media-${mediaId}` : '',
    getSelection() {
      return { selectedId: state.selectedId, mediaFragment: state.mediaFragment };
    },
    restorePresentation(snapshot) {
      calls.push(['restore', snapshot]);
      state.selectedId = snapshot.selectedId;
      state.mediaFragment = snapshot.mediaFragment;
      return true;
    },
    commitSelection() {
      throw new Error('commit failed');
    },
  });

  const snapshot = { ...state };
  assert.equal(mockController.select('projects/new', { updateUrl: false }), false);
  assert.deepEqual(state.selectedId, snapshot.selectedId);
  assert.equal(calls.length, 1);
  assert.equal(calls[0][0], 'restore');
});

test('locale assign failure ordering and persistence failure handling', () => {
  const control = { value: 'ru' };
  let storedLocale = '';
  let assignedUrl = '';

  const accepted1 = navigatePortfolioLocale({
    locale: 'ru',
    currentLocale: 'en',
    control,
    currentUrl: 'https://example.com/projects/autobox-v1/?lang=en',
    setStoredLocale: (locale) => { storedLocale = locale; },
    assign: () => { throw new Error('assign failed'); },
  });
  assert.equal(accepted1, false);
  assert.equal(control.value, 'en');
  assert.equal(storedLocale, '');

  const accepted2 = navigatePortfolioLocale({
    locale: 'ru',
    currentLocale: 'en',
    control,
    currentUrl: 'https://example.com/projects/autobox-v1/?lang=en',
    setStoredLocale: () => { throw new Error('persistence failed'); },
    assign: (url) => { assignedUrl = url; },
  });
  assert.equal(accepted2, true);
  assert.equal(assignedUrl, 'https://example.com/projects/autobox-v1/?lang=ru');
});

test('recoverable rollback error retains dialog and later structured settled cancel cleans it up', async () => {
  const env = installBrowserStubs(`https://example.com/?sn-theme=${validToken()}`);
  try {
    const controller = initPortfolioThemeSharing();
    await controller.ready;
    const dialog = env.activeElements('sn-theme-import-dialog')[0];

    dispatch(dialog, 'cascade-theme-import-error', {
      error: Object.assign(new Error('rollback failed'), { code: 'IMPORT_ROLLBACK_FAILED' })
    });

    assert.equal(env.activeElements('sn-theme-import-dialog').length, 1);

    dialog.cancel = () => ({ state: 'settled', outcome: 'cancelled' });

    const cancelled = controller.cancelPreview();
    assert.equal(cancelled, true);
    assert.equal(env.activeElements('sn-theme-import-dialog').length, 0);
    controller.destroy();
  } finally {
    env.teardown();
  }
});

test('rollback-pending/finalizing/throwing cancel retains dialog', async () => {
  const env = installBrowserStubs(`https://example.com/?sn-theme=${validToken()}`);
  try {
    const controller = initPortfolioThemeSharing();
    await controller.ready;
    const dialog = env.activeElements('sn-theme-import-dialog')[0];

    dialog.cancel = () => ({ state: 'previewing', outcome: 'rollback-pending' });
    assert.equal(controller.cancelPreview(), false);
    assert.equal(env.activeElements('sn-theme-import-dialog').length, 1);

    dialog.cancel = () => ({ state: 'finalizing' });
    assert.equal(controller.cancelPreview(), false);
    assert.equal(env.activeElements('sn-theme-import-dialog').length, 1);

    dialog.cancel = () => { throw new Error('cancel threw'); };
    assert.equal(controller.cancelPreview(), false);
    assert.equal(env.activeElements('sn-theme-import-dialog').length, 1);

    controller.destroy();
  } finally {
    env.teardown();
  }
});
