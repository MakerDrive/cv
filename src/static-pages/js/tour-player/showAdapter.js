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

function branchSnapshotMismatch(field, expected, observed) {
  return Object.assign(
    new TypeError(`CV Show branch return snapshot mismatch: ${field}`),
    {
      code: 'CV_SHOW_BRANCH_RETURN_SNAPSHOT_MISMATCH',
      details: { field, expected, observed: observed ?? null },
    },
  );
}

export function validateCvShowBranchReturnSnapshot(snapshot, expected = {}) {
  const binding = snapshot?.binding;
  const checks = {
    masterProjectHash: expected.masterProjectHash,
    masterRevision: expected.masterRevision,
    returnParentEntryId: expected.returnParentEntry?.id,
    historicalOwnerEntryId: expected.historicalOwnerEntry?.id,
    branchEntryId: expected.branchEntry?.id,
    checkpointMs: snapshot?.playback?.positionMs,
    contextualCardId: expected.contextualCardId,
    contextualActionId: expected.contextualActionId,
  };
  for (let [field, value] of Object.entries(checks)) {
    if (binding?.[field] !== value) {
      throw branchSnapshotMismatch(field, value, binding?.[field]);
    }
  }
  if (
    snapshot?.entry?.id !== binding.returnParentEntryId
    || snapshot?.playback?.subjectId !== binding.returnParentEntryId
    || expected.historicalOwnerEntry?.branchId !== binding.branchEntryId
    || expected.branchEntry?.sceneId !== binding.historicalOwnerEntryId
    || binding.contextualCardId !== `${binding.historicalOwnerEntryId}.actions`
    || binding.contextualActionId !== 'details'
  ) {
    throw branchSnapshotMismatch(
      'entry-ancestry',
      binding.returnParentEntryId,
      snapshot?.entry?.id,
    );
  }
  return snapshot;
}

