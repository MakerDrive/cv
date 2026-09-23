const IMS_PUBLIC_PLAYER_SELECTOR = 'ims-gallery, ims-spinner';
const IMS_PUBLIC_PLAYER_KINDS = Object.freeze(['ims-gallery', 'ims-spinner']);
const IMS_READY_EVENT = 'ims-ready';
/**
 * Narration-paced gallery invariant: viewers must be able to read at most one
 * image per second. Authored frame choreography is clamped to this floor so a
 * montage can never outrun the narration that describes it.
 */
const MIN_GALLERY_FRAME_HOLD_MS = 1000;
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
  if (IMS_PUBLIC_PLAYER_KINDS.includes(rootKind)) return root;
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
    if (Number.isInteger(image) && image >= 0) return true;
  } catch {}
  if (playerKind(player) === 'ims-spinner') {
    // ims-spinner marks itself `active` after srcData load and init, which is
    // the same moment the `ims-ready` event represents for an ims-gallery.
    try {
      if (player.hasAttribute?.('active')) return true;
    } catch {}
  }
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
      if (!IMS_PUBLIC_PLAYER_KINDS.includes(kind)) return;
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

/** Public ims-gallery image count; the private `#images` list stays unread. */
function galleryImageCount(player) {
  let count = Number(player?.srcData?.srcList?.length);
  return Number.isSafeInteger(count) && count > 0 ? count : 0;
}

/**
 * The gallery toolbar lives in `ims-gallery`'s shadow root, its buttons in
 * the toolbar's own shadow root. This is the public presentation surface of
 * the widget — the only elements a visitor can physically click.
 */
function resolveGalleryControls(player) {
  const gallery = playerKind(player) === 'ims-gallery'
    ? player
    : player?.shadowRoot?.querySelector?.('ims-gallery')
      || player?.querySelector?.('ims-gallery')
      || null;
  const toolbar = gallery?.shadowRoot?.querySelector?.('ims-gallery-toolbar') || null;
  const buttons = Array.from(toolbar?.shadowRoot?.querySelectorAll?.('ims-button') || []);
  return {
    gallery,
    next: buttons[1] || null,
    prev: buttons[0] || null,
    autoplay: buttons[2] || null,
    fullscreen: buttons[3] || null,
  };
}

/**
 * Adapts the approved BoothBot IMS gallery to Show frame-advance hooks.
 * `presentMediaControl(element, { signal })` performs the authored visible
 * click on one of the gallery's own toolbar controls (cursor travel +
 * press); the montage prefers these real controls and falls back to the
 * programmatic player API only when a control is genuinely not presented.
 */
