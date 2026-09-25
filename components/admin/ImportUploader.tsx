"use client";

import Link from "next/link";
import { CircleCheck, FileSpreadsheet, Loader2, TriangleAlert } from "lucide-react";
import { useState } from "react";
import { commitImport, previewImport, type ImportPreview } from "@/app/admin/(app)/actions";
import { buttonClass } from "@/components/ui/button";
import type { ImportSummary } from "@/lib/db/import";
import { importSheets } from "@/lib/import/columns";
import { checkHeaders, rowsFromSheet, type CellValue, type ImportIssue, type RawWorkbook } from "@/lib/import/validate";

type State =
  | { step: "idle" }
  | { step: "reading" }
  | { step: "preview"; fileName: string; workbook: RawWorkbook; preview: ImportPreview; headerIssues: ImportIssue[] }
  | { step: "saving" }
  | { step: "done"; summary: ImportSummary }
  | { step: "error"; message: string };

async function readWorkbook(file: File): Promise<{ workbook: RawWorkbook; headerIssues: ImportIssue[] }> {
  const { default: readXlsxFile } = await import("read-excel-file/browser");
  const sheets = await readXlsxFile(file);
  const workbook: RawWorkbook = {};
  const headerIssues: ImportIssue[] = [];
  for (const def of importSheets) {
    const s = sheets.find((x) => x.sheet === def.name);
    if (!s) continue;
    const data = s.data.map((r) => r.map((c) => (c instanceof Date ? c.toISOString().slice(0, 10) : (c as CellValue))));
    const { headers, rows } = rowsFromSheet(data);
    headerIssues.push(...checkHeaders(def, headers));
    workbook[def.name] = rows;
  }
  return { workbook, headerIssues };
}

