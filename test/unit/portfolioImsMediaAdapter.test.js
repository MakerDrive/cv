import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

import { createPortfolioImsMediaAdapter } from '../../src/static-pages/js/portfolioImsMediaAdapter.js';

function createFakeElement(tagName) {
  return {
    tagName,
    attributes: {},
    attributeCalls: [],
    children: [],
    setAttribute(name, value) {
      this.attributeCalls.push({ name, value });
      this.attributes[name] = value;
    },
    getAttribute(name) {
      return this.attributes[name];
    },
    replaceChildren(...nodes) {
      this.children = nodes;
    },
  };
}

function installBrowserStubs() {
  let created = [];
  let objectUrls = { created: [], revoked: [] };
  let originalDocument = globalThis.document;
  let originalUrl = globalThis.URL;
  let originalBlob = globalThis.Blob;

  globalThis.document = {
    createElement(tagName) {
      let element = createFakeElement(tagName);
      created.push(element);
      return element;
    },
  };
  globalThis.URL = {
    createObjectURL() {
      let url = `blob:mock/${objectUrls.created.length}`;
      objectUrls.created.push(url);
      return url;
    },
    revokeObjectURL(url) {
      objectUrls.revoked.push(url);
    },
  };
  globalThis.Blob = class {
    constructor(parts, options) {
      this.parts = parts;
      this.options = options;
    }
  };

  return {
    container: createFakeElement('div'),
    created,
    objectUrls,
    teardown() {
      globalThis.document = originalDocument;
      globalThis.URL = originalUrl;
      globalThis.Blob = originalBlob;
    },
  };
}

function findByTag(elements, tagName) {
  return elements.find((element) => element.tagName === tagName);
}

test('IMS adapter module imports without browser globals', () => {
  assert.equal(typeof document, 'undefined');
  assert.equal(typeof createPortfolioImsMediaAdapter, 'function');
});

test('IMS adapter mounts a viewer from inline activation data', async () => {
  let env = installBrowserStubs();
  try {
    let loaded = 0;
    let adapter = createPortfolioImsMediaAdapter({
      loadViewer: async () => {
        loaded += 1;
      },
    });
    let state = adapter.mount(env.container, {
      kind: 'spinner',
      alt: 'Inline media',
      activation: { provider: 'ims', data: { imsType: 'spinner' } },
    });
    await state.ready;

    let viewer = findByTag(env.created, 'ims-viewer');
    assert.equal(loaded, 1);
    assert.ok(viewer);
    assert.equal(viewer.getAttribute('aria-label'), 'Inline media');
    assert.equal(env.container.children[0], viewer);
    assert.equal(state.error, null);
    assert.equal(env.objectUrls.created.length, 1);
  } finally {
    env.teardown();
  }
});

test('IMS adapter fetches remote srcData and mounts the viewer', async () => {
  let env = installBrowserStubs();
  try {
    let requested = [];
    let loaded = 0;
    let adapter = createPortfolioImsMediaAdapter({
      loadViewer: async () => {
        loaded += 1;
      },
      fetchImpl: async (url) => {
        requested.push(url);
        return { ok: true, status: 200, json: async () => ({ imsType: 'gallery' }) };
      },
    });
    let state = adapter.mount(env.container, {
      kind: 'gallery',
      alt: 'Remote media',
      activation: {
        provider: 'ims',
        srcData: 'https://rnd-pro.com/ims-data/example.json',
        fallbackUrl: 'https://rnd-pro.com/projects/agent-portal/',
      },
    });
    await state.ready;

    assert.deepEqual(requested, ['https://rnd-pro.com/ims-data/example.json']);
    assert.equal(loaded, 1);
    assert.ok(findByTag(env.created, 'ims-viewer'));
    assert.equal(state.error, null);
  } finally {
    env.teardown();
  }
});

test('IMS adapter falls back to the poster when srcData request is not ok', async () => {
  let env = installBrowserStubs();
  try {
    let loaded = 0;
    let adapter = createPortfolioImsMediaAdapter({
      loadViewer: async () => {
        loaded += 1;
      },
      fetchImpl: async () => ({ ok: false, status: 503 }),
    });
    let state = adapter.mount(env.container, {
      kind: 'gallery',
      alt: 'Remote media',
      poster: 'https://rnd-pro.com/idn/example/640',
      activation: {
        provider: 'ims',
        srcData: 'https://rnd-pro.com/ims-data/example.json',
        fallbackUrl: 'https://rnd-pro.com/projects/agent-portal/',
      },
    });
    await state.ready;

    assert.equal(loaded, 0);
    assert.equal(findByTag(env.created, 'ims-viewer'), undefined);
    assert.match(state.error, /IMS media source unavailable/);
    let img = findByTag(env.created, 'img');
    let link = findByTag(env.created, 'a');
    assert.equal(img.src, 'https://rnd-pro.com/idn/example/640');
    assert.equal(link.href, 'https://rnd-pro.com/projects/agent-portal/');
  } finally {
    env.teardown();
  }
});

