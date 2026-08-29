import { computeIntegrity } from 'symbiote-workspace/schema/canonical-json.js';
import {
  createCvShowEntryProvenance,
} from '../src/static-pages/js/tour-player/presentationProjectAdapter.js';

const AUDIO_PROVENANCE_SCHEMA = 'cv-show-audio-provenance-v1';
const AUDIO_DIRTY_PLAN_SCHEMA = 'cv-show-audio-dirty-plan-v1';
const VOICE_IDENTITY_SCHEMA = 'cv-show-voice-identity-v1';
const SYNTHESIS_POLICY_SCHEMA = 'cv-show-synthesis-policy-v1';
const SYNTHESIS_INPUT_SCHEMA = 'cv-show-synthesis-input-v1';
const ASR_PROFILE_SCHEMA = 'cv-show-asr-profile-v1';
const ALIGNER_CONTRACT_SCHEMA = 'cv-show-aligner-contract-v1';

function freezeDeep(value) {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
  for (let child of Object.values(value)) freezeDeep(child);
  return Object.freeze(value);
}

function identity(schemaVersion, value) {
  return `${schemaVersion}:${computeIntegrity(value)}`;
}

function invalid(reason, details = {}) {
  return Object.assign(
    new TypeError(`CV Show audio provenance is invalid: ${reason}`),
    { code: 'CV_SHOW_AUDIO_PROVENANCE_INVALID', details },
  );
}

function record(value, name) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw invalid(name, { field: name });
  }
  return structuredClone(value);
}

function createProfileIdentities({ voice, synthesisPolicy, asr, aligner }) {
  return {
    voiceIdentityHash: identity(VOICE_IDENTITY_SCHEMA, record(voice, 'voice')),
    synthesisPolicyHash: identity(
      SYNTHESIS_POLICY_SCHEMA,
      record(synthesisPolicy, 'synthesisPolicy'),
    ),
    asrProfileHash: identity(ASR_PROFILE_SCHEMA, record(asr, 'asr')),
    alignerContractHash: identity(ALIGNER_CONTRACT_SCHEMA, record(aligner, 'aligner')),
  };
}

function validateAccepted(value) {
  if (
    !value
    || value.schemaVersion !== AUDIO_PROVENANCE_SCHEMA
    || !Array.isArray(value.entries)
    || value.entries.length !== 30
  ) {
    throw invalid('accepted provenance', { field: 'accepted' });
  }
  let entryIds = value.entries.map(({ entryId }) => entryId);
  if (entryIds.some((entryId) => typeof entryId !== 'string') || new Set(entryIds).size !== 30) {
    throw invalid('accepted entries', { field: 'accepted.entries' });
  }
  let projection = {
    voiceIdentityHash: value.voiceIdentityHash,
    synthesisPolicyHash: value.synthesisPolicyHash,
    asrProfileHash: value.asrProfileHash,
    alignerContractHash: value.alignerContractHash,
    entries: value.entries,
  };
  if (value.hash !== identity(AUDIO_PROVENANCE_SCHEMA, projection)) {
    throw invalid('accepted integrity', { field: 'accepted.hash' });
  }
  return value;
}

function normalizeDependants(value, entryIds) {
  if (value === undefined) return {};
  let source = record(value, 'dependants');
  let known = new Set(entryIds);
  for (let [entryId, dependants] of Object.entries(source)) {
    if (!known.has(entryId) || !Array.isArray(dependants)) {
      throw invalid('dependants', { entryId });
    }
    for (let dependant of dependants) {
      if (!known.has(dependant)) throw invalid('dependant entry', { entryId, dependant });
    }
  }
  return source;
}

function dependantClosure(entryId, dependants) {
  let affected = new Set([entryId]);
  let pending = [entryId];
  while (pending.length) {
    let sourceId = pending.shift();
    for (let dependant of dependants[sourceId] || []) {
      if (affected.has(dependant)) continue;
      affected.add(dependant);
      pending.push(dependant);
    }
  }
  return affected;
}

