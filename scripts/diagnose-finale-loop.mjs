/**
 * Diagnostic: run the finale segment in a real browser and capture what
 * triggers the "Повторяю шаг…" retry loop.
 *
 * Usage: node scripts/diagnose-finale-loop.mjs
 */
import { spawn } from 'node:child_process';
import { createReadStream } from 'node:fs';
import { createServer } from 'node:http';
import { mkdtemp, readFile, rm, stat } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import WebSocket from 'ws';

const ROOT = path.resolve(fileURLToPath(new URL('..', import.meta.url)));
const DIST_DIR = path.join(ROOT, 'dist');
const CHROME_PATH = process.env.CV_CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
  '.mp3': 'audio/mpeg',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.woff2': 'font/woff2',
};

function getMimeType(filePath) {
  return MIME[path.extname(filePath).toLowerCase()] || 'application/octet-stream';
}

function safeDistPath(url) {
  const pathname = new URL(url, 'http://localhost').pathname;
  const rel = decodeURIComponent(pathname).replace(/^\/+/, '');
  const full = path.join(DIST_DIR, rel);
  return full.startsWith(DIST_DIR) ? full : null;
}

async function fileExists(filePath) {
  try {
    const info = await stat(filePath);
    return info.isFile();
  } catch {
    return false;
  }
}

function startStaticServer() {
  const server = createServer(async (request, response) => {
    try {
      let filePath = safeDistPath(request.url || '/');
      if (!filePath || (!await fileExists(filePath) && !filePath.endsWith('.html'))) {
        filePath = path.join(DIST_DIR, 'index.html');
      }
      if (!await fileExists(filePath)) filePath = path.join(DIST_DIR, 'index.html');
      const headers = {
        'content-type': getMimeType(filePath),
        'cache-control': 'no-store',
      };
      response.writeHead(200, headers);
      createReadStream(filePath).pipe(response);
    } catch (error) {
      response.writeHead(500).end(String(error?.stack || error));
    }
  });
  return new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', () => {
      server.off('error', reject);
      resolve({
        origin: `http://127.0.0.1:${server.address().port}`,
        close: () => new Promise((done) => server.close(done)),
      });
    });
  });
}

async function launchChrome() {
  const userDataDir = await mkdtemp(path.join(tmpdir(), 'cv-diagnose-chrome-'));
  const chrome = spawn(CHROME_PATH, [
    '--headless=new',
    '--remote-debugging-port=0',
    '--autoplay-policy=no-user-gesture-required',
    '--disable-background-networking',
    '--disable-default-apps',
    '--disable-extensions',
    '--disable-features=Translate',
    '--disable-sync',
    '--metrics-recording-only',
    '--no-first-run',
    '--window-size=1440,900',
    `--user-data-dir=${userDataDir}`,
    'about:blank',
  ], { stdio: ['ignore', 'pipe', 'pipe'] });

  const activePortFile = path.join(userDataDir, 'DevToolsActivePort');
  const start = Date.now();
  while (Date.now() - start < 30_000) {
    if (await fileExists(activePortFile)) break;
    await new Promise((r) => setTimeout(r, 50));
  }
  const [port] = (await readFile(activePortFile, 'utf8')).trim().split('\n');
  return {
    port,
    async close() {
      chrome.kill('SIGTERM');
      await new Promise((resolve) => {
        if (chrome.exitCode !== null) resolve();
        else chrome.once('exit', resolve);
      });
      await rm(userDataDir, { force: true, recursive: true });
    },
  };
}

async function openPage(port, url) {
  const response = await fetch(`http://127.0.0.1:${port}/json`);
  const targets = await response.json();
  const page = targets.find((t) => t.type === 'page');
  if (!page) throw new Error('No page target');
  const socket = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => {
    socket.once('open', resolve);
    socket.once('error', reject);
  });

  let nextId = 1;
  const pending = new Map();
  const consoleMessages = [];
  socket.on('message', (data) => {
    const message = JSON.parse(String(data));
    if (message.id && pending.has(message.id)) {
      const { resolve: res, reject: rej } = pending.get(message.id);
      pending.delete(message.id);
      if (message.error) rej(new Error(message.error.message));
      else res(message.result || {});
      return;
    }
    if (message.method === 'Runtime.consoleAPICalled') {
      const text = (message.params?.args || [])
        .map((arg) => arg.value !== undefined ? String(arg.value) : (arg.description || ''))
        .join(' ');
      consoleMessages.push(`[${message.params?.type}] ${text}`);
    }
    if (message.method === 'Runtime.exceptionThrown') {
      const ex = message.params?.exceptionDetails;
      consoleMessages.push(`[EXCEPTION] ${ex?.text || ''} ${ex?.exception?.description || ''}`.trim());
    }
  });

  const send = (method, params = {}) => {
    const id = nextId++;
    socket.send(JSON.stringify({ id, method, params }));
    return new Promise((resolve, reject) => {
      pending.set(id, { resolve, reject });
      setTimeout(() => {
        if (pending.has(id)) {
          pending.delete(id);
          reject(new Error(`CDP timeout: ${method}`));
        }
      }, 30_000).unref?.();
    });
  };

  await send('Runtime.enable');
  await send('Page.enable');
  await send('Page.navigate', { url });
  return { send, consoleMessages, close: () => socket.close() };
}

