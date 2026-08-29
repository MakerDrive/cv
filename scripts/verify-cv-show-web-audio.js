import { execFile as execFileCallback, spawn } from 'node:child_process';
import { createHash } from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { promisify } from 'node:util';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { canonicalize } from 'symbiote-workspace/schema/canonical-json.js';

const execFile = promisify(execFileCallback);
const MANIFEST_SCHEMA = 'cv-show-web-audio-release-v1';
const SELECTOR_SCHEMA = 'cv-show-web-audio-selector-v1';
const REPOSITORY_ROOT = fileURLToPath(new URL('../', import.meta.url));
const DEFAULT_SELECTOR_PATH = path.join(
  REPOSITORY_ROOT,
  'src/static-pages/data/cvShowWebAudioRelease.js',
);
const DEFAULT_PUBLIC_COPY_ROOT = path.join(
  REPOSITORY_ROOT,
  'src/static-pages/copy-cv-show-audio',
);
const LOCKED_FFMPEG_SHA256 = '48cc76fa936aec61e6459da4366ad8d99da34e4a7f98be66ff5a9130d8ab366f';
const FFMPEG_ARGUMENT_TEMPLATE = Object.freeze([
  '-hide_banner',
  '-loglevel', 'error',
  '-nostdin',
  '-i', 'INPUT',
  '-map', '0:a:0',
  '-vn',
  '-sn',
  '-dn',
  '-map_metadata', '-1',
  '-map_chapters', '-1',
  '-ac', '1',
  '-ar', '48000',
  '-c:a', 'libopus',
  '-application', 'voip',
  '-b:a', '48k',
  '-vbr', 'on',
  '-compression_level', '10',
  '-frame_duration', '20',
  '-packet_loss', '0',
  '-fec', '0',
  '-fflags', '+bitexact',
  '-flags:a', '+bitexact',
  '-serial_offset', '0',
  '-f', 'ogg',
  '-y', 'OUTPUT',
]);

function sha256(bytes) {
  return createHash('sha256').update(bytes).digest('hex');
}

export const CV_SHOW_WEB_AUDIO_COMMAND_SHA256 = sha256(
  Buffer.from(`ffmpeg ${FFMPEG_ARGUMENT_TEMPLATE.join(' ')}`, 'utf8'),
);

export const CV_SHOW_WEB_AUDIO_PROFILE = Object.freeze({
  id: 'ogg-opus-mono-48khz-48kbps-voip-v1',
  extension: '.opus',
  mimeType: 'audio/ogg',
  codecType: 'audio/ogg; codecs=opus',
  container: 'ogg',
  codec: 'opus',
  channels: 1,
  sampleRate: 48_000,
  targetBitrate: 48_000,
  application: 'voip',
  frameDurationMs: 20,
  packetLoss: 0,
  fec: 0,
  durationToleranceMs: 10,
  commandSha256: CV_SHOW_WEB_AUDIO_COMMAND_SHA256,
  toolchainIdentity: `ffmpeg-7.1.1-libopus-1.5.2:sha256:${LOCKED_FFMPEG_SHA256}`,
});

export const CV_SHOW_WEB_AUDIO_FFMPEG_ARGUMENT_TEMPLATE = FFMPEG_ARGUMENT_TEMPLATE;

