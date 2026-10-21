import "server-only";
import { requireSession } from "@/lib/auth/session";
import { getSourceReports } from "@/lib/api/reports";
import { CATEGORIES } from "./types";
import type { ActionResult, CategoryFilter, CreateResult, RecordFilters, RecordInput, RecordsResult } from "./types";
export const PAGE_SIZE = 6;
export async function getRecords(filters: RecordFilters, locale: string): Promise<RecordsResult> {
  const records = await getSourceReports(filters.source ?? "zuwara", locale);
  const q = filters.q.trim().toLocaleLowerCase(locale);
  const all = records.filter(r => !q || [r.title, r.provider ?? "", r.notes ?? ""].some(v => v.toLocaleLowerCase(locale).includes(q)))
    .sort((a, b) => b.uploadedAt.localeCompare(a.uploadedAt) || a.id.localeCompare(b.id));
  const counts = { all: all.length, ...Object.fromEntries(CATEGORIES.map(c => [c, all.filter(r => r.category === c).length])) } as Record<CategoryFilter, number>;
  const filtered = filters.category === "all" ? all : all.filter(r => r.category === filters.category);
  const page = Math.min(Math.max(1, filters.page), Math.max(1, Math.ceil(filtered.length / PAGE_SIZE)));
  return { items: filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE), total: filtered.length, page, pageSize: PAGE_SIZE, counts };
}
export async function createRecord(input: RecordInput, file: File): Promise<CreateResult> {
  void input; void file; await requireSession(); return { ok: false, code: "generic" };
}
export async function deleteRecord(id: string): Promise<ActionResult> {
  void id; await requireSession(); return { ok: false, error: "generic" };
}
