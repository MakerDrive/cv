import fs from 'node:fs';
import path from 'node:path';
import { loadPortfolioMarkdownContent } from './markdownContent.js';

const projectsDir = path.resolve('src/static-pages/copy-content/projects');
const projectLocales = Object.freeze(['en', 'ru', 'es']);

function parseProjectLinks(value = '') {
  return value
    .split(';')
    .map((item) => item.trim())
    .filter(Boolean)
    .map((item) => {
      const [label = '', href = '', summary = ''] = item.split('|').map((part) => part.trim());
      return { label, href, summary };
    })
    .filter((item) => item.label && item.href);
}

function parseFrontmatter(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8');
  const match = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!match) {
    throw new Error(`Missing frontmatter: ${filePath}`);
  }

  const meta = {};
  for (const line of match[1].split('\n')) {
    const index = line.indexOf(':');
    if (index === -1) continue;
    const key = line.slice(0, index).trim();
    const value = line.slice(index + 1).trim().replace(/^['"]|['"]$/g, '');
    meta[key] = value;
  }

  const order = Number.parseFloat(meta.order);
  const slug = path.basename(path.dirname(filePath));
  const project = /** @type {any} */ ({
    slug,
    order: Number.isFinite(order) ? order : null,
    title: meta.title || slug,
    date: meta.date || '',
    period: meta.period || '',
    kicker: meta.kicker || '',
    summary: meta.summary || '',
    image: meta.image || '',
    imageFit: meta.imageFit || meta.mediaFit || '',
    alt: meta.alt || meta.title || slug,
    href: meta.href || '',
    linkLabel: meta.linkLabel || 'View project',
    links: parseProjectLinks(meta.links),
    contentPaths: Object.fromEntries(
      projectLocales.map((locale) => [
        locale,
        `content/projects/${slug}/${locale}.md`,
      ]),
    ),
  });
  Object.defineProperty(project, 'details', {
    enumerable: false,
    get() {
      return loadProjectContent(slug, 'en');
    },
  });
  return project;
}

export function loadProjectEntries() {
  return fs.readdirSync(projectsDir)
    .filter((entry) => fs.statSync(path.join(projectsDir, entry)).isDirectory())
    .map((slug) => parseFrontmatter(path.join(projectsDir, slug, 'en.md')))
    .sort((a, b) => {
      if (a.order !== null || b.order !== null) {
        return (a.order ?? Number.MAX_SAFE_INTEGER) - (b.order ?? Number.MAX_SAFE_INTEGER);
      }
      return b.date.localeCompare(a.date);
    });
}

export function loadProjectContent(project, locale = 'en') {
  const slug = typeof project === 'string' ? project : project?.slug;
  const normalizedLocale = projectLocales.includes(locale) ? locale : 'en';
  if (!slug) throw new TypeError('Project slug is required');
  return loadPortfolioMarkdownContent(`content/projects/${slug}/${normalizedLocale}.md`);
}
