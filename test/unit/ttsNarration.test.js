import test from 'node:test';
import assert from 'node:assert/strict';
import { estimateTiming, findQuoteWord, createPaceTracker, splitWords } from '../../src/static-pages/js/tour-player/ttsTiming.js';
import { createTtsSpeechController, planCues } from '../../src/static-pages/js/tour-player/ttsNarration.js';
import { localizeShowStory, validateShowLocale, showLocaleTemplate } from '../../src/static-pages/js/tour-player/showLocale.js';

const TEXT = 'Hello there my friend. This is the second sentence, with a comma. Third one here.';

test('estimateTiming orders words and sentences monotonically', () => {
  const timing = estimateTiming(TEXT);
  assert.equal(timing.sentences.length, 3);
  for (let i = 1; i < timing.words.length; i += 1) assert.ok(timing.words[i].startMs >= timing.words[i - 1].endMs);
  assert.ok(estimateTiming(TEXT, { scale: 2 }).durationMs > timing.durationMs * 1.9);
});

test('findQuoteWord ignores case and punctuation and honours occurrence', () => {
  const words = splitWords('Go go. GO, now go');
  assert.equal(findQuoteWord(words, 'go now'), 2);
  assert.equal(findQuoteWord(words, 'go', 2), 1);
  assert.equal(findQuoteWord(words, 'missing'), -1);
});

test('pace tracker follows the measured ratio', () => {
  const pace = createPaceTracker({ weight: 1 });
  assert.equal(pace.observe(1000, 2000), 2);
  assert.equal(pace.observe(100, 5000), 2, 'tiny estimates are ignored');
});

test('planCues places a cue in the sentence of its quote', () => {
  const { planned } = planCues(TEXT, [{ id: 'a', quote: 'second sentence', offsetMs: -100 }, { id: 'b', quote: 'nope' }]);
  assert.equal(planned[0].sentence, 1);
  assert.equal(planned[0].anchored, true);
  assert.equal(planned[1].anchored, false);
});

function fakeEnvironment() {
  let clock = 0;
  const timers = [];
  const spoken = [];
  const synth = {
    paused: false,
    speak: (u) => spoken.push(u),
    cancel: () => { spoken.length = 0; },
    pause() { this.paused = true; },
    resume() { this.paused = false; },
    getVoices: () => [{ lang: 'en-US', name: 'v' }],
  };
  class Utterance { constructor(text) { this.text = text; } }
  const advance = (ms) => {
    const end = clock + ms;
    for (;;) {
      const due = timers.filter((t) => t.at <= end).sort((a, b) => a.at - b.at)[0];
      if (!due) break;
      timers.splice(timers.indexOf(due), 1);
      clock = due.at;
      due.fn();
    }
    clock = end;
  };
  return {
    synth, Utterance, spoken, advance,
    now: () => clock,
    clock: { set: (fn, ms) => { const t = { fn, at: clock + ms }; timers.push(t); return t; }, clear: (t) => { const i = timers.indexOf(t); if (i >= 0) timers.splice(i, 1); } },
  };
}

test('controller speaks sentence by sentence and fires cues around their quotes', () => {
  const env = fakeEnvironment();
  const controller = createTtsSpeechController(env);
  const events = [];
  controller.speak(TEXT, {
    lang: 'en-GB',
    cues: [{ id: 'second', quote: 'second sentence', offsetMs: 0 }],
    onStart: () => events.push('start'),
    onCue: (cue) => events.push(`cue:${cue.id}@${env.now()}`),
    onEnd: () => events.push('end'),
  });
  assert.equal(env.spoken.length, 1);
  assert.match(env.spoken.at(-1).text, /^Hello there my friend\.$/);
  assert.equal(env.spoken.at(-1).voice.lang, 'en-US');
  env.spoken.at(-1).onstart();
  env.advance(1500);
  env.spoken.at(-1).onend();
  const second = env.spoken.at(-1);
  assert.match(second.text, /^This is the second sentence, with a comma\.$/);
  second.onstart();
  env.advance(4000);
  assert.ok(events.some((e) => e.startsWith('cue:second')));
  second.onend();
  env.spoken.at(-1).onstart();
  env.spoken.at(-1).onend();
  assert.equal(events.at(-1), 'end');
  assert.equal(events[0], 'start');
});

