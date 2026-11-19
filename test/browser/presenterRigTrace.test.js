import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { createReadStream } from 'node:fs';
import { access, mkdtemp, readFile, rm, stat, writeFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

import WebSocket from 'ws';

import { checkRigTrace } from '../../src/static-pages/js/show-log/rigInvariants.js';

/**
 * Plays the CV Show in real Chrome with the flying presenter robot, records the
 * show log (robot state + DOM probe of the selection frame) and checks the
 * robot invariants on the recorded coordinates and timings.
 *
 * Needs a built `dist/` and Chrome (CV_CHROME_PATH). The run lasts about a
 * minute of real time: CV_SHOW_TRACE_SECONDS, CV_SHOW_TRACE_START_MS.
 */

const ROOT = path.resolve(fileURLToPath(new URL('../..', import.meta.url)));
const DIST_DIR = path.join(ROOT, 'dist');
const CHROME_PATH = process.env.CV_CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const SECONDS = Number(process.env.CV_SHOW_TRACE_SECONDS || 60);
const START_MS = Number(process.env.CV_SHOW_TRACE_START_MS || 150000);
const ROUTE = '/projects/symbiote-workspace/';

const MIME = new Map([
  ['.html', 'text/html; charset=utf-8'], ['.js', 'text/javascript; charset=utf-8'], ['.css', 'text/css; charset=utf-8'],
  ['.json', 'application/json'], ['.webp', 'image/webp'], ['.png', 'image/png'], ['.svg', 'image/svg+xml'],
  ['.mp3', 'audio/mpeg'], ['.m4a', 'audio/mp4'], ['.ttf', 'font/ttf'], ['.woff2', 'font/woff2'], ['.md', 'text/markdown; charset=utf-8'],
]);

async function exists(file) {
  try { await access(file); return true; } catch { return false; }
}

function startStaticServer() {
  const server = createServer(async (request, response) => {
    try {
      const url = new URL(request.url, 'http://localhost');
      let file = path.normalize(path.join(DIST_DIR, decodeURIComponent(url.pathname)));
      if (!file.startsWith(DIST_DIR)) { response.writeHead(403).end(); return; }
      if (!(await exists(file)) || (await stat(file)).isDirectory()) file = path.join(file, 'index.html');
      if (!(await exists(file))) { response.writeHead(404).end(); return; }
      const { size } = await stat(file);
      const type = MIME.get(path.extname(file)) || 'application/octet-stream';
      const range = /^bytes=(\d*)-(\d*)$/u.exec(request.headers.range || '');
      if (range) {
        const start = range[1] ? Number(range[1]) : 0;
        const end = range[2] ? Number(range[2]) : size - 1;
        response.writeHead(206, { 'content-type': type, 'accept-ranges': 'bytes', 'content-range': `bytes ${start}-${end}/${size}`, 'content-length': end - start + 1 });
        createReadStream(file, { start, end }).pipe(response);
        return;
      }
      response.writeHead(200, { 'content-type': type, 'accept-ranges': 'bytes', 'content-length': size });
      createReadStream(file).pipe(response);
    } catch (error) {
      response.writeHead(500).end(String(error?.message || error));
    }
  });
  return new Promise((resolve) => server.listen(0, '127.0.0.1', () => resolve(server)));
}

async function launchChrome(profileDir) {
  const child = spawn(CHROME_PATH, [
    '--headless=new', '--remote-debugging-port=0', `--user-data-dir=${profileDir}`,
    '--no-first-run', '--no-default-browser-check', '--autoplay-policy=no-user-gesture-required',
    '--window-size=1440,900', 'about:blank',
  ], { stdio: 'ignore' });
  const portFile = path.join(profileDir, 'DevToolsActivePort');
  for (let attempt = 0; attempt < 120; attempt++) {
    if (await exists(portFile)) return { child, port: Number((await readFile(portFile, 'utf8')).split('\n')[0]) };
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  child.kill();
  throw new Error('Chrome did not expose a DevTools port');
}

async function connect(port) {
  const targets = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
  const page = targets.find((target) => target.type === 'page');
  const socket = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => { socket.once('open', resolve); socket.once('error', reject); });
  let nextId = 0;
  const pending = new Map();
  socket.on('message', (raw) => {
    const message = JSON.parse(String(raw));
    const waiter = pending.get(message.id);
    if (!waiter) return;
    pending.delete(message.id);
    if (message.error) waiter.reject(new Error(message.error.message));
    else waiter.resolve(message.result);
  });
  const send = (method, params = {}) => new Promise((resolve, reject) => {
    const id = ++nextId;
    pending.set(id, { resolve, reject });
    socket.send(JSON.stringify({ id, method, params }));
  });
  const evaluate = async (expression) => {
    const result = await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
    if (result.exceptionDetails) throw new Error(result.exceptionDetails.exception?.description || 'evaluate failed');
    return result.result.value;
  };
  return { send, evaluate, close: () => socket.close() };
}

// The probe module is the single source: it runs in the page against the page's log.
async function probeSource() {
  const source = await readFile(path.join(ROOT, 'src/static-pages/js/show-log/probe.js'), 'utf8');
  return source
    .replace(/^import .*$/mu, 'const getShowLog = () => window.__cvShowLog;')
    .replace('export function startShowProbe', 'function startShowProbe');
}

test('the presenter robot keeps its invariants while the show selects text', { timeout: (SECONDS + 120) * 1000 }, async (t) => {
  if (!(await exists(CHROME_PATH))) { t.skip(`Chrome not found: ${CHROME_PATH}`); return; }
  if (!(await exists(path.join(DIST_DIR, 'index.html')))) { t.skip('dist/ is not built'); return; }

  const profileDir = await mkdtemp(path.join(tmpdir(), 'cv-rig-trace-'));
  const server = await startStaticServer();
  const { child, port } = await launchChrome(profileDir);
  const cdp = await connect(port);
  try {
    await cdp.send('Page.enable');
    await cdp.send('Page.navigate', { url: `http://127.0.0.1:${server.address().port}${ROUTE}?show=1&showMode=short&showTime=${START_MS}&showPlay=1` });
    for (let attempt = 0; attempt < 120 && !(await cdp.evaluate('Boolean(window.__cvShowLog)')); attempt++) {
      await new Promise((resolve) => setTimeout(resolve, 250));
    }
    assert.equal(await cdp.evaluate('Boolean(window.__cvShowLog)'), true, 'the show log never appeared: the Show did not start');
    await cdp.evaluate(`${await probeSource()}; startShowProbe(); true`);
    await new Promise((resolve) => setTimeout(resolve, SECONDS * 1000));
    const entries = JSON.parse(await cdp.evaluate('JSON.stringify(window.__cvShowLog.entries())'));
    // CV_SHOW_TRACE_DUMP=<file> keeps the whole recorded log for analysis.
    if (process.env.CV_SHOW_TRACE_DUMP) await writeFile(process.env.CV_SHOW_TRACE_DUMP, JSON.stringify(entries));

    const frames = entries.filter((entry) => entry.source === 'probe' && entry.data?.marquee?.shown && entry.data.marquee.width >= 60);
    assert.ok(frames.length > 0, `no selection frame was observed in ${SECONDS}s: the test would prove nothing`);
    const violations = checkRigTrace(entries);
    assert.deepEqual(violations, [], `robot invariants violated:\n${JSON.stringify(violations, null, 2)}`);
  } finally {
    cdp.close();
    // Chrome keeps writing into its profile until it has exited.
    const exited = new Promise((resolve) => child.once('exit', resolve));
    child.kill();
    await exited;
    server.close();
    await rm(profileDir, { recursive: true, force: true, maxRetries: 10, retryDelay: 200 });
  }
});
