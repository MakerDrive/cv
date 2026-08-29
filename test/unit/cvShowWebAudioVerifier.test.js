import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { canonicalize } from 'symbiote-workspace/schema/canonical-json.js';
import {
  CV_SHOW_WEB_AUDIO_PROFILE,
  createCvShowWebAudioRevision,
  verifyCvShowWebAudio,
} from '../../scripts/verify-cv-show-web-audio.js';

function sha256(bytes) {
  return createHash('sha256').update(bytes).digest('hex');
}

function jsonBytes(value) {
  return Buffer.from(`${canonicalize(value)}\n`, 'utf8');
}

async function createReleaseFixture(parent) {
  let root = path.join(parent, 'release');
  await fs.mkdir(path.join(root, 'clips'), { recursive: true });
  await fs.mkdir(path.join(root, 'aligned'), { recursive: true });
  let clips = [];
  for (let index = 1; index <= 30; index += 1) {
    let kind = index <= 16 ? 'short' : 'detail';
    let order = index <= 16 ? index : index - 16;
    let id = `entry-${String(index).padStart(2, '0')}`;
    let orderedName = `${String(index).padStart(2, '0')}-${kind}-${id}`;
    let speech = `Speech ${index}`;
    let masterWavSha256 = sha256(`master-${index}`);
    let deliveryBytes = Buffer.from(`OggS:${index}:OpusHead:${masterWavSha256}`, 'utf8');
    let deliverySha256 = sha256(deliveryBytes);
    let aligned = {
      contractVersion: 'workspace-aligned-sequence-v3',
      events: [],
      hash: `workspace-aligned-sequence-v3:sha256-${sha256(`sequence-${index}`)}`,
      media: {
        durationMs: 20_000 + index * 10,
        hash: `sha256:${masterWavSha256}`,
        locale: 'ru',
      },
      timelineHash: `presentation-timeline-v3:sha256-${sha256(`timeline-${index}`)}`,
      turns: [],
      voice: { mode: 'single', speakerId: 'guide' },
    };
    let alignedBytes = jsonBytes(aligned);
    let deliveryFile = `clips/${orderedName}-${deliverySha256.slice(0, 12)}.opus`;
    let alignedSequenceFile = `aligned/${orderedName}.json`;
    await fs.writeFile(path.join(root, deliveryFile), deliveryBytes);
    await fs.writeFile(path.join(root, alignedSequenceFile), alignedBytes);
    clips.push({
      index,
      kind,
      order,
      id,
      speech,
      speechSha256: sha256(speech),
      masterWavSha256,
      masterDurationMs: aligned.media.durationMs,
      deliveryFile,
      deliverySha256,
      deliveryBytes: deliveryBytes.byteLength,
      alignedSequenceFile,
      alignedSequenceSha256: sha256(alignedBytes),
      alignedSequenceHash: aligned.hash,
      timelineHash: aligned.timelineHash,
    });
  }
  let projection = {
    schemaVersion: 'cv-show-web-audio-release-v1',
    source: {
      masterReleaseId: `cv-show-audio-release-v1:${sha256('master-release')}`,
      masterArtifactTreeHash: `cv-show-audio-artifact-tree-v1:${sha256('master-tree')}`,
      projectRevision: 1,
      authoringProjectHash: `workspace-presentation-authoring-project-v1:sha256-${sha256('project')}`,
      voiceIdentityHash: `cv-show-voice-identity-v1:sha256-${sha256('voice')}`,
      audioInputHash: `sha256:${sha256('audio-input')}`,
      audioManifestSha256: sha256('audio-manifest'),
      alignmentInputHash: `sha256:${sha256('alignment-input')}`,
      alignmentManifestSha256: sha256('alignment-manifest'),
    },
    story: {
      version: 1,
      contractRevision: sha256('story'),
      narrationLocale: 'ru',
      shortCount: 16,
      detailCount: 14,
    },
    locale: 'ru',
    voiceId: 'barzana-2',
    alignedSequenceVersion: 'workspace-aligned-sequence-v3',
    profile: CV_SHOW_WEB_AUDIO_PROFILE,
    clips,
  };
  let revision = createCvShowWebAudioRevision(projection);
  let manifest = {
    ...projection,
    releaseId: `cv-show-web-audio-release-v1:${revision}`,
    revision,
  };
  let manifestBytes = jsonBytes(manifest);
  await fs.writeFile(path.join(root, 'manifest.json'), manifestBytes);
  let selector = {
    schemaVersion: 'cv-show-web-audio-selector-v1',
    releaseId: manifest.releaseId,
    sourceMasterReleaseId: manifest.source.masterReleaseId,
    voiceId: manifest.voiceId,
    locale: manifest.locale,
    revision,
    manifest: {
      path: `barzana-2/${revision}/manifest.json`,
      sha256: sha256(manifestBytes),
      bytes: manifestBytes.byteLength,
    },
  };
  return { root, manifest, selector };
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

async function expectCode(promise, code) {
  await assert.rejects(promise, (error) => error?.code === code);
}

test('public verifier accepts the exact 61-file release and rejects private or divergent state', async (t) => {
  let temporary = await fs.mkdtemp(path.join(os.tmpdir(), 'cv-show-web-verifier-test-'));
  t.after(() => fs.rm(temporary, { recursive: true, force: true }));
  let fixture = await createReleaseFixture(temporary);
  let result = await verifyCvShowWebAudio({
    root: fixture.root,
    selector: fixture.selector,
    probeAudio: fakeProbe,
  });
  assert.equal(result.files, 61);
  assert.equal(result.clips, 30);
  assert.equal(result.alignedSequences, 30);
  assert.equal(result.symlinks, 0);
  assert.equal(result.mediaProbed, true);

  let structural = await verifyCvShowWebAudio({
    root: fixture.root,
    selector: fixture.selector,
    verifyMedia: false,
    probeAudio: async () => {
      throw new Error('structural verification must not invoke a media subprocess');
    },
  });
  assert.equal(structural.mediaProbed, false);

  async function mutated(name, mutation) {
    let copyRoot = path.join(temporary, name);
    await fs.cp(fixture.root, copyRoot, { recursive: true });
    await mutation(copyRoot);
    return copyRoot;
  }

  let missing = await mutated('missing', (root) => fs.rm(path.join(root, fixture.manifest.clips[0].deliveryFile)));
  await expectCode(
    verifyCvShowWebAudio({ root: missing, selector: fixture.selector, probeAudio: fakeProbe }),
    'CV_SHOW_WEB_AUDIO_INVENTORY_MISMATCH',
  );

  for (let [name, relative] of [
    ['extra', 'unexpected.txt'],
    ['wav', 'private.wav'],
    ['recognized', 'recognized/private.json'],
    ['receipt', 'receipts/private.json'],
  ]) {
    let root = await mutated(name, async (copyRoot) => {
      await fs.mkdir(path.dirname(path.join(copyRoot, relative)), { recursive: true });
      await fs.writeFile(path.join(copyRoot, relative), name);
    });
    await expectCode(
      verifyCvShowWebAudio({ root, selector: fixture.selector, probeAudio: fakeProbe }),
      'CV_SHOW_WEB_AUDIO_INVENTORY_MISMATCH',
    );
  }

  let symlink = await mutated('symlink', async (root) => {
    await fs.symlink('../manifest.json', path.join(root, 'clips', 'linked.opus'));
  });
  await expectCode(
    verifyCvShowWebAudio({ root: symlink, selector: fixture.selector, probeAudio: fakeProbe }),
    'CV_SHOW_WEB_AUDIO_SYMLINK_FORBIDDEN',
  );

  let privateField = await mutated('private-field', async (root) => {
    let manifest = structuredClone(fixture.manifest);
    manifest.model = 'private-model';
    await fs.writeFile(path.join(root, 'manifest.json'), jsonBytes(manifest));
  });
  await expectCode(
    verifyCvShowWebAudio({ root: privateField, probeAudio: fakeProbe }),
    'CV_SHOW_WEB_AUDIO_SCHEMA_INVALID',
  );

  let selectorMismatch = structuredClone(fixture.selector);
  selectorMismatch.manifest.sha256 = sha256('wrong manifest');
  await expectCode(
    verifyCvShowWebAudio({ root: fixture.root, selector: selectorMismatch, probeAudio: fakeProbe }),
    'CV_SHOW_WEB_AUDIO_SELECTOR_MANIFEST_MISMATCH',
  );

  let alignedChanged = await mutated('aligned-changed', async (root) => {
    await fs.appendFile(path.join(root, fixture.manifest.clips[0].alignedSequenceFile), ' ');
  });
  await expectCode(
    verifyCvShowWebAudio({ root: alignedChanged, probeAudio: fakeProbe }),
    'CV_SHOW_WEB_AUDIO_ALIGNED_HASH_MISMATCH',
  );
});

test('public verifier keeps master and delivery identities separate', async (t) => {
  let temporary = await fs.mkdtemp(path.join(os.tmpdir(), 'cv-show-web-identity-test-'));
  t.after(() => fs.rm(temporary, { recursive: true, force: true }));
  let fixture = await createReleaseFixture(temporary);
  let manifest = structuredClone(fixture.manifest);
  manifest.clips[0].masterWavSha256 = manifest.clips[0].deliverySha256;
  let revision = createCvShowWebAudioRevision(manifest);
  manifest.revision = revision;
  manifest.releaseId = `cv-show-web-audio-release-v1:${revision}`;
  await fs.writeFile(path.join(fixture.root, 'manifest.json'), jsonBytes(manifest));
  await expectCode(
    verifyCvShowWebAudio({ root: fixture.root, probeAudio: fakeProbe }),
    'CV_SHOW_WEB_AUDIO_MEDIA_IDENTITY_COLLISION',
  );
});
