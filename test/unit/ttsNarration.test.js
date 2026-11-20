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
  const env = fakeEnvironment();
  const controller = createTtsSpeechController(env);
  const fired = [];
  controller.speak('One two three four five six seven eight nine ten.', {
    cues: [{ id: 'late', quote: 'nine ten' }],
    onCue: (cue) => fired.push(cue.id),
  });
  env.spoken.at(-1).onstart();
  env.advance(1000);
  controller.pause();
  env.advance(60_000);
  assert.deepEqual(fired, []);
  controller.resume();
  env.advance(60_000);
  assert.deepEqual(fired, ['late']);
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

test('showLocaleTemplate lists the quotes to translate', () => {
  assert.deepEqual(showLocaleTemplate(STORY).scenes.s1.quotes, { d1: 'мир' });
});

test('every registered show locale is complete', async () => {
  const { CV_SHOW_LOCALES } = await import('../../src/static-pages/data/cvShowLocales.js');
  const { CV_SHOW_STORY } = await import('../../src/static-pages/data/cvShowPresentationProject.js');
  for (const [lang, locale] of Object.entries(CV_SHOW_LOCALES)) {
    assert.deepEqual(validateShowLocale(CV_SHOW_STORY, locale), [], lang);
  }
});

test('without cues the text is spoken as one utterance', () => {
  const env = fakeEnvironment();
  const controller = createTtsSpeechController(env);
  controller.speak(TEXT, { lang: 'en' });
  assert.equal(env.spoken.length, 1);
  assert.equal(env.spoken[0].text, TEXT);
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
