import {
  createPresentationAlignedSequence,
  createPresentationAuthoringProject,
  createPresentationAuthoringProjectHashes,
  createPresentationAuthoringTimelineProjection,
  createPresentationExecutionController,
  createPresentationScheduleV2,
  validatePresentationAuthoringProject,
} from 'symbiote-workspace/browser';
import { computeIntegrity } from 'symbiote-workspace/schema/canonical-json.js';
import {
  CV_SHOW_PRESENTATION_PROJECT,
  projectCvShowAttentionTimelines,
  projectCvShowDirective,
  projectCvShowStory,
} from '../../data/cvShowPresentationProject.js';
export {
  projectCvShowAttentionTimelines,
  projectCvShowDirective,
  projectCvShowStory,
};

/**
 * @typedef {{
 *   audioClip?: Record<string, any>,
 *   alignmentClip?: Record<string, any>,
 *   sourceSequence?: Record<string, any>,
 *   mediaAncestry?: Record<string, any>,
 * }} CvShowRuntimeAdmissionOptions
 */

/**
 * @typedef {{
 *   checkpointMs?: number | null,
 *   adapter?: Record<string, any>,
 *   mediaAdmission?: CvShowRuntimeAdmissionOptions | null,
 *   mediaAncestry?: Record<string, any>,
 *   onReceipt?: (...args: any[]) => any,
 * }} CvShowEntryTupleOptions
 */

const PROJECT_SCHEMA = 'workspace-presentation-authoring-project-v1';
const SOURCE_ALIGNMENT_SCHEMA = 'workspace-aligned-sequence-v3';
const MEDIA_REGISTRY_SCHEMA = 'cv-show-media-binding-registry-v1';
const MEDIA_ENTRY_SCHEMA = 'cv-show-media-binding-entry-v1';
const MEDIA_COLLECTION_SCHEMA = 'workspace-presentation-media-collection-v1';
const MEDIA_COLLECTION_IDENTITY_SCHEMA = 'cv-show-media-collection-identity-v1';
const RENDER_BINDING_SCHEMA = 'cv-show-render-binding-v1';
const ENTRY_PROVENANCE_SCHEMA = 'cv-show-entry-provenance-v1';
const ENTRY_PROJECTION_SCHEMA = 'cv-show-entry-projection-v1';
const NARRATION_INPUT_SCHEMA = 'cv-show-narration-input-v1';
const ANCHOR_CONTRACT_SCHEMA = 'cv-show-anchor-contract-v1';
const ATTENTION_CONTRACT_SCHEMA = 'cv-show-attention-contract-v1';
const ENTRY_SLICE_SCHEMA = 'cv-show-entry-slice-v1';
const SHA256_HASH_RE = /^sha256:[a-f0-9]{64}$/u;
const SHA256_INTEGRITY_RE = /:sha256-[A-Za-z0-9+/]{43}=$/u;

function clone(value) {
  return structuredClone(value);
}

function freezeDeep(value) {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
  for (let child of Object.values(value)) freezeDeep(child);
  return Object.freeze(value);
}

function invalidProject(reason, details = {}) {
  return Object.assign(
    new TypeError(`CV Show presentation project is invalid: ${reason}`),
    { code: 'CV_SHOW_PRESENTATION_PROJECT_INVALID', details },
  );
}

function staleMedia(entryId, details = {}) {
  return Object.assign(
    new TypeError(`CV Show media ancestry is stale: ${entryId}`),
    {
      code: 'CV_SHOW_MEDIA_ANCESTRY_STALE',
      details: { entryId, executionCreated: false, ...details },
    },
  );
}

function rejectedRuntimeAdmission(entryId, reason, details = {}) {
  return Object.assign(
    new TypeError(`CV Show runtime media admission rejected: ${entryId}/${reason}`),
    {
      code: 'CV_SHOW_RUNTIME_MEDIA_ADMISSION_REJECTED',
      details: { entryId, reason, executionCreated: false, ...details },
    },
  );
}

function metadata(project) {
  const value = project.script.metadata?.cvShow;
  if (!value?.entries || !value?.directives) throw invalidProject('metadata');
  return value;
}

function entryCells(project, entryId) {
  return project.cells.filter(({ turnId }) => turnId === entryId);
}

