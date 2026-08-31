import { createHash } from 'node:crypto';

import { canonicalize } from 'symbiote-workspace/schema/canonical-json.js';

const RECEIPT_VERSION = 'symbiote-audio-synthesis-receipt-v3';
const SHA256_PATTERN = /^[a-f0-9]{64}$/u;
const SAFE_TOKEN_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._+-]{0,63}$/u;
const HEADER_NAME_PATTERN = /^[!#$%&'*+.^_`|~0-9A-Za-z-]+$/u;
const BASE64URL_PATTERN = /^[A-Za-z0-9_-]+$/u;
const SERVICE_SENTINELS = new Set(['None', 'null', 'undefined']);
const FORBIDDEN_HEADERS = new Set([
  'accept',
  'authorization',
  'content-length',
  'content-type',
  'cookie',
  'host',
  'proxy-authorization',
  'set-cookie',
  'x-api-key',
]);

function invalid(message, details = {}) {
  throw Object.assign(new TypeError(message), {
    code: 'CV_SHOW_MODEL_SERVICE_INVALID',
    details: Object.freeze({ ...details }),
  });
}

function httpFailure(pathname, status) {
  throw Object.assign(
    new Error(`CV Show model service ${pathname} returned HTTP ${status}`),
    {
      code: 'CV_SHOW_MODEL_SERVICE_HTTP',
      details: Object.freeze({ pathname, status }),
    },
  );
}

function isPlainObject(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  let prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function requireExactKeys(value, expected, field) {
  if (!isPlainObject(value)) invalid(`CV Show model service ${field} must be an object`);
  let actual = Object.keys(value).sort();
  let required = [...expected].sort();
  if (
    actual.length !== required.length
    || actual.some((key, index) => key !== required[index])
  ) {
    invalid(`CV Show model service ${field} has unexpected or missing fields`);
  }
  return value;
}

function requireString(value, field, { allowEmpty = false } = {}) {
  if (
    typeof value !== 'string'
    || (!allowEmpty && !value.trim())
    || value.includes('\0')
  ) {
    invalid(`CV Show model service ${field} must be an exact nonempty string`);
  }
  return value;
}

function requireNormalizedString(value, field) {
  let text = requireString(value, field);
  if (text !== text.trim() || SERVICE_SENTINELS.has(text)) {
    invalid(`CV Show model service ${field} must already be normalized`);
  }
  return text;
}

function requirePortableVoiceRef(value, field) {
  let voiceRef = requireNormalizedString(value, field);
  if (
    voiceRef.startsWith('.')
    || voiceRef.includes('/')
    || voiceRef.includes('\\')
    || /^[A-Za-z]+:\/\//u.test(voiceRef)
  ) {
    invalid(`CV Show model service ${field} must be a portable public voice ID`);
  }
  return voiceRef;
}

function requireDigest(value, field) {
  if (typeof value !== 'string' || !SHA256_PATTERN.test(value)) {
    invalid(`CV Show model service ${field} must be lowercase hexadecimal SHA-256`);
  }
  return value;
}

function requirePositiveNumber(value, field) {
  if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0) {
    invalid(`CV Show model service ${field} must be a positive finite number`);
  }
  return value;
}

function requireNonnegativeNumber(value, field) {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) {
    invalid(`CV Show model service ${field} must be a finite nonnegative number`);
  }
  return value;
}

function sha256(value) {
  return createHash('sha256').update(value).digest('hex');
}

function freezeDeep(value) {
  if (
    !value
    || typeof value !== 'object'
    || Object.isFrozen(value)
    || ArrayBuffer.isView(value)
  ) {
    return value;
  }
  for (let child of Object.values(value)) freezeDeep(child);
  return Object.freeze(value);
}

