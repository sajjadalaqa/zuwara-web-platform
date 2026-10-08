export type ReviewTab = "pending" | "reviewed";
export type AppointmentKind = "consultation" | "visit" | "instant";

export type ProviderBrief = {
  id: string;
  name: string;
  specialty: string;
  avatarUrl?: string;
};

// A completed appointment that has no review yet.
export type PendingReview = {
  appointmentId: string;
  number: string;
  type: AppointmentKind;
  completedAt: string; // ISO 8601
  provider: ProviderBrief;
};

export type Review = {
  id: string;
  appointmentId: string;
  number: string;
  provider: ProviderBrief;
  rating: number; // 1 to 5
  comment: string;
  createdAt: string; // ISO 8601
  updatedAt?: string; // set when edited
};

export type Paged<T> = { items: T[]; total: number; page: number; pageSize: number };
export type ReviewCounts = Record<ReviewTab, number>;

export type ReviewInput = {
  appointmentId: string;
  reviewId?: string; // present = editing
  rating: number;
  comment: string;
};

// The server returns codes; the UI translates them (see copy.ts).
export type ErrorCode =
  | "rating_required"
  | "comment_too_long"
  | "not_found"
  | "already_reviewed"
  | "generic";

export type ServiceResult = { ok: true } | { ok: false; code: ErrorCode };
export type ActionResult = { ok: true } | { ok: false; error: ErrorCode };

export type FormState = {
  ok: boolean;
  errors?: Partial<Record<"rating" | "comment" | "_form", ErrorCode>>;
  values?: { rating: string; comment: string };
};

export const initialFormState: FormState = { ok: false };