function directiveMetadataForTurn(project, entryId) {
  const cvShow = metadata(project);
  const directives = cvShow.directives;
  const sourceOrder = cvShow.slice?.sourceCellIds;
  const cells = sourceOrder
    ? sourceOrder.map((cellId) => project.cells.find(({ id }) => id === cellId)).filter(Boolean)
    : project.cells;
  return cells
    .filter((cell) => (
      cell.kind === 'cue' && cell.turnId === entryId && !cell.id.endsWith(':scroll')
    ))
    .map((cell) => [cell.id, {
      ...(directives[cell.id] || { refinements: {} }),
      id: cell.id.replace(/^cv-show:cue:/u, ''),
      phase: cell.timing.at.anchor === 'turn-start' ? 'setup' : 'speech',
    }]);
}

function exactDependency(cell, ownerId) {
  return cell.dependsOn.length === 1
    && cell.dependsOn[0].cellId === ownerId
    && cell.dependsOn[0].barrier === 'settled';
}

function projectShape(project) {
  return Object.freeze({
    cells: new Map(project.cells.map((cell) => [cell.id, Object.freeze({
      kind: cell.kind,
      layerId: cell.layerId,
      replyTo: cell.kind === 'narration' ? cell.turn.replyTo || null : null,
      role: cell.kind === 'narration'
        ? 'narration'
        : cell.id.endsWith(':scroll')
          ? 'scroll'
          : cell.timing.at.anchor === 'turn-start' ? 'setup' : 'speech',
      turnId: cell.turnId,
    })])),
    cellIds: Object.freeze(project.cells.map(({ id }) => id)),
    layerIds: Object.freeze(project.layers.map(({ id }) => id)),
  });
}

const CANONICAL_MASTER_SHAPE = projectShape(CV_SHOW_PRESENTATION_PROJECT);

export function validateCvShowMasterProject(projectInput) {
  const project = validatePresentationAuthoringProject(projectInput);
  const cvShow = metadata(project);
  const timeline = createPresentationAuthoringTimelineProjection(project);
  const narrationCells = project.cells.filter(({ kind }) => kind === 'narration');
  if (
    project.id !== 'cv-show'
    || cvShow.slice
    || timeline.turns.length !== 30
    || timeline.turns.filter(({ replyTo }) => !replyTo).length !== 16
    || narrationCells.length !== 30
    || Object.keys(cvShow.entries).length !== 30
  ) {
    throw invalidProject('canonical 30-turn master required');
  }
  const turnIds = timeline.turns.map(({ id }) => id);
  if (
    new Set(turnIds).size !== 30
    || turnIds.some((entryId) => !cvShow.entries[entryId])
    || narrationCells.some(({ turnId }) => !cvShow.entries[turnId])
  ) {
    throw invalidProject('master turn registry');
  }
  if (
    project.cells.length !== CANONICAL_MASTER_SHAPE.cells.size
    || project.layers.length !== CANONICAL_MASTER_SHAPE.layerIds.length
    || project.layers.some(({ id }, index) => id !== CANONICAL_MASTER_SHAPE.layerIds[index])
    || project.cells.some(({ id }, index) => id !== CANONICAL_MASTER_SHAPE.cellIds[index])
  ) {
    throw invalidProject('master structural shape');
  }
  for (let cell of project.cells) {
    const expected = CANONICAL_MASTER_SHAPE.cells.get(cell.id);
    const role = cell.kind === 'narration'
      ? 'narration'
      : cell.id.endsWith(':scroll')
        ? 'scroll'
        : cell.timing.at.anchor === 'turn-start' ? 'setup' : 'speech';
    if (
      !expected
      || expected.kind !== cell.kind
      || expected.layerId !== cell.layerId
      || expected.turnId !== cell.turnId
      || expected.replyTo !== (cell.kind === 'narration' ? cell.turn.replyTo || null : null)
      || expected.role !== role
    ) {
      throw invalidProject(`unsupported structural cell ${cell.id}`);
    }
  }
  for (let entryId of turnIds) {
    const source = entryCells(project, entryId);
    const narration = source.filter(({ kind }) => kind === 'narration');
    const attention = source.filter((cell) => (
      cell.kind === 'cue' && !cell.id.endsWith(':scroll')
    ));
    const setup = attention.filter(({ timing }) => timing.at.anchor === 'turn-start');
    const speech = attention.filter(({ timing }) => timing.at.anchor === 'speech');
    if (narration.length !== 1 || setup.length !== 1 || speech.length === 0) {
      throw invalidProject(`incomplete master turn ${entryId}`);
    }
    let previousCellId = null;
    for (let cell of speech) {
      const scroll = source.find(({ id }) => id === `${cell.id}:scroll`);
      if (
        !scroll
        || scroll.cue?.interaction?.type !== 'scroll'
        || scroll.cue.targetId !== cell.cue.targetId
        || (previousCellId === null
          ? !(scroll.dependsOn.length === 0 || exactDependency(scroll, setup[0].id))
          : !exactDependency(scroll, previousCellId))
        || !exactDependency(cell, scroll.id)
      ) {
        throw invalidProject(`group dependency ${cell.id}`);
      }
      previousCellId = cell.id;
    }
  }
  projectCvShowStory(project);
  projectCvShowAttentionTimelines(project);
  return project;
}

