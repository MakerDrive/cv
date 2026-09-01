import { createHash } from 'node:crypto';

import {
  createPresentationAlignedSequence,
  createPresentationAuthoringProject,
  createPresentationAuthoringTimelineProjection,
  PRESENTATION_AUTHORING_PROJECT_SCHEMA_VERSION,
} from 'symbiote-workspace';
import { computeIntegrity } from 'symbiote-workspace/schema/canonical-json.js';

const AUDIO_LAYER_ID = 'cv-show:layer:audio';

function fail(reason, details = {}) {
  throw Object.assign(
    new TypeError(`CV Show audio clip migration is invalid: ${reason}`),
    { code: 'CV_SHOW_AUDIO_CLIP_MIGRATION_INVALID', details },
  );
}

function clone(value) {
  return structuredClone(value);
}

function sha256(value) {
  return createHash('sha256').update(value).digest('hex');
}

function sequenceBytes(value) {
  return Buffer.from(`${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

function sourceSequenceFor(sequences, entryId, manifestClip) {
  const sequence = sequences instanceof Map ? sequences.get(entryId) : sequences?.[entryId];
  const projection = sequence ? clone(sequence) : null;
  if (projection) delete projection.hash;
  const canonicalHash = projection
    ? `${sequence.contractVersion}:${computeIntegrity(projection)}`
    : null;
  if (
    !sequence?.media
    || sequence.turns?.length !== 1
    || sequence.contractVersion !== 'workspace-aligned-sequence-v3'
    || sequence.hash !== canonicalHash
    || sequence.hash !== manifestClip.alignedSequenceHash
    || sha256(sequenceBytes(sequence)) !== manifestClip.alignedSequenceSha256
    || sequence.timelineHash !== manifestClip.timelineHash
    || sequence.media.hash !== `sha256:${manifestClip.masterWavSha256}`
    || sequence.media.durationMs !== manifestClip.masterDurationMs
  ) {
    fail(`missing aligned sequence for ${entryId}`, { entryId });
  }
  return sequence;
}

function mediaManifestClips({ webManifest, audioManifest, alignmentManifest }) {
  if (Array.isArray(webManifest?.clips)) return webManifest.clips;
  if (!Array.isArray(audioManifest?.clips) || !Array.isArray(alignmentManifest?.clips)) {
    fail('web manifest or exact private audio/alignment manifests are required');
  }
  const audioById = new Map(audioManifest.clips.map((clip) => [clip.id, clip]));
  if (
    audioById.size !== audioManifest.clips.length
    || alignmentManifest.clips.length !== audioManifest.clips.length
  ) {
    fail('private media manifests are reordered or incomplete');
  }
  return alignmentManifest.clips.map((alignment) => {
    const audio = audioById.get(alignment.id);
    if (!audio) fail(`missing private audio for ${alignment.id}`, { entryId: alignment.id });
    return {
      id: alignment.id,
      masterDurationMs: alignment.mediaDurationMs,
      masterWavSha256: audio.sha256,
      alignedSequenceHash: alignment.alignedSequenceHash,
      alignedSequenceSha256: alignment.alignedSequenceSha256,
      timelineHash: alignment.timelineHash,
    };
  });
}

function createEntryAlignment(project, entryId, sequence) {
  const cells = project.cells.filter(({ turnId }) => turnId === entryId).map((cell) => {
    const value = clone(cell);
    if (value.kind === 'narration') delete value.turn.replyTo;
    return value;
  });
  const layerIds = new Set(cells.map(({ layerId }) => layerId));
  const entryProject = createPresentationAuthoringProject({
    schemaVersion: PRESENTATION_AUTHORING_PROJECT_SCHEMA_VERSION,
    id: `cv-show/audio-migration/${entryId}`,
    revision: 0,
    script: {
      ...clone(project.script),
      title: `CV Show audio migration: ${entryId}`,
    },
    policy: clone(project.policy),
    layers: project.layers.filter(({ id }) => layerIds.has(id)).map(clone),
    cells: cells.map(clone),
    assets: [],
  });
  const timeline = createPresentationAuthoringTimelineProjection(entryProject);
  const turns = sequence.turns.map(({ startMs, endMs, transcript, words }) => ({
    startMs,
    endMs,
    transcript,
    words: clone(words),
  }));
  return {
    timeline,
    alignment: createPresentationAlignedSequence(timeline, {
      media: clone(sequence.media),
      turns,
    }),
    cueCells: cells.filter(({ kind }) => kind === 'cue'),
  };
}

function legalBoundary(anchorMs, words, priorBoundaryMs, durationMs, entryId, cellId) {
  let boundaryMs = Math.max(0, Math.min(durationMs, Math.round(anchorMs)));
  const containingWord = words.find(({ startMs, endMs }) => (
    startMs < boundaryMs && boundaryMs < endMs
  ));
  if (containingWord) boundaryMs = containingWord.startMs;
  if (boundaryMs <= priorBoundaryMs || boundaryMs >= durationMs) {
    fail(`non-increasing audio boundary for ${cellId}`, {
      entryId,
      cellId,
      anchorMs,
      boundaryMs,
      priorBoundaryMs,
      durationMs,
    });
  }
  return boundaryMs;
}

function speechGroups(project, entryId, alignment, cueCells, sequence) {
  const eventByCueId = new Map(alignment.events.map((event) => [event.cueId, event]));
  const words = sequence.turns[0].words;
  const durationMs = sequence.media.durationMs;
  const groups = [];
  let priorBoundaryMs = 0;
  for (const scroll of cueCells.filter((cell) => (
    cell.id.endsWith(':scroll') && cell.timing.at.anchor === 'speech'
  ))) {
    const cueIndex = cueCells.findIndex(({ id }) => id === scroll.id);
    const event = eventByCueId.get(`0.${cueIndex}`);
    const attentionId = scroll.id.slice(0, -':scroll'.length);
    const attention = project.cells.find(({ id }) => id === attentionId);
    if (!event || !attention || attention.turnId !== entryId) {
      fail(`incomplete speech group ${scroll.id}`, { entryId, cellId: scroll.id });
    }
    const boundaryMs = legalBoundary(
      event.startMs,
      words,
      priorBoundaryMs,
      durationMs,
      entryId,
      scroll.id,
    );
    groups.push({ scroll, attention, boundaryMs });
    priorBoundaryMs = boundaryMs;
  }
  return groups;
}

function audioAsset(entryId, media, manifestClip) {
  const contentHash = String(media.wavHash || '');
  if (
    manifestClip.masterDurationMs !== media.durationMilliseconds
    || `sha256:${manifestClip.masterWavSha256}` !== contentHash
    || manifestClip.alignedSequenceHash !== media.sourceAlignedSequenceHash
    || manifestClip.timelineHash !== media.sourceTimelineHash
  ) {
    fail(`web release does not match accepted source for ${entryId}`, { entryId });
  }
  return {
    id: `cv-show:audio:${entryId}`,
    kind: 'audio',
    mediaType: 'audio/wav',
    durationMs: media.durationMilliseconds,
    contentHash,
    alignmentHash: media.sourceAlignedSequenceHash,
    sourceTimelineHash: media.sourceTimelineHash,
  };
}

function audioClip(entryId, assetId, index, sourceInMs, sourceOutMs, dependsOn) {
  return {
    id: `cv-show:audio-clip:${entryId}:${String(index + 1).padStart(2, '0')}`,
    kind: 'audio-clip',
    layerId: AUDIO_LAYER_ID,
    turnId: entryId,
    audio: { assetId, sourceInMs, sourceOutMs },
    timing: { at: { anchor: 'turn-start', offsetMs: sourceInMs } },
    dependsOn: clone(dependsOn),
  };
}

/**
 * Migrates the accepted CV narration masters into the canonical Project graph.
 * The same audio-clip cells and dependencies are consumed by NLE, MCP/CLI and
 * hidden CV playback; this function does not synthesize or realign audio.
 */
export function createCvShowAudioClipProject({
  project,
  webManifest,
  audioManifest,
  alignmentManifest,
  sequences,
} = {}) {
  if (!project) fail('project is required');
  const mediaClips = mediaManifestClips({ webManifest, audioManifest, alignmentManifest });
  const sequenceIds = sequences instanceof Map
    ? [...sequences.keys()]
    : sequences && typeof sequences === 'object' && !Array.isArray(sequences)
      ? Object.keys(sequences)
      : [];
  const expectedSequenceIds = new Set(mediaClips.map(({ id }) => id));
  if (
    sequenceIds.length !== expectedSequenceIds.size
    || sequenceIds.some((id) => !expectedSequenceIds.has(id))
  ) {
    fail('exact complete aligned-sequence set is required');
  }
  const baseInput = clone(project);
  delete baseInput.hash;
  baseInput.schemaVersion = PRESENTATION_AUTHORING_PROJECT_SCHEMA_VERSION;
  baseInput.assets = [];
  baseInput.layers = baseInput.layers.filter(({ kind }) => kind !== 'audio');
  const priorAudioById = new Map(baseInput.cells
    .filter(({ kind }) => kind === 'audio-clip')
    .map((cell) => [cell.id, cell]));
  baseInput.cells = baseInput.cells
    .filter(({ kind }) => kind !== 'audio-clip')
    .map((cell) => ({
      ...cell,
      dependsOn: cell.dependsOn.flatMap((dependency) => {
        const priorAudio = priorAudioById.get(dependency.cellId);
        return priorAudio ? clone(priorAudio.dependsOn) : [dependency];
      }),
    }));
  const semanticProject = createPresentationAuthoringProject(baseInput);
  const manifestById = new Map(mediaClips.map((clip) => [clip.id, clip]));
  const narrationCells = semanticProject.cells.filter(({ kind }) => kind === 'narration');
  const assets = [];
  const clips = [];
  const dependencyOverrides = new Map();

  for (const narration of narrationCells) {
    const entryId = narration.turnId;
    const media = semanticProject.script.metadata?.cvShow?.entries?.[entryId]?.media;
    const manifestClip = manifestById.get(entryId);
    if (!media || !manifestClip) fail(`missing accepted media for ${entryId}`, { entryId });
    const sequence = sourceSequenceFor(sequences, entryId, manifestClip);
    const asset = audioAsset(entryId, media, manifestClip);
    assets.push(asset);
    const { alignment, cueCells } = createEntryAlignment(semanticProject, entryId, sequence);
    const groups = speechGroups(semanticProject, entryId, alignment, cueCells, sequence);
    const setup = cueCells.find(({ timing }) => timing.at.anchor === 'turn-start');
    if (!setup) fail(`missing setup event for ${entryId}`, { entryId });

    let sourceInMs = 0;
    let priorDependency = [{ cellId: setup.id, barrier: 'settled' }];
    for (const [index, group] of groups.entries()) {
      const priorClip = audioClip(
        entryId,
        asset.id,
        index,
        sourceInMs,
        group.boundaryMs,
        priorDependency,
      );
      clips.push(priorClip);
      dependencyOverrides.set(group.scroll.id, [{ cellId: priorClip.id, barrier: 'ended' }]);
      priorDependency = [{ cellId: group.attention.id, barrier: 'settled' }];
      sourceInMs = group.boundaryMs;
    }
    clips.push(audioClip(
      entryId,
      asset.id,
      groups.length,
      sourceInMs,
      asset.durationMs,
      priorDependency,
    ));
  }

  const input = clone(semanticProject);
  delete input.hash;
  input.revision = Math.max(Number(project.revision) || 0, semanticProject.revision) + 1;
  input.assets = assets;
  input.layers.push({
    id: AUDIO_LAYER_ID,
    kind: 'audio',
    name: 'Narration audio',
    visualOwnerId: null,
    collisionDomainId: null,
  });
  input.cells = input.cells.map((cell) => {
    const migrated = dependencyOverrides.has(cell.id)
      ? { ...cell, dependsOn: dependencyOverrides.get(cell.id) }
      : cell;
    if (migrated.kind !== 'cue' || migrated.timing.at.anchor !== 'speech') return migrated;
    return {
      ...migrated,
      timing: { ...migrated.timing, settleBy: 'none', until: null },
    };
  });
  input.cells.push(...clips);
  return createPresentationAuthoringProject(input);
}
