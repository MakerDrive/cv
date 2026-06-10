if (!document.querySelector('side-panel[disabled]')) {
  await import('../../ui-components/universal/side-panel/logic.js');
}

import {
  CASCADE_THEME_DEFAULTS,
  Connection,
  Input,
  LayoutTree,
  Node,
  NodeEditor,
  Output,
  Socket,
  applyCascadeTheme,
  buildResourceTreeFromEntries,
  configureMaterialSymbols,
  createGraphViewModeController,
  configureBrowserLocalization,
  highlightTreePath,
  resolveInitialGraphViewMode,
  setTreeItems,
  setupTreePanel,
  showTree,
  translate,
} from 'symbiote-ui/ui';

const PORTFOLIO_LOCALE_MESSAGES = Object.freeze({
  en: {
    'portfolio.page.title': 'Vladimir Matiasevich | Lead Engineer / R&D / Agentic AI',
    'portfolio.page.aria': 'Vladimir Matiasevich portfolio',
    'portfolio.skill.agenticAi.label': 'Agentic AI',
    'portfolio.skill.agenticAi.summary': 'Agent workflows, context systems, model routing, and tools that help teams build software with AI.',
    'portfolio.skill.productUi.label': 'Product UI',
    'portfolio.skill.productUi.summary': 'Interfaces for editors, dashboards, media tools, design systems, and Web Components.',
    'portfolio.skill.automation.label': 'Automation / Capture',
    'portfolio.skill.automation.summary': 'Robotics, scanning, 360 capture, and product-photo automation for physical workflows.',
    'portfolio.profile.summary': 'Lead Engineer / R&D / Agentic AI.',
    'portfolio.profile.details': 'A compact overview of my work across AI tools, product interfaces, media systems, and capture automation.',
    'portfolio.profile.avatarAlt': 'Vladimir Matiasevich portrait',
    'portfolio.bio.label': 'Biography',
    'portfolio.bio.about': 'About',
    'portfolio.bio.summary': 'Full-stack engineer turning R&D work into practical products.',
    'portfolio.bio.details': 'I work across AI-assisted developer tools, media products, cloud publishing, and hardware-driven capture systems.',
    'portfolio.projects.label': 'Projects',
    'portfolio.projects.overview': 'Overview',
    'portfolio.projects.summary': 'Selected product and R&D work.',
    'portfolio.projects.details': 'A compact map of shipped products, prototypes, and long-running experiments.',
    'portfolio.pulse.label': 'Pulse',
    'portfolio.pulse.summary': 'Recent notes connected to the projects.',
    'portfolio.pulse.details': 'Short updates about what changed, what shipped, or what is being explored.',
    'portfolio.skills.label': 'Skills',
    'portfolio.skills.summary': 'Core areas behind the project work.',
    'portfolio.skills.details': 'A compact view of the capabilities that recur across the projects.',
    'portfolio.skill.details': 'A practical skill area represented through related projects.',
    'portfolio.node.fallback': 'Portfolio item.',
    'portfolio.markdown.related': 'Related',
    'portfolio.link.learnMore': 'Learn more',
    'portfolio.tree.filter': 'Filter materials',
    'portfolio.tree.collapse': 'Collapse All Folders',
    'portfolio.panel.materials': 'Materials',
    'portfolio.panel.graph': 'Graph',
    'portfolio.panel.content': 'Content',
    'portfolio.panel.theme': 'Theme',
    'portfolio.header.openMaterials': 'Open materials',
    'portfolio.graph.fit': 'Fit',
    'portfolio.graph.fitTitle': 'Fit graph into panel',
    'portfolio.graph.edit': 'Edit',
    'portfolio.graph.editTitle': 'Toggle node editing',
    'portfolio.graph.flat': 'Flat',
    'portfolio.graph.flatTitle': 'Toggle flat graph mode',
    'portfolio.graph.pathTitle': 'Use {label} connection paths',
    'portfolio.graph.action.content': 'Content',
    'portfolio.graph.action.branch': 'Branch',
    'portfolio.graph.action.open': 'Open link',
  },
  ru: {
    'portfolio.page.title': 'Vladimir Matiasevich | Lead Engineer / R&D / Agentic AI',
    'portfolio.page.aria': 'Портфолио Владимира Матиясевича',
    'portfolio.skill.agenticAi.label': 'Агентный ИИ',
    'portfolio.skill.agenticAi.summary': 'Агентные workflow, контекстные системы, маршрутизация моделей и инструменты для разработки с AI.',
    'portfolio.skill.productUi.label': 'Продуктовый UI',
    'portfolio.skill.productUi.summary': 'Интерфейсы для редакторов, дашбордов, медиа-инструментов, дизайн-систем и Web Components.',
    'portfolio.skill.automation.label': 'Автоматизация / съёмка',
    'portfolio.skill.automation.summary': 'Робототехника, сканирование, 360-съёмка и автоматизация product-photo процессов.',
    'portfolio.profile.summary': 'Lead Engineer / R&D / Agentic AI.',
    'portfolio.profile.details': 'Короткий обзор моей работы в AI-инструментах, продуктовых интерфейсах, медиа-системах и автоматизации съёмки.',
    'portfolio.profile.avatarAlt': 'Портрет Владимира Матиясевича',
    'portfolio.bio.label': 'Биография',
    'portfolio.bio.about': 'Обо мне',
    'portfolio.bio.summary': 'Full-stack инженер, который превращает R&D-задачи в практичные продукты.',
    'portfolio.bio.details': 'Работаю с AI-инструментами для разработки, медиа-продуктами, cloud publishing и аппаратными системами съёмки.',
    'portfolio.projects.label': 'Проекты',
    'portfolio.projects.overview': 'Обзор',
    'portfolio.projects.summary': 'Избранные продуктовые и R&D-проекты.',
    'portfolio.projects.details': 'Краткая карта продуктов, прототипов и долгосрочных экспериментов.',
    'portfolio.pulse.label': 'Пульс',
    'portfolio.pulse.summary': 'Свежие заметки о проектах.',
    'portfolio.pulse.details': 'Короткие обновления о том, что изменилось, запустилось или находится в исследовании.',
    'portfolio.skills.label': 'Навыки',
    'portfolio.skills.summary': 'Ключевые направления работы.',
    'portfolio.skills.details': 'Краткий обзор компетенций, которые повторяются в разных проектах.',
    'portfolio.skill.details': 'Практическое направление, показанное через связанные проекты.',
    'portfolio.node.fallback': 'Материал портфолио.',
    'portfolio.markdown.related': 'Связано',
    'portfolio.link.learnMore': 'Подробнее',
    'portfolio.tree.filter': 'Фильтр материалов',
    'portfolio.tree.collapse': 'Свернуть все папки',
    'portfolio.panel.materials': 'Материалы',
    'portfolio.panel.graph': 'Граф',
    'portfolio.panel.content': 'Контент',
    'portfolio.panel.theme': 'Тема',
    'portfolio.header.openMaterials': 'Открыть материалы',
    'portfolio.graph.fit': 'Вписать',
    'portfolio.graph.fitTitle': 'Вписать граф в панель',
    'portfolio.graph.edit': 'Правка',
    'portfolio.graph.editTitle': 'Переключить редактирование нод',
    'portfolio.graph.flat': 'Flat',
    'portfolio.graph.flatTitle': 'Переключить flat-режим графа',
    'portfolio.graph.pathTitle': 'Использовать линии связи: {label}',
    'portfolio.graph.action.content': 'Контент',
    'portfolio.graph.action.branch': 'Ветка',
    'portfolio.graph.action.open': 'Открыть ссылку',
  },
  es: {
    'portfolio.page.title': 'Vladimir Matiasevich | Ingeniero líder / I+D / IA agéntica',
    'portfolio.page.aria': 'Portafolio de Vladimir Matiasevich',
    'portfolio.skill.agenticAi.label': 'IA agéntica',
    'portfolio.skill.agenticAi.summary': 'Flujos con agentes, sistemas de contexto, enrutamiento de modelos y herramientas para crear software con IA.',
    'portfolio.skill.productUi.label': 'UI de producto',
    'portfolio.skill.productUi.summary': 'Interfaces para editores, paneles, herramientas multimedia, sistemas de diseño y Web Components.',
    'portfolio.skill.automation.label': 'Automatización / captura',
    'portfolio.skill.automation.summary': 'Robótica, escaneo, captura 360 y automatización fotográfica para flujos físicos.',
    'portfolio.profile.summary': 'Ingeniero líder / I+D / IA agéntica.',
    'portfolio.profile.details': 'Una vista breve de mi trabajo en herramientas de IA, interfaces de producto, sistemas multimedia y automatización de captura.',
    'portfolio.profile.avatarAlt': 'Retrato de Vladimir Matiasevich',
    'portfolio.bio.label': 'Biografía',
    'portfolio.bio.about': 'Acerca de',
    'portfolio.bio.summary': 'Ingeniero full-stack que convierte trabajo de I+D en productos prácticos.',
    'portfolio.bio.details': 'Trabajo con herramientas de desarrollo asistidas por IA, productos multimedia, publicación cloud y sistemas de captura con hardware.',
    'portfolio.projects.label': 'Proyectos',
    'portfolio.projects.overview': 'Resumen',
    'portfolio.projects.summary': 'Trabajo seleccionado de producto e I+D.',
    'portfolio.projects.details': 'Un mapa compacto de productos publicados, prototipos y experimentos de largo recorrido.',
    'portfolio.pulse.label': 'Pulso',
    'portfolio.pulse.summary': 'Notas recientes relacionadas con los proyectos.',
    'portfolio.pulse.details': 'Actualizaciones breves sobre cambios, lanzamientos o líneas de exploración.',
    'portfolio.skills.label': 'Habilidades',
    'portfolio.skills.summary': 'Áreas centrales detrás del trabajo de proyecto.',
    'portfolio.skills.details': 'Una vista compacta de capacidades que aparecen en distintos proyectos.',
    'portfolio.skill.details': 'Un área práctica representada por proyectos relacionados.',
    'portfolio.node.fallback': 'Elemento de portafolio.',
    'portfolio.markdown.related': 'Relacionado',
    'portfolio.link.learnMore': 'Más información',
    'portfolio.tree.filter': 'Filtrar materiales',
    'portfolio.tree.collapse': 'Contraer todas las carpetas',
    'portfolio.panel.materials': 'Materiales',
    'portfolio.panel.graph': 'Grafo',
    'portfolio.panel.content': 'Contenido',
    'portfolio.panel.theme': 'Tema',
    'portfolio.header.openMaterials': 'Abrir materiales',
    'portfolio.graph.fit': 'Ajustar',
    'portfolio.graph.fitTitle': 'Ajustar el grafo al panel',
    'portfolio.graph.edit': 'Editar',
    'portfolio.graph.editTitle': 'Alternar edición de nodos',
    'portfolio.graph.flat': 'Flat',
    'portfolio.graph.flatTitle': 'Alternar modo flat del grafo',
    'portfolio.graph.pathTitle': 'Usar conexiones {label}',
    'portfolio.graph.action.content': 'Contenido',
    'portfolio.graph.action.branch': 'Rama',
    'portfolio.graph.action.open': 'Abrir enlace',
  },
});

