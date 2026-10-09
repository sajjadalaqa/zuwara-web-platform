import type { MedicalRecord } from "./types";

export type StoredRecord = MedicalRecord & { data?: string }; // base64 of uploaded files

const PDF = "application/pdf";

// TODO (backend): delete this file.
// Seed records have no real file, so the file route generates a small sample PDF for them.
const seed: StoredRecord[] = [
  { id: "rec_1", title: "Complete blood count (CBC)", category: "lab", recordDate: "2026-10-03", provider: "Al Noor Lab", notes: "Routine yearly check. Everything within normal range.", fileName: "cbc-blood-test.pdf", fileType: PDF, fileSize: 184320, uploadedAt: "2026-10-03T12:00:00Z" },
  { id: "rec_2", title: "Vitamin D level", category: "lab", recordDate: "2026-09-20", provider: "Al Noor Lab", fileName: "vitamin-d.pdf", fileType: PDF, fileSize: 96256, uploadedAt: "2026-09-20T11:00:00Z" },
  { id: "rec_3", title: "Knee X-ray", category: "imaging", recordDate: "2026-09-12", provider: "Riyadh Imaging Center", notes: "Taken after the sports injury. Report attached.", fileName: "knee-xray-report.pdf", fileType: PDF, fileSize: 412672, uploadedAt: "2026-09-12T15:00:00Z" },
  { id: "rec_4", title: "Antibiotics prescription", category: "prescription", recordDate: "2026-10-05", provider: "Dr. Khalid Al-Harbi", notes: "7-day course, twice daily after meals.", fileName: "prescription-oct-2026.pdf", fileType: PDF, fileSize: 58368, uploadedAt: "2026-10-05T17:30:00Z" },
  { id: "rec_5", title: "Dermatology consultation report", category: "report", recordDate: "2026-08-28", provider: "Dr. Sara Al-Qahtani", fileName: "dermatology-report.pdf", fileType: PDF, fileSize: 143360, uploadedAt: "2026-08-28T10:00:00Z" },
  { id: "rec_6", title: "Flu vaccine certificate", category: "vaccination", recordDate: "2026-09-30", provider: "Dr. Faisal Al-Mutairi", fileName: "flu-vaccine.pdf", fileType: PDF, fileSize: 71680, uploadedAt: "2026-09-30T09:00:00Z" },
  { id: "rec_7", title: "Chest ultrasound", category: "imaging", recordDate: "2026-07-18", provider: "Riyadh Imaging Center", fileName: "chest-ultrasound.pdf", fileType: PDF, fileSize: 356352, uploadedAt: "2026-07-18T13:00:00Z" },
  { id: "rec_8", title: "Nutrition plan", category: "report", recordDate: "2026-09-28", provider: "Dr. Layla Al-Ghamdi", notes: "4-week plan with weekly check-ins.", fileName: "nutrition-plan.pdf", fileType: PDF, fileSize: 120832, uploadedAt: "2026-09-28T14:00:00Z" },
  { id: "rec_9", title: "Insurance approval letter", category: "other", recordDate: "2026-06-10", fileName: "insurance-approval.pdf", fileType: PDF, fileSize: 45056, uploadedAt: "2026-06-10T08:00:00Z" },
];

declare global {
  // eslint-disable-next-line no-var
  var __zuwaraRecords: StoredRecord[] | undefined;
}

export function getStore(): StoredRecord[] {
  if (!globalThis.__zuwaraRecords) globalThis.__zuwaraRecords = structuredClone(seed);
  return globalThis.__zuwaraRecords;
}

// A tiny valid one-page PDF, so View and Download work for the seed records.
export function samplePdf(title: string): Uint8Array {
  const esc = (v: string) => v.replace(/[\\()]/g, "\\$&").replace(/[^\x20-\x7E]/g, "?");
  const stream = `BT /F1 18 Tf 60 740 Td (${esc(title)}) Tj 0 -30 Td /F1 11 Tf (Sample record - mock data) Tj ET`;
  const objs = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>",
    `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`,
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
  ];
  let pdf = "%PDF-1.4\n";
  const offsets: number[] = [];
  objs.forEach((o, i) => {
    offsets.push(pdf.length);
    pdf += `${i + 1} 0 obj\n${o}\nendobj\n`;
  });
  const xref = pdf.length;
  pdf += `xref\n0 ${objs.length + 1}\n0000000000 65535 f \n`;
  pdf += offsets.map((o) => `${String(o).padStart(10, "0")} 00000 n \n`).join("");
  pdf += `trailer\n<< /Size ${objs.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
  return new TextEncoder().encode(pdf);
}