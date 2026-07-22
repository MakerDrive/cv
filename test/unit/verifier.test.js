import assert from 'node:assert/strict';
import test from 'node:test';
import path from 'node:path';
import fs from 'node:fs/promises';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import {
  resolveScriptPath,
  verifyHtmlContent,
  verifyCssContent,
  verifyJsMetafile,
  runVerification,
  EXECUTABLE_ASSET_ALLOWLIST
} from '../../scripts/verify-production-build.js';

test('verifier resolveScriptPath handles absolute and relative paths', () => {
  const distDir = '/mock/dist';
  const htmlPath = '/mock/dist/projects/agent-portal/index.html';

  assert.equal(
    resolveScriptPath('/cv/js/index.js', htmlPath, distDir),
    'js/index.js'
  );

  assert.equal(
    resolveScriptPath('/js/ForceWorker.js', htmlPath, distDir),
    'js/ForceWorker.js'
  );

  assert.equal(
    resolveScriptPath('../../js/index.js?v=123', htmlPath, distDir),
    'js/index.js'
  );
});

test('verifier verifyHtmlContent rejects importmap with quoted or unquoted attributes', () => {
  const distDir = '/mock/dist';
  const htmlPath = '/mock/dist/index.html';

  assert.throws(
    () => verifyHtmlContent('<script type="importmap">{"imports": {}}</script>', htmlPath, distDir),
    /contains an importmap/
  );

  assert.throws(
    () => verifyHtmlContent('<script type=importmap>{"imports": {}}</script>', htmlPath, distDir),
    /contains an importmap/
  );
});

test('verifier verifyHtmlContent rejects Google Fonts', () => {
  const distDir = '/mock/dist';
  const htmlPath = '/mock/dist/index.html';

  assert.throws(
    () => verifyHtmlContent('<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined" rel="stylesheet">', htmlPath, distDir),
    /contains external Google Fonts/
  );
});

test('verifier verifyHtmlContent rejects external CDN script tags', () => {
  const distDir = '/mock/dist';
  const htmlPath = '/mock/dist/index.html';

  assert.throws(
    () => verifyHtmlContent('<script src="https://cdn.jsdelivr.net/npm/@symbiotejs/symbiote/core/index.js"></script>', htmlPath, distDir),
    /contains CDN script src/
  );
});

test('verifier verifyHtmlContent rejects extra execution assets', () => {
  const distDir = '/mock/dist';
  const htmlPath = '/mock/dist/index.html';

  assert.throws(
    () => verifyHtmlContent('<script src="js/another-script.js"></script>', htmlPath, distDir),
    /loads extra\/undeclared execution asset/
  );
});

test('verifier verifyHtmlContent rejects any inline executable script except application/json', () => {
  const distDir = '/mock/dist';
  const htmlPath = '/mock/dist/index.html';

  // plain script
  assert.throws(
    () => verifyHtmlContent('<script>console.log("plain")</script>', htmlPath, distDir),
    /contains inline executable script/
  );

  // type=module
  assert.throws(
    () => verifyHtmlContent('<script type="module">import { something } from "somewhere";</script>', htmlPath, distDir),
    /contains inline executable script/
  );

  assert.throws(
    () => verifyHtmlContent("<script type='module'>import('something');</script>", htmlPath, distDir),
    /contains inline executable script/
  );

  // unquoted
  assert.throws(
    () => verifyHtmlContent("<script type=module>import('something');</script>", htmlPath, distDir),
    /contains inline executable script/
  );
});

