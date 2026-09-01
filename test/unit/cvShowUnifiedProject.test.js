import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

import {
  createPresentationPlaybackPlan,
  createPresentationAuthoringTimelineProjection,
  createPresentationTimelineEditorModel,
  projectPresentationNle,
  validatePresentationAuthoringProject,
} from 'symbiote-workspace';
import {
  CV_SHOW_PRESENTATION_PROJECT,
} from '../../src/static-pages/data/cvShowPresentationProject.js';
import {
  CV_SHOW_WEB_AUDIO_RELEASE,
} from '../../src/static-pages/data/cvShowWebAudioRelease.js';
import {
  applyCvShowMasterProjectCommands,
  createCvShowEntryTuple,
  projectCvShowPlaybackCheckpoint,
} from '../../src/static-pages/js/tour-player/presentationProjectAdapter.js';
import {
  CV_SHOW_STRUCTURAL_MEDIA_FIXTURE,
} from '../fixtures/cvShowStructuralMedia.js';

async function selectedWebAudioRelease() {
  const manifestUrl = new URL(
    `../../src/static-pages/copy-cv-show-audio/${CV_SHOW_WEB_AUDIO_RELEASE.manifest.path}`,
    import.meta.url,
  );
  return {
    root: new URL('./', manifestUrl),
    manifest: JSON.parse(await readFile(manifestUrl, 'utf8')),
  };
}

async function selectedSequence(entryId) {
  const { root, manifest } = await selectedWebAudioRelease();
  const clip = manifest.clips.find(({ id }) => id === entryId);
  assert.ok(clip, `missing selected web-audio clip ${entryId}`);
  return JSON.parse(await readFile(new URL(clip.alignedSequenceFile, root), 'utf8'));
}

test('CV Show owns narration audio as first-class Project clips', () => {
  const project = validatePresentationAuthoringProject(CV_SHOW_PRESENTATION_PROJECT);
  const timeline = createPresentationAuthoringTimelineProjection(project);
  const audioLayers = project.layers.filter(({ kind }) => kind === 'audio');
  const clips = project.cells.filter(({ kind }) => kind === 'audio-clip');
  const assetsById = new Map(project.assets.map((asset) => [asset.id, asset]));

  assert.equal(project.schemaVersion, 'workspace-presentation-authoring-project-v2');
  assert.equal(audioLayers.length, 1);
  assert.equal(project.assets.length, timeline.turns.length);
  assert.ok(clips.length >= timeline.turns.length);

  for (const turn of timeline.turns) {
    assert.ok(clips.some(({ turnId }) => turnId === turn.id), `missing audio clip for ${turn.id}`);
  }
  for (const clip of clips) {
    const asset = assetsById.get(clip.audio.assetId);
    assert.ok(asset, `missing asset for ${clip.id}`);
    assert.ok(clip.audio.sourceInMs >= 0);
    assert.ok(clip.audio.sourceOutMs > clip.audio.sourceInMs);
    assert.ok(clip.audio.sourceOutMs <= asset.durationMs);
    for (const dependency of clip.dependsOn) {
      assert.ok(
        project.cells.some(({ id }) => id === dependency.cellId),
        `unresolved dependency ${dependency.cellId} for ${clip.id}`,
      );
    }
  }
});

