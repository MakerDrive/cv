import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import {
  createPresentationAuthoringProject,
  createPresentationAuthoringProjectHashes,
  createPresentationAuthoringTimelineProjection,
  validatePresentationAuthoringProject,
} from 'symbiote-workspace';
import {
  CV_SHOW_AUDIO_RELEASE,
  CV_SHOW_AUTHORING_PROJECT_INPUT,
  CV_SHOW_MEDIA_BINDINGS,
  CV_SHOW_PRESENTATION_PROJECT,
  CV_SHOW_PRESENTATION_PROJECT_HASHES,
  CV_SHOW_PRESENTATION_TIMELINE,
  CV_SHOW_STORY,
  projectCvShowStory,
} from '../../src/static-pages/data/cvShowPresentationProject.js';
import {
  TOUR_LOCAL_AUDIO_CONFIG,
} from '../../src/static-pages/data/tourManifest.js';
import {
  CV_SHOW_WEB_AUDIO_RELEASE,
} from '../../src/static-pages/data/cvShowWebAudioRelease.js';
import { createCvShowAudioReleaseDescriptor } from '../../scripts/cv-show-audio-pipeline.js';
import { parsePortfolioArticleBlocks } from '../../src/static-pages/data/portfolioArticleMedia.js';
import { loadProjectContent } from '../../src/static-pages/data/projects.js';
import {
  applyCvShowMasterProjectCommands,
  createCvShowMediaBindingRegistry,
  createCvShowEntryProject,
  createCvShowEntryTuple,
  validateCvShowMasterProject,
  validateCvShowRuntimeAdmission,
} from '../../src/static-pages/js/tour-player/presentationProjectAdapter.js';
import {
  createCvShowAuthoringAuthority,
  createCvShowAuthoringSnapshotIdentity,
} from '../../src/static-pages/js/tour-player/cvShowAuthoringAuthority.js';
import { createCvShowAlignmentController } from '../../src/static-pages/js/tour-player/showAlignmentAdapter.js';
import {
  clearCvShowWebAudioReleaseCache,
  projectCvShowWebAudioReleaseConfig,
} from '../../src/static-pages/js/tour-player/webAudioRelease.js';
import { CV_SHOW_STRUCTURAL_MEDIA_FIXTURE } from '../fixtures/cvShowStructuralMedia.js';

const STRUCTURAL_MEDIA = CV_SHOW_STRUCTURAL_MEDIA_FIXTURE;
const STRUCTURAL_PROJECT = STRUCTURAL_MEDIA.project;

