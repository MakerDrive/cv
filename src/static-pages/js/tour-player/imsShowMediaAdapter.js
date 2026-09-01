const IMS_PUBLIC_PLAYER_SELECTOR = 'ims-gallery';
const IMS_READY_EVENT = 'ims-ready';
const MIN_GALLERY_FRAME_HOLD_MS = 500;
const IMS_READY_PLAYERS = new WeakSet();

function abortError(signal) {
  if (signal?.reason instanceof Error) return signal.reason;
  const error = new Error('IMS Show media operation was aborted');
  error.name = 'AbortError';
  return error;
}

function throwIfAborted(signal) {
  if (signal?.aborted) throw abortError(signal);
}

function createAbortableGalleryClock({
  setTimer = globalThis.setTimeout?.bind(globalThis),
  clearTimer = globalThis.clearTimeout?.bind(globalThis),
} = {}) {
  return Object.freeze({
    wait(durationMs, { signal } = /** @type {{ signal?: AbortSignal }} */ ({})) {
      throwIfAborted(signal);
      if (!setTimer) return Promise.reject(new TypeError('a timer implementation is required'));
      return new Promise((resolve, reject) => {
        let timer = null;
        const cleanup = () => signal?.removeEventListener?.('abort', onAbort);
        const onAbort = () => {
          if (timer !== null) clearTimer?.(timer);
          cleanup();
          reject(abortError(signal));
        };
        signal?.addEventListener?.('abort', onAbort, { once: true });
        timer = setTimer(() => {
          cleanup();
          resolve();
        }, Math.max(0, Number(durationMs) || 0));
      });
    },
  });
}

function awaitSharedWithAbort(value, signal) {
  throwIfAborted(signal);
  const shared = Promise.resolve(value);
  if (!signal?.addEventListener) return shared;
  return new Promise((resolve, reject) => {
    let settled = false;
    const finish = (complete, result) => {
      if (settled) return;
      settled = true;
      signal.removeEventListener?.('abort', onAbort);
      complete(result);
    };
    const onAbort = () => finish(reject, abortError(signal));
    signal.addEventListener('abort', onAbort, { once: true });
    shared.then(
      result => finish(resolve, result),
      error => finish(reject, error),
    );
    if (signal.aborted) onAbort();
  });
}

function dispatchImsRuntimeError(root, error) {
  const CustomEventImpl = root?.ownerDocument?.defaultView?.CustomEvent || globalThis.CustomEvent;
  if (typeof root?.dispatchEvent !== 'function' || typeof CustomEventImpl !== 'function') return;
  root.dispatchEvent(new CustomEventImpl('portfolio-show-runtime-error', {
    bubbles: true,
    composed: true,
    detail: Object.freeze({
      operation: 'ims-gallery-sequence',
      code: error?.code || 'ims-gallery-sequence-failed',
      message: error?.message || String(error),
    }),
  }));
}

function playerKind(player) {
  return String(player?.localName || player?.tagName || '').toLowerCase();
}

function findImsPublicPlayer(root) {
  const rootKind = playerKind(root);
  if (rootKind === 'ims-gallery') return root;
  const direct = root?.querySelector?.(IMS_PUBLIC_PLAYER_SELECTOR);
  if (direct) return direct;
  const viewer = rootKind === 'ims-viewer'
    ? root
    : root?.querySelector?.('ims-viewer');
  return viewer?.querySelector?.(IMS_PUBLIC_PLAYER_SELECTOR) || null;
}

function hasImsPublicReadyEvidence(player) {
  if (IMS_READY_PLAYERS.has(player)) return true;
  try {
    const image = player.hotspotState?.image;
    return Number.isInteger(image) && image >= 0;
  } catch {}
  return false;
}

export function waitForImsPublicPlayer(root, {
  signal,
  MutationObserverImpl = globalThis.MutationObserver,
} = /** @type {{ signal?: AbortSignal, MutationObserverImpl?: typeof MutationObserver }} */ ({})) {
  throwIfAborted(signal);

  return new Promise((resolve, reject) => {
    let observer;
    let settled = false;
    const cleanup = () => {
      observer?.disconnect?.();
      signal?.removeEventListener?.('abort', onAbort);
      root?.removeEventListener?.(IMS_READY_EVENT, onReady);
    };
    const finish = (callback, value) => {
      if (settled) return;
      settled = true;
      cleanup();
      callback(value);
    };
    const onAbort = () => {
      finish(reject, abortError(signal));
    };
    const inspect = () => {
      const player = findImsPublicPlayer(root);
      if (!player || !hasImsPublicReadyEvidence(player)) return false;
      finish(resolve, player);
      return true;
    };
    const onReady = (event) => {
      const player = event?.target;
      const kind = playerKind(player);
      if (kind !== 'ims-gallery') return;
      IMS_READY_PLAYERS.add(player);
      inspect();
    };

    root?.addEventListener?.(IMS_READY_EVENT, onReady);
    signal?.addEventListener?.('abort', onAbort, { once: true });
    if (signal?.aborted) {
      onAbort();
      return;
    }
    if (inspect()) return;
    if (typeof MutationObserverImpl !== 'function') {
      finish(reject, new TypeError('IMS player resolution requires MutationObserver'));
      return;
    }
    observer = new MutationObserverImpl(inspect);
    observer.observe(root, { childList: true, subtree: true });
    inspect();
  });
}

