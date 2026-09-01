import assert from 'node:assert/strict';
import test from 'node:test';
import { createPresentationAuthoringProject } from 'symbiote-workspace';
import { computeIntegrity } from 'symbiote-workspace/schema/canonical-json.js';
import {
  createCvShowAuthoringAuthority,
  normalizeCvShowAuthoringSnapshot,
} from '../../src/static-pages/js/tour-player/cvShowAuthoringAuthority.js';
import { CV_SHOW_PRESENTATION_PROJECT } from '../../src/static-pages/data/cvShowPresentationProject.js';

function base(project) {
  return Object.freeze({
    revision: project.revision,
    authoringProjectHash: project.hash,
  });
}

const LOCAL_CAPABILITY = Object.freeze({
  local: true,
  authorized: true,
  sessionId: 'test-session',
});

function snapshotIdentity(snapshot) {
  return `cv-show-authoring-snapshot-v1:${computeIntegrity(snapshot)}`;
}

function throwIfAborted(signal) {
  if (signal?.aborted) throw signal.reason || new DOMException('Aborted', 'AbortError');
}

function createHostTransport(initialSnapshot, {
  transformSnapshot = (value) => value,
  handshakeSessionId = LOCAL_CAPABILITY.sessionId,
} = {}) {
  let snapshot = structuredClone(initialSnapshot);
  const calls = { handshake: 0, load: 0, transact: 0 };
  return {
    calls,
    get snapshot() { return structuredClone(snapshot); },
    async handshake({ capability, seedBase }, { signal } = {}) {
      throwIfAborted(signal);
      calls.handshake += 1;
      assert.deepEqual(capability, LOCAL_CAPABILITY);
      assert.deepEqual(seedBase, base(CV_SHOW_PRESENTATION_PROJECT));
      return Object.freeze({
        schemaVersion: 'cv-show-authoring-handshake-receipt-v1',
        status: 'authorized',
        sessionId: handshakeSessionId,
      });
    },
    async load({ sessionId }, { signal } = {}) {
      throwIfAborted(signal);
      calls.load += 1;
      assert.equal(sessionId, 'test-session');
      return Object.freeze({
        schemaVersion: 'cv-show-authoring-load-receipt-v1',
        status: 'loaded',
        snapshot: structuredClone(snapshot),
        dirty: false,
        materialized: false,
      });
    },
    async transact({
      sessionId,
      base: requestedBase,
      candidateSnapshotIdentity,
      snapshot: candidate,
    }, { signal } = {}) {
      throwIfAborted(signal);
      calls.transact += 1;
      assert.equal(sessionId, 'test-session');
      if (
        requestedBase.revision !== snapshot.project.revision
        || requestedBase.authoringProjectHash !== snapshot.project.hash
        || requestedBase.snapshotIdentity !== undefined
          && requestedBase.snapshotIdentity !== snapshotIdentity(snapshot)
      ) {
        throw Object.assign(new Error('host compare-and-swap rejected stale base'), {
          code: 'CV_SHOW_AUTHORING_STALE',
        });
      }
      if (candidateSnapshotIdentity !== undefined) {
        assert.equal(candidateSnapshotIdentity, snapshotIdentity(candidate));
      }
      snapshot = structuredClone(transformSnapshot(candidate));
      return Object.freeze({
        schemaVersion: 'cv-show-authoring-commit-receipt-v1',
        status: 'committed',
        commitId: `test-commit-${calls.transact}`,
        candidateSnapshotIdentity: candidateSnapshotIdentity || snapshotIdentity(candidate),
        snapshotIdentity: snapshotIdentity(snapshot),
        snapshot: structuredClone(snapshot),
        dirty: true,
        materialized: false,
      });
    },
  };
}

function unavailableRegeneration() {
  throw Object.assign(new Error('regeneration unavailable in authority unit test'), {
    code: 'CV_SHOW_REGENERATION_UNAVAILABLE',
  });
}

function acceptedRegenerationReceipt(authority, receiptId, entryId, dependency) {
  const snapshot = authority.read();
  const entry = snapshot.mediaCollection.entries.find((value) => value.entryId === entryId);
  const artifactScope = {
    collectionId: snapshot.mediaCollection.collectionId,
    manifestHash: snapshot.mediaCollection.manifestHash,
    entryId,
    narrationCellId: entry.narrationCellId,
  };
  const key = dependency === 'narration-audio' ? 'audio' : dependency;
  const predecessors = dependency === 'narration-audio'
    ? {}
    : dependency === 'alignment'
      ? { narrationAudioHash: entry.mediaAncestry.audio.hash }
      : {
          narrationAudioHash: entry.mediaAncestry.audio.hash,
          alignmentHash: entry.mediaAncestry.alignment.hash,
        };
  const requestVersion = 'workspace-presentation-regeneration-request-v2';
  const request = {
    schemaVersion: requestVersion,
    id: `${receiptId}:request`,
    base: base(snapshot.project),
    artifactScope,
    dependency,
    narrationHash: entry.mediaAncestry.narrationHash,
    predecessors,
  };
  const receiptVersion = 'workspace-presentation-regeneration-receipt-v2';
  const receipt = {
    schemaVersion: receiptVersion,
    receiptId,
    requestId: request.id,
    requestHash: `${requestVersion}:${computeIntegrity(request)}`,
    status: 'accepted',
    base: request.base,
    artifactScope,
    dependency,
    narrationHash: request.narrationHash,
    predecessors,
    artifactHash: entry.mediaAncestry[key].hash,
  };
  return Object.freeze({
    ...receipt,
    hash: `${receiptVersion}:${computeIntegrity(receipt)}`,
  });
}

