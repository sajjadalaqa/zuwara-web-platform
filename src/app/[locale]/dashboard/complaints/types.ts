export const COMPLAINT_STATUSES = ["open", "in_review", "resolved", "closed"] as const;
export type ComplaintStatus = (typeof COMPLAINT_STATUSES)[number];
export type StatusFilter = ComplaintStatus | "all";

export const CATEGORIES = [
  "appointment", "provider", "payment", "request", "app", "other",
] as const;
export type Category = (typeof CATEGORIES)[number];

export type Complaint = {
  id: string;
  number: string; // "CMP30001"
  category: Category;
  subject: string;
  description: string;
  relatedRef?: string; // appointment or request number
  status: ComplaintStatus;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
  repliesCount: number; // replies from support
};

export type ThreadMessage = {
  id: string;
  from: "you" | "support";
  body: string;
  createdAt: string; // ISO 8601
};

export type TimelineKey = "submitted" | "in_review" | "resolved" | "closed";

export type ComplaintDetail = Complaint & {
  messages: ThreadMessage[]; // replies only; the original text is `description`
  timeline: { key: TimelineKey; at: string }[]; // oldest first
};

export type ComplaintFilters = { status: StatusFilter; page: number };

export type ComplaintsResult = {
  items: Complaint[];
  total: number;
  page: number;
  pageSize: number;
  counts: Record<StatusFilter, number>;
};

// Raw strings straight from the form.
export type ComplaintInput = {
  category: string;
  subject: string;
  description: string;
  relatedRef: string;
};

// The server returns codes; the UI translates them (see copy.ts).
export type ErrorCode =
  | "required"
  | "too_short"
  | "too_long"
  | "invalid_category"
  | "invalid_reference"
  | "not_found"
  | "closed"
  | "rate_limited"
  | "generic";

export type FieldName = "category" | "subject" | "description" | "relatedRef" | "message";

export type FormState = {
  ok: boolean;
  errors?: Partial<Record<FieldName | "_form", ErrorCode>>;
};
export const initialFormState: FormState = { ok: false };

export type CreateResult = { ok: true; id: string } | { ok: false; code: ErrorCode };
export type ServiceResult = { ok: true } | { ok: false; code: ErrorCode };