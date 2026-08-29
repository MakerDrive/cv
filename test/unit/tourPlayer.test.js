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
  runCvShowPresentationOperation,
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

test('branch return reruns subject setup before restoring paused narration', async () => {
  const logic = await readFile(
    new URL('../../src/ui-components/client-only/tour-player/tour-player.js', import.meta.url),
    'utf8',
  );
  const restoreMethod = logic.match(
    /async #restoreAfterBranch\(\{ entry, playback \}, requestId\) \{(?<body>[\s\S]*?)\n  \}\n\n  async #resume/,
  );
  assert.ok(restoreMethod?.groups?.body, 'branch-return method body');
  assert.match(
    restoreMethod.groups.body,
    /this\.#alignment\.available\s*\? null\s*:\s*this\.#runSceneSetup\(entry, requestId\)/u,
  );
  assert.match(restoreMethod.groups.body, /sceneSetupReady,/);
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
    /if \(this\.\$\.isRunning \|\| this\.#mode \|\| this\.#alignedEntry \|\| this\.\$\.inBranch\) \{\s*this\.stopShow\(\);[\s\S]*?this\.#authoringView = nextView;\s*this\.#acceptStory\(nextView\.story\);/u,
  );
  assert.match(
    logic,
    /const requestId = this\.#requestId;[\s\S]*?if \(unavailableEntryIds\.length\)[\s\S]*?return;\s*\}\s*this\.#mode = mode;/u,
  );
  assert.match(logic, /requestId !== this\.#requestId \|\| !this\.#mode/u);
  assert.match(logic, /masterProjectHash: this\.#authoringView\.base\.authoringProjectHash/u);
  assert.match(logic, /masterRevision: this\.#authoringView\.base\.revision/u);
  assert.doesNotMatch(logic, /CV_SHOW_PRESENTATION_PROJECT/u);
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
  ];
  const previousGlobals = new Map(globalKeys.map((key) => (
    [key, Object.getOwnPropertyDescriptor(globalThis, key)]
  )));
  let dock = null;
  for (const key of globalKeys.slice(0, -2)) globalThis[key] = window[key];
  globalThis.CSSStyleSheet = class CSSStyleSheet {
    replaceSync() {}
  };
  globalThis.location = new URL('https://portfolio.example/cv/');
  t.after(() => {
    dock?.remove();
    for (const [key, descriptor] of previousGlobals) {
      if (descriptor) Object.defineProperty(globalThis, key, descriptor);
      else delete globalThis[key];
    }
  });

  const sessionCalls = { enterBranch: 0, setPlayback: 0, appendMessage: 0 };
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
    bind() { this.bindCalls += 1; },
    setState() { this.stateCalls += 1; },
  };
  let messages = [];
  let mountCalls = 0;
  dock.setAgentProvider = () => {};
  dock.setMessages = (value) => { messages = value; };
  dock.getChat = () => null;
  dock.setShow = () => {
    mountCalls += 1;
    return showPlayer;
  };
  dock.removeShow = () => {};

  const player = new PortfolioShowChat();
  player.agentDock = dock;
  const phases = [];
  const narrationHandoffs = [];
  player.addEventListener('portfolio-show-phase', (event) => phases.push(event.detail));
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
  await Promise.resolve();

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
    marker: { id: 'd.marker', type: 'marker', target: 'article.example.map', shape: 'ovals', text: 'A' },
    activate: { id: 'd.activate', type: 'activate', target: 'article.example.demo' },
    media: { id: 'd.media', type: 'media', target: 'article.example.video', mode: 'short-muted-montage' },
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
  assert.equal(mapped.activate.mode, 'click');
  assert.equal(mapped.media.type, 'media');
  assert.equal(mapped['chat-note'].type, 'footnote');
  assert.equal(mapped['chat-action'].type, 'actions');
  assert.equal(mapped.idle.type, 'status');
});

test('CV runner delegates navigation, attention, media, and chat events through shared APIs', async () => {
  const order = [];
  const target = { id: 'target' };
  const mediaElement = { id: 'media' };
  const runtime = {
    entries: new Map([['projects/example', {}]]),
    select(id, options) { order.push(['select', id, options]); },
  };
  const runner = createCvShowDirectiveRunner({
    document: {},
    runtime,
    attention: { present: (request) => { order.push(['attention', request.mode, request.target]); return { presented: true }; }, clearTransient() {} },
    media: { play: async (element, directive) => { order.push(['media', element, directive.mode]); return { played: true }; } },
    emit: (directive) => order.push(['emit', directive.type]),
    resolveTarget: () => target,
    resolveMedia: () => mediaElement,
    resolveText: (key) => key,
    activateTarget: () => { order.push(['activate']); return true; },
    waitForReadiness: async ({ target: requested, media }) => ({ target: typeof requested === 'function' ? requested() : requested, media }),
  });
  const sources = [
    { id: 'd.navigate', type: 'navigate', target: 'projects/example' },
    { id: 'd.frame', type: 'frame', target: 'article.example.intro' },
    { id: 'd.selection', type: 'native-selection', target: 'article.example.quote' },
    { id: 'd.marker', type: 'marker', target: 'article.example.map', shape: 'oval' },
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
  assert.equal(order.filter(([name]) => name === 'media').length, 1);
  assert.equal(order.filter(([name]) => name === 'activate').length, 1);
  assert.equal(order.filter(([name]) => name === 'emit').length, 8);
  assert.equal(order.some(([name, type]) => name === 'emit' && type === 'status'), false);
});

test('CV navigation re-resolves its target after selection and waits for the selected article', async () => {
  const staleRow = { id: 'stale-row' };
  const freshRow = { id: 'fresh-row' };
  const viewer = { getAttribute: () => null };
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
    'present:fresh-row',
  ]);
  assert.equal(
    result.receipts[0].result.phases.find(({ phase }) => phase === 'act').result.mode,
    'click',
  );
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
  let runner = createCvShowDirectiveRunner({
    document: {},
    resolveTarget: () => ({ id: 'target' }),
    resolveText: (key) => key,
    waitForReadiness: async () => {
      await scrollGate;
      return { id: 'target' };
    },
    observePerformance: () => observations.shift(),
  });
  let fixture = workspaceOperationFixture({
    kind: 'interaction',
    interaction: { type: 'scroll', reversible: false },
    source: { id: 'example', type: 'frame', target: 'target' },
  });
  fixture.operation.projectCell.id = 'cv-show:cue:example:scroll';
  let pending = runCvShowPresentationOperation(runner, fixture.operation);
  assert.deepEqual(fixture.receipts.map(({ status }) => status), ['acted']);
  releaseScroll();
  assert.equal(await pending, undefined);
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
      planVersion: 'symbiote-presenter-kinematics-v1',
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
  directiveId = 'positioning.experience-frame',
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
      'ui:plan:frame',
      'cv:admission',
      'workspace:admission',
      'ui:pixel:frame',
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
      assert.equal(providerAdmission.budget.limitMs, 550);
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
        'ui:plan:frame',
        'cv:admission',
        'workspace:admission',
        'ui:pixel:frame',
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
        options: { focusDurationMs: 551 },
        assertEvidence(providerAdmission) {
          assert.equal(providerAdmission.reason.code, 'budget-exceeded');
          assert.deepEqual(
            providerAdmission.budget,
            { limitMs: 550, plannedDurationMs: 551 },
          );
        },
      }, {
        options: { uiTargetUnresolved: true },
        assertEvidence(providerAdmission) {
          assert.equal(providerAdmission.reason.code, 'provider-rejected');
          assert.deepEqual(providerAdmission.reason.provider, { code: 'target-unresolved' });
          assert.deepEqual(providerAdmission.target, {
            id: 'profile.experience',
            identity: 'profile.experience',
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

test('the presenter pause bridge cancels actual work only for meaningful interaction', async () => {
  const logic = await readFile(new URL(
    '../../src/static-pages/js/tour-player/index.js',
    import.meta.url,
  ), 'utf8');
  const pauseBody = logic.match(/const pausePresenter = \(event\) => \{([\s\S]*?)\n  \};\n\n  const resumePresenter/u)?.[1] || '';
  assert.match(pauseBody, /if \(event\.detail\?\.reason === 'meaningful-interaction'\) \{\s*presenter\?\.runner\.meaningfulInteraction\(\);/u);
  assert.doesNotMatch(pauseBody, /\b(?:Queue|enqueue|tail)\b/u);
  assert.match(pauseBody, /else \{\s*presenter\?\.runner\.pause\(\);\s*\}/u);
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

test('browser speech controller retains utterances, ignores stale completion, and clears global pause', () => {
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
  const speech = createBrowserSpeechController({ synth, Utterance: FakeUtterance });

  assert.equal(speech.available, true);
  speech.speak('First', { lang: 'ru', onEnd: () => completed.push('first') });
  assert.equal(paused, false);
  speech.speak('Second', { lang: 'ru', onEnd: () => completed.push('second') });
  spoken[0].onend?.();
  assert.deepEqual(completed, []);
  spoken[1].onend?.();
  assert.deepEqual(completed, ['second']);
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

test('web audio release rejects stale ancestry, profile, order, paths, hashes, and private fields', async () => {
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
  await assert.rejects(
    validateCvShowWebAudioRelease(manifest, evolvedStory, config),
    /release is invalid: clip 1/u,
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

test('fresh scene turn-start navigation is the one Project setup cell', () => {
  const entry = CV_SHOW_STORY.scenes.find(({ id }) => id === 'symbiote-workspace');
  const partition = partitionCvShowAlignedDirectives(entry.directives);
  assert.deepEqual(partition.sceneSetup.map(({ id }) => id), ['workspace.open']);
  assert.deepEqual(partition.scheduled.map(({ source }) => source.id), [
    'workspace.intro-frame',
    'workspace.portable-config',
    'workspace.agent-portal-card',
  ]);

  const setup = CV_SHOW_PRESENTATION_PROJECT.cells.filter(({ id, turnId, timing }) => (
    turnId === entry.id
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
    onMedia: () => alignmentReady,
  }), true);
  await Promise.resolve();
  assert.equal(audio.playCalls, 0);
  releaseAlignment(Object.freeze({
    status: 'completed',
    reason: 'alignment-ready',
    generation: 1,
    requestedMs: 0,
    observedMs: 0,
  }));
  await alignmentReady;
  await Promise.resolve();
  assert.equal(audio.playCalls, 1);
  assert.equal(speech.snapshot.generationReceipt.status, 'completed');
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
  assert.doesNotMatch(runtime, /history\.(?:pushState|replaceState)/);
  assert.match(`${logic}\n${runtime}\n${adapter}`, /symbiote-ui\/chat\/show-runtime/);
  assert.match(logic, /ShowSessionState/);
  assert.match(runtime, /ShowAttentionController/);
  assert.doesNotMatch(runtime, /function createNativeSelection/);
  assert.match(logic, /createCvShowMessageStream/);
  assert.match(
    logic,
    /const acknowledgement = await this\.#appendAgentMessage[\s\S]*?acknowledgement\?\.status !== 'completed'[\s\S]*?this\.#presentScene\(\)/u,
  );
  assert.match(logic, /wasRunning && !completed && this\.isConnected/u);
  assert.match(logic, /payload: \{ intent: 'show-mode' \},\s*\}, \{ stream: false \}\)/u);
  assert.match(runtime, /ShowAudioArbiter/);
  assert.match(runtime, /ShowMediaController/);
  assert.match(runtime, /monitorMeaningfulShowInteractions/);
  assert.match(logic, /portfolio-show-pause/);
  assert.match(logic, /portfolio-show-resume/);
  assert.match(runtime, /runner\.meaningfulInteraction\(\)/);
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
  assert.match(logic, /semantics: detail \? 'detail' : 'pointer-only'/);
  assert.match(logic, /partitionCvShowAlignedDirectives\(entry\.directives\)/);
  assert.match(logic, /this\.#alignment\.available\s*\? null\s*:\s*this\.#runSceneSetup\(entry, requestId\)/u);
  assert.match(logic, /requireCvShowSceneSetupSuccess\(sceneSetupReceipt, entry\.id\)/);
  assert.match(logic, /captionTrack/);
  assert.match(logic, /addEventListener\?\.\('timeupdate'/);
  assert.match(logic, /removeEventListener\?\.\('timeupdate'/);
  assert.match(logic, /portfolio-show-before-advance/);
  assert.match(logic, /this\.#advanceAfterAttention\(requestId\)/);
  assert.match(runtime, /portfolio-show-presentation-operation/);
  assert.match(runtime, /runCvShowPresentationOperation/);
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
