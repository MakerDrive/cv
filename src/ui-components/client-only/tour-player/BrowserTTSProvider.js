export default class BrowserTTSProvider {
  constructor() {
    this.synth = 'speechSynthesis' in window ? window.speechSynthesis : null;
    this.voice = null;
    this.utterance = null;
    this.available = Boolean(this.synth);
  }

  unlock() {
    if (this.synth) {
      let u = new SpeechSynthesisUtterance('');
      u.volume = 0;
      this.synth.speak(u);
    }
  }

  init() {
    if (!this.synth) {
      return Promise.resolve();
    }
    return new Promise((resolve) => {
      let voices = this.synth.getVoices();
      if (voices.length > 0) {
        this.#selectVoice(voices);
        resolve();
      } else {
        this.synth.onvoiceschanged = () => {
          this.#selectVoice(this.synth.getVoices());
          resolve();
        };
      }
    });
  }

  #selectVoice(voices) {
    let lang = document.documentElement.lang || 'ru';
    let filtered = voices.filter(v => v.lang.startsWith(lang));
    this.voice = filtered.find(v => v.name.includes('Google') || v.name.includes('Premium') || v.name.includes('Yuri') || v.name.includes('Milena')) || filtered[0] || voices[0];
  }

  speak(text, onBoundary, onEnd) {
    if (!this.synth) {
      onEnd?.();
      return;
    }
    this.stop();
    if (!this.voice) {
      this.#selectVoice(this.synth.getVoices());
    }

    this.utterance = new SpeechSynthesisUtterance(text);
    this.utterance.voice = this.voice;
    this.utterance.rate = 1.0;
    this.utterance.pitch = 1.0;

    if (onBoundary) {
      this.utterance.onboundary = (e) => {
        if (e.name === 'word') {
          onBoundary(e.charIndex, e.charLength);
        }
      };
    }

    if (onEnd) {
      this.utterance.onend = () => onEnd();
      this.utterance.onerror = () => onEnd();
    }

    this.synth.speak(this.utterance);
  }

  stop() {
    if (this.synth?.speaking) {
      this.synth.cancel();
    }
  }
}