const MANIFEST_KEYS = Object.freeze([
  'schemaVersion',
  'releaseId',
  'revision',
  'source',
  'story',
  'locale',
  'voiceId',
  'alignedSequenceVersion',
  'profile',
  'clips',
]);
const SOURCE_KEYS = Object.freeze([
  'masterReleaseId',
  'masterArtifactTreeHash',
  'projectRevision',
  'authoringProjectHash',
  'voiceIdentityHash',
  'audioInputHash',
  'audioManifestSha256',
  'alignmentInputHash',
  'alignmentManifestSha256',
]);
const STORY_KEYS = Object.freeze([
  'version',
  'contractRevision',
  'narrationLocale',
  'shortCount',
  'detailCount',
]);
const PROFILE_KEYS = Object.freeze(Object.keys(CV_SHOW_WEB_AUDIO_PROFILE));
const CLIP_KEYS = Object.freeze([
  'index',
  'kind',
  'order',
  'id',
  'speech',
  'speechSha256',
  'masterWavSha256',
  'masterDurationMs',
  'deliveryFile',
  'deliverySha256',
  'deliveryBytes',
  'alignedSequenceFile',
  'alignedSequenceSha256',
  'alignedSequenceHash',
  'timelineHash',
]);
const SELECTOR_KEYS = Object.freeze([
  'schemaVersion',
  'releaseId',
  'sourceMasterReleaseId',
  'voiceId',
  'locale',
  'revision',
  'manifest',
]);
const SELECTOR_MANIFEST_KEYS = Object.freeze(['path', 'sha256', 'bytes']);

export class CvShowWebAudioVerificationError extends Error {
  constructor(code, message, details = {}) {
    super(message);
    this.name = 'CvShowWebAudioVerificationError';
    this.code = code;
    this.details = Object.freeze({ ...details });
  }
}

function fail(code, message, details = {}) {
  throw new CvShowWebAudioVerificationError(code, message, details);
}

function assertExact(condition, code, message, details = {}) {
  if (!condition) fail(code, message, details);
}

function isObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function exactKeys(value, expected, label) {
  let actual = isObject(value) ? Object.keys(value).sort() : [];
  let locked = [...expected].sort();
  assertExact(
    isObject(value) && JSON.stringify(actual) === JSON.stringify(locked),
    'CV_SHOW_WEB_AUDIO_SCHEMA_INVALID',
    `${label} must contain only the locked public fields.`,
    { label, actual, expected: locked },
  );
}

function parseJson(bytes, label) {
  try {
    return JSON.parse(bytes.toString('utf8'));
  } catch (error) {
    if (error instanceof SyntaxError) {
      fail('CV_SHOW_WEB_AUDIO_JSON_INVALID', `${label} is not valid JSON.`, { label });
    }
    throw error;
  }
}

function canonicalJsonBytes(value) {
  return Buffer.from(`${canonicalize(value)}\n`, 'utf8');
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
    'CV_SHOW_WEB_AUDIO_PATH_INVALID',
    `${label} must be a normalized relative public path.`,
    { label },
  );
  return source;
}

async function requireDirectory(root) {
  let status;
  try {
    status = await fs.lstat(root);
  } catch (error) {
    if (error?.code === 'ENOENT' || error?.code === 'ENOTDIR') {
      fail('CV_SHOW_WEB_AUDIO_RELEASE_MISSING', 'The public web-audio release is missing.');
    }
    fail('CV_SHOW_WEB_AUDIO_RELEASE_UNREADABLE', 'The public web-audio release cannot be read.', {
      causeCode: error?.code || 'UNKNOWN',
    });
  }
  assertExact(
    status.isDirectory() && !status.isSymbolicLink(),
    'CV_SHOW_WEB_AUDIO_RELEASE_ROOT_INVALID',
    'The public web-audio release root must be a real directory.',
  );
}

async function inventory(root, relative = '') {
  let entries;
  try {
    entries = await fs.readdir(path.join(root, relative), { withFileTypes: true });
  } catch (error) {
    fail('CV_SHOW_WEB_AUDIO_RELEASE_UNREADABLE', 'The public release inventory cannot be read.', {
      causeCode: error?.code || 'UNKNOWN',
    });
  }
  let files = [];
  let directories = [];
  let symlinks = [];
  for (let entry of entries) {
    let entryRelative = relative ? path.posix.join(relative, entry.name) : entry.name;
    if (entry.isSymbolicLink()) {
      symlinks.push(entryRelative);
    } else if (entry.isDirectory()) {
      directories.push(entryRelative);
      let nested = await inventory(root, entryRelative);
      files.push(...nested.files);
      directories.push(...nested.directories);
      symlinks.push(...nested.symlinks);
    } else if (entry.isFile()) {
      files.push(entryRelative);
    } else {
      fail(
        'CV_SHOW_WEB_AUDIO_INVENTORY_MISMATCH',
        'The public release contains an unsupported filesystem entry.',
        { entry: entryRelative },
      );
    }
  }
  return { files, directories, symlinks };
}

