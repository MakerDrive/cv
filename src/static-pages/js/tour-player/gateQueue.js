/**
 * CV Show gate queue (Slice C). A live `ensure(target, state, { sync: 'gate' })`
 * does NOT invoke a transition immediately: it registers a pending gate. At
 * the next safe composition boundary (no active presentation cell) the
 * playback pump pauses, runs the queue against the SAME ensure runtime as
 * the non-gated path, and resumes. Each pending request resolves with its
 * own ensure result; a failing gate reports one aggregate failure to the
 * pump so recovery policy (pause-report) applies.
 */

export function createCvShowGateQueue() {
  const pending = [];
  return Object.freeze({
    /**
     * @param {{ targetId: string, state: Record<string, unknown> }} request
     * @param {(targetId: string, state: Record<string, unknown>, options?: object) => Promise<object>|object} ensureRuntime
     */
    register(request, ensureRuntime) {
      return new Promise((resolve, reject) => {
        pending.push({ request, ensureRuntime, resolve, reject });
      });
    },
    /** True when at least one gate is waiting for a boundary. */
    get hasPending() {
      return pending.length > 0;
    },
    /**
     * Runs every pending gate through its registered ensure runtime in
     * registration order. Individual failures resolve the gate promise with
     * the failed ensure result; the aggregate result carries the first
     * failure for the pump's recovery decision.
     */
    async run() {
      const items = pending.splice(0, pending.length);
      let firstFailure = null;
      for (const item of items) {
        try {
          const result = await item.ensureRuntime(
            item.request.targetId,
            item.request.state,
            { sync: 'gate' },
          );
          const ok = result?.status === 'achieved'
            || result?.status === 'already-satisfied';
          if (!ok && !firstFailure) firstFailure = result;
          item.resolve(result);
        } catch (error) {
          if (!firstFailure) {
            firstFailure = {
              status: 'failed',
              reason: error?.code || String(error?.message || error || ''),
            };
          }
          item.reject(error);
        }
      }
      return firstFailure ? { status: 'failed', ...firstFailure } : { status: 'resolved' };
    },
  });
}

/** Process-wide queue shared by the WebMCP surface and the playback pump. */
export const CV_SHOW_GATE_QUEUE = createCvShowGateQueue();