function addAll(target, values) {
  for (let value of values) target.add(value);
}

/**
 * @param {object} input
 * @returns {object}
 */
export function createCvShowAudioProvenance({
  project,
  voice,
  synthesisPolicy,
  asr,
  aligner,
} = {}) {
  let entryProvenance = createCvShowEntryProvenance(project);
  let profiles = createProfileIdentities({ voice, synthesisPolicy, asr, aligner });
  let entries = entryProvenance.entries.map((entry) => ({
    ...structuredClone(entry),
    synthesisInputHash: identity(SYNTHESIS_INPUT_SCHEMA, {
      narrationInputHash: entry.narrationInputHash,
      voiceIdentityHash: profiles.voiceIdentityHash,
      synthesisPolicyHash: profiles.synthesisPolicyHash,
    }),
  }));
  let projection = { ...profiles, entries };
  return freezeDeep({
    schemaVersion: AUDIO_PROVENANCE_SCHEMA,
    ...projection,
    hash: identity(AUDIO_PROVENANCE_SCHEMA, projection),
  });
}

/**
 * @param {object} input
 * @returns {object}
 */
export function planCvShowAudioDirtySet({
  accepted,
  project,
  voice,
  synthesisPolicy,
  asr,
  aligner,
  dependants,
} = {}) {
  let prior = validateAccepted(accepted);
  let current = createCvShowAudioProvenance({
    project,
    voice,
    synthesisPolicy,
    asr,
    aligner,
  });
  let entryIds = current.entries.map(({ entryId }) => entryId);
  if (prior.entries.some(({ entryId }, index) => entryId !== entryIds[index])) {
    throw invalid('accepted entry order', { field: 'accepted.entries' });
  }
  let dependencies = normalizeDependants(dependants, entryIds);
  let priorById = new Map(prior.entries.map((entry) => [entry.entryId, entry]));
  let synthesis = new Set();
  let transcription = new Set();
  let alignment = new Set();
  let runtimeProjection = new Set();
  let synthesisProfileChanged = (
    prior.voiceIdentityHash !== current.voiceIdentityHash
    || prior.synthesisPolicyHash !== current.synthesisPolicyHash
  );
  if (synthesisProfileChanged) {
    addAll(synthesis, entryIds);
    addAll(transcription, entryIds);
    addAll(alignment, entryIds);
  }
  if (prior.asrProfileHash !== current.asrProfileHash) {
    addAll(transcription, entryIds);
    addAll(alignment, entryIds);
  }
  if (prior.alignerContractHash !== current.alignerContractHash) {
    addAll(alignment, entryIds);
  }
  for (let entry of current.entries) {
    let acceptedEntry = priorById.get(entry.entryId);
    let affected = dependantClosure(entry.entryId, dependencies);
    if (acceptedEntry.narrationInputHash !== entry.narrationInputHash) {
      addAll(synthesis, affected);
      addAll(transcription, affected);
      addAll(alignment, affected);
      addAll(runtimeProjection, affected);
      continue;
    }
    if (acceptedEntry.anchorContractHash !== entry.anchorContractHash) {
      addAll(runtimeProjection, affected);
    }
    if (
      acceptedEntry.attentionContractHash !== entry.attentionContractHash
      || acceptedEntry.entryProjectionHash !== entry.entryProjectionHash
    ) {
      addAll(runtimeProjection, affected);
    }
  }
  let ordered = (values) => entryIds.filter((entryId) => values.has(entryId));
  let dirty = {
    synthesis: ordered(synthesis),
    transcription: ordered(transcription),
    alignment: ordered(alignment),
    runtimeProjection: ordered(runtimeProjection),
  };
  let planProjection = {
    acceptedProvenanceHash: prior.hash,
    currentProvenanceHash: current.hash,
    dependants: dependencies,
    dirty,
  };
  return freezeDeep({
    schemaVersion: AUDIO_DIRTY_PLAN_SCHEMA,
    planId: identity(AUDIO_DIRTY_PLAN_SCHEMA, planProjection),
    current,
    dirty,
  });
}
