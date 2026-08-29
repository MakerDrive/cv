import { createHash } from 'node:crypto';

import {
  createPresentationObservedAlignment as createWorkspaceObservedAlignment,
  createPresentationTimelineContract,
} from 'symbiote-workspace';
import {
  canonicalize,
  computeIntegrity,
} from 'symbiote-workspace/schema/canonical-json.js';

const STATE_SCHEMA_VERSION = 'cv-show-audio-pipeline-entry-state-v1';
const ATTEMPT_SCHEMA_VERSION = 'cv-show-audio-pipeline-attempt-v1';
const ALIGNED_SEQUENCE_VERSION = 'workspace-aligned-sequence-v3';
const ANCHORING_VERSION = 'workspace-transcript-word-anchoring-v1';
const SHA256_PATTERN = /^[a-f0-9]{64}$/u;
const ID_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._:-]{0,255}$/u;
const SERVICE_SENTINELS = new Set(['None', 'null', 'undefined']);
const PLAN_KEYS = Object.freeze([
  'entryId',
  'timeline',
  'synthesisItem',
  'locale',
  'voice',
  'readinessProfile',
  'requiredAnchors',
]);
const STATE_KEYS = Object.freeze([
  'schemaVersion',
  'plan',
  'phase',
  'attemptHashes',
  'synthesis',
  'review',
  'transcript',
  'alignment',
  'verification',
  'failure',
]);
const READINESS_KEYS = Object.freeze([
  'ready',
  'status',
  'model',
  'modelVersion',
  'accelerator',
  'capabilities',
]);
const METRIC_KEYS = Object.freeze([
  'authoredTokenCount',
  'recognizedTokenCount',
  'timedTokenCount',
  'editDistance',
  'wer',
  'editSimilarity',
  'exactCorrespondence',
  'timingCoverage',
]);
const ATTEMPT_KINDS = Object.freeze([
  'synthesis-readiness-pre',
  'synthesis',
  'synthesis-readiness-post',
  'transcription-readiness-pre',
  'transcription',
  'transcription-readiness-post',
]);
const TERMINAL_PHASES = new Set([
  'blocked',
  'clip-rejected',
  'outcome-unknown',
  'entry-verified',
]);
const PHASES = new Set([
  'planned',
  'synthesis-dispatched',
  'synthesized',
  'technical-verified',
  'clip-reviewed',
  'transcription-dispatched',
  'transcribed',
  'aligned',
  ...TERMINAL_PHASES,
]);
const FORBIDDEN_PLAN_KEYS = new Set([
  'accesskey',
  'apikey',
  'authorization',
  'cookie',
  'credential',
  'endpoint',
  'headers',
  'password',
  'secret',
]);

function fail(code, message, details = {}) {
  throw Object.assign(new TypeError(message), {
    code,
    details: Object.freeze({ ...details }),
  });
}

function isPlainObject(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  let prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function exactKeys(value, expected) {
  if (!isPlainObject(value)) return false;
  let actual = Object.keys(value).sort();
  let required = [...expected].sort();
  return actual.length === required.length
    && actual.every((key, index) => key === required[index]);
}

function requireObject(value, expected, field) {
  if (!exactKeys(value, expected)) {
    fail(
      'CV_SHOW_AUDIO_PIPELINE_INVALID',
      `CV Show audio pipeline ${field} has unexpected or missing fields`,
    );
  }
  return value;
}

function requireString(value, field, { allowEmpty = false } = {}) {
  if (
    typeof value !== 'string'
    || value.includes('\0')
    || value !== value.normalize('NFC')
    || value !== value.trim()
    || (!allowEmpty && !value)
  ) {
    fail(
      'CV_SHOW_AUDIO_PIPELINE_INVALID',
      `CV Show audio pipeline ${field} must be exact normalized text`,
    );
  }
  return value;
}

function requireObservedText(value, field) {
  if (
    typeof value !== 'string'
    || value.includes('\0')
    || value !== value.normalize('NFC')
    || !value.trim()
  ) {
    fail(
      'CV_SHOW_AUDIO_PIPELINE_INVALID',
      `CV Show audio pipeline ${field} must be exact nonempty observed text`,
    );
  }
  return value;
}

function requireServiceString(value, field, { allowEmpty = false } = {}) {
  let text = requireString(value, field, { allowEmpty });
  if (text !== '' && SERVICE_SENTINELS.has(text)) {
    fail(
      'CV_SHOW_AUDIO_PIPELINE_INVALID',
      `CV Show audio pipeline ${field} must identify an explicit service value`,
    );
  }
  return text;
}

function requirePortableVoiceRef(value) {
  let voiceRef = requireServiceString(value, 'synthesis item voiceRef');
  if (
    voiceRef.startsWith('.')
    || voiceRef.includes('/')
    || voiceRef.includes('\\')
    || /^[A-Za-z]+:\/\//u.test(voiceRef)
  ) {
    fail(
      'CV_SHOW_AUDIO_PIPELINE_INVALID',
      'CV Show audio pipeline synthesis item voiceRef must be a portable public voice ID',
    );
  }
  return voiceRef;
}

function requireHash(value, field) {
  if (typeof value !== 'string' || !SHA256_PATTERN.test(value)) {
    fail(
      'CV_SHOW_AUDIO_PIPELINE_INVALID',
      `CV Show audio pipeline ${field} must be a lowercase hexadecimal SHA-256`,
    );
  }
  return value;
}

function requirePositive(value, field) {
  if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0) {
    fail(
      'CV_SHOW_AUDIO_PIPELINE_INVALID',
      `CV Show audio pipeline ${field} must be a positive finite number`,
    );
  }
  return value;
}

function validateJson(value, field, ancestors = new Set()) {
  if (value === null || typeof value === 'string' || typeof value === 'boolean') return;
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) {
      fail('CV_SHOW_AUDIO_PIPELINE_INVALID', `CV Show audio pipeline ${field} is not JSON`);
    }
    return;
  }
  if (typeof value !== 'object' || ancestors.has(value)) {
    fail('CV_SHOW_AUDIO_PIPELINE_INVALID', `CV Show audio pipeline ${field} is not JSON`);
  }
  ancestors.add(value);
  if (Array.isArray(value)) {
    let keys = Object.keys(value);
    if (
      keys.length !== value.length
      || keys.some((key, index) => key !== String(index))
      || Object.getOwnPropertySymbols(value).length
    ) {
      fail('CV_SHOW_AUDIO_PIPELINE_INVALID', `CV Show audio pipeline ${field} is not JSON`);
    }
    for (let [index, child] of value.entries()) {
      validateJson(child, `${field}[${index}]`, ancestors);
    }
  } else {
    if (!isPlainObject(value) || Object.getOwnPropertySymbols(value).length) {
      fail('CV_SHOW_AUDIO_PIPELINE_INVALID', `CV Show audio pipeline ${field} is not JSON`);
    }
    for (let [key, child] of Object.entries(value)) {
      let descriptor = Object.getOwnPropertyDescriptor(value, key);
      if (!descriptor?.enumerable || !Object.hasOwn(descriptor, 'value')) {
        fail('CV_SHOW_AUDIO_PIPELINE_INVALID', `CV Show audio pipeline ${field} is not JSON`);
      }
      validateJson(child, `${field}.${key}`, ancestors);
    }
  }
  ancestors.delete(value);
}

function cloneJson(value, field) {
  validateJson(value, field);
  return structuredClone(value);
}

function freezeDeep(value) {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
  for (let child of Object.values(value)) freezeDeep(child);
  return Object.freeze(value);
}

function publicValue(value) {
  return freezeDeep(cloneJson(value, 'public output'));
}

function sameJson(left, right) {
  return canonicalize(left) === canonicalize(right);
}

