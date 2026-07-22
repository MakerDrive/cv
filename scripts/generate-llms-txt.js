import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import { loadProjectEntries } from '../src/static-pages/data/projects.js';
import { stripPortfolioArticleBlockMarkers } from '../src/static-pages/data/portfolioArticleMedia.js';
import { PROJECT_TRANSLATIONS } from '../src/static-pages/data/projectTranslations.js';
import { getPublicPublications, PUBLICATIONS } from '../src/static-pages/data/publications.js';
import { PORTFOLIO_LOCALE_MESSAGES } from '../src/static-pages/data/portfolioTranslations.js';
import { socialLinks } from '../src/static-pages/data/socialLinks.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const distDir = path.join(rootDir, 'dist');
const packageJson = JSON.parse(fs.readFileSync(path.join(rootDir, 'package.json'), 'utf8'));
const siteUrl = new URL(packageJson.homepage || 'https://MakerDrive.github.io/cv/');
if (!siteUrl.pathname.endsWith('/')) siteUrl.pathname = `${siteUrl.pathname}/`;

const locales = Object.freeze(['en', 'ru', 'es']);
const localeNames = Object.freeze({
  en: 'English',
  ru: 'Russian',
  es: 'Spanish',
});

const projectGroups = Object.freeze([
  {
    title: 'AI tooling and agent systems',
    slugs: [
      'agent-portal',
      'symbiote-workspace',
      'symbiote-engine',
      'project-graph-mcp',
      'agent-pool-mcp',
      'mcp-agent-portal',
      'browser-x-mcp',
      'context-x-mcp',
      'terminal-x-mcp',
    ],
  },
  {
    title: 'Product platforms and interfaces',
    slugs: [
      'symbiote-video-studio',
      'megavisor',
      'lifecycle-messaging-platform',
      'symbiote-ui',
      'photopizza-remote',
      'photosnail-public',
    ],
  },
  {
    title: 'Archived projects',
    slugs: [
      'symbiote-node',
    ],
  },
  {
    title: 'Hardware and process automation',
    slugs: [
      'autobox-v1',
      'f360-studio',
      'complexscan',
      'boothbot',
      'photopizza',
    ],
  },
]);

const profileExpertiseKeys = Object.freeze([
  'ai',
  'fullStack',
  'rnd',
  'hardware',
]);

const profileImpactKeys = Object.freeze([
  'aiTooling',
  'museumScanning',
  'hardware',
  'mediaProduction',
]);

const profileProductKeys = Object.freeze([
  'agentToolchain',
  'symbiote',
  'videoStudio',
  'messaging',
  'hardware',
  'photopizza',
  'objetArt',
  'boothbot',
]);

const profileRoleKeys = Object.freeze([
  'rndPro',
  'f360',
  'megavisor',
  'ziq',
]);

const pdfDownloads = Object.freeze({
  en: 'downloads/vladimir-matiasevich-cv-en.pdf',
  ru: 'downloads/vladimir-matiasevich-cv-ru.pdf',
  es: 'downloads/vladimir-matiasevich-cv-es.pdf',
});

const publicationTypeLabels = Object.freeze({
  retrospective: 'R&D note',
  update: 'update',
  release: 'release',
  'research-note': 'research note',
  'field-note': 'field note',
});

function formatMessage(value, params = {}) {
  return String(value || '').replace(/\{([a-zA-Z][a-zA-Z0-9_]*)\}/g, (match, key) => {
    return Object.hasOwn(params, key) ? String(params[key]) : match;
  });
}

function t(locale, key, params = {}) {
  return formatMessage(PORTFOLIO_LOCALE_MESSAGES[locale]?.[`portfolio.${key}`]
    || PORTFOLIO_LOCALE_MESSAGES.en[`portfolio.${key}`]
    || key, params);
}

function oneLine(value) {
  return String(value || '')
    .replace(/\s+/g, ' ')
    .trim();
}

