import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

import * as ts from 'typescript';

import { socialLinks } from '../../src/static-pages/data/socialLinks.js';
import { PORTFOLIO_LOCALE_MESSAGES } from '../../src/static-pages/data/portfolioTranslations.js';

const EXPECTED_LOCALES = ['en', 'es', 'ru'];
const PLACEHOLDER_PATTERN = /\{([a-zA-Z][a-zA-Z0-9_]*)\}/g;
const PULSE_KIND_MESSAGE_KEYS = [
  'portfolio.pulse.type.retrospective',
  'portfolio.pulse.type.update',
  'portfolio.pulse.type.release',
  'portfolio.pulse.type.research-note',
  'portfolio.pulse.type.field-note',
];
const HOMEPAGE_PROFILE_COPY_KEYS = [
  'portfolio.profile.details',
  'portfolio.profile.statusDetails',
  'portfolio.profile.workFormatDetails',
  ...['ai', 'fullStack', 'rnd', 'hardware'].map((id) => `portfolio.profile.expertise.${id}.details`),
  ...['aiTooling', 'museumScanning', 'hardware', 'mediaProduction'].map((id) => `portfolio.profile.impact.${id}.details`),
  'portfolio.profile.productsIntro',
  ...['agentToolchain', 'symbiote', 'videoStudio', 'messaging', 'hardware', 'photopizza', 'objetArt', 'boothbot']
    .map((id) => `portfolio.profile.product.${id}.details`),
  ...['rndPro', 'f360', 'megavisor'].map((id) => `portfolio.profile.role.${id}.details`),
];
const PDF_CORE_COPY_KEYS = [
  'portfolio.pdf.summaryDetails',
  'portfolio.pdf.expertiseDetails',
  'portfolio.pdf.impactDetails',
  'portfolio.pdf.productsIntro',
  ...['agentToolchain', 'symbiote', 'videoStudio', 'messaging', 'hardware', 'photopizza', 'objetArt', 'boothbot']
    .map((id) => `portfolio.pdf.product.${id}.details`),
  ...['rndPro', 'f360', 'megavisor'].map((id) => `portfolio.pdf.role.${id}.details`),
];
const PRODUCT_KEY_PAIRS = [
  ['agentToolchain', 'agentToolchain'],
  ['symbiote', 'symbiote'],
  ['videoStudio', 'videoStudio'],
  ['messaging', 'messaging'],
  ['hardware', 'hardware'],
  ['photopizza', 'photopizza'],
  ['objetArt', 'objetArt'],
  ['boothbot', 'boothbot'],
];
const COPY_WORD_LIMITS = {
  en: { homepage: 650, pdf: 420 },
  ru: { homepage: 620, pdf: 410 },
  es: { homepage: 760, pdf: 480 },
};
const PDF_POSITIONING_FACT_ANCHORS = {
  en: [
    'software development and engineering R&D',
    'private collections',
    'built prototypes and early units',
    'rapid automated photo-360 capture',
    'control-software line in JavaScript/Espruino',
    'storing, presenting, and publishing',
  ],
  ru: [
    'разработке ПО и инженерном R&D',
    'частных коллекциях',
    'собирал прототипы и первые изделия',
    'быстрой автоматизированной фото-360-съёмки',
    'линию управляющего ПО на JavaScript/Espruino',
    'хранения, демонстрации и публикации',
  ],
  es: [
    'desarrollo de software e I+D de ingeniería',
    'colecciones privadas',
    'construí prototipos y primeras unidades',
    'captura foto-360 rápida y automatizada',
    'software de control en JavaScript/Espruino',
    'almacenar, presentar y publicar',
    'responsabilidades claras, contexto documentado, etapas de revisión',
  ],
};

function sorted(values) {
  return [...values].sort((a, b) => a.localeCompare(b));
}

function placeholders(value) {
  return sorted([...String(value).matchAll(PLACEHOLDER_PATTERN)].map((match) => match[1]));
}

function wordCount(value) {
  return String(value).trim().split(/\s+/u).filter(Boolean).length;
}

function totalWords(messages, keys) {
  return keys.reduce((total, key) => total + wordCount(messages[key]), 0);
}

