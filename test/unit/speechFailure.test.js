import assert from 'node:assert/strict';
import test from 'node:test';

import { describeCvShowMissingTarget, describeCvShowSpeechFailure } from '../../src/static-pages/js/tour-player/speechFailure.js';

test('describes an aligned seek failure receipt', () => {
  const description = describeCvShowSpeechFailure({
    receipt: Object.freeze({
      status: 'failed',
      reason: 'presentation-playback-failed',
      operationId: 'cell-42',
      phase: 'presentation-playback',
      details: Object.freeze({ message: 'attention cell rejected' }),
    }),
    entryId: 'photopizza',
  });
  assert.equal(description.causeKey, 'tour.error.speech.presentationFailed');
  assert.equal(description.code, 'presentation-playback-failed');
  assert.match(description.detail, /entry=photopizza/);
  assert.match(description.detail, /op=cell-42/);
  assert.match(description.detail, /phase=presentation-playback/);
  assert.match(description.detail, /status=failed/);
  assert.match(description.detail, /attention cell rejected/);
});

test('maps media error numbers to readable causes', () => {
  assert.equal(
    describeCvShowSpeechFailure({ error: 'media-error-4' }).causeKey,
    'tour.error.speech.mediaUnsupported',
  );
  assert.equal(
    describeCvShowSpeechFailure({ error: 'media-error-2' }).causeKey,
    'tour.error.speech.mediaNetwork',
  );
  assert.equal(
    describeCvShowSpeechFailure({ error: 'MEDIA_ERR_DECODE' }).causeKey,
    'tour.error.speech.mediaDecode',
  );
});

test('maps aligned media and scene setup failures', () => {
  assert.equal(
    describeCvShowSpeechFailure({ error: 'aligned-media-failed-alignment-unavailable' }).causeKey,
    'tour.error.speech.alignment',
  );
  const sceneSetup = Object.assign(new Error('CV Show scene setup failed: finale/cell-1/failed'), {
    code: 'CV_SHOW_SCENE_SETUP_FAILED',
    receipt: { status: 'failed' },
  });
  const description = describeCvShowSpeechFailure({ error: sceneSetup, entryId: 'finale' });
  assert.equal(description.causeKey, 'tour.error.speech.sceneSetup');
  assert.equal(description.code, 'CV_SHOW_SCENE_SETUP_FAILED');
  assert.match(description.detail, /entry=finale/);
});

test('falls back to the raw code for unknown reasons', () => {
  const description = describeCvShowSpeechFailure({ error: 'some-new-failure' });
  assert.equal(description.causeKey, '');
  assert.equal(description.code, 'some-new-failure');
  assert.equal(description.detail, 'some-new-failure');
});

test('describes a missing scene target hidden by the mobile layout', () => {
  const description = describeCvShowMissingTarget({
    id: 'agent-portal.attention.1',
    target: 'project-card.agent-portal',
    providerType: 'attention',
    policy: 'required',
    status: 'missing',
    reason: 'target-unresolved',
  });
  assert.equal(description.causeKey, 'tour.error.reason.targetUnresolved');
  assert.equal(description.code, 'target-unresolved');
  assert.match(description.detail, /step=agent-portal\.attention\.1/);
  assert.match(description.detail, /target=project-card\.agent-portal/);
  assert.match(description.detail, /kind=attention/);
  assert.match(description.detail, /reason=target-unresolved/);
});

test('describes a missing target readiness timeout without a cause key', () => {
  const description = describeCvShowMissingTarget({ id: 'finale.marker.2', reason: 'timeout' });
  assert.equal(description.causeKey, 'tour.error.reason.timeout');
  assert.equal(description.code, 'timeout');
  assert.match(description.detail, /step=finale\.marker\.2/);
  const unknown = describeCvShowMissingTarget({ reason: 'something-new' });
  assert.equal(unknown.causeKey, '');
  assert.equal(unknown.code, 'something-new');
});

test('produces an empty detail without failure context', () => {
  const description = describeCvShowSpeechFailure({});
  assert.equal(description.causeKey, '');
  assert.equal(description.code, 'unknown-error');
  assert.equal(description.detail, '');
});

test('bounds long failure messages', () => {
  const description = describeCvShowSpeechFailure({
    error: 'narration-error',
    receipt: { status: 'failed', reason: 'narration-error', details: { message: 'x'.repeat(400) } },
    entryId: 'y'.repeat(120),
  });
  assert.ok(description.detail.length <= 140);
  assert.ok(description.detail.startsWith('entry='));
});
