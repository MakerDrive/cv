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
import { coordinatePortfolioShowOverlays } from '../../src/static-pages/js/showOverlayCoordinator.js';
import { resolveVisibleShowPlayer } from '../../src/static-pages/js/showPlayerResolver.js';

import {
  createCvShowCompositionTimeline,
  cvShowGlobalTimeOf,
  resolveCvShowCompositionAt,
} from '../../src/static-pages/js/tour-player/compositionTime.js';
import { CV_SHOW_SCHEDULE_DURATIONS } from '../../src/static-pages/data/cvShowScheduleDurations.js';
import { CV_SHOW_PRESENTATION_PROJECT } from '../../src/static-pages/data/cvShowPresentationProject.js';
import { projectCvShowStory } from '../../src/static-pages/js/tour-player/presentationProjectAdapter.js';

// Two-scene fixture story with a detail branch. Durations come from the
// generated release table — these ids are real authored entries.
const fixtureStory = Object.freeze({
  short: ['positioning', 'symbiote-workspace'],
  scenes: Object.freeze([
    { id: 'positioning' },
    { id: 'symbiote-workspace', branchId: 'workspace-details' },
  ]),
  branches: Object.freeze({
    'workspace-details': { id: 'workspace-details', sceneId: 'symbiote-workspace' },
  }),
});
const TIMELINE = createCvShowCompositionTimeline(fixtureStory);
const policy = Object.freeze({
  timeline: TIMELINE,
});

const POSITIONING_MS = CV_SHOW_SCHEDULE_DURATIONS.durations.positioning;
const WORKSPACE_MS = CV_SHOW_SCHEDULE_DURATIONS.durations['symbiote-workspace'];

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
  assert.equal(showUrl.searchParams.has('showEntry'), false, 'canonical start URL names no entry');
  assert.equal(showUrl.searchParams.has('showTime'), false, 'start at global 0 is implicit');
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

