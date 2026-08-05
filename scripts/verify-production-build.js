import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { gzipSync } from 'node:zlib';
import esbuild from 'esbuild';

import { PORTFOLIO_PROJECT_IDS } from '../src/static-pages/data/portfolioProjectIds.js';
import { getPublicPublications } from '../src/static-pages/data/publications.js';

export const EXECUTABLE_ASSET_ALLOWLIST = Object.freeze([
  'js/index.js',
  'js/markdown-viewer/index.js',
  'js/ForceWorker.js'
]);

export const MAIN_JS_SIZE_LIMITS = Object.freeze({
  raw: 1_600_000,
  gzip: 365_000,
});

const PORTFOLIO_LOCALES = Object.freeze(['en', 'ru', 'es']);

export function getExpectedMarkdownContentCount() {
  return (getPublicPublications().length + PORTFOLIO_PROJECT_IDS.length)
    * PORTFOLIO_LOCALES.length;
}

export function resolveScriptPath(src, htmlPath, distDir) {
  let absoluteScriptPath;
  if (src.startsWith('/cv/')) {
    absoluteScriptPath = path.resolve(distDir, src.slice('/cv/'.length));
  } else if (src.startsWith('/')) {
    absoluteScriptPath = path.resolve(distDir, src.slice(1));
  } else {
    absoluteScriptPath = path.resolve(path.dirname(htmlPath), src);
  }
  const relativeToDist = path.relative(distDir, absoluteScriptPath).replace(/\\/g, '/');
  return relativeToDist.split('?')[0];
}

export function parseHtmlAttributes(tagString) {
  const attrs = {};
  const regex = /([a-zA-Z0-9_-]+)(?:\s*=\s*(?:'([^']*)'|"([^"]*)"|([^ >\s]+)))?/g;
  let match;
  while ((match = regex.exec(tagString)) !== null) {
    const name = match[1].toLowerCase();
    const value = match[2] ?? match[3] ?? match[4] ?? '';
    attrs[name] = value;
  }
  return attrs;
}

export function verifyHtmlContent(content, htmlPath, distDir) {
  const relativePath = path.relative(distDir, htmlPath).replace(/\\/g, '/');

  let baseHref = '';
  const baseRegex = /<base\b([^>]*)>/gi;
  let baseMatch;
  while ((baseMatch = baseRegex.exec(content)) !== null) {
    const attrs = parseHtmlAttributes(baseMatch[1]);
    if (attrs.href) {
      baseHref = attrs.href;
      if (!baseHref.endsWith('/')) baseHref += '/';
    }
  }

  const scriptRegex = /<script\b([^>]*)>([\s\S]*?)<\/script>/gi;
  let scriptMatch;
  while ((scriptMatch = scriptRegex.exec(content)) !== null) {
    const attrs = parseHtmlAttributes(scriptMatch[1]);

    if (attrs.type === 'importmap') {
      throw new Error(`HTML file "${relativePath}" contains an importmap script tag.`);
    }

    if (attrs.src) {
      const src = attrs.src;
      let effectiveSrc = src;
      if (baseHref && !src.startsWith('/') && !src.startsWith('http')) {
        effectiveSrc = baseHref + src;
      }
      const cleanSrc = effectiveSrc.split('?')[0];
      if (cleanSrc.includes('jsdelivr.net') || cleanSrc.includes('unpkg.com')) {
        throw new Error(`HTML file "${relativePath}" contains CDN script src: ${src}`);
      }

      const resolvedPath = resolveScriptPath(effectiveSrc, htmlPath, distDir);
      if (!EXECUTABLE_ASSET_ALLOWLIST.includes(resolvedPath)) {
        throw new Error(`HTML file "${relativePath}" loads extra/undeclared execution asset: "${src}" (resolved: "${resolvedPath}")`);
      }
    } else {
      if (attrs.type !== 'application/json') {
        throw new Error(`HTML file "${relativePath}" contains inline executable script`);
      }
    }
  }

  const linkRegex = /<link\b([^>]*)>/gi;
  let linkMatch;
  while ((linkMatch = linkRegex.exec(content)) !== null) {
    const attrs = parseHtmlAttributes(linkMatch[1]);
    if (attrs.href && (attrs.href.includes('fonts.googleapis.com') || attrs.href.includes('fonts.gstatic.com'))) {
      throw new Error(`HTML file "${relativePath}" contains external Google Fonts references.`);
    }
  }
}