function assertPortablePlan(value, field = 'plan') {
  if (typeof value === 'string') {
    if (/^(?:file:\/\/|\/(?:Users|home|private|tmp|var)\/|[A-Za-z]:[\\/])/u.test(value)) {
      fail(
        'CV_SHOW_AUDIO_PIPELINE_INVALID',
        `CV Show audio pipeline ${field} must not contain a local absolute path`,
      );
    }
    return;
  }
  if (!value || typeof value !== 'object') return;
  for (let [key, child] of Object.entries(value)) {
    if (FORBIDDEN_PLAN_KEYS.has(key.toLowerCase())) {
      fail(
        'CV_SHOW_AUDIO_PIPELINE_INVALID',
        `CV Show audio pipeline ${field} must not contain private connection data`,
      );
    }
    assertPortablePlan(child, `${field}.${key}`);
  }
}

function normalizeReadiness(value, field = 'readiness profile') {
  let source = requireObject(value, READINESS_KEYS, field);
  if (source.ready !== true || source.status !== 'ready') {
    fail(
      'CV_SHOW_AUDIO_PIPELINE_INVALID',
      `CV Show audio pipeline ${field} must be exactly ready`,
    );
  }
  let model = requireString(source.model, `${field} model`);
  let modelVersion = requireString(source.modelVersion, `${field} modelVersion`);
  let accelerator = requireString(source.accelerator, `${field} accelerator`);
  if (
    !model.toLowerCase().includes('qwen')
    || !model.toLowerCase().includes('whisper')
    || accelerator.toLowerCase() !== 'cuda'
    || /(?:fake|mock|stub)/iu.test(`${model} ${modelVersion}`)
  ) {
    fail(
      'CV_SHOW_AUDIO_PIPELINE_INVALID',
      `CV Show audio pipeline ${field} must identify real Qwen and Whisper CUDA models`,
    );
  }
  if (
    !Array.isArray(source.capabilities)
    || source.capabilities.some((capability) => (
      typeof capability !== 'string'
      || !capability
      || capability !== capability.trim()
      || capability !== capability.normalize('NFC')
    ))
  ) {
    fail(
      'CV_SHOW_AUDIO_PIPELINE_INVALID',
      `CV Show audio pipeline ${field} capabilities must be exact strings`,
    );
  }
  return {
    ready: true,
    status: 'ready',
    model,
    modelVersion,
    accelerator,
    capabilities: [...source.capabilities],
  };
}

function normalizeSynthesisItem(value) {
  let source = requireObject(
    value,
    ['id', 'text', 'language', 'voiceRef', 'style'],
    'synthesis item',
  );
  return {
    id: requireServiceString(source.id, 'synthesis item id'),
    text: requireServiceString(source.text, 'synthesis item text'),
    language: requireServiceString(source.language, 'synthesis item language'),
    voiceRef: requirePortableVoiceRef(source.voiceRef),
    style: requireServiceString(source.style, 'synthesis item style', { allowEmpty: true }),
  };
}

function normalizeVoice(value) {
  let source = requireObject(value, ['mode', 'speakerId'], 'voice identity');
  if (source.mode !== 'single') {
    fail(
      'CV_SHOW_AUDIO_PIPELINE_INVALID',
      'CV Show audio pipeline voice identity must use single-speaker mode',
    );
  }
  return {
    mode: 'single',
    speakerId: requireString(source.speakerId, 'voice speakerId'),
  };
}

function normalizeRequiredAnchors(value) {
  if (!Array.isArray(value)) {
    fail('CV_SHOW_AUDIO_PIPELINE_INVALID', 'CV Show audio pipeline required anchors must be an array');
  }
  let anchorIds = new Set();
  return value.map((anchor, anchorIndex) => {
    let source = requireObject(
      anchor,
      ['anchorId', 'turnIndex', 'authoredTokenIndexes'],
      `required anchor ${anchorIndex}`,
    );
    let anchorId = requireString(source.anchorId, `required anchor ${anchorIndex} id`);
    if (!ID_PATTERN.test(anchorId) || anchorIds.has(anchorId)) {
      fail(
        'CV_SHOW_AUDIO_PIPELINE_INVALID',
        `CV Show audio pipeline required anchor ${anchorIndex} id is invalid or duplicated`,
      );
    }
    anchorIds.add(anchorId);
    if (source.turnIndex !== 0) {
      fail(
        'CV_SHOW_AUDIO_PIPELINE_INVALID',
        `CV Show audio pipeline required anchor ${anchorIndex} must target the single turn`,
      );
    }
    if (!Array.isArray(source.authoredTokenIndexes) || !source.authoredTokenIndexes.length) {
      fail(
        'CV_SHOW_AUDIO_PIPELINE_INVALID',
        `CV Show audio pipeline required anchor ${anchorIndex} needs authored token indexes`,
      );
    }
    let prior = -1;
    let authoredTokenIndexes = source.authoredTokenIndexes.map((tokenIndex) => {
      if (!Number.isSafeInteger(tokenIndex) || tokenIndex < 0 || tokenIndex <= prior) {
        fail(
          'CV_SHOW_AUDIO_PIPELINE_INVALID',
          `CV Show audio pipeline required anchor ${anchorIndex} token indexes must be ordered`,
        );
      }
      prior = tokenIndex;
      return tokenIndex;
    });
    return { anchorId, turnIndex: 0, authoredTokenIndexes };
  });
}

function normalizePlan(value) {
  let source = cloneJson(value, 'entry plan');
  requireObject(source, PLAN_KEYS, 'entry plan');
  assertPortablePlan(source);
  let timeline;
  try {
    timeline = createPresentationTimelineContract(source.timeline);
  } catch (error) {
    fail(
      'CV_SHOW_AUDIO_PIPELINE_INVALID',
      `CV Show audio pipeline timeline is invalid: ${error.message}`,
    );
  }
  if (!sameJson(timeline, source.timeline) || timeline.turns.length !== 1) {
    fail(
      'CV_SHOW_AUDIO_PIPELINE_INVALID',
      'CV Show audio pipeline plan requires one exact current authored-turn timeline',
    );
  }
  let entryId = requireString(source.entryId, 'entry ID');
  if (!ID_PATTERN.test(entryId)) {
    fail('CV_SHOW_AUDIO_PIPELINE_INVALID', 'CV Show audio pipeline entry ID is invalid');
  }
  let synthesisItem = normalizeSynthesisItem(source.synthesisItem);
  let locale = requireString(source.locale, 'locale');
  if (
    synthesisItem.id !== entryId
    || synthesisItem.text !== timeline.turns[0].text
    || locale !== timeline.locale
  ) {
    fail(
      'CV_SHOW_AUDIO_PIPELINE_INVALID',
      'CV Show audio pipeline plan does not bind the entry, authored text, and locale exactly',
    );
  }
  return freezeDeep({
    entryId,
    timeline,
    synthesisItem,
    locale,
    voice: normalizeVoice(source.voice),
    readinessProfile: normalizeReadiness(source.readinessProfile),
    requiredAnchors: normalizeRequiredAnchors(source.requiredAnchors),
  });
}

function createInitialState(plan) {
  return {
    schemaVersion: STATE_SCHEMA_VERSION,
    plan,
    phase: 'planned',
    attemptHashes: [],
    synthesis: null,
    review: null,
    transcript: null,
    alignment: null,
    verification: null,
    failure: null,
  };
}

function validateFailure(value) {
  if (value === null) return;
  let source = requireObject(value, ['code', 'stage', 'evidence'], 'failure');
  if (
    typeof source.code !== 'string'
    || !source.code.startsWith('CV_SHOW_AUDIO_PIPELINE_')
    || typeof source.stage !== 'string'
    || !isPlainObject(source.evidence)
  ) {
    fail('CV_SHOW_AUDIO_PIPELINE_INVALID', 'CV Show audio pipeline failure evidence is invalid');
  }
}

