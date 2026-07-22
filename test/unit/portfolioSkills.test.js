import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import test from 'node:test';

import {
  PORTFOLIO_PDF_EXPERTISE_ROUTES,
  PORTFOLIO_PDF_IMPACT_ROUTES,
  PORTFOLIO_PDF_PRODUCT_ROUTES,
  PORTFOLIO_PROFILE_ITEM_ROUTES,
} from '../../src/static-pages/data/portfolioRelations.js';
import { socialLinks } from '../../src/static-pages/data/socialLinks.js';
import { PORTFOLIO_LOCALE_MESSAGES } from '../../src/static-pages/data/portfolioTranslations.js';
import { createPortfolioNavigationEntries } from '../../src/static-pages/js/portfolioPulseRuntime.js';

const LOCALES = ['en', 'ru', 'es'];

test('profile and PDF copy keep the relocation context operational and neutral', () => {
  const forbidden = { en: /\bwar\b/i, ru: /войн/i, es: /guerra/i };
  for (const locale of LOCALES) {
    const copy = Object.entries(PORTFOLIO_LOCALE_MESSAGES[locale])
      .filter(([key]) => key.startsWith('portfolio.profile.') || key.startsWith('portfolio.pdf.'))
      .map(([, value]) => value)
      .join('\n');
    assert.doesNotMatch(copy, forbidden[locale]);
  }
});

test('portfolio skills keep R&D central while separating hardware process automation', async () => {
  const source = await readFile(new URL('../../src/static-pages/js/index.js', import.meta.url), 'utf8');
  assert.match(source, /id: 'skills\/rnd-engineering'/);
  assert.match(source, /id: 'skills\/hardware-capture'/);
  assert.match(source, /details: tPortfolio\('skill\.agenticAi\.details'\)/);
  assert.match(source, /let result = \['skills\/rnd-engineering'\];/);
  assert.doesNotMatch(source, /skills\/automation/);
});

