/**
 * Pure decision helpers for CV Show panel reveal logic.
 *
 * The show action adapter decides whether a narrated action must reveal a
 * layout panel before acting on its content. On the responsive (drawer)
 * workspace the primary panel is always the visible host surface: an
 * article/profile target that lives in the primary must never open a drawer,
 * otherwise the tour would force the map (the end drawer) over the
 * description it is narrating. Drawer panels (tree at `start`, graph/theme at
 * `end`) are revealed only when they are actually closed, and the desktop
 * state follows the visible/collapsed panel state.
 *
 * Node-safe and free of DOM dependencies.
 */

/**
 * @param {{
 *   mobile?: boolean,
 *   mobileDock?: string,
 *   collapsed?: boolean,
 *   drawerStartOpen?: boolean,
 *   drawerEndOpen?: boolean,
 *   activeStartPanelId?: string,
 *   activeEndPanelId?: string,
 *   panelId?: string,
 *   visible?: boolean,
 * }} [state]
 */
export function resolveCvShowPanelRevealState(state = {}) {
  const mobile = Boolean(state.mobile);
  const mobileDock = String(state.mobileDock || '');
  const panelId = String(state.panelId || '');
  const drawerDock = mobileDock === 'start' || mobileDock === 'end' ? mobileDock : '';
  const primarySurface = mobile && !drawerDock;

  if (primarySurface) {
    // The primary surface is the always-visible host of the narrated content.
    return Object.freeze({ dock: '', open: true, primary: true });
  }

  if (mobile) {
    const dock = drawerDock || 'end';
    const drawerOpen = dock === 'start'
      ? Boolean(state.drawerStartOpen)
      : Boolean(state.drawerEndOpen);
    const activeDrawerId = dock === 'start'
      ? String(state.activeStartPanelId || '')
      : String(state.activeEndPanelId || '');
    return Object.freeze({
      dock,
      open: Boolean(drawerOpen) && (!activeDrawerId || activeDrawerId === panelId),
      primary: false,
    });
  }

  return Object.freeze({
    dock: drawerDock || 'end',
    open: Boolean(state.visible !== false) && state.collapsed !== true,
    primary: false,
  });
}
