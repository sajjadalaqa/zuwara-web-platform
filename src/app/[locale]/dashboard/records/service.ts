import { getStore, samplePdf, type StoredRecord } from "./mock"; // TODO (backend): delete this import
import { CATEGORIES } from "./types";
import type {
  ActionResult, CategoryFilter, CreateResult, MedicalRecord,
  RecordFile, RecordFilters, RecordInput, RecordsResult,
} from "./types";

export const PAGE_SIZE = 6;

const toPublic = ({ data, ...rest }: StoredRecord): MedicalRecord => {
  void data;
  return rest;
};

const toArrayBuffer = (u8: Uint8Array): ArrayBuffer =>
  u8.buffer.slice(u8.byteOffset, u8.byteOffset + u8.byteLength) as ArrayBuffer;

export async function getRecords(filters: RecordFilters, locale: string): Promise<RecordsResult> {
  // TODO (backend): replace the body with
  // const qs = new URLSearchParams({
  //   category: filters.category, q: filters.q,
  //   page: String(filters.page), pageSize: String(PAGE_SIZE),
  // });
  // const res = await fetch(`${process.env.API_URL}/me/medical-records?${qs}`, {
  //   headers: { Authorization: `Bearer ${await getToken()}`, "Accept-Language": locale },
  //   cache: "no-store",
  // });
  // if (!res.ok) throw new Error("Failed to load records");
  // return (await res.json()) as RecordsResult;
  void locale;

  const q = filters.q.trim().toLowerCase();
  const base = getStore()
    .filter(
      (r) =>
        !q ||
        [r.title, r.provider ?? "", r.notes ?? ""].some((v) => v.toLowerCase().includes(q))
    )
    .sort(
      (a, b) =>
        b.recordDate.localeCompare(a.recordDate) || +new Date(b.uploadedAt) - +new Date(a.uploadedAt)
    );

  const counts = {
    all: base.length,
    ...Object.fromEntries(CATEGORIES.map((c) => [c, base.filter((r) => r.category === c).length])),
  } as Record<CategoryFilter, number>;

  const filtered = filters.category === "all" ? base : base.filter((r) => r.category === filters.category);
  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const page = Math.min(Math.max(1, filters.page), pages);

  return {
    items: filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE).map(toPublic),
    total: filtered.length,
    page,
    pageSize: PAGE_SIZE,
    counts,
  };
}

export async function createRecord(input: RecordInput, file: File): Promise<CreateResult> {
  // TODO (backend): send the file to your storage (or POST multipart to your API), then save the record:
  // const body = new FormData();
  // body.set("title", input.title); body.set("category", input.category); ... body.set("file", file);
  // const res = await fetch(`${process.env.API_URL}/medical-records`, {
  //   method: "POST", headers: { Authorization: `Bearer ${await getToken()}` }, body,
  // });
  // if (!res.ok) return { ok: false, code: "generic" };
  // const { id } = await res.json();
  // return { ok: true, id };
  const store = getStore();
  const id = `rec_${Date.now()}`;
  store.push({
    id,
    title: input.title.trim(),
    category: input.category as MedicalRecord["category"],
    recordDate: input.recordDate,
    provider: input.provider.trim() || undefined,
    notes: input.notes.trim() || undefined,
    fileName: file.name.slice(0, 120),
    fileType: file.type,
    fileSize: file.size,
    uploadedAt: new Date().toISOString(),
    data: Buffer.from(await file.arrayBuffer()).toString("base64"),
  });
  return { ok: true, id };
}

export async function deleteRecord(id: string): Promise<ActionResult> {
  // TODO (backend): DELETE `${API_URL}/medical-records/${id}` (404 -> { ok:false, error:"not_found" })
  const store = getStore();
  const i = store.findIndex((r) => r.id === id);
  if (i === -1) return { ok: false, error: "not_found" };
  store.splice(i, 1);
  return { ok: true };
}

// Used by the file route. Return null if the record doesn't exist or isn't the user's.
export async function getRecordFile(id: string): Promise<RecordFile | null> {
  // TODO (backend): ask your API for a short-lived signed URL and redirect to it from the route,
  // or stream the file from your storage after checking that it belongs to the signed-in user.
  const r = getStore().find((x) => x.id === id);
  if (!r) return null;
  const bytes = r.data ? new Uint8Array(Buffer.from(r.data, "base64")) : samplePdf(r.title);
  return { body: toArrayBuffer(bytes), type: r.fileType, name: r.fileName };
}