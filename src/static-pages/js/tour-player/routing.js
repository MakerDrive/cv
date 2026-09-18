/**
 * CV Show routing around GLOBAL COMPOSITION TIME.
 *
 * Canonical URL contract (show playback):
 *   ?showMode=short|full&showTime=<global composition ms>[&showPlay=0][&showCompleted=1]
 *
 * The URL never names an entry, branch, clip or local position: those are
 * DERIVED through resolveCvShowCompositionAt(). Legacy links that still
 * carry showEntry/showDetail are converted once and replaced with the
 * canonical global coordinate (history.replaceState, no extra navigation).
 */
import {
  createCvShowCompositionTimeline,
  cvShowGlobalTimeOf,
  resolveCvShowCompositionAt,
} from './compositionTime.js';

export const CV_SHOW_ROUTE_PARAMS = Object.freeze([
  'showMode',
  'showEntry',
  'showTime',
  'showDetail',
  'showPlay',
  'showCompleted',
]);

const CV_SHOW_MODES = new Set(['short', 'full']);
const NON_NEGATIVE_INTEGER = /^(?:0|[1-9]\d*)$/u;

function toUrl(value, baseUrl) {
  return new URL(String(value), baseUrl);
}

function frozenResult(value) {
  return Object.freeze(value);
}

function invalidResult(reason, url) {
  return frozenResult({
    status: 'invalid',
    reason,
    state: null,
    shouldStrip: true,
    url,
  });
}

function hasDuplicateShowParam(searchParams) {
  return CV_SHOW_ROUTE_PARAMS.some((name) => searchParams.getAll(name).length > 1);
}

/**
 * Parse and validate a CV Show URL against the global composition timeline.
 *
 * `showTime` is the single playback coordinate: global composition time in
 * milliseconds. `showEntry`/`showDetail` are accepted ONLY as a legacy
 * bridge and are converted to the canonical global coordinate; the returned
 * state always exposes derived entry/detail/local fields so callers never
 * re-parse the URL.
 *
 * @param {string | URL} value
 * @param {{
 *   baseUrl?: string | URL,
 *   timeline?: object,
 *   story?: object,
 * }} [policy]
 */
export function parseCvShowRoute(value, policy = {}) {
  const url = toUrl(value, policy.baseUrl);
  const params = url.searchParams;
  const hasShowParam = CV_SHOW_ROUTE_PARAMS.some((name) => params.has(name));
  if (!hasShowParam) {
    return frozenResult({
      status: 'absent',
      reason: '',
      state: null,
      shouldStrip: false,
      url,
    });
  }
  if (hasDuplicateShowParam(params)) return invalidResult('duplicate-parameter', url);

  const mode = params.get('showMode') || '';
  if (!CV_SHOW_MODES.has(mode)) return invalidResult('invalid-mode', url);

  const timeline = policy.timeline
    || (policy.story ? createCvShowCompositionTimeline(policy.story) : null);
  if (!timeline) return invalidResult('timeline-unavailable', url);

  const rawTime = params.get('showTime');
  if (rawTime !== null && !NON_NEGATIVE_INTEGER.test(rawTime)) {
    return invalidResult('invalid-time', url);
  }
  let timeMs = rawTime === null ? 0 : Number(rawTime);
  if (!Number.isSafeInteger(timeMs)) return invalidResult('invalid-time', url);
  timeMs = Math.min(timeMs, timeline.totalMs);

  const legacyEntryId = String(params.get('showEntry') || '').trim();
  const legacyDetailId = String(params.get('showDetail') || '').trim();
  let legacyTimeMs = 0;
  if (legacyEntryId || legacyDetailId) {
    // Legacy bridge: the URL carries a local position inside a named entry.
    legacyTimeMs = timeMs;
    timeMs = cvShowGlobalTimeOf(timeline, legacyDetailId || legacyEntryId, legacyTimeMs);
    if (legacyDetailId) {
      // Legacy detail links only exist for short mode.
      if (mode !== 'short') return invalidResult('detail-requires-short-mode', url);
    }
  }

  const rawPlay = params.get('showPlay');
  if (rawPlay !== null && rawPlay !== '0' && rawPlay !== '1') {
    return invalidResult('invalid-play-intent', url);
  }
  const play = rawPlay !== '0';

  const rawCompleted = params.get('showCompleted');
  if (rawCompleted !== null && rawCompleted !== '0' && rawCompleted !== '1') {
    return invalidResult('invalid-completed', url);
  }
  const completed = rawCompleted === '1';

  const resolution = resolveCvShowCompositionAt(timeline, timeMs);
  if (!resolution) return invalidResult('timeline-unavailable', url);

  return frozenResult({
    status: 'valid',
    reason: '',
    state: Object.freeze({
      mode,
      timeMs,
      localMs: resolution.localMs,
      entryId: resolution.sceneId || resolution.detailId,
      detailId: resolution.detailId,
      play,
      completed,
    }),
    shouldStrip: false,
    url,
    legacy: Boolean(legacyEntryId || legacyDetailId),
  });
}

