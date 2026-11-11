const GLYPHS = 'ABCDEFGHJKLMNPRSTUVWXYZ0123456789#/+=';
const STILL = new Set([' ', '·', '/', '.', ':']);

/**
 * @param {string} text
 * @param {number} elapsed
 * @returns {string}
 */
export function scrambleHeading(text, elapsed) {
  return Array.from(text, (character, index) => STILL.has(character)
    || elapsed >= 110 + Math.min(index, 24) * 14
    ? character
    : GLYPHS[(Math.floor(elapsed / 36) * 5 + index * 11) % GLYPHS.length]).join('');
}

/**
 * @param {Document} doc
 * @returns {() => void}
 */
export default function installHeadingMotion(doc) {
  let view = doc.defaultView;
  if (!view?.MutationObserver || !view.requestAnimationFrame) return () => {};
  let query = view.matchMedia('(prefers-reduced-motion: reduce)');
  let handled = new WeakSet();
  let active = new Map();
  let motionOff = () => query.matches || doc.hidden
    || doc.documentElement.dataset.portfolioMotion === 'off';
  let finish = (heading) => {
    let record = active.get(heading);
    if (!record) return;
    view.cancelAnimationFrame(record.frame);
    record.label.replaceWith(...record.label.childNodes);
    record.overlay.remove();
    heading.removeAttribute('data-notchset-decoding');
    active.delete(heading);
  };
  let finishAll = () => {
    for (let heading of active.keys()) finish(heading);
  };
  let reveal = (heading) => {
    if (handled.has(heading) || !heading.getBoundingClientRect().height) return;
    handled.add(heading);
    if (motionOff()) return;
    let text = heading.textContent;
    if (!text?.trim()) return;
    let scale = Number.parseFloat(view.getComputedStyle(doc.documentElement)
      .getPropertyValue('--sn-theme-motion-scale'));
    if (!Number.isFinite(scale) || scale <= 0) return;
    let label = doc.createElement('span');
    label.className = 'notchset-heading-label';
    label.append(...heading.childNodes);
    let overlay = doc.createElement('span');
    overlay.className = 'notchset-heading-overlay';
    overlay.setAttribute('aria-hidden', 'true');
    heading.setAttribute('data-notchset-decoding', '');
    heading.append(label, overlay);
    let record = { label, overlay, frame: 0, start: view.performance.now(), sample: -1 };
    active.set(heading, record);
    let duration = 110 + Math.min(Array.from(text).length, 24) * 14;
    let draw = (timestamp) => {
      if (!heading.isConnected || motionOff()) {
        finish(heading);
        return;
      }
      let elapsed = Math.max(0, (timestamp - record.start) / scale);
      if (elapsed >= duration) {
        finish(heading);
        return;
      }
      let sample = Math.floor(elapsed / 36);
      if (sample !== record.sample) {
        overlay.textContent = scrambleHeading(text, elapsed);
        record.sample = sample;
      }
      record.frame = view.requestAnimationFrame(draw);
    };
    overlay.textContent = scrambleHeading(text, 0);
    record.frame = view.requestAnimationFrame(draw);
  };
  let scan = (node) => {
    if (node.nodeType !== 1) return;
    if (node.matches('.cb-flow h1.md-h')) reveal(node);
    for (let heading of node.querySelectorAll('.cb-flow h1.md-h')) reveal(heading);
  };
  let observer = new view.MutationObserver((records) => {
    if (motionOff()) finishAll();
    for (let record of records) {
      for (let node of record.addedNodes) scan(node);
    }
    for (let heading of active.keys()) if (!heading.isConnected) finish(heading);
  });
  observer.observe(doc.documentElement, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['data-portfolio-motion'],
  });
  let onMotion = () => { if (motionOff()) finishAll(); };
  query.addEventListener('change', onMotion);
  doc.addEventListener('visibilitychange', onMotion);
  scan(doc.documentElement);
  return () => {
    observer.disconnect();
    query.removeEventListener('change', onMotion);
    doc.removeEventListener('visibilitychange', onMotion);
    finishAll();
  };
}
