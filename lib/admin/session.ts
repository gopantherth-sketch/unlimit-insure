// Signed admin session token. Pure: no cookies or env access here.
// Format: v2.<kind>.<sub b64url>.<ver>.<exp ms>.<hmac hex>

export type SessionKind = "env" | "db";

export interface SessionClaims {
  kind: SessionKind;
  /** env: the ADMIN_USERNAME; db: admin_users.id */
  sub: string;
  /** db: admin_users.session_version at login; env: always 1 */
  ver: number;
  /** Expiry, epoch ms. */
  exp: number;
}

const enc = new TextEncoder();

const b64url = (s: string) => btoa(String.fromCharCode(...enc.encode(s))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
function unb64url(s: string): string {
  const b = atob(s.replace(/-/g, "+").replace(/_/g, "/"));
  return new TextDecoder().decode(Uint8Array.from(b, (c) => c.charCodeAt(0)));
}

async function hmacHex(secret: string, data: string): Promise<string> {
  const key = await crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(data));
  return Array.from(new Uint8Array(sig), (b) => b.toString(16).padStart(2, "0")).join("");
}

export async function encodeSession(c: SessionClaims, secret: string): Promise<string> {
  const payload = `v2.${c.kind}.${b64url(c.sub)}.${c.ver}.${c.exp}`;
  return `${payload}.${await hmacHex(secret, payload)}`;
}

export async function decodeSession(token: string, secret: string, now = Date.now()): Promise<SessionClaims | null> {
  const parts = token.split(".");
  if (parts.length !== 6 || parts[0] !== "v2") return null;
  const [, kind, subEnc, verStr, expStr, sig] = parts as [string, string, string, string, string, string];
  if (kind !== "env" && kind !== "db") return null;
  const payload = parts.slice(0, 5).join(".");
  const expected = await hmacHex(secret, payload);
  if (sig.length !== expected.length) return null;
  let diff = 0;
  for (let i = 0; i < sig.length; i++) diff |= sig.charCodeAt(i) ^ expected.charCodeAt(i);
  if (diff !== 0) return null;
  const ver = Number(verStr);
  const exp = Number(expStr);
  if (!Number.isInteger(ver) || !Number.isFinite(exp) || exp < now) return null;
  let sub: string;
  try {
    sub = unb64url(subEnc);
  } catch {
    return null;
  }
  return { kind, sub, ver, exp };
}
