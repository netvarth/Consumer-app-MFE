/** Accept raw and JSON-encoded strings without converting numeric IDs to numbers. */
export function normalizeStorageString(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  value = value.trim();
  for (let attempt = 0; attempt < 2 && typeof value === 'string'
    && value.startsWith('"') && value.endsWith('"'); attempt++) {
    try {
      value = JSON.parse(value);
      if (typeof value !== 'string') return null;
      value = value.trim();
    } catch {
      return null;
    }
  }
  if (typeof value !== 'string' || !value || /^(?:null|undefined|\[object Object\])$/i.test(value)) return null;
  return /[\u0000-\u001f\u007f]/.test(value) ? null : value;
}
