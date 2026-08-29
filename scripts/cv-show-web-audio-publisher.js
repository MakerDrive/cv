import { execFile as execFileCallback } from 'node:child_process';
import { createHash, randomUUID } from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { promisify } from 'node:util';
import { fileURLToPath } from 'node:url';
import { canonicalize } from 'symbiote-workspace/schema/canonical-json.js';
import {
  CV_SHOW_AUDIO_RELEASE,
  CV_SHOW_PRESENTATION_PROJECT,
} from '../src/static-pages/data/cvShowPresentationProject.js';
import { verifyCvShowPrivateArtifacts } from './verify-cv-show-private-artifacts.js';
import {
  CV_SHOW_WEB_AUDIO_FFMPEG_ARGUMENT_TEMPLATE,
  CV_SHOW_WEB_AUDIO_PROFILE,
  createCvShowWebAudioRevision,
  verifyCvShowWebAudio,
} from './verify-cv-show-web-audio.js';

export { CV_SHOW_WEB_AUDIO_PROFILE };

const execFile = promisify(execFileCallback);
const REPOSITORY_ROOT = fileURLToPath(new URL('../', import.meta.url));
const DEFAULT_PRIVATE_ROOT = path.join(
  REPOSITORY_ROOT,
  'TMP/cv-show-audio',
  CV_SHOW_AUDIO_RELEASE.manifests.voice,
  CV_SHOW_AUDIO_RELEASE.manifests.directory,
);
const DEFAULT_OUTPUT_BASE = path.join(
  REPOSITORY_ROOT,
  'src/static-pages/copy-cv-show-audio',
  CV_SHOW_AUDIO_RELEASE.manifests.voice,
);
const DEFAULT_SELECTOR_PATH = path.join(
  REPOSITORY_ROOT,
  'src/static-pages/data/cvShowWebAudioRelease.js',
);

export class CvShowWebAudioPublicationError extends Error {
  constructor(code, message, details = {}) {
    super(message);
    this.name = 'CvShowWebAudioPublicationError';
    this.code = code;
    this.details = Object.freeze({ ...details });
  }
}

function fail(code, message, details = {}) {
  throw new CvShowWebAudioPublicationError(code, message, details);
}

function assertExact(condition, code, message, details = {}) {
  if (!condition) fail(code, message, details);
}

function sha256(bytes) {
  return createHash('sha256').update(bytes).digest('hex');
}

function jsonBytes(value) {
  return Buffer.from(`${canonicalize(value)}\n`, 'utf8');
}

function parseJson(bytes, label) {
  try {
    return JSON.parse(bytes.toString('utf8'));
  } catch (error) {
    if (error instanceof SyntaxError) {
      fail('CV_SHOW_WEB_AUDIO_PRIVATE_JSON_INVALID', `${label} is not valid JSON.`, { label });
    }
    throw error;
  }
}

function portablePath(value, label) {
  let source = String(value || '');
  let normalized = path.posix.normalize(source);
  assertExact(
    source
      && !source.includes('\\')
      && !path.posix.isAbsolute(source)
      && normalized !== '..'
      && !normalized.startsWith('../')
      && normalized === source,
    'CV_SHOW_WEB_AUDIO_PRIVATE_PATH_INVALID',
    `${label} must be a normalized relative path inside the private release.`,
    { label },
  );
  return source;
}

async function readPrivateFile(root, relative, label) {
  try {
    return await fs.readFile(path.join(root, portablePath(relative, label)));
  } catch (error) {
    if (error instanceof CvShowWebAudioPublicationError) throw error;
    fail('CV_SHOW_WEB_AUDIO_PRIVATE_SOURCE_UNREADABLE', `${label} cannot be read.`, {
      label,
      causeCode: error?.code || 'UNKNOWN',
    });
  }
}

async function exists(target) {
  try {
    await fs.lstat(target);
    return true;
  } catch (error) {
    if (error?.code === 'ENOENT' || error?.code === 'ENOTDIR') return false;
    throw error;
  }
}

