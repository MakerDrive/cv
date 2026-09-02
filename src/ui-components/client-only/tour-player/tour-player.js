import 'symbiote-ui/chat/show-chat';
import { ShowSessionState } from 'symbiote-ui/chat/show-runtime';
import { TOUR_LOCALE_MESSAGES } from '../../../static-pages/data/tourTranslations.js';
import { getCvShowRuntimeAuthority } from '../../../static-pages/js/tour-player/cvShowRuntimeAuthority.js';
import {
  createCvShowMockAgentProvider,
  resolveTrustedCvContactAction,
} from '../../../static-pages/js/tour-player/mockAgentProvider.js';
import {
  createCvShowAlignmentController,
  partitionCvShowAlignedDirectives,
  requireCvShowSceneSetupSuccess,
} from '../../../static-pages/js/tour-player/showAlignmentAdapter.js';
import { createCvShowNarrationController } from '../../../static-pages/js/tour-player/localNarration.js';
import {
  createCvShowPlaybackEntries,
  createCvShowPresentationContext,
} from '../../../static-pages/js/tour-player/presentationContext.js';
import {
  projectCvShowScheduleDuration,
} from '../../../static-pages/js/tour-player/presentationProjectAdapter.js';
import { createBrowserSpeechController } from '../../../static-pages/js/tour-player/speech.js';
import { describeCvShowMissingTarget, describeCvShowSpeechFailure } from '../../../static-pages/js/tour-player/speechFailure.js';
import { CV_SHOW_WEB_AUDIO_RELEASE } from '../../../static-pages/data/cvShowWebAudioRelease.js';
import { CV_SHOW_SCHEDULE_DURATIONS } from '../../../static-pages/data/cvShowScheduleDurations.js';
import {
  createCvShowMessageStreamController,
} from '../../../static-pages/js/tour-player/messageStream.js';
import {
  createCvShowBranchReturnSnapshot,
  validateCvShowBranchReturnSnapshot,
} from '../../../static-pages/js/tour-player/showAdapter.js';

const cvShowRuntimeAuthority = getCvShowRuntimeAuthority();

const CV_SHOW_SCENE_RETRY_LIMIT = 2;
const CV_SHOW_SCENE_RETRY_SETTLE_MS = 900;

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

function normalizeCaptionWord(value) {
  return String(value || '')
    .normalize('NFKC')
    .toLocaleLowerCase('ru')
    .replace(/[^\p{L}\p{N}]+/gu, '');
}

function alignCanonicalCaptionWords(canonicalWords, captionTrack) {
  const source = canonicalWords.map(normalizeCaptionWord);
  const observed = captionTrack.map(({ text }) => normalizeCaptionWord(text));
  const rows = source.length + 1;
  const columns = observed.length + 1;
  const costs = Array.from({ length: rows }, () => new Uint16Array(columns));
  for (let row = 0; row < rows; row += 1) costs[row][0] = row;
  for (let column = 0; column < columns; column += 1) costs[0][column] = column;
  for (let row = 1; row < rows; row += 1) {
    for (let column = 1; column < columns; column += 1) {
      const substitution = costs[row - 1][column - 1]
        + (source[row - 1] === observed[column - 1] ? 0 : 1);
      costs[row][column] = Math.min(
        substitution,
        costs[row - 1][column] + 1,
        costs[row][column - 1] + 1,
      );
    }
  }
  const matches = new Array(source.length).fill(-1);
  let row = source.length;
  let column = observed.length;
  while (row > 0 || column > 0) {
    if (row > 0 && column > 0) {
      const substitutionCost = source[row - 1] === observed[column - 1] ? 0 : 1;
      if (costs[row][column] === costs[row - 1][column - 1] + substitutionCost) {
        matches[row - 1] = column - 1;
        row -= 1;
        column -= 1;
        continue;
      }
    }
    if (row > 0 && costs[row][column] === costs[row - 1][column] + 1) {
      row -= 1;
      continue;
    }
    column -= 1;
  }
  return matches;
}

function interpolateCanonicalCaptionTiming(index, matches, captionTrack) {
  const direct = matches[index];
  if (direct >= 0) return captionTrack[direct];
  let previous = index - 1;
  while (previous >= 0 && matches[previous] < 0) previous -= 1;
  let next = index + 1;
  while (next < matches.length && matches[next] < 0) next += 1;
  const startMs = previous >= 0
    ? captionTrack[matches[previous]].endMs
    : captionTrack[0].startMs;
  const endMs = next < matches.length
    ? captionTrack[matches[next]].startMs
    : captionTrack.at(-1).endMs;
  const ordinal = index - previous;
  const count = next - previous;
  return {
    startMs: startMs + ((endMs - startMs) * (ordinal - 1)) / Math.max(1, count),
    endMs: startMs + ((endMs - startMs) * ordinal) / Math.max(1, count),
  };
}

const canonicalCaptionWordCache = new WeakMap();

function createCanonicalCaptionWords(canonicalText, captionTrack) {
  let trackCache = canonicalCaptionWordCache.get(captionTrack);
  if (!trackCache) {
    trackCache = new Map();
    canonicalCaptionWordCache.set(captionTrack, trackCache);
  }
  if (trackCache.has(canonicalText)) return trackCache.get(canonicalText);
  const canonicalWords = canonicalText.match(/\S+/gu) || [];
  const timedWords = captionTrack
    .map((word) => ({
      text: String(word?.text || ''),
      startMs: Math.max(0, Number(word?.startMs) || 0),
      endMs: Math.max(0, Number(word?.endMs) || Number(word?.startMs) || 0),
    }))
    .filter(({ text }) => text.trim());
  if (!canonicalWords.length || !timedWords.length) return Object.freeze([]);
  const matches = alignCanonicalCaptionWords(canonicalWords, timedWords);
  const words = Object.freeze(canonicalWords.map((word, index) => {
    const timing = interpolateCanonicalCaptionTiming(index, matches, timedWords);
    return Object.freeze({
      text: word,
      startMs: Math.max(0, Number(timing.startMs) || 0),
      endMs: Math.max(0, Number(timing.endMs) || Number(timing.startMs) || 0),
    });
  }));
  trackCache.set(canonicalText, words);
  return words;
}

/**
 * Keep the authored caption as the visible source of truth while borrowing only
 * timing from the recognized word track.
 */
export function createCvShowCanonicalCaption(text, captionTrack = [], positionMs = 0) {
  const canonicalText = String(text || '');
  if (!Array.isArray(captionTrack) || !captionTrack.length || !canonicalText.trim()) {
    return Object.freeze({ text: canonicalText, words: Object.freeze([]), activeWordIndex: -1 });
  }
  const words = createCanonicalCaptionWords(canonicalText, captionTrack);
  if (!words.length) {
    return Object.freeze({ text: canonicalText, words, activeWordIndex: -1 });
  }
  const currentPositionMs = Math.max(0, Number(positionMs) || 0);
  let activeWordIndex = -1;
  for (let index = 0; index < words.length; index += 1) {
    if (currentPositionMs < words[index].startMs) break;
    activeWordIndex = index;
    if (currentPositionMs <= words[index].endMs) break;
  }
  return Object.freeze({ text: canonicalText, words, activeWordIndex });
}

