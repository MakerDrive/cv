const DEFAULT_CHARACTERS_PER_SECOND = 40;
const MIN_STREAM_DURATION_MS = 900;
let messageStreamOperationSequence = 0;

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

/**
 * Owns the one active CV Show chat stream independently of its display message id.
 * Replacement and cancellation invalidate callbacks before aborting the provider.
 *
 * @param {{createStream?:typeof createCvShowMessageStream}} [options]
 */
export function createCvShowMessageStreamController({
  createStream = createCvShowMessageStream,
} = {}) {
  const operations = new Map();
  let activeOperationId = '';

  const isCurrent = (operation) => (
    activeOperationId === operation.operationId
    && operations.get(operation.operationId) === operation
    && !operation.controller.signal.aborted
  );

  /** @param {Error|string} [reason] */
  const cancel = (reason = 'replacement') => {
    const abortReason = reason instanceof Error
      ? reason
      : new DOMException(`CV Show message stream cancelled: ${reason}`, 'AbortError');
    const active = [...operations.values()];
    operations.clear();
    activeOperationId = '';
    for (const operation of active) operation.controller.abort(abortReason);
  };

  /**
   * @param {{displayId?:string,text?:string,
   *   onUpdate?:(text:string,receipt:object)=>void,
   *   onCompleted?:(receipt:object)=>void}} [input]
   */
  const start = ({ displayId = '', text = '', onUpdate, onCompleted } = {}) => {
    cancel('replacement');
    const operationId = `cv-show-message-stream-${++messageStreamOperationSequence}`;
    const controller = new AbortController();
    const operation = { operationId, controller };
    operations.set(operationId, operation);
    activeOperationId = operationId;

    let stream;
    try {
      stream = createStream(text, {
        signal: controller.signal,
        onUpdate: (...args) => {
          if (isCurrent(operation)) onUpdate?.(...args);
        },
      });
    } catch (error) {
      stream = Promise.reject(error);
    }
    const promise = Promise.resolve(stream)
      .then((receipt) => {
        if (receipt?.status === 'completed' && isCurrent(operation)) {
          onCompleted?.(receipt);
        }
        return receipt;
      })
      .finally(() => {
        if (operations.get(operationId) !== operation) return;
        operations.delete(operationId);
        if (activeOperationId === operationId) activeOperationId = '';
      });

    return Object.freeze({
      operationId,
      displayId: String(displayId || ''),
      promise,
    });
  };

  return Object.freeze({
    start,
    cancel,
    get snapshot() {
      return Object.freeze({
        activeCount: operations.size,
        activeOperationId,
      });
    },
  });
}
