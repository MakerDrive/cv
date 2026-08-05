const MEDIA_FRAGMENT_PREFIX = 'media-';
const ARTICLE_BLOCK_MARKER = /^:::article-block ([a-z0-9][a-z0-9-]*)$/;

export const PORTFOLIO_ARTICLE_MEDIA_PLACEMENTS = Object.freeze({
  megavisor: Object.freeze({
    'media/megavisor/youtube/c3cCmDqO04c': 'lead',
    'media/megavisor/youtube/f1cB4X1wI50': 'photopizza-origin',
    'media/megavisor/youtube/cFPJqtcWNSU': 'photopizza-origin',
    'media/megavisor/youtube/6CpdVcjtZoU': 'media-production',
  }),
  photopizza: Object.freeze({
    'media/photopizza/youtube/2lO2VsZFAz0': 'lead',
    'media/photopizza/youtube/6CpdVcjtZoU': 'origin',
    'media/photopizza/youtube/f1cB4X1wI50': 'origin',
    'media/photopizza/youtube/cFPJqtcWNSU': 'origin',
    'media/photopizza/youtube/HeLMIjuMZac': 'control-software',
    'media/photopizza/ims/spinner': 'scope',
  }),
  complexscan: Object.freeze({
    'media/complexscan/youtube/MHfWHxVSgn4': 'transparent-system',
    'media/complexscan/youtube/PFPoitVEWcE': 'integrated-method',
  }),
  'autobox-v1': Object.freeze({
    'media/autobox-v1/ims/spinner': 'project-scope',
    'media/autobox-v1/youtube/IPEY0yiVb-I': 'capture-technology',
    'media/autobox-v1/youtube/NWpMtNZjrzI': 'capture-technology',
    'media/autobox-v1/youtube/8XsSHyQFtV8': 'capture-technology',
    'media/autobox-v1/youtube/zb47xAYQBcE': 'fabrication',
    'media/autobox-v1/youtube/us3vQHuTYPw': 'museum-fieldwork',
    'media/autobox-v1/youtube/FugBzpZqXZ0': 'netsuke-collaboration',
    'media/autobox-v1/youtube/iNqxRJgrqM8': 'visualization',
    'media/autobox-v1/youtube/M0cHqy3cScc': 'visualization',
    'media/autobox-v1/youtube/o4XzMKW8a2E': 'visualization',
  }),
  'agent-portal': Object.freeze({
    'media/agent-portal/ims/gallery': 'workspace',
  }),
  boothbot: Object.freeze({
    'media/boothbot/ims/gallery': 'solution',
  }),
  'symbiote-video-studio': Object.freeze({
    'media/symbiote-video-studio/image/interface': 'overview',
  }),
});

export function createPortfolioMediaFragmentId(mediaId) {
  let id = String(mediaId || '').trim();
  return id ? `${MEDIA_FRAGMENT_PREFIX}${encodeURIComponent(id)}` : '';
}

export function createPortfolioMediaSlotKey(mediaId) {
  let id = String(mediaId || '').trim();
  if (!id) return '';
  return `media-${[...id].map((character) => (
    /[A-Za-z0-9-]/.test(character)
      ? character
      : `_${character.codePointAt(0).toString(16)}`
  )).join('')}`;
}

export function parsePortfolioArticleBlocks(markdown) {
  let blocks = [];
  let current = null;
  let preamble = [];
  for (let line of String(markdown || '').split('\n')) {
    let marker = line.match(ARTICLE_BLOCK_MARKER);
    if (marker) {
      if (current) blocks.push({ ...current, markdown: current.lines.join('\n').trim() });
      current = { id: marker[1], lines: [] };
      continue;
    }
    (current?.lines || preamble).push(line);
  }
  if (current) blocks.push({ ...current, markdown: current.lines.join('\n').trim() });
  if (!blocks.length) return [];
  let prefix = preamble.join('\n').trim();
  if (prefix) blocks.unshift({ id: '', markdown: prefix });
  let ids = blocks.filter((block) => block.id).map((block) => block.id);
  if (new Set(ids).size !== ids.length) throw new Error('Article block ids must be unique');
  return blocks.map(({ id, markdown }) => ({ id, markdown }));
}

export function stripPortfolioArticleBlockMarkers(markdown) {
  let blocks = parsePortfolioArticleBlocks(markdown);
  return blocks.length
    ? blocks.map((block) => block.markdown).filter(Boolean).join('\n\n')
    : String(markdown || '');
}

