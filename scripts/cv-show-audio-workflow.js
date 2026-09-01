import { createHash } from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import {
  createPresentationAuthoringProject,
  createPresentationAuthoringProjectHashes,
  createPresentationAuthoringTimelineProjection,
  presentationAuthoringProjectCanonicalProjection,
} from 'symbiote-workspace';
import {
  canonicalize,
  computeIntegrity,
} from 'symbiote-workspace/schema/canonical-json.js';

import {
  createCvShowAudioReleasePipeline,
} from './cv-show-audio-pipeline.js';
import {
  createCvShowAudioPipelineRunner,
} from './cv-show-audio-pipeline-runner.js';
import {
  createCvShowAudioPipelineStorage,
} from './cv-show-audio-pipeline-storage.js';
import {
  createCvShowAudioPromotion,
} from './cv-show-audio-promotion.js';
import {
  createCvShowAudioProvenance,
  planCvShowAudioDirtySet,
} from './cv-show-audio-provenance.js';
import {
  createCvShowAudioClipProject,
} from './cv-show-audio-clips.js';
import {
  createCvShowModelServiceClient,
} from './cv-show-model-service-client.js';
import {
  publishCvShowWebAudio,
} from './cv-show-web-audio-publisher.js';
import {
  verifyCvShowPrivateArtifacts,
} from './verify-cv-show-private-artifacts.js';
import {
  verifyCvShowWebAudioMasterCompatibility,
} from './verify-production-build.js';
import {
  CV_SHOW_SOURCE_RELATIVE_PATH,
  loadCvShowSourceSelection,
} from './cv-show-authoring-materializer.js';
import {
  createCvShowEntryProject,
  createCvShowMediaBindingRegistry,
  projectCvShowStory,
} from '../src/static-pages/js/tour-player/presentationProjectAdapter.js';

const REPOSITORY_ROOT = fileURLToPath(new URL('../', import.meta.url));
const WORKFLOW_SCHEMA = 'cv-show-audio-workflow-plan-v1';
const RELEASE_PLAN_SCHEMA = 'cv-show-audio-release-plan-v1';
const ENTRY_RELEASE_SCHEMA = 'cv-show-audio-entry-release-v1';
const WEB_REUSE_RECEIPT_SCHEMA = 'cv-show-web-audio-workflow-reuse-v1';
const COUNTS = Object.freeze({ total: 30, short: 16, detail: 14, failures: 0 });
const TERMINAL_ENTRY_PHASES = new Set(['entry-verified', 'blocked', 'clip-rejected', 'outcome-unknown']);

function fail(code, message, details = {}) {
  throw Object.assign(new Error(message), { code, details: Object.freeze({ ...details }) });
}

function sha256(value) {
  return createHash('sha256').update(value).digest('hex');
}

function contentId(schemaVersion, value) {
  return `${schemaVersion}:${sha256(Buffer.from(canonicalize(value), 'utf8'))}`;
}

function freezeDeep(value) {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
  for (let child of Object.values(value)) freezeDeep(child);
  return Object.freeze(value);
}

function clone(value) {
  return structuredClone(value);
}

function record(value, field) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    fail('CV_SHOW_AUDIO_WORKFLOW_INVALID', `${field} must be an object`);
  }
  return value;
}

function absoluteRoot(value) {
  if (typeof value !== 'string' || !path.isAbsolute(value)) {
    fail(
      'CV_SHOW_AUDIO_WORKFLOW_PRIVATE_ROOT_REQUIRED',
      'Pass an explicit absolute CV Show private root; worktree TMP is not a durable default.',
    );
  }
  return path.resolve(value);
}

function portablePath(value, field) {
  let source = String(value || '');
  if (
    !source
    || source.includes('\\')
    || path.posix.isAbsolute(source)
    || path.posix.normalize(source) !== source
    || source.split('/').some((part) => part === '.' || part === '..')
  ) {
    fail('CV_SHOW_AUDIO_WORKFLOW_PATH_INVALID', `${field} is not a portable relative path`);
  }
  return source;
}

function artifactDescriptor(relative, bytes) {
  return Object.freeze({
    path: portablePath(relative, 'artifact path'),
    sha256: sha256(bytes),
    size: bytes.byteLength,
  });
}

function mediaInput(provenance, entry) {
  return {
    entryId: entry.entryId,
    narrationInputHash: entry.narrationInputHash,
    synthesisInputHash: entry.synthesisInputHash,
    voiceIdentityHash: provenance.voiceIdentityHash,
    synthesisPolicyHash: provenance.synthesisPolicyHash,
    asrProfileHash: provenance.asrProfileHash,
    alignerContractHash: provenance.alignerContractHash,
  };
}

function createEntryRelease({ provenance, entry, wav, recognition, alignment, verification }) {
  let projection = {
    schemaVersion: ENTRY_RELEASE_SCHEMA,
    entryId: entry.entryId,
    mediaInput: mediaInput(provenance, entry),
    wav,
    recognition,
    alignment,
    verification,
  };
  return freezeDeep({
    ...projection,
    entryReleaseId: contentId(ENTRY_RELEASE_SCHEMA, projection),
  });
}

function releasePlanId(plan) {
  return contentId(RELEASE_PLAN_SCHEMA, plan);
}

function orderedEntry(project, entryId) {
  let timeline = createPresentationAuthoringTimelineProjection(project);
  let index = timeline.turns.findIndex(({ id }) => id === entryId);
  if (index < 0) fail('CV_SHOW_AUDIO_WORKFLOW_ENTRY_UNKNOWN', `Unknown CV Show entry ${entryId}`);
  let kind = index < 16 ? 'short' : 'detail';
  return { index: index + 1, kind, order: kind === 'short' ? index + 1 : index - 15 };
}

function runnerPlan({ project, entryId, voice, readinessProfile }) {
  let timeline = createPresentationAuthoringTimelineProjection(
    createCvShowEntryProject(project, entryId),
  );
  let voiceRef = voice.voiceRef || voice.selectionId || voice.id;
  let speakerId = voice.speakerId || voiceRef;
  let selectionId = voice.selectionId || voice.id;
  if (
    typeof selectionId !== 'string'
    || !selectionId
    || typeof voiceRef !== 'string'
    || !voiceRef
    || typeof voice.style !== 'string'
  ) {
    fail(
      'CV_SHOW_AUDIO_WORKFLOW_PROFILE_INVALID',
      'voice.selectionId (or id), voice.voiceRef (or selectionId), and voice.style are required for synthesis.',
    );
  }
  return {
    entryId,
    timeline,
    synthesisItem: {
      id: entryId,
      text: timeline.turns[0].text,
      language: timeline.locale,
      voiceRef,
      style: voice.style,
    },
    locale: timeline.locale,
    voice: { mode: 'single', speakerId },
    readinessProfile: clone(readinessProfile),
    // Cue timing is audited against the final all-30 aligned projection. The entry
    // runner's gate here is exact media coverage, not a second cue-token contract.
    requiredAnchors: [],
  };
}

/**
 * Bind one exact verified 30-entry audio/alignment projection back into its Project.
 * Audio generation is intentionally separate from authoring; source promotion only accepts the
 * completed Project whose media bindings name the verified artifacts and current narration cells.
 */
