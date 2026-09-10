function visiblePlayer(player, documentRef = globalThis.document) {
  if (!player?.isConnected) return null;
  const rect = player.getBoundingClientRect?.();
  const style = documentRef?.defaultView?.getComputedStyle?.(player);
  return rect?.width > 0
    && rect.height > 0
    && style?.display !== 'none'
    && style?.visibility !== 'hidden'
    ? player
    : null;
}

/** Resolve the stable player currently mounted by the native host. */
export function resolveVisibleShowPlayer(workspace, { document: documentRef = globalThis.document } = {}) {
  const chat = workspace?.querySelector?.('agent-show-chat, portfolio-show-chat');
  const candidates = [
    chat?.getShowPlayer?.(),
    ...Array.from(workspace?.querySelectorAll?.('agent-dock-shell chat-show-player') || []),
  ].filter((player, index, all) => player && all.indexOf(player) === index);
  return candidates.map((player) => visiblePlayer(player, documentRef)).find(Boolean) || null;
}
