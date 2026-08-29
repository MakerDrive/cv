import { createHash, randomUUID } from 'node:crypto';
import {
  link,
  mkdir,
  open,
  readFile,
  rename,
  unlink,
} from 'node:fs/promises';
import path from 'node:path';

import { canonicalize } from 'symbiote-workspace/schema/canonical-json.js';

const HEAD_SCHEMA_VERSION = 'cv-show-audio-pipeline-head-v1';
const LOCK_SCHEMA_VERSION = 'cv-show-audio-pipeline-lock-v1';
const LOCK_OPERATION_SCHEMA_VERSION = 'cv-show-audio-pipeline-lock-operation-v1';
const SHA256_PATTERN = /^[a-f0-9]{64}$/u;
const OWNER_TOKEN_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._:-]{0,255}$/u;

function fail(code, message, details = {}) {
  throw Object.assign(new Error(message), { code, details: Object.freeze({ ...details }) });
}

function isPlainObject(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  let prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function validateJsonValue(value, field, ancestors = new Set()) {
  if (
    value === null
    || typeof value === 'string'
    || typeof value === 'boolean'
  ) {
    return;
  }
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) {
      fail(
        'CV_SHOW_AUDIO_PIPELINE_STORAGE_INVALID',
        `CV Show audio pipeline ${field} must contain only finite JSON numbers`,
      );
    }
    return;
  }
  if (typeof value !== 'object') {
    fail(
      'CV_SHOW_AUDIO_PIPELINE_STORAGE_INVALID',
      `CV Show audio pipeline ${field} must contain only canonical JSON values`,
    );
  }
  if (ancestors.has(value)) {
    fail(
      'CV_SHOW_AUDIO_PIPELINE_STORAGE_INVALID',
      `CV Show audio pipeline ${field} must not contain circular data`,
    );
  }
  ancestors.add(value);
  if (Array.isArray(value)) {
    let keys = Object.keys(value);
    if (
      keys.length !== value.length
      || keys.some((key, index) => key !== String(index))
      || Object.getOwnPropertySymbols(value).length
    ) {
      fail(
        'CV_SHOW_AUDIO_PIPELINE_STORAGE_INVALID',
        `CV Show audio pipeline ${field} must contain dense canonical JSON arrays`,
      );
    }
    for (let index = 0; index < value.length; index += 1) {
      validateJsonValue(value[index], `${field}[${index}]`, ancestors);
    }
  } else {
    if (!isPlainObject(value) || Object.getOwnPropertySymbols(value).length) {
      fail(
        'CV_SHOW_AUDIO_PIPELINE_STORAGE_INVALID',
        `CV Show audio pipeline ${field} must contain only plain JSON objects`,
      );
    }
    for (let key of Object.keys(value)) {
      let descriptor = Object.getOwnPropertyDescriptor(value, key);
      if (!descriptor?.enumerable || !Object.hasOwn(descriptor, 'value')) {
        fail(
          'CV_SHOW_AUDIO_PIPELINE_STORAGE_INVALID',
          `CV Show audio pipeline ${field} must not contain accessors`,
        );
      }
      validateJsonValue(descriptor.value, `${field}.${key}`, ancestors);
    }
  }
  ancestors.delete(value);
}

function canonicalBytes(value, field) {
  validateJsonValue(value, field);
  return Buffer.from(canonicalize(value), 'utf8');
}

function sha256(value) {
  return createHash('sha256').update(value).digest('hex');
}

function validateHash(value, field = 'SHA-256') {
  if (typeof value !== 'string' || !SHA256_PATTERN.test(value)) {
    fail(
      'CV_SHOW_AUDIO_PIPELINE_STORAGE_INVALID',
      `CV Show audio pipeline ${field} must be a lowercase hexadecimal SHA-256`,
    );
  }
  return value;
}

function validateOwnerToken(value) {
  if (typeof value !== 'string' || !OWNER_TOKEN_PATTERN.test(value)) {
    fail(
      'CV_SHOW_AUDIO_PIPELINE_STORAGE_INVALID',
      'CV Show audio pipeline lock owner token is invalid',
    );
  }
  return value;
}

function freezeDeep(value) {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
  for (let child of Object.values(value)) freezeDeep(child);
  return Object.freeze(value);
}

function exactKeys(value, expected) {
  let actual = Object.keys(value).sort();
  let required = [...expected].sort();
  return actual.length === required.length
    && actual.every((key, index) => key === required[index]);
}

function parseCanonicalJson(bytes, code, label) {
  let text;
  let value;
  try {
    text = new TextDecoder('utf-8', { fatal: true }).decode(bytes);
    value = JSON.parse(text);
    validateJsonValue(value, label);
    if (!Buffer.from(canonicalize(value), 'utf8').equals(bytes)) throw new Error('non-canonical');
  } catch {
    fail(code, `CV Show audio pipeline ${label} bytes are corrupt or non-canonical`);
  }
  return value;
}

