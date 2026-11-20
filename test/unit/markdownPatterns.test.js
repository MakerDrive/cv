import assert from 'node:assert/strict';
import test from 'node:test';

import { parseHTML } from 'linkedom';

import { transformMarkdownPatterns } from '../../src/static-pages/js/markdownPatterns.js';

const render = (html) => {
  const { document } = parseHTML(`<body><div class="cb-md">${html}</div></body>`);
  const root = document.querySelector('.cb-md');
  transformMarkdownPatterns(root);
  return root;
};

test('a paragraph of " | " parts becomes segments, ordinary prose does not', () => {
  const root = render('<p class="md-p">Product engineer | Full-Stack, R&amp;D | Tools for agents</p><p class="md-p">Use a | b in prose.</p><p class="md-p">Link <a href="#">x</a> | y | z</p>');
  const row = root.querySelector('.md-segments');
  assert.deepEqual([...row.querySelectorAll('.md-segment')].map((cell) => cell.textContent), ['Product engineer', 'Full-Stack, R&D', 'Tools for agents']);
  assert.equal(root.querySelectorAll('.md-segments').length, 1);
});

test('a list of **value** label items becomes metric cells, a mixed list stays a list', () => {
  const root = render('<ul class="md-list"><li><strong>15+</strong> Years in R&amp;D</li><li><strong>22</strong> Projects</li></ul><ul class="md-list"><li><strong>Note</strong> text</li><li>plain</li></ul>');
  const cells = [...root.querySelectorAll('.md-metric')].map((cell) => [cell.querySelector('.md-metric-value').textContent, cell.querySelector('.md-metric-label').textContent]);
  assert.deepEqual(cells, [['15+', 'Years in R&D'], ['22', 'Projects']]);
  assert.equal(root.querySelectorAll('ul.md-list').length, 1);
});

test('metric labels preserve links and inline formatting', () => {
  const root = render([
    '<ul class="md-list"><li><strong>15+</strong> ',
    '<a href="/projects/">projects</a> in <em>production</em></li></ul>',
  ].join(''));
  const label = root.querySelector('.md-metric-label');
  const link = root.querySelector('.md-metric-label a');
  assert.equal(label?.textContent, 'projects in production');
  assert.equal(link?.getAttribute('href'), '/projects/');
  assert.equal(link?.textContent, 'projects');
  assert.equal(label?.querySelector('em')?.textContent, 'production');
});

test('GitHub alert syntax becomes a callout with the marker removed', () => {
  const root = render('<blockquote class="md-quote">[!WARNING] Back up <strong>first</strong>.</blockquote><blockquote class="md-quote">plain quote</blockquote>');
  const callout = root.querySelector('.md-callout');
  assert.equal(callout.dataset.kind, 'warning');
  assert.equal(callout.querySelector('.md-callout-kind').textContent, 'WARNING');
  assert.equal(callout.querySelector('.md-callout-body').textContent.trim(), 'Back up first.');
  assert.equal(root.querySelectorAll('blockquote.md-quote').length, 1);
});

test('task list items get a checkbox cell with the checked state', () => {
  const root = render('<ul class="md-list"><li>[x] done</li><li>[ ] todo</li></ul>');
  const items = [...root.querySelectorAll('li')];
  assert.deepEqual(items.map((item) => item.getAttribute('aria-checked')), ['true', 'false']);
  assert.equal(items[0].textContent.trim(), 'done');
  assert.equal(items[0].querySelector('.md-check').hasAttribute('data-checked'), true);
  assert.equal(items[1].querySelector('.md-check').hasAttribute('data-checked'), false);
});

