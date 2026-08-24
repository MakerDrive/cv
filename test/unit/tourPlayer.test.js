import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { TOUR_BEATS, TOUR_MODES } from '../../src/static-pages/data/tourManifest.js';
import {
  TOUR_STORY,
  parseTourMarkdownSource,
} from '../../src/static-pages/data/tourScripts.js';
import { createTourActionRunner } from '../../src/static-pages/js/tour-player/actions.js';
import { createTourCompletionGate } from '../../src/static-pages/js/tour-player/playback.js';
import { createBrowserSpeechController } from '../../src/static-pages/js/tour-player/speech.js';

const ALLOWED_TARGETS = new Set([
  'portfolio/header',
  'profile/photo',
  'pulse/index',
  'skills/rnd-engineering',
  'projects/agent-portal',
  'projects/symbiote-workspace',
  'projects/autobox-v1',
]);

test('one canonical story supplies both tour modes in every locale', () => {
  assert.deepEqual(Object.keys(TOUR_STORY.locales).sort(), ['en', 'es', 'ru']);
  assert.deepEqual(TOUR_STORY.modes, TOUR_MODES);
  assert.ok(TOUR_MODES.short.length < TOUR_MODES.full.length);
  assert.deepEqual(TOUR_MODES.full, TOUR_BEATS.map((beat) => beat.id));

  for (const locale of ['en', 'ru', 'es']) {
    const beats = TOUR_STORY.locales[locale].beats;
    assert.deepEqual(beats.map((beat) => beat.id), TOUR_BEATS.map((beat) => beat.id));
    assert.equal(new Set(beats.map((beat) => beat.id)).size, beats.length);
    assert.ok(beats.every((beat) => beat.title && beat.text && beat.intents === undefined));
  }

  const serialized = JSON.stringify({ beats: TOUR_BEATS, modes: TOUR_MODES });
  assert.doesNotMatch(serialized, /selector|triggerWord|boundary|timestamp|delay/i);
  for (const beat of TOUR_BEATS) {
    for (const intent of beat.intents) {
      if (intent.target) assert.equal(ALLOWED_TARGETS.has(intent.target), true, intent.target);
    }
  }
});

test('tour Markdown parser rejects duplicate, missing, and reordered canonical beats', () => {
  const manifest = Object.freeze([
    Object.freeze({ id: 'one', intents: Object.freeze([]) }),
    Object.freeze({ id: 'two', intents: Object.freeze([]) }),
  ]);
  const valid = '# Tour\n\n## one / One\nFirst.\n\n## two / Two\nSecond.';
  assert.deepEqual(
    parseTourMarkdownSource(valid, 'en', manifest).map(({ id, title, text }) => ({ id, title, text })),
    [
      { id: 'one', title: 'One', text: 'First.' },
      { id: 'two', title: 'Two', text: 'Second.' },
    ],
  );
  assert.throws(() => parseTourMarkdownSource(valid.replace('two / Two', 'one / Two'), 'en', manifest), /Duplicate/);
  assert.throws(() => parseTourMarkdownSource(valid.replace('two / Two', 'wrong / Two'), 'en', manifest), /mismatch/);
  assert.throws(() => parseTourMarkdownSource('# Tour', 'en', manifest), /no beats/);
});

test('semantic action runner presents before mutation and waits for visual settlement', async () => {
  const order = [];
  const runtime = {
    entries: new Map([['projects/agent-portal', {}]]),
    select(id, options) {
      order.push(['apply', id, options]);
      this.selectedId = id;
    },
  };
  const target = {};
  const runner = createTourActionRunner({
    runtime,
    resolveTarget: async (id) => {
      order.push(['resolve', id]);
      return target;
    },
    presentTarget: async (element, intent, phase) => order.push(['present', element, intent.provenanceId, phase]),
    settleTarget: async (id, element) => order.push(['settle', id, element]),
    clearPresenter: () => order.push(['clear']),
  });

  const result = await runner.run([{
    provenanceId: 'agent-portal-select',
    action: 'select-entry',
    target: 'projects/agent-portal',
    policy: 'required',
  }]);

  assert.equal(result.status, 'success');
  assert.deepEqual(order, [
    ['clear'],
    ['resolve', 'projects/agent-portal'],
    ['present', target, 'agent-portal-select', 'approach'],
    ['apply', 'projects/agent-portal', { focus: true, updateUrl: false }],
    ['settle', 'projects/agent-portal', target],
    ['resolve', 'projects/agent-portal'],
    ['present', target, 'agent-portal-select', 'focus'],
  ]);
  assert.deepEqual(result.receipts[0].phases, ['approach', 'apply', 'settle', 'focus']);
});

