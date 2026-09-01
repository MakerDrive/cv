import { spawn } from 'node:child_process';
import { createHash } from 'node:crypto';
import { createServer } from 'node:http';
import {
  cp,
  mkdir,
  mkdtemp,
  readFile,
  rm,
  stat,
  writeFile,
} from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import WebSocket from 'ws';

import {
  PORTFOLIO_GRAPH_SNAPSHOT_MANIFEST_SCHEMA,
  PORTFOLIO_GRAPH_SNAPSHOT_VARIANTS,
  serializePortfolioGraphSnapshotValue,
} from '../src/static-pages/data/portfolioGraphSnapshot.js';
import {
  PORTFOLIO_THEME_DARK_STATE,
  PORTFOLIO_THEME_LIGHT_STATE,
} from '../src/static-pages/data/portfolioThemeDefaults.js';

const ROOT = path.resolve(fileURLToPath(new URL('..', import.meta.url)));
const DIST_DIR = path.join(ROOT, 'dist');
const OUTPUT_DIR = path.join(DIST_DIR, 'portfolio-graph-snapshots');
const CHROME_CANDIDATES = Object.freeze([
  process.env.CV_CHROME_PATH,
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome-stable',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium-browser',
  '/usr/bin/chromium',
].filter(Boolean));
const VIEWPORTS = Object.freeze({
  wide: Object.freeze({ width: 1440, height: 900 }),
  narrow: Object.freeze({ width: 390, height: 844 }),
});
const THEMES = Object.freeze({
  light: PORTFOLIO_THEME_LIGHT_STATE,
  dark: PORTFOLIO_THEME_DARK_STATE,
});
function sha256(value) {
  return createHash('sha256').update(value).digest('hex');
}

function escapeXml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

async function fileExists(filePath) {
  try {
    return (await stat(filePath)).isFile();
  } catch {
    return false;
  }
}

function getMimeType(filePath) {
  switch (path.extname(filePath)) {
    case '.css': return 'text/css; charset=utf-8';
    case '.html': return 'text/html; charset=utf-8';
    case '.js': return 'application/javascript; charset=utf-8';
    case '.json': return 'application/json; charset=utf-8';
    case '.svg': return 'image/svg+xml';
    case '.ttf': return 'font/ttf';
    case '.webp': return 'image/webp';
    default: return 'application/octet-stream';
  }
}

