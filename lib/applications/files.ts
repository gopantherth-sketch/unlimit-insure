// Upload rules: type decided from the file's first bytes, never from the name or the browser's claim.

export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;
export const MAX_DOCUMENTS_PER_APPLICATION = 30;

export type AllowedType = "image/jpeg" | "image/png" | "image/webp" | "image/heic" | "application/pdf";

const ascii = (b: Uint8Array, start: number, len: number) => String.fromCharCode(...b.subarray(start, start + len));

export function sniffType(head: Uint8Array): AllowedType | null {
  if (head.length >= 3 && head[0] === 0xff && head[1] === 0xd8 && head[2] === 0xff) return "image/jpeg";
  if (head.length >= 8 && ascii(head, 0, 8) === "\x89PNG\r\n\x1a\n") return "image/png";
  if (head.length >= 12 && ascii(head, 0, 4) === "RIFF" && ascii(head, 8, 4) === "WEBP") return "image/webp";
  if (head.length >= 12 && ascii(head, 4, 4) === "ftyp" && ["heic", "heix", "mif1", "msf1", "hevc"].includes(ascii(head, 8, 4))) return "image/heic";
  if (head.length >= 5 && ascii(head, 0, 5) === "%PDF-") return "application/pdf";
  return null;
}

const EXT: Record<AllowedType, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/heic": "heic",
  "application/pdf": "pdf",
};

/** Display name: keep letters (incl. Thai), digits, dot, dash, underscore, space; force the sniffed extension. */
export function safeFileName(original: string, type: AllowedType): string {
  const base =
    original
      .replace(/\.[^.]*$/, "")
      .normalize("NFC")
      .replace(/[^\p{L}\p{N}\p{M} ._-]/gu, "")
      .replace(/\.{2,}/g, ".")
      .replace(/^[.\s]+/, "")
      .trim()
      .slice(0, 80) || "document";
  return `${base}.${EXT[type]}`;
}
