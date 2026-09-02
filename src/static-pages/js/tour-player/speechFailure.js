const MEDIA_ERROR_KEYS = new Map([
  [1, 'tour.error.speech.mediaAborted'],
  [2, 'tour.error.speech.mediaNetwork'],
  [3, 'tour.error.speech.mediaDecode'],
  [4, 'tour.error.speech.mediaUnsupported'],
]);

const MEDIA_ERROR_CODES = new Map([
  ['MEDIA_ERR_ABORTED', 1],
  ['MEDIA_ERR_NETWORK', 2],
  ['MEDIA_ERR_DECODE', 3],
  ['MEDIA_ERR_SRC_NOT_SUPPORTED', 4],
]);

const EXACT_REASON_KEYS = new Map([
  ['alignment-unavailable', 'tour.error.speech.alignment'],
  ['missing-terminal-receipt', 'tour.error.speech.alignment'],
  ['CV_SHOW_AUDIO_ALIGNMENT_INVALID', 'tour.error.speech.alignment'],
  ['CV_SHOW_RUNTIME_MEDIA_ADMISSION_REJECTED', 'tour.error.speech.alignment'],
  ['CV_SHOW_SCENE_SETUP_FAILED', 'tour.error.speech.sceneSetup'],
  ['CV_SHOW_PRESENTATION_OPERATION_UNHANDLED', 'tour.error.speech.presentationUnhandled'],
  ['CV_SHOW_PRESENTATION_OPERATION_FAILED', 'tour.error.speech.presentationFailed'],
  ['CV_SHOW_PRESENTATION_PROVIDER_REJECTED', 'tour.error.speech.presentationFailed'],
  ['CV_SHOW_PRESENTATION_PROVIDER_FAILED', 'tour.error.speech.presentationFailed'],
  ['presentation-playback-failed', 'tour.error.speech.presentationFailed'],
  ['presentation-preroll-failed', 'tour.error.speech.presentationFailed'],
  ['PRESENTATION_PLAYBACK_CELL_FAILED', 'tour.error.speech.presentationFailed'],
  ['PRESENTATION_PLAYBACK_CELL_NOT_ACTIVATED', 'tour.error.speech.presentationFailed'],
  ['PRESENTATION_PLAYBACK_CELL_INCOMPLETE', 'tour.error.speech.presentationFailed'],
  ['PRESENTATION_PLAYBACK_DEPENDENCY_BLOCKED', 'tour.error.speech.presentationFailed'],
  ['CV_SHOW_AUDIO_CLIP_ENDED_EARLY', 'tour.error.speech.clipEndedEarly'],
  ['CV_SHOW_AUDIO_CLIP_PLAYBACK_FAILED', 'tour.error.speech.clipPlaybackFailed'],
  ['CV_SHOW_AUDIO_CLIP_TRANSPORT_INVALID', 'tour.error.speech.clipTransportInvalid'],
  ['synthesis-failed', 'tour.error.speech.speechSynthesis'],
  ['voice-unavailable', 'tour.error.speech.speechSynthesis'],
  ['language-unavailable', 'tour.error.speech.speechSynthesis'],
  ['audio-busy', 'tour.error.speech.speechSynthesis'],
  ['audio-error', 'tour.error.speech.speechSynthesis'],
  ['network', 'tour.error.speech.mediaNetwork'],
]);

const DETAIL_PART_LIMIT = 140;
const DETAIL_MESSAGE_LIMIT = 100;

function boundedPart(value, limit = DETAIL_PART_LIMIT) {
  const text = String(value ?? '').replace(/\s+/gu, ' ').trim();
  return text ? text.slice(0, limit) : '';
}

function firstStackFrame(stack) {
  const frame = String(stack || '')
    .split('\n')
    .map((line) => line.trim())
    .find((line) => line.startsWith('at '));
  if (!frame) return '';
  return boundedPart(frame.replace(/^at\s+/, ''), 100);
}

function firstText(...values) {
  for (const value of values) {
    const text = String(value ?? '').trim();
    if (text) return text;
  }
  return '';
}

function resolveMediaKey(reason) {
  const direct = MEDIA_ERROR_KEYS.get(reason);
  if (direct) return direct;
  const named = reason.match(/^(?:media-error-)?(\d+)$/u);
  if (named) return MEDIA_ERROR_KEYS.get(Number(named[1])) || '';
  return MEDIA_ERROR_KEYS.get(MEDIA_ERROR_CODES.get(reason) || 0) || '';
}

function resolveCauseKey(reason) {
  const mediaKey = resolveMediaKey(reason);
  if (mediaKey) return mediaKey;
  if (reason.startsWith('aligned-media-')) return 'tour.error.speech.alignment';
  if (reason.startsWith('presentation-')) return 'tour.error.speech.presentationFailed';
  if (reason.startsWith('CV_SHOW_SCENE_SETUP')) return 'tour.error.speech.sceneSetup';
  if (reason.startsWith('CV_SHOW_PRESENTATION')) return 'tour.error.speech.presentationFailed';
  if (reason.startsWith('PRESENTATION_')) return 'tour.error.speech.presentationFailed';
  if (reason.startsWith('CV_SHOW_AUDIO_CLIP')) return 'tour.error.speech.clipTransportInvalid';
  return EXACT_REASON_KEYS.get(reason) || '';
}