function startStaticServer() {
  let server = createServer(async (request, response) => {
    try {
      let pathname = decodeURIComponent(new URL(request.url || '/', 'http://localhost').pathname);
      if (!pathname.startsWith('/cv/')) {
        response.writeHead(404).end('Not found');
        return;
      }
      let relativePath = pathname.slice('/cv/'.length);
      if (!relativePath || relativePath.endsWith('/')) relativePath += 'index.html';
      let filePath = path.resolve(DIST_DIR, relativePath);
      if (!filePath.startsWith(DIST_DIR) || !await fileExists(filePath)) {
        response.writeHead(404).end('Not found');
        return;
      }
      response.writeHead(200, {
        'cache-control': 'no-store',
        'content-type': getMimeType(filePath),
      });
      response.end(await readFile(filePath));
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
    socket.on('message', (data) => this.handleMessage(data));
  }

  handleMessage(data) {
    let message = JSON.parse(String(data));
    if (!message.id || !this.pending.has(message.id)) return;
    let { resolve, reject, timer } = this.pending.get(message.id);
    clearTimeout(timer);
    this.pending.delete(message.id);
    if (message.error) reject(new Error(message.error.message));
    else resolve(message.result || {});
  }

  send(method, params = {}, timeoutMs = 30_000) {
    let id = this.nextId++;
    this.socket.send(JSON.stringify({ id, method, params }));
    return new Promise((resolve, reject) => {
      let timer = setTimeout(() => {
        this.pending.delete(id);
        reject(new Error(`CDP timeout: ${method}`));
      }, timeoutMs);
      this.pending.set(id, { resolve, reject, timer });
    });
  }

  close() {
    this.socket.close();
  }
}

async function waitForFile(filePath, timeoutMs = 30_000) {
  let started = Date.now();
  while (Date.now() - started < timeoutMs) {
    if (await fileExists(filePath)) return;
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
  throw new Error(`Timed out waiting for ${filePath}`);
}

async function resolveChromePath() {
  for (let candidate of CHROME_CANDIDATES) {
    if (await fileExists(candidate)) return candidate;
  }
  throw new Error(`Chrome is required to render graph snapshots: ${CHROME_CANDIDATES.join(', ')}`);
}

async function launchChrome() {
  const chromePath = await resolveChromePath();
  let userDataDir = await mkdtemp(path.join(tmpdir(), 'cv-graph-snapshot-chrome-'));
  let chrome = spawn(chromePath, [
    '--headless=new',
    '--remote-debugging-port=0',
    '--disable-background-networking',
    '--disable-default-apps',
    '--disable-extensions',
    '--disable-features=Translate',
    '--disable-sync',
    '--hide-scrollbars',
    '--no-first-run',
    `--user-data-dir=${userDataDir}`,
    'about:blank',
  ], { stdio: 'ignore' });
  let portFile = path.join(userDataDir, 'DevToolsActivePort');
  try {
    await waitForFile(portFile);
    let [port] = (await readFile(portFile, 'utf8')).trim().split('\n');
    return {
      port,
      async close() {
        chrome.kill('SIGTERM');
        if (chrome.exitCode === null) await new Promise((resolve) => chrome.once('exit', resolve));
        await rm(userDataDir, { force: true, recursive: true });
      },
    };
  } catch (error) {
    chrome.kill('SIGTERM');
    await rm(userDataDir, { force: true, recursive: true });
    throw error;
  }
}

async function createPage(port) {
  let response = await fetch(`http://127.0.0.1:${port}/json/new?about:blank`, { method: 'PUT' });
  if (!response.ok) throw new Error(`Chrome target creation failed: ${response.status}`);
  let target = await response.json();
  let socket = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => {
    socket.once('open', resolve);
    socket.once('error', reject);
  });
  let cdp = new CdpClient(socket);
  await Promise.all([
    cdp.send('Page.enable'),
    cdp.send('Runtime.enable'),
  ]);
  return cdp;
}

async function evaluate(cdp, expression, awaitPromise = true) {
  let result = await cdp.send('Runtime.evaluate', {
    expression,
    awaitPromise,
    returnByValue: true,
  }, 60_000);
  if (result.exceptionDetails) {
    throw new Error(result.exceptionDetails.exception?.description || 'Browser evaluation failed.');
  }
  return result.result?.value;
}

async function waitForPageReady(cdp) {
  await evaluate(cdp, `new Promise((resolve, reject) => {
    let started = performance.now();
    let check = () => {
      if (document.readyState === 'complete' && customElements.get('portfolio-workspace')) {
        resolve(true);
      } else if (performance.now() - started > 30000) {
        reject(new Error('Portfolio page did not become ready.'));
      } else {
        setTimeout(check, 50);
      }
    };
    check();
  })`);
}

async function captureVariant(cdp, origin, locale, viewportName, themeName) {
  let viewport = VIEWPORTS[viewportName];
  await cdp.send('Emulation.setDeviceMetricsOverride', {
    width: viewport.width,
    height: viewport.height,
    deviceScaleFactor: 1,
    mobile: viewportName === 'narrow',
  });
  await cdp.send('Page.navigate', { url: `${origin}/cv/?lang=${locale}` });
  await waitForPageReady(cdp);
  let theme = JSON.stringify(THEMES[themeName]);
  let result = await evaluate(cdp, `(async () => {
    let waitFor = async (read, label, timeoutMs = 30000) => {
      let started = performance.now();
      while (performance.now() - started < timeoutMs) {
        let value = read();
        if (value) return value;
        await new Promise((resolve) => setTimeout(resolve, 50));
      }
      throw new Error('Timed out waiting for ' + label);
    };
    let widget = await waitFor(
      () => document.querySelector('cascade-theme-widget'),
      'theme widget',
    );
    widget.setState?.(${theme}, { source: 'graph-snapshot-build' });
    await document.fonts.ready;
    let panel = await waitFor(() => document.querySelector('portfolio-graph-panel'), 'graph panel');
    let layout = await waitFor(() => panel.closest('panel-layout'), 'graph panel layout');
    if (${JSON.stringify(viewportName)} === 'narrow') {
      let rect = panel.getBoundingClientRect();
      if (rect.width < 128 || rect.height < 128) {
        let handle = layout.querySelector(
          '.layout-drawer-handle-stack-end [data-drawer-panel-id="portfolio-graph"]',
        );
        if (handle) handle.click();
        else layout.toggleDrawer?.('end');
      }
    }
    await waitFor(() => {
      let rect = panel.getBoundingClientRect();
      return rect.width >= 128 && rect.height >= 128 && panel._structuredBound && panel.canvas;
    }, 'visible bound graph');
    let capture = await panel.captureGraphRenderSnapshot();
    let content = panel.canvas.querySelector('.content');
    let paths = [...panel.canvas.querySelectorAll('svg.sn-connections .sn-conn-path')];
    return {
      ...capture,
      connectionOverlay: {
        transform: getComputedStyle(content).transform,
        paths: paths.map((path) => {
          let style = getComputedStyle(path);
          return {
            connectionId: path.getAttribute('data-conn-id') || '',
            path: path.getAttribute('d') || '',
            stroke: style.stroke,
            strokeWidth: style.strokeWidth,
            opacity: style.opacity,
          };
        }),
      },
    };
  })()`);
  if (result.snapshot?.routes?.length !== 180 || result.snapshot?.nodeRects?.length !== 119) {
    throw new Error(
      `${locale}/${viewportName}/${themeName} captured `
      + `${result.snapshot?.routes?.length || 0}/180 routes and `
      + `${result.snapshot?.nodeRects?.length || 0}/119 nodes.`,
    );
  }
  if (
    result.connectionOverlay?.paths?.length !== 180
    || !/^matrix\([^)]*\)$/.test(result.connectionOverlay.transform || '')
  ) {
    throw new Error(`${locale}/${viewportName}/${themeName} did not capture 180 PCB paths.`);
  }
  return result;
}

function renderInertSvg(capture) {
  let { width, height } = capture.rect;
  let paths = capture.connectionOverlay.paths.map((route) => (
    `<path data-conn-id="${escapeXml(route.connectionId)}" d="${escapeXml(route.path)}" `
    + `fill="none" stroke="${escapeXml(route.stroke)}" `
    + `stroke-width="${escapeXml(route.strokeWidth)}" opacity="${escapeXml(route.opacity)}"/>`
  )).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" `
    + `viewBox="0 0 ${width} ${height}" aria-hidden="true" focusable="false">`
    + `<g transform="${escapeXml(capture.connectionOverlay.transform)}">${paths}</g></svg>\n`;
}

export async function renderPortfolioGraphSnapshots() {
  await rm(OUTPUT_DIR, { force: true, recursive: true });
  await mkdir(OUTPUT_DIR, { recursive: true });
  let server = await startStaticServer();
  let chrome = await launchChrome();
  let cdp = await createPage(chrome.port);
  let entries = [];
  let uniqueSvg = new Set();
  let uniqueSnapshots = new Set();
  try {
    for (let locale of PORTFOLIO_GRAPH_SNAPSHOT_VARIANTS.locales) {
      for (let viewport of PORTFOLIO_GRAPH_SNAPSHOT_VARIANTS.viewports) {
        for (let theme of PORTFOLIO_GRAPH_SNAPSHOT_VARIANTS.themes) {
          let capture = await captureVariant(cdp, server.origin, locale, viewport, theme);
          let snapshotText = `${serializePortfolioGraphSnapshotValue(capture.snapshot)}\n`;
          let snapshotHash = sha256(snapshotText);
          let snapshotName = `${snapshotHash}.snapshot.json`;
          if (!uniqueSnapshots.has(snapshotHash)) {
            uniqueSnapshots.add(snapshotHash);
            await writeFile(path.join(OUTPUT_DIR, snapshotName), snapshotText);
          }
          let svg = renderInertSvg(capture);
          let svgHash = sha256(svg);
          let svgName = `${svgHash}.svg`;
          if (!uniqueSvg.has(svgHash)) {
            uniqueSvg.add(svgHash);
            await writeFile(path.join(OUTPUT_DIR, svgName), svg);
          }
          entries.push({
            locale,
            viewport,
            theme,
            svg: `portfolio-graph-snapshots/${svgName}`,
            snapshot: `portfolio-graph-snapshots/${snapshotName}`,
            routeFingerprint: capture.routeFingerprint,
            nodeCount: capture.snapshot.nodeRects.length,
            routeCount: capture.snapshot.routes.length,
            width: capture.rect.width,
            height: capture.rect.height,
          });
          process.stdout.write(`graph snapshot ${entries.length}/12 ${locale}/${viewport}/${theme}\n`);
        }
      }
    }
  } finally {
    cdp.close();
    await chrome.close();
    await server.close();
  }
  let manifest = {
    schema: PORTFOLIO_GRAPH_SNAPSHOT_MANIFEST_SCHEMA,
    visualLayer: 'connections-only',
    entries,
    measuredDedupe: {
      svgFiles: uniqueSvg.size,
      snapshotFiles: uniqueSnapshots.size,
      variants: entries.length,
    },
  };
  await writeFile(
    path.join(OUTPUT_DIR, 'manifest.json'),
    `${serializePortfolioGraphSnapshotValue(manifest)}\n`,
  );
  let initialEntry = entries.find((entry) => (
    entry.locale === 'ru' && entry.viewport === 'wide' && entry.theme === 'light'
  ));
  await cp(path.join(DIST_DIR, initialEntry.svg), path.join(OUTPUT_DIR, 'initial.svg'));
  return manifest;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  await renderPortfolioGraphSnapshots();
}
