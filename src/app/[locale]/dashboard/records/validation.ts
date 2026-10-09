import { CATEGORIES } from "./types";
import type { ErrorCode, FieldName, RecordInput } from "./types";

// If you change a limit, update the matching text in copy.ts too.
export const LIMITS = { titleMin: 3, titleMax: 80, providerMax: 80, notesMax: 500 };

// Server actions accept about 1 MB per request. See the note about raising this.
export const MAX_FILE_BYTES = 900 * 1024;
export const ALLOWED_TYPES = ["application/pdf", "image/jpeg", "image/png", "image/webp"];

// "YYYY-MM-DD" in Saudi time, so server and browser agree on "today".
export function todayInRiyadh(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Riyadh" }).format(new Date());
}

export function validateRecord(i: RecordInput) {
  const e: Partial<Record<FieldName, ErrorCode>> = {};

  const title = i.title.trim();
  if (!title) e.title = "required";
  else if (title.length < LIMITS.titleMin) e.title = "too_short";
  else if (title.length > LIMITS.titleMax) e.title = "too_long";

  if (!(CATEGORIES as readonly string[]).includes(i.category)) e.category = "invalid_category";

  const date = i.recordDate;
  if (!date) {
    e.recordDate = "required";
  } else {
    const d = new Date(`${date}T00:00:00Z`);
    const real =
      /^\d{4}-\d{2}-\d{2}$/.test(date) && !Number.isNaN(+d) && d.toISOString().slice(0, 10) === date;
    if (!real || date < "1920-01-01") e.recordDate = "invalid_date";
    else if (date > todayInRiyadh()) e.recordDate = "future_date";
  }

  if (i.provider.trim().length > LIMITS.providerMax) e.provider = "too_long";
  if (i.notes.trim().length > LIMITS.notesMax) e.notes = "too_long";

  return e;
}

// Checks the first bytes of the file, so a renamed file can't pass as a PDF or image.
export async function matchesType(file: File): Promise<boolean> {
  const b = new Uint8Array(await file.slice(0, 12).arrayBuffer());
  const ascii = (from: number, to: number) => String.fromCharCode(...b.slice(from, to));
  switch (file.type) {
    case "application/pdf": return ascii(0, 5) === "%PDF-";
    case "image/jpeg": return b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff;
    case "image/png": return b[0] === 0x89 && ascii(1, 4) === "PNG";
    case "image/webp": return ascii(0, 4) === "RIFF" && ascii(8, 12) === "WEBP";
    default: return false;
  }
}

export function formatSize(bytes: number, locale: string): string {
  const nf = new Intl.NumberFormat(locale === "ar" ? "ar-SA" : "en-US", { maximumFractionDigits: 1 });
  return bytes >= 1024 * 1024
    ? `${nf.format(bytes / 1024 / 1024)} MB`
    : `${nf.format(Math.max(1, Math.round(bytes / 1024)))} KB`;
}