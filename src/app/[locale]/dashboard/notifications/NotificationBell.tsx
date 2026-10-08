import { copy } from "./copy";
import { getNotifications } from "./service";
import NotificationBellMenu from "./NotificationBellMenu";

const TZ_LIMIT = 5;

export default async function NotificationBell({ locale }: { locale: string }) {
  const isAr = locale === "ar";
  const t = isAr ? copy.ar : copy.en;
  const prefix = isAr ? "/ar" : "";
  const loc = isAr ? "ar-SA-u-ca-gregory" : "en-GB";

  const data = await getNotifications({ filter: "all", page: 1 }, locale);

  const rtf = new Intl.RelativeTimeFormat(loc, { numeric: "auto", style: "short" });
  const dateFmt = new Intl.DateTimeFormat(loc, {
    day: "numeric",
    month: "short",
    timeZone: "Asia/Riyadh",
  });

  const ago = (iso: string) => {
    const min = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
    if (min < 1) return t.justNow;
    if (min < 60) return rtf.format(-min, "minute");
    const h = Math.floor(min / 60);
    if (h < 24) return rtf.format(-h, "hour");
    const d = Math.floor(h / 24);
    if (d < 7) return rtf.format(-d, "day");
    return dateFmt.format(new Date(iso));
  };

  const items = data.items.slice(0, TZ_LIMIT).map((n) => ({
    id: n.id,
    kind: n.kind,
    title: n.title,
    body: n.body,
    time: ago(n.createdAt),
    read: n.read,
    href: n.href ? `${prefix}${n.href}` : undefined,
  }));

  return (
    <NotificationBellMenu
      items={items}
      unreadCount={data.counts.unread}
      viewAllHref={`${prefix}/dashboard/notifications`}
      labels={{
        title: t.title,
        markAll: t.markAll,
        viewAll: isAr ? "عرض كل الإشعارات" : "View all notifications",
        empty: t.empty.all.title,
        ariaLabel: t.title,
      }}
    />
  );
}