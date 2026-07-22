export const PORTFOLIO_SKILL_PROJECT_RELATIONS = Object.freeze({
  'skills/agentic-ai': Object.freeze([
    'agent-portal',
    'project-graph-mcp',
    'agent-pool-mcp',
    'browser-x-mcp',
  ]),
  'skills/rnd-engineering': Object.freeze([
    'agent-portal',
    'lifecycle-messaging-platform',
    'autobox-v1',
    'complexscan',
    'boothbot',
  ]),
  'skills/product-ui': Object.freeze([
    'lifecycle-messaging-platform',
    'symbiote-video-studio',
    'symbiote-ui',
    'megavisor',
  ]),
  'skills/hardware-capture': Object.freeze([
    'autobox-v1',
    'f360-studio',
    'complexscan',
    'boothbot',
    'photopizza',
  ]),
});

export const PORTFOLIO_PROJECT_RELATIONS = Object.freeze({
  'agent-portal': Object.freeze([
    'mcp-agent-portal',
    'project-graph-mcp',
    'agent-pool-mcp',
    'browser-x-mcp',
    'context-x-mcp',
    'terminal-x-mcp',
  ]),
  'symbiote-video-studio': Object.freeze(['symbiote-ui', 'symbiote-workspace', 'lifecycle-messaging-platform']),
  'autobox-v1': Object.freeze(['f360-studio', 'complexscan', 'photopizza', 'megavisor']),
  'f360-studio': Object.freeze(['autobox-v1', 'complexscan', 'photopizza']),
  complexscan: Object.freeze(['f360-studio', 'photopizza', 'autobox-v1']),
  boothbot: Object.freeze(['megavisor', 'photopizza', 'complexscan']),
  photopizza: Object.freeze(['f360-studio', 'megavisor', 'complexscan', 'autobox-v1', 'photopizza-remote', 'photosnail-public']),
  megavisor: Object.freeze(['photopizza', 'boothbot', 'complexscan']),
  'mcp-agent-portal': Object.freeze(['agent-portal', 'browser-x-mcp', 'context-x-mcp', 'terminal-x-mcp']),
  'project-graph-mcp': Object.freeze(['agent-portal', 'context-x-mcp', 'agent-pool-mcp']),
  'agent-pool-mcp': Object.freeze(['agent-portal', 'project-graph-mcp', 'terminal-x-mcp']),
  'browser-x-mcp': Object.freeze(['agent-portal', 'mcp-agent-portal', 'context-x-mcp']),
  'context-x-mcp': Object.freeze(['agent-portal', 'project-graph-mcp', 'browser-x-mcp']),
  'terminal-x-mcp': Object.freeze(['agent-portal', 'agent-pool-mcp', 'mcp-agent-portal']),
  'symbiote-workspace': Object.freeze(['agent-portal', 'symbiote-ui', 'symbiote-engine']),
  'symbiote-ui': Object.freeze(['agent-portal', 'symbiote-workspace', 'symbiote-engine', 'symbiote-video-studio']),
  'symbiote-node': Object.freeze(['symbiote-ui', 'symbiote-engine', 'symbiote-workspace']),
  'symbiote-engine': Object.freeze(['symbiote-ui', 'symbiote-workspace']),
  'photopizza-remote': Object.freeze(['photopizza', 'complexscan']),
  'photosnail-public': Object.freeze(['photopizza', 'megavisor']),
  'lifecycle-messaging-platform': Object.freeze(['agent-portal', 'symbiote-video-studio', 'symbiote-ui']),
});

export const PORTFOLIO_PROFILE_ITEM_ROUTES = Object.freeze({
  impact: Object.freeze({
    aiTooling: 'projects/agent-portal',
    museumScanning: 'projects/autobox-v1',
    hardware: 'projects/complexscan',
    mediaProduction: 'projects/megavisor',
  }),
  products: Object.freeze({
    agentToolchain: 'projects/agent-portal',
    symbiote: 'projects/symbiote-workspace',
    videoStudio: 'projects/symbiote-video-studio',
    messaging: 'projects/lifecycle-messaging-platform',
    hardware: 'projects/complexscan',
    photopizza: 'projects/photopizza',
    objetArt: 'projects/autobox-v1',
    boothbot: 'projects/boothbot',
  }),
  experience: Object.freeze({
    f360: 'projects/f360-studio',
    megavisor: 'projects/megavisor',
  }),
});

export const PORTFOLIO_PDF_IMPACT_ROUTES = Object.freeze([
  'projects/agent-portal',
  'projects/autobox-v1',
  'projects/complexscan',
  'projects/megavisor',
]);

export const PORTFOLIO_PDF_EXPERTISE_ROUTES = Object.freeze([
  'skills/agentic-ai',
  'skills',
  'skills/rnd-engineering',
  'skills/hardware-capture',
]);

export const PORTFOLIO_PDF_PRODUCT_ROUTES = Object.freeze([
  'projects/agent-portal',
  'projects/symbiote-workspace',
  'projects/symbiote-video-studio',
  'projects/lifecycle-messaging-platform',
  'projects/complexscan',
  'projects/photopizza',
  'projects/autobox-v1',
  'projects/boothbot',
]);
