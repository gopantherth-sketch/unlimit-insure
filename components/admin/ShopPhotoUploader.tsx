"use client";

import { useState } from "react";
import { buttonClass } from "@/components/ui/button";

/** Longest side after resizing, and the stored-size limit (must match MAX_PHOTO_BYTES on the server). */
const MAX_SIDE = 1600;
const MAX_BYTES = 600 * 1024;

/** Resize in the browser to WebP (JPEG where WebP encoding is missing), lowering quality until it fits. */
async function resize(file: File): Promise<{ blob: Blob; width: number; height: number }> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();
  for (const q of [0.85, 0.75, 0.65, 0.5]) {
    const webp = await new Promise<Blob | null>((ok) => canvas.toBlob(ok, "image/webp", q));
    const blob = webp?.type === "image/webp" ? webp : await new Promise<Blob | null>((ok) => canvas.toBlob(ok, "image/jpeg", q));
    if (blob && blob.size <= MAX_BYTES) return { blob, width, height };
  }
  throw new Error("too_large");
}

/** Photo upload for one product. The server action re-checks type and size. */
export function ShopPhotoUploader({ slug, action }: { slug: string; action: (fd: FormData) => Promise<void> }) {
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);

  return (
    <form
      action={async (fd) => {
        setProblem(null);
        const file = fd.get("photo");
        if (!(file instanceof File) || file.size === 0) return setProblem("เลือกรูปก่อน");
        setBusy(true);
        try {
          const r = await resize(file);
          fd.set("photo", new File([r.blob], r.blob.type === "image/webp" ? "photo.webp" : "photo.jpg", { type: r.blob.type }));
          fd.set("width", String(r.width));
          fd.set("height", String(r.height));
        } catch {
          setBusy(false);
          return setProblem("อ่านรูปนี้ไม่ได้หรือรูปใหญ่เกินไป ลองรูป JPG หรือ PNG อื่น");
        }
        await action(fd);
        setBusy(false);
      }}
      className="space-y-3"
    >
      <input type="hidden" name="slug" value={slug} />
      <div>
        <label htmlFor="photo" className="field-label">รูปสินค้า (รูปถ่ายของเราเอง)</label>
        <input
          id="photo"
          name="photo"
          type="file"
          required
          accept="image/jpeg,image/png,image/webp"
          className="block w-full text-sm file:mr-3 file:rounded-full file:border-0 file:bg-brand-50 file:px-4 file:py-2 file:font-semibold file:text-brand-700"
        />
        <p className="mt-1 text-xs text-navy-500">ย่อขนาดให้อัตโนมัติก่อนอัปโหลด รูปสี่เหลี่ยมจัตุรัสแสดงผลดีที่สุด</p>
      </div>
      {problem && (
        <p role="alert" className="text-sm font-medium text-danger-600">
          {problem}
        </p>
      )}
      <button type="submit" disabled={busy} className={buttonClass("secondary", "sm")}>
        {busy ? "กำลังอัปโหลด…" : "อัปโหลดรูป"}
      </button>
    </form>
  );
}
