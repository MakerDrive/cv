import 'symbiote-ui/chat/show-chat';
import { ShowSessionState } from 'symbiote-ui/chat/show-runtime';
import { TOUR_LOCALE_MESSAGES } from '../../../static-pages/data/tourTranslations.js';
import {
  createCvShowMockAgentProvider,
  resolveTrustedCvContactAction,
} from '../../../static-pages/js/tour-player/mockAgentProvider.js';
import {
  createCvShowAlignmentController,
  partitionCvShowAlignedDirectives,
} from '../../../static-pages/js/tour-player/showAlignmentAdapter.js';
import { createCvShowNarrationController } from '../../../static-pages/js/tour-player/localNarration.js';
import {
  createCvShowPlaybackEntries,
  createCvShowPresentationContext,
} from '../../../static-pages/js/tour-player/presentationContext.js';
import { createBrowserSpeechController } from '../../../static-pages/js/tour-player/speech.js';
import { createCvShowMessageStream } from '../../../static-pages/js/tour-player/messageStream.js';

function formatProgress(message, current, total) {
  return message.replace('{current}', String(current)).replace('{total}', String(total));
}

function actionPart(id, actions, payload = null) {
  return {
    type: 'actions',
    id,
    payload,
    actions: actions.map((action, index) => ({
      ...action,
      variant: index === 0 ? 'primary' : 'ghost',
    })),
  };
}

/** @param {any} story @param {'short' | 'full'} [mode] */
function playerTimeline(story, mode = 'short') {
  return Object.freeze({
    title: 'CV Show',
    turns: Object.freeze(createCvShowPlaybackEntries(story, mode).map((entry) => Object.freeze({
      id: entry.id,
      persona: entry.sceneId ? 'Detail' : 'CV',
      text: entry.title || entry.id,
    }))),
  });
}

export class PortfolioShowChat extends HTMLElement {
  init$ = {
    isReady: false,
    isRunning: false,
    isPaused: false,
    isError: false,
    inBranch: false,
    resumeRequired: false,
    hasDetails: false,
    hasSkippableMedia: false,
    mediaBlocksResume: false,
    statusText: '',
    errorText: '',
    progressText: '',
    progressLabel: '',
    tourTitle: '',
    tourIntro: '',
    lblDetails: '',
    lblReturn: '',
    lblResume: '',
    lblSkipMedia: '',
  };

