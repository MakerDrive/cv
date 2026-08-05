export function createRuntimeAssetUrl(relativePath, options = {}) {
  let baseUrl = options.baseUrl ?? document.baseURI;
  let moduleUrl = options.moduleUrl ?? import.meta.url;
  let assetUrl = new URL(relativePath, baseUrl);
  let version = new URL(moduleUrl).searchParams.get('v');
  if (version) assetUrl.searchParams.set('v', version);
  return assetUrl;
}
