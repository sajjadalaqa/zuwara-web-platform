export const REQUEST_STATUSES = ["open", "in_progress", "completed", "cancelled"] as const;
export type RequestStatus = (typeof REQUEST_STATUSES)[number];
export type StatusFilter = RequestStatus | "all";

export const CATEGORIES = [
  "nursing", "caregiver", "laboratory", "therapy", "injection", "pharmacy",
] as const;
export type Category = (typeof CATEGORIES)[number];

export type ServiceRequest = {
  id: string;
  number: string; // "REQ20001"
  category: Category;
  title: string;
  description: string;
  city: string;
  preferredDate: string; // "YYYY-MM-DD"
  budget?: number;
  currency: string; // "SAR"
  status: RequestStatus;
  offersCount: number;
  createdAt: string; // ISO 8601
  provider?: { id: string; name: string }; // set once a provider is chosen
};

export type RequestFilters = { status: StatusFilter; page: number };

export type RequestsResult = {
  items: ServiceRequest[];
  total: number;
  page: number;
  pageSize: number;
  counts: Record<StatusFilter, number>;
};

// Raw strings straight from the form.
export type RequestInput = {
  category: string;
  title: string;
  description: string;
  city: string;
  preferredDate: string;
  budget: string;
};

// The server returns codes; the UI translates them (see copy.ts).
export type ErrorCode =
  | "required"
  | "too_short"
  | "too_long"
  | "invalid_category"
  | "invalid_date"
  | "past_date"
  | "too_far"
  | "invalid_budget"
  | "not_found"
  | "not_cancellable"
  | "offer_unavailable"
  | "generic";

export type FieldName =
  | "category" | "title" | "description" | "city" | "preferredDate" | "budget";

export type FormState = {
  ok: boolean;
  errors?: Partial<Record<FieldName | "_form", ErrorCode>>;
};
export const initialFormState: FormState = { ok: false };

export type CreateResult = { ok: true; id: string } | { ok: false; code: ErrorCode };
export type ActionResult = { ok: true } | { ok: false; error: ErrorCode };

export type TimelineKey = "posted" | "accepted" | "completed" | "cancelled";
export type OfferStatus = "pending" | "accepted" | "declined";

export type Offer = {
  id: string;
  provider: { id: string; name: string; specialty: string; avatarUrl?: string };
  rating: number; // 0 to 5
  reviewsCount: number;
  price: number;
  currency: string; // "SAR"
  availableAt: string; // ISO 8601: when the provider can come
  message: string; // written by the provider
  status: OfferStatus;
  createdAt: string; // ISO 8601
};

export type RequestDetail = ServiceRequest & {
  offers: Offer[];
  agreedPrice?: number; // set once an offer is accepted
  timeline: { key: TimelineKey; at: string }[]; // oldest first
};