function urlFor(route = '', locale = '') {
  const cleanRoute = String(route || '').replace(/^\/+/, '');
  const isFile = /\.[a-z0-9]+$/i.test(cleanRoute);
  const withSlash = cleanRoute && !isFile && !cleanRoute.endsWith('/') ? `${cleanRoute}/` : cleanRoute;
  const url = new URL(withSlash, siteUrl);
  if (locale) url.searchParams.set('lang', locale);
  return url.href;
}

function repositoryUrl() {
  const raw = String(packageJson.repository?.url || '');
  const sshMatch = raw.match(/^git\+ssh:\/\/git@github\.com[:/](.+?)(?:\.git)?$/);
  if (sshMatch) return `https://github.com/${sshMatch[1]}`;
  const httpsMatch = raw.match(/^git\+(https:\/\/.+?)(?:\.git)?$/);
  if (httpsMatch) return httpsMatch[1];
  return 'https://github.com/MakerDrive/cv';
}

function projectTranslation(project, locale) {
  return PROJECT_TRANSLATIONS[locale]?.[project.slug] || {};
}

function projectSummary(project, locale) {
  return projectTranslation(project, locale).summary || project.summary || '';
}

function projectDetails(project, locale) {
  return stripPortfolioArticleBlockMarkers(
    projectTranslation(project, locale).details || project.details || ''
  );
}

function shiftHeadings(markdown, depth = 2) {
  return String(markdown || '').replace(/^(#{1,6})\s+/gm, (match, hashes) => {
    return `${'#'.repeat(Math.min(6, hashes.length + depth))} `;
  });
}

function appendListItem(lines, label, href, description = '') {
  const suffix = description ? `: ${oneLine(description)}` : '';
  lines.push(`- [${label}](${href})${suffix}`);
}

function appendCompactProfileItems(lines, locale, namespace, keys) {
  for (const key of keys) {
    lines.push(`- **${t(locale, `profile.${namespace}.${key}.label`)}**: ${oneLine(t(locale, `profile.${namespace}.${key}.details`))}`);
  }
}

function appendFullProfileItems(lines, locale, namespace, keys) {
  for (const key of keys) {
    lines.push(`#### ${t(locale, `profile.${namespace}.${key}.label`)}`, '');
    lines.push(t(locale, `profile.${namespace}.${key}.details`), '');
  }
}

