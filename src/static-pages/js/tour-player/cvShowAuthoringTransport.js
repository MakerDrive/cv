import {
  createCvShowAuthoringSnapshotIdentity,
  normalizeCvShowAuthoringSnapshot,
} from './cvShowAuthoringAuthority.js';

const SESSION_ENDPOINT = '/__cv-authoring/api/session';
const TRANSACTION_ENDPOINT = '/__cv-authoring/api/transact';
const SESSION_RESPONSE_VERSION = 'cv-show-authoring-host-session-v1';
const TRANSACTION_REQUEST_VERSION = 'cv-show-authoring-host-transaction-v1';
const TRANSACTION_RESPONSE_VERSION = 'cv-show-authoring-host-transaction-response-v1';
const HANDSHAKE_RECEIPT_VERSION = 'cv-show-authoring-handshake-receipt-v1';
const LOAD_RECEIPT_VERSION = 'cv-show-authoring-load-receipt-v1';
const COMMIT_RECEIPT_VERSION = 'cv-show-authoring-commit-receipt-v1';
const VIEW_IDENTITY_VERSION = 'cv-show-authoring-view-identity-v1';
const DRAFT_HASH_PATTERN = /^sha256:[a-f0-9]{64}$/u;

function fail(message, details = {}) {
  throw Object.assign(new Error(message), {
    name: 'CvShowAuthoringTransportError',
    code: 'CV_SHOW_AUTHORING_TRANSPORT_RESPONSE_INVALID',
    details,
  });
}

function exactObject(value, fields) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  let keys = Reflect.ownKeys(value);
  return [Object.prototype, null].includes(Object.getPrototypeOf(value))
    && keys.length === fields.length
    && fields.every((field) => keys.includes(field));
}

function exactBase(value) {
  return exactObject(value, ['revision', 'authoringProjectHash', 'snapshotIdentity'])
    && Number.isInteger(value.revision)
    && typeof value.authoringProjectHash === 'string'
    && value.authoringProjectHash.length > 0
    && typeof value.snapshotIdentity === 'string'
    && value.snapshotIdentity.length > 0;
}

function exactIdentity(value) {
  return exactObject(value, ['schemaVersion', 'snapshot', 'media'])
    && value.schemaVersion === VIEW_IDENTITY_VERSION
    && typeof value.snapshot === 'string'
    && value.snapshot.length > 0
    && typeof value.media === 'string'
    && value.media.length > 0;
}

function sameBase(left, right) {
  return left.revision === right.revision
    && left.authoringProjectHash === right.authoringProjectHash
    && left.snapshotIdentity === right.snapshotIdentity;
}

function sameIdentity(left, right) {
  return left.schemaVersion === right.schemaVersion
    && left.snapshot === right.snapshot
    && left.media === right.media;
}

function isAuthorizedCapability(value, sessionId) {
  return exactObject(value, ['local', 'authorized', 'sessionId'])
    && Object.isFrozen(value)
    && value.local === true
    && value.authorized === true
    && value.sessionId === sessionId;
}

async function readJsonResponse(response) {
  let contentType = response?.headers?.get?.('content-type') || '';
  if (!contentType.toLowerCase().startsWith('application/json')) {
    fail('CV Show authoring host returned a non-JSON response');
  }
  let value;
  try {
    value = await response.json();
  } catch {
    fail('CV Show authoring host returned malformed JSON');
  }
  if (!response.ok) {
    let error = value?.error;
    let code = typeof error?.code === 'string'
      && /^(?:CV_SHOW|PRESENTATION_AUTHORING)_[A-Z0-9_]+$/u.test(error.code)
      ? error.code
      : 'CV_SHOW_AUTHORING_HOST_REJECTED';
    throw Object.assign(new Error('CV Show authoring host rejected the request'), {
      name: 'CvShowAuthoringTransportError',
      code,
      details: error?.details && typeof error.details === 'object'
        ? structuredClone(error.details)
        : {},
    });
  }
  return value;
}

function validateSessionResponse(value) {
  if (!exactObject(value, [
    'schemaVersion',
    'status',
    'sessionId',
    'sourceBase',
    'base',
    'identity',
    'snapshot',
    'dirty',
    'materialized',
  ])
    || value.schemaVersion !== SESSION_RESPONSE_VERSION
    || value.status !== 'authorized'
    || typeof value.sessionId !== 'string'
    || !value.sessionId
    || !exactObject(value.sourceBase, [
      'revision',
      'authoringProjectHash',
      'sourceSha256',
    ])
    || !Number.isInteger(value.sourceBase.revision)
    || typeof value.sourceBase.authoringProjectHash !== 'string'
    || value.sourceBase.authoringProjectHash.length === 0
    || !DRAFT_HASH_PATTERN.test(value.sourceBase.sourceSha256)
    || !exactBase(value.base)
    || !exactIdentity(value.identity)
    || typeof value.dirty !== 'boolean'
    || typeof value.materialized !== 'boolean') {
    fail('CV Show authoring host session response is invalid');
  }
  let snapshot = normalizeCvShowAuthoringSnapshot(value.snapshot);
  let identity = createCvShowAuthoringSnapshotIdentity(snapshot);
  let base = {
    revision: snapshot.project.revision,
    authoringProjectHash: snapshot.project.hash,
    snapshotIdentity: identity.snapshot,
  };
  if (!sameIdentity(value.identity, identity) || !sameBase(value.base, base)) {
    fail('CV Show authoring host session snapshot is divergent');
  }
  return Object.freeze({
    ...structuredClone(value),
    snapshot,
    identity,
    base: Object.freeze(base),
  });
}