configureBrowserLocalization({
  force: true,
  messages: PORTFOLIO_LOCALE_MESSAGES,
});

function tPortfolio(key, params = {}) {
  return translate(`portfolio.${key}`, params);
}

document.title = tPortfolio('page.title');
document.querySelector('.pulse-header-title')?.replaceChildren(tPortfolio('page.title'));
let headerMenuButton = document.querySelector('.pulse-header-menu-button');
headerMenuButton?.setAttribute('aria-label', tPortfolio('header.openMaterials'));
headerMenuButton?.setAttribute('title', tPortfolio('header.openMaterials'));
function openMaterialsDrawerFromHeader() {
  let handle = document.querySelector('.portfolio-layout .layout-drawer-handle-stack-start [data-drawer-panel-id]');
  if (handle instanceof HTMLElement) {
    if (handle.getAttribute('aria-expanded') !== 'true') {
      handle.click();
    }
    return;
  }
  document.dispatchEvent(new CustomEvent('portfolio-open-materials', {
    detail: { source: 'portfolio-header' },
  }));
}
headerMenuButton?.addEventListener('click', (event) => {
  event.preventDefault();
  event.stopPropagation();
  openMaterialsDrawerFromHeader();
});
document.addEventListener('click', (event) => {
  let target = event.target;
  if (!(target instanceof Element) || !target.closest('.pulse-header-menu-button')) return;
  event.preventDefault();
  openMaterialsDrawerFromHeader();
});
document.querySelector('.pulse-screen')?.setAttribute('aria-label', tPortfolio('page.aria'));

