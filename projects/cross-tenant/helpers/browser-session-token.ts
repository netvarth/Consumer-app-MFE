/**
 * Recognizes a base64 browser authn descriptor, not a protected API or OAuth
 * refresh credential. Its presence does not prove that the backend established
 * an HttpOnly session. Validate the identity using available device credentials
 * and/or cookies before installing a switched account.
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
