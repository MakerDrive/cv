import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { createServer } from 'node:http';
import { mkdtemp, readFile, rm, stat } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

import WebSocket from 'ws';
import { stripPortfolioArticleBlockMarkers } from '../../src/static-pages/data/portfolioArticleMedia.js';
import { PORTFOLIO_LOCALE_MESSAGES } from '../../src/static-pages/data/portfolioTranslations.js';
import { loadProjectEntries } from '../../src/static-pages/data/projects.js';
import { PROJECT_TRANSLATIONS } from '../../src/static-pages/data/projectTranslations.js';
import { PUBLICATIONS } from '../../src/static-pages/data/publications.js';

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

const MIME_TYPES = new Map([
  ['.css', 'text/css; charset=utf-8'],
  ['.html', 'text/html; charset=utf-8'],
  ['.js', 'application/javascript; charset=utf-8'],
  ['.json', 'application/json; charset=utf-8'],
  ['.svg', 'image/svg+xml'],
  ['.webp', 'image/webp'],
  ['.xml', 'application/xml; charset=utf-8'],
]);

function getMimeType(filePath) {
  return MIME_TYPES.get(path.extname(filePath)) || 'application/octet-stream';
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

function startStaticServer() {
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
      let body = await readFile(filePath);
      response.writeHead(200, {
        'cache-control': 'no-store',
        'content-type': getMimeType(filePath),
      });
      response.end(body);
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
    console.log('[BROWSER CONSOLE]', params.message.text);
  });
  client.on('Runtime.exceptionThrown', (params) => {
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
  let server = await startStaticServer();
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
  assert.match(esState.title, /Ingeniero de IA/);
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
  assert.match(storedState.title, /Ingeniero de IA/);
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

  await navigate(cdp, `${server.origin}/cv/projects/autobox-v1/pulse/autobox-v1/?mode=structured&resource-test=appearance-panel`, {
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
  assert.equal(state.initial.contrast, 100, JSON.stringify(state));
  assert.equal(state.initial.pattern, 100, JSON.stringify(state));
  assert.equal(Number(state.initial.rootPattern), 1, JSON.stringify(state));
  assert.equal(state.initial.storedPattern, 100, JSON.stringify(state));
  assert.deepEqual(state.initial.editorOverrides, []);
  assert.deepEqual(state.initial.widgetOverrides, []);
  assert.equal(state.graphBeforeReset.viewMode, 'flat', JSON.stringify(state));
  assert.equal(state.graphBeforeReset.layout, 'tree', JSON.stringify(state));
  assert.equal(state.graphBeforeReset.urlMode, 'flat', JSON.stringify(state));
  assert.equal(state.graphBeforeReset.urlLayout, 'tree', JSON.stringify(state));
  assert.equal(state.storedPatternAfterInput, 0, JSON.stringify(state));
  assert.equal(state.afterReset.contrast, 100, JSON.stringify(state));
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
      const isPulseMediaState = (state) => state.pathname === '/cv/projects/autobox-v1/pulse/autobox-v1/'
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
    assert.equal(mediaState.pathname, '/cv/projects/autobox-v1/pulse/autobox-v1/');
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
      include: ['Обзор навыков', 'R&D как центральный навык'],
      exclude: ['Skill overview', 'R&D as the central skill'],
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
      include: ['Resumen de habilidades', 'I+D como habilidad central'],
      exclude: ['Skill overview', 'R&D as the central skill'],
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

  let publication = PUBLICATIONS.find((item) => item.id === 'pulse/agent-portal');
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
    for (let paragraph of getVisibleMarkdownParagraphs(localizedPublication.body)) {
      assert.ok(visible.articleText.includes(paragraph), `${locale}:publication body`);
    }
    assert.equal(
      visible.articleText.includes(projectFallback.summary),
      false,
      `${locale}:publication must not render project summary`
    );
    for (let paragraph of getVisibleMarkdownParagraphs(projectFallback.details)) {
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
      viewProject: 'Смотреть проект',
      viewRepository: 'Смотреть репозиторий',
    },
    es: {
      selected: 'Proyecto destacado',
      author: 'Proyecto propio',
      viewProject: 'Ver proyecto',
      viewRepository: 'Ver repositorio',
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
      for (let paragraph of getVisibleMarkdownParagraphs(translation.details)) {
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
      for (let paragraph of getVisibleMarkdownParagraphs(project.details)) {
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
  assert.equal(last.page.panelLayouts, 1);
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
          return location.pathname === '/cv/projects/autobox-v1/pulse/autobox-v1/' ? true : null;
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
  assert.equal(res.childSelected, true, 'Selecting child occurrence should select pulse/autobox-v1');
  assert.deepEqual(res.selectedTreeRows, ['occurrence/autobox-v1/pulse/autobox-v1'], 'Exactly one tree row (the primary occurrence) should be selected');
  assert.equal(res.canonicalUrl, '/cv/projects/autobox-v1/pulse/autobox-v1/', 'Nested URL should be canonical projects path');

  await navigate(cdp, `${server.origin}/cv/pulse/autobox-v1/?mode=flat`, {
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
        return selected?.dataset.treeId === 'occurrence/autobox-v1/pulse/autobox-v1'
          ? 'pulse/autobox-v1'
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
  assert.equal(aliasRes.selectedId, 'pulse/autobox-v1', 'Legacy alias should select pulse/autobox-v1');
  assert.deepEqual(aliasRes.selectedTreeRows, ['occurrence/autobox-v1/pulse/autobox-v1'], 'Legacy alias should highlight primary tree occurrence');
  assert.equal(aliasRes.canonicalLink, 'https://MakerDrive.github.io/cv/projects/autobox-v1/pulse/autobox-v1/', 'Canonical link in legacy alias header must target the canonical project-owned route');
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
      const link = document.querySelector('a[data-publication-id="pulse/agent-portal"]');
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
  assert.equal(beforeState.latestSection, false, 'Historical-only feed should not render an empty latest section');
  assert.equal(beforeState.cardMinHeight, '0px', 'Pulse cards must override the global article minimum height');
  assert.equal(beforeState.cardPadding, '0px', 'Pulse cards must not inherit global article padding');
  assert.ok(beforeState.cardHeight > 0 && beforeState.cardHeight < 500, `Pulse card should size to content, got ${beforeState.cardHeight}px`);
  assert.equal(beforeState.linkFound, true, 'Expected Agent Portal publication link in the Pulse feed');

  await cdp.send('Runtime.evaluate', {
    expression: `document.querySelector('a[data-publication-id="pulse/agent-portal"]')?.click()`,
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
  assert.equal(afterState.pathname, '/cv/projects/agent-portal/pulse/agent-portal/');
  assert.deepEqual(afterState.selectedTreeRows, ['occurrence/agent-portal/pulse/agent-portal']);
});