export function createCvShowAudioBoundProject({
  project,
  audioManifest,
  alignmentManifest,
  sequences,
} = {}) {
  let current;
  try {
    current = createPresentationAuthoringProject(record(project, 'project'));
  } catch (error) {
    fail(
      'CV_SHOW_AUDIO_WORKFLOW_PROJECT_INVALID',
      'The Project cannot be normalized before media binding.',
      { causeCode: error?.code || 'UNKNOWN' },
    );
  }
  let audioClips = record(audioManifest, 'audioManifest').clips;
  let alignmentClips = record(alignmentManifest, 'alignmentManifest').clips;
  let entryIds = current.cells
    .filter(({ kind }) => kind === 'narration')
    .map(({ turnId }) => turnId);
  let narrationByEntryId = new Map(current.cells
    .filter(({ kind }) => kind === 'narration')
    .map(({ turnId, turn }) => [turnId, turn.text]));
  if (
    !Array.isArray(audioClips)
    || !Array.isArray(alignmentClips)
    || entryIds.length !== 30
    || audioClips.length !== 30
    || alignmentClips.length !== 30
    || entryIds.some((entryId, index) => (
      audioClips[index]?.id !== entryId || alignmentClips[index]?.id !== entryId
    ))
  ) {
    fail(
      'CV_SHOW_AUDIO_WORKFLOW_MEDIA_BINDING_INVALID',
      'Verified audio/alignment manifests must contain the exact 30 Project entries in order.',
    );
  }
  if (current.schemaVersion === 'workspace-presentation-authoring-project-v2') {
    let sequenceIds = sequences instanceof Map
      ? [...sequences.keys()]
      : sequences && typeof sequences === 'object' && !Array.isArray(sequences)
        ? Object.keys(sequences)
        : [];
    if (
      sequenceIds.length !== entryIds.length
      || sequenceIds.some((entryId) => !narrationByEntryId.has(entryId))
    ) {
      fail(
        'CV_SHOW_AUDIO_WORKFLOW_MEDIA_BINDING_INVALID',
        'A v2 Project requires the exact complete 30-entry aligned-sequence set.',
      );
    }
  }
  let narrationHashes = new Map(createPresentationAuthoringProjectHashes(current).cellHashes
    .map(({ cellId, hash }) => [cellId, hash]));
  let input = presentationAuthoringProjectCanonicalProjection(current);
  let entries = input.script?.metadata?.cvShow?.entries;
  for (let [index, entryId] of entryIds.entries()) {
    let audio = audioClips[index];
    let alignment = alignmentClips[index];
    let narration = narrationByEntryId.get(entryId);
    let sourceNarrationCellHash = narrationHashes.get(`cv-show:narration:${entryId}`);
    if (
      !entries?.[entryId]
      || typeof audio.speech !== 'string'
      || audio.speech !== narration
      || audio.speechSha256 !== sha256(Buffer.from(audio.speech, 'utf8'))
      || !/^[a-f0-9]{64}$/u.test(String(audio.sha256 || ''))
      || !Number.isInteger(alignment.mediaDurationMs)
      || alignment.mediaDurationMs <= 0
      || !String(alignment.alignedSequenceHash || '')
        .startsWith('workspace-aligned-sequence-v3:')
      || !/^[a-f0-9]{64}$/u.test(String(alignment.alignedSequenceSha256 || ''))
      || !String(alignment.timelineHash || '').startsWith('presentation-timeline-v3:')
      || typeof sourceNarrationCellHash !== 'string'
    ) {
      fail(
        'CV_SHOW_AUDIO_WORKFLOW_MEDIA_BINDING_INVALID',
        `Verified media evidence for ${entryId} is incomplete.`,
        { entryId },
      );
    }
    entries[entryId].media = {
      durationMilliseconds: alignment.mediaDurationMs,
      sourceAlignedSequenceHash: alignment.alignedSequenceHash,
      sourceAlignmentFileHash: `sha256:${alignment.alignedSequenceSha256}`,
      sourceNarrationCellHash,
      sourceTimelineHash: alignment.timelineHash,
      wavHash: `sha256:${audio.sha256}`,
    };
  }
  let bound = createPresentationAuthoringProject(input);
  if (current.schemaVersion === 'workspace-presentation-authoring-project-v2') {
    bound = createCvShowAudioClipProject({
      project: bound,
      audioManifest,
      alignmentManifest,
      sequences,
    });
  }
  let registry = createCvShowMediaBindingRegistry(bound);
  let incomplete = Object.keys(registry.entries).length !== 30
    || Object.values(registry.entries).some(({ status, playable }) => (
      status !== 'accepted' || playable !== true
    ));
  if (
    incomplete
  ) {
    fail(
      'CV_SHOW_AUDIO_WORKFLOW_MEDIA_BINDING_INVALID',
      'The completed Project does not expose 30 accepted playable media bindings.',
    );
  }
  return bound;
}

/**
 * Build the canonical aggregate plan from the current Project and predecessor media.
 */
export function createCvShowAudioWorkflowPlan({
  project,
  predecessorRelease,
  predecessorEntryReleases,
  voice,
  synthesisPolicy,
  asr,
  aligner,
  readinessProfile,
  sourceSha256,
  dependants = {},
  refreshArtifacts = false,
} = {}) {
  record(project, 'project');
  record(predecessorRelease, 'predecessorRelease');
  record(voice, 'voice');
  record(synthesisPolicy, 'synthesisPolicy');
  record(asr, 'asr');
  record(aligner, 'aligner');
  record(readinessProfile, 'readinessProfile');
  if (!Array.isArray(predecessorEntryReleases) || predecessorEntryReleases.length !== 30) {
    fail(
      'CV_SHOW_AUDIO_WORKFLOW_PREDECESSOR_INVALID',
      'The workflow requires all 30 ordered predecessor entry releases.',
    );
  }
  if (typeof sourceSha256 !== 'string' || !/^sha256:[a-f0-9]{64}$/u.test(sourceSha256)) {
    fail('CV_SHOW_AUDIO_WORKFLOW_SOURCE_INVALID', 'sourceSha256 must bind the current source bytes.');
  }
  if (typeof refreshArtifacts !== 'boolean') {
    fail(
      'CV_SHOW_AUDIO_WORKFLOW_INVALID',
      'refreshArtifacts must be an explicit boolean.',
    );
  }
  let dirtyPlan = planCvShowAudioDirtySet({
    accepted: predecessorRelease.acceptedProvenance,
    project,
    voice,
    synthesisPolicy,
    asr,
    aligner,
    dependants,
  });
  let regenerate = new Set([
    ...dirtyPlan.dirty.synthesis,
    ...dirtyPlan.dirty.transcription,
    ...dirtyPlan.dirty.alignment,
  ]);
  let predecessorById = new Map(predecessorEntryReleases.map((release) => [
    release.entryId,
    release,
  ]));
  let entries = dirtyPlan.current.entries.map((entry, index) => {
    let predecessor = predecessorById.get(entry.entryId);
    if (
      !predecessor
      || predecessor.entryReleaseId !== predecessorRelease.entryReleaseIds[index]
    ) {
      fail(
        'CV_SHOW_AUDIO_WORKFLOW_PREDECESSOR_INVALID',
        `Predecessor entry ${entry.entryId} is missing, reordered, or stale.`,
      );
    }
    return regenerate.has(entry.entryId)
      ? {
          entryId: entry.entryId,
          mode: 'regenerate',
          runnerPlan: runnerPlan({ project, entryId: entry.entryId, voice, readinessProfile }),
        }
      : { entryId: entry.entryId, mode: 'reuse', release: predecessor };
  });
  let plan = {
    schemaVersion: RELEASE_PLAN_SCHEMA,
    project: {
      revision: project.revision,
      authoringProjectHash: project.hash,
      input: presentationAuthoringProjectCanonicalProjection(project),
    },
    provenance: dirtyPlan.current,
    predecessor: {
      release: predecessorRelease,
      projectBase: {
        revision: predecessorRelease.project.revision,
        authoringProjectHash: predecessorRelease.project.authoringProjectHash,
        sourceSha256,
      },
    },
    entries,
    ...(refreshArtifacts ? { refreshArtifacts: true } : {}),
  };
  return freezeDeep({
    schemaVersion: WORKFLOW_SCHEMA,
    plan,
    planId: releasePlanId(plan),
    dirty: dirtyPlan.dirty,
    dispositions: entries.map(({ entryId, mode }) => ({ entryId, mode })),
  });
}

