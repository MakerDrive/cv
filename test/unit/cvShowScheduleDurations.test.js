import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import test from 'node:test';

import { CV_SHOW_PRESENTATION_PROJECT } from '../../src/static-pages/data/cvShowPresentationProject.js';
import { CV_SHOW_WEB_AUDIO_RELEASE } from '../../src/static-pages/data/cvShowWebAudioRelease.js';
import { CV_SHOW_SCHEDULE_DURATIONS } from '../../src/static-pages/data/cvShowScheduleDurations.js';
import {
  createCvShowEntryTuple,
  createCvShowMediaBindingRegistry,
} from '../../src/static-pages/js/tour-player/presentationProjectAdapter.js';
import { CV_SHOW_STORY } from '../../src/static-pages/data/tourScripts.js';

const AUDIO_BASE = new URL('../../src/static-pages/copy-cv-show-audio/', import.meta.url);

test('schedule durations match the current audio release identity', () => {
  assert.equal(CV_SHOW_SCHEDULE_DURATIONS.releaseId, CV_SHOW_WEB_AUDIO_RELEASE.releaseId);
  const expectedIds = new Set(CV_SHOW_WEB_AUDIO_RELEASE.manifest
    ? [...storyEntryIds()]
    : []);
  assert.equal(new Set(Object.keys(CV_SHOW_SCHEDULE_DURATIONS.durations)).size, 30);
  for (const id of expectedIds) {
    const durationMs = CV_SHOW_SCHEDULE_DURATIONS.durations[id];
    assert.ok(Number.isSafeInteger(durationMs) && durationMs > 0, `${id}: duration`);
  }
});

test('schedule durations are reproducible from committed aligned sequences', async () => {
  const manifestPath = new URL(CV_SHOW_WEB_AUDIO_RELEASE.manifest.path, AUDIO_BASE);
  const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
  const mediaRegistry = createCvShowMediaBindingRegistry(CV_SHOW_PRESENTATION_PROJECT);
  const sampled = manifest.clips.filter((_, index) => index % 5 === 0);
  assert.ok(sampled.length >= 5, 'sampled clips');
  for (const clip of sampled) {
    const sequenceBytes = await readFile(new URL(clip.alignedSequenceFile, manifestPath));
    const observedHash = createHash('sha256').update(sequenceBytes).digest('hex');
    assert.equal(observedHash, clip.alignedSequenceSha256, `${clip.id}: sequence identity`);
    const tuple = createCvShowEntryTuple(CV_SHOW_PRESENTATION_PROJECT, clip.id, JSON.parse(sequenceBytes.toString('utf8')), {
      adapter: {
        playAudioClip: () => undefined,
        runInteraction: () => undefined,
        runAttention: () => undefined,
        waitForState: () => undefined,
      },
      mediaAncestry: mediaRegistry,
    });
    assert.equal(
      tuple.schedule.totalDurationMs,
      CV_SHOW_SCHEDULE_DURATIONS.durations[clip.id],
      `${clip.id}: committed duration matches the presentation schedule`,
    );
  }
});

function storyEntryIds() {
  return [
    ...CV_SHOW_STORY.short,
    ...Object.keys(CV_SHOW_STORY.branches),
  ];
}
