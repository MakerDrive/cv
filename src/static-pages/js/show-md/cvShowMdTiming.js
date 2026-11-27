import { createShowAlignedCueSchedule, SHOW_ALIGNED_SEQUENCE_VERSION } from 'symbiote-ui/chat/show-runtime';

/**
 * Builds a `workspace-aligned-sequence-v3` shaped word timeline for the browser voice from the speech engine's
 * word clock (`getClock().words`). The recorded voice already has such a sequence (Whisper alignment), so both
 * voices resolve the same canonical anchors through `createShowAlignedCueSchedule()`.
 *
 * Words are made monotonic and non-empty, because the canonical resolver rejects overlapping or zero-length
 * word timings as unreliable.
 *
 * @param {{
 *   words: Array<{ text: string, startMs: number, endMs: number }>,
 *   lang?: string,
 *   hash?: string,
 * }} input
 */
export function createBrowserVoiceAlignedSequence({ words, lang = 'ru', hash = '' }) {
  let normalized = [];
  let cursor = 0;
  for (let word of words || []) {
    let startMs = Math.max(cursor, Math.round(Number(word.startMs) || 0));
    let endMs = Math.max(startMs + 1, Math.round(Number(word.endMs) || 0));
    normalized.push({ text: String(word.text), startMs, endMs });
    cursor = endMs;
  }
  let durationMs = Math.max(1, cursor);
  let turnHash = hash || `browser-voice:${lang}:${normalized.length}:${durationMs}`;
  return Object.freeze({
    contractVersion: SHOW_ALIGNED_SEQUENCE_VERSION,
    timelineHash: `browser-voice-timeline:${turnHash}`,
    hash: `browser-voice-aligned:${turnHash}`,
    media: Object.freeze({
      hash: `browser-voice-media:${turnHash}`,
      durationMs,
      locale: lang,
    }),
    events: Object.freeze([]),
    turns: Object.freeze([
      Object.freeze({
        turnIndex: 0,
        speaker: 'browser-voice',
        startMs: 0,
        endMs: durationMs,
        words: Object.freeze(normalized.map((word) => Object.freeze(word))),
      }),
    ]),
  });
}

/**
 * Schedules the cues of one scene on a word timeline and reports the anchors that did not resolve to recognized
 * words (segment fallback), so a conversion or a browser run can list them.
 *
 * @param {Record<string, any>} sequence aligned sequence (recorded or browser voice)
 * @param {Array<Record<string, any>>} cues compiled cues from `parseCvShowMd()`
 */
export function scheduleSceneCues(sequence, cues) {
  let schedule = createShowAlignedCueSchedule(sequence, cues.map((cue) => ({
    cueId: cue.cueId,
    turnIndex: cue.turnIndex,
    at: cue.at,
    directive: cue.directive,
  })));
  let fallbacks = schedule
    .filter((item) => item.alignment.resolution === 'segment' && item.alignment.provenance.quote)
    .map((item) => ({ cueId: item.cueId, quote: item.alignment.provenance.quote, reason: item.alignment.provenance.fallbackReason }));
  return Object.freeze({ schedule, fallbacks: Object.freeze(fallbacks) });
}