test('pause freezes cue timers and resume continues the remainder', () => {
  let env = fakeEnvironment();
  let controller = createTtsSpeechController(env);
  let fired = [];
  controller.speak('One two three four five six seven eight nine ten.', {
    cues: [{ id: 'late', quote: 'nine ten' }],
    onCue: (cue) => fired.push(cue.id),
  });
  env.spoken.at(-1).onstart();
  env.advance(1000);
  let positionBeforePause = controller.clock().positionMs;
  controller.pause();
  assert.equal(controller.clock().playing, false);
  env.advance(60_000);
  assert.deepEqual(fired, []);
  assert.equal(controller.clock().positionMs, positionBeforePause);
  controller.resume();
  assert.equal(controller.clock().playing, false, 'resume waits for the browser resume event');
  env.spoken.at(-1).onresume();
  assert.equal(controller.clock().playing, true);
  env.advance(60_000);
  assert.deepEqual(fired, ['late']);
});

test('browser speech reports playing only after the physical start', () => {
  let env = fakeEnvironment();
  let controller = createTtsSpeechController(env);
  controller.speak('Wait for the voice.', {
    startPaused: true,
    cues: [{ id: 'voice', quote: 'voice' }],
  });
  assert.equal(env.spoken.length, 0);
  assert.equal(controller.clock().playing, false);
  controller.resume();
  assert.equal(env.spoken.length, 1);
  assert.equal(controller.clock().playing, false);
  env.spoken.at(-1).onstart();
  assert.equal(controller.clock().playing, true);
});

test('browser speech retry after an autoplay block republishes the physical start', () => {
  let env = fakeEnvironment();
  let controller = createTtsSpeechController(env);
  let starts = [];
  let blocked = [];
  controller.speak('First sentence. Second sentence.', {
    cues: [{ id: 'second', quote: 'Second sentence' }],
    onStart: () => starts.push(env.now()),
    onBlocked: (reason) => blocked.push(reason),
  });
  env.spoken.at(-1).onstart();
  env.spoken.at(-1).onend();
  env.spoken.at(-1).onerror({ error: 'not-allowed' });
  assert.deepEqual(blocked, ['autoplay-blocked']);
  assert.equal(controller.clock().playing, false);
  controller.resume();
  env.spoken.at(-1).onstart();
  assert.equal(starts.length, 2);
  assert.equal(controller.clock().playing, true);
});

test('synchronous autoplay block retries with a physical-start event', () => {
  let env = fakeEnvironment();
  env.synth.speak = () => { throw Object.assign(new Error('gesture required'), { name: 'NotAllowedError' }); };
  let controller = createTtsSpeechController(env);
  let starts = 0;
  let blocked = 0;
  controller.speak('First sentence.', {
    onStart: () => { starts += 1; },
    onBlocked: () => { blocked += 1; },
  });
  assert.equal(blocked, 1);
  env.synth.speak = (utterance) => env.spoken.push(utterance);
  controller.resume();
  env.spoken.at(-1).onstart();
  assert.equal(starts, 1);
});

test('beforeEnd waits for the final asynchronous cue chain before onEnd', async () => {
  let env = fakeEnvironment();
  let controller = createTtsSpeechController(env);
  let events = [];
  let release;
  let barrier = new Promise((resolve) => { release = resolve; });
  controller.speak('The final cue.', {
    cues: [{ id: 'final', quote: 'final cue' }],
    beforeEnd: () => { events.push('beforeEnd'); return barrier; },
    onEnd: () => events.push('end'),
  });
  let utterance = env.spoken.at(-1);
  utterance.onstart();
  utterance.onend();
  assert.deepEqual(events, ['beforeEnd']);
  assert.equal(controller.clock().playing, false);
  release();
  await barrier;
  await Promise.resolve();
  assert.deepEqual(events, ['beforeEnd', 'end']);
});

