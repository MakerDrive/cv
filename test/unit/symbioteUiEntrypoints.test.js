import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const ROOT = path.resolve(fileURLToPath(new URL('../..', import.meta.url)));
const SCANNED_DIRS = ['src', 'test', 'scripts'];
const FORBIDDEN_SPECIFIER = 'symbiote-ui/ui';
const PROVIDER_PREFIX = 'symbiote-ui/';

async function listJsFiles(dir) {
  let entries = await readdir(dir, { withFileTypes: true });
  let files = [];
  for (const entry of entries) {
    let entryPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...await listJsFiles(entryPath));
    } else if (entry.isFile() && entry.name.endsWith('.js')) {
      files.push(entryPath);
    }
  }
  return files;
}

function collectImportSpecifiers(source) {
  let specifiers = [];
  let patterns = [
    /\bimport\s*\(\s*['"]([^'"]+)['"]\s*\)/g,
    /\bimport\s*['"]([^'"]+)['"]/g,
    /\b(?:import|export)\b[^;'"]*?\bfrom\s*['"]([^'"]+)['"]/gs,
  ];
  for (const pattern of patterns) {
    for (const match of source.matchAll(pattern)) {
      specifiers.push(match[1]);
    }
  }
  return specifiers;
}

async function collectProviderImports() {
  let usages = [];
  for (const scannedDir of SCANNED_DIRS) {
    let files = await listJsFiles(path.join(ROOT, scannedDir));
    for (const file of files) {
      let source = await readFile(file, 'utf8');
      for (const specifier of collectImportSpecifiers(source)) {
        if (specifier === FORBIDDEN_SPECIFIER || specifier.startsWith(PROVIDER_PREFIX)) {
          usages.push({ file: path.relative(ROOT, file), specifier });
        }
      }
    }
  }
  return usages;
}

function escapeRegExp(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

async function loadDeclaredExportMatcher() {
  let manifestPath = path.join(ROOT, 'node_modules', 'symbiote-ui', 'package.json');
  let manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
  let exportKeys = Object.keys(manifest.exports || {});
  let matchers = exportKeys.map((key) => {
    if (!key.includes('*')) return (subpath) => subpath === key;
    let pattern = new RegExp(`^${escapeRegExp(key).replaceAll('\\*', '.+')}$`);
    return (subpath) => pattern.test(subpath);
  });
  return (subpath) => matchers.some((matches) => matches(subpath));
}

test('source, tests, and scripts never import the complete symbiote-ui/ui catalog', async () => {
  let usages = await collectProviderImports();
  let barrelUsages = usages.filter(({ specifier }) => specifier === FORBIDDEN_SPECIFIER);
  assert.deepEqual(
    barrelUsages,
    [],
    `forbidden ${FORBIDDEN_SPECIFIER} imports: ${JSON.stringify(barrelUsages)}`,
  );
});

test('every used symbiote-ui subpath is declared by the installed package exports', async () => {
  let usages = await collectProviderImports();
  let isDeclared = await loadDeclaredExportMatcher();
  let undeclared = usages
    .map(({ file, specifier }) => ({ file, specifier, subpath: specifier.replace('symbiote-ui', '.') }))
    .filter(({ subpath }) => !isDeclared(subpath));
  assert.deepEqual(
    undeclared,
    [],
    `subpaths missing from installed symbiote-ui exports: ${JSON.stringify(undeclared)}`,
  );
});