function regenerationAdapter(authority) {
  return {
    request: unavailableRegeneration,
    inspect(receiptId) {
      const [entryId, dependency] = receiptId.split('|');
      return acceptedRegenerationReceipt(authority, receiptId, entryId, dependency);
    },
  };
}

function artifactScope(authority, entryId) {
  const collection = authority.read().mediaCollection;
  const entry = collection.entries.find((value) => value.entryId === entryId);
  return Object.freeze({
    collectionId: collection.collectionId,
    manifestHash: collection.manifestHash,
    entryId,
    narrationCellId: entry.narrationCellId,
  });
}

async function acceptRegeneration(authority, session, entryId, dependency) {
  return session.invoke('presentation_authoring_regeneration_inspect', {
    receiptId: `${entryId}|${dependency}`,
    base: base(authority.view.project),
    artifactScope: artifactScope(authority, entryId),
  });
}

async function enable(authority, transport, regeneration = null) {
  await authority.enableLocal({
    capability: LOCAL_CAPABILITY,
    transport,
    regeneration: regeneration || {
      request: unavailableRegeneration,
      inspect: unavailableRegeneration,
    },
  });
  return authority.mutationSession;
}

function timingCommand(authority, id = 'test-timing') {
  const project = authority.getView().project;
  const cell = project.cells.find(({ id: cellId }) => (
    cellId === 'cv-show:cue:positioning.tenure-marker'
  ));
  return Object.freeze({
    id,
    base: base(project),
    payload: {
      cellId: cell.id,
      timing: { ...structuredClone(cell.timing), leadMs: cell.timing.leadMs + 1 },
    },
  });
}

function afterHostTransact(transport, resolveReceipt) {
  const transact = transport.transact.bind(transport);
  transport.transact = async (...args) => resolveReceipt(await transact(...args));
  return transport;
}

async function assertCommitOutcomeUnknown({
  authority,
  session,
  transport,
  replicaBefore,
  result,
  causeCode,
  retryId,
}) {
  assert.deepEqual(Object.keys(result), ['authorityReceipt']);
  assert.equal(result.authorityReceipt.status, 'commit-outcome-unknown');
  assert.deepEqual(
    Object.keys(result.authorityReceipt),
    ['schemaVersion', 'status', 'base', 'host', 'replica'],
  );
  assert.deepEqual(result.authorityReceipt.host, { status: 'unknown' });
  assert.equal(Object.hasOwn(result.authorityReceipt, 'commitId'), false);
  assert.equal(result.authorityReceipt.replica.status, 'blocked');
  assert.equal(result.authorityReceipt.replica.warning.code, 'CV_SHOW_AUTHORING_COMMIT_OUTCOME_UNKNOWN');
  assert.equal(result.authorityReceipt.replica.warning.causeCode, causeCode);
  assert.deepEqual(result.authorityReceipt.base, {
    ...replicaBefore.base,
    snapshotIdentity: replicaBefore.identity.snapshot,
  });
  assert.deepEqual(result.authorityReceipt.replica.base, replicaBefore.base);
  assert.deepEqual(result.authorityReceipt.replica.identity, replicaBefore.identity);
  assert.equal(result.project, undefined);
  assert.equal(result.timeline, undefined);
  assert.equal(result.schedule, undefined);
  assert.equal(result.nle, undefined);
  assert.equal(result.mediaDisposition, undefined);
  assert.equal(result.cvMediaDisposition, undefined);
  assert.equal(authority.lifecycle.state, 'blocked');
  assert.equal(authority.mutationSession, null);
  assert.equal(authority.view, replicaBefore);
  assert.equal(transport.calls.transact, 1);

  await assert.rejects(
    session.invoke(
      'presentation_authoring_cell_set_timing',
      timingCommand(authority, retryId),
    ),
    (error) => error.code === 'CV_SHOW_AUTHORING_BLOCKED',
  );
  assert.equal(transport.calls.transact, 1);
}

test('public authority is immutable seed-readonly and exposes no mutation session', async () => {
  const authority = createCvShowAuthoringAuthority();
  const view = authority.getView();
  assert.equal(authority.lifecycle.state, 'seed-readonly');
  assert.equal(authority.mutationSession, null);
  assert.equal(authority.view, view);
  assert.equal(view.project.hash, CV_SHOW_PRESENTATION_PROJECT.hash);
  assert.equal(view.story.scenes.length, 16);
  assert.equal(Object.keys(view.story.branches).length, 14);
  assert.equal(Object.keys(view.mediaRegistry.entries).length, 30);
  assert.equal(Object.values(view.mediaRegistry.entries).every(({ playable }) => playable), true);
  assert.equal(Object.isFrozen(authority.read()), true);
  assert.equal(Object.isFrozen(view), true);
  assert.throws(() => { view.project.revision = 99; }, TypeError);
  await assert.rejects(
    authority.enableLocal({ capability: null, transport: {} }),
    (error) => error.code === 'CV_SHOW_AUTHORING_UNAUTHORIZED',
  );
  assert.equal(authority.lifecycle.state, 'seed-readonly');
});

