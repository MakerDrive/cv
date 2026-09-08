import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  CV_SHOW_REENTRY_DECISION,
  resolveCvShowChatReentry,
} from '../../src/static-pages/js/tour-player/showReentryPolicy.js';

test('stale resume after player close re-enters Short Show', () => {
  assert.equal(resolveCvShowChatReentry({
    actionId: 'resume',
    running: false,
    mode: '',
    inBranch: false,
  }), CV_SHOW_REENTRY_DECISION.RESTART_SHORT);
});

test('stale return after player close re-enters Short Show', () => {
  assert.equal(resolveCvShowChatReentry({
    actionId: 'return',
    running: false,
    mode: '',
    inBranch: false,
  }), CV_SHOW_REENTRY_DECISION.RESTART_SHORT);
});

test('other stale actions on a stopped show stay ignored', () => {
  for (const actionId of ['start-short', 'details', 'skip-media', 'show-retry', '']) {
    assert.equal(resolveCvShowChatReentry({
      actionId,
      running: false,
      mode: '',
      inBranch: false,
    }), CV_SHOW_REENTRY_DECISION.IGNORE);
  }
});

test('paused live show keeps the live resume path', () => {
  assert.equal(resolveCvShowChatReentry({
    actionId: 'resume',
    running: false,
    mode: 'short',
    inBranch: false,
  }), CV_SHOW_REENTRY_DECISION.CONTINUE_LIVE);
});

test('running live show keeps the live paths', () => {
  assert.equal(resolveCvShowChatReentry({
    actionId: 'resume',
    running: true,
    mode: 'short',
    inBranch: false,
  }), CV_SHOW_REENTRY_DECISION.CONTINUE_LIVE);
  assert.equal(resolveCvShowChatReentry({
    actionId: 'return',
    running: true,
    mode: 'short',
    inBranch: true,
  }), CV_SHOW_REENTRY_DECISION.CONTINUE_LIVE);
});

test('stale return outside a branch on a live show stays ignored', () => {
  assert.equal(resolveCvShowChatReentry({
    actionId: 'return',
    running: true,
    mode: 'short',
    inBranch: false,
  }), CV_SHOW_REENTRY_DECISION.IGNORE);
});
