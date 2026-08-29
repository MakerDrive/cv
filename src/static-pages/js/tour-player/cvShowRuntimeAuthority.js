import { createPresentationAuthoringTimelineProjection } from 'symbiote-workspace/browser';
import { computeIntegrity } from 'symbiote-workspace/schema/canonical-json.js';
import { CV_SHOW_PRESENTATION_PROJECT } from '../../data/cvShowPresentationProject.js';
import {
  createCvShowMediaBindingRegistry,
  projectCvShowStory,
  validateCvShowMasterProject,
} from './presentationProjectAdapter.js';

const SNAPSHOT_IDENTITY_VERSION = 'cv-show-authoring-snapshot-v1';
const VIEW_IDENTITY_VERSION = 'cv-show-authoring-view-identity-v1';
const MEDIA_IDENTITY_VERSION = 'cv-show-authoring-media-collection-v1';
const MEDIA_COLLECTION_VERSION = 'workspace-presentation-media-collection-v1';
const MEDIA_ANCESTRY_VERSION = 'workspace-presentation-media-ancestry-v1';
const NARRATION_PROJECTION_VERSION = 'workspace-presentation-narration-v1';

function clone(value) {
  return structuredClone(value);
}

function freezeDeep(value) {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
  for (let child of Object.values(value)) freezeDeep(child);
  return Object.freeze(value);
}

function immutable(value) {
  return freezeDeep(clone(value));
}

function isObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function assertExactFields(value, fields, sourcePath) {
  let keys = isObject(value) ? Reflect.ownKeys(value) : [];
  let validPrototype = isObject(value)
    && [Object.prototype, null].includes(Object.getPrototypeOf(value));
  let exact = validPrototype
    && keys.length === fields.length
    && fields.every((field) => Object.prototype.hasOwnProperty.call(value, field));
  if (!exact) {
    fail(
      'CV_SHOW_AUTHORING_SNAPSHOT_INVALID',
      `${sourcePath} must contain only the exact CV Show media schema fields`,
      {
        path: sourcePath,
        expectedFields: fields,
        receivedFields: keys.map((key) => String(key)),
      },
    );
  }
}

function projectBase(project) {
  return Object.freeze({
    revision: project.revision,
    authoringProjectHash: project.hash,
  });
}

function snapshotIdentity(value) {
  return `${SNAPSHOT_IDENTITY_VERSION}:${computeIntegrity(value)}`;
}

function mediaIdentity(value) {
  return `${MEDIA_IDENTITY_VERSION}:${computeIntegrity(value)}`;
}

export class CvShowRuntimeAuthorityError extends Error {
  constructor(code, message, details = {}) {
    super(message);
    this.name = 'CvShowRuntimeAuthorityError';
    this.code = code;
    this.details = immutable(details);
  }
}

function fail(code, message, details = {}) {
  throw new CvShowRuntimeAuthorityError(code, message, details);
}

function canonicalNarration(timeline, turnId) {
  let turns = timeline.turns
    .filter((turn) => turn.id === turnId)
    .map(({ cues, ...turn }) => turn);
  let personaIds = new Set(turns.map(({ persona }) => persona));
  return {
    schemaVersion: NARRATION_PROJECTION_VERSION,
    locale: timeline.locale,
    profile: timeline.profile,
    personas: Object.fromEntries(
      Object.entries(timeline.personas).filter(([personaId]) => personaIds.has(personaId)),
    ),
    turns,
  };
}

function narrationHash(timeline, turnId) {
  return `${NARRATION_PROJECTION_VERSION}:${computeIntegrity(canonicalNarration(timeline, turnId))}`;
}

function mediaManifestHash(project) {
  let entries = project.script.metadata.cvShow.entries;
  let bindings = Object.keys(entries).map((entryId) => ({
    entryId,
    media: entries[entryId].media,
  }));
  return `cv-show-media-manifest-v1:${computeIntegrity(bindings)}`;
}

function renderBindingHash(binding) {
  return `cv-show-render-binding-v1:${computeIntegrity(binding)}`;
}

function createMediaCollection(project, registry) {
  let timeline = createPresentationAuthoringTimelineProjection(project);
  let cellsByTurn = new Map(project.cells
    .filter(({ kind }) => kind === 'narration')
    .map((cell) => [cell.turnId, cell]));
  let entries = Object.keys(project.script.metadata.cvShow.entries).map((entryId) => {
    let registryEntry = registry.entries[entryId];
    let narrationCell = cellsByTurn.get(entryId);
    let status = registryEntry.status;
    return {
      entryId,
      narrationCellId: narrationCell.id,
      mediaAncestry: {
        schemaVersion: MEDIA_ANCESTRY_VERSION,
        narrationHash: narrationHash(timeline, entryId),
        audio: { hash: registryEntry.binding.wavHash || null, status },
        alignment: {
          hash: registryEntry.binding.sourceAlignedSequenceHash || null,
          status,
        },
        render: { hash: renderBindingHash(registryEntry.binding), status },
        playable: registryEntry.playable,
      },
    };
  });
  return {
    schemaVersion: MEDIA_COLLECTION_VERSION,
    collectionId: `cv-show:${project.script.metadata.cvShow.contractRevision}`,
    manifestHash: mediaManifestHash(project),
    entries,
  };
}

