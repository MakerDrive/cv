import Symbiote from '@symbiotejs/symbiote';
import { TOUR_LOCALE_MESSAGES } from '../../../static-pages/data/tourTranslations.js';
import { createTourCompletionGate } from '../../../static-pages/js/tour-player/playback.js';
import { createBrowserSpeechController } from '../../../static-pages/js/tour-player/speech.js';
import template from './tour-player.tpl.js';
import styles from './tour-player.css.js';

function formatProgress(message, current, total) {
  return message.replace('{current}', String(current)).replace('{total}', String(total));
}

export class TourPlayer extends Symbiote {
  init$ = {
    isReady: false,
    isPlaying: false,
    isPaused: false,
    canPrevious: false,
    canNext: false,
    canFinish: false,
    hasSpeech: false,
    isError: false,
    stepTitle: '',
    stepProgress: '',
    stepProgressLabel: '',
    stepDescription: '',
    statusText: '',
    errorText: '',
    tourTitle: '',
    tourIntro: '',
    lblShort: '',
    lblFull: '',
    lblPrevious: '',
    lblNext: '',
    lblStop: '',
    lblPause: '',
    lblResume: '',
    lblPauseAction: '',
    lblRetry: '',
    lblFinish: '',
    pauseIcon: 'pause',
    playShort: () => this.#start('short'),
    playFull: () => this.#start('full'),
    previous: () => this.#previous(),
    next: () => this.#next(),
    retry: () => this.#presentBeat(),
    stop: () => this.stopTour({ focusStart: true }),
    pauseResume: () => this.#pauseResume(),
  };

