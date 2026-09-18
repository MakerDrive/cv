/**
 * CV Show global composition time.
 *
 * ONE COMPOSITION, ONE GLOBAL PLAYHEAD: a CV Show route carries only the
 * composition identity plus ONE global composition coordinate in
 * milliseconds. Entry, branch, narration clip and local media position are
 * always DERIVED from that coordinate — never URL parameters.
 *
 * Master layout (mode-independent): each scene followed immediately by its
 * detail branch. There is only ONE segment geometry. `showMode=short` is a
 * traversal policy that skips branch segments during automatic playback;
 * `full` plays them. Neither mode relocates segments.
 *
 * Durations come from the generated schedule-durations projection of the
 * canonical Authoring Project.
 */
import { CV_SHOW_SCHEDULE_DURATIONS } from '../../data/cvShowScheduleDurations.js';

function buildSegments(ids, branchIds, durations, sceneCount) {
  let cursor = 0;
  return ids.map((id, index) => {
    const durationMs = Number(durations[id]);
    if (!Number.isSafeInteger(durationMs) || durationMs <= 0) {
      throw new TypeError(`CV Show composition timeline is missing a valid duration for "${id}"`);
    }
    const branch = branchIds.has(id);
    const entry = Object.freeze({
      id,
      startMs: cursor,
      endMs: cursor + durationMs,
      durationMs,
      branch,
      sceneIndex: !branch ? index : -1,
    });
    cursor += durationMs;
    return entry;
  });
}

/**
 * Builds THE master global composition timeline. There is intentionally no
 * mode argument: changing from short to full playback changes which
 * segments play, never where they sit in composition time.
 * @param {object} story CV Show story projection
 */
export function createCvShowCompositionTimeline(story) {
  const durations = CV_SHOW_SCHEDULE_DURATIONS.durations;
  const branchIds = new Set(Object.keys(story?.branches || {}));
  const scenes = (story?.short || []).map(String).filter(Boolean);
  if (!scenes.length) throw new TypeError('CV Show composition timeline requires story.short');
  const ordered = scenes.flatMap((sceneId) => {
    const branchId = String(story?.scenes?.find?.(({ id }) => id === sceneId)?.branchId || '');
    return branchId && branchIds.has(branchId) ? [sceneId, branchId] : [sceneId];
  });
  const segments = buildSegments(ordered, branchIds, durations, scenes.length);
  const mainEndMs = segments.filter(({ branch }) => !branch).at(-1)?.endMs ?? 0;
  return Object.freeze({
    segments,
    mainEndMs,
    totalMs: segments.at(-1).endMs,
  });
}

/**
 * Resolves a global composition time to the owning segment. Values past the
 * end clamp onto the final segment (`completed: true`).
 * @param {ReturnType<typeof createCvShowCompositionTimeline>} timeline
 * @param {number} globalTimeMs
 */
export function resolveCvShowCompositionAt(timeline, globalTimeMs) {
  const segments = timeline?.segments || [];
  if (!segments.length) return null;
  const t = Math.max(0, Math.round(Number(globalTimeMs) || 0));
  const index = segments.findIndex(({ endMs }) => t < endMs);
  const segment = segments[index < 0 ? segments.length - 1 : index];
  const localMs = Math.max(0, Math.min(segment.durationMs, t - segment.startMs));
  return Object.freeze({
    entryId: segment.id,
    detailId: segment.branch ? segment.id : '',
    sceneId: segment.branch ? '' : segment.id,
    localMs,
    globalTimeMs: segment.startMs + localMs,
    startMs: segment.startMs,
    endMs: segment.endMs,
    durationMs: segment.durationMs,
    branch: segment.branch,
    completed: index < 0,
  });
}

/**
 * Canonical inverse of resolveCvShowCompositionAt: the global composition
 * coordinate of `entryId` at `localMs`.
 */
export function cvShowGlobalTimeOf(timeline, entryId, localMs = 0) {
  const segment = timeline?.segments?.find(({ id }) => id === entryId);
  if (!segment) return 0;
  return segment.startMs + Math.max(0, Math.min(segment.durationMs, Math.round(Number(localMs) || 0)));
}
