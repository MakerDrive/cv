import { html } from '@symbiotejs/symbiote';

export default html`
<div class="controls">
  <span>Tour:</span>
  <button ${{onclick: 'playShort', '@hidden': 'isPlaying'}}>Short</button>
  <button ${{onclick: 'playFull', '@hidden': 'isPlaying'}}>Full</button>
  <button ${{onclick: 'stopTour', '@hidden': '!isPlaying'}} stop>Stop</button>
</div>
`;
