import { createPresentationAuthoringToolPack } from 'symbiote-workspace/browser';
import { CV_SHOW_PRESENTATION_PROJECT } from '../../data/cvShowPresentationProject.js';
import {
  createCvShowRuntimeSnapshotIdentity,
  createCvShowRuntimeState,
  normalizeCvShowRuntimeSnapshot,
} from './cvShowRuntimeAuthority.js';

/**
 * @typedef {{
 *   capability?: Readonly<{ local: true, authorized: true, sessionId: string }>,
 *   transport?: Record<string, any>,
 *   regeneration?: Record<string, any>,
 *   signal?: AbortSignal,
 * }} CvShowEnableLocalOptions
 */

const AUTHORITY_LIFECYCLE_VERSION = 'cv-show-authoring-lifecycle-v1';
const AUTHORITY_TRANSACTION_RECEIPT_VERSION = 'cv-show-authoring-transaction-receipt-v1';
const HANDSHAKE_RECEIPT_VERSION = 'cv-show-authoring-handshake-receipt-v1';
const LOAD_RECEIPT_VERSION = 'cv-show-authoring-load-receipt-v1';
const COMMIT_RECEIPT_VERSION = 'cv-show-authoring-commit-receipt-v1';
const LOCAL_READY_STATES = new Set(['local-ready']);
const LOCAL_CAPABILITY_FIELDS = Object.freeze(['local', 'authorized', 'sessionId']);
const COMMIT_RECEIPT_FIELDS = Object.freeze([
  'schemaVersion',
  'status',
  'commitId',
  'candidateSnapshotIdentity',
  'snapshotIdentity',
  'snapshot',
  'dirty',
  'materialized',
]);
const MAX_DIAGNOSTIC_TOKEN_LENGTH = 96;
const SAFE_DIAGNOSTIC_TOKENS = new Set(['HOST_COMMIT_RESPONSE_LOST', 'Error', 'DOMException']);
const SAFE_NAMESPACED_ERROR_CODE_PATTERN =
  /^(?:CV_SHOW|PRESENTATION_AUTHORING|ERR)_[A-Z0-9]+(?:_[A-Z0-9]+)*$/;
const SAFE_ERROR_NAME_PATTERN = /^[A-Z][A-Za-z0-9]{0,63}Error$/;
const MAX_ERROR_PROTOTYPE_DEPTH = 6;
const DOM_EXCEPTION_NAME_GETTER = typeof DOMException === 'function'
  ? Object.getOwnPropertyDescriptor(DOMException.prototype, 'name')?.get
  : null;

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

function hasExactEnumerableDataFields(value, fields) {
  if (
    !isObject(value)
    || ![Object.prototype, null].includes(Object.getPrototypeOf(value))
  ) return false;
  const keys = Reflect.ownKeys(value);
  if (
    keys.length !== fields.length
    || keys.some((key) => typeof key !== 'string' || !fields.includes(key))
  ) return false;
  const descriptors = Object.getOwnPropertyDescriptors(value);
  return fields.every((field) => {
    const descriptor = descriptors[field];
    return descriptor?.enumerable === true
      && Object.prototype.hasOwnProperty.call(descriptor, 'value');
  });
}

function cloneExactPlainData(value, fields) {
  if (!hasExactEnumerableDataFields(value, fields)) return null;
  const normalized = clone(value);
  return hasExactEnumerableDataFields(normalized, fields) ? normalized : null;
}

function sameBase(left, right) {
  return left?.revision === right?.revision
    && left?.authoringProjectHash === right?.authoringProjectHash;
}

function snapshotBase(currentView) {
  return Object.freeze({
    ...currentView.base,
    snapshotIdentity: currentView.identity.snapshot,
  });
}

