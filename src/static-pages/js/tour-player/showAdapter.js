import {
  createShowActionLifecycle,
  normalizeShowDirective,
  waitForShowDomReadiness,
} from 'symbiote-ui/chat/show-runtime';

export const CV_SHOW_DIRECTIVE_TYPES = Object.freeze([
  'navigate',
  'frame',
  'native-selection',
  'marker',
  'activate',
  'media',
  'chat-note',
  'chat-action',
  'idle',
]);

function policyOf(directive) {
  return directive?.policy === 'optional' ? 'optional' : 'required';
}

function createAction(action, resolveText) {
  return {
    id: action,
    label: resolveText(`tour.action.${action}`),
  };
}

/**
 * Converts each CV-owned scenario directive into the narrow shared Show contract.
 * Product-only behavior (navigation and safe activation) stays in the runner.
 */
export function adaptCvShowDirective(directive, { resolveText = (key) => key } = {}) {
  if (!CV_SHOW_DIRECTIVE_TYPES.includes(directive?.type)) {
    throw new TypeError(`Unsupported CV Show directive "${directive?.type || ''}"`);
  }

  let shared;
  if (directive.type === 'navigate') {
    shared = { type: 'attention', id: directive.id, mode: 'cursor', targetId: directive.target };
  } else if (directive.type === 'frame') {
    shared = { type: 'attention', id: directive.id, mode: 'frame', targetId: directive.target };
  } else if (directive.type === 'native-selection') {
    shared = { type: 'attention', id: directive.id, mode: 'native-selection', targetId: directive.target };
  } else if (directive.type === 'marker') {
    shared = {
      type: 'attention',
      id: directive.id,
      mode: 'marker',
      targetId: directive.target,
      marker: directive.shape,
      ...(directive.text ? { label: directive.text } : {}),
    };
  } else if (directive.type === 'activate') {
    shared = { type: 'attention', id: directive.id, mode: 'click', targetId: directive.target };
  } else if (directive.type === 'media') {
    shared = {
      type: 'media',
      id: directive.id,
      mediaId: directive.target,
      mode: directive.mode,
      ...(directive.startMs === undefined ? {} : { startMs: directive.startMs }),
      ...(directive.endMs === undefined ? {} : { endMs: directive.endMs }),
    };
  } else if (directive.type === 'chat-note') {
    shared = {
      type: 'footnote',
      id: directive.id,
      referenceId: directive.target,
      text: resolveText(`tour.note.${directive.target}`),
    };
  } else if (directive.type === 'chat-action') {
    shared = {
      type: 'actions',
      id: directive.id,
      actions: directive.actions.map((action) => createAction(action, resolveText)),
      context: { targetId: directive.target, persistent: directive.persistent === true },
    };
  } else {
    shared = {
      type: 'status',
      id: directive.id,
      status: 'idle',
      text: resolveText('tour.status.idle'),
    };
  }

  return Object.freeze({
    sourceType: directive.type,
    policy: policyOf(directive),
    source: directive,
    directive: normalizeShowDirective(shared),
  });
}

function missingReceipt(adapted, reason) {
  return Object.freeze({
    id: adapted.source.id,
    sourceType: adapted.sourceType,
    providerType: adapted.directive.type,
    policy: adapted.policy,
    status: 'missing',
    reason,
  });
}

function successReceipt(adapted, result = null) {
  return Object.freeze({
    id: adapted.source.id,
    sourceType: adapted.sourceType,
    providerType: adapted.directive.type,
    policy: adapted.policy,
    status: 'success',
    result,
  });
}

function throwIfAborted(signal) {
  if (!signal?.aborted) return;
  throw signal.reason || new DOMException('CV Show phase cancelled', 'AbortError');
}

