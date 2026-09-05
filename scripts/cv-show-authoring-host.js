import { createHash, randomBytes, randomUUID, timingSafeEqual } from 'node:crypto';
import { createReadStream } from 'node:fs';
import {
  readFile,
  stat,
} from 'node:fs/promises';
import http from 'node:http';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

import { jsBuild } from 'jsda-kit/server/build-asset.js';
import { canonicalize, computeIntegrity } from 'symbiote-workspace/schema/canonical-json.js';

import {
  createCvShowAuthoringSnapshotIdentity,
  normalizeCvShowAuthoringSnapshot,
} from '../src/static-pages/js/tour-player/cvShowAuthoringAuthority.js';
import {
  createCvShowMediaBindingRegistry,
} from '../src/static-pages/js/tour-player/presentationProjectAdapter.js';
import {
  acquireCvShowAuthoringLock,
  createCvShowAuthoringDraftEnvelope,
  createCvShowAuthoringStorage,
} from './cv-show-authoring-storage.js';

const LOOPBACK_ADDRESS = '127.0.0.1';
const COOKIE_NAME = 'cv-show-authoring';
const SESSION_SCHEMA_VERSION = 'cv-show-authoring-host-session-v1';
const TRANSACTION_SCHEMA_VERSION = 'cv-show-authoring-host-transaction-v1';
const TRANSACTION_RESPONSE_VERSION = 'cv-show-authoring-host-transaction-response-v1';
const ERROR_SCHEMA_VERSION = 'cv-show-authoring-host-error-v1';
const MAX_JSON_BYTES = 2_000_000;
const SOURCE_RELATIVE_PATH = 'src/static-pages/data/cvShowPresentationProject.js';
const LOCAL_CLIENT_RELATIVE_PATH = 'src/static-pages/js/tour-player/localAuthoringClient.js';
const MIME_TYPES = Object.freeze({
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.jpeg': 'image/jpeg',
  '.jpg': 'image/jpeg',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.opus': 'audio/ogg',
  '.pdf': 'application/pdf',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.ttf': 'font/ttf',
  '.wav': 'audio/wav',
  '.webp': 'image/webp',
});

function fail(code, message, details = {}, statusCode = 400) {
  throw Object.assign(new Error(message), { code, details, statusCode });
}

function sha256(value) {
  return `sha256:${createHash('sha256').update(value).digest('hex')}`;
}

function exactObject(value, fields) {
  return Boolean(value)
    && typeof value === 'object'
    && !Array.isArray(value)
    && Object.keys(value).length === fields.length
    && fields.every((field) => Object.hasOwn(value, field));
}

function validFullBase(value) {
  return exactObject(value, [
    'revision',
    'authoringProjectHash',
    'snapshotIdentity',
  ])
    && Number.isInteger(value.revision)
    && typeof value.authoringProjectHash === 'string'
    && value.authoringProjectHash.length > 0
    && typeof value.snapshotIdentity === 'string'
    && value.snapshotIdentity.length > 0;
}

function sameBase(left, right) {
  return validFullBase(left)
    && validFullBase(right)
    && left.revision === right.revision
    && left.authoringProjectHash === right.authoringProjectHash
    && left.snapshotIdentity === right.snapshotIdentity;
}

function safeError(error) {
  let code = typeof error?.code === 'string' && /^[A-Z][A-Z0-9_]+$/u.test(error.code)
    ? error.code
    : 'CV_SHOW_AUTHORING_HOST_FAILED';
  let statusCode = Number.isInteger(error?.statusCode) ? error.statusCode : 500;
  let message = statusCode >= 500
    ? 'CV Show authoring host operation failed'
    : String(error?.message || 'CV Show authoring request failed').slice(0, 240);
  let details = statusCode < 500 && error?.details && typeof error.details === 'object'
    ? structuredClone(error.details)
    : {};
  return { code, message, details, statusCode };
}