function validateSynthesis(value) {
  if (value === null) return;
  let source = requireObject(
    value,
    ['attemptHash', 'wavHash', 'durationSec', 'sampleRate', 'receipt'],
    'synthesis state',
  );
  requireHash(source.attemptHash, 'synthesis attempt hash');
  requireHash(source.wavHash, 'synthesis WAV hash');
  requirePositive(source.durationSec, 'synthesis duration');
  if (!Number.isSafeInteger(source.sampleRate) || source.sampleRate < 1) {
    fail('CV_SHOW_AUDIO_PIPELINE_INVALID', 'CV Show audio pipeline sample rate is invalid');
  }
  if (!isPlainObject(source.receipt)) {
    fail('CV_SHOW_AUDIO_PIPELINE_INVALID', 'CV Show audio pipeline synthesis receipt is invalid');
  }
}

function validateReview(value) {
  if (value === null) return;
  let source = requireObject(
    value,
    ['approved', 'wavHash', 'synthesisAttemptHash'],
    'clip review',
  );
  if (typeof source.approved !== 'boolean') {
    fail('CV_SHOW_AUDIO_PIPELINE_INVALID', 'CV Show audio pipeline clip review decision is invalid');
  }
  requireHash(source.wavHash, 'review WAV hash');
  requireHash(source.synthesisAttemptHash, 'review synthesis attempt hash');
}

function normalizeTranscript(value) {
  let source = requireObject(value, ['text', 'durationSec', 'words'], 'transcript');
  let text = requireObservedText(source.text, 'transcript text');
  let durationSec = requirePositive(source.durationSec, 'transcript duration');
  if (!Array.isArray(source.words) || !source.words.length) {
    fail('CV_SHOW_AUDIO_PIPELINE_INVALID', 'CV Show audio pipeline transcript words are incomplete');
  }
  let priorEnd = 0;
  let words = source.words.map((word, index) => {
    let item = requireObject(
      word,
      ['word', 'startSec', 'endSec'],
      `transcript word ${index}`,
    );
    if (
      typeof item.startSec !== 'number'
      || !Number.isFinite(item.startSec)
      || typeof item.endSec !== 'number'
      || !Number.isFinite(item.endSec)
      || item.startSec < priorEnd
      || item.endSec <= item.startSec
      || item.endSec > durationSec
    ) {
      fail(
        'CV_SHOW_AUDIO_PIPELINE_INVALID',
        `CV Show audio pipeline transcript word ${index} timing is invalid`,
      );
    }
    priorEnd = item.endSec;
    return {
      word: requireObservedText(item.word, `transcript word ${index} text`),
      startSec: item.startSec,
      endSec: item.endSec,
    };
  });
  return { text, durationSec, words };
}

function validateTranscriptState(value) {
  if (value === null) return;
  let source = requireObject(
    value,
    ['attemptHash', 'text', 'durationSec', 'words'],
    'transcript state',
  );
  requireHash(source.attemptHash, 'transcription attempt hash');
  normalizeTranscript({
    text: source.text,
    durationSec: source.durationSec,
    words: source.words,
  });
}

function validateMetrics(value, field) {
  let source = requireObject(value, METRIC_KEYS, field);
  for (let key of ['authoredTokenCount', 'recognizedTokenCount', 'timedTokenCount', 'editDistance']) {
    if (!Number.isSafeInteger(source[key]) || source[key] < 0) {
      fail('CV_SHOW_AUDIO_PIPELINE_INVALID', `CV Show audio pipeline ${field}.${key} is invalid`);
    }
  }
  for (let key of ['wer', 'editSimilarity', 'timingCoverage']) {
    if (typeof source[key] !== 'number' || !Number.isFinite(source[key])) {
      fail('CV_SHOW_AUDIO_PIPELINE_INVALID', `CV Show audio pipeline ${field}.${key} is invalid`);
    }
  }
  if (typeof source.exactCorrespondence !== 'boolean') {
    fail(
      'CV_SHOW_AUDIO_PIPELINE_INVALID',
      `CV Show audio pipeline ${field}.exactCorrespondence is invalid`,
    );
  }
}

function validateObservedWord(value, field, { mediaDurationMs = Number.MAX_SAFE_INTEGER } = {}) {
  if (value === null) return;
  let source = requireObject(value, ['index', 'text', 'startMs', 'endMs'], field);
  if (
    !Number.isSafeInteger(source.index)
    || source.index < 0
    || !Number.isSafeInteger(source.startMs)
    || !Number.isSafeInteger(source.endMs)
    || source.startMs < 0
    || source.endMs <= source.startMs
    || source.endMs > mediaDurationMs
  ) {
    fail('CV_SHOW_AUDIO_PIPELINE_INVALID', `CV Show audio pipeline ${field} timing is invalid`);
  }
  requireObservedText(source.text, `${field} text`);
  return source;
}