/** @param {Record<string, any>} [options] */
export function createCvShowDirectiveRunner(options = {}) {
  const {
    document,
    runtime,
    attention,
    media,
    emit,
    resolveTarget,
    resolveMedia,
    resolveText,
    activateTarget = () => false,
    actionAdapter = null,
    waitForReadiness = waitForShowDomReadiness,
    timeoutMs = 2_500,
  } = options;
  let activeController = null;
  let markerSeries = '';

  const actionLifecycle = createShowActionLifecycle({
    inspect: (input) => actionAdapter?.inspect?.(input),
    reveal: (input) => actionAdapter?.reveal?.(input),
    awaitTransition: (input) => actionAdapter?.awaitTransition?.(input),
    awaitTarget: (input) => actionAdapter?.awaitTarget?.(input)
      || waitForReadiness({
        document,
        target: () => resolveTarget(input.action.target),
        signal: input.signal,
        timeoutMs,
      }),
    act: async (input) => input.context.act(input.target?.target ?? input.target),
    restore: (input) => actionAdapter?.restore?.(input),
  });

  const cancelAction = (reason) => {
    const method = {
      pause: 'pause',
      stop: 'stop',
      seek: 'seek',
      'branch-change': 'branchChange',
      'branch-return': 'branchReturn',
      'meaningful-interaction': 'meaningfulInteraction',
    }[reason];
    if (method) void actionLifecycle[method]?.();
    else void actionLifecycle.cancel(reason || 'replacement');
  };

  const clearAttention = (reason = 'pause') => {
    activeController?.abort(new DOMException('CV Show phase cancelled', 'AbortError'));
    activeController = null;
    cancelAction(reason);
    attention?.clearMarkers?.();
    attention?.clearTransient?.();
    markerSeries = '';
  };

  const cancel = (reason = 'stop') => {
    clearAttention(reason);
    media?.stop?.('phase-changed');
  };

  const run = async (directives = [], { continuePhase = false } = {}) => {
    if (!continuePhase) cancel();
    let controller = new AbortController();
    activeController = controller;
    let receipts = [];
    let optionalMissing = false;

    try {
      for (let source of directives) {
        throwIfAborted(controller.signal);
        let adapted = adaptCvShowDirective(source, { resolveText });
        // Canonical `idle` cues are quiet narration dwell points, not chat status
        // messages and never a request for manual progression.
        if (source.type !== 'idle') emit?.(adapted.directive);

        if (adapted.directive.type === 'attention') {
          if (source.type !== 'marker') {
            attention?.clearMarkers?.();
            markerSeries = '';
          } else if (markerSeries && markerSeries !== String(source.series || '')) {
            attention?.clearMarkers?.();
          }
          if (source.type === 'marker') markerSeries = String(source.series || '');
          try {
            const abortLifecycle = () => cancelAction('replacement');
            controller.signal.addEventListener('abort', abortLifecycle, { once: true });
            const lifecycleReceipt = await actionLifecycle.run(source, {
              adapted,
              act: async (target) => {
                throwIfAborted(controller.signal);
                let presentationTarget = target;
                if (source.type === 'navigate' && runtime?.entries?.has(source.target)) {
                  const selected = runtime.select(source.target, { focus: true, updateUrl: false });
                  if (selected === false) return { unavailable: true, reason: 'navigation-rejected' };
                  await waitForReadiness({
                    document,
                    target: () => {
                      if (runtime.selectedId !== source.target) return null;
                      const viewer = runtime.viewer;
                      return viewer?.getAttribute?.('aria-busy') === 'true'
                        ? null
                        : viewer || resolveTarget(source.target);
                    },
                    signal: controller.signal,
                    timeoutMs,
                    scroll: false,
                  });
                  throwIfAborted(controller.signal);
                  presentationTarget = resolveTarget(source.target) || target;
                }
                let result = attention?.present?.({
                  ...adapted.directive,
                  target: presentationTarget,
                  annotation: {
                    marker: adapted.directive.marker,
                    ...(source.series ? { series: source.series } : {}),
                    ...(adapted.directive.label ? { label: adapted.directive.label } : {}),
                  },
                });
                if (source.type === 'activate') activateTarget(target, source);
                if (result?.presented === false || result?.status === 'unsupported') {
                  return { unavailable: true, reason: result?.reason || result?.status };
                }
                await attention?.whenSettled?.();
                return source.type === 'navigate'
                  ? { ...result, selectedId: runtime.selectedId }
                  : result;
              },
            });
            controller.signal.removeEventListener('abort', abortLifecycle);
            if (lifecycleReceipt.status === 'cancelled') {
              return Object.freeze({ status: 'cancelled', receipts: Object.freeze(receipts) });
            }
            const actResult = lifecycleReceipt.phases
              .find(({ phase }) => phase === 'act')?.result;
            if (actResult?.unavailable) {
              let receipt = missingReceipt(adapted, actResult.reason || 'presentation-unavailable');
              receipts.push(receipt);
              if (adapted.policy === 'required') {
                return Object.freeze({ status: 'required-missing', receipts: Object.freeze(receipts) });
              }
              optionalMissing = true;
              continue;
            }
            receipts.push(successReceipt(adapted, lifecycleReceipt));
          } catch (error) {
            if (error?.name === 'AbortError') throw error;
            let receipt = missingReceipt(adapted, error?.code || 'target-unresolved');
            receipts.push(receipt);
            if (adapted.policy === 'required') {
              return Object.freeze({ status: 'required-missing', receipts: Object.freeze(receipts) });
            }
            optionalMissing = true;
            continue;
          }
          continue;
        }

        if (adapted.directive.type === 'media') {
          let mediaElement = resolveMedia(source.target);
          if (!mediaElement) {
            let receipt = missingReceipt(adapted, 'media-unresolved');
            receipts.push(receipt);
            if (adapted.policy === 'required') {
              return Object.freeze({ status: 'required-missing', receipts: Object.freeze(receipts) });
            }
            optionalMissing = true;
            continue;
          }
          try {
            await waitForReadiness({
              document,
              target: mediaElement,
              media: [mediaElement],
              signal: controller.signal,
              timeoutMs,
            });
            throwIfAborted(controller.signal);
            let result = await media.play(mediaElement, adapted.directive);
            receipts.push(successReceipt(adapted, result));
          } catch (error) {
            if (error?.name === 'AbortError') throw error;
            let receipt = missingReceipt(adapted, error?.code || 'media-unavailable');
            receipts.push(receipt);
            if (adapted.policy === 'required') {
              return Object.freeze({ status: 'required-missing', receipts: Object.freeze(receipts) });
            }
            optionalMissing = true;
          }
          continue;
        }

        receipts.push(successReceipt(adapted));
      }
      return Object.freeze({
        status: optionalMissing ? 'optional-missing' : 'success',
        receipts: Object.freeze(receipts),
      });
    } catch (error) {
      if (error?.name === 'AbortError') {
        return Object.freeze({ status: 'cancelled', receipts: Object.freeze(receipts) });
      }
      throw error;
    } finally {
      if (activeController === controller) activeController = null;
    }
  };

  return Object.freeze({
    run,
    cancel,
    clearAttention,
    pause: () => clearAttention('pause'),
    stop: () => cancel('stop'),
    seek: () => clearAttention('seek'),
    branchChange: () => clearAttention('branch-change'),
    branchReturn: () => clearAttention('branch-return'),
    meaningfulInteraction: () => clearAttention('meaningful-interaction'),
    beginPhase: () => cancel('replacement'),
  });
}
