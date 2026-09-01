import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { cp, mkdir, mkdtemp, readFile, rm, stat, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { pathToFileURL } from 'node:url';

import {
  createPresentationAuthoringProject,
  presentationAuthoringProjectCanonicalProjection,
} from 'symbiote-workspace';
import {
  canonicalize,
  computeIntegrity,
} from 'symbiote-workspace/schema/canonical-json.js';

import {
  createCvShowAudioWorkflow,
  createCvShowAudioWorkflowAdapters,
  createCvShowAudioBoundProject,
  createCvShowAudioWorkflowPlan,
  loadCvShowPredecessorEntryReleases,
  loadCvShowAudioWorkflowCurrentSource,
  publishCvShowAudioWorkflowRelease,
} from '../../scripts/cv-show-audio-workflow.js';
import {
  createCvShowMediaBindingRegistry,
} from '../../src/static-pages/js/tour-player/presentationProjectAdapter.js';
import {
  createCvShowAudioReleaseDescriptor,
  createCvShowAudioReleasePipeline,
} from '../../scripts/cv-show-audio-pipeline.js';
import {
  createCvShowAudioPipelineRunner,
} from '../../scripts/cv-show-audio-pipeline-runner.js';
import {
  createCvShowAudioPipelineStorage,
} from '../../scripts/cv-show-audio-pipeline-storage.js';
import {
  CV_SHOW_AUDIO_RELEASE,
  CV_SHOW_PRESENTATION_PROJECT,
} from '../../src/static-pages/data/cvShowPresentationProject.js';
import {
  CV_SHOW_WEB_AUDIO_RELEASE,
} from '../../src/static-pages/data/cvShowWebAudioRelease.js';
import {
  verifyCvShowPrivateArtifacts,
} from '../../scripts/verify-cv-show-private-artifacts.js';
import {
  CV_SHOW_STRUCTURAL_MEDIA_FIXTURE,
} from '../fixtures/cvShowStructuralMedia.js';

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
  readinessProfile: {
    ready: true,
    status: 'ready',
    model: 'qwen3-clone+whisper-large-v3',
    modelVersion: 'qwen-revision-a|whisper-revision-a',
    accelerator: 'cuda',
    capabilities: ['synthesize', 'transcribe'],
  },
});

const PROJECT_FACTORY_URL = pathToFileURL(path.resolve(
  'node_modules/symbiote-workspace/browser.js',
)).href;

function sha256(value) {
  return createHash('sha256').update(value).digest('hex');
}

function contentId(schemaVersion, value) {
  return `${schemaVersion}:${sha256(Buffer.from(canonicalize(value), 'utf8'))}`;
}

function sourceSelectionModule({ projectInput, release, projectExport }) {
  return `import { createPresentationAuthoringProject } from ${JSON.stringify(PROJECT_FACTORY_URL)};
export const CV_SHOW_AUTHORING_PROJECT_INPUT =
/* CV_SHOW_AUTHORING_PROJECT_INPUT:START */
${JSON.stringify(projectInput, null, 2)}
/* CV_SHOW_AUTHORING_PROJECT_INPUT:END */;
export const CV_SHOW_AUDIO_RELEASE =
/* CV_SHOW_AUDIO_RELEASE_INPUT:START */
${JSON.stringify(release, null, 2)}
/* CV_SHOW_AUDIO_RELEASE_INPUT:END */;
export const CV_SHOW_PRESENTATION_PROJECT = ${projectExport
    || 'createPresentationAuthoringProject(CV_SHOW_AUTHORING_PROJECT_INPUT)'};
`;
}

function releaseForProject(project) {
  let input = structuredClone(CV_SHOW_AUDIO_RELEASE);
  delete input.releaseId;
  input.project = {
    revision: project.revision,
    authoringProjectHash: project.hash,
  };
  return createCvShowAudioReleaseDescriptor(input);
}

async function writeSourceSelectionRepo(root, source) {
  let sourcePath = path.join(root, 'src/static-pages/data/cvShowPresentationProject.js');
  await mkdir(path.dirname(sourcePath), { recursive: true });
  await writeFile(path.join(root, 'package.json'), '{"type":"module"}\n');
  await writeFile(sourcePath, source);
  return sourcePath;
}

