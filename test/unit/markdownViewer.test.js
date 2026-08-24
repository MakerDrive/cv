import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

import { getPage } from '../../src/static-pages/getPage.js';
import { getPortfolioPage } from '../../src/static-pages/portfolioPage.js';
import { PUBLICATIONS } from '../../src/static-pages/data/publications.js';
import {
  createPortfolioMarkdownLoader,
  normalizePortfolioMarkdownBody,
} from '../../src/static-pages/js/portfolioMarkdownContent.js';
import { createRuntimeAssetUrl } from '../../src/static-pages/js/runtimeAssetUrl.js';

test('Markdown pages keep their source out of the generated HTML', async () => {
  let page = await getPage({
    BASE_PATH: './',
    TITLE: 'Remote document',
    HEADER_CONTENT: 'Remote document',
    MD_URL: 'https://example.com/document.md',
  });

  assert.match(page, /<markdown-viewer src="https:\/\/example\.com\/document\.md"><\/markdown-viewer>/);
  assert.doesNotMatch(page, /Unable to load|document body/);
});

test('the static client loads Markdown rendering only when a viewer exists', async () => {
  let source = await readFile(new URL('../../src/static-pages/js/index.js', import.meta.url), 'utf8');
  let entrySource = await readFile(
    new URL('../../src/static-pages/js/markdown-viewer/index.js', import.meta.url),
    'utf8',
  );
  let viewerSource = await readFile(
    new URL('../../src/ui-components/universal/markdown-viewer/markdown-viewer.js', import.meta.url),
    'utf8',
  );

  assert.match(source, /createRuntimeAssetUrl\('js\/markdown-viewer\/index\.js'\)/);
  assert.match(source, /import\(moduleUrl\.href\)/);
  assert.doesNotMatch(source, /ui-components\/universal\/markdown-viewer/);
  assert.match(entrySource, /ui-components\/universal\/markdown-viewer\/markdown-viewer\.js/);
  assert.match(viewerSource, /await import\('jsda-kit\/iso\/md2html\.js'\)/);
});

test('runtime asset URLs honor the document base and inherit the main bundle version', () => {
  assert.equal(
    createRuntimeAssetUrl('js/markdown-viewer/index.js', {
      baseUrl: 'https://makerdrive.github.io/cv/',
      moduleUrl: 'https://makerdrive.github.io/cv/js/index.js?v=06029b087b5d',
    }).href,
    'https://makerdrive.github.io/cv/js/markdown-viewer/index.js?v=06029b087b5d',
  );

  assert.equal(
    createRuntimeAssetUrl('js/markdown-viewer/index.js', {
      baseUrl: 'http://127.0.0.1:3000/cv/',
      moduleUrl: 'http://127.0.0.1:3000/cv/js/index.js',
    }).href,
    'http://127.0.0.1:3000/cv/js/markdown-viewer/index.js',
  );
});

test('portfolio HTML contains content paths but not project or publication bodies', async () => {
  let page = await getPortfolioPage();

  assert.match(page, /content\/projects\/agent-portal\/en\.md/);
  assert.doesNotMatch(page, /resource-aware agent development/);
  assert.ok(PUBLICATIONS.every((publication) => (
    Object.values(publication.locales).every((locale) => !Object.hasOwn(locale, 'body'))
  )));
});

test('portfolio Markdown normalization removes source metadata and a duplicate title', () => {
  assert.equal(
    normalizePortfolioMarkdownBody('---\ntitle: Demo\n---\n# Demo\n\nBody\n'),
    'Body',
  );
  assert.equal(normalizePortfolioMarkdownBody('## Body\n\nText'), '## Body\n\nText');
});

test('portfolio Markdown loader caches successful bodies and forwards abort signals', async () => {
  let requests = [];
  let loader = createPortfolioMarkdownLoader({
    async fetchImpl(path, options) {
      requests.push({ path, signal: options?.signal });
      return new Response('# Title\n\nLoaded body');
    },
  });
  let controller = new AbortController();

  assert.equal(
    await loader.load('content/projects/demo/en.md', { signal: controller.signal }),
    'Loaded body',
  );
  assert.equal(await loader.load('content/projects/demo/en.md'), 'Loaded body');
  assert.equal(requests.length, 1);
  assert.equal(requests[0].signal, controller.signal);
});

test('portfolio Markdown loader does not cache failed requests', async () => {
  let requests = 0;
  let loader = createPortfolioMarkdownLoader({
    async fetchImpl() {
      requests += 1;
      return new Response('', { status: requests === 1 ? 503 : 200 });
    },
  });

  await assert.rejects(loader.load('content/publications/demo/en.md'), /503/);
  assert.equal(await loader.load('content/publications/demo/en.md'), '');
  assert.equal(requests, 2);
});
