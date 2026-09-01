import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import {
  mkdir,
  mkdtemp,
  readFile,
  rm,
  writeFile,
} from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { pathToFileURL } from 'node:url';
import { computeIntegrity } from 'symbiote-workspace/schema/canonical-json.js';

import {
  materializeCvShowAuthoringDraft,
  replaceCvShowSource,
} from '../../scripts/cv-show-authoring-materializer.js';
import { runCvShowAuthoringCli } from '../../scripts/cv-show-authoring.js';
import { createCvShowAudioReleaseDescriptor } from '../../scripts/cv-show-audio-pipeline.js';
import {
  CV_SHOW_AUDIO_RELEASE,
  CV_SHOW_PRESENTATION_PROJECT,
} from '../../src/static-pages/data/cvShowPresentationProject.js';

const REPO_ROOT = path.resolve(new URL('../..', import.meta.url).pathname);
const SOURCE = path.join(REPO_ROOT, 'src/static-pages/data/cvShowPresentationProject.js');
const PROJECT_FACTORY_URL = pathToFileURL(path.join(
  REPO_ROOT,
  'node_modules/symbiote-workspace/browser.js',
)).href;

function sha256(value) {
  return `sha256:${createHash('sha256').update(value).digest('hex')}`;
}

function sourceModule({ project, release }) {
  return `import { createPresentationAuthoringProject } from ${JSON.stringify(PROJECT_FACTORY_URL)};
export const SOURCE_PREFIX_PRESERVED = 'before';
export const CV_SHOW_AUTHORING_PROJECT_INPUT =
/* CV_SHOW_AUTHORING_PROJECT_INPUT:START */
${JSON.stringify(project, null, 2)}
/* CV_SHOW_AUTHORING_PROJECT_INPUT:END */;
export const SOURCE_MIDDLE_PRESERVED = 'between';
export const CV_SHOW_AUDIO_RELEASE =
/* CV_SHOW_AUDIO_RELEASE_INPUT:START */
${JSON.stringify(release, null, 2)}
/* CV_SHOW_AUDIO_RELEASE_INPUT:END */;
export const CV_SHOW_PRESENTATION_PROJECT = createPresentationAuthoringProject(
  CV_SHOW_AUTHORING_PROJECT_INPUT,
);
export const SOURCE_SUFFIX_PRESERVED = 'after';
`;
}

function outsideSentinelBlocks(source) {
  return source
    .replace(
      /(\/\* CV_SHOW_AUTHORING_PROJECT_INPUT:START \*\/)[\s\S]*?(\/\* CV_SHOW_AUTHORING_PROJECT_INPUT:END \*\/)/u,
      '$1\n<PROJECT>\n$2',
    )
    .replace(
      /(\/\* CV_SHOW_AUDIO_RELEASE_INPUT:START \*\/)[\s\S]*?(\/\* CV_SHOW_AUDIO_RELEASE_INPUT:END \*\/)/u,
      '$1\n<RELEASE>\n$2',
    );
}

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

