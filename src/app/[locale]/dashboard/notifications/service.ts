import { cache } from "react";
import { getStore } from "./mock"; // TODO (backend): delete this import
import type {
  ActionResult,
  AppNotification,
  NotificationFilters,
  NotificationsResult,
} from "./types";

export const PAGE_SIZE = 8;

export async function getNotifications(
  filters: NotificationFilters,
  locale: string
): Promise<NotificationsResult> {
  // TODO (backend): replace the body with
  // const qs = new URLSearchParams({ filter: filters.filter, page: String(filters.page), pageSize: String(PAGE_SIZE) });
  // const res = await fetch(`${process.env.API_URL}/me/notifications?${qs}`, {
  //   headers: { Authorization: `Bearer ${await getToken()}`, "Accept-Language": locale },
  //   cache: "no-store",
  // });
  // if (!res.ok) throw new Error("Failed to load notifications");
  // return (await res.json()) as NotificationsResult;
  const lang = locale === "ar" ? "ar" : "en";

  const all = [...getStore()].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
  const unread = all.filter((n) => !n.read);
  const filtered = filters.filter === "unread" ? unread : all;

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const page = Math.min(Math.max(1, filters.page), pages);

  const items: AppNotification[] = filtered
    .slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
    .map((n) => ({
      id: n.id,
      kind: n.kind,
      title: n.text[lang].title,
      body: n.text[lang].body,
      href: n.href,
      read: n.read,
      createdAt: n.createdAt,
    }));

  return {
    items,
    total: filtered.length,
    page,
    pageSize: PAGE_SIZE,
    counts: { all: all.length, unread: unread.length },
  };
}

// Used by the dashboard header badge. cache() = one fetch per request.
export const getUnreadCount = cache(async (): Promise<number> => {
  // TODO (backend): GET `${API_URL}/me/notifications/unread-count`
  return getStore().filter((n) => !n.read).length;
});

export async function markRead(id: string): Promise<ActionResult> {
  // TODO (backend): POST `${API_URL}/me/notifications/${id}/read`
  const n = getStore().find((x) => x.id === id);
  if (!n) return { ok: false, error: "not_found" };
  n.read = true;
  return { ok: true };
}

export async function markAllRead(): Promise<ActionResult> {
  // TODO (backend): POST `${API_URL}/me/notifications/read-all`
  getStore().forEach((n) => { n.read = true; });
  return { ok: true };
}