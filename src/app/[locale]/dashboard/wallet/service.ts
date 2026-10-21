import "server-only";
import { cache } from "react";
import { patientApi, requireSession } from "@/lib/auth/session";
import { pagination, halalas } from "@/lib/api/pagination";
import { createRecharge } from "@/lib/api/zuwara/recharges";
import type { TopUpResult, TxFilters, TxResult, WalletSummary, Transaction } from "./types";
export const PAGE_SIZE = 8;
type Statement = {
  id: number | string; transaction_id: string | null; appointment_number: string | null;
  currency: string; amount_halalas: number; direction: "credit" | "debit";
  type_code: number | string; summary: string | null; created_at: string;
};
async function statements(query: URLSearchParams) {
  const payload = await patientApi<Statement[]>("/wallet/statements?" + query);
  pagination(payload); return payload;
}
function transaction(row: Statement): Transaction {
  if (!["credit", "debit"].includes(row.direction) || !Number.isFinite(Date.parse(row.created_at))) throw new Error("Invalid wallet statement.");
  return { id: String(row.id), type: row.direction, direction: row.direction === "credit" ? "in" : "out",
    status: "completed", amount: halalas(row.amount_halalas) / 100, currency: row.currency,
    createdAt: row.created_at, method: row.summary ?? "", reference: row.appointment_number ?? row.transaction_id ?? undefined };
}
export const getWalletSummary = cache(async (): Promise<WalletSummary> => {
  const start = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Riyadh", year: "numeric", month: "2-digit", day: "2-digit" })
    .format(new Date(Date.now() - 29 * 86_400_000));
  const { data: wallet } = await patientApi<{ currency: string; balance_halalas: number }>("/wallet");
  let moneyIn = 0, moneyOut = 0;
  const seen = new Set<string>();
  for (let page = 1; page <= 100; page++) {
    const payload = await statements(new URLSearchParams({ start_date: start, per_page: "50", page: String(page) }));
    let added = 0;
    for (const row of payload.data) {
      if (seen.has(String(row.id))) continue;
      seen.add(String(row.id)); added++;
      const amount = halalas(row.amount_halalas);
      if (row.direction === "credit") moneyIn += amount;
      else if (row.direction === "debit") moneyOut += amount;
      else throw new Error("Invalid wallet direction.");
      if (!Number.isSafeInteger(moneyIn) || !Number.isSafeInteger(moneyOut)) throw new Error("Invalid wallet totals.");
    }
    if (!pagination(payload).has_more) return { balance: halalas(wallet.balance_halalas) / 100, currency: wallet.currency, moneyIn30d: moneyIn / 100, moneyOut30d: moneyOut / 100 };
    if (!added) throw new Error("Invalid wallet pagination.");
  }
  throw new Error("Wallet statement limit exceeded.");
});
export async function getTransactions(filters: TxFilters, locale: string): Promise<TxResult> {
  void locale;
  const query = new URLSearchParams({ per_page: String(PAGE_SIZE), page: String(Math.max(1, filters.page)) });
  if (filters.type === "credit" || filters.type === "debit") query.set("direction", filters.type);
  const [payload, credit, debit] = await Promise.all([
    statements(query), statements(new URLSearchParams({ direction: "credit", per_page: "1" })),
    statements(new URLSearchParams({ direction: "debit", per_page: "1" })),
  ]);
  const p = pagination(payload);
  return { items: payload.data.map(transaction), total: p.total, page: p.current_page, pageSize: p.per_page,
    counts: { all: pagination(credit).total + pagination(debit).total, credit: pagination(credit).total, debit: pagination(debit).total } };
}
export async function createTopUp(amount: number): Promise<TopUpResult> {
  await requireSession();
  if (!Number.isInteger(amount) || amount < 10 || amount > 5000) return { ok: false, error: "invalid_amount" };
  return createRecharge(amount * 100);
}
