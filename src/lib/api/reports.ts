import "server-only";
import { cache } from "react";
import { patientApi, requireSession } from "@/lib/auth/session";
import { d4hPatientApi } from "./d4h/patient";
import { pagination } from "./pagination";
import type { MedicalRecord } from "@/app/[locale]/dashboard/records/types";
type Report = {
  id: string; source_record_id: number; document_type: string; category?: string; title?: string;
  doctor?: { name: { en: string | null; ar: string | null } }; service?: { name: string };
  reference?: string; issued_at: string; size_bytes?: number;
};
export type ReportSource = "zuwara" | "d4h";
function card(row: Report, source: ReportSource, locale: string): MedicalRecord {
  if (!Number.isSafeInteger(row.source_record_id) || row.source_record_id < 1 || !Number.isFinite(Date.parse(row.issued_at))) throw new Error("Invalid report.");
  const type = source === "d4h" ? "d4h_result" : row.document_type;
  if (source === "zuwara" && !["prescription", "consultation_summary"].includes(type)) throw new Error("Invalid report type.");
  const ar = locale === "ar", category = source === "zuwara" ? type === "prescription" ? "prescription" : "report"
    : row.category === "lab_result" ? "lab" : row.category === "xray" ? "imaging" : "other";
  const title = row.title || (type === "prescription" ? ar ? "وصفة طبية" : "Prescription" : type === "consultation_summary" ? ar ? "ملخص الاستشارة" : "Consultation summary" : ar ? "نتيجة طبية" : "Medical result");
  const id = source + ":" + type + ":" + row.source_record_id;
  return { id, title, category, recordDate: row.issued_at.slice(0, 10),
    provider: row.doctor?.name[ar ? "ar" : "en"] || row.doctor?.name.en || row.service?.name,
    fileName: type + "-" + row.source_record_id + ".pdf", fileType: "application/pdf",
    fileSize: row.size_bytes ?? null, uploadedAt: row.issued_at, notes: row.reference };
}
export const getSourceReports = cache(async (source: ReportSource, locale: string): Promise<MedicalRecord[]> => {
  await requireSession();
  const result: MedicalRecord[] = [], seen = new Set<string>();
  for (let page = 1; page <= 100; page++) {
    const path = "/reports?per_page=50&page=" + page;
    const payload = source === "d4h" ? await d4hPatientApi<Report[]>(path, { locale }) : await patientApi<Report[]>(path, { locale });
    const p = pagination(payload); let added = 0;
    for (const row of payload.data) {
      const record = card(row, source, locale);
      if (!seen.has(record.id)) { seen.add(record.id); result.push(record); added++; }
    }
    if (!p.has_more) return result;
    if (!added) throw new Error("Invalid report pagination.");
  }
  throw new Error("Report pagination limit exceeded.");
});
export function reportPath(id: string): { source: ReportSource; path: string; filename: string } | null {
  const match = /^(zuwara|d4h):(prescription|consultation_summary|d4h_result):([1-9]\d*)$/.exec(id);
  if (!match || !Number.isSafeInteger(Number(match[3])) || (match[1] === "d4h") !== (match[2] === "d4h_result")) return null;
  const source = match[1] as ReportSource;
  return { source, path: source === "d4h" ? "/reports/" + match[3] + "/download" : "/reports/" + match[2] + "/" + match[3] + "/download", filename: match[2] + "-" + match[3] + ".pdf" };
}