function mediaBindingIssue(binding, narrationCellHash) {
  if (!binding || typeof binding !== 'object' || Array.isArray(binding)) return 'binding';
  if (!Number.isInteger(binding.durationMilliseconds) || binding.durationMilliseconds <= 0) {
    return 'durationMilliseconds';
  }
  if (!SHA256_HASH_RE.test(String(binding.wavHash || ''))) return 'wavHash';
  if (
    !String(binding.sourceAlignedSequenceHash || '').startsWith(`${SOURCE_ALIGNMENT_SCHEMA}:`)
    || !SHA256_INTEGRITY_RE.test(binding.sourceAlignedSequenceHash)
  ) {
    return 'sourceAlignedSequenceHash';
  }
  if (!SHA256_HASH_RE.test(String(binding.sourceAlignmentFileHash || ''))) {
    return 'sourceAlignmentFileHash';
  }
  if (
    !String(binding.sourceTimelineHash || '').startsWith('presentation-timeline-v3:')
    || !SHA256_INTEGRITY_RE.test(binding.sourceTimelineHash)
  ) {
    return 'sourceTimelineHash';
  }
  if (
    !String(binding.sourceNarrationCellHash || '')
      .startsWith(`${PROJECT_SCHEMA}:cell:`)
    || !SHA256_INTEGRITY_RE.test(binding.sourceNarrationCellHash)
    || binding.sourceNarrationCellHash !== narrationCellHash
  ) {
    return 'sourceNarrationCellHash';
  }
  return null;
}

function mediaEntryIssue(entry, authoritative) {
  if (!entry || entry.schemaVersion !== MEDIA_ENTRY_SCHEMA) return 'entry';
  if (entry.entryId !== authoritative.entryId) return 'entryId';
  if (entry.status !== 'accepted' || entry.playable !== true) return 'playability';
  if (entry.sourceNarrationCellHash !== authoritative.sourceNarrationCellHash) {
    return 'sourceNarrationCellHash';
  }
  if (entry.narrationCellHash !== authoritative.narrationCellHash) {
    return 'narrationCellHash';
  }
  if (JSON.stringify(entry.binding) !== JSON.stringify(authoritative.binding)) return 'binding';
  if (
    entry.audio?.status !== 'accepted'
    || entry.audio.wavHash !== authoritative.binding.wavHash
    || entry.audio.durationMilliseconds !== authoritative.binding.durationMilliseconds
  ) {
    return 'audio';
  }
  if (
    entry.alignment?.status !== 'accepted'
    || entry.alignment.alignedSequenceHash !== authoritative.binding.sourceAlignedSequenceHash
    || entry.alignment.sourceFileHash !== authoritative.binding.sourceAlignmentFileHash
    || entry.alignment.timelineHash !== authoritative.binding.sourceTimelineHash
  ) {
    return 'alignment';
  }
  if (
    entry.render?.status !== 'accepted'
    || JSON.stringify(entry.render.binding) !== JSON.stringify(authoritative.binding)
  ) {
    return 'render';
  }
  return null;
}

function renderBindingHash(binding) {
  return `${RENDER_BINDING_SCHEMA}:${computeIntegrity(binding)}`;
}

