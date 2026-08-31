import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import {
  mkdtemp,
  readFile,
  rm,
  writeFile,
} from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';

import { canonicalize } from 'symbiote-workspace/schema/canonical-json.js';

import {
  createCvShowAudioPipelineStorage,
} from '../../scripts/cv-show-audio-pipeline-storage.js';
import {
  createCvShowModelServiceClient,
} from '../../scripts/cv-show-model-service-client.js';

const DIGEST_PATTERN = /^[a-f0-9]{64}$/u;
const WAV_HEX = [
  '524946463400000057415645',
  '666d74201000000001000100401f0000803e000002001000',
  '646174611000000000000000000000000000000000000000',
].join('');
const SYNTHESIS_ITEM = Object.freeze({
  id: 'positioning',
  text: 'Точный авторский текст.',
  language: 'ru',
  voiceRef: 'qwen3:speaker:barzana2-review-20260827',
  style: 'calm',
});

function sha256(value) {
  return createHash('sha256').update(value).digest('hex');
}

function wavBytes() {
  return Buffer.from(WAV_HEX, 'hex');
}

function encodeReceipt(receipt) {
  return Buffer.from(canonicalize(receipt), 'utf8').toString('base64url');
}

function validReceipt(overrides = {}, requestItem = SYNTHESIS_ITEM) {
  let item = {
    ...requestItem,
    format: 'wav',
    normalize: true,
  };
  let base = {
    artifactHash: sha256(wavBytes()),
    durationMs: 1,
    language: requestItem.language,
    model: {
      family: 'qwen3-clone',
      versionToken: '1'.repeat(64),
    },
    normalization: {
      applied: true,
      targetLufs: -19,
      truePeakLimitDbfs: -1,
      version: 'bs1770-4-truepeak4x-v1',
    },
    receiptHmac: '2'.repeat(64),
    receiptVersion: 'symbiote-audio-synthesis-receipt-v3',
    requestHash: sha256(Buffer.from(canonicalize(item), 'utf8')),
    requestedVoiceRef: requestItem.voiceRef,
    resolvedVoiceRef: requestItem.voiceRef,
    sampleRate: 8000,
    voiceBindingAttestation: '3'.repeat(64),
  };
  return {
    ...base,
    ...overrides,
  };
}

