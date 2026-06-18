import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import test from 'node:test';

test('portfolio skills keep R&D central while separating hardware capture', async () => {
  let source = await readFile(new URL('../../src/static-pages/js/index.js', import.meta.url), 'utf8');

  assert.match(source, /id: 'skills\/rnd-engineering'/);
  assert.match(source, /id: 'skills\/hardware-capture'/);
  assert.match(source, /let result = \['skills\/rnd-engineering'\];/);
  assert.doesNotMatch(source, /skills\/automation/);
});

test('portfolio skill routes match the active skill identifiers', async () => {
  let root = new URL('../../src/static-pages/skills/', import.meta.url);

  await access(new URL('rnd-engineering/index.html.js', root));
  await access(new URL('hardware-capture/index.html.js', root));
  await assert.rejects(
    access(new URL('automation/index.html.js', root)),
    { code: 'ENOENT' }
  );
});