test('portfolio file tree groups projects by primary domain', async () => {
  const source = await readFile(new URL('../../src/static-pages/js/index.js', import.meta.url), 'utf8');
  const runtimeSource = await readFile(new URL('../../src/static-pages/js/portfolioPulseRuntime.js', import.meta.url), 'utf8');
  assert.match(source, /const PROJECT_TREE_GROUPS = \[/);
  assert.match(source, /id: 'agentic-ai'[\s\S]*'agent-portal'[\s\S]*'project-graph-mcp'[\s\S]*'symbiote-engine'/);
  assert.match(source, /id: 'hardware-capture'[\s\S]*'autobox-v1'[\s\S]*'f360-studio'[\s\S]*'complexscan'[\s\S]*'boothbot'[\s\S]*'photopizza'/);
  assert.match(runtimeSource, /const group = getProjectTreeGroup\(project\);/);
});

test('portfolio navigation exposes one Pulse destination without publication children', () => {
  const entries = createPortfolioNavigationEntries(
    [{ id: 'profile/photo', path: 'Profile/Vladimir.md' }],
    [
      { id: 'pulse/project-update', path: 'Pulse/Project update.md' },
      { id: 'pulse/index', path: 'Pulse.md' },
      { id: 'pulse/global-update', path: 'Pulse/Global update.md' },
    ],
    [{ id: 'skills/index', path: 'Skills/Overview.md' }],
  );
  assert.deepEqual(entries.filter((entry) => entry.id.startsWith('pulse/')), [{ id: 'pulse/index', path: 'Pulse.md' }]);
});

test('portfolio skill routes match the active skill identifiers', async () => {
  const root = new URL('../../src/static-pages/skills/', import.meta.url);
  await access(new URL('rnd-engineering/index.html.js', root));
  await access(new URL('hardware-capture/index.html.js', root));
  await assert.rejects(access(new URL('automation/index.html.js', root)), { code: 'ENOENT' });
});

test('localized profile and PDF preserve the compact semantic structure', () => {
  for (const locale of LOCALES) {
    const messages = PORTFOLIO_LOCALE_MESSAGES[locale];
    const keys = Object.keys(messages);
    const profile = keys.filter((key) => key.startsWith('portfolio.profile.')).map((key) => messages[key]).join('\n');
    const pdf = keys.filter((key) => key.startsWith('portfolio.pdf.')).map((key) => messages[key]).join('\n');
    const pageTitleOutcome = {
      en: /systems and platforms[^|]*complex-process automation/i,
      ru: /системы и платформы[^|]*автоматизаци[а-яё]* сложных процессов/iu,
      es: /sistemas y plataformas[^|]*automatizar procesos complejos/iu,
    };
    const pdfHeaderOutcome = {
      en: /process-automation[^|]*systems and platforms/i,
      ru: /системы и платформы[^|]*автоматизаци[а-яё]* процессов/iu,
      es: /sistemas y plataformas[^|]*automatización de procesos/iu,
    };
    const collaborationTitle = {
      en: /collaboration format/i,
      ru: /формат сотрудничества/iu,
      es: /formato de colaboración/iu,
    };
    const collaborationMeaning = {
      en: /work remotely[\s\S]*hands-on lead[\s\S]*senior individual contributor[\s\S]*RND-PRO[\s\S]*client project[\s\S]*broader-scope/i,
      ru: /работаю удалённо[\s\S]*hands-on lead[\s\S]*senior individual contributor[\s\S]*RND-PRO[\s\S]*проект заказчика[\s\S]*более широкого масштаба/iu,
      es: /trabajo en remoto[\s\S]*hands-on lead[\s\S]*senior individual contributor[\s\S]*RND-PRO[\s\S]*proyecto del cliente[\s\S]*mayor alcance/iu,
    };
    const fullStackDirection = {
      en: 'digital presence and content operations automation.',
      ru: 'автоматизация цифрового присутствия и контент-операций.',
      es: 'automatización de la presencia digital y las operaciones de contenido.',
    };

    assert.match(messages['portfolio.page.title'], pageTitleOutcome[locale]);
    assert.match(messages['portfolio.pdf.headerTitle'], pdfHeaderOutcome[locale]);
    assert.match(messages['portfolio.profile.collaborationTitle'], collaborationTitle[locale]);

    assert.equal(keys.filter((key) => /^portfolio\.profile\.expertise\..+\.label$/.test(key)).length, 4);
    assert.equal(keys.filter((key) => /^portfolio\.profile\.impact\..+\.label$/.test(key)).length, 4);
    assert.equal(keys.filter((key) => /^portfolio\.profile\.product\..+\.label$/.test(key)).length, 8);
    assert.equal(keys.filter((key) => /^portfolio\.profile\.role\..+\.label$/.test(key)).length, 4);
    assert.equal(keys.filter((key) => /^portfolio\.pdf\.product\..+\.label$/.test(key)).length, 8);
    assert.equal(keys.filter((key) => /^portfolio\.pdf\.role\..+\.label$/.test(key)).length, 4);
    assert.equal(keys.some((key) => key.startsWith('portfolio.profile.career.')), false);
    assert.equal(keys.some((key) => key.startsWith('portfolio.pdf.career.')), false);
    assert.equal(keys.some((key) => key.startsWith('portfolio.experience.')), false);

    assert.match(messages['portfolio.profile.details'], /15\+/);
    assert.match(messages['portfolio.profile.details'], /loop engineering/i);
    assert.doesNotMatch(messages['portfolio.profile.details'], /(?:В|En) loop engineering/u);
    const summaryOutcomePhrasing = {
      en: /Lead R&D engineer[^—]*—[^.]*designing and developing systems and platforms[^.]*complex-process automation[^.]*software, media, and hardware/i,
      ru: /Ведущий R&D-инженер[^—]*—[^.]*проектирование и разработка систем и платформ[^.]*автоматизации сложных процессов[^.]*software, media и hardware/iu,
      es: /Ingeniero principal de I\+D[^—]*—[^.]*diseño y desarrollo de sistemas y plataformas[^.]*automatizar procesos complejos[^.]*software, medios y hardware/iu,
    };
    const outcomeFirstPhrasing = {
      en: /I design and develop automation loops for complex processes and systems across domains at the intersection of software, media, and hardware/i,
      ru: /Проектирую и разрабатываю контуры автоматизации для сложных процессов и систем в разных предметных областях на стыке software, media и hardware/iu,
      es: /Diseño y desarrollo loops de automatización para procesos y sistemas complejos en distintos dominios, en la intersección de software, medios y hardware/iu,
    };
    const developmentMethodPhrasing = {
      en: /I apply loop engineering by defining context, planning, execution, and evals with explicit transitions and completion criteria/i,
      ru: /Контур строю по принципам loop engineering: задаю этапы context, planning, execution и evals, явные переходы и критерии завершения/iu,
      es: /Aplico loop engineering definiendo etapas de context, planning, execution y evals con transiciones explícitas y criterios de finalización/iu,
    };
    const forbiddenTopProfileDetails = {
      en: /(?:my|own) tools?[^.\n]*(?:unfamiliar codebases|domains, and stacks)|human escalation/i,
      ru: /собственн\w+ инструмент\w+[^.\n]*(?:незнаком|освоен)|подключаю человека|эскалаци\w+ человеку/iu,
      es: /mis herramientas[^.\n]*(?:bases de código|stacks desconocidos)|intervención humana|escalamiento humano/iu,
    };
    assert.match(messages['portfolio.profile.summary'], summaryOutcomePhrasing[locale]);
    assert.doesNotMatch(messages['portfolio.profile.summary'], /loop|MCP|RAG/i);
    const summaryCopy = [messages['portfolio.profile.details'], messages['portfolio.pdf.summaryDetails']];
    const requiredLoopConcepts = [
      /context/i,
      /planning/i,
      /execution/i,
      /evals/i,
      /transitions|переход|transiciones/i,
      /completion criteria|критери(?:и|ями) завершения|criterios de finalización/i,
      /RAG\/GraphRAG-style retrieval/i,
    ];
    for (const value of summaryCopy) {
      const narrativeParagraph = value.split(/\n\n/u)[1];
      assert.match(value, outcomeFirstPhrasing[locale]);
      if (value === messages['portfolio.profile.details']) assert.match(value, developmentMethodPhrasing[locale]);
      const loopEngineeringIndex = value.search(/loop engineering/i);
      assert.ok(loopEngineeringIndex >= 0, `${locale} top profile must name loop engineering`);
      assert.ok(
        value.search(outcomeFirstPhrasing[locale]) < loopEngineeringIndex,
        `${locale} top profile must lead with the automation outcome before the engineering stack`,
      );
      for (const concept of requiredLoopConcepts) assert.match(value, concept);
      assert.doesNotMatch(narrativeParagraph, /MCP\/WebMCP|client|customer|заказчик|cliente/iu);
      assert.doesNotMatch(value, /retry\/replan|guardrails|observability/i);
      assert.doesNotMatch(value, forbiddenTopProfileDetails[locale]);
    }
    const pdfCollaborationParagraph = messages['portfolio.pdf.summaryDetails'].split(/\n\n/u).at(-1);
    assert.match(pdfCollaborationParagraph, collaborationTitle[locale]);
    assert.match(messages['portfolio.profile.workFormatDetails'], collaborationMeaning[locale]);
    assert.match(pdfCollaborationParagraph, collaborationMeaning[locale]);
    const pdfFullStackBullet = messages['portfolio.pdf.expertiseDetails'].split('\n- ')[2].trim();
    const fullStackCopy = `${messages['portfolio.profile.expertise.fullStack.details']}\n${pdfFullStackBullet}`;
    assert.ok(messages['portfolio.profile.expertise.fullStack.details'].endsWith(fullStackDirection[locale]));
    assert.ok(pdfFullStackBullet.endsWith(fullStackDirection[locale]));
    assert.doesNotMatch(fullStackCopy, /Applied focus|Прикладной фокус|Enfoque aplicado|Focus:|Foco:/iu);
    assert.doesNotMatch(
      `${messages['portfolio.profile.summary']}\n${messages['portfolio.profile.details']}\n${messages['portfolio.pdf.summaryDetails']}`,
      /digital presence|цифрового присутствия|presencia digital/iu,
    );
    assert.doesNotMatch(messages['portfolio.profile.details'], /Lifecycle Messaging Platform/);
    assert.match(messages['portfolio.profile.workFormatDetails'], /hands-on lead/i);
    assert.match(messages['portfolio.profile.workFormatDetails'], /RND-PRO/);
    assert.match(messages['portfolio.profile.expertise.ai.details'], /MCP\/WebMCP/);
    assert.match(messages['portfolio.profile.expertise.ai.details'], /context engineering/i);
    assert.match(messages['portfolio.profile.expertise.ai.details'], /RAG\/GraphRAG/);
    assert.match(messages['portfolio.profile.expertise.ai.details'], /Project Graph/);
    assert.match(messages['portfolio.profile.expertise.ai.details'], /model\/resource routing/i);
    assert.match(messages['portfolio.profile.expertise.ai.details'], /multi-agent orchestration/i);
    assert.match(messages['portfolio.profile.expertise.ai.details'], /evals/i);
    assert.match(messages['portfolio.profile.expertise.ai.details'], /retry\/replan/i);
    assert.match(messages['portfolio.profile.expertise.ai.details'], /guardrails/i);
    assert.match(messages['portfolio.profile.expertise.ai.details'], /observability/i);
    for (const technicalDepthCopy of [
      messages['portfolio.profile.expertise.ai.details'],
      messages['portfolio.pdf.expertiseDetails'],
      messages['portfolio.skills.details'],
    ]) {
      assert.match(technicalDepthCopy, /retry\/replan/i);
      assert.match(technicalDepthCopy, /guardrails/i);
      assert.match(technicalDepthCopy, /observability/i);
    }
    assert.doesNotMatch(
      `${messages['portfolio.profile.expertise.ai.details']} ${messages['portfolio.pdf.expertiseDetails']}`,
      /optional human review|опциональный human review|revisión humana opcional/i,
    );
    assert.match(
      `${messages['portfolio.profile.expertise.rnd.label']} ${messages['portfolio.profile.expertise.rnd.details']}`,
      /leadership|лидерство|liderazgo/i,
    );
    assert.match(messages['portfolio.profile.expertise.rnd.details'], /contractor|подрядчик|contratista/i);
    assert.match(messages['portfolio.profile.expertise.hardware.details'], /JavaScript\/Espruino/);
    assert.match(messages['portfolio.profile.expertise.hardware.details'], /GSM/);
    assert.match(messages['portfolio.profile.expertise.hardware.details'], /AT/);
    assert.match(messages['portfolio.profile.expertise.hardware.details'], /photogrammetry|фотограмметри|fotogrametría/i);

    const automationPositioning = [
      messages['portfolio.skill.agenticAi.summary'],
      messages['portfolio.profile.impact.aiTooling.details'],
      messages['portfolio.profile.product.agentToolchain.details'],
      messages['portfolio.profile.role.rndPro.details'],
      messages['portfolio.bio.summary'],
      messages['portfolio.projects.details'],
      messages['portfolio.skills.summary'],
      messages['portfolio.pdf.impactDetails'],
      messages['portfolio.pdf.product.agentToolchain.details'],
      messages['portfolio.pdf.role.rndPro.details'],
    ].join('\n');
    assert.match(automationPositioning, /loop/i);
    assert.match(automationPositioning, /MCP\/WebMCP|MCP-WebMCP/i);
    assert.doesNotMatch(
      automationPositioning,
      /autonomous agent development|agent-development workspace|автономн\w* агентн\w* разработ|сред\w* агентн\w* разработ|desarrollo autónomo con agentes/i,
    );
    assert.doesNotMatch(
      `${messages['portfolio.profile.details']} ${messages['portfolio.profile.expertise.fullStack.details']} ${messages['portfolio.skills.details']}`,
      /unfamiliar stacks|незнаком\w* стек|stacks desconocidos/i,
    );
    assert.match(
      messages['portfolio.skill.agenticAi.details'],
      /agent-assisted development as an internal engineering workflow for research, prototyping, and verifiable implementation|Агентскую разработку использую как внутренний инженерный процесс для исследования, прототипирования и проверяемой реализации|desarrollo asistido por agentes como proceso interno de ingeniería para investigación, prototipado e implementación verificable/i,
    );

    assert.match(messages['portfolio.profile.impact.museumScanning.details'], /helped train and scale|помогал обучать и расширять|ayudé a formar y ampliar/i);
    assert.match(messages['portfolio.profile.impact.hardware.details'], /PhotoPizza/);
    assert.match(messages['portfolio.profile.impact.hardware.details'], /ComplexScan\/AUTOBOX/);
    assert.match(messages['portfolio.profile.impact.hardware.details'], /export|экспорт/i);
    assert.match(messages['portfolio.profile.impact.mediaProduction.details'], /3D photographers|3D-фотограф|fotógrafos 3D/i);
    assert.match(messages['portfolio.profile.impact.mediaProduction.details'], /retoucher|ретушёр|retocador/i);
    assert.match(messages['portfolio.profile.impact.mediaProduction.details'], /player|плеер|reproductor/i);

    for (const product of ['Agent Portal', 'Symbiote Workspace', 'Symbiote Video Studio', 'Lifecycle Messaging Platform', 'ComplexScan', 'PhotoPizza', 'OBJET.art', 'BoothBot']) {
      assert.match(profile, new RegExp(product.replace('.', '\\.')));
      assert.match(pdf, new RegExp(product.replace('.', '\\.')));
    }
    assert.doesNotMatch(profile, /Symbiote\.js/i);
    assert.doesNotMatch(pdf, /Symbiote\.js/i);
    assert.match(messages['portfolio.profile.role.rndPro.label'], /RND-PRO.*Lead R&D Engineer/i);
    assert.match(messages['portfolio.profile.role.f360.label'], /F360/);
    assert.match(messages['portfolio.profile.role.megavisor.label'], /MEGAVISOR \/ Gate9.*CTO/i);
    assert.match(messages['portfolio.profile.role.ziq.label'], /ZIQ Design.*3D Artist.*Graphic Designer/i);
    assert.match(messages['portfolio.profile.role.ziq.details'], /before MEGAVISOR|до MEGAVISOR|antes de MEGAVISOR/i);
    assert.doesNotMatch(profile, /confidential|конфиденциаль|confidencial/i);
    const falseAiTenure = {
      en: /15\+ years[^.\n]*(?:of|in) AI/i,
      ru: /15\+ лет[^.\n]*(?:в AI|AI-инженери)/iu,
      es: /15\+ años[^.\n]*(?:\ben IA\b|de IA\b)/i,
    };
    assert.doesNotMatch(messages['portfolio.profile.details'], falseAiTenure[locale]);
  }
});

test('profile routes and PDF routes preserve semantic item order', () => {
  assert.deepEqual(PORTFOLIO_PROFILE_ITEM_ROUTES.impact, {
    aiTooling: 'projects/agent-portal',
    museumScanning: 'projects/autobox-v1',
    hardware: 'projects/complexscan',
    mediaProduction: 'projects/megavisor',
  });
  assert.deepEqual(Object.keys(PORTFOLIO_PROFILE_ITEM_ROUTES.products), [
    'agentToolchain', 'symbiote', 'videoStudio', 'messaging', 'hardware', 'photopizza', 'objetArt', 'boothbot',
  ]);
  assert.deepEqual(PORTFOLIO_PDF_IMPACT_ROUTES, [
    'projects/agent-portal', 'projects/autobox-v1', 'projects/complexscan', 'projects/megavisor',
  ]);
  assert.equal(PORTFOLIO_PDF_EXPERTISE_ROUTES.length, 4);
  assert.equal(PORTFOLIO_PDF_PRODUCT_ROUTES.length, 8);
});

test('portfolio social and direct-contact links stay on both public surfaces', async () => {
  assert.deepEqual(socialLinks.map(({ id, href }) => [id, href]), [
    ['social/github', 'https://github.com/MakerDrive'],
    ['social/linkedin', 'https://www.linkedin.com/in/v-matiasevich/'],
    ['social/youtube', 'https://www.youtube.com/@VladimirMatiasevich'],
    ['social/facebook', 'https://www.facebook.com/v.matiasevich'],
  ]);
  const pageSource = await readFile(new URL('../../src/static-pages/js/index.js', import.meta.url), 'utf8');
  const pdfSource = await readFile(new URL('../../scripts/generate-portfolio-pdfs.js', import.meta.url), 'utf8');
  assert.match(pageSource, /PORTFOLIO_TELEGRAM_URL = 'https:\/\/t\.me\/text2code'/);
  assert.match(pdfSource, /PDF_RND_PRO_URL = 'https:\/\/rnd-pro\.com\/'/);
});

test('portfolio profile renders the agreed recruiter-facing hierarchy and chronology', async () => {
  const source = await readFile(new URL('../../src/static-pages/js/index.js', import.meta.url), 'utf8');
  const sections = [
    'profile.professionalTitle',
    'profile.collaborationTitle',
    'profile.expertiseTitle',
    'profile.impactTitle',
    'profile.productsTitle',
    'profile.experienceTitle',
  ].map((key) => source.indexOf(`title: tPortfolio('${key}')`));
  assert.ok(sections.every((index) => index >= 0));
  assert.deepEqual([...sections].sort((a, b) => a - b), sections);

  const roles = ['rndPro', 'f360', 'megavisor', 'ziq']
    .map((key) => source.indexOf(`label: tPortfolio('profile.role.${key}.label')`));
  assert.ok(roles.every((index) => index >= 0));
  assert.deepEqual([...roles].sort((a, b) => a - b), roles);
  assert.match(source, /title: tPortfolio\('profile\.professionalTitle'\)[\s\S]*body: tPortfolio\('profile\.details'\)/);
  assert.match(source, /title: tPortfolio\('profile\.collaborationTitle'\)[\s\S]*body: tPortfolio\('profile\.workFormatDetails'\)/);
  assert.match(source, /meta: getProfileMetaText\(\)/);
  assert.match(source, /sections: getProfileSections\(\)/);
});
