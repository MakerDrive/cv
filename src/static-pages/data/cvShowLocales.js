/**
 * Show narrations for languages without recorded audio, spoken by the browser's voice.
 * Shape and rules: see static-pages/js/tour-player/showLocale.js. A language is added here
 * only when `validateShowLocale` reports no problems for it.
 * @type {Record<string, { scenes: Record<string, any>, branches: Record<string, any> }>}
 */
import { CV_SHOW_LOCALE_EN } from './showLocales/en.js';
import { CV_SHOW_LOCALE_ES } from './showLocales/es.js';

export const CV_SHOW_LOCALES = { en: CV_SHOW_LOCALE_EN, es: CV_SHOW_LOCALE_ES };
