// Fixed timezone so server and browser always print the same time.
const TZ = "Asia/Riyadh";
const loc = (l: string) => (l === "ar" ? "ar-SA-u-ca-gregory" : "en-GB");

const fmt = (l: string, o: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat(loc(l), { timeZone: TZ, ...o });

export const dayNum = (iso: string, l: string) =>
  fmt(l, { day: "numeric" }).format(new Date(iso));

export const monthShort = (iso: string, l: string) =>
  fmt(l, { month: "short" }).format(new Date(iso));

export const fullDate = (iso: string, l: string) =>
  fmt(l, { weekday: "short", day: "numeric", month: "short", year: "numeric" }).format(
    new Date(iso)
  );

export const timeStr = (iso: string, l: string) =>
  fmt(l, { hour: "numeric", minute: "2-digit", hour12: true }).format(new Date(iso));

export const money = (n: number, currency: string, l: string) => {
  const num = new Intl.NumberFormat(loc(l), { maximumFractionDigits: 0 }).format(n);
  if (l === "ar") return `${num} ${currency === "SAR" ? "ر.س" : currency}`;
  return `${currency} ${num}`;
};

export const number = (n: number, l: string) =>
  new Intl.NumberFormat(l === "ar" ? "ar-SA" : "en-US").format(n);