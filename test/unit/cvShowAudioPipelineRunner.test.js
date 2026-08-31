import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';

import {
  createPresentationObservedAlignment,
  createPresentationTimelineContract,
} from 'symbiote-workspace';
import { canonicalize } from 'symbiote-workspace/schema/canonical-json.js';

import {
  createCvShowAudioPipelineRunner,
} from '../../scripts/cv-show-audio-pipeline-runner.js';
import {
  createCvShowAudioPipelineStorage,
} from '../../scripts/cv-show-audio-pipeline-storage.js';
import {
  createCvShowModelServiceClient,
} from '../../scripts/cv-show-model-service-client.js';

const EXPECTED_ATTEMPT_KINDS = Object.freeze([
  'synthesis-readiness-pre',
  'synthesis',
  'synthesis-readiness-post',
  'transcription-readiness-pre',
  'transcription',
  'transcription-readiness-post',
]);
const READY = Object.freeze({
  ready: true,
  status: 'ready',
  model: 'qwen3-clone+whisper-large-v3',
  modelVersion: 'qwen-revision-a|whisper-revision-a',
  accelerator: 'cuda',
  capabilities: Object.freeze(['synthesize', 'transcribe']),
});
const TRANSCRIPT = Object.freeze({
  text: 'Alpha beta gamma',
  durationSec: 1,
  words: Object.freeze([
    Object.freeze({ word: 'Alpha', startSec: 0, endSec: 0.2 }),
    Object.freeze({ word: 'beta', startSec: 0.25, endSec: 0.5 }),
    Object.freeze({ word: 'gamma', startSec: 0.55, endSec: 0.9 }),
  ]),
});
const DELETED_TOKEN_TRANSCRIPT = Object.freeze({
  text: 'Alpha gamma',
  durationSec: 1,
  words: Object.freeze([
    Object.freeze({ word: 'Alpha', startSec: 0, endSec: 0.3 }),
    Object.freeze({ word: 'gamma', startSec: 0.5, endSec: 0.9 }),
  ]),
});

function sha256(value) {
  return createHash('sha256').update(value).digest('hex');
}

function createWav() {
  let sampleRate = 8000;
  let dataSize = sampleRate * 2;
  let wav = Buffer.alloc(44 + dataSize);
  wav.write('RIFF', 0, 'ascii');
  wav.writeUInt32LE(wav.length - 8, 4);
  wav.write('WAVE', 8, 'ascii');
  wav.write('fmt ', 12, 'ascii');
  wav.writeUInt32LE(16, 16);
  wav.writeUInt16LE(1, 20);
  wav.writeUInt16LE(1, 22);
  wav.writeUInt32LE(sampleRate, 24);
  wav.writeUInt32LE(sampleRate * 2, 28);
  wav.writeUInt16LE(2, 32);
  wav.writeUInt16LE(16, 34);
  wav.write('data', 36, 'ascii');
  wav.writeUInt32LE(dataSize, 40);
  return wav;
}

function createPlan(overrides = {}) {
  let timeline = createPresentationTimelineContract({
    contractVersion: 'presentation-timeline-v3',
    id: 'entry-alpha-timeline',
    title: 'Entry alpha',
    locale: 'en-US',
    profile: 'brief',
    personas: {
      narrator: {
        name: 'Narrator',
        role: 'guide',
        locale: 'en-US',
      },
    },
    grounding: { sources: [] },
    turns: [{
      id: 'entry-alpha-turn',
      persona: 'narrator',
      dialogueAct: 'explain',
      text: 'Alpha beta gamma.',
      sourceRefs: [],
      claims: [],
      cues: [],
    }],
  });
  return {
    entryId: 'entry-alpha',
    timeline,
    synthesisItem: {
      id: 'entry-alpha',
      text: 'Alpha beta gamma.',
      language: 'en-US',
      voiceRef: 'qwen3-speaker-alpha',
      style: 'calm',
    },
    locale: 'en-US',
    voice: { mode: 'single', speakerId: 'qwen3-speaker-alpha' },
    readinessProfile: structuredClone(READY),
    requiredAnchors: [{
      anchorId: 'entry-alpha-core',
      turnIndex: 0,
      authoredTokenIndexes: [0, 1, 2],
    }],
    ...overrides,
  };
}