configureMaterialSymbols({
  hrefBuilder: (iconNames) => {
    let names = [...iconNames].sort().join(',');
    return `https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&icon_names=${names}`;
  },
});

applyCascadeTheme(document.documentElement, CASCADE_THEME_DEFAULTS);

const THEME_STORAGE_KEY = 'symbiote-ui:cascade-theme-editor';
const THEME_TARGET_SELECTOR = ':root';
const projectsElement = document.getElementById('pulse-projects-data');
const projects = projectsElement ? JSON.parse(projectsElement.textContent || '[]') : [];
const INITIAL_FOCUS_IDS = [
  'profile/photo',
  'bio/about',
  'projects/index',
  'skills/index',
];

const relationSocket = new Socket('portfolio', {
  color: 'var(--sn-conn-color, var(--sn-node-selected))',
});

const skillEntries = [
  {
    id: 'skills/agentic-ai',
    label: tPortfolio('skill.agenticAi.label'),
    icon: 'account_tree',
    category: 'server',
    summary: tPortfolio('skill.agenticAi.summary'),
  },
  {
    id: 'skills/product-ui',
    label: tPortfolio('skill.productUi.label'),
    icon: 'web_asset',
    category: 'module',
    summary: tPortfolio('skill.productUi.summary'),
  },
  {
    id: 'skills/automation',
    label: tPortfolio('skill.automation.label'),
    icon: 'precision_manufacturing',
    category: 'instance',
    summary: tPortfolio('skill.automation.summary'),
  },
];

function getSkillIdsForProject(project) {
  let text = `${project.title} ${project.summary}`.toLowerCase();
  let result = [];
  if (/agent|ai|portal|cloud|publishing|megavisor/.test(text)) result.push('skills/agentic-ai');
  if (/video|editor|ui|media|studio|interface|publishing/.test(text)) result.push('skills/product-ui');
  if (/robot|scan|360|photo|capture|turntable|hardware|photogrammetry/.test(text)) {
    result.push('skills/automation');
  }
  return result.length > 0 ? result : ['skills/product-ui'];
}

function createMarkdown(entry) {
  let lines = [`# ${entry.label}`, ''];
  if (entry.kicker) {
    lines.push(`**${entry.kicker}**`, '');
  }
  lines.push(entry.summary || tPortfolio('node.fallback'), '');
  if (entry.details) {
    lines.push(entry.details, '');
  }
  if (entry.href) {
    lines.push(`[${entry.linkLabel || tPortfolio('link.learnMore')}](${entry.href})`, '');
  }
  if (entry.related?.length) {
    lines.push(`## ${tPortfolio('markdown.related')}`, '');
    for (let item of entry.related) lines.push(`- ${item}`);
  }
  return lines.join('\n').trim();
}

function makeEntry(entry) {
  return {
    type: 'note',
    category: 'data',
    shape: 'rect',
    icon: 'article',
    focusIds: [entry.id],
    params: {},
    ...entry,
  };
}

function createPortfolioEntries() {
  let entries = [
    makeEntry({
      id: 'profile/photo',
      label: 'Vladimir Matiasevich',
      type: 'profile-photo',
      category: 'server',
      shape: 'disc',
      icon: 'person',
      summary: tPortfolio('profile.summary'),
      details: tPortfolio('profile.details'),
      focusIds: INITIAL_FOCUS_IDS,
      params: {
        avatar: './avatar/index.webp',
        avatarAlt: tPortfolio('profile.avatarAlt'),
        size: 220,
        summary: tPortfolio('profile.summary'),
      },
    }),
    makeEntry({
      id: 'bio/about',
      label: tPortfolio('bio.label'),
      type: 'bio',
      category: 'data',
      icon: 'person',
      summary: tPortfolio('bio.summary'),
      details: tPortfolio('bio.details'),
      focusIds: ['profile/photo', 'bio/about', 'skills/index'],
    }),
    makeEntry({
      id: 'projects/index',
      label: tPortfolio('projects.label'),
      type: 'directory',
      category: 'directory',
      shape: 'circle',
      icon: 'folder',
      summary: tPortfolio('projects.summary'),
      details: tPortfolio('projects.details'),
      focusIds: ['profile/photo', 'projects/index', ...projects.slice(0, 2).map((item) => `projects/${item.slug}`)],
      params: { hideContent: true, tone: 'inverse' },
    }),
    makeEntry({
      id: 'pulse/index',
      label: tPortfolio('pulse.label'),
      type: 'directory',
      category: 'control',
      shape: 'circle',
      icon: 'article',
      summary: tPortfolio('pulse.summary'),
      details: tPortfolio('pulse.details'),
      focusIds: ['profile/photo', 'pulse/index', ...projects.slice(0, 2).map((item) => `pulse/${item.slug}`)],
      params: { hideContent: true, tone: 'inverse' },
    }),
    makeEntry({
      id: 'skills/index',
      label: tPortfolio('skills.label'),
      type: 'directory',
      category: 'module',
      shape: 'circle',
      icon: 'hub',
      summary: tPortfolio('skills.summary'),
      details: tPortfolio('skills.details'),
      focusIds: ['profile/photo', 'skills/index', ...skillEntries.map((item) => item.id)],
      params: { hideContent: true, tone: 'inverse' },
    }),
  ];

  for (let skill of skillEntries) {
    entries.push(makeEntry({
      ...skill,
      type: 'skill',
      details: tPortfolio('skill.details'),
      focusIds: ['skills/index', skill.id],
    }));
  }

  for (let project of projects) {
    let relatedSkillIds = getSkillIdsForProject(project);
    entries.push(makeEntry({
      id: `projects/${project.slug}`,
      label: project.title,
      type: 'project',
      category: 'data',
      icon: 'work',
      kicker: project.kicker || project.date,
      summary: project.summary,
      href: project.href,
      linkLabel: project.linkLabel === 'Learn more' ? tPortfolio('link.learnMore') : project.linkLabel,
      related: relatedSkillIds.map((id) => skillEntries.find((skill) => skill.id === id)?.label),
      focusIds: ['projects/index', `projects/${project.slug}`, ...relatedSkillIds],
      params: {
        kicker: project.kicker || project.date,
        summary: project.summary,
        image: project.image,
        imageAlt: project.alt,
        href: project.href,
        linkLabel: project.linkLabel === 'Learn more' ? tPortfolio('link.learnMore') : project.linkLabel,
      },
    }));
    entries.push(makeEntry({
      id: `pulse/${project.slug}`,
      label: project.title,
      type: 'pulse',
      category: 'module',
      icon: 'article',
      kicker: tPortfolio('pulse.label'),
      summary: project.summary,
      href: project.href,
      linkLabel: project.linkLabel === 'Learn more' ? tPortfolio('link.learnMore') : project.linkLabel,
      related: [project.title],
      focusIds: ['pulse/index', `pulse/${project.slug}`, `projects/${project.slug}`],
    }));
  }

  return entries.map((entry) => ({
    ...entry,
    markdown: entry.markdown || createMarkdown(entry),
  }));
}

