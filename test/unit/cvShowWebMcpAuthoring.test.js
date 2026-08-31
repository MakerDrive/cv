import assert from 'node:assert/strict';
import test from 'node:test';

globalThis.HTMLElement ||= class HTMLElement {};

let { listCvShowAuthoringToolDescriptors } = await import(
  '../../src/static-pages/js/tour-player/cvShowAuthoringTools.js'
);
let { createCvShowWebMcpAuthoring } = await import(
  '../../src/static-pages/js/tour-player/cvShowWebMcpAuthoring.js'
);

function capability(sessionId = 'cv-authoring-session') {
  return Object.freeze({
    local: true,
    authorized: true,
    sessionId,
  });
}

function createView({
  revision = 12,
  authoringProjectHash = 'workspace-presentation-authoring-project-v1:sha256-current',
  snapshot = 'cv-show-authoring-snapshot-v1:sha256-current',
  media = 'cv-show-authoring-media-collection-v1:sha256-current',
} = {}) {
  return Object.freeze({
    base: Object.freeze({ revision, authoringProjectHash }),
    identity: Object.freeze({
      schemaVersion: 'cv-show-authoring-view-identity-v1',
      snapshot,
      media,
    }),
  });
}

function frozenDescriptorObject(values, {
  accessorKey = null,
  nonEnumerableKey = null,
  onRead = () => {},
} = {}) {
  let object = {};
  for (let [key, value] of Object.entries(values)) {
    let descriptor = key === accessorKey
      ? {
          configurable: false,
          enumerable: true,
          get() {
            onRead(key);
            return value;
          },
        }
      : {
          configurable: false,
          enumerable: key !== nonEnumerableKey,
          value,
          writable: false,
        };
    Object.defineProperty(object, key, descriptor);
  }
  return Object.freeze(object);
}

function hostileProviderError(accessorKey) {
  let getterReads = 0;
  let values = {
    code: accessorKey === 'name' ? undefined : 'PRESENTATION_AUTHORING_TOOL_STALE',
    name: 'PresentationAuthoringToolError',
    message: 'tool base is stale',
    details: { path: 'input.base' },
  };
  let error = {};
  for (let [key, value] of Object.entries(values)) {
    Object.defineProperty(error, key, key === accessorKey
      ? {
          configurable: false,
          enumerable: true,
          get() {
            getterReads += 1;
            throw new Error(`hostile ${key} getter`);
          },
        }
      : {
          configurable: false,
          enumerable: true,
          value,
          writable: false,
        });
  }
  return {
    error: Object.freeze(error),
    getterReads: () => getterReads,
  };
}

function createSession({
  invoke,
  getView,
  sessionId = 'cv-authoring-session',
  tools = listCvShowAuthoringToolDescriptors(),
} = {}) {
  let calls = [];
  let defaultResult = Object.freeze({
    revision: 12,
    authoringProjectHash: 'workspace-presentation-authoring-project-v1:sha256-result',
  });
  let currentMutationSession;
  let mutationSession = Object.freeze({
    tools,
    async invoke(name, input, options) {
      calls.push({ name, input, options });
      return invoke ? invoke(name, input, options) : defaultResult;
    },
  });
  currentMutationSession = mutationSession;
  let authority = Object.freeze({
    get mutationSession() {
      return currentMutationSession;
    },
    getView: getView || (() => createView()),
  });
  let session = Object.freeze({ sessionId, mutationSession });
  return {
    authority,
    calls,
    defaultResult,
    mutationSession,
    session,
    detach() {
      currentMutationSession = null;
    },
  };
}

function createNativeHarness({ failAt = -1 } = {}) {
  let registrations = [];
  let unregisterCalls = [];
  let events = [];
  return {
    registrations,
    unregisterCalls,
    events,
    async registerTool(owner, key, descriptor) {
      let index = registrations.length;
      let entry = {
        name: descriptor.name,
        key,
        nativeActive: index !== failAt,
      };
      registrations.push({ owner, key, descriptor, entry });
      return entry;
    },
    unregisterTools(owner) {
      events.push('unregister');
      unregisterCalls.push(owner);
    },
  };
}

function decode(response) {
  assert.equal(response.content.length, 1);
  assert.equal(response.content[0].type, 'text');
  return JSON.parse(response.content[0].text);
}