function normalizeFrames(value) {
  if (!Array.isArray(value)) return [];
  return value.map(Number).filter((frame) => Number.isInteger(frame) && frame >= 1);
}

/** Adapts the approved BoothBot IMS gallery to Show frame-advance hooks. */
export function createImsShowMediaTarget(root, {
  resolvePlayer = (element, options) => waitForImsPublicPlayer(element, options),
  clock = createAbortableGalleryClock(),
} = {}) {
  if (!root) throw new TypeError('an IMS host or viewer is required');
  const preparationSignal = new AbortController().signal;
  let playerPromise = null;
  let preparationPromise = null;
  let hostActivationRequested = false;
  let lastGalleryFrame = 1;
  const activateHost = () => {
    if (hostActivationRequested || typeof root.activate !== 'function') return;
    hostActivationRequested = true;
    root.activate();
  };
  const getPlayer = (signal) => {
    if (!playerPromise) {
      const pending = Promise.resolve().then(() => {
        // sn-media-host is deliberately poster-only until activate() is called.
        // Show media is an explicit authored interaction, so request that public
        // activation seam before waiting for the mounted IMS child.
        activateHost();
        return resolvePlayer(root, { signal });
      });
      playerPromise = pending;
      pending.catch(() => {
        if (playerPromise === pending) playerPromise = null;
      });
    }
    return playerPromise;
  };
  const prepare = () => {
    if (!preparationPromise) {
      const pending = Promise.resolve(getPlayer(preparationSignal));
      preparationPromise = pending;
      pending.catch(() => {
        if (preparationPromise === pending) preparationPromise = null;
      });
    }
    return preparationPromise;
  };

  return Object.freeze({
    element: root,

    async prepareShowMedia(
      { signal } = /** @type {{ signal?: AbortSignal }} */ ({}),
    ) {
      const player = await awaitSharedWithAbort(prepare(), signal);
      return Object.freeze({ kind: playerKind(player), ready: true });
    },

    async captureShowMediaState(
      { signal } = /** @type {{ signal?: AbortSignal }} */ ({}),
    ) {
      const player = await getPlayer(signal);
      throwIfAborted(signal);
      const kind = playerKind(player);
      if (kind !== 'ims-gallery') {
        throw Object.assign(new TypeError(`unsupported IMS Show player "${kind}"`), {
          code: 'ims-player-unsupported',
        });
      }
      let hotspotIndex = Number.NaN;
      try {
        hotspotIndex = Number(player.hotspotState?.image);
      } catch {}
      if (Number.isInteger(hotspotIndex) && hotspotIndex >= 0) {
        lastGalleryFrame = hotspotIndex + 1;
      }
      return Object.freeze({
        kind,
        frame: lastGalleryFrame,
      });
    },

    async applyShowMediaPolicy() {
      await getPlayer();
    },

    async playShowMedia(
      options = {},
      { signal } = /** @type {{ signal?: AbortSignal }} */ ({}),
    ) {
      throwIfAborted(signal);
      const player = await getPlayer(signal);
      throwIfAborted(signal);
      const kind = playerKind(player);
      if (kind !== 'ims-gallery') {
        throw Object.assign(new TypeError(`unsupported IMS Show player "${kind}"`), {
          code: 'ims-player-unsupported',
        });
      }
      const frames = normalizeFrames(options.frames);
      const frameHoldMs = Math.max(
        MIN_GALLERY_FRAME_HOLD_MS,
        Number(options.frameHoldMs) || 0,
      );
      const finalFrame = Number.isInteger(Number(options.finalFrame))
        && Number(options.finalFrame) >= 1
        ? Number(options.finalFrame)
        : frames.at(-1) || lastGalleryFrame;
      const completion = (async () => {
        for (const frame of frames) {
          throwIfAborted(signal);
          player.goTo?.(frame - 1);
          lastGalleryFrame = frame;
          await clock.wait(frameHoldMs, { signal });
        }
        if (lastGalleryFrame !== finalFrame) {
          player.goTo?.(finalFrame - 1);
          lastGalleryFrame = finalFrame;
        }
      })();
      void completion.catch((error) => {
        if (error?.name !== 'AbortError') dispatchImsRuntimeError(root, error);
      });
      return Object.freeze({
        mode: String(options.mode || ''),
        frames: Object.freeze([...frames]),
        frameHoldMs,
        finalFrame,
        running: true,
        completion,
      });
    },

    async pauseShowMedia() {},

    async restoreShowMediaState(state = {}) {
      const player = await getPlayer();
      const kind = playerKind(player);
      if (kind !== 'ims-gallery') {
        throw Object.assign(new TypeError(`unsupported IMS Show player "${kind}"`), {
          code: 'ims-player-unsupported',
        });
      }
      if (Number.isInteger(Number(state.frame))) {
        lastGalleryFrame = Math.max(1, Number(state.frame));
        player.goTo?.(lastGalleryFrame - 1);
      }
    },
  });
}

export default createImsShowMediaTarget;
