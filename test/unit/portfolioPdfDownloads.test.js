import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test('portfolio build generates localized CV PDFs', async () => {
  const packageJson = JSON.parse(await readFile(new URL('../../package.json', import.meta.url), 'utf8'));
  const portfolioSource = await readFile(new URL('../../src/static-pages/js/index.js', import.meta.url), 'utf8');
  const pdfSource = await readFile(new URL('../../scripts/generate-portfolio-pdfs.js', import.meta.url), 'utf8');

  assert.equal(packageJson.scripts['generate-pdfs'], 'node ./scripts/generate-portfolio-pdfs.js');
  assert.match(packageJson.scripts.build, /npm run generate-pdfs/);

  for (const locale of ['en', 'ru', 'es']) {
    assert.ok(portfolioSource.includes(`downloads/vladimir-matiasevich-cv-${locale}.pdf`));
    assert.ok(portfolioSource.includes(`tPortfolio('pdf.${locale}')`));
  }

  assert.match(portfolioSource, /downloadsTitle: tPortfolio\('pdf\.downloads'\)/);
  assert.match(portfolioSource, /## \$\{entry\.downloadsTitle \|\| tPortfolio\('pdf\.downloads'\)\}/);
  assert.match(pdfSource, /const PROFILE_AGE = 41;/);
  assert.match(pdfSource, /t\(locale, 'profile\.age', \{ age: PROFILE_AGE \}\)/);
  assert.match(pdfSource, /t\(locale, 'experience\.rnd\.label'\)/);
  assert.match(pdfSource, /t\(locale, 'experience\.programming\.label'\)/);
});
