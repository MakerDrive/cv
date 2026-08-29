import { createHash } from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { canonicalize } from 'symbiote-workspace/schema/canonical-json.js';
import {
  CV_SHOW_AUDIO_RELEASE,
  CV_SHOW_PRESENTATION_PROJECT,
} from '../src/static-pages/data/cvShowPresentationProject.js';

const PRIVATE_ROOT_ENV = 'CV_SHOW_PRIVATE_ARTIFACT_ROOT';
const DEFAULT_PRIVATE_ROOT = fileURLToPath(new URL(
  `../TMP/cv-show-audio/${CV_SHOW_AUDIO_RELEASE.manifests.voice}/`
    + `${CV_SHOW_AUDIO_RELEASE.manifests.directory}/`,
  import.meta.url,
));

export class CvShowPrivateArtifactVerificationError extends Error {
  constructor(code, message, details = {}) {
    super(message);
    this.name = 'CvShowPrivateArtifactVerificationError';
    this.code = code;
    this.details = Object.freeze({ ...details });
  }
}

function fail(code, message, details = {}) {
  throw new CvShowPrivateArtifactVerificationError(code, message, details);
}

function assertExact(condition, code, message, details = {}) {
  if (!condition) fail(code, message, details);
}

function sha256(bytes) {
  return createHash('sha256').update(bytes).digest('hex');
}

function parseJson(bytes, label) {
  try {
    return JSON.parse(bytes.toString('utf8'));
  } catch (error) {
    if (error instanceof SyntaxError) {
      fail('CV_SHOW_PRIVATE_ARTIFACT_JSON_INVALID', `${label} is not valid JSON.`, { label });
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
    'CV_SHOW_PRIVATE_ARTIFACT_PATH_INVALID',
    `${label} must be a normalized relative path inside the private payload.`,
    { label },
  );
  return source;
}

async function requireRoot(root) {
  let status;
  try {
    status = await fs.lstat(root);
  } catch (error) {
    if (error?.code === 'ENOENT' || error?.code === 'ENOTDIR') {
      fail(
        'CV_SHOW_PRIVATE_ARTIFACTS_MISSING',
        `The selected private payload is missing. Pass a root or set ${PRIVATE_ROOT_ENV}.`,
      );
    }
    fail('CV_SHOW_PRIVATE_ARTIFACTS_UNREADABLE', 'The selected private payload cannot be read.', {
      causeCode: error?.code || 'UNKNOWN',
    });
  }
  assertExact(
    status.isDirectory() && !status.isSymbolicLink(),
    'CV_SHOW_PRIVATE_ARTIFACT_ROOT_INVALID',
    'The selected private payload root must be a real directory, not a symlink.',
  );
}

async function inventory(root, relative = '') {
  let entries;
  try {
    entries = await fs.readdir(path.join(root, relative), { withFileTypes: true });
  } catch (error) {
    fail('CV_SHOW_PRIVATE_ARTIFACTS_UNREADABLE', 'The private payload inventory cannot be read.', {
      causeCode: error?.code || 'UNKNOWN',
    });
  }
  let files = [];
  let symlinks = [];
  for (let entry of entries) {
    let entryRelative = relative ? path.posix.join(relative, entry.name) : entry.name;
    if (entry.isSymbolicLink()) {
      symlinks.push(entryRelative);
    } else if (entry.isDirectory()) {
      let nested = await inventory(root, entryRelative);
      files.push(...nested.files);
      symlinks.push(...nested.symlinks);
    } else if (entry.isFile()) {
      files.push(entryRelative);
    } else {
      fail(
        'CV_SHOW_PRIVATE_ARTIFACT_INVENTORY_INVALID',
        'The private payload contains an unsupported filesystem entry.',
        { entry: entryRelative },
      );
    }
  }
  return { files, symlinks };
}

async function readArtifact(root, relative, label) {
  try {
    return await fs.readFile(path.join(root, portablePath(relative, label)));
  } catch (error) {
    if (error instanceof CvShowPrivateArtifactVerificationError) throw error;
    if (error?.code === 'ENOENT' || error?.code === 'ENOTDIR') {
      fail('CV_SHOW_PRIVATE_ARTIFACT_FILE_MISSING', `${label} is missing.`, { label });
    }
    fail('CV_SHOW_PRIVATE_ARTIFACT_FILE_UNREADABLE', `${label} cannot be read.`, {
      label,
      causeCode: error?.code || 'UNKNOWN',
    });
  }
}

function verifyManifestIdentity(audioManifest, alignmentManifest, release) {
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
      && alignmentManifest.model === release.manifests.alignment.model
      && alignmentManifest.sourceAudioInputHash === audioManifest.inputHash
      && audioManifest.story?.contractRevision === alignmentManifest.story?.contractRevision
      && audioManifest.story?.narrationLocale === release.manifests.locale
      && countsMatch(audioManifest.counts)
      && countsMatch(alignmentManifest.counts),
    'CV_SHOW_PRIVATE_ARTIFACT_MANIFEST_IDENTITY_MISMATCH',
    'The private manifests are not the selected 30-clip audio/alignment pair.',
  );
}

