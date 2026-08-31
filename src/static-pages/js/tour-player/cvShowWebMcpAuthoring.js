import {
  ToolDescriptor,
  registerWebMCPTool,
  unregisterWebMCPTools,
} from '@symbiotejs/symbiote/webmcp';
import { listCvShowAuthoringToolDescriptors } from './cvShowAuthoringTools.js';

const RESULT_SCHEMA_VERSION = 'cv-show-webmcp-result-v1';
const LIFECYCLE_SCHEMA_VERSION = 'cv-show-webmcp-lifecycle-v1';
const EXPECTED_TOOL_NAMES = Object.freeze(
  listCvShowAuthoringToolDescriptors()
    .map(({ name }) => name)
    .sort(),
);
const CAPABILITY_KEYS = Object.freeze(['local', 'authorized', 'sessionId']);
const SESSION_KEYS = Object.freeze(['sessionId', 'mutationSession']);
const MUTATION_SESSION_KEYS = Object.freeze(['tools', 'invoke']);
const MAX_ERROR_CODE_LENGTH = 96;
const MAX_ERROR_MESSAGE_LENGTH = 320;
const MAX_DIAGNOSTIC_DEPTH = 3;
const MAX_DIAGNOSTIC_ENTRIES = 40;
const MAX_DIAGNOSTIC_OBJECT_KEYS = 16;
const MAX_DIAGNOSTIC_INPUT_STRING_LENGTH = 1024;
const MAX_DIAGNOSTIC_STRING_LENGTH = 256;
const ERROR_CODE = /^(?:PRESENTATION_AUTHORING|CV_SHOW_(?:AUTHORING|WEBMCP))_[A-Z0-9_]+$/u;
const DIAGNOSTIC_DETAIL_KEYS = new Set([
  'alignmentHash',
  'alignmentStatus',
  'artifactHash',
  'artifactScope',
  'authoringProjectHash',
  'audioStatus',
  'base',
  'cause',
  'causeCode',
  'causeDetails',
  'cellId',
  'changeType',
  'code',
  'collectionId',
  'commandId',
  'commandType',
  'contractVersion',
  'dependency',
  'entryId',
  'expected',
  'expectedAlignmentHash',
  'expectedAudioHash',
  'expectedEntryId',
  'expectedReceiptHash',
  'hash',
  'id',
  'index',
  'layerId',
  'manifestHash',
  'message',
  'name',
  'narrationAudioHash',
  'narrationCellId',
  'narrationHash',
  'nativeActive',
  'nleHash',
  'path',
  'predecessors',
  'projectionStatus',
  'received',
  'receivedAlignmentHash',
  'receivedAudioHash',
  'receivedReceiptHash',
  'renderStatus',
  'requestHash',
  'requestId',
  'revision',
  'scheduleHash',
  'schemaVersion',
  'status',
  'timelineHash',
  'toolName',
  'type',
]);
const SENSITIVE_KEY = /authorization|capability|cookie|password|secret|token/ui;
const AUTHORIZATION_CREDENTIAL = /\b(?:authorization|proxy-authorization)\s*[:=]\s*(?:bearer|basic)\s+[^\s,;]+/giu;
const BEARER_CREDENTIAL = /\bbearer\s+[A-Za-z0-9._~+/=-]+/giu;
const INLINE_CREDENTIAL = /\b(?:access[_-]?token|api[_-]?key|cookie|password|secret|set-cookie|token)\s*[:=]\s*(?:"[^"]*"|'[^']*'|[^\s,;]+)/giu;
const FILE_URL = /\bfile:\/\/[^\s"'<>]+/giu;
const POSIX_ABSOLUTE_PATH = /(^|[\s("'=])\/(?!\/)(?:[^/\s"'<>]+\/)*[^/\s"'<>]+/gu;
const WINDOWS_ABSOLUTE_PATH = /(^|[\s("'=])[A-Za-z]:\\(?:[^\\\s"'<>]+\\)*[^\\\s"'<>]*/gu;

function safeString(value) {
  return value
    .replace(AUTHORIZATION_CREDENTIAL, '[redacted-credential]')
    .replace(BEARER_CREDENTIAL, '[redacted-credential]')
    .replace(INLINE_CREDENTIAL, '[redacted-credential]')
    .replace(FILE_URL, '[redacted-path]')
    .replace(POSIX_ABSOLUTE_PATH, (_, prefix) => `${prefix}[redacted-path]`)
    .replace(WINDOWS_ABSOLUTE_PATH, (_, prefix) => `${prefix}[redacted-path]`);
}

function deepFreeze(value) {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) {
    return value;
  }
  Object.freeze(value);
  for (let nested of Object.values(value)) {
    deepFreeze(nested);
  }
  return value;
}

function safeJsonValue(value, seen = new WeakSet(), key = '') {
  try {
    if (SENSITIVE_KEY.test(key)) {
      return '[redacted]';
    }
    if (value === null || typeof value === 'boolean' || typeof value === 'number') {
      return value;
    }
    if (typeof value === 'string') {
      return safeString(value);
    }
    if (typeof value === 'bigint') {
      return String(value);
    }
    if (typeof value !== 'object') {
      return undefined;
    }
    if (seen.has(value)) {
      return '[circular]';
    }
    seen.add(value);
    if (Array.isArray(value)) {
      let result = value.map((item) => safeJsonValue(item, seen));
      seen.delete(value);
      return result;
    }
    let result = {};
    for (let [entryKey, entryValue] of Object.entries(value)) {
      let safeValue = safeJsonValue(entryValue, seen, entryKey);
      if (safeValue !== undefined) {
        result[entryKey] = safeValue;
      }
    }
    seen.delete(value);
    return result;
  } catch {
    if (value && typeof value === 'object') {
      seen.delete(value);
    }
    return '[unserializable]';
  }
}

function response(envelope, isError = false) {
  let payload = {
    content: [{
      type: 'text',
      text: JSON.stringify(envelope),
    }],
    ...(isError ? { isError: true } : {}),
  };
  return deepFreeze(payload);
}

function isExactPlainObject(value, expectedKeys) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return false;
  }
  let prototype = Object.getPrototypeOf(value);
  if (prototype !== Object.prototype && prototype !== null) {
    return false;
  }
  let keys = Reflect.ownKeys(value);
  if (
    keys.length !== expectedKeys.length
    || !expectedKeys.every((key) => keys.includes(key))
  ) {
    return false;
  }
  return expectedKeys.every((key) => {
    let descriptor = Object.getOwnPropertyDescriptor(value, key);
    return descriptor?.enumerable === true
      && Object.hasOwn(descriptor, 'value')
      && !Object.hasOwn(descriptor, 'get')
      && !Object.hasOwn(descriptor, 'set');
  });
}

function isAuthorizedCapability(capability) {
  try {
    if (
      !isExactPlainObject(capability, CAPABILITY_KEYS)
      || !Object.isFrozen(capability)
      || typeof globalThis.structuredClone !== 'function'
    ) {
      return false;
    }
    let cloned = globalThis.structuredClone(capability);
    return isExactPlainObject(cloned, CAPABILITY_KEYS)
      && capability.local === true
      && capability.authorized === true
      && typeof capability.sessionId === 'string'
      && capability.sessionId.trim().length > 0
      && cloned.local === capability.local
      && cloned.authorized === capability.authorized
      && cloned.sessionId === capability.sessionId;
  } catch {
    return false;
  }
}

function readCurrentState(authority) {
  try {
    let view = authority.getView();
    let base = view?.base;
    let identity = view?.identity;
    if (
      !Number.isInteger(base?.revision)
      || typeof base?.authoringProjectHash !== 'string'
      || !base.authoringProjectHash
      || typeof identity?.schemaVersion !== 'string'
      || !identity.schemaVersion
      || typeof identity?.snapshot !== 'string'
      || !identity.snapshot
      || typeof identity?.media !== 'string'
      || !identity.media
    ) {
      return deepFreeze({ currentBase: null, currentIdentity: null });
    }
    return deepFreeze({
      currentBase: {
        revision: base.revision,
        authoringProjectHash: base.authoringProjectHash,
        snapshotIdentity: identity.snapshot,
      },
      currentIdentity: {
        schemaVersion: identity.schemaVersion,
        snapshot: identity.snapshot,
        media: identity.media,
      },
    });
  } catch {
    return deepFreeze({ currentBase: null, currentIdentity: null });
  }
}

function readOwnDataValue(value, key) {
  try {
    if (!value || (typeof value !== 'object' && typeof value !== 'function')) {
      return undefined;
    }
    let descriptor = Object.getOwnPropertyDescriptor(value, key);
    return descriptor && Object.hasOwn(descriptor, 'value')
      ? descriptor.value
      : undefined;
  } catch {
    return undefined;
  }
}

function safeErrorCode(value) {
  return typeof value === 'string'
    && value.length > 0
    && value.length <= MAX_ERROR_CODE_LENGTH
    && ERROR_CODE.test(value)
    ? value
    : null;
}

function safeErrorMessage(value) {
  if (typeof value !== 'string' || !value) {
    return 'CV Show authoring operation failed.';
  }
  let boundedInput = value.slice(0, MAX_DIAGNOSTIC_INPUT_STRING_LENGTH);
  let normalized = safeString(boundedInput).normalize('NFC').replace(/\s+/gu, ' ').trim();
  if (!normalized) {
    return 'CV Show authoring operation failed.';
  }
  if (normalized.length <= MAX_ERROR_MESSAGE_LENGTH) {
    return normalized;
  }
  return `${normalized.slice(0, MAX_ERROR_MESSAGE_LENGTH - 3)}...`;
}

function isCloneableDiagnosticValue(value, depth, budget) {
  if (value === null || typeof value === 'boolean') {
    return true;
  }
  if (typeof value === 'number') {
    return Number.isFinite(value);
  }
  if (typeof value === 'string') {
    return value.length <= MAX_DIAGNOSTIC_INPUT_STRING_LENGTH;
  }
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return false;
  }
  if (depth > MAX_DIAGNOSTIC_DEPTH) {
    return false;
  }
  let prototype = Object.getPrototypeOf(value);
  if (prototype !== Object.prototype && prototype !== null) {
    return false;
  }
  let keys = Reflect.ownKeys(value);
  if (
    keys.length > MAX_DIAGNOSTIC_OBJECT_KEYS
    || keys.some((key) => typeof key !== 'string')
  ) {
    return false;
  }
  for (let key of keys) {
    budget.entries += 1;
    if (budget.entries > MAX_DIAGNOSTIC_ENTRIES) {
      return false;
    }
    let descriptor = Object.getOwnPropertyDescriptor(value, key);
    if (
      descriptor?.enumerable !== true
      || !Object.hasOwn(descriptor, 'value')
      || Object.hasOwn(descriptor, 'get')
      || Object.hasOwn(descriptor, 'set')
      || !isCloneableDiagnosticValue(descriptor.value, depth + 1, budget)
    ) {
      return false;
    }
  }
  return true;
}

function projectDiagnosticValue(value, depth, budget) {
  if (value === null || typeof value === 'boolean') {
    return value;
  }
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : undefined;
  }
  if (typeof value === 'string') {
    let sanitized = safeString(value);
    return sanitized.length <= MAX_DIAGNOSTIC_STRING_LENGTH
      ? sanitized
      : '[redacted-oversize]';
  }
  if (!value || typeof value !== 'object' || depth > MAX_DIAGNOSTIC_DEPTH) {
    return undefined;
  }
  let projected = {};
  for (let [key, nested] of Object.entries(value)) {
    if (!DIAGNOSTIC_DETAIL_KEYS.has(key)) {
      continue;
    }
    budget.entries += 1;
    if (budget.entries > MAX_DIAGNOSTIC_ENTRIES) {
      break;
    }
    let safeValue = projectDiagnosticValue(nested, depth + 1, budget);
    if (safeValue !== undefined) {
      projected[key] = safeValue;
    }
  }
  return projected;
}

