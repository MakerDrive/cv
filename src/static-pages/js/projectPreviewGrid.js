function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>'"]/g, (tag) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;',
  }[tag] || tag));
}

function requireBuilder(options, name) {
  if (typeof options?.[name] !== 'function') {
    throw new TypeError(`A ${name} function is required`);
  }
  return options[name];
}

/**
 * Orders projects for the preview grid: the slugs listed in `order` come
 * first, in that order (the CV Show story order), followed by every other
 * project in its catalog order. A slug in `order` that has no project is
 * ignored rather than rendered as a broken card.
 * @param {Array<{ slug: string }>} projects
 * @param {string[]} order
 * @returns {Array<{ slug: string }>}
 */
export function orderProjectsForPreview(projects, order = []) {
  const bySlug = new Map(projects.map((project) => [project.slug, project]));
  const first = order.filter((slug) => bySlug.has(slug)).map((slug) => bySlug.get(slug));
  const listed = new Set(first.map((project) => project.slug));
  return [...first, ...projects.filter((project) => !listed.has(project.slug))];
}

/**
 * Renders the project preview grid shown on the Projects overview. Each card
 * is one link: the generated social card image (it already carries the
 * project title) opening the project. Cards expose a stable
 * `project-preview.<slug>` tour target so the CV Show can point at them.
 *
 * Temporary host-side implementation: the overview is a graph node whose
 * content the portfolio library does not let a page extend, so the grid is
 * composed here as a content slot until the library supports it.
 * @param {Array<{ slug: string, title: string }>} projects
 * @param {{
 *   hrefBuilder: (slug: string) => string,
 *   imageUrlBuilder: (slug: string) => string,
 *   order?: string[],
 * }} options
 * @returns {string}
 */
export function renderProjectPreviewGrid(projects, options) {
  const hrefBuilder = requireBuilder(options, 'hrefBuilder');
  const imageUrlBuilder = requireBuilder(options, 'imageUrlBuilder');
  const cards = orderProjectsForPreview(projects, options.order)
    .map((project) => `
    <a class="project-preview-card" href="${escapeHtml(hrefBuilder(project.slug))}" data-tour-target="project-preview.${escapeHtml(project.slug)}">
      <img src="${escapeHtml(imageUrlBuilder(project.slug))}" alt="${escapeHtml(project.title)}" loading="lazy" width="1200" height="630">
    </a>`.trim());
  return `<div class="project-preview-grid">\n${cards.join('\n')}\n</div>`;
}
