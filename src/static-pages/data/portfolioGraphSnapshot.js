import {
  NODE_CANVAS_ROUTE_FINGERPRINT_SCHEMA,
  matchNodeCanvasRouteFingerprint,
  validateNodeCanvasRenderSnapshot,
} from 'symbiote-ui/manifest';

export const PORTFOLIO_GRAPH_SNAPSHOT_MANIFEST_SCHEMA =
  'portfolio-graph-snapshot-manifest-v2';
export const PORTFOLIO_GRAPH_SNAPSHOT_VISUAL_LAYER = 'connections-only';
export const PORTFOLIO_GRAPH_SNAPSHOT_VARIANTS = Object.freeze({
  locales: Object.freeze(['en', 'ru', 'es']),
  themes: Object.freeze(['light', 'dark']),
  viewports: Object.freeze(['wide', 'narrow']),
});
export const PORTFOLIO_GRAPH_SNAPSHOT_PROVIDER = Object.freeze({
  package: 'symbiote-ui',
  packageVersion: '0.3.0-alpha.71',
  router: 'node-canvas-pcb',
  routerVersion: '1',
});

function canonicalize(value) {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (!value || typeof value !== 'object') return value;
  let result = {};
  for (let key of Object.keys(value).sort()) result[key] = canonicalize(value[key]);
  return result;
}

/**
 * @param {unknown} value
 * @returns {string}
 */
export function serializePortfolioGraphSnapshotValue(value) {
  return JSON.stringify(canonicalize(value));
}

/**
 * @param {unknown} value
 * @returns {string}
 */
export function hashPortfolioGraphSnapshotValue(value) {
  let source = serializePortfolioGraphSnapshotValue(value);
  let high = 0xcbf29ce4;
  let low = 0x84222325;
  for (let index = 0; index < source.length; index++) {
    low ^= source.charCodeAt(index);
    let nextLow = Math.imul(low, 0x1b3);
    let carry = (nextLow / 0x100000000) >>> 0;
    low = nextLow >>> 0;
    high = (Math.imul(high, 0x1b3) + carry) >>> 0;
  }
  return `fnv1a64-${high.toString(16).padStart(8, '0')}${low.toString(16).padStart(8, '0')}`;
}

/**
 * @param {{from: string, to: string, kind?: string, direction?: string}} edge
 * @returns {string}
 */
export function createPortfolioGraphConnectionId(edge) {
  let digest = hashPortfolioGraphSnapshotValue({
    from: edge.from,
    to: edge.to,
    kind: edge.kind || '',
    direction: edge.direction || '',
  }).slice('fnv1a64-'.length);
  return `conn_${digest}`;
}

/**
 * @param {object} parts
 * @returns {object}
 */
export function createPortfolioGraphRouteFingerprint(parts) {
  return {
    schema: NODE_CANVAS_ROUTE_FINGERPRINT_SCHEMA,
    provider: PORTFOLIO_GRAPH_SNAPSHOT_PROVIDER,
    canonicalGraph: hashPortfolioGraphSnapshotValue(parts.canonicalGraph),
    localeContent: hashPortfolioGraphSnapshotValue(parts.localeContent),
    nodePositions: hashPortfolioGraphSnapshotValue(parts.nodePositions),
    nodeSizes: hashPortfolioGraphSnapshotValue(parts.nodeSizes),
    fontMetrics: hashPortfolioGraphSnapshotValue(parts.fontMetrics),
  };
}

/**
 * @param {object} manifest
 * @returns {{valid: boolean, reason: string, manifest: object|null}}
 */
export function validatePortfolioGraphSnapshotManifest(manifest) {
  if (!manifest || typeof manifest !== 'object' || Array.isArray(manifest)) {
    return { valid: false, reason: 'manifest-object', manifest: null };
  }
  if (manifest.schema !== PORTFOLIO_GRAPH_SNAPSHOT_MANIFEST_SCHEMA) {
    return { valid: false, reason: 'manifest-schema', manifest: null };
  }
  if (manifest.visualLayer !== PORTFOLIO_GRAPH_SNAPSHOT_VISUAL_LAYER) {
    return { valid: false, reason: 'manifest-visual-layer', manifest: null };
  }
  if (!Array.isArray(manifest.entries)) {
    return { valid: false, reason: 'manifest-entries', manifest: null };
  }
  let keys = new Set();
  let entries = [];
  for (let entry of manifest.entries) {
    let validVariant = entry && typeof entry === 'object'
      && PORTFOLIO_GRAPH_SNAPSHOT_VARIANTS.locales.includes(entry.locale)
      && PORTFOLIO_GRAPH_SNAPSHOT_VARIANTS.themes.includes(entry.theme)
      && PORTFOLIO_GRAPH_SNAPSHOT_VARIANTS.viewports.includes(entry.viewport);
    let key = validVariant ? `${entry.locale}:${entry.viewport}:${entry.theme}` : '';
    if (
      !key
      || keys.has(key)
      || typeof entry.svg !== 'string'
      || !/^portfolio-graph-snapshots\/[a-f0-9]{64}\.svg$/.test(entry.svg)
      || typeof entry.snapshot !== 'string'
      || !/^portfolio-graph-snapshots\/[a-f0-9]{64}\.snapshot\.json$/.test(entry.snapshot)
      || !entry.routeFingerprint
    ) {
      return { valid: false, reason: `manifest-entry:${key || 'invalid'}`, manifest: null };
    }
    keys.add(key);
    entries.push({ ...entry, key });
  }
  return {
    valid: true,
    reason: '',
    manifest: {
      schema: PORTFOLIO_GRAPH_SNAPSHOT_MANIFEST_SCHEMA,
      visualLayer: PORTFOLIO_GRAPH_SNAPSHOT_VISUAL_LAYER,
      entries,
    },
  };
}

/**
 * @param {object} manifest
 * @param {{locale: string, theme: string, viewport: string}} variant
 * @returns {object|null}
 */
export function selectPortfolioGraphSnapshotEntry(manifest, variant) {
  let validation = validatePortfolioGraphSnapshotManifest(manifest);
  if (!validation.valid) return null;
  let key = `${variant.locale}:${variant.viewport}:${variant.theme}`;
  return validation.manifest.entries.find((entry) => entry.key === key) || null;
}

/**
 * @param {object} snapshot
 * @param {object} routeFingerprint
 * @returns {{valid: boolean, reason: string, snapshot: object|null}}
 */
export function validatePortfolioGraphSnapshotBinding(snapshot, routeFingerprint) {
  let validation = validateNodeCanvasRenderSnapshot(snapshot);
  if (!validation.valid) {
    return { valid: false, reason: validation.reason, snapshot: null };
  }
  if (!matchNodeCanvasRouteFingerprint(validation.snapshot.routeFingerprint, routeFingerprint)) {
    return { valid: false, reason: 'route-fingerprint-mismatch', snapshot: null };
  }
  return { valid: true, reason: '', snapshot: validation.snapshot };
}
