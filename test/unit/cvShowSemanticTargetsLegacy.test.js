import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

import { parsePortfolioArticleBlocks } from '../../src/static-pages/data/portfolioArticleMedia.js';

const LOCALES = ['ru', 'en', 'es'];

const EXPECTATIONS = {
  'agent-pool-mcp': {
    ids: ['execution-flow', 'execution-runtime', 'work-branch', 'review-branch', 'result'],
    order: [['execution-runtime', 'work-branch', 'review-branch', 'result']],
    relevant: {
      'execution-flow': [/делег|задач/i, /delegat|CLI agents/i, /deleg|agentes CLI/i],
      'execution-runtime': [/состояни|сесси|маршрут/i, /process state|handoff|rout/i, /estado|handoff|sesion/i],
      'work-branch': [/воркер|пайплайн|реализац/i, /worker|pipeline|implementation/i, /worker|pipeline|implementación/i],
      'review-branch': [/консенсус|валидац|проверк/i, /consensus|validation|review/i, /consenso|validación|revisión/i],
      result: [/практический смысл|модел/i, /practical goal|model attention/i, /objetivo práctico|atención/i],
    },
  },
  'project-graph-mcp': {
    ids: ['repository-root', 'graph-example', 'compact-skeleton', 'browser-fact', 'readonly-node', 'focus-zone'],
    order: [
      ['graph-example', 'browser-fact', 'readonly-node'],
      ['repository-root', 'compact-skeleton', 'browser-fact', 'focus-zone'],
    ],
    relevant: {
      'repository-root': [/репозитор|кодовой базе/i, /repository|codebase/i, /repositorio|codebase/i],
      'graph-example': [/граф|зависимост/i, /graph|dependenc/i, /grafo|dependenc/i],
      'compact-skeleton': [/скелет/i, /skeleton/i, /skeleton/i],
      'browser-fact': [/(?=.*релевантн.*част)(?=.*браузер)/is, /(?=.*relevant part)(?=.*browser)/is, /(?=.*parte relevante)(?=.*navegador)/is],
      'readonly-node': [/проверяем.*факт/i, /verifiable fact/i, /hechos verificables/i],
      'focus-zone': [/сильн.*модел|сжатыми данными/i, /stronger model|distilled data/i, /modelo más fuerte|datos destilados/i],
    },
  },
  'f360-studio': {
    ids: ['production-path', 'gallery-result', 'gallery-result-one', 'gallery-result-two'],
    order: [
      ['production-path', 'gallery-result'],
      ['production-path', 'gallery-result-one', 'gallery-result-two'],
    ],
    relevant: {
      'production-path': [/планирован|съём|процесс/i, /capture planning|production pipeline|scanning setup/i, /planificación|pipeline|equipo físico/i],
      'gallery-result': [/презентац|готов/i, /presentation|finished model/i, /presentación|modelos terminados/i],
      'gallery-result-one': [/YouTube|Sketchfab/i, /YouTube|Sketchfab/i, /YouTube|Sketchfab/i],
      'gallery-result-two': [/закры|невозможно/i, /closed|not feasible/i, /cerrar|no era viable/i],
    },
  },
  'autobox-v1': {
    ids: ['working-system', 'buddha-render', 'render-gallery', 'netsuke-video', 'benin-bronze'],
    order: [
      ['buddha-render', 'render-gallery', 'netsuke-video'],
      ['working-system', 'netsuke-video', 'benin-bronze'],
    ],
    relevant: {
      'working-system': [/компьютерн.*зрен|резкост|отбира/i, /computer vision|sharpness|select/i, /visión (?:por computador|artificial)|nitidez|seleccion/i],
      'buddha-render': [/Будд/i, /Buddha/i, /Buda/i],
      'render-gallery': [/сери.*кадр|фотограмметр/i, /series.*(?:frames|photographs)|photogrammetr/i, /serie.*(?:fotografías|imágenes)|fotogrametr/i],
      'netsuke-video': [/Эрмитаж|нэцкэ/i, /Hermitage|netsuke/i, /Hermitage|netsuke/i],
      'benin-bronze': [/бенинск.*бронз|Кунсткамер/i, /Benin bronze|Kunstkamera/i, /bronce de Benín|Kunstkamera/i],
    },
  },
  complexscan: {
    ids: ['transparent-platform', 'controlled-light', 'product-gallery', 'international-delivery'],
    order: [['transparent-platform', 'controlled-light', 'product-gallery', 'international-delivery']],
    relevant: {
      'transparent-platform': [/прозрачн.*диск|платформ/i, /transparent.*(?:disc|platform)/i, /(?:disco|plataforma).*transparent/i],
      'controlled-light': [/контролируем.*свет|свет.*снизу/i, /controlled light|lighting.*below/i, /luz controlad|iluminación.*abajo/i],
      'product-gallery': [/прототип|перв.*издел/i, /prototypes|early units/i, /prototipos|primeras unidades/i],
      'international-delivery': [/экспорт|доставк/i, /export|deliveries/i, /exportación|entregas/i],
    },
  },
  photopizza: {
    ids: [
      'megavisor-origin',
      'mechanics',
      'controller',
      'controller-attribution',
      'controller-media',
      'assembly-calibration',
    ],
    order: [
      ['megavisor-origin', 'mechanics', 'controller'],
      ['megavisor-origin', 'controller-attribution', 'controller-media', 'assembly-calibration'],
    ],
    relevant: {
      'megavisor-origin': [/MEGAVISOR/i, /MEGAVISOR/i, /MEGAVISOR/i],
      mechanics: [/поворотн.*стол|прототип/i, /turntable prototype|prototype.*turntable/i, /prototipo.*plataforma giratoria/i],
      controller: [/контроллер управлял/i, /controller drove/i, /controlador movía/i],
      'controller-attribution': [/привлеч.*специалист/i, /contracted specialist/i, /especialista contratado/i],
      'controller-media': [/JavaScript|Espruino/i, /JavaScript|Espruino/i, /JavaScript|Espruino/i],
      'assembly-calibration': [/сборк.*калибров/i, /assembly.*calibration/i, /montaje.*calibración/i],
    },
  },
};

