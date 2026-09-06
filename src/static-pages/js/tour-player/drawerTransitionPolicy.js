/**
 * Drawer transition policy + scheduling seam for the CV Show tour.
 *
 * The navigation/start drawer must be closed when the tour moves to a new
 * playback entry, but only while the tour stays active. Closing is deferred to
 * a microtask so authored navigation cues are not cancelled by it; if the show
 * is stopped/completed before that microtask runs, the deferred close is
 * cancelled and a manually opened panel is never closed late.
 *
 * Pure and Node-safe; installPortfolioTour uses `createStaleNavDrawerCloser`,
 * so ordering regressions can be tested against the same production seam
 * without CDP.
 */

/**
 * @param {{
 *   layoutDrawerMode?: boolean,
 *   drawerStartOpen?: boolean,
 *   dockOpen?: boolean,
 *   tourActive?: boolean,
 * }} [state]
 */
export function shouldCloseStaleNavDrawer(state = {}) {
  return Boolean(
    state.layoutDrawerMode
    && state.drawerStartOpen
    && !state.dockOpen
    && state.tourActive,
  );
}

/**
 * Returns the production scheduling helper used by installPortfolioTour.
 *
 * `schedule()` queues a single microtask that runs `onClose()` only if the
 * tour is still active. `cancel()` drops a pending close (Stop/complete or
 * restart before the microtask). The helper never guesses ordering itself; it
 * is the real wiring the page uses.
 *
 * @param {{
 *   isActive: () => boolean,
 *   onClose: () => void,
 * }} [handlers]
 */
export function createStaleNavDrawerCloser(handlers = { isActive: () => false, onClose: () => {} }) {
  const isActive = typeof handlers.isActive === 'function'
    ? handlers.isActive
    : () => false;
  const onClose = typeof handlers.onClose === 'function'
    ? handlers.onClose
    : () => {};
  let token = 0;
  let pending = false;
  return Object.freeze({
    schedule() {
      token += 1;
      const scheduledToken = token;
      pending = true;
      queueMicrotask(() => {
        if (scheduledToken !== token) return; // cancelled / superseded
        pending = false;
        if (isActive()) onClose();
      });
    },
    cancel() {
      token += 1;
      pending = false;
    },
    get pending() {
      return pending;
    },
  });
}


/**
 * Binds the drawer-open cancellation signal used by installPortfolioTour.
 *
 * The callback is intentionally not `this`-dependent so it is safe to use as
 * a DOM/EventTarget listener and can be removed cleanly.
 *
 * @param {EventTarget} target
 * @param {{ cancel: () => void }} closer
 */
export function bindStaleNavDrawerCloser(target, closer) {
  if (!target || typeof target.addEventListener !== 'function') {
    return Object.freeze({ dispose() {} });
  }
  const handler = () => {
    if (closer && typeof closer.cancel === 'function') closer.cancel();
  };
  target.addEventListener('cv-show-start-drawer-opened', handler);
  return Object.freeze({
    dispose() {
      target.removeEventListener('cv-show-start-drawer-opened', handler);
    },
  });
}
