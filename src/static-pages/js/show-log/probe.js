import { getShowLog } from './index.js';

const SAMPLE_MS = 100;

/**
 * DOM probe for the presenter robot: every SAMPLE_MS it writes the selection
 * frame rectangle and the longest hose reach into the show log (`probe.dom`),
 * next to the rig's own records. Used by the trace test and for debugging.
 *
 * @returns {() => void} stop function
 */
export function startShowProbe(doc = document) {
  const log = getShowLog();
  const hoseReach = () => {
    let longest = 0;
    const overlay = doc.querySelector('.symbiote-presenter-cursor');
    for (const svg of [...(overlay?.children || [])].filter((node) => node.tagName.toLowerCase() === 'svg').slice(0, 2)) {
      for (const path of svg.querySelectorAll('path')) {
        const box = path.getBoundingClientRect();
        if (box.width || box.height) longest = Math.max(longest, Math.hypot(box.width, box.height));
      }
    }
    return Math.round(longest);
  };
  const inkBox = () => {
    let left = Infinity;
    let top = Infinity;
    let right = -Infinity;
    let bottom = -Infinity;
    for (const path of doc.querySelectorAll('.pc-ink path')) {
      if (!path.getAttribute('d')) continue;
      const box = path.getBoundingClientRect();
      if (!(box.width > 4 || box.height > 4)) continue;
      left = Math.min(left, box.left); top = Math.min(top, box.top);
      right = Math.max(right, box.right); bottom = Math.max(bottom, box.bottom);
    }
    return right > left ? { left: Math.round(left), top: Math.round(top), width: Math.round(right - left), height: Math.round(bottom - top) } : null;
  };
  const timer = setInterval(() => {
    const marquee = doc.querySelector('.pc-marquee');
    const box = marquee?.getBoundingClientRect();
    log.debug('probe', 'dom', {
      marquee: box
        ? {
            shown: !marquee.classList.contains('pc-marquee-faded') && box.width > 4,
            left: Math.round(box.left), top: Math.round(box.top),
            width: Math.round(box.width), height: Math.round(box.height),
          }
        : null,
      ink: inkBox(),
      hoseReach: hoseReach(),
    });
  }, SAMPLE_MS);
  return () => clearInterval(timer);
}
