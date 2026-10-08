export const TX_TYPES = ["topup", "payment", "refund"] as const;
export type TxType = (typeof TX_TYPES)[number];
export type TxFilter = TxType | "all";
export type TxStatus = "completed" | "pending" | "failed";

export type Transaction = {
  id: string;
  type: TxType;
  direction: "in" | "out";
  status: TxStatus;
  amount: number; // always positive; direction says which way
  currency: string; // "SAR"
  createdAt: string; // ISO 8601
  method: string; // "MyFatoorah", "Wallet"...
  reference?: string; // e.g. appointment number
};

export type WalletSummary = {
  balance: number;
  currency: string;
  moneyIn30d: number;
  moneyOut30d: number;
};

export type TxFilters = { type: TxFilter; page: number };

export type TxResult = {
  items: Transaction[];
  total: number;
  page: number;
  pageSize: number;
  counts: Record<TxFilter, number>;
};

export type ErrorCode = "required" | "invalid_amount" | "generic";

// paymentUrl: when your backend returns a gateway checkout link, the UI redirects to it.
export type TopUpResult =
  | { ok: true; paymentUrl?: string }
  | { ok: false; error: ErrorCode };

export type TopUpState = {
  ok: boolean;
  error?: ErrorCode;
  paymentUrl?: string;
  value?: string;
};

export const initialTopUpState: TopUpState = { ok: false };