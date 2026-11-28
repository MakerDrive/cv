import { createPresentationAuthoringProject } from 'symbiote-workspace/browser';
import { CV_SHOW_AUTHORING_PROJECT_INPUT } from '../../data/cvShowPresentationProject.js';
import { createCvShowRuntimeView } from '../tour-player/cvShowRuntimeAuthority.js';
import { getShowLog } from '../show-log/index.js';
import { parseCvShowMd } from './cvShowMdFormat.js';
import { applyCvShowMdScenes } from './cvShowMdProject.js';

/**
 * `?showEngine=md` makes the `.show.md` scenes the source of the CV Show: they are compiled into the presentation
 * project and handed to the runtime authority, so the player, transport, branches and failure policy run unchanged
 * on the md-authored cues. Without the flag, or when the md scenes fail to load or compile, the built-in project
 * stays the source.
 */

export const CV_SHOW_MD_ENGINE_PARAM = 'showEngine';
export const CV_SHOW_MD_ENGINE_VALUE = 'md';
const MD_ROOT = 'cv-show-md/';

/** @type {Promise<unknown> | null} */
let pendingAttach = null;

/**
 * @param {string | URL | Location | undefined} location
 */
export function isCvShowMdEngineRequested(location = globalThis.location) {
  if (!location) return false;
  let url = new URL(typeof location === 'string' ? location : location.href);
  return url.searchParams.get(CV_SHOW_MD_ENGINE_PARAM) === CV_SHOW_MD_ENGINE_VALUE;
}

/**
 * Scene ids of the project in narration order: one `.show.md` file each.
 * @param {Record<string, any>} projectInput
 */
export function cvShowMdSceneIds(projectInput = CV_SHOW_AUTHORING_PROJECT_INPUT) {
  return projectInput.cells.filter((cell) => cell.kind === 'narration').map((cell) => cell.turnId);
}

/**
 * Compiles the md scenes into a runtime source for `cvShowRuntimeAuthority.attachSource()`.
 * @param {{ scenes: Array<{ id: string, speech: string, cues: Array<{ sourceLine: string }> }>,
 *   projectInput?: Record<string, any> }} options
 */
export function createCvShowMdRuntimeSource({ scenes, projectInput = CV_SHOW_AUTHORING_PROJECT_INPUT }) {
  let snapshot = Object.freeze({
    project: createPresentationAuthoringProject(applyCvShowMdScenes(projectInput, scenes)),
  });
  let view = createCvShowRuntimeView(snapshot);
  return Object.freeze({
    read: () => snapshot,
    getView: () => view,
    // The md scenes are read once per page load; an edited scene takes effect on reload.
    subscribe: () => () => {},
  });
}

/**
 * @param {{
 *   baseUrl: string | URL,
 *   ids?: string[],
 *   fetchText?: (url: string) => Promise<string>,
 * }} options
 */
export async function loadCvShowMdScenes({
  baseUrl,
  ids = cvShowMdSceneIds(),
  fetchText = async (url) => {
    let response = await fetch(url, { cache: 'no-cache' });
    if (!response.ok) throw new Error(`md scene ${url} failed: ${response.status}`);
    return response.text();
  },
}) {
  let root = new URL(MD_ROOT, baseUrl);
  let files = await Promise.all(ids.map(async (id) => {
    let url = new URL(`${id}.show.md`, root).href;
    let show = parseCvShowMd(await fetchText(url));
    if (show.scenes.length !== 1 || show.scenes[0].id !== id) {
      throw new Error(`md scene file ${url} must hold exactly the scene "${id}"`);
    }
    return show.scenes[0];
  }));
  return files;
}

/**
 * Attaches the md source when the page asks for it. Returns the detach function, or null when the built-in project
 * stays the source.
 * @param {{
 *   authority: { attachSource: (source: any) => () => void },
 *   location?: Location | URL | string,
 *   baseUrl?: string | URL,
 *   load?: typeof loadCvShowMdScenes,
 * }} options
 */
export function attachCvShowMdEngine(options) {
  if (!isCvShowMdEngineRequested(options.location ?? globalThis.location)) return Promise.resolve(null);
  let attach = attachMdSource(options);
  pendingAttach = attach;
  attach.finally(() => {
    if (pendingAttach === attach) pendingAttach = null;
  });
  return attach;
}

/**
 * The md source still being loaded, or null. A show start waits for it: a source attached after the start would
 * replace the project under a running show and stop it.
 * @returns {Promise<unknown> | null}
 */
export function cvShowMdEnginePending() {
  return pendingAttach;
}

/**
 * @param {{
 *   authority: { attachSource: (source: any) => () => void },
 *   baseUrl?: string | URL,
 *   load?: typeof loadCvShowMdScenes,
 * }} options
 */
async function attachMdSource({
  authority,
  baseUrl = globalThis.document?.baseURI,
  load = loadCvShowMdScenes,
}) {
  let log = getShowLog();
  let startedAt = performance.now();
  try {
    let scenes = await load({ baseUrl });
    let detach = authority.attachSource(createCvShowMdRuntimeSource({ scenes }));
    log.info('engine', 'md-attached', {
      scenes: scenes.length,
      cues: scenes.reduce((sum, scene) => sum + scene.cues.length, 0),
      ms: Math.round(performance.now() - startedAt),
    });
    return detach;
  } catch (error) {
    log.error('engine', 'md-failed', { message: error?.message || String(error), line: error?.line || 0 });
    return null;
  }
}
