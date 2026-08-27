export default class UIInteractor {
  #highlightEl;

  constructor() {
    this.#highlightEl = document.createElement('div');
    this.#highlightEl.setAttribute('tour-highlight', '');
    this.#highlightEl.hidden = true;
    document.body.appendChild(this.#highlightEl);
  }

  async ensureVisible(selector) {
    let el = document.querySelector(selector);
    if (!el) return null;

    if (el.closest('side-panel')) {
      let sidePanel = document.querySelector('side-panel');
      if (sidePanel && window.getComputedStyle(sidePanel).transform !== 'none') {
        let menuBtn = /** @type {HTMLElement} */ (document.querySelector('.pulse-header-menu-button'));
        if (menuBtn) {
          menuBtn.click();
          await this.#waitForTransition(sidePanel);
        }
      }
    }

    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    await this.#waitForScroll();

    return el;
  }

  async highlight(selector) {
    let el = await this.ensureVisible(selector);
    if (!el) {
      this.clearHighlight();
      return;
    }

    let rect = el.getBoundingClientRect();
    let pad = 4;
    Object.assign(this.#highlightEl.style, {
      top: `${rect.top + window.scrollY - pad}px`,
      left: `${rect.left + window.scrollX - pad}px`,
      width: `${rect.width + pad * 2}px`,
      height: `${rect.height + pad * 2}px`,
    });
    this.#highlightEl.hidden = false;
  }

  async click(selector) {
    let el = /** @type {HTMLElement} */ (await this.ensureVisible(selector));
    if (el) {
      await this.highlight(selector);
      await new Promise(r => setTimeout(r, 200));
      el.click();
    }
  }

  clearHighlight() {
    this.#highlightEl.hidden = true;
  }

  destroy() {
    this.#highlightEl.remove();
  }

  #waitForTransition(el) {
    return new Promise((resolve) => {
      let handler = () => {
        el.removeEventListener('transitionend', handler);
        resolve();
      };
      el.addEventListener('transitionend', handler);
      setTimeout(resolve, 600);
    });
  }

  #waitForScroll() {
    return new Promise((resolve) => {
      let timer;
      let handler = () => {
        clearTimeout(timer);
        timer = setTimeout(() => {
          document.removeEventListener('scroll', handler, true);
          resolve();
        }, 100);
      };
      document.addEventListener('scroll', handler, true);
      setTimeout(() => {
        document.removeEventListener('scroll', handler, true);
        resolve();
      }, 600);
      handler();
    });
  }
}