test('workflow current-source loader reads a real-shaped legacy v1 factory without executing it', async (t) => {
  let repoRoot = await mkdtemp(path.join(tmpdir(), 'cv-show-workflow-legacy-source-'));
  t.after(() => rm(repoRoot, { recursive: true, force: true }));
  let projectInput = presentationAuthoringProjectCanonicalProjection(
    CV_SHOW_PRESENTATION_PROJECT,
  );
  projectInput.schemaVersion = 'workspace-presentation-authoring-project-v1';
  projectInput.revision = 53;
  let project = {
    ...projectInput,
    hash: `${projectInput.schemaVersion}:${computeIntegrity(projectInput)}`,
  };
  let release = releaseForProject(project);
  let source = sourceSelectionModule({ projectInput, release });
  let sourcePath = await writeSourceSelectionRepo(repoRoot, source);

  await assert.rejects(import(
    `${pathToFileURL(sourcePath).href}?unguarded-factory=${Date.now()}`
  ));

  let loaded = await loadCvShowAudioWorkflowCurrentSource(repoRoot);

  assert.equal(loaded.sourcePath, sourcePath);
  assert.equal(loaded.bytes.toString('utf8'), source);
  assert.equal(loaded.CV_SHOW_PRESENTATION_PROJECT.hash, project.hash);
  assert.equal(loaded.CV_SHOW_AUDIO_RELEASE.releaseId, release.releaseId);
  assert.equal(await readFile(sourcePath, 'utf8'), source);
});

test('workflow current-source loader rejects forged legacy and invalid v2 evidence without a write', async (t) => {
  let repoRoot = await mkdtemp(path.join(tmpdir(), 'cv-show-workflow-source-reject-'));
  t.after(() => rm(repoRoot, { recursive: true, force: true }));
  let projectInput = presentationAuthoringProjectCanonicalProjection(
    CV_SHOW_PRESENTATION_PROJECT,
  );
  projectInput.schemaVersion = 'workspace-presentation-authoring-project-v1';
  projectInput.revision = 53;
  let project = {
    ...projectInput,
    hash: `${projectInput.schemaVersion}:${computeIntegrity(projectInput)}`,
  };
  let forgedRelease = {
    ...releaseForProject(project),
    releaseId: `cv-show-audio-release-v1:${'f'.repeat(64)}`,
  };
  let forgedSource = sourceSelectionModule({ projectInput, release: forgedRelease });
  let sourcePath = await writeSourceSelectionRepo(repoRoot, forgedSource);
  await assert.rejects(loadCvShowAudioWorkflowCurrentSource(repoRoot), {
    code: 'CV_SHOW_AUTHORING_SOURCE_STALE',
  });
  assert.equal(await readFile(sourcePath, 'utf8'), forgedSource);

  let v2Input = presentationAuthoringProjectCanonicalProjection(CV_SHOW_PRESENTATION_PROJECT);
  let invalidV2Source = sourceSelectionModule({
    projectInput: v2Input,
    release: CV_SHOW_AUDIO_RELEASE,
    projectExport: JSON.stringify({
      schemaVersion: 'workspace-presentation-authoring-project-v2',
      id: 'cv-show',
    }),
  });
  await writeFile(sourcePath, invalidV2Source);
  await assert.rejects(loadCvShowAudioWorkflowCurrentSource(repoRoot), {
    code: 'PRESENTATION_AUTHORING_PROJECT_INVALID',
  });
  assert.equal(await readFile(sourcePath, 'utf8'), invalidV2Source);
});

function acceptedPublicFixture(release = CV_SHOW_AUDIO_RELEASE) {
  let manifest = {
    schemaVersion: 'cv-show-web-audio-release-v1',
    releaseId: 'cv-show-web-audio-release-v1:historical',
    revision: 'historical',
    voiceId: release.manifests.voice,
    locale: release.manifests.locale,
    source: {
      masterReleaseId: 'cv-show-audio-release-v1:historical',
      masterArtifactTreeHash: release.artifactTreeHash,
      audioManifestSha256: release.manifests.audio.sha256,
      alignmentManifestSha256: release.manifests.alignment.sha256,
      voiceIdentityHash: release.acceptedProvenance.voiceIdentityHash,
    },
  };
  let manifestBytes = Buffer.from(`${canonicalize(manifest)}\n`, 'utf8');
  let selector = {
    schemaVersion: 'cv-show-web-audio-selector-v1',
    releaseId: manifest.releaseId,
    sourceMasterReleaseId: manifest.source.masterReleaseId,
    voiceId: manifest.voiceId,
    locale: manifest.locale,
    revision: manifest.revision,
    manifest: {
      path: `${manifest.voiceId}/${manifest.revision}/manifest.json`,
      sha256: sha256(manifestBytes),
      bytes: manifestBytes.byteLength,
    },
  };
  return { selector, manifest, manifestBytes };
}