test('local capability is exact and the handshake cannot switch its session identity', async () => {
  let accessorReads = 0;
  const accessorCapability = { local: true, authorized: true };
  Object.defineProperty(accessorCapability, 'sessionId', {
    enumerable: true,
    get() {
      accessorReads += 1;
      return LOCAL_CAPABILITY.sessionId;
    },
  });
  Object.freeze(accessorCapability);
  const nonEnumerableCapability = { ...LOCAL_CAPABILITY };
  Object.defineProperty(nonEnumerableCapability, 'sessionId', {
    value: LOCAL_CAPABILITY.sessionId,
    enumerable: false,
  });
  Object.freeze(nonEnumerableCapability);
  const invalidCapabilities = [
    'test-session',
    { local: true, authorized: true },
    { local: true, authorized: false, sessionId: 'test-session' },
    { local: true, authorized: true, sessionId: '' },
    { local: true, authorized: true, sessionId: '   ' },
    { local: true, authorized: true, sessionId: { toString: () => 'test-session' } },
    { ...LOCAL_CAPABILITY },
    Object.freeze({ ...LOCAL_CAPABILITY, extra: true }),
    Object.freeze(Object.assign(Object.create({ inherited: true }), LOCAL_CAPABILITY)),
    Object.freeze(Object.assign({ ...LOCAL_CAPABILITY }, { [Symbol('extra')]: true })),
    accessorCapability,
    nonEnumerableCapability,
    new Proxy(LOCAL_CAPABILITY, {}),
  ];
  for (const capability of invalidCapabilities) {
    const authority = createCvShowAuthoringAuthority();
    const transport = createHostTransport(authority.read());
    await assert.rejects(
      authority.enableLocal({ capability, transport }),
      (error) => error.code === 'CV_SHOW_AUTHORING_UNAUTHORIZED',
    );
    assert.equal(transport.calls.load, 0);
    assert.equal(authority.lifecycle.state, 'seed-readonly');
  }
  assert.equal(accessorReads, 0);

  const authority = createCvShowAuthoringAuthority();
  const transport = createHostTransport(authority.read(), {
    handshakeSessionId: 'different-session',
  });
  await assert.rejects(
    authority.enableLocal({ capability: LOCAL_CAPABILITY, transport }),
    (error) => error.code === 'CV_SHOW_AUTHORING_UNAUTHORIZED',
  );
  assert.equal(transport.calls.load, 0);
  assert.equal(authority.lifecycle.state, 'seed-readonly');
});

test('enable loads one exact host snapshot and derives the same 30-turn live view', async () => {
  const seed = createCvShowAuthoringAuthority();
  const transport = createHostTransport(seed.read());
  const authority = createCvShowAuthoringAuthority();
  const session = await enable(authority, transport);
  assert.ok(session);
  assert.equal(authority.lifecycle.state, 'local-ready');
  assert.equal(authority.lifecycle.dirty, false);
  assert.deepEqual(transport.calls, { handshake: 1, load: 1, transact: 0 });
  const view = authority.getView();
  assert.deepEqual(view.base, base(view.project));
  assert.equal(view.timeline.turns.length, 30);
  assert.equal(Object.keys(view.mediaRegistry.entries).length, 30);
  assert.equal(view.playable, true);
});

test('media collection normalization returns one exact canonical schema before provider use', async () => {
  const seed = createCvShowAuthoringAuthority();
  const persisted = structuredClone(seed.read());
  persisted.mediaCollection = {
    entries: persisted.mediaCollection.entries.map((entry) => ({
      mediaAncestry: {
        playable: entry.mediaAncestry.playable,
        render: {
          status: entry.mediaAncestry.render.status,
          hash: entry.mediaAncestry.render.hash,
        },
        alignment: {
          status: entry.mediaAncestry.alignment.status,
          hash: entry.mediaAncestry.alignment.hash,
        },
        audio: {
          status: entry.mediaAncestry.audio.status,
          hash: entry.mediaAncestry.audio.hash,
        },
        narrationHash: entry.mediaAncestry.narrationHash,
        schemaVersion: entry.mediaAncestry.schemaVersion,
      },
      narrationCellId: entry.narrationCellId,
      entryId: entry.entryId,
    })),
    manifestHash: persisted.mediaCollection.manifestHash,
    collectionId: persisted.mediaCollection.collectionId,
    schemaVersion: persisted.mediaCollection.schemaVersion,
  };

  const normalized = normalizeCvShowAuthoringSnapshot(persisted);
  const entry = normalized.mediaCollection.entries[0];
  assert.deepEqual(
    Object.keys(normalized.mediaCollection),
    ['schemaVersion', 'collectionId', 'manifestHash', 'entries'],
  );
  assert.deepEqual(Object.keys(entry), ['entryId', 'narrationCellId', 'mediaAncestry']);
  assert.deepEqual(
    Object.keys(entry.mediaAncestry),
    ['schemaVersion', 'narrationHash', 'audio', 'alignment', 'render', 'playable'],
  );
  assert.deepEqual(Object.keys(entry.mediaAncestry.audio), ['hash', 'status']);
  assert.equal(Object.isFrozen(normalized.mediaCollection), true);
  assert.notEqual(normalized.mediaCollection, persisted.mediaCollection);

  const authority = createCvShowAuthoringAuthority();
  const transport = createHostTransport(persisted);
  const session = await enable(authority, transport);
  const result = await session.invoke(
    'presentation_authoring_cell_set_timing',
    timingCommand(authority, 'test-canonical-media-collection'),
  );
  assert.equal(result.authorityReceipt.status, 'committed');
  assert.equal(authority.lifecycle.state, 'local-ready');
  assert.equal(transport.calls.transact, 1);
});