function createCvShowMediaBindingRegistryFromMaster(project, mediaCollection = null) {
  const cvShow = metadata(project);
  const cellHashes = new Map(createPresentationAuthoringProjectHashes(project).cellHashes
    .map(({ cellId, hash }) => [cellId, hash]));
  const collectionEntries = mediaCollection?.schemaVersion === MEDIA_COLLECTION_SCHEMA
    && Array.isArray(mediaCollection.entries)
    ? new Map(mediaCollection.entries.map((entry) => [entry.entryId, entry]))
    : null;
  const entries = Object.fromEntries(Object.entries(cvShow.entries).map(([entryId, value]) => {
    const binding = value.media;
    const narrationCellHash = cellHashes.get(`cv-show:narration:${entryId}`) || '';
    const accepted = mediaBindingIssue(binding, narrationCellHash) === null;
    const status = accepted ? 'accepted' : 'stale';
    const exactBinding = clone(binding || {});
    const collectionEntry = collectionEntries?.get(entryId) || null;
    const ancestry = collectionEntry?.mediaAncestry || null;
    const completeBinding = accepted
      && ancestry?.playable === true
      && ancestry.audio?.status === 'accepted'
      && ancestry.audio.hash === binding.wavHash
      && ancestry.alignment?.status === 'accepted'
      && ancestry.alignment.hash === binding.sourceAlignedSequenceHash
      && ancestry.render?.status === 'accepted'
      && ancestry.render.hash === renderBindingHash(binding);
    const playable = collectionEntries ? Boolean(completeBinding) : accepted;
    const admissionCode = playable
      ? 'CV_SHOW_MEDIA_RUNTIME_BINDING_READY'
      : accepted && ancestry?.playable !== true
        ? 'CV_SHOW_MEDIA_REGENERATION_REQUIRED'
        : 'CV_SHOW_MEDIA_RUNTIME_BINDING_INCOMPLETE';
    const entryStatus = playable ? 'accepted' : 'stale';
    return [entryId, {
      schemaVersion: MEDIA_ENTRY_SCHEMA,
      entryId,
      sourceNarrationCellHash: binding?.sourceNarrationCellHash || '',
      narrationCellHash,
      status: entryStatus,
      playable,
      binding: exactBinding,
      audio: {
        status: playable ? 'accepted' : ancestry?.audio?.status || status,
        wavHash: binding?.wavHash || '',
        durationMilliseconds: binding?.durationMilliseconds ?? null,
      },
      alignment: {
        status: playable ? 'accepted' : ancestry?.alignment?.status || status,
        alignedSequenceHash: binding?.sourceAlignedSequenceHash || '',
        sourceFileHash: binding?.sourceAlignmentFileHash || '',
        timelineHash: binding?.sourceTimelineHash || '',
      },
      render: {
        status: playable ? 'accepted' : ancestry?.render?.status || status,
        binding: exactBinding,
      },
      admission: {
        status: playable ? 'ready' : 'blocked',
        code: admissionCode,
      },
    }];
  }));
  return freezeDeep({
    schemaVersion: MEDIA_REGISTRY_SCHEMA,
    projectHash: project.hash,
    projectRevision: project.revision,
    mediaCollectionIdentity: mediaCollection
      ? `${MEDIA_COLLECTION_IDENTITY_SCHEMA}:${computeIntegrity(mediaCollection)}`
      : null,
    entries,
  });
}

export function createCvShowMediaBindingRegistry(projectInput, mediaCollection = null) {
  return createCvShowMediaBindingRegistryFromMaster(
    validateCvShowMasterProject(projectInput),
    mediaCollection,
  );
}

function portableHashToken(hash) {
  const digest = hash.split(':').at(-1).replace(/^sha256-/u, '');
  return Array.from(atob(digest), (character) => (
    character.charCodeAt(0).toString(16).padStart(2, '0')
  )).join('');
}

function identity(schemaVersion, value) {
  return `${schemaVersion}:${computeIntegrity(value)}`;
}

function entryMetadataProjection(project, entryId) {
  let cvShow = metadata(project);
  let entry = clone(cvShow.entries[entryId]);
  delete entry.media;
  return entry;
}

function selectedDirectiveProjection(project, sourceCellIds) {
  let directives = metadata(project).directives;
  return sourceCellIds
    .filter((cellId) => directives[cellId])
    .map((cellId) => Object.freeze({
      cellId,
      directive: clone(directives[cellId]),
    }));
}

