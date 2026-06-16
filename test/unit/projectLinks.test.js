import assert from 'node:assert/strict';
import test from 'node:test';

import { loadProjectEntries } from '../../src/static-pages/data/projects.js';

test('project entries expose project-specific YouTube channels', () => {
  const projects = loadProjectEntries();
  const bySlug = new Map(projects.map((project) => [project.slug, project]));

  assert.deepEqual(bySlug.get('complexscan')?.links, [
    {
      label: 'PHOTOGRAMMETRY',
      href: 'https://www.youtube.com/@PHOTOGRAMMETRY',
      summary: 'YouTube channel with photogrammetry and capture workflow demos',
    },
  ]);
  assert.deepEqual(bySlug.get('photopizza')?.links, [
    {
      label: 'PhotoPizza',
      href: 'https://www.youtube.com/@PhotoPizza',
      summary: 'YouTube channel with product updates and demos',
    },
  ]);
});

test('project entries include public author projects', () => {
  const projects = loadProjectEntries();
  const bySlug = new Map(projects.map((project) => [project.slug, project]));
  const expected = [
    ['mcp-agent-portal', 'https://github.com/rnd-pro/mcp-agent-portal'],
    ['project-graph-mcp', 'https://github.com/rnd-pro/project-graph-mcp'],
    ['agent-pool-mcp', 'https://github.com/rnd-pro/agent-pool-mcp'],
    ['browser-x-mcp', 'https://github.com/rnd-pro/browser-x-mcp'],
    ['context-x-mcp', 'https://github.com/rnd-pro/context-x-mcp'],
    ['terminal-x-mcp', 'https://github.com/rnd-pro/terminal-x-mcp'],
    ['symbiote-workspace', 'https://github.com/rnd-pro/symbiote-workspace'],
    ['symbiote-ui', 'https://github.com/rnd-pro/symbiote-ui'],
    ['symbiote-node', 'https://github.com/rnd-pro/symbiote-node'],
    ['symbiote-engine', 'https://github.com/rnd-pro/symbiote-engine'],
    ['photopizza-remote', 'https://github.com/PhotoPizza/remote'],
    ['photosnail-public', 'https://github.com/PhotoSnail/public'],
  ];

  for (const [slug, href] of expected) {
    const project = bySlug.get(slug);
    assert.equal(project?.href, href);
    assert.equal(project?.kicker, 'Author project');
    assert.equal(project?.linkLabel, 'View repository');
  }
});
