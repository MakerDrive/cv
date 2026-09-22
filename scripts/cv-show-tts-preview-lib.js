// Per-phrase TTS preview for CV Show narration (fix-list item №10).
// Pure text pipeline: splits each narration turn into sentences, finds the
// sentences that carry pronunciation-target words, and pairs the ORIGINAL
// sentence (what the reviewer reads) with the NORMALIZED sentence (what the
// TTS engine is asked to say). No audio is generated here and no authoring
// text is mutated; normalization itself lives in src/static-pages/js/tour-player/ttsNormalize.js.

import {
  listCvShowPronunciationTargets,
  normalizeCvShowNarrationText,
} from '../src/static-pages/js/tour-player/ttsNormalize.js';

export const CV_SHOW_TTS_PREVIEW_SCHEMA = 'cv-show-tts-preview-v1';

// Dictionary matching is case-sensitive by design (exact brand spelling). The
// preview additionally reports case-insensitive hits so a reviewer can see a
// target word the engine would NOT rewrite because its spelling differs.
export const CV_SHOW_TTS_PREVIEW_FLAG_NORMALIZED = 'normalized';
export const CV_SHOW_TTS_PREVIEW_FLAG_TARGET_NOT_APPLIED = 'target-not-applied';

const SENTENCE_END = /(?<=[.!?…])\s+/u;

export function splitCvShowNarrationSentences(text) {
  const value = String(text ?? '').trim();
  if (!value) return Object.freeze([]);
  return Object.freeze(
    value
      .split(SENTENCE_END)
      .map((sentence) => sentence.trim())
      .filter(Boolean)
      .map((sentence, index) => Object.freeze({ index, text: sentence })),
  );
}

function matchedTargets(sentence, targets) {
  return Object.freeze(targets.filter((target) => sentence.includes(target)));
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function tolerantVariantRegex(target) {
  const letters = Array.from(target).map(escapeRegExp);
  return new RegExp(`\\b${letters.join('[\\s-]*')}\\b`, 'iu');
}

// Case-insensitive and space/dash-tolerant detection: catches review-worthy
// spellings like "Megavisor" or "Complex Scan" that the case- and
// spelling-exact pronunciation dictionary would leave untouched.
function caseInsensitiveTargets(sentence, targets) {
  return Object.freeze(targets.filter((target) => tolerantVariantRegex(target).test(sentence)));
}

// Build the preview documents for one narration timeline. `targets` defaults
// to the pronunciation dictionary keys — any string listed there marks a
// sentence for review. Only sentences containing at least one target (exact
// or case-insensitive spelling) produce a preview document.
export function buildCvShowTtsPreview(timeline, options = {}) {
  const targets = Object.freeze([...(options.targets ?? listCvShowPronunciationTargets())]);
  const documents = [];
  const turns = Array.isArray(timeline?.turns) ? timeline.turns : [];
  for (const turn of turns) {
    const sceneId = String(turn?.id ?? '');
    if (!sceneId) continue;
    for (const sentence of splitCvShowNarrationSentences(turn?.text)) {
      const exact = matchedTargets(sentence.text, targets);
      const anyCase = caseInsensitiveTargets(sentence.text, targets);
      if (exact.length === 0 && anyCase.length === 0) continue;
      const ttsText = normalizeCvShowNarrationText(sentence.text);
      const flags = [];
      if (ttsText !== sentence.text) flags.push(CV_SHOW_TTS_PREVIEW_FLAG_NORMALIZED);
      // A tolerant hit counts as unapplied only when no dictionary key of the
      // same case-insensitive family was applied: "Megavisor" is rewritten by
      // its own key, so it must not be reported against the sibling key.
      const appliedBases = new Set(exact.map((target) => target.toLowerCase()));
      const notApplied = anyCase.filter((target) => !appliedBases.has(target.toLowerCase()));
      if (notApplied.length > 0) flags.push(CV_SHOW_TTS_PREVIEW_FLAG_TARGET_NOT_APPLIED);
      documents.push(Object.freeze({
        sceneId,
        sentenceIndex: sentence.index,
        sourceText: sentence.text,
        ttsText,
        matchedTargets: exact,
        unappliedTargets: notApplied,
        flags: Object.freeze(flags),
      }));
    }
  }
  return Object.freeze({
    schema: CV_SHOW_TTS_PREVIEW_SCHEMA,
    targets,
    documents: Object.freeze(documents),
  });
}

// Render the preview as a browsable per-scene review listing. This text is
// what a reviewer reads before approving an audio regeneration run.
export function renderCvShowTtsPreviewListing(preview) {
  const lines = [];
  const byScene = new Map();
  for (const doc of preview?.documents ?? []) {
    if (!byScene.has(doc.sceneId)) byScene.set(doc.sceneId, []);
    byScene.get(doc.sceneId).push(doc);
  }
  for (const [sceneId, docs] of byScene) {
    lines.push(`Scene: ${sceneId}`);
    for (const doc of docs) {
      lines.push(` - source text [sentence ${doc.sentenceIndex}]: "${doc.sourceText}"`);
      lines.push(`   → tts_text: "${doc.ttsText}"`);
      const notes = [];
      if (doc.matchedTargets.length > 0) notes.push(`targets: ${doc.matchedTargets.join(', ')}`);
      if (doc.unappliedTargets.length > 0) {
        notes.push(`NOT rewritten (spelling differs from dictionary): ${doc.unappliedTargets.join(', ')}`);
      }
      lines.push(`   (${notes.join('; ') || 'no targets matched'})`);
    }
    lines.push('');
  }
  return lines.join('\n').trimEnd();
}
