const DEFAULT_CHARACTERS_PER_SECOND = 40;
const MIN_STREAM_DURATION_MS = 900;

function abortReceipt(text, renderedText) {
  return Object.freeze({
    status: 'cancelled',
    text,
    renderedText,
    progress: text ? renderedText.length / text.length : 1,
  });
}

/**
 * Simulates a cancelable streaming reply using frame timestamps as the only clock.
 * @param {string} value
 * @param {{signal?:AbortSignal,onUpdate?:(text:string, receipt:object)=>void,
 *   requestFrame?:(callback:FrameRequestCallback)=>number,cancelFrame?:(id:number)=>void,
 *   charactersPerSecond?:number}} [options]
 */
export function createCvShowMessageStream(value, options = {}) {
  const text = String(value || '');
  const characters = Array.from(text);
  const requestFrame = options.requestFrame || globalThis.requestAnimationFrame?.bind(globalThis);
  const cancelFrame = options.cancelFrame || globalThis.cancelAnimationFrame?.bind(globalThis);
  const charactersPerSecond = Math.max(1, Number(options.charactersPerSecond) || DEFAULT_CHARACTERS_PER_SECOND);
  const durationMs = Math.max(MIN_STREAM_DURATION_MS, characters.length / charactersPerSecond * 1_000);

  if (!characters.length || typeof requestFrame !== 'function') {
    options.onUpdate?.(text, Object.freeze({ status: 'completed', text, progress: 1, durationMs: 0 }));
    return Promise.resolve(Object.freeze({ status: 'completed', text, progress: 1, durationMs: 0 }));
  }

  return new Promise((resolve) => {
    let frameId = 0;
    let startedAt = null;
    let renderedText = '';
    let settled = false;
    const cleanup = () => {
      if (frameId) cancelFrame?.(frameId);
      frameId = 0;
      options.signal?.removeEventListener?.('abort', onAbort);
    };
    const finish = (receipt) => {
      if (settled) return;
      settled = true;
      cleanup();
      resolve(receipt);
    };
    const onAbort = () => finish(abortReceipt(text, renderedText));
    const render = (timestamp) => {
      if (settled) return;
      if (options.signal?.aborted) {
        onAbort();
        return;
      }
      startedAt ??= timestamp;
      const progress = Math.min(1, Math.max(0, (timestamp - startedAt) / durationMs));
      const count = Math.min(characters.length, Math.max(1, Math.ceil(characters.length * progress)));
      renderedText = characters.slice(0, count).join('');
      const status = count === characters.length ? 'completed' : 'streaming';
      const receipt = Object.freeze({ status, text, renderedText, progress, durationMs });
      options.onUpdate?.(renderedText, receipt);
      if (status === 'completed') finish(receipt);
      else frameId = requestFrame(render);
    };
    options.signal?.addEventListener?.('abort', onAbort, { once: true });
    if (options.signal?.aborted) onAbort();
    else frameId = requestFrame(render);
  });
}