test('speech has priority: a running cue never pauses the voice or delays later cues', () => {
  const env = fakeEnvironment();
  const controller = createTtsSpeechController(env);
  const fired = [];
  controller.speak('First cue, then another later cue.', {
    cues: [
      { id: 'first', quote: 'First cue' },
      { id: 'later', quote: 'another later cue' },
    ],
    // A gesture that never finishes: the voice must not wait for it.
    onCue: (cue) => { fired.push(cue.id); return new Promise(() => {}); },
  });
  env.spoken.at(-1).onstart();
  env.advance(1_000);
  assert.deepEqual(fired, ['first']);
  assert.equal(env.synth.paused, false);
  assert.equal(controller.clock().playing, true);
  env.advance(20_000);
  assert.deepEqual(fired, ['first', 'later']);
});

test('a throwing or rejecting cue does not stop the narration', async () => {
  const env = fakeEnvironment();
  const controller = createTtsSpeechController(env);
  const errors = [];
  controller.speak('One two. Three four.', {
    cues: [{ id: 'a', quote: 'one two' }, { id: 'b', quote: 'three four' }],
    onCue: (cue) => { if (cue.id === 'a') throw new Error('x'); return Promise.reject(new Error('y')); },
    onError: (e) => errors.push(e),
  });
  env.spoken.at(-1).onstart();
  env.advance(100);
  env.spoken.at(-1).onend();
  env.spoken.at(-1).onstart();
  env.advance(1_000);
  await Promise.resolve();
  assert.deepEqual(errors, []);
});

test('cancel silences the narration', () => {
  const env = fakeEnvironment();
  const controller = createTtsSpeechController(env);
  const fired = [];
  controller.speak('One two three.', { cues: [{ id: 'x', quote: 'three' }], onCue: (c) => fired.push(c.id) });
  env.spoken.at(-1).onstart();
  controller.cancel();
  env.advance(60_000);
  assert.deepEqual(fired, []);
});

const STORY = {
  narrationLocale: 'ru',
  scenes: [{ id: 's1', title: 'Т', subtitle: 'Привет мир.', speech: 'Привет мир.', directives: [{ id: 'd1', timing: { quote: 'мир', occurrence: 1, offsetMs: -100 } }, { id: 'd2', timing: { phase: 'setup' } }] }],
  branches: { b1: { id: 'b1', sceneId: 's1', subtitle: 'Ветка.', speech: 'Ветка.', directives: [] } },
};

test('locale validation reports missing entries and quotes outside the speech', () => {
  assert.equal(validateShowLocale(STORY, { scenes: {}, branches: {} }).length, 2);
  const locale = { scenes: { s1: { subtitle: 'Hello world.', quotes: { d1: 'galaxy' } } }, branches: { b1: { subtitle: 'Branch.' } } };
  assert.deepEqual(validateShowLocale(STORY, locale), ['scene s1: quote of d1 not in speech']);
  locale.scenes.s1.quotes.d1 = 'world';
  assert.deepEqual(validateShowLocale(STORY, locale), []);
});

test('localizeShowStory swaps texts and quotes but keeps choreography', () => {
  const locale = { scenes: { s1: { title: 'T', subtitle: 'Hello world.', quotes: { d1: 'world' } } }, branches: { b1: { subtitle: 'Branch.' } } };
  const story = localizeShowStory(STORY, 'en', locale);
  assert.equal(story.narrationLocale, 'en');
  assert.equal(story.scenes[0].speech, 'Hello world.');
  assert.equal(story.scenes[0].directives[0].timing.quote, 'world');
  assert.equal(story.scenes[0].directives[0].timing.offsetMs, -100);
  assert.deepEqual(story.scenes[0].directives[1], STORY.scenes[0].directives[1]);
  assert.equal(STORY.scenes[0].subtitle, 'Привет мир.');
});