function normalizeAlignment(value, plan, synthesis, transcript) {
  if (!synthesis || !transcript) {
    fail(
      'CV_SHOW_AUDIO_PIPELINE_STATE_INVALID',
      'CV Show audio pipeline alignment requires exact synthesis and transcript evidence',
    );
  }
  let source = cloneJson(value, 'observed alignment output');
  requireObject(source, ['sequence', 'anchorings', 'metrics'], 'observed alignment output');
  let sequence = requireObject(source.sequence, [
    'contractVersion',
    'timelineHash',
    'media',
    'voice',
    'turns',
    'events',
    'hash',
  ], 'observed aligned sequence');
  if (
    sequence.contractVersion !== ALIGNED_SEQUENCE_VERSION
    || sequence.timelineHash !== plan.timeline.hash
    || !sameJson(sequence.voice, plan.voice)
    || !Array.isArray(sequence.turns)
    || sequence.turns.length !== 1
    || !Array.isArray(sequence.events)
    || sequence.events.length !== 0
  ) {
    fail(
      'CV_SHOW_AUDIO_PIPELINE_INVALID',
      'CV Show audio pipeline observed aligned sequence identity is invalid',
    );
  }
  let sequenceProjection = { ...sequence };
  delete sequenceProjection.hash;
  if (sequence.hash !== computeIntegrity(sequenceProjection)) {
    fail(
      'CV_SHOW_AUDIO_PIPELINE_INVALID',
      'CV Show audio pipeline observed aligned sequence hash is invalid',
    );
  }
  let media = requireObject(sequence.media, ['hash', 'durationMs', 'locale'], 'alignment media');
  if (
    media.hash !== synthesis.wavHash
    || media.durationMs !== Math.round(synthesis.durationSec * 1000)
    || media.locale !== plan.locale
  ) {
    fail('CV_SHOW_AUDIO_PIPELINE_INVALID', 'CV Show audio pipeline alignment media is stale');
  }
  let expectedWords = transcript.words.map((word) => ({
    text: word.word,
    startMs: wordMilliseconds(word.startSec, 'observed word start'),
    endMs: wordMilliseconds(word.endSec, 'observed word end'),
  }));
  let expectedTurn = {
    turnIndex: 0,
    startMs: 0,
    endMs: milliseconds(transcript.durationSec, 'transcript duration'),
    speaker: plan.voice.speakerId,
    transcript: transcript.text,
    words: expectedWords,
  };
  requireObject(
    sequence.turns[0],
    ['turnIndex', 'startMs', 'endMs', 'speaker', 'transcript', 'words'],
    'observed aligned turn',
  );
  if (!sameJson(sequence.turns[0], expectedTurn)) {
    fail(
      'CV_SHOW_AUDIO_PIPELINE_INVALID',
      'CV Show audio pipeline observed aligned turn changed the raw transcript evidence',
    );
  }
  if (!Array.isArray(source.anchorings) || source.anchorings.length !== 1) {
    fail('CV_SHOW_AUDIO_PIPELINE_INVALID', 'CV Show audio pipeline anchoring coverage is invalid');
  }
  let anchoring = requireObject(source.anchorings[0], [
    'contractVersion',
    'turnIndex',
    'authored',
    'observed',
    'operations',
    'metrics',
  ], 'observed anchoring');
  if (
    anchoring.contractVersion !== ANCHORING_VERSION
    || anchoring.turnIndex !== 0
    || !Array.isArray(anchoring.operations)
  ) {
    fail('CV_SHOW_AUDIO_PIPELINE_INVALID', 'CV Show audio pipeline observed anchoring is invalid');
  }
  let authored = requireObject(anchoring.authored, ['text', 'tokens'], 'anchoring authored evidence');
  let observed = requireObject(
    anchoring.observed,
    ['transcript', 'tokens', 'words'],
    'anchoring observed evidence',
  );
  if (
    authored.text !== plan.timeline.turns[0].text
    || !Array.isArray(authored.tokens)
    || observed.transcript !== transcript.text
    || !Array.isArray(observed.tokens)
    || !sameJson(observed.words, expectedWords)
  ) {
    fail(
      'CV_SHOW_AUDIO_PIPELINE_INVALID',
      'CV Show audio pipeline anchoring changed authored or observed evidence',
    );
  }
  for (let [index, token] of authored.tokens.entries()) {
    let item = requireObject(token, ['index', 'text'], `authored token ${index}`);
    if (item.index !== index) {
      fail('CV_SHOW_AUDIO_PIPELINE_INVALID', 'CV Show audio pipeline authored tokens are reordered');
    }
    requireString(item.text, `authored token ${index} text`);
  }
  for (let [index, token] of observed.tokens.entries()) {
    let item = requireObject(
      token,
      ['index', 'text', 'wordIndex'],
      `recognized token ${index}`,
    );
    if (
      item.index !== index
      || !Number.isSafeInteger(item.wordIndex)
      || item.wordIndex < 0
      || item.wordIndex >= observed.words.length
    ) {
      fail('CV_SHOW_AUDIO_PIPELINE_INVALID', 'CV Show audio pipeline recognized tokens are invalid');
    }
    requireString(item.text, `recognized token ${index} text`);
  }
  let authoredOperationIndexes = new Set();
  let recognizedOperationIndexes = new Set();
  for (let [index, operation] of anchoring.operations.entries()) {
    let item = requireObject(
      operation,
      ['operation', 'authoredToken', 'recognizedToken', 'observedWord'],
      `alignment operation ${index}`,
    );
    if (!['match', 'substitute', 'delete', 'insert'].includes(item.operation)) {
      fail('CV_SHOW_AUDIO_PIPELINE_INVALID', 'CV Show audio pipeline alignment operation is invalid');
    }
    if (item.authoredToken !== null) {
      let operationAuthored = requireObject(
        item.authoredToken,
        ['index', 'text'],
        `alignment operation ${index} authored token`,
      );
      if (
        !Number.isSafeInteger(operationAuthored.index)
        || operationAuthored.index < 0
        || operationAuthored.index >= authored.tokens.length
        || authoredOperationIndexes.has(operationAuthored.index)
        || !sameJson(operationAuthored, authored.tokens[operationAuthored.index])
      ) {
        fail('CV_SHOW_AUDIO_PIPELINE_INVALID', 'CV Show audio pipeline authored token is invalid');
      }
      authoredOperationIndexes.add(operationAuthored.index);
    }
    if (item.recognizedToken !== null) {
      let operationRecognized = requireObject(
        item.recognizedToken,
        ['index', 'text', 'wordIndex'],
        `alignment operation ${index} recognized token`,
      );
      if (
        !Number.isSafeInteger(operationRecognized.index)
        || operationRecognized.index < 0
        || operationRecognized.index >= observed.tokens.length
        || recognizedOperationIndexes.has(operationRecognized.index)
        || !sameJson(operationRecognized, observed.tokens[operationRecognized.index])
      ) {
        fail('CV_SHOW_AUDIO_PIPELINE_INVALID', 'CV Show audio pipeline recognized token is invalid');
      }
      recognizedOperationIndexes.add(operationRecognized.index);
    }
    let tokenPairIsValid = (
      (['match', 'substitute'].includes(item.operation)
        && item.authoredToken !== null
        && item.recognizedToken !== null)
      || (item.operation === 'delete'
        && item.authoredToken !== null
        && item.recognizedToken === null)
      || (item.operation === 'insert'
        && item.authoredToken === null
        && item.recognizedToken !== null)
    );
    if (!tokenPairIsValid) {
      fail('CV_SHOW_AUDIO_PIPELINE_INVALID', 'CV Show audio pipeline operation token binding is invalid');
    }
    let expectedObservedWord = item.recognizedToken === null
      ? null
      : {
          index: item.recognizedToken.wordIndex,
          ...observed.words[item.recognizedToken.wordIndex],
        };
    if (!sameJson(item.observedWord, expectedObservedWord)) {
      fail('CV_SHOW_AUDIO_PIPELINE_INVALID', 'CV Show audio pipeline observed word binding is invalid');
    }
    validateObservedWord(
      item.observedWord,
      `alignment operation ${index} observed word`,
      { mediaDurationMs: media.durationMs },
    );
  }
  if (
    authoredOperationIndexes.size !== authored.tokens.length
    || recognizedOperationIndexes.size !== observed.tokens.length
  ) {
    fail('CV_SHOW_AUDIO_PIPELINE_INVALID', 'CV Show audio pipeline operation coverage is incomplete');
  }
  validateMetrics(anchoring.metrics, 'anchoring metrics');
  validateMetrics(source.metrics, 'aggregate alignment metrics');
  return source;
}

function buildAnchorCoverage(plan, alignment) {
  let anchorCoverage = [];
  for (let anchor of plan.requiredAnchors) {
    let anchoring = alignment.anchorings.find(({ turnIndex }) => turnIndex === anchor.turnIndex);
    let mappings = [];
    for (let authoredTokenIndex of anchor.authoredTokenIndexes) {
      let matches = anchoring?.operations.filter((operation) => (
        operation.authoredToken?.index === authoredTokenIndex
      )) || [];
      let operation = matches.length === 1 ? matches[0] : null;
      if (!operation?.observedWord) {
        return {
          anchorCoverage: null,
          missing: { anchorId: anchor.anchorId, turnIndex: anchor.turnIndex, authoredTokenIndex },
        };
      }
      mappings.push({
        authoredTokenIndex,
        operation: operation.operation,
        observedWord: cloneJson(operation.observedWord, 'required anchor observed word'),
      });
    }
    anchorCoverage.push({
      anchorId: anchor.anchorId,
      turnIndex: anchor.turnIndex,
      mappings,
    });
  }
  return { anchorCoverage, missing: null };
}

function validateVerification(value, plan, alignment) {
  if (value === null) return;
  let source = requireObject(value, ['timingCoverage', 'anchorCoverage'], 'verification');
  let expected = alignment ? buildAnchorCoverage(plan, alignment) : null;
  if (
    source.timingCoverage !== 1
    || alignment?.metrics.timingCoverage !== 1
    || !Array.isArray(source.anchorCoverage)
    || !expected
    || expected.missing
    || !sameJson(source.anchorCoverage, expected.anchorCoverage)
  ) {
    fail(
      'CV_SHOW_AUDIO_PIPELINE_STATE_INVALID',
      'CV Show audio pipeline terminal anchor verification is invalid',
    );
  }
}

