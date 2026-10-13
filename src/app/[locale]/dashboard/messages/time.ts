// Saudi time everywhere, so the server and the browser always agree.
const TZ = "Asia/Riyadh";
const loc = (l: string) => (l === "ar" ? "ar-SA-u-ca-gregory" : "en-GB");

export const dayKey = (d: Date | string) =>
  new Intl.DateTimeFormat("en-CA", { timeZone: TZ }).format(new Date(d));

const daysBetween = (a: string, b: string) =>
  Math.round((Date.parse(a) - Date.parse(b)) / 86_400_000);

export const clock = (iso: string, l: string) =>
  new Intl.DateTimeFormat(loc(l), {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: TZ,
  }).format(new Date(iso));

// Separator inside a chat: "Today", "Yesterday", or a full date.
export function dayLabel(
  iso: string,
  l: string,
  labels: { today: string; yesterday: string }
) {
  const diff = daysBetween(dayKey(new Date()), dayKey(iso));
  if (diff <= 0) return labels.today;
  if (diff === 1) return labels.yesterday;
  return new Intl.DateTimeFormat(loc(l), {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: TZ,
  }).format(new Date(iso));
}

// Short label in the conversation list: time today, then Yesterday, weekday, or date.
export function listTime(iso: string, l: string, labels: { yesterday: string }) {
  const diff = daysBetween(dayKey(new Date()), dayKey(iso));
  if (diff <= 0) return clock(iso, l);
  if (diff === 1) return labels.yesterday;
  if (diff < 7) {
    return new Intl.DateTimeFormat(loc(l), { weekday: "short", timeZone: TZ }).format(new Date(iso));
  }
  return new Intl.DateTimeFormat(loc(l), { day: "numeric", month: "short", timeZone: TZ }).format(
    new Date(iso)
  );
}