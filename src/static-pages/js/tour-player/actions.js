function actionReceipt(intent) {
  return {
    provenanceId: intent.provenanceId,
    action: intent.action,
    target: intent.target || null,
    phases: [],
  };
}

export function createTourActionRunner({
  runtime,
  resolveTarget,
  presentTarget,
  settleTarget,
  clearPresenter,
}) {
  let activeController = null;

  const cancel = () => {
    activeController?.abort();
    activeController = null;
    clearPresenter();
  };

  const run = async (intents) => {
    cancel();
    const controller = new AbortController();
    activeController = controller;
    let optionalMissing = false;
    const receipts = [];

    for (const intent of intents) {
      if (controller.signal.aborted) return { status: 'cancelled', receipts };
      if (intent.action === 'clear-highlight') {
        clearPresenter();
        continue;
      }

      const receipt = actionReceipt(intent);
      receipts.push(receipt);
      const isEntryAction = intent.action === 'select-entry' || intent.action === 'highlight-entry';
      if (isEntryAction && !runtime.entries.has(intent.target)) {
        if (intent.policy === 'required') {
          clearPresenter();
          return { status: 'required-missing', receipts };
        }
        optionalMissing = true;
        continue;
      }

      const target = await resolveTarget(intent.target, controller.signal);
      if (controller.signal.aborted) return { status: 'cancelled', receipts };
      if (!target) {
        if (intent.policy === 'required') {
          clearPresenter();
          return { status: 'required-missing', receipts };
        }
        optionalMissing = true;
        continue;
      }

      const phase = intent.action === 'select-entry' ? 'approach' : 'focus';
      await presentTarget(target, intent, phase, controller.signal);
      receipt.phases.push(phase);
      if (controller.signal.aborted) return { status: 'cancelled', receipts };

      if (intent.action === 'select-entry') {
        runtime.select(intent.target, { focus: true, updateUrl: false });
        receipt.phases.push('apply');
        await settleTarget(intent.target, target, controller.signal);
        receipt.phases.push('settle');
        const settledTarget = await resolveTarget(intent.target, controller.signal);
        if (controller.signal.aborted) return { status: 'cancelled', receipts };
        if (!settledTarget) {
          if (intent.policy === 'required') {
            clearPresenter();
            return { status: 'required-missing', receipts };
          }
          optionalMissing = true;
          continue;
        }
        await presentTarget(settledTarget, intent, 'focus', controller.signal);
        receipt.phases.push('focus');
      }
    }

    if (activeController === controller) activeController = null;
    return {
      status: optionalMissing ? 'optional-missing' : 'success',
      receipts,
    };
  };

  return Object.freeze({ cancel, run });
}