function sendJson(response, statusCode, value) {
  let body = JSON.stringify(value);
  response.writeHead(statusCode, {
    'content-type': 'application/json; charset=utf-8',
    'content-length': Buffer.byteLength(body),
    'cache-control': 'no-store',
    'x-content-type-options': 'nosniff',
  });
  response.end(body);
}

function sendError(response, error) {
  let safe = safeError(error);
  sendJson(response, safe.statusCode, {
    schemaVersion: ERROR_SCHEMA_VERSION,
    status: 'error',
    error: {
      code: safe.code,
      message: safe.message,
      details: safe.details,
    },
  });
}

function parseCookies(value) {
  return Object.fromEntries(String(value || '').split(';').map((entry) => {
    let separator = entry.indexOf('=');
    return separator < 0
      ? [entry.trim(), '']
      : [entry.slice(0, separator).trim(), entry.slice(separator + 1).trim()];
  }).filter(([name]) => name));
}

function sameSecret(left, right) {
  let leftBuffer = Buffer.from(String(left || ''));
  let rightBuffer = Buffer.from(String(right || ''));
  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
}

async function readJsonBody(request) {
  if (request.headers['content-type'] !== 'application/json') {
    fail(
      'CV_SHOW_AUTHORING_CONTENT_TYPE_INVALID',
      'CV Show authoring requests require exact application/json',
      { mutated: false },
      415,
    );
  }
  let chunks = [];
  let bytes = 0;
  let oversized = false;
  for await (let chunk of request) {
    bytes += chunk.length;
    if (bytes > MAX_JSON_BYTES) {
      oversized = true;
      chunks = [];
    } else if (!oversized) {
      chunks.push(chunk);
    }
  }
  if (oversized) {
    fail(
      'CV_SHOW_AUTHORING_BODY_OVERSIZED',
      'CV Show authoring request body is too large',
      { mutated: false, maxBytes: MAX_JSON_BYTES },
      413,
    );
  }
  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8'));
  } catch {
    fail(
      'CV_SHOW_AUTHORING_JSON_INVALID',
      'CV Show authoring request body is malformed JSON',
      { mutated: false },
      400,
    );
  }
}

function sourceBaseFor(project, sourceBytes) {
  return Object.freeze({
    revision: project.revision,
    authoringProjectHash: project.hash,
    sourceSha256: sha256(sourceBytes),
  });
}

function fullBase(snapshot, identity) {
  return Object.freeze({
    revision: snapshot.project.revision,
    authoringProjectHash: snapshot.project.hash,
    snapshotIdentity: identity.snapshot,
  });
}

function collectionIdentity(snapshot, identity) {
  return Object.freeze({
    schemaVersion: snapshot.mediaCollection.schemaVersion,
    collectionId: snapshot.mediaCollection.collectionId,
    manifestHash: snapshot.mediaCollection.manifestHash,
    identity: identity.media,
  });
}

async function loadSource(repoRoot) {
  let sourcePath = path.join(repoRoot, SOURCE_RELATIVE_PATH);
  let sourceBytes = await readFile(sourcePath);
  let sourceUrl = `${pathToFileURL(sourcePath).href}?cv-authoring-host=${randomUUID()}`;
  let sourceModule = await import(sourceUrl);
  let project = sourceModule.CV_SHOW_PRESENTATION_PROJECT;
  let snapshot = normalizeCvShowAuthoringSnapshot({ project });
  let identity = createCvShowAuthoringSnapshotIdentity(snapshot);
  return {
    snapshot,
    identity,
    sourceBase: sourceBaseFor(project, sourceBytes),
  };
}