test('native selections and speech timing quotes are localized independently', () => {
  let story = {
    scenes: [{
      id: 's1', title: 'T', subtitle: 'Texto anterior.', speech: 'Spoken phrase here.',
      directives: [{
        id: 'select', type: 'native-selection', quote: 'frase antigua',
        timing: { quote: 'frase antigua', occurrence: 2, offsetMs: -100 },
      }],
    }],
    branches: {},
  };
  let locale = {
    scenes: {
      s1: {
        speech: 'A spoken phrase here.',
        selections: { select: 'una frase del artículo' },
        quotes: { select: 'spoken phrase' },
      },
    },
  };
  let localized = localizeShowStory(story, 'en', locale).scenes[0].directives[0];
  assert.equal(localized.quote, 'una frase del artículo');
  assert.equal(localized.timing.quote, 'spoken phrase');
  assert.equal(localized.timing.occurrence, 1);
  assert.equal(localized.timing.offsetMs, -100);
  assert.deepEqual(validateShowLocale(story, locale), []);
});

test('showLocaleTemplate lists the quotes to translate', () => {
  assert.deepEqual(showLocaleTemplate(STORY).scenes.s1.quotes, { d1: 'мир' });
});

test('showLocaleTemplate lists native-selection text separately from timing quotes', () => {
  let story = {
    scenes: [{
      ...STORY.scenes[0],
      directives: [{
        id: 'selection', type: 'native-selection', quote: 'фраза статьи',
        timing: { quote: 'мир' },
      }],
    }],
    branches: {},
  };
  let entry = showLocaleTemplate(story).scenes.s1;
  assert.deepEqual(entry.quotes, { selection: 'мир' });
  assert.deepEqual(entry.selections, { selection: 'фраза статьи' });
});

test('every registered show locale is complete', async () => {
  const { CV_SHOW_LOCALES } = await import('../../src/static-pages/data/cvShowLocales.js');
  const { CV_SHOW_STORY } = await import('../../src/static-pages/data/cvShowPresentationProject.js');
  for (const [lang, locale] of Object.entries(CV_SHOW_LOCALES)) {
    assert.deepEqual(validateShowLocale(CV_SHOW_STORY, locale), [], lang);
    const story = localizeShowStory(CV_SHOW_STORY, lang, locale);
    for (const entry of [...story.scenes, ...Object.values(story.branches || {})]) {
      for (const directive of entry.directives || []) {
        if (directive.type !== 'native-selection') continue;
        assert.ok(directive.quote, `${lang} ${entry.id} ${directive.id} selection`);
        assert.doesNotMatch(
          directive.quote,
          /\p{Script=Cyrillic}/u,
          `${lang} ${entry.id} ${directive.id} selection`,
        );
      }
    }
  }
});

test('without cues the text is spoken as one utterance', () => {
  const env = fakeEnvironment();
  const controller = createTtsSpeechController(env);
  controller.speak(TEXT, { lang: 'en' });
  assert.equal(env.spoken.length, 1);
  assert.equal(env.spoken[0].text, TEXT);
  assert.equal(controller.clock(), null, 'the composition clock remains authoritative without timed cues');
});

test('startAtMs resumes at the sentence holding the position and skips earlier cues', () => {
  const env = fakeEnvironment();
  const controller = createTtsSpeechController(env);
  const fired = [];
  const timing = estimateTiming(TEXT);
  controller.speak(TEXT, {
    startAtMs: timing.sentences[1].startMs + 10,
    cues: [{ id: 'early', quote: 'hello there' }, { id: 'late', quote: 'third one' }],
    onCue: (cue) => fired.push(cue.id),
  });
  assert.match(env.spoken.at(-1).text, /^This is the second sentence/);
  assert.equal(controller.clock().positionMs, timing.sentences[1].startMs);
  env.spoken.at(-1).onstart();
  env.spoken.at(-1).onend();
  env.spoken.at(-1).onstart();
  env.advance(60_000);
  assert.deepEqual(fired, ['late']);
});

