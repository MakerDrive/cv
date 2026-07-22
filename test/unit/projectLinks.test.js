import assert from 'node:assert/strict';
import test from 'node:test';
import { access, readFile } from 'node:fs/promises';

import { loadProjectEntries } from '../../src/static-pages/data/projects.js';
import { PROJECT_TRANSLATIONS } from '../../src/static-pages/data/projectTranslations.js';

test('every project entry has project and pulse deep-route sources', async () => {
  for (const project of loadProjectEntries()) {
    await access(new URL(`../../src/static-pages/projects/${project.slug}/index.html.js`, import.meta.url));
    await access(new URL(`../../src/static-pages/pulse/${project.slug}/index.html.js`, import.meta.url));
  }
});

test('project entries expose project-specific public sources', () => {
  const projects = loadProjectEntries();
  const bySlug = new Map(projects.map((project) => [project.slug, project]));

  assert.deepEqual(bySlug.get('complexscan')?.links, []);
  assert.deepEqual(bySlug.get('f360-studio')?.links, [
    {
      label: 'YouTube',
      href: 'https://www.youtube.com/@PHOTOGRAMMETRY',
      summary: 'YouTube channel with photogrammetry and capture workflow demos',
    },
    {
      label: 'Sketchfab',
      href: 'https://sketchfab.com/F360-Studio',
      summary: 'F360 Studio 3D model portfolio',
    },
  ]);
  assert.deepEqual(bySlug.get('photopizza')?.links, [
    {
      label: 'PhotoPizza',
      href: 'https://www.youtube.com/@PhotoPizza',
      summary: 'YouTube channel with product updates and demos',
    },
  ]);
  assert.deepEqual(bySlug.get('autobox-v1')?.links, [
    {
      label: 'OBJET.art',
      href: 'https://objet.art/',
      summary: 'Cultural heritage platform',
    },
    {
      label: 'ArtClub Digital Heritage',
      href: 'https://www.youtube.com/@ArtClub_DigitalHeritage',
      summary: 'Cultural-heritage 3D visualizations',
    },
    {
      label: 'R&D journal',
      href: 'https://rnd-pro.com/pulse/3D-scanning-netsuke/',
      summary: 'Hermitage netsuke scanning story',
    },
    {
      label: 'Digital Benin',
      href: 'https://digitalbenin.org/institutions/198/3d',
      summary: 'Benin bronze digitization record',
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
  assert.match(bySlug.get('symbiote-node')?.summary || '', /Early package workspace/);
  assert.doesNotMatch(bySlug.get('symbiote-node')?.summary || '', /archived|legacy/i);
});

test('project entries expose markdown details in portfolio data', () => {
  const projects = loadProjectEntries();
  const bySlug = new Map(projects.map((project) => [project.slug, project]));
  const agentPortal = bySlug.get('agent-portal');
  const projectGraph = bySlug.get('project-graph-mcp');
  const agentPool = bySlug.get('agent-pool-mcp');
  const megavisor = bySlug.get('megavisor');
  const autobox = bySlug.get('autobox-v1');
  const complexscan = bySlug.get('complexscan');

  assert.match(agentPortal?.summary || '', /graph-based context/);
  assert.match(agentPortal?.summary || '', /RAG-style context retrieval/);
  assert.match(agentPortal?.summary || '', /model\/resource routing/);
  assert.match(agentPortal?.details || '', /resource-aware agent development/);
  assert.match(agentPortal?.details || '', /human-in-the-loop control/);
  assert.match(agentPortal?.details || '', /cheaper\/faster models/);
  assert.match(projectGraph?.summary || '', /RAG-style project retrieval/);
  assert.match(projectGraph?.summary || '', /compressed project skeletons/);
  assert.match(projectGraph?.details || '', /GraphRAG-style retrieval/);
  assert.match(projectGraph?.details || '', /10-50x context reduction/);
  assert.match(projectGraph?.details || '', /faster\/cheaper model/);
  assert.match(agentPool?.summary || '', /assigning model\/resource tiers/);
  assert.match(agentPool?.summary || '', /handoffs/);
  assert.match(agentPool?.details || '', /cross-model consensus/);
  assert.match(agentPool?.details || '', /eval-style checks/);
  assert.match(agentPool?.details || '', /cheaper\/faster workers/);
  assert.match(megavisor?.summary || '', /360-degree capture workflows/);
  assert.match(megavisor?.details || '', /co-founder and CTO/);
  assert.match(megavisor?.details || '', /customer warehouses/);
  assert.match(megavisor?.details || '', /Gate9/);
  assert.match(megavisor?.details || '', /retail stores/);
  assert.match(megavisor?.details || '', /contributed product ideas/);
  assert.doesNotMatch(megavisor?.details || '', /^# MEGAVISOR/);
  assert.match(autobox?.details || '', /original capture technology line/);
  assert.match(autobox?.details || '', /upper competitive level of its time/);
  assert.match(autobox?.details || '', /Ten Japanese netsuke objects/);
  assert.match(autobox?.details || '', /Anna Savelyeva/);
  assert.match(autobox?.details || '', /Max Rutherston/);
  assert.match(autobox?.details || '', /himotoshi cord holes/);
  assert.match(autobox?.details || '', /complex equipment logistics/);
  assert.match(autobox?.details || '', /3D photographers, retouchers, and visualizers/);
  assert.match(autobox?.details || '', /hands-on small-batch model/);
  assert.match(autobox?.details || '', /laser-cut metal and acrylic/);
  assert.match(autobox?.details || '', /recruiting programmers/);
  assert.match(autobox?.details || '', /web 3D player/);
  assert.match(autobox?.details || '', /meeting point for museums, galleries, private collections/);
  assert.match(complexscan?.details || '', /original product line/);
  assert.match(complexscan?.details || '', /higher-quality source textures/);
  assert.match(complexscan?.details || '', /export documents/);
  assert.match(complexscan?.details || '', /small-batch production/);
  assert.match(complexscan?.details || '', /specialist contractors/);
  assert.match(PROJECT_TRANSLATIONS.ru['autobox-v1'].details, /развивал собственную технологическую линию съёмки/);
  assert.match(PROJECT_TRANSLATIONS.ru['autobox-v1'].details, /верхней конкурентной планки своего времени/);
  assert.match(PROJECT_TRANSLATIONS.ru['autobox-v1'].details, /Десять японских нэцкэ/);
  assert.match(PROJECT_TRANSLATIONS.ru['autobox-v1'].details, /Анны Савельевой/);
  assert.match(PROJECT_TRANSLATIONS.ru['autobox-v1'].details, /Макса Ратерстона/);
  assert.match(PROJECT_TRANSLATIONS.ru['autobox-v1'].details, /himotoshi/);
  assert.match(PROJECT_TRANSLATIONS.ru['autobox-v1'].details, /сложной логистикой оборудования/);
  assert.match(PROJECT_TRANSLATIONS.ru['autobox-v1'].details, /3D-фотографов, ретушёров и визуализаторов/);
  assert.match(PROJECT_TRANSLATIONS.ru['autobox-v1'].details, /мелкосерийной модели/);
  assert.match(PROJECT_TRANSLATIONS.ru.complexscan.details, /мелкосерийное, а не массовое производство/);
  assert.match(PROJECT_TRANSLATIONS.ru['autobox-v1'].details, /поиске программистов/);
  assert.match(PROJECT_TRANSLATIONS.ru['autobox-v1'].details, /веб-3D-плеера/);
  assert.match(PROJECT_TRANSLATIONS.ru.complexscan.details, /авторской продуктовой линией/);
  assert.match(PROJECT_TRANSLATIONS.ru.complexscan.details, /экспортные документы/);
  assert.match(PROJECT_TRANSLATIONS.ru.megavisor.details, /Gate9/);
  assert.match(PROJECT_TRANSLATIONS.ru.megavisor.details, /магазинах/);
  assert.match(PROJECT_TRANSLATIONS.ru['agent-portal'].details, /ресурсная оптимизация агентной разработки/);
  assert.match(PROJECT_TRANSLATIONS.ru['agent-portal'].details, /RAG-style context retrieval/);
  assert.match(PROJECT_TRANSLATIONS.ru['project-graph-mcp'].details, /10-50 раз/);
  assert.match(PROJECT_TRANSLATIONS.ru['project-graph-mcp'].details, /GraphRAG-style retrieval/);
  assert.match(PROJECT_TRANSLATIONS.ru['agent-pool-mcp'].details, /кросс-модельный консенсус/);
  assert.match(PROJECT_TRANSLATIONS.ru['agent-pool-mcp'].details, /eval-style проверки/);
  assert.match(PROJECT_TRANSLATIONS.es['autobox-v1'].details, /línea propia de tecnología de captura/);
  assert.match(PROJECT_TRANSLATIONS.es['autobox-v1'].details, /Diez netsuke japoneses/);
  assert.match(PROJECT_TRANSLATIONS.es['autobox-v1'].details, /Anna Savelyeva/);
  assert.match(PROJECT_TRANSLATIONS.es['autobox-v1'].details, /Max Rutherston/);
  assert.match(PROJECT_TRANSLATIONS.es['autobox-v1'].details, /himotoshi/);
  assert.match(PROJECT_TRANSLATIONS.es['autobox-v1'].details, /logística compleja de equipos/);
  assert.match(PROJECT_TRANSLATIONS.es['autobox-v1'].details, /fotógrafos 3D, retocadores y visualizadores/);
  assert.match(PROJECT_TRANSLATIONS.es['autobox-v1'].details, /modelo hands-on de series pequeñas/);
  assert.match(PROJECT_TRANSLATIONS.es.complexscan.details, /producción en series pequeñas/);
  assert.match(PROJECT_TRANSLATIONS.es['autobox-v1'].details, /búsqueda de programadores/);
  assert.match(PROJECT_TRANSLATIONS.es['autobox-v1'].details, /reproductor 3D web/);
  assert.match(PROJECT_TRANSLATIONS.es.complexscan.details, /línea de producto propia/);
  assert.match(PROJECT_TRANSLATIONS.es.complexscan.details, /documentos de exportación/);
  assert.match(PROJECT_TRANSLATIONS.es.megavisor.details, /Gate9/);
  assert.match(PROJECT_TRANSLATIONS.es.megavisor.details, /tiendas/);
  assert.match(PROJECT_TRANSLATIONS.es['agent-portal'].details, /optimización de recursos/);
  assert.match(PROJECT_TRANSLATIONS.es['agent-portal'].details, /RAG-style context retrieval/);
  assert.match(PROJECT_TRANSLATIONS.es['project-graph-mcp'].details, /10-50x/);
  assert.match(PROJECT_TRANSLATIONS.es['project-graph-mcp'].details, /GraphRAG-style retrieval/);
  assert.match(PROJECT_TRANSLATIONS.es['agent-pool-mcp'].details, /workers más baratos\/rápidos/);
  assert.match(PROJECT_TRANSLATIONS.es['agent-pool-mcp'].details, /checks tipo eval/);
});

test('older project entries expose visible work periods', () => {
  const projects = loadProjectEntries();
  const bySlug = new Map(projects.map((project) => [project.slug, project]));

  assert.equal(bySlug.get('megavisor')?.period, '2010-2014');
  assert.equal(bySlug.get('photopizza')?.period, '2010-2022');
  assert.equal(bySlug.get('photosnail-public')?.period, '2016');
  assert.equal(bySlug.get('complexscan')?.period, '2017-2022');
  assert.equal(bySlug.get('boothbot')?.period, '2018');
  assert.equal(bySlug.get('photopizza-remote')?.period, '2018-2019');
  assert.equal(bySlug.get('autobox-v1')?.period, '2019-2021');
  assert.equal(bySlug.get('f360-studio')?.period, '2021-2022');
  assert.equal(bySlug.get('f360-studio')?.order, 3.5);
});

test('equipment-control R&D attribution and bottle-catalog branch stay explicit', () => {
  const projects = loadProjectEntries();
  const bySlug = new Map(projects.map((project) => [project.slug, project]));

  assert.match(bySlug.get('megavisor')?.details || '', /products ranging from phones to motorcycles/);
  assert.match(bySlug.get('megavisor')?.details || '', /technical specification for the controller software/);
  assert.match(bySlug.get('megavisor')?.details || '', /contracted specialist implemented the first Arduino version/);
  assert.match(bySlug.get('photopizza')?.details || '', /developing the control software myself in JavaScript\/Espruino/);
  assert.match(bySlug.get('photopizza')?.details || '', /BoothBot/);
  assert.match(bySlug.get('boothbot')?.details || '', /important branch of my equipment and control-software R&D/);
  assert.match(PROJECT_TRANSLATIONS.ru.photopizza.details, /сам начал разрабатывать управляющее ПО на JavaScript\/Espruino/);
  assert.match(PROJECT_TRANSLATIONS.ru.photopizza.details, /первую Arduino-версию.*реализовал привлечённый специалист/);
  assert.match(PROJECT_TRANSLATIONS.ru.megavisor.details, /от телефонов до мотоциклов/);
  assert.match(PROJECT_TRANSLATIONS.ru.megavisor.details, /составлял техническое задание на управляющее ПО/);
  assert.doesNotMatch(PROJECT_TRANSLATIONS.ru.photopizza.details, /формир/);
  assert.doesNotMatch(PROJECT_TRANSLATIONS.ru.megavisor.details, /формир/);
  assert.match(PROJECT_TRANSLATIONS.ru.boothbot.details, /важной ветвью моей R&D-линии/);
  assert.match(PROJECT_TRANSLATIONS.es.photopizza.details, /desarrollar personalmente el software en JavaScript\/Espruino/);
  assert.match(PROJECT_TRANSLATIONS.es.boothbot.details, /rama importante de mi línea I\+D/);
});

test('F360 Studio is a standalone sourced project after the museum-scanning line', () => {
  const project = loadProjectEntries().find((entry) => entry.slug === 'f360-studio');

  assert.equal(project?.title, 'F360 Studio');
  assert.equal(project?.links.length, 2);
  assert.ok(project?.links.some((link) => link.href === 'https://www.youtube.com/@PHOTOGRAMMETRY'));
  assert.ok(project?.links.some((link) => link.href === 'https://sketchfab.com/F360-Studio'));
  assert.match(project?.details || '', /museum-scanning work/i);
  assert.match(project?.details || '', /Russia to Argentina/i);
  assert.match(project?.details || '', /physical production base/i);
  assert.doesNotMatch(PROJECT_TRANSLATIONS.ru['f360-studio'].details, /до ComplexScan|до AUTOBOX/i);
  assert.doesNotMatch(PROJECT_TRANSLATIONS.es['f360-studio'].details, /antes de ComplexScan|antes de AUTOBOX/i);
});

test('lifecycle messaging platform describes a public-safe technology profile', () => {
  const projects = loadProjectEntries();
  const bySlug = new Map(projects.map((project) => [project.slug, project]));
  const project = bySlug.get('lifecycle-messaging-platform');

  assert.equal(project?.title, 'Lifecycle Messaging Platform');
  assert.match(project?.details || '', /Technology profile:/);
  assert.match(project?.details || '', /Backend\/runtime: JavaScript\/Node\.js/);
  assert.match(project?.details || '', /opt-in SMS/);
  assert.match(project?.details || '', /GSM modem pools/);
  assert.match(project?.details || '', /AT commands/);
  assert.match(project?.details || '', /server infrastructure/);
  assert.match(
    PROJECT_TRANSLATIONS.ru['lifecycle-messaging-platform'].details,
    /Технологический профиль:/
  );
  assert.match(
    PROJECT_TRANSLATIONS.ru['lifecycle-messaging-platform'].details,
    /Backend\/runtime: JavaScript\/Node\.js/
  );
  assert.match(
    PROJECT_TRANSLATIONS.ru['lifecycle-messaging-platform'].details,
    /GSM-модемные пулы/
  );
  assert.match(
    PROJECT_TRANSLATIONS.ru['lifecycle-messaging-platform'].details,
    /AT-команды/
  );
  assert.match(
    PROJECT_TRANSLATIONS.es['lifecycle-messaging-platform'].details,
    /Perfil tecnológico:/
  );
  assert.match(
    PROJECT_TRANSLATIONS.es['lifecycle-messaging-platform'].details,
    /Backend\/runtime: JavaScript\/Node\.js/
  );
  assert.match(
    PROJECT_TRANSLATIONS.es['lifecycle-messaging-platform'].details,
    /pools de módems GSM/
  );
  assert.match(
    PROJECT_TRANSLATIONS.es['lifecycle-messaging-platform'].details,
    /comandos AT/
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
  assert.match(source, /function protectMarkdownLinkTargets\(markdown\)/);
  assert.match(source, /return protectMarkdownLinkTargets\(lines\.join\('\\n'\)\.trim\(\)\);/);
});

test('every project link summary has a runtime localization mapping', async () => {
  const source = await readFile(new URL('../../src/static-pages/js/index.js', import.meta.url), 'utf8');
  const summaries = new Set(loadProjectEntries().flatMap((project) => project.links.map((link) => link.summary)));

  for (const summary of summaries) {
    const escaped = summary.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    assert.match(
      source,
      new RegExp(`'${escaped}': \\(\\) => tPortfolio\\('project\\.linkSummary\\.`),
      `Missing runtime localization mapping for project link summary: ${summary}`
    );
  }
});