async function getPortfolioTranslationUsages() {
  const source = await readFile(new URL('../../src/static-pages/js/index.js', import.meta.url), 'utf8');
  const sourceFile = ts.createSourceFile('index.js', source, ts.ScriptTarget.Latest, true, ts.ScriptKind.JS);
  const pdfSource = await readFile(new URL('../../scripts/generate-portfolio-pdfs.js', import.meta.url), 'utf8');
  const pdfSourceFile = ts.createSourceFile('generate-portfolio-pdfs.js', pdfSource, ts.ScriptTarget.Latest, true, ts.ScriptKind.JS);
  const feedSource = await readFile(new URL('../../src/static-pages/js/feedPresentation.js', import.meta.url), 'utf8');
  const feedSourceFile = ts.createSourceFile('feedPresentation.js', feedSource, ts.ScriptTarget.Latest, true, ts.ScriptKind.JS);
  const sharingSource = await readFile(new URL('../../src/static-pages/js/portfolioThemeSharing.js', import.meta.url), 'utf8');
  const sharingSourceFile = ts.createSourceFile('portfolioThemeSharing.js', sharingSource, ts.ScriptTarget.Latest, true, ts.ScriptKind.JS);
  const usedKeys = new Set();

  function visit(node) {
    if (ts.isCallExpression(node)
      && ts.isIdentifier(node.expression)
      && node.expression.text === 'tPortfolio') {
      const [keyNode] = node.arguments;
      if (keyNode && ts.isPropertyAccessExpression(keyNode) && keyNode.name.text === 'summaryKey') {
        ts.forEachChild(node, visit);
        return;
      }
      if (keyNode
        && ts.isCallExpression(keyNode)
        && ts.isIdentifier(keyNode.expression)
        && keyNode.expression.text === 'resolvePulseKindMessageKey') {
        PULSE_KIND_MESSAGE_KEYS.forEach((key) => usedKeys.add(key));
        ts.forEachChild(node, visit);
        return;
      }
      const position = keyNode
        ? sourceFile.getLineAndCharacterOfPosition(keyNode.getStart(sourceFile))
        : { line: 0, character: 0 };
      assert.ok(
        keyNode && (ts.isStringLiteral(keyNode) || ts.isNoSubstitutionTemplateLiteral(keyNode)),
        `tPortfolio keys must be static string literals so translation coverage can be tested (${position.line + 1}:${position.character + 1})`
      );
      usedKeys.add(`portfolio.${keyNode.text}`);
    }
    ts.forEachChild(node, visit);
  }

  function visitPdf(node) {
    if (ts.isCallExpression(node)
      && ts.isIdentifier(node.expression)
      && node.expression.text === 't') {
      const [, keyNode] = node.arguments;
      if (keyNode && ts.isPropertyAccessExpression(keyNode) && keyNode.name.text === 'summaryKey') {
        ts.forEachChild(node, visitPdf);
        return;
      }
      const position = keyNode
        ? pdfSourceFile.getLineAndCharacterOfPosition(keyNode.getStart(pdfSourceFile))
        : { line: 0, character: 0 };
      assert.ok(
        keyNode && (ts.isStringLiteral(keyNode) || ts.isNoSubstitutionTemplateLiteral(keyNode)),
        `PDF translation keys must be static string literals so translation coverage can be tested (${position.line + 1}:${position.character + 1})`
      );
      usedKeys.add(`portfolio.${keyNode.text}`);
    }
    ts.forEachChild(node, visitPdf);
  }

  function visitFeed(node) {
    if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) {
      if (node.text.startsWith('portfolio.')) {
        usedKeys.add(node.text);
      }
    }
    ts.forEachChild(node, visitFeed);
  }

  visit(sourceFile);
  visitPdf(pdfSourceFile);
  visitFeed(feedSourceFile);
  visitFeed(sharingSourceFile);
  for (const item of socialLinks) {
    usedKeys.add(`portfolio.${item.summaryKey}`);
  }
  return usedKeys;
}

test('portfolio translations keep the same keys for every locale', () => {
  const locales = sorted(Object.keys(PORTFOLIO_LOCALE_MESSAGES));
  assert.deepEqual(locales, EXPECTED_LOCALES);

  const baseKeys = sorted(Object.keys(PORTFOLIO_LOCALE_MESSAGES.en));
  for (const locale of locales) {
    const messages = PORTFOLIO_LOCALE_MESSAGES[locale];
    assert.equal(Object.getPrototypeOf(messages), Object.prototype, `${locale} translations must be a plain object`);
    const localeKeys = sorted(Object.keys(messages));
    assert.deepEqual(localeKeys, baseKeys, `${locale} translations must match en keys`);
    for (const key of baseKeys) {
      assert.equal(Object.hasOwn(messages, key), true, `${locale}.${key} must be an own property`);
      assert.equal(Object.prototype.propertyIsEnumerable.call(messages, key), true, `${locale}.${key} must be enumerable`);
    }
  }
});

test('portfolio translations cover every UI usage', async () => {
  const usedKeys = await getPortfolioTranslationUsages();
  const translatedKeys = new Set(Object.keys(PORTFOLIO_LOCALE_MESSAGES.en));

  assert.deepEqual(
    sorted([...usedKeys].filter((key) => !Object.hasOwn(PORTFOLIO_LOCALE_MESSAGES.en, key))),
    [],
    'used portfolio translation keys must exist'
  );
  const unusedKeys = [...translatedKeys].filter((key) => !usedKeys.has(key));
  assert.deepEqual(
    sorted(unusedKeys),
    [],
    'portfolio translation keys should stay tied to active UI usage'
  );
});

