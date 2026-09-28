/**
 * CV Show player timeline projection.
 *
 * The player renders its clock, its segmented bar and its progress-bar seek
 * from ONE timeline, and the route's `showTime` is a global composition
 * coordinate. Both therefore read on the same clock: every turn declares the
 * composition span it occupies, and the timeline declares the composition
 * total. A `short` traversal simply leaves the detail-branch spans unplayed —
 * the player renders them as gaps instead of shortening the show.
 *
 * Pure and DOM-free, so the link contract (URL coordinate == visible clock) is
 * testable without a browser.
 */
import { createCvShowCompositionTimeline } from './compositionTime.js';
import { createCvShowPlaybackEntries } from './presentationContext.js';
import { CV_SHOW_SCHEDULE_DURATIONS } from '../../data/cvShowScheduleDurations.js';
import { CV_SHOW_WEB_AUDIO_RELEASE } from '../../data/cvShowWebAudioRelease.js';

/**
 * @param {any} story CV Show story projection
 * @param {'short' | 'full'} [mode] traversal policy
 * @param {Map<string, number>} [projectDurations] runtime-measured overrides
 * @param {Map<string, string>} [detailReplacements] scene id → chosen branch id
 */
export function playerTimeline(
  story,
  mode = 'short',
  projectDurations = new Map(),
  detailReplacements = new Map(),
) {
  // Generated durations are only the generated schedule's claim when the audio
  // release they were derived from is still the release the page plays.
  const knownDurations = String(CV_SHOW_SCHEDULE_DURATIONS.releaseId) === String(CV_SHOW_WEB_AUDIO_RELEASE.releaseId)
    ? CV_SHOW_SCHEDULE_DURATIONS.durations
    : {};
  const entries = createCvShowPlaybackEntries(story, mode);
  const composition = createCvShowCompositionTimeline(story);
  const compositionStartMs = new Map(
    composition.segments.map(({ id, startMs }) => [id, startMs]),
  );
  // In `full` the detail branch already is a turn of its own, so a replaced
  // scene must not be re-seated onto the branch span: that would place two
  // turns on one composition span and make the second unreachable by seek.
  const playsOwnBranch = new Set(entries.map(({ id }) => id));
  return Object.freeze({
    title: 'CV Show',
    totalMs: composition.totalMs,
    turns: Object.freeze(entries.map((entry) => {
      const replacementId = detailReplacements.get(entry.id) || '';
      const replacement = entry.branchId === replacementId && !playsOwnBranch.has(replacementId)
        ? story?.branches?.[replacementId]
        : null;
      const durationEntry = replacement || entry;
      const durationMs = Number(projectDurations.get(durationEntry.id) ?? knownDurations[durationEntry.id]);
      const startMs = compositionStartMs.get(durationEntry.id);
      return Object.freeze({
        id: entry.id,
        persona: entry.sceneId ? 'Detail' : 'CV',
        text: entry.title || entry.id,
        // Omitted when the turn has no composition seat: an incomplete absolute
        // base makes the player fall back to its own contiguous clock rather
        // than project a position that was never composed.
        ...(Number.isFinite(startMs) ? { startMs } : {}),
        durationMs: Number.isFinite(durationMs) && durationMs > 0 ? durationMs : null,
      });
    })),
  });
}
