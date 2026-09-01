import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import {
  cp,
  lstat,
  mkdir,
  mkdtemp,
  readFile,
  readdir,
  rm,
  symlink,
  writeFile,
} from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';

import {
  createPresentationAuthoringProject,
  createPresentationAuthoringTimelineProjection,
  presentationAuthoringProjectCanonicalProjection,
} from 'symbiote-workspace';
import { canonicalize, computeIntegrity } from 'symbiote-workspace/schema/canonical-json.js';

import {
  createCvShowArtifactTreeIdentity,
  createCvShowAudioReleaseDescriptor,
  createCvShowAudioReleasePipeline,
} from '../../scripts/cv-show-audio-pipeline.js';
import {
  createCvShowAudioPipelineStorage,
} from '../../scripts/cv-show-audio-pipeline-storage.js';
import {
  createCvShowAudioPromotion,
} from '../../scripts/cv-show-audio-promotion.js';
import {
  createCvShowAudioProvenance,
  planCvShowAudioDirtySet,
} from '../../scripts/cv-show-audio-provenance.js';
import {
  materializeCvShowAuthoringDraft,
  renderCvShowSource,
} from '../../scripts/cv-show-authoring-materializer.js';
import {
  CV_SHOW_AUDIO_RELEASE,
  CV_SHOW_PRESENTATION_PROJECT,
} from '../../src/static-pages/data/cvShowPresentationProject.js';
import {
  createCvShowEntryProject,
} from '../../src/static-pages/js/tour-player/presentationProjectAdapter.js';

const REPO_ROOT = path.resolve(new URL('../..', import.meta.url).pathname);
const SOURCE_RELATIVE = 'src/static-pages/data/cvShowPresentationProject.js';
const PROFILE = Object.freeze({
  voice: {
    selectionId: 'barzana-2',
    model: 'qwen3-clone',
    modelVersion: 'Qwen/Qwen3-TTS-12Hz-0.6B-Base',
    language: 'ru',
    style: 'warm natural product guide, continuous speech without long pauses',
    sampleRate: 24000,
    referenceSha256: '79652994e2af6fa1997a1b9118b068a870f948b173f9b71ad7cc4441b8fa3075',
    referenceTranscriptSha256: '7215050f4774fa336b660871cfc43989cc353d30f00cf7b42d6f9ceebfb87853',
  },
  synthesisPolicy: {
    format: 'wav',
    normalize: true,
    normalization: {
      targetLufs: -19,
      truePeakLimitDbfs: -1,
      version: 'bs1770-4-truepeak4x-v1',
    },
    textPolicy: 'English terms preserved in Latin script; digits expanded as context-aware Russian words',
  },
  asr: {
    model: 'large-v3-turbo',
    locale: 'ru',
    recognitionVersion: 'cv-show-whisper-recognition-v1',
  },
  aligner: {
    alignedSequenceVersion: 'workspace-aligned-sequence-v3',
    anchoringVersion: 'workspace-transcript-word-anchoring-v1',
    contract: 'workspace-observed-alignment',
  },
});

function sha256(value) {
  return createHash('sha256').update(value).digest('hex');
}

function contentId(schemaVersion, value) {
  return `${schemaVersion}:${sha256(Buffer.from(canonicalize(value), 'utf8'))}`;
}

async function temporaryRoot(t, prefix) {
  let root = await mkdtemp(path.join(tmpdir(), prefix));
  t.after(() => rm(root, { recursive: true, force: true }));
  return root;
}

function provenance(project = CV_SHOW_PRESENTATION_PROJECT, overrides = {}) {
  return createCvShowAudioProvenance({
    project,
    voice: overrides.voice || PROFILE.voice,
    synthesisPolicy: overrides.synthesisPolicy || PROFILE.synthesisPolicy,
    asr: overrides.asr || PROFILE.asr,
    aligner: overrides.aligner || PROFILE.aligner,
  });
}

function mediaInput(accepted, entry) {
  return {
    entryId: entry.entryId,
    narrationInputHash: entry.narrationInputHash,
    synthesisInputHash: entry.synthesisInputHash,
    voiceIdentityHash: accepted.voiceIdentityHash,
    synthesisPolicyHash: accepted.synthesisPolicyHash,
    asrProfileHash: accepted.asrProfileHash,
    alignerContractHash: accepted.alignerContractHash,
  };
}

function entryRelease({ accepted, entry, index, artifacts }) {
  let prefix = String(index + 1).padStart(2, '0');
  let wav = artifacts.get(`${prefix}.wav`);
  let recognition = artifacts.get(`alignment/fake/recognized/${prefix}.json`);
  let alignment = artifacts.get(`alignment/fake/aligned/${prefix}.json`);
  let projection = {
    schemaVersion: 'cv-show-audio-entry-release-v1',
    entryId: entry.entryId,
    mediaInput: mediaInput(accepted, entry),
    wav,
    recognition,
    alignment,
    verification: {
      timingCoverage: 1,
      alignedSequenceHash: `fake-aligned:${prefix}`,
      timelineHash: `fake-timeline:${prefix}`,
    },
  };
  return {
    ...projection,
    entryReleaseId: contentId('cv-show-audio-entry-release-v1', projection),
  };
}

function fakeArtifacts() {
  let bytes = new Map();
  bytes.set('manifest.json', Buffer.from('{"fake":"audio"}', 'utf8'));
  bytes.set('alignment/fake/manifest.json', Buffer.from('{"fake":"alignment"}', 'utf8'));
  for (let index = 0; index < 30; index += 1) {
    let prefix = String(index + 1).padStart(2, '0');
    bytes.set(`${prefix}.wav`, Buffer.from(`wav-${prefix}`, 'utf8'));
    bytes.set(
      `alignment/fake/recognized/${prefix}.json`,
      Buffer.from(`{"recognized":"${prefix}"}`, 'utf8'),
    );
    bytes.set(
      `alignment/fake/aligned/${prefix}.json`,
      Buffer.from(`{"aligned":"${prefix}"}`, 'utf8'),
    );
  }
  let artifacts = new Map([...bytes].map(([artifactPath, value]) => [artifactPath, {
    path: artifactPath,
    sha256: sha256(value),
    size: value.byteLength,
  }]));
  let tree = createCvShowArtifactTreeIdentity([...artifacts.values()]);
  return { artifacts, bytes, tree };
}

