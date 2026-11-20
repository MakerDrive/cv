/**
 * Show log: one in-memory ring buffer of structured events for the CV Show
 * (player, playback pump, speech, presenter robot). Errors stay out of the
 * chat: the chat shows a plain-language note, the details land here and can be
 * read in the console panel or copied as one report.
 *
 * The log never leaves the page by itself and holds no personal data.
 */

const LIMIT = 3000;
const GLOBAL_KEY = '__cvShowLog';
const LEVELS = Object.freeze({ debug: 0, info: 1, warn: 2, error: 3 });

function cleanValue(value, depth = 0) {
  if (value === null || value === undefined) return value;
  if (typeof value === 'number') return Number.isFinite(value) ? Math.round(value * 100) / 100 : null;
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') return value.length > 240 ? `${value.slice(0, 240)}…` : value;
  if (depth >= 3) return String(value).slice(0, 80);
  if (Array.isArray(value)) return value.slice(0, 12).map((item) => cleanValue(item, depth + 1));
  if (value instanceof Error) return { name: value.name, message: String(value.message).slice(0, 240), code: 'code' in value ? value.code : undefined };
  if (typeof value === 'object') {
    const out = {};
    for (const key of Object.keys(value).slice(0, 24)) out[key] = cleanValue(value[key], depth + 1);
    return out;
  }
  return undefined;
}

function createShowLog({ limit = LIMIT } = {}) {
  const entries = [];
  const listeners = new Set();
  const startedAt = Date.now();
  let sequence = 0;
  let context = () => ({});

  const notify = (entry) => {
    for (const listener of listeners) {
      try { listener(entry); } catch { /* a broken view must not break logging */ }
    }
  };

  const api = {
    /** Supplies extra fields (show time, entry id) stamped on every record. */
    setContext(provider) { context = typeof provider === 'function' ? provider : () => ({}); },
    log(source, type, data = {}, level = 'info') {
      let extra = {};
      try { extra = context() || {}; } catch { /* context is best effort */ }
      const entry = Object.freeze({
        id: ++sequence,
        at: Date.now() - startedAt,
        level: level in LEVELS ? level : 'info',
        source: String(source),
        type: String(type),
        showMs: Number.isFinite(extra.showMs) ? Math.round(extra.showMs) : null,
        entry: extra.entry ? String(extra.entry) : '',
        data: cleanValue(data),
      });
      entries.push(entry);
      // When full, the periodic debug samples go first: they must not push the
      // events that explain a failure out of the buffer.
      while (entries.length > limit) {
        const oldestDebug = entries.findIndex((item) => item.level === 'debug');
        entries.splice(oldestDebug >= 0 ? oldestDebug : 0, 1);
      }
      notify(entry);
      return entry;
    },
    debug(source, type, data) { return api.log(source, type, data, 'debug'); },
    info(source, type, data) { return api.log(source, type, data, 'info'); },
    warn(source, type, data) { return api.log(source, type, data, 'warn'); },
    error(source, type, data) { return api.log(source, type, data, 'error'); },
    entries() { return entries.slice(); },
    clear() { entries.length = 0; notify(null); },
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    /** Plain-text report to paste into a bug conversation. */
    report({ filter = () => true, tail = 400 } = {}) {
      const rows = entries.filter(filter).slice(-tail).map((entry) => {
        const time = (entry.at / 1000).toFixed(2).padStart(8);
        const show = entry.showMs === null ? '' : ` show=${entry.showMs}`;
        const where = entry.entry ? ` entry=${entry.entry}` : '';
        return `${time}s ${entry.level.toUpperCase().padEnd(5)} ${entry.source}.${entry.type}${show}${where} ${JSON.stringify(entry.data ?? {})}`;
      });
      const head = [
        'CV Show report',
        `url: ${globalThis.location?.href || ''}`,
        `agent: ${globalThis.navigator?.userAgent || ''}`,
        `viewport: ${globalThis.innerWidth}x${globalThis.innerHeight}`,
        `records: ${rows.length}/${entries.length}`,
        '',
      ];
      return head.concat(rows).join('\n');
    },
  };
  return Object.freeze(api);
}

/** The shared log of the page (the lazy Show bundle and the console panel use one). */
export function getShowLog() {
  if (!globalThis[GLOBAL_KEY]) globalThis[GLOBAL_KEY] = createShowLog();
  return globalThis[GLOBAL_KEY];
}

export const SHOW_LOG_LEVELS = LEVELS;
export const SHOW_LEVELS_ORDER = Object.freeze(Object.keys(LEVELS));