const TARGET_REASON_KEYS = new Map([
  ['target-unresolved', 'tour.error.reason.targetUnresolved'],
  ['timeout', 'tour.error.reason.timeout'],
  ['navigation-rejected', 'tour.error.reason.navigationRejected'],
  ['media-unresolved', 'tour.error.reason.mediaMissing'],
  ['media-unavailable', 'tour.error.reason.mediaUnavailable'],
  ['presentation-unavailable', 'tour.error.reason.presentationUnavailable'],
]);

/**
 * Describes a CV Show scene step that could not be shown: which authored step
 * failed, which semantic target was involved, and why it stayed hidden or
 * unresolved (for example an element hidden by the mobile drawer layout).
 *
 * @param {null | { id?: unknown, target?: unknown, providerType?: unknown, reason?: unknown }} receipt
 * @returns {{ causeKey: string, code: string, detail: string }}
 */
export function describeCvShowMissingTarget(receipt) {
  const code = boundedPart(receipt?.reason) || 'unknown-reason';
  const detailParts = [];
  const step = boundedPart(receipt?.id, 80);
  if (step) detailParts.push(`step=${step}`);
  const target = boundedPart(receipt?.target, 80);
  if (target) detailParts.push(`target=${target}`);
  const kind = boundedPart(receipt?.providerType, 40);
  if (kind) detailParts.push(`kind=${kind}`);
  detailParts.push(`reason=${code}`);
  return Object.freeze({
    causeKey: TARGET_REASON_KEYS.get(code) || '',
    code,
    detail: boundedPart(detailParts.join(' ')),
  });
}

/**
 * Describes a CV Show narration failure as a bounded, diagnosable detail:
 * a readable cause translation key (when known) plus a raw technical code
 * and context fragment suitable for on-screen diagnostics.
 *
 * @param {{
 *   error?: null | string | { code?: unknown, name?: unknown, message?: unknown, stack?: unknown, details?: { cause?: unknown, targets?: unknown, terminalStatus?: unknown } },
 *   receipt?: null | { status?: unknown, reason?: unknown, terminalReason?: unknown,
 *     operationId?: unknown, phase?: unknown, requestedMs?: unknown, observedMs?: unknown,
 *     details?: { message?: unknown, cause?: unknown, targets?: unknown, terminalStatus?: unknown } },
 *   entryId?: unknown,
 * }} [failure]
 * @returns {{ causeKey: string, code: string, detail: string }}
 */
export function describeCvShowSpeechFailure({ error, receipt, entryId } = {}) {
  const source = error && typeof error === 'object' ? error : null;
  const reason = firstText(
    typeof receipt?.reason === 'string' ? receipt.reason : '',
    typeof receipt?.terminalReason === 'string' ? receipt.terminalReason : '',
    typeof error === 'string' ? error : '',
    typeof source?.code === 'string' ? source.code : '',
    typeof source?.name === 'string' ? source.name : '',
  );
  const code = boundedPart(reason) || 'unknown-error';
  const innerCause = boundedPart(receipt?.details?.cause ?? source?.details?.cause, 80);
  const targets = boundedPart(receipt?.details?.targets ?? source?.details?.targets, 120);
  const detailParts = [];
  const entry = boundedPart(entryId, 80);
  if (entry) detailParts.push(`entry=${entry}`);
  const operation = boundedPart(receipt?.operationId, 80);
  if (operation) detailParts.push(`op=${operation}`);
  const phase = boundedPart(receipt?.phase, 40);
  if (phase) detailParts.push(`phase=${phase}`);
  const mediaKey = resolveMediaKey(code);
  if (mediaKey) detailParts.push(`media=${code}`);
  const receiptStatus = boundedPart(receipt?.status, 40);
  if (receiptStatus && receiptStatus !== 'completed') detailParts.push(`status=${receiptStatus}`);
  const terminalStatus = boundedPart(receipt?.details?.terminalStatus ?? source?.details?.terminalStatus, 40);
  if (terminalStatus) detailParts.push(`terminal=${terminalStatus}`);
  if (targets) detailParts.push(`targets=${targets}`);
  const message = boundedPart(
    receipt?.details?.message ?? source?.message ?? firstStackFrame(source?.stack) ?? '',
    DETAIL_MESSAGE_LIMIT,
  );
  if (message && message !== code) detailParts.push(message);
  const assembledDetail = boundedPart(detailParts.join(' '));
  const causeKey = TARGET_REASON_KEYS.get(innerCause)
    || resolveCauseKey(innerCause)
    || resolveCauseKey(code);
  return Object.freeze({
    causeKey,
    code,
    detail: assembledDetail || (code === 'unknown-error' ? '' : code),
  });
}