function verifyClipRows(audioClip, alignmentClip, expectedIndex) {
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
      && typeof audioClip.speech === 'string'
      && audioClip.speechSha256 === sha256(audioClip.speech)
      && alignmentClip.sourceAudioSha256 === audioClip.sha256
      && alignmentClip.mediaDurationMs === Math.round(audioClip.durationSec * 1_000),
    'CV_SHOW_PRIVATE_ARTIFACT_CLIP_LINKAGE_MISMATCH',
    `The private audio/alignment rows do not link for clip ${expectedIndex}.`,
    { expectedIndex },
  );
}

function verifyAlignedSequence(sequence, audioClip, alignmentClip) {
  assertExact(
    sequence?.contractVersion === 'workspace-aligned-sequence-v3'
      && sequence.hash === alignmentClip.alignedSequenceHash
      && sequence.timelineHash === alignmentClip.timelineHash
      && sequence.media?.hash === `sha256:${audioClip.sha256}`
      && sequence.media?.durationMs === alignmentClip.mediaDurationMs
      && sequence.media?.locale === 'ru'
      && Array.isArray(sequence.events)
      && Array.isArray(sequence.turns),
    'CV_SHOW_PRIVATE_ARTIFACT_ALIGNMENT_CONTRACT_REJECTED',
    `Aligned sequence ${audioClip.id} does not retain the exact master identity and clock.`,
    { entryId: audioClip.id },
  );
}

function verifyRecognition(recognition, audioClip, release) {
  assertExact(
    recognition?.version === 'cv-show-whisper-recognition-v1'
      && recognition.source?.index === audioClip.index
      && recognition.source?.kind === audioClip.kind
      && recognition.source?.id === audioClip.id
      && recognition.source?.speech === audioClip.speech
      && recognition.source?.speechSha256 === audioClip.speechSha256
      && recognition.source?.audioFile === audioClip.file
      && recognition.source?.audioSha256 === audioClip.sha256
      && recognition.source?.audioDurationSec === audioClip.durationSec
      && recognition.source?.sampleRate === audioClip.sampleRate
      && recognition.provider?.model === release.manifests.alignment.model
      && recognition.provider?.locale === release.manifests.locale
      && recognition.recognized?.durationSec === audioClip.durationSec
      && Array.isArray(recognition.recognized?.words),
    'CV_SHOW_PRIVATE_ARTIFACT_RECOGNITION_LINKAGE_MISMATCH',
    `Recognition ${audioClip.id} does not link to the selected master WAV.`,
    { entryId: audioClip.id },
  );
}

function resolvePrivateRoot(args, environment) {
  assertExact(
    args.length <= 1,
    'CV_SHOW_PRIVATE_ARTIFACT_ARGUMENT_INVALID',
    'Pass at most one explicit private artifact root.',
  );
  return path.resolve(args[0] || environment[PRIVATE_ROOT_ENV] || DEFAULT_PRIVATE_ROOT);
}

