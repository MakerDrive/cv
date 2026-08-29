import { createHash, randomUUID } from 'node:crypto';
import {
  mkdir,
  open,
  readFile,
  rename,
  unlink,
} from 'node:fs/promises';
import path from 'node:path';

import { canonicalize } from 'symbiote-workspace/schema/canonical-json.js';

const DRAFT_SCHEMA_VERSION = 'cv-show-authoring-draft-v1';
const HEAD_SCHEMA_VERSION = 'cv-show-authoring-head-v1';
const SESSION_ID_PATTERN = /^[A-Za-z0-9_-]{16,128}$/u;
const DRAFT_HASH_PATTERN = /^sha256:[a-f0-9]{64}$/u;

function fail(code, message, details = {}) {
  throw Object.assign(new Error(message), { code, details });
}

function validateSessionId(value) {
  if (!SESSION_ID_PATTERN.test(String(value || ''))) {
    fail('CV_SHOW_AUTHORING_SESSION_INVALID', 'CV Show authoring sessionId is invalid');
  }
  return value;
}

function validateDraftHash(value) {
  if (!DRAFT_HASH_PATTERN.test(String(value || ''))) {
    fail('CV_SHOW_AUTHORING_DRAFT_INVALID', 'CV Show authoring draft hash is invalid');
  }
  return value;
}

function draftDigest(value) {
  return `sha256:${createHash('sha256').update(canonicalize(value)).digest('hex')}`;
}

function withoutDraftHash(value) {
  let copy = structuredClone(value);
  delete copy.draftHash;
  return copy;
}

function validateDraft(value, expectedDraftHash = null) {
  if (
    !value
    || typeof value !== 'object'
    || Array.isArray(value)
    || value.schemaVersion !== DRAFT_SCHEMA_VERSION
    || value.projectId !== 'cv-show'
    || !value.sourceBase
    || !value.snapshot
    || !value.snapshotIdentity
    || !value.base
    || !value.collectionIdentity
    || typeof value.mediaRegistryHash !== 'string'
  ) {
    fail('CV_SHOW_AUTHORING_DRAFT_INVALID', 'CV Show authoring draft envelope is invalid');
  }
  validateDraftHash(value.draftHash);
  let computed = draftDigest(withoutDraftHash(value));
  if (computed !== value.draftHash || expectedDraftHash && expectedDraftHash !== value.draftHash) {
    fail('CV_SHOW_AUTHORING_DRAFT_INVALID', 'CV Show authoring draft integrity check failed');
  }
  return value;
}

async function atomicWrite(filePath, content) {
  let tempPath = `${filePath}.${process.pid}.${randomUUID()}.tmp`;
  let handle;
  try {
    handle = await open(tempPath, 'wx', 0o600);
    await handle.writeFile(content, 'utf8');
    await handle.sync();
    await handle.close();
    handle = null;
    await rename(tempPath, filePath);
  } catch (error) {
    await handle?.close().catch(() => undefined);
    await unlink(tempPath).catch(() => undefined);
    throw error;
  }
}

export async function acquireCvShowAuthoringLock({ storageRoot, owner }) {
  if (!path.isAbsolute(storageRoot) || !['host', 'materializer'].includes(owner)) {
    fail('CV_SHOW_AUTHORING_STORAGE_INVALID', 'CV Show authoring lock input is invalid');
  }
  await mkdir(storageRoot, { recursive: true, mode: 0o700 });
  let lockPath = path.join(storageRoot, 'host.lock');
  let lockId = randomUUID();
  let handle;
  try {
    handle = await open(lockPath, 'wx', 0o600);
  } catch (error) {
    if (error?.code === 'EEXIST') {
      fail(
        'CV_SHOW_AUTHORING_HOST_LOCKED',
        'Another CV Show authoring process owns the local lock',
      );
    }
    throw error;
  }
  try {
    await handle.writeFile(`${canonicalize({
      schemaVersion: 'cv-show-authoring-host-lock-v1',
      lockId,
      owner,
      pid: process.pid,
    })}\n`, 'utf8');
    await handle.sync();
    await handle.close();
  } catch (error) {
    await handle.close().catch(() => undefined);
    await unlink(lockPath).catch(() => undefined);
    throw error;
  }
  let release = async () => {
    try {
      let current = JSON.parse(await readFile(lockPath, 'utf8'));
      if (current.lockId === lockId) await unlink(lockPath);
    } catch (error) {
      if (error?.code !== 'ENOENT') throw error;
    }
  };
  return Object.freeze({ release });
}

