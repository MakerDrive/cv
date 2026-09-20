// TTS pronunciation normalization for CV Show narration.
// Word-level replacements applied to narration text before it reaches
// either the browser speechSynthesis fallback or a cloud TTS request.
// Keys match literal words; each value is the string the engine reads.
// Rule of thumb: if a token shows up that we later regret in a review
// recording, it goes here, never into an authoring-project paragraph.

const PRONUNCIATION_DICTIONARY = new Map(Object.entries({
  // Brands and project names
  'MEGAVISOR': 'Мегавизор',
  'Symbiote': 'Симбиот',
  'Watsonx': 'Уотсон Икс',
  'AUTOBOX': 'Автобокс',
  'Agile Controller': 'Эджайл Контроллер',
  'F360': 'Эфф триста шестьдесят',
  'PhotoPizza': 'Фото Пицца',
  'PhotoSnail': 'ФотоСнэил',
  'ComplexScan': 'Комплекс скан',
  'BoothBot': 'Бут Бот',
  'R&D': 'эр энд дэ',

  // Latin shorthands written in Cyrillic transliteration are already
  // faithful to Russian speech; the ones below are only automated
  // replacements for brand names that carry letters not meant to be read
  // as words.
  'Wi‑Fi': 'Вай-Фай',
  'Wi-Fi': 'Вай-Фай',
}));

function buildWordBoundaryRegex() {
  return new RegExp(
    `\\b(${Array.from(PRONUNCIATION_DICTIONARY.keys())
      .map((key) => key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
      .join('|')})\\b`,
    'gu',
  );
}

const WORD_BOUNDARY_REGEX = buildWordBoundaryRegex();

export function normalizeCvShowNarrationText(text) {
  const value = String(text ?? '');
  if (!value) return value;
  return value.replace(WORD_BOUNDARY_REGEX, (match) => PRONUNCIATION_DICTIONARY.get(match) ?? match);
}

export function normalizeCvShowLocaleNarration(text, locale = document.documentElement?.lang || '') {
  const normalized = normalizeCvShowNarrationText(text);
  return locale.startsWith('ru') ? normalized : normalized;
}
