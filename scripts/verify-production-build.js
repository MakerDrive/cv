import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { gzipSync } from 'node:zlib';
import esbuild from 'esbuild';
import sharp from 'sharp';

import { PORTFOLIO_PROJECT_IDS } from '../src/static-pages/data/portfolioProjectIds.js';
import { getPublicPublications } from '../src/static-pages/data/publications.js';
import { createSocialCardManifest } from './social-card-manifest.js';
import {
  PORTFOLIO_GRAPH_SNAPSHOT_VARIANTS,
  selectPortfolioGraphSnapshotEntry,
  validatePortfolioGraphSnapshotBinding,
  validatePortfolioGraphSnapshotManifest,
} from '../src/static-pages/data/portfolioGraphSnapshot.js';
import { CV_SHOW_AUDIO_RELEASE } from '../src/static-pages/data/cvShowPresentationProject.js';
import { CV_SHOW_WEB_AUDIO_RELEASE } from '../src/static-pages/data/cvShowWebAudioRelease.js';
import { verifyCvShowWebAudio } from './verify-cv-show-web-audio.js';

export const EXECUTABLE_ASSET_ALLOWLIST = Object.freeze([
  'js/index.js',
  'js/markdown-viewer/index.js',
  'js/tour-player/index.js',
  'js/ForceWorker.js'
]);

