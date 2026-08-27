function action(id, label, icon) {
  return { id, label, icon };
}

/**
 * @param {Record<string, any>} story
 * @param {'short' | 'full'} [mode]
 * @returns {readonly any[]}
 */
export function createCvShowPlaybackEntries(story, mode = 'short') {
  const scenes = (story?.short || [])
    .map((id) => story?.scenes?.find((candidate) => candidate.id === id))
    .filter(Boolean);
  if (mode !== 'full') return Object.freeze(scenes);
  return Object.freeze(scenes.flatMap((scene) => {
    const branch = scene.branchId ? story?.branches?.[scene.branchId] : null;
    return branch ? [scene, branch] : [scene];
  }));
}

/**
 * @param {Record<string, any>} entry
 * @param {{ inBranch?: boolean, returnLabel?: string }} [options]
 * @returns {Readonly<{ text: string, actions: readonly any[], payload: any }>}
 */
export function createCvShowPresentationContext(entry, options = {}) {
  let text = String(entry?.chat?.text || '').trim();
  if (!text) throw new TypeError(`Missing CV Show agent context: ${entry?.id || ''}`);

  if (options.inBranch) {
    return Object.freeze({
      text,
      actions: Object.freeze([
        Object.freeze(action('return', String(options.returnLabel || ''), 'undo')),
      ]),
      payload: Object.freeze({ intent: 'branch-return', branchId: entry.id }),
    });
  }

  if (!entry.branchId) {
    return Object.freeze({ text, actions: Object.freeze([]), payload: null });
  }

  return Object.freeze({
    text,
    actions: Object.freeze([
      Object.freeze(action('details', entry.chat.actionLabel, 'read_more')),
    ]),
    payload: Object.freeze({
      intent: 'detail',
      branchId: entry.branchId,
      sceneId: entry.id,
    }),
  });
}