test('artifact-equivalent public release records deterministic reuse and never invokes publisher', async (t) => {
  let privateRoot = await mkdtemp(path.join(tmpdir(), 'cv-show-public-reuse-'));
  t.after(() => rm(privateRoot, { recursive: true, force: true }));
  let publisherCalls = 0;
  let input = {
    privateRoot,
    repoRoot: path.resolve('.'),
    release: CV_SHOW_AUDIO_RELEASE,
    project: CV_SHOW_PRESENTATION_PROJECT,
    acceptedPublic: acceptedPublicFixture(),
    publisher: async () => {
      publisherCalls += 1;
      throw new Error('artifact-equivalent release must not transcode');
    },
  };
  let first = await publishCvShowAudioWorkflowRelease(input);
  let before = await stat(first.receipt.path);
  let second = await publishCvShowAudioWorkflowRelease(input);
  let after = await stat(second.receipt.path);
  assert.equal(first.status, 'reused');
  assert.match(first.receiptId, /^cv-show-web-audio-workflow-reuse-v1:[a-f0-9]{64}$/u);
  assert.equal(publisherCalls, 0);
  assert.deepEqual(second, first);
  assert.equal(after.mtimeMs, before.mtimeMs);
  await assert.rejects(publishCvShowAudioWorkflowRelease({
    privateRoot,
    repoRoot: path.resolve('.'),
    release: CV_SHOW_AUDIO_RELEASE,
    project: CV_SHOW_PRESENTATION_PROJECT,
    publisher: input.publisher,
  }), (error) => {
    assert.equal(error.code, 'CV_SHOW_AUDIO_WORKFLOW_PUBLIC_REUSE_PROOF_UNAVAILABLE');
    assert.match(error.message, /--public-selector/u);
    assert.match(error.message, /--public-manifest/u);
    return true;
  });
});

test('changed private media identity invokes the existing publisher exactly once', async (t) => {
  let privateRoot = await mkdtemp(path.join(tmpdir(), 'cv-show-public-change-'));
  t.after(() => rm(privateRoot, { recursive: true, force: true }));
  let changed = {
    ...CV_SHOW_AUDIO_RELEASE,
    artifactTreeHash: 'cv-show-audio-artifact-tree-v1:changed-media',
  };
  let publisherCalls = 0;
  let result = await publishCvShowAudioWorkflowRelease({
    privateRoot,
    repoRoot: path.resolve('.'),
    release: changed,
    project: CV_SHOW_PRESENTATION_PROJECT,
    acceptedPublic: acceptedPublicFixture(),
    publisher: async ({ release }) => {
      publisherCalls += 1;
      assert.equal(release, changed);
      return { status: 'published', releaseId: 'cv-show-web-audio-release-v1:new' };
    },
  });
  assert.equal(publisherCalls, 1);
  assert.equal(result.status, 'published');
});

function fakeEntryReleases() {
  let accepted = CV_SHOW_AUDIO_RELEASE.acceptedProvenance;
  return accepted.entries.map((entry, index) => {
    let prefix = String(index + 1).padStart(2, '0');
    let projection = {
      schemaVersion: 'cv-show-audio-entry-release-v1',
      entryId: entry.entryId,
      mediaInput: {
        entryId: entry.entryId,
        narrationInputHash: entry.narrationInputHash,
        synthesisInputHash: entry.synthesisInputHash,
        voiceIdentityHash: accepted.voiceIdentityHash,
        synthesisPolicyHash: accepted.synthesisPolicyHash,
        asrProfileHash: accepted.asrProfileHash,
        alignerContractHash: accepted.alignerContractHash,
      },
      wav: { path: `${prefix}.wav`, sha256: `${prefix}`.repeat(32), size: index + 1 },
      recognition: {
        path: `alignment/base/recognized/${prefix}.json`,
        sha256: sha256(`recognition-${prefix}`),
        size: index + 31,
      },
      alignment: {
        path: `alignment/base/aligned/${prefix}.json`,
        sha256: sha256(`alignment-${prefix}`),
        size: index + 61,
      },
      verification: {
        timingCoverage: 1,
        alignedSequenceHash: `workspace-aligned-sequence-v3:sha256-${prefix}`,
        timelineHash: `presentation-timeline-v3:sha256-${prefix}`,
      },
    };
    return {
      ...projection,
      entryReleaseId: contentId('cv-show-audio-entry-release-v1', projection),
    };
  });
}

function predecessorFixture() {
  let releases = fakeEntryReleases();
  let projection = structuredClone(CV_SHOW_AUDIO_RELEASE);
  delete projection.releaseId;
  projection.entryReleaseIds = releases.map(({ entryReleaseId }) => entryReleaseId);
  projection.manifests = {
    ...projection.manifests,
    alignment: { ...projection.manifests.alignment, path: 'alignment/base/manifest.json' },
    directory: 'predecessor-tree',
  };
  return {
    releases,
    release: createCvShowAudioReleaseDescriptor(projection),
  };
}

function changedNarrationProject() {
  let input = presentationAuthoringProjectCanonicalProjection(CV_SHOW_PRESENTATION_PROJECT);
  input.revision += 1;
  input.cells.find(({ kind }) => kind === 'narration').turn.text += ' Дополнение.';
  return createPresentationAuthoringProject(input);
}

