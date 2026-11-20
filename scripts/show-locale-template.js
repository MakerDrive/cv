#!/usr/bin/env node
/**
 * Prints the Show's source texts and timing quotes in the locale shape, ready to be translated
 * into src/static-pages/data/cvShowLocales.js. `--check <lang>` reports what a registered locale lacks.
 */
import { CV_SHOW_STORY } from '../src/static-pages/data/cvShowPresentationProject.js';
import { CV_SHOW_LOCALES } from '../src/static-pages/data/cvShowLocales.js';
import { showLocaleTemplate, validateShowLocale } from '../src/static-pages/js/tour-player/showLocale.js';

const [flag, lang] = process.argv.slice(2);
if (flag === '--check') {
  const problems = validateShowLocale(CV_SHOW_STORY, CV_SHOW_LOCALES[lang]);
  console.log(problems.length ? problems.join('\n') : `${lang}: complete`);
  process.exit(problems.length ? 1 : 0);
}
console.log(JSON.stringify(showLocaleTemplate(CV_SHOW_STORY), null, 2));
