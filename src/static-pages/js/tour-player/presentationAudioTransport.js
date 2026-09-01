const RANGE_END_TOLERANCE_MS = 20;
const RANGE_PROGRESS_POLL_MS = 25;

function observation() {
  return Object.freeze({
    domain: 'performance',
    timeOriginMs: globalThis.performance.timeOrigin,
    monotonicTimeMs: globalThis.performance.now(),
  });
}

function abortError(signal) {
  return signal?.reason instanceof Error
    ? signal.reason
    : new DOMException('Presentation audio clip aborted', 'AbortError');
}

/**
 * Browser transport for one canonical Project audio-clip cell. The element may
 * contain the full approved master delivery; only the authored half-open range
 * is played and acknowledged.
 */
export function playPresentationAudioClip(media, operation, { seekTransport = null } = {}) {
  return new Promise((resolve, reject) => {
    const { projectCell, sourceAsset, playback, signal } = operation;
    const sourceInMs = projectCell.audio.sourceInMs;
    const sourceOutMs = projectCell.audio.sourceOutMs;
    const observedSourcePositionMs = Number(playback.sourcePositionMs);
    const sourcePositionMs = Math.floor(observedSourcePositionMs);
    const reachesSourceEnd = sourceOutMs === sourceAsset.durationMs;
    const seekSourcePosition = typeof seekTransport === 'function'
      ? seekTransport
      : (mediaTimeMs) => { media.currentTime = mediaTimeMs / 1_000; };
    let settled = false;
    let playbackStarted = false;
    let progressTimer = null;

    const cleanup = () => {
      if (progressTimer !== null) clearInterval(progressTimer);
      media.removeEventListener?.('timeupdate', onProgress);
      media.removeEventListener?.('ended', onEnded);
      media.removeEventListener?.('error', onError);
      media.removeEventListener?.('seeked', onSeeked);
      signal?.removeEventListener?.('abort', onAbort);
    };
    const fail = (error) => {
      if (settled) return;
      settled = true;
      cleanup();
      media.pause?.();
      reject(error);
    };
    const finish = () => {
      if (settled) return;
      settled = true;
      cleanup();
      media.pause?.();
      try {
        operation.reportReceipt(Object.freeze({
          status: 'ended',
          observedAt: observation(),
          providerReceipt: Object.freeze({
            clipId: projectCell.id,
            assetId: projectCell.audio.assetId,
            sourceContentHash: sourceAsset.contentHash,
            sourceInMs,
            sourceOutMs,
          }),
        }));
        resolve(undefined);
      } catch (error) {
        reject(error);
      }
    };
    function onProgress() {
      if (reachesSourceEnd) return;
      if ((Number(media.currentTime) * 1_000) >= sourceOutMs - RANGE_END_TOLERANCE_MS) {
        finish();
      }
    }
    function onEnded() {
      const observedMs = Number(media.currentTime) * 1_000;
      if (observedMs >= sourceOutMs - RANGE_END_TOLERANCE_MS) {
        finish();
      } else {
        fail(Object.assign(new Error(`Presentation audio ended before ${projectCell.id}`), {
          code: 'CV_SHOW_AUDIO_CLIP_ENDED_EARLY',
          details: { clipId: projectCell.id, observedMs, sourceOutMs },
        }));
      }
    }
    function onError() {
      fail(media.error || Object.assign(new Error(`Presentation audio failed: ${projectCell.id}`), {
        code: 'CV_SHOW_AUDIO_CLIP_PLAYBACK_FAILED',
      }));
    }
    function startPlayback() {
      if (settled || playbackStarted) return;
      playbackStarted = true;
      media.removeEventListener?.('seeked', onSeeked);
      progressTimer = setInterval(onProgress, RANGE_PROGRESS_POLL_MS);
      Promise.resolve(media.play?.()).then(onProgress, fail);
    }
    function onSeeked() {
      const observedMs = Number(media.currentTime) * 1_000;
      if (
        media.seeking === true
        || !Number.isFinite(observedMs)
        || Math.abs(observedMs - sourcePositionMs) > RANGE_END_TOLERANCE_MS
      ) return;
      startPlayback();
    }
    function onAbort() {
      fail(abortError(signal));
    }

    if (
      !media
      || !projectCell?.audio
      || !sourceAsset
      || !Number.isFinite(observedSourcePositionMs)
      || observedSourcePositionMs < sourceInMs
      || observedSourcePositionMs >= sourceOutMs
    ) {
      fail(Object.assign(new TypeError('Presentation audio clip transport input is invalid'), {
        code: 'CV_SHOW_AUDIO_CLIP_TRANSPORT_INVALID',
      }));
      return;
    }
    if (signal?.aborted) {
      fail(abortError(signal));
      return;
    }
    media.addEventListener?.('timeupdate', onProgress);
    media.addEventListener?.('ended', onEnded);
    media.addEventListener?.('error', onError);
    media.addEventListener?.('seeked', onSeeked);
    signal?.addEventListener?.('abort', onAbort, { once: true });
    try {
      const currentSourcePositionMs = Number(media.currentTime) * 1_000;
      if (
        Number.isFinite(currentSourcePositionMs)
        && Math.abs(currentSourcePositionMs - sourcePositionMs) <= RANGE_END_TOLERANCE_MS
      ) {
        if (media.seeking !== true) startPlayback();
      } else {
        seekSourcePosition(sourcePositionMs);
        onSeeked();
      }
    } catch (error) {
      fail(error);
    }
  });
}
