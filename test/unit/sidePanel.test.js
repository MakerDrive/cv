import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test('side panel rename keeps Material Symbols markup instead of rendering an icon name as text', async () => {
  let source = await readFile(
    new URL('../../src/ui-components/universal/side-panel/side-panel.js', import.meta.url),
    'utf8',
  );
  let template = await readFile(
    new URL('../../src/ui-components/universal/side-panel/side-panel.tpl.js', import.meta.url),
    'utf8',
  );

  assert.match(source, /from '.\/side-panel\.tpl\.js'/);
  assert.doesNotMatch(source, /icon:\s*['"]arrow_forward['"]/);
  assert.match(
    template,
    /<span icon class="material-symbols-outlined">arrow_forward<\/span>/,
  );
  assert.doesNotMatch(template, /innerHTML[^\n]+icon/);
});