function createEntrySelection(project, entryId, { speechDirectiveIds = null } = {}) {
  let cvShow = metadata(project);
  if (!cvShow.entries[entryId]) throw invalidProject(`unknown entry ${entryId}`);
  let allowedGroups = speechDirectiveIds === null ? null : new Set(speechDirectiveIds);
  let source = entryCells(project, entryId);
  let narration = project.cells.find((cell) => (
    cell.kind === 'narration' && cell.turnId === entryId
  ));
  let setupMetadata = directiveMetadataForTurn(project, entryId)
    .find(([, value]) => value.phase === 'setup');
  if (!narration || !setupMetadata) throw invalidProject(`incomplete entry ${entryId}`);
  let setupCellId = setupMetadata[0];
  let setup = source.find(({ id }) => id === setupCellId);
  let groups = directiveMetadataForTurn(project, entryId)
    .filter(([, value]) => value.phase === 'speech')
    .filter(([, value]) => allowedGroups === null || allowedGroups.has(value.id));
  let selectedCells = [narration, setup];
  let previousCellId = setup.id;
  for (let [attentionCellId] of groups) {
    let scrollCellId = `${attentionCellId}:scroll`;
    let scroll = source.find(({ id }) => id === scrollCellId);
    let attention = source.find(({ id }) => id === attentionCellId);
    if (!scroll || !attention) throw invalidProject(`incomplete group ${attentionCellId}`);
    selectedCells.push({
      ...clone(scroll),
      dependsOn: [{ cellId: previousCellId, barrier: 'settled' }],
    });
    selectedCells.push(clone(attention));
    previousCellId = attention.id;
  }
  let selected = new Set(selectedCells.map(({ id }) => id));
  let sourceCellIds = project.cells
    .filter(({ id }) => selected.has(id))
    .map(({ id }) => id);
  let narrationCell = clone(selectedCells[0]);
  delete narrationCell.turn.replyTo;
  selectedCells[0] = narrationCell;
  return Object.freeze({
    cells: Object.freeze(selectedCells),
    sourceCellIds: Object.freeze(sourceCellIds),
    parent: narration.turn.replyTo || cvShow.slice?.parent || null,
  });
}

function referencedPersonas(project, narration) {
  let ids = [narration.turn.persona, narration.turn.addressee].filter(Boolean);
  return Object.fromEntries([...new Set(ids)].map((personaId) => [
    personaId,
    clone(project.script.personas[personaId]),
  ]));
}

function createEntryProvenanceFromSelection(project, entryId, selection) {
  let narration = selection.cells.find(({ kind }) => kind === 'narration');
  let directives = selectedDirectiveProjection(project, selection.sourceCellIds);
  let entry = entryMetadataProjection(project, entryId);
  let narrationInput = {
    entryId,
    locale: metadata(project).narrationLocale || project.script.locale,
    persona: {
      id: narration.turn.persona,
      ...clone(project.script.personas[narration.turn.persona]),
    },
    addressee: narration.turn.addressee
      ? {
          id: narration.turn.addressee,
          ...clone(project.script.personas[narration.turn.addressee]),
        }
      : null,
    dialogueAct: narration.turn.dialogueAct,
    text: narration.turn.text,
    delivery: clone(narration.turn.delivery || null),
  };
  let anchors = selection.cells
    .filter((cell) => cell.kind === 'cue' && cell.timing.at.anchor === 'speech')
    .map((cell) => ({
      cellId: cell.id,
      at: clone(cell.timing.at),
      until: clone(cell.timing.until),
    }));
  let directiveById = new Map(directives.map(({ cellId, directive }) => [cellId, directive]));
  let attention = selection.cells
    .filter(({ kind }) => kind === 'cue')
    .map((cell) => ({
      cellId: cell.id,
      kind: cell.kind,
      layerId: cell.layerId,
      cue: clone(cell.cue),
      timing: {
        at: { anchor: cell.timing.at.anchor },
        until: cell.timing.until ? { anchor: cell.timing.until.anchor } : null,
        leadMs: cell.timing.leadMs,
        gestureDurationMs: cell.timing.gestureDurationMs,
        settleBy: cell.timing.settleBy,
      },
      dependsOn: clone(cell.dependsOn),
      directive: clone(directiveById.get(cell.id) || null),
    }));
  let entryProjection = {
    entryId,
    entry,
    sourceCellIds: clone(selection.sourceCellIds),
    cells: clone(selection.cells),
    directives: clone(directives),
  };
  return freezeDeep({
    entryId,
    sourceCellIds: clone(selection.sourceCellIds),
    entryProjectionHash: identity(ENTRY_PROJECTION_SCHEMA, entryProjection),
    narrationInputHash: identity(NARRATION_INPUT_SCHEMA, narrationInput),
    anchorContractHash: identity(ANCHOR_CONTRACT_SCHEMA, { entryId, anchors }),
    attentionContractHash: identity(ATTENTION_CONTRACT_SCHEMA, { entryId, attention }),
  });
}

