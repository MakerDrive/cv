import assert from 'node:assert/strict';
import test from 'node:test';

import { resolveCvShowGalleryCheckpoint } from '../../src/static-pages/js/tour-player/galleryCheckpoint.js';
import { MIN_GALLERY_FRAME_HOLD_MS } from '../../src/static-pages/js/tour-player/imsShowMediaAdapter.js';

const MONTAGE = Object.freeze({
  cellStartMs: 100_000,
  gestureDurationMs: 9_500,
  frames: Object.freeze([1, 2, 3, 4, 5]),
  frameHoldMs: 1_000,
});

test('a checkpoint inside the montage restores the frame that was on screen', () => {
  assert.deepEqual(
    resolveCvShowGalleryCheckpoint({ ...MONTAGE, checkpointMs: 100_000 }),
    { frame: 1, index: 0, overlayOpen: true },
  );
  assert.equal(resolveCvShowGalleryCheckpoint({ ...MONTAGE, checkpointMs: 100_999 }).frame, 1);
  assert.equal(resolveCvShowGalleryCheckpoint({ ...MONTAGE, checkpointMs: 101_000 }).frame, 2);
  assert.equal(resolveCvShowGalleryCheckpoint({ ...MONTAGE, checkpointMs: 104_000 }).frame, 5);
  assert.equal(
    resolveCvShowGalleryCheckpoint({ ...MONTAGE, checkpointMs: 109_499 }).frame,
    5,
    'the last hold runs to the end of the gesture',
  );
});

test('a checkpoint outside the montage keeps the state the show found', () => {
  assert.equal(
    resolveCvShowGalleryCheckpoint({ ...MONTAGE, checkpointMs: 99_999 }),
    null,
    'before the montage the gallery is untouched',
  );
  assert.equal(
    resolveCvShowGalleryCheckpoint({ ...MONTAGE, checkpointMs: 109_500 }),
    null,
    'after the montage the gallery returns to its pre-montage state',
  );
  assert.equal(resolveCvShowGalleryCheckpoint({ ...MONTAGE, frames: [] }), null);
  assert.equal(
    resolveCvShowGalleryCheckpoint({ ...MONTAGE, gestureDurationMs: 0 }),
    null,
    'a montage with no gesture window cannot be placed on the clock',
  );
});

test('a montage hold shorter than the reading floor is paced by the floor', () => {
  assert.equal(MIN_GALLERY_FRAME_HOLD_MS, 1_000);
  const resolved = resolveCvShowGalleryCheckpoint({
    ...MONTAGE,
    frameHoldMs: 100,
    gestureDurationMs: 2_000,
    checkpointMs: 100_400,
  });
  assert.equal(
    resolved.frame,
    1,
    'an authored hold below the floor still holds its frame for the floor, so the 400 ms checkpoint is still frame 1',
  );
});