test('visual NLE and hidden CV playback are projections of the same entry graph', async () => {
  const sequence = await selectedSequence('symbiote-ui');
  const tuple = createCvShowEntryTuple(
    CV_SHOW_PRESENTATION_PROJECT,
    'symbiote-ui',
    sequence,
    {
      adapter: {
        playAudioClip() {},
        runInteraction() {},
        runAttention() {},
        waitForState() {},
      },
    },
  );
  const playbackPlan = createPresentationPlaybackPlan(tuple.project, tuple.schedule);
  const nle = projectPresentationNle(tuple.project, tuple.schedule);
  const timelineEditorModel = createPresentationTimelineEditorModel(
    tuple.project,
    tuple.schedule,
  );
  const audioTrack = nle.tracks.find(({ kind }) => kind === 'audio');
  const annotationTrack = nle.tracks.find(({ kind }) => kind === 'annotation');
  const projectClips = tuple.project.cells.filter(({ kind }) => kind === 'audio-clip');
  const projectMarkers = tuple.project.cells.filter(({ kind, cue }) => (
    kind === 'cue' && cue.kind === 'annotation'
  ));
  const clipProjection = ({ id, audio, timing, dependsOn }) => ({
    id,
    audio,
    timing,
    dependsOn,
  });
  const clipMediaProjection = ({ id, audio, timing }) => ({ id, audio, timing });

  assert.deepEqual(tuple.playbackPlan, playbackPlan);
  assert.deepEqual(tuple.nle, nle);
  assert.deepEqual(tuple.timelineEditorModel, timelineEditorModel);
  assert.equal(tuple.timelineEditorModel.authoringProjectHash, tuple.project.hash);
  assert.equal(tuple.timelineEditorModel.scheduleHash, tuple.schedule.hash);
  assert.equal(tuple.timelineEditorModel.nleHash, tuple.nle.hash);
  assert.deepEqual(
    tuple.timelineEditorModel.tracks.map(({ id }) => id),
    [...tuple.nle.tracks, ...tuple.nle.generatedTracks].map(({ id }) => id),
  );
  assert.equal(playbackPlan.authoringProjectHash, tuple.project.hash);
  assert.equal(playbackPlan.scheduleHash, tuple.schedule.hash);
  assert.equal(nle.authoringProjectHash, tuple.project.hash);
  assert.equal(nle.scheduleHash, tuple.schedule.hash);
  assert.deepEqual(
    playbackPlan.clips.map(clipProjection),
    projectClips.map(clipProjection),
  );
  assert.deepEqual(
    audioTrack.clips.map(clipMediaProjection),
    projectClips.map(clipMediaProjection),
  );
  assert.deepEqual(nle.generatedTracks, []);
  assert.deepEqual(
    annotationTrack.clips.map(({ cellId, cue }) => ({ cellId, annotation: cue.annotation })),
    projectMarkers.map(({ id, cue }) => ({ cellId: id, annotation: cue.annotation })),
  );
  assert.deepEqual(
    new Set(tuple.project.assets.map(({ id }) => id)),
    new Set(projectClips.map(({ audio }) => audio.assetId)),
  );
  const playbackDependencies = new Map(
    playbackPlan.cells.map(({ id, dependsOn }) => [id, dependsOn]),
  );
  for (const cell of tuple.project.cells) {
    assert.deepEqual(playbackDependencies.get(cell.id), cell.dependsOn);
  }

  assert.equal(tuple.audioComposition.authoringProjectHash, tuple.project.hash);
  assert.equal(tuple.audioComposition.scheduleHash, tuple.schedule.hash);
  assert.deepEqual(
    tuple.audioComposition.clips.map(({ clipId }) => clipId),
    projectClips.map(({ id }) => id),
  );
  assert.deepEqual(
    tuple.audioComposition.clips.map(({ timelineInMs, timelineOutMs }) => ({
      timelineInMs,
      timelineOutMs,
    })),
    playbackPlan.clips.map(({ span }) => ({
      timelineInMs: span.startMs,
      timelineOutMs: span.endMs,
    })),
  );
  assert.ok(tuple.audioComposition.clips.flatMap(({ words }) => words).length > 0);
});

test('checkpoint entry slices retain the exact current and future audio graph', async () => {
  const sequence = await selectedSequence('symbiote-ui');
  const masterClips = CV_SHOW_PRESENTATION_PROJECT.cells.filter((cell) => (
    cell.kind === 'audio-clip' && cell.turnId === 'symbiote-ui'
  ));
  const full = createCvShowEntryTuple(
    CV_SHOW_PRESENTATION_PROJECT,
    'symbiote-ui',
    sequence,
    {
      adapter: {
        playAudioClip() {},
        runInteraction() {},
        runAttention() {},
        waitForState() {},
      },
    },
  );
  const firstPlanClip = full.playbackPlan.clips[0];
  const mapped = projectCvShowPlaybackCheckpoint(
    full.playbackPlan,
    firstPlanClip.span.startMs + 260,
  );
  assert.equal(mapped.projectTimeMs, firstPlanClip.span.startMs + 260);
  assert.equal(mapped.sourceTimeMs, firstPlanClip.audio.sourceInMs + 260);
  assert.equal(mapped.clipId, firstPlanClip.id);
  assert.equal(mapped.phase, 'clip');

  const second = masterClips[1];
  const secondPlanClip = full.playbackPlan.clips.find(({ id }) => id === second.id);
  const checkpointMs = secondPlanClip.span.startMs + 1;
  const adapter = {
    playAudioClip() {},
    runInteraction() {},
    runAttention() {},
    waitForState() {},
  };
  const inside = createCvShowEntryTuple(
    CV_SHOW_PRESENTATION_PROJECT,
    'symbiote-ui',
    sequence,
    { checkpointMs, adapter },
  );
  const insideClips = inside.project.cells.filter(({ kind }) => kind === 'audio-clip');

  assert.deepEqual(insideClips.map(({ id }) => id), masterClips.slice(1).map(({ id }) => id));
  assert.deepEqual(insideClips[0].audio, second.audio);
  assert.equal(inside.project.assets.length, 1);
  assert.equal(inside.project.assets[0].id, second.audio.assetId);
  assert.equal(inside.playbackPlan.authoringProjectHash, inside.project.hash);

  const boundary = createCvShowEntryTuple(
    CV_SHOW_PRESENTATION_PROJECT,
    'symbiote-ui',
    sequence,
    { checkpointMs: firstPlanClip.span.endMs, adapter },
  );
  const boundaryIds = boundary.playbackPlan.cells.map(({ id }) => id);
  const firstNextEvent = CV_SHOW_PRESENTATION_PROJECT.cells.find((cell) => (
    cell.dependsOn?.some(({ cellId, barrier }) => (
      cellId === masterClips[0].id && barrier === 'ended'
    ))
  ));

  assert.equal(boundaryIds.includes(masterClips[0].id), false);
  assert.equal(boundaryIds.includes(firstNextEvent.id), true);
  assert.equal(boundaryIds.includes(masterClips[1].id), true);
});