function projectDiagnosticDetails(value) {
  try {
    if (
      !isCloneableDiagnosticValue(value, 0, { entries: 0 })
      || typeof globalThis.structuredClone !== 'function'
    ) {
      return null;
    }
    let cloned = globalThis.structuredClone(value);
    return deepFreeze(projectDiagnosticValue(cloned, 0, { entries: 0 }));
  } catch {
    return null;
  }
}

function normalizeFailure(error, currentState, fallbackCode) {
  let currentBase = currentState?.currentBase ?? null;
  let currentIdentity = currentState?.currentIdentity ?? null;
  try {
    let rawCode = readOwnDataValue(error, 'code');
    let rawName = readOwnDataValue(error, 'name');
    let code = safeErrorCode(rawCode)
      || (rawName === 'AbortError' ? 'CV_SHOW_AUTHORING_ABORTED' : fallbackCode);
    let trustedError = safeErrorCode(rawCode) !== null || rawName === 'AbortError';
    return deepFreeze({
      code,
      message: trustedError
        ? safeErrorMessage(readOwnDataValue(error, 'message'))
        : 'CV Show authoring operation failed.',
      details: safeErrorCode(rawCode)
        ? projectDiagnosticDetails(readOwnDataValue(error, 'details'))
        : null,
      currentBase,
      currentIdentity,
    });
  } catch {
    return deepFreeze({
      code: fallbackCode,
      message: 'CV Show authoring operation failed.',
      details: null,
      currentBase,
      currentIdentity,
    });
  }
}

