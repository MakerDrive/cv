/**
 * @param {string} slug
 * @param {readonly string[]} [targetIds]
 * @returns {readonly string[]}
 */
function createTargetIds(slug, targetIds) {
  return Object.freeze([...(targetIds || [`projects/${slug}`])]);
}

/**
 * @param {string} videoId
 * @param {string} slug
 * @param {string} label
 * @param {{ targetIds?: readonly string[] }} [options]
 */
function youtube(videoId, slug, label, { targetIds } = {}) {
  return Object.freeze({
    id: `media/${slug}/youtube/${videoId}`,
    kind: 'youtube',
    label,
    poster: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
    alt: label,
    fit: 'cover',
    href: `https://www.youtube.com/watch?v=${videoId}`,
    targetIds: createTargetIds(slug, targetIds),
    activation: Object.freeze({ provider: 'youtube', videoId }),
  });
}

/**
 * @param {string} slug
 * @param {string} kind
 * @param {{
 *   srcData: string,
 *   poster: string,
 *   label: string,
 *   projectPage: string,
 *   autoplay?: boolean,
 *   targetIds?: readonly string[],
 * }} options
 */
function ims(slug, kind, {
  srcData,
  poster,
  label,
  projectPage,
  autoplay = false,
  targetIds,
}) {
  return Object.freeze({
    id: `media/${slug}/ims/${kind}`,
    kind,
    label,
    poster,
    alt: label,
    fit: 'cover',
    href: projectPage,
    targetIds: createTargetIds(slug, targetIds),
    activation: Object.freeze({
      provider: 'ims',
      srcData,
      fallbackUrl: projectPage,
      ...(autoplay === true ? { autoplay: true } : {}),
    }),
  });
}

/**
 * @param {string} slug
 * @param {string} name
 * @param {{
 *   src: string,
 *   label: string,
 *   projectPage: string,
 *   targetIds?: readonly string[],
 * }} options
 */
function image(slug, name, { src, label, projectPage, targetIds }) {
  return Object.freeze({
    id: `media/${slug}/image/${name}`,
    kind: 'image',
    label,
    poster: src,
    ...(src.startsWith('illustrations/')
      ? { localSource: `src/static-pages/copy-illustrations/${src.slice('illustrations/'.length)}` }
      : {}),
    alt: label,
    fit: 'contain',
    href: projectPage,
    targetIds: createTargetIds(slug, targetIds),
    activation: Object.freeze({ provider: 'image', src }),
  });
}

