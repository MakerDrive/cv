import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

import { createPortfolioImsMediaAdapter } from '../../src/static-pages/js/portfolioImsMediaAdapter.js';
import {
  createImsShowMediaTarget,
  waitForImsPublicPlayer,
} from '../../src/static-pages/js/tour-player/imsShowMediaAdapter.js';

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

function listenerRoot(querySelector) {
  const listeners = new Map();
  return {
    querySelector,
    addEventListener(type, listener) {
      if (!listeners.has(type)) listeners.set(type, new Set());
      listeners.get(type).add(listener);
    },
    removeEventListener(type, listener) {
      listeners.get(type)?.delete(listener);
    },
    dispatch(type, target) {
      for (const listener of [...(listeners.get(type) || [])]) {
        listener({ type, target });
      }
    },
  };
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

test('IMS Show gallery maps authored frames 1 through 5 to public zero-based goTo calls', async () => {
  const events = [];
  let releaseHold;
  const hold = new Promise((resolve) => { releaseHold = resolve; });
  const gallery = {
    localName: 'ims-gallery',
    goTo(index) {
      events.push(['goTo', index]);
    },
  };
  const viewer = { localName: 'ims-viewer' };
  const target = createImsShowMediaTarget(viewer, {
    resolvePlayer: async () => gallery,
    clock: {
      wait: async (durationMs, { signal }) => {
        assert.equal(signal.aborted, false);
        events.push(['wait', durationMs]);
        await hold;
      },
    },
  });

  const result = await Promise.race([
    target.playShowMedia({
      frames: [1, 2, 3, 4, 5],
      frameHoldMs: 600,
      finalFrame: 5,
    }, { signal: new AbortController().signal }),
    new Promise((_, reject) => setTimeout(() => reject(
      new Error('gallery choreography blocked its start receipt'),
    ), 50)),
  ]);

  assert.equal(result.running, true);
  assert.equal(typeof result.completion?.then, 'function');
  assert.deepEqual(events, [['goTo', 0], ['wait', 600]]);

  releaseHold();
  await result.completion;

  assert.deepEqual(events, [
    ['goTo', 0], ['wait', 600],
    ['goTo', 1], ['wait', 600],
    ['goTo', 2], ['wait', 600],
    ['goTo', 3], ['wait', 600],
    ['goTo', 4], ['wait', 600],
  ]);
  assert.deepEqual(result.frames, [1, 2, 3, 4, 5]);
  assert.equal(result.finalFrame, 5);
});

test('IMS Show gallery honors the authored frame hold exactly', async () => {
  const waits = [];
  const gallery = {
    localName: 'ims-gallery',
    goTo() {},
  };
  const target = createImsShowMediaTarget({ localName: 'ims-viewer' }, {
    resolvePlayer: async () => gallery,
    clock: {
      wait: async (durationMs) => {
        waits.push(durationMs);
      },
    },
  });

  const result = await target.playShowMedia({
    frames: [1, 2],
    frameHoldMs: 250,
    finalFrame: 2,
  }, { signal: new AbortController().signal });
  await result.completion;

  assert.deepEqual(waits, [250, 250]);
  assert.equal(result.frameHoldMs, 250);
});

test('IMS Show target prewarms one public player and reuses it for capture and playback', async () => {
  let resolutions = 0;
  const gallery = {
    localName: 'ims-gallery',
    hotspotState: { image: 0 },
    goTo() {},
  };
  const target = createImsShowMediaTarget({ localName: 'ims-viewer' }, {
    resolvePlayer: async () => {
      resolutions += 1;
      return gallery;
    },
    clock: { wait: async () => {} },
  });

  assert.deepEqual(await target.prepareShowMedia(), {
    kind: 'ims-gallery',
    ready: true,
  });
  await target.captureShowMediaState();
  const started = await target.playShowMedia({
    frames: [1, 2, 3, 4, 5],
    frameHoldMs: 0,
    finalFrame: 5,
  });
  await started.completion;

  assert.equal(resolutions, 1);
});

test('IMS Show target explicitly activates a lazy media host before resolving its player', async () => {
  const calls = [];
  const gallery = {
    localName: 'ims-gallery',
    hotspotState: { image: 0 },
    goTo(index) { calls.push(['goTo', index]); },
  };
  const host = {
    localName: 'sn-media-host',
    activate() { calls.push('activate'); },
  };
  const target = createImsShowMediaTarget(host, {
    resolvePlayer: async (root) => {
      assert.equal(root, host);
      assert.deepEqual(calls, ['activate']);
      return gallery;
    },
    clock: { wait: async () => {} },
  });

  await target.prepareShowMedia();
  const started = await target.playShowMedia({ frames: [1], finalFrame: 1 });
  await started.completion;
  await target.captureShowMediaState();

  assert.deepEqual(calls, ['activate', ['goTo', 0]]);
});

test('IMS Show gallery prefers documented hotspotState, enforces finalFrame, and restores it', async () => {
  const calls = [];
  const gallery = {
    localName: 'ims-gallery',
    hotspotState: { image: 3 },
    goTo(index) {
      this.hotspotState.image = index;
      calls.push(index);
    },
  };
  const target = createImsShowMediaTarget({ localName: 'ims-viewer' }, {
    resolvePlayer: async () => gallery,
    clock: { wait: async () => {} },
  });
  const initial = await target.captureShowMediaState();

  const started = await target.playShowMedia({
    frames: [1],
    frameHoldMs: 0,
    finalFrame: 5,
  });
  await started.completion;
  assert.deepEqual(calls, [0, 4]);

  await target.restoreShowMediaState(initial);
  assert.deepEqual(calls, [0, 4, 3]);
});

test('IMS Show gallery never reads the private dollar-state fallback', async () => {
  const gallery = {
    localName: 'ims-gallery',
    hotspotState: {},
    get $() {
      throw new Error('private state must not be read');
    },
  };
  const target = createImsShowMediaTarget({ localName: 'ims-viewer' }, {
    resolvePlayer: async () => gallery,
  });

  assert.deepEqual(await target.captureShowMediaState(), {
    kind: 'ims-gallery',
    frame: 1,
  });

  const source = await readFile(
    new URL('../../src/static-pages/js/tour-player/imsShowMediaAdapter.js', import.meta.url),
    'utf8',
  );
  assert.doesNotMatch(source, /player\.\$/);
});

test('IMS Show target rejects spinner playback even through an injected resolver', async () => {
  const spinner = {
    localName: 'ims-spinner',
    currentFrame: 3,
    play() { throw new Error('spinner playback must remain unreachable'); },
    pause() { throw new Error('spinner pause must remain unreachable'); },
  };
  const target = createImsShowMediaTarget({ localName: 'ims-viewer' }, {
    resolvePlayer: async () => spinner,
  });

  await assert.rejects(
    target.captureShowMediaState(),
    error => error.code === 'ims-player-unsupported',
  );
  await assert.rejects(
    target.playShowMedia({ mode: 'short-inline-continuous' }),
    error => error.code === 'ims-player-unsupported',
  );
});

test('IMS public player resolution observes mounted children and honors abort', async () => {
  let child = null;
  let observerCallback;
  let disconnectCount = 0;
  class MutationObserverStub {
    constructor(callback) {
      observerCallback = callback;
    }
    observe() {}
    disconnect() {
      disconnectCount += 1;
    }
  }
  const viewer = listenerRoot(() => child);
  const pending = waitForImsPublicPlayer(viewer, {
    MutationObserverImpl: MutationObserverStub,
  });
  let settled = false;
  pending.then(() => { settled = true; });
  child = { localName: 'ims-gallery' };
  observerCallback();
  await Promise.resolve();
  assert.equal(settled, false, 'child insertion is not readiness');
  viewer.dispatch('ims-ready', child);
  assert.equal(await pending, child);
  assert.equal(disconnectCount, 1);

  const controller = new AbortController();
  const aborted = waitForImsPublicPlayer(listenerRoot(() => null), {
    signal: controller.signal,
    MutationObserverImpl: MutationObserverStub,
  });
  controller.abort(Object.assign(new Error('replaced'), { name: 'AbortError' }));
  await assert.rejects(aborted, error => error === controller.signal.reason);
  assert.equal(disconnectCount, 2);
});

test('IMS public player resolution waits through delayed viewer mount and captures a raced ready event', async () => {
  let viewer = null;
  let player = null;
  let observerCallback;
  let listenerWasAttached = false;
  class MutationObserverStub {
    constructor(callback) { observerCallback = callback; }
    observe() {}
    disconnect() {}
  }
  const host = listenerRoot(selector => selector === 'ims-viewer' ? viewer : null);
  const originalAddEventListener = host.addEventListener;
  host.addEventListener = function addEventListener(type, listener) {
    if (type === 'ims-ready') listenerWasAttached = true;
    return originalAddEventListener.call(this, type, listener);
  };
  const pending = waitForImsPublicPlayer(host, {
    MutationObserverImpl: MutationObserverStub,
  });

  viewer = { querySelector: () => player };
  observerCallback();
  player = { localName: 'ims-gallery' };
  host.dispatch('ims-ready', player);
  observerCallback();

  assert.equal(await pending, player);
  assert.equal(listenerWasAttached, true, 'ready listener is attached before inspecting mounts');
});

test('IMS public player resolution accepts documented state from an already-ready child', async () => {
  const gallery = {
    localName: 'ims-gallery',
    hotspotState: { image: 0 },
  };
  let observerConstructed = false;
  class MutationObserverStub {
    constructor() { observerConstructed = true; }
  }
  const viewer = listenerRoot(() => gallery);
  viewer.localName = 'ims-viewer';

  assert.equal(await waitForImsPublicPlayer(viewer, {
    MutationObserverImpl: MutationObserverStub,
  }), gallery);
  assert.equal(observerConstructed, false);
});

test('IMS Show target forwards capture abort and retries a rejected public-player mount', async () => {
  const controller = new AbortController();
  const reason = Object.assign(new Error('replaced during mount'), { name: 'AbortError' });
  const gallery = {
    localName: 'ims-gallery',
    hotspotState: { image: 2 },
  };
  let attempts = 0;
  const target = createImsShowMediaTarget({ localName: 'ims-viewer' }, {
    resolvePlayer: async (_viewer, { signal }) => {
      attempts += 1;
      if (attempts === 1) {
        assert.equal(signal, controller.signal);
        throw reason;
      }
      return gallery;
    },
  });

  await assert.rejects(
    target.captureShowMediaState({ signal: controller.signal }),
    error => error === reason,
  );
  assert.deepEqual(await target.captureShowMediaState(), {
    kind: 'ims-gallery',
    frame: 3,
  });
  assert.equal(attempts, 2);
});
