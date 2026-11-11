export default function installShowResize(workspace, handle, host, navigation) {
  let abort = new AbortController();
  let drag = null;
  let bounds = () => ({
    min: 120,
    max: Math.max(120, workspace.clientHeight - navigation.clientHeight - 120),
  });
  let sync = (height = host.getBoundingClientRect().height, apply = false) => {
    let { min, max } = bounds();
    let value = Math.round(Math.min(max, Math.max(min, height)));
    if (apply) host.style.setProperty('--cv-show-height', `${value}px`);
    handle.setAttribute('aria-valuemin', String(min));
    handle.setAttribute('aria-valuemax', String(max));
    handle.setAttribute('aria-valuenow', String(value));
  };
  let options = { signal: abort.signal };
  handle.addEventListener('pointerdown', (event) => {
    if (!event.isPrimary || event.button !== 0) return;
    event.preventDefault();
    event.stopPropagation();
    drag = { id: event.pointerId, y: event.clientY, height: host.getBoundingClientRect().height };
    handle.setPointerCapture(event.pointerId);
  }, options);
  handle.addEventListener('pointermove', (event) => {
    if (drag?.id !== event.pointerId) return;
    sync(drag.height + drag.y - event.clientY, true);
  }, options);
  let finish = () => { drag = null; };
  handle.addEventListener('pointerup', finish, options);
  handle.addEventListener('pointercancel', finish, options);
  handle.addEventListener('lostpointercapture', finish, options);
  handle.addEventListener('keydown', (event) => {
    let height = host.getBoundingClientRect().height;
    let { min, max } = bounds();
    let values = { ArrowUp: height + 20, ArrowDown: height - 20, Home: min, End: max };
    if (!(event.key in values)) return;
    event.preventDefault();
    sync(values[event.key], true);
  }, options);
  window.addEventListener('resize', () => {
    drag = null;
    if (!host.getBoundingClientRect().height) return;
    sync(host.getBoundingClientRect().height,
      Boolean(host.style.getPropertyValue('--cv-show-height')));
  }, options);
  let observer = new MutationObserver(() => sync());
  observer.observe(host, { childList: true });
  sync();
  return () => {
    abort.abort();
    observer.disconnect();
    drag = null;
  };
}
