// Private tracking links: 256-bit random token in the URL, only its SHA-256 stored.

const CROCKFORD = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";

export function newReference(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(10));
  return "APP-" + Array.from(bytes, (b) => CROCKFORD[b % 32]).join("");
}

export const REFERENCE_RE = /^APP-[0-9A-HJKMNP-TV-Z]{10}$/;

export function newToken(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return btoa(String.fromCharCode(...bytes)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export async function hashToken(token: string): Promise<string> {
  const d = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(token));
  return Array.from(new Uint8Array(d), (b) => b.toString(16).padStart(2, "0")).join("");
}

export async function tokenMatches(token: string, storedHash: string): Promise<boolean> {
  const h = await hashToken(token);
  if (h.length !== storedHash.length) return false;
  let diff = 0;
  for (let i = 0; i < h.length; i++) diff |= h.charCodeAt(i) ^ storedHash.charCodeAt(i);
  return diff === 0;
}
