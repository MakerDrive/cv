import { createHash, randomUUID } from 'node:crypto';
import {
  open,
  readFile,
  rename,
  stat,
  unlink,
} from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

import {
  presentationAuthoringProjectCanonicalProjection,
} from 'symbiote-workspace';
import { computeIntegrity } from 'symbiote-workspace/schema/canonical-json.js';
import {
  createCvShowMediaBindingRegistry,
  validateCvShowMasterProject,
} from '../src/static-pages/js/tour-player/presentationProjectAdapter.js';
import {
  createCvShowAudioReleaseDescriptor,
} from './cv-show-audio-pipeline.js';
import {
  acquireCvShowAuthoringLock,
} from './cv-show-authoring-storage.js';

export const CV_SHOW_SOURCE_RELATIVE_PATH = 'src/static-pages/data/cvShowPresentationProject.js';
export const CV_SHOW_PROJECT_START_SENTINEL = '/* CV_SHOW_AUTHORING_PROJECT_INPUT:START */';
export const CV_SHOW_PROJECT_END_SENTINEL = '/* CV_SHOW_AUTHORING_PROJECT_INPUT:END */';
export const CV_SHOW_RELEASE_START_SENTINEL = '/* CV_SHOW_AUDIO_RELEASE_INPUT:START */';
export const CV_SHOW_RELEASE_END_SENTINEL = '/* CV_SHOW_AUDIO_RELEASE_INPUT:END */';
const SHA256_PATTERN = /^sha256:[a-f0-9]{64}$/u;
const LEGACY_PROJECT_SCHEMA = 'workspace-presentation-authoring-project-v1';
const LEGACY_PROJECT_HASH_PATTERN = /^workspace-presentation-authoring-project-v1:sha256-[A-Za-z0-9+/]{43}=$/u;

function fail(code, message, details = {}) {
  throw Object.assign(new Error(message), { code, details: Object.freeze({ ...details }) });
}

function sha256(value) {
  return `sha256:${createHash('sha256').update(value).digest('hex')}`;
}

function validateRelease(release, project) {
  if (
    !release
    || release.schemaVersion !== 'cv-show-audio-release-v1'
    || typeof release.releaseId !== 'string'
    || release.entryReleaseIds?.length !== 30
    || new Set(release.entryReleaseIds).size !== 30
    || release.project?.revision !== project.revision
    || release.project?.authoringProjectHash !== project.hash
  ) {
    fail(
      'CV_SHOW_AUTHORING_RELEASE_INVALID',
      'CV Show source must bind one valid 30-entry release to its exact Project',
    );
  }
  let registry = createCvShowMediaBindingRegistry(project);
  let entries = Object.values(registry.entries);
  if (
    entries.length !== 30
    || entries.some((entry) => entry.status !== 'accepted' || entry.playable !== true)
  ) {
    fail(
      'CV_SHOW_AUTHORING_RELEASE_INVALID',
      'CV Show source promotion requires 30 accepted playable Project media bindings',
    );
  }
  return release;
}

function sentinelLiteralBounds(source, startSentinel, endSentinel, field) {
  let start = source.indexOf(startSentinel);
  let end = source.indexOf(endSentinel);
  if (
    start < 0
    || end < 0
    || start !== source.lastIndexOf(startSentinel)
    || end !== source.lastIndexOf(endSentinel)
    || start >= end
  ) {
    fail(
      'CV_SHOW_AUTHORING_SENTINEL_INVALID',
      `CV Show ${field} source sentinels are invalid`,
    );
  }
  return { start, end, literalStart: start + startSentinel.length };
}

function parseSentinelJson(source, startSentinel, endSentinel, field) {
  let { literalStart, end } = sentinelLiteralBounds(
    source,
    startSentinel,
    endSentinel,
    field,
  );
  try {
    return JSON.parse(source.slice(literalStart, end).trim());
  } catch {
    fail(
      'CV_SHOW_AUTHORING_SOURCE_INVALID',
      `CV Show ${field} sentinel content must be one JSON value`,
    );
  }
}