function synthesisReceipt(plan, wav) {
  let requestItem = {
    ...plan.synthesisItem,
    format: 'wav',
    normalize: true,
  };
  return {
    artifactHash: sha256(wav),
    durationMs: 1000,
    language: plan.synthesisItem.language,
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
    requestHash: sha256(Buffer.from(canonicalize(requestItem), 'utf8')),
    requestedVoiceRef: plan.synthesisItem.voiceRef,
    resolvedVoiceRef: plan.synthesisItem.voiceRef,
    sampleRate: 8000,
    voiceBindingAttestation: '3'.repeat(64),
  };
}

function jsonResponse(value) {
  return new Response(JSON.stringify(value), {
    status: 200,
    headers: { 'content-type': 'application/json' },
  });
}

function synthesisResponse(plan, wav, receipt = synthesisReceipt(plan, wav)) {
  return new Response(wav, {
    status: 200,
    headers: {
      'content-type': 'audio/wav',
      'x-audio-duration-sec': '1.000000',
      'x-audio-receipt': Buffer
        .from(canonicalize(receipt), 'utf8')
        .toString('base64url'),
      'x-audio-sample-rate': '8000',
    },
  });
}

function createFakeTransport({
  plan,
  readiness = [READY, READY, READY, READY],
  transcript = TRANSCRIPT,
  throwAtCall = null,
  httpStatusAtCall = null,
  synthesisReceiptOverride = null,
  onDispatch = async () => undefined,
} = {}) {
  let calls = [];
  let readinessIndex = 0;
  let wav = createWav();
  let fetchImpl = async (url, init) => {
    let pathname = new URL(url).pathname;
    calls.push({ pathname, init: structuredClone(init) });
    await onDispatch(pathname, calls.length - 1);
    if (calls.length === throwAtCall) throw new Error('simulated transport interruption');
    if (calls.length === httpStatusAtCall) {
      return new Response('unavailable', { status: 503 });
    }
    if (pathname === '/readyz') {
      let response = readiness[readinessIndex];
      readinessIndex += 1;
      return jsonResponse(response);
    }
    if (pathname === '/synthesize') {
      let receipt = synthesisReceipt(plan, wav);
      if (synthesisReceiptOverride) receipt = { ...receipt, ...synthesisReceiptOverride };
      return synthesisResponse(plan, wav, receipt);
    }
    if (pathname === '/transcribe') return jsonResponse(transcript);
    throw new Error(`Unexpected fake path ${pathname}`);
  };
  return { calls, fetchImpl, wav };
}