test('a localized story carries estimated durations for the composition clock', async () => {
  const { CV_SHOW_STORY } = await import('../../src/static-pages/data/cvShowPresentationProject.js');
  const { CV_SHOW_LOCALE_EN } = await import('../../src/static-pages/data/showLocales/en.js');
  const { createCvShowCompositionTimeline } = await import('../../src/static-pages/js/tour-player/compositionTime.js');
  const story = localizeShowStory(CV_SHOW_STORY, 'en', CV_SHOW_LOCALE_EN);
  const timeline = createCvShowCompositionTimeline(story);
  assert.equal(timeline.segments.length, 30);
  assert.ok(timeline.totalMs > 600_000 && timeline.totalMs < 4_000_000);
});

test('a restored position scrolls to where the last skipped cue left the page', async () => {
  const { restoredScrollCue } = await import('../../src/static-pages/js/tour-player/ttsCues.js');
  const cues = [
    { id: 'a:scroll', quote: 'hello there', scroll: true, offsetMs: -500 },
    { id: 'a', quote: 'hello there', offsetMs: -100 },
    { id: 'b:scroll', quote: 'second sentence', scroll: true, offsetMs: -500 },
    { id: 'c:scroll', quote: 'third one', scroll: true, offsetMs: -500 },
  ];
  const timing = estimateTiming(TEXT);
  assert.equal(restoredScrollCue(TEXT, cues, 0), null);
  assert.equal(restoredScrollCue(TEXT, cues, timing.sentences[1].startMs + 5)?.id, 'a:scroll');
  assert.equal(restoredScrollCue(TEXT, cues, timing.sentences[2].startMs + 5)?.id, 'c:scroll');
});

test('a scroll whose lead reaches into the restart sentence is restored too', async () => {
  const { restoredScrollCue } = await import('../../src/static-pages/js/tour-player/ttsCues.js');
  const timing = estimateTiming(TEXT);
  const cues = [{ id: 'near:scroll', quote: 'second sentence', scroll: true, offsetMs: -2500 }];
  // The quote sits in sentence 1 (a few words in); with a 2.5 s lead it is due before sentence 1 starts.
  assert.equal(restoredScrollCue(TEXT, cues, timing.sentences[1].startMs + 5)?.id, 'near:scroll');
  assert.equal(restoredScrollCue(TEXT, cues, 10)?.id, undefined);
});

test('a lead longer than the sentence before it fires at that sentence start, in cue order', () => {
  const env = fakeEnvironment();
  const controller = createTtsSpeechController(env);
  const fired = [];
  controller.speak('Short one. Then the quote begins here and goes on.', {
    cues: [
      { id: 'scroll', quote: 'the quote begins', offsetMs: -5000 },
      { id: 'frame', quote: 'the quote begins', offsetMs: -100 },
    ],
    onCue: (cue) => fired.push(cue.id),
  });
  env.spoken.at(-1).onstart();
  env.advance(1);
  assert.deepEqual(fired, ['scroll'], 'the long lead is due at once');
  env.advance(300);
  env.spoken.at(-1).onend();
  env.spoken.at(-1).onstart();
  env.advance(60_000);
  assert.deepEqual(fired, ['scroll', 'frame']);
});

test('hasVoice tells whether the browser has a voice for the language, or null while unknown', () => {
  const env = fakeEnvironment();
  const controller = createTtsSpeechController(env);
  assert.equal(controller.hasVoice('en-GB'), true, 'matches the language part');
  assert.equal(controller.hasVoice('es'), false);
  env.synth.getVoices = () => [];
  assert.equal(controller.hasVoice('en'), null, 'an empty list means the voices are not loaded yet');
});