function validateLocalCapability(value) {
  let normalized = null;
  try {
    if (Object.isFrozen(value)) {
      normalized = cloneExactPlainData(value, LOCAL_CAPABILITY_FIELDS);
    }
  } catch {
    normalized = null;
  }
  if (
    !normalized
    || normalized.local !== true
    || normalized.authorized !== true
    || typeof normalized.sessionId !== 'string'
    || !normalized.sessionId.trim()
  ) {
    fail('CV_SHOW_AUTHORING_UNAUTHORIZED', 'exact local authoring capability is required');
  }
  return immutable(normalized);
}

function abortReason(signal) {
  if (!signal?.aborted) return null;
  return signal.reason || new DOMException('Aborted', 'AbortError');
}

function throwIfAborted(signal) {
  const reason = abortReason(signal);
  if (reason) throw reason;
}

function combineSignal(signal, lifecycleSignal) {
  return signal
    ? AbortSignal.any([signal, lifecycleSignal])
    : lifecycleSignal;
}

export class CvShowAuthoringAuthorityError extends Error {
  constructor(code, message, details = {}) {
    super(message);
    this.name = 'CvShowAuthoringAuthorityError';
    this.code = code;
    this.details = immutable(details);
  }
}

function fail(code, message, details = {}) {
  throw new CvShowAuthoringAuthorityError(code, message, details);
}

function safeDiagnosticToken(value) {
  if (
    typeof value === 'string'
    && value.length <= MAX_DIAGNOSTIC_TOKEN_LENGTH
    && (
      SAFE_DIAGNOSTIC_TOKENS.has(value)
      || SAFE_NAMESPACED_ERROR_CODE_PATTERN.test(value)
      || SAFE_ERROR_NAME_PATTERN.test(value)
    )
  ) return value;
  return null;
}

function dataProperty(value, field) {
  let owner = value;
  for (let depth = 0; depth < MAX_ERROR_PROTOTYPE_DEPTH; depth += 1) {
    if (!owner || !['object', 'function'].includes(typeof owner)) return undefined;
    try {
      const descriptor = Object.getOwnPropertyDescriptor(owner, field);
      if (descriptor) {
        return Object.prototype.hasOwnProperty.call(descriptor, 'value')
          ? descriptor.value
          : undefined;
      }
      owner = Object.getPrototypeOf(owner);
    } catch {
      return undefined;
    }
  }
  return undefined;
}

function intrinsicAbortToken(error) {
  if (typeof DOM_EXCEPTION_NAME_GETTER !== 'function') return null;
  try {
    return Reflect.apply(DOM_EXCEPTION_NAME_GETTER, error, []) === 'AbortError'
      ? 'AbortError'
      : null;
  } catch {
    return null;
  }
}

function errorCauseCode(error) {
  return safeDiagnosticToken(dataProperty(error, 'code'))
    || intrinsicAbortToken(error)
    || safeDiagnosticToken(dataProperty(error, 'name'))
    || 'Error';
}

/** Node-safe canonical validator shared by the browser replica and its local host transport. */
export function normalizeCvShowAuthoringSnapshot(value) {
  return normalizeCvShowRuntimeSnapshot(value);
}

/** Returns `{ schemaVersion, snapshot, media }` identities for one validated immutable snapshot. */
export function createCvShowAuthoringSnapshotIdentity(value) {
  return createCvShowRuntimeSnapshotIdentity(value);
}

function validateTransport(value) {
  if (
    !isObject(value)
    || typeof value.handshake !== 'function'
    || typeof value.load !== 'function'
    || typeof value.transact !== 'function'
  ) {
    fail(
      'CV_SHOW_AUTHORING_TRANSPORT_INVALID',
      'local transport must expose async handshake(), load(), and transact()',
    );
  }
  return value;
}

function validateHandshakeReceipt(value, expectedSessionId) {
  if (
    !isObject(value)
    || value.schemaVersion !== HANDSHAKE_RECEIPT_VERSION
    || value.status !== 'authorized'
    || value.sessionId !== expectedSessionId
  ) {
    fail('CV_SHOW_AUTHORING_UNAUTHORIZED', 'local authoring handshake was not authorized');
  }
  return value;
}

