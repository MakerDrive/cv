/**
 * Quiet state restoration shared between the aligned-entry driver and the
 * directive runner.
 *
 * Loading a page with a deep link, resuming a paused checkpoint and replaying
 * the authored setup cells before narration all re-establish an already
 * reached application state. Those replays must never emit decorative user
 * gestures (cursor travel, synthetic clicks): the click visual is reserved
 * for a genuine authored action the audience can watch happen.
 *
 * The flag lives in a tiny module because the replay originates in
 * `showAlignmentAdapter` (setup sample replay, held-checkpoint restore) while
 * the gestures originate in `showAdapter`/the portfolio tour surface; both
 * sides converge within one JavaScript context, so a simple depth counter is
 * a correct and testable bridge. The holder awaits the replay completion
 * (`execution.whenIdle()`) before releasing the flag, so asynchronous act
 * phases of the replayed cells are fully covered.
 */
let quietRestoreDepth = 0;

export function isCvShowQuietRestoreActive() {
  return quietRestoreDepth > 0;
}

export async function runCvShowQuietRestore(work) {
  quietRestoreDepth += 1;
  try {
    return await work();
  } finally {
    quietRestoreDepth -= 1;
  }
}
