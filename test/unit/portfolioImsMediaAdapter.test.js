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
      frameHoldMs: 1200,
      finalFrame: 5,
    }, { signal: new AbortController().signal }),
    new Promise((_, reject) => setTimeout(() => reject(
      new Error('gallery choreography blocked its start receipt'),
    ), 50)),
  ]);

  assert.equal(result.running, true);
  assert.equal(typeof result.completion?.then, 'function');
  assert.deepEqual(events, [['goTo', 0], ['wait', 1200]]);

  releaseHold();
  await result.completion;

  assert.deepEqual(events, [
    ['goTo', 0], ['wait', 1200],
    ['goTo', 1], ['wait', 1200],
    ['goTo', 2], ['wait', 1200],
    ['goTo', 3], ['wait', 1200],
    ['goTo', 4], ['wait', 1200],
  ]);
  assert.deepEqual(result.frames, [1, 2, 3, 4, 5]);
  assert.equal(result.finalFrame, 5);
});

test('IMS Show gallery clamps frame holds so narration sees at most one image per second', async () => {
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

  assert.deepEqual(waits, [1000, 1000]);
  assert.equal(result.frameHoldMs, 1000);
  assert.ok(
    waits.every((durationMs) => durationMs >= 1000),
    'gallery frames advance at most once per second',
  );
});