function validateLoadReceipt(value) {
  if (
    !isObject(value)
    || value.schemaVersion !== LOAD_RECEIPT_VERSION
    || value.status !== 'loaded'
    || !isObject(value.snapshot)
    || typeof value.dirty !== 'boolean'
    || typeof value.materialized !== 'boolean'
  ) {
    fail('CV_SHOW_AUTHORING_LOAD_INVALID', 'local authoring load receipt is invalid');
  }
  return value;
}

function validateCommitReceipt(value) {
  let normalized = null;
  try {
    normalized = cloneExactPlainData(value, COMMIT_RECEIPT_FIELDS);
  } catch {
    normalized = null;
  }
  if (
    !normalized
    || normalized.schemaVersion !== COMMIT_RECEIPT_VERSION
    || normalized.status !== 'committed'
    || typeof normalized.commitId !== 'string'
    || !normalized.commitId.trim()
    || typeof normalized.candidateSnapshotIdentity !== 'string'
    || !normalized.candidateSnapshotIdentity.trim()
    || typeof normalized.snapshotIdentity !== 'string'
    || !normalized.snapshotIdentity.trim()
    || !isObject(normalized.snapshot)
    || typeof normalized.dirty !== 'boolean'
    || typeof normalized.materialized !== 'boolean'
  ) {
    fail('CV_SHOW_AUTHORING_COMMIT_INVALID', 'local authoring commit receipt is invalid');
  }
  return normalized;
}

function createUnavailableRegeneration() {
  const unavailable = () => fail(
    'CV_SHOW_REGENERATION_UNAVAILABLE',
    'CV Show media regeneration is unavailable in this local authoring session',
  );
  return Object.freeze({ request: unavailable, inspect: unavailable });
}

/**
 * Creates the sole CV-owned Project authority contract.
 *
 * The optional local transport is deliberately host-owned and Node-safe:
 * - `handshake({ capability, seedBase }, { signal })` returns
 *   `{ schemaVersion: 'cv-show-authoring-handshake-receipt-v1', status: 'authorized', sessionId }`.
 * - `load({ sessionId }, { signal })` returns
 *   `{ schemaVersion: 'cv-show-authoring-load-receipt-v1', status: 'loaded', snapshot,
 *      dirty, materialized }`.
 * - `transact({ sessionId, base, candidateSnapshotIdentity, snapshot }, { signal })` performs the
 *   final host CAS. `base` is `{ revision, authoringProjectHash, snapshotIdentity }`. It returns
 *   `{ schemaVersion: 'cv-show-authoring-commit-receipt-v1', status: 'committed', commitId,
 *      candidateSnapshotIdentity, snapshotIdentity, snapshot, dirty, materialized }`.
 *
 * The transport owns durable storage and CAS. This module owns Project/media validation and the
 * one in-page immutable replica. No path, storage token, or generic patch enters the browser API.
 */