function changedTimingProject() {
  let input = presentationAuthoringProjectCanonicalProjection(CV_SHOW_PRESENTATION_PROJECT);
  input.revision += 1;
  let cue = input.cells.find((cell) => cell.kind === 'cue' && cell.timing.at.anchor === 'speech');
  cue.timing.leadMs += 1;
  return createPresentationAuthoringProject(input);
}

async function planFixture({
  sourceSha256 = `sha256:${'a'.repeat(64)}`,
  project = CV_SHOW_PRESENTATION_PROJECT,
  regenerateIndex = -1,
} = {}) {
  let accepted = provenance(project);
  let fake = fakeArtifacts();
  let releases = accepted.entries.map((entry, index) => entryRelease({
    accepted,
    entry,
    index,
    artifacts: fake.artifacts,
  }));
  let generatedState = null;
  let generatedStateHash = null;
  let generatedRelease = null;
  let entries = releases.map((release, index) => {
    if (index !== regenerateIndex) return { entryId: release.entryId, mode: 'reuse', release };
    let timeline = createPresentationAuthoringTimelineProjection(
      createCvShowEntryProject(project, release.entryId),
    );
    let runnerPlan = {
      entryId: release.entryId,
      timeline,
      synthesisItem: {
        id: release.entryId,
        text: timeline.turns[0].text,
        language: timeline.locale,
        voiceRef: 'fake-voice',
        style: 'fake',
      },
      locale: timeline.locale,
      voice: { mode: 'single', speakerId: 'fake-voice' },
      readinessProfile: { ready: true },
      requiredAnchors: [],
    };
    generatedState = {
      schemaVersion: 'cv-show-audio-pipeline-entry-state-v1',
      plan: runnerPlan,
      phase: 'entry-verified',
      attemptHashes: Array.from({ length: 6 }, (_, attempt) => `${attempt}`.repeat(64).slice(0, 64)),
      synthesis: { wavHash: release.wav.sha256 },
      review: { approved: true },
      transcript: { text: release.entryId },
      alignment: {
        metrics: { timingCoverage: 1 },
        sequence: {
          hash: release.verification.alignedSequenceHash,
          timelineHash: release.verification.timelineHash,
        },
      },
      verification: { timingCoverage: 1, anchorCoverage: [] },
      failure: null,
    };
    let stateHash = sha256(Buffer.from(canonicalize(generatedState), 'utf8'));
    generatedStateHash = stateHash;
    generatedRelease = entryRelease({
      accepted,
      entry: accepted.entries[index],
      index,
      artifacts: fake.artifacts,
    });
    return { entryId: release.entryId, mode: 'regenerate', runnerPlan };
  });
  let manifests = {
    locale: 'ru',
    voice: 'fake-voice',
    directory: 'fake-predecessor',
    audio: fake.artifacts.get('manifest.json'),
    alignment: {
      ...fake.artifacts.get('alignment/fake/manifest.json'),
      model: 'fake-asr',
    },
  };
  let projectInput = presentationAuthoringProjectCanonicalProjection(project);
  let predecessorProjection = {
    schemaVersion: 'cv-show-audio-release-v1',
    entryReleaseIds: releases.map(({ entryReleaseId }) => entryReleaseId),
    project: { revision: project.revision, authoringProjectHash: project.hash },
    mediaCollectionIdentity: {
      schemaVersion: 'workspace-presentation-media-collection-v1',
      collectionId: `fake:${project.revision}`,
      manifestHash: `fake-manifest:${project.hash}`,
      identity: `fake-media:${project.hash}`,
    },
    profiles: {
      voiceIdentityHash: accepted.voiceIdentityHash,
      synthesisPolicyHash: accepted.synthesisPolicyHash,
      asrProfileHash: accepted.asrProfileHash,
      alignerContractHash: accepted.alignerContractHash,
    },
    manifests,
    artifactTreeHash: fake.tree.artifactTreeHash,
    acceptedProvenance: accepted,
    predecessorReleaseId: 'cv-show-legacy-audio-release-v1:fake',
    planId: `cv-show-audio-release-plan-v1:${'1'.repeat(64)}`,
    verificationHash: `cv-show-audio-release-verification-v1:${'2'.repeat(64)}`,
  };
  let predecessor = createCvShowAudioReleaseDescriptor(predecessorProjection);
  let plan = {
    schemaVersion: 'cv-show-audio-release-plan-v1',
    project: {
      revision: project.revision,
      authoringProjectHash: project.hash,
      input: projectInput,
    },
    provenance: accepted,
    predecessor: {
      release: predecessor,
      projectBase: {
        revision: CV_SHOW_PRESENTATION_PROJECT.revision,
        authoringProjectHash: CV_SHOW_PRESENTATION_PROJECT.hash,
        sourceSha256,
      },
    },
    entries,
  };
  return {
    plan,
    releases,
    generatedState,
    generatedStateHash,
    generatedRelease,
    fake,
    manifests,
    predecessor,
  };
}

function releaseArtifactEvidence(fixture) {
  return {
    mediaCollectionIdentity: fixture.predecessor.mediaCollectionIdentity,
    manifests: {
      locale: fixture.manifests.locale,
      voice: fixture.manifests.voice,
      audio: fixture.manifests.audio,
      alignment: fixture.manifests.alignment,
    },
  };
}

