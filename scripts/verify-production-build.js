import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import esbuild from 'esbuild';

export const EXECUTABLE_ASSET_ALLOWLIST = Object.freeze([
  'js/index.js',
  'js/ForceWorker.js'
]);

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
    for (const segment of segments) {
      if (segment === 'node_modules' || segment === 'packages' || segment === '@symbiotejs' || (segment === 'symbiote-ui' && !isAppRoute)) {
        throw new Error(`Verification failed: forbidden raw package path segment "${segment}" found in "${relativePath}".`);
      }
    }

    if (relativePath.endsWith('.js')) {
      if (!EXECUTABLE_ASSET_ALLOWLIST.includes(relativePath)) {
        throw new Error(`Verification failed: extra unreferenced JS file found: "${relativePath}".`);
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
