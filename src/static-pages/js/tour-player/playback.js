export function createTourCompletionGate(onAdvance) {
  let requestId = 0;
  let actionComplete = false;
  let speechComplete = false;
  let paused = false;
  let cancelled = true;
  let advanced = false;

  const check = () => {
    if (cancelled || paused || advanced || !actionComplete || !speechComplete) return;
    advanced = true;
    onAdvance(requestId);
  };

  return Object.freeze({
    begin(nextRequestId) {
      requestId = nextRequestId;
      actionComplete = false;
      speechComplete = false;
      cancelled = false;
      advanced = false;
    },
    markAction(candidateId) {
      if (cancelled || candidateId !== requestId) return;
      actionComplete = true;
      check();
    },
    markSpeech(candidateId) {
      if (cancelled || candidateId !== requestId) return;
      speechComplete = true;
      check();
    },
    setPaused(value) {
      paused = Boolean(value);
      check();
    },
    cancel() {
      cancelled = true;
      requestId += 1;
    },
  });
}