test('unknown persisted media collection fields fail closed before local-ready', async () => {
  const cases = [
    ['collection', (collection) => { collection.unexpected = true; }],
    ['entry', (collection) => { collection.entries[0].unexpected = true; }],
    ['ancestry', (collection) => {
      collection.entries[0].mediaAncestry.unexpected = true;
    }],
    ['artifact', (collection) => {
      collection.entries[0].mediaAncestry.audio.unexpected = true;
    }],
  ];
  for (const [scope, addUnknownField] of cases) {
    const seed = createCvShowAuthoringAuthority();
    const persisted = structuredClone(seed.read());
    addUnknownField(persisted.mediaCollection);
    assert.throws(
      () => normalizeCvShowAuthoringSnapshot(persisted),
      (error) => error.code === 'CV_SHOW_AUTHORING_SNAPSHOT_INVALID',
      `${scope} unknown field must fail the shared validator`,
    );

    const authority = createCvShowAuthoringAuthority();
    const transport = createHostTransport(persisted);
    await assert.rejects(
      enable(authority, transport),
      (error) => error.code === 'CV_SHOW_AUTHORING_SNAPSHOT_INVALID',
      `${scope} unknown field must fail the authority load`,
    );
    assert.equal(authority.lifecycle.state, 'blocked');
    assert.equal(transport.calls.transact, 0);
  }
});

test('reload enables from the exact persisted host revision without falling back to the seed', async () => {
  const first = createCvShowAuthoringAuthority();
  const firstTransport = createHostTransport(first.read());
  const firstSession = await enable(first, firstTransport);
  const seedRevision = first.view.base.revision;
  await firstSession.invoke(
    'presentation_authoring_cell_set_timing',
    timingCommand(first, 'test-persisted-timing'),
  );
  assert.equal(first.view.base.revision, seedRevision + 1);

  const reloaded = createCvShowAuthoringAuthority();
  const reloadTransport = createHostTransport(firstTransport.snapshot);
  const observed = [];
  reloaded.subscribe((view) => observed.push(view.base));
  await enable(reloaded, reloadTransport);
  assert.deepEqual(reloaded.view.base, first.view.base);
  assert.deepEqual(observed, [first.view.base]);
  assert.deepEqual(reloaded.view.story, first.view.story);
  assert.equal(reloaded.view.timeline.turns.length, 30);
  assert.equal(Object.keys(reloaded.view.mediaRegistry.entries).length, 30);
});

test('same-base commands serialize to one provider update, one host CAS, one event, and one typed stale', async () => {
  const authority = createCvShowAuthoringAuthority();
  const transport = createHostTransport(authority.read());
  const session = await enable(authority, transport);
  const seedRevision = authority.view.base.revision;
  const command = timingCommand(authority);
  const revisions = [];
  authority.subscribe((view) => revisions.push(view.base.revision));
  const outcomes = await Promise.allSettled([
    session.invoke('presentation_authoring_cell_set_timing', command),
    session.invoke('presentation_authoring_cell_set_timing', {
      ...command,
      id: 'test-timing-stale',
    }),
  ]);
  assert.equal(outcomes.filter(({ status }) => status === 'fulfilled').length, 1);
  const rejected = outcomes.find(({ status }) => status === 'rejected');
  const fulfilled = outcomes.find(({ status }) => status === 'fulfilled');
  assert.equal(rejected.reason.code, 'CV_SHOW_AUTHORING_STALE');
  assert.equal(fulfilled.value.authorityReceipt.status, 'committed');
  assert.equal(
    fulfilled.value.authorityReceipt.currentIdentity.snapshot,
    authority.view.identity.snapshot,
  );
  assert.equal(authority.getView().base.revision, seedRevision + 1);
  assert.equal(transport.calls.transact, 1);
  assert.deepEqual(revisions, [seedRevision + 1]);
  assert.equal(authority.lifecycle.state, 'local-ready');
  assert.equal(authority.lifecycle.dirty, true);
});