function legacySourceSelection(source, projectInput) {
  if (projectInput?.schemaVersion !== LEGACY_PROJECT_SCHEMA) return null;
  let project = {
    ...projectInput,
    hash: `${LEGACY_PROJECT_SCHEMA}:${computeIntegrity(projectInput)}`,
  };
  let release = parseSentinelJson(
    source,
    CV_SHOW_RELEASE_START_SENTINEL,
    CV_SHOW_RELEASE_END_SENTINEL,
    'audio release',
  );
  if (
    Object.hasOwn(projectInput, 'hash')
    || project.id !== 'cv-show'
    || !Number.isInteger(project.revision)
    || project.revision < 0
    || !LEGACY_PROJECT_HASH_PATTERN.test(String(project.hash || ''))
    || release?.schemaVersion !== 'cv-show-audio-release-v1'
    || release.project?.revision !== project.revision
    || release.project?.authoringProjectHash !== project.hash
  ) {
    fail(
      'CV_SHOW_AUTHORING_SOURCE_STALE',
      'CV Show legacy Project/release source base is stale or invalid',
    );
  }
  let releaseProjection = { ...release };
  delete releaseProjection.releaseId;
  let normalizedRelease;
  try {
    normalizedRelease = createCvShowAudioReleaseDescriptor(releaseProjection);
  } catch (error) {
    fail(
      'CV_SHOW_AUTHORING_SOURCE_STALE',
      'CV Show legacy audio release identity is stale or invalid',
      { causeCode: error?.code || 'UNKNOWN' },
    );
  }
  if (normalizedRelease.releaseId !== release.releaseId) {
    fail(
      'CV_SHOW_AUTHORING_SOURCE_STALE',
      'CV Show legacy audio release identity is stale or invalid',
    );
  }
  return { sourceModule: null, project, release: normalizedRelease };
}

async function importProjectModule(sourcePath, phase) {
  let url = `${pathToFileURL(sourcePath).href}?cv-source-${phase}=${randomUUID()}`;
  let sourceModule = await import(url);
  let project = validateCvShowMasterProject(sourceModule.CV_SHOW_PRESENTATION_PROJECT);
  let release = validateRelease(sourceModule.CV_SHOW_AUDIO_RELEASE, project);
  return { sourceModule, project, release };
}

async function importExactProjectModule({ sourcePath, bytes, phase, mode }) {
  let temporary = `${sourcePath}.${process.pid}.${randomUUID()}.${phase}.load.mjs`;
  let handle;
  try {
    handle = await open(temporary, 'wx', mode);
    await handle.writeFile(bytes);
    await handle.sync();
    await handle.close();
    handle = null;
    return await importProjectModule(temporary, phase);
  } finally {
    await handle?.close().catch(() => undefined);
    await unlink(temporary).catch(() => undefined);
  }
}

export async function loadCvShowSourceSelection({
  sourcePath,
  phase = 'current',
  expectedSourceSha256,
} = {}) {
  if (
    !path.isAbsolute(sourcePath)
    || typeof phase !== 'string'
    || !phase
    || (expectedSourceSha256 !== undefined
      && !SHA256_PATTERN.test(String(expectedSourceSha256)))
  ) {
    fail('CV_SHOW_AUTHORING_SOURCE_INVALID', 'CV Show source selection input is invalid');
  }
  let [bytes, sourceStat] = await Promise.all([readFile(sourcePath), stat(sourcePath)]);
  if (expectedSourceSha256 !== undefined && sha256(bytes) !== expectedSourceSha256) {
    fail('CV_SHOW_AUTHORING_SOURCE_STALE', 'CV Show Project/release source SHA-256 is stale');
  }
  let source = bytes.toString('utf8');
  let projectInput = parseSentinelJson(
    source,
    CV_SHOW_PROJECT_START_SENTINEL,
    CV_SHOW_PROJECT_END_SENTINEL,
    'Project',
  );
  let selected = legacySourceSelection(source, projectInput);
  if (!selected) {
    selected = await importExactProjectModule({
      sourcePath,
      bytes,
      phase,
      mode: sourceStat.mode & 0o777,
    });
  }
  return Object.freeze({
    sourcePath,
    bytes,
    CV_SHOW_PRESENTATION_PROJECT: selected.project,
    CV_SHOW_AUDIO_RELEASE: selected.release,
  });
}

function replaceSentinelLiteral(source, startSentinel, endSentinel, value, field) {
  let { literalStart, end } = sentinelLiteralBounds(
    source,
    startSentinel,
    endSentinel,
    field,
  );
  return `${source.slice(0, literalStart)}\n${JSON.stringify(value, null, 2)}\n${source.slice(end)}`;
}

export function renderCvShowSource({ source, project, release } = {}) {
  if (typeof source !== 'string' || !project || !release) {
    fail('CV_SHOW_AUTHORING_SOURCE_INVALID', 'CV Show source rendering input is invalid');
  }
  let next = replaceSentinelLiteral(
    source,
    CV_SHOW_PROJECT_START_SENTINEL,
    CV_SHOW_PROJECT_END_SENTINEL,
    presentationAuthoringProjectCanonicalProjection(project),
    'Project',
  );
  return replaceSentinelLiteral(
    next,
    CV_SHOW_RELEASE_START_SENTINEL,
    CV_SHOW_RELEASE_END_SENTINEL,
    release,
    'audio release',
  );
}

