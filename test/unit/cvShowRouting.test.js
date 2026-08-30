import { readFile } from 'node:fs/promises';
import test from 'node:test';
import assert from 'node:assert/strict';
import { parseHTML } from 'linkedom';
import {
  canonicalizeCvShowRoute,
  createCvShowRouteRequestCoordinator,
  createCvShowSceneRouteMap,
  parseCvShowRoute,
  resolveCvShowEntryForPortfolioRoute,
  serializeCvShowRoute,
  stripCvShowRoute,
} from '../../src/static-pages/js/tour-player/routing.js';
import { shouldHandleInAppActivation } from '../../src/static-pages/js/portfolioPulseRuntime.js';

const policy = Object.freeze({
  entryIdsByMode: Object.freeze({
    short: new Set(['positioning', 'symbiote-workspace']),
    full: new Set(['positioning', 'symbiote-workspace', 'workspace-details']),
  }),
  detailParents: Object.freeze({
    'workspace-details': 'symbiote-workspace',
  }),
  getDurationMs: ({ entryId, detailId }) => ({
    positioning: 48_000,
    'symbiote-workspace': 61_000,
    'workspace-details': 37_930,
  })[detailId || entryId],
});

async function loadCvShowStartHrefFactory(locationHref, basePath) {
  const source = await readFile(
    new URL('../../src/static-pages/js/index.js', import.meta.url),
    'utf8',
  );
  const declaration = source.match(/function getCvShowStartHref\(\) \{[\s\S]*?\n\}/u)?.[0];
  assert.ok(declaration, 'getCvShowStartHref declaration');
  return Function(
    'location',
    'getPortfolioBasePath',
    `"use strict"; ${declaration}; return getCvShowStartHref;`,
  )(new URL(locationHref), () => basePath);
}

async function loadCvShowStartActivationPolicy() {
  const source = await readFile(
    new URL('../../src/static-pages/js/index.js', import.meta.url),
    'utf8',
  );
  const declaration = source.match(
    /function shouldHandleCvShowStartActivation\(event, anchor, options = \{\}\) \{[\s\S]*?\n\}/u,
  )?.[0];
  assert.ok(declaration, 'shouldHandleCvShowStartActivation declaration');
  return Function(
    `"use strict"; ${declaration}; return shouldHandleCvShowStartActivation;`,
  )();
}

function createPrimaryClick(window, modifiers = {}) {
  const event = new window.Event('click', { bubbles: true, cancelable: true });
  for (const [name, value] of Object.entries({
    button: 0,
    metaKey: false,
    ctrlKey: false,
    shiftKey: false,
    altKey: false,
    ...modifiers,
  })) {
    Object.defineProperty(event, name, { value });
  }
  return event;
}

test('profile CV Show link starts in the current document while preserving native share affordances', async () => {
  const getCvShowStartHref = await loadCvShowStartHrefFactory(
    'https://portfolio.example/cv/profile/photo/?lang=ru&mode=structured#profile',
    '/cv/',
  );
  const href = getCvShowStartHref();
  const showUrl = new URL(href, 'https://portfolio.example');
  assert.equal(showUrl.searchParams.get('showMode'), 'short');
  assert.equal(showUrl.searchParams.get('showEntry'), 'positioning');
  assert.equal(showUrl.searchParams.get('lang'), 'ru');
  assert.equal(showUrl.searchParams.get('mode'), 'structured');
  assert.equal(showUrl.hash, '#profile');

  const shouldHandleCvShowStartActivation = await loadCvShowStartActivationPolicy();

  const { window, document } = parseHTML('<!doctype html><html><body></body></html>');
  const entries = new Map([
    ['profile/photo', {}],
    ['projects/agent-portal', {}],
  ]);
  const selected = [];
  const opened = [];
  document.addEventListener('portfolio-open-tour', (event) => {
    opened.push(event.detail?.entryId);
  });
  document.addEventListener('click', (event) => {
    const path = event.composedPath();
    const anchor = path.find((element) => element instanceof window.HTMLAnchorElement);
    if (!anchor) return;
    if (shouldHandleCvShowStartActivation(event, anchor, {
      currentUrl: 'https://portfolio.example/cv/profile/photo/?lang=ru&mode=structured#profile',
      basePath: '/cv/',
    })) {
      event.preventDefault();
      document.dispatchEvent(new window.CustomEvent('portfolio-open-tour', {
        detail: { entryId: 'positioning', source: 'cv-presentation-link' },
      }));
      return;
    }
    const targetId = shouldHandleInAppActivation(event, anchor, {
      entries,
      basePath: '/cv/',
    });
    if (!targetId || !entries.has(targetId)) return;
    event.preventDefault();
    if (anchor.getAttribute('target') === '_blank') anchor.removeAttribute('target');
    selected.push(targetId);
  }, true);

  const showLink = document.createElement('a');
  showLink.setAttribute('href', href);
  showLink.setAttribute('target', '_blank');
  showLink.innerHTML = '<span>View the CV presentation</span>';
  document.body.append(showLink);

  const showClick = createPrimaryClick(window);
  showLink.firstElementChild.dispatchEvent(showClick);
  assert.equal(showClick.defaultPrevented, true, 'ordinary activation stays in the live document');
  assert.equal(showLink.getAttribute('target'), '_blank', 'the shareable href keeps its new-tab affordance');
  assert.deepEqual(opened, ['positioning']);
  assert.deepEqual(selected, []);

  const modifiedShowClick = createPrimaryClick(window, { metaKey: true });
  showLink.firstElementChild.dispatchEvent(modifiedShowClick);
  assert.equal(modifiedShowClick.defaultPrevented, false, 'modified activation remains native');
  assert.deepEqual(opened, ['positioning']);

  const articleLink = document.createElement('a');
  articleLink.setAttribute('href', 'projects/agent-portal/?lang=ru');
  document.body.append(articleLink);
  const articleClick = createPrimaryClick(window);
  articleLink.dispatchEvent(articleClick);
  assert.equal(articleClick.defaultPrevented, true, 'ordinary article links still use SPA navigation');
  assert.deepEqual(selected, ['projects/agent-portal']);

  const modifiedArticleClick = createPrimaryClick(window, { metaKey: true });
  articleLink.dispatchEvent(modifiedArticleClick);
  assert.equal(modifiedArticleClick.defaultPrevented, false, 'modified clicks stay native');
  assert.deepEqual(selected, ['projects/agent-portal']);
});

