export function createBrowserSpeechController({
  synth = globalThis.speechSynthesis,
  Utterance = globalThis.SpeechSynthesisUtterance,
} = {}) {
  const available = Boolean(synth && typeof synth.speak === 'function' && typeof Utterance === 'function');
  let generation = 0;
  let active = null;

  const normalizePause = () => {
    if (synth?.paused) synth.resume?.();
  };

  const clearUtterance = (utterance) => {
    if (!utterance) return;
    utterance.onstart = null;
    utterance.onresume = null;
    utterance.onend = null;
    utterance.onerror = null;
  };

  const cancel = () => {
    generation += 1;
    clearUtterance(active?.utterance);
    active = null;
    synth?.cancel?.();
    normalizePause();
  };

  const queueActive = () => {
    if (!active) return false;
    const state = active;
    const { token, text, options } = state;
    const utterance = new Utterance(text);
    utterance.lang = options.lang;
    utterance.rate = 1;
    utterance.pitch = 1;
    const current = () => token === generation && active === state && state.utterance === utterance;
    const reportStart = () => {
      if (!current()) return;
      options.onStart?.();
    };
    utterance.onstart = reportStart;
    utterance.onresume = reportStart;
    utterance.onend = () => {
      if (!current()) return;
      active = null;
      options.onEnd?.();
    };
    utterance.onerror = (event) => {
      if (!current()) return;
      clearUtterance(utterance);
      state.utterance = null;
      if (event?.error === 'not-allowed') {
        state.pending = true;
        options.onBlocked?.('autoplay-blocked', event);
      } else {
        active = null;
        options.onError?.(event?.error || 'speech-error');
      }
    };
    state.utterance = utterance;
    state.pending = false;
    normalizePause();
    try {
      synth.speak(utterance);
    } catch (error) {
      clearUtterance(utterance);
      state.utterance = null;
      if (error?.name === 'NotAllowedError') {
        state.pending = true;
        options.onBlocked?.('autoplay-blocked', error);
      } else {
        active = null;
        options.onError?.(error?.message || 'speech-error');
      }
    }
    return true;
  };

  return Object.freeze({
    available,
    /**
     * @param {string} text
     * @param {{
     *   lang?: string,
     *   startPaused?: boolean,
     *   onStart?: () => void,
     *   onEnd?: () => void,
     *   onBlocked?: (reason: string, event?: Event) => void,
     *   onError?: (error: string) => void,
     * }} [options]
     */
    speak(text, options = {}) {
      if (!available) return false;
      cancel();
      active = {
        token: generation,
        text: String(text || ''),
        options: {
          ...options,
          lang: options.lang || 'en',
        },
        utterance: null,
        pending: options.startPaused === true,
      };
      if (!active.pending) queueActive();
      return true;
    },
    pause() {
      synth?.pause?.();
    },
    resume() {
      if (!active) return false;
      if (active.pending) return queueActive();
      synth?.resume?.();
      return true;
    },
    cancel,
  });
}
