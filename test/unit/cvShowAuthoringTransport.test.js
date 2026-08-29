import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  createPresentationAuthoringProject,
  presentationAuthoringProjectCanonicalProjection,
} from 'symbiote-workspace';

import {
  createCvShowAuthoringSnapshotIdentity,
  normalizeCvShowAuthoringSnapshot,
} from '../../src/static-pages/js/tour-player/cvShowAuthoringAuthority.js';
import { CV_SHOW_PRESENTATION_PROJECT } from '../../src/static-pages/data/cvShowPresentationProject.js';
import { createCvShowAuthoringTransport } from '../../src/static-pages/js/tour-player/cvShowAuthoringTransport.js';

const SESSION_ID = 'session-transport-0123456789';

function createCandidateSnapshot() {
  let input = presentationAuthoringProjectCanonicalProjection(CV_SHOW_PRESENTATION_PROJECT);
  input.revision += 1;
  let speech = input.cells.find((cell) => (
    cell.kind === 'cue' && cell.timing.at.anchor === 'speech'
  ));
  speech.timing.leadMs += 1;
  return normalizeCvShowAuthoringSnapshot({
    project: createPresentationAuthoringProject(input),
  });
}

function createSessionResponse(snapshot) {
  let identity = createCvShowAuthoringSnapshotIdentity(snapshot);
  return {
    schemaVersion: 'cv-show-authoring-host-session-v1',
    status: 'authorized',
    sessionId: SESSION_ID,
    sourceBase: {
      revision: CV_SHOW_PRESENTATION_PROJECT.revision,
      authoringProjectHash: CV_SHOW_PRESENTATION_PROJECT.hash,
      sourceSha256: 'sha256:'.concat('a'.repeat(64)),
    },
    base: {
      revision: snapshot.project.revision,
      authoringProjectHash: snapshot.project.hash,
      snapshotIdentity: identity.snapshot,
    },
    identity,
    snapshot,
    dirty: false,
    materialized: false,
  };
}

function jsonResponse(value, init = {}) {
  return new Response(JSON.stringify(value), {
    status: init.status || 200,
    headers: { 'content-type': 'application/json' },
  });
}

test('transport authorizes once, loads the exact host snapshot, and projects eight commit fields', async () => {
  let seedSnapshot = normalizeCvShowAuthoringSnapshot({ project: CV_SHOW_PRESENTATION_PROJECT });
  let candidate = createCandidateSnapshot();
  let candidateIdentity = createCvShowAuthoringSnapshotIdentity(candidate);
  let requests = [];
  let fetchImpl = async (url, options = {}) => {
    requests.push({ url: String(url), options });
    if (requests.length === 1) return jsonResponse(createSessionResponse(seedSnapshot));
    return jsonResponse({
      schemaVersion: 'cv-show-authoring-host-transaction-response-v1',
      status: 'committed',
      sessionId: SESSION_ID,
      previousDraftHash: null,
      draftHash: 'sha256:'.concat('b'.repeat(64)),
      candidateSnapshotIdentity: candidateIdentity.snapshot,
      snapshotIdentity: candidateIdentity,
      snapshot: candidate,
      base: {
        revision: candidate.project.revision,
        authoringProjectHash: candidate.project.hash,
        snapshotIdentity: candidateIdentity.snapshot,
      },
      dirty: true,
      materialized: false,
    });
  };
  let transport = createCvShowAuthoringTransport({ fetchImpl });
  let initial = await transport.handshake();
  let capability = Object.freeze({ local: true, authorized: true, sessionId: SESSION_ID });
  let handshake = await transport.handshake({
    capability,
    seedBase: {
      revision: CV_SHOW_PRESENTATION_PROJECT.revision,
      authoringProjectHash: CV_SHOW_PRESENTATION_PROJECT.hash,
    },
  });
  let loaded = await transport.load({ sessionId: SESSION_ID });
  let receipt = await transport.transact({
    sessionId: SESSION_ID,
    base: createSessionResponse(seedSnapshot).base,
    candidateSnapshotIdentity: candidateIdentity.snapshot,
    snapshot: candidate,
  });

  assert.deepEqual(initial, handshake);
  assert.equal(requests.length, 2);
  assert.deepEqual(Object.keys(loaded), [
    'schemaVersion',
    'status',
    'snapshot',
    'dirty',
    'materialized',
  ]);
  assert.deepEqual(Object.keys(receipt), [
    'schemaVersion',
    'status',
    'commitId',
    'candidateSnapshotIdentity',
    'snapshotIdentity',
    'snapshot',
    'dirty',
    'materialized',
  ]);
  assert.equal(receipt.schemaVersion, 'cv-show-authoring-commit-receipt-v1');
  assert.equal(receipt.commitId, 'sha256:'.concat('b'.repeat(64)));
  assert.deepEqual(receipt.snapshot, candidate);
  assert.equal(requests[1].options.method, 'POST');
  assert.equal(requests[1].options.credentials, 'same-origin');
});

