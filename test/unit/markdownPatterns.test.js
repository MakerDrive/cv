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