async function readRequired(filePath, code, message) {
  try {
    return await readFile(filePath);
  } catch (error) {
    if (error?.code === 'ENOENT') fail(code, message);
    throw error;
  }
}

async function atomicReplace(filePath, bytes) {
  let temporary = `${filePath}.${process.pid}.${randomUUID()}.tmp`;
  let handle;
  try {
    handle = await open(temporary, 'wx', 0o600);
    await handle.writeFile(bytes);
    await handle.sync();
    await handle.close();
    handle = null;
    await rename(temporary, filePath);
    await syncDirectory(path.dirname(filePath));
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

async function putImmutable({
  directory,
  filePath,
  bytes,
  digest,
  corruptCode,
  collisionCode,
  label,
}) {
  await mkdir(directory, { recursive: true, mode: 0o700 });
  let temporary = path.join(directory, `.${process.pid}.${randomUUID()}.tmp`);
  let handle;
  try {
    handle = await open(temporary, 'wx', 0o600);
    await handle.writeFile(bytes);
    await handle.sync();
    await handle.close();
    handle = null;
    try {
      await link(temporary, filePath);
    } catch (error) {
      if (error?.code !== 'EEXIST') throw error;
      let existing = await readFile(filePath);
      if (sha256(existing) !== digest) {
        fail(corruptCode, `CV Show audio pipeline ${label} bytes are corrupt`);
      }
      if (!existing.equals(bytes)) {
        fail(collisionCode, `CV Show audio pipeline ${label} SHA-256 collision was detected`);
      }
    }
  } finally {
    await handle?.close().catch(() => undefined);
    await unlink(temporary).catch(() => undefined);
  }
  await syncDirectory(directory);
  return digest;
}

function copyBytes(value, field) {
  if (!(value instanceof Uint8Array)) {
    fail(
      'CV_SHOW_AUDIO_PIPELINE_STORAGE_INVALID',
      `CV Show audio pipeline ${field} must be a Uint8Array`,
    );
  }
  return Buffer.from(value);
}

export function createCvShowAudioPipelineStorage({ storageRoot } = {}) {
  if (typeof storageRoot !== 'string' || !path.isAbsolute(storageRoot)) {
    fail(
      'CV_SHOW_AUDIO_PIPELINE_STORAGE_INVALID',
      'CV Show audio pipeline storage root must be explicitly supplied and absolute',
    );
  }
  let absoluteRoot = path.resolve(storageRoot);

  let openRun = (contentIdentity) => {
    if (!isPlainObject(contentIdentity)) {
      fail(
        'CV_SHOW_AUDIO_PIPELINE_STORAGE_INVALID',
        'CV Show audio pipeline run content identity must be a canonical JSON object',
      );
    }
    let runHash = sha256(canonicalBytes(contentIdentity, 'run content identity'));
    let runDirectory = path.join(absoluteRoot, 'runs', runHash);
    let objectsDirectory = path.join(runDirectory, 'objects');
    let artifactsDirectory = path.join(runDirectory, 'artifacts');
    let headPath = path.join(runDirectory, 'head.json');
    let lockPath = path.join(runDirectory, 'run.lock');
    let headGuardPath = path.join(runDirectory, '.head.cas.lock');
    let lockOperationGuardPath = path.join(runDirectory, '.lock-operation.guard');

    let putObject = async (value) => {
      if (!isPlainObject(value)) {
        fail(
          'CV_SHOW_AUDIO_PIPELINE_STORAGE_INVALID',
          'CV Show audio pipeline immutable object must be a canonical JSON object',
        );
      }
      let bytes = canonicalBytes(value, 'immutable object');
      let digest = sha256(bytes);
      return putImmutable({
        directory: objectsDirectory,
        filePath: path.join(objectsDirectory, `${digest}.json`),
        bytes,
        digest,
        corruptCode: 'CV_SHOW_AUDIO_PIPELINE_OBJECT_CORRUPT',
        collisionCode: 'CV_SHOW_AUDIO_PIPELINE_OBJECT_COLLISION',
        label: 'immutable object',
      });
    };

    let readObject = async (objectHash) => {
      let digest = validateHash(objectHash, 'object hash');
      let bytes = await readRequired(
        path.join(objectsDirectory, `${digest}.json`),
        'CV_SHOW_AUDIO_PIPELINE_OBJECT_NOT_FOUND',
        'CV Show audio pipeline immutable object was not found',
      );
      if (sha256(bytes) !== digest) {
        fail(
          'CV_SHOW_AUDIO_PIPELINE_OBJECT_CORRUPT',
          'CV Show audio pipeline immutable object SHA-256 does not match its address',
        );
      }
      let value = parseCanonicalJson(
        bytes,
        'CV_SHOW_AUDIO_PIPELINE_OBJECT_CORRUPT',
        'immutable object',
      );
      if (!isPlainObject(value)) {
        fail(
          'CV_SHOW_AUDIO_PIPELINE_OBJECT_CORRUPT',
          'CV Show audio pipeline immutable object root is corrupt',
        );
      }
      return freezeDeep(value);
    };

    let putArtifact = async (value) => {
      let bytes = copyBytes(value, 'artifact');
      let digest = sha256(bytes);
      return putImmutable({
        directory: artifactsDirectory,
        filePath: path.join(artifactsDirectory, `${digest}.bin`),
        bytes,
        digest,
        corruptCode: 'CV_SHOW_AUDIO_PIPELINE_ARTIFACT_CORRUPT',
        collisionCode: 'CV_SHOW_AUDIO_PIPELINE_ARTIFACT_COLLISION',
        label: 'immutable artifact',
      });
    };

    let readArtifact = async (artifactHash) => {
      let digest = validateHash(artifactHash, 'artifact hash');
      let bytes = await readRequired(
        path.join(artifactsDirectory, `${digest}.bin`),
        'CV_SHOW_AUDIO_PIPELINE_ARTIFACT_NOT_FOUND',
        'CV Show audio pipeline immutable artifact was not found',
      );
      if (sha256(bytes) !== digest) {
        fail(
          'CV_SHOW_AUDIO_PIPELINE_ARTIFACT_CORRUPT',
          'CV Show audio pipeline immutable artifact SHA-256 does not match its address',
        );
      }
      return Buffer.from(bytes);
    };

    let readHead = async () => {
      let bytes;
      try {
        bytes = await readFile(headPath);
      } catch (error) {
        if (error?.code === 'ENOENT') return null;
        throw error;
      }
      let value = parseCanonicalJson(
        bytes,
        'CV_SHOW_AUDIO_PIPELINE_HEAD_CORRUPT',
        'head',
      );
      if (
        !isPlainObject(value)
        || !exactKeys(value, ['schemaVersion', 'stateHash', 'headHash'])
        || value.schemaVersion !== HEAD_SCHEMA_VERSION
      ) {
        fail('CV_SHOW_AUDIO_PIPELINE_HEAD_CORRUPT', 'CV Show audio pipeline head shape is corrupt');
      }
      let stateHash;
      let headHash;
      try {
        stateHash = validateHash(value.stateHash, 'head state hash');
        headHash = validateHash(value.headHash, 'head hash');
      } catch {
        fail('CV_SHOW_AUDIO_PIPELINE_HEAD_CORRUPT', 'CV Show audio pipeline head hashes are corrupt');
      }
      let projection = { schemaVersion: HEAD_SCHEMA_VERSION, stateHash };
      if (sha256(canonicalBytes(projection, 'head projection')) !== headHash) {
        fail('CV_SHOW_AUDIO_PIPELINE_HEAD_CORRUPT', 'CV Show audio pipeline head SHA-256 is corrupt');
      }
      let state;
      try {
        state = await readObject(stateHash);
      } catch {
        fail(
          'CV_SHOW_AUDIO_PIPELINE_HEAD_CORRUPT',
          'CV Show audio pipeline head references a missing or corrupt state object',
        );
      }
      return freezeDeep({ headHash, stateHash, state });
    };

    let compareAndSwapHead = async (expectedHeadHash, nextStateHash) => {
      if (expectedHeadHash !== null) validateHash(expectedHeadHash, 'expected head hash');
      let stateHash = validateHash(nextStateHash, 'next state hash');
      await mkdir(runDirectory, { recursive: true, mode: 0o700 });
      let guard;
      try {
        guard = await open(headGuardPath, 'wx', 0o600);
      } catch (error) {
        if (error?.code === 'EEXIST') {
          fail(
            'CV_SHOW_AUDIO_PIPELINE_HEAD_BUSY',
            'Another CV Show audio pipeline head compare-and-swap is active',
          );
        }
        throw error;
      }
      try {
        await guard.writeFile(randomUUID(), 'utf8');
        await guard.sync();
        await guard.close();
        guard = null;
        let current = await readHead();
        let actualHeadHash = current?.headHash ?? null;
        if (actualHeadHash !== expectedHeadHash) {
          fail(
            'CV_SHOW_AUDIO_PIPELINE_HEAD_STALE',
            'CV Show audio pipeline head changed from the exact expected value',
            { actualHeadHash, expectedHeadHash },
          );
        }
        await readObject(stateHash);
        let projection = { schemaVersion: HEAD_SCHEMA_VERSION, stateHash };
        let headHash = sha256(canonicalBytes(projection, 'head projection'));
        await atomicReplace(
          headPath,
          canonicalBytes({ ...projection, headHash }, 'head'),
        );
        return await readHead();
      } finally {
        await guard?.close().catch(() => undefined);
        await unlink(headGuardPath).catch(() => undefined);
      }
    };

    let withLockOperationGuard = async (operation) => {
      await mkdir(runDirectory, { recursive: true, mode: 0o700 });
      let operationToken = randomUUID();
      let handle;
      try {
        handle = await open(lockOperationGuardPath, 'wx', 0o600);
      } catch (error) {
        if (error?.code === 'EEXIST') {
          fail(
            'CV_SHOW_AUDIO_PIPELINE_LOCK_BUSY',
            'Another CV Show audio pipeline lock operation is active or stale',
          );
        }
        throw error;
      }
      try {
        await handle.writeFile(canonicalBytes({
          operationToken,
          schemaVersion: LOCK_OPERATION_SCHEMA_VERSION,
        }, 'lock operation guard'));
        await handle.sync();
        await handle.close();
        handle = null;
        return await operation();
      } finally {
        await handle?.close().catch(() => undefined);
        let bytes = await readRequired(
          lockOperationGuardPath,
          'CV_SHOW_AUDIO_PIPELINE_LOCK_BUSY',
          'CV Show audio pipeline lock operation guard disappeared',
        );
        let value = parseCanonicalJson(
          bytes,
          'CV_SHOW_AUDIO_PIPELINE_LOCK_BUSY',
          'lock operation guard',
        );
        if (
          !isPlainObject(value)
          || !exactKeys(value, ['schemaVersion', 'operationToken'])
          || value.schemaVersion !== LOCK_OPERATION_SCHEMA_VERSION
          || value.operationToken !== operationToken
        ) {
          fail(
            'CV_SHOW_AUDIO_PIPELINE_LOCK_BUSY',
            'CV Show audio pipeline lock operation guard ownership changed',
          );
        }
        await unlink(lockOperationGuardPath);
      }
    };

    let acquireLock = async (ownerToken) => {
      let token = validateOwnerToken(ownerToken);
      return withLockOperationGuard(async () => {
        let handle;
        try {
          handle = await open(lockPath, 'wx', 0o600);
        } catch (error) {
          if (error?.code === 'EEXIST') {
            fail(
              'CV_SHOW_AUDIO_PIPELINE_LOCKED',
              'Another owner holds the CV Show audio pipeline run lock',
            );
          }
          throw error;
        }
        try {
          await handle.writeFile(canonicalBytes({
            ownerToken: token,
            schemaVersion: LOCK_SCHEMA_VERSION,
          }, 'lock'));
          await handle.sync();
          await handle.close();
          handle = null;
        } catch (error) {
          await handle?.close().catch(() => undefined);
          await unlink(lockPath).catch(() => undefined);
          throw error;
        }
        return freezeDeep({ ownerToken: token });
      });
    };

    let releaseLock = async (ownerToken) => {
      let token = validateOwnerToken(ownerToken);
      return withLockOperationGuard(async () => {
        let bytes;
        try {
          bytes = await readFile(lockPath);
        } catch (error) {
          if (error?.code === 'ENOENT') {
            fail(
              'CV_SHOW_AUDIO_PIPELINE_LOCK_NOT_OWNER',
              'CV Show audio pipeline lock is absent for the supplied owner token',
            );
          }
          throw error;
        }
        let value = parseCanonicalJson(
          bytes,
          'CV_SHOW_AUDIO_PIPELINE_LOCK_CORRUPT',
          'lock',
        );
        if (
          !isPlainObject(value)
          || !exactKeys(value, ['schemaVersion', 'ownerToken'])
          || value.schemaVersion !== LOCK_SCHEMA_VERSION
        ) {
          fail(
            'CV_SHOW_AUDIO_PIPELINE_LOCK_CORRUPT',
            'CV Show audio pipeline lock shape is corrupt',
          );
        }
        if (value.ownerToken !== token) {
          fail(
            'CV_SHOW_AUDIO_PIPELINE_LOCK_NOT_OWNER',
            'CV Show audio pipeline lock belongs to a different exact owner token',
          );
        }
        await unlink(lockPath);
      });
    };

    return Object.freeze({
      runHash,
      runDirectory,
      putObject,
      readObject,
      putArtifact,
      readArtifact,
      readHead,
      compareAndSwapHead,
      acquireLock,
      releaseLock,
    });
  };

  return Object.freeze({ openRun });
}
