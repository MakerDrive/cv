import { createImsShowMediaTarget } from './imsShowMediaAdapter.js';
import { PORTFOLIO_SHOW_SEQUENCE_MEDIA_IDS } from '../../data/portfolioMediaCatalog.js';

const SHOW_SEQUENCE_MEDIA_IDS = new Set(PORTFOLIO_SHOW_SEQUENCE_MEDIA_IDS);

function escapeAttributeSelectorValue(value) {
  if (globalThis.CSS?.escape) return globalThis.CSS.escape(String(value));
  return String(value).replaceAll('\\', '\\\\').replaceAll('"', '\\"');
}

function mediaSlot(document, targetId) {
  return document?.querySelector?.(
    `[data-media-id="${escapeAttributeSelectorValue(targetId)}"]`,
  ) || null;
}

function imsMountRoot(target) {
  const host = target.matches?.('sn-media-host')
    ? target
    : target.querySelector?.('sn-media-host');
  if (host?.descriptor?.activation?.provider === 'ims') return host;
  return target.matches?.('ims-viewer')
    ? target
    : target.querySelector?.('ims-viewer') || null;
}

/**
 * Resolves the media targets the current Show is allowed to operate: every
 * catalogued IMS frame sequence (gallery montage, 360 spinner rotation). The
 * set comes from the media catalog, not from a list of project names, so a
 * gallery added to the site is operable without touching the show mechanism.
 * YouTube, still images and native HTML media remain ordinary passive article
 * blocks: attention cues can frame them, but the Show can never drive them.
 */
export function createCvShowMediaTargetResolver({
  document = globalThis.document,
  resolveTarget = (_targetId) => null,
  createImsTarget = createImsShowMediaTarget,
} = {}) {
  const imsTargets = new WeakMap();

  return function resolveCvShowMediaTarget(targetId) {
    if (!SHOW_SEQUENCE_MEDIA_IDS.has(targetId)) return null;
    const target = mediaSlot(document, targetId) || resolveTarget(targetId);
    if (!target) return null;

    const imsRoot = imsMountRoot(target);
    if (imsRoot) {
      let adapted = imsTargets.get(imsRoot);
      if (!adapted) {
        adapted = createImsTarget(imsRoot);
        imsTargets.set(imsRoot, adapted);
      }
      return adapted;
    }

    return null;
  };
}

export default createCvShowMediaTargetResolver;