function structuralBindingFixtures() {
  let audioManifest = structuredClone(CV_SHOW_STRUCTURAL_MEDIA_FIXTURE.audioManifest);
  let alignmentManifest = structuredClone(CV_SHOW_STRUCTURAL_MEDIA_FIXTURE.alignmentManifest);
  let sequences = new Map();
  for (let audio of audioManifest.clips) audio.speechSha256 = sha256(audio.speech);
  for (let alignment of alignmentManifest.clips) {
    let sequence = CV_SHOW_STRUCTURAL_MEDIA_FIXTURE.sequence(alignment.id);
    let projection = structuredClone(sequence);
    delete projection.hash;
    sequence.hash = `${sequence.contractVersion}:${computeIntegrity(projection)}`;
    alignment.alignedSequenceHash = sequence.hash;
    alignment.alignedSequenceSha256 = sha256(Buffer.from(
      `${JSON.stringify(sequence, null, 2)}\n`,
      'utf8',
    ));
    sequences.set(alignment.id, sequence);
  }
  return {
    audioManifest,
    alignmentManifest,
    sequences,
  };
}

function currentManifestFixtures() {
  let narrationById = new Map(CV_SHOW_PRESENTATION_PROJECT.cells
    .filter(({ kind }) => kind === 'narration')
    .map(({ turnId, turn }) => [turnId, turn.text]));
  let sourceEntries = CV_SHOW_PRESENTATION_PROJECT.script.metadata.cvShow.entries;
  let entryIds = [...narrationById.keys()];
  return {
    audioManifest: {
      clips: entryIds.map((id) => ({
        id,
        speech: narrationById.get(id),
        speechSha256: sha256(narrationById.get(id)),
        sha256: sourceEntries[id].media.wavHash.replace(/^sha256:/u, ''),
      })),
    },
    alignmentManifest: {
      clips: entryIds.map((id) => ({
        id,
        mediaDurationMs: sourceEntries[id].media.durationMilliseconds,
        alignedSequenceHash: sourceEntries[id].media.sourceAlignedSequenceHash,
        alignedSequenceSha256: sourceEntries[id].media.sourceAlignmentFileHash
          .replace(/^sha256:/u, ''),
        timelineHash: sourceEntries[id].media.sourceTimelineHash,
      })),
    },
  };
}

test('changed canonical narration rejects an old WAV before rewriting its narration hash', () => {
  let project = changedNarrationProject();
  assert.throws(() => createCvShowAudioBoundProject({
    project,
    ...structuralBindingFixtures(),
  }), { code: 'CV_SHOW_AUDIO_WORKFLOW_MEDIA_BINDING_INVALID' });
});

test('v2 binding rejects an omitted aligned-sequence set', () => {
  let { audioManifest, alignmentManifest } = currentManifestFixtures();
  assert.throws(() => createCvShowAudioBoundProject({
    project: CV_SHOW_PRESENTATION_PROJECT,
    audioManifest,
    alignmentManifest,
  }), { code: 'CV_SHOW_AUDIO_WORKFLOW_MEDIA_BINDING_INVALID' });
});

test('v2 binding rejects a stale declared aligned-sequence SHA', () => {
  let binding = structuralBindingFixtures();
  binding.alignmentManifest.clips[0].alignedSequenceSha256 = '0'.repeat(64);
  assert.throws(() => createCvShowAudioBoundProject({
    project: CV_SHOW_PRESENTATION_PROJECT,
    ...binding,
  }), { code: 'CV_SHOW_AUDIO_CLIP_MIGRATION_INVALID' });
});

test('binding rejects a forged speech hash even when canonical speech matches', () => {
  let binding = structuralBindingFixtures();
  binding.audioManifest.clips[0].speechSha256 = '0'.repeat(64);
  assert.throws(() => createCvShowAudioBoundProject({
    project: CV_SHOW_PRESENTATION_PROJECT,
    ...binding,
  }), { code: 'CV_SHOW_AUDIO_WORKFLOW_MEDIA_BINDING_INVALID' });
});