export function writeLlmsTxt(projects, publications = PUBLICATIONS) {
  const projectBySlug = new Map(projects.map((project) => [project.slug, project]));
  const lines = [
    '# Vladimir Matiasevich Portfolio',
    '',
    `> ${oneLine(t('en', 'profile.summary'))}`,
    '',
    'Curated R&D portfolio covering AI tooling, agent systems, product platforms, media systems, process automation, and selected hardware-backed/open-source case studies. The site supports English, Russian, and Spanish through the `lang` query parameter.',
    '',
    'Use `llms-full.txt` for a fuller markdown export of profile text, project case studies, and Pulse publications across all supported locales.',
    '',
    `## ${t('en', 'profile.professionalTitle')}`,
    '',
    oneLine(t('en', 'profile.details')),
    '',
    oneLine(t('en', 'profile.workFormatDetails')),
    '',
    `## ${t('en', 'profile.expertiseTitle')}`,
  ];

  appendCompactProfileItems(lines, 'en', 'expertise', profileExpertiseKeys);

  lines.push('', `## ${t('en', 'profile.impactTitle')}`);
  appendCompactProfileItems(lines, 'en', 'impact', profileImpactKeys);

  lines.push('', `## ${t('en', 'profile.productsTitle')}`, '', oneLine(t('en', 'profile.productsIntro')), '');
  appendCompactProfileItems(lines, 'en', 'product', profileProductKeys);

  lines.push('', `## ${t('en', 'profile.experienceTitle')}`);
  appendCompactProfileItems(lines, 'en', 'role', profileRoleKeys);

  lines.push('', '## Portfolio resources');

  appendListItem(
    lines,
    'Portfolio home',
    urlFor('', 'en'),
    `${t('en', 'profile.statusDetails')} ${t('en', 'profile.locationLabel')}: ${t('en', 'profile.locationValue')}. ${t('en', 'profile.availability')} ${t('en', 'profile.languagesLabel')}: ${t('en', 'profile.languagesValue')}. ${t('en', 'profile.experienceSummary')}.`
  );
  appendListItem(lines, 'Full LLM context', urlFor('llms-full.txt'), 'Complete generated markdown export for the portfolio.');
  appendListItem(lines, 'Sitemap', urlFor('sitemap.xml'), 'Machine-readable list of generated site routes.');
  appendListItem(lines, 'English CV PDF', urlFor(pdfDownloads.en), 'Downloadable PDF CV in English.');
  appendListItem(lines, 'Russian CV PDF', urlFor(pdfDownloads.ru), 'Downloadable PDF CV in Russian.');
  appendListItem(lines, 'Spanish CV PDF', urlFor(pdfDownloads.es), 'Downloadable PDF CV in Spanish.');

  lines.push('', '## Project case studies');
  for (const group of projectGroups) {
    lines.push('', `### ${group.title}`);
    for (const slug of group.slugs) {
      const project = projectBySlug.get(slug);
      if (!project) continue;
      const periodPrefix = project.period ? `${project.period}. ` : '';
      appendListItem(lines, project.title, urlFor(`projects/${project.slug}`, 'en'), `${periodPrefix}${projectSummary(project, 'en')}`);
    }
  }

  lines.push('', '## Pulse publications');
  const publicPublications = getPublicPublications(publications);
  for (const pub of publicPublications) {
    const labelSuffix = publicationTypeLabels[pub.kind];
    appendListItem(lines, `${pub.locales.en.title} ${labelSuffix}`, urlFor(`pulse/${pub.slug}`, 'en'), pub.locales.en.summary);
  }

  lines.push('', '## Skill pages');
  appendListItem(lines, t('en', 'skill.rnd.label'), urlFor('skills/rnd-engineering', 'en'), t('en', 'skill.rnd.summary'));
  appendListItem(lines, t('en', 'skill.agenticAi.label'), urlFor('skills/agentic-ai', 'en'), t('en', 'skill.agenticAi.summary'));
  appendListItem(lines, t('en', 'skill.productUi.label'), urlFor('skills/product-ui', 'en'), t('en', 'skill.productUi.summary'));
  appendListItem(lines, t('en', 'skill.hardwareCapture.label'), urlFor('skills/hardware-capture', 'en'), t('en', 'skill.hardwareCapture.summary'));

  lines.push('', '## Public profiles');
  for (const item of socialLinks) {
    appendListItem(lines, item.label, item.href, t('en', item.summaryKey));
  }

  lines.push('', '## Optional');
  appendListItem(lines, 'Russian portfolio home', urlFor('', 'ru'), 'Localized Russian portfolio view.');
  appendListItem(lines, 'Spanish portfolio home', urlFor('', 'es'), 'Localized Spanish portfolio view.');

  return `${lines.join('\n')}\n`;
}