function generatedEvidence(fixture, index, mutateState = (state) => state) {
  let release = fixture.releases[index];
  let timeline = createPresentationAuthoringTimelineProjection(
    createCvShowEntryProject(CV_SHOW_PRESENTATION_PROJECT, release.entryId),
  );
  let runnerPlan = {
    entryId: release.entryId,
    timeline,
    synthesisItem: {
      id: release.entryId,
      text: timeline.turns[0].text,
      language: timeline.locale,
      voiceRef: 'fake-voice',
      style: 'fake',
    },
    locale: timeline.locale,
    voice: { mode: 'single', speakerId: 'fake-voice' },
    readinessProfile: { ready: true },
    requiredAnchors: [],
  };
  let state = mutateState({
    schemaVersion: 'cv-show-audio-pipeline-entry-state-v1',
    plan: runnerPlan,
    phase: 'entry-verified',
    attemptHashes: Array.from({ length: 6 }, (_, attempt) => `${attempt}`.repeat(64).slice(0, 64)),
    synthesis: { wavHash: release.wav.sha256 },
    review: { approved: true },
    transcript: { text: release.entryId },
    alignment: {
      metrics: { timingCoverage: 1 },
      sequence: {
        hash: release.verification.alignedSequenceHash,
        timelineHash: release.verification.timelineHash,
      },
    },
    verification: { timingCoverage: 1, anchorCoverage: [] },
    failure: null,
  });
  return {
    runnerPlan,
    result: {
      stateHash: sha256(Buffer.from(canonicalize(state), 'utf8')),
      state,
      entryRelease: release,
    },
  };
}

function pipelineFor(storageRoot, inspectEntry, callbacks = {}) {
  return createCvShowAudioReleasePipeline({
    storage: callbacks.storage || createCvShowAudioPipelineStorage({ storageRoot }),
    inspectEntry,
    inspectReleaseArtifacts: callbacks.inspectReleaseArtifacts || (async () => {
      throw new Error('Unexpected release artifact inspection');
    }),
    stageRelease: callbacks.stageRelease || (async () => ({ status: 'staged' })),
    promoteRelease: callbacks.promoteRelease || (async () => ({ status: 'promoted' })),
  });
}

async function advanceToVerified(handle) {
  await handle.initialize();
  assert.equal((await handle.verifyEntries('owner')).phase, 'entries-verified');
  assert.equal((await handle.verifyEntries('owner')).phase, 'release-verified');
}

async function writeArtifactTree(root, bytes) {
  for (let [relative, value] of bytes) {
    let target = path.join(root, relative);
    await mkdir(path.dirname(target), { recursive: true });
    await writeFile(target, value);
  }
}

async function inspectFakeTree(root) {
  let rows = [];
  async function visit(relative = '') {
    for (let entry of await readdir(path.join(root, relative), { withFileTypes: true })) {
      let child = relative ? path.posix.join(relative, entry.name) : entry.name;
      if (entry.isSymbolicLink()) throw Object.assign(new Error('symlink'), { code: 'FAKE_SYMLINK' });
      if (entry.isDirectory()) await visit(child);
      else {
        let value = await readFile(path.join(root, child));
        rows.push({ path: child, sha256: sha256(value), size: value.byteLength });
      }
    }
  }
  await visit();
  return createCvShowArtifactTreeIdentity(rows);
}