test('private master release and public delivery selector preserve distinct identities', async () => {
  assert.equal(CV_SHOW_AUDIO_RELEASE.schemaVersion, 'cv-show-audio-release-v1');
  assert.equal(CV_SHOW_AUDIO_RELEASE.entryReleaseIds.length, 30);
  assert.equal(new Set(CV_SHOW_AUDIO_RELEASE.entryReleaseIds).size, 30);
  assert.deepEqual(CV_SHOW_AUDIO_RELEASE.project, {
    revision: CV_SHOW_PRESENTATION_PROJECT.revision,
    authoringProjectHash: CV_SHOW_PRESENTATION_PROJECT.hash,
  });
  assert.equal(
    CV_SHOW_AUDIO_RELEASE.acceptedProvenance.schemaVersion,
    'cv-show-audio-provenance-v1',
  );
  assert.equal(CV_SHOW_AUDIO_RELEASE.acceptedProvenance.entries.length, 30);
  let releaseProjection = { ...CV_SHOW_AUDIO_RELEASE };
  delete releaseProjection.releaseId;
  assert.deepEqual(
    createCvShowAudioReleaseDescriptor(releaseProjection),
    CV_SHOW_AUDIO_RELEASE,
  );
  const webManifest = JSON.parse(await readFile(new URL(
    `../../src/static-pages/copy-cv-show-audio/${CV_SHOW_WEB_AUDIO_RELEASE.manifest.path}`,
    import.meta.url,
  ), 'utf8'));
  assert.deepEqual(
    TOUR_LOCAL_AUDIO_CONFIG,
    projectCvShowWebAudioReleaseConfig(CV_SHOW_WEB_AUDIO_RELEASE),
  );
  assert.deepEqual(TOUR_LOCAL_AUDIO_CONFIG, {
    audio: 'local',
    locale: 'ru',
    voice: 'barzana-2',
    webAudioRelease: {
      schemaVersion: 'cv-show-web-audio-selector-v1',
      releaseId: CV_SHOW_WEB_AUDIO_RELEASE.releaseId,
      sourceMasterReleaseId: CV_SHOW_WEB_AUDIO_RELEASE.sourceMasterReleaseId,
      voiceId: 'barzana-2',
      locale: 'ru',
      revision: CV_SHOW_WEB_AUDIO_RELEASE.revision,
      manifest: {
        ...CV_SHOW_WEB_AUDIO_RELEASE.manifest,
      },
    },
  });
  assert.notEqual(CV_SHOW_WEB_AUDIO_RELEASE.releaseId, CV_SHOW_AUDIO_RELEASE.releaseId);
  assert.equal(
    CV_SHOW_WEB_AUDIO_RELEASE.sourceMasterReleaseId,
    webManifest.source.masterReleaseId,
  );
  assert.equal(webManifest.source.masterArtifactTreeHash, CV_SHOW_AUDIO_RELEASE.artifactTreeHash);
  assert.equal(
    webManifest.source.audioManifestSha256,
    CV_SHOW_AUDIO_RELEASE.manifests.audio.sha256,
  );
  assert.equal(
    webManifest.source.alignmentManifestSha256,
    CV_SHOW_AUDIO_RELEASE.manifests.alignment.sha256,
  );
  assert.equal(
    webManifest.source.voiceIdentityHash,
    CV_SHOW_AUDIO_RELEASE.acceptedProvenance.voiceIdentityHash,
  );
  let serializedRuntimeConfig = JSON.stringify(TOUR_LOCAL_AUDIO_CONFIG);
  assert.doesNotMatch(
    serializedRuntimeConfig,
    /audioManifests|alignmentManifest|cv-show-audio-private|\.wav/u,
  );
  let serialized = JSON.stringify(CV_SHOW_AUDIO_RELEASE);
  for (let forbidden of [
    '/Users/',
    'referenceFile',
    'endpoint',
    'credential',
    'humanIdentity',
  ]) {
    assert.equal(serialized.includes(forbidden), false);
  }
  let source = await readFile(new URL(
    '../../src/static-pages/data/cvShowPresentationProject.js',
    import.meta.url,
  ), 'utf8');
  assert.equal(source.match(/\/\* CV_SHOW_AUDIO_RELEASE_INPUT:START \*\//gu)?.length, 1);
  assert.equal(source.match(/\/\* CV_SHOW_AUDIO_RELEASE_INPUT:END \*\//gu)?.length, 1);
});

function base(project) {
  return { revision: project.revision, authoringProjectHash: project.hash };
}

async function createTestAuthoringSession(project) {
  const authority = createCvShowAuthoringAuthority({ seedProject: project });
  let snapshot = authority.read();
  const transport = {
    async handshake({ capability }) {
      assert.deepEqual(capability, {
        local: true,
        authorized: true,
        sessionId: 'cv-show-unit-session',
      });
      return {
        schemaVersion: 'cv-show-authoring-handshake-receipt-v1',
        status: 'authorized',
        sessionId: 'cv-show-unit-session',
      };
    },
    async load() {
      return {
        schemaVersion: 'cv-show-authoring-load-receipt-v1',
        status: 'loaded',
        snapshot,
        dirty: false,
        materialized: false,
      };
    },
    async transact({ base: currentBase, candidateSnapshotIdentity, snapshot: candidate }) {
      const currentIdentity = createCvShowAuthoringSnapshotIdentity(snapshot);
      assert.deepEqual(currentBase, {
        revision: snapshot.project.revision,
        authoringProjectHash: snapshot.project.hash,
        snapshotIdentity: currentIdentity.snapshot,
      });
      assert.equal(
        candidateSnapshotIdentity,
        createCvShowAuthoringSnapshotIdentity(candidate).snapshot,
      );
      snapshot = candidate;
      const committedIdentity = createCvShowAuthoringSnapshotIdentity(snapshot);
      return {
        schemaVersion: 'cv-show-authoring-commit-receipt-v1',
        status: 'committed',
        commitId: `cv-show-unit-${candidate.project.revision}`,
        candidateSnapshotIdentity,
        snapshotIdentity: committedIdentity.snapshot,
        snapshot,
        dirty: true,
        materialized: false,
      };
    },
  };
  const unavailable = () => {
    throw Object.assign(new Error('regeneration unavailable'), {
      code: 'CV_SHOW_REGENERATION_UNAVAILABLE',
    });
  };
  await authority.enableLocal({
    capability: Object.freeze({
      local: true,
      authorized: true,
      sessionId: 'cv-show-unit-session',
    }),
    transport,
    regeneration: { request: unavailable, inspect: unavailable },
  });
  return authority;
}

const TEST_PROVIDER_RECEIPT = Object.freeze({
  version: 'cv-show-test-provider-receipt-v1',
});

function operationObservation() {
  return Object.freeze({
    domain: 'performance',
    timeOriginMs: globalThis.performance.timeOrigin,
    monotonicTimeMs: globalThis.performance.now(),
  });
}

function requiresProviderAdmission(operation) {
  return operation.kind === 'attention'
    || operation.projectCell.cue?.interaction?.type === 'select';
}

function testProviderAdmission(operation) {
  let targetId = operation.scheduleCell.targetId;
  let budgetMs = operation.scheduleCell.gesture.endMs
    - operation.scheduleCell.gesture.startMs;
  return Object.freeze({
    version: 'show-attention-admission-v2',
    status: 'admitted',
    provider: Object.freeze({
      id: 'symbiote-ui/show-attention',
      version: 'show-attention-provider-v1',
    }),
    effect: Object.freeze({ mode: 'frame', gestureId: operation.projectCell.id }),
    target: Object.freeze({
      id: targetId,
      identity: `test-target:${targetId}`,
      layoutIdentity: `test-layout:${targetId}`,
      geometryIdentity: `test-geometry:${targetId}`,
      geometry: null,
    }),
    budget: Object.freeze({ limitMs: budgetMs, plannedDurationMs: 0 }),
    plan: Object.freeze({
      version: 'cv-show-test-plan-v1',
      identity: `test-plan:${operation.projectCell.id}`,
      normalizedPathHash: `test-path:${operation.projectCell.id}`,
      motion: null,
      evidence: null,
    }),
    reason: Object.freeze({
      code: 'within-budget',
      message: 'the test provider plan fits the authored hard budget',
      provider: null,
    }),
  });
}

function reportOperationReceipts(operation) {
  if (requiresProviderAdmission(operation)) {
    operation.reportAdmission(Object.freeze({
      providerAdmission: testProviderAdmission(operation),
    }));
  }
  let statuses = operation.kind === 'interaction'
    ? ['acted', 'settled']
    : operation.kind === 'attention' ? ['first-frame', 'settled'] : ['ready'];
  let observedAt = operationObservation();
  for (let status of statuses) {
    operation.reportReceipt(Object.freeze({
      status,
      observedAt,
      providerReceipt: TEST_PROVIDER_RECEIPT,
    }));
  }
  return undefined;
}

function immediateAdapter(operations = []) {
  const run = async (operation, kind) => {
    const typedOperation = Object.freeze({ ...operation, kind });
    operations.push(typedOperation);
    return reportOperationReceipts(typedOperation);
  };
  return {
    runInteraction: (operation) => run(operation, 'interaction'),
    runAttention: (operation) => run(operation, 'attention'),
    waitForState: (operation) => run(operation, 'state'),
  };
}

test('the Project adapter exposes no second mutable CV authoring authority', async () => {
  const [adapterSource, authoritySource] = await Promise.all([
    readFile(new URL(
      '../../src/static-pages/js/tour-player/presentationProjectAdapter.js',
      import.meta.url,
    ), 'utf8'),
    readFile(new URL(
      '../../src/static-pages/js/tour-player/cvShowAuthoringAuthority.js',
      import.meta.url,
    ), 'utf8'),
  ]);
  assert.doesNotMatch(adapterSource, /createCvShowAuthoringSession|createCvShowAuthoringAuthority/u);
  assert.equal(
    authoritySource.match(/export const cvShowAuthoringAuthority\s*=/gu)?.length,
    1,
  );
});

function structuralAlignmentManifest() {
  return structuredClone(STRUCTURAL_MEDIA.alignmentManifest);
}

function structuralAudioManifest() {
  return structuredClone(STRUCTURAL_MEDIA.audioManifest);
}

function structuralWebManifest() {
  return structuredClone(STRUCTURAL_MEDIA.webManifest);
}

function structuralSequence(entryId) {
  return STRUCTURAL_MEDIA.sequence(entryId);
}

function structuralSequenceJson(entryId) {
  return STRUCTURAL_MEDIA.sequenceJson(entryId);
}

function structuralWebHarness(manifest = structuralWebManifest()) {
  let raw = `${JSON.stringify(manifest)}\n`;
  let selector = {
    schemaVersion: 'cv-show-web-audio-selector-v1',
    releaseId: manifest.releaseId,
    sourceMasterReleaseId: manifest.source.masterReleaseId,
    voiceId: manifest.voiceId,
    locale: manifest.locale,
    revision: manifest.revision,
    manifest: {
      path: `${manifest.voiceId}/${manifest.revision}/manifest.json`,
      sha256: createHash('sha256').update(raw).digest('hex'),
      bytes: new TextEncoder().encode(raw).byteLength,
    },
  };
  return {
    appConfig: projectCvShowWebAudioReleaseConfig(selector),
    manifest,
    raw,
  };
}

function textForEntry(entryId) {
  return CV_SHOW_STORY.scenes.find(({ id }) => id === entryId)?.speech
    || CV_SHOW_STORY.branches[entryId]?.speech;
}

const EXPECTED_TURNS = Object.freeze([
  'positioning',
  'symbiote-workspace',
  'symbiote-ui',
  'symbiote-engine',
  'agent-portal',
  'symbiote-video-studio',
  'adaptive-maximo-workbench',
  'agent-pool-mcp',
  'project-graph-mcp',
  'lifecycle-messaging-platform',
  'mobile-smm-platform',
  'f360-studio',
  'autobox',
  'complexscan',
  'photopizza',
  'finale',
  'workspace-details',
  'symbiote-ui-details',
  'symbiote-engine-details',
  'agent-portal-details',
  'video-studio-details',
  'maximo-workbench-details',
  'agent-pool-details',
  'project-graph-details',
  'lifecycle-platform-details',
  'mobile-smm-details',
  'f360-details',
  'autobox-details',
  'complexscan-details',
  'photopizza-details',
]);

const EXPECTED_DETAIL_PARENTS = Object.freeze({
  'workspace-details': 'symbiote-workspace',
  'symbiote-ui-details': 'symbiote-ui',
  'symbiote-engine-details': 'symbiote-engine',
  'agent-portal-details': 'agent-portal',
  'video-studio-details': 'symbiote-video-studio',
  'maximo-workbench-details': 'adaptive-maximo-workbench',
  'agent-pool-details': 'agent-pool-mcp',
  'project-graph-details': 'project-graph-mcp',
  'lifecycle-platform-details': 'lifecycle-messaging-platform',
  'mobile-smm-details': 'mobile-smm-platform',
  'f360-details': 'f360-studio',
  'autobox-details': 'autobox',
  'complexscan-details': 'complexscan',
  'photopizza-details': 'photopizza',
});

test('provider dependencies are portable immutable Git identities', async () => {
  const packageJson = JSON.parse(await readFile(new URL('../../package.json', import.meta.url), 'utf8'));
  const packageLock = JSON.parse(await readFile(
    new URL('../../package-lock.json', import.meta.url),
    'utf8',
  ));
  const rootDependencies = packageLock.packages[''].dependencies;
  for (const [dependency, repository] of [
    ['symbiote-ui', 'symbiote-ui'],
    ['symbiote-workspace', 'symbiote-workspace'],
  ]) {
    const spec = packageJson.dependencies?.[dependency];
    const match = spec?.match(new RegExp(
      `^git\\+https://github\\.com/rnd-pro/${repository}\\.git#([0-9a-f]{40})$`,
    ));
    assert.ok(match, `${dependency} must use one immutable HTTPS Git identity`);
    assert.equal(rootDependencies[dependency], spec);
    const resolved = packageLock.packages[`node_modules/${dependency}`]?.resolved;
    assert.ok(
      resolved === spec
        || resolved === `git+ssh://git@github.com/rnd-pro/${repository}.git#${match[1]}`,
      `${dependency} lock must preserve the same repository and commit`,
    );
  }
  assert.equal(Object.values(packageJson.dependencies).some((value) => value.startsWith('file:')), false);
});

test('Workspace cue schema rejects policy so CV optionality is stored exactly once as metadata', () => {
  const unsupported = structuredClone(CV_SHOW_AUTHORING_PROJECT_INPUT);
  const cue = unsupported.cells.find(({ kind }) => kind === 'cue');
  cue.cue.policy = 'required';
  assert.throws(
    () => createPresentationAuthoringProject(unsupported),
    (error) => {
      assert.equal(error.code, 'PRESENTATION_AUTHORING_PROJECT_INVALID');
      assert.match(error.message, /policy is not supported/u);
      return true;
    },
  );
  for (let value of Object.values(
    CV_SHOW_PRESENTATION_PROJECT.script.metadata.cvShow.directives,
  )) {
    assert.deepEqual(Object.keys(value).sort(), ['policy', 'refinements']);
  }
});

test('CV Show master is one stable 30-turn Authoring Project', async () => {
  const project = validatePresentationAuthoringProject(CV_SHOW_PRESENTATION_PROJECT);
  const timeline = createPresentationAuthoringTimelineProjection(project);
  const narrationCells = project.cells.filter(({ kind }) => kind === 'narration');
  const cueCells = project.cells.filter(({ kind }) => kind === 'cue');
  const setupCells = cueCells.filter(({ id }) => !id.endsWith(':scroll') && (
    project.cells.find((cell) => cell.id === id)?.timing.at.anchor === 'turn-start'
  ));
  const groups = cueCells.filter(({ id, timing }) => (
    !id.endsWith(':scroll') && timing.at.anchor === 'speech'
  ));

  assert.equal(project.schemaVersion, 'workspace-presentation-authoring-project-v1');
  assert.equal(project.id, 'cv-show');
  assert.deepEqual(narrationCells.map(({ turnId }) => turnId), EXPECTED_TURNS);
  assert.equal(timeline.turns.length, 30);
  assert.equal(timeline.turns.filter(({ replyTo }) => !replyTo).length, 16);
  assert.deepEqual(
    Object.fromEntries(timeline.turns.filter(({ replyTo }) => replyTo).map(({ id, replyTo }) => [id, replyTo])),
    EXPECTED_DETAIL_PARENTS,
  );
  assert.equal(setupCells.length, 30);
  assert.equal(groups.length, 86);
  assert.equal(cueCells.length, 30 + (86 * 2));
  assert.deepEqual(project.layers.map(({ id }) => id), [
    'cv-show:layer:narration',
    'cv-show:layer:focus',
    'cv-show:layer:annotation',
    'cv-show:layer:interaction',
    'cv-show:layer:state',
  ]);
  assert.deepEqual(CV_SHOW_PRESENTATION_PROJECT_HASHES, createPresentationAuthoringProjectHashes(project));
  assert.equal(CV_SHOW_PRESENTATION_TIMELINE.hash, timeline.hash);
  assert.equal(
    project.hash,
    'workspace-presentation-authoring-project-v1:sha256-Lm2KMupZttc67Ene87zWoYgA1daM0dGX/kuFCJmdUss=',
  );
  assert.equal(
    timeline.hash,
    'presentation-timeline-v3:sha256-un8q10hv8zYHIWkUWxDBKZgJtOQ0xzstL/JYazo8yEo=',
  );

  const manifestSource = await readFile(
    new URL('../../src/static-pages/data/tourManifest.js', import.meta.url),
    'utf8',
  );
  const scriptsSource = await readFile(
    new URL('../../src/static-pages/data/tourScripts.js', import.meta.url),
    'utf8',
  );
  const projectSource = await readFile(
    new URL('../../src/static-pages/data/cvShowPresentationProject.js', import.meta.url),
    'utf8',
  );
  assert.doesNotMatch(manifestSource, /TOUR_ATTENTION_TIMELINES\s*=\s*freezeDeep/u);
  assert.doesNotMatch(scriptsSource, /CV_SHOW_STORY\s*=\s*freezeDeep\(\{[\s\S]*scenes,/u);
  assert.match(projectSource, /CV_SHOW_AUTHORING_PROJECT_INPUT\s*=\s*freezeDeep/u);
  assert.doesNotMatch(projectSource, /CV_SHOW_AUTHORING_STORY/u);
  assert.equal(
    scriptsSource.trim(),
    "export { CV_SHOW_STORY } from './cvShowPresentationProject.js';",
  );
});

test('CV Show master owns literal anchors, authored order, and portable refinements', () => {
  const project = CV_SHOW_PRESENTATION_PROJECT;
  const timeline = CV_SHOW_PRESENTATION_TIMELINE;
  const requiredAnchors = [
    'а дальше',
    'я развиваю Symbiote Workspace',
    'Agent Portal',
    'Workspace соединяет',
    'который я развиваю',
    'сегментация аудитории',
    'Digital Twin',
    'Android-устройства',
    'предпросмотр и рендер',
    'Workspace использует',
    'Workspace связывает',
    'API',
    'Готовый JSON-сценарий',
    'в Эрмитаже я сканировал',
    'музейное направление',
    'Arduino-версию',
    'я сам продолжил',
  ];
  const anchors = timeline.turns.flatMap(({ cues }) => cues
    .map(({ at }) => at.anchor === 'speech' ? at.quote : null)
    .filter(Boolean));
  for (let value of requiredAnchors) assert.ok(anchors.includes(value), value);
  assert.equal(anchors.filter((value) => value === 'Digital Twin').length, 4);
  assert.equal(
    Object.keys(project.script.metadata.cvShow.directives)
      .map((cellId) => project.cells.find((cell) => cell.id === cellId))
      .filter((cell) => cell?.timing.at.anchor === 'speech')
      .map((cell) => cell.timing.at.quote)
      .filter((value) => value === 'Digital Twin').length,
    2,
  );

  const orderFor = (turnId) => project.cells
    .filter((cell) => (
      cell.kind === 'cue'
      && cell.turnId === turnId
      && !cell.id.endsWith(':scroll')
      && cell.timing.at.anchor === 'speech'
    ))
    .map(({ id }) => id.replace(/^cv-show:cue:/u, ''));
  assert.deepEqual(orderFor('finale'), [
    'finale.history', 'finale.scale-route', 'finale.workspace', 'finale.actions', 'finale.contacts',
  ]);
  assert.deepEqual(orderFor('agent-portal-details'), [
    'agent-portal-details.board',
    'agent-portal-details.settings',
    'agent-portal-details.architecture',
    'agent-portal-details.resource-groups',
  ]);
  assert.deepEqual(orderFor('project-graph-details'), [
    'project-graph-details.skeleton', 'project-graph-details.fact', 'project-graph-details.focus',
  ]);
  assert.deepEqual(orderFor('mobile-smm-details'), [
    'mobile-smm-details.schedule',
    'mobile-smm-details.queue',
    'mobile-smm-details.ui-change',
    'mobile-smm-details.approval',
    'mobile-smm-details.draft',
  ]);
  assert.deepEqual(orderFor('f360-details'), [
    'f360-details.result-one', 'f360-details.period',
  ]);

  for (let cell of project.cells.filter(({ kind }) => kind === 'cue')) {
    assert.equal(Number.isInteger(cell.timing.gestureDurationMs), true, `${cell.id}: duration`);
    assert.ok(cell.timing.gestureDurationMs >= 0, `${cell.id}: duration`);
    assert.ok(['none', 'anchor'].includes(cell.timing.settleBy), `${cell.id}: settleBy`);
  }
  assert.doesNotMatch(JSON.stringify(project), /selector|boundingClientRect|clientX|pixel/iu);
});

test('all 30 entries author hard visual budgets, margins, and exact text ranges', () => {
  const project = CV_SHOW_PRESENTATION_PROJECT;
  const directives = project.script.metadata.cvShow.directives;
  const attentionCells = project.cells.filter(({ kind, id }) => (
    kind === 'cue' && !id.endsWith(':scroll')
  ));
  const byId = new Map(project.cells.map((cell) => [cell.id, cell]));
  const expectedVisualDuration = Object.freeze({
    focus: 1_200,
    annotation: 1_200,
    select: 650,
    click: 800,
    navigate: 1_800,
  });
  const expectedSetupDuration = Object.freeze({
    focus: 3_050,
    select: 3_150,
    click: 3_300,
    navigate: 5_800,
  });
  const expandedRuntimeOvalMarkers = new Set([
    'cv-show:cue:positioning.tenure-marker',
    'cv-show:cue:agent-portal.human-decision',
    'cv-show:cue:mobile-smm.agent-update',
  ]);
  const expectedSetupMarginOverrides = Object.freeze({
    'cv-show:cue:positioning.open': 2_900,
    'cv-show:cue:complexscan.open': 2_050,
  });
  const routeReadinessScrollActions = new Set([
    'cv-show:cue:workspace.intro-frame',
    'cv-show:cue:symbiote-ui.graph-tooling',
    'cv-show:cue:symbiote-engine.intro',
    'cv-show:cue:agent-portal.open-source',
    'cv-show:cue:video-studio.visible-process',
    'cv-show:cue:maximo.work-orders',
    'cv-show:cue:agent-pool.flow',
    'cv-show:cue:project-graph.example',
    'cv-show:cue:lifecycle.scope',
    'cv-show:cue:mobile-smm.overview',
    'cv-show:cue:f360.process',
    'cv-show:cue:autobox.buddha',
    'cv-show:cue:complexscan.line',
    'cv-show:cue:photopizza.origin',
  ]);

  assert.equal(attentionCells.length, 116);
  assert.equal(new Set(attentionCells.map(({ turnId }) => turnId)).size, 30);
  assert.deepEqual(
    Object.fromEntries(Object.entries(Object.groupBy(
      attentionCells.filter(({ timing }) => timing.at.anchor === 'turn-start'),
      (cell) => cell.cue.interaction?.type || cell.cue.kind,
    )).map(([action, cells]) => [action, cells.length])),
    { navigate: 16, focus: 10, select: 2, click: 2 },
  );
  assert.equal(
    project.cells.some(({ timing }) => [450, 500].includes(timing?.gestureDurationMs)),
    false,
  );

  for (let cell of attentionCells) {
    const action = cell.cue.interaction?.type || cell.cue.kind;
    const setup = cell.timing.at.anchor === 'turn-start';
    const runtimeMarker = action === 'annotation'
      ? directives[cell.id]?.refinements?.shape || cell.cue.annotation?.marker
      : '';
    const durationMs = setup
      ? expectedSetupDuration[action]
      : action === 'annotation' && expandedRuntimeOvalMarkers.has(cell.id)
        ? 2_500
        : expectedVisualDuration[action];
    assert.ok(durationMs, `${cell.id}: supported visual action`);
    assert.equal(typeof cell.cue.targetId, 'string', `${cell.id}: target`);
    assert.ok(cell.cue.targetId, `${cell.id}: target`);
    const articleTarget = cell.cue.targetId.match(
      /^article\.([a-z0-9][a-z0-9-]*)\.([a-z0-9][a-z0-9-]*)$/u,
    );
    const articleBlock = articleTarget
      ? parsePortfolioArticleBlocks(loadProjectContent(articleTarget[1], 'ru'))
          .find(({ id }) => id === articleTarget[2])
      : null;
    if (articleTarget) assert.ok(articleBlock, `${cell.id}: article block`);
    assert.equal(cell.timing.gestureDurationMs, durationMs, `${cell.id}: hard budget`);
    if (!setup && action === 'annotation') {
      assert.equal(
        runtimeMarker === 'oval',
        expandedRuntimeOvalMarkers.has(cell.id),
        `${cell.id}: measured runtime-oval budget class`,
      );
      const expectedMarkerLeadMs = durationMs + 300;
      assert.equal(cell.timing.leadMs, expectedMarkerLeadMs, `${cell.id}: marker lead`);
      assert.ok(
        cell.timing.leadMs - durationMs >= 300,
        `${cell.id}: marker settles before narration`,
      );
    }
    if (setup) {
      assert.equal(
        cell.timing.leadMs - durationMs,
        expectedSetupMarginOverrides[cell.id] ?? 600,
        `${cell.id}: setup lifecycle margin`,
      );
    } else {
      assert.ok(
        cell.timing.leadMs - durationMs >= 250,
        `${cell.id}: deliberate settlement margin`,
      );
    }

    if (!setup) {
      const scroll = byId.get(`${cell.id}:scroll`);
      assert.ok(scroll, `${cell.id}: scroll`);
      const scrollDurationMs = action === 'annotation'
        ? 800
        : routeReadinessScrollActions.has(cell.id)
        ? 2_200
        : cell.id === 'cv-show:cue:finale.actions' ? 1_200 : 1_000;
      assert.equal(
        scroll.timing.gestureDurationMs,
        scrollDurationMs,
        `${scroll.id}: readiness-class hard budget`,
      );
      assert.equal(scroll.cue.targetId, cell.cue.targetId, `${scroll.id}: target`);
      assert.equal(
        scroll.timing.leadMs,
        cell.timing.leadMs + scrollDurationMs + 200,
        `${scroll.id}: exact scroll-to-action gap`,
      );
      if (action === 'annotation') {
        assert.equal(
          scroll.timing.leadMs - scroll.timing.gestureDurationMs - cell.timing.leadMs,
          200,
          `${cell.id}: scroll-to-marker gap`,
        );
      }
      if (cell.id === 'cv-show:cue:finale.history') {
        assert.equal(
          scroll.timing.leadMs - scroll.timing.gestureDurationMs - cell.timing.leadMs,
          200,
          `${cell.id}: scroll-to-frame gap`,
        );
      }
      assert.ok(
        scroll.timing.leadMs - scroll.timing.gestureDurationMs >= cell.timing.leadMs,
        `${cell.id}: scroll settles before attention`,
      );
      assert.deepEqual(cell.dependsOn, [{ cellId: scroll.id, barrier: 'settled' }]);
    }

    if (action !== 'select') continue;
    const refinement = directives[cell.id]?.refinements;
    assert.equal(typeof refinement?.quote, 'string', `${cell.id}: selection quote`);
    assert.ok(refinement.quote.length >= 12, `${cell.id}: meaningful selection quote`);
    assert.equal(refinement.occurrence, 1, `${cell.id}: selection occurrence`);
    assert.ok(articleTarget, `${cell.id}: semantic article target`);
    assert.ok(articleBlock?.markdown, `${cell.id}: nonempty article block`);
    assert.equal(
      articleBlock.markdown.split(refinement.quote).length - 1,
      1,
      `${cell.id}: unambiguous source quote`,
    );
  }
});

test('the structural fixture joins all 30 Project entries without media authority', () => {
  const audioManifest = structuralAudioManifest();
  const alignmentManifest = structuralAlignmentManifest();
  const webManifest = structuralWebManifest();
  assert.equal(audioManifest.fixture.artifactAuthority, false);
  assert.equal(alignmentManifest.fixture.artifactAuthority, false);
  assert.equal(audioManifest.voiceSelection.id, 'custom-user');
  assert.equal(audioManifest.story.contractRevision, CV_SHOW_STORY.contractRevision);
  assert.equal(alignmentManifest.story.contractRevision, CV_SHOW_STORY.contractRevision);
  assert.deepEqual(audioManifest.clips.map(({ id }) => id), EXPECTED_TURNS);
  assert.deepEqual(alignmentManifest.clips.map(({ id }) => id), EXPECTED_TURNS);
  assert.deepEqual(webManifest.clips.map(({ id }) => id), EXPECTED_TURNS);
  assert.equal(Object.keys(CV_SHOW_MEDIA_BINDINGS).length, 30);
  assert.equal(Object.keys(STRUCTURAL_MEDIA.mediaBindings).length, 30);
  assert.deepEqual(projectCvShowStory(STRUCTURAL_PROJECT), CV_SHOW_STORY);
  const narrationHashes = new Map(createPresentationAuthoringProjectHashes(STRUCTURAL_PROJECT)
    .cellHashes
    .filter(({ cellId }) => cellId.startsWith('cv-show:narration:'))
    .map(({ cellId, hash }) => [cellId.replace('cv-show:narration:', ''), hash]));
  const tupleCoverage = [];
  const anchorDispositions = {};

  for (let [index, clip] of alignmentManifest.clips.entries()) {
    const audioClip = audioManifest.clips[index];
    const webClip = webManifest.clips[index];
    const rawSequence = structuralSequenceJson(clip.id);
    const sequence = JSON.parse(rawSequence);
    const media = STRUCTURAL_MEDIA.mediaBindings[clip.id];
    assert.equal(createHash('sha256').update(rawSequence).digest('hex'), clip.alignedSequenceSha256);
    assert.equal(audioClip.id, clip.id);
    assert.equal(webClip.id, clip.id);
    assert.equal(webClip.masterWavSha256, audioClip.sha256);
    assert.notEqual(webClip.deliverySha256, webClip.masterWavSha256);
    assert.equal(audioClip.speech, textForEntry(clip.id));
    assert.deepEqual(media, {
      durationMilliseconds: clip.mediaDurationMs,
      sourceAlignedSequenceHash: clip.alignedSequenceHash,
      sourceAlignmentFileHash: `sha256:${clip.alignedSequenceSha256}`,
      sourceNarrationCellHash: narrationHashes.get(clip.id),
      sourceTimelineHash: clip.timelineHash,
      wavHash: `sha256:${audioClip.sha256}`,
    });
    assert.equal(validateCvShowRuntimeAdmission(STRUCTURAL_PROJECT, clip.id, {
      audioClip: webClip,
      alignmentClip: webClip,
      sourceSequence: sequence,
    }).entryId, clip.id);
    const tuple = createCvShowEntryTuple(
      STRUCTURAL_PROJECT,
      clip.id,
      sequence,
      { adapter: immediateAdapter() },
    );
    const sourceEntry = CV_SHOW_STORY.scenes.find(({ id }) => id === clip.id)
      || CV_SHOW_STORY.branches[clip.id];
    assert.equal(sourceEntry.subtitle, audioClip.speech);
    const projected = projectCvShowStory(tuple.project);
    const projectedEntry = projected.scenes[0] || Object.values(projected.branches)[0];
    const speechGroups = sourceEntry.directives.filter(({ timing }) => timing.phase === 'speech');
    assert.equal(tuple.project.cells.filter(({ kind }) => kind === 'narration').length, 1);
    assert.equal(tuple.project.cells.length, 2 + (speechGroups.length * 2));
    assert.equal(tuple.timeline.turns[0].id, clip.id);
    assert.equal(tuple.timeline.turns[0].replyTo, undefined);
    assert.equal(tuple.alignedSequence.media.hash, `sha256:${clip.sourceAudioSha256}`);
    assert.equal(tuple.alignedSequence.media.durationMs, clip.mediaDurationMs);
    for (let event of tuple.alignedSequence.events) {
      anchorDispositions[event.resolution] = (anchorDispositions[event.resolution] || 0) + 1;
    }
    assert.deepEqual(projectedEntry, sourceEntry);
    assert.deepEqual(tuple.includedSpeechDirectiveIds, speechGroups.map(({ id }) => id));
    assert.equal(tuple.schedule.cells.filter(({ kind }) => kind !== 'narration').length, 1 + (speechGroups.length * 2));
    const visualCells = tuple.schedule.cells.filter(({ kind }) => kind !== 'narration');
    for (let [index, cell] of visualCells.entries()) {
      assert.ok(cell.gesture.endMs <= cell.anchorMs, `${clip.id}/${cell.cellId}: margin`);
      if (index > 0) {
        assert.ok(visualCells[index - 1].startMs < cell.startMs, `${clip.id}/${cell.cellId}: monotonic`);
      }
      for (let dependency of cell.dependsOn) {
        const owner = tuple.schedule.cells.find(({ cellId }) => cellId === dependency.cellId);
        assert.ok(owner, `${clip.id}/${cell.cellId}: dependency owner`);
        assert.ok(
          owner.plannedBarriers[dependency.barrier] <= cell.startMs,
          `${clip.id}/${cell.cellId}: dependency margin`,
        );
      }
    }
    tupleCoverage.push(Object.freeze({
      id: clip.id,
      parent: sourceEntry.sceneId || null,
      projectHash: tuple.project.hash,
      timelineHash: tuple.timeline.hash,
      alignedSequenceHash: tuple.alignedSequence.hash,
      scheduleHash: tuple.schedule.hash,
      speechGroupCount: speechGroups.length,
    }));
  }

  assert.equal(tupleCoverage.length, 30);
  assert.equal(new Set(tupleCoverage.map(({ projectHash }) => projectHash)).size, 30);
  assert.equal(tupleCoverage.reduce((total, item) => total + item.speechGroupCount, 0), 86);
  assert.deepEqual(anchorDispositions, { exact: 200, fuzzy: 2 });
});

test('runtime admission joins Project master ancestry without treating delivery bytes as WAV', () => {
  const release = structuralWebManifest();
  const audioClip = release.clips[0];
  const alignmentClip = release.clips[0];
  const sourceSequence = structuralSequence(alignmentClip.id);
  const adapter = immediateAdapter();
  const changeHex = (value) => `${value[0] === '0' ? '1' : '0'}${value.slice(1)}`;
  const create = ({ audio = audioClip, alignment = alignmentClip, sequence = sourceSequence } = {}) => (
    createCvShowEntryTuple(STRUCTURAL_PROJECT, audioClip.id, sequence, {
      adapter,
      mediaAdmission: { audioClip: audio, alignmentClip: alignment },
    })
  );
  assert.doesNotThrow(() => create());
  assert.throws(
    () => createCvShowEntryTuple(STRUCTURAL_PROJECT, audioClip.id, sourceSequence, {
      adapter,
      mediaAncestry: {
        schemaVersion: 'workspace-presentation-media-ancestry-v1',
        audio: { hash: null, status: 'missing' },
        alignment: { hash: null, status: 'missing' },
        render: { hash: null, status: 'missing' },
        playable: false,
      },
    }),
    (error) => error.code === 'CV_SHOW_MEDIA_ANCESTRY_STALE'
      && error.details.executionCreated === false,
  );
  let changedDeliveryHash = changeHex(audioClip.deliverySha256);
  assert.doesNotThrow(() => create({
    audio: { ...audioClip, deliverySha256: changedDeliveryHash },
  }), 'delivery identity is authenticated by the release, not compared with Project wavHash');

  const mutations = [
    ['audioMasterWavSha256', {
      audio: { ...audioClip, masterWavSha256: changeHex(audioClip.masterWavSha256) },
    }],
    ['audioMasterDurationMs', {
      audio: { ...audioClip, masterDurationMs: audioClip.masterDurationMs + 1 },
    }],
    ['alignmentMasterWavSha256', {
      alignment: {
        ...alignmentClip,
        masterWavSha256: changeHex(alignmentClip.masterWavSha256),
      },
    }],
    ['alignedSequenceHash', {
      alignment: { ...alignmentClip, alignedSequenceHash: `${alignmentClip.alignedSequenceHash}x` },
    }],
    ['alignedSequenceSha256', {
      alignment: {
        ...alignmentClip,
        alignedSequenceSha256: changeHex(alignmentClip.alignedSequenceSha256),
      },
    }],
    ['timelineHash', { alignment: { ...alignmentClip, timelineHash: `${alignmentClip.timelineHash}x` } }],
    ['alignmentMasterDurationMs', {
      alignment: { ...alignmentClip, masterDurationMs: alignmentClip.masterDurationMs + 1 },
    }],
    ['loaded-sequence', {
      sequence: { ...sourceSequence, media: { ...sourceSequence.media, durationMs: sourceSequence.media.durationMs + 1 } },
    }],
    ['loaded-sequence', { sequence: { ...sourceSequence, hash: `${sourceSequence.hash}x` } }],
  ];
  for (let [reason, mutation] of mutations) {
    assert.throws(
      () => create(mutation),
      (error) => {
        assert.equal(error.code, 'CV_SHOW_RUNTIME_MEDIA_ADMISSION_REJECTED');
        assert.equal(error.details.reason, reason);
        assert.equal(error.details.executionCreated, false);
        return true;
      },
      reason,
    );
  }
});

test('tuple admission rejects malformed Project bindings and incomplete supplied CV ancestry', () => {
  const alignmentManifest = structuralAlignmentManifest();
  const clip = alignmentManifest.clips.find(({ id }) => id === 'positioning');
  const sequence = structuralSequence(clip.id);
  const malformedInput = structuredClone(STRUCTURAL_PROJECT);
  delete malformedInput.hash;
  delete malformedInput.script.metadata.cvShow.entries.positioning.media.durationMilliseconds;
  const malformedProject = createPresentationAuthoringProject(malformedInput);
  let executionCount = 0;
  const adapter = {
    runInteraction: async () => { executionCount += 1; return undefined; },
    runAttention: async () => { executionCount += 1; return undefined; },
    waitForState: async () => { executionCount += 1; return undefined; },
  };
  assert.throws(
    () => createCvShowEntryTuple(malformedProject, 'positioning', sequence, { adapter }),
    (error) => error.code === 'CV_SHOW_MEDIA_ANCESTRY_STALE'
      && error.details.executionCreated === false,
  );

  const incompleteRegistry = structuredClone(
    createCvShowMediaBindingRegistry(STRUCTURAL_PROJECT),
  );
  delete incompleteRegistry.entries.positioning.audio;
  assert.throws(
    () => createCvShowEntryTuple(STRUCTURAL_PROJECT, 'positioning', sequence, {
      adapter,
      mediaAncestry: incompleteRegistry,
    }),
    (error) => error.code === 'CV_SHOW_MEDIA_ANCESTRY_STALE'
      && error.details.executionCreated === false,
  );
  assert.equal(executionCount, 0);
});

test('aligned sequence admission rejects semantically equal JSON with different raw bytes', async () => {
  let { appConfig, manifest, raw: releaseRaw } = structuralWebHarness();
  clearCvShowWebAudioReleaseCache();
  const clip = manifest.clips[0];
  const raw = structuralSequenceJson(clip.id);
  const alternateBytes = JSON.stringify(JSON.parse(raw));
  assert.notEqual(alternateBytes, raw);
  const fetchImpl = async (url) => {
    if (String(url).endsWith(clip.alignedSequenceFile)) {
      return new Response(alternateBytes, { headers: { 'content-type': 'application/json' } });
    }
    return new Response(releaseRaw, {
      headers: { 'content-type': 'application/json' },
    });
  };
  const controller = createCvShowAlignmentController({
    url: 'https://portfolio.example/cv/?showAudio=local',
    baseUrl: 'https://portfolio.example/cv/',
    appConfig,
    fetchImpl,
  });
  await controller.prepare(CV_SHOW_STORY);
  let operationCount = 0;
  await assert.rejects(
    controller.createEntryRuntime({
      entry: CV_SHOW_STORY.scenes[0],
      media: new EventTarget(),
      audioClip: manifest.clips[0],
      runPresentationOperation: async () => { operationCount += 1; },
    }),
    (error) => error.code === 'CV_SHOW_AUDIO_ALIGNMENT_INVALID'
      && /raw aligned sequence hash/u.test(error.message),
  );
  assert.equal(operationCount, 0);
});

test('aligned sequence admission rejects text-only responses before JSON parsing', async () => {
  let { appConfig, manifest, raw: releaseRaw } = structuralWebHarness();
  clearCvShowWebAudioReleaseCache();
  const clip = manifest.clips[0];
  const raw = structuralSequenceJson(clip.id);
  const fetchImpl = async (url) => {
    if (String(url).endsWith(clip.alignedSequenceFile)) {
      return {
        ok: true,
        status: 200,
        text: async () => raw,
      };
    }
    return new Response(releaseRaw, {
      headers: { 'content-type': 'application/json' },
    });
  };
  const controller = createCvShowAlignmentController({
    url: 'https://portfolio.example/cv/?showAudio=local',
    baseUrl: 'https://portfolio.example/cv/',
    appConfig,
    fetchImpl,
  });
  await controller.prepare(CV_SHOW_STORY);
  let operationCount = 0;
  await assert.rejects(
    controller.createEntryRuntime({
      entry: CV_SHOW_STORY.scenes[0],
      media: new EventTarget(),
      audioClip: manifest.clips[0],
      runPresentationOperation: async () => { operationCount += 1; },
    }),
    (error) => error.code === 'CV_SHOW_AUDIO_ALIGNMENT_INVALID'
      && /raw aligned sequence bytes/u.test(error.message),
  );
  assert.equal(operationCount, 0);
});

test('alignment verifies master hash, duration, internal hash, and timeline independently', async () => {
  let flipHex = (value) => `${value[0] === '0' ? '1' : '0'}${value.slice(1)}`;
  let flipIntegrity = (value) => {
    let index = value.indexOf('sha256-') + 'sha256-'.length;
    return `${value.slice(0, index)}${value[index] === 'A' ? 'B' : 'A'}${value.slice(index + 1)}`;
  };
  let cases = [
    ['master hash', (clip) => { clip.masterWavSha256 = flipHex(clip.masterWavSha256); }],
    ['master duration', (clip) => { clip.masterDurationMs += 1; }],
    ['internal hash', (clip) => {
      clip.alignedSequenceHash = flipIntegrity(clip.alignedSequenceHash);
    }],
    ['timeline', (clip) => { clip.timelineHash = flipIntegrity(clip.timelineHash); }],
  ];
  for (let [name, mutate] of cases) {
    let candidate = structuralWebManifest();
    mutate(candidate.clips[0]);
    let { appConfig, manifest, raw: releaseRaw } = structuralWebHarness(candidate);
    clearCvShowWebAudioReleaseCache();
    let clip = manifest.clips[0];
    let fetchImpl = async (url) => new Response(
      String(url).endsWith(clip.alignedSequenceFile)
        ? structuralSequenceJson(clip.id)
        : releaseRaw,
      { headers: { 'content-type': 'application/json' } },
    );
    let controller = createCvShowAlignmentController({
      url: 'https://portfolio.example/cv/?showAudio=local',
      baseUrl: 'https://portfolio.example/cv/',
      appConfig,
      fetchImpl,
    });
    assert.equal((await controller.prepare(CV_SHOW_STORY)).available, true, name);
    let operationCount = 0;
    await assert.rejects(controller.createEntryRuntime({
      entry: CV_SHOW_STORY.scenes[0],
      media: new EventTarget(),
      audioClip: clip,
      runPresentationOperation: async () => { operationCount += 1; },
    }), (error) => error.code === 'CV_SHOW_AUDIO_ALIGNMENT_INVALID'
      && /provenance positioning/u.test(error.message), name);
    assert.equal(operationCount, 0, name);
    controller.cancel();
  }
});

test('positioning introduces experience once with the authored marker gesture', () => {
  const positioning = CV_SHOW_STORY.scenes.find(({ id }) => id === 'positioning');
  const experienceAttention = positioning.directives
    .filter(({ target }) => String(target || '').startsWith('profile.experience'))
    .map(({ id, type, target, timing }) => ({
      id,
      type,
      target,
      quote: timing.quote,
    }));

  assert.deepEqual(experienceAttention, [{
    id: 'positioning.tenure-marker',
    type: 'marker',
    target: 'profile.experience.15-plus',
    quote: 'За годы работы',
  }]);
});

test('master validation admits a structurally valid attention-group removal', () => {
  const base = {
    revision: CV_SHOW_PRESENTATION_PROJECT.revision,
    authoringProjectHash: CV_SHOW_PRESENTATION_PROJECT.hash,
  };
  const command = (id, type, payload) => ({
    schemaVersion: 'workspace-presentation-authoring-command-v1',
    id,
    base,
    type,
    payload,
  });
  const project = applyCvShowMasterProjectCommands(CV_SHOW_PRESENTATION_PROJECT, [
    command('positioning-transition-remove', 'cell.remove', {
      cellId: 'cv-show:cue:positioning.workspace-transition',
    }),
    command('positioning-transition-scroll-remove', 'cell.remove', {
      cellId: 'cv-show:cue:positioning.workspace-transition:scroll',
    }),
  ]);

  assert.equal(validateCvShowMasterProject(project), project);
  assert.equal(
    Object.hasOwn(
      project.script.metadata.cvShow.directives,
      'cv-show:cue:positioning.workspace-transition',
    ),
    false,
  );
});

test('slice identity binds ordered source cells without master or media state', () => {
  const entryId = 'positioning';
  const allSpeechDirectiveIds = [
    'positioning.tenure-marker',
    'positioning.workspace-transition',
  ];
  const variants = [
    null,
    allSpeechDirectiveIds.slice(1),
    allSpeechDirectiveIds.slice(2),
  ].map((speechDirectiveIds) => {
    const options = speechDirectiveIds === null ? {} : { speechDirectiveIds };
    return [
      createCvShowEntryProject(CV_SHOW_PRESENTATION_PROJECT, entryId, options),
      createCvShowEntryProject(CV_SHOW_PRESENTATION_PROJECT, entryId, options),
    ];
  });
  for (let [slice, repeated] of variants) {
    const ancestry = slice.script.metadata.cvShow.slice;
    assert.equal(repeated.id, slice.id);
    assert.equal(repeated.hash, slice.hash);
    assert.match(slice.id, /^cv-show\/slice\/positioning\/[0-9a-f]{64}$/u);
    assert.equal(slice.revision, 0);
    assert.equal(ancestry.schemaVersion, 'cv-show-entry-slice-v1');
    assert.equal(Object.hasOwn(ancestry, 'masterProjectHash'), false);
    assert.equal(Object.hasOwn(ancestry, 'masterRevision'), false);
    assert.equal(Object.hasOwn(ancestry, 'media'), false);
    assert.equal(
      Object.hasOwn(slice.script.metadata.cvShow.entries[entryId], 'media'),
      false,
    );
    const sliceCellIds = new Set(slice.cells.map(({ id }) => id));
    assert.deepEqual(
      ancestry.sourceCellIds,
      CV_SHOW_PRESENTATION_PROJECT.cells
        .filter(({ id }) => sliceCellIds.has(id))
        .map(({ id }) => id),
    );
    assert.match(ancestry.entryProjectionHash, /^cv-show-entry-projection-v1:sha256-/u);
    assert.match(ancestry.narrationInputHash, /^cv-show-narration-input-v1:sha256-/u);
    assert.match(ancestry.anchorContractHash, /^cv-show-anchor-contract-v1:sha256-/u);
    assert.match(ancestry.attentionContractHash, /^cv-show-attention-contract-v1:sha256-/u);
  }
  assert.equal(new Set(variants.map(([slice]) => slice.id)).size, variants.length);
  assert.equal(new Set(variants.map(([slice]) => slice.hash)).size, variants.length);
});

test('CV authoring authority rejects slices, structural cells, and broken group dependencies atomically', async () => {
  const slice = createCvShowEntryProject(CV_SHOW_PRESENTATION_PROJECT, 'positioning');
  await assert.rejects(
    createTestAuthoringSession(slice),
    (error) => error.code === 'CV_SHOW_PRESENTATION_PROJECT_INVALID',
  );

  const session = await createTestAuthoringSession(CV_SHOW_PRESENTATION_PROJECT);
  const original = session.view.project;
  const sourceCell = original.cells.find(({ id }) => id === 'cv-show:cue:positioning.tenure-marker');
  await assert.rejects(
    session.mutationSession.invoke('presentation_authoring_cell_add', {
      id: 'cv-show-test-structural-add',
      base: base(session.view.project),
      payload: {
        cell: {
          ...structuredClone(sourceCell),
          id: 'cv-show:cue:positioning.unsupported-added-cue',
        },
        index: original.cells.indexOf(sourceCell) + 1,
      },
    }),
    (error) => error.code === 'CV_SHOW_PRESENTATION_PROJECT_INVALID',
  );
  assert.equal(session.view.project.revision, original.revision);
  assert.equal(session.view.project.hash, original.hash);

  await assert.rejects(
    session.mutationSession.invoke('presentation_authoring_cell_set_dependencies', {
      id: 'cv-show-test-break-dependency',
      base: base(session.view.project),
      payload: { cellId: sourceCell.id, dependsOn: [] },
    }),
    (error) => error.code === 'CV_SHOW_PRESENTATION_PROJECT_INVALID',
  );
  assert.equal(session.view.project.revision, original.revision);
  assert.equal(session.view.project.hash, original.hash);
});

test('CV authoring authority preserves canonical cell order and detail parent topology atomically', async () => {
  const session = await createTestAuthoringSession(CV_SHOW_PRESENTATION_PROJECT);
  const original = session.read();
  const positioningCellId = 'cv-show:narration:positioning';
  const workspaceCellId = 'cv-show:narration:symbiote-workspace';
  const workspaceIndex = original.project.cells.findIndex(({ id }) => id === workspaceCellId);
  await assert.rejects(
    session.mutationSession.invoke('presentation_authoring_cell_move', {
      id: 'cv-show-test-reorder-root-narration',
      base: base(session.view.project),
      payload: { cellId: positioningCellId, index: workspaceIndex },
    }),
    (error) => error.code === 'CV_SHOW_PRESENTATION_PROJECT_INVALID',
  );
  assert.deepEqual(session.read(), original);

  const detailCell = original.project.cells.find(
    ({ id }) => id === 'cv-show:narration:workspace-details',
  );
  await assert.rejects(
    session.mutationSession.invoke('presentation_authoring_cell_set_content', {
      id: 'cv-show-test-reparent-detail',
      base: base(session.view.project),
      payload: {
        cellId: detailCell.id,
        content: { ...structuredClone(detailCell.turn), replyTo: 'symbiote-ui' },
      },
    }),
    (error) => error.code === 'CV_SHOW_PRESENTATION_PROJECT_INVALID',
  );
  assert.deepEqual(session.read(), original);
});

test('every exported master consumer rejects reordered canonical narration before admission', () => {
  const release = structuralWebManifest();
  const entryId = 'positioning';
  const audioClip = release.clips.find(({ id }) => id === entryId);
  const alignmentClip = release.clips.find(({ id }) => id === entryId);
  const sequence = structuralSequence(alignmentClip.id);
  const reorderedInput = structuredClone(STRUCTURAL_PROJECT);
  delete reorderedInput.hash;
  const narrationIndexes = reorderedInput.cells
    .map((cell, index) => cell.kind === 'narration' ? index : -1)
    .filter((index) => index >= 0);
  [reorderedInput.cells[narrationIndexes[0]], reorderedInput.cells[narrationIndexes[1]]] = [
    reorderedInput.cells[narrationIndexes[1]],
    reorderedInput.cells[narrationIndexes[0]],
  ];
  const reorderedProject = createPresentationAuthoringProject(reorderedInput);
  assert.notEqual(reorderedProject.hash, STRUCTURAL_PROJECT.hash);
  let operationCount = 0;
  const adapter = {
    runInteraction: async () => { operationCount += 1; return undefined; },
    runAttention: async () => { operationCount += 1; return undefined; },
    waitForState: async () => { operationCount += 1; return undefined; },
  };
  const calls = [
    () => createCvShowMediaBindingRegistry(reorderedProject),
    () => createCvShowEntryProject(reorderedProject, entryId),
    () => validateCvShowRuntimeAdmission(reorderedProject, entryId, {
      audioClip,
      alignmentClip,
      sourceSequence: sequence,
    }),
    () => createCvShowEntryTuple(reorderedProject, entryId, sequence, {
      adapter,
      mediaAdmission: { audioClip, alignmentClip },
    }),
  ];
  const observedCodes = calls.map((call) => {
    try {
      call();
      return null;
    } catch (error) {
      return error.code;
    }
  });
  assert.deepEqual(
    observedCodes,
    calls.map(() => 'CV_SHOW_PRESENTATION_PROJECT_INVALID'),
  );
  assert.equal(operationCount, 0);
});

test('Workspace authoring tools mutate the actual master, invert semantics, and invalidate narration media', async () => {
  const manifest = structuralAlignmentManifest();
  const clip = manifest.clips.find(({ id }) => id === 'positioning');
  const sequence = structuralSequence(clip.id);
  const session = await createTestAuthoringSession(STRUCTURAL_PROJECT);
  const baseRevision = STRUCTURAL_PROJECT.revision;
  const originalRegistry = session.view.mediaRegistry;
  const originalTimelineHash = createPresentationAuthoringTimelineProjection(STRUCTURAL_PROJECT).hash;
  const cellId = 'cv-show:cue:positioning.tenure-marker';
  const originalCell = STRUCTURAL_PROJECT.cells.find(({ id }) => id === cellId);
  const originalStory = projectCvShowStory(STRUCTURAL_PROJECT);
  const originalSlice = createCvShowEntryProject(STRUCTURAL_PROJECT, 'positioning');
  const timingResult = await session.mutationSession.invoke('presentation_authoring_cell_set_timing', {
    id: 'cv-show-test-timing',
    base: base(session.view.project),
    payload: {
      cellId,
      timing: { ...structuredClone(originalCell.timing), leadMs: originalCell.timing.leadMs + 1 },
    },
  });
  const timingProject = session.view.project;
  const timingStory = projectCvShowStory(timingProject);
  const timingSlice = createCvShowEntryProject(timingProject, 'positioning');
  assert.equal(timingProject.revision, baseRevision + 1);
  assert.notEqual(timingProject.hash, STRUCTURAL_PROJECT.hash);
  assert.notEqual(timingSlice.hash, originalSlice.hash);
  assert.equal(
    timingStory.scenes[0].directives.find(({ id }) => id === 'positioning.tenure-marker').timing.offsetMs,
    -timingProject.cells.find(({ id }) => id === cellId).timing.leadMs,
  );
  assert.equal(timingResult.mediaDisposition.status, 'preserved');
  assert.equal(timingResult.mediaDisposition.mediaCollection.entries.length, 30);
  assert.equal(
    timingResult.mediaDisposition.mediaCollection.entries
      .every(({ mediaAncestry }) => mediaAncestry.playable),
    true,
  );
  assert.equal(session.read().mediaAncestry, undefined);
  assert.equal(timingResult.cvMediaDisposition.status, 'preserved');
  assert.deepEqual(timingResult.cvMediaDisposition.affectedEntryIds, []);
  assert.deepEqual(
    Object.fromEntries(Object.entries(timingResult.cvMediaDisposition.registry.entries)
      .map(([entryId, value]) => [entryId, value.binding])),
    Object.fromEntries(Object.entries(originalRegistry.entries)
      .map(([entryId, value]) => [entryId, value.binding])),
  );
  assert.equal(
    Object.values(timingResult.cvMediaDisposition.registry.entries)
      .every(({ status, playable }) => status === 'accepted' && playable),
    true,
  );
  assert.doesNotThrow(() => createCvShowEntryTuple(timingProject, 'positioning', sequence, {
    adapter: immediateAdapter(),
    mediaAncestry: session.view.mediaRegistry,
  }));

  const inverse = await session.mutationSession.invoke('presentation_authoring_inverse', {
    command: timingResult.command,
    change: timingResult.change,
    receipt: timingResult.receipt,
  });
  await session.mutationSession.invoke(inverse.toolName, {
    id: inverse.inverse.id,
    base: base(session.view.project),
    payload: inverse.inverse.payload,
  });
  const invertedProject = session.view.project;
  assert.equal(invertedProject.revision, baseRevision + 2);
  assert.notEqual(invertedProject.hash, timingProject.hash);
  assert.deepEqual(projectCvShowStory(invertedProject), originalStory);
  assert.deepEqual(
    invertedProject.cells.find(({ id }) => id === cellId).timing,
    originalCell.timing,
  );
  assert.equal(
    createPresentationAuthoringTimelineProjection(invertedProject).hash,
    originalTimelineHash,
  );

  const narrationCell = invertedProject.cells.find(({ id }) => id === 'cv-show:narration:positioning');
  const narrationResult = await session.mutationSession.invoke('presentation_authoring_cell_set_content', {
    id: 'cv-show-test-narration',
    base: base(invertedProject),
    payload: {
      cellId: narrationCell.id,
      content: { ...structuredClone(narrationCell.turn), text: `${narrationCell.turn.text} Тест.` },
    },
  });
  assert.equal(session.view.project.revision, baseRevision + 3);
  assert.notEqual(
    createPresentationAuthoringTimelineProjection(session.view.project).hash,
    originalTimelineHash,
  );
  assert.equal(narrationResult.mediaDisposition.status, 'invalidated');
  const invalidatedMedia = narrationResult.mediaDisposition.mediaCollection.entries
    .find(({ entryId }) => entryId === 'positioning').mediaAncestry;
  assert.deepEqual(
    ['audio', 'alignment', 'render'].map((key) => (
      invalidatedMedia[key].status
    )),
    ['stale', 'stale', 'stale'],
  );
  assert.equal(invalidatedMedia.playable, false);
  assert.equal(narrationResult.cvMediaDisposition.status, 'invalidated');
  assert.deepEqual(narrationResult.cvMediaDisposition.affectedEntryIds, ['positioning']);
  assert.equal(
    narrationResult.cvMediaDisposition.registry.entries.positioning.status,
    'stale',
  );
  assert.equal(
    narrationResult.cvMediaDisposition.registry.entries.positioning.playable,
    false,
  );
  assert.equal(
    narrationResult.cvMediaDisposition.registry.entries['symbiote-workspace'].status,
    'accepted',
  );
  assert.notEqual(
    narrationResult.cvMediaDisposition.registry.entries.positioning.narrationCellHash,
    originalRegistry.entries.positioning.narrationCellHash,
  );
  let operationCount = 0;
  const unusedAdapter = {
    runInteraction: async () => { operationCount += 1; return undefined; },
    runAttention: async () => { operationCount += 1; return undefined; },
    waitForState: async () => { operationCount += 1; return undefined; },
  };
  assert.throws(
    () => createCvShowEntryTuple(session.view.project, 'positioning', sequence, {
      adapter: unusedAdapter,
      mediaAncestry: session.view.mediaRegistry,
    }),
    (error) => error?.code === 'CV_SHOW_MEDIA_ANCESTRY_STALE',
  );
  const unaffectedClip = manifest.clips.find(({ id }) => id === 'symbiote-workspace');
  const unaffectedSequence = structuralSequence(unaffectedClip.id);
  assert.doesNotThrow(() => createCvShowEntryTuple(
    session.view.project,
    unaffectedClip.id,
    unaffectedSequence,
    {
      adapter: unusedAdapter,
      mediaAncestry: session.view.mediaRegistry,
    },
  ));
  assert.equal(operationCount, 0);
});

test('Execution v1 has one active effect, no queue/autodrain, actual receipts, and typed expiry', async () => {
  const manifest = structuralAlignmentManifest();
  const clip = manifest.clips[0];
  const sequence = structuralSequence(clip.id);
  let releaseSetup;
  const setupGate = new Promise((resolve) => { releaseSetup = resolve; });
  const operations = [];
  const emitted = [];
  const delayed = async (operation) => {
    const typedOperation = Object.freeze({ ...operation, kind: 'interaction' });
    operations.push(typedOperation);
    await setupGate;
    return reportOperationReceipts(typedOperation);
  };
  const tuple = createCvShowEntryTuple(STRUCTURAL_PROJECT, clip.id, sequence, {
    adapter: {
      runInteraction: delayed,
      runAttention: immediateAdapter(operations).runAttention,
      waitForState: immediateAdapter(operations).waitForState,
    },
    onReceipt: (value) => emitted.push(value),
  });
  let snapshot = tuple.execution.sample({ mediaTimeMs: 0, reason: 'setup' });
  assert.equal(snapshot.activeCount, 1);
  assert.equal(snapshot.pendingCount, 0);
  snapshot = tuple.execution.sample({ mediaTimeMs: 0, reason: 'busy-sample' });
  assert.equal(snapshot.activeCount, 1);
  assert.equal(snapshot.pendingCount, 0);
  assert.equal(snapshot.busySampleCount, 1);
  assert.equal(operations.length, 1, 'busy sample must not auto-drain another effect');
  releaseSetup();
  snapshot = await tuple.execution.whenIdle();
  assert.equal(snapshot.activeCount, 0);
  assert.deepEqual(emitted.map(({ status }) => status), ['acted', 'settled']);

  const expired = [];
  const expiryTuple = createCvShowEntryTuple(STRUCTURAL_PROJECT, clip.id, sequence, {
    adapter: immediateAdapter(),
    onReceipt: (value) => expired.push(value),
  });
  snapshot = expiryTuple.execution.sample({
    mediaTimeMs: expiryTuple.schedule.totalDurationMs,
    reason: 'expired-checkpoint',
  });
  assert.equal(snapshot.activeCount, 0);
  assert.equal(snapshot.pendingCount, 0);
  const skipped = expired.filter(({ status }) => status === 'skipped');
  assert.ok(skipped.length > 0);
  assert.equal(skipped.every(({ reason }) => (
    reason.code === 'PRESENTATION_EFFECT_EXPIRED'
      && reason.details.cause === 'expired'
  )), true);
  assert.equal(expired.some(({ status, kind }) => status === 'ended' && kind === 'narration'), true);
});

test('branch return derives a filtered parent slice with setup once and no completed groups', async () => {
  const manifest = structuralAlignmentManifest();
  const clip = manifest.clips[0];
  const sequence = structuralSequence(clip.id);
  const full = createCvShowEntryTuple(STRUCTURAL_PROJECT, clip.id, sequence, {
    adapter: immediateAdapter(),
  });
  const attentionCells = full.schedule.cells.filter(({ cellId }) => (
    !cellId.endsWith(':scroll')
    && STRUCTURAL_PROJECT.cells.find(({ id }) => id === cellId)?.timing?.at.anchor === 'speech'
  ));
  const checkpointMs = attentionCells[0].anchorMs - full.schedule.presentationStartMs + 1;
  const operations = [];
  const filtered = createCvShowEntryTuple(STRUCTURAL_PROJECT, clip.id, sequence, {
    checkpointMs,
    adapter: immediateAdapter(operations),
  });
  assert.equal(filtered.includedSpeechDirectiveIds.includes('positioning.tenure-marker'), false);
  assert.equal(filtered.project.cells.some(({ id }) => id.includes('positioning.tenure-marker')), false);
  assert.equal(filtered.project.script.metadata.cvShow.slice.parent, null);
  assert.deepEqual(filtered.project.cells.find(({ id }) => id.endsWith(':scroll')).dependsOn, [{
    cellId: 'cv-show:cue:positioning.open',
    barrier: 'settled',
  }]);

  filtered.execution.sample({ mediaTimeMs: 0, reason: 'branch-setup' });
  await filtered.execution.whenIdle();
  for (let cell of filtered.schedule.cells.filter(({ kind }) => kind !== 'narration')) {
    if (cell.startMs === 0) continue;
    filtered.execution.sample({ mediaTimeMs: cell.startMs, reason: 'branch-future' });
    await filtered.execution.whenIdle();
  }
  assert.equal(operations.filter(({ projectCell }) => projectCell.id === 'cv-show:cue:positioning.open').length, 1);
  assert.equal(operations.some(({ projectCell }) => projectCell.id.includes('positioning.tenure-marker')), false);
  for (let id of filtered.includedSpeechDirectiveIds) {
    assert.equal(operations.filter(({ projectCell }) => (
      projectCell.id === `cv-show:cue:${id}` || projectCell.id === `cv-show:cue:${id}:scroll`
    )).length, 2, id);
  }
});

test('branch filtering uses the earliest group start at every checkpoint boundary', async () => {
  const manifest = structuralAlignmentManifest();
  const clip = manifest.clips.find(({ id }) => id === 'symbiote-workspace');
  const sequence = structuralSequence(clip.id);
  const full = createCvShowEntryTuple(STRUCTURAL_PROJECT, clip.id, sequence, {
    adapter: immediateAdapter(),
  });
  const allGroups = [...full.includedSpeechDirectiveIds];
  const firstCellId = `cv-show:cue:${allGroups[0]}`;
  const firstCells = full.schedule.cells.filter(({ cellId }) => (
    cellId === firstCellId || cellId === `${firstCellId}:scroll`
  ));
  const firstStartMs = Math.min(...firstCells.map(({ startMs }) => startMs))
    - full.schedule.presentationStartMs;
  const firstAnchorMs = firstCells.find(({ cellId }) => cellId === firstCellId).anchorMs
    - full.schedule.presentationStartMs;
  const firstEndMs = Math.max(...firstCells.map((cell) => (
    cell.gesture?.endMs ?? cell.visibility?.endMs
  ))) - full.schedule.presentationStartMs;
  const boundaries = [
    { name: 'before-start', checkpointMs: firstStartMs - 1, expected: allGroups },
    { name: 'at-start', checkpointMs: firstStartMs, expected: allGroups.slice(1) },
    { name: 'inside-lead', checkpointMs: firstStartMs + 1, expected: allGroups.slice(1) },
    { name: 'at-anchor', checkpointMs: firstAnchorMs, expected: allGroups.slice(1) },
    { name: 'after-group', checkpointMs: firstEndMs + 1, expected: allGroups.slice(1) },
  ];

  for (let boundary of boundaries) {
    const operations = [];
    const receipts = [];
    const options = {
      checkpointMs: boundary.checkpointMs,
      adapter: immediateAdapter(operations),
      onReceipt: (value) => receipts.push(value),
    };
    const tuple = createCvShowEntryTuple(
      STRUCTURAL_PROJECT,
      clip.id,
      sequence,
      options,
    );
    const repeated = createCvShowEntryTuple(
      STRUCTURAL_PROJECT,
      clip.id,
      sequence,
      { ...options, adapter: immediateAdapter() },
    );
    assert.deepEqual(tuple.includedSpeechDirectiveIds, boundary.expected, boundary.name);
    assert.equal(tuple.project.id, repeated.project.id, boundary.name);
    assert.equal(tuple.project.hash, repeated.project.hash, boundary.name);
    const firstRetainedScroll = tuple.project.cells.find(({ id }) => id.endsWith(':scroll'));
    assert.deepEqual(firstRetainedScroll.dependsOn, [{
      cellId: 'cv-show:cue:workspace.open',
      barrier: 'settled',
    }], boundary.name);

    tuple.execution.sample({ mediaTimeMs: 0, reason: `${boundary.name}-setup` });
    await tuple.execution.whenIdle();
    tuple.execution.sample({
      mediaTimeMs: tuple.schedule.presentationStartMs + boundary.checkpointMs,
      reason: `${boundary.name}-checkpoint`,
    });
    await tuple.execution.whenIdle();
    for (let cell of tuple.schedule.cells.filter(({ kind, startMs }) => (
      kind !== 'narration' && startMs > tuple.schedule.presentationStartMs + boundary.checkpointMs
    ))) {
      tuple.execution.sample({ mediaTimeMs: cell.startMs, reason: `${boundary.name}-future` });
      await tuple.execution.whenIdle();
    }
    assert.equal(
      receipts.some(({ status, reason }) => (
        status === 'skipped'
          && reason.code === 'PRESENTATION_EFFECT_EXPIRED'
          && reason.details.cause === 'expired'
      )),
      false,
      boundary.name,
    );
    for (let groupId of boundary.expected) {
      assert.equal(
        operations.filter(({ projectCell }) => projectCell.id === `cv-show:cue:${groupId}:scroll`).length,
        1,
        `${boundary.name}/${groupId}:scroll`,
      );
      assert.equal(
        operations.filter(({ projectCell }) => projectCell.id === `cv-show:cue:${groupId}`).length,
        1,
        `${boundary.name}/${groupId}`,
      );
    }
  }
});

test('aligned media waits for physical playback and completes preroll before narration', async (t) => {
  let { appConfig, manifest, raw: releaseRaw } = structuralWebHarness();
  clearCvShowWebAudioReleaseCache();
  const authority = createCvShowAuthoringAuthority({
    seedProject: STRUCTURAL_PROJECT,
  });
  const fetchImpl = async (url) => {
    const clip = manifest.clips.find(({ alignedSequenceFile }) => (
      String(url).endsWith(alignedSequenceFile)
    ));
    return new Response(
      clip ? structuralSequenceJson(clip.id) : releaseRaw,
      { headers: { 'content-type': 'application/json' } },
    );
  };
  const controller = createCvShowAlignmentController({
    url: 'https://portfolio.example/cv/?showAudio=local',
    baseUrl: 'https://portfolio.example/cv/',
    appConfig,
    fetchImpl,
    getAuthoringView: () => authority.getView(),
  });
  t.after(() => {
    controller.cancel();
    authority.dispose();
  });
  await controller.prepare(CV_SHOW_STORY);

  class FakeMedia extends EventTarget {
    #currentTime = 0;
    #src = '';
    paused = true;
    ended = false;
    error = null;
    readyState = 0;
    preload = '';
    loadCount = 0;
    playCount = 0;
    muted = false;
    seekable = { length: 1, start: () => 0, end: () => 60 };

    get currentTime() { return this.#currentTime; }
    set currentTime(value) {
      this.#currentTime = Number(value) || 0;
      this.dispatchEvent(new Event('seeking'));
      this.dispatchEvent(new Event('seeked'));
    }
    get src() { return this.#src; }
    set src(value) { this.#src = String(value); }
    get currentSrc() { return this.#src; }
    pause() {
      this.paused = true;
      this.dispatchEvent(new Event('pause'));
      queueMicrotask(() => this.dispatchEvent(new Event('timeupdate')));
    }
    play() {
      this.playCount += 1;
      this.paused = false;
      if (this.playCount === 1) this.#currentTime = 0.417;
      this.dispatchEvent(new Event('play'));
      this.dispatchEvent(new Event('playing'));
      return Promise.resolve();
    }
    load() {
      this.loadCount += 1;
      this.dispatchEvent(new Event('loadstart'));
      this.readyState = 1;
      this.dispatchEvent(new Event('loadedmetadata'));
      this.readyState = 2;
      this.dispatchEvent(new Event('loadeddata'));
    }
  }

  const entry = CV_SHOW_STORY.scenes.find(({ id }) => id === 'positioning');
  const media = new FakeMedia();
  media.muted = true;
  const operations = [];
  let releaseMarker;
  let markMarkerStarted;
  const markerGate = new Promise((resolve) => { releaseMarker = resolve; });
  const markerStarted = new Promise((resolve) => { markMarkerStarted = resolve; });
  const aligned = await controller.createEntryRuntime({
    entry,
    media,
    audioClip: manifest.clips.find(({ id }) => id === entry.id),
    deferPresentationUntilPlayback: true,
    beforeDeferredPresentation: async () => {
      operations.push(Object.freeze({
        id: 'historical-owner',
        mediaPaused: media.paused,
        mediaMuted: media.muted,
        mediaTimeMs: Math.round(media.currentTime * 1_000),
      }));
    },
    runPresentationOperation: async (operation) => {
      operations.push(Object.freeze({
        id: operation.projectCell.id,
        mediaPaused: media.paused,
        mediaMuted: media.muted,
        mediaTimeMs: Math.round(media.currentTime * 1_000),
      }));
      if (operation.projectCell.id === 'cv-show:cue:positioning.tenure-marker') {
        if (requiresProviderAdmission(operation)) {
          operation.reportAdmission(Object.freeze({
            providerAdmission: testProviderAdmission(operation),
          }));
        }
        const observedAt = operationObservation();
        operation.reportReceipt(Object.freeze({
          status: 'first-frame',
          observedAt,
          providerReceipt: TEST_PROVIDER_RECEIPT,
        }));
        markMarkerStarted();
        await markerGate;
        operation.reportReceipt(Object.freeze({
          status: 'settled',
          observedAt,
          providerReceipt: TEST_PROVIDER_RECEIPT,
        }));
        return undefined;
      }
      return reportOperationReceipts(operation);
    },
  });
  t.after(() => aligned.runtime.dispose());

  const generation = await aligned.runtime.loadAndRestorePlayback({
    source: 'https://portfolio.example/cv/positioning.opus',
    positionMs: 0,
    paused: true,
    preload: 'auto',
  }, { reason: 'alignment-ready' });
  assert.equal(generation.status, 'completed');
  assert.equal(media.loadCount, 1);
  assert.equal(media.playCount, 0);
  assert.equal(media.paused, true);
  assert.deepEqual(operations, [], 'showPlay=0 cannot admit presenter work');
  assert.equal(aligned.execution.snapshot.state, 'paused');

  await Promise.resolve(aligned.runtime.resume());
  await markerStarted;
  aligned.runtime.pause();
  assert.equal(
    aligned.runtime.resume(),
    true,
    'Resume during the retained marker becomes a queued transport intent',
  );
  assert.equal(media.playCount, 1, 'queued Resume cannot move media during the marker gate');
  releaseMarker();
  await aligned.runtime.whenIdle();

  assert.deepEqual(operations, [
    {
      id: 'historical-owner',
      mediaPaused: true,
      mediaMuted: true,
      mediaTimeMs: 0,
    },
    {
      id: 'cv-show:cue:positioning.open',
      mediaPaused: true,
      mediaMuted: true,
      mediaTimeMs: 0,
    },
    {
      id: 'cv-show:cue:positioning.tenure-marker:scroll',
      mediaPaused: true,
      mediaMuted: true,
      mediaTimeMs: 0,
    },
    {
      id: 'cv-show:cue:positioning.tenure-marker',
      mediaPaused: true,
      mediaMuted: true,
      mediaTimeMs: 0,
    },
  ]);
  assert.equal(media.playCount, 2, 'one admitted play is followed by one post-preroll resume');
  assert.equal(media.paused, false);
  assert.equal(media.muted, false);
  assert.equal(media.currentTime, 0);
  assert.equal(
    aligned.execution.snapshot.terminal
      .filter(({ cellId }) => cellId.includes('positioning.tenure-marker'))
      .every(({ status }) => status === 'completed'),
    true,
  );
});
