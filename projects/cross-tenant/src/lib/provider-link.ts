export function validatedProviderLink(value: unknown, currentOrigin?: string): string | null {
  if (typeof value !== 'string' || !value.trim() || typeof window === 'undefined') return null;
  const raw = value.trim();
  if (raw.startsWith('//')) return null;

  try {
    const origin = currentOrigin || window.location.origin;
    const url = new URL(raw, origin);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return null;
    const isLocalDevelopment = url.origin === origin && /^https?:$/.test(url.protocol);
    const isJaldeeApplication = url.protocol === 'https:'
      && (url.hostname === 'jaldee.com' || url.hostname.endsWith('.jaldee.com'));
    if (!isLocalDevelopment && !isJaldeeApplication) return null;
    if (url.username || url.password || url.hash) return null;
    // The custom application id in /capp/:customId is sufficient for the root
    // application to resolve the provider account. Older generated links also
    // include inst_id/app_id, but requiring those parameters makes canonical
    // provider links silently fall back to the marketplace service page.
    if (!/^\/capp\/[a-z0-9_-]+\/?$/i.test(url.pathname)) return null;
    return url.href;
  } catch {
    return null;
  }
}
