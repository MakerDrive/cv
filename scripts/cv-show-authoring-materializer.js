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
import {
  createCvShowMediaBindingRegistry,
  validateCvShowMasterProject,
} from '../src/static-pages/js/tour-player/presentationProjectAdapter.js';
import {
  acquireCvShowAuthoringLock,
} from './cv-show-authoring-storage.js';

export const CV_SHOW_SOURCE_RELATIVE_PATH = 'src/static-pages/data/cvShowPresentationProject.js';
export const CV_SHOW_PROJECT_START_SENTINEL = '/* CV_SHOW_AUTHORING_PROJECT_INPUT:START */';
export const CV_SHOW_PROJECT_END_SENTINEL = '/* CV_SHOW_AUTHORING_PROJECT_INPUT:END */';
export const CV_SHOW_RELEASE_START_SENTINEL = '/* CV_SHOW_AUDIO_RELEASE_INPUT:START */';
export const CV_SHOW_RELEASE_END_SENTINEL = '/* CV_SHOW_AUDIO_RELEASE_INPUT:END */';
const SHA256_PATTERN = /^sha256:[a-f0-9]{64}$/u;

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

async function importProjectModule(sourcePath, phase) {
  let url = `${pathToFileURL(sourcePath).href}?cv-source-${phase}=${randomUUID()}`;
  let sourceModule = await import(url);
  let project = validateCvShowMasterProject(sourceModule.CV_SHOW_PRESENTATION_PROJECT);
  let release = validateRelease(sourceModule.CV_SHOW_AUDIO_RELEASE, project);
  return { sourceModule, project, release };
}

function replaceSentinelLiteral(source, startSentinel, endSentinel, value, field) {
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
  let literalStart = start + startSentinel.length;
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
  let [beforeBytes, sourceStat] = await Promise.all([readFile(target), stat(target)]);
  if (sha256(beforeBytes) !== expectedSourceSha256) {
    fail('CV_SHOW_AUTHORING_SOURCE_STALE', 'CV Show Project/release source SHA-256 is stale');
  }
  let current = await importProjectModule(target, 'current');
  if (
    current.project.revision !== expectedProject.revision
    || current.project.hash !== expectedProject.authoringProjectHash
    || current.release.releaseId !== expectedReleaseId
  ) {
    fail('CV_SHOW_AUTHORING_SOURCE_STALE', 'CV Show Project/release source base is stale');
  }
  let nextSource = renderCvShowSource({
    source: beforeBytes.toString('utf8'),
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
  let finalBytes = await readFile(target);
  let final = await importProjectModule(target, 'final');
  if (final.project.hash !== project.hash || final.release.releaseId !== release.releaseId) {
    fail('CV_SHOW_AUTHORING_MATERIALIZATION_INVALID', 'CV Show final source is divergent');
  }
  return Object.freeze({
    oldSourceSha256: expectedSourceSha256,
    newSourceSha256: sha256(finalBytes),
    project: final.project,
    release: final.release,
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
