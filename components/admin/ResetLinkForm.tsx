"use client";

import { useActionState } from "react";
import { resetLinkAction, type ResetLinkState } from "@/app/admin/(app)/applications/actions";
import { CopyLink } from "@/components/track/CopyLink";

export function ResetLinkForm({ id }: { id: string }) {
  const [state, action, pending] = useActionState(resetLinkAction, {} as ResetLinkState);
  return (
    <div className="card space-y-3 p-5">
      <h2 className="font-bold">ลิงก์ส่วนตัวของลูกค้า</h2>
      <p className="text-sm text-navy-500">
        สร้างลิงก์ใหม่เมื่อลูกค้าทำหาย ลิงก์เดิมและทุกอุปกรณ์ที่เปิดไว้จะใช้ไม่ได้ทันที ลิงก์ใหม่แสดงครั้งเดียว ส่งให้ลูกค้าทางช่องทางที่ยืนยันตัวตนแล้วเท่านั้น
      </p>
      {state.url ? (
        <CopyLink url={state.url} />
      ) : (
        <form action={action}>
          <input type="hidden" name="id" value={id} />
          <button type="submit" disabled={pending} className="inline-flex h-10 items-center rounded-full border border-navy-200 bg-white px-4 text-sm font-semibold text-navy-800 hover:bg-canvas disabled:opacity-60">
            สร้างลิงก์ใหม่
          </button>
        </form>
      )}
      {state.error && <p role="alert" className="text-sm text-danger-600">สร้างลิงก์ไม่สำเร็จ</p>}
    </div>
  );
}