function normalizeHeaders(value) {
  if (value === undefined) return Object.freeze({});
  if (!isPlainObject(value)) {
    invalid('CV Show model service headers must be an explicit plain object');
  }
  let normalized = {};
  for (let [rawName, rawValue] of Object.entries(value)) {
    let name = String(rawName).toLowerCase();
    if (
      !HEADER_NAME_PATTERN.test(name)
      || FORBIDDEN_HEADERS.has(name)
      || Object.hasOwn(normalized, name)
    ) {
      invalid(`CV Show model service header "${rawName}" is reserved or invalid`);
    }
    if (typeof rawValue !== 'string' || !rawValue || /[\r\n]/u.test(rawValue)) {
      invalid(`CV Show model service header "${rawName}" must be an explicit safe string`);
    }
    normalized[name] = rawValue;
  }
  return Object.freeze(normalized);
}

function normalizeEndpoint(value) {
  if (typeof value !== 'string' || !value) {
    invalid('CV Show model service endpoint must be explicitly supplied and absolute');
  }
  let endpoint;
  try {
    endpoint = new URL(value);
  } catch {
    invalid('CV Show model service endpoint must be an absolute HTTP URL');
  }
  if (
    !['http:', 'https:'].includes(endpoint.protocol)
    || endpoint.username
    || endpoint.password
    || endpoint.pathname !== '/'
    || endpoint.search
    || endpoint.hash
  ) {
    invalid('CV Show model service endpoint must be a credential-free absolute HTTP origin');
  }
  return endpoint.origin;
}

function normalizeSynthesisItem(value) {
  requireExactKeys(value, ['id', 'text', 'language', 'voiceRef', 'style'], 'synthesis item');
  return {
    id: requireNormalizedString(value.id, 'synthesis item id'),
    text: requireNormalizedString(value.text, 'synthesis item text'),
    language: requireNormalizedString(value.language, 'synthesis item language'),
    voiceRef: requirePortableVoiceRef(value.voiceRef, 'synthesis item voiceRef'),
    style: value.style === ''
      ? ''
      : requireNormalizedString(value.style, 'synthesis item style'),
    format: 'wav',
    normalize: true,
  };
}

function copyRequestBytes(value) {
  if (!(value instanceof Uint8Array) || value.byteLength === 0) {
    invalid('CV Show model service WAV input must be a nonempty Uint8Array');
  }
  return Buffer.from(value);
}

function requireResponse(response, pathname) {
  if (!response || typeof response.ok !== 'boolean') {
    invalid(`CV Show model service ${pathname} transport returned an invalid response`);
  }
  if (!response.ok) httpFailure(pathname, response.status);
  return response;
}

function requireContentType(response, expected, pathname) {
  let raw = response.headers?.get?.('content-type');
  let accepted = Array.isArray(expected) ? expected : [expected];
  if (
    typeof raw !== 'string'
    || !accepted.includes(raw.split(';', 1)[0].trim().toLowerCase())
  ) {
    invalid(`CV Show model service ${pathname} content type must be ${accepted.join(' or ')}`);
  }
}

function requireHeader(response, name, pathname) {
  let value = response.headers?.get?.(name);
  if (typeof value !== 'string' || !value) {
    invalid(`CV Show model service ${pathname} response is missing ${name}`);
  }
  return value;
}

async function readJson(response, pathname) {
  requireContentType(response, 'application/json', pathname);
  if (typeof response.json !== 'function') {
    invalid(`CV Show model service ${pathname} response cannot decode JSON`);
  }
  try {
    return await response.json();
  } catch {
    invalid(`CV Show model service ${pathname} response JSON is malformed`);
  }
}

function decodeReceipt(encoded) {
  if (
    typeof encoded !== 'string'
    || !BASE64URL_PATTERN.test(encoded)
    || encoded.length % 4 === 1
  ) {
    invalid('CV Show model service synthesis receipt must be unpadded base64url');
  }
  let bytes = Buffer.from(encoded, 'base64url');
  if (bytes.toString('base64url') !== encoded) {
    invalid('CV Show model service synthesis receipt base64url is non-canonical');
  }
  let text;
  let receipt;
  try {
    text = new TextDecoder('utf-8', { fatal: true }).decode(bytes);
    receipt = JSON.parse(text);
  } catch {
    invalid('CV Show model service synthesis receipt JSON is malformed');
  }
  if (!isPlainObject(receipt) || canonicalize(receipt) !== text) {
    invalid('CV Show model service synthesis receipt JSON must be canonical');
  }
  return receipt;
}