function findAssetQuery(html) {
  let match = html.match(/<script\b[^>]*\bsrc=(?:['"])?(?:\.\/)?js\/index\.js(\?[^'"\s>]*)/iu);
  return match?.[1] || '';
}

function injectBootstrap(html) {
  let tag = `<script type="module" src="/__cv-authoring/bootstrap.js${findAssetQuery(html)}"></script>`;
  return html.includes('</body>') ? html.replace('</body>', `${tag}</body>`) : `${html}${tag}`;
}

function bootstrapSource(search) {
  let moduleUrl = `/__cv-authoring/client.js${search}`;
  return [
    `let { enableLocalCvShowAuthoring } = await import(${JSON.stringify(moduleUrl)});`,
    'await enableLocalCvShowAuthoring();',
    '',
  ].join('\n');
}

async function buildLocalAuthoringClient(repoRoot) {
  let entryPath = path.join(repoRoot, LOCAL_CLIENT_RELATIVE_PATH);
  let bundle = await jsBuild(entryPath);
  if (!bundle.trim()) {
    fail(
      'CV_SHOW_AUTHORING_CLIENT_BUILD_INVALID',
      'CV Show local authoring client build produced no JavaScript; verify the host-only entrypoint',
      {},
      500,
    );
  }
  return bundle;
}

function resolveByteRange(value, size) {
  if (typeof value !== 'string') return null;
  if (!value.startsWith('bytes=') || value.includes(',')) return null;
  let match = value.match(/^bytes=(\d*)-(\d*)$/u);
  if (!match || !match[1] && !match[2]) return { unsatisfiable: true };
  if (!match[1]) {
    let suffixLength = Number(match[2]);
    if (!Number.isSafeInteger(suffixLength) || suffixLength <= 0 || size === 0) {
      return { unsatisfiable: true };
    }
    return {
      start: Math.max(0, size - suffixLength),
      end: size - 1,
    };
  }
  let start = Number(match[1]);
  let requestedEnd = match[2] ? Number(match[2]) : size - 1;
  if (
    !Number.isSafeInteger(start)
    || !Number.isSafeInteger(requestedEnd)
    || start >= size
    || requestedEnd < start
  ) return { unsatisfiable: true };
  return { start, end: Math.min(requestedEnd, size - 1) };
}

async function resolveStaticFile(distDir, pathname) {
  let relative = pathname === '/cv/' ? 'index.html' : pathname.slice('/cv/'.length);
  let candidate = path.resolve(distDir, relative);
  let relativeToDist = path.relative(distDir, candidate);
  if (relativeToDist.startsWith('..') || path.isAbsolute(relativeToDist)) {
    fail('CV_SHOW_AUTHORING_STATIC_NOT_FOUND', 'CV Show authoring asset was not found', {}, 404);
  }
  let fileStat;
  try {
    fileStat = await stat(candidate);
    if (fileStat.isDirectory()) {
      candidate = path.join(candidate, 'index.html');
      fileStat = await stat(candidate);
    }
  } catch {
    fail('CV_SHOW_AUTHORING_STATIC_NOT_FOUND', 'CV Show authoring asset was not found', {}, 404);
  }
  if (!fileStat.isFile()) {
    fail('CV_SHOW_AUTHORING_STATIC_NOT_FOUND', 'CV Show authoring asset was not found', {}, 404);
  }
  return { path: candidate, size: fileStat.size };
}

export async function startCvShowAuthoringHost({
  repoRoot,
  distDir = path.join(repoRoot, 'dist'),
  storageRoot = path.join(repoRoot, 'tmp', 'cv-show-authoring'),
  port = 4173,
} = {}) {
  if (!path.isAbsolute(repoRoot) || !path.isAbsolute(distDir) || !path.isAbsolute(storageRoot)) {
    fail('CV_SHOW_AUTHORING_HOST_CONFIG_INVALID', 'CV Show authoring host roots must be absolute');
  }
  let lock = await acquireCvShowAuthoringLock({ storageRoot, owner: 'host' });
  let server;
  try {
    let source = await loadSource(repoRoot);
    let localClientBundle = await buildLocalAuthoringClient(repoRoot);
    let storage = createCvShowAuthoringStorage({ storageRoot });
    let secret = randomBytes(32).toString('base64url');
    let sessionId = `cv-show-${randomBytes(24).toString('base64url')}`;
    let expectedHost = '';
    let expectedOrigin = '';
    let transactionQueue = Promise.resolve();

    let readCurrent = async () => {
      let head = await storage.readLatestHead();
      if (
        head
        && (
          head.sourceBase?.revision !== source.sourceBase.revision
          || head.sourceBase?.authoringProjectHash !== source.sourceBase.authoringProjectHash
          || head.sourceBase?.sourceSha256 !== source.sourceBase.sourceSha256
        )
      ) head = null;
      if (!head) {
        return {
          draftHash: null,
          snapshot: source.snapshot,
          identity: source.identity,
          base: fullBase(source.snapshot, source.identity),
          dirty: false,
          materialized: false,
        };
      }
      return {
        draftHash: head.draftHash,
        snapshot: head.snapshot,
        identity: head.snapshotIdentity,
        base: head.base,
        dirty: true,
        materialized: false,
      };
    };

    let authorizeRequest = (request, { mutation = false } = {}) => {
      if (request.headers.host !== expectedHost) {
        fail('CV_SHOW_AUTHORING_HOST_INVALID', 'CV Show authoring requires the exact loopback Host', {}, 403);
      }
      let origin = request.headers.origin;
      if (origin && origin !== expectedOrigin || mutation && origin !== expectedOrigin) {
        fail('CV_SHOW_AUTHORING_ORIGIN_INVALID', 'CV Show authoring Origin is invalid', {}, 403);
      }
      let cookie = parseCookies(request.headers.cookie)[COOKIE_NAME];
      if (!sameSecret(cookie, secret)) {
        fail('CV_SHOW_AUTHORING_COOKIE_REQUIRED', 'CV Show authoring capability cookie is required', {}, 401);
      }
    };

    let handleSession = async (request, response) => {
      authorizeRequest(request);
      if (request.method !== 'GET') {
        fail('CV_SHOW_AUTHORING_METHOD_INVALID', 'CV Show authoring session requires GET', {}, 405);
      }
      let current = await readCurrent();
      sendJson(response, 200, {
        schemaVersion: SESSION_SCHEMA_VERSION,
        status: 'authorized',
        sessionId,
        sourceBase: source.sourceBase,
        base: current.base,
        identity: current.identity,
        snapshot: current.snapshot,
        dirty: current.dirty,
        materialized: current.materialized,
      });
    };

    let commitTransaction = async (body) => {
      if (!exactObject(body, [
        'schemaVersion',
        'sessionId',
        'base',
        'candidateSnapshotIdentity',
        'snapshot',
      ]) || body.schemaVersion !== TRANSACTION_SCHEMA_VERSION) {
        fail(
          'CV_SHOW_AUTHORING_TRANSACTION_INVALID',
          'CV Show authoring transaction envelope is invalid',
          { mutated: false },
        );
      }
      if (body.sessionId !== sessionId) {
        fail(
          'CV_SHOW_AUTHORING_SESSION_INVALID',
          'CV Show authoring transaction session is invalid',
          { mutated: false },
          403,
        );
      }
      if (!validFullBase(body.base)) {
        fail(
          'CV_SHOW_AUTHORING_TRANSACTION_INVALID',
          'CV Show authoring transaction base is invalid',
          { mutated: false },
        );
      }
      let current = await readCurrent();
      if (!sameBase(body.base, current.base)) {
        fail(
          'CV_SHOW_AUTHORING_STALE',
          'CV Show authoring transaction base is stale',
          { mutated: false, currentBase: current.base },
          409,
        );
      }
      let snapshot;
      try {
        snapshot = normalizeCvShowAuthoringSnapshot(body.snapshot);
      } catch {
        fail(
          'CV_SHOW_AUTHORING_TRANSACTION_INVALID',
          'CV Show authoring transaction snapshot is invalid',
          { mutated: false },
        );
      }
      if (canonicalize(body.snapshot) !== canonicalize(snapshot)) {
        fail(
          'CV_SHOW_AUTHORING_TRANSACTION_INVALID',
          'CV Show authoring transaction snapshot is not fully normalized',
          { mutated: false },
        );
      }
      let identity = createCvShowAuthoringSnapshotIdentity(snapshot);
      if (body.candidateSnapshotIdentity !== identity.snapshot) {
        fail(
          'CV_SHOW_AUTHORING_TRANSACTION_INVALID',
          'CV Show authoring candidate identity is invalid',
          { mutated: false },
        );
      }
      if (identity.snapshot === current.identity.snapshot) {
        fail(
          'CV_SHOW_AUTHORING_TRANSACTION_NOOP',
          'CV Show authoring transaction cannot commit an exact no-op',
          { mutated: false },
          409,
        );
      }
      let sameProject = snapshot.project.revision === current.snapshot.project.revision
        && snapshot.project.hash === current.snapshot.project.hash;
      let projectAdvanced = snapshot.project.revision === current.snapshot.project.revision + 1
        && snapshot.project.hash !== current.snapshot.project.hash;
      if (!sameProject && !projectAdvanced) {
        fail(
          'CV_SHOW_AUTHORING_TRANSACTION_INVALID',
          'CV Show Project transaction must preserve or advance exactly one revision',
          { mutated: false },
        );
      }
      let base = fullBase(snapshot, identity);
      let registry = createCvShowMediaBindingRegistry(
        snapshot.project,
        snapshot.mediaCollection,
      );
      if (Object.keys(registry.entries).length !== 30) {
        fail(
          'CV_SHOW_AUTHORING_TRANSACTION_INVALID',
          'CV Show authoring transaction requires all 30 media entries',
          { mutated: false },
        );
      }
      let draft = createCvShowAuthoringDraftEnvelope({
        sourceBase: source.sourceBase,
        previousDraftHash: current.draftHash,
        snapshot,
        snapshotIdentity: identity,
        base,
        collectionIdentity: collectionIdentity(snapshot, identity),
        mediaRegistryHash: `cv-show-media-binding-registry-v1:${computeIntegrity(registry)}`,
      });
      await storage.commit(sessionId, draft);
      return {
        schemaVersion: TRANSACTION_RESPONSE_VERSION,
        status: 'committed',
        sessionId,
        previousDraftHash: current.draftHash,
        draftHash: draft.draftHash,
        candidateSnapshotIdentity: body.candidateSnapshotIdentity,
        snapshotIdentity: identity,
        snapshot,
        base,
        dirty: true,
        materialized: false,
      };
    };

    let handleTransaction = async (request, response) => {
      authorizeRequest(request, { mutation: true });
      if (request.method !== 'POST') {
        fail('CV_SHOW_AUTHORING_METHOD_INVALID', 'CV Show authoring transaction requires POST', {}, 405);
      }
      let body = await readJsonBody(request);
      let pending = transactionQueue.then(() => commitTransaction(body));
      transactionQueue = pending.catch(() => undefined);
      sendJson(response, 200, await pending);
    };

    let handleStatic = async (request, response, url) => {
      if (request.method !== 'GET' && request.method !== 'HEAD') {
        fail('CV_SHOW_AUTHORING_METHOD_INVALID', 'CV Show authoring static assets require GET', {}, 405);
      }
      let file = await resolveStaticFile(distDir, url.pathname);
      let extension = path.extname(file.path).toLowerCase();
      if (extension === '.html') {
        let html = injectBootstrap(await readFile(file.path, 'utf8'));
        let body = request.method === 'HEAD' ? '' : html;
        response.writeHead(200, {
          'content-type': MIME_TYPES['.html'],
          'content-length': request.method === 'HEAD' ? Buffer.byteLength(html) : Buffer.byteLength(body),
          'set-cookie': `${COOKIE_NAME}=${secret}; HttpOnly; SameSite=Strict; Path=/`,
          'cache-control': 'no-store',
          'x-content-type-options': 'nosniff',
        });
        response.end(body);
        return;
      }
      if (request.method === 'HEAD') {
        response.writeHead(200, {
          'content-type': MIME_TYPES[extension] || 'application/octet-stream',
          'content-length': file.size,
          'accept-ranges': 'bytes',
          'x-content-type-options': 'nosniff',
        });
        response.end();
        return;
      }
      let range = resolveByteRange(request.headers.range, file.size);
      if (range?.unsatisfiable) {
        response.writeHead(416, {
          'content-range': `bytes */${file.size}`,
          'content-length': 0,
          'accept-ranges': 'bytes',
          'x-content-type-options': 'nosniff',
        });
        response.end();
        return;
      }
      if (range) {
        response.writeHead(206, {
          'content-type': MIME_TYPES[extension] || 'application/octet-stream',
          'content-range': `bytes ${range.start}-${range.end}/${file.size}`,
          'content-length': range.end - range.start + 1,
          'accept-ranges': 'bytes',
          'x-content-type-options': 'nosniff',
        });
        createReadStream(file.path, range).pipe(response);
        return;
      }
      response.writeHead(200, {
        'content-type': MIME_TYPES[extension] || 'application/octet-stream',
        'content-length': file.size,
        'accept-ranges': 'bytes',
        'x-content-type-options': 'nosniff',
      });
      createReadStream(file.path).pipe(response);
    };

    server = http.createServer(async (request, response) => {
      try {
        if (request.headers.host !== expectedHost) {
          fail('CV_SHOW_AUTHORING_HOST_INVALID', 'CV Show authoring requires the exact loopback Host', {}, 403);
        }
        if (request.headers.origin && request.headers.origin !== expectedOrigin) {
          fail('CV_SHOW_AUTHORING_ORIGIN_INVALID', 'CV Show authoring Origin is invalid', {}, 403);
        }
        let url = new URL(request.url || '/', expectedOrigin);
        if (url.pathname === '/__cv-authoring/api/session') {
          await handleSession(request, response);
        } else if (url.pathname === '/__cv-authoring/api/transact') {
          await handleTransaction(request, response);
        } else if (url.pathname === '/__cv-authoring/bootstrap.js') {
          authorizeRequest(request);
          if (request.method !== 'GET') {
            fail('CV_SHOW_AUTHORING_METHOD_INVALID', 'CV Show authoring bootstrap requires GET', {}, 405);
          }
          let body = bootstrapSource(url.search);
          response.writeHead(200, {
            'content-type': MIME_TYPES['.js'],
            'content-length': Buffer.byteLength(body),
            'cache-control': 'no-store',
            'x-content-type-options': 'nosniff',
          });
          response.end(body);
        } else if (url.pathname === '/__cv-authoring/client.js') {
          authorizeRequest(request);
          if (request.method !== 'GET') {
            fail('CV_SHOW_AUTHORING_METHOD_INVALID', 'CV Show authoring client requires GET', {}, 405);
          }
          response.writeHead(200, {
            'content-type': MIME_TYPES['.js'],
            'content-length': Buffer.byteLength(localClientBundle),
            'cache-control': 'no-store',
            'x-content-type-options': 'nosniff',
          });
          response.end(localClientBundle);
        } else if (url.pathname === '/') {
          response.writeHead(302, { location: '/cv/' });
          response.end();
        } else if (url.pathname.startsWith('/cv/')) {
          await handleStatic(request, response, url);
        } else {
          fail('CV_SHOW_AUTHORING_NOT_FOUND', 'CV Show authoring resource was not found', {}, 404);
        }
      } catch (error) {
        if (!response.headersSent) sendError(response, error);
        else response.destroy();
      }
    });
    server.on('clientError', (_error, socket) => {
      socket.end('HTTP/1.1 400 Bad Request\r\nConnection: close\r\n\r\n');
    });
    await new Promise((resolve, reject) => {
      server.once('error', reject);
      server.listen(port, LOOPBACK_ADDRESS, resolve);
    });
    let address = server.address();
    expectedHost = `${LOOPBACK_ADDRESS}:${address.port}`;
    expectedOrigin = `http://${expectedHost}`;
    let closed = false;
    let close = async () => {
      if (closed) return;
      closed = true;
      await new Promise((resolve, reject) => server.close((error) => (
        error ? reject(error) : resolve()
      )));
      await lock.release();
    };
    return Object.freeze({ origin: expectedOrigin, sessionId, close });
  } catch (error) {
    if (server) await new Promise((resolve) => server.close(() => resolve()));
    await lock.release();
    throw error;
  }
}