test('source replacement atomically migrates an exact legacy v1 selection to an approved v2 selection', async (t) => {
  let repoRoot = await mkdtemp(path.join(tmpdir(), 'cv-show-v1-v2-materializer-'));
  t.after(() => rm(repoRoot, { recursive: true, force: true }));
  await writeFile(path.join(repoRoot, 'package.json'), '{"type":"module"}\n');
  let target = path.join(repoRoot, 'src/static-pages/data/cvShowPresentationProject.js');
  await mkdir(path.dirname(target), { recursive: true });

  let legacyProjectInput = {
    schemaVersion: 'workspace-presentation-authoring-project-v1',
    id: 'cv-show',
    revision: 53,
  };
  let legacyProject = {
    ...legacyProjectInput,
    hash: `${legacyProjectInput.schemaVersion}:${computeIntegrity(legacyProjectInput)}`,
  };
  let legacyReleaseInput = {
    ...structuredClone(CV_SHOW_AUDIO_RELEASE),
    project: {
      revision: legacyProject.revision,
      authoringProjectHash: legacyProject.hash,
    },
  };
  delete legacyReleaseInput.releaseId;
  let legacyRelease = createCvShowAudioReleaseDescriptor(legacyReleaseInput);
  let before = sourceModule({ project: legacyProjectInput, release: legacyRelease });
  await writeFile(target, before);

  let releaseInput = {
    ...structuredClone(CV_SHOW_AUDIO_RELEASE),
    project: {
      revision: CV_SHOW_PRESENTATION_PROJECT.revision,
      authoringProjectHash: CV_SHOW_PRESENTATION_PROJECT.hash,
    },
  };
  delete releaseInput.releaseId;
  let release = createCvShowAudioReleaseDescriptor(releaseInput);
  let approval = {
    approved: true,
    releaseId: release.releaseId,
    artifactTreeHash: release.artifactTreeHash,
    verificationHash: release.verificationHash,
  };
  let replacementInput = {
    repoRoot,
    expectedSourceSha256: sha256(Buffer.from(before)),
    expectedProject: {
      revision: legacyProject.revision,
      authoringProjectHash: legacyProject.hash,
    },
    expectedReleaseId: legacyRelease.releaseId,
    project: CV_SHOW_PRESENTATION_PROJECT,
    release,
    approval,
  };
  for (let stale of [
    { expectedProject: { ...replacementInput.expectedProject, revision: 54 } },
    {
      expectedProject: {
        ...replacementInput.expectedProject,
        authoringProjectHash: `${legacyProjectInput.schemaVersion}:sha256-${'A'.repeat(43)}=`,
      },
    },
    { expectedReleaseId: `cv-show-audio-release-v1:${'0'.repeat(64)}` },
  ]) {
    await assert.rejects(replaceCvShowSource({ ...replacementInput, ...stale }), {
      code: 'CV_SHOW_AUTHORING_SOURCE_STALE',
    });
    assert.equal(await readFile(target, 'utf8'), before);
  }

  let forgedLegacyRelease = {
    ...legacyRelease,
    releaseId: `cv-show-audio-release-v1:${'f'.repeat(64)}`,
  };
  let forgedBefore = sourceModule({
    project: legacyProjectInput,
    release: forgedLegacyRelease,
  });
  await writeFile(target, forgedBefore);
  await assert.rejects(replaceCvShowSource({
    ...replacementInput,
    expectedSourceSha256: sha256(Buffer.from(forgedBefore)),
    expectedReleaseId: forgedLegacyRelease.releaseId,
  }), { code: 'CV_SHOW_AUTHORING_SOURCE_STALE' });
  assert.equal(await readFile(target, 'utf8'), forgedBefore);
  await writeFile(target, before);

  let replaced = await replaceCvShowSource(replacementInput);

  assert.equal(replaced.project.schemaVersion, 'workspace-presentation-authoring-project-v2');
  assert.equal(replaced.project.hash, CV_SHOW_PRESENTATION_PROJECT.hash);
  assert.equal(replaced.release.releaseId, release.releaseId);
  let after = await readFile(target, 'utf8');
  assert.match(after, /SOURCE_PREFIX_PRESERVED = 'before'/u);
  assert.match(after, /SOURCE_MIDDLE_PRESERVED = 'between'/u);
  assert.match(after, /SOURCE_SUFFIX_PRESERVED = 'after'/u);
  assert.equal(outsideSentinelBlocks(after), outsideSentinelBlocks(before));

  await assert.rejects(replaceCvShowSource({
    repoRoot,
    expectedSourceSha256: replaced.newSourceSha256,
    expectedProject: {
      revision: CV_SHOW_PRESENTATION_PROJECT.revision,
      authoringProjectHash: CV_SHOW_PRESENTATION_PROJECT.hash,
    },
    expectedReleaseId: release.releaseId,
    project: legacyProject,
    release: legacyRelease,
    approval: {
      approved: true,
      releaseId: legacyRelease.releaseId,
      artifactTreeHash: legacyRelease.artifactTreeHash,
      verificationHash: legacyRelease.verificationHash,
    },
  }), { code: 'PRESENTATION_AUTHORING_PROJECT_INVALID' });
  assert.equal(await readFile(target, 'utf8'), after);
});