function IssueTable({ title, issues, tone }: { title: string; issues: ImportIssue[]; tone: "error" | "warning" }) {
  if (issues.length === 0) return null;
  return (
    <section className="card overflow-hidden">
      <h3 className={`px-5 pt-4 font-bold ${tone === "error" ? "text-danger-600" : "text-warning-700"}`}>
        {title} ({issues.length})
      </h3>
      <div className="mt-2 max-h-96 overflow-auto">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-canvas text-left text-navy-500">
            <tr>
              <th scope="col" className="px-4 py-2 font-medium">ชีต</th>
              <th scope="col" className="px-4 py-2 font-medium">แถว</th>
              <th scope="col" className="px-4 py-2 font-medium">คอลัมน์</th>
              <th scope="col" className="px-4 py-2 font-medium">ปัญหา</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-navy-100">
            {issues.map((i, n) => (
              <tr key={n}>
                <td className="px-4 py-2">{i.sheet}</td>
                <td className="tabular px-4 py-2">{i.row}</td>
                <td className="px-4 py-2 font-mono text-xs">{i.column ?? "—"}</td>
                <td className="px-4 py-2">{i.message}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export function ImportUploader() {
  const [state, setState] = useState<State>({ step: "idle" });

  const onFile = async (file: File | undefined) => {
    if (!file) return;
    if (!file.name.toLowerCase().endsWith(".xlsx")) {
      setState({ step: "error", message: "รองรับเฉพาะไฟล์ .xlsx" });
      return;
    }
    setState({ step: "reading" });
    let parsed: Awaited<ReturnType<typeof readWorkbook>>;
    try {
      parsed = await readWorkbook(file);
    } catch {
      setState({ step: "error", message: "อ่านไฟล์ไม่ได้ ตรวจว่าเป็นไฟล์ Excel (.xlsx) ที่สร้างจากแม่แบบ" });
      return;
    }
    const { workbook, headerIssues } = parsed;
    if (!workbook.products && !workbook.insurers && !workbook.vehicles) {
      setState({ step: "error", message: "ไม่พบชีต insurers, vehicles หรือ products ในไฟล์นี้" });
      return;
    }
    try {
      const preview = await previewImport(workbook);
      setState({ step: "preview", fileName: file.name, workbook, preview, headerIssues });
    } catch {
      setState({ step: "error", message: "ตรวจไฟล์บนเซิร์ฟเวอร์ไม่สำเร็จ ลองใหม่อีกครั้ง ถ้ายังไม่ได้ให้แจ้งทีมพัฒนา" });
    }
  };

  const onCommit = async () => {
    if (state.step !== "preview") return;
    const { workbook } = state;
    setState({ step: "saving" });
    try {
      const res = await commitImport(workbook);
      setState(res.ok ? { step: "done", summary: res.summary } : { step: "error", message: `ยังมีข้อผิดพลาด ${res.errors} รายการ แก้ไฟล์แล้วอัปโหลดใหม่` });
    } catch {
      setState({ step: "error", message: "บันทึกไม่สำเร็จ ลองใหม่อีกครั้ง" });
    }
  };

  const busy = state.step === "reading" || state.step === "saving";

  return (
    <div className="space-y-6">
      <label className="card flex cursor-pointer flex-col items-center gap-3 border-2 border-dashed border-navy-200 p-8 text-center hover:border-brand-300 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-brand-500">
        <FileSpreadsheet aria-hidden className="h-10 w-10 text-brand-600" />
        <span className="font-semibold">เลือกไฟล์ .xlsx จากแม่แบบ</span>
        <span className="text-sm text-navy-500">ระบบจะตรวจทุกแถวก่อน ยังไม่มีอะไรถูกบันทึกจนกว่าคุณกดยืนยัน</span>
        <input
          type="file"
          accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          className="sr-only"
          disabled={busy}
          onChange={(e) => {
            void onFile(e.target.files?.[0]);
            e.target.value = "";
          }}
        />
      </label>

      {busy && (
        <p role="status" className="flex items-center gap-2 text-navy-600">
          <Loader2 aria-hidden className="h-4 w-4 animate-spin" />
          {state.step === "reading" ? "กำลังอ่านและตรวจไฟล์…" : "กำลังนำเข้า…"}
        </p>
      )}

      {state.step === "error" && (
        <p role="alert" className="flex items-center gap-2 rounded-xl bg-danger-50 p-4 text-sm font-medium text-danger-600">
          <TriangleAlert aria-hidden className="h-4 w-4" />
          {state.message}
        </p>
      )}

      {state.step === "preview" && (
        <div className="space-y-5">
          <section className="card p-5">
            <h2 className="text-lg font-bold">{state.fileName}</h2>
            <dl className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                ["บริษัท", state.preview.counts.insurers],
                ["ยี่ห้อ", state.preview.counts.brands],
                ["รุ่นรถ", state.preview.counts.models],
                ["เวอร์ชันแพ็กเกจ", state.preview.counts.versions],
              ].map(([k, v]) => (
                <div key={k} className="rounded-xl bg-canvas p-3">
                  <dt className="text-xs text-navy-500">{k}</dt>
                  <dd className="tabular text-2xl font-bold">{v}</dd>
                </div>
              ))}
            </dl>
            {state.preview.errors.length === 0 ? (
              <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm text-navy-600">ไม่พบข้อผิดพลาด แพ็กเกจจะถูกนำเข้าเป็นฉบับร่าง และต้องตรวจสอบกับเอกสารก่อนเผยแพร่</p>
                <button type="button" onClick={onCommit} className={buttonClass("primary", "md")}>
                  นำเข้าเป็นฉบับร่าง
                </button>
              </div>
            ) : (
              <p className="mt-5 text-sm font-medium text-danger-600">แก้ข้อผิดพลาดด้านล่างในไฟล์ แล้วอัปโหลดใหม่</p>
            )}
          </section>
          <IssueTable title="ข้อผิดพลาด" issues={state.preview.errors} tone="error" />
          <IssueTable title="ควรตรวจสอบ" issues={[...state.headerIssues, ...state.preview.warnings]} tone="warning" />
          {state.preview.versions.length > 0 && (
            <section className="card overflow-hidden">
              <h3 className="px-5 pt-4 font-bold">เวอร์ชันที่จะนำเข้า</h3>
              <div className="mt-2 max-h-96 overflow-auto">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-canvas text-left text-navy-500">
                    <tr>
                      <th scope="col" className="px-4 py-2 font-medium">แถว</th>
                      <th scope="col" className="px-4 py-2 font-medium">แพ็กเกจ</th>
                      <th scope="col" className="px-4 py-2 font-medium">ประเภท</th>
                      <th scope="col" className="px-4 py-2 font-medium">มีผล</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-navy-100">
                    {state.preview.versions.map((v) => (
                      <tr key={`${v.productId}-${v.row}`}>
                        <td className="tabular px-4 py-2">{v.row}</td>
                        <td className="px-4 py-2">
                          {v.productName} <span className="font-mono text-xs text-navy-400">{v.productId}</span>
                        </td>
                        <td className="px-4 py-2">{v.insuranceType}</td>
                        <td className="tabular px-4 py-2">
                          {v.effectiveFrom} – {v.effectiveUntil}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}
        </div>
      )}

      {state.step === "done" && (
        <section role="status" className="card p-6">
          <p className="flex items-center gap-2 text-lg font-bold text-success-700">
            <CircleCheck aria-hidden className="h-5 w-5" />
            นำเข้าแล้ว
          </p>
          <ul className="mt-3 space-y-1 text-sm text-navy-700">
            <li>เวอร์ชันใหม่ (ฉบับร่าง): {state.summary.versionsCreated}</li>
            <li>แพ็กเกจใหม่: {state.summary.productsCreated} · ปรับชื่อ/สรุป: {state.summary.productsUpdated}</li>
            <li>บริษัท: {state.summary.insurersUpserted} · รุ่นรถ: {state.summary.modelsUpserted}</li>
            {state.summary.versionsSkipped.length > 0 && <li>ข้ามเพราะซ้ำกับเวอร์ชันเดิม: {state.summary.versionsSkipped.length}</li>}
          </ul>
          <Link href="/admin/products" className={buttonClass("primary", "md", "mt-5")}>
            ไปตรวจสอบและเผยแพร่
          </Link>
        </section>
      )}
    </div>
  );
}