test('header CV Show activation requests the positioning Short Show directly', async () => {
  const source = await readFile(
    new URL('../../src/static-pages/js/index.js', import.meta.url),
    'utf8',
  );
  const branch = source.match(
    /if \(target instanceof Element && target\.closest\('\.pulse-tour-button'\)\) \{[\s\S]*?\n  \}/u,
  )?.[0];
  assert.ok(branch, 'header CV Show click branch');
  assert.match(branch, /new CustomEvent\('portfolio-open-tour'/u);
  assert.match(branch, /entryId: 'positioning'/u);
  assert.match(branch, /source: 'portfolio-header'/u);
});

test('header Show activation coordinates native overlays before opening the player', async () => {
  const tourSource = await readFile(
    new URL('../../src/static-pages/js/tour-player/index.js', import.meta.url),
    'utf8',
  );
  const hostSource = await readFile(
    new URL('../../src/static-pages/js/index.js', import.meta.url),
    'utf8',
  );
  assert.match(tourSource, /portfolio-show-overlay-coordinate/u);
  assert.match(tourSource, /action: 'prepare-show'/u);
  assert.match(hostSource, /portfolio-show-overlay-coordinate/u);
  const calls = [];
  const layout = { closeDrawer: (dock) => calls.push(['inner-drawer', dock]) };
  const outerLayout = { closeDrawer: (dock) => calls.push(['outer-drawer', dock]) };
  const dock = { close: (source) => calls.push(['dock', source]) };
  coordinatePortfolioShowOverlays({ layout, outerLayout, dock });
  assert.deepEqual(calls, [
    ['outer-drawer', 'all'],
    ['inner-drawer', 'all'],
    ['dock', 'show-overlay-coordinate'],
  ], 'all overlays close before Show opens');
});

test('visible player resolver follows the stable player across host reparenting', () => {
  const hiddenPlayer = {
    isConnected: true,
    getBoundingClientRect: () => ({ width: 0, height: 0 }),
  };
  const visiblePlayer = {
    isConnected: true,
    getBoundingClientRect: () => ({ width: 320, height: 120 }),
  };
  const chat = { getShowPlayer: () => hiddenPlayer };
  const workspace = {
    querySelector: (selector) => selector.includes('agent-show-chat') ? chat : null,
    querySelectorAll: () => [hiddenPlayer, visiblePlayer],
  };
  const documentRef = { defaultView: { getComputedStyle: () => ({ display: 'grid', visibility: 'visible' }) } };
  assert.equal(resolveVisibleShowPlayer(workspace, { document: documentRef }), visiblePlayer);
  visiblePlayer.getBoundingClientRect = () => ({ width: 0, height: 0 });
  assert.equal(resolveVisibleShowPlayer(workspace, { document: documentRef }), null);
  hiddenPlayer.getBoundingClientRect = () => ({ width: 320, height: 120 });
  assert.equal(resolveVisibleShowPlayer(workspace, { document: documentRef }), hiddenPlayer);
});

test('CV Show route round-trips semantic state and preserves unrelated URL state', () => {
  const globalT = POSITIONING_MS + 24_000; // 24s into symbiote-workspace
  const source = new URL(
    'https://portfolio.example/cv/projects/symbiote-workspace/'
      + '?lang=ru&mode=structured&sn-theme=cascade'
      + `&showMode=short&showTime=${globalT}&showPlay=1`
      + '#media-workspace',
  );
  const parsed = parseCvShowRoute(source, policy);
  assert.equal(parsed.status, 'valid');
  assert.deepEqual(parsed.state, {
    mode: 'short',
    entryId: 'symbiote-workspace',   // DERIVED from the global time
    detailId: '',
    localMs: 24_000,                  // DERIVED local media time
    timeMs: globalT,
    play: true,
    completed: false,
  });

  const serialized = serializeCvShowRoute(source, parsed.state, policy);
  assert.equal(serialized.searchParams.get('lang'), 'ru');
  assert.equal(serialized.searchParams.get('mode'), 'structured');
  assert.equal(serialized.searchParams.get('sn-theme'), 'cascade');
  assert.equal(serialized.hash, '#media-workspace');
  assert.equal(serialized.searchParams.get('showMode'), 'short');
  assert.equal(serialized.searchParams.has('showEntry'), false, 'entry must never be written');
  assert.equal(serialized.searchParams.has('showDetail'), false, 'detail must never be written');
  assert.equal(serialized.searchParams.get('showTime'), String(globalT), 'global time only');
  assert.equal(serialized.searchParams.has('showPlay'), false, 'default play intent is canonicalized away');
});

test('ONE master composition geometry: T resolves identically regardless of playback policy', () => {
  // showMode is traversal policy, not timeline identity: the same global T
  // must resolve to the same entry/segment for every playback policy. The
  // master layout interleaves each scene with its detail branch at fixed
  // coordinates; short/full playback never relocates them.
  const tBranch = cvShowGlobalTimeOf(TIMELINE, 'workspace-details', 12_000);
  const first = resolveCvShowCompositionAt(TIMELINE, tBranch);
  const second = resolveCvShowCompositionAt(TIMELINE, tBranch);
  assert.deepEqual(
    { entryId: first.entryId, localMs: first.localMs, branch: first.branch },
    { entryId: second.entryId, localMs: second.localMs, branch: second.branch },
  );
  assert.equal(first.branch, true, 'detail segment keeps its global position');

  const tScene = cvShowGlobalTimeOf(TIMELINE, 'symbiote-workspace', 5_000);
  const scene = resolveCvShowCompositionAt(TIMELINE, tScene);
  assert.equal(scene.entryId, 'symbiote-workspace');
  assert.equal(scene.localMs, 5_000);
});

test('global composition time boundary semantics use [start, end) consistently', () => {
  const atStart = resolveCvShowCompositionAt(TIMELINE, TIMELINE.segments[1].startMs);
  assert.equal(atStart.entryId, TIMELINE.segments[1].id);
  assert.equal(atStart.localMs, 0);

  const before = resolveCvShowCompositionAt(TIMELINE, TIMELINE.segments[1].startMs - 1);
  assert.equal(before.entryId, TIMELINE.segments[0].id);
  assert.equal(before.localMs, TIMELINE.segments[0].durationMs - 1);

  const atEnd = resolveCvShowCompositionAt(TIMELINE, TIMELINE.totalMs);
  assert.equal(atEnd.completed, true);

  assert.equal(resolveCvShowCompositionAt(TIMELINE, -5).globalTimeMs, 0);
  for (const bad of ['abc', '1.5', '-4']) {
    assert.equal(
      parseCvShowRoute(`https://portfolio.example/cv/?showMode=short&showTime=${bad}`, policy).reason,
      'invalid-time',
      bad,
    );
  }
});

test('CV Show resolver derives entry and local time from the global coordinate', () => {
  // T inside entry 1, entry 2 and the branch appended after the finale.
  const first = resolveCvShowCompositionAt(TIMELINE, 5_000);
  assert.equal(first.entryId, 'positioning');
  assert.equal(first.localMs, 5_000);
  assert.equal(first.branch, false);

  const second = resolveCvShowCompositionAt(TIMELINE, POSITIONING_MS + 2_000);
  assert.equal(second.entryId, 'symbiote-workspace');
  assert.equal(second.localMs, 2_000);
  assert.equal(second.branch, false);

  const branch = resolveCvShowCompositionAt(TIMELINE, POSITIONING_MS + WORKSPACE_MS + 3_000);
  assert.equal(branch.entryId, 'workspace-details');
  assert.equal(branch.detailId, 'workspace-details');
  assert.equal(branch.localMs, 3_000);
  assert.equal(branch.branch, true, 'detail is a composition segment appended after the finale');

  // Global time past the end clamps to the last segment.
  const end = resolveCvShowCompositionAt(TIMELINE, TIMELINE.totalMs + 10_000);
  assert.equal(end.completed, true);
  assert.equal(end.entryId, 'workspace-details');
});

test('seek and route restore resolve identical composition state from the same T', () => {
  const t = POSITIONING_MS + WORKSPACE_MS + 12_345;
  // The parse path (route restore) uses resolveCvShowCompositionAt; any seek
  // implementation consuming the same resolver yields identical state.
  const fromRoute = parseCvShowRoute(
    `https://portfolio.example/cv/?showMode=short&showTime=${t}`,
    policy,
  ).state;
  const fromSeek = resolveCvShowCompositionAt(TIMELINE, t);
  assert.equal(fromRoute.entryId, fromSeek.entryId);
  assert.equal(fromRoute.localMs, fromSeek.localMs);
  assert.equal(fromRoute.detailId, fromSeek.detailId);
  assert.equal(fromRoute.timeMs, t);
});

test('legacy entry+local-time URLs convert to the canonical global coordinate', () => {
  const legacy = parseCvShowRoute(
    'https://portfolio.example/cv/?showMode=short&showEntry=symbiote-workspace&showTime=12000',
    policy,
  );
  assert.equal(legacy.status, 'valid');
  assert.equal(legacy.legacy, true);
  assert.equal(legacy.state.timeMs, POSITIONING_MS + 12_000, 'global = entry start + local');
  assert.equal(legacy.state.entryId, 'symbiote-workspace');
  assert.equal(legacy.state.localMs, 12_000);

  const rewritten = canonicalizeCvShowRoute(
    'https://portfolio.example/cv/?showMode=short&showEntry=symbiote-workspace&showTime=12000',
    policy,
  );
  assert.equal(rewritten.changed, true, 'legacy link is rewritten to the canonical URL');
  assert.equal(rewritten.url.searchParams.get('showTime'), String(POSITIONING_MS + 12_000));
  assert.equal(rewritten.url.searchParams.has('showEntry'), false);
});

test('legacy detail deep links resolve onto the appended branch segment', () => {
  const legacy = parseCvShowRoute(
    'https://portfolio.example/cv/?showMode=short&showEntry=symbiote-workspace'
      + '&showDetail=workspace-details&showTime=9000',
    policy,
  );
  assert.equal(legacy.status, 'valid');
  assert.equal(legacy.state.detailId, 'workspace-details');
  assert.equal(
    legacy.state.timeMs,
    POSITIONING_MS + WORKSPACE_MS + 9_000,
    'branch global position = end of main composition + local detail time',
  );
});

test('source media time is derived from the global composition position', () => {
  const resolved = resolveCvShowCompositionAt(TIMELINE, POSITIONING_MS + 41_000);
  assert.equal(resolved.entryId, 'symbiote-workspace');
  assert.equal(resolved.localMs, 41_000, 'local media position is pure arithmetic, not a route field');
});

test('CV Show route rejects invalid semantic state and strips only Show parameters', () => {
  const cases = [
    ['invalid-mode', 'showMode=preview&showTime=100'],
    ['invalid-time', 'showMode=short&showTime=-1'],
    ['invalid-time', 'showMode=short&showTime=1.5'],
    ['detail-requires-short-mode', 'showMode=full&showEntry=symbiote-workspace&showDetail=workspace-details&showTime=100'],
    ['invalid-play-intent', 'showMode=short&showPlay=yes'],
    ['duplicate-parameter', 'showMode=short&showMode=full&showTime=100'],
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

test('CV Show route clamps global time to the composition total', () => {
  const oversized = canonicalizeCvShowRoute(
    `https://portfolio.example/cv/?showMode=short&showTime=${TIMELINE.totalMs + 999_999}`,
    policy,
  );
  assert.equal(oversized.status, 'valid');
  assert.equal(oversized.state.timeMs, TIMELINE.totalMs, 'global time clamps to totalMs');
  assert.equal(oversized.url.searchParams.get('showTime'), String(TIMELINE.totalMs));
  assert.equal(oversized.state.completed, false);
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

  // Canonical URL after popstate: the legacy finale link is converted to its
  // global composition coordinate (finale scene start + local 5000ms).
  const realStory = projectCvShowStory(CV_SHOW_PRESENTATION_PROJECT);
  const realShort = createCvShowCompositionTimeline(realStory);
  const finaleGlobal = cvShowGlobalTimeOf(realShort, 'finale', 5_000);
  const positioningGlobal = cvShowGlobalTimeOf(realShort, 'positioning', 0);

  currentUrl = new URL(
    `https://portfolio.example/cv/?lang=ru&showMode=short&showTime=${finaleGlobal}&showPlay=0#profile`,
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
    timeMs: positioningGlobal,
    play: false,
    running: true,
    completed: false,
  };
  chat.dispatchEvent(new CustomEvent('portfolio-show-route-change', {
    bubbles: true,
    detail: { state: chat.routeSnapshot },
  }));
  assert.equal(
    currentUrl.searchParams.get('showTime'),
    String(finaleGlobal),
    'user route waits until the older deeplink operation is fully idle (URL keeps the older global time)',
  );
  settleRouteApply(true);
  await Promise.resolve();
  await Promise.resolve();
  await Promise.resolve();
  assert.equal(currentUrl.searchParams.has('showEntry'), false, 'canonical URL never names an entry');
  assert.equal(currentUrl.searchParams.has('showDetail'), false, 'canonical URL never names a branch');
  assert.equal(currentUrl.searchParams.has('showTime'), false, 'global time 0 is implicit in the canonical form');
  assert.equal(currentUrl.searchParams.get('showPlay'), '0');

  // Natural completion publishes the same first paused checkpoint that remains
  // mounted in the UI. Keeping it in the URL makes reload and reconciliation
  // deterministic without retaining the terminal finale route.
  currentUrl = new URL(
    'https://portfolio.example/cv/?lang=ru&showMode=short&showEntry=finale&showTime=2345#profile',
  );
  chat.routeSnapshot = {
    mode: 'short',
    entryId: 'positioning',
    detailId: '',
    timeMs: positioningGlobal,
    play: false,
    running: true,
    completed: false,
  };
  chat.dispatchEvent(new CustomEvent('portfolio-show-complete', {
    bubbles: true,
    detail: {
      reason: 'natural-end',
      routeState: {
        ...chat.routeSnapshot,
        completed: true,
      },
    },
  }));
  await Promise.resolve();
  assert.equal(currentUrl.searchParams.has('showEntry'), false, 'canonical completion URL names no entry');
  assert.equal(currentUrl.searchParams.get('showPlay'), '0');
  assert.equal(currentUrl.searchParams.has('showTime'), false,
    'natural completion at the composition origin keeps t implicit');
  assert.deepEqual(selections, [], 'natural completion keeps the current player surface');

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
  assert.equal(currentUrl.searchParams.has('showEntry'), false, 'completed Show clears the replayable route');
  assert.equal(currentUrl.searchParams.has('showPlay'), false, 'completed Show clears the replayable play flag');
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

const REAL_STORY = projectCvShowStory(CV_SHOW_PRESENTATION_PROJECT);

test('generated durations match the master story exactly (stale schedule cannot slip silently)', () => {
  const timeline = createCvShowCompositionTimeline(REAL_STORY);
  const durationIds = Object.keys(CV_SHOW_SCHEDULE_DURATIONS.durations).sort();
  const segmentIds = timeline.segments.map(({ id }) => id).sort();
  assert.deepEqual(segmentIds, durationIds, 'every segment has a duration and vice versa');
  assert.equal(new Set(segmentIds).size, segmentIds.length, 'segment ids are unique');
  for (const [index, segment] of timeline.segments.entries()) {
    assert.ok(Number.isSafeInteger(segment.durationMs) && segment.durationMs > 0, segment.id);
    if (index > 0) {
      assert.equal(segment.startMs, timeline.segments[index - 1].endMs, `contiguous at ${segment.id}`);
    }
  }
  const branches = Object.keys(REAL_STORY.branches);
  const branchIds = timeline.segments.filter(({ branch }) => branch).map(({ id }) => id);
  assert.deepEqual(branchIds.sort(), branches.slice().sort());
  assert.equal(timeline.segments.length, durationIds.length);
});

test('short policy deep link into EVERY detail branch opens exactly that branch', () => {
  const timeline = createCvShowCompositionTimeline(REAL_STORY);
  for (const branchId of Object.keys(REAL_STORY.branches)) {
    const t = cvShowGlobalTimeOf(timeline, branchId, 1_000);
    const parsed = parseCvShowRoute(
      `https://portfolio.example/cv/?showMode=short&showTime=${t}`,
      { timeline },
    );
    assert.equal(parsed.status, 'valid', branchId);
    assert.equal(parsed.state.detailId, branchId, `${branchId}: T inside the branch resolves the branch`);
    assert.equal(parsed.state.localMs, 1_000, branchId);
    assert.equal(parsed.state.timeMs, t, branchId);
    // canonical round-trip never reintroduces legacy parameters
    const url = serializeCvShowRoute('https://portfolio.example/cv/', parsed.state, {});
    assert.equal(url.searchParams.has('showEntry'), false, branchId);
    assert.equal(url.searchParams.has('showDetail'), false, branchId);
  }
});

test('showCompleted never enters the canonical URL writer', () => {
  const url = serializeCvShowRoute('https://portfolio.example/cv/', {
    mode: 'short',
    timeMs: cvShowGlobalTimeOf(TIMELINE, 'symbiote-workspace', 100),
    play: false,
    completed: true,
  });
  assert.equal(url.searchParams.has('showCompleted'), false,
    'terminal session state must not become a shareable URL coordinate');
});

test('canonical numeric semantics: negative clamps to 0, fractions/or junk are rejected', () => {
  // Negative timeMs is rejected by the non-negative integer grammar and
  // normalised by the resolver as extra safety.
  assert.equal(resolveCvShowCompositionAt(TIMELINE, -1).globalTimeMs, 0);
  assert.equal(resolveCvShowCompositionAt(TIMELINE, Number.NaN).globalTimeMs, 0);
  assert.equal(resolveCvShowCompositionAt(TIMELINE, Number.POSITIVE_INFINITY).branch, true,
    'non-finite input resolves deterministically (clamped to the final segment)');
  // The writer canonicalizes fractional ms to an integer coordinate.
  const url = serializeCvShowRoute('https://portfolio.example/cv/', {
    mode: 'short',
    timeMs: 12_345.7,
    play: true,
  });
  assert.equal(url.searchParams.get('showTime'), '12346');
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