function unauthorizedFailure(currentState = null) {
  return deepFreeze({
    code: 'CV_SHOW_AUTHORING_UNAUTHORIZED',
    message: 'CV Show local authoring is not authorized for this session.',
    details: null,
    currentBase: currentState?.currentBase ?? null,
    currentIdentity: currentState?.currentIdentity ?? null,
  });
}

function createSuccessEnvelope(toolName, sessionId, result) {
  return deepFreeze({
    schemaVersion: RESULT_SCHEMA_VERSION,
    status: 'ok',
    toolName,
    sessionId,
    result: safeJsonValue(result),
  });
}

function createErrorEnvelope(toolName, sessionId, error) {
  return deepFreeze({
    schemaVersion: RESULT_SCHEMA_VERSION,
    status: 'error',
    toolName,
    sessionId,
    error,
  });
}

function validateSessionContext(authority, session) {
  if (
    typeof authority?.getView !== 'function'
    || !isExactPlainObject(session, SESSION_KEYS)
    || !Object.isFrozen(session)
    || typeof session.sessionId !== 'string'
    || !session.sessionId.trim()
  ) {
    throw Object.assign(
      new Error(
        'CV Show authoring requires a frozen session context with sessionId and mutationSession.',
      ),
      { code: 'CV_SHOW_WEBMCP_SESSION_INVALID' },
    );
  }
  let pack = session.mutationSession;
  if (
    !isExactPlainObject(pack, MUTATION_SESSION_KEYS)
    || !Object.isFrozen(pack)
    || !Array.isArray(pack.tools)
    || typeof pack.invoke !== 'function'
  ) {
    throw Object.assign(
      new Error('CV Show mutationSession must expose exact tools and invoke contracts.'),
      { code: 'CV_SHOW_WEBMCP_SESSION_INVALID' },
    );
  }
  let names = new Set();
  for (let descriptor of pack.tools) {
    if (
      typeof descriptor?.name !== 'string'
      || !descriptor.name
      || typeof descriptor.description !== 'string'
      || !descriptor.inputSchema
      || typeof descriptor.inputSchema !== 'object'
      || names.has(descriptor.name)
    ) {
      throw Object.assign(
        new Error('CV Show authoring provider tool descriptors are invalid or duplicated.'),
        { code: 'CV_SHOW_WEBMCP_TOOL_SURFACE_INVALID' },
      );
    }
    names.add(descriptor.name);
  }
  let receivedToolNames = [...names].sort();
  if (
    receivedToolNames.length !== EXPECTED_TOOL_NAMES.length
    || receivedToolNames.some((name, index) => name !== EXPECTED_TOOL_NAMES[index])
  ) {
    throw Object.assign(
      new Error('CV Show authoring requires the exact provider tool surface.'),
      {
        code: 'CV_SHOW_WEBMCP_TOOL_SURFACE_INVALID',
        details: { expected: EXPECTED_TOOL_NAMES, received: receivedToolNames },
      },
    );
  }
  return pack;
}

