import { createHash, randomUUID } from 'node:crypto';
import {
  lstat,
  mkdir,
  open,
  readFile,
  readdir,
  rename,
} from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

import { createPresentationAuthoringProject } from 'symbiote-workspace';
import { canonicalize } from 'symbiote-workspace/schema/canonical-json.js';
import {
  createCvShowArtifactTreeIdentity,
  createCvShowAudioReleaseDescriptor,
} from './cv-show-audio-pipeline.js';
import {
  CV_SHOW_SOURCE_RELATIVE_PATH,
  replaceCvShowSource,
  withCvShowSourceLock,
} from './cv-show-authoring-materializer.js';
import {
  verifyCvShowPrivateArtifacts,
} from './verify-cv-show-private-artifacts.js';

const SHA256_PATTERN = /^[a-f0-9]{64}$/u;

function fail(code, message, details = {}) {
  throw Object.assign(new Error(message), { code, details: Object.freeze({ ...details }) });
}

function sha256(value) {
  return createHash('sha256').update(value).digest('hex');
}

function sourceSha256(value) {
  return `sha256:${sha256(value)}`;
}

function contentId(schemaVersion, value) {
  return `${schemaVersion}:${sha256(Buffer.from(canonicalize(value), 'utf8'))}`;
}

function isRecord(value) {
  return value && typeof value === 'object' && !Array.isArray(value);
}

function portablePath(value, field) {
  let source = String(value || '');
  let normalized = path.posix.normalize(source);
  if (
    !source
    || source.includes('\\')
    || path.posix.isAbsolute(source)
    || normalized !== source
    || source.split('/').some((part) => part === '.' || part === '..')
  ) {
    fail('CV_SHOW_AUDIO_PROMOTION_PATH_INVALID', `CV Show ${field} path is not portable`);
  }
  return source;
}

function portableSegment(value, field) {
  let source = String(value || '');
  if (!source || source === '.' || source === '..' || source.includes('/') || source.includes('\\')) {
    fail('CV_SHOW_AUDIO_PROMOTION_PATH_INVALID', `CV Show ${field} is not a portable path segment`);
  }
  return source;
}

function releaseInventory(aggregate) {
  let rows = [
    aggregate.release.manifests.audio,
    aggregate.release.manifests.alignment,
    ...aggregate.entries.flatMap((entry) => [entry.wav, entry.recognition, entry.alignment]),
  ].map((artifact, index) => ({
    path: portablePath(artifact?.path, `artifact ${index}`),
    sha256: artifact?.sha256,
    size: artifact?.size,
  }));
  return createCvShowArtifactTreeIdentity(rows);
}

function validateAggregate(aggregate) {
  let approvalProjection = aggregate?.approval && {
    schemaVersion: aggregate.approval.schemaVersion,
    approved: aggregate.approval.approved,
    releaseId: aggregate.approval.releaseId,
    artifactTreeHash: aggregate.approval.artifactTreeHash,
    verificationHash: aggregate.approval.verificationHash,
  };
  if (
    !isRecord(aggregate)
    || aggregate.release?.schemaVersion !== 'cv-show-audio-release-v1'
    || aggregate.approval?.approved !== true
    || aggregate.approval.releaseId !== aggregate.release.releaseId
    || aggregate.approval.artifactTreeHash !== aggregate.release.artifactTreeHash
    || aggregate.approval.verificationHash !== aggregate.release.verificationHash
    || typeof aggregate.approval.approvalId !== 'string'
    || aggregate.approval.approvalId
      !== contentId('cv-show-audio-release-approval-v1', approvalProjection)
    || !Array.isArray(aggregate.entries)
    || aggregate.entries.length !== 30
  ) {
    fail(
      'CV_SHOW_AUDIO_PROMOTION_APPROVAL_INVALID',
      'CV Show promotion requires the exact verified and approved aggregate release',
    );
  }
  let releaseProjection = { ...aggregate.release };
  delete releaseProjection.releaseId;
  let normalizedRelease = createCvShowAudioReleaseDescriptor(releaseProjection);
  if (
    normalizedRelease.releaseId !== aggregate.release.releaseId
    || aggregate.release.planId !== aggregate.plan?.planId
    || aggregate.entries.some((entry, index) => (
      entry.entryReleaseId !== aggregate.release.entryReleaseIds[index]
    ))
  ) {
    fail(
      'CV_SHOW_AUDIO_PROMOTION_RELEASE_INVALID',
      'CV Show promotion release identity is stale or reordered',
    );
  }
  let tree = releaseInventory(aggregate);
  if (tree.artifactTreeHash !== aggregate.release.artifactTreeHash) {
    fail('CV_SHOW_AUDIO_PROMOTION_TREE_INVALID', 'CV Show aggregate tree identity is forged');
  }
  if (aggregate.release.manifests.directory !== tree.artifactTreeHash.split(':').at(-1)) {
    fail(
      'CV_SHOW_AUDIO_PROMOTION_TREE_INVALID',
      'CV Show release directory must be selected by the artifact tree identity',
    );
  }
  portableSegment(aggregate.release.manifests.voice, 'release voice');
  portableSegment(aggregate.plan.predecessor.release.manifests.voice, 'predecessor voice');
  portableSegment(aggregate.plan.predecessor.release.manifests.directory, 'predecessor directory');
  let project = createPresentationAuthoringProject(aggregate.plan.project.input);
  if (
    project.revision !== aggregate.release.project.revision
    || project.hash !== aggregate.release.project.authoringProjectHash
  ) {
    fail('CV_SHOW_AUDIO_PROMOTION_PROJECT_INVALID', 'CV Show aggregate Project identity is stale');
  }
  return { project, tree };
}

