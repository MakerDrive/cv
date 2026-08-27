import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { ShowAudioArbiter, ShowSessionState } from 'symbiote-ui/chat/show-runtime';
import {
  TOUR_DETAIL_BRANCHES,
  TOUR_LOCAL_AUDIO_CONFIG,
  TOUR_RUNTIME_POLICY,
  TOUR_SCENES,
  TOUR_SHORT_SEQUENCE,
} from '../../src/static-pages/data/tourManifest.js';
import { CV_SHOW_STORY } from '../../src/static-pages/data/tourScripts.js';
import {
  CV_SHOW_DIRECTIVE_TYPES,
  adaptCvShowDirective,
  createCvShowDirectiveRunner,
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
  resolveCvShowLocalAudioConfig,
  validateCvShowLocalAudioManifest,
} from '../../src/static-pages/js/tour-player/localNarration.js';
import {
  createCvShowAlignmentController,
  partitionCvShowAlignedDirectives,
  resolveCvShowAlignmentConfig,
  resolveCvShowAudioAnchor,
  validateCvShowAlignmentManifest,
} from '../../src/static-pages/js/tour-player/showAlignmentAdapter.js';
import { createBrowserSpeechController } from '../../src/static-pages/js/tour-player/speech.js';

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
    '26d411d9093c3afc3760734deb94940bcedec96035f0ac232cfb4a239570e0a2',
  );
  assert.equal(CV_SHOW_STORY.narrationLocale, 'ru');
  assert.deepEqual(TOUR_SHORT_SEQUENCE, EXPECTED_SHORT_SEQUENCE);
  assert.deepEqual(CV_SHOW_STORY.short, EXPECTED_SHORT_SEQUENCE);
  assert.deepEqual(Object.keys(TOUR_DETAIL_BRANCHES), EXPECTED_DETAIL_BRANCHES);
  assert.equal(TOUR_SCENES.length, 16);
  assert.equal(new Set(TOUR_SCENES.map(scene => scene.id)).size, 16);
  assert.equal(CV_SHOW_STORY.scenes.length, 16);
  assert.equal(Object.keys(CV_SHOW_STORY.branches).length, 14);

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
  assert.deepEqual([...new Set(directives.map(({ type }) => type))].sort(), [...allowedDirectives].sort());
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
    'native-selection': { id: 'd.selection', type: 'native-selection', target: 'article.example.quote' },
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
  assert.equal(mapped.navigate.mode, 'cursor');
  assert.equal(mapped.frame.mode, 'frame');
  assert.equal(mapped['native-selection'].mode, 'native-selection');
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
      present({ target }) { order.push(`present:${target.id}`); return { presented: true }; },
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

test('CV runner clears presenter attention on pause without stopping active media', () => {
  const calls = [];
  const runner = createCvShowDirectiveRunner({
    attention: {
      clearTransient() { calls.push('clear-transient'); },
      clearMarkers() { calls.push('clear-markers'); },
    },
    media: { stop(reason) { calls.push(`stop:${reason}`); } },
  });

  runner.clearAttention();
  assert.deepEqual(calls, ['clear-markers', 'clear-transient']);
  runner.cancel();
  assert.deepEqual(calls, [
    'clear-markers',
    'clear-transient',
    'clear-markers',
    'clear-transient',
    'stop:phase-changed',
  ]);
});

test('CV runner cannot present a stale attention cue after pause aborts readiness', async () => {
  let releaseReadiness;
  let presentCalls = 0;
  const readiness = new Promise((resolve) => { releaseReadiness = resolve; });
  const runner = createCvShowDirectiveRunner({
    document: {},
    attention: {
      present() { presentCalls += 1; return { presented: true }; },
      clearMarkers() {},
      clearTransient() {},
    },
    resolveTarget: () => ({ id: 'target' }),
    resolveText: (key) => key,
    waitForReadiness: () => readiness,
  });
  const running = runner.run([{ id: 'stale.frame', type: 'frame', target: 'target' }]);

  runner.clearAttention();
  releaseReadiness({ target: { id: 'target' } });

  assert.equal((await running).status, 'cancelled');
  assert.equal(presentCalls, 0);
});

