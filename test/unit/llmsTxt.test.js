import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import { promisify } from 'node:util';
import test from 'node:test';
import { PUBLICATIONS } from '../../src/static-pages/data/publications.js';
import {
  writeLlmsFullTxt,
  writeLlmsTxt,
} from '../../scripts/generate-llms-txt.js';

const execFileAsync = promisify(execFile);

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function countOccurrences(source, value) {
  return source.split(value).length - 1;
}

test('LLM projections include every published kind once and exclude drafts', () => {
  const locales = ['en', 'ru', 'es'];
  const kinds = ['retrospective', 'update', 'release', 'research-note', 'field-note'];
  const fixtures = kinds.map((kind, index) => {
    const slug = `fixture-${kind}`;
    return {
      id: `pulse/${slug}`,
      slug,
      kind,
      status: 'published',
      publishedAt: `2026-07-17T12:00:0${index}Z`,
      updatedAt: null,
      subjectPeriod: '2026',
      relatedProjectIds: [],
      primaryProjectId: null,
      tags: [],
      sourceLinks: [],
      locales: Object.fromEntries(locales.map((locale) => [locale, {
        title: `${kind}-${locale}-title`,
        summary: `${kind}-${locale}-summary`,
        body: `${kind}-${locale}-body`,
      }])),
    };
  });
  fixtures[0].sourceLinks = [{
    label: 'Fixture source',
    href: 'https://example.test/fixture-source',
    summary: 'Primary evidence',
  }];
  const draft = {
    ...fixtures[1],
    id: 'pulse/fixture-draft',
    slug: 'fixture-draft',
    status: 'draft',
    locales: Object.fromEntries(locales.map((locale) => [locale, {
      title: `draft-${locale}-title`,
      summary: `draft-${locale}-summary`,
      body: `draft-${locale}-body`,
    }])),
  };
  const publications = [...fixtures, draft];

  const compact = writeLlmsTxt([], publications);
  const full = writeLlmsFullTxt([], publications);

  for (const publication of fixtures) {
    assert.equal(
      countOccurrences(compact, `/pulse/${publication.slug}/?lang=en`),
      1,
      `${publication.kind} must have one compact export route`
    );
    assert.equal(
      countOccurrences(full, `Date: ${publication.publishedAt}`),
      locales.length,
      `${publication.kind} must retain its publication date in every locale`
    );
    for (const locale of locales) {
      assert.equal(
        countOccurrences(full, `/pulse/${publication.slug}/?lang=${locale}`),
        1,
        `${publication.kind}:${locale} must have one full export route`
      );
      assert.equal(
        countOccurrences(full, publication.locales[locale].body),
        1,
        `${publication.kind}:${locale} body must be emitted once`
      );
    }
  }

  assert.doesNotMatch(compact, /fixture-draft/);
  assert.doesNotMatch(full, /fixture-draft|draft-(?:en|ru|es)-body/);
  assert.equal(
    countOccurrences(full, '[Fixture source](https://example.test/fixture-source): Primary evidence'),
    locales.length,
  );
});

