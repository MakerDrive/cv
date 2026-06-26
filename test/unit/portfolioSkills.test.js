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
  assert.match(PORTFOLIO_LOCALE_MESSAGES.en['portfolio.bio.details'], /stack adaptation/);
  assert.match(PORTFOLIO_LOCALE_MESSAGES.en['portfolio.profile.age'], /Age: \{age\}/);
  assert.match(PORTFOLIO_LOCALE_MESSAGES.en['portfolio.experience.rnd.label'], /R&D engineering experience/);
  assert.match(PORTFOLIO_LOCALE_MESSAGES.en['portfolio.experience.programming.label'], /Programming \/ full-stack experience/);

  assert.match(PORTFOLIO_LOCALE_MESSAGES.ru['portfolio.profile.summary'], /full-stack R&D/);
  assert.match(PORTFOLIO_LOCALE_MESSAGES.ru['portfolio.profile.details'], /Родной стек: JavaScript, Node\.js, Web\/PWA и Web Components/);
  assert.match(PORTFOLIO_LOCALE_MESSAGES.ru['portfolio.profile.details'], /быстро понять кодовую базу/);
  assert.match(PORTFOLIO_LOCALE_MESSAGES.ru['portfolio.bio.details'], /адаптация к стеку/);
  assert.match(PORTFOLIO_LOCALE_MESSAGES.ru['portfolio.profile.age'], /Возраст: \{age\}/);
  assert.match(PORTFOLIO_LOCALE_MESSAGES.ru['portfolio.experience.rnd.label'], /R&D-инженерный опыт/);
  assert.match(PORTFOLIO_LOCALE_MESSAGES.ru['portfolio.experience.programming.label'], /Программистский \/ full-stack опыт/);

  assert.match(PORTFOLIO_LOCALE_MESSAGES.es['portfolio.profile.summary'], /full-stack/);
  assert.match(PORTFOLIO_LOCALE_MESSAGES.es['portfolio.profile.details'], /JavaScript, Node\.js, Web\/PWA y Web Components/);
  assert.match(PORTFOLIO_LOCALE_MESSAGES.es['portfolio.bio.details'], /adaptarme al stack/);
  assert.match(PORTFOLIO_LOCALE_MESSAGES.es['portfolio.profile.age'], /Edad: \{age\}/);
  assert.match(PORTFOLIO_LOCALE_MESSAGES.es['portfolio.experience.rnd.label'], /Experiencia de ingeniería I\+D/);
  assert.match(PORTFOLIO_LOCALE_MESSAGES.es['portfolio.experience.programming.label'], /Experiencia de programación \/ full-stack/);
});

test('portfolio profile renders age and separated experience sections', async () => {
  let source = await readFile(new URL('../../src/static-pages/js/index.js', import.meta.url), 'utf8');

  assert.match(source, /const PORTFOLIO_PROFILE_AGE = 41;/);
  assert.match(source, /tPortfolio\('profile\.age', \{ age: PORTFOLIO_PROFILE_AGE \}\)/);
  assert.match(source, /title: tPortfolio\('experience\.title'\)/);
  assert.match(source, /label: tPortfolio\('experience\.rnd\.label'\)/);
  assert.match(source, /label: tPortfolio\('experience\.programming\.label'\)/);
  assert.match(source, /sections: getProfileSections\(\)/);
});
