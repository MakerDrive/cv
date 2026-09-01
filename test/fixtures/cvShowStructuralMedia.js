import { createHash } from 'node:crypto';
import { createPresentationAuthoringProject } from 'symbiote-workspace';
import {
  CV_SHOW_AUDIO_RELEASE,
  CV_SHOW_PRESENTATION_PROJECT,
  CV_SHOW_STORY,
} from '../../src/static-pages/data/cvShowPresentationProject.js';

const FIXTURE_SCHEMA = 'cv-show-structural-media-fixture-v1';
const AUDIO_MANIFEST_VERSION = 'cv-show-local-audio-manifest-v1';
const ALIGNMENT_MANIFEST_VERSION = 'cv-show-whisper-alignment-manifest-v1';
const ALIGNED_SEQUENCE_VERSION = 'workspace-aligned-sequence-v3';
const ALIGNMENT_MODEL = 'large-v3-turbo';
const FIXTURE_VOICE = 'custom-user';
const WEB_VOICE = 'barzana-2';
const FIXTURE_LOCALE = 'ru';

function sha256(value, encoding = 'hex') {
  return createHash('sha256').update(value).digest(encoding);
}

function integrity(value) {
  return `sha256-${sha256(value, 'base64')}`;
}

function storyEntries() {
  return [
    ...CV_SHOW_STORY.scenes.map((entry) => ({ kind: 'short', entry })),
    ...Object.values(CV_SHOW_STORY.branches).map((entry) => ({ kind: 'detail', entry })),
  ];
}

function fixtureWords(entry, durationMs, clipBoundaries = []) {
  let tokens = entry.speech.match(/[\p{L}\p{N}]+/gu) || [];
  let slotMs = durationMs / (tokens.length + 1);
  return tokens.map((source, index) => {
    let text = entry.id === 'agent-portal' && source === 'который'
      ? 'которыйx'
      : source;
    let startMs = Math.max(0, Math.round((index - 0.35) * slotMs));
    let endMs = Math.min(
      durationMs,
      Math.max(startMs + 1, Math.round((index + 0.15) * slotMs)),
    );
    for (const boundaryMs of clipBoundaries) {
      if (!(startMs < boundaryMs && boundaryMs < endMs)) continue;
      if (boundaryMs - startMs >= endMs - boundaryMs) endMs = boundaryMs;
      else startMs = boundaryMs;
    }
    return Object.freeze({ text, startMs, endMs });
  });
}

function structuralSequence(entry, sourceBinding, wavHash, clipBoundaries) {
  let words = fixtureWords(entry, sourceBinding.durationMilliseconds, clipBoundaries);
  let sequenceBody = {
    contractVersion: ALIGNED_SEQUENCE_VERSION,
    timelineHash: sourceBinding.sourceTimelineHash,
    media: {
      hash: wavHash,
      durationMs: sourceBinding.durationMilliseconds,
      locale: FIXTURE_LOCALE,
    },
    turns: [{
      turnIndex: 0,
      startMs: 0,
      endMs: sourceBinding.durationMilliseconds,
      transcript: words.map(({ text }) => text).join(' '),
      words,
    }],
    events: [],
    fixture: {
      schemaVersion: FIXTURE_SCHEMA,
      purpose: 'structural-unit-only',
      artifactAuthority: false,
    },
  };
  return Object.freeze({
    ...sequenceBody,
    hash: `${ALIGNED_SEQUENCE_VERSION}:${integrity(JSON.stringify(sequenceBody))}`,
  });
}