export function createCvShowBranchReturnSnapshot({
  masterProjectHash,
  masterRevision,
  returnParentEntry,
  historicalOwnerEntry,
  branchEntry,
  playback,
  contextualCardId,
  contextualActionId,
}) {
  const snapshot = Object.freeze({
    entry: returnParentEntry,
    playback: Object.freeze({ ...playback }),
    binding: Object.freeze({
      masterProjectHash,
      masterRevision,
      returnParentEntryId: returnParentEntry?.id,
      historicalOwnerEntryId: historicalOwnerEntry?.id,
      branchEntryId: branchEntry?.id,
      checkpointMs: playback?.positionMs,
      contextualCardId,
      contextualActionId,
    }),
  });
  return validateCvShowBranchReturnSnapshot(snapshot, {
    masterProjectHash,
    masterRevision,
    returnParentEntry,
    historicalOwnerEntry,
    branchEntry,
    contextualCardId,
    contextualActionId,
  });
}

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
    shared = { type: 'attention', id: directive.id, mode: 'click', targetId: directive.target };
  } else if (directive.type === 'frame') {
    shared = { type: 'attention', id: directive.id, mode: 'frame', targetId: directive.target };
  } else if (directive.type === 'native-selection') {
    shared = {
      type: 'attention',
      id: directive.id,
      mode: 'native-selection',
      targetId: directive.target,
      ...(directive.quote ? { quote: directive.quote } : {}),
      ...(directive.occurrence ? { occurrence: directive.occurrence } : {}),
    };
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

function missingReceipt(adapted, reason, details = null) {
  return Object.freeze({
    id: adapted.source.id,
    sourceType: adapted.sourceType,
    providerType: adapted.directive.type,
    policy: adapted.policy,
    status: 'missing',
    reason,
    ...(details ? { details } : {}),
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

const SHOW_ATTENTION_MILESTONE_VERSION = 'show-attention-milestone-v2';
const SHOW_ATTENTION_TERMINAL_VERSION = 'show-attention-terminal-v2';
const SHOW_ATTENTION_TERMINAL_STATUSES = new Set([
  'completed',
  'rejected',
  'cancelled',
  'failed',
]);
const CV_SHOW_NATIVE_PRESENTATION_RECEIPT_VERSION =
  'cv-show-native-presentation-receipt-v1';

function observePresentationPerformance() {
  return Object.freeze({
    domain: 'performance',
    timeOriginMs: globalThis.performance.timeOrigin,
    monotonicTimeMs: globalThis.performance.now(),
  });
}

function presentationOperationFailure(operation, result) {
  return Object.assign(
    new Error(`CV Show presentation operation failed: ${operation.projectCell.id}`),
    {
      code: 'CV_SHOW_PRESENTATION_OPERATION_FAILED',
      operationId: operation.operationId,
      result,
    },
  );
}

function presentationProviderFailure(operation, reason, details = {}) {
  return Object.assign(
    new TypeError(`CV Show presentation provider is invalid: ${operation.projectCell.id}/${reason}`),
    {
      code: 'CV_SHOW_PRESENTATION_PROVIDER_INVALID',
      operationId: operation.operationId,
      details: { reason, ...details },
    },
  );
}

function presentationProviderTerminalFailure(operation, terminal) {
  const status = String(terminal?.status || 'invalid');
  const code = {
    rejected: 'CV_SHOW_PRESENTATION_PROVIDER_REJECTED',
    cancelled: 'CV_SHOW_PRESENTATION_PROVIDER_CANCELLED',
    failed: 'CV_SHOW_PRESENTATION_PROVIDER_FAILED',
  }[status] || 'CV_SHOW_PRESENTATION_PROVIDER_INVALID';
  return Object.assign(
    new Error(`CV Show presentation provider ${status}: ${operation.projectCell.id}`),
    {
      code,
      operationId: operation.operationId,
      details: { providerReceipt: terminal },
    },
  );
}

function requiresProviderAdmission(operation) {
  return operation.kind === 'attention'
    || operation.projectCell.cue?.interaction?.type === 'select';
}

function createPresentationReporter(operation) {
  const admissionRequired = requiresProviderAdmission(operation);
  if (
    !['interaction', 'attention', 'state'].includes(operation.kind)
    || typeof operation.reportReceipt !== 'function'
    || (admissionRequired && typeof operation.reportAdmission !== 'function')
  ) {
    throw presentationProviderFailure(operation, 'operation callbacks');
  }

  const reportAdmission = (providerAdmission) => {
    if (!admissionRequired) {
      throw presentationProviderFailure(operation, 'unexpected admission');
    }
    return operation.reportAdmission(Object.freeze({ providerAdmission }));
  };

  const reportMilestone = (providerReceipt) => {
    if (
      providerReceipt?.version !== SHOW_ATTENTION_MILESTONE_VERSION
      || !['first-frame', 'settled'].includes(providerReceipt?.milestone)
    ) {
      throw presentationProviderFailure(operation, 'milestone', {
        providerReceipt,
      });
    }
    const status = operation.kind === 'interaction'
      && providerReceipt.milestone === 'first-frame'
      ? 'acted'
      : providerReceipt.milestone;
    return operation.reportReceipt(Object.freeze({
      status,
      observedAt: providerReceipt.observedAt,
      providerReceipt,
    }));
  };

  const reportStatus = (status, observedAt) => operation.reportReceipt(Object.freeze({
    status,
    observedAt,
    providerReceipt: Object.freeze({
      version: CV_SHOW_NATIVE_PRESENTATION_RECEIPT_VERSION,
      effect: Object.freeze({
        kind: operation.kind,
        type: String(
          operation.projectCell.cue?.interaction?.type
          || operation.projectCell.cue?.kind
          || operation.kind,
        ),
        status,
      }),
      target: Object.freeze({
        id: operation.projectCell.cue?.targetId ?? operation.source?.target ?? null,
      }),
    }),
  }));

  const acceptTerminal = (providerReceipt) => {
    if (
      providerReceipt?.version !== SHOW_ATTENTION_TERMINAL_VERSION
      || !SHOW_ATTENTION_TERMINAL_STATUSES.has(providerReceipt?.status)
    ) {
      throw presentationProviderFailure(operation, 'terminal', { providerReceipt });
    }
    if (providerReceipt.status === 'failed') {
      operation.reportReceipt(Object.freeze({
        status: 'failed',
        observedAt: providerReceipt.observedAt,
        providerReceipt,
      }));
    }
    if (providerReceipt.status !== 'completed') {
      throw presentationProviderTerminalFailure(operation, providerReceipt);
    }
    return providerReceipt;
  };

  return Object.freeze({
    kind: operation.kind,
    budgetMs: operation.projectCell.timing?.gestureDurationMs,
    requiresProviderAdmission: admissionRequired,
    reportAdmission,
    reportMilestone,
    reportStatus,
    acceptTerminal,
    providerFailure: (reason, details) => (
      presentationProviderFailure(operation, reason, details)
    ),
  });
}

export async function runCvShowPresentationOperation(runner, operation) {
  throwIfAborted(operation.signal);
  const presentation = createPresentationReporter(operation);
  const result = operation.projectCell.id.endsWith(':scroll')
    ? await runner.scroll(operation.source, { signal: operation.signal, presentation })
    : await runner.run([operation.source], {
        continuePhase: true,
        signal: operation.signal,
        presentation,
      });
  throwIfAborted(operation.signal);
  if (!['success', 'optional-missing'].includes(result?.status)) {
    throw presentationOperationFailure(operation, result);
  }
  return undefined;
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
    resolveSelectionQuote = (source) => source?.quote || '',
    activateTarget = () => false,
    actionAdapter = null,
    waitForReadiness = waitForShowDomReadiness,
    timeoutMs = 2_500,
    observePerformance = observePresentationPerformance,
  } = options;
  let activeController = null;
  let markerSeries = '';
  let paused = false;
  const resumeWaiters = new Set();

  const waitUntilResumed = (signal) => {
    if (!paused) return Promise.resolve();
    return new Promise((resolve, reject) => {
      const cleanup = () => {
        resumeWaiters.delete(onResume);
        signal?.removeEventListener?.('abort', onAbort);
      };
      const onResume = () => {
        cleanup();
        resolve();
      };
      const onAbort = () => {
        cleanup();
        reject(signal.reason || new DOMException('CV Show phase cancelled', 'AbortError'));
      };
      resumeWaiters.add(onResume);
      signal?.addEventListener?.('abort', onAbort, { once: true });
      if (!paused) onResume();
    });
  };

  const resumeAttention = () => {
    paused = false;
    for (const resume of [...resumeWaiters]) resume();
    return attention?.resume?.();
  };

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
    paused = false;
    for (const resume of [...resumeWaiters]) resume();
    cancelAction(reason);
    attention?.clearMarkers?.();
    const preserveCursor = !['stop', 'completed', 'close', 'disposed'].includes(reason);
    attention?.clearTransient?.(reason, { preserveInk: false, preserveCursor });
    markerSeries = '';
  };

  const pauseAttention = () => {
    paused = true;
    return attention?.pause?.();
  };

  const cancel = (reason = 'stop') => {
    clearAttention(reason);
    media?.stop?.('phase-changed');
  };

  const run = async (
    directives = [],
    { continuePhase = false, signal = null, presentation = null } = {},
  ) => {
    if (!continuePhase) cancel('replacement');
    let controller = new AbortController();
    const abortFromSignal = () => controller.abort(
      signal.reason || new DOMException('CV Show phase cancelled', 'AbortError'),
    );
    signal?.addEventListener?.('abort', abortFromSignal, { once: true });
    if (signal?.aborted) abortFromSignal();
    activeController = controller;
    let receipts = [];
    let optionalMissing = false;

    try {
      for (let source of directives) {
        throwIfAborted(controller.signal);
        let adapted = adaptCvShowDirective(source, { resolveText });
        const actualInteraction = presentation?.kind === 'interaction'
          && presentation.requiresProviderAdmission !== true;
        let interactionActed = false;
        const reportInteractionActed = () => {
          if (!actualInteraction || interactionActed) return;
          presentation.reportStatus('acted', observePerformance());
          interactionActed = true;
        };
        const reportInteractionSettled = () => {
          if (!actualInteraction) return;
          presentation.reportStatus('settled', observePerformance());
        };
        // Canonical `idle` cues are quiet narration dwell points, not chat status
        // messages and never a request for manual progression.
        if (source.type !== 'idle') emit?.(adapted.directive);
        if (source.type === 'chat-action') reportInteractionActed();

        if (adapted.directive.type === 'attention') {
          if (source.type !== 'marker') {
            attention?.clearMarkers?.();
            markerSeries = '';
          } else if (markerSeries && markerSeries !== String(source.series || '')) {
            attention?.clearMarkers?.();
          }
          if (source.type === 'marker') markerSeries = String(source.series || '');
          const abortLifecycle = () => cancelAction('replacement');
          controller.signal.addEventListener('abort', abortLifecycle, { once: true });
          try {
            const lifecycleReceipt = await actionLifecycle.run(source, {
              adapted,
              act: async (target) => {
                throwIfAborted(controller.signal);
                await waitUntilResumed(controller.signal);
                throwIfAborted(controller.signal);
                let presentationTarget = target;
                if (source.type === 'navigate' && runtime?.entries?.has(source.target)) {
                  const selected = runtime.select(source.target, { focus: true, updateUrl: false });
                  if (selected === false) return { unavailable: true, reason: 'navigation-rejected' };
                  reportInteractionActed();
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
                  // Map-opening navigation has a semantic layout target supplied by
                  // the action adapter. Re-resolving only by entry id would replace
                  // that graph node with the tree row after selection and can detach
                  // the active gesture during an automatic scene transition.
                  presentationTarget = String(source.id || '').endsWith('.map')
                    ? target
                    : resolveTarget(source.target) || target;
                }
                const providerPlanned = presentation?.requiresProviderAdmission === true;
                if (
                  providerPlanned
                  && (
                    typeof attention?.present !== 'function'
                    || typeof attention?.whenSettled !== 'function'
                    || typeof attention?.cancel !== 'function'
                    || (
                      source.checkpointMode === 'restore-held'
                      && typeof attention?.seek !== 'function'
                    )
                  )
                ) {
                  throw presentation.providerFailure('attention lifecycle callbacks');
                }
                const cancelProvider = () => attention.cancel(controller.signal.reason);
                if (providerPlanned) {
                  controller.signal.addEventListener('abort', cancelProvider, { once: true });
                }
                try {
                  const attentionDirective = adapted.directive.mode === 'native-selection'
                    ? {
                        ...adapted.directive,
                        quote: resolveSelectionQuote(source, presentationTarget),
                        occurrence: 1,
                      }
                    : adapted.directive;
                  let result;
                  let presentFailure;
                  try {
                    result = attention?.present?.({
                      ...attentionDirective,
                      target: presentationTarget,
                      ...(presentationTarget ? {
                        targetIdentity: attentionDirective.targetId,
                      } : {}),
                      gestureId: source.id,
                      cueTimeMs: source.cueTimeMs,
                      mediaTimeMs: source.mediaTimeMs,
                      ...(providerPlanned ? {
                        budgetMs: presentation.budgetMs,
                        onAdmission: presentation.reportAdmission,
                        onMilestone: presentation.reportMilestone,
                      } : {}),
                      annotation: {
                        marker: adapted.directive.marker,
                        ...(adapted.directive.mode === 'marker' ? { intent: 'emphasize' } : {}),
                        ...(source.series ? { series: source.series } : {}),
                        ...(adapted.directive.label ? { label: adapted.directive.label } : {}),
                      },
                    });
                  } catch (error) {
                    presentFailure = error;
                  }
                  if (!presentFailure && source.checkpointMode === 'restore-held') {
                    attention?.seek?.(presentation.budgetMs);
                  }
                  if (source.type === 'activate') {
                    activateTarget(target, source);
                    reportInteractionActed();
                  }
                  const settlement = await attention?.whenSettled?.();
                  if (presentFailure) throw presentFailure;
                  throwIfAborted(controller.signal);
                  if (providerPlanned) presentation.acceptTerminal(settlement);
                  if (
                    !providerPlanned
                    && (result?.presented === false || result?.status === 'unsupported')
                  ) {
                    return { unavailable: true, reason: result?.reason || result?.status };
                  }
                  reportInteractionSettled();
                  return source.type === 'navigate'
                    ? { ...result, settlement, selectedId: runtime.selectedId }
                    : { ...result, settlement };
                } finally {
                  if (providerPlanned) {
                    controller.signal.removeEventListener('abort', cancelProvider);
                  }
                }
              },
            });
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
            if (controller.signal.aborted) throwIfAborted(controller.signal);
            if (presentation?.requiresProviderAdmission === true) throw error;
            if (error?.name === 'AbortError') throw error;
            let receipt = missingReceipt(
              adapted,
              error?.code || 'target-unresolved',
              error?.receipt ? { actionLifecycle: error.receipt } : null,
            );
            receipts.push(receipt);
            if (adapted.policy === 'required') {
              return Object.freeze({ status: 'required-missing', receipts: Object.freeze(receipts) });
            }
            optionalMissing = true;
            continue;
          } finally {
            controller.signal.removeEventListener('abort', abortLifecycle);
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
            reportInteractionActed();
            reportInteractionSettled();
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
            await waitUntilResumed(controller.signal);
            throwIfAborted(controller.signal);
            reportInteractionActed();
            let result = await media.play(mediaElement, adapted.directive);
            reportInteractionSettled();
            receipts.push(successReceipt(adapted, result));
          } catch (error) {
            if (error?.name === 'AbortError') throw error;
            let receipt = missingReceipt(adapted, error?.code || 'media-unavailable');
            receipts.push(receipt);
            if (adapted.policy === 'required') {
              return Object.freeze({ status: 'required-missing', receipts: Object.freeze(receipts) });
            }
            reportInteractionSettled();
            optionalMissing = true;
          }
          continue;
        }

        receipts.push(successReceipt(adapted));
        reportInteractionSettled();
        if (presentation?.kind === 'state') {
          presentation.reportStatus('ready', observePerformance());
        }
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
      signal?.removeEventListener?.('abort', abortFromSignal);
      if (activeController === controller) activeController = null;
    }
  };

  const scroll = async (
    source,
    { signal, presentation = null }
      = /** @type {{ signal?: AbortSignal, presentation?: any }} */ ({}),
  ) => {
    throwIfAborted(signal);
    clearAttention('scroll');
    presentation?.reportStatus('acted', observePerformance());
    const context = {
      retainRevealedPanel: false,
      scrollOperation: true,
      act: async () => {
        await waitUntilResumed(signal);
        throwIfAborted(signal);
        context.retainRevealedPanel = true;
        return { settled: true };
      },
    };
    const abortLifecycle = () => { void actionLifecycle.cancel('replacement'); };
    signal?.addEventListener?.('abort', abortLifecycle, { once: true });
    try {
      const lifecycleReceipt = await actionLifecycle.run(source, context);
      throwIfAborted(signal);
      if (lifecycleReceipt.status === 'cancelled') {
        return Object.freeze({ status: 'cancelled', receipts: Object.freeze([]) });
      }
      presentation?.reportStatus('settled', observePerformance());
      return Object.freeze({
        status: 'success',
        receipts: Object.freeze([]),
      });
    } finally {
      signal?.removeEventListener?.('abort', abortLifecycle);
    }
  };

  return Object.freeze({
    run,
    scroll,
    cancel,
    clearAttention,
    pause: pauseAttention,
    resume: resumeAttention,
    stop: () => cancel('stop'),
    seek: () => clearAttention('seek'),
    branchChange: () => clearAttention('branch-change'),
    branchReturn: () => clearAttention('branch-return'),
    meaningfulInteraction: () => clearAttention('meaningful-interaction'),
    beginPhase: () => cancel('replacement'),
  });
}