function createEntryProvenanceFromMaster(project, entryId, options = {}) {
  return createEntryProvenanceFromSelection(
    project,
    entryId,
    createEntrySelection(project, entryId, options),
  );
}

export function createCvShowEntryProvenance(projectInput) {
  let project = validateCvShowMasterProject(projectInput);
  let entryIds = project.cells
    .filter(({ kind }) => kind === 'narration')
    .map(({ turnId }) => turnId);
  let entries = entryIds.map((entryId) => createEntryProvenanceFromMaster(project, entryId));
  return freezeDeep({
    schemaVersion: ENTRY_PROVENANCE_SCHEMA,
    entries,
    hash: identity(ENTRY_PROVENANCE_SCHEMA, { entries }),
  });
}

function createSliceMetadata(project, entryId, selection, provenance) {
  let directives = Object.fromEntries(selectedDirectiveProjection(
    project,
    selection.sourceCellIds,
  ).map(({ cellId, directive }) => [cellId, directive]));
  return {
    entries: { [entryId]: entryMetadataProjection(project, entryId) },
    directives,
    narrationLocale: metadata(project).narrationLocale || project.script.locale,
    slice: {
      schemaVersion: ENTRY_SLICE_SCHEMA,
      sourceCellIds: clone(selection.sourceCellIds),
      turnId: entryId,
      parent: selection.parent,
      entryProjectionHash: provenance.entryProjectionHash,
      narrationInputHash: provenance.narrationInputHash,
      anchorContractHash: provenance.anchorContractHash,
      attentionContractHash: provenance.attentionContractHash,
    },
  };
}

function sliceLayers(project, cells) {
  let layerIds = new Set(cells.map(({ layerId }) => layerId));
  return project.layers
    .filter(({ id }) => layerIds.has(id))
    .map((layer) => ({
      id: layer.id,
      kind: layer.kind,
      name: layer.kind,
      visualOwnerId: layer.visualOwnerId,
      collisionDomainId: layer.collisionDomainId,
    }));
}

function slicePolicy(project) {
  return {
    visualOwnerId: project.policy.visualOwnerId,
    collisionDomains: project.policy.collisionDomains.map(({ id, exclusive }) => ({
      id,
      name: id,
      exclusive,
    })),
  };
}

function createCvShowEntryProjectFromMaster(project, entryId, options = {}) {
  let selection = createEntrySelection(project, entryId, options);
  let provenance = createEntryProvenanceFromSelection(project, entryId, selection);
  let narration = selection.cells.find(({ kind }) => kind === 'narration');
  let sourceIds = new Set(narration.turn.sourceRefs.map(({ sourceId }) => sourceId));
  let sliceIdentity = identity(ENTRY_SLICE_SCHEMA, provenance);
  let sliceInput = {
    schemaVersion: PROJECT_SCHEMA,
    id: `cv-show/slice/${entryId}/${portableHashToken(sliceIdentity)}`,
    revision: 0,
    script: {
      title: `CV Show entry: ${entryId}`,
      locale: project.script.locale,
      profile: 'full',
      personas: referencedPersonas(project, narration),
      grounding: {
        sources: project.script.grounding.sources
          .filter(({ id }) => sourceIds.has(id))
          .map((source) => clone(source)),
      },
      source: 'cv-show-entry-projection',
      metadata: { cvShow: createSliceMetadata(project, entryId, selection, provenance) },
    },
    policy: slicePolicy(project),
    layers: sliceLayers(project, selection.cells),
    cells: clone(selection.cells),
  };
  return createPresentationAuthoringProject(sliceInput);
}

