export const STATUSES = ["pending", "accepted", "completed", "cancelled", "declined"] as const;
export type AppointmentStatus = (typeof STATUSES)[number];
export type StatusFilter = AppointmentStatus | "all";
export type AppointmentType = "consultation" | "visit" | "instant";
export type PaymentStatus = "paid" | "unpaid" | "refunded";

export type Appointment = {
  id: string;
  number: string;
  status: AppointmentStatus;
  type: AppointmentType;
  startsAt: string; // ISO 8601, UTC
  durationMin: number;
  provider: { id: string; name: string; specialty: string; avatarUrl?: string };
  price: number;
  currency: string; // "SAR"
  paymentStatus: PaymentStatus;
  address?: string; // visits only
};

export type AppointmentFilters = {
  status: StatusFilter;
  q: string;
  page: number;
};

export type AppointmentsResult = {
  items: Appointment[];
  total: number;
  page: number;
  pageSize: number;
  counts: Record<StatusFilter, number>;
};

export type ActionResult = { ok: true } | { ok: false; error: string };

export type TimelineKey = "booked" | "accepted" | "completed" | "cancelled" | "declined";

export type AppointmentDetail = Appointment & {
  createdAt: string; // ISO 8601
  notes?: string;
  meetingUrl?: string; // video consultations, once the provider accepts
  timeline: { key: TimelineKey; at: string }[]; // oldest first
  payment: {
    method: string;
    subtotal: number;
    fee: number;
    total: number;
    paidAt?: string;
  };
};