async function resolveExecutable(command) {
  if (command.includes(path.sep)) return path.resolve(command);
  let { stdout } = await execFile('/usr/bin/which', [command], {
    encoding: 'utf8',
    maxBuffer: 64 * 1024,
  });
  return stdout.trim();
}

export async function inspectCvShowWebAudioToolchain({
  ffmpegPath = 'ffmpeg',
  pkgConfigPath = 'pkg-config',
} = {}) {
  let resolvedFfmpeg;
  let versionOutput;
  let opusVersion;
  let binaryBytes;
  try {
    resolvedFfmpeg = await resolveExecutable(ffmpegPath);
    ({ stdout: versionOutput } = await execFile(resolvedFfmpeg, ['-version'], {
      encoding: 'utf8',
      maxBuffer: 1024 * 1024,
    }));
    ({ stdout: opusVersion } = await execFile(pkgConfigPath, ['--modversion', 'opus'], {
      encoding: 'utf8',
      maxBuffer: 64 * 1024,
    }));
    binaryBytes = await fs.readFile(resolvedFfmpeg);
  } catch (error) {
    fail(
      'CV_SHOW_WEB_AUDIO_TOOLCHAIN_UNAVAILABLE',
      'The locked ffmpeg/libopus publishing toolchain is unavailable.',
      { causeCode: error?.code || 'UNKNOWN' },
    );
  }
  let version = /^ffmpeg version ([^\s]+)/u.exec(versionOutput)?.[1];
  let binarySha256 = sha256(binaryBytes);
  let toolchainIdentity = `ffmpeg-${version}-libopus-${opusVersion.trim()}:sha256:${binarySha256}`;
  assertExact(
    toolchainIdentity === CV_SHOW_WEB_AUDIO_PROFILE.toolchainIdentity,
    'CV_SHOW_WEB_AUDIO_TOOLCHAIN_MISMATCH',
    'The active ffmpeg/libopus toolchain does not match the locked publisher identity.',
    { observedIdentity: toolchainIdentity },
  );
  return Object.freeze({ ffmpegPath: resolvedFfmpeg, toolchainIdentity });
}

function ffmpegArguments(input, output) {
  return CV_SHOW_WEB_AUDIO_FFMPEG_ARGUMENT_TEMPLATE.map((argument) => {
    if (argument === 'INPUT') return input;
    if (argument === 'OUTPUT') return output;
    return argument;
  });
}

export async function transcodeCvShowWebAudio({ input, output, ffmpegPath }) {
  try {
    await execFile(ffmpegPath, ffmpegArguments(input, output), {
      encoding: 'utf8',
      maxBuffer: 1024 * 1024,
    });
  } catch (error) {
    fail('CV_SHOW_WEB_AUDIO_TRANSCODE_FAILED', 'ffmpeg could not create a locked Opus derivative.', {
      causeCode: error?.code || 'UNKNOWN',
    });
  }
}

function verifyPrivateManifestPair(audioManifest, alignmentManifest, release) {
  let countsMatch = (counts) => counts?.total === 30
    && counts.short === 16
    && counts.detail === 14
    && counts.failures === 0;
  assertExact(
    audioManifest.version === 'cv-show-local-audio-manifest-v1'
      && alignmentManifest.version === 'cv-show-whisper-alignment-manifest-v1'
      && audioManifest.voiceSelection?.id === release.manifests.voice
      && audioManifest.locale === release.manifests.locale
      && alignmentManifest.locale === release.manifests.locale
      && alignmentManifest.sourceAudioInputHash === audioManifest.inputHash
      && audioManifest.story?.contractRevision === alignmentManifest.story?.contractRevision
      && countsMatch(audioManifest.counts)
      && countsMatch(alignmentManifest.counts)
      && audioManifest.clips?.length === 30
      && alignmentManifest.clips?.length === 30,
    'CV_SHOW_WEB_AUDIO_PRIVATE_SOURCE_MISMATCH',
    'The selected private audio/alignment manifests are not the locked 30-clip source pair.',
  );
}

