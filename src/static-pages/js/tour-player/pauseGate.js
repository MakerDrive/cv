/**
 * CV Show pause gate.
 *
 * The transport pause and every effect it freezes share one fact: whether the
 * show may spend wall-clock time right now. A suspended effect must neither
 * advance nor burn its authored budget — a two-second gallery frame hold is
 * still two seconds of viewing after the resume, not two seconds less, and a
 * montage stays on the frame the audience was reading.
 *
 * One gate per show session. It is the transport's single answer to "time is
 * stopped", so the gallery clock, the spinner rotation and any later timed
 * effect read the same state instead of each inventing its own pause flag.
 */
export function createCvShowPauseGate() {
  let paused = false;
  const listeners = new Set();
  const notify = () => {
    for (const listener of [...listeners]) listener({ paused });
  };

  return Object.freeze({
    get paused() {
      return paused;
    },
    pause() {
      if (paused) return;
      paused = true;
      notify();
    },
    resume() {
      if (!paused) return;
      paused = false;
      notify();
    },
    /**
     * Subscribes to gate transitions (immediately and on every change).
     * Timed effects that must bank their remaining budget — the gallery frame
     * hold is the one — subscribe here rather than polling `paused`.
     * @returns {() => void} unsubscribe
     */
    subscribe(listener) {
      if (typeof listener !== 'function') return () => {};
      listeners.add(listener);
      listener({ paused });
      return () => listeners.delete(listener);
    },
  });
}