test('CV Show route round-trips semantic state and preserves unrelated URL state', () => {
  const source = new URL(
    'https://portfolio.example/cv/projects/symbiote-workspace/'
      + '?lang=ru&mode=structured&sn-theme=cascade'
      + '&showMode=short&showEntry=symbiote-workspace&showTime=24000&showPlay=1'
      + '#media-workspace',
  );
  const parsed = parseCvShowRoute(source, policy);
  assert.equal(parsed.status, 'valid');
  assert.deepEqual(parsed.state, {
    mode: 'short',
    entryId: 'symbiote-workspace',
    timeMs: 24_000,
    detailId: '',
    play: true,
  });

  const serialized = serializeCvShowRoute(source, parsed.state, policy);
  assert.equal(serialized.searchParams.get('lang'), 'ru');
  assert.equal(serialized.searchParams.get('mode'), 'structured');
  assert.equal(serialized.searchParams.get('sn-theme'), 'cascade');
  assert.equal(serialized.hash, '#media-workspace');
  assert.equal(serialized.searchParams.get('showMode'), 'short');
  assert.equal(serialized.searchParams.get('showEntry'), 'symbiote-workspace');
  assert.equal(serialized.searchParams.get('showTime'), '24000');
  assert.equal(serialized.searchParams.has('showPlay'), false, 'default play intent is canonicalized away');
});

test('CV Show route supports short detail and full inline-detail links', () => {
  const short = parseCvShowRoute(
    'https://portfolio.example/cv/projects/symbiote-workspace/'
      + '?lang=ru&showMode=short&showEntry=symbiote-workspace'
      + '&showDetail=workspace-details&showTime=12000&showPlay=1',
    policy,
  );
  assert.deepEqual(short.state, {
    mode: 'short',
    entryId: 'symbiote-workspace',
    timeMs: 12_000,
    detailId: 'workspace-details',
    play: true,
  });

  const full = parseCvShowRoute(
    'https://portfolio.example/cv/?lang=ru&showMode=full'
      + '&showEntry=workspace-details&showTime=9000&showPlay=0',
    policy,
  );
  assert.deepEqual(full.state, {
    mode: 'full',
    entryId: 'workspace-details',
    timeMs: 9_000,
    detailId: '',
    play: false,
  });
});