export function createCvShowEntryProject(projectInput, entryId, options = {}) {
  return createCvShowEntryProjectFromMaster(
    validateCvShowMasterProject(projectInput),
    entryId,
    options,
  );
}

function validateSourceSequence(project, entryId, sequence) {
  const binding = metadata(project).entries[entryId]?.media;
  if (
    sequence?.contractVersion !== SOURCE_ALIGNMENT_SCHEMA
    || sequence.hash !== binding?.sourceAlignedSequenceHash
    || sequence.timelineHash !== binding?.sourceTimelineHash
    || sequence.media?.hash !== binding?.wavHash
    || sequence.media?.durationMs !== binding?.durationMilliseconds
    || sequence.turns?.length !== 1
  ) {
    throw invalidProject(`alignment provenance ${entryId}`);
  }
  return binding;
}

function validateNarrationMediaBinding(project, entryId, binding, mediaAncestry) {
  const registry = createCvShowMediaBindingRegistryFromMaster(project);
  const authoritative = registry.entries[entryId];
  if (
    !authoritative?.playable
    || authoritative.status !== 'accepted'
    || mediaBindingIssue(binding, authoritative?.narrationCellHash || '')
  ) {
    throw staleMedia(entryId, {
      bindingIssue: mediaBindingIssue(binding, authoritative?.narrationCellHash || ''),
      expectedNarrationCellHash: binding?.sourceNarrationCellHash || '',
      narrationCellHash: authoritative?.narrationCellHash || '',
      playable: authoritative?.playable ?? false,
      status: authoritative?.status || 'missing',
    });
  }
  let provided = null;
  let ancestryIssue = null;
  if (mediaAncestry !== undefined) {
    if (mediaAncestry?.schemaVersion === MEDIA_REGISTRY_SCHEMA) {
      provided = mediaAncestry.entries?.[entryId] || null;
      if (
        mediaAncestry.projectHash !== project.hash
        || mediaAncestry.projectRevision !== project.revision
      ) {
        ancestryIssue = 'project';
      }
    } else if (mediaAncestry?.schemaVersion === MEDIA_ENTRY_SCHEMA) {
      provided = mediaAncestry.entryId === entryId ? mediaAncestry : null;
    }
    ancestryIssue ||= mediaEntryIssue(provided, authoritative);
    if (
      ancestryIssue
    ) {
      throw staleMedia(entryId, {
        ancestryIssue,
        ancestrySchema: mediaAncestry?.schemaVersion || null,
        playable: provided?.playable ?? mediaAncestry?.playable ?? null,
        status: provided?.status || 'missing',
      });
    }
  }
  return authoritative;
}

function validateCvShowRuntimeAdmissionFromMaster(
  project,
  entryId,
  { audioClip, alignmentClip, sourceSequence, mediaAncestry }
    = /** @type {CvShowRuntimeAdmissionOptions} */ ({}),
) {
  const binding = metadata(project).entries[entryId]?.media;
  if (!binding) throw rejectedRuntimeAdmission(entryId, 'project-binding');
  validateNarrationMediaBinding(project, entryId, binding, mediaAncestry);
  const expected = {
    audioId: entryId,
    audioMasterWavSha256: binding.wavHash.replace(/^sha256:/u, ''),
    audioMasterDurationMs: binding.durationMilliseconds,
    alignmentId: entryId,
    alignmentMasterWavSha256: binding.wavHash.replace(/^sha256:/u, ''),
    alignedSequenceHash: binding.sourceAlignedSequenceHash,
    alignedSequenceSha256: binding.sourceAlignmentFileHash.replace(/^sha256:/u, ''),
    timelineHash: binding.sourceTimelineHash,
    alignmentMasterDurationMs: binding.durationMilliseconds,
  };
  const observed = {
    audioId: audioClip?.id,
    audioMasterWavSha256: audioClip?.masterWavSha256,
    audioMasterDurationMs: audioClip?.masterDurationMs,
    alignmentId: alignmentClip?.id,
    alignmentMasterWavSha256: alignmentClip?.masterWavSha256,
    alignedSequenceHash: alignmentClip?.alignedSequenceHash,
    alignedSequenceSha256: alignmentClip?.alignedSequenceSha256,
    timelineHash: alignmentClip?.timelineHash,
    alignmentMasterDurationMs: alignmentClip?.masterDurationMs,
  };
  const mismatch = Object.keys(expected).find((key) => observed[key] !== expected[key]);
  if (mismatch) {
    throw rejectedRuntimeAdmission(entryId, mismatch, {
      expected: expected[mismatch],
      observed: observed[mismatch] ?? null,
    });
  }
  try {
    validateSourceSequence(project, entryId, sourceSequence);
  } catch (error) {
    throw rejectedRuntimeAdmission(entryId, 'loaded-sequence', {
      causeCode: error?.code || '',
    });
  }
  return Object.freeze({
    projectHash: project.hash,
    projectRevision: project.revision,
    entryId,
    media: clone(binding),
    alignedSequenceHash: sourceSequence.hash,
  });
}

