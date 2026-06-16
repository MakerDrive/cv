import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { createServer } from 'node:http';
import { mkdtemp, readFile, rm, stat } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

import WebSocket from 'ws';

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

const FLAT_ROUTE = '/cv/?mode=flat&resource-test=mobile-flat';
const STRUCTURED_ROUTE = '/cv/?resource-test=mobile-structured';
const EXTERNAL_TEST_URL = process.env.CV_RESOURCE_TEST_URL || '';
const VERBOSE_OUTPUT = process.env.CV_RESOURCE_TEST_VERBOSE === '1';

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
  return new CdpClient(socket);
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
          const activeRenderer = expectedMode === 'flat'
            ? graphPanel?.querySelector('canvas-graph')
            : graphPanel?.querySelector('node-canvas');
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

async function createMobilePage(t) {
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
  t.after(() => cdp.close());

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
      'https://www.youtube.com/*',
      'https://github.com/*',
      'https://www.npmjs.com/*',
    ],
  });

  return { cdp, server };
}

async function exercisePortfolioUi(cdp) {
  let steps = [];
  for (let index = 0; index < 4; index += 1) {
    steps.push(await runPortfolioStep(cdp, `cycle ${index + 1}: switch to structured graph`, `
      graph.setGraphViewMode?.(false);
    `));
    steps.push(await runPortfolioStep(cdp, `cycle ${index + 1}: switch to flat graph`, `
      graph.setGraphViewMode?.(true);
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
    graph.setGraphViewMode?.(true);
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
    graph.setGraphViewMode?.(false);
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
  t.after(() => cdp.close());

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
      'https://www.youtube.com/*',
      'https://github.com/*',
      'https://www.npmjs.com/*',
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
  t.after(() => cdp.close());

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
      'https://www.youtube.com/*',
      'https://github.com/*',
      'https://www.npmjs.com/*',
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
