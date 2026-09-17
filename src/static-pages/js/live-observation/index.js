/**
 * CV live semantic observation (Slice A — read-only).
 *
 * Publishes a WebMCP `live_inspect` tool backed by the generic
 * symbiote-ui live-observation contract. It answers questions about the
 * LIVE APPLICATION state — which panels and which portfolio tree nodes
 * exist, what state they are in, and which semantic transitions they
 * support in that state. It never mutates the UI, and it never exposes
 * CSS selectors, DOM paths, or coordinates to the caller; target ids are
 * semantic (`panel.<id>`, `tree.<id>`) and survive remounts because they
 * derive from the application model (panel ids, tree ids), not from any
 * concrete element instance.
 */
import {
  createLiveEnsureToolDescriptor,
  createLiveInspectToolDescriptor,
  createLiveObservationRegistry,
} from 'symbiote-ui/webmcp/live-observation';
import { registerWebMcpTool } from 'symbiote-ui/webmcp';
import { createEnsureController } from 'symbiote-workspace/browser';

export const CV_LIVE_INSPECT_TOOL_NAME = 'live_inspect';
export const CV_LIVE_ENSURE_TOOL_NAME = 'live_ensure';

function normalizedText(value) {
  return String(value ?? '').trim();
}

function isVisible(element, doc) {
  if (!element?.isConnected) return false;
  const rect = element.getBoundingClientRect?.();
  if (rect && rect.width <= 0 && rect.height <= 0) {
    const style = doc?.defaultView?.getComputedStyle?.(element);
    if (!style || style.display === 'none' || style.visibility === 'hidden') return false;
  }
  return true;
}

function panelIdOf(element) {
  // Panel identity is semantic: the hosted panel component (e.g.
  // <portfolio-tree-panel>) names the logical panel; the layout node is
  // just its current shell and may be re-created by the layout engine.
  const hosted = Array.from(element?.querySelectorAll?.('*') || [])
    .find((child) => normalizedText(child.localName).endsWith('-panel'))
    || Array.from(element?.children || [])
      .find((child) => normalizedText(child.localName).endsWith('-panel'))
    || null;
  const tag = normalizedText(hosted?.localName);
  if (tag) return tag.replace(/-panel$/, '');
  return normalizedText(element?.dataset?.panelId)
    || normalizedText(element?.getAttribute?.('panel-id'))
    || normalizedText(element?.id);
}

/**
 * Observation of layout panels: `panel.<panel-id>` targets. Presence:
 * - present   — the layout node exists and renders visibly;
 * - hidden    — the node exists but is not visible (collapsed rail or
 *               zero-size drawer still reports its semantic state);
 * - unmounted — the application has no such panel right now
 *               (reported only for ids from the observed universe).
 * State follows the layout contract: `collapsed` mirrors the host
 * attribute. Capabilities are advertised by semantic role: a panel can
 * always support open/close; availability flips with the state.
 * @param {Document} doc
 */
