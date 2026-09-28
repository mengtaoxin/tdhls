const ALLOWED_PROTOCOLS = new Set(['http:', 'https:']);

/** Returns the trimmed stream URL when it is an absolute http(s) URL, otherwise null. */
export function parseStreamUrl(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  try {
    const url = new URL(trimmed);
    return ALLOWED_PROTOCOLS.has(url.protocol) ? trimmed : null;
  } catch {
    return null;
  }
}