function createSourceIdentity(release, audioManifest, alignmentManifest) {
  let source = {
    masterReleaseId: release.releaseId,
    masterArtifactTreeHash: release.artifactTreeHash,
    projectRevision: release.project?.revision,
    authoringProjectHash: release.project?.authoringProjectHash,
    voiceIdentityHash: release.acceptedProvenance?.voiceIdentityHash,
    audioInputHash: audioManifest.inputHash,
    audioManifestSha256: release.manifests.audio.sha256,
    alignmentInputHash: alignmentManifest.alignmentInputHash,
    alignmentManifestSha256: release.manifests.alignment.sha256,
  };
  assertExact(
    Object.values(source).every((value) => (
      typeof value === 'string' ? value.length > 0 : Number.isSafeInteger(value) && value > 0
    )),
    'CV_SHOW_WEB_AUDIO_PRIVATE_SOURCE_MISMATCH',
    'The selected master release does not contain every locked public source identity.',
  );
  return source;
}

function createStoryIdentity(audioManifest) {
  let story = audioManifest.story;
  return {
    version: story.version,
    contractRevision: story.contractRevision,
    narrationLocale: story.narrationLocale,
    shortCount: story.shortCount,
    detailCount: story.detailCount,
  };
}

function verifyPrivateClipPair(audioClip, alignmentClip, expectedIndex) {
  let kind = expectedIndex <= 16 ? 'short' : 'detail';
  let order = expectedIndex <= 16 ? expectedIndex : expectedIndex - 16;
  assertExact(
    audioClip?.index === expectedIndex
      && alignmentClip?.index === expectedIndex
      && audioClip.kind === kind
      && alignmentClip.kind === kind
      && audioClip.order === order
      && alignmentClip.order === order
      && audioClip.id === alignmentClip.id
      && audioClip.speechSha256 === sha256(audioClip.speech)
      && alignmentClip.sourceAudioSha256 === audioClip.sha256
      && alignmentClip.mediaDurationMs === Math.round(audioClip.durationSec * 1_000),
    'CV_SHOW_WEB_AUDIO_PRIVATE_CLIP_MISMATCH',
    `Private clip ${expectedIndex} does not bind one exact WAV/alignment pair.`,
    { expectedIndex },
  );
  let alignedFile = portablePath(
    alignmentClip.alignedSequenceFile,
    `aligned sequence ${expectedIndex}`,
  );
  let orderedName = path.posix.basename(alignedFile, '.json');
  assertExact(
    alignedFile === `aligned/${orderedName}.json`
      && orderedName === `${String(expectedIndex).padStart(2, '0')}-${kind}-${audioClip.id}`,
    'CV_SHOW_WEB_AUDIO_PRIVATE_CLIP_MISMATCH',
    `Private clip ${expectedIndex} does not use the canonical ordered alignment name.`,
    { expectedIndex },
  );
  return { alignedFile, orderedName };
}

function selectorFor(manifest, manifestBytes) {
  return {
    schemaVersion: 'cv-show-web-audio-selector-v1',
    releaseId: manifest.releaseId,
    sourceMasterReleaseId: manifest.source.masterReleaseId,
    voiceId: manifest.voiceId,
    locale: manifest.locale,
    revision: manifest.revision,
    manifest: {
      path: `${manifest.voiceId}/${manifest.revision}/manifest.json`,
      sha256: sha256(manifestBytes),
      bytes: manifestBytes.byteLength,
    },
  };
}

function selectorBytes(selector) {
  return Buffer.from(
    `export const CV_SHOW_WEB_AUDIO_RELEASE = Object.freeze(${JSON.stringify(selector, null, 2)});\n`,
    'utf8',
  );
}

