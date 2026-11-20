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
 * project title) opening the project. The grid is the
 * `project-preview.grid` tour target and each card is `project-preview.<slug>`,
 * so the CV Show can frame the whole set or point at one project.
 *
 * Temporary host-side implementation: the overview is a graph node whose
 * content the portfolio library does not let a page extend, so the grid is
 * composed here as a content slot until the library supports it.
 * @param {Array<{ slug: string, title: string }>} projects
 * @param {{
 *   hrefBuilder: (slug: string) => string,
 *   imageUrlBuilder: (slug: string) => string,
 *   order?: string[],
 *   filters?: Array<{ id: string, label: string, slugs: string[] }>,
 *   allLabel?: string,
 * }} options
 * @returns {string}
 */
export function renderProjectPreviewGrid(projects, options) {
  const hrefBuilder = requireBuilder(options, 'hrefBuilder');
  const imageUrlBuilder = requireBuilder(options, 'imageUrlBuilder');
  const filters = (options.filters || []).filter((filter) => filter.slugs.some((slug) => projects.some((project) => project.slug === slug)));
  const groupsOf = (slug) => filters.filter((filter) => filter.slugs.includes(slug)).map((filter) => filter.id).join(' ');
  const cards = orderProjectsForPreview(projects, options.order)
    .map((project) => `
    <a class="project-preview-card" href="${escapeHtml(hrefBuilder(project.slug))}" data-tour-target="project-preview.${escapeHtml(project.slug)}"${filters.length ? ` data-groups="${escapeHtml(groupsOf(project.slug))}"` : ''}>
      <img src="${escapeHtml(imageUrlBuilder(project.slug))}" alt="${escapeHtml(project.title)}" loading="lazy" width="1200" height="630">
    </a>`.trim());
  const grid = `<div class="project-preview-grid" data-tour-target="project-preview.grid">\n${cards.join('\n')}\n</div>`;
  if (!filters.length) return grid;
  const count = (filter) => projects.filter((project) => filter.slugs.includes(project.slug)).length;
  const cell = (id, label, total, pressed) => `<button type="button" class="project-preview-filter" data-preview-filter="${escapeHtml(id)}" aria-pressed="${pressed}">${escapeHtml(label)}<span class="project-preview-filter-count">${total}</span></button>`;
  const strip = `<div class="project-preview-filters" role="group" aria-label="${escapeHtml(options.allLabel || '')}">${[
    cell('', options.allLabel || 'All', projects.length, true),
    ...filters.map((filter) => cell(filter.id, filter.label, count(filter), false)),
  ].join('')}</div>`;
  return `${strip}\n${grid}`;
}

/**
 * Shows the cards of one group (an empty id shows all) and marks the pressed filter.
 * @param {Element} host the element holding the rendered strip and grid
 * @param {string} id group id, or '' for every project
 */
export function applyProjectPreviewFilter(host, id) {
  for (const button of host.querySelectorAll('[data-preview-filter]')) {
    button.setAttribute('aria-pressed', String(button.dataset.previewFilter === id));
  }
  for (const card of host.querySelectorAll('.project-preview-card')) {
    const groups = (card.dataset.groups || '').split(' ');
    card.hidden = Boolean(id) && !groups.includes(id);
  }
}
