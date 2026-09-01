/**
 * @typedef {{
 *   cellId: string,
 *   barrier: string,
 * }} PresentationPlaybackDependency
 */

/**
 * @typedef {{
 *   id: string,
 *   kind: string,
 *   dependsOn?: PresentationPlaybackDependency[],
 *   span: { startMs: number, endMs: number },
 *   audio?: { sourceInMs: number, sourceOutMs: number },
 * }} PresentationPlaybackCell
 */

/**
 * @typedef {{
 *   terminal?: Array<{ cellId: string, status: string }>,
 *   barriers?: Array<{ cellId: string, barriers?: string[] }>,
 *   activeCellId?: string,
 *   activeOperationId?: string,
 *   activeCount?: number,
 *   mediaTimeMs?: number,
 *   state?: string,
 * }} PresentationExecutionSnapshot
 */

/**
 * @typedef {{
 *   snapshot: PresentationExecutionSnapshot,
 *   sample: (input: { mediaTimeMs: number, reason: string }) => PresentationExecutionSnapshot,
 *   whenIdle: () => Promise<PresentationExecutionSnapshot>,
 *   resume: () => any,
 *   pause: (reason?: string) => any,
 *   stop: (reason?: string) => any,
 *   dispose: (reason?: string) => any,
 * }} PresentationExecution
 */

/**
 * @typedef {{
 *   execution: PresentationExecution,
 *   playbackPlan: { cells: PresentationPlaybackCell[] },
 *   media: {
 *     currentTime: number,
 *     seeking?: boolean,
 *     pause?: () => void,
 *     addEventListener?: (type: string, listener: () => void) => void,
 *     removeEventListener?: (type: string, listener: () => void) => void,
 *   },
 *   onFailure?: ((error: any) => any) | null,
 * }} PresentationPlaybackPumpOptions
 */

function invalidPump(reason) {
  return Object.assign(new TypeError(`Presentation playback pump is invalid: ${reason}`), {
    code: 'PRESENTATION_PLAYBACK_PUMP_INVALID',
  });
}

function terminalById(snapshot) {
  return new Map((snapshot?.terminal || []).map((item) => [item.cellId, item.status]));
}

function barriersById(snapshot) {
  return new Map((snapshot?.barriers || []).map((item) => [
    item.cellId,
    new Set(item.barriers || []),
  ]));
}

function dependenciesSatisfied(cell, snapshot) {
  const barriers = barriersById(snapshot);
  return (cell.dependsOn || []).every(({ cellId, barrier }) => (
    barriers.get(cellId)?.has(barrier) === true
  ));
}

function nextExecutableCell(playbackPlan, snapshot) {
  const terminal = terminalById(snapshot);
  return playbackPlan.cells.find((cell) => (
    cell.kind !== 'narration'
    && !terminal.has(cell.id)
    && cell.id !== snapshot.activeCellId
    && dependenciesSatisfied(cell, snapshot)
  )) || null;
}

function resumedTimelinePosition(cell, snapshot, media) {
  const scheduledStartMs = Number(cell.span.startMs);
  const previousMs = Math.max(0, Number(snapshot.mediaTimeMs) || 0);
  if (cell.kind !== 'audio-clip') return Math.max(scheduledStartMs, previousMs);
  const observedSourceMs = Math.max(0, Number(media.currentTime) * 1_000 || 0);
  const { sourceInMs, sourceOutMs } = cell.audio;
  if (observedSourceMs < sourceInMs || observedSourceMs >= sourceOutMs) {
    return Math.max(scheduledStartMs, previousMs);
  }
  return Math.max(
    scheduledStartMs,
    previousMs,
    scheduledStartMs + observedSourceMs - sourceInMs,
  );
}

/**
 * Drives the shared presentation controller through its canonical playback
 * plan. It owns no independent timers: every next cell is admitted only after
 * the controller has observed the exact dependency barrier from the preceding
 * Project layer cell.
 *
 * @param {PresentationPlaybackPumpOptions} [options]
 */
