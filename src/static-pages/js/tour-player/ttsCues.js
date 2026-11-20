import { planCues } from './ttsNarration.js';
import { CV_SHOW_PRESENTATION_PROJECT, projectCvShowDirective } from '../../data/cvShowPresentationProject.js';

const cueCells = new Map(CV_SHOW_PRESENTATION_PROJECT.cells
  .filter(({ kind }) => kind === 'cue').map((cell) => [cell.id, cell]));

/**
 * Cues of one entry for the browser voice: every directive at the moment of its quote, and, like the
 * recorded show, a scroll of its accent into view ahead of each directive that has a scroll cell.
 * @param {Array<any>} directives visual directives of the entry
 */
export function buildTimedCues(directives) {
  return directives.flatMap((directive) => {
    const timing = {
      quote: directive.timing?.quote || '',
      occurrence: directive.timing?.occurrence || 1,
    };
    const cues = [];
    const scrollCell = cueCells.get(`cv-show:cue:${directive.id}:scroll`);
    if (scrollCell) {
      cues.push({
        id: scrollCell.id,
        ...timing,
        offsetMs: (scrollCell.timing.at?.offsetMs || 0) - (scrollCell.timing.leadMs || 0),
        directive: projectCvShowDirective(scrollCell, CV_SHOW_PRESENTATION_PROJECT),
        budgetMs: Number(scrollCell.timing?.gestureDurationMs) || 0,
        scroll: true,
      });
    }
    cues.push({
      id: directive.id,
      ...timing,
      offsetMs: directive.timing?.offsetMs || 0,
      directive,
      // The authored gesture slot: the presenter fits its approach, action and hold into it, as in the recorded show.
      budgetMs: Number(cueCells.get(`cv-show:cue:${directive.id}`)?.timing?.gestureDurationMs) || 0,
    });
    return cues;
  });
}

/**
 * Restoring a position skips the cues before it; the page must still stand where the narration left it.
 * That is the scroll of the last skipped cue that has one.
 * @param {string} speech narration of the entry
 * @param {Array<any>} cues from buildTimedCues
 * @param {number} positionMs restored position (estimated narration time)
 */
export function restoredScrollCue(speech, cues, positionMs) {
  if (!(positionMs > 0)) return null;
  const { timing, planned } = planCues(speech, cues);
  const index = timing.sentences.findIndex((span) => positionMs < span.endMs);
  const startSentence = index < 0 ? timing.sentences.length - 1 : index;
  // The voice restarts at the sentence start; every scroll due by then (leads reach back from the quote) counts.
  const restartMs = timing.sentences[startSentence].startMs;
  const due = planned
    .map((item) => ({ item, at: timing.sentences[item.sentence].startMs + item.offsetMs }))
    .filter(({ item, at }) => /** @type {any} */ (item.cue).scroll && at <= restartMs + 50)
    .sort((a, b) => a.at - b.at);
  return due.length ? /** @type {any} */ (due.at(-1).item.cue) : null;
}