test('changed verified media rebuilds the v2 audio graph without losing newer authored cues', () => {
  let project = CV_SHOW_PRESENTATION_PROJECT;
  let binding = structuralBindingFixtures();
  let semanticMetadata = (value) => {
    let metadata = structuredClone(value.script.metadata.cvShow);
    for (let entry of Object.values(metadata.entries)) delete entry.media;
    return metadata;
  };
  let nonAudioCellIds = project.cells
    .filter(({ kind }) => kind !== 'audio-clip')
    .map(({ id }) => id);
  let nonAudioLayerIds = project.layers
    .filter(({ kind }) => kind !== 'audio')
    .map(({ id }) => id);
  let authoredMetadata = semanticMetadata(project);
  let authoredCues = new Map(project.cells
    .filter(({ kind }) => kind === 'cue')
    .map(({ id, cue }) => [id, structuredClone(cue)]));
  let sequences = binding.sequences;

  let bound = createCvShowAudioBoundProject({
    project,
    audioManifest: binding.audioManifest,
    alignmentManifest: binding.alignmentManifest,
    sequences,
  });
  let registry = createCvShowMediaBindingRegistry(bound);
  let positioningAudio = binding.audioManifest.clips
    .find(({ id }) => id === 'positioning');
  let positioningAlignment = binding.alignmentManifest.clips
    .find(({ id }) => id === 'positioning');
  let positioningAsset = bound.assets.find(({ id }) => id === 'cv-show:audio:positioning');
  let positioningClips = bound.cells
    .filter(({ kind, turnId }) => kind === 'audio-clip' && turnId === 'positioning')
    .sort((left, right) => left.audio.sourceInMs - right.audio.sourceInMs);

  assert.equal(bound.schemaVersion, 'workspace-presentation-authoring-project-v2');
  assert.equal(bound.revision, project.revision + 1);
  assert.deepEqual(
    bound.cells.filter(({ kind }) => kind !== 'audio-clip').map(({ id }) => id),
    nonAudioCellIds,
  );
  assert.deepEqual(
    bound.layers.filter(({ kind }) => kind !== 'audio').map(({ id }) => id),
    nonAudioLayerIds,
  );
  assert.deepEqual(semanticMetadata(bound), authoredMetadata);
  assert.deepEqual(
    new Map(bound.cells
      .filter(({ kind }) => kind === 'cue')
      .map(({ id, cue }) => [id, cue])),
    authoredCues,
  );
  assert.equal(positioningAsset.contentHash, `sha256:${positioningAudio.sha256}`);
  assert.equal(positioningAsset.durationMs, positioningAlignment.mediaDurationMs);
  assert.equal(positioningAsset.alignmentHash, positioningAlignment.alignedSequenceHash);
  assert.equal(positioningClips.at(-1).audio.sourceOutMs, positioningAlignment.mediaDurationMs);
  assert.equal(Object.keys(registry.entries).length, 30);
  assert.equal(Object.values(registry.entries).every(({ playable }) => playable), true);

  let tamperedSequences = new Map(sequences);
  let tampered = structuredClone(tamperedSequences.get('positioning'));
  tampered.media.durationMs += 1;
  tamperedSequences.set('positioning', tampered);
  assert.throws(() => createCvShowAudioBoundProject({
    project,
    audioManifest: binding.audioManifest,
    alignmentManifest: binding.alignmentManifest,
    sequences: tamperedSequences,
  }), { code: 'CV_SHOW_AUDIO_CLIP_MIGRATION_INVALID' });

  let staleHashSequences = new Map(sequences);
  let staleHashSequence = structuredClone(staleHashSequences.get('positioning'));
  staleHashSequence.turns[0].words[0].text = 'подменено';
  staleHashSequences.set('positioning', staleHashSequence);
  assert.throws(() => createCvShowAudioBoundProject({
    project,
    audioManifest: binding.audioManifest,
    alignmentManifest: binding.alignmentManifest,
    sequences: staleHashSequences,
  }), { code: 'CV_SHOW_AUDIO_CLIP_MIGRATION_INVALID' });
});

function workflowPlan({ project = CV_SHOW_PRESENTATION_PROJECT, voice = PROFILE.voice } = {}) {
  let predecessor = predecessorFixture();
  return {
    predecessor,
    workflow: createCvShowAudioWorkflowPlan({
      project,
      predecessorRelease: predecessor.release,
      predecessorEntryReleases: predecessor.releases,
      ...PROFILE,
      voice,
      sourceSha256: `sha256:${'a'.repeat(64)}`,
    }),
  };
}

test('one narration edit regenerates one entry while a voice change regenerates all 30', () => {
  let scoped = workflowPlan({ project: changedNarrationProject() });
  assert.equal(scoped.workflow.dispositions.filter(({ mode }) => mode === 'regenerate').length, 1);
  assert.deepEqual(scoped.workflow.dirty.synthesis, ['positioning']);
  assert.equal(
    scoped.workflow.plan.entries[1].release.entryReleaseId,
    scoped.predecessor.releases[1].entryReleaseId,
  );

  let voice = workflowPlan({ voice: { ...PROFILE.voice, style: 'new approved delivery' } });
  assert.equal(voice.workflow.dispositions.filter(({ mode }) => mode === 'regenerate').length, 30);
  assert.equal(voice.workflow.dirty.transcription.length, 30);
  assert.equal(voice.workflow.dirty.alignment.length, 30);
});

