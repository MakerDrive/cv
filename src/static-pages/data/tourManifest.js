function freezeDeep(value) {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
  for (let child of Object.values(value)) freezeDeep(child);
  return Object.freeze(value);
}

function directive(id, type, target, options = {}) {
  return freezeDeep({
    id,
    type,
    ...(target ? { target } : {}),
    policy: 'required',
    ...options,
  });
}

function scene(id, period, projectId, directives, branchId = null) {
  return freezeDeep({
    id,
    period,
    ...(projectId ? { projectId } : {}),
    directives,
    ...(branchId ? { branchId } : {}),
  });
}

function branch(id, sceneId, anchor, directives) {
  return freezeDeep({
    id,
    sceneId,
    directives,
    return: {
      anchor,
      resume: 'paused',
      replayCompletedSpeech: false,
    },
  });
}

export const TOUR_RUNTIME_POLICY = freezeDeep({
  attention: {
    cursorCount: 1,
    cursorPersistent: true,
    exclusive: ['cursor', 'frame', 'native-selection', 'activation'],
  },
  marker: {
    accumulatesWithinSeries: true,
    clearOnAttentionChange: true,
  },
  userInteraction: {
    autoPause: 'meaningful-only',
    ignored: ['hover', 'pointer-move'],
    resumeAction: 'continue',
  },
  audio: {
    exclusive: true,
    shortVideo: 'muted-montage-with-tour-speech',
    detailVideo: 'full-media-audio-with-silent-tour',
  },
  branch: {
    preserves: ['mode', 'scene', 'position', 'playback', 'subject'],
    returnState: 'paused',
  },
  ownership: {
    sharedRuntime: 'symbiote-ui',
    productScenario: 'cv',
  },
});

export const TOUR_LOCAL_AUDIO_CONFIG = freezeDeep({
  audio: 'local',
  locale: 'ru',
  voice: 'maximo-default-male',
  audioManifests: {
    'maximo-default-male': 'fd525ef880dd38b8/manifest.json',
  },
  alignmentManifest: 'alignment/large-v3-turbo/89c82b1482543d4f/manifest.json',
});

export const TOUR_SHORT_SEQUENCE = freezeDeep([
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
]);