export function createImsShowMediaTarget(root, {
  resolvePlayer = (element, options) => waitForImsPublicPlayer(element, options),
  clock = createAbortableGalleryClock(),
  presentMediaControl = null,
} = {}) {
  if (!root) throw new TypeError('an IMS host or viewer is required');
  const preparationSignal = new AbortController().signal;
  let playerPromise = null;
  let preparationPromise = null;
  let hostActivationRequested = false;
  let lastGalleryFrame = 1;
  let lastSpinnerPlaying = false;
  const activateHost = () => {
    if (hostActivationRequested || typeof root.activate !== 'function') return;
    hostActivationRequested = true;
    root.activate();
  };
  const actuatedPlayer = (player) => {
    if (playerKind(player) === 'ims-spinner') return player;
    const scope = player?.matches?.('ims-viewer') ? player : player?.querySelector?.('ims-viewer');
    const spinner = scope?.shadowRoot?.querySelector?.('ims-spinner')
      || scope?.querySelector?.('ims-spinner');
    return spinner || player;
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

  const playSpinnerMedia = (player, options = {}, signal) => {
    const completion = (async () => {
      try {
        player.play?.();
        lastSpinnerPlaying = true;
        await new Promise((resolve, reject) => {
          if (signal?.aborted) {
            reject(signal.reason || new DOMException('IMS spinner choreography aborted', 'AbortError'));
            return;
          }
          signal?.addEventListener?.('abort', () => {
            reject(signal?.reason || new DOMException('IMS spinner choreography aborted', 'AbortError'));
          }, { once: true });
        });
      } catch (error) {
        if (error?.name !== 'AbortError') dispatchImsRuntimeError(root, error);
        throw error;
      } finally {
        lastSpinnerPlaying = false;
        try { player.pause?.(); } catch {}
      }
    })();
    void completion.catch((error) => {
      if (error?.name !== 'AbortError') dispatchImsRuntimeError(root, error);
    });
    return Object.freeze({
      mode: String(options?.mode || ''),
      frames: Object.freeze([]),
      frameHoldMs: 0,
      finalFrame: null,
      running: true,
      completion,
    });
  };

  return Object.freeze({
    element: root,

    async prepareShowMedia(
      { signal } = /** @type {{ signal?: AbortSignal }} */ ({}),
    ) {
      const player = await awaitSharedWithAbort(prepare(), signal);
      return Object.freeze({ kind: playerKind(actuatedPlayer(player)), ready: true });
    },

    async captureShowMediaState(
      { signal } = /** @type {{ signal?: AbortSignal }} */ ({}),
    ) {
      const player = actuatedPlayer(await getPlayer(signal));
      throwIfAborted(signal);
      const kind = playerKind(player);
      if (kind === 'ims-spinner') {
        return Object.freeze({
          kind,
          playing: lastSpinnerPlaying,
        });
      }
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
      const player = actuatedPlayer(await getPlayer(signal));
      throwIfAborted(signal);
      const kind = playerKind(player);
      if (kind === 'ims-spinner') {
        return playSpinnerMedia(player, options, signal);
      }
      if (kind !== 'ims-gallery') {
        throw Object.assign(new TypeError(`unsupported IMS Show player "${kind}"`), {
          code: 'ims-player-unsupported',
        });
      }
      let frames = normalizeFrames(options.frames);
      if (!frames.length) {
        // No authored frames: pace the whole gallery. The image count comes
        // from the player itself, never from a hardcoded scenario constant.
        const total = galleryImageCount(player);
        frames = Array.from({ length: total }, (_, index) => index + 1);
      }
      const frameHoldMs = Math.max(
        MIN_GALLERY_FRAME_HOLD_MS,
        Number(options.frameHoldMs) || 0,
      );
      const finalFrame = Number.isInteger(Number(options.finalFrame))
        && Number(options.finalFrame) >= 1
        ? Number(options.finalFrame)
        : frames.at(-1) || lastGalleryFrame;
      const controls = resolveGalleryControls(player);
      const clickControl = async (control, intent) => {
        if (typeof presentMediaControl !== 'function' || !control) return false;
        const displayed = await presentMediaControl(control, { signal, intent });
        return displayed === true;
      };
      // Visible accent: the montage begins by presenting the gallery's own
      // expand control and ends by collapsing it again; each frame advances
      // through a click on the gallery's next control. A control the show
      // cannot present (offscreen, unavailable) fell back to the
      // programmatic player API — narration is never blocked by decoration.
      const completion = (async () => {
        let presentedOverlay = false;
        try {
          presentedOverlay = await clickControl(controls.fullscreen, 'media-expand');
          for (const frame of frames) {
            throwIfAborted(signal);
            let advanced = false;
            if (frame === lastGalleryFrame + 1 && controls.next) {
              advanced = await clickControl(controls.next, 'gallery-next');
            }
            if (!advanced) {
              // Click unavailable for this step (or the authored frame is not
              // adjacent): the programmatic advance keeps the hold cadence.
              player.goTo?.(frame - 1);
            }
            lastGalleryFrame = frame;
            // The click travels inside the authored hold window: the viewer
            // sees the press and then one second of the still frame.
            await clock.wait(frameHoldMs, { signal });
          }
          if (lastGalleryFrame !== finalFrame) {
            player.goTo?.(finalFrame - 1);
            lastGalleryFrame = finalFrame;
          }
        } finally {
          if (presentedOverlay) {
            // Return the layout: collapse the overlay via the same real
            // control, honoured even when frames were skipped. A stopped
            // show will not schedule another presented click — the overlay
            // is put back hand-free instead, and the brief pause returned to
            // the user wins the overlay race.
            if (signal?.aborted) {
              try { controls.fullscreen?.click?.(); } catch {}
            } else {
              await clickControl(controls.fullscreen, 'media-collapse')
                .catch(() => {
                  try { controls.fullscreen?.click?.(); } catch {}
                });
            }
          }
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

    async pauseShowMedia() {
      try {
        const player = actuatedPlayer(await getPlayer());
        if (playerKind(player) === 'ims-spinner') {
          lastSpinnerPlaying = false;
          player.pause?.();
        }
      } catch {}
    },

    async restoreShowMediaState(state = {}) {
      const player = actuatedPlayer(await getPlayer());
      const kind = playerKind(player);
      if (kind === 'ims-spinner') {
        if (state.playing === true) {
          lastSpinnerPlaying = true;
          player.play?.();
        } else {
          lastSpinnerPlaying = false;
          player.pause?.();
        }
        return;
      }
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