export function createCvShowVideoControls(directives = [], resolveMessage = value => value) {
  void directives;
  void resolveMessage;
  return Object.freeze([]);
}

export function resolveCvShowPlayerEntry({
  inBranch = false,
  activeSpeechEntry = null,
  activeBranchEntry = null,
  currentEntry = null,
} = {}) {
  if (!inBranch) return currentEntry || null;
  return activeSpeechEntry || activeBranchEntry || currentEntry || null;
}

/** @param {any} story @param {'short' | 'full'} [mode] @param {Map<string, number>} [projectDurations] */
function playerTimeline(story, mode = 'short', projectDurations = new Map()) {
  const knownDurations = CV_SHOW_SCHEDULE_DURATIONS.releaseId === CV_SHOW_WEB_AUDIO_RELEASE.releaseId
    ? CV_SHOW_SCHEDULE_DURATIONS.durations
    : {};
  return Object.freeze({
    title: 'CV Show',
    turns: Object.freeze(createCvShowPlaybackEntries(story, mode).map((entry) => {
      const durationMs = Number(projectDurations.get(entry.id) ?? knownDurations[entry.id]);
      return Object.freeze({
        id: entry.id,
        persona: entry.sceneId ? 'Detail' : 'CV',
        text: entry.title || entry.id,
        durationMs: Number.isFinite(durationMs) && durationMs > 0 ? durationMs : null,
      });
    })),
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
    lblRetry: '',
    lblSkipMedia: '',
  };

  #story = null;
  #authoringView = cvShowRuntimeAuthority.getView();
  #unsubscribeAuthoring = null;
  /** @type {'' | 'short' | 'full'} */
  #mode = '';
  #playbackEntries = [];
  #sceneIndex = -1;
  #requestId = 0;
  #transportRequestId = 0;
  #pendingTransportIntent = null;
  #pendingTrustedPlay = false;
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
    getAuthoringView: () => this.#authoringView,
  });
  /** @type {Promise<any>} */
  #alignmentReady = Promise.resolve();
  #alignedEntry = null;
  #projectDurationMsByEntry = new Map();
  #lastExecutionReceipt = null;
  #lastAlignedReset = null;
  #lastAlignedSeekFailure = null;
  #lastAlignedGenerationReceipt = null;
  #branchReturnPlayback = null;
  #showCompleted = false;
  #completedDetailReview = false;
  #completedDetailReviewPreparing = false;
  #presentationAdmitted = false;
  #transportPlaying = false;
  #playRequested = false;
  #resumePending = false;
  #pendingStartDetail = null;
  #session = new ShowSessionState();
  #audioArbiter = null;
  #speechToken = null;
  #activeSpeechEntry = null;
  #speechRetryAttempts = new Map();
  #sceneRetryScheduled = false;
  #messageStream = createCvShowMessageStreamController();

  constructor() {
    super();
    this.$ = { ...this.init$ };
  }

  #causeSuffix(causeKey, code) {
    const cause = causeKey
      ? `${this.#message(causeKey)} (${code})`
      : code;
    return this.#message('tour.error.cause').replace('{detail}', cause);
  }

  /**
   * @param {{
   *   receipts?: null | Array<Record<string, unknown>>,
   *   error?: unknown,
   * }} [result]
   */
  #requiredMissingText({ receipts, error } = {}) {
    const missing = Array.isArray(receipts)
      ? receipts.find(({ status }) => status === 'missing')
      : null;
    if (missing) {
      const description = describeCvShowMissingTarget(missing);
      return `${this.#message('tour.error.required')} ${
        this.#causeSuffix(description.causeKey, description.code)
      } ${description.detail}`;
    }
    const description = describeCvShowSpeechFailure({ error });
    return `${this.#message('tour.error.required')} ${
      this.#causeSuffix(description.causeKey, description.code)
    } ${description.detail}`.trim();
  }

  #onResult = (event) => {
    if (event.detail?.requestId !== this.#requestId) return;
    const requiredMissing = event.detail?.status === 'required-missing';
    this.$.isError = requiredMissing;
    this.$.errorText = requiredMissing ? this.#requiredMissingText(event.detail) : '';
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
    else if (actionId === 'details') void this.#enterDetails(payload?.branchId, {
      contextualCardId: event.detail?.id,
      contextualActionId: actionId,
      historicalOwnerEntryId: payload?.sceneId,
    });
    else if (actionId === 'return') this.#returnFromDetails();
    else if (actionId === 'resume') void this.#resume();
    else if (actionId === 'show-retry') this.#repeatCurrentEntry();
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

  #onAuthoringView = (nextView) => {
    if (
      !nextView?.identity?.snapshot
      || nextView.identity.snapshot === this.#authoringView?.identity?.snapshot
    ) return;
    if (this.$.isRunning || this.#mode || this.#alignedEntry || this.$.inBranch) {
      this.stopShow();
    } else {
      this.#stopSpeech('authoring-revision-changed');
    }
    this.#authoringView = nextView;
    this.#projectDurationMsByEntry.clear();
    this.#acceptStory(nextView.story);
  };

  set agentDock(value) {
    this.#dock = value || null;
  }

  set audioArbiter(value) {
    this.#audioArbiter = value || null;
  }

  connectedCallback() {
    this.#authoringView = cvShowRuntimeAuthority.getView();
    this.#unsubscribeAuthoring ||= cvShowRuntimeAuthority.subscribe(this.#onAuthoringView);
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
    this.#unsubscribeAuthoring?.();
    this.#unsubscribeAuthoring = null;
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

  #presentationPositionMs(fallbackMs = this.#session.snapshot.playback.positionMs) {
    const projectPositionMs = Number(this.#alignedEntry?.runtime?.presentationPositionMs);
    if (Number.isFinite(projectPositionMs)) return Math.max(0, projectPositionMs);
    const legacyMediaPosition = Number(
      this.#alignedEntry?.media?.currentTime ?? this.#speech.media?.currentTime,
    );
    if (Number.isFinite(legacyMediaPosition)) return Math.max(0, legacyMediaPosition * 1_000);
    return Math.max(0, Number(fallbackMs) || 0);
  }

  get alignmentSnapshot() {
    return Object.freeze({
      ...this.#alignment.snapshot,
      activeId: this.#alignedEntry?.entryId || '',
      alignedSequenceHash: this.#alignedEntry?.alignedSequenceHash || '',
      mediaHash: this.#alignedEntry?.mediaHash || '',
      speechGroupCount: this.#alignedEntry?.speechGroupCount || 0,
      lastExecutionReceipt: this.#lastExecutionReceipt,
      lastResetReason: this.#lastAlignedReset?.reason || '',
      lastSeekFailure: this.#lastAlignedSeekFailure,
      lastGenerationReceipt: this.#lastAlignedGenerationReceipt,
      playbackClockState: this.#alignedEntry?.runtime?.playbackClockState || null,
      narrationPositionMs: Math.round(this.#presentationPositionMs()),
    });
  }

  get routeSnapshot() {
    const currentEntry = this.#currentEntry();
    const activeBranchId = this.$.inBranch ? this.#session.snapshot.playback.episodeId : '';
    const branch = activeBranchId ? this.#story?.branches?.[activeBranchId] : null;
    const fallbackPosition = this.#pendingTransportIntent?.positionMs
      ?? this.#session.snapshot.playback.positionMs;
    return Object.freeze({
      mode: this.#mode,
      entryId: branch?.sceneId || currentEntry?.id || '',
      detailId: branch?.id || this.#pendingTransportIntent?.detailId || '',
      timeMs: this.$.isRunning
        ? Math.round(this.#presentationPositionMs())
        : Math.max(0, Math.round(Number(fallbackPosition) || 0)),
      play: this.$.isRunning
        ? this.#playRequested
        : Boolean(this.#pendingTransportIntent?.play),
      running: Boolean(this.$.isRunning),
      completed: Boolean(this.#showCompleted),
    });
  }

  /**
   * @param {{ mode?: 'short' | 'full', entryId?: string, detailId?: string, timeMs?: number, play?: boolean }} [route]
   */
  async applyShowRoute({ mode, entryId = '', detailId = '', timeMs = 0, play = true } = {}) {
    if (!this.$.isReady || (mode !== 'short' && mode !== 'full')) return false;
    if (this.$.isRunning || this.#mode) this.stopShow({ reason: 'route-replace' });
    const transportRequestId = ++this.#transportRequestId;
    return this.#start(mode, {
      entryId: String(entryId || ''),
      detailId: String(detailId || ''),
      positionMs: Math.max(0, Math.round(Number(timeMs) || 0)),
      play: play !== false,
      routeDriven: true,
      transportRequestId,
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
    const cancelledPendingPlay = this.#cancelPendingTrustedPlay();
    if (
      !this.$.isRunning
      || (!this.#playRequested && !this.#transportPlaying && this.$.isPaused)
    ) {
      if (cancelledPendingPlay) this.#syncPlayer();
      return cancelledPendingPlay;
    }
    this.#playRequested = false;
    this.#transportPlaying = false;
    this.#resumePending = false;
    this.$.isPaused = true;
    this.$.resumeRequired = true;
    this.#speech.pause();
    this.#alignedEntry?.runtime?.pause?.();
    const positionMs = Math.round(this.#presentationPositionMs());
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
    this.$.statusText = this.#message(
      reason === 'autoplay-blocked' ? 'tour.status.autoplayBlocked' : 'tour.status.paused',
    );
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

  stopShow({ focusStart = false, completed = false, reason = 'explicit' } = {}) {
    const wasRunning = this.$.isRunning;
    const hadShow = Boolean(wasRunning || this.#mode || this.#pendingTransportIntent);
    const terminalRouteState = this.routeSnapshot;
    this.#requestId += 1;
    this.#transportRequestId += 1;
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
    this.#completedDetailReview = false;
    this.#completedDetailReviewPreparing = false;
    this.#presentationAdmitted = false;
    this.#transportPlaying = false;
    this.#playRequested = false;
    this.#resumePending = false;
    this.#pendingStartDetail = null;
    this.#pendingTrustedPlay = false;
    this.#showCompleted = completed;
    this.#pendingTransportIntent = null;
    this.#mode = '';
    this.#playbackEntries = [];
    this.#sceneIndex = -1;
    this.#syncPlayer(completed ? 'completed' : 'stopped');
    this.#dock?.removeShow?.('short', { stop: false });
    this.#showPlayer = null;
    if (wasRunning && !completed && this.isConnected) this.#appendModeSelectionMessage();
    if (hadShow) {
      this.dispatchEvent(new CustomEvent(
        completed ? 'portfolio-show-complete' : 'portfolio-show-stop',
        {
          bubbles: true,
          composed: true,
          detail: {
            reason,
            routeState: Object.freeze({ ...terminalRouteState, play: false, completed }),
          },
        },
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
    }, { stream: false });
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
    const entry = this.#playerEntry();
    return {
      controller: this.#controller,
      timeline: playerTimeline(
        this.#story,
        this.#mode || 'short',
        this.#projectDurationMsByEntry,
      ),
      state: {
        index: Math.max(0, this.#sceneIndex),
        playing: this.#transportPlaying,
        progress: {
          positionMs: this.#presentationPositionMs(),
        },
        caption: {
          speaker: entry?.sceneId ? this.#message('tour.details') : 'CV',
          text: entry?.subtitle || '',
        },
        tts: entry ? {
          label: this.#message('tour.tts'),
          text: entry.speech,
          status: this.#transportPlaying ? 'playing' : this.$.isRunning ? 'paused' : 'idle',
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
      get isPlaying() { return host.#transportPlaying; },
      get isPaused() { return host.$.isPaused; },
      play() {
        if (
          host.#pendingTransportIntent
          || (host.$.isRunning && host.$.resumeRequired && !host.#activeSpeechEntry)
        ) {
          if (host.$.isRunning && host.$.isError && !host.#sceneRetryScheduled) host.#repeatCurrentEntry();
          else host.#queuePendingTrustedPlay();
        }
        else if (!host.$.isRunning && host.#mode) void host.#start(host.#mode);
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
      seek(index, positionMs) { void host.#seek(index, positionMs); },
    };
  }

  #queuePendingTrustedPlay() {
    this.#pendingTrustedPlay = true;
    this.#playRequested = true;
    if (this.#pendingTransportIntent) {
      this.#pendingTransportIntent = Object.freeze({
        ...this.#pendingTransportIntent,
        play: true,
      });
    }
    this.#syncPlayer();
  }

  #cancelPendingTrustedPlay() {
    const cancelled = Boolean(
      this.#pendingTrustedPlay
      || this.#pendingTransportIntent?.play,
    );
    this.#pendingTrustedPlay = false;
    this.#playRequested = false;
    if (this.#pendingTransportIntent) {
      this.#pendingTransportIntent = Object.freeze({
        ...this.#pendingTransportIntent,
        play: false,
      });
    }
    return cancelled;
  }

  #videoController = Object.freeze({
    play: (request) => {
      const entry = this.#playerEntry();
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
    return createCvShowVideoControls(entry?.directives, key => this.#message(key));
  }

  #notifyController(state = null) {
    this.#controller?.onIndexChange?.(Math.max(0, this.#sceneIndex));
    this.#controller?.onStateChange?.(state || (
      this.$.isRunning ? (this.$.isPaused ? 'paused' : 'playing') : 'stopped'
    ));
  }

  #acceptStory(story) {
    try {
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

  #loadStory() {
    if (this.#authoringView?.story) {
      this.#acceptStory(this.#authoringView.story);
      return;
    }
    const source = document.getElementById('pulse-tour-story')?.textContent || '';
    try {
      this.#acceptStory(JSON.parse(source));
    } catch {
      this.#acceptStory(null);
    }
  }

  #localize() {
    this.$.tourTitle = this.#message('panel.tour');
    this.$.tourIntro = this.#message('tour.intro');
    this.$.lblDetails = this.#message('tour.details');
    this.$.lblReturn = this.#message('tour.return');
    this.$.lblResume = this.#message('tour.resume');
    this.$.lblRetry = this.#message('tour.retry');
    this.$.lblSkipMedia = this.#message('tour.skipMedia');
  }

  #message(key) {
    const locale = document.documentElement.lang || 'en';
    const messages = TOUR_LOCALE_MESSAGES[locale] || TOUR_LOCALE_MESSAGES.en;
    return messages[key] || TOUR_LOCALE_MESSAGES.en[key] || '';
  }

  #rejectUnavailableData() {
    this.$.isError = true;
    this.$.errorText = this.#message('tour.dataUnavailable');
    this.$.statusText = this.$.errorText;
    this.#appendSystemMessage(this.$.errorText, { error: true });
  }

  /** @param {'short' | 'full' | ''} [mode] */
  async #start(mode = '', {
    entryId = '',
    detailId = '',
    positionMs = 0,
    play = true,
    routeDriven = false,
    transportRequestId = 0,
  } = {}) {
    if (!this.$.isReady || this.$.isRunning || this.#mode) return false;
    if (mode !== 'short' && mode !== 'full') return false;
    const activeTransportRequestId = transportRequestId || ++this.#transportRequestId;
    const requestId = this.#requestId;
    const playbackEntries = [...createCvShowPlaybackEntries(this.#story, mode)];
    const unavailableEntryIds = playbackEntries
      .filter(({ id }) => !this.#authoringView.mediaRegistry.entries[id]?.playable)
      .map(({ id }) => id);
    if (unavailableEntryIds.length) {
      this.#rejectUnavailableData();
      return false;
    }
    this.#mode = mode;
    this.#showCompleted = false;
    this.#playbackEntries = playbackEntries;
    const requestedIndex = entryId
      ? playbackEntries.findIndex((entry) => entry.id === entryId)
      : 0;
    if (requestedIndex < 0) {
      this.#mode = '';
      this.#playbackEntries = [];
      return false;
    }
    const requestedEntry = playbackEntries[requestedIndex];
    const targetMs = Math.max(0, Math.round(Number(positionMs) || 0));
    this.#sceneIndex = requestedIndex;
    const pendingTransportIntent = Object.freeze({
      detailId: String(detailId || ''),
      play: Boolean(play),
      positionMs: targetMs,
      routeDriven: Boolean(routeDriven),
      transportRequestId: activeTransportRequestId,
    });
    this.#pendingTransportIntent = pendingTransportIntent;
    this.#mountSharedShow();
    this.#showPlayer?.bind?.(this.#showConfig());
    await this.#prepareNarrationResources();
    if (
      !this.isConnected
      || this.$.isRunning
      || requestId !== this.#requestId
      || activeTransportRequestId !== this.#transportRequestId
      || !this.#mode
    ) return false;
    this.#session = new ShowSessionState();
    this.#presentationAdmitted = false;
    this.#transportPlaying = false;
    let effectivePlay = Boolean(
      this.#pendingTrustedPlay
      || this.#pendingTransportIntent?.play,
    );
    this.#playRequested = effectivePlay;
    this.#resumePending = false;
    this.#pendingStartDetail = Object.freeze({ routeDriven: Boolean(routeDriven) });
    this.$.isRunning = true;
    this.$.isPaused = !effectivePlay;
    this.$.resumeRequired = !effectivePlay;
    const acknowledgement = await this.#appendAgentMessage({ id: `start-${mode}` }, {
      text: this.#message(`tour.start.${mode}`),
      actions: [],
      payload: null,
    });
    if (
      acknowledgement?.status !== 'completed'
      || !this.isConnected
      || !this.$.isRunning
      || requestId !== this.#requestId
      || activeTransportRequestId !== this.#transportRequestId
      || !this.#mode
    ) return false;
    effectivePlay = Boolean(
      this.#pendingTrustedPlay
      || this.#pendingTransportIntent?.play,
    );
    this.#pendingTrustedPlay = false;
    this.#playRequested = effectivePlay;
    this.$.isPaused = !effectivePlay;
    this.$.resumeRequired = !effectivePlay;
    this.#presentScene({
      startPaused: !effectivePlay || Boolean(detailId),
      positionMs: detailId ? 0 : targetMs,
    });
    if (detailId) {
      const scene = this.#story?.scenes?.find(({ id }) => id === requestedEntry.id);
      if (mode !== 'short' || !scene || scene.branchId !== detailId) {
        this.stopShow({ reason: 'route-invalid-detail' });
        return false;
      }
      await this.#enterDetails(detailId, {
        contextualCardId: `${scene.id}.actions`,
        contextualActionId: 'details',
        historicalOwnerEntryId: scene.id,
        startPaused: !effectivePlay,
        positionMs: targetMs,
        forcePrecedingSetup: true,
      });
      if (activeTransportRequestId !== this.#transportRequestId) return false;
    }
    if (this.#pendingTransportIntent?.transportRequestId === activeTransportRequestId) {
      this.#pendingTransportIntent = null;
    }
    return true;
  }

  async #prepareNarrationResources() {
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
    return Promise.all([this.#narrationReady, this.#alignmentReady]);
  }

  async #preview(index) {
    if (!this.$.isReady || this.$.inBranch || !Number.isInteger(index)) return;
    if (index < 0 || index >= this.#playbackEntries.length) return;
    const transportRequestId = ++this.#transportRequestId;
    await Promise.all([this.#narrationReady, this.#alignmentReady]);
    if (!this.isConnected || transportRequestId !== this.#transportRequestId) return;
    const wasRunning = this.$.isRunning;
    this.#sceneIndex = index;
    this.$.isRunning = true;
    this.$.isPaused = true;
    this.$.resumeRequired = true;
    if (!wasRunning) {
      this.#session = new ShowSessionState();
      this.#presentationAdmitted = false;
      this.#transportPlaying = false;
      this.#playRequested = false;
      this.#resumePending = false;
      this.#pendingStartDetail = Object.freeze({});
    }
    this.#presentScene({ startPaused: true });
  }

  async #seek(index, positionMs = 0) {
    if (!this.$.isReady || !Number.isInteger(index)) return false;
    if (index < 0 || index >= this.#playbackEntries.length) return false;
    const targetMs = Math.max(0, Math.round(Number(positionMs) || 0));
    const pendingTransportIntent = !this.$.isRunning && this.#pendingTransportIntent
      ? Object.freeze({
        ...this.#pendingTransportIntent,
        detailId: '',
        positionMs: targetMs,
      })
      : null;
    if (pendingTransportIntent) {
      this.#sceneIndex = index;
      this.#pendingTransportIntent = pendingTransportIntent;
    }
    const transportRequestId = ++this.#transportRequestId;
    await Promise.all([this.#narrationReady, this.#alignmentReady]);
    if (
      !this.isConnected
      || !this.#mode
      || transportRequestId !== this.#transportRequestId
    ) return false;
    const wasRunning = this.$.isRunning;
    const wasPlaying = wasRunning
      ? !this.$.isPaused
      : Boolean(pendingTransportIntent?.play);
    if (this.$.inBranch) {
      this.#session.returnFromBranch();
      this.#branchReturnPlayback = null;
      this.#completedDetailReview = false;
      this.#showCompleted = false;
    }
    this.#sceneIndex = index;
    if (!wasRunning) {
      this.#session = new ShowSessionState();
      this.#presentationAdmitted = false;
      this.#transportPlaying = false;
      this.#playRequested = Boolean(wasPlaying);
      this.#resumePending = false;
      this.#pendingStartDetail = Object.freeze({
        routeDriven: Boolean(pendingTransportIntent?.routeDriven),
      });
    }
    this.$.isRunning = true;
    this.#presentScene({ startPaused: !wasPlaying, positionMs: targetMs });
    if (
      this.#pendingTransportIntent?.transportRequestId
      === pendingTransportIntent?.transportRequestId
    ) {
      this.#pendingTransportIntent = null;
    }
    this.dispatchEvent(new CustomEvent('portfolio-show-seek', {
      bubbles: true,
      composed: true,
      detail: { index, positionMs: targetMs },
    }));
    return true;
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

  #playerEntry() {
    const activeBranchId = this.$.inBranch
      ? this.#session?.snapshot?.playback?.episodeId
      : '';
    return resolveCvShowPlayerEntry({
      inBranch: this.$.inBranch,
      activeSpeechEntry: this.#activeSpeechEntry,
      activeBranchEntry: this.#story?.branches?.[activeBranchId] || null,
      currentEntry: this.#currentEntry(),
    });
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

  async #waitForAttentionBarrier(requestId) {
    await this.#alignedEntry?.runtime?.whenIdle?.();
    if (requestId !== this.#requestId) {
      return Object.freeze({ status: 'cancelled' });
    }
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

  #publishPhysicalStart(entry, requestId) {
    if (
      requestId !== this.#requestId
      || entry !== this.#activeSpeechEntry
      || !this.$.isRunning
      || !this.#playRequested
    ) return false;
    const firstPhysicalStart = !this.#presentationAdmitted;
    const publishResume = this.#resumePending && !firstPhysicalStart;
    const wasPaused = this.$.isPaused;
    this.#presentationAdmitted = true;
    this.#transportPlaying = true;
    this.#resumePending = false;
    this.$.isPaused = false;
    this.$.resumeRequired = false;
    this.$.statusText = '';
    if (wasPaused) this.#session.resume();
    this.#session.setPlayback({
      ...this.#session.snapshot.playback,
      playbackState: 'playing',
    });
    if (firstPhysicalStart) {
      const detail = this.#pendingStartDetail || Object.freeze({});
      this.#pendingStartDetail = null;
      this.dispatchEvent(new CustomEvent('portfolio-show-start', {
        bubbles: true,
        composed: true,
        detail,
      }));
    } else if (publishResume) {
      this.dispatchEvent(new CustomEvent('portfolio-show-resume', {
        bubbles: true,
        composed: true,
      }));
    }
    this.#syncPlayer();
    return true;
  }

  #presentScene({ startPaused = false, positionMs = 0 } = {}) {
    const entry = this.#currentEntry();
    if (!entry) return;
    this.#session.setPlayback({
      episodeId: this.#mode,
      cueIndex: this.#sceneIndex,
      positionMs,
      playbackState: 'paused',
      subjectId: entry.sceneId || entry.id,
    });
    this.$.inBranch = false;
    this.$.resumeRequired = startPaused;
    this.$.isPaused = startPaused;
    this.$.hasDetails = this.#mode === 'short' && Boolean(entry.branchId);
    this.$.isError = false;
    this.$.errorText = '';
    this.#clearSystemErrors();
    this.$.statusText = startPaused ? this.#message('tour.status.paused') : '';
    this.$.progressText = `${this.#sceneIndex + 1} / ${this.#playbackEntries.length}`;
    this.$.progressLabel = formatProgress(
      this.#message('tour.progress'),
      this.#sceneIndex + 1,
      this.#playbackEntries.length,
    );
    this.#presentEntry(entry, { startPaused, positionMs });
  }

  #presentEntry(entry, {
    startPaused = false,
    positionMs = 0,
    precedingSetupEntry = null,
  } = {}) {
    this.#requestId += 1;
    const requestId = this.#requestId;
    this.#stopSpeech('scene-changed', { retainEntryId: entry.id });
    this.#transportPlaying = false;
    this.#playRequested = !startPaused;
    this.#resumePending = false;
    let context = createCvShowPresentationContext(entry, {
      inBranch: this.$.inBranch,
      returnLabel: this.$.lblReturn,
    });
    this.#session.appendMessage({ id: entry.id, role: 'agent', text: context.text });
    this.#appendAgentMessage(entry, context);
    this.emitShowDirective({ type: 'speech', id: `${entry.id}.speech`, text: entry.speech });
    const restorePausedCheckpoint = Boolean(
      startPaused
      && positionMs > 0
      && this.#alignment.available,
    );
    const { scheduled } = partitionCvShowAlignedDirectives(entry.directives);
    const visualDirectives = scheduled.map(({ source }) => source).filter(({ type }) => type !== 'media');
    const runPrecedingSetup = this.#alignment.available && precedingSetupEntry
      ? () => this.#runPrecedingSceneSetup(
          precedingSetupEntry,
          entry,
          requestId,
          { restorePausedCheckpoint },
        )
      : null;
    const sceneSetupReady = runPrecedingSetup && this.#presentationAdmitted
      ? runPrecedingSetup()
      : null;
    const beforeDeferredPresentation = runPrecedingSetup && !this.#presentationAdmitted
      ? runPrecedingSetup
      : null;
    const startUnalignedPresentation = this.#alignment.available ? null : async () => {
      const receipt = precedingSetupEntry
        ? await this.#runPrecedingSceneSetup(precedingSetupEntry, entry, requestId)
        : await this.#runSceneSetup(entry, requestId);
      requireCvShowSceneSetupSuccess(receipt, entry.id);
      if (requestId !== this.#requestId) return;
      this.dispatchEvent(new CustomEvent('portfolio-show-phase', {
        bubbles: true,
        composed: true,
        detail: { directives: visualDirectives, aligned: false, requestId },
      }));
    };
    this.#showPlayer?.bind?.(this.#showConfig());
    this.#syncPlayer();
    void this.#speak(entry, requestId, {
      startPaused,
      positionMs,
      sceneSetupReady,
      beforeDeferredPresentation,
      restorePausedCheckpoint,
      onPhysicalStart: startUnalignedPresentation,
    });
  }

  #runSceneSetup(entry, requestId, { restorePausedCheckpoint = false } = {}) {
    const { sceneSetup } = partitionCvShowAlignedDirectives(entry.directives);
    let settle;
    let settled = false;
    const completion = new Promise((resolve) => { settle = resolve; });
    const detail = {
      directives: sceneSetup,
      aligned: true,
      requestId,
      restorePausedCheckpoint,
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

  async #runPrecedingSceneSetup(
    precedingEntry,
    entry,
    requestId,
    { restorePausedCheckpoint = false } = {},
  ) {
    const receipt = await this.#runSceneSetup(precedingEntry, requestId, {
      restorePausedCheckpoint,
    });
    requireCvShowSceneSetupSuccess(receipt, precedingEntry.id);
    if (requestId !== this.#requestId) return null;
    return this.#alignment.available
      ? null
      : this.#runSceneSetup(entry, requestId);
  }

  #disposeAlignedEntry() {
    const alignedEntry = this.#alignedEntry;
    alignedEntry?.media?.removeEventListener?.('timeupdate', alignedEntry.onCaptionTimeUpdate);
    this.#alignedEntry?.runtime?.dispose?.();
    this.#alignedEntry = null;
    this.#lastExecutionReceipt = null;
    this.#lastAlignedReset = null;
    this.#lastAlignedSeekFailure = null;
    this.#lastAlignedGenerationReceipt = null;
  }

  /**
   * @param {{
   *   error?: null | string | { code?: unknown, name?: unknown, message?: unknown },
   *   receipt?: null | Record<string, unknown>,
   *   entryId?: string,
   * }} [failure]
   */
  #speechFailureText({ error = null, receipt = null, entryId = '' } = {}) {
    const description = describeCvShowSpeechFailure({ error, receipt, entryId });
    if (!description.detail) return this.#message('tour.error.speech');
    return `${this.#message('tour.error.speech')} ${
      this.#causeSuffix(description.causeKey, description.code)
    } ${description.detail}`;
  }

  /**
   * User-driven rapid navigation commonly produces transient presentation
   * races (slow media, late article mount, attention deadline). Re-present the
   * failing scene a bounded number of times before showing a fatal error. The
   * retry is deferred so it never unwinds through the failing runtime's own
   * disposal stack, and it is dropped when the user navigates meanwhile.
   */
  /**
   * Replays the current scene after a terminal presentation failure. A fresh
   * #presentEntry run supersedes every stale callback and gives the step a
   * clean scene setup, so Play/Retry always restores control.
   */
  #repeatCurrentEntry() {
    if (!this.$.isRunning || this.$.inBranch) return;
    const entry = this.#playbackEntries[this.#sceneIndex];
    if (!entry) return;
    this.#speechRetryAttempts.delete(entry.id);
    this.$.isError = false;
    this.$.errorText = '';
    this.#clearSystemErrors();
    this.#presentEntry(entry, { startPaused: false });
  }

  #fatalErrorDetail() {
    return {
      error: true,
      actions: [{ id: 'retry', label: this.$.lblRetry, icon: 'replay' }],
      actionId: 'show-retry',
    };
  }

  #scheduleSceneRetry(entryId, requestId, positionMs = 0) {
    if (this.#sceneRetryScheduled) return true;
    const attempts = this.#speechRetryAttempts.get(entryId) || 0;
    if (attempts >= CV_SHOW_SCENE_RETRY_LIMIT) return false;
    this.#sceneRetryScheduled = true;
    globalThis.setTimeout?.(() => {
      this.#sceneRetryScheduled = false;
      if (requestId !== this.#requestId || !this.isConnected) return;
      const entry = this.#playbackEntries.find(({ id }) => id === entryId);
      if (!entry) return;
      this.#speechRetryAttempts.set(entryId, attempts + 1);
      this.$.isError = false;
      this.$.errorText = '';
      this.#appendSystemMessage(this.#message('tour.status.retry'));
      this.#sceneIndex = Math.max(0, this.#playbackEntries.indexOf(entry));
      this.#presentEntry(entry, { positionMs, startPaused: !this.#playRequested });
    }, CV_SHOW_SCENE_RETRY_SETTLE_MS);
    return true;
  }

  #recordAlignedSeekFailure(receipt, requestId, entryId) {
    if (requestId !== this.#requestId) return;
    if (this.#lastAlignedSeekFailure?.operationId === receipt?.operationId) return;
    this.#lastAlignedSeekFailure = receipt;
    this.#lastAlignedGenerationReceipt = receipt;
    if (this.#scheduleSceneRetry(entryId, requestId)) return;
    this.$.isError = true;
    this.$.errorText = this.#speechFailureText({ receipt, entryId });
    this.pauseShow('alignment-seek-error');
    this.#appendSystemMessage(this.$.errorText, this.#fatalErrorDetail());
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
    beforeDeferredPresentation = null,
    restorePausedCheckpoint = false,
  } = {}) {
    await sceneSetupReady;
    if (requestId !== this.#requestId) {
      return Object.freeze({ status: 'cancelled', reason: 'scene-replaced' });
    }
    const deferPresentationUntilPlayback = !this.#presentationAdmitted
      && !restorePausedCheckpoint;
    if (deferPresentationUntilPlayback && typeof media.muted === 'boolean') {
      media.muted = true;
    }
    const aligned = await this.#alignment.createEntryRuntime({
      entry,
      media,
      audioClip: clip,
      checkpointMs: positionMs > 0 ? positionMs : null,
      deferPresentationUntilPlayback,
      restorePausedCheckpoint,
      beforeDeferredPresentation,
      runPresentationOperation: (operation) => {
        let settle;
        let settled = false;
        const completion = new Promise((resolve, reject) => { settle = { resolve, reject }; });
        const detail = {
          requestId,
          entryId: entry.id,
          operation,
          restorePausedCheckpoint,
          handled: false,
          complete: (result, error = null) => {
            if (settled) return;
            settled = true;
            if (error) settle.reject(error);
            else settle.resolve(result);
          },
        };
        this.dispatchEvent(new CustomEvent('portfolio-show-presentation-operation', {
          bubbles: true,
          composed: true,
          detail,
        }));
        if (!detail.handled) {
          detail.complete(null, Object.assign(
            new Error(`CV Show presentation operation is unhandled: ${operation.projectCell.id}`),
            { code: 'CV_SHOW_PRESENTATION_OPERATION_UNHANDLED' },
          ));
        }
        return completion;
      },
      onReceipt: (receipt) => {
        if (requestId !== this.#requestId) return;
        this.#lastExecutionReceipt = receipt;
        this.#session.setPlayback({
          ...this.#session.snapshot.playback,
          positionMs: Math.round(this.#presentationPositionMs()),
        });
        this.dispatchEvent(new CustomEvent('portfolio-show-presentation-receipt', {
          bubbles: true,
          composed: true,
          detail: { requestId, entryId: entry.id, receipt },
        }));
      },
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
    const projectDurationMs = projectCvShowScheduleDuration(aligned);
    if (Number.isFinite(projectDurationMs) && projectDurationMs > 0) {
      this.#projectDurationMsByEntry.set(
        entry.id,
        Math.max(projectDurationMs, this.#projectDurationMsByEntry.get(entry.id) || 0),
      );
      this.#showPlayer?.bind?.(this.#showConfig());
      this.#syncPlayer();
    }
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
    beforeDeferredPresentation = null,
    restorePausedCheckpoint = false,
    onPhysicalStart = null,
  } = {}) {
    if (!this.#speech.available) {
      this.pauseShow('narration-unavailable');
      this.#appendSystemMessage(this.#message('tour.unavailable'));
      return;
    }
    await this.#alignmentReady;
    let sceneSetupReceipt = null;
    try {
      sceneSetupReceipt = await sceneSetupReady;
      if (sceneSetupReceipt !== null) {
        requireCvShowSceneSetupSuccess(sceneSetupReceipt, entry.id);
      }
    } catch (error) {
      if (requestId !== this.#requestId) return;
      if (this.#scheduleSceneRetry(entry.id, requestId, positionMs)) return;
      this.$.isError = true;
      this.$.errorText = this.#speechFailureText({ error, entryId: entry.id });
      this.pauseShow('scene-setup-error');
      this.#appendSystemMessage(this.$.errorText, this.#fatalErrorDetail());
      return;
    }
    if (requestId !== this.#requestId) return;
    let effectiveStartPaused = startPaused
      ? !this.#pendingTrustedPlay
      : !this.#playRequested;
    this.#pendingTrustedPlay = false;
    this.#playRequested = !effectiveStartPaused;
    this.$.isPaused = effectiveStartPaused;
    this.$.resumeRequired = effectiveStartPaused;
    let token = null;
    if (!effectiveStartPaused) {
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
    if (!effectiveStartPaused && !this.#playRequested) {
      effectiveStartPaused = true;
      if (token) this.#audioArbiter?.release?.(token);
      token = null;
    }
    this.#pendingTrustedPlay = false;
    this.#playRequested = !effectiveStartPaused;
    this.$.isPaused = effectiveStartPaused;
    this.$.resumeRequired = effectiveStartPaused;
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
      startPaused: effectiveStartPaused,
      onStart: () => {
        if (!this.#publishPhysicalStart(entry, requestId)) return;
        if (typeof onPhysicalStart !== 'function') return;
        void onPhysicalStart().catch((error) => {
          if (requestId !== this.#requestId) return;
          if (this.#scheduleSceneRetry(entry.id, requestId, positionMs)) return;
          this.$.isError = true;
          this.$.errorText = this.#speechFailureText({ error, entryId: entry.id });
          this.pauseShow('scene-setup-error');
          this.#appendSystemMessage(this.$.errorText, this.#fatalErrorDetail());
        });
      },
      onMedia: (media, clip) => this.#attachAlignedEntry(entry, media, clip, requestId, {
        positionMs,
        reason: restorePausedCheckpoint
          ? 'paused-checkpoint'
          : positionMs > 0 ? 'branch-return' : 'alignment-ready',
        sceneSetupReady,
        beforeDeferredPresentation,
        restorePausedCheckpoint,
      }),
      beforeEnd: () => this.#alignedEntry?.runtime?.whenIdle?.(),
      onEnd: () => {
        if (requestId !== this.#requestId) return;
        if (this.#lastAlignedSeekFailure) {
          releaseSpeech();
          return;
        }
        this.#speechRetryAttempts.delete(entry.id);
        this.#transportPlaying = false;
        this.#syncPlayer();
        releaseSpeech();
        if (!startedInBranch) void this.#advanceAfterAttention(requestId);
      },
      onError: (error, receipt) => {
        if (requestId !== this.#requestId) return;
        releaseSpeech();
        const failureText = this.#speechFailureText({ error, receipt, entryId: entry.id });
        if (receipt) {
          this.#recordAlignedSeekFailure(receipt, requestId, entry.id);
          return;
        }
        if (this.#scheduleSceneRetry(entry.id, requestId, positionMs)) return;
        this.$.isError = true;
        this.$.errorText = failureText;
        this.pauseShow('narration-error');
        this.#appendSystemMessage(failureText, this.#fatalErrorDetail());
      },
      onBlocked: () => {
        if (requestId !== this.#requestId) return;
        const activeToken = this.#speechToken;
        this.#speechToken = null;
        if (activeToken) {
          this.#audioArbiter?.release?.({ ...activeToken, reason: 'paused' });
        }
        this.pauseShow('autoplay-blocked');
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
    this.#transportPlaying = false;
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

  async #enterDetails(branchId, {
    contextualCardId = '',
    contextualActionId = '',
    historicalOwnerEntryId = '',
    startPaused = false,
    positionMs = 0,
    forcePrecedingSetup = false,
  } = {}) {
    const branch = this.#story?.branches?.[branchId];
    const historicalOwnerEntry = this.#story?.scenes?.find(
      ({ id }) => id === historicalOwnerEntryId,
    );
    if (!branch || !historicalOwnerEntry || this.$.inBranch) return;
    if (!this.#authoringView.mediaRegistry.entries[branch.id]?.playable) {
      this.#rejectUnavailableData();
      return;
    }
    if (!this.$.isRunning && !this.#mode) {
      if (!await this.#prepareCompletedDetailReview(historicalOwnerEntry)) return;
    }
    const returnParentEntry = this.#currentScene();
    if (
      this.#mode !== 'short'
      || !returnParentEntry
      || !this.$.isRunning
    ) return;
    const parentPositionMs = Math.round(this.#presentationPositionMs());
    const shortPlayback = {
      ...this.#session.snapshot.playback,
      positionMs: parentPositionMs,
      playbackState: 'paused',
      cueIndex: this.#sceneIndex,
      subjectId: returnParentEntry.id,
    };
    this.#branchReturnPlayback = createCvShowBranchReturnSnapshot({
      masterProjectHash: this.#authoringView.base.authoringProjectHash,
      masterRevision: this.#authoringView.base.revision,
      returnParentEntry,
      historicalOwnerEntry,
      branchEntry: branch,
      playback: shortPlayback,
      contextualCardId,
      contextualActionId,
    });
    this.#session.enterBranch(branch.id, shortPlayback);
    this.#session.setPlayback({
      episodeId: branch.id,
      cueIndex: 0,
      positionMs,
      playbackState: 'paused',
      subjectId: branch.sceneId,
    });
    this.$.inBranch = true;
    this.$.isPaused = startPaused;
    this.$.resumeRequired = startPaused;
    this.$.hasDetails = false;
    this.#presentEntry(branch, {
      startPaused,
      positionMs,
      precedingSetupEntry: forcePrecedingSetup
        ? historicalOwnerEntry
        : this.#completedDetailReview
        || historicalOwnerEntry.id !== returnParentEntry.id
        ? historicalOwnerEntry
        : null,
    });
  }

  async #prepareCompletedDetailReview(historicalOwnerEntry) {
    if (
      !this.#showCompleted
      || this.#completedDetailReviewPreparing
      || this.$.isRunning
      || this.#mode
      || this.$.inBranch
    ) return false;
    this.#completedDetailReviewPreparing = true;
    const requestId = this.#requestId;
    try {
      await this.#prepareNarrationResources();
      if (
        !this.isConnected
        || requestId !== this.#requestId
        || !this.#showCompleted
        || this.$.isRunning
        || this.#mode
      ) return false;
      const playbackEntries = [...createCvShowPlaybackEntries(this.#story, 'short')];
      const sceneIndex = playbackEntries.findIndex(({ id }) => id === historicalOwnerEntry.id);
      if (sceneIndex < 0) return false;
      this.#mode = 'short';
      this.#playbackEntries = playbackEntries;
      this.#sceneIndex = sceneIndex;
      this.#session = new ShowSessionState();
      this.#session.setPlayback({
        episodeId: 'short',
        cueIndex: sceneIndex,
        positionMs: 0,
        playbackState: 'paused',
        subjectId: historicalOwnerEntry.id,
      });
      this.$.isRunning = true;
      this.$.isPaused = true;
      this.$.resumeRequired = false;
      this.$.hasDetails = true;
      this.#completedDetailReview = true;
      this.#presentationAdmitted = false;
      this.#transportPlaying = false;
      this.#playRequested = false;
      this.#resumePending = false;
      this.#pendingStartDetail = Object.freeze({ completedDetailReview: true });
      this.#mountSharedShow();
      this.#showPlayer?.bind?.(this.#showConfig());
      return true;
    } catch {
      this.#rejectUnavailableData();
      return false;
    } finally {
      this.#completedDetailReviewPreparing = false;
    }
  }

  #returnFromDetails() {
    if (!this.$.inBranch) return;
    const restore = this.#branchReturnPlayback;
    if (restore) {
      const activeBranchId = this.#session.snapshot.playback.episodeId;
      const branchEntry = this.#story?.branches?.[activeBranchId];
      const historicalOwnerEntry = this.#story?.scenes?.find(
        ({ id }) => id === branchEntry?.sceneId,
      );
      validateCvShowBranchReturnSnapshot(restore, {
        masterProjectHash: this.#authoringView.base.authoringProjectHash,
        masterRevision: this.#authoringView.base.revision,
        returnParentEntry: this.#currentScene(),
        historicalOwnerEntry,
        branchEntry,
        contextualCardId: `${historicalOwnerEntry?.id}.actions`,
        contextualActionId: 'details',
      });
    }
    if (this.#completedDetailReview) {
      this.#session.returnFromBranch();
      this.stopShow({ completed: true });
      return;
    }
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
    this.#branchReturnPlayback = null;
    this.#showPlayer?.bind?.(this.#showConfig());
    this.#syncPlayer();
    if (restore) void this.#restoreAfterBranch(restore, this.#requestId);
  }

  async #restoreAfterBranch({ entry, playback }, requestId) {
    await this.#alignmentReady;
    if (requestId !== this.#requestId) return;
    const sceneSetupReady = this.#alignment.available
      ? null
      : this.#runSceneSetup(entry, requestId);
    await this.#speak(entry, requestId, {
      startPaused: true,
      positionMs: playback.positionMs,
      sceneSetupReady,
    });
  }

  async #resume() {
    if (!this.$.resumeRequired || this.$.mediaBlocksResume) return;
    if (!this.#activeSpeechEntry) {
      if (this.$.isError && !this.#sceneRetryScheduled) {
        this.#repeatCurrentEntry();
        return;
      }
      this.#queuePendingTrustedPlay();
      return;
    }
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
    this.#playRequested = true;
    const resumeAdmittedPresentation = this.#presentationAdmitted;
    this.#resumePending = resumeAdmittedPresentation;
    const alignedRuntime = this.#alignedEntry?.runtime || null;
    const speechAccepted = this.#speech.resume({ deferMedia: Boolean(alignedRuntime) });
    const mediaAccepted = speechAccepted === false || !alignedRuntime
      ? speechAccepted
      : alignedRuntime.resume();
    const accepted = speechAccepted !== false && mediaAccepted !== false;
    const completedCheckpoint = this.#lastAlignedGenerationReceipt?.presentationComplete === true;
    if (accepted === false) {
      this.#speech.pause();
      this.#playRequested = false;
      this.#resumePending = false;
    } else {
      this.$.isError = false;
      this.$.errorText = '';
      this.#clearSystemErrors();
      if (alignedRuntime && (resumeAdmittedPresentation || completedCheckpoint)) {
        const wasPaused = this.$.isPaused;
        this.#resumePending = false;
        this.#transportPlaying = true;
        this.$.isPaused = false;
        this.$.resumeRequired = false;
        this.$.statusText = '';
        if (wasPaused) this.#session.resume();
        this.#session.setPlayback({
          ...this.#session.snapshot.playback,
          playbackState: 'playing',
        });
        if (completedCheckpoint && !resumeAdmittedPresentation) {
          this.#presentationAdmitted = true;
          const detail = this.#pendingStartDetail || Object.freeze({});
          this.#pendingStartDetail = null;
          this.dispatchEvent(new CustomEvent('portfolio-show-start', {
            bubbles: true,
            composed: true,
            detail,
          }));
        } else {
          this.dispatchEvent(new CustomEvent('portfolio-show-resume', {
            bubbles: true,
            composed: true,
          }));
        }
      }
    }
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

  #appendAgentMessage(entry, context, { stream = true } = {}) {
    /** @type {any[]} */
    const trailingParts = [];
    if (context.actions.length) {
      trailingParts.push(actionPart(`${entry.id}.actions`, context.actions, context.payload));
    }
    const id = `show.${entry.id}.${this.#messages.length}`;
    this.#currentMessageId = id;
    if (stream) return this.#appendStreamedMessage(id, context.text, trailingParts);
    this.#messages.push({
      id,
      role: 'agent',
      parts: [{ type: 'text', text: String(context.text || '') }, ...trailingParts],
    });
    this.#syncMessages();
    return Promise.resolve(Object.freeze({
      status: 'completed',
      text: String(context.text || ''),
      progress: 1,
      durationMs: 0,
    }));
  }

  #appendStreamedMessage(id, text, trailingParts = []) {
    const textPart = { type: 'text', text: '' };
    const message = { id, role: 'agent', parts: [textPart] };
    this.#messages.push(message);
    this.#syncMessages();
    const operation = this.#messageStream.start({
      displayId: id,
      text,
      onUpdate: (nextText) => {
        textPart.text = nextText;
        this.#syncMessages();
      },
      onCompleted: () => {
        textPart.text = String(text || '');
        if (trailingParts.length && message.parts.length === 1) message.parts.push(...trailingParts);
        this.#syncMessages();
      },
    });
    return operation.promise;
  }

  #cancelMessageStreams() {
    this.#messageStream.cancel('stop');
  }

  #appendSystemMessage(text, { error = false, actions = [], actionId = '' } = {}) {
    if (!text) return;
    /** @type {any[]} */
    const parts = [{ type: error ? 'error' : 'status', text, status: error ? 'error' : 'idle' }];
    if (actions.length) parts.push(actionPart(actionId || `show-actions-${this.#messages.length}`, actions));
    this.#messages.push({ id: `show.status.${this.#messages.length}`, role: 'system', parts });
    this.#syncMessages();
  }

  #clearSystemErrors() {
    const messages = this.#messages.filter(({ role, parts = [] }) => (
      role !== 'system' || parts.every((part) => part.type !== 'error')
    ));
    if (messages.length === this.#messages.length) return;
    this.#messages = messages;
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
    const activeEntry = this.#playerEntry();
    const captionPositionMs = this.#presentationPositionMs();
    const caption = createCvShowCanonicalCaption(
      activeEntry?.subtitle || scene?.subtitle || '',
      this.#alignedEntry?.captionTrack,
      captionPositionMs,
    );
    this.#showPlayer?.setState?.({
      index: Math.max(0, this.#sceneIndex),
      playing: this.#transportPlaying,
      state: terminalState || (this.#transportPlaying ? 'playing' : this.$.isRunning ? 'paused' : 'stopped'),
      progress: { positionMs: captionPositionMs },
      caption: {
        speaker: this.$.inBranch ? this.#message('tour.details') : 'CV',
        ...caption,
      },
      tts: activeEntry ? {
        label: this.#message('tour.tts'),
        text: activeEntry.speech,
        status: terminalState || (this.#transportPlaying ? 'playing' : this.$.isRunning ? 'paused' : 'idle'),
      } : {},
    });
    this.#notifyController(terminalState);
    this.dispatchEvent(new CustomEvent('portfolio-show-route-change', {
      bubbles: true,
      composed: true,
      detail: { state: this.routeSnapshot, terminalState },
    }));
  }
}

if (!customElements.get('portfolio-show-chat')) {
  customElements.define('portfolio-show-chat', PortfolioShowChat);
}
