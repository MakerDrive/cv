import { acquireShowDebug } from './debugMode.js';
import { getShowLog, SHOW_LEVELS_ORDER } from './index.js';

const ROW_LIMIT = 500;
const STYLE = /* css */ `
portfolio-console-panel { display: block; block-size: 100%; min-block-size: 0; }
portfolio-console-panel .sc-root {
  display: grid; grid-template-rows: auto 1fr; block-size: 100%; min-block-size: 0;
  background: #0b0b0a; color: #e8e6e1; font: 12px/1.45 ui-monospace, SFMono-Regular, Menlo, monospace;
}
portfolio-console-panel .sc-bar {
  display: flex; flex-wrap: wrap; gap: 6px; align-items: center; padding: 6px 8px;
  border-block-end: 1px solid #2c2b28; background: #141412;
}
portfolio-console-panel .sc-bar select, portfolio-console-panel .sc-bar input, portfolio-console-panel .sc-bar button {
  font: inherit; color: inherit; background: #1d1c1a; border: 1px solid #3a3935; border-radius: 0; padding: 2px 6px;
}
portfolio-console-panel .sc-bar input { min-inline-size: 90px; flex: 1 1 90px; }
portfolio-console-panel .sc-bar button { cursor: pointer; }
portfolio-console-panel .sc-bar button:hover { border-color: #ff5a2e; }
portfolio-console-panel .sc-checks { margin-inline-start: auto; color: #8fd18f; }
portfolio-console-panel .sc-checks[data-state="issues"] { color: #ff7b6b; font-weight: 600; }
portfolio-console-panel .sc-count { color: #8d8a82; }
portfolio-console-panel .sc-rows { overflow: auto; padding: 4px 8px 12px; min-block-size: 0; }
portfolio-console-panel .sc-row { white-space: pre-wrap; word-break: break-word; padding: 1px 0; }
portfolio-console-panel .sc-t { color: #77746c; }
portfolio-console-panel .sc-src { color: #8fb7ff; }
portfolio-console-panel .sc-row[data-level="debug"] { color: #8d8a82; }
portfolio-console-panel .sc-row[data-level="warn"] { color: #ffcf6b; }
portfolio-console-panel .sc-row[data-level="error"] { color: #ff7b6b; }
portfolio-console-panel .sc-data { color: #b9b5aa; }
`;

function ensureStyle(doc) {
  if (doc.getElementById('show-console-style')) return;
  const style = doc.createElement('style');
  style.id = 'show-console-style';
  style.textContent = STYLE;
  doc.head.append(style);
}

/** Console of the CV Show: live view of the shared show log. */
export class ShowConsolePanel extends HTMLElement {
  #unsubscribe = null;
  #releaseDebug = null;
  #frame = 0;
  #sources = new Set();
  #follow = true;