async function readFile(root, relative, code, label) {
  try {
    return await fs.readFile(path.join(root, portablePath(relative, label)));
  } catch (error) {
    if (error instanceof CvShowWebAudioVerificationError) throw error;
    if (error?.code === 'ENOENT' || error?.code === 'ENOTDIR') {
      fail(code, `${label} is missing.`, { label });
    }
    fail('CV_SHOW_WEB_AUDIO_RELEASE_UNREADABLE', `${label} cannot be read.`, {
      label,
      causeCode: error?.code || 'UNKNOWN',
    });
  }
}

function assertHash(value, label) {
  assertExact(
    typeof value === 'string' && /^[a-f0-9]{64}$/u.test(value),
    'CV_SHOW_WEB_AUDIO_SCHEMA_INVALID',
    `${label} must be a lowercase SHA-256 hex digest.`,
    { label },
  );
}

export function createCvShowWebAudioRevision(manifestOrProjection) {
  let { releaseId: _releaseId, revision: _revision, ...projection } = manifestOrProjection;
  return sha256(Buffer.from(canonicalize(projection), 'utf8'));
}

function verifySelector(selector, manifestBytes) {
  exactKeys(selector, SELECTOR_KEYS, 'selector');
  exactKeys(selector.manifest, SELECTOR_MANIFEST_KEYS, 'selector manifest');
  assertExact(
    selector.schemaVersion === SELECTOR_SCHEMA
      && Number.isSafeInteger(selector.manifest.bytes)
      && selector.manifest.bytes === manifestBytes.byteLength
      && selector.manifest.sha256 === sha256(manifestBytes),
    'CV_SHOW_WEB_AUDIO_SELECTOR_MANIFEST_MISMATCH',
    'The selector does not bind the exact raw manifest bytes.',
  );
}

function verifyManifestContract(manifest, manifestBytes, expectedSource) {
  exactKeys(manifest, MANIFEST_KEYS, 'manifest');
  exactKeys(manifest.source, SOURCE_KEYS, 'manifest source');
  exactKeys(manifest.story, STORY_KEYS, 'manifest story');
  exactKeys(manifest.profile, PROFILE_KEYS, 'manifest profile');
  assertExact(
    manifest.schemaVersion === MANIFEST_SCHEMA,
    'CV_SHOW_WEB_AUDIO_SCHEMA_INVALID',
    `The public manifest schema must be ${MANIFEST_SCHEMA}.`,
  );
  assertExact(
    canonicalJsonBytes(manifest).equals(manifestBytes),
    'CV_SHOW_WEB_AUDIO_MANIFEST_NOT_CANONICAL',
    'The public manifest must use canonical JSON with one trailing LF.',
  );
  let expectedRevision = createCvShowWebAudioRevision(manifest);
  assertExact(
    manifest.revision === expectedRevision
      && manifest.releaseId === `${MANIFEST_SCHEMA}:${expectedRevision}`,
    'CV_SHOW_WEB_AUDIO_RELEASE_IDENTITY_MISMATCH',
    'The public release identity is not the canonical projection SHA-256.',
  );
  assertExact(
    canonicalize(manifest.profile) === canonicalize(CV_SHOW_WEB_AUDIO_PROFILE),
    'CV_SHOW_WEB_AUDIO_PROFILE_MISMATCH',
    'The public release does not use the locked Opus delivery profile.',
  );
  assertExact(
    manifest.locale === 'ru'
      && manifest.voiceId === 'barzana-2'
      && manifest.alignedSequenceVersion === 'workspace-aligned-sequence-v3'
      && manifest.story.narrationLocale === manifest.locale
      && manifest.story.shortCount === 16
      && manifest.story.detailCount === 14,
    'CV_SHOW_WEB_AUDIO_RELEASE_IDENTITY_MISMATCH',
    'The public release does not describe the locked story, locale, voice, and alignment contract.',
  );
  for (let [key, value] of Object.entries(manifest.source)) {
    assertExact(
      key === 'projectRevision' ? Number.isSafeInteger(value) && value > 0 : typeof value === 'string' && value,
      'CV_SHOW_WEB_AUDIO_SCHEMA_INVALID',
      `manifest source ${key} has an invalid value.`,
      { key },
    );
  }
  assertHash(manifest.source.audioManifestSha256, 'audioManifestSha256');
  assertHash(manifest.source.alignmentManifestSha256, 'alignmentManifestSha256');
  assertExact(
    !expectedSource || canonicalize(manifest.source) === canonicalize(expectedSource),
    'CV_SHOW_WEB_AUDIO_SOURCE_MISMATCH',
    'The public release source identity does not match the selected private master.',
  );
  assertExact(
    Array.isArray(manifest.clips) && manifest.clips.length === 30,
    'CV_SHOW_WEB_AUDIO_CLIP_COUNT_MISMATCH',
    'The public release must contain exactly 30 ordered clips.',
  );
}

