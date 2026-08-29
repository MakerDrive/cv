import { createHash } from 'node:crypto';

import {
  createPresentationAuthoringProject,
  createPresentationAuthoringTimelineProjection,
} from 'symbiote-workspace';
import { canonicalize, computeIntegrity } from 'symbiote-workspace/schema/canonical-json.js';
import {
  createCvShowEntryProject,
  createCvShowEntryProvenance,
} from '../src/static-pages/js/tour-player/presentationProjectAdapter.js';

const PLAN_SCHEMA = 'cv-show-audio-release-plan-v1';
const STATE_SCHEMA = 'cv-show-audio-release-state-v1';
const RELEASE_SCHEMA = 'cv-show-audio-release-v1';
const ENTRY_RELEASE_SCHEMA = 'cv-show-audio-entry-release-v1';
const PROVENANCE_SCHEMA = 'cv-show-audio-provenance-v1';
const APPROVAL_SCHEMA = 'cv-show-audio-release-approval-v1';
const ENTRY_EVIDENCE_SCHEMA = 'cv-show-audio-entry-inspection-v1';
const RELEASE_ARTIFACT_EVIDENCE_SCHEMA = 'cv-show-audio-release-artifact-evidence-v1';
const SHA256_PATTERN = /^[a-f0-9]{64}$/u;
const SHA256_ID_PATTERN = /^sha256:[a-f0-9]{64}$/u;
const PHASES = new Set([
  'entries-pending',
  'entries-verified',
  'release-verified',
  'human-approved',
  'staged',
  'promoted',
]);

function fail(code, message, details = {}) {
  throw Object.assign(new Error(message), { code, details: Object.freeze({ ...details }) });
}

function freezeDeep(value) {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
  for (let child of Object.values(value)) freezeDeep(child);
  return Object.freeze(value);
}

function clone(value, field) {
  try {
    return structuredClone(value);
  } catch {
    fail('CV_SHOW_AUDIO_RELEASE_INVALID', `CV Show audio release ${field} is not cloneable JSON`);
  }
}