export const MAIN_JS_SIZE_LIMITS = Object.freeze({
  raw: 1_765_000,
  gzip: 430_000,
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

function getMetaContent(content, attributeName, attributeValue) {
  let metaRegex = /<meta\b([^>]*)>/gi;
  let metaMatch;
  while ((metaMatch = metaRegex.exec(content)) !== null) {
    let attrs = parseHtmlAttributes(metaMatch[1]);
    if (attrs[attributeName] === attributeValue) return attrs.content;
  }
  return undefined;
}

export function verifyPortfolioSocialMetadata(content, htmlPath, distDir) {
  let relativePath = path.relative(distDir, htmlPath).replace(/\\/g, '/');
  let isArticleOrProject = /^(?:projects\/[^/]+|pulse\/[^/]+|projects\/[^/]+\/pulse\/[^/]+)\/index\.html$/.test(
    relativePath,
  );
  if (!isArticleOrProject) return false;
  let robots = getMetaContent(content, 'name', 'robots') || '';
  if (robots.split(',').some((value) => value.trim() === 'noindex')) return false;

  let openGraphImage = getMetaContent(content, 'property', 'og:image');
  let twitterImage = getMetaContent(content, 'name', 'twitter:image');
  if (!openGraphImage || openGraphImage !== twitterImage) {
    throw new Error(
      `HTML file "${relativePath}" must expose the same og:image and twitter:image.`,
    );
  }
  if (
    getMetaContent(content, 'property', 'og:image:width') !== '1200'
    || getMetaContent(content, 'property', 'og:image:height') !== '630'
  ) {
    throw new Error(`HTML file "${relativePath}" must declare a 1200x630 social image.`);
  }
  return true;
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

export function verifyRuntimeTourAssetSeparation(mainContent, tourContent) {
  if (!mainContent.includes('js/tour-player/index.js')) {
    throw new Error('Main JS bundle is missing the runtime tour player asset URL.');
  }
  if (mainContent.includes('portfolio-show-phase')) {
    throw new Error('Main JS bundle contains the CV Show implementation.');
  }
  if (!tourContent.includes('portfolio-show-phase') || !tourContent.includes('portfolio-show-start')) {
    throw new Error('CV Show asset is missing its lifecycle implementation.');
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

function cvShowReleaseRelativeRoot(selector) {
  let manifestPath = String(selector?.manifest?.path || '');
  let expected = `${selector?.voiceId}/${selector?.revision}/manifest.json`;
  if (
    manifestPath !== expected
    || path.posix.normalize(manifestPath) !== manifestPath
    || manifestPath.includes('\\')
  ) {
    throw new Error('Verification failed: invalid selected CV Show web-audio manifest path.');
  }
  return path.posix.dirname(manifestPath);
}

function relativeInventory(root, files) {
  return files.map((file) => path.relative(root, file).replace(/\\/g, '/')).sort();
}

export function verifyNoPublicWavArtifacts(allFiles, distDir) {
  for (let filePath of allFiles) {
    let relativePath = path.relative(distDir, filePath).replace(/\\/g, '/');
    let segments = relativePath.toLowerCase().split('/');
    if (relativePath.toLowerCase().endsWith('.wav')) {
      throw new Error(`Verification failed: forbidden WAV asset found in "${relativePath}".`);
    }
    if (segments.includes('cv-show-audio-private')) {
      throw new Error(
        `Verification failed: forbidden private CV Show audio path found in "${relativePath}".`,
      );
    }
  }
}

export function verifyCvShowWebAudioMasterCompatibility({
  selector,
  manifest,
  release = CV_SHOW_AUDIO_RELEASE,
} = {}) {
  let source = manifest?.source;
  if (
    selector?.releaseId !== manifest?.releaseId
    || selector?.sourceMasterReleaseId !== source?.masterReleaseId
    || selector?.voiceId !== manifest?.voiceId
    || selector?.locale !== manifest?.locale
    || selector?.revision !== manifest?.revision
    || manifest?.voiceId !== release?.manifests?.voice
    || manifest?.locale !== release?.manifests?.locale
    || source?.masterArtifactTreeHash !== release?.artifactTreeHash
    || source?.audioManifestSha256 !== release?.manifests?.audio?.sha256
    || source?.alignmentManifestSha256 !== release?.manifests?.alignment?.sha256
    || source?.voiceIdentityHash !== release?.acceptedProvenance?.voiceIdentityHash
  ) {
    throw new Error(
      'Verification failed: selected CV Show web audio is not artifact-equivalent to the current private master release.',
    );
  }
  return true;
}

export async function verifyCvShowWebAudioPublication({
  rootDir = path.resolve(fileURLToPath(new URL('..', import.meta.url))),
  distDir = path.join(rootDir, 'dist'),
  selector = CV_SHOW_WEB_AUDIO_RELEASE,
} = {}) {
  if (
    selector?.voiceId !== CV_SHOW_AUDIO_RELEASE.manifests.voice
    || selector?.locale !== CV_SHOW_AUDIO_RELEASE.manifests.locale
  ) {
    throw new Error(
      'Verification failed: selected CV Show web audio does not match the current voice and locale.',
    );
  }
  let releaseRelativeRoot = cvShowReleaseRelativeRoot(selector);
  let sourceBase = path.join(rootDir, 'src/static-pages/copy-cv-show-audio');
  let distBase = path.join(distDir, 'cv-show-audio');
  let sourceRoot = path.join(sourceBase, releaseRelativeRoot);
  let distRoot = path.join(distBase, releaseRelativeRoot);
  let [sourceFiles, distFiles] = await Promise.all([
    getAllFiles(sourceBase),
    getAllFiles(distBase),
  ]);
  let sourceInventory = relativeInventory(sourceBase, sourceFiles);
  let distInventory = relativeInventory(distBase, distFiles);
  let expectedPrefix = `${releaseRelativeRoot}/`;
  let sourceUnexpected = sourceInventory.filter((file) => !file.startsWith(expectedPrefix));
  let distUnexpected = distInventory.filter((file) => !file.startsWith(expectedPrefix));
  if (
    sourceInventory.length !== 61
    || distInventory.length !== 61
    || sourceUnexpected.length > 0
    || distUnexpected.length > 0
    || JSON.stringify(sourceInventory) !== JSON.stringify(distInventory)
  ) {
    throw new Error(
      'Verification failed: public CV Show audio tree contains unexpected files or differs from source.',
    );
  }
  let [sourceResult, distResult] = await Promise.all([
    verifyCvShowWebAudio({ root: sourceRoot, selector, verifyMedia: false }),
    verifyCvShowWebAudio({ root: distRoot, selector, verifyMedia: false }),
  ]);
  let sourceManifest = JSON.parse(await fs.readFile(path.join(sourceRoot, 'manifest.json'), 'utf8'));
  verifyCvShowWebAudioMasterCompatibility({ selector, manifest: sourceManifest });
  if (
    sourceResult.treeInventorySha256 !== distResult.treeInventorySha256
    || sourceResult.manifestSha256 !== distResult.manifestSha256
    || sourceResult.manifestBytes !== distResult.manifestBytes
    || sourceResult.totalDeliveryBytes !== distResult.totalDeliveryBytes
  ) {
    throw new Error(
      'Verification failed: copied CV Show web-audio bytes differ from the tracked source release.',
    );
  }
  return Object.freeze({
    releaseId: distResult.releaseId,
    revision: distResult.revision,
    files: distResult.files,
    clips: distResult.clips,
    alignedSequences: distResult.alignedSequences,
    mediaProbed: distResult.mediaProbed,
  });
}

export async function verifyPortfolioGraphSnapshots(distDir) {
  let snapshotDir = path.join(distDir, 'portfolio-graph-snapshots');
  let manifestPath = path.join(snapshotDir, 'manifest.json');
  if (!await fileExists(manifestPath)) {
    throw new Error('Portfolio graph snapshot manifest is missing.');
  }
  let manifest = JSON.parse(await fs.readFile(manifestPath, 'utf8'));
  let validation = validatePortfolioGraphSnapshotManifest(manifest);
  if (!validation.valid) {
    throw new Error(`Portfolio graph snapshot manifest is invalid: ${validation.reason}.`);
  }
  let expectedCount = PORTFOLIO_GRAPH_SNAPSHOT_VARIANTS.locales.length
    * PORTFOLIO_GRAPH_SNAPSHOT_VARIANTS.themes.length
    * PORTFOLIO_GRAPH_SNAPSHOT_VARIANTS.viewports.length;
  if (validation.manifest.entries.length !== expectedCount) {
    throw new Error(`Portfolio graph snapshot manifest must contain ${expectedCount} variants.`);
  }
  let referencedFiles = new Set(['initial.svg', 'manifest.json']);
  for (let locale of PORTFOLIO_GRAPH_SNAPSHOT_VARIANTS.locales) {
    for (let viewport of PORTFOLIO_GRAPH_SNAPSHOT_VARIANTS.viewports) {
      for (let theme of PORTFOLIO_GRAPH_SNAPSHOT_VARIANTS.themes) {
        let entry = selectPortfolioGraphSnapshotEntry(validation.manifest, {
          locale,
          viewport,
          theme,
        });
        if (!entry) throw new Error(`Portfolio graph snapshot variant is missing: ${locale}/${viewport}/${theme}.`);
        let svgName = path.basename(entry.svg);
        let snapshotName = path.basename(entry.snapshot);
        referencedFiles.add(svgName);
        referencedFiles.add(snapshotName);
        let svg = await fs.readFile(path.join(snapshotDir, svgName), 'utf8');
        let pathCount = svg.match(/<path\b[^>]*\bdata-conn-id=/g)?.length || 0;
        if (
          /<script\b|<foreignObject\b|\son[a-z]+\s*=|(?:href|src)\s*=\s*["']https?:/i.test(svg)
          || /<image\b|<text\b/i.test(svg)
          || !/<svg\b[^>]*aria-hidden="true"/i.test(svg)
          || pathCount !== 180
        ) {
          throw new Error(`Portfolio graph connections-only SVG is invalid: ${svgName}.`);
        }
        let snapshot = JSON.parse(await fs.readFile(path.join(snapshotDir, snapshotName), 'utf8'));
        let binding = validatePortfolioGraphSnapshotBinding(snapshot, entry.routeFingerprint);
        if (!binding.valid) {
          throw new Error(`Portfolio graph route snapshot is invalid: ${snapshotName}: ${binding.reason}.`);
        }
        if (binding.snapshot.nodeRects.length !== 119 || binding.snapshot.routes.length !== 180) {
          throw new Error(`Portfolio graph route snapshot must contain 119 nodes and 180 routes: ${snapshotName}.`);
        }
      }
    }
  }
  let initialEntry = selectPortfolioGraphSnapshotEntry(validation.manifest, {
    locale: 'ru',
    viewport: 'wide',
    theme: 'light',
  });
  let initialSvg = await fs.readFile(path.join(snapshotDir, 'initial.svg'));
  let expectedInitialSvg = await fs.readFile(path.join(distDir, initialEntry.svg));
  if (!initialSvg.equals(expectedInitialSvg)) {
    throw new Error('Portfolio graph initial snapshot must be the RU wide/light variant.');
  }
  let snapshotFiles = await fs.readdir(snapshotDir);
  let unreferenced = snapshotFiles.filter((file) => !referencedFiles.has(file));
  if (unreferenced.length > 0) {
    throw new Error(`Portfolio graph snapshot directory contains unreferenced files: ${unreferenced.join(', ')}.`);
  }
}

export async function runVerification(distDir) {
  const rootDir = path.resolve(fileURLToPath(new URL('..', import.meta.url)));
  if (!distDir) {
    distDir = path.join(rootDir, 'dist');
  }

  const allFiles = await getAllFiles(distDir);
  verifyNoPublicWavArtifacts(allFiles, distDir);
  await verifyCvShowWebAudioPublication({ rootDir, distDir });
  let rootIndexPath = path.join(distDir, 'index.html');
  if (await fileExists(rootIndexPath)) {
    let rootIndex = await fs.readFile(rootIndexPath, 'utf8');
    if (rootIndex.includes('id="pulse-projects-data"')) {
      await verifyPortfolioGraphSnapshots(distDir);
    }
  }
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
  const tourPlayerContent = await fs.readFile(
    path.join(distDir, 'js/tour-player/index.js'),
    'utf8',
  );
  verifyMainBundleSize(mainJsContent);
  verifyRuntimeMarkdownAssetSeparation(mainJsContent.toString('utf8'), markdownViewerContent);
  verifyRuntimeTourAssetSeparation(mainJsContent.toString('utf8'), tourPlayerContent);
  if (
    mainJsContent.includes('cv-show-audio-private')
    || tourPlayerContent.includes('cv-show-audio-private')
  ) {
    throw new Error('Production bundles contain the obsolete private CV Show audio path.');
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

  let publicPortfolioPageCount = 0;
  for (const filePath of allFiles) {
    if (filePath.endsWith('.html')) {
      const content = await fs.readFile(filePath, 'utf8');
      verifyHtmlContent(content, filePath, distDir);
      if (verifyPortfolioSocialMetadata(content, filePath, distDir)) {
        publicPortfolioPageCount++;
      }
    }
  }

  if (publicPortfolioPageCount > 0) {
    let socialCardManifest = createSocialCardManifest();
    if (publicPortfolioPageCount !== socialCardManifest.length) {
      throw new Error(
        `Verification failed: expected ${socialCardManifest.length} public portfolio pages with `
          + `social metadata, found ${publicPortfolioPageCount}.`,
      );
    }
    for (let card of socialCardManifest) {
      let cardPath = path.join(distDir, 'social-cards', card.fileName);
      if (!await fileExists(cardPath)) {
        throw new Error(`Verification failed: social card "${card.fileName}" is missing from dist.`);
      }
      let metadata = await sharp(cardPath).metadata();
      if (metadata.width !== 1200 || metadata.height !== 630 || metadata.format !== 'png') {
        throw new Error(
          `Verification failed: social card "${card.fileName}" must be a 1200x630 PNG.`,
        );
      }
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