test('exact snapshot no-op is typed and never reaches host CAS', async () => {
  let providerUpdateCount = 0;
  const authority = createCvShowAuthoringAuthority({
    createToolPack({ authority: providerAuthority }) {
      return Object.freeze({
        tools: Object.freeze([]),
        invoke() {
          return providerAuthority.transact({ base: providerAuthority.view.base }, (current) => {
            providerUpdateCount += 1;
            return current;
          });
        },
      });
    },
  });
  const transport = createHostTransport(authority.read());
  const session = await enable(authority, transport);
  await assert.rejects(
    session.invoke('test-exact-noop'),
    (error) => error.code === 'CV_SHOW_AUTHORING_TRANSACTION_NOOP',
  );
  assert.equal(providerUpdateCount, 1);
  assert.equal(transport.calls.transact, 0);
  assert.equal(authority.lifecycle.state, 'local-ready');
});

test('same-Project regeneration commits one media identity and restores playability only with exact binding evidence', async () => {
  const seed = createCvShowAuthoringAuthority();
  const persisted = structuredClone(seed.read());
  const target = persisted.mediaCollection.entries.find(({ entryId }) => entryId === 'positioning');
  target.mediaAncestry.render.status = 'stale';
  target.mediaAncestry.playable = false;
  const authority = createCvShowAuthoringAuthority();
  const transport = createHostTransport(persisted);
  const session = await enable(authority, transport, regenerationAdapter(authority));
  const projectBase = authority.view.base;
  const initialIdentity = authority.view.identity;
  assert.equal(authority.view.mediaRegistry.entries.positioning.playable, false);
  assert.equal(
    authority.view.mediaRegistry.entries.positioning.admission.code,
    'CV_SHOW_MEDIA_REGENERATION_REQUIRED',
  );
  const observed = [];
  authority.subscribe((view) => observed.push(view.identity.snapshot));

  const result = await acceptRegeneration(authority, session, 'positioning', 'render');
  assert.deepEqual(authority.view.base, projectBase);
  assert.notEqual(authority.view.identity.snapshot, initialIdentity.snapshot);
  assert.notEqual(authority.view.identity.media, initialIdentity.media);
  assert.deepEqual(observed, [authority.view.identity.snapshot]);
  assert.equal(transport.calls.transact, 1);
  assert.equal(result.authorityReceipt.status, 'committed');
  assert.equal(result.cvMediaDisposition.status, 'restored');
  assert.deepEqual(result.cvMediaDisposition.restoredEntryIds, ['positioning']);
  assert.equal(authority.view.mediaRegistry.entries.positioning.playable, true);
  assert.equal(
    authority.view.mediaRegistry.entries.positioning.admission.code,
    'CV_SHOW_MEDIA_RUNTIME_BINDING_READY',
  );
});

test('a divergent host snapshot has an unknown terminal outcome without projections', async () => {
  const authority = createCvShowAuthoringAuthority();
  const transport = createHostTransport(authority.read(), {
    transformSnapshot(candidate) {
      const projectInput = structuredClone(candidate.project);
      delete projectInput.hash;
      const cell = projectInput.cells.find(({ id }) => (
        id === 'cv-show:cue:positioning.tenure-marker'
      ));
      cell.timing.leadMs += 1;
      return { ...candidate, project: createPresentationAuthoringProject(projectInput) };
    },
  });
  const session = await enable(authority, transport);
  const replicaBefore = authority.view;
  const result = await session.invoke(
    'presentation_authoring_cell_set_timing',
    timingCommand(authority, 'test-host-returned-project'),
  );
  await assertCommitOutcomeUnknown({
    authority,
    session,
    transport,
    replicaBefore,
    result,
    causeCode: 'CV_SHOW_AUTHORING_COMMITTED_DIVERGENT',
    retryId: 'test-host-returned-project-no-retry',
  });
});

test('an invalid host snapshot has an unknown terminal outcome without candidate state', async () => {
  const authority = createCvShowAuthoringAuthority();
  const transport = createHostTransport(authority.read(), {
    transformSnapshot(candidate) {
      return {
        project: { schemaVersion: 'invalid-committed-project' },
        mediaCollection: candidate.mediaCollection,
      };
    },
  });
  const session = await enable(authority, transport);
  const replicaBefore = authority.view;
  const result = await session.invoke(
    'presentation_authoring_cell_set_timing',
    timingCommand(authority, 'test-host-unverifiable-snapshot'),
  );
  await assertCommitOutcomeUnknown({
    authority,
    session,
    transport,
    replicaBefore,
    result,
    causeCode: 'PRESENTATION_AUTHORING_PROJECT_INVALID',
    retryId: 'test-host-unverifiable-no-retry',
  });
});