test('workflow output is accepted directly by the durable aggregate release pipeline', async (t) => {
  let root = await mkdtemp(path.join(tmpdir(), 'cv-show-workflow-plan-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  let { workflow } = workflowPlan({ project: changedNarrationProject() });
  let pipeline = createCvShowAudioReleasePipeline({
    storage: createCvShowAudioPipelineStorage({ storageRoot: root }),
    inspectEntry: async () => { throw new Error('not expected during initialization'); },
    inspectReleaseArtifacts: async () => { throw new Error('not expected'); },
    stageRelease: async () => ({ status: 'not expected' }),
    promoteRelease: async () => ({ status: 'not expected' }),
  });
  let state = await pipeline.openRelease(workflow.plan).initialize();
  assert.equal(state.phase, 'entries-pending');
  assert.equal(state.planId, workflow.planId);
});

test('a missing predecessor after restart stops with its exact recovery path', async (t) => {
  let root = await mkdtemp(path.join(tmpdir(), 'cv-show-workflow-missing-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  let predecessor = predecessorFixture();
  await assert.rejects(loadCvShowPredecessorEntryReleases({
    privateRoot: root,
    release: predecessor.release,
    project: CV_SHOW_PRESENTATION_PROJECT,
    verifyPrivateArtifacts: async () => {
      throw Object.assign(new Error('missing'), { code: 'CV_SHOW_PRIVATE_ARTIFACTS_MISSING' });
    },
  }), (error) => {
    assert.equal(error.code, 'CV_SHOW_AUDIO_WORKFLOW_PREDECESSOR_MISSING');
    assert.equal(
      error.details.payloadRoot,
      path.join(root, predecessor.release.manifests.voice, predecessor.release.manifests.directory),
    );
    return true;
  });
});

function createWav() {
  return Buffer.from('RIFF-real-test-wav-bytes', 'utf8');
}

function transcriptFor(text) {
  let tokens = [...text.matchAll(/[\p{L}\p{N}]+/gu)].map(({ 0: word }) => word);
  return {
    text,
    durationSec: 10,
    words: tokens.map((word, index) => ({
      word,
      startSec: Number((index * 0.02).toFixed(3)),
      endSec: Number((index * 0.02 + 0.01).toFixed(3)),
    })),
  };
}

async function writePredecessorManifestRoot(root, predecessor) {
  let payload = path.join(
    root,
    predecessor.release.manifests.voice,
    predecessor.release.manifests.directory,
  );
  let timeline = presentationAuthoringProjectCanonicalProjection(CV_SHOW_PRESENTATION_PROJECT)
    .cells.filter(({ kind }) => kind === 'narration')
    .map(({ turn }) => turn.text);
  let audioClips = predecessor.releases.map((release, index) => ({
    index: index + 1,
    kind: index < 16 ? 'short' : 'detail',
    order: index < 16 ? index + 1 : index - 15,
    id: release.entryId,
    speech: timeline[index],
    speechSha256: sha256(timeline[index]),
    file: release.wav.path,
    bytes: release.wav.size,
    sha256: release.wav.sha256,
    durationSec: 1,
    sampleRate: 8000,
    receiptFile: `receipts/${index + 1}.json`,
    receiptSha256: sha256(`receipt-${index + 1}`),
  }));
  let alignmentClips = predecessor.releases.map((release, index) => ({
    index: index + 1,
    kind: index < 16 ? 'short' : 'detail',
    order: index < 16 ? index + 1 : index - 15,
    id: release.entryId,
    sourceAudioSha256: release.wav.sha256,
    recognitionFile: path.posix.relative('alignment/base', release.recognition.path),
    recognitionSha256: release.recognition.sha256,
    alignedSequenceFile: path.posix.relative('alignment/base', release.alignment.path),
    alignedSequenceSha256: release.alignment.sha256,
    alignedSequenceHash: release.verification.alignedSequenceHash,
    timelineHash: release.verification.timelineHash,
    mediaDurationMs: 1000,
    recognizedWordCount: 1,
    recognizedSegmentCount: 0,
    confidenceAvailable: false,
    metrics: {
      authoredTokenCount: 1,
      recognizedTokenCount: 1,
      timedTokenCount: 1,
      editDistance: 0,
      wordErrorRate: 0,
      editSimilarity: 1,
      timingCoverage: 1,
      exactCorrespondence: true,
      observedWordsMatch: true,
      observedWordsReason: 'exact',
    },
    anchoring: {},
  }));
  await mkdir(path.join(payload, 'alignment/base'), { recursive: true });
  await writeFile(path.join(payload, 'manifest.json'), JSON.stringify({
    version: 'cv-show-local-audio-manifest-v1',
    locale: 'ru',
    inputHash: `sha256:${'b'.repeat(64)}`,
    audioRevision: 'b'.repeat(16),
    story: { version: 1, contractRevision: 'old', narrationLocale: 'ru', shortCount: 16, detailCount: 14 },
    voiceSelection: { id: 'barzana-2' },
    textArtifact: {},
    normalization: PROFILE.synthesisPolicy.normalization,
    counts: { total: 30, short: 16, detail: 14, failures: 0 },
    aggregateArtifactSha256: 'c'.repeat(64),
    totalDurationSec: 30,
    totalAudioBytes: 465,
    clips: audioClips,
  }));
  await writeFile(path.join(payload, 'alignment/base/manifest.json'), JSON.stringify({
    version: 'cv-show-whisper-alignment-manifest-v1',
    locale: 'ru',
    model: 'large-v3-turbo',
    alignedSequenceVersion: 'workspace-aligned-sequence-v3',
    alignmentInputHash: `sha256:${'d'.repeat(64)}`,
    sourceAudioInputHash: `sha256:${'b'.repeat(64)}`,
    story: { version: 1, contractRevision: 'old', narrationLocale: 'ru', shortCount: 16, detailCount: 14 },
    counts: { total: 30, short: 16, detail: 14, failures: 0 },
    aggregate: {},
    clips: alignmentClips,
  }));
}

test('exact WAV review gates Whisper and durable materialization resumes without rewriting', async (t) => {
  let root = await mkdtemp(path.join(tmpdir(), 'cv-show-workflow-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  let project = changedNarrationProject();
  let { predecessor, workflow } = workflowPlan({ project });
  await writePredecessorManifestRoot(root, predecessor);
  let storage = createCvShowAudioPipelineStorage({
    storageRoot: path.join(root, '.workflow', 'pipeline'),
  });
  let wav = createWav();
  let transcribeCalls = 0;
  let modelClient = {
    readiness: async () => structuredClone(PROFILE.readinessProfile),
    synthesize: async () => ({
      wavBytes: wav,
      durationSec: 10,
      sampleRate: 8000,
      receipt: {
        receiptVersion: 'symbiote-audio-synthesis-receipt-v3',
        artifactHash: sha256(wav),
      },
    }),
    transcribe: async () => {
      transcribeCalls += 1;
      return transcriptFor(workflow.plan.entries[0].runnerPlan.timeline.turns[0].text);
    },
  };
  let runner = createCvShowAudioPipelineRunner({ storage, modelClient });
  let entry = runner.openEntry(workflow.plan.entries[0].runnerPlan);
  await entry.initialize();
  let state = await entry.advance('owner');
  assert.equal(state.phase, 'technical-verified');
  assert.equal(transcribeCalls, 0);
  await assert.rejects(entry.advance('owner'), { code: 'CV_SHOW_AUDIO_PIPELINE_REVIEW_REQUIRED' });
  state = await entry.reviewClip({
    ownerToken: 'owner',
    approved: true,
    wavHash: state.synthesis.wavHash,
    synthesisAttemptHash: state.synthesis.attemptHash,
  });
  while (state.phase !== 'entry-verified') state = await entry.advance('owner');
  assert.equal(transcribeCalls, 1);

  let firstAdapter = createCvShowAudioWorkflowAdapters({
    privateRoot: root,
    storage,
    workflow,
    project,
    profile: PROFILE,
  });
  let first = await firstAdapter.ensureMaterialized();
  let release = first.entryReleases.get('positioning').entryRelease;
  let wavPath = path.join(first.cacheRoot, release.wav.path);
  let audioManifest = JSON.parse(await readFile(path.join(
    first.cacheRoot,
    first.audioManifestArtifact.path,
  ), 'utf8'));
  assert.equal(audioManifest.story.detailCount, 14);
  let alignmentManifest = JSON.parse(await readFile(path.join(
    first.cacheRoot,
    first.alignmentManifestArtifact.path,
  ), 'utf8'));
  let generatedAlignment = alignmentManifest.clips.find(({ id }) => id === 'positioning');
  let alignedSequence = JSON.parse(await readFile(path.join(
    first.cacheRoot,
    path.posix.dirname(first.alignmentManifestArtifact.path),
    generatedAlignment.alignedSequenceFile,
  ), 'utf8'));
  assert.match(
    generatedAlignment.alignedSequenceHash,
    /^workspace-aligned-sequence-v3:sha256-/u,
  );
  assert.equal(alignedSequence.hash, generatedAlignment.alignedSequenceHash);
  let before = await stat(wavPath);
  let secondAdapter = createCvShowAudioWorkflowAdapters({
    privateRoot: root,
    storage,
    workflow,
    project,
    profile: PROFILE,
  });
  let second = await secondAdapter.ensureMaterialized();
  let after = await stat(wavPath);
  assert.equal(
    second.entryReleases.get('positioning').entryRelease.entryReleaseId,
    release.entryReleaseId,
  );
  assert.equal(after.mtimeMs, before.mtimeMs);
});

test('all regenerated states produce a verifier-clean release and missing endpoint names both recoveries', async (t) => {
  let root = await mkdtemp(path.join(tmpdir(), 'cv-show-workflow-release-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  let { predecessor, workflow } = workflowPlan({
    voice: { ...PROFILE.voice, style: 'new approved delivery' },
  });
  await writePredecessorManifestRoot(root, predecessor);
  let storage = createCvShowAudioPipelineStorage({
    storageRoot: path.join(root, '.workflow', 'pipeline'),
  });
  let synthesizedTexts = new Map();
  let modelClient = {
    readiness: async () => structuredClone(PROFILE.readinessProfile),
    synthesize: async (item) => {
      let wavBytes = Buffer.from(`RIFF-real-test-wav-${item.id}`, 'utf8');
      synthesizedTexts.set(sha256(wavBytes), item.text);
      return {
        wavBytes,
        durationSec: 10,
        sampleRate: 8000,
        receipt: {
          receiptVersion: 'symbiote-audio-synthesis-receipt-v3',
          artifactHash: sha256(wavBytes),
        },
      };
    },
    transcribe: async ({ wavBytes }) => transcriptFor(synthesizedTexts.get(sha256(wavBytes))),
  };
  let runner = createCvShowAudioPipelineRunner({ storage, modelClient });
  await Promise.all(workflow.plan.entries.map(async (disposition) => {
    let entry = runner.openEntry(disposition.runnerPlan);
    let state = await entry.initialize();
    state = await entry.advance(`owner-${disposition.entryId}`);
    state = await entry.reviewClip({
      ownerToken: `owner-${disposition.entryId}`,
      approved: true,
      wavHash: state.synthesis.wavHash,
      synthesisAttemptHash: state.synthesis.attemptHash,
    });
    while (state.phase !== 'entry-verified') {
      state = await entry.advance(`owner-${disposition.entryId}`);
    }
  }));
  let profile = { ...PROFILE, voice: { ...PROFILE.voice, style: 'new approved delivery' } };
  let adapter = createCvShowAudioWorkflowAdapters({
    privateRoot: root,
    storage,
    workflow,
    project: CV_SHOW_PRESENTATION_PROJECT,
    profile,
  });
  let pipeline = createCvShowAudioReleasePipeline({
    storage,
    inspectEntry: adapter.inspectEntry,
    inspectReleaseArtifacts: adapter.inspectReleaseArtifacts,
    stageRelease: async () => ({ status: 'not staged in unit test' }),
    promoteRelease: async () => ({ status: 'not promoted in unit test' }),
  });
  let aggregate = pipeline.openRelease(workflow.plan);
  await aggregate.initialize();
  assert.equal((await aggregate.verifyEntries('aggregate-owner')).phase, 'entries-verified');
  assert.equal((await aggregate.verifyEntries('aggregate-owner')).phase, 'release-verified');
  let run = storage.openRun({
    schemaVersion: 'cv-show-audio-release-plan-v1',
    planId: workflow.planId,
  });
  let head = await run.readHead();
  let release = await run.readObject(head.state.releaseObjectHash);
  let selectedBase = path.join(root, 'selected-private');
  let payloadRoot = path.join(
    selectedBase,
    release.manifests.voice,
    release.manifests.directory,
  );
  await mkdir(path.dirname(payloadRoot), { recursive: true });
  await cp(adapter.cacheRoot, payloadRoot, { recursive: true });
  let result = await verifyCvShowPrivateArtifacts({
    root: payloadRoot,
    release,
    project: CV_SHOW_PRESENTATION_PROJECT,
  });
  assert.equal(result.runtimeFiles, 92);
  assert.equal(result.wavFiles, 30);
  assert.equal(result.alignedSequences, 30);
  let reconstructed = await loadCvShowPredecessorEntryReleases({
    privateRoot: selectedBase,
    release,
    project: CV_SHOW_PRESENTATION_PROJECT,
  });
  assert.deepEqual(
    reconstructed.map(({ entryReleaseId }) => entryReleaseId),
    release.entryReleaseIds,
  );
  let missingEndpoint = await createCvShowAudioWorkflow({
    privateRoot: selectedBase,
    project: changedNarrationProject(),
    predecessorRelease: release,
    profile,
    sourceSha256: `sha256:${'e'.repeat(64)}`,
  });
  await assert.rejects(missingEndpoint.advanceEntries('owner-without-endpoint'), (error) => {
    assert.equal(error.code, 'CV_SHOW_AUDIO_WORKFLOW_MODEL_CLIENT_REQUIRED');
    assert.match(error.message, /--endpoint/u);
    assert.match(error.message, /CV_SHOW_MODEL_ENDPOINT/u);
    return true;
  });
  await assert.rejects(
    missingEndpoint.retryEntryVerification({
      entryId: 'positioning',
      ownerToken: 'owner-without-endpoint',
    }),
    { code: 'CV_SHOW_AUDIO_WORKFLOW_MODEL_CLIENT_REQUIRED' },
  );
  await assert.rejects(
    missingEndpoint.retryEntrySynthesis({
      entryId: 'positioning',
      ownerToken: 'owner-without-endpoint',
    }),
    { code: 'CV_SHOW_AUDIO_WORKFLOW_MODEL_CLIENT_REQUIRED' },
  );
});

test('selected public publication contains only Opus delivery audio, never WAV', async () => {
  let manifestPath = path.resolve(
    'src/static-pages/copy-cv-show-audio',
    CV_SHOW_WEB_AUDIO_RELEASE.manifest.path,
  );
  let manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
  assert.equal(manifest.clips.length, 30);
  assert.equal(manifest.clips.every(({ deliveryFile }) => deliveryFile.endsWith('.opus')), true);
  assert.equal(JSON.stringify(manifest).includes('.wav'), false);
});
