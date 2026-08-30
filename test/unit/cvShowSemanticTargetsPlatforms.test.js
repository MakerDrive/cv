import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';

import { parsePortfolioArticleBlocks } from '../../src/static-pages/data/portfolioArticleMedia.js';

const PROJECT_ROOT = path.resolve(import.meta.dirname, '../..');
const CONTENT_ROOT = path.join(PROJECT_ROOT, 'src/static-pages/copy-content/projects');
const LOCALES = ['en', 'ru', 'es'];

const EXPECTED_ORDER = Object.freeze({
  'symbiote-workspace': [
    'intro',
    'portable-config',
    'config-flow',
    'config-artifact',
    'agent-portal',
    'video-studio',
    'host-examples',
    'host-boundary',
  ],
  'symbiote-ui': [
    'layout',
    'programmatic-composition',
    'graph-tooling',
    'resource-tree',
    'provider-catalog',
    'manifest-demo',
    'workspace-link',
  ],
  'symbiote-engine': [
    'intro',
    'layer-diagram',
    'execution-library',
    'readonly-graph-demo',
    'workspace-join',
  ],
  'agent-portal': [
    'workspace',
    'workspace-gallery',
    'kanban-board',
    'column-settings',
    'open-source',
    'process-path',
    'human-decision',
    'process-diagram',
    'resource-groups',
    'configuration-label',
  ],
  'symbiote-video-studio': [
    'overview',
    'visible-process',
    'node-graph',
    'timeline',
    'preview',
    'export',
    'semantic-flow',
    'demo',
    'full-video',
  ],
  'adaptive-maximo-workbench': [
    'demo-alpha',
    'work-order-demo',
    'work-orders',
    'asset-context',
    'safe-actions',
    'integration-boundary',
  ],
  'lifecycle-messaging-platform': [
    'product-scope',
    'product-surfaces',
    'backend-runtime',
    'delivery-ops',
    'tunnels',
    'modem-pools',
    'delivery-flow',
    'digital-twin',
  ],
  'mobile-smm-platform': [
    'system-map',
    'stable-path',
    'agent-update',
    'media-gallery',
    'schedule',
    'queue',
    'ui-change-demo',
    'approval-log',
    'android-devices',
    'local-demo',
  ],
});

const RELEVANCE = Object.freeze({
  'symbiote-workspace': {
    intro: /universal environment|универсальная среда|entorno universal/iu,
    'portable-config': /portable executable|переносимая исполняемая|ejecutable y portátil/iu,
    'config-flow': /construction path|Путь сборки|recorrido de construcción/iu,
    'config-artifact': /validated, saved|проверить, сохранить|validarse, guardarse/iu,
    'agent-portal': /Agent Portal/iu,
    'video-studio': /Video Studio/iu,
    'host-examples': /Authentication|Авторизация|autenticación/iu,
    'host-boundary': /construction layer|слой сборки|capa portátil/iu,
  },
  'symbiote-ui': {
    layout: /UI system|UI-система|Sistema UI/iu,
    'programmatic-composition': /composable|компонуемыми|componibles/iu,
    'graph-tooling': /graph editors|редакторы графов|editores de grafos/iu,
    'resource-tree': /resource trees|деревья ресурсов|árboles de recursos/iu,
    'provider-catalog': /provider catalogs|каталоги провайдеров|catálogos de proveedores/iu,
    'manifest-demo': /component manifests|манифесты компонентов|manifiestos de componentes/iu,
    'workspace-link': /Workspace orchestrator|оркестратора Symbiote Workspace|orquestador Symbiote Workspace/iu,
  },
  'symbiote-engine': {
    intro: /execution library|библиотека исполнения|Librería de ejecución/iu,
    'layer-diagram': /backend services.+automation|бекенд-сервисы.+автоматизации|backend.+automatización/iu,
    'execution-library': /DAG|граф|grafo/iu,
    'readonly-graph-demo': /backend.+Workspace|бэкенд.+Workspace|backend.+Workspace/iu,
    'workspace-join': /backend execution provider|провайдером бэкенд-исполнения|proveedor de ejecución del backend/iu,
  },
  'agent-portal': {
    workspace: /practical R&D question|практический R&D-вопрос|pregunta práctica de I\+D/iu,
    'workspace-gallery': /engineering environment|рабочий интерфейс|entorno de ingeniería/iu,
    'kanban-board': /board|доск|tablero/iu,
    'column-settings': /actions.+roles|действия, роли|acciones, roles/iu,
    'open-source': /open-source/iu,
    'process-diagram': /isolated.+branch.+review|изолирован.+ветк.+провер|rama.+aislad.+revis/iu,
    'process-path': /columns?.+process|колонк.+процесс|columnas?.+proceso/iu,
    'human-decision': /conflict.+human|конфликт.+человек|conflicto.+persona/iu,
    'resource-groups': /resource groups|групп.+ресурс|resource groups/iu,
    'configuration-label': /Workspace-as-Config/iu,
  },
  'symbiote-video-studio': {
    overview: /video production environment|среда видеопроизводства|Entorno de producción de video/iu,
    'visible-process': /visible.+process|видим.+процесс|proceso visible/iu,
    'node-graph': /node graph|граф узлов|grafo de nodos/iu,
    timeline: /timeline|таймлайн|línea de tiempo/iu,
    preview: /preview|предпросмотр|vista previa/iu,
    export: /export|экспорт/iu,
    'semantic-flow': /graph.+timeline.+composit.+preview.+(?:render|export)|граф.+таймлайн.+композиц.+предпросмотр.+(?:рендер|экспорт)|grafo.+línea de tiempo.+composici.+vista previa.+(?:render|export)/iu,
    demo: /agent.+semantic.+(?:preview|export)|агент.+семантич.+(?:предпросмотр|экспорт)|agente.+semántic.+(?:vista previa|export)/iu,
    'full-video': /video core.+works|видео-ядро.+работает|núcleo.+Video.+funciona/iu,
  },
  'adaptive-maximo-workbench': {
    'demo-alpha': /Demo.+Alpha/iu,
    'work-order-demo': /read-only/iu,
    'work-orders': /queue|очеред|cola/iu,
    'asset-context': /asset|оборудован|activo/iu,
    'safe-actions': /actions|действия|acciones/iu,
    'integration-boundary': /Production data|Производственные данные|datos de producción/iu,
  },
  'lifecycle-messaging-platform': {
    'product-scope': /lifecycle/iu,
    'product-surfaces': /Web\/PWA/iu,
    'backend-runtime': /PostgreSQL.+WebSocket/iu,
    'delivery-ops': /GSM.+(?:serial|AT)/iu,
    tunnels: /SSH\/WebSocket/iu,
    'modem-pools': /modem|модем|módem/iu,
    'delivery-flow': /queue.+repeat.+monitor|очеред.+повтор.+монитор|cola.+repeti.+monitor/iu,
    'digital-twin': /Digital Twin/iu,
  },
  'mobile-smm-platform': {
    'system-map': /profiles|профили|perfiles/iu,
    'stable-path': /JSON.+Android/iu,
    'agent-update': /screen.+agent|экран.+Агент|pantalla.+agente/iu,
    'media-gallery': /media.+draft|Медиаматериалы.+черновик|multimedia.+borrador/iu,
    schedule: /Scheduling|Расписание|programación/iu,
    queue: /queue|Очередь|cola/iu,
    'ui-change-demo': /changed.+interface|изменённ.+интерфейс|interfaz.+modificada/iu,
    'approval-log': /Approval|согласования|aprobación/iu,
    'android-devices': /Devices|Устройства|dispositivos/iu,
    'local-demo': /local draft|локальным черновиком|borrador local/iu,
  },
});

