import { html } from '@symbiotejs/symbiote';

export default html`
  <section class="tour-start" ${{ '@hidden': 'isPlaying' }} aria-labelledby="tour-intro-title">
    <h2 id="tour-intro-title">{{tourTitle}}</h2>
    <p>{{tourIntro}}</p>
    <p class="tour-status" role="status" aria-live="polite">{{statusText}}</p>
    <div class="tour-start-actions">
      <button type="button" data-tour-action="short" ${{ onclick: 'playShort', '@disabled': '!isReady' }}>{{lblShort}}</button>
      <button type="button" data-tour-action="full" ${{ onclick: 'playFull', '@disabled': '!isReady' }}>{{lblFull}}</button>
    </div>
  </section>

  <section class="tour-player" ${{ '@hidden': '!isPlaying' }} aria-labelledby="tour-step-title">
    <header>
      <h2 id="tour-step-title">{{stepTitle}}</h2>
      <output ${{ '@aria-label': 'stepProgressLabel' }}>{{stepProgress}}</output>
    </header>
    <p class="tour-description" aria-live="polite" aria-atomic="true">{{stepDescription}}</p>
    <p class="tour-status" role="status" aria-live="polite">{{statusText}}</p>
    <p class="tour-status tour-error" role="alert" ${{ '@hidden': '!isError' }}>{{errorText}}</p>
    <div class="tour-controls">
      <button type="button" data-tour-action="previous" ${{ onclick: 'previous', '@disabled': '!canPrevious', '@aria-label': 'lblPrevious', title: 'lblPrevious' }}><span class="material-symbols-outlined" aria-hidden="true">skip_previous</span></button>
      <button type="button" data-tour-action="pause" ${{ onclick: 'pauseResume', '@hidden': '!hasSpeech', '@aria-label': 'lblPauseAction', title: 'lblPauseAction' }}><span class="material-symbols-outlined" aria-hidden="true">{{pauseIcon}}</span></button>
      <button type="button" data-tour-action="stop" ${{ onclick: 'stop', '@aria-label': 'lblStop', title: 'lblStop' }}><span class="material-symbols-outlined" aria-hidden="true">stop</span></button>
      <button type="button" data-tour-action="retry" ${{ onclick: 'retry', '@hidden': '!isError', '@aria-label': 'lblRetry', title: 'lblRetry' }}><span class="material-symbols-outlined" aria-hidden="true">refresh</span></button>
      <button type="button" data-tour-action="next" ${{ onclick: 'next', '@hidden': 'canFinish', '@disabled': '!canNext', '@aria-label': 'lblNext', title: 'lblNext' }}><span class="material-symbols-outlined" aria-hidden="true">skip_next</span></button>
      <button type="button" data-tour-action="finish" ${{ onclick: 'next', '@hidden': '!canFinish', '@aria-label': 'lblFinish', title: 'lblFinish' }}><span class="material-symbols-outlined" aria-hidden="true">done</span></button>
    </div>
  </section>
`;
