/**
 * Gallery checkpoint frame.
 *
 * A gallery montage is an authored sequence: it opens the gallery, presents the
 * authored frames one at a time for their hold, and leaves the frame the
 * audience was reading. A paused deep link, a reload and a seek all land in the
 * middle of such a sequence, and restoring the position must not replay it —
 * re-running the montage would present every frame again and would present
 * clicks the audience never made.
 *
 * This is the pure projection of that contract: given the authored montage
 * geometry and the checkpoint time, which frame was on screen. Pure, so the
 * restore decision is testable without a gallery, a timer or a browser.
 *
 * Known approximation, stated rather than hidden: the index counts only frame
 * holds, so a checkpoint in the opening expand gesture reads one frame AHEAD of
 * what the audience was last shown. The skew is bounded by that gesture
 * (authored 800 ms) and a wrong frame is a cosmetic restatement of a position
 * the show then plays from correctly, which is why it is documented instead of
 * guessed at with an unverifiable cursor-travel duration.
 */
import { MIN_GALLERY_FRAME_HOLD_MS } from './imsShowMediaAdapter.js';

/**
 * @param {{
 *   cellStartMs?: number,
 *   gestureDurationMs?: number,
 *   frames?: readonly number[],
 *   frameHoldMs?: number,
 *   checkpointMs?: number,
 * }} input
 * @returns {{ frame: number, index: number, overlayOpen: boolean } | null}
 *   null when the checkpoint is outside the montage window — the gallery then
 *   keeps the state the show found, which is not a frame decision.
 */
export function resolveCvShowGalleryCheckpoint({
  cellStartMs = 0,
  gestureDurationMs = 0,
  frames = [],
  frameHoldMs = 0,
  checkpointMs = 0,
} = {}) {
  const authored = Array.from(frames || [], Number).filter((frame) => Number.isFinite(frame) && frame >= 1);
  if (!authored.length) return null;
  const startMs = Number(cellStartMs) || 0;
  const durationMs = Number(gestureDurationMs) || 0;
  const at = Number(checkpointMs) || 0;
  if (durationMs <= 0) return null;
  // Before the montage starts or after it has finished, the gallery is not
  // showing a montage frame: the pre-montage state is the honest answer.
  if (at < startMs || at >= startMs + durationMs) return null;
  const holdMs = Math.max(MIN_GALLERY_FRAME_HOLD_MS, Number(frameHoldMs) || 0);
  const index = Math.min(
    authored.length - 1,
    Math.max(0, Math.floor((at - startMs) / holdMs)),
  );
  return Object.freeze({
    frame: authored[index],
    index,
    // The montage holds the gallery expanded for its whole sequence, so a
    // checkpoint inside it is an expanded gallery.
    overlayOpen: true,
  });
}