const AFFECTED_CUE_SEQUENCES = Object.freeze({
  'symbiote-workspace': [
    ['config-flow', 'config-artifact', 'host-examples'],
  ],
  'symbiote-engine': [
    ['intro', 'workspace-join'],
    ['layer-diagram', 'readonly-graph-demo', 'readonly-graph-demo'],
  ],
  'agent-portal': [
    ['open-source', 'process-path', 'human-decision'],
    ['workspace-gallery', 'kanban-board', 'column-settings', 'process-diagram', 'resource-groups'],
  ],
  'symbiote-video-studio': [
    ['semantic-flow', 'demo'],
    ['semantic-flow', 'demo', 'full-video'],
  ],
  'adaptive-maximo-workbench': [
    ['work-orders', 'asset-context'],
    ['work-order-demo', 'asset-context', 'safe-actions'],
  ],
  'lifecycle-messaging-platform': [
    ['product-surfaces', 'backend-runtime', 'delivery-ops', 'delivery-flow', 'digital-twin'],
  ],
  'mobile-smm-platform': [
    ['media-gallery', 'schedule', 'queue', 'ui-change-demo', 'approval-log', 'local-demo'],
  ],
});

function loadBlocks(project, locale) {
  const markdown = readFileSync(path.join(CONTENT_ROOT, project, `${locale}.md`), 'utf8');
  return parsePortfolioArticleBlocks(markdown).filter(({ id }) => id);
}

test('platform article targets keep locale parity and narration-friendly document order', () => {
  for (const [project, expectedOrder] of Object.entries(EXPECTED_ORDER)) {
    for (const locale of LOCALES) {
      assert.deepEqual(
        loadBlocks(project, locale).map(({ id }) => id),
        expectedOrder,
        `${project}:${locale}`,
      );
    }
  }
});

test('affected cue target sequences never move backward through their articles', () => {
  for (const [project, sequences] of Object.entries(AFFECTED_CUE_SEQUENCES)) {
    for (const locale of LOCALES) {
      const positions = new Map(loadBlocks(project, locale).map(({ id }, index) => [id, index]));
      for (const sequence of sequences) {
        const cuePositions = sequence.map(id => positions.get(id));
        assert.ok(cuePositions.every(Number.isInteger), `${project}:${locale}:${sequence.join(' -> ')}`);
        assert.deepEqual(
          cuePositions,
          [...cuePositions].sort((left, right) => left - right),
          `${project}:${locale}:${sequence.join(' -> ')}`,
        );
      }
    }
  }
});

test('supported platform cues resolve to distinct non-empty topic-relevant blocks', () => {
  for (const [project, topics] of Object.entries(RELEVANCE)) {
    for (const locale of LOCALES) {
      const parsedBlocks = loadBlocks(project, locale);
      const blocks = new Map(parsedBlocks.map(block => [block.id, block.markdown]));
      const allBodies = parsedBlocks.map(({ markdown }) => markdown);
      assert.ok(allBodies.every(Boolean), `${project}:${locale}: all targets non-empty`);
      assert.equal(
        new Set(allBodies).size,
        allBodies.length,
        `${project}:${locale}: all targets distinct`,
      );
      const supportedBodies = [];
      for (const [id, topicPattern] of Object.entries(topics)) {
        const body = blocks.get(id);
        assert.ok(body, `${project}:${locale}:${id}: non-empty`);
        assert.match(body, topicPattern, `${project}:${locale}:${id}: relevant`);
        supportedBodies.push(body);
      }
      assert.equal(
        new Set(supportedBodies).size,
        supportedBodies.length,
        `${project}:${locale}: distinct supported targets`,
      );
    }
  }
});
