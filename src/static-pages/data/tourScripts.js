import { loadPortfolioMarkdownContent } from './markdownContent.js';
import { TOUR_BEATS, TOUR_MODES } from './tourManifest.js';

function freezeDeep(value) {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
  for (const child of Object.values(value)) freezeDeep(child);
  return Object.freeze(value);
}

export function parseTourMarkdownSource(content, locale, manifest = TOUR_BEATS) {
  if (typeof content !== 'string' || !content.trim()) {
    throw new Error(`Tour Markdown is empty for ${locale}`);
  }

  const headings = [...content.matchAll(/^##\s+([^\n]+)\n/gm)];
  if (!headings.length) throw new Error(`Tour Markdown has no beats for ${locale}`);

  const beats = [];
  const seen = new Set();
  for (let index = 0; index < headings.length; index += 1) {
    const heading = headings[index];
    const header = heading[1].trim();
    const match = /^([a-z0-9-]+)\s+\/\s+(.+)$/.exec(header);
    if (!match) throw new Error(`Invalid tour Markdown header in ${locale}: ${header}`);

    const [, id, title] = match;
    if (seen.has(id)) throw new Error(`Duplicate tour beat in ${locale}: ${id}`);
    seen.add(id);

    const bodyStart = heading.index + heading[0].length;
    const bodyEnd = headings[index + 1]?.index ?? content.length;
    const text = content.slice(bodyStart, bodyEnd).trim();
    if (!title.trim() || !text) throw new Error(`Empty tour title or body in ${locale}: ${id}`);
    beats.push({ id, title: title.trim(), text });
  }

  if (beats.length !== manifest.length) {
    throw new Error(`Tour beat count mismatch in ${locale}: expected ${manifest.length}, received ${beats.length}`);
  }
  for (let index = 0; index < manifest.length; index += 1) {
    if (beats[index].id !== manifest[index].id) {
      throw new Error(`Tour beat mismatch in ${locale} at ${index}: expected ${manifest[index].id}, received ${beats[index].id}`);
    }
  }
  return freezeDeep(beats);
}

function loadLocale(locale) {
  return Object.freeze({
    beats: parseTourMarkdownSource(
      loadPortfolioMarkdownContent(`tours/${locale}.md`),
      locale,
    ),
  });
}

export const TOUR_STORY = freezeDeep({
  modes: TOUR_MODES,
  beats: TOUR_BEATS,
  locales: {
    en: loadLocale('en'),
    ru: loadLocale('ru'),
    es: loadLocale('es'),
  },
});