test('CV Show route rejects invalid semantic state and strips only Show parameters', () => {
  const cases = [
    ['invalid-mode', 'showMode=preview&showEntry=positioning'],
    ['invalid-entry', 'showMode=short&showEntry=unknown'],
    ['invalid-time', 'showMode=short&showEntry=positioning&showTime=-1'],
    ['invalid-time', 'showMode=short&showEntry=positioning&showTime=1.5'],
    ['invalid-detail', 'showMode=short&showEntry=positioning&showDetail=workspace-details'],
    ['detail-requires-short-mode', 'showMode=full&showEntry=workspace-details&showDetail=workspace-details'],
    ['invalid-play-intent', 'showMode=short&showEntry=positioning&showPlay=yes'],
    ['duplicate-parameter', 'showMode=short&showMode=full&showEntry=positioning'],
    ['invalid-mode', 'showEntry=positioning'],
  ];

  for (const [reason, showQuery] of cases) {
    const result = canonicalizeCvShowRoute(
      `https://portfolio.example/cv/?lang=ru&mode=structured&${showQuery}#profile`,
      policy,
    );
    assert.equal(result.status, 'invalid', showQuery);
    assert.equal(result.reason, reason, showQuery);
    assert.equal(result.shouldStrip, true, showQuery);
    assert.equal(result.url.searchParams.get('lang'), 'ru', showQuery);
    assert.equal(result.url.searchParams.get('mode'), 'structured', showQuery);
    assert.equal(result.url.hash, '#profile', showQuery);
    assert.equal(
      [...result.url.searchParams.keys()].some((name) => name.startsWith('show')),
      false,
      showQuery,
    );
  }
});

test('CV Show route clamps time to caller-provided authoritative duration', () => {
  const scene = canonicalizeCvShowRoute(
    'https://portfolio.example/cv/?showMode=short&showEntry=positioning&showTime=999999',
    policy,
  );
  assert.equal(scene.status, 'valid');
  assert.equal(scene.state.timeMs, 48_000);
  assert.equal(scene.url.searchParams.get('showTime'), '48000');

  const detail = canonicalizeCvShowRoute(
    'https://portfolio.example/cv/?showMode=short&showEntry=symbiote-workspace'
      + '&showDetail=workspace-details&showTime=999999',
    policy,
  );
  assert.equal(detail.state.timeMs, 37_930);
  assert.equal(detail.url.searchParams.get('showTime'), '37930');
});

test('stripCvShowRoute keeps locale, layout, theme and hash byte-semantically intact', () => {
  const stripped = stripCvShowRoute(
    'https://portfolio.example/cv/?lang=ru&mode=flat&theme=dark'
      + '&showMode=short&showEntry=positioning&showTime=0&showPlay=1#photo',
  );
  assert.equal(stripped.search, '?lang=ru&mode=flat&theme=dark');
  assert.equal(stripped.hash, '#photo');
});

test('overlapping Show route applications publish only the latest request', async () => {
  const coordinator = createCvShowRouteRequestCoordinator();
  let releaseFirst;
  const firstBarrier = new Promise((resolve) => { releaseFirst = resolve; });
  const first = coordinator.run(async () => {
    await firstBarrier;
    return 'first';
  });
  const second = coordinator.run(async () => 'second');

  assert.equal(coordinator.applying, true);
  assert.equal(await second, 'second');
  assert.equal(coordinator.applying, true, 'the older request is still settling');
  releaseFirst();
  assert.equal(await first, false, 'the superseded request cannot publish success');
  assert.equal(coordinator.applying, false);
});