async function writeValidatedTemporaryModule({
  target,
  source,
  expectedProjectHash,
  expectedReleaseId,
  mode,
  validate,
}) {
  let temporary = `${target}.${process.pid}.${randomUUID()}.tmp.mjs`;
  let handle;
  try {
    handle = await open(temporary, 'wx', mode);
    await handle.writeFile(source, 'utf8');
    await handle.sync();
    await handle.close();
    handle = null;
    let imported = await importProjectModule(temporary, 'temporary');
    if (
      imported.project.hash !== expectedProjectHash
      || imported.release.releaseId !== expectedReleaseId
    ) {
      fail(
        'CV_SHOW_AUTHORING_MATERIALIZATION_INVALID',
        'CV Show temporary Project/release selection is divergent',
      );
    }
    if (validate) await validate(imported);
    return temporary;
  } catch (error) {
    await handle?.close().catch(() => undefined);
    await unlink(temporary).catch(() => undefined);
    throw error;
  }
}

async function syncDirectory(directory) {
  let handle = await open(directory, 'r');
  try {
    await handle.sync();
  } finally {
    await handle.close();
  }
}

export async function replaceCvShowSource({
  repoRoot,
  expectedSourceSha256,
  expectedProject,
  expectedReleaseId,
  project,
  release,
  approval,
  validate,
} = {}) {
  if (
    !path.isAbsolute(repoRoot)
    || !SHA256_PATTERN.test(String(expectedSourceSha256 || ''))
    || !expectedProject
    || typeof expectedReleaseId !== 'string'
    || approval?.approved !== true
    || approval.releaseId !== release?.releaseId
    || approval.artifactTreeHash !== release?.artifactTreeHash
    || approval.verificationHash !== release?.verificationHash
  ) {
    fail('CV_SHOW_AUTHORING_SOURCE_INVALID', 'CV Show source CAS input is invalid');
  }
  let target = path.join(repoRoot, CV_SHOW_SOURCE_RELATIVE_PATH);
  let [currentSelection, sourceStat] = await Promise.all([
    loadCvShowSourceSelection({
      sourcePath: target,
      phase: 'current',
      expectedSourceSha256,
    }),
    stat(target),
  ]);
  let beforeBytes = currentSelection.bytes;
  let source = beforeBytes.toString('utf8');
  if (
    currentSelection.CV_SHOW_PRESENTATION_PROJECT.revision !== expectedProject.revision
    || currentSelection.CV_SHOW_PRESENTATION_PROJECT.hash !== expectedProject.authoringProjectHash
    || currentSelection.CV_SHOW_AUDIO_RELEASE.releaseId !== expectedReleaseId
  ) {
    fail('CV_SHOW_AUTHORING_SOURCE_STALE', 'CV Show Project/release source base is stale');
  }
  let nextSource = renderCvShowSource({
    source,
    project,
    release,
  });
  let temporary = await writeValidatedTemporaryModule({
    target,
    source: nextSource,
    expectedProjectHash: project.hash,
    expectedReleaseId: release.releaseId,
    mode: sourceStat.mode & 0o777,
    validate,
  });
  try {
    let latestBytes = await readFile(target);
    if (sha256(latestBytes) !== expectedSourceSha256) {
      fail('CV_SHOW_AUTHORING_SOURCE_STALE', 'CV Show source changed before atomic replacement');
    }
    await rename(temporary, target);
    temporary = null;
    await syncDirectory(path.dirname(target));
  } finally {
    if (temporary) await unlink(temporary).catch(() => undefined);
  }
  let final = await loadCvShowSourceSelection({ sourcePath: target, phase: 'final' });
  if (
    final.CV_SHOW_PRESENTATION_PROJECT.hash !== project.hash
    || final.CV_SHOW_AUDIO_RELEASE.releaseId !== release.releaseId
  ) {
    fail('CV_SHOW_AUTHORING_MATERIALIZATION_INVALID', 'CV Show final source is divergent');
  }
  return Object.freeze({
    oldSourceSha256: expectedSourceSha256,
    newSourceSha256: sha256(final.bytes),
    project: final.CV_SHOW_PRESENTATION_PROJECT,
    release: final.CV_SHOW_AUDIO_RELEASE,
  });
}

export async function withCvShowSourceLock({ storageRoot, owner }, operation) {
  if (!path.isAbsolute(storageRoot) || typeof operation !== 'function') {
    fail('CV_SHOW_AUTHORING_SOURCE_INVALID', 'CV Show source lock input is invalid');
  }
  let lock = await acquireCvShowAuthoringLock({ storageRoot, owner });
  try {
    return await operation();
  } finally {
    await lock.release();
  }
}

export async function materializeCvShowAuthoringDraft() {
  fail(
    'CV_SHOW_AUTHORING_AUDIO_RELEASE_REQUIRED',
    'Verify and approve an aggregate CV Show audio release before materializing authoring changes',
  );
}
