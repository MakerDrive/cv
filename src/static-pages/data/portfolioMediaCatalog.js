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
    alt: label,
    fit: 'contain',
    href: projectPage,
    targetIds: createTargetIds(slug, targetIds),
    activation: Object.freeze({ provider: 'image', src }),
  });
}

export const PORTFOLIO_MEDIA_CATALOG = Object.freeze([
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

  ims('autobox-v1', 'spinner', {
    srcData: 'https://rnd-pro.com/ims-data/1e165749fc5c2292b850c0ee384427f551fd610a.json',
    poster: 'https://rnd-pro.com/idn/37acbe5d-ceb8-486e-98fb-4ef5e09a8800/640',
    label: 'AUTOBOX 360 scan result',
    projectPage: 'https://rnd-pro.com/pulse/autobox-v1/',
    autoplay: true,
    targetIds: ['pulse/autobox-v1', 'projects/autobox-v1'],
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