async function updateSelector(pathname, selector, bytes) {
  let current;
  try {
    current = await fs.readFile(pathname);
  } catch (error) {
    if (error?.code !== 'ENOENT' && error?.code !== 'ENOTDIR') throw error;
  }
  if (current?.equals(bytes)) return false;
  if (current?.includes(Buffer.from(selector.releaseId, 'utf8'))) {
    fail(
      'CV_SHOW_WEB_AUDIO_EXISTING_RELEASE_DIVERGED',
      'The existing selector for this revision differs from the canonical generated bytes.',
    );
  }
  await fs.mkdir(path.dirname(pathname), { recursive: true });
  let temporary = path.join(
    path.dirname(pathname),
    `.${path.basename(pathname)}.${randomUUID()}.tmp`,
  );
  try {
    await fs.writeFile(temporary, bytes, { flag: 'wx' });
    await fs.rename(temporary, pathname);
  } finally {
    await fs.rm(temporary, { force: true });
  }
  return true;
}

async function verifyExistingRelease({
  finalRoot,
  selector,
  source,
  probeAudio,
  ffmpegPath,
  ffprobePath,
  expectedTreeHash,
  verifyPublicRelease,
}) {
  let result;
  try {
    result = await verifyPublicRelease({
      root: finalRoot,
      selector,
      expectedSource: source,
      probeAudio,
      ffmpegPath,
      ffprobePath,
    });
  } catch (error) {
    fail(
      'CV_SHOW_WEB_AUDIO_EXISTING_RELEASE_DIVERGED',
      'An existing directory for this revision is not the exact verified release.',
      { causeCode: error?.code || 'UNKNOWN' },
    );
  }
  assertExact(
    result.treeInventorySha256 === expectedTreeHash,
    'CV_SHOW_WEB_AUDIO_EXISTING_RELEASE_DIVERGED',
    'An existing directory for this revision differs from the generated candidate bytes.',
  );
  return result;
}

