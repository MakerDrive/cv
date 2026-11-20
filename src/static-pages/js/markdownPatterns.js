/**
 * Markdown patterns that become designed elements, so writing plain markdown is enough to get the
 * Notchset look. Every transform works on the rendered `.cb-md` DOM and is idempotent.
 *
 *   A | B | C                       a paragraph of 3+ ` | ` parts -> a row of segments
 *   - **15+** Years in R&D          a list of `**value** label`   -> metric cells
 *   > [!NOTE] text                  GitHub alert syntax           -> a callout (NOTE, TIP, WARNING, IMPORTANT, STATUS)
 *   - [x] done / - [ ] to do        task list items               -> checkbox cells
 *   table, picture, code block      -> a figure with corner crosses and a label (TBL 01, FIG 01, CODE 01 · JSON)
 */

const SEGMENT_SEPARATOR = ' | ';
const MIN_SEGMENTS = 3; // two parts around one bar read as prose, three or more as a row
const MAX_SEGMENT_CHARS = 90;
const MAX_SEGMENT_PARAGRAPH_CHARS = 280;
const METRIC_VALUE = /^[~≈<>+\-]?\d[\d\s.,]*[+%×xхkKмМ]?\p{L}{0,3}[+%]?$/u;
const CALLOUT = /^\[!(NOTE|TIP|WARNING|IMPORTANT|STATUS)\]\s*/i;
const TASK = /^\[( |x|X)\]\s+/;

const create = (doc, tag, className, text) => {
  const element = doc.createElement(tag);
  if (className) element.className = className;
  if (text !== undefined) element.textContent = text;
  return element;
};

/** A paragraph that is only text parts separated by ` | ` becomes a row of segments. */
function transformSegments(root) {
  const doc = root.ownerDocument;
  for (const paragraph of root.querySelectorAll('p.md-p:not([data-md-pattern])')) {
    if (paragraph.children.length) continue;
    const text = paragraph.textContent || '';
    if (!text.includes(SEGMENT_SEPARATOR) || text.length > MAX_SEGMENT_PARAGRAPH_CHARS) continue;
    const parts = text.split(SEGMENT_SEPARATOR).map((part) => part.trim()).filter(Boolean);
    if (parts.length < MIN_SEGMENTS || parts.some((part) => part.length > MAX_SEGMENT_CHARS)) continue;
    const row = create(doc, 'p', 'md-segments');
    row.dataset.mdPattern = 'segments';
    row.setAttribute('aria-label', parts.join(', '));
    for (const part of parts) row.append(create(doc, 'span', 'md-segment', part));
    paragraph.replaceWith(row);
  }
}

/** A list whose every item is `**value** label` becomes metric cells. */
function transformMetrics(root) {
  const doc = root.ownerDocument;
  for (const list of root.querySelectorAll('ul.md-list:not([data-md-pattern])')) {
    const items = [...list.children].filter((child) => child.tagName === 'LI');
    const cells = items.map((item) => {
      const first = item.firstElementChild;
      if (!first || first.tagName !== 'STRONG' || item.firstChild !== first) return null;
      const value = (first.textContent || '').trim();
      if (!METRIC_VALUE.test(value)) return null;
      const label = (item.textContent || '').slice((first.textContent || '').length).replace(/^[\s:—–-]+/, '').trim();
      return label ? { value, label } : null;
    });
    if (!items.length || cells.some((cell) => !cell)) continue;
    const grid = create(doc, 'div', 'md-metrics');
    grid.dataset.mdPattern = 'metrics';
    for (const cell of cells) {
      const metric = create(doc, 'div', 'md-metric');
      metric.append(create(doc, 'span', 'md-metric-value', cell.value), create(doc, 'span', 'md-metric-label', cell.label));
      grid.append(metric);
    }
    list.replaceWith(grid);
  }
}