function createPanelProvider(doc) {
  const collect = () => {
    const nodes = Array.from(doc?.querySelectorAll?.('layout-node[node-type="panel"]') || []);
    const observations = [];
    const seen = new Set();
    for (const node of nodes) {
      const id = panelIdOf(node);
      if (!id || seen.has(id)) continue;
      seen.add(id);
      const collapsed = node.hasAttribute?.('collapsed') || node.hasAttribute?.('auto-collapsed') || false;
      const visible = isVisible(node, doc);
      observations.push({
        targetId: `panel.${id}`,
        role: 'panel',
        component: node.localName || 'layout-node',
        presence: visible ? 'present' : 'hidden',
        visibility: visible ? 'visible' : 'hidden',
        state: { collapsed },
        capabilities: {
          supported: ['open', 'close'],
          available: collapsed ? ['open'] : ['close'],
          unavailable: collapsed
            ? [{ id: 'close', reason: 'already-closed' }]
            : [{ id: 'open', reason: 'already-open' }],
          effects: {
            open: { collapsed: false },
            close: { collapsed: true },
          },
        },
      });
    }
    return observations;
  };
  return {
    id: 'cv-panels',
    targetIdPrefix: 'panel.',
    /** @param {{ targetId?: string }} [request] */
    observe({ targetId } = {}) {
      const all = collect();
      if (!targetId) return all;
      const id = normalizedText(targetId).slice('panel.'.length);
      const found = all.find((entry) => entry.targetId === targetId);
      if (found) return [found];
      // Known-vs-unknown distinction: a layout exists, but no panel with
      // this id — the target is unknown to the application.
      if (!id || !doc?.querySelector?.('panel-layout')) return [];
      return [{
        targetId,
        role: 'panel',
        presence: 'unmounted',
        state: {},
        capabilities: {
          supported: ['open', 'close'],
          available: [],
          unavailable: [
            { id: 'open', reason: 'not-mounted' },
            { id: 'close', reason: 'not-mounted' },
          ],
        },
      }];
    },
  };
}

/**
 * Observation of portfolio tree rows: `tree.<tree-id>` targets.
 * `tree-id` comes from the tree model (e.g. `projects/symbiote-engine`),
 * so identity is stable across re-renders and virtualization-style
 * remounts. Selection is read from the tree's ARIA state.
 * @param {Document} doc
 */
function createTreeProvider(doc) {
  const rows = () => Array.from(doc?.querySelectorAll?.('.sn-tree-row[data-tree-id]') || []);
  const collect = () => rows().map((row) => {
    const treeId = normalizedText(/** @type {any} */ (row).dataset.treeId);
    const selected = row.getAttribute?.('aria-selected') === 'true';
    const visible = isVisible(row, doc);
    return {
      targetId: `tree.${treeId}`,
      role: 'tree-item',
      component: 'sn-tree-row',
      presence: visible ? 'present' : 'hidden',
      visibility: visible ? 'visible' : 'hidden',
      state: { selected },
      capabilities: {
        supported: ['select', 'deselect'],
        available: selected ? ['deselect'] : ['select'],
        unavailable: selected
          ? [{ id: 'select', reason: 'already-selected' }]
          : [{ id: 'deselect', reason: 'not-selected' }],
      },
    };
  });
  return {
    id: 'cv-tree',
    targetIdPrefix: 'tree.',
    /** @param {{ targetId?: string }} [request] */
    observe({ targetId } = {}) {
      const all = collect();
      if (!targetId) return all;
      const found = all.find((entry) => entry.targetId === targetId);
      return found ? [found] : [];
    },
  };
}

/**
 * Creates the CV live observation surface.
 * @param {{ document?: Document }} [options]
 */
export function createCvLiveObservation(options = {}) {
  const doc = options.document || (typeof document !== 'undefined' ? document : null);
  const registry = createLiveObservationRegistry({
    document: doc,
    providers: [createPanelProvider(doc), createTreeProvider(doc)],
  });
  const descriptor = createLiveInspectToolDescriptor(registry, {
    name: CV_LIVE_INSPECT_TOOL_NAME,
    description: [
      'Read-only semantic observation of the live CV application UI.',
      'Query a semantic target id (panel.<id>, tree.<id>) or omit it to',
      'list all observable targets with their current state, supported',
      'capabilities, and available transitions. Never mutates the UI.',
    ].join(' '),
  });
  return Object.freeze({ registry, descriptor, dispose: () => registry.dispose() });
}

/**
 * Locates the layout-node for a semantic panel id and its hosting layout.
 * Returns null when either side is missing — never falls back to guesses.
 * @param {Document} doc
 * @param {string} panelId
 */
