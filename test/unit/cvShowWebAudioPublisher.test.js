import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { canonicalize } from 'symbiote-workspace/schema/canonical-json.js';
import {
  CV_SHOW_WEB_AUDIO_PROFILE,
  publishCvShowWebAudio,
} from '../../scripts/cv-show-web-audio-publisher.js';

function sha256(bytes) {
  return createHash('sha256').update(bytes).digest('hex');
}

function jsonBytes(value) {
  return Buffer.from(`${canonicalize(value)}\n`, 'utf8');
}

async function createPrivateFixture(parent, generation = 1) {
  let root = path.join(parent, `private-${generation}`);
  let alignmentDirectory = 'alignment/aligned-v1';
  await fs.mkdir(path.join(root, alignmentDirectory, 'aligned'), { recursive: true });
  let audioClips = [];
  let alignmentClips = [];
  for (let index = 1; index <= 30; index += 1) {
    let kind = index <= 16 ? 'short' : 'detail';
    let order = index <= 16 ? index : index - 16;
    let id = `entry-${String(index).padStart(2, '0')}`;
    let orderedName = `${String(index).padStart(2, '0')}-${kind}-${id}`;
    let speech = `Speech ${index}`;
    let wavBytes = Buffer.from(`RIFF:fixture:${index}:${index === 1 ? generation : 1}`, 'utf8');
    let wavSha256 = sha256(wavBytes);
    let wavFile = `${orderedName}-${sha256(speech).slice(0, 12)}.wav`;
    await fs.writeFile(path.join(root, wavFile), wavBytes);
    let durationMs = 20_000 + index * 10;
    let aligned = {
      contractVersion: 'workspace-aligned-sequence-v3',
      events: [],
      hash: `workspace-aligned-sequence-v3:sha256-${sha256(`sequence-${index}`)}`,
      media: { durationMs, hash: `sha256:${wavSha256}`, locale: 'ru' },
      timelineHash: `presentation-timeline-v3:sha256-${sha256(`timeline-${index}`)}`,
      turns: [],
      voice: { mode: 'single', speakerId: 'guide' },
    };
    let alignedFile = `aligned/${orderedName}.json`;
    let alignedBytes = jsonBytes(aligned);
    await fs.writeFile(path.join(root, alignmentDirectory, alignedFile), alignedBytes);
    audioClips.push({
      index,
      kind,
      order,
      id,
      speech,
      speechSha256: sha256(speech),
      file: wavFile,
      bytes: wavBytes.byteLength,
      sha256: wavSha256,
      durationSec: durationMs / 1_000,
      sampleRate: 24_000,
    });
    alignmentClips.push({
      index,
      kind,
      order,
      id,
      sourceAudioSha256: wavSha256,
      alignedSequenceFile: alignedFile,
      alignedSequenceSha256: sha256(alignedBytes),
      alignedSequenceHash: aligned.hash,
      timelineHash: aligned.timelineHash,
      mediaDurationMs: durationMs,
    });
  }
  let story = {
    version: 1,
    contractRevision: sha256(`story-${generation}`),
    narrationLocale: 'ru',
    shortCount: 16,
    detailCount: 14,
  };
  let audioManifest = {
    version: 'cv-show-local-audio-manifest-v1',
    audioRevision: sha256(`audio-revision-${generation}`).slice(0, 16),
    inputHash: `sha256:${sha256(`audio-input-${generation}`)}`,
    locale: 'ru',
    story,
    voiceSelection: { id: 'barzana-2' },
    counts: { total: 30, short: 16, detail: 14, failures: 0 },
    clips: audioClips,
  };
  let alignmentManifest = {
    version: 'cv-show-whisper-alignment-manifest-v1',
    alignedSequenceVersion: 'workspace-aligned-sequence-v3',
    alignmentInputHash: `sha256:${sha256(`alignment-input-${generation}`)}`,
    sourceAudioInputHash: audioManifest.inputHash,
    locale: 'ru',
    story,
    counts: { total: 30, short: 16, detail: 14, failures: 0 },
    clips: alignmentClips,
  };
  let audioManifestBytes = jsonBytes(audioManifest);
  let alignmentManifestBytes = jsonBytes(alignmentManifest);
  await fs.writeFile(path.join(root, 'manifest.json'), audioManifestBytes);
  await fs.writeFile(path.join(root, alignmentDirectory, 'manifest.json'), alignmentManifestBytes);
  let release = {
    schemaVersion: 'cv-show-audio-release-v1',
    releaseId: `cv-show-audio-release-v1:${sha256(`master-release-${generation}`)}`,
    artifactTreeHash: `cv-show-audio-artifact-tree-v1:${sha256(`tree-${generation}`)}`,
    project: {
      revision: generation,
      authoringProjectHash: `workspace-presentation-authoring-project-v1:sha256-${sha256(`project-${generation}`)}`,
    },
    acceptedProvenance: {
      voiceIdentityHash: `cv-show-voice-identity-v1:sha256-${sha256('voice')}`,
    },
    manifests: {
      voice: 'barzana-2',
      locale: 'ru',
      directory: path.basename(root),
      audio: { path: 'manifest.json', sha256: sha256(audioManifestBytes), size: audioManifestBytes.byteLength },
      alignment: {
        path: `${alignmentDirectory}/manifest.json`,
        sha256: sha256(alignmentManifestBytes),
        size: alignmentManifestBytes.byteLength,
      },
    },
  };
  return { root, release, audioClips, alignmentClips };
}

