import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import {
  SHOW_ATTENTION_ADMISSION_VERSION,
  SHOW_ATTENTION_MILESTONE_VERSION,
  SHOW_ATTENTION_TERMINAL_VERSION,
  ShowAttentionController,
  ShowAudioArbiter,
  ShowSessionState,
} from 'symbiote-ui/chat/show-runtime';
import {
  PRESENTATION_EFFECT_ADMISSION_VERSION,
  PRESENTATION_EFFECT_RECEIPT_VERSION,
  createPresentationAlignedSequence,
  createPresentationAuthoringTimelineProjection,
  createPresentationExecutionController,
  createPresentationScheduleV2,
} from 'symbiote-workspace/browser';
import {
  TOUR_DETAIL_BRANCHES,
  TOUR_ATTENTION_TIMELINES,
  TOUR_RUNTIME_POLICY,
  TOUR_SCENES,
  TOUR_SHORT_SEQUENCE,
} from '../../src/static-pages/data/tourManifest.js';
import { CV_SHOW_STORY } from '../../src/static-pages/data/tourScripts.js';
import {
  CV_SHOW_AUDIO_RELEASE,
  CV_SHOW_PRESENTATION_PROJECT,
} from '../../src/static-pages/data/cvShowPresentationProject.js';
import { CV_SHOW_WEB_AUDIO_RELEASE } from '../../src/static-pages/data/cvShowWebAudioRelease.js';
import { CV_SHOW_SCHEDULE_DURATIONS } from '../../src/static-pages/data/cvShowScheduleDurations.js';
import {
  createCvShowAuthoringAuthority,
} from '../../src/static-pages/js/tour-player/cvShowAuthoringAuthority.js';
import {
  getCvShowRuntimeAuthority,
} from '../../src/static-pages/js/tour-player/cvShowRuntimeAuthority.js';
import {
  CV_SHOW_DIRECTIVE_TYPES,
  adaptCvShowDirective,
  createCvShowBranchReturnSnapshot,
  createCvShowDirectiveRunner,
  createCvShowRuntimeCleanup,
  runCvShowPresentationOperation,
  shouldInstantlySettleCvShowAttention,
  validateCvShowBranchReturnSnapshot,
} from '../../src/static-pages/js/tour-player/showAdapter.js';
import {
  activateCvShowTarget,
  activateCvShowUserAction,
  canNativeActivateShowTarget,
} from '../../src/static-pages/js/tour-player/activation.js';
import {
  CV_SHOW_CONTACT_ACTIONS,
  createCvShowMockAgentProvider,
  resolveTrustedCvContactAction,
} from '../../src/static-pages/js/tour-player/mockAgentProvider.js';
import {
  createCvShowPlaybackEntries,
  createCvShowPresentationContext,
} from '../../src/static-pages/js/tour-player/presentationContext.js';
import {
  createCvShowNarrationController,
  createLocalAudioSpeechController,
} from '../../src/static-pages/js/tour-player/localNarration.js';
import {
  clearCvShowWebAudioReleaseCache,
  loadCvShowWebAudioRelease,
  projectCvShowWebAudioReleaseConfig,
  resolveCvShowWebAudioConfig,
  validateCvShowWebAudioRelease,
} from '../../src/static-pages/js/tour-player/webAudioRelease.js';
import {
  createCvShowAlignmentController,
  partitionCvShowAlignedDirectives,
  requireCvShowSceneSetupSuccess,
  resolveCvShowAudioAnchor,
} from '../../src/static-pages/js/tour-player/showAlignmentAdapter.js';
import { createBrowserSpeechController } from '../../src/static-pages/js/tour-player/speech.js';
import {
  createCvShowMessageStream,
  createCvShowMessageStreamController,
} from '../../src/static-pages/js/tour-player/messageStream.js';
import {
  animateCvShowScrollIntoView,
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
  waitForPortfolioMapTargetVisualSettlement,
  shouldBypassCvShowScrollSettlement,
  shouldDeferCvShowNavigationTarget,
} from '../../src/static-pages/js/tour-player/targetResolution.js';
import {
  createCvShowEntryProject,
  projectCvShowDirective,
} from '../../src/static-pages/js/tour-player/presentationProjectAdapter.js';
import {
  CV_SHOW_STRUCTURAL_MEDIA_FIXTURE,
} from '../fixtures/cvShowStructuralMedia.js';

const cvShowRuntimeAuthority = getCvShowRuntimeAuthority();
const EXPECTED_SHORT_SEQUENCE = Object.freeze([
  'positioning',
  'symbiote-workspace',
  'symbiote-ui',
  'symbiote-engine',
  'agent-portal',
  'symbiote-video-studio',
  'adaptive-maximo-workbench',
  'agent-pool-mcp',
  'project-graph-mcp',
  'lifecycle-messaging-platform',
  'mobile-smm-platform',
  'f360-studio',
  'autobox',
  'complexscan',
  'photopizza',
  'finale',
]);

const EXPECTED_DETAIL_BRANCHES = Object.freeze([
  'workspace-details',
  'symbiote-ui-details',
  'symbiote-engine-details',
  'agent-portal-details',
  'video-studio-details',
  'maximo-workbench-details',
  'agent-pool-details',
  'project-graph-details',
  'lifecycle-platform-details',
  'mobile-smm-details',
  'f360-details',
  'autobox-details',
  'complexscan-details',
  'photopizza-details',
]);

test('mobile panel actions preserve the surface that owns their target', async (t) => {
  const { parseHTML } = await import('linkedom');
  const { window } = parseHTML('<!doctype html><html lang="en"><body></body></html>');
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
  ];
  const previousGlobals = new Map(globalKeys.map((key) => (
    [key, Object.getOwnPropertyDescriptor(globalThis, key)]
  )));
  for (const key of globalKeys.slice(0, -2)) globalThis[key] = window[key];
  globalThis.CSSStyleSheet = class CSSStyleSheet {
    replaceSync() {}
  };
  globalThis.location = new URL('https://portfolio.example/cv/');
  t.after(() => {
    for (const [key, descriptor] of previousGlobals) {
      if (descriptor) Object.defineProperty(globalThis, key, descriptor);
      else delete globalThis[key];
    }
  });

  const { createPanelActionAdapter } = await import(
    '../../src/static-pages/js/tour-player/index.js?panel-surface-ownership-test'
  );
  const createFixture = ({ open }) => {
    const calls = [];
    const workspace = document.createElement('main');
    const layout = document.createElement('div');
    layout.className = 'portfolio-layout';
    layout.$ = { layoutTree: null };
    const dock = document.createElement('agent-dock-shell');
    const dockLayout = document.createElement('div');
    dockLayout.setAttribute('drawer-mode-active', '');
    dock.ref = { layout: dockLayout };
    const player = document.createElement('chat-show-player');
    const visibleRect = Object.freeze({
      left: 10,
      top: 20,
      right: 210,
      bottom: 120,
      width: 200,
      height: 100,
    });
    const hiddenRect = Object.freeze({
      left: 0,
      top: 0,
      right: 0,
      bottom: 0,
      width: 0,
      height: 0,
    });
    workspace.getBoundingClientRect = () => visibleRect;
    player.getBoundingClientRect = () => (dock.hasAttribute('open') ? visibleRect : hiddenRect);
    dock.open = (reason) => {
      calls.push(['open', reason]);
      dock.setAttribute('open', '');
    };
    dock.close = (reason) => {
      calls.push(['close', reason]);
      dock.removeAttribute('open');
    };
    if (open) dock.setAttribute('open', '');
    dock.append(player);
    workspace.append(layout, dock);
    document.body.append(workspace);
    const adapter = createPanelActionAdapter(workspace, { entries: new Map() });
    return { adapter, calls, dock, player, workspace };
  };
  const reveal = (fixture, target, id = `${target}:scroll`) => {
    const action = { id, target, type: 'scroll' };
    const inspected = fixture.adapter.inspect({ action });
    return { action, inspected, receipt: fixture.adapter.reveal({ action, inspected }) };
  };

  for (const target of ['portfolio.show-stage', 'chat.actions.finale']) {
    const fixture = createFixture({ open: true });
    reveal(fixture, target);
    assert.deepEqual(fixture.calls, [], `${target} must preserve its open owning dock`);
    assert.equal(fixture.dock.hasAttribute('open'), true);
    fixture.workspace.remove();
  }

  const closed = createFixture({ open: false });
  const closedAction = reveal(closed, 'chat.actions.finale');
  assert.deepEqual(closed.calls, [['open', 'show-action']]);
  await closed.adapter.awaitTransition(closedAction);
  const ready = await closed.adapter.awaitTarget({
    action: closedAction.action,
    context: { scrollOperation: false },
  });
  assert.equal(ready.target, closed.player);
  assert.equal(ready.target.getBoundingClientRect().width > 0, true);
  closed.workspace.remove();

  const main = createFixture({ open: true });
  reveal(main, 'article.symbiote-ui.intro');
  assert.deepEqual(main.calls, [['close', 'show-action']]);
  assert.equal(main.dock.hasAttribute('open'), false);
  main.workspace.remove();
});

test('CV Show scroll uses a bounded smooth trajectory to the browser-computed center', async () => {
  let sequence = 0;
  const callbacks = new Map();
  const view = {
    requestAnimationFrame(callback) {
      const id = ++sequence;
      callbacks.set(id, callback);
      return id;
    },
    cancelAnimationFrame(id) {
      callbacks.delete(id);
    },
    matchMedia() {
      return { matches: false };
    },
  };
  const container = {
    parentElement: null,
    scrollHeight: 1_000,
    clientHeight: 200,
    scrollWidth: 300,
    clientWidth: 300,
    scrollLeft: 0,
    scrollTop: 0,
    getRootNode() { return null; },
  };
  const target = {
    parentElement: container,
    scrollIntoView(options) {
      assert.deepEqual(options, {
        block: 'center',
        inline: 'nearest',
        behavior: 'instant',
      });
      container.scrollTop = 600;
    },
  };
  const document = { defaultView: view, scrollingElement: container };
  const pending = animateCvShowScrollIntoView(target, { document, durationMs: 300 });
  assert.equal(container.scrollTop, 0, 'instant destination probe must not flash');

  const step = (timestamp) => {
    const [id, callback] = callbacks.entries().next().value;
    callbacks.delete(id);
    callback(timestamp);
  };
  step(0);
  assert.equal(container.scrollTop, 0);
  step(150);
  assert.equal(container.scrollTop, 300);
  step(300);
  await pending;
  assert.equal(container.scrollTop, 600);
  assert.equal(callbacks.size, 0);
});

test('CV Show scroll settles an already-centered target without artificial animation frames', async () => {
  let frameRequests = 0;
  const view = {
    requestAnimationFrame() {
      frameRequests += 1;
      return frameRequests;
    },
    cancelAnimationFrame() {},
    matchMedia() {
      return { matches: false };
    },
  };
  const container = {
    parentElement: null,
    scrollHeight: 1_000,
    clientHeight: 200,
    scrollWidth: 300,
    clientWidth: 300,
    scrollLeft: 0,
    scrollTop: 320,
    getRootNode() { return null; },
  };
  const target = {
    parentElement: container,
    scrollIntoView(options) {
      assert.deepEqual(options, {
        block: 'center',
        inline: 'nearest',
        behavior: 'instant',
      });
      container.scrollTop = 320;
    },
  };

  await animateCvShowScrollIntoView(target, {
    document: { defaultView: view, scrollingElement: container },
    durationMs: 300,
  });

  assert.equal(container.scrollTop, 320);
  assert.equal(frameRequests, 0, 'a no-op scroll must not invent visual motion');
});

test('CV Show scroll motion reserves settlement time inside the authored hard deadline', () => {
  assert.equal(resolveCvShowScrollDuration(800), 0);
  assert.equal(resolveCvShowScrollDuration(1_000), 200);
  assert.equal(resolveCvShowScrollDuration(2_200), 300);
  assert.equal(resolveCvShowScrollDuration(null), 300);
  assert.equal(shouldBypassCvShowScrollSettlement(800), true);
  assert.equal(shouldBypassCvShowScrollSettlement(1_000), false);
  assert.equal(shouldBypassCvShowScrollSettlement(1_200, {
    action: { type: 'frame', target: 'media/photopizza/youtube/example' },
  }), true);
  assert.equal(shouldBypassCvShowScrollSettlement(1_200, {
    action: { type: 'frame', target: 'article.photopizza.mechanics' },
  }), false);
});

test('CV Show setup navigation never scrolls the tree before selecting its article', () => {
  assert.equal(resolveCvShowActionTargetScroll({ type: 'navigate' }), false);
  assert.equal(resolveCvShowActionTargetScroll({ type: 'frame' }), false);
  assert.equal(resolveCvShowActionTargetScroll({ type: 'frame' }, { scrollOperation: true }), false);
  assert.equal(shouldRestoreCvShowSetupAttentionTarget({
    type: 'frame',
    target: 'article.autobox-v1.working-system',
    timing: { phase: 'setup' },
  }), true);
  assert.equal(shouldRestoreCvShowSetupAttentionTarget({
    type: 'frame',
    target: 'article.autobox-v1.working-system',
    timing: { phase: 'speech' },
  }), false);
  assert.equal(shouldRestoreCvShowSetupAttentionTarget({
    type: 'frame',
    target: 'article.autobox-v1.working-system',
    timing: { phase: 'setup' },
  }, { scrollOperation: true }), false);
  assert.equal(shouldDeferCvShowNavigationTarget({ type: 'navigate', id: 'example.open' }), true);
  assert.equal(shouldDeferCvShowNavigationTarget({ type: 'navigate', id: 'finale.map' }), false);
});

test('checkpoint-held attention restores its target instantly before provider admission', async () => {
  const callbacks = new Map();
  let sequence = 0;
  const view = {
    requestAnimationFrame(callback) {
      const id = ++sequence;
      callbacks.set(id, callback);
      return id;
    },
    cancelAnimationFrame(id) {
      callbacks.delete(id);
    },
  };
  const calls = [];
  const target = {
    scrollIntoView(options) { calls.push(options); },
  };
  const pending = restoreCvShowHeldAttentionTarget(target, {
    document: { defaultView: view, visibilityState: 'visible' },
  });
  assert.deepEqual(calls, [{
    block: 'center',
    inline: 'nearest',
    behavior: 'instant',
  }]);
  for (let index = 0; index < 2; index += 1) {
    const [id, callback] = callbacks.entries().next().value;
    callbacks.delete(id);
    callback(index * 16);
    await Promise.resolve();
  }
  assert.deepEqual(await pending, { status: 'settled', frames: 2 });
});

test('CV Show resolves mounted article media as semantic scroll targets', () => {
  const media = {
    dataset: { mediaId: 'media/photopizza/youtube/example' },
    isConnected: true,
    getBoundingClientRect: () => ({ width: 640, height: 360 }),
  };
  const viewer = {
    querySelectorAll: (selector) => selector === '[data-media-id]' ? [media] : [],
  };
  const document = {
    defaultView: { getComputedStyle: () => ({ display: 'block', visibility: 'visible' }) },
  };

  assert.equal(resolveCvShowSemanticTarget(null, { viewer }, media.dataset.mediaId, { document }), media);
});

test('CV Show selection keeps an authored quote or derives a locale-safe semantic excerpt', () => {
  const russianTarget = {
    textContent: 'Результат сохраняется как переносимая исполняемая конфигурация.',
  };
  assert.equal(
    resolveCvShowSelectionQuote(russianTarget, {
      type: 'native-selection',
      quote: 'переносимая исполняемая конфигурация',
    }),
    'переносимая исполняемая конфигурация',
  );

  const englishTarget = {
    textContent: 'The result is saved as a portable executable configuration. It can be reopened.',
  };
  assert.equal(
    resolveCvShowSelectionQuote(englishTarget, {
      type: 'native-selection',
      quote: 'переносимая исполняемая конфигурация',
    }),
    'The result is saved as a portable executable configuration.',
  );
  assert.equal(isShowTargetReadyForAction(englishTarget, {
    type: 'native-selection',
    quote: 'переносимая исполняемая конфигурация',
  }), true);

  const longEnglishTarget = {
    textContent: 'It exposes dependency views, code skeletons, graph summaries, and browser-test evidence as compact structured context for engineering agents.',
  };
  const boundedQuote = resolveCvShowSelectionQuote(longEnglishTarget, {
    type: 'native-selection',
    quote: 'компактный структурированный инженерный контекст',
  });
  assert.equal(boundedQuote, 'It exposes dependency views, code skeletons, graph summaries, and browser-test');
  assert.ok(boundedQuote.length <= 80);
});

test('finale map targets resolve the historical-to-current route instead of one generic node', () => {
  const focusCalls = [];
  const focusHolds = [];
  const historicalNode = Object.freeze({ id: 'photopizza-node' });
  const currentNode = Object.freeze({ id: 'agent-portal-node' });
  const selectedNode = Object.freeze({ id: 'selected-node' });
  const canvas = {
    closest(selector) {
      return selector === 'portfolio-graph-panel'
        ? { holdShowMapFocus: durationMs => focusHolds.push(durationMs) }
        : null;
    },
    focusNodes(nodeIds, options) {
      focusCalls.push([nodeIds, options]);
    },
    querySelector(selector) {
      if (selector === 'graph-node[node-id="projects/photopizza"]') return historicalNode;
      if (selector === 'graph-node[node-id="projects/agent-portal"]') return currentNode;
      if (selector === 'graph-node[data-selected]') return selectedNode;
      return null;
    },
  };
  const workspace = {
    querySelector(selector) {
      return selector === 'node-canvas, sn-canvas-graph' ? canvas : null;
    },
  };

  assert.equal(isPortfolioMapTarget('portfolio.map.historical-branch'), true);
  assert.equal(isPortfolioMapTarget('portfolio.map.engineering-scale-route'), true);
  assert.equal(isPortfolioMapTarget('projects/photopizza'), false);

  assert.equal(
    resolvePortfolioMapTarget(workspace, 'portfolio.map.historical-branch'),
    historicalNode,
  );
  assert.equal(
    focusPortfolioMapTarget(workspace, 'portfolio.map.historical-branch'),
    true,
  );
  assert.deepEqual(focusCalls, [[
    'projects/photopizza',
    { select: false, padding: 56, maxZoom: 0.8, marker: false },
  ]], 'one semantic map node must use the stable single-node camera path');
  assert.deepEqual(focusHolds, [12_000], 'map focus must remain stable through the following speech clip');
  assert.equal(
    resolvePortfolioMapTarget(workspace, 'portfolio.map.engineering-scale-route'),
    currentNode,
  );
  canvas.querySelector = () => null;
  assert.equal(
    resolvePortfolioMapTarget(workspace, 'portfolio.map.historical-branch'),
    null,
    'semantic map targets must wait for their exact graph node instead of framing the whole canvas',
  );
  assert.equal(
    resolvePortfolioMapTarget(
      { querySelector: () => null },
      'portfolio.map.historical-branch',
    ),
    null,
  );
  assert.equal(resolvePortfolioMapTarget(workspace, 'profile.contacts'), null);
});

test('finale map settlement waits until the exact node is inside the canvas and viewport motion stops', async () => {
  const frames = [];
  let targetRect = {
    left: 80,
    top: 400,
    right: 200,
    bottom: 450,
    width: 120,
    height: 50,
  };
  let viewportAnimating = false;
  const node = {
    isConnected: true,
    getBoundingClientRect: () => targetRect,
  };
  const canvas = {
    ref: {
      canvasContainer: {
        getBoundingClientRect: () => ({
          left: 0,
          top: 0,
          right: 640,
          bottom: 300,
          width: 640,
          height: 300,
        }),
      },
    },
    hasAttribute: name => name === 'data-viewport-animating' && viewportAnimating,
    getBoundingClientRect: () => ({
      left: 0,
      top: 0,
      right: 640,
      bottom: 1_200,
      width: 640,
      height: 1_200,
    }),
    querySelector: selector => selector === 'graph-node[node-id="projects/agent-portal"]'
      ? node
      : null,
  };
  const workspace = {
    querySelector: selector => selector === 'node-canvas, sn-canvas-graph' ? canvas : null,
  };
  const requestAnimationFrame = callback => {
    frames.push(callback);
    return frames.length;
  };
  let settled = false;
  const settlement = waitForPortfolioMapTargetVisualSettlement(
    workspace,
    'portfolio.map.engineering-scale-route',
    {
      document: { defaultView: { innerWidth: 1024, innerHeight: 768 } },
      requestAnimationFrame,
      cancelAnimationFrame: () => {},
      timeoutMs: 1_000,
    },
  ).then((value) => {
    settled = true;
    return value;
  });

  frames.shift()(0);
  await Promise.resolve();
  assert.equal(settled, false, 'an off-canvas node must not settle');
  frames.shift()(8);
  await Promise.resolve();
  assert.equal(settled, false, 'the canvas host is not the clipped graph viewport');

  targetRect = {
    left: 240,
    top: 180,
    right: 360,
    bottom: 230,
    width: 120,
    height: 50,
  };
  viewportAnimating = true;
  frames.shift()(16);
  await Promise.resolve();
  assert.equal(settled, false, 'an in-canvas node must not settle while the viewport animates');

  viewportAnimating = false;
  frames.shift()(32);
  await Promise.resolve();
  assert.equal(settled, false, 'one visible frame is not enough evidence');
  frames.shift()(48);

  const result = await settlement;
  assert.equal(result.target, node);
  assert.equal(result.visualSettlement.reason, 'exact-map-node-visible');
});

test('direct detail targets open their owning project article before readiness', () => {
  const selections = [];
  const runtime = {
    selectedId: 'profile/vladimir-matiasevich',
    entries: new Map([['projects/symbiote-workspace', Object.freeze({})]]),
    select(projectId, options) {
      selections.push([projectId, options]);
      this.selectedId = projectId;
      return true;
    },
  };

  assert.deepEqual(
    ensureCvShowArticleProject(runtime, 'article.symbiote-workspace.config-flow'),
    { projectId: 'projects/symbiote-workspace', changed: true },
  );
  assert.deepEqual(selections, [[
    'projects/symbiote-workspace',
    { focus: true, updateUrl: false },
  ]]);
  assert.deepEqual(
    ensureCvShowArticleProject(runtime, 'article.symbiote-workspace.artifact'),
    { projectId: 'projects/symbiote-workspace', changed: false },
  );
  assert.equal(ensureCvShowArticleProject(runtime, 'profile.contacts'), null);
  assert.equal(ensureCvShowArticleProject(runtime, 'article.unknown.block'), null);
  assert.equal(selections.length, 1);
});

test('native selection waits for rendered text and permits the locale-safe fallback quote', () => {
  const target = { textContent: 'Результат сохраняется как переносимая исполняемая конфигурация.' };
  assert.equal(isShowTargetReadyForAction(target, { type: 'frame' }), true);
  assert.equal(isShowTargetReadyForAction(target, {
    type: 'native-selection',
    quote: 'переносимая   исполняемая\nконфигурация',
  }), true);
  assert.equal(isShowTargetReadyForAction(target, {
    type: 'native-selection',
    quote: 'ещё не отрисованная цитата',
  }), true);
  assert.equal(isShowTargetReadyForAction({ textContent: '   ' }, {
    type: 'native-selection',
    quote: 'ещё не отрисованная цитата',
  }), false);
});

test('CV Show data exposes the approved Russian Short and detail-branch contract', () => {
  assert.equal(CV_SHOW_STORY.version, 1);
  assert.equal(
    CV_SHOW_STORY.contractRevision,
    '34c3d40c1c53cd320362aff9888c1727c977b9b3c7dcfb0d3cc73683bcf29af9',
  );
  assert.equal(CV_SHOW_STORY.narrationLocale, 'ru');
  assert.deepEqual(TOUR_SHORT_SEQUENCE, EXPECTED_SHORT_SEQUENCE);
  assert.deepEqual(CV_SHOW_STORY.short, EXPECTED_SHORT_SEQUENCE);
  assert.deepEqual(Object.keys(TOUR_DETAIL_BRANCHES), EXPECTED_DETAIL_BRANCHES);
  assert.equal(TOUR_SCENES.length, 16);
  assert.equal(new Set(TOUR_SCENES.map(scene => scene.id)).size, 16);
  assert.equal(CV_SHOW_STORY.scenes.length, 16);
  assert.equal(Object.keys(CV_SHOW_STORY.branches).length, 14);
  assert.deepEqual(CV_SHOW_STORY.scenes[0].directives.at(-1), {
    id: 'positioning.open',
    type: 'navigate',
    target: 'profile/photo',
    policy: 'required',
    timing: { phase: 'setup' },
  });

  for (const scene of CV_SHOW_STORY.scenes) {
    assert.ok(scene.title && scene.subtitle && scene.speech, scene.id);
    assert.ok(Array.isArray(scene.directives), scene.id);
    assert.equal(Object.isFrozen(scene), true);
  }
  for (const branch of Object.values(CV_SHOW_STORY.branches)) {
    assert.ok(branch.subtitle && branch.speech && branch.directives.length, branch.id);
    assert.equal(branch.return.resume, 'paused');
    assert.match(branch.return.anchor, /^short\.after\./);
  }
});

test('CV Show directives stay semantic and keep shared UI behavior provider-owned', () => {
  const allowedDirectives = new Set(CV_SHOW_DIRECTIVE_TYPES);
  const directives = [
    ...CV_SHOW_STORY.scenes.flatMap(scene => scene.directives),
    ...Object.values(CV_SHOW_STORY.branches).flatMap(branch => branch.directives),
  ];
  assert.deepEqual(
    [...new Set(directives.map(({ type }) => type))].sort(),
    ['activate', 'chat-action', 'frame', 'marker', 'media', 'native-selection', 'navigate'],
  );
  for (const directive of directives) {
    assert.equal(allowedDirectives.has(directive.type), true, directive.type);
    assert.match(directive.id, /^[a-z0-9.-]+$/);
    assert.equal(typeof directive.target === 'string' || directive.type === 'idle', true);
  }

  const serialized = JSON.stringify(CV_SHOW_STORY);
  assert.doesNotMatch(serialized, /querySelector|selector|triggerWord|onboundary|timestamp|delayMs/);
  assert.deepEqual(TOUR_RUNTIME_POLICY.attention.exclusive, [
    'cursor',
    'frame',
    'native-selection',
    'activation',
  ]);
  assert.equal(TOUR_RUNTIME_POLICY.marker.clearOnAttentionChange, true);
  assert.equal(TOUR_RUNTIME_POLICY.userInteraction.autoPause, 'meaningful-only');
  assert.equal(TOUR_RUNTIME_POLICY.audio.exclusive, true);
  assert.equal(TOUR_RUNTIME_POLICY.ownership.sharedRuntime, 'symbiote-ui');
  assert.equal(TOUR_RUNTIME_POLICY.ownership.productScenario, 'cv');
});

test('all narrated entries expose one pre-audio subject setup and explicit led speech accents', () => {
  const entries = [
    ...CV_SHOW_STORY.scenes,
    ...Object.values(CV_SHOW_STORY.branches),
  ];
  const absentTargets = new Set([
    'article.complexscan.bottle-rig',
    'article.symbiote-workspace.builder-demo',
    'article.agent-pool-mcp.local-demo',
    'article.autobox-v1.planning-prototype',
    'article.autobox-v1.planning-optics',
    'article.autobox-v1.planning-overlap',
    'article.autobox-v1.planning-mechanics',
    'article.autobox-v1.planning-safety',
    'article.autobox-v1.lidar-next-layer',
    'article.complexscan.bottle-catalog-link',
  ]);

  assert.equal(entries.length, 30);
  assert.equal(Object.keys(TOUR_ATTENTION_TIMELINES).length, entries.length);
  for (let entry of entries) {
    let timeline = TOUR_ATTENTION_TIMELINES[entry.id];
    let partition = partitionCvShowAlignedDirectives(entry.directives);
    assert.ok(timeline, `${entry.id}: attention timeline`);
    assert.equal(partition.sceneSetup.length, 1, `${entry.id}: pre-audio setup`);
    assert.equal(partition.scheduled.length > 0, true, `${entry.id}: narrated accents`);
    assert.equal(entry.directives.some(({ type }) => type === 'idle'), false, `${entry.id}: idle`);
    for (let setup of partition.sceneSetup) {
      assert.equal(setup.id, timeline.setup, `${entry.id}: setup identity`);
      assert.equal(setup.timing?.phase, 'setup', `${setup.id}: setup phase`);
      assert.equal(absentTargets.has(setup.target), false, `${setup.id}: target`);
    }
    assert.deepEqual(
      partition.scheduled.map(({ source }) => source.id).sort(),
      Object.keys(timeline.speech).sort(),
      `${entry.id}: selected narration accents`,
    );
    for (let { source, at } of partition.scheduled) {
      const expected = timeline.speech[source.id];
      assert.ok(expected, `${source.id}: selected timeline cue`);
      assert.equal(source.timing?.phase, 'speech', `${source.id}: speech phase`);
      assert.equal(at.anchor, 'speech', `${source.id}: speech anchor`);
      assert.equal(typeof at.quote, 'string', `${source.id}: quote`);
      assert.equal(at.quote.length > 1, true, `${source.id}: non-empty quote`);
      assert.equal(at.quote, expected.quote, `${source.id}: recognized phrase`);
      assert.equal(at.offsetMs < 0, true, `${source.id}: lead`);
      assert.equal(-at.offsetMs, expected.leadMs, `${source.id}: explicit lead`);
      assert.equal(expected.leadMs >= 600, true, `${source.id}: settlement margin`);
      assert.equal(absentTargets.has(source.target), false, `${source.id}: target`);
    }
  }
});

test('narration accepts only a successfully settled subject setup', () => {
  const completedAction = Object.freeze({
    id: 'positioning.open',
    status: 'success',
    result: Object.freeze({ status: 'completed' }),
  });
  const success = Object.freeze({
    status: 'success',
    receipts: Object.freeze([completedAction]),
  });
  assert.equal(requireCvShowSceneSetupSuccess(success, 'positioning'), success);
  assert.throws(
    () => requireCvShowSceneSetupSuccess({ status: 'success', receipts: [] }, 'positioning'),
    /CV Show scene setup failed: positioning\/success/,
  );
  assert.throws(
    () => requireCvShowSceneSetupSuccess({
      status: 'success',
      receipts: [completedAction, completedAction],
    }, 'positioning'),
    /CV Show scene setup failed: positioning\/success/,
  );
  assert.throws(
    () => requireCvShowSceneSetupSuccess({
      status: 'success',
      receipts: [{ ...completedAction, status: 'missing' }],
    }, 'positioning'),
    /CV Show scene setup failed: positioning\/success/,
  );
  assert.throws(
    () => requireCvShowSceneSetupSuccess({
      status: 'success',
      receipts: [{ ...completedAction, result: { status: 'cancelled' } }],
    }, 'positioning'),
    /CV Show scene setup failed: positioning\/success/,
  );
  assert.throws(
    () => requireCvShowSceneSetupSuccess({
      status: 'success',
      receipts: [{ ...completedAction, result: { status: 'running' } }],
    }, 'positioning'),
    /CV Show scene setup failed: positioning\/success/,
  );
  assert.throws(
    () => requireCvShowSceneSetupSuccess({ status: 'required-missing' }, 'positioning'),
    /CV Show scene setup failed: positioning\/required-missing/,
  );
  assert.throws(
    () => requireCvShowSceneSetupSuccess({ status: 'cancelled' }, 'positioning'),
    /CV Show scene setup failed: positioning\/cancelled/,
  );
});