export function normalizePortfolioMediaLinkIdentity(value) {
  try {
    let url = new URL(String(value || '').replaceAll('%5F', '_'));
    let hostname = url.hostname.toLowerCase().replace(/^www\./, '');
    let videoId = '';
    if (hostname === 'youtu.be') videoId = url.pathname.split('/').filter(Boolean)[0] || '';
    if (hostname === 'youtube.com' || hostname.endsWith('.youtube.com')) {
      videoId = url.pathname === '/watch'
        ? url.searchParams.get('v') || ''
        : url.pathname.match(/^\/(?:embed|shorts)\/([^/?#]+)/)?.[1] || '';
    }
    if (videoId) return `youtube:${videoId}`;
    url.hash = '';
    url.hostname = hostname;
    return url.href.replace(/\/$/, '');
  } catch {
    return '';
  }
}

export function stripPortfolioMediaLink(markdown, descriptor) {
  let identities = new Set([
    descriptor?.href,
    descriptor?.activation?.videoId
      ? `https://www.youtube.com/watch?v=${descriptor.activation.videoId}`
      : '',
  ].map(normalizePortfolioMediaLinkIdentity).filter(Boolean));
  if (!identities.size) return String(markdown || '');
  return String(markdown || '').replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g, (match, label, href) => (
    identities.has(normalizePortfolioMediaLinkIdentity(href)) ? label : match
  ));
}

function createContentSlot(mediaId) {
  return `:::content-slot ${createPortfolioMediaSlotKey(mediaId)}`;
}

function normalizePortfolioArticleMediaDescriptor(descriptor) {
  return {
    ...descriptor,
    source: descriptor.source || descriptor.activation?.provider || descriptor.kind,
    rank: Number(descriptor.rank) || 84,
    targetIds: [...new Set((descriptor.targetIds || []).filter(Boolean).map(String))],
  };
}

function resolvePortfolioArticleTargetId(targetIds, entryIds) {
  let hasEntry = (id) => entryIds?.has?.(id) === true;
  return targetIds.find((id) => isPortfolioArticleTargetId(id) && hasEntry(id)) || '';
}

/**
 * @param {readonly object[]} [catalog]
 * @param {ReadonlySet<string>} [entryIds]
 */
export function createPortfolioArticleMediaAssignments(catalog = [], entryIds) {
  let assignments = [];
  let mediaIds = new Set();
  for (let rawDescriptor of catalog) {
    let descriptor = normalizePortfolioArticleMediaDescriptor(rawDescriptor || {});
    let mediaId = String(descriptor.id || '').trim();
    if (!mediaId || mediaIds.has(mediaId)) continue;
    let targetId = resolvePortfolioArticleTargetId(descriptor.targetIds, entryIds);
    if (!targetId) continue;
    mediaIds.add(mediaId);
    assignments.push({ targetId, descriptor });
  }
  return assignments;
}

export function getPortfolioAssignedMediaDescriptors(assignments, targetId) {
  let id = String(targetId || '').trim();
  return (assignments || [])
    .filter((assignment) => assignment.targetId === id)
    .map((assignment) => assignment.descriptor);
}

export function composePortfolioArticleMedia({ slug, summary, details, descriptors = [] }) {
  let placements = PORTFOLIO_ARTICLE_MEDIA_PLACEMENTS[slug];
  let blocks = parsePortfolioArticleBlocks(details);
  if (!placements || !blocks.length || !descriptors.length) {
    return { summary: String(summary || ''), details: String(details || ''), placedMediaIds: [] };
  }

  let descriptorById = new Map(descriptors.map((descriptor) => [descriptor.id, descriptor]));
  let idsByBlock = new Map();
  for (let [mediaId, blockId] of Object.entries(placements)) {
    if (!descriptorById.has(mediaId)) continue;
    let ids = idsByBlock.get(blockId) || [];
    ids.push(mediaId);
    idsByBlock.set(blockId, ids);
  }

  let appendSlots = (markdown, blockId) => {
    let mediaIds = idsByBlock.get(blockId) || [];
    let body = String(markdown || '');
    for (let mediaId of mediaIds) body = stripPortfolioMediaLink(body, descriptorById.get(mediaId));
    return [body, ...mediaIds.map(createContentSlot)].filter(Boolean).join('\n\n');
  };
  return {
    summary: appendSlots(summary, 'lead'),
    details: blocks.map((block) => appendSlots(block.markdown, block.id)).join('\n\n'),
    placedMediaIds: [...idsByBlock.values()].flat(),
  };
}

export function composePortfolioPublicationMedia({
  summary,
  details,
  descriptors = [],
  interactive = true,
}) {
  let mediaIds = [...new Set(descriptors.map((descriptor) => (
    String(descriptor?.id || '').trim()
  )).filter(Boolean))];
  if (!interactive || mediaIds.length === 0) {
    return {
      summary: String(summary || ''),
      details: String(details || ''),
      placedMediaIds: [],
    };
  }
  return {
    summary: [summary, ...mediaIds.map(createContentSlot)].filter(Boolean).join('\n\n'),
    details: String(details || ''),
    placedMediaIds: mediaIds,
  };
}

export function getPortfolioMediaIdFromFragment(fragment) {
  let value = String(fragment || '').replace(/^#/, '');
  if (!value.startsWith(MEDIA_FRAGMENT_PREFIX)) return '';
  try {
    return decodeURIComponent(value.slice(MEDIA_FRAGMENT_PREFIX.length));
  } catch {
    return '';
  }
}

function collectMediaTargetIds(node) {
  return [...new Set([
    ...(Array.isArray(node?.params?.targetIds) ? node.params.targetIds : []),
    ...(Array.isArray(node?.params?.media?.targetIds) ? node.params.media.targetIds : []),
    node?.params?.targetId,
    node?.targetId,
  ].filter(Boolean).map(String))];
}

function isPortfolioArticleTargetId(id) {
  return /^(?:projects|pulse)\/[^/]+$/.test(id)
    && id !== 'projects/index'
    && id !== 'pulse/index';
}

export function resolvePortfolioMediaArticleTarget(node, entryIds) {
  let targets = collectMediaTargetIds(node);
  return resolvePortfolioArticleTargetId(targets, entryIds);
}

export function createPortfolioMediaNavigationUrl({ currentUrl, pathname, fragmentId }) {
  let url = new URL(String(currentUrl));
  url.pathname = String(pathname || url.pathname);
  url.hash = fragmentId ? `#${fragmentId}` : '';
  return url;
}

export function getPortfolioArticleProjectSlug(articleId) {
  let match = String(articleId || '').match(/^projects\/([^/]+)$/);
  return match?.[1] || '';
}
