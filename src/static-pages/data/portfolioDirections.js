const DIRECTION_LOCALES = Object.freeze(['en', 'ru', 'es']);

function createDirectionContentPaths(slug) {
  return Object.freeze(Object.fromEntries(
    DIRECTION_LOCALES.map((locale) => [locale, `content/directions/${slug}/${locale}.md`]),
  ));
}

/**
 * Permanent practice areas. A direction answers "what problem do I solve";
 * the Skills entries answer "with which method and tools". Both stay in the
 * same entry registry, so routes, the navigation tree, the graph, the search
 * exports and the social-card manifest are derived once.
 */
export const PORTFOLIO_DIRECTIONS = Object.freeze([
  Object.freeze({
    id: 'directions/systems-engineering',
    slug: 'systems-engineering',
    labelKey: 'direction.systemsEngineering.label',
    summaryKey: 'direction.systemsEngineering.summary',
    icon: 'schema',
    order: 10,
    skillIds: Object.freeze([
      'skills/rnd-engineering',
      'skills/product-ui',
      'skills/hardware-capture',
    ]),
    projectSlugs: Object.freeze([
      'lifecycle-messaging-platform',
      'photopizza-remote',
      'photosnail-public',
      'adaptive-maximo-workbench',
      'symbiote-node',
    ]),
    contentPaths: createDirectionContentPaths('systems-engineering'),
  }),
  Object.freeze({
    id: 'directions/applied-ai',
    slug: 'applied-ai',
    labelKey: 'direction.appliedAi.label',
    summaryKey: 'direction.appliedAi.summary',
    icon: 'memory',
    order: 20,
    skillIds: Object.freeze([
      'skills/agentic-ai',
      'skills/rnd-engineering',
    ]),
    projectSlugs: Object.freeze([
      'agent-portal',
      'agent-pool-mcp',
      'project-graph-mcp',
      'symbiote-workspace',
      'browser-x-mcp',
    ]),
    contentPaths: createDirectionContentPaths('applied-ai'),
  }),
  Object.freeze({
    id: 'directions/process-automation',
    slug: 'process-automation',
    labelKey: 'direction.processAutomation.label',
    summaryKey: 'direction.processAutomation.summary',
    icon: 'task_alt',
    order: 30,
    skillIds: Object.freeze([
      'skills/agentic-ai',
      'skills/digital-presence',
      'skills/product-ui',
    ]),
    projectSlugs: Object.freeze([
      'browser-x-mcp',
      'mobile-smm-platform',
      'adaptive-maximo-workbench',
      'lifecycle-messaging-platform',
    ]),
    contentPaths: createDirectionContentPaths('process-automation'),
  }),
]);

export const PORTFOLIO_DIRECTION_INDEX_ID = 'directions/index';

export const PORTFOLIO_DIRECTION_INDEX_CONTENT_PATHS = Object.freeze({
  en: 'content/directions/overview/en.md',
  ru: 'content/directions/overview/ru.md',
  es: 'content/directions/overview/es.md',
});

export const PORTFOLIO_DIRECTION_IDS = Object.freeze(
  PORTFOLIO_DIRECTIONS.map((direction) => direction.id),
);

/** Direction documents per locale: the overview plus one page per direction. */
export const PORTFOLIO_DIRECTION_DOCUMENT_COUNT = 1 + PORTFOLIO_DIRECTIONS.length;

export const PORTFOLIO_DIRECTION_CONTENT_PATHS = Object.freeze([
  ...Object.values(PORTFOLIO_DIRECTION_INDEX_CONTENT_PATHS),
  ...PORTFOLIO_DIRECTIONS.flatMap((direction) => Object.values(direction.contentPaths)),
]);

export function getDirectionContentPath(slug, locale = 'en') {
  const normalizedLocale = DIRECTION_LOCALES.includes(locale) ? locale : 'en';
  const direction = PORTFOLIO_DIRECTIONS.find((candidate) => candidate.slug === slug);
  if (!direction) throw new TypeError(`Unknown portfolio direction ${slug}`);
  return direction.contentPaths[normalizedLocale];
}