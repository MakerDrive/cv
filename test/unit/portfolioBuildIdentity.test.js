import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import test from 'node:test';
import resetPortfolioThemeForBuild from '../../src/static-pages/js/resetPortfolioThemeForBuild.js';

let createStorage = (entries) => {
  let values = new Map(entries);
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, String(value)),
    removeItem: (key) => values.delete(key),
    values,
  };
};

test('new builds reset active theme state and geometry while preserving other site data', () => {
  for (let previous of [null, 'previous-build']) {
    let storage = createStorage([
      ['symbiote-ui:cascade-theme-editor', '{"bgLightness":50,"hue":220}'],
      ['symbiote-ui:cascade-theme-editor::geometry-register', 'spacious'],
      ['symbiote-ui:cascade-theme-editor::named::favorite', 'saved-preset'],
      ['cv:locale', 'es'],
      ['workspace-layout', 'saved-panels'],
    ]);
    if (previous) storage.setItem('cv:theme-build-id', previous);
    assert.equal(resetPortfolioThemeForBuild('current-build', storage), true);
    assert.deepEqual(Object.fromEntries(storage.values), {
      'symbiote-ui:cascade-theme-editor::named::favorite': 'saved-preset',
      'cv:locale': 'es',
      'workspace-layout': 'saved-panels',
      'cv:theme-build-id': 'current-build',
    });
    storage.setItem('symbiote-ui:cascade-theme-editor', 'user-adjustment');
    storage.setItem('symbiote-ui:cascade-theme-editor::geometry-register', 'tool');
    assert.equal(resetPortfolioThemeForBuild('current-build', storage), false);
    assert.equal(storage.getItem('symbiote-ui:cascade-theme-editor'), 'user-adjustment');
    assert.equal(storage.getItem('symbiote-ui:cascade-theme-editor::geometry-register'), 'tool');
  }
});

test('failed storage cleanup does not mark the new build as reset', () => {
  let storage = createStorage([['cv:theme-build-id', 'old-build']]);
  let failure = new DOMException('Storage blocked', 'SecurityError');
  storage.removeItem = () => { throw failure; };
  assert.throws(() => resetPortfolioThemeForBuild('new-build', storage), (error) => error === failure);
  assert.equal(storage.getItem('cv:theme-build-id'), 'old-build');
});

test('page generation shares one identity per build process and renews it for the next build', () => {
  let generator = new URL('../../src/static-pages/getPage.js', import.meta.url).href;
  let source = `
    import { getPage } from ${JSON.stringify(generator)};
    let pages = await Promise.all(['First', 'Second'].map(TITLE =>
      getPage({ TITLE, HEADER_CONTENT: '' })));
    process.stdout.write(JSON.stringify(pages.map(html =>
      /name="cv-build-id" content="([^"]+)"/.exec(html)[1])));
  `;
  let generate = () => JSON.parse(execFileSync(process.execPath,
    ['--input-type=module', '-e', source], { encoding: 'utf8' }));
  let first = generate();
  let second = generate();
  assert.match(first[0], /^[\da-f]{8}-[\da-f]{4}-4[\da-f]{3}-[89ab][\da-f]{3}-[\da-f]{12}$/);
  assert.equal(first[0], first[1]);
  assert.equal(second[0], second[1]);
  assert.notEqual(first[0], second[0]);
});