  #story = null;
  /** @type {'' | 'short' | 'full'} */
  #mode = '';
  #playbackEntries = [];
  #sceneIndex = -1;
  #requestId = 0;
  #messages = [];
  #currentMessageId = '';
  #dock = null;
  #agent = null;
  #showPlayer = null;
  #controller = null;
  #configured = false;
  #trustedContactAction = '';
  #speech = createCvShowNarrationController({
    browserSpeech: createBrowserSpeechController(),
    url: globalThis.location?.href,
    baseUrl: globalThis.document?.baseURI,
  });
  /** @type {Promise<any>} */
  #narrationReady = Promise.resolve();
  #alignment = createCvShowAlignmentController({
    url: globalThis.location?.href,
    baseUrl: globalThis.document?.baseURI,
  });
  /** @type {Promise<any>} */
  #alignmentReady = Promise.resolve();
  #alignedEntry = null;
  #lastAlignedCue = null;
  #lastAlignedReset = null;
  #lastAlignedSeekFailure = null;
  #lastAlignedGenerationReceipt = null;
  #branchReturnPlayback = null;
  #session = new ShowSessionState();
  #audioArbiter = null;
  #speechToken = null;
  #activeSpeechEntry = null;
  #messageStreams = new Map();

  constructor() {
    super();
    this.$ = { ...this.init$ };
  }

  #onResult = (event) => {
    if (event.detail?.requestId !== this.#requestId) return;
    const requiredMissing = event.detail?.status === 'required-missing';
    this.$.isError = requiredMissing;
    this.$.errorText = requiredMissing ? this.#message('tour.error.required') : '';
    if (requiredMissing) {
      this.#appendSystemMessage(this.$.errorText, { error: true });
    } else if (event.detail?.status === 'optional-missing') {
      this.#appendSystemMessage(this.#message('tour.error.optional'));
    }
  };

  #onAgentResponse = (event) => {
    const request = event.detail?.request || {};
    if (request.type === 'message' && String(request.input || '').trim()) {
      this.#messages.push({
        id: `mock.user.${this.#messages.length}`,
        role: 'user',
        parts: [{ type: 'text', text: String(request.input).trim() }],
      });
    }
    for (const message of event.detail?.messages || []) {
      if (message?.role !== 'agent') {
        this.#messages.push(message);
        continue;
      }
      const textPart = message.parts?.find?.(({ type }) => type === 'text');
      const trailingParts = message.parts?.filter?.((part) => part !== textPart) || [];
      if (textPart) this.#appendStreamedMessage(message.id || `mock.agent.${this.#messages.length}`, textPart.text, trailingParts);
      else this.#messages.push(message);
    }
    this.#syncMessages();
  };

  #onAgentAction = (event) => {
    const { actionId, payload } = event.detail || {};
    const contactUrl = resolveTrustedCvContactAction(actionId, this.#trustedContactAction);
    this.#trustedContactAction = '';
    if (contactUrl) {
      globalThis.open?.(contactUrl, '_blank', 'noopener,noreferrer');
      return;
    }
    if (actionId === 'start-short') void this.#start('short');
    else if (actionId === 'start-full') void this.#start('full');
    else if (actionId === 'details') this.#enterDetails(payload?.branchId);
    else if (actionId === 'return') this.#returnFromDetails();
    else if (actionId === 'resume') void this.#resume();
    else if (actionId === 'skip-media') this.#skipMedia();
    else if (['projects', 'resume', 'contact'].includes(actionId)) this.#emitProductAction(actionId);
  };

  #captureTrustedContactClick = (event) => {
    const button = event.target?.closest?.('[data-action-id]');
    if (!event.isTrusted || !button || !this.#dock?.contains(button)) return;
    const actionId = String(button.dataset.actionId || '');
    if (!resolveTrustedCvContactAction(actionId, actionId)) return;
    this.#trustedContactAction = actionId;
    setTimeout(() => {
      if (this.#trustedContactAction === actionId) this.#trustedContactAction = '';
    }, 0);
  };

  #onDockReady = (event) => {
    this.#agent = event.detail?.chat || this.#dock?.getChat?.() || null;
    this.#configureVoiceInput();
  };

  set agentDock(value) {
    this.#dock = value || null;
  }

  set audioArbiter(value) {
    this.#audioArbiter = value || null;
  }

  connectedCallback() {
    this.#dock ||= this.closest('agent-dock-shell');
    if (!this.#dock) return;
    this.#localize();
    this.#loadStory();
    this.#controller ||= this.#createPlayerController();
    this.#narrationReady = Promise.resolve(this.#speech.snapshot);
    this.#alignmentReady = Promise.resolve(this.#alignment.snapshot);
    this.addEventListener('portfolio-show-result', this.#onResult);
    this.#dock.addEventListener('agent-show-action', this.#onAgentAction);
    this.#dock.addEventListener('agent-show-response', this.#onAgentResponse);
    this.#dock.addEventListener('agent-dock-ready', this.#onDockReady);
    this.#dock.addEventListener('click', this.#captureTrustedContactClick, { capture: true });
    this.#configureSharedChat();
  }

  disconnectedCallback() {
    this.removeEventListener('portfolio-show-result', this.#onResult);
    this.#dock?.removeEventListener('agent-show-action', this.#onAgentAction);
    this.#dock?.removeEventListener('agent-show-response', this.#onAgentResponse);
    this.#dock?.removeEventListener('agent-dock-ready', this.#onDockReady);
    this.#dock?.removeEventListener('click', this.#captureTrustedContactClick, { capture: true });
    this.stopShow();
  }

  focusFirstControl() {
    queueMicrotask(() => {
      const composer = this.#dock?.getChat?.()?.getWorkspace?.()?.getComposer?.();
      (composer?.querySelector?.('textarea, input, [contenteditable="true"]')
        || this.#dock?.querySelector('chat-show-player button:not(:disabled)'))?.focus?.();
    });
  }

  openShow() {
    this.#configureVoiceInput();
  }

  get narrationSnapshot() {
    return this.#speech.snapshot;
  }

  get alignmentSnapshot() {
    return Object.freeze({
      ...this.#alignment.snapshot,
      activeId: this.#alignedEntry?.entryId || '',
      alignedSequenceHash: this.#alignedEntry?.alignedSequenceHash || '',
      mediaHash: this.#alignedEntry?.mediaHash || '',
      exactCueCount: this.#alignedEntry?.exactCueCount || 0,
      segmentCueCount: this.#alignedEntry?.segmentCueCount || 0,
      lastCueId: this.#lastAlignedCue?.source?.id || '',
      lastCueTimeMs: this.#lastAlignedCue?.cueTimeMs ?? null,
      lastMediaTimeMs: this.#lastAlignedCue?.mediaTimeMs ?? null,
      lastAlignmentSource: this.#lastAlignedCue?.cue?.alignment?.provenance?.source || '',
      lastAlignmentResolution: this.#lastAlignedCue?.cue?.alignment?.resolution || '',
      lastCueReason: this.#lastAlignedCue?.reason || '',
      lastResetReason: this.#lastAlignedReset?.reason || '',
      lastSeekFailure: this.#lastAlignedSeekFailure,
      lastGenerationReceipt: this.#lastAlignedGenerationReceipt,
      playbackClockState: this.#alignedEntry?.runtime?.playbackClockState || null,
      narrationPositionMs: Math.max(0, Math.round(Number(this.#speech.media?.currentTime || 0) * 1000)),
    });
  }

  emitShowDirective(directive) {
    const event = this.#session.emit(directive);
    if (directive.type === 'footnote' && directive.text) {
      this.#appendPartToCurrentMessage({
        type: 'footnote',
        text: directive.text,
        meta: { referenceId: directive.referenceId || directive.id || '' },
      });
    }
    if (directive.type === 'status' && directive.text) {
      this.#appendSystemMessage(directive.text);
    }
    if (directive.type === 'actions' && directive.actions?.length) {
      this.#appendActionMessage(
        directive.id || `show-actions-${this.#messages.length}`,
        directive.actions,
        { source: 'scenario', targetId: directive.context?.targetId || '' },
      );
    }
    return event;
  }

  pauseShow(reason = 'explicit') {
    if (!this.$.isRunning || this.$.isPaused) return false;
    this.$.isPaused = true;
    this.$.resumeRequired = true;
    this.#speech.pause();
    const positionMs = Math.max(0, Math.round(Number(this.#speech.media?.currentTime || 0) * 1000));
    this.#session.setPlayback({
      ...this.#session.snapshot.playback,
      positionMs,
      playbackState: 'paused',
    });
    this.#session.pause(reason);
    this.dispatchEvent(new CustomEvent('portfolio-show-pause', {
      detail: { reason },
      bubbles: true,
      composed: true,
    }));
    this.$.statusText = this.#message('tour.status.paused');
    if (!this.$.mediaBlocksResume) {
      this.#appendSystemMessage(this.$.statusText, {
        actions: [{ id: 'resume', label: this.$.lblResume, icon: 'play_arrow' }],
        actionId: 'show-resume',
      });
    }
    this.#syncPlayer();
    return true;
  }

  beginMediaPlayback({ skippable = false } = {}) {
    this.$.hasSkippableMedia = skippable;
    this.$.mediaBlocksResume = true;
    this.pauseShow('media-audio');
    if (skippable) {
      this.#appendActionMessage('show-skip-media', [
        { id: 'skip-media', label: this.$.lblSkipMedia, icon: 'skip_next' },
      ], { source: 'media' });
    }
  }

  endMediaPlayback() {
    this.$.hasSkippableMedia = false;
    this.$.mediaBlocksResume = false;
    if (this.$.resumeRequired) {
      this.#appendSystemMessage(this.#message('tour.status.paused'), {
        actions: [{ id: 'resume', label: this.$.lblResume, icon: 'play_arrow' }],
        actionId: 'show-resume-after-media',
      });
    }
    this.#syncPlayer();
  }

  stopShow({ focusStart = false, completed = false } = {}) {
    const wasRunning = this.$.isRunning;
    this.#requestId += 1;
    this.#stopSpeech('show-stopped');
    this.#cancelMessageStreams();
    this.$.isRunning = false;
    this.$.isPaused = false;
    this.$.isError = false;
    this.$.inBranch = false;
    this.$.resumeRequired = false;
    this.$.hasDetails = false;
    this.$.hasSkippableMedia = false;
    this.$.mediaBlocksResume = false;
    this.$.statusText = '';
    this.$.errorText = '';
    this.#branchReturnPlayback = null;
    this.#mode = '';
    this.#playbackEntries = [];
    this.#sceneIndex = -1;
    this.#syncPlayer(completed ? 'completed' : 'stopped');
    this.#dock?.removeShow?.('short', { stop: false });
    this.#showPlayer = null;
    if (wasRunning && !completed) this.#appendModeSelectionMessage();
    if (wasRunning) {
      this.dispatchEvent(new CustomEvent(
        completed ? 'portfolio-show-complete' : 'portfolio-show-stop',
        { bubbles: true, composed: true },
      ));
    }
    if (focusStart && this.isConnected) queueMicrotask(() => this.focusFirstControl());
  }

  #appendModeSelectionMessage() {
    this.#appendAgentMessage({ id: `mode-selection-${this.#requestId}` }, {
      text: this.$.tourIntro,
      actions: [
        { id: 'start-short', label: this.#message('tour.short'), icon: 'play_arrow' },
        { id: 'start-full', label: this.#message('tour.full'), icon: 'playlist_play' },
      ],
      payload: { intent: 'show-mode' },
    });
  }

  #configureSharedChat() {
    if (!this.#dock || !this.#story || this.#configured) return;
    this.#configured = true;
    const locale = document.documentElement.lang || 'en';
    this.#dock.setAgentProvider(createCvShowMockAgentProvider({ locale }));
    this.#messages = [{
      id: 'show-intro',
      role: 'agent',
      parts: [
        { type: 'text', text: this.$.tourIntro },
        actionPart('show-mode-selection', [
          { id: 'start-short', label: this.#message('tour.short'), icon: 'play_arrow' },
          { id: 'start-full', label: this.#message('tour.full'), icon: 'playlist_play' },
        ], { intent: 'show-mode' }),
      ],
    }];
    if (!this.$.isReady && this.$.statusText) {
      this.#messages.push({
        id: 'show-unavailable',
        role: 'system',
        parts: [{ type: 'error', text: this.$.statusText }],
      });
    }
    this.#syncMessages();
    this.#configureVoiceInput();
  }

  #configureVoiceInput() {
    const workspace = this.#agent?.getWorkspace?.() || this.#dock?.getChat?.()?.getWorkspace?.();
    workspace?.setVoiceControls?.({
      input: { visible: true, enabled: true, state: 'idle' },
      language: { mode: document.documentElement.lang || 'en' },
    });
  }

  #showConfig() {
    const entry = this.#currentEntry();
    return {
      controller: this.#controller,
      timeline: playerTimeline(this.#story, this.#mode || 'short'),
      state: {
        index: Math.max(0, this.#sceneIndex),
        playing: this.$.isRunning && !this.$.isPaused,
        caption: {
          speaker: entry?.sceneId ? this.#message('tour.details') : 'CV',
          text: entry?.subtitle || '',
        },
        tts: entry ? {
          label: this.#message('tour.tts'),
          text: entry.speech,
          status: this.$.isPaused ? 'paused' : this.$.isRunning ? 'playing' : 'idle',
        } : {},
      },
      title: this.$.tourTitle,
      autoplay: false,
      captions: true,
      settings: true,
      closable: true,
      videoController: this.#videoController,
      videoControls: this.#videoControls(entry),
    };
  }

  #mountSharedShow() {
    if (!this.#dock || !this.#story || !this.#controller || !this.#mode) return null;
    this.#agent = this.#dock.getChat?.() || this.#agent;
    this.#showPlayer = this.#dock.setShow('short', this.#showConfig()) || this.#showPlayer;
    return this.#showPlayer;
  }

  #createPlayerController() {
    const host = this;
    return {
      onIndexChange: null,
      onStateChange: null,
      get index() { return Math.max(0, host.#sceneIndex); },
      get isPlaying() { return host.$.isRunning && !host.$.isPaused; },
      get isPaused() { return host.$.isPaused; },
      play() {
        if (!host.$.isRunning && host.#mode) void host.#start(host.#mode);
        else if (host.$.isPaused) void host.#resume();
      },
      toggle() {
        if (host.$.isRunning && !host.$.isPaused) host.pauseShow('explicit-control');
        else this.play();
      },
      pause() { host.pauseShow('explicit-control'); },
      prev() { host.#step(-1); },
      next() { host.#step(1); },
      stop() { host.stopShow({ focusStart: true }); },
      preview(index) { void host.#preview(index); },
    };
  }

  #videoController = Object.freeze({
    play: (request) => {
      const entry = this.#currentEntry();
      const directive = entry?.directives?.find(({ type, id }) => (
        type === 'media' && id === request?.id
      ));
      if (!directive || request?.semantics !== 'detail') return false;
      this.dispatchEvent(new CustomEvent('portfolio-show-phase', {
        bubbles: true,
        composed: true,
        detail: {
          directives: [directive],
          aligned: false,
          requestId: `video:${entry.id}:${directive.id}`,
        },
      }));
      return true;
    },
  });

  #videoControls(entry) {
    return (entry?.directives || []).filter(({ type }) => type === 'media').map((directive) => {
      const detail = directive.mode === 'full-with-media-audio';
      return {
        id: directive.id,
        action: 'play',
        semantics: detail ? 'detail' : 'pointer-only',
        label: this.#message(detail ? 'tour.video.detail' : 'tour.video.pointer'),
        glyph: detail ? 'play_circle' : 'visibility',
      };
    });
  }

  #notifyController(state = null) {
    this.#controller?.onIndexChange?.(Math.max(0, this.#sceneIndex));
    this.#controller?.onStateChange?.(state || (
      this.$.isRunning ? (this.$.isPaused ? 'paused' : 'playing') : 'stopped'
    ));
  }

  #loadStory() {
    const source = document.getElementById('pulse-tour-story')?.textContent || '';
    try {
      const story = JSON.parse(source);
      const sceneIds = new Set(story?.scenes?.map((scene) => scene.id) || []);
      const branchesValid = Object.values(story?.branches || {}).every((branch) => (
        sceneIds.has(branch.sceneId) && branch.return?.resume === 'paused'
      ));
      this.#story = story;
      this.$.isReady = story?.version === 1
        && story?.narrationLocale === 'ru'
        && story.short?.length === 16
        && Object.keys(story.branches || {}).length === 14
        && story.short.every((id) => sceneIds.has(id))
        && branchesValid;
    } catch {
      this.#story = null;
      this.$.isReady = false;
    }
    this.$.statusText = this.$.isReady ? '' : this.#message('tour.dataUnavailable');
  }

  #localize() {
    this.$.tourTitle = this.#message('panel.tour');
    this.$.tourIntro = this.#message('tour.intro');
    this.$.lblDetails = this.#message('tour.details');
    this.$.lblReturn = this.#message('tour.return');
    this.$.lblResume = this.#message('tour.resume');
    this.$.lblSkipMedia = this.#message('tour.skipMedia');
  }

  #message(key) {
    const locale = document.documentElement.lang || 'en';
    const messages = TOUR_LOCALE_MESSAGES[locale] || TOUR_LOCALE_MESSAGES.en;
    return messages[key] || TOUR_LOCALE_MESSAGES.en[key] || '';
  }

  /** @param {'short' | 'full' | ''} [mode] */
  async #start(mode = '') {
    if (!this.$.isReady || this.$.isRunning) return;
    if (mode !== 'short' && mode !== 'full') return;
    this.#mode = mode;
    this.#playbackEntries = [...createCvShowPlaybackEntries(this.#story, mode)];
    this.#mountSharedShow();
    this.#showPlayer?.bind?.(this.#showConfig());
    this.#narrationReady = this.#speech.prepare(this.#story).then((snapshot) => {
      this.dataset.narrationSource = snapshot.source;
      return snapshot;
    });
    this.#alignmentReady = this.#narrationReady.then(async (snapshot) => {
      const alignment = snapshot.source === 'local'
        ? await this.#alignment.prepare(this.#story)
        : this.#alignment.snapshot;
      this.dataset.alignmentSource = alignment.available ? alignment.version : 'none';
      return alignment;
    });
    await Promise.all([this.#narrationReady, this.#alignmentReady]);
    if (!this.isConnected || this.$.isRunning) return;
    this.#session = new ShowSessionState();
    this.#sceneIndex = 0;
    this.$.isRunning = true;
    this.$.isPaused = false;
    this.$.resumeRequired = false;
    this.#appendAgentMessage({ id: `start-${mode}` }, {
      text: this.#message(`tour.start.${mode}`),
      actions: [],
      payload: null,
    });
    this.dispatchEvent(new CustomEvent('portfolio-show-start', { bubbles: true, composed: true }));
    this.#presentScene();
  }

  async #preview(index) {
    if (!this.$.isReady || this.$.inBranch || !Number.isInteger(index)) return;
    if (index < 0 || index >= this.#playbackEntries.length) return;
    await Promise.all([this.#narrationReady, this.#alignmentReady]);
    if (!this.isConnected) return;
    const wasRunning = this.$.isRunning;
    this.#sceneIndex = index;
    this.$.isRunning = true;
    this.$.isPaused = true;
    this.$.resumeRequired = true;
    if (!wasRunning) {
      this.#session = new ShowSessionState();
      this.dispatchEvent(new CustomEvent('portfolio-show-start', { bubbles: true, composed: true }));
    }
    this.#presentScene({ startPaused: true });
  }

  #currentScene() {
    const entry = this.#currentEntry();
    if (!entry) return null;
    if (!entry.sceneId) return entry;
    return this.#story?.scenes?.find((scene) => scene.id === entry.sceneId) || null;
  }

  #currentEntry() {
    return this.#playbackEntries[this.#sceneIndex] || null;
  }

  #step(direction) {
    if (!this.$.isReady || this.$.inBranch) return;
    const nextIndex = Math.min(
      this.#playbackEntries.length - 1,
      Math.max(0, Math.max(0, this.#sceneIndex) + direction),
    );
    if (nextIndex === this.#sceneIndex) return;
    if (!this.$.isRunning || this.$.isPaused) void this.#preview(nextIndex);
    else {
      this.#sceneIndex = nextIndex;
      this.#presentScene();
    }
  }

  #waitForAttentionBarrier(requestId) {
    let settle;
    let settled = false;
    const completion = new Promise((resolve) => { settle = resolve; });
    const detail = {
      requestId,
      handled: false,
      complete: (receipt = null) => {
        if (settled) return;
        settled = true;
        settle(receipt || Object.freeze({ status: 'completed' }));
      },
    };
    this.dispatchEvent(new CustomEvent('portfolio-show-before-advance', {
      bubbles: true,
      composed: true,
      detail,
    }));
    if (!detail.handled) detail.complete(Object.freeze({ status: 'unhandled' }));
    return completion;
  }

  async #advanceAfterAttention(requestId) {
    const receipt = await this.#waitForAttentionBarrier(requestId);
    if (receipt?.status === 'cancelled') return;
    this.#advanceShort(requestId);
  }

  #advanceShort(requestId) {
    if (requestId !== this.#requestId || !this.$.isRunning || this.$.isPaused || this.$.inBranch) return;
    if (this.#sceneIndex >= this.#playbackEntries.length - 1) {
      this.stopShow({ completed: true });
      return;
    }
    this.#sceneIndex += 1;
    this.#presentScene();
  }

  #presentScene({ startPaused = false } = {}) {
    const entry = this.#currentEntry();
    if (!entry) return;
    this.#session.setPlayback({
      episodeId: this.#mode,
      cueIndex: this.#sceneIndex,
      positionMs: 0,
      playbackState: startPaused ? 'paused' : 'playing',
      subjectId: entry.sceneId || entry.id,
    });
    this.$.inBranch = false;
    this.$.resumeRequired = startPaused;
    this.$.isPaused = startPaused;
    this.$.hasDetails = this.#mode === 'short' && Boolean(entry.branchId);
    this.$.isError = false;
    this.$.errorText = '';
    this.$.statusText = startPaused ? this.#message('tour.status.paused') : '';
    this.$.progressText = `${this.#sceneIndex + 1} / ${this.#playbackEntries.length}`;
    this.$.progressLabel = formatProgress(
      this.#message('tour.progress'),
      this.#sceneIndex + 1,
      this.#playbackEntries.length,
    );
    this.#presentEntry(entry, { startPaused });
  }

  #presentEntry(entry, { startPaused = false } = {}) {
    this.#requestId += 1;
    const requestId = this.#requestId;
    this.#stopSpeech('scene-changed', { retainEntryId: entry.id });
    let context = createCvShowPresentationContext(entry, {
      inBranch: this.$.inBranch,
      returnLabel: this.$.lblReturn,
    });
    this.#session.appendMessage({ id: entry.id, role: 'agent', text: context.text });
    this.#appendAgentMessage(entry, context);
    this.emitShowDirective({ type: 'speech', id: `${entry.id}.speech`, text: entry.speech });
    const { scheduled } = partitionCvShowAlignedDirectives(entry.directives);
    const visualDirectives = scheduled.map(({ source }) => source).filter(({ type }) => type !== 'media');
    const sceneSetupReady = this.#runSceneSetup(entry, requestId);
    if (!this.#alignment.available) {
      void sceneSetupReady.then(() => {
        if (requestId !== this.#requestId) return;
        this.dispatchEvent(new CustomEvent('portfolio-show-phase', {
          bubbles: true,
          composed: true,
          detail: { directives: visualDirectives, aligned: false, requestId },
        }));
      });
    }
    this.#showPlayer?.bind?.(this.#showConfig());
    this.#syncPlayer();
    void this.#speak(entry, requestId, { startPaused, sceneSetupReady });
  }

  #runSceneSetup(entry, requestId) {
    const { sceneSetup } = partitionCvShowAlignedDirectives(entry.directives);
    let settle;
    let settled = false;
    const completion = new Promise((resolve) => { settle = resolve; });
    const detail = {
      directives: sceneSetup,
      aligned: true,
      requestId,
      handled: false,
      complete: (result) => {
        if (settled) return;
        settled = true;
        settle(result);
      },
    };
    this.dispatchEvent(new CustomEvent('portfolio-show-phase', {
      bubbles: true,
      composed: true,
      detail,
    }));
    if (!detail.handled) {
      detail.complete(Object.freeze({ status: 'cancelled', receipts: Object.freeze([]) }));
    }
    return completion;
  }

  #disposeAlignedEntry() {
    const alignedEntry = this.#alignedEntry;
    alignedEntry?.media?.removeEventListener?.('timeupdate', alignedEntry.onCaptionTimeUpdate);
    this.#alignedEntry?.runtime?.dispose?.();
    this.#alignedEntry = null;
    this.#lastAlignedCue = null;
    this.#lastAlignedReset = null;
    this.#lastAlignedSeekFailure = null;
    this.#lastAlignedGenerationReceipt = null;
  }

  #recordAlignedSeekFailure(receipt, requestId, entryId) {
    if (requestId !== this.#requestId) return;
    if (this.#lastAlignedSeekFailure?.operationId === receipt?.operationId) return;
    this.#lastAlignedSeekFailure = receipt;
    this.#lastAlignedGenerationReceipt = receipt;
    this.$.isError = true;
    this.$.errorText = this.#message('tour.error.speech');
    this.pauseShow('alignment-seek-error');
    this.#appendSystemMessage(this.$.errorText, { error: true });
    this.dispatchEvent(new CustomEvent('portfolio-show-aligned-seek-failure', {
      bubbles: true,
      composed: true,
      detail: { requestId, entryId, receipt },
    }));
  }

  async #attachAlignedEntry(entry, media, clip, requestId, {
    positionMs = 0,
    reason = 'alignment-ready',
    sceneSetupReady = null,
  } = {}) {
    await sceneSetupReady;
    if (requestId !== this.#requestId) {
      return Object.freeze({ status: 'cancelled', reason: 'scene-replaced' });
    }
    const aligned = await this.#alignment.createEntryRuntime({
      entry,
      media,
      resolveText: (key) => this.#message(key),
      onReset: (receipt) => {
        if (requestId !== this.#requestId) return;
        this.#lastAlignedReset = receipt;
        this.dispatchEvent(new CustomEvent('portfolio-show-aligned-reset', {
          bubbles: true,
          composed: true,
          detail: { requestId, entryId: entry.id, receipt },
        }));
      },
      onSeekFailure: (receipt) => {
        this.#recordAlignedSeekFailure(receipt, requestId, entry.id);
      },
      onCue: (receipt) => {
        if (requestId !== this.#requestId) return;
        this.#lastAlignedCue = receipt;
        this.#session.setPlayback({
          ...this.#session.snapshot.playback,
          positionMs: receipt.mediaTimeMs,
        });
        this.dispatchEvent(new CustomEvent('portfolio-show-aligned-cue', {
          bubbles: true,
          composed: true,
          detail: { requestId, entryId: entry.id, ...receipt },
        }));
      },
    });
    if (requestId !== this.#requestId) {
      aligned?.runtime?.dispose?.();
      return null;
    }
    this.#disposeAlignedEntry();
    const onCaptionTimeUpdate = () => {
      if (requestId === this.#requestId) this.#syncPlayer();
    };
    if (aligned) media.addEventListener?.('timeupdate', onCaptionTimeUpdate);
    this.#alignedEntry = aligned ? Object.freeze({
      ...aligned,
      entryId: entry.id,
      media,
      onCaptionTimeUpdate,
    }) : null;
    if (!aligned) return Object.freeze({ status: 'failed', reason: 'alignment-unavailable' });
    const receipt = await aligned.runtime.loadAndRestorePlayback({
      source: clip.audioUrl,
      positionMs,
      paused: true,
      preload: 'auto',
    }, { reason });
    if (requestId !== this.#requestId) return receipt;
    this.#lastAlignedGenerationReceipt = receipt;
    this.dispatchEvent(new CustomEvent('portfolio-show-aligned-generation', {
      bubbles: true,
      composed: true,
      detail: { requestId, entryId: entry.id, receipt },
    }));
    return receipt;
  }

  async #speak(entry, requestId, {
    startPaused = false,
    positionMs = 0,
    sceneSetupReady = null,
  } = {}) {
    if (!this.#speech.available) {
      this.pauseShow('narration-unavailable');
      this.#appendSystemMessage(this.#message('tour.unavailable'));
      return;
    }
    await this.#alignmentReady;
    await sceneSetupReady;
    if (requestId !== this.#requestId) return;
    let token = null;
    if (!startPaused) {
      token = await this.#audioArbiter?.acquire?.({
        id: `cv-show-speech-${entry.id}`,
        kind: 'speech',
        pause: () => this.#speech.pause(),
        stop: () => this.#speech.cancel(),
      }) || null;
    }
    if (requestId !== this.#requestId) {
      if (token) this.#audioArbiter?.release?.(token);
      return;
    }
    this.#speechToken = token;
    this.#activeSpeechEntry = entry;
    const releaseSpeech = () => {
      const activeToken = this.#speechToken;
      this.#speechToken = null;
      this.#activeSpeechEntry = null;
      if (activeToken) this.#audioArbiter?.release?.(activeToken);
    };
    const startedInBranch = this.$.inBranch;
    const started = this.#speech.speak(entry.speech, {
      id: entry.id,
      lang: this.#story.narrationLocale,
      startPaused,
      onMedia: (media, clip) => this.#attachAlignedEntry(entry, media, clip, requestId, {
        positionMs,
        reason: positionMs > 0 ? 'branch-return' : 'alignment-ready',
        sceneSetupReady,
      }),
      onEnd: () => {
        if (requestId !== this.#requestId) return;
        releaseSpeech();
        if (!startedInBranch) void this.#advanceAfterAttention(requestId);
      },
      onError: (_error, receipt) => {
        if (requestId !== this.#requestId) return;
        releaseSpeech();
        if (receipt) {
          this.#recordAlignedSeekFailure(receipt, requestId, entry.id);
          return;
        }
        this.pauseShow('narration-error');
        this.#appendSystemMessage(this.#message('tour.error.speech'), { error: true });
      },
    });
    if (!started) {
      releaseSpeech();
      return;
    }
    if (!this.$.inBranch) {
      const nextEntry = this.#playbackEntries[this.#sceneIndex + 1];
      if (nextEntry) {
        this.#speech.prefetch?.(nextEntry.id);
        this.#alignment.prefetch?.(nextEntry.id);
      }
    }
  }

  #stopSpeech(reason, { retainEntryId = '' } = {}) {
    this.#disposeAlignedEntry();
    if (retainEntryId) {
      this.#alignment.transition?.(retainEntryId);
      this.#speech.transition?.(retainEntryId);
    } else {
      this.#alignment.cancel?.(`CV Show ${reason}`);
      this.#speech.cancel();
    }
    const token = this.#speechToken;
    this.#speechToken = null;
    this.#activeSpeechEntry = null;
    if (token) this.#audioArbiter?.release?.({ ...token, reason });
  }

  #enterDetails(branchId) {
    const branch = this.#story?.branches?.[branchId];
    const scene = this.#currentScene();
    if (
      this.#mode !== 'short'
      || !branch
      || !scene
      || !this.$.isRunning
      || this.$.inBranch
    ) return;
    const positionMs = Math.max(0, Math.round(Number(this.#speech.media?.currentTime || 0) * 1000));
    const shortPlayback = {
      ...this.#session.snapshot.playback,
      positionMs,
      playbackState: 'paused',
      cueIndex: this.#sceneIndex,
      subjectId: scene.id,
    };
    this.#branchReturnPlayback = Object.freeze({ entry: scene, playback: shortPlayback });
    this.#session.enterBranch(branch.id, shortPlayback);
    this.#session.setPlayback({
      episodeId: branch.id,
      cueIndex: 0,
      positionMs: 0,
      playbackState: 'playing',
      subjectId: branch.sceneId,
    });
    this.$.inBranch = true;
    this.$.isPaused = false;
    this.$.resumeRequired = false;
    this.$.hasDetails = false;
    this.#presentEntry(branch);
  }

  #returnFromDetails() {
    if (!this.$.inBranch) return;
    this.#requestId += 1;
    this.#stopSpeech('branch-return');
    this.#session.returnFromBranch();
    this.$.inBranch = false;
    this.$.isPaused = true;
    this.$.resumeRequired = true;
    this.$.hasDetails = this.#mode === 'short' && Boolean(this.#currentScene()?.branchId);
    this.$.statusText = this.#message('tour.status.branchReturned');
    this.#appendSystemMessage(this.$.statusText, {
      actions: [{ id: 'resume', label: this.$.lblResume, icon: 'play_arrow' }],
      actionId: 'show-resume-after-branch',
    });
    const restore = this.#branchReturnPlayback;
    this.#branchReturnPlayback = null;
    this.#syncPlayer();
    if (restore) void this.#restoreAfterBranch(restore, this.#requestId);
  }

  async #restoreAfterBranch({ entry, playback }, requestId) {
    await this.#alignmentReady;
    if (requestId !== this.#requestId) return;
    await this.#speak(entry, requestId, {
      startPaused: true,
      positionMs: playback.positionMs,
    });
  }

  async #resume() {
    if (!this.$.resumeRequired || this.$.mediaBlocksResume) return;
    if (
      this.#activeSpeechEntry
      && this.#audioArbiter
      && this.#audioArbiter.snapshot?.tokenId !== this.#speechToken?.id
    ) {
      const entry = this.#activeSpeechEntry;
      const token = await this.#audioArbiter.acquire({
        id: `cv-show-speech-${entry.id}`,
        kind: 'speech',
        pause: () => this.#speech.pause(),
        stop: () => this.#speech.cancel(),
      });
      if (!this.$.resumeRequired || this.$.mediaBlocksResume || entry !== this.#activeSpeechEntry) {
        this.#audioArbiter.release(token);
        return;
      }
      this.#speechToken = token;
    }
    this.#session.resume();
    this.dispatchEvent(new CustomEvent('portfolio-show-resume', {
      bubbles: true,
      composed: true,
    }));
    this.#speech.resume();
    this.$.isPaused = false;
    this.$.resumeRequired = false;
    this.$.statusText = '';
    this.#syncPlayer();
  }

  #skipMedia() {
    this.dispatchEvent(new CustomEvent('portfolio-show-skip-media', {
      bubbles: true,
      composed: true,
    }));
  }

  #emitProductAction(action) {
    this.dispatchEvent(new CustomEvent('portfolio-show-action', {
      bubbles: true,
      composed: true,
      detail: { action },
    }));
  }

  #appendAgentMessage(entry, context) {
    /** @type {any[]} */
    const trailingParts = [];
    if (context.actions.length) {
      trailingParts.push(actionPart(`${entry.id}.actions`, context.actions, context.payload));
    }
    const id = `show.${entry.id}.${this.#messages.length}`;
    this.#currentMessageId = id;
    this.#appendStreamedMessage(id, context.text, trailingParts);
  }

  #appendStreamedMessage(id, text, trailingParts = []) {
    const textPart = { type: 'text', text: '' };
    const message = { id, role: 'agent', parts: [textPart] };
    this.#messages.push(message);
    this.#syncMessages();
    const controller = new AbortController();
    this.#messageStreams.set(id, controller);
    void createCvShowMessageStream(text, {
      signal: controller.signal,
      onUpdate: (nextText) => {
        textPart.text = nextText;
        this.#syncMessages();
      },
    }).then((receipt) => {
      if (receipt.status !== 'completed') return receipt;
      textPart.text = String(text || '');
      if (trailingParts.length && message.parts.length === 1) message.parts.push(...trailingParts);
      this.#syncMessages();
      return receipt;
    }).finally(() => {
      if (this.#messageStreams.get(id) === controller) this.#messageStreams.delete(id);
    });
  }

  #cancelMessageStreams() {
    for (const controller of this.#messageStreams.values()) {
      controller.abort(new DOMException('CV Show message stream cancelled', 'AbortError'));
    }
    this.#messageStreams.clear();
  }

  #appendSystemMessage(text, { error = false, actions = [], actionId = '' } = {}) {
    if (!text) return;
    /** @type {any[]} */
    const parts = [{ type: error ? 'error' : 'status', text, status: error ? 'error' : 'idle' }];
    if (actions.length) parts.push(actionPart(actionId || `show-actions-${this.#messages.length}`, actions));
    this.#messages.push({ id: `show.status.${this.#messages.length}`, role: 'system', parts });
    this.#syncMessages();
  }

  #appendActionMessage(id, actions, payload) {
    this.#messages.push({
      id: `show.action.${this.#messages.length}`,
      role: 'agent',
      parts: [actionPart(id, actions, payload)],
    });
    this.#syncMessages();
  }

  #appendPartToCurrentMessage(part) {
    const message = this.#messages.find(({ id }) => id === this.#currentMessageId);
    if (!message) return;
    message.parts.push(part);
    this.#syncMessages();
  }

  #syncMessages() {
    this.#dock?.setMessages?.(this.#messages);
  }

  #syncPlayer(terminalState = null) {
    const scene = this.#currentScene();
    const activeEntry = this.$.inBranch ? this.#activeSpeechEntry : this.#currentEntry();
    const captionTrack = this.#alignedEntry?.captionTrack || [];
    const captionPositionMs = Math.max(
      0,
      Number(this.#alignedEntry?.media?.currentTime || 0) * 1_000,
    );
    let activeWordIndex = -1;
    for (let index = 0; index < captionTrack.length; index += 1) {
      if (captionPositionMs < captionTrack[index].startMs) break;
      activeWordIndex = index;
      if (captionPositionMs <= captionTrack[index].endMs) break;
    }
    this.#showPlayer?.setState?.({
      index: Math.max(0, this.#sceneIndex),
      playing: this.$.isRunning && !this.$.isPaused,
      state: terminalState || (this.$.isPaused ? 'paused' : this.$.isRunning ? 'playing' : 'stopped'),
      caption: {
        speaker: this.$.inBranch ? this.#message('tour.details') : 'CV',
        text: captionTrack.length ? activeEntry?.speech || '' : activeEntry?.subtitle || scene?.subtitle || '',
        words: captionTrack,
        activeWordIndex,
      },
      tts: activeEntry ? {
        label: this.#message('tour.tts'),
        text: activeEntry.speech,
        status: terminalState || (this.$.isPaused ? 'paused' : this.$.isRunning ? 'playing' : 'idle'),
      } : {},
    });
    this.#notifyController(terminalState);
  }
}

if (!customElements.get('portfolio-show-chat')) {
  customElements.define('portfolio-show-chat', PortfolioShowChat);
}