test('CV Show host strips an early Stop after route preparation and cancels stale writes', async (t) => {
  const { window, document } = parseHTML('<!doctype html><html lang="en"><body></body></html>');
  const globalKeys = [
    'window',
    'document',
    'customElements',
    'HTMLElement',
    'CustomEvent',
    'Event',
    'Node',
    'Element',
    'DOMParser',
    'MutationObserver',
    'DocumentFragment',
    'CSSStyleSheet',
    'location',
    'history',
    'requestAnimationFrame',
    'cancelAnimationFrame',
    'setTimeout',
    'clearTimeout',
    'addEventListener',
    'removeEventListener',
    'dispatchEvent',
  ];
  const previousGlobals = new Map(globalKeys.map((key) => (
    [key, Object.getOwnPropertyDescriptor(globalThis, key)]
  )));
  let dispose = () => {};
  for (const key of globalKeys.slice(0, 10)) globalThis[key] = window[key];
  globalThis.CSSStyleSheet = class CSSStyleSheet {
    replaceSync() {}
  };
  let currentUrl = new URL('https://portfolio.example/cv/?lang=ru#profile');
  Object.defineProperty(globalThis, 'location', {
    configurable: true,
    get: () => currentUrl,
  });
  globalThis.history = {
    state: null,
    replaceState(state, _title, href) {
      this.state = state;
      currentUrl = new URL(href, currentUrl);
    },
    pushState(state, _title, href) {
      this.state = state;
      currentUrl = new URL(href, currentUrl);
    },
  };
  globalThis.requestAnimationFrame = (callback) => {
    callback(0);
    return 1;
  };
  globalThis.cancelAnimationFrame = () => {};
  globalThis.addEventListener = window.addEventListener.bind(window);
  globalThis.removeEventListener = window.removeEventListener.bind(window);
  globalThis.dispatchEvent = window.dispatchEvent.bind(window);
  t.after(() => {
    dispose();
    for (const [key, descriptor] of previousGlobals) {
      if (descriptor) Object.defineProperty(globalThis, key, descriptor);
      else delete globalThis[key];
    }
  });

  const { installPortfolioTour } = await import(
    '../../src/static-pages/js/tour-player/index.js?queued-route-stop-test'
  );
  const workspace = document.createElement('main');
  const dock = document.createElement('div');
  const chat = document.createElement('div');
  dock.append(chat);
  workspace.append(dock);
  document.body.append(workspace);
  const querySelector = workspace.querySelector.bind(workspace);
  workspace.querySelector = (selector) => {
    if (selector === 'agent-dock-shell') return dock;
    if (selector === 'portfolio-show-chat') return chat;
    return querySelector(selector);
  };
  chat.routeSnapshot = { running: false };
  const selections = [];
  const runtime = {
    selectedId: 'profile/photo',
    entries: new Map([
      ['profile/photo', { focusIds: [] }],
      ['projects/other', { focusIds: [] }],
    ]),
    select(entryId, options) {
      this.selectedId = entryId;
      selections.push({ entryId, options });
    },
  };
  dispose = installPortfolioTour({ workspace, runtime, title: 'CV Show' });
  await Promise.resolve();

  const routeStopReasons = [];
  chat.stopShow = ({ reason = '' } = {}) => routeStopReasons.push(reason);
  let settleRouteApply;
  chat.applyShowRoute = () => new Promise((resolve) => {
    settleRouteApply = resolve;
  });

  currentUrl = new URL(
    'https://portfolio.example/cv/?lang=ru&showMode=short&showEntry=symbiote-ui'
      + '&showTime=2345#profile',
  );
  chat.routeSnapshot = {
    mode: 'short',
    entryId: 'symbiote-ui',
    detailId: '',
    timeMs: 2_345,
    play: true,
    running: false,
    completed: false,
  };
  globalThis.dispatchEvent(new window.Event('popstate'));
  await Promise.resolve();
  await Promise.resolve();
  assert.equal(typeof settleRouteApply, 'function');
  chat.routeSnapshot = {
    mode: '',
    entryId: '',
    detailId: '',
    timeMs: 0,
    play: false,
    running: false,
    completed: false,
  };
  chat.dispatchEvent(new CustomEvent('portfolio-show-route-change', {
    bubbles: true,
    detail: { state: chat.routeSnapshot },
  }));
  chat.dispatchEvent(new CustomEvent('portfolio-show-stop', {
    bubbles: true,
    detail: {
      reason: 'explicit',
      routeState: {
        mode: 'short',
        entryId: 'symbiote-ui',
        detailId: '',
        timeMs: 2_345,
        play: false,
        running: false,
        completed: false,
      },
    },
  }));
  settleRouteApply(false);
  await Promise.resolve();
  await Promise.resolve();
  await Promise.resolve();
  assert.equal(
    [...currentUrl.searchParams.keys()].some((name) => name.startsWith('show')),
    false,
    'Stop during route preparation must strip the deeplink after the request becomes idle',
  );
  routeStopReasons.length = 0;
  settleRouteApply = undefined;

  currentUrl = new URL(
    'https://portfolio.example/cv/?lang=ru&showMode=short&showEntry=finale'
      + '&showTime=5000&showPlay=0#profile',
  );
  chat.routeSnapshot = {
    mode: 'short',
    entryId: 'finale',
    detailId: '',
    timeMs: 5_000,
    play: false,
    running: true,
    completed: false,
  };
  globalThis.dispatchEvent(new window.Event('popstate'));
  await Promise.resolve();
  assert.deepEqual(
    routeStopReasons,
    ['route-popstate-replace'],
    'popstate must invalidate the currently preparing Show transport, not only its result',
  );
  await Promise.resolve();
  await Promise.resolve();

  assert.equal(typeof settleRouteApply, 'function', 'the deeplink application remains in flight');
  chat.routeSnapshot = {
    mode: 'short',
    entryId: 'positioning',
    detailId: '',
    timeMs: 0,
    play: false,
    running: true,
    completed: false,
  };
  chat.dispatchEvent(new CustomEvent('portfolio-show-route-change', {
    bubbles: true,
    detail: { state: chat.routeSnapshot },
  }));
  assert.equal(
    currentUrl.searchParams.get('showEntry'),
    'finale',
    'user route waits until the older deeplink operation is fully idle',
  );
  settleRouteApply(true);
  await Promise.resolve();
  await Promise.resolve();
  await Promise.resolve();
  assert.equal(currentUrl.searchParams.get('showEntry'), 'positioning');
  assert.equal(currentUrl.searchParams.has('showTime'), false);
  assert.equal(currentUrl.searchParams.get('showPlay'), '0');

  chat.dispatchEvent(new CustomEvent('portfolio-show-start', { bubbles: true }));
  runtime.selectedId = 'projects/other';
  const terminalRouteState = {
    mode: 'short',
    entryId: 'symbiote-ui',
    detailId: '',
    timeMs: 0,
    play: false,
    running: true,
    completed: true,
  };
  chat.dispatchEvent(new CustomEvent('portfolio-show-complete', {
    bubbles: true,
    detail: { reason: 'explicit', routeState: terminalRouteState },
  }));
  chat.dispatchEvent(new CustomEvent('portfolio-show-complete', {
    bubbles: true,
    detail: { reason: 'explicit', routeState: terminalRouteState },
  }));
  assert.deepEqual(selections, [{
    entryId: 'profile/photo',
    options: { focus: true, updateUrl: false },
  }], 'the external Show lifecycle restores its origin exactly once');
  assert.equal(currentUrl.searchParams.get('showEntry'), 'symbiote-ui');
  assert.equal(currentUrl.searchParams.get('showPlay'), '0');
  chat.dispatchEvent(new CustomEvent('portfolio-show-stop', {
    bubbles: true,
    detail: { reason: 'explicit' },
  }));

  let timerId = 0;
  const pendingTimers = new Map();
  globalThis.setTimeout = (callback) => {
    const id = ++timerId;
    pendingTimers.set(id, callback);
    return id;
  };
  globalThis.clearTimeout = (id) => {
    pendingTimers.delete(id);
  };
  const emitRoute = (timeMs) => chat.dispatchEvent(new CustomEvent(
    'portfolio-show-route-change',
    {
      bubbles: true,
      detail: {
        state: {
          mode: 'short',
          entryId: 'positioning',
          detailId: '',
          timeMs,
          play: true,
        },
      },
    },
  ));

  emitRoute(100);
  assert.equal(currentUrl.searchParams.get('showTime'), '100');
  emitRoute(900);
  assert.equal(pendingTimers.size, 1, 'the second same-segment update is throttled');

  chat.dispatchEvent(new CustomEvent('portfolio-show-stop', {
    bubbles: true,
    detail: { reason: 'explicit' },
  }));
  for (const [id, callback] of [...pendingTimers]) {
    pendingTimers.delete(id);
    callback();
  }

  assert.equal(
    [...currentUrl.searchParams.keys()].some((name) => name.startsWith('show')),
    false,
    'a stopped Show cannot regain stale route parameters when the throttle window expires',
  );
  assert.equal(currentUrl.searchParams.get('lang'), 'ru');
  assert.equal(currentUrl.hash, '#profile');
});