export function verifyCssContent(content, cssPath, distDir) {
  const relativePath = path.relative(distDir, cssPath).replace(/\\/g, '/');
  if (content.includes('fonts.googleapis.com') || content.includes('fonts.gstatic.com')) {
    throw new Error(`CSS file "${relativePath}" contains external Google Fonts references.`);
  }

  const importRegex = /@import\s+(?:url\()?['"]?(https?:\/\/[^'" )]+)['"]?\)?/gi;
  if (importRegex.test(content)) {
    throw new Error(`CSS file "${relativePath}" contains remote @import for http/https.`);
  }

  if (relativePath === 'js/material-symbols.css') {
    if (!content.includes('material-symbols-outlined-400.ttf')) {
      throw new Error(`CSS file "${relativePath}" is missing local font asset reference.`);
    }
    if (content.includes('@import')) {
      throw new Error(`CSS file "${relativePath}" contains forbidden @import statements.`);
    }
  }
}

export function verifyJsMetafile(metafile) {
  for (const entryPoint of Object.keys(metafile.outputs)) {
    const input = metafile.outputs[entryPoint];
    if (input.imports && input.imports.length > 0) {
      for (const imp of input.imports) {
        throw new Error(`JS file "${entryPoint}" contains import record to: "${imp.path}"`);
      }
    }
  }
}

export function measureJsBundle(content) {
  let buffer = Buffer.isBuffer(content) ? content : Buffer.from(content);
  return {
    raw: buffer.byteLength,
    gzip: gzipSync(buffer, { level: 9 }).byteLength,
  };
}

export function verifyMainBundleSize(content, limits = MAIN_JS_SIZE_LIMITS) {
  let sizes = measureJsBundle(content);
  if (sizes.raw > limits.raw) {
    throw new Error(`Main JS bundle is ${sizes.raw} bytes raw; limit is ${limits.raw}.`);
  }
  if (sizes.gzip > limits.gzip) {
    throw new Error(`Main JS bundle is ${sizes.gzip} bytes gzip; limit is ${limits.gzip}.`);
  }
  return sizes;
}

export function verifyRuntimeMarkdownAssetSeparation(mainContent, viewerContent) {
  if (!mainContent.includes('js/markdown-viewer/index.js')) {
    throw new Error('Main JS bundle is missing the runtime Markdown viewer asset URL.');
  }
  if (
    mainContent.includes('markedHighlight')
    || mainContent.includes('Markdown source is missing.')
  ) {
    throw new Error('Main JS bundle contains the Markdown renderer implementation.');
  }
  if (
    !viewerContent.includes('markedHighlight')
    || !viewerContent.includes('Markdown source is missing.')
  ) {
    throw new Error('Markdown viewer asset is missing its renderer implementation.');
  }
}

async function fileExists(filePath) {
  try {
    const stat = await fs.stat(filePath);
    return stat.isFile();
  } catch {
    return false;
  }
}

async function getAllFiles(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const res = path.resolve(dir, entry.name);
      if (entry.isDirectory()) {
        return getAllFiles(res);
      }
      return [res];
    })
  );
  return files.flat();
}