  connectedCallback() {
    if (this._ready) return;
    this._ready = true;
    ensureStyle(this.ownerDocument);
    this.innerHTML = /* html */ `
      <div class="sc-root">
        <div class="sc-bar">
          <select data-sc="level" aria-label="Level">
            ${SHOW_LEVELS_ORDER.map((level) => `<option value="${level}">${level}</option>`).join('')}
          </select>
          <select data-sc="source" aria-label="Source"><option value="">all sources</option></select>
          <input data-sc="text" type="search" placeholder="filter: text, entry, cell" aria-label="Filter">
          <button type="button" data-sc="copy">Copy report</button>
          <button type="button" data-sc="clear">Clear</button>
          <span class="sc-checks" data-sc="checks" title="Violations found by the debug checks"></span>
          <span class="sc-count" data-sc="count"></span>
        </div>
        <div class="sc-rows" data-sc="rows" role="log" aria-live="off"></div>
      </div>`;
    const q = (name) => this.querySelector(`[data-sc="${name}"]`);
    this.$level = q('level');
    this.$source = q('source');
    this.$text = q('text');
    this.$rows = q('rows');
    this.$count = q('count');
    this.$checks = q('checks');
    this.$level.value = 'info';
    for (const control of [this.$level, this.$source, this.$text]) {
      control.addEventListener('input', () => this.#schedule());
    }
    q('clear').addEventListener('click', () => getShowLog().clear());
    q('copy').addEventListener('click', async (event) => {
      const button = event.currentTarget;
      const text = getShowLog().report({ filter: (entry) => this.#matches(entry), tail: ROW_LIMIT });
      try {
        await navigator.clipboard.writeText(text);
        button.textContent = 'Copied';
      } catch {
        const area = this.ownerDocument.createElement('textarea');
        area.value = text;
        this.append(area);
        area.select();
        this.ownerDocument.execCommand?.('copy');
        area.remove();
        button.textContent = 'Copied';
      }
      setTimeout(() => { button.textContent = 'Copy report'; }, 1400);
    });
    this.$rows.addEventListener('scroll', () => {
      const rows = this.$rows;
      this.#follow = rows.scrollHeight - rows.scrollTop - rows.clientHeight < 24;
    });
    // A console that exists in the layout is the debug mode: the probe and the
    // checks run meanwhile, also while it is collapsed to a rail so that it does
    // not cover the scene. Removing the panel from the layout ends the mode.
    this.#releaseDebug = acquireShowDebug(this.ownerDocument);
    this.#unsubscribe = getShowLog().subscribe(() => this.#schedule());
    this.#render();
  }

  disconnectedCallback() {
    this.#unsubscribe?.();
    this.#unsubscribe = null;
    this.#releaseDebug?.();
    this.#releaseDebug = null;
    cancelAnimationFrame(this.#frame);
    this._ready = false;
  }

  #matches(entry) {
    const level = SHOW_LEVELS_ORDER.indexOf(this.$level.value);
    if (SHOW_LEVELS_ORDER.indexOf(entry.level) < level) return false;
    if (this.$source.value && entry.source !== this.$source.value) return false;
    const text = this.$text.value.trim().toLowerCase();
    if (!text) return true;
    const haystack = `${entry.source}.${entry.type} ${entry.entry} ${JSON.stringify(entry.data)}`.toLowerCase();
    return haystack.includes(text);
  }

  #schedule() {
    if (this.#frame) return;
    this.#frame = requestAnimationFrame(() => {
      this.#frame = 0;
      this.#render();
    });
  }

  #render() {
    const all = getShowLog().entries();
    for (const entry of all) {
      if (!this.#sources.has(entry.source)) {
        this.#sources.add(entry.source);
        const option = this.ownerDocument.createElement('option');
        option.value = entry.source;
        option.textContent = entry.source;
        this.$source.append(option);
      }
    }
    const rows = all.filter((entry) => this.#matches(entry)).slice(-ROW_LIMIT);
    const fragment = this.ownerDocument.createDocumentFragment();
    for (const entry of rows) {
      const row = this.ownerDocument.createElement('div');
      row.className = 'sc-row';
      row.dataset.level = entry.level;
      const time = (entry.at / 1000).toFixed(2).padStart(7);
      const show = entry.showMs === null ? '' : ` show=${entry.showMs}`;
      const data = entry.data && Object.keys(entry.data).length ? ` ${JSON.stringify(entry.data)}` : '';
      const head = this.ownerDocument.createElement('span');
      head.className = 'sc-t';
      head.textContent = `${time}s${show} `;
      const name = this.ownerDocument.createElement('span');
      name.className = 'sc-src';
      name.textContent = `${entry.source}.${entry.type}`;
      const body = this.ownerDocument.createElement('span');
      body.className = 'sc-data';
      body.textContent = data;
      row.append(head, name, body);
      fragment.append(row);
    }
    this.$rows.replaceChildren(fragment);
    this.$count.textContent = `${rows.length}/${all.length}`;
    const found = all.filter((entry) => entry.source === 'check' || entry.level === 'error').length;
    this.$checks.textContent = found ? `${found} issue${found === 1 ? '' : 's'}` : 'checks ok';
    this.$checks.dataset.state = found ? 'issues' : 'ok';
    if (this.#follow) this.$rows.scrollTop = this.$rows.scrollHeight;
  }
}

if (!customElements.get('portfolio-console-panel')) {
  customElements.define('portfolio-console-panel', ShowConsolePanel);
}
