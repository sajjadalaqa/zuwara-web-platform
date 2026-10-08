import { cache } from "react";
import { getStore } from "./mock"; // TODO (backend): delete this import
import { TX_TYPES } from "./types";
import type { TopUpResult, TxFilter, TxFilters, TxResult, WalletSummary } from "./types";

export const PAGE_SIZE = 8;

// cache() = one fetch per request, even if several components call it.
export const getWalletSummary = cache(async (): Promise<WalletSummary> => {
  // TODO (backend):
  // const res = await fetch(`${process.env.API_URL}/wallet`, {
  //   headers: { Authorization: `Bearer ${await getToken()}` }, cache: "no-store",
  // });
  // if (!res.ok) throw new Error("Failed to load wallet");
  // return (await res.json()) as WalletSummary;
  const { balance, txs } = getStore();
  const since = Date.now() - 30 * 24 * 3600 * 1000;
  const recent = txs.filter((t) => t.status === "completed" && +new Date(t.createdAt) >= since);
  const sum = (dir: "in" | "out") =>
    recent.filter((t) => t.direction === dir).reduce((n, t) => n + t.amount, 0);
  return { balance, currency: "SAR", moneyIn30d: sum("in"), moneyOut30d: sum("out") };
});

export async function getTransactions(filters: TxFilters, locale: string): Promise<TxResult> {
  // TODO (backend): replace the body with
  // const qs = new URLSearchParams({ type: filters.type, page: String(filters.page), pageSize: String(PAGE_SIZE) });
  // const res = await fetch(`${process.env.API_URL}/wallet/transactions?${qs}`, {
  //   headers: { Authorization: `Bearer ${await getToken()}`, "Accept-Language": locale },
  //   cache: "no-store",
  // });
  // if (!res.ok) throw new Error("Failed to load transactions");
  // return (await res.json()) as TxResult;
  void locale;

  const all = [...getStore().txs].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));

  const counts = {
    all: all.length,
    ...Object.fromEntries(TX_TYPES.map((t) => [t, all.filter((x) => x.type === t).length])),
  } as Record<TxFilter, number>;

  const filtered = filters.type === "all" ? all : all.filter((t) => t.type === filters.type);
  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const page = Math.min(Math.max(1, filters.page), pages);

  return {
    items: filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    total: filtered.length,
    page,
    pageSize: PAGE_SIZE,
    counts,
  };
}

export async function createTopUp(amount: number): Promise<TopUpResult> {
  // TODO (backend): create a payment session and return the gateway link:
  // const res = await fetch(`${process.env.API_URL}/wallet/topups`, {
  //   method: "POST",
  //   headers: { Authorization: `Bearer ${await getToken()}`, "Content-Type": "application/json" },
  //   body: JSON.stringify({ amount }),
  // });
  // if (!res.ok) return { ok: false, error: "generic" };
  // const { paymentUrl } = await res.json();
  // return { ok: true, paymentUrl };   // the UI redirects the user to paymentUrl
  //
  // The balance should only increase after your payment webhook confirms the payment.
  const store = getStore();
  store.balance += amount;
  store.txs.push({
    id: `tx_${Date.now()}`,
    type: "topup",
    direction: "in",
    status: "completed",
    amount,
    currency: "SAR",
    createdAt: new Date().toISOString(),
    method: "MyFatoorah",
  });
  return { ok: true };
}