function addPorts(node) {
  node.addInput('in', new Input(relationSocket, 'in'));
  node.addOutput('out', new Output(relationSocket, 'out'));
}

function connect(editor, nodes, fromId, toId) {
  let from = nodes.get(fromId);
  let to = nodes.get(toId);
  if (!from || !to) return;
  editor.addConnection(new Connection(from, 'out', to, 'in'));
}

function resourcePathSegment(value) {
  return String(value || 'Untitled')
    .replace(/[\\/]+/g, '-')
    .replace(/\s+/g, ' ')
    .trim();
}

function createTreeItems(projectItems, pulseItems) {
  return buildResourceTreeFromEntries([
    {
      id: 'profile/photo',
      path: `${tPortfolio('bio.label')}/Vladimir Matiasevich.md`,
      label: 'Vladimir Matiasevich',
      icon: 'person',
      kind: 'profile',
      draggable: false,
    },
    {
      id: 'bio/about',
      path: `${tPortfolio('bio.label')}/${tPortfolio('bio.about')}.md`,
      label: tPortfolio('bio.about'),
      icon: 'article',
      kind: 'bio',
      draggable: false,
    },
    {
      id: 'projects/index',
      path: `${tPortfolio('projects.label')}/${tPortfolio('projects.overview')}.md`,
      label: tPortfolio('projects.overview'),
      icon: 'folder',
      kind: String(projectItems.length),
      draggable: false,
    },
    ...projectItems.map((project) => ({
      id: `projects/${project.slug}`,
      path: `${tPortfolio('projects.label')}/${resourcePathSegment(project.title)}.md`,
      label: project.title,
      icon: 'work',
      kind: 'project',
      draggable: false,
    })),
    {
      id: 'pulse/index',
      path: `${tPortfolio('pulse.label')}/${tPortfolio('projects.overview')}.md`,
      label: tPortfolio('projects.overview'),
      icon: 'article',
      kind: String(pulseItems.length),
      draggable: false,
    },
    ...pulseItems.map((project) => ({
      id: `pulse/${project.slug}`,
      path: `${tPortfolio('pulse.label')}/${resourcePathSegment(project.title)}.md`,
      label: project.title,
      icon: 'description',
      kind: 'note',
      draggable: false,
    })),
    {
      id: 'skills/index',
      path: `${tPortfolio('skills.label')}/${tPortfolio('projects.overview')}.md`,
      label: tPortfolio('projects.overview'),
      icon: 'hub',
      kind: String(skillEntries.length),
      draggable: false,
    },
    ...skillEntries.map((skill) => ({
      id: skill.id,
      path: `${tPortfolio('skills.label')}/${resourcePathSegment(skill.label)}.md`,
      label: skill.label,
      icon: skill.icon,
      kind: 'skill',
      draggable: false,
    })),
  ], {
    directoryIcon: 'folder',
    fileIcon: 'article',
    draggable: false,
    sort: false,
  });
}

function createStructuredGraphGroups(projectItems) {
  return {
    biography: ['profile/photo', 'bio/about'],
    skills: ['skills/index', ...skillEntries.map((skill) => skill.id)],
    projects: ['projects/index', ...projectItems.map((project) => `projects/${project.slug}`)],
    pulse: ['pulse/index', ...projectItems.map((project) => `pulse/${project.slug}`)],
  };
}

function setNodePositions(canvas, projectItems) {
  canvas.autoLayout({
    groups: createStructuredGraphGroups(projectItems),
    direction: 'LR',
    startX: 0,
    startY: 0,
    gapX: 120,
    gapY: 56,
    maxLayerRows: 4,
    fit: true,
    overlap: {
      paddingX: 40,
      paddingY: 32,
      passes: 16,
    },
  });
}

const portfolioEntries = new Map(createPortfolioEntries().map((entry) => [entry.id, entry]));
const portfolioTreeItems = createTreeItems(projects, projects);
const defaultExpandedTreeIds = [
  tPortfolio('bio.label'),
  tPortfolio('projects.label'),
  tPortfolio('pulse.label'),
  tPortfolio('skills.label'),
];
const treeDirectorySelection = new Map([
  [tPortfolio('bio.label'), 'profile/photo'],
  [tPortfolio('projects.label'), 'projects/index'],
  [tPortfolio('pulse.label'), 'pulse/index'],
  [tPortfolio('skills.label'), 'skills/index'],
]);
const flatGroupSelection = new Map([
  ['group/biography', 'profile/photo'],
  ['group/projects', 'projects/index'],
  ['group/pulse', 'pulse/index'],
  ['group/skills', 'skills/index'],
]);
const directoryEntryIds = new Set([
  'projects/index',
  'pulse/index',
  'skills/index',
]);
const flatGraphGroups = [
  { id: 'group/biography', label: tPortfolio('bio.label'), type: 'data', children: ['profile/photo', 'bio/about'] },
  { id: 'group/projects', label: tPortfolio('projects.label'), type: 'asset', children: projects.map((project) => `projects/${project.slug}`) },
  { id: 'group/pulse', label: tPortfolio('pulse.label'), type: 'docs', children: projects.map((project) => `pulse/${project.slug}`) },
  { id: 'group/skills', label: tPortfolio('skills.label'), type: 'action', children: skillEntries.map((skill) => skill.id) },
];