async function fakeTranscode({ input, output }) {
  let inputBytes = await fs.readFile(input);
  await fs.writeFile(output, Buffer.from(`OggS:OpusHead:${sha256(inputBytes)}`, 'utf8'));
}

function fakeProbe(_file, clip) {
  return Promise.resolve({
    codec: 'opus',
    container: 'ogg',
    sampleRate: 48_000,
    channels: 1,
    startTimeMs: 0,
    rawDurationMs: clip.masterDurationMs + 6.5,
    decodedDurationMs: clip.masterDurationMs,
    decodedSamples: clip.masterDurationMs * 48,
  });
}

function publisherOptions({ fixture, repository, verifyPrivateArtifacts }) {
  return {
    repoRoot: repository,
    privateRoot: fixture.root,
    release: fixture.release,
    outputBase: path.join(repository, 'src/static-pages/copy-cv-show-audio/barzana-2'),
    selectorPath: path.join(repository, 'src/static-pages/data/cvShowWebAudioRelease.js'),
    inspectToolchain: async () => ({
      ffmpegPath: '/fixture/ffmpeg',
      toolchainIdentity: CV_SHOW_WEB_AUDIO_PROFILE.toolchainIdentity,
    }),
    transcode: fakeTranscode,
    probeAudio: fakeProbe,
    verifyPrivateArtifacts: verifyPrivateArtifacts || (async () => ({ status: 'verified' })),
  };
}

async function inventory(root, relative = '') {
  let output = [];
  for (let entry of await fs.readdir(path.join(root, relative), { withFileTypes: true })) {
    let entryRelative = relative ? path.posix.join(relative, entry.name) : entry.name;
    if (entry.isDirectory()) output.push(...await inventory(root, entryRelative));
    else output.push(entryRelative);
  }
  return output.sort();
}