function deferred() {
  let resolve;
  let promise = new Promise((settle) => { resolve = settle; });
  return { promise, resolve };
}

test('public CV registers no authoring tools without an explicit local capability', async () => {
  let { authority, session } = createSession();
  let native = createNativeHarness();
  let lifecycle = await createCvShowWebMcpAuthoring({
    authority,
    session,
    capability: null,
    registerTool: native.registerTool,
    unregisterTools: native.unregisterTools,
  });

  assert.equal(lifecycle.state.status, 'inactive');
  assert.equal(lifecycle.state.reason, 'unauthorized');
  assert.deepEqual(lifecycle.state.activeToolNames, []);
  assert.equal(native.registrations.length, 0);
  assert.equal(native.unregisterCalls.length, 0);
});

test('an authorized capability without an accepted session registers no tools', async () => {
  let { authority } = createSession();
  let native = createNativeHarness();
  let lifecycle = await createCvShowWebMcpAuthoring({
    authority,
    session: null,
    capability: capability(),
    registerTool: native.registerTool,
    unregisterTools: native.unregisterTools,
  });

  assert.equal(lifecycle.state.status, 'inactive');
  assert.equal(lifecycle.state.reason, 'session-unavailable');
  assert.deepEqual(lifecycle.state.activeToolNames, []);
  assert.equal(native.registrations.length, 0);
  assert.equal(native.unregisterCalls.length, 0);
});

test('only the exact plain capability bound to the accepted session can register tools', async () => {
  let inherited = Object.assign(Object.create({ inherited: true }), capability());
  let symbol = Object.assign({ ...capability() }, { [Symbol('extra')]: true });
  let invalidCapabilities = [
    'cv-authoring-session',
    { local: true, authorized: true },
    { local: true, authorized: false, sessionId: 'cv-authoring-session' },
    { local: true, authorized: true, sessionId: '' },
    { local: true, authorized: true, sessionId: '   ' },
    { local: true, authorized: true, sessionId: { toString: () => 'cv-authoring-session' } },
    { ...capability(), extra: true },
    inherited,
    symbol,
    capability('different-session'),
    capability(' cv-authoring-session '),
  ];

  for (let invalidCapability of invalidCapabilities) {
    let { authority, session } = createSession();
    let native = createNativeHarness();
    let lifecycle = await createCvShowWebMcpAuthoring({
      authority,
      session,
      capability: invalidCapability,
      registerTool: native.registerTool,
      unregisterTools: native.unregisterTools,
    });

    assert.equal(lifecycle.state.status, 'inactive');
    assert.equal(lifecycle.state.reason, 'unauthorized');
    assert.deepEqual(lifecycle.state.activeToolNames, []);
    assert.equal(native.registrations.length, 0);
    assert.equal(native.unregisterCalls.length, 0);
  }
});

test('only frozen cloneable capability data registers without getter reads', async () => {
  let getterReads = 0;
  let accessorCapability = frozenDescriptorObject({
    local: true,
    authorized: true,
    sessionId: 'cv-authoring-session',
  }, {
    accessorKey: 'sessionId',
    onRead: () => { getterReads += 1; },
  });
  let hiddenCapability = frozenDescriptorObject({
    local: true,
    authorized: true,
    sessionId: 'cv-authoring-session',
  }, { nonEnumerableKey: 'authorized' });
  let mutableCapability = { ...capability() };
  let proxiedCapability = new Proxy(capability(), {});
  let outcomes = [];

  for (let invalidCapability of [
    accessorCapability,
    hiddenCapability,
    mutableCapability,
    proxiedCapability,
  ]) {
    let { authority, session } = createSession();
    let native = createNativeHarness();
    let lifecycle = await createCvShowWebMcpAuthoring({
      authority,
      session,
      capability: invalidCapability,
      registerTool: native.registerTool,
      unregisterTools: native.unregisterTools,
    });
    outcomes.push({
      status: lifecycle.state.status,
      reason: lifecycle.state.reason,
      registrations: native.registrations.length,
    });
    if (lifecycle.state.status === 'active') await lifecycle.dispose();
  }
  assert.deepEqual(outcomes, Array.from({ length: 4 }, () => ({
    status: 'inactive',
    reason: 'unauthorized',
    registrations: 0,
  })));
  assert.equal(getterReads, 0);
});