const GRAPH_PATH_STYLES = [
  { style: 'pcb', label: 'PCB', icon: 'route' },
  { style: 'orthogonal', label: 'Ortho', icon: 'account_tree' },
  { style: 'bezier', label: 'Bezier', icon: 'gesture' },
  { style: 'straight', label: 'Straight', icon: 'trending_flat' },
];

const GRAPH_ACTION_PATHS = Object.freeze({
  article: 'M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zM13 9V3.5L18.5 9H13zM8 13h8v2H8v-2zm0 4h8v2H8v-2z',
  branch: 'M12 2l2 4h-4l2-4zm0 20l-2-4h4l-2 4zm10-10l-4 2v-4l4 2zM2 12l4-2v4l-4-2zm10-4a4 4 0 100 8 4 4 0 000-8z',
  open: 'M14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7zM5 5h5V3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-5h-2v5H5V5z',
});

function createPortfolioNodeActionItems() {
  return [
    { action: 'content', label: tPortfolio('graph.action.content'), path: GRAPH_ACTION_PATHS.article },
    { action: 'branch', label: tPortfolio('graph.action.branch'), path: GRAPH_ACTION_PATHS.branch },
    { action: 'open', label: tPortfolio('graph.action.open'), path: GRAPH_ACTION_PATHS.open },
  ];
}

function getCurrentGraphViewMode() {
  if (typeof location === 'undefined') return 'structured';
  return resolveInitialGraphViewMode(new URLSearchParams(location.search));
}

function createGraphPanelMenuActions({
  editable = true,
  flatMode = getCurrentGraphViewMode() === 'flat',
  pathStyle = 'pcb',
} = {}) {
  return [
    {
      id: 'graph:fit',
      label: tPortfolio('graph.fit'),
      icon: 'center_focus_strong',
      title: tPortfolio('graph.fitTitle'),
      group: 'graph',
    },
    {
      id: 'graph:edit-toggle',
      label: tPortfolio('graph.edit'),
      icon: 'edit',
      title: tPortfolio('graph.editTitle'),
      group: 'graph',
      active: editable,
    },
    {
      id: 'graph:flat-toggle',
      label: tPortfolio('graph.flat'),
      icon: 'account_tree',
      title: tPortfolio('graph.flatTitle'),
      group: 'graph',
      active: flatMode,
    },
    ...GRAPH_PATH_STYLES.map((item) => ({
      id: `path:${item.style}`,
      label: item.label,
      icon: item.icon,
      title: tPortfolio('graph.pathTitle', { label: item.label }),
      group: 'path',
      active: pathStyle === item.style,
    })),
  ];
}

function resolveTreeSelection(item) {
  if (!item) return '';
  if (portfolioEntries.has(item.id)) return item.id;
  if (portfolioEntries.has(item.path)) return item.path;
  return treeDirectorySelection.get(item.id) || treeDirectorySelection.get(item.path) || '';
}

function resolveFlatGraphSelection(path) {
  if (portfolioEntries.has(path)) return path;
  return flatGroupSelection.get(path) || '';
}

function getFlatGraphFocusId(entry) {
  if (!entry?.id) return '';
  if (entry.id === 'projects/index') return 'group/projects';
  if (entry.id === 'pulse/index') return 'group/pulse';
  if (entry.id === 'skills/index') return 'group/skills';
  return entry.id;
}

function getFlatGraphFocusIds(entry) {
  let focusId = getFlatGraphFocusId(entry);
  if (!focusId) return [];
  if (entry.id === 'profile/photo') {
    return ['profile/photo', 'bio/about', 'group/projects', 'group/pulse', 'group/skills'];
  }
  if (entry.id === 'projects/index') {
    return ['group/projects', ...projects.slice(0, 3).map((project) => `projects/${project.slug}`)];
  }
  if (entry.id === 'pulse/index') {
    return ['group/pulse', ...projects.slice(0, 3).map((project) => `pulse/${project.slug}`)];
  }
  if (entry.id === 'skills/index') {
    return ['group/skills', ...skillEntries.slice(0, 5).map((skill) => skill.id)];
  }
  if (entry.id.startsWith('projects/')) {
    let project = projects.find((item) => `projects/${item.slug}` === entry.id);
    let ids = ['group/projects', entry.id];
    if (project) {
      ids.push(`pulse/${project.slug}`);
      ids.push(...getSkillIdsForProject(project).slice(0, 3));
    }
    return ids;
  }
  if (entry.id.startsWith('pulse/')) {
    let slug = entry.id.slice('pulse/'.length);
    return ['group/pulse', `projects/${slug}`, entry.id].filter((id) => id === 'group/pulse' || portfolioEntries.has(id));
  }
  if (entry.id.startsWith('skills/')) {
    let linkedProjects = projects
      .filter((project) => getSkillIdsForProject(project).includes(entry.id))
      .slice(0, 3)
      .map((project) => `projects/${project.slug}`);
    return ['group/skills', entry.id, ...linkedProjects];
  }
  return [focusId];
}

function getCanvasGraphNodeType(entry) {
  if (entry.type === 'project') return 'asset';
  if (entry.type === 'pulse') return 'docs';
  if (entry.type === 'skill') return 'action';
  return 'data';
}