test('publisher creates one exact release and the identical second publication is a byte no-op', async (t) => {
  let temporary = await fs.mkdtemp(path.join(os.tmpdir(), 'cv-show-web-publisher-test-'));
  t.after(() => fs.rm(temporary, { recursive: true, force: true }));
  let repository = path.join(temporary, 'repo');
  let fixture = await createPrivateFixture(temporary, 1);
  let options = publisherOptions({ fixture, repository });
  let first = await publishCvShowWebAudio(options);
  assert.equal(first.status, 'published');
  let releaseRoot = path.join(options.outputBase, first.revision);
  assert.equal((await inventory(releaseRoot)).length, 61);
  let manifest = JSON.parse(await fs.readFile(path.join(releaseRoot, 'manifest.json'), 'utf8'));
  assert.equal(manifest.clips.length, 30);
  assert.notEqual(manifest.clips[0].masterWavSha256, manifest.clips[0].deliverySha256);
  let sourceAligned = await fs.readFile(path.join(
    fixture.root,
    path.dirname(fixture.release.manifests.alignment.path),
    fixture.alignmentClips[0].alignedSequenceFile,
  ));
  let publicAligned = await fs.readFile(path.join(releaseRoot, manifest.clips[0].alignedSequenceFile));
  assert.deepEqual(publicAligned, sourceAligned);

  let selectorBefore = await fs.readFile(options.selectorPath);
  let selectorStatBefore = await fs.stat(options.selectorPath);
  let manifestStatBefore = await fs.stat(path.join(releaseRoot, 'manifest.json'));
  let second = await publishCvShowWebAudio(options);
  assert.equal(second.status, 'noop');
  assert.deepEqual(await fs.readFile(options.selectorPath), selectorBefore);
  assert.equal((await fs.stat(options.selectorPath)).mtimeMs, selectorStatBefore.mtimeMs);
  assert.equal((await fs.stat(path.join(releaseRoot, 'manifest.json'))).mtimeMs, manifestStatBefore.mtimeMs);

  await fs.writeFile(path.join(releaseRoot, 'unexpected.txt'), 'diverged');
  await assert.rejects(
    publishCvShowWebAudio(options),
    (error) => error?.code === 'CV_SHOW_WEB_AUDIO_EXISTING_RELEASE_DIVERGED',
  );
});

test('publisher verifies source before selector mutation and a changed entry yields a new release', async (t) => {
  let temporary = await fs.mkdtemp(path.join(os.tmpdir(), 'cv-show-web-publisher-change-test-'));
  t.after(() => fs.rm(temporary, { recursive: true, force: true }));
  let repository = path.join(temporary, 'repo');
  let firstFixture = await createPrivateFixture(temporary, 1);
  let firstOptions = publisherOptions({ fixture: firstFixture, repository });
  let first = await publishCvShowWebAudio(firstOptions);
  let selectorBefore = await fs.readFile(firstOptions.selectorPath);
  await assert.rejects(
    publishCvShowWebAudio(publisherOptions({
      fixture: firstFixture,
      repository,
      verifyPrivateArtifacts: async () => {
        let error = new Error('source mismatch');
        error.code = 'CV_SHOW_PRIVATE_ARTIFACT_TREE_HASH_MISMATCH';
        throw error;
      },
    })),
    (error) => error?.code === 'CV_SHOW_PRIVATE_ARTIFACT_TREE_HASH_MISMATCH',
  );
  assert.deepEqual(await fs.readFile(firstOptions.selectorPath), selectorBefore);

  let wrongToolchain = publisherOptions({ fixture: firstFixture, repository });
  wrongToolchain.inspectToolchain = async () => ({
    ffmpegPath: '/fixture/ffmpeg',
    toolchainIdentity: 'ffmpeg-unlocked',
  });
  await assert.rejects(
    publishCvShowWebAudio(wrongToolchain),
    (error) => error?.code === 'CV_SHOW_WEB_AUDIO_TOOLCHAIN_MISMATCH',
  );
  assert.deepEqual(await fs.readFile(firstOptions.selectorPath), selectorBefore);

  let secondFixture = await createPrivateFixture(temporary, 2);
  let second = await publishCvShowWebAudio(publisherOptions({ fixture: secondFixture, repository }));
  assert.equal(second.status, 'published');
  assert.notEqual(second.revision, first.revision);
  let firstManifest = JSON.parse(await fs.readFile(path.join(firstOptions.outputBase, first.revision, 'manifest.json')));
  let secondManifest = JSON.parse(await fs.readFile(path.join(firstOptions.outputBase, second.revision, 'manifest.json')));
  assert.notEqual(firstManifest.clips[0].deliverySha256, secondManifest.clips[0].deliverySha256);
  for (let index = 1; index < 30; index += 1) {
    assert.equal(firstManifest.clips[index].deliverySha256, secondManifest.clips[index].deliverySha256);
    assert.deepEqual(
      await fs.readFile(path.join(firstOptions.outputBase, first.revision, firstManifest.clips[index].deliveryFile)),
      await fs.readFile(path.join(firstOptions.outputBase, second.revision, secondManifest.clips[index].deliveryFile)),
    );
  }
});