test('session context accessors fail before any getter read or native registration', async () => {
  let accepted = createSession();
  let getterReads = 0;
  let accessorSession = frozenDescriptorObject({
    sessionId: accepted.session.sessionId,
    mutationSession: accepted.mutationSession,
  }, {
    accessorKey: 'sessionId',
    onRead: () => { getterReads += 1; },
  });
  let native = createNativeHarness();
  let lifecycle = await createCvShowWebMcpAuthoring({
    authority: accepted.authority,
    session: accessorSession,
    capability: capability(),
    registerTool: native.registerTool,
    unregisterTools: native.unregisterTools,
  });

  assert.equal(lifecycle.state.status, 'failed');
  assert.equal(lifecycle.state.error.code, 'CV_SHOW_WEBMCP_SESSION_INVALID');
  assert.equal(native.registrations.length, 0);
  assert.equal(getterReads, 0);
});

test('mutationSession accessors fail before any getter read or native registration', async () => {
  let getterReads = 0;
  let mutationSession = frozenDescriptorObject({
    tools: listCvShowAuthoringToolDescriptors(),
    invoke: async () => ({}),
  }, {
    accessorKey: 'tools',
    onRead: () => { getterReads += 1; },
  });
  let authority = Object.freeze({
    mutationSession,
    getView: () => createView(),
  });
  let session = Object.freeze({
    sessionId: 'cv-authoring-session',
    mutationSession,
  });
  let native = createNativeHarness();
  let lifecycle = await createCvShowWebMcpAuthoring({
    authority,
    session,
    capability: capability(),
    registerTool: native.registerTool,
    unregisterTools: native.unregisterTools,
  });

  assert.equal(lifecycle.state.status, 'failed');
  assert.equal(lifecycle.state.error.code, 'CV_SHOW_WEBMCP_SESSION_INVALID');
  assert.equal(native.registrations.length, 0);
  assert.equal(getterReads, 0);
});

test('session context must be frozen, exact, and bound to the authority mutation session', async () => {
  let accepted = createSession();
  let other = createSession();
  let inherited = Object.assign(Object.create({ inherited: true }), accepted.session);
  let symbol = Object.assign({ ...accepted.session }, { [Symbol('extra')]: true });
  let invalidSessions = [
    { ...accepted.session },
    Object.freeze({ ...accepted.session, extra: true }),
    Object.freeze(inherited),
    Object.freeze(symbol),
  ];

  for (let invalidSession of invalidSessions) {
    let native = createNativeHarness();
    let lifecycle = await createCvShowWebMcpAuthoring({
      authority: accepted.authority,
      session: invalidSession,
      capability: capability(),
      registerTool: native.registerTool,
      unregisterTools: native.unregisterTools,
    });

    assert.equal(lifecycle.state.status, 'failed');
    assert.equal(lifecycle.state.error.code, 'CV_SHOW_WEBMCP_SESSION_INVALID');
    assert.equal(native.registrations.length, 0);
  }

  for (let mismatchedSession of [
    Object.freeze({ ...accepted.session, sessionId: 'different-session' }),
    Object.freeze({
      sessionId: accepted.session.sessionId,
      mutationSession: other.mutationSession,
    }),
  ]) {
    let native = createNativeHarness();
    let lifecycle = await createCvShowWebMcpAuthoring({
      authority: accepted.authority,
      session: mismatchedSession,
      capability: capability(),
      registerTool: native.registerTool,
      unregisterTools: native.unregisterTools,
    });

    assert.equal(lifecycle.state.status, 'inactive');
    assert.equal(lifecycle.state.reason, 'unauthorized');
    assert.equal(native.registrations.length, 0);
    assert.equal(native.unregisterCalls.length, 0);
  }
});

