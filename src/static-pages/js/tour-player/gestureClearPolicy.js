/**
 * CV Show gesture-clear policy.
 *
 * The presenter leaves gesture graphics (marker strokes, marquee frames, ink)
 * on screen across pauses. Those graphics are anchored to content coordinates
 * that become stale the moment the user changes the surface around them, so a
 * meaningful manual action clears them. Plain transport toggling (pause and
 * resume of the same content), right-button presses, context menus and hover
 * never clear: they do not move the marked content.
 *
 * This module is pure and Node-safe; the host extracts DOM facts (event path,
 * button, drag state) and asks for the decision.
 */

export const CV_SHOW_GESTURE_CLEAR_REASONS = Object.freeze({
  none: '',
  panelToggle: 'gesture-panel-toggle',
  transportAdvance: 'gesture-transport-advance',
  userPointer: 'gesture-user-pointer',
  drag: 'gesture-drag',
  scroll: 'gesture-scroll',
  textInput: 'gesture-text-input',
  keyboardSeek: 'gesture-keyboard-seek',
});

export const CV_SHOW_PLAYER_TOGGLE_ACTIONS = Object.freeze(['play', 'toggle']);
export const CV_SHOW_SEEK_KEYS = Object.freeze(['ArrowLeft', 'ArrowRight', 'Home', 'End']);

export const GESTURE_TOGGLE_SELECTOR = [
  'layout-node[drawer-rail][drawer-rail-collapsed]',
  '[class*="layout-drawer-handle"]',
  '.layout-drawer-backdrop',
].join(', ');

export const GESTURE_NAV_SELECTOR = [
  'a[href]',
  'button',
  '[role="button"]',
  '[data-action-id]',
  '[data-control]',
  '.sn-tree-row',
  '.sn-card',
  '[contenteditable="true"]',
].join(', ');

export function pathMatchesSelector(path, selector) {
  return Boolean(path?.some((node) => (
    node && typeof node.matches === 'function' && node.matches(selector)
  )));
}

export function pointerAffordanceFromPath(path) {
  return {
    isDrawerToggle: pathMatchesSelector(path, GESTURE_TOGGLE_SELECTOR),
    isNavigationTarget: pathMatchesSelector(path, GESTURE_NAV_SELECTOR),
  };
}

const KEEP = Object.freeze({ clear: false, reason: CV_SHOW_GESTURE_CLEAR_REASONS.none });

/**
 * @param {{
 *   type?: string,
 *   button?: number,
 *   inPlayer?: boolean,
 *   isPlayPause?: boolean,
 *   isPlayerSettings?: boolean,
 *   isDrawerToggle?: boolean,
 *   isNavigationTarget?: boolean,
 *   isTextEntry?: boolean,
 *   isSeekKey?: boolean,
 *   dragStarted?: boolean,
 *   wheelDelta?: number,
 * }} [input]
 */
export function resolveCvShowGestureClear(input = {}) {
  const type = String(input.type || '');
  const button = Number.isInteger(input.button) ? input.button : -1;

  // Right-click and the resulting context menu must stay usable on the
  // highlighted content; middle-button presses do not move content either.
  if (type === 'contextmenu') return KEEP;
  if ((type === 'pointerdown' || type === 'pointermove') && button === 2) return KEEP;
  if (type === 'pointerdown' && button !== 0) return KEEP;
  if (type === 'pointermove' && !input.dragStarted) return KEEP;

  if (type === 'pointerdown') {
    if (input.isPlayPause) return KEEP;
    if (input.isPlayerSettings) return KEEP;
    if (input.inPlayer) {
      return Object.freeze({
        clear: true,
        reason: CV_SHOW_GESTURE_CLEAR_REASONS.transportAdvance,
      });
    }
    if (input.isDrawerToggle) {
      return Object.freeze({
        clear: true,
        reason: CV_SHOW_GESTURE_CLEAR_REASONS.panelToggle,
      });
    }
    // A pointer press only clears stale gesture graphics when it actually
    // targets a navigation/selection affordance. A neutral click on plain
    // content (no link/button/tree row/action) does not move the marked
    // content, so it must not dismiss a pause-held marker.
    if (input.isNavigationTarget) {
      return Object.freeze({
        clear: true,
        reason: CV_SHOW_GESTURE_CLEAR_REASONS.userPointer,
      });
    }
    return KEEP;
  }

  if (type === 'pointermove' && input.dragStarted) {
    return Object.freeze({
      clear: true,
      reason: CV_SHOW_GESTURE_CLEAR_REASONS.drag,
    });
  }

  if (type === 'wheel') {
    if (!(Number(input.wheelDelta) > 0)) return KEEP;
    return Object.freeze({
      clear: true,
      reason: CV_SHOW_GESTURE_CLEAR_REASONS.scroll,
    });
  }

  if (type === 'input') {
    if (!input.isTextEntry) return KEEP;
    return Object.freeze({
      clear: true,
      reason: CV_SHOW_GESTURE_CLEAR_REASONS.textInput,
    });
  }

  if (type === 'keydown') {
    if (!input.isSeekKey) return KEEP;
    return Object.freeze({
      clear: true,
      reason: CV_SHOW_GESTURE_CLEAR_REASONS.keyboardSeek,
    });
  }

  return KEEP;
}