function normalizeMediaArtifact(value, entryId, dependency) {
  assertExactFields(
    value,
    ['hash', 'status'],
    `mediaCollection.entries.${entryId}.mediaAncestry.${dependency}`,
  );
  let validStatus = ['accepted', 'stale', 'missing'].includes(value.status);
  let validHash = value.hash === null || typeof value.hash === 'string';
  let invalidAccepted = value.status === 'accepted' && !String(value.hash || '');
  let invalidMissing = value.status === 'missing' && value.hash !== null;
  if (!validStatus || !validHash || invalidAccepted || invalidMissing) {
    fail(
      'CV_SHOW_AUTHORING_SNAPSHOT_INVALID',
      `CV Show media dependency is stale: ${entryId}/${dependency}`,
    );
  }
  return { hash: value.hash, status: value.status };
}

function normalizeMediaCollection(project, registry, value) {
  assertExactFields(
    value,
    ['schemaVersion', 'collectionId', 'manifestHash', 'entries'],
    'mediaCollection',
  );
  if (value.schemaVersion !== MEDIA_COLLECTION_VERSION) {
    fail('CV_SHOW_AUTHORING_SNAPSHOT_INVALID', 'CV Show authority media collection is invalid');
  }
  let expected = createMediaCollection(project, registry);
  if (
    value.collectionId !== expected.collectionId
    || value.manifestHash !== expected.manifestHash
    || !Array.isArray(value.entries)
    || value.entries.length !== expected.entries.length
  ) {
    fail('CV_SHOW_AUTHORING_SNAPSHOT_INVALID', 'CV Show media collection identity is stale');
  }
  let entries = [];
  for (let [index, expectedEntry] of expected.entries.entries()) {
    let entry = value.entries[index];
    let expectedAncestry = expectedEntry.mediaAncestry;
    assertExactFields(
      entry,
      ['entryId', 'narrationCellId', 'mediaAncestry'],
      `mediaCollection.entries.${expectedEntry.entryId}`,
    );
    assertExactFields(
      entry.mediaAncestry,
      ['schemaVersion', 'narrationHash', 'audio', 'alignment', 'render', 'playable'],
      `mediaCollection.entries.${expectedEntry.entryId}.mediaAncestry`,
    );
    if (
      entry.entryId !== expectedEntry.entryId
      || entry.narrationCellId !== expectedEntry.narrationCellId
      || entry.mediaAncestry.schemaVersion !== MEDIA_ANCESTRY_VERSION
      || entry.mediaAncestry.narrationHash !== expectedAncestry.narrationHash
      || typeof entry.mediaAncestry.playable !== 'boolean'
    ) {
      fail(
        'CV_SHOW_AUTHORING_SNAPSHOT_INVALID',
        `CV Show media entry is stale: ${expectedEntry.entryId}`,
      );
    }
    let audio = normalizeMediaArtifact(
      entry.mediaAncestry.audio,
      expectedEntry.entryId,
      'audio',
    );
    let alignment = normalizeMediaArtifact(
      entry.mediaAncestry.alignment,
      expectedEntry.entryId,
      'alignment',
    );
    let render = normalizeMediaArtifact(
      entry.mediaAncestry.render,
      expectedEntry.entryId,
      'render',
    );
    let mediaAncestry = {
      schemaVersion: MEDIA_ANCESTRY_VERSION,
      narrationHash: expectedAncestry.narrationHash,
      audio,
      alignment,
      render,
      playable: entry.mediaAncestry.playable,
    };
    let accepted = ['audio', 'alignment', 'render'].every((dependency) => (
      mediaAncestry[dependency].status === 'accepted'
    ));
    if (
      mediaAncestry.playable !== accepted
      || mediaAncestry.alignment.status === 'accepted'
        && mediaAncestry.audio.status !== 'accepted'
      || mediaAncestry.render.status === 'accepted'
        && (
          mediaAncestry.audio.status !== 'accepted'
          || mediaAncestry.alignment.status !== 'accepted'
        )
    ) {
      fail(
        'CV_SHOW_AUTHORING_SNAPSHOT_INVALID',
        `CV Show media dependency order is invalid: ${expectedEntry.entryId}`,
      );
    }
    entries.push({
      entryId: expectedEntry.entryId,
      narrationCellId: expectedEntry.narrationCellId,
      mediaAncestry,
    });
  }
  return {
    schemaVersion: MEDIA_COLLECTION_VERSION,
    collectionId: expected.collectionId,
    manifestHash: expected.manifestHash,
    entries,
  };
}

