export const PORTFOLIO_LAYOUT_MIN_INLINE_SIZE = 960;
export const PORTFOLIO_LAYOUT_RESPONSIVE_BREAKPOINT = 760;
export const PORTFOLIO_TREE_PANEL_IMPORTANCE = 82;
export const PORTFOLIO_TREE_PANEL_MIN_INLINE_SIZE = 180;
export const PORTFOLIO_GRAPH_PANEL_IMPORTANCE = 70;
export const PORTFOLIO_GRAPH_PANEL_MIN_INLINE_SIZE = 320;
export const PORTFOLIO_VIEWER_PANEL_MIN_INLINE_SIZE = 320;
export const PORTFOLIO_CONTENT_SPLIT_RATIO = 0.5;
export const PORTFOLIO_DEFAULT_GRAPH_VIEW_MODE = 'structured';
export const PORTFOLIO_STRUCTURED_LAYOUT_ROOT_ID = 'profile/photo';
export const PORTFOLIO_STRUCTURED_LAYOUT_IDS = Object.freeze(['crystal', 'auto', 'tree']);
export const PORTFOLIO_DEFAULT_STRUCTURED_LAYOUT = 'crystal';
export const PORTFOLIO_MEDIA_IMAGE_NODE_WEIGHT = 1.6;
export const PORTFOLIO_MEDIA_PULSE_NODE_WEIGHT = 1.25;
export const PORTFOLIO_PROFILE_MEDIA_HUB_WEIGHT = 1.8;
export const PORTFOLIO_MEDIA_HUB_WEIGHT_CAP = 1.8;
export const PORTFOLIO_MEDIA_ACTIVE_NODE_SCALE = 1.5;
export const PORTFOLIO_MEDIA_INFO_PANEL_SCALE = 1;
export const PORTFOLIO_MEDIA_FOCUS_ZOOM = 1.8;
export const PORTFOLIO_MEDIA_FORCE_LAYOUT_OPTIONS = Object.freeze({
  layoutAlgorithm: 'crystal',
  chargeStrength: -110,
  linkDistance: 72,
  groupDistance: 90,
  collideStrength: 1.2,
  wellRepulsion: 7.5,
  crystalStrength: 0.16,
  crystalRingDistance: 42,
  crystalSpokes: 6,
  crystalAngleJitter: 0.08,
});

export function getPortfolioMediaHubWeight(childCount = 0) {
  return Math.min(
    PORTFOLIO_MEDIA_HUB_WEIGHT_CAP,
    1.2 + Math.sqrt(Math.max(1, childCount)) * 0.22
  );
}
