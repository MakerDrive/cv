export default function installMobileShowResize(doc) {
  let Observer = doc.defaultView?.MutationObserver;
  if (!Observer) return () => {};
  let sync = () => {
    for (let show of doc.querySelectorAll('agent-dock-shell[show-panel-mobile-active] .agent-show-panel-node')) {
      let second = show.parentElement;
      let split = second?.parentElement;
      let first = split?.querySelector(':scope > .split-first');
      if (!first || !split.matches('.split-view[direction="vertical"]')) continue;
      for (let region of [first, second]) {
        let height = region.style.getPropertyValue('height');
        if (height && region.style.getPropertyPriority('height') !== 'important') {
          region.style.setProperty('height', height, 'important');
        }
      }
      let ratio = parseFloat(first.style.height) / 100;
      if (Number.isFinite(ratio)) {
        show.closest('agent-dock-shell')?.style.setProperty('--cv-show-main-ratio', String(ratio));
      }
    }
  };
  let observer = new Observer((records) => {
    if (records.some(({ type, target, addedNodes }) => type === 'attributes'
      ? target instanceof Element && target.matches('.split-first, .split-second')
      : [...addedNodes].some((node) => node instanceof Element
        && (node.matches('.agent-show-panel-node') || node.querySelector('.agent-show-panel-node'))))) {
      sync();
    }
  });
  observer.observe(doc.documentElement, { subtree: true, childList: true,
    attributes: true, attributeFilter: ['style'] });
  sync();
  return () => observer.disconnect();
}