function validateStatePhase(state) {
  let count = state.attemptHashes.length;
  let interrupted = ['blocked', 'outcome-unknown'].includes(state.phase);
  let countIsValid = (
    (state.phase === 'planned' && count === 0)
    || (state.phase === 'synthesis-dispatched' && [1, 2].includes(count))
    || (state.phase === 'synthesized' && [2, 3].includes(count))
    || (['technical-verified', 'clip-reviewed', 'clip-rejected'].includes(state.phase)
      && count === 3)
    || (state.phase === 'transcription-dispatched' && count >= 4 && count <= 6)
    || (['transcribed', 'aligned', 'entry-verified'].includes(state.phase) && count === 6)
    || (['blocked', 'outcome-unknown'].includes(state.phase) && count >= 1 && count <= 6)
  );
  if (!countIsValid) {
    fail(
      'CV_SHOW_AUDIO_PIPELINE_STATE_INVALID',
      'CV Show audio pipeline phase and attempt count are inconsistent',
    );
  }
  let failureRequired = ['blocked', 'clip-rejected', 'outcome-unknown'].includes(state.phase);
  if ((state.failure !== null) !== failureRequired) {
    fail(
      'CV_SHOW_AUDIO_PIPELINE_STATE_INVALID',
      'CV Show audio pipeline terminal failure evidence is inconsistent',
    );
  }
  let synthesisRequired = [
    'synthesized',
    'technical-verified',
    'clip-reviewed',
    'clip-rejected',
    'transcription-dispatched',
    'transcribed',
    'aligned',
    'entry-verified',
  ].includes(state.phase);
  if ((state.synthesis !== null) !== synthesisRequired && !interrupted) {
    fail(
      'CV_SHOW_AUDIO_PIPELINE_STATE_INVALID',
      'CV Show audio pipeline synthesis evidence is inconsistent',
    );
  }
  let reviewRequired = [
    'clip-reviewed',
    'clip-rejected',
    'transcription-dispatched',
    'transcribed',
    'aligned',
    'entry-verified',
  ].includes(state.phase);
  if ((state.review !== null) !== reviewRequired && !interrupted) {
    fail(
      'CV_SHOW_AUDIO_PIPELINE_STATE_INVALID',
      'CV Show audio pipeline review evidence is inconsistent',
    );
  }
  if (reviewRequired && state.review.approved !== (state.phase !== 'clip-rejected')) {
    fail(
      'CV_SHOW_AUDIO_PIPELINE_STATE_INVALID',
      'CV Show audio pipeline review decision is inconsistent',
    );
  }
  let transcriptRequired = ['transcribed', 'aligned', 'entry-verified'].includes(state.phase);
  if ((state.transcript !== null) !== transcriptRequired && !interrupted) {
    if (!(state.phase === 'transcription-dispatched' && state.transcript !== null)) {
      fail(
        'CV_SHOW_AUDIO_PIPELINE_STATE_INVALID',
        'CV Show audio pipeline transcript evidence is inconsistent',
      );
    }
  }
  let alignmentRequired = ['aligned', 'entry-verified'].includes(state.phase);
  if ((state.alignment !== null) !== alignmentRequired && !interrupted) {
    fail(
      'CV_SHOW_AUDIO_PIPELINE_STATE_INVALID',
      'CV Show audio pipeline alignment evidence is inconsistent',
    );
  }
  if ((state.verification !== null) !== (state.phase === 'entry-verified')) {
    fail(
      'CV_SHOW_AUDIO_PIPELINE_STATE_INVALID',
      'CV Show audio pipeline entry verification evidence is inconsistent',
    );
  }
  if (state.synthesis && state.synthesis.attemptHash !== state.attemptHashes[1]) {
    fail(
      'CV_SHOW_AUDIO_PIPELINE_STATE_INVALID',
      'CV Show audio pipeline synthesis attempt reference is stale',
    );
  }
  if (
    state.review
    && (
      state.review.wavHash !== state.synthesis.wavHash
      || state.review.synthesisAttemptHash !== state.synthesis.attemptHash
    )
  ) {
    fail(
      'CV_SHOW_AUDIO_PIPELINE_STATE_INVALID',
      'CV Show audio pipeline review binding is stale',
    );
  }
  if (state.transcript && state.transcript.attemptHash !== state.attemptHashes[4]) {
    fail(
      'CV_SHOW_AUDIO_PIPELINE_STATE_INVALID',
      'CV Show audio pipeline transcription attempt reference is stale',
    );
  }
}

function validateState(value, plan) {
  let state = requireObject(value, STATE_KEYS, 'durable state');
  if (
    state.schemaVersion !== STATE_SCHEMA_VERSION
    || !PHASES.has(state.phase)
    || !sameJson(state.plan, plan)
    || !Array.isArray(state.attemptHashes)
    || state.attemptHashes.length > ATTEMPT_KINDS.length
  ) {
    fail('CV_SHOW_AUDIO_PIPELINE_STATE_INVALID', 'CV Show audio pipeline durable state is invalid');
  }
  for (let hash of state.attemptHashes) requireHash(hash, 'attempt hash');
  validateSynthesis(state.synthesis);
  validateReview(state.review);
  validateTranscriptState(state.transcript);
  if (state.alignment !== null) {
    normalizeAlignment(state.alignment, plan, state.synthesis, state.transcript);
  }
  validateVerification(state.verification, plan, state.alignment);
  validateFailure(state.failure);
  validateStatePhase(state);
  return state;
}

function normalizeAttemptFailure(value) {
  let source = requireObject(value, ['code', 'stage', 'evidence'], 'attempt failure');
  validateFailure(source);
  return source;
}

function validateAttempt(value, expectedKind, plan) {
  if (!isPlainObject(value) || value.schemaVersion !== ATTEMPT_SCHEMA_VERSION) {
    fail('CV_SHOW_AUDIO_PIPELINE_STATE_INVALID', 'CV Show audio pipeline attempt is invalid');
  }
  if (value.kind !== expectedKind) {
    fail('CV_SHOW_AUDIO_PIPELINE_STATE_INVALID', 'CV Show audio pipeline attempt order is invalid');
  }
  if (value.status === 'dispatched') {
    requireObject(value, ['schemaVersion', 'kind', 'status', 'request'], 'dispatched attempt');
    if (expectedKind.includes('readiness')) requireObject(value.request, [], 'readiness request');
    if (expectedKind === 'synthesis' && !sameJson(value.request, plan.synthesisItem)) {
      fail('CV_SHOW_AUDIO_PIPELINE_STATE_INVALID', 'CV Show audio pipeline synthesis intent is stale');
    }
    if (expectedKind === 'transcription') {
      let request = requireObject(value.request, ['wavHash', 'language'], 'transcription request');
      requireHash(request.wavHash, 'transcription request WAV hash');
      if (request.language !== plan.locale) {
        fail('CV_SHOW_AUDIO_PIPELINE_STATE_INVALID', 'CV Show audio pipeline transcription intent is stale');
      }
    }
    return value;
  }
  if (value.status === 'completed') {
    requireObject(
      value,
      ['schemaVersion', 'kind', 'status', 'dispatchedAttemptHash', 'response'],
      'completed attempt',
    );
    requireHash(value.dispatchedAttemptHash, 'dispatched attempt hash');
    if (expectedKind.includes('readiness')) normalizeReadiness(value.response, 'readiness response');
    if (expectedKind === 'synthesis') {
      requireObject(
        value.response,
        ['wavHash', 'durationSec', 'sampleRate', 'receipt'],
        'synthesis attempt response',
      );
      validateSynthesis({
        attemptHash: value.dispatchedAttemptHash,
        ...value.response,
      });
    }
    if (expectedKind === 'transcription') normalizeTranscript(value.response);
    return value;
  }
  if (value.status === 'invalid') {
    requireObject(
      value,
      ['schemaVersion', 'kind', 'status', 'dispatchedAttemptHash', 'failure'],
      'invalid attempt',
    );
    requireHash(value.dispatchedAttemptHash, 'dispatched attempt hash');
    normalizeAttemptFailure(value.failure);
    return value;
  }
  fail('CV_SHOW_AUDIO_PIPELINE_STATE_INVALID', 'CV Show audio pipeline attempt status is invalid');
}

