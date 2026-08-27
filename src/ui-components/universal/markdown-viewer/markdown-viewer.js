import Symbiote from '@symbiotejs/symbiote';
import template from './markdown-viewer.tpl.js';
import styles from './markdown-viewer.css.js';

const ALLOWED_URL_PROTOCOLS = new Set(['http:', 'https:', 'mailto:', 'tel:']);

function isSafeUrl(value) {
  let raw = String(value || '').trim();
  if (!raw || raw.startsWith('#') || raw.startsWith('/') || raw.startsWith('./') || raw.startsWith('../')) {
    return true;
  }
  try {
    return ALLOWED_URL_PROTOCOLS.has(new URL(raw, window.location.href).protocol);
  } catch {
    return false;
  }
}

/**
 * Sanitizes markdown-generated HTML to remove scripts, styles, and unsafe URLs.
 * @param {string} html - The raw HTML string to sanitize.
 * @returns {string} The sanitized HTML string.
 */
export function sanitizeMarkdownHtml(html) {
  let template = document.createElement('template');
  template.innerHTML = String(html || '');

  template.content.querySelectorAll('script, style, iframe, object, embed, form').forEach((element) => {
    element.remove();
  });
  template.content.querySelectorAll('*').forEach((element) => {
    [...element.attributes].forEach((attribute) => {
      let name = attribute.name.toLowerCase();
      if (name.startsWith('on') || (name === 'href' || name === 'src') && !isSafeUrl(attribute.value)) {
        element.removeAttribute(attribute.name);
      }
    });
  });

  return template.innerHTML;
}

export class MarkdownViewer extends Symbiote {
  init$ = {
    renderedHtml: '<p>Loading Markdown…</p>',
  };

  #loadStarted = false;

  renderCallback() {
    if (this.#loadStarted) return;
    this.#loadStarted = true;
    void this.loadMarkdown();
  }

  async loadMarkdown() {
    let sourceUrl = this.getAttribute('src')?.trim();
    if (!sourceUrl) {
      this.$.renderedHtml = '<p role="alert">Markdown source is missing.</p>';
      return;
    }

    try {
      let response = await fetch(sourceUrl);
      if (!response.ok) throw new Error(`Markdown request failed: ${response.status}`);
      let markdown = await response.text();
      let { md2html } = await import('jsda-kit/iso/md2html.js');
      let renderedHtml = await md2html(markdown, {
        externalLinks: { enabled: true },
      });
      this.$.renderedHtml = sanitizeMarkdownHtml(renderedHtml);
    } catch (error) {
      this.$.renderedHtml = '<p role="alert">Unable to load this Markdown document.</p>';
    }
  }
}

MarkdownViewer.template = template;
MarkdownViewer.rootStyles = styles;
MarkdownViewer.reg('markdown-viewer');
