export const CATEGORIES = [
  "lab", "imaging", "prescription", "report", "vaccination", "other",
] as const;
export type RecordCategory = (typeof CATEGORIES)[number];
export type CategoryFilter = RecordCategory | "all";

export type MedicalRecord = {
  id: string;
  title: string;
  category: RecordCategory;
  recordDate: string; // "YYYY-MM-DD"
  provider?: string; // doctor or facility
  notes?: string;
  fileName: string;
  fileType: string; // "application/pdf" | "image/jpeg" | ...
  fileSize: number; // bytes
  uploadedAt: string; // ISO 8601
};

export type RecordFilters = { category: CategoryFilter; q: string; page: number };

export type RecordsResult = {
  items: MedicalRecord[];
  total: number;
  page: number;
  pageSize: number;
  counts: Record<CategoryFilter, number>;
};

// Raw strings straight from the form.
export type RecordInput = {
  title: string;
  category: string;
  recordDate: string;
  provider: string;
  notes: string;
};

// The server returns codes; the UI translates them (see copy.ts).
export type ErrorCode =
  | "required"
  | "too_short"
  | "too_long"
  | "invalid_category"
  | "invalid_date"
  | "future_date"
  | "file_required"
  | "file_too_large"
  | "file_bad_type"
  | "not_found"
  | "generic";

export type FieldName = "title" | "category" | "recordDate" | "provider" | "notes" | "file";

export type FormState = {
  ok: boolean;
  errors?: Partial<Record<FieldName | "_form", ErrorCode>>;
};
export const initialFormState: FormState = { ok: false };

export type CreateResult = { ok: true; id: string } | { ok: false; code: ErrorCode };
export type ActionResult = { ok: true } | { ok: false; error: ErrorCode };

// What the file route needs to send a file to the browser.
export type RecordFile = { body: ArrayBuffer; type: string; name: string };