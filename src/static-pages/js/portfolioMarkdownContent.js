const FRONTMATTER_PATTERN = /^---\r?\n[\s\S]*?\r?\n---\r?\n?/;
const LEADING_TITLE_PATTERN = /^\s*#\s+.+(?:\r?\n|$)/;

export function normalizePortfolioMarkdownBody(markdown) {
  return String(markdown || '')
    .replace(FRONTMATTER_PATTERN, '')
    .replace(LEADING_TITLE_PATTERN, '')
    .trim();
}

/**
 * @param {{ fetchImpl?: (input: RequestInfo | URL, init?: RequestInit) => Promise<Response> }} [options]
 */
export function createPortfolioMarkdownLoader({
  fetchImpl = (input, init) => fetch(input, init),
} = {}) {
  const cache = new Map();

  return {
    clear() {
      cache.clear();
    },

    /**
     * @param {string} sourcePath
     * @param {{ signal?: AbortSignal }} [options]
     */
    async load(sourcePath, { signal } = {}) {
      const path = String(sourcePath || '').trim();
      if (!path) throw new TypeError('Markdown source path is required');
      if (cache.has(path)) return cache.get(path);

      const response = await fetchImpl(path, { signal });
      if (!response?.ok) {
        throw new Error(`Markdown request failed: ${response?.status || 'unknown'}`);
      }
      const body = normalizePortfolioMarkdownBody(await response.text());
      cache.set(path, body);
      return body;
    },
  };
}
