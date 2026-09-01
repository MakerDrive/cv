export function createYouTubeNoCookieEmbedUrl(videoId, { origin = '' } = {}) {
  const normalizedVideoId = String(videoId || '').trim();
  if (!/^[A-Za-z0-9_-]+$/u.test(normalizedVideoId)) {
    throw new TypeError('a valid YouTube video id is required');
  }
  const url = new URL(`https://www.youtube-nocookie.com/embed/${normalizedVideoId}`);
  url.searchParams.set('rel', '0');
  url.searchParams.set('enablejsapi', '1');
  if (origin) url.searchParams.set('origin', new URL(String(origin)).origin);
  url.searchParams.set('playsinline', '1');
  return url.href;
}

export default createYouTubeNoCookieEmbedUrl;
