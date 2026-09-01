export function validatedProviderLink(value: unknown, currentOrigin?: string): string | null {
  if (typeof value !== 'string' || !value.trim() || typeof window === 'undefined') return null;
  const raw = value.trim();
  if (raw.startsWith('//')) return null;

  try {
    const origin = currentOrigin || window.location.origin;
    const url = new URL(raw, origin);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return null;
    const isCurrentOrigin = url.origin === origin;
    const isJaldeeApplication = url.protocol === 'https:'
      && (url.hostname === 'jaldee.com' || url.hostname.endsWith('.jaldee.com'));
    if (!isCurrentOrigin && !isJaldeeApplication) return null;
    if (!/^\/capp\/[^/]+\/?$/.test(url.pathname)) return null;
    if (!url.searchParams.get('inst_id') || !url.searchParams.get('app_id')) return null;
    return /^https?:\/\//i.test(raw) ? raw : url.href;
  } catch {
    return null;
  }
}
