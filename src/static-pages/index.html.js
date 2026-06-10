import { getPage } from './getPage.js';
import { loadProjectEntries } from './data/projects.js';

const projects = loadProjectEntries();

export default await getPage({
  TITLE: 'Vladimir Matiasevich | Lead Engineer / R&D / Agentic AI',
  BODY_ATTRS: 'data-side-panel="off"',
  HEADER_CONTENT: /*html*/ `
    <button class="pulse-header-menu-button" type="button" aria-label="Open materials" title="Open materials">
      <span class="material-symbols-outlined" aria-hidden="true">folder</span>
    </button>
    <span class="pulse-header-title">Vladimir Matiasevich | Lead Engineer / R&D / Agentic AI</span>
    <cascade-theme-widget
      class="pulse-theme-widget"
      storage-key="symbiote-ui:cascade-theme-editor"
      target-selector=":root"></cascade-theme-widget>
  `,
  CONTENT: /*html*/ `
    <script type="application/json" id="pulse-projects-data">${JSON.stringify(projects).replace(/</g, '\\u003c')}</script>
    <section class="pulse-screen" aria-label="Vladimir Matiasevich portfolio">
      <portfolio-workspace class="pulse-workspace"></portfolio-workspace>
    </section>
  `,
  FOOTER_CONTENT: /*html*/ `
    <span>Built with JSDA and symbiote-ui</span>
    <a href="https://github.com/MakerDrive/cv">Source</a>
  `,
  SIDE_PANEL_ATTRS: 'disabled hidden',
});