export const TOUR_SCENES = freezeDeep([
  scene('positioning', 'present', null, [
    directive('positioning.experience-frame', 'frame', 'profile.experience'),
    directive('positioning.tenure-marker', 'marker', 'profile.experience.15-plus', {
      series: 'positioning-tenure',
      shape: 'oval',
    }),
    directive('positioning.team-pause', 'idle', null),
    directive('positioning.workspace-transition', 'frame', 'project-card.symbiote-workspace'),
  ]),
  scene('symbiote-workspace', '2026', 'projects/symbiote-workspace', [
    directive('workspace.open', 'navigate', 'projects/symbiote-workspace'),
    directive('workspace.intro-frame', 'frame', 'article.symbiote-workspace.intro'),
    directive('workspace.portable-config', 'native-selection', 'article.symbiote-workspace.portable-config'),
    directive('workspace.agent-portal-card', 'frame', 'article.symbiote-workspace.agent-portal'),
    directive('workspace.video-studio-card', 'frame', 'article.symbiote-workspace.video-studio'),
    directive('workspace.active-note', 'chat-note', 'chat.note.workspace-active-development'),
  ], 'workspace-details'),
  scene('symbiote-ui', '2026', 'projects/symbiote-ui', [
    directive('symbiote-ui.open', 'navigate', 'projects/symbiote-ui'),
    directive('symbiote-ui.layout', 'frame', 'article.symbiote-ui.layout'),
    directive('symbiote-ui.resource-tree', 'frame', 'article.symbiote-ui.resource-tree'),
    directive('symbiote-ui.graph-tooling', 'frame', 'article.symbiote-ui.graph-tooling'),
    directive('symbiote-ui.current-show', 'frame', 'portfolio.show-stage'),
    directive('symbiote-ui.current-show-note', 'chat-note', 'chat.note.show-uses-symbiote-ui'),
    directive('symbiote-ui.pause', 'idle', null),
  ], 'symbiote-ui-details'),
  scene('symbiote-engine', '2026', 'projects/symbiote-engine', [
    directive('symbiote-engine.open', 'navigate', 'projects/symbiote-engine'),
    directive('symbiote-engine.intro', 'frame', 'article.symbiote-engine.intro'),
    directive('symbiote-engine.workspace-join', 'marker', 'article.symbiote-engine.workspace-join', {
      series: 'workspace-layers',
      shape: 'converging-arrows',
    }),
    directive('symbiote-engine.pause', 'idle', null),
  ], 'symbiote-engine-details'),
  scene('agent-portal', '2025–2026', 'projects/agent-portal', [
    directive('agent-portal.open', 'navigate', 'projects/agent-portal'),
    directive('agent-portal.open-source', 'frame', 'article.agent-portal.open-source'),
    directive('agent-portal.process', 'frame', 'article.agent-portal.process-diagram'),
    directive('agent-portal.path', 'marker', 'article.agent-portal.process-path', {
      series: 'agent-portal-process',
      shape: 'route',
    }),
    directive('agent-portal.configuration', 'marker', 'article.agent-portal.configuration-label', {
      series: 'agent-portal-process',
      shape: 'label',
      text: 'пример конфигурации',
    }),
    directive('agent-portal.human-decision', 'marker', 'article.agent-portal.human-decision', {
      series: 'agent-portal-process',
      shape: 'oval',
    }),
  ], 'agent-portal-details'),
  scene('symbiote-video-studio', '2025–2026', 'projects/symbiote-video-studio', [
    directive('video-studio.open', 'navigate', 'projects/symbiote-video-studio'),
    directive('video-studio.visible-process', 'native-selection', 'article.symbiote-video-studio.visible-process'),
    directive('video-studio.graph', 'frame', 'article.symbiote-video-studio.node-graph'),
    directive('video-studio.timeline', 'frame', 'article.symbiote-video-studio.timeline'),
    directive('video-studio.preview', 'frame', 'article.symbiote-video-studio.preview'),
    directive('video-studio.export', 'frame', 'article.symbiote-video-studio.export'),
    directive('video-studio.demo', 'activate', 'article.symbiote-video-studio.demo', {
      safePath: 'graph-timeline-preview',
    }),
  ], 'video-studio-details'),
  scene('adaptive-maximo-workbench', 'TODO: период карточки', 'projects/adaptive-maximo-workbench', [
    directive('maximo.open', 'navigate', 'projects/adaptive-maximo-workbench'),
    directive('maximo.status', 'frame', 'article.adaptive-maximo-workbench.demo-alpha'),
    directive('maximo.work-orders', 'frame', 'article.adaptive-maximo-workbench.work-orders'),
    directive('maximo.asset-context', 'frame', 'article.adaptive-maximo-workbench.asset-context'),
    directive('maximo.integration-pause', 'idle', null),
  ], 'maximo-workbench-details'),
  scene('agent-pool-mcp', '2026', 'projects/agent-pool-mcp', [
    directive('agent-pool.open', 'navigate', 'projects/agent-pool-mcp'),
    directive('agent-pool.intro', 'frame', 'article.agent-pool-mcp.intro'),
    directive('agent-pool.flow', 'marker', 'article.agent-pool-mcp.execution-flow', {
      series: 'agent-pool-flow',
      shape: 'route',
    }),
  ], 'agent-pool-details'),
  scene('project-graph-mcp', '2026', 'projects/project-graph-mcp', [
    directive('project-graph.open', 'navigate', 'projects/project-graph-mcp'),
    directive('project-graph.example', 'frame', 'article.project-graph-mcp.graph-example'),
    directive('project-graph.context', 'native-selection', 'article.project-graph-mcp.compact-context'),
    directive('project-graph.node', 'activate', 'article.project-graph-mcp.readonly-node', {
      safePath: 'expand-readonly-node',
      policy: 'optional',
    }),
    directive('project-graph.pause', 'idle', null),
  ], 'project-graph-details'),
  scene('lifecycle-messaging-platform', '2022–2026', 'projects/lifecycle-messaging-platform', [
    directive('lifecycle.open', 'navigate', 'projects/lifecycle-messaging-platform'),
    directive('lifecycle.scope', 'native-selection', 'article.lifecycle-messaging-platform.product-scope'),
    directive('lifecycle.product-number', 'marker', 'article.lifecycle-messaging-platform.product-surfaces', {
      series: 'lifecycle-layers',
      shape: 'number',
      text: '1',
    }),
    directive('lifecycle.runtime-number', 'marker', 'article.lifecycle-messaging-platform.backend-runtime', {
      series: 'lifecycle-layers',
      shape: 'number',
      text: '2',
    }),
    directive('lifecycle.delivery-number', 'marker', 'article.lifecycle-messaging-platform.delivery-ops', {
      series: 'lifecycle-layers',
      shape: 'number',
      text: '3',
    }),
    directive('lifecycle.digital-twin', 'marker', 'article.lifecycle-messaging-platform.digital-twin', {
      series: 'lifecycle-twin',
      shape: 'bidirectional-route',
    }),
  ], 'lifecycle-platform-details'),
  scene('mobile-smm-platform', 'TODO: период карточки', 'projects/mobile-smm-platform', [
    directive('mobile-smm.open', 'navigate', 'projects/mobile-smm-platform'),
    directive('mobile-smm.overview', 'frame', 'article.mobile-smm-platform.system-map'),
    directive('mobile-smm.stable-path', 'marker', 'article.mobile-smm-platform.stable-path', {
      series: 'mobile-smm-flow',
      shape: 'route',
    }),
    directive('mobile-smm.agent-update', 'marker', 'article.mobile-smm-platform.agent-update', {
      series: 'mobile-smm-flow',
      shape: 'oval',
    }),
  ], 'mobile-smm-details'),
  scene('f360-studio', '2021–2022', 'projects/f360-studio', [
    directive('f360.open', 'navigate', 'projects/f360-studio'),
    directive('f360.process', 'frame', 'article.f360-studio.production-path'),
    directive('f360.result', 'activate', 'article.f360-studio.gallery-result', {
      safePath: 'open-source-backed-result',
    }),
    directive('f360.closure-pause', 'idle', null),
  ], 'f360-details'),
  scene('autobox', '2019–2021', 'projects/autobox-v1', [
    directive('autobox.open', 'navigate', 'projects/autobox-v1'),
    directive('autobox.buddha', 'marker', 'article.autobox-v1.buddha-render', {
      series: 'autobox-results',
      shape: 'arrow',
    }),
    directive('autobox.renders', 'marker', 'article.autobox-v1.render-gallery', {
      series: 'autobox-results',
      shape: 'ovals',
    }),
    directive('autobox.netsuke-montage', 'media', 'article.autobox-v1.netsuke-video', {
      mode: 'short-muted-montage',
      action: 'watch-full-video',
      policy: 'optional',
    }),
    directive('autobox.benin-bronze', 'marker', 'article.autobox-v1.benin-bronze', {
      series: 'autobox-bronze',
      shape: 'arrow',
    }),
    directive('autobox.prototype-pause', 'idle', null),
  ], 'autobox-details'),
  scene('complexscan', '2017–2022', 'projects/complexscan', [
    directive('complexscan.open', 'navigate', 'projects/complexscan'),
    directive('complexscan.line', 'frame', 'article.complexscan.product-line'),
    directive('complexscan.platform', 'marker', 'article.complexscan.transparent-platform', {
      series: 'complexscan-products',
      shape: 'number',
      text: '1',
    }),
    directive('complexscan.autobox', 'marker', 'article.complexscan.autobox', {
      series: 'complexscan-products',
      shape: 'number',
      text: '2',
    }),
    directive('complexscan.bottle-rig', 'marker', 'article.complexscan.bottle-rig', {
      series: 'complexscan-products',
      shape: 'number',
      text: '3',
      policy: 'optional',
    }),
    directive('complexscan.delivery', 'native-selection', 'article.complexscan.international-delivery'),
  ], 'complexscan-details'),
  scene('photopizza', '2010–2022', 'projects/photopizza', [
    directive('photopizza.open', 'navigate', 'projects/photopizza'),
    directive('photopizza.intro', 'frame', 'article.photopizza.intro'),
    directive('photopizza.origin', 'native-selection', 'article.photopizza.megavisor-origin'),
    directive('photopizza.mechanics', 'frame', 'article.photopizza.mechanics'),
    directive('photopizza.controller', 'frame', 'article.photopizza.controller'),
    directive('photopizza.browser-ui', 'frame', 'article.photopizza.browser-ui'),
    directive('photopizza.platform-route', 'marker', 'article.photopizza.turntable', {
      series: 'photopizza-controller',
      shape: 'arrow',
    }),
    directive('photopizza.slider-route', 'marker', 'article.photopizza.camera-slider', {
      series: 'photopizza-controller',
      shape: 'arrow',
    }),
    directive('photopizza.panorama-route', 'marker', 'article.photopizza.panorama-head', {
      series: 'photopizza-controller',
      shape: 'arrow',
    }),
    directive('photopizza.documentation-pause', 'idle', null),
  ], 'photopizza-details'),
  scene('finale', 'настоящее', null, [
    directive('finale.map', 'navigate', 'projects/index'),
    directive('finale.history', 'frame', 'portfolio.map.historical-branch'),
    directive('finale.scale-route', 'marker', 'portfolio.map.engineering-scale-route', {
      series: 'finale-scale',
      shape: 'route',
    }),
    directive('finale.workspace', 'frame', 'project-card.symbiote-workspace'),
    directive('finale.contacts', 'activate', 'profile.contacts'),
    directive('finale.actions', 'chat-action', 'chat.actions.finale', {
      actions: ['projects', 'resume', 'contact'],
      persistent: true,
    }),
    directive('finale.pause', 'idle', null),
  ]),
]);

