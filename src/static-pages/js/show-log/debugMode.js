import { getShowLog } from './index.js';
import { startShowProbe } from './probe.js';
import { checkRigTrace } from './rigInvariants.js';

const CHECK_EVERY_MS = 1000;
const WINDOW_MS = 60_000;
const DEDUPE_SLACK_MS = 600;

let users = 0;
let stop = null;

function start(doc) {
  const log = getShowLog();
  const win = doc.defaultView;
  const stopProbe = startShowProbe(doc);
  const reportedUntil = new Map();

  // The robot invariants run on the live trace; every new violation is one
  // warning in the log, so the console (and its report) shows what broke and when.
  const check = () => {
    const entries = log.entries();
    const last = entries[entries.length - 1];
    if (!last) return;
    const recent = entries.filter((entry) => entry.at >= last.at - WINDOW_MS);
    for (const violation of checkRigTrace(recent)) {
      const seen = reportedUntil.get(violation.rule) ?? -Infinity;
      if (violation.at <= seen + DEDUPE_SLACK_MS) {
        reportedUntil.set(violation.rule, Math.max(seen, violation.until ?? violation.at));
        continue;
      }
      reportedUntil.set(violation.rule, violation.until ?? violation.at);
      log.warn('check', violation.rule, { at: Math.round(violation.at), ...violation.detail });
    }
  };
  const timer = setInterval(check, CHECK_EVERY_MS);

  const onError = (event) => log.error('page', 'error', {
    message: event.message, file: event.filename, line: event.lineno,
  });
  const onRejection = (event) => log.error('page', 'unhandled-rejection', {
    reason: event.reason instanceof Error ? event.reason : String(event.reason),
  });
  win.addEventListener('error', onError);
  win.addEventListener('unhandledrejection', onRejection);
  log.info('debug', 'on', { checks: ['arm-flap', 'claw-leaves-frame', 'arm-short', 'body-in-frame'] });

  return () => {
    clearInterval(timer);
    stopProbe();
    win.removeEventListener('error', onError);
    win.removeEventListener('unhandledrejection', onRejection);
    log.info('debug', 'off', {});
  };
}

/**
 * Debug mode of the Show: on while at least one console is open. Reference
 * counted, so two consoles never double the probe or the checks.
 *
 * @returns {() => void} release function
 */
export function acquireShowDebug(doc = document) {
  if (users++ === 0) stop = start(doc);
  let released = false;
  return () => {
    if (released) return;
    released = true;
    if (--users === 0) { stop?.(); stop = null; }
  };
}