  #story = null;
  #beats = [];
  #beatIndex = -1;
  #requestId = 0;
  #speech = createBrowserSpeechController();
  #gate = createTourCompletionGate((requestId) => {
    if (requestId === this.#requestId && this.$.isPlaying && !this.$.isError) this.#next();
  });

  #onResult = (event) => {
    if (event.detail?.requestId !== this.#requestId) return;
    const status = event.detail?.status;
    this.$.isError = status === 'required-missing';
    this.$.errorText = this.$.isError ? this.#message('tour.error.required') : '';
    this.$.statusText = status === 'optional-missing' ? this.#message('tour.error.optional') : '';
    if (status === 'success' || status === 'optional-missing') this.#gate.markAction(this.#requestId);
  };

  connectedCallback() {
    super.connectedCallback();
    this.$.hasSpeech = this.#speech.available;
    this.#localize();
    this.#loadStory();
    this.addEventListener('portfolio-tour-result', this.#onResult);
  }

  disconnectedCallback() {
    this.removeEventListener('portfolio-tour-result', this.#onResult);
    this.stopTour();
    super.disconnectedCallback();
  }

  get isPlaying() {
    return this.$.isPlaying;
  }

  focusFirstControl() {
    /** @type {HTMLElement | null} */ (
      this.querySelector('button:not([hidden]):not(:disabled)')
    )?.focus();
  }

  stopTour({ focusStart = false, completed = false } = {}) {
    const wasPlaying = this.$.isPlaying;
    this.#speech.cancel();
    this.#gate.cancel();
    this.#requestId += 1;
    this.#beats = [];
    this.#beatIndex = -1;
    this.$.isPlaying = false;
    this.$.isPaused = false;
    this.$.isError = false;
    this.$.canPrevious = false;
    this.$.canNext = false;
    this.$.canFinish = false;
    this.$.stepTitle = '';
    this.$.stepProgress = '';
    this.$.stepProgressLabel = '';
    this.$.stepDescription = '';
    this.$.errorText = '';
    this.$.statusText = '';
    this.$.pauseIcon = 'pause';
    this.$.lblPauseAction = this.$.lblPause;
    if (wasPlaying) {
      this.dispatchEvent(new CustomEvent(
        completed ? 'portfolio-tour-complete' : 'portfolio-tour-stop',
        { bubbles: true, composed: true },
      ));
    }
    if (focusStart && this.isConnected) queueMicrotask(() => this.focusFirstControl());
  }

  #loadStory() {
    const source = document.getElementById('pulse-tour-story')?.textContent || '';
    try {
      const story = JSON.parse(source);
      const beatIds = story?.beats?.map((beat) => beat.id) || [];
      const localeIds = story?.locales?.en?.beats?.map((beat) => beat.id) || [];
      const modesValid = ['short', 'full'].every((mode) => (
        Array.isArray(story?.modes?.[mode]) && story.modes[mode].every((id) => beatIds.includes(id))
      ));
      this.#story = story;
      this.$.isReady = modesValid && beatIds.length > 0 && beatIds.join('/') === localeIds.join('/');
    } catch {
      this.#story = null;
      this.$.isReady = false;
    }
    this.$.statusText = this.$.isReady ? '' : this.#message('tour.dataUnavailable');
  }

  #localize() {
    this.$.tourTitle = this.#message('panel.tour');
    this.$.tourIntro = this.#message('tour.intro');
    this.$.lblShort = this.#message('tour.short');
    this.$.lblFull = this.#message('tour.full');
    this.$.lblPrevious = this.#message('tour.previous');
    this.$.lblNext = this.#message('tour.next');
    this.$.lblStop = this.#message('tour.stop');
    this.$.lblPause = this.#message('tour.pause');
    this.$.lblResume = this.#message('tour.resume');
    this.$.lblPauseAction = this.$.lblPause;
    this.$.lblRetry = this.#message('tour.retry');
    this.$.lblFinish = this.#message('tour.finish');
  }

  #message(key) {
    const locale = document.documentElement.lang || 'en';
    const messages = TOUR_LOCALE_MESSAGES[locale] || TOUR_LOCALE_MESSAGES.en;
    return messages[key] || TOUR_LOCALE_MESSAGES.en[key] || '';
  }

  #start(mode) {
    if (!this.$.isReady) return;
    const locale = document.documentElement.lang || 'en';
    const localized = this.#story.locales[locale] || this.#story.locales.en;
    const copyById = new Map(localized.beats.map((beat) => [beat.id, beat]));
    const manifestById = new Map(this.#story.beats.map((beat) => [beat.id, beat]));
    this.#beats = this.#story.modes[mode].map((id) => ({
      ...copyById.get(id),
      intents: manifestById.get(id).intents,
    }));
    this.#beatIndex = 0;
    this.$.isPlaying = true;
    this.$.isPaused = false;
    this.$.isError = false;
    this.$.statusText = '';
    this.dispatchEvent(new CustomEvent('portfolio-tour-start', { bubbles: true, composed: true }));
    this.#presentBeat();
  }

  #previous() {
    if (this.#beatIndex <= 0) return;
    this.#beatIndex -= 1;
    this.#presentBeat();
  }

  #next() {
    if (!this.$.isPlaying) return;
    if (this.#beatIndex >= this.#beats.length - 1) {
      this.stopTour({ completed: true });
      /** @type {HTMLElement | null} */ (document.querySelector('.pulse-tour-button'))?.focus();
      return;
    }
    this.#beatIndex += 1;
    this.#presentBeat();
  }

  #pauseResume() {
    if (!this.$.hasSpeech) return;
    this.$.isPaused = !this.$.isPaused;
    this.$.pauseIcon = this.$.isPaused ? 'play_arrow' : 'pause';
    this.$.lblPauseAction = this.$.isPaused ? this.$.lblResume : this.$.lblPause;
    this.#gate.setPaused(this.$.isPaused);
    if (this.$.isPaused) this.#speech.pause();
    else this.#speech.resume();
  }

  #presentBeat() {
    const beat = this.#beats[this.#beatIndex];
    if (!beat) return;
    this.#speech.cancel();
    this.#requestId += 1;
    const requestId = this.#requestId;
    this.#gate.begin(requestId);
    this.$.isError = false;
    this.$.errorText = '';
    this.$.statusText = '';
    this.$.isPaused = false;
    this.$.pauseIcon = 'pause';
    this.$.lblPauseAction = this.$.lblPause;
    this.$.canPrevious = this.#beatIndex > 0;
    this.$.canNext = this.#beatIndex < this.#beats.length - 1;
    this.$.canFinish = !this.$.canNext;
    this.$.stepTitle = beat.title;
    this.$.stepDescription = beat.text;
    this.$.stepProgress = `${this.#beatIndex + 1} / ${this.#beats.length}`;
    this.$.stepProgressLabel = formatProgress(this.#message('tour.progress'), this.#beatIndex + 1, this.#beats.length);

    this.dispatchEvent(new CustomEvent('portfolio-tour-phase', {
      bubbles: true,
      composed: true,
      detail: { intents: beat.intents, requestId },
    }));

    const speaking = this.#speech.speak(beat.text, {
      lang: document.documentElement.lang || 'en',
      onEnd: () => this.#gate.markSpeech(requestId),
      onError: () => {
        if (requestId === this.#requestId) this.$.statusText = this.#message('tour.error.speech');
      },
    });
    if (!speaking) this.$.statusText = this.#message('tour.unavailable');
  }
}

TourPlayer.template = template;
TourPlayer.rootStyles = styles;
TourPlayer.reg('tour-player');
