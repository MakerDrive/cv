import { PORTFOLIO_PROJECT_IDS } from './portfolioProjectIds.js';

const canonicalProjectIdSet = new Set(PORTFOLIO_PROJECT_IDS);
const TIMEZONE_TIMESTAMP_PATTERN = new RegExp(
  '^(\\d{4})-(\\d{2})-(\\d{2})T(\\d{2}):(\\d{2}):(\\d{2})'
    + '(?:\\.\\d+)?(?:Z|[+-](\\d{2}):?(\\d{2}))$',
);

function isPlainObject(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return false;
  }
  let prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function isValidTimezoneTimestamp(value) {
  if (typeof value !== 'string') {
    return false;
  }
  let match = TIMEZONE_TIMESTAMP_PATTERN.exec(value);
  if (!match || !Number.isFinite(Date.parse(value))) {
    return false;
  }

  let year = Number(match[1]);
  let month = Number(match[2]);
  let day = Number(match[3]);
  let hour = Number(match[4]);
  let minute = Number(match[5]);
  let second = Number(match[6]);
  let offsetHour = match[7] === undefined ? 0 : Number(match[7]);
  let offsetMinute = match[8] === undefined ? 0 : Number(match[8]);
  let isLeapYear = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
  let daysByMonth = [31, isLeapYear ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

  return month >= 1
    && month <= 12
    && day >= 1
    && day <= daysByMonth[month - 1]
    && hour <= 23
    && minute <= 59
    && second <= 59
    && offsetHour <= 23
    && offsetMinute <= 59;
}

function isValidHttpsUrl(value) {
  if (typeof value !== 'string') return false;
  try {
    let url = new URL(value);
    return url.protocol === 'https:' && Boolean(url.hostname);
  } catch {
    return false;
  }
}

export const PUBLICATIONS = [
  {
    "id": "pulse/agent-portal-retrospective",
    "slug": "agent-portal-retrospective",
    "kind": "retrospective",
    "status": "published",
    "publishedAt": null,
    "updatedAt": null,
    "subjectPeriod": "2025-2026",
    "relatedProjectIds": [
      "projects/agent-portal"
    ],
    "primaryProjectId": "projects/agent-portal",
    "tags": [],
    "sourceLinks": [
      { "href": "https://rnd-pro.com/projects/agent-portal/", "label": "rnd-pro.com" }
    ],
    "locales": {
      "en": {
        "title": "Agent Portal: Shared Runtime and Versioned Control Plane",
        "summary": "A detached backend connects IDE clients to shared MCP processes, while versioned StateGraph operations provide patches, snapshots, and task evidence."
      },
      "ru": {
        "title": "Agent Portal: общий runtime и версионированный control plane",
        "summary": "Detached backend соединяет IDE-клиенты с общими MCP-процессами, а StateGraph передаёт версионированные patches, snapshots и факты о задачах."
      },
      "es": {
        "title": "Agent Portal: runtime compartido y plano de control versionado",
        "summary": "Un backend desacoplado conecta clientes IDE con procesos MCP compartidos, mientras StateGraph entrega patches, snapshots y evidencia de tareas versionados."
      }
    }
  },
  {
    "id": "pulse/symbiote-video-studio-retrospective",
    "slug": "symbiote-video-studio-retrospective",
    "kind": "retrospective",
    "status": "published",
    "publishedAt": null,
    "updatedAt": null,
    "subjectPeriod": "2025-2026",
    "relatedProjectIds": [
      "projects/symbiote-video-studio"
    ],
    "primaryProjectId": "projects/symbiote-video-studio",
    "tags": [],
    "sourceLinks": [
      { "href": "https://rnd-pro.com/projects/svs/", "label": "rnd-pro.com" }
    ],
    "locales": {
      "en": {
        "title": "Symbiote Video Studio: Graph-Based Media Workflows",
        "summary": "A serializable media graph, typed timeline, plugin packs, and frame manifests connect graph, timeline, provider, and render contracts."
      },
      "ru": {
        "title": "Symbiote Video Studio: графовые медиа-процессы",
        "summary": "Сериализуемый медиаграф, типизированный таймлайн, пакеты плагинов и манифесты кадров связывают контракты графа, таймлайна, провайдеров и рендера."
      },
      "es": {
        "title": "Symbiote Video Studio: workflows multimedia basados en grafos",
        "summary": "Un grafo multimedia serializable, un timeline tipado, packs de plugins y manifiestos de fotogramas conectan contratos de grafo, timeline, proveedores y render."
      }
    }
  },
  {
    "id": "pulse/autobox-v1-retrospective",
    "slug": "autobox-v1-retrospective",
    "kind": "retrospective",
    "status": "published",
    "publishedAt": null,
    "updatedAt": null,
    "subjectPeriod": "2019-2021",
    "relatedProjectIds": [
      "projects/autobox-v1"
    ],
    "primaryProjectId": "projects/autobox-v1",
    "tags": [],
    "sourceLinks": [
      { "href": "https://rnd-pro.com/pulse/autobox-v1/", "label": "rnd-pro.com" }
    ],
    "locales": {
      "en": {
        "title": "AUTOBOX v1: A Repeatable Museum-Scanning Process",
        "summary": "AUTOBOX v1 combines equipment, light, capture protocol, and production process for cultural-heritage digitization."
      },
      "ru": {
        "title": "AUTOBOX v1: повторяемый процесс музейного сканирования",
        "summary": "AUTOBOX v1 объединяет оборудование, свет, протокол съёмки и рабочий процесс для оцифровки культурного наследия."
      },
      "es": {
        "title": "AUTOBOX v1: un proceso repetible de escaneo museístico",
        "summary": "AUTOBOX v1 combina equipo, iluminación, protocolo de captura y proceso de producción para digitalización patrimonial."
      }
    }
  },
  {
    "id": "pulse/f360-studio-retrospective",
    "slug": "f360-studio-retrospective",
    "kind": "retrospective",
    "status": "published",
    "publishedAt": null,
    "updatedAt": null,
    "subjectPeriod": "2021-2022",
    "relatedProjectIds": [
      "projects/f360-studio"
    ],
    "primaryProjectId": "projects/f360-studio",
    "tags": [],
    "sourceLinks": [
      { "href": "https://sketchfab.com/F360-Studio", "label": "sketchfab.com" }
    ],
    "locales": {
      "en": {
        "title": "F360 Studio: Museum Capture Discipline in Commercial Photogrammetry",
        "summary": "Capture planning and controlled lighting connect source photography to geometry, textures, and presentation in a commercial 3D workflow."
      },
      "ru": {
        "title": "F360 Studio: музейная дисциплина съёмки в коммерческой фотограмметрии",
        "summary": "Планирование съёмки и управляемый свет связывают исходные фотографии с геометрией, текстурами и презентацией в коммерческом 3D-процессе."
      },
      "es": {
        "title": "F360 Studio: disciplina de captura museística en fotogrametría comercial",
        "summary": "La planificación de captura y la iluminación controlada conectan las fotos fuente con geometría, texturas y presentación en un flujo 3D comercial."
      }
    }
  },
  {
    "id": "pulse/complexscan-retrospective",
    "slug": "complexscan-retrospective",
    "kind": "retrospective",
    "status": "published",
    "publishedAt": null,
    "updatedAt": null,
    "subjectPeriod": "2017-2022",
    "relatedProjectIds": [
      "projects/complexscan"
    ],
    "primaryProjectId": "projects/complexscan",
    "tags": [],
    "sourceLinks": [
      { "href": "https://rnd-pro.com/pulse/complex-scan/", "label": "rnd-pro.com" }
    ],
    "locales": {
      "en": {
        "title": "ComplexScan: From Open Hardware to a Commercial Capture System",
        "summary": "A transparent turntable, controlled lighting, and a full-cycle equipment line extended the PhotoPizza work into commercial 3D capture."
      },
      "ru": {
        "title": "ComplexScan: от open hardware к коммерческой системе съёмки",
        "summary": "Прозрачный поворотный стол, управляемый свет и полный цикл оборудования продолжили линию PhotoPizza в коммерческой 3D-съёмке."
      },
      "es": {
        "title": "ComplexScan: de open hardware a un sistema comercial de captura",
        "summary": "Una plataforma transparente, iluminación controlada y una línea completa de equipos extendieron PhotoPizza hacia la captura 3D comercial."
      }
    }
  },
  {
    "id": "pulse/boothbot-retrospective",
    "slug": "boothbot-retrospective",
    "kind": "retrospective",
    "status": "published",
    "publishedAt": null,
    "updatedAt": null,
    "subjectPeriod": "2018",
    "relatedProjectIds": [
      "projects/boothbot"
    ],
    "primaryProjectId": "projects/boothbot",
    "tags": [],
    "sourceLinks": [
      { "href": "https://rnd-pro.com/projects/boothbot/", "label": "rnd-pro.com" }
    ],
    "locales": {
      "en": {
        "title": "BoothBot: Warehouse Capture as an Automated Process",
        "summary": "Camera, lighting, turntable control, and processing formed a repeatable wine-bottle catalog workflow inside a customer warehouse."
      },
      "ru": {
        "title": "BoothBot: автоматизация предметной съёмки на складе",
        "summary": "Камера, свет, управление поворотным столом и обработка образовали повторяемый процесс каталожной съёмки винных бутылок на складе заказчика."
      },
      "es": {
        "title": "BoothBot: captura de almacén como proceso automatizado",
        "summary": "Cámara, iluminación, control de plataforma y procesamiento formaron un flujo repetible para catalogar botellas de vino en el almacén del cliente."
      }
    }
  },
  {
    "id": "pulse/photopizza-retrospective",
    "slug": "photopizza-retrospective",
    "kind": "retrospective",
    "status": "published",
    "publishedAt": null,
    "updatedAt": null,
    "subjectPeriod": "2010-2022",
    "relatedProjectIds": [
      "projects/photopizza"
    ],
    "primaryProjectId": "projects/photopizza",
    "tags": [],
    "sourceLinks": [
      { "href": "https://rnd-pro.com/projects/photopizza/", "label": "rnd-pro.com" }
    ],
    "locales": {
      "en": {
        "title": "PhotoPizza: From MEGAVISOR Prototype to Open-Source Platform",
        "summary": "PhotoPizza grew from a hardware line born inside MEGAVISOR into an open-source platform for capture and scanning experiments."
      },
      "ru": {
        "title": "PhotoPizza: от прототипа MEGAVISOR к open-source платформе",
        "summary": "PhotoPizza выросла из аппаратной линии внутри MEGAVISOR в open-source платформу для съёмки и сканирования."
      },
      "es": {
        "title": "PhotoPizza: del prototipo de MEGAVISOR a una plataforma open-source",
        "summary": "PhotoPizza creció de una línea de hardware nacida dentro de MEGAVISOR a una plataforma open-source para captura y escaneo."
      }
    }
  },
  {
    "id": "pulse/megavisor-retrospective",
    "slug": "megavisor-retrospective",
    "kind": "retrospective",
    "status": "published",
    "publishedAt": null,
    "updatedAt": null,
    "subjectPeriod": "2010-2014",
    "relatedProjectIds": [
      "projects/megavisor"
    ],
    "primaryProjectId": "projects/megavisor",
    "tags": [],
    "sourceLinks": [
      { "href": "https://rnd-pro.com/projects/megavisor/", "label": "rnd-pro.com" }
    ],
    "locales": {
      "en": {
        "title": "MEGAVISOR: Capture R&D as a Product Line",
        "summary": "Photo-360 equipment, spherical 3D panoramas, the Gate9 studio, controller specifications, and field production established the capture-automation line."
      },
      "ru": {
        "title": "MEGAVISOR: съёмочная R&D как продуктовая линия",
        "summary": "Оборудование для фото-360, сферические 3D-панорамы, студия Gate9, спецификации контроллеров и выездное производство сформировали линию автоматизации съёмки."
      },
      "es": {
        "title": "MEGAVISOR: I+D de captura como línea de producto",
        "summary": "El equipo foto-360, los panoramas 3D esféricos, el estudio Gate9, las especificaciones de control y la producción en campo establecieron la línea de automatización de captura."
      }
    }
  },
  {
    "id": "pulse/mcp-agent-portal-retrospective",
    "slug": "mcp-agent-portal-retrospective",
    "kind": "retrospective",
    "status": "published",
    "publishedAt": null,
    "updatedAt": null,
    "subjectPeriod": "2026",
    "relatedProjectIds": [
      "projects/agent-portal"
    ],
    "primaryProjectId": "projects/agent-portal",
    "tags": [],
    "sourceLinks": [
      { "href": "https://rnd-pro.com/projects/agent-portal/", "label": "rnd-pro.com" }
    ],
    "locales": {
      "en": {
        "title": "MCP Agent Portal: Public Gateway for Portal Tools",
        "summary": "A JavaScript MCP gateway exposes owned chat and orchestration tools while keeping raw Agent Pool operations inside the product runtime."
      },
      "ru": {
        "title": "MCP Agent Portal: публичный шлюз инструментов портала",
        "summary": "JavaScript MCP-шлюз открывает собственные инструменты чатов и оркестрации, сохраняя низкоуровневые операции Agent Pool внутри runtime продукта."
      },
      "es": {
        "title": "MCP Agent Portal: gateway público para herramientas del portal",
        "summary": "Un gateway MCP en JavaScript expone herramientas propias de chat y orquestación, mientras las operaciones de Agent Pool permanecen dentro del runtime."
      }
    }
  },
  {
    "id": "pulse/project-graph-mcp-retrospective",
    "slug": "project-graph-mcp-retrospective",
    "kind": "retrospective",
    "status": "published",
    "publishedAt": null,
    "updatedAt": null,
    "subjectPeriod": "2026",
    "relatedProjectIds": [
      "projects/project-graph-mcp"
    ],
    "primaryProjectId": "projects/project-graph-mcp",
    "tags": [],
    "sourceLinks": [
      { "href": "https://github.com/rnd-pro/project-graph-mcp", "label": "github.com" }
    ],
    "locales": {
      "en": {
        "title": "Project Graph MCP: Compact Codebase Context for Agents",
        "summary": "Vendored Acorn analysis, language-specific structural parsers, compact code, and `.ctx` contracts provide focused codebase context."
      },
      "ru": {
        "title": "Project Graph MCP: компактный контекст кодовой базы для агентов",
        "summary": "Vendored Acorn, структурные parsers для разных языков, compact code и `.ctx`-контракты формируют сфокусированный контекст кодовой базы."
      },
      "es": {
        "title": "Project Graph MCP: contexto compacto de codebase para agentes",
        "summary": "Acorn vendorizado, parsers estructurales por lenguaje, compact code y contratos `.ctx` forman un contexto focalizado de la codebase."
      }
    }
  },
  {
    "id": "pulse/agent-pool-mcp-retrospective",
    "slug": "agent-pool-mcp-retrospective",
    "kind": "retrospective",
    "status": "published",
    "publishedAt": null,
    "updatedAt": null,
    "subjectPeriod": "2026",
    "relatedProjectIds": [
      "projects/agent-pool-mcp"
    ],
    "primaryProjectId": "projects/agent-pool-mcp",
    "tags": [],
    "sourceLinks": [
      { "href": "https://github.com/rnd-pro/agent-pool-mcp", "label": "github.com" }
    ],
    "locales": {
      "en": {
        "title": "Agent Pool MCP: Delegation with Visible Ownership",
        "summary": "CLI delegation returns task IDs immediately, preserves process ownership and diagnostics, and supports pipelines plus scheduled work."
      },
      "ru": {
        "title": "Agent Pool MCP: делегирование с видимым владением",
        "summary": "CLI-делегирование сразу возвращает ID задачи, сохраняет владение процессом и диагностику, поддерживает pipelines и расписание."
      },
      "es": {
        "title": "Agent Pool MCP: delegación con ownership visible",
        "summary": "La delegación CLI devuelve IDs de tarea de inmediato, conserva ownership y diagnóstico del proceso, y admite pipelines y tareas programadas."
      }
    }
  },
  {
    "id": "pulse/browser-x-mcp-retrospective",
    "slug": "browser-x-mcp-retrospective",
    "kind": "retrospective",
    "status": "published",
    "publishedAt": null,
    "updatedAt": null,
    "subjectPeriod": "2025",
    "relatedProjectIds": [
      "projects/browser-x-mcp"
    ],
    "primaryProjectId": "projects/browser-x-mcp",
    "tags": [],
    "sourceLinks": [
      { "href": "https://github.com/rnd-pro/browser-x-mcp", "label": "github.com" }
    ],
    "locales": {
      "en": {
        "title": "Browser X MCP: Browser Automation as Agent Evidence",
        "summary": "A Playwright MCP prototype exposes DOM-derived virtual-canvas targets, browser actions, screenshots, and explicit page-state errors."
      },
      "ru": {
        "title": "Browser X MCP: браузерная автоматизация как доказательство для агентов",
        "summary": "Playwright MCP-прототип открывает DOM-derived virtual canvas, браузерные действия, screenshots и явные ошибки состояния страницы."
      },
      "es": {
        "title": "Browser X MCP: automatización del navegador como evidencia para agentes",
        "summary": "Un prototipo MCP con Playwright expone targets derivados del DOM, acciones de navegador, screenshots y errores explícitos del estado de página."
      }
    }
  },
  {
    "id": "pulse/context-x-mcp-retrospective",
    "slug": "context-x-mcp-retrospective",
    "kind": "retrospective",
    "status": "published",
    "publishedAt": null,
    "updatedAt": null,
    "subjectPeriod": "2025",
    "relatedProjectIds": [
      "projects/context-x-mcp"
    ],
    "primaryProjectId": "projects/context-x-mcp",
    "tags": [],
    "sourceLinks": [
      { "href": "https://github.com/rnd-pro/context-x-mcp", "label": "github.com" }
    ],
    "locales": {
      "en": {
        "title": "Context X MCP: An Early Context-Preparation Prototype",
        "summary": "The stdio prototype defined enrichment and history-search contracts; the implemented resolver later moved into the Agent Portal team-memory stack."
      },
      "ru": {
        "title": "Context X MCP: ранний прототип подготовки контекста",
        "summary": "Stdio-прототип задал контракты enrichment и поиска истории; реализованный resolver позднее вошёл в стек team memory для Agent Portal."
      },
      "es": {
        "title": "Context X MCP: prototipo temprano de preparación de contexto",
        "summary": "El prototipo stdio definió contratos de enriquecimiento y búsqueda histórica; el resolver implementado pasó después al stack de team memory de Agent Portal."
      }
    }
  },
  {
    "id": "pulse/terminal-x-mcp-retrospective",
    "slug": "terminal-x-mcp-retrospective",
    "kind": "retrospective",
    "status": "published",
    "publishedAt": null,
    "updatedAt": null,
    "subjectPeriod": "2025",
    "relatedProjectIds": [
      "projects/terminal-x-mcp"
    ],
    "primaryProjectId": "projects/terminal-x-mcp",
    "tags": [],
    "sourceLinks": [
      { "href": "https://github.com/rnd-pro/terminal-x-mcp", "label": "github.com" }
    ],
    "locales": {
      "en": {
        "title": "Terminal X MCP: An Early Tool-Contract Prototype",
        "summary": "The stdio prototype defined schemas for execution, monitoring, security assessment, and workflow planning, while its handlers remained placeholders."
      },
      "ru": {
        "title": "Terminal X MCP: ранний прототип контрактов инструментов",
        "summary": "Stdio-прототип задал схемы выполнения, мониторинга, оценки безопасности и планирования workflow, но его handlers остались placeholders."
      },
      "es": {
        "title": "Terminal X MCP: prototipo temprano de contratos de herramientas",
        "summary": "El prototipo stdio definió esquemas de ejecución, monitoreo, evaluación de seguridad y planificación, pero sus handlers quedaron como placeholders."
      }
    }
  },
  {
    "id": "pulse/symbiote-workspace-retrospective",
    "slug": "symbiote-workspace-retrospective",
    "kind": "retrospective",
    "status": "published",
    "publishedAt": null,
    "updatedAt": null,
    "subjectPeriod": "2026",
    "relatedProjectIds": [
      "projects/symbiote-workspace"
    ],
    "primaryProjectId": "projects/symbiote-workspace",
    "tags": [],
    "sourceLinks": [
      { "href": "https://github.com/rnd-pro/symbiote-workspace", "label": "github.com" }
    ],
    "locales": {
      "en": {
        "title": "Symbiote Workspace: Portable UI and Execution Configuration",
        "summary": "Portable JSON connects Symbiote UI and Engine through validated construction, revision-aware dispatch, strict sharing, and live patching."
      },
      "ru": {
        "title": "Symbiote Workspace: переносимая конфигурация UI и исполнения",
        "summary": "Переносимый JSON связывает Symbiote UI и Engine через проверяемую сборку, revision-aware dispatch, строгий обмен и live patching."
      },
      "es": {
        "title": "Symbiote Workspace: configuración portátil de UI y ejecución",
        "summary": "JSON portátil conecta Symbiote UI y Engine mediante construcción validada, dispatch con revisiones, intercambio estricto y live patching."
      }
    }
  },
  {
    "id": "pulse/symbiote-ui-retrospective",
    "slug": "symbiote-ui-retrospective",
    "kind": "retrospective",
    "status": "published",
    "publishedAt": null,
    "updatedAt": null,
    "subjectPeriod": "2026",
    "relatedProjectIds": [
      "projects/symbiote-ui"
    ],
    "primaryProjectId": "projects/symbiote-ui",
    "tags": [],
    "sourceLinks": [
      { "href": "https://github.com/rnd-pro/symbiote-ui", "label": "github.com" }
    ],
    "locales": {
      "en": {
        "title": "Symbiote UI: Discoverable Interface Contracts",
        "summary": "Web Components, provider metadata, schemas, themes, and reusable UI primitives form a host-neutral contract that agents can inspect."
      },
      "ru": {
        "title": "Symbiote UI: обнаруживаемые контракты интерфейсов",
        "summary": "Web Components, provider metadata, схемы, темы и переиспользуемые UI-примитивы образуют host-neutral контракт, доступный агентам."
      },
      "es": {
        "title": "Symbiote UI: contratos de interfaz detectables",
        "summary": "Web Components, metadata de providers, esquemas, temas y primitivas reutilizables forman un contrato host-neutral consultable por agentes."
      }
    }
  },
  {
    "id": "pulse/symbiote-node-retrospective",
    "slug": "symbiote-node-retrospective",
    "kind": "retrospective",
    "status": "published",
    "publishedAt": null,
    "updatedAt": null,
    "subjectPeriod": "2026",
    "relatedProjectIds": [
      "projects/symbiote-node"
    ],
    "primaryProjectId": "projects/symbiote-node",
    "tags": [],
    "sourceLinks": [
      { "href": "https://github.com/rnd-pro/symbiote-node", "label": "github.com" }
    ],
    "locales": {
      "en": {
        "title": "Symbiote Node: Migration Facade After the Package Split",
        "summary": "The remaining package is a migration facade that delegates public entry points to Symbiote UI and Engine after ownership was separated."
      },
      "ru": {
        "title": "Symbiote Node: миграционный фасад после разделения пакетов",
        "summary": "Оставшийся пакет служит как миграционный фасад и делегирует публичные entry points в Symbiote UI и Engine после разделения ответственности."
      },
      "es": {
        "title": "Symbiote Node: fachada de migración tras separar los paquetes",
        "summary": "El paquete restante funciona como fachada de migración y delega sus entry points públicos en Symbiote UI y Engine tras separar responsabilidades."
      }
    }
  },
  {
    "id": "pulse/symbiote-engine-retrospective",
    "slug": "symbiote-engine-retrospective",
    "kind": "retrospective",
    "status": "published",
    "publishedAt": null,
    "updatedAt": null,
    "subjectPeriod": "2026",
    "relatedProjectIds": [
      "projects/symbiote-engine"
    ],
    "primaryProjectId": "projects/symbiote-engine",
    "tags": [],
    "sourceLinks": [
      { "href": "https://github.com/rnd-pro/symbiote-engine", "label": "github.com" }
    ],
    "locales": {
      "en": {
        "title": "Symbiote Engine: Graph Execution Across Node and Browser",
        "summary": "Typed graph execution, driver packs, optional server transports, and a browser-safe entry point share one execution contract."
      },
      "ru": {
        "title": "Symbiote Engine: исполнение графов в Node и браузере",
        "summary": "Типизированное исполнение графов, driver packs, опциональные server transports и browser-safe entry point используют общий контракт."
      },
      "es": {
        "title": "Symbiote Engine: ejecución de grafos en Node y navegador",
        "summary": "La ejecución tipada de grafos, los driver packs, transports opcionales de servidor y un browser-safe entry point comparten contrato."
      }
    }
  },
  {
    "id": "pulse/photopizza-remote-retrospective",
    "slug": "photopizza-remote-retrospective",
    "kind": "retrospective",
    "status": "retired",
    "retirementTarget": "pulse/photopizza-remote-browser-hardware-control",
    "publishedAt": null,
    "updatedAt": null,
    "subjectPeriod": "2018-2019",
    "relatedProjectIds": [
      "projects/photopizza-remote"
    ],
    "primaryProjectId": "projects/photopizza-remote",
    "tags": [],
    "sourceLinks": [],
    "locales": {
      "en": {
        "title": "PhotoPizza Remote: Browser Control for Field Capture",
        "summary": "Browser-based PhotoPizza control makes field operation practical outside the lab."
      },
      "ru": {
        "title": "PhotoPizza Remote: браузерное управление для полевой съёмки",
        "summary": "Браузерное управление PhotoPizza делает эксплуатацию в поле практичной вне лаборатории."
      },
      "es": {
        "title": "PhotoPizza Remote: control en navegador para captura de campo",
        "summary": "El control de PhotoPizza en el navegador hace práctica la operación en campo fuera del laboratorio."
      }
    }
  },
  {
    "id": "pulse/photosnail-public-retrospective",
    "slug": "photosnail-public-retrospective",
    "kind": "retrospective",
    "status": "published",
    "publishedAt": null,
    "updatedAt": null,
    "subjectPeriod": "2016",
    "relatedProjectIds": [
      "projects/photosnail-public"
    ],
    "primaryProjectId": "projects/photosnail-public",
    "tags": [],
    "sourceLinks": [
      { "href": "https://github.com/PhotoSnail/public", "label": "github.com" }
    ],
    "locales": {
      "en": {
        "title": "PhotoSnail: Early Camera-Motion Experiments",
        "summary": "PhotoSnail preserves an early public experiment around camera motion, object-tracking ideas, and media presentation."
      },
      "ru": {
        "title": "PhotoSnail: ранние эксперименты с движением камеры",
        "summary": "PhotoSnail сохраняет ранний публичный эксперимент вокруг движения камеры, tracking-идей и медиа-презентации."
      },
      "es": {
        "title": "PhotoSnail: experimentos tempranos de movimiento de cámara",
        "summary": "PhotoSnail conserva un experimento público temprano alrededor de movimiento de cámara, ideas de tracking y presentación multimedia."
      }
    }
  },
  {
    "id": "pulse/lifecycle-messaging-platform-retrospective",
    "slug": "lifecycle-messaging-platform-retrospective",
    "kind": "retrospective",
    "status": "published",
    "publishedAt": null,
    "updatedAt": null,
    "subjectPeriod": "2022-2026",
    "relatedProjectIds": [
      "projects/lifecycle-messaging-platform"
    ],
    "primaryProjectId": "projects/lifecycle-messaging-platform",
    "tags": [],
    "sourceLinks": [],
    "locales": {
      "en": {
        "title": "Lifecycle Messaging: Product Architecture and GSM Delivery",
        "summary": "A confidential consent-based messaging platform combines Node.js APIs, PostgreSQL, WebSocket state, campaign workflows, and GSM modem delivery."
      },
      "ru": {
        "title": "Lifecycle Messaging: продуктовая архитектура и GSM-доставка",
        "summary": "Конфиденциальная платформа коммуникаций на основе согласий объединяет Node.js API, PostgreSQL, WebSocket state, кампании и доставку через GSM-модемы."
      },
      "es": {
        "title": "Lifecycle Messaging: arquitectura de producto y entrega GSM",
        "summary": "Una plataforma confidencial de comunicación con consentimiento combina API Node.js, PostgreSQL, estado WebSocket, campañas y entrega mediante módems GSM."
      }
    }
  }
,
  {
    "id": "pulse/agent-portal-t2-token-contract-migration",
    "slug": "agent-portal-t2-token-contract-migration",
    "kind": "release",
    "status": "retired",
    "retirementTarget": "pulse/symbiote-ui-tiered-cascade-token-architecture",
    "publishedAt": "2026-07-02T15:29:53Z",
    "updatedAt": null,
    "subjectPeriod": "2026",
    "relatedProjectIds": ["projects/agent-portal"],
    "primaryProjectId": "projects/agent-portal",
    "tags": [],
    "locales": {
      "en": { "title": "Migration to contract tokenization T2", "summary": "Translation of the routing and limit accounting system to standard T2 with isolated workflow states." },
      "ru": { "title": "Миграция на контракт токенизации T2", "summary": "Перевод системы маршрутизации и учета лимитов на стандарт T2 с изоляцией workflow-состояний." },
      "es": { "title": "Migración al contrato de tokenización T2", "summary": "Traducción del sistema de enrutamiento y contabilidad de límites al estándar T2 con aislamiento de los estados del flujo de trabajo." }
    },
    "sourceLinks": []
  },
  {
    "id": "pulse/agent-pool-mcp-transparent-task-diagnostics",
    "slug": "agent-pool-mcp-transparent-task-diagnostics",
    "kind": "release",
    "status": "published",
    "publishedAt": "2026-07-31T18:50:57Z",
    "updatedAt": null,
    "subjectPeriod": "2026",
    "relatedProjectIds": ["projects/agent-pool-mcp"],
    "primaryProjectId": "projects/agent-pool-mcp",
    "tags": [],
    "locales": {
      "en": { "title": "Bounded Task Diagnostics in Agent Pool", "summary": "A bounded stderr tail, provider rate-limit signals, live events, PID liveness, and exit results make delegated tasks inspectable." },
      "ru": { "title": "Ограниченная диагностика задач в Agent Pool", "summary": "Ограниченный stderr tail, сигнатуры rate limit, live events, liveness PID и exit results делают делегированные задачи наблюдаемыми." },
      "es": { "title": "Diagnóstico acotado de tareas en Agent Pool", "summary": "Una cola acotada de stderr, señales de rate limit, eventos, liveness del PID y resultados permiten inspeccionar tareas delegadas." }
    },
    "sourceLinks": [
      { "href": "https://github.com/rnd-pro/agent-pool-mcp", "label": "github.com" }
    ]
  },
  {
    "id": "pulse/project-graph-mcp-compact-code-mode-v1-5",
    "slug": "project-graph-mcp-compact-code-mode-v1-5",
    "kind": "release",
    "status": "published",
    "publishedAt": "2026-07-31T18:50:57Z",
    "updatedAt": null,
    "subjectPeriod": "2026",
    "relatedProjectIds": ["projects/project-graph-mcp"],
    "primaryProjectId": "projects/project-graph-mcp",
    "tags": [],
    "locales": {
      "en": { "title": "Compact Code Mode with External Context Contracts", "summary": "Project Graph MCP preserves identifiers in compact JavaScript and validates `.ctx` documentation against exported functions and signatures." },
      "ru": { "title": "Compact Code Mode с внешними контрактами контекста", "summary": "Project Graph MCP сохраняет идентификаторы в compact JavaScript и сверяет `.ctx`-документацию с экспортами и сигнатурами." },
      "es": { "title": "Compact Code Mode con contratos de contexto externos", "summary": "Project Graph MCP conserva identificadores en JavaScript compacto y valida la documentación `.ctx` contra funciones exportadas y firmas." }
    },
    "sourceLinks": [
      { "href": "https://github.com/rnd-pro/project-graph-mcp", "label": "github.com" }
    ]
  },
  {
    "id": "pulse/terminal-x-mcp-terminal-x-mcp-initial-architecture",
    "slug": "terminal-x-mcp-terminal-x-mcp-initial-architecture",
    "kind": "release",
    "status": "retired",
    "retirementTarget": "pulse/terminal-x-mcp-retrospective",
    "publishedAt": "2025-07-20T11:31:02Z",
    "updatedAt": null,
    "subjectPeriod": "2025",
    "relatedProjectIds": ["projects/terminal-x-mcp"],
    "primaryProjectId": "projects/terminal-x-mcp",
    "tags": [],
    "locales": {
      "en": { "title": "Initialization of the terminal multi-agent architecture", "summary": "Basic release of the messaging protocol with support for isolated execution environments." },
      "ru": { "title": "Инициализация мультиагентной архитектуры терминала", "summary": "Базовый релиз протокола обмена сообщениями с поддержкой изолированных сред исполнения." },
      "es": { "title": "Inicialización de la arquitectura multiagente del terminal", "summary": "Lanzamiento básico del protocolo de intercambio de mensajes con soporte para entornos de ejecución aislados." }
    },
    "sourceLinks": []
  },
  {
    "id": "pulse/symbiote-engine-deterministic-graph-execution",
    "slug": "symbiote-engine-deterministic-graph-execution",
    "kind": "release",
    "status": "retired",
    "retirementTarget": "pulse/symbiote-engine-retrospective",
    "publishedAt": "2026-07-09T12:00:00Z",
    "updatedAt": null,
    "subjectPeriod": "2026",
    "relatedProjectIds": ["projects/symbiote-engine"],
    "primaryProjectId": "projects/symbiote-engine",
    "tags": [],
    "locales": {
      "en": { "title": "Deterministic graph execution and state propagation", "summary": "Implementation of deterministic DAG graph execution with topological sorting and strict cache-key isolation." },
      "ru": { "title": "Детерминированное выполнение графов и распространение состояния", "summary": "Внедрен механизм детерминированного выполнения DAG-графов с топологической сортировкой и изоляцией кэш-ключей." },
      "es": { "title": "Ejecución de grafos determinista y propagación de estado", "summary": "Implementación de ejecución determinista de grafos DAG con ordenación topológica y estricto aislamiento de claves de caché." }
    },
    "sourceLinks": []
  },
  {
    "id": "pulse/symbiote-ui-tiered-cascade-token-architecture",
    "slug": "symbiote-ui-tiered-cascade-token-architecture",
    "kind": "release",
    "status": "published",
    "publishedAt": "2026-07-31T18:50:57Z",
    "updatedAt": null,
    "subjectPeriod": "2026",
    "relatedProjectIds": ["projects/symbiote-ui"],
    "primaryProjectId": "projects/symbiote-ui",
    "tags": [],
    "locales": {
      "en": { "title": "Tiered Cascade Theme Tokens", "summary": "T0-T3 token tiers enforce source, reference, system, and component alias direction; Symbiote UI owns the T2 system roles." },
      "ru": { "title": "Уровни токенов Cascade Theme", "summary": "Уровни T0-T3 задают направление алиасов от source к reference, system и component; системные роли T2 принадлежат Symbiote UI." },
      "es": { "title": "Niveles de tokens de Cascade Theme", "summary": "Los niveles T0-T3 fijan la dirección de alias entre source, reference, system y component; Symbiote UI posee los roles T2." }
    },
    "sourceLinks": [
      { "href": "https://github.com/rnd-pro/symbiote-ui", "label": "github.com" }
    ]
  },
  {
    "id": "pulse/browser-x-mcp-browser-x-mcp-v1-beta",
    "slug": "browser-x-mcp-browser-x-mcp-v1-beta",
    "kind": "release",
    "status": "published",
    "publishedAt": "2026-07-31T18:50:57Z",
    "updatedAt": null,
    "subjectPeriod": "2025",
    "relatedProjectIds": ["projects/browser-x-mcp"],
    "primaryProjectId": "projects/browser-x-mcp",
    "tags": [],
    "locales": {
      "en": { "title": "Browser X MCP 1.0.0-beta.1", "summary": "The first public Playwright stdio server exposes browser actions and a DOM-derived virtual canvas with target IDs and coordinates." },
      "ru": { "title": "Browser X MCP 1.0.0-beta.1", "summary": "Первый публичный Playwright stdio-сервер открывает browser actions и DOM-derived virtual canvas с ID целей и координатами." },
      "es": { "title": "Browser X MCP 1.0.0-beta.1", "summary": "El primer servidor público Playwright sobre stdio expone acciones de navegador y un virtual canvas derivado del DOM con IDs y coordenadas." }
    },
    "sourceLinks": [
      { "href": "https://github.com/rnd-pro/browser-x-mcp", "label": "github.com" }
    ]
  },
  {
    "id": "pulse/context-x-mcp-context-x-mcp-initial",
    "slug": "context-x-mcp-context-x-mcp-initial",
    "kind": "release",
    "status": "retired",
    "retirementTarget": "pulse/context-x-mcp-retrospective",
    "publishedAt": "2025-08-19T12:00:00Z",
    "updatedAt": null,
    "subjectPeriod": "2025",
    "relatedProjectIds": ["projects/context-x-mcp"],
    "primaryProjectId": "projects/context-x-mcp",
    "tags": [],
    "locales": {
      "en": { "title": "Implementation of Context[X]MCP for multi-agent systems", "summary": "Launching the MCP provider for coordination and isolation of context between independent processes." },
      "ru": { "title": "Реализация Context[X]MCP для мультиагентных систем", "summary": "Запуск MCP-провайдера для координации и изоляции контекста между независимыми процессами." },
      "es": { "title": "Implementación de Context[X]MCP para sistemas multiagente", "summary": "Lanzamiento del proveedor MCP para la coordinación y aislamiento del contexto entre procesos independientes." }
    },
    "sourceLinks": []
  },
  {
    "id": "pulse/symbiote-node-symbiote-monorepo-decomposition",
    "slug": "symbiote-node-symbiote-monorepo-decomposition",
    "kind": "release",
    "status": "retired",
    "retirementTarget": "pulse/symbiote-node-retrospective",
    "publishedAt": "2026-06-25T12:00:00Z",
    "updatedAt": null,
    "subjectPeriod": "2026",
    "relatedProjectIds": ["projects/symbiote-node"],
    "primaryProjectId": "projects/symbiote-node",
    "tags": [],
    "locales": {
      "en": { "title": "Architectural decomposition of Symbiote", "summary": "Isolation of symbiote-ui and symbiote-engine into independent workspace packages." },
      "ru": { "title": "Архитектурная декомпозиция Symbiote", "summary": "Выделение symbiote-ui и symbiote-engine в независимые workspace-пакеты." },
      "es": { "title": "Descomposición arquitectónica de Symbiote", "summary": "Destacar symbiote-ui y symbiote-engine como paquetes de workspace independientes." }
    },
    "sourceLinks": []
  },
  {
    "id": "pulse/symbiote-workspace-workspace-presentation-journey-v1",
    "slug": "symbiote-workspace-workspace-presentation-journey-v1",
    "kind": "release",
    "status": "published",
    "publishedAt": "2026-07-31T18:50:57Z",
    "updatedAt": null,
    "subjectPeriod": "2026",
    "relatedProjectIds": ["projects/symbiote-workspace"],
    "primaryProjectId": "projects/symbiote-workspace",
    "tags": [],
    "locales": {
      "en": { "title": "Recorded Execution Timelines for Presentation", "summary": "`workspace-presentation-journey-v1` maps observed source time to presentation time while preserving event provenance and completion evidence." },
      "ru": { "title": "Записанные таймлайны исполнения для презентации", "summary": "`workspace-presentation-journey-v1` связывает наблюдаемое source time с presentation time, сохраняя происхождение событий и доказательство завершения." },
      "es": { "title": "Timelines de ejecución grabados para presentación", "summary": "`workspace-presentation-journey-v1` vincula el tiempo observado con el de presentación y conserva procedencia y evidencia de finalización." }
    },
    "sourceLinks": [
      { "href": "https://github.com/rnd-pro/symbiote-workspace", "label": "github.com" }
    ]
  },
  {
    "id": "pulse/photopizza-remote-photopizza-remote-android-release",
    "slug": "photopizza-remote-photopizza-remote-android-release",
    "kind": "release",
    "status": "published",
    "publishedAt": "2026-07-31T18:50:57Z",
    "updatedAt": null,
    "subjectPeriod": "2025",
    "relatedProjectIds": ["projects/photopizza-remote"],
    "primaryProjectId": "projects/photopizza-remote",
    "tags": [],
    "locales": {
      "en": { "title": "Release of PhotoPizza Remote for Android", "summary": "Native Android client for managing the PhotoPizza hardware platform." },
      "ru": { "title": "Релиз PhotoPizza Remote для Android", "summary": "Нативный Android-клиент для управления аппаратной платформой PhotoPizza." },
      "es": { "title": "Lanzamiento de PhotoPizza Remote para Android", "summary": "Cliente nativo de Android para gestionar la plataforma de hardware PhotoPizza." }
    },
    "sourceLinks": [
      { "href": "https://github.com/PhotoPizza/remote", "label": "github.com" }
    ]
  }
,
  {
    "id": "pulse/photopizza-3d-scanning-support",
    "slug": "photopizza-3d-scanning-support",
    "kind": "release",
    "status": "retired",
    "retirementTarget": "pulse/photopizza-retrospective",
    "publishedAt": "2025-03-14T19:26:14Z",
    "updatedAt": null,
    "subjectPeriod": "2025",
    "relatedProjectIds": ["projects/photopizza"],
    "primaryProjectId": "projects/photopizza",
    "tags": [],
    "locales": {
      "en": { "title": "Integration of 3D scanning processes", "summary": "Enhancing the capabilities of PhotoPizza-DIY for photogrammetry and 3D archiving tasks." },
      "ru": { "title": "Интеграция процессов 3D-сканирования", "summary": "Расширение возможностей PhotoPizza-DIY для задач фотограмметрии и 3D-архивации." },
      "es": { "title": "Integración de procesos de escaneo 3D", "summary": "Ampliación de las capacidades de PhotoPizza-DIY para tareas de fotogrametría y archivo 3D." }
    },
    "sourceLinks": []
  },
  {
    "id": "pulse/symbiote-video-studio-live-ui-render",
    "slug": "symbiote-video-studio-live-ui-render",
    "kind": "release",
    "status": "published",
    "publishedAt": "2026-07-31T18:50:57Z",
    "updatedAt": null,
    "subjectPeriod": "2026",
    "relatedProjectIds": ["projects/symbiote-video-studio"],
    "primaryProjectId": "projects/symbiote-video-studio",
    "tags": [],
    "locales": {
      "en": { "title": "Live Browser Capture in Symbiote Video Studio", "summary": "A render manifest drives browser capture through Symbiote Engine, while the Studio derives duration from an accepted cue timeline." },
      "ru": { "title": "Live browser capture в Symbiote Video Studio", "summary": "Манифест рендера управляет browser capture через Symbiote Engine, а Studio выводит длительность из принятого cue timeline." },
      "es": { "title": "Captura de navegador en vivo en Symbiote Video Studio", "summary": "Un manifiesto dirige la captura mediante Symbiote Engine y el Studio deriva la duración de un cue timeline aceptado." }
    },
    "sourceLinks": [
      { "href": "https://rnd-pro.com/projects/svs/", "label": "rnd-pro.com" }
    ]
  },
  {
    "id": "pulse/autobox-v1-hardware-lighting-sync-postmortem",
    "slug": "autobox-v1-hardware-lighting-sync-postmortem",
    "kind": "field-note",
    "status": "published",
    "publishedAt": null,
    "updatedAt": null,
    "subjectPeriod": "2013-2015",
    "relatedProjectIds": ["projects/autobox-v1"],
    "primaryProjectId": "projects/autobox-v1",
    "tags": [],
    "locales": {
      "en": { "title": "Coordinating Motion, Lighting, and Capture in AUTOBOX", "summary": "AUTOBOX treated positioning, modular lighting, camera capture, and material-specific settings as one repeatable museum-scanning configuration." },
      "ru": { "title": "Координация движения, света и съёмки в AUTOBOX", "summary": "AUTOBOX объединял позиционирование, модульный свет, работу камеры и настройки под материал в повторяемую конфигурацию музейного сканирования." },
      "es": { "title": "Coordinación de movimiento, iluminación y captura en AUTOBOX", "summary": "AUTOBOX unía posicionamiento, luz modular, captura y ajustes por material en una configuración repetible de escaneo museístico." }
    },
    "sourceLinks": [
      { "href": "https://rnd-pro.com/pulse/autobox-v1/", "label": "rnd-pro.com" }
    ]
  },
  {
    "id": "pulse/boothbot-flash-relay-degradation",
    "slug": "boothbot-flash-relay-degradation",
    "kind": "field-note",
    "status": "retired",
    "retirementTarget": "pulse/boothbot-retrospective",
    "publishedAt": null,
    "updatedAt": null,
    "subjectPeriod": "2015-2017",
    "relatedProjectIds": ["projects/boothbot"],
    "primaryProjectId": "projects/boothbot",
    "tags": [],
    "locales": {
      "en": { "title": "Degradation of flash relays in field conditions", "summary": "Analysis of hardware failure in the control system of the BoothBot pulsed light." },
      "ru": { "title": "Деградация реле вспышек в полевых условиях", "summary": "Разбор аппаратного отказа в схеме управления импульсным светом BoothBot." },
      "es": { "title": "Degradación de relés de destello en condiciones de campo", "summary": "Análisis de la falla del hardware en el circuito de control de luz pulsada de BoothBot." }
    },
    "sourceLinks": []
  },
  {
    "id": "pulse/complexscan-mesh-decimation-tradeoffs",
    "slug": "complexscan-mesh-decimation-tradeoffs",
    "kind": "field-note",
    "status": "published",
    "publishedAt": null,
    "updatedAt": null,
    "subjectPeriod": "2018-2020",
    "relatedProjectIds": ["projects/complexscan"],
    "primaryProjectId": "projects/complexscan",
    "tags": [],
    "locales": {
      "en": { "title": "Capture-System Trade-offs Before Mesh Processing", "summary": "ComplexScan moved masking, geometry consistency, and texture quality into the capture system; mesh processing remained downstream." },
      "ru": { "title": "Компромиссы съёмочной системы до обработки сетки", "summary": "ComplexScan перенёс маскирование, стабильность геометрии и качество текстур в съёмочную систему; обработка сетки оставалась следующим этапом." },
      "es": { "title": "Decisiones del sistema de captura antes del procesamiento de malla", "summary": "ComplexScan trasladó máscaras, consistencia geométrica y calidad de texturas al sistema de captura; la malla se procesaba después." }
    },
    "sourceLinks": [
      { "href": "https://rnd-pro.com/pulse/complex-scan/", "label": "rnd-pro.com" }
    ]
  },
  {
    "id": "pulse/f360-studio-photogrammetry-lighting-rig",
    "slug": "f360-studio-photogrammetry-lighting-rig",
    "kind": "field-note",
    "status": "published",
    "publishedAt": null,
    "updatedAt": null,
    "subjectPeriod": "2021-2022",
    "relatedProjectIds": ["projects/f360-studio"],
    "primaryProjectId": "projects/f360-studio",
    "tags": [],
    "locales": {
      "en": { "title": "Controlled Lighting in the F360 Photogrammetry Workflow", "summary": "Capture planning and the physical studio setup connected source-image quality to geometry, texture processing, and model presentation." },
      "ru": { "title": "Управляемый свет в фотограмметрическом процессе F360", "summary": "Планирование съёмки и физическая студийная установка связывали качество исходных фотографий с геометрией, текстурами и презентацией модели." },
      "es": { "title": "Iluminación controlada en el flujo fotogramétrico de F360", "summary": "La planificación y el montaje físico conectaban la calidad de las imágenes con geometría, texturas y presentación del modelo." }
    },
    "sourceLinks": [
      { "href": "https://sketchfab.com/F360-Studio", "label": "sketchfab.com" }
    ]
  },
  {
    "id": "pulse/lifecycle-messaging-platform-gsm-modem-pool-isolation",
    "slug": "lifecycle-messaging-platform-gsm-modem-pool-isolation",
    "kind": "field-note",
    "status": "published",
    "publishedAt": null,
    "updatedAt": null,
    "subjectPeriod": "2020-2023",
    "relatedProjectIds": ["projects/lifecycle-messaging-platform"],
    "primaryProjectId": "projects/lifecycle-messaging-platform",
    "tags": [],
    "locales": {
      "en": { "title": "GSM Modem Control as a Delivery Subsystem", "summary": "Serial and AT-command modem control stays inside the delivery subsystem behind Node.js APIs, WebSocket state, and server operations." },
      "ru": { "title": "Управление GSM-модемами как подсистема доставки", "summary": "Serial- и AT-command управление модемами остаётся внутри подсистемы доставки за Node.js API, WebSocket state и серверным контуром." },
      "es": { "title": "Control de módems GSM como subsistema de entrega", "summary": "El control serial y por comandos AT permanece en el subsistema de entrega, detrás de API Node.js, estado WebSocket y operación del servidor." }
    },
    "sourceLinks": []
  },
  {
    "id": "pulse/mcp-agent-portal-agent-browser-context-lost",
    "slug": "mcp-agent-portal-agent-browser-context-lost",
    "kind": "field-note",
    "status": "published",
    "publishedAt": null,
    "updatedAt": null,
    "subjectPeriod": "2024-2025",
    "relatedProjectIds": ["projects/agent-portal"],
    "primaryProjectId": "projects/agent-portal",
    "tags": [],
    "locales": {
      "en": { "title": "Browser X Page-Liveness Recovery", "summary": "Browser X probes the stored Playwright page before reuse, clears a failed instance, and exposes explicit errors for actions without an active page." },
      "ru": { "title": "Восстановление page liveness в Browser X", "summary": "Browser X выполняет проверку и перезапуск Playwright instance перед повторным использованием и явно отклоняет действия без активной page." },
      "es": { "title": "Recuperación de page liveness en Browser X", "summary": "Browser X realiza una comprobación y reinicio de la instancia Playwright, y devuelve errores explícitos si no hay una página activa." }
    },
    "sourceLinks": [
      { "href": "https://rnd-pro.com/projects/agent-portal/", "label": "rnd-pro.com" }
    ]
  },
  {
    "id": "pulse/megavisor-gate9-logistics-bottleneck",
    "slug": "megavisor-gate9-logistics-bottleneck",
    "kind": "field-note",
    "status": "published",
    "publishedAt": null,
    "updatedAt": null,
    "subjectPeriod": "2013-2016",
    "relatedProjectIds": ["projects/megavisor"],
    "primaryProjectId": "projects/megavisor",
    "tags": [],
    "locales": {
      "en": { "title": "Gate9 Field-Capture Logistics", "summary": "Photo-360 sequence and spherical 3D panorama shoots, access to real inventory, and handoff to retouchers formed the warehouse and retail process." },
      "ru": { "title": "Логистика выездной съёмки Gate9", "summary": "Съёмка фото-360-секвенций и сферических 3D-панорам, доступ к ассортименту и передача материалов ретушёрам образовали процесс для складов и магазинов." },
      "es": { "title": "Logística de captura en campo de Gate9", "summary": "Las sesiones de secuencias foto-360 y panoramas 3D esféricos, el acceso al inventario y el traspaso a retoque formaron el proceso en almacenes y tiendas." }
    },
    "sourceLinks": [
      { "href": "https://rnd-pro.com/projects/megavisor/", "label": "rnd-pro.com" }
    ]
  },
  {
    "id": "pulse/photosnail-public-arduino-interrupt-limitations",
    "slug": "photosnail-public-arduino-interrupt-limitations",
    "kind": "field-note",
    "status": "published",
    "publishedAt": null,
    "updatedAt": null,
    "subjectPeriod": "2016-2017",
    "relatedProjectIds": ["projects/photosnail-public"],
    "primaryProjectId": "projects/photosnail-public",
    "tags": [],
    "locales": {
      "en": { "title": "PhotoSnail Controller Timing: An Evidence Boundary", "summary": "The public project supports early camera-motion and media-presentation research; controller architecture and timing require separate evidence." },
      "ru": { "title": "Тайминги контроллера PhotoSnail: граница доказательств", "summary": "Публичный проект подтверждает раннее исследование движения камеры и медиа-презентации; архитектура контроллера и тайминги требуют отдельных свидетельств." },
      "es": { "title": "Temporización del controlador PhotoSnail: límite de evidencia", "summary": "El proyecto público respalda la investigación temprana sobre movimiento de cámara y medios; arquitectura y tiempos requieren evidencias separadas." }
    },
    "sourceLinks": [
      { "href": "https://github.com/PhotoSnail/public", "label": "github.com" }
    ]
  }
,
  {
    "id": "pulse/hardware-arch-opensource-turntables",
    "slug": "hardware-arch-opensource-turntables",
    "kind": "retrospective",
    "status": "published",
    "publishedAt": "2026-07-31T22:20:44Z",
    "updatedAt": null,
    "subjectPeriod": "2026",
    "relatedProjectIds": ["projects/photopizza"],
    "primaryProjectId": "projects/photopizza",
    "tags": [],
    "locales": {
      "en": { "title": "Buildable Open-Source PhotoPizza Turntables", "summary": "Published laser-cut drawings, stepper mechanics, an ESP32 control unit, and Espruino firmware define a complete turntable system." },
      "ru": { "title": "Собираемые open-source поворотные столы PhotoPizza", "summary": "Опубликованные чертежи для лазерной резки, шаговая механика, блок управления ESP32 и прошивка Espruino задают полную систему." },
      "es": { "title": "Plataformas PhotoPizza open-source para montar", "summary": "Planos de corte láser, mecánica paso a paso, una unidad ESP32 y firmware Espruino publicados definen el sistema completo." }
    },
    "sourceLinks": [
      { "href": "https://rnd-pro.com/projects/photopizza/", "label": "rnd-pro.com" }
    ]
  },
  {
    "id": "pulse/espruino-multi-platform-control",
    "slug": "espruino-multi-platform-control",
    "kind": "field-note",
    "status": "published",
    "publishedAt": "2026-07-31T22:20:44Z",
    "updatedAt": null,
    "subjectPeriod": "2026",
    "relatedProjectIds": ["projects/photopizza"],
    "primaryProjectId": "projects/photopizza",
    "tags": [],
    "locales": {
      "en": { "title": "PhotoPizza Control with Espruino, IR, Wi-Fi, and Android", "summary": "JavaScript firmware runs the capture sequence on Iskra JS and ESP32 controllers while three operator surfaces configure the same workflow." },
      "ru": { "title": "Управление PhotoPizza через Espruino, IR, Wi-Fi и Android", "summary": "JavaScript-прошивка исполняет съёмочную последовательность на Iskra JS и ESP32, а три интерфейса настраивают общий workflow." },
      "es": { "title": "Control de PhotoPizza con Espruino, IR, Wi-Fi y Android", "summary": "El firmware JavaScript ejecuta la secuencia en controladores Iskra JS y ESP32, mientras tres interfaces configuran el mismo workflow." }
    },
    "sourceLinks": [
      { "href": "https://rnd-pro.com/projects/photopizza/", "label": "rnd-pro.com" }
    ]
  },
  {
    "id": "pulse/photogrammetry-3d-scanning-workflows",
    "slug": "photogrammetry-3d-scanning-workflows",
    "kind": "research-note",
    "status": "retired",
    "retirementTarget": "pulse/photopizza-retrospective",
    "publishedAt": "2026-07-31T14:00:00Z",
    "updatedAt": null,
    "subjectPeriod": "2026",
    "relatedProjectIds": ["projects/photopizza"],
    "primaryProjectId": "projects/photopizza",
    "tags": [],
    "locales": {
      "en": { "title": "Integration of photogrammetry and 3D scanning workflows", "summary": "Methods of hardware synchronization of turntables with camera shutters." },
      "ru": { "title": "Интеграция рабочих процессов фотограмметрии и 3D-сканирования", "summary": "Методы аппаратной синхронизации работы поворотных столов с затвором камеры." },
      "es": { "title": "Integración de flujos de trabajo de fotogrametría y escaneo 3D", "summary": "Métodos de sincronización por hardware del funcionamiento de mesas giratorias con el obturador de la cámara." }
    },
    "sourceLinks": []
  },
  {
    "id": "pulse/complexscan-autobox-synchronization",
    "slug": "complexscan-autobox-synchronization",
    "kind": "retrospective",
    "status": "retired",
    "retirementTarget": "pulse/complexscan-retrospective",
    "publishedAt": "2026-07-31T14:00:00Z",
    "updatedAt": null,
    "subjectPeriod": "2026",
    "relatedProjectIds": ["projects/complexscan"],
    "primaryProjectId": "projects/complexscan",
    "tags": [],
    "locales": {
      "en": { "title": "Integration of synchronization ComplexScan AUTOBOX", "summary": "Architecture of the AUTOBOX module for ComplexScan series projects." },
      "ru": { "title": "Интеграция синхронизации ComplexScan AUTOBOX", "summary": "Архитектура модуля AUTOBOX для проектов серии ComplexScan." },
      "es": { "title": "Integración de sincronización ComplexScan AUTOBOX", "summary": "Arquitectura del módulo AUTOBOX para proyectos de la serie ComplexScan." }
    },
    "sourceLinks": []
  },
  {
    "id": "pulse/portable-action-message-parts-inline-embedding",
    "slug": "portable-action-message-parts-inline-embedding",
    "kind": "field-note",
    "status": "retired",
    "retirementTarget": "pulse/symbiote-ui-retrospective",
    "publishedAt": "2026-07-31T14:00:00Z",
    "updatedAt": null,
    "subjectPeriod": "2026",
    "relatedProjectIds": ["projects/symbiote-ui"],
    "primaryProjectId": "projects/symbiote-ui",
    "tags": [],
    "locales": {
      "en": { "title": "Embedding Portable Action Message Parts", "summary": "Architecture of inline embedding of interactive message components into the DOM tree with context isolation." },
      "ru": { "title": "Встраивание переносимых частей action-сообщений (Portable Action Message Parts)", "summary": "Архитектура инлайн-встраивания интерактивных компонентов сообщений в DOM-дерево с изоляцией контекста." },
      "es": { "title": "Vinculación de partes de mensaje de acción portables (Portable Action Message Parts)", "summary": "Arquitectura de la inserción en línea de componentes interactivos de mensajes en el árbol DOM con aislamiento de contexto." }
    },
    "sourceLinks": []
  },
  {
    "id": "pulse/xr-spatial-evidence-and-projections",
    "slug": "xr-spatial-evidence-and-projections",
    "kind": "research-note",
    "status": "published",
    "publishedAt": "2026-07-31T22:20:44Z",
    "updatedAt": null,
    "subjectPeriod": "2026",
    "relatedProjectIds": ["projects/symbiote-ui"],
    "primaryProjectId": "projects/symbiote-ui",
    "tags": [],
    "locales": {
      "en": { "title": "Renderer-Neutral Spatial Evidence for XR", "summary": "Metric observations, orthographic views, stereo projection, and explicit `UNAVAILABLE` results keep XR evidence separate from visual reference panes." },
      "ru": { "title": "Независимые от рендерера пространственные доказательства для XR", "summary": "Метрические наблюдения, ортографические виды, стереопроекция и явный `UNAVAILABLE` отделяют XR-доказательства от визуальных ориентиров." },
      "es": { "title": "Evidencia espacial para XR independiente del renderizador", "summary": "Observaciones métricas, vistas ortográficas, proyección estéreo y resultados `UNAVAILABLE` separan la evidencia XR de las referencias visuales." }
    },
    "sourceLinks": [
      { "href": "https://github.com/rnd-pro/symbiote-ui", "label": "github.com" }
    ]
  },
  {
    "id": "pulse/animated-presenter-cursor-scenario-implementation",
    "slug": "animated-presenter-cursor-scenario-implementation",
    "kind": "release",
    "status": "retired",
    "retirementTarget": "pulse/symbiote-ui-retrospective",
    "publishedAt": "2026-07-31T14:00:00Z",
    "updatedAt": null,
    "subjectPeriod": "2026",
    "relatedProjectIds": ["projects/symbiote-ui"],
    "primaryProjectId": "projects/symbiote-ui",
    "tags": [],
    "locales": {
      "en": { "title": "Implementation of the animated presenter cursor scenario", "summary": "Cursor position synchronization and interpolation module via WebSocket for collaborative mode (Presenter Mode)." },
      "ru": { "title": "Реализация сценария анимированного курсора презентатора", "summary": "Модуль синхронизации и интерполяции позиций курсора через WebSocket для совместного режима (Presenter Mode)." },
      "es": { "title": "Implementación de un escenario de cursor animado para presentadores", "summary": "Módulo de sincronización e interpolación de posiciones del cursor a través de WebSocket para el modo de colaboración (Modo Presentador)." }
    },
    "sourceLinks": []
  },
  {
    "id": "pulse/multi-voice-narrated-tour-architecture",
    "slug": "multi-voice-narrated-tour-architecture",
    "kind": "field-note",
    "status": "published",
    "publishedAt": "2026-07-31T22:20:44Z",
    "updatedAt": null,
    "subjectPeriod": "2026",
    "relatedProjectIds": ["projects/symbiote-ui"],
    "primaryProjectId": "projects/symbiote-ui",
    "tags": [],
    "locales": {
      "en": { "title": "Independent Speech Channels for Narrated Tours", "summary": "Separate `speechSynthesis` channels in hidden iframes support overlapping personas on a cue-driven dialogue timeline." },
      "ru": { "title": "Независимые речевые каналы для озвученных туров", "summary": "Отдельные каналы `speechSynthesis` в скрытых iframe поддерживают перекрывающиеся реплики на cue-driven таймлайне диалога." },
      "es": { "title": "Canales de voz independientes para recorridos narrados", "summary": "Canales `speechSynthesis` separados en iframes ocultos admiten voces solapadas en un timeline de diálogo guiado por señales." }
    },
    "sourceLinks": [
      { "href": "https://github.com/rnd-pro/symbiote-ui", "label": "github.com" }
    ]
  }
,
  {
    "id": "pulse/deterministic-browser-capture-offline-rendering",
    "slug": "deterministic-browser-capture-offline-rendering",
    "kind": "research-note",
    "status": "published",
    "publishedAt": "2026-07-31T22:20:44Z",
    "updatedAt": null,
    "subjectPeriod": "2026",
    "relatedProjectIds": ["projects/symbiote-engine"],
    "primaryProjectId": "projects/symbiote-engine",
    "tags": [],
    "locales": {
      "en": { "title": "Deterministic Browser Capture for Offline Rendering", "summary": "An explicit `renderClock` asks the page for a timeline state; native timers remain unchanged while isolated workers render contiguous frame ranges." },
      "ru": { "title": "Детерминированный захват браузера для офлайн-рендеринга", "summary": "Явный `renderClock` запрашивает состояние таймлайна у страницы; нативные таймеры не меняются, а изолированные workers рендерят диапазоны кадров." },
      "es": { "title": "Captura determinista del navegador para renderizado offline", "summary": "Un `renderClock` explícito solicita el estado temporal a la página; los timers nativos no cambian y workers aislados renderizan rangos contiguos." }
    },
    "sourceLinks": [
      { "href": "https://github.com/rnd-pro/symbiote-engine", "label": "github.com" }
    ]
  },
  {
    "id": "pulse/frame-cache-keys-scope-based-invalidation",
    "slug": "frame-cache-keys-scope-based-invalidation",
    "kind": "field-note",
    "status": "retired",
    "retirementTarget": "pulse/symbiote-video-studio-retrospective",
    "publishedAt": "2026-07-31T14:00:00Z",
    "updatedAt": null,
    "subjectPeriod": "2026",
    "relatedProjectIds": ["projects/symbiote-engine"],
    "primaryProjectId": "projects/symbiote-engine",
    "tags": [],
    "locales": {
      "en": { "title": "Frame cache keys and invalidation based on scope", "summary": "Hashing render AST nodes to create composite cache keys and granular layer invalidation." },
      "ru": { "title": "Ключи кэша кадров и инвалидация на основе scope", "summary": "Хэширование AST-узлов рендера для создания композитных ключей кэша и гранулярной инвалидации слоев." },
      "es": { "title": "Claves de caché de fotogramas e invalidación basada en el alcance.", "summary": "Hasheando nodos AST de renderizado para crear claves de caché compuestas e invalidación granular de capas." }
    },
    "sourceLinks": []
  },
  {
    "id": "pulse/audio-provider-contracts-cryptographic-tts-receipts",
    "slug": "audio-provider-contracts-cryptographic-tts-receipts",
    "kind": "release",
    "status": "retired",
    "retirementTarget": "pulse/symbiote-engine-retrospective",
    "publishedAt": "2026-07-31T14:00:00Z",
    "updatedAt": null,
    "subjectPeriod": "2026",
    "relatedProjectIds": ["projects/symbiote-engine"],
    "primaryProjectId": "projects/symbiote-engine",
    "tags": [],
    "locales": {
      "en": { "title": "Audio provider contracts and cryptographic TTS receipts", "summary": "Integration of Ed25519 signatures for strict validation of the integrity of PCM/WAV chunks from external TTS providers." },
      "ru": { "title": "Контракты аудио-провайдеров и криптографические TTS-квитанции", "summary": "Интеграция Ed25519-подписей для строгой валидации целостности PCM/WAV чанков от внешних TTS провайдеров." },
      "es": { "title": "Contratos de proveedores de audio y recibos TTS criptográficos", "summary": "Integración de firmas Ed25519 para la validación estricta de la integridad de los fragmentos PCM/WAV de proveedores externos de TTS." }
    },
    "sourceLinks": []
  },
  {
    "id": "pulse/native-encoded-segment-compatibility-concat-planning",
    "slug": "native-encoded-segment-compatibility-concat-planning",
    "kind": "research-note",
    "status": "retired",
    "retirementTarget": "pulse/symbiote-video-studio-retrospective",
    "publishedAt": "2026-07-31T14:00:00Z",
    "updatedAt": null,
    "subjectPeriod": "2026",
    "relatedProjectIds": ["projects/symbiote-engine"],
    "primaryProjectId": "projects/symbiote-engine",
    "tags": [],
    "locales": {
      "en": { "title": "Compatibility of natively coded segments and concatenation planning", "summary": "Validation of SPS/PPS NAL units for seamless concatenation planning of H.264/H.265 streams without transcoding." },
      "ru": { "title": "Совместимость нативных закодированных сегментов и планирование конкатенации", "summary": "Валидация SPS/PPS NAL-юнитов для планирования бесшовной конкатенации H.264/H.265 потоков без транскодирования." },
      "es": { "title": "Compatibilidad de segmentos codificados nativos y planificación de concatenación", "summary": "Validación de unidades NAL SPS/PPS para la planificación de la concatenación sin costuras de flujos H.264/H.265 sin transcoding." }
    },
    "sourceLinks": []
  },
  {
    "id": "pulse/real-time-capacity-admission-control-pre-dispatch",
    "slug": "real-time-capacity-admission-control-pre-dispatch",
    "kind": "field-note",
    "status": "retired",
    "retirementTarget": "pulse/symbiote-engine-retrospective",
    "publishedAt": "2026-07-31T14:00:00Z",
    "updatedAt": null,
    "subjectPeriod": "2026",
    "relatedProjectIds": ["projects/symbiote-engine"],
    "primaryProjectId": "projects/symbiote-engine",
    "tags": [],
    "locales": {
      "en": { "title": "Real-time resource access control before dispatching", "summary": "Resetting incoming rendering tasks (load shedding) based on predictive VRAM consumption heuristics to prevent OOM." },
      "ru": { "title": "Контроль допуска ресурсов в реальном времени перед диспетчеризацией", "summary": "Сброс входящих задач рендеринга (load shedding) на основе предиктивной эвристики потребления VRAM для предотвращения OOM." },
      "es": { "title": "Control de acceso a recursos en tiempo real antes de la despachación", "summary": "Restablecimiento de tareas de entrada de renderizado (load shedding) basado en la heurística predictiva del consumo de VRAM para prevenir OOM." }
    },
    "sourceLinks": []
  },
  {
    "id": "pulse/chat-intent-driven-workspace-construction-protocol",
    "slug": "chat-intent-driven-workspace-construction-protocol",
    "kind": "research-note",
    "status": "published",
    "publishedAt": "2026-07-31T22:20:44Z",
    "updatedAt": null,
    "subjectPeriod": "2026",
    "relatedProjectIds": ["projects/symbiote-workspace"],
    "primaryProjectId": "projects/symbiote-workspace",
    "tags": [],
    "locales": {
      "en": { "title": "Chat-Led Workspace Construction Protocol", "summary": "Explicit stages cover request classification, planning, provider selection, and validation before a portable config reaches browser assembly." },
      "ru": { "title": "Протокол сборки рабочего пространства из чата", "summary": "Явные этапы охватывают классификацию запроса, планирование, выбор провайдеров и проверку до передачи переносимой конфигурации в браузер." },
      "es": { "title": "Protocolo de construcción de workspaces desde el chat", "summary": "Etapas explícitas cubren clasificación, planificación, selección de proveedores y validación antes del ensamblado en el navegador." }
    },
    "sourceLinks": [
      { "href": "https://github.com/rnd-pro/symbiote-workspace", "label": "github.com" }
    ]
  },
  {
    "id": "pulse/strict-export-import-portable-workspace-configs",
    "slug": "strict-export-import-portable-workspace-configs",
    "kind": "field-note",
    "status": "published",
    "publishedAt": "2026-07-31T22:20:44Z",
    "updatedAt": null,
    "subjectPeriod": "2026",
    "relatedProjectIds": ["projects/symbiote-workspace"],
    "primaryProjectId": "projects/symbiote-workspace",
    "tags": [],
    "locales": {
      "en": { "title": "Strict Export and Import of Portable Workspace Configs", "summary": "Portable JSON excludes credentials, identity, endpoints, session data, and local paths, then validates host requirements before mounting." },
      "ru": { "title": "Строгий экспорт и импорт переносимых конфигураций workspace", "summary": "Переносимый JSON исключает credentials, identity, endpoints, данные сессии и локальные пути, затем проверяет требования хоста до монтирования." },
      "es": { "title": "Exportación e importación estrictas de configuraciones portátiles", "summary": "El JSON portátil excluye credenciales, identidad, endpoints, datos de sesión y rutas locales, y valida los requisitos del host antes del montaje." }
    },
    "sourceLinks": [
      { "href": "https://github.com/rnd-pro/symbiote-workspace", "label": "github.com" }
    ]
  },
  {
    "id": "pulse/unified-dispatch-registry-cli-mcp",
    "slug": "unified-dispatch-registry-cli-mcp",
    "kind": "release",
    "status": "retired",
    "retirementTarget": "pulse/symbiote-workspace-retrospective",
    "publishedAt": "2026-07-31T14:00:00Z",
    "updatedAt": null,
    "subjectPeriod": "2026",
    "relatedProjectIds": ["projects/symbiote-workspace"],
    "primaryProjectId": "projects/symbiote-workspace",
    "tags": [],
    "locales": {
      "en": { "title": "Unified dispatch registry for integrating CLI and MCP", "summary": "Unification of command routing for the local interface and Model Context Protocol." },
      "ru": { "title": "Единый реестр диспетчеризации для интеграции CLI и MCP", "summary": "Унификация роутинга команд для локального интерфейса и Model Context Protocol." },
      "es": { "title": "Registro único de despachado para la integración CLI y MCP", "summary": "Unificación del enrutamiento de comandos para la interfaz local y el Protocolo de Contexto del Modelo." }
    },
    "sourceLinks": []
  },
  {
    "id": "pulse/evidence-backed-presentation-lessons-tts-validation",
    "slug": "evidence-backed-presentation-lessons-tts-validation",
    "kind": "research-note",
    "status": "retired",
    "retirementTarget": "pulse/symbiote-workspace-retrospective",
    "publishedAt": "2026-07-31T14:00:00Z",
    "updatedAt": null,
    "subjectPeriod": "2026",
    "relatedProjectIds": ["projects/symbiote-workspace"],
    "primaryProjectId": "projects/symbiote-workspace",
    "tags": [],
    "locales": {
      "en": { "title": "Patterns of presentations based on data and TTS validation", "summary": "Automation of A/B testing of intonation patterns in speech synthesis through alignment metrics." },
      "ru": { "title": "Паттерны презентаций на основе данных и валидация TTS", "summary": "Автоматизация A/B тестирования интонационных паттернов синтеза речи через метрики выравнивания." },
      "es": { "title": "Patrones de presentaciones basadas en datos y validación de TTS", "summary": "Automatización de pruebas A/B de patrones entonacionales de síntesis de voz a través de métricas de alineación." }
    },
    "sourceLinks": []
  },
  {
    "id": "pulse/no-reload-browser-updates-workspace-patching",
    "slug": "no-reload-browser-updates-workspace-patching",
    "kind": "field-note",
    "status": "published",
    "publishedAt": "2026-07-31T22:20:44Z",
    "updatedAt": null,
    "subjectPeriod": "2026",
    "relatedProjectIds": ["projects/symbiote-workspace"],
    "primaryProjectId": "projects/symbiote-workspace",
    "tags": [],
    "locales": {
      "en": { "title": "Workspace Patching Without a Browser Reload", "summary": "Symbiote Workspace applies validated config patches with diagnostics, structural diffs, evidence, and revision checks while the UI stays mounted." },
      "ru": { "title": "Патчинг workspace без перезагрузки браузера", "summary": "Symbiote Workspace применяет проверенные патчи конфигурации с диагностикой, structural diff, evidence и revision checks без размонтирования UI." },
      "es": { "title": "Parches de workspace sin recargar el navegador", "summary": "Symbiote Workspace aplica parches de configuración validados con diagnóstico, diff estructural, evidencia y revisiones mientras la UI sigue montada." }
    },
    "sourceLinks": [
      { "href": "https://github.com/rnd-pro/symbiote-workspace", "label": "github.com" }
    ]
  },
  {
    "id": "pulse/canonical-virtual-media-sequence-modeling",
    "slug": "canonical-virtual-media-sequence-modeling",
    "kind": "release",
    "status": "retired",
    "retirementTarget": "pulse/symbiote-workspace-retrospective",
    "publishedAt": "2026-07-31T14:00:00Z",
    "updatedAt": null,
    "subjectPeriod": "2026",
    "relatedProjectIds": ["projects/symbiote-workspace"],
    "primaryProjectId": "projects/symbiote-workspace",
    "tags": [],
    "locales": {
      "en": { "title": "Modeling canonical virtual media sequences", "summary": "Engine for deterministic composition of media streams based on finite automata." },
      "ru": { "title": "Моделирование канонических виртуальных медиа-последовательностей", "summary": "Движок детерминированной композиции медиа-потоков на базе конечных автоматов." },
      "es": { "title": "Modelado de secuencias de medios virtuales canónicos", "summary": "Motor de composición determinada de flujos de medios basado en autómatas finitos." }
    },
    "sourceLinks": []
  },
  {
    "id": "pulse/unified-mcp-gateway-singleton-backend",
    "slug": "unified-mcp-gateway-singleton-backend",
    "kind": "research-note",
    "status": "retired",
    "retirementTarget": "pulse/distributed-master-client-mcp-orchestration",
    "publishedAt": "2026-07-31T14:00:00Z",
    "updatedAt": null,
    "subjectPeriod": "2026",
    "relatedProjectIds": ["projects/agent-portal"],
    "primaryProjectId": "projects/agent-portal",
    "tags": [],
    "locales": {
      "en": { "title": "Unified MCP Gateway and Singleton backend architecture", "summary": "Analysis of the transition to a unified gateway Model Context Protocol with a singleton architecture backend to eliminate race conditions." },
      "ru": { "title": "Единый MCP Gateway и архитектура Singleton-бэкенда", "summary": "Анализ перехода на единый шлюз Model Context Protocol с синглтон-архитектурой бэкенда для устранения гонок состояний." },
      "es": { "title": "Unidad de Gateway MCP y arquitectura de backend Singleton", "summary": "Análisis de la transición a una puerta de enlace unificada del Protocolo de Contexto del Modelo con arquitectura de backend de singleton para eliminar condiciones de carrera." }
    },
    "sourceLinks": []
  },
  {
    "id": "pulse/mcp-smart-gateway-meta-tools-routing",
    "slug": "mcp-smart-gateway-meta-tools-routing",
    "kind": "release",
    "status": "retired",
    "retirementTarget": "pulse/distributed-master-client-mcp-orchestration",
    "publishedAt": "2026-07-31T14:00:00Z",
    "updatedAt": null,
    "subjectPeriod": "2026",
    "relatedProjectIds": ["projects/agent-portal"],
    "primaryProjectId": "projects/agent-portal",
    "tags": [],
    "locales": {
      "en": { "title": "MCP Adaptive Gateway and Meta-Tools routing strategy", "summary": "Release of a smart gateway with support for meta-tools and dynamic request routing." },
      "ru": { "title": "MCP Adaptive Gateway и стратегия маршрутизации Meta-Tools", "summary": "Релиз умного шлюза с поддержкой мета-инструментов и динамической маршрутизации запросов." },
      "es": { "title": "MCP Adaptive Gateway y estrategia de enrutamiento Meta-Tools", "summary": "Lanzamiento de una puerta de enlace inteligente con soporte para meta-herramientas y enrutamiento dinámico de solicitudes." }
    },
    "sourceLinks": []
  },
  {
    "id": "pulse/dual-mode-transport-stdio-http",
    "slug": "dual-mode-transport-stdio-http",
    "kind": "field-note",
    "status": "published",
    "publishedAt": "2026-07-31T22:20:44Z",
    "updatedAt": null,
    "subjectPeriod": "2026",
    "relatedProjectIds": ["projects/agent-portal"],
    "primaryProjectId": "projects/agent-portal",
    "tags": [],
    "locales": {
      "en": { "title": "One MCP Tool Registry Across stdio, WebSocket, and HTTP", "summary": "IDE clients and HTTP sub-agents reach the same portal-owned tool registry through transport-specific session and response boundaries." },
      "ru": { "title": "Один MCP tool registry через stdio, WebSocket и HTTP", "summary": "IDE-клиенты и HTTP-субагенты обращаются к общему portal-owned registry через transport-specific границы сессий и ответов." },
      "es": { "title": "Un registro MCP mediante stdio, WebSocket y HTTP", "summary": "Clientes IDE y subagentes HTTP acceden al mismo registro del portal mediante límites de sesión y respuesta propios de cada transporte." }
    },
    "sourceLinks": [
      { "href": "https://rnd-pro.com/projects/agent-portal/", "label": "rnd-pro.com" }
    ]
  },
  {
    "id": "pulse/web-dashboard-spa-extensible-registry",
    "slug": "web-dashboard-spa-extensible-registry",
    "kind": "release",
    "status": "retired",
    "retirementTarget": "pulse/agent-portal-retrospective",
    "publishedAt": "2026-07-31T14:00:00Z",
    "updatedAt": null,
    "subjectPeriod": "2026",
    "relatedProjectIds": ["projects/agent-portal"],
    "primaryProjectId": "projects/agent-portal",
    "tags": [],
    "locales": {
      "en": { "title": "Expandable section registry of Web Dashboard SPA", "summary": "Added the ability for dynamic registration of components (sections) in the SPA dashboard." },
      "ru": { "title": "Расширяемый реестр секций Web Dashboard SPA", "summary": "Добавлена возможность динамической регистрации компонентов (секций) в SPA-дашборде." },
      "es": { "title": "Registro de secciones extensible del Web Dashboard SPA", "summary": "Se ha añadido la posibilidad de registrar dinámicamente componentes (secciones) en el panel de control SPA." }
    },
    "sourceLinks": []
  },
  {
    "id": "pulse/dynamic-workspace-registration-deduplication",
    "slug": "dynamic-workspace-registration-deduplication",
    "kind": "research-note",
    "status": "published",
    "publishedAt": "2026-07-31T22:20:44Z",
    "updatedAt": null,
    "subjectPeriod": "2026",
    "relatedProjectIds": ["projects/agent-portal"],
    "primaryProjectId": "projects/agent-portal",
    "tags": [],
    "locales": {
      "en": { "title": "Workspace Registration by Exact Path", "summary": "Agent Portal registers MCP workspace roots in StateGraph and deduplicates only identical stored path strings, without realpath or hash canonicalization." },
      "ru": { "title": "Регистрация workspace по точной строке пути", "summary": "Agent Portal регистрирует MCP workspace roots в StateGraph и дедуплицирует только совпадающие строки пути, без realpath или hash canonicalization." },
      "es": { "title": "Registro de workspaces por ruta exacta", "summary": "Agent Portal registra raíces MCP en StateGraph y deduplica solo cadenas de ruta idénticas, sin canonicalización por realpath ni hash." }
    },
    "sourceLinks": [
      { "href": "https://rnd-pro.com/projects/agent-portal/", "label": "rnd-pro.com" }
    ]
  },
  {
    "id": "pulse/stategraph-reactive-state-sync-websocket",
    "slug": "stategraph-reactive-state-sync-websocket",
    "kind": "field-note",
    "status": "retired",
    "retirementTarget": "pulse/agent-portal-retrospective",
    "publishedAt": "2026-07-31T14:00:00Z",
    "updatedAt": null,
    "subjectPeriod": "2026",
    "relatedProjectIds": ["projects/agent-portal"],
    "primaryProjectId": "projects/agent-portal",
    "tags": [],
    "locales": {
      "en": { "title": "Reactive state synchronization of StateGraph via WebSocket", "summary": "Implementation of bidirectional event flow for synchronizing StateGraph graphs between client and server with minimal overhead." },
      "ru": { "title": "Реактивная синхронизация состояний StateGraph через WebSocket", "summary": "Реализация двунаправленного потока событий для синхронизации StateGraph графов между клиентом и сервером с минимизацией оверхеда." },
      "es": { "title": "Sincronización reactiva de estados StateGraph a través de WebSocket", "summary": "Implementación de un flujo de eventos bidireccional para la sincronización de gráficos StateGraph entre el cliente y el servidor con minimización del overhead." }
    },
    "sourceLinks": []
  },
  {
    "id": "pulse/distributed-master-client-mcp-orchestration",
    "slug": "distributed-master-client-mcp-orchestration",
    "kind": "release",
    "status": "published",
    "publishedAt": "2026-07-31T22:20:44Z",
    "updatedAt": null,
    "subjectPeriod": "2026",
    "relatedProjectIds": ["projects/agent-portal"],
    "primaryProjectId": "projects/agent-portal",
    "tags": [],
    "locales": {
      "en": { "title": "Agent Portal Master-Client MCP Orchestration", "summary": "Standalone, client, and master modes combine local child servers with remote client tool sets behind one portal routing boundary." },
      "ru": { "title": "Master-client MCP-оркестрация Agent Portal", "summary": "Режимы standalone, client и master объединяют локальные дочерние серверы и remote tool sets за общей границей routing портала." },
      "es": { "title": "Orquestación MCP master-client en Agent Portal", "summary": "Los modos standalone, client y master combinan servidores hijos locales y herramientas remotas detrás de un único límite de routing del portal." }
    },
    "sourceLinks": [
      { "href": "https://rnd-pro.com/projects/agent-portal/", "label": "rnd-pro.com" }
    ]
  },
  {
    "id": "pulse/mlops-flywheel-token-trajectory-compression",
    "slug": "mlops-flywheel-token-trajectory-compression",
    "kind": "research-note",
    "status": "retired",
    "retirementTarget": "pulse/agent-portal-retrospective",
    "publishedAt": "2026-07-31T14:00:00Z",
    "updatedAt": null,
    "subjectPeriod": "2026",
    "relatedProjectIds": ["projects/agent-portal"],
    "primaryProjectId": "projects/agent-portal",
    "tags": [],
    "locales": {
      "en": { "title": "MLOps flywheel and token trajectory compression", "summary": "Analysis of approaches to accumulating training data for agents and algorithms for compressing long chains of thought (CoT) without losing context." },
      "ru": { "title": "MLOps маховик и сжатие траекторий токенов", "summary": "Анализ подходов к аккумулированию обучающих данных агентов и алгоритмы сжатия длинных траекторий размышлений (CoT) без потери контекста." },
      "es": { "title": "MLOps volante y compresión de trayectorias de tokens", "summary": "Análisis de los enfoques para acumular datos de entrenamiento de agentes y algoritmos de compresión de largas trayectorias de pensamientos (CoT) sin pérdida de contexto." }
    },
    "sourceLinks": []
  },
  {
    "id": "pulse/context-compression-minification-llms",
    "slug": "context-compression-minification-llms",
    "kind": "field-note",
    "status": "retired",
    "retirementTarget": "pulse/project-graph-mcp-retrospective",
    "publishedAt": "2026-07-31T14:00:00Z",
    "updatedAt": null,
    "subjectPeriod": "2026",
    "relatedProjectIds": ["projects/context-x-mcp"],
    "primaryProjectId": "projects/context-x-mcp",
    "tags": [],
    "locales": {
      "en": { "title": "Compression and minification of context for LLM", "summary": "Algorithmic noise removal and AST parsing to reduce prompt size by 2-3 times without degrading inference quality." },
      "ru": { "title": "Сжатие и минификация контекста для LLM", "summary": "Алгоритмическое удаление шума и AST-парсинг для сокращения размера промптов в 2-3 раза без ухудшения качества инференса." },
      "es": { "title": "Compresión y minificación del contexto para LLM", "summary": "Eliminación de ruido algorítmica y análisis sintáctico AST para reducir el tamaño de los prompts en 2-3 veces sin afectar la calidad de la inferencia." }
    },
    "sourceLinks": []
  },
  {
    "id": "pulse/non-blocking-delegation-cli-workers",
    "slug": "non-blocking-delegation-cli-workers",
    "kind": "field-note",
    "status": "retired",
    "retirementTarget": "pulse/agent-pool-mcp-retrospective",
    "publishedAt": "2026-07-31T14:00:00Z",
    "updatedAt": null,
    "subjectPeriod": "2026",
    "relatedProjectIds": ["projects/agent-pool-mcp"],
    "primaryProjectId": "projects/agent-pool-mcp",
    "tags": [],
    "locales": {
      "en": { "title": "Non-blocking task delegation to CLI workers", "summary": "Asynchronous execution of external scripts to prevent I/O blocking in the main event loop of the agent." },
      "ru": { "title": "Неблокирующее делегирование задач CLI-воркерам", "summary": "Асинхронный запуск внешних скриптов для предотвращения I/O-блокировок в основном event-loop агента." },
      "es": { "title": "Delegación de tareas no bloqueante a trabajadores CLI", "summary": "Ejecutar de forma asíncrona scripts externos para prevenir bloqueos de I/O en el bucle de eventos principal del agente." }
    },
    "sourceLinks": []
  },
  {
    "id": "pulse/multi-step-pipelines-handoff",
    "slug": "multi-step-pipelines-handoff",
    "kind": "release",
    "status": "retired",
    "retirementTarget": "pulse/agent-pool-mcp-retrospective",
    "publishedAt": "2026-07-31T14:00:00Z",
    "updatedAt": null,
    "subjectPeriod": "2026",
    "relatedProjectIds": ["projects/agent-pool-mcp"],
    "primaryProjectId": "projects/agent-pool-mcp",
    "tags": [],
    "locales": {
      "en": { "title": "Multi-step sequential pipelines with Handoff triggers", "summary": "Mechanism for transferring context between specialized agents based on a state machine." },
      "ru": { "title": "Многошаговые последовательные пайплайны с триггерами Handoff", "summary": "Механизм передачи контекста между узкоспециализированными агентами на основе машины состояний." },
      "es": { "title": "Múltiples pipelines secuenciales con disparadores Handoff", "summary": "Mecanismo de transmisión de contexto entre agentes altamente especializados basado en máquinas de estados." }
    },
    "sourceLinks": []
  },
  {
    "id": "pulse/cross-model-peer-review",
    "slug": "cross-model-peer-review",
    "kind": "research-note",
    "status": "published",
    "publishedAt": "2026-07-31T22:20:44Z",
    "updatedAt": null,
    "subjectPeriod": "2026",
    "relatedProjectIds": ["projects/agent-pool-mcp"],
    "primaryProjectId": "projects/agent-pool-mcp",
    "tags": [],
    "locales": {
      "en": { "title": "Cross-Model Peer Review: Evidence Before Acceptance", "summary": "`delegate_task_readonly` routes a bounded review through Agent Pool; the worker returns evidence while the orchestrator retains acceptance authority, with Claude Sonnet 5 and GPT-5.6 Sol as an illustrative pairing." },
      "ru": { "title": "Кросс-модельный peer review: evidence до приёмки", "summary": "`delegate_task_readonly` направляет ограниченный review через Agent Pool; worker возвращает evidence, а решение о приёмке остаётся у оркестратора. Claude Sonnet 5 и GPT-5.6 Sol служат иллюстративной парой." },
      "es": { "title": "Peer review entre modelos: evidencia antes de aceptar", "summary": "`delegate_task_readonly` dirige una revisión acotada mediante Agent Pool; el worker aporta evidencia y el orquestador conserva la aceptación. Claude Sonnet 5 y GPT-5.6 Sol son una pareja ilustrativa." }
    },
    "sourceLinks": [
      { "href": "https://github.com/rnd-pro/agent-pool-mcp", "label": "github.com" }
    ]
  },
  {
    "id": "pulse/atomic-cron-scheduling-local-agents",
    "slug": "atomic-cron-scheduling-local-agents",
    "kind": "field-note",
    "status": "published",
    "publishedAt": "2026-07-31T22:20:44Z",
    "updatedAt": null,
    "subjectPeriod": "2026",
    "relatedProjectIds": ["projects/agent-pool-mcp"],
    "primaryProjectId": "projects/agent-pool-mcp",
    "tags": [],
    "locales": {
      "en": { "title": "Cron Scheduling for Local Agent Tasks", "summary": "A detached daemon uses a five-field cron parser with file-backed definitions, results, a PID lock, and overlap policy." },
      "ru": { "title": "Cron-планирование локальных агентных задач", "summary": "Detached daemon использует parser пяти полей cron, файловые definitions и results, PID lock и overlap policy." },
      "es": { "title": "Planificación cron de tareas locales de agentes", "summary": "Un daemon desacoplado usa un parser cron de cinco campos, definiciones y resultados en archivos, PID lock y política de solapamiento." }
    },
    "sourceLinks": [
      { "href": "https://github.com/rnd-pro/agent-pool-mcp", "label": "github.com" }
    ]
  },
  {
    "id": "pulse/workspace-vs-global-team-memory",
    "slug": "workspace-vs-global-team-memory",
    "kind": "release",
    "status": "published",
    "publishedAt": "2026-07-31T22:20:44Z",
    "updatedAt": null,
    "subjectPeriod": "2026",
    "relatedProjectIds": ["projects/agent-pool-mcp"],
    "primaryProjectId": "projects/agent-pool-mcp",
    "tags": [],
    "locales": {
      "en": { "title": "Team Memory: Reusable and Project-Specific Skills", "summary": "One configured content root separates reusable `skills/` from project-specific `workspace/<project>/skills/`, selected by a resolver." },
      "ru": { "title": "Team Memory: переиспользуемые и проектные skills", "summary": "Один настроенный content root разделяет общие `skills/` и проектные `workspace/<project>/skills/`, которые выбирает resolver." },
      "es": { "title": "Team Memory: skills reutilizables y específicas de proyecto", "summary": "Una raíz configurada separa `skills/` reutilizables de `workspace/<project>/skills/`, seleccionadas por un resolver." }
    },
    "sourceLinks": [
      { "href": "https://github.com/rnd-pro/agent-pool-mcp", "label": "github.com" }
    ]
  },
  {
    "id": "pulse/path-traversal-process-isolation",
    "slug": "path-traversal-process-isolation",
    "kind": "field-note",
    "status": "published",
    "publishedAt": "2026-07-31T22:20:44Z",
    "updatedAt": null,
    "subjectPeriod": "2026",
    "relatedProjectIds": ["projects/agent-pool-mcp"],
    "primaryProjectId": "projects/agent-pool-mcp",
    "tags": [],
    "locales": {
      "en": { "title": "Filesystem Boundary Validation in Agent Pool", "summary": "Delegation resolves working roots before launch, rejects configured system roots, and passes the resulting workspace scope to the worker." },
      "ru": { "title": "Проверка filesystem boundaries в Agent Pool", "summary": "Делегирование разрешает рабочие roots до запуска, отклоняет системные каталоги и передаёт получившийся workspace scope воркеру." },
      "es": { "title": "Validación de límites del sistema de archivos en Agent Pool", "summary": "La delegación resuelve las raíces antes del lanzamiento, rechaza directorios del sistema y entrega el workspace scope al worker." }
    },
    "sourceLinks": [
      { "href": "https://github.com/rnd-pro/agent-pool-mcp", "label": "github.com" }
    ]
  },
  {
    "id": "pulse/ast-codebase-analysis-acorn",
    "slug": "ast-codebase-analysis-acorn",
    "kind": "research-note",
    "status": "published",
    "publishedAt": "2026-07-31T22:20:44Z",
    "updatedAt": null,
    "subjectPeriod": "2026",
    "relatedProjectIds": ["projects/project-graph-mcp"],
    "primaryProjectId": "projects/project-graph-mcp",
    "tags": [],
    "locales": {
      "en": { "title": "JavaScript Structure Analysis with Vendored Acorn", "summary": "AST traversal extracts declarations, imports, exports, calls, and signatures for project skeletons and focused analysis tools." },
      "ru": { "title": "Структурный анализ JavaScript через vendored Acorn", "summary": "Обход AST извлекает declarations, imports, exports, calls и signatures для project skeleton и сфокусированных analysis tools." },
      "es": { "title": "Análisis estructural de JavaScript con Acorn vendorizado", "summary": "El recorrido del AST extrae declaraciones, imports, exports, llamadas y firmas para skeletons y herramientas de análisis." }
    },
    "sourceLinks": [
      { "href": "https://github.com/rnd-pro/project-graph-mcp", "label": "github.com" }
    ]
  },
  {
    "id": "pulse/multi-language-regex-parsers",
    "slug": "multi-language-regex-parsers",
    "kind": "release",
    "status": "published",
    "publishedAt": "2026-07-31T22:20:44Z",
    "updatedAt": null,
    "subjectPeriod": "2026",
    "relatedProjectIds": ["projects/project-graph-mcp"],
    "primaryProjectId": "projects/project-graph-mcp",
    "tags": [],
    "locales": {
      "en": { "title": "Structural Parsers for TypeScript, Python, and Go", "summary": "Language-specific parsers extract declarations and dependency signals, with masked source preserving positions for regex-based paths." },
      "ru": { "title": "Структурные parsers для TypeScript, Python и Go", "summary": "Языковые parsers извлекают declarations и dependency signals, а маскирование source сохраняет позиции для regex-путей." },
      "es": { "title": "Parsers estructurales para TypeScript, Python y Go", "summary": "Parsers por lenguaje extraen declaraciones y dependencias; el enmascarado conserva posiciones para rutas basadas en regex." }
    },
    "sourceLinks": [
      { "href": "https://github.com/rnd-pro/project-graph-mcp", "label": "github.com" }
    ]
  },
  {
    "id": "pulse/incremental-analysis-caching",
    "slug": "incremental-analysis-caching",
    "kind": "research-note",
    "status": "published",
    "publishedAt": "2026-07-31T22:20:44Z",
    "updatedAt": null,
    "subjectPeriod": "2026",
    "relatedProjectIds": ["projects/project-graph-mcp"],
    "primaryProjectId": "projects/project-graph-mcp",
    "tags": [],
    "locales": {
      "en": { "title": "Two Cache Boundaries in Project Graph MCP", "summary": "The graph cache tracks source modification times, while full quality analysis reuses results by content hash and analysis type." },
      "ru": { "title": "Две границы cache в Project Graph MCP", "summary": "Graph cache отслеживает время изменения source, а full quality analysis переиспользует результаты по content hash и типу анализа." },
      "es": { "title": "Dos límites de caché en Project Graph MCP", "summary": "El caché del grafo sigue tiempos de modificación y el análisis completo reutiliza resultados por hash de contenido y tipo." }
    },
    "sourceLinks": [
      { "href": "https://github.com/rnd-pro/project-graph-mcp", "label": "github.com" }
    ]
  },
  {
    "id": "pulse/code-quality-analysis",
    "slug": "code-quality-analysis",
    "kind": "field-note",
    "status": "published",
    "publishedAt": "2026-07-31T22:20:44Z",
    "updatedAt": null,
    "subjectPeriod": "2026",
    "relatedProjectIds": ["projects/project-graph-mcp"],
    "primaryProjectId": "projects/project-graph-mcp",
    "tags": [],
    "locales": {
      "en": { "title": "Code Quality Analysis in Project Graph MCP", "summary": "One MCP tool combines AST-backed and heuristic checks for dead code, complexity, similar functions, large files, and documentation consistency." },
      "ru": { "title": "Анализ качества кода в Project Graph MCP", "summary": "Один MCP tool объединяет AST- и heuristic-проверки dead code, complexity, похожих функций, больших файлов и согласованности документации." },
      "es": { "title": "Análisis de calidad de código en Project Graph MCP", "summary": "Una herramienta MCP combina controles AST y heurísticos de código muerto, complejidad, funciones similares, archivos grandes y documentación." }
    },
    "sourceLinks": [
      { "href": "https://github.com/rnd-pro/project-graph-mcp", "label": "github.com" }
    ]
  },
  {
    "id": "pulse/host-neutral-graph-first-execution",
    "slug": "host-neutral-graph-first-execution",
    "kind": "release",
    "status": "retired",
    "retirementTarget": "pulse/symbiote-engine-retrospective",
    "publishedAt": "2026-07-31T14:00:00Z",
    "updatedAt": null,
    "subjectPeriod": "2026",
    "relatedProjectIds": ["projects/symbiote-engine"],
    "primaryProjectId": "projects/symbiote-engine",
    "tags": [],
    "locales": {
      "en": { "title": "Host-independent graph execution model", "summary": "Release of an environment-abstracted graph execution engine. Transition to a graph-centric architecture without binding to Node.js/Browser runtimes." },
      "ru": { "title": "Хост-независимая графовая модель выполнения", "summary": "Релиз абстрагированного от среды движка исполнения графов. Переход на графоцентричную архитектуру без привязки к Node.js/Browser рантаймам." },
      "es": { "title": "Modelo de ejecución de gráficos independiente del host", "summary": "Lanzamiento de un motor de ejecución de grafos abstraído del entorno. Transición a una arquitectura centrada en grafos sin dependencia de los entornos de ejecución Node.js/Browser." }
    },
    "sourceLinks": []
  },
  {
    "id": "pulse/composable-automation-packs-node-types",
    "slug": "composable-automation-packs-node-types",
    "kind": "field-note",
    "status": "published",
    "publishedAt": "2026-07-31T22:20:44Z",
    "updatedAt": null,
    "subjectPeriod": "2026",
    "relatedProjectIds": ["projects/symbiote-engine"],
    "primaryProjectId": "projects/symbiote-engine",
    "tags": [],
    "locales": {
      "en": { "title": "Composable Driver Packs for Symbiote Engine", "summary": "Self-describing driver records register node sockets, parameters, and execution handlers; domain packs add namespaced node and socket types." },
      "ru": { "title": "Компонуемые driver packs для Symbiote Engine", "summary": "Самодостаточные driver records регистрируют sockets, параметры и handlers; доменные packs добавляют namespaced типы узлов и сокетов." },
      "es": { "title": "Driver packs componibles para Symbiote Engine", "summary": "Registros autosuficientes declaran sockets, parámetros y handlers; los packs de dominio añaden tipos de nodos y sockets con namespace." }
    },
    "sourceLinks": [
      { "href": "https://github.com/rnd-pro/symbiote-engine", "label": "github.com" }
    ]
  },
  {
    "id": "pulse/browser-safe-execution-vs-node-runtime",
    "slug": "browser-safe-execution-vs-node-runtime",
    "kind": "research-note",
    "status": "retired",
    "retirementTarget": "pulse/symbiote-engine-retrospective",
    "publishedAt": "2026-07-31T14:00:00Z",
    "updatedAt": null,
    "subjectPeriod": "2026",
    "relatedProjectIds": ["projects/symbiote-engine"],
    "primaryProjectId": "projects/symbiote-engine",
    "tags": [],
    "locales": {
      "en": { "title": "Safe execution in the browser versus Node environment contexts", "summary": "Analysis of context isolation when running in the browser compared to Node.js. I/O limitations and overhead of Web Workers." },
      "ru": { "title": "Безопасное выполнение в браузере против контекстов среды Node", "summary": "Анализ изоляции контекстов при выполнении в браузере в сравнении с Node.js. Ограничения I/O и overhead Web Workers." },
      "es": { "title": "Ejecución segura en el navegador contra contextos del entorno Node", "summary": "Análisis de la isolación de contextos al ejecutarse en el navegador en comparación con Node.js. Limitaciones de I/O y overhead de los Web Workers." }
    },
    "sourceLinks": []
  },
  {
    "id": "pulse/content-addressed-media-artifacts-receipt",
    "slug": "content-addressed-media-artifacts-receipt",
    "kind": "field-note",
    "status": "retired",
    "retirementTarget": "pulse/symbiote-video-studio-retrospective",
    "publishedAt": "2026-07-31T14:00:00Z",
    "updatedAt": null,
    "subjectPeriod": "2026",
    "relatedProjectIds": ["projects/symbiote-engine"],
    "primaryProjectId": "projects/symbiote-engine",
    "tags": [],
    "locales": {
      "en": { "title": "Content-addressable local media artifacts and verification of checks", "summary": "Transition to content-based addressing (CID) of local media files and cryptographic integrity verification of I/O artifacts." },
      "ru": { "title": "Контентно-адресуемые локальные медиа-артефакты и верификация чеков", "summary": "Переход на контентную адресацию (CID) локальных медиа-файлов и криптографическая проверка целостности I/O артефактов." },
      "es": { "title": "Contenido-dirigidos medios locales artefactos y verificación de cheques", "summary": "Transición a la direccionamiento de contenido (CID) de archivos multimedia locales y verificación criptográfica de la integridad de los artefactos de E/S." }
    },
    "sourceLinks": []
  },
  {
    "id": "pulse/engine-owned-handler-execution-queues",
    "slug": "engine-owned-handler-execution-queues",
    "kind": "release",
    "status": "retired",
    "retirementTarget": "pulse/symbiote-engine-retrospective",
    "publishedAt": "2026-07-31T14:00:00Z",
    "updatedAt": null,
    "subjectPeriod": "2026",
    "relatedProjectIds": ["projects/symbiote-engine"],
    "primaryProjectId": "projects/symbiote-engine",
    "tags": [],
    "locales": {
      "en": { "title": "Handler execution queues on the engine side", "summary": "Release of the built-in queue mechanism for async handlers. Control of concurrency and backpressure at the engine level." },
      "ru": { "title": "Очереди выполнения обработчиков на стороне движка", "summary": "Релиз встроенного механизма очередей для асинхронных обработчиков. Контроль concurrency и backpressure на уровне движка." },
      "es": { "title": "Colas de ejecución de manejadores en el lado del motor", "summary": "Lanzamiento del mecanismo de colas integrado para manejadores asíncronos. Control de concurrencia y backpressure a nivel del motor." }
    },
    "sourceLinks": []
  }
,
  {
    "id": "pulse/autobox-v1-hardware-cross-polarization-museum",
    "slug": "autobox-v1-hardware-cross-polarization-museum",
    "kind": "field-note",
    "status": "published",
    "publishedAt": null,
    "updatedAt": null,
    "subjectPeriod": "2019",
    "relatedProjectIds": ["projects/autobox-v1"],
    "primaryProjectId": "projects/autobox-v1",
    "tags": [],
    "locales": {
      "en": { "title": "Cross-Polarized AUTOBOX Lighting for Museum Scanning", "summary": "I developed modular lights with wireless control, cooling, sensors, and cross-polarization, validated on detailed Hermitage objects." },
      "ru": { "title": "Кросс-поляризационный свет AUTOBOX для музейного сканирования", "summary": "Я разработал модульный свет с беспроводным управлением, охлаждением, сенсорами и кросс-поляризацией и проверил его на сложных объектах Эрмитажа." },
      "es": { "title": "Iluminación AUTOBOX con polarización cruzada para museos", "summary": "Desarrollé luces modulares con control inalámbrico, refrigeración, sensores y polarización cruzada, validadas con objetos detallados del Hermitage." }
    },
    "sourceLinks": [
      { "href": "https://rnd-pro.com/pulse/autobox-v1/", "label": "rnd-pro.com" }
    ]
  },
  {
    "id": "pulse/autobox-v1-photogrammetry-data-workflow",
    "slug": "autobox-v1-photogrammetry-data-workflow",
    "kind": "research-note",
    "status": "published",
    "publishedAt": "2026-07-31T22:20:44Z",
    "updatedAt": null,
    "subjectPeriod": "2020",
    "relatedProjectIds": ["projects/autobox-v1"],
    "primaryProjectId": "projects/autobox-v1",
    "tags": [],
    "locales": {
      "en": { "title": "Source-Data Handoff in Museum Scanning", "summary": "AUTOBOX field datasets moved through color calibration, retouching, retopology, and handoff between photographers and 3D specialists." },
      "ru": { "title": "Передача исходных данных в музейном сканировании", "summary": "Полевые датасеты AUTOBOX проходили цветокалибровку, ретушь, ретопологию и handoff между фотографами и 3D-специалистами." },
      "es": { "title": "Traspaso de datos fuente en escaneo museístico", "summary": "Los datasets de AUTOBOX pasaban por calibración de color, retoque, retopología y traspaso entre fotógrafos y especialistas 3D." }
    },
    "sourceLinks": [
      { "href": "https://rnd-pro.com/pulse/autobox-v1/", "label": "rnd-pro.com" }
    ]
  },
  {
    "id": "pulse/boothbot-robotic-camera-sync",
    "slug": "boothbot-robotic-camera-sync",
    "kind": "field-note",
    "status": "retired",
    "retirementTarget": "pulse/boothbot-retrospective",
    "publishedAt": null,
    "updatedAt": null,
    "subjectPeriod": "2021",
    "relatedProjectIds": ["projects/boothbot"],
    "primaryProjectId": "projects/boothbot",
    "tags": [],
    "locales": {
      "en": { "title": "Synchronization of Equipment in Robotic Capture Systems", "summary": "Synchronization of hardware triggers, DMX lighting, and camera shutters in custom robotic booths." },
      "ru": { "title": "Синхронизация оборудования в роботизированных системах захвата", "summary": "Синхронизация аппаратных триггеров, DMX-освещения и затворов камер в кастомных роботизированных стендах." },
      "es": { "title": "Sincronización de Equipos en Sistemas Robóticos de Captura", "summary": "Sincronización de disparadores de hardware, iluminación DMX y obturadores de cámaras en cabinas robóticas personalizadas." }
    },
    "sourceLinks": []
  },
  {
    "id": "pulse/browser-x-mcp-browser-automation-context-bridge",
    "slug": "browser-x-mcp-browser-automation-context-bridge",
    "kind": "research-note",
    "status": "retired",
    "retirementTarget": "pulse/browser-x-mcp-retrospective",
    "publishedAt": "2025-05-10T12:00:00Z",
    "updatedAt": null,
    "subjectPeriod": "2025",
    "relatedProjectIds": ["projects/browser-x-mcp"],
    "primaryProjectId": "projects/browser-x-mcp",
    "tags": [],
    "locales": {
      "en": { "title": "Designing a Secure Context Bridge for Headless Browsers", "summary": "Implementation of the Context Protocol for integrating headless browsers into agent environments." },
      "ru": { "title": "Проектирование безопасного моста контекста для headless-браузеров", "summary": "Реализация протокола передачи контекста (Context Protocol) для интеграции headless-браузеров в агентные среды." },
      "es": { "title": "Diseño de un Puente de Contexto Seguro para Navegadores Headless", "summary": "Implementación del Protocolo de Contexto para integrar navegadores headless en entornos de agentes." }
    },
    "sourceLinks": []
  },
  {
    "id": "pulse/f360-studio-studio-automation-state-machine",
    "slug": "f360-studio-studio-automation-state-machine",
    "kind": "field-note",
    "status": "retired",
    "retirementTarget": "pulse/f360-studio-retrospective",
    "publishedAt": null,
    "updatedAt": null,
    "subjectPeriod": "2020",
    "relatedProjectIds": ["projects/f360-studio"],
    "primaryProjectId": "projects/f360-studio",
    "tags": [],
    "locales": {
      "en": { "title": "Implementation of a Finite State Machine for Multi-Camera Capture", "summary": "Utilizing a robust state machine model for managing studio equipment states during simultaneous shooting." },
      "ru": { "title": "Реализация конечного автомата для мультикамерного захвата", "summary": "Использование надежной автоматной модели (State Machine) для управления состоянием студийного оборудования при одновременной съемке." },
      "es": { "title": "Implementación de una Máquina de Estados Finitos para Captura Multi-Cámara", "summary": "Utilizando un modelo de máquina de estados sólido para gestionar los estados del equipo de estudio durante las grabaciones simultáneas." }
    },
    "sourceLinks": []
  },
  {
    "id": "pulse/lifecycle-messaging-platform-gsm-modem-pool-orchestration",
    "slug": "lifecycle-messaging-platform-gsm-modem-pool-orchestration",
    "kind": "field-note",
    "status": "published",
    "publishedAt": null,
    "updatedAt": null,
    "subjectPeriod": "2018",
    "relatedProjectIds": ["projects/lifecycle-messaging-platform"],
    "primaryProjectId": "projects/lifecycle-messaging-platform",
    "tags": [],
    "locales": {
      "en": { "title": "GSM Modem Pool Orchestration with Node.js", "summary": "Node.js APIs connect to physical modem pools through serial ports and AT commands, with WebSocket state and RabbitMQ-compatible intake." },
      "ru": { "title": "Оркестрация пула GSM-модемов через Node.js", "summary": "Node.js API связываются с физическими пулами через serial-порты и AT-команды, используя WebSocket state и RabbitMQ-compatible intake." },
      "es": { "title": "Orquestación de pools de módems GSM con Node.js", "summary": "API Node.js conectan pools físicos mediante puertos seriales y comandos AT, con estado WebSocket e intake compatible con RabbitMQ." }
    },
    "sourceLinks": []
  },
  {
    "id": "pulse/mcp-agent-portal-mcp-function-calling-contracts",
    "slug": "mcp-agent-portal-mcp-function-calling-contracts",
    "kind": "research-note",
    "status": "retired",
    "retirementTarget": "pulse/mcp-agent-portal-retrospective",
    "publishedAt": "2026-03-20T12:00:00Z",
    "updatedAt": null,
    "subjectPeriod": "2026",
    "relatedProjectIds": ["projects/agent-portal"],
    "primaryProjectId": "projects/agent-portal",
    "tags": [],
    "locales": {
      "en": { "title": "Structuring Contracts Tool-use for Agent Processes", "summary": "Architectural approaches to function calling schemas and context extraction in the MCP Agent Portal." },
      "ru": { "title": "Структурирование контрактов tool-use для агентных процессов", "summary": "Архитектурные подходы к описанию схем вызова функций (function calling) и извлечению контекста в MCP Agent Portal." },
      "es": { "title": "Estructuración de Contratos Tool-use para Procesos de Agentes", "summary": "Enfoques arquitectónicos para esquemas de llamadas de funciones y extracción de contexto en el MCP Agent Portal." }
    },
    "sourceLinks": []
  },
  {
    "id": "pulse/megavisor-interactive-photo-360-player",
    "slug": "megavisor-interactive-photo-360-player",
    "kind": "release",
    "status": "retired",
    "retirementTarget": "pulse/megavisor-retrospective",
    "publishedAt": "2013-11-05T12:00:00Z",
    "updatedAt": null,
    "subjectPeriod": "2013",
    "relatedProjectIds": ["projects/megavisor"],
    "primaryProjectId": "projects/megavisor",
    "tags": [],
    "locales": {
      "en": { "title": "Architectural Solutions for a 360-Photo Sequence Web Player", "summary": "Implementation of seamless transitions between 360 sequences and spherical 3D panoramas in an interactive media player." },
      "ru": { "title": "Архитектурные решения веб-плеера фото-360 секвенций", "summary": "Реализация бесшовных переходов между 360-секвенциями и сферическими 3D-панорамами в интерактивном медиаплейере." },
      "es": { "title": "Soluciones Arquitectónicas para un Reproductor Web de Secuencias de Fotos 360", "summary": "Implementación de transiciones suaves entre secuencias 360 y panoramas 3D esféricos en un reproductor de medios interactivo." }
    },
    "sourceLinks": []
  },
  {
    "id": "pulse/photopizza-remote-browser-hardware-control",
    "slug": "photopizza-remote-browser-hardware-control",
    "kind": "release",
    "status": "published",
    "publishedAt": "2026-07-31T22:20:44Z",
    "updatedAt": null,
    "subjectPeriod": "2019",
    "relatedProjectIds": ["projects/photopizza-remote"],
    "primaryProjectId": "projects/photopizza-remote",
    "tags": [],
    "locales": {
      "en": { "title": "Browser Control for PhotoPizza Turntables", "summary": "The browser connects to a local controller over WebSocket to configure capture parameters, start or stop motion, and show remaining frames." },
      "ru": { "title": "Браузерное управление поворотными столами PhotoPizza", "summary": "Браузер подключается к локальному контроллеру по WebSocket, настраивает параметры съёмки, запускает движение и показывает оставшиеся кадры." },
      "es": { "title": "Control desde navegador para plataformas PhotoPizza", "summary": "El navegador se conecta al controlador local por WebSocket para configurar la captura, iniciar o detener el movimiento y mostrar tomas restantes." }
    },
    "sourceLinks": [
      { "href": "https://github.com/PhotoPizza/remote", "label": "github.com" }
    ]
  },
  {
    "id": "pulse/photosnail-public-motion-control-object-tracking",
    "slug": "photosnail-public-motion-control-object-tracking",
    "kind": "research-note",
    "status": "published",
    "publishedAt": "2026-07-31T22:20:44Z",
    "updatedAt": null,
    "subjectPeriod": "2016",
    "relatedProjectIds": ["projects/photosnail-public"],
    "primaryProjectId": "projects/photosnail-public",
    "tags": [],
    "locales": {
      "en": { "title": "PhotoSnail: Implemented Motion and Planned Object Tracking", "summary": "The open motorized slider implements carriage movement and capture settings; object tracking, CV, and ML remain unevidenced plans." },
      "ru": { "title": "PhotoSnail: реализованное движение и задуманный трекинг", "summary": "Открытый моторизованный слайдер реализует движение каретки и настройки съёмки; object tracking, CV и ML остаются неподтверждёнными планами." },
      "es": { "title": "PhotoSnail: movimiento implementado y tracking previsto", "summary": "El deslizador motorizado implementa movimiento y ajustes de captura; object tracking, CV y ML siguen como planes no acreditados." }
    },
    "sourceLinks": [
      { "href": "https://github.com/PhotoSnail/public", "label": "github.com" }
    ]
  },
  {
    "id": "pulse/symbiote-node-package-workspace-migration",
    "slug": "symbiote-node-package-workspace-migration",
    "kind": "field-note",
    "status": "retired",
    "retirementTarget": "pulse/symbiote-node-retrospective",
    "publishedAt": null,
    "updatedAt": null,
    "subjectPeriod": "2026",
    "relatedProjectIds": ["projects/symbiote-node"],
    "primaryProjectId": "projects/symbiote-node",
    "tags": [],
    "locales": {
      "en": { "title": "Monorepo Migration Toolkit", "summary": "Strategies for package organization and migration tools during the decomposition of the Symbiote monorepo (UI/Engine)." },
      "ru": { "title": "Инструментарий миграции монорепозитория", "summary": "Стратегии организации пакетов и инструменты миграции при декомпозиции монорепозитория Symbiote (UI/Engine)." },
      "es": { "title": "Herramientas de Migración de Monorepositorios", "summary": "Estrategias para la organización de paquetes y herramientas de migración durante la descomposición del monorepo de Symbiote (UI/Engine)." }
    },
    "sourceLinks": []
  },
  {
    "id": "pulse/symbiote-video-studio-ai-video-editing-structures",
    "slug": "symbiote-video-studio-ai-video-editing-structures",
    "kind": "research-note",
    "status": "retired",
    "retirementTarget": "pulse/symbiote-video-studio-retrospective",
    "publishedAt": "2025-09-12T12:00:00Z",
    "updatedAt": null,
    "subjectPeriod": "2025",
    "relatedProjectIds": ["projects/symbiote-video-studio"],
    "primaryProjectId": "projects/symbiote-video-studio",
    "tags": [],
    "locales": {
      "en": { "title": "Data Structures for AI-Assisted Video Editing", "summary": "Prototyping tree-like data structures for analyzing and manipulating media in AI video editors." },
      "ru": { "title": "Структуры данных для AI-ассистированного видеомонтажа", "summary": "Прототипирование древовидных структур данных для анализа и манипуляций с медиа в AI-видеоредакторах." },
      "es": { "title": "Estructuras de Datos para la Edición de Video Asistida por IA", "summary": "Prototipado de estructuras de datos en árbol para el análisis y manipulación de medios en editores de video asistidos por IA." }
    },
    "sourceLinks": []
  },
  {
    "id": "pulse/terminal-x-mcp-terminal-execution-state",
    "slug": "terminal-x-mcp-terminal-execution-state",
    "kind": "field-note",
    "status": "published",
    "publishedAt": null,
    "updatedAt": null,
    "subjectPeriod": "2025",
    "relatedProjectIds": ["projects/terminal-x-mcp"],
    "primaryProjectId": "projects/terminal-x-mcp",
    "tags": [],
    "locales": {
      "en": { "title": "Terminal X Execution-State Contracts", "summary": "The prototype defines MCP schemas for command, monitoring, security, and workflow operations; its handlers remained placeholders." },
      "ru": { "title": "Контракты execution state в Terminal X", "summary": "Прототип задаёт MCP-схемы для command, monitoring, security и workflow operations; его handlers остались placeholders." },
      "es": { "title": "Contratos de estado de ejecución en Terminal X", "summary": "El prototipo define esquemas MCP para comando, monitoreo, seguridad y workflow; sus handlers quedaron como placeholders." }
    },
    "sourceLinks": [
      { "href": "https://github.com/rnd-pro/terminal-x-mcp", "label": "github.com" }
    ]
  }
];

export function validatePublication(pub) {
  if (!pub || typeof pub !== 'object') {
    throw new Error('Publication must be an object');
  }

  const requiredFields = [
    'id',
    'slug',
    'kind',
    'status',
    'publishedAt',
    'updatedAt',
    'subjectPeriod',
    'relatedProjectIds',
    'primaryProjectId',
    'tags',
    'sourceLinks',
    'locales'
  ];
  for (const field of requiredFields) {
    if (!(field in pub)) {
      throw new Error(`Publication must have a "${field}" field`);
    }
  }

  if (typeof pub.id !== 'string' || !pub.id.trim()) {
    throw new Error('Publication id must be a non-empty string');
  }
  if (typeof pub.slug !== 'string' || !pub.slug.trim()) {
    throw new Error('Publication slug must be a non-empty string');
  }
  if (typeof pub.kind !== 'string' || !pub.kind.trim()) {
    throw new Error('Publication kind must be a non-empty string');
  }
  if (typeof pub.status !== 'string' || !pub.status.trim()) {
    throw new Error('Publication status must be a non-empty string');
  }
  if (!Array.isArray(pub.tags)) {
    throw new Error(`Publication ${pub.id} tags must be an array`);
  }
  if (!Array.isArray(pub.sourceLinks)) {
    throw new Error(`Publication ${pub.id} sourceLinks must be an array`);
  }
  for (let sourceLink of pub.sourceLinks) {
    if (!isPlainObject(sourceLink)) {
      throw new Error(`Publication ${pub.id} sourceLinks must contain only plain objects`);
    }
    if (typeof sourceLink.label !== 'string' || !sourceLink.label.trim()) {
      throw new Error(`Publication ${pub.id} sourceLinks entries must have a non-empty label`);
    }
    if (typeof sourceLink.href !== 'string' || !sourceLink.href.trim()) {
      throw new Error(`Publication ${pub.id} sourceLinks entries must have a non-empty href`);
    }
    if ('summary' in sourceLink && typeof sourceLink.summary !== 'string') {
      throw new Error(`Publication ${pub.id} sourceLinks entry summary must be a string when present`);
    }
  }
  if (!Array.isArray(pub.relatedProjectIds)) {
    throw new Error(`Publication ${pub.id} relatedProjectIds must be an array`);
  }

  const allowedKinds = ['retrospective', 'update', 'release', 'research-note', 'field-note', 'article'];
  if (!allowedKinds.includes(pub.kind)) {
    throw new Error(`Publication ${pub.id} kind must be one of: ${allowedKinds.join(', ')}`);
  }

  if (pub.status !== 'published' && pub.status !== 'draft' && pub.status !== 'retired') {
    throw new Error(`Publication ${pub.id} status must be "published", "draft", or "retired"`);
  }

  if (pub.id !== `pulse/${pub.slug}`) {
    throw new Error(`Publication id "${pub.id}" must match format "pulse/\${slug}"`);
  }

  const seenProjIds = new Set();
  for (const projId of pub.relatedProjectIds) {
    if (typeof projId !== 'string') {
      throw new Error(`Publication ${pub.id} relatedProjectIds must contain only strings`);
    }
    if (seenProjIds.has(projId)) {
      throw new Error(`Publication ${pub.id} relatedProjectIds contains duplicate: "${projId}"`);
    }
    seenProjIds.add(projId);
    if (!projId.startsWith('projects/')) {
      throw new Error(`Publication ${pub.id} relatedProjectId "${projId}" must start with "projects/"`);
    }
    if (!canonicalProjectIdSet.has(projId)) {
      throw new Error(`Publication ${pub.id} references invalid project ID: "${projId}"`);
    }
  }

  if (pub.relatedProjectIds.length === 0) {
    if (pub.primaryProjectId !== undefined && pub.primaryProjectId !== null) {
      throw new Error(`Publication ${pub.id} is global (empty relatedProjectIds) and must not have a primaryProjectId`);
    }
  } else {
    if (pub.primaryProjectId !== undefined && pub.primaryProjectId !== null) {
      if (typeof pub.primaryProjectId !== 'string') {
        throw new Error(`Publication ${pub.id} primaryProjectId must be a string or null`);
      }
      if (!pub.relatedProjectIds.includes(pub.primaryProjectId)) {
        throw new Error(`Publication ${pub.id} primaryProjectId "${pub.primaryProjectId}" must be in relatedProjectIds`);
      }
    }
  }

  if (pub.publishedAt === null) {
    if (pub.status === 'published' && pub.kind !== 'retrospective' && pub.kind !== 'field-note') {
      throw new Error(`Publication ${pub.id} publishedAt is required for published non-retrospectives/field-notes`);
    }
    if ((pub.kind === 'retrospective' || pub.kind === 'field-note')
      && (typeof pub.subjectPeriod !== 'string' || !pub.subjectPeriod.trim())) {
      throw new Error(`Publication ${pub.id} is an undated retrospective/field-note and must have a non-empty subjectPeriod`);
    }
  } else if (!isValidTimezoneTimestamp(pub.publishedAt)) {
    throw new Error(`Publication ${pub.id} publishedAt must be a valid timezone-aware ISO date string or null`);
  }

  if (pub.updatedAt !== null && !isValidTimezoneTimestamp(pub.updatedAt)) {
    throw new Error(`Publication ${pub.id} updatedAt must be a valid timezone-aware ISO date string or null`);
  }

  if (pub.subjectPeriod !== undefined && pub.subjectPeriod !== null && typeof pub.subjectPeriod !== 'string') {
    throw new Error(`Publication ${pub.id} subjectPeriod must be a string or null`);
  }

  for (const tag of pub.tags) {
    if (typeof tag !== 'string') {
      throw new Error(`Publication ${pub.id} tags must contain only strings`);
    }
  }

  if (!pub.locales || typeof pub.locales !== 'object') {
    throw new Error(`Publication ${pub.id} must have a locales object`);
  }
  const requiredLocales = ['en', 'ru', 'es'];
  for (const locale of requiredLocales) {
    const loc = pub.locales[locale];
    if (!loc || typeof loc !== 'object') {
      throw new Error(`Publication ${pub.id} is missing locale "${locale}"`);
    }
    if (typeof loc.title !== 'string' || !loc.title.trim()) {
      throw new Error(`Publication ${pub.id} locale "${locale}" must have a non-empty title`);
    }
    if (typeof loc.summary !== 'string' || !loc.summary.trim()) {
      throw new Error(`Publication ${pub.id} locale "${locale}" must have a non-empty summary`);
    }
    if ('body' in loc && (typeof loc.body !== 'string' || !loc.body.trim())) {
      throw new Error(`Publication ${pub.id} locale "${locale}" body must be a non-empty string when present`);
    }
  }

  if (pub.status === 'retired') {
    if (!('retirementTarget' in pub) || pub.retirementTarget === undefined) {
      throw new Error(`Publication ${pub.id} is retired and must have a retirementTarget field`);
    }
    if (typeof pub.retirementTarget !== 'string' || !pub.retirementTarget.trim()) {
      throw new Error(`Publication ${pub.id} retirementTarget must be a non-empty string`);
    }
    if (!/^pulse\/[^/]+$/.test(pub.retirementTarget) && !isValidHttpsUrl(pub.retirementTarget)) {
      throw new Error(
        `Publication ${pub.id} retirementTarget must be a published pulse ID or a valid absolute HTTPS URL`,
      );
    }
  } else {
    if ('retirementTarget' in pub && pub.retirementTarget !== undefined) {
      throw new Error(`Publication ${pub.id} is not retired and must not have a retirementTarget`);
    }
  }

  return true;
}

export function validateAll(pubs) {
  const ids = new Set();
  const slugs = new Set();
  for (const pub of pubs) {
    validatePublication(pub);
    if (ids.has(pub.id)) {
      throw new Error(`Duplicate publication ID found: ${pub.id}`);
    }
    if (slugs.has(pub.slug)) {
      throw new Error(`Duplicate publication slug found: ${pub.slug}`);
    }
    ids.add(pub.id);
    slugs.add(pub.slug);
  }
  validateRetirementTargets(pubs);
  return true;
}

export function getPublicPublications(pubs = PUBLICATIONS) {
  return pubs.filter(pub => pub.status === 'published');
}

export function getPublicationContentPath(publication, locale = 'en') {
  const slug = String(publication?.slug || '').trim();
  const normalizedLocale = ['en', 'ru', 'es'].includes(locale) ? locale : 'en';
  if (!slug) throw new TypeError('Publication slug is required');
  return `content/publications/${slug}/${normalizedLocale}.md`;
}

export function getPublicationsByProject(projectId, pubs = PUBLICATIONS) {
  if (typeof projectId !== 'string' || !/^projects\/[^/]+$/.test(projectId)) {
    throw new Error('Project ID must use the canonical "projects/<slug>" format');
  }
  if (!canonicalProjectIdSet.has(projectId)) {
    throw new Error(`Unknown canonical project ID: "${projectId}"`);
  }
  return getPublicPublications(pubs).filter(pub => pub.relatedProjectIds.includes(projectId));
}

export function getLatestPublications(pubs = PUBLICATIONS) {
  return getPublicPublications(pubs)
    .filter(pub => pub.publishedAt !== null)
    .sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt) || a.id.localeCompare(b.id));
}

export function getRetiredPublications(pubs = PUBLICATIONS) {
  return pubs.filter(pub => pub.status === 'retired');
}

export function validateRetirementTargets(pubs = PUBLICATIONS) {
  let publishedIds = new Set(
    pubs.filter(p => p.status === 'published').map(p => p.id),
  );
  for (let pub of pubs) {
    if (pub.status !== 'retired') continue;
    let target = pub.retirementTarget;
    if (isValidHttpsUrl(target)) continue;
    if (typeof target !== 'string' || !/^pulse\/[^/]+$/.test(target)) {
      throw new Error(
        `Publication ${pub.id} retirementTarget "${target}" must be a published pulse ID or a valid absolute HTTPS URL`,
      );
    }
    if (!publishedIds.has(target)) {
      throw new Error(
        `Publication ${pub.id} retirementTarget "${target}" must reference a currently published publication`,
      );
    }
  }
  return true;
}

validateAll(PUBLICATIONS);