export function createPresentationPlaybackPump({
  execution,
  playbackPlan,
  media,
  onFailure = null,
} = /** @type {PresentationPlaybackPumpOptions} */ ({})) {
  if (
    !execution?.snapshot
    || typeof execution.sample !== 'function'
    || typeof execution.whenIdle !== 'function'
    || !Array.isArray(playbackPlan?.cells)
    || !media
  ) {
    throw invalidPump('input');
  }

  let requested = false;
  let disposed = false;
  let loopPromise = null;
  let queuedResume = false;
  let lastSampledCellId = '';
  const cellById = new Map(playbackPlan.cells.map((cell) => [cell.id, cell]));

  const presentationPositionMs = () => {
    const snapshot = execution.snapshot;
    const terminal = terminalById(snapshot);
    const activeCell = cellById.get(snapshot.activeCellId || lastSampledCellId);
    if (activeCell?.kind === 'audio-clip' && !terminal.has(activeCell.id)) {
      const observedSourceMs = Math.max(0, Number(media.currentTime) * 1_000 || 0);
      const { sourceInMs, sourceOutMs } = activeCell.audio;
      if (observedSourceMs >= sourceInMs && observedSourceMs <= sourceOutMs) {
        return Math.min(
          activeCell.span.endMs,
          activeCell.span.startMs + observedSourceMs - sourceInMs,
        );
      }
    }
    const completedEndMs = playbackPlan.cells.reduce((maximum, cell) => (
      terminal.get(cell.id) === 'completed'
        ? Math.max(maximum, Number(cell.span.endMs) || 0)
        : maximum
    ), 0);
    return Math.max(
      0,
      completedEndMs,
      Number(activeCell?.span?.startMs) || 0,
      Number(snapshot.mediaTimeMs) || 0,
    );
  };

  const reportFailure = (error) => {
    requested = false;
    onFailure?.(error);
    return error;
  };

  const sampleMediaClock = (reason) => {
    if (!requested || disposed || media.seeking === true) return execution.snapshot;
    const mediaTimeMs = presentationPositionMs();
    const previousMs = Number(execution.snapshot.mediaTimeMs);
    if (Number.isFinite(previousMs) && mediaTimeMs < previousMs) return execution.snapshot;
    try {
      return execution.sample({ mediaTimeMs, reason });
    } catch (error) {
      reportFailure(error);
      return execution.snapshot;
    }
  };
  const onMediaTimeUpdate = () => {
    sampleMediaClock('project-playback:media-timeupdate');
  };
  media.addEventListener?.('timeupdate', onMediaTimeUpdate);

  const run = async (reason) => {
    while (requested && !disposed) {
      let snapshot = execution.snapshot;
      const failed = (snapshot.terminal || []).find(({ status }) => status !== 'completed');
      if (failed) {
        throw Object.assign(new Error(`Presentation cell failed: ${failed.cellId}`), {
          code: 'PRESENTATION_PLAYBACK_CELL_FAILED',
          details: failed,
        });
      }
      if (snapshot.activeCount) {
        await execution.whenIdle();
        continue;
      }
      const cell = nextExecutableCell(playbackPlan, snapshot);
      if (!cell) {
        const remaining = playbackPlan.cells.filter((item) => (
          item.kind !== 'narration'
          && !terminalById(snapshot).has(item.id)
        ));
        if (remaining.length) {
          throw Object.assign(new Error('Presentation playback dependencies are blocked'), {
            code: 'PRESENTATION_PLAYBACK_DEPENDENCY_BLOCKED',
            details: { cellIds: remaining.map(({ id }) => id) },
          });
        }
        return snapshot;
      }
      const mediaTimeMs = resumedTimelinePosition(cell, snapshot, media);
      lastSampledCellId = cell.id;
      snapshot = execution.sample({
        mediaTimeMs,
        reason: `project-playback:${reason}`,
      });
      if (snapshot.activeCellId !== cell.id) {
        throw Object.assign(new Error(`Presentation cell did not activate: ${cell.id}`), {
          code: 'PRESENTATION_PLAYBACK_CELL_NOT_ACTIVATED',
          details: { cellId: cell.id, mediaTimeMs, snapshot },
        });
      }
      const idle = await execution.whenIdle();
      if (!requested || disposed) return idle;
      const terminal = idle.terminal.find(({ cellId }) => cellId === cell.id);
      if (terminal?.status !== 'completed') {
        throw Object.assign(new Error(`Presentation cell did not complete: ${cell.id}`), {
          code: 'PRESENTATION_PLAYBACK_CELL_INCOMPLETE',
          details: { cellId: cell.id, terminal: terminal || null },
        });
      }
    }
    return execution.snapshot;
  };

  const launch = (reason) => {
    if (loopPromise) {
      queuedResume = true;
      return true;
    }
    loopPromise = run(reason).catch(reportFailure).finally(() => {
      loopPromise = null;
      if (queuedResume && requested && !disposed) {
        queuedResume = false;
        launch('queued-resume');
      } else {
        queuedResume = false;
      }
    });
    return true;
  };

  return Object.freeze({
    get requested() { return requested; },
    get positionMs() { return presentationPositionMs(); },
    resume(reason = 'resume') {
      if (disposed) return false;
      requested = true;
      if (execution.snapshot.state === 'paused') execution.resume();
      return launch(reason);
    },
    async pause(reason = 'pause') {
      requested = false;
      queuedResume = false;
      media.pause?.();
      return execution.pause(reason);
    },
    async stop(reason = 'stop') {
      requested = false;
      queuedResume = false;
      media.pause?.();
      return execution.stop(reason);
    },
    async dispose(reason = 'dispose') {
      if (disposed) return execution.snapshot;
      disposed = true;
      requested = false;
      queuedResume = false;
      media.removeEventListener?.('timeupdate', onMediaTimeUpdate);
      media.pause?.();
      return execution.dispose(reason);
    },
    whenIdle() {
      return execution.whenIdle();
    },
  });
}