function validateStateAttemptBindings(state, plan, attempts, dispatchedAttempts) {
  if (state.synthesis !== null) {
    let attempt = attempts[1];
    let expected = attempt?.status === 'completed'
      ? { attemptHash: state.attemptHashes[1], ...attempt.response }
      : null;
    if (!expected || !sameJson(state.synthesis, expected)) {
      fail(
        'CV_SHOW_AUDIO_PIPELINE_STATE_INVALID',
        'CV Show audio pipeline synthesis state does not match its completed attempt',
      );
    }
  }
  if (state.transcript !== null) {
    let attempt = attempts[4];
    let expected = attempt?.status === 'completed'
      ? { attemptHash: state.attemptHashes[4], ...attempt.response }
      : null;
    if (!expected || !sameJson(state.transcript, expected)) {
      fail(
        'CV_SHOW_AUDIO_PIPELINE_STATE_INVALID',
        'CV Show audio pipeline transcript state does not match its completed attempt',
      );
    }
  }
  let transcriptionIntent = dispatchedAttempts[4];
  if (
    transcriptionIntent
    && (
      !state.synthesis
      || !sameJson(transcriptionIntent.request, {
        wavHash: state.synthesis.wavHash,
        language: plan.locale,
      })
    )
  ) {
    fail(
      'CV_SHOW_AUDIO_PIPELINE_STATE_INVALID',
      'CV Show audio pipeline transcription intent does not match the synthesized artifact',
    );
  }
}

async function loadContext(run, plan, { required = true } = {}) {
  let head = await run.readHead();
  if (!head) {
    if (!required) return null;
    fail(
      'CV_SHOW_AUDIO_PIPELINE_NOT_INITIALIZED',
      'Initialize the CV Show audio pipeline entry before advancing it',
    );
  }
  let state = validateState(head.state, plan);
  let attempts = [];
  let dispatchedAttempts = [];
  for (let [index, attemptHash] of state.attemptHashes.entries()) {
    let attempt = validateAttempt(await run.readObject(attemptHash), ATTEMPT_KINDS[index], plan);
    let dispatched = attempt;
    if (attempt.status !== 'dispatched') {
      dispatched = validateAttempt(
        await run.readObject(attempt.dispatchedAttemptHash),
        ATTEMPT_KINDS[index],
        plan,
      );
      if (dispatched.status !== 'dispatched') {
        fail('CV_SHOW_AUDIO_PIPELINE_STATE_INVALID', 'CV Show audio pipeline intent chain is invalid');
      }
    }
    attempts.push(attempt);
    dispatchedAttempts.push(dispatched);
  }
  validateStateAttemptBindings(state, plan, attempts, dispatchedAttempts);
  return { head, state, attempts };
}

async function replaceState(run, plan, context, state) {
  validateState(state, plan);
  let stateHash = await run.putObject(state);
  await run.compareAndSwapHead(context.head.headHash, stateHash);
  return loadContext(run, plan);
}

function failure(code, stage, evidence) {
  return { code, stage, evidence: cloneJson(evidence, 'failure evidence') };
}

async function block(run, plan, context, code, stage, evidence) {
  return replaceState(run, plan, context, {
    ...context.state,
    phase: 'blocked',
    verification: null,
    failure: failure(code, stage, evidence),
  });
}

async function unknown(run, plan, context, kind, attemptHash) {
  return replaceState(run, plan, context, {
    ...context.state,
    phase: 'outcome-unknown',
    failure: failure('CV_SHOW_AUDIO_PIPELINE_OUTCOME_UNKNOWN', kind, {
      attemptHash,
      attemptKind: kind,
    }),
  });
}

function isKnownModelFailure(error) {
  return error?.code === 'CV_SHOW_MODEL_SERVICE_INVALID';
}

async function invalidAttempt(run, plan, context, kind, dispatchedAttemptHash, error) {
  let attemptFailure = failure('CV_SHOW_AUDIO_PIPELINE_MODEL_RESULT_INVALID', kind, {
    attemptKind: kind,
    sourceCode: typeof error?.code === 'string' ? error.code : 'INVALID_RESULT',
  });
  let attemptHash = await run.putObject({
    schemaVersion: ATTEMPT_SCHEMA_VERSION,
    kind,
    status: 'invalid',
    dispatchedAttemptHash,
    failure: attemptFailure,
  });
  let attemptHashes = [...context.state.attemptHashes];
  attemptHashes[attemptHashes.length - 1] = attemptHash;
  return replaceState(run, plan, context, {
    ...context.state,
    phase: 'blocked',
    attemptHashes,
    failure: attemptFailure,
  });
}

async function dispatchAttempt({
  run,
  plan,
  context,
  kind,
  request,
  dispatchedPhase,
  invoke,
  normalize,
  completeState,
}) {
  let dispatchedAttemptHash = await run.putObject({
    schemaVersion: ATTEMPT_SCHEMA_VERSION,
    kind,
    status: 'dispatched',
    request,
  });
  let dispatchedContext = await replaceState(run, plan, context, {
    ...context.state,
    phase: dispatchedPhase,
    attemptHashes: [...context.state.attemptHashes, dispatchedAttemptHash],
  });
  let result;
  try {
    result = await invoke();
  } catch (error) {
    if (isKnownModelFailure(error)) {
      return invalidAttempt(run, plan, dispatchedContext, kind, dispatchedAttemptHash, error);
    }
    return unknown(run, plan, dispatchedContext, kind, dispatchedAttemptHash);
  }
  let response;
  try {
    response = await normalize(result);
  } catch (error) {
    return invalidAttempt(run, plan, dispatchedContext, kind, dispatchedAttemptHash, error);
  }
  let completedAttemptHash = await run.putObject({
    schemaVersion: ATTEMPT_SCHEMA_VERSION,
    kind,
    status: 'completed',
    dispatchedAttemptHash,
    response,
  });
  let attemptHashes = [...dispatchedContext.state.attemptHashes];
  attemptHashes[attemptHashes.length - 1] = completedAttemptHash;
  let nextState = completeState({
    ...dispatchedContext.state,
    attemptHashes,
  }, response, completedAttemptHash);
  return replaceState(run, plan, dispatchedContext, nextState);
}

function completedResponse(context, index) {
  let attempt = context.attempts[index];
  if (!attempt || attempt.status !== 'completed') {
    fail('CV_SHOW_AUDIO_PIPELINE_STATE_INVALID', 'CV Show audio pipeline attempt is unresolved');
  }
  return attempt.response;
}

function readinessMatches(left, right) {
  return sameJson(left, right);
}

async function normalizeSynthesisResult(run, result) {
  if (!isPlainObject(result) || !exactKeys(
    result,
    ['wavBytes', 'durationSec', 'sampleRate', 'receipt'],
  )) {
    fail('CV_SHOW_AUDIO_PIPELINE_INVALID', 'CV Show audio pipeline synthesis result is invalid');
  }
  if (!(result.wavBytes instanceof Uint8Array) || result.wavBytes.byteLength === 0) {
    fail('CV_SHOW_AUDIO_PIPELINE_INVALID', 'CV Show audio pipeline synthesis WAV is invalid');
  }
  let wavBytes = Buffer.from(result.wavBytes);
  let durationSec = requirePositive(result.durationSec, 'synthesis result duration');
  if (!Number.isSafeInteger(result.sampleRate) || result.sampleRate < 1) {
    fail('CV_SHOW_AUDIO_PIPELINE_INVALID', 'CV Show audio pipeline synthesis sample rate is invalid');
  }
  let receipt = cloneJson(result.receipt, 'synthesis receipt');
  if (
    !isPlainObject(receipt)
    || receipt.receiptVersion !== 'symbiote-audio-synthesis-receipt-v3'
    || receipt.artifactHash !== createHash('sha256').update(wavBytes).digest('hex')
  ) {
    fail('CV_SHOW_AUDIO_PIPELINE_INVALID', 'CV Show audio pipeline synthesis receipt is invalid');
  }
  let wavHash = await run.putArtifact(wavBytes);
  return {
    wavHash,
    durationSec,
    sampleRate: result.sampleRate,
    receipt,
  };
}

