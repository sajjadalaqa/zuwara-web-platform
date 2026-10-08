export type NotificationKind = "appointment" | "payment" | "request" | "message" | "system";
export type NotificationFilter = "all" | "unread";

// Named AppNotification so it doesn't clash with the browser's built-in Notification.
export type AppNotification = {
  id: string;
  kind: NotificationKind;
  title: string; // already localized by the server (Accept-Language)
  body: string; // already localized
  href?: string; // path without locale prefix, e.g. "/dashboard/wallet"
  read: boolean;
  createdAt: string; // ISO 8601
};

export type NotificationFilters = { filter: NotificationFilter; page: number };

export type NotificationsResult = {
  items: AppNotification[];
  total: number;
  page: number;
  pageSize: number;
  counts: Record<NotificationFilter, number>;
};

export type ActionResult = { ok: true } | { ok: false; error: string };