test('tables, pictures and code are numbered figures, and a second pass changes nothing', () => {
  const html = '<table class="md-table"><tbody><tr><td>a</td></tr></tbody></table><pre class="md-code-block"><code class="language-json">{}</code></pre><table class="md-table"><tbody><tr><td>b</td></tr></tbody></table>';
  const root = render(html);
  const labels = [...root.querySelectorAll('.notchset-figure-label span')].map((label) => label.textContent);
  assert.deepEqual(labels.sort(), ['CODE 01 · json', 'TBL 01', 'TBL 02']);
  const before = root.innerHTML;
  transformMarkdownPatterns(root);
  assert.equal(root.innerHTML, before);
});

test('the lines after the title become a meta row and a lead, other pages\' text stays', () => {
  const root = render('<h1 class="md-h">Agent Portal</h1><p class="md-p">2025-2026</p><p class="md-p"><strong>Featured project</strong></p><div class="cb-content-slot"></div><p class="md-p">An R&amp;D environment for engineering work with AI: project memory, context engineering and controlled delivery.</p><p class="md-p">Second paragraph stays plain and is long enough to be a lead too, but only the first one is.</p>');
  const meta = root.querySelector('.md-meta');
  assert.equal(meta.querySelector('.md-meta-period').textContent, '2025-2026');
  assert.equal(meta.querySelector('.md-meta-kind').textContent, 'Featured project');
  assert.equal(root.querySelectorAll('.md-lead').length, 1);
  assert.match(root.querySelector('.md-lead').textContent, /^An R&D environment/);
  assert.equal(root.querySelectorAll('p.md-p').length, 2);
});

test('a title with no meta lines still gets a lead, and a period inside prose is not meta', () => {
  const root = render('<h1 class="md-h">T</h1><p class="md-p">A first paragraph that is clearly long enough to count as the lead of the page.</p><p class="md-p">2026</p>');
  assert.equal(root.querySelectorAll('.md-meta').length, 0);
  assert.equal(root.querySelectorAll('.md-lead').length, 1);
});

test('a list of links becomes link rows, a paragraph of one link becomes a call to action', () => {
  const root = render('<ul class="md-list"><li><a href="#a">First</a></li><li><a href="#b">Second</a> — note</li></ul><ul class="md-list"><li>text <a href="#c">x</a></li></ul><p class="md-p"><a href="#d">Open the demo</a></p><p class="md-p">See <a href="#e">this</a> too</p>');
  assert.equal(root.querySelectorAll('ul.md-links').length, 1);
  assert.equal(root.querySelectorAll('ul.md-list').length, 2);
  assert.equal(root.querySelectorAll('p.md-cta').length, 1);
});

test('consecutive "Name — description" paragraphs become definition rows, a single one stays prose', () => {
  const root = render('<p class="md-p">Lifecycle Messaging Platform — Платформа сообщений с API и очередями.</p><p class="md-p">PhotoPizza Remote — Управление поворотным столом из браузера.</p><p class="md-p">A sentence without the pattern.</p><p class="md-p">Alone — one line of prose that happens to have a dash in it here.</p>');
  const rows = [...root.querySelectorAll('.md-defs dt')].map((term) => [
    term.textContent,
    term.nextElementSibling.textContent,
  ]);
  assert.equal(rows.length, 2);
  assert.equal(rows[0][0], 'Lifecycle Messaging Platform');
  assert.equal(root.querySelectorAll('p.md-p').length, 2);
  assert.equal(root.querySelectorAll('.md-defs dt').length, 2);
  assert.equal(root.querySelectorAll('.md-defs dd').length, 2);
});

test('definition rows after a title stay grouped and are not marked as a lead', () => {
  const root = render([
    '<h1 class="md-h">Projects</h1>',
    '<p class="md-p">First project — A sufficiently long project description '
      + 'that exceeds the minimum lead length.</p>',
    '<p class="md-p">Second project — Another sufficiently long project '
      + 'description for the definition list.</p>',
  ].join(''));
  assert.equal(root.querySelectorAll('.md-lead').length, 0);
  assert.equal(root.querySelectorAll('.md-defs dt').length, 2);
});