async function temporaryRoot(t) {
  let root = await mkdtemp(path.join(tmpdir(), 'cv-show-audio-runner-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  return root;
}

async function createScenario(t, {
  plan = createPlan(),
  readiness,
  transcript,
  throwAtCall,
  httpStatusAtCall,
  synthesisReceiptOverride,
  createObservedAlignment,
} = {}) {
  let storageRoot = await temporaryRoot(t);
  let storage = createCvShowAudioPipelineStorage({ storageRoot });
  let run = storage.openRun(plan);
  let dispatchSnapshots = [];
  let transport = createFakeTransport({
    plan,
    readiness,
    transcript,
    throwAtCall,
    httpStatusAtCall,
    synthesisReceiptOverride,
    onDispatch: async (pathname, index) => {
      let head = await run.readHead();
      let attemptHash = head.state.attemptHashes.at(-1);
      let attempt = await run.readObject(attemptHash);
      assert.equal(attempt.status, 'dispatched');
      let expectedKind = EXPECTED_ATTEMPT_KINDS[index]
        ?? EXPECTED_ATTEMPT_KINDS[3 + ((index - EXPECTED_ATTEMPT_KINDS.length) % 3)];
      assert.equal(attempt.kind, expectedKind);
      dispatchSnapshots.push({ pathname, attemptHash, attempt });
    },
  });
  let modelClient = createCvShowModelServiceClient({
    endpoint: 'https://models.example.test/',
    fetchImpl: transport.fetchImpl,
  });
  let runnerInput = { storage, modelClient };
  if (createObservedAlignment) runnerInput.createObservedAlignment = createObservedAlignment;
  let runner = createCvShowAudioPipelineRunner(runnerInput);
  let handle = runner.openEntry(plan);
  return {
    storage,
    run,
    runner,
    handle,
    plan,
    transport,
    dispatchSnapshots,
  };
}

async function synthesizeAndApprove(scenario, ownerToken = 'owner-a') {
  let technical = await scenario.handle.advance(ownerToken);
  assert.equal(technical.phase, 'technical-verified');
  return scenario.handle.reviewClip({
    ownerToken,
    approved: true,
    wavHash: technical.synthesis.wavHash,
    synthesisAttemptHash: technical.synthesis.attemptHash,
  });
}

async function transcribeAndAlign(scenario, ownerToken = 'owner-a') {
  let transcribed = await scenario.handle.advance(ownerToken);
  assert.equal(transcribed.phase, 'transcribed');
  let aligned = await scenario.handle.advance(ownerToken);
  assert.equal(aligned.phase, 'aligned');
  return aligned;
}

async function replaceDurableState(run, createState) {
  let head = await run.readHead();
  let stateHash = await run.putObject(createState(structuredClone(head.state)));
  return run.compareAndSwapHead(head.headHash, stateHash);
}

test('completes six durable fake requests, review, strict v3 alignment and anchors', async (t) => {
  let scenario = await createScenario(t);
  let { handle, plan, run, runner, transport } = scenario;

  assert.deepEqual(Object.keys(runner), ['openEntry']);
  assert.deepEqual(
    Object.keys(handle).sort(),
    ['advance', 'initialize', 'inspect', 'retrySynthesis', 'retryVerification', 'reviewClip'],
  );
  let initialized = await handle.initialize();
  let initialHead = await run.readHead();
  assert.equal(initialized.phase, 'planned');
  assert.equal(Object.isFrozen(initialized), true);
  assert.equal(Object.isFrozen(initialized.plan.timeline), true);
  assert.deepEqual(await handle.initialize(), initialized);
  assert.equal((await run.readHead()).headHash, initialHead.headHash);

  let technical = await handle.advance('owner-a');
  assert.equal(technical.phase, 'technical-verified');
  assert.equal(transport.calls.length, 3);
  assert.deepEqual(
    transport.calls.map(({ pathname }) => pathname),
    ['/readyz', '/synthesize', '/readyz'],
  );
  assert.equal(technical.review, null);

  let reopened = runner.openEntry(structuredClone(plan));
  assert.deepEqual(await reopened.initialize(), technical);
  assert.deepEqual(await reopened.inspect(), technical);
  assert.equal(transport.calls.length, 3);
  let reviewed = await reopened.reviewClip({
    ownerToken: 'owner-b',
    approved: true,
    wavHash: technical.synthesis.wavHash,
    synthesisAttemptHash: technical.synthesis.attemptHash,
  });
  assert.equal(reviewed.phase, 'clip-reviewed');

  let transcribed = await reopened.advance('owner-b');
  assert.equal(transcribed.phase, 'transcribed');
  assert.deepEqual(transcribed.transcript, {
    attemptHash: transcribed.transcript.attemptHash,
    ...structuredClone(TRANSCRIPT),
  });
  assert.deepEqual(
    transport.calls.map(({ pathname }) => pathname),
    ['/readyz', '/synthesize', '/readyz', '/readyz', '/transcribe', '/readyz'],
  );
  let aligned = await reopened.advance('owner-b');
  assert.equal(aligned.phase, 'aligned');
  assert.equal(aligned.alignment.sequence.contractVersion, 'workspace-aligned-sequence-v3');
  assert.equal(aligned.alignment.sequence.timelineHash, plan.timeline.hash);
  assert.deepEqual(aligned.alignment.sequence.turns[0].words, [
    { text: 'Alpha', startMs: 0, endMs: 200 },
    { text: 'beta', startMs: 250, endMs: 500 },
    { text: 'gamma', startMs: 550, endMs: 900 },
  ]);
  assert.equal(aligned.alignment.metrics.timingCoverage, 1);
  let verified = await reopened.advance('owner-b');
  assert.equal(verified.phase, 'entry-verified');
  assert.equal(verified.verification.timingCoverage, 1);
  assert.deepEqual(
    verified.verification.anchorCoverage[0].mappings.map((mapping) => (
      [mapping.authoredTokenIndex, mapping.operation, mapping.observedWord.text]
    )),
    [[0, 'match', 'Alpha'], [1, 'match', 'beta'], [2, 'match', 'gamma']],
  );
  assert.equal(transport.calls.length, 6);
  assert.deepEqual(await reopened.advance('owner-b'), verified);
  assert.equal(transport.calls.length, 6);

  let head = await run.readHead();
  assert.equal(head.state.attemptHashes.length, 6);
  for (let [index, attemptHash] of head.state.attemptHashes.entries()) {
    let completed = await run.readObject(attemptHash);
    let dispatched = await run.readObject(completed.dispatchedAttemptHash);
    assert.equal(completed.kind, EXPECTED_ATTEMPT_KINDS[index]);
    assert.equal(completed.status, 'completed');
    assert.equal(dispatched.kind, completed.kind);
    assert.equal(dispatched.status, 'dispatched');
  }
  assert.equal(scenario.dispatchSnapshots.length, 6);
});

test('persists an unknown dispatch outcome and never retries it after reopening', async (t) => {
  let scenario = await createScenario(t, { throwAtCall: 1 });
  await scenario.handle.initialize();

  let unknown = await scenario.handle.advance('owner-unknown');
  assert.equal(unknown.phase, 'outcome-unknown');
  assert.equal(unknown.failure.code, 'CV_SHOW_AUDIO_PIPELINE_OUTCOME_UNKNOWN');
  assert.equal(scenario.transport.calls.length, 1);
  let attempt = await scenario.run.readObject(unknown.attemptHashes[0]);
  assert.equal(attempt.status, 'dispatched');

  let reopened = scenario.runner.openEntry(scenario.plan);
  assert.deepEqual(await reopened.initialize(), unknown);
  assert.deepEqual(await reopened.advance('owner-reopen'), unknown);
  assert.equal(scenario.transport.calls.length, 1);
});

test('blocks readiness drift after storing the exact validated result', async (t) => {
  let drifted = { ...READY, modelVersion: 'qwen-revision-b|whisper-revision-a' };
  let scenario = await createScenario(t, {
    readiness: [READY, drifted],
  });
  await scenario.handle.initialize();

  let blocked = await scenario.handle.advance('owner-drift');
  assert.equal(blocked.phase, 'blocked');
  assert.equal(blocked.failure.code, 'CV_SHOW_AUDIO_PIPELINE_READINESS_MISMATCH');
  assert.equal(scenario.transport.calls.length, 3);
  let postAttempt = await scenario.run.readObject(blocked.attemptHashes[2]);
  assert.equal(postAttempt.status, 'completed');
  assert.deepEqual(postAttempt.response, drifted);
  assert.deepEqual(await scenario.handle.advance('owner-drift'), blocked);
  assert.equal(scenario.transport.calls.length, 3);
});

test('requires exact review hashes and makes rejection terminal before transcription', async (t) => {
  let scenario = await createScenario(t);
  await scenario.handle.initialize();
  let technical = await scenario.handle.advance('owner-review');

  await assert.rejects(
    scenario.handle.reviewClip({
      ownerToken: 'owner-review',
      approved: true,
      wavHash: 'f'.repeat(64),
      synthesisAttemptHash: technical.synthesis.attemptHash,
    }),
    { code: 'CV_SHOW_AUDIO_PIPELINE_REVIEW_MISMATCH' },
  );
  await assert.rejects(
    scenario.handle.reviewClip({
      ownerToken: 'owner-review',
      approved: true,
      wavHash: technical.synthesis.wavHash,
      synthesisAttemptHash: 'e'.repeat(64),
    }),
    { code: 'CV_SHOW_AUDIO_PIPELINE_REVIEW_MISMATCH' },
  );
  assert.equal((await scenario.handle.inspect()).phase, 'technical-verified');

  let rejected = await scenario.handle.reviewClip({
    ownerToken: 'owner-review',
    approved: false,
    wavHash: technical.synthesis.wavHash,
    synthesisAttemptHash: technical.synthesis.attemptHash,
  });
  assert.equal(rejected.phase, 'clip-rejected');
  assert.equal(rejected.failure.code, 'CV_SHOW_AUDIO_PIPELINE_CLIP_REJECTED');
  assert.deepEqual(await scenario.handle.advance('owner-review'), rejected);
  assert.equal(scenario.transport.calls.length, 3);
});

test('stores a known invalid receipt as blocked instead of partial success', async (t) => {
  let scenario = await createScenario(t, {
    synthesisReceiptOverride: { artifactHash: 'f'.repeat(64) },
  });
  await scenario.handle.initialize();

  let blocked = await scenario.handle.advance('owner-receipt');
  assert.equal(blocked.phase, 'blocked');
  assert.equal(blocked.failure.code, 'CV_SHOW_AUDIO_PIPELINE_MODEL_RESULT_INVALID');
  assert.equal(scenario.transport.calls.length, 2);
  let attempt = await scenario.run.readObject(blocked.attemptHashes[1]);
  assert.equal(attempt.status, 'invalid');
});

test('blocks incomplete aggregate timing after alignment without promoting the entry', async (t) => {
  let incompleteAlignment = (timeline, input) => {
    let result = createPresentationObservedAlignment(timeline, input);
    return {
      ...result,
      metrics: {
        ...result.metrics,
        timedTokenCount: result.metrics.timedTokenCount - 1,
        timingCoverage: 2 / 3,
      },
    };
  };
  let scenario = await createScenario(t, {
    createObservedAlignment: incompleteAlignment,
  });
  await scenario.handle.initialize();
  await synthesizeAndApprove(scenario);
  let aligned = await transcribeAndAlign(scenario);
  assert.equal(aligned.alignment.metrics.timingCoverage, 2 / 3);

  let blocked = await scenario.handle.advance('owner-a');
  assert.equal(blocked.phase, 'blocked');
  assert.equal(blocked.failure.code, 'CV_SHOW_AUDIO_PIPELINE_TIMING_INCOMPLETE');
  assert.equal(blocked.verification, null);
});

test('blocks a required authored token deleted by strict observed alignment', async (t) => {
  let plan = createPlan({
    requiredAnchors: [{
      anchorId: 'required-beta',
      turnIndex: 0,
      authoredTokenIndexes: [1],
    }],
  });
  let scenario = await createScenario(t, {
    plan,
    transcript: DELETED_TOKEN_TRANSCRIPT,
  });
  await scenario.handle.initialize();
  await synthesizeAndApprove(scenario);
  let aligned = await transcribeAndAlign(scenario);
  let betaOperation = aligned.alignment.anchorings[0].operations.find(
    ({ authoredToken }) => authoredToken?.index === 1,
  );
  assert.equal(betaOperation.operation, 'delete');
  assert.equal(betaOperation.observedWord, null);

  let blocked = await scenario.handle.advance('owner-a');
  assert.equal(blocked.phase, 'blocked');
  assert.equal(blocked.failure.code, 'CV_SHOW_AUDIO_PIPELINE_REQUIRED_ANCHOR_MISSING');
  assert.equal(scenario.transport.calls.length, 6);
});

test('rejects unexpected public input keys and stale timeline hashes', async (t) => {
  let storageRoot = await temporaryRoot(t);
  let storage = createCvShowAudioPipelineStorage({ storageRoot });
  let modelClient = Object.freeze({
    readiness: async () => READY,
    synthesize: async () => undefined,
    transcribe: async () => undefined,
  });
  assert.throws(
    () => createCvShowAudioPipelineRunner({ storage, modelClient, extra: true }),
    { code: 'CV_SHOW_AUDIO_PIPELINE_INVALID' },
  );
  let runner = createCvShowAudioPipelineRunner({ storage, modelClient });
  assert.throws(
    () => runner.openEntry({ ...createPlan(), extra: true }),
    { code: 'CV_SHOW_AUDIO_PIPELINE_INVALID' },
  );
  let stalePlan = createPlan();
  stalePlan.timeline = { ...stalePlan.timeline, hash: 'presentation-timeline-v3:stale' };
  assert.throws(
    () => runner.openEntry(stalePlan),
    { code: 'CV_SHOW_AUDIO_PIPELINE_INVALID' },
  );
});

test('preserves exact leading and trailing observed transcript text through verification', async (t) => {
  let transcript = {
    text: ' Alpha beta gamma ',
    durationSec: 1,
    words: [
      { word: ' Alpha ', startSec: 0, endSec: 0.2 },
      { word: 'beta', startSec: 0.25, endSec: 0.5 },
      { word: ' gamma ', startSec: 0.55, endSec: 0.9 },
    ],
  };
  let scenario = await createScenario(t, { transcript });
  await scenario.handle.initialize();
  await synthesizeAndApprove(scenario);

  let transcribed = await scenario.handle.advance('owner-a');
  assert.equal(transcribed.phase, 'transcribed');
  assert.equal(transcribed.transcript.text, transcript.text);
  assert.deepEqual(transcribed.transcript.words, transcript.words);
  let aligned = await scenario.handle.advance('owner-a');
  assert.equal(aligned.phase, 'aligned');
  assert.equal(aligned.alignment.sequence.turns[0].transcript, transcript.text);
  assert.deepEqual(
    aligned.alignment.sequence.turns[0].words.map(({ text }) => text),
    transcript.words.map(({ word }) => word),
  );
  assert.equal(aligned.alignment.anchorings[0].observed.transcript, transcript.text);
  let verified = await scenario.handle.advance('owner-a');
  assert.equal(verified.phase, 'entry-verified');
  assert.equal(verified.transcript.text, transcript.text);
});

test('rejects every service-invalid synthesis plan before initialization or readiness', async (t) => {
  let storageRoot = await temporaryRoot(t);
  let storage = createCvShowAudioPipelineStorage({ storageRoot });
  let readinessCalls = 0;
  let modelClient = {
    readiness: async () => {
      readinessCalls += 1;
      return READY;
    },
    synthesize: async () => undefined,
    transcribe: async () => undefined,
  };
  let runner = createCvShowAudioPipelineRunner({ storage, modelClient });
  let withText = (text) => {
    let plan = createPlan();
    let timeline = createPresentationTimelineContract({
      ...plan.timeline,
      turns: [{ ...plan.timeline.turns[0], text }],
    });
    return { ...plan, timeline, synthesisItem: { ...plan.synthesisItem, text } };
  };
  let withLanguage = (language) => {
    let plan = createPlan();
    let timeline = createPresentationTimelineContract({
      ...plan.timeline,
      locale: language,
    });
    return {
      ...plan,
      timeline,
      locale: language,
      synthesisItem: { ...plan.synthesisItem, language },
    };
  };
  let invalidPlans = [];
  for (let sentinel of ['None', 'null', 'undefined']) {
    invalidPlans.push({
      ...createPlan(),
      entryId: sentinel,
      synthesisItem: { ...createPlan().synthesisItem, id: sentinel },
    });
    invalidPlans.push(withText(sentinel));
    invalidPlans.push(withLanguage(sentinel));
    invalidPlans.push({
      ...createPlan(),
      synthesisItem: { ...createPlan().synthesisItem, voiceRef: sentinel },
    });
    invalidPlans.push({
      ...createPlan(),
      synthesisItem: { ...createPlan().synthesisItem, style: sentinel },
    });
  }
  invalidPlans.push({
    ...createPlan(),
    synthesisItem: { ...createPlan().synthesisItem, style: ' calm ' },
  });
  for (let voiceRef of [
    '.private-voice',
    'voices/private',
    'voices\\private',
    'https://voices.example.test/private',
    'file:///private/voice',
  ]) {
    invalidPlans.push({
      ...createPlan(),
      synthesisItem: { ...createPlan().synthesisItem, voiceRef },
    });
  }
  for (let plan of invalidPlans) {
    assert.throws(
      () => runner.openEntry(plan),
      { code: 'CV_SHOW_AUDIO_PIPELINE_INVALID' },
    );
  }
  assert.doesNotThrow(() => runner.openEntry({
    ...createPlan(),
    synthesisItem: { ...createPlan().synthesisItem, style: '' },
  }));
  assert.equal(readinessCalls, 0);
});

test('rejects fabricated alignment mappings and forged terminal anchor coverage', async (t) => {
  let fabricateObservedWord = (timeline, input) => {
    let result = structuredClone(createPresentationObservedAlignment(timeline, input));
    let operation = result.anchorings[0].operations.find(
      ({ authoredToken }) => authoredToken?.index === 1,
    );
    operation.observedWord = {
      index: 99,
      text: 'fabricated',
      startMs: 901,
      endMs: 999,
    };
    return result;
  };
  let fabricated = await createScenario(t, {
    createObservedAlignment: fabricateObservedWord,
  });
  await fabricated.handle.initialize();
  await synthesizeAndApprove(fabricated);
  let transcribed = await fabricated.handle.advance('owner-a');
  assert.equal(transcribed.phase, 'transcribed');
  let blocked = await fabricated.handle.advance('owner-a');
  assert.equal(blocked.phase, 'blocked');
  assert.equal(blocked.failure.code, 'CV_SHOW_AUDIO_PIPELINE_ALIGNMENT_FAILED');

  let forged = await createScenario(t);
  await forged.handle.initialize();
  await synthesizeAndApprove(forged);
  await transcribeAndAlign(forged);
  let verified = await forged.handle.advance('owner-a');
  assert.equal(verified.phase, 'entry-verified');
  await replaceDurableState(forged.run, (state) => {
    state.verification.anchorCoverage[0].mappings[0].observedWord = {
      index: 99,
      text: 'fabricated',
      startMs: 901,
      endMs: 999,
    };
    return state;
  });
  await assert.rejects(
    forged.handle.inspect(),
    { code: 'CV_SHOW_AUDIO_PIPELINE_STATE_INVALID' },
  );
});

test('retries blocked transcription verification without replacing the approved WAV', async (t) => {
  let alignmentCalls = 0;
  let scenario = await createScenario(t, {
    readiness: [READY, READY, READY, READY, READY, READY],
    createObservedAlignment: (...args) => {
      alignmentCalls += 1;
      if (alignmentCalls === 1) {
        throw Object.assign(new TypeError('simulated punctuation normalization failure'), {
          code: 'PRESENTATION_OBSERVED_ALIGNMENT_TRANSCRIPT_WORD_MISMATCH',
        });
      }
      return createPresentationObservedAlignment(...args);
    },
  });
  await scenario.handle.initialize();
  let reviewed = await synthesizeAndApprove(scenario);
  let approvedWavHash = reviewed.synthesis.wavHash;
  let approvedAttemptHash = reviewed.synthesis.attemptHash;
  let transcribed = await scenario.handle.advance('owner-a');
  assert.equal(transcribed.phase, 'transcribed');
  let blocked = await scenario.handle.advance('owner-a');
  assert.equal(blocked.phase, 'blocked');
  assert.equal(blocked.failure.stage, 'alignment');

  let retried = await scenario.handle.retryVerification('owner-a');

  assert.equal(retried.phase, 'clip-reviewed');
  assert.equal(retried.synthesis.wavHash, approvedWavHash);
  assert.equal(retried.synthesis.attemptHash, approvedAttemptHash);
  assert.equal(retried.review.approved, true);
  assert.equal(retried.transcript, null);
  assert.equal(retried.alignment, null);
  assert.equal(retried.verification, null);
  assert.equal(retried.failure, null);
  assert.equal(retried.attemptHashes.length, 3);

  assert.equal((await scenario.handle.advance('owner-a')).phase, 'transcribed');
  assert.equal((await scenario.handle.advance('owner-a')).phase, 'aligned');
  assert.equal((await scenario.handle.advance('owner-a')).phase, 'entry-verified');
  assert.equal(alignmentCalls, 2);
});

test('retries outcome-unknown transcription without replacing the approved WAV', async (t) => {
  let scenario = await createScenario(t, { throwAtCall: 5 });
  await scenario.handle.initialize();
  let reviewed = await synthesizeAndApprove(scenario);
  let unknown = await scenario.handle.advance('owner-a');
  assert.equal(unknown.phase, 'outcome-unknown');
  assert.equal(unknown.failure.stage, 'transcription');

  let retried = await scenario.handle.retryVerification('owner-a');

  assert.equal(retried.phase, 'clip-reviewed');
  assert.equal(retried.synthesis.wavHash, reviewed.synthesis.wavHash);
  assert.equal(retried.review.approved, true);
  assert.equal(retried.transcript, null);
  assert.equal(retried.failure, null);
  assert.equal(retried.attemptHashes.length, 3);
});

test('retries a blocked entry from synthesis without retaining stale media evidence', async (t) => {
  let scenario = await createScenario(t, {
    createObservedAlignment: () => {
      throw Object.assign(new TypeError('simulated audible mismatch'), {
        code: 'PRESENTATION_OBSERVED_ALIGNMENT_TRANSCRIPT_WORD_MISMATCH',
      });
    },
  });
  await scenario.handle.initialize();
  await synthesizeAndApprove(scenario);
  assert.equal((await scenario.handle.advance('owner-a')).phase, 'transcribed');
  let blocked = await scenario.handle.advance('owner-a');
  assert.equal(blocked.phase, 'blocked');

  let retried = await scenario.handle.retrySynthesis('owner-a');

  assert.equal(retried.phase, 'planned');
  assert.deepEqual(retried.attemptHashes, []);
  assert.equal(retried.synthesis, null);
  assert.equal(retried.review, null);
  assert.equal(retried.transcript, null);
  assert.equal(retried.alignment, null);
  assert.equal(retried.verification, null);
  assert.equal(retried.failure, null);
});

test('rejects forged synthesis, transcript, and transcription-intent state linkage', async (t) => {
  let forgedSynthesis = await createScenario(t);
  await forgedSynthesis.handle.initialize();
  let technical = await forgedSynthesis.handle.advance('owner-a');
  assert.equal(technical.phase, 'technical-verified');
  await replaceDurableState(forgedSynthesis.run, (state) => {
    state.synthesis.durationSec = 0.75;
    return state;
  });
  await assert.rejects(
    forgedSynthesis.handle.inspect(),
    { code: 'CV_SHOW_AUDIO_PIPELINE_STATE_INVALID' },
  );

  let alignmentCalls = 0;
  let forgedTranscript = await createScenario(t, {
    createObservedAlignment: (...args) => {
      alignmentCalls += 1;
      return createPresentationObservedAlignment(...args);
    },
  });
  await forgedTranscript.handle.initialize();
  await synthesizeAndApprove(forgedTranscript);
  let transcribed = await forgedTranscript.handle.advance('owner-a');
  assert.equal(transcribed.phase, 'transcribed');
  await replaceDurableState(forgedTranscript.run, (state) => {
    state.transcript.text = 'Alpha beta delta';
    state.transcript.words[2].word = 'delta';
    return state;
  });
  await assert.rejects(
    forgedTranscript.handle.inspect(),
    { code: 'CV_SHOW_AUDIO_PIPELINE_STATE_INVALID' },
  );
  await assert.rejects(
    forgedTranscript.handle.advance('owner-a'),
    { code: 'CV_SHOW_AUDIO_PIPELINE_STATE_INVALID' },
  );
  assert.equal(alignmentCalls, 0);

  let forgedIntent = await createScenario(t);
  await forgedIntent.handle.initialize();
  await synthesizeAndApprove(forgedIntent);
  await forgedIntent.handle.advance('owner-a');
  let head = await forgedIntent.run.readHead();
  let completed = await forgedIntent.run.readObject(head.state.attemptHashes[4]);
  let dispatched = await forgedIntent.run.readObject(completed.dispatchedAttemptHash);
  let dispatchedAttemptHash = await forgedIntent.run.putObject({
    ...dispatched,
    request: { ...dispatched.request, wavHash: 'f'.repeat(64) },
  });
  let completedAttemptHash = await forgedIntent.run.putObject({
    ...completed,
    dispatchedAttemptHash,
  });
  let forgedState = structuredClone(head.state);
  forgedState.attemptHashes[4] = completedAttemptHash;
  forgedState.transcript.attemptHash = completedAttemptHash;
  let stateHash = await forgedIntent.run.putObject(forgedState);
  await forgedIntent.run.compareAndSwapHead(head.headHash, stateHash);
  await assert.rejects(
    forgedIntent.handle.inspect(),
    { code: 'CV_SHOW_AUDIO_PIPELINE_STATE_INVALID' },
  );
});

test('treats a thrown model HTTP failure as unknown and never retries it', async (t) => {
  let scenario = await createScenario(t, { httpStatusAtCall: 1 });
  await scenario.handle.initialize();

  let unknown = await scenario.handle.advance('owner-http');
  assert.equal(unknown.phase, 'outcome-unknown');
  assert.equal(unknown.failure.code, 'CV_SHOW_AUDIO_PIPELINE_OUTCOME_UNKNOWN');
  let attempt = await scenario.run.readObject(unknown.attemptHashes[0]);
  assert.equal(attempt.status, 'dispatched');
  assert.equal(scenario.transport.calls.length, 1);
  let reopened = scenario.runner.openEntry(scenario.plan);
  assert.deepEqual(await reopened.advance('owner-reopen'), unknown);
  assert.equal(scenario.transport.calls.length, 1);
});