test('portfolio translations have non-empty values and matching placeholders', () => {
  const baseMessages = PORTFOLIO_LOCALE_MESSAGES.en;
  const locales = Object.keys(PORTFOLIO_LOCALE_MESSAGES);

  for (const key of Object.keys(baseMessages)) {
    const basePlaceholders = placeholders(baseMessages[key]);
    for (const locale of locales) {
      const value = PORTFOLIO_LOCALE_MESSAGES[locale][key];
      assert.equal(typeof value, 'string', `${locale}.${key} must be a string`);
      assert.notEqual(value.trim(), '', `${locale}.${key} must not be empty`);
      assert.deepEqual(placeholders(value), basePlaceholders, `${locale}.${key} placeholders must match en`);
    }
  }
});

test('Pulse project resources use the expected labels in every locale', () => {
  assert.deepEqual(
    Object.fromEntries(Object.entries(PORTFOLIO_LOCALE_MESSAGES).map(([locale, messages]) => [
      locale,
      messages['portfolio.pulse.sources'],
    ])),
    {
      en: 'Project resources',
      es: 'Recursos del proyecto',
      ru: 'Материалы проекта',
    },
  );
});

test('multilingual voice meetings use simultaneous AI interpretation wording in every locale', () => {
  const expectedEndings = {
    en: 'Multilingual voice meetings: simultaneous AI interpretation',
    es: 'Reuniones de voz multilingües: interpretación simultánea con IA',
    ru: 'Многоязычные голосовые встречи: синхронный ИИ-перевод',
  };

  for (const locale of EXPECTED_LOCALES) {
    assert.ok(
      PORTFOLIO_LOCALE_MESSAGES[locale]['portfolio.profile.languagesValue'].endsWith(expectedEndings[locale]),
      `${locale} must use the simultaneous AI interpretation wording`,
    );
  }
});

test('Russian profile and PDF copy use direct recruiter-facing wording', () => {
  const messages = PORTFOLIO_LOCALE_MESSAGES.ru;

  assert.equal(messages['portfolio.profile.expertiseTitle'], 'Компетенции');
  assert.equal(messages['portfolio.profile.impactTitle'], 'Результаты');
  assert.equal(messages['portfolio.profile.productsTitle'], 'Продукты и системы');
  assert.equal(messages['portfolio.profile.experienceTitle'], 'Опыт работы');
  assert.equal(messages['portfolio.pdf.expertiseTitle'], 'Компетенции');
  assert.equal(messages['portfolio.pdf.impactTitle'], 'Результаты');
  assert.equal(messages['portfolio.pdf.productsTitle'], 'Продукты и системы');
  assert.equal(messages['portfolio.pdf.experienceTitle'], 'Опыт работы');
  assert.match(messages['portfolio.profile.impact.hardware.label'], /^Hardware-проекты:/);
  assert.match(messages['portfolio.pdf.impactDetails'], /- Hardware-проекты:/);

  const revisedCopy = [
    ...HOMEPAGE_PROFILE_COPY_KEYS,
    ...PDF_CORE_COPY_KEYS,
  ].map((key) => messages[key]).join('\n');
  assert.doesNotMatch(
    revisedCopy,
    /Ключевые (?:компетенции|результаты|продукты и системы)|Избранные результаты|Избранные продукты и системы|Избранный опыт|выпускал обучение|явное владение задачами|ревью-гейты|ресурсн(?:ая|ой) оркестрац|платформенный контекст|Loop-инфраструктура|JavaScript\/Espruino-линия|R&D технологий съёмки|управляемые свет\/движение|команд\/подрядчиков|Hardware-продукты|hands-on R&D/iu,
  );
});