export async function publishCvShowWebAudio({
  repoRoot = REPOSITORY_ROOT,
  privateRoot = DEFAULT_PRIVATE_ROOT,
  outputBase = DEFAULT_OUTPUT_BASE,
  selectorPath = DEFAULT_SELECTOR_PATH,
  release = CV_SHOW_AUDIO_RELEASE,
  project = CV_SHOW_PRESENTATION_PROJECT,
  ffmpegPath = 'ffmpeg',
  ffprobePath = 'ffprobe',
  pkgConfigPath = 'pkg-config',
  verifyPrivateArtifacts = verifyCvShowPrivateArtifacts,
  inspectToolchain = inspectCvShowWebAudioToolchain,
  transcode = transcodeCvShowWebAudio,
  probeAudio,
  verifyPublicRelease = verifyCvShowWebAudio,
} = {}) {
  let resolvedRepository = path.resolve(repoRoot);
  let resolvedPrivateRoot = path.resolve(privateRoot);
  let resolvedOutputBase = path.resolve(outputBase);
  let resolvedSelectorPath = path.resolve(selectorPath);

  await verifyPrivateArtifacts({ root: resolvedPrivateRoot, release, project });

  let audioManifestBytes = await readPrivateFile(
    resolvedPrivateRoot,
    release.manifests.audio.path,
    'private audio manifest',
  );
  let alignmentManifestBytes = await readPrivateFile(
    resolvedPrivateRoot,
    release.manifests.alignment.path,
    'private alignment manifest',
  );
  assertExact(
    audioManifestBytes.byteLength === release.manifests.audio.size
      && sha256(audioManifestBytes) === release.manifests.audio.sha256
      && alignmentManifestBytes.byteLength === release.manifests.alignment.size
      && sha256(alignmentManifestBytes) === release.manifests.alignment.sha256,
    'CV_SHOW_WEB_AUDIO_PRIVATE_SOURCE_MISMATCH',
    'The private manifest bytes do not match the selected master release.',
  );
  let audioManifest = parseJson(audioManifestBytes, 'private audio manifest');
  let alignmentManifest = parseJson(alignmentManifestBytes, 'private alignment manifest');
  verifyPrivateManifestPair(audioManifest, alignmentManifest, release);
  let source = createSourceIdentity(release, audioManifest, alignmentManifest);
  let story = createStoryIdentity(audioManifest);
  let alignmentDirectory = path.posix.dirname(release.manifests.alignment.path);

  let toolchain = await inspectToolchain({ ffmpegPath, pkgConfigPath });
  assertExact(
    toolchain?.toolchainIdentity === CV_SHOW_WEB_AUDIO_PROFILE.toolchainIdentity
      && typeof toolchain.ffmpegPath === 'string'
      && toolchain.ffmpegPath,
    'CV_SHOW_WEB_AUDIO_TOOLCHAIN_MISMATCH',
    'The publisher refused an unrecognized ffmpeg/libopus toolchain.',
  );

  let temporaryParent = path.join(resolvedRepository, 'TMP/cv-show-web-audio-publisher');
  await fs.mkdir(temporaryParent, { recursive: true });
  let temporaryRoot = await fs.mkdtemp(path.join(temporaryParent, 'release-'));
  let candidateMoved = false;
  try {
    await fs.mkdir(path.join(temporaryRoot, 'clips'));
    await fs.mkdir(path.join(temporaryRoot, 'aligned'));
    let clips = [];
    let totalMasterBytes = 0;
    for (let index = 0; index < 30; index += 1) {
      let audioClip = audioManifest.clips[index];
      let alignmentClip = alignmentManifest.clips[index];
      let { alignedFile, orderedName } = verifyPrivateClipPair(audioClip, alignmentClip, index + 1);
      let wavRelative = portablePath(audioClip.file, `master WAV ${index + 1}`);
      let wavBytes = await readPrivateFile(resolvedPrivateRoot, wavRelative, `master WAV ${index + 1}`);
      assertExact(
        wavBytes.byteLength === audioClip.bytes && sha256(wavBytes) === audioClip.sha256,
        'CV_SHOW_WEB_AUDIO_PRIVATE_SOURCE_MISMATCH',
        `Master WAV ${index + 1} differs from its private manifest row.`,
        { index: index + 1 },
      );
      let alignedRelative = path.posix.join(alignmentDirectory, alignedFile);
      let alignedBytes = await readPrivateFile(
        resolvedPrivateRoot,
        alignedRelative,
        `aligned sequence ${index + 1}`,
      );
      assertExact(
        sha256(alignedBytes) === alignmentClip.alignedSequenceSha256,
        'CV_SHOW_WEB_AUDIO_PRIVATE_SOURCE_MISMATCH',
        `Aligned sequence ${index + 1} differs from its private manifest row.`,
        { index: index + 1 },
      );
      let pending = path.join(temporaryRoot, 'clips', `.${orderedName}.pending`);
      await transcode({
        input: path.join(resolvedPrivateRoot, wavRelative),
        output: pending,
        ffmpegPath: toolchain.ffmpegPath,
        arguments: ffmpegArguments(path.join(resolvedPrivateRoot, wavRelative), pending),
      });
      let deliveryBytes = await fs.readFile(pending);
      let deliverySha256 = sha256(deliveryBytes);
      let deliveryFile = `clips/${orderedName}-${deliverySha256.slice(0, 12)}.opus`;
      await fs.rename(pending, path.join(temporaryRoot, deliveryFile));
      let alignedSequenceFile = `aligned/${orderedName}.json`;
      await fs.writeFile(path.join(temporaryRoot, alignedSequenceFile), alignedBytes, { flag: 'wx' });
      clips.push({
        index: audioClip.index,
        kind: audioClip.kind,
        order: audioClip.order,
        id: audioClip.id,
        speech: audioClip.speech,
        speechSha256: audioClip.speechSha256,
        masterWavSha256: audioClip.sha256,
        masterDurationMs: alignmentClip.mediaDurationMs,
        deliveryFile,
        deliverySha256,
        deliveryBytes: deliveryBytes.byteLength,
        alignedSequenceFile,
        alignedSequenceSha256: alignmentClip.alignedSequenceSha256,
        alignedSequenceHash: alignmentClip.alignedSequenceHash,
        timelineHash: alignmentClip.timelineHash,
      });
      totalMasterBytes += wavBytes.byteLength;
    }

    let projection = {
      schemaVersion: 'cv-show-web-audio-release-v1',
      source,
      story,
      locale: release.manifests.locale,
      voiceId: release.manifests.voice,
      alignedSequenceVersion: alignmentManifest.alignedSequenceVersion,
      profile: CV_SHOW_WEB_AUDIO_PROFILE,
      clips,
    };
    let revision = createCvShowWebAudioRevision(projection);
    let manifest = {
      ...projection,
      releaseId: `cv-show-web-audio-release-v1:${revision}`,
      revision,
    };
    let manifestBytes = jsonBytes(manifest);
    await fs.writeFile(path.join(temporaryRoot, 'manifest.json'), manifestBytes, { flag: 'wx' });
    let selector = selectorFor(manifest, manifestBytes);
    let renderedSelector = selectorBytes(selector);
    let candidate = await verifyPublicRelease({
      root: temporaryRoot,
      selector,
      expectedSource: source,
      probeAudio,
      ffmpegPath: toolchain.ffmpegPath,
      ffprobePath,
    });
    let finalRoot = path.join(resolvedOutputBase, revision);
    let releaseCreated = false;
    if (await exists(finalRoot)) {
      await verifyExistingRelease({
        finalRoot,
        selector,
        source,
        probeAudio,
        ffmpegPath: toolchain.ffmpegPath,
        ffprobePath,
        expectedTreeHash: candidate.treeInventorySha256,
        verifyPublicRelease,
      });
    } else {
      await fs.mkdir(resolvedOutputBase, { recursive: true });
      try {
        await fs.rename(temporaryRoot, finalRoot);
        candidateMoved = true;
        releaseCreated = true;
      } catch (error) {
        if (error?.code !== 'EEXIST' && error?.code !== 'ENOTEMPTY') throw error;
        await verifyExistingRelease({
          finalRoot,
          selector,
          source,
          probeAudio,
          ffmpegPath: toolchain.ffmpegPath,
          ffprobePath,
          expectedTreeHash: candidate.treeInventorySha256,
          verifyPublicRelease,
        });
      }
    }
    let selectorChanged = await updateSelector(resolvedSelectorPath, selector, renderedSelector);
    let reductionPercent = (1 - candidate.totalDeliveryBytes / totalMasterBytes) * 100;
    return Object.freeze({
      status: releaseCreated || selectorChanged ? 'published' : 'noop',
      releaseId: manifest.releaseId,
      revision,
      sourceMasterReleaseId: source.masterReleaseId,
      manifestSha256: candidate.manifestSha256,
      manifestBytes: candidate.manifestBytes,
      treeInventorySha256: candidate.treeInventorySha256,
      files: candidate.files,
      clips: candidate.clips,
      alignedSequences: candidate.alignedSequences,
      totalMasterBytes,
      totalDeliveryBytes: candidate.totalDeliveryBytes,
      reductionPercent,
      selectorChanged,
    });
  } finally {
    if (!candidateMoved) await fs.rm(temporaryRoot, { recursive: true, force: true });
  }
}

function cliError(error) {
  if (error instanceof CvShowWebAudioPublicationError) return error;
  return new CvShowWebAudioPublicationError(
    'CV_SHOW_WEB_AUDIO_PUBLICATION_FAILED',
    error?.message || 'CV Show web-audio publication failed.',
    { causeCode: error?.code || 'UNKNOWN' },
  );
}

let isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  try {
    let args = process.argv.slice(2);
    assertExact(
      args.length <= 1,
      'CV_SHOW_WEB_AUDIO_ARGUMENT_INVALID',
      'Pass at most one explicit private artifact root.',
    );
    let result = await publishCvShowWebAudio({
      privateRoot: args[0] ? path.resolve(args[0]) : DEFAULT_PRIVATE_ROOT,
    });
    process.stdout.write(`${JSON.stringify(result)}\n`);
  } catch (error) {
    let typed = cliError(error);
    process.stderr.write(`${JSON.stringify({
      status: 'failed',
      code: typed.code,
      message: typed.message,
      details: typed.details,
    })}\n`);
    process.exitCode = 1;
  }
}