function parsePositiveHeader(value, field) {
  if (!/^(?:0|[1-9][0-9]*)(?:\.[0-9]+)?$/u.test(value)) {
    invalid(`CV Show model service ${field} header is invalid`);
  }
  let number = Number(value);
  return requirePositiveNumber(number, `${field} header`);
}

function parsePositiveIntegerHeader(value, field) {
  if (!/^[1-9][0-9]*$/u.test(value)) {
    invalid(`CV Show model service ${field} header must be a positive integer`);
  }
  let number = Number(value);
  if (!Number.isSafeInteger(number)) {
    invalid(`CV Show model service ${field} header must be a safe positive integer`);
  }
  return number;
}

function parseWav(bytes) {
  if (
    bytes.length < 44
    || bytes.toString('ascii', 0, 4) !== 'RIFF'
    || bytes.toString('ascii', 8, 12) !== 'WAVE'
    || bytes.readUInt32LE(4) + 8 !== bytes.length
  ) {
    invalid('CV Show model service synthesis bytes must be one complete RIFF/WAVE artifact');
  }
  let offset = 12;
  let format = null;
  let dataSize = null;
  while (offset < bytes.length) {
    if (offset + 8 > bytes.length) {
      invalid('CV Show model service synthesis WAV chunk header is truncated');
    }
    let chunkId = bytes.toString('ascii', offset, offset + 4);
    let chunkSize = bytes.readUInt32LE(offset + 4);
    let start = offset + 8;
    let end = start + chunkSize;
    if (end > bytes.length) {
      invalid('CV Show model service synthesis WAV chunk is truncated');
    }
    if (chunkId === 'fmt ') {
      if (format || chunkSize < 16) {
        invalid('CV Show model service synthesis WAV format chunk is invalid');
      }
      format = {
        audioFormat: bytes.readUInt16LE(start),
        channels: bytes.readUInt16LE(start + 2),
        sampleRate: bytes.readUInt32LE(start + 4),
        byteRate: bytes.readUInt32LE(start + 8),
        blockAlign: bytes.readUInt16LE(start + 12),
        bitsPerSample: bytes.readUInt16LE(start + 14),
      };
    }
    if (chunkId === 'data') {
      if (dataSize !== null || chunkSize === 0) {
        invalid('CV Show model service synthesis WAV data chunk is invalid');
      }
      dataSize = chunkSize;
    }
    offset = end + (chunkSize % 2);
  }
  if (
    offset !== bytes.length
    || !format
    || dataSize === null
    || format.audioFormat !== 1
    || format.channels < 1
    || format.sampleRate < 1
    || format.blockAlign < 1
    || format.bitsPerSample < 1
    || format.bitsPerSample % 8 !== 0
    || format.blockAlign !== format.channels * format.bitsPerSample / 8
    || format.byteRate !== format.sampleRate * format.blockAlign
    || dataSize % format.blockAlign !== 0
  ) {
    invalid('CV Show model service synthesis WAV PCM header is invalid');
  }
  return Object.freeze({
    sampleRate: format.sampleRate,
    durationSec: dataSize / format.byteRate,
  });
}

