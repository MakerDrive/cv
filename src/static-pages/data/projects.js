import fs from 'node:fs';
import path from 'node:path';

const projectsDir = path.resolve('src/static-pages/posts');

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

  const order = Number.parseInt(meta.order, 10);
  const slug = path.basename(filePath, '.md');
  return {
    slug,
    order: Number.isFinite(order) ? order : null,
    title: meta.title || slug,
    date: meta.date || '',
    kicker: meta.kicker || '',
    summary: meta.summary || '',
    image: meta.image || '',
    alt: meta.alt || meta.title || slug,
    href: meta.href || '',
    linkLabel: meta.linkLabel || 'View project',
  };
}

export function loadProjectEntries() {
  return fs.readdirSync(projectsDir)
    .filter((file) => file.endsWith('.md'))
    .map((file) => parseFrontmatter(path.join(projectsDir, file)))
    .sort((a, b) => {
      if (a.order !== null || b.order !== null) {
        return (a.order ?? Number.MAX_SAFE_INTEGER) - (b.order ?? Number.MAX_SAFE_INTEGER);
      }
      return b.date.localeCompare(a.date);
    });
}
