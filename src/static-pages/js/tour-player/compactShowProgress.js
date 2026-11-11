let bindings = new WeakMap();

// The visual bar contains only playable turns. The controller still seeks in
// turn-local time, preserving the composition clock and shared URL coordinate.
export default function syncCompactShowProgress(player, config) {
  // The dock's setShow() result is only an element in a real page; headless
  // callers hand it a controller-shaped object, and the bar simply does not exist there.
  let track = player?.querySelector?.('.chat-show-progress-track');
  if (!track) return;
  let binding = bindings.get(track);
  if (!binding) {
    binding = { config, pointerId: null };
    bindings.set(track, binding);
    let positionAt = (clientX) => {
      let segments = [...track.querySelectorAll('.chat-show-progress-segment')];
      let index = segments.findIndex((segment) => clientX <= segment.getBoundingClientRect().right);
      if (index < 0) index = segments.length - 1;
      let rect = segments[index]?.getBoundingClientRect();
      let duration = Number(binding.config.timeline.turns[index]?.durationMs);
      if (!rect || !(rect.width > 0) || !(duration > 0)) return null;
      let ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      return { index, positionMs: ratio * duration };
    };
    let scrub = (event) => {
      if (event.type === 'pointerdown') {
        if (event.button !== 0) return;
        binding.pointerId = event.pointerId;
        track.setPointerCapture(event.pointerId);
      }
      if (binding.pointerId !== event.pointerId) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      let position = positionAt(event.clientX);
      if (event.type === 'pointerup' || event.type === 'pointercancel') {
        binding.pointerId = null;
        track.releasePointerCapture(event.pointerId);
        if (position && event.type === 'pointerup') {
          binding.config.controller.seek(position.index, position.positionMs);
        }
      }
    };
    for (let type of ['pointerdown', 'pointermove', 'pointerup', 'pointercancel']) {
      track.addEventListener(type, scrub, { capture: true });
    }
  }
  binding.config = config;
  let segments = track.querySelectorAll('.chat-show-progress-segment');
  let index = config.state.index;
  let rect = segments[index]?.getBoundingClientRect();
  let trackRect = track.getBoundingClientRect();
  let duration = Number(config.timeline.turns[index]?.durationMs);
  if (!rect || !(trackRect.width > 0) || !(duration > 0)) return;
  let ratio = Math.max(0, Math.min(1, config.state.progress.positionMs / duration));
  let position = (rect.left - trackRect.left + ratio * rect.width) / trackRect.width;
  player.style.setProperty('--cv-compact-progress', String(position));
}
