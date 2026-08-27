export const SAFE_NATIVE_ACTIVATION_PATHS = new Set([
  'draft-test-target-approval-dry-run',
  'expand-readonly-node',
  'graph-timeline-preview',
  'layout-validated-patch-modules',
  'open-readonly-execution',
  'open-readonly-kanban-gallery',
  'open-readonly-manifest',
  'open-readonly-settings',
  'open-readonly-work-order',
  'open-source-backed-result',
  'open-three-controller-media',
  'prototype-product-packaging-delivery',
  'rotate-interactive-model',
  'run-local-readonly-task',
  'stop-analyze-propose-for-review',
]);

const ACTIONABLE_SELECTOR = 'a, button, input, select, textarea, [role="button"]';

function findActionable(target) {
  if (target?.matches?.(ACTIONABLE_SELECTOR)) return target;
  return target?.querySelector?.(ACTIONABLE_SELECTOR) || null;
}

function isSameOriginUrl(value, baseUrl) {
  try {
    const base = new URL(baseUrl);
    const candidate = new URL(value, base);
    return candidate.origin === base.origin && ['http:', 'https:'].includes(candidate.protocol);
  } catch {
    return false;
  }
}

function isInternalDemoActionable(actionable, baseUrl) {
  if (!actionable) return false;
  if (actionable.matches?.('a')) {
    const href = actionable.getAttribute?.('href') || '';
    return Boolean(href) && isSameOriginUrl(href, baseUrl);
  }
  const formAction = actionable.form?.getAttribute?.('action') || '';
  return !formAction || isSameOriginUrl(formAction, baseUrl);
}

export function canNativeActivateShowTarget(actionable, directive, {
  baseUrl = globalThis.location?.href || 'http://localhost/',
} = {}) {
  const safePath = directive?.safePath || '';
  return Boolean(
    safePath
    && SAFE_NATIVE_ACTIVATION_PATHS.has(safePath)
    && !actionable?.hasAttribute?.('disabled')
    && isInternalDemoActionable(actionable, baseUrl),
  );
}

export function activateCvShowTarget(target, directive, {
  baseUrl = globalThis.location?.href || 'http://localhost/',
  createEvent = (detail) => new CustomEvent('portfolio-show-activate', {
    bubbles: true,
    composed: true,
    cancelable: true,
    detail,
  }),
} = {}) {
  target?.focus?.({ preventScroll: true });
  const actionable = findActionable(target);
  if (canNativeActivateShowTarget(actionable, directive, { baseUrl })) {
    actionable.click();
    return { status: 'native-activated', handled: true };
  }

  const request = createEvent({
    directiveId: directive?.id || '',
    targetId: directive?.target || '',
    safePath: directive?.safePath || '',
  });
  const handled = target?.dispatchEvent?.(request) === false || request.defaultPrevented === true;
  return { status: handled ? 'semantic-handled' : 'presented', handled };
}

export function activateCvShowUserAction(action, target) {
  if (action !== 'contact') return false;
  const actionable = findActionable(target);
  if (!actionable?.matches?.('a') || actionable.hasAttribute?.('disabled')) return false;
  actionable.click();
  return true;
}