async function readJson(filePath, label) {
  try {
    return JSON.parse(await fs.readFile(filePath, 'utf8'));
  } catch (error) {
    fail(
      'CV_SHOW_AUDIO_WORKFLOW_PRIVATE_PAYLOAD_INVALID',
      `${label} cannot be read from ${filePath}.`,
      { causeCode: error?.code || 'UNKNOWN' },
    );
  }
}

/**
 * Reconstruct exact canonical entry releases from a verified 92-file predecessor tree.
 */
export async function loadCvShowPredecessorEntryReleases({
  privateRoot,
  release,
  project,
  verifyPrivateArtifacts = verifyCvShowPrivateArtifacts,
} = {}) {
  let base = absoluteRoot(privateRoot);
  let payloadRoot = path.join(base, release.manifests.voice, release.manifests.directory);
  try {
    await verifyPrivateArtifacts({ root: payloadRoot, release, project });
  } catch (error) {
    if (error?.code === 'CV_SHOW_PRIVATE_ARTIFACTS_MISSING') {
      fail(
        'CV_SHOW_AUDIO_WORKFLOW_PREDECESSOR_MISSING',
        `The predecessor payload is absent at ${payloadRoot}. Restore that content-addressed tree before resuming; the workflow will not silently regenerate it.`,
        { payloadRoot, causeCode: error.code },
      );
    }
    throw error;
  }
  let audioManifest = await readJson(
    path.join(payloadRoot, release.manifests.audio.path),
    'audio manifest',
  );
  let alignmentManifest = await readJson(
    path.join(payloadRoot, release.manifests.alignment.path),
    'alignment manifest',
  );
  let alignmentDirectory = path.posix.dirname(release.manifests.alignment.path);
  let provenance = release.acceptedProvenance;
  let releases = [];
  for (let index = 0; index < 30; index += 1) {
    let entry = provenance.entries[index];
    let audio = audioManifest.clips[index];
    let alignment = alignmentManifest.clips[index];
    let paths = {
      wav: portablePath(audio.file, `WAV ${index + 1}`),
      recognition: path.posix.join(
        alignmentDirectory,
        portablePath(alignment.recognitionFile, `recognition ${index + 1}`),
      ),
      alignment: path.posix.join(
        alignmentDirectory,
        portablePath(alignment.alignedSequenceFile, `alignment ${index + 1}`),
      ),
    };
    let descriptors = {};
    for (let [kind, relative] of Object.entries(paths)) {
      let bytes = await fs.readFile(path.join(payloadRoot, relative));
      descriptors[kind] = artifactDescriptor(relative, bytes);
    }
    let entryRelease = createEntryRelease({
      provenance,
      entry,
      ...descriptors,
      verification: {
        timingCoverage: alignment.metrics.timingCoverage,
        alignedSequenceHash: alignment.alignedSequenceHash,
        timelineHash: alignment.timelineHash,
      },
    });
    if (entryRelease.entryReleaseId !== release.entryReleaseIds[index]) {
      fail(
        'CV_SHOW_AUDIO_WORKFLOW_PREDECESSOR_INVALID',
        `Predecessor entry release ${entry.entryId} does not match the selected release.`,
      );
    }
    releases.push(entryRelease);
  }
  return freezeDeep(releases);
}

function storyIdentity(project) {
  let contract = projectCvShowStory(project);
  return {
    version: contract.version,
    contractRevision: contract.contractRevision,
    narrationLocale: contract.narrationLocale,
    shortCount: contract.short.length,
    detailCount: Object.keys(contract.branches).length,
  };
}

