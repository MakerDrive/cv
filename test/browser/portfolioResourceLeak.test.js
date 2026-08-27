import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { createReadStream } from 'node:fs';
import { createServer } from 'node:http';
import { mkdir, mkdtemp, readFile, rm, stat, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

import WebSocket from 'ws';
import { encodeCascadeThemeShare } from 'symbiote-ui/themes/cascade-theme-share.js';
import { stripPortfolioArticleBlockMarkers } from '../../src/static-pages/data/portfolioArticleMedia.js';
import { PORTFOLIO_LOCALE_MESSAGES } from '../../src/static-pages/data/portfolioTranslations.js';
import {
  loadProjectContent,
  loadProjectEntries,
} from '../../src/static-pages/data/projects.js';
import { PROJECT_TRANSLATIONS } from '../../src/static-pages/data/projectTranslations.js';
import {
  getPublicationContentPath,
  PUBLICATIONS,
} from '../../src/static-pages/data/publications.js';
import { loadPortfolioMarkdownContent } from '../../src/static-pages/data/markdownContent.js';
import { TOUR_LOCAL_AUDIO_CONFIG } from '../../src/static-pages/data/tourManifest.js';
import { CV_SHOW_STORY } from '../../src/static-pages/data/tourScripts.js';

const ROOT = path.resolve(fileURLToPath(new URL('../..', import.meta.url)));
const DIST_DIR = path.join(ROOT, 'dist');
const CHROME_PATH = process.env.CV_CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const CHROME_LAUNCH_TIMEOUT_MS = Number(process.env.CV_CHROME_LAUNCH_TIMEOUT_MS || 60_000);
const MOBILE_VIEWPORT = Object.freeze({
  width: 390,
  height: 844,
  deviceScaleFactor: 3,
  mobile: true,
});
const DESKTOP_VIEWPORT = Object.freeze({
  width: 1440,
  height: 900,
  deviceScaleFactor: 1,
  mobile: false,
});

const FLAT_ROUTE = '/cv/?mode=flat&resource-test=mobile-flat';
const STRUCTURED_ROUTE = '/cv/?mode=structured&resource-test=mobile-structured';
const AUTOBOX_SPINNER_MEDIA_ID = 'media/autobox-v1/ims/spinner';
const AUTOBOX_SPINNER_FRAGMENT = 'media-media%2Fautobox-v1%2Fims%2Fspinner';
const EXTERNAL_TEST_URL = process.env.CV_RESOURCE_TEST_URL || '';
const VERBOSE_OUTPUT = process.env.CV_RESOURCE_TEST_VERBOSE === '1';
const PROJECTS = loadProjectEntries();
const LOCAL_AUDIO_REVISION = TOUR_LOCAL_AUDIO_CONFIG.audioManifests[
  TOUR_LOCAL_AUDIO_CONFIG.voice
].split('/')[0];
const ALIGNMENT_REVISION = TOUR_LOCAL_AUDIO_CONFIG.alignmentManifest.split('/')[2];

const MIME_TYPES = new Map([
  ['.css', 'text/css; charset=utf-8'],
  ['.html', 'text/html; charset=utf-8'],
  ['.js', 'application/javascript; charset=utf-8'],
  ['.json', 'application/json; charset=utf-8'],
  ['.svg', 'image/svg+xml'],
  ['.wav', 'audio/wav'],
  ['.webp', 'image/webp'],
  ['.xml', 'application/xml; charset=utf-8'],
]);

function getMimeType(filePath) {
  return MIME_TYPES.get(path.extname(filePath)) || 'application/octet-stream';
}

function parseSingleByteRange(value, size) {
  if (!value) return null;
  let fieldValue = value.trim();
  let separatorIndex = fieldValue.indexOf('=');
  if (separatorIndex < 0) {
    return /^bytes\b/i.test(fieldValue) ? { unsatisfiable: true } : null;
  }
  let unit = fieldValue.slice(0, separatorIndex).trim().toLowerCase();
  if (unit !== 'bytes') return null;
  let rangeSpec = fieldValue.slice(separatorIndex + 1).trim();
  if (rangeSpec.includes(',')) return null;
  let match = /^(\d*)-(\d*)$/.exec(rangeSpec);
  if (!match || (!match[1] && !match[2]) || size <= 0) {
    return { unsatisfiable: true };
  }

  if (!match[1]) {
    let suffixLength = Number(match[2]);
    if (!Number.isSafeInteger(suffixLength) || suffixLength <= 0) {
      return { unsatisfiable: true };
    }
    let length = Math.min(suffixLength, size);
    return {
      start: size - length,
      end: size - 1,
      length,
    };
  }

  let start = Number(match[1]);
  let requestedEnd = match[2] ? Number(match[2]) : size - 1;
  if (
    !Number.isSafeInteger(start)
    || !Number.isSafeInteger(requestedEnd)
    || start >= size
    || requestedEnd < start
  ) {
    return { unsatisfiable: true };
  }
  let end = Math.min(requestedEnd, size - 1);
  return { start, end, length: end - start + 1 };
}

function safeDistPath(urlPath) {
  let pathname = decodeURIComponent(new URL(urlPath, 'http://localhost').pathname);
  if (!pathname.startsWith('/cv/')) return null;
  let relativePath = pathname.slice('/cv/'.length);
  if (!relativePath || relativePath.endsWith('/')) relativePath += 'index.html';
  let resolvedPath = path.resolve(DIST_DIR, relativePath);
  return resolvedPath.startsWith(DIST_DIR) ? resolvedPath : null;
}

async function fileExists(filePath) {
  try {
    let info = await stat(filePath);
    return info.isFile();
  } catch {
    return false;
  }
}

function startStaticServer(options = {}) {
  let server = createServer(async (request, response) => {
    try {
      let filePath = safeDistPath(request.url || '/');
      if (!filePath) {
        response.writeHead(404).end('Not found');
        return;
      }
      if (!await fileExists(filePath)) {
        filePath = path.join(DIST_DIR, 'index.html');
      }
      let fileInfo = await stat(filePath);
      let body = null;
      if (options.corruptGraphSnapshot && filePath.endsWith('.snapshot.json')) {
        body = await readFile(filePath);
        let snapshot = JSON.parse(body.toString('utf8'));
        snapshot.routeFingerprint.localeContent = 'test-corrupted-locale-content';
        body = Buffer.from(JSON.stringify(snapshot));
      }
      let size = body?.byteLength ?? fileInfo.size;
      let range = request.method === 'GET'
        ? parseSingleByteRange(request.headers.range, size)
        : null;
      let headers = {
        'accept-ranges': 'bytes',
        'cache-control': 'no-store',
        'content-type': getMimeType(filePath),
      };

      if (range?.unsatisfiable) {
        response.writeHead(416, {
          ...headers,
          'content-length': '0',
          'content-range': `bytes */${size}`,
        });
        response.end();
        return;
      }

      let status = range ? 206 : 200;
      let start = range?.start ?? 0;
      let end = range?.end ?? size - 1;
      let contentLength = range?.length ?? size;
      if (range) headers['content-range'] = `bytes ${start}-${end}/${size}`;
      headers['content-length'] = String(contentLength);
      response.writeHead(status, headers);
      if (request.method === 'HEAD' || contentLength === 0) {
        response.end();
        return;
      }
      if (body) {
        response.end(body.subarray(start, end + 1));
        return;
      }
      createReadStream(filePath, { start, end }).pipe(response);
    } catch (error) {
      response.writeHead(500, { 'content-type': 'text/plain; charset=utf-8' });
      response.end(String(error?.stack || error));
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

class CdpClient {
  constructor(socket) {
    this.socket = socket;
    this.nextId = 1;
    this.pending = new Map();
    this.listeners = new Map();
    this.consoleMessages = [];
    this.exceptions = [];
    socket.on('message', (data) => this.handleMessage(data));
    this.requestedUrls = [];
    this.on('Network.requestWillBeSent', (params) => {
      if (params.request && params.request.url) {
        this.requestedUrls.push(params.request.url);
      }
    });
  }

  handleMessage(data) {
    let message = JSON.parse(String(data));
    if (message.id && this.pending.has(message.id)) {
      let { resolve, reject } = this.pending.get(message.id);
      this.pending.delete(message.id);
      if (message.error) {
        reject(new Error(`${message.error.message}: ${message.error.data || ''}`));
      } else {
        resolve(message.result || {});
      }
      return;
    }
    let callbacks = this.listeners.get(message.method);
    if (!callbacks) return;
    for (let callback of callbacks) callback(message.params || {});
  }

  send(method, params = {}, options = {}) {
    let timeoutMs = options.timeoutMs ?? 20_000;
    let label = options.label || method;
    let id = this.nextId++;
    this.socket.send(JSON.stringify({ id, method, params }));
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      setTimeout(() => {
        if (!this.pending.has(id)) return;
        this.pending.delete(id);
        reject(new Error(`CDP timeout: ${label}`));
      }, timeoutMs).unref?.();
    });
  }

  on(method, callback) {
    let callbacks = this.listeners.get(method);
    if (!callbacks) {
      callbacks = new Set();
      this.listeners.set(method, callbacks);
    }
    callbacks.add(callback);
    return () => callbacks.delete(callback);
  }

  close() {
    this.socket.close();
  }
}

async function waitForFile(filePath, timeoutMs = 10_000) {
  let start = Date.now();
  while (Date.now() - start < timeoutMs) {
    if (await fileExists(filePath)) return;
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
  throw new Error(`Timed out waiting for ${filePath}`);
}

async function launchChrome() {
  if (!await fileExists(CHROME_PATH)) return null;

  let userDataDir = await mkdtemp(path.join(tmpdir(), 'cv-resource-chrome-'));
  let stdout = '';
  let stderr = '';
  let chrome = spawn(CHROME_PATH, [
    '--headless=new',
    '--remote-debugging-port=0',
    '--enable-precise-memory-info',
    '--disable-background-networking',
    '--disable-default-apps',
    '--disable-extensions',
    '--disable-features=Translate',
    '--disable-sync',
    '--metrics-recording-only',
    '--mute-audio',
    '--no-first-run',
    `--user-data-dir=${userDataDir}`,
    'about:blank',
  ], { stdio: ['ignore', 'pipe', 'pipe'] });
  chrome.stdout?.on('data', (chunk) => {
    stdout += String(chunk);
  });
  chrome.stderr?.on('data', (chunk) => {
    stderr += String(chunk);
  });

  let waitForExit = () => new Promise((resolve) => {
    if (chrome.exitCode !== null || chrome.signalCode !== null) {
      resolve();
    } else {
      chrome.once('exit', resolve);
    }
  });

  let activePortFile = path.join(userDataDir, 'DevToolsActivePort');
  try {
    await waitForFile(activePortFile, CHROME_LAUNCH_TIMEOUT_MS);
  } catch (error) {
    chrome.kill('SIGTERM');
    await waitForExit();
    await rm(userDataDir, { force: true, recursive: true });
    let detail = [
      error.message,
      `Chrome path: ${CHROME_PATH}`,
      stdout.trim() ? `stdout:\n${stdout.trim()}` : '',
      stderr.trim() ? `stderr:\n${stderr.trim()}` : '',
    ].filter(Boolean).join('\n');
    throw new Error(detail);
  }
  let [port] = (await readFile(activePortFile, 'utf8')).trim().split('\n');

  return {
    port,
    async close() {
      chrome.kill('SIGTERM');
      await waitForExit();
      await rm(userDataDir, { force: true, recursive: true });
    },
  };
}

async function createPage(port) {
  let response = await fetch(`http://127.0.0.1:${port}/json/new?about:blank`, {
    method: 'PUT',
  });
  assert.equal(response.status, 200);
  let target = await response.json();
  let socket = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => {
    socket.once('open', resolve);
    socket.once('error', reject);
  });
  let client = new CdpClient(socket);
  await client.send('Console.enable');
  await client.send('Runtime.enable');
  client.on('Console.messageAdded', (params) => {
    client.consoleMessages.push(params.message);
    console.log('[BROWSER CONSOLE]', params.message.text);
  });
  client.on('Runtime.exceptionThrown', (params) => {
    client.exceptions.push(params.exceptionDetails);
    console.error('[BROWSER EXCEPTION]', params.exceptionDetails.exception?.description || params.exceptionDetails.text);
  });
  return client;
}

function waitForEvent(cdp, method, predicate = () => true, timeoutMs = 20_000) {
  return new Promise((resolve, reject) => {
    let timer = setTimeout(() => {
      off();
      reject(new Error(`Timed out waiting for ${method}`));
    }, timeoutMs);
    let off = cdp.on(method, (params) => {
      if (!predicate(params)) return;
      clearTimeout(timer);
      off();
      resolve(params);
    });
  });
}

async function navigate(cdp, url, options = {}) {
  let expectedMode = options.expectedMode || 'flat';
  let readyTimeoutMs = options.readyTimeoutMs ?? 15_000;
  let assertReady = options.assertReady !== false;
  await cdp.send('Page.navigate', { url });
  if (url === 'about:blank') {
    await cdp.send('Runtime.evaluate', {
      awaitPromise: true,
      expression: 'new Promise((resolve) => setTimeout(resolve, 50))',
    }, { label: 'about:blank settle', timeoutMs: 2_000 });
    return;
  }
  let ready;
  try {
    ready = await cdp.send('Runtime.evaluate', {
    expression: `
      new Promise((resolve) => {
        const started = performance.now();
        const tick = () => {
          const expectedMode = ${JSON.stringify(expectedMode)};
          const graphPanel = document.querySelector('portfolio-graph-panel');
          const activeRenderer = expectedMode === 'structured'
            ? graphPanel?.querySelector('node-canvas')
            : (expectedMode === 'media'
              ? graphPanel?.querySelector('portfolio-media-canvas-graph')
              : graphPanel?.querySelector('canvas-graph'));
          const ready = document.querySelector('portfolio-workspace')
            && document.querySelector('panel-layout')
            && activeRenderer
            && graphPanel?.dataset.mode === expectedMode;
          if (ready || performance.now() - started > 8000) {
            resolve(Boolean(ready));
          } else {
            setTimeout(tick, 50);
          }
        };
        tick();
      })
    `,
    awaitPromise: true,
    returnByValue: true,
    }, { label: `portfolio ready: ${url}`, timeoutMs: readyTimeoutMs });
  } catch (error) {
    if (assertReady) throw error;
    return false;
  }
  if (assertReady) assert.equal(ready.result.value, true, `portfolio did not become ready: ${url}`);
  return Boolean(ready.result.value);
}

async function clickVisible(cdp, selector, label = selector) {
  let point = await cdp.send('Runtime.evaluate', {
    returnByValue: true,
    expression: `(() => {
      const target = document.querySelector(${JSON.stringify(selector)});
      target?.scrollIntoView?.({ block: 'center', inline: 'center' });
      const rect = target?.getBoundingClientRect();
      const hit = rect && document.elementFromPoint(
        rect.left + rect.width / 2,
        rect.top + rect.height / 2,
      );
      return rect && rect.width > 0 && rect.height > 0
        && (hit === target || target?.contains?.(hit))
        ? { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }
        : null;
    })()`,
  }, { label: `locate ${label}`, timeoutMs: 5_000 });
  assert.ok(point.result.value, `${label} must be visible`);
  await cdp.send('Input.dispatchMouseEvent', {
    type: 'mousePressed', button: 'left', clickCount: 1, ...point.result.value,
  }, { label: `press ${label}`, timeoutMs: 5_000 });
  await cdp.send('Input.dispatchMouseEvent', {
    type: 'mouseReleased', button: 'left', clickCount: 1, ...point.result.value,
  }, { label: `click ${label}`, timeoutMs: 5_000 });
}

async function sample(cdp, label) {
  await cdp.send('HeapProfiler.collectGarbage');
  let heap = await cdp.send('Runtime.getHeapUsage');
  let metrics = await cdp.send('Performance.getMetrics');
  let page = await cdp.send('Runtime.evaluate', {
    returnByValue: true,
    expression: `(() => {
      const byName = (name) => performance.getEntriesByType(name);
      const resources = byName('resource');
      const longTasks = performance.getEntriesByType('longtask');
      return {
        url: location.href,
        nodes: document.querySelectorAll('*').length,
        panelLayouts: document.querySelectorAll('panel-layout').length,
        portfolioLayouts: document.querySelectorAll('panel-layout.portfolio-layout').length,
        graphPanels: document.querySelectorAll('portfolio-graph-panel').length,
        canvasGraphs: document.querySelectorAll('canvas-graph').length,
        nodeCanvases: document.querySelectorAll('node-canvas').length,
        graphMode: document.querySelector('portfolio-graph-panel')?.dataset.mode || '',
        visibleCanvasGraphs: [...document.querySelectorAll('canvas-graph')]
          .filter((element) => !element.hidden && getComputedStyle(element).display !== 'none').length,
        visibleNodeCanvases: [...document.querySelectorAll('node-canvas')]
          .filter((element) => !element.hidden && getComputedStyle(element).display !== 'none').length,
        graphNodes: document.querySelectorAll('graph-node').length,
        contextMenus: document.querySelectorAll('context-menu').length,
        quickToolbars: document.querySelectorAll('quick-toolbar').length,
        resources: resources.length,
        scripts: resources.filter((entry) => entry.initiatorType === 'script').length,
        styles: resources.filter((entry) => entry.initiatorType === 'link' || entry.name.includes('fonts.googleapis')).length,
        longTasks: longTasks.length,
        maxLongTask: Math.round(Math.max(0, ...longTasks.map((entry) => entry.duration))),
      };
    })()`,
  }, { label: `sample page metrics: ${label}`, timeoutMs: 10_000 });
  return {
    label,
    heapUsed: heap.usedSize,
    heapTotal: heap.totalSize,
    metrics: Object.fromEntries((metrics.metrics || []).map((metric) => [metric.name, metric.value])),
    page: page.result.value,
  };
}

async function runPortfolioStep(cdp, label, body) {
  let result = await cdp.send('Runtime.evaluate', {
    awaitPromise: true,
    returnByValue: true,
    expression: `
      (async () => {
        const stepStarted = performance.now();
        const waitFrame = () => new Promise((resolve) => {
          let done = false;
          let finish = () => {
            if (done) return;
            done = true;
            resolve();
          };
          setTimeout(finish, 250);
          requestAnimationFrame(() => requestAnimationFrame(finish));
        });
        const layout = document.querySelector('panel-layout');
        const graph = document.querySelector('portfolio-graph-panel');
        if (!layout || !graph) return { ok: false, reason: 'missing-layout-or-graph' };
        ${body}
        await waitFrame();
        return {
          ok: true,
          label: ${JSON.stringify(label)},
          duration: Math.round(performance.now() - stepStarted),
          drawerMode: layout.hasAttribute('drawer-mode-active'),
          mode: graph.dataset.mode,
          panelLayouts: document.querySelectorAll('panel-layout').length,
          graphPanels: document.querySelectorAll('portfolio-graph-panel').length,
          canvasGraphs: document.querySelectorAll('canvas-graph').length,
          nodeCanvases: document.querySelectorAll('node-canvas').length,
        };
      })()
    `,
  }, { label, timeoutMs: 12_000 });
  assert.equal(result.result.value.ok, true, result.result.value.reason || label);
  return result.result.value;
}

function verifyNoBlockedRequests(cdp) {
  for (const url of cdp.requestedUrls) {
    if (url.includes('fonts.googleapis.com') || url.includes('fonts.gstatic.com')) {
      throw new Error(`Escape detected: requested external Google Font URL: ${url}`);
    }
    if (url.includes('cdn.jsdelivr.net/npm/')) {
      throw new Error(`Escape detected: requested jsDelivr npm library module: ${url}`);
    }
  }
}

async function createPortfolioPage(t, options = {}) {
  await stat(path.join(DIST_DIR, 'index.html'));
  let server = await startStaticServer(options);
  t.after(() => server.close());

  let chrome = await launchChrome();
  if (!chrome) {
    t.skip(`Chrome executable not found at ${CHROME_PATH}`);
    return null;
  }
  t.after(() => chrome.close());

  let cdp = await createPage(chrome.port);
  t.after(() => {
    try {
      verifyNoBlockedRequests(cdp);
    } finally {
      cdp.close();
    }
  });

  await cdp.send('Page.enable');
  await cdp.send('Runtime.enable');
  await cdp.send('Network.enable');
  await cdp.send('Performance.enable');
  await cdp.send('Emulation.setDeviceMetricsOverride', options.viewport || MOBILE_VIEWPORT);
  await cdp.send('Emulation.setTouchEmulationEnabled', options.touch === false
    ? { enabled: false }
    : { enabled: true, maxTouchPoints: 5 });
  await cdp.send('Network.setBlockedURLs', {
    urls: [
      'https://fonts.googleapis.com/*',
      'https://fonts.gstatic.com/*',
      'https://rnd-pro.com/*',
      'https://img.youtube.com/*',
      'https://www.youtube.com/*',
      'https://github.com/*',
      'https://www.npmjs.com/*',
      'https://cdn.jsdelivr.net/*',
    ],
  });

  return { cdp, server };
}

async function createMobilePage(t) {
  return createPortfolioPage(t);
}

async function exercisePortfolioUi(cdp) {
  let steps = [];
  for (let index = 0; index < 4; index += 1) {
    steps.push(await runPortfolioStep(cdp, `cycle ${index + 1}: switch to structured graph`, `
      graph.setGraphViewMode?.('structured');
    `));
    steps.push(await runPortfolioStep(cdp, `cycle ${index + 1}: switch to flat graph`, `
      graph.setGraphViewMode?.('flat');
    `));
    steps.push(await runPortfolioStep(cdp, `cycle ${index + 1}: open materials drawer`, `
      document.dispatchEvent(new CustomEvent('portfolio-open-materials', {
        detail: { source: 'resource-test' },
      }));
    `));
    steps.push(await runPortfolioStep(cdp, `cycle ${index + 1}: close materials drawer`, `
      layout.closeDrawer?.('start');
    `));
    steps.push(await runPortfolioStep(cdp, `cycle ${index + 1}: open theme drawer`, `
      layout.openPanel?.('portfolio-theme', {
        direction: 'horizontal',
        ratio: 0.72,
        behavior: {
          importance: 88,
          minInlineSize: 320,
          minBlockSize: 280,
          collapse: 'manual',
          mobileDock: 'end',
          swipeControl: 'rail',
        },
        source: 'resource-test',
        uiInvoked: true,
      });
    `));
    steps.push(await runPortfolioStep(cdp, `cycle ${index + 1}: close theme drawer`, `
      layout.closeDrawer?.('end');
    `));
  }
  let finalState = await runPortfolioStep(cdp, 'restore flat graph', `
    graph.setGraphViewMode?.('flat');
  `);
  return { ...finalState, steps };
}

async function getGraphInternals(cdp, label) {
  let result = await cdp.send('Runtime.evaluate', {
    returnByValue: true,
    expression: `(() => {
      const graphPanel = document.querySelector('portfolio-graph-panel');
      const structured = graphPanel?.querySelector('node-canvas');
      const flat = graphPanel?.querySelector('canvas-graph');
      const visible = (element) => Boolean(element)
        && !element.hidden
        && getComputedStyle(element).display !== 'none'
        && getComputedStyle(element).visibility !== 'hidden';
      const structuredEditor = structured?._editor || structured?.editor || null;
      const flatNodes = Array.isArray(flat?.nodes) ? flat.nodes.length : null;
      const flatEdges = Array.isArray(flat?.edges) ? flat.edges.length : null;
      const flatPositions = flat?.nodePositions?.size ?? null;
      const flatWorker = Boolean(flat?.worker);
      const structuredPositions = structured?.positions
        ? Object.keys(structured.positions).length
        : structured?.nodePositions?.size ?? null;
      return {
        label: ${JSON.stringify(label)},
        mode: graphPanel?.dataset.mode || '',
        structuredPresent: Boolean(structured),
        flatPresent: Boolean(flat),
        structuredVisible: visible(structured),
        flatVisible: visible(flat),
        structuredHidden: Boolean(structured?.hidden),
        flatHidden: Boolean(flat?.hidden),
        domGraphNodes: document.querySelectorAll('graph-node').length,
        structuredEditorNodes: structuredEditor?.nodes?.size ?? structuredEditor?.getNodes?.()?.length ?? null,
        structuredEditorConnections: structuredEditor?.connections?.size ?? structuredEditor?.getConnections?.()?.length ?? null,
        structuredPositions,
        flatNodes,
        flatEdges,
        flatPositions,
        flatWorker,
        canvasGraphs: document.querySelectorAll('canvas-graph').length,
        nodeCanvases: document.querySelectorAll('node-canvas').length,
        quickToolbars: document.querySelectorAll('quick-toolbar').length,
        contextMenus: document.querySelectorAll('context-menu').length,
      };
    })()`,
  }, { label: `graph internals: ${label}`, timeoutMs: 10_000 });
  return result.result.value;
}

async function getLocaleState(cdp, label) {
  let result = await cdp.send('Runtime.evaluate', {
    returnByValue: true,
    expression: `(() => {
      const toggle = document.querySelector('.pulse-locale-toggle');
      const selected = toggle?.querySelector('[aria-checked="true"]');
      return {
        label: ${JSON.stringify(label)},
        lang: document.documentElement.lang,
        locale: document.documentElement.dataset.locale || '',
        url: location.href,
        title: document.title,
        toggleValue: toggle?.getAttribute('value') || '',
        selectedValue: selected?.getAttribute('value') || '',
        storedLocale: localStorage.getItem('cv-portfolio-locale') || '',
        themeText: document.querySelector('.pulse-theme-widget .ctw-trigger-label')?.textContent?.trim() || '',
        themeTitle: document.querySelector('.pulse-theme-widget .ctw-trigger')?.getAttribute('title') || '',
        panelActionTitle: document.querySelector('.panel-menu-toggle')?.getAttribute('title') || '',
        treeAria: document.querySelector('sn-tree-panel.portfolio-tree')?.getAttribute('aria-label') || '',
        layoutMenuText: document.querySelector('[data-menu-group="layout"] .panel-menu-row-label')?.textContent?.trim() || '',
        layoutSplitText: document.querySelector('[data-menu-action-id="layout:split-horizontal"] .panel-menu-action-label')?.textContent?.trim() || '',
        graphViewMenuText: document.querySelector('[data-menu-group="graph-view"] .panel-menu-row-label')?.textContent?.trim() || '',
        structuredActionText: document.querySelector('[data-menu-action-id="graph:structured-mode"] .panel-menu-action-label')?.textContent?.trim() || '',
      };
    })()`,
  }, { label: `locale state: ${label}`, timeoutMs: 10_000 });
  return result.result.value;
}

async function getVisiblePortfolioText(cdp, label) {
  const loadingMessages = ['Loading Markdown…', 'Загрузка Markdown…', 'Cargando Markdown…'];
  await cdp.send('Runtime.evaluate', {
    awaitPromise: true,
    returnByValue: true,
    expression: `new Promise((resolve) => {
      const started = performance.now();
      const loading = ${JSON.stringify(loadingMessages)};
      const tick = () => {
        const text = document.querySelector(
          'source-viewer.portfolio-viewer code-block .cb-md'
        )?.innerText?.trim() || '';
        if ((text && !loading.some((message) => text.includes(message)))
          || performance.now() - started > 10000) {
          resolve(text);
        } else {
          setTimeout(tick, 50);
        }
      };
      tick();
    })`,
  }, { label: `wait for portfolio content: ${label}`, timeoutMs: 12_000 });
  let result = await cdp.send('Runtime.evaluate', {
    returnByValue: true,
    expression: `(() => ({
      label: ${JSON.stringify(label)},
      lang: document.documentElement.lang,
      locale: document.documentElement.dataset.locale || '',
      url: location.href,
      articleText: (document.querySelector(
        'source-viewer.portfolio-viewer code-block .cb-md'
      )?.innerText || '').replace(/\\s+/g, ' ').trim(),
      text: [
        document.body.innerText || '',
        document.querySelector('sn-tree-panel.portfolio-tree')?.textContent || '',
      ].join(' ').replace(/\\s+/g, ' ').trim(),
    }))()`,
  }, { label: `visible portfolio text: ${label}`, timeoutMs: 10_000 });
  return result.result.value;
}

function getVisibleMarkdownParagraphs(markdown) {
  return stripPortfolioArticleBlockMarkers(markdown)
    .split('\n\n')
    .map((paragraph) => paragraph
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .replace(/^#{1,6}\s+/gm, '')
      .replace(/^\s*[-+*]\s+/gm, '')
      .replace(/[*_`]/g, '')
      .replace(/\s+/g, ' ')
      .trim())
    .filter(Boolean);
}

test('browser static server serves standards-correct single byte ranges', async (t) => {
  let expected = await readFile(path.join(DIST_DIR, 'index.html'));
  let server = await startStaticServer();
  t.after(() => server.close());
  let url = `${server.origin}/cv/index.html`;

  let whole = await fetch(url);
  assert.equal(whole.status, 200);
  assert.equal(whole.headers.get('accept-ranges'), 'bytes');
  assert.equal(whole.headers.get('content-length'), String(expected.length));
  assert.deepEqual(Buffer.from(await whole.arrayBuffer()), expected);

  let head = await fetch(url, { method: 'HEAD' });
  assert.equal(head.status, 200);
  assert.equal(head.headers.get('accept-ranges'), 'bytes');
  assert.equal(head.headers.get('content-length'), String(expected.length));
  assert.equal((await head.arrayBuffer()).byteLength, 0);

  for (let expectation of [
    { header: 'bytes=0-3', start: 0, end: 3 },
    { header: 'bytes=4-', start: 4, end: expected.length - 1 },
    { header: 'bytes=-4', start: expected.length - 4, end: expected.length - 1 },
  ]) {
    let response = await fetch(url, { headers: { range: expectation.header } });
    let length = expectation.end - expectation.start + 1;
    assert.equal(response.status, 206, expectation.header);
    assert.equal(response.headers.get('accept-ranges'), 'bytes', expectation.header);
    assert.equal(
      response.headers.get('content-range'),
      `bytes ${expectation.start}-${expectation.end}/${expected.length}`,
      expectation.header,
    );
    assert.equal(response.headers.get('content-length'), String(length), expectation.header);
    assert.deepEqual(
      Buffer.from(await response.arrayBuffer()),
      expected.subarray(expectation.start, expectation.end + 1),
      expectation.header,
    );
  }

  let rangeHead = await fetch(url, {
    method: 'HEAD',
    headers: { range: 'bytes=0-3' },
  });
  assert.equal(rangeHead.status, 200);
  assert.equal(rangeHead.headers.get('content-range'), null);
  assert.equal(rangeHead.headers.get('content-length'), String(expected.length));
  assert.equal((await rangeHead.arrayBuffer()).byteLength, 0);

  for (let header of ['items=0-3', 'bytes=0-1,4-5']) {
    let response = await fetch(url, { headers: { range: header } });
    assert.equal(response.status, 200, header);
    assert.equal(response.headers.get('accept-ranges'), 'bytes', header);
    assert.equal(response.headers.get('content-range'), null, header);
    assert.equal(response.headers.get('content-length'), String(expected.length), header);
    assert.deepEqual(Buffer.from(await response.arrayBuffer()), expected, header);
  }

  for (let header of [
    `bytes=${expected.length}-`,
    'bytes=4-3',
    'bytes=-',
    'bytes=invalid',
  ]) {
    let response = await fetch(url, { headers: { range: header } });
    assert.equal(response.status, 416, header);
    assert.equal(response.headers.get('accept-ranges'), 'bytes', header);
    assert.equal(response.headers.get('content-range'), `bytes */${expected.length}`, header);
    assert.equal(response.headers.get('content-length'), '0', header);
    assert.equal((await response.arrayBuffer()).byteLength, 0, header);
  }
});

// Covers the custom element and reload path that cannot be exercised from static source checks.
test('portfolio language toggle persists locale through the rendered shell', {
  timeout: 60_000,
}, async (t) => {
  if (EXTERNAL_TEST_URL) t.skip('language toggle smoke uses local deterministic routes');
  let page = await createMobilePage(t);
  if (!page) return;
  let { cdp, server } = page;

  await navigate(cdp, `${server.origin}/cv/?lang=ru&resource-test=language`, {
    expectedMode: 'structured',
  });
  let ruState = await getLocaleState(cdp, 'initial-ru');
  assert.equal(ruState.lang, 'ru');
  assert.equal(ruState.locale, 'ru');
  assert.equal(ruState.toggleValue, 'ru');
  assert.equal(ruState.selectedValue, 'ru');
  assert.match(ruState.title, /Владимир Матиясевич/);
  assert.equal(ruState.themeText, 'Внешний вид');
  assert.equal(ruState.themeTitle, 'Настройки внешнего вида');
  assert.equal(ruState.panelActionTitle, 'Действия панели');
  assert.equal(ruState.treeAria, 'Навигация портфолио');
  assert.equal(ruState.layoutMenuText, 'Раскладка');
  assert.equal(ruState.layoutSplitText, 'Разделить по горизонтали');
  assert.equal(ruState.graphViewMenuText, 'Вид');
  assert.equal(ruState.structuredActionText, 'Структура');

  let load = waitForEvent(cdp, 'Page.loadEventFired', () => true, 15_000);
  await cdp.send('Runtime.evaluate', {
    expression: `document.querySelector('.pulse-locale-toggle button[value="es"]')?.click()`,
  }, { label: 'click spanish locale', timeoutMs: 5_000 });
  await load;
  await cdp.send('Runtime.evaluate', {
    awaitPromise: true,
    returnByValue: true,
    expression: `new Promise((resolve) => {
      const started = performance.now();
      const tick = () => {
        const ready = document.documentElement.lang === 'es'
          && document.querySelector('portfolio-graph-panel')?.dataset.mode === 'structured';
        if (ready || performance.now() - started > 8000) {
          resolve(Boolean(ready));
        } else {
          setTimeout(tick, 50);
        }
      };
      tick();
    })`,
  }, { label: 'wait for spanish locale reload', timeoutMs: 10_000 });

  let esState = await getLocaleState(cdp, 'after-es-toggle');
  assert.equal(esState.lang, 'es');
  assert.equal(esState.locale, 'es');
  assert.equal(esState.toggleValue, 'es');
  assert.equal(esState.selectedValue, 'es');
  assert.equal(esState.storedLocale, 'es');
  assert.match(esState.url, /[?&]lang=es(?:&|$)/);
  assert.equal(esState.title, PORTFOLIO_LOCALE_MESSAGES.es['portfolio.page.title']);
  assert.equal(esState.themeText, 'Apariencia');
  assert.equal(esState.themeTitle, 'Controles de apariencia');
  assert.equal(esState.panelActionTitle, 'Acciones del panel');
  assert.equal(esState.treeAria, 'Navegación del portafolio');
  assert.equal(esState.layoutMenuText, 'Diseño');
  assert.equal(esState.layoutSplitText, 'Dividir horizontal');
  assert.equal(esState.graphViewMenuText, 'Vista');
  assert.equal(esState.structuredActionText, 'Estructura');

  await navigate(cdp, `${server.origin}/cv/?resource-test=language-stored`, {
    expectedMode: 'structured',
  });
  let storedState = await getLocaleState(cdp, 'stored-es');
  assert.equal(storedState.lang, 'es');
  assert.equal(storedState.locale, 'es');
  assert.equal(storedState.toggleValue, 'es');
  assert.equal(storedState.selectedValue, 'es');
  assert.equal(storedState.storedLocale, 'es');
  assert.doesNotMatch(storedState.url, /[?&]lang=/);
  assert.equal(storedState.title, PORTFOLIO_LOCALE_MESSAGES.es['portfolio.page.title']);
  assert.equal(storedState.themeText, 'Apariencia');
  assert.equal(storedState.panelActionTitle, 'Acciones del panel');
});

test('portfolio appearance panel scrolls and resets to library theme defaults', {
  timeout: 60_000,
}, async (t) => {
  if (EXTERNAL_TEST_URL) t.skip('appearance regression uses a clean local storage profile');
  let page = await createPortfolioPage(t, {
    viewport: DESKTOP_VIEWPORT,
    touch: false,
  });
  if (!page) return;
  let { cdp, server } = page;

  await navigate(cdp, `${server.origin}/cv/projects/autobox-v1/pulse/autobox-v1-retrospective/?mode=structured&resource-test=appearance-panel`, {
    expectedMode: 'structured',
  });
  let result = await cdp.send('Runtime.evaluate', {
    awaitPromise: true,
    returnByValue: true,
    expression: `(async () => {
      const storageKey = 'symbiote-ui:cascade-theme-editor';
      const waitFrame = () => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
      const waitFor = async (read, timeoutMs = 8000) => {
        const started = performance.now();
        while (performance.now() - started < timeoutMs) {
          const value = read();
          if (value) return value;
          await new Promise((resolve) => setTimeout(resolve, 50));
        }
        return read();
      };

      const graphPanel = await waitFor(() => document.querySelector('portfolio-graph-panel'));
      graphPanel?.setGraphLayout?.('tree');
      await waitFor(() => graphPanel?.graphLayout === 'tree');
      graphPanel?.setGraphViewMode?.('flat');
      await waitFor(() => graphPanel?.viewMode === 'flat');
      const graphBeforeReset = {
        viewMode: graphPanel?.viewMode,
        layout: graphPanel?.graphLayout,
        urlMode: new URL(location.href).searchParams.get('mode'),
        urlLayout: new URL(location.href).searchParams.get('layout'),
      };

      const articleMediaHost = await waitFor(() => {
        const candidate = document
          .getElementById('media-media%2Fautobox-v1%2Fims%2Fspinner')
          ?.querySelector('sn-media-host');
        return candidate?.hasAttribute('data-activated') ? candidate : null;
      });
      const articleMediaStage = articleMediaHost?.querySelector('.sn-media-stage');
      const articleMedia = {
        activated: articleMediaHost?.hasAttribute('data-activated') || false,
        posterHidden: articleMediaHost?.querySelector('.sn-media-poster')?.hidden || false,
        stageChildren: articleMediaStage?.childElementCount || 0,
      };

      document.dispatchEvent(new CustomEvent('cascade-theme-open-full'));
      const editor = await waitFor(() => {
        const candidate = document.querySelector('portfolio-theme-panel cascade-theme-editor');
        return candidate?.querySelector('input[data-theme-control="pattern"]') ? candidate : null;
      });
      const panelContent = editor?.closest('.panel-content');
      const patternInput = editor?.querySelector('input[data-theme-control="pattern"]');
      const resetButton = editor?.querySelector('[data-action="reset"]');
      const widget = document.querySelector('cascade-theme-widget');
      if (!editor || !panelContent || !patternInput || !resetButton) {
        return { ok: false, reason: 'missing-appearance-controls' };
      }

      const overriddenAttributes = (element) => ['default-state', 'storage-key', 'target-selector']
        .filter((name) => element?.hasAttribute(name));
      const initial = {
        contrast: editor.state?.contrast,
        pattern: editor.state?.pattern,
        rootPattern: getComputedStyle(document.documentElement)
          .getPropertyValue('--sn-theme-pattern-brightness').trim(),
        storedPattern: JSON.parse(localStorage.getItem(storageKey) || 'null')?.pattern,
        editorOverrides: overriddenAttributes(editor),
        widgetOverrides: overriddenAttributes(widget),
      };

      patternInput.value = '0';
      patternInput.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
      await waitFor(() => editor.state?.pattern === 0);
      const storedAfterInput = JSON.parse(localStorage.getItem(storageKey) || 'null');

      resetButton.click();
      await waitFor(() => editor.state?.pattern === 100 && localStorage.getItem(storageKey) === null);
      const afterReset = {
        contrast: editor.state?.contrast,
        pattern: editor.state?.pattern,
        rootPattern: getComputedStyle(document.documentElement)
          .getPropertyValue('--sn-theme-pattern-brightness').trim(),
        stored: localStorage.getItem(storageKey),
        graphViewMode: graphPanel?.viewMode,
        graphLayout: graphPanel?.graphLayout,
        urlMode: new URL(location.href).searchParams.get('mode'),
        urlLayout: new URL(location.href).searchParams.get('layout'),
      };

      const overflowY = getComputedStyle(panelContent).overflowY;
      const clientHeight = panelContent.clientHeight;
      const scrollHeight = panelContent.scrollHeight;
      panelContent.scrollTop = scrollHeight;
      await waitFrame();
      const finalControl = editor.querySelector('.cte-details');
      const panelRect = panelContent.getBoundingClientRect();
      const finalRect = finalControl?.getBoundingClientRect();
      return {
        ok: true,
        articleMedia,
        initial,
        graphBeforeReset,
        storedPatternAfterInput: storedAfterInput?.pattern,
        afterReset,
        overflowY,
        clientHeight,
        scrollHeight,
        scrollTop: panelContent.scrollTop,
        finalControlReachable: Boolean(finalRect)
          && finalRect.top >= panelRect.top - 1
          && finalRect.bottom <= panelRect.bottom + 1,
      };
    })()`,
  }, { label: 'verify appearance defaults and panel scrolling', timeoutMs: 20_000 });

  let state = result.result.value;
  assert.equal(state.ok, true, state.reason || JSON.stringify(state));
  assert.equal(state.articleMedia.activated, true, JSON.stringify(state));
  assert.equal(state.articleMedia.posterHidden, true, JSON.stringify(state));
  assert.ok(state.articleMedia.stageChildren > 0, JSON.stringify(state));
  assert.equal(state.initial.contrast, 67, JSON.stringify(state));
  assert.equal(state.initial.pattern, 100, JSON.stringify(state));
  assert.equal(Number(state.initial.rootPattern), 1, JSON.stringify(state));
  assert.equal(state.initial.storedPattern, 100, JSON.stringify(state));
  assert.deepEqual(state.initial.editorOverrides, ['default-state']);
  assert.deepEqual(state.initial.widgetOverrides, ['default-state']);
  assert.equal(state.graphBeforeReset.viewMode, 'flat', JSON.stringify(state));
  assert.equal(state.graphBeforeReset.layout, 'tree', JSON.stringify(state));
  assert.equal(state.graphBeforeReset.urlMode, 'flat', JSON.stringify(state));
  assert.equal(state.graphBeforeReset.urlLayout, 'tree', JSON.stringify(state));
  assert.equal(state.storedPatternAfterInput, 0, JSON.stringify(state));
  assert.equal(state.afterReset.contrast, 67, JSON.stringify(state));
  assert.equal(state.afterReset.pattern, 100, JSON.stringify(state));
  assert.equal(Number(state.afterReset.rootPattern), 1, JSON.stringify(state));
  assert.equal(state.afterReset.stored, null, JSON.stringify(state));
  assert.equal(state.afterReset.graphViewMode, 'flat', JSON.stringify(state));
  assert.equal(state.afterReset.graphLayout, 'tree', JSON.stringify(state));
  assert.equal(state.afterReset.urlMode, 'flat', JSON.stringify(state));
  assert.equal(state.afterReset.urlLayout, 'tree', JSON.stringify(state));
  assert.equal(state.overflowY, 'auto', JSON.stringify(state));
  assert.ok(state.scrollHeight > state.clientHeight, JSON.stringify(state));
  assert.ok(state.scrollTop > 0, JSON.stringify(state));
  assert.equal(state.finalControlReachable, true, JSON.stringify(state));
});

// Browser justification: URL-token decoding, customElements.whenDefined, the
// provider dialog lifecycle, and portfolio cleanup form one cross-component UI
// sync that cannot be covered at data level.
test('URL theme import dialog shows after whenDefined and cancels without saving', {
  timeout: 60_000,
}, async (t) => {
  if (EXTERNAL_TEST_URL) t.skip('theme import guard uses a clean local storage profile');
  let page = await createPortfolioPage(t, {
    viewport: DESKTOP_VIEWPORT,
    touch: false,
  });
  if (!page) return;
  let { cdp, server } = page;

  let token = encodeCascadeThemeShare({ state: { pattern: 40 }, name: 'Browser Guard' });
  await navigate(cdp, `${server.origin}/cv/?sn-theme=${encodeURIComponent(token)}&resource-test=theme-import`, {
    expectedMode: 'structured',
  });
  let result = await cdp.send('Runtime.evaluate', {
    awaitPromise: true,
    returnByValue: true,
    expression: `(async () => {
      const storageKey = 'symbiote-ui:cascade-theme-editor';
      const waitFor = async (read, timeoutMs = 8000) => {
        const started = performance.now();
        while (performance.now() - started < timeoutMs) {
          const value = read();
          if (value) return value;
          await new Promise((resolve) => setTimeout(resolve, 50));
        }
        return read();
      };

      const defined = await Promise.race([
        customElements.whenDefined('sn-theme-import-dialog').then(() => true),
        new Promise((resolve) => setTimeout(() => resolve(false), 8000)),
      ]);
      const dialog = await waitFor(() => document.querySelector('sn-theme-import-dialog'));
      if (!dialog) return { ok: false, defined, reason: 'missing-import-dialog' };
      const innerDialog = await waitFor(() => {
        const candidate = dialog.querySelector('dialog');
        return candidate?.open ? candidate : null;
      });
      const shown = {
        defined,
        open: Boolean(innerDialog),
        themeName: dialog.querySelector('.sn-theme-import-prompt strong')?.textContent || '',
        urlTokenRemoved: !new URL(location.href).searchParams.has('sn-theme'),
      };

      dialog.querySelector('button[data-action="cancel"]')?.click();
      const removed = await waitFor(() => !document.querySelector('sn-theme-import-dialog'));
      return {
        ok: true,
        shown,
        removed: Boolean(removed),
        storedTheme: localStorage.getItem(storageKey),
      };
    })()`,
  }, { label: 'verify URL theme import dialog', timeoutMs: 20_000 });

  let state = result.result.value;
  assert.equal(state.ok, true, state.reason || JSON.stringify(state));
  assert.equal(state.shown.defined, true, JSON.stringify(state));
  assert.equal(state.shown.open, true, JSON.stringify(state));
  assert.equal(state.shown.themeName, 'Browser Guard', JSON.stringify(state));
  assert.equal(state.shown.urlTokenRemoved, true, JSON.stringify(state));
  assert.equal(state.removed, true, JSON.stringify(state));
  // The editor persists its default state on load; cancel must not store the imported pattern 40.
  let storedTheme = state.storedTheme ? JSON.parse(state.storedTheme) : null;
  assert.notEqual(storedTheme?.pattern, 40, JSON.stringify(state));
});

test('structured media activation routes to Pulse and restores through browser history', {
  timeout: 120_000,
}, async (t) => {
  if (EXTERNAL_TEST_URL) t.skip('structured media history regression uses local deterministic routes');
  let page = await createPortfolioPage(t, {
    viewport: DESKTOP_VIEWPORT,
    touch: false,
  });
  if (!page) return;
  let { cdp, server } = page;

  await navigate(cdp, `${server.origin}/cv/projects/autobox-v1/?mode=structured`, {
    expectedMode: 'structured',
    readyTimeoutMs: 30_000,
  });
  let result = await cdp.send('Runtime.evaluate', {
    awaitPromise: true,
    returnByValue: true,
    expression: `(async () => {
      const mediaId = ${JSON.stringify(AUTOBOX_SPINNER_MEDIA_ID)};
      const fragmentId = ${JSON.stringify(AUTOBOX_SPINNER_FRAGMENT)};
      const waitFor = async (read, timeoutMs = 15000) => {
        const started = performance.now();
        while (performance.now() - started < timeoutMs) {
          const value = read();
          if (value) return value;
          await new Promise((resolve) => setTimeout(resolve, 50));
        }
        return read();
      };
      const graphPanel = await waitFor(() => document.querySelector('portfolio-graph-panel'));
      const canvas = await waitFor(() => graphPanel?.querySelector('node-canvas'));
      const editorNode = await waitFor(() => graphPanel?._structuredEditor?.getNode?.(mediaId));
      const findMediaElement = () => [...(canvas?.querySelectorAll('graph-node') || [])]
        .find((element) => element.getAttribute('node-id') === mediaId) || null;
      const mediaElement = await waitFor(findMediaElement);
      if (!graphPanel || !canvas || !editorNode || !mediaElement) {
        return {
          ok: false,
          reason: 'structured-media-node-not-ready',
          graphPanel: Boolean(graphPanel),
          canvas: Boolean(canvas),
          editorNode: Boolean(editorNode),
          mediaElement: Boolean(mediaElement),
        };
      }

      const snapshot = () => {
        const host = document.getElementById(fragmentId);
        const hostRoot = host?.getRootNode?.();
        const selectedNodes = Array.from(canvas?._selector?.getSelectedNodes?.() || []);
        return {
          pathname: location.pathname,
          hash: location.hash,
          hostMounted: Boolean(
            host?.isConnected
            && host.matches('.portfolio-article-media-item[role="figure"]')
          ),
          hostId: host?.id || '',
          hostMediaId: host?.dataset.mediaId || '',
          hostFocused: Boolean(host && hostRoot?.activeElement === host),
          nodeSelected: Boolean(findMediaElement()?.hasAttribute('data-selected')),
          selectedNodes,
        };
      };
      const isPulseMediaState = (state) => state.pathname === '/cv/projects/autobox-v1/pulse/autobox-v1-retrospective/'
        && state.hash === '#' + fragmentId
        && state.hostMounted
        && state.hostId === fragmentId
        && state.hostMediaId === mediaId
        && state.hostFocused
        && state.nodeSelected
        && state.selectedNodes.length === 1
        && state.selectedNodes[0] === mediaId;

      mediaElement.dispatchEvent(new CustomEvent('sn-media-activate', {
        bubbles: true,
        composed: true,
        detail: {
          descriptor: editorNode.params?.media,
          nodeId: mediaId,
        },
      }));
      const pulse = await waitFor(() => {
        const state = snapshot();
        return isPulseMediaState(state) ? state : null;
      });
      if (!pulse) return { ok: false, reason: 'pulse-media-state-timeout', state: snapshot() };

      history.back();
      const back = await waitFor(() => {
        const state = snapshot();
        return state.pathname === '/cv/projects/autobox-v1/' && state.hash === '' ? state : null;
      });
      if (!back) return { ok: false, reason: 'project-history-state-timeout', state: snapshot() };

      history.forward();
      const forward = await waitFor(() => {
        const state = snapshot();
        return isPulseMediaState(state) ? state : null;
      });
      if (!forward) return { ok: false, reason: 'pulse-history-state-timeout', state: snapshot() };

      return { ok: true, pulse, back, forward };
    })()`,
  }, { label: 'verify structured media routing and browser history', timeoutMs: 60_000 });

  let state = result.result.value;
  assert.equal(state.ok, true, state.reason || JSON.stringify(state));
  for (let mediaState of [state.pulse, state.forward]) {
    assert.equal(mediaState.pathname, '/cv/projects/autobox-v1/pulse/autobox-v1-retrospective/');
    assert.equal(mediaState.hash, `#${AUTOBOX_SPINNER_FRAGMENT}`);
    assert.equal(mediaState.hostMounted, true);
    assert.equal(mediaState.hostId, AUTOBOX_SPINNER_FRAGMENT);
    assert.equal(mediaState.hostMediaId, AUTOBOX_SPINNER_MEDIA_ID);
    assert.equal(mediaState.hostFocused, true);
    assert.equal(mediaState.nodeSelected, true);
    assert.deepEqual(mediaState.selectedNodes, [AUTOBOX_SPINNER_MEDIA_ID]);
  }
  assert.equal(state.back.pathname, '/cv/projects/autobox-v1/');
  assert.equal(state.back.hash, '');
});

test('portfolio project and section routes localize visible content', {
  timeout: 120_000,
}, async (t) => {
  if (EXTERNAL_TEST_URL) t.skip('localized project audit uses local deterministic routes');
  let page = await createMobilePage(t);
  if (!page) return;
  let { cdp, server } = page;

  let pulseRouteChecks = ['en', 'ru', 'es'].map((locale) => {
    let messages = PORTFOLIO_LOCALE_MESSAGES[locale];
    return {
      locale,
      path: `/cv/pulse/?lang=${locale}&mode=flat&resource-test=locale-audit-pulse`,
      include: [
        messages['portfolio.pulse.label'],
        messages['portfolio.pulse.summary'],
      ],
      exclude: ['en', 'ru', 'es']
        .filter((otherLocale) => otherLocale !== locale)
        .map((otherLocale) => PORTFOLIO_LOCALE_MESSAGES[otherLocale]['portfolio.pulse.summary']),
    };
  });
  let routeChecks = [
    {
      locale: 'ru',
      path: '/cv/?lang=ru&mode=flat&resource-test=locale-audit-root',
      include: ['Навигация портфолио', 'ИИ-инструменты', 'Продуктовые платформы', 'Hardware'],
      exclude: ['Portfolio navigation', 'AI Tooling', 'Product Platforms'],
    },
    {
      locale: 'ru',
      path: '/cv/skills/?lang=ru&mode=flat&resource-test=locale-audit-skills',
      include: ['Обзор навыков', 'Ключевые навыки'],
      exclude: ['Skill overview', 'Core skills'],
    },
    ...pulseRouteChecks,
    {
      locale: 'es',
      path: '/cv/?lang=es&mode=flat&resource-test=locale-audit-root',
      include: ['Navegación del portafolio', 'Herramientas de IA', 'Plataformas de producto', 'Hardware'],
      exclude: ['Portfolio navigation', 'AI Tooling', 'Product Platforms'],
    },
    {
      locale: 'es',
      path: '/cv/skills/?lang=es&mode=flat&resource-test=locale-audit-skills',
      include: ['Resumen de habilidades', 'Habilidades clave'],
      exclude: ['Skill overview', 'Core skills'],
    },
  ];

  for (let check of routeChecks) {
    await navigate(cdp, `${server.origin}${check.path}`, { expectedMode: 'flat' });
    let visible = await getVisiblePortfolioText(cdp, `${check.locale}:${check.path}`);
    assert.equal(visible.lang, check.locale);
    assert.equal(visible.locale, check.locale);
    for (let item of check.include) {
      assert.ok(visible.text.includes(item), `${check.path} should include ${item}`);
    }
    for (let item of check.exclude) {
      assert.equal(visible.text.includes(item), false, `${check.path} should not include ${item}`);
    }
  }

  let publication = PUBLICATIONS.find((item) => item.id === 'pulse/agent-portal-retrospective');
  assert.ok(publication, 'representative Pulse publication must exist');
  let publicationProjectSlug = publication.primaryProjectId.replace(/^projects\//, '');
  let publicationProject = PROJECTS.find((project) => project.slug === publicationProjectSlug);
  assert.ok(publicationProject, 'representative Pulse publication must reference a project');

  for (let locale of ['en', 'ru', 'es']) {
    let localizedPublication = publication.locales[locale];
    let projectFallback = locale === 'en'
      ? publicationProject
      : PROJECT_TRANSLATIONS[locale][publicationProjectSlug];
    assert.ok(localizedPublication, `${locale}:publication locale`);
    assert.ok(projectFallback, `${locale}:publication project fallback`);

    await navigate(
      cdp,
      `${server.origin}/cv/projects/${publicationProjectSlug}/pulse/${publication.slug}/?lang=${locale}&mode=flat&resource-test=locale-audit-publication`,
      { expectedMode: 'flat', readyTimeoutMs: 20_000 }
    );
    let visible = await getVisiblePortfolioText(cdp, `${locale}:pulse/${publication.slug}`);
    assert.equal(visible.lang, locale);
    assert.equal(visible.locale, locale);
    assert.equal(new URL(visible.url).pathname, `/cv/projects/${publicationProjectSlug}/pulse/${publication.slug}/`);
    assert.ok(visible.articleText.includes(localizedPublication.title), `${locale}:publication title`);
    assert.ok(visible.articleText.includes(localizedPublication.summary), `${locale}:publication summary`);
    let publicationBody = loadPortfolioMarkdownContent(
      getPublicationContentPath(publication, locale),
    );
    for (let paragraph of getVisibleMarkdownParagraphs(publicationBody)) {
      assert.ok(visible.articleText.includes(paragraph), `${locale}:publication body`);
    }
    assert.equal(
      visible.articleText.includes(projectFallback.summary),
      false,
      `${locale}:publication must not render project summary`
    );
    for (let paragraph of getVisibleMarkdownParagraphs(
      loadProjectContent(publicationProjectSlug, locale),
    )) {
      assert.equal(
        visible.articleText.includes(paragraph),
        false,
        `${locale}:publication must not render project details`
      );
    }
  }

  let metadata = {
    ru: {
      selected: 'Избранный проект',
      author: 'Авторский проект',
      viewProject: PORTFOLIO_LOCALE_MESSAGES.ru['portfolio.link.learnMore'],
      viewRepository: PORTFOLIO_LOCALE_MESSAGES.ru['portfolio.link.viewRepository'],
    },
    es: {
      selected: 'Proyecto destacado',
      author: 'Proyecto propio',
      viewProject: PORTFOLIO_LOCALE_MESSAGES.es['portfolio.link.learnMore'],
      viewRepository: PORTFOLIO_LOCALE_MESSAGES.es['portfolio.link.viewRepository'],
    },
  };

  for (let locale of ['ru', 'es']) {
    for (let project of PROJECTS) {
      await navigate(
        cdp,
        `${server.origin}/cv/projects/${project.slug}/?lang=${locale}&mode=flat&resource-test=locale-audit-project`,
        { expectedMode: 'flat', readyTimeoutMs: 20_000 }
      );
      let visible = await getVisiblePortfolioText(cdp, `${locale}:${project.slug}`);
      let translation = PROJECT_TRANSLATIONS[locale][project.slug];
      assert.equal(visible.lang, locale);
      assert.equal(visible.locale, locale);
      assert.ok(visible.text.includes(translation.summary), `${locale}:${project.slug}:summary`);
      for (let paragraph of getVisibleMarkdownParagraphs(loadProjectContent(project, locale))) {
        assert.ok(visible.text.includes(paragraph), `${locale}:${project.slug}:details`);
      }

      if (project.kicker === 'Selected project') {
        assert.ok(visible.text.includes(metadata[locale].selected), `${locale}:${project.slug}:selected`);
      }
      if (project.kicker === 'Author project') {
        assert.ok(visible.text.includes(metadata[locale].author), `${locale}:${project.slug}:author`);
      }
      if (project.href && project.linkLabel === 'View project') {
        assert.ok(visible.text.includes(metadata[locale].viewProject), `${locale}:${project.slug}:viewProject`);
      }
      if (project.href && project.linkLabel === 'View repository') {
        assert.ok(visible.text.includes(metadata[locale].viewRepository), `${locale}:${project.slug}:viewRepository`);
      }

      assert.equal(visible.text.includes(project.summary), false, `${locale}:${project.slug}:rawSummary`);
      for (let paragraph of getVisibleMarkdownParagraphs(loadProjectContent(project, 'en'))) {
        assert.equal(visible.text.includes(paragraph), false, `${locale}:${project.slug}:rawDetails`);
      }
    }
  }
});

test('portfolio mobile graph modes expose their initial resource profiles', {
  timeout: 120_000,
}, async (t) => {
  if (EXTERNAL_TEST_URL) t.skip('graph mode comparison uses local deterministic routes');
  let page = await createMobilePage(t);
  if (!page) return;
  let { cdp, server } = page;

  let structuredReady = await navigate(cdp, `${server.origin}${STRUCTURED_ROUTE}`, {
    expectedMode: 'structured',
    readyTimeoutMs: 25_000,
    assertReady: false,
  });
  let structured = await sample(cdp, 'initial-structured');
  let structuredInternals = await getGraphInternals(cdp, 'initial-structured');
  await navigate(cdp, 'about:blank');
  let afterStructuredUnload = await sample(cdp, 'after-structured-unload');
  await navigate(cdp, `${server.origin}${FLAT_ROUTE}`, { expectedMode: 'flat' });
  let flat = await sample(cdp, 'initial-flat-after-structured');
  let flatInternals = await getGraphInternals(cdp, 'initial-flat-after-structured');
  await runPortfolioStep(cdp, 'switch flat route back to structured', `
    graph.setGraphViewMode?.('structured');
  `);
  let flatHiddenAfterSwitch = await getGraphInternals(cdp, 'flat-hidden-after-switch');

  let summary = {
    structured: {
      ready: structuredReady,
      heapUsed: structured.heapUsed,
      nodes: structured.page.nodes,
      resources: structured.page.resources,
      scripts: structured.page.scripts,
      styles: structured.page.styles,
      graphMode: structured.page.graphMode,
      workers: structured.metrics.WorkerGlobalScopes,
      internals: structuredInternals,
    },
    afterStructuredUnload: {
      workers: afterStructuredUnload.metrics.WorkerGlobalScopes,
      nodes: afterStructuredUnload.page.nodes,
    },
    flat: {
      heapUsed: flat.heapUsed,
      nodes: flat.page.nodes,
      resources: flat.page.resources,
      scripts: flat.page.scripts,
      styles: flat.page.styles,
      graphMode: flat.page.graphMode,
      workers: flat.metrics.WorkerGlobalScopes,
      internals: flatInternals,
    },
    flatHiddenAfterSwitch,
    deltas: {
      heapFlatMinusStructured: flat.heapUsed - structured.heapUsed,
      resourcesFlatMinusStructured: flat.page.resources - structured.page.resources,
      scriptsFlatMinusStructured: flat.page.scripts - structured.page.scripts,
    },
  };
  console.log(JSON.stringify(summary, null, 2));

  assert.equal(structured.page.graphMode, 'structured');
  assert.equal(flat.page.graphMode, 'flat');
  assert.equal(structuredInternals.mode, 'structured');
  assert.equal(flatInternals.mode, 'flat');
  assert.equal(structuredInternals.structuredVisible, true);
  assert.equal(structuredInternals.structuredPresent, true);
  assert.equal(structuredInternals.flatPresent, false);
  assert.equal(structuredInternals.flatVisible, false);
  assert.equal(flatInternals.flatVisible, true);
  assert.equal(flatInternals.flatPresent, true);
  assert.equal(flatInternals.structuredPresent, false);
  assert.equal(flatInternals.structuredVisible, false);
  assert.equal(flatHiddenAfterSwitch.mode, 'structured');
  assert.equal(flatHiddenAfterSwitch.flatPresent, true);
  assert.equal(flatHiddenAfterSwitch.flatVisible, false);
  assert.equal(flatHiddenAfterSwitch.flatWorker, false);
  assert.equal(flatHiddenAfterSwitch.structuredPresent, true);
  assert.equal(flatHiddenAfterSwitch.structuredVisible, true);
  assert.equal(afterStructuredUnload.metrics.WorkerGlobalScopes, 0);
  assert.ok(structured.page.resources < 90, `structured resource budget exceeded: ${structured.page.resources}`);
  assert.ok(flat.page.resources < 90, `flat resource budget exceeded: ${flat.page.resources}`);
  assert.ok(structured.heapUsed < 90 * 1024 * 1024, `structured heap budget exceeded: ${structured.heapUsed}`);
  assert.ok(flat.heapUsed < 90 * 1024 * 1024, `flat heap budget exceeded: ${flat.heapUsed}`);
});

async function dispatchPointerSwipe(cdp, { startX, startY, endX, endY, steps = 8 }) {
  await cdp.send('Input.dispatchMouseEvent', {
    type: 'mousePressed',
    x: startX,
    y: startY,
    button: 'left',
    buttons: 1,
    clickCount: 1,
  });
  for (let index = 1; index <= steps; index += 1) {
    let progress = index / steps;
    await cdp.send('Input.dispatchMouseEvent', {
      type: 'mouseMoved',
      x: Math.round(startX + (endX - startX) * progress),
      y: Math.round(startY + (endY - startY) * progress),
      button: 'left',
      buttons: 1,
    });
  }
  await cdp.send('Input.dispatchMouseEvent', {
    type: 'mouseReleased',
    x: endX,
    y: endY,
    button: 'left',
    buttons: 0,
    clickCount: 1,
  });
}

async function getDrawerState(cdp, label) {
  let result = await cdp.send('Runtime.evaluate', {
    returnByValue: true,
    expression: `(() => {
      const layout = document.querySelector('panel-layout');
      const primary = layout?.querySelector('layout-node[drawer-primary]');
      const content = primary?.querySelector('.panel-content') || primary;
      const rect = content?.getBoundingClientRect?.();
      const startDrawer = layout?.querySelector('layout-node[mobile-dock="start"][drawer-active-panel]');
      const endDrawer = layout?.querySelector('layout-node[mobile-dock="end"][drawer-active-panel]');
      const startRect = startDrawer?.getBoundingClientRect?.();
      const endRect = endDrawer?.getBoundingClientRect?.();
      return {
        label: ${JSON.stringify(label)},
        drawerMode: layout?.hasAttribute('drawer-mode-active') || false,
        startOpen: layout?.hasAttribute('drawer-start-open') || false,
        endOpen: layout?.hasAttribute('drawer-end-open') || false,
        startTransform: startDrawer ? getComputedStyle(startDrawer).transform : '',
        endTransform: endDrawer ? getComputedStyle(endDrawer).transform : '',
        contentRect: rect ? {
          left: Math.round(rect.left),
          top: Math.round(rect.top),
          width: Math.round(rect.width),
          height: Math.round(rect.height),
          right: Math.round(rect.right),
          bottom: Math.round(rect.bottom),
        } : null,
        startRect: startRect ? {
          left: Math.round(startRect.left),
          top: Math.round(startRect.top),
          width: Math.round(startRect.width),
          height: Math.round(startRect.height),
          right: Math.round(startRect.right),
          bottom: Math.round(startRect.bottom),
        } : null,
        endRect: endRect ? {
          left: Math.round(endRect.left),
          top: Math.round(endRect.top),
          width: Math.round(endRect.width),
          height: Math.round(endRect.height),
          right: Math.round(endRect.right),
          bottom: Math.round(endRect.bottom),
        } : null,
      };
    })()`,
  }, { label: `drawer state: ${label}`, timeoutMs: 10_000 });
  return result.result.value;
}

async function waitForDrawerState(cdp, label, predicate) {
  for (let index = 0; index < 20; index += 1) {
    let state = await getDrawerState(cdp, label);
    if (predicate(state)) return state;
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
  return getDrawerState(cdp, label);
}

test('portfolio mobile flat mode does not leak resources during panel lifecycle', {
  timeout: 120_000,
}, async (t) => {
  if (!EXTERNAL_TEST_URL) await stat(path.join(DIST_DIR, 'index.html'));
  let server = EXTERNAL_TEST_URL ? null : await startStaticServer();
  if (server) t.after(() => server.close());

  let chrome = await launchChrome();
  if (!chrome) {
    t.skip(`Chrome executable not found at ${CHROME_PATH}`);
    return;
  }
  t.after(() => chrome.close());

  let cdp = await createPage(chrome.port);
  t.after(() => {
    try {
      verifyNoBlockedRequests(cdp);
    } finally {
      cdp.close();
    }
  });

  await cdp.send('Page.enable');
  await cdp.send('Runtime.enable');
  await cdp.send('Network.enable');
  await cdp.send('Performance.enable');
  await cdp.send('Emulation.setDeviceMetricsOverride', MOBILE_VIEWPORT);
  await cdp.send('Emulation.setTouchEmulationEnabled', {
    enabled: true,
    maxTouchPoints: 5,
  });
  await cdp.send('Network.setBlockedURLs', {
    urls: [
      'https://fonts.googleapis.com/*',
      'https://fonts.gstatic.com/*',
      'https://rnd-pro.com/*',
      'https://img.youtube.com/*',
      'https://www.youtube.com/*',
      'https://github.com/*',
      'https://www.npmjs.com/*',
      'https://cdn.jsdelivr.net/*',
    ],
  });

  await navigate(cdp, EXTERNAL_TEST_URL || `${server.origin}${FLAT_ROUTE}`);
  let first = await sample(cdp, 'initial-flat');
  let interaction = await exercisePortfolioUi(cdp);
  let last = await sample(cdp, 'after-panel-cycles');
  await navigate(cdp, 'about:blank');
  let unloaded = await sample(cdp, 'after-unload');

  let heapGrowth = last.heapUsed - first.heapUsed;
  let listenerGrowth = last.metrics.JSEventListeners - first.metrics.JSEventListeners;
  let workerGrowth = last.metrics.WorkerGlobalScopes - first.metrics.WorkerGlobalScopes;

  let slowSteps = interaction.steps
    .filter((step) => step.duration > 500)
    .map(({ label, duration }) => ({ label, duration }));
  let summary = {
    url: first.page.url,
    heapGrowth,
    listenerGrowth,
    workerGrowth,
    initialNodes: first.page.nodes,
    finalNodes: last.page.nodes,
    initialResources: first.page.resources,
    finalResources: last.page.resources,
    workersAfterUnload: unloaded.metrics.WorkerGlobalScopes,
    slowSteps,
  };
  console.log(JSON.stringify(summary, null, 2));
  if (VERBOSE_OUTPUT) console.log(JSON.stringify({
    first,
    last,
    unloaded,
    interaction,
    summary,
    heapGrowth,
    listenerGrowth,
    workerGrowth,
  }, null, 2));

  assert.equal(interaction.mode, 'flat');
  assert.equal(last.page.portfolioLayouts, 1);
  assert.ok(last.page.panelLayouts <= 2, `unexpected nested panel layouts: ${last.page.panelLayouts}`);
  assert.equal(last.page.graphPanels, 1);
  assert.equal(last.page.canvasGraphs, 1);
  assert.equal(last.page.nodeCanvases, 1);
  assert.ok(last.page.nodes < 2500, `DOM node budget exceeded: ${last.page.nodes}`);
  assert.ok(last.heapUsed < 90 * 1024 * 1024, `heap budget exceeded: ${last.heapUsed}`);
  assert.ok(heapGrowth < 8 * 1024 * 1024, `heap grew too much after mobile panel cycles: ${heapGrowth}`);
  assert.ok(listenerGrowth < 160, `event listeners grew too much after panel cycles: ${listenerGrowth}`);
  assert.ok(workerGrowth <= 1, `workers grew unexpectedly after panel cycles: ${workerGrowth}`);
  assert.ok(last.page.resources < 90, `resource entry budget exceeded: ${last.page.resources}`);
  assert.equal(unloaded.metrics.WorkerGlobalScopes, 0, 'workers should be released after unloading the portfolio page');
});

test('portfolio mobile content surface opens and closes drawers with pointer swipes', {
  timeout: 120_000,
}, async (t) => {
  if (EXTERNAL_TEST_URL) t.skip('content swipe test uses local deterministic route geometry');
  await stat(path.join(DIST_DIR, 'index.html'));
  let server = await startStaticServer();
  t.after(() => server.close());

  let chrome = await launchChrome();
  if (!chrome) {
    t.skip(`Chrome executable not found at ${CHROME_PATH}`);
    return;
  }
  t.after(() => chrome.close());

  let cdp = await createPage(chrome.port);
  t.after(() => {
    try {
      verifyNoBlockedRequests(cdp);
    } finally {
      cdp.close();
    }
  });

  await cdp.send('Page.enable');
  await cdp.send('Runtime.enable');
  await cdp.send('Network.enable');
  await cdp.send('Performance.enable');
  await cdp.send('Emulation.setDeviceMetricsOverride', MOBILE_VIEWPORT);
  await cdp.send('Emulation.setTouchEmulationEnabled', {
    enabled: true,
    maxTouchPoints: 5,
  });
  await cdp.send('Network.setBlockedURLs', {
    urls: [
      'https://fonts.googleapis.com/*',
      'https://fonts.gstatic.com/*',
      'https://rnd-pro.com/*',
      'https://img.youtube.com/*',
      'https://www.youtube.com/*',
      'https://github.com/*',
      'https://www.npmjs.com/*',
      'https://cdn.jsdelivr.net/*',
    ],
  });

  await navigate(cdp, `${server.origin}/cv/projects/autobox-v1/?mode=flat&resource-test=mobile-content-swipe`);
  let initial = await getDrawerState(cdp, 'initial');
  assert.equal(initial.drawerMode, true);
  assert.equal(initial.startOpen, false);
  assert.equal(initial.endOpen, false);
  assert.ok(initial.contentRect?.width > 220, `unexpected content width: ${JSON.stringify(initial.contentRect)}`);

  let y = Math.round(initial.contentRect.top + Math.min(360, initial.contentRect.height * 0.55));
  let centerX = Math.round(initial.contentRect.left + initial.contentRect.width / 2);

  await dispatchPointerSwipe(cdp, {
    startX: centerX,
    startY: y,
    endX: Math.min(initial.contentRect.right - 16, centerX + 170),
    endY: y,
  });
  let startOpen = await waitForDrawerState(cdp, 'start open after primary swipe', (state) => state.startOpen);
  assert.equal(startOpen.startOpen, true, JSON.stringify(startOpen));

  let startCloseY = Math.round(startOpen.startRect.top + Math.min(360, startOpen.startRect.height * 0.55));
  await dispatchPointerSwipe(cdp, {
    startX: Math.round(startOpen.startRect.right - 42),
    startY: startCloseY,
    endX: Math.round(startOpen.startRect.left + 24),
    endY: startCloseY,
  });
  let startClosed = await waitForDrawerState(
    cdp,
    'start closed after reverse swipe',
    (state) => !state.startOpen && !state.endOpen
  );
  assert.equal(startClosed.startOpen, false, JSON.stringify(startClosed));
  assert.equal(startClosed.endOpen, false, JSON.stringify(startClosed));

  await cdp.send('Runtime.evaluate', {
    awaitPromise: true,
    expression: `(async () => {
      const layout = document.querySelector('panel-layout');
      const panelId = layout?.openPanel?.('portfolio-theme', {
        direction: 'horizontal',
        ratio: 0.72,
        behavior: {
          importance: 88,
          minInlineSize: 320,
          minBlockSize: 280,
          collapse: 'manual',
          mobileDock: 'end',
          swipeControl: 'rail',
        },
        source: 'resource-test',
        uiInvoked: true,
      });
      await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
      layout?.openDrawer?.('end', panelId);
      return panelId;
    })()`,
  }, { label: 'open theme drawer', timeoutMs: 10_000 });
  let endOpen = await waitForDrawerState(cdp, 'end theme open before reverse swipe', (state) => state.endOpen);
  assert.equal(endOpen.endOpen, true, JSON.stringify(endOpen));

  let endCloseY = Math.round(endOpen.endRect.top + Math.min(360, endOpen.endRect.height * 0.55));
  await dispatchPointerSwipe(cdp, {
    startX: Math.round(endOpen.endRect.left + 42),
    startY: endCloseY,
    endX: Math.round(endOpen.endRect.right - 24),
    endY: endCloseY,
  });
  let endClosed = await waitForDrawerState(
    cdp,
    'end closed after reverse swipe',
    (state) => !state.startOpen && !state.endOpen
  );
  assert.equal(endClosed.startOpen, false, JSON.stringify(endClosed));
  assert.equal(endClosed.endOpen, false, JSON.stringify(endClosed));
});

test('structured portfolio renders semantic PCB flow diodes', { timeout: 120_000 }, async (t) => {
  await stat(path.join(DIST_DIR, 'index.html'));
  let server = await startStaticServer();
  t.after(() => server.close());

  let chrome = await launchChrome();
  if (!chrome) {
    t.skip(`Chrome executable not found at ${CHROME_PATH}`);
    return;
  }
  t.after(() => chrome.close());

  let cdp = await createPage(chrome.port);
  t.after(() => {
    try {
      verifyNoBlockedRequests(cdp);
    } finally {
      cdp.close();
    }
  });
  await cdp.send('Page.enable');
  await cdp.send('Runtime.enable');
  await cdp.send('Network.enable');
  await cdp.send('Network.setBlockedURLs', {
    urls: [
      'https://fonts.googleapis.com/*',
      'https://fonts.gstatic.com/*',
      'https://rnd-pro.com/*',
      'https://img.youtube.com/*',
      'https://www.youtube.com/*',
      'https://github.com/*',
      'https://www.npmjs.com/*',
      'https://cdn.jsdelivr.net/*',
    ],
  });
  await cdp.send('Emulation.setDeviceMetricsOverride', {
    width: 1440,
    height: 900,
    deviceScaleFactor: 1,
    mobile: false,
  });

  let runtimeErrors = [];
  let removeExceptionListener = cdp.on('Runtime.exceptionThrown', (params) => {
    runtimeErrors.push(params.exceptionDetails?.exception?.description || params.exceptionDetails?.text || 'unknown error');
  });
  t.after(removeExceptionListener);

  await navigate(cdp, `${server.origin}/cv/?mode=structured&resource-test=pcb-flow`, {
    expectedMode: 'structured',
    readyTimeoutMs: 30_000,
  });
  let result = await cdp.send('Runtime.evaluate', {
    awaitPromise: true,
    returnByValue: true,
    expression: `new Promise((resolve) => {
      const started = performance.now();
      const inspect = () => {
        const canvas = document.querySelector('portfolio-graph-panel node-canvas');
        const flowMarkers = [...(canvas?.querySelectorAll('g.sn-conn-marker[data-type="flow"]') || [])];
        if (flowMarkers.length || performance.now() - started > 20_000) {
          resolve({
            markerCount: flowMarkers.length,
            malformedCount: flowMarkers.filter((marker) => !marker.querySelector('rect') || !marker.querySelector('polygon')).length,
            oldArrowCount: canvas?.querySelectorAll('.sn-conn-arrow').length || 0,
            gateCount: canvas?.querySelectorAll('g.sn-conn-marker[data-type="gate"]').length || 0,
            colors: flowMarkers.slice(0, 5).map((marker) => getComputedStyle(marker).color),
          });
          return;
        }
        requestAnimationFrame(inspect);
      };
      inspect();
    })`,
  }, { label: 'wait for structured PCB flow markers', timeoutMs: 30_000 });

  assert.equal(runtimeErrors.length, 0, JSON.stringify(runtimeErrors));
  assert.ok(result.result.value.markerCount > 0, JSON.stringify(result.result.value));
  assert.equal(result.result.value.malformedCount, 0, JSON.stringify(result.result.value));
  assert.equal(result.result.value.oldArrowCount, 0, JSON.stringify(result.result.value));
  assert.equal(result.result.value.gateCount, 0, JSON.stringify(result.result.value));
  assert.equal(result.result.value.colors.every(Boolean), true, JSON.stringify(result.result.value));
});

test('portfolio Phase 5 corrective tree & routing contract', {
  timeout: 60_000,
}, async (t) => {
  if (EXTERNAL_TEST_URL) t.skip('corrective smoke uses local deterministic routes');
  let page = await createPortfolioPage(t, {
    viewport: DESKTOP_VIEWPORT,
    touch: false,
  });
  if (!page) return;
  let { cdp, server } = page;

  // 1. Navigate to the projects index page
  await navigate(cdp, `${server.origin}/cv/?mode=flat`, {
    expectedMode: 'flat',
  });

  let treeState = await cdp.send('Runtime.evaluate', {
    awaitPromise: true,
    returnByValue: true,
    expression: `(async () => {
      try {
        const waitFor = async (read, timeoutMs = 8000) => {
          const started = performance.now();
          while (performance.now() - started < timeoutMs) {
            const val = read();
            if (val) return val;
            await new Promise((resolve) => setTimeout(resolve, 50));
          }
          return read();
        };

        const getAutoboxRows = () => Array.from(document.querySelectorAll('.sn-tree-row'))
          .filter((row) => row.querySelector('.sn-tree-label')?.textContent?.trim() === 'AUTOBOX v1');

        const autoboxRows = await waitFor(() => {
          let rows = getAutoboxRows();
          return rows.length > 0 ? rows : null;
        });

        if (!autoboxRows) return { ok: false, reason: 'autobox-row-not-found' };

        const initialCount = autoboxRows.length;
        const isDirectory = autoboxRows[0].getAttribute('aria-expanded') !== null;

        autoboxRows[0].querySelector('.sn-tree-toggle')?.click();

        const getChildOccurrence = () => Array.from(document.querySelectorAll('.sn-tree-row'))
          .find((row) => row.querySelector('.sn-tree-label')?.textContent?.trim() === 'AUTOBOX v1: A Repeatable Museum-Scanning Process');
        const childOccurrence = await waitFor(() => getChildOccurrence() || null);

        if (!childOccurrence) return { ok: false, reason: 'child-occurrence-not-found' };

        const projectRow = getAutoboxRows()[0];
        projectRow?.click();

        const projectSelected = await waitFor(() => {
          let selected = getAutoboxRows().some(
            (row) => row.getAttribute('aria-selected') === 'true'
          );
          return location.pathname === '/cv/projects/autobox-v1/' && selected ? true : null;
        });

        if (!projectSelected) {
          return {
            ok: false,
            reason: 'project-selection-timeout',
            pathname: location.pathname,
            clickedElement: projectRow ? {
              tagName: projectRow.tagName,
              textContent: projectRow.textContent,
              rowId: projectRow.dataset.treeId,
              rowIndex: projectRow.dataset.index,
            } : null,
          };
        }

        const selectedProjectRow = getAutoboxRows()[0];
        if (selectedProjectRow?.getAttribute('aria-expanded') !== 'true') {
          selectedProjectRow?.querySelector('.sn-tree-toggle')?.click();
          await waitFor(() => getChildOccurrence() || null);
        }
        getChildOccurrence()?.querySelector('.sn-tree-label')?.click();

        const childSelected = await waitFor(() => {
          return location.pathname === '/cv/projects/autobox-v1/pulse/autobox-v1-retrospective/' ? true : null;
        });

        const selectedTreeRows = Array.from(document.querySelectorAll('.sn-tree-row'))
          .filter((row) => row.getAttribute('aria-selected') === 'true')
          .map((row) => row.dataset.treeId);

        const allTreeRows = Array.from(document.querySelectorAll('.sn-tree-row'))
          .map((row) => ({
            label: row.querySelector('.sn-tree-label')?.textContent?.trim(),
            id: row.dataset.treeId,
            expanded: row.getAttribute('aria-expanded'),
          }));

        return {
          ok: true,
          initialCount,
          isDirectory,
          childFound: Boolean(childOccurrence),
          projectSelected,
          childSelected,
          selectedTreeRows,
          canonicalUrl: location.pathname,
        };
      } catch (err) {
        return { ok: false, reason: err.stack || String(err) };
      }
    })()`,
  }, { label: 'verify tree projection behavior', timeoutMs: 30_000 });

  let res = treeState.result.value;
  assert.equal(res.ok, true, res.reason || JSON.stringify(res));
  assert.equal(res.initialCount, 1, 'Should only be one AUTOBOX v1 project node');
  assert.equal(res.isDirectory, true, 'AUTOBOX v1 should be a directory branch');
  assert.equal(res.childFound, true, 'Should find the child occurrence under AUTOBOX v1');
  assert.equal(res.projectSelected, true, 'Selecting project folder should select projects/autobox-v1');
  assert.equal(res.childSelected, true, 'Selecting child occurrence should select pulse/autobox-v1-retrospective');
  assert.deepEqual(res.selectedTreeRows, ['occurrence/autobox-v1/pulse/autobox-v1-retrospective'], 'Exactly one tree row (the primary occurrence) should be selected');
  assert.equal(res.canonicalUrl, '/cv/projects/autobox-v1/pulse/autobox-v1-retrospective/', 'Nested URL should be canonical projects path');

  await navigate(cdp, `${server.origin}/cv/pulse/autobox-v1-retrospective/?mode=flat`, {
    expectedMode: 'flat',
  });

  let aliasState = await cdp.send('Runtime.evaluate', {
    awaitPromise: true,
    returnByValue: true,
    expression: `(async () => {
      const waitFor = async (read, timeoutMs = 8000) => {
        const started = performance.now();
        while (performance.now() - started < timeoutMs) {
          const val = read();
          if (val) return val;
          await new Promise((resolve) => setTimeout(resolve, 50));
        }
        return read();
      };

      const selectedId = await waitFor(() => {
        const selected = Array.from(document.querySelectorAll('.sn-tree-row'))
          .find((row) => row.getAttribute('aria-selected') === 'true');
        return selected?.dataset.treeId === 'occurrence/autobox-v1/pulse/autobox-v1-retrospective'
          ? 'pulse/autobox-v1-retrospective'
          : null;
      });

      const selectedTreeRows = Array.from(document.querySelectorAll('.sn-tree-row'))
        .filter((row) => row.getAttribute('aria-selected') === 'true')
        .map((row) => row.dataset.treeId);

      const canonicalLink = document.querySelector('link[rel="canonical"]')?.getAttribute('href');

      return {
        selectedId,
        selectedTreeRows,
        canonicalLink,
      };
    })()`,
  }, { label: 'verify legacy alias loading', timeoutMs: 30_000 });

  let aliasRes = aliasState.result.value;
  assert.equal(aliasRes.selectedId, 'pulse/autobox-v1-retrospective', 'Alias should select pulse/autobox-v1-retrospective');
  assert.deepEqual(aliasRes.selectedTreeRows, ['occurrence/autobox-v1/pulse/autobox-v1-retrospective'], 'Alias should highlight primary tree occurrence');
  assert.equal(aliasRes.canonicalLink, 'https://MakerDrive.github.io/cv/projects/autobox-v1/pulse/autobox-v1-retrospective/', 'Canonical link in alias header must target the canonical project-owned route');
});

test('Pulse feed stays compact and opens publications without reloading the workspace', {
  timeout: 60_000,
}, async (t) => {
  if (EXTERNAL_TEST_URL) t.skip('Pulse navigation smoke uses local deterministic routes');
  let page = await createPortfolioPage(t, {
    viewport: DESKTOP_VIEWPORT,
    touch: false,
  });
  if (!page) return;
  let { cdp, server } = page;

  await navigate(cdp, `${server.origin}/cv/pulse/?lang=ru&mode=flat`, {
    expectedMode: 'flat',
  });

  let before = await cdp.send('Runtime.evaluate', {
    returnByValue: true,
    expression: `(() => {
      const card = document.querySelector('.pulse-card');
      const link = document.querySelector('a[data-publication-id="pulse/agent-portal-retrospective"]');
      const cardStyle = card ? getComputedStyle(card) : null;
      return {
        timeOrigin: performance.timeOrigin,
        filters: document.querySelectorAll('.pulse-filter-chips').length,
        latestSection: Boolean(document.querySelector('#latest-updates')),
        cardHeight: card?.getBoundingClientRect().height || 0,
        cardMinHeight: cardStyle?.minHeight || '',
        cardPadding: cardStyle?.padding || '',
        linkFound: Boolean(link),
      };
    })()`,
  }, { label: 'inspect compact Pulse feed', timeoutMs: 10_000 });

  let beforeState = before.result.value;
  assert.equal(beforeState.filters, 0, 'Pulse feed should not render filter controls');
  assert.equal(beforeState.latestSection, true, 'Dated publications should render the latest section');
  assert.equal(beforeState.cardMinHeight, '0px', 'Pulse cards must override the global article minimum height');
  assert.equal(beforeState.cardPadding, '0px', 'Pulse cards must not inherit global article padding');
  assert.ok(beforeState.cardHeight > 0 && beforeState.cardHeight < 500, `Pulse card should size to content, got ${beforeState.cardHeight}px`);
  assert.equal(beforeState.linkFound, true, 'Expected Agent Portal publication link in the Pulse feed');

  await cdp.send('Runtime.evaluate', {
    expression: `document.querySelector('a[data-publication-id="pulse/agent-portal-retrospective"]')?.click()`,
  }, { label: 'activate Pulse publication link', timeoutMs: 10_000 });
  await new Promise((resolve) => setTimeout(resolve, 750));

  let after = await cdp.send('Runtime.evaluate', {
    returnByValue: true,
    expression: `({
      timeOrigin: performance.timeOrigin,
      pathname: location.pathname,
      selectedTreeRows: Array.from(document.querySelectorAll('.sn-tree-row[aria-selected="true"]'))
        .map((row) => row.dataset.treeId),
    })`,
  }, { label: 'inspect in-app Pulse publication activation', timeoutMs: 10_000 });

  let afterState = after.result.value;
  assert.equal(afterState.timeOrigin, beforeState.timeOrigin, 'Pulse publication activation must not reload the document');
  assert.equal(afterState.pathname, '/cv/projects/agent-portal/pulse/agent-portal-retrospective/');
  assert.deepEqual(afterState.selectedTreeRows, ['occurrence/agent-portal/pulse/agent-portal-retrospective']);
});

test.skip('legacy CV Show browser contract superseded by shared chat/transport acceptance below', {
  timeout: 60_000,
}, async (t) => {
  if (EXTERNAL_TEST_URL) t.skip('CV Show smoke uses local deterministic routes');
  let page = await createPortfolioPage(t, {
    viewport: DESKTOP_VIEWPORT,
    touch: false,
  });
  if (!page) return;
  let { cdp, server } = page;

  await navigate(cdp, `${server.origin}/cv/?lang=ru&mode=flat`, { expectedMode: 'flat' });
  let initial = await cdp.send('Runtime.evaluate', {
    returnByValue: true,
    expression: `({
      globalPlayer: Boolean(document.querySelector('body > tour-player')),
      selected: document.querySelector('.sn-tree-row[aria-selected="true"]')?.dataset.treeId,
      selectedLabel: document.querySelector('.sn-tree-row[aria-selected="true"] .sn-tree-label')?.textContent?.trim(),
    })`,
  });
  assert.equal(initial.result.value.globalPlayer, false);

  await cdp.send('Runtime.evaluate', {
    expression: `(() => {
      window.__cvShowUtterances = [];
      class MockUtterance extends EventTarget {
        constructor(text) { super(); this.text = text; window.__cvShowUtterances.push(this); }
        set onend(fn) { this.__onend = fn; }
        get onend() { return this.__onend; }
        set onerror(fn) { this.__onerror = fn; }
        get onerror() { return this.__onerror; }
      }
      window.SpeechSynthesisUtterance = MockUtterance;
      window.speechSynthesis.constructor.prototype.speak = function() {};
    })()`,
  });
  await cdp.send('Runtime.evaluate', {
    expression: `document.querySelector('.pulse-tour-button')?.click()`,
  }, { label: 'open CV Show', timeoutMs: 5_000 });
  await cdp.send('Runtime.evaluate', {
    awaitPromise: true,
    expression: `new Promise((resolve, reject) => {
      const started = performance.now();
      const check = () => {
        if (document.querySelector('portfolio-tour-panel tour-player')) return resolve();
        if (performance.now() - started > 8000) return reject(new Error('CV Show panel did not open'));
        setTimeout(check, 50);
      };
      check();
    })`,
  });
  await cdp.send('Runtime.evaluate', {
    expression: `document.querySelector('[data-tour-action="full"]')?.click()`,
  }, { label: 'start full CV Show', timeoutMs: 5_000 });

  let opening = await cdp.send('Runtime.evaluate', {
    returnByValue: true,
    expression: `({
      progress: document.querySelector('portfolio-tour-panel output')?.textContent?.trim(),
      title: document.querySelector('#tour-step-title')?.textContent?.trim(),
      visibleTransport: Array.from(document.querySelectorAll('portfolio-tour-panel .tour-controls button'))
        .filter((button) => getComputedStyle(button).display !== 'none')
        .map((button) => button.dataset.tourAction),
    })`,
  });
  assert.deepEqual(opening.result.value, {
    progress: '1 / 8',
    title: 'Кто я',
    visibleTransport: ['previous', 'pause', 'stop', 'next'],
  });

  await cdp.send('Runtime.evaluate', {
    expression: `window.__cvShowUtterances.at(-1)?.onend?.()`,
  }, { label: 'finish opening narration', timeoutMs: 5_000 });
  await cdp.send('Runtime.evaluate', {
    awaitPromise: true,
    expression: `new Promise((resolve, reject) => {
      const started = performance.now();
      const check = () => {
        const progress = document.querySelector('portfolio-tour-panel output')?.textContent?.trim();
        if (progress === '2 / 8') return resolve();
        if (performance.now() - started > 8000) return reject(new Error(progress || 'no progress'));
        setTimeout(check, 50);
      };
      check();
    })`,
  });

  await cdp.send('Runtime.evaluate', {
    expression: `document.querySelector('[data-tour-action="pause"]')?.click(); window.__cvShowUtterances.at(-1)?.onend?.()`,
  }, { label: 'pause before narration completion', timeoutMs: 5_000 });
  await new Promise((resolve) => setTimeout(resolve, 600));
  let paused = await cdp.send('Runtime.evaluate', {
    returnByValue: true,
    expression: `({
      progress: document.querySelector('portfolio-tour-panel output')?.textContent?.trim(),
      pauseLabel: document.querySelector('[data-tour-action="pause"]')?.getAttribute('aria-label'),
    })`,
  });
  assert.deepEqual(paused.result.value, { progress: '2 / 8', pauseLabel: 'Продолжить озвучивание' });

  await cdp.send('Runtime.evaluate', {
    expression: `document.querySelector('[data-tour-action="pause"]')?.click()`,
  }, { label: 'resume CV Show', timeoutMs: 5_000 });
  await cdp.send('Runtime.evaluate', {
    awaitPromise: true,
    expression: `new Promise((resolve, reject) => {
      const started = performance.now();
      const check = () => {
        const progress = document.querySelector('portfolio-tour-panel output')?.textContent?.trim();
        if (progress === '3 / 8') return resolve();
        if (performance.now() - started > 8000) return reject(new Error(progress || 'no progress'));
        setTimeout(check, 50);
      };
      check();
    })`,
  });

  await cdp.send('Runtime.evaluate', {
    expression: `document.querySelector('[data-tour-action="previous"]')?.click()`,
  }, { label: 'go to previous CV Show beat', timeoutMs: 5_000 });
  let previous = await cdp.send('Runtime.evaluate', {
    returnByValue: true,
    expression: `document.querySelector('portfolio-tour-panel output')?.textContent?.trim()`,
  });
  assert.equal(previous.result.value, '2 / 8');

  await cdp.send('Runtime.evaluate', {
    expression: `document.querySelector('[data-tour-action="stop"]')?.click()`,
  }, { label: 'stop CV Show', timeoutMs: 5_000 });
  let stopped = await cdp.send('Runtime.evaluate', {
    returnByValue: true,
    awaitPromise: true,
    expression: `new Promise((resolve) => requestAnimationFrame(() => resolve({
      playing: document.querySelector('portfolio-tour-panel tour-player')?.isPlaying,
      selected: document.querySelector('.sn-tree-row[aria-selected="true"]')?.dataset.treeId,
      presenterVisible: document.querySelector('.symbiote-presenter-cursor')?.classList.contains('is-visible') || false,
      startVisible: !document.querySelector('.tour-start')?.hidden,
    })))`,
  });
  assert.deepEqual(stopped.result.value, {
    playing: false,
    selected: initial.result.value.selected,
    presenterVisible: false,
    startVisible: true,
  });

  await cdp.send('Runtime.evaluate', {
    expression: `document.querySelector('panel-layout')?.closeUiPanel?.('portfolio-tour')`,
  }, { label: 'close CV Show panel', timeoutMs: 5_000 });
  await cdp.send('Runtime.evaluate', {
    expression: `document.querySelector('.pulse-tour-button')?.click()`,
  }, { label: 'reopen CV Show panel', timeoutMs: 5_000 });
  let reopened = await cdp.send('Runtime.evaluate', {
    returnByValue: true,
    awaitPromise: true,
    expression: `new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve({
      panels: document.querySelectorAll('portfolio-tour-panel').length,
      players: document.querySelectorAll('portfolio-tour-panel tour-player').length,
      playing: document.querySelector('portfolio-tour-panel tour-player')?.isPlaying,
    }))))`,
  });
  assert.deepEqual(reopened.result.value, { panels: 1, players: 1, playing: false });

  await cdp.send('Runtime.evaluate', {
    expression: `document.querySelector('[data-tour-action="full"]')?.click()`,
  }, { label: 'restart full CV Show for completion', timeoutMs: 5_000 });
  let completed = await cdp.send('Runtime.evaluate', {
    returnByValue: true,
    awaitPromise: true,
    expression: `(async () => {
      const expectedSelections = [
        ${JSON.stringify(initial.result.value.selectedLabel)},
        'R&D-инжиниринг',
        'Agent Portal',
        'Symbiote Workspace',
        'AUTOBOX v1',
        'AUTOBOX v1',
        'Пульс',
        ${JSON.stringify(initial.result.value.selectedLabel)},
      ];
      const waitFor = async (check, label) => {
        const started = performance.now();
        while (performance.now() - started < 8000) {
          const value = check();
          if (value) return value;
          await new Promise((resolve) => setTimeout(resolve, 50));
        }
        const selected = document.querySelector('.sn-tree-row[aria-selected="true"] .sn-tree-label')?.textContent?.trim();
        const progress = document.querySelector('portfolio-tour-panel output')?.textContent?.trim();
        const error = document.querySelector('portfolio-tour-panel .tour-error')?.textContent?.trim();
        throw new Error('CV Show did not settle: ' + label + '; progress=' + progress + '; selected=' + selected + '; error=' + error);
      };
      const selectedSequence = [];
      for (let index = 0; index < expectedSelections.length; index += 1) {
        await waitFor(() => {
          const selected = document.querySelector('.sn-tree-row[aria-selected="true"] .sn-tree-label')?.textContent?.trim();
          return selected === expectedSelections[index]
            && document.querySelector('portfolio-tour-panel output')?.textContent?.trim() === (index + 1) + ' / 8';
        }, 'beat ' + (index + 1));
        selectedSequence.push(expectedSelections[index]);
        window.__cvShowUtterances.at(-1)?.onend?.();
      }
      await waitFor(
        () => document.querySelector('portfolio-tour-panel tour-player')?.isPlaying === false,
        'completion cleanup',
      );
      await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
      return {
        selectedSequence,
        selected: document.querySelector('.sn-tree-row[aria-selected="true"] .sn-tree-label')?.textContent?.trim(),
        presenterVisible: document.querySelector('.symbiote-presenter-cursor')?.classList.contains('is-visible') || false,
        startVisible: !document.querySelector('.tour-start')?.hidden,
        triggerFocused: document.activeElement?.classList.contains('pulse-tour-button') || false,
      };
    })()`,
  }, { label: 'complete every CV Show beat', timeoutMs: 45_000 });
  assert.equal(
    completed.exceptionDetails,
    undefined,
    completed.exceptionDetails?.exception?.description || 'full CV Show evaluation failed',
  );
  assert.deepEqual(completed.result.value, {
    selectedSequence: [
      initial.result.value.selectedLabel,
      'R&D-инжиниринг',
      'Agent Portal',
      'Symbiote Workspace',
      'AUTOBOX v1',
      'AUTOBOX v1',
      'Пульс',
      initial.result.value.selectedLabel,
    ],
    selected: initial.result.value.selectedLabel,
    presenterVisible: false,
    startVisible: true,
    triggerFocused: true,
  });

  await cdp.send('Runtime.evaluate', {
    expression: `document.querySelector('[data-tour-action="short"]')?.click()`,
  }, { label: 'start CV Show before panel close', timeoutMs: 5_000 });
  await cdp.send('Runtime.evaluate', {
    expression: `document.querySelector('panel-layout')?.closeUiPanel?.('portfolio-tour')`,
  }, { label: 'close CV Show while playing', timeoutMs: 5_000 });
  let closedWhilePlaying = await cdp.send('Runtime.evaluate', {
    returnByValue: true,
    awaitPromise: true,
    expression: `new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve({
      playing: document.querySelector('portfolio-tour-panel tour-player')?.isPlaying || false,
      selected: document.querySelector('.sn-tree-row[aria-selected="true"]')?.dataset.treeId,
      presenterVisible: document.querySelector('.symbiote-presenter-cursor')?.classList.contains('is-visible') || false,
      triggerFocused: document.activeElement?.classList.contains('pulse-tour-button') || false,
    }))))`,
  });
  assert.deepEqual(closedWhilePlaying.result.value, {
    playing: false,
    selected: initial.result.value.selected,
    presenterVisible: false,
    triggerFocused: true,
  });

  await cdp.send('Emulation.setDeviceMetricsOverride', {
    width: 390,
    height: 844,
    deviceScaleFactor: 1,
    mobile: true,
  });
  await navigate(cdp, `${server.origin}/cv/?lang=ru&mode=flat&resource-test=cv-show-mobile`, {
    expectedMode: 'flat',
  });
  await cdp.send('Runtime.evaluate', {
    expression: `document.querySelector('.pulse-tour-button')?.click()`,
  }, { label: 'open mobile CV Show', timeoutMs: 5_000 });
  let mobile = await cdp.send('Runtime.evaluate', {
    returnByValue: true,
    awaitPromise: true,
    expression: `new Promise((resolve, reject) => {
      const started = performance.now();
      const check = () => {
        const layout = document.querySelector('panel-layout');
        const panel = document.querySelector('portfolio-tour-panel');
        const buttons = Array.from(panel?.querySelectorAll('.tour-start button') || []);
        const rect = panel?.getBoundingClientRect();
        const ready = layout?.hasAttribute('drawer-end-open') && rect?.width > 0;
        if (ready) {
          return resolve({
            drawerOpen: true,
            panelFitsViewport: rect.left >= 0 && rect.right <= innerWidth,
            horizontalOverflow: document.documentElement.scrollWidth - innerWidth,
            controlsMeetTouchTarget: buttons.every((button) => button.getBoundingClientRect().height >= 44),
            focusedControl: document.activeElement?.textContent?.trim(),
          });
        }
        if (performance.now() - started > 8000) {
          return reject(new Error('mobile CV Show drawer did not open'));
        }
        setTimeout(check, 50);
      };
      check();
    })`,
  }, { label: 'inspect mobile CV Show', timeoutMs: 10_000 });
  assert.deepEqual(mobile.result.value, {
    drawerOpen: true,
    panelFitsViewport: true,
    horizontalOverflow: 0,
    controlsMeetTouchTarget: true,
    focusedControl: 'Краткий Show',
  });
});

test('outer Agent dock owns nested desktop and mobile responsive projection', async (t) => {
  let page = await createPortfolioPage(t, {
    viewport: { width: 1087, height: 719, deviceScaleFactor: 1, mobile: false },
    touch: false,
  });
  if (!page) return;
  let { cdp, server } = page;
  await navigate(cdp, `${server.origin}/cv/`, { expectedMode: 'structured' });
  await clickVisible(cdp, '.pulse-tour-button', 'open Agent at constrained desktop width');

  const inspectProjection = (label) => cdp.send('Runtime.evaluate', {
    awaitPromise: true,
    returnByValue: true,
    expression: `new Promise((resolve, reject) => {
      const started = performance.now();
      const findPanel = (node, type) => {
        if (!node) return null;
        if (node.type === 'panel' && node.panelType === type) return node;
        return findPanel(node.first, type) || findPanel(node.second, type);
      };
      const check = () => {
        const dock = document.querySelector('agent-dock-shell');
        const outer = dock?.ref?.layout;
        const inner = document.querySelector('.portfolio-layout');
        const tree = findPanel(inner?.$.layoutTree, 'portfolio-tree');
        const graph = findPanel(inner?.$.layoutTree, 'portfolio-graph');
        const viewer = findPanel(inner?.$.layoutTree, 'portfolio-viewer');
        const graphRect = document.querySelector('portfolio-graph-panel')?.getBoundingClientRect();
        const viewerRect = document.querySelector('portfolio-viewer-panel')?.getBoundingClientRect();
        const overlapWidth = graphRect && viewerRect
          ? Math.max(0, Math.min(graphRect.right, viewerRect.right) - Math.max(graphRect.left, viewerRect.left))
          : 0;
        const overlapHeight = graphRect && viewerRect
          ? Math.max(0, Math.min(graphRect.bottom, viewerRect.bottom) - Math.max(graphRect.top, viewerRect.top))
          : 0;
        if (dock?.hasAttribute('open') && inner && tree && graph && viewer) return resolve({
          label: ${JSON.stringify(label)},
          viewport: innerWidth,
          outerDrawer: outer?.hasAttribute('drawer-mode-active') || false,
          innerWidth: Math.round(inner.getBoundingClientRect().width),
          innerResponsive: inner.hasAttribute('responsive-active'),
          innerDrawer: inner.hasAttribute('drawer-mode-active'),
          graphCollapsed: Boolean(graph.collapsed),
          treeCollapsed: Boolean(tree.collapsed),
          viewerCollapsed: Boolean(viewer.collapsed),
          viewerVisible: Boolean(viewerRect?.width > 0 && viewerRect.height > 0),
          graphViewerOverlap: Math.round(overlapWidth * overlapHeight),
          horizontalOverflow: Math.max(0, document.documentElement.scrollWidth - innerWidth),
        });
        if (performance.now() - started > 5000) return reject(new Error('responsive projection did not settle'));
        requestAnimationFrame(check);
      };
      requestAnimationFrame(() => requestAnimationFrame(check));
    })`,
  }, { label: `inspect ${label} nested responsive projection`, timeoutMs: 7_000 });

  let desktop = (await inspectProjection('desktop')).result.value;
  assert.equal(desktop.viewport, 1087);
  assert.equal(desktop.outerDrawer, false);
  assert.ok(desktop.innerWidth < 760);
  assert.equal(desktop.innerResponsive, false);
  assert.equal(desktop.innerDrawer, false);
  assert.equal(desktop.graphCollapsed, true);
  assert.equal(desktop.treeCollapsed, false, JSON.stringify(desktop));
  assert.equal(desktop.viewerCollapsed, false);
  assert.equal(desktop.viewerVisible, true);
  assert.equal(desktop.graphViewerOverlap, 0);
  assert.equal(desktop.horizontalOverflow, 0);

  await cdp.send('Emulation.setDeviceMetricsOverride', {
    width: 390,
    height: 844,
    deviceScaleFactor: 1,
    mobile: true,
  });
  let mobile = (await inspectProjection('mobile')).result.value;
  assert.equal(mobile.viewport, 390);
  assert.equal(mobile.outerDrawer, true);
  assert.equal(mobile.innerResponsive, true);
  assert.equal(mobile.innerDrawer, true);

  await cdp.send('Emulation.setDeviceMetricsOverride', {
    width: 1087,
    height: 719,
    deviceScaleFactor: 1,
    mobile: false,
  });
  let restored = (await inspectProjection('restored-desktop')).result.value;
  assert.equal(restored.outerDrawer, false);
  assert.equal(restored.innerResponsive, false);
  assert.equal(restored.innerDrawer, false);
  assert.equal(restored.graphCollapsed, true);
  assert.equal(restored.treeCollapsed, false);
  assert.equal(restored.viewerCollapsed, false);
  assert.equal(restored.viewerVisible, true);
  assert.equal(restored.horizontalOverflow, 0);
});

test('CV Show mounts shared controls and plays the private local RU narration', {
  timeout: 210_000,
}, async (t) => {
  if (EXTERNAL_TEST_URL) t.skip('local narration acceptance requires ignored local audio fixtures');
  let page = await createPortfolioPage(t, {
    viewport: DESKTOP_VIEWPORT,
    touch: false,
  });
  if (!page) return;
  let { cdp, server } = page;

  await cdp.send('Page.addScriptToEvaluateOnNewDocument', {
    source: `try { localStorage.setItem('cv-portfolio-locale', 'ru'); } catch {}
    globalThis.__cvShowCueHistory = [];
    globalThis.__cvShowResetHistory = [];
    globalThis.__cvShowMediaEventHistory = [];
    globalThis.__cvShowGenerationHistory = [];
    globalThis.__cvShowSeekFailureHistory = [];
    globalThis.__cvShowResultHistory = [];
    globalThis.__cvShowPhaseHistory = [];
    globalThis.__cvShowPauseHistory = [];
    globalThis.__cvShowTargetState = (targetId) => {
      const anchor = document.querySelector('[data-tour-target="' + targetId + '"]');
      let target = anchor?.nextElementSibling;
      while (target?.classList?.contains('portfolio-tour-target')) target = target.nextElementSibling;
      target ||= anchor?.parentElement || anchor;
      const rect = target?.getBoundingClientRect?.();
      return {
        selectedId: document.querySelector('.sn-tree-row[aria-selected="true"]')?.dataset?.treeId || '',
        viewerPath: document.querySelector('source-viewer')?._currentPath || '',
        targetReady: Boolean(rect?.width > 0 && rect?.height > 0),
      };
    };
    globalThis.__recordCvShowResult = (event) => {
      globalThis.__cvShowResultHistory.push({
        ...(event.detail || {}),
        ...globalThis.__cvShowTargetState('article.symbiote-workspace.intro'),
        at: performance.now(),
      });
    };
    document.addEventListener('portfolio-show-phase', (event) => {
      const detail = event.detail || {};
      const entry = {
        requestId: detail.requestId ?? null,
        aligned: detail.aligned === true,
        directiveIds: (detail.directives || []).map(({ id }) => id),
        dispatchedAt: performance.now(),
        completedAt: null,
        result: null,
      };
      globalThis.__cvShowPhaseHistory.push(entry);
      if (typeof detail.complete === 'function') {
        const complete = detail.complete;
        detail.complete = (result) => {
          entry.completedAt = performance.now();
          entry.result = result;
          complete(result);
        };
      }
    }, { capture: true });
    document.addEventListener('portfolio-show-aligned-cue', (event) => {
      const receipt = event.detail || {};
      const cue = receipt.cue || {};
      const source = receipt.source || {};
      const entry = {
        id: source.id || '',
        cueTimeMs: receipt.cueTimeMs ?? null,
        mediaTimeMs: receipt.mediaTimeMs ?? null,
        reason: receipt.reason || '',
        alignmentSource: cue.alignment?.provenance?.source || '',
        alignmentResolution: cue.alignment?.resolution || '',
        ...globalThis.__cvShowTargetState('article.symbiote-workspace.intro'),
        at: performance.now(),
      };
      globalThis.__cvShowCueHistory.push(entry);
    });
    document.addEventListener('portfolio-show-pause', (event) => {
      globalThis.__cvShowPauseHistory.push({
        target: event.target?.tagName || '',
        path: event.composedPath().map((node) => node?.tagName || node?.nodeName || '').filter(Boolean),
      });
    }, { capture: true });
    document.addEventListener('portfolio-show-aligned-reset', (event) => {
      globalThis.__cvShowResetHistory.push({
        entryId: event.detail?.entryId || '',
        reason: event.detail?.receipt?.reason || '',
        mediaTimeMs: event.detail?.receipt?.mediaTimeMs ?? null,
        at: performance.now(),
      });
    });
    document.addEventListener('portfolio-show-aligned-generation', (event) => {
      globalThis.__cvShowGenerationHistory.push({
        entryId: event.detail?.entryId || '',
        receipt: event.detail?.receipt || null,
        at: performance.now(),
      });
    });
    document.addEventListener('portfolio-show-aligned-seek-failure', (event) => {
      globalThis.__cvShowSeekFailureHistory.push({
        entryId: event.detail?.entryId || '',
        receipt: event.detail?.receipt || null,
        at: performance.now(),
      });
    });
    globalThis.__SYMBIOTE_DEV_LOG = (type, code, args) => {
      console.warn('[SYMBIOTE_DETAIL] ' + JSON.stringify({ type, code, args: args?.map((value) =>
        typeof value === 'function' ? (value.name || 'anonymous') : value
      ) }));
    };`,
  });
  await navigate(cdp, `${server.origin}/cv/`, {
    expectedMode: 'structured',
  });
  let normalRoute = await cdp.send('Runtime.evaluate', {
    returnByValue: true,
    expression: `({
      search: location.search,
      locale: document.documentElement.lang,
      mode: document.querySelector('portfolio-graph-panel')?.dataset.mode,
    })`,
  });
  assert.deepEqual(normalRoute.result.value, { search: '', locale: 'ru', mode: 'structured' });
  assert.equal(
    cdp.requestedUrls.some((url) => url.includes('/cv-show-audio-private/')),
    false,
    'initial /cv/ must not request narration or alignment payloads',
  );
  const consoleBeforeShow = cdp.consoleMessages.length;
  await clickVisible(cdp, '.pulse-tour-button', 'local-audio CV Show trigger');

  let mounted = await cdp.send('Runtime.evaluate', {
    awaitPromise: true,
    returnByValue: true,
    expression: `new Promise((resolve, reject) => {
      const started = performance.now();
      const check = () => {
        const dock = document.querySelector('agent-dock-shell');
        const portfolioWorkspace = document.querySelector('portfolio-workspace');
        const host = portfolioWorkspace?.querySelector(':scope > portfolio-show-chat');
        const workspace = dock?.getChat?.()?.querySelector('chat-workspace');
        const chat = dock?.getChat?.();
        const player = chat?.querySelector('chat-show-player');
        const composer = workspace?.querySelector('chat-composer textarea');
        const modeActions = chat?.querySelector('.actions-card:has([data-action-id="start-short"])');
        if (host && composer && modeActions) {
          if (!host.__cvShowResultHistoryAttached) {
            host.__cvShowResultHistoryAttached = true;
            host.addEventListener('portfolio-show-result', globalThis.__recordCvShowResult);
          }
          const transcript = workspace.querySelector('chat-transcript');
          return resolve({
            orchestrationConnected: host.isConnected && portfolioWorkspace.contains(host),
            sharedDock: Boolean(dock?.hasAttribute('open')),
            sharedWorkspace: Boolean(workspace),
            sharedTranscript: Boolean(transcript),
            playerBeforeChoice: Boolean(player),
            embedBeforeChoice: Boolean(transcript?.querySelector('[data-embed-key="short"]')),
            activeComposer: !composer.disabled,
            voiceInput: Boolean(workspace.querySelector('chat-composer .btn-mic:not([hidden]):not(:disabled)')),
            modeActions: [
              Boolean(chat.querySelector('[data-action-id="start-short"]')),
              Boolean(chat.querySelector('[data-action-id="start-full"]')),
            ],
            manualTranscript: Boolean(host.querySelector('.show-transcript')),
          });
        }
        if (performance.now() - started > 8000) return reject(new Error('local Show shell did not become ready'));
        setTimeout(check, 50);
      };
      check();
    })`,
  }, { label: 'inspect shared local-audio Show shell', timeoutMs: 10_000 });
  assert.deepEqual(mounted.result.value, {
    orchestrationConnected: true,
    sharedDock: true,
    sharedWorkspace: true,
    sharedTranscript: true,
    playerBeforeChoice: false,
    embedBeforeChoice: false,
    activeComposer: true,
    voiceInput: true,
    modeActions: [true, true],
    manualTranscript: false,
  });
  assert.equal(
    cdp.requestedUrls.some((url) => url.includes('/cv-show-audio-private/')),
    false,
    'opening the chat without selecting a Show mode must stay payload-free',
  );
  await clickVisible(
    cdp,
    'agent-dock-shell agent-show-chat [data-action-id="start-short"]',
    'explicit Short mode selection',
  );
  let playing = await cdp.send('Runtime.evaluate', {
    awaitPromise: true,
    returnByValue: true,
    expression: `new Promise((resolve, reject) => {
      const started = performance.now();
      const check = () => {
        const host = document.querySelector('portfolio-show-chat');
        const snapshot = host?.narrationSnapshot;
        if (snapshot?.active?.activeId === 'positioning' && !snapshot.active.paused) {
          const chat = document.querySelector('agent-dock-shell')?.getChat?.();
          const player = chat?.querySelector('chat-show-player');
          const transcriptText = chat?.querySelector('chat-transcript')?.textContent || '';
          return resolve({
            source: snapshot.source,
            activeId: snapshot.active.activeId,
            paused: snapshot.active.paused,
            playerPlaying: player?.$.playing,
            playerCaption: player?.querySelector('.chat-show-caption-text')?.textContent?.trim(),
            playerTts: player?.querySelector('.chat-show-tts-text')?.textContent?.trim(),
            transcriptHasNarration: transcriptText.includes(player?.$.ttsText || ''),
            positionLabel: player?.$.positionLabel,
          });
        }
        if (performance.now() - started > 8000) {
          return resolve({
            timeout: true,
            source: snapshot?.source,
            active: snapshot?.active,
            lastError: snapshot?.active?.lastError,
            playerPlaying: document.querySelector('agent-dock-shell')?.getChat?.()
              ?.querySelector('chat-show-player')?.$.playing,
            transcript: document.querySelector('agent-dock-shell')?.getChat?.()
              ?.querySelector('chat-transcript')?.textContent?.trim(),
          });
        }
        setTimeout(check, 50);
      };
      check();
    })`,
  }, { label: 'inspect first local RU clip', timeoutMs: 10_000 });
  assert.equal(
    playing.exceptionDetails,
    undefined,
    playing.exceptionDetails?.exception?.description || 'first local RU clip evaluation failed',
  );
  assert.deepEqual(playing.result.value, {
    source: 'local',
    activeId: 'positioning',
    paused: false,
    playerPlaying: true,
    playerCaption: CV_SHOW_STORY.scenes[0].subtitle,
    playerTts: CV_SHOW_STORY.scenes[0].speech,
    transcriptHasNarration: false,
    positionLabel: '1 / 16',
  });

  const firstPayloadRequests = cdp.requestedUrls.filter((url) => (
    /\/cv-show-audio-private\/.*\.(?:wav|json)$/u.test(url)
  ));
  const firstClipRequests = firstPayloadRequests.filter((url) => /\.wav$/u.test(url));
  const firstAlignedRequests = firstPayloadRequests.filter((url) => /\/aligned\/.*\.json$/u.test(url));
  assert.ok(firstClipRequests.length <= 2, 'only current and at most one next audio clip may load');
  assert.ok(firstAlignedRequests.length <= 2, 'only current and at most one next alignment may load');

  let recognizedCue = await cdp.send('Runtime.evaluate', {
    awaitPromise: true,
    returnByValue: true,
    expression: `new Promise((resolve, reject) => {
      const started = performance.now();
      const check = () => {
        const snapshot = document.querySelector('portfolio-show-chat')?.alignmentSnapshot;
        const observed = globalThis.__cvShowCueHistory?.find((cue) => (
          cue.id === 'positioning.experience-frame'
          && cue.alignmentSource === 'recognized-word'
          && cue.alignmentResolution === 'exact'
        ));
        if (observed) return resolve({
          activeId: snapshot.activeId,
          exactCueCount: snapshot.exactCueCount,
          lastCueId: observed.id,
          lastCueTimeMs: observed.cueTimeMs,
          lastMediaTimeMs: observed.mediaTimeMs,
          lastAlignmentSource: observed.alignmentSource,
          lastAlignmentResolution: observed.alignmentResolution,
        });
        if (performance.now() - started > 5000) return resolve({
          timeout: true,
          activeId: snapshot?.activeId || '',
          lastCueId: snapshot?.lastCueId || '',
          history: globalThis.__cvShowCueHistory || [],
        });
        setTimeout(check, 25);
      };
      check();
    })`,
  }, { label: 'wait for recognized-word Show cue', timeoutMs: 7_000 });
  if (recognizedCue.result.value.timeout) {
    assert.fail(`recognized positioning cue did not fire: ${JSON.stringify(recognizedCue.result.value)}`);
  }
  assert.equal(recognizedCue.result.value.activeId, 'positioning');
  assert.equal(recognizedCue.result.value.exactCueCount, 4);
  assert.equal(recognizedCue.result.value.lastCueId, 'positioning.experience-frame');
  assert.ok(recognizedCue.result.value.lastCueTimeMs >= 1220);
  assert.equal(recognizedCue.result.value.lastAlignmentSource, 'recognized-word');
  assert.equal(recognizedCue.result.value.lastAlignmentResolution, 'exact');
  assert.ok(recognizedCue.result.value.lastMediaTimeMs >= 1220);

  await cdp.send('Runtime.evaluate', {
    expression: `document.querySelector('agent-dock-shell')?.getChat?.()
      ?.querySelector('chat-show-player [data-control="play"]')?.click()`,
  }, { label: 'pause local narration through shared player', timeoutMs: 5_000 });
  let paused = await cdp.send('Runtime.evaluate', {
    awaitPromise: true,
    returnByValue: true,
    expression: `new Promise((resolve) => requestAnimationFrame(() => resolve((() => {
      const host = document.querySelector('portfolio-show-chat');
      return {
        paused: host?.narrationSnapshot?.active?.paused,
        playerPlaying: document.querySelector('agent-dock-shell')?.getChat?.()
          ?.querySelector('chat-show-player')?.$.playing,
      };
    })())))`,
  });
  assert.deepEqual(paused.result.value, { paused: true, playerPlaying: false });

  let pausedPresenter = await cdp.send('Runtime.evaluate', {
    returnByValue: true,
    expression: `(() => {
      const overlay = document.querySelector('.symbiote-presenter-cursor');
      const overlays = Array.from(document.querySelectorAll('.symbiote-presenter-cursor'));
      const ink = overlay?.querySelector('.pc-ink path');
      const click = overlay?.querySelector('.pc-click');
      return {
        exists: Boolean(overlay),
        visible: overlay?.classList.contains('is-visible') || false,
        opacity: overlay ? getComputedStyle(overlay).opacity : '',
        ink: ink?.getAttribute('d') || '',
        clickOpacity: click ? getComputedStyle(click).opacity : '',
        selectionRanges: document.getSelection()?.rangeCount || 0,
        selectionText: document.getSelection()?.toString() || '',
        selectionCollapsed: document.getSelection()?.isCollapsed ?? true,
        pauseEventCount: globalThis.__cvShowPauseHistory.length,
        pauseEventTarget: globalThis.__cvShowPauseHistory.at(-1)?.target || '',
        overlayStates: overlays.map((node) => ({
          className: node.className,
          opacity: getComputedStyle(node).opacity,
        })),
      };
    })()`,
  }, { label: 'verify pause hides every presenter layer', timeoutMs: 5_000 });
  assert.equal(
    cdp.exceptions.length,
    0,
    cdp.exceptions.map(({ exceptionDetails }) => exceptionDetails?.exception?.description || exceptionDetails?.text).join('\n'),
  );
  assert.deepEqual(pausedPresenter.result.value, {
    exists: true,
    visible: false,
    opacity: '0',
    ink: '',
    clickOpacity: '0',
    selectionRanges: 0,
    selectionText: '',
    selectionCollapsed: true,
    pauseEventCount: 1,
    pauseEventTarget: 'PORTFOLIO-SHOW-CHAT',
    overlayStates: [{ className: 'symbiote-presenter-cursor is-paused', opacity: '0' }],
  });

  await clickVisible(
    cdp,
    'agent-dock-shell agent-show-chat chat-show-player [data-control="play"]',
    'resume local narration through shared transport',
  );
  let resumed = await cdp.send('Runtime.evaluate', {
    awaitPromise: true,
    returnByValue: true,
    expression: `new Promise((resolve) => requestAnimationFrame(() => resolve((() => {
      const host = document.querySelector('portfolio-show-chat');
      return {
        activeId: host?.narrationSnapshot?.active?.activeId,
        paused: host?.narrationSnapshot?.active?.paused,
        lastError: host?.narrationSnapshot?.active?.lastError,
        playerPlaying: document.querySelector('agent-dock-shell')?.getChat?.()
          ?.querySelector('chat-show-player')?.$.playing,
      };
    })())))`,
  });
  assert.deepEqual(resumed.result.value, {
    activeId: 'positioning',
    paused: false,
    lastError: '',
    playerPlaying: true,
  });

  let visibleMarker = await cdp.send('Runtime.evaluate', {
    awaitPromise: true,
    returnByValue: true,
    expression: `new Promise((resolve, reject) => {
      const started = performance.now();
      const check = () => {
        const host = document.querySelector('portfolio-show-chat');
        const observed = globalThis.__cvShowCueHistory?.find((cue) => (
          cue.id === 'positioning.tenure-marker'
          && cue.alignmentSource === 'recognized-word'
          && cue.alignmentResolution === 'exact'
        ));
        if (observed) {
          return resolve({ cue: observed.id, cueTimeMs: observed.cueTimeMs });
        }
        if (performance.now() - started > 5000) return reject(new Error('recognized-word marker cue did not fire'));
        setTimeout(check, 16);
      };
      check();
    })`,
  }, { label: 'verify recognized-word marker cue', timeoutMs: 7_000 });
  assert.equal(visibleMarker.result.value.cue, 'positioning.tenure-marker');
  assert.ok(visibleMarker.result.value.cueTimeMs >= 2080);

  let arbitrationPoint = await cdp.send('Runtime.evaluate', {
    returnByValue: true,
    expression: `(() => {
      const workspace = document.querySelector('portfolio-workspace');
      const anchor = document.createElement('span');
      anchor.dataset.tourTarget = 'browser.audio-arbitration-fixture';
      const media = document.createElement('audio');
      media.id = 'browser-audio-arbitration-fixture';
      media.preload = 'auto';
      media.src = new URL(
        'cv-show-audio-private/maximo-default-male/${LOCAL_AUDIO_REVISION}/01-short-positioning-0bd5868e6d15.wav',
        document.baseURI,
      ).href;
      const trigger = document.createElement('button');
      trigger.id = 'browser-audio-arbitration-trigger';
      trigger.textContent = 'media arbitration fixture';
      Object.assign(trigger.style, {
        position: 'fixed', left: '8px', top: '8px', width: '180px', height: '48px', zIndex: '999999',
      });
      trigger.addEventListener('click', () => workspace.dispatchEvent(new CustomEvent(
        'portfolio-show-phase', {
          bubbles: true,
          composed: true,
          detail: {
            requestId: -1,
            directives: [{
              id: 'browser.audio-arbitration',
              type: 'media',
              target: 'browser.audio-arbitration-fixture',
              policy: 'required',
              mode: 'full-with-media-audio',
            }],
          },
        },
      )), { once: true });
      workspace.append(anchor, media);
      document.body.append(trigger);
      media.load();
      const rect = trigger.getBoundingClientRect();
      return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
    })()`,
  }, { label: 'prepare shared audio arbitration fixture', timeoutMs: 5_000 });
  await cdp.send('Input.dispatchMouseEvent', {
    type: 'mousePressed', button: 'left', clickCount: 1, ...arbitrationPoint.result.value,
  }, { label: 'press shared media arbitration trigger', timeoutMs: 5_000 });
  await cdp.send('Input.dispatchMouseEvent', {
    type: 'mouseReleased', button: 'left', clickCount: 1, ...arbitrationPoint.result.value,
  }, { label: 'start shared media arbitration fixture', timeoutMs: 5_000 });
  let preempted = await cdp.send('Runtime.evaluate', {
    awaitPromise: true,
    returnByValue: true,
    expression: `new Promise((resolve, reject) => {
      const started = performance.now();
      const check = () => {
        const host = document.querySelector('portfolio-show-chat');
        const media = document.getElementById('browser-audio-arbitration-fixture');
        if (host?.narrationSnapshot?.active?.paused && host.$?.mediaBlocksResume && media && !media.paused) {
          return resolve({ narrationPaused: true, mediaPlaying: true, resumeBlocked: true });
        }
        if (performance.now() - started > 5000) return reject(new Error('shared media did not preempt narration'));
        setTimeout(check, 25);
      };
      check();
    })`,
  }, { label: 'verify shared audio preemption', timeoutMs: 7_000 });
  assert.deepEqual(preempted.result.value, {
    narrationPaused: true,
    mediaPlaying: true,
    resumeBlocked: true,
  });
  await cdp.send('Runtime.evaluate', {
    expression: `document.querySelector('portfolio-show-chat')?.dispatchEvent(new CustomEvent(
      'portfolio-show-skip-media', { bubbles: true, composed: true }
    ))`,
  }, { label: 'release shared media audio lease', timeoutMs: 5_000 });
  let released = await cdp.send('Runtime.evaluate', {
    awaitPromise: true,
    returnByValue: true,
    expression: `new Promise((resolve) => requestAnimationFrame(() => resolve((() => {
      const host = document.querySelector('portfolio-show-chat');
      const media = document.getElementById('browser-audio-arbitration-fixture');
      return { mediaPaused: media?.paused, resumeBlocked: host?.$?.mediaBlocksResume };
    })())))`,
  });
  assert.deepEqual(released.result.value, { mediaPaused: true, resumeBlocked: false });
  await cdp.send('Runtime.evaluate', {
    expression: `document.getElementById('browser-audio-arbitration-trigger')?.remove()`,
  }, { label: 'remove shared media arbitration trigger', timeoutMs: 5_000 });
  await clickVisible(
    cdp,
    'agent-dock-shell agent-show-chat chat-show-player [data-control="play"]',
    'resume narration after shared media',
  );
  await cdp.send('Runtime.evaluate', {
    awaitPromise: true,
    expression: `new Promise((resolve, reject) => {
      const started = performance.now();
      const check = () => {
        const active = document.querySelector('portfolio-show-chat')?.narrationSnapshot?.active;
        if (active?.activeId === 'positioning' && !active.paused) return resolve(true);
        if (performance.now() - started > 5000) return reject(new Error('narration did not resume after media'));
        setTimeout(check, 25);
      };
      check();
    })`,
  }, { label: 'verify narration resumes after shared media', timeoutMs: 7_000 });

  let shortBeforeBranch = await cdp.send('Runtime.evaluate', {
    awaitPromise: true,
    returnByValue: true,
    expression: `new Promise((resolve, reject) => {
      const started = performance.now();
      const check = () => {
        const host = document.querySelector('portfolio-show-chat');
        const narration = host?.narrationSnapshot;
        const alignment = host?.alignmentSnapshot;
        const selection = document.getSelection();
        const selectionRect = selection?.rangeCount
          ? selection.getRangeAt(0).getBoundingClientRect()
          : null;
        const portableCue = globalThis.__cvShowCueHistory?.find(({ id }) => (
          id === 'workspace.portable-config'
        ));
        if (narration?.active?.activeId === 'symbiote-workspace'
          && alignment?.activeId === 'symbiote-workspace'
          && portableCue) {
          return resolve({
            positionMs: alignment.narrationPositionMs,
            cue: portableCue.id,
            selectionWidth: Math.round(selectionRect?.width || 0),
            selectionHeight: Math.round(selectionRect?.height || 0),
          });
        }
        if (performance.now() - started > 45000) return resolve({
          timeout: true,
          activeId: narration?.active?.activeId || '',
          paused: narration?.active?.paused ?? null,
          alignment,
          selectionText: selection?.toString() || '',
          cueHistory: globalThis.__cvShowCueHistory || [],
          resultHistory: globalThis.__cvShowResultHistory || [],
        });
        setTimeout(check, 25);
      };
      check();
    })`,
  }, { label: 'capture autonomous Short playback before branch', timeoutMs: 47_000 });
  assert.equal(
    shortBeforeBranch.exceptionDetails,
    undefined,
    shortBeforeBranch.exceptionDetails?.exception?.description || 'autonomous workspace evaluation failed',
  );
  if (shortBeforeBranch.result.value.timeout) {
    assert.fail(`autonomous aligned workspace scene did not become visible: ${JSON.stringify(shortBeforeBranch.result.value)}`);
  }

  let presenterResults = await cdp.send('Runtime.evaluate', {
    returnByValue: true,
    expression: `globalThis.__cvShowResultHistory || []`,
  }, { label: 'inspect presenter directive receipts', timeoutMs: 5_000 });
  let requiredMissing = presenterResults.result.value.filter((result) => result.status === 'required-missing');
  assert.deepEqual(
    requiredMissing,
    [],
    `required presenter directives failed: ${JSON.stringify({
      requiredMissing,
      phases: (await cdp.send('Runtime.evaluate', {
        returnByValue: true,
        expression: `globalThis.__cvShowPhaseHistory || []`,
      })).result.value,
    })}`,
  );
  let workspaceOpenResults = presenterResults.result.value.filter((result) => (
    result.receipts?.some(({ id }) => id === 'workspace.open')
  ));
  assert.equal(workspaceOpenResults.length, 1, 'workspace.open scene setup must execute exactly once');
  assert.equal(workspaceOpenResults[0].status, 'success');
  assert.deepEqual(
    workspaceOpenResults[0].receipts.map(({ id, status }) => ({ id, status })),
    [{ id: 'workspace.open', status: 'success' }],
  );
  assert.equal(
    workspaceOpenResults[0].receipts[0].result.phases
      .find(({ phase }) => phase === 'act').result.selectedId,
    'projects/symbiote-workspace',
  );
  assert.equal(workspaceOpenResults[0].viewerPath, 'Symbiote Workspace.md');
  assert.equal(workspaceOpenResults[0].targetReady, true, 'workspace article intro must be ready after scene setup');
  let workspaceIntroCue = await cdp.send('Runtime.evaluate', {
    returnByValue: true,
    expression: `globalThis.__cvShowCueHistory?.find(({ id }) => id === 'workspace.intro-frame') || null`,
  }, { label: 'inspect workspace intro cue ordering', timeoutMs: 5_000 });
  assert.ok(workspaceIntroCue.result.value, 'workspace intro cue must be delivered');
  assert.match(workspaceIntroCue.result.value.selectedId, /Symbiote Workspace$/u);
  assert.equal(workspaceIntroCue.result.value.viewerPath, 'Symbiote Workspace.md');
  assert.equal(workspaceIntroCue.result.value.targetReady, true);
  assert.ok(
    workspaceOpenResults[0].at <= workspaceIntroCue.result.value.at,
    'workspace.open scene setup must complete before workspace.intro-frame',
  );

  let accumulated = await cdp.send('Runtime.evaluate', {
    awaitPromise: true,
    returnByValue: true,
    expression: `new Promise((resolve, reject) => {
      const started = performance.now();
      const check = () => {
        const host = document.querySelector('portfolio-show-chat');
        const chat = document.querySelector('agent-dock-shell')?.getChat?.();
        const actions = Array.from(chat?.querySelectorAll('.actions-card:has([data-action-id="details"])') || []);
        if (host?.narrationSnapshot?.active?.activeId
          && host?.alignmentSnapshot?.narrationPositionMs >= 100
          && actions.length >= 2) {
          return resolve({
            activeId: host.narrationSnapshot.active.activeId,
            positionMs: host.alignmentSnapshot.narrationPositionMs,
            states: actions.map((card) => card.dataset.actionState),
          });
        }
        if (performance.now() - started > 50000) return resolve({
          timeout: true,
          activeId: host?.narrationSnapshot?.active?.activeId || '',
          positionMs: host?.alignmentSnapshot?.narrationPositionMs || 0,
          states: actions.map((card) => card.dataset.actionState),
          results: globalThis.__cvShowResultHistory || [],
        });
        setTimeout(check, 25);
      };
      check();
    })`,
  }, { label: 'verify autonomous accumulating contextual cards', timeoutMs: 55_000 });
  assert.equal(
    accumulated.exceptionDetails,
    undefined,
    accumulated.exceptionDetails?.exception?.description || 'contextual cards evaluation failed',
  );
  if (accumulated.result.value.timeout) {
    assert.fail(`historical detail cards did not accumulate autonomously: ${JSON.stringify(accumulated.result.value)}`);
  }
  assert.equal(accumulated.result.value.activeId, 'symbiote-ui');
  assert.deepEqual(accumulated.result.value.states.slice(-2), ['historical', 'current']);
  assert.equal(shortBeforeBranch.result.value.cue, 'workspace.portable-config');
  assert.ok(shortBeforeBranch.result.value.positionMs >= 11_040, 'Short scene 2 must advance to the recognized selection cue');

  let fixedPlayer = await cdp.send('Runtime.evaluate', {
    awaitPromise: true,
    returnByValue: true,
    expression: `new Promise((resolve) => {
      const chat = document.querySelector('agent-dock-shell')?.getChat?.();
      const player = chat?.querySelector('chat-show-player');
      const transcript = chat?.querySelector('chat-transcript');
      const before = player?.getBoundingClientRect();
      if (transcript) transcript.scrollTop = transcript.scrollHeight;
      requestAnimationFrame(() => {
        const after = player?.getBoundingClientRect();
        resolve({
          fixedRegion: player?.parentElement === chat?.ref?.playerRegion,
          transcriptOutsidePlayer: !transcript?.contains(player),
          topDelta: Math.abs((after?.top || 0) - (before?.top || 0)),
          transcriptScrolled: (transcript?.scrollTop || 0) > 0,
        });
      });
    })`,
  }, { label: 'verify fixed player while transcript scrolls', timeoutMs: 5_000 });
  assert.equal(fixedPlayer.result.value.fixedRegion, true);
  assert.equal(fixedPlayer.result.value.transcriptOutsidePlayer, true);
  assert.ok(fixedPlayer.result.value.topDelta <= 1);

  await cdp.send('Runtime.evaluate', {
    expression: `(() => {
      const action = document.querySelector(
        'agent-dock-shell agent-show-chat .actions-card[data-action-state="historical"] [data-action-id="details"]'
      );
      action?.addEventListener('click', () => {
        globalThis.__cvShowBranchClickPosition = document.querySelector('portfolio-show-chat')
          ?.alignmentSnapshot?.narrationPositionMs;
        globalThis.__cvShowBranchMediaEventIndex = globalThis.__cvShowMediaEventHistory.length;
        globalThis.__cvShowBranchResetIndex = globalThis.__cvShowResetHistory.length;
      }, { capture: true, once: true });
    })()`,
  }, { label: 'observe exact trusted historical-branch checkpoint', timeoutMs: 5_000 });
  await cdp.send('Runtime.evaluate', {
    awaitPromise: true,
    expression: `new Promise((resolve, reject) => {
      const started = performance.now();
      const check = () => {
        const host = document.querySelector('portfolio-show-chat');
        const activeId = host?.narrationSnapshot?.active?.activeId;
        const positionMs = host?.alignmentSnapshot?.narrationPositionMs || 0;
        if (activeId === 'symbiote-ui' && positionMs >= 260 && positionMs <= 320) {
          return resolve(positionMs);
        }
        if (performance.now() - started > 5000) {
          return reject(new Error('historical branch checkpoint did not enter the 260-320ms window: '
            + JSON.stringify({ activeId, positionMs })));
        }
        setTimeout(check, 5);
      };
      check();
    })`,
  }, { label: 'enter exact nonzero historical-branch checkpoint window', timeoutMs: 7_000 });
  await clickVisible(
    cdp,
    'agent-dock-shell agent-show-chat .actions-card[data-action-state="historical"] [data-action-id="details"]',
    'historical detail action',
  );
  await cdp.send('Runtime.evaluate', {
    awaitPromise: true,
    expression: `new Promise((resolve, reject) => {
      const started = performance.now();
      const check = () => {
        const host = document.querySelector('portfolio-show-chat');
        if (host?.narrationSnapshot?.active?.activeId === 'workspace-details'
          && host?.alignmentSnapshot?.activeId === 'workspace-details') return resolve(true);
        if (performance.now() - started > 5000) return reject(new Error('aligned detail branch did not start'));
        setTimeout(check, 25);
      };
      check();
    })`,
  }, { label: 'wait for aligned detail branch', timeoutMs: 7_000 });
  let returnPoint = await cdp.send('Runtime.evaluate', {
    awaitPromise: true,
    returnByValue: true,
    expression: `new Promise((resolve, reject) => {
      const selector = 'agent-dock-shell agent-show-chat .actions-card[data-action-state="current"] [data-action-id="return"]';
      const started = performance.now();
      const check = () => {
        const target = document.querySelector(selector);
        target?.scrollIntoView?.({ block: 'center', inline: 'center' });
        const rect = target?.getBoundingClientRect();
        const hit = rect && document.elementFromPoint(
          rect.left + rect.width / 2,
          rect.top + rect.height / 2,
        );
        if (rect?.width > 0 && rect.height > 0 && (hit === target || target?.contains?.(hit))) {
          return resolve({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 });
        }
        if (performance.now() - started > 5000) {
          const cards = Array.from(document.querySelectorAll('agent-dock-shell agent-show-chat .actions-card'))
            .map((card) => ({ state: card.dataset.actionState, text: card.textContent?.trim() }));
          return reject(new Error('detail return card did not become interactive: ' + JSON.stringify(cards)));
        }
        setTimeout(check, 25);
      };
      check();
    })`,
  }, { label: 'wait for interactive detail return action', timeoutMs: 7_000 });
  await cdp.send('Runtime.evaluate', {
    expression: `(() => {
      const nativeAddEventListener = EventTarget.prototype.addEventListener;
      globalThis.__cvShowObservedMedia = new WeakSet();
      EventTarget.prototype.addEventListener = function observeRestoredMedia(type, listener, options) {
        const media = this;
        if (media instanceof HTMLMediaElement && !globalThis.__cvShowObservedMedia.has(media)) {
          globalThis.__cvShowObservedMedia.add(media);
          globalThis.__cvShowLastMedia = media;
          globalThis.__cvShowBranchGenerationIndex = globalThis.__cvShowGenerationHistory.length;
          globalThis.__cvShowBranchSeekFailureIndex = globalThis.__cvShowSeekFailureHistory.length;
          for (const observedType of ['seeking', 'timeupdate', 'seeked']) {
            nativeAddEventListener.call(media, observedType, () => {
              globalThis.__cvShowMediaEventHistory.push({
                type: observedType,
                source: String(media.currentSrc || media.src || ''),
                currentTimeMs: Math.round((Number(media.currentTime) || 0) * 1000),
                readyState: media.readyState,
                at: performance.now(),
              });
            });
          }
        }
        return nativeAddEventListener.call(media, type, listener, options);
      };
    })()`,
  }, { label: 'journal restored detached local media without accessor interception', timeoutMs: 5_000 });
  await cdp.send('Input.dispatchMouseEvent', {
    type: 'mousePressed', button: 'left', clickCount: 1, ...returnPoint.result.value,
  }, { label: 'press detail return action', timeoutMs: 5_000 });
  await cdp.send('Input.dispatchMouseEvent', {
    type: 'mouseReleased', button: 'left', clickCount: 1, ...returnPoint.result.value,
  }, { label: 'click detail return action', timeoutMs: 5_000 });
  let restored;
  const restoreStarted = Date.now();
  while (Date.now() - restoreStarted <= 20_000) {
    restored = await cdp.send('Runtime.evaluate', {
      returnByValue: true,
      expression: `(() => {
        const host = document.querySelector('portfolio-show-chat');
        const narration = host?.narrationSnapshot;
        const alignment = host?.alignmentSnapshot;
        const checkpoint = globalThis.__cvShowBranchClickPosition;
        const overlay = document.querySelector('.symbiote-presenter-cursor');
        return {
          checkpoint,
          activeId: alignment?.activeId || '',
          narrationActiveId: narration?.active?.activeId || '',
          paused: narration?.active?.paused,
          resetReason: alignment?.lastResetReason || '',
          cueReason: alignment?.lastCueReason || '',
          positionMs: alignment?.narrationPositionMs ?? null,
          source: alignment?.lastAlignmentSource || '',
          lastSeekFailure: alignment?.lastSeekFailure || null,
          presenter: {
            count: document.querySelectorAll('.symbiote-presenter-cursor').length,
            visible: overlay?.classList.contains('is-visible') || false,
            opacity: overlay ? getComputedStyle(overlay).opacity : '',
            ink: overlay?.querySelector('.pc-ink path')?.getAttribute('d') || '',
          },
          selectionRanges: document.getSelection()?.rangeCount || 0,
          resets: globalThis.__cvShowResetHistory.slice(globalThis.__cvShowBranchResetIndex || 0),
          mediaEvents: globalThis.__cvShowMediaEventHistory.slice(globalThis.__cvShowBranchMediaEventIndex || 0),
        };
      })()`,
    }, { label: 'sample shared branch playback restoration', timeoutMs: 5_000 });
    const value = restored.result.value;
    if (value.narrationActiveId === 'symbiote-ui'
      && value.activeId === 'symbiote-ui'
      && value.paused
      && value.resetReason === 'branch-return'
      && value.checkpoint > 0
      && Math.abs(value.positionMs - value.checkpoint) <= 75) break;
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
  if (restored.result.value.narrationActiveId !== 'symbiote-ui'
    || restored.result.value.activeId !== 'symbiote-ui'
    || !restored.result.value.paused
    || restored.result.value.resetReason !== 'branch-return'
    || !(restored.result.value.checkpoint > 0)
    || Math.abs(restored.result.value.positionMs - restored.result.value.checkpoint) > 75) {
    assert.fail(`branch playback diagnostic: ${JSON.stringify(restored.result.value)}`);
  }
  assert.equal(restored.result.value.activeId, 'symbiote-ui');
  assert.equal(restored.result.value.paused, true);
  assert.equal(restored.result.value.resetReason, 'branch-return');
  assert.equal(restored.result.value.cueReason, '');
  assert.equal(restored.result.value.source, '');
  assert.deepEqual(restored.result.value.presenter, {
    count: 1,
    visible: false,
    opacity: '0',
    ink: '',
  });
  assert.equal(restored.result.value.selectionRanges, 0);
  let branchCheckpoint = await cdp.send('Runtime.evaluate', {
    returnByValue: true,
    expression: `globalThis.__cvShowBranchClickPosition`,
  });
  assert.ok(Math.abs(restored.result.value.positionMs - branchCheckpoint.result.value) <= 75);

  await new Promise((resolve) => setTimeout(resolve, 1200));
  let stableBranchReturn = await cdp.send('Runtime.evaluate', {
    returnByValue: true,
    expression: `(() => {
      const host = document.querySelector('portfolio-show-chat');
      const alignment = host?.alignmentSnapshot;
      const mediaEvents = globalThis.__cvShowMediaEventHistory.slice(
        globalThis.__cvShowBranchMediaEventIndex || 0,
      );
      const resets = globalThis.__cvShowResetHistory.slice(globalThis.__cvShowBranchResetIndex || 0);
      const generations = globalThis.__cvShowGenerationHistory.slice(
        globalThis.__cvShowBranchGenerationIndex || 0,
      );
      const seekFailures = globalThis.__cvShowSeekFailureHistory.slice(
        globalThis.__cvShowBranchSeekFailureIndex || 0,
      );
      const seekedEvents = mediaEvents.filter(({ type }) => type === 'seeked');
      const overlay = document.querySelector('.symbiote-presenter-cursor');
      const overlayOpacity = overlay ? Number(getComputedStyle(overlay).opacity) : 0;
      const marquee = overlay?.querySelector('.pc-marquee');
      const marqueeRect = marquee?.getBoundingClientRect();
      const ink = overlay?.querySelector('.pc-ink');
      const inkPath = ink?.querySelector('path')?.getAttribute('d') || '';
      return {
        activeId: alignment?.activeId,
        positionMs: alignment?.narrationPositionMs,
        resetReason: alignment?.lastResetReason,
        cueReason: alignment?.lastCueReason,
        lastSeekFailure: alignment?.lastSeekFailure || null,
        lastGenerationReceipt: alignment?.lastGenerationReceipt || null,
        playbackClockState: alignment?.playbackClockState || null,
        generations,
        seekFailures,
        nativeSeeking: mediaEvents.some(({ type }) => type === 'seeking'),
        nativeTimeupdate: mediaEvents.some(({ type }) => type === 'timeupdate'),
        nativeSeeked: mediaEvents.some(({ type }) => type === 'seeked'),
        initialQuantizedZero: seekedEvents.some(({ currentTimeMs }) => currentTimeMs === 0),
        finalSeekedPositionMs: seekedEvents.at(-1)?.currentTimeMs ?? null,
        resetReasons: resets.map(({ reason }) => reason),
        presenter: {
          cursorVisible: Boolean(overlayOpacity > 0 && overlay?.classList.contains('is-visible')),
          frameVisible: Boolean(overlayOpacity > 0
            && (marqueeRect?.width || 0) > 0
            && (marqueeRect?.height || 0) > 0),
          markerVisible: Boolean(overlayOpacity > 0
            && inkPath
            && Number(getComputedStyle(ink).opacity) > 0),
          selectionRanges: document.getSelection()?.rangeCount || 0,
        },
      };
    })()`,
  }, { label: 'verify branch-return remains stable after native media events', timeoutMs: 5_000 });
  assert.equal(stableBranchReturn.result.value.activeId, 'symbiote-ui');
  assert.ok(
    Math.abs(stableBranchReturn.result.value.positionMs - branchCheckpoint.result.value) <= 25,
    `branch-return physical position drifted after dwell: ${JSON.stringify(stableBranchReturn.result.value)}`,
  );
  assert.equal(stableBranchReturn.result.value.resetReason, 'branch-return');
  assert.equal(stableBranchReturn.result.value.cueReason, '');
  assert.equal(stableBranchReturn.result.value.lastSeekFailure, null);
  assert.equal(stableBranchReturn.result.value.seekFailures.length, 0);
  assert.equal(stableBranchReturn.result.value.generations.length, 1);
  assert.equal(stableBranchReturn.result.value.generations[0].entryId, 'symbiote-ui');
  assert.equal(stableBranchReturn.result.value.generations[0].receipt.status, 'completed');
  assert.equal(stableBranchReturn.result.value.generations[0].receipt.reason, 'branch-return');
  assert.equal(stableBranchReturn.result.value.lastGenerationReceipt.status, 'completed');
  assert.equal(stableBranchReturn.result.value.lastGenerationReceipt.reason, 'branch-return');
  assert.ok(Math.abs(
    stableBranchReturn.result.value.lastGenerationReceipt.observedMs - branchCheckpoint.result.value,
  ) <= 25);
  assert.deepEqual(stableBranchReturn.result.value.playbackClockState, {
    active: false,
    intervalMs: 250,
    pendingCueCount: 1,
  });
  assert.equal(stableBranchReturn.result.value.nativeSeeking, true);
  assert.equal(stableBranchReturn.result.value.nativeTimeupdate, true);
  assert.equal(stableBranchReturn.result.value.nativeSeeked, true);
  assert.equal(typeof stableBranchReturn.result.value.initialQuantizedZero, 'boolean');
  assert.ok(Math.abs(
    stableBranchReturn.result.value.finalSeekedPositionMs - branchCheckpoint.result.value,
  ) <= 25);
  assert.equal(stableBranchReturn.result.value.resetReasons.at(-1), 'branch-return');
  assert.deepEqual(stableBranchReturn.result.value.presenter, {
    cursorVisible: false,
    frameVisible: false,
    markerVisible: false,
    selectionRanges: 0,
  });

  let resumeCueBaseline = await cdp.send('Runtime.evaluate', {
    returnByValue: true,
    expression: `globalThis.__cvShowCueHistory.length`,
  }, { label: 'record branch resume cue baseline', timeoutMs: 5_000 });
  await clickVisible(
    cdp,
    'agent-dock-shell agent-show-chat .actions-card[data-action-state="current"] [data-action-id="resume"]',
    'explicit branch-return resume',
  );
  await cdp.send('Runtime.evaluate', {
    expression: `(() => {
      if (globalThis.__cvShowLastMedia) globalThis.__cvShowLastMedia.playbackRate = 8;
    })()`,
  }, { label: 'accelerate the real remaining canonical cue', timeoutMs: 5_000 });
  let resumedCue;
  const resumedCueStarted = Date.now();
  while (Date.now() - resumedCueStarted <= 8_000) {
    resumedCue = await cdp.send('Runtime.evaluate', {
      returnByValue: true,
      expression: `(() => {
        const baseline = ${resumeCueBaseline.result.value};
        const host = document.querySelector('portfolio-show-chat');
        const cues = globalThis.__cvShowCueHistory.slice(baseline);
        return {
          cues,
          paused: host?.narrationSnapshot?.active?.paused,
          lastCueReason: host?.alignmentSnapshot?.lastCueReason || '',
          activeId: host?.alignmentSnapshot?.activeId || '',
          positionMs: host?.alignmentSnapshot?.narrationPositionMs ?? null,
          generationReceipt: host?.alignmentSnapshot?.lastGenerationReceipt || null,
          media: globalThis.__cvShowLastMedia ? {
            currentTimeMs: Math.round((Number(globalThis.__cvShowLastMedia.currentTime) || 0) * 1000),
            paused: globalThis.__cvShowLastMedia.paused,
            ended: globalThis.__cvShowLastMedia.ended,
            readyState: globalThis.__cvShowLastMedia.readyState,
            durationMs: Math.round((Number(globalThis.__cvShowLastMedia.duration) || 0) * 1000),
            playbackRate: globalThis.__cvShowLastMedia.playbackRate,
            source: String(globalThis.__cvShowLastMedia.currentSrc || globalThis.__cvShowLastMedia.src || ''),
          } : null,
        };
      })()`,
    }, { label: 'sample explicit branch resume cue', timeoutMs: 5_000 });
    if (resumedCue.result.value.cues.length > 0) break;
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
  assert.equal(
    resumedCue.result.value.cues.length,
    1,
    `explicit resume did not emit exactly one future cue: ${JSON.stringify(resumedCue.result.value)}`,
  );
  assert.equal(resumedCue.result.value.cues[0].id, 'symbiote-ui.pause');
  assert.equal(
    resumedCue.result.value.cues[0].reason,
    'timeupdate',
    `unexpected provider cue delivery reason: ${JSON.stringify(resumedCue.result.value.cues[0])}`,
  );
  assert.ok(resumedCue.result.value.cues[0].cueTimeMs >= branchCheckpoint.result.value);
  assert.ok(resumedCue.result.value.cues[0].mediaTimeMs >= resumedCue.result.value.cues[0].cueTimeMs);
  assert.equal(resumedCue.result.value.paused, true);
  await new Promise((resolve) => setTimeout(resolve, 700));
  let resumedCueStable = await cdp.send('Runtime.evaluate', {
    returnByValue: true,
    expression: `(() => ({
      cues: globalThis.__cvShowCueHistory.slice(${resumeCueBaseline.result.value}),
      activeId: document.querySelector('portfolio-show-chat')?.alignmentSnapshot?.activeId || '',
      clock: document.querySelector('portfolio-show-chat')?.alignmentSnapshot?.playbackClockState || null,
      latestPhase: globalThis.__cvShowPhaseHistory.at(-1) || null,
    }))()`,
  }, { label: 'verify explicit resume emits no duplicate cue', timeoutMs: 5_000 });
  assert.equal(resumedCueStable.result.value.cues.length, 1);
  if (resumedCueStable.result.value.activeId === 'symbiote-ui') {
    assert.deepEqual(resumedCueStable.result.value.clock, {
      active: false,
      intervalMs: 250,
      pendingCueCount: 0,
    });
  } else if (resumedCueStable.result.value.activeId) {
    assert.notEqual(resumedCueStable.result.value.activeId, '');
    assert.equal(resumedCueStable.result.value.clock.intervalMs, 250);
  } else {
    assert.equal(resumedCueStable.result.value.clock, null);
    assert.ok(
      resumedCueStable.result.value.latestPhase?.directiveIds?.some((id) => id.endsWith('.open')),
      `an empty aligned runtime is valid only while the next scene setup owns the transition: ${JSON.stringify(resumedCueStable.result.value)}`,
    );
  }

  let unrelatedSeek = await cdp.send('Runtime.evaluate', {
    awaitPromise: true,
    returnByValue: true,
    expression: `new Promise((resolve, reject) => {
      const started = performance.now();
      let media = null;
      let before = null;
      let target = null;
      let mediaIndex = null;
      let resetIndex = null;
      const check = () => {
        const host = document.querySelector('portfolio-show-chat');
        if (!media) {
          const candidate = host?.narrationSnapshot?.source === 'local'
            ? globalThis.__cvShowLastMedia
            : null;
          if (!candidate || candidate.readyState < 2 || candidate.seekable.length < 1) {
            if (performance.now() - started > 5000) {
              return reject(new Error('restored local narration media is not seekable'));
            }
            setTimeout(check, 25);
            return;
          }
          candidate.playbackRate = 1;
          if (!candidate.paused) {
            host.pauseShow?.('explicit-control');
            setTimeout(check, 25);
            return;
          }
          media = candidate;
          before = host.alignmentSnapshot.narrationPositionMs;
          target = before > 1000
            ? 750
            : Math.min(Math.max(before + 500, 750), Math.max(750, Math.round(media.duration * 1000) - 250));
          mediaIndex = globalThis.__cvShowMediaEventHistory.length;
          resetIndex = globalThis.__cvShowResetHistory.length;
          media.currentTime = target / 1000;
        }
        const alignment = host.alignmentSnapshot;
        const events = globalThis.__cvShowMediaEventHistory.slice(mediaIndex);
        const resets = globalThis.__cvShowResetHistory.slice(resetIndex);
        if (alignment.lastResetReason === 'seeked'
          && events.some(({ type }) => type === 'seeked')) return resolve({
          before,
          after: alignment.narrationPositionMs,
          resetReason: alignment.lastResetReason,
          cueReason: alignment.lastCueReason,
          nativeSeeking: events.some(({ type }) => type === 'seeking'),
          nativeTimeupdate: events.some(({ type }) => type === 'timeupdate'),
          nativeSeeked: true,
          resetReasons: resets.map(({ reason }) => reason),
        });
        if (performance.now() - started > 5000) return reject(new Error('unrelated media seek did not emit ordinary seeked'));
        setTimeout(check, 25);
      };
      check();
    })`,
  }, { label: 'verify unrelated user seek keeps ordinary seeked semantics', timeoutMs: 7_000 });
  assert.equal(
    unrelatedSeek.exceptionDetails,
    undefined,
    unrelatedSeek.exceptionDetails?.exception?.description || 'ordinary seek evaluation failed',
  );
  assert.equal(unrelatedSeek.result.value.resetReason, 'seeked');
  assert.equal(unrelatedSeek.result.value.cueReason, 'seeked');
  assert.notEqual(unrelatedSeek.result.value.after, unrelatedSeek.result.value.before);
  assert.equal(unrelatedSeek.result.value.nativeSeeking, true);
  assert.equal(unrelatedSeek.result.value.nativeTimeupdate, true);
  assert.equal(unrelatedSeek.result.value.nativeSeeked, true);
  assert.deepEqual(unrelatedSeek.result.value.resetReasons, ['seeked']);

  await cdp.send('Runtime.evaluate', {
    expression: `(() => {
      globalThis.__cvShowOpenedUrls = [];
      globalThis.open = (...args) => { globalThis.__cvShowOpenedUrls.push(args); return null; };
    })()`,
  }, { label: 'observe trusted contact navigation', timeoutMs: 5_000 });
  await clickVisible(cdp, 'agent-dock-shell agent-show-chat chat-composer textarea', 'mock agent composer');
  await cdp.send('Input.insertText', { text: 'как связаться' }, {
    label: 'type contact intent', timeoutMs: 5_000,
  });
  let contactDraft = await cdp.send('Runtime.evaluate', {
    returnByValue: true,
    expression: `(() => {
      const textarea = document.querySelector('agent-dock-shell')?.getChat?.()
        ?.querySelector('chat-composer textarea');
      return {
        focused: textarea === document.activeElement,
        value: textarea?.value || '',
        disabled: Boolean(textarea?.disabled),
      };
    })()`,
  }, { label: 'verify trusted contact draft', timeoutMs: 5_000 });
  assert.deepEqual(contactDraft.result.value, {
    focused: true,
    value: 'как связаться',
    disabled: false,
  });
  await cdp.send('Input.dispatchKeyEvent', {
    type: 'keyDown', key: 'Enter', code: 'Enter', windowsVirtualKeyCode: 13,
  }, { label: 'submit contact intent', timeoutMs: 5_000 });
  await cdp.send('Input.dispatchKeyEvent', {
    type: 'keyUp', key: 'Enter', code: 'Enter', windowsVirtualKeyCode: 13,
  }, { label: 'release contact intent key', timeoutMs: 5_000 });
  let mockReply = await cdp.send('Runtime.evaluate', {
    awaitPromise: true,
    returnByValue: true,
    expression: `new Promise((resolve, reject) => {
      const started = performance.now();
      const check = () => {
        const chat = document.querySelector('agent-dock-shell')?.getChat?.();
        const contact = chat?.querySelector('[data-action-id="agent-contact"]');
        if (contact) return resolve({
          contact: contact.textContent.trim(),
          transcript: chat.querySelector('chat-transcript')?.textContent || '',
        });
        if (performance.now() - started > 5000) return reject(new Error('generic mock reply did not arrive'));
        setTimeout(check, 25);
      };
      check();
    })`,
  }, { label: 'verify generic mock reply', timeoutMs: 7_000 });
  assert.equal(
    mockReply.exceptionDetails,
    undefined,
    mockReply.exceptionDetails?.exception?.description || 'generic mock reply evaluation failed',
  );
  assert.match(mockReply.result.value.transcript, /как связаться/i);
  assert.match(mockReply.result.value.transcript, /полный AI-агент.+не подключён/is);
  assert.match(mockReply.result.value.contact, /Связаться с Владимиром/i);

  await clickVisible(
    cdp,
    'agent-dock-shell agent-show-chat [data-action-id="agent-contact"]',
    'trusted contact choice',
  );
  let contactReply = await cdp.send('Runtime.evaluate', {
    awaitPromise: true,
    returnByValue: true,
    expression: `new Promise((resolve, reject) => {
      const started = performance.now();
      const check = () => {
        const chat = document.querySelector('agent-dock-shell')?.getChat?.();
        const linkedin = chat?.querySelector('[data-action-id="contact-linkedin"]');
        const telegram = chat?.querySelector('[data-action-id="contact-telegram"]');
        if (linkedin && telegram) return resolve({
          linkedin: linkedin.textContent.trim(),
          telegram: telegram.textContent.trim(),
        });
        if (performance.now() - started > 5000) return reject(new Error('trusted contact reply did not arrive'));
        setTimeout(check, 25);
      };
      check();
    })`,
  }, { label: 'verify trusted contact reply', timeoutMs: 7_000 });
  assert.equal(
    contactReply.exceptionDetails,
    undefined,
    contactReply.exceptionDetails?.exception?.description || 'trusted contact reply evaluation failed',
  );
  assert.match(contactReply.result.value.linkedin, /LinkedIn/i);
  assert.match(contactReply.result.value.telegram, /Telegram/i);

  await cdp.send('Runtime.evaluate', {
    expression: `document.querySelector('agent-dock-shell')?.getChat?.()
      ?.querySelector('[data-action-id="contact-linkedin"]')?.click()`,
  }, { label: 'reject synthetic contact activation', timeoutMs: 5_000 });
  let syntheticContact = await cdp.send('Runtime.evaluate', {
    returnByValue: true,
    expression: `globalThis.__cvShowOpenedUrls.length`,
  });
  assert.equal(syntheticContact.result.value, 0, 'synthetic contact activation must not navigate');
  await cdp.send('Runtime.evaluate', {
    expression: `(() => {
      globalThis.__cvShowContactClicks = [];
      document.querySelector('agent-dock-shell')?.addEventListener('click', (event) => {
        const action = event.target?.closest?.('[data-action-id="contact-linkedin"]');
        if (action) globalThis.__cvShowContactClicks.push({ trusted: event.isTrusted });
      }, { capture: true });
    })()`,
  }, { label: 'observe trusted contact click provenance', timeoutMs: 5_000 });
  await clickVisible(
    cdp,
    'agent-dock-shell agent-show-chat [data-action-id="contact-linkedin"]',
    'trusted LinkedIn contact action',
  );
  let trustedContact = await cdp.send('Runtime.evaluate', {
    returnByValue: true,
    expression: `({ opened: globalThis.__cvShowOpenedUrls, clicks: globalThis.__cvShowContactClicks })`,
  });
  if (trustedContact.result.value.clicks.length === 0) {
    await clickVisible(
      cdp,
      'agent-dock-shell agent-show-chat [data-action-id="contact-linkedin"]',
      'trusted LinkedIn contact action retry',
    );
    trustedContact = await cdp.send('Runtime.evaluate', {
      returnByValue: true,
      expression: `({ opened: globalThis.__cvShowOpenedUrls, clicks: globalThis.__cvShowContactClicks })`,
    });
  }
  assert.deepEqual(trustedContact.result.value.clicks, [{ trusted: true }]);
  assert.equal(trustedContact.result.value.opened.length, 1);
  assert.match(trustedContact.result.value.opened[0][0], /linkedin\.com/);

  await clickVisible(
    cdp,
    'agent-dock-shell agent-show-chat chat-show-player [data-control="stop"]',
    'shared stop control',
  );
  let stopped = await cdp.send('Runtime.evaluate', {
    awaitPromise: true,
    returnByValue: true,
    expression: `new Promise((resolve, reject) => {
      const started = performance.now();
      const check = () => {
        const host = document.querySelector('portfolio-show-chat');
        const value = {
          activeId: host?.narrationSnapshot?.active?.activeId || '',
          playerPresent: Boolean(document.querySelector('agent-dock-shell')?.getChat?.()
            ?.querySelector('chat-show-player')),
          transcriptMessages: document.querySelector('agent-dock-shell')?.getChat?.()
            ?.querySelectorAll('chat-transcript chat-message-item').length,
        };
        if (!value.activeId && value.playerPresent === false) return resolve(value);
        if (performance.now() - started > 5000) return reject(new Error('shared stop did not settle'));
        setTimeout(check, 25);
      };
      check();
    })`,
  }, { label: 'verify shared stop without transcript reset', timeoutMs: 7_000 });
  assert.equal(stopped.result.value.activeId, '');
  assert.equal(stopped.result.value.playerPresent, false);
  assert.ok(stopped.result.value.transcriptMessages >= 6);
  let stoppedPresenter = await cdp.send('Runtime.evaluate', {
    returnByValue: true,
    expression: `({
      presenterCount: document.querySelectorAll('.symbiote-presenter-cursor').length,
      selectionRanges: document.getSelection()?.rangeCount || 0,
    })`,
  }, { label: 'verify manual stop removes presenter resources', timeoutMs: 5_000 });
  assert.deepEqual(stoppedPresenter.result.value, { presenterCount: 0, selectionRanges: 0 });

  await clickVisible(
    cdp,
    'agent-dock-shell agent-show-chat .actions-card[data-action-state="current"] [data-action-id="start-full"]',
    'explicit Full mode selection after stop',
  );
  let automaticCompletion = await cdp.send('Runtime.evaluate', {
    awaitPromise: true,
    returnByValue: true,
    expression: `new Promise((resolve, reject) => {
      const host = document.querySelector('portfolio-show-chat');
      const started = performance.now();
      const checkStarted = () => {
        if (host?.narrationSnapshot?.active?.activeId
          && document.querySelectorAll('.symbiote-presenter-cursor').length === 1) {
          const player = document.querySelector('agent-dock-shell')?.getChat?.()
            ?.querySelector('chat-show-player');
          const positionLabel = player?.$.positionLabel;
          host.stopShow({ completed: true });
          requestAnimationFrame(() => resolve({
            activeId: host?.narrationSnapshot?.active?.activeId || '',
            fullPositionLabel: positionLabel,
            presenterCount: document.querySelectorAll('.symbiote-presenter-cursor').length,
            selectionRanges: document.getSelection()?.rangeCount || 0,
          }));
          return;
        }
        if (performance.now() - started > 10000) {
          resolve({
            timeout: true,
            activeId: host?.narrationSnapshot?.active?.activeId || '',
            presenterCount: document.querySelectorAll('.symbiote-presenter-cursor').length,
            playerPositionLabel: document.querySelector('agent-dock-shell')?.getChat?.()
              ?.querySelector('chat-show-player')?.$.positionLabel || '',
            transcript: document.querySelector('agent-dock-shell')?.getChat?.()
              ?.querySelector('chat-transcript')?.textContent?.trim() || '',
          });
          return;
        }
        setTimeout(checkStarted, 25);
      };
      checkStarted();
    })`,
  }, { label: 'verify automatic completion removes recreated presenter resources', timeoutMs: 12_000 });
  assert.equal(
    automaticCompletion.exceptionDetails,
    undefined,
    automaticCompletion.exceptionDetails?.exception?.description || 'automatic completion evaluation failed',
  );
  if (automaticCompletion.result.value.timeout) {
    assert.fail(`Show did not restart with one presenter resource: ${JSON.stringify(automaticCompletion.result.value)}`);
  }
  assert.deepEqual(automaticCompletion.result.value, {
    activeId: '',
    fullPositionLabel: '1 / 30',
    presenterCount: 0,
    selectionRanges: 0,
  });

  await cdp.send('Emulation.setDeviceMetricsOverride', {
    width: 390,
    height: 844,
    deviceScaleFactor: 1,
    mobile: true,
  });
  await clickVisible(cdp, '.pulse-tour-button', 'mobile CV Show drawer trigger');
  let mobileBeforeChoice = await cdp.send('Runtime.evaluate', {
    awaitPromise: true,
    returnByValue: true,
    expression: `new Promise((resolve, reject) => {
      const started = performance.now();
      const check = () => {
        const dock = document.querySelector('agent-dock-shell');
        const chat = dock?.getChat?.();
        const outerLayout = dock?.ref?.layout;
        const innerLayout = document.querySelector('.portfolio-layout');
        const graph = document.querySelector('portfolio-graph-panel');
        const player = chat?.querySelector('chat-show-player');
        const composer = chat?.querySelector('chat-composer textarea');
        const shortChoice = chat?.querySelector('[data-action-id="start-short"]');
        const dockRect = chat?.getBoundingClientRect();
        const graphRect = graph?.getBoundingClientRect();
        const dockHit = dockRect && document.elementFromPoint(
          dockRect.left + dockRect.width / 2,
          dockRect.top + dockRect.height / 2,
        );
        if (dock?.hasAttribute('mobile')
          && dockRect?.width > 0
          && dockRect.height > 0
          && innerLayout?.hasAttribute('responsive-active')
          && shortChoice) return resolve({
          outerDrawerActive: outerLayout?.hasAttribute('drawer-mode-active'),
          innerResponsiveActive: innerLayout.hasAttribute('responsive-active'),
          innerResponsiveProjection: innerLayout.hasAttribute('drawer-mode-active')
            || innerLayout.hasAttribute('scroll-inline-active'),
          dockFits: dockRect.left >= 0 && dockRect.right <= innerWidth
            && dockRect.top >= 0 && dockRect.bottom <= innerHeight,
          dockTopmost: Boolean(dockHit && dock.contains(dockHit)),
          playerBeforeChoice: Boolean(player),
          mobileHeight: Math.round(dockRect.height),
          horizontalOverflow: Math.max(0, document.documentElement.scrollWidth - innerWidth),
          verticalOverflow: Math.max(0, document.documentElement.scrollHeight - innerHeight),
          composerEnabled: Boolean(composer && !composer.disabled),
          shortChoicePresent: true,
        });
        if (performance.now() - started > 5000) return reject(new Error('mobile Show preselection drawer did not become visible'));
        requestAnimationFrame(check);
      };
      check();
    })`,
  }, { label: 'verify mobile Show preselection and nested responsive layouts', timeoutMs: 7_000 });
  assert.equal(
    mobileBeforeChoice.exceptionDetails,
    undefined,
    mobileBeforeChoice.exceptionDetails?.exception?.description || 'mobile Show preselection evaluation failed',
  );
  assert.deepEqual(mobileBeforeChoice.result.value, {
    outerDrawerActive: true,
    innerResponsiveActive: true,
    innerResponsiveProjection: true,
    dockFits: true,
    dockTopmost: true,
    playerBeforeChoice: false,
    mobileHeight: 755,
    horizontalOverflow: 0,
    verticalOverflow: 0,
    composerEnabled: true,
    shortChoicePresent: true,
  });

  let mobileGraph = await cdp.send('Runtime.evaluate', {
    awaitPromise: true,
    returnByValue: true,
    expression: `(async () => {
      const layout = document.querySelector('.portfolio-layout');
      const graph = document.querySelector('portfolio-graph-panel');
      const handle = layout?.querySelector(
        '.layout-drawer-handle-stack-end [data-drawer-panel-id="portfolio-graph"]',
      );
      if (handle) handle.click();
      else layout?.toggleDrawer?.('end');
      return new Promise((resolve, reject) => {
        const started = performance.now();
        const check = () => {
          const rect = graph?.getBoundingClientRect();
          if (rect?.width > 0 && rect.height > 0) return resolve({
            innerDrawerActive: layout?.hasAttribute('drawer-mode-active'),
            graphNonzero: true,
            graphFits: rect.left >= 0 && rect.right <= innerWidth
              && rect.top >= 0 && rect.bottom <= innerHeight,
          });
          if (performance.now() - started > 5000) return reject(new Error('nested mobile graph drawer did not open'));
          requestAnimationFrame(check);
        };
        check();
      });
    })()`,
  }, { label: 'verify nested mobile graph drawer after reconnect', timeoutMs: 7_000 });
  assert.deepEqual(mobileGraph.result.value, {
    innerDrawerActive: true,
    graphNonzero: true,
    graphFits: true,
  });
  let reconnect = await cdp.send('Runtime.evaluate', {
    awaitPromise: true,
    returnByValue: true,
    expression: `(async () => {
      const dock = document.querySelector('agent-dock-shell');
      const innerLayout = document.querySelector('.portfolio-layout');
      const waitFor = (predicate, label) => new Promise((resolve, reject) => {
        const started = performance.now();
        const check = () => {
          if (predicate()) return resolve();
          if (performance.now() - started > 2000) return reject(new Error(label));
          setTimeout(check, 25);
        };
        check();
      });
      for (let index = 0; index < 3; index += 1) {
        dock?.close?.('acceptance-reconnect');
        await waitFor(() => dock?.hasAttribute('closed'), 'mobile Agent dock did not close');
        dock?.open?.('acceptance-reconnect');
        await waitFor(
          () => dock?.hasAttribute('open')
            && document.querySelectorAll('agent-dock-shell agent-show-chat').length === 1,
          'mobile Agent dock did not reconnect singularly',
        );
      }
      const graphRect = document.querySelector('portfolio-graph-panel')?.getBoundingClientRect();
      return {
        chats: document.querySelectorAll('agent-dock-shell agent-show-chat').length,
        innerLayouts: document.querySelectorAll('agent-dock-shell .portfolio-layout').length,
        innerConnected: Boolean(innerLayout?.isConnected),
        innerResponsiveActive: innerLayout?.hasAttribute('responsive-active'),
        graphNonzero: Boolean(graphRect?.width > 0 && graphRect.height > 0),
      };
    })()`,
  }, { label: 'verify repeated mobile dock reconnect stays singular', timeoutMs: 10_000 });
  assert.deepEqual(reconnect.result.value, {
    chats: 1,
    innerLayouts: 1,
    innerConnected: true,
    innerResponsiveActive: true,
    graphNonzero: true,
  });
  await cdp.send('Runtime.evaluate', {
    awaitPromise: true,
    expression: `(async () => {
      const layout = document.querySelector('.portfolio-layout');
      const graph = document.querySelector('portfolio-graph-panel');
      const handle = layout?.querySelector(
        '.layout-drawer-handle-stack-end [data-drawer-panel-id="portfolio-graph"]',
      );
      if (handle) handle.click();
      else layout?.toggleDrawer?.('end');
      return new Promise((resolve, reject) => {
        const started = performance.now();
        const check = () => {
          const rect = graph?.getBoundingClientRect();
          if (!rect || rect.width === 0 || rect.height === 0) return resolve(true);
          if (performance.now() - started > 5000) return reject(new Error('nested mobile graph drawer did not close'));
          setTimeout(check, 25);
        };
        check();
      });
    })()`,
  }, { label: 'close nested mobile graph drawer before Show selection', timeoutMs: 7_000 });

  await clickVisible(
    cdp,
    'agent-dock-shell agent-show-chat .actions-card[data-action-state="current"] [data-action-id="start-short"]',
    'mobile Short mode selection',
  );
  let mobilePlayer = await cdp.send('Runtime.evaluate', {
    awaitPromise: true,
    returnByValue: true,
    expression: `new Promise((resolve, reject) => {
      const started = performance.now();
      const check = () => {
        const dock = document.querySelector('agent-dock-shell');
        const chat = dock?.getChat?.();
        const player = chat?.querySelector('chat-show-player');
        const controls = Array.from(player?.querySelectorAll('[data-control]') || []);
        const dockRect = chat?.getBoundingClientRect();
        const playerRect = player?.getBoundingClientRect();
        if (dockRect?.height > 0 && playerRect?.height > 0 && controls.length === 4) return resolve({
          playerFits: playerRect.left >= dockRect.left && playerRect.right <= dockRect.right
            && playerRect.width <= dockRect.width,
          controlsPresent: true,
        });
        if (performance.now() - started > 5000) return reject(new Error('mobile embedded Show player did not become visible'));
        setTimeout(check, 25);
      };
      check();
    })`,
  }, { label: 'verify mobile embedded Show player after choice', timeoutMs: 7_000 });
  assert.deepEqual(mobilePlayer.result.value, {
    playerFits: true,
    controlsPresent: true,
  });

  assert.ok(
    cdp.requestedUrls.some((url) => url.includes(`/cv/cv-show-audio-private/maximo-default-male/${LOCAL_AUDIO_REVISION}/manifest.json`)),
    'browser must request the ignored local RU manifest',
  );
  assert.ok(
    cdp.requestedUrls.some((url) => new RegExp(`/cv/cv-show-audio-private/maximo-default-male/${LOCAL_AUDIO_REVISION}/01-short-positioning-[a-f0-9]{12}\\.wav$`, 'u').test(url)),
    'browser must request the first deterministic RU WAV',
  );
  assert.ok(
    cdp.requestedUrls.some((url) => url.includes(`/cv/cv-show-audio-private/maximo-default-male/${LOCAL_AUDIO_REVISION}/alignment/large-v3-turbo/${ALIGNMENT_REVISION}/manifest.json`)),
    'browser must request the ignored RU Whisper alignment manifest',
  );
  assert.ok(
    cdp.requestedUrls.some((url) => url.includes(`/alignment/large-v3-turbo/${ALIGNMENT_REVISION}/aligned/01-short-positioning.json`)),
    'browser must request the workspace-aligned-sequence-v3 artifact',
  );
  const mainW8 = cdp.consoleMessages.slice(0, consoleBeforeShow)
    .filter(({ text }) => text.includes('"code":8'));
  const lazyW8 = cdp.consoleMessages.slice(consoleBeforeShow)
    .filter(({ text }) => text.includes('"code":8'));
  assert.deepEqual(mainW8, [], 'main workspace must not register duplicate tags');
  assert.deepEqual(lazyW8, [], 'lazy agent chat/player must not register duplicate tags');
  assert.equal(cdp.exceptions.length, 0, 'lazy agent chat/player must not throw browser exceptions');
});

test('CV Show hides presenter layers on pause and removes them on terminal lifecycle', {
  timeout: 45_000,
}, async (t) => {
  if (EXTERNAL_TEST_URL) t.skip('presenter lifecycle acceptance requires ignored local audio fixtures');
  let page = await createPortfolioPage(t, {
    viewport: DESKTOP_VIEWPORT,
    touch: false,
  });
  if (!page) return;
  let { cdp, server } = page;

  await navigate(cdp, `${server.origin}/cv/`, { expectedMode: 'structured' });
  await clickVisible(cdp, '.pulse-tour-button', 'presenter lifecycle Show trigger');
  await cdp.send('Runtime.evaluate', {
    awaitPromise: true,
    expression: `new Promise((resolve, reject) => {
      const started = performance.now();
      const check = () => {
        if (document.querySelector('agent-dock-shell agent-show-chat .actions-card[data-action-state="current"] [data-action-id="start-short"]')) {
          return resolve(true);
        }
        if (performance.now() - started > 8000) return reject(new Error('Show mode selection did not mount'));
        requestAnimationFrame(check);
      };
      check();
    })`,
  }, { label: 'wait for presenter lifecycle mode selection', timeoutMs: 10_000 });
  await clickVisible(
    cdp,
    'agent-dock-shell agent-show-chat .actions-card[data-action-state="current"] [data-action-id="start-short"]',
    'presenter lifecycle Short selection',
  );
  await cdp.send('Runtime.evaluate', {
    awaitPromise: true,
    expression: `new Promise((resolve, reject) => {
      const started = performance.now();
      const check = () => {
        const host = document.querySelector('portfolio-show-chat');
        const overlay = document.querySelector('.symbiote-presenter-cursor');
        if (host?.narrationSnapshot?.active?.activeId && overlay) return resolve(true);
        if (performance.now() - started > 8000) return reject(new Error('Show presenter did not start'));
        setTimeout(check, 25);
      };
      check();
    })`,
  }, { label: 'wait for presenter lifecycle Show start', timeoutMs: 10_000 });

  await cdp.send('Runtime.evaluate', {
    expression: `document.querySelector('portfolio-show-chat')?.dispatchEvent(new CustomEvent(
      'portfolio-show-aligned-cue',
      {
        bubbles: true,
        composed: true,
        detail: {
          requestId: 'presenter-lifecycle-marker',
          source: {
            id: 'presenter-lifecycle.marker',
            type: 'marker',
            target: 'profile.experience.15-plus',
            shape: 'oval',
            series: 'presenter-lifecycle',
            policy: 'required',
          },
        },
      },
    ))`,
  }, { label: 'present real shared marker before pause', timeoutMs: 5_000 });
  await cdp.send('Runtime.evaluate', {
    awaitPromise: true,
    expression: `new Promise((resolve, reject) => {
      const started = performance.now();
      const check = () => {
        const overlay = document.querySelector('.symbiote-presenter-cursor');
        const ink = overlay?.querySelector('.pc-ink path')?.getAttribute('d') || '';
        if (overlay?.classList.contains('is-visible') && ink) return resolve(true);
        if (performance.now() - started > 5000) return reject(new Error('shared marker did not become visible'));
        requestAnimationFrame(check);
      };
      check();
    })`,
  }, { label: 'wait for visible shared marker', timeoutMs: 7_000 });

  await clickVisible(
    cdp,
    'agent-dock-shell agent-show-chat chat-show-player [data-control="play"]',
    'pause Show with active marker',
  );
  let markerPaused = await cdp.send('Runtime.evaluate', {
    awaitPromise: true,
    returnByValue: true,
    expression: `new Promise((resolve) => requestAnimationFrame(() => resolve((() => {
      const overlay = document.querySelector('.symbiote-presenter-cursor');
      return {
        visible: overlay?.classList.contains('is-visible') || false,
        opacity: overlay ? getComputedStyle(overlay).opacity : '',
        ink: overlay?.querySelector('.pc-ink path')?.getAttribute('d') || '',
        selectionRanges: document.getSelection()?.rangeCount || 0,
      };
    })())))`,
  }, { label: 'verify marker pause cleanup', timeoutMs: 5_000 });
  assert.deepEqual(markerPaused.result.value, {
    visible: false,
    opacity: '0',
    ink: '',
    selectionRanges: 0,
  });

  await clickVisible(
    cdp,
    'agent-dock-shell agent-show-chat chat-show-player [data-control="play"]',
    'resume Show for native selection lifecycle',
  );
  await cdp.send('Runtime.evaluate', {
    expression: `document.querySelector('portfolio-show-chat')?.dispatchEvent(new CustomEvent(
      'portfolio-show-aligned-cue',
      {
        bubbles: true,
        composed: true,
        detail: {
          requestId: 'presenter-lifecycle-selection',
          source: {
            id: 'presenter-lifecycle.selection',
            type: 'native-selection',
            target: 'profile.experience',
            policy: 'required',
          },
        },
      },
    ))`,
  }, { label: 'present real native selection before pause', timeoutMs: 5_000 });
  await cdp.send('Runtime.evaluate', {
    awaitPromise: true,
    expression: `new Promise((resolve, reject) => {
      const started = performance.now();
      const check = () => {
        if (document.getSelection()?.toString()) return resolve(true);
        if (performance.now() - started > 5000) return reject(new Error('native selection did not become visible'));
        requestAnimationFrame(check);
      };
      check();
    })`,
  }, { label: 'wait for visible native selection', timeoutMs: 7_000 });
  await clickVisible(
    cdp,
    'agent-dock-shell agent-show-chat chat-show-player [data-control="play"]',
    'pause Show with active native selection',
  );
  let selectionPaused = await cdp.send('Runtime.evaluate', {
    awaitPromise: true,
    returnByValue: true,
    expression: `new Promise((resolve) => requestAnimationFrame(() => resolve({
      selectionRanges: document.getSelection()?.rangeCount || 0,
      selectionText: document.getSelection()?.toString() || '',
      overlayOpacity: getComputedStyle(document.querySelector('.symbiote-presenter-cursor')).opacity,
    })))`,
  }, { label: 'verify native selection pause cleanup', timeoutMs: 5_000 });
  assert.deepEqual(selectionPaused.result.value, {
    selectionRanges: 0,
    selectionText: '',
    overlayOpacity: '0',
  });

  await clickVisible(
    cdp,
    'agent-dock-shell agent-show-chat chat-show-player [data-control="stop"]',
    'manual terminal presenter cleanup',
  );
  let manualTerminal = await cdp.send('Runtime.evaluate', {
    awaitPromise: true,
    returnByValue: true,
    expression: `new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve({
        presenterCount: document.querySelectorAll('.symbiote-presenter-cursor').length,
        selectionRanges: document.getSelection()?.rangeCount || 0,
      }))))`,
  }, { label: 'verify manual terminal presenter disposal', timeoutMs: 5_000 });
  assert.deepEqual(manualTerminal.result.value, { presenterCount: 0, selectionRanges: 0 });

  await clickVisible(
    cdp,
    'agent-dock-shell agent-show-chat .actions-card[data-action-state="current"] [data-action-id="start-short"]',
    'restart Show for automatic terminal cleanup',
  );
  let automaticTerminal = await cdp.send('Runtime.evaluate', {
    awaitPromise: true,
    returnByValue: true,
    expression: `new Promise((resolve, reject) => {
      const host = document.querySelector('portfolio-show-chat');
      const started = performance.now();
      const check = () => {
        if (host?.$.isRunning
          && host?.narrationSnapshot?.active?.activeId
          && document.querySelectorAll('.symbiote-presenter-cursor').length === 1) {
          host.stopShow({ completed: true });
          requestAnimationFrame(() => requestAnimationFrame(() => resolve({
            activeId: host.narrationSnapshot.active.activeId || '',
            presenterCount: document.querySelectorAll('.symbiote-presenter-cursor').length,
            selectionRanges: document.getSelection()?.rangeCount || 0,
          })));
          return;
        }
        if (performance.now() - started > 5000) return reject(new Error('Show presenter did not recreate'));
        setTimeout(check, 25);
      };
      check();
    })`,
  }, { label: 'verify automatic terminal presenter disposal', timeoutMs: 5_000 });
  assert.deepEqual(automaticTerminal.result.value, {
    activeId: '',
    presenterCount: 0,
    selectionRanges: 0,
  });
  assert.equal(cdp.exceptions.length, 0, 'presenter lifecycle must not throw browser exceptions');
});

async function installRuGraphSnapshotStartup(cdp) {
  await cdp.send('Page.addScriptToEvaluateOnNewDocument', {
    source: `(() => {
      try { localStorage.setItem('cv-portfolio-locale', 'ru'); } catch {}
      window.__cvGraphPcbQualities = [];
      window.__cvGraphTimeline = [];
      window.__cvGraphSawVisibleStraight = false;
      window.__cvGraphSawConnectionsOnlyOverlay = false;
      window.__cvGraphSawEdgeGap = false;
      window.__cvGraphSawUnhiddenSnapshot = false;
      window.__cvGraphLongTasks = [];
      new PerformanceObserver((list) => {
        window.__cvGraphLongTasks.push(...list.getEntries().map((entry) => ({
          name: entry.name,
          startTime: entry.startTime,
          duration: entry.duration,
        })));
      }).observe({ type: 'longtask', buffered: false });
      let sawVisibleEdges = false;
      let previousFrame = '';
      const sampleFrame = () => {
        const panel = document.querySelector('portfolio-graph-panel');
        const canvas = panel?.querySelector('node-canvas');
        const snapshot = document.querySelector('.portfolio-graph-snapshot');
        const paths = [...(canvas?.querySelectorAll('.sn-conn-path') || [])];
        const overlayReady = snapshot?.matches?.('img[data-graph-visual-layer="connections-only"]')
          && snapshot.complete
          && snapshot.naturalWidth > 0;
        const overlayPaths = overlayReady ? 180 : 0;
        const liveLayer = canvas?.querySelector('svg.sn-connections');
        const straightLike = paths.filter((path) => (
          ((path.getAttribute('d') || '').match(/[mlhvcsqtaz]/giu) || []).join('').toUpperCase() === 'ML'
        )).length;
        const qualities = paths.reduce((counts, path) => {
          const quality = path.getAttribute('data-pcb-quality') || 'none';
          counts[quality] = (counts[quality] || 0) + 1;
          return counts;
        }, {});
        const frame = {
          resolution: panel?.dataset.graphSnapshot || '',
          snapshot: Boolean(snapshot),
          snapshotOpacity: snapshot ? Number(getComputedStyle(snapshot).opacity) : 0,
          canvasOpacity: canvas ? Number(getComputedStyle(canvas).opacity) : 0,
          pathCount: paths.length,
          full: qualities.full || 0,
          draft: qualities.draft || 0,
          none: qualities.none || 0,
          straightLike,
          proxies: canvas?.querySelectorAll('[data-conn-proxy-id]').length || 0,
          dragging: canvas?.getAttribute('data-node-dragging') || '',
        };
        const visibleStraight = frame.canvasOpacity > 0.01
          && frame.snapshotOpacity <= 0.01
          && frame.pathCount > 0
          && frame.straightLike === frame.pathCount;
        const visibleOverlay = overlayPaths === 180 && frame.snapshotOpacity > 0.01;
        const visibleLiveEdges = frame.pathCount === 180
          && Number(liveLayer ? getComputedStyle(liveLayer).opacity : 0) > 0.01;
        const visibleEdges = visibleOverlay || visibleLiveEdges;
        if (visibleOverlay) window.__cvGraphSawConnectionsOnlyOverlay = true;
        if (snapshot && snapshot.getAttribute('aria-hidden') !== 'true') {
          window.__cvGraphSawUnhiddenSnapshot = true;
        }
        if (sawVisibleEdges && !visibleEdges) window.__cvGraphSawEdgeGap = true;
        if (visibleEdges) sawVisibleEdges = true;
        if (visibleStraight) window.__cvGraphSawVisibleStraight = true;
        frame.overlayPaths = overlayPaths;
        frame.visibleEdges = visibleEdges;
        const serialized = JSON.stringify(frame);
        if (serialized !== previousFrame && window.__cvGraphTimeline.length < 120) {
          previousFrame = serialized;
          window.__cvGraphTimeline.push({ t: Math.round(performance.now()), ...frame });
        }
        requestAnimationFrame(sampleFrame);
      };
      requestAnimationFrame(sampleFrame);
      const pcbQualityObserver = new MutationObserver((records) => {
        for (const record of records) {
          const collect = (element) => {
            if (!(element instanceof Element)) return;
            if (element.matches?.('.sn-conn-path[data-pcb-quality]')) {
              if (window.__cvGraphPcbQualities.length < 500) {
                window.__cvGraphPcbQualities.push(element.getAttribute('data-pcb-quality'));
              }
            }
            for (const path of element.querySelectorAll?.('.sn-conn-path[data-pcb-quality]') || []) {
              if (window.__cvGraphPcbQualities.length < 500) {
                window.__cvGraphPcbQualities.push(path.getAttribute('data-pcb-quality'));
              }
            }
          };
          collect(record.target);
          for (const node of record.addedNodes || []) collect(node);
        }
        if (window.__cvGraphPcbQualities.length >= 500) pcbQualityObserver.disconnect();
      });
      pcbQualityObserver.observe(document, {
        attributes: true,
        attributeFilter: ['data-pcb-quality'],
        childList: true,
        subtree: true,
      });
    })()`,
  });
}

async function startPcbRouteCoverage(cdp) {
  await cdp.send('Profiler.enable');
  await cdp.send('Profiler.startPreciseCoverage', {
    callCount: true,
    detailed: true,
  });
}

async function readPcbRouteCoverage(cdp) {
  let coverage = await cdp.send('Profiler.takePreciseCoverage');
  await cdp.send('Profiler.stopPreciseCoverage');
  await cdp.send('Profiler.disable');
  let source = await readFile(path.join(DIST_DIR, 'js', 'index.js'), 'utf8');
  let script = coverage.result.find((entry) => entry.url.endsWith('/cv/js/index.js'));
  let routerMarker = source.match(
    /function\s+[$\w]+\(\{start:[^}]{0,200}fromRect:[^}]{0,80}toRect:/u,
  );
  assert.ok(routerMarker, 'bundled PCB router signature must be present');
  let routerOffset = routerMarker.index;
  let routes = (script?.functions || []).filter((entry) => {
    let range = entry.ranges[0];
    return range.startOffset <= routerOffset && range.endOffset > routerOffset;
  }).sort((left, right) => (
    (left.ranges[0].endOffset - left.ranges[0].startOffset)
    - (right.ranges[0].endOffset - right.ranges[0].startOffset)
  ));
  let route = routes[0];
  assert.ok(route, 'precise coverage must identify the bundled PCB router');
  return {
    functionName: route.functionName,
    startOffset: route.ranges[0].startOffset,
    endOffset: route.ranges[0].endOffset,
    count: route.ranges[0].count,
  };
}

async function readGraphSnapshotAcceptance(cdp, expectedResolution) {
  let result = await cdp.send('Runtime.evaluate', {
    awaitPromise: true,
    returnByValue: true,
    expression: `new Promise((resolve, reject) => {
      const started = performance.now();
      const check = () => {
        const panel = document.querySelector('portfolio-graph-panel');
        const canvas = panel?.querySelector('node-canvas');
        const receipt = canvas?.getPcbRouteSnapshotReceipt?.();
        if (
          panel?.dataset.graphSnapshot === ${JSON.stringify(expectedResolution)}
          && receipt
          && document.querySelectorAll('.portfolio-graph-snapshot').length === 0
        ) {
          const paths = [...canvas.querySelectorAll('.sn-conn-path')];
          return resolve({
            resolution: panel.dataset.graphSnapshot,
            receipt,
            objectCount: document.querySelectorAll('.portfolio-graph-snapshot').length,
            nodeCount: canvas.querySelectorAll('graph-node').length,
            pathCount: paths.length,
            uniqueRouteIds: new Set(
              paths.map((path) => path.getAttribute('data-conn-id')),
            ).size,
            deterministicRouteIds: paths.every((path) => (
              /^conn_[a-f0-9]{16}$/.test(path.getAttribute('data-conn-id') || '')
            )),
            qualities: paths.reduce((counts, path) => {
              const quality = path.getAttribute('data-pcb-quality') || 'none';
              counts[quality] = (counts[quality] || 0) + 1;
              return counts;
            }, {}),
            sawFullPcbQuality: (window.__cvGraphPcbQualities || []).includes('full'),
            sawVisibleStraight: window.__cvGraphSawVisibleStraight === true,
            sawConnectionsOnlyOverlay: window.__cvGraphSawConnectionsOnlyOverlay === true,
            sawEdgeGap: window.__cvGraphSawEdgeGap === true,
            sawUnhiddenSnapshot: window.__cvGraphSawUnhiddenSnapshot === true,
            longTasks: (window.__cvGraphLongTasks || []).slice(),
            maxLongTaskMs: Math.max(
              0,
              ...(window.__cvGraphLongTasks || []).map((entry) => entry.duration),
            ),
            timeline: (window.__cvGraphTimeline || []).slice(-80),
            snapshotResources: performance.getEntriesByType('resource')
              .filter((entry) => entry.name.includes('/portfolio-graph-snapshots/'))
              .map((entry) => new URL(entry.name).pathname),
          });
        }
        if (performance.now() - started > 35_000) {
          const paths = [...(canvas?.querySelectorAll('.sn-conn-path') || [])];
          return resolve({
            timeout: true,
            resolution: panel?.dataset.graphSnapshot || '',
            reason: panel?.dataset.graphSnapshotReason || '',
            receipt: receipt || null,
            themeDefined: Boolean(customElements.get('cascade-theme-widget')),
            fontsStatus: document.fonts?.status || '',
            visibilityState: document.visibilityState,
            panelRect: panel ? {
              width: panel.getBoundingClientRect().width,
              height: panel.getBoundingClientRect().height,
            } : null,
            canvasConnected: Boolean(canvas?.isConnected),
            structuredBound: Boolean(panel?._structuredBound),
            graphNodeCount: canvas?.querySelectorAll('graph-node').length || 0,
            objectCount: document.querySelectorAll('.portfolio-graph-snapshot').length,
            qualities: paths.reduce((counts, path) => {
              const quality = path.getAttribute('data-pcb-quality') || 'none';
              counts[quality] = (counts[quality] || 0) + 1;
              return counts;
            }, {}),
            sawVisibleStraight: window.__cvGraphSawVisibleStraight === true,
            sawConnectionsOnlyOverlay: window.__cvGraphSawConnectionsOnlyOverlay === true,
            sawEdgeGap: window.__cvGraphSawEdgeGap === true,
            sawUnhiddenSnapshot: window.__cvGraphSawUnhiddenSnapshot === true,
            timeline: (window.__cvGraphTimeline || []).slice(-80),
            snapshotResources: performance.getEntriesByType('resource')
              .filter((entry) => entry.name.includes('/portfolio-graph-snapshots/'))
              .map((entry) => ({ name: entry.name, duration: entry.duration })),
          });
        }
        setTimeout(check, 50);
      };
      check();
    })`,
  }, { label: `wait for graph snapshot ${expectedResolution}`, timeoutMs: 40_000 });
  return result.result.value;
}

async function saveGraphSnapshotScreenshot(cdp, name) {
  let screenshot = await cdp.send('Page.captureScreenshot', {
    format: 'webp',
    quality: 90,
    fromSurface: true,
  }, { label: `capture ${name}`, timeoutMs: 10_000 });
  let outputDir = path.join(ROOT, 'tmp', 'cv-graph-snapshot-acceptance');
  await mkdir(outputDir, { recursive: true });
  await writeFile(path.join(outputDir, `${name}.webp`), Buffer.from(screenshot.data, 'base64'));
}

test('normal RU /cv/ adopts the exact cached graph routes after inert first paint', {
  timeout: 60_000,
}, async (t) => {
  let page = await createPortfolioPage(t, {
    viewport: DESKTOP_VIEWPORT,
    touch: false,
  });
  if (!page) return;
  let { cdp, server } = page;
  await installRuGraphSnapshotStartup(cdp);
  await startPcbRouteCoverage(cdp);
  await navigate(cdp, `${server.origin}/cv/`, { expectedMode: 'structured' });
  let state = await readGraphSnapshotAcceptance(cdp, 'cached-pcb');
  let route = await cdp.send('Runtime.evaluate', {
    expression: '({ href: globalThis.location.href, lang: document.documentElement.lang })',
    returnByValue: true,
  });
  assert.deepEqual(route.result.value, { href: `${server.origin}/cv/`, lang: 'ru' });
  assert.ok(state.receipt, JSON.stringify(state));
  assert.equal(state.receipt.adopted, true);
  assert.equal(state.receipt.resolution, 'cached-pcb');
  assert.equal(state.receipt.routeCount, 180);
  assert.equal(state.objectCount, 0);
  assert.equal(state.nodeCount, 119);
  assert.deepEqual(state.qualities, { full: 180 });
  assert.equal(state.uniqueRouteIds, 180);
  assert.equal(state.deterministicRouteIds, true);
  assert.equal(state.snapshotResources.some((url) => url.endsWith('/initial.svg')), true);
  assert.equal(state.snapshotResources.filter((url) => url.endsWith('/initial.svg')).length, 1);
  assert.equal(state.snapshotResources.filter((url) => url.endsWith('.snapshot.json')).length, 1);
  assert.equal(state.sawConnectionsOnlyOverlay, true, JSON.stringify(state.timeline));
  assert.equal(state.sawEdgeGap, false, JSON.stringify(state.timeline));
  assert.equal(state.sawUnhiddenSnapshot, false, JSON.stringify(state.timeline));
  assert.equal(state.sawVisibleStraight, false, JSON.stringify(state.timeline));
  let articleSwitch = await cdp.send('Runtime.evaluate', {
    expression: `(async () => {
      const paths = () => [...document.querySelectorAll('.sn-conn-path')]
        .map((path) => [
          path.getAttribute('data-conn-id'),
          path.getAttribute('d'),
          path.getAttribute('data-pcb-signature'),
          path.getAttribute('data-pcb-quality'),
        ]);
      const geometry = () => [...document.querySelectorAll('graph-node')]
        .map((node) => [
          node.getAttribute('node-id'),
          node.style.transform,
          node.offsetWidth,
          node.offsetHeight,
        ]);
      const beforePaths = JSON.stringify(paths());
      const beforeGeometry = JSON.stringify(geometry());
      const longTasks = [];
      const observer = new PerformanceObserver((list) => {
        longTasks.push(...list.getEntries().map((entry) => ({
          name: entry.name,
          startTime: entry.startTime,
          duration: entry.duration,
        })));
      });
      observer.observe({ type: 'longtask', buffered: false });
      const startedAt = performance.now();
      const select = async (id) => {
        const row = document.querySelector('.sn-tree-row[data-tree-id="' + id + '"]');
        row?.click();
        const selected = await new Promise((resolve) => {
          const selectionStartedAt = performance.now();
          const check = () => {
            const selectedId = document.querySelector(
              '.sn-tree-row[aria-selected="true"]',
            )?.dataset?.treeId || '';
            if (selectedId === id || performance.now() - selectionStartedAt > 2000) {
              resolve(selectedId);
              return;
            }
            requestAnimationFrame(check);
          };
          check();
        });
        await new Promise((resolve) => setTimeout(resolve, 600));
        return { clicked: Boolean(row), selected };
      };
      const project = await select('projects/index');
      const profile = await select('profile/photo');
      observer.disconnect();
      return {
        project,
        profile,
        selectedId: document.querySelector('.sn-tree-row[aria-selected="true"]')?.dataset?.treeId || '',
        routesUnchanged: beforePaths === JSON.stringify(paths()),
        geometryUnchanged: beforeGeometry === JSON.stringify(geometry()),
        routeCount: paths().length,
        elapsedMs: performance.now() - startedAt,
        maxLongTaskMs: Math.max(0, ...longTasks.map((entry) => entry.duration)),
        longTasks,
      };
    })()`,
    awaitPromise: true,
    returnByValue: true,
  });
  assert.deepEqual(articleSwitch.result.value.project, {
    clicked: true,
    selected: 'projects/index',
  });
  assert.deepEqual(articleSwitch.result.value.profile, {
    clicked: true,
    selected: 'profile/photo',
  });
  assert.equal(articleSwitch.result.value.selectedId, 'profile/photo');
  assert.equal(articleSwitch.result.value.routesUnchanged, true, JSON.stringify(articleSwitch.result.value));
  assert.equal(articleSwitch.result.value.geometryUnchanged, true, JSON.stringify(articleSwitch.result.value));
  assert.equal(articleSwitch.result.value.routeCount, 180);
  let pcbCoverage = await readPcbRouteCoverage(cdp);
  if (VERBOSE_OUTPUT) {
    console.log('graph-startup-order-acceptance', JSON.stringify({
      coldStart: {
        resolution: state.resolution,
        receipt: state.receipt,
        nodeCount: state.nodeCount,
        pathCount: state.pathCount,
        uniqueRouteIds: state.uniqueRouteIds,
        qualities: state.qualities,
        maxLongTaskMs: state.maxLongTaskMs,
        longTasks: state.longTasks,
      },
      articleSwitch: articleSwitch.result.value,
      pcbCoverage,
    }));
  }
  assert.equal(pcbCoverage.count, 0, JSON.stringify(pcbCoverage));
  assert.ok(articleSwitch.result.value.maxLongTaskMs < 250, JSON.stringify(articleSwitch.result.value));
  await saveGraphSnapshotScreenshot(cdp, 'ru-wide-cached-pcb');
  assert.equal(cdp.exceptions.length, 0);
});

test('normal RU /cv/ adopts the wide cached graph on a Retina desktop', {
  timeout: 60_000,
}, async (t) => {
  let page = await createPortfolioPage(t, {
    viewport: { ...DESKTOP_VIEWPORT, deviceScaleFactor: 2 },
    touch: false,
  });
  if (!page) return;
  let { cdp, server } = page;
  await installRuGraphSnapshotStartup(cdp);
  await navigate(cdp, `${server.origin}/cv/`, { expectedMode: 'structured' });
  let state = await readGraphSnapshotAcceptance(cdp, 'cached-pcb');
  assert.equal(state.receipt?.adopted, true, JSON.stringify(state));
  assert.equal(state.receipt?.routeCount, 180, JSON.stringify(state));
  assert.equal(state.resolution, 'cached-pcb', JSON.stringify(state));
  assert.deepEqual(state.qualities, { full: 180 });
  assert.equal(state.sawVisibleStraight, false, JSON.stringify(state.timeline));
  await new Promise((resolve) => setTimeout(resolve, 12_000));
  let stable = await cdp.send('Runtime.evaluate', {
    expression: `(() => {
      const panel = document.querySelector('portfolio-graph-panel');
      const paths = [...document.querySelectorAll('.sn-conn-path')];
      return {
        resolution: panel?.dataset.graphSnapshot || '',
        reason: panel?.dataset.graphSnapshotReason || '',
        full: paths.filter((path) => path.getAttribute('data-pcb-quality') === 'full').length,
      };
    })()`,
    returnByValue: true,
  });
  assert.deepEqual(stable.result.value, { resolution: 'cached-pcb', reason: '', full: 180 });
  assert.equal(cdp.exceptions.length, 0);
});

test('normal RU /cv/ adopts the wide cached graph at the common 1280 desktop size', {
  timeout: 60_000,
}, async (t) => {
  let page = await createPortfolioPage(t, {
    viewport: { width: 1280, height: 720, deviceScaleFactor: 2, mobile: false },
    touch: false,
  });
  if (!page) return;
  let { cdp, server } = page;
  await installRuGraphSnapshotStartup(cdp);
  await navigate(cdp, `${server.origin}/cv/`, { expectedMode: 'structured' });
  let state = await readGraphSnapshotAcceptance(cdp, 'cached-pcb');
  assert.equal(state.receipt?.adopted, true, JSON.stringify(state));
  assert.equal(state.receipt?.routeCount, 180, JSON.stringify(state));
  assert.equal(state.resolution, 'cached-pcb', JSON.stringify(state));
  assert.deepEqual(state.qualities, { full: 180 });
  assert.equal(state.sawVisibleStraight, false, JSON.stringify(state.timeline));
  await new Promise((resolve) => setTimeout(resolve, 12_000));
  let stable = await cdp.send('Runtime.evaluate', {
    expression: `(() => {
      const panel = document.querySelector('portfolio-graph-panel');
      const paths = [...document.querySelectorAll('.sn-conn-path')];
      return {
        resolution: panel?.dataset.graphSnapshot || '',
        reason: panel?.dataset.graphSnapshotReason || '',
        full: paths.filter((path) => path.getAttribute('data-pcb-quality') === 'full').length,
      };
    })()`,
    returnByValue: true,
  });
  assert.deepEqual(stable.result.value, { resolution: 'cached-pcb', reason: '', full: 180 });
  assert.equal(cdp.exceptions.length, 0);
});

test('plain /cv/ keeps its cached graph after resolving the browser locale during startup', {
  timeout: 60_000,
}, async (t) => {
  let page = await createPortfolioPage(t, {
    viewport: { width: 1280, height: 720, deviceScaleFactor: 2, mobile: false },
    touch: false,
  });
  if (!page) return;
  let { cdp, server } = page;
  await navigate(cdp, `${server.origin}/cv/`, { expectedMode: 'structured' });
  await new Promise((resolve) => setTimeout(resolve, 18_000));
  let state = await cdp.send('Runtime.evaluate', {
    expression: `(() => {
      const panel = document.querySelector('portfolio-graph-panel');
      const paths = [...document.querySelectorAll('.sn-conn-path')];
      return {
        lang: document.documentElement.lang,
        resolution: panel?.dataset.graphSnapshot || '',
        reason: panel?.dataset.graphSnapshotReason || '',
        full: paths.filter((path) => path.getAttribute('data-pcb-quality') === 'full').length,
        diagnostics: ['skills/product-ui', 'skills/agentic-ai'].map((id) => {
          const node = document.querySelector('graph-node[node-id="' + id + '"]');
          const style = node ? getComputedStyle(node) : null;
          return { id, width: node?.offsetWidth, height: node?.offsetHeight, transform: node?.style.transform, font: style?.fontFamily, fontSize: style?.fontSize };
        }),
      };
    })()`,
    returnByValue: true,
  });
  assert.equal(state.result.value.resolution, 'cached-pcb', JSON.stringify(state.result.value));
  assert.equal(state.result.value.reason, '', JSON.stringify(state.result.value));
  assert.equal(state.result.value.full, 180, JSON.stringify(state.result.value));
  console.log('plain-cv-graph-diagnostics', JSON.stringify(state.result.value.diagnostics));
  assert.equal(cdp.exceptions.length, 0);
});

test('normal RU /cv/ keeps the inert PCB until a drifted snapshot reroutes to full live PCB', {
  timeout: 60_000,
}, async (t) => {
  let page = await createPortfolioPage(t, {
    corruptGraphSnapshot: true,
    viewport: DESKTOP_VIEWPORT,
    touch: false,
  });
  if (!page) return;
  let { cdp, server } = page;
  await installRuGraphSnapshotStartup(cdp);
  await startPcbRouteCoverage(cdp);
  await navigate(cdp, `${server.origin}/cv/`, { expectedMode: 'structured' });
  let state = await readGraphSnapshotAcceptance(cdp, 'live-pcb');
  let route = await cdp.send('Runtime.evaluate', {
    expression: '({ href: globalThis.location.href, lang: document.documentElement.lang })',
    returnByValue: true,
  });
  assert.deepEqual(route.result.value, { href: `${server.origin}/cv/`, lang: 'ru' });
  assert.equal(state.receipt.adopted, false);
  assert.equal(state.receipt.resolution, 'pcb-live-reroute');
  assert.equal(state.receipt.reason, 'route-fingerprint-mismatch');
  assert.equal(state.objectCount, 0);
  assert.equal(state.nodeCount, 119);
  assert.deepEqual(state.qualities, { full: 180 });
  assert.equal(state.sawFullPcbQuality, true);
  assert.equal(state.sawConnectionsOnlyOverlay, true, JSON.stringify(state.timeline));
  assert.equal(state.sawEdgeGap, false, JSON.stringify(state.timeline));
  assert.equal(state.sawUnhiddenSnapshot, false, JSON.stringify(state.timeline));
  assert.equal(state.sawVisibleStraight, false, JSON.stringify(state.timeline));
  let pcbCoverage = await readPcbRouteCoverage(cdp);
  if (VERBOSE_OUTPUT) {
    console.log('graph-startup-order-mismatch', JSON.stringify({
      resolution: state.resolution,
      receipt: state.receipt,
      nodeCount: state.nodeCount,
      pathCount: state.pathCount,
      qualities: state.qualities,
      maxLongTaskMs: state.maxLongTaskMs,
      longTasks: state.longTasks,
      pcbCoverage,
    }));
  }
  assert.ok(pcbCoverage.count > 0, JSON.stringify(pcbCoverage));
  await saveGraphSnapshotScreenshot(cdp, 'ru-wide-fingerprint-mismatch-live-pcb');
  assert.equal(cdp.exceptions.length, 0);
});

test('normal RU /cv/ adopts the narrow cached graph after the mobile drawer opens', {
  timeout: 60_000,
}, async (t) => {
  let page = await createPortfolioPage(t, {
    viewport: MOBILE_VIEWPORT,
  });
  if (!page) return;
  let { cdp, server } = page;
  await installRuGraphSnapshotStartup(cdp);
  await navigate(cdp, `${server.origin}/cv/`, { expectedMode: 'structured' });
  let mobileResult = await cdp.send('Runtime.evaluate', {
    awaitPromise: true,
    returnByValue: true,
    expression: `new Promise((resolve, reject) => {
      const started = performance.now();
      let lastToggle = 0;
      const check = () => {
        const layout = document.querySelector('.portfolio-layout');
        const panel = document.querySelector('portfolio-graph-panel');
        const canvas = panel?.querySelector('node-canvas');
        const rect = panel?.getBoundingClientRect();
        const receipt = canvas?.getPcbRouteSnapshotReceipt?.();
        const paths = [...(canvas?.querySelectorAll('.sn-conn-path') || [])];
        if (panel?.dataset.graphSnapshot === 'cached-pcb'
          && receipt?.adopted
          && paths.length === 180
          && document.querySelectorAll('.portfolio-graph-snapshot').length === 0) {
          return resolve({
            receipt,
            qualities: paths.reduce((counts, path) => {
              const quality = path.getAttribute('data-pcb-quality') || 'none';
              counts[quality] = (counts[quality] || 0) + 1;
              return counts;
            }, {}),
            uniqueRouteIds: new Set(paths.map((path) => path.getAttribute('data-conn-id'))).size,
            sawVisibleStraight: window.__cvGraphSawVisibleStraight === true,
            timeline: (window.__cvGraphTimeline || []).slice(-80),
          });
        }
        if ((!rect || rect.width < 128 || rect.height < 128)
          && performance.now() - lastToggle >= 1000) {
          const handle = layout?.querySelector(
            '.layout-drawer-handle-stack-end [data-drawer-panel-id="portfolio-graph"]',
          );
          if (handle) handle.click();
          else layout?.toggleDrawer?.('end');
          lastToggle = performance.now();
        }
        if (performance.now() - started > 35_000) {
          return reject(new Error('Mobile graph drawer did not retain and adopt cached PCB: '
            + JSON.stringify({
              resolution: panel?.dataset.graphSnapshot || '',
              panelRect: rect ? { width: rect.width, height: rect.height } : null,
              structuredBound: Boolean(panel?._structuredBound),
              routeCount: paths.length,
              receipt: receipt || null,
            })));
        }
        setTimeout(check, 100);
      };
      check();
    })`,
  }, { label: 'open RU mobile graph drawer and adopt cached PCB', timeoutMs: 40_000 });
  let state = mobileResult.result.value;
  assert.ok(state.receipt, JSON.stringify(state));
  assert.equal(state.receipt.adopted, true);
  assert.equal(state.receipt.routeCount, 180);
  assert.deepEqual(state.qualities, { full: 180 });
  assert.equal(state.uniqueRouteIds, 180);
  assert.equal(state.sawVisibleStraight, false, JSON.stringify(state.timeline));
  await saveGraphSnapshotScreenshot(cdp, 'ru-narrow-cached-pcb');
  assert.equal(cdp.exceptions.length, 0);
});

test('normal RU /cv/ preserves full PCB plus exactly three proxies during one-node drag', {
  timeout: 60_000,
}, async (t) => {
  let page = await createPortfolioPage(t, {
    viewport: DESKTOP_VIEWPORT,
    touch: false,
  });
  if (!page) return;
  let { cdp, server } = page;
  await installRuGraphSnapshotStartup(cdp);
  await navigate(cdp, `${server.origin}/cv/`, { expectedMode: 'structured' });
  let settled = await readGraphSnapshotAcceptance(cdp, 'cached-pcb');
  assert.equal(settled.sawVisibleStraight, false, JSON.stringify(settled.timeline));

  let target = await cdp.send('Runtime.evaluate', {
    awaitPromise: true,
    returnByValue: true,
    expression: `(async () => {
      const canvas = document.querySelector('portfolio-graph-panel node-canvas');
      const degree = new Map();
      for (const path of canvas.querySelectorAll('.sn-conn-path[data-pcb-signature]')) {
        const [, from, , to] = (path.getAttribute('data-pcb-signature') || '').split(':');
        if (from) degree.set(from, (degree.get(from) || 0) + 1);
        if (to) degree.set(to, (degree.get(to) || 0) + 1);
      }
      const nodeId = [...degree].find(([, count]) => count === 3)?.[0] || '';
      if (!nodeId) return null;
      canvas.selectNode?.(nodeId);
      await new Promise((resolve) => setTimeout(resolve, 900));
      const node = canvas.querySelector('graph-node[node-id="' + CSS.escape(nodeId) + '"]');
      const rect = node?.getBoundingClientRect();
      window.__cvGraphBeforeDragRoutes = Object.fromEntries(
        [...canvas.querySelectorAll('.sn-conn-path')].map((path) => [
          path.getAttribute('data-conn-id'),
          path.getAttribute('d') || '',
        ]),
      );
      return rect ? {
        nodeId,
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
      } : null;
    })()`,
  }, { label: 'locate three-connection graph node', timeoutMs: 5_000 });
  assert.ok(target.result.value, 'a visible three-connection node is required');
  let { x, y } = target.result.value;
  await cdp.send('Input.dispatchMouseEvent', {
    type: 'mousePressed',
    x,
    y,
    button: 'left',
    buttons: 1,
    clickCount: 1,
  });
  for (let index = 1; index <= 6; index += 1) {
    await cdp.send('Input.dispatchMouseEvent', {
      type: 'mouseMoved',
      x: x + index * 8,
      y: y + index * 3,
      button: 'left',
      buttons: 1,
    });
  }
  let dragging = await cdp.send('Runtime.evaluate', {
    returnByValue: true,
    expression: `(() => {
      const canvas = document.querySelector('portfolio-graph-panel node-canvas');
      const paths = [...canvas.querySelectorAll('.sn-conn-path')];
      return {
        dragging: canvas.getAttribute('data-node-dragging') || '',
        proxies: canvas.querySelectorAll('[data-conn-proxy-id]').length,
        full: paths.filter((path) => path.getAttribute('data-pcb-quality') === 'full').length,
        pathCount: paths.length,
        snapshotCount: document.querySelectorAll('.portfolio-graph-snapshot').length,
        retainedRoutes: paths.filter((path) => (
          window.__cvGraphBeforeDragRoutes?.[path.getAttribute('data-conn-id')]
            === (path.getAttribute('d') || '')
        )).length,
        sawVisibleStraight: window.__cvGraphSawVisibleStraight === true,
      };
    })()`,
  });
  assert.equal(dragging.result.value.dragging, target.result.value.nodeId);
  assert.equal(dragging.result.value.proxies, 3);
  assert.equal(dragging.result.value.full, 180);
  assert.equal(dragging.result.value.pathCount, 180);
  assert.equal(dragging.result.value.snapshotCount, 0);
  assert.equal(dragging.result.value.retainedRoutes, 180);
  assert.equal(dragging.result.value.sawVisibleStraight, false);
  await saveGraphSnapshotScreenshot(cdp, 'ru-wide-pcb-three-drag-proxies');

  await cdp.send('Input.dispatchMouseEvent', {
    type: 'mouseReleased',
    x: x + 48,
    y: y + 18,
    button: 'left',
    buttons: 0,
    clickCount: 1,
  });
  let dropped = await cdp.send('Runtime.evaluate', {
    awaitPromise: true,
    returnByValue: true,
    expression: `new Promise((resolve, reject) => {
      const canvas = document.querySelector('portfolio-graph-panel node-canvas');
      const started = performance.now();
      const check = () => {
        const paths = [...canvas.querySelectorAll('.sn-conn-path')];
        const state = {
          proxies: canvas.querySelectorAll('[data-conn-proxy-id]').length,
          full: paths.filter((path) => path.getAttribute('data-pcb-quality') === 'full').length,
          pathCount: paths.length,
          straightLike: paths.filter((path) => (
            ((path.getAttribute('d') || '').match(/[mlhvcsqtaz]/giu) || []).join('').toUpperCase() === 'ML'
          )).length,
          retainedRoutes: paths.filter((path) => (
            window.__cvGraphBeforeDragRoutes?.[path.getAttribute('data-conn-id')]
              === (path.getAttribute('d') || '')
          )).length,
          sawVisibleStraight: window.__cvGraphSawVisibleStraight === true,
          timeline: (window.__cvGraphTimeline || []).slice(-80),
        };
        if (
          state.proxies === 0
          && state.pathCount === 180
          && state.full === 180
          && state.retainedRoutes === 177
          && state.straightLike < state.pathCount
        ) {
          return resolve(state);
        }
        if (performance.now() - started > 8000) return resolve({ ...state, timeout: true });
        requestAnimationFrame(check);
      };
      check();
    })`,
  }, { label: 'wait for full PCB after drop', timeoutMs: 10_000 });
  assert.equal(Boolean(dropped.exceptionDetails), false, JSON.stringify(dropped.exceptionDetails));
  assert.equal(dropped.result.value.timeout, undefined, JSON.stringify(dropped.result.value));
  assert.equal(dropped.result.value.retainedRoutes, 177);
  assert.equal(dropped.result.value.full, 180);
  assert.equal(dropped.result.value.pathCount - dropped.result.value.retainedRoutes, 3);
  assert.ok(dropped.result.value.straightLike < dropped.result.value.pathCount);
  assert.equal(dropped.result.value.sawVisibleStraight, false, JSON.stringify(dropped.result.value.timeline));
  await saveGraphSnapshotScreenshot(cdp, 'ru-wide-pcb-after-drop');
  assert.equal(cdp.exceptions.length, 0);
});
