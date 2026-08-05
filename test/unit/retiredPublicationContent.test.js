import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import { getExpectedMarkdownContentCount } from '../../scripts/verify-production-build.js';
import { PUBLICATIONS } from '../../src/static-pages/data/publications.js';

const PUBLICATION_CONTENT_DIR = fileURLToPath(new URL(
  '../../src/static-pages/copy-content/publications/',
  import.meta.url,
));
const PUBLICATION_LOCALE_FILES = Object.freeze(['en.md', 'es.md', 'ru.md']);

test('published publication bodies exist while retired publication bodies are absent', async () => {
  let published = PUBLICATIONS.filter((publication) => publication.status === 'published');
  let retired = PUBLICATIONS.filter((publication) => publication.status === 'retired');

  assert.equal(published.length, 60);
  assert.equal(retired.length, 38);

  for (let publication of published) {
    let directory = path.join(PUBLICATION_CONTENT_DIR, publication.slug);
    let entries = await fs.readdir(directory, { withFileTypes: true });
    let entryNames = entries.map((entry) => entry.name).sort();

    assert.deepEqual(entryNames, PUBLICATION_LOCALE_FILES, publication.slug);
    assert.ok(
      entries.every((entry) => entry.isFile()),
      `${publication.slug} must contain files only`,
    );
    for (let localeFile of PUBLICATION_LOCALE_FILES) {
      let content = await fs.readFile(path.join(directory, localeFile), 'utf8');
      assert.ok(content.trim(), `${publication.slug}/${localeFile} must not be empty`);
    }
  }

  for (let publication of retired) {
    let directory = path.join(PUBLICATION_CONTENT_DIR, publication.slug);
    await assert.rejects(
      fs.readdir(directory),
      { code: 'ENOENT' },
      `${publication.slug} must not retain a source Markdown directory`,
    );
  }
});

test('runtime Markdown asset count derives from public content registries', () => {
  assert.equal(getExpectedMarkdownContentCount(), 243);
});
