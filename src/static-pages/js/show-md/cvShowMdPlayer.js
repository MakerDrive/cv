import {
  createPresenterCursor,
} from 'symbiote-ui/chat/presenter-cursor.js';
import {
  createSpeechEngine,
  ShowAlignedMediaRuntime,
  ShowAttentionController,
} from 'symbiote-ui/chat/show-runtime';
import { scheduleSceneCues, createBrowserVoiceAlignedSequence } from './cvShowMdTiming.js';

/**
 * Runs one CV Show Markdown scene on the canonical show-alignment execution layer.
 *
 * Recorded voice: the recording is the media clock and the Whisper aligned sequence (`@align`) gives the words.
 * Browser voice: the speech engine's word clock gives the same kind of timeline and drives the same runtime through
 * `sample()`. Both voices feed `ShowAlignedMediaRuntime`, which fires each cue once when the clock reaches its anchor.
 *
 * Dependencies are injected, so the timing can run under Node with a fake clock; the browser harness passes the
 * real audio element, speech engine, presenter cursor and DOM targets.
 */

const CLOCK_INTERVAL_MS = 16;

/**
 * @param {Element} target
 * @param {number} budgetMs time until the next anchor; the scroll ends in that room
 */
export function scrollTargetIntoView(target, budgetMs) {
  if (!target || typeof target.scrollIntoView !== 'function') return;
  // The budget is the room the scroll has before the next anchor. A plain smooth scroll keeps the gesture
  // inside the scene without a hard deadline; the presenter-driven scroll of symbiote-ui is not exported yet.
  let rect = target.getBoundingClientRect?.();
  let viewH = globalThis.innerHeight || 720;
  if (rect && rect.top >= 96 && rect.bottom <= viewH - 130) return;
  /** @type {ScrollBehavior} */
  let behavior = budgetMs >= 900 ? 'smooth' : 'auto';
  target.scrollIntoView({ behavior, block: 'center' });
}

/**
 * @param {{
 *   scene: { id: string, speech: string, audioUrl: string, alignUrl: string, cues: Array<Record<string, any>> },
 *   mdUrl?: string, // URL of the .show.md file; `@audio` and `@align` are relative to it
 *   voice?: 'recorded' | 'browser',
 *   lang?: string,
 *   fetchJson?: (url: string) => Promise<Record<string, any>>,
 *   media?: Record<string, any> | null,
 *   speech?: Record<string, any> | null,
 *   doc?: Document | null,
 *   resolveTarget?: (targetId: string) => Element | null,
 *   scrollInto?: (target: Element, budgetMs: number) => void,
 *   attention?: { present: (request: Record<string, any>) => any, cancel?: () => void } | null,
 *   onMedia?: (directive: Record<string, any>, cue: Record<string, any>) => void,
 *   onDiagnostic?: (entry: Record<string, any>) => void,
 *   onCueFired?: (entry: Record<string, any>) => void,
 *   playbackClock?: Record<string, any>,
 *   frame?: (callback: () => void) => any,
 *   cancelFrame?: (handle: any) => void,
 * }} options
 */