test('local authoring registers all provider tools and returns exact typed results', async () => {
  let { authority, session, mutationSession, calls, defaultResult } = createSession();
  let native = createNativeHarness();
  let lifecycle = await createCvShowWebMcpAuthoring({
    authority,
    session,
    capability: capability(),
    registerTool: native.registerTool,
    unregisterTools: native.unregisterTools,
  });
  let expectedNames = listCvShowAuthoringToolDescriptors().map(({ name }) => name);

  assert.equal(lifecycle.state.status, 'active');
  assert.deepEqual(lifecycle.state.activeToolNames, expectedNames);
  assert.deepEqual(native.registrations.map(({ key }) => key), expectedNames);
  assert.equal(native.registrations.every(({ entry }) => entry.nativeActive), true);
  for (let registration of native.registrations) {
    let provider = mutationSession.tools.find(({ name }) => name === registration.key);
    assert.equal(registration.descriptor.description, provider.description);
    assert.deepEqual(registration.descriptor.inputSchema, provider.inputSchema);
    assert.equal(
      registration.descriptor.annotations.readOnlyHint,
      provider.mutates !== true,
    );
  }

  let inspect = native.registrations.find(({ key }) => key === 'presentation_authoring_inspect');
  let response = await inspect.descriptor.execute({});
  let envelope = decode(response);
  assert.deepEqual(envelope, {
    schemaVersion: 'cv-show-webmcp-result-v1',
    status: 'ok',
    toolName: 'presentation_authoring_inspect',
    sessionId: 'cv-authoring-session',
    result: defaultResult,
  });
  assert.equal(response.isError, undefined);
  assert.equal(calls.length, 1);
  assert.equal(calls[0].name, 'presentation_authoring_inspect');
  assert.deepEqual(calls[0].input, {});
  assert.equal(calls[0].options.signal, lifecycle.signal);
  assert.deepEqual(envelope.result, await mutationSession.invoke(
    'presentation_authoring_inspect',
    {},
    { signal: lifecycle.signal },
  ));
});

test('local authoring rejects missing or substituted provider tools', async () => {
  let providerTools = listCvShowAuthoringToolDescriptors();
  let substitutedTool = Object.freeze({
    name: 'presentation_authoring_unexpected',
    description: 'Unexpected provider tool used to prove exact surface validation.',
    inputSchema: Object.freeze({ type: 'object' }),
  });
  let invalidToolSets = [
    providerTools.slice(0, -1),
    [...providerTools.slice(0, -1), substitutedTool],
  ];

  for (let tools of invalidToolSets) {
    let { authority, session } = createSession({ tools });
    let native = createNativeHarness();
    let lifecycle = await createCvShowWebMcpAuthoring({
      authority,
      session,
      capability: capability(),
      registerTool: native.registerTool,
      unregisterTools: native.unregisterTools,
    });

    assert.equal(lifecycle.state.status, 'failed');
    assert.equal(lifecycle.state.error.code, 'CV_SHOW_WEBMCP_TOOL_SURFACE_INVALID');
    assert.equal(native.registrations.length, 0);
  }
});

test('a deferred provider result cannot succeed after the authority session detaches', async () => {
  let pending = deferred();
  let { authority, session, calls, detach } = createSession({
    invoke: () => pending.promise,
  });
  let native = createNativeHarness();
  let lifecycle = await createCvShowWebMcpAuthoring({
    authority,
    session,
    capability: capability(),
    registerTool: native.registerTool,
    unregisterTools: native.unregisterTools,
  });
  let inspect = native.registrations.find(
    ({ key }) => key === 'presentation_authoring_inspect',
  );
  let execution = inspect.descriptor.execute({});
  assert.equal(calls.length, 1);

  detach();
  pending.resolve({ revision: 13, status: 'committed' });
  let response = await execution;
  let envelope = decode(response);

  assert.equal(response.isError, true);
  assert.equal(envelope.status, 'error');
  assert.equal(envelope.error.code, 'CV_SHOW_AUTHORING_UNAUTHORIZED');
  assert.deepEqual(envelope.error.currentBase, {
    revision: 12,
    authoringProjectHash: 'workspace-presentation-authoring-project-v1:sha256-current',
    snapshotIdentity: 'cv-show-authoring-snapshot-v1:sha256-current',
  });
  assert.deepEqual(envelope.error.currentIdentity, createView().identity);
  assert.equal(calls.length, 1);
  await lifecycle.dispose();
  assert.equal(native.unregisterCalls.length, 1);
});

