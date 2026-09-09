// Preserve the public export for existing clients. App code imports the helper
// directly from helpers so it does not depend on this shared runtime export.
export { isBrowserSessionToken } from '../../helpers/browser-session-token';