test('a transport rejection after host mutation has an unknown terminal commit outcome', async () => {
  const authority = createCvShowAuthoringAuthority();
  const transport = afterHostTransact(createHostTransport(authority.read()), () => {
    throw Object.assign(new Error('host committed but its response was lost'), {
      code: 'HOST_COMMIT_RESPONSE_LOST',
    });
  });
  const session = await enable(authority, transport);
  const replicaBefore = authority.view;
  const result = await session.invoke(
    'presentation_authoring_cell_set_timing',
    timingCommand(authority, 'test-host-response-lost'),
  );

  assert.notEqual(snapshotIdentity(transport.snapshot), replicaBefore.identity.snapshot);
  await assertCommitOutcomeUnknown({
    authority,
    session,
    transport,
    replicaBefore,
    result,
    causeCode: 'HOST_COMMIT_RESPONSE_LOST',
    retryId: 'test-host-response-lost-no-retry',
  });
});

test('a malformed receipt after host mutation has an unknown terminal commit outcome', async () => {
  const authority = createCvShowAuthoringAuthority();
  const transport = afterHostTransact(createHostTransport(authority.read()), () => ({
    schemaVersion: 'cv-show-authoring-commit-receipt-v1',
    status: 'committed',
  }));
  const session = await enable(authority, transport);
  const replicaBefore = authority.view;
  const result = await session.invoke(
    'presentation_authoring_cell_set_timing',
    timingCommand(authority, 'test-host-malformed-receipt'),
  );

  assert.notEqual(snapshotIdentity(transport.snapshot), replicaBefore.identity.snapshot);
  await assertCommitOutcomeUnknown({
    authority,
    session,
    transport,
    replicaBefore,
    result,
    causeCode: 'CV_SHOW_AUTHORING_COMMIT_INVALID',
    retryId: 'test-host-malformed-receipt-no-retry',
  });
});

test('an AbortError after host mutation has an unknown terminal commit outcome', async () => {
  const authority = createCvShowAuthoringAuthority();
  const transport = afterHostTransact(createHostTransport(authority.read()), () => {
    throw new DOMException('host response aborted after invocation', 'AbortError');
  });
  const session = await enable(authority, transport);
  const replicaBefore = authority.view;
  const result = await session.invoke(
    'presentation_authoring_cell_set_timing',
    timingCommand(authority, 'test-host-aborted-response'),
  );

  assert.notEqual(snapshotIdentity(transport.snapshot), replicaBefore.identity.snapshot);
  await assertCommitOutcomeUnknown({
    authority,
    session,
    transport,
    replicaBefore,
    result,
    causeCode: 'AbortError',
    retryId: 'test-host-aborted-response-no-retry',
  });
});

test('an AbortSignal after a returned host receipt has an unknown terminal outcome', async () => {
  const authority = createCvShowAuthoringAuthority();
  const controller = new AbortController();
  const transport = afterHostTransact(createHostTransport(authority.read()), (receipt) => {
    controller.abort(new DOMException('aborted after host response', 'AbortError'));
    return receipt;
  });
  const session = await enable(authority, transport);
  const replicaBefore = authority.view;
  const result = await session.invoke(
    'presentation_authoring_cell_set_timing',
    timingCommand(authority, 'test-host-post-return-abort'),
    { signal: controller.signal },
  );

  await assertCommitOutcomeUnknown({
    authority,
    session,
    transport,
    replicaBefore,
    result,
    causeCode: 'AbortError',
    retryId: 'test-host-post-return-abort-no-retry',
  });
});

test('hostile commit receipt fields become terminal unknown without leaking host data', async (t) => {
  const privatePath = '/private/audit-commit-sentinel';
  let accessorReads = 0;
  const cases = [
    {
      name: 'object commitId',
      transform(receipt) {
        return { ...receipt, commitId: { localPath: privatePath } };
      },
    },
    {
      name: 'unknown path field',
      transform(receipt) {
        return { ...receipt, localPath: privatePath };
      },
    },
    {
      name: 'symbol field',
      transform(receipt) {
        return { ...receipt, [Symbol('private-path')]: privatePath };
      },
    },
    {
      name: 'non-enumerable field',
      transform(receipt) {
        const value = { ...receipt };
        Object.defineProperty(value, 'dirty', {
          value: receipt.dirty,
          enumerable: false,
          configurable: true,
        });
        return value;
      },
    },
    {
      name: 'accessor field',
      transform(receipt) {
        const value = { ...receipt };
        Object.defineProperty(value, 'commitId', {
          enumerable: true,
          configurable: true,
          get() {
            accessorReads += 1;
            return receipt.commitId;
          },
        });
        return value;
      },
    },
    {
      name: 'transparent Proxy',
      transform(receipt) {
        return new Proxy(receipt, {});
      },
    },
  ];

  for (const hostileCase of cases) {
    await t.test(hostileCase.name, async () => {
      const authority = createCvShowAuthoringAuthority();
      const transport = afterHostTransact(
        createHostTransport(authority.read()),
        hostileCase.transform,
      );
      const session = await enable(authority, transport);
      const replicaBefore = authority.view;
      const result = await session.invoke(
        'presentation_authoring_cell_set_timing',
        timingCommand(authority, `test-hostile-receipt-${hostileCase.name}`),
      );

      assert.notEqual(snapshotIdentity(transport.snapshot), replicaBefore.identity.snapshot);
      await assertCommitOutcomeUnknown({
        authority,
        session,
        transport,
        replicaBefore,
        result,
        causeCode: 'CV_SHOW_AUTHORING_COMMIT_INVALID',
        retryId: `test-hostile-receipt-${hostileCase.name}-no-retry`,
      });
      assert.equal(JSON.stringify({ result, lifecycle: authority.lifecycle }).includes(privatePath), false);
    });
  }
  assert.equal(accessorReads, 0);
});

