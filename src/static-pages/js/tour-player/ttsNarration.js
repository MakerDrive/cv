/**
 * Browser speech that narrates a Show entry sentence by sentence and tells the show when its
 * cues are due. The voice gives no word times, so each cue's moment is the real start of its
 * sentence plus the estimated offset inside it (see ttsTiming.js); the measured pace of the
 * voice rescales what is still to come. Same surface as createBrowserSpeechController.
 */
import {
  createPaceTracker, estimateTiming, findQuoteWord, splitWords,
} from './ttsTiming.js';

const timers = {
  set: (fn, ms) => globalThis.setTimeout(fn, ms),
  clear: (id) => globalThis.clearTimeout(id),
};

/**
 * Cue moments inside one narration: for each cue, the sentence holding its quote and the offset
 * from that sentence's start at pace 1 (negative = it leads its words).
 * @param {string} text
 * @param {Array<{ id?: string, quote?: string, occurrence?: number, offsetMs?: number }>} cues
 * @param {{ whole?: boolean }} [options] `whole`: treat the text as a single sentence
 */
export function planCues(text, cues = [], { whole = false } = {}) {
  const timing = estimateTiming(text);
  // Without cues nothing needs sentence moments: the voice reads the text in one go.
  if (whole && timing.words.length) {
    timing.sentences = [{ firstWord: 0, lastWord: timing.words.length - 1, startMs: 0, endMs: timing.durationMs }];
  }
  const planned = cues.map((cue, order) => {
    const index = cue.quote ? findQuoteWord(timing.words, cue.quote, cue.occurrence || 1) : -1;
    if (index < 0) return { cue, order, sentence: 0, offsetMs: Math.min(0, cue.offsetMs || 0), anchored: false };
    const sentence = timing.sentences.findIndex((s) => index >= s.firstWord && index <= s.lastWord);
    return {
      cue, order, sentence,
      offsetMs: timing.words[index].startMs - timing.sentences[sentence].startMs + (cue.offsetMs || 0),
      anchored: true,
    };
  });
  return { timing, planned };
}

