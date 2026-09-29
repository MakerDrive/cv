import assert from 'node:assert/strict';
import test from 'node:test';

import { createCvShowMediaTargetResolver } from '../../src/static-pages/js/tour-player/showMediaTargetResolution.js';
import { PORTFOLIO_SHOW_SEQUENCE_MEDIA_IDS } from '../../src/static-pages/data/portfolioMediaCatalog.js';

test('every catalogued IMS frame sequence is operable, whatever the project', () => {
  const iframe = { localName: 'iframe' };
  const slots = new Map(PORTFOLIO_SHOW_SEQUENCE_MEDIA_IDS.map((mediaId) => {
    // One viewer object per media id, the way a mounted host really behaves.
    const viewer = { localName: 'ims-viewer', mediaId };
    return [mediaId, { querySelector: selector => (selector === 'ims-viewer' ? viewer : null) }];
  }));
  slots.set('media/photopizza/youtube/demo', {
    querySelector: selector => (selector.includes('iframe') ? iframe : null),
  });
  const document = {
    querySelector(selector) {
      const match = selector.match(/^\[data-media-id="(.+)"\]$/u);
      return match ? slots.get(match[1]) || null : null;
    },
  };
  const imsTargets = [];
  const resolve = createCvShowMediaTargetResolver({
    document,
    resolveTarget: () => null,
    createImsTarget(element) {
      const target = { kind: 'ims-target', element };
      imsTargets.push(target);
      return target;
    },
  });

  assert.equal(resolve('media/photopizza/youtube/demo'), null, 'YouTube stays a passive block');
  // Every gallery and spinner in the catalog resolves, so a gallery added to
  // the site is operable without touching the show mechanism.
  for (const mediaId of PORTFOLIO_SHOW_SEQUENCE_MEDIA_IDS) {
    const target = resolve(mediaId);
    assert.ok(target, `${mediaId} resolves`);
    assert.equal(target.element.mediaId, mediaId);
    assert.equal(resolve(mediaId), target, `${mediaId} keeps one stable host target`);
  }
  assert.equal(imsTargets.length, PORTFOLIO_SHOW_SEQUENCE_MEDIA_IDS.length);
  assert.ok(
    PORTFOLIO_SHOW_SEQUENCE_MEDIA_IDS.includes('media/agent-portal/ims/gallery'),
    'the second catalogued gallery is reachable too, not only BoothBot',
  );
});

test('Show media resolution does not expose native HTML media playback', () => {
  const video = {
    localName: 'video',
    matches: selector => selector === 'video, audio',
  };
  const resolve = createCvShowMediaTargetResolver({
    document: { querySelector: () => null },
    resolveTarget: () => ({
      matches: () => false,
      querySelector: selector => selector === 'video, audio' ? video : null,
    }),
    createImsTarget: (root) => ({ kind: 'ims-target', root }),
  });

  assert.equal(resolve('article.example.video'), null);
});

test('IMS resolution returns one stable host target before the async viewer mount', () => {
  let viewer = null;
  const mediaHost = {
    descriptor: { activation: { provider: 'ims' } },
    matches: selector => selector === 'sn-media-host',
    querySelector: selector => selector === 'ims-viewer' ? viewer : null,
  };
  const slot = {
    matches: () => false,
    querySelector(selector) {
      if (selector === 'sn-media-host') return mediaHost;
      if (selector === 'ims-viewer') return viewer;
      return null;
    },
  };
  const created = [];
  const resolve = createCvShowMediaTargetResolver({
    document: { querySelector: () => slot },
    createImsTarget(element) {
      const target = { kind: 'ims-target', element };
      created.push(target);
      return target;
    },
  });

  const beforeMount = resolve('media/boothbot/ims/gallery');
  assert.ok(beforeMount);
  assert.equal(beforeMount.element, mediaHost);
  viewer = { localName: 'ims-viewer' };
  assert.equal(resolve('media/boothbot/ims/gallery'), beforeMount);
  assert.equal(created.length, 1);
});

test('every media target the authored Show drives is a catalogued frame sequence', async () => {
  const { CV_SHOW_PRESENTATION_PROJECT: project } = await import(
    '../../src/static-pages/data/cvShowPresentationProject.js'
  );
  const { projectCvShowDirective } = await import(
    '../../src/static-pages/js/tour-player/presentationProjectAdapter.js'
  );
  // The catalog is the CAPABILITY set ("what the show may drive"), the authored
  // Project is the ACTIVATION set ("what the show actually drives"). Operable
  // is their intersection, so the two must never disagree: a media cell aimed
  // at a YouTube or image block would otherwise fail silently at playback.
  //
  // Scoped to click cues because that is the only interaction a montage is
  // driven through — the same boundary the gallery checkpoint walks — and
  // because `projectCvShowDirective` re-validates the whole authored Project
  // on every call, so projecting all 254 cells would cost ~20s for cells the
  // show can never drive a media sequence from.
  const clickCells = project.cells.filter((cell) => (
    cell.cue?.interaction?.type === 'click'
  ));
  assert.ok(clickCells.length > 0, 'the canonical Project still carries click cues');

  const driven = new Map();
  for (const cell of clickCells) {
    const directive = projectCvShowDirective(cell, project);
    if (directive?.type === 'media') driven.set(cell.id, String(directive.target || ''));
  }

  assert.ok(driven.size > 0, 'the canonical Project still drives at least one media sequence');
  for (const [cellId, target] of driven) {
    assert.ok(
      PORTFOLIO_SHOW_SEQUENCE_MEDIA_IDS.includes(target),
      `authored cell ${cellId} drives "${target}", which the catalog does not expose as a frame sequence`,
    );
  }
});