async function advanceSynthesis(run, plan, modelClient, initialContext) {
  let context = initialContext;
  while (!TERMINAL_PHASES.has(context.state.phase)) {
    let lastAttempt = context.attempts.at(-1);
    if (lastAttempt?.status === 'dispatched') {
      return unknown(
        run,
        plan,
        context,
        lastAttempt.kind,
        context.state.attemptHashes.at(-1),
      );
    }
    if (context.attempts.length === 0) {
      context = await dispatchAttempt({
        run,
        plan,
        context,
        kind: 'synthesis-readiness-pre',
        request: {},
        dispatchedPhase: 'synthesis-dispatched',
        invoke: () => modelClient.readiness(),
        normalize: (value) => normalizeReadiness(value, 'synthesis pre-readiness'),
        completeState: (state) => state,
      });
      continue;
    }
    if (context.attempts.length === 1) {
      let pre = completedResponse(context, 0);
      if (!readinessMatches(pre, plan.readinessProfile)) {
        return block(
          run,
          plan,
          context,
          'CV_SHOW_AUDIO_PIPELINE_READINESS_MISMATCH',
          'synthesis-readiness-pre',
          { expected: plan.readinessProfile, observed: pre },
        );
      }
      context = await dispatchAttempt({
        run,
        plan,
        context,
        kind: 'synthesis',
        request: plan.synthesisItem,
        dispatchedPhase: 'synthesis-dispatched',
        invoke: () => modelClient.synthesize(plan.synthesisItem),
        normalize: (value) => normalizeSynthesisResult(run, value),
        completeState: (state, response, completedAttemptHash) => ({
          ...state,
          phase: 'synthesized',
          synthesis: { attemptHash: completedAttemptHash, ...response },
        }),
      });
      continue;
    }
    if (context.attempts.length === 2) {
      context = await dispatchAttempt({
        run,
        plan,
        context,
        kind: 'synthesis-readiness-post',
        request: {},
        dispatchedPhase: 'synthesized',
        invoke: () => modelClient.readiness(),
        normalize: (value) => normalizeReadiness(value, 'synthesis post-readiness'),
        completeState: (state) => state,
      });
      continue;
    }
    if (context.attempts.length === 3) {
      let pre = completedResponse(context, 0);
      let post = completedResponse(context, 2);
      if (
        !readinessMatches(pre, plan.readinessProfile)
        || !readinessMatches(post, plan.readinessProfile)
        || !readinessMatches(pre, post)
      ) {
        return block(
          run,
          plan,
          context,
          'CV_SHOW_AUDIO_PIPELINE_READINESS_MISMATCH',
          'synthesis-readiness-post',
          { expected: plan.readinessProfile, pre, post },
        );
      }
      return replaceState(run, plan, context, {
        ...context.state,
        phase: 'technical-verified',
      });
    }
    fail('CV_SHOW_AUDIO_PIPELINE_STATE_INVALID', 'CV Show audio pipeline synthesis state is invalid');
  }
  return context;
}

async function advanceTranscription(run, plan, modelClient, initialContext) {
  let context = initialContext;
  while (!TERMINAL_PHASES.has(context.state.phase)) {
    let lastAttempt = context.attempts.at(-1);
    if (lastAttempt?.status === 'dispatched') {
      return unknown(
        run,
        plan,
        context,
        lastAttempt.kind,
        context.state.attemptHashes.at(-1),
      );
    }
    let batchCount = context.attempts.length - 3;
    if (batchCount === 0) {
      context = await dispatchAttempt({
        run,
        plan,
        context,
        kind: 'transcription-readiness-pre',
        request: {},
        dispatchedPhase: 'transcription-dispatched',
        invoke: () => modelClient.readiness(),
        normalize: (value) => normalizeReadiness(value, 'transcription pre-readiness'),
        completeState: (state) => state,
      });
      continue;
    }
    if (batchCount === 1) {
      let pre = completedResponse(context, 3);
      if (!readinessMatches(pre, plan.readinessProfile)) {
        return block(
          run,
          plan,
          context,
          'CV_SHOW_AUDIO_PIPELINE_READINESS_MISMATCH',
          'transcription-readiness-pre',
          { expected: plan.readinessProfile, observed: pre },
        );
      }
      let wavBytes = await run.readArtifact(context.state.synthesis.wavHash);
      context = await dispatchAttempt({
        run,
        plan,
        context,
        kind: 'transcription',
        request: {
          wavHash: context.state.synthesis.wavHash,
          language: plan.locale,
        },
        dispatchedPhase: 'transcription-dispatched',
        invoke: () => modelClient.transcribe({ wavBytes, language: plan.locale }),
        normalize: (value) => normalizeTranscript(cloneJson(value, 'transcription result')),
        completeState: (state, response, completedAttemptHash) => ({
          ...state,
          transcript: { attemptHash: completedAttemptHash, ...response },
        }),
      });
      continue;
    }
    if (batchCount === 2) {
      context = await dispatchAttempt({
        run,
        plan,
        context,
        kind: 'transcription-readiness-post',
        request: {},
        dispatchedPhase: 'transcription-dispatched',
        invoke: () => modelClient.readiness(),
        normalize: (value) => normalizeReadiness(value, 'transcription post-readiness'),
        completeState: (state) => state,
      });
      continue;
    }
    if (batchCount === 3) {
      let pre = completedResponse(context, 3);
      let post = completedResponse(context, 5);
      if (
        !readinessMatches(pre, plan.readinessProfile)
        || !readinessMatches(post, plan.readinessProfile)
        || !readinessMatches(pre, post)
      ) {
        return block(
          run,
          plan,
          context,
          'CV_SHOW_AUDIO_PIPELINE_READINESS_MISMATCH',
          'transcription-readiness-post',
          { expected: plan.readinessProfile, pre, post },
        );
      }
      return replaceState(run, plan, context, {
        ...context.state,
        phase: 'transcribed',
      });
    }
    fail(
      'CV_SHOW_AUDIO_PIPELINE_STATE_INVALID',
      'CV Show audio pipeline transcription state is invalid',
    );
  }
  return context;
}

function milliseconds(seconds, field) {
  let value = Math.round(requirePositive(seconds, field) * 1000);
  if (!Number.isSafeInteger(value) || value < 1) {
    fail('CV_SHOW_AUDIO_PIPELINE_INVALID', `CV Show audio pipeline ${field} cannot convert to ms`);
  }
  return value;
}

function wordMilliseconds(seconds, field) {
  if (typeof seconds !== 'number' || !Number.isFinite(seconds) || seconds < 0) {
    fail('CV_SHOW_AUDIO_PIPELINE_INVALID', `CV Show audio pipeline ${field} is invalid`);
  }
  let value = Math.round(seconds * 1000);
  if (!Number.isSafeInteger(value) || value < 0) {
    fail('CV_SHOW_AUDIO_PIPELINE_INVALID', `CV Show audio pipeline ${field} cannot convert to ms`);
  }
  return value;
}