function validateReceipt({ receipt, item, wav, durationSec, sampleRate }) {
  requireExactKeys(receipt, [
    'artifactHash',
    'durationMs',
    'language',
    'model',
    'normalization',
    'receiptHmac',
    'receiptVersion',
    'requestHash',
    'requestedVoiceRef',
    'resolvedVoiceRef',
    'sampleRate',
    'voiceBindingAttestation',
  ], 'synthesis receipt');
  if (receipt.receiptVersion !== RECEIPT_VERSION) {
    invalid(`CV Show model service synthesis receipt version must be ${RECEIPT_VERSION}`);
  }
  let requestHash = sha256(Buffer.from(canonicalize(item), 'utf8'));
  if (requireDigest(receipt.requestHash, 'receipt requestHash') !== requestHash) {
    invalid('CV Show model service synthesis receipt requestHash does not match the request');
  }
  if (requireDigest(receipt.artifactHash, 'receipt artifactHash') !== sha256(wav)) {
    invalid('CV Show model service synthesis receipt artifactHash does not match the WAV bytes');
  }
  if (
    !Number.isSafeInteger(receipt.durationMs)
    || receipt.durationMs !== Math.floor(durationSec * 1000 + 0.5)
  ) {
    invalid('CV Show model service synthesis receipt duration does not match the WAV header');
  }
  if (!Number.isSafeInteger(receipt.sampleRate) || receipt.sampleRate !== sampleRate) {
    invalid('CV Show model service synthesis receipt sample rate does not match the WAV header');
  }
  if (receipt.language !== item.language) {
    invalid('CV Show model service synthesis receipt language does not match the request');
  }
  if (
    requirePortableVoiceRef(receipt.requestedVoiceRef, 'receipt requestedVoiceRef')
      !== item.voiceRef
    || requirePortableVoiceRef(receipt.resolvedVoiceRef, 'receipt resolvedVoiceRef')
      !== item.voiceRef
  ) {
    invalid('CV Show model service synthesis receipt public voice does not match the request');
  }
  let model = requireExactKeys(receipt.model, ['family', 'versionToken'], 'receipt model');
  if (!SAFE_TOKEN_PATTERN.test(requireNormalizedString(model.family, 'receipt model family'))) {
    invalid('CV Show model service synthesis receipt model family is invalid');
  }
  requireDigest(model.versionToken, 'receipt model versionToken');
  let normalization = requireExactKeys(receipt.normalization, [
    'applied',
    'targetLufs',
    'truePeakLimitDbfs',
    'version',
  ], 'receipt normalization');
  if (
    normalization.applied !== true
    || normalization.targetLufs !== -19
    || normalization.truePeakLimitDbfs !== -1
    || !SAFE_TOKEN_PATTERN.test(
      requireNormalizedString(normalization.version, 'receipt normalization version'),
    )
  ) {
    invalid('CV Show model service synthesis receipt normalization evidence is invalid');
  }
  requireDigest(receipt.voiceBindingAttestation, 'receipt voiceBindingAttestation');
  requireDigest(receipt.receiptHmac, 'receipt receiptHmac');
  return freezeDeep(receipt);
}

function validateReadiness(value) {
  if (!isPlainObject(value)) {
    invalid('CV Show model service readiness must be an object');
  }
  if (value.ready !== true || value.status !== 'ready') {
    invalid('CV Show model service readiness must be exactly ready:true and status:ready');
  }
  if (
    !Array.isArray(value.capabilities)
    || value.capabilities.some((capability) => (
      typeof capability !== 'string' || !capability.trim() || capability !== capability.trim()
    ))
  ) {
    invalid('CV Show model service readiness capabilities must be exact strings');
  }
  return freezeDeep({
    ready: true,
    status: 'ready',
    model: requireNormalizedString(value.model, 'readiness model'),
    modelVersion: requireNormalizedString(value.modelVersion, 'readiness modelVersion'),
    accelerator: requireNormalizedString(value.accelerator, 'readiness accelerator'),
    capabilities: [...value.capabilities],
  });
}