async function repositoryFixture(t, { regenerateIndex = -1 } = {}) {
  let temporaryBase = path.join(REPO_ROOT, 'tmp');
  await mkdir(temporaryBase, { recursive: true });
  let root = await mkdtemp(path.join(temporaryBase, 'cv-audio-promotion-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  let repoRoot = path.join(root, 'repo');
  let source = path.join(repoRoot, SOURCE_RELATIVE);
  await mkdir(path.dirname(source), { recursive: true });
  await cp(path.join(REPO_ROOT, SOURCE_RELATIVE), source);
  let fixture = await planFixture({ regenerateIndex });
  let sourceText = renderCvShowSource({
    source: await readFile(source, 'utf8'),
    project: CV_SHOW_PRESENTATION_PROJECT,
    release: fixture.predecessor,
  });
  await writeFile(source, sourceText, 'utf8');
  let sourceBytes = await readFile(source);
  fixture.plan.predecessor.projectBase.sourceSha256 = `sha256:${sha256(sourceBytes)}`;
  let privateRoot = path.join(root, 'private');
  let predecessorRoot = path.join(
    privateRoot,
    fixture.predecessor.manifests.voice,
    fixture.predecessor.manifests.directory,
  );
  await writeArtifactTree(predecessorRoot, fixture.fake.bytes);
  let verifyArtifacts = async ({ root: candidate, release, project }) => {
    assert.equal(project.hash, release.project.authoringProjectHash);
    let tree = await inspectFakeTree(candidate);
    assert.equal(tree.artifactTreeHash, release.artifactTreeHash);
    return { status: 'verified' };
  };
  return {
    ...fixture,
    root,
    repoRoot,
    source,
    privateRoot,
    storageRoot: path.join(root, 'pipeline-storage'),
    sourceStorageRoot: path.join(root, 'authoring-storage'),
    verifyArtifacts,
  };
}

test('aggregate inspects one regenerated entry once and resumes every phase without repeat work', async (t) => {
  let root = await temporaryRoot(t, 'cv-audio-aggregate-');
  let fixture = await planFixture({ regenerateIndex: 0 });
  let inspectCalls = 0;
  let releaseInspectCalls = 0;
  let stageCalls = 0;
  let promoteCalls = 0;
  let reusedBytes = canonicalize(fixture.plan.entries[1].release);
  let pipeline = pipelineFor(root, async () => {
    inspectCalls += 1;
    return {
      stateHash: fixture.generatedStateHash,
      state: fixture.generatedState,
      entryRelease: fixture.generatedRelease,
    };
  }, {
    inspectReleaseArtifacts: async () => {
      releaseInspectCalls += 1;
      return releaseArtifactEvidence(fixture);
    },
    stageRelease: async ({ entries }) => {
      stageCalls += 1;
      assert.equal(canonicalize(entries[1]), reusedBytes);
      return { status: 'staged' };
    },
    promoteRelease: async () => {
      promoteCalls += 1;
      return { status: 'promoted' };
    },
  });
  let handle = pipeline.openRelease(fixture.plan);

  assert.equal((await handle.initialize()).phase, 'entries-pending');
  await assert.rejects(handle.approve({ ownerToken: 'owner', approved: true }), {
    code: 'CV_SHOW_AUDIO_RELEASE_APPROVAL_NOT_PERMITTED',
  });
  assert.equal((await handle.verifyEntries('owner')).phase, 'entries-verified');
  assert.equal(inspectCalls, 1);
  handle = pipeline.openRelease(fixture.plan);
  assert.equal((await handle.verifyEntries('owner')).phase, 'release-verified');
  assert.equal(inspectCalls, 1);
  assert.equal((await handle.approve({ ownerToken: 'owner', approved: true })).phase, 'human-approved');
  assert.equal((await handle.stage('owner')).phase, 'staged');
  assert.equal((await handle.stage('owner')).phase, 'staged');
  assert.equal((await handle.promote('owner')).phase, 'promoted');
  assert.equal((await handle.promote('owner')).phase, 'promoted');
  assert.deepEqual({ inspectCalls, stageCalls, promoteCalls }, {
    inspectCalls: 1,
    stageCalls: 1,
    promoteCalls: 1,
  });
  assert.equal(releaseInspectCalls, 1);
  assert.equal(
    (await handle.inspect()).receipt.status,
    'promoted',
  );
});

test('runner evidence identity is separate from exact media-local entry identity', async (t) => {
  let fixture = await planFixture();
  let first = generatedEvidence(fixture, 0);
  let second = generatedEvidence(fixture, 0, (state) => ({
    ...state,
    attemptHashes: state.attemptHashes.map((hash, index) => (
      index === 0 ? 'f'.repeat(64) : hash
    )),
    verification: { timingCoverage: 1, anchorCoverage: [{ anchorId: 'different' }] },
  }));
  fixture.plan.entries[0] = { entryId: first.runnerPlan.entryId, mode: 'regenerate', runnerPlan: first.runnerPlan };
  let evidenceHashes = [];
  let releaseIds = [];
  for (let [index, evidence] of [first, second].entries()) {
    let root = await temporaryRoot(t, `cv-audio-evidence-${index}-`);
    let captured;
    let handle = pipelineFor(root, async () => evidence.result, {
      inspectReleaseArtifacts: async () => releaseArtifactEvidence(fixture),
      stageRelease: async (aggregate) => {
        captured = aggregate;
        return { status: 'staged' };
      },
    }).openRelease(fixture.plan);
    await advanceToVerified(handle);
    await handle.approve({ ownerToken: 'owner', approved: true });
    let state = await handle.stage('owner');
    evidenceHashes.push(state.entryObjectHashes[0]);
    releaseIds.push(captured.entries[0].entryReleaseId);
  }
  assert.notEqual(evidenceHashes[0], evidenceHashes[1]);
  assert.equal(releaseIds[0], releaseIds[1]);
  for (let forbidden of ['runnerStateHash', 'origin', 'mode', 'disposition']) {
    assert.equal(Object.hasOwn(first.result.entryRelease, forbidden), false);
  }
  let invalid = structuredClone(first.result.entryRelease);
  invalid.origin = 'generated';
  assert.throws(() => {
    let plan = structuredClone(fixture.plan);
    plan.entries[0] = { entryId: invalid.entryId, mode: 'reuse', release: invalid };
    pipelineFor('/tmp/not-opened', async () => undefined).openRelease(plan);
  }, { code: 'CV_SHOW_AUDIO_RELEASE_ENTRY_INVALID' });
});

test('a generated release is an exact all-reuse predecessor without repeated inspection', async (t) => {
  let fixture = await repositoryFixture(t, { regenerateIndex: 0 });
  let firstAggregate;
  let generatedReads = 0;
  let firstPromotion = createCvShowAudioPromotion({
    repoRoot: fixture.repoRoot,
    privateRoot: fixture.privateRoot,
    sourceStorageRoot: fixture.sourceStorageRoot,
    verifyArtifacts: fixture.verifyArtifacts,
    readGeneratedArtifact: async ({ path: artifactPath }) => {
      generatedReads += 1;
      return fixture.fake.bytes.get(artifactPath);
    },
  });
  let first = pipelineFor(fixture.storageRoot, async () => ({
    stateHash: fixture.generatedStateHash,
    state: fixture.generatedState,
    entryRelease: fixture.generatedRelease,
  }), {
    inspectReleaseArtifacts: async () => releaseArtifactEvidence(fixture),
    stageRelease: async (aggregate) => {
      firstAggregate = aggregate;
      return firstPromotion.stageRelease(aggregate);
    },
    promoteRelease: firstPromotion.promoteRelease,
  }).openRelease(fixture.plan);
  await advanceToVerified(first);
  await first.approve({ ownerToken: 'owner', approved: true });
  await first.stage('owner');
  await first.promote('owner');
  assert.equal(generatedReads > 0, true);

  let selectedBytes = await readFile(fixture.source);
  let timing = await planFixture({
    project: changedTimingProject(),
    sourceSha256: `sha256:${sha256(selectedBytes)}`,
  });
  timing.plan.predecessor.release = firstAggregate.release;
  timing.plan.predecessor.projectBase = {
    revision: CV_SHOW_PRESENTATION_PROJECT.revision,
    authoringProjectHash: CV_SHOW_PRESENTATION_PROJECT.hash,
    sourceSha256: `sha256:${sha256(selectedBytes)}`,
  };
  timing.plan.entries = firstAggregate.entries.map((release) => ({
    entryId: release.entryId,
    mode: 'reuse',
    release,
  }));
  let inspections = 0;
  let successorGeneratedReads = 0;
  let secondPromotion = createCvShowAudioPromotion({
    repoRoot: fixture.repoRoot,
    privateRoot: fixture.privateRoot,
    sourceStorageRoot: fixture.sourceStorageRoot,
    verifyArtifacts: fixture.verifyArtifacts,
    readGeneratedArtifact: async () => {
      successorGeneratedReads += 1;
      throw new Error('all-reuse successor must not read generated artifacts');
    },
  });
  let secondAggregate;
  let second = pipelineFor(path.join(fixture.root, 'pipeline-successor'), async () => {
    inspections += 1;
    throw new Error('entry inspection must not repeat');
  }, {
    inspectReleaseArtifacts: async () => {
      inspections += 1;
      throw new Error('release inspection must not repeat');
    },
    stageRelease: async (aggregate) => {
      secondAggregate = aggregate;
      return secondPromotion.stageRelease(aggregate);
    },
    promoteRelease: secondPromotion.promoteRelease,
  }).openRelease(timing.plan);
  await advanceToVerified(second);
  await second.approve({ ownerToken: 'owner', approved: true });
  await second.stage('owner');
  await second.promote('owner');
  assert.equal(inspections, 0);
  assert.equal(successorGeneratedReads, 0);
  assert.deepEqual(secondAggregate.entries, firstAggregate.entries);
  assert.deepEqual(secondAggregate.release.entryReleaseIds, firstAggregate.release.entryReleaseIds);
  assert.deepEqual(secondAggregate.release.manifests.audio, firstAggregate.release.manifests.audio);
  assert.deepEqual(
    secondAggregate.release.manifests.alignment,
    firstAggregate.release.manifests.alignment,
  );
  let treeDirectory = secondAggregate.release.artifactTreeHash.split(':').at(-1);
  assert.equal(secondAggregate.release.manifests.directory, treeDirectory);
  assert.equal((await lstat(path.join(
    fixture.privateRoot,
    secondAggregate.release.manifests.voice,
    treeDirectory,
  ))).isDirectory(), true);
  let selected = await import(`${new URL(fixture.source, import.meta.url).href}?chain=${Date.now()}`);
  assert.equal(selected.CV_SHOW_AUDIO_RELEASE.manifests.directory, treeDirectory);
});

test('release artifact inspection cannot mutate canonical entry order', async (t) => {
  let root = await temporaryRoot(t, 'cv-audio-adapter-mutation-');
  let fixture = await planFixture({ regenerateIndex: 0 });
  let observedFrozen = false;
  let captured;
  let handle = pipelineFor(root, async () => ({
    stateHash: fixture.generatedStateHash,
    state: fixture.generatedState,
    entryRelease: fixture.generatedRelease,
  }), {
    inspectReleaseArtifacts: async ({ entries }) => {
      observedFrozen = Object.isFrozen(entries)
        && entries.every((entry) => Object.isFrozen(entry));
      assert.throws(() => entries.reverse(), TypeError);
      return releaseArtifactEvidence(fixture);
    },
    stageRelease: async (aggregate) => {
      captured = aggregate;
      return { status: 'staged' };
    },
  }).openRelease(fixture.plan);
  await advanceToVerified(handle);
  await handle.approve({ ownerToken: 'owner', approved: true });
  await handle.stage('owner');
  assert.equal(observedFrozen, true);
  assert.deepEqual(
    captured.release.entryReleaseIds,
    fixture.plan.entries.map((entry, index) => (
      entry.mode === 'reuse' ? entry.release.entryReleaseId : fixture.releases[index].entryReleaseId
    )),
  );
});

test('aggregate rejects malformed entry identity and makes false approval terminal', async (t) => {
  let root = await temporaryRoot(t, 'cv-audio-rejection-');
  let fixture = await planFixture();
  for (let mutate of [
    (plan) => { plan.entries[1].entryId = plan.entries[0].entryId; },
    (plan) => { plan.entries[0].release.mediaInput.attentionContractHash = 'forbidden'; },
    (plan) => { plan.entries[0].release.entryReleaseId = `cv-show-audio-entry-release-v1:${'f'.repeat(64)}`; },
    (plan) => { plan.provenance.entries.reverse(); },
    (plan) => { plan.project.authoringProjectHash = 'stale-project'; },
    (plan) => { plan.predecessor.projectBase.authoringProjectHash = 'stale-predecessor'; },
    (plan) => { plan.manifests = fixture.manifests; },
    (plan) => { plan.mediaCollectionIdentity = fixture.predecessor.mediaCollectionIdentity; },
    (plan) => {
      plan.entries.reverse();
      plan.provenance.entries.reverse();
      let projection = {
        voiceIdentityHash: plan.provenance.voiceIdentityHash,
        synthesisPolicyHash: plan.provenance.synthesisPolicyHash,
        asrProfileHash: plan.provenance.asrProfileHash,
        alignerContractHash: plan.provenance.alignerContractHash,
        entries: plan.provenance.entries,
      };
      plan.provenance.hash = `cv-show-audio-provenance-v1:${computeIntegrity(projection)}`;
    },
  ]) {
    let invalid = structuredClone(fixture.plan);
    mutate(invalid);
    assert.throws(() => pipelineFor(root, async () => undefined).openRelease(invalid));
  }
  let staleInput = presentationAuthoringProjectCanonicalProjection(CV_SHOW_PRESENTATION_PROJECT);
  staleInput.revision += 1;
  staleInput.cells.find(({ kind }) => kind === 'narration').turn.text += ' Изменение.';
  let staleProject = createPresentationAuthoringProject(staleInput);
  let stalePlan = structuredClone(fixture.plan);
  stalePlan.project = {
    revision: staleProject.revision,
    authoringProjectHash: staleProject.hash,
    input: presentationAuthoringProjectCanonicalProjection(staleProject),
  };
  assert.throws(() => pipelineFor(root, async () => undefined).openRelease(stalePlan), {
    code: 'CV_SHOW_AUDIO_RELEASE_PROVENANCE_INVALID',
  });
  let handle = pipelineFor(root, async () => undefined).openRelease(fixture.plan);
  await advanceToVerified(handle);
  let rejected = await handle.approve({ ownerToken: 'owner', approved: false });
  assert.equal(rejected.phase, 'release-verified');
  assert.equal(rejected.approval.approved, false);
  await assert.rejects(handle.approve({ ownerToken: 'owner', approved: true }), {
    code: 'CV_SHOW_AUDIO_RELEASE_APPROVAL_NOT_PERMITTED',
  });
  await assert.rejects(handle.stage('owner'), { code: 'CV_SHOW_AUDIO_RELEASE_APPROVAL_REQUIRED' });
});

test('nonterminal or forged regenerated evidence blocks before release verification', async (t) => {
  for (let mode of ['nonterminal', 'forged']) {
    let root = await temporaryRoot(t, `cv-audio-${mode}-`);
    let fixture = await planFixture({ regenerateIndex: 0 });
    let state = structuredClone(fixture.generatedState);
    if (mode === 'nonterminal') state.phase = 'aligned';
    let stateHash = mode === 'forged'
      ? 'f'.repeat(64)
      : sha256(Buffer.from(canonicalize(state), 'utf8'));
    let release = structuredClone(fixture.generatedRelease);
    let handle = pipelineFor(root, async () => ({ stateHash, state, entryRelease: release }))
      .openRelease(fixture.plan);
    await handle.initialize();
    await assert.rejects(handle.verifyEntries('owner'), {
      code: 'CV_SHOW_AUDIO_RELEASE_ENTRY_INVALID',
    });
  }
});

test('entry evidence is durably CASed one canonical entry at a time', async (t) => {
  let root = await temporaryRoot(t, 'cv-audio-partial-evidence-');
  let fixture = await planFixture();
  let first = generatedEvidence(fixture, 0);
  let second = generatedEvidence(fixture, 1);
  fixture.plan.entries[0] = {
    entryId: first.runnerPlan.entryId,
    mode: 'regenerate',
    runnerPlan: first.runnerPlan,
  };
  fixture.plan.entries[1] = {
    entryId: second.runnerPlan.entryId,
    mode: 'regenerate',
    runnerPlan: second.runnerPlan,
  };
  let calls = [0, 0];
  let secondFailed = false;
  let pipeline = pipelineFor(root, async (runnerPlan) => {
    let index = runnerPlan.entryId === first.runnerPlan.entryId ? 0 : 1;
    calls[index] += 1;
    if (index === 1 && !secondFailed) {
      secondFailed = true;
      throw Object.assign(new Error('injected second inspection failure'), {
        code: 'FAKE_ENTRY_INSPECTION_FAILED',
      });
    }
    return index === 0 ? first.result : second.result;
  }, {
    inspectReleaseArtifacts: async () => releaseArtifactEvidence(fixture),
  });
  let handle = pipeline.openRelease(fixture.plan);
  await handle.initialize();
  await assert.rejects(handle.verifyEntries('owner'), { code: 'FAKE_ENTRY_INSPECTION_FAILED' });
  assert.equal((await handle.inspect()).entryObjectHashes.length, 1);
  handle = pipeline.openRelease(fixture.plan);
  assert.equal((await handle.verifyEntries('owner')).phase, 'entries-verified');
  assert.deepEqual(calls, [1, 2]);
  assert.equal((await handle.verifyEntries('owner')).phase, 'release-verified');
  assert.equal((await handle.inspect()).entryObjectHashes.length, 2);
});

test('persisted global artifact evidence is reused after a post-CAS exception', async (t) => {
  let root = await temporaryRoot(t, 'cv-audio-global-evidence-');
  let fixture = await planFixture({ regenerateIndex: 0 });
  let base = createCvShowAudioPipelineStorage({ storageRoot: root });
  let injected = false;
  let storage = {
    openRun(identity) {
      let run = base.openRun(identity);
      return {
        ...run,
        async compareAndSwapHead(expected, next) {
          let state = await run.readObject(next);
          await run.compareAndSwapHead(expected, next);
          if (
            !injected
            && state.phase === 'entries-verified'
            && state.releaseArtifactEvidenceHash
            && !state.releaseObjectHash
          ) {
            injected = true;
            throw Object.assign(new Error('injected after global evidence CAS'), {
              code: 'FAKE_POST_GLOBAL_CAS_FAILURE',
            });
          }
        },
      };
    },
  };
  let releaseInspections = 0;
  let pipeline = pipelineFor(root, async () => ({
    stateHash: fixture.generatedStateHash,
    state: fixture.generatedState,
    entryRelease: fixture.generatedRelease,
  }), {
    storage,
    inspectReleaseArtifacts: async () => {
      releaseInspections += 1;
      return releaseArtifactEvidence(fixture);
    },
  });
  let handle = pipeline.openRelease(fixture.plan);
  await handle.initialize();
  assert.equal((await handle.verifyEntries('owner')).phase, 'entries-verified');
  await assert.rejects(handle.verifyEntries('owner'), { code: 'FAKE_POST_GLOBAL_CAS_FAILURE' });
  handle = pipeline.openRelease(fixture.plan);
  assert.equal((await handle.verifyEntries('owner')).phase, 'release-verified');
  assert.equal(releaseInspections, 1);
});

test('an explicit all-reuse artifact refresh rebuilds aggregate manifest evidence', async (t) => {
  let fixture = await planFixture();
  fixture.plan.refreshArtifacts = true;
  let inspections = 0;
  let handle = pipelineFor(
    await temporaryRoot(t, 'cv-show-refresh-artifacts-'),
    async () => {
      throw new Error('all-reuse refresh must not inspect entry runners');
    },
    {
      inspectReleaseArtifacts: async () => {
        inspections += 1;
        return releaseArtifactEvidence(fixture);
      },
    },
  ).openRelease(fixture.plan);

  await advanceToVerified(handle);
  assert.equal(inspections, 1);
});

test('timing-only all-reuse release preserves media IDs while aggregate provenance advances', async (t) => {
  let root = await temporaryRoot(t, 'cv-audio-timing-');
  let baseline = await planFixture();
  let project = changedTimingProject();
  let timing = await planFixture({ project });
  timing.plan.entries = baseline.plan.entries.map((entry) => ({
    entryId: entry.entryId,
    mode: 'reuse',
    release: entry.release,
  }));
  timing.plan.predecessor.release = baseline.predecessor;
  let captured;
  let handle = pipelineFor(root, async () => undefined, {
    stageRelease: async (aggregate) => {
      captured = aggregate;
      return { status: 'staged' };
    },
  }).openRelease(timing.plan);
  await advanceToVerified(handle);
  await handle.approve({ ownerToken: 'owner', approved: true });
  await handle.stage('owner');

  assert.deepEqual(
    captured.release.entryReleaseIds,
    baseline.releases.map(({ entryReleaseId }) => entryReleaseId),
  );
  assert.equal(captured.release.acceptedProvenance.hash, timing.plan.provenance.hash);
  assert.notEqual(captured.release.acceptedProvenance.hash, baseline.plan.provenance.hash);
  assert.equal(captured.release.manifests.locale, baseline.predecessor.manifests.locale);
  assert.equal(captured.release.manifests.voice, baseline.predecessor.manifests.voice);
  assert.deepEqual(captured.release.manifests.audio, baseline.predecessor.manifests.audio);
  assert.deepEqual(captured.release.manifests.alignment, baseline.predecessor.manifests.alignment);
  assert.equal(
    captured.release.manifests.directory,
    captured.release.artifactTreeHash.split(':').at(-1),
  );
  assert.notEqual(
    captured.release.manifests.directory,
    baseline.predecessor.manifests.directory,
  );
});

test('bootstrap provenance reopens directly for runtime, scoped narration, and all-voice dirtiness', () => {
  assert.equal(CV_SHOW_AUDIO_RELEASE.acceptedProvenance.schemaVersion, 'cv-show-audio-provenance-v1');
  let same = planCvShowAudioDirtySet({
    accepted: CV_SHOW_AUDIO_RELEASE.acceptedProvenance,
    project: CV_SHOW_PRESENTATION_PROJECT,
    ...PROFILE,
  });
  assert.deepEqual(same.dirty, {
    synthesis: [],
    transcription: [],
    alignment: [],
    runtimeProjection: CV_SHOW_AUDIO_RELEASE.acceptedProvenance.entries.map(({ entryId }) => entryId),
  });
  let narrationInput = presentationAuthoringProjectCanonicalProjection(CV_SHOW_PRESENTATION_PROJECT);
  narrationInput.revision += 1;
  let narration = narrationInput.cells.find((cell) => cell.kind === 'narration');
  narration.turn.text += ' Изменение.';
  let changed = createPresentationAuthoringProject(narrationInput);
  let scoped = planCvShowAudioDirtySet({
    accepted: CV_SHOW_AUDIO_RELEASE.acceptedProvenance,
    project: changed,
    ...PROFILE,
  });
  assert.deepEqual(scoped.dirty.synthesis, [narration.turn.id]);
  let voice = planCvShowAudioDirtySet({
    accepted: CV_SHOW_AUDIO_RELEASE.acceptedProvenance,
    project: CV_SHOW_PRESENTATION_PROJECT,
    ...PROFILE,
    voice: { ...PROFILE.voice, style: 'changed' },
  });
  assert.equal(voice.dirty.synthesis.length, 30);
  assert.equal(voice.dirty.transcription.length, 30);
  assert.equal(voice.dirty.alignment.length, 30);
});

test('temporary promotion retains the approved private release manifest identity', async (t) => {
  let fixture = await repositoryFixture(t);
  let promotion = createCvShowAudioPromotion({
    repoRoot: fixture.repoRoot,
    privateRoot: fixture.privateRoot,
    sourceStorageRoot: fixture.sourceStorageRoot,
    verifyArtifacts: fixture.verifyArtifacts,
  });
  let approvedAggregate;
  let pipeline = pipelineFor(fixture.storageRoot, async () => undefined, {
    stageRelease: async (aggregate) => {
      approvedAggregate = aggregate;
      return promotion.stageRelease(aggregate);
    },
    promoteRelease: promotion.promoteRelease,
  });
  let handle = pipeline.openRelease(fixture.plan);
  await advanceToVerified(handle);
  await handle.approve({ ownerToken: 'owner', approved: true });
  assert.equal((await handle.stage('owner')).phase, 'staged');
  assert.equal((await handle.promote('owner')).phase, 'promoted');
  let selected = await import(`${new URL(fixture.source, import.meta.url).href}?selected=${Date.now()}`);
  assert.equal(selected.CV_SHOW_AUDIO_RELEASE.project.authoringProjectHash, selected.CV_SHOW_PRESENTATION_PROJECT.hash);
  assert.equal(
    selected.CV_SHOW_AUDIO_RELEASE.manifests.voice,
    approvedAggregate.release.manifests.voice,
  );
  assert.equal(
    selected.CV_SHOW_AUDIO_RELEASE.manifests.directory,
    approvedAggregate.release.manifests.directory,
  );
  assert.deepEqual(
    selected.CV_SHOW_AUDIO_RELEASE.manifests.audio,
    approvedAggregate.release.manifests.audio,
  );
  assert.deepEqual(
    selected.CV_SHOW_AUDIO_RELEASE.manifests.alignment,
    approvedAggregate.release.manifests.alignment,
  );
  let state = await handle.inspect();
  assert.equal(state.receipt.receiptId.startsWith('cv-show-audio-promotion-receipt-v1:'), true);
  assert.notEqual(state.approval.approvalId, selected.CV_SHOW_AUDIO_RELEASE.releaseId);
  assert.notEqual(state.approval.approvalId, selected.CV_SHOW_AUDIO_RELEASE.artifactTreeHash);
  assert.notEqual(state.receipt.receiptId, selected.CV_SHOW_AUDIO_RELEASE.releaseId);
  assert.notEqual(state.receipt.receiptId, selected.CV_SHOW_AUDIO_RELEASE.artifactTreeHash);
});

test('three promotion failpoint exceptions unwind locks and reconcile side effects', async (t) => {
  for (let point of ['before-tree-rename', 'after-tree-rename', 'after-source-rename']) {
    let fixture = await repositoryFixture(t);
    let injected = false;
    let promotion = createCvShowAudioPromotion({
      repoRoot: fixture.repoRoot,
      privateRoot: fixture.privateRoot,
      sourceStorageRoot: fixture.sourceStorageRoot,
      verifyArtifacts: fixture.verifyArtifacts,
      failpoint: async (name) => {
        if (!injected && name === point) {
          injected = true;
          throw Object.assign(new Error(`injected ${point}`), {
            code: 'CV_SHOW_AUDIO_PROMOTION_FAILPOINT',
          });
        }
      },
    });
    let pipeline = pipelineFor(fixture.storageRoot, async () => undefined, promotion);
    let handle = pipeline.openRelease(fixture.plan);
    await advanceToVerified(handle);
    await handle.approve({ ownerToken: 'owner', approved: true });
    if (point === 'after-source-rename') {
      await handle.stage('owner');
      await assert.rejects(handle.promote('owner'), { code: 'CV_SHOW_AUDIO_PROMOTION_FAILPOINT' });
      handle = pipeline.openRelease(fixture.plan);
      assert.equal((await handle.promote('owner')).phase, 'promoted');
    } else {
      let sourceBefore = await readFile(fixture.source);
      await assert.rejects(handle.stage('owner'), { code: 'CV_SHOW_AUDIO_PROMOTION_FAILPOINT' });
      assert.deepEqual(await readFile(fixture.source), sourceBefore);
      handle = pipeline.openRelease(fixture.plan);
      assert.equal((await handle.stage('owner')).phase, 'staged');
      assert.equal((await handle.promote('owner')).phase, 'promoted');
    }
  }
});

test('tree, verifier, and source conflicts fail without selecting the candidate', async (t) => {
  for (let mode of ['tree', 'verify', 'source']) {
    let fixture = await repositoryFixture(t);
    let sourceBefore = await readFile(fixture.source);
    let verifyArtifacts = mode === 'verify'
      ? async () => { throw Object.assign(new Error('forged manifest'), { code: 'FAKE_MANIFEST' }); }
      : fixture.verifyArtifacts;
    let promotion = createCvShowAudioPromotion({
      repoRoot: fixture.repoRoot,
      privateRoot: fixture.privateRoot,
      sourceStorageRoot: fixture.sourceStorageRoot,
      verifyArtifacts,
    });
    let pipeline = pipelineFor(fixture.storageRoot, async () => undefined, promotion);
    let handle = pipeline.openRelease(fixture.plan);
    await advanceToVerified(handle);
    await handle.approve({ ownerToken: 'owner', approved: true });
    if (mode === 'tree') {
      let final = path.join(
        fixture.privateRoot,
        fixture.predecessor.manifests.voice,
        fixture.fake.tree.artifactTreeHash.split(':').at(-1),
      );
      await mkdir(final, { recursive: true });
      await writeFile(path.join(final, 'extra'), 'conflict');
      await assert.rejects(handle.stage('owner'));
    } else if (mode === 'verify') {
      await assert.rejects(handle.stage('owner'), { code: 'FAKE_MANIFEST' });
    } else {
      await handle.stage('owner');
      await writeFile(fixture.source, `${sourceBefore.toString('utf8')}\n`);
      let changed = await readFile(fixture.source);
      await assert.rejects(handle.promote('owner'), { code: 'CV_SHOW_AUDIO_PROMOTION_SOURCE_STALE' });
      assert.deepEqual(await readFile(fixture.source), changed);
      continue;
    }
    assert.deepEqual(await readFile(fixture.source), sourceBefore);
  }
});

test('legacy materialization blocks before source or storage access', async () => {
  await assert.rejects(materializeCvShowAuthoringDraft({
    repoRoot: '/definitely/missing/repository',
    storageRoot: '/definitely/missing/storage',
  }), { code: 'CV_SHOW_AUTHORING_AUDIO_RELEASE_REQUIRED' });
});

test('predecessor symlink is rejected without source mutation', async (t) => {
  let fixture = await repositoryFixture(t);
  let sourceBefore = await readFile(fixture.source);
  let predecessor = path.join(
    fixture.privateRoot,
    fixture.predecessor.manifests.voice,
    fixture.predecessor.manifests.directory,
  );
  let artifact = path.join(predecessor, '01.wav');
  await rm(artifact);
  await symlink('02.wav', artifact);
  assert.equal((await lstat(artifact)).isSymbolicLink(), true);
  let promotion = createCvShowAudioPromotion({
    repoRoot: fixture.repoRoot,
    privateRoot: fixture.privateRoot,
    sourceStorageRoot: fixture.sourceStorageRoot,
    verifyArtifacts: fixture.verifyArtifacts,
  });
  let handle = pipelineFor(fixture.storageRoot, async () => undefined, promotion)
    .openRelease(fixture.plan);
  await advanceToVerified(handle);
  await handle.approve({ ownerToken: 'owner', approved: true });
  await assert.rejects(handle.stage('owner'), { code: 'CV_SHOW_AUDIO_PROMOTION_SYMLINK' });
  assert.deepEqual(await readFile(fixture.source), sourceBefore);
});