function validateCommitResponse(value, request, sessionId) {
  if (!exactObject(value, [
    'schemaVersion',
    'status',
    'sessionId',
    'previousDraftHash',
    'draftHash',
    'candidateSnapshotIdentity',
    'snapshotIdentity',
    'snapshot',
    'base',
    'dirty',
    'materialized',
  ])
    || value.schemaVersion !== TRANSACTION_RESPONSE_VERSION
    || value.status !== 'committed'
    || value.sessionId !== sessionId
    || value.previousDraftHash !== null
      && !DRAFT_HASH_PATTERN.test(value.previousDraftHash)
    || !DRAFT_HASH_PATTERN.test(value.draftHash)
    || value.candidateSnapshotIdentity !== request.candidateSnapshotIdentity
    || !exactIdentity(value.snapshotIdentity)
    || !exactBase(value.base)
    || value.dirty !== true
    || value.materialized !== false) {
    fail('CV Show authoring host commit response is invalid');
  }
  let snapshot = normalizeCvShowAuthoringSnapshot(value.snapshot);
  let identity = createCvShowAuthoringSnapshotIdentity(snapshot);
  let base = {
    revision: snapshot.project.revision,
    authoringProjectHash: snapshot.project.hash,
    snapshotIdentity: identity.snapshot,
  };
  if (
    !sameIdentity(value.snapshotIdentity, identity)
    || !sameBase(value.base, base)
    || identity.snapshot !== request.candidateSnapshotIdentity
  ) {
    fail('CV Show authoring host committed a divergent snapshot');
  }
  return Object.freeze({
    schemaVersion: COMMIT_RECEIPT_VERSION,
    status: 'committed',
    commitId: value.draftHash,
    candidateSnapshotIdentity: value.candidateSnapshotIdentity,
    snapshotIdentity: identity.snapshot,
    snapshot,
    dirty: true,
    materialized: false,
  });
}

export function createCvShowAuthoringTransport({ fetchImpl = globalThis.fetch } = {}) {
  if (typeof fetchImpl !== 'function') {
    throw new TypeError('CV Show authoring transport requires fetch');
  }
  let session = null;

  /** @param {{ signal?: AbortSignal }} [options] */
  let authorize = async ({ signal } = {}) => {
    if (session) return session;
    let response = await fetchImpl(SESSION_ENDPOINT, {
      method: 'GET',
      credentials: 'same-origin',
      headers: { accept: 'application/json' },
      signal,
    });
    session = validateSessionResponse(await readJsonResponse(response));
    return session;
  };

  /**
   * @param {Object | null} request
   * @param {{ signal?: AbortSignal }} [options]
   */
  let handshake = async (request = null, { signal } = {}) => {
    let current = await authorize({ signal });
    if (request !== null) {
      if (
        !exactObject(request, ['capability', 'seedBase'])
        || !isAuthorizedCapability(request.capability, current.sessionId)
        || !exactObject(request.seedBase, ['revision', 'authoringProjectHash'])
        || request.seedBase.revision !== current.sourceBase.revision
        || request.seedBase.authoringProjectHash !== current.sourceBase.authoringProjectHash
      ) {
        fail('CV Show authoring handshake request is invalid');
      }
    }
    return Object.freeze({
      schemaVersion: HANDSHAKE_RECEIPT_VERSION,
      status: 'authorized',
      sessionId: current.sessionId,
    });
  };

  /**
   * @param {Object} request
   * @param {{ signal?: AbortSignal }} [options]
   */
  let load = async (request, { signal } = {}) => {
    let current = await authorize({ signal });
    if (!exactObject(request, ['sessionId']) || request.sessionId !== current.sessionId) {
      fail('CV Show authoring load session is invalid');
    }
    return Object.freeze({
      schemaVersion: LOAD_RECEIPT_VERSION,
      status: 'loaded',
      snapshot: current.snapshot,
      dirty: current.dirty,
      materialized: current.materialized,
    });
  };

  /**
   * @param {Object} request
   * @param {{ signal?: AbortSignal }} [options]
   */
  let transact = async (request, { signal } = {}) => {
    let current = await authorize({ signal });
    if (!exactObject(request, [
      'sessionId',
      'base',
      'candidateSnapshotIdentity',
      'snapshot',
    ])
      || request.sessionId !== current.sessionId
      || !exactBase(request.base)
      || typeof request.candidateSnapshotIdentity !== 'string'
      || !request.candidateSnapshotIdentity) {
      fail('CV Show authoring transaction request is invalid');
    }
    let body = {
      schemaVersion: TRANSACTION_REQUEST_VERSION,
      sessionId: request.sessionId,
      base: request.base,
      candidateSnapshotIdentity: request.candidateSnapshotIdentity,
      snapshot: request.snapshot,
    };
    let response = await fetchImpl(TRANSACTION_ENDPOINT, {
      method: 'POST',
      credentials: 'same-origin',
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
      },
      body: JSON.stringify(body),
      signal,
    });
    return validateCommitResponse(await readJsonResponse(response), request, current.sessionId);
  };

  return Object.freeze({ handshake, load, transact });
}

export default createCvShowAuthoringTransport;
