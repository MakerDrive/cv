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

const KEEP = Object.freeze({ clear: false, reason: CV_SHOW_GESTURE_CLEAR_REASONS.none });

/**
 * @param {{
 *   type?: string,
 *   button?: number,
 *   inPlayer?: boolean,
 *   isPlayPause?: boolean,
 *   isPlayerSettings?: boolean,
 *   isDrawerToggle?: boolean,
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
    return Object.freeze({
      clear: true,
      reason: CV_SHOW_GESTURE_CLEAR_REASONS.userPointer,
    });
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
