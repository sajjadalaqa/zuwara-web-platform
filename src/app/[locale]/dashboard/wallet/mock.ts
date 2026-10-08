import type { Transaction } from "./types";

const C = "SAR";

const seed: Transaction[] = [
  { id: "tx_1", type: "topup", direction: "in", status: "completed", amount: 500, currency: C, createdAt: "2026-10-06T10:00:00Z", method: "MyFatoorah" },
  { id: "tx_2", type: "payment", direction: "out", status: "completed", amount: 120, currency: C, createdAt: "2026-10-05T14:30:00Z", method: "Wallet", reference: "APT10002" },
  { id: "tx_3", type: "payment", direction: "out", status: "pending", amount: 90, currency: C, createdAt: "2026-10-05T08:15:00Z", method: "Wallet", reference: "APT10004" },
  { id: "tx_4", type: "refund", direction: "in", status: "completed", amount: 150, currency: C, createdAt: "2026-10-04T15:30:00Z", method: "Wallet", reference: "APT10009" },
  { id: "tx_5", type: "payment", direction: "out", status: "completed", amount: 280, currency: C, createdAt: "2026-10-03T11:00:00Z", method: "Wallet", reference: "APT10007" },
  { id: "tx_6", type: "payment", direction: "out", status: "completed", amount: 130, currency: C, createdAt: "2026-10-02T17:00:00Z", method: "Wallet", reference: "APT10006" },
  { id: "tx_7", type: "topup", direction: "in", status: "completed", amount: 200, currency: C, createdAt: "2026-10-01T09:00:00Z", method: "MyFatoorah" },
  { id: "tx_8", type: "refund", direction: "in", status: "completed", amount: 280, currency: C, createdAt: "2026-09-30T10:30:00Z", method: "Wallet", reference: "APT10010" },
  { id: "tx_9", type: "topup", direction: "in", status: "failed", amount: 300, currency: C, createdAt: "2026-09-29T13:00:00Z", method: "MyFatoorah" },
  { id: "tx_10", type: "payment", direction: "out", status: "completed", amount: 110, currency: C, createdAt: "2026-09-28T13:00:00Z", method: "Wallet", reference: "APT10008" },
  { id: "tx_11", type: "payment", direction: "out", status: "completed", amount: 90, currency: C, createdAt: "2026-09-25T19:30:00Z", method: "Wallet", reference: "APT10012" },
  { id: "tx_12", type: "topup", direction: "in", status: "completed", amount: 400, currency: C, createdAt: "2026-09-22T12:00:00Z", method: "MyFatoorah" },
  { id: "tx_13", type: "payment", direction: "out", status: "completed", amount: 130, currency: C, createdAt: "2026-09-18T09:30:00Z", method: "Wallet", reference: "APT10014" },
  { id: "tx_14", type: "topup", direction: "in", status: "completed", amount: 150, currency: C, createdAt: "2026-09-15T16:00:00Z", method: "MyFatoorah" },
];

type Store = { balance: number; txs: Transaction[] };

declare global {
  // eslint-disable-next-line no-var
  var __zuwaraWallet: Store | undefined;
}

// TODO (backend): delete this file.
export function getStore(): Store {
  if (!globalThis.__zuwaraWallet) {
    globalThis.__zuwaraWallet = { balance: 520, txs: structuredClone(seed) };
  }
  return globalThis.__zuwaraWallet;
}