test('CV runner uses the shared hidden-panel lifecycle and restores only after attention settles', async () => {
  const order = [];
  const runner = createCvShowDirectiveRunner({
    document: {},
    runtime: { entries: new Map() },
    attention: {
      present({ target }) { order.push(`act:${target.id}`); return { presented: true }; },
      async whenSettled() { order.push('settled'); },
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

function createLocalAudioManifest() {
  const entries = [
    ...CV_SHOW_STORY.scenes.map((entry) => ({ kind: 'short', entry })),
    ...Object.values(CV_SHOW_STORY.branches).map((entry) => ({ kind: 'detail', entry })),
  ];
  return {
    version: 'cv-show-local-audio-manifest-v1',
    locale: 'ru',
    inputHash: 'sha256:test',
    story: { contractRevision: CV_SHOW_STORY.contractRevision },
    voiceSelection: { id: 'maximo-default-male', voiceRef: 'qwen3:speaker:alnilam' },
    clips: entries.map(({ kind, entry }, index) => {
      const sha256 = (index + 1).toString(16).padStart(64, '0');
      return {
        index: index + 1,
        kind,
        id: entry.id,
        speech: entry.speech,
        file: `${String(index + 1).padStart(2, '0')}-${entry.id}-${sha256.slice(0, 12)}.wav`,
        sampleRate: 24000,
        sha256,
      };
    }),
  };
}

function createAlignmentManifest() {
  const entries = [
    ...CV_SHOW_STORY.scenes.map((entry) => ({ kind: 'short', entry })),
    ...Object.values(CV_SHOW_STORY.branches).map((entry) => ({ kind: 'detail', entry })),
  ];
  return {
    version: 'cv-show-whisper-alignment-manifest-v1',
    locale: 'ru',
    model: 'large-v3-turbo',
    alignedSequenceVersion: 'workspace-aligned-sequence-v3',
    story: {
      ...createLocalAudioManifest().story,
    },
    aggregate: { timingCoverage: 1 },
    clips: entries.map(({ kind, entry }, index) => ({
      index: index + 1,
      kind,
      id: entry.id,
      sourceAudioSha256: `${String(index + 1).padStart(2, '0')}-audio`,
      alignedSequenceFile: `aligned/${String(index + 1).padStart(2, '0')}-${entry.id}.json`,
      alignedSequenceHash: `workspace-aligned-sequence-v3:${entry.id}`,
      timelineHash: `presentation-timeline-v3:${entry.id}`,
      mediaDurationMs: 5000,
      metrics: { timingCoverage: 1, observedWordsMatch: true },
    })),
  };
}

test('normal Show route resolves configured local RU audio and keeps query overrides optional', () => {
  assert.deepEqual(resolveCvShowLocalAudioConfig({
    url: 'https://portfolio.example/cv/?lang=ru',
    baseUrl: 'https://portfolio.example/cv/',
    appConfig: TOUR_LOCAL_AUDIO_CONFIG,
  }), {
    mode: 'local',
    locale: 'ru',
    selection: 'maximo-default-male',
    manifestUrl: 'https://portfolio.example/cv/cv-show-audio-private/maximo-default-male/fd525ef880dd38b8/manifest.json',
    manifestRevision: 'fd525ef880dd38b8',
    alignmentManifest: 'alignment/large-v3-turbo/89c82b1482543d4f/manifest.json',
  });
  assert.deepEqual(resolveCvShowLocalAudioConfig({
    url: 'https://portfolio.example/cv/?showAudio=local&showVoice=custom-user',
    baseUrl: 'https://portfolio.example/cv/',
    appConfig: { ...TOUR_LOCAL_AUDIO_CONFIG, audio: 'browser' },
  }), null, 'an unconfigured custom voice must fall back honestly instead of guessing a manifest');
  assert.equal(resolveCvShowLocalAudioConfig({
    url: 'https://portfolio.example/cv/?showAudio=browser',
    baseUrl: 'https://portfolio.example/cv/',
    appConfig: TOUR_LOCAL_AUDIO_CONFIG,
  }), null);
  assert.equal(resolveCvShowLocalAudioConfig({
    url: 'https://portfolio.example/cv/?showAudio=local',
    baseUrl: 'https://other.example/cv/',
  }), null);
});

test('local RU manifest maps all 16 Short and 14 detail clips to canonical speech', () => {
  const manifest = validateCvShowLocalAudioManifest(createLocalAudioManifest(), CV_SHOW_STORY, {
    selection: 'maximo-default-male',
    manifestUrl: 'https://portfolio.example/cv/cv-show-audio-private/maximo-default-male/manifest.json',
  });
  assert.equal(manifest.locale, 'ru');
  assert.equal(manifest.clips.length, 30);
  assert.equal(manifest.clips.filter(({ kind }) => kind === 'short').length, 16);
  assert.equal(manifest.clips.filter(({ kind }) => kind === 'detail').length, 14);
  assert.equal(manifest.byId.get('positioning').speech, CV_SHOW_STORY.scenes[0].speech);
  assert.equal(manifest.byId.get('photopizza-details').speech, CV_SHOW_STORY.branches['photopizza-details'].speech);
  assert.throws(() => validateCvShowLocalAudioManifest({
    ...createLocalAudioManifest(),
    locale: 'en',
  }, CV_SHOW_STORY, {
    selection: 'maximo-default-male',
    manifestUrl: 'https://portfolio.example/cv/cv-show-audio-private/maximo-default-male/manifest.json',
  }), /manifest is invalid: locale/);
});

test('fresh scene turn-start navigation is setup and absent from the aligned cue schedule', async () => {
  const entry = CV_SHOW_STORY.scenes.find(({ id }) => id === 'symbiote-workspace');
  const partition = partitionCvShowAlignedDirectives(entry.directives);
  assert.deepEqual(partition.sceneSetup.map(({ id }) => id), ['workspace.open']);
  assert.deepEqual(partition.scheduled.map(({ source }) => source.id), [
    'workspace.intro-frame',
    'workspace.portable-config',
    'workspace.agent-portal-card',
    'workspace.video-studio-card',
    'workspace.active-note',
  ]);

  const manifestSource = createAlignmentManifest();
  const sequence = {
    contractVersion: 'workspace-aligned-sequence-v3',
    timelineHash: 'presentation-timeline-v3:symbiote-workspace',
    media: { hash: 'sha256:02-audio', durationMs: 5000, locale: 'ru' },
    turns: [{
      turnIndex: 0,
      startMs: 0,
      endMs: 5000,
      transcript: 'В 2026 году Результат сохраняется Agent Portal Video Studio',
      words: [
        { text: 'В', startMs: 500, endMs: 550 },
        { text: '2026', startMs: 550, endMs: 700 },
        { text: 'году', startMs: 700, endMs: 800 },
        { text: 'Результат', startMs: 1500, endMs: 1700 },
        { text: 'сохраняется', startMs: 1700, endMs: 1900 },
        { text: 'Agent', startMs: 2500, endMs: 2650 },
        { text: 'Portal', startMs: 2650, endMs: 2800 },
        { text: 'Video', startMs: 3500, endMs: 3650 },
        { text: 'Studio', startMs: 3650, endMs: 3800 },
      ],
    }],
    events: [],
    hash: 'workspace-aligned-sequence-v3:symbiote-workspace',
  };
  const controller = createCvShowAlignmentController({
    url: 'https://portfolio.example/cv/?showAudio=local',
    baseUrl: 'https://portfolio.example/cv/',
    appConfig: TOUR_LOCAL_AUDIO_CONFIG,
    fetchImpl: async (url) => ({
      ok: true,
      json: async () => String(url).endsWith('/manifest.json') ? manifestSource : sequence,
    }),
  });
  await controller.prepare(CV_SHOW_STORY);
  class FakeMedia extends EventTarget {
    currentTime = 0;
    pause() {}
    play() { return Promise.resolve(); }
  }
  const aligned = await controller.createEntryRuntime({ entry, media: new FakeMedia() });
  assert.deepEqual(aligned.schedule.map(({ cueId }) => cueId), [
    '001:workspace.intro-frame',
    '002:workspace.portable-config',
    '003:workspace.agent-portal-card',
    '004:workspace.video-studio-card',
    '005:workspace.active-note',
  ]);
  assert.equal(aligned.schedule.some(({ cueId }) => cueId.endsWith(':workspace.open')), false);
  aligned.runtime.dispose();
});

test('private RU alignment uses shared recognized-word timing and real segment fallback', async () => {
  const config = resolveCvShowAlignmentConfig({
    url: 'https://portfolio.example/cv/?showAudio=local',
    baseUrl: 'https://portfolio.example/cv/',
    appConfig: {
      ...TOUR_LOCAL_AUDIO_CONFIG,
      alignmentManifest: 'alignment/large-v3-turbo/89c82b1482543d4f/manifest.json',
    },
  });
  assert.equal(
    config.alignmentManifestUrl,
    'https://portfolio.example/cv/cv-show-audio-private/maximo-default-male/fd525ef880dd38b8/alignment/large-v3-turbo/89c82b1482543d4f/manifest.json',
  );
  const manifestSource = createAlignmentManifest();
  const manifest = validateCvShowAlignmentManifest(manifestSource, CV_SHOW_STORY, config);
  assert.equal(manifest.clips.length, 30);
  assert.deepEqual(resolveCvShowAudioAnchor({ id: 'unknown.frame', type: 'frame' }, 1, 4), {
    anchor: 'turn-start', offsetMs: 0,
  });
  assert.deepEqual(resolveCvShowAudioAnchor({ id: 'unknown.idle', type: 'idle' }, 2, 4), {
    anchor: 'turn-end', offsetMs: 0,
  });
  assert.deepEqual(resolveCvShowAudioAnchor({
    id: 'workspace.portable-config', type: 'native-selection',
  }, 2, 6), {
    anchor: 'speech', quote: 'Результат сохраняется', occurrence: 1, edge: 'start', offsetMs: 0,
  });

  const sequence = {
    contractVersion: 'workspace-aligned-sequence-v3',
    timelineHash: 'presentation-timeline-v3:positioning',
    media: { hash: 'sha256:01-audio', durationMs: 5000, locale: 'ru' },
    turns: [{
      turnIndex: 0,
      startMs: 0,
      endMs: 5000,
      transcript: 'За годы работы задачи менялись вместе с командой А дальше',
      words: [
        { text: 'За', startMs: 500, endMs: 600 },
        { text: 'годы', startMs: 600, endMs: 700 },
        { text: 'работы', startMs: 700, endMs: 800 },
        { text: 'задачи', startMs: 1000, endMs: 1100 },
        { text: 'менялись', startMs: 1100, endMs: 1250 },
        { text: 'вместе', startMs: 2500, endMs: 2600 },
        { text: 'с', startMs: 2600, endMs: 2650 },
        { text: 'командой', startMs: 2650, endMs: 2800 },
        { text: 'А', startMs: 3500, endMs: 3550 },
        { text: 'дальше', startMs: 3550, endMs: 3700 },
      ],
    }],
    events: [],
    hash: 'workspace-aligned-sequence-v3:positioning',
  };
  const controller = createCvShowAlignmentController({
    url: 'https://portfolio.example/cv/?showAudio=local',
    baseUrl: 'https://portfolio.example/cv/',
    appConfig: TOUR_LOCAL_AUDIO_CONFIG,
    fetchImpl: async (url) => ({
      ok: true,
      json: async () => String(url).endsWith('/manifest.json') ? manifestSource : sequence,
    }),
  });
  assert.deepEqual(await controller.prepare(CV_SHOW_STORY), {
    available: true,
    version: 'cv-show-whisper-alignment-manifest-v1',
    model: 'large-v3-turbo',
    clipCount: 30,
    timingCoverage: 1,
  });
  class FakeMedia extends EventTarget {
    currentTime = 0;
    pause() { this.dispatchEvent(new Event('pause')); }
    play() { this.dispatchEvent(new Event('play')); return Promise.resolve(); }
  }
  const media = new FakeMedia();
  let cues = [];
  let resets = [];
  let seekFailures = [];
  const aligned = await controller.createEntryRuntime({
    entry: CV_SHOW_STORY.scenes[0],
    media,
    onCue: (receipt) => cues.push(receipt),
    onReset: (receipt) => resets.push(receipt),
    onSeekFailure: (receipt) => seekFailures.push(receipt),
  });
  assert.equal(aligned.exactCueCount, 4);
  assert.equal(aligned.segmentCueCount, 0);
  media.currentTime = 0.5;
  media.dispatchEvent(new Event('timeupdate'));
  assert.equal(cues[0].source.id, 'positioning.experience-frame');
  assert.equal(cues[0].cueTimeMs, 500);
  assert.equal(cues[0].cue.alignment.provenance.source, 'recognized-word');
  media.pause();
  await media.play();
  assert.equal(cues.length, 1, 'pause/resume at the same time must not re-fire the cue');
  aligned.runtime.restorePlayback({ positionMs: 2800 }, { reason: 'branch-return' });
  assert.equal(resets.at(-1).reason, 'branch-return');
  assert.deepEqual(cues.slice(-3).map((receipt) => receipt.source.id), [
    'positioning.experience-frame',
    'positioning.tenure-marker',
    'positioning.team-pause',
  ]);
  media.dispatchEvent(new Event('error'));
  assert.deepEqual(seekFailures.map((receipt) => ({
    status: receipt.status,
    reason: receipt.reason,
    requestedMs: receipt.requestedMs,
    observedMs: receipt.observedMs,
  })), [{
    status: 'failed',
    reason: 'media-error',
    requestedMs: 2800,
    observedMs: 2800,
  }]);
  aligned.runtime.dispose();
});

test('local audio controller plays, pauses, resumes and cancels the exact manifest clip', async () => {
  const manifest = validateCvShowLocalAudioManifest(createLocalAudioManifest(), CV_SHOW_STORY, {
    selection: 'maximo-default-male',
    manifestUrl: 'https://portfolio.example/cv/cv-show-audio-private/maximo-default-male/manifest.json',
  });
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
  const manifest = validateCvShowLocalAudioManifest(createLocalAudioManifest(), CV_SHOW_STORY, {
    selection: 'maximo-default-male',
    manifestUrl: 'https://portfolio.example/cv/cv-show-audio-private/maximo-default-male/manifest.json',
  });
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
  const manifest = validateCvShowLocalAudioManifest(createLocalAudioManifest(), CV_SHOW_STORY, {
    selection: 'maximo-default-male',
    manifestUrl: 'https://portfolio.example/cv/cv-show-audio-private/maximo-default-male/manifest.json',
  });
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
  const manifest = validateCvShowLocalAudioManifest(createLocalAudioManifest(), CV_SHOW_STORY, {
    selection: 'maximo-default-male',
    manifestUrl: 'https://portfolio.example/cv/cv-show-audio-private/maximo-default-male/fd525ef880dd38b8/manifest.json',
  });
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
    appConfig: TOUR_LOCAL_AUDIO_CONFIG,
    fetchImpl: async () => ({ ok: true, json: async () => createLocalAudioManifest() }),
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
  assert.match(localAudio.src, /01-positioning-[a-f0-9]{12}\.wav$/);
  assert.deepEqual(browserCalls, []);
  assert.equal(narration.speak(CV_SHOW_STORY.scenes[0].speech, { id: 'positioning', lang: 'en' }), true);
  assert.deepEqual(browserCalls, [[CV_SHOW_STORY.scenes[0].speech, 'en']]);

  let nonRuFetches = 0;
  const nonRuNarration = createCvShowNarrationController({
    browserSpeech,
    url: 'https://portfolio.example/cv/?lang=en&showAudio=local',
    baseUrl: 'https://portfolio.example/cv/',
    appConfig: { ...TOUR_LOCAL_AUDIO_CONFIG, locale: 'en' },
    fetchImpl: async () => {
      nonRuFetches += 1;
      return { ok: true, json: async () => createLocalAudioManifest() };
    },
  });
  assert.equal((await nonRuNarration.prepare(CV_SHOW_STORY)).source, 'browser');
  assert.equal(nonRuFetches, 0, 'non-RU pages must not request private RU narration');
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
  assert.match(runtime, /ShowAudioArbiter/);
  assert.match(runtime, /ShowMediaController/);
  assert.match(runtime, /monitorMeaningfulShowInteractions/);
  assert.match(logic, /portfolio-show-pause/);
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
  assert.match(logic, /semantics: detail \? 'detail' : 'pointer-only'/);
  assert.match(logic, /entry\.directives\.filter\(\(\{ type \}\) => type !== 'media'\)/);
  assert.match(logic, /queueMicrotask\(\(\) => this\.#advanceShort/);
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
