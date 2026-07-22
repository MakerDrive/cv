import { PUBLICATIONS } from './publications.js';

const MEDIA_RELATION_TYPES = new Set([
  'gallery',
  'image',
  'media',
  'pdf',
  'spinner',
  'video',
  'vimeo',
  'youtube',
]);

const SAFE_FALLBACK_KINDS = new Set([
  'bio',
  'containment',
  'has-media',
  'has-publication',
  'link',
  'skill',
  'uses',
]);

const relation = (kind, direction = 'none', markerRole = 'none') => ({
  kind,
  direction,
  markerRole,
});

export function classifyPortfolioRelation(from, to, legacyType = '') {
  let source = String(from || '');
  let target = String(to || '');
  let type = String(legacyType || '');

  if (
    source.startsWith('projects/')
    && target.startsWith('projects/')
    && source !== 'projects/index'
    && target !== 'projects/index'
    && type === 'has-publication'
  ) {
    return relation('link');
  }

  if ((
    source.startsWith('projects/')
    || (source.startsWith('pulse/') && source !== 'pulse/index')
  ) && (
    target.startsWith('asset/')
    || target.startsWith('media/')
    || MEDIA_RELATION_TYPES.has(type)
  )) {
    return relation('has-media', 'forward', 'flow');
  }
  if (source.startsWith('projects/') && target.startsWith('pulse/')) {
    return relation('has-publication', 'forward', 'flow');
  }
  if (
    source.startsWith('group/')
    || source.endsWith('/index')
    || (source === 'profile/photo' && (type === 'branch' || target.endsWith('/index')))
  ) {
    return relation('containment');
  }
  if (source === 'profile/photo' && target === 'bio/about') {
    return relation('bio');
  }
  if (source === 'profile/photo' && target.startsWith('skills/')) {
    return relation('skill');
  }
  if (source.startsWith('skills/') && target.startsWith('projects/')) {
    return relation('uses');
  }

  return relation(SAFE_FALLBACK_KINDS.has(type) ? type : 'link');
}

export function createPortfolioRelationEdge(from, to, legacyType = '') {
  const semantic = classifyPortfolioRelation(from, to, legacyType);
  return {
    from,
    to,
    type: semantic.kind,
    kind: semantic.kind,
    direction: semantic.direction,
    design: {
      marker: {
        role: semantic.markerRole,
      },
    },
  };
}

export function createPortfolioRelationPlan({ mode, skillIds = [], projects = [], publications = PUBLICATIONS }) {
  const edges = [];
  const keys = new Set();
  const add = (from, to, type) => {
    const key = `${from}\u001f${to}`;
    if (keys.has(key)) return;
    keys.add(key);
    edges.push(createPortfolioRelationEdge(from, to, type));
  };

  const projectIds = new Set(projects.map((p) => p.projectId));
  const publicPubs = (publications || [])
    .filter((pub) => pub && typeof pub === 'object' && pub.status === 'published' && typeof pub.id === 'string' && pub.id.startsWith('pulse/'));

  if (mode === 'flat') {
    add('group/biography', 'profile/photo', 'branch');
    add('group/biography', 'bio/about', 'branch');
    add('profile/photo', 'bio/about', 'bio');
    add('profile/photo', 'group/projects', 'branch');
    add('profile/photo', 'group/pulse', 'branch');
    add('profile/photo', 'group/skills', 'branch');
    for (const skillId of skillIds) {
      add('group/skills', skillId, 'skill');
      add('profile/photo', skillId, 'skill');
    }
    for (const project of projects) {
      add('group/projects', project.projectId, 'project');
      for (const skillId of project.skillIds || []) add(skillId, project.projectId, 'uses');
    }
    const relevantPubs = publicPubs.filter((pub) => {
      const projIds = pub.relatedProjectIds || [];
      return projIds.length === 0 || projIds.some((projId) => projectIds.has(projId));
    });
    for (const pub of relevantPubs) {
      const pubId = pub.id;
      const relatedProjectIds = pub.relatedProjectIds || [];
      if (relatedProjectIds.length === 0) {
        add('group/pulse', pubId, 'containment');
      } else {
        for (const relatedProjId of relatedProjectIds) {
          if (typeof relatedProjId === 'string' && relatedProjId.startsWith('projects/') && projectIds.has(relatedProjId)) {
            add(relatedProjId, pubId, 'has-publication');
          }
        }
      }
    }
    return edges;
  }

  add('profile/photo', 'bio/about', 'bio');
  add('profile/photo', 'projects/index', 'containment');
  add('profile/photo', 'pulse/index', 'containment');
  add('profile/photo', 'skills/index', 'containment');
  for (const skillId of skillIds) add('skills/index', skillId, 'containment');
  for (const project of projects) {
    add('projects/index', project.projectId, 'containment');
    for (const skillId of project.skillIds || []) add(skillId, project.projectId, 'uses');
    for (const mediaId of project.mediaIds || []) add(project.projectId, mediaId, 'media');
  }
  const relevantPubs = publicPubs.filter((pub) => {
    const projIds = pub.relatedProjectIds || [];
    return projIds.length === 0 || projIds.some((projId) => projectIds.has(projId));
  });
  for (const pub of relevantPubs) {
    const pubId = pub.id;
    if (pub.relatedProjectIds.length === 0) {
      add('pulse/index', pubId, 'containment');
    } else {
      for (const relatedProjId of pub.relatedProjectIds || []) {
        if (typeof relatedProjId === 'string' && relatedProjId.startsWith('projects/') && projectIds.has(relatedProjId)) {
          add(relatedProjId, pubId, 'has-publication');
        }
      }
    }
  }
  return edges;
}