test('hostile transport error codes are reduced to a safe terminal diagnostic', async () => {
  const privateCode = `/private/audit-error-sentinel token=sk-${'x'.repeat(128)}`;
  const authority = createCvShowAuthoringAuthority();
  const transport = afterHostTransact(createHostTransport(authority.read()), () => {
    throw Object.assign(new Error(`host response contained ${privateCode}`), {
      code: privateCode,
    });
  });
  const session = await enable(authority, transport);
  const replicaBefore = authority.view;
  const result = await session.invoke(
    'presentation_authoring_cell_set_timing',
    timingCommand(authority, 'test-host-private-error-code'),
  );

  await assertCommitOutcomeUnknown({
    authority,
    session,
    transport,
    replicaBefore,
    result,
    causeCode: 'Error',
    retryId: 'test-host-private-error-code-no-retry',
  });
  const exposed = JSON.stringify({ result, lifecycle: authority.lifecycle });
  assert.equal(exposed.includes('/private/audit-error-sentinel'), false);
  assert.equal(exposed.includes('token=sk-'), false);
});

test('hostile error accessors are not executed before the authority blocks', async () => {
  const authority = createCvShowAuthoringAuthority();
  let accessorReads = 0;
  const hostileError = Object.create(Error.prototype);
  for (const field of ['code', 'name']) {
    Object.defineProperty(hostileError, field, {
      enumerable: true,
      get() {
        accessorReads += 1;
        throw new Error(`/private/error-${field}-getter`);
      },
    });
  }
  const transport = afterHostTransact(createHostTransport(authority.read()), () => {
    throw hostileError;
  });
  const session = await enable(authority, transport);
  const replicaBefore = authority.view;
  const result = await session.invoke(
    'presentation_authoring_cell_set_timing',
    timingCommand(authority, 'test-host-error-accessors'),
  );

  await assertCommitOutcomeUnknown({
    authority,
    session,
    transport,
    replicaBefore,
    result,
    causeCode: 'Error',
    retryId: 'test-host-error-accessors-no-retry',
  });
  assert.equal(accessorReads, 0);
  const exposed = JSON.stringify({ result, lifecycle: authority.lifecycle });
  assert.equal(exposed.includes('/private/error-'), false);
});

test('narration mutation invalidates only its clip and topology-invalid candidates reject atomically', async () => {
  const authority = createCvShowAuthoringAuthority();
  const transport = createHostTransport(authority.read());
  const session = await enable(authority, transport, regenerationAdapter(authority));
  const project = authority.getView().project;
  const narration = project.cells.find(({ id }) => id === 'cv-show:narration:positioning');
  const result = await session.invoke('presentation_authoring_cell_set_content', {
    id: 'test-narration',
    base: base(project),
    payload: {
      cellId: narration.id,
      content: { ...structuredClone(narration.turn), text: `${narration.turn.text} Тест.` },
    },
  });
  assert.equal(result.cvMediaDisposition.status, 'invalidated');
  assert.deepEqual(result.cvMediaDisposition.affectedEntryIds, ['positioning']);
  assert.equal(authority.view.mediaRegistry.entries.positioning.playable, false);
  assert.equal(authority.view.mediaRegistry.entries['symbiote-workspace'].playable, true);
  assert.equal(transport.calls.transact, 1);

  for (const dependency of ['narration-audio', 'alignment', 'render']) {
    await acceptRegeneration(authority, session, 'positioning', dependency);
  }
  const regenerated = authority.read().mediaCollection.entries
    .find(({ entryId }) => entryId === 'positioning').mediaAncestry;
  assert.equal(regenerated.playable, true, 'provider ancestry has all three accepted hashes');
  assert.equal(authority.view.mediaRegistry.entries.positioning.playable, true);
  assert.equal(
    authority.view.mediaRegistry.entries.positioning.admission.code,
    'CV_SHOW_MEDIA_RUNTIME_BINDING_READY',
  );

  const invalidBase = authority.view.base;
  const sourceCell = authority.view.project.cells.find(({ id }) => (
    id === 'cv-show:cue:positioning.tenure-marker'
  ));
  await assert.rejects(
    session.invoke('presentation_authoring_cell_add', {
      id: 'test-structural-add',
      base: invalidBase,
      payload: {
        cell: { ...structuredClone(sourceCell), id: 'cv-show:cue:positioning.unsupported' },
        index: authority.view.project.cells.indexOf(sourceCell) + 1,
      },
    }),
    (error) => error.code === 'CV_SHOW_PRESENTATION_PROJECT_INVALID',
  );
  assert.equal(authority.view.base.revision, invalidBase.revision);
  assert.equal(authority.view.base.authoringProjectHash, invalidBase.authoringProjectHash);
  assert.equal(transport.calls.transact, 4, 'invalid candidate must not reach host CAS');
});