test('verifier verifyHtmlContent accepts allowed execution assets and application/json scripts', () => {
  const distDir = '/mock/dist';
  const htmlPath = '/mock/dist/index.html';

  const goodHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <script src=js/index.js?v=abcdef></script>
        <script src="js/ForceWorker.js"></script>
        <script id="data" type=application/json>{"key": "value"}</script>
        <script type="application/json">{"imports":{}}</script>
        <script type='application/json'>{}</script>
      </head>
      <body></body>
    </html>
  `;

  // Should not throw
  verifyHtmlContent(goodHtml, htmlPath, distDir);
  assert.ok(true);
});

test('verifier verifyCssContent checks external font imports and remote @import', () => {
  const distDir = '/mock/dist';
  const cssPath = '/mock/dist/css/index.css';

  const badCss1 = `
    @import url('https://fonts.googleapis.com/css2?family=Roboto');
    body { font-family: Roboto; }
  `;
  assert.throws(
    () => verifyCssContent(badCss1, cssPath, distDir),
    /contains external Google Fonts/
  );

  const badCss2 = `
    @import url("http://example.com/style.css");
  `;
  assert.throws(
    () => verifyCssContent(badCss2, cssPath, distDir),
    /contains remote @import for http\/https/
  );

  const badCss3 = `
    @import "https://example.com/style.css";
  `;
  assert.throws(
    () => verifyCssContent(badCss3, cssPath, distDir),
    /contains remote @import for http\/https/
  );

  const goodCss = `
    @import url("./local-styles.css");
    body {}
  `;
  // Should not throw
  verifyCssContent(goodCss, cssPath, distDir);
  assert.ok(true);
});

test('verifier verifyCssContent checks material-symbols.css requirements', () => {
  const distDir = '/mock/dist';
  const fontCssPath = '/mock/dist/js/material-symbols.css';

  assert.throws(
    () => verifyCssContent(`@import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined');`, fontCssPath, distDir),
    /contains external Google Fonts/
  );

  assert.throws(
    () => verifyCssContent(`.material-symbols-outlined { font-family: sans-serif; }`, fontCssPath, distDir),
    /missing local font asset reference/
  );

  assert.throws(
    () => verifyCssContent(`@import url('./other.css'); url('material-symbols-outlined-400.ttf')`, fontCssPath, distDir),
    /contains forbidden @import statements/
  );

  const goodFontCss = `
    @font-face {
      font-family: 'Material Symbols Outlined';
      src: url('./material-symbols-outlined-400.ttf') format('truetype');
    }
  `;

  verifyCssContent(goodFontCss, fontCssPath, distDir);
  assert.ok(true);
});

test('verifier verifyJsMetafile rejects any import record across all outputs', () => {
  const badMetafile = {
    outputs: {
      'dist/js/worker.js': {
        imports: [] // First output has no imports
      },
      'dist/js/index.js': {
        imports: [
          { path: '@symbiotejs/symbiote', kind: 'import-statement' }
        ]
      }
    }
  };

  assert.throws(
    () => verifyJsMetafile(badMetafile),
    /contains import record to: "@symbiotejs\/symbiote"/
  );

  const badMetafile2 = {
    outputs: {
      'dist/js/worker.js': {
        imports: []
      },
      'dist/js/index.js': {
        imports: [
          { path: 'blob:dynamic', kind: 'dynamic-import' }
        ]
      }
    }
  };

  assert.throws(
    () => verifyJsMetafile(badMetafile2),
    /contains import record to: "blob:dynamic"/
  );

  const goodMetafile = {
    outputs: {
      'dist/js/index.js': {
        imports: []
      },
      'dist/js/worker.js': {
        imports: []
      }
    }
  };

  verifyJsMetafile(goodMetafile);
  assert.ok(true);
});

