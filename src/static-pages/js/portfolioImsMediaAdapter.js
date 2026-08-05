async function resolveImsPlayerData(activation, fetchImpl) {
  if (activation?.data && typeof activation.data === 'object') return activation.data;
  let srcData = activation?.srcData;
  if (typeof srcData !== 'string' || !srcData) {
    throw new Error('IMS activation requires inline data or a srcData URL');
  }
  let response = await fetchImpl(srcData);
  if (!response?.ok) {
    throw new Error(`IMS srcData request failed for "${srcData}" (status ${response?.status ?? 'unknown'})`);
  }
  let data = await response.json();
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    throw new Error(`IMS srcData response is not an object for "${srcData}"`);
  }
  return data;
}

async function loadImsViewer() {
  await import('immersive-media-spots/viewer');
}

function getErrorMessage(error) {
  return error instanceof Error ? error.message : String(error);
}

function releaseObjectUrl(state, objectUrl) {
  if (!objectUrl || state.srcData !== objectUrl) return;
  URL.revokeObjectURL(objectUrl);
  state.srcData = '';
}

function renderImsPosterFallback(container, descriptor) {
  let poster = document.createElement('img');
  poster.src = descriptor.poster || '';
  poster.alt = descriptor.alt || '';
  poster.loading = 'lazy';
  let href = descriptor.activation?.fallbackUrl || descriptor.poster || '';
  let fallback = document.createElement('a');
  fallback.href = href;
  fallback.target = '_blank';
  fallback.rel = 'noopener noreferrer';
  fallback.textContent = descriptor.alt || 'Open media';
  container.replaceChildren(poster, fallback);
}

/**
 * @param {Object} [options]
 * @returns {{mount: Function, unmount: Function}}
 */
export function createPortfolioImsMediaAdapter({
  loadViewer = loadImsViewer,
  fetchImpl = (url) => fetch(url),
} = {}) {
  return {
    mount(container, descriptor) {
      let state = { cancelled: false, srcData: '', error: null };
      state.ready = (async () => {
        let data;
        try {
          data = await resolveImsPlayerData(descriptor?.activation, fetchImpl);
        } catch (error) {
          if (state.cancelled) return;
          state.error = `IMS media source unavailable: ${getErrorMessage(error)}`;
          renderImsPosterFallback(container, descriptor);
          return;
        }
        if (state.cancelled) return;

        let blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
        let objectUrl = URL.createObjectURL(blob);
        state.srcData = objectUrl;
        try {
          await loadViewer();
          if (state.cancelled) {
            releaseObjectUrl(state, objectUrl);
            return;
          }
          let viewer = document.createElement('ims-viewer');
          viewer.setAttribute('src-data', objectUrl);
          viewer.setAttribute('aria-label', descriptor.alt || descriptor.kind || 'Interactive media');
          if (descriptor.activation?.autoplay === true) {
            viewer.setAttribute('cast-next', '');
            viewer.setAttribute('autoplay', 'true');
          }
          container.replaceChildren(viewer);
          state.viewer = viewer;
        } catch (error) {
          releaseObjectUrl(state, objectUrl);
          if (state.cancelled) return;
          state.error = `IMS viewer failed to mount: ${getErrorMessage(error)}`;
          renderImsPosterFallback(container, descriptor);
        }
      })();
      return state;
    },

    unmount(container, state) {
      if (state) {
        state.cancelled = true;
        releaseObjectUrl(state, state.srcData);
      }
      container.replaceChildren();
    },
  };
}

export default createPortfolioImsMediaAdapter;
