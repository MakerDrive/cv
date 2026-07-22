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

export const PUBLICATIONS = [
  {
    "id": "pulse/agent-portal",
    "slug": "agent-portal",
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
    "sourceLinks": [],
    "locales": {
      "en": {
        "title": "Agent Portal: From Experiments to a Controlled Engineering Loop",
        "summary": "Agent Portal traces the loop-engineering line from agent experiments to a controlled operating loop for autonomous development work.",
        "body": "## Publication context\n\n- Public anchors: recent Agent Portal work documents card intake, isolated worktrees, delegated execution, completion proof, audit/rework cycles, release gates, cleanup, retry/backoff, and human escalation.\n- R&D point: the work defines an engineering loop where agent execution stays observable, reversible, and safe enough for real development tasks through evals, guardrails, and human-in-the-loop control.\n- Resource point: the board and resource groups route work across agents with different model tiers, so simpler work can run on cheaper/faster models while stronger models operate on distilled project context.\n- Context point: this is context engineering in practice — project memory, RAG-style retrieval, graph context, and tool use are shaped before agents execute.\n- Transition: this line connects the MCP tools, project graph, agent pool, browser automation, and team memory into one product surface."
      },
      "ru": {
        "title": "Agent Portal: от экспериментов к управляемому инженерному циклу",
        "summary": "Agent Portal раскрывает линию loop engineering: от экспериментов с агентами к управляемому циклу автономной разработки.",
        "body": "## Контекст публикаций\n\n- Публичные источники: последние работы по Agent Portal фиксируют вход задачи через карточку, изолированные worktree, делегированное выполнение, completion proof, audit/rework циклы, release gates, cleanup, retry/backoff и выход к человеку.\n- R&D-задача: работа формирует инженерный процесс, где агентное выполнение остаётся наблюдаемым, обратимым и достаточно безопасным для реальных задач разработки через evals, guardrails и human-in-the-loop контроль.\n- Ресурсный фокус: доска и resource groups распределяют работу между агентами с разными уровнями моделей, чтобы простые задачи уходили к более дешёвым/быстрым моделям, а сильные модели работали со сжатым контекстом проекта.\n- Контекстный фокус: это context engineering на практике — проектная память, RAG-style retrieval, графовый контекст и tool use подбираются до запуска агентов.\n- Связь: эта линия собирает MCP-инструменты, граф проекта, agent pool, браузерную автоматизацию и team memory в один продуктовый интерфейс."
      },
      "es": {
        "title": "Agent Portal: de experimentos a un circuito de ingeniería controlado",
        "summary": "Agent Portal recorre la línea de loop engineering: de experimentos con agentes a un circuito controlado para desarrollo autónomo.",
        "body": "## Contexto de publicación\n\n- Anclas públicas: el trabajo reciente de Agent Portal documenta entrada por tarjeta, worktrees aislados, ejecución delegada, completion proof, ciclos audit/rework, release gates, cleanup, retry/backoff y escalado humano.\n- Punto I+D: el trabajo define un circuito de ingeniería donde la ejecución con agentes sigue observable, reversible y suficientemente segura para tareas reales de desarrollo mediante evals, guardrails y control human-in-the-loop.\n- Punto de recursos: el tablero y los resource groups enrutan trabajo entre agentes con distintos niveles de modelo, para que tareas simples usen modelos más baratos/rápidos y modelos más fuertes trabajen con contexto destilado del proyecto.\n- Punto de contexto: esto es context engineering en práctica — memoria de proyecto, RAG-style retrieval, contexto de grafo y tool use se preparan antes de ejecutar agentes.\n- Transición: esta línea une herramientas MCP, grafo de proyecto, agent pool, automatización de navegador y team memory en una sola superficie de producto."
      }
    }
  },
  {
    "id": "pulse/symbiote-video-studio",
    "slug": "symbiote-video-studio",
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
    "sourceLinks": [],
    "locales": {
      "en": {
        "title": "Symbiote Video Studio: AI-Assisted Editing as a Testbed",
        "summary": "Video production serves as a testbed for AI-assisted editing, structure, and repeatable workflow design in the media-tooling branch.",
        "body": "## Publication context\n\n- Public anchor: this branch is represented in the portfolio as a product-media R&D surface.\n- R&D point: video work exposes the same constraints as other tools — messy source material, stateful editing decisions, review loops, and interfaces that keep process visible.\n- Transition: the experiments inform the broader product-interface line around AI-assisted media systems."
      },
      "ru": {
        "title": "Symbiote Video Studio: ИИ-помощь как полигон видеопроизводства",
        "summary": "Видеопроизводство служит полигоном для ИИ-помощи, структуры монтажа и повторяемых процессов в линии медиа-инструментов.",
        "body": "## Контекст публикаций\n\n- Публичный источник: эта ветка представлена в портфолио как R&D-направление для продуктовых медиа.\n- R&D-задача: видео быстро показывает те же ограничения, что и другие инструменты: хаотичные исходники, состояние правок, циклы ревью и необходимость интерфейса, который удерживает процесс видимым.\n- Связь: эксперименты питают более широкую линию продуктовых интерфейсов и ИИ-помощи в медиа-системах."
      },
      "es": {
        "title": "Symbiote Video Studio: edición asistida por IA como campo de prueba",
        "summary": "La producción de video sirve como campo de prueba para asistencia de IA, estructura de edición y flujos repetibles en la línea de herramientas multimedia.",
        "body": "## Contexto de publicación\n\n- Ancla pública: esta rama se presenta en el portafolio como superficie I+D de medios de producto.\n- Punto I+D: el video expone las mismas restricciones que otras herramientas: material fuente desordenado, decisiones de edición con estado, ciclos de revisión e interfaces que mantienen visible el proceso.\n- Transición: los experimentos alimentan la línea más amplia de interfaces de producto y sistemas multimedia asistidos por IA."
      }
    }
  },
  {
    "id": "pulse/autobox-v1",
    "slug": "autobox-v1",
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
    "sourceLinks": [],
    "locales": {
      "en": {
        "title": "AUTOBOX v1: A Repeatable Museum-Scanning Process",
        "summary": "AUTOBOX v1 combines equipment, light, capture protocol, and production process for cultural-heritage digitization.",
        "body": "## Publication context\n\n- Public anchors: the RND-PRO AUTOBOX v1 and Netsuke articles are later editorial writeups; OBJET.art video materials provide public continuity for the cultural-heritage scanning direction.\n- R&D point: the core work was turning photogrammetry into a repeatable museum process: multi-angle capture, custom light, color fidelity, object handling, field scanning, and 3D post-production handoff.\n- Transition: PhotoPizza and ComplexScan supplied the motion-control and capture-automation base; AUTOBOX moved that line into higher-fidelity museum-grade validation."
      },
      "ru": {
        "title": "AUTOBOX v1: повторяемый процесс музейного сканирования",
        "summary": "AUTOBOX v1 объединяет оборудование, свет, протокол съёмки и рабочий процесс для оцифровки культурного наследия.",
        "body": "## Контекст публикаций\n\n- Публичные источники: статьи RND-PRO про AUTOBOX v1 и нэцкэ были опубликованы позже самой работы; материалы OBJET.art дают публичную преемственность cultural-heritage направления.\n- R&D-задача: ключевая задача состояла в превращении фотограмметрии в повторяемый музейный процесс: многоракурсная съемка, кастомный свет, точный цвет, обращение с объектами, выездные сканирования и передача в 3D-постобработку.\n- Связь: PhotoPizza и ComplexScan дали базу управления движением и автоматизации съемки; AUTOBOX перенес эту линию в музейную валидацию более высокого качества."
      },
      "es": {
        "title": "AUTOBOX v1: un proceso repetible de escaneo museístico",
        "summary": "AUTOBOX v1 combina equipo, iluminación, protocolo de captura y proceso de producción para digitalización patrimonial.",
        "body": "## Contexto de publicación\n\n- Anclas públicas: los artículos de RND-PRO sobre AUTOBOX v1 y netsuke son publicaciones posteriores; materiales de OBJET.art muestran continuidad pública de la dirección cultural-heritage.\n- Punto I+D: el trabajo central fue convertir la fotogrametría en un proceso museístico repetible: captura multiángulo, luz a medida, color fiel, manejo de objetos, escaneo en campo y traspaso a postproducción 3D.\n- Transición: PhotoPizza y ComplexScan dieron la base de control de movimiento y automatización de captura; AUTOBOX llevó esa línea a validación museística de mayor fidelidad."
      }
    }
  },
  {
    "id": "pulse/f360-studio",
    "slug": "f360-studio",
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
    "sourceLinks": [],
    "locales": {
      "en": {
        "title": "F360 Studio: Museum-Grade Capture in a Commercial Workflow",
        "summary": "F360 Studio carried high-precision 3D scanning into a commercial workflow after the museum-scanning work.",
        "body": "## Publication context\n\n- Public anchors: the F360 YouTube channel documents capture and photogrammetry work; the Sketchfab profile preserves published 3D models.\n- R&D point: the studio brought museum-grade capture discipline into a commercial workflow spanning physical setup, source-image quality, geometry, textures, and final presentation.\n- Transition: F360 operated in 2021-2022 after the museum-scanning work and alongside the continuing PhotoPizza and ComplexScan lines, until the relocation from Russia to Argentina."
      },
      "ru": {
        "title": "F360 Studio: музейная дисциплина съёмки в коммерческом процессе",
        "summary": "F360 Studio перенесла высокоточное 3D-сканирование в коммерческий процесс после музейных проектов.",
        "body": "## Контекст публикаций\n\n- Публичные источники: YouTube-канал F360 документирует съёмку и фотограмметрию; профиль Sketchfab сохраняет опубликованные 3D-модели.\n- R&D-задача: студия перенесла дисциплину музейной съёмки в коммерческий процесс, объединявший физическую установку, качество исходных фотографий, геометрию, текстуры и финальную презентацию.\n- Связь: F360 работала в 2021–2022 годах после музейной линии и параллельно с продолжавшимися PhotoPizza и ComplexScan — до переезда из России в Аргентину."
      },
      "es": {
        "title": "F360 Studio: captura de nivel museo en un flujo comercial",
        "summary": "F360 Studio llevó el escaneo 3D de alta precisión a un flujo comercial después del trabajo para museos.",
        "body": "## Contexto de publicación\n\n- Anclas públicas: el canal de YouTube de F360 documenta captura y fotogrametría; el perfil de Sketchfab conserva modelos 3D publicados.\n- Punto I+D: el estudio llevó la disciplina de captura museística a un flujo comercial que integraba equipo físico, calidad de imágenes fuente, geometría, texturas y presentación final.\n- Transición: F360 operó en 2021-2022 después del trabajo para museos y en paralelo con PhotoPizza y ComplexScan, que seguían activos, hasta el traslado de Rusia a Argentina."
      }
    }
  },
  {
    "id": "pulse/complexscan",
    "slug": "complexscan",
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
    "sourceLinks": [],
    "locales": {
      "en": {
        "title": "ComplexScan: From Open Hardware to a Manufacturable Scan System",
        "summary": "ComplexScan marks a commercial hardware step between open-source PhotoPizza and museum-grade scanning systems.",
        "body": "## Publication context\n\n- Public anchors: 2019 video materials show the glass turntable, web control, camera sync, laser centering, and axis-stability tests; the later RND-PRO article summarizes the commercial product story.\n- R&D point: the project moved from DIY/open hardware to a manufacturable transparent-disc system for 3D scanning, 360 capture, and product photography.\n- Transition: the product line started commercial shipments and production setup, then became part of the technical bridge toward AUTOBOX-class systems."
      },
      "ru": {
        "title": "ComplexScan: от open hardware к производимой системе сканирования",
        "summary": "ComplexScan стал коммерческим шагом между open-source PhotoPizza и музейными системами сканирования.",
        "body": "## Контекст публикаций\n\n- Публичные источники: видео 2019 года показывают стеклянный поворотный стол, web-управление, синхронизацию камеры, лазерное центрирование и проверки стабильности оси; поздняя статья RND-PRO собирает продуктовую историю.\n- R&D-задача: проект перешёл от DIY/open hardware к производимой системе с прозрачным диском для 3D-сканирования, 360-съемки и предметной фотографии.\n- Связь: продуктовая линия дошла до первых поставок и наладки производства, а затем стала техническим мостом к системам уровня AUTOBOX."
      },
      "es": {
        "title": "ComplexScan: de open hardware a un sistema de escaneo fabricable",
        "summary": "ComplexScan marca un paso comercial de hardware entre PhotoPizza open-source y sistemas de escaneo de nivel museo.",
        "body": "## Contexto de publicación\n\n- Anclas públicas: videos de 2019 muestran la mesa de vidrio, control web, sincronización de cámara, centrado láser y pruebas de estabilidad de eje; el artículo posterior de RND-PRO resume la historia de producto.\n- Punto I+D: el proyecto pasó de DIY/open hardware a un sistema fabricable con disco transparente para escaneo 3D, captura 360 y fotografía de producto.\n- Transición: la línea llegó a primeros envíos y preparación de producción, y luego se volvió puente técnico hacia sistemas tipo AUTOBOX."
      }
    }
  },
  {
    "id": "pulse/boothbot",
    "slug": "boothbot",
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
    "sourceLinks": [],
    "locales": {
      "en": {
        "title": "BoothBot: Warehouse Capture as an Automated Process",
        "summary": "BoothBot applies warehouse automation through equipment, light, motion, and processing built around a client process.",
        "body": "## Publication context\n\n- Public anchor: BoothBot is represented as a project page; independent social/date evidence still needs manual confirmation before using exact chronology.\n- R&D point: the project automated a practical client workflow: reflective wine bottles on a warehouse site, controlled light, camera movement, operator simplicity, and automated catalog output.\n- Transition: BoothBot is an important branch of the equipment and control-software R&D line, showing how the same method applies outside 3D scanning and 360 media to ordinary production processes."
      },
      "ru": {
        "title": "BoothBot: автоматизация предметной съёмки на складе",
        "summary": "BoothBot применяет складскую автоматизацию через оборудование, свет, движение и обработку вокруг процесса клиента.",
        "body": "## Контекст публикаций\n\n- Публичный источник: BoothBot представлен проектной страницей; независимые даты из соцсетей стоит подтверждать отдельно перед точной хронологией.\n- R&D-задача: проект автоматизировал практический процесс у клиента: бутылки на складе, управляемый свет, движение камеры, простая эксплуатация и автоматическая выдача каталожных изображений.\n- Связь: кейс показывает, что метод аппаратной автоматизации применим к 3D-сканированию, 360-медиа и обычным производственным процессам."
      },
      "es": {
        "title": "BoothBot: captura de almacén como proceso automatizado",
        "summary": "BoothBot aplica automatización de almacén mediante equipo, luz, movimiento y procesamiento alrededor de un proceso del cliente.",
        "body": "## Contexto de publicación\n\n- Ancla pública: BoothBot está representado por una página de proyecto; fechas independientes de redes deberían confirmarse antes de usarlas en una cronología exacta.\n- Punto I+D: el proyecto automatizó un flujo real en cliente: botellas en almacén, luz controlada, movimiento de cámara, operación simple y salida automática para catálogo.\n- Transición: el caso muestra que el método de automatización con hardware aplica a 3D/360 y a procesos productivos ordinarios."
      }
    }
  },
  {
    "id": "pulse/photopizza",
    "slug": "photopizza",
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
    "sourceLinks": [],
    "locales": {
      "en": {
        "title": "PhotoPizza: From MEGAVISOR Prototype to Open-Source Platform",
        "summary": "PhotoPizza grew from a hardware line born inside MEGAVISOR into an open-source platform for capture and scanning experiments.",
        "body": "## Publication context\n\n- Public anchors: early 2013 video tutorials, the 2015 DIY GitHub repository, the 2017 JavaScript/control repository, the PhotoPizza YouTube channel, and the full diy.photopizza publication history document the project evolution.\n- Attribution: inside MEGAVISOR, Vladimir defined the capture logic and equipment requirements while the first Arduino controller software was implemented by a contracted specialist; after MEGAVISOR, Vladimir personally began developing control software in JavaScript/Espruino.\n- R&D point: the project tested low-cost repeatable motion, camera synchronization, firmware/control units, browser control, documentation, and practical photogrammetry workflows.\n- Transition: PhotoPizza became the base for ComplexScan, AUTOBOX, BoothBot-class production automation, and later maintenance work such as the Android support path for users who lost the IR remote."
      },
      "ru": {
        "title": "PhotoPizza: от прототипа MEGAVISOR к open-source платформе",
        "summary": "PhotoPizza выросла из аппаратной линии внутри MEGAVISOR в open-source платформу для съёмки и сканирования.",
        "body": "## Контекст публикаций\n\n- Публичные источники: ранние видео 2013 года, DIY-репозиторий 2015 года, JavaScript/control репозиторий 2017 года, YouTube-канал PhotoPizza и полная история diy.photopizza показывают эволюцию проекта.\n- R&D-задача: проект проверял доступное повторяемое движение, синхронизацию камеры, контроллеры и прошивки, браузерное управление, документацию и практические фотограмметрические процессы.\n- Связь: PhotoPizza стала базой для ComplexScan, экспериментов AUTOBOX и более поздней поддержки пользователей, включая Android-путь для случая с потерянным IR-пультом."
      },
      "es": {
        "title": "PhotoPizza: del prototipo de MEGAVISOR a una plataforma open-source",
        "summary": "PhotoPizza creció de una línea de hardware nacida dentro de MEGAVISOR a una plataforma open-source para captura y escaneo.",
        "body": "## Contexto de publicación\n\n- Anclas públicas: videos tempranos de 2013, repositorio DIY de 2015, repositorio JavaScript/control de 2017, canal de YouTube PhotoPizza y el historial diy.photopizza documentan la evolución.\n- Punto I+D: el proyecto probó movimiento repetible de bajo costo, sincronización de cámara, controladores/firmware, browser-control, documentación y flujos prácticos de fotogrametría.\n- Transición: PhotoPizza se volvió base para ComplexScan, experimentos AUTOBOX y soporte posterior a usuarios, incluido el camino Android para un caso de pérdida del control IR."
      }
    }
  },
  {
    "id": "pulse/megavisor",
    "slug": "megavisor",
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
    "sourceLinks": [],
    "locales": {
      "en": {
        "title": "MEGAVISOR: Where Capture R&D Became a Product Line",
        "summary": "MEGAVISOR is the starting product-platform context where capture-side R&D became a separate hardware and software line.",
        "body": "## Publication context\n\n- Public anchors: LinkedIn career data, older Facebook/YouTube evidence, and the RND-PRO project page place MEGAVISOR before the later PhotoPizza and ComplexScan line.\n- R&D point: the product needed reliable 360-media production in real client warehouses, so the work covered capture technology, light, automation, photographers, and field process design.\n- Transition: PhotoPizza was invented inside this constraint and then continued independently as open-source hardware/software."
      },
      "ru": {
        "title": "MEGAVISOR: как съёмочная R&D стала продуктовой линией",
        "summary": "MEGAVISOR стал стартовым продуктовым контекстом, где съёмочная R&D-линия отделилась в оборудование и софт.",
        "body": "## Контекст публикаций\n\n- Публичные источники: LinkedIn-опыт, старые Facebook/YouTube-материалы и проектная страница RND-PRO помещают MEGAVISOR до последующей линии PhotoPizza и ComplexScan.\n- R&D-задача: продукту требовался надежный рабочий процесс 360-медиа на складах клиентов, поэтому работа включала технологию съемки, свет, автоматизацию, фотографов и организацию выездного процесса.\n- Связь: PhotoPizza была придумана внутри этого ограничения и затем продолжилась как самостоятельный open-source проект на стыке оборудования и софта."
      },
      "es": {
        "title": "MEGAVISOR: donde la I+D de captura se volvió una línea de producto",
        "summary": "MEGAVISOR fue el contexto inicial de plataforma de producto donde la línea de captura se separó en hardware y software.",
        "body": "## Contexto de publicación\n\n- Anclas públicas: experiencia en LinkedIn, evidencias antiguas de Facebook/YouTube y la página de RND-PRO sitúan MEGAVISOR antes de PhotoPizza y ComplexScan.\n- Punto I+D: el producto necesitaba un proceso confiable de producción 360 en almacenes de clientes, así que el trabajo cubría tecnología de captura, luz, automatización, fotógrafos y operación en campo.\n- Transición: PhotoPizza nació dentro de esa restricción y continuó como proyecto open-source independiente de hardware/software."
      }
    }
  },
  {
    "id": "pulse/mcp-agent-portal",
    "slug": "mcp-agent-portal",
    "kind": "retrospective",
    "status": "published",
    "publishedAt": null,
    "updatedAt": null,
    "subjectPeriod": "2026",
    "relatedProjectIds": [
      "projects/mcp-agent-portal"
    ],
    "primaryProjectId": "projects/mcp-agent-portal",
    "tags": [],
    "sourceLinks": [],
    "locales": {
      "en": {
        "title": "MCP Agent Portal: An Open Control Plane for Agent Experiments",
        "summary": "The open MCP control-plane experiment supports the Agent Portal product line and its agent workflows.",
        "body": "## Publication context\n\n- Public anchor: the repository and npm package expose the control-plane layer separately from the larger Agent Portal product.\n- R&D point: the experiment asks what context, tools, and browser operations an agent needs before it can work reliably inside a project.\n- Transition: the findings feed into the product portal, where the MCP layer becomes part of a broader orchestration environment."
      },
      "ru": {
        "title": "MCP Agent Portal: открытый контур управления агентными экспериментами",
        "summary": "Открытый MCP-контур управления поддерживает продуктовую линию Agent Portal и её агентные процессы.",
        "body": "## Контекст публикаций\n\n- Публичный источник: репозиторий и npm-пакет показывают контур управления отдельно от более крупного продукта Agent Portal.\n- R&D-задача: эксперимент отвечает на вопрос, какой контекст, инструменты и браузерные операции нужны агенту, прежде чем он сможет надежно работать внутри проекта.\n- Связь: выводы переходят в продуктовый портал, где MCP-слой становится частью общей среды оркестрации."
      },
      "es": {
        "title": "MCP Agent Portal: un plano de control abierto para experimentos con agentes",
        "summary": "El experimento abierto de control plane MCP sostiene la línea de producto Agent Portal y sus flujos con agentes.",
        "body": "## Contexto de publicación\n\n- Ancla pública: el repositorio y paquete npm muestran la capa control-plane separada del producto Agent Portal más amplio.\n- Punto I+D: el experimento pregunta qué contexto, herramientas y operaciones de navegador necesita un agente antes de trabajar de forma fiable dentro de un proyecto.\n- Transición: los aprendizajes pasan al portal, donde la capa MCP se integra en un entorno de orquestación más amplio."
      }
    }
  },
  {
    "id": "pulse/project-graph-mcp",
    "slug": "project-graph-mcp",
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
    "sourceLinks": [],
    "locales": {
      "en": {
        "title": "Project Graph MCP: Compact Codebase Context for Agents",
        "summary": "Project graphs provide compact context for agents working inside real codebases.",
        "body": "## Publication context\n\n- Public anchor: the repository/npm line makes the code-intelligence layer visible as a standalone MCP tool.\n- R&D point: raw files are too noisy for agent work, so the project tests graph summaries, dependency structure, code skeletons, and evidence as more useful context.\n- Context point: the practical framing is GraphRAG-style retrieval and 10-50x reduction for structural project data, where a faster model can extract structure and a stronger model can reason over the compact graph.\n- Transition: this became one of the context sources inside the Agent Portal and loop-engineering workflow."
      },
      "ru": {
        "title": "Project Graph MCP: компактный контекст кодовой базы для агентов",
        "summary": "Графы проекта дают компактный контекст агентам, работающим в реальных кодовых базах.",
        "body": "## Контекст публикаций\n\n- Публичный источник: репозиторий/npm-линия делает слой кодовой аналитики видимым как отдельный MCP-инструмент.\n- R&D-задача: сырые файлы слишком шумные для агентной работы, поэтому проект проверяет графовые сводки, структуру зависимостей, скелет кода и проверяемые факты как более полезный контекст.\n- Контекстный фокус: на практике это GraphRAG-style retrieval и сокращение структурного контекста проекта в 10-50 раз, где быстрая модель извлекает структуру, а более сильная рассуждает по компактному графу.\n- Связь: это стало одним из источников контекста внутри Agent Portal и loop-engineering процесса."
      },
      "es": {
        "title": "Project Graph MCP: contexto compacto de codebase para agentes",
        "summary": "Los grafos de proyecto aportan contexto compacto a agentes que trabajan en codebases reales.",
        "body": "## Contexto de publicación\n\n- Ancla pública: la línea repo/npm hace visible la capa de code intelligence como herramienta MCP independiente.\n- Punto I+D: los archivos crudos son demasiado ruidosos para agentes, así que el proyecto prueba summaries de grafo, estructura de dependencias, skeletons de código y evidencia como contexto más útil.\n- Punto de contexto: en la práctica esto es GraphRAG-style retrieval y reducción de 10-50x para datos estructurales del proyecto, donde un modelo rápido extrae estructura y un modelo más fuerte razona sobre el grafo compacto.\n- Transición: esto se volvió una de las fuentes de contexto dentro de Agent Portal y del flujo de loop engineering."
      }
    }
  },
  {
    "id": "pulse/agent-pool-mcp",
    "slug": "agent-pool-mcp",
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
    "sourceLinks": [],
    "locales": {
      "en": {
        "title": "Agent Pool MCP: Delegation with Visible Ownership",
        "summary": "Agent Pool MCP delegates CLI work to multiple agents while preserving ownership, state, and verification.",
        "body": "## Publication context\n\n- Public anchor: the Agent Pool package documents the execution layer for multi-agent work.\n- R&D point: delegation is only useful when ownership, process state, outputs, and failure modes are visible enough for an orchestrator to decide what to do next.\n- Execution point: background workers, cross-model consensus, pipelines, bounce-back feedback, session handoff, policies, and groups make it practical to spend stronger model attention on decisions and cheaper/faster workers on research, structure extraction, routine implementation, validation, and eval-style checks.\n- Transition: this line supports Agent Portal task routing and controlled parallel development loops."
      },
      "ru": {
        "title": "Agent Pool MCP: делегирование с видимым владением",
        "summary": "Agent Pool MCP делегирует CLI-работу нескольким агентам, сохраняя владение, состояние и проверяемость.",
        "body": "## Контекст публикаций\n\n- Публичный источник: пакет Agent Pool документирует исполняющий слой для многоагентной работы.\n- R&D-задача: делегирование полезно только тогда, когда владение задачей, состояние процесса, результаты и сбои достаточно видимы для следующего решения оркестратора.\n- Исполнительный фокус: фоновые воркеры, кросс-модельный консенсус, пайплайны, bounce-back feedback, handoffs, политики и группы позволяют тратить внимание сильных моделей на решения, а более дешёвым/быстрым воркерам отдавать исследование, извлечение структуры, рутинную реализацию, валидацию и eval-style проверки.\n- Связь: эта линия поддерживает маршрутизацию задач Agent Portal и контролируемые параллельные циклы разработки."
      },
      "es": {
        "title": "Agent Pool MCP: delegación con ownership visible",
        "summary": "Agent Pool MCP delega trabajo CLI a varios agentes manteniendo ownership, estado y verificación.",
        "body": "## Contexto de publicación\n\n- Ancla pública: el paquete Agent Pool documenta la capa de ejecución para trabajo multi-agente.\n- Punto I+D: delegar solo sirve cuando ownership, estado del proceso, resultados y fallos son suficientemente visibles para la siguiente decisión del orquestador.\n- Punto de ejecución: workers en segundo plano, consenso entre modelos, pipelines, feedback bounce-back, handoffs, políticas y grupos permiten invertir la atención de los modelos más fuertes en decisiones y workers más baratos/rápidos en investigación, extracción de estructura, implementación rutinaria, validación y checks tipo eval.\n- Transición: esta línea soporta enrutamiento de tareas en Agent Portal y ciclos paralelos controlados de desarrollo."
      }
    }
  },
  {
    "id": "pulse/browser-x-mcp",
    "slug": "browser-x-mcp",
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
    "sourceLinks": [],
    "locales": {
      "en": {
        "title": "Browser X MCP: Browser Automation as Agent Evidence",
        "summary": "Browser automation captures verifiable page and interface evidence for agents.",
        "body": "## Publication context\n\n- Public anchor: Browser X belongs to the 2025 public MCP tooling line.\n- R&D point: agents need reliable page inspection, form interaction, screenshots, structured browser evidence, and UI evals to verify UI work from live page state.\n- Transition: the browser layer feeds observability, testing, portfolio verification, and Agent Portal workflows."
      },
      "ru": {
        "title": "Browser X MCP: браузерная автоматизация как доказательство для агентов",
        "summary": "Браузерная автоматизация собирает проверяемые факты о страницах и интерфейсах для агентов.",
        "body": "## Контекст публикаций\n\n- Публичный источник: Browser X относится к публичной MCP-линии инструментов 2025 года.\n- R&D-задача: агентам нужна надежная инспекция страниц, работа с формами, скриншоты, structured browser evidence и UI evals для проверки интерфейса по состоянию живой страницы.\n- Связь: браузерный слой используется в observability, тестировании, проверке портфолио и рабочих процессах Agent Portal."
      },
      "es": {
        "title": "Browser X MCP: automatización del navegador como evidencia para agentes",
        "summary": "La automatización del navegador captura evidencia verificable de páginas e interfaces para agentes.",
        "body": "## Contexto de publicación\n\n- Ancla pública: Browser X pertenece a la línea pública de herramientas MCP de 2025.\n- Punto I+D: los agentes necesitan inspección fiable de páginas, formularios, screenshots, structured browser evidence y UI evals para verificar interfaces desde el estado real de la página.\n- Transición: la capa de navegador alimenta observability, pruebas, verificación del portafolio y flujos de Agent Portal."
      }
    }
  },
  {
    "id": "pulse/context-x-mcp",
    "slug": "context-x-mcp",
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
    "sourceLinks": [],
    "locales": {
      "en": {
        "title": "Context X MCP: Choosing Context Before Execution",
        "summary": "Context selection prepares the right memory, files, and tool surface before a task executes.",
        "body": "## Publication context\n\n- Public anchor: Context X is one of the public MCP tools from the early agent-tooling line.\n- R&D point: many agent failures start before execution, when the task shape, project memory, and relevant files are selected poorly.\n- Retrieval point: this is the RAG-style/context-engineering layer that selects project memory, files, and tool surfaces before execution.\n- Transition: this became part of the broader team-memory and orchestrated-agent workflow."
      },
      "ru": {
        "title": "Context X MCP: выбор контекста до выполнения",
        "summary": "Выбор контекста подготавливает правильную память, файлы и набор инструментов до выполнения задачи.",
        "body": "## Контекст публикаций\n\n- Публичный источник: Context X — один из публичных MCP-инструментов ранней агентной линии.\n- R&D-задача: многие сбои агентов начинаются до выполнения, когда форма задачи, проектная память и релевантные файлы выбраны плохо.\n- Retrieval-фокус: это RAG-style/context-engineering слой, который подбирает проектную память, файлы и tool surface до выполнения.\n- Связь: эта идея стала частью более широкой практики team memory и оркестрации агентов."
      },
      "es": {
        "title": "Context X MCP: elegir el contexto antes de ejecutar",
        "summary": "La selección de contexto prepara la memoria, los archivos y las herramientas correctas antes de ejecutar una tarea.",
        "body": "## Contexto de publicación\n\n- Ancla pública: Context X es una de las herramientas MCP públicas de la primera línea de agentes.\n- Punto I+D: muchos fallos de agentes empiezan antes de ejecutar, cuando la forma de la tarea, la memoria del proyecto y los archivos relevantes se eligen mal.\n- Punto de retrieval: es una capa RAG-style/context-engineering que selecciona memoria de proyecto, archivos y tool surface antes de ejecutar.\n- Transición: la idea pasó a una práctica más amplia de team-memory y agentes orquestados."
      }
    }
  },
  {
    "id": "pulse/terminal-x-mcp",
    "slug": "terminal-x-mcp",
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
    "sourceLinks": [],
    "locales": {
      "en": {
        "title": "Terminal X MCP: Observable Command Execution for Agents",
        "summary": "Terminal automation provides planned command execution, validation, observability, and agent-safe feedback.",
        "body": "## Publication context\n\n- Public anchor: Terminal X is part of the public MCP toolset for agent execution environments.\n- R&D point: command execution needs planning, monitoring, observability, error capture, structured reporting, and a visible control boundary around verification runs.\n- Transition: the pattern later appears in Agent Portal gates, audits, and cleanup flows."
      },
      "ru": {
        "title": "Terminal X MCP: наблюдаемое выполнение команд для агентов",
        "summary": "Терминальная автоматизация обеспечивает плановое выполнение команд, валидацию, observability и безопасную обратную связь агентам.",
        "body": "## Контекст публикаций\n\n- Публичный источник: Terminal X входит в публичный MCP-набор для сред выполнения агентов.\n- R&D-задача: выполнение команд требует планирования, мониторинга, observability, снятия ошибок, структурированного отчёта и видимой границы контроля вокруг проверочных запусков.\n- Связь: тот же паттерн позже появляется в гейтах, аудитах и cleanup-процессах Agent Portal."
      },
      "es": {
        "title": "Terminal X MCP: ejecución observable de comandos para agentes",
        "summary": "La automatización de terminal aporta ejecución planificada, validación, observability y feedback seguro para agentes.",
        "body": "## Contexto de publicación\n\n- Ancla pública: Terminal X forma parte del conjunto MCP público para entornos de ejecución de agentes.\n- Punto I+D: ejecutar comandos requiere planificación, monitoreo, observability, captura de errores, informes estructurados y un límite visible de control alrededor de las verificaciones.\n- Transición: el mismo patrón aparece luego en gates, audits y cleanup flows de Agent Portal."
      }
    }
  },
  {
    "id": "pulse/symbiote-workspace",
    "slug": "symbiote-workspace",
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
    "sourceLinks": [],
    "locales": {
      "en": {
        "title": "Symbiote Workspace: Connecting UI and Engine",
        "summary": "Symbiote Workspace is the active product surface connecting Symbiote UI and Symbiote Engine.",
        "body": "## Publication context\n\n- Public anchor: the Symbiote Workspace branch is a current RND-PRO project line connected to agent-built interfaces.\n- R&D point: the experiment is about product surfaces that agents can assemble and reason about, with durable state, reusable graph structure, and shareable artifacts.\n- Transition: it connects Symbiote UI, graph state, Symbiote Engine, and Agent Portal work into a workspace model; Symbiote Node shows the earlier package-organization layer behind this line."
      },
      "ru": {
        "title": "Symbiote Workspace: связь интерфейса и движка",
        "summary": "Symbiote Workspace служит активным продуктовым интерфейсом, связывающим Symbiote UI и Symbiote Engine.",
        "body": "## Контекст публикаций\n\n- Публичный источник: ветка Symbiote Workspace — текущая RND-PRO линия, связанная с интерфейсами, которые могут собирать агенты.\n- R&D-задача: эксперимент про продуктовые интерфейсы, которые агенты могут собирать и понимать: долговременное состояние, переиспользуемая структура графа и переносимые артефакты.\n- Связь: эта ветка связывает Symbiote UI, состояние графа, Symbiote Engine и portal-работу в модель рабочего пространства; Symbiote Node показывает ранний слой пакетной организации этой линии."
      },
      "es": {
        "title": "Symbiote Workspace: conexión entre interfaz y motor",
        "summary": "Symbiote Workspace funciona como superficie de producto activa que conecta Symbiote UI y Symbiote Engine.",
        "body": "## Contexto de publicación\n\n- Ancla pública: Symbiote Workspace es una línea actual de RND-PRO conectada con interfaces que pueden construir agentes.\n- Punto I+D: el experimento trata sobre superficies de producto que agentes pueden componer y entender: estado durable, estructura de grafo reutilizable y artefactos compartibles.\n- Transición: conecta Symbiote UI, estado de grafo, Symbiote Engine y trabajo de portal en un modelo de workspace; Symbiote Node muestra la capa temprana de organización de paquetes de esta línea."
      }
    }
  },
  {
    "id": "pulse/symbiote-ui",
    "slug": "symbiote-ui",
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
    "sourceLinks": [],
    "locales": {
      "en": {
        "title": "Symbiote UI: Web Components as Agent Contracts",
        "summary": "Web Components and provider metadata form the UI contract for products assembled by agents.",
        "body": "## Publication context\n\n- Public anchor: the Symbiote UI package/repository exposes the reusable UI layer used by this CV and related RND-PRO interfaces.\n- R&D point: agents need UI primitives with discoverable contracts, structured UI metadata, predictable behavior, and reusable composition rules.\n- Transition: the component layer supports Agent Portal, CV portfolio surfaces, graph tools, trees, layout panels, and future WebMCP-facing UI."
      },
      "ru": {
        "title": "Symbiote UI: Web Components как контракты для агентов",
        "summary": "Web Components и provider metadata формируют UI-контракт для продуктов, собираемых агентами.",
        "body": "## Контекст публикаций\n\n- Публичный источник: пакет/репозиторий Symbiote UI показывает переиспользуемый UI-слой, который используется в этом CV и связанных RND-PRO интерфейсах.\n- R&D-задача: агентам нужны UI-примитивы с описанными контрактами, structured UI metadata, предсказуемым поведением и правилами переиспользуемой композиции.\n- Связь: компонентный слой поддерживает Agent Portal, интерфейсы CV-портфолио, графовые инструменты, деревья, панельные раскладки и будущие интерфейсы с поддержкой WebMCP."
      },
      "es": {
        "title": "Symbiote UI: Web Components como contratos para agentes",
        "summary": "Web Components y metadata de providers forman el contrato UI para productos ensamblados por agentes.",
        "body": "## Contexto de publicación\n\n- Ancla pública: el paquete/repositorio Symbiote UI expone la capa UI reutilizable usada por este CV e interfaces relacionadas de RND-PRO.\n- Punto I+D: los agentes necesitan primitivas UI con contratos descubribles, structured UI metadata, comportamiento predecible y reglas de composición reutilizables.\n- Transición: la capa de componentes soporta Agent Portal, superficies del CV, herramientas de grafo, árboles, panel layouts y futura UI orientada a WebMCP."
      }
    }
  },
  {
    "id": "pulse/symbiote-node",
    "slug": "symbiote-node",
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
    "sourceLinks": [],
    "locales": {
      "en": {
        "title": "Symbiote Node: The Early Integration Layer",
        "summary": "Symbiote Node captures early RND-PRO Symbiote integration and package-organization work.",
        "body": "## Publication context\n\n- Public anchor: Symbiote.js itself is external/reference context; this note is about an earlier RND-PRO package workspace, not authorship of the original Symbiote.js project.\n- R&D point: the workspace collected integration glue, migration tools, package organization experiments, and early links between UI primitives and engine prototypes.\n- Transition: this line later evolved into the current Workspace, UI, and Engine connection."
      },
      "ru": {
        "title": "Symbiote Node: ранний интеграционный слой",
        "summary": "Symbiote Node фиксирует раннюю интеграционную работу и организацию пакетов в линии RND-PRO Symbiote.",
        "body": "## Контекст публикаций\n\n- Публичный источник: Symbiote.js является внешним reference-контекстом; эта заметка относится к более раннему RND-PRO package workspace, а не к авторству исходного проекта Symbiote.js.\n- R&D-задача: workspace собирал интеграционную обвязку, миграционные инструменты, эксперименты с организацией пакетов и первые связи между UI-примитивами и прототипами engine.\n- Связь: эта линия дальше развилась в актуальную связку Workspace, UI и Engine."
      },
      "es": {
        "title": "Symbiote Node: la capa temprana de integración",
        "summary": "Symbiote Node conserva el trabajo temprano de integración y organización de paquetes en la línea RND-PRO Symbiote.",
        "body": "## Contexto de publicación\n\n- Ancla pública: Symbiote.js es contexto externo/de referencia; esta nota trata de un package workspace anterior de RND-PRO, no de autoría del proyecto original Symbiote.js.\n- Punto I+D: el workspace agrupaba glue de integración, herramientas de migración, experimentos de organización de paquetes y primeros vínculos entre primitivas UI y prototipos de engine.\n- Transición: esta línea evolucionó hacia la conexión actual Workspace, UI y Engine."
      }
    }
  },
  {
    "id": "pulse/symbiote-engine",
    "slug": "symbiote-engine",
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
    "sourceLinks": [],
    "locales": {
      "en": {
        "title": "Symbiote Engine: From Visual Graphs to Execution",
        "summary": "Symbiote Engine provides the execution layer in the active Symbiote Workspace, UI, and Engine line.",
        "body": "## Publication context\n\n- Public anchor: the Symbiote Engine branch is represented as a current RND-PRO package/repository line.\n- R&D point: the question is how far a visual graph can go before it becomes a real execution model for repeatable process automation.\n- Transition: the engine connects graph representation, Workspace state, and product-facing UI automation tools."
      },
      "ru": {
        "title": "Symbiote Engine: от визуальных графов к выполнению",
        "summary": "Symbiote Engine служит исполняемым слоем в актуальной связке Symbiote Workspace, UI и Engine.",
        "body": "## Контекст публикаций\n\n- Публичный источник: ветка Symbiote Engine представлена как текущая RND-PRO package/repository линия.\n- R&D-задача: вопрос в том, насколько далеко визуальный граф может пройти от схемы до реальной исполняемой модели повторяемого процесса.\n- Связь: engine связывает графовое представление, состояние Workspace и продуктовые UI-инструменты автоматизации."
      },
      "es": {
        "title": "Symbiote Engine: de grafos visuales a ejecución",
        "summary": "Symbiote Engine aporta la capa ejecutable en la línea activa de Symbiote Workspace, UI y Engine.",
        "body": "## Contexto de publicación\n\n- Ancla pública: Symbiote Engine está representado como línea package/repository actual de RND-PRO.\n- Punto I+D: la pregunta es hasta dónde puede llegar un grafo visual desde esquema hasta modelo ejecutable real de procesos repetibles.\n- Transición: el engine conecta representación de grafo, estado de Workspace y herramientas UI de automatización de producto."
      }
    }
  },
  {
    "id": "pulse/photopizza-remote",
    "slug": "photopizza-remote",
    "kind": "retrospective",
    "status": "published",
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
        "summary": "Browser-based PhotoPizza control makes field operation practical outside the lab.",
        "body": "## Publication context\n\n- Public anchor: the PhotoPizza Remote repository gives a separate public trace for the browser-control side of the hardware ecosystem.\n- R&D point: a turntable is only useful in production when operators can set capture parameters, control motion, and recover workflows without firmware-level work.\n- Transition: this UI/control pattern later echoes in hardware automation interfaces and agent-operable tools."
      },
      "ru": {
        "title": "PhotoPizza Remote: браузерное управление для полевой съёмки",
        "summary": "Браузерное управление PhotoPizza делает эксплуатацию в поле практичной вне лаборатории.",
        "body": "## Контекст публикаций\n\n- Публичный источник: репозиторий PhotoPizza Remote отдельно показывает сторону браузерного управления в этой экосистеме.\n- R&D-задача: поворотный стол полезен в реальной работе только тогда, когда оператор может задавать параметры съемки, управлять движением и восстанавливать процесс без работы на уровне прошивки.\n- Связь: этот UI/control паттерн позже повторяется в интерфейсах автоматизации физических процессов и инструментах, которыми могут пользоваться агенты."
      },
      "es": {
        "title": "PhotoPizza Remote: control en navegador para captura de campo",
        "summary": "El control de PhotoPizza en el navegador hace práctica la operación en campo fuera del laboratorio.",
        "body": "## Contexto de publicación\n\n- Ancla pública: el repositorio PhotoPizza Remote muestra por separado la parte browser-control del ecosistema hardware.\n- Punto I+D: una mesa giratoria solo sirve en producción cuando el operador puede configurar captura, controlar movimiento y recuperar flujos sin trabajar a nivel de firmware.\n- Transición: este patrón UI/control reaparece luego en interfaces de automatización hardware y herramientas operables por agentes."
      }
    }
  },
  {
    "id": "pulse/photosnail-public",
    "slug": "photosnail-public",
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
    "sourceLinks": [],
    "locales": {
      "en": {
        "title": "PhotoSnail: Early Camera-Motion Experiments",
        "summary": "PhotoSnail preserves an early public experiment around camera motion, object-tracking ideas, and media presentation.",
        "body": "## Publication context\n\n- Public anchor: the 2016 GitHub repository preserves an early web/project artifact from the PhotoSnail line.\n- R&D point: this was an early exploration of controlled camera movement and media presentation around automated capture.\n- Transition: PhotoSnail belongs to the broader media-automation work around capture, camera motion, and presentation; later projects followed their own, often overlapping, product and R&D timelines."
      },
      "ru": {
        "title": "PhotoSnail: ранние эксперименты с движением камеры",
        "summary": "PhotoSnail сохраняет ранний публичный эксперимент вокруг движения камеры, tracking-идей и медиа-презентации.",
        "body": "## Контекст публикаций\n\n- Публичный источник: GitHub-репозиторий 2016 года сохраняет ранний web/project артефакт линии PhotoSnail.\n- R&D-задача: это раннее исследование управляемого движения камеры и медиа-презентации вокруг автоматизированной съёмки.\n- Связь: PhotoSnail относится к более широкой линии медиа-автоматизации вокруг съёмки, движения камеры и презентации; последующие проекты развивались по собственным, часто пересекающимся продуктовым и R&D-траекториям."
      },
      "es": {
        "title": "PhotoSnail: experimentos tempranos de movimiento de cámara",
        "summary": "PhotoSnail conserva un experimento público temprano alrededor de movimiento de cámara, ideas de tracking y presentación multimedia.",
        "body": "## Contexto de publicación\n\n- Ancla pública: el repositorio GitHub de 2016 conserva un artefacto temprano web/project de la línea PhotoSnail.\n- Punto I+D: fue una exploración temprana de movimiento controlado de cámara y presentación multimedia alrededor de captura automatizada.\n- Transición: PhotoSnail pertenece al trabajo más amplio de automatización multimedia alrededor de captura, movimiento de cámara y presentación; los proyectos posteriores siguieron trayectorias propias de producto e I+D, a menudo superpuestas."
      }
    }
  },
  {
    "id": "pulse/lifecycle-messaging-platform",
    "slug": "lifecycle-messaging-platform",
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
        "title": "Lifecycle Messaging by Architecture and Scope",
        "summary": "A confidential lifecycle messaging platform is described through task type, architecture, and delivery scope.",
        "body": "## Publication context\n\n- Public anchor: this note is the public anchor for the project; client/source links are intentionally omitted.\n- R&D point: the work is represented by task class: consent-based customer communications, lifecycle messaging, opt-in SMS scenarios, campaign orchestration, audience segmentation, analytics, roles, and process automation.\n- Transition: it broadens the portfolio from media/hardware and AI tooling into confidential product-platform work with public-safe boundaries."
      },
      "ru": {
        "title": "Lifecycle messaging через архитектуру и зону ответственности",
        "summary": "Конфиденциальная lifecycle messaging platform описана через тип задачи, архитектуру и зону ответственности.",
        "body": "## Контекст публикаций\n\n- Публичный источник: эта заметка описывает проект без клиентских и внутренних ссылок.\n- R&D-задача: работа представлена через класс задач: согласованные клиентские коммуникации, lifecycle-сообщения, opt-in SMS-сценарии, оркестрация кампаний, сегментация, аналитика, роли и автоматизация процессов.\n- Связь: этот кейс расширяет портфолио от медиа, физической автоматизации и ИИ-инструментов к конфиденциальным продуктовым платформам с безопасной публичной границей."
      },
      "es": {
        "title": "Lifecycle messaging a través de arquitectura y alcance",
        "summary": "Una lifecycle messaging platform confidencial se describe por tipo de tarea, arquitectura y alcance de entrega.",
        "body": "## Contexto de publicación\n\n- Ancla pública: esta nota es el ancla pública del proyecto; los enlaces de cliente/source se omiten intencionalmente.\n- Punto I+D: el trabajo se representa por clase de tarea: comunicaciones con consentimiento del cliente, lifecycle messaging, escenarios opt-in SMS, orquestación de campañas, segmentación, analítica, roles y automatización de procesos.\n- Transición: amplía el portafolio desde media/hardware y herramientas IA hacia plataformas confidenciales de producto con límites públicos seguros."
      }
    }
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

  const allowedKinds = ['retrospective', 'update', 'release', 'research-note', 'field-note'];
  if (!allowedKinds.includes(pub.kind)) {
    throw new Error(`Publication ${pub.id} kind must be one of: ${allowedKinds.join(', ')}`);
  }

  if (pub.status !== 'published' && pub.status !== 'draft') {
    throw new Error(`Publication ${pub.id} status must be either "published" or "draft"`);
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
    if (pub.status === 'published' && pub.kind !== 'retrospective') {
      throw new Error(`Publication ${pub.id} publishedAt is required for published non-retrospectives`);
    }
    if (pub.kind === 'retrospective'
      && (typeof pub.subjectPeriod !== 'string' || !pub.subjectPeriod.trim())) {
      throw new Error(`Publication ${pub.id} is an undated retrospective and must have a non-empty subjectPeriod`);
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
    if (typeof loc.body !== 'string' || !loc.body.trim()) {
      throw new Error(`Publication ${pub.id} locale "${locale}" must have a non-empty body`);
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
  return true;
}

export function getPublicPublications(pubs = PUBLICATIONS) {
  return pubs.filter(pub => pub.status === 'published');
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

validateAll(PUBLICATIONS);