function createPortfolioFlatGraphModel() {
  let nodes = [];
  let edges = [];
  for (let group of flatGraphGroups) {
    nodes.push({
      id: group.id,
      label: group.label,
      type: group.type,
      summary: `${group.label} branch`,
      isGroup: true,
      children: group.children,
    });
  }

  for (let entry of portfolioEntries.values()) {
    if (directoryEntryIds.has(entry.id)) continue;
    nodes.push({
      id: entry.id,
      label: entry.label,
      type: getCanvasGraphNodeType(entry),
      summary: entry.summary,
    });
  }

  let flatNodeIds = new Set(nodes.map((node) => node.id));
  let edgeKeys = new Set();
  let addEdge = (from, to, type = 'link') => {
    if (!flatNodeIds.has(from) || !flatNodeIds.has(to)) return;
    let key = `${from}->${to}`;
    if (edgeKeys.has(key)) return;
    edgeKeys.add(key);
    edges.push({ from, to, type });
  };

  addEdge('group/biography', 'profile/photo', 'branch');
  addEdge('group/biography', 'bio/about', 'branch');
  addEdge('profile/photo', 'bio/about', 'bio');
  addEdge('profile/photo', 'group/projects', 'branch');
  addEdge('profile/photo', 'group/pulse', 'branch');
  addEdge('profile/photo', 'group/skills', 'branch');
  for (let skill of skillEntries) {
    addEdge('group/skills', skill.id, 'skill');
    addEdge('profile/photo', skill.id, 'skill');
  }
  for (let project of projects) {
    let projectId = `projects/${project.slug}`;
    let pulseId = `pulse/${project.slug}`;
    addEdge('group/projects', projectId, 'project');
    addEdge('group/pulse', pulseId, 'pulse');
    addEdge(projectId, pulseId, 'pulse');
    for (let skillId of getSkillIdsForProject(project)) addEdge(skillId, projectId, 'uses');
  }

  return {
    nodes,
    edges,
    groups: flatGraphGroups.map((group) => ({
      id: group.id,
      label: group.label,
      nodeIds: group.children,
    })),
    rootNodes: nodes.map((node) => node.id),
  };
}

const portfolioRuntime = {
  entries: portfolioEntries,
  treeItems: portfolioTreeItems,
  selectedId: 'profile/photo',
  graphMode: getCurrentGraphViewMode(),
  /** @type {any} */
  tree: null,
  /** @type {any} */
  canvas: null,
  /** @type {any} */
  graphController: null,
  /** @type {any} */
  viewer: null,

  setTree(panel) {
    this.tree = panel;
    this.syncTree();
  },

  setCanvas(canvas) {
    this.canvas = canvas;
    this.syncCanvas({ focus: true });
  },

  setGraphController(controller) {
    this.graphController = controller;
    this.syncCanvas({ focus: true });
  },

  setGraphMode(mode) {
    this.graphMode = mode === 'flat' ? 'flat' : 'structured';
  },

  setViewer(viewer) {
    this.viewer = viewer;
    this.syncViewer();
  },

  select(id, { focus = false } = {}) {
    if (!this.entries.has(id)) return;
    this.selectedId = id;
    this.syncTree();
    this.syncViewer();
    this.syncCanvas({ focus });
  },

  getSelectedEntry() {
    return this.entries.get(this.selectedId) || this.entries.get('profile/photo');
  },

  syncTree() {
    if (!this.tree?.setItems) return;
    this.tree.defaultExpandedIds = defaultExpandedTreeIds;
    setTreeItems({ ref: { panel: this.tree } }, this.treeItems);
    showTree({ ref: { panel: this.tree } });
    highlightTreePath({ ref: { panel: this.tree } }, this.selectedId, { scroll: true });
  },

  syncViewer() {
    let entry = this.getSelectedEntry();
    if (!entry || !this.viewer?.showFile) return;
    this.viewer.showFile({
      path: `${entry.id}.md`,
      lang: 'md',
      raw: entry.markdown,
      statsText: entry.type,
    });
    if (this.viewer.$) this.viewer.$.showGraphAction = false;
  },

  syncCanvas({ focus = false } = {}) {
    let entry = this.getSelectedEntry();
    if (!entry) return;
    if (!focus) return;
    if (this.graphController) {
      let structuredNodeIds = entry.focusIds || [entry.id];
      this.graphController.focusNode({
        nodeId: entry.id,
        structuredNodeIds,
        flatNodeId: getFlatGraphFocusId(entry),
        flatNodeIds: getFlatGraphFocusIds(entry),
        structuredOptions: {
          padding: 56,
          maxZoom: structuredNodeIds.length > 1 ? 1 : 0.92,
          select: entry.id,
        },
        flatOptions: {
          padding: 96,
          maxZoom: 1.05,
          select: getFlatGraphFocusId(entry),
        },
      });
      return;
    }
    if (!this.canvas) return;
    this.canvas.focusNodes?.(entry.focusIds || [entry.id], {
      padding: 56,
      maxZoom: entry.focusIds?.length > 1 ? 1 : 0.92,
      select: entry.id,
    });
  },
};

function createPortfolioLayoutTree() {
  let treePanel = LayoutTree.createPanel('portfolio-tree', {}, {
    importance: 76,
    minInlineSize: 220,
    minBlockSize: 180,
    collapse: 'auto',
    mobileDock: 'start',
  });
  let graphPanel = LayoutTree.createPanel('portfolio-graph', {}, {
    importance: 88,
    minInlineSize: 420,
    minBlockSize: 320,
    collapse: 'manual',
    mobileDock: 'end',
    swipeControl: 'island',
  });
  let viewerPanel = LayoutTree.createPanel('portfolio-viewer', {}, {
    importance: 100,
    minInlineSize: 320,
    minBlockSize: 240,
    collapse: 'never',
    mobileDock: 'primary',
  });
  let contentSplit = LayoutTree.createSplit('horizontal', viewerPanel, graphPanel, 0.32, {
    importance: 90,
    minInlineSize: 740,
    minBlockSize: 320,
    collapse: 'never',
    responsiveMode: 'swipe',
  });
  return LayoutTree.createSplit('horizontal', treePanel, contentSplit, 0.22, {
    importance: 90,
    minInlineSize: 960,
    minBlockSize: 420,
    collapse: 'never',
    responsiveMode: 'swipe',
  });
}

function createPortfolioEditor() {
  let editor = new NodeEditor();
  let nodes = new Map();
  for (let entry of portfolioRuntime.entries.values()) {
    let node = new Node(entry.label, {
      id: entry.id,
      type: entry.type,
      category: entry.category,
      shape: entry.shape,
      icon: entry.icon,
    });
    node.params = {
      summary: entry.summary,
      href: entry.href,
      linkLabel: entry.linkLabel,
      ...(entry.params || {}),
    };
    addPorts(node);
    editor.addNode(node);
    nodes.set(entry.id, node);
  }

  connect(editor, nodes, 'profile/photo', 'bio/about');
  connect(editor, nodes, 'profile/photo', 'projects/index');
  connect(editor, nodes, 'profile/photo', 'pulse/index');
  connect(editor, nodes, 'profile/photo', 'skills/index');
  for (let skill of skillEntries) connect(editor, nodes, 'skills/index', skill.id);
  for (let project of projects) {
    let projectId = `projects/${project.slug}`;
    connect(editor, nodes, 'projects/index', projectId);
    connect(editor, nodes, projectId, `pulse/${project.slug}`);
    connect(editor, nodes, 'pulse/index', `pulse/${project.slug}`);
    for (let skillId of getSkillIdsForProject(project)) {
      connect(editor, nodes, skillId, projectId);
    }
  }

  return editor;
}