function writeFullLocale(lines, projects, publications, locale) {
  lines.push(`## Locale: ${localeNames[locale]}`, '');
  lines.push(`### ${t(locale, 'profile.professionalTitle')}`, '');
  lines.push(oneLine(t(locale, 'profile.summary')), '');
  lines.push(`${t(locale, 'profile.statusTitle')}: ${t(locale, 'profile.statusDetails')}`, '');
  lines.push(`${t(locale, 'profile.locationLabel')}: ${t(locale, 'profile.locationValue')}`, '');
  lines.push(t(locale, 'profile.availability'), '');
  lines.push(`${t(locale, 'profile.languagesLabel')}: ${t(locale, 'profile.languagesValue')}`, '');
  lines.push(t(locale, 'profile.experienceSummary'), '');
  lines.push(`${t(locale, 'profile.onlineCv')}: ${urlFor('', locale)}`, '');
  lines.push(t(locale, 'profile.details'), '');
  lines.push(t(locale, 'profile.workFormatDetails'), '');

  lines.push(`### ${t(locale, 'profile.expertiseTitle')}`, '');
  appendFullProfileItems(lines, locale, 'expertise', profileExpertiseKeys);

  lines.push(`### ${t(locale, 'profile.impactTitle')}`, '');
  appendFullProfileItems(lines, locale, 'impact', profileImpactKeys);

  lines.push(`### ${t(locale, 'profile.productsTitle')}`, '');
  lines.push(t(locale, 'profile.productsIntro'), '');
  appendFullProfileItems(lines, locale, 'product', profileProductKeys);

  lines.push(`### ${t(locale, 'profile.experienceTitle')}`, '');
  appendFullProfileItems(lines, locale, 'role', profileRoleKeys);

  lines.push('### Project case studies', '');
  for (const project of projects) {
    lines.push(`#### ${project.title}`, '');
    lines.push(`URL: ${urlFor(`projects/${project.slug}`, locale)}`, '');
    if (project.period) lines.push(`Period: ${project.period}`, '');
    lines.push(projectSummary(project, locale), '');
    lines.push(shiftHeadings(projectDetails(project, locale)), '');
    if (project.links?.length) {
      lines.push('##### External links', '');
      for (const item of project.links) {
        appendListItem(lines, item.label, item.href, item.summary);
      }
      lines.push('');
    }
    if (project.href) {
      appendListItem(lines, 'Project source', project.href, project.linkLabel || 'Project URL');
      lines.push('');
    }
  }

  lines.push('### Pulse publications', '');
  const publicPublications = getPublicPublications(publications);
  for (const pub of publicPublications) {
    const note = pub.locales[locale] || pub.locales.en;
    lines.push(`#### ${note.title}`, '');
    lines.push(`URL: ${urlFor(`pulse/${pub.slug}`, locale)}`, '');
    if (pub.publishedAt) {
      lines.push(`Date: ${pub.publishedAt}`, '');
    }
    if (pub.subjectPeriod) {
      lines.push(`Period: ${pub.subjectPeriod}`, '');
    }
    lines.push(note.summary || '', '');
    lines.push(shiftHeadings(note.body || ''), '');
    if (pub.sourceLinks?.length) {
      lines.push(`##### ${t(locale, 'pulse.sources')}`, '');
      for (const item of pub.sourceLinks) {
        appendListItem(lines, item.label, item.href, item.summary);
      }
      lines.push('');
    }
  }
}

export function writeLlmsFullTxt(projects, publications = PUBLICATIONS) {
  const lines = [
    '# Vladimir Matiasevich Portfolio - Full LLM Context',
    '',
    `> ${oneLine(t('en', 'profile.summary'))}`,
    '',
    `Generated from structured portfolio data in the \`${packageJson.name}\` site build. This file expands profile copy, project case studies, and Pulse publications for English, Russian, and Spanish.`,
    '',
    '## Site metadata',
    '',
  ];

  appendListItem(lines, 'Portfolio home', urlFor('', 'en'), 'Primary interactive portfolio.');
  appendListItem(lines, 'llms.txt', urlFor('llms.txt'), 'Compact LLM index.');
  appendListItem(lines, 'GitHub source', repositoryUrl(), 'Source repository.');
  lines.push('');

  for (const locale of locales) {
    writeFullLocale(lines, projects, publications, locale);
  }

  return `${lines.join('\n')}\n`;
}

export function generateLlmsFiles({
  projects = loadProjectEntries(),
  publications = PUBLICATIONS,
  outputDir = distDir,
} = {}) {
  fs.mkdirSync(outputDir, { recursive: true });
  const outputs = [
    ['llms.txt', writeLlmsTxt(projects, publications)],
    ['llms-full.txt', writeLlmsFullTxt(projects, publications)],
  ];

  for (const [fileName, content] of outputs) {
    const outputPath = path.join(outputDir, fileName);
    fs.writeFileSync(outputPath, content);
    process.stdout.write(`LLM context generated: ${path.relative(rootDir, outputPath)}\n`);
  }
}

const entryUrl = process.argv[1] ? pathToFileURL(path.resolve(process.argv[1])).href : '';
if (import.meta.url === entryUrl) {
  generateLlmsFiles();
}