export async function verifyCvShowPrivateArtifacts({
  root = DEFAULT_PRIVATE_ROOT,
  release = CV_SHOW_AUDIO_RELEASE,
  project = CV_SHOW_PRESENTATION_PROJECT,
} = {}) {
  let resolvedRoot = path.resolve(root);
  assertExact(
    release?.schemaVersion === 'cv-show-audio-release-v1'
      && release.project?.revision === project?.revision
      && release.project?.authoringProjectHash === project?.hash,
    'CV_SHOW_PRIVATE_ARTIFACT_PROJECT_RELEASE_MISMATCH',
    'The selected private release does not bind the exact authoring Project.',
  );
  await requireRoot(resolvedRoot);
  let audioManifestBytes = await readArtifact(
    resolvedRoot,
    release.manifests.audio.path,
    'audio manifest',
  );
  let alignmentManifestBytes = await readArtifact(
    resolvedRoot,
    release.manifests.alignment.path,
    'alignment manifest',
  );
  assertExact(
    audioManifestBytes.byteLength === release.manifests.audio.size
      && sha256(audioManifestBytes) === release.manifests.audio.sha256,
    'CV_SHOW_PRIVATE_ARTIFACT_AUDIO_MANIFEST_HASH_MISMATCH',
    'The private audio manifest bytes do not match the selected release.',
  );
  assertExact(
    alignmentManifestBytes.byteLength === release.manifests.alignment.size
      && sha256(alignmentManifestBytes) === release.manifests.alignment.sha256,
    'CV_SHOW_PRIVATE_ARTIFACT_ALIGNMENT_MANIFEST_HASH_MISMATCH',
    'The private alignment manifest bytes do not match the selected release.',
  );
  let audioManifest = parseJson(audioManifestBytes, 'audio manifest');
  let alignmentManifest = parseJson(alignmentManifestBytes, 'alignment manifest');
  verifyManifestIdentity(audioManifest, alignmentManifest, release);
  assertExact(
    audioManifest.clips?.length === 30 && alignmentManifest.clips?.length === 30,
    'CV_SHOW_PRIVATE_ARTIFACT_CLIP_COUNT_MISMATCH',
    'The private manifests must each contain exactly 30 clips.',
  );

  let alignmentDirectory = path.posix.dirname(release.manifests.alignment.path);
  let expectedFiles = new Set([
    release.manifests.audio.path,
    release.manifests.alignment.path,
  ]);
  for (let index = 0; index < 30; index += 1) {
    let audioClip = audioManifest.clips[index];
    let alignmentClip = alignmentManifest.clips[index];
    verifyClipRows(audioClip, alignmentClip, index + 1);
    let wavFile = portablePath(audioClip.file, `WAV ${index + 1}`);
    let alignedFile = portablePath(alignmentClip.alignedSequenceFile, `aligned sequence ${index + 1}`);
    let recognitionFile = portablePath(alignmentClip.recognitionFile, `recognition ${index + 1}`);
    let alignedRelative = path.posix.join(alignmentDirectory, alignedFile);
    let recognitionRelative = path.posix.join(alignmentDirectory, recognitionFile);
    expectedFiles.add(wavFile);
    expectedFiles.add(alignedRelative);
    expectedFiles.add(recognitionRelative);

    let wavBytes = await readArtifact(resolvedRoot, wavFile, `WAV ${audioClip.id}`);
    assertExact(
      wavBytes.byteLength === audioClip.bytes && sha256(wavBytes) === audioClip.sha256,
      'CV_SHOW_PRIVATE_ARTIFACT_WAV_HASH_MISMATCH',
      `WAV ${audioClip.id} does not match its manifest row.`,
      { entryId: audioClip.id },
    );
    let alignedBytes = await readArtifact(
      resolvedRoot,
      alignedRelative,
      `aligned sequence ${audioClip.id}`,
    );
    assertExact(
      sha256(alignedBytes) === alignmentClip.alignedSequenceSha256,
      'CV_SHOW_PRIVATE_ARTIFACT_ALIGNMENT_HASH_MISMATCH',
      `Aligned sequence ${audioClip.id} does not match its manifest row.`,
      { entryId: audioClip.id },
    );
    verifyAlignedSequence(parseJson(alignedBytes, `aligned sequence ${audioClip.id}`), audioClip, alignmentClip);
    let recognitionBytes = await readArtifact(
      resolvedRoot,
      recognitionRelative,
      `recognition ${audioClip.id}`,
    );
    assertExact(
      sha256(recognitionBytes) === alignmentClip.recognitionSha256,
      'CV_SHOW_PRIVATE_ARTIFACT_RECOGNITION_HASH_MISMATCH',
      `Recognition ${audioClip.id} does not match its manifest row.`,
      { entryId: audioClip.id },
    );
    verifyRecognition(parseJson(recognitionBytes, `recognition ${audioClip.id}`), audioClip, release);
  }

  let observed = await inventory(resolvedRoot);
  observed.files.sort();
  observed.symlinks.sort();
  let unexpectedFiles = observed.files.filter((file) => !expectedFiles.has(file));
  let missingFiles = [...expectedFiles].filter((file) => !observed.files.includes(file));
  let wavFiles = observed.files.filter((file) => file.endsWith('.wav'));
  let alignedFiles = observed.files.filter((file) => (
    file.startsWith(`${alignmentDirectory}/aligned/`) && file.endsWith('.json')
  ));
  assertExact(
    observed.files.length === 92
      && expectedFiles.size === 92
      && wavFiles.length === 30
      && alignedFiles.length === 30
      && observed.symlinks.length === 0
      && unexpectedFiles.length === 0
      && missingFiles.length === 0,
    'CV_SHOW_PRIVATE_ARTIFACT_INVENTORY_MISMATCH',
    'The private payload must contain exactly 92 linked files and no symlinks.',
    {
      files: observed.files.length,
      wavFiles: wavFiles.length,
      alignedSequences: alignedFiles.length,
      symlinks: observed.symlinks,
      unexpectedFiles,
      missingFiles,
    },
  );
  let treeInventory = [];
  for (let file of observed.files) {
    let bytes = await readArtifact(resolvedRoot, file, `artifact ${file}`);
    treeInventory.push({ path: file, sha256: sha256(bytes), size: bytes.byteLength });
  }
  treeInventory.sort((left, right) => (
    left.path < right.path ? -1 : left.path > right.path ? 1 : 0
  ));
  let artifactTreeHash = `cv-show-audio-artifact-tree-v1:${sha256(
    Buffer.from(canonicalize(treeInventory), 'utf8'),
  )}`;
  assertExact(
    artifactTreeHash === release.artifactTreeHash,
    'CV_SHOW_PRIVATE_ARTIFACT_TREE_HASH_MISMATCH',
    'The private artifact tree does not match the selected release identity.',
  );
  return Object.freeze({
    status: 'verified',
    releaseId: release.releaseId,
    artifactTreeHash,
    voice: release.manifests.voice,
    audioRevision: audioManifest.audioRevision,
    alignmentRevision: String(alignmentManifest.alignmentInputHash).replace(/^sha256:/u, '').slice(0, 16),
    storyRevision: audioManifest.story.contractRevision,
    audioManifestSha256: release.manifests.audio.sha256,
    alignmentManifestSha256: release.manifests.alignment.sha256,
    wavFiles: 30,
    alignedSequences: 30,
    runtimeFiles: 92,
    symlinks: 0,
  });
}

let isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  try {
    let root = resolvePrivateRoot(process.argv.slice(2), process.env);
    let result = await verifyCvShowPrivateArtifacts({ root });
    process.stdout.write(`${JSON.stringify(result)}\n`);
  } catch (error) {
    let typed = error instanceof CvShowPrivateArtifactVerificationError
      ? error
      : new CvShowPrivateArtifactVerificationError(
          'CV_SHOW_PRIVATE_ARTIFACT_VERIFICATION_FAILED',
          error?.message || 'CV Show private artifact verification failed.',
          { causeCode: error?.code || 'UNKNOWN' },
        );
    process.stderr.write(`${JSON.stringify({
      status: 'failed',
      code: typed.code,
      message: typed.message,
      details: typed.details,
    })}\n`);
    process.exitCode = 1;
  }
}
