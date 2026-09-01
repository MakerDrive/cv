import {
  applyPresentationAuthoringProjectCommands,
  createPresentationAlignedSequence,
  createPresentationAudioComposition,
  createPresentationAuthoringProject,
  createPresentationAuthoringProjectHashes,
  createPresentationAuthoringTimelineProjection,
  createPresentationTimelineEditorModel,
  createPresentationExecutionController,
  createPresentationPlaybackPlan,
  createPresentationScheduleV2,
  projectPresentationNle,
  PRESENTATION_AUTHORING_PROJECT_SCHEMA_VERSION,
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

const PROJECT_SCHEMA = PRESENTATION_AUTHORING_PROJECT_SCHEMA_VERSION;
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
const AUTHORING_COMMAND_SCHEMA = 'workspace-presentation-authoring-command-v1';
const DIRECTIVE_REFINEMENTS_COMMAND = 'cv-show.directive.set-refinements';
const ENTRY_SUBTITLE_COMMAND = 'cv-show.entry.set-subtitle';
const SHA256_HASH_RE = /^sha256:[a-f0-9]{64}$/u;
const SHA256_INTEGRITY_RE = /:sha256-[A-Za-z0-9+/]{43}=$/u;

function clone(value) {
  return structuredClone(value);
}

function directiveId(cellId) {
  return String(cellId || '').replace(/^cv-show:cue:/u, '').replace(/:scroll$/u, '');
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

function invalidAuthoringCommand(reason, details = {}, code = 'CV_SHOW_AUTHORING_COMMAND_INVALID') {
  return Object.assign(
    new TypeError(`CV Show authoring command is invalid: ${reason}`),
    { code, details },
  );
}

function isPlainRecord(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function isPortableRefinementValue(value) {
  if (value === null || typeof value === 'string' || typeof value === 'boolean') return true;
  if (typeof value === 'number') return Number.isFinite(value);
  if (Array.isArray(value)) return value.every(isPortableRefinementValue);
  return isPlainRecord(value) && Object.values(value).every(isPortableRefinementValue);
}

function exactKeys(value, expected) {
  const keys = Object.keys(value).sort();
  const expectedKeys = [...expected].sort();
  return keys.length === expectedKeys.length
    && keys.every((key, index) => key === expectedKeys[index]);
}

function normalizeDirectiveRefinementsCommand(project, commandInput, directiveProject = project) {
  if (!isPlainRecord(commandInput) || !exactKeys(
    commandInput,
    ['schemaVersion', 'id', 'base', 'type', 'payload'],
  )) {
    throw invalidAuthoringCommand('command shape');
  }
  if (
    commandInput.schemaVersion !== AUTHORING_COMMAND_SCHEMA
    || typeof commandInput.id !== 'string'
    || !commandInput.id
    || commandInput.type !== DIRECTIVE_REFINEMENTS_COMMAND
  ) {
    throw invalidAuthoringCommand('command identity', { commandId: commandInput.id });
  }
  const base = commandInput.base;
  if (!isPlainRecord(base) || !exactKeys(base, ['revision', 'authoringProjectHash'])) {
    throw invalidAuthoringCommand('command base', { commandId: commandInput.id });
  }
  if (base.revision !== project.revision || base.authoringProjectHash !== project.hash) {
    throw invalidAuthoringCommand(
      `command "${commandInput.id}" base does not match the current master`,
      {
        commandId: commandInput.id,
        expected: { revision: project.revision, authoringProjectHash: project.hash },
        received: clone(base),
      },
      'CV_SHOW_AUTHORING_COMMAND_STALE',
    );
  }
  const payload = commandInput.payload;
  if (!isPlainRecord(payload) || !exactKeys(payload, ['cellId', 'refinements'])) {
    throw invalidAuthoringCommand('command payload', { commandId: commandInput.id });
  }
  const cellId = payload.cellId;
  const cell = typeof cellId === 'string'
    ? directiveProject.cells.find(({ id }) => id === cellId)
    : null;
  if (
    !cell
    || cell.kind !== 'cue'
    || cellId.endsWith(':scroll')
    || !Object.hasOwn(metadata(directiveProject).directives, cellId)
  ) {
    throw invalidAuthoringCommand('directive cell', { commandId: commandInput.id, cellId });
  }
  if (!isPlainRecord(payload.refinements) || !isPortableRefinementValue(payload.refinements)) {
    throw invalidAuthoringCommand('refinements must be a plain portable record', {
      commandId: commandInput.id,
      cellId,
    });
  }
  return {
    id: commandInput.id,
    cellId,
    refinements: clone(payload.refinements),
  };
}

function normalizeEntrySubtitleCommand(project, commandInput) {
  if (!isPlainRecord(commandInput) || !exactKeys(
    commandInput,
    ['schemaVersion', 'id', 'base', 'type', 'payload'],
  )) {
    throw invalidAuthoringCommand('command shape');
  }
  if (
    commandInput.schemaVersion !== AUTHORING_COMMAND_SCHEMA
    || typeof commandInput.id !== 'string'
    || !commandInput.id
    || commandInput.type !== ENTRY_SUBTITLE_COMMAND
  ) {
    throw invalidAuthoringCommand('command identity', { commandId: commandInput.id });
  }
  const base = commandInput.base;
  if (!isPlainRecord(base) || !exactKeys(base, ['revision', 'authoringProjectHash'])) {
    throw invalidAuthoringCommand('command base', { commandId: commandInput.id });
  }
  if (base.revision !== project.revision || base.authoringProjectHash !== project.hash) {
    throw invalidAuthoringCommand(
      `command "${commandInput.id}" base does not match the current master`,
      {
        commandId: commandInput.id,
        expected: { revision: project.revision, authoringProjectHash: project.hash },
        received: clone(base),
      },
      'CV_SHOW_AUTHORING_COMMAND_STALE',
    );
  }
  const payload = commandInput.payload;
  if (!isPlainRecord(payload) || !exactKeys(payload, ['entryId', 'subtitle'])) {
    throw invalidAuthoringCommand('command payload', { commandId: commandInput.id });
  }
  if (
    typeof payload.entryId !== 'string'
    || !Object.hasOwn(metadata(project).entries, payload.entryId)
    || typeof payload.subtitle !== 'string'
    || !payload.subtitle.trim()
  ) {
    throw invalidAuthoringCommand('entry subtitle', {
      commandId: commandInput.id,
      entryId: payload.entryId,
    });
  }
  return { id: commandInput.id, entryId: payload.entryId, subtitle: payload.subtitle.trim() };
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

function transitivelyDependsOn(cells, cellId, ancestorId, visiting = new Set()) {
  if (cellId === ancestorId) return true;
  if (visiting.has(cellId)) return false;
  const cell = cells.find(({ id }) => id === cellId);
  if (!cell) return false;
  const nextVisiting = new Set(visiting).add(cellId);
  return (cell.dependsOn || []).some(({ cellId: dependencyId }) => (
    transitivelyDependsOn(cells, dependencyId, ancestorId, nextVisiting)
  ));
}

function projectShape(project) {
  const timeline = createPresentationAuthoringTimelineProjection(project);
  return Object.freeze({
    layers: Object.freeze(project.layers.map(({ id, kind }) => Object.freeze({ id, kind }))),
    turns: Object.freeze(timeline.turns.map(({ id, replyTo }) => Object.freeze({
      id,
      replyTo: replyTo || null,
    }))),
  });
}

const CANONICAL_MASTER_SHAPE = projectShape(CV_SHOW_PRESENTATION_PROJECT);

function expectedCellLayer(cell) {
  if (cell.kind === 'narration') return 'cv-show:layer:narration';
  if (cell.kind === 'audio-clip') return 'cv-show:layer:audio';
  if (cell.cue?.kind === 'focus') return 'cv-show:layer:focus';
  if (cell.cue?.kind === 'annotation') return 'cv-show:layer:annotation';
  if (cell.cue?.kind === 'interaction') return 'cv-show:layer:interaction';
  return '';
}

export function validateCvShowMasterProject(projectInput) {
  const project = validatePresentationAuthoringProject(projectInput);
  const cvShow = metadata(project);
  const timeline = createPresentationAuthoringTimelineProjection(project);
  const narrationCells = project.cells.filter(({ kind }) => kind === 'narration');
  const audioCells = project.cells.filter(({ kind }) => kind === 'audio-clip');
  if (
    project.id !== 'cv-show'
    || cvShow.slice
    || timeline.turns.length !== 30
    || timeline.turns.filter(({ replyTo }) => !replyTo).length !== 16
    || narrationCells.length !== 30
    || project.assets.length !== 30
    || audioCells.length < 30
    || Object.keys(cvShow.entries).length !== 30
  ) {
    throw invalidProject('canonical 30-turn master required');
  }
  const turnIds = timeline.turns.map(({ id }) => id);
  if (
    new Set(turnIds).size !== 30
    || turnIds.some((entryId, index) => entryId !== CANONICAL_MASTER_SHAPE.turns[index]?.id)
    || timeline.turns.some(({ replyTo }, index) => (
      (replyTo || null) !== CANONICAL_MASTER_SHAPE.turns[index]?.replyTo
    ))
    || turnIds.some((entryId) => !cvShow.entries[entryId])
    || narrationCells.some(({ turnId }) => !cvShow.entries[turnId])
  ) {
    throw invalidProject('master turn registry');
  }
  if (
    project.layers.length !== CANONICAL_MASTER_SHAPE.layers.length
    || project.layers.some(({ id, kind }, index) => (
      id !== CANONICAL_MASTER_SHAPE.layers[index]?.id
      || kind !== CANONICAL_MASTER_SHAPE.layers[index]?.kind
    ))
  ) {
    throw invalidProject('master layer shape');
  }
  for (let cell of project.cells) {
    if (
      expectedCellLayer(cell) !== cell.layerId
      || (cell.kind === 'narration' && cell.id !== `cv-show:narration:${cell.turnId}`)
      || (cell.kind === 'audio-clip' && !cell.id.startsWith('cv-show:audio-clip:'))
      || (cell.kind === 'cue' && !cell.id.startsWith('cv-show:cue:'))
      || (cell.kind === 'cue' && cell.id.endsWith(':scroll')
        && cell.cue?.interaction?.type !== 'scroll')
      || (cell.kind === 'cue' && !cell.id.endsWith(':scroll')
        && cell.cue?.interaction?.type === 'scroll')
      || (cell.kind === 'cue' && !['turn-start', 'speech'].includes(cell.timing.at.anchor))
    ) {
      throw invalidProject(`unsupported structural cell ${cell.id}`);
    }
  }
  const authoredDirectiveIds = project.cells
    .filter(({ kind, id }) => kind === 'cue' && !id.endsWith(':scroll'))
    .map(({ id }) => id);
  const metadataDirectiveIds = Object.keys(cvShow.directives);
  if (
    authoredDirectiveIds.length !== metadataDirectiveIds.length
    || authoredDirectiveIds.some((id) => !Object.hasOwn(cvShow.directives, id))
    || metadataDirectiveIds.some((id) => !authoredDirectiveIds.includes(id))
  ) {
    throw invalidProject('directive registry');
  }
  for (let entryId of turnIds) {
    const source = entryCells(project, entryId);
    const narration = source.filter(({ kind }) => kind === 'narration');
    const attention = source.filter((cell) => (
      cell.kind === 'cue' && !cell.id.endsWith(':scroll')
    ));
    const setup = attention.filter(({ timing }) => timing.at.anchor === 'turn-start');
    const speech = attention.filter(({ timing }) => timing.at.anchor === 'speech');
    const speechScrolls = source.filter((cell) => (
      cell.kind === 'cue'
      && cell.id.endsWith(':scroll')
      && cell.timing.at.anchor === 'speech'
    ));
    const audio = source.filter(({ kind }) => kind === 'audio-clip')
      .sort((left, right) => left.audio.sourceInMs - right.audio.sourceInMs);
    if (
      narration.length !== 1
      || setup.length !== 1
      || speech.length === 0
      || speechScrolls.length !== speech.length
      || audio.length === 0
    ) {
      throw invalidProject(`incomplete master turn ${entryId}`);
    }
    const asset = project.assets.find(({ id }) => id === audio[0].audio.assetId);
    if (
      !asset
      || asset.kind !== 'audio'
      || audio.some(({ audio: range }) => range.assetId !== asset.id)
      || audio.some(({ id }) => !transitivelyDependsOn(source, id, setup[0].id))
    ) {
      throw invalidProject(`audio chain ${entryId}`);
    }
    for (const cell of speech) {
      const scroll = source.find(({ id }) => id === `${cell.id}:scroll`);
      if (
        !scroll
        || scroll.cue?.interaction?.type !== 'scroll'
        || scroll.cue.targetId !== cell.cue.targetId
        || !transitivelyDependsOn(source, scroll.id, setup[0].id)
        || !transitivelyDependsOn(source, cell.id, scroll.id)
      ) {
        throw invalidProject(`group dependency ${cell.id}`);
      }
    }
  }
  projectCvShowStory(project);
  projectCvShowAttentionTimelines(project);
  return project;
}

export function applyCvShowMasterProjectCommands(projectInput, commandInputs = []) {
  const current = validateCvShowMasterProject(projectInput);
  if (!Array.isArray(commandInputs)) {
    throw invalidAuthoringCommand('commands must be an array');
  }
  const ids = new Set();
  const directiveCommands = [];
  const subtitleCommands = [];
  const genericCommands = [];
  for (const commandInput of commandInputs) {
    const commandId = isPlainRecord(commandInput) ? commandInput.id : null;
    if (typeof commandId === 'string' && ids.has(commandId)) {
      throw invalidAuthoringCommand('duplicate command id', { commandId });
    }
    if (typeof commandId === 'string') ids.add(commandId);
    if (commandInput?.type === DIRECTIVE_REFINEMENTS_COMMAND) {
      directiveCommands.push(commandInput);
    } else if (commandInput?.type === ENTRY_SUBTITLE_COMMAND) {
      subtitleCommands.push(normalizeEntrySubtitleCommand(current, commandInput));
    } else {
      genericCommands.push(commandInput);
    }
  }
  if (!commandInputs.length) return current;
  const application = applyPresentationAuthoringProjectCommands(current, genericCommands);
  const draft = clone(application.project);
  delete draft.hash;
  if (!genericCommands.length) draft.revision = current.revision + 1;
  for (const change of application.changes) {
    const added = change.type === 'cell.add' ? change.cell : null;
    if (added?.kind === 'cue' && !added.id.endsWith(':scroll')) {
      draft.script.metadata.cvShow.directives[added.id] = {
        policy: 'required',
        refinements: {},
      };
    }
    const removed = change.type === 'cell.remove' ? change.cell : null;
    if (removed?.kind !== 'cue' || removed.id.endsWith(':scroll')) continue;
    delete draft.script.metadata.cvShow.directives[removed.id];
  }
  for (const commandInput of directiveCommands) {
    const command = normalizeDirectiveRefinementsCommand(current, commandInput, draft);
    const directive = draft.script.metadata.cvShow.directives[command.cellId];
    if (!directive) {
      throw invalidAuthoringCommand('directive cell was removed by the command batch', {
        commandId: command.id,
        cellId: command.cellId,
      });
    }
    directive.refinements = clone(command.refinements);
  }
  for (const command of subtitleCommands) {
    draft.script.metadata.cvShow.entries[command.entryId].subtitle = command.subtitle;
  }
  return validateCvShowMasterProject(createPresentationAuthoringProject(draft));
}

function mediaBindingIssue(binding, narrationCellHash, audioAsset) {
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
      .match(/^workspace-presentation-authoring-project-v[12]:cell:/u)
    || !SHA256_INTEGRITY_RE.test(binding.sourceNarrationCellHash)
  ) {
    return 'sourceNarrationCellHash';
  }
  if (
    !audioAsset
    || audioAsset.kind !== 'audio'
    || audioAsset.contentHash !== binding.wavHash
    || audioAsset.durationMs !== binding.durationMilliseconds
    || audioAsset.alignmentHash !== binding.sourceAlignedSequenceHash
    || audioAsset.sourceTimelineHash !== binding.sourceTimelineHash
  ) {
    return 'audioAsset';
  }
  void narrationCellHash;
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
    const audioAsset = project.assets.find(({ id }) => id === `cv-show:audio:${entryId}`);
    const accepted = mediaBindingIssue(binding, narrationCellHash, audioAsset) === null;
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

function createEntrySelection(
  project,
  entryId,
  {
    speechDirectiveIds = null,
    heldAttentionDirectiveIds = [],
    runtimeCellIds = null,
  } = {},
) {
  let cvShow = metadata(project);
  if (!cvShow.entries[entryId]) throw invalidProject(`unknown entry ${entryId}`);
  let allowedGroups = speechDirectiveIds === null ? null : new Set(speechDirectiveIds);
  let heldGroups = new Set(heldAttentionDirectiveIds);
  let source = entryCells(project, entryId);
  let narration = project.cells.find((cell) => (
    cell.kind === 'narration' && cell.turnId === entryId
  ));
  let setupMetadata = directiveMetadataForTurn(project, entryId)
    .find(([, value]) => value.phase === 'setup');
  if (!narration || !setupMetadata) throw invalidProject(`incomplete entry ${entryId}`);
  let setupCellId = setupMetadata[0];
  let setup = source.find(({ id }) => id === setupCellId);
  if (speechDirectiveIds === null && heldAttentionDirectiveIds.length === 0) {
    const selectedCells = source.map(clone);
    const narrationCell = selectedCells.find(({ kind }) => kind === 'narration');
    delete narrationCell.turn.replyTo;
    return Object.freeze({
      cells: Object.freeze(selectedCells),
      sourceCellIds: Object.freeze(selectedCells.map(({ id }) => id)),
      heldAttentionCellIds: Object.freeze([]),
      parent: narration.turn.replyTo || cvShow.slice?.parent || null,
    });
  }
  if (runtimeCellIds !== null) {
    let requested = new Set(runtimeCellIds);
    let heldCellIds = new Set(heldAttentionDirectiveIds.map((id) => `cv-show:cue:${id}`));
    let selectedCells = [clone(narration), clone(setup)];
    let previousCellId = setup.id;
    for (let cell of source.filter(({ id }) => heldCellIds.has(id))) {
      selectedCells.push({
        ...clone(cell),
        dependsOn: [{ cellId: previousCellId, barrier: 'settled' }],
      });
      previousCellId = cell.id;
    }
    for (let cellId of runtimeCellIds) {
      if (heldCellIds.has(cellId)) continue;
      let sourceCell = source.find(({ id }) => id === cellId);
      if (!sourceCell) throw invalidProject(`unknown checkpoint cell ${cellId}`);
      let cell = clone(sourceCell);
      cell.dependsOn = cell.dependsOn.map((dependency) => (
        requested.has(dependency.cellId) || heldCellIds.has(dependency.cellId)
          ? dependency
          : { cellId: previousCellId, barrier: 'settled' }
      ));
      selectedCells.push(cell);
      previousCellId = cell.id;
    }
    delete selectedCells[0].turn.replyTo;
    return Object.freeze({
      cells: Object.freeze(selectedCells),
      sourceCellIds: Object.freeze(selectedCells.map(({ id }) => id)),
      heldAttentionCellIds: Object.freeze(
        selectedCells.filter(({ id }) => heldCellIds.has(id)).map(({ id }) => id),
      ),
      parent: narration.turn.replyTo || cvShow.slice?.parent || null,
    });
  }
  let groups = directiveMetadataForTurn(project, entryId)
    .filter(([, value]) => value.phase === 'speech')
    .filter(([, value]) => (
      allowedGroups === null || allowedGroups.has(value.id) || heldGroups.has(value.id)
    ));
  let selectedCells = [narration, setup];
  let previousCellId = setup.id;
  for (let [attentionCellId] of groups) {
    let scrollCellId = `${attentionCellId}:scroll`;
    let scroll = source.find(({ id }) => id === scrollCellId);
    let attention = source.find(({ id }) => id === attentionCellId);
    if (!scroll || !attention) throw invalidProject(`incomplete group ${attentionCellId}`);
    if (heldGroups.has(directiveId(attentionCellId))) {
      selectedCells.push({
        ...clone(attention),
        dependsOn: [{ cellId: setup.id, barrier: 'settled' }],
      });
      previousCellId = attention.id;
    } else {
      selectedCells.push({
        ...clone(scroll),
        dependsOn: [{ cellId: previousCellId, barrier: 'settled' }],
      });
      selectedCells.push(clone(attention));
      previousCellId = attention.id;
    }
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
    heldAttentionCellIds: Object.freeze(
      selectedCells
        .filter(({ id }) => heldGroups.has(directiveId(id)))
        .map(({ id }) => id),
    ),
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
  for (let cellId of selection.heldAttentionCellIds) {
    directives[cellId] = {
      ...directives[cellId],
      refinements: {
        ...directives[cellId].refinements,
        checkpointMode: 'restore-held',
      },
    };
  }
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
      heldAttentionCellIds: clone(selection.heldAttentionCellIds),
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
    assets: project.assets.filter((asset) => selection.cells.some((cell) => (
      cell.kind === 'audio-clip' && cell.audio.assetId === asset.id
    ))).map(clone),
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
  const audioAsset = project.assets.find(({ id }) => id === `cv-show:audio:${entryId}`);
  const bindingIssue = mediaBindingIssue(
    binding,
    authoritative?.narrationCellHash || '',
    audioAsset,
  );
  if (
    !authoritative?.playable
    || authoritative.status !== 'accepted'
    || bindingIssue
  ) {
    throw staleMedia(entryId, {
      bindingIssue,
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

function createSliceAudioComposition(project, schedule, sourceSequence) {
  const sourceTurn = sourceSequence.turns[0];
  return createPresentationAudioComposition(project, schedule, {
    sources: project.assets.map((asset) => ({
      assetId: asset.id,
      contentHash: asset.contentHash,
      alignmentHash: asset.alignmentHash,
      durationMs: asset.durationMs,
      words: clone(sourceTurn.words),
    })),
  });
}

export function projectCvShowScheduleDuration(value) {
  const projectDurationMs = Number(
    value?.projectDurationMs ?? value?.schedule?.totalDurationMs ?? value?.totalDurationMs,
  );
  return Number.isFinite(projectDurationMs) && projectDurationMs > 0
    ? projectDurationMs
    : 0;
}

/**
 * Resolves one canonical Project-timeline checkpoint to the physical source
 * position of the segmented narration asset. Project time remains the public
 * transport coordinate; source time is only the native media seek coordinate.
 */
export function projectCvShowPlaybackCheckpoint(playbackPlan, projectTimeMs) {
  const cells = Array.isArray(playbackPlan?.cells) ? playbackPlan.cells : [];
  const clips = Array.isArray(playbackPlan?.clips) ? playbackPlan.clips : [];
  const projectEndMs = Math.max(0, ...cells.map(({ span }) => Number(span?.endMs) || 0));
  const projectTime = Math.min(
    projectEndMs || Number.MAX_SAFE_INTEGER,
    Math.max(0, Math.round(Number(projectTimeMs) || 0)),
  );
  if (clips.length === 0) {
    return Object.freeze({
      phase: 'empty',
      projectTimeMs: projectTime,
      sourceTimeMs: 0,
      clipId: '',
      clipIndex: -1,
      previousClipId: '',
      nextClipId: '',
      nextClipIndex: -1,
    });
  }
  let previous = null;
  for (let [index, clip] of clips.entries()) {
    const startMs = Number(clip.span?.startMs) || 0;
    const endMs = Number(clip.span?.endMs) || startMs;
    if (projectTime < startMs) {
      return Object.freeze({
        phase: 'gap',
        projectTimeMs: projectTime,
        sourceTimeMs: previous
          ? Number(previous.audio.sourceOutMs)
          : Number(clip.audio.sourceInMs),
        clipId: '',
        clipIndex: -1,
        previousClipId: previous?.id || '',
        nextClipId: clip.id,
        nextClipIndex: index,
      });
    }
    if (projectTime < endMs) {
      const sourceInMs = Number(clip.audio.sourceInMs) || 0;
      const sourceOutMs = Number(clip.audio.sourceOutMs) || sourceInMs;
      return Object.freeze({
        phase: 'clip',
        projectTimeMs: projectTime,
        sourceTimeMs: Math.min(sourceOutMs, sourceInMs + projectTime - startMs),
        clipId: clip.id,
        clipIndex: index,
        previousClipId: previous?.id || '',
        nextClipId: clips[index + 1]?.id || '',
        nextClipIndex: index + 1 < clips.length ? index + 1 : -1,
      });
    }
    previous = clip;
  }
  const last = clips.at(-1);
  return Object.freeze({
    phase: 'after',
    projectTimeMs: projectTime,
    sourceTimeMs: Number(last.audio.sourceOutMs) || 0,
    clipId: '',
    clipIndex: -1,
    previousClipId: last.id,
    nextClipId: '',
    nextClipIndex: -1,
  });
}

function checkpointDirectiveProjection(project, schedule, entryId, checkpointMs) {
  const byCellId = new Map(schedule.cells.map((cell) => [cell.cellId, cell]));
  const playbackPlan = createPresentationPlaybackPlan(project, schedule);
  const audioClips = playbackPlan.clips;
  const checkpoint = projectCvShowPlaybackCheckpoint(playbackPlan, checkpointMs);
  let firstFutureIndex = playbackPlan.cells.length;
  const checkpointScheduleMs = checkpoint.projectTimeMs;
  if (checkpoint.phase === 'clip') {
    firstFutureIndex = playbackPlan.cells.findIndex(({ id }) => id === checkpoint.clipId);
  } else if (checkpoint.nextClipIndex >= 0) {
    if (checkpoint.nextClipIndex === 0) {
      firstFutureIndex = playbackPlan.cells.findIndex(
        ({ id }) => id === audioClips[0].id,
      );
    } else {
      const previousIndex = playbackPlan.cells.findIndex(
        ({ id }) => id === audioClips[checkpoint.nextClipIndex - 1].id,
      );
      firstFutureIndex = previousIndex + 1;
    }
  }
  const futureCellIds = playbackPlan.cells.slice(firstFutureIndex)
    .filter(({ kind }) => kind !== 'narration')
    .map(({ id }) => id);
  const futureCellIdSet = new Set(futureCellIds);
  const excludedSpeechCellIds = new Set();
  const future = [];
  const held = [];
  for (let [cellId, value] of directiveMetadataForTurn(project, entryId)
    .filter(([, value]) => value.phase === 'speech')
  ) {
    const scroll = byCellId.get(`${cellId}:scroll`);
    const attention = byCellId.get(cellId);
    if (!scroll || !attention) throw invalidProject(`incomplete scheduled group ${cellId}`);
    const groupStartMs = Math.min(
      Number(scroll.startMs) || 0,
      Number(attention.startMs) || 0,
    );
    if (
      checkpointScheduleMs <= groupStartMs
      && (futureCellIdSet.has(scroll.cellId) || futureCellIdSet.has(attention.cellId))
    ) {
      future.push(value.id);
      continue;
    }
    excludedSpeechCellIds.add(scroll.cellId);
    excludedSpeechCellIds.add(attention.cellId);
    if (
      Number.isFinite(attention.gesture?.endMs)
      && attention.gesture.endMs < checkpointScheduleMs
      && Number.isFinite(attention.visibility?.endMs)
      && checkpointScheduleMs < attention.visibility.endMs
    ) {
      held.push(value.id);
      continue;
    }
  }
  const retainedFutureCellIds = futureCellIds.filter((id) => !excludedSpeechCellIds.has(id));
  return Object.freeze({
    future: Object.freeze(future),
    held: Object.freeze(held),
    futureCellIds: Object.freeze(retainedFutureCellIds),
    playbackCheckpoint: checkpoint,
  });
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
  const projectDurationMs = schedule.totalDurationMs;
  let includedSpeechDirectiveIds = directiveMetadataForTurn(master, entryId)
    .filter(([, value]) => value.phase === 'speech')
    .map(([, value]) => value.id);
  let heldAttentionDirectiveIds = [];
  let playbackCheckpoint = null;
  if (checkpointMs !== null) {
    const checkpointProjection = checkpointDirectiveProjection(
      project,
      schedule,
      entryId,
      checkpointMs,
    );
    includedSpeechDirectiveIds = [...checkpointProjection.future];
    heldAttentionDirectiveIds = [...checkpointProjection.held];
    playbackCheckpoint = checkpointProjection.playbackCheckpoint;
    project = createCvShowEntryProjectFromMaster(master, entryId, {
      speechDirectiveIds: includedSpeechDirectiveIds,
      heldAttentionDirectiveIds,
      runtimeCellIds: checkpointProjection.futureCellIds,
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
  const playbackPlan = createPresentationPlaybackPlan(project, schedule);
  const nle = projectPresentationNle(project, schedule);
  const timelineEditorModel = createPresentationTimelineEditorModel(project, schedule);
  const audioComposition = createSliceAudioComposition(project, schedule, sourceSequence);
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
    projectDurationMs,
    playbackPlan,
    nle,
    timelineEditorModel,
    audioComposition,
    execution,
    playbackCheckpoint,
    includedSpeechDirectiveIds: Object.freeze(includedSpeechDirectiveIds),
    heldAttentionDirectiveIds: Object.freeze(heldAttentionDirectiveIds),
  });
}
