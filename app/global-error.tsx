"use client";

import { useEffect } from "react";
import { contact } from "@/content/contact";
import { lineAddUrl, telHref } from "@/lib/contact";
import { isStaleBuildError, reloadForStaleBuild } from "@/lib/stale-build";

/** Last-resort error page (root layout failed). Plain markup: the site layout and styles may be missing. */
export default function GlobalError({ error }: { error: Error & { digest?: string } }) {
  useEffect(() => {
    if (isStaleBuildError(error)) reloadForStaleBuild();
  }, [error]);

  return (
    <html lang="th">
      <body style={{ fontFamily: "system-ui, sans-serif", textAlign: "center", padding: "80px 16px", color: "#0B1330" }}>
        <h1 style={{ fontSize: 24 }}>หน้านี้โหลดไม่สำเร็จ</h1>
        <p>ลองโหลดใหม่อีกครั้ง หรือติดต่อเราได้ทันที</p>
        <p style={{ marginTop: 24, lineHeight: 2.2 }}>
          <button type="button" onClick={() => window.location.reload()} style={{ padding: "10px 18px", fontSize: 16 }}>
            โหลดใหม่
          </button>
          <br />
          <a href={lineAddUrl}>LINE {contact.lineId}</a> · <a href={telHref}>โทร {contact.phoneDisplay}</a>
        </p>
      </body>
    </html>
  );
}