async function evaluate(page, expression) {
  const result = await page.send('Runtime.evaluate', {
    expression,
    awaitPromise: true,
    returnByValue: true,
  });
  return result.result?.value;
}

const server = await startStaticServer();
console.log('Server:', server.origin);
const chrome = await launchChrome();
console.log('Chrome launched on port', chrome.port);

try {
  const page = await openPage(chrome.port, 'about:blank');

  // Instrument the player prototype BEFORE the page loads, so every
  // #scheduleSceneRetry / #recordAlignedSeekFailure logs to console via the
  // exported debug hooks. But private methods can't be hooked from outside;
  // instead we listen to the DOM events the player already dispatches:
  //   portfolio-show-aligned-seek-failure  -> { requestId, entryId, receipt }
  //   portfolio-show-complete              -> { reason, routeState }
  //   portfolio-show-stop                  -> { reason, routeState }
  // Start DIRECTLY at finale and play it through to natural completion.
  const url = `${server.origin}/?showMode=short&showEntry=finale&showTime=0&showPlay=1`;
  await page.send('Page.addScriptToEvaluateOnNewDocument', {
    source: `
      window.__cvDiag = { events: [] };
      const log = (name) => (event) => {
        window.__cvDiag.events.push({
          t: Date.now(),
          name,
          detail: JSON.parse(JSON.stringify(event.detail || {}, (k, v) =>
            typeof v === 'object' && v !== null && k === 'domException' ? undefined : v)),
        });
      };
      for (const name of [
        'portfolio-show-aligned-seek-failure',
        'portfolio-show-complete',
        'portfolio-show-stop',
        'portfolio-show-aligned-generation',
        'portfolio-show-aligned-reset',
        'portfolio-show-scene-setup',
        'portfolio-show-presentation-receipt',
      ]) {
        document.addEventListener(name, log(name), true);
      }
    `,
  });
  await page.send('Page.navigate', { url });

  // Wait for the show to become ready and running.
  const deadline = Date.now() + 120_000;
  let completedEventCount = 0;
  let lastCompletedCount = 0;
  let lastState = null;
  let lastLog = 0;
  while (Date.now() < deadline) {
    const state = await evaluate(page, `(() => {
      const player = document.querySelector('portfolio-show-chat');
      if (!player) return { ready: false };
      const $ = player.$ || {};
      return {
        ready: $.isReady,
        running: $.isRunning,
        paused: $.isPaused,
        error: $.isError,
        errorText: $.errorText || '',
        statusText: $.statusText || '',
        route: player.routeSnapshot || null,
        systemMessages: Array.from(document.querySelectorAll('[data-dx-id] .system, .system'))
          .map((n) => n.textContent).filter(Boolean).slice(-5),
        retryCount: window.__cvDiag.events.filter((e) => e.name === 'portfolio-show-aligned-seek-failure').length,
        completed: window.__cvDiag.events.some((e) => e.name === 'portfolio-show-complete'),
        stopped: window.__cvDiag.events.filter((e) => e.name === 'portfolio-show-stop').length,
      };
    })()`);
    if (JSON.stringify(state) !== JSON.stringify(lastState)) {
      console.log(`[${((Date.now() - (deadline - 120_000)) / 1000).toFixed(1)}s]`, JSON.stringify(state));
      lastLog = Date.now();
      lastState = state;
    }
    completedEventCount = state.completed ? completedEventCount : 0;
    if (state.completed && state.running === false) {
      // Give it a few extra seconds to prove it doesn't start again.
      await new Promise((r) => setTimeout(r, 8_000));
      const after = await evaluate(page, `(() => {
        const player = document.querySelector('portfolio-show-chat');
        const $ = player?.$ || {};
        return {
          running: $.isRunning,
          paused: $.isPaused,
          statusText: $.statusText || '',
          retryMessages: Array.from(document.querySelectorAll('agent-dock-shell'))
            .map((d) => d.textContent?.includes('Повторяю шаг') || false),
          events: window.__cvDiag.events.slice(-8).map((e) => e.name),
        };
      })()`);
      console.log('\n=== SHOW COMPLETED ===', JSON.stringify(after, null, 2));
      break;
    }
    if (state.retryCount >= 3 || (state.error && state.errorText)) {
      console.log('\n=== RETRY DETECTED / ERROR ===');
      break;
    }
    await new Promise((r) => setTimeout(r, 500));
  }

  console.log('\n=== EVENTS (last 20) ===');
  const events = await evaluate(page, 'window.__cvDiag.events.slice(-20)');
  for (const e of events || []) {
    console.log(new Date(e.t).toISOString().slice(14, 23), e.name, JSON.stringify(e.detail).slice(0, 300));
  }

  const failures = await evaluate(page, `
    window.__cvDiag.events.filter((e) => e.name === 'portfolio-show-aligned-seek-failure')
      .map((e) => JSON.stringify(e.detail, null, 2))
  `);
  if (failures?.length) {
    console.log('\n=== SEEK FAILURES ===');
    for (const f of failures) console.log(f);
  }

  console.log('\n=== CONSOLE MESSAGES (last 30) ===');
  for (const line of page.consoleMessages.slice(-30)) console.log(line);
} finally {
  await chrome.close();
  await server.close();
}