test('full verifier success and failure scenarios', async () => {
  const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'cv-native-build-dist-'));
  try {
    await fs.mkdir(path.join(tmpDir, 'js'), { recursive: true });
    await fs.mkdir(path.join(tmpDir, 'css'), { recursive: true });

    const writeSuccessFiles = async () => {
      await fs.writeFile(path.join(tmpDir, 'index.html'), '<script src="js/index.js"></script>');
      await fs.writeFile(path.join(tmpDir, '404.html'), '<script src="js/index.js"></script>');
      await fs.writeFile(path.join(tmpDir, 'robots.txt'), 'User-agent: *');
      await fs.writeFile(path.join(tmpDir, 'css/index.css'), 'body {}');
      await fs.writeFile(path.join(tmpDir, 'js/index.js'), 'console.log("hello index");');
      await fs.writeFile(path.join(tmpDir, 'js/ForceWorker.js'), 'console.log("hello worker");');
      await fs.writeFile(path.join(tmpDir, 'js/material-symbols.css'), 'url("material-symbols-outlined-400.ttf")');
      await fs.writeFile(path.join(tmpDir, 'js/material-symbols-outlined-400.ttf'), 'fontdata');
    };

    // 1. Success
    await writeSuccessFiles();
    await runVerification(tmpDir);
    assert.ok(true);

    // 2. Missing asset
    await fs.unlink(path.join(tmpDir, '404.html'));
    await assert.rejects(runVerification(tmpDir), /required file "404.html" is missing/);
    await writeSuccessFiles();

    // 3. Import map with minified unquoted attributes
    await fs.writeFile(path.join(tmpDir, 'index.html'), '<script type=importmap>{"imports":{}}</script>');
    await assert.rejects(runVerification(tmpDir), /contains an importmap script tag/);
    await writeSuccessFiles();

    // 4. Unexpected unreferenced JS
    await fs.writeFile(path.join(tmpDir, 'js/extra.js'), 'console.log("extra");');
    await assert.rejects(runVerification(tmpDir), /extra unreferenced JS file found/);
    await fs.unlink(path.join(tmpDir, 'js/extra.js'));

    // 5. Raw package tree
    await fs.mkdir(path.join(tmpDir, 'node_modules'));
    await fs.writeFile(path.join(tmpDir, 'node_modules/index.js'), 'console.log("bad");');
    await assert.rejects(runVerification(tmpDir), /forbidden raw package path segment "node_modules"/);
    await fs.rm(path.join(tmpDir, 'node_modules'), { recursive: true, force: true });

    // 6. External font CSS
    await fs.writeFile(path.join(tmpDir, 'css/index.css'), '@import url("https://fonts.googleapis.com/css2?family=Roboto");');
    await assert.rejects(runVerification(tmpDir), /contains external Google Fonts/);
    await writeSuccessFiles();

    // 7. Parser-visible static import
    await fs.writeFile(path.join(tmpDir, 'js/index.js'), 'import { foo } from "./foo.js";');
    await assert.rejects(runVerification(tmpDir), /contains import record to: "\.\/foo\.js"/);
    await writeSuccessFiles();

    // 8. Parser-visible dynamic import
    await fs.writeFile(path.join(tmpDir, 'js/index.js'), 'const mod = await import("./foo.js");');
    await assert.rejects(runVerification(tmpDir), /contains import record to: "\.\/foo\.js"/);

  } finally {
    await fs.rm(tmpDir, { recursive: true, force: true });
  }
});

test('build script hygiene and rename contracts', async () => {
  const rootDir = path.resolve(fileURLToPath(new URL('../..', import.meta.url)));
  const pkgStr = await fs.readFile(path.join(rootDir, 'package.json'), 'utf8');
  const pkg = JSON.parse(pkgStr);

  assert.equal(pkg.scripts['copy-force-worker'], undefined, 'copy-force-worker script should be removed');
  assert.equal(pkg.scripts['write-material-symbols-css'], undefined, 'write-material-symbols-css script should be removed');

  assert.match(pkg.scripts['build'], /npm run copy-material-symbols-assets/, 'build should call copy-material-symbols-assets');
  assert.match(pkg.scripts['build'], /npm run build-force-worker/, 'build should call build-force-worker');
  assert.match(pkg.scripts['build'], /npm run verify-production-build$/, 'verification must be last in the build chain');

  const workerJs = await fs.readFile(path.join(rootDir, 'scripts/build-force-worker.js'), 'utf8');
  assert.match(workerJs, /import\s+\{\s*jsBuild\s*\}\s+from\s+['"]jsda-kit\/server\/build-asset\.js['"]/, 'must import jsBuild');
  assert.match(workerJs, /fileURLToPath/, 'must use fileURLToPath');
  assert.doesNotMatch(workerJs, /console\.log/, 'must not have console.log');
});