async function loadBlocks(project, locale) {
  const markdown = await readFile(new URL(
    `../../src/static-pages/copy-content/projects/${project}/${locale}.md`,
    import.meta.url,
  ), 'utf8');
  return parsePortfolioArticleBlocks(markdown).filter(({ id }) => id);
}

test('legacy project cues have distinct semantic targets with locale-parity and forward narration order', async () => {
  for (const [project, expectation] of Object.entries(EXPECTATIONS)) {
    const localeBlocks = await Promise.all(LOCALES.map((locale) => loadBlocks(project, locale)));
    const expectedMarkerOrder = localeBlocks[0].map(({ id }) => id);

    for (const [localeIndex, blocks] of localeBlocks.entries()) {
      const locale = LOCALES[localeIndex];
      const byId = new Map(blocks.map((block) => [block.id, block.markdown]));
      const positions = new Map(blocks.map((block, index) => [block.id, index]));

      assert.deepEqual(
        blocks.map(({ id }) => id),
        expectedMarkerOrder,
        `${project}/${locale} marker order must match ru`,
      );

      const targetBodies = expectation.ids.map((id) => {
        const body = byId.get(id);
        assert.ok(body, `${project}/${locale} ${id} must attach to a non-empty block`);
        assert.match(body, expectation.relevant[id][localeIndex], `${project}/${locale} ${id} must match its narrated subject`);
        return body;
      });
      assert.equal(
        new Set(targetBodies).size,
        targetBodies.length,
        `${project}/${locale} affected cue targets must be distinct`,
      );

      for (const sequence of expectation.order) {
        const indexes = sequence.map((id) => positions.get(id));
        assert.deepEqual(
          indexes,
          [...indexes].sort((a, b) => a - b),
          `${project}/${locale} must scroll forward through ${sequence.join(' -> ')}`,
        );
      }
    }
  }
});
