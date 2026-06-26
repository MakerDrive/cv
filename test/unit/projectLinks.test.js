import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';

import { loadProjectEntries } from '../../src/static-pages/data/projects.js';
import { PROJECT_TRANSLATIONS } from '../../src/static-pages/data/projectTranslations.js';

test('project entries expose project-specific YouTube channels', () => {
  const projects = loadProjectEntries();
  const bySlug = new Map(projects.map((project) => [project.slug, project]));

  assert.deepEqual(bySlug.get('complexscan')?.links, [
    {
      label: 'PHOTOGRAMMETRY',
      href: 'https://www.youtube.com/@PHOTOGRAMMETRY',
      summary: 'YouTube channel with photogrammetry and capture workflow demos',
    },
  ]);
  assert.deepEqual(bySlug.get('photopizza')?.links, [
    {
      label: 'PhotoPizza',
      href: 'https://www.youtube.com/@PhotoPizza',
      summary: 'YouTube channel with product updates and demos',
    },
  ]);
});

test('project entries include public author projects', () => {
  const projects = loadProjectEntries();
  const bySlug = new Map(projects.map((project) => [project.slug, project]));
  const expected = [
    ['mcp-agent-portal', 'https://github.com/rnd-pro/mcp-agent-portal'],
    ['project-graph-mcp', 'https://github.com/rnd-pro/project-graph-mcp'],
    ['agent-pool-mcp', 'https://github.com/rnd-pro/agent-pool-mcp'],
    ['browser-x-mcp', 'https://github.com/rnd-pro/browser-x-mcp'],
    ['context-x-mcp', 'https://github.com/rnd-pro/context-x-mcp'],
    ['terminal-x-mcp', 'https://github.com/rnd-pro/terminal-x-mcp'],
    ['symbiote-workspace', 'https://github.com/rnd-pro/symbiote-workspace'],
    ['symbiote-ui', 'https://github.com/rnd-pro/symbiote-ui'],
    ['symbiote-node', 'https://github.com/rnd-pro/symbiote-node'],
    ['symbiote-engine', 'https://github.com/rnd-pro/symbiote-engine'],
    ['photopizza-remote', 'https://github.com/PhotoPizza/remote'],
    ['photosnail-public', 'https://github.com/PhotoSnail/public'],
  ];

  for (const [slug, href] of expected) {
    const project = bySlug.get(slug);
    assert.equal(project?.href, href);
    assert.equal(project?.kicker, 'Author project');
    assert.equal(project?.linkLabel, 'View repository');
  }

  assert.equal(bySlug.get('symbiote-node')?.title, 'Symbiote Node');
  assert.match(bySlug.get('symbiote-node')?.summary || '', /Archived package workspace/);
});

test('project entries expose markdown details in portfolio data', () => {
  const projects = loadProjectEntries();
  const bySlug = new Map(projects.map((project) => [project.slug, project]));
  const megavisor = bySlug.get('megavisor');

  assert.match(megavisor?.summary || '', /360-degree capture workflows/);
  assert.match(megavisor?.details || '', /co-founder and technical director/);
  assert.match(megavisor?.details || '', /customer warehouses/);
  assert.doesNotMatch(megavisor?.details || '', /^# MEGAVISOR/);
});

test('lifecycle messaging platform describes a public-safe technology profile', () => {
  const projects = loadProjectEntries();
  const bySlug = new Map(projects.map((project) => [project.slug, project]));
  const project = bySlug.get('lifecycle-messaging-platform');

  assert.equal(project?.title, 'Lifecycle Messaging Platform');
  assert.match(project?.details || '', /Technology profile: JavaScript\/Node\.js/);
  assert.match(project?.details || '', /opt-in SMS/);
  assert.match(
    PROJECT_TRANSLATIONS.ru['lifecycle-messaging-platform'].details,
    /Технологический профиль: JavaScript\/Node\.js/
  );
  assert.match(
    PROJECT_TRANSLATIONS.es['lifecycle-messaging-platform'].details,
    /Perfil tecnológico: JavaScript\/Node\.js/
  );
  assert.doesNotMatch(project?.details || '', /1SIM/i);
  assert.doesNotMatch(project?.title || '', /Private Lifecycle Marketing Platform/i);
  assert.doesNotMatch(PROJECT_TRANSLATIONS.ru['lifecycle-messaging-platform'].details, /1SIM/i);
});

test('project translations cover every project entry', () => {
  const projects = loadProjectEntries();
  const slugs = projects.map((project) => project.slug);

  for (const locale of ['ru', 'es']) {
    assert.deepEqual(
      Object.keys(PROJECT_TRANSLATIONS[locale]).sort(),
      [...slugs].sort()
    );

    for (const slug of slugs) {
      assert.ok(PROJECT_TRANSLATIONS[locale][slug].summary?.trim(), `${locale}:${slug}:summary`);
      assert.ok(PROJECT_TRANSLATIONS[locale][slug].details?.trim(), `${locale}:${slug}:details`);
    }
  }
});

test('portfolio runtime localizes project entry fields', async () => {
  const source = await readFile(new URL('../../src/static-pages/js/index.js', import.meta.url), 'utf8');

  assert.match(source, /import \{ PROJECT_TRANSLATIONS \} from '\.\.\/data\/projectTranslations\.js';/);
  assert.match(source, /function getProjectSummary\(project\) {\s*return getProjectTranslation\(project\)\.summary \|\| project\.summary \|\| '';/);
  assert.match(source, /function getProjectDetails\(project\) {\s*return getProjectTranslation\(project\)\.details \|\| project\.details \|\| '';/);
  assert.match(source, /if \(kicker === 'Selected project'\) return tPortfolio\('project\.kicker\.selected'\);/);
  assert.match(source, /if \(label === 'View repository'\) return tPortfolio\('link\.viewRepository'\);/);
  assert.match(source, /summary: projectSummary,/);
  assert.match(source, /details: projectDetails,/);
});