function verifyClipContract(clip, expectedIndex) {
  exactKeys(clip, CLIP_KEYS, `clip ${expectedIndex}`);
  let kind = expectedIndex <= 16 ? 'short' : 'detail';
  let order = expectedIndex <= 16 ? expectedIndex : expectedIndex - 16;
  let prefix = `${String(expectedIndex).padStart(2, '0')}-${kind}-`;
  assertExact(
    clip.index === expectedIndex
      && clip.kind === kind
      && clip.order === order
      && typeof clip.id === 'string'
      && /^[a-z0-9]+(?:-[a-z0-9]+)*$/u.test(clip.id)
      && typeof clip.speech === 'string'
      && clip.speech.length > 0
      && clip.speechSha256 === sha256(clip.speech)
      && Number.isSafeInteger(clip.masterDurationMs)
      && clip.masterDurationMs > 0
      && Number.isSafeInteger(clip.deliveryBytes)
      && clip.deliveryBytes > 0,
    'CV_SHOW_WEB_AUDIO_CLIP_IDENTITY_MISMATCH',
    `Clip ${expectedIndex} is not the locked ordered story row.`,
    { expectedIndex },
  );
  for (let [label, value] of [
    ['masterWavSha256', clip.masterWavSha256],
    ['deliverySha256', clip.deliverySha256],
    ['alignedSequenceSha256', clip.alignedSequenceSha256],
  ]) assertHash(value, `${label} for clip ${expectedIndex}`);
  assertExact(
    clip.masterWavSha256 !== clip.deliverySha256,
    'CV_SHOW_WEB_AUDIO_MEDIA_IDENTITY_COLLISION',
    `Clip ${expectedIndex} must keep master and compressed delivery identities separate.`,
  );
  let orderedName = `${prefix}${clip.id}`;
  assertExact(
    clip.deliveryFile === `clips/${orderedName}-${clip.deliverySha256.slice(0, 12)}.opus`
      && clip.alignedSequenceFile === `aligned/${orderedName}.json`,
    'CV_SHOW_WEB_AUDIO_CLIP_PATH_MISMATCH',
    `Clip ${expectedIndex} paths do not use the locked ordered/hash-suffixed names.`,
    { expectedIndex },
  );
  return orderedName;
}

function verifyAlignedSequence(sequence, clip) {
  assertExact(
    isObject(sequence)
      && sequence.contractVersion === 'workspace-aligned-sequence-v3'
      && sequence.hash === clip.alignedSequenceHash
      && sequence.timelineHash === clip.timelineHash
      && sequence.media?.hash === `sha256:${clip.masterWavSha256}`
      && sequence.media?.durationMs === clip.masterDurationMs
      && sequence.media?.locale === 'ru',
    'CV_SHOW_WEB_AUDIO_ALIGNED_IDENTITY_MISMATCH',
    `Aligned sequence ${clip.index} does not retain the master media clock and hash.`,
    { index: clip.index },
  );
}