test('details replace one Short segment and continue with the next Short segment', async () => {
  const logic = await readFile(
    new URL('../../src/ui-components/client-only/tour-player/tour-player.js', import.meta.url),
    'utf8',
  );
  const continuationMethod = logic.match(
    /#continueShortAfterDetails\(requestId, \{ interrupt = false, startPaused = false \} = \{\}\) \{(?<body>[\s\S]*?)\n  \}\n\n  async #resume/,
  );
  assert.ok(continuationMethod?.groups?.body, 'detail replacement continuation method body');
  assert.match(continuationMethod.groups.body, /this\.#session\.returnFromBranch\(\)/u);
  assert.match(continuationMethod.groups.body, /this\.#sceneIndex \+= 1/u);
  assert.match(continuationMethod.groups.body, /this\.#enterSegment\(this\.#sceneIndex, \{ startPaused \}\)/u);
  assert.match(logic, /const activeBranchId = this\.#session\.snapshot\.playback\.episodeId/u);
  assert.match(logic, /const branchEntry = this\.#story\?\.branches\?\.\[activeBranchId\]/u);
  assert.match(logic, /\(\{ id \}\) => id === branchEntry\?\.sceneId/u);
  assert.match(logic, /contextualCardId: event\.detail\?\.id/u);
  assert.match(logic, /historicalOwnerEntryId: payload\?\.sceneId/u);
  assert.match(logic, /cvShowRuntimeAuthority\.subscribe\(this\.#onAuthoringView\)/u);
  assert.match(
    logic,
    /connectedCallback\(\) \{\s*this\.#authoringView = cvShowRuntimeAuthority\.getView\(\);\s*this\.#unsubscribeAuthoring \|\|= cvShowRuntimeAuthority\.subscribe\(this\.#onAuthoringView\);\s*this\.#dock/u,
  );
  assert.match(logic, /this\.#unsubscribeAuthoring\?\.\(\)/u);
  assert.match(
    logic,
    /if \(this\.\$\.isRunning \|\| this\.#mode \|\| this\.#alignedEntry \|\| this\.\$\.inBranch\) \{\s*this\.stopShow\(\);[\s\S]*?this\.#authoringView = nextView;\s*this\.#projectDurationMsByEntry\.clear\(\);\s*this\.#acceptStory\(nextView\.story\);/u,
  );
  assert.match(
    logic,
    /const requestId = this\.#requestId;[\s\S]*?if \(unavailableEntryIds\.length\)[\s\S]*?return false;\s*\}\s*this\.#mode = mode;/u,
  );
  assert.match(logic, /requestId !== this\.#requestId[\s\S]*?\|\| !this\.#mode/u);
  assert.match(logic, /masterProjectHash: this\.#authoringView\.base\.authoringProjectHash/u);
  assert.match(logic, /masterRevision: this\.#authoringView\.base\.revision/u);
  assert.doesNotMatch(logic, /CV_SHOW_PRESENTATION_PROJECT/u);
});

test('pending routed Show transport stops and restarts without stale lifecycle resurrection', async (t) => {
  const { parseHTML } = await import('linkedom');
  const { window } = parseHTML('<!doctype html><html lang="en"><body></body></html>');
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
    'speechSynthesis',
    'SpeechSynthesisUtterance',
  ];
  const previousGlobals = new Map(globalKeys.map((key) => (
    [key, Object.getOwnPropertyDescriptor(globalThis, key)]
  )));
  for (const key of globalKeys.slice(0, -4)) globalThis[key] = window[key];
  globalThis.CSSStyleSheet = class CSSStyleSheet {
    replaceSync() {}
  };
  globalThis.location = new URL('https://portfolio.example/cv/');
  const spoken = [];
  globalThis.speechSynthesis = {
    paused: false,
    cancel() {},
    pause() { this.paused = true; },
    resume() { this.paused = false; },
    speak(utterance) { spoken.push(utterance); },
  };
  globalThis.SpeechSynthesisUtterance = class SpeechSynthesisUtterance {
    constructor(text) { this.text = text; }
  };

  const fixtures = [];
  t.after(() => {
    for (const { dock } of fixtures) dock.remove();
    for (const [key, descriptor] of previousGlobals) {
      if (descriptor) Object.defineProperty(globalThis, key, descriptor);
      else delete globalThis[key];
    }
  });

  const { PortfolioShowChat } = await import(
    '../../src/ui-components/client-only/tour-player/tour-player.js?pending-route-transport-test'
  );
  const createFixture = () => {
    const dock = document.createElement('div');
    const showPlayer = {
      configs: [],
      states: [],
      bind(config) { this.configs.push(config); },
      setState(state) { this.states.push(state); },
    };
    const fixture = {
      dock,
      mounts: 0,
      phases: [],
      showPlayer,
      get config() { return showPlayer.configs.find(({ timeline }) => timeline?.turns?.length); },
    };
    dock.setAgentProvider = () => {};
    dock.setMessages = () => {};
    dock.getChat = () => null;
    dock.setShow = (_key, config) => {
      fixture.mounts += 1;
      showPlayer.configs.push(config);
      return showPlayer;
    };
    dock.removeShow = () => {};
    const player = new PortfolioShowChat();
    fixture.player = player;
    player.agentDock = dock;
    player.addEventListener('portfolio-show-phase', (event) => {
      if (typeof event.detail?.complete !== 'function') return;
      fixture.phases.push(event.detail);
      event.detail.handled = true;
      event.detail.complete(Object.freeze({
        status: 'success',
        receipts: Object.freeze([Object.freeze({
          status: 'success',
          result: Object.freeze({ status: 'completed' }),
        })]),
      }));
    });
    dock.append(player);
    document.body.append(dock);
    fixtures.push(fixture);
    return fixture;
  };

  const stopped = createFixture();
  const stopEvents = [];
  const stoppedStartEvents = [];
  stopped.dock.addEventListener('portfolio-show-stop', (event) => stopEvents.push(event.detail));
  stopped.dock.addEventListener('portfolio-show-start', (event) => stoppedStartEvents.push(event.detail));
  const supersededStopStart = stopped.player.applyShowRoute({
    mode: 'short',
    entryId: 'positioning',
    timeMs: 2_345,
    play: true,
  });
  assert.equal(stopped.mounts, 1, 'the shared player mounts before narration preparation settles');
  stopped.config.controller.stop();
  assert.equal(await supersededStopStart, false);
  await Promise.resolve();
  stopped.player.stopShow();
  assert.deepEqual(stopEvents, [{
    reason: 'explicit',
    routeState: {
      mode: 'short',
      entryId: 'positioning',
      detailId: '',
      timeMs: 2_345,
      play: false,
      running: false,
      completed: false,
    },
  }]);
  assert.deepEqual(stoppedStartEvents, []);
  assert.equal(stopped.player.$.isRunning, false);

  const pausedRoute = createFixture();
  const pausedRouteStartEvents = [];
  pausedRoute.dock.addEventListener('portfolio-show-start', (event) => {
    pausedRouteStartEvents.push(event.detail);
  });
  const pausedRouteSpeechCount = spoken.length;
  assert.equal(await pausedRoute.player.applyShowRoute({
    mode: 'short',
    entryId: 'positioning',
    timeMs: 0,
    play: false,
  }), true);
  await Promise.resolve();
  assert.equal(spoken.length, pausedRouteSpeechCount, 'showPlay=0 does not queue browser speech');
  assert.deepEqual(pausedRouteStartEvents, []);
  assert.deepEqual(pausedRoute.phases, []);
  assert.equal(pausedRoute.player.$.isPaused, true);
  assert.equal(pausedRoute.config.controller.isPlaying, false);
  assert.equal(pausedRoute.player.routeSnapshot.play, false);

  const pendingTrustedPlay = createFixture();
  const pendingTrustedPlayStarts = [];
  pendingTrustedPlay.dock.addEventListener('portfolio-show-start', (event) => {
    pendingTrustedPlayStarts.push(event.detail);
  });
  const pendingTrustedPlaySpeechCount = spoken.length;
  const pendingTrustedPlayRoute = pendingTrustedPlay.player.applyShowRoute({
    mode: 'short',
    entryId: 'symbiote-workspace',
    timeMs: 0,
    play: false,
  });
  assert.equal(
    pendingTrustedPlay.mounts,
    1,
    'the trusted Play control is available while narration resources are still preparing',
  );
  pendingTrustedPlay.config.controller.play();
  assert.equal(await pendingTrustedPlayRoute, true);
  await new Promise((resolve) => setImmediate(resolve));
  assert.equal(
    spoken.length,
    pendingTrustedPlaySpeechCount + 1,
    'trusted Play during preparation is retained until speech becomes active',
  );
  assert.equal(pendingTrustedPlay.player.routeSnapshot.play, true);
  assert.deepEqual(
    pendingTrustedPlayStarts,
    [],
    'retaining trusted Play is not a physical Show start receipt',
  );
  spoken.at(-1).onstart?.();
  await Promise.resolve();
  await Promise.resolve();
  assert.deepEqual(pendingTrustedPlayStarts, [{ routeDriven: true }]);

  const cancelledPendingPlay = createFixture();
  const cancelledPendingPlayStarts = [];
  cancelledPendingPlay.dock.addEventListener('portfolio-show-start', (event) => {
    cancelledPendingPlayStarts.push(event.detail);
  });
  const cancelledPendingPlaySpeechCount = spoken.length;
  const cancelledPendingPlayRoute = cancelledPendingPlay.player.applyShowRoute({
    mode: 'short',
    entryId: 'symbiote-workspace',
    timeMs: 0,
    play: false,
  });
  cancelledPendingPlay.config.controller.play();
  cancelledPendingPlay.config.controller.pause();
  assert.equal(await cancelledPendingPlayRoute, true);
  await new Promise((resolve) => setImmediate(resolve));
  assert.equal(
    spoken.length,
    cancelledPendingPlaySpeechCount,
    'Pause during preparation cancels queued trusted Play before speech becomes active',
  );
  assert.equal(cancelledPendingPlay.player.routeSnapshot.play, false);
  assert.deepEqual(cancelledPendingPlayStarts, []);

  const pausedDuringLease = createFixture();
  let resolveLease;
  let markLeaseRequested;
  const leaseRequested = new Promise((resolve) => { markLeaseRequested = resolve; });
  const releasedLeases = [];
  pausedDuringLease.player.audioArbiter = {
    snapshot: Object.freeze({ tokenId: '' }),
    acquire() {
      markLeaseRequested();
      return new Promise((resolve) => { resolveLease = resolve; });
    },
    release(token) { releasedLeases.push(token); },
  };
  const pausedDuringLeaseSpeechCount = spoken.length;
  const pausedDuringLeaseRoute = pausedDuringLease.player.applyShowRoute({
    mode: 'short',
    entryId: 'symbiote-workspace',
    timeMs: 0,
    play: false,
  });
  pausedDuringLease.config.controller.play();
  assert.equal(await pausedDuringLeaseRoute, true);
  await leaseRequested;
  pausedDuringLease.config.controller.pause();
  resolveLease(Object.freeze({ id: 'pending-speech-lease' }));
  await new Promise((resolve) => setImmediate(resolve));
  assert.equal(
    spoken.length,
    pausedDuringLeaseSpeechCount,
    'Pause while the audio lease is pending must keep the not-yet-active utterance paused',
  );
  assert.deepEqual(releasedLeases, [Object.freeze({ id: 'pending-speech-lease' })]);

  const pendingSeekPlay = createFixture();
  const pendingSeekPlaySpeechCount = spoken.length;
  const supersededPendingSeekRoute = pendingSeekPlay.player.applyShowRoute({
    mode: 'short',
    entryId: 'symbiote-workspace',
    timeMs: 0,
    play: false,
  });
  pendingSeekPlay.config.controller.seek(1, 1_000);
  pendingSeekPlay.config.controller.play();
  assert.equal(await supersededPendingSeekRoute, false);
  await new Promise((resolve) => setImmediate(resolve));
  assert.equal(spoken.length, pendingSeekPlaySpeechCount + 1);
  spoken.at(-1).onstart?.();
  pendingSeekPlay.config.controller.pause();
  assert.equal(globalThis.speechSynthesis.paused, true);
  pendingSeekPlay.config.controller.play();
  assert.equal(
    globalThis.speechSynthesis.paused,
    false,
    'seek cleanup follows the transport request id, so stale object identity cannot trap Resume',
  );

  const blocked = createFixture();
  const blockedStartEvents = [];
  const blockedResumeEvents = [];
  blocked.dock.addEventListener('portfolio-show-start', (event) => blockedStartEvents.push(event.detail));
  blocked.dock.addEventListener('portfolio-show-resume', (event) => blockedResumeEvents.push(event.detail));
  assert.equal(await blocked.player.applyShowRoute({
    mode: 'short',
    entryId: 'positioning',
    timeMs: 0,
    play: true,
  }), true);
  await new Promise((resolve) => setImmediate(resolve));
  const deniedUtterance = spoken.at(-1);
  deniedUtterance.onerror?.({ error: 'not-allowed' });
  await Promise.resolve();
  assert.deepEqual(blockedStartEvents, []);
  assert.deepEqual(blockedResumeEvents, []);
  assert.deepEqual(blocked.phases, [], 'autoplay denial cannot admit presentation gestures');
  assert.equal(blocked.player.$.isPaused, true);
  assert.equal(blocked.player.$.resumeRequired, true);
  assert.equal(blocked.config.controller.isPlaying, false);
  assert.equal(blocked.player.routeSnapshot.play, false);

  const deniedSpeechCount = spoken.length;
  blocked.config.controller.play();
  await Promise.resolve();
  assert.equal(spoken.length, deniedSpeechCount + 1, 'trusted Resume creates a fresh utterance');
  assert.deepEqual(blockedStartEvents, []);
  assert.deepEqual(blocked.phases, []);
  spoken.at(-1).onstart?.();
  await Promise.resolve();
  await Promise.resolve();
  assert.deepEqual(blockedStartEvents, [{ routeDriven: true }]);
  assert.deepEqual(blockedResumeEvents, [], 'the first physical start is not mislabeled Resume');
  assert.equal(blocked.phases.length, 1);
  assert.equal(blocked.config.controller.isPlaying, true);

  assert.equal(blocked.player.pauseShow(), true);
  const resumedUtterance = spoken.at(-1);
  const resumedSpeechCount = spoken.length;
  blocked.config.controller.play();
  await Promise.resolve();
  assert.equal(spoken.length, resumedSpeechCount, 'Resume continues the retained utterance');
  assert.equal(blockedResumeEvents.length, 0, 'Resume intent is not a transport receipt');
  assert.equal(blocked.config.controller.isPlaying, false);
  resumedUtterance.onresume?.();
  await Promise.resolve();
  assert.equal(blockedResumeEvents.length, 1);
  assert.equal(blocked.config.controller.isPlaying, true);

  const restarted = createFixture();
  const restartEvents = [];
  const restartedStartEvents = [];
  const restartedStopEvents = [];
  restarted.dock.addEventListener('portfolio-show-seek', (event) => restartEvents.push(event.detail));
  restarted.dock.addEventListener('portfolio-show-start', (event) => restartedStartEvents.push(event.detail));
  restarted.dock.addEventListener('portfolio-show-stop', (event) => restartedStopEvents.push(event.detail));
  const restartedSpeechCount = spoken.length;
  const supersededRestartStart = restarted.player.applyShowRoute({
    mode: 'short',
    entryId: 'symbiote-ui',
    timeMs: 3_456,
    play: true,
  });
  assert.equal(restarted.mounts, 1);
  restarted.config.controller.seek(0, 0);
  assert.equal(await supersededRestartStart, false);
  await new Promise((resolve) => setImmediate(resolve));

  assert.deepEqual(restartedStartEvents, [], 'requested playback is not a physical Show start');
  assert.deepEqual(restarted.phases, [], 'presentation is not admitted before physical narration');
  assert.deepEqual(restartEvents, [{ index: 0, positionMs: 0 }]);
  assert.deepEqual(restartedStopEvents, []);
  assert.equal(restarted.mounts, 1, 'Restart reuses the player mounted by the pending route');
  assert.equal(restarted.player.$.isRunning, true);
  assert.equal(restarted.config.controller.isPlaying, false, 'requested play is pending physical narration');
  assert.deepEqual(restarted.player.routeSnapshot, {
    mode: 'short',
    entryId: 'positioning',
    detailId: '',
    timeMs: 0,
    play: true,
    running: true,
    completed: false,
  });
  assert.equal(spoken.length, restartedSpeechCount + 1, 'the superseded route cannot start duplicate narration');
  spoken.at(-1).onstart?.();
  await Promise.resolve();
  await Promise.resolve();
  assert.deepEqual(restartedStartEvents, [{ routeDriven: true }]);
  assert.equal(restarted.phases.length, 1, 'physical narration admits the first presentation phase');
  assert.equal(restarted.config.controller.isPlaying, true);

  const completionEvents = [];
  restarted.dock.addEventListener('portfolio-show-complete', (event) => {
    completionEvents.push(event.detail);
  });
  const finalIndex = restarted.config.timeline.turns.length - 1;
  const finalTimeMs = Math.min(
    4_321,
    restarted.config.timeline.turns[finalIndex].durationMs,
  );
  restarted.config.controller.seek(finalIndex, finalTimeMs);
  await new Promise((resolve) => setImmediate(resolve));
  const finalUtterance = spoken.at(-1);
  assert.equal(typeof finalUtterance?.onend, 'function');
  finalUtterance.onend();
  await new Promise((resolve) => setImmediate(resolve));
  assert.deepEqual(completionEvents, [{
    reason: 'explicit',
    routeState: {
      mode: 'short',
      entryId: 'finale',
      detailId: '',
      timeMs: finalTimeMs,
      play: false,
      running: true,
      completed: true,
    },
  }], 'natural completion preserves the last truthful narration position');
});

test('detail admission rejects stale live media before branch or presentation mutation', async (t) => {
  const authority = createCvShowAuthoringAuthority();
  const staleSnapshot = structuredClone(authority.read());
  const staleEntry = staleSnapshot.mediaCollection.entries.find(
    ({ entryId }) => entryId === 'workspace-details',
  );
  staleEntry.mediaAncestry.render.status = 'stale';
  staleEntry.mediaAncestry.playable = false;
  const capability = Object.freeze({
    local: true,
    authorized: true,
    sessionId: 'detail-admission-test',
  });
  await authority.enableLocal({
    capability,
    transport: {
      async handshake() {
        return Object.freeze({
          schemaVersion: 'cv-show-authoring-handshake-receipt-v1',
          status: 'authorized',
          sessionId: capability.sessionId,
        });
      },
      async load() {
        return Object.freeze({
          schemaVersion: 'cv-show-authoring-load-receipt-v1',
          status: 'loaded',
          snapshot: staleSnapshot,
          dirty: false,
          materialized: false,
        });
      },
      async transact() {
        throw new Error('detail admission must not mutate the authoring authority');
      },
    },
  });
  const detachRuntimeSource = cvShowRuntimeAuthority.attachSource(authority);
  t.after(() => {
    detachRuntimeSource();
    authority.dispose();
  });
  assert.equal(
    authority.view.mediaRegistry.entries['workspace-details'].playable,
    false,
  );
  assert.equal(
    authority.view.mediaRegistry.entries['symbiote-ui-details'].playable,
    true,
  );

  const { parseHTML } = await import('linkedom');
  const { window } = parseHTML('<!doctype html><html lang="en"><body></body></html>');
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
    'speechSynthesis',
    'SpeechSynthesisUtterance',
  ];
  const previousGlobals = new Map(globalKeys.map((key) => (
    [key, Object.getOwnPropertyDescriptor(globalThis, key)]
  )));
  let dock = null;
  for (const key of globalKeys.slice(0, -4)) globalThis[key] = window[key];
  globalThis.CSSStyleSheet = class CSSStyleSheet {
    replaceSync() {}
  };
  globalThis.location = new URL('https://portfolio.example/cv/');
  globalThis.speechSynthesis = {
    paused: false,
    cancel() {},
    pause() { this.paused = true; },
    resume() { this.paused = false; },
    speak(utterance) { queueMicrotask(() => utterance.onstart?.()); },
  };
  globalThis.SpeechSynthesisUtterance = class SpeechSynthesisUtterance {
    constructor(text) { this.text = text; }
  };
  t.after(() => {
    dock?.remove();
    for (const [key, descriptor] of previousGlobals) {
      if (descriptor) Object.defineProperty(globalThis, key, descriptor);
      else delete globalThis[key];
    }
  });

  const sessionCalls = {
    enterBranch: 0,
    returnFromBranch: 0,
    setPlayback: 0,
    appendMessage: 0,
  };
  const sessionMethods = new Map();
  for (const method of Object.keys(sessionCalls)) {
    const original = ShowSessionState.prototype[method];
    sessionMethods.set(method, original);
    ShowSessionState.prototype[method] = function (...args) {
      sessionCalls[method] += 1;
      return original.apply(this, args);
    };
  }
  t.after(() => {
    for (const [method, original] of sessionMethods) {
      ShowSessionState.prototype[method] = original;
    }
  });

  const { PortfolioShowChat } = await import(
    '../../src/ui-components/client-only/tour-player/tour-player.js?detail-admission-test'
  );
  dock = document.createElement('div');
  const showPlayer = {
    bindCalls: 0,
    stateCalls: 0,
    configs: [],
    states: [],
    bind(config) { this.bindCalls += 1; this.configs.push(config); },
    setState(state) { this.stateCalls += 1; this.states.push(state); },
  };
  let messages = [];
  let mountCalls = 0;
  dock.setAgentProvider = () => {};
  dock.setMessages = (value) => { messages = value; };
  dock.getChat = () => null;
  dock.setShow = (_key, config) => {
    mountCalls += 1;
    showPlayer.configs.push(config);
    return showPlayer;
  };
  dock.removeShow = () => {};

  const player = new PortfolioShowChat();
  player.agentDock = dock;
  const phases = [];
  const narrationHandoffs = [];
  player.addEventListener('portfolio-show-phase', (event) => {
    phases.push(event.detail);
    if (typeof event.detail?.complete !== 'function') return;
    event.detail.handled = true;
    event.detail.complete(Object.freeze({
      status: 'success',
      receipts: Object.freeze([Object.freeze({
        status: 'success',
        result: Object.freeze({ status: 'completed' }),
      })]),
    }));
  });
  const emitShowDirective = player.emitShowDirective.bind(player);
  player.emitShowDirective = (directive) => {
    narrationHandoffs.push(directive);
    return emitShowDirective(directive);
  };
  dock.append(player);
  document.body.append(dock);

  const started = new Promise((resolve) => {
    player.addEventListener('portfolio-show-start', resolve, { once: true });
  });
  const initialPresentation = new Promise((resolve) => {
    const onPhase = () => {
      if (phases.length < 2) return;
      player.removeEventListener('portfolio-show-phase', onPhase);
      resolve();
    };
    player.addEventListener('portfolio-show-phase', onPhase);
  });
  dock.dispatchEvent(new CustomEvent('agent-show-action', {
    detail: { actionId: 'start-short' },
  }));
  await Promise.all([started, initialPresentation]);
  assert.equal(player.$.isRunning, true);
  const progressConfig = showPlayer.configs.find(({ timeline }) => timeline?.turns?.length);
  const firstProgressTurn = progressConfig.timeline.turns[0];
  assert.equal(
    firstProgressTurn.durationMs,
    CV_SHOW_SCHEDULE_DURATIONS.durations[firstProgressTurn.id],
    'the shared player advertises exact Project schedule durations, never raw source-audio duration',
  );
  assert.equal(
    showPlayer.states.at(-1).progress.positionMs,
    0,
    'the shared player receives the live media position for the current segment',
  );
  assert.equal(
    typeof progressConfig.controller.seek,
    'function',
    'the shared player receives a real CV runtime seek controller',
  );
  const beforeStaleDetail = {
    sessionCalls: { ...sessionCalls },
    mountCalls,
    bindCalls: showPlayer.bindCalls,
    stateCalls: showPlayer.stateCalls,
    phases: phases.length,
    narrationHandoffs: narrationHandoffs.length,
    messages: messages.length,
  };

  dock.dispatchEvent(new CustomEvent('agent-show-action', {
    detail: {
      id: 'symbiote-workspace.actions',
      actionId: 'details',
      payload: { branchId: 'workspace-details', sceneId: 'symbiote-workspace' },
    },
  }));
  await Promise.resolve();

  assert.equal(player.$.inBranch, false);
  assert.equal(player.$.isError, true);
  assert.equal(player.$.errorText, 'The CV Show data could not be loaded.');
  assert.equal(player.$.statusText, player.$.errorText);
  assert.deepEqual(sessionCalls, beforeStaleDetail.sessionCalls);
  assert.equal(mountCalls, beforeStaleDetail.mountCalls);
  assert.equal(showPlayer.bindCalls, beforeStaleDetail.bindCalls);
  assert.equal(showPlayer.stateCalls, beforeStaleDetail.stateCalls);
  assert.equal(phases.length, beforeStaleDetail.phases);
  assert.equal(narrationHandoffs.length, beforeStaleDetail.narrationHandoffs);
  assert.equal(messages.length, beforeStaleDetail.messages + 1);
  assert.equal(messages.filter((message) => message.parts?.some((part) => (
    part.type === 'error' && part.text === player.$.errorText
  ))).length, 1);

  dock.dispatchEvent(new CustomEvent('agent-show-action', {
    detail: {
      id: 'symbiote-ui.actions',
      actionId: 'details',
      payload: { branchId: 'symbiote-ui-details', sceneId: 'symbiote-ui' },
    },
  }));
  await new Promise((resolve) => setImmediate(resolve));

  assert.equal(player.$.inBranch, true);
  assert.equal(sessionCalls.enterBranch, beforeStaleDetail.sessionCalls.enterBranch + 1);
  assert.equal(sessionCalls.appendMessage, beforeStaleDetail.sessionCalls.appendMessage + 1);
  assert.equal(showPlayer.bindCalls, beforeStaleDetail.bindCalls + 1);
  assert.equal(phases.length > beforeStaleDetail.phases, true);
  assert.deepEqual(
    phases[beforeStaleDetail.phases]?.directives?.map(({ id }) => id),
    ['symbiote-ui.open'],
    'a historical detail branch must first restore its owner article setup',
  );
  assert.equal(narrationHandoffs.length, beforeStaleDetail.narrationHandoffs + 1);

  const beforeRestartReturnCalls = sessionCalls.returnFromBranch;
  const restartWasPlaying = progressConfig.controller.isPlaying;
  const restartEvents = [];
  player.addEventListener('portfolio-show-seek', (event) => restartEvents.push(event.detail));
  progressConfig.controller.seek(0, 0);
  await new Promise((resolve) => setTimeout(resolve, 0));

  assert.equal(player.$.inBranch, false, 'Restart leaves the active detail branch');
  assert.equal(
    sessionCalls.returnFromBranch,
    beforeRestartReturnCalls + 1,
    'Restart closes the branch in the shared Show session',
  );
  assert.equal(progressConfig.controller.index, 0, 'Restart selects the first main segment');
  assert.equal(
    progressConfig.controller.isPlaying,
    restartWasPlaying,
    'Restart preserves the active branch playing/paused state',
  );
  assert.deepEqual(player.routeSnapshot, {
    mode: 'short',
    entryId: 'positioning',
    detailId: '',
    timeMs: 0,
    play: restartWasPlaying,
    running: true,
    completed: false,
  });
  assert.deepEqual(restartEvents, [{ index: 0, positionMs: 0 }]);

  restartEvents.length = 0;
  progressConfig.controller.seek(0, 1_111);
  progressConfig.controller.seek(0, 2_222);
  await new Promise((resolve) => setTimeout(resolve, 0));
  assert.deepEqual(
    restartEvents,
    [{ index: 0, positionMs: 2_222 }],
    'two rapid seeks publish only the latest transport intent',
  );

  player.stopShow({ completed: true });
  assert.equal(player.$.isRunning, false);
  assert.equal(player.$.inBranch, false);
  const beforeTerminalDetail = {
    enterBranch: sessionCalls.enterBranch,
    mountCalls,
  };
  const terminalDetailOpened = new Promise((resolve) => {
    player.addEventListener('portfolio-show-phase', resolve, { once: true });
  });
  const terminalShowRestarted = new Promise((resolve) => {
    player.addEventListener('portfolio-show-start', resolve, { once: true });
  });
  dock.dispatchEvent(new CustomEvent('agent-show-action', {
    detail: {
      id: 'symbiote-ui.actions',
      actionId: 'details',
      payload: { branchId: 'symbiote-ui-details', sceneId: 'symbiote-ui' },
    },
  }));
  const [terminalPhaseEvent, terminalStartEvent] = await Promise.all([
    terminalDetailOpened,
    terminalShowRestarted,
  ]);

  assert.equal(player.$.isRunning, true, 'a completed Show can reopen an emitted detail action');
  assert.equal(
    terminalStartEvent.detail.completedDetailReview,
    true,
    'the reopened detail review restores the host presentation lifecycle',
  );
  assert.deepEqual(
    terminalPhaseEvent.detail.directives.map(({ id }) => id),
    ['symbiote-ui.open'],
    'terminal detail review restores the owner article before branch setup',
  );
  assert.equal(player.$.inBranch, true);
  assert.equal(sessionCalls.enterBranch, beforeTerminalDetail.enterBranch + 1);
  assert.equal(mountCalls, beforeTerminalDetail.mountCalls + 1);

  const beforeTerminalReturnMessages = messages.length;
  const terminalCompletionEvents = [];
  dock.addEventListener('portfolio-show-complete', (event) => {
    terminalCompletionEvents.push(event.detail);
  });
  dock.dispatchEvent(new CustomEvent('agent-show-action', {
    detail: { actionId: 'return' },
  }));
  assert.equal(player.$.isRunning, false, 'returning from a terminal review preserves completion');
  assert.equal(player.$.inBranch, false);
  assert.equal(
    messages.length,
    beforeTerminalReturnMessages,
    'terminal detail return does not append a misleading resume action',
  );
  assert.deepEqual(
    terminalCompletionEvents,
    [{
      reason: 'explicit',
      routeState: {
        mode: 'short',
        entryId: 'symbiote-ui',
        detailId: '',
        timeMs: 0,
        play: false,
        running: true,
        completed: true,
      },
    }],
    'terminal detail return closes the external Show lifecycle with completion semantics',
  );
  dock.dispatchEvent(new CustomEvent('agent-show-action', {
    detail: { actionId: 'return' },
  }));
  assert.equal(
    terminalCompletionEvents.length,
    1,
    'a repeated return cannot close the same external Show lifecycle twice',
  );
});

test('historical branch snapshot separates the current return parent from contextual ownership', () => {
  const returnParentEntry = CV_SHOW_STORY.scenes.find(({ id }) => id === 'symbiote-ui');
  const historicalOwnerEntry = CV_SHOW_STORY.scenes.find(({ id }) => id === 'symbiote-workspace');
  const branchEntry = CV_SHOW_STORY.branches['workspace-details'];
  const playback = {
    episodeId: 'short',
    cueIndex: 2,
    positionMs: 2_005,
    playbackState: 'paused',
    subjectId: returnParentEntry.id,
  };
  const expected = {
    masterProjectHash: CV_SHOW_PRESENTATION_PROJECT.hash,
    masterRevision: CV_SHOW_PRESENTATION_PROJECT.revision,
    returnParentEntry,
    historicalOwnerEntry,
    branchEntry,
    contextualCardId: 'symbiote-workspace.actions',
    contextualActionId: 'details',
  };
  const snapshot = createCvShowBranchReturnSnapshot({ ...expected, playback });
  assert.equal(validateCvShowBranchReturnSnapshot(snapshot, expected), snapshot);
  assert.equal(snapshot.entry.id, 'symbiote-ui');
  assert.equal(snapshot.binding.historicalOwnerEntryId, 'symbiote-workspace');
  assert.equal(snapshot.binding.branchEntryId, 'workspace-details');
  assert.equal(snapshot.binding.checkpointMs, playback.positionMs);

  for (let field of [
    'masterProjectHash',
    'masterRevision',
    'returnParentEntryId',
    'historicalOwnerEntryId',
    'branchEntryId',
    'checkpointMs',
    'contextualCardId',
    'contextualActionId',
  ]) {
    const mutated = structuredClone(snapshot);
    mutated.binding[field] = typeof mutated.binding[field] === 'number'
      ? mutated.binding[field] + 1
      : `${mutated.binding[field]}-drift`;
    assert.throws(
      () => validateCvShowBranchReturnSnapshot(mutated, expected),
      (error) => error.code === 'CV_SHOW_BRANCH_RETURN_SNAPSHOT_MISMATCH'
        && error.details.field === field,
      field,
    );
  }
});

test('CV presentation chat uses project context and never republishes narration', () => {
  let projectScenes = CV_SHOW_STORY.scenes.filter(({ branchId }) => branchId);
  let detailLabels = new Set();
  assert.equal(projectScenes.length, 14);

  for (let scene of projectScenes) {
    let context = createCvShowPresentationContext(scene);
    assert.equal(context.actions.length, 1, scene.id);
    assert.equal(context.actions[0].id, 'details');
    assert.match(context.actions[0].label, /Подробнее/u, scene.id);
    assert.notEqual(context.actions[0].label, 'Подробнее', scene.id);
    detailLabels.add(context.actions[0].label);
    assert.notEqual(context.text, scene.subtitle, scene.id);
    assert.notEqual(context.text, scene.speech, scene.id);
    assert.equal(context.text.includes(scene.subtitle), false, scene.id);
  }
  assert.equal(detailLabels.size, projectScenes.length);

  for (let branch of Object.values(CV_SHOW_STORY.branches)) {
    let context = createCvShowPresentationContext(branch, {
      inBranch: true,
      returnLabel: 'Вернуться к рассказу',
    });
    assert.equal(context.actions[0].id, 'return', branch.id);
    assert.equal(context.actions[0].label, 'Вернуться к рассказу', branch.id);
    assert.notEqual(context.text, branch.subtitle, branch.id);
    assert.notEqual(context.text, branch.speech, branch.id);
  }
});

test('new CV chat messages stream from frame timestamps and cancellation settles honestly', async () => {
  let callbacks = [];
  let updates = [];
  let controller = new AbortController();
  let requestFrame = (callback) => {
    callbacks.push(callback);
    return callbacks.length;
  };
  let pending = createCvShowMessageStream('Потоковое сообщение', {
    signal: controller.signal,
    requestFrame,
    cancelFrame() {},
    charactersPerSecond: 10,
    onUpdate: (text, receipt) => updates.push([text, receipt.status]),
  });
  callbacks.shift()(100);
  callbacks.shift()(600);
  assert.equal(updates[0][0].length > 0, true);
  assert.equal(updates.at(-1)[0].length < 'Потоковое сообщение'.length, true);
  controller.abort();
  assert.equal((await pending).status, 'cancelled');

  callbacks = [];
  updates = [];
  pending = createCvShowMessageStream('Коротко', {
    requestFrame,
    cancelFrame() {},
    onUpdate: (text, receipt) => updates.push([text, receipt.status]),
  });
  callbacks.shift()(100);
  callbacks.shift()(600);
  assert.equal(updates.at(-1)[1], 'streaming', 'short replies retain a visible streaming interval');
  callbacks.shift()(1_100);
  assert.equal((await pending).status, 'completed');
});

test('CV chat streams are single-flight and cancelled operations cannot mutate later', async () => {
  const pending = [];
  const createStream = (text, { signal, onUpdate }) => new Promise((resolve) => {
    const operation = { text, signal, onUpdate, resolve };
    pending.push(operation);
    signal.addEventListener('abort', () => {
      resolve(Object.freeze({ status: 'cancelled', text }));
    }, { once: true });
  });
  const controller = createCvShowMessageStreamController({ createStream });
  const firstUpdates = [];
  const secondUpdates = [];
  let completedActions = 0;
  const first = controller.start({
    displayId: 'mock.unknown.reply',
    text: 'Первый ответ',
    onUpdate: (value) => firstUpdates.push(value),
  });
  pending[0].onUpdate('Перв');
  const second = controller.start({
    displayId: 'mock.unknown.reply',
    text: 'Второй ответ',
    onUpdate: (value) => secondUpdates.push(value),
    onCompleted: () => { completedActions += 1; },
  });

  assert.notEqual(first.operationId, second.operationId);
  assert.equal(first.displayId, second.displayId);
  assert.equal(pending[0].signal.aborted, true);
  assert.deepEqual(controller.snapshot, {
    activeCount: 1,
    activeOperationId: second.operationId,
  });
  pending[0].onUpdate('Первый ответ');
  pending[1].onUpdate('Втор');
  assert.deepEqual(firstUpdates, ['Перв']);
  assert.deepEqual(secondUpdates, ['Втор']);
  assert.equal(completedActions, 0, 'actions stay hidden while the text is growing');

  controller.cancel('stop');
  pending[1].onUpdate('Второй ответ');
  assert.equal((await first.promise).status, 'cancelled');
  assert.equal((await second.promise).status, 'cancelled');
  assert.deepEqual(secondUpdates, ['Втор']);
  assert.equal(completedActions, 0);
  assert.deepEqual(controller.snapshot, { activeCount: 0, activeOperationId: '' });

  const third = controller.start({
    displayId: 'mock.unknown.reply',
    text: 'Третий ответ',
    onUpdate: (value) => secondUpdates.push(value),
    onCompleted: () => { completedActions += 1; },
  });
  pending[2].onUpdate('Трет');
  assert.equal(completedActions, 0);
  pending[2].resolve(Object.freeze({ status: 'completed', text: 'Третий ответ' }));
  assert.equal((await third.promise).status, 'completed');
  assert.equal(completedActions, 1, 'actions become eligible only after completed text');
  assert.deepEqual(controller.snapshot, { activeCount: 0, activeOperationId: '' });
});

test('Short and Full modes use the canonical 16-scene and 30-entry narration sets', () => {
  const short = createCvShowPlaybackEntries(CV_SHOW_STORY, 'short');
  const full = createCvShowPlaybackEntries(CV_SHOW_STORY, 'full');
  assert.equal(short.length, 16);
  assert.equal(full.length, 30);
  assert.deepEqual(short.map(({ id }) => id), EXPECTED_SHORT_SEQUENCE);
  assert.deepEqual(full.slice(0, 5).map(({ id }) => id), [
    'positioning',
    'symbiote-workspace',
    'workspace-details',
    'symbiote-ui',
    'symbiote-ui-details',
  ]);
});

test('active Russian narration keeps the approved direct-voice constraints', () => {
  const activeNarration = [
    ...CV_SHOW_STORY.scenes.flatMap(scene => [scene.subtitle, scene.speech]),
    ...Object.values(CV_SHOW_STORY.branches).flatMap(branch => [branch.subtitle, branch.speech]),
  ].join('\n');
  assert.doesNotMatch(activeNarration, /\bне\s+[^.!?\n]{0,80},?\s+а\s+[^.!?\n]+/iu);
  assert.doesNotMatch(activeNarration, /\bа не\b|\bне просто\b/iu);
  assert.doesNotMatch(activeNarration, /ComfyUI|Image AI/iu);
  assert.equal(CV_SHOW_STORY.scenes.find(scene => scene.id === 'adaptive-maximo-workbench').period, 'Date pending');
  assert.equal(CV_SHOW_STORY.scenes.find(scene => scene.id === 'mobile-smm-platform').period, 'Date pending');
});

test('CV adapter explicitly maps all nine product directives to the accepted shared contract', () => {
  const sourceByType = {
    navigate: { id: 'd.navigate', type: 'navigate', target: 'projects/example' },
    frame: { id: 'd.frame', type: 'frame', target: 'article.example.intro' },
    'native-selection': {
      id: 'd.selection',
      type: 'native-selection',
      target: 'article.example.quote',
      quote: 'meaningful source quote',
      occurrence: 1,
    },
    marker: {
      id: 'd.marker',
      type: 'marker',
      target: 'article.example.map',
      shape: 'ovals',
      text: 'A',
      quote: 'exact marker phrase',
      occurrence: 2,
    },
    activate: { id: 'd.activate', type: 'activate', target: 'article.example.demo' },
    media: {
      id: 'd.media',
      type: 'media',
      target: 'article.example.video',
      mode: 'short-muted-montage',
      segments: [0.2, 0.5, 0.8],
      segmentDurationMs: 450,
      frames: [1, 2, 3, 4, 5],
      frameHoldMs: 600,
      finalFrame: 5,
      keepPlayingDuringQuote: true,
    },
    'chat-note': { id: 'd.note', type: 'chat-note', target: 'chat.note.example' },
    'chat-action': { id: 'd.actions', type: 'chat-action', target: 'chat.actions.example', actions: ['projects'] },
    idle: { id: 'd.idle', type: 'idle' },
  };
  const mapped = Object.fromEntries(Object.entries(sourceByType).map(([type, source]) => [
    type,
    adaptCvShowDirective(source, { resolveText: (key) => `text:${key}` }).directive,
  ]));

  assert.deepEqual(Object.keys(mapped), CV_SHOW_DIRECTIVE_TYPES);
  assert.equal(mapped.navigate.type, 'attention');
  assert.equal(mapped.navigate.mode, 'click');
  assert.equal(mapped.frame.mode, 'frame');
  assert.equal(mapped['native-selection'].mode, 'native-selection');
  assert.equal(mapped['native-selection'].quote, 'meaningful source quote');
  assert.equal(mapped['native-selection'].occurrence, 1);
  assert.equal(mapped.marker.mode, 'marker');
  assert.equal(mapped.marker.marker, 'multi-oval');
  assert.equal(mapped.marker.requestedMarker, 'ovals');
  assert.equal(mapped.marker.quote, 'exact marker phrase');
  assert.equal(mapped.marker.occurrence, 2);
  assert.equal(mapped.activate.mode, 'click');
  assert.equal(mapped.media.type, 'media');
  assert.deepEqual(mapped.media.segments, [0.2, 0.5, 0.8]);
  assert.equal(mapped.media.segmentDurationMs, 450);
  assert.deepEqual(mapped.media.frames, [1, 2, 3, 4, 5]);
  assert.equal(mapped.media.frameHoldMs, 600);
  assert.equal(mapped.media.finalFrame, 5);
  assert.equal(mapped.media.keepPlayingDuringQuote, true);
  assert.equal(mapped['chat-note'].type, 'footnote');
  assert.equal(mapped['chat-action'].type, 'actions');
  assert.equal(mapped.idle.type, 'status');
});

test('CV runner prepares media targets when the phase starts', async () => {
  const order = [];
  const mediaTarget = {
    id: 'media-target',
    element: { matches: () => false },
    prepareShowMedia: async ({ signal }) => {
      order.push(['prepare', Boolean(signal)]);
      return { kind: 'ims-gallery', ready: true };
    },
  };
  const runtime = {
    entries: new Map([['projects/boothbot', {}]]),
    selectedId: 'projects/complexscan',
    select(id, options) { order.push(['select', id, options]); this.selectedId = id; },
  };
  const runner = createCvShowDirectiveRunner({
    document: {},
    runtime,
    media: { play: async (target) => { order.push(['media', target]); return { played: true }; } },
    resolveMedia: (targetId) => {
      order.push(['resolveMedia', targetId]);
      return mediaTarget;
    },
    resolveText: (key) => key,
    waitForReadiness: async ({ target }) => ({ target }),
  });

  const result = await runner.run([
    { id: 'd.gallery', type: 'media', target: 'media/boothbot/ims/gallery', mode: 'short-muted-montage' },
  ]);
  assert.equal(result.status, 'success');
  assert.deepEqual(order.slice(0, 3), [
    ['select', 'projects/boothbot', { focus: true, updateUrl: false }],
    ['resolveMedia', 'media/boothbot/ims/gallery'],
    ['prepare', true],
  ]);
  assert.ok(order.some(([name, value]) => name === 'media' && value === mediaTarget));
});

test('CV runner opens the owning article project for media targets before resolving them', async () => {
  const order = [];
  const mediaTarget = { id: 'media-target', element: { matches: () => false } };
  const runtime = {
    entries: new Map([['projects/boothbot', {}]]),
    selectedId: 'projects/complexscan',
    select(id, options) { order.push(['select', id, options]); this.selectedId = id; },
  };
  const runner = createCvShowDirectiveRunner({
    document: {},
    runtime,
    media: { play: async (element) => { order.push(['media', element]); return { played: true }; } },
    resolveMedia: (targetId) => {
      order.push(['resolveMedia', targetId]);
      return mediaTarget;
    },
    resolveText: (key) => key,
    waitForReadiness: async ({ target }) => ({ target }),
  });

  const result = await runner.run([
    { id: 'd.gallery', type: 'media', target: 'media/boothbot/ims/gallery', mode: 'short-muted-montage' },
  ]);
  assert.equal(result.status, 'success');
  assert.deepEqual(order.slice(0, 4), [
    ['select', 'projects/boothbot', { focus: true, updateUrl: false }],
    ['resolveMedia', 'media/boothbot/ims/gallery'],
    ['resolveMedia', 'media/boothbot/ims/gallery'],
    ['media', mediaTarget],
  ]);
});

test('CV runner skips article selection for media targets already owned by the selected project', async () => {
  const order = [];
  const runtime = {
    entries: new Map([['projects/boothbot', {}]]),
    selectedId: 'projects/boothbot',
    select: () => { order.push('select'); },
  };
  const runner = createCvShowDirectiveRunner({
    document: {},
    runtime,
    media: { play: async () => ({ played: true }) },
    resolveMedia: () => ({ element: { matches: () => false } }),
    resolveText: (key) => key,
    waitForReadiness: async ({ target }) => ({ target }),
  });

  const result = await runner.run([
    { id: 'd.gallery', type: 'media', target: 'media/boothbot/ims/gallery', mode: 'short-muted-montage' },
  ]);
  assert.equal(result.status, 'success');
  assert.deepEqual(order, []);
});

test('CV runner delegates navigation, attention, media, and chat events through shared APIs', async () => {
  const order = [];
  const attentionRequests = [];
  const readinessRequests = [];
  const target = { id: 'target' };
  const markerTarget = { id: 'marker-range-proxy' };
  const mediaElement = { id: 'media-element', matches: () => false };
  const mediaTarget = { id: 'media-target', element: mediaElement };
  const runtime = {
    entries: new Map([['projects/example', {}]]),
    select(id, options) { order.push(['select', id, options]); },
  };
  const runner = createCvShowDirectiveRunner({
    document: {},
    runtime,
    attention: { present: (request) => { attentionRequests.push(request); order.push(['attention', request.mode, request.target]); return { presented: true }; }, clearTransient() {} },
    media: { play: async (element, directive) => { order.push(['media', element, directive.mode]); return { played: true }; } },
    emit: (directive) => order.push(['emit', directive.type]),
    resolveTarget: () => target,
    resolveMedia: () => mediaTarget,
    resolveMarkerTarget: (_target, directive) => directive.quote ? markerTarget : target,
    resolveText: (key) => key,
    activateTarget: () => { order.push(['activate']); return true; },
    waitForReadiness: async ({ target: requested, media }) => {
      const resolved = typeof requested === 'function' ? requested() : requested;
      readinessRequests.push({ target: resolved, media });
      return { target: resolved, media };
    },
  });
  const sources = [
    { id: 'd.navigate', type: 'navigate', target: 'projects/example' },
    { id: 'd.frame', type: 'frame', target: 'article.example.intro' },
    { id: 'd.selection', type: 'native-selection', target: 'article.example.quote', quote: 'meaningful', occurrence: 2 },
    { id: 'd.marker', type: 'marker', target: 'article.example.map', shape: 'oval', quote: 'exact phrase', occurrence: 2 },
    { id: 'd.activate', type: 'activate', target: 'article.example.demo' },
    { id: 'd.media', type: 'media', target: 'article.example.video', mode: 'short-muted-montage' },
    { id: 'd.note', type: 'chat-note', target: 'chat.note.example' },
    { id: 'd.actions', type: 'chat-action', target: 'chat.actions.example', actions: ['projects'] },
    { id: 'd.idle', type: 'idle' },
  ];

  const result = await runner.run(sources);
  assert.equal(result.status, 'success');
  assert.equal(result.receipts.length, 9);
  assert.deepEqual(result.receipts.map(({ sourceType }) => sourceType), CV_SHOW_DIRECTIVE_TYPES);
  assert.deepEqual(order.find(([name]) => name === 'select'), [
    'select',
    'projects/example',
    { focus: true, updateUrl: false },
  ]);
  assert.equal(order.filter(([name]) => name === 'attention').length, 5);
  assert.equal(
    attentionRequests.find(({ gestureId }) => gestureId === 'd.marker')?.annotation?.intent,
    'emphasize',
  );
  assert.equal(
    attentionRequests.find(({ gestureId }) => gestureId === 'd.marker')?.target,
    markerTarget,
  );
  assert.equal(
    attentionRequests.find(({ gestureId }) => gestureId === 'd.selection')?.occurrence,
    2,
  );
  assert.equal(order.filter(([name]) => name === 'media').length, 1);
  assert.equal(order.find(([name]) => name === 'media')?.[1], mediaTarget);
  assert.deepEqual(
    readinessRequests.find(request => request.target === mediaElement)?.media,
    [],
  );
  assert.equal(order.filter(([name]) => name === 'activate').length, 1);
  assert.equal(order.filter(([name]) => name === 'emit').length, 8);
  assert.equal(order.some(([name, type]) => name === 'emit' && type === 'status'), false);
});

test('CV runner keeps a bounded media Project cell active until its completion barrier settles', async () => {
  let releaseCompletion;
  const completion = new Promise((resolve) => { releaseCompletion = resolve; });
  let mediaStarted = false;
  const runner = createCvShowDirectiveRunner({
    document: {},
    runtime: { entries: new Map() },
    resolveMedia: () => ({ element: { matches: () => false } }),
    media: {
      async play() {
        mediaStarted = true;
        return Object.freeze({
          mode: 'short-muted-montage',
          completion,
        });
      },
    },
    waitForReadiness: async ({ target }) => ({ target }),
  });

  const pending = runner.run([{
    id: 'bounded.media',
    type: 'media',
    target: 'media/example/youtube/demo',
    mode: 'short-muted-montage',
    segments: [0.2, 0.5, 0.8],
    segmentDurationMs: 450,
    policy: 'required',
  }]);
  await Promise.resolve();
  await Promise.resolve();

  let settled = false;
  void pending.then(() => { settled = true; });
  await new Promise((resolve) => setImmediate(resolve));
  assert.equal(mediaStarted, true);
  assert.equal(settled, false, 'the next Project cell must wait for the media completion barrier');

  releaseCompletion(Object.freeze({ status: 'completed' }));
  const result = await pending;
  assert.equal(result.status, 'success');
  assert.equal(result.receipts[0].result.mode, 'short-muted-montage');
});

test('CV navigation presents the selected article instead of a hidden tree row', async () => {
  const staleRow = { id: 'stale-row' };
  const freshRow = { id: 'fresh-row' };
  const viewer = { id: 'viewer', getAttribute: () => null };
  const order = [];
  const runtime = {
    entries: new Map([['projects/example', {}]]),
    selectedId: 'profile/photo',
    viewer,
    select(id) {
      order.push(`select:${id}`);
      this.selectedId = id;
      return true;
    },
  };
  const runner = createCvShowDirectiveRunner({
    document: {},
    runtime,
    attention: {
      present({ target, mode }) { order.push(`present:${target.id}`); return { presented: true, mode }; },
      clearMarkers() {},
      clearTransient() {},
    },
    resolveTarget: () => runtime.selectedId === 'projects/example' ? freshRow : staleRow,
    resolveText: (key) => key,
    waitForReadiness: async ({ target }) => {
      const resolved = typeof target === 'function' ? target() : target;
      order.push(`ready:${resolved === viewer ? 'viewer' : resolved.id}`);
      return { target: resolved };
    },
  });

  const result = await runner.run([{
    id: 'example.open',
    type: 'navigate',
    target: 'projects/example',
    policy: 'required',
  }]);

  assert.equal(result.status, 'success');
  assert.equal(
    result.receipts[0].result.phases.find(({ phase }) => phase === 'act').result.selectedId,
    'projects/example',
  );
  assert.deepEqual(order, [
    'ready:stale-row',
    'select:projects/example',
    'ready:viewer',
    'present:viewer',
  ]);
  assert.equal(
    result.receipts[0].result.phases.find(({ phase }) => phase === 'act').result.mode,
    'click',
  );
});

test('CV map navigation preserves the graph target supplied by the panel lifecycle', async () => {
  const treeRow = { id: 'projects-tree-row' };
  const graphNode = { id: 'projects-graph-node' };
  const presented = [];
  const runtime = {
    entries: new Map([['projects/index', {}]]),
    selectedId: 'projects/photopizza',
    viewer: { getAttribute: () => null },
    select(id) {
      this.selectedId = id;
      return true;
    },
  };
  const runner = createCvShowDirectiveRunner({
    document: {},
    runtime,
    attention: {
      present({ target }) {
        presented.push(target.id);
        return { presented: true };
      },
      clearMarkers() {},
      clearTransient() {},
    },
    actionAdapter: {
      inspect: () => ({ open: false }),
      reveal: () => ({ changed: true }),
      awaitTransition: () => ({ ready: true }),
      awaitTarget: () => ({ target: graphNode }),
      restore: () => ({ changed: false }),
    },
    resolveTarget: () => treeRow,
    resolveText: (key) => key,
    waitForReadiness: async ({ target }) => ({
      target: typeof target === 'function' ? target() : target,
    }),
  });

  const result = await runner.run([{
    id: 'finale.map',
    type: 'navigate',
    target: 'projects/index',
    policy: 'required',
  }]);

  assert.equal(result.status, 'success');
  assert.deepEqual(presented, ['projects-graph-node']);
});

test('CV runner distinguishes required and optional missing targets', async () => {
  const createRunner = () => createCvShowDirectiveRunner({
    document: {},
    runtime: { entries: new Map() },
    attention: { clearTransient() {} },
    resolveTarget: () => null,
    resolveMedia: () => null,
    resolveText: (key) => key,
    waitForReadiness: async () => {
      const error = new Error('missing');
      error.code = 'timeout';
      throw error;
    },
  });
  const base = { id: 'd.frame', type: 'frame', target: 'article.example.intro' };
  assert.equal((await createRunner().run([{ ...base, policy: 'required' }])).status, 'required-missing');
  assert.equal((await createRunner().run([{ ...base, policy: 'optional' }])).status, 'optional-missing');
});

test('CV runner freezes presenter attention on pause and clears it only on Stop', () => {
  const calls = [];
  const runner = createCvShowDirectiveRunner({
    attention: {
      pause() { calls.push('pause-attention'); },
      resume() { calls.push('resume-attention'); },
      clearTransient() { calls.push('clear-transient'); },
      clearMarkers() { calls.push('clear-markers'); },
    },
    media: { stop(reason) { calls.push(`stop:${reason}`); } },
  });

  runner.pause();
  assert.deepEqual(calls, ['pause-attention']);
  runner.resume();
  assert.deepEqual(calls, ['pause-attention', 'resume-attention']);
  runner.stop();
  assert.deepEqual(calls, [
    'pause-attention',
    'resume-attention',
    'clear-markers',
    'clear-transient',
    'stop:phase-changed',
  ]);
});

test('CV phase replacement preserves the presenter arrow while Stop performs terminal cleanup', () => {
  const clears = [];
  const runner = createCvShowDirectiveRunner({
    attention: {
      clearMarkers() {},
      clearTransient(...args) { clears.push(args); },
    },
    media: { stop() {} },
  });

  runner.beginPhase();
  assert.deepEqual(clears.at(-1), [
    'replacement',
    { preserveInk: false, preserveCursor: true },
  ]);

  runner.seek();
  assert.deepEqual(clears.at(-1), [
    'seek',
    { preserveInk: false, preserveCursor: true },
  ]);

  runner.stop();
  assert.deepEqual(clears.at(-1), [
    'stop',
    { preserveInk: false, preserveCursor: false },
  ]);
});

test('CV runtime cleanup consumes rejected stop, skip, and release tasks with one deterministic report', async () => {
  const reports = [];
  const order = [];
  const stopError = new AggregateError([new Error('pause failed')], 'stop failed');
  const releaseError = new AggregateError([new Error('lease failed')], 'release failed');
  const skipError = new AggregateError([new Error('skip restore failed')], 'skip failed');
  const cleanup = createCvShowRuntimeCleanup({
    media: {
      async stop(reason) {
        order.push(`stop:${reason}`);
        throw stopError;
      },
      async skip() {
        order.push('skip');
        throw skipError;
      },
    },
    audioArbiter: {
      async release({ reason }) {
        order.push(`release:${reason}`);
        throw releaseError;
      },
    },
    reportError: (report) => reports.push(report),
  });

  const terminal = await cleanup.stopAndRelease('show-terminal', {
    operation: 'show-terminal-cleanup',
  });
  const skipped = await cleanup.skip({ operation: 'media-skip' });

  assert.deepEqual(order, [
    'stop:show-terminal',
    'release:show-terminal',
    'skip',
  ]);
  assert.equal(terminal.status, 'failed');
  assert.equal(skipped.status, 'failed');
  assert.equal(reports.length, 2);
  assert.deepEqual(
    reports.map(({ type, operation, reason, code, message }) => ({
      type,
      operation,
      reason,
      code,
      message,
    })),
    [
      {
        type: 'show:runtime-error',
        operation: 'show-terminal-cleanup',
        reason: 'show-terminal',
        code: 'show-runtime-error',
        message: 'CV Show runtime cleanup failed for "show-terminal"',
      },
      {
        type: 'show:runtime-error',
        operation: 'media-skip',
        reason: 'skipped',
        code: 'show-runtime-error',
        message: 'skip failed',
      },
    ],
  );
  assert.deepEqual(reports[0].error.errors, [stopError, releaseError]);
  assert.equal(reports[1].error, skipError);
});

test('CV runner consumes a rejected phase media stop through its runtime reporter', async () => {
  const stopError = new AggregateError([new Error('restore failed')], 'phase stop failed');
  const reports = [];
  const runner = createCvShowDirectiveRunner({
    attention: { clearMarkers() {}, clearTransient() {} },
    media: { stop: async () => { throw stopError; } },
    reportRuntimeError: (report) => reports.push(report),
  });

  runner.beginPhase();
  await Promise.resolve();
  await Promise.resolve();

  assert.equal(reports.length, 1);
  assert.equal(reports[0].type, 'show:runtime-error');
  assert.equal(reports[0].operation, 'media-stop:replacement');
  assert.equal(reports[0].reason, 'phase-changed');
  assert.equal(reports[0].error, stopError);
});

function freezeProviderValue(value) {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
  for (let child of Object.values(value)) freezeProviderValue(child);
  return Object.freeze(value);
}

function providerObservation(monotonicTimeMs) {
  return freezeProviderValue({
    domain: 'performance',
    timeOriginMs: 1_700_000_000_000,
    monotonicTimeMs,
  });
}

function providerAdmissionFixture({
  status = 'admitted',
  mode = 'frame',
  gestureId = 'example.frame',
  targetId = 'target',
  limitMs = 650,
  plannedDurationMs = 540,
  reason = null,
} = {}) {
  let targetUnavailable = reason?.provider?.code === 'target-unresolved';
  let planAvailable = !targetUnavailable;
  return freezeProviderValue({
    version: 'show-attention-admission-v2',
    status,
    provider: {
      id: 'symbiote-ui/show-attention',
      version: 'show-attention-provider-v1',
    },
    effect: { mode, gestureId },
    target: {
      id: targetId,
      identity: targetUnavailable ? null : 'target-identity-sha256',
      layoutIdentity: targetUnavailable ? null : 'layout-identity-sha256',
      geometryIdentity: targetUnavailable ? null : 'geometry-identity-sha256',
      geometry: targetUnavailable ? null : {
        targetRect: { left: 10, top: 20, right: 110, bottom: 70, width: 100, height: 50 },
      },
    },
    budget: { limitMs, plannedDurationMs },
    plan: {
      version: planAvailable ? 'show-attention-plan-v1' : null,
      identity: planAvailable ? 'show-attention-plan-id' : null,
      normalizedPathHash: planAvailable ? 'show-attention-path-sha256' : null,
      motion: planAvailable ? { durationMs: plannedDurationMs, distancePx: 100 } : null,
      evidence: planAvailable ? { presented: true, plannedDurationMs } : null,
    },
    reason: reason || {
      code: 'within-budget',
      message: 'the provider plan fits the explicit hard budget',
      provider: null,
    },
  });
}

function providerMilestoneFixture(admission, milestone, monotonicTimeMs) {
  let observedAt = providerObservation(monotonicTimeMs);
  return freezeProviderValue({
    version: 'show-attention-milestone-v2',
    milestone,
    observedAt,
    admission,
    providerReceipt: {
      version: 'presenter-effect-receipt-v2',
      status: milestone === 'first-frame' ? 'presenting' : 'settled',
      evidence: { milestone, monotonicTimeMs },
    },
  });
}

function providerTerminalFixture(
  admission,
  status,
  monotonicTimeMs,
  providerReceipt = null,
  terminalReason = status,
) {
  return freezeProviderValue({
    version: 'show-attention-terminal-v2',
    status,
    observedAt: providerObservation(monotonicTimeMs),
    admission,
    providerReceipt,
    timing: {
      startedAt: status === 'rejected' ? null : providerObservation(100),
      firstFrameAt: status === 'rejected' ? null : providerObservation(110),
      elapsedMs: Math.max(0, monotonicTimeMs - 100),
      durationMs: admission.budget.plannedDurationMs,
      terminalReason,
    },
  });
}

function presentationReporterError(code) {
  return Object.assign(new TypeError(code), { code });
}

function workspaceOperationFixture({
  kind = 'attention',
  interaction = null,
  source = null,
  controller = new AbortController(),
  events = [],
} = {}) {
  let admissions = [];
  let receipts = [];
  let active = true;
  let expectedStatuses = kind === 'attention'
    ? ['first-frame', 'settled']
    : kind === 'state' ? ['ready'] : ['acted', 'settled'];
  let operationSource = source || (kind === 'interaction' && interaction?.type === 'select'
    ? {
        id: 'example.selection',
        type: 'native-selection',
        target: 'target',
        quote: 'meaningful quote',
        occurrence: 1,
      }
    : { id: 'example.frame', type: 'frame', target: 'target' });
  let operation = {
    operationId: `presentation-effect-0-${kind}`,
    generation: 0,
    kind,
    scheduleCell: { cellId: `cv-show:cue:example-${kind}` },
    projectCell: {
      id: `cv-show:cue:example-${kind}`,
      cue: interaction
        ? { kind: 'interaction', targetId: 'target', interaction }
        : { kind: kind === 'state' ? 'state' : 'focus', targetId: 'target' },
      timing: { gestureDurationMs: 650 },
    },
    source: operationSource,
    signal: controller.signal,
    reportAdmission(input) {
      if (!active || controller.signal.aborted) {
        throw presentationReporterError('PRESENTATION_EFFECT_ADMISSION_STALE');
      }
      if (admissions.length) {
        throw presentationReporterError('PRESENTATION_EFFECT_ADMISSION_DUPLICATE');
      }
      assert.deepEqual(Object.keys(input), ['providerAdmission']);
      admissions.push(input);
      events.push('workspace:admission');
      return input;
    },
    reportReceipt(input) {
      if (!active || controller.signal.aborted) {
        throw presentationReporterError('PRESENTATION_EFFECT_RECEIPT_STALE');
      }
      assert.deepEqual(Object.keys(input), ['status', 'observedAt', 'providerReceipt']);
      if (input.status !== 'failed') {
        let reportedMilestones = receipts.filter(({ status }) => status !== 'failed');
        if (input.status !== expectedStatuses[reportedMilestones.length]) {
          throw presentationReporterError('PRESENTATION_EFFECT_RECEIPT_SEQUENCE_INVALID');
        }
      }
      receipts.push(input);
      events.push(`workspace:${input.status}`);
      return input;
    },
  };
  return {
    operation,
    admissions,
    receipts,
    deactivate() { active = false; },
  };
}

function scriptedAttentionProvider(script, onCancel = () => false) {
  let terminal = Promise.resolve(null);
  let request = null;
  return {
    present(input) {
      request = input;
      let result = script(input);
      terminal = Promise.resolve(result.terminal);
      return result.presentation || { presented: true };
    },
    whenSettled() { return terminal; },
    cancel(reason) { return onCancel(reason); },
    clearMarkers() {},
    clearTransient() {},
    get request() { return request; },
  };
}

function providerScenarioRunner(attention, options = {}) {
  return createCvShowDirectiveRunner({
    document: {},
    resolveTarget: () => ({}),
    resolveText: (key) => key,
    waitForReadiness: async ({ target }) => ({ target: target() }),
    attention,
    ...options,
  });
}

test('optional media failure settles the Workspace operation without failing the tour', async () => {
  const fixture = workspaceOperationFixture({
    kind: 'interaction',
    interaction: { type: 'click' },
    source: {
      id: 'optional.media',
      type: 'media',
      target: 'article.example.video',
      mode: 'short-muted-montage',
      policy: 'optional',
    },
  });
  const runner = createCvShowDirectiveRunner({
    document: {},
    resolveMedia: () => ({}),
    media: {
      async play() {
        throw Object.assign(new Error('autoplay unavailable'), { code: 'media-unavailable' });
      },
    },
    waitForReadiness: async ({ target }) => ({ target }),
    observePerformance: () => providerObservation(100),
  });

  assert.equal(await runCvShowPresentationOperation(runner, fixture.operation), undefined);
  assert.deepEqual(fixture.receipts.map(({ status }) => status), ['acted', 'settled']);
});

async function assertAdmittedProviderRelay({ kind, interaction, mode, firstStatus }) {
  let admission = providerAdmissionFixture({ mode, gestureId: `example.${mode}` });
  let firstFrame = providerMilestoneFixture(admission, 'first-frame', 110);
  let settled = providerMilestoneFixture(admission, 'settled', 640);
  let terminal = providerTerminalFixture(
    admission,
    'completed',
    640,
    settled.providerReceipt,
    'settled',
  );
  let releaseTerminal;
  let terminalGate = new Promise((resolve) => { releaseTerminal = resolve; });
  let markPresented;
  let presentedGate = new Promise((resolve) => { markPresented = resolve; });
  let attention = scriptedAttentionProvider((request) => {
    assert.equal(request.budgetMs, 650);
    assert.equal(request.targetIdentity, 'target');
    assert.equal(typeof request.onAdmission, 'function');
    assert.equal(typeof request.onMilestone, 'function');
    request.onAdmission(admission);
    request.onMilestone(firstFrame);
    markPresented();
    return { presentation: { presented: true, admission }, terminal: terminalGate };
  });
  let fixture = workspaceOperationFixture({ kind, interaction });
  let pending = runCvShowPresentationOperation(
    providerScenarioRunner(attention),
    fixture.operation,
  );
  await presentedGate;

  assert.equal(fixture.admissions[0].providerAdmission, admission);
  assert.equal(fixture.receipts[0].status, firstStatus);
  assert.equal(fixture.receipts[0].observedAt, firstFrame.observedAt);
  assert.equal(fixture.receipts[0].providerReceipt, firstFrame);
  assert.equal(Object.isFrozen(fixture.receipts[0].providerReceipt.providerReceipt.evidence), true);
  attention.request.onMilestone(settled);
  let completed = false;
  void pending.then(() => { completed = true; });
  await Promise.resolve();
  assert.equal(completed, false, 'the Workspace operation awaits the exact UI terminal promise');
  releaseTerminal(terminal);
  assert.equal(await pending, undefined);
  assert.deepEqual(fixture.receipts.map(({ status }) => status), [firstStatus, 'settled']);
  assert.equal(fixture.receipts[1].observedAt, settled.observedAt);
  assert.equal(fixture.receipts[1].providerReceipt, settled);
}

test('admitted attention relays exact v2 admission and first-frame evidence', async () => {
  await assertAdmittedProviderRelay({
    kind: 'attention',
    interaction: null,
    mode: 'frame',
    firstStatus: 'first-frame',
  });
});

test('admitted semantic select maps exact v2 first-frame evidence to acted', async () => {
  await assertAdmittedProviderRelay({
    kind: 'interaction',
    interaction: { type: 'select', reversible: true },
    mode: 'native-selection',
    firstStatus: 'acted',
  });
});

test('checkpoint-held attention seeks the admitted provider to its settled visual frame', async () => {
  let admission = providerAdmissionFixture({ mode: 'frame', plannedDurationMs: 650 });
  let firstFrame = providerMilestoneFixture(admission, 'first-frame', 100);
  let settled = providerMilestoneFixture(admission, 'settled', 100);
  let terminal = providerTerminalFixture(
    admission,
    'completed',
    100,
    settled.providerReceipt,
    'settled',
  );
  let request;
  let seekCalls = [];
  let terminalGate;
  let attention = {
    clearMarkers() {},
    present(input) {
      request = input;
      input.onAdmission(admission);
      terminalGate = new Promise((resolve) => { this.resolveTerminal = resolve; });
      return { presented: true, admission };
    },
    seek(elapsedMs) {
      seekCalls.push(elapsedMs);
      request.onMilestone(firstFrame);
      request.onMilestone(settled);
      this.resolveTerminal(terminal);
      return settled.providerReceipt;
    },
    whenSettled() { return terminalGate; },
    cancel() { return false; },
  };
  let fixture = workspaceOperationFixture({
    source: {
      id: 'example.frame',
      type: 'frame',
      target: 'target',
      checkpointMode: 'restore-held',
    },
  });

  assert.equal(
    await runCvShowPresentationOperation(providerScenarioRunner(attention), fixture.operation),
    undefined,
  );
  assert.deepEqual(seekCalls, [650]);
  assert.deepEqual(fixture.receipts.map(({ status }) => status), ['first-frame', 'settled']);
});

test('frame-only article media settles immediately without starting a media action', () => {
  assert.equal(shouldInstantlySettleCvShowAttention({
    type: 'frame',
    target: 'media/photopizza/youtube/example',
  }), true);
  assert.equal(shouldInstantlySettleCvShowAttention({
    type: 'media',
    target: 'media/complexscan/ims/gallery',
  }), false);
  assert.equal(shouldInstantlySettleCvShowAttention({
    type: 'frame',
    target: 'article.photopizza.mechanics',
  }), false);
});

test('target-unresolved rejection relays the exact nested v2 provider detail', async () => {
  let reason = freezeProviderValue({
    code: 'provider-rejected',
    message: 'the provider could not resolve the semantic target',
    provider: {
      code: 'target-unresolved',
      targetId: 'missing-target',
      attempts: [{ selector: '[data-show-target="missing-target"]', matched: false }],
    },
  });
  let admission = providerAdmissionFixture({
    status: 'rejected',
    gestureId: 'example.frame',
    targetId: 'missing-target',
    plannedDurationMs: null,
    reason,
  });
  let terminal = providerTerminalFixture(admission, 'rejected', 105, null, reason);
  let fixture = workspaceOperationFixture({
    source: { id: 'example.frame', type: 'frame', target: 'missing-target' },
  });
  let attention = scriptedAttentionProvider((request) => {
    request.onAdmission(admission);
    return { presentation: { presented: false, admission }, terminal };
  });

  await assert.rejects(
    runCvShowPresentationOperation(providerScenarioRunner(attention), fixture.operation),
    (error) => (
      error.code === 'CV_SHOW_PRESENTATION_PROVIDER_REJECTED'
      && error.details.providerReceipt === terminal
    ),
  );
  assert.equal(fixture.admissions[0].providerAdmission, admission);
  assert.equal(fixture.admissions[0].providerAdmission.reason.provider.code, 'target-unresolved');
  assert.equal(fixture.admissions[0].providerAdmission.target.identity, null);
  assert.equal(fixture.admissions[0].providerAdmission.plan.identity, null);
  assert.deepEqual(fixture.receipts, []);
});

test('overbudget rejection relays the exact v2 plan and budget evidence', async () => {
  let reason = freezeProviderValue({
    code: 'budget-exceeded',
    message: 'the provider plan exceeds the explicit hard budget',
    provider: null,
  });
  let admission = providerAdmissionFixture({
    status: 'rejected',
    limitMs: 650,
    plannedDurationMs: 651,
    reason,
  });
  let terminal = providerTerminalFixture(admission, 'rejected', 101, null, reason);
  let fixture = workspaceOperationFixture();
  let attention = scriptedAttentionProvider((request) => {
    request.onAdmission(admission);
    return { presentation: { presented: false, admission }, terminal };
  });

  await assert.rejects(
    runCvShowPresentationOperation(providerScenarioRunner(attention), fixture.operation),
    (error) => (
      error.code === 'CV_SHOW_PRESENTATION_PROVIDER_REJECTED'
      && error.details.providerReceipt === terminal
    ),
  );
  assert.equal(fixture.admissions[0].providerAdmission, admission);
  assert.deepEqual(fixture.admissions[0].providerAdmission.budget, {
    limitMs: 650,
    plannedDurationMs: 651,
  });
  assert.equal(fixture.admissions[0].providerAdmission.reason, reason);
  assert.deepEqual(fixture.receipts, []);
});

test('immediate and reduced UI milestones follow synchronous Workspace admission', async () => {
  for (let motion of ['immediate', 'reduced']) {
    let events = [];
    let admission = providerAdmissionFixture({ plannedDurationMs: 0 });
    let firstFrame = providerMilestoneFixture(admission, 'first-frame', 100);
    let settled = providerMilestoneFixture(admission, 'settled', 100);
    let terminal = providerTerminalFixture(
      admission,
      'completed',
      100,
      settled.providerReceipt,
      'settled',
    );
    let fixture = workspaceOperationFixture({ events });
    let attention = scriptedAttentionProvider((request) => {
      events.push(`provider:${motion}:plan`);
      request.onAdmission(admission);
      events.push(`provider:${motion}:pixel`);
      request.onMilestone(firstFrame);
      request.onMilestone(settled);
      return { presentation: { presented: true, admission }, terminal };
    });

    assert.equal(
      await runCvShowPresentationOperation(providerScenarioRunner(attention), fixture.operation),
      undefined,
    );
    assert.deepEqual(events, [
      `provider:${motion}:plan`,
      'workspace:admission',
      `provider:${motion}:pixel`,
      'workspace:first-frame',
      'workspace:settled',
    ]);
    assert.equal(fixture.receipts[0].observedAt, firstFrame.observedAt);
    assert.equal(fixture.receipts[1].observedAt, settled.observedAt);
  }
});

test('failed UI terminal relays exact provider evidence before typed failure', async () => {
  let admission = providerAdmissionFixture();
  let firstFrame = providerMilestoneFixture(admission, 'first-frame', 110);
  let failureReceipt = freezeProviderValue({
    version: 'presenter-effect-receipt-v2',
    status: 'failed',
    reason: {
      code: 'render-failed',
      detail: { frame: 1, providerState: ['planned', 'presenting', 'failed'] },
    },
  });
  let terminal = providerTerminalFixture(
    admission,
    'failed',
    120,
    failureReceipt,
    failureReceipt.reason,
  );
  let fixture = workspaceOperationFixture();
  let attention = scriptedAttentionProvider((request) => {
    request.onAdmission(admission);
    request.onMilestone(firstFrame);
    return { presentation: { presented: true, admission }, terminal };
  });

  await assert.rejects(
    runCvShowPresentationOperation(providerScenarioRunner(attention), fixture.operation),
    (error) => (
      error.code === 'CV_SHOW_PRESENTATION_PROVIDER_FAILED'
      && error.details.providerReceipt === terminal
    ),
  );
  assert.deepEqual(fixture.receipts.map(({ status }) => status), ['first-frame', 'failed']);
  assert.equal(fixture.receipts[1].observedAt, terminal.observedAt);
  assert.equal(fixture.receipts[1].providerReceipt, terminal);
});

test('Workspace abort cancels the provider and suppresses every late mutation', async () => {
  let admission = providerAdmissionFixture();
  let firstFrame = providerMilestoneFixture(admission, 'first-frame', 110);
  let settled = providerMilestoneFixture(admission, 'settled', 640);
  let terminal;
  let releaseTerminal;
  let terminalGate = new Promise((resolve) => { releaseTerminal = resolve; });
  let controller = new AbortController();
  let fixture = workspaceOperationFixture({ controller });
  let markPresented;
  let presentedGate = new Promise((resolve) => { markPresented = resolve; });
  let cancelReasons = [];
  let attention = scriptedAttentionProvider((request) => {
    request.onAdmission(admission);
    request.onMilestone(firstFrame);
    markPresented();
    return { presentation: { presented: true, admission }, terminal: terminalGate };
  }, (reason) => {
    cancelReasons.push(reason);
    terminal = providerTerminalFixture(admission, 'cancelled', 120, null, {
      code: reason.code,
      message: reason.message,
    });
    releaseTerminal(terminal);
    return true;
  });
  let pending = runCvShowPresentationOperation(
    providerScenarioRunner(attention),
    fixture.operation,
  );
  await presentedGate;
  let abortReason = Object.assign(new Error('Workspace deadline expired'), {
    code: 'PRESENTATION_EFFECT_DEADLINE_MISSED',
  });
  controller.abort(abortReason);

  await assert.rejects(pending, (error) => error === abortReason);
  assert.deepEqual(cancelReasons, [abortReason]);
  assert.deepEqual(terminal.timing.terminalReason, {
    code: 'PRESENTATION_EFFECT_DEADLINE_MISSED',
    message: 'Workspace deadline expired',
  });
  let receiptCount = fixture.receipts.length;
  assert.throws(
    () => attention.request.onMilestone(settled),
    (error) => error.code === 'PRESENTATION_EFFECT_RECEIPT_STALE',
  );
  assert.equal(fixture.receipts.length, receiptCount);
});

test('duplicate and late provider reports retain Workspace reporter ownership', async () => {
  let admission = providerAdmissionFixture();
  let firstFrame = providerMilestoneFixture(admission, 'first-frame', 110);
  let duplicateFixture = workspaceOperationFixture();
  let duplicateAttention = scriptedAttentionProvider((request) => {
    request.onAdmission(admission);
    request.onMilestone(firstFrame);
    request.onMilestone(firstFrame);
    return { presentation: { presented: true, admission }, terminal: null };
  });
  await assert.rejects(
    runCvShowPresentationOperation(
      providerScenarioRunner(duplicateAttention),
      duplicateFixture.operation,
    ),
    (error) => error.code === 'PRESENTATION_EFFECT_RECEIPT_SEQUENCE_INVALID',
  );
  assert.deepEqual(duplicateFixture.receipts, [{
    status: 'first-frame',
    observedAt: firstFrame.observedAt,
    providerReceipt: firstFrame,
  }]);

  let settled = providerMilestoneFixture(admission, 'settled', 640);
  let terminal = providerTerminalFixture(
    admission,
    'completed',
    640,
    settled.providerReceipt,
    'settled',
  );
  let lateFixture = workspaceOperationFixture();
  let lateAttention = scriptedAttentionProvider((request) => {
    request.onAdmission(admission);
    request.onMilestone(firstFrame);
    request.onMilestone(settled);
    return { presentation: { presented: true, admission }, terminal };
  });
  assert.equal(
    await runCvShowPresentationOperation(
      providerScenarioRunner(lateAttention),
      lateFixture.operation,
    ),
    undefined,
  );
  lateFixture.deactivate();
  let receiptCount = lateFixture.receipts.length;
  assert.throws(
    () => lateAttention.request.onMilestone(settled),
    (error) => error.code === 'PRESENTATION_EFFECT_RECEIPT_STALE',
  );
  assert.equal(lateFixture.receipts.length, receiptCount);
});

test('native scroll reports actual acted and settled receipts without provider admission', async () => {
  let releaseScroll;
  let scrollGate = new Promise((resolve) => { releaseScroll = resolve; });
  let actedAt = providerObservation(30);
  let settledAt = providerObservation(470);
  let observations = [actedAt, settledAt];
  let lifecycle = [];
  let runner = createCvShowDirectiveRunner({
    document: {},
    attention: {
      clearMarkers() { lifecycle.push('clear-markers'); },
      clearTransient(reason, options) {
        lifecycle.push(['clear-transient', reason, options]);
      },
    },
    resolveTarget: () => ({ id: 'target' }),
    resolveText: (key) => key,
    actionAdapter: {
      inspect() { lifecycle.push('inspect'); return { open: false, panelId: 'graph' }; },
      reveal() { lifecycle.push('reveal'); return { changed: true, panelId: 'graph' }; },
      awaitTransition() { lifecycle.push('transition'); return { ready: true }; },
      async awaitTarget() {
        lifecycle.push('scroll');
        await scrollGate;
        return { target: { id: 'target' } };
      },
      restore({ context }) {
        lifecycle.push(['restore', context.retainRevealedPanel]);
        return { changed: false, retainedOpen: context.retainRevealedPanel };
      },
    },
    observePerformance: () => {
      lifecycle.push('status');
      return observations.shift();
    },
  });
  let fixture = workspaceOperationFixture({
    kind: 'interaction',
    interaction: { type: 'scroll', reversible: false },
    source: { id: 'example', type: 'frame', target: 'target' },
  });
  fixture.operation.projectCell.id = 'cv-show:cue:example:scroll';
  let pending = runCvShowPresentationOperation(runner, fixture.operation);
  await new Promise((resolve) => setImmediate(resolve));
  assert.deepEqual(lifecycle, [
    'clear-markers',
    ['clear-transient', 'scroll', { preserveInk: false, preserveCursor: true }],
    'status',
    'inspect',
    'reveal',
    'transition',
    'scroll',
  ]);
  assert.deepEqual(fixture.receipts.map(({ status }) => status), ['acted']);
  releaseScroll();
  assert.equal(await pending, undefined);
  assert.deepEqual(lifecycle.slice(-2), [['restore', true], 'status']);
  assert.deepEqual(fixture.admissions, []);
  assert.deepEqual(fixture.receipts.map(({ status }) => status), ['acted', 'settled']);
  assert.equal(fixture.receipts[0].observedAt, actedAt);
  assert.equal(fixture.receipts[1].observedAt, settledAt);
  assert.deepEqual(fixture.receipts.map(({ providerReceipt }) => providerReceipt), [
    {
      version: 'cv-show-native-presentation-receipt-v1',
      effect: { kind: 'interaction', type: 'scroll', status: 'acted' },
      target: { id: 'target' },
    },
    {
      version: 'cv-show-native-presentation-receipt-v1',
      effect: { kind: 'interaction', type: 'scroll', status: 'settled' },
      target: { id: 'target' },
    },
  ]);
  assert.equal(Object.isFrozen(fixture.receipts[1].providerReceipt.effect), true);
});

function installedConformanceGate() {
  let resolve;
  let promise = new Promise((done) => { resolve = done; });
  return Object.freeze({ promise, resolve });
}

function createInstalledRafHost({ reducedMotion = false } = {}) {
  let elapsedMs = 0;
  let nextId = 0;
  let callbacks = new Map();
  let view = {
    performance: {
      timeOrigin: globalThis.performance.timeOrigin,
      now: () => globalThis.performance.now() + elapsedMs,
    },
    requestAnimationFrame(callback) {
      let id = ++nextId;
      callbacks.set(id, callback);
      return id;
    },
    cancelAnimationFrame(id) {
      callbacks.delete(id);
    },
    matchMedia() {
      return { matches: reducedMotion };
    },
  };
  return Object.freeze({
    view,
    step(deltaMs = 0) {
      elapsedMs += deltaMs;
      let timestamp = globalThis.performance.now() + elapsedMs;
      let frame = [...callbacks.values()];
      callbacks.clear();
      for (let callback of frame) callback(timestamp);
      return frame.length;
    },
    get pendingCount() {
      return callbacks.size;
    },
  });
}

function createInstalledTarget(id, rafHost, events, {
  hostless = false,
  selectionQuote = '',
} = {}) {
  let target = {
    id,
    focusCalls: 0,
    selectionCalls: [],
    dispatchCalls: 0,
    getBoundingClientRect() {
      return { left: 12, top: 24, right: 252, bottom: 72, width: 240, height: 48 };
    },
    focus() {
      this.focusCalls += 1;
      events.push(`dom:focus:${id}`);
    },
    matches() {
      return false;
    },
    querySelector() {
      return null;
    },
    dispatchEvent() {
      this.dispatchCalls += 1;
      events.push(`dom:dispatch:${id}`);
      return true;
    },
  };
  if (!hostless) target.ownerDocument = { defaultView: rafHost.view };
  if (selectionQuote) {
    target.value = `Начало — ${selectionQuote}; конец.`;
    target.selectionStart = 0;
    target.selectionEnd = 0;
    target.selectionDirection = 'none';
    target.setSelectionRange = function setSelectionRange(start, end, direction) {
      this.selectionStart = start;
      this.selectionEnd = end;
      this.selectionDirection = direction;
      this.selectionCalls.push(Object.freeze({ start, end, direction }));
      events.push(`dom:selection:${id}`);
    };
  }
  return target;
}

function createInstalledPresenterCursor(events, durationMs = 220) {
  const receipt = (mode, target, frame, plannedDurationMs) => {
    let elapsedMs = Math.min(
      plannedDurationMs,
      Math.max(0, Number(frame?.elapsedMs) || 0),
    );
    let progress = plannedDurationMs ? elapsedMs / plannedDurationMs : 1;
    events.push(frame?.planOnly ? `ui:plan:${mode}` : `ui:pixel:${mode}`);
    return Object.freeze({
      presented: true,
      planVersion: 'symbiote-presenter-kinematics-v2',
      planIdentity: `installed-plan:${mode}:${target.id}`,
      normalizedPathHash: `installed-path:${mode}:${target.id}`,
      geometryIdentity: `installed-geometry:${target.id}`,
      layoutIdentity: `installed-layout:${target.id}`,
      targetRect: target.getBoundingClientRect(),
      durationMs: plannedDurationMs,
      elapsedMs,
      progress,
      revealProgress: progress,
    });
  };
  return Object.freeze({
    presentFocusFrame(target, frame) {
      return receipt('frame', target, frame, durationMs);
    },
    presentClickFrame(target, frame) {
      return receipt('click', target, frame, 0);
    },
    presentAnnotationFrame(target, _annotation, frame) {
      return receipt('marker', target, frame, durationMs);
    },
    clear() {},
    clearAccumulatedAnnotations() {},
  });
}

function createInstalledProjectTuple(entryId, directiveId) {
  let project = createCvShowEntryProject(
    CV_SHOW_STRUCTURAL_MEDIA_FIXTURE.project,
    entryId,
    { speechDirectiveIds: [directiveId] },
  );
  let timeline = createPresentationAuthoringTimelineProjection(project);
  let sourceSequence = CV_SHOW_STRUCTURAL_MEDIA_FIXTURE.sequence(entryId);
  let sourceTurn = sourceSequence.turns[0];
  let alignedSequence = createPresentationAlignedSequence(timeline, {
    media: structuredClone(sourceSequence.media),
    turns: [{
      startMs: sourceTurn.startMs,
      endMs: sourceTurn.endMs,
      transcript: sourceTurn.transcript,
      words: structuredClone(sourceTurn.words),
    }],
  });
  let schedule = createPresentationScheduleV2(project, alignedSequence);
  return Object.freeze({ project, alignedSequence, schedule });
}

function createInstalledProviderHarness({
  entryId = 'positioning',
  directiveId = 'positioning.tenure-marker',
  focusDurationMs = 220,
  hostless = false,
  reducedMotion = false,
  uiTargetUnresolved = false,
} = {}) {
  let events = [];
  let receipts = [];
  let operations = [];
  let admissionGate = installedConformanceGate();
  let rafHost = createInstalledRafHost({ reducedMotion });
  let tuple = createInstalledProjectTuple(entryId, directiveId);
  let targetCellId = `cv-show:cue:${directiveId}`;
  let scrollCellId = `${targetCellId}:scroll`;
  let setupCell = tuple.project.cells.find((cell) => (
    cell.kind === 'cue' && cell.timing.at.anchor === 'turn-start'
  ));
  let targetSource = projectCvShowDirective(
    tuple.project.cells.find(({ id }) => id === targetCellId),
    tuple.project,
  );
  let setupTarget = createInstalledTarget(
    setupCell.cue.targetId,
    rafHost,
    events,
  );
  let effectTarget = createInstalledTarget(
    targetSource.target,
    rafHost,
    events,
    {
      hostless,
      selectionQuote: targetSource.type === 'native-selection' ? targetSource.quote : '',
    },
  );
  let targets = new Map([
    [setupCell.cue.targetId, setupTarget],
    [targetSource.target, effectTarget],
  ]);
  let attention = new ShowAttentionController({
    cursor: createInstalledPresenterCursor(events, focusDurationMs),
    resolveTarget: (target) => uiTargetUnresolved && target === effectTarget ? null : target,
  });
  let runtime = {
    entries: new Map([[setupCell.cue.targetId, Object.freeze({})]]),
    selectedId: '',
    viewer: setupTarget,
    select(id) {
      this.selectedId = id;
      events.push(`runtime:select:${id}`);
      return true;
    },
  };
  let runner = createCvShowDirectiveRunner({
    document: {},
    runtime,
    attention,
    resolveTarget: (targetId) => targets.get(targetId) || null,
    resolveText: (key) => key,
    waitForReadiness: async ({ target }) => ({
      target: typeof target === 'function' ? target() : target,
    }),
    activateTarget: (target, source) => activateCvShowTarget(target, source, {
      baseUrl: 'https://portfolio.example/cv/',
      createEvent: (detail) => ({ detail, defaultPrevented: false }),
    }),
    actionAdapter: {
      inspect({ action }) {
        events.push(`action:inspect:${action.id}`);
        return { open: false, panelId: 'installed-fixture' };
      },
      reveal({ action }) {
        events.push(`action:reveal:${action.id}`);
        return { changed: true, panelId: 'installed-fixture' };
      },
      awaitTransition({ action }) {
        events.push(`action:transition:${action.id}`);
        return { ready: true };
      },
      awaitTarget({ action }) {
        events.push(`action:target:${action.id}`);
        return { target: targets.get(action.target) || null };
      },
      restore({ action }) {
        events.push(`action:restore:${action.id}`);
        return { changed: true };
      },
    },
  });
  let adapterMethod = async (operation, kind) => {
    let record = {
      cellId: operation.scheduleCell.cellId,
      kind,
      admissionInputs: [],
      admissionResults: [],
      receiptInputs: [],
      receiptResults: [],
    };
    operations.push(record);
    let wrapped = Object.freeze({
      ...operation,
      kind,
      source: projectCvShowDirective(operation.projectCell, tuple.project),
      reportAdmission(input) {
        record.admissionInputs.push(input);
        events.push('cv:admission');
        admissionGate.resolve(input.providerAdmission);
        let result = operation.reportAdmission(input);
        record.admissionResults.push(result);
        events.push('workspace:admission');
        return result;
      },
      reportReceipt(input) {
        record.receiptInputs.push(input);
        events.push(`cv:${input.status}`);
        let result = operation.reportReceipt(input);
        record.receiptResults.push(result);
        events.push(`workspace:${input.status}`);
        return result;
      },
    });
    return runCvShowPresentationOperation(runner, wrapped);
  };
  let execution = createPresentationExecutionController({
    project: tuple.project,
    alignedSequence: tuple.alignedSequence,
    schedule: tuple.schedule,
    adapter: {
      runInteraction: (operation) => adapterMethod(operation, 'interaction'),
      runAttention: (operation) => adapterMethod(operation, 'attention'),
      waitForState: (operation) => adapterMethod(operation, 'state'),
    },
    onReceipt(receipt) {
      receipts.push(receipt);
    },
  });
  let scheduleById = new Map(tuple.schedule.cells.map((cell) => [cell.cellId, cell]));
  let sample = (cellId) => execution.sample({
    mediaTimeMs: scheduleById.get(cellId).startMs,
    reason: `installed-conformance:${cellId}`,
  });
  return {
    ...tuple,
    attention,
    effectTarget,
    events,
    receipts,
    operations,
    admissionGate,
    execution,
    rafHost,
    runtime,
    setupCellId: setupCell.id,
    scrollCellId,
    targetCellId,
    async completePrerequisites() {
      sample(setupCell.id);
      await execution.whenIdle();
      sample(scrollCellId);
      await execution.whenIdle();
    },
    sampleTarget() {
      return sample(targetCellId);
    },
    recordFor(cellId) {
      return operations.findLast((record) => record.cellId === cellId);
    },
    receiptsFor(cellId) {
      return receipts.filter((receipt) => receipt.cellId === cellId);
    },
  };
}

function assertInstalledRecursivelyFrozen(value, path = 'provider evidence') {
  if (!value || typeof value !== 'object') return;
  assert.equal(Object.isFrozen(value), true, path);
  for (let [key, child] of Object.entries(value)) {
    assertInstalledRecursivelyFrozen(child, `${path}.${key}`);
  }
}

function assertInstalledOrder(events, expected) {
  let previous = -1;
  for (let item of expected) {
    let index = events.indexOf(item);
    assert.ok(index > previous, `${item} must follow ${events[previous] || 'the start'}`);
    previous = index;
  }
}

test('installed UI, CV and Workspace preserve the provider-v2 execution contract', {
  timeout: 10_000,
}, async (t) => {
  const synchronousAttention = async (options) => {
    let harness = createInstalledProviderHarness(options);
    await harness.completePrerequisites();
    harness.events.length = 0;

    harness.sampleTarget();
    let providerAdmission = await harness.admissionGate.promise;
    await harness.execution.whenIdle();
    let record = harness.recordFor(harness.targetCellId);
    let targetReceipts = harness.receiptsFor(harness.targetCellId);
    let terminal = await harness.attention.whenSettled();

    assert.equal(providerAdmission.status, 'admitted');
    assert.equal(terminal.status, 'completed');
    assert.deepEqual(targetReceipts.map(({ status }) => status), ['first-frame', 'settled']);
    assert.equal(
      targetReceipts[0].observedAt.monotonicTimeMs,
      targetReceipts[1].observedAt.monotonicTimeMs,
    );
    assert.equal(
      record.receiptInputs[0].observedAt,
      record.receiptInputs[0].providerReceipt.observedAt,
    );
    assertInstalledOrder(harness.events, [
      'ui:plan:marker',
      'cv:admission',
      'workspace:admission',
      'ui:pixel:marker',
      'cv:first-frame',
      'workspace:first-frame',
      'cv:settled',
      'workspace:settled',
    ]);
    assert.equal(harness.rafHost.pendingCount, 0);
    assert.equal(harness.execution.snapshot.activeCount, 0);
    assert.equal(harness.execution.snapshot.pendingCount, 0);
  };

  let cases = [{
    name: 'normal RAF attention admits before pixels and relays exact evidence',
    run: async () => {
      let harness = createInstalledProviderHarness();
      await harness.completePrerequisites();
      harness.events.length = 0;

      harness.sampleTarget();
      let providerAdmission = await harness.admissionGate.promise;
      let record = harness.recordFor(harness.targetCellId);
      assert.equal(providerAdmission.version, SHOW_ATTENTION_ADMISSION_VERSION);
      assert.equal(providerAdmission.status, 'admitted');
      assert.equal(providerAdmission.budget.limitMs, 2_500);
      assert.equal(providerAdmission.budget.plannedDurationMs, 220);
      assert.equal(record.admissionInputs[0].providerAdmission, providerAdmission);
      assert.equal(harness.events.some((event) => event.startsWith('ui:pixel:')), false);
      assert.equal(harness.execution.snapshot.activeCount, 1);
      assert.equal(harness.execution.snapshot.pendingCount, 0);

      assert.equal(harness.rafHost.step(0), 1);
      assert.equal(harness.rafHost.step(providerAdmission.budget.plannedDurationMs), 1);
      await harness.execution.whenIdle();
      let terminal = await harness.attention.whenSettled();
      let workspaceAdmission = record.admissionResults[0];
      let targetReceipts = harness.receiptsFor(harness.targetCellId);

      assert.equal(terminal.version, SHOW_ATTENTION_TERMINAL_VERSION);
      assert.equal(terminal.status, 'completed');
      assert.equal(workspaceAdmission.version, PRESENTATION_EFFECT_ADMISSION_VERSION);
      assert.deepEqual(workspaceAdmission.providerAdmission, providerAdmission);
      assert.notEqual(workspaceAdmission.providerAdmission, providerAdmission);
      assert.deepEqual(Object.keys(workspaceAdmission), [
        'version',
        'operationId',
        'generation',
        'authoringProjectHash',
        'scheduleHash',
        'cellId',
        'kind',
        'targetId',
        'budgetMs',
        'providerAdmission',
      ]);
      for (let legacyKey of [
        'providerPlanId',
        'providerPlanVersion',
        'providerPlanHash',
        'layoutIdentityHash',
        'plannedDurationMs',
      ]) {
        assert.equal(Object.hasOwn(workspaceAdmission, legacyKey), false, legacyKey);
      }
      assert.deepEqual(targetReceipts.map(({ status }) => status), ['first-frame', 'settled']);
      assert.equal(targetReceipts.every(({ version }) => (
        version === PRESENTATION_EFFECT_RECEIPT_VERSION
      )), true);
      assert.deepEqual(
        record.receiptInputs.map(({ providerReceipt }) => providerReceipt.version),
        [SHOW_ATTENTION_MILESTONE_VERSION, SHOW_ATTENTION_MILESTONE_VERSION],
      );
      assert.equal(
        record.receiptInputs[0].observedAt,
        record.receiptInputs[0].providerReceipt.observedAt,
      );
      assert.equal(record.receiptInputs[0].providerReceipt.admission, providerAdmission);
      assert.deepEqual(
        targetReceipts[0].providerReceipt,
        record.receiptInputs[0].providerReceipt,
      );
      assert.notEqual(
        targetReceipts[0].providerReceipt,
        record.receiptInputs[0].providerReceipt,
      );
      assertInstalledRecursivelyFrozen(providerAdmission);
      assertInstalledRecursivelyFrozen(targetReceipts[0]);
      assertInstalledOrder(harness.events, [
        'ui:plan:marker',
        'cv:admission',
        'workspace:admission',
        'ui:pixel:marker',
        'cv:first-frame',
        'workspace:first-frame',
        'cv:settled',
        'workspace:settled',
      ]);
      let barriers = harness.execution.snapshot.barriers
        .find(({ cellId }) => cellId === harness.targetCellId)?.barriers;
      assert.deepEqual(barriers, ['first-frame', 'settled']);
      assert.equal(harness.execution.snapshot.maxInFlight, 1);
      assert.equal(harness.execution.snapshot.activeCount, 0);
      assert.equal(harness.execution.snapshot.pendingCount, 0);
      assert.equal(harness.rafHost.pendingCount, 0);
    },
  }, {
    name: 'semantic select mutates Selection only after admission and maps first-frame to acted',
    run: async () => {
      let harness = createInstalledProviderHarness({
        entryId: 'symbiote-workspace',
        directiveId: 'workspace.portable-config',
      });
      await harness.completePrerequisites();
      harness.events.length = 0;

      harness.sampleTarget();
      let providerAdmission = await harness.admissionGate.promise;
      let record = harness.recordFor(harness.targetCellId);
      assert.equal(providerAdmission.effect.mode, 'native-selection');
      assert.equal(providerAdmission.budget.limitMs, 650);
      assert.equal(harness.effectTarget.focusCalls, 0);
      assert.deepEqual(harness.effectTarget.selectionCalls, []);

      assert.equal(harness.rafHost.step(0), 1);
      assert.equal(harness.effectTarget.focusCalls, 1);
      assert.equal(harness.effectTarget.selectionCalls.length, 1);
      assert.equal(harness.rafHost.step(providerAdmission.budget.plannedDurationMs), 1);
      await harness.execution.whenIdle();
      let targetReceipts = harness.receiptsFor(harness.targetCellId);

      assert.deepEqual(record.receiptInputs.map(({ status }) => status), ['acted', 'settled']);
      assert.deepEqual(
        record.receiptInputs.map(({ providerReceipt }) => providerReceipt.milestone),
        ['first-frame', 'settled'],
      );
      assert.deepEqual(targetReceipts.map(({ status }) => status), ['acted', 'settled']);
      assert.equal(
        targetReceipts[1].providerReceipt.providerReceipt.selectedText,
        'переносимая исполняемая конфигурация',
      );
      assertInstalledOrder(harness.events, [
        'cv:admission',
        'workspace:admission',
        `dom:focus:${harness.effectTarget.id}`,
        `dom:selection:${harness.effectTarget.id}`,
        'cv:acted',
        'workspace:acted',
        'cv:settled',
        'workspace:settled',
      ]);
      let barriers = harness.execution.snapshot.barriers
        .find(({ cellId }) => cellId === harness.targetCellId)?.barriers;
      assert.deepEqual(barriers, ['acted', 'settled']);
      assert.equal(harness.execution.snapshot.maxInFlight, 1);
      assert.equal(harness.execution.snapshot.pendingCount, 0);
    },
  }, {
    name: 'rejected admissions preserve exact over-budget and unresolved-target evidence',
    run: async () => {
      let rejections = [{
        options: { focusDurationMs: 2_501 },
        assertEvidence(providerAdmission) {
          assert.equal(providerAdmission.reason.code, 'budget-exceeded');
          assert.deepEqual(
            providerAdmission.budget,
            { limitMs: 2_500, plannedDurationMs: 2_501 },
          );
        },
      }, {
        options: { uiTargetUnresolved: true },
        assertEvidence(providerAdmission) {
          assert.equal(providerAdmission.reason.code, 'provider-rejected');
          assert.deepEqual(providerAdmission.reason.provider, { code: 'target-unresolved' });
          assert.deepEqual(providerAdmission.target, {
            id: 'profile.experience.15-plus',
            identity: 'profile.experience.15-plus',
            layoutIdentity: null,
            geometryIdentity: null,
            geometry: null,
          });
          assert.deepEqual(providerAdmission.plan, {
            version: null,
            identity: null,
            normalizedPathHash: null,
            motion: null,
            evidence: null,
          });
        },
      }];
      for (let rejection of rejections) {
        let harness = createInstalledProviderHarness(rejection.options);
        await harness.completePrerequisites();
        harness.events.length = 0;

        harness.sampleTarget();
        let providerAdmission = await harness.admissionGate.promise;
        await harness.execution.whenIdle();
        let record = harness.recordFor(harness.targetCellId);
        let targetReceipts = harness.receiptsFor(harness.targetCellId);

        assert.equal(providerAdmission.status, 'rejected');
        rejection.assertEvidence(providerAdmission);
        assert.equal(record.admissionResults.length, 0);
        assert.deepEqual(targetReceipts.map(({ status }) => status), ['failed']);
        assert.equal(
          targetReceipts[0].reason.code,
          'PRESENTATION_EFFECT_ADMISSION_REJECTED',
        );
        assert.deepEqual(
          targetReceipts[0].reason.details.providerAdmission,
          providerAdmission,
        );
        assert.equal(harness.events.some((event) => event.startsWith('ui:pixel:')), false);
        assert.equal(harness.rafHost.pendingCount, 0);
        assertInstalledRecursivelyFrozen(targetReceipts[0].reason.details.providerAdmission);
      }
    },
  }, {
    name: 'reduced and hostless immediate paths preserve admission-before-pixel ordering',
    run: async () => {
      for (let options of [{ reducedMotion: true }, { hostless: true }]) {
        await synchronousAttention(options);
      }
    },
  }, {
    name: 'native navigate, scroll and reveal stay admission-free with actual receipts',
    run: async () => {
      let harness = createInstalledProviderHarness({
        entryId: 'symbiote-video-studio',
        directiveId: 'video-studio.demo',
      });
      harness.execution.sample({
        mediaTimeMs: harness.schedule.cells.find(({ cellId }) => (
          cellId === harness.setupCellId
        )).startMs,
        reason: 'installed-conformance:native-setup',
      });
      await harness.execution.whenIdle();
      harness.execution.sample({
        mediaTimeMs: harness.schedule.cells.find(({ cellId }) => (
          cellId === harness.scrollCellId
        )).startMs,
        reason: 'installed-conformance:native-scroll',
      });
      await harness.execution.whenIdle();
      harness.sampleTarget();
      await harness.execution.whenIdle();

      assert.equal(harness.operations.length, 3);
      assert.equal(harness.operations.every(({ admissionInputs }) => (
        admissionInputs.length === 0
      )), true);
      assert.equal(harness.operations.every(({ admissionResults }) => (
        admissionResults.length === 0
      )), true);
      for (let cellId of [
        harness.setupCellId,
        harness.scrollCellId,
        harness.targetCellId,
      ]) {
        let cellReceipts = harness.receiptsFor(cellId);
        assert.deepEqual(cellReceipts.map(({ status }) => status), ['acted', 'settled']);
        for (let receipt of cellReceipts) {
          assert.equal(receipt.version, PRESENTATION_EFFECT_RECEIPT_VERSION);
          assert.equal(
            receipt.providerReceipt.version,
            'cv-show-native-presentation-receipt-v1',
          );
          assert.equal(Object.hasOwn(receipt.providerReceipt, 'providerAdmission'), false);
          assert.equal(Object.hasOwn(receipt.providerReceipt, 'plan'), false);
        }
      }
      assert.equal(harness.attention.lastAdmission, null);
      assert.equal(harness.runtime.selectedId, 'projects/symbiote-video-studio');
      assert.ok(harness.events.includes('action:reveal:video-studio.open'));
      assert.ok(harness.events.includes('action:reveal:video-studio.demo'));
      assert.ok(harness.events.includes(`dom:dispatch:${harness.effectTarget.id}`));
      assert.equal(harness.execution.snapshot.activeCount, 0);
      assert.equal(harness.execution.snapshot.pendingCount, 0);
      assert.equal(harness.execution.snapshot.maxInFlight, 1);
    },
  }];

  for (let scenario of cases) await t.test(scenario.name, scenario.run);
});

test('Pause keeps an in-flight gesture inside the same transition barrier until Resume settles it', async () => {
  let releaseGesture;
  let gestureStarted;
  let markGestureStarted;
  const gestureGate = new Promise((resolve) => { releaseGesture = resolve; });
  const startedGate = new Promise((resolve) => { markGestureStarted = resolve; });
  let paused = false;
  const runner = createCvShowDirectiveRunner({
    document: {},
    attention: {
      present() {
        markGestureStarted();
        return { presented: true };
      },
      whenSettled: () => gestureGate,
      pause() { paused = true; return true; },
      resume() { paused = false; return true; },
      clearMarkers() {},
      clearTransient() {},
      get snapshot() { return { animating: true, paused }; },
    },
    resolveTarget: () => ({ id: 'target' }),
    resolveText: (key) => key,
    waitForReadiness: async ({ target }) => ({ target: target() }),
  });
  const operation = runner.run([{
    id: 'retained.frame',
    type: 'frame',
    target: 'article.example.intro',
  }]);
  await startedGate;

  runner.pause();
  const barrier = operation;
  let barrierSettled = false;
  void barrier.then(() => { barrierSettled = true; });
  await Promise.resolve();
  assert.equal(paused, true);
  assert.equal(barrierSettled, false, 'Pause must not release the scene-transition barrier');

  runner.resume();
  releaseGesture({ status: 'settled' });
  assert.equal((await barrier).status, 'success');
  assert.equal(paused, false);
});

test('the presenter pause bridge preserves presenter work and document selection for every pause reason', async () => {
  const logic = await readFile(new URL(
    '../../src/static-pages/js/tour-player/index.js',
    import.meta.url,
  ), 'utf8');
  const pauseBody = logic.match(/const pausePresenter = \(event\) => \{([\s\S]*?)\n  \};\n\n  const resumePresenter/u)?.[1] || '';
  assert.match(pauseBody, /presenter\?\.runner\.pause\(\);/u);
  assert.doesNotMatch(pauseBody, /meaningfulInteraction|scheduleDocumentSelectionClear/u);
  assert.doesNotMatch(pauseBody, /\b(?:Queue|enqueue|tail)\b/u);
});

test('CV runner retains pre-presentation attention across Pause and resumes the same cue', async () => {
  let releaseReadiness;
  let releaseSettlement;
  let presentCalls = 0;
  const readiness = new Promise((resolve) => { releaseReadiness = resolve; });
  const settlement = new Promise((resolve) => { releaseSettlement = resolve; });
  const runner = createCvShowDirectiveRunner({
    document: {},
    attention: {
      present() { presentCalls += 1; return { presented: true }; },
      whenSettled: () => settlement,
      pause() { return presentCalls > 0; },
      resume() { return presentCalls > 0; },
      clearMarkers() {},
      clearTransient() {},
    },
    resolveTarget: () => ({ id: 'target' }),
    resolveText: (key) => key,
    waitForReadiness: () => readiness,
  });
  const running = runner.run([{ id: 'stale.frame', type: 'frame', target: 'target' }]);

  runner.pause();
  releaseReadiness({ target: { id: 'target' } });
  await Promise.resolve();
  await Promise.resolve();
  assert.equal(presentCalls, 0, 'a cue waiting for its target must remain frozen while paused');

  runner.resume();
  await new Promise((resolve) => setImmediate(resolve));
  assert.equal(presentCalls, 1, 'Resume must present the retained cue exactly once');
  releaseSettlement({ status: 'settled' });
  assert.equal((await running).status, 'success');
});

test('CV runner uses the shared hidden-panel lifecycle and restores only after attention settles', async () => {
  const order = [];
  const runner = createCvShowDirectiveRunner({
    document: {},
    runtime: { entries: new Map() },
    attention: {
      present({ target }) { order.push(`act:${target.id}`); return { presented: true }; },
      async whenSettled() {
        order.push('settled');
        return {
          status: 'settled',
          cueTimeMs: 1200,
          mediaTimeMs: 1208,
          firstFrameAtMs: 20,
          settledAtMs: 1040,
        };
      },
      clearMarkers() {},
      clearTransient() {},
    },
    resolveText: (key) => key,
    actionAdapter: {
      inspect() { order.push('inspect'); return { open: false, panelId: 'tree' }; },
      reveal() { order.push('reveal'); return { changed: true, panelId: 'tree' }; },
      awaitTransition() { order.push('transition'); return { ready: true }; },
      awaitTarget() { order.push('target'); return { target: { id: 'project-row' } }; },
      restore() { order.push('restore'); return { changed: true }; },
    },
  });

  const result = await runner.run([{
    id: 'workspace.card',
    type: 'frame',
    target: 'project-card.symbiote-workspace',
    policy: 'required',
  }]);

  assert.equal(result.status, 'success');
  assert.deepEqual(order, ['inspect', 'reveal', 'transition', 'target', 'act:project-row', 'settled', 'restore']);
  assert.deepEqual(
    result.receipts[0].result.phases.map(({ phase, status }) => [phase, status]),
    [
      ['inspect', 'completed'],
      ['reveal', 'completed'],
      ['transition', 'completed'],
      ['target', 'completed'],
      ['act', 'completed'],
      ['restore', 'completed'],
    ],
  );
  assert.deepEqual(
    result.receipts[0].result.phases.find(({ phase }) => phase === 'act').result.settlement,
    {
      status: 'settled',
      cueTimeMs: 1200,
      mediaTimeMs: 1208,
      firstFrameAtMs: 20,
      settledAtMs: 1040,
    },
  );
});

test('CV runner preserves DOM targets whose public target property is link metadata', async () => {
  const link = { id: 'github-link', target: '_blank' };
  const presented = [];
  const runner = createCvShowDirectiveRunner({
    document: {},
    runtime: { entries: new Map() },
    attention: {
      present({ target }) {
        presented.push(target);
        return { presented: true };
      },
      clearMarkers() {},
      clearTransient() {},
    },
    resolveText: (key) => key,
    actionAdapter: {
      inspect: () => ({ open: true }),
      reveal: () => ({ changed: false }),
      awaitTransition: () => ({ ready: true }),
      awaitTarget: () => ({ target: link }),
      restore: () => ({ changed: false }),
    },
  });

  const result = await runner.run([{
    id: 'symbiote-ui.github-link',
    type: 'frame',
    target: 'project-link.symbiote-ui.github',
    policy: 'required',
  }]);

  assert.equal(result.status, 'success');
  assert.deepEqual(presented, [link]);
});

test('meaningful interaction cancels hidden-panel work without stale action or restore', async () => {
  const calls = [];
  const runner = createCvShowDirectiveRunner({
    document: {},
    runtime: { entries: new Map() },
    attention: {
      present() { calls.push('act'); return { presented: true }; },
      clearMarkers() { calls.push('clear-markers'); },
      clearTransient() { calls.push('clear-transient'); },
    },
    resolveText: (key) => key,
    actionAdapter: {
      inspect() { return { open: false, panelId: 'tree' }; },
      reveal() { return { changed: true, panelId: 'tree' }; },
      awaitTransition({ signal }) {
        return new Promise((resolve, reject) => {
          signal.addEventListener('abort', () => reject(signal.reason), { once: true });
        });
      },
      restore() { calls.push('restore'); },
    },
  });
  const pending = runner.run([{
    id: 'workspace.card',
    type: 'frame',
    target: 'project-card.symbiote-workspace',
    policy: 'required',
  }]);

  await Promise.resolve();
  runner.meaningfulInteraction();

  assert.equal((await pending).status, 'cancelled');
  assert.equal(calls.includes('act'), false);
  assert.equal(calls.includes('restore'), false);
  assert.deepEqual(calls.slice(-2), ['clear-markers', 'clear-transient']);
});

test('shared branch state returns to the exact main snapshot paused and requires explicit resume', () => {
  const session = new ShowSessionState();
  session.setPlayback({
    episodeId: 'short',
    cueIndex: 5,
    positionMs: 7200,
    playbackState: 'playing',
    subjectId: 'symbiote-video-studio',
  });
  session.enterBranch('video-studio-details');
  session.returnFromBranch('video-studio-details');
  assert.deepEqual(session.snapshot.playback, {
    episodeId: 'short',
    cueIndex: 5,
    positionMs: 7200,
    playbackState: 'paused',
    subjectId: 'symbiote-video-studio',
  });
  assert.equal(session.snapshot.resumeRequired, true);
  session.resume();
  assert.equal(session.snapshot.playback.playbackState, 'playing');
  assert.equal(session.snapshot.resumeRequired, false);
});

test('CV mock agent gives one honest generic reply for typed input and keeps explicit actions trusted', async () => {
  const provider = createCvShowMockAgentProvider({ locale: 'ru' });
  const contact = await provider.respond({ type: 'message', input: 'Как связаться с Владимиром?' });
  assert.equal(contact.role, 'agent');
  assert.match(contact.parts[0].text, /AI-агент.*не подключён/iu);
  assert.deepEqual(contact.parts.find(({ type }) => type === 'actions').actions.map(({ id }) => id), [
    'agent-projects', 'agent-help', 'agent-contact',
  ]);

  const projects = await provider.respond({ type: 'message', input: 'Покажи проекты' });
  assert.equal(projects.role, 'agent');
  assert.match(projects.parts[0].text, /AI-агент.*не подключён/iu);
  assert.notEqual(projects.id, contact.id, 'identical fallback copy keeps unique message identity');
  const help = await provider.respond({ type: 'action', actionId: 'agent-help' });
  assert.equal(help.role, 'agent');
  assert.match(help.parts[0].text, /идёт автоматически/iu);
  const explicitContact = await provider.respond({ type: 'action', actionId: 'agent-contact' });
  assert.deepEqual(explicitContact.parts.find(({ type }) => type === 'actions').actions.map(({ id }) => id), [
    'contact-linkedin', 'contact-telegram',
  ]);
  assert.match(explicitContact.parts[0].text, /только после вашего выбора/iu);
  const unknown = await provider.respond({ type: 'message', input: 'Что ты думаешь о погоде?' });
  assert.equal(unknown.role, 'agent');
  assert.match(unknown.parts[0].text, /AI-агент.*не подключён/iu);
  assert.equal(await provider.respond({ type: 'action', actionId: 'details' }), null);

  assert.equal(resolveTrustedCvContactAction('contact-linkedin', ''), '');
  assert.equal(
    resolveTrustedCvContactAction('contact-linkedin', 'contact-linkedin'),
    CV_SHOW_CONTACT_ACTIONS['contact-linkedin'],
  );
});

function fakeAnchor(href) {
  return {
    href,
    clicks: 0,
    focusCalls: 0,
    dispatched: [],
    matches(selector) { return selector === 'a' || selector.startsWith('a,'); },
    getAttribute(name) { return name === 'href' ? href : null; },
    hasAttribute() { return false; },
    click() { this.clicks += 1; },
    focus() { this.focusCalls += 1; },
    dispatchEvent(event) { this.dispatched.push(event); return true; },
  };
}

test('finale contact is presented without native activation and navigates only from the user chat action', () => {
  const contact = fakeAnchor('https://www.linkedin.com/in/example');
  const finaleContact = TOUR_SCENES
    .find(({ id }) => id === 'finale')
    .directives.find(({ id }) => id === 'finale.contacts');
  assert.equal(finaleContact.safePath, undefined);

  const result = activateCvShowTarget(contact, finaleContact, {
    baseUrl: 'https://portfolio.example/cv/',
    createEvent: (detail) => ({ detail, defaultPrevented: false }),
  });
  assert.equal(result.status, 'presented');
  assert.equal(contact.focusCalls, 1);
  assert.equal(contact.dispatched.length, 1);
  assert.equal(contact.clicks, 0);

  assert.equal(activateCvShowUserAction('projects', contact), false);
  assert.equal(contact.clicks, 0);
  assert.equal(activateCvShowUserAction('contact', contact), true);
  assert.equal(contact.clicks, 1);
});

test('native Show activation requires both an allowlisted safePath and a same-origin target', () => {
  const internal = fakeAnchor('/cv/demo/readonly');
  const external = fakeAnchor('https://outside.example/demo');
  const directive = {
    id: 'demo.open',
    type: 'activate',
    target: 'article.demo',
    safePath: 'open-readonly-manifest',
  };
  const baseUrl = 'https://portfolio.example/cv/';

  assert.equal(canNativeActivateShowTarget(internal, directive, { baseUrl }), true);
  assert.equal(canNativeActivateShowTarget(external, directive, { baseUrl }), false);
  assert.equal(canNativeActivateShowTarget(internal, { ...directive, safePath: 'unknown' }, { baseUrl }), false);
  activateCvShowTarget(internal, directive, {
    baseUrl,
    createEvent: (detail) => ({ detail, defaultPrevented: false }),
  });
  assert.equal(internal.clicks, 1);
});

test('browser speech controller publishes physical starts, ignores stale completion, and clears global pause', () => {
  const spoken = [];
  let cancelled = 0;
  let paused = true;
  const synth = {
    get paused() { return paused; },
    speak(utterance) { spoken.push(utterance); },
    cancel() { cancelled += 1; },
    pause() { paused = true; },
    resume() { paused = false; },
  };
  class FakeUtterance {
    constructor(text) { this.text = text; }
  }
  const completed = [];
  const started = [];
  const blocked = [];
  const speech = createBrowserSpeechController({ synth, Utterance: FakeUtterance });

  assert.equal(speech.available, true);
  speech.speak('First', {
    lang: 'ru',
    onStart: () => started.push('first'),
    onEnd: () => completed.push('first'),
  });
  assert.equal(paused, false);
  assert.deepEqual(started, [], 'speak() acceptance is not a physical playback receipt');
  speech.speak('Second', {
    lang: 'ru',
    onStart: () => started.push('second'),
    onEnd: () => completed.push('second'),
  });
  spoken[0].onstart?.();
  assert.deepEqual(started, [], 'a stale utterance cannot publish playback');
  spoken[1].onstart?.();
  assert.deepEqual(started, ['second']);
  spoken[0].onend?.();
  assert.deepEqual(completed, []);
  spoken[1].onend?.();
  assert.deepEqual(completed, ['second']);

  speech.speak('Blocked', {
    lang: 'ru',
    onStart: () => started.push('blocked'),
    onBlocked: (reason) => blocked.push(reason),
  });
  spoken[2].onerror?.({ error: 'not-allowed' });
  spoken[2].onstart?.();
  assert.deepEqual(blocked, ['autoplay-blocked']);
  assert.deepEqual(started, ['second'], 'blocked speech cannot publish a physical start');
  speech.speak('Paused', {
    lang: 'ru',
    startPaused: true,
    onStart: () => started.push('paused-resume'),
  });
  assert.equal(spoken.length, 3, 'an explicitly paused route does not queue browser speech');
  assert.equal(speech.resume(), true);
  assert.equal(spoken.length, 4);
  assert.deepEqual(started, ['second']);
  spoken[3].onstart?.();
  assert.deepEqual(started, ['second', 'paused-resume']);
  speech.pause();
  assert.equal(paused, true);
  speech.cancel();
  assert.equal(paused, false);
  assert.ok(cancelled >= 3);
});

function sha256(value) {
  return createHash('sha256').update(value).digest('hex');
}

function createWebAudioManifest() {
  return structuredClone(CV_SHOW_STRUCTURAL_MEDIA_FIXTURE.webManifest);
}

function createWebAudioHarness(manifest = createWebAudioManifest()) {
  let raw = `${JSON.stringify(manifest)}\n`;
  let selector = {
    schemaVersion: 'cv-show-web-audio-selector-v1',
    releaseId: manifest.releaseId,
    sourceMasterReleaseId: manifest.source.masterReleaseId,
    voiceId: manifest.voiceId,
    locale: manifest.locale,
    revision: manifest.revision,
    manifest: {
      path: `${manifest.voiceId}/${manifest.revision}/manifest.json`,
      sha256: sha256(raw),
      bytes: new TextEncoder().encode(raw).byteLength,
    },
  };
  let appConfig = projectCvShowWebAudioReleaseConfig(selector);
  let config = resolveCvShowWebAudioConfig({
    url: 'https://portfolio.example/cv/?showAudio=local',
    baseUrl: 'https://portfolio.example/cv/',
    appConfig,
  });
  return { appConfig, config, manifest, raw, selector };
}

async function validatedWebAudioManifest() {
  let harness = createWebAudioHarness();
  return validateCvShowWebAudioRelease(harness.manifest, CV_SHOW_STORY, harness.config);
}

test('web audio selector resolves one immutable same-origin public release', () => {
  let { appConfig, config, selector } = createWebAudioHarness();
  assert.deepEqual(config, {
    mode: 'local',
    locale: 'ru',
    selection: 'barzana-2',
    releaseId: selector.releaseId,
    sourceMasterReleaseId: selector.sourceMasterReleaseId,
    revision: selector.revision,
    manifestUrl: `https://portfolio.example/cv/cv-show-audio/${selector.manifest.path}`,
    manifestSha256: selector.manifest.sha256,
    manifestBytes: selector.manifest.bytes,
  });
  assert.equal(Object.isFrozen(appConfig), true);
  assert.equal(Object.isFrozen(appConfig.webAudioRelease.manifest), true);
  assert.equal(Object.isFrozen(config), true);
  assert.doesNotMatch(JSON.stringify(appConfig), /audioManifests|alignmentManifest|\.wav/u);
  assert.deepEqual(resolveCvShowWebAudioConfig({
    url: 'https://portfolio.example/cv/?showAudio=local',
    baseUrl: 'https://portfolio.example/cv/',
    appConfig,
    userSettings: {
      audio: 'local',
      voice: 'barzana-2',
      locale: 'ru',
      audioManifests: { 'barzana-2': '../cv-show-audio-private/manifest.json' },
      alignmentManifest: '../cv-show-audio-private/alignment.json',
    },
  }), config, 'user settings cannot redirect the authenticated release');
  assert.equal(resolveCvShowWebAudioConfig({
    url: 'https://portfolio.example/cv/?showAudio=local&showVoice=custom-user',
    baseUrl: 'https://portfolio.example/cv/',
    appConfig,
  }), null);
  assert.equal(resolveCvShowWebAudioConfig({
    url: 'https://portfolio.example/cv/?showAudio=browser',
    baseUrl: 'https://portfolio.example/cv/',
    appConfig,
  }), null);
  assert.equal(resolveCvShowWebAudioConfig({
    url: 'https://portfolio.example/cv/?showAudio=local',
    baseUrl: 'https://other.example/cv/',
    appConfig,
  }), null);
  assert.equal(resolveCvShowWebAudioConfig({
    url: 'https://portfolio.example/cv/?showAudio=local',
    baseUrl: 'https://portfolio.example/cv/',
    appConfig: {
      audio: 'local',
      locale: 'ru',
      voice: 'barzana-2',
      audioManifests: { 'barzana-2': 'private/manifest.json' },
      alignmentManifest: 'private/alignment.json',
    },
  }), null, 'the old private/WAV configuration is not a runtime contract');
  assert.throws(() => projectCvShowWebAudioReleaseConfig({
    ...selector,
    revision: `${selector.revision.slice(0, -1)}${selector.revision.endsWith('0') ? '1' : '0'}`,
  }), /release is invalid: selector/u);
  assert.throws(() => projectCvShowWebAudioReleaseConfig({
    ...selector,
    manifest: { ...selector.manifest, path: `../private/${selector.manifest.path}` },
  }), /release is invalid: selector/u);
});

test('web audio release maps all 30 Opus clips and aligned sequences to current speech', async () => {
  let { config, manifest } = createWebAudioHarness();
  let release = await validateCvShowWebAudioRelease(manifest, CV_SHOW_STORY, config);
  assert.equal(release.schemaVersion, 'cv-show-web-audio-release-v1');
  assert.equal(release.locale, 'ru');
  assert.equal(release.clips.length, 30);
  assert.equal(release.clips.filter(({ kind }) => kind === 'short').length, 16);
  assert.equal(release.clips.filter(({ kind }) => kind === 'detail').length, 14);
  assert.equal(release.profile.mimeType, 'audio/ogg');
  assert.equal(release.profile.codecType, 'audio/ogg; codecs=opus');
  assert.equal(release.profile.durationToleranceMs, 10);
  for (let clip of release.clips) {
    assert.match(clip.audioUrl, /\.opus$/u);
    assert.match(clip.sequenceUrl, /\/aligned\/[^/]+\.json$/u);
    assert.notEqual(clip.deliverySha256, clip.masterWavSha256);
  }
  assert.equal(release.byId.get('positioning').speech, CV_SHOW_STORY.scenes[0].speech);
  assert.equal(
    release.byId.get('photopizza-details').speech,
    CV_SHOW_STORY.branches['photopizza-details'].speech,
  );
});

test('selected public web audio loads from its artifact-equivalent historical Project source', async () => {
  let appConfig = projectCvShowWebAudioReleaseConfig(CV_SHOW_WEB_AUDIO_RELEASE);
  let config = resolveCvShowWebAudioConfig({
    url: 'https://portfolio.example/cv/?showAudio=local',
    baseUrl: 'https://portfolio.example/cv/',
    appConfig,
  });
  let manifestBytes = await readFile(new URL(
    `../../src/static-pages/copy-cv-show-audio/${CV_SHOW_WEB_AUDIO_RELEASE.manifest.path}`,
    import.meta.url,
  ));
  clearCvShowWebAudioReleaseCache();
  let release = await loadCvShowWebAudioRelease({
    story: CV_SHOW_STORY,
    config,
    fetchImpl: async () => new Response(manifestBytes),
  });

  assert.equal(release.clips.length, 30);
  assert.equal(release.source.masterReleaseId, CV_SHOW_WEB_AUDIO_RELEASE.sourceMasterReleaseId);
  assert.equal(release.source.masterArtifactTreeHash, CV_SHOW_AUDIO_RELEASE.artifactTreeHash);
  assert.equal(release.source.audioManifestSha256, CV_SHOW_AUDIO_RELEASE.manifests.audio.sha256);
  assert.equal(release.source.alignmentManifestSha256, CV_SHOW_AUDIO_RELEASE.manifests.alignment.sha256);
});

test('web audio release rejects tampering while retaining immutable historical speech', async () => {
  let { config, manifest } = createWebAudioHarness();
  let cases = [
    ['source masterArtifactTreeHash', (value) => {
      value.source.masterArtifactTreeHash = `${value.source.masterArtifactTreeHash}x`;
    }],
    ['story contractRevision', (value) => { value.story.contractRevision = 'stale'; }],
    ['profile', (value) => { value.profile.durationToleranceMs = 11; }],
    ['profile', (value) => { value.profile.toolchainIdentity = ''; }],
    ['clip 1', (value) => { value.clips[0].order = 2; }],
    ['clip 17', (value) => { value.clips[16].order = 17; }],
    ['clip 1', (value) => { value.clips[0].deliveryFile = '../private.wav'; }],
    ['clip speech hash positioning', (value) => {
      let hash = value.clips[0].speechSha256;
      value.clips[0].speechSha256 = `${hash[0] === '0' ? '1' : '0'}${hash.slice(1)}`;
    }],
    ['payload', (value) => { value.model = 'large-v3-turbo'; }],
    ['clip 1', (value) => { value.clips[0].metrics = { timingCoverage: 1 }; }],
  ];
  for (let [reason, mutate] of cases) {
    let candidate = structuredClone(manifest);
    mutate(candidate);
    await assert.rejects(
      validateCvShowWebAudioRelease(candidate, CV_SHOW_STORY, config),
      new RegExp(`release is invalid: ${reason}`),
    );
  }
  await assert.rejects(
    validateCvShowWebAudioRelease(manifest, CV_SHOW_STORY, {
      ...config,
      releaseId: `${config.releaseId}x`,
    }),
    /release is invalid: selector binding/u,
  );
  await assert.rejects(
    validateCvShowWebAudioRelease(manifest, CV_SHOW_STORY, {
      ...config,
      sourceMasterReleaseId: `${config.sourceMasterReleaseId}x`,
    }),
    /release is invalid: selector binding/u,
  );
  let evolvedStory = structuredClone(CV_SHOW_STORY);
  evolvedStory.scenes[0].speech = `${evolvedStory.scenes[0].speech} Изменено.`;
  const historicalRelease = await validateCvShowWebAudioRelease(manifest, evolvedStory, config);
  assert.notEqual(
    historicalRelease.byId.get('positioning').speech,
    evolvedStory.scenes[0].speech,
    'an accepted immutable audio release may preserve its historical spoken text',
  );
  assert.equal(
    historicalRelease.byId.get('positioning').speech,
    manifest.clips[0].speech,
  );
  assert.equal(
    historicalRelease.byId.get('positioning').audioUrl,
    new URL(manifest.clips[0].deliveryFile, new URL('.', config.manifestUrl)).href,
    'runtime still binds the accepted delivery asset instead of regenerating it from display text',
  );
  await assert.rejects(
    validateCvShowWebAudioRelease({ ...manifest, voiceId: 'replacement-voice' }, CV_SHOW_STORY, config),
    /release is invalid: selector binding/u,
  );
});

test('web audio loader verifies raw manifest byte count and SHA-256 before JSON parsing', async () => {
  let { config, manifest, raw } = createWebAudioHarness();
  clearCvShowWebAudioReleaseCache();
  let release = await loadCvShowWebAudioRelease({
    story: CV_SHOW_STORY,
    config,
    fetchImpl: async () => new Response(raw),
  });
  assert.equal(release.releaseId, manifest.releaseId);

  clearCvShowWebAudioReleaseCache();
  await assert.rejects(loadCvShowWebAudioRelease({
    story: CV_SHOW_STORY,
    config: { ...config, manifestBytes: config.manifestBytes + 1 },
    fetchImpl: async () => new Response(raw),
  }), /release is invalid: manifest byte count/u);

  clearCvShowWebAudioReleaseCache();
  let invalidJson = 'x'.repeat(config.manifestBytes);
  await assert.rejects(loadCvShowWebAudioRelease({
    story: CV_SHOW_STORY,
    config,
    fetchImpl: async () => new Response(invalidJson),
  }), /release is invalid: manifest hash/u);

  clearCvShowWebAudioReleaseCache();
  let calls = 0;
  let fetchImpl = async () => {
    calls += 1;
    return new Response(calls === 1 ? invalidJson : raw);
  };
  await assert.rejects(loadCvShowWebAudioRelease({ story: CV_SHOW_STORY, config, fetchImpl }));
  assert.equal((await loadCvShowWebAudioRelease({
    story: CV_SHOW_STORY,
    config,
    fetchImpl,
  })).releaseId, manifest.releaseId);
  assert.equal(calls, 2, 'a failed raw-byte verification must not poison the cache');
});

test('narration and alignment share one verified public manifest fetch', async () => {
  let { appConfig, raw } = createWebAudioHarness();
  clearCvShowWebAudioReleaseCache();
  let fetches = 0;
  let fetchImpl = async () => {
    fetches += 1;
    return new Response(raw);
  };
  let narration = createCvShowNarrationController({
    browserSpeech: { available: false, cancel() {} },
    url: 'https://portfolio.example/cv/?showAudio=local',
    baseUrl: 'https://portfolio.example/cv/',
    appConfig,
    fetchImpl,
  });
  let alignment = createCvShowAlignmentController({
    url: 'https://portfolio.example/cv/?showAudio=local',
    baseUrl: 'https://portfolio.example/cv/',
    appConfig,
    fetchImpl,
  });
  let [narrationSnapshot, alignmentSnapshot] = await Promise.all([
    narration.prepare(CV_SHOW_STORY),
    alignment.prepare(CV_SHOW_STORY),
  ]);
  assert.equal(narrationSnapshot.source, 'local');
  assert.equal(alignmentSnapshot.available, true);
  assert.equal(alignmentSnapshot.version, 'cv-show-web-audio-release-v1');
  assert.equal(alignmentSnapshot.timingCoverage, 1);
  assert.equal(fetches, 1);
});

test('deferred aligned startup loads paused media without presentation admission', async (t) => {
  let { appConfig, manifest, raw } = createWebAudioHarness();
  clearCvShowWebAudioReleaseCache();
  const authority = createCvShowAuthoringAuthority({
    seedProject: CV_SHOW_STRUCTURAL_MEDIA_FIXTURE.project,
  });
  const fetchImpl = async (url) => {
    const clip = manifest.clips.find(({ alignedSequenceFile }) => (
      String(url).endsWith(alignedSequenceFile)
    ));
    return new Response(
      clip ? CV_SHOW_STRUCTURAL_MEDIA_FIXTURE.sequenceJson(clip.id) : raw,
      { headers: { 'content-type': 'application/json' } },
    );
  };
  const alignment = createCvShowAlignmentController({
    url: 'https://portfolio.example/cv/?showAudio=local',
    baseUrl: 'https://portfolio.example/cv/',
    appConfig,
    fetchImpl,
    getAuthoringView: () => authority.getView(),
  });
  t.after(() => {
    alignment.cancel();
    authority.dispose();
  });
  assert.equal((await alignment.prepare(CV_SHOW_STORY)).available, true);

  class FakeMedia extends EventTarget {
    #currentTime = 0;
    #src = '';
    paused = true;
    ended = false;
    error = null;
    readyState = 0;
    preload = '';
    loadCount = 0;
    playCount = 0;
    seekable = { length: 1, start: () => 0, end: () => 60 };

    get currentTime() { return this.#currentTime; }
    set currentTime(value) {
      this.#currentTime = Number(value) || 0;
      this.dispatchEvent(new Event('seeking'));
      this.dispatchEvent(new Event('seeked'));
    }
    get src() { return this.#src; }
    set src(value) { this.#src = String(value); }
    get currentSrc() { return this.#src; }
    pause() { this.paused = true; }
    play() {
      this.playCount += 1;
      this.paused = false;
      this.dispatchEvent(new Event('play'));
      this.dispatchEvent(new Event('playing'));
      return Promise.resolve();
    }
    load() {
      this.loadCount += 1;
      this.dispatchEvent(new Event('loadstart'));
      this.readyState = 1;
      this.dispatchEvent(new Event('loadedmetadata'));
      this.readyState = 2;
      this.dispatchEvent(new Event('loadeddata'));
    }
  }

  const operations = [];
  const media = new FakeMedia();
  const entry = CV_SHOW_STORY.scenes.find(({ id }) => id === 'symbiote-workspace');
  const clip = manifest.clips.find(({ id }) => id === entry.id);
  const aligned = await alignment.createEntryRuntime({
    entry,
    media,
    audioClip: clip,
    deferPresentationUntilPlayback: true,
    runPresentationOperation: async (operation) => {
      operations.push(operation.projectCell.id);
    },
  });
  t.after(() => aligned.runtime.dispose());
  const receipt = await aligned.runtime.loadAndRestorePlayback({
    source: 'https://portfolio.example/cv/cv-show-audio/symbiote-workspace.opus',
    positionMs: 0,
    paused: true,
    preload: 'auto',
  }, { reason: 'alignment-ready' });

  assert.equal(receipt.status, 'completed');
  assert.equal(media.loadCount, 1);
  assert.equal(media.playCount, 0);
  assert.equal(media.paused, true);
  assert.deepEqual(operations, [], 'paused preparation cannot admit presenter operations');

  const completedProjectCheckpointMs = Math.max(
    ...aligned.playbackPlan.cells.map(({ span }) => Number(span.endMs) || 0),
  );
  const completedMedia = new FakeMedia();
  const completed = await alignment.createEntryRuntime({
    entry,
    media: completedMedia,
    audioClip: clip,
    checkpointMs: completedProjectCheckpointMs,
    restorePausedCheckpoint: true,
    runPresentationOperation: async (operation) => {
      const observedAt = freezeProviderValue({
        domain: 'performance',
        timeOriginMs: performance.timeOrigin,
        monotonicTimeMs: performance.now(),
      });
      if (operation.kind === 'attention') {
        operation.reportAdmission({
          providerAdmission: providerAdmissionFixture({
            mode: operation.source.type,
            gestureId: operation.source.id,
            targetId: operation.scheduleCell.targetId,
            limitMs: operation.scheduleCell.gesture.endMs - operation.scheduleCell.gesture.startMs,
            plannedDurationMs: Math.min(
              500,
              operation.scheduleCell.gesture.endMs - operation.scheduleCell.gesture.startMs,
            ),
          }),
        });
        operation.reportReceipt({
          status: 'first-frame',
          observedAt,
          providerReceipt: { status: 'presenting' },
        });
        operation.reportReceipt({
          status: 'settled',
          observedAt,
          providerReceipt: { status: 'settled' },
        });
        return undefined;
      }
      if (operation.projectCell.cue.interaction?.type === 'select') {
        operation.reportAdmission({
          providerAdmission: providerAdmissionFixture({
            mode: 'frame',
            gestureId: operation.source.id,
            targetId: operation.scheduleCell.targetId,
            limitMs: operation.scheduleCell.gesture.endMs - operation.scheduleCell.gesture.startMs,
            plannedDurationMs: Math.min(
              500,
              operation.scheduleCell.gesture.endMs - operation.scheduleCell.gesture.startMs,
            ),
          }),
        });
      }
      operation.reportReceipt({
        status: 'acted',
        observedAt,
        providerReceipt: { status: 'acted' },
      });
      operation.reportReceipt({
        status: 'settled',
        observedAt,
        providerReceipt: { status: 'settled' },
      });
    },
  });
  t.after(() => completed.runtime.dispose());
  const completedReceipt = await completed.runtime.loadAndRestorePlayback({
    source: 'https://portfolio.example/cv/cv-show-audio/symbiote-workspace.opus',
    positionMs: completedProjectCheckpointMs,
    paused: true,
    preload: 'auto',
  }, { reason: 'completed-checkpoint-restore' });

  assert.equal(completedReceipt.status, 'completed');
  assert.equal(completedReceipt.presentationComplete, true);
  assert.equal(completedMedia.loadCount, 0, 'a completed checkpoint must not reload media at EOF');
  assert.equal(completedMedia.playCount, 0);
  assert.equal(completed.runtime.presentationPositionMs, completedProjectCheckpointMs);

  const sourceCheckpointMs = 20_210;
  const fullSpeechClip = aligned.playbackPlan.clips[0];
  const restoredProjectCheckpointMs = fullSpeechClip.span.startMs
    + sourceCheckpointMs
    - fullSpeechClip.audio.sourceInMs;

  const restoredOperations = [];
  const restoredMedia = new FakeMedia();
  const restored = await alignment.createEntryRuntime({
    entry,
    media: restoredMedia,
    audioClip: clip,
    checkpointMs: restoredProjectCheckpointMs,
    deferPresentationUntilPlayback: true,
    restorePausedCheckpoint: true,
    runPresentationOperation: async (operation) => {
      restoredOperations.push(operation.projectCell.id);
      const observedAt = freezeProviderValue({
        domain: 'performance',
        timeOriginMs: performance.timeOrigin,
        monotonicTimeMs: performance.now(),
      });
      if (operation.kind === 'attention') {
        const admission = providerAdmissionFixture({
          mode: operation.source.type,
          gestureId: operation.source.id,
          targetId: operation.scheduleCell.targetId,
          limitMs: operation.scheduleCell.gesture.endMs - operation.scheduleCell.gesture.startMs,
          plannedDurationMs: Math.min(
            500,
            operation.scheduleCell.gesture.endMs - operation.scheduleCell.gesture.startMs,
          ),
        });
        operation.reportAdmission({ providerAdmission: admission });
        operation.reportReceipt({
          status: 'first-frame',
          observedAt,
          providerReceipt: { status: 'presenting' },
        });
        operation.reportReceipt({
          status: 'settled',
          observedAt,
          providerReceipt: { status: 'settled' },
        });
        return undefined;
      }
      if (operation.projectCell.cue.interaction?.type === 'select') {
        operation.reportAdmission({
          providerAdmission: providerAdmissionFixture({
            mode: 'frame',
            gestureId: operation.source.id,
            targetId: operation.scheduleCell.targetId,
            limitMs: operation.scheduleCell.gesture.endMs - operation.scheduleCell.gesture.startMs,
            plannedDurationMs: Math.min(
              500,
              operation.scheduleCell.gesture.endMs - operation.scheduleCell.gesture.startMs,
            ),
          }),
        });
      }
      operation.reportReceipt({
        status: 'acted',
        observedAt,
        providerReceipt: { status: 'acted' },
      });
      operation.reportReceipt({
        status: 'settled',
        observedAt,
        providerReceipt: { status: 'settled' },
      });
      return undefined;
    },
  });
  t.after(() => restored.runtime.dispose());
  const restoredReceipt = await restored.runtime.loadAndRestorePlayback({
    source: 'https://portfolio.example/cv/cv-show-audio/symbiote-workspace.opus',
    positionMs: restoredProjectCheckpointMs,
    paused: true,
    preload: 'auto',
  }, { reason: 'checkpoint-restore' });

  assert.equal(restoredReceipt.status, 'completed');
  assert.equal(restoredReceipt.requestedMs, sourceCheckpointMs);
  assert.equal(restoredReceipt.observedMs, sourceCheckpointMs);
  assert.equal(restoredMedia.playCount, 0, 'static checkpoint restoration cannot autoplay media');
  assert.equal(restoredMedia.paused, true);
  assert.equal(Math.round(restoredMedia.currentTime * 1_000), sourceCheckpointMs);
  assert.equal(restored.runtime.presentationPositionMs, restoredProjectCheckpointMs);
  assert.deepEqual(
    restoredOperations,
    ['cv-show:cue:workspace.open'],
    'a paused checkpoint restores setup without inventing an attention cue that is no longer held',
  );
  assert.deepEqual(restored.heldAttentionDirectiveIds, []);
  assert.deepEqual(restored.includedSpeechDirectiveIds, [
    'workspace.portable-config',
    'workspace.agent-portal-card',
  ]);
  assert.deepEqual(
    restored.playbackPlan.cells
      .filter(({ kind }) => kind !== 'narration')
      .map(({ id }) => id),
    [
      'cv-show:cue:workspace.open',
      'cv-show:audio-clip:symbiote-workspace:01',
      'cv-show:cue:workspace.portable-config:scroll',
      'cv-show:cue:workspace.portable-config',
      'cv-show:cue:workspace.agent-portal-card:scroll',
      'cv-show:cue:workspace.agent-portal-card',
    ],
    'the checkpoint preserves one continuous speech layer and only future visual events',
  );
  assert.deepEqual(
    restored.playbackPlan.clips.map(({ id, audio, dependsOn }) => ({ id, audio, dependsOn })),
    [
      {
        id: 'cv-show:audio-clip:symbiote-workspace:01',
        audio: {
          assetId: 'cv-show:audio:symbiote-workspace',
          sourceInMs: 0,
          sourceOutMs: 47_820,
        },
        dependsOn: [{ cellId: 'cv-show:cue:workspace.open', barrier: 'settled' }],
      },
    ],
    'checkpoint restoration seeks inside the same uninterrupted narration clip',
  );
});

async function waitForCvShowPlayback(condition, message) {
  for (let attempt = 0; attempt < 50; attempt += 1) {
    if (condition()) return;
    await new Promise((resolve) => setImmediate(resolve));
  }
  assert.ok(condition(), message);
}

test('Project playback keeps narration active while speech-timed actions settle', async (t) => {
  let { appConfig, manifest, raw } = createWebAudioHarness();
  clearCvShowWebAudioReleaseCache();
  const authority = createCvShowAuthoringAuthority({
    seedProject: CV_SHOW_STRUCTURAL_MEDIA_FIXTURE.project,
  });
  const fetchImpl = async (url) => {
    const clip = manifest.clips.find(({ alignedSequenceFile }) => (
      String(url).endsWith(alignedSequenceFile)
    ));
    return new Response(
      clip ? CV_SHOW_STRUCTURAL_MEDIA_FIXTURE.sequenceJson(clip.id) : raw,
      { headers: { 'content-type': 'application/json' } },
    );
  };
  const alignment = createCvShowAlignmentController({
    url: 'https://portfolio.example/cv/?showAudio=local',
    baseUrl: 'https://portfolio.example/cv/',
    appConfig,
    fetchImpl,
    getAuthoringView: () => authority.getView(),
  });
  t.after(() => {
    alignment.cancel();
    authority.dispose();
  });
  assert.equal((await alignment.prepare(CV_SHOW_STORY)).available, true);

  const events = [];
  const resets = [];
  class ProjectAudioMedia extends EventTarget {
    #currentTime = 0;
    #src = '';
    paused = true;
    ended = false;
    error = null;
    readyState = 2;
    preload = '';
    seekable = { length: 1, start: () => 0, end: () => 200 };

    get currentTime() { return this.#currentTime; }
    set currentTime(value) {
      this.#currentTime = Number(value) || 0;
      this.dispatchEvent(new Event('seeking'));
      this.dispatchEvent(new Event('seeked'));
    }
    finishClip(milliseconds) {
      this.#currentTime = milliseconds / 1_000;
      this.dispatchEvent(new Event('timeupdate'));
    }
    get src() { return this.#src; }
    set src(value) { this.#src = String(value); }
    get currentSrc() { return this.#src; }
    pause() {
      this.paused = true;
      this.dispatchEvent(new Event('pause'));
    }
    play() {
      this.paused = false;
      events.push(`audio:play:${Math.round(this.#currentTime * 1_000)}`);
      this.dispatchEvent(new Event('play'));
      this.dispatchEvent(new Event('playing'));
      return Promise.resolve();
    }
    load() {
      this.dispatchEvent(new Event('loadstart'));
      this.dispatchEvent(new Event('loadedmetadata'));
      this.dispatchEvent(new Event('loadeddata'));
    }
  }

  const operations = [];
  const media = new ProjectAudioMedia();
  const entry = CV_SHOW_STORY.scenes.find(({ id }) => id === 'photopizza');
  const clip = manifest.clips.find(({ id }) => id === entry.id);
  const aligned = await alignment.createEntryRuntime({
    entry,
    media,
    audioClip: clip,
    runPresentationOperation: async (operation) => {
      operations.push(operation.projectCell.id);
      events.push(`action:start:${operation.projectCell.id}`);
      const observedAt = freezeProviderValue({
        domain: 'performance',
        timeOriginMs: performance.timeOrigin,
        monotonicTimeMs: performance.now(),
      });
      if (operation.projectCell.cue.interaction?.type === 'select') {
        operation.reportAdmission({
          providerAdmission: providerAdmissionFixture({
            mode: 'frame',
            gestureId: operation.source.id,
            targetId: operation.scheduleCell.targetId,
            limitMs: operation.scheduleCell.gesture.endMs - operation.scheduleCell.gesture.startMs,
            plannedDurationMs: 100,
          }),
        });
      }
      operation.reportReceipt({
        status: 'acted',
        observedAt,
        providerReceipt: { status: 'acted' },
      });
      operation.reportReceipt({
        status: 'settled',
        observedAt,
        providerReceipt: { status: 'settled' },
      });
      events.push(`action:return:${operation.projectCell.id}`);
    },
    onReceipt: ({ cellId, status }) => events.push(`receipt:${cellId}:${status}`),
    onReset: (receipt) => resets.push(receipt),
  });
  t.after(() => aligned.runtime.dispose());
  await aligned.runtime.loadAndRestorePlayback({
    source: 'https://portfolio.example/cv/cv-show-audio/photopizza.opus',
    positionMs: 0,
    paused: true,
    preload: 'auto',
  }, { reason: 'alignment-ready' });
  events.length = 0;
  operations.length = 0;
  resets.length = 0;
  assert.equal(aligned.playbackPlan.clips.length, 1);
  const [speechClip] = aligned.playbackPlan.clips;
  const originScroll = aligned.playbackPlan.events.find(({ id }) => (
    id === 'cv-show:cue:photopizza.origin:scroll'
  ));
  const originFocus = aligned.playbackPlan.events.find(({ id }) => (
    id === 'cv-show:cue:photopizza.origin'
  ));
  aligned.runtime.resume();
  await waitForCvShowPlayback(
    () => events.includes(`audio:play:${speechClip.audio.sourceInMs}`),
    'the continuous Project audio clip must start from its authored source range',
  );
  const originSourcePositionMs = speechClip.audio.sourceInMs
    + originScroll.span.startMs
    - speechClip.span.startMs;
  media.finishClip(originSourcePositionMs);
  await waitForCvShowPlayback(
    () => operations.includes(originScroll.id),
    'the scroll action must start from the live narration clock',
  );
  assert.equal(media.paused, false, 'speech continues while the visual action runs');
  const originFocusSourcePositionMs = speechClip.audio.sourceInMs
    + originFocus.span.startMs
    - speechClip.span.startMs;
  media.finishClip(originFocusSourcePositionMs);
  await waitForCvShowPlayback(
    () => operations.includes(originFocus.id),
    'the dependent focus follows without interrupting narration',
  );
  assert.deepEqual(
    resets,
    [],
    'Project-owned narration progress cannot masquerade as an external timeline reset',
  );

  const sequence = [
    `audio:play:${speechClip.audio.sourceInMs}`,
    'receipt:cv-show:cue:photopizza.origin:scroll:settled',
    'receipt:cv-show:cue:photopizza.origin:settled',
  ].map((event) => events.indexOf(event));
  assert.ok(sequence.every((index) => index >= 0), `missing playback evidence: ${events.join(', ')}`);
  assert.deepEqual(
    [...sequence].sort((left, right) => left - right),
    sequence,
    'the visual dependency graph settles in order while narration remains active',
  );
  assert.deepEqual(operations, [
    'cv-show:cue:photopizza.origin:scroll',
    'cv-show:cue:photopizza.origin',
  ]);
  media.finishClip(speechClip.audio.sourceOutMs);
  media.ended = true;
  media.dispatchEvent(new Event('ended'));
  await waitForCvShowPlayback(
    () => events.includes(`receipt:${speechClip.id}:ended`),
    'the continuous narration clip must end only at the authored entry boundary',
  );
  await aligned.runtime.stop();
});

test('Project playback keeps speech running through a framed media focus and retries after pause', async (t) => {
  let { appConfig, manifest, raw } = createWebAudioHarness();
  clearCvShowWebAudioReleaseCache();
  const authority = createCvShowAuthoringAuthority({
    seedProject: CV_SHOW_STRUCTURAL_MEDIA_FIXTURE.project,
  });
  const fetchImpl = async (url) => {
    const clip = manifest.clips.find(({ alignedSequenceFile }) => (
      String(url).endsWith(alignedSequenceFile)
    ));
    return new Response(
      clip ? CV_SHOW_STRUCTURAL_MEDIA_FIXTURE.sequenceJson(clip.id) : raw,
      { headers: { 'content-type': 'application/json' } },
    );
  };
  const alignment = createCvShowAlignmentController({
    url: 'https://portfolio.example/cv/?showAudio=local',
    baseUrl: 'https://portfolio.example/cv/',
    appConfig,
    fetchImpl,
    getAuthoringView: () => authority.getView(),
  });
  t.after(() => {
    alignment.cancel();
    authority.dispose();
  });
  assert.equal((await alignment.prepare(CV_SHOW_STORY)).available, true);

  const events = [];
  class ControlledMedia extends EventTarget {
    #currentTime = 0;
    #src = '';
    paused = true;
    ended = false;
    error = null;
    readyState = 2;
    preload = '';
    playCount = 0;
    seekable = { length: 1, start: () => 0, end: () => 200 };

    get currentTime() { return this.#currentTime; }
    set currentTime(value) {
      this.#currentTime = Number(value) || 0;
      this.dispatchEvent(new Event('seeking'));
      this.dispatchEvent(new Event('seeked'));
    }
    finishClip(milliseconds) {
      this.#currentTime = milliseconds / 1_000;
      this.dispatchEvent(new Event('timeupdate'));
    }
    advanceSilentlyTo(milliseconds) { this.#currentTime = milliseconds / 1_000; }
    get src() { return this.#src; }
    set src(value) { this.#src = String(value); }
    get currentSrc() { return this.#src; }
    pause() {
      this.paused = true;
      this.dispatchEvent(new Event('pause'));
    }
    play() {
      this.playCount += 1;
      this.paused = false;
      events.push(`audio:play:${Math.round(this.#currentTime * 1_000)}`);
      this.dispatchEvent(new Event('play'));
      this.dispatchEvent(new Event('playing'));
      return Promise.resolve();
    }
    load() {
      this.dispatchEvent(new Event('loadstart'));
      this.dispatchEvent(new Event('loadedmetadata'));
      this.dispatchEvent(new Event('loadeddata'));
    }
  }

  const media = new ControlledMedia();
  const entry = CV_SHOW_STORY.scenes.find(({ id }) => id === 'photopizza');
  const clip = manifest.clips.find(({ id }) => id === entry.id);
  let releaseAttentionReadiness;
  let reportAttentionStarted;
  const attentionReadiness = new Promise((resolve) => { releaseAttentionReadiness = resolve; });
  const attentionStarted = new Promise((resolve) => { reportAttentionStarted = resolve; });
  const operations = [];
  const aligned = await alignment.createEntryRuntime({
    entry,
    media,
    audioClip: clip,
    runPresentationOperation: async (operation) => {
      events.push(`action:start:${operation.projectCell.id}`);
      operations.push(Object.freeze({
        id: operation.projectCell.id,
        mediaPaused: media.paused,
        mediaTimeMs: Math.round(media.currentTime * 1_000),
      }));
      if (operation.projectCell.id === 'cv-show:cue:photopizza.video-01') {
        reportAttentionStarted();
        await attentionReadiness;
      }
      const observedAt = freezeProviderValue({
        domain: 'performance',
        timeOriginMs: performance.timeOrigin,
        monotonicTimeMs: performance.now(),
      });
      if (operation.kind === 'attention') {
        operation.reportAdmission({
          providerAdmission: providerAdmissionFixture({
            mode: operation.source.type,
            gestureId: operation.source.id,
            targetId: operation.scheduleCell.targetId,
            limitMs: operation.scheduleCell.gesture.endMs
              - operation.scheduleCell.gesture.startMs,
            plannedDurationMs: 100,
          }),
        });
        operation.reportReceipt({
          status: 'first-frame',
          observedAt,
          providerReceipt: { status: 'presenting' },
        });
        operation.reportReceipt({
          status: 'settled',
          observedAt,
          providerReceipt: { status: 'settled' },
        });
        events.push(`action:return:${operation.projectCell.id}`);
        return;
      }
      if (operation.projectCell.cue.interaction?.type === 'select') {
        operation.reportAdmission({
          providerAdmission: providerAdmissionFixture({
            mode: 'frame',
            gestureId: operation.source.id,
            targetId: operation.scheduleCell.targetId,
            limitMs: operation.scheduleCell.gesture.endMs
              - operation.scheduleCell.gesture.startMs,
            plannedDurationMs: 100,
          }),
        });
      }
      operation.reportReceipt({ status: 'acted', observedAt, providerReceipt: { status: 'acted' } });
      operation.reportReceipt({
        status: 'settled', observedAt, providerReceipt: { status: 'settled' },
      });
      events.push(`action:return:${operation.projectCell.id}`);
    },
    onReceipt: ({ cellId, status }) => events.push(`receipt:${cellId}:${status}`),
  });
  t.after(() => aligned.runtime.dispose());
  await aligned.runtime.loadAndRestorePlayback({
    source: 'https://portfolio.example/cv/cv-show-audio/photopizza.opus',
    positionMs: 0,
    paused: true,
    preload: 'auto',
  }, { reason: 'alignment-ready' });
  events.length = 0;
  operations.length = 0;
  assert.equal(aligned.playbackPlan.clips.length, 1);
  const [speechClip] = aligned.playbackPlan.clips;
  const videoScroll = aligned.playbackPlan.events.find(({ id }) => (
    id === 'cv-show:cue:photopizza.video-01:scroll'
  ));
  const videoFocus = aligned.playbackPlan.events.find(({ id }) => (
    id === 'cv-show:cue:photopizza.video-01'
  ));
  aligned.runtime.resume();
  await waitForCvShowPlayback(() => media.playCount === 1, 'narration did not start');
  const sourcePositionFor = ({ span }) => speechClip.audio.sourceInMs
    + span.startMs
    - speechClip.span.startMs;
  const eventsBeforeFocus = aligned.playbackPlan.events.filter(({ span }) => (
    span.startMs >= speechClip.span.startMs
      && span.startMs <= videoScroll.span.startMs
  ));
  for (const event of eventsBeforeFocus) {
    media.finishClip(sourcePositionFor(event));
    await waitForCvShowPlayback(
      () => operations.some(({ id }) => id === event.id),
      `${event.id} did not start from the narration clock`,
    );
  }
  media.finishClip(sourcePositionFor(videoFocus));
  await attentionStarted;
  assert.equal(media.playCount, 1, 'a visual action cannot restart narration');
  assert.equal(media.paused, false, 'narration remains active while the focus is pending');

  releaseAttentionReadiness();
  await waitForCvShowPlayback(
    () => events.includes('receipt:cv-show:cue:photopizza.video-01:settled'),
    'the required media-block focus must settle on its own visual layer',
  );
  assert.equal(media.playCount, 1, 'focus settlement does not create an audio boundary');

  const resumeSourceMs = sourcePositionFor(videoFocus) + 1_000;
  media.advanceSilentlyTo(resumeSourceMs);
  await aligned.runtime.pause();
  assert.equal(media.paused, true);
  assert.ok(
    events.includes(`receipt:${speechClip.id}:cancelled`),
    'pausing cancels only the active attempt without completing the Project clip',
  );
  aligned.runtime.resume();
  await waitForCvShowPlayback(() => media.playCount === 2, 'paused narration was not retried');
  assert.equal(
    events.at(-1),
    `audio:play:${resumeSourceMs}`,
    'resume continues the same Project speech clip from the observed source position',
  );
  await aligned.runtime.stop();
});

test('fresh scene turn-start navigation is the one Project setup cell', () => {
  const entry = CV_SHOW_STORY.scenes.find(({ id }) => id === 'symbiote-workspace');
  const partition = partitionCvShowAlignedDirectives(entry.directives);
  assert.deepEqual(partition.sceneSetup.map(({ id }) => id), ['workspace.open']);
  assert.deepEqual(partition.scheduled.map(({ source }) => source.id), [
    'workspace.intro-frame',
    'workspace.portable-config',
    'workspace.agent-portal-card',
  ]);

  const setup = CV_SHOW_PRESENTATION_PROJECT.cells.filter(({ id, kind, turnId, timing }) => (
    turnId === entry.id
    && kind === 'cue'
    && !id.endsWith(':scroll')
    && timing?.at.anchor === 'turn-start'
  ));
  assert.deepEqual(setup.map(({ id }) => id), ['cv-show:cue:workspace.open']);
  assert.deepEqual(setup[0].timing.at, { anchor: 'turn-start', offsetMs: 0 });
});
test('public alignment keeps authored speech anchors without private model diagnostics', () => {
  assert.throws(() => resolveCvShowAudioAnchor({
    id: 'unknown.frame', type: 'frame',
  }, 1, 4), /directive timing unknown\.frame/);
  assert.deepEqual(resolveCvShowAudioAnchor({
    id: 'workspace.open',
    type: 'navigate',
    timing: { phase: 'setup' },
  }, 0, 5), { anchor: 'turn-start', offsetMs: 0 });
  assert.deepEqual(resolveCvShowAudioAnchor({
    id: 'workspace.portable-config',
    type: 'native-selection',
    timing: {
      phase: 'speech',
      anchor: 'speech',
      quote: 'Результат сохраняется',
      occurrence: 1,
      edge: 'start',
      offsetMs: -900,
    },
  }, 2, 5), {
    anchor: 'speech', quote: 'Результат сохраняется', occurrence: 1, edge: 'start', offsetMs: -900,
  });
});
test('local audio controller plays, pauses, resumes and cancels the exact manifest clip', async () => {
  let manifest = await validatedWebAudioManifest();
  let audios = [];
  const createAudio = () => {
    let listeners = new Map();
    let source = '';
    let currentTime = 0;
    let audio = {
      paused: true,
      playCalls: 0,
      pauseCalls: 0,
      loadCalls: 0,
      sourceAssignments: 0,
      currentTimeAssignments: 0,
      get src() { return source; },
      set src(value) { source = value; this.sourceAssignments += 1; },
      get currentTime() { return currentTime; },
      set currentTime(value) { currentTime = value; this.currentTimeAssignments += 1; },
      addEventListener(type, listener) { listeners.set(type, listener); },
      removeEventListener(type, listener) {
        if (listeners.get(type) === listener) listeners.delete(type);
      },
      play() { this.paused = false; this.playCalls += 1; return Promise.resolve(); },
      pause() { this.paused = true; this.pauseCalls += 1; },
      removeAttribute(name) { if (name === 'src') source = ''; },
      load() { this.loadCalls += 1; },
      emit(type) { listeners.get(type)?.(); },
    };
    audios.push(audio);
    return audio;
  };
  let ended = 0;
  const speech = createLocalAudioSpeechController({ manifest, createAudio });
  assert.equal(speech.speak(CV_SHOW_STORY.scenes[0].speech, {
    id: 'positioning',
    lang: 'ru',
    onMedia: () => Object.freeze({
      status: 'completed',
      reason: 'alignment-ready',
      generation: 1,
      requestedMs: 0,
      observedMs: 0,
    }),
    onEnd: () => { ended += 1; },
  }), true);
  await Promise.resolve();
  assert.equal(audios[0].src, '', 'the CV controller must not assign the media source');
  assert.equal(audios[0].sourceAssignments, 0);
  assert.equal(audios[0].currentTimeAssignments, 0);
  assert.equal(audios[0].loadCalls, 0);
  assert.equal(speech.snapshot.generationReceipt.status, 'completed');
  speech.pause();
  assert.equal(audios[0].paused, true);
  assert.equal(speech.resume(), true);
  assert.equal(audios[0].playCalls, 2);
  audios[0].emit('ended');
  assert.equal(ended, 1);
  assert.equal(speech.snapshot.activeId, '');

  speech.speak(CV_SHOW_STORY.scenes[1].speech, {
    id: 'symbiote-workspace',
    lang: 'ru',
    onMedia: () => Object.freeze({ status: 'completed', reason: 'alignment-ready' }),
  });
  speech.cancel();
  assert.equal(audios[1].currentTimeAssignments, 0);
  assert.equal(speech.snapshot.activeId, '');
  assert.equal(speech.speak(CV_SHOW_STORY.scenes[0].speech, { id: 'positioning', lang: 'en' }), false);
});

test('local audio waits for the aligned presentation layer before completing a scene', async () => {
  const manifest = await validatedWebAudioManifest();
  const audio = new EventTarget();
  audio.paused = true;
  audio.currentTime = 0;
  audio.play = () => {
    audio.paused = false;
    return Promise.resolve();
  };
  audio.pause = () => { audio.paused = true; };

  let resolveAlignedEnd;
  const alignedEnd = new Promise((resolve) => { resolveAlignedEnd = resolve; });
  const order = [];
  const speech = createLocalAudioSpeechController({ manifest, createAudio: () => audio });
  assert.equal(speech.speak(CV_SHOW_STORY.scenes[0].speech, {
    id: 'positioning',
    lang: 'ru',
    onMedia: () => {
      audio.addEventListener('ended', () => {
        order.push('aligned-ended');
        resolveAlignedEnd();
      }, { once: true });
      return Object.freeze({ status: 'completed', reason: 'alignment-ready' });
    },
    beforeEnd: () => alignedEnd,
    onEnd: () => order.push('scene-ended'),
  }), true);
  await Promise.resolve();

  audio.dispatchEvent(new Event('ended'));
  assert.deepEqual(order, ['aligned-ended']);
  await alignedEnd;
  await Promise.resolve();
  assert.deepEqual(order, ['aligned-ended', 'scene-ended']);
});

test('local audio completes an exact end checkpoint without replaying the media element', async () => {
  const manifest = await validatedWebAudioManifest();
  const audio = new EventTarget();
  audio.paused = true;
  audio.currentTime = 31.42;
  audio.playCalls = 0;
  audio.play = () => {
    audio.playCalls += 1;
    audio.paused = false;
    return Promise.resolve();
  };
  audio.pause = () => { audio.paused = true; };

  let ended = 0;
  const speech = createLocalAudioSpeechController({ manifest, createAudio: () => audio });
  assert.equal(speech.speak(CV_SHOW_STORY.scenes[10].speech, {
    id: 'mobile-smm-platform',
    lang: 'ru',
    startPaused: true,
    onMedia: () => Object.freeze({
      status: 'completed',
      reason: 'paused-checkpoint',
      presentationComplete: true,
    }),
    beforeEnd: () => Promise.resolve(),
    onEnd: () => { ended += 1; },
  }), true);
  await Promise.resolve();

  audio.dispatchEvent(new Event('ended'));
  await Promise.resolve();
  await Promise.resolve();
  assert.equal(ended, 0, 'a paused end checkpoint waits for an explicit Resume');
  assert.equal(speech.resume(), true);
  await Promise.resolve();
  await Promise.resolve();
  assert.equal(audio.playCalls, 0, 'an exhausted clip must not be replayed at its physical end');
  assert.equal(ended, 1);
});

test('local audio selects the Project-bound clip by id while captions retain authored text', async () => {
  const manifest = await validatedWebAudioManifest();
  const audio = {
    paused: true,
    currentTime: 0,
    addEventListener() {},
    removeEventListener() {},
    play() { this.paused = false; return Promise.resolve(); },
    pause() { this.paused = true; },
  };
  const speech = createLocalAudioSpeechController({ manifest, createAudio: () => audio });
  const authoredCaption = `${CV_SHOW_STORY.scenes[0].speech} `;
  assert.notEqual(authoredCaption, manifest.byId.get('positioning').speech);
  let admittedClip = null;
  assert.equal(speech.speak(authoredCaption, {
    id: 'positioning',
    lang: 'ru',
    startPaused: true,
    onMedia: (_media, clip) => {
      admittedClip = clip;
      return Object.freeze({ status: 'completed', reason: 'project-binding-accepted' });
    },
  }), true);
  await Promise.resolve();
  assert.equal(admittedClip?.id, 'positioning');
});

test('local audio waits for the shared alignment handoff before playback', async () => {
  let manifest = await validatedWebAudioManifest();
  let releaseAlignment;
  let audio = {
    paused: true,
    currentTime: 0,
    playCalls: 0,
    addEventListener() {},
    removeEventListener() {},
    play() { this.paused = false; this.playCalls += 1; return Promise.resolve(); },
    pause() { this.paused = true; },
  };
  const alignmentReady = new Promise((resolve) => { releaseAlignment = resolve; });
  const speech = createLocalAudioSpeechController({ manifest, createAudio: () => audio });
  assert.equal(speech.speak(CV_SHOW_STORY.scenes[0].speech, {
    id: 'positioning',
    lang: 'ru',
    startPaused: true,
    onMedia: () => alignmentReady,
  }), true);
  await Promise.resolve();
  assert.equal(audio.playCalls, 0);
  assert.equal(speech.resume(), true);
  assert.equal(audio.playCalls, 0, 'Resume waits for the owned media generation');
  releaseAlignment(Object.freeze({
    status: 'completed',
    reason: 'alignment-ready',
    generation: 1,
    requestedMs: 0,
    observedMs: 0,
  }));
  await alignmentReady;
  await Promise.resolve();
  assert.equal(audio.playCalls, 1, 'the queued Resume plays after alignment settles');
  assert.equal(speech.snapshot.generationReceipt.status, 'completed');
});

test('local audio can arm an aligned Resume without playing media outside its gate', async () => {
  const manifest = await validatedWebAudioManifest();
  const started = [];
  const listeners = new Map();
  const audio = {
    paused: true,
    currentTime: 0,
    playCalls: 0,
    addEventListener(type, listener) { listeners.set(type, listener); },
    removeEventListener(type, listener) {
      if (listeners.get(type) === listener) listeners.delete(type);
    },
    play() {
      this.paused = false;
      this.playCalls += 1;
      return Promise.resolve();
    },
    pause() { this.paused = true; },
    emit(type) { listeners.get(type)?.(); },
  };
  const speech = createLocalAudioSpeechController({ manifest, createAudio: () => audio });
  assert.equal(speech.speak(CV_SHOW_STORY.scenes[0].speech, {
    id: 'positioning',
    lang: 'ru',
    startPaused: true,
    onMedia: () => Object.freeze({ status: 'completed', reason: 'alignment-ready' }),
    onStart: () => started.push('playing'),
  }), true);
  await Promise.resolve();

  assert.equal(speech.resume({ deferMedia: true }), true);
  assert.equal(audio.playCalls, 0, 'the speech layer cannot bypass the aligned media gate');
  await audio.play();
  audio.emit('playing');
  assert.deepEqual(started, ['playing'], 'the armed request still publishes physical playback');
});

test('local audio pause revokes a delayed play while aligned preparation is pending', async () => {
  let manifest = await validatedWebAudioManifest();
  let releaseAlignment;
  let audio = {
    paused: true,
    currentTime: 0,
    playCalls: 0,
    addEventListener() {},
    removeEventListener() {},
    play() { this.paused = false; this.playCalls += 1; return Promise.resolve(); },
    pause() { this.paused = true; },
  };
  const alignmentReady = new Promise((resolve) => { releaseAlignment = resolve; });
  const speech = createLocalAudioSpeechController({ manifest, createAudio: () => audio });
  assert.equal(speech.speak(CV_SHOW_STORY.scenes[0].speech, {
    id: 'positioning',
    lang: 'ru',
    onMedia: () => alignmentReady,
  }), true);
  speech.pause();
  releaseAlignment(Object.freeze({ status: 'completed', reason: 'alignment-ready' }));
  await alignmentReady;
  await Promise.resolve();
  await Promise.resolve();
  assert.equal(audio.playCalls, 0, 'a pause revokes the unresolved automatic play intent');
  assert.equal(speech.snapshot.paused, true);
  assert.equal(speech.resume(), true);
  await Promise.resolve();
  assert.equal(audio.playCalls, 1, 'trusted Resume creates a new play attempt');
});

test('local audio publishes physical start only after play settles', async () => {
  let manifest = await validatedWebAudioManifest();
  let resolvePlay;
  const playReady = new Promise((resolve) => { resolvePlay = resolve; });
  const started = [];
  let audio = {
    paused: true,
    currentTime: 0,
    addEventListener() {},
    removeEventListener() {},
    play() { this.paused = false; return playReady; },
    pause() { this.paused = true; },
  };
  const speech = createLocalAudioSpeechController({ manifest, createAudio: () => audio });
  assert.equal(speech.speak(CV_SHOW_STORY.scenes[0].speech, {
    id: 'positioning',
    lang: 'ru',
    onMedia: () => Object.freeze({ status: 'completed', reason: 'alignment-ready' }),
    onStart: () => started.push('playing'),
  }), true);
  await Promise.resolve();
  assert.deepEqual(started, [], 'play request acceptance is not a physical playback receipt');
  resolvePlay();
  await playReady;
  await Promise.resolve();
  assert.deepEqual(started, ['playing']);
});

test('local audio retains aligned media when autoplay is blocked and resumes after a gesture', async () => {
  let manifest = await validatedWebAudioManifest();
  let blocked = [];
  let started = [];
  let sourceReleased = false;
  let playCalls = 0;
  let audio = {
    paused: true,
    currentTime: 1.25,
    addEventListener() {},
    removeEventListener() {},
    play() {
      playCalls += 1;
      if (playCalls === 1) return Promise.reject(new DOMException('Gesture required', 'NotAllowedError'));
      this.paused = false;
      return Promise.resolve();
    },
    pause() { this.paused = true; },
    removeAttribute(name) { if (name === 'src') sourceReleased = true; },
  };
  const speech = createLocalAudioSpeechController({ manifest, createAudio: () => audio });
  assert.equal(speech.speak(CV_SHOW_STORY.scenes[0].speech, {
    id: 'positioning',
    lang: 'ru',
    onMedia: () => Object.freeze({ status: 'completed', reason: 'alignment-ready' }),
    onBlocked: (reason) => blocked.push(reason),
    onStart: () => started.push('playing'),
  }), true);
  await Promise.resolve();
  await Promise.resolve();
  await Promise.resolve();
  assert.deepEqual(blocked, ['autoplay-blocked']);
  assert.deepEqual(started, [], 'a rejected play attempt cannot publish a physical start');
  assert.equal(speech.snapshot.activeId, 'positioning');
  assert.equal(speech.snapshot.playBlocked, true);
  assert.equal(sourceReleased, false, 'policy blocking must retain the prepared media source');
  assert.equal(speech.resume(), true);
  await Promise.resolve();
  assert.equal(playCalls, 2);
  assert.deepEqual(started, ['playing']);
  assert.equal(speech.snapshot.playBlocked, false);
  assert.equal(speech.snapshot.lastError, '');
});

test('local audio rejects failed or cancelled media generations without playing', async () => {
  let manifest = await validatedWebAudioManifest();
  for (const status of ['failed', 'cancelled']) {
    let errors = [];
    let audio = {
      paused: true,
      playCalls: 0,
      addEventListener() {},
      removeEventListener() {},
      play() { this.playCalls += 1; return Promise.resolve(); },
      pause() { this.paused = true; },
      removeAttribute() {},
    };
    const receipt = Object.freeze({ status, reason: `test-${status}`, generation: 4 });
    const speech = createLocalAudioSpeechController({ manifest, createAudio: () => audio });
    assert.equal(speech.speak(CV_SHOW_STORY.scenes[0].speech, {
      id: 'positioning',
      lang: 'ru',
      onMedia: () => receipt,
      onError: (message, terminalReceipt) => errors.push({ message, terminalReceipt }),
    }), true);
    await Promise.resolve();
    await Promise.resolve();
    assert.equal(audio.playCalls, 0);
    assert.equal(speech.snapshot.activeId, '');
    assert.equal(errors.length, 1);
    assert.equal(errors[0].terminalReceipt, receipt);
    assert.match(errors[0].message, new RegExp(`aligned-media-${status}-test-${status}`));
  }
});

test('local audio keeps only one next clip without preloading media and cancels the active source on stop', async () => {
  let manifest = await validatedWebAudioManifest();
  const audios = [];
  const createAudio = () => {
    const audio = {
      paused: true,
      currentTime: 0,
      loadCalls: 0,
      pause() { this.paused = true; },
      play() { this.paused = false; return Promise.resolve(); },
      load() { this.loadCalls += 1; },
      addEventListener() {},
      removeEventListener() {},
      removeAttribute(name) { if (name === 'src') this.src = ''; },
    };
    audios.push(audio);
    return audio;
  };
  const speech = createLocalAudioSpeechController({ manifest, createAudio });
  assert.equal(speech.prefetch('symbiote-workspace'), true);
  assert.equal(speech.snapshot.prefetchedId, 'symbiote-workspace');
  assert.equal(speech.prefetch('symbiote-ui'), true);
  assert.equal(audios.length, 0, 'bounded prefetch must not create or load media');
  assert.equal(speech.snapshot.prefetchedId, 'symbiote-ui');
  speech.transition('symbiote-ui');
  assert.equal(speech.snapshot.prefetchedId, 'symbiote-ui');
  assert.equal(speech.speak(CV_SHOW_STORY.scenes[2].speech, {
    id: 'symbiote-ui',
    lang: 'ru',
    onMedia: (audio, clip) => {
      audio.src = clip.audioUrl;
      return Object.freeze({ status: 'completed', reason: 'alignment-ready' });
    },
  }), true);
  await Promise.resolve();
  assert.equal(audios.length, 1, 'media is created only when the selected clip starts');
  assert.equal(speech.snapshot.activeId, 'symbiote-ui');
  speech.cancel();
  assert.equal(audios[0].src, '', 'Stop must remove the provider-owned active media source');
  assert.equal(speech.snapshot.activeId, '');
  assert.equal(speech.snapshot.prefetchedId, '');
});

test('shared audio arbiter pauses local narration before media and requires a fresh speech lease to resume', async () => {
  let speechPauses = 0;
  let speechStops = 0;
  let mediaStops = 0;
  const arbiter = new ShowAudioArbiter();
  const firstSpeech = await arbiter.acquire({
    id: 'cv-show-speech-positioning',
    kind: 'speech',
    pause: () => { speechPauses += 1; },
    stop: () => { speechStops += 1; },
  });
  const media = await arbiter.acquire({
    id: 'cv-show-media-demo',
    kind: 'media',
    stop: () => { mediaStops += 1; },
  });
  assert.equal(speechPauses, 1);
  assert.equal(speechStops, 0);
  assert.deepEqual(arbiter.snapshot, { id: 'cv-show-media-demo', kind: 'media', tokenId: media.id });
  assert.equal(await arbiter.release(firstSpeech), false);
  assert.equal(await arbiter.release(media), true);
  assert.equal(mediaStops, 1);

  const resumedSpeech = await arbiter.acquire({
    id: 'cv-show-speech-positioning',
    kind: 'speech',
    pause: () => { speechPauses += 1; },
  });
  assert.notEqual(resumedSpeech.id, firstSpeech.id);
  assert.deepEqual(arbiter.snapshot, {
    id: 'cv-show-speech-positioning',
    kind: 'speech',
    tokenId: resumedSpeech.id,
  });
});

test('narration controller uses local RU files and falls back to browser speech on locale mismatch', async () => {
  let { appConfig, raw } = createWebAudioHarness();
  clearCvShowWebAudioReleaseCache();
  let browserCalls = [];
  const browserSpeech = {
    available: true,
    speak(text, options) { browserCalls.push([text, options.lang]); return true; },
    pause() {},
    resume() { return true; },
    cancel() {},
  };
  let localAudio;
  const narration = createCvShowNarrationController({
    browserSpeech,
    url: 'https://portfolio.example/cv/?showAudio=local',
    baseUrl: 'https://portfolio.example/cv/',
    appConfig,
    fetchImpl: async () => new Response(raw),
    createAudio: () => {
      localAudio = {
        paused: true,
        currentTime: 0,
        addEventListener() {},
        removeEventListener() {},
        play() { this.paused = false; return Promise.resolve(); },
        pause() { this.paused = true; },
        removeAttribute(name) { if (name === 'src') this.src = ''; },
        load() {},
      };
      return localAudio;
    },
  });
  assert.equal((await narration.prepare(CV_SHOW_STORY)).source, 'local');
  assert.equal(narration.speak(CV_SHOW_STORY.scenes[0].speech, {
    id: 'positioning',
    lang: 'ru',
    onMedia: (audio, clip) => {
      audio.src = clip.audioUrl;
      return Object.freeze({ status: 'completed', reason: 'alignment-ready' });
    },
  }), true);
  await Promise.resolve();
  assert.match(localAudio.src, /01-short-positioning-[a-f0-9]{12}\.opus$/u);
  assert.deepEqual(browserCalls, []);
  assert.equal(narration.speak(CV_SHOW_STORY.scenes[0].speech, { id: 'positioning', lang: 'en' }), true);
  assert.deepEqual(browserCalls, [[CV_SHOW_STORY.scenes[0].speech, 'en']]);

  let nonRuFetches = 0;
  const nonRuNarration = createCvShowNarrationController({
    browserSpeech,
    url: 'https://portfolio.example/cv/?lang=en&showAudio=local',
    baseUrl: 'https://portfolio.example/cv/',
    appConfig: { ...appConfig, locale: 'en' },
    fetchImpl: async () => {
      nonRuFetches += 1;
      return new Response(raw);
    },
  });
  assert.equal((await nonRuNarration.prepare(CV_SHOW_STORY)).source, 'browser');
  assert.equal(nonRuFetches, 0, 'non-RU pages must not request the selected RU release');
});

test('Show integration is lazy, semantic, provider-backed, and chat-owned', async () => {
  const [logic, runtime, adapter, mockProvider, narration, main] = await Promise.all([
    readFile(new URL('../../src/ui-components/client-only/tour-player/tour-player.js', import.meta.url), 'utf8'),
    readFile(new URL('../../src/static-pages/js/tour-player/index.js', import.meta.url), 'utf8'),
    readFile(new URL('../../src/static-pages/js/tour-player/showAdapter.js', import.meta.url), 'utf8'),
    readFile(new URL('../../src/static-pages/js/tour-player/mockAgentProvider.js', import.meta.url), 'utf8'),
    readFile(new URL('../../src/static-pages/js/tour-player/localNarration.js', import.meta.url), 'utf8'),
    readFile(new URL('../../src/static-pages/js/index.js', import.meta.url), 'utf8'),
  ]);
  assert.doesNotMatch(`${logic}\n${runtime}`, /onboundary|voiceschanged|triggerWord|querySelector\(directive\.target/);
  assert.doesNotMatch(logic, /history\.(?:pushState|replaceState)/, 'the reusable player remains URL-agnostic');
  assert.match(runtime, /serializeCvShowRoute/);
  assert.match(runtime, /history\[push \? 'pushState' : 'replaceState'\]/);
  assert.match(
    runtime,
    /const onPopState = \(\) => \{[\s\S]*?cancelPendingRouteWrite\(\);[\s\S]*?applyLocationRoute/u,
  );
  assert.match(logic, /async applyShowRoute\(/);
  assert.doesNotMatch(main, /intent: 'cv-show'/, 'the obsolete viewer-toolbar launch action stays removed');
  assert.match(main, /show\.openPresentation/);
  assert.match(main, /getCvShowStartHref\(\)/);
  assert.match(`${logic}\n${runtime}\n${adapter}`, /symbiote-ui\/chat\/show-runtime/);
  assert.match(logic, /ShowSessionState/);
  assert.match(runtime, /ShowAttentionController/);
  assert.doesNotMatch(runtime, /function createNativeSelection/);
  assert.match(logic, /createCvShowMessageStream/);
  assert.match(
    logic,
    /const acknowledgement = await this\.#appendAgentMessage[\s\S]*?acknowledgement\?\.status !== 'completed'[\s\S]*?this\.#presentScene\(\{/u,
  );
  assert.match(logic, /wasRunning && !completed && this\.isConnected/u);
  assert.match(logic, /payload: \{ intent: 'show-mode' \},\s*\}, \{ stream: false \}\)/u);
  assert.match(runtime, /ShowAudioArbiter/);
  assert.match(runtime, /ShowMediaController/);
  assert.match(runtime, /portfolio-show-runtime-error/);
  assert.match(runtime, /runtimeCleanup\.stopAndRelease\('show-terminal'/);
  assert.match(runtime, /runtimeCleanup\.skip\(\{ operation: 'media-skip' \}\)/);
  assert.match(runtime, /runtimeCleanup\.stopAndRelease\('tour-disposed'/);
  assert.doesNotMatch(runtime, /\bmedia\.(?:stop|skip)\(/);
  assert.doesNotMatch(runtime, /\baudioArbiter\.release\(/);
  assert.match(runtime, /monitorMeaningfulShowInteractions/);
  assert.match(logic, /portfolio-show-pause/);
  assert.match(logic, /portfolio-show-resume/);
  assert.match(
    logic,
    /#clearSystemErrors\(\) \{[\s\S]*?part\.type !== 'error'[\s\S]*?this\.#syncMessages\(\);[\s\S]*?\n  \}/u,
    'successful recovery removes obsolete speech error cards from the retained chat history',
  );
  assert.match(
    logic,
    /#presentScene\([\s\S]*?this\.\$\.errorText = '';\s*this\.#clearSystemErrors\(\);/u,
    'presenting a valid scene clears errors left by an earlier failed scene',
  );
  assert.match(
    logic,
    /const accepted = [\s\S]*?if \(accepted === false\)[\s\S]*?else \{\s*this\.\$\.isError = false;\s*this\.\$\.errorText = '';\s*this\.#clearSystemErrors\(\);/u,
    'an accepted resume clears the obsolete error state before playback continues',
  );
  assert.match(
    logic,
    /const completedCheckpoint = this\.#lastAlignedGenerationReceipt\?\.presentationComplete === true;[\s\S]*?if \(alignedRuntime && \(resumeAdmittedPresentation \|\| completedCheckpoint\)\)[\s\S]*?this\.#presentationAdmitted = true;/u,
    'Resume at an exact scene-end checkpoint admits the logical start so the scene can advance',
  );
  assert.match(
    logic,
    /release\?\.\(\{ \.\.\.activeToken, reason: 'paused' \}\)/,
    'autoplay fallback releases the audio lease without cancelling resumable media',
  );
  assert.match(adapter, /createShowActionLifecycle/);
  assert.match(runtime, /cursor\.dispose\(\)/);
  assert.ok(
    logic.indexOf("this.#syncPlayer(completed ? 'completed' : 'stopped')")
      < logic.indexOf("completed ? 'portfolio-show-complete' : 'portfolio-show-stop'"),
    'terminal cleanup event must run after the shared player finishes its terminal redraw',
  );
  assert.match(logic, /symbiote-ui\/chat\/show-chat/);
  assert.match(mockProvider, /createScriptedAgentProvider/);
  assert.doesNotMatch(logic, /symbiote-ui\/ui/);
  assert.match(logic, /createCvShowNarrationController/);
  assert.match(logic, /loadAndRestorePlayback/);
  assert.doesNotMatch(narration, /audio\.src\s*=|audio\.load\(|audio\.currentTime\s*=/);
  assert.match(logic, /extends HTMLElement/);
  assert.match(runtime, /agent-dock-shell/);
  assert.doesNotMatch(runtime, /registerPanelType\('portfolio-tour'/);
  assert.doesNotMatch(logic, /createElement\('agent-show-chat'\)/);
  assert.doesNotMatch(logic, /agent\.style\.|this\.style\./);
  assert.doesNotMatch(logic, /<chat-workspace|<sn-transport|show-transcript|show-message-actions|show-branch-controls|show-controls/);
  assert.doesNotMatch(logic, /type: 'embed', key: 'short'/);
  assert.match(logic, /setVoiceControls/);
  assert.match(logic, /input: \{ visible: true, enabled: true, state: 'idle' \}/);
  assert.match(logic, /removeShow\?\.\('short', \{ stop: false \}\)/);
  assert.match(logic, /!this\.#mode/);
  assert.match(logic, /autoplay: false/);
  assert.match(logic, /actionId === 'start-short'/);
  assert.match(logic, /actionId === 'start-full'/);
  assert.match(logic, /nextView\.identity\.snapshot === this\.#authoringView\?\.identity\?\.snapshot/u);
  assert.match(logic, /!this\.#authoringView\.mediaRegistry\.entries\[id\]\?\.playable/u);
  assert.ok(
    logic.indexOf('unavailableEntryIds.length') < logic.indexOf('this.#mountSharedShow()'),
    'a non-playable live media view must be rejected before the shared Show mounts',
  );
  assert.match(logic, /this\.#alignedEntry\?\.runtime\?\.presentationPositionMs/u);
  const alignedDurationBindingAt = logic.indexOf(
    'this.#projectDurationMsByEntry.set(',
    logic.indexOf('async #attachAlignedEntry'),
  );
  const alignedDurationBinding = logic.slice(alignedDurationBindingAt, alignedDurationBindingAt + 500);
  assert.match(
    alignedDurationBinding,
    /this\.#showPlayer\?\.bind\?\.\(this\.#showConfig\(\)\);\s*this\.#syncPlayer\(\);/u,
    'an aligned Project duration must redraw the clock even when completed media is not loaded',
  );
  assert.doesNotMatch(logic, /semantics: 'pointer-only'/);
  assert.match(
    logic,
    /#returnFromDetails\(\) \{[\s\S]*?this\.#continueShortAfterDetails\(this\.#requestId, \{\s*interrupt: true,\s*startPaused: this\.\$\.isPaused,\s*\}\);/u,
    'returning from details must replace the Short segment and continue with the previous pause state',
  );
  assert.match(logic, /partitionCvShowAlignedDirectives\(entry\.directives\)/);
  assert.match(
    logic,
    /const startUnalignedPresentation = this\.#alignment\.available \? null : async \(\) => \{[\s\S]*?this\.#runSceneSetup\(entry, requestId\)[\s\S]*?onPhysicalStart: startUnalignedPresentation/u,
    'unaligned setup is admitted only from the physical narration-start callback',
  );
  assert.match(
    logic,
    /const deferPresentationUntilPlayback = !this\.#presentationAdmitted\s*&& !restorePausedCheckpoint/u,
  );
  assert.match(logic, /restorePausedCheckpoint,/u);
  assert.match(
    logic,
    /reason: restorePausedCheckpoint\s*\? 'paused-checkpoint'\s*: positionMs > 0 \? 'branch-return' : 'alignment-ready'/u,
    'a static checkpoint must not publish the destructive branch-return reset reason',
  );
  assert.match(logic, /requireCvShowSceneSetupSuccess\(sceneSetupReceipt, entry\.id\)/);
  assert.match(logic, /#alignedEntry\?\.media\?\.currentTime/);
  assert.match(logic, /addEventListener\?\.\('timeupdate'/);
  assert.match(logic, /removeEventListener\?\.\('timeupdate'/);
  assert.match(logic, /portfolio-show-before-advance/);
  assert.match(logic, /this\.#advanceAfterAttention\(requestId\)/);
  assert.match(runtime, /portfolio-show-presentation-operation/);
  assert.match(runtime, /runCvShowPresentationOperation/);
  assert.match(
    runtime,
    /const onSeek = \(\) => \{\s*if \(!running && !presenter\) return;\s*ensurePresenterLifecycle\(\)\.runner\.seek\(\);\s*\};[\s\S]*?addEventListener\('portfolio-show-seek', onSeek\)/u,
    'a pre-start seek cannot instantiate a presenter; a restored or admitted seek resets its generation',
  );
  assert.match(
    runtime,
    /if \(\s*!running\s*&& event\.detail\?\.restorePausedCheckpoint !== true\s*&& getChat\(\)\?\.\$\.isRunning !== true\s*\) return;/u,
    'a route-prepared chat or an explicit paused checkpoint may admit setup before physical media starts',
  );
  assert.match(
    runtime,
    /if \(\s*reason === 'initial'\s*\|\| reason === 'alignment-ready'\s*\|\| reason === 'paused-checkpoint'\s*\|\| reason === 'presentation-preroll-normalization'\s*\) return;[\s\S]*?reason === 'branch-return'[\s\S]*?reason\.includes\('seek'\)/u,
    'caption-clock initialization must not cancel an active admitted setup operation',
  );
  assert.match(logic, /portfolio-show-presentation-receipt/);
  assert.match(logic, /lastExecutionReceipt/);
  assert.doesNotMatch(logic, /portfolio-show-aligned-cue|lastCueId|lastCueTimeMs|lastAlignmentSource/u);
  assert.doesNotMatch(runtime, /createCvShowAttentionBarrierQueue|\.enqueue\(|\btail\b/u);
  assert.match(logic, /payload\?\.branchId/);
  assert.doesNotMatch(logic, /payload\?\.current/);
  assert.doesNotMatch(logic, /createElement\(['"](?:li|button)['"]\)/);
  assert.doesNotMatch(`${logic}\n${runtime}`, /<tour-player|portfolio-tour-phase|createTourActionRunner|createTourCompletionGate/);
  assert.match(main, /import\('symbiote-ui\/chat\/workspace'\)/);
  assert.match(main, /createRuntimeAssetUrl\('js\/tour-player\/index\.js'\)/);
  assert.match(main, /dock\?\.querySelector\('\.portfolio-layout'\)/);
  assert.ok(
    main.indexOf("import('symbiote-ui/layout/panel-layout')")
      < main.indexOf("createRuntimeAssetUrl('js/tour-player/index.js')"),
    'the main panel layout must register before the independently built Show entrypoint loads',
  );
  assert.doesNotMatch(main, /client-only\/tour-player\/tour-player\.js/);
});

test('Show captions keep canonical Whisper timing and non-actionable video controls stay hidden', async (t) => {
  const { parseHTML } = await import('linkedom');
  const { window } = parseHTML('<!doctype html><html lang="ru"><body></body></html>');
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
  ];
  const previousGlobals = new Map(globalKeys.map((key) => (
    [key, Object.getOwnPropertyDescriptor(globalThis, key)]
  )));
  for (const key of globalKeys.slice(0, -2)) globalThis[key] = window[key];
  globalThis.CSSStyleSheet = class CSSStyleSheet {
    replaceSync() {}
  };
  globalThis.location = new URL('https://portfolio.example/cv/');
  t.after(() => {
    for (const [key, descriptor] of previousGlobals) {
      if (descriptor) Object.defineProperty(globalThis, key, descriptor);
      else delete globalThis[key];
    }
  });

  const {
    createCvShowCanonicalCaption,
    createCvShowVideoControls,
    resolveCvShowPlayerEntry,
  } = await import(
    '../../src/ui-components/client-only/tour-player/tour-player.js?canonical-caption-unit-test'
  );
  const caption = createCvShowCanonicalCaption(
    'На PhotoPizza мы снимали предметы.',
    [
      { text: 'На', startMs: 0, endMs: 180 },
      { text: 'фотоэтица', startMs: 200, endMs: 620 },
      { text: 'мы', startMs: 640, endMs: 780 },
      { text: 'снимали', startMs: 800, endMs: 1_080 },
      { text: 'предметы', startMs: 1_100, endMs: 1_420 },
    ],
    360,
  );

  assert.equal(caption.text, 'На PhotoPizza мы снимали предметы.');
  assert.deepEqual(caption.words.map(({ text }) => text), [
    'На',
    'PhotoPizza',
    'мы',
    'снимали',
    'предметы.',
  ]);
  assert.equal(caption.activeWordIndex, 1);
  assert.equal(caption.words[1].startMs, 200);
  assert.equal(caption.words[1].endMs, 620);
  assert.equal(caption.words.some(({ text }) => text.includes('фотоэтица')), false);

  const controls = createCvShowVideoControls([
    { id: 'autobox.video-01', type: 'media', mode: 'short-muted-montage' },
    { id: 'autobox.video-02', type: 'media', mode: 'short-muted-montage' },
    { id: 'autobox.video-03', type: 'media', mode: 'short-muted-montage' },
    { id: 'autobox.full-video', type: 'media', mode: 'full-with-media-audio' },
  ], (key) => key);
  assert.deepEqual(controls, []);

  const branchEntry = {
    id: 'autobox-details',
    directives: [{
      id: 'autobox.full-video',
      type: 'media',
      mode: 'full-with-media-audio',
    }],
  };
  assert.equal(resolveCvShowPlayerEntry({
    inBranch: true,
    activeBranchEntry: branchEntry,
    currentEntry: { id: 'autobox' },
  }), branchEntry, 'detail controls resolve from the active branch before speech starts');
});

test('trusted document interaction pauses the Show without destructively clearing presenter attention', async () => {
  const runtime = await readFile(new URL(
    '../../src/static-pages/js/tour-player/index.js',
    import.meta.url,
  ), 'utf8');
  const monitor = runtime.match(
    /const interactionMonitor = monitorMeaningfulShowInteractions\(document, \{[\s\S]*?pause: \(\) => \{(?<body>[\s\S]*?)\n    \},\n  \}\);/u,
  );

  assert.ok(monitor?.groups?.body, 'document interaction pause callback');
  assert.match(monitor.groups.body, /getChat\(\)\?\.pauseShow\?\.\('meaningful-interaction'\)/u);
  assert.doesNotMatch(
    monitor.groups.body,
    /meaningfulInteraction|clearMarkers|clearTransient/u,
    'Pause must retain the active marker/frame/selection and presenter cursor pair',
  );
});

test('terminal narration errors keep the player controllable: Play repeats the step', async (t) => {
  const { parseHTML } = await import('linkedom');
  const { window } = parseHTML('<!doctype html><html lang="en"><body></body></html>');
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
    'speechSynthesis',
    'SpeechSynthesisUtterance',
  ];
  const previousGlobals = new Map(globalKeys.map((key) => (
    [key, Object.getOwnPropertyDescriptor(globalThis, key)]
  )));
  for (const key of globalKeys.slice(0, -4)) globalThis[key] = window[key];
  globalThis.CSSStyleSheet = class CSSStyleSheet {
    replaceSync() {}
  };
  globalThis.location = new URL('https://portfolio.example/cv/');
  const spoken = [];
  globalThis.speechSynthesis = {
    paused: false,
    cancel() {},
    pause() { this.paused = true; },
    resume() { this.paused = false; },
    speak(utterance) {
      spoken.push(utterance);
      queueMicrotask(() => utterance.onerror?.({ error: 'speech-error' }));
    },
  };
  globalThis.SpeechSynthesisUtterance = class SpeechSynthesisUtterance {
    constructor(text) { this.text = text; }
  };

  const dock = document.createElement('div');
  const showPlayer = {
    configs: [],
    bind(config) { this.configs.push(config); },
  };
  t.after(() => {
    dock.remove();
    for (const [key, descriptor] of previousGlobals) {
      if (descriptor) Object.defineProperty(globalThis, key, descriptor);
      else delete globalThis[key];
    }
  });
  dock.setAgentProvider = () => {};
  dock.setMessages = () => {};
  dock.getChat = () => null;
  dock.setShow = (_key, config) => {
    showPlayer.configs.push(config);
    return showPlayer;
  };
  dock.removeShow = () => {};
  const { PortfolioShowChat } = await import(
    '../../src/ui-components/client-only/tour-player/tour-player.js?terminal-error-repeat-test'
  );
  const player = new PortfolioShowChat();
  player.agentDock = dock;
  player.addEventListener('portfolio-show-phase', (event) => {
    if (typeof event.detail?.complete !== 'function') return;
    event.detail.handled = true;
    event.detail.complete(Object.freeze({
      status: 'success',
      receipts: Object.freeze([Object.freeze({
        status: 'success',
        result: Object.freeze({ status: 'completed' }),
      })]),
    }));
  });
  dock.append(player);
  document.body.append(dock);

  assert.equal(await player.applyShowRoute({
    mode: 'short',
    entryId: 'positioning',
    timeMs: 0,
    play: false,
  }), true);

  const messageCount = () => dock.textContent.length;
  const baseline = messageCount();
  showPlayer.configs.at(-1).controller.play();
  const deadline = Date.now() + 15_000;
  while (!player.$.isError && Date.now() < deadline) {
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  assert.equal(player.$.isError, true, 'the terminal narration error latches after bounded retries');
  assert.equal(player.$.isPaused, true, 'the fatal error pauses the show');
  assert.ok(messageCount() >= baseline, 'the fatal error message is published');

  const retryMessages = dock.textContent;
  const utterancesAfterLatch = spoken.length;
  showPlayer.configs.at(-1).controller.play();
  const repeatDeadline = Date.now() + 3_000;
  while (spoken.length <= utterancesAfterLatch && Date.now() < repeatDeadline) {
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  assert.equal(player.$.isError, false, 'Play clears the latched error by repeating the step');
  assert.ok(spoken.length > utterancesAfterLatch, 'Play re-queues narration for the same step');
  assert.ok(dock.textContent.length >= retryMessages.length, 'the repeated step appends its own message');
  assert.equal(player.$.isRunning, true);
  assert.equal(player.$.isPaused, false);
  player.stopShow();
});

test('hiding the page pauses the show instead of burning cell deadlines', async (t) => {
  const { parseHTML } = await import('linkedom');
  const { window } = parseHTML('<!doctype html><html lang="en"><body></body></html>');
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
    'speechSynthesis',
    'SpeechSynthesisUtterance',
  ];
  const previousGlobals = new Map(globalKeys.map((key) => (
    [key, Object.getOwnPropertyDescriptor(globalThis, key)]
  )));
  for (const key of globalKeys.slice(0, -4)) globalThis[key] = window[key];
  globalThis.CSSStyleSheet = class CSSStyleSheet {
    replaceSync() {}
  };
  globalThis.location = new URL('https://portfolio.example/cv/');
  globalThis.speechSynthesis = {
    paused: false,
    cancel() {},
    pause() { this.paused = true; },
    resume() { this.paused = false; },
    speak() {},
  };
  globalThis.SpeechSynthesisUtterance = class SpeechSynthesisUtterance {
    constructor(text) { this.text = text; }
  };

  const dock = document.createElement('div');
  t.after(() => {
    dock.remove();
    for (const [key, descriptor] of previousGlobals) {
      if (descriptor) Object.defineProperty(globalThis, key, descriptor);
      else delete globalThis[key];
    }
  });
  dock.setAgentProvider = () => {};
  dock.setMessages = () => {};
  dock.getChat = () => null;
  dock.setShow = () => ({ bind() {}, setState() {} });
  dock.removeShow = () => {};
  const { PortfolioShowChat } = await import(
    '../../src/ui-components/client-only/tour-player/tour-player.js?visibility-pause-test'
  );
  const player = new PortfolioShowChat();
  player.agentDock = dock;
  player.addEventListener('portfolio-show-phase', (event) => {
    if (typeof event.detail?.complete !== 'function') return;
    event.detail.handled = true;
    event.detail.complete(Object.freeze({
      status: 'success',
      receipts: Object.freeze([Object.freeze({
        status: 'success',
        result: Object.freeze({ status: 'completed' }),
      })]),
    }));
  });
  dock.append(player);
  document.body.append(dock);

  assert.equal(await player.applyShowRoute({
    mode: 'short',
    entryId: 'positioning',
    timeMs: 0,
    play: true,
  }), true);
  assert.equal(player.$.isRunning, true);
  assert.equal(player.$.isPaused, false);

  Object.defineProperty(document, 'visibilityState', {
    configurable: true,
    get: () => 'hidden',
  });
  document.dispatchEvent(new Event('visibilitychange'));
  assert.equal(player.$.isPaused, true, 'hiding the page pauses the show');
  assert.equal(player.$.isRunning, true);
  assert.equal(player.$.isError, false);
  assert.equal(player.$.errorText, '');

  Object.defineProperty(document, 'visibilityState', {
    configurable: true,
    get: () => 'visible',
  });
  document.dispatchEvent(new Event('visibilitychange'));
  assert.equal(player.$.isPaused, true, 'becoming visible again keeps the paused state');
  player.stopShow();
});

test('a replaced Short segment stays the selected detail on manual Next, natural end, and seek', async (t) => {
  const { parseHTML } = await import('linkedom');
  const { window } = parseHTML('<!doctype html><html lang="en"><body></body></html>');
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
    'speechSynthesis',
    'SpeechSynthesisUtterance',
  ];
  const previousGlobals = new Map(globalKeys.map((key) => (
    [key, Object.getOwnPropertyDescriptor(globalThis, key)]
  )));
  for (const key of globalKeys.slice(0, -4)) globalThis[key] = window[key];
  globalThis.CSSStyleSheet = class CSSStyleSheet {
    replaceSync() {}
  };
  globalThis.location = new URL('https://portfolio.example/cv/');
  const spoken = [];
  globalThis.speechSynthesis = {
    paused: false,
    cancel() {},
    pause() { this.paused = true; },
    resume() { this.paused = false; },
    speak(utterance) { spoken.push(utterance); },
  };
  globalThis.SpeechSynthesisUtterance = class SpeechSynthesisUtterance {
    constructor(text) { this.text = text; }
  };

  const dock = document.createElement('div');
  const showPlayer = {
    configs: [],
    states: [],
    bind(config) { this.configs.push(config); },
    setState(state) { this.states.push(state); },
  };
  t.after(() => {
    dock.remove();
    for (const [key, descriptor] of previousGlobals) {
      if (descriptor) Object.defineProperty(globalThis, key, descriptor);
      else delete globalThis[key];
    }
  });
  dock.setAgentProvider = () => {};
  dock.setMessages = () => {};
  dock.getChat = () => null;
  dock.setShow = (_key, config) => {
    showPlayer.configs.push(config);
    return showPlayer;
  };
  dock.removeShow = () => {};
  const { PortfolioShowChat } = await import(
    '../../src/ui-components/client-only/tour-player/tour-player.js?replaced-segment-flow-test'
  );
  const player = new PortfolioShowChat();
  player.agentDock = dock;
  player.addEventListener('portfolio-show-phase', (event) => {
    if (typeof event.detail?.complete !== 'function') return;
    event.detail.handled = true;
    event.detail.complete(Object.freeze({
      status: 'success',
      receipts: Object.freeze([Object.freeze({
        status: 'success',
        result: Object.freeze({ status: 'completed' }),
      })]),
    }));
  });
  dock.append(player);
  document.body.append(dock);

  const wait = (ms = 0) => new Promise((resolve) => setTimeout(resolve, ms));
  const currentConfig = () => showPlayer.configs.at(-1);
  const openDetails = (branchId, sceneId) => {
    dock.dispatchEvent(new CustomEvent('agent-show-action', {
      detail: {
        id: `${sceneId}.actions`,
        actionId: 'details',
        payload: { branchId, sceneId },
      },
    }));
  };

  assert.equal(await player.applyShowRoute({
    mode: 'short',
    entryId: 'symbiote-workspace',
    timeMs: 0,
    play: true,
  }), true);
  await wait(10);
  spoken.at(-1)?.onstart?.();
  await wait(10);
  assert.equal(player.$.inBranch, false);
  assert.equal(currentConfig().state.index, 1, 'the Short tour starts on the workspace segment');

  openDetails('workspace-details', 'symbiote-workspace');
  await wait(30);
  assert.equal(player.$.inBranch, true, 'current-segment details replace the Short recording');
  assert.deepEqual(player.routeSnapshot, {
    mode: 'short',
    entryId: 'symbiote-workspace',
    detailId: 'workspace-details',
    timeMs: 0,
    play: true,
    running: true,
    completed: false,
  });
  const detailSpeech = String(spoken.at(-1)?.text || '');
  assert.equal(detailSpeech, CV_SHOW_STORY.branches['workspace-details'].speech);

  spoken.at(-1)?.onend?.();
  await wait(50);
  assert.equal(player.$.inBranch, false, 'the natural end of the replacement detail continues Short');
  assert.equal(currentConfig().state.index, 2, 'the next segment after the replacement is the following Short');
  assert.deepEqual(player.routeSnapshot.entryId, 'symbiote-ui');

  currentConfig().controller.seek(1, 2_000);
  await wait(50);
  assert.equal(player.$.inBranch, true, 'seek into the replaced segment reopens the selected detail');
  assert.equal(player.routeSnapshot.detailId, 'workspace-details');
  assert.equal(player.routeSnapshot.entryId, 'symbiote-workspace');
  assert.equal(player.routeSnapshot.timeMs, 2_000, 'the seek position belongs to the detail recording');
  assert.equal(String(spoken.at(-1)?.text || ''), detailSpeech, 'seek plays the detail, not the Short clip');

  currentConfig().controller.pause();
  await wait(10);
  assert.equal(player.$.isPaused, true, 'the detail can be paused');
  currentConfig().controller.next();
  await wait(50);
  assert.equal(player.$.inBranch, false);
  assert.equal(player.$.isPaused, true, 'manual Next from a paused detail opens the next Short paused');
  assert.equal(currentConfig().state.index, 2);
  assert.equal(player.$.resumeRequired, true);

  currentConfig().controller.play();
  await wait(10);
  spoken.at(-1)?.onstart?.();
  await wait(10);
  assert.equal(player.$.isPaused, false, 'resume continues the next Short');

  // Manual Next while the replacement detail is playing continues into the
  // next Short without a pause, matching the previous playback intent.
  currentConfig().controller.seek(1, 500);
  await wait(50);
  assert.equal(player.$.inBranch, true);
  const utterancesBeforePlayingNext = spoken.length;
  currentConfig().controller.next();
  await wait(50);
  assert.equal(player.$.inBranch, false);
  assert.equal(player.$.isPaused, false, 'Next from a playing detail continues playing the next Short');
  assert.equal(currentConfig().state.index, 2);
  assert.ok(spoken.length > utterancesBeforePlayingNext, 'the next Short starts speaking after playing Next');

  // Seek back into the replaced segment, then rewind while the detail is
  // already active: the player stays inside the branch and only repositions
  // the detail recording; its natural end then advances to the next Short.
  currentConfig().controller.seek(1, 2_000);
  await wait(50);
  assert.equal(player.$.inBranch, true);
  assert.equal(player.routeSnapshot.detailId, 'workspace-details');
  const rewoundDetailSpeechIndex = spoken.length;
  currentConfig().controller.seek(1, 4_000);
  await wait(50);
  assert.equal(player.$.inBranch, true, 'seek inside the active replacement detail stays in the detail');
  assert.equal(player.routeSnapshot.detailId, 'workspace-details');
  assert.equal(player.routeSnapshot.entryId, 'symbiote-workspace');
  assert.equal(player.routeSnapshot.timeMs, 4_000, 'the rewound position belongs to the detail recording');
  assert.equal(player.$.isPaused, false, 'rewinding a playing detail keeps it playing');
  assert.ok(spoken.length > rewoundDetailSpeechIndex, 'the rewind restarts the detail narration');
  assert.equal(String(spoken.at(-1)?.text || ''), detailSpeech, 'the rewind plays the detail, not the Short clip');

  spoken.at(-1)?.onstart?.();
  await wait(10);
  spoken.at(-1)?.onend?.();
  await wait(50);
  assert.equal(player.$.inBranch, false, 'the natural end after the in-detail rewind continues Short');
  assert.equal(currentConfig().state.index, 2, 'the natural end after the rewind advances to the following Short');
  assert.equal(player.routeSnapshot.entryId, 'symbiote-ui');
  assert.equal(player.routeSnapshot.timeMs, 0);
  assert.equal(player.$.isPaused, false, 'the following Short keeps playing after the natural end');

  player.stopShow();
});

test('historical and terminal detail exits restore the interrupted Short checkpoint', async (t) => {
  const { parseHTML } = await import('linkedom');
  const { window } = parseHTML('<!doctype html><html lang="en"><body></body></html>');
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
    'speechSynthesis',
    'SpeechSynthesisUtterance',
  ];
  const previousGlobals = new Map(globalKeys.map((key) => (
    [key, Object.getOwnPropertyDescriptor(globalThis, key)]
  )));
  for (const key of globalKeys.slice(0, -4)) globalThis[key] = window[key];
  globalThis.CSSStyleSheet = class CSSStyleSheet {
    replaceSync() {}
  };
  globalThis.location = new URL('https://portfolio.example/cv/');
  const spoken = [];
  globalThis.speechSynthesis = {
    paused: false,
    cancel() {},
    pause() { this.paused = true; },
    resume() { this.paused = false; },
    speak(utterance) { spoken.push(utterance); },
  };
  globalThis.SpeechSynthesisUtterance = class SpeechSynthesisUtterance {
    constructor(text) { this.text = text; }
  };

  const dock = document.createElement('div');
  const showPlayer = {
    configs: [],
    states: [],
    bind(config) { this.configs.push(config); },
    setState(state) { this.states.push(state); },
  };
  t.after(() => {
    dock.remove();
    for (const [key, descriptor] of previousGlobals) {
      if (descriptor) Object.defineProperty(globalThis, key, descriptor);
      else delete globalThis[key];
    }
  });
  dock.setAgentProvider = () => {};
  dock.setMessages = () => {};
  dock.getChat = () => null;
  dock.setShow = (_key, config) => {
    showPlayer.configs.push(config);
    return showPlayer;
  };
  dock.removeShow = () => {};
  const { PortfolioShowChat } = await import(
    '../../src/ui-components/client-only/tour-player/tour-player.js?historical-detail-flow-test'
  );
  const player = new PortfolioShowChat();
  player.agentDock = dock;
  player.addEventListener('portfolio-show-phase', (event) => {
    if (typeof event.detail?.complete !== 'function') return;
    event.detail.handled = true;
    event.detail.complete(Object.freeze({
      status: 'success',
      receipts: Object.freeze([Object.freeze({
        status: 'success',
        result: Object.freeze({ status: 'completed' }),
      })]),
    }));
  });
  dock.append(player);
  document.body.append(dock);

  const wait = (ms = 0) => new Promise((resolve) => setTimeout(resolve, ms));
  const currentConfig = () => showPlayer.configs.at(-1);
  const openDetails = (branchId, sceneId) => {
    dock.dispatchEvent(new CustomEvent('agent-show-action', {
      detail: {
        id: `${sceneId}.actions`,
        actionId: 'details',
        payload: { branchId, sceneId },
      },
    }));
  };

  assert.equal(await player.applyShowRoute({
    mode: 'short',
    entryId: 'symbiote-workspace',
    timeMs: 3_000,
    play: false,
  }), true);
  await wait(10);
  assert.equal(player.$.isRunning, true);
  assert.equal(player.$.isPaused, true);
  assert.equal(currentConfig().state.index, 1);

  // Historical details: the owning scene differs from the currently paused Short.
  openDetails('symbiote-ui-details', 'symbiote-ui');
  await wait(30);
  assert.equal(player.$.inBranch, true, 'details of an earlier card open as a contextual branch');
  assert.deepEqual(player.routeSnapshot, {
    mode: 'short',
    entryId: 'symbiote-ui',
    detailId: 'symbiote-ui-details',
    timeMs: 0,
    play: true,
    running: true,
    completed: false,
  });

  spoken.at(-1)?.onend?.();
  await wait(50);
  assert.equal(player.$.inBranch, false, 'the natural end of historical details returns to Short');
  assert.equal(currentConfig().state.index, 1, 'historical details do not skip the interrupted Short segment');
  assert.equal(player.routeSnapshot.entryId, 'symbiote-workspace');
  assert.equal(player.$.isPaused, true, 'historical return restores the interrupted Short paused');
  assert.equal(player.$.resumeRequired, true);

  // Reopen historical details and leave through Return/Next: same checkpoint contract.
  openDetails('symbiote-ui-details', 'symbiote-ui');
  await wait(30);
  assert.equal(player.$.inBranch, true);
  dock.dispatchEvent(new CustomEvent('agent-show-action', {
    detail: { actionId: 'return' },
  }));
  await wait(50);
  assert.equal(player.$.inBranch, false);
  assert.equal(currentConfig().state.index, 1);
  assert.equal(player.routeSnapshot.entryId, 'symbiote-workspace');
  assert.equal(player.$.isPaused, true, 'Return from historical details restores the paused Short checkpoint');

  openDetails('symbiote-ui-details', 'symbiote-ui');
  await wait(30);
  currentConfig().controller.next();
  await wait(50);
  assert.equal(player.$.inBranch, false, 'Next from historical details exits the contextual branch');
  assert.equal(currentConfig().state.index, 1, 'Next from historical details does not advance past the interrupted Short');
  assert.equal(player.$.isPaused, true);
  assert.equal(player.$.resumeRequired, true);

  // Completed-tour detail review must not resume the remaining sequence.
  player.stopShow({ completed: true });
  await wait(10);
  assert.equal(player.$.isRunning, false);
  openDetails('symbiote-ui-details', 'symbiote-ui');
  await wait(30);
  assert.equal(player.$.inBranch, true, 'a completed tour can reopen one emitted detail action');
  const utterancesBeforeEnd = spoken.length;
  spoken.at(-1)?.onend?.();
  await wait(50);
  assert.equal(player.$.isRunning, false, 'the terminal detail review completes without resuming the tour');
  assert.equal(player.$.inBranch, false);
  assert.equal(player.routeSnapshot.completed, true);
  assert.equal(spoken.length, utterancesBeforeEnd, 'the terminal review does not start the following sequence');
  player.stopShow();
});

test('a seek back into a replaced segment runs the owner scene setup before the detail plays again', async (t) => {
  const { parseHTML } = await import('linkedom');
  const { window } = parseHTML('<!doctype html><html lang="en"><body></body></html>');
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
    'speechSynthesis',
    'SpeechSynthesisUtterance',
  ];
  const previousGlobals = new Map(globalKeys.map((key) => (
    [key, Object.getOwnPropertyDescriptor(globalThis, key)]
  )));
  for (const key of globalKeys.slice(0, -4)) globalThis[key] = window[key];
  globalThis.CSSStyleSheet = class CSSStyleSheet {
    replaceSync() {}
  };
  globalThis.location = new URL('https://portfolio.example/cv/');
  const spoken = [];
  globalThis.speechSynthesis = {
    paused: false,
    cancel() {},
    pause() { this.paused = true; },
    resume() { this.paused = false; },
    speak(utterance) { spoken.push(utterance); },
  };
  globalThis.SpeechSynthesisUtterance = class SpeechSynthesisUtterance {
    constructor(text) { this.text = text; }
  };

  const dock = document.createElement('div');
  const showPlayer = {
    configs: [],
    states: [],
    bind(config) { this.configs.push(config); },
    setState(state) { this.states.push(state); },
  };
  t.after(() => {
    dock.remove();
    for (const [key, descriptor] of previousGlobals) {
      if (descriptor) Object.defineProperty(globalThis, key, descriptor);
      else delete globalThis[key];
    }
  });
  dock.setAgentProvider = () => {};
  dock.setMessages = () => {};
  dock.getChat = () => null;
  dock.setShow = (_key, config) => {
    showPlayer.configs.push(config);
    return showPlayer;
  };
  dock.removeShow = () => {};
  const { PortfolioShowChat } = await import(
    '../../src/ui-components/client-only/tour-player/tour-player.js?replaced-reseek-scene-setup-test'
  );
  const player = new PortfolioShowChat();
  player.agentDock = dock;
  const sceneSetupPhases = [];
  player.addEventListener('portfolio-show-phase', (event) => {
    const directives = event.detail?.directives || [];
    sceneSetupPhases.push({
      aligned: Boolean(event.detail?.aligned),
      directives: directives.map((directive) => ({
        id: directive.id || '',
        type: directive.type || '',
      })),
    });
    if (typeof event.detail?.complete !== 'function') return;
    event.detail.handled = true;
    event.detail.complete(Object.freeze({
      status: 'success',
      receipts: Object.freeze([]),
    }));
  });
  dock.append(player);
  document.body.append(dock);

  const wait = (ms = 0) => new Promise((resolve) => setTimeout(resolve, ms));
  const currentConfig = () => showPlayer.configs.at(-1);
  const openDetails = (branchId, sceneId) => {
    dock.dispatchEvent(new CustomEvent('agent-show-action', {
      detail: {
        id: `${sceneId}.actions`,
        actionId: 'details',
        payload: { branchId, sceneId },
      },
    }));
  };

  assert.equal(await player.applyShowRoute({
    mode: 'short',
    entryId: 'symbiote-workspace',
    timeMs: 0,
    play: true,
  }), true);
  await wait(10);
  spoken.at(-1)?.onstart?.();
  await wait(10);

  // symbiote-workspace details are the current segment replacement.
  openDetails('workspace-details', 'symbiote-workspace');
  await wait(30);
  assert.equal(player.$.inBranch, true);
  assert.equal(player.routeSnapshot.detailId, 'workspace-details');
  spoken.at(-1)?.onend?.();
  await wait(50);
  assert.equal(player.$.inBranch, false);
  assert.equal(currentConfig().state.index, 2, 'the natural end continues to the following Short');

  // symbiote-ui details replace their own segment.
  openDetails('symbiote-ui-details', 'symbiote-ui');
  await wait(30);
  assert.equal(player.$.inBranch, true);
  assert.equal(player.routeSnapshot.detailId, 'symbiote-ui-details');
  spoken.at(-1)?.onend?.();
  await wait(50);
  assert.equal(player.$.inBranch, false);
  assert.equal(currentConfig().state.index, 3, 'the natural end advances to symbiote-engine');
  assert.equal(player.routeSnapshot.entryId, 'symbiote-engine');

  // Seek back into the replaced symbiote-ui segment with a nonzero position.
  // The physical scene is symbiote-engine, so the owner scene (symbiote-ui)
  // must run its setup phase again before the detail narration is replayed;
  // otherwise the real page presentation of the detail fails silently.
  sceneSetupPhases.length = 0;
  currentConfig().controller.seek(2, 4_000);
  await wait(30);
  assert.equal(player.$.inBranch, true, 'the re-seek opens the selected detail');
  assert.equal(player.routeSnapshot.detailId, 'symbiote-ui-details');
  spoken.at(-1)?.onstart?.();
  await wait(30);
  assert.equal(String(spoken.at(-1)?.text || ''), CV_SHOW_STORY.branches['symbiote-ui-details'].speech);

  const ownerSceneSetupRan = sceneSetupPhases.some((phase) => (
    phase.directives.some((directive) => (
      directive.type === 'navigate'
      && directive.id === 'symbiote-ui.open'
    ))
  ));
  assert.equal(
    ownerSceneSetupRan,
    true,
    `the re-seek into the replaced segment must run the owner scene setup, got ${JSON.stringify(sceneSetupPhases)}`,
  );

  player.stopShow();
});

test('an interrupted owner scene setup is re-run when the same replaced segment is sought again', async (t) => {
  const { parseHTML } = await import('linkedom');
  const { window } = parseHTML('<!doctype html><html lang="en"><body></body></html>');
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
    'speechSynthesis',
    'SpeechSynthesisUtterance',
  ];
  const previousGlobals = new Map(globalKeys.map((key) => (
    [key, Object.getOwnPropertyDescriptor(globalThis, key)]
  )));
  for (const key of globalKeys.slice(0, -4)) globalThis[key] = window[key];
  globalThis.CSSStyleSheet = class CSSStyleSheet {
    replaceSync() {}
  };
  globalThis.location = new URL('https://portfolio.example/cv/');
  const spoken = [];
  globalThis.speechSynthesis = {
    paused: false,
    cancel() {},
    pause() { this.paused = true; },
    resume() { this.paused = false; },
    speak(utterance) { spoken.push(utterance); },
  };
  globalThis.SpeechSynthesisUtterance = class SpeechSynthesisUtterance {
    constructor(text) { this.text = text; }
  };

  const dock = document.createElement('div');
  const showPlayer = {
    configs: [],
    states: [],
    bind(config) { this.configs.push(config); },
    setState(state) { this.states.push(state); },
  };
  t.after(() => {
    dock.remove();
    for (const [key, descriptor] of previousGlobals) {
      if (descriptor) Object.defineProperty(globalThis, key, descriptor);
      else delete globalThis[key];
    }
  });
  dock.setAgentProvider = () => {};
  dock.setMessages = () => {};
  dock.getChat = () => null;
  dock.setShow = (_key, config) => {
    showPlayer.configs.push(config);
    return showPlayer;
  };
  dock.removeShow = () => {};
  const { PortfolioShowChat } = await import(
    '../../src/ui-components/client-only/tour-player/tour-player.js?interrupted-owner-setup-test'
  );
  const player = new PortfolioShowChat();
  player.agentDock = dock;
  const sceneSetupPhases = [];
  player.addEventListener('portfolio-show-phase', (event) => {
    const directives = event.detail?.directives || [];
    sceneSetupPhases.push({
      directives: directives.map((directive) => ({
        id: directive.id || '',
        type: directive.type || '',
      })),
    });
    if (typeof event.detail?.complete !== 'function') return;
    event.detail.handled = true;
    event.detail.complete(Object.freeze({
      status: 'success',
      receipts: Object.freeze([]),
    }));
  });
  dock.append(player);
  document.body.append(dock);

  const wait = (ms = 0) => new Promise((resolve) => setTimeout(resolve, ms));
  const currentConfig = () => showPlayer.configs.at(-1);
  const openDetails = (branchId, sceneId) => {
    dock.dispatchEvent(new CustomEvent('agent-show-action', {
      detail: {
        id: `${sceneId}.actions`,
        actionId: 'details',
        payload: { branchId, sceneId },
      },
    }));
  };

  assert.equal(await player.applyShowRoute({
    mode: 'short',
    entryId: 'symbiote-workspace',
    timeMs: 0,
    play: true,
  }), true);
  await wait(10);
  spoken.at(-1)?.onstart?.();
  await wait(10);

  // Replace workspace and symbiote-ui segments with their details and reach
  // the following Short (symbiote-engine), confirming each scene along the way.
  openDetails('workspace-details', 'symbiote-workspace');
  await wait(30);
  spoken.at(-1)?.onstart?.();
  await wait(10);
  spoken.at(-1)?.onend?.();
  await wait(50);
  openDetails('symbiote-ui-details', 'symbiote-ui');
  await wait(30);
  spoken.at(-1)?.onstart?.();
  await wait(10);
  spoken.at(-1)?.onend?.();
  await wait(50);
  assert.equal(player.$.inBranch, false);
  assert.equal(player.routeSnapshot.entryId, 'symbiote-engine');
  spoken.at(-1)?.onstart?.();
  await wait(20);

  // First seek into the replaced segment starts an owner scene setup; the
  // second seek interrupts it before the setup completed. The setup must be
  // re-run for the second seek: the physical scene was never confirmed.
  sceneSetupPhases.length = 0;
  currentConfig().controller.seek(2, 4_000);
  await wait(10);
  currentConfig().controller.seek(2, 9_000);
  await wait(10);
  assert.equal(player.$.inBranch, true);
  assert.equal(player.routeSnapshot.detailId, 'symbiote-ui-details');
  spoken.at(-1)?.onstart?.();
  await wait(40);

  const ownerSceneSetupReRan = sceneSetupPhases.some((phase) => (
    phase.directives.some((directive) => (
      directive.type === 'navigate'
      && directive.id === 'symbiote-ui.open'
    ))
  ));
  assert.equal(
    ownerSceneSetupReRan,
    true,
    `the interrupted owner scene setup must be re-run after the second seek, got ${JSON.stringify(sceneSetupPhases)}`,
  );
  assert.equal(
    String(spoken.at(-1)?.text || ''),
    CV_SHOW_STORY.branches['symbiote-ui-details'].speech,
    'the detail narration starts after the re-run owner setup',
  );
  assert.equal(player.$.isError, false);
  assert.equal(player.$.errorText, '');

  player.stopShow();
});