function findPanelHost(doc, panelId) {
  const nodes = Array.from(doc?.querySelectorAll?.('layout-node[node-type="panel"]') || []);
  const node = nodes.find((entry) => panelIdOf(entry) === panelId);
  if (!node) return null;
  const layout = typeof node.closest === 'function' ? node.closest('panel-layout') : null;
  if (!layout) return null;
  return { node, layout };
}

/**
 * Semantic transition invoker for the CV live surface. Panel transitions go
 * through the public `panel-layout` API (`openPanel` / `closeUiPanel`) —
 * never through direct attribute or class mutation. Unknown targets or
 * unsupported transitions return null so the caller reports "no-transition"
 * instead of pretending to have reconciled.
 * @param {Document} doc
 */
function createCvTransitionInvoker(doc) {
  return async ({ targetId, transitionId }) => {
    const target = normalizedText(targetId);
    if (!target.startsWith('panel.')) return null;
    const host = findPanelHost(doc, target.slice('panel.'.length));
    if (!host) return null;
    const layout = /** @type {any} */ (host.layout);
    if (transitionId === 'open' && typeof layout.openPanel === 'function') {
      layout.openPanel(target.slice('panel.'.length), { uiInvoked: true });
      return { transitionId, applied: 'openPanel' };
    }
    if (transitionId === 'close' && typeof layout.closeUiPanel === 'function') {
      layout.closeUiPanel(target.slice('panel.'.length));
      return { transitionId, applied: 'closeUiPanel' };
    }
    return null;
  };
}

/**
 * Creates the CV live ensure surface (Slice B): ensure(target, state)
 * delegated to the generic workspace controller over the Slice A registry,
 * with semantic invokers provided by this host.
 * @param {{ document?: Document, registry?: any }} [options]
 */
export function createCvLiveEnsure(options = {}) {
  const doc = options.document || (typeof document !== 'undefined' ? document : null);
  const ownedRegistry = options.registry || createLiveObservationRegistry({
    document: doc,
    providers: [createPanelProvider(doc), createTreeProvider(doc)],
  });
  const registry = ownedRegistry;
  const controller = createEnsureController({
    observe: (request) => registry.observe(request),
    invokeTransition: createCvTransitionInvoker(doc),
  });
  const descriptor = createLiveEnsureToolDescriptor(
    ({ targetId, state, sync }) => controller.ensure(targetId, state, { sync }),
    {
      name: CV_LIVE_ENSURE_TOOL_NAME,
      description: [
        'Semantic reconciliation of the live CV application UI:',
        'ensure(panel.<id>, { collapsed: false }) observes the panel,',
        'invokes the available open/close transition through the layout',
        'public API, and verifies the result by re-observation.',
      ].join(' '),
    },
  );
  return Object.freeze({
    registry,
    controller,
    descriptor,
    dispose: () => { if (!options.registry) registry.dispose(); },
  });
}

/**
 * Registers the live-inspect and live-ensure tools with the page WebMCP
 * surface. A no-op when WebMCP is unavailable (plain browsers, tests): the
 * observation engine itself stays callable through the returned handle.
 * @param {{ document?: Document }} [options]
 */
export async function setupCvLiveObservation(options = {}) {
  const inspectSurface = createCvLiveObservation(options);
  const ensureSurface = createCvLiveEnsure({ ...options, registry: inspectSurface.registry });
  const inspectRegistration = await registerWebMcpTool(
    inspectSurface.descriptor, options.document || globalThis.document,
  );
  const ensureRegistration = await registerWebMcpTool(
    ensureSurface.descriptor, options.document || globalThis.document,
  );
  return Object.freeze({
    registry: inspectSurface.registry,
    descriptor: inspectSurface.descriptor,
    ensureController: ensureSurface.controller,
    ensureDescriptor: ensureSurface.descriptor,
    registration: inspectRegistration,
    ensureRegistration,
    dispose() {
      inspectSurface.dispose();
      inspectRegistration?.unregister?.();
      ensureRegistration?.unregister?.();
    },
  });
}