function verifyProbe(probe, clip, profile) {
  let rawDriftMs = Math.abs(probe.rawDurationMs - clip.masterDurationMs);
  let decodedDriftMs = Math.abs(probe.decodedDurationMs - clip.masterDurationMs);
  assertExact(
    probe.codec === profile.codec
      && probe.container === profile.container
      && probe.sampleRate === profile.sampleRate
      && probe.channels === profile.channels,
    'CV_SHOW_WEB_AUDIO_CODEC_MISMATCH',
    `Compressed clip ${clip.index} does not match the locked codec/container profile.`,
    { index: clip.index },
  );
  assertExact(
    Number.isFinite(probe.startTimeMs)
      && Math.abs(probe.startTimeMs) <= profile.durationToleranceMs
      && Number.isFinite(probe.rawDurationMs)
      && Number.isFinite(probe.decodedDurationMs)
      && Number.isSafeInteger(probe.decodedSamples)
      && rawDriftMs <= profile.durationToleranceMs
      && decodedDriftMs <= profile.durationToleranceMs,
    'CV_SHOW_WEB_AUDIO_DURATION_DRIFT',
    `Compressed clip ${clip.index} exceeds the locked duration tolerance.`,
    { index: clip.index, startTimeMs: probe.startTimeMs, rawDriftMs, decodedDriftMs },
  );
}

async function countDecodedSamples(file, ffmpegPath) {
  return new Promise((resolve, reject) => {
    let child = spawn(ffmpegPath, [
      '-hide_banner', '-loglevel', 'error', '-nostdin',
      '-i', file,
      '-map', '0:a:0', '-vn', '-sn', '-dn',
      '-ac', '1', '-ar', '48000',
      '-c:a', 'pcm_s16le', '-f', 's16le', 'pipe:1',
    ], { stdio: ['ignore', 'pipe', 'pipe'] });
    let bytes = 0;
    let stderr = '';
    child.stdout.on('data', (chunk) => { bytes += chunk.byteLength; });
    child.stderr.setEncoding('utf8');
    child.stderr.on('data', (chunk) => { stderr += chunk; });
    child.once('error', reject);
    child.once('close', (code) => {
      if (code !== 0) {
        let error = new Error(stderr.trim() || `ffmpeg exited with ${code}`);
        error.code = 'CV_SHOW_WEB_AUDIO_DECODE_FAILED';
        reject(error);
        return;
      }
      if (bytes % 2 !== 0) {
        let error = new Error('Decoded mono PCM byte count is not sample-aligned.');
        error.code = 'CV_SHOW_WEB_AUDIO_DECODE_FAILED';
        reject(error);
        return;
      }
      resolve(bytes / 2);
    });
  });
}

export async function probeCvShowOpus(file, {
  ffmpegPath = 'ffmpeg',
  ffprobePath = 'ffprobe',
} = {}) {
  let stdout;
  try {
    ({ stdout } = await execFile(ffprobePath, [
      '-v', 'error',
      '-show_entries', 'format=format_name,duration,start_time:stream=codec_name,codec_type,sample_rate,channels,duration,start_time',
      '-of', 'json',
      file,
    ], { encoding: 'utf8', maxBuffer: 1024 * 1024 }));
  } catch (error) {
    fail('CV_SHOW_WEB_AUDIO_PROBE_FAILED', 'ffprobe could not inspect a compressed clip.', {
      causeCode: error?.code || 'UNKNOWN',
    });
  }
  let payload = parseJson(Buffer.from(stdout, 'utf8'), 'ffprobe output');
  let stream = payload.streams?.find((candidate) => candidate.codec_type === 'audio');
  let decodedSamples;
  try {
    decodedSamples = await countDecodedSamples(file, ffmpegPath);
  } catch (error) {
    fail('CV_SHOW_WEB_AUDIO_DECODE_FAILED', 'ffmpeg could not decode a compressed clip.', {
      causeCode: error?.code || 'UNKNOWN',
    });
  }
  return Object.freeze({
    codec: stream?.codec_name,
    container: payload.format?.format_name,
    sampleRate: Number(stream?.sample_rate),
    channels: stream?.channels,
    startTimeMs: Number(stream?.start_time ?? payload.format?.start_time ?? 0) * 1_000,
    rawDurationMs: Number(payload.format?.duration ?? stream?.duration) * 1_000,
    decodedDurationMs: decodedSamples / 48,
    decodedSamples,
  });
}

