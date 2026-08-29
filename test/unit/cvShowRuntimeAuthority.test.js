import assert from 'node:assert/strict';
import test from 'node:test';

import { CV_SHOW_PRESENTATION_PROJECT } from '../../src/static-pages/data/cvShowPresentationProject.js';
import {
  createCvShowRuntimeAuthority,
  createCvShowRuntimeState,
  normalizeCvShowRuntimeSnapshot,
} from '../../src/static-pages/js/tour-player/cvShowRuntimeAuthority.js';

function createRuntimeSource(initialSnapshot) {
  let state = createCvShowRuntimeState(initialSnapshot);
  let listeners = new Set();
  return Object.freeze({
    read() {
      return state.snapshot;
    },
    getView() {
      return state.view;
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    publish(snapshot) {
      state = createCvShowRuntimeState(snapshot);
      for (let listener of [...listeners]) listener(state.view);
    },
    listenerCount() {
      return listeners.size;
    },
  });
}

test('public CV Show runtime authority exposes only seed-readonly projection operations', () => {
  let authority = createCvShowRuntimeAuthority();
  let view = authority.getView();
  assert.deepEqual(Object.keys(authority).sort(), ['attachSource', 'getView', 'subscribe']);
  assert.equal('read' in authority, false);
  assert.equal('enableLocal' in authority, false);
  assert.equal('mutationSession' in authority, false);
  assert.equal(view.project.hash, CV_SHOW_PRESENTATION_PROJECT.hash);
  assert.equal(view.base.revision, CV_SHOW_PRESENTATION_PROJECT.revision);
  assert.equal(Object.isFrozen(view), true);
});

test('runtime authority forwards one exact source and restores its seed after bounded detach', () => {
  let seedSnapshot = normalizeCvShowRuntimeSnapshot({
    project: CV_SHOW_PRESENTATION_PROJECT,
  });
  let nextSnapshot = structuredClone(seedSnapshot);
  let changedEntry = nextSnapshot.mediaCollection.entries.find(
    ({ entryId }) => entryId === 'workspace-details',
  );
  changedEntry.mediaAncestry.render.status = 'stale';
  changedEntry.mediaAncestry.playable = false;

  let authority = createCvShowRuntimeAuthority();
  let source = createRuntimeSource(seedSnapshot);
  let observed = [];
  let unsubscribe = authority.subscribe((view) => observed.push(view.identity.snapshot));
  let detach = authority.attachSource(source);

  assert.equal(source.listenerCount(), 1);
  assert.equal(authority.getView(), source.getView());
  assert.deepEqual(observed, [source.getView().identity.snapshot]);
  assert.throws(
    () => authority.attachSource(source),
    { code: 'CV_SHOW_RUNTIME_SOURCE_ATTACHED' },
  );

  source.publish(nextSnapshot);
  let changedView = source.getView();
  assert.equal(authority.getView(), changedView);
  assert.equal(changedView.mediaRegistry.entries['workspace-details'].playable, false);
  assert.equal(observed.at(-1), changedView.identity.snapshot);

  detach();
  assert.equal(source.listenerCount(), 0);
  assert.equal(authority.getView().project.hash, CV_SHOW_PRESENTATION_PROJECT.hash);
  assert.equal(authority.getView().mediaRegistry.entries['workspace-details'].playable, true);
  let observedAfterDetach = observed.length;
  source.publish(seedSnapshot);
  assert.equal(observed.length, observedAfterDetach);
  detach();
  assert.equal(observed.length, observedAfterDetach);
  unsubscribe();
});
