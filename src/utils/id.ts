/**
 * Simple ID helper (no extra dependencies).
 * Good enough for UI list keys in this app.
 */
export function makeId(prefix: string) {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 9)}`;
}

