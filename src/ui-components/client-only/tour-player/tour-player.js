import Symbiote from '@symbiotejs/symbiote';
import template from './tour-player.tpl.js';
import styles from './tour-player.css.js';
import TourPresenter from './TourPresenter.js';
import { shortTour, fullTour } from '../../../static-pages/data/tourScripts.js';

export default class TourPlayer extends Symbiote {
  init$ = {
    isPlaying: false,
    playShort: () => {
      this.#play(shortTour);
    },
    playFull: () => {
      this.#play(fullTour);
    },
    stopTour: () => {
      if (this.#presenter) {
        this.#presenter.stop();
      }
      this.$.isPlaying = false;
    },
  }

  #presenter = null;

  #play(script) {
    if (this.#presenter) {
      this.#presenter.stop();
    }
    this.#presenter = new TourPresenter(script);
    this.#presenter.tts.unlock();
    this.$.isPlaying = true;
    this.#presenter.start().then(() => {
      this.$.isPlaying = false;
    });
  }

  renderCallback() {
    document.addEventListener('portfolio-start-tour', () => {
      if (this.#presenter?.isPlaying) {
        this.init$.stopTour();
      } else {
        this.init$.playShort();
      }
    });
  }
}

TourPlayer.template = template;
TourPlayer.rootStyles = styles;
TourPlayer.reg('tour-player');
