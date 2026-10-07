import { getStore } from "./mock"; // TODO (backend): delete this import
import { STATUSES } from "./types";
import type {
  ActionResult,
  AppointmentFilters,
  AppointmentsResult,
  StatusFilter,
} from "./types";

export const PAGE_SIZE = 6;

export async function getAppointments(
  filters: AppointmentFilters,
  locale: string
): Promise<AppointmentsResult> {
  // TODO (backend): replace this whole function body with something like:
  //
  // const qs = new URLSearchParams({
  //   status: filters.status, q: filters.q,
  //   page: String(filters.page), pageSize: String(PAGE_SIZE),
  // });
  // const res = await fetch(`${process.env.API_URL}/appointments?${qs}`, {
  //   headers: { Authorization: `Bearer ${await getToken()}`, "Accept-Language": locale },
  //   cache: "no-store",
  // });
  // if (!res.ok) throw new Error("Failed to load appointments"); // shows error.tsx
  // return (await res.json()) as AppointmentsResult;
  void locale;

  const q = filters.q.trim().toLowerCase();
  const base = getStore()
    .filter(
      (a) =>
        !q ||
        [a.number, a.provider.name, a.provider.specialty].some((v) =>
          v.toLowerCase().includes(q)
        )
    )
    .sort((a, b) => +new Date(b.startsAt) - +new Date(a.startsAt));

  const counts = {
    all: base.length,
    ...Object.fromEntries(
      STATUSES.map((s) => [s, base.filter((a) => a.status === s).length])
    ),
  } as Record<StatusFilter, number>;

  const filtered =
    filters.status === "all" ? base : base.filter((a) => a.status === filters.status);

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

export async function cancelAppointment(id: string): Promise<ActionResult> {
  // TODO (backend): replace with
  // const res = await fetch(`${process.env.API_URL}/appointments/${id}/cancel`, {
  //   method: "POST", headers: { Authorization: `Bearer ${await getToken()}` },
  // });
  // if (!res.ok) return { ok: false, error: res.status === 404 ? "not_found" : "not_cancellable" };
  // return { ok: true };

  const item = getStore().find((a) => a.id === id);
  if (!item) return { ok: false, error: "not_found" };
  if (item.status !== "pending" && item.status !== "accepted") {
    return { ok: false, error: "not_cancellable" };
  }
  item.status = "cancelled";
  return { ok: true };
}