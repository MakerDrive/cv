import { cvShowAuthoringAuthority } from './cvShowAuthoringAuthority.js';
import { createCvShowAuthoringTransport } from './cvShowAuthoringTransport.js';
import { createCvShowWebMcpAuthoring } from './cvShowWebMcpAuthoring.js';

const PUBLIC_TOUR_ENTRY_PATH = '/cv/js/tour-player/index.js';

let localCvShowAuthoringPromise = null;

async function loadCvShowRuntimeAuthority() {
  let clientUrl = new URL(import.meta.url);
  let publicTourUrl = new URL(PUBLIC_TOUR_ENTRY_PATH, clientUrl);
  publicTourUrl.search = clientUrl.search;
  let publicTour = await import(publicTourUrl.href);
  let authority = publicTour.cvShowRuntimeAuthority;
  if (
    !authority
    || typeof authority.getView !== 'function'
    || typeof authority.subscribe !== 'function'
    || typeof authority.attachSource !== 'function'
  ) {
    throw Object.assign(
      new Error(
        'CV Show public assets do not expose the runtime projection authority; rebuild them '
        + 'before starting the local authoring host.',
      ),
      { code: 'CV_SHOW_AUTHORING_PUBLIC_RUNTIME_INVALID' },
    );
  }
  return authority;
}

export function enableLocalCvShowAuthoring() {
  localCvShowAuthoringPromise ||= (async () => {
    let runtimeAuthority = await loadCvShowRuntimeAuthority();
    let authority = cvShowAuthoringAuthority;
    let pageTarget = globalThis;
    let controller = new AbortController();
    let webMcp = null;
    let detachRuntimeSource = null;
    let disposed = false;
    let onPageHide;
    let dispose = async () => {
      if (disposed) return;
      disposed = true;
      pageTarget.removeEventListener?.('pagehide', onPageHide);
      controller.abort(new DOMException('CV Show local authoring disposed', 'AbortError'));
      await webMcp?.dispose?.();
      detachRuntimeSource?.();
      authority.dispose();
    };
    onPageHide = () => {
      void dispose();
    };
    try {
      let transport = createCvShowAuthoringTransport();
      let handshake = await transport.handshake(null, { signal: controller.signal });
      let capability = Object.freeze({
        local: true,
        authorized: true,
        sessionId: handshake.sessionId,
      });
      detachRuntimeSource = runtimeAuthority.attachSource(authority);
      await authority.enableLocal({ capability, transport, signal: controller.signal });
      let session = Object.freeze({
        sessionId: handshake.sessionId,
        mutationSession: authority.mutationSession,
      });
      webMcp = await createCvShowWebMcpAuthoring({
        authority,
        session,
        capability,
        pageTarget,
      });
      if (webMcp.state.status !== 'active') {
        throw Object.assign(new Error('CV Show local WebMCP activation failed'), {
          code: 'CV_SHOW_WEBMCP_ACTIVATION_FAILED',
        });
      }
      pageTarget.addEventListener?.('pagehide', onPageHide, { once: true });
      return Object.freeze({
        authority,
        session,
        webMcp,
        signal: controller.signal,
        dispose,
      });
    } catch (error) {
      await dispose();
      throw error;
    }
  })();
  return localCvShowAuthoringPromise;
}
