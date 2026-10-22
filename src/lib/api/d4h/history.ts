import "server-only";
import { d4hPatientApi } from "./patient";
import { pagination, halalas } from "@/lib/api/pagination";
import { numericId, type CarePage } from "@/lib/api/zuwara/care";
export type HomeBooking = {
  id: number;
  booking_group_id: string | null;
  status: string;
  scheduled: {
    date: string;
    start_at: string | null;
    end_at: string | null;
    booking_slot: string;
  };
  service: { id: number; name: string; name_ar: string | null };
  provider: { id: number; name: string };
  address: string;
  description: string | null;
  amount: {
    subtotal: string;
    discount: string;
    tax: string;
    total: string;
    total_halalas: number;
    currency: string;
  };
  payment: {
    id?: number;
    transaction_id?: string;
    status?: string;
    payment_state?: string;
    method?: string;
    payment_method?: string;
    paid_at?: string;
    reference?: string;
    amount_halalas?: number;
    currency?: string;
  } | null;
  timeline?: {
    id: number;
    type: string;
    key: string;
    message: string;
    occurred_at: string;
  }[];
  created_at: string;
  updated_at: string;
};
export async function homeHistory(
  page = 1,
  query = new URLSearchParams(),
): Promise<CarePage<HomeBooking>> {
  const params = new URLSearchParams(query);
  params.set("per_page", "12");
  params.set("page", String(Number.isSafeInteger(page) && page > 0 ? page : 1));
  const payload = await d4hPatientApi<HomeBooking[]>("/bookings?" + params),
    p = pagination(payload);
  payload.data.forEach((row) => {
    numericId(row.id);
    halalas(row.amount.total_halalas);
  });
  return {
    items: payload.data,
    page: p.current_page,
    perPage: p.per_page,
    total: p.total,
    hasMore: p.has_more,
  };
}
export async function homeBooking(id: string) {
  const { data } = await d4hPatientApi<HomeBooking>(
    "/bookings/" + numericId(id),
  );
  if (data.id !== Number(id)) throw new Error("Booking mismatch.");
  halalas(data.amount.total_halalas);
  return data;
}