function createFixture() {
  let entries = storyEntries();
  let sequenceJsonById = new Map();
  let sequencesById = new Map();
  let audioClips = [];
  let alignmentClips = [];
  let webClips = [];
  for (let [index, { kind, entry }] of entries.entries()) {
    let originalBinding = CV_SHOW_PRESENTATION_PROJECT.script.metadata.cvShow
      .entries[entry.id].media;
    let sourceBinding = {
      ...originalBinding,
      durationMilliseconds: originalBinding.durationMilliseconds * 2,
    };
    let clipBoundaries = CV_SHOW_PRESENTATION_PROJECT.cells
      .filter((cell) => cell.kind === 'audio-clip' && cell.turnId === entry.id)
      .slice(0, -1)
      .map((cell) => Math.round(
        cell.audio.sourceOutMs
          * sourceBinding.durationMilliseconds
          / originalBinding.durationMilliseconds,
      ));
    let wavSha256 = sha256(`${FIXTURE_SCHEMA}:audio:${entry.id}`);
    let sequence = structuralSequence(
      entry,
      sourceBinding,
      `sha256:${wavSha256}`,
      clipBoundaries,
    );
    let rawSequence = `${JSON.stringify(sequence, null, 2)}\n`;
    let alignedSequenceSha256 = sha256(rawSequence);
    let number = String(index + 1).padStart(2, '0');
    let deliverySha256 = sha256(`${FIXTURE_SCHEMA}:delivery:${entry.id}`);
    sequencesById.set(entry.id, sequence);
    sequenceJsonById.set(entry.id, rawSequence);
    audioClips.push(Object.freeze({
      index: index + 1,
      kind,
      order: index + 1,
      id: entry.id,
      speech: entry.speech,
      file: `${number}-${kind}-${entry.id}-${wavSha256.slice(0, 12)}.wav`,
      sha256: wavSha256,
      durationSec: sourceBinding.durationMilliseconds / 1_000,
      sampleRate: 24_000,
    }));
    alignmentClips.push(Object.freeze({
      index: index + 1,
      kind,
      order: index + 1,
      id: entry.id,
      sourceAudioSha256: wavSha256,
      alignedSequenceFile: `aligned/${number}-${kind}-${entry.id}.json`,
      alignedSequenceSha256,
      alignedSequenceHash: sequence.hash,
      timelineHash: sourceBinding.sourceTimelineHash,
      mediaDurationMs: sourceBinding.durationMilliseconds,
      metrics: Object.freeze({ timingCoverage: 1 }),
    }));
    webClips.push(Object.freeze({
      index: index + 1,
      kind,
      order: kind === 'short' ? index + 1 : index + 1 - CV_SHOW_STORY.scenes.length,
      id: entry.id,
      speech: entry.speech,
      speechSha256: sha256(entry.speech),
      masterWavSha256: wavSha256,
      masterDurationMs: sourceBinding.durationMilliseconds,
      deliveryFile: `clips/${number}-${kind}-${entry.id}-${deliverySha256.slice(0, 12)}.opus`,
      deliverySha256,
      deliveryBytes: 4_000 + index,
      alignedSequenceFile: `aligned/${number}-${kind}-${entry.id}.json`,
      alignedSequenceSha256,
      alignedSequenceHash: sequence.hash,
      timelineHash: sourceBinding.sourceTimelineHash,
    }));
  }

  let projectInput = structuredClone(CV_SHOW_PRESENTATION_PROJECT);
  delete projectInput.hash;
  for (let clip of alignmentClips) {
    let audioClip = audioClips[clip.index - 1];
    Object.assign(projectInput.script.metadata.cvShow.entries[clip.id].media, {
      durationMilliseconds: clip.mediaDurationMs,
      sourceAlignedSequenceHash: clip.alignedSequenceHash,
      sourceAlignmentFileHash: `sha256:${clip.alignedSequenceSha256}`,
      sourceTimelineHash: clip.timelineHash,
      wavHash: `sha256:${audioClip.sha256}`,
    });
    let asset = projectInput.assets.find(({ id }) => id === `cv-show:audio:${clip.id}`);
    let sourceDurationMs = asset.durationMs;
    Object.assign(asset, {
      durationMs: clip.mediaDurationMs,
      contentHash: `sha256:${audioClip.sha256}`,
      alignmentHash: clip.alignedSequenceHash,
      sourceTimelineHash: clip.timelineHash,
    });
    let entryAudioClips = projectInput.cells.filter((cell) => (
      cell.kind === 'audio-clip' && cell.turnId === clip.id
    ));
    for (let [clipIndex, cell] of entryAudioClips.entries()) {
      cell.audio.sourceInMs = Math.round(
        cell.audio.sourceInMs * clip.mediaDurationMs / sourceDurationMs,
      );
      cell.audio.sourceOutMs = clipIndex === entryAudioClips.length - 1
        ? clip.mediaDurationMs
        : Math.round(cell.audio.sourceOutMs * clip.mediaDurationMs / sourceDurationMs);
      cell.timing.at.offsetMs = cell.audio.sourceInMs;
    }
  }
  let project = createPresentationAuthoringProject(projectInput);
  let mediaBindings = Object.freeze(Object.fromEntries(Object.entries(
    project.script.metadata.cvShow.entries,
  ).map(([entryId, value]) => [entryId, value.media])));
  let revision = sha256(`${FIXTURE_SCHEMA}:${project.hash}`).slice(0, 16);
  let webRevision = sha256(`${FIXTURE_SCHEMA}:web-release`);
  let webReleaseId = `cv-show-web-audio-release-v1:${webRevision}`;
  let story = Object.freeze({
    version: 1,
    contractRevision: CV_SHOW_STORY.contractRevision,
    narrationLocale: CV_SHOW_STORY.narrationLocale,
    shortCount: CV_SHOW_STORY.scenes.length,
    detailCount: Object.keys(CV_SHOW_STORY.branches).length,
  });
  let fixture = Object.freeze({
    schemaVersion: FIXTURE_SCHEMA,
    purpose: 'structural-unit-only',
    artifactAuthority: false,
  });
  return Object.freeze({
    fixture,
    project,
    mediaBindings,
    revision,
    voice: FIXTURE_VOICE,
    audioManifest: Object.freeze({
      version: AUDIO_MANIFEST_VERSION,
      locale: FIXTURE_LOCALE,
      inputHash: `sha256:${sha256(`${FIXTURE_SCHEMA}:audio-manifest`)}`,
      audioRevision: revision,
      story,
      voiceSelection: Object.freeze({ id: FIXTURE_VOICE }),
      counts: Object.freeze({ total: 30, short: 16, detail: 14, failures: 0 }),
      clips: Object.freeze(audioClips),
      fixture,
    }),
    alignmentManifest: Object.freeze({
      version: ALIGNMENT_MANIFEST_VERSION,
      locale: FIXTURE_LOCALE,
      model: ALIGNMENT_MODEL,
      alignedSequenceVersion: ALIGNED_SEQUENCE_VERSION,
      story,
      counts: Object.freeze({ total: 30, short: 16, detail: 14, failures: 0 }),
      aggregate: Object.freeze({ timingCoverage: 1 }),
      clips: Object.freeze(alignmentClips),
      fixture,
    }),
    webManifest: Object.freeze({
      schemaVersion: 'cv-show-web-audio-release-v1',
      releaseId: webReleaseId,
      revision: webRevision,
      source: Object.freeze({
        masterReleaseId: CV_SHOW_AUDIO_RELEASE.releaseId,
        masterArtifactTreeHash: CV_SHOW_AUDIO_RELEASE.artifactTreeHash,
        projectRevision: CV_SHOW_PRESENTATION_PROJECT.revision,
        authoringProjectHash: CV_SHOW_PRESENTATION_PROJECT.hash,
        voiceIdentityHash: CV_SHOW_AUDIO_RELEASE.acceptedProvenance.voiceIdentityHash,
        audioInputHash: `sha256:${sha256(`${FIXTURE_SCHEMA}:audio-input`)}`,
        audioManifestSha256: CV_SHOW_AUDIO_RELEASE.manifests.audio.sha256,
        alignmentInputHash: `sha256:${sha256(`${FIXTURE_SCHEMA}:alignment-input`)}`,
        alignmentManifestSha256: CV_SHOW_AUDIO_RELEASE.manifests.alignment.sha256,
      }),
      story,
      locale: FIXTURE_LOCALE,
      voiceId: WEB_VOICE,
      alignedSequenceVersion: ALIGNED_SEQUENCE_VERSION,
      profile: Object.freeze({
        id: 'ogg-opus-mono-48khz-48kbps-voip-v1',
        extension: '.opus',
        mimeType: 'audio/ogg',
        codecType: 'audio/ogg; codecs=opus',
        container: 'ogg',
        codec: 'opus',
        channels: 1,
        sampleRate: 48_000,
        targetBitrate: 48_000,
        application: 'voip',
        frameDurationMs: 20,
        packetLoss: 0,
        fec: 0,
        durationToleranceMs: 10,
        commandSha256: sha256(`${FIXTURE_SCHEMA}:command`),
        toolchainIdentity: `ffmpeg-7.1.1-libopus-1.5.2:sha256:${sha256(`${FIXTURE_SCHEMA}:toolchain`)}`,
      }),
      clips: Object.freeze(webClips),
    }),
    sequence(entryId) {
      let value = sequencesById.get(entryId);
      if (!value) throw new TypeError(`Unknown structural media fixture entry: ${entryId}`);
      return structuredClone(value);
    },
    sequenceJson(entryId) {
      let value = sequenceJsonById.get(entryId);
      if (!value) throw new TypeError(`Unknown structural media fixture entry: ${entryId}`);
      return value;
    },
  });
}

export const CV_SHOW_STRUCTURAL_MEDIA_FIXTURE = createFixture();