function isRecord(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  let prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function exactKeys(value, expected) {
  if (!isRecord(value)) return false;
  let actual = Object.keys(value).sort();
  let required = [...expected].sort();
  return actual.length === required.length
    && actual.every((key, index) => key === required[index]);
}

function same(left, right) {
  return canonicalize(left) === canonicalize(right);
}

function sha256(value) {
  return createHash('sha256').update(value).digest('hex');
}

function canonicalHash(value) {
  return sha256(Buffer.from(canonicalize(value), 'utf8'));
}

function contentId(schemaVersion, value) {
  return `${schemaVersion}:${canonicalHash(value)}`;
}

function requireText(value, field) {
  if (typeof value !== 'string' || !value.trim() || /[\r\n\0]/u.test(value)) {
    fail('CV_SHOW_AUDIO_RELEASE_INVALID', `CV Show audio release ${field} is invalid`);
  }
  return value;
}

function requireSha256(value, field) {
  if (typeof value !== 'string' || !SHA256_PATTERN.test(value)) {
    fail('CV_SHOW_AUDIO_RELEASE_INVALID', `CV Show audio release ${field} must be a SHA-256`);
  }
  return value;
}

function validatePortableValue(value, field, ancestors = new Set()) {
  if (value === null || typeof value === 'boolean' || typeof value === 'string') {
    if (typeof value === 'string' && (value.startsWith('/') || /^[A-Za-z]:[\\/]/u.test(value))) {
      fail('CV_SHOW_AUDIO_RELEASE_INVALID', `CV Show audio release ${field} contains a host path`);
    }
    return;
  }
  if (typeof value === 'number' && Number.isFinite(value)) return;
  if (!value || typeof value !== 'object' || ancestors.has(value)) {
    fail('CV_SHOW_AUDIO_RELEASE_INVALID', `CV Show audio release ${field} is not canonical JSON`);
  }
  ancestors.add(value);
  if (Array.isArray(value)) {
    for (let [index, child] of value.entries()) {
      validatePortableValue(child, `${field}[${index}]`, ancestors);
    }
  } else {
    if (!isRecord(value)) {
      fail('CV_SHOW_AUDIO_RELEASE_INVALID', `CV Show audio release ${field} is not a plain object`);
    }
    for (let [key, child] of Object.entries(value)) {
      if (/endpoint|credential|token|privateRoot|referenceFile|referencePath|humanIdentity/iu.test(key)) {
        fail('CV_SHOW_AUDIO_RELEASE_INVALID', `CV Show audio release ${field}.${key} is private host data`);
      }
      validatePortableValue(child, `${field}.${key}`, ancestors);
    }
  }
  ancestors.delete(value);
}

function validateProject(value, field) {
  if (
    !exactKeys(value, ['revision', 'authoringProjectHash'])
    || !Number.isSafeInteger(value.revision)
    || value.revision < 0
  ) {
    fail('CV_SHOW_AUDIO_RELEASE_INVALID', `CV Show audio release ${field} is invalid`);
  }
  requireText(value.authoringProjectHash, `${field} hash`);
  return value;
}

function validatePlanProject(value) {
  if (!exactKeys(value, ['revision', 'authoringProjectHash', 'input']) || !isRecord(value.input)) {
    fail('CV_SHOW_AUDIO_RELEASE_INVALID', 'CV Show aggregate semantic Project base is invalid');
  }
  validateProject({
    revision: value.revision,
    authoringProjectHash: value.authoringProjectHash,
  }, 'Project base');
  let project;
  try {
    project = createPresentationAuthoringProject(value.input);
  } catch (error) {
    fail(
      'CV_SHOW_AUDIO_RELEASE_INVALID',
      'CV Show aggregate semantic Project input is invalid',
      { causeCode: error?.code || 'UNKNOWN' },
    );
  }
  if (project.revision !== value.revision || project.hash !== value.authoringProjectHash) {
    fail('CV_SHOW_AUDIO_RELEASE_INVALID', 'CV Show aggregate semantic Project base is stale');
  }
  return value;
}

function projectBase(value) {
  return {
    revision: value.revision,
    authoringProjectHash: value.authoringProjectHash,
  };
}

function validateProvenance(value, expectedEntryIds) {
  if (
    !exactKeys(value, [
      'schemaVersion',
      'voiceIdentityHash',
      'synthesisPolicyHash',
      'asrProfileHash',
      'alignerContractHash',
      'entries',
      'hash',
    ])
    || value.schemaVersion !== PROVENANCE_SCHEMA
    || !Array.isArray(value.entries)
    || value.entries.length !== 30
  ) {
    fail('CV_SHOW_AUDIO_RELEASE_PROVENANCE_INVALID', 'CV Show accepted audio provenance is invalid');
  }
  let profileKeys = [
    'voiceIdentityHash',
    'synthesisPolicyHash',
    'asrProfileHash',
    'alignerContractHash',
  ];
  for (let key of profileKeys) requireText(value[key], `accepted provenance ${key}`);
  let ids = value.entries.map((entry) => entry?.entryId);
  if (
    ids.some((entryId) => typeof entryId !== 'string')
    || new Set(ids).size !== 30
    || (expectedEntryIds && !same(ids, expectedEntryIds))
  ) {
    fail(
      'CV_SHOW_AUDIO_RELEASE_PROVENANCE_INVALID',
      'CV Show accepted audio provenance entries are missing, duplicated, or reordered',
    );
  }
  let projection = {
    voiceIdentityHash: value.voiceIdentityHash,
    synthesisPolicyHash: value.synthesisPolicyHash,
    asrProfileHash: value.asrProfileHash,
    alignerContractHash: value.alignerContractHash,
    entries: value.entries,
  };
  let expectedHash = `${PROVENANCE_SCHEMA}:${computeIntegrity(projection)}`;
  if (value.hash !== expectedHash) {
    fail(
      'CV_SHOW_AUDIO_RELEASE_PROVENANCE_INVALID',
      'CV Show accepted audio provenance integrity is forged',
    );
  }
  return value;
}

function validateEntryRelease(value, expected) {
  if (
    !exactKeys(value, [
      'schemaVersion',
      'entryReleaseId',
      'entryId',
      'mediaInput',
      'wav',
      'recognition',
      'alignment',
      'verification',
    ])
    || value.schemaVersion !== ENTRY_RELEASE_SCHEMA
    || value.entryId !== expected.entryId
    || !same(value.mediaInput, expected.mediaInput)
    || !isRecord(value.wav)
    || !isRecord(value.recognition)
    || !isRecord(value.alignment)
    || !isRecord(value.verification)
  ) {
    fail(
      'CV_SHOW_AUDIO_RELEASE_ENTRY_INVALID',
      `CV Show audio entry release ${expected.entryId} is stale or incomplete`,
    );
  }
  if (
    !exactKeys(value.verification, [
      'timingCoverage',
      'alignedSequenceHash',
      'timelineHash',
    ])
    || value.verification.timingCoverage !== 1
    || typeof value.verification.alignedSequenceHash !== 'string'
    || typeof value.verification.timelineHash !== 'string'
  ) {
    fail(
      'CV_SHOW_AUDIO_RELEASE_ENTRY_INVALID',
      `CV Show audio entry release ${expected.entryId} media verification is invalid`,
    );
  }
  let projection = { ...value };
  delete projection.entryReleaseId;
  if (value.entryReleaseId !== contentId(ENTRY_RELEASE_SCHEMA, projection)) {
    fail(
      'CV_SHOW_AUDIO_RELEASE_ENTRY_INVALID',
      `CV Show audio entry release ${expected.entryId} integrity is forged`,
    );
  }
  return value;
}

function mediaInputFor(plan, entryId) {
  let provenance = plan.provenance.entries.find((entry) => entry.entryId === entryId);
  if (!provenance) {
    fail('CV_SHOW_AUDIO_RELEASE_ENTRY_INVALID', `CV Show provenance is missing ${entryId}`);
  }
  return {
    entryId,
    narrationInputHash: provenance.narrationInputHash,
    synthesisInputHash: provenance.synthesisInputHash,
    voiceIdentityHash: plan.provenance.voiceIdentityHash,
    synthesisPolicyHash: plan.provenance.synthesisPolicyHash,
    asrProfileHash: plan.provenance.asrProfileHash,
    alignerContractHash: plan.provenance.alignerContractHash,
  };
}

function normalizePlan(input) {
  let source = clone(input, 'plan');
  if (
    !exactKeys(source, [
      'schemaVersion',
      'project',
      'provenance',
      'predecessor',
      'entries',
    ])
    || source.schemaVersion !== PLAN_SCHEMA
    || !Array.isArray(source.entries)
    || source.entries.length !== 30
    || !exactKeys(source.predecessor, ['release', 'projectBase'])
  ) {
    fail('CV_SHOW_AUDIO_RELEASE_INVALID', 'CV Show aggregate release plan shape is invalid');
  }
  validatePlanProject(source.project);
  let project = createPresentationAuthoringProject(source.project.input);
  if (
    !exactKeys(source.predecessor.projectBase, [
      'revision',
      'authoringProjectHash',
      'sourceSha256',
    ])
    || !SHA256_ID_PATTERN.test(source.predecessor.projectBase.sourceSha256)
  ) {
    fail('CV_SHOW_AUDIO_RELEASE_INVALID', 'CV Show predecessor source base is invalid');
  }
  validateProject({
    revision: source.predecessor.projectBase.revision,
    authoringProjectHash: source.predecessor.projectBase.authoringProjectHash,
  }, 'predecessor Project base');
  validateRelease(source.predecessor.release);
  if (
    source.predecessor.release.project.revision !== source.predecessor.projectBase.revision
    || source.predecessor.release.project.authoringProjectHash
      !== source.predecessor.projectBase.authoringProjectHash
  ) {
    fail('CV_SHOW_AUDIO_RELEASE_INVALID', 'CV Show predecessor Project/release base is stale');
  }
  let derived = createCvShowEntryProvenance(project);
  let entryIds = derived.entries.map(({ entryId }) => entryId);
  if (
    !same(source.entries.map((entry) => entry?.entryId), entryIds)
  ) {
    fail(
      'CV_SHOW_AUDIO_RELEASE_ENTRY_INVALID',
      'CV Show aggregate release entries are missing, duplicated, or reordered',
    );
  }
  validateProvenance(source.provenance, entryIds);
  let expectedProvenanceEntries = derived.entries.map((entry) => ({
    ...entry,
    synthesisInputHash: `cv-show-synthesis-input-v1:${computeIntegrity({
      narrationInputHash: entry.narrationInputHash,
      voiceIdentityHash: source.provenance.voiceIdentityHash,
      synthesisPolicyHash: source.provenance.synthesisPolicyHash,
    })}`,
  }));
  if (!same(source.provenance.entries, expectedProvenanceEntries)) {
    fail(
      'CV_SHOW_AUDIO_RELEASE_PROVENANCE_INVALID',
      'CV Show accepted audio provenance does not match the current Project',
    );
  }
  for (let [index, entry] of source.entries.entries()) {
    if (!exactKeys(entry, entry.mode === 'reuse'
      ? ['entryId', 'mode', 'release']
      : ['entryId', 'mode', 'runnerPlan'])) {
      fail('CV_SHOW_AUDIO_RELEASE_ENTRY_INVALID', `CV Show disposition ${entry?.entryId} is invalid`);
    }
    if (entry.mode === 'reuse') {
      validateEntryRelease(entry.release, {
        entryId: entry.entryId,
        mediaInput: mediaInputFor(source, entry.entryId),
      });
      if (entry.release.entryReleaseId !== source.predecessor.release.entryReleaseIds[index]) {
        fail('CV_SHOW_AUDIO_RELEASE_ENTRY_INVALID', 'Reused CV Show entry is not the predecessor entry');
      }
    } else if (entry.mode === 'regenerate') {
      let timeline = createPresentationAuthoringTimelineProjection(
        createCvShowEntryProject(project, entry.entryId),
      );
      if (
        !exactKeys(entry.runnerPlan, [
          'entryId',
          'timeline',
          'synthesisItem',
          'locale',
          'voice',
          'readinessProfile',
          'requiredAnchors',
        ])
        || entry.runnerPlan.entryId !== entry.entryId
        || !same(entry.runnerPlan.timeline, timeline)
        || entry.runnerPlan.synthesisItem?.id !== entry.entryId
        || entry.runnerPlan.synthesisItem?.text !== timeline.turns[0].text
        || entry.runnerPlan.locale !== timeline.locale
      ) {
        fail('CV_SHOW_AUDIO_RELEASE_ENTRY_INVALID', 'Regenerated CV Show entry plan is stale');
      }
    } else {
      fail('CV_SHOW_AUDIO_RELEASE_ENTRY_INVALID', 'CV Show entry disposition is unsupported');
    }
  }
  validatePortableValue(source, 'plan');
  let planId = contentId(PLAN_SCHEMA, source);
  return freezeDeep({ ...source, planId });
}

function createGeneratedEntryEvidence(result, plan, disposition) {
  if (!exactKeys(result, ['stateHash', 'state', 'entryRelease'])) {
    fail(
      'CV_SHOW_AUDIO_RELEASE_ENTRY_INVALID',
      `CV Show runner evidence for ${disposition.entryId} has unexpected fields`,
    );
  }
  requireSha256(result.stateHash, 'runner state hash');
  if (
    !exactKeys(result.state, [
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
    ])
    || result.state.schemaVersion !== 'cv-show-audio-pipeline-entry-state-v1'
    || canonicalHash(result.state) !== result.stateHash
    || result.state?.phase !== 'entry-verified'
    || !same(result.state.plan, disposition.runnerPlan)
    || result.state.plan.entryId !== disposition.entryId
    || !Array.isArray(result.state.attemptHashes)
    || result.state.review?.approved !== true
    || result.state.failure !== null
    || !isRecord(result.state.synthesis)
    || !isRecord(result.state.transcript)
    || !isRecord(result.state.alignment)
    || !isRecord(result.state.verification)
  ) {
    fail(
      'CV_SHOW_AUDIO_RELEASE_ENTRY_INVALID',
      `CV Show runner evidence for ${disposition.entryId} is nonterminal, stale, or forged`,
    );
  }
  let release = validateEntryRelease(result.entryRelease, {
    entryId: disposition.entryId,
    mediaInput: mediaInputFor(plan, disposition.entryId),
  });
  if (
    release.wav.sha256 !== result.state.synthesis.wavHash
    || release.verification.timingCoverage !== result.state.alignment.metrics?.timingCoverage
    || release.verification.alignedSequenceHash !== result.state.alignment.sequence?.hash
    || release.verification.timelineHash !== result.state.alignment.sequence?.timelineHash
  ) {
    fail(
      'CV_SHOW_AUDIO_RELEASE_ENTRY_INVALID',
      `CV Show generated entry release ${disposition.entryId} is not bound to runner evidence`,
    );
  }
  return freezeDeep({
    schemaVersion: ENTRY_EVIDENCE_SCHEMA,
    entryId: disposition.entryId,
    stateHash: result.stateHash,
    state: clone(result.state, 'runner state'),
    entryRelease: clone(release, 'generated entry release'),
  });
}

function validateEntryEvidence(value, plan, disposition) {
  if (
    !exactKeys(value, ['schemaVersion', 'entryId', 'stateHash', 'state', 'entryRelease'])
    || value.schemaVersion !== ENTRY_EVIDENCE_SCHEMA
    || value.entryId !== disposition.entryId
  ) {
    fail('CV_SHOW_AUDIO_RELEASE_ENTRY_INVALID', 'CV Show persisted entry evidence is corrupt');
  }
  return createGeneratedEntryEvidence({
    stateHash: value.stateHash,
    state: value.state,
    entryRelease: value.entryRelease,
  }, plan, disposition);
}

function normalizeInventoryFile(value, field) {
  if (
    !isRecord(value)
    || typeof value.path !== 'string'
    || !value.path
    || value.path.includes('\\')
    || value.path.startsWith('/')
    || value.path.split('/').includes('..')
    || value.path.split('/').includes('.')
    || !SHA256_PATTERN.test(value.sha256)
    || !Number.isSafeInteger(value.size)
    || value.size < 0
  ) {
    fail('CV_SHOW_AUDIO_RELEASE_TREE_INVALID', `CV Show ${field} inventory row is invalid`);
  }
  return { path: value.path, sha256: value.sha256, size: value.size };
}

export function createCvShowArtifactTreeIdentity(inventory = []) {
  if (!Array.isArray(inventory) || inventory.length !== 92) {
    fail('CV_SHOW_AUDIO_RELEASE_TREE_INVALID', 'CV Show artifact tree must contain 92 files');
  }
  let rows = inventory.map((row, index) => normalizeInventoryFile(row, `artifact ${index}`));
  rows.sort((left, right) => (left.path < right.path ? -1 : left.path > right.path ? 1 : 0));
  if (new Set(rows.map(({ path }) => path)).size !== rows.length) {
    fail('CV_SHOW_AUDIO_RELEASE_TREE_INVALID', 'CV Show artifact inventory paths are duplicated');
  }
  return freezeDeep({
    inventory: rows,
    artifactTreeHash: contentId('cv-show-audio-artifact-tree-v1', rows),
  });
}

function entryInventory(entry) {
  return [entry.wav, entry.recognition, entry.alignment]
    .map((artifact, index) => normalizeInventoryFile(artifact, `${entry.entryId} output ${index}`));
}

function releaseInventory(manifests, entryReleases) {
  let manifestRows = [manifests.audio, manifests.alignment]
    .map((manifest, index) => normalizeInventoryFile(manifest, `manifest ${index}`));
  return createCvShowArtifactTreeIdentity([
    ...manifestRows,
    ...entryReleases.flatMap(entryInventory),
  ]);
}

function releaseProjection({
  plan,
  entryReleases,
  mediaCollectionIdentity,
  manifests,
  verificationHash,
  artifactTreeHash,
}) {
  return {
    schemaVersion: RELEASE_SCHEMA,
    entryReleaseIds: entryReleases.map(({ entryReleaseId }) => entryReleaseId),
    project: projectBase(plan.project),
    mediaCollectionIdentity,
    profiles: {
      voiceIdentityHash: plan.provenance.voiceIdentityHash,
      synthesisPolicyHash: plan.provenance.synthesisPolicyHash,
      asrProfileHash: plan.provenance.asrProfileHash,
      alignerContractHash: plan.provenance.alignerContractHash,
    },
    manifests,
    artifactTreeHash,
    acceptedProvenance: plan.provenance,
    predecessorReleaseId: plan.predecessor.release.releaseId,
    planId: plan.planId,
    verificationHash,
  };
}

export function createCvShowAudioReleaseDescriptor(input = {}) {
  let projection = clone(input, 'release projection');
  if (!exactKeys(projection, [
    'schemaVersion',
    'entryReleaseIds',
    'project',
    'mediaCollectionIdentity',
    'profiles',
    'manifests',
    'artifactTreeHash',
    'acceptedProvenance',
    'predecessorReleaseId',
    'planId',
    'verificationHash',
  ]) || projection.schemaVersion !== RELEASE_SCHEMA) {
    fail('CV_SHOW_AUDIO_RELEASE_INVALID', 'CV Show audio release projection is invalid');
  }
  validateProject(projection.project, 'release Project base');
  validateProvenance(projection.acceptedProvenance);
  if (
    !exactKeys(projection.profiles, [
      'voiceIdentityHash',
      'synthesisPolicyHash',
      'asrProfileHash',
      'alignerContractHash',
    ])
    || !isRecord(projection.mediaCollectionIdentity)
    || !isRecord(projection.manifests)
    || !/^cv-show-audio-artifact-tree-v1:[a-f0-9]{64}$/u.test(projection.artifactTreeHash)
    || !/^cv-show-audio-release-plan-v1:[a-f0-9]{64}$/u.test(projection.planId)
    || !/^cv-show-audio-release-verification-v1:[a-f0-9]{64}$/u.test(
      projection.verificationHash,
    )
    || !same(projection.profiles, {
      voiceIdentityHash: projection.acceptedProvenance.voiceIdentityHash,
      synthesisPolicyHash: projection.acceptedProvenance.synthesisPolicyHash,
      asrProfileHash: projection.acceptedProvenance.asrProfileHash,
      alignerContractHash: projection.acceptedProvenance.alignerContractHash,
    })
  ) {
    fail('CV_SHOW_AUDIO_RELEASE_INVALID', 'CV Show audio release aggregate identity is invalid');
  }
  if (
    !Array.isArray(projection.entryReleaseIds)
    || projection.entryReleaseIds.length !== 30
    || new Set(projection.entryReleaseIds).size !== 30
    || projection.entryReleaseIds.some((entryReleaseId) => (
      !/^cv-show-audio-entry-release-v1:[a-f0-9]{64}$/u.test(entryReleaseId)
    ))
  ) {
    fail('CV_SHOW_AUDIO_RELEASE_INVALID', 'CV Show audio release must bind 30 ordered entries');
  }
  validatePortableValue(projection, 'release');
  return freezeDeep({
    ...projection,
    releaseId: contentId(RELEASE_SCHEMA, projection),
  });
}

function validateRelease(value) {
  if (!isRecord(value) || typeof value.releaseId !== 'string') {
    fail('CV_SHOW_AUDIO_RELEASE_INVALID', 'CV Show audio release descriptor is invalid');
  }
  let projection = { ...value };
  delete projection.releaseId;
  let normalized = createCvShowAudioReleaseDescriptor(projection);
  if (normalized.releaseId !== value.releaseId) {
    fail('CV_SHOW_AUDIO_RELEASE_INVALID', 'CV Show audio release descriptor integrity is forged');
  }
  return value;
}

function publicState(state) {
  return freezeDeep(clone(state, 'durable state'));
}

function validateState(state, plan) {
  if (
    !exactKeys(state, [
      'schemaVersion',
      'planId',
      'phase',
      'entryObjectHashes',
      'releaseArtifactEvidenceHash',
      'releaseObjectHash',
      'approval',
      'operation',
      'receipt',
    ])
    || state.schemaVersion !== STATE_SCHEMA
    || state.planId !== plan.planId
    || !PHASES.has(state.phase)
    || !Array.isArray(state.entryObjectHashes)
  ) {
    fail('CV_SHOW_AUDIO_RELEASE_STATE_INVALID', 'CV Show audio release durable state is invalid');
  }
  return state;
}

async function load(run, plan, required = true) {
  let head = await run.readHead();
  if (!head) {
    if (!required) return null;
    fail('CV_SHOW_AUDIO_RELEASE_NOT_INITIALIZED', 'Initialize the CV Show audio release first');
  }
  return { head, state: validateState(head.state, plan) };
}

async function replace(run, context, nextState) {
  let stateHash = await run.putObject(nextState);
  await run.compareAndSwapHead(context.head.headHash, stateHash);
  return load(run, { planId: nextState.planId });
}

async function withLock(run, ownerToken, operation) {
  await run.acquireLock(ownerToken);
  try {
    return await operation();
  } finally {
    await run.releaseLock(ownerToken);
  }
}

async function entryReleases(run, plan, state) {
  let regenerated = plan.entries.filter(({ mode }) => mode === 'regenerate');
  if (state.entryObjectHashes.length > regenerated.length) {
    fail('CV_SHOW_AUDIO_RELEASE_ENTRY_INVALID', 'CV Show persisted entry evidence is duplicated');
  }
  let generated = new Map();
  for (let [index, hash] of state.entryObjectHashes.entries()) {
    let evidence = validateEntryEvidence(await run.readObject(hash), plan, regenerated[index]);
    if (generated.has(evidence.entryId)) {
      fail('CV_SHOW_AUDIO_RELEASE_ENTRY_INVALID', 'CV Show persisted entry evidence is duplicated');
    }
    generated.set(evidence.entryId, evidence.entryRelease);
  }
  return plan.entries.map((entry) => entry.mode === 'reuse'
    ? entry.release
    : generated.get(entry.entryId));
}

function validateCanonicalEntryReleases(plan, releases) {
  if (!Array.isArray(releases) || releases.length !== plan.entries.length) {
    fail('CV_SHOW_AUDIO_RELEASE_ENTRY_INVALID', 'CV Show canonical entry releases are incomplete');
  }
  for (let [index, release] of releases.entries()) {
    validateEntryRelease(release, {
      entryId: plan.entries[index].entryId,
      mediaInput: mediaInputFor(plan, plan.entries[index].entryId),
    });
  }
  return releases;
}

function normalizeReleaseArtifactEvidence(value) {
  let source = clone(value, 'release artifact evidence');
  if (
    !exactKeys(source, ['mediaCollectionIdentity', 'manifests'])
    || !isRecord(source.mediaCollectionIdentity)
    || !exactKeys(source.manifests, ['locale', 'voice', 'audio', 'alignment'])
    || !exactKeys(source.manifests.audio, ['path', 'sha256', 'size'])
    || !exactKeys(source.manifests.alignment, ['path', 'sha256', 'size', 'model'])
  ) {
    fail(
      'CV_SHOW_AUDIO_RELEASE_ARTIFACT_EVIDENCE_INVALID',
      'CV Show aggregate artifact inspection evidence is invalid',
    );
  }
  normalizeInventoryFile(source.manifests.audio, 'audio manifest');
  normalizeInventoryFile(source.manifests.alignment, 'alignment manifest');
  requireText(source.manifests.locale, 'manifest locale');
  requireText(source.manifests.voice, 'manifest voice');
  requireText(source.manifests.alignment.model, 'alignment model');
  validatePortableValue(source, 'release artifact evidence');
  return freezeDeep({
    schemaVersion: RELEASE_ARTIFACT_EVIDENCE_SCHEMA,
    mediaCollectionIdentity: source.mediaCollectionIdentity,
    manifests: source.manifests,
  });
}

function validateReleaseArtifactEvidence(value) {
  if (
    !exactKeys(value, ['schemaVersion', 'mediaCollectionIdentity', 'manifests'])
    || value.schemaVersion !== RELEASE_ARTIFACT_EVIDENCE_SCHEMA
  ) {
    fail(
      'CV_SHOW_AUDIO_RELEASE_ARTIFACT_EVIDENCE_INVALID',
      'CV Show persisted aggregate artifact evidence is corrupt',
    );
  }
  return normalizeReleaseArtifactEvidence({
    mediaCollectionIdentity: value.mediaCollectionIdentity,
    manifests: value.manifests,
  });
}

async function externalTransition({
  run,
  plan,
  context,
  name,
  fromPhase,
  toPhase,
  callback,
}) {
  if (context.state.phase === toPhase || context.state.phase === 'promoted') {
    return publicState(context.state);
  }
  if (context.state.phase !== fromPhase) {
    fail(
      'CV_SHOW_AUDIO_RELEASE_PHASE_INVALID',
      `CV Show audio release ${name} is not permitted from ${context.state.phase}`,
    );
  }
  let reconcile = context.state.operation?.name === name
    && context.state.operation.status === 'dispatched';
  if (context.state.operation && !reconcile) {
    fail('CV_SHOW_AUDIO_RELEASE_OUTCOME_UNKNOWN', `CV Show audio release ${name} outcome is divergent`);
  }
  if (!reconcile) {
    context = await replace(run, context, {
      ...context.state,
      operation: { name, status: 'dispatched' },
    });
  }
  let release = validateRelease(await run.readObject(context.state.releaseObjectHash));
  let entries = await entryReleases(run, plan, context.state);
  let receipt = await callback(freezeDeep({
    plan,
    release,
    entries,
    approval: context.state.approval,
    reconcile,
  }));
  if (!isRecord(receipt)) {
    fail('CV_SHOW_AUDIO_RELEASE_OUTCOME_UNKNOWN', `CV Show audio release ${name} receipt is invalid`);
  }
  context = await load(run, plan);
  if (
    context.state.phase !== fromPhase
    || context.state.operation?.name !== name
    || context.state.operation?.status !== 'dispatched'
  ) {
    fail('CV_SHOW_AUDIO_RELEASE_HEAD_STALE', `CV Show audio release changed during ${name}`);
  }
  context = await replace(run, context, {
    ...context.state,
    phase: toPhase,
    operation: null,
    receipt: clone(receipt, `${name} receipt`),
  });
  return publicState(context.state);
}

/**
 * @param {object} input
 * @returns {object}
 */
export function createCvShowAudioReleasePipeline(input = {}) {
  if (
    !exactKeys(input, [
      'storage',
      'inspectEntry',
      'inspectReleaseArtifacts',
      'stageRelease',
      'promoteRelease',
    ])
    || typeof input.storage?.openRun !== 'function'
    || typeof input.inspectEntry !== 'function'
    || typeof input.inspectReleaseArtifacts !== 'function'
    || typeof input.stageRelease !== 'function'
    || typeof input.promoteRelease !== 'function'
  ) {
    fail('CV_SHOW_AUDIO_RELEASE_INVALID', 'CV Show audio release pipeline dependencies are invalid');
  }
  let {
    storage,
    inspectEntry,
    inspectReleaseArtifacts,
    stageRelease,
    promoteRelease,
  } = input;

  let openRelease = (planInput) => {
    let plan = normalizePlan(planInput);
    let run = storage.openRun({ schemaVersion: PLAN_SCHEMA, planId: plan.planId });

    let initialize = async (...args) => {
      if (args.length) fail('CV_SHOW_AUDIO_RELEASE_INVALID', 'Initialize takes no input');
      let existing = await load(run, plan, false);
      if (existing) return publicState(existing.state);
      let state = {
        schemaVersion: STATE_SCHEMA,
        planId: plan.planId,
        phase: 'entries-pending',
        entryObjectHashes: [],
        releaseArtifactEvidenceHash: null,
        releaseObjectHash: null,
        approval: null,
        operation: null,
        receipt: null,
      };
      let stateHash = await run.putObject(state);
      await run.compareAndSwapHead(null, stateHash);
      return publicState((await load(run, plan)).state);
    };

    let inspect = async (...args) => {
      if (args.length) fail('CV_SHOW_AUDIO_RELEASE_INVALID', 'Inspect takes no input');
      return publicState((await load(run, plan)).state);
    };

    let verifyEntries = async (...args) => {
      if (args.length !== 1) fail('CV_SHOW_AUDIO_RELEASE_INVALID', 'Entry verification needs one owner');
      let [ownerToken] = args;
      return withLock(run, ownerToken, async () => {
        let context = await load(run, plan);
        if (context.state.phase === 'entries-pending') {
          let regenerated = plan.entries.filter(({ mode }) => mode === 'regenerate');
          await entryReleases(run, plan, context.state);
          for (
            let index = context.state.entryObjectHashes.length;
            index < regenerated.length;
            index += 1
          ) {
            let disposition = regenerated[index];
            let result = await inspectEntry(disposition.runnerPlan);
            let evidence = createGeneratedEntryEvidence(result, plan, disposition);
            let evidenceHash = await run.putObject(evidence);
            context = await replace(run, context, {
              ...context.state,
              entryObjectHashes: [...context.state.entryObjectHashes, evidenceHash],
            });
          }
          let releases = await entryReleases(run, plan, context.state);
          if (releases.some((release) => !release)) {
            fail('CV_SHOW_AUDIO_RELEASE_ENTRY_INVALID', 'CV Show entry evidence is incomplete');
          }
          context = await replace(run, context, {
            ...context.state,
            phase: 'entries-verified',
          });
          return publicState(context.state);
        }
        if (context.state.phase === 'entries-verified') {
          let releases = validateCanonicalEntryReleases(
            plan,
            await entryReleases(run, plan, context.state),
          );
          let verificationHash = contentId('cv-show-audio-release-verification-v1', {
            planId: plan.planId,
            entries: releases,
          });
          let mediaCollectionIdentity;
          let manifests;
          if (plan.entries.every(({ mode }) => mode === 'reuse')) {
            mediaCollectionIdentity = plan.predecessor.release.mediaCollectionIdentity;
            manifests = {
              locale: plan.predecessor.release.manifests.locale,
              voice: plan.predecessor.release.manifests.voice,
              audio: plan.predecessor.release.manifests.audio,
              alignment: plan.predecessor.release.manifests.alignment,
            };
          } else {
            let evidence;
            if (context.state.releaseArtifactEvidenceHash) {
              evidence = validateReleaseArtifactEvidence(
                await run.readObject(context.state.releaseArtifactEvidenceHash),
              );
            } else {
              let observerEntries = freezeDeep(clone(releases, 'release artifact entries'));
              evidence = normalizeReleaseArtifactEvidence(
                await inspectReleaseArtifacts({ plan, entries: observerEntries }),
              );
              validateCanonicalEntryReleases(plan, releases);
              let releaseArtifactEvidenceHash = await run.putObject(evidence);
              context = await replace(run, context, {
                ...context.state,
                releaseArtifactEvidenceHash,
              });
            }
            mediaCollectionIdentity = evidence.mediaCollectionIdentity;
            manifests = evidence.manifests;
          }
          let tree = releaseInventory(manifests, releases);
          manifests = {
            locale: manifests.locale,
            voice: manifests.voice,
            directory: tree.artifactTreeHash.split(':').at(-1),
            audio: manifests.audio,
            alignment: manifests.alignment,
          };
          let release = createCvShowAudioReleaseDescriptor(releaseProjection({
            plan,
            entryReleases: releases,
            mediaCollectionIdentity,
            manifests,
            verificationHash,
            artifactTreeHash: tree.artifactTreeHash,
          }));
          let releaseObjectHash = await run.putObject(release);
          context = await replace(run, context, {
            ...context.state,
            phase: 'release-verified',
            releaseObjectHash,
          });
          return publicState(context.state);
        }
        return publicState(context.state);
      });
    };

    let approve = async (...args) => {
      if (args.length !== 1 || !exactKeys(args[0], ['ownerToken', 'approved'])) {
        fail('CV_SHOW_AUDIO_RELEASE_INVALID', 'Approval needs an owner and exact decision');
      }
      let decision = args[0];
      if (typeof decision.approved !== 'boolean') {
        fail('CV_SHOW_AUDIO_RELEASE_INVALID', 'CV Show audio release approval decision is invalid');
      }
      return withLock(run, decision.ownerToken, async () => {
        let context = await load(run, plan);
        if (context.state.phase !== 'release-verified' || context.state.approval) {
          fail(
            'CV_SHOW_AUDIO_RELEASE_APPROVAL_NOT_PERMITTED',
            'CV Show audio release approval requires the exact unreviewed verified release',
          );
        }
        let release = validateRelease(await run.readObject(context.state.releaseObjectHash));
        let approvalProjection = {
          schemaVersion: APPROVAL_SCHEMA,
          approved: decision.approved,
          releaseId: release.releaseId,
          artifactTreeHash: release.artifactTreeHash,
          verificationHash: release.verificationHash,
        };
        let approval = {
          ...approvalProjection,
          approvalId: contentId(APPROVAL_SCHEMA, approvalProjection),
        };
        context = await replace(run, context, {
          ...context.state,
          phase: decision.approved ? 'human-approved' : 'release-verified',
          approval,
        });
        return publicState(context.state);
      });
    };

    let stage = async (...args) => {
      if (args.length !== 1) fail('CV_SHOW_AUDIO_RELEASE_INVALID', 'Stage needs one owner');
      return withLock(run, args[0], async () => {
        let context = await load(run, plan);
        if (context.state.approval?.approved !== true) {
          fail('CV_SHOW_AUDIO_RELEASE_APPROVAL_REQUIRED', 'Approve the verified release before staging');
        }
        return externalTransition({
          run,
          plan,
          context,
          name: 'stage',
          fromPhase: 'human-approved',
          toPhase: 'staged',
          callback: stageRelease,
        });
      });
    };

    let promote = async (...args) => {
      if (args.length !== 1) fail('CV_SHOW_AUDIO_RELEASE_INVALID', 'Promote needs one owner');
      return withLock(run, args[0], async () => externalTransition({
        run,
        plan,
        context: await load(run, plan),
        name: 'promote',
        fromPhase: 'staged',
        toPhase: 'promoted',
        callback: promoteRelease,
      }));
    };

    return Object.freeze({ initialize, inspect, verifyEntries, approve, stage, promote });
  };

  return Object.freeze({ openRelease });
}
