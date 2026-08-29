import assert from 'node:assert/strict';
import { mkdir, mkdtemp, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import { afterEach, test } from 'node:test';

import {
  createPresentationAuthoringProject,
  presentationAuthoringProjectCanonicalProjection,
} from 'symbiote-workspace';

import {
  createCvShowAuthoringSnapshotIdentity,
  normalizeCvShowAuthoringSnapshot,
} from '../../src/static-pages/js/tour-player/cvShowAuthoringAuthority.js';
import { CV_SHOW_PRESENTATION_PROJECT } from '../../src/static-pages/data/cvShowPresentationProject.js';
import { startCvShowAuthoringHost } from '../../scripts/cv-show-authoring-host.js';

const REPO_ROOT = path.resolve(new URL('../..', import.meta.url).pathname);
const PUBLIC_DIST_DIR = process.env.CV_SHOW_PUBLIC_DIST_DIR || path.join(REPO_ROOT, 'dist');
let cleanups = [];

afterEach(async () => {
  await Promise.allSettled(cleanups.splice(0).reverse().map((cleanup) => cleanup()));
});

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

async function request(
  origin,
  pathname,
  { cookie = '', method = 'GET', originHeader, body, headers = {} } = {},
) {
  let url = new URL(pathname, origin);
  return new Promise((resolve, reject) => {
    let request = http.request(url, {
      method,
      headers: {
        ...headers,
        ...(cookie ? { cookie } : {}),
        ...(originHeader ? { origin: originHeader } : {}),
        ...(body === undefined ? {} : {
          'content-type': 'application/json',
          'content-length': Buffer.byteLength(body),
        }),
      },
    }, (response) => {
      let chunks = [];
      response.on('data', (chunk) => chunks.push(chunk));
      response.on('end', () => resolve({
        status: response.statusCode,
        headers: response.headers,
        bytes: Buffer.concat(chunks),
        text: Buffer.concat(chunks).toString('utf8'),
      }));
    });
    request.on('error', reject);
    if (body !== undefined) request.end(body);
    else request.end();
  });
}

async function readPublicJavaScriptArtifacts(root) {
  let artifacts = [];
  let visit = async (directory) => {
    for (let entry of await readdir(directory, { withFileTypes: true })) {
      let absolutePath = path.join(directory, entry.name);
      if (entry.isDirectory()) {
        await visit(absolutePath);
      } else if (entry.isFile() && path.extname(entry.name) === '.js') {
        artifacts.push({
          path: path.relative(root, absolutePath),
          source: await readFile(absolutePath, 'utf8'),
        });
      }
    }
  };
  await visit(root);
  return artifacts.sort((left, right) => left.path.localeCompare(right.path));
}

async function startHost() {
  let storageRoot = await mkdtemp(path.join(os.tmpdir(), 'cv-show-host-test-'));
  let host = await startCvShowAuthoringHost({
    repoRoot: REPO_ROOT,
    distDir: PUBLIC_DIST_DIR,
    storageRoot,
    port: 0,
  });
  cleanups.push(async () => {
    await host.close();
    await rm(storageRoot, { recursive: true, force: true });
  });
  let html = await request(host.origin, '/cv/');
  let cookie = String(html.headers['set-cookie']?.[0] || '').split(';')[0];
  return { host, storageRoot, html, cookie };
}

test('two same-base host transactions commit exactly one durable head and one typed stale result', async () => {
  let { host, storageRoot, cookie } = await startHost();
  let sessionResponse = await request(host.origin, '/__cv-authoring/api/session', { cookie });
  let session = JSON.parse(sessionResponse.text);
  let candidate = createCandidateSnapshot();
  let candidateIdentity = createCvShowAuthoringSnapshotIdentity(candidate);
  let transaction = JSON.stringify({
    schemaVersion: 'cv-show-authoring-host-transaction-v1',
    sessionId: session.sessionId,
    base: session.base,
    candidateSnapshotIdentity: candidateIdentity.snapshot,
    snapshot: candidate,
  });
  let responses = await Promise.all([
    request(host.origin, '/__cv-authoring/api/transact', {
      cookie,
      method: 'POST',
      originHeader: host.origin,
      body: transaction,
    }),
    request(host.origin, '/__cv-authoring/api/transact', {
      cookie,
      method: 'POST',
      originHeader: host.origin,
      body: transaction,
    }),
  ]);
  assert.deepEqual(responses.map(({ status }) => status).sort(), [200, 409]);
  let stale = JSON.parse(responses.find(({ status }) => status === 409).text);
  assert.equal(stale.error.code, 'CV_SHOW_AUTHORING_STALE');
  assert.equal(stale.error.details.mutated, false);
  let sessionDir = path.join(storageRoot, 'sessions', session.sessionId);
  assert.equal((await readdir(path.join(sessionDir, 'objects'))).length, 1);
  let head = JSON.parse(await readFile(path.join(sessionDir, 'head.json'), 'utf8'));
  assert.equal(head.draftHash, JSON.parse(responses.find(({ status }) => status === 200).text).draftHash);
});

test('reload restores the exact committed snapshot', async () => {
  let { host, cookie } = await startHost();
  let session = JSON.parse((await request(
    host.origin,
    '/__cv-authoring/api/session',
    { cookie },
  )).text);
  let candidate = createCandidateSnapshot();
  let identity = createCvShowAuthoringSnapshotIdentity(candidate);
  let committed = await request(host.origin, '/__cv-authoring/api/transact', {
    cookie,
    method: 'POST',
    originHeader: host.origin,
    body: JSON.stringify({
      schemaVersion: 'cv-show-authoring-host-transaction-v1',
      sessionId: session.sessionId,
      base: session.base,
      candidateSnapshotIdentity: identity.snapshot,
      snapshot: candidate,
    }),
  });
  assert.equal(committed.status, 200);
  let reloaded = JSON.parse((await request(
    host.origin,
    '/__cv-authoring/api/session',
    { cookie },
  )).text);
  assert.deepEqual(reloaded.snapshot, candidate);
  assert.deepEqual(reloaded.identity, identity);
  assert.equal(reloaded.dirty, true);
});

test('host rejects unsafe requests, malformed JSON, a second host, and never leaks its secret', async () => {
  let { host, storageRoot, html, cookie } = await startHost();
  let session = JSON.parse((await request(
    host.origin,
    '/__cv-authoring/api/session',
    { cookie },
  )).text);
  let missingCookie = await request(host.origin, '/__cv-authoring/api/session');
  let foreignHost = await request(host.origin, '/__cv-authoring/api/session', {
    cookie,
    headers: { host: `localhost:${new URL(host.origin).port}` },
  });
  let foreignOrigin = await request(host.origin, '/__cv-authoring/api/transact', {
    cookie,
    method: 'POST',
    originHeader: 'http://foreign.example',
    body: '{}',
  });
  let wrongSession = await request(host.origin, '/__cv-authoring/api/transact', {
    cookie,
    method: 'POST',
    originHeader: host.origin,
    body: JSON.stringify({
      schemaVersion: 'cv-show-authoring-host-transaction-v1',
      sessionId: 'wrong-session',
      base: session.base,
      candidateSnapshotIdentity: session.identity.snapshot,
      snapshot: session.snapshot,
    }),
  });
  let malformed = await request(host.origin, '/__cv-authoring/api/transact', {
    cookie,
    method: 'POST',
    originHeader: host.origin,
    body: '{',
  });
  let oversized = await request(host.origin, '/__cv-authoring/api/transact', {
    cookie,
    method: 'POST',
    originHeader: host.origin,
    body: JSON.stringify({ padding: 'x'.repeat(2_100_000) }),
  });
  await assert.rejects(startCvShowAuthoringHost({
    repoRoot: REPO_ROOT,
    distDir: path.join(REPO_ROOT, 'dist'),
    storageRoot,
    port: 0,
  }), { code: 'CV_SHOW_AUTHORING_HOST_LOCKED' });
  assert.deepEqual(
    [missingCookie, foreignHost, foreignOrigin, wrongSession, malformed, oversized]
      .map(({ status }) => status),
    [401, 403, 403, 403, 400, 413],
  );
  let bootstrap = await request(host.origin, '/__cv-authoring/bootstrap.js?v=asset-42', { cookie });
  let localClient = await request(host.origin, '/__cv-authoring/client.js?v=asset-42', { cookie });
  let missingClientCookie = await request(host.origin, '/__cv-authoring/client.js?v=asset-42');
  let publicLocalClient = await request(host.origin, '/cv/js/tour-player/localAuthoringClient.js', {
    cookie,
  });
  let secret = cookie.split('=')[1];
  let durable = [
    await readFile(path.join(storageRoot, 'host.lock'), 'utf8'),
  ].join('\n');
  assert.doesNotMatch([
    html.text,
    session,
    missingCookie.text,
    foreignHost.text,
    foreignOrigin.text,
    wrongSession.text,
    malformed.text,
    oversized.text,
    bootstrap.text,
    localClient.text,
    missingClientCookie.text,
    publicLocalClient.text,
    durable,
  ].map((value) => typeof value === 'string' ? value : JSON.stringify(value)).join('\n'), new RegExp(secret, 'u'));
  assert.match(String(html.headers['set-cookie']?.[0]), /HttpOnly/u);
  assert.match(String(html.headers['set-cookie']?.[0]), /SameSite=Strict/u);
  assert.equal(localClient.status, 200);
  assert.equal(missingClientCookie.status, 401);
  assert.equal(publicLocalClient.status, 404);
  let bootstrapImports = [...bootstrap.text.matchAll(/\bimport\((['"])([^'"]+)\1\)/gu)]
    .map((match) => match[2]);
  assert.deepEqual(bootstrapImports, ['/__cv-authoring/client.js?v=asset-42']);
  assert.equal((bootstrap.text.match(/enableLocalCvShowAuthoring\(\)/gu) || []).length, 1);
  assert.match(localClient.text, /__cv-authoring\/api\/session/u);
  assert.match(localClient.text, /presentation_authoring_cell_set_timing/u);
});

test('every public JavaScript artifact excludes the local authoring client and tool pack', async () => {
  let [html, artifacts] = await Promise.all([
    readFile(path.join(PUBLIC_DIST_DIR, 'index.html'), 'utf8'),
    readPublicJavaScriptArtifacts(path.join(PUBLIC_DIST_DIR, 'js')),
  ]);
  let forbidden = [
    /__cv-authoring/u,
    /\benableLocalCvShowAuthoring\b/u,
    /\blocal\s*:\s*(?:true|!0)\s*,\s*authorized\s*:\s*(?:true|!0)\s*,\s*sessionId\s*:/u,
    /\bpresentation_authoring_/u,
    /CV Show local WebMCP activation failed/u,
  ];
  assert.ok(artifacts.length > 0);
  for (let artifact of [{ path: 'index.html', source: html }, ...artifacts]) {
    for (let marker of forbidden) {
      assert.doesNotMatch(artifact.source, marker, `${artifact.path} contains ${marker}`);
    }
  }
  assert.equal(
    artifacts.some((artifact) => artifact.path.endsWith('localAuthoringClient.js')),
    false,
  );
});

test('static Opus media serves exact single ranges with the audio/ogg MIME type', async () => {
  let fixtureRoot = await mkdtemp(path.join(os.tmpdir(), 'cv-show-range-test-'));
  let distDir = path.join(fixtureRoot, 'dist');
  let storageRoot = path.join(fixtureRoot, 'storage');
  let payload = Buffer.from(Array.from({ length: 16 }, (_value, index) => index));
  await mkdir(distDir, { recursive: true });
  await Promise.all([
    writeFile(path.join(distDir, 'index.html'), '<!doctype html><body></body>'),
    writeFile(path.join(distDir, 'clip.opus'), payload),
  ]);
  let host = await startCvShowAuthoringHost({
    repoRoot: REPO_ROOT,
    distDir,
    storageRoot,
    port: 0,
  });
  cleanups.push(async () => {
    await host.close();
    await rm(fixtureRoot, { recursive: true, force: true });
  });
  let cases = [
    ['bytes=2-5', 2, 5],
    ['bytes=10-', 10, 15],
    ['bytes=-3', 13, 15],
  ];
  for (let [range, start, end] of cases) {
    let response = await request(host.origin, '/cv/clip.opus', {
      headers: { range },
    });
    assert.equal(response.status, 206);
    assert.equal(response.headers['accept-ranges'], 'bytes');
    assert.equal(response.headers['content-range'], `bytes ${start}-${end}/${payload.length}`);
    assert.equal(Number(response.headers['content-length']), end - start + 1);
    assert.equal(response.headers['content-type'], 'audio/ogg');
    assert.deepEqual(response.bytes, payload.subarray(start, end + 1));
  }
  let full = await request(host.origin, '/cv/clip.opus');
  assert.equal(full.status, 200);
  assert.equal(full.headers['accept-ranges'], 'bytes');
  assert.equal(Number(full.headers['content-length']), payload.length);
  assert.equal(full.headers['content-type'], 'audio/ogg');
  assert.deepEqual(full.bytes, payload);
  for (let range of ['bytes=abc', 'bytes=99-100']) {
    let response = await request(host.origin, '/cv/clip.opus', { headers: { range } });
    assert.equal(response.status, 416);
    assert.equal(response.headers['content-range'], `bytes */${payload.length}`);
    assert.equal(response.bytes.length, 0);
  }
  let head = await request(host.origin, '/cv/clip.opus', {
    method: 'HEAD',
    headers: { range: 'bytes=2-5' },
  });
  assert.equal(head.status, 200);
  assert.equal(Number(head.headers['content-length']), payload.length);
  assert.equal(head.headers['content-type'], 'audio/ogg');
  assert.equal(head.bytes.length, 0);
  for (let range of ['items=2-5', 'bytes=0-1,3-4']) {
    let response = await request(host.origin, '/cv/clip.opus', { headers: { range } });
    assert.equal(response.status, 200);
    assert.equal(Number(response.headers['content-length']), payload.length);
    assert.equal(response.headers['content-type'], 'audio/ogg');
    assert.deepEqual(response.bytes, payload);
  }
});

test('direct host POST rejects inexact wire values, no-ops, and invalid revisions without a head', async () => {
  let { host, storageRoot, cookie } = await startHost();
  let session = JSON.parse((await request(
    host.origin,
    '/__cv-authoring/api/session',
    { cookie },
  )).text);
  let candidate = createCandidateSnapshot();
  let candidateIdentity = createCvShowAuthoringSnapshotIdentity(candidate);
  let inexactTransactions = [
    {
      base: { ...session.base, extra: true },
      snapshot: candidate,
    },
    {
      base: session.base,
      snapshot: { project: candidate.project },
    },
    {
      base: session.base,
      snapshot: { ...candidate, extra: true },
    },
  ];
  for (let inexact of inexactTransactions) {
    let response = await request(host.origin, '/__cv-authoring/api/transact', {
      cookie,
      method: 'POST',
      originHeader: host.origin,
      body: JSON.stringify({
        schemaVersion: 'cv-show-authoring-host-transaction-v1',
        sessionId: session.sessionId,
        base: inexact.base,
        candidateSnapshotIdentity: candidateIdentity.snapshot,
        snapshot: inexact.snapshot,
      }),
    });
    assert.equal(response.status, 400);
    let failure = JSON.parse(response.text);
    assert.equal(failure.schemaVersion, 'cv-show-authoring-host-error-v1');
    assert.equal(failure.error.code, 'CV_SHOW_AUTHORING_TRANSACTION_INVALID');
    assert.equal(failure.error.details.mutated, false);
    await assert.rejects(
      readFile(path.join(storageRoot, 'sessions', session.sessionId, 'head.json')),
      { code: 'ENOENT' },
    );
  }
  let noOp = await request(host.origin, '/__cv-authoring/api/transact', {
    cookie,
    method: 'POST',
    originHeader: host.origin,
    body: JSON.stringify({
      schemaVersion: 'cv-show-authoring-host-transaction-v1',
      sessionId: session.sessionId,
      base: session.base,
      candidateSnapshotIdentity: session.identity.snapshot,
      snapshot: session.snapshot,
    }),
  });
  let input = presentationAuthoringProjectCanonicalProjection(CV_SHOW_PRESENTATION_PROJECT);
  input.revision += 2;
  let speech = input.cells.find((cell) => (
    cell.kind === 'cue' && cell.timing.at.anchor === 'speech'
  ));
  speech.timing.leadMs += 1;
  let invalid = normalizeCvShowAuthoringSnapshot({
    project: createPresentationAuthoringProject(input),
  });
  let invalidIdentity = createCvShowAuthoringSnapshotIdentity(invalid);
  let transition = await request(host.origin, '/__cv-authoring/api/transact', {
    cookie,
    method: 'POST',
    originHeader: host.origin,
    body: JSON.stringify({
      schemaVersion: 'cv-show-authoring-host-transaction-v1',
      sessionId: session.sessionId,
      base: session.base,
      candidateSnapshotIdentity: invalidIdentity.snapshot,
      snapshot: invalid,
    }),
  });
  assert.equal(noOp.status, 409);
  assert.equal(JSON.parse(noOp.text).error.code, 'CV_SHOW_AUTHORING_TRANSACTION_NOOP');
  assert.equal(transition.status, 400);
  assert.equal(JSON.parse(transition.text).error.code, 'CV_SHOW_AUTHORING_TRANSACTION_INVALID');
  await assert.rejects(
    readFile(path.join(storageRoot, 'sessions', session.sessionId, 'head.json')),
    { code: 'ENOENT' },
  );
});
