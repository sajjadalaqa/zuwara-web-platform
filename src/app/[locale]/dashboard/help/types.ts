export const FAQ_CATEGORIES = ["appointments", "payments", "requests", "account"] as const;
export type FaqCategory = (typeof FAQ_CATEGORIES)[number];
export type CategoryFilter = FaqCategory | "all";

export const TOPICS = ["appointment", "payment", "request", "account", "other"] as const;
export type Topic = (typeof TOPICS)[number];

// question and answer are already localized by the server (Accept-Language).
export type FaqItem = {
  id: string;
  category: FaqCategory;
  question: string;
  answer: string; // plain text; "\n" starts a new paragraph
};

export type FaqFilters = { q: string; category: CategoryFilter };

export type FaqResult = {
  items: FaqItem[];
  counts: Record<CategoryFilter, number>;
};

export type SupportInfo = {
  email: string;
  phone: string; // display format, e.g. "+966 11 000 0000"
  whatsapp: string; // digits only, e.g. "966500000000"
  hours: string; // already localized
};

export type TicketInput = { topic: string; message: string };

// The server returns codes; the UI translates them (see copy.ts).
export type ErrorCode =
  | "required"
  | "too_short"
  | "too_long"
  | "invalid_topic"
  | "rate_limited"
  | "generic";

export type ServiceResult = { ok: true } | { ok: false; code: ErrorCode };

export type FormState = {
  ok: boolean;
  errors?: Partial<Record<"topic" | "message" | "_form", ErrorCode>>;
};
export const initialFormState: FormState = { ok: false };