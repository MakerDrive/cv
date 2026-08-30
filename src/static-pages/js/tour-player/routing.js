export const CV_SHOW_ROUTE_PARAMS = Object.freeze([
  'showMode',
  'showEntry',
  'showTime',
  'showDetail',
  'showPlay',
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

function knownEntry(policy, mode, entryId) {
  const entries = policy.entryIdsByMode?.[mode];
  return entries?.has?.(entryId) ?? true;
}

function knownDetailParent(policy, detailId) {
  return policy.detailParents?.[detailId];
}

function validDetail(policy, detailId, entryId) {
  return knownDetailParent(policy, detailId) === entryId;
}

function knownDuration(policy, state) {
  return Number(policy.getDurationMs?.(state));
}

function canonicalState({ mode, entryId, timeMs, detailId, play }) {
  return Object.freeze({
    mode,
    entryId,
    timeMs,
    detailId,
    play,
  });
}

function writeState(url, state) {
  const nextUrl = stripCvShowRoute(url);
  nextUrl.searchParams.set('showMode', state.mode);
  nextUrl.searchParams.set('showEntry', state.entryId);
  if (state.timeMs > 0) nextUrl.searchParams.set('showTime', String(state.timeMs));
  if (state.detailId) nextUrl.searchParams.set('showDetail', state.detailId);
  if (!state.play) nextUrl.searchParams.set('showPlay', '0');
  return nextUrl;
}

/**
 * Parse and validate a CV Show URL without reading browser state.
 *
 * @param {string | URL} value
 * @param {{
 *   baseUrl?: string | URL,
 *   entryIdsByMode?: { short?: any, full?: any },
 *   detailParents?: Record<string, string>,
 *   getDurationMs?: (state: any) => number,
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

  const entryId = String(params.get('showEntry') || '').trim();
  if (!entryId || !knownEntry(policy, mode, entryId)) {
    return invalidResult('invalid-entry', url);
  }

  const rawTime = params.get('showTime');
  if (rawTime !== null && !NON_NEGATIVE_INTEGER.test(rawTime)) {
    return invalidResult('invalid-time', url);
  }
  let timeMs = rawTime === null ? 0 : Number(rawTime);
  if (!Number.isSafeInteger(timeMs)) return invalidResult('invalid-time', url);

  const detailId = String(params.get('showDetail') || '').trim();
  if (detailId) {
    if (mode !== 'short') return invalidResult('detail-requires-short-mode', url);
    if (!validDetail(policy, detailId, entryId)) {
      return invalidResult('invalid-detail', url);
    }
  }

  const rawPlay = params.get('showPlay');
  if (rawPlay !== null && rawPlay !== '0' && rawPlay !== '1') {
    return invalidResult('invalid-play-intent', url);
  }
  const play = rawPlay !== '0';
  const unclamped = { mode, entryId, timeMs, detailId, play };
  const durationMs = knownDuration(policy, unclamped);
  if (Number.isFinite(durationMs) && durationMs >= 0) {
    timeMs = Math.min(timeMs, Math.floor(durationMs));
  }

  return frozenResult({
    status: 'valid',
    reason: '',
    state: canonicalState({ mode, entryId, timeMs, detailId, play }),
    shouldStrip: false,
    url,
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
 * Serialize a validated semantic Show state into an existing URL.
 * Default time and play intent are omitted from the canonical form.
 */
export function serializeCvShowRoute(value, state, policy = {}) {
  const draft = stripCvShowRoute(value, { baseUrl: policy.baseUrl });
  draft.searchParams.set('showMode', String(state?.mode || ''));
  draft.searchParams.set('showEntry', String(state?.entryId || ''));
  if (Number(state?.timeMs) !== 0) draft.searchParams.set('showTime', String(state?.timeMs));
  if (state?.detailId) draft.searchParams.set('showDetail', String(state.detailId));
  if (state?.play === false) draft.searchParams.set('showPlay', '0');
  const parsed = parseCvShowRoute(draft, policy);
  if (parsed.status !== 'valid') {
    throw new TypeError(`Invalid CV Show route state: ${parsed.reason}`);
  }
  return writeState(draft, parsed.state);
}

/**
 * Return a canonical URL. Invalid Show state is removed without touching other
 * query parameters or the hash.
 */
export function canonicalizeCvShowRoute(value, policy = {}) {
  const original = toUrl(value, policy.baseUrl);
  const parsed = parseCvShowRoute(original, policy);
  const url = parsed.status === 'valid'
    ? writeState(original, parsed.state)
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
