import { createImsShowMediaTarget } from './imsShowMediaAdapter.js';

const BOOTHBOT_GALLERY_MEDIA_ID = 'media/boothbot/ims/gallery';

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
 * Resolves the sole media target that the current Show is allowed to operate.
 * YouTube, 360/spinner, and native media remain ordinary passive article blocks;
 * framing them is handled by attention cues and can never reach media.play().
 */
export function createCvShowMediaTargetResolver({
  document = globalThis.document,
  resolveTarget = (_targetId) => null,
  createImsTarget = createImsShowMediaTarget,
} = {}) {
  const imsTargets = new WeakMap();

  return function resolveCvShowMediaTarget(targetId) {
    if (targetId !== BOOTHBOT_GALLERY_MEDIA_ID) return null;
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
