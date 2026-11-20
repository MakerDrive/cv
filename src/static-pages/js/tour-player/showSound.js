import { createShowSoundscape } from 'symbiote-ui/chat/show-soundscape.js';
import { watchPresenterCues } from 'symbiote-ui/chat/show-soundscape-cues.js';
import { getShowLog } from '../show-log/index.js';

const SOUNDS_OFF_KEY = 'cvShowSoundOff';
const MUSIC_ON_KEY = 'cvShowMusicOn';
const POLL_MS = 250;

const params = () => new URLSearchParams(globalThis.location?.search || '');

const readFlag = (key, value, fallback) => {
  const fromUrl = params().get(key);
  if (fromUrl !== null) return fromUrl !== '0';
  try {
    const stored = globalThis.localStorage?.getItem(value);
    return stored === null || stored === undefined ? fallback : stored === '1';
  } catch { return fallback; }
};

const saveFlag = (value, flag) => {
  try { globalThis.localStorage?.setItem(value, flag ? '1' : '0'); } catch { /* optional */ }
};

/**
 * Generative techno bed and accent sounds of the Show. The track seed comes
 * is random on every page load (`?showSeed=` pins it for that load only); it is written to the show log so a heard track can be named.
 * Sound plays only while the show runs. The bed is off by default (`?showMusic=1`),
 * the action sounds are on (`?showSound=0` turns them off); both have a header button.
 *
 * @param {{ isPlaying: () => boolean }} source reports whether the narration clock runs
 */
const DIRECTIVE_CUES = Object.freeze({
  navigate: 'click',
  'attention:click': 'click',
  'attention:native-selection': 'text',
  activate: 'click',
  media: 'media',
  'chat-note': 'note',
  'chat-action': 'note',
});

export function createCvShowSound(source) {
  // `?showSeed=` pins one track for this load only: it is removed from the
  // address right away, so the next load (or a shared link) gets a new seed.
  const seed = params().get('showSeed') || Math.random().toString(36).slice(2, 8);
  if (params().has('showSeed')) {
    const url = new URL(globalThis.location.href);
    url.searchParams.delete('showSeed');
    globalThis.history?.replaceState(globalThis.history.state, '', url.href);
  }
  const sound = createShowSoundscape({
    seed,
    volume: Number(params().get('showVolume') ?? 0.6),
    onTrace: (type, data) => getShowLog()[type === 'cue' ? 'debug' : 'info']('sound', type, data),
  });
  // The techno bed is off by default, the action sounds are on.
  sound.setMusic(readFlag('showMusic', MUSIC_ON_KEY, false));
  sound.setSounds(readFlag('showSound', SOUNDS_OFF_KEY, true));
  let sections = 0;
  let stopWatch = null;
  const cue = (kind, detail) => sound.cue(kind, detail);
  const timer = setInterval(() => sound.setPlaying(Boolean(source.isPlaying())), POLL_MS);
  // Browsers start audio only inside a user gesture: the first one retries.
  const unlock = () => { if (source.isPlaying()) sound.setPlaying(true); };
  globalThis.addEventListener?.('pointerdown', unlock, { capture: true });
  globalThis.addEventListener?.('keydown', unlock, { capture: true });

  return {
    sound,
    cue,
    /** The show runs a directive: its kind picks the sound (marker and frame sound from the overlay). */
    directive(directive) {
      const sound = DIRECTIVE_CUES[directive?.type === 'attention' ? `attention:${directive.mode}` : directive?.type];
      if (sound) cue(sound);
    },
    /** A new section gets its own track: the seed derives from the page seed. */
    nextSection() {
      sections += 1;
      sound.queueSeed(`${seed}:${sections}`);
    },
    /** Follow the overlay of a presenter cursor session. */
    watchOverlay(overlay) {
      stopWatch?.();
      stopWatch = overlay ? watchPresenterCues(
        overlay, (kind, detail) => sound.cue(kind, detail), (kind, value, detail) => sound.sustain(kind, value, detail),
      ) : null;
    },
    isMusic: () => sound.isMusic(),
    isSounds: () => sound.isSounds(),
    toggleMusic() {
      sound.setMusic(!sound.isMusic());
      saveFlag(MUSIC_ON_KEY, sound.isMusic());
      return sound.isMusic();
    },
    toggleSounds() {
      sound.setSounds(!sound.isSounds());
      saveFlag(SOUNDS_OFF_KEY, !sound.isSounds());
      return sound.isSounds();
    },
    dispose() {
      clearInterval(timer);
      stopWatch?.();
      globalThis.removeEventListener?.('pointerdown', unlock, { capture: true });
      globalThis.removeEventListener?.('keydown', unlock, { capture: true });
      sound.dispose();
    },
  };
}
