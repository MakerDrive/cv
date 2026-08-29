import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';

import { materializeCvShowAuthoringDraft } from '../../scripts/cv-show-authoring-materializer.js';
import { runCvShowAuthoringCli } from '../../scripts/cv-show-authoring.js';

const REPO_ROOT = path.resolve(new URL('../..', import.meta.url).pathname);
const SOURCE = path.join(REPO_ROOT, 'src/static-pages/data/cvShowPresentationProject.js');

test('legacy materializer requires an aggregate audio release before any repository access', async () => {
  await assert.rejects(materializeCvShowAuthoringDraft({
    repoRoot: '/definitely/missing/repository',
    storageRoot: '/definitely/missing/storage',
    sessionId: 'not-opened',
  }), { code: 'CV_SHOW_AUTHORING_AUDIO_RELEASE_REQUIRED' });
});

test('syntactically valid legacy CLI materialize propagates the aggregate-release requirement', async () => {
  let before = await readFile(SOURCE);
  let reported = [];
  await assert.rejects(runCvShowAuthoringCli([
    'materialize',
    '--session-id', '0123456789abcdef',
    '--draft-hash', `sha256:${'a'.repeat(64)}`,
    '--expected-source-revision', '0',
    '--expected-source-hash', 'project-hash',
    '--expected-source-sha256', `sha256:${'b'.repeat(64)}`,
  ], { reporter: (message) => reported.push(message) }), {
    code: 'CV_SHOW_AUTHORING_AUDIO_RELEASE_REQUIRED',
  });
  assert.deepEqual(reported, []);
  assert.deepEqual(await readFile(SOURCE), before);
});

test('legacy CLI keeps rejecting force and target escape hatches', async () => {
  for (let args of [
    ['materialize', '--force', 'true'],
    ['materialize', '--target', 'other.js'],
  ]) {
    await assert.rejects(
      runCvShowAuthoringCli(args, { reporter: () => undefined }),
      { code: 'CV_SHOW_AUTHORING_CLI_INVALID' },
    );
  }
});