test('local CV cue batch adds a complete attention group and directive metadata atomically', async () => {
  const authority = createCvShowAuthoringAuthority();
  const transport = createHostTransport(authority.read());
  const session = await enable(authority, transport);
  const project = authority.view.project;
  const sourceAttention = project.cells.filter((cell) => (
    cell.kind === 'cue'
    && cell.turnId === 'positioning'
    && !cell.id.endsWith(':scroll')
    && cell.timing.at.anchor === 'speech'
  )).at(-1);
  const sourceScroll = project.cells.find(({ id }) => (
    id === `${sourceAttention.id}:scroll`
  ));
  const attentionId = 'cv-show:cue:positioning.atomic-extra';
  const scrollId = `${attentionId}:scroll`;
  const insertIndex = project.cells.indexOf(sourceAttention) + 1;
  const currentBase = base(project);
  const result = await session.invoke('presentation_authoring_cv_show_cue_batch', {
    id: 'test-add-complete-attention-group',
    base: currentBase,
    payload: {
      commands: [
        {
          schemaVersion: 'workspace-presentation-authoring-command-v1',
          id: 'test-add-complete-attention-scroll',
          base: currentBase,
          type: 'cell.add',
          payload: {
            cell: {
              ...structuredClone(sourceScroll),
              id: scrollId,
              dependsOn: [{ cellId: sourceAttention.id, barrier: 'settled' }],
            },
            index: insertIndex,
          },
        },
        {
          schemaVersion: 'workspace-presentation-authoring-command-v1',
          id: 'test-add-complete-attention-cue',
          base: currentBase,
          type: 'cell.add',
          payload: {
            cell: {
              ...structuredClone(sourceAttention),
              id: attentionId,
              dependsOn: [{ cellId: scrollId, barrier: 'settled' }],
            },
            index: insertIndex + 1,
          },
        },
        {
          schemaVersion: 'workspace-presentation-authoring-command-v1',
          id: 'test-add-complete-attention-refinements',
          base: currentBase,
          type: 'cv-show.directive.set-refinements',
          payload: {
            cellId: attentionId,
            refinements: { action: 'watch-full-video', mode: 'short-muted-montage' },
          },
        },
      ],
    },
  });

  assert.equal(result.project.revision, currentBase.revision + 1);
  assert.equal(authority.view.project.cells.some(({ id }) => id === scrollId), true);
  assert.equal(authority.view.project.cells.some(({ id }) => id === attentionId), true);
  assert.deepEqual(
    authority.view.project.script.metadata.cvShow.directives[attentionId],
    {
      policy: 'required',
      refinements: { action: 'watch-full-video', mode: 'short-muted-montage' },
    },
  );
  assert.equal(result.cvMediaDisposition.status, 'preserved');
  assert.equal(transport.calls.transact, 1);
});

test('local CV subtitle mutation preserves narration media and updates only entry metadata', async () => {
  const authority = createCvShowAuthoringAuthority();
  const transport = createHostTransport(authority.read());
  const session = await enable(authority, transport);
  const project = authority.view.project;
  const narration = project.cells.find(({ id }) => id === 'cv-show:narration:positioning');
  const subtitle = 'Обычный экранный текст для отдельной TTS-реплики.';
  const result = await session.invoke('presentation_authoring_cv_show_entry_set_subtitle', {
    id: 'test-set-positioning-subtitle',
    base: base(project),
    payload: { entryId: 'positioning', subtitle },
  });

  assert.equal(result.project.revision, project.revision + 1);
  assert.equal(
    authority.view.project.script.metadata.cvShow.entries.positioning.subtitle,
    subtitle,
  );
  assert.equal(
    authority.view.project.cells.find(({ id }) => id === narration.id).turn.text,
    narration.turn.text,
  );
  assert.equal(result.cvMediaDisposition.status, 'preserved');
  assert.equal(authority.view.mediaRegistry.entries.positioning.playable, true);
  assert.equal(transport.calls.transact, 1);
});

test('a committed host result is not converted to failure when replica notification fails', async () => {
  const authority = createCvShowAuthoringAuthority();
  const transport = createHostTransport(authority.read());
  const session = await enable(authority, transport);
  const seedRevision = authority.view.base.revision;
  authority.subscribe(() => { throw new Error('subscriber projection failed'); });
  const result = await session.invoke(
    'presentation_authoring_cell_set_timing',
    timingCommand(authority, 'test-committed-warning'),
  );
  assert.equal(result.authorityReceipt.status, 'committed');
  assert.equal(result.authorityReceipt.replica.status, 'blocked');
  assert.equal(result.authorityReceipt.replica.warning.code, 'CV_SHOW_AUTHORING_REPLICA_BLOCKED');
  assert.equal(transport.calls.transact, 1);
  assert.equal(authority.lifecycle.state, 'blocked');
  assert.equal(authority.view.base.revision, seedRevision + 1);
});
