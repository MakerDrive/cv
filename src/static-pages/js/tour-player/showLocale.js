/**
 * Localized narration of the Show for languages that have no recorded audio. A locale supplies the
 * texts of every scene and branch (keyed by their ids) and the phrase each timed directive is
 * anchored to; the story structure, targets and choreography stay those of the verified story.
 *
 * Locale shape:
 *   { scenes: { [sceneId]: Entry }, branches: { [branchId]: Entry } }
 *   Entry = { title?, subtitle, speech?, chat?: { text?, actionLabel? }, quotes?: { [directiveId]: phrase } }
 * `speech` is what the voice reads and what is shown as the caption unless `subtitle` differs (each defaults to the other); a quote must occur in `speech`.
 * A directive without a quote in the locale keeps no timing of its own and fires with the entry start.
 */
import { estimateTiming, findQuoteWord, splitWords } from './ttsTiming.js';

const directiveQuote = (directive) => String(directive?.timing?.quote || '');

const localizeDirectives = (directives, quotes = {}) => (directives || []).map((directive) => {
  if (!directiveQuote(directive)) return directive;
  const quote = quotes[directive.id];
  const { quote: _own, occurrence: _occurrence, ...timing } = directive.timing;
  return quote
    ? { ...directive, timing: { ...timing, quote, occurrence: 1 } }
    : { ...directive, timing };
});

const localizeEntry = (entry, text) => {
  if (!text) return entry;
  const speech = text.speech ?? text.subtitle ?? entry.speech;
  const localized = {
    ...entry,
    title: text.title ?? entry.title,
    subtitle: text.subtitle ?? text.speech ?? entry.subtitle,
    speech,
    directives: localizeDirectives(entry.directives, text.quotes),
  };
  if (entry.chat) localized.chat = { ...entry.chat, ...(text.chat || {}) };
  return localized;
};

/**
 * @param {any} story verified (Russian) story
 * @param {string} lang locale code
 * @param {{ scenes?: Record<string, any>, branches?: Record<string, any> }} locale
 */
export function localizeShowStory(story, lang, locale) {
  const scenes = story.scenes.map((scene) => localizeEntry(scene, locale.scenes?.[scene.id]));
  const branches = Object.fromEntries(Object.entries(story.branches || {})
    .map(([id, branch]) => [id, localizeEntry(branch, locale.branches?.[id])]));
  // Without recorded audio the composition clock runs on the estimated length of each narration.
  const durations = Object.fromEntries([...scenes, ...Object.entries(branches).map(([id, b]) => ({ ...b, id }))]
    .map((entry) => [entry.id, Math.max(1_000, Math.round(estimateTiming(entry.speech).durationMs) + 600)]));
  return { ...story, narrationLocale: lang, scenes, branches, durations };
}

/**
 * Problems that make a locale unusable or untimed: missing entries or speech, quotes absent from
 * the speech. Empty array = complete.
 * @returns {string[]}
 */
export function validateShowLocale(story, locale) {
  const problems = [];
  const check = (kind, entry, text) => {
    const where = `${kind} ${entry.id}`;
    if (!text) { problems.push(`${where}: missing`); return; }
    const speech = text.speech ?? text.subtitle;
    if (!String(speech || '').trim()) { problems.push(`${where}: no speech`); return; }
    const words = splitWords(speech);
    for (const directive of entry.directives || []) {
      if (!directiveQuote(directive)) continue;
      const quote = text.quotes?.[directive.id];
      if (!quote) problems.push(`${where}: no quote for ${directive.id}`);
      else if (findQuoteWord(words, quote) < 0) problems.push(`${where}: quote of ${directive.id} not in speech`);
    }
  };
  for (const scene of story.scenes) check('scene', scene, locale?.scenes?.[scene.id]);
  for (const [id, branch] of Object.entries(story.branches || {})) check('branch', { ...branch, id }, locale?.branches?.[id]);
  return problems;
}

/** Source texts of the story in the locale shape, to be translated. */
export function showLocaleTemplate(story) {
  const entryTemplate = (entry) => ({
    title: entry.title,
    subtitle: entry.subtitle,
    ...(entry.speech !== entry.subtitle ? { speech: entry.speech } : {}),
    ...(entry.chat ? { chat: { ...(entry.chat.text ? { text: entry.chat.text } : {}), ...(entry.chat.actionLabel ? { actionLabel: entry.chat.actionLabel } : {}) } } : {}),
    quotes: Object.fromEntries((entry.directives || []).filter(directiveQuote).map((d) => [d.id, directiveQuote(d)])),
  });
  return {
    scenes: Object.fromEntries(story.scenes.map((scene) => [scene.id, entryTemplate(scene)])),
    branches: Object.fromEntries(Object.entries(story.branches || {}).map(([id, branch]) => [id, entryTemplate(branch)])),
  };
}