export function createCvShowMdPlayer({
  scene,
  mdUrl = globalThis.location?.href ?? '',
  voice = 'recorded',
  lang = 'ru-RU',
  fetchJson = (url) => fetch(url).then((response) => {
    if (!response.ok) throw new Error(`aligned sequence ${url} failed: ${response.status}`);
    return response.json();
  }),
  media = null,
  speech = null,
  doc = globalThis.document ?? null,
  resolveTarget = (targetId) => doc?.querySelector?.(`[data-show-target="${CSS.escape(targetId)}"]`) ?? null,
  scrollInto = scrollTargetIntoView,
  attention = null,
  onMedia = () => {},
  onDiagnostic = () => {},
  onCueFired = () => {},
  playbackClock = undefined,
  frame = (callback) => globalThis.requestAnimationFrame
    ? globalThis.requestAnimationFrame(callback)
    : globalThis.setTimeout(callback, CLOCK_INTERVAL_MS),
  cancelFrame = (handle) => (globalThis.cancelAnimationFrame
    ? globalThis.cancelAnimationFrame(handle)
    : globalThis.clearTimeout(handle)),
}) {
  let resolveUrl = (url) => (mdUrl ? new URL(url, mdUrl).href : url);
  let runtime = null;
  let schedule = [];
  let scheduleIndex = new Map();
  let durationMs = 0;
  let frameHandle = null;
  let disposed = false;
  let speechRun = null;

  let emit = (entry) => onDiagnostic(Object.freeze({ sceneId: scene.id, ...entry }));

  let handleCue = ({ cue, cueTimeMs, mediaTimeMs }) => {
    let directive = cue.directive;
    onCueFired({ cueId: cue.cueId, cueTimeMs, mediaTimeMs, type: directive.type });
    if (directive.type === 'media') {
      onMedia(directive, cue);
      return;
    }
    if (directive.type !== 'attention') {
      emit({ kind: 'unhandled-directive', cueId: cue.cueId, directiveType: directive.type });
      return;
    }
    let target = resolveTarget(directive.targetId);
    if (!target) {
      emit({ kind: 'target-unresolved', cueId: cue.cueId, targetId: directive.targetId });
      return;
    }
    // Room for the scroll: from this anchor to the next one (or to the end of the scene).
    let index = scheduleIndex.get(cue.cueId);
    let nextMs = index + 1 < schedule.length ? schedule[index + 1].timeMs : durationMs;
    let budgetMs = Math.max(0, nextMs - cueTimeMs);
    try {
      scrollInto(target, budgetMs);
    } catch (error) {
      emit({ kind: 'scroll-error', cueId: cue.cueId, message: error?.message || 'scroll failed' });
    }
    if (!attention) return;
    try {
      attention.present({
        mode: directive.mode,
        target,
        targetId: directive.targetId,
        marker: directive.marker,
        quote: directive.quote,
        gestureId: cue.cueId,
        ...(directive.mode === 'marker' ? { intent: 'emphasize' } : {}),
        frame: {},
      });
    } catch (error) {
      emit({ kind: 'attention-error', cueId: cue.cueId, message: error?.message || 'attention failed' });
    }
  };

  let setSchedule = (items) => {
    schedule = items;
    scheduleIndex = new Map(items.map((item, index) => [item.cueId, index]));
  };

  let loadRecorded = async () => {
    let sequence = await fetchJson(resolveUrl(scene.alignUrl));
    let built = scheduleSceneCues(sequence, scene.cues);
    setSchedule(built.schedule);
    for (let fallback of built.fallbacks) emit({ kind: 'anchor-fallback', ...fallback });
    durationMs = Number(sequence.media?.durationMs) || 0;
    runtime = new ShowAlignedMediaRuntime({
      media,
      schedule,
      onCue: handleCue,
      onReset: () => attention?.cancel?.(),
      playbackClock,
    });
  };

  let stopClock = () => {
    if (frameHandle !== null) cancelFrame(frameHandle);
    frameHandle = null;
  };

  let runBrowserClock = () => {
    let fake = { currentTime: 0, paused: false, ownerDocument: doc };
    let built = false;
    let tick = () => {
      frameHandle = null;
      if (disposed) return;
      let clock = speech?.getClock?.();
      if (clock?.words?.length) {
        if (!built) {
          let sequence = createBrowserVoiceAlignedSequence({ words: clock.words, lang });
          let scheduled = scheduleSceneCues(sequence, scene.cues);
          setSchedule(scheduled.schedule);
          for (let fallback of scheduled.fallbacks) emit({ kind: 'anchor-fallback', ...fallback });
          durationMs = sequence.media.durationMs;
          runtime = new ShowAlignedMediaRuntime({
            media: fake,
            schedule,
            onCue: handleCue,
            onReset: () => attention?.cancel?.(),
            autoAttach: false,
          });
          built = true;
        }
        fake.currentTime = Math.max(0, clock.positionMs) / 1000;
        runtime.sample({ reason: 'browser-clock' });
      }
      frameHandle = frame(tick);
    };
    tick();
  };

  return Object.freeze({
    /** Loads the scene and starts the clock of the chosen voice. Resolves when the speech or recording ends. */
    async start() {
      if (voice === 'recorded') {
        if (!media) throw new Error('recorded voice needs a media element');
        await loadRecorded();
        let finished = new Promise((resolve) => {
          media.addEventListener?.('ended', resolve, { once: true });
        });
        if (!media.src) media.src = resolveUrl(scene.audioUrl);
        await media.play?.();
        await finished;
        return;
      }
      if (!speech) throw new Error('browser voice needs a speech engine');
      speechRun = speech.speak(scene.speech, { lang, audioUrl: '' });
      runBrowserClock();
      await speechRun;
      stopClock();
      if (runtime) runtime.sample({ reason: 'browser-end' });
    },
    /** Schedule of the cues on the current clock: `{ cueId, timeMs, directive }`, for inspection. */
    getSchedule: () => schedule.map((item) => ({ cueId: item.cueId, timeMs: item.timeMs, directive: item.directive })),
    getDurationMs: () => durationMs,
    stop() {
      stopClock();
      runtime?.dispose?.();
      runtime = null;
      speech?.stop?.();
      attention?.cancel?.();
    },
    dispose() {
      disposed = true;
      stopClock();
      runtime?.dispose?.();
      runtime = null;
      speech?.stop?.();
      attention?.cancel?.();
    },
  });
}

/**
 * Browser helpers: a presenter cursor and attention controller on the page, and a real speech engine.
 * Not used under Node.
 */
export function createBrowserCvShowMdDependencies(doc = globalThis.document, lang = 'ru-RU') {
  let cursor = createPresenterCursor(doc, {});
  let attention = new ShowAttentionController({ cursor, resolveTarget: (target) => target });
  let speech = createSpeechEngine({ lang });
  return Object.freeze({ cursor, attention, speech });
}