test('a deferred provider result cannot succeed after pagehide aborts the session', async () => {
  let pending = deferred();
  let { authority, session, calls } = createSession({
    invoke: () => pending.promise,
  });
  let native = createNativeHarness();
  let pageTarget = new EventTarget();
  let lifecycle = await createCvShowWebMcpAuthoring({
    authority,
    session,
    capability: capability(),
    registerTool: native.registerTool,
    unregisterTools: native.unregisterTools,
    pageTarget,
  });
  lifecycle.signal.addEventListener('abort', () => native.events.push('abort'));
  let inspect = native.registrations.find(
    ({ key }) => key === 'presentation_authoring_inspect',
  );
  let execution = inspect.descriptor.execute({});
  assert.equal(calls.length, 1);

  pageTarget.dispatchEvent(new Event('pagehide'));
  pending.resolve({ revision: 13, status: 'committed' });
  let response = await execution;
  let envelope = decode(response);
  await lifecycle.dispose();

  assert.equal(response.isError, true);
  assert.equal(envelope.status, 'error');
  assert.equal(envelope.error.code, 'CV_SHOW_AUTHORING_ABORTED');
  assert.deepEqual(envelope.error.currentBase, {
    revision: 12,
    authoringProjectHash: 'workspace-presentation-authoring-project-v1:sha256-current',
    snapshotIdentity: 'cv-show-authoring-snapshot-v1:sha256-current',
  });
  assert.deepEqual(envelope.error.currentIdentity, createView().identity);
  assert.deepEqual(native.events, ['abort', 'unregister']);
  assert.equal(native.unregisterCalls.length, 1);
  assert.equal(calls.length, 1);
});

test('installed native WebMCP surface exposes all tools and keeps typed callbacks intact', async () => {
  let previousDocument = globalThis.document;
  let nativeTools = [];
  let { authority, session, mutationSession, defaultResult } = createSession({
    sessionId: 'native-session',
  });
  let lifecycle;
  globalThis.document = {
    modelContext: {
      registerTool(tool, options) {
        nativeTools.push({ tool, options });
      },
    },
  };

  try {
    lifecycle = await createCvShowWebMcpAuthoring({
      authority,
      session,
      capability: capability('native-session'),
      owner: { uid: 'cv-show-native-test' },
      pageTarget: null,
    });
    assert.equal(lifecycle.state.status, 'active');
    let expectedToolNames = listCvShowAuthoringToolDescriptors()
      .map(({ name }) => name)
      .sort();
    assert.equal(nativeTools.length, expectedToolNames.length);
    assert.deepEqual(nativeTools.map(({ tool }) => tool.name).sort(), expectedToolNames);
    assert.equal(nativeTools.every(({ options }) => !options.signal.aborted), true);
    let inspect = nativeTools.find(
      ({ tool }) => tool.name === 'presentation_authoring_inspect',
    );
    let directResult = await mutationSession.invoke(
      'presentation_authoring_inspect',
      {},
      { signal: lifecycle.signal },
    );
    let callbackResponse = await inspect.tool.execute({});
    let envelope = decode(callbackResponse);
    assert.deepEqual(envelope.result, directResult);
    assert.deepEqual(envelope.result, defaultResult);
    assert.equal(envelope.sessionId, 'native-session');

    await lifecycle.dispose();
    assert.equal(nativeTools.every(({ options }) => options.signal.aborted), true);
  } finally {
    if (lifecycle?.state.status !== 'disposed') {
      await lifecycle?.dispose();
    }
    if (previousDocument === undefined) {
      delete globalThis.document;
    } else {
      globalThis.document = previousDocument;
    }
  }
});

test('typed provider failures preserve code, details, and the current authority identity', async () => {
  let providerError = Object.assign(new Error('tool base is stale'), {
    code: 'PRESENTATION_AUTHORING_TOOL_STALE',
    details: {
      expected: {
        revision: 14,
        authoringProjectHash: 'workspace-presentation-authoring-project-v1:sha256-current',
      },
      received: {
        revision: 13,
        authoringProjectHash: 'workspace-presentation-authoring-project-v1:sha256-stale',
      },
    },
  });
  let { authority, session } = createSession({
    sessionId: 'stale-session',
    invoke: async () => { throw providerError; },
    getView: () => createView({
      revision: 14,
      snapshot: 'cv-show-authoring-snapshot-v1:sha256-stale-current',
      media: 'cv-show-authoring-media-collection-v1:sha256-stale-current',
    }),
  });
  let native = createNativeHarness();
  await createCvShowWebMcpAuthoring({
    authority,
    session,
    capability: capability('stale-session'),
    registerTool: native.registerTool,
    unregisterTools: native.unregisterTools,
  });

  let mutation = native.registrations.find(
    ({ key }) => key === 'presentation_authoring_cell_set_timing',
  );
  let response = await mutation.descriptor.execute({ id: 'command-1' });
  let envelope = decode(response);
  assert.equal(response.isError, true);
  assert.deepEqual(envelope, {
    schemaVersion: 'cv-show-webmcp-result-v1',
    status: 'error',
    toolName: 'presentation_authoring_cell_set_timing',
    sessionId: 'stale-session',
    error: {
      code: 'PRESENTATION_AUTHORING_TOOL_STALE',
      message: 'tool base is stale',
      details: providerError.details,
      currentBase: {
        revision: 14,
        authoringProjectHash: 'workspace-presentation-authoring-project-v1:sha256-current',
        snapshotIdentity: 'cv-show-authoring-snapshot-v1:sha256-stale-current',
      },
      currentIdentity: {
        schemaVersion: 'cv-show-authoring-view-identity-v1',
        snapshot: 'cv-show-authoring-snapshot-v1:sha256-stale-current',
        media: 'cv-show-authoring-media-collection-v1:sha256-stale-current',
      },
    },
  });
});

