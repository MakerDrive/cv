import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

import { parseInlineMarkdownLinks } from '../../scripts/generate-portfolio-pdfs.js';

test('PDF paragraph Markdown parser preserves text and extracts inline links', () => {
  const source = 'До [команды RND-PRO](https://rnd-pro.com/workflow/en/) и [документации](https://example.com/docs?q=1) после.';
  const segments = parseInlineMarkdownLinks(source);

  assert.deepEqual(segments, [
    { text: 'До ', href: '' },
    { text: 'команды RND-PRO', href: 'https://rnd-pro.com/workflow/en/' },
    { text: ' и ', href: '' },
    { text: 'документации', href: 'https://example.com/docs?q=1' },
    { text: ' после.', href: '' },
  ]);
  assert.equal(segments.map((segment) => segment.text).join(''), 'До команды RND-PRO и документации после.');
  assert.deepEqual(parseInlineMarkdownLinks('Текст с [незавершённой ссылкой'), [
    { text: 'Текст с [незавершённой ссылкой', href: '' },
  ]);
});

test('portfolio build generates the compact two-page localized CV structure', async () => {
  const packageJson = JSON.parse(await readFile(new URL('../../package.json', import.meta.url), 'utf8'));
  const portfolioSource = await readFile(new URL('../../src/static-pages/js/index.js', import.meta.url), 'utf8');
  const pdfSource = await readFile(new URL('../../scripts/generate-portfolio-pdfs.js', import.meta.url), 'utf8');

  assert.equal(packageJson.scripts['generate-pdfs'], 'node ./scripts/generate-portfolio-pdfs.js');
  assert.equal(packageJson.devDependencies['source-sans'], '3.52.0');
  assert.match(packageJson.scripts.build, /npm run generate-pdfs/);
  for (const locale of ['en', 'ru', 'es']) {
    assert.ok(portfolioSource.includes(`downloads/vladimir-matiasevich-cv-${locale}.pdf`));
  }

  assert.match(pdfSource, /SourceSans3-Regular\.ttf/);
  assert.match(pdfSource, /SourceSans3-Semibold\.ttf/);
  assert.match(pdfSource, /SourceSans3-Bold\.ttf/);
  assert.match(pdfSource, /writer\.paragraph\(summary, \{ size: 10\.5/);
  assert.match(pdfSource, /writer\.bullets\(expertise, \{[\s\S]*?size: 10,/);
  assert.match(pdfSource, /writer\.bullets\(impact, \{[\s\S]*?size: 10,/);
  assert.match(pdfSource, /writer\.itemBrief\(item, \{ titleSize: 10\.2, size: 9\.6/);
  assert.match(pdfSource, /PORTFOLIO_PDF_EXPERTISE_ROUTES/);
  assert.match(pdfSource, /PORTFOLIO_PDF_IMPACT_ROUTES/);
  assert.match(pdfSource, /PORTFOLIO_PDF_PRODUCT_ROUTES/);
  assert.doesNotMatch(pdfSource, /PORTFOLIO_PDF_CAREER|pdf\.career|CareerBrief|getCareer/);

  const summaryIndex = pdfSource.indexOf("writer.section(t(locale, 'pdf.summaryTitle')");
  const expertiseIndex = pdfSource.indexOf("writer.section(t(locale, 'pdf.expertiseTitle')");
  const impactIndex = pdfSource.indexOf("writer.section(t(locale, 'pdf.impactTitle')");
  const productsIndex = pdfSource.indexOf("writer.section(t(locale, 'pdf.productsTitle')");
  const experienceIndex = pdfSource.indexOf("writer.section(t(locale, 'pdf.experienceTitle')");
  const profilesIndex = pdfSource.indexOf("writer.section(t(locale, 'profile.links')");
  assert.ok(summaryIndex < expertiseIndex && expertiseIndex < impactIndex);
  assert.ok(impactIndex < productsIndex && productsIndex < experienceIndex && experienceIndex < profilesIndex);

  assert.match(pdfSource, /const softwareProducts = products\.slice\(0, 4\)/);
  assert.match(pdfSource, /const mediaHardwareProducts = products\.slice\(4\)/);
  assert.match(pdfSource, /t\(locale, 'profile\.statusDetails'\)/);
  assert.match(pdfSource, /t\(locale, 'pdf\.remoteAvailability'\)/);
  assert.match(pdfSource, /const PDF_RND_PRO_URL = 'https:\/\/rnd-pro\.com\/';/);
  assert.match(pdfSource, /Expected exactly 2 PDF pages/);
});