function jsonResponse(body, { status = 200 } = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

function synthesisResponse(receipt = validReceipt(), overrides = {}) {
  let headers = {
    'content-type': 'audio/wav',
    'x-audio-duration-sec': '0.001000',
    'x-audio-receipt': encodeReceipt(receipt),
    'x-audio-sample-rate': '8000',
    ...overrides.headers,
  };
  return new Response(overrides.body || wavBytes(), { status: 200, headers });
}

function malformedBlockFrameWav() {
  let bytes = wavBytes();
  bytes.writeUInt16LE(2, 22);
  bytes.writeUInt32LE(24000, 28);
  bytes.writeUInt16LE(3, 32);
  return bytes;
}

function malformedBitsWav() {
  let bytes = wavBytes();
  bytes.writeUInt16LE(12, 34);
  return bytes;
}

function captureFetch(responseFactory) {
  let calls = [];
  let fetchImpl = async (url, init) => {
    calls.push({ url, init: structuredClone(init) });
    return responseFactory(calls.length);
  };
  return { calls, fetchImpl };
}

function createClient(fetchImpl) {
  return createCvShowModelServiceClient({
    endpoint: 'https://models.example.test/',
    headers: { 'x-cv-run': 'fixture' },
    fetchImpl,
  });
}

async function temporaryRoot(t) {
  let root = await mkdtemp(path.join(tmpdir(), 'cv-show-audio-pipeline-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  return root;
}

test('storage requires an absolute root and derives portable runs only from content', async (t) => {
  assert.throws(
    () => createCvShowAudioPipelineStorage({ storageRoot: 'tmp/audio' }),
    { code: 'CV_SHOW_AUDIO_PIPELINE_STORAGE_INVALID' },
  );
  let storageRoot = await temporaryRoot(t);
  let storage = createCvShowAudioPipelineStorage({ storageRoot });
  let left = storage.openRun({ plan: 'a'.repeat(64), schemaVersion: 'plan-v1' });
  let right = storage.openRun({ schemaVersion: 'plan-v1', plan: 'a'.repeat(64) });

  assert.equal(left.runHash, right.runHash);
  assert.match(left.runHash, DIGEST_PATTERN);
  assert.equal(left.runDirectory, path.join(storageRoot, 'runs', left.runHash));
  assert.equal(Object.isFrozen(left), true);
  assert.throws(
    () => storage.openRun('/Users/private/raw-plan'),
    { code: 'CV_SHOW_AUDIO_PIPELINE_STORAGE_INVALID' },
  );
});

test('storage reuses immutable canonical objects and isolated byte artifacts', async (t) => {
  let storageRoot = await temporaryRoot(t);
  let run = createCvShowAudioPipelineStorage({ storageRoot }).openRun({ plan: 'immutable' });
  let source = { z: [1, { nested: true }], a: 'value' };
  let objectHash = await run.putObject(source);
  source.z[1].nested = false;

  assert.equal(objectHash, await run.putObject({ a: 'value', z: [1, { nested: true }] }));
  assert.equal(
    await readFile(path.join(run.runDirectory, 'objects', `${objectHash}.json`), 'utf8'),
    canonicalize({ a: 'value', z: [1, { nested: true }] }),
  );
  let stored = await run.readObject(objectHash);
  assert.deepEqual(stored, { a: 'value', z: [1, { nested: true }] });
  assert.equal(Object.isFrozen(stored), true);
  assert.equal(Object.isFrozen(stored.z), true);
  assert.equal(Object.isFrozen(stored.z[1]), true);

  let bytes = Buffer.from([1, 2, 3, 4]);
  let artifactHash = await run.putArtifact(bytes);
  bytes[0] = 9;
  assert.equal(artifactHash, await run.putArtifact(Buffer.from([1, 2, 3, 4])));
  let firstRead = await run.readArtifact(artifactHash);
  assert.deepEqual(firstRead, Buffer.from([1, 2, 3, 4]));
  firstRead[0] = 8;
  assert.deepEqual(await run.readArtifact(artifactHash), Buffer.from([1, 2, 3, 4]));
});

test('storage head uses exact compare-and-swap and rehashes its state', async (t) => {
  let storageRoot = await temporaryRoot(t);
  let run = createCvShowAudioPipelineStorage({ storageRoot }).openRun({ plan: 'head-cas' });
  let firstState = await run.putObject({ phase: 'planned' });
  let secondState = await run.putObject({ phase: 'synthesis-dispatched' });

  assert.equal(await run.readHead(), null);
  let firstHead = await run.compareAndSwapHead(null, firstState);
  assert.equal(firstHead.stateHash, firstState);
  assert.deepEqual(firstHead.state, { phase: 'planned' });
  assert.match(firstHead.headHash, DIGEST_PATTERN);
  await assert.rejects(
    run.compareAndSwapHead(null, secondState),
    { code: 'CV_SHOW_AUDIO_PIPELINE_HEAD_STALE' },
  );
  let secondHead = await run.compareAndSwapHead(firstHead.headHash, secondState);
  assert.equal(secondHead.stateHash, secondState);
  assert.deepEqual(secondHead.state, { phase: 'synthesis-dispatched' });
  await assert.rejects(
    run.compareAndSwapHead(firstHead.headHash, firstState),
    { code: 'CV_SHOW_AUDIO_PIPELINE_HEAD_STALE' },
  );
});

test('storage lock is exclusive and only the exact owner token can release it', async (t) => {
  let storageRoot = await temporaryRoot(t);
  let run = createCvShowAudioPipelineStorage({ storageRoot }).openRun({ plan: 'lock' });

  await run.acquireLock('owner-a');
  await assert.rejects(run.acquireLock('owner-b'), {
    code: 'CV_SHOW_AUDIO_PIPELINE_LOCKED',
  });
  await assert.rejects(run.releaseLock('owner-b'), {
    code: 'CV_SHOW_AUDIO_PIPELINE_LOCK_NOT_OWNER',
  });
  await run.releaseLock('owner-a');
  await run.acquireLock('owner-b');
  await run.releaseLock('owner-b');
});

test('storage lock-operation guard blocks acquire and release across owner verification', async (t) => {
  let storageRoot = await temporaryRoot(t);
  let run = createCvShowAudioPipelineStorage({ storageRoot }).openRun({
    plan: 'lock-operation-guard',
  });
  await run.acquireLock('owner-a');
  let guardPath = path.join(run.runDirectory, '.lock-operation.guard');
  await writeFile(guardPath, 'stale-operation');

  let releaseOutcome = await run.releaseLock('owner-a').then(
    () => 'resolved',
    (error) => error.code,
  );
  let acquireOutcome = await run.acquireLock('owner-b').then(
    () => 'resolved',
    (error) => error.code,
  );
  await rm(guardPath, { force: true });
  if (acquireOutcome === 'resolved') {
    await run.releaseLock('owner-b');
  } else {
    await run.releaseLock('owner-a');
  }

  assert.equal(releaseOutcome, 'CV_SHOW_AUDIO_PIPELINE_LOCK_BUSY');
  assert.equal(acquireOutcome, 'CV_SHOW_AUDIO_PIPELINE_LOCK_BUSY');
});

test('storage rejects corrupt object, artifact, and head bytes', async (t) => {
  let storageRoot = await temporaryRoot(t);
  let storage = createCvShowAudioPipelineStorage({ storageRoot });
  let objectRun = storage.openRun({ plan: 'corrupt-object' });
  let objectHash = await objectRun.putObject({ phase: 'planned' });
  await writeFile(
    path.join(objectRun.runDirectory, 'objects', `${objectHash}.json`),
    '{"phase":"changed"}',
  );
  await assert.rejects(objectRun.readObject(objectHash), {
    code: 'CV_SHOW_AUDIO_PIPELINE_OBJECT_CORRUPT',
  });

  let artifactRun = storage.openRun({ plan: 'corrupt-artifact' });
  let artifactHash = await artifactRun.putArtifact(Buffer.from([1, 2, 3]));
  await writeFile(
    path.join(artifactRun.runDirectory, 'artifacts', `${artifactHash}.bin`),
    Buffer.from([3, 2, 1]),
  );
  await assert.rejects(artifactRun.readArtifact(artifactHash), {
    code: 'CV_SHOW_AUDIO_PIPELINE_ARTIFACT_CORRUPT',
  });

  let headRun = storage.openRun({ plan: 'corrupt-head' });
  let stateHash = await headRun.putObject({ phase: 'planned' });
  await headRun.compareAndSwapHead(null, stateHash);
  await writeFile(path.join(headRun.runDirectory, 'head.json'), '{"stateHash":"bad"}');
  await assert.rejects(headRun.readHead(), {
    code: 'CV_SHOW_AUDIO_PIPELINE_HEAD_CORRUPT',
  });
});

test('model client performs one exact readiness request and freezes identity', async () => {
  let transport = captureFetch(() => jsonResponse({
    ready: true,
    status: 'ready',
    model: 'qwen3-clone+whisper',
    modelVersion: 'revision-a|revision-b',
    accelerator: 'cuda',
    warmupMs: 12,
    capabilities: ['voice.create'],
  }));
  let readiness = await createClient(transport.fetchImpl).readiness();

  assert.equal(transport.calls.length, 1);
  assert.deepEqual(transport.calls[0], {
    url: 'https://models.example.test/readyz',
    init: {
      method: 'GET',
      redirect: 'error',
      headers: {
        accept: 'application/json',
        'x-cv-run': 'fixture',
      },
    },
  });
  assert.deepEqual(readiness, {
    ready: true,
    status: 'ready',
    model: 'qwen3-clone+whisper',
    modelVersion: 'revision-a|revision-b',
    accelerator: 'cuda',
    capabilities: ['voice.create'],
  });
  assert.equal(Object.isFrozen(readiness), true);
  assert.equal(Object.isFrozen(readiness.capabilities), true);
});

test('model client performs one exact synthesis request and validates receipt evidence', async () => {
  let transport = captureFetch(() => synthesisResponse());
  let result = await createClient(transport.fetchImpl).synthesize(SYNTHESIS_ITEM);

  assert.equal(transport.calls.length, 1);
  assert.deepEqual(transport.calls[0], {
    url: 'https://models.example.test/synthesize',
    init: {
      method: 'POST',
      redirect: 'error',
      headers: {
        accept: 'audio/wav',
        'content-type': 'application/json',
        'x-cv-run': 'fixture',
      },
      body: JSON.stringify({
        model: 'qwen3',
        items: [{
          ...SYNTHESIS_ITEM,
          format: 'wav',
          normalize: true,
        }],
      }),
    },
  });
  assert.deepEqual(result.wavBytes, wavBytes());
  assert.notEqual(result.wavBytes, wavBytes());
  assert.equal(result.durationSec, 0.001);
  assert.equal(result.sampleRate, 8000);
  assert.deepEqual(result.receipt, validReceipt());
  assert.equal(Object.isFrozen(result), true);
  assert.equal(Object.isFrozen(result.receipt), true);
  assert.equal(Object.isFrozen(result.receipt.normalization), true);
  assert.equal(Object.hasOwn(result, 'receiptHmacVerified'), false);
  assert.equal(Object.hasOwn(result.receipt, 'verified'), false);
});

test('model client sends the explicitly selected synthesis model', async () => {
  let transport = captureFetch(() => synthesisResponse());
  let client = createCvShowModelServiceClient({
    endpoint: 'https://models.example.test/',
    headers: { 'x-cv-run': 'fixture' },
    fetchImpl: transport.fetchImpl,
    model: 'qwen3-clone',
  });

  await client.synthesize(SYNTHESIS_ITEM);

  assert.equal(JSON.parse(transport.calls[0].init.body).model, 'qwen3-clone');
});

test('model client rejects malformed readiness without fallback or polling', async () => {
  let invalidReadiness = [
    {
      ready: false,
      status: 'loading',
      model: 'qwen3',
      modelVersion: '1',
      accelerator: 'cuda',
      capabilities: [],
    },
    {
      ready: true,
      status: 'ok',
      model: 'qwen3',
      modelVersion: '1',
      accelerator: 'cuda',
      capabilities: [],
    },
    { ready: true, status: 'ready', model: '', modelVersion: '1', accelerator: 'cuda', capabilities: [] },
    {
      ready: true,
      status: 'ready',
      model: 'qwen3',
      modelVersion: '1',
      accelerator: 'cuda',
      capabilities: [1],
    },
  ];
  for (let body of invalidReadiness) {
    let transport = captureFetch(() => jsonResponse(body));
    await assert.rejects(createClient(transport.fetchImpl).readiness(), {
      code: 'CV_SHOW_MODEL_SERVICE_INVALID',
    });
    assert.equal(transport.calls.length, 1);
  }
});

test('model client rejects every bound synthesis evidence mismatch after one request', async () => {
  let receiptCases = [
    { receiptVersion: 'symbiote-audio-synthesis-receipt-v2' },
    { requestHash: '0'.repeat(64) },
    { artifactHash: '0'.repeat(64) },
    { durationMs: 2 },
    { sampleRate: 16000 },
    { requestedVoiceRef: 'voice:other' },
    { resolvedVoiceRef: 'voice:other' },
    { language: 'en' },
    { model: { family: '/private/model', versionToken: '1'.repeat(64) } },
    { normalization: { ...validReceipt().normalization, applied: false } },
    { normalization: { ...validReceipt().normalization, targetLufs: -18 } },
    { receiptHmac: 'A'.repeat(64) },
    { unexpected: true },
  ];
  for (let override of receiptCases) {
    let transport = captureFetch(() => synthesisResponse(validReceipt(override)));
    await assert.rejects(
      createClient(transport.fetchImpl).synthesize(SYNTHESIS_ITEM),
      { code: 'CV_SHOW_MODEL_SERVICE_INVALID' },
    );
    assert.equal(transport.calls.length, 1);
  }

  let headerCases = [
    { 'x-audio-duration-sec': '0.002000' },
    { 'x-audio-sample-rate': '16000' },
  ];
  for (let headers of headerCases) {
    let transport = captureFetch(() => synthesisResponse(validReceipt(), { headers }));
    await assert.rejects(
      createClient(transport.fetchImpl).synthesize(SYNTHESIS_ITEM),
      { code: 'CV_SHOW_MODEL_SERVICE_INVALID' },
    );
    assert.equal(transport.calls.length, 1);
  }
});

test('model client accepts both authoritative WAV response MIME values', async () => {
  let transport = captureFetch(() => synthesisResponse(validReceipt(), {
    headers: { 'content-type': 'audio/x-wav' },
  }));

  let result = await createClient(transport.fetchImpl).synthesize(SYNTHESIS_ITEM);

  assert.deepEqual(result.wavBytes, wavBytes());
  assert.equal(transport.calls.length, 1);
});

test('model client rejects malformed PCM bit, block, and frame geometry', async () => {
  let fixtures = [
    { bytes: malformedBitsWav(), duration: '0.001000' },
    { bytes: malformedBlockFrameWav(), duration: '0.000667' },
  ];
  for (let fixture of fixtures) {
    let receipt = validReceipt({ artifactHash: sha256(fixture.bytes) });
    let transport = captureFetch(() => synthesisResponse(receipt, {
      body: fixture.bytes,
      headers: { 'x-audio-duration-sec': fixture.duration },
    }));
    await assert.rejects(
      createClient(transport.fetchImpl).synthesize(SYNTHESIS_ITEM),
      { code: 'CV_SHOW_MODEL_SERVICE_INVALID' },
    );
    assert.equal(transport.calls.length, 1);
  }
});

test('model client sends exact WAV transcription request and preserves observations', async () => {
  let transcript = {
    text: '  точный текст  ',
    durationSec: 0.001,
    words: [
      { word: ' точный', startSec: 0, endSec: 0.0004 },
      { word: ' текст', startSec: 0.0004, endSec: 0.001 },
    ],
  };
  let transport = captureFetch(() => jsonResponse(transcript));
  let bytes = wavBytes();
  let result = await createClient(transport.fetchImpl).transcribe({
    wavBytes: bytes,
    language: 'ru',
  });

  assert.equal(transport.calls.length, 1);
  assert.deepEqual(transport.calls[0], {
    url: 'https://models.example.test/transcribe',
    init: {
      method: 'POST',
      redirect: 'error',
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
        'x-cv-run': 'fixture',
      },
      body: JSON.stringify({
        audioRef: `sha256:${sha256(bytes)}`,
        audioBase64: bytes.toString('base64'),
        mimeType: 'audio/wav',
        language: 'ru',
        model: 'large-v3-turbo',
      }),
    },
  });
  assert.deepEqual(result, transcript);
  assert.equal(Object.isFrozen(result), true);
  assert.equal(Object.isFrozen(result.words), true);
  assert.equal(Object.isFrozen(result.words[0]), true);
});

test('model client rejects missing, reordered, or overlapping observed words', async () => {
  let invalidTranscripts = [
    { text: '', durationSec: 1, words: [{ word: 'x', startSec: 0, endSec: 1 }] },
    { text: 'x', durationSec: 0, words: [{ word: 'x', startSec: 0, endSec: 0 }] },
    { text: 'x', durationSec: 1, words: [] },
    { text: 'x y', durationSec: 1, words: [
      { word: 'x', startSec: 0.5, endSec: 0.7 },
      { word: 'y', startSec: 0.1, endSec: 0.2 },
    ] },
    { text: 'x y', durationSec: 1, words: [
      { word: 'x', startSec: 0, endSec: 0.7 },
      { word: 'y', startSec: 0.6, endSec: 0.9 },
    ] },
    { text: 'x', durationSec: 1, words: [
      { word: 'x', startSec: 0, endSec: 1.1 },
    ] },
    { text: 'x', durationSec: 1, words: [
      { word: 'x', startSec: 0, endSec: 1, fabricated: true },
    ] },
  ];
  for (let transcript of invalidTranscripts) {
    let transport = captureFetch(() => jsonResponse(transcript));
    await assert.rejects(
      createClient(transport.fetchImpl).transcribe({ wavBytes: wavBytes(), language: 'ru' }),
      { code: 'CV_SHOW_MODEL_SERVICE_INVALID' },
    );
    assert.equal(transport.calls.length, 1);
  }
});

test('model client rejects service-rewritten caller fields before fetch', async () => {
  let synthesisFields = ['id', 'text', 'language', 'voiceRef', 'style'];
  for (let field of synthesisFields) {
    for (let value of [
      ` ${SYNTHESIS_ITEM[field]}`,
      `${SYNTHESIS_ITEM[field]} `,
      'None',
      'null',
      'undefined',
    ]) {
      let transport = captureFetch(() => synthesisResponse());
      await assert.rejects(
        createClient(transport.fetchImpl).synthesize({
          ...SYNTHESIS_ITEM,
          [field]: value,
        }),
        { code: 'CV_SHOW_MODEL_SERVICE_INVALID' },
      );
      assert.equal(transport.calls.length, 0);
    }
  }

  for (let language of [' ru', 'ru ', 'None', 'null', 'undefined']) {
    let transport = captureFetch(() => jsonResponse({}));
    await assert.rejects(
      createClient(transport.fetchImpl).transcribe({ wavBytes: wavBytes(), language }),
      { code: 'CV_SHOW_MODEL_SERVICE_INVALID' },
    );
    assert.equal(transport.calls.length, 0);
  }

  let emptyStyleItem = { ...SYNTHESIS_ITEM, style: '' };
  let emptyStyleTransport = captureFetch(() => synthesisResponse(
    validReceipt({}, emptyStyleItem),
  ));
  await createClient(emptyStyleTransport.fetchImpl).synthesize(emptyStyleItem);
  assert.equal(emptyStyleTransport.calls.length, 1);
});

test('model client requires injected transport and a credential-free absolute endpoint', () => {
  assert.throws(
    () => createCvShowModelServiceClient({ endpoint: '/models', fetchImpl: async () => {} }),
    { code: 'CV_SHOW_MODEL_SERVICE_INVALID' },
  );
  assert.throws(
    () => createCvShowModelServiceClient({
      endpoint: 'https://models.test/',
      headers: { authorization: 'secret' },
      fetchImpl: async () => {},
    }),
    { code: 'CV_SHOW_MODEL_SERVICE_INVALID' },
  );
  assert.throws(
    () => createCvShowModelServiceClient({ endpoint: 'https://models.test/' }),
    { code: 'CV_SHOW_MODEL_SERVICE_INVALID' },
  );
});
