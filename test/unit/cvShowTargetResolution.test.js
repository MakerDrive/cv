import assert from 'node:assert/strict';
import test from 'node:test';

import {
  createCvShowTextMarkerTarget,
  resolveCvShowSemanticTarget,
} from '../../src/static-pages/js/tour-player/targetResolution.js';

function visibleAnchor(href, { visible = true } = {}) {
  return {
    href,
    isConnected: true,
    getBoundingClientRect: () => ({ width: visible ? 120 : 0, height: visible ? 24 : 0 }),
  };
}

test('semantic project-link targets resolve the visible exact href from current entry metadata', () => {
  const hiddenGitHub = visibleAnchor('https://github.com/rnd-pro/mcp-agent-portal', {
    visible: false,
  });
  const symbioteGitHub = visibleAnchor('https://github.com/rnd-pro/symbiote-ui');
  const agentGitHub = visibleAnchor('https://github.com/rnd-pro/mcp-agent-portal');
  const agentDemo = visibleAnchor('https://rnd-pro.github.io/mcp-agent-portal/');
  const viewer = {
    querySelectorAll: selector => selector === 'a[href]'
      ? [hiddenGitHub, symbioteGitHub, agentGitHub, agentDemo]
      : [],
  };
  const runtime = {
    viewer,
    entries: new Map([
      ['projects/symbiote-ui', {
        href: 'https://github.com/rnd-pro/symbiote-ui',
        links: [{ label: 'Demo', href: 'https://rnd-pro.github.io/symbiote-ui/' }],
      }],
      ['projects/agent-portal', {
        href: 'https://rnd-pro.com/projects/agent-portal/',
        links: [
          { label: 'GitHub', href: 'https://github.com/rnd-pro/mcp-agent-portal' },
          { label: 'Demo', href: 'https://rnd-pro.github.io/mcp-agent-portal/' },
        ],
      }],
    ]),
  };
  const document = { baseURI: 'https://portfolio.example/' };

  assert.equal(resolveCvShowSemanticTarget(null, runtime, 'project-link.symbiote-ui.github', {
    document,
  }), symbioteGitHub);
  assert.equal(resolveCvShowSemanticTarget(null, runtime, 'project-link.agent-portal.github', {
    document,
  }), agentGitHub);
  assert.equal(resolveCvShowSemanticTarget(null, runtime, 'project-link.agent-portal.demo', {
    document,
  }), agentDemo);
});

test('semantic details target uses the authored scene and public action ids', () => {
  const details = { id: 'details-button' };
  let observedSelector = '';
  const workspace = {
    querySelector(selector) {
      observedSelector = selector;
      return details;
    },
  };

  assert.equal(resolveCvShowSemanticTarget(
    workspace,
    { entries: new Map() },
    'chat.action.symbiote-ui.details',
  ), details);
  assert.equal(
    observedSelector,
    '.actions-card[data-actions-id="symbiote-ui.actions"] [data-action-id="details"]',
  );
});

test('exact marker quote occurrence exposes nonzero Range geometry through a target proxy', () => {
  const textNode = { data: 'готовый материал, затем готовый материал для каталога', nodeType: 3 };
  const range = {
    setStart(node, offset) {
      this.start = { node, offset };
    },
    setEnd(node, offset) {
      this.end = { node, offset };
    },
    getClientRects: () => [{ left: 40, top: 80, right: 240, bottom: 104, width: 200, height: 24 }],
  };
  const document = {
    defaultView: {},
    createTreeWalker: () => {
      let available = true;
      return { nextNode: () => available ? (available = false, textNode) : null };
    },
    createRange: () => range,
  };
  const target = {
    id: 'boothbot-solution',
    ownerDocument: document,
    isConnected: true,
    parentElement: null,
    textContent: textNode.data,
    getBoundingClientRect: () => ({ left: 0, top: 0, width: 600, height: 300 }),
  };

  const proxy = createCvShowTextMarkerTarget(target, {
    quote: 'готовый материал',
    occurrence: 2,
  });

  assert.notEqual(proxy, target);
  assert.equal(range.start.node, textNode);
  assert.equal(range.start.offset, textNode.data.lastIndexOf('готовый материал'));
  assert.equal(range.end.offset, range.start.offset + 'готовый материал'.length);
  assert.deepEqual(proxy.getBoundingClientRect(), {
    left: 40,
    top: 80,
    right: 240,
    bottom: 104,
    width: 200,
    height: 24,
  });
});

test('marker quote missing from the resolved block searches visible siblings', () => {
  const quoteText = 'ключевая фраза находится здесь';
  const range = {
    setStart(node, offset) {
      this.start = { node, offset };
    },
    setEnd(node, offset) {
      this.end = { node, offset };
    },
    getClientRects: () => [{ left: 20, top: 300, right: 320, bottom: 324, width: 300, height: 24 }],
  };
  const document = {
    defaultView: {},
    createTreeWalker: (root) => {
      const data = String(root?.textContent || '');
      let available = data.length > 0;
      const node = { data };
      return { nextNode: () => { if (!available) return null; available = false; return node; } };
    },
    createRange: () => range,
  };
  const scope = {
    matches: (selector) => String(selector).split(',').some((part) => part.trim() === 'article'),
    querySelectorAll: () => [sibling],
    parentElement: null,
  };
  const sibling = {
    textContent: `вступительное слово, ${quoteText}, продолжение`,
    parentElement: scope,
    getBoundingClientRect: () => ({ left: 20, top: 300, width: 300, height: 24 }),
  };
  const target = {
    id: 'region-first',
    ownerDocument: document,
    isConnected: true,
    parentElement: scope,
    textContent: 'вводный абзац без нужной фразы',
    getBoundingClientRect: () => ({ left: 20, top: 100, width: 300, height: 24 }),
  };

  const proxy = createCvShowTextMarkerTarget(target, { quote: 'ключевая фраза', occurrence: 1 });

  assert.notEqual(proxy, target);
  assert.equal(proxy.parentElement, scope);
  assert.deepEqual(proxy.getBoundingClientRect(), {
    left: 20,
    top: 300,
    right: 320,
    bottom: 324,
    width: 300,
    height: 24,
  });
});
