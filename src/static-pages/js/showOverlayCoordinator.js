/**
 * Coordinates the native overlay surfaces before a semantic Show open.
 * Layout and dock own the actual projection; this function only invokes
 * their public close APIs in a deterministic order.
 */
/** @param {{ layout?: any, outerLayout?: any, dock?: any }} options */
export function coordinatePortfolioShowOverlays({ layout, outerLayout, dock } = {}) {
  outerLayout?.closeDrawer?.('all');
  layout?.closeDrawer?.('all');
  dock?.close?.('show-overlay-coordinate');
  return true;
}
