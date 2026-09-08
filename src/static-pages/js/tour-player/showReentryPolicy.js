/**
 * Pure decision helper for stale CV Show chat actions after the player closes.
 *
 * Root cause: closing the player removes the shared library embed
 * (`AgentShowChat.removeShow`) and stops the show through its controller, but
 * the chat history keeps the message action buttons alive. The library keeps
 * delivering `agent-show-action` for those stale buttons while
 * `getShowPlayer()` is null, and nobody re-creates the embed: `#resume`
 * guards on the live `resumeRequired` flag and `#returnFromDetails` guards on
 * the live `inBranch` flag, so both intents die silently on a stopped show.
 * The player never remounts and playback never continues.
 *
 * Contract: a stale `resume` or `return` against a fully stopped show
 * (`!running && !mode`) is a Short Show re-entry intent — remount the player
 * and play from the start. Anything live keeps the existing live path, and
 * any other stopped-state action stays ignored.
 *
 * Node-safe and free of DOM dependencies.
 */

export const CV_SHOW_REENTRY_DECISION = Object.freeze({
  RESTART_SHORT: 'restart-short',
  CONTINUE_LIVE: 'continue-live',
  IGNORE: 'ignore',
});

/**
 * @param {{
 *   actionId?: string,
 *   running?: boolean,
 *   mode?: string,
 *   inBranch?: boolean,
 * }} [state]
 */
export function resolveCvShowChatReentry(state = {}) {
  const actionId = String(state.actionId || '');
  const stopped = !state.running && !state.mode;
  if (!stopped) {
    // Live show (running or paused-with-mode): resume/return keep their live
    // handlers. A stale `return` outside a branch is meaningless while the
    // Short Show owns the player, so it stays ignored.
    if (actionId === 'return' && !state.inBranch) return CV_SHOW_REENTRY_DECISION.IGNORE;
    return CV_SHOW_REENTRY_DECISION.CONTINUE_LIVE;
  }
  // Stopped show (player closed and removed): only resume/return re-enter.
  if (actionId === 'resume' || actionId === 'return') return CV_SHOW_REENTRY_DECISION.RESTART_SHORT;
  return CV_SHOW_REENTRY_DECISION.IGNORE;
}
