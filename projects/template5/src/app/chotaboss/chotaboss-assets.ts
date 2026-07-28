/**
 * Resolves assets beside the federated Home.js bundle. Absolute `/assets` URLs
 * resolve against the host application and therefore cannot be used by a remote.
 */
const remoteAssetBase = new URL('./chotaboss/', import.meta.url).href;

export function chotaBossAssetUrl(fileName: string): string {
  return remoteAssetBase + fileName;
}