function objectFileName(draftHash) {
  return `${validateDraftHash(draftHash).slice('sha256:'.length)}.json`;
}

export function createCvShowAuthoringDraftEnvelope({
  sourceBase,
  previousDraftHash,
  snapshot,
  snapshotIdentity,
  base,
  collectionIdentity,
  mediaRegistryHash,
}) {
  if (previousDraftHash !== null) validateDraftHash(previousDraftHash);
  let envelope = {
    schemaVersion: DRAFT_SCHEMA_VERSION,
    projectId: 'cv-show',
    sourceBase: structuredClone(sourceBase),
    previousDraftHash,
    snapshot: structuredClone(snapshot),
    snapshotIdentity: structuredClone(snapshotIdentity),
    base: structuredClone(base),
    collectionIdentity: structuredClone(collectionIdentity),
    mediaRegistryHash,
  };
  return Object.freeze({
    ...envelope,
    draftHash: draftDigest(envelope),
  });
}

export function createCvShowAuthoringStorage({ storageRoot }) {
  if (!path.isAbsolute(storageRoot)) {
    fail('CV_SHOW_AUTHORING_STORAGE_INVALID', 'CV Show authoring storage root must be absolute');
  }

  let sessionDirectory = (sessionId) => path.join(
    storageRoot,
    'sessions',
    validateSessionId(sessionId),
  );

  let readDraft = async (sessionId, draftHash) => {
    let filePath = path.join(
      sessionDirectory(sessionId),
      'objects',
      objectFileName(draftHash),
    );
    let value;
    try {
      value = JSON.parse(await readFile(filePath, 'utf8'));
    } catch (error) {
      if (error?.code === 'ENOENT') {
        fail('CV_SHOW_AUTHORING_DRAFT_NOT_FOUND', 'CV Show authoring draft was not found');
      }
      throw error;
    }
    return validateDraft(value, draftHash);
  };

  let readHead = async (sessionId) => {
    let filePath = path.join(sessionDirectory(sessionId), 'head.json');
    let value;
    try {
      value = JSON.parse(await readFile(filePath, 'utf8'));
    } catch (error) {
      if (error?.code === 'ENOENT') return null;
      fail('CV_SHOW_AUTHORING_HEAD_INVALID', 'CV Show authoring head could not be read');
    }
    if (
      !value
      || typeof value !== 'object'
      || Array.isArray(value)
      || value.schemaVersion !== HEAD_SCHEMA_VERSION
      || Object.keys(value).length !== 2
    ) {
      fail('CV_SHOW_AUTHORING_HEAD_INVALID', 'CV Show authoring head is invalid');
    }
    validateDraftHash(value.draftHash);
    return readDraft(sessionId, value.draftHash);
  };

  let commit = async (sessionId, draft) => {
    validateSessionId(sessionId);
    validateDraft(draft);
    let sessionDir = sessionDirectory(sessionId);
    let objectsDir = path.join(sessionDir, 'objects');
    await mkdir(objectsDir, { recursive: true, mode: 0o700 });
    let objectPath = path.join(objectsDir, objectFileName(draft.draftHash));
    try {
      let existing = JSON.parse(await readFile(objectPath, 'utf8'));
      validateDraft(existing, draft.draftHash);
      if (canonicalize(existing) !== canonicalize(draft)) {
        fail('CV_SHOW_AUTHORING_DRAFT_COLLISION', 'CV Show authoring draft hash collision');
      }
    } catch (error) {
      if (error?.code !== 'ENOENT') throw error;
      await atomicWrite(objectPath, `${canonicalize(draft)}\n`);
    }
    await atomicWrite(path.join(sessionDir, 'head.json'), `${canonicalize({
      schemaVersion: HEAD_SCHEMA_VERSION,
      draftHash: draft.draftHash,
    })}\n`);
    return draft;
  };

  return Object.freeze({ readDraft, readHead, commit });
}