test('IMS Show gallery derives the paced image count from the player, not from authored frames', async () => {
  const events = [];
  const imageCount = 7;
  const gallery = {
    localName: 'ims-gallery',
    hotspotState: { image: 0 },
    srcData: {
      srcList: Array.from({ length: imageCount }, (_, index) => `img-${index}.jpg`),
    },
    goTo(index) {
      events.push(['goTo', index]);
    },
  };
  const target = createImsShowMediaTarget({ localName: 'ims-viewer' }, {
    resolvePlayer: async () => gallery,
    clock: {
      wait: async (durationMs) => {
        events.push(['wait', durationMs]);
      },
    },
  });

  const result = await target.playShowMedia(
    { mode: 'short-muted-montage' },
    { signal: new AbortController().signal },
  );
  await result.completion;

  const playedFrames = events.filter(([kind]) => kind === 'goTo');
  const heldWaits = events.filter(([kind]) => kind === 'wait').map(([, durationMs]) => durationMs);

  assert.equal(playedFrames.length, imageCount, 'every gallery image is shown exactly once');
  assert.deepEqual(playedFrames.map(([, index]) => index), [0, 1, 2, 3, 4, 5, 6]);
  assert.equal(heldWaits.length, imageCount);
  assert.ok(
    heldWaits.every((durationMs) => durationMs >= 1000),
    'narration sees at most one image per second',
  );
  assert.deepEqual(result.frames, [1, 2, 3, 4, 5, 6, 7]);
  assert.equal(result.finalFrame, imageCount);
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

test('IMS Show target still rejects unknown players while spinner is supported', async () => {
  const unknown = {
    localName: 'ims-unknown',
    currentFrame: 3,
  };
  const target = createImsShowMediaTarget({ localName: 'ims-viewer' }, {
    resolvePlayer: async () => unknown,
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

test('IMS public player resolution accepts an ims-spinner as the public 360 player', async () => {
  let spinner = null;
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
  const viewer = listenerRoot(() => spinner);
  viewer.localName = 'ims-viewer';
  const pending = waitForImsPublicPlayer(viewer, {
    MutationObserverImpl: MutationObserverStub,
  });
  let settled = false;
  pending.then(() => { settled = true; });

  // A mounted ims-spinner without any readiness evidence must keep waiting:
  // child insertion alone is never a ready player.
  spinner = { localName: 'ims-spinner' };
  observerCallback();
  await Promise.resolve();
  assert.equal(settled, false);

  viewer.dispatch('ims-ready', spinner);
  assert.equal(await pending, spinner, 'the ims-ready event completes spinner readiness');
  assert.equal(disconnectCount, 1);
});

test('IMS public player resolution accepts an already-active ims-spinner without observing', async () => {
  const spinner = {
    localName: 'ims-spinner',
    hasAttribute(name) {
      return name === 'active';
    },
  };
  let observerConstructed = false;
  class MutationObserverStub {
    constructor() { observerConstructed = true; }
  }
  const viewer = listenerRoot(() => spinner);
  viewer.localName = 'ims-viewer';

  assert.equal(await waitForImsPublicPlayer(viewer, {
    MutationObserverImpl: MutationObserverStub,
  }), spinner);
  assert.equal(observerConstructed, false);
});

test('IMS Show spinner play keeps rotating until the show aborts it', async () => {
  const events = [];
  const spinner = {
    localName: 'ims-spinner',
    play() { events.push('play'); },
    pause() { events.push('pause'); },
  };
  const controller = new AbortController();
  const target = createImsShowMediaTarget({ localName: 'ims-viewer' }, {
    resolvePlayer: async () => spinner,
  });

  const started = await target.playShowMedia(
    { mode: 'spinner-rotation' },
    { signal: controller.signal },
  );
  assert.equal(started.running, true);
  assert.deepEqual(events, ['play']);

  let completed = false;
  started.completion.then(
    () => { completed = true; },
    () => { completed = true; },
  );
  await Promise.resolve();
  await Promise.resolve();
  assert.equal(completed, false, 'rotation completion stays open instead of auto-stopping');
  assert.deepEqual(events, ['play'], 'no early pause precedes the abort');

  controller.abort(Object.assign(new Error('show-moved-on'), { name: 'AbortError' }));
  await assert.rejects(started.completion, error => error?.name === 'AbortError');
  assert.deepEqual(events, ['play', 'pause']);
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

test('IMS Show spinner starts rotation through the public play API and pauses on abort', async () => {
  const events = [];
  const spinner = {
    localName: 'ims-spinner',
    play() {
      events.push('play');
    },
    pause() {
      events.push('pause');
    },
  };
  const target = createImsShowMediaTarget({ localName: 'ims-viewer' }, {
    resolvePlayer: async () => spinner,
  });

  const controller = new AbortController();
  const result = await target.playShowMedia({ mode: 'spinner-rotation' }, { signal: controller.signal });
  assert.equal(result.running, true);
  assert.deepEqual(result.frames, []);
  assert.deepEqual(events, ['play']);
  assert.deepEqual(await target.captureShowMediaState(), { kind: 'ims-spinner', playing: true });

  controller.abort();
  await assert.rejects(result.completion, (error) => error?.name === 'AbortError');
  assert.deepEqual(events, ['play', 'pause']);
  assert.deepEqual(await target.captureShowMediaState(), { kind: 'ims-spinner', playing: false });
});

test('IMS Show spinner pauses through the shared media pause hook without touching gallery semantics', async () => {
  const events = [];
  const spinner = {
    localName: 'ims-spinner',
    play() {
      events.push('play');
    },
    pause() {
      events.push('pause');
    },
  };
  const target = createImsShowMediaTarget({ localName: 'ims-viewer' }, {
    resolvePlayer: async () => spinner,
  });

  await target.restoreShowMediaState({ kind: 'ims-spinner', playing: true });
  assert.deepEqual(events, ['play']);
  await target.pauseShowMedia();
  assert.deepEqual(events, ['play', 'pause']);
  assert.deepEqual(await target.captureShowMediaState(), { kind: 'ims-spinner', playing: false });
});

test('IMS Show gallery accent presents each frame through the real next control', async () => {
  const events = [];
  let fsOn = false;
  const button = (name) => ({
    localName: 'ims-button',
    click() {
      events.push(['click', name]);
      if (name === 'fs') fsOn = !fsOn;
      if (name === 'next') gallery.$index += 1;
    },
  });
  const toolbar = {
    localName: 'ims-gallery-toolbar',
    shadowRoot: {
      querySelectorAll: (selector) => (
        selector === 'ims-button'
          ? [button('prev'), button('next'), button('autoplay'), button('fs')]
          : []
      ),
    },
  };
  const gallery = {
    localName: 'ims-gallery',
    $index: 0,
    get hotspotState() { return { image: this.$index }; },
    hasAttribute: (attr) => attr === 'fullscreen' ? fsOn : false,
    shadowRoot: {
      querySelector: (selector) => (selector === 'ims-gallery-toolbar' ? toolbar : null),
    },
    goTo(index) { events.push(['goTo', index]); this.$index = index; },
  };
  const target = createImsShowMediaTarget({ localName: 'ims-viewer' }, {
    resolvePlayer: async () => gallery,
    presentMediaControl: async (control, { signal, intent } = {}) => {
      assert.equal(signal.aborted, false);
      events.push(['present', intent]);
      control.click();
      return true;
    },
    clock: {
      wait: async (durationMs) => { events.push(['wait', durationMs]); },
    },
  });

  const result = await target.playShowMedia({
    frames: [1, 2, 3],
    frameHoldMs: 1000,
    finalFrame: 3,
  }, { signal: new AbortController().signal });
  await result.completion;

  // Expand overlay → first frame pinned programmatically (it is already
  // displayed) → next frames advance through visible next-control clicks →
  // collapse back through the same control.
  assert.deepEqual(events, [
    ['present', 'media-expand'], ['click', 'fs'],
    ['goTo', 0], ['wait', 1000],
    ['present', 'gallery-next'], ['click', 'next'], ['wait', 1000],
    ['present', 'gallery-next'], ['click', 'next'], ['wait', 1000],
    ['present', 'media-collapse'], ['click', 'fs'],
  ]);
  assert.deepEqual(result.frames, [1, 2, 3]);
});

test('IMS Show gallery falls back to programmatic goTo when controls cannot be presented', async () => {
  const events = [];
  const gallery = {
    localName: 'ims-gallery',
    shadowRoot: null,
    goTo(index) { events.push(['goTo', index]); },
  };
  const target = createImsShowMediaTarget({ localName: 'ims-viewer' }, {
    resolvePlayer: async () => gallery,
    presentMediaControl: async () => false,
    clock: {
      wait: async (durationMs) => { events.push(['wait', durationMs]); },
    },
  });

  const result = await target.playShowMedia({
    frames: [1, 2],
    frameHoldMs: 1000,
    finalFrame: 2,
  }, { signal: new AbortController().signal });
  await result.completion;

  assert.deepEqual(events, [
    ['goTo', 0], ['wait', 1000],
    ['goTo', 1], ['wait', 1000],
  ]);
});

test('IMS Show gallery collapse restores the layout directly when the tour is stopped mid-way', async () => {
  const events = [];
  const clicks = [];
  let fsOn = false;
  const button = (name) => ({
    localName: 'ims-button',
    click() {
      clicks.push(name);
      if (name === 'fs') fsOn = !fsOn;
    },
  });
  const toolbar = {
    localName: 'ims-gallery-toolbar',
    shadowRoot: {
      querySelectorAll: (selector) => (
        selector === 'ims-button'
          ? [button('prev'), button('next'), button('autoplay'), button('fs')]
          : []
      ),
    },
  };
  const gallery = {
    localName: 'ims-gallery',
    hotspotState: { image: 0 },
    hasAttribute: (attr) => (attr === 'fullscreen' ? fsOn : false),
    shadowRoot: {
      querySelector: (selector) => (selector === 'ims-gallery-toolbar' ? toolbar : null),
    },
    goTo() {},
  };
  const controller = new AbortController();
  const target = createImsShowMediaTarget({ localName: 'ims-viewer' }, {
    resolvePlayer: async () => gallery,
    presentMediaControl: async (control) => {
      control.click();
      return true;
    },
    clock: {
      wait: async (_durationMs, { signal } = {}) => {
        events.push(['wait']);
        controller.abort();
        const error = signal?.reason || new Error('stopped');
        if (!error.name) error.name = 'AbortError';
        throw error;
      },
    },
  });

  const result = await target.playShowMedia({
    frames: [1, 2, 3],
    frameHoldMs: 1000,
    finalFrame: 3,
  }, { signal: controller.signal });
  await assert.rejects(result.completion, (error) => error?.name === 'AbortError');

  // The expand click was presented once; after the abort the overlay is
  // collapsed via the physical control again, with NO additional presented
  // click (no delayed gesture after stop).
  assert.deepEqual(clicks, ['fs', 'fs']);
});
