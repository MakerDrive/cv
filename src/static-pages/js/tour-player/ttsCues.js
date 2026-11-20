import { CV_SHOW_PRESENTATION_PROJECT, projectCvShowDirective } from '../../data/cvShowPresentationProject.js';

const scrollCells = new Map(CV_SHOW_PRESENTATION_PROJECT.cells
  .filter(({ id }) => id.endsWith(':scroll')).map((cell) => [cell.id, cell]));

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
    const scrollCell = scrollCells.get(`cv-show:cue:${directive.id}:scroll`);
    if (scrollCell) {
      cues.push({
        id: scrollCell.id,
        ...timing,
        offsetMs: (scrollCell.timing.at?.offsetMs || 0) - (scrollCell.timing.leadMs || 0),
        directive: projectCvShowDirective(scrollCell, CV_SHOW_PRESENTATION_PROJECT),
        scroll: true,
      });
    }
    cues.push({ id: directive.id, ...timing, offsetMs: directive.timing?.offsetMs || 0, directive });
    return cues;
  });
}