export function createCvShowAuthoringAuthority({
  seedProject = CV_SHOW_PRESENTATION_PROJECT,
  createToolPack = createPresentationAuthoringToolPack,
} = {}) {
  let initial = createCvShowRuntimeState({ project: seedProject });
  let snapshot = initial.snapshot;
  let view = initial.view;
  let state = 'seed-readonly';
  let dirty = false;
  let materialized = false;
  let warning = null;
  let transport = null;
  let sessionId = '';
  let providerTools = null;
  let mutationSession = null;
  let activeSignal = null;
  let insideProviderTransaction = false;
  /** @type {Record<string, any> | null} */
  let lastTransactionReceipt = null;
  let queue = Promise.resolve();
  const lifecycleController = new AbortController();
  const subscribers = new Set();

  const lifecycle = () => immutable({
    schemaVersion: AUTHORITY_LIFECYCLE_VERSION,
    state,
    dirty,
    materialized,
    base: view.base,
    identity: view.identity,
    warning,
  });

  const assertUsable = () => {
    if (state === 'disposed') {
      fail('CV_SHOW_AUTHORING_DISPOSED', 'CV Show authoring authority is disposed');
    }
    if (state === 'blocked') {
      fail('CV_SHOW_AUTHORING_BLOCKED', 'CV Show authoring replica is blocked', { warning });
    }
  };

  const runExclusive = (operation) => {
    const pending = queue.then(operation, operation);
    queue = pending.catch(() => undefined);
    return pending;
  };

  const createReplicaWarning = (error, phase) => immutable({
    code: 'CV_SHOW_AUTHORING_REPLICA_BLOCKED',
    phase,
    causeCode: errorCauseCode(error),
    message: 'CV Show local authoring replica failed',
  });

  const blockCommitOutcomeUnknown = (currentSnapshotBase, causeCode) => {
    const replicaStatus = state === 'disposed' ? 'disposed' : 'blocked';
    const replicaWarning = immutable({
      code: 'CV_SHOW_AUTHORING_COMMIT_OUTCOME_UNKNOWN',
      phase: 'host-cas',
      causeCode: safeDiagnosticToken(causeCode) || 'Error',
      message: 'Host commit outcome is unknown because no verified replica was established',
    });
    warning = replicaWarning;
    if (state !== 'disposed') {
      state = 'blocked';
      mutationSession = null;
    }
    lastTransactionReceipt = immutable({
      schemaVersion: AUTHORITY_TRANSACTION_RECEIPT_VERSION,
      status: 'commit-outcome-unknown',
      base: currentSnapshotBase,
      host: { status: 'unknown' },
      replica: {
        status: replicaStatus,
        base: view.base,
        identity: view.identity,
        warning: replicaWarning,
      },
    });
    return lastTransactionReceipt;
  };

  const notify = (nextView) => {
    let failure = null;
    for (let listener of [...subscribers]) {
      try {
        listener(nextView);
      } catch (error) {
        failure ||= error;
      }
    }
    return failure;
  };

  const authority = {
    read() {
      assertUsable();
      if (insideProviderTransaction) throwIfAborted(activeSignal);
      return snapshot;
    },
    get view() {
      return view;
    },
    get lifecycle() {
      return lifecycle();
    },
    get mutationSession() {
      return mutationSession;
    },
    getView() {
      return view;
    },
    subscribe(listener) {
      if (typeof listener !== 'function') {
        fail('CV_SHOW_AUTHORING_SUBSCRIBER_INVALID', 'CV Show subscriber must be a function');
      }
      assertUsable();
      subscribers.add(listener);
      return () => subscribers.delete(listener);
    },
    async enableLocal(
      { capability, transport: localTransport, regeneration, signal }
        = /** @type {CvShowEnableLocalOptions} */ ({}),
    ) {
      const acceptedCapability = validateLocalCapability(capability);
      assertUsable();
      if (state !== 'seed-readonly') {
        fail('CV_SHOW_AUTHORING_STATE_INVALID', `cannot enable local authoring from ${state}`);
      }
      transport = validateTransport(localTransport);
      const enableSignal = combineSignal(signal, lifecycleController.signal);
      throwIfAborted(enableSignal);
      state = 'enabling-local';
      try {
        const seedBase = view.base;
        const seedSnapshotIdentity = view.identity.snapshot;
        const handshake = validateHandshakeReceipt(await transport.handshake({
          capability: acceptedCapability,
          seedBase,
        }, { signal: enableSignal }), acceptedCapability.sessionId);
        throwIfAborted(enableSignal);
        const loaded = validateLoadReceipt(await transport.load({
          sessionId: handshake.sessionId,
        }, { signal: enableSignal }));
        throwIfAborted(enableSignal);
        const loadedState = createCvShowRuntimeState(loaded.snapshot);
        const loadedSnapshot = loadedState.snapshot;
        const loadedView = loadedState.view;
        sessionId = handshake.sessionId;
        snapshot = loadedSnapshot;
        view = loadedView;
        dirty = loaded.dirty;
        materialized = loaded.materialized;
        state = materialized ? 'materialized' : 'local-ready';
        const regenerationAdapter = regeneration || createUnavailableRegeneration();
        providerTools = createToolPack({ authority, regeneration: regenerationAdapter });
        const localMutationSession = Object.freeze({
          tools: providerTools.tools,
          invoke(name, input = {}, options = {}) {
            const invocationSignal = combineSignal(options.signal, lifecycleController.signal);
            return runExclusive(async () => {
              assertUsable();
              if (!LOCAL_READY_STATES.has(state)) {
                fail('CV_SHOW_AUTHORING_STATE_INVALID', `cannot mutate from ${state}`);
              }
              throwIfAborted(invocationSignal);
              const beforeRegistry = view.mediaRegistry;
              activeSignal = invocationSignal;
              insideProviderTransaction = true;
              lastTransactionReceipt = null;
              try {
                const result = await providerTools.invoke(name, input, { signal: invocationSignal });
                if (lastTransactionReceipt?.status === 'commit-outcome-unknown') {
                  return immutable({ authorityReceipt: lastTransactionReceipt });
                }
                const currentRegistry = view.mediaRegistry;
                const affectedEntryIds = Object.keys(currentRegistry.entries).filter((entryId) => (
                  beforeRegistry.entries[entryId]?.playable
                  && !currentRegistry.entries[entryId]?.playable
                ));
                const restoredEntryIds = Object.keys(currentRegistry.entries).filter((entryId) => (
                  !beforeRegistry.entries[entryId]?.playable
                  && currentRegistry.entries[entryId]?.playable
                ));
                return immutable({
                  ...result,
                  authorityReceipt: lastTransactionReceipt,
                  cvMediaDisposition: {
                    status: affectedEntryIds.length
                      ? 'invalidated'
                      : restoredEntryIds.length ? 'restored' : 'preserved',
                    affectedEntryIds,
                    restoredEntryIds,
                    registry: currentRegistry,
                  },
                });
              } finally {
                insideProviderTransaction = false;
                activeSignal = null;
              }
            });
          },
        });
        mutationSession = materialized ? null : localMutationSession;
        if (seedSnapshotIdentity !== view.identity.snapshot) {
          const notificationFailure = notify(view);
          if (notificationFailure) {
            warning = createReplicaWarning(notificationFailure, 'enable-local');
            state = 'blocked';
            mutationSession = null;
            fail(
              'CV_SHOW_AUTHORING_REPLICA_BLOCKED',
              'CV Show local authoring replica could not publish the loaded host snapshot',
              { warning },
            );
          }
        }
        return lifecycle();
      } catch (error) {
        if (state === 'enabling-local') {
          if (error?.code === 'CV_SHOW_AUTHORING_UNAUTHORIZED') {
            state = 'seed-readonly';
            transport = null;
          } else {
            state = 'blocked';
            warning = createReplicaWarning(error, 'enable-local');
          }
        }
        throw error;
      }
    },
    async transact({ base }, update) {
      assertUsable();
      if (!insideProviderTransaction || !LOCAL_READY_STATES.has(state)) {
        fail('CV_SHOW_AUTHORING_UNAUTHORIZED', 'mutations require the enabled local session');
      }
      throwIfAborted(activeSignal);
      if (!sameBase(base, view.base)) {
        fail('CV_SHOW_AUTHORING_STALE', 'CV Show authoring transaction base is stale', {
          expected: view.base,
          received: base,
        });
      }
      if (typeof update !== 'function') {
        fail('CV_SHOW_AUTHORING_TRANSACTION_INVALID', 'CV Show transaction update is required');
      }
      const candidateValue = update(snapshot);
      const candidateState = createCvShowRuntimeState(candidateValue);
      const candidate = candidateState.snapshot;
      const candidateView = candidateState.view;
      const candidateBase = candidateView.base;
      const sameProject = sameBase(candidateBase, view.base);
      const projectAdvanced = candidateBase.revision === view.base.revision + 1
        && candidateBase.authoringProjectHash !== view.base.authoringProjectHash;
      if (candidateView.identity.snapshot === view.identity.snapshot) {
        fail('CV_SHOW_AUTHORING_TRANSACTION_NOOP', 'CV Show transaction cannot commit an exact no-op');
      }
      if (!sameProject && !projectAdvanced) {
        fail(
          'CV_SHOW_AUTHORING_TRANSACTION_INVALID',
          'CV Show Project transaction must advance exactly one revision',
        );
      }
      const currentSnapshotBase = snapshotBase(view);
      state = 'persisting';
      let hostReceipt;
      try {
        hostReceipt = validateCommitReceipt(await transport.transact({
          sessionId,
          base: currentSnapshotBase,
          candidateSnapshotIdentity: candidateView.identity.snapshot,
          snapshot: candidate,
        }, { signal: activeSignal }));
      } catch (error) {
        return blockCommitOutcomeUnknown(currentSnapshotBase, errorCauseCode(error));
      }

      let committedSnapshot;
      let committedView;
      try {
        throwIfAborted(activeSignal);
        const committedState = createCvShowRuntimeState(hostReceipt.snapshot);
        committedSnapshot = committedState.snapshot;
        committedView = committedState.view;
      } catch (error) {
        return blockCommitOutcomeUnknown(currentSnapshotBase, errorCauseCode(error));
      }

      const exactCandidate = hostReceipt.candidateSnapshotIdentity === candidateView.identity.snapshot
        && hostReceipt.snapshotIdentity === committedView.identity.snapshot
        && committedView.identity.snapshot === candidateView.identity.snapshot;
      if (!exactCandidate) {
        return blockCommitOutcomeUnknown(
          currentSnapshotBase,
          'CV_SHOW_AUTHORING_COMMITTED_DIVERGENT',
        );
      }

      snapshot = committedSnapshot;
      view = committedView;
      dirty = hostReceipt.dirty;
      materialized = hostReceipt.materialized;
      state = materialized ? 'materialized' : 'local-ready';
      if (materialized) mutationSession = null;
      let replicaStatus = 'ready';
      let replicaWarning = null;
      const notificationFailure = notify(view);
      if (notificationFailure) {
        replicaStatus = state === 'disposed' ? 'disposed' : 'blocked';
        replicaWarning = createReplicaWarning(notificationFailure, 'committed-replica');
        warning = replicaWarning;
        if (state !== 'disposed') {
          state = 'blocked';
          mutationSession = null;
        }
      }
      lastTransactionReceipt = immutable({
        schemaVersion: AUTHORITY_TRANSACTION_RECEIPT_VERSION,
        status: 'committed',
        commitId: hostReceipt.commitId,
        base: currentSnapshotBase,
        candidateIdentity: candidateView.identity,
        currentBase: committedView?.base || view.base,
        currentIdentity: committedView?.identity || view.identity,
        dirty: hostReceipt.dirty,
        materialized: hostReceipt.materialized,
        replica: {
          status: replicaStatus,
          base: view.base,
          identity: view.identity,
          ...(replicaWarning ? { warning: replicaWarning } : {}),
        },
      });
      return lastTransactionReceipt;
    },
    dispose() {
      if (state === 'disposed') return;
      lifecycleController.abort(new DOMException('CV Show authoring authority disposed', 'AbortError'));
      state = 'disposed';
      mutationSession = null;
      providerTools = null;
      transport = null;
      sessionId = '';
      subscribers.clear();
    },
  };

  return Object.freeze(authority);
}

export const cvShowAuthoringAuthority = createCvShowAuthoringAuthority();