export function createTtsSpeechController({
  synth = globalThis.speechSynthesis,
  Utterance = globalThis.SpeechSynthesisUtterance,
  now = () => globalThis.performance.now(),
  clock = timers,
} = {}) {
  const available = Boolean(synth && typeof synth.speak === 'function' && typeof Utterance === 'function');
  let run = null;

  const pickVoice = (lang) => {
    const voices = synth?.getVoices?.() || [];
    const base = String(lang).toLowerCase().split('-')[0];
    return voices.find((v) => String(v.lang).toLowerCase() === String(lang).toLowerCase())
      || voices.find((v) => String(v.lang).toLowerCase().split(/[-_]/)[0] === base) || null;
  };

  const clearTimers = (state) => { for (const t of state.timers) clock.clear(t.id); state.timers.clear(); };
  const freezeTimers = (state) => {
    for (const timer of state.timers) {
      if (!timer.running) continue;
      clock.clear(timer.id);
      timer.running = false;
      timer.remaining = Math.max(0, timer.remaining - (now() - timer.since));
    }
  };
  const resumeTimers = (state) => {
    for (const timer of state.timers) if (!timer.running) timer.start();
  };
  const fire = (state, item) => {
    if (state.fired.has(item) || run !== state) return;
    state.fired.add(item);
    // Speech has priority over actions: a cue never holds the voice; the player sequences its own actions.
    try {
      const result = state.options.onCue?.(item.cue);
      if (result && typeof result.catch === 'function') result.catch(() => {});
    } catch { /* a failing cue must not stop the narration */ }
  };
  // A timer runs only while the voice is speaking: it counts down a delay that pause/resume freeze.
  const arm = (state, item, delay) => {
    /** @type {any} */
    const entry = { item, remaining: Math.max(0, delay), since: 0, id: 0, running: false };
    const start = () => {
      entry.since = now();
      entry.running = true;
      entry.id = clock.set(() => {
        entry.running = false;
        state.timers.delete(entry);
        fire(state, item);
      }, entry.remaining);
      entry.dueAt = now() + entry.remaining;
    };
    entry.start = start;
    state.timers.add(entry);
    if (state.physicallySpeaking) start();
  };

  const scheduleFor = (state, sentenceIndex, startedAt) => {
    const { plan, pace } = state;
    const span = plan.timing.sentences[sentenceIndex];
    const length = (span.endMs - span.startMs) * pace.scale;
    for (const item of plan.planned) {
      if (state.fired.has(item) || [...state.timers].some((t) => t.item === item)) continue;
      const delay = item.offsetMs * pace.scale;
      if (item.sentence === sentenceIndex) arm(state, item, delay);
      else if (item.sentence === sentenceIndex + 1 && delay < 0 && length + delay > 0) arm(state, item, length + delay);
      else if (item.sentence < sentenceIndex) fire(state, item);
    }
    state.sentenceStartedAt = startedAt;
  };

  const speakSentence = (state) => {
    if (run !== state) return;
    const { sentences, words } = state.plan.timing;
    if (state.index >= sentences.length) {
      if (state.completing) return;
      state.completing = true;
      state.physicallySpeaking = false;
      for (const item of state.plan.planned) fire(state, item);
      let finish = () => {
        if (run !== state) return;
        run = null;
        state.options.onEnd?.();
      };
      let completion;
      try {
        completion = state.options.beforeEnd?.();
      } catch (error) {
        if (run !== state) return;
        run = null;
        state.options.onError?.(error?.message || 'speech-error', error);
        return;
      }
      if (!completion || typeof completion.then !== 'function') {
        finish();
        return;
      }
      Promise.resolve(completion).then(finish).catch((error) => {
        if (run !== state) return;
        run = null;
        state.options.onError?.(error?.message || 'speech-error', error);
      });
      return;
    }
    const span = sentences[state.index];
    const text = state.text.slice(words[span.firstWord].start, words[span.lastWord].end);
    const utterance = new Utterance(text);
    utterance.lang = state.options.lang;
    const voice = pickVoice(state.options.lang);
    if (voice) utterance.voice = voice;
    utterance.rate = Number(state.options.rate) > 0 ? Number(state.options.rate) : 1;
    const current = () => run === state && state.utterance === utterance;
    let resumePhysicalSpeech = () => {
      if (!current()) return;
      if (state.pausedAt !== null) state.heldMs += Math.max(0, now() - state.pausedAt);
      state.pausedAt = null;
      state.paused = false;
      state.physicallySpeaking = true;
      for (const timer of state.timers) if (!timer.running) timer.start();
      state.options.onStart?.();
    };
    utterance.onstart = () => {
      if (!current()) return;
      if (state.sentenceActive) {
        resumePhysicalSpeech();
        return;
      }
      state.sentenceStartedAt = now();
      state.heldMs = 0;
      state.pausedAt = null;
      state.sentenceActive = true;
      state.paused = false;
      state.physicallySpeaking = true;
      if (!state.started || state.retrying) {
        state.started = true;
        state.retrying = false;
        state.options.onStart?.();
      }
      scheduleFor(state, state.index, state.sentenceStartedAt);
    };
    // The player counts a resumed voice as physically started again.
    utterance.onresume = resumePhysicalSpeech;
    utterance.onend = () => {
      if (!current()) return;
      state.sentenceActive = false;
      state.physicallySpeaking = false;
      let pausedDuration = state.pausedAt === null ? 0 : Math.max(0, now() - state.pausedAt);
      state.pace.observe(
        span.endMs - span.startMs,
        now() - state.sentenceStartedAt - state.heldMs - pausedDuration,
      );
      for (const item of state.plan.planned) if (item.sentence <= state.index) fire(state, item);
      clearTimers(state);
      state.index += 1;
      speakSentence(state);
    };
    utterance.onerror = (event) => {
      if (!current()) return;
      state.utterance = null;
      state.physicallySpeaking = false;
      if (event?.error === 'not-allowed') {
        state.sentenceActive = false;
        state.retrying = state.started;
        clearTimers(state);
        state.pending = true;
        state.options.onBlocked?.('autoplay-blocked', event);
        return;
      }
      if (event?.error === 'interrupted' || event?.error === 'canceled') return;
      run = null;
      state.options.onError?.(event?.error || 'speech-error');
    };
    state.utterance = utterance;
    state.pending = false;
    try { synth.speak(utterance); } catch (error) {
      state.utterance = null;
      if (error?.name === 'NotAllowedError') {
        state.retrying = state.started;
        state.pending = true;
        state.options.onBlocked?.('autoplay-blocked', error);
      }
      else { run = null; state.options.onError?.(error?.message || 'speech-error'); }
    }
  };

  const cancel = () => {
    const state = run;
    run = null;
    if (state) { clearTimers(state); if (state.utterance) { state.utterance.onstart = state.utterance.onresume = state.utterance.onend = state.utterance.onerror = null; } }
    synth?.cancel?.();
    if (synth?.paused) synth.resume?.();
  };

  return Object.freeze({
    available,
    speak(text, options = {}) {
      if (!available) return false;
      cancel();
      const source = String(text || '');
      const state = {
        text: source, options: { ...options, lang: options.lang || 'en' },
        plan: planCues(source, options.cues || [], { whole: !options.cues?.length }),
        pace: createPaceTracker({ initial: 1 / (Number(options.rate) > 0 ? Number(options.rate) : 1) }), index: 0, utterance: null, started: false,
        paused: false, sentenceActive: false, pending: options.startPaused === true,
        physicallySpeaking: false, completing: false,
        retrying: false,
        timers: new Set(), fired: new Set(), sentenceStartedAt: 0, heldMs: 0, pausedAt: null,
      };
      if (!splitWords(source).length) { queueMicrotask(() => options.onEnd?.()); return true; }
      // Restoring a position (a link, a seek): start at the sentence holding it; the cues before it are skipped.
      const startAt = Number(options.startAtMs) || 0;
      if (startAt > 0) {
        const { sentences } = state.plan.timing;
        const index = sentences.findIndex((span) => startAt < span.endMs);
        state.index = index < 0 ? sentences.length - 1 : index;
        for (const item of state.plan.planned) if (item.sentence < state.index) state.fired.add(item);
      }
      run = state;
      if (!state.pending) speakSentence(state);
      return true;
    },
    pause() {
      const state = run;
      if (!state || state.paused) return;
      state.paused = true;
      state.pausedAt = now();
      state.physicallySpeaking = false;
      synth?.pause?.();
      freezeTimers(state);
    },
    resume() {
      const state = run;
      if (!state) return false;
      if (state.pending) { state.pending = false; state.paused = false; speakSentence(state); return true; }
      state.paused = false;
      synth?.resume?.();
      resumeTimers(state);
      return true;
    },
    cancel,
    /**
     * The speech clock the presenter reads (words and position in estimated narration time), or null
     * while nothing is being narrated. The position follows the real start of the current sentence.
     */
    clock() {
      const state = run;
      if (
        !state
        || (state.plan.timing.sentences.length < 2 && !state.options.cues?.length)
      ) return null;
      const { words, sentences } = state.plan.timing;
      if (state.completing) {
        return { words, positionMs: state.plan.timing.durationMs, playing: false };
      }
      const span = sentences[Math.min(state.index, sentences.length - 1)];
      const until = state.paused ? state.pausedAt : now();
      const elapsed = state.started && state.sentenceActive
        ? Math.max(0, until - state.sentenceStartedAt - state.heldMs)
        : 0;
      const positionMs = state.sentenceActive
        ? Math.min(span.endMs + 120, span.startMs + elapsed / state.pace.scale)
        : span.startMs;
      return { words, positionMs, playing: state.physicallySpeaking && !state.paused };
    },
  });
}