async function advanceAlignment(run, plan, createObservedAlignment, context) {
  let transcript = context.state.transcript;
  let synthesis = context.state.synthesis;
  let input = {
    media: {
      hash: synthesis.wavHash,
      durationMs: milliseconds(synthesis.durationSec, 'WAV duration'),
      locale: plan.locale,
    },
    voice: plan.voice,
    observations: [{
      turnIndex: 0,
      startMs: 0,
      endMs: milliseconds(transcript.durationSec, 'transcript duration'),
      transcript: transcript.text,
      words: transcript.words.map((word) => ({
        text: word.word,
        startMs: wordMilliseconds(word.startSec, 'observed word start'),
        endMs: wordMilliseconds(word.endSec, 'observed word end'),
      })),
    }],
  };
  let alignment;
  try {
    alignment = normalizeAlignment(
      createObservedAlignment(plan.timeline, input),
      plan,
      synthesis,
      transcript,
    );
  } catch (error) {
    return block(
      run,
      plan,
      context,
      'CV_SHOW_AUDIO_PIPELINE_ALIGNMENT_FAILED',
      'alignment',
      { sourceCode: typeof error?.code === 'string' ? error.code : 'INVALID_ALIGNMENT' },
    );
  }
  return replaceState(run, plan, context, {
    ...context.state,
    phase: 'aligned',
    alignment,
  });
}

async function advanceVerification(run, plan, context) {
  let alignment = context.state.alignment;
  if (alignment.metrics.timingCoverage !== 1) {
    return block(
      run,
      plan,
      context,
      'CV_SHOW_AUDIO_PIPELINE_TIMING_INCOMPLETE',
      'entry-verification',
      { timingCoverage: alignment.metrics.timingCoverage },
    );
  }
  let coverage = buildAnchorCoverage(plan, alignment);
  if (coverage.missing) {
    return block(
      run,
      plan,
      context,
      'CV_SHOW_AUDIO_PIPELINE_REQUIRED_ANCHOR_MISSING',
      'entry-verification',
      coverage.missing,
    );
  }
  return replaceState(run, plan, context, {
    ...context.state,
    phase: 'entry-verified',
    verification: { timingCoverage: 1, anchorCoverage: coverage.anchorCoverage },
  });
}

async function withOwnerLock(run, ownerToken, operation) {
  await run.acquireLock(ownerToken);
  try {
    return await operation();
  } finally {
    await run.releaseLock(ownerToken);
  }
}

/**
 * @param {object} input
 * @returns {object}
 */
export function createCvShowAudioPipelineRunner(input = {}) {
  if (
    !exactKeys(input, ['storage', 'modelClient'])
    && !exactKeys(input, ['storage', 'modelClient', 'createObservedAlignment'])
  ) {
    fail(
      'CV_SHOW_AUDIO_PIPELINE_INVALID',
      'CV Show audio pipeline runner dependencies have unexpected or missing fields',
    );
  }
  let { storage, modelClient } = input;
  let createObservedAlignment = input.createObservedAlignment
    ?? createWorkspaceObservedAlignment;
  if (
    typeof storage?.openRun !== 'function'
    || typeof modelClient?.readiness !== 'function'
    || typeof modelClient?.synthesize !== 'function'
    || typeof modelClient?.transcribe !== 'function'
    || typeof createObservedAlignment !== 'function'
  ) {
    fail(
      'CV_SHOW_AUDIO_PIPELINE_INVALID',
      'CV Show audio pipeline runner requires storage, model client, and aligner dependencies',
    );
  }

  let openEntry = (planInput) => {
    let plan = normalizePlan(planInput);
    let run = storage.openRun(plan);

    let initialize = async (...args) => {
      if (args.length) {
        fail('CV_SHOW_AUDIO_PIPELINE_INVALID', 'CV Show audio pipeline initialize takes no input');
      }
      let existing = await loadContext(run, plan, { required: false });
      if (existing) return publicValue(existing.state);
      let stateHash = await run.putObject(createInitialState(plan));
      await run.compareAndSwapHead(null, stateHash);
      return publicValue((await loadContext(run, plan)).state);
    };

    let inspect = async (...args) => {
      if (args.length) {
        fail('CV_SHOW_AUDIO_PIPELINE_INVALID', 'CV Show audio pipeline inspect takes no input');
      }
      return publicValue((await loadContext(run, plan)).state);
    };

    let advance = async (...args) => {
      if (args.length !== 1) {
        fail('CV_SHOW_AUDIO_PIPELINE_INVALID', 'CV Show audio pipeline advance needs one owner token');
      }
      let [ownerToken] = args;
      return withOwnerLock(run, ownerToken, async () => {
        let context = await loadContext(run, plan);
        if (TERMINAL_PHASES.has(context.state.phase)) return publicValue(context.state);
        let lastAttempt = context.attempts.at(-1);
        if (lastAttempt?.status === 'dispatched') {
          context = await unknown(
            run,
            plan,
            context,
            lastAttempt.kind,
            context.state.attemptHashes.at(-1),
          );
          return publicValue(context.state);
        }
        if (['planned', 'synthesis-dispatched', 'synthesized'].includes(context.state.phase)) {
          context = await advanceSynthesis(run, plan, modelClient, context);
        } else if (context.state.phase === 'technical-verified') {
          fail(
            'CV_SHOW_AUDIO_PIPELINE_REVIEW_REQUIRED',
            'Review the exact synthesized clip before transcription',
          );
        } else if (
          ['clip-reviewed', 'transcription-dispatched'].includes(context.state.phase)
        ) {
          context = await advanceTranscription(run, plan, modelClient, context);
        } else if (context.state.phase === 'transcribed') {
          context = await advanceAlignment(run, plan, createObservedAlignment, context);
        } else if (context.state.phase === 'aligned') {
          context = await advanceVerification(run, plan, context);
        } else {
          fail('CV_SHOW_AUDIO_PIPELINE_STATE_INVALID', 'CV Show audio pipeline phase is invalid');
        }
        return publicValue(context.state);
      });
    };

    let reviewClip = async (...args) => {
      if (args.length !== 1) {
        fail('CV_SHOW_AUDIO_PIPELINE_INVALID', 'CV Show audio pipeline review needs one input');
      }
      let review = cloneJson(args[0], 'clip review input');
      requireObject(
        review,
        ['ownerToken', 'approved', 'wavHash', 'synthesisAttemptHash'],
        'clip review input',
      );
      if (typeof review.approved !== 'boolean') {
        fail('CV_SHOW_AUDIO_PIPELINE_INVALID', 'CV Show audio pipeline review decision is invalid');
      }
      requireHash(review.wavHash, 'review WAV hash');
      requireHash(review.synthesisAttemptHash, 'review synthesis attempt hash');
      return withOwnerLock(run, review.ownerToken, async () => {
        let context = await loadContext(run, plan);
        if (context.state.phase !== 'technical-verified') {
          fail(
            'CV_SHOW_AUDIO_PIPELINE_REVIEW_NOT_PERMITTED',
            'CV Show audio pipeline clip review is permitted only after technical verification',
          );
        }
        if (
          review.wavHash !== context.state.synthesis.wavHash
          || review.synthesisAttemptHash !== context.state.synthesis.attemptHash
        ) {
          fail(
            'CV_SHOW_AUDIO_PIPELINE_REVIEW_MISMATCH',
            'Review must bind the current exact WAV and completed synthesis attempt hashes',
          );
        }
        let decision = {
          approved: review.approved,
          wavHash: review.wavHash,
          synthesisAttemptHash: review.synthesisAttemptHash,
        };
        let nextState = review.approved
          ? {
              ...context.state,
              phase: 'clip-reviewed',
              review: decision,
            }
          : {
              ...context.state,
              phase: 'clip-rejected',
              review: decision,
              failure: failure('CV_SHOW_AUDIO_PIPELINE_CLIP_REJECTED', 'clip-review', decision),
            };
        let next = await replaceState(run, plan, context, nextState);
        return publicValue(next.state);
      });
    };

    return Object.freeze({ initialize, inspect, advance, reviewClip });
  };

  return Object.freeze({ openEntry });
}