test('hostile error accessors are never read and fall back to bounded typed failures', async () => {
  for (let accessorKey of ['code', 'name', 'message', 'details']) {
    let hostile = hostileProviderError(accessorKey);
    let sessionId = `hostile-${accessorKey}-session`;
    let { authority, session, calls } = createSession({
      sessionId,
      invoke: async () => { throw hostile.error; },
    });
    let native = createNativeHarness();
    let lifecycle = await createCvShowWebMcpAuthoring({
      authority,
      session,
      capability: capability(sessionId),
      registerTool: native.registerTool,
      unregisterTools: native.unregisterTools,
    });
    let inspect = native.registrations.find(
      ({ key }) => key === 'presentation_authoring_inspect',
    );
    let response = await inspect.descriptor.execute({});
    let envelope = decode(response);

    assert.equal(response.isError, true);
    assert.equal(envelope.status, 'error');
    assert.match(envelope.error.code, /^(?:PRESENTATION_AUTHORING|CV_SHOW)_/u);
    assert.equal(typeof envelope.error.message, 'string');
    assert.equal(envelope.error.message.length <= 320, true);
    assert.equal(
      envelope.error.details === null || typeof envelope.error.details === 'object',
      true,
    );
    assert.equal(hostile.getterReads(), 0);
    assert.equal(calls.length, 1);
    assert.deepEqual(envelope.error.currentIdentity, createView().identity);
    await lifecycle.dispose();
  }
});

test('diagnostics drop opaque secrets and candidate snapshots but retain exact stale bases', async () => {
  let opaqueSecret = 'opaque-provider-value-c4fba809';
  let expected = {
    revision: 14,
    authoringProjectHash: 'workspace-presentation-authoring-project-v1:sha256-current',
  };
  let received = {
    revision: 13,
    authoringProjectHash: 'workspace-presentation-authoring-project-v1:sha256-stale',
  };
  let providerError = Object.assign(new Error('tool base is stale'), {
    code: 'PRESENTATION_AUTHORING_TOOL_STALE',
    details: {
      expected,
      received,
      candidateSnapshot: {
        project: { content: opaqueSecret },
        narration: opaqueSecret,
      },
      unclassifiedOpaqueValue: opaqueSecret,
    },
    unclassifiedOpaqueValue: opaqueSecret,
  });
  let { authority, session, calls } = createSession({
    sessionId: 'opaque-error-session',
    invoke: async () => { throw providerError; },
  });
  let native = createNativeHarness();
  let lifecycle = await createCvShowWebMcpAuthoring({
    authority,
    session,
    capability: capability('opaque-error-session'),
    registerTool: native.registerTool,
    unregisterTools: native.unregisterTools,
  });
  let inspect = native.registrations.find(
    ({ key }) => key === 'presentation_authoring_inspect',
  );
  let response = await inspect.descriptor.execute({});
  let serialized = response.content[0].text;
  let envelope = decode(response);

  assert.equal(response.isError, true);
  assert.equal(envelope.error.code, 'PRESENTATION_AUTHORING_TOOL_STALE');
  assert.equal(envelope.error.message, 'tool base is stale');
  assert.deepEqual(envelope.error.details, { expected, received });
  assert.equal(serialized.includes(opaqueSecret), false);
  assert.equal(serialized.includes('candidateSnapshot'), false);
  assert.equal(serialized.includes('unclassifiedOpaqueValue'), false);
  assert.equal(calls.length, 1);
  await lifecycle.dispose();
});