async function status(filePath) {
  try {
    return await lstat(filePath);
  } catch (error) {
    if (error?.code === 'ENOENT') return null;
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

async function writeExclusive(filePath, bytes) {
  await mkdir(path.dirname(filePath), { recursive: true, mode: 0o700 });
  let handle = await open(filePath, 'wx', 0o600);
  try {
    await handle.writeFile(bytes);
    await handle.sync();
  } finally {
    await handle.close();
  }
  let reread = await readFile(filePath);
  return { path: filePath, sha256: sha256(reread), size: reread.byteLength };
}

async function syncTreeDirectories(root, inventory) {
  let directories = new Set([root]);
  for (let { path: relative } of inventory) {
    let directory = path.dirname(path.join(root, relative));
    while (directory.startsWith(root)) {
      directories.add(directory);
      if (directory === root) break;
      directory = path.dirname(directory);
    }
  }
  let ordered = [...directories].sort((left, right) => right.length - left.length);
  for (let directory of ordered) await syncDirectory(directory);
}

async function inspectTree(root) {
  let files = [];
  async function visit(relative = '') {
    let entries = await readdir(path.join(root, relative), { withFileTypes: true });
    for (let entry of entries) {
      let child = relative ? path.posix.join(relative, entry.name) : entry.name;
      if (entry.isSymbolicLink()) {
        fail('CV_SHOW_AUDIO_PROMOTION_SYMLINK', `CV Show candidate contains symlink ${child}`);
      }
      if (entry.isDirectory()) {
        await visit(child);
      } else if (entry.isFile()) {
        let bytes = await readFile(path.join(root, child));
        files.push({ path: child, sha256: sha256(bytes), size: bytes.byteLength });
      } else {
        fail('CV_SHOW_AUDIO_PROMOTION_TREE_INVALID', `CV Show candidate contains ${child}`);
      }
    }
  }
  await visit();
  return createCvShowArtifactTreeIdentity(files);
}

async function selectedSource(repoRoot) {
  let target = path.join(repoRoot, CV_SHOW_SOURCE_RELATIVE_PATH);
  let bytes = await readFile(target);
  let url = `${pathToFileURL(target).href}?cv-promotion-selected=${randomUUID()}`;
  let source = await import(url);
  return {
    bytes,
    sourceSha256: sourceSha256(bytes),
    project: source.CV_SHOW_PRESENTATION_PROJECT,
    release: source.CV_SHOW_AUDIO_RELEASE,
  };
}

function receipt(release, sourceHash) {
  let projection = {
    schemaVersion: 'cv-show-audio-promotion-receipt-v1',
    status: 'promoted',
    releaseId: release.releaseId,
    artifactTreeHash: release.artifactTreeHash,
    sourceSha256: sourceHash,
  };
  return Object.freeze({
    ...projection,
    receiptId: `cv-show-audio-promotion-receipt-v1:${sha256(
      Buffer.from(canonicalize(projection), 'utf8'),
    )}`,
  });
}

/**
 * @param {object} input
 * @returns {object}
 */
export function createCvShowAudioPromotion(input = {}) {
  let {
    repoRoot,
    privateRoot,
    sourceStorageRoot,
    verifyArtifacts = verifyCvShowPrivateArtifacts,
    readGeneratedArtifact,
    failpoint = async () => undefined,
  } = input;
  if (
    !path.isAbsolute(repoRoot)
    || !path.isAbsolute(privateRoot)
    || !path.isAbsolute(sourceStorageRoot)
    || typeof verifyArtifacts !== 'function'
    || (readGeneratedArtifact !== undefined && typeof readGeneratedArtifact !== 'function')
    || typeof failpoint !== 'function'
  ) {
    fail('CV_SHOW_AUDIO_PROMOTION_CONFIG_INVALID', 'CV Show promotion host roots are invalid');
  }

  let stageRelease = async (aggregate) => {
    let { project, tree } = validateAggregate(aggregate);
    let voiceRoot = path.join(privateRoot, aggregate.release.manifests.voice);
    let treeName = aggregate.release.artifactTreeHash.split(':').at(-1);
    let finalRoot = path.join(voiceRoot, treeName);
    let existing = await status(finalRoot);
    if (existing) {
      if (!existing.isDirectory() || existing.isSymbolicLink()) {
        fail('CV_SHOW_AUDIO_PROMOTION_TREE_CONFLICT', 'CV Show final tree path is not a directory');
      }
      let observed;
      try {
        observed = await inspectTree(finalRoot);
      } catch (error) {
        fail(
          'CV_SHOW_AUDIO_PROMOTION_TREE_CONFLICT',
          'CV Show final tree inventory is invalid',
          { causeCode: error?.code || 'UNKNOWN' },
        );
      }
      if (observed.artifactTreeHash !== tree.artifactTreeHash) {
        fail('CV_SHOW_AUDIO_PROMOTION_TREE_CONFLICT', 'CV Show final tree has different bytes');
      }
      await verifyArtifacts({ root: finalRoot, release: aggregate.release, project });
      return Object.freeze({
        schemaVersion: 'cv-show-audio-stage-receipt-v1',
        status: 'staged',
        releaseId: aggregate.release.releaseId,
        artifactTreeHash: aggregate.release.artifactTreeHash,
      });
    }
    await mkdir(voiceRoot, { recursive: true, mode: 0o700 });
    let candidate = path.join(voiceRoot, `.${treeName}.${randomUUID()}.unreachable`);
    await mkdir(candidate, { mode: 0o700 });
    let predecessor = aggregate.plan.predecessor.release;
    let predecessorRoot = path.join(
      privateRoot,
      predecessor.manifests.voice,
      predecessor.manifests.directory,
    );
    let generatedPaths = new Set();
    for (let [index, disposition] of aggregate.plan.entries.entries()) {
      if (disposition.mode !== 'regenerate') continue;
      let entry = aggregate.entries[index];
      generatedPaths.add(entry.wav.path);
      generatedPaths.add(entry.recognition.path);
      generatedPaths.add(entry.alignment.path);
    }
    for (let kind of ['audio', 'alignment']) {
      let selected = aggregate.release.manifests[kind];
      let prior = predecessor.manifests[kind];
      if (
        aggregate.plan.refreshArtifacts === true
        || selected.path !== prior.path
        || selected.sha256 !== prior.sha256
        || selected.size !== prior.size
      ) generatedPaths.add(selected.path);
    }
    for (let row of tree.inventory) {
      let bytes;
      if (generatedPaths.has(row.path)) {
        if (!readGeneratedArtifact) {
          fail(
            'CV_SHOW_AUDIO_PROMOTION_GENERATED_ARTIFACT_MISSING',
            `CV Show generated artifact ${row.path} has no reader`,
          );
        }
        bytes = await readGeneratedArtifact({ aggregate, path: row.path });
      } else {
        let sourcePath = path.join(predecessorRoot, row.path);
        let sourceStatus = await lstat(sourcePath);
        if (!sourceStatus.isFile() || sourceStatus.isSymbolicLink()) {
          fail(
            'CV_SHOW_AUDIO_PROMOTION_SYMLINK',
            `CV Show predecessor artifact ${row.path} is not a regular file`,
          );
        }
        bytes = await readFile(sourcePath);
      }
      let written = await writeExclusive(path.join(candidate, row.path), bytes);
      if (written.sha256 !== row.sha256 || written.size !== row.size) {
        fail(
          'CV_SHOW_AUDIO_PROMOTION_ARTIFACT_MISMATCH',
          `CV Show staged artifact ${row.path} does not match its release`,
        );
      }
    }
    let observed = await inspectTree(candidate);
    if (observed.artifactTreeHash !== aggregate.release.artifactTreeHash) {
      fail('CV_SHOW_AUDIO_PROMOTION_TREE_INVALID', 'CV Show staged tree identity is divergent');
    }
    await verifyArtifacts({ root: candidate, release: aggregate.release, project });
    await syncTreeDirectories(candidate, observed.inventory);
    await failpoint('before-tree-rename');
    try {
      await rename(candidate, finalRoot);
    } catch (error) {
      if (error?.code !== 'EEXIST' && error?.code !== 'ENOTEMPTY') throw error;
      let finalTree = await inspectTree(finalRoot);
      if (finalTree.artifactTreeHash !== observed.artifactTreeHash) {
        fail('CV_SHOW_AUDIO_PROMOTION_TREE_CONFLICT', 'CV Show final tree appeared with different bytes');
      }
    }
    await syncDirectory(voiceRoot);
    await failpoint('after-tree-rename');
    return Object.freeze({
      schemaVersion: 'cv-show-audio-stage-receipt-v1',
      status: 'staged',
      releaseId: aggregate.release.releaseId,
      artifactTreeHash: aggregate.release.artifactTreeHash,
    });
  };

  let promoteRelease = async (aggregate) => {
    let { project } = validateAggregate(aggregate);
    let treeName = aggregate.release.artifactTreeHash.split(':').at(-1);
    let finalRoot = path.join(privateRoot, aggregate.release.manifests.voice, treeName);
    let observed = await inspectTree(finalRoot);
    if (observed.artifactTreeHash !== aggregate.release.artifactTreeHash) {
      fail('CV_SHOW_AUDIO_PROMOTION_TREE_INVALID', 'CV Show final tree is missing or divergent');
    }
    await verifyArtifacts({ root: finalRoot, release: aggregate.release, project });
    return withCvShowSourceLock({ storageRoot: sourceStorageRoot, owner: 'materializer' }, async () => {
      let selected = await selectedSource(repoRoot);
      if (selected.release.releaseId === aggregate.release.releaseId) {
        if (
          selected.project.hash !== project.hash
          || selected.release.artifactTreeHash !== aggregate.release.artifactTreeHash
        ) {
          fail('CV_SHOW_AUDIO_PROMOTION_SOURCE_CONFLICT', 'CV Show selected release is divergent');
        }
        return receipt(aggregate.release, selected.sourceSha256);
      }
      let expected = aggregate.plan.predecessor.projectBase;
      if (
        selected.release.releaseId !== aggregate.plan.predecessor.release.releaseId
        || selected.sourceSha256 !== expected.sourceSha256
      ) {
        fail('CV_SHOW_AUDIO_PROMOTION_SOURCE_STALE', 'CV Show selected predecessor source is stale');
      }
      let replacement = await replaceCvShowSource({
        repoRoot,
        expectedSourceSha256: expected.sourceSha256,
        expectedProject: {
          revision: expected.revision,
          authoringProjectHash: expected.authoringProjectHash,
        },
        expectedReleaseId: aggregate.plan.predecessor.release.releaseId,
        project,
        release: aggregate.release,
        approval: aggregate.approval,
        validate: ({ release }) => {
          if (
            release.manifests.voice !== aggregate.release.manifests.voice
            || release.manifests.directory !== aggregate.release.manifests.directory
            || canonicalize(release.manifests.audio)
              !== canonicalize(aggregate.release.manifests.audio)
            || canonicalize(release.manifests.alignment)
              !== canonicalize(aggregate.release.manifests.alignment)
          ) {
            fail(
              'CV_SHOW_AUDIO_PROMOTION_SOURCE_INVALID',
              'CV Show selected private release identity is divergent',
            );
          }
        },
      });
      await failpoint('after-source-rename');
      let final = await selectedSource(repoRoot);
      if (
        final.release.releaseId !== aggregate.release.releaseId
        || final.sourceSha256 !== replacement.newSourceSha256
      ) {
        fail('CV_SHOW_AUDIO_PROMOTION_SOURCE_INVALID', 'CV Show final selected source is divergent');
      }
      return receipt(aggregate.release, final.sourceSha256);
    });
  };

  return Object.freeze({ stageRelease, promoteRelease });
}