function isBoundSession(authority, session, sessionId) {
  try {
    return session.sessionId === sessionId
      && session.mutationSession === authority.mutationSession;
  } catch {
    return false;
  }
}

/**
 * @param {Object} options
 * @returns {Promise<Object>}
 */
export async function createCvShowWebMcpAuthoring({
  authority,
  session,
  capability,
  registerTool = registerWebMCPTool,
  unregisterTools = unregisterWebMCPTools,
  owner = { uid: 'cv-show-authoring' },
  pageTarget = globalThis,
} = {}) {
  let controller = new AbortController();
  let status = 'inactive';
  let reason = null;
  let lifecycleError = null;
  let activeToolNames = [];
  let unregisterStarted = false;
  let pagehideAttached = false;
  let authorizedCapability = isAuthorizedCapability(capability);
  let sessionId = authorizedCapability
    ? capability.sessionId
    : null;

  let state = () => deepFreeze({
    schemaVersion: LIFECYCLE_SCHEMA_VERSION,
    status,
    reason,
    activeToolNames: [...activeToolNames],
    error: lifecycleError,
  });

  let onPageHide;
  let removePageHide = () => {
    if (!pagehideAttached || typeof pageTarget?.removeEventListener !== 'function') {
      return;
    }
    pageTarget.removeEventListener('pagehide', onPageHide);
    pagehideAttached = false;
  };

  let unregister = async () => {
    if (unregisterStarted) {
      return;
    }
    unregisterStarted = true;
    try {
      await unregisterTools(owner);
    } catch (error) {
      lifecycleError ||= normalizeFailure(
        error,
        readCurrentState(authority),
        'CV_SHOW_WEBMCP_UNREGISTER_FAILED',
      );
    }
  };

  let cleanup = async (nextStatus) => {
    if (!controller.signal.aborted) {
      controller.abort();
    }
    await unregister();
    activeToolNames = [];
    removePageHide();
    status = nextStatus;
  };

  let dispose = async () => {
    if (status === 'disposed') {
      return state();
    }
    await cleanup('disposed');
    return state();
  };

  onPageHide = () => {
    void dispose();
  };

  let lifecycle = () => Object.freeze({
    get state() { return state(); },
    signal: controller.signal,
    dispose,
  });

  if (!authorizedCapability) {
    reason = 'unauthorized';
    return lifecycle();
  }
  if (!authority || !session) {
    reason = 'session-unavailable';
    return lifecycle();
  }

  let pack;
  try {
    pack = validateSessionContext(authority, session);
  } catch (error) {
    lifecycleError = normalizeFailure(
      error,
      readCurrentState(authority),
      'CV_SHOW_WEBMCP_SESSION_INVALID',
    );
    await cleanup('failed');
    return lifecycle();
  }
  if (!isBoundSession(authority, session, sessionId)) {
    reason = 'unauthorized';
    return lifecycle();
  }

  let isExecutionActive = () => !controller.signal.aborted
    && status === 'active'
    && isBoundSession(authority, session, sessionId);

  let executionUnavailableFailure = (currentState) => {
    if (!controller.signal.aborted) {
      return unauthorizedFailure(currentState);
    }
    let abortError = controller.signal.reason || Object.assign(
      new Error('CV Show authoring operation was aborted.'),
      { name: 'AbortError' },
    );
    return normalizeFailure(
      abortError,
      currentState,
      'CV_SHOW_AUTHORING_ABORTED',
    );
  };

  let execute = (toolName) => async (input = {}) => {
    if (!isExecutionActive()) {
      return response(
        createErrorEnvelope(toolName, sessionId, unauthorizedFailure()),
        true,
      );
    }
    try {
      let result = await pack.invoke(toolName, input, { signal: controller.signal });
      if (!isExecutionActive()) {
        let failure = executionUnavailableFailure(readCurrentState(authority));
        return response(createErrorEnvelope(toolName, sessionId, failure), true);
      }
      return response(createSuccessEnvelope(toolName, sessionId, result));
    } catch (error) {
      let currentState = readCurrentState(authority);
      let failure = isExecutionActive()
        ? normalizeFailure(error, currentState, 'CV_SHOW_AUTHORING_TOOL_FAILED')
        : executionUnavailableFailure(currentState);
      return response(createErrorEnvelope(toolName, sessionId, failure), true);
    }
  };

  status = 'registering';
  try {
    for (let providerDescriptor of pack.tools) {
      let descriptor = new ToolDescriptor({
        name: providerDescriptor.name,
        description: providerDescriptor.description,
        inputSchema: providerDescriptor.inputSchema,
        annotations: {
          ...(providerDescriptor.annotations || {}),
          readOnlyHint: providerDescriptor.mutates !== true,
        },
        execute: execute(providerDescriptor.name),
      });
      let registration = await registerTool(
        owner,
        providerDescriptor.name,
        descriptor,
      );
      if (registration?.nativeActive !== true) {
        throw Object.assign(
          new Error(`Native WebMCP registration failed for "${providerDescriptor.name}".`),
          {
            code: 'CV_SHOW_WEBMCP_REGISTRATION_FAILED',
            details: { toolName: providerDescriptor.name, nativeActive: false },
          },
        );
      }
      activeToolNames.push(providerDescriptor.name);
    }
  } catch (error) {
    lifecycleError = normalizeFailure(
      error,
      readCurrentState(authority),
      'CV_SHOW_WEBMCP_REGISTRATION_FAILED',
    );
    await cleanup('failed');
    return lifecycle();
  }

  status = 'active';
  if (typeof pageTarget?.addEventListener === 'function') {
    pageTarget.addEventListener('pagehide', onPageHide, { once: true });
    pagehideAttached = true;
  }
  return lifecycle();
}

export default createCvShowWebMcpAuthoring;
