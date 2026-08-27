import BrowserTTSProvider from './BrowserTTSProvider.js';
import UIInteractor from './UIInteractor.js';

export default class TourPresenter {
  constructor(script) {
    this.script = script;
    this.currentIndex = 0;
    this.tts = new BrowserTTSProvider();
    this.interactor = new UIInteractor();
    this.isPlaying = false;
    this.isPaused = false;
  }

  async start() {
    await this.tts.init();
    this.isPlaying = true;
    this.currentIndex = 0;
    await this.#runLoop();
  }

  stop() {
    this.isPlaying = false;
    this.tts.stop();
    this.interactor.clearHighlight();
  }

  async #runLoop() {
    while (this.isPlaying && this.currentIndex < this.script.length) {
      if (this.isPaused) {
        await new Promise(r => setTimeout(r, 100));
        continue;
      }

      let step = this.script[this.currentIndex];
      await this.#executeStep(step);
      this.currentIndex++;
    }

    if (this.currentIndex >= this.script.length) {
      this.stop();
    }
  }

  #executeStep(step) {
    return new Promise(async (resolve) => {
      if (!step.text) {
        if (step.cues) {
          for (let cue of step.cues) {
            if (cue.action === 'click') await this.interactor.click(cue.selector);
            if (cue.action === 'highlight') await this.interactor.highlight(cue.selector);
          }
        }
        setTimeout(resolve, step.delay || 500);
        return;
      }

      let cuesExecuted = new Set();

      this.tts.speak(step.text, async (charIndex, charLength) => {
        if (!step.cues) return;

        let currentWord = step.text.substring(charIndex, charIndex + charLength).replace(/[^a-zA-Zа-яА-ЯёЁ0-9]/g, '').toLowerCase();

        for (let i = 0; i < step.cues.length; i++) {
          let cue = step.cues[i];
          if (!cuesExecuted.has(i) && currentWord === cue.word.toLowerCase()) {
            cuesExecuted.add(i);
            if (cue.action === 'click') await this.interactor.click(cue.selector);
            if (cue.action === 'highlight') await this.interactor.highlight(cue.selector);
            if (cue.action === 'clear') this.interactor.clearHighlight();
          }
        }
      }, () => {
        setTimeout(resolve, step.delay || 300);
      });
    });
  }
}
