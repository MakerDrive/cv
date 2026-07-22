const PULSE_KIND_MESSAGE_KEYS = Object.freeze({
  retrospective: 'pulse.type.retrospective',
  update: 'pulse.type.update',
  release: 'pulse.type.release',
  'research-note': 'pulse.type.research-note',
  'field-note': 'pulse.type.field-note',
});

/**
 * @param {string} href
 * @param {{ entries?: Set<string> | Map<string, any> | Array<string>, basePath?: string }} [options]
 * @returns {string | null}
 */
export function resolvePortfolioEntryIdFromHref(href, options = {}) {
  let { entries, basePath = '/' } = options || {};
  if (!href || typeof href !== 'string') return null;

  let raw = href.trim();
  if (/^(mailto:|tel:|javascript:|#)/i.test(raw)) return null;
  if (/\.(pdf|zip|png|jpg|jpeg|svg|webp|gif)$/i.test(raw)) return null;

  let entrySet = null;
  if (entries) {
    if (entries instanceof Set) {
      entrySet = entries;
    } else if (entries instanceof Map) {
      entrySet = new Set(entries.keys());
    } else if (Array.isArray(entries)) {
      entrySet = new Set(entries);
    }
  }

  let cleanRaw = raw.split('?')[0].split('#')[0].replace(/^\/+|\/+$/g, '').replace(/\/index$/, '');
  if (entrySet) {
    if (entrySet.has(cleanRaw)) return cleanRaw;

    let pulseProjectMatch = cleanRaw.match(/^projects\/[^/]+\/pulse\/([^/]+)$/);
    if (pulseProjectMatch) {
      let pubId = `pulse/${pulseProjectMatch[1]}`;
      if (entrySet.has(pubId)) return pubId;
    }

    let pulseMatch = cleanRaw.match(/^pulse\/([^/]+)$/);
    if (pulseMatch) {
      let pubId = `pulse/${pulseMatch[1]}`;
      if (entrySet.has(pubId)) return pubId;
    }
  }

  let currentOrigin = '';
  let currentHref = 'https://localhost/';
  if (typeof globalThis.location !== 'undefined' && globalThis.location.href) {
    currentHref = globalThis.location.href;
    currentOrigin = globalThis.location.origin;
  }

  let url;
  try {
    url = new URL(raw, currentHref);
  } catch {
    return null;
  }

  if (currentOrigin && url.origin !== currentOrigin) {
    return null;
  }

  let pathname = url.pathname;
  let normalizedBase = `/${String(basePath || '/').replace(/^\/+|\/+$/g, '')}/`.replace(/\/{2,}/g, '/');

  if (normalizedBase !== '/' && pathname.startsWith(normalizedBase.slice(0, -1))) {
    pathname = pathname.slice(normalizedBase.length - 1);
  }

  let cleanPath = pathname.replace(/^\/+|\/+$/g, '').replace(/\/index$/, '');

  if (entrySet) {
    if (entrySet.has(cleanPath)) return cleanPath;

    let pulseProjectMatch = cleanPath.match(/^projects\/[^/]+\/pulse\/([^/]+)$/);
    if (pulseProjectMatch) {
      let pubId = `pulse/${pulseProjectMatch[1]}`;
      if (entrySet.has(pubId)) return pubId;
    }

    let pulseMatch = cleanPath.match(/^pulse\/([^/]+)$/);
    if (pulseMatch) {
      let pubId = `pulse/${pulseMatch[1]}`;
      if (entrySet.has(pubId)) return pubId;
    }
  } else {
    if (/^(projects|pulse|skills|bio|profile)\//.test(cleanPath)) {
      return cleanPath;
    }
  }

  if (cleanPath === 'projects' || cleanPath === 'projects/index') return 'projects/index';
  if (cleanPath === 'skills' || cleanPath === 'skills/index') return 'skills/index';
  if (cleanPath === 'pulse' || cleanPath === 'pulse/index') return 'pulse/index';

  return null;
}

export function shouldHandleInAppActivation(event, anchor, options = {}) {
  if (!event || !anchor) return null;
  if (event.defaultPrevented) return null;

  let isPrimaryClick = event.button === 0;
  let isModified = event.metaKey || event.ctrlKey || event.shiftKey || event.altKey;
  if (!isPrimaryClick || isModified) return null;

  if (anchor.hasAttribute?.('download')) return null;

  let publicationId = anchor.getAttribute?.('data-publication-id');
  if (publicationId) {
    let cleanId = publicationId.trim();
    if (!options.entries || (options.entries instanceof Set ? options.entries.has(cleanId) : options.entries.has?.(cleanId))) {
      return cleanId;
    }
  }

  let href = anchor.getAttribute?.('href') || '';
  return resolvePortfolioEntryIdFromHref(href, options);
}

export function shouldHandlePulseInAppActivation(event, anchor) {
  if (!event || !anchor) return false;
  if (event.defaultPrevented) return false;
  let isPrimaryClick = event.button === 0;
  let isModified = event.metaKey || event.ctrlKey || event.shiftKey || event.altKey;
  if (!isPrimaryClick || isModified) return false;
  if (anchor.hasAttribute?.('download')) return false;
  let target = anchor.getAttribute?.('target');
  if (target && target !== '_self') return false;
  let publicationId = anchor.getAttribute?.('data-publication-id');
  return /^pulse\/[^/]+$/.test(publicationId || '');
}

/**
 * @param {string} selectedId
 * @param {Array<any>} publications
 * @param {Iterable<[string, string]>} [directorySelections]
 */
export function resolvePortfolioTreeHighlightId(selectedId, publications, directorySelections = []) {
  let id = String(selectedId || '').trim();
  if (id.startsWith('pulse/')) {
    if (id === 'pulse/index') {
      return 'pulse/index';
    }
    let pub = (publications || []).find((p) => p.id === id || p.slug === id.replace(/^pulse\//, ''));
    if (pub && pub.primaryProjectId) {
      let projectSlug = pub.primaryProjectId.replace(/^projects\//, '');
      let pubSlug = pub.slug || id.replace(/^pulse\//, '');
      return `occurrence/${projectSlug}/pulse/${pubSlug}`;
    }
    return 'pulse/index';
  }
  for (let [directoryId, targetId] of directorySelections) {
    if (targetId === id) return directoryId;
  }
  return id;
}

export function createPortfolioTreeStorageKey(locale) {
  return `cv-portfolio-materials-tree-v6:${String(locale || '').trim()}`;
}

function resourcePathSegment(value) {
  return String(value || 'Untitled')
    .replace(/[\\/]+/g, '-')
    .replace(/\s+/g, ' ')
    .trim();
}

export function createPortfolioTreeOccurrences(projectNavigationEntries, publications, locale) {
  let occurrences = [];
  let published = (publications || []).filter((pub) => (
    pub && pub.status === 'published' && typeof pub.slug === 'string'
  ));

  for (let projectEntry of (projectNavigationEntries || [])) {
    let projectId = projectEntry?.id;
    if (!projectId || !projectId.startsWith('projects/') || projectId === 'projects/index') {
      continue;
    }
    let projectSlug = projectId.replace(/^projects\//, '');

    for (let pub of published) {
      if (pub.relatedProjectIds && pub.relatedProjectIds.includes(projectId)) {
        let localeObj = pub.locales?.[locale] || pub.locales?.['en'] || {};
        let publicationTitle = localeObj.title || pub.slug || 'Untitled';
        let projectPath = projectEntry.path || '';
        let projectEntryPathNoExt = projectPath.endsWith('.md') ? projectPath.slice(0, -3) : projectPath;
        let occurrencePath = `${projectEntryPathNoExt}/${resourcePathSegment(publicationTitle)}.md`;

        occurrences.push({
          id: `occurrence/${projectSlug}/pulse/${pub.slug}`,
          path: occurrencePath,
          label: publicationTitle,
          icon: 'article',
          kind: 'occurrence',
          draggable: false,
          metadata: {
            targetId: pub.id || `pulse/${pub.slug}`,
          },
        });
      }
    }
  }

  return occurrences;
}


export function createPortfolioNavigationEntries(...entryGroups) {
  let hasPulseIndex = false;
  return entryGroups
    .flatMap((entries) => Array.isArray(entries) ? entries : [])
    .filter((entry) => {
      let id = String(entry?.id || '');
      if (!id.startsWith('pulse/')) return true;
      if (id !== 'pulse/index' || hasPulseIndex) return false;
      hasPulseIndex = true;
      return true;
    });
}

export function resolvePulseFocusIds(entryId, publications, { containerId = 'group/pulse' } = {}) {
  let id = String(entryId || '').trim();
  let published = (publications || []).filter((publication) => (
    publication?.status === 'published'
    && publication.id === `pulse/${publication.slug}`
  ));
  if (id === 'pulse/index') {
    return [
      containerId,
      ...published
        .filter((publication) => publication.relatedProjectIds?.length === 0)
        .map((publication) => publication.id),
    ].filter(Boolean);
  }

  let publication = published.find((item) => item.id === id);
  if (!publication) return [];
  let projectIds = [...new Set((publication.relatedProjectIds || []).filter((projectId) => (
    /^projects\/[^/]+$/.test(projectId) && projectId !== 'projects/index'
  )))];
  return projectIds.length > 0
    ? [...projectIds, publication.id]
    : [containerId, publication.id].filter(Boolean);
}

export function resolvePulseKindMessageKey(kind) {
  let key = PULSE_KIND_MESSAGE_KEYS[kind];
  if (!key) {
    throw new TypeError(`Unsupported publication kind: ${kind}`);
  }
  return key;
}

export function createPortfolioEntryHref(id, { basePath = '/', locale = 'en' } = {}) {
  let route = String(id || '').trim().replace(/^\/+|\/+$/g, '').replace(/\/index$/, '');
  let normalizedBase = `/${String(basePath || '/').replace(/^\/+|\/+$/g, '')}/`
    .replace(/\/{2,}/g, '/');
  let pathname = route ? `${normalizedBase}${route}/` : normalizedBase;
  return `${pathname}?lang=${encodeURIComponent(String(locale || 'en'))}`;
}

export function resolveProjectUpdatesSlotKey(publications, projectId) {
  let hasUpdates = publications.some((publication) => (
    publication.status === 'published'
    && publication.relatedProjectIds?.includes(projectId)
  ));
  return hasUpdates ? 'project-updates' : '';
}

export function buildPortfolioTreeProjection({
  projectItems = [],
  publications = [],
  locale = 'en',
  tPortfolio = (key) => key,
  getProjectTreeGroup = (p) => null,
  getProjectTreeGroupLabel = (g) => '',
  profileEntries = [],
  skillEntries = [],
}) {
  let resourceEntries = [];
  let projectDirectorySelections = [];

  resourceEntries.push(...profileEntries);

  const published = (publications || []).filter(
    (pub) => pub && pub.status === 'published' && typeof pub.slug === 'string'
  );

  let projectEntries = [];
  for (let project of projectItems) {
    const projectSlug = project.slug;
    const projectId = `projects/${projectSlug}`;
    const group = getProjectTreeGroup(project);
    const groupLabel = getProjectTreeGroupLabel(group);
    const baseDir = `${tPortfolio('projects.label')}/${resourcePathSegment(groupLabel)}`;
    const projectPathNoExt = `${baseDir}/${resourcePathSegment(project.title)}`;

    const hasPubs = published.some(
      (pub) => pub.relatedProjectIds && pub.relatedProjectIds.includes(projectId)
    );

    if (hasPubs) {
      projectDirectorySelections.push([projectPathNoExt, projectId]);
    } else {
      resourceEntries.push({
        id: projectId,
        path: `${projectPathNoExt}.md`,
        label: project.title,
        icon: 'work',
        kind: 'project',
        draggable: false,
      });
    }

    projectEntries.push({
      id: projectId,
      path: `${projectPathNoExt}.md`,
      label: project.title,
    });
  }

  let occurrences = createPortfolioTreeOccurrences(projectEntries, publications, locale);
  resourceEntries.push(...occurrences);

  resourceEntries.push({
    id: 'pulse/index',
    path: `${tPortfolio('pulse.label')}.md`,
    label: tPortfolio('pulse.label'),
    icon: 'article',
    kind: 'note',
    draggable: false,
  });

  resourceEntries.push(...skillEntries);

  return {
    resourceEntries,
    projectDirectorySelections,
  };
}