test('error diagnostics bound messages, detail strings, depth, and total output', async () => {
  let providerError = Object.assign(new Error(`failure ${'m'.repeat(5000)}`), {
    code: 'PRESENTATION_AUTHORING_COMMAND_INVERSE_UNAVAILABLE',
    details: {
      cause: `cause ${'d'.repeat(5000)}`,
      causeDetails: {
        causeDetails: {
          causeDetails: {
            causeDetails: { path: 'input.command' },
          },
        },
      },
    },
  });
  let { authority, session } = createSession({
    sessionId: 'bounded-error-session',
    invoke: async () => { throw providerError; },
  });
  let native = createNativeHarness();
  let lifecycle = await createCvShowWebMcpAuthoring({
    authority,
    session,
    capability: capability('bounded-error-session'),
    registerTool: native.registerTool,
    unregisterTools: native.unregisterTools,
  });
  let inspect = native.registrations.find(
    ({ key }) => key === 'presentation_authoring_inspect',
  );
  let response = await inspect.descriptor.execute({});
  let serialized = response.content[0].text;
  let envelope = decode(response);

  assert.equal(response.isError, true);
  assert.equal(envelope.error.message.length <= 320, true);
  assert.equal(serialized.length < 4096, true);
  assert.equal(serialized.includes('m'.repeat(321)), false);
  assert.equal(serialized.includes('d'.repeat(257)), false);
  await lifecycle.dispose();
});

test('serialized failures redact embedded credentials and absolute filesystem locations', async () => {
  let providerError = Object.assign(
    new Error(
      'failed file:///Users/alice/.ssh/id_rsa Authorization: Bearer topsecret',
    ),
    {
      code: 'PRESENTATION_AUTHORING_TOOL_STALE',
      details: {
        token: 'topsecret',
        uri: 'file:///Users/alice/private.txt',
        posixPath: '/Users/alice/private.txt',
        windowsPath: 'C:\\Users\\alice\\private.txt',
        digest: 'sha256:0123456789abcdef',
        docs: 'https://example.test/provider/errors/stale',
      },
    },
  );
  let { authority, session } = createSession({
    sessionId: 'private-error-session',
    invoke: async () => { throw providerError; },
    getView: () => createView({
      revision: 19,
      snapshot: 'cv-show-authoring-snapshot-v1:sha256-private-current',
      media: 'cv-show-authoring-media-collection-v1:sha256-private-current',
    }),
  });
  let native = createNativeHarness();
  await createCvShowWebMcpAuthoring({
    authority,
    session,
    capability: capability('private-error-session'),
    registerTool: native.registerTool,
    unregisterTools: native.unregisterTools,
  });

  let inspect = native.registrations.find(
    ({ key }) => key === 'presentation_authoring_inspect',
  );
  let nativeResponse = await inspect.descriptor.execute({});
  let serialized = nativeResponse.content[0].text;
  let envelope = decode(nativeResponse);
  assert.equal(nativeResponse.isError, true);
  assert.equal(serialized.includes('topsecret'), false);
  assert.equal(serialized.includes('/Users/'), false);
  assert.equal(serialized.includes('file://'), false);
  assert.equal(envelope.error.code, 'PRESENTATION_AUTHORING_TOOL_STALE');
  assert.equal(envelope.error.message, 'failed [redacted-path] [redacted-credential]');
  assert.deepEqual(envelope.error.details, {});
  assert.deepEqual(envelope.error.currentBase, {
    revision: 19,
    authoringProjectHash: 'workspace-presentation-authoring-project-v1:sha256-current',
    snapshotIdentity: 'cv-show-authoring-snapshot-v1:sha256-private-current',
  });
  assert.deepEqual(envelope.error.currentIdentity, {
    schemaVersion: 'cv-show-authoring-view-identity-v1',
    snapshot: 'cv-show-authoring-snapshot-v1:sha256-private-current',
    media: 'cv-show-authoring-media-collection-v1:sha256-private-current',
  });
});

