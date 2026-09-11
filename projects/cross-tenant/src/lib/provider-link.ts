export function validatedProviderLink(value: unknown, currentOrigin?: string, baseHref?: string): string | null {
  if (typeof value !== 'string' || !value.trim() || typeof window === 'undefined') return null;
  const configured = value.trim();
  // Some JSON editors copy links as [label](URL). Use the destination, then
  // apply the same origin/path checks as for a plain provider URL.
  const markdownLink = /^\[[^\]\r\n]*\]\((https?:\/\/[^\s()]+)\)$/i.exec(configured);
  const raw = markdownLink ? markdownLink[1] : configured;
  if (raw.startsWith('//')) return null;

  try {
    const origin = currentOrigin || window.location.origin;
    const base = new URL(baseHref ?? document.querySelector('base')?.getAttribute('href') ?? '/', origin);
    const basePath = base.pathname.replace(/\/?$/, '/');
    // Configured /:account links are app-relative, including when the shell is
    // deployed below /capp/. Do not resolve them against the current page.
    if (/^\/[a-z0-9_-]+\/?$/i.test(raw)) {
      return new URL(raw.slice(1), `${origin}${basePath}`).href;
    }
    const url = new URL(raw, origin);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return null;
    const isSameOrigin = url.origin === origin;
    // Local MFE shells may run on a different port from the current app. Honor
    // an explicit loopback providerlink instead of falling back to storeLink.
    const isLocalDevelopment = ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname);
    const isJaldeeApplication = url.protocol === 'https:'
      && (url.hostname === 'jaldee.com' || url.hostname.endsWith('.jaldee.com'));
    if (!isSameOrigin && !isLocalDevelopment && !isJaldeeApplication) return null;
    if (url.username || url.password || url.hash) return null;
    // The custom application id in /capp/:customId is sufficient for the root
    // application to resolve the provider account. Older generated links also
    // include inst_id/app_id, but requiring those parameters makes canonical
    // provider links silently fall back to the marketplace service page.
    const isAppAccount = url.pathname.startsWith(basePath)
      && /^[a-z0-9_-]+\/?$/i.test(url.pathname.slice(basePath.length));
    if (!isAppAccount && !/^\/capp\/[a-z0-9_-]+\/?$/i.test(url.pathname)) return null;
    return url.href;
  } catch {
    return null;
  }
}