test('transport never retries or invents a zero-mutation receipt after POST dispatch', async () => {
  let seedSnapshot = normalizeCvShowAuthoringSnapshot({ project: CV_SHOW_PRESENTATION_PROJECT });
  let candidate = createCandidateSnapshot();
  let candidateIdentity = createCvShowAuthoringSnapshotIdentity(candidate);
  let postCalls = 0;
  let transport = createCvShowAuthoringTransport({
    fetchImpl: async (_url, options = {}) => {
      if (options.method !== 'POST') return jsonResponse(createSessionResponse(seedSnapshot));
      postCalls += 1;
      throw new DOMException('Response lost', 'AbortError');
    },
  });
  await transport.handshake();
  await assert.rejects(
    transport.transact({
      sessionId: SESSION_ID,
      base: createSessionResponse(seedSnapshot).base,
      candidateSnapshotIdentity: candidateIdentity.snapshot,
      snapshot: candidate,
    }),
    { name: 'AbortError' },
  );
  assert.equal(postCalls, 1);
});

test('transport rejects malformed session, commit, or divergent host responses', async () => {
  let seedSnapshot = normalizeCvShowAuthoringSnapshot({ project: CV_SHOW_PRESENTATION_PROJECT });
  let candidate = createCandidateSnapshot();
  let candidateIdentity = createCvShowAuthoringSnapshotIdentity(candidate);
  for (let sourceBase of [
    {
      ...createSessionResponse(seedSnapshot).sourceBase,
      revision: '0',
    },
    {
      ...createSessionResponse(seedSnapshot).sourceBase,
      authoringProjectHash: '',
    },
  ]) {
    let malformedSession = {
      ...createSessionResponse(seedSnapshot),
      sourceBase,
    };
    let transport = createCvShowAuthoringTransport({
      fetchImpl: async () => jsonResponse(malformedSession),
    });
    await assert.rejects(
      transport.handshake(),
      { code: 'CV_SHOW_AUTHORING_TRANSPORT_RESPONSE_INVALID' },
    );
  }
  for (let responseValue of [
    { schemaVersion: 'cv-show-authoring-host-transaction-response-v1', status: 'committed' },
    {
      schemaVersion: 'cv-show-authoring-host-transaction-response-v1',
      status: 'committed',
      sessionId: SESSION_ID,
      previousDraftHash: null,
      draftHash: 'sha256:'.concat('c'.repeat(64)),
      candidateSnapshotIdentity: 'cv-show-authoring-snapshot-v1:divergent',
      snapshotIdentity: candidateIdentity,
      snapshot: candidate,
      base: {
        revision: candidate.project.revision,
        authoringProjectHash: candidate.project.hash,
        snapshotIdentity: candidateIdentity.snapshot,
      },
      dirty: true,
      materialized: false,
    },
  ]) {
    let calls = 0;
    let transport = createCvShowAuthoringTransport({
      fetchImpl: async (_url, options = {}) => {
        calls += 1;
        return options.method === 'POST'
          ? jsonResponse(responseValue)
          : jsonResponse(createSessionResponse(seedSnapshot));
      },
    });
    await transport.handshake();
    await assert.rejects(transport.transact({
      sessionId: SESSION_ID,
      base: createSessionResponse(seedSnapshot).base,
      candidateSnapshotIdentity: candidateIdentity.snapshot,
      snapshot: candidate,
    }), { code: 'CV_SHOW_AUTHORING_TRANSPORT_RESPONSE_INVALID' });
    assert.equal(calls, 2);
  }
});