test('structural media fixture preserves canonical audio clip timing after duration scaling', () => {
  for (const clip of CV_SHOW_STRUCTURAL_MEDIA_FIXTURE.project.cells.filter((cell) => (
    cell.kind === 'audio-clip'
  ))) {
    assert.deepEqual(clip.timing.at, {
      anchor: 'turn-start',
      offsetMs: clip.audio.sourceInMs,
    });
  }
});

test('all accepted CV entries compose Whisper words onto their exact Project edit timeline', async () => {
  const { root: releaseRoot, manifest } = await selectedWebAudioRelease();
  const adapter = {
    playAudioClip() {},
    runInteraction() {},
    runAttention() {},
    waitForState() {},
  };

  for (const accepted of manifest.clips) {
    const sequence = JSON.parse(await readFile(
      new URL(accepted.alignedSequenceFile, releaseRoot),
      'utf8',
    ));
    const tuple = createCvShowEntryTuple(
      CV_SHOW_PRESENTATION_PROJECT,
      accepted.id,
      sequence,
      { adapter },
    );
    const clipIds = tuple.project.cells
      .filter(({ kind }) => kind === 'audio-clip')
      .map(({ id }) => id);
    const composedWords = tuple.audioComposition.clips.flatMap(({ words }) => words);

    assert.deepEqual(
      tuple.audioComposition.clips.map(({ clipId }) => clipId),
      clipIds,
      accepted.id,
    );
    assert.ok(composedWords.length > 0, accepted.id);
    assert.ok(composedWords.every(({ startMs, endMs }) => endMs > startMs), accepted.id);
    for (let index = 1; index < tuple.audioComposition.clips.length; index += 1) {
      assert.ok(
        tuple.audioComposition.clips[index].timelineInMs
          >= tuple.audioComposition.clips[index - 1].timelineOutMs,
        accepted.id,
      );
    }
  }
});

test('hidden CV transport persists Project time instead of raw source-audio time', async () => {
  const source = await readFile(new URL(
    '../../src/ui-components/client-only/tour-player/tour-player.js',
    import.meta.url,
  ), 'utf8');
  const runtimeSource = await readFile(new URL(
    '../../src/static-pages/js/tour-player/index.js',
    import.meta.url,
  ), 'utf8');

  assert.doesNotMatch(
    source,
    /Math\.round\(Number\(this\.#speech\.media\?\.currentTime \|\| 0\) \* 1000\)/u,
  );
  assert.match(
    source,
    /const parentPositionMs = Math\.round\(this\.#presentationPositionMs\(\)\)/u,
  );
  assert.match(
    source,
    /timeMs: this\.\$\.isRunning\s*\? Math\.round\(this\.#presentationPositionMs\(\)\)/u,
  );
  const playerTimelineSource = source.match(
    /function playerTimeline\([\s\S]*?\n\}/u,
  )?.[0];
  assert.ok(playerTimelineSource, 'playerTimeline source');
  assert.match(playerTimelineSource, /projectDurations\.get\(entry\.id\)/u);
  assert.doesNotMatch(playerTimelineSource, /durationMilliseconds/u);
  assert.match(
    source,
    /projectCvShowScheduleDuration\(aligned\)/u,
  );
  const routePolicySource = runtimeSource.match(
    /const routePolicy = \(\) => \{[\s\S]*?\n  \};/u,
  )?.[0];
  assert.ok(routePolicySource, 'routePolicy source');
  assert.doesNotMatch(routePolicySource, /getDurationMs|durationMilliseconds/u);
});

test('an agent split remains a valid CV Project graph and moves downstream events after the right clip', () => {
  const left = CV_SHOW_PRESENTATION_PROJECT.cells.find((cell) => (
    cell.kind === 'audio-clip' && cell.turnId === 'positioning'
  ));
  const downstream = CV_SHOW_PRESENTATION_PROJECT.cells.find((cell) => (
    cell.dependsOn?.some(({ cellId, barrier }) => cellId === left.id && barrier === 'ended')
  ));
  const rightCellId = `${left.id}:agent-split`;
  const project = applyCvShowMasterProjectCommands(CV_SHOW_PRESENTATION_PROJECT, [{
    schemaVersion: 'workspace-presentation-authoring-command-v1',
    id: 'agent-split-positioning-audio',
    base: {
      revision: CV_SHOW_PRESENTATION_PROJECT.revision,
      authoringProjectHash: CV_SHOW_PRESENTATION_PROJECT.hash,
    },
    type: 'audio-clip.split',
    payload: {
      cellId: left.id,
      sourceAtMs: left.audio.sourceInMs + 1,
      rightCellId,
    },
  }]);
  const right = project.cells.find(({ id }) => id === rightCellId);
  const movedDownstream = project.cells.find(({ id }) => id === downstream.id);

  assert.deepEqual(right.dependsOn, [{ cellId: left.id, barrier: 'ended' }]);
  assert.equal(
    movedDownstream.dependsOn.some(({ cellId, barrier }) => (
      cellId === right.id && barrier === 'ended'
    )),
    true,
  );
});
