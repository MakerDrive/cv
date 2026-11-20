/**
 * Estimated narration timing for browser speech (TTS), where no recorded audio and no forced
 * alignment exist. Pure functions: text in, word and sentence times out.
 *
 * The model was fitted on the recorded Russian narration (4,339 aligned words): a word lasts about
 * `WORD_BASE_MS + WORD_LETTER_MS * letters`, a sentence end adds a pause and a comma a shorter one.
 * A voice speaks faster or slower than the fit, so everything is scaled by one factor that the
 * caller keeps adjusting from what the voice actually does (see `createPaceTracker`).
 */

export const WORD_BASE_MS = 210;
export const WORD_LETTER_MS = 44.5;
export const SENTENCE_PAUSE_MS = 280;
export const COMMA_PAUSE_MS = 250;

const LETTER = /[\p{L}\p{N}]/gu;
const SENTENCE_END = /[.!?…]+["»”')\]]*$/u;
const COMMA_END = /[,;:—–-]["»”')\]]*$/u;

const letterCount = (text) => (text.match(LETTER) || []).length;

/**
 * Words of a text with their character ranges.
 * @param {string} text
 * @returns {Array<{ text: string, start: number, end: number }>}
 */
export function splitWords(text) {
  const words = [];
  const pattern = /\S+/gu;
  let match;
  while ((match = pattern.exec(String(text || '')))) {
    words.push({ text: match[0], start: match.index, end: match.index + match[0].length });
  }
  return words;
}

/**
 * Sentences as ranges of word indexes, cut after a word that ends with . ! ? or an ellipsis.
 * @param {Array<{ text: string }>} words
 * @returns {Array<{ firstWord: number, lastWord: number }>}
 */
export function splitSentences(words) {
  const sentences = [];
  let first = 0;
  words.forEach((word, index) => {
    if (SENTENCE_END.test(word.text) || index === words.length - 1) {
      sentences.push({ firstWord: first, lastWord: index });
      first = index + 1;
    }
  });
  return sentences;
}

/**
 * Estimated start and end time of every word, in ms from the start of the text, and of every sentence.
 * @param {string} text
 * @param {{ scale?: number }} [options] `scale` stretches the whole estimate (1 = the fitted voice)
 * @returns {{ words: Array<{ text: string, start: number, end: number, startMs: number, endMs: number }>,
 *   sentences: Array<{ firstWord: number, lastWord: number, startMs: number, endMs: number }>, durationMs: number }}
 */
export function estimateTiming(text, { scale = 1 } = {}) {
  const base = splitWords(text);
  let clock = 0;
  const words = base.map((word) => {
    const duration = (WORD_BASE_MS + WORD_LETTER_MS * letterCount(word.text)) * scale;
    const timed = { ...word, startMs: clock, endMs: clock + duration };
    clock += duration;
    if (SENTENCE_END.test(word.text)) clock += SENTENCE_PAUSE_MS * scale;
    else if (COMMA_END.test(word.text)) clock += COMMA_PAUSE_MS * scale;
    return timed;
  });
  const sentences = splitSentences(words).map((range) => ({
    ...range,
    startMs: words[range.firstWord].startMs,
    endMs: words[range.lastWord].endMs,
  }));
  return { words, sentences, durationMs: words.length ? words[words.length - 1].endMs : 0 };
}

const normalizeWord = (value) => String(value || '').toLowerCase().replace(/[^\p{L}\p{N}]+/gu, '');

/**
 * Index of the word where the `occurrence`-th match of a phrase begins (words compared without
 * case and punctuation), or -1.
 * @param {Array<{ text: string }>} words
 * @param {string} quote
 * @param {number} [occurrence] 1-based
 */
export function findQuoteWord(words, quote, occurrence = 1) {
  const wanted = splitWords(quote).map((word) => normalizeWord(word.text)).filter(Boolean);
  if (!wanted.length) return -1;
  const have = words.map((word) => normalizeWord(word.text));
  let seen = 0;
  for (let start = 0; start + wanted.length <= have.length; start += 1) {
    if (wanted.every((item, offset) => have[start + offset] === item) && ++seen === occurrence) return start;
  }
  return -1;
}

/**
 * Keeps the voice's real pace: after each sentence the measured duration is compared with the
 * estimate and an exponential average of the ratio becomes the scale for what is still to come.
 * @param {{ initial?: number, weight?: number, min?: number, max?: number }} [options]
 */
export function createPaceTracker({ initial = 1, weight = 0.35, min = 0.4, max = 2.5 } = {}) {
  let scale = initial;
  return {
    get scale() { return scale; },
    /** @param {number} estimatedMs duration at scale 1 @param {number} measuredMs what the voice took */
    observe(estimatedMs, measuredMs) {
      if (!(estimatedMs > 200) || !(measuredMs > 200)) return scale;
      const ratio = Math.min(max, Math.max(min, measuredMs / estimatedMs));
      scale += (ratio - scale) * weight;
      return scale;
    },
  };
}
