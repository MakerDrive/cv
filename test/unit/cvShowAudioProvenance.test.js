import assert from 'node:assert/strict';
import test from 'node:test';
import { createPresentationAuthoringProject } from 'symbiote-workspace';
import { CV_SHOW_PRESENTATION_PROJECT } from '../../src/static-pages/data/cvShowPresentationProject.js';
import {
  createCvShowEntryProject,
  createCvShowEntryProvenance,
} from '../../src/static-pages/js/tour-player/presentationProjectAdapter.js';
import {
  createCvShowAudioProvenance,
  planCvShowAudioDirtySet,
} from '../../scripts/cv-show-audio-provenance.js';

const AUDIO_INPUTS = Object.freeze({
  voice: Object.freeze({
    selectionId: 'barzana-2',
    reference: 'qwen3:speaker:barzana2-review-20260827',
  }),
  synthesisPolicy: Object.freeze({
    backend: 'qwen3-clone',
    normalization: 'ru-v1',
    pronunciation: 'accepted-v1',
  }),
  asr: Object.freeze({
    backend: 'faster-whisper',
    model: 'large-v3-turbo',
  }),
  aligner: Object.freeze({
    contractVersion: 'workspace-aligned-sequence-v3',
    tokenizer: 'unicode-word-v1',
  }),
});

function projectVariant(change) {
  let input = structuredClone(CV_SHOW_PRESENTATION_PROJECT);
  delete input.hash;
  change(input);
  return createPresentationAuthoringProject(input);
}

function narrationVariant(entryId = 'positioning') {
  return projectVariant((input) => {
    let cell = input.cells.find(({ id }) => id === `cv-show:narration:${entryId}`);
    cell.turn.text = `${cell.turn.text} Точное изменение.`;
  });
}

function anchorVariant(entryId = 'positioning') {
  return projectVariant((input) => {
    let cellIds = new Set([
      `cv-show:cue:${entryId}.tenure-marker:scroll`,
      `cv-show:cue:${entryId}.tenure-marker`,
    ]);
    for (let cell of input.cells.filter(({ id }) => cellIds.has(id))) {
      cell.timing.at.quote = 'программные платформы и агентные продукты';
    }
  });
}

function attentionVariant(entryId = 'positioning') {
  return projectVariant((input) => {
    let cell = input.cells.find(({ id }) => id === `cv-show:cue:${entryId}.tenure-marker`);
    cell.timing.gestureDurationMs += 1;
  });
}

test('entry slices exclude unrelated master, media, and global story state', () => {
  let entryId = 'positioning';
  let baseline = createCvShowEntryProject(CV_SHOW_PRESENTATION_PROJECT, entryId);
  let variants = [
    projectVariant((input) => { input.revision += 1; }),
    projectVariant((input) => {
      input.script.metadata.cvShow.contractRevision = 'unrelated-story-contract-revision';
    }),
    projectVariant((input) => {
      input.script.metadata.cvShow.entries[entryId].media.durationMilliseconds += 1;
    }),
    projectVariant((input) => {
      let cell = input.cells.find(({ id }) => id === 'cv-show:narration:symbiote-workspace');
      cell.turn.text = `${cell.turn.text} Независимое изменение.`;
    }),
  ];

  assert.equal(baseline.revision, 0);
  assert.equal(Object.hasOwn(baseline.script.metadata.cvShow.slice, 'masterProjectHash'), false);
  assert.equal(Object.hasOwn(baseline.script.metadata.cvShow.slice, 'masterRevision'), false);
  assert.equal(Object.hasOwn(baseline.script.metadata.cvShow.slice, 'media'), false);
  for (let variant of variants) {
    let slice = createCvShowEntryProject(variant, entryId);
    assert.equal(slice.id, baseline.id);
    assert.equal(slice.hash, baseline.hash);
    assert.equal(slice.revision, baseline.revision);
  }
});

