import "server-only";
import { d4hPatientApi } from "./patient";
import { pagination } from "@/lib/api/pagination";
import { uuid } from "@/lib/api/zuwara/care";
import type {
  NotificationsResult,
  NotificationFilters,
  AppNotification,
} from "@/app/[locale]/dashboard/notifications/types";
type Card = {
  source_record_id: string;
  type: string;
  title: string | null;
  body: string | null;
  is_read: boolean;
  read_at: string | null;
  created_at: string | null;
  target: { entity: string; id: number } | null;
};
export async function visitNotifications(
  filters: NotificationFilters,
  locale: string,
): Promise<NotificationsResult> {
  const query = new URLSearchParams({
    state: filters.filter,
    page: String(Math.max(1, filters.page)),
    per_page: "8",
  });
  const [payload, count] = await Promise.all([
    d4hPatientApi<Card[]>("/notifications?" + query, { locale }),
    d4hPatientApi<{ unread_count: number }>("/notifications/unread-count", {
      locale,
    }),
  ]);
  const p = pagination(payload);
  if (
    !Number.isSafeInteger(count.data.unread_count) ||
    count.data.unread_count < 0
  )
    throw new Error("Invalid unread count.");
  const all =
    filters.filter === "all"
      ? p.total
      : pagination(
          await d4hPatientApi<Card[]>("/notifications?state=all&per_page=1", {
            locale,
          }),
        ).total;
  const items: AppNotification[] = payload.data.map((row) => ({
    id: "d4h:" + uuid(row.source_record_id),
    kind: row.type === "booking" ? "request" : "system",
    title: row.title || "",
    body: row.body || "",
    read: row.is_read,
    createdAt: row.created_at || "",
    href:
      row.target?.entity === "booking" &&
      Number.isSafeInteger(row.target.id) &&
      row.target.id > 0
        ? "/dashboard/home-visits/" + row.target.id
        : undefined,
  }));
  return {
    items,
    total: p.total,
    page: p.current_page,
    pageSize: p.per_page,
    counts: { all, unread: count.data.unread_count },
    readAllThrough: 0,
    displayedIds: items.map((item) => item.id),
  };
}
export async function visitMarkRead(id: string, read: boolean) {
  await d4hPatientApi("/notifications/" + uuid(id) + "/read", {
    method: "PUT",
    body: { read },
  });
}
export async function visitMarkDisplayed(ids: string[]) {
  if (
    !Array.isArray(ids) ||
    ids.length < 1 ||
    ids.length > 100 ||
    new Set(ids).size !== ids.length
  )
    throw new Error("Invalid selection.");
  const notification_ids = ids.map((id) =>
    uuid(id.startsWith("d4h:") ? id.slice(4) : ""),
  );
  await d4hPatientApi("/notifications/read-batch", {
    method: "PUT",
    body: { notification_ids },
  });
}
