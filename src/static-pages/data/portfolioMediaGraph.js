import { createPortfolioRelationEdge } from './portfolioRelationClassifier.js';
import { getPublicPublications, PUBLICATIONS } from './publications.js';

export function normalizeMediaPreviewSrc(src) {
  let value = String(src || '').trim();
  if (!value) return '';
  if (value.startsWith('data:')) return value;
  try {
    let parsed = new URL(value);
    parsed.hash = '';
    parsed.search = '';
    parsed.hostname = parsed.hostname.toLowerCase();
    return parsed.href;
  } catch {
    return value;
  }
}

function normalizePortfolioMediaFit(value) {
  let fit = String(value || '').trim().toLowerCase();
  if (fit === 'fit') return 'contain';
  if (fit === 'crop') return 'cover';
  if (fit === 'contain' || fit === 'cover') return fit;
  return '';
}

function isTransparentPortfolioMediaSrc(src) {
  let normalized = normalizeMediaPreviewSrc(src);
  if (!normalized) return false;
  if (/^data:image\/svg\+xml/i.test(normalized)) return true;
  try {
    return new URL(normalized).pathname.toLowerCase().endsWith('.svg');
  } catch {
    return /\.svg(?:$|[?#])/i.test(normalized);
  }
}

export function getPortfolioMediaFit(src, explicitFit = '') {
  return normalizePortfolioMediaFit(explicitFit)
    || (isTransparentPortfolioMediaSrc(src) ? 'contain' : 'cover');
}

function normalizeCatalogDescriptor(item) {
  let targetIds = [...new Set((item.targetIds || []).filter(Boolean))];
  return {
    ...item,
    source: item.source || item.activation?.provider || item.kind,
    rank: Number(item.rank) || 84,
    targetIds,
  };
}

function getCanonicalPublishedPublications(publications) {
  let byId = new Map();
  for (let publication of getPublicPublications(Array.isArray(publications) ? publications : [])) {
    let id = String(publication?.id || '').trim();
    let slug = String(publication?.slug || '').trim();
    if (!slug || id !== `pulse/${slug}` || byId.has(id)) continue;
    byId.set(id, publication);
  }
  return [...byId.values()];
}

function normalizeMediaGraphTargets(descriptor, publishedPublicationIds) {
  let targetIds = [...new Set((descriptor.targetIds || []).filter((targetId) => (
    typeof targetId === 'string'
    && (!targetId.startsWith('pulse/') || publishedPublicationIds.has(targetId))
  )))];
  return {
    ...descriptor,
    targetIds,
  };
}

function getPublicationMediaDescriptors(catalog, publishedPublicationIds) {
  let byId = new Map();
  for (let rawItem of catalog) {
    let item = normalizeMediaGraphTargets(
      normalizeCatalogDescriptor(rawItem),
      publishedPublicationIds
    );
    if (!item.targetIds.some((targetId) => targetId.startsWith('pulse/'))) continue;
    if (!item.id || !item.poster || !item.activation?.provider) continue;
    let current = byId.get(item.id);
    if (!current || item.rank > current.rank) byId.set(item.id, item);
  }
  return [...byId.values()].sort((a, b) => b.rank - a.rank || a.id.localeCompare(b.id));
}

/**
 * @param {object} project
 * @param {readonly object[]} [catalog]
 * @returns {object[]}
 */
export function getProjectMediaDescriptors(project, catalog = []) {
  let projectId = `projects/${project.slug}`;
  let items = [];
  for (let item of catalog) {
    if (item?.targetIds?.includes(projectId)) items.push(normalizeCatalogDescriptor(item));
  }

  let byId = new Map();
  for (let item of items) {
    if (!item?.id || !item.poster || !item.activation?.provider) continue;
    let current = byId.get(item.id);
    if (!current || item.rank > current.rank) byId.set(item.id, item);
  }
  return [...byId.values()].sort((a, b) => b.rank - a.rank || a.id.localeCompare(b.id));
}

function uniqueDescriptorsByPoster(items, seenPosters) {
  let result = [];
  for (let item of items) {
    let poster = normalizeMediaPreviewSrc(item.poster);
    if (!poster || seenPosters.has(poster)) continue;
    seenPosters.add(poster);
    result.push(item);
  }
  return result;
}

function addMediaEdges(edges, nodeIds, item) {
  for (let targetId of item.targetIds || []) {
    if (!nodeIds.has(targetId)) continue;
    edges.push(createPortfolioRelationEdge(
      targetId,
      item.id,
      targetId.startsWith('pulse/') ? 'has-media' : item.kind || 'media'
    ));
  }
}

function toMediaDescriptor(item) {
  return {
    kind: item.kind,
    poster: item.poster,
    alt: item.alt || item.label || '',
    fit: item.fit,
    activation: item.activation,
    targetIds: item.targetIds,
  };
}

/**
 * @param {object} descriptor
 * @param {{ parentId?: string }} [options]
 * @returns {object}
 */
export function createPortfolioMediaLeafNode(descriptor, { parentId } = {}) {
  return {
    id: descriptor.id,
    label: descriptor.label,
    type: 'asset',
    summary: descriptor.alt || descriptor.label,
    targetId: descriptor.targetIds[0] || '',
    params: {
      href: descriptor.href || '',
      targetId: descriptor.targetIds[0] || '',
      targetIds: descriptor.targetIds,
      mediaParentId: parentId || '',
      mediaKind: descriptor.kind,
      mediaSource: descriptor.source,
      media: toMediaDescriptor(descriptor),
      mediaFit: descriptor.fit,
    },
  };
}

/**
 * @param {Object} options
 * @returns {Object}
 */
export function createPortfolioMediaGraphModel({
  baseModel,
  projects,
  catalog = [],
  profileMedia = null,
  weights,
  getHubWeight = () => 1,
  publications = PUBLICATIONS,
}) {
  let notes = getCanonicalPublishedPublications(publications);
  let publishedPublicationIds = new Set(notes.map((note) => note.id));
  let publicationItems = getPublicationMediaDescriptors(catalog, publishedPublicationIds);
  let projectItems = new Map();
  for (let project of projects) {
    projectItems.set(
      `projects/${project.slug}`,
      uniqueDescriptorsByPoster(
        getProjectMediaDescriptors(project, catalog)
          .map((descriptor) => normalizeMediaGraphTargets(descriptor, publishedPublicationIds)),
        new Set()
      )
    );
  }

  let nodesById = new Map();
  for (let node of baseModel.nodes || []) {
    if (!node?.id || nodesById.has(node.id)) continue;
    nodesById.set(node.id, { ...node, params: { ...(node.params || {}) } });
  }
  let nodeIds = new Set(nodesById.keys());
  let includedNodeIds = new Set();
  let edges = [];
  let groups = [];

  if (profileMedia && nodeIds.has('profile/photo')) {
    let profileNode = nodesById.get('profile/photo');
    profileNode.weight = weights.profile;
    profileNode.params.media = profileMedia;
    profileNode.params.mediaFit = profileMedia.fit;
    includedNodeIds.add(profileNode.id);
  }

  for (let note of notes) {
    let noteNode = nodesById.get(note.id);
    if (!noteNode) {
      noteNode = {
        id: note.id,
        label: note.locales?.en?.title || note.slug,
        type: 'pulse',
        summary: note.locales?.en?.summary || '',
        params: {},
      };
      nodesById.set(note.id, noteNode);
      nodeIds.add(note.id);
    }
    noteNode.weight = weights.pulse;
    includedNodeIds.add(note.id);
  }

  for (let note of notes) {
    for (let projectId of note.relatedProjectIds || []) {
      if (
        typeof projectId === 'string'
        && projectId.startsWith('projects/')
        && nodesById.has(projectId)
      ) {
        includedNodeIds.add(projectId);
      }
    }
  }

  for (let project of projects) {
    let projectId = `projects/${project.slug}`;
    let mediaItems = projectItems.get(projectId) || [];
    if (!mediaItems.length) continue;
    let projectNode = nodesById.get(projectId);
    if (projectNode) {
      projectNode.children = mediaItems.map((item) => item.id);
      projectNode.isGroup = true;
      projectNode.weight = getHubWeight(mediaItems.length);
      projectNode.params.mediaGroupHub = true;
      includedNodeIds.add(projectId);
    }
    for (let item of mediaItems) {
      if (nodeIds.has(item.id)) continue;
      nodeIds.add(item.id);
      includedNodeIds.add(item.id);
      nodesById.set(item.id, {
        ...createPortfolioMediaLeafNode(item, { parentId: projectId }),
        weight: weights.image,
      });
      addMediaEdges(edges, nodeIds, item);
    }
  }

  for (let item of publicationItems) {
    if (nodeIds.has(item.id)) continue;
    nodeIds.add(item.id);
    includedNodeIds.add(item.id);
    nodesById.set(item.id, {
      ...createPortfolioMediaLeafNode(item),
      weight: weights.image,
    });
    addMediaEdges(edges, nodeIds, item);
  }

  for (let note of notes) {
    if ((note.relatedProjectIds || []).length === 0) {
      if (!nodeIds.has('pulse/index')) {
        nodesById.set('pulse/index', {
          id: 'pulse/index',
          label: 'Pulse',
          type: 'index',
          summary: '',
          params: {},
        });
        nodeIds.add('pulse/index');
      }
      includedNodeIds.add('pulse/index');
      edges.push(createPortfolioRelationEdge('pulse/index', note.id, 'containment'));
      continue;
    }
    for (let projectId of note.relatedProjectIds || []) {
      if (
        typeof projectId === 'string'
        && projectId.startsWith('projects/')
        && includedNodeIds.has(projectId)
      ) {
        edges.push(createPortfolioRelationEdge(projectId, note.id, 'has-publication'));
      }
    }
  }

  for (let project of projects) {
    let projectId = `projects/${project.slug}`;
    if (!includedNodeIds.has(projectId)) continue;
    let mediaItems = projectItems.get(projectId) || [];
    let projectNoteIds = notes
      .filter((note) => (note.relatedProjectIds || []).includes(projectId))
      .map((note) => note.id)
      .filter((noteId) => includedNodeIds.has(noteId));

    groups.push({
      id: `media-group/${project.slug}`,
      label: project.title,
      nodeIds: [projectId, ...projectNoteIds, ...mediaItems.map((rawItem) => rawItem.id)]
        .filter((id) => includedNodeIds.has(id)),
    });
  }

  for (let edge of baseModel.edges || []) {
    if (includedNodeIds.has(edge.from) && includedNodeIds.has(edge.to)) {
      edges.push({ ...edge });
    }
  }

  let finalEdges = [];
  let seenEdges = new Set();
  for (let edge of edges) {
    let key = `${edge.from}\u001f${edge.to}`;
    if (!seenEdges.has(key)) {
      seenEdges.add(key);
      finalEdges.push(edge);
    }
  }

  let mediaNodes = [...nodesById.values()].filter((node) => includedNodeIds.has(node.id));
  return {
    ...baseModel,
    nodes: mediaNodes,
    edges: finalEdges,
    groups: groups.filter((group) => group.nodeIds.length > 1),
    rootNodes: mediaNodes.map((node) => node.id),
  };
}
