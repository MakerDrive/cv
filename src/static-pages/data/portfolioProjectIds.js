export const PORTFOLIO_PROJECT_SLUGS = Object.freeze([
  'agent-portal',
  'symbiote-video-studio',
  'autobox-v1',
  'f360-studio',
  'complexscan',
  'boothbot',
  'photopizza',
  'megavisor',
  'mcp-agent-portal',
  'project-graph-mcp',
  'agent-pool-mcp',
  'browser-x-mcp',
  'context-x-mcp',
  'terminal-x-mcp',
  'symbiote-workspace',
  'symbiote-ui',
  'symbiote-node',
  'symbiote-engine',
  'photopizza-remote',
  'photosnail-public',
  'lifecycle-messaging-platform',
]);

export const PORTFOLIO_PROJECT_IDS = Object.freeze(
  PORTFOLIO_PROJECT_SLUGS.map((slug) => `projects/${slug}`)
);