test('portfolio build generates llms.txt and llms-full.txt', async () => {
  const packageJson = JSON.parse(await readFile(new URL('../../package.json', import.meta.url), 'utf8'));

  assert.equal(packageJson.scripts['generate-llms'], 'node ./scripts/generate-llms-txt.js');
  assert.match(packageJson.scripts.build, /npm run generate-llms/);

  await execFileAsync('node', ['./scripts/generate-llms-txt.js'], {
    cwd: new URL('../..', import.meta.url),
  });

  const llmsTxt = await readFile(new URL('../../dist/llms.txt', import.meta.url), 'utf8');
  const llmsFullTxt = await readFile(new URL('../../dist/llms-full.txt', import.meta.url), 'utf8');

  assert.match(llmsTxt, /^# Vladimir Matiasevich Portfolio/m);
  assert.match(llmsTxt, /llms-full\.txt/);
  assert.match(llmsTxt, /projects\/agent-portal\/\?lang=en/);
  assert.match(llmsTxt, /pulse\/photopizza\/\?lang=en/);
  assert.match(llmsTxt, /downloads\/vladimir-matiasevich-cv-en\.pdf/);
  assert.match(llmsTxt, /## Professional profile/);
  assert.match(llmsTxt, /## Core expertise/);
  assert.match(llmsTxt, /## Selected impact/);
  assert.match(llmsTxt, /## Selected products and systems/);
  assert.match(llmsTxt, /## Selected experience/);
  assert.match(llmsTxt, /ZIQ Design — 3D Artist \/ Graphic Designer/);
  assert.match(llmsTxt, /Languages: Russian \(native\) · English \(written and async\) · Spanish \(A1, actively learning\)/);
  assert.match(llmsTxt, /Multilingual voice meetings: real-time AI interpretation/);
  assert.match(llmsTxt, /15\+ years in R&D, product engineering, and full-stack development/);
  assert.doesNotMatch(llmsTxt, /Quick facts/);
  assert.doesNotMatch(llmsTxt, /Profile data/);
  assert.match(llmsTxt, /### Archived projects/);
  assert.match(llmsTxt, /Symbiote Node/);
  assert.match(llmsTxt, /AUTOBOX v1.*2019-2021\./);
  assert.match(llmsTxt, /F360 Studio.*2021-2022\./);
  assert.match(llmsTxt, /Lifecycle Messaging Platform/);
  assert.doesNotMatch(llmsTxt, /Symbiote Workflow|symbiote-workflow/);
  assert.doesNotMatch(llmsTxt, /llms-full\.txt\//);
  assert.doesNotMatch(llmsTxt, /sitemap\.xml\//);
  assert.doesNotMatch(llmsTxt, /vladimir-matiasevich-cv-en\.pdf\//);

  assert.match(llmsFullTxt, /^# Vladimir Matiasevich Portfolio - Full LLM Context/m);
  assert.match(llmsFullTxt, /## Locale: English/);
  assert.match(llmsFullTxt, /## Locale: Russian/);
  assert.match(llmsFullTxt, /## Locale: Spanish/);
  assert.match(llmsFullTxt, /Языки: Русский \(родной\) · Английский \(письменно и асинхронно\) · Испанский \(A1, активно изучаю\)/);
  assert.match(llmsFullTxt, /Многоязычные голосовые встречи: ИИ-перевод в реальном времени/);
  assert.match(llmsFullTxt, /15\+ лет в R&D, продуктовой инженерии и full-stack разработке/);
  const previousBirthYearMarker = String(2000 - 16);
  assert.doesNotMatch(`${llmsTxt}\n${llmsFullTxt}`, new RegExp(previousBirthYearMarker));
  assert.doesNotMatch(`${llmsTxt}\n${llmsFullTxt}`, /Born:|Дата рождения|Fecha de nacimiento/);
  const russianProfileSections = [
    '### Профессиональный профиль',
    '### Ключевые компетенции',
    '### Избранные результаты',
    '### Избранные продукты и системы',
    '### Избранный опыт',
  ];
  for (let index = 0; index < russianProfileSections.length; index += 1) {
    assert.match(llmsFullTxt, new RegExp(escapeRegExp(russianProfileSections[index])));
    if (index > 0) {
      assert.ok(
        llmsFullTxt.indexOf(russianProfileSections[index - 1]) < llmsFullTxt.indexOf(russianProfileSections[index]),
        `${russianProfileSections[index]} must follow ${russianProfileSections[index - 1]}`,
      );
    }
  }
  assert.match(llmsFullTxt, /#### RND-PRO — Lead R&D Engineer/);
  assert.match(llmsFullTxt, /#### F360 — основатель \/ руководитель студии/);
  assert.match(llmsFullTxt, /#### MEGAVISOR \/ Gate9 — CTO и сооснователь/);
  assert.match(llmsFullTxt, /#### ZIQ Design — 3D Artist \/ Graphic Designer/);
  assert.doesNotMatch(llmsFullTxt, /experience\.(?:title|rnd|programming)/);
  assert.match(llmsFullTxt, /#### AUTOBOX v1\n\nURL: .*\/projects\/autobox-v1\/\?lang=en\n\nPeriod: 2019/);
  assert.match(llmsFullTxt, /#### F360 Studio\n\nURL: .*\/projects\/f360-studio\/\?lang=en\n\nPeriod: 2021-2022/);
  assert.match(llmsFullTxt, /Десять японских нэцкэ/);

  const agentPortalPublication = PUBLICATIONS.find(pub => pub.slug === 'agent-portal');
  for (const locale of ['en', 'ru', 'es']) {
    assert.match(
      llmsFullTxt,
      new RegExp(`#### ${escapeRegExp(agentPortalPublication.locales[locale].title)}\\n\\nURL: .*\\/pulse\\/agent-portal\\/\\?lang=${locale}\\n\\nPeriod: 2025-2026`),
    );
  }
  assert.doesNotMatch(llmsFullTxt, /\bDate:\b/);

  const internalProjectMarker = String.fromCharCode(49, 83, 73, 77);
  assert.doesNotMatch(`${llmsTxt}\n${llmsFullTxt}`, new RegExp(internalProjectMarker));

  const publicPublications = PUBLICATIONS.filter(pub => pub.status === 'published');

  for (const pub of publicPublications) {
    assert.match(llmsTxt, new RegExp(`pulse/${pub.slug}`));
    for (const locale of ['en', 'ru', 'es']) {
      const loc = pub.locales[locale];
      assert.match(llmsFullTxt, new RegExp(`pulse/${pub.slug}.*lang=${locale}`));
      assert.match(llmsFullTxt, new RegExp(escapeRegExp(loc.title)));
      assert.ok(llmsFullTxt.includes(loc.summary));
    }
  }
});