export const TOUR_DETAIL_BRANCHES = freezeDeep({
  'workspace-details': branch('workspace-details', 'symbiote-workspace', 'short.after.workspace', [
    directive('workspace-details.flow-frame', 'frame', 'article.symbiote-workspace.config-flow'),
    directive('workspace-details.flow-route', 'marker', 'article.symbiote-workspace.config-flow', {
      series: 'workspace-config-flow', shape: 'route',
    }),
    directive('workspace-details.builder', 'activate', 'article.symbiote-workspace.builder-demo', {
      safePath: 'layout-validated-patch-modules', policy: 'optional',
    }),
    directive('workspace-details.artifact', 'frame', 'article.symbiote-workspace.config-artifact'),
    directive('workspace-details.hosts', 'frame', 'article.symbiote-workspace.host-examples'),
  ]),
  'symbiote-ui-details': branch('symbiote-ui-details', 'symbiote-ui', 'short.after.symbiote-ui', [
    directive('symbiote-ui-details.composition', 'native-selection', 'article.symbiote-ui.programmatic-composition'),
    directive('symbiote-ui-details.catalog', 'frame', 'article.symbiote-ui.provider-catalog'),
    directive('symbiote-ui-details.manifest', 'activate', 'article.symbiote-ui.manifest-demo', {
      safePath: 'open-readonly-manifest',
    }),
    directive('symbiote-ui-details.workspace-route', 'marker', 'article.symbiote-ui.workspace-link', {
      series: 'symbiote-ui-workspace', shape: 'arrow',
    }),
  ]),
  'symbiote-engine-details': branch('symbiote-engine-details', 'symbiote-engine', 'short.after.symbiote-engine', [
    directive('symbiote-engine-details.layers', 'frame', 'article.symbiote-engine.layer-diagram'),
    directive('symbiote-engine-details.execution', 'native-selection', 'article.symbiote-engine.execution-library'),
    directive('symbiote-engine-details.demo', 'activate', 'article.symbiote-engine.readonly-graph-demo', {
      safePath: 'open-readonly-execution', policy: 'optional',
    }),
  ]),
  'agent-portal-details': branch('agent-portal-details', 'agent-portal', 'short.after.agent-portal', [
    directive('agent-portal-details.gallery', 'activate', 'article.agent-portal.workspace-gallery', {
      safePath: 'open-readonly-kanban-gallery',
    }),
    directive('agent-portal-details.board', 'frame', 'article.agent-portal.kanban-board'),
    directive('agent-portal-details.settings', 'activate', 'article.agent-portal.column-settings', {
      safePath: 'open-readonly-settings', policy: 'optional',
    }),
    directive('agent-portal-details.resource-groups', 'frame', 'article.agent-portal.resource-groups'),
    directive('agent-portal-details.architecture', 'frame', 'article.agent-portal.process-diagram'),
  ]),
  'video-studio-details': branch('video-studio-details', 'symbiote-video-studio', 'short.after.video-studio', [
    directive('video-studio-details.flow', 'frame', 'article.symbiote-video-studio.semantic-flow'),
    directive('video-studio-details.route', 'marker', 'article.symbiote-video-studio.semantic-flow', {
      series: 'video-studio-flow', shape: 'route',
    }),
    directive('video-studio-details.demo', 'activate', 'article.symbiote-video-studio.demo', {
      safePath: 'graph-timeline-preview',
    }),
    directive('video-studio-details.media', 'media', 'article.symbiote-video-studio.full-video', {
      mode: 'full-with-media-audio', action: 'skip-video', policy: 'optional',
    }),
  ]),
  'maximo-workbench-details': branch('maximo-workbench-details', 'adaptive-maximo-workbench', 'short.after.maximo-workbench', [
    directive('maximo-details.work-order', 'activate', 'article.adaptive-maximo-workbench.work-order-demo', {
      safePath: 'open-readonly-work-order',
    }),
    directive('maximo-details.asset', 'frame', 'article.adaptive-maximo-workbench.asset-context'),
    directive('maximo-details.actions', 'frame', 'article.adaptive-maximo-workbench.safe-actions'),
  ]),
  'agent-pool-details': branch('agent-pool-details', 'agent-pool-mcp', 'short.after.agent-pool', [
    directive('agent-pool-details.runtime', 'frame', 'article.agent-pool-mcp.execution-runtime'),
    directive('agent-pool-details.work', 'marker', 'article.agent-pool-mcp.work-branch', {
      series: 'agent-pool-review', shape: 'route',
    }),
    directive('agent-pool-details.review', 'marker', 'article.agent-pool-mcp.review-branch', {
      series: 'agent-pool-review', shape: 'route',
    }),
    directive('agent-pool-details.result', 'marker', 'article.agent-pool-mcp.result', {
      series: 'agent-pool-review', shape: 'route',
    }),
    directive('agent-pool-details.demo', 'activate', 'article.agent-pool-mcp.local-demo', {
      safePath: 'run-local-readonly-task', policy: 'optional',
    }),
  ]),
  'project-graph-details': branch('project-graph-details', 'project-graph-mcp', 'short.after.project-graph', [
    directive('project-graph-details.root', 'frame', 'article.project-graph-mcp.repository-root'),
    directive('project-graph-details.focus', 'frame', 'article.project-graph-mcp.focus-zone'),
    directive('project-graph-details.skeleton', 'frame', 'article.project-graph-mcp.compact-skeleton'),
    directive('project-graph-details.fact', 'native-selection', 'article.project-graph-mcp.browser-fact'),
  ]),
  'lifecycle-platform-details': branch('lifecycle-platform-details', 'lifecycle-messaging-platform', 'short.after.lifecycle-platform', [
    directive('lifecycle-details.product', 'frame', 'article.lifecycle-messaging-platform.product-surfaces'),
    directive('lifecycle-details.runtime', 'frame', 'article.lifecycle-messaging-platform.backend-runtime'),
    directive('lifecycle-details.delivery', 'frame', 'article.lifecycle-messaging-platform.delivery-ops'),
    directive('lifecycle-details.tunnels', 'native-selection', 'article.lifecycle-messaging-platform.tunnels'),
    directive('lifecycle-details.modems', 'native-selection', 'article.lifecycle-messaging-platform.modem-pools'),
    directive('lifecycle-details.route', 'marker', 'article.lifecycle-messaging-platform.delivery-flow', {
      series: 'lifecycle-delivery', shape: 'route',
    }),
    directive('lifecycle-details.twin', 'marker', 'article.lifecycle-messaging-platform.digital-twin', {
      series: 'lifecycle-twin', shape: 'parallel-route',
    }),
    directive('lifecycle-details.history-pause', 'idle', null),
  ]),
  'mobile-smm-details': branch('mobile-smm-details', 'mobile-smm-platform', 'short.after.mobile-smm', [
    directive('mobile-smm-details.gallery', 'frame', 'article.mobile-smm-platform.media-gallery'),
    directive('mobile-smm-details.schedule', 'frame', 'article.mobile-smm-platform.schedule'),
    directive('mobile-smm-details.queue', 'frame', 'article.mobile-smm-platform.queue'),
    directive('mobile-smm-details.approval', 'frame', 'article.mobile-smm-platform.approval-log'),
    directive('mobile-smm-details.devices', 'frame', 'article.mobile-smm-platform.android-devices'),
    directive('mobile-smm-details.draft', 'activate', 'article.mobile-smm-platform.local-demo', {
      safePath: 'draft-test-target-approval-dry-run',
    }),
    directive('mobile-smm-details.ui-change', 'activate', 'article.mobile-smm-platform.ui-change-demo', {
      safePath: 'stop-analyze-propose-for-review',
    }),
  ]),
  'f360-details': branch('f360-details', 'f360-studio', 'short.after.f360', [
    directive('f360-details.path', 'frame', 'article.f360-studio.production-path'),
    directive('f360-details.period', 'native-selection', 'article.f360-studio.period-founder'),
    directive('f360-details.result-one', 'activate', 'article.f360-studio.gallery-result-one', {
      safePath: 'open-source-backed-result',
    }),
    directive('f360-details.result-two', 'activate', 'article.f360-studio.gallery-result-two', {
      safePath: 'open-source-backed-result',
    }),
  ]),
  'autobox-details': branch('autobox-details', 'autobox', 'short.after.autobox', [
    directive('autobox-details.working-system', 'frame', 'article.autobox-v1.working-system'),
    directive('autobox-details.working-route', 'marker', 'article.autobox-v1.working-system', {
      series: 'autobox-working', shape: 'route',
    }),
    directive('autobox-details.planning', 'marker', 'article.autobox-v1.planning-prototype', {
      series: 'autobox-planning', shape: 'route', policy: 'optional',
    }),
    directive('autobox-details.optics', 'marker', 'article.autobox-v1.planning-optics', {
      series: 'autobox-planning', shape: 'label', text: 'оптика', policy: 'optional',
    }),
    directive('autobox-details.overlap', 'marker', 'article.autobox-v1.planning-overlap', {
      series: 'autobox-planning', shape: 'label', text: 'перекрытие', policy: 'optional',
    }),
    directive('autobox-details.mechanics', 'marker', 'article.autobox-v1.planning-mechanics', {
      series: 'autobox-planning', shape: 'label', text: 'механика', policy: 'optional',
    }),
    directive('autobox-details.safety', 'marker', 'article.autobox-v1.planning-safety', {
      series: 'autobox-planning', shape: 'label', text: 'безопасность', policy: 'optional',
    }),
    directive('autobox-details.lidar', 'frame', 'article.autobox-v1.lidar-next-layer', {
      policy: 'optional',
    }),
    directive('autobox-details.video', 'media', 'article.autobox-v1.netsuke-video', {
      mode: 'full-with-media-audio', action: 'skip-video', policy: 'optional',
    }),
    directive('autobox-details.bronze', 'activate', 'article.autobox-v1.benin-bronze', {
      safePath: 'rotate-interactive-model', policy: 'optional',
    }),
  ]),
  'complexscan-details': branch('complexscan-details', 'complexscan', 'short.after.complexscan', [
    directive('complexscan-details.platform', 'frame', 'article.complexscan.transparent-platform'),
    directive('complexscan-details.light', 'frame', 'article.complexscan.controlled-light'),
    directive('complexscan-details.gallery', 'activate', 'article.complexscan.product-gallery', {
      safePath: 'prototype-product-packaging-delivery',
    }),
    directive('complexscan-details.autobox', 'marker', 'article.complexscan.autobox-museum-link', {
      series: 'complexscan-applications', shape: 'route',
    }),
    directive('complexscan-details.bottle', 'marker', 'article.complexscan.bottle-catalog-link', {
      series: 'complexscan-applications', shape: 'route', policy: 'optional',
    }),
  ]),
  'photopizza-details': branch('photopizza-details', 'photopizza', 'short.after.photopizza', [
    directive('photopizza-details.origin', 'native-selection', 'article.photopizza.megavisor-origin'),
    directive('photopizza-details.attribution', 'frame', 'article.photopizza.controller-attribution'),
    directive('photopizza-details.media', 'activate', 'article.photopizza.controller-media', {
      safePath: 'open-three-controller-media',
    }),
    directive('photopizza-details.documentation', 'frame', 'article.photopizza.assembly-calibration'),
    directive('photopizza-details.video', 'media', 'article.photopizza.full-video', {
      mode: 'full-with-media-audio', action: 'skip-video', policy: 'optional',
    }),
  ]),
});