function normalizeSnapshot(value) {
  if (!isObject(value) || !value.project) {
    fail('CV_SHOW_AUTHORING_SNAPSHOT_INVALID', 'CV Show authority snapshot requires Project');
  }
  let project = validateCvShowMasterProject(value.project);
  let mediaRegistry = createCvShowMediaBindingRegistry(project);
  if (Object.keys(mediaRegistry.entries).length !== 30) {
    fail('CV_SHOW_AUTHORING_SNAPSHOT_INVALID', 'CV Show authority requires all 30 media entries');
  }
  let mediaCollection = value.mediaCollection === undefined
    ? createMediaCollection(project, mediaRegistry)
    : normalizeMediaCollection(project, mediaRegistry, value.mediaCollection);
  return immutable({ project, mediaCollection });
}

function deriveView(snapshot) {
  let project = snapshot.project;
  let mediaRegistry = createCvShowMediaBindingRegistry(project, snapshot.mediaCollection);
  let identity = immutable({
    schemaVersion: VIEW_IDENTITY_VERSION,
    snapshot: snapshotIdentity(snapshot),
    media: mediaIdentity(snapshot.mediaCollection),
  });
  return immutable({
    base: projectBase(project),
    identity,
    project,
    story: projectCvShowStory(project),
    timeline: createPresentationAuthoringTimelineProjection(project),
    mediaRegistry,
    playable: Object.values(mediaRegistry.entries).every(({ playable }) => playable),
  });
}

export function normalizeCvShowRuntimeSnapshot(value) {
  return normalizeSnapshot(value);
}

export function createCvShowRuntimeSnapshotIdentity(value) {
  let normalized = normalizeSnapshot(value);
  return immutable({
    schemaVersion: VIEW_IDENTITY_VERSION,
    snapshot: snapshotIdentity(normalized),
    media: mediaIdentity(normalized.mediaCollection),
  });
}

export function createCvShowRuntimeState(value) {
  let snapshot = normalizeSnapshot(value);
  return Object.freeze({ snapshot, view: deriveView(snapshot) });
}

export function createCvShowRuntimeView(value) {
  return createCvShowRuntimeState(value).view;
}

function validateRuntimeSource(source) {
  if (
    !source
    || typeof source !== 'object'
    || typeof source.read !== 'function'
    || typeof source.getView !== 'function'
    || typeof source.subscribe !== 'function'
  ) {
    fail(
      'CV_SHOW_RUNTIME_SOURCE_INVALID',
      'CV Show runtime source must expose read(), getView(), and subscribe()',
    );
  }
  return source;
}

function validateSourceView(source, candidate) {
  let current = source.getView();
  let expected = createCvShowRuntimeView(source.read());
  if (
    candidate !== current
    || !Object.isFrozen(candidate)
    || computeIntegrity(candidate) !== computeIntegrity(expected)
  ) {
    fail(
      'CV_SHOW_RUNTIME_VIEW_INVALID',
      'CV Show runtime source did not provide its exact current immutable projection',
    );
  }
  return candidate;
}

export function createCvShowRuntimeAuthority({
  seedProject = CV_SHOW_PRESENTATION_PROJECT,
} = {}) {
  let seedView = createCvShowRuntimeView({ project: seedProject });
  let view = seedView;
  let activeSource = null;
  let unsubscribeSource = null;
  let subscribers = new Set();

  let notify = (nextView) => {
    let failure = null;
    for (let listener of [...subscribers]) {
      try {
        listener(nextView);
      } catch (error) {
        failure ||= error;
      }
    }
    if (failure) throw failure;
  };

  let authority = {
    getView() {
      return view;
    },
    subscribe(listener) {
      if (typeof listener !== 'function') {
        fail('CV_SHOW_RUNTIME_SUBSCRIBER_INVALID', 'CV Show runtime subscriber must be a function');
      }
      subscribers.add(listener);
      return () => subscribers.delete(listener);
    },
    attachSource(value) {
      if (activeSource) {
        fail(
          'CV_SHOW_RUNTIME_SOURCE_ATTACHED',
          'CV Show runtime already has a live source; detach it before attaching another',
        );
      }
      let source = validateRuntimeSource(value);
      let nextView = validateSourceView(source, source.getView());
      let detached = false;
      let unsubscribe = source.subscribe((candidate) => {
        view = validateSourceView(source, candidate);
        notify(view);
      });
      if (typeof unsubscribe !== 'function') {
        fail(
          'CV_SHOW_RUNTIME_SOURCE_INVALID',
          'CV Show runtime source subscribe() must return a detach function',
        );
      }
      activeSource = source;
      unsubscribeSource = unsubscribe;
      view = nextView;
      try {
        notify(view);
      } catch (error) {
        unsubscribeSource();
        unsubscribeSource = null;
        activeSource = null;
        view = seedView;
        throw error;
      }
      return () => {
        if (detached) return;
        detached = true;
        unsubscribeSource?.();
        unsubscribeSource = null;
        activeSource = null;
        view = seedView;
        notify(view);
      };
    },
  };
  return Object.freeze(authority);
}

let runtimeAuthority = null;

export function getCvShowRuntimeAuthority() {
  runtimeAuthority ||= createCvShowRuntimeAuthority();
  return runtimeAuthority;
}