class PortfolioTreePanel extends HTMLElement {
  connectedCallback() {
    if (this._ready) return;
    this._ready = true;
    this.innerHTML = /*html*/ `
      <sn-tree-panel
        class="portfolio-tree"
        filter-placeholder="${tPortfolio('tree.filter')}"
        collapse-title="${tPortfolio('tree.collapse')}"></sn-tree-panel>
    `;
    let panel = /** @type {any} */ (this.querySelector('sn-tree-panel'));
    this.ref = { panel };
    Promise.all([
      customElements.whenDefined('sn-tree-panel'),
      customElements.whenDefined('sn-tree-view'),
    ]).then(() => {
      setupTreePanel(this, {
        storageKey: 'cv-portfolio-materials-tree-v1',
        defaultExpandedIds: defaultExpandedTreeIds,
        onSelect: (item) => {
          let id = resolveTreeSelection(item);
          if (id) {
            portfolioRuntime.select(id, { focus: true });
            let layout = /** @type {any} */ (this.closest('panel-layout'));
            layout?.closeDrawer?.('start');
          }
        },
      });
      portfolioRuntime.setTree(panel);
    });
  }
}

class PortfolioGraphPanel extends HTMLElement {
  editable = true;
  flatMode = getCurrentGraphViewMode() === 'flat';
  pathStyle = 'pcb';
  /** @type {any} */
  canvas = null;
  /** @type {any} */
  flatGraph = null;
  /** @type {any} */
  graphController = null;

  connectedCallback() {
    if (this._ready) return;
    this._ready = true;
    this.innerHTML = /*html*/ `
      <node-canvas class="portfolio-canvas"></node-canvas>
      <canvas-graph
        class="portfolio-flat-graph"
        device-orientation-parallax
        device-orientation-parallax-strength="28"
        device-orientation-parallax-max-tilt="32"
        hidden></canvas-graph>
    `;
    let canvas = /** @type {any} */ (this.querySelector('node-canvas'));
    let flatGraph = /** @type {any} */ (this.querySelector('canvas-graph'));
    if (!canvas) return;

    this.canvas = canvas;
    this.flatGraph = flatGraph;
    Promise.all([
      customElements.whenDefined('node-canvas'),
      customElements.whenDefined('canvas-graph'),
    ]).then(() => this.initializeGraphCanvases());
  }

  initializeGraphCanvases() {
    if (this._graphReady) return;
    this._graphReady = true;
    let canvas = this.canvas;
    let flatGraph = this.flatGraph;
    if (!canvas) return;

    this.graphController = createGraphViewModeController({
      structuredCanvas: canvas,
      flatGraph,
      mode: this.flatMode ? 'flat' : 'structured',
      pathStyle: this.pathStyle,
      structuredEditor: createPortfolioEditor(),
      flatModel: createPortfolioFlatGraphModel(),
      flatPath: null,
    });
    this.applyGraphMode();
    this.applyGraphViewMode();
    canvas.setPanels(false);
    canvas.setViewportLocked(false);
    flatGraph?.setActionItems?.(createPortfolioNodeActionItems());
    this.applyPathStyle();
    setNodePositions(canvas, projects);
    canvas.addEventListener('selection-changed', (event) => {
      let [id] = event.detail?.nodes || [];
      if (id && id !== portfolioRuntime.selectedId) {
        portfolioRuntime.select(id, { focus: false });
      }
    });
    flatGraph?.addEventListener('file-selected', (event) => {
      let id = resolveFlatGraphSelection(event.detail?.path || '');
      if (id && id !== portfolioRuntime.selectedId) {
        portfolioRuntime.select(id, { focus: false });
      }
    });
    flatGraph?.addEventListener('group-selected', (event) => {
      let id = resolveFlatGraphSelection(event.detail?.path || '');
      if (id && id !== portfolioRuntime.selectedId) {
        portfolioRuntime.select(id, { focus: false });
      }
    });
    flatGraph?.addEventListener('toolbar-action', (event) => this.onFlatGraphToolbarAction(event));
    flatGraph?.addEventListener('orientation-parallax-status', (event) => this.onFlatGraphOrientationParallaxStatus(event));
    this.addEventListener('panel-menu-action', (event) => this.onPanelMenuAction(event));

    requestAnimationFrame(() => {
      canvas.refreshConnections();
      portfolioRuntime.setGraphMode(this.flatMode ? 'flat' : 'structured');
      portfolioRuntime.setCanvas(canvas);
      portfolioRuntime.setGraphController(this.graphController);
      this.syncPanelMenuActions();
    });
  }

  onFlatGraphToolbarAction(event) {
    let action = event.detail?.action || '';
    let id = resolveFlatGraphSelection(event.detail?.nodeId || '');
    if (!id) return;
    let entry = portfolioRuntime.entries.get(id);
    if (!entry) return;

    if (action === 'open') {
      if (entry.href && typeof globalThis.open === 'function') {
        globalThis.open(entry.href, '_blank', 'noopener');
        return;
      }
      portfolioRuntime.select(id, { focus: false });
      return;
    }

    if (action === 'branch') {
      portfolioRuntime.select(id, { focus: true });
      return;
    }

    if (action === 'content') {
      portfolioRuntime.select(id, { focus: false });
    }
  }

  onFlatGraphOrientationParallaxStatus(event) {
    let detail = event.detail || {};
    this.flatGraph?.setAttribute?.(
      'data-orientation-parallax',
      detail.enabled ? 'enabled' : detail.reason || detail.permission || 'disabled'
    );
  }

  applyGraphMode() {
    if (!this.canvas) return;
    this.canvas.setReadonly(!this.editable);
    this.canvas.setReadonlyNodeDragging(false);
  }