/**
 * Remove only CV Show parameters while preserving the rest of the URL.
 * @param {string | URL} value
 * @param {{ baseUrl?: string | URL }} [options]
 */
export function stripCvShowRoute(value, { baseUrl } = {}) {
  const url = toUrl(value, baseUrl);
  for (const name of CV_SHOW_ROUTE_PARAMS) url.searchParams.delete(name);
  return url;
}

/**
 * Serialize a global composition position into the canonical show URL.
 * The URL names ONLY the composition identity (mode) and the global time;
 * entry/detail are never written — they are derived at parse time. Zero
 * time is omitted (show start is the default). play defaults to true.
 */
export function serializeCvShowRoute(value, state, policy = {}) {
  const draft = stripCvShowRoute(value, { baseUrl: policy.baseUrl });
  draft.searchParams.set('showMode', String(state?.mode || ''));
  if (Number(state?.timeMs) > 0) draft.searchParams.set('showTime', String(Math.round(state.timeMs)));
  if (state?.play === false) draft.searchParams.set('showPlay', '0');
  if (state?.completed === true) draft.searchParams.set('showCompleted', '1');
  return draft;
}

/**
 * Return a canonical URL. Invalid Show state is removed without touching
 * other query parameters or the hash; legacy entry/detail parameters are
 * rewritten to the canonical global coordinate.
 */
export function canonicalizeCvShowRoute(value, policy = {}) {
  const original = toUrl(value, policy.baseUrl);
  const parsed = parseCvShowRoute(original, policy);
  const url = parsed.status === 'valid'
    ? serializeCvShowRoute(original, parsed.state, policy)
    : parsed.status === 'invalid' ? stripCvShowRoute(original) : original;
  return frozenResult({
    ...parsed,
    url,
    changed: url.href !== original.href,
  });
}

/**
 * Serializes the observable result of asynchronous route applications without
 * blocking a newer browser navigation behind stale media preparation. Older
 * operations may settle, but only the latest request can publish success.
 */
export function createCvShowRouteRequestCoordinator() {
  let requestId = 0;
  let activeCount = 0;
  return Object.freeze({
    get applying() {
      return activeCount > 0;
    },
    cancel() {
      requestId += 1;
    },
    async run(operation) {
      if (typeof operation !== 'function') {
        throw new TypeError('CV Show route operation must be a function');
      }
      const activeRequestId = ++requestId;
      activeCount += 1;
      try {
        const result = await operation();
        return activeRequestId === requestId ? result : false;
      } catch (error) {
        if (activeRequestId !== requestId) return false;
        throw error;
      } finally {
        activeCount = Math.max(0, activeCount - 1);
      }
    },
  });
}

/** Build the durable portfolio-target -> scene-id map from semantic navigation directives. */
export function createCvShowSceneRouteMap(story) {
  const routes = new Map();
  for (const scene of story?.scenes || []) {
    const entryId = String(scene?.id || '').trim();
    if (!entryId) continue;
    for (const directive of scene?.directives || []) {
      if (directive?.type !== 'navigate') continue;
      const targetId = String(directive.target || '').replace(/^\/+|\/+$/gu, '');
      if (!targetId) continue;
      const previous = routes.get(targetId);
      if (previous && previous !== entryId) {
        throw new TypeError(`Ambiguous CV Show route target: ${targetId}`);
      }
      routes.set(targetId, entryId);
    }
  }
  return routes;
}

/** Resolve a page or its explicit owning project to a semantic Show scene. */
export function resolveCvShowEntryForPortfolioRoute(story, routeId, { ownerProjectId = '' } = {}) {
  const routes = createCvShowSceneRouteMap(story);
  const candidates = [routeId, ownerProjectId]
    .map((value) => String(value || '').replace(/^\/+|\/+$/gu, ''))
    .filter(Boolean);
  for (const candidate of candidates) {
    const entryId = routes.get(candidate);
    if (entryId) return entryId;
  }
  return '';
}
