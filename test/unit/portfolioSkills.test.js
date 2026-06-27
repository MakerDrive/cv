import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import test from 'node:test';

import { PORTFOLIO_LOCALE_MESSAGES } from '../../src/static-pages/data/portfolioTranslations.js';

test('portfolio skills keep R&D central while separating hardware process automation', async () => {
  let source = await readFile(new URL('../../src/static-pages/js/index.js', import.meta.url), 'utf8');

  assert.match(source, /id: 'skills\/rnd-engineering'/);
  assert.match(source, /id: 'skills\/hardware-capture'/);
  assert.match(source, /let result = \['skills\/rnd-engineering'\];/);
  assert.doesNotMatch(source, /skills\/automation/);
});

test('portfolio file tree groups projects by primary domain', async () => {
  let source = await readFile(new URL('../../src/static-pages/js/index.js', import.meta.url), 'utf8');

  assert.match(source, /const PROJECT_TREE_GROUPS = \[/);
  assert.match(source, /id: 'agentic-ai'[\s\S]*'agent-portal'[\s\S]*'project-graph-mcp'[\s\S]*'symbiote-engine'/);
  assert.match(source, /const PROJECT_TREE_GROUP_PRIORITIES = Object\.freeze\(\{/);
  assert.match(source, /'agentic-ai': \[[\s\S]*'agent-portal'[\s\S]*'symbiote-workspace'[\s\S]*'symbiote-engine'[\s\S]*'project-graph-mcp'[\s\S]*'agent-pool-mcp'/);
  assert.match(source, /const orderedPortfolioProjects = orderProjectsForTree\(projects\);/);
  assert.match(source, /const portfolioTreeItems = createTreeItems\(orderedPortfolioProjects, orderedPortfolioProjects\);/);
  assert.match(source, /setNodePositions\(this\.canvas, orderedPortfolioProjects\);/);
  assert.match(source, /id: 'product-ui'[\s\S]*'symbiote-video-studio'[\s\S]*'megavisor'[\s\S]*'symbiote-ui'/);
  assert.match(source, /id: 'archive'[\s\S]*treeLabel: tPortfolio\('projectGroup\.archive\.label'\)[\s\S]*'symbiote-node'/);
  assert.match(source, /id: 'hardware-capture'[\s\S]*'autobox-v1'[\s\S]*'complexscan'[\s\S]*'boothbot'[\s\S]*'photopizza'/);
  assert.match(source, /treeLabel: tPortfolio\('projectGroup\.agenticAi\.label'\)/);
  assert.match(source, /treeLabel: tPortfolio\('projectGroup\.productUi\.label'\)/);
  assert.match(source, /treeLabel: tPortfolio\('projectGroup\.archive\.label'\)/);
  assert.match(source, /treeLabel: tPortfolio\('projectGroup\.hardware\.label'\)/);
  assert.match(source, /resourcePathSegment\(getProjectTreeGroupLabel\(getProjectTreeGroup\(project\)\)\)/);
  assert.match(source, /const TREE_STORAGE_KEY = `cv-portfolio-materials-tree-v4:\$\{portfolioLocalization\.locale\}`;/);
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

test('portfolio profile states full-stack work, native stack, and stack adaptation', () => {
  assert.match(PORTFOLIO_LOCALE_MESSAGES.en['portfolio.profile.summary'], /Full-stack R&D/);
  assert.match(PORTFOLIO_LOCALE_MESSAGES.en['portfolio.profile.details'], /JavaScript, Node\.js, Web\/PWA, and Web Components/);
  assert.match(PORTFOLIO_LOCALE_MESSAGES.en['portfolio.profile.details'], /GSM modems/);
  assert.match(PORTFOLIO_LOCALE_MESSAGES.en['portfolio.profile.details'], /AT-command control/);
  assert.match(PORTFOLIO_LOCALE_MESSAGES.en['portfolio.profile.details'], /\[Lifecycle Messaging Platform\]\(projects\/lifecycle-messaging-platform\/\?lang=en\)/);
  assert.match(PORTFOLIO_LOCALE_MESSAGES.en['portfolio.profile.statusDetails'], /Open to a new R&D \/ product engineering project/);
  assert.match(PORTFOLIO_LOCALE_MESSAGES.en['portfolio.profile.focusDetails'], /understand an uncertain domain quickly/);
  assert.match(PORTFOLIO_LOCALE_MESSAGES.en['portfolio.profile.focusDetails'], /bring the prototype to a working result/);
  assert.match(PORTFOLIO_LOCALE_MESSAGES.en['portfolio.profile.workFormatDetails'], /Remote-friendly R&D \/ product engineering work/);
  assert.match(PORTFOLIO_LOCALE_MESSAGES.en['portfolio.profile.achievement.rndProducts.details'], /Invented original product and technology lines/);
  assert.match(PORTFOLIO_LOCALE_MESSAGES.en['portfolio.profile.achievement.hardware.details'], /shipped products internationally/);
  assert.match(PORTFOLIO_LOCALE_MESSAGES.en['portfolio.profile.achievement.museumScanning.details'], /upper competitive level of its time/);
  assert.match(PORTFOLIO_LOCALE_MESSAGES.en['portfolio.profile.career.megavisor.details'], /capture-side R&D/);
  assert.match(PORTFOLIO_LOCALE_MESSAGES.en['portfolio.profile.career.hardware.details'], /original museum-grade 3D scanning technology/);
  assert.match(PORTFOLIO_LOCALE_MESSAGES.en['portfolio.profile.career.messaging.details'], /Confidential commercial platform/);
  assert.match(PORTFOLIO_LOCALE_MESSAGES.en['portfolio.bio.details'], /stack adaptation/);
  assert.match(PORTFOLIO_LOCALE_MESSAGES.en['portfolio.bio.details'], /GSM modem and AT-command automation/);
  assert.match(PORTFOLIO_LOCALE_MESSAGES.en['portfolio.profile.age'], /Age: \{age\}/);
  assert.match(PORTFOLIO_LOCALE_MESSAGES.en['portfolio.profile.experienceSummary'], /10\+ years in R&D, product engineering, and full-stack development/);
  assert.match(PORTFOLIO_LOCALE_MESSAGES.en['portfolio.experience.rnd.label'], /R&D engineering experience/);
  assert.match(PORTFOLIO_LOCALE_MESSAGES.en['portfolio.experience.programming.label'], /Programming \/ full-stack experience/);
  assert.match(PORTFOLIO_LOCALE_MESSAGES.en['portfolio.experience.programming.details'], /PostgreSQL/);
  assert.match(PORTFOLIO_LOCALE_MESSAGES.en['portfolio.experience.programming.details'], /AT-command control/);

  assert.match(PORTFOLIO_LOCALE_MESSAGES.ru['portfolio.profile.summary'], /full-stack R&D/);
  assert.match(PORTFOLIO_LOCALE_MESSAGES.ru['portfolio.profile.details'], /Родной стек: JavaScript, Node\.js, Web\/PWA и Web Components/);
  assert.match(PORTFOLIO_LOCALE_MESSAGES.ru['portfolio.profile.details'], /быстро понять кодовую базу/);
  assert.match(PORTFOLIO_LOCALE_MESSAGES.ru['portfolio.profile.details'], /GSM-модемы/);
  assert.match(PORTFOLIO_LOCALE_MESSAGES.ru['portfolio.profile.details'], /AT-команды/);
  assert.match(PORTFOLIO_LOCALE_MESSAGES.ru['portfolio.profile.details'], /\[Lifecycle Messaging Platform\]\(projects\/lifecycle-messaging-platform\/\?lang=ru\)/);
  assert.match(PORTFOLIO_LOCALE_MESSAGES.ru['portfolio.profile.statusDetails'], /Открыт к новому R&D \/ product engineering проекту/);
  assert.match(PORTFOLIO_LOCALE_MESSAGES.ru['portfolio.profile.focusDetails'], /быстро разобраться в неопределённой области/);
  assert.match(PORTFOLIO_LOCALE_MESSAGES.ru['portfolio.profile.focusDetails'], /довести прототип до работающего результата/);
  assert.match(PORTFOLIO_LOCALE_MESSAGES.ru['portfolio.profile.workFormatDetails'], /Remote-friendly R&D \/ product engineering работа/);
  assert.match(PORTFOLIO_LOCALE_MESSAGES.ru['portfolio.profile.achievement.rndProducts.details'], /Придумывал собственные продуктовые и технологические линии/);
  assert.match(PORTFOLIO_LOCALE_MESSAGES.ru['portfolio.profile.achievement.hardware.details'], /отправлял изделия за границу/);
  assert.match(PORTFOLIO_LOCALE_MESSAGES.ru['portfolio.profile.achievement.museumScanning.details'], /верхней конкурентной планки своего времени/);
  assert.match(PORTFOLIO_LOCALE_MESSAGES.ru['portfolio.profile.career.megavisor.details'], /R&D съёмочной части/);
  assert.match(PORTFOLIO_LOCALE_MESSAGES.ru['portfolio.profile.career.hardware.details'], /авторской музейной технологии 3D-сканирования/);
  assert.match(PORTFOLIO_LOCALE_MESSAGES.ru['portfolio.profile.career.messaging.details'], /Конфиденциальная коммерческая платформа/);
  assert.match(PORTFOLIO_LOCALE_MESSAGES.ru['portfolio.bio.details'], /адаптация к стеку/);
  assert.match(PORTFOLIO_LOCALE_MESSAGES.ru['portfolio.bio.details'], /GSM-модемы и AT-команды/);
  assert.match(PORTFOLIO_LOCALE_MESSAGES.ru['portfolio.profile.age'], /Возраст: \{age\}/);
  assert.match(PORTFOLIO_LOCALE_MESSAGES.ru['portfolio.profile.experienceSummary'], /10\+ лет в R&D, продуктовой инженерии и full-stack разработке/);
  assert.match(PORTFOLIO_LOCALE_MESSAGES.ru['portfolio.experience.rnd.label'], /R&D-инженерный опыт/);
  assert.match(PORTFOLIO_LOCALE_MESSAGES.ru['portfolio.experience.programming.label'], /Программистский \/ full-stack опыт/);
  assert.match(PORTFOLIO_LOCALE_MESSAGES.ru['portfolio.experience.programming.details'], /PostgreSQL/);
  assert.match(PORTFOLIO_LOCALE_MESSAGES.ru['portfolio.experience.programming.details'], /AT-command управлением/);

  assert.match(PORTFOLIO_LOCALE_MESSAGES.es['portfolio.profile.summary'], /full-stack/);
  assert.match(PORTFOLIO_LOCALE_MESSAGES.es['portfolio.profile.details'], /JavaScript, Node\.js, Web\/PWA y Web Components/);
  assert.match(PORTFOLIO_LOCALE_MESSAGES.es['portfolio.profile.details'], /módems GSM/);
  assert.match(PORTFOLIO_LOCALE_MESSAGES.es['portfolio.profile.details'], /comandos AT/);
  assert.match(PORTFOLIO_LOCALE_MESSAGES.es['portfolio.profile.details'], /\[Lifecycle Messaging Platform\]\(projects\/lifecycle-messaging-platform\/\?lang=es\)/);
  assert.match(PORTFOLIO_LOCALE_MESSAGES.es['portfolio.profile.statusDetails'], /Abierto a un nuevo proyecto/);
  assert.match(PORTFOLIO_LOCALE_MESSAGES.es['portfolio.profile.focusDetails'], /entender rápido un dominio incierto/);
  assert.match(PORTFOLIO_LOCALE_MESSAGES.es['portfolio.profile.focusDetails'], /llevar el prototipo a un resultado funcional/);
  assert.match(PORTFOLIO_LOCALE_MESSAGES.es['portfolio.profile.workFormatDetails'], /Trabajo remoto-friendly de I\+D \/ product engineering/);
  assert.match(PORTFOLIO_LOCALE_MESSAGES.es['portfolio.profile.achievement.rndProducts.details'], /Inventé líneas originales de producto y tecnología/);
  assert.match(PORTFOLIO_LOCALE_MESSAGES.es['portfolio.profile.achievement.hardware.details'], /envié productos internacionalmente/);
  assert.match(PORTFOLIO_LOCALE_MESSAGES.es['portfolio.profile.achievement.museumScanning.details'], /nivel competitivo alto de su momento/);
  assert.match(PORTFOLIO_LOCALE_MESSAGES.es['portfolio.profile.career.megavisor.details'], /I\+D de captura/);
  assert.match(PORTFOLIO_LOCALE_MESSAGES.es['portfolio.profile.career.hardware.details'], /tecnología propia de escaneo 3D/);
  assert.match(PORTFOLIO_LOCALE_MESSAGES.es['portfolio.profile.career.messaging.details'], /Plataforma comercial confidencial/);
  assert.match(PORTFOLIO_LOCALE_MESSAGES.es['portfolio.bio.details'], /adaptarme al stack/);
  assert.match(PORTFOLIO_LOCALE_MESSAGES.es['portfolio.bio.details'], /módems GSM y comandos AT/);
  assert.match(PORTFOLIO_LOCALE_MESSAGES.es['portfolio.profile.age'], /Edad: \{age\}/);
  assert.match(PORTFOLIO_LOCALE_MESSAGES.es['portfolio.profile.experienceSummary'], /10\+ años en I\+D, ingeniería de producto y desarrollo full-stack/);
  assert.match(PORTFOLIO_LOCALE_MESSAGES.es['portfolio.experience.rnd.label'], /Experiencia de ingeniería I\+D/);
  assert.match(PORTFOLIO_LOCALE_MESSAGES.es['portfolio.experience.programming.label'], /Experiencia de programación \/ full-stack/);
  assert.match(PORTFOLIO_LOCALE_MESSAGES.es['portfolio.experience.programming.details'], /PostgreSQL/);
  assert.match(PORTFOLIO_LOCALE_MESSAGES.es['portfolio.experience.programming.details'], /comandos AT/);
});

test('portfolio profile renders age and separated experience sections', async () => {
  let source = await readFile(new URL('../../src/static-pages/js/index.js', import.meta.url), 'utf8');

  assert.match(source, /const PORTFOLIO_PROFILE_AGE = 41;/);
  assert.match(source, /title: tPortfolio\('profile\.statusTitle'\)/);
  assert.doesNotMatch(source, /profile\.factsTitle/);
  assert.match(source, /title: tPortfolio\('profile\.focusTitle'\)/);
  assert.match(source, /body: tPortfolio\('profile\.focusDetails'\)/);
  assert.match(source, /title: tPortfolio\('profile\.workFormatTitle'\)/);
  assert.match(source, /body: tPortfolio\('profile\.workFormatDetails'\)/);
  assert.match(source, /title: tPortfolio\('profile\.achievementsTitle'\)/);
  assert.match(source, /label: tPortfolio\('profile\.achievement\.hardware\.label'\)/);
  assert.match(source, /title: tPortfolio\('profile\.careerTitle'\)/);
  assert.match(source, /label: tPortfolio\('profile\.career\.megavisor\.label'\)/);
  assert.match(source, /tPortfolio\('profile\.age', \{ age: PORTFOLIO_PROFILE_AGE \}\)/);
  assert.match(source, /tPortfolio\('profile\.experienceSummary'\)/);
  assert.match(source, /meta: getProfileMetaText\(\)/);
  assert.match(source, /title: tPortfolio\('experience\.title'\)/);
  assert.match(source, /label: tPortfolio\('experience\.rnd\.label'\)/);
  assert.match(source, /label: tPortfolio\('experience\.programming\.label'\)/);
  assert.match(source, /sections: getProfileSections\(\)/);
});