test('serialized failures redact a single-component absolute POSIX path', async () => {
  let providerError = Object.assign(new Error('failed /private.txt'), {
    code: 'PRESENTATION_AUTHORING_TOOL_STALE',
    details: {
      rootPath: '/private.txt',
      relativeName: 'private.txt',
      digest: 'sha256:0123456789abcdef',
      docs: 'https://example.test/provider/errors/stale',
    },
  });
  let { authority, session } = createSession({
    sessionId: 'root-path-error-session',
    invoke: async () => { throw providerError; },
    getView: () => createView({
      revision: 20,
      snapshot: 'cv-show-authoring-snapshot-v1:sha256-root-current',
      media: 'cv-show-authoring-media-collection-v1:sha256-root-current',
    }),
  });
  let native = createNativeHarness();
  await createCvShowWebMcpAuthoring({
    authority,
    session,
    capability: capability('root-path-error-session'),
    registerTool: native.registerTool,
    unregisterTools: native.unregisterTools,
  });

  let inspect = native.registrations.find(
    ({ key }) => key === 'presentation_authoring_inspect',
  );
  let nativeResponse = await inspect.descriptor.execute({});
  let envelope = decode(nativeResponse);
  assert.equal(nativeResponse.content[0].text.includes('/private.txt'), false);
  assert.equal(envelope.error.message, 'failed [redacted-path]');
  assert.deepEqual(envelope.error.details, {});
  assert.deepEqual(envelope.error.currentBase, {
    revision: 20,
    authoringProjectHash: 'workspace-presentation-authoring-project-v1:sha256-current',
    snapshotIdentity: 'cv-show-authoring-snapshot-v1:sha256-root-current',
  });
  assert.deepEqual(envelope.error.currentIdentity, {
    schemaVersion: 'cv-show-authoring-view-identity-v1',
    snapshot: 'cv-show-authoring-snapshot-v1:sha256-root-current',
    media: 'cv-show-authoring-media-collection-v1:sha256-root-current',
  });
});

test('partial native registration aborts and removes the complete owner surface', async () => {
  let { authority, session } = createSession();
  let native = createNativeHarness({ failAt: 5 });
  let lifecycle = await createCvShowWebMcpAuthoring({
    authority,
    session,
    capability: capability(),
    registerTool: native.registerTool,
    unregisterTools: native.unregisterTools,
  });

  assert.equal(lifecycle.state.status, 'failed');
  assert.equal(lifecycle.state.error.code, 'CV_SHOW_WEBMCP_REGISTRATION_FAILED');
  assert.deepEqual(lifecycle.state.activeToolNames, []);
  assert.equal(lifecycle.signal.aborted, true);
  assert.equal(native.registrations.length, 6);
  assert.equal(native.unregisterCalls.length, 1);
});

test('dispose and pagehide abort before one unregister and stale callbacks stay unauthorized', async () => {
  let { authority, session, calls, detach } = createSession();
  let native = createNativeHarness();
  let pageTarget = new EventTarget();
  let lifecycle = await createCvShowWebMcpAuthoring({
    authority,
    session,
    capability: capability(),
    registerTool: native.registerTool,
    unregisterTools: native.unregisterTools,
    pageTarget,
  });
  lifecycle.signal.addEventListener('abort', () => native.events.push('abort'));
  let staleDescriptor = native.registrations[0].descriptor;

  detach();
  let detachedResponse = await staleDescriptor.execute({});
  let detachedEnvelope = decode(detachedResponse);
  assert.equal(detachedResponse.isError, true);
  assert.equal(detachedEnvelope.error.code, 'CV_SHOW_AUTHORING_UNAUTHORIZED');
  assert.equal(calls.length, 0);

  pageTarget.dispatchEvent(new Event('pagehide'));
  await Promise.resolve();
  await lifecycle.dispose();

  assert.deepEqual(native.events, ['abort', 'unregister']);
  assert.equal(native.unregisterCalls.length, 1);
  assert.equal(lifecycle.state.status, 'disposed');
  let response = await staleDescriptor.execute({});
  let envelope = decode(response);
  assert.equal(response.isError, true);
  assert.equal(envelope.status, 'error');
  assert.equal(envelope.error.code, 'CV_SHOW_AUTHORING_UNAUTHORIZED');
  assert.equal(envelope.error.currentBase, null);
  assert.equal(envelope.error.currentIdentity, null);
  assert.equal(calls.length, 0);
});