export const PORTFOLIO_MEDIA_CATALOG = Object.freeze([
  image('symbiote-workspace', 'configuration-illustration', {
    src: 'illustrations/workspace-configuration.webp',
    label: 'Conceptual illustration: composing and reopening a portable workspace',
    projectPage: 'https://makerdrive.github.io/cv/projects/symbiote-workspace/',
  }),
  image('symbiote-ui', 'process-illustration', {
    src: 'illustrations/symbiote-ui.webp',
    label: 'Conceptual illustration: reusable UI components and discoverable action metadata',
    projectPage: 'https://makerdrive.github.io/cv/projects/symbiote-ui/',
  }),
  image('symbiote-engine', 'process-illustration', {
    src: 'illustrations/symbiote-engine.webp',
    label: 'Conceptual illustration: composable backend execution with parallel paths and a validation gate',
    projectPage: 'https://makerdrive.github.io/cv/projects/symbiote-engine/',
  }),
  image('agent-portal', 'process-illustration', {
    src: 'illustrations/agent-portal.webp',
    label: 'Conceptual illustration: executable kanban stages with review and a human decision route',
    projectPage: 'https://makerdrive.github.io/cv/projects/agent-portal/',
  }),
  image('symbiote-video-studio', 'process-illustration', {
    src: 'illustrations/symbiote-video-studio.webp',
    label: 'Conceptual illustration: one video description expressed as graph, timeline, preview and export',
    projectPage: 'https://makerdrive.github.io/cv/projects/symbiote-video-studio/',
  }),
  image('adaptive-maximo-workbench', 'process-illustration', {
    src: 'illustrations/adaptive-maximo-workbench.webp',
    label: 'Conceptual illustration: read-only work-order inspection linked to asset and location context',
    projectPage: 'https://makerdrive.github.io/cv/projects/adaptive-maximo-workbench/',
  }),
  image('agent-pool-mcp', 'process-illustration', {
    src: 'illustrations/agent-pool-mcp.webp',
    label: 'Conceptual illustration: task dispatch, ownership, session handoff and independent review',
    projectPage: 'https://makerdrive.github.io/cv/projects/agent-pool-mcp/',
  }),
  image('project-graph-mcp', 'process-illustration', {
    src: 'illustrations/project-graph-mcp.webp',
    label: 'Conceptual illustration: source files distilled into a relevant dependency map and context',
    projectPage: 'https://makerdrive.github.io/cv/projects/project-graph-mcp/',
  }),
  image('lifecycle-messaging-platform', 'process-illustration', {
    src: 'illustrations/lifecycle-messaging-platform.webp',
    label: 'Conceptual illustration: consent, queues, modem delivery and a repeatable virtual test bench',
    projectPage: 'https://makerdrive.github.io/cv/projects/lifecycle-messaging-platform/',
  }),
  image('mobile-smm-platform', 'process-illustration', {
    src: 'illustrations/mobile-smm-platform.webp',
    label: 'Conceptual illustration: media drafts, scheduling, Android test execution and reviewed recovery',
    projectPage: 'https://makerdrive.github.io/cv/projects/mobile-smm-platform/',
  }),
  image('f360-studio', 'process-illustration', {
    src: 'illustrations/f360-studio.webp',
    label: 'Conceptual illustration: photographic capture, geometry and texture processing, and model presentation',
    projectPage: 'https://makerdrive.github.io/cv/projects/f360-studio/',
  }),
  image('autobox-v1', 'process-illustration', {
    src: 'illustrations/autobox-v1.webp',
    label: 'Conceptual illustration: controlled museum-object photography, source selection and photogrammetry',
    projectPage: 'https://makerdrive.github.io/cv/projects/autobox-v1/',
    targetIds: ['projects/autobox-v1', 'pulse/autobox-v1-retrospective'],
  }),
  image('complexscan', 'process-illustration', {
    src: 'illustrations/complexscan.webp',
    label: 'Conceptual illustration: transparent-disc capture and controlled light for clean source images',
    projectPage: 'https://makerdrive.github.io/cv/projects/complexscan/',
  }),
  image('boothbot', 'process-illustration', {
    src: 'illustrations/boothbot.webp',
    label: 'Conceptual illustration: repeatable warehouse bottle photography and consistent catalog images',
    projectPage: 'https://makerdrive.github.io/cv/projects/boothbot/',
  }),
  image('megavisor', 'process-illustration', {
    src: 'illustrations/megavisor.webp',
    label: 'Conceptual illustration: capture, a panorama hotspot, object photo rotation and related media',
    projectPage: 'https://makerdrive.github.io/cv/projects/megavisor/',
  }),
  image('photopizza', 'process-illustration', {
    src: 'illustrations/photopizza.webp',
    label: 'Conceptual illustration: one controller for a turntable, camera slider and panoramic head',
    projectPage: 'https://makerdrive.github.io/cv/projects/photopizza/',
  }),
  youtube('qsXmS4mFvYc', 'adaptive-maximo-workbench', 'Agentic EAM Demo 1'),
  youtube('qsXmS4mFvYc', 'symbiote-workspace', 'Agentic EAM Demo 1'),
  youtube('DUzUnbO2VVs', 'adaptive-maximo-workbench', 'XR EAM Example'),

  youtube('c3cCmDqO04c', 'megavisor', 'MEGAVISOR overview'),
  youtube('f1cB4X1wI50', 'megavisor', 'PhotoPizza turntable origin'),
  youtube('cFPJqtcWNSU', 'megavisor', 'DIY capture system origin'),
  youtube('6CpdVcjtZoU', 'megavisor', 'Hypermedia virtual-player concept'),

  youtube('2lO2VsZFAz0', 'photopizza', 'PhotoPizza overview'),
  youtube('6CpdVcjtZoU', 'photopizza', 'PhotoPizza turntable origin'),
  youtube('f1cB4X1wI50', 'photopizza', 'PhotoPizza assembly origin'),
  youtube('cFPJqtcWNSU', 'photopizza', 'PhotoPizza DIY capture origin'),
  youtube('HeLMIjuMZac', 'photopizza', 'PhotoPizza web control software'),
  ims('photopizza', 'spinner', {
    srcData: 'https://rnd-pro.com/ims-data/09b6979c4d8d3d52ba83b3082e25ec8b9597b41e.json',
    poster: 'https://rnd-pro.com/idn/7b6810b2-8f53-45ff-a721-95238b116b00/640',
    label: 'PhotoPizza 360 result',
    projectPage: 'https://rnd-pro.com/projects/photopizza/',
  }),

  youtube('MHfWHxVSgn4', 'complexscan', 'ComplexScan transparent system'),
  youtube('PFPoitVEWcE', 'complexscan', 'ComplexScan integrated capture'),

  youtube('G32wNSEzl8s', 'f360-studio', 'F360 Studio 3D-model visualization'),

  ims('autobox-v1', 'spinner', {
    srcData: 'https://rnd-pro.com/ims-data/1e165749fc5c2292b850c0ee384427f551fd610a.json',
    poster: 'https://rnd-pro.com/idn/37acbe5d-ceb8-486e-98fb-4ef5e09a8800/640',
    label: 'AUTOBOX 360 scan result',
    projectPage: 'https://rnd-pro.com/pulse/autobox-v1/',
    autoplay: true,
    targetIds: ['projects/autobox-v1', 'pulse/autobox-v1-retrospective'],
  }),
  youtube('IPEY0yiVb-I', 'autobox-v1', 'AUTOBOX capture equipment'),
  youtube('NWpMtNZjrzI', 'autobox-v1', 'AUTOBOX capture technology'),
  youtube('8XsSHyQFtV8', 'autobox-v1', 'AUTOBOX capture rig'),
  youtube('zb47xAYQBcE', 'autobox-v1', 'AUTOBOX fabrication'),
  youtube('us3vQHuTYPw', 'autobox-v1', 'Museum capture fieldwork'),
  youtube('FugBzpZqXZ0', 'autobox-v1', 'Netsuke collaboration'),
  youtube('iNqxRJgrqM8', 'autobox-v1', '3D visualization result'),
  youtube('M0cHqy3cScc', 'autobox-v1', '3D visualization result'),
  youtube('o4XzMKW8a2E', 'autobox-v1', 'Cultural heritage 3D result'),

  ims('agent-portal', 'gallery', {
    srcData: 'https://rnd-pro.com/ims-data/cd2d7662dd2308562fa1a0839aaf62255d5a4946.json',
    poster: 'https://rnd-pro.com/idn/d9d068ed-7ba3-4dd7-8876-b0988e462800/640',
    label: 'Agent Portal workspace gallery',
    projectPage: 'https://rnd-pro.com/projects/agent-portal/',
  }),

  ims('boothbot', 'gallery', {
    srcData: 'https://rnd-pro.com/ims-data/53b2cca73eb115e91a5febb15522780d3a3bef6a.json',
    poster: 'https://rnd-pro.com/idn/2d682170-6bb0-4d0c-5706-87a247e9db00/640',
    label: 'BoothBot solution gallery',
    projectPage: 'https://rnd-pro.com/projects/boothbot/',
  }),

  image('symbiote-video-studio', 'interface', {
    src: 'https://rnd-pro.com/idn/4a0a8d7f-09b6-44c0-1cf4-71ab1bab0b00/public',
    label: 'Symbiote Video Studio interface',
    projectPage: 'https://rnd-pro.com/projects/svs/',
  }),
]);

/**
 * Media kinds the CV Show presentation can operate: an ordered frame sequence
 * (a gallery) or a rotating 360 spinner. A new gallery in the catalog is
 * operable the moment it is added here and mounted in an article — the tour
 * never names a media id, so a content addition cannot silently stay inert.
 * Everything else (YouTube, still images) stays a passive article block that
 * attention cues can frame but that the Show can never drive.
 */
export const PORTFOLIO_SHOW_SEQUENCE_MEDIA_KINDS = Object.freeze(['gallery', 'spinner']);

/** @type {readonly string[]} */
export const PORTFOLIO_SHOW_SEQUENCE_MEDIA_IDS = Object.freeze(
  PORTFOLIO_MEDIA_CATALOG
    .filter(({ activation, kind }) => (
      activation?.provider === 'ims'
      && PORTFOLIO_SHOW_SEQUENCE_MEDIA_KINDS.includes(String(kind))
    ))
    .map(({ id }) => id),
);