test('entry provenance isolates narration, anchors, attention, and unrelated entries', () => {
  let baseline = createCvShowEntryProvenance(CV_SHOW_PRESENTATION_PROJECT);
  let narratedProject = narrationVariant();
  let narrated = createCvShowEntryProvenance(narratedProject);
  let anchored = createCvShowEntryProvenance(anchorVariant());
  let attended = createCvShowEntryProvenance(attentionVariant());
  let entryIds = baseline.entries.map(({ entryId }) => entryId);
  let baselineById = new Map(baseline.entries.map((entry) => [entry.entryId, entry]));
  let narratedById = new Map(narrated.entries.map((entry) => [entry.entryId, entry]));
  let target = baselineById.get('positioning');

  assert.equal(baseline.schemaVersion, 'cv-show-entry-provenance-v1');
  assert.equal(baseline.entries.length, 30);
  assert.equal(new Set(entryIds).size, 30);
  assert.equal(Object.isFrozen(baseline), true);
  assert.equal(Object.isFrozen(target.sourceCellIds), true);
  assert.match(target.entryProjectionHash, /^cv-show-entry-projection-v1:sha256-/u);
  assert.match(target.narrationInputHash, /^cv-show-narration-input-v1:sha256-/u);
  assert.match(target.anchorContractHash, /^cv-show-anchor-contract-v1:sha256-/u);
  assert.match(target.attentionContractHash, /^cv-show-attention-contract-v1:sha256-/u);

  assert.notEqual(narratedById.get('positioning').entryProjectionHash, target.entryProjectionHash);
  assert.notEqual(narratedById.get('positioning').narrationInputHash, target.narrationInputHash);
  assert.equal(narratedById.get('positioning').anchorContractHash, target.anchorContractHash);
  assert.equal(narratedById.get('positioning').attentionContractHash, target.attentionContractHash);
  for (let entryId of entryIds.filter((value) => value !== 'positioning')) {
    assert.deepEqual(narratedById.get(entryId), baselineById.get(entryId));
  }
  assert.deepEqual(entryIds.filter((entryId) => (
    createCvShowEntryProject(narratedProject, entryId).hash
      !== createCvShowEntryProject(CV_SHOW_PRESENTATION_PROJECT, entryId).hash
  )), ['positioning']);

  let anchoredTarget = anchored.entries.find(({ entryId }) => entryId === 'positioning');
  assert.equal(anchoredTarget.narrationInputHash, target.narrationInputHash);
  assert.notEqual(anchoredTarget.anchorContractHash, target.anchorContractHash);
  assert.equal(anchoredTarget.attentionContractHash, target.attentionContractHash);

  let attendedTarget = attended.entries.find(({ entryId }) => entryId === 'positioning');
  assert.equal(attendedTarget.narrationInputHash, target.narrationInputHash);
  assert.equal(attendedTarget.anchorContractHash, target.anchorContractHash);
  assert.notEqual(attendedTarget.attentionContractHash, target.attentionContractHash);

  assert.notEqual(
    createCvShowEntryProject(narrationVariant(), 'positioning').hash,
    createCvShowEntryProject(CV_SHOW_PRESENTATION_PROJECT, 'positioning').hash,
  );
});

test('audio provenance planner computes the exact phase dirty matrix', () => {
  let accepted = createCvShowAudioProvenance({
    project: CV_SHOW_PRESENTATION_PROJECT,
    ...AUDIO_INPUTS,
  });
  let entryIds = accepted.entries.map(({ entryId }) => entryId);
  let plan = (overrides = {}) => planCvShowAudioDirtySet({
    accepted,
    project: CV_SHOW_PRESENTATION_PROJECT,
    ...AUDIO_INPUTS,
    ...overrides,
  });

  assert.deepEqual(plan().dirty, {
    synthesis: [],
    transcription: [],
    alignment: [],
    runtimeProjection: [],
  });
  for (let input of [
    { voice: { ...AUDIO_INPUTS.voice, reference: 'qwen3:speaker:new-reference' } },
    {
      synthesisPolicy: {
        ...AUDIO_INPUTS.synthesisPolicy,
        pronunciation: 'accepted-v2',
      },
    },
  ]) {
    assert.deepEqual(plan(input).dirty, {
      synthesis: entryIds,
      transcription: entryIds,
      alignment: entryIds,
      runtimeProjection: [],
    });
  }
  assert.deepEqual(plan({ project: narrationVariant() }).dirty, {
    synthesis: ['positioning'],
    transcription: ['positioning'],
    alignment: ['positioning'],
    runtimeProjection: ['positioning'],
  });
  assert.deepEqual(plan({
    project: narrationVariant(),
    dependants: { positioning: ['symbiote-workspace'] },
  }).dirty, {
    synthesis: ['positioning', 'symbiote-workspace'],
    transcription: ['positioning', 'symbiote-workspace'],
    alignment: ['positioning', 'symbiote-workspace'],
    runtimeProjection: ['positioning', 'symbiote-workspace'],
  });
  assert.deepEqual(plan({
    project: anchorVariant(),
    dependants: { positioning: ['symbiote-workspace'] },
  }).dirty, {
    synthesis: [],
    transcription: [],
    alignment: [],
    runtimeProjection: ['positioning', 'symbiote-workspace'],
  });
  assert.deepEqual(plan({ project: attentionVariant() }).dirty, {
    synthesis: [],
    transcription: [],
    alignment: [],
    runtimeProjection: ['positioning'],
  });
  assert.deepEqual(plan({ asr: { ...AUDIO_INPUTS.asr, model: 'large-v4' } }).dirty, {
    synthesis: [],
    transcription: entryIds,
    alignment: entryIds,
    runtimeProjection: [],
  });
  assert.deepEqual(plan({
    aligner: { ...AUDIO_INPUTS.aligner, tokenizer: 'unicode-word-v2' },
  }).dirty, {
    synthesis: [],
    transcription: [],
    alignment: entryIds,
    runtimeProjection: [],
  });
});