export function validateCvShowRuntimeAdmission(projectInput, entryId, options = {}) {
  return validateCvShowRuntimeAdmissionFromMaster(
    validateCvShowMasterProject(projectInput),
    entryId,
    options,
  );
}

function createSliceAlignment(slice, sourceSequence) {
  const timeline = createPresentationAuthoringTimelineProjection(slice);
  const sourceTurn = sourceSequence.turns[0];
  return createPresentationAlignedSequence(timeline, {
    media: clone(sourceSequence.media),
    turns: [{
      startMs: sourceTurn.startMs,
      endMs: sourceTurn.endMs,
      transcript: sourceTurn.transcript,
      words: clone(sourceTurn.words),
    }],
  });
}

function futureDirectiveIds(project, schedule, entryId, checkpointMs) {
  const byCellId = new Map(schedule.cells.map((cell) => [cell.cellId, cell]));
  return directiveMetadataForTurn(project, entryId)
    .filter(([, value]) => value.phase === 'speech')
    .filter(([cellId]) => {
      const groupCells = [byCellId.get(`${cellId}:scroll`), byCellId.get(cellId)];
      if (groupCells.some((cell) => !cell)) {
        throw invalidProject(`incomplete scheduled group ${cellId}`);
      }
      const groupStartMs = Math.min(...groupCells.map(({ startMs }) => startMs))
        - schedule.presentationStartMs;
      return groupStartMs > checkpointMs;
    })
    .map(([, value]) => value.id);
}

export function createCvShowEntryTuple(
  projectInput,
  entryId,
  sourceSequence,
  {
    checkpointMs = null,
    adapter,
    mediaAdmission = null,
    mediaAncestry,
    onReceipt,
  } = /** @type {CvShowEntryTupleOptions} */ ({}),
) {
  const master = validateCvShowMasterProject(projectInput);
  if (mediaAdmission) {
    validateCvShowRuntimeAdmissionFromMaster(master, entryId, {
      ...mediaAdmission,
      sourceSequence,
      mediaAncestry,
    });
  } else {
    const binding = metadata(master).entries[entryId]?.media;
    validateNarrationMediaBinding(master, entryId, binding, mediaAncestry);
    validateSourceSequence(master, entryId, sourceSequence);
  }
  let project = createCvShowEntryProjectFromMaster(master, entryId);
  let alignedSequence = createSliceAlignment(project, sourceSequence);
  let schedule = createPresentationScheduleV2(project, alignedSequence);
  let includedSpeechDirectiveIds = directiveMetadataForTurn(master, entryId)
    .filter(([, value]) => value.phase === 'speech')
    .map(([, value]) => value.id);
  if (checkpointMs !== null) {
    includedSpeechDirectiveIds = futureDirectiveIds(master, schedule, entryId, checkpointMs);
    project = createCvShowEntryProjectFromMaster(master, entryId, {
      speechDirectiveIds: includedSpeechDirectiveIds,
    });
    alignedSequence = createSliceAlignment(project, sourceSequence);
    schedule = createPresentationScheduleV2(project, alignedSequence);
  }
  const execution = createPresentationExecutionController({
    project,
    alignedSequence,
    schedule,
    adapter,
    onReceipt,
  });
  return Object.freeze({
    masterProjectHash: master.hash,
    masterRevision: master.revision,
    masterBase: Object.freeze({
      revision: master.revision,
      authoringProjectHash: master.hash,
    }),
    project,
    timeline: createPresentationAuthoringTimelineProjection(project),
    alignedSequence,
    schedule,
    execution,
    includedSpeechDirectiveIds: Object.freeze(includedSpeechDirectiveIds),
  });
}