test('semantic action runner distinguishes required, optional, focus-only, and cancellation', async () => {
  const runtime = { entries: new Map(), select: () => assert.fail('unexpected selection') };
  let clears = 0;
  const runner = createTourActionRunner({
    runtime,
    resolveTarget: async () => null,
    presentTarget: async () => assert.fail('unexpected presentation'),
    settleTarget: async () => assert.fail('unexpected settlement'),
    clearPresenter: () => { clears += 1; },
  });
  const base = { provenanceId: 'surface', action: 'highlight-surface', target: 'portfolio/header' };
  assert.equal((await runner.run([{ ...base, policy: 'required' }])).status, 'required-missing');
  assert.equal((await runner.run([{ ...base, policy: 'optional' }])).status, 'optional-missing');

  const waitingRunner = createTourActionRunner({
    runtime,
    resolveTarget: (_id, signal) => new Promise((resolve) => signal.addEventListener('abort', () => resolve(null), { once: true })),
    presentTarget: async () => {},
    settleTarget: async () => {},
    clearPresenter: () => { clears += 1; },
  });
  const pending = waitingRunner.run([{ ...base, policy: 'required' }]);
  waitingRunner.cancel();
  assert.equal((await pending).status, 'cancelled');
  assert.ok(clears >= 4);
});

test('completion gate advances once only after current speech and action settle', () => {
  const advances = [];
  const gate = createTourCompletionGate((requestId) => advances.push(requestId));
  gate.begin(1);
  gate.markSpeech(1);
  assert.deepEqual(advances, []);
  gate.markAction(1);
  gate.markAction(1);
  assert.deepEqual(advances, [1]);

  gate.begin(2);
  gate.setPaused(true);
  gate.markAction(2);
  gate.markSpeech(2);
  assert.deepEqual(advances, [1]);
  gate.setPaused(false);
  assert.deepEqual(advances, [1, 2]);

  gate.begin(3);
  gate.markAction(2);
  gate.markSpeech(2);
  gate.cancel();
  gate.markAction(3);
  gate.markSpeech(3);
  assert.deepEqual(advances, [1, 2]);
});

test('browser speech controller retains utterances, ignores stale completion, and clears global pause', () => {
  const spoken = [];
  let cancelled = 0;
  let paused = true;
  const synth = {
    get paused() { return paused; },
    speak(utterance) { spoken.push(utterance); },
    cancel() { cancelled += 1; },
    pause() { paused = true; },
    resume() { paused = false; },
  };
  class FakeUtterance {
    constructor(text) { this.text = text; }
  }
  const completed = [];
  const errors = [];
  const speech = createBrowserSpeechController({ synth, Utterance: FakeUtterance });

  assert.equal(speech.available, true);
  speech.speak('First', { lang: 'en', onEnd: () => completed.push('first'), onError: (error) => errors.push(error) });
  assert.equal(paused, false);
  assert.equal(spoken[0].text, 'First');
  speech.speak('Second', { lang: 'en', onEnd: () => completed.push('second') });
  spoken[0].onend?.();
  assert.deepEqual(completed, []);
  spoken[1].onend?.();
  assert.deepEqual(completed, ['second']);

  speech.pause();
  assert.equal(paused, true);
  speech.cancel();
  assert.equal(paused, false);
  assert.ok(cancelled >= 3);
  assert.deepEqual(errors, []);
});

test('player integration stays semantic, localized, lazy, and lifecycle-owned', async () => {
  const [logic, template, runtime, main] = await Promise.all([
    readFile(new URL('../../src/ui-components/client-only/tour-player/tour-player.js', import.meta.url), 'utf8'),
    readFile(new URL('../../src/ui-components/client-only/tour-player/tour-player.tpl.js', import.meta.url), 'utf8'),
    readFile(new URL('../../src/static-pages/js/tour-player/index.js', import.meta.url), 'utf8'),
    readFile(new URL('../../src/static-pages/js/index.js', import.meta.url), 'utf8'),
  ]);
  assert.doesNotMatch(`${logic}\n${runtime}`, /onboundary|voiceschanged|triggerWord|querySelector\(intent\.target/);
  assert.doesNotMatch(runtime, /history\.(?:pushState|replaceState)/);
  assert.match(logic, /portfolio-tour-start/);
  assert.match(logic, /portfolio-tour-stop/);
  assert.match(logic, /portfolio-tour-complete/);
  assert.match(template, /data-tour-action="previous"/);
  assert.match(template, /data-tour-action="pause"/);
  assert.match(template, /data-tour-action="next"/);
  assert.match(template, /aria-live="polite"/);
  assert.match(main, /createRuntimeAssetUrl\('js\/tour-player\/index\.js'\)/);
  assert.doesNotMatch(main, /client-only\/tour-player\/tour-player\.js/);
});