  applyGraphViewMode() {
    let mode = this.flatMode ? 'flat' : 'structured';
    portfolioRuntime.setGraphMode(mode);
    this.setAttribute('data-mode', mode);
    this.graphController?.setMode(mode, { notify: false });
    portfolioRuntime.syncCanvas({ focus: true });
  }

  setGraphViewMode(flatMode) {
    this.flatMode = Boolean(flatMode);
    this.applyGraphViewMode();
    if (typeof location !== 'undefined' && typeof history !== 'undefined') {
      let nextUrl = new URL(location.href);
      if (this.flatMode) {
        nextUrl.searchParams.set('mode', 'flat');
      } else {
        nextUrl.searchParams.delete('mode');
      }
      if (nextUrl.href !== location.href) {
        history.replaceState(history.state, '', nextUrl);
      }
    }
    this.dispatchEvent(new CustomEvent('graph-shell-mode-change', {
      bubbles: true,
      composed: true,
      detail: { mode: this.flatMode ? 'flat' : 'structured' },
    }));
  }

  applyPathStyle() {
    if (this.graphController) {
      this.graphController.setPathStyle(this.pathStyle);
      return;
    }
    this.canvas?.setPathStyle?.(this.pathStyle);
    this.canvas?.refreshConnections?.();
  }

  syncPanelMenuActions() {
    this.dispatchEvent(new CustomEvent('panel-menu-actions', {
      bubbles: true,
      composed: true,
      detail: {
        actions: createGraphPanelMenuActions(this),
      },
    }));
  }

  onPanelMenuAction(event) {
    let actionId = event.detail?.actionId || '';
    if (actionId === 'graph:fit') {
      this.graphController?.fitView();
    } else if (actionId === 'graph:edit-toggle') {
      this.editable = !this.editable;
      this.applyGraphMode();
    } else if (actionId === 'graph:flat-toggle') {
      this.setGraphViewMode(!this.flatMode);
    } else if (actionId.startsWith('path:')) {
      let style = actionId.slice('path:'.length);
      if (GRAPH_PATH_STYLES.some((item) => item.style === style)) {
        this.pathStyle = style;
        this.applyPathStyle();
      }
    } else {
      return;
    }
    this.syncPanelMenuActions();
  }
}

class PortfolioViewerPanel extends HTMLElement {
  connectedCallback() {
    if (this._ready) return;
    this._ready = true;
    this.innerHTML = '<source-viewer class="portfolio-viewer"></source-viewer>';
    let viewer = /** @type {any} */ (this.querySelector('source-viewer'));
    if (!viewer) return;
    portfolioRuntime.setViewer(viewer);
  }
}

class PortfolioThemePanel extends HTMLElement {
  connectedCallback() {
    if (this._ready) return;
    this._ready = true;
    this.innerHTML = /*html*/ `
      <cascade-theme-editor
        class="portfolio-theme-editor"
        storage-key="${THEME_STORAGE_KEY}"
        target-selector="${THEME_TARGET_SELECTOR}"></cascade-theme-editor>
    `;
  }
}

class PortfolioWorkspace extends HTMLElement {
  connectedCallback() {
    if (this._ready) return;
    this._ready = true;
    this.innerHTML = /*html*/ `
      <panel-layout
        class="portfolio-layout"
        min-panel-size="150"
        min-panel-inline-size="220"
        min-panel-block-size="180"
        responsive-mode="swipe"
        responsive-breakpoint="760"
        overflow-mode="collapse"></panel-layout>
    `;
    let layout = /** @type {any} */ (this.querySelector('panel-layout'));
    if (!layout) return;
    layout.registerPanelType('portfolio-tree', {
      title: tPortfolio('panel.materials'),
      icon: 'folder',
      component: 'portfolio-tree-panel',
      behavior: { importance: 76, minInlineSize: 220, collapse: 'auto', mobileDock: 'start' },
    });
    layout.registerPanelType('portfolio-graph', {
      title: tPortfolio('panel.graph'),
      icon: 'hub',
      component: 'portfolio-graph-panel',
      behavior: { importance: 88, minInlineSize: 420, collapse: 'manual', mobileDock: 'end', swipeControl: 'island' },
      menuActions: createGraphPanelMenuActions(),
    });
    layout.registerPanelType('portfolio-viewer', {
      title: tPortfolio('panel.content'),
      icon: 'article',
      component: 'portfolio-viewer-panel',
      behavior: { importance: 100, minInlineSize: 320, collapse: 'never', mobileDock: 'primary' },
    });
    layout.registerPanelType('portfolio-theme', {
      title: tPortfolio('panel.theme'),
      icon: 'palette',
      component: 'portfolio-theme-panel',
      behavior: { importance: 88, minInlineSize: 320, minBlockSize: 280, collapse: 'manual', mobileDock: 'end' },
    });
    this._onThemeOpenFull = () => {
      layout.openPanel('portfolio-theme', {
        direction: 'horizontal',
        ratio: 0.72,
        behavior: { importance: 88, minInlineSize: 320, minBlockSize: 280, collapse: 'manual', mobileDock: 'end' },
        source: 'cascade-theme-widget',
        uiInvoked: true,
      });
    };
    this._onOpenMaterials = () => {
      let handle = layout.querySelector('.layout-drawer-handle-stack-start [data-drawer-panel-id]');
      if (handle && handle.getAttribute('aria-expanded') !== 'true') {
        handle.click();
      }
    };
    document.addEventListener('cascade-theme-open-full', this._onThemeOpenFull);
    document.addEventListener('portfolio-open-materials', this._onOpenMaterials);
    layout.setLayout(createPortfolioLayoutTree());
  }

  disconnectedCallback() {
    if (this._onThemeOpenFull) {
      document.removeEventListener('cascade-theme-open-full', this._onThemeOpenFull);
    }
    if (this._onOpenMaterials) {
      document.removeEventListener('portfolio-open-materials', this._onOpenMaterials);
    }
  }
}

customElements.define('portfolio-tree-panel', PortfolioTreePanel);
customElements.define('portfolio-graph-panel', PortfolioGraphPanel);
customElements.define('portfolio-viewer-panel', PortfolioViewerPanel);
customElements.define('portfolio-theme-panel', PortfolioThemePanel);
customElements.define('portfolio-workspace', PortfolioWorkspace);
