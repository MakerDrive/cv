export function createBrowserSpeechController({
  synth = globalThis.speechSynthesis,
  Utterance = globalThis.SpeechSynthesisUtterance,
} = {}) {
  const available = Boolean(synth && typeof synth.speak === 'function' && typeof Utterance === 'function');
  let generation = 0;
  let activeUtterance = null;

  const normalizePause = () => {
    if (synth?.paused) synth.resume?.();
  };

  const cancel = () => {
    generation += 1;
    if (activeUtterance) {
      activeUtterance.onend = null;
      activeUtterance.onerror = null;
    }
    activeUtterance = null;
    synth?.cancel?.();
    normalizePause();
  };

  return Object.freeze({
    available,
    /**
     * @param {string} text
     * @param {{ lang?: string, onEnd?: () => void, onError?: (error: string) => void }} [options]
     */
    speak(text, options = {}) {
      const { lang = 'en', onEnd, onError } = options;
      if (!available) return false;
      cancel();
      const token = generation;
      const utterance = new Utterance(String(text || ''));
      utterance.lang = lang;
      utterance.rate = 1;
      utterance.pitch = 1;
      utterance.onend = () => {
        if (token !== generation || activeUtterance !== utterance) return;
        activeUtterance = null;
        onEnd?.();
      };
      utterance.onerror = (event) => {
        if (token !== generation || activeUtterance !== utterance) return;
        activeUtterance = null;
        onError?.(event?.error || 'speech-error');
      };
      activeUtterance = utterance;
      synth.speak(utterance);
      return true;
    },
    pause() {
      synth?.pause?.();
    },
    resume() {
      synth?.resume?.();
    },
    cancel,
  });
}