test('IMS adapter rejects a remote srcData payload that is not an object', async () => {
  let env = installBrowserStubs();
  try {
    let adapter = createPortfolioImsMediaAdapter({
      loadViewer: async () => {},
      fetchImpl: async () => ({ ok: true, status: 200, json: async () => null }),
    });
    let state = adapter.mount(env.container, {
      kind: 'gallery',
      alt: 'Invalid remote media',
      poster: 'https://rnd-pro.com/idn/example/640',
      activation: {
        provider: 'ims',
        srcData: 'https://rnd-pro.com/ims-data/invalid.json',
      },
    });
    await state.ready;

    assert.match(state.error, /srcData response is not an object/);
    assert.equal(findByTag(env.created, 'ims-viewer'), undefined);
    assert.ok(findByTag(env.created, 'img'));
    assert.equal(env.objectUrls.created.length, 0);
  } finally {
    env.teardown();
  }
});

test('IMS adapter falls back with an error when no source is provided', async () => {
  let env = installBrowserStubs();
  try {
    let loaded = 0;
    let adapter = createPortfolioImsMediaAdapter({
      loadViewer: async () => {
        loaded += 1;
      },
    });
    let state = adapter.mount(env.container, {
      kind: 'spinner',
      alt: 'No source',
      poster: 'https://rnd-pro.com/idn/example/640',
      activation: { provider: 'ims' },
    });
    await state.ready;

    assert.equal(loaded, 0);
    assert.equal(findByTag(env.created, 'ims-viewer'), undefined);
    assert.match(state.error, /IMS media source unavailable/);
    assert.ok(findByTag(env.created, 'img'));
    assert.equal(env.objectUrls.created.length, 0);
  } finally {
    env.teardown();
  }
});

test('IMS adapter does not mount after unmount and revokes the object URL', async () => {
  let env = installBrowserStubs();
  try {
    let releaseViewer;
    let adapter = createPortfolioImsMediaAdapter({
      loadViewer: () => new Promise((resolve) => {
        releaseViewer = resolve;
      }),
    });
    let state = adapter.mount(env.container, {
      kind: 'spinner',
      alt: 'Cancelled media',
      activation: { provider: 'ims', data: { imsType: 'spinner' } },
    });
    await Promise.resolve();
    adapter.unmount(env.container, state);
    releaseViewer();
    await state.ready;

    assert.equal(state.cancelled, true);
    assert.equal(findByTag(env.created, 'ims-viewer'), undefined);
    assert.equal(env.container.children.length, 0);
    assert.deepEqual(env.objectUrls.revoked, env.objectUrls.created);
    assert.equal(env.objectUrls.created.length, 1);
  } finally {
    env.teardown();
  }
});

test('IMS adapter revokes the mounted object URL on unmount', async () => {
  let env = installBrowserStubs();
  try {
    let adapter = createPortfolioImsMediaAdapter({
      loadViewer: async () => {},
    });
    let state = adapter.mount(env.container, {
      kind: 'spinner',
      alt: 'Media',
      activation: { provider: 'ims', data: { imsType: 'spinner' } },
    });
    await state.ready;
    let mountedUrl = state.srcData;
    adapter.unmount(env.container, state);

    assert.ok(mountedUrl);
    assert.deepEqual(env.objectUrls.revoked, [mountedUrl]);
    assert.equal(env.container.children.length, 0);
  } finally {
    env.teardown();
  }
});

test('IMS adapter delegates widget loading to the public viewer entry', async () => {
  let source = await readFile(
    new URL('../../src/static-pages/js/portfolioImsMediaAdapter.js', import.meta.url),
    'utf8'
  );

  assert.match(source, /import\('immersive-media-spots\/viewer'\)/);
  assert.doesNotMatch(source, /import\('immersive-media-spots\/(?:spinner|gallery|pano|diff)'\)/);
  assert.doesNotMatch(source, /IMS_WIDGET_LOADERS/);
  assert.match(source, /document\.createElement\('ims-viewer'\)/);
  assert.doesNotMatch(source, /document\.createElement\('ims-(?:spinner|gallery|pano|diff)'\)/);
});

test('IMS adapter forwards only autoplay through cast-next when enabled', async () => {
  let env = installBrowserStubs();
  try {
    let adapter = createPortfolioImsMediaAdapter({
      loadViewer: async () => {},
    });
    let state = adapter.mount(env.container, {
      kind: 'spinner',
      alt: 'Autoplay media',
      activation: { provider: 'ims', data: { imsType: 'spinner' }, autoplay: true },
    });
    await state.ready;

    let viewer = findByTag(env.created, 'ims-viewer');
    assert.ok(viewer);

    assert.deepEqual(viewer.attributeCalls, [
      { name: 'src-data', value: state.srcData },
      { name: 'aria-label', value: 'Autoplay media' },
      { name: 'cast-next', value: '' },
      { name: 'autoplay', value: 'true' },
    ]);
  } finally {
    env.teardown();
  }
});

test('IMS adapter does not enable forwarding when autoplay is absent', async () => {
  let env = installBrowserStubs();
  try {
    let adapter = createPortfolioImsMediaAdapter({
      loadViewer: async () => {},
    });
    let state = adapter.mount(env.container, {
      kind: 'spinner',
      alt: 'Regular media',
      activation: { provider: 'ims', data: { imsType: 'spinner' } },
    });
    await state.ready;

    let viewer = findByTag(env.created, 'ims-viewer');
    assert.ok(viewer);

    assert.deepEqual(viewer.attributeCalls, [
      { name: 'src-data', value: state.srcData },
      { name: 'aria-label', value: 'Regular media' },
    ]);
  } finally {
    env.teardown();
  }
});