test('English and Spanish profile and PDF copy use idiomatic recruiter-facing wording', () => {
  const en = PORTFOLIO_LOCALE_MESSAGES.en;
  const es = PORTFOLIO_LOCALE_MESSAGES.es;

  assert.equal(en['portfolio.profile.expertiseTitle'], 'Expertise');
  assert.equal(en['portfolio.profile.impactTitle'], 'Outcomes');
  assert.equal(en['portfolio.profile.productsTitle'], 'Products and systems');
  assert.equal(en['portfolio.profile.experienceTitle'], 'Professional experience');
  assert.equal(en['portfolio.pdf.expertiseTitle'], 'Expertise');
  assert.equal(en['portfolio.pdf.impactTitle'], 'Outcomes');
  assert.equal(en['portfolio.pdf.productsTitle'], 'Products and systems');
  assert.equal(en['portfolio.pdf.experienceTitle'], 'Professional experience');
  assert.match(en['portfolio.profile.impact.hardware.label'], /^Hardware projects:/);
  assert.match(en['portfolio.pdf.impactDetails'], /- Hardware projects:/);

  assert.equal(es['portfolio.profile.expertiseTitle'], 'Competencias');
  assert.equal(es['portfolio.profile.impactTitle'], 'Resultados');
  assert.equal(es['portfolio.profile.productsTitle'], 'Productos y sistemas');
  assert.equal(es['portfolio.profile.experienceTitle'], 'Experiencia profesional');
  assert.equal(es['portfolio.pdf.expertiseTitle'], 'Competencias');
  assert.equal(es['portfolio.pdf.impactTitle'], 'Resultados');
  assert.equal(es['portfolio.pdf.productsTitle'], 'Productos y sistemas');
  assert.equal(es['portfolio.pdf.experienceTitle'], 'Experiencia profesional');
  assert.match(es['portfolio.profile.impact.hardware.label'], /^Proyectos de hardware:/);
  assert.match(es['portfolio.pdf.impactDetails'], /- Proyectos de hardware:/);

  const enCopy = [...HOMEPAGE_PROFILE_COPY_KEYS, ...PDF_CORE_COPY_KEYS]
    .map((key) => en[key]).join('\n');
  const esCopy = [...HOMEPAGE_PROFILE_COPY_KEYS, ...PDF_CORE_COPY_KEYS]
    .map((key) => es[key]).join('\n');
  assert.doesNotMatch(
    enCopy,
    /Core expertise|Key outcomes|Key products and systems|Selected impact|Selected products and systems|Selected experience|platform context|JavaScript\/Espruino control line|Led capture R&D, equipment|explicit ownership|written context/iu,
  );
  assert.doesNotMatch(
    esCopy,
    /Competencias principales|Resultados clave|Productos y sistemas clave|Impacto seleccionado|Productos y sistemas seleccionados|Experiencia seleccionada|orquestación consciente de recursos|produje formación|contexto de plataforma|I\+D hands-on|I\+D práctica|línea de control JavaScript\/Espruino|responsabilidad explícita|contexto escrito|gates de revisión|equipo\/contratistas|luz\/movimiento|I\+D de captura y equipos/iu,
  );
});

test('homepage profile and PDF core copy stay within compact word budgets', () => {
  for (const [locale, limits] of Object.entries(COPY_WORD_LIMITS)) {
    const messages = PORTFOLIO_LOCALE_MESSAGES[locale];
    const homepageWords = totalWords(messages, HOMEPAGE_PROFILE_COPY_KEYS);
    const pdfWords = totalWords(messages, PDF_CORE_COPY_KEYS);

    assert.ok(homepageWords <= limits.homepage, `${locale} homepage profile uses ${homepageWords}/${limits.homepage} words`);
    assert.ok(pdfWords <= limits.pdf, `${locale} PDF core uses ${pdfWords}/${limits.pdf} words`);
  }
});

test('PDF copy retains the portfolio positioning fact anchors in every locale', () => {
  for (const locale of EXPECTED_LOCALES) {
    const copy = PDF_CORE_COPY_KEYS
      .map((key) => PORTFOLIO_LOCALE_MESSAGES[locale][key])
      .join('\n');

    for (const anchor of PDF_POSITIONING_FACT_ANCHORS[locale]) {
      assert.ok(copy.includes(anchor), `${locale} PDF copy must retain: ${anchor}`);
    }
  }
});

test('every PDF product item is no longer than its homepage counterpart', () => {
  for (const locale of EXPECTED_LOCALES) {
    const messages = PORTFOLIO_LOCALE_MESSAGES[locale];
    for (const [profileId, pdfId] of PRODUCT_KEY_PAIRS) {
      const profileWords = wordCount(messages[`portfolio.profile.product.${profileId}.details`]);
      const pdfWords = wordCount(messages[`portfolio.pdf.product.${pdfId}.details`]);
      assert.ok(pdfWords <= profileWords, `${locale}.${pdfId} PDF copy uses ${pdfWords} words; homepage uses ${profileWords}`);
    }
  }
});

test('theme import finalization is neutral for save-only and save-and-apply flows', () => {
  assert.deepEqual(
    Object.fromEntries(Object.entries(PORTFOLIO_LOCALE_MESSAGES).map(([locale, messages]) => [
      locale,
      messages['portfolio.theme.import.status.finalizing'],
    ])),
    {
      en: 'Saving theme…',
      es: 'Guardando tema…',
      ru: 'Сохранение темы…',
    },
  );
});
