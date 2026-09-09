/**
 * Browser login/switch responses can contain a base64 session descriptor instead
 * of an Authorization credential. These sessions authenticate with HttpOnly
 * cookies, just like normal browser login. This only selects the transport;
 * the server must still validate the session.
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