function validateTranscript(value) {
  requireExactKeys(value, ['text', 'durationSec', 'words'], 'transcription response');
  let text = requireString(value.text, 'transcription text');
  let durationSec = requirePositiveNumber(value.durationSec, 'transcription durationSec');
  if (!Array.isArray(value.words) || value.words.length === 0) {
    invalid('CV Show model service transcription words must be nonempty observed timing');
  }
  let previousEnd = 0;
  let words = value.words.map((word, index) => {
    requireExactKeys(word, ['word', 'startSec', 'endSec'], `transcription word ${index}`);
    let startSec = requireNonnegativeNumber(
      word.startSec,
      `transcription word ${index} startSec`,
    );
    let endSec = requireNonnegativeNumber(
      word.endSec,
      `transcription word ${index} endSec`,
    );
    if (startSec < previousEnd || endSec < startSec || endSec > durationSec) {
      invalid(`CV Show model service transcription word ${index} timing is reordered or overlapping`);
    }
    previousEnd = endSec;
    return {
      word: requireString(word.word, `transcription word ${index} text`),
      startSec,
      endSec,
    };
  });
  return freezeDeep({ text, durationSec, words });
}

export function createCvShowModelServiceClient({
  endpoint,
  headers,
  fetchImpl,
  model = 'qwen3',
} = {}) {
  let origin = normalizeEndpoint(endpoint);
  let synthesisModel = requireNormalizedString(model, 'synthesis model');
  if (typeof fetchImpl !== 'function') {
    invalid('CV Show model service client requires an explicitly injected fetch implementation');
  }
  let optionalHeaders = normalizeHeaders(headers);

  let request = async (pathname, init) => {
    let response = await fetchImpl(`${origin}${pathname}`, init);
    return requireResponse(response, pathname);
  };

  let readiness = async () => {
    let response = await request('/readyz', {
      method: 'GET',
      redirect: 'error',
      headers: {
        accept: 'application/json',
        ...optionalHeaders,
      },
    });
    return validateReadiness(await readJson(response, '/readyz'));
  };

  let synthesize = async (value) => {
    let item = normalizeSynthesisItem(value);
    let response = await request('/synthesize', {
      method: 'POST',
      redirect: 'error',
      headers: {
        accept: 'audio/wav',
        'content-type': 'application/json',
        ...optionalHeaders,
      },
      body: JSON.stringify({ model: synthesisModel, items: [item] }),
    });
    requireContentType(response, ['audio/wav', 'audio/x-wav'], '/synthesize');
    let durationSec = parsePositiveHeader(
      requireHeader(response, 'x-audio-duration-sec', '/synthesize'),
      'synthesis duration',
    );
    let sampleRate = parsePositiveIntegerHeader(
      requireHeader(response, 'x-audio-sample-rate', '/synthesize'),
      'synthesis sample rate',
    );
    let encodedReceipt = requireHeader(response, 'x-audio-receipt', '/synthesize');
    if (typeof response.arrayBuffer !== 'function') {
      invalid('CV Show model service synthesis response cannot decode WAV bytes');
    }
    let responseBuffer = await response.arrayBuffer();
    let wav = Buffer.from(new Uint8Array(responseBuffer));
    let wavHeader = parseWav(wav);
    if (
      wavHeader.sampleRate !== sampleRate
      || Math.abs(wavHeader.durationSec - durationSec) > 0.0000005
    ) {
      invalid('CV Show model service synthesis headers do not match the WAV bytes');
    }
    let receipt = validateReceipt({
      receipt: decodeReceipt(encodedReceipt),
      item,
      wav,
      durationSec,
      sampleRate,
    });
    return Object.freeze({
      wavBytes: Buffer.from(wav),
      durationSec,
      sampleRate,
      receipt,
    });
  };

  let transcribe = async (value) => {
    requireExactKeys(value, ['wavBytes', 'language'], 'transcription input');
    let bytes = copyRequestBytes(value.wavBytes);
    parseWav(bytes);
    let language = requireNormalizedString(value.language, 'transcription language');
    let response = await request('/transcribe', {
      method: 'POST',
      redirect: 'error',
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
        ...optionalHeaders,
      },
      body: JSON.stringify({
        audioRef: `sha256:${sha256(bytes)}`,
        audioBase64: bytes.toString('base64'),
        mimeType: 'audio/wav',
        language,
        model: 'large-v3-turbo',
      }),
    });
    return validateTranscript(await readJson(response, '/transcribe'));
  };

  return Object.freeze({ readiness, synthesize, transcribe });
}