test('scene route mapping uses durable navigate targets and explicit project ownership only', () => {
  const story = {
    scenes: [
      {
        id: 'positioning',
        title: 'Who I am',
        directives: [{ type: 'navigate', target: 'profile/photo' }],
      },
      {
        id: 'symbiote-workspace',
        title: 'Symbiote Workspace',
        directives: [{ type: 'navigate', target: 'projects/symbiote-workspace' }],
      },
    ],
  };
  assert.deepEqual([...createCvShowSceneRouteMap(story)], [
    ['profile/photo', 'positioning'],
    ['projects/symbiote-workspace', 'symbiote-workspace'],
  ]);
  assert.equal(resolveCvShowEntryForPortfolioRoute(story, '/profile/photo/'), 'positioning');
  assert.equal(
    resolveCvShowEntryForPortfolioRoute(story, 'pulse/workspace-update', {
      ownerProjectId: 'projects/symbiote-workspace',
    }),
    'symbiote-workspace',
  );
  assert.equal(resolveCvShowEntryForPortfolioRoute(story, 'Symbiote Workspace'), '');

  assert.throws(() => createCvShowSceneRouteMap({
    scenes: [
      { id: 'one', directives: [{ type: 'navigate', target: 'projects/shared' }] },
      { id: 'two', directives: [{ type: 'navigate', target: 'projects/shared' }] },
    ],
  }), /Ambiguous CV Show route target: projects\/shared/u);
});