export async function runVerification(distDir) {
  const rootDir = path.resolve(fileURLToPath(new URL('..', import.meta.url)));
  if (!distDir) {
    distDir = path.join(rootDir, 'dist');
  }

  const allFiles = await getAllFiles(distDir);
  for (const filePath of allFiles) {
    const relativePath = path.relative(distDir, filePath).replace(/\\/g, '/');

    const segments = relativePath.split('/');
    const isAppRoute = relativePath.startsWith('projects/') || relativePath.startsWith('pulse/');
    const isPortfolioContent = relativePath.startsWith('content/projects/')
      || relativePath.startsWith('content/publications/');
    for (const segment of segments) {
      if (
        segment === 'node_modules'
        || segment === 'packages'
        || segment === '@symbiotejs'
        || (segment === 'symbiote-ui' && !isAppRoute && !isPortfolioContent)
      ) {
        throw new Error(`Verification failed: forbidden raw package path segment "${segment}" found in "${relativePath}".`);
      }
    }

    if (relativePath.endsWith('.js')) {
      if (!EXECUTABLE_ASSET_ALLOWLIST.includes(relativePath)) {
        throw new Error(`Verification failed: extra unreferenced JS file found: "${relativePath}".`);
      }
    }
  }

  const markdownContentFiles = allFiles.filter((filePath) => (
    path.relative(distDir, filePath).replace(/\\/g, '/').startsWith('content/')
    && filePath.endsWith('.md')
  ));
  if (markdownContentFiles.length > 0) {
    let expectedMarkdownContentCount = getExpectedMarkdownContentCount();
    if (markdownContentFiles.length !== expectedMarkdownContentCount) {
      if (markdownContentFiles.length > expectedMarkdownContentCount) {
        console.warn(
          `\n[WARNING] Found ${markdownContentFiles.length} runtime Markdown assets, `
            + `expected ${expectedMarkdownContentCount}.`,
        );
      }
      throw new Error(
        `Verification failed: expected ${expectedMarkdownContentCount} runtime Markdown assets, `
          + `found ${markdownContentFiles.length}.`,
      );
    }
    for (const filePath of markdownContentFiles) {
      const relativePath = path.relative(distDir, filePath).replace(/\\/g, '/');
      if (!/^content\/(?:projects|publications)\/[^/]+\/(?:en|ru|es)\.md$/.test(relativePath)) {
        throw new Error(`Verification failed: invalid runtime Markdown asset path "${relativePath}".`);
      }
      if (!(await fs.readFile(filePath, 'utf8')).trim()) {
        throw new Error(`Verification failed: runtime Markdown asset "${relativePath}" is empty.`);
      }
    }
  }

  const requiredFiles = [
    'index.html',
    'css/index.css',
    'js/material-symbols.css',
    'js/material-symbols-outlined-400.ttf',
    'robots.txt',
    '404.html',
    ...EXECUTABLE_ASSET_ALLOWLIST
  ];

  for (const file of requiredFiles) {
    const fullPath = path.join(distDir, file);
    if (!await fileExists(fullPath)) {
      throw new Error(`Verification failed: required file "${file}" is missing from dist.`);
    }
  }

  const mainJsContent = await fs.readFile(path.join(distDir, 'js/index.js'));
  const markdownViewerContent = await fs.readFile(
    path.join(distDir, 'js/markdown-viewer/index.js'),
    'utf8',
  );
  verifyMainBundleSize(mainJsContent);
  verifyRuntimeMarkdownAssetSeparation(mainJsContent.toString('utf8'), markdownViewerContent);

  const cssFiles = [
    'css/index.css',
    'js/material-symbols.css',
  ];
  for (const file of cssFiles) {
    const fullPath = path.join(distDir, file);
    if (await fileExists(fullPath)) {
      const content = await fs.readFile(fullPath, 'utf8');
      verifyCssContent(content, fullPath, distDir);
    }
  }

  for (const filePath of allFiles) {
    if (filePath.endsWith('.html')) {
      const content = await fs.readFile(filePath, 'utf8');
      verifyHtmlContent(content, filePath, distDir);
    }
  }

  for (const jsFile of EXECUTABLE_ASSET_ALLOWLIST) {
    const fullJsPath = path.join(distDir, jsFile);
    if (!await fileExists(fullJsPath)) continue;

    const res = await esbuild.build({
      entryPoints: [fullJsPath],
      bundle: false,
      format: 'esm',
      write: false,
      metafile: true,
      logLevel: 'silent',
    });

    verifyJsMetafile(res.metafile);
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  await runVerification();
}
