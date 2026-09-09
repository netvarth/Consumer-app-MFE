/**
 * Browser login/switch responses can contain a base64 session descriptor instead
 * of a credential for protected API calls. Login and OAuth refresh accept this
 * authn proof in Authorization; profile/cart calls use the resulting HttpOnly
 * cookie session. This only selects the transport; the server validates login.
 *
 * Keep this stateless helper outside src, which native federation shares as
 * @consumer/cross-tenant. Each app must bundle it without requiring a newer
 * shared runtime from an independently deployed shell.
 */
export function isBrowserSessionToken(token: unknown): boolean {
  if (typeof token !== 'string' || !token) return false;
  try {
    const session = JSON.parse(atob(token.replace(/-/g, '+').replace(/_/g, '/')));
    return session?.typ === 'authn' && session?.app === 'browser'
      && typeof session?.isl === 'string' && !!session.isl.trim();
  } catch {
    // Opaque authorization tokens and signed tokens keep their existing handling.
    return false;
  }
}