export async function verifyCvShowWebAudio({
  root,
  selector,
  expectedSource,
  verifyMedia = true,
  probeAudio,
  ffmpegPath = 'ffmpeg',
  ffprobePath = 'ffprobe',
} = {}) {
  assertExact(
    typeof root === 'string' && root,
    'CV_SHOW_WEB_AUDIO_ARGUMENT_INVALID',
    'A public web-audio release root is required.',
  );
  let resolvedRoot = path.resolve(root);
  await requireDirectory(resolvedRoot);
  let manifestBytes = await readFile(
    resolvedRoot,
    'manifest.json',
    'CV_SHOW_WEB_AUDIO_MANIFEST_MISSING',
    'public manifest',
  );
  if (selector) verifySelector(selector, manifestBytes);
  let manifest = parseJson(manifestBytes, 'public manifest');
  verifyManifestContract(manifest, manifestBytes, expectedSource);
  if (selector) {
    assertExact(
      selector.releaseId === manifest.releaseId
        && selector.sourceMasterReleaseId === manifest.source.masterReleaseId
        && selector.voiceId === manifest.voiceId
        && selector.locale === manifest.locale
        && selector.revision === manifest.revision
        && selector.manifest.path === `${manifest.voiceId}/${manifest.revision}/manifest.json`,
      'CV_SHOW_WEB_AUDIO_SELECTOR_IDENTITY_MISMATCH',
      'The selector does not identify the verified public release.',
    );
  }

  let expectedFiles = new Set(['manifest.json']);
  for (let [offset, clip] of manifest.clips.entries()) {
    verifyClipContract(clip, offset + 1);
    assertExact(
      !expectedFiles.has(clip.deliveryFile) && !expectedFiles.has(clip.alignedSequenceFile),
      'CV_SHOW_WEB_AUDIO_CLIP_PATH_MISMATCH',
      `Clip ${clip.index} reuses a public release path.`,
      { index: clip.index },
    );
    expectedFiles.add(clip.deliveryFile);
    expectedFiles.add(clip.alignedSequenceFile);
  }

  let observed = await inventory(resolvedRoot);
  observed.files.sort();
  observed.directories.sort();
  observed.symlinks.sort();
  assertExact(
    observed.symlinks.length === 0,
    'CV_SHOW_WEB_AUDIO_SYMLINK_FORBIDDEN',
    'The public release must not contain symlinks.',
    { symlinks: observed.symlinks },
  );
  let unexpectedFiles = observed.files.filter((file) => !expectedFiles.has(file));
  let missingFiles = [...expectedFiles].filter((file) => !observed.files.includes(file));
  assertExact(
    observed.files.length === 61
      && JSON.stringify(observed.directories) === JSON.stringify(['aligned', 'clips'])
      && expectedFiles.size === 61
      && unexpectedFiles.length === 0
      && missingFiles.length === 0,
    'CV_SHOW_WEB_AUDIO_INVENTORY_MISMATCH',
    'The public release must contain exactly one manifest, 30 Opus clips, and 30 aligned sequences.',
    {
      files: observed.files.length,
      directories: observed.directories,
      unexpectedFiles,
      missingFiles,
    },
  );

  let selectedProbe = probeAudio || ((file) => probeCvShowOpus(file, { ffmpegPath, ffprobePath }));
  let totalDeliveryBytes = 0;
  let treeInventory = [{
    path: 'manifest.json',
    sha256: sha256(manifestBytes),
    size: manifestBytes.byteLength,
  }];
  for (let clip of manifest.clips) {
    let deliveryBytes = await readFile(
      resolvedRoot,
      clip.deliveryFile,
      'CV_SHOW_WEB_AUDIO_CLIP_MISSING',
      `compressed clip ${clip.index}`,
    );
    assertExact(
      deliveryBytes.byteLength === clip.deliveryBytes
        && sha256(deliveryBytes) === clip.deliverySha256,
      'CV_SHOW_WEB_AUDIO_DELIVERY_HASH_MISMATCH',
      `Compressed clip ${clip.index} does not match its manifest identity.`,
      { index: clip.index },
    );
    assertExact(
      deliveryBytes.subarray(0, 4).toString('ascii') === 'OggS'
        && deliveryBytes.includes(Buffer.from('OpusHead', 'ascii')),
      'CV_SHOW_WEB_AUDIO_CODEC_MISMATCH',
      `Compressed clip ${clip.index} is not an Ogg Opus payload.`,
      { index: clip.index },
    );
    let alignedBytes = await readFile(
      resolvedRoot,
      clip.alignedSequenceFile,
      'CV_SHOW_WEB_AUDIO_ALIGNED_MISSING',
      `aligned sequence ${clip.index}`,
    );
    assertExact(
      sha256(alignedBytes) === clip.alignedSequenceSha256,
      'CV_SHOW_WEB_AUDIO_ALIGNED_HASH_MISMATCH',
      `Aligned sequence ${clip.index} does not match its raw-byte identity.`,
      { index: clip.index },
    );
    verifyAlignedSequence(parseJson(alignedBytes, `aligned sequence ${clip.index}`), clip);
    if (verifyMedia) {
      verifyProbe(
        await selectedProbe(path.join(resolvedRoot, clip.deliveryFile), clip, manifest.profile),
        clip,
        manifest.profile,
      );
    }
    totalDeliveryBytes += deliveryBytes.byteLength;
    treeInventory.push(
      { path: clip.deliveryFile, sha256: clip.deliverySha256, size: deliveryBytes.byteLength },
      { path: clip.alignedSequenceFile, sha256: clip.alignedSequenceSha256, size: alignedBytes.byteLength },
    );
  }
  treeInventory.sort((left, right) => (
    left.path < right.path ? -1 : left.path > right.path ? 1 : 0
  ));
  return Object.freeze({
    status: 'verified',
    releaseId: manifest.releaseId,
    revision: manifest.revision,
    manifestSha256: sha256(manifestBytes),
    manifestBytes: manifestBytes.byteLength,
    treeInventorySha256: sha256(Buffer.from(canonicalize(treeInventory), 'utf8')),
    totalDeliveryBytes,
    files: observed.files.length,
    clips: 30,
    alignedSequences: 30,
    symlinks: 0,
    mediaProbed: verifyMedia,
  });
}

function cliError(error) {
  return error instanceof CvShowWebAudioVerificationError
    ? error
    : new CvShowWebAudioVerificationError(
        'CV_SHOW_WEB_AUDIO_VERIFICATION_FAILED',
        error?.message || 'CV Show web-audio verification failed.',
        { causeCode: error?.code || 'UNKNOWN' },
      );
}

let isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  try {
    let args = process.argv.slice(2);
    assertExact(
      args.length <= 2,
      'CV_SHOW_WEB_AUDIO_ARGUMENT_INVALID',
      'Pass an optional release root and optional generated selector module path.',
    );
    let selector;
    let root = args[0] ? path.resolve(args[0]) : null;
    let selectorModule = args[1]
      ? path.resolve(args[1])
      : (!root ? DEFAULT_SELECTOR_PATH : null);
    if (selectorModule) {
      ({ CV_SHOW_WEB_AUDIO_RELEASE: selector } = await import(pathToFileURL(selectorModule).href));
    }
    if (!root) {
      let manifestRelative = portablePath(selector?.manifest?.path, 'selector manifest path');
      root = path.dirname(path.join(DEFAULT_PUBLIC_COPY_ROOT, manifestRelative));
    }
    let result = await verifyCvShowWebAudio({ root, selector });
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