/** `> [!NOTE] text` becomes a callout with a mono kind label. */
function transformCallouts(root) {
  const doc = root.ownerDocument;
  for (const quote of root.querySelectorAll('blockquote.md-quote:not([data-md-pattern])')) {
    const match = CALLOUT.exec(quote.textContent || '');
    if (!match) continue;
    const callout = create(doc, 'div', 'md-callout');
    callout.dataset.mdPattern = 'callout';
    callout.dataset.kind = match[1].toLowerCase();
    const body = create(doc, 'div', 'md-callout-body');
    // The marker is plain text at the start of the quote; drop it and keep the rest as it is.
    const walker = doc.createTreeWalker(quote, 4);
    const firstText = walker.nextNode();
    if (firstText) firstText.textContent = firstText.textContent.replace(CALLOUT, '');
    while (quote.firstChild) body.append(quote.firstChild);
    callout.append(create(doc, 'div', 'md-callout-kind', match[1].toUpperCase()), body);
    quote.replaceWith(callout);
  }
}

/** `- [x]` / `- [ ]` items get a checkbox cell. */
function transformTasks(root) {
  const doc = root.ownerDocument;
  for (const item of root.querySelectorAll('ul.md-list li:not([data-md-pattern])')) {
    const first = item.firstChild;
    if (!first || first.nodeType !== 3) continue;
    const match = TASK.exec(first.textContent);
    if (!match) continue;
    first.textContent = first.textContent.replace(TASK, '');
    const box = create(doc, 'span', 'md-check');
    box.setAttribute('aria-hidden', 'true');
    if (match[1] !== ' ') box.dataset.checked = '';
    item.dataset.mdPattern = 'task';
    item.setAttribute('role', 'checkbox');
    item.setAttribute('aria-checked', String(match[1] !== ' '));
    item.prepend(box);
    item.parentElement?.classList.add('md-tasks');
  }
}

const FIGURE_KINDS = [
  { selector: 'table.md-table', code: 'TBL' },
  { selector: 'img.md-img', code: 'FIG' },
  { selector: 'pre.md-code-block', code: 'CODE' },
];

/** A table, picture or code block sits in a figure with corner crosses and a label. */
function transformFigures(root, { copyText } = {}) {
  const doc = root.ownerDocument;
  for (const { selector, code } of FIGURE_KINDS) {
    const all = [...root.querySelectorAll(selector)];
    for (const element of all) {
      if (element.hasAttribute('data-md-figure')) continue;
      element.setAttribute('data-md-figure', '');
      const figure = create(doc, 'figure', `notchset-figure notchset-figure-${code.toLowerCase()}`);
      const bar = create(doc, 'div', 'notchset-figure-label');
      const tag = `${code} ${String(all.indexOf(element) + 1).padStart(2, '0')}`;
      if (code === 'CODE') {
        const language = /language-([\w-]+)/.exec(element.querySelector('code')?.className || '')?.[1] || 'text';
        bar.append(create(doc, 'span', '', `${tag} · ${language}`));
        const copy = create(doc, 'button', 'notchset-code-copy material-symbols-outlined', 'content_copy');
        copy.type = 'button';
        copy.setAttribute('aria-label', 'Copy');
        copy.title = 'Copy';
        copy.addEventListener('click', async () => {
          try {
            await (copyText || ((text) => doc.defaultView.navigator.clipboard.writeText(text)))(element.textContent || '');
            copy.textContent = 'check';
            doc.defaultView.setTimeout(() => { copy.textContent = 'content_copy'; }, 1400);
          } catch { /* clipboard unavailable */ }
        });
        bar.append(copy);
      } else {
        bar.append(create(doc, 'span', '', tag));
      }
      element.replaceWith(figure);
      figure.append(bar, element);
    }
  }
}

/** Applies every pattern under `root` (a rendered `.cb-md`, or a container of them). */
export function transformMarkdownPatterns(root, options = {}) {
  transformSegments(root);
  transformMetrics(root);
  transformCallouts(root);
  transformTasks(root);
  transformFigures(root, options);
}

/**
 * Keeps rendered markdown in `selector` transformed as it appears (the viewer renders after load
 * and on every page change).
 * @returns {() => void} stop function
 */
export function startMarkdownPatterns(doc = document, selector = 'portfolio-workspace code-block .cb-md') {
  const win = doc.defaultView;
  const run = () => { for (const root of doc.querySelectorAll(selector)) transformMarkdownPatterns(root); };
  let pending = false;
  const observer = new win.MutationObserver(() => {
    if (pending) return;
    pending = true;
    win.requestAnimationFrame(() => { pending = false; run(); });
  });
  observer.observe(doc.body, { childList: true, subtree: true });
  run();
  return () => observer.disconnect();
}
