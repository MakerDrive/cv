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
      const readOverlayState = () => {
        const scope = player.closest?.('ims-viewer') || player;
        try {
          return scope?.hasAttribute?.('fullscreen') === true;
        } catch {
          return false;
        }
      };
      const readImageIndex = () => {
        try {
          const value = Number(player.hotspotState?.image);
          return Number.isInteger(value) && value >= 0 ? value : null;
        } catch {
          return null;
        }
      };
      const clickControl = async (control, intent) => {
        throwIfAborted(signal);
        if (typeof presentMediaControl !== 'function' || !control) return false;
        const presented = await presentMediaControl(control, { signal, intent });
        // A resolved false means the presenter could not land the click —
        // that is an honest miss, not a click.
        return presented === true;
      };
      // Visible accent: the montage begins by presenting the gallery's own
      // expand control and ends by collapsing it again; each frame advances
      // through a click on the gallery's next control. A control the show
      // cannot present (offscreen, unavailable) fell back to the
      // programmatic player API — narration is never blocked by decoration.
      // Per-frame evidence: one entry per authored frame with the channel
      // that actually advanced it. Receipts and the acceptance matrix draw
      // from this, never from the assumption "we clicked".
      const evidence = [];
      const completion = (async () => {
        let presentedOverlay = false;
        let overlayOwnedByShow = false;
        try {
          const initiallyExpanded = readOverlayState();
          // The overlay opens only if the user did not already open it.
          if (!initiallyExpanded) {
            presentedOverlay = await clickControl(controls.fullscreen, 'media-expand');
            overlayOwnedByShow = presentedOverlay && readOverlayState() === true;
            evidence.push(Object.freeze({
              kind: 'overlay-open',
              via: presentedOverlay ? 'control-click' : 'none',
              verified: overlayOwnedByShow,
            }));
          } else {
            evidence.push(Object.freeze({
              kind: 'overlay-open',
              via: 'pre-expanded-by-user',
              verified: true,
            }));
          }
          for (const frame of frames) {
            throwIfAborted(signal);
            const before = readImageIndex();
            let advanced = false;
            if (frame === lastGalleryFrame + 1 && controls.next) {
              advanced = await clickControl(controls.next, 'gallery-next');
              // Verify the click landed as a real index advance, not
              // "we clicked so it must have happened".
              if (advanced) {
                const after = readImageIndex();
                advanced = after === before + 1 || frame - 1 === after;
                if (!advanced) {
                  evidence.push(Object.freeze({
                    frame,
                    via: 'control-click-unverified',
                    verified: false,
                  }));
                }
              }
            }
            if (!advanced) {
              player.goTo?.(frame - 1);
              evidence.push(Object.freeze({
                frame,
                via: 'api-fallback',
                verified: readImageIndex() === frame - 1,
              }));
            } else {
              evidence.push(Object.freeze({
                frame,
                via: 'control-click',
                verified: true,
              }));
            }
            lastGalleryFrame = frame;
            // Full authored hold after the control gesture; the gesture
            // itself is priced into the cue's gestureDurationMs (verified by
            // the montage window check in the authoring test).
            await clock.wait(frameHoldMs, { signal });
          }
          if (lastGalleryFrame !== finalFrame) {
            player.goTo?.(finalFrame - 1);
            evidence.push(Object.freeze({
              frame: finalFrame,
              via: 'api-final',
              verified: readImageIndex() === finalFrame - 1,
            }));
            lastGalleryFrame = finalFrame;
          }
        } finally {
          // Restore the layout to the state the show found it in — never
          // toggle blindly: collapse only if the show opened the overlay AND
          // the state is still open. A user who reclaimed it keeps it.
          if (overlayOwnedByShow && readOverlayState()) {
            let restored = false;
            try {
              const collapsed = await clickControl(controls.fullscreen, 'media-collapse');
              restored = collapsed && readOverlayState() === false;
              evidence.push(Object.freeze({
                kind: 'overlay-close',
                via: restored === true ? 'control-click' : 'click-unverified',
                verified: restored === true,
              }));
            } catch (error) {
              evidence.push(Object.freeze({
                kind: 'overlay-close',
                via: 'control-click-rejected',
                verified: false,
                reason: error?.name || String(error),
              }));
            }
            if (!restored && readOverlayState()) {
              // Presenter abandon or host race after stop: still restore
              // silently — no delayed presented click after a cancel.
              try {
                controls.fullscreen?.click?.();
              } catch {}
              evidence.push(Object.freeze({
                kind: 'overlay-close',
                via: 'direct-state-restore',
                verified: readOverlayState() === false,
              }));
            }
          } else if (overlayOwnedByShow && !readOverlayState()) {
            evidence.push(Object.freeze({
              kind: 'overlay-close',
              via: 'already-collapsed-by-user',
              verified: true,
            }));
          } else if (presentedOverlay && !overlayOwnedByShow) {
            evidence.push(Object.freeze({
              kind: 'overlay-close',
              via: 'left-open-not-owned',
              verified: readOverlayState() === true,
            }));
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
        get evidence() {
          return Object.freeze([...evidence]);
        },
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
