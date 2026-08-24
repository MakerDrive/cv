import { html } from '@symbiotejs/symbiote';

export default html`
  <div class="markdown-viewer-content" ${{innerHTML: 'renderedHtml'}}></div>
`;