function jsonBytes(value) {
  return Buffer.from(`${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

function releaseAlignedSequence(sequence) {
  let source = record(sequence, 'aligned sequence');
  let contractVersion = source.contractVersion;
  let hash = String(source.hash || '');
  if (contractVersion !== 'workspace-aligned-sequence-v3' || !hash) {
    fail(
      'CV_SHOW_AUDIO_WORKFLOW_MEDIA_BINDING_INVALID',
      'Generated aligned sequence identity is incomplete.',
    );
  }
  let projection = clone(source);
  delete projection.hash;
  let expectedHash = computeIntegrity(projection);
  let observedHash = hash.startsWith(`${contractVersion}:`)
    ? hash.slice(contractVersion.length + 1)
    : hash;
  if (observedHash !== expectedHash) {
    fail(
      'CV_SHOW_AUDIO_WORKFLOW_MEDIA_BINDING_INVALID',
      'Generated aligned sequence hash does not match its canonical content.',
    );
  }
  let releaseHash = `${contractVersion}:${expectedHash}`;
  return { ...clone(source), hash: releaseHash };
}

function generatedFileNames(project, entryId, speechHash, alignmentDirectory) {
  let { index, kind } = orderedEntry(project, entryId);
  let orderedName = `${String(index).padStart(2, '0')}-${kind}-${entryId}`;
  return {
    wav: `${orderedName}-${speechHash.slice(0, 12)}.wav`,
    recognition: path.posix.join(alignmentDirectory, 'recognized', `${orderedName}.json`),
    alignment: path.posix.join(alignmentDirectory, 'aligned', `${orderedName}.json`),
    orderedName,
  };
}

function recognitionDocument({ state, project, profile, wavPath, story }) {
  let { index, kind, order } = orderedEntry(project, state.plan.entryId);
  let speech = state.plan.timeline.turns[0].text;
  let words = state.transcript.words.map(({ word, startSec, endSec }) => ({
    text: word,
    startSec,
    endSec,
  }));
  return {
    version: 'cv-show-whisper-recognition-v1',
    source: {
      index,
      kind,
      order,
      id: state.plan.entryId,
      speech,
      speechSha256: sha256(speech),
      audioFile: wavPath,
      audioSha256: state.synthesis.wavHash,
      audioDurationSec: state.synthesis.durationSec,
      sampleRate: state.synthesis.sampleRate,
      storyVersion: story.version,
      storyContractRevision: story.contractRevision,
    },
    provider: {
      runtime: 'cv-show-model-service-client',
      endpoint: '/transcribe',
      model: profile.asr.model,
      locale: state.plan.locale,
    },
    recognized: {
      text: state.transcript.text,
      words,
      durationSec: state.transcript.durationSec,
      language: state.plan.locale,
      model: profile.asr.model,
      segments: [],
      raw: { text: state.transcript.text, words },
    },
  };
}

function alignmentMetrics(metrics) {
  return {
    authoredTokenCount: metrics.authoredTokenCount,
    recognizedTokenCount: metrics.recognizedTokenCount,
    timedTokenCount: metrics.timedTokenCount,
    editDistance: metrics.editDistance,
    wordErrorRate: metrics.wer,
    editSimilarity: metrics.editSimilarity,
    timingCoverage: metrics.timingCoverage,
    exactCorrespondence: metrics.exactCorrespondence,
    observedWordsMatch: metrics.exactCorrespondence,
    observedWordsReason: metrics.exactCorrespondence ? 'exact' : 'edit-distance',
  };
}

async function writeCache(cacheRoot, relative, bytes) {
  let target = path.join(cacheRoot, portablePath(relative, 'generated artifact'));
  await fs.mkdir(path.dirname(target), { recursive: true, mode: 0o700 });
  try {
    await fs.writeFile(target, bytes, { flag: 'wx', mode: 0o600 });
  } catch (error) {
    if (error?.code !== 'EEXIST') throw error;
    let existing = await fs.readFile(target);
    if (!existing.equals(bytes)) {
      fail(
        'CV_SHOW_AUDIO_WORKFLOW_CACHE_CONFLICT',
        `Generated artifact cache conflict at ${target}.`,
      );
    }
  }
  return artifactDescriptor(relative, bytes);
}

function validateAcceptedPublicProof(acceptedPublic) {
  if (!acceptedPublic) {
    fail(
      'CV_SHOW_AUDIO_WORKFLOW_PUBLIC_REUSE_PROOF_UNAVAILABLE',
      'The accepted public selector/manifest proof is unavailable. Restore it or pass absolute --public-selector and --public-manifest paths; publication will not guess whether transcoding is necessary.',
    );
  }
  let source = record(acceptedPublic, 'acceptedPublic');
  let selector = record(source.selector, 'acceptedPublic.selector');
  let manifest = record(source.manifest, 'acceptedPublic.manifest');
  if (!(source.manifestBytes instanceof Uint8Array)) {
    fail(
      'CV_SHOW_AUDIO_WORKFLOW_PUBLIC_REUSE_PROOF_INVALID',
      'The accepted public proof must include the exact manifest bytes.',
    );
  }
  let bytes = Buffer.from(source.manifestBytes);
  let parsed;
  try {
    parsed = JSON.parse(bytes.toString('utf8'));
  } catch {
    fail(
      'CV_SHOW_AUDIO_WORKFLOW_PUBLIC_REUSE_PROOF_INVALID',
      'The accepted public manifest bytes are not valid JSON.',
    );
  }
  let manifestPath = portablePath(selector.manifest?.path, 'accepted public manifest');
  if (
    selector.schemaVersion !== 'cv-show-web-audio-selector-v1'
    || manifest.schemaVersion !== 'cv-show-web-audio-release-v1'
    || canonicalize(parsed) !== canonicalize(manifest)
    || selector.manifest.sha256 !== sha256(bytes)
    || selector.manifest.bytes !== bytes.byteLength
    || selector.releaseId !== manifest.releaseId
    || selector.sourceMasterReleaseId !== manifest.source?.masterReleaseId
    || selector.voiceId !== manifest.voiceId
    || selector.locale !== manifest.locale
    || selector.revision !== manifest.revision
  ) {
    fail(
      'CV_SHOW_AUDIO_WORKFLOW_PUBLIC_REUSE_PROOF_INVALID',
      'The accepted public selector and exact manifest bytes are divergent.',
      { manifestPath },
    );
  }
  return { selector, manifest, manifestBytes: bytes, manifestPath };
}

/**
 * Reuse one accepted artifact-equivalent public projection or invoke the locked publisher.
 */
export async function publishCvShowAudioWorkflowRelease({
  privateRoot,
  repoRoot = REPOSITORY_ROOT,
  release,
  project,
  acceptedPublic,
  publisher = publishCvShowWebAudio,
  verifyMasterCompatibility = verifyCvShowWebAudioMasterCompatibility,
} = {}) {
  let base = absoluteRoot(privateRoot);
  record(release, 'release');
  record(project, 'project');
  if (typeof publisher !== 'function' || typeof verifyMasterCompatibility !== 'function') {
    fail(
      'CV_SHOW_AUDIO_WORKFLOW_PUBLICATION_CONFIG_INVALID',
      'The CV Show publication adapters are invalid.',
    );
  }
  let proof = validateAcceptedPublicProof(acceptedPublic);
  let compatible = false;
  try {
    compatible = verifyMasterCompatibility({
      selector: proof.selector,
      manifest: proof.manifest,
      release,
    }) === true;
  } catch {
    compatible = false;
  }
  if (!compatible) {
    return publisher({
      repoRoot: path.resolve(repoRoot),
      privateRoot: path.join(base, release.manifests.voice, release.manifests.directory),
      release,
      project,
    });
  }
  let projection = {
    schemaVersion: WEB_REUSE_RECEIPT_SCHEMA,
    status: 'reused',
    masterReleaseId: release.releaseId,
    masterArtifactTreeHash: release.artifactTreeHash,
    audioManifestSha256: release.manifests.audio.sha256,
    alignmentManifestSha256: release.manifests.alignment.sha256,
    voiceIdentityHash: release.acceptedProvenance.voiceIdentityHash,
    publicReleaseId: proof.selector.releaseId,
    publicRevision: proof.selector.revision,
    publicManifestSha256: proof.selector.manifest.sha256,
  };
  let receiptId = contentId(WEB_REUSE_RECEIPT_SCHEMA, projection);
  let receiptValue = freezeDeep({ ...projection, receiptId });
  let receiptDigest = receiptId.split(':').at(-1);
  let receiptRoot = path.join(base, '.workflow', 'publication-receipts');
  let artifact = await writeCache(receiptRoot, `${receiptDigest}.json`, jsonBytes(receiptValue));
  return freezeDeep({
    ...receiptValue,
    receipt: {
      path: path.join(receiptRoot, artifact.path),
      sha256: artifact.sha256,
      size: artifact.size,
    },
  });
}

async function loadRunnerState(storage, runnerPlanInput) {
  let run = storage.openRun(runnerPlanInput);
  let head = await run.readHead();
  if (!head) {
    fail(
      'CV_SHOW_AUDIO_WORKFLOW_ENTRY_NOT_INITIALIZED',
      `Entry ${runnerPlanInput.entryId} has no durable runner state.`,
    );
  }
  if (head.state.phase !== 'entry-verified') {
    fail(
      'CV_SHOW_AUDIO_WORKFLOW_ENTRY_NOT_VERIFIED',
      `Entry ${runnerPlanInput.entryId} is ${head.state.phase}; finish exact-WAV review, Whisper, alignment, and verification first.`,
      { entryId: runnerPlanInput.entryId, phase: head.state.phase },
    );
  }
  return { run, state: head.state, stateHash: head.stateHash };
}

/**
 * Production bridge from durable entry-runner state to aggregate/promotion callbacks.
 */
export function createCvShowAudioWorkflowAdapters({
  privateRoot,
  storage,
  workflow,
  project,
  profile,
} = {}) {
  let base = absoluteRoot(privateRoot);
  record(storage, 'storage');
  record(workflow, 'workflow');
  record(profile, 'profile');
  let plan = workflow.plan;
  let planDigest = workflow.planId.split(':').at(-1);
  let predecessor = plan.predecessor.release;
  let regenerated = plan.entries.filter(({ mode }) => mode === 'regenerate');
  let predecessorAlignmentDirectory = path.posix.dirname(predecessor.manifests.alignment.path);
  let alignmentDirectory = regenerated.length === 30
    ? `alignment/${profile.asr.model}/${planDigest.slice(0, 16)}`
    : predecessorAlignmentDirectory;
  let cacheRoot = path.join(base, '.workflow', 'generated', planDigest);
  let materialized = null;

  let ensureMaterialized = async (canonicalEntries = null) => {
    if (materialized) return materialized;
    let predecessorRoot = path.join(
      base,
      predecessor.manifests.voice,
      predecessor.manifests.directory,
    );
    let predecessorAudio = await readJson(
      path.join(predecessorRoot, predecessor.manifests.audio.path),
      'predecessor audio manifest',
    );
    let predecessorAlignment = await readJson(
      path.join(predecessorRoot, predecessor.manifests.alignment.path),
      'predecessor alignment manifest',
    );
    let story = storyIdentity(project);
    let audioClips = clone(predecessorAudio.clips);
    let alignmentClips = clone(predecessorAlignment.clips);
    let entryReleases = new Map();

    for (let disposition of regenerated) {
      let { run, state, stateHash } = await loadRunnerState(storage, disposition.runnerPlan);
      let speech = disposition.runnerPlan.timeline.turns[0].text;
      let speechHash = sha256(speech);
      let names = generatedFileNames(project, disposition.entryId, speechHash, alignmentDirectory);
      let wavBytes = await run.readArtifact(state.synthesis.wavHash);
      let recognition = recognitionDocument({
        state,
        project,
        profile,
        wavPath: names.wav,
        story,
      });
      let alignedSequence = releaseAlignedSequence(state.alignment.sequence);
      let recognitionBytes = jsonBytes(recognition);
      let alignmentBytes = jsonBytes(alignedSequence);
      let wav = await writeCache(cacheRoot, names.wav, wavBytes);
      let recognitionArtifact = await writeCache(cacheRoot, names.recognition, recognitionBytes);
      let alignmentArtifact = await writeCache(cacheRoot, names.alignment, alignmentBytes);
      let index = orderedEntry(project, disposition.entryId).index - 1;
      let ordering = orderedEntry(project, disposition.entryId);
      let receiptBytes = Buffer.from(canonicalize(state.synthesis.receipt), 'utf8');
      audioClips[index] = {
        index: ordering.index,
        kind: ordering.kind,
        order: ordering.order,
        id: disposition.entryId,
        speech,
        speechSha256: speechHash,
        file: names.wav,
        bytes: wav.size,
        sha256: wav.sha256,
        durationSec: state.synthesis.durationSec,
        sampleRate: state.synthesis.sampleRate,
        receiptFile: `receipts/${path.posix.basename(names.wav)}.receipt.json`,
        receiptSha256: sha256(receiptBytes),
      };
      let metrics = alignmentMetrics(state.alignment.metrics);
      alignmentClips[index] = {
        index: ordering.index,
        kind: ordering.kind,
        order: ordering.order,
        id: disposition.entryId,
        sourceAudioSha256: wav.sha256,
        recognitionFile: path.posix.relative(alignmentDirectory, names.recognition),
        recognitionSha256: recognitionArtifact.sha256,
        alignedSequenceFile: path.posix.relative(alignmentDirectory, names.alignment),
        alignedSequenceSha256: alignmentArtifact.sha256,
        alignedSequenceHash: alignedSequence.hash,
        timelineHash: alignedSequence.timelineHash,
        mediaDurationMs: Math.round(state.synthesis.durationSec * 1_000),
        recognizedWordCount: state.transcript.words.length,
        recognizedSegmentCount: 0,
        confidenceAvailable: false,
        metrics,
        anchoring: state.alignment.anchorings[0],
      };
      let provenanceEntry = plan.provenance.entries[index];
      let release = createEntryRelease({
        provenance: plan.provenance,
        entry: provenanceEntry,
        wav,
        recognition: recognitionArtifact,
        alignment: alignmentArtifact,
        verification: {
          timingCoverage: 1,
          alignedSequenceHash: alignedSequence.hash,
          timelineHash: alignedSequence.timelineHash,
        },
      });
      entryReleases.set(disposition.entryId, {
        state,
        stateHash,
        entryRelease: release,
      });
    }

    let audioInputProjection = {
      project: project.hash,
      voice: profile.voice,
      synthesisPolicy: profile.synthesisPolicy,
      clips: audioClips.map(({ id, speechSha256, sha256: audioSha256 }) => ({
        id,
        speechSha256,
        audioSha256,
      })),
    };
    let audioInputDigest = sha256(Buffer.from(canonicalize(audioInputProjection), 'utf8'));
    let audioManifest = {
      ...predecessorAudio,
      version: 'cv-show-local-audio-manifest-v1',
      locale: plan.entries[0].runnerPlan?.locale || predecessor.manifests.locale,
      inputHash: `sha256:${audioInputDigest}`,
      audioRevision: audioInputDigest.slice(0, 16),
      story,
      voiceSelection: {
        ...clone(profile.voice),
        id: profile.voice.selectionId || profile.voice.id,
        voiceRef: profile.voice.voiceRef || profile.voice.selectionId || profile.voice.id,
        format: profile.synthesisPolicy.format,
        normalize: profile.synthesisPolicy.normalize,
      },
      textArtifact: {
        file: 'authoring-project:narration',
        sha256: sha256(Buffer.from(canonicalize(story), 'utf8')),
        diffFile: 'authoring-project:dirty-plan',
        diffSha256: sha256(Buffer.from(canonicalize(workflow.dirty), 'utf8')),
      },
      normalization: clone(profile.synthesisPolicy.normalization),
      counts: clone(COUNTS),
      aggregateArtifactSha256: sha256(Buffer.from(canonicalize(
        audioClips.map(({ sha256: clipSha256 }) => clipSha256),
      ), 'utf8')),
      totalDurationSec: Number(audioClips.reduce((sum, clip) => sum + clip.durationSec, 0).toFixed(6)),
      totalAudioBytes: audioClips.reduce((sum, clip) => sum + clip.bytes, 0),
      clips: audioClips,
    };
    let audioManifestBytes = jsonBytes(audioManifest);
    let audioManifestArtifact = await writeCache(
      cacheRoot,
      predecessor.manifests.audio.path,
      audioManifestBytes,
    );
    let aggregateMetrics = alignmentClips.reduce((aggregate, clip) => {
      aggregate.authoredTokens += clip.metrics.authoredTokenCount;
      aggregate.recognizedTokens += clip.metrics.recognizedTokenCount;
      aggregate.timedTokens += clip.metrics.timedTokenCount;
      aggregate.editDistance += clip.metrics.editDistance;
      aggregate.exactCorrespondenceClips += clip.metrics.exactCorrespondence ? 1 : 0;
      aggregate.confidenceAvailableClips += clip.confidenceAvailable ? 1 : 0;
      return aggregate;
    }, {
      authoredTokens: 0,
      recognizedTokens: 0,
      timedTokens: 0,
      editDistance: 0,
      exactCorrespondenceClips: 0,
      confidenceAvailableClips: 0,
    });
    aggregateMetrics.wordErrorRate = Number((
      aggregateMetrics.editDistance / Math.max(1, aggregateMetrics.authoredTokens)
    ).toFixed(6));
    aggregateMetrics.editSimilarity = Number((1 - (
      aggregateMetrics.editDistance
        / Math.max(1, aggregateMetrics.authoredTokens, aggregateMetrics.recognizedTokens)
    )).toFixed(6));
    aggregateMetrics.timingCoverage = Number((
      aggregateMetrics.timedTokens / Math.max(1, aggregateMetrics.recognizedTokens)
    ).toFixed(6));
    let alignmentInputProjection = {
      audioInputHash: audioManifest.inputHash,
      asr: profile.asr,
      aligner: profile.aligner,
      clips: alignmentClips.map(({ id, recognitionSha256, alignedSequenceSha256 }) => ({
        id,
        recognitionSha256,
        alignedSequenceSha256,
      })),
    };
    let alignmentInputDigest = sha256(Buffer.from(canonicalize(alignmentInputProjection), 'utf8'));
    let alignmentManifest = {
      ...predecessorAlignment,
      version: 'cv-show-whisper-alignment-manifest-v1',
      locale: audioManifest.locale,
      model: profile.asr.model,
      alignedSequenceVersion: profile.aligner.alignedSequenceVersion,
      alignmentInputHash: `sha256:${alignmentInputDigest}`,
      sourceAudioInputHash: audioManifest.inputHash,
      story,
      counts: clone(COUNTS),
      aggregate: aggregateMetrics,
      clips: alignmentClips,
    };
    let alignmentManifestPath = path.posix.join(alignmentDirectory, 'manifest.json');
    let alignmentManifestArtifact = await writeCache(
      cacheRoot,
      alignmentManifestPath,
      jsonBytes(alignmentManifest),
    );
    let mediaManifestProjection = {
      project: project.hash,
      audioManifest: audioManifestArtifact,
      alignmentManifest: alignmentManifestArtifact,
      entries: canonicalEntries?.map(({ entryReleaseId }) => entryReleaseId)
        || plan.entries.map(({ entryId }) => (
          entryReleases.get(entryId)?.entryRelease.entryReleaseId
          || plan.entries.find((entry) => entry.entryId === entryId)?.release?.entryReleaseId
        )),
    };
    let manifestHash = `cv-show-media-manifest-v1:${computeIntegrity(mediaManifestProjection)}`;
    let collectionId = `cv-show:${story.contractRevision}`;
    let mediaCollectionIdentity = {
      schemaVersion: 'workspace-presentation-media-collection-v1',
      collectionId,
      manifestHash,
      identity: `cv-show-authoring-media-collection-v1:${computeIntegrity({
        collectionId,
        manifestHash,
      })}`,
    };
    materialized = Object.freeze({
      entryReleases,
      audioManifestArtifact,
      alignmentManifestArtifact: {
        ...alignmentManifestArtifact,
        model: profile.asr.model,
      },
      mediaCollectionIdentity,
      cacheRoot,
    });
    return materialized;
  };

  let inspectEntry = async (runnerPlanInput) => {
    let result = (await ensureMaterialized()).entryReleases.get(runnerPlanInput.entryId);
    if (!result) {
      fail(
        'CV_SHOW_AUDIO_WORKFLOW_ENTRY_NOT_GENERATED',
        `No regenerated evidence exists for ${runnerPlanInput.entryId}.`,
      );
    }
    return result;
  };
  let inspectReleaseArtifacts = async ({ entries }) => {
    let result = await ensureMaterialized(entries);
    return {
      mediaCollectionIdentity: result.mediaCollectionIdentity,
      manifests: {
        locale: plan.entries[0].runnerPlan?.locale || predecessor.manifests.locale,
        voice: profile.voice.selectionId || profile.voice.id,
        audio: result.audioManifestArtifact,
        alignment: result.alignmentManifestArtifact,
      },
    };
  };
  let readGeneratedArtifact = async ({ aggregate, path: relative }) => {
    await ensureMaterialized(aggregate?.entries || null);
    return fs.readFile(path.join(cacheRoot, portablePath(relative, 'generated artifact')));
  };
  return Object.freeze({
    ensureMaterialized,
    inspectEntry,
    inspectReleaseArtifacts,
    readGeneratedArtifact,
    cacheRoot,
  });
}

/** Compose the existing durable runner, aggregate pipeline, and promotion gates. */
export async function createCvShowAudioWorkflow({
  privateRoot,
  repoRoot = REPOSITORY_ROOT,
  project,
  predecessorRelease,
  profile,
  sourceSha256,
  modelClient,
  storage,
  publisher = publishCvShowWebAudio,
  verifyMasterCompatibility = verifyCvShowWebAudioMasterCompatibility,
  refreshArtifacts = false,
} = {}) {
  let base = absoluteRoot(privateRoot);
  record(profile, 'profile');
  let predecessorEntryReleases = await loadCvShowPredecessorEntryReleases({
    privateRoot: base,
    release: predecessorRelease,
    project: predecessorRelease.project.authoringProjectHash === project.hash
      ? project
      : { revision: predecessorRelease.project.revision, hash: predecessorRelease.project.authoringProjectHash },
  });
  let workflow = createCvShowAudioWorkflowPlan({
    project,
    predecessorRelease,
    predecessorEntryReleases,
    ...profile,
    sourceSha256,
    refreshArtifacts,
  });
  let durableStorage = storage || createCvShowAudioPipelineStorage({
    storageRoot: path.join(base, '.workflow', 'pipeline'),
  });
  let runner = modelClient
    ? createCvShowAudioPipelineRunner({ storage: durableStorage, modelClient })
    : null;
  let adapters = createCvShowAudioWorkflowAdapters({
    privateRoot: base,
    storage: durableStorage,
    workflow,
    project,
    profile,
  });
  let promotion = createCvShowAudioPromotion({
    repoRoot: path.resolve(repoRoot),
    privateRoot: base,
    sourceStorageRoot: path.join(base, '.workflow', 'authoring'),
    readGeneratedArtifact: adapters.readGeneratedArtifact,
  });
  let aggregate = createCvShowAudioReleasePipeline({
    storage: durableStorage,
    inspectEntry: adapters.inspectEntry,
    inspectReleaseArtifacts: adapters.inspectReleaseArtifacts,
    stageRelease: promotion.stageRelease,
    promoteRelease: promotion.promoteRelease,
  }).openRelease(workflow.plan);
  let aggregateRun = durableStorage.openRun({
    schemaVersion: RELEASE_PLAN_SCHEMA,
    planId: workflow.planId,
  });

  let entryStatus = (disposition, run, state) => freezeDeep({
    entryId: disposition.entryId,
    phase: state?.phase || 'not-initialized',
    ...(state?.failure ? { failure: state.failure } : {}),
    ...(state?.synthesis ? {
      exactWav: {
        path: path.join(run.runDirectory, 'artifacts', `${state.synthesis.wavHash}.bin`),
        sha256: state.synthesis.wavHash,
        synthesisAttemptHash: state.synthesis.attemptHash,
      },
    } : {}),
  });

  let advanceEntries = async (ownerToken) => {
    if (!runner) {
      fail(
        'CV_SHOW_AUDIO_WORKFLOW_MODEL_CLIENT_REQUIRED',
        'A model client is required to advance entries. Pass --endpoint or set CV_SHOW_MODEL_ENDPOINT.',
      );
    }
    let states = [];
    for (let disposition of workflow.plan.entries) {
      if (disposition.mode === 'reuse') continue;
      let entry = runner.openEntry(disposition.runnerPlan);
      let state = await entry.initialize();
      while (!TERMINAL_ENTRY_PHASES.has(state.phase) && state.phase !== 'technical-verified') {
        state = await entry.advance(ownerToken);
      }
      states.push(entryStatus(
        disposition,
        durableStorage.openRun(disposition.runnerPlan),
        state,
      ));
    }
    return freezeDeep(states);
  };
  let reviewClip = async (input) => {
    if (!runner) {
      fail(
        'CV_SHOW_AUDIO_WORKFLOW_MODEL_CLIENT_REQUIRED',
        'A model client is required to review entries. Pass --endpoint or set CV_SHOW_MODEL_ENDPOINT.',
      );
    }
    let disposition = workflow.plan.entries.find(({ entryId }) => entryId === input.entryId);
    if (!disposition || disposition.mode !== 'regenerate') {
      fail('CV_SHOW_AUDIO_WORKFLOW_ENTRY_UNKNOWN', `No regenerated entry ${input.entryId}.`);
    }
    return runner.openEntry(disposition.runnerPlan).reviewClip({
      ownerToken: input.ownerToken,
      approved: input.approved,
      wavHash: input.wavHash,
      synthesisAttemptHash: input.synthesisAttemptHash,
    });
  };
  let retryEntryVerification = async (input) => {
    if (!runner) {
      fail(
        'CV_SHOW_AUDIO_WORKFLOW_MODEL_CLIENT_REQUIRED',
        'A model client is required to retry entry verification. Pass --endpoint or set CV_SHOW_MODEL_ENDPOINT.',
      );
    }
    let disposition = workflow.plan.entries.find(({ entryId }) => entryId === input.entryId);
    if (!disposition || disposition.mode !== 'regenerate') {
      fail('CV_SHOW_AUDIO_WORKFLOW_ENTRY_UNKNOWN', `No regenerated entry ${input.entryId}.`);
    }
    return runner.openEntry(disposition.runnerPlan).retryVerification(input.ownerToken);
  };
  let retryEntrySynthesis = async (input) => {
    if (!runner) {
      fail(
        'CV_SHOW_AUDIO_WORKFLOW_MODEL_CLIENT_REQUIRED',
        'A model client is required to retry entry synthesis. Pass --endpoint or set CV_SHOW_MODEL_ENDPOINT.',
      );
    }
    let disposition = workflow.plan.entries.find(({ entryId }) => entryId === input.entryId);
    if (!disposition || disposition.mode !== 'regenerate') {
      fail('CV_SHOW_AUDIO_WORKFLOW_ENTRY_UNKNOWN', `No regenerated entry ${input.entryId}.`);
    }
    return runner.openEntry(disposition.runnerPlan).retrySynthesis(input.ownerToken);
  };
  let inspectEntries = async () => {
    let states = [];
    for (let disposition of workflow.plan.entries) {
      if (disposition.mode === 'reuse') continue;
      let run = durableStorage.openRun(disposition.runnerPlan);
      let head = await run.readHead();
      states.push(entryStatus(disposition, run, head?.state));
    }
    return freezeDeep(states);
  };
  let inspectVerifiedRelease = async () => {
    let head = await aggregateRun.readHead();
    if (!head?.state.releaseObjectHash) return null;
    return aggregateRun.readObject(head.state.releaseObjectHash);
  };
  let createBoundProject = async () => {
    let release = await inspectVerifiedRelease();
    if (!release) {
      fail(
        'CV_SHOW_AUDIO_WORKFLOW_RELEASE_NOT_VERIFIED',
        'Verify the aggregate release before binding its media into the Project.',
      );
    }
    let releaseRoot = path.join(
      base,
      release.manifests.voice,
      release.manifests.directory,
    );
    let [audioManifest, alignmentManifest] = await Promise.all([
      readJson(
        path.join(releaseRoot, release.manifests.audio.path),
        'staged audio manifest',
      ),
      readJson(
        path.join(releaseRoot, release.manifests.alignment.path),
        'staged alignment manifest',
      ),
    ]);
    let normalizedAlignmentManifest = clone(alignmentManifest);
    let alignmentDirectory = path.posix.dirname(release.manifests.alignment.path);
    let sequences = new Map();
    for (let clip of normalizedAlignmentManifest.clips || []) {
      let sequence = await readJson(
        path.join(
          releaseRoot,
          alignmentDirectory,
          portablePath(clip.alignedSequenceFile, `aligned sequence ${clip.id}`),
        ),
        `staged aligned sequence ${clip.id}`,
      );
      let normalized = releaseAlignedSequence(sequence);
      let bytes = jsonBytes(normalized);
      if (
        clip.alignedSequenceHash !== normalized.hash
        || clip.alignedSequenceSha256 !== sha256(bytes)
      ) {
        fail(
          'CV_SHOW_AUDIO_WORKFLOW_MEDIA_BINDING_INVALID',
          `Staged aligned sequence evidence for ${clip.id} does not match its manifest.`,
          { entryId: clip.id },
        );
      }
      sequences.set(clip.id, normalized);
    }
    return createCvShowAudioBoundProject({
      project,
      audioManifest,
      alignmentManifest: normalizedAlignmentManifest,
      sequences,
    });
  };
  let publishWebAudio = async ({ acceptedPublic } = {}) => {
    if (
      predecessorRelease.project?.revision !== project.revision
      || predecessorRelease.project?.authoringProjectHash !== project.hash
      || predecessorRelease.acceptedProvenance?.hash !== workflow.plan.provenance.hash
    ) {
      fail(
        'CV_SHOW_AUDIO_WORKFLOW_PUBLICATION_MASTER_NOT_SELECTED',
        'The target Project/audio master is not selected yet. Complete exact release approval, staging, and promotion before publication.',
      );
    }
    return publishCvShowAudioWorkflowRelease({
      privateRoot: base,
      repoRoot,
      release: predecessorRelease,
      project,
      acceptedPublic,
      publisher,
      verifyMasterCompatibility,
    });
  };
  return Object.freeze({
    workflow,
    advanceEntries,
    reviewClip,
    retryEntryVerification,
    retryEntrySynthesis,
    inspectEntries,
    inspectVerifiedRelease,
    createBoundProject,
    publishWebAudio,
    aggregate,
    adapters,
  });
}

function parseArgs(argv) {
  let [command = 'status', ...tokens] = argv;
  let options = {};
  for (let index = 0; index < tokens.length; index += 1) {
    let token = tokens[index];
    if (!token.startsWith('--')) fail('CV_SHOW_AUDIO_WORKFLOW_ARGUMENT_INVALID', `Unexpected ${token}`);
    let name = token.slice(2);
    let value = tokens[index + 1];
    if (!value || value.startsWith('--')) options[name] = true;
    else {
      options[name] = value;
      index += 1;
    }
  }
  return { command, options };
}

async function loadProfile(filePath) {
  if (!filePath || !path.isAbsolute(filePath)) {
    fail('CV_SHOW_AUDIO_WORKFLOW_PROFILE_REQUIRED', 'Pass --profile with an absolute JSON path.');
  }
  let profile = await readJson(filePath, 'workflow profile');
  for (let field of ['voice', 'synthesisPolicy', 'asr', 'aligner', 'readinessProfile']) {
    record(profile[field], `profile.${field}`);
  }
  return profile;
}

async function loadTargetProject(filePath, currentProject) {
  if (!filePath) return currentProject;
  if (!path.isAbsolute(filePath)) {
    fail(
      'CV_SHOW_AUDIO_WORKFLOW_PROJECT_REQUIRED',
      'Pass --project with an absolute path to the target canonical Project JSON.',
    );
  }
  let input = await readJson(filePath, 'target canonical Project');
  try {
    return createPresentationAuthoringProject(input);
  } catch (error) {
    fail(
      'CV_SHOW_AUDIO_WORKFLOW_PROJECT_INVALID',
      `The target canonical Project at ${filePath} is invalid.`,
      { causeCode: error?.code || 'UNKNOWN' },
    );
  }
}

export async function loadCvShowAudioWorkflowCurrentSource(repoRoot) {
  let sourcePath = path.join(repoRoot, CV_SHOW_SOURCE_RELATIVE_PATH);
  return loadCvShowSourceSelection({ sourcePath, phase: 'workflow-current' });
}

async function loadAcceptedPublicProof(repoRoot, options) {
  let customSelector = options['public-selector'];
  let customManifest = options['public-manifest'];
  if ((customSelector || customManifest) && !(customSelector && customManifest)) {
    fail(
      'CV_SHOW_AUDIO_WORKFLOW_PUBLIC_REUSE_PROOF_UNAVAILABLE',
      'Pass both absolute --public-selector and --public-manifest paths for a custom accepted public proof.',
    );
  }
  let selectorPath = customSelector
    || path.join(repoRoot, 'src/static-pages/data/cvShowWebAudioRelease.js');
  if (!path.isAbsolute(selectorPath) || (customManifest && !path.isAbsolute(customManifest))) {
    fail(
      'CV_SHOW_AUDIO_WORKFLOW_PUBLIC_REUSE_PROOF_UNAVAILABLE',
      'Accepted public proof paths must be absolute: use --public-selector and --public-manifest.',
    );
  }
  try {
    let selected = await import(
      `${pathToFileURL(selectorPath).href}?workflow-public=${Date.now()}`
    );
    let selector = selected.CV_SHOW_WEB_AUDIO_RELEASE;
    let manifestPath = customManifest || path.join(
      repoRoot,
      'src/static-pages/copy-cv-show-audio',
      portablePath(selector?.manifest?.path, 'accepted public manifest'),
    );
    let manifestBytes = await fs.readFile(manifestPath);
    return {
      selector,
      manifest: JSON.parse(manifestBytes.toString('utf8')),
      manifestBytes,
    };
  } catch (error) {
    if (error?.code?.startsWith('CV_SHOW_AUDIO_WORKFLOW_')) throw error;
    fail(
      'CV_SHOW_AUDIO_WORKFLOW_PUBLIC_REUSE_PROOF_UNAVAILABLE',
      `The accepted public selector/manifest proof cannot be read from ${selectorPath}. Restore it or pass absolute --public-selector and --public-manifest paths.`,
      { causeCode: error?.code || 'UNKNOWN' },
    );
  }
}

async function cli(argv, environment = process.env) {
  let { command, options } = parseArgs(argv);
  let privateRoot = absoluteRoot(options['private-root'] || environment.CV_SHOW_PRIVATE_ARTIFACT_BASE);
  let repoRoot = path.resolve(options['repo-root'] || REPOSITORY_ROOT);
  let profile = await loadProfile(options.profile);
  let current = await loadCvShowAudioWorkflowCurrentSource(repoRoot);
  let targetProject = await loadTargetProject(options.project, current.CV_SHOW_PRESENTATION_PROJECT);
  let endpoint = options.endpoint || environment.CV_SHOW_MODEL_ENDPOINT;
  let modelClient = endpoint
    ? createCvShowModelServiceClient({
        endpoint,
        headers: {},
        fetchImpl: globalThis.fetch,
        model: profile.voice.model || 'qwen3',
      })
    : null;
  if (
    options['refresh-artifacts'] !== undefined
    && !['yes', 'no'].includes(options['refresh-artifacts'])
  ) {
    fail(
      'CV_SHOW_AUDIO_WORKFLOW_ARGUMENT_INVALID',
      '--refresh-artifacts accepts only yes or no.',
    );
  }
  let handle = await createCvShowAudioWorkflow({
    privateRoot,
    repoRoot,
    project: targetProject,
    predecessorRelease: current.CV_SHOW_AUDIO_RELEASE,
    profile,
    sourceSha256: `sha256:${sha256(current.bytes)}`,
    modelClient,
    refreshArtifacts: options['refresh-artifacts'] === 'yes',
  });
  let owner = options.owner || 'cv-show-owner';
  let result;
  if (command === 'plan') result = handle.workflow;
  else if (command === 'status') result = {
    planId: handle.workflow.planId,
    dispositions: handle.workflow.dispositions,
    entries: await handle.inspectEntries(),
  };
  else if (command === 'advance') result = await handle.advanceEntries(owner);
  else if (command === 'review') {
    if (typeof options.entry !== 'string' || typeof options['wav-hash'] !== 'string'
      || typeof options['attempt-hash'] !== 'string'
      || !['yes', 'no'].includes(options.approve)) {
      fail(
        'CV_SHOW_AUDIO_WORKFLOW_REVIEW_ARGUMENT_INVALID',
        'review requires --entry, --wav-hash, --attempt-hash, and explicit --approve yes|no.',
      );
    }
    result = await handle.reviewClip({
      entryId: options.entry,
      ownerToken: owner,
      approved: options.approve === 'yes',
      wavHash: options['wav-hash'],
      synthesisAttemptHash: options['attempt-hash'],
    });
  } else if (command === 'retry-verification') {
    if (typeof options.entry !== 'string' || !options.entry) {
      fail(
        'CV_SHOW_AUDIO_WORKFLOW_RETRY_ARGUMENT_INVALID',
        'retry-verification requires --entry.',
      );
    }
    result = await handle.retryEntryVerification({
      entryId: options.entry,
      ownerToken: owner,
    });
  } else if (command === 'retry-synthesis') {
    if (typeof options.entry !== 'string' || !options.entry) {
      fail(
        'CV_SHOW_AUDIO_WORKFLOW_RETRY_ARGUMENT_INVALID',
        'retry-synthesis requires --entry.',
      );
    }
    result = await handle.retryEntrySynthesis({
      entryId: options.entry,
      ownerToken: owner,
    });
  } else if (command === 'verify-release') {
    await handle.aggregate.initialize();
    result = await handle.aggregate.verifyEntries(owner);
    if (result.phase === 'entries-verified') result = await handle.aggregate.verifyEntries(owner);
    result = { state: result, release: await handle.inspectVerifiedRelease() };
  } else if (command === 'bind-project') {
    if (typeof options.output !== 'string' || !path.isAbsolute(options.output)) {
      fail(
        'CV_SHOW_AUDIO_WORKFLOW_PROJECT_OUTPUT_REQUIRED',
        'bind-project requires an absolute --output path.',
      );
    }
    let bound = await handle.createBoundProject();
    let bytes = Buffer.from(`${JSON.stringify(
      presentationAuthoringProjectCanonicalProjection(bound),
      null,
      2,
    )}\n`, 'utf8');
    try {
      await fs.writeFile(options.output, bytes, { flag: 'wx', mode: 0o600 });
    } catch (error) {
      if (error?.code !== 'EEXIST') throw error;
      let existing = await fs.readFile(options.output);
      if (!existing.equals(bytes)) {
        fail(
          'CV_SHOW_AUDIO_WORKFLOW_PROJECT_OUTPUT_CONFLICT',
          `The bound Project output already exists with different bytes: ${options.output}`,
        );
      }
    }
    result = {
      path: options.output,
      revision: bound.revision,
      authoringProjectHash: bound.hash,
      sha256: `sha256:${sha256(bytes)}`,
    };
  } else if (command === 'approve-release') {
    let release = await handle.inspectVerifiedRelease();
    if (
      options.approve !== 'yes'
      || typeof options['release-id'] !== 'string'
      || options['release-id'] !== release?.releaseId
    ) {
      fail(
        'CV_SHOW_AUDIO_WORKFLOW_RELEASE_APPROVAL_REQUIRED',
        'Pass --approve yes and the exact --release-id printed by verify-release.',
      );
    }
    result = await handle.aggregate.approve({ ownerToken: owner, approved: true });
  } else if (command === 'stage') result = await handle.aggregate.stage(owner);
  else if (command === 'promote') result = await handle.aggregate.promote(owner);
  else if (command === 'publish') {
    let acceptedPublic = await loadAcceptedPublicProof(repoRoot, options);
    result = await handle.publishWebAudio({
      acceptedPublic,
    });
  } else {
    fail('CV_SHOW_AUDIO_WORKFLOW_ARGUMENT_INVALID', `Unknown command ${command}.`);
  }
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
}

let isMain = process.argv[1]
  && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  cli(process.argv.slice(2)).catch((error) => {
    process.stderr.write(`${error.code || 'CV_SHOW_AUDIO_WORKFLOW_FAILED'}: ${error.message}\n`);
    if (error.details && Object.keys(error.details).length) {
      process.stderr.write(`${JSON.stringify(error.details)}\n`);
    }
    process.exitCode = 1;
  });
}
