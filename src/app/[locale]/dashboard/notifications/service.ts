import { cache } from "react";
import { patientApi } from "@/lib/auth/session";
import { ZuwaraV2Error } from "@/lib/api/zuwara/v2";
import type { ActionResult, AppNotification, NotificationFilters, NotificationsResult } from "./types";
export const PAGE_SIZE = 8;
type Card = {
  id: string; source_record_id: number; type: string | null; title: string | null; body: string | null;
  is_read: boolean; created_at: string | null; target: { entity: string; id: number } | null;
};
function notification(card: Card): AppNotification {
  const known = ["appointment", "payment", "request", "message", "system"];
  return { id: String(card.source_record_id), kind: known.includes(card.type ?? "") ? card.type as AppNotification["kind"] : "system",
    title: card.title ?? "", body: card.body ?? "", read: card.is_read, createdAt: card.created_at ?? "",
    href: card.target?.entity === "appointment" && Number.isSafeInteger(card.target.id) ? `/dashboard/appointments/${card.target.id}` : undefined };
}
export async function getNotifications(filters: NotificationFilters, locale: string): Promise<NotificationsResult> {
  const query = new URLSearchParams({ state: filters.filter, page: String(Math.max(1, filters.page)), per_page: String(PAGE_SIZE) });
  const payload = await patientApi<Card[]>(`/notifications?${query}`, { locale });
  if (!Array.isArray(payload.data) || !payload.meta?.pagination) throw new ZuwaraV2Error(502, "INVALID_RESPONSE");
  const pagination = payload.meta.pagination;
  const unread = payload.meta.unread_count;
  const through = payload.meta.read_all_through;
  if (!Number.isSafeInteger(unread) || !Number.isSafeInteger(through)) throw new ZuwaraV2Error(502, "INVALID_RESPONSE");
  // A separate all-page count is needed while filtering unread; retain accurate tab totals.
  const all = filters.filter === "all" ? pagination.total : (await patientApi<Card[]>("/notifications?state=all&per_page=1", { locale })).meta?.pagination?.total;
  if (all === undefined) throw new ZuwaraV2Error(502, "INVALID_RESPONSE");
  return { items: payload.data.map(notification), total: pagination.total, page: pagination.current_page, pageSize: pagination.per_page,
    counts: { all, unread: unread! }, readAllThrough: through! };
}
export const getUnreadCount = cache(async (): Promise<number> => {
  const { data } = await patientApi<{ unread_count: number }>("/notifications/unread-count");
  return data.unread_count;
});
export async function markRead(id: string): Promise<ActionResult> {
  if (!/^[1-9]\d*$/.test(id)) return { ok: false, error: "not_found" };
  try {
    await patientApi(`/notifications/${id}/read`, { method: "PUT", body: { read: true } });
    return { ok: true };
  } catch (error) {
    if (error instanceof ZuwaraV2Error) return { ok: false, error: error.code };
    throw error;
  }
}
export async function markAllRead(through: number): Promise<ActionResult> {
  if (!Number.isSafeInteger(through) || through < 0) return { ok: false, error: "invalid_boundary" };
  try {
    await patientApi("/notifications/read-all", { method: "PUT", body: { through_id: through } });
    return { ok: true };
  } catch (error) {
    if (error instanceof ZuwaraV2Error) return { ok: false, error: error.code };
    throw error;
  }
}