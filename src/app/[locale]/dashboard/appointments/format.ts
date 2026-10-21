const TZ = "Asia/Riyadh";
const loc = (l: string) => l === "ar" ? "ar-SA-u-ca-gregory" : "en-GB";
function date(iso: string, l: string, options: Intl.DateTimeFormatOptions) {
  if (!Number.isFinite(Date.parse(iso))) return "—";
  return new Intl.DateTimeFormat(loc(l), { timeZone: TZ, ...options }).format(new Date(iso));
}
export const dayNum = (iso: string, l: string) => date(iso,l,{day:"numeric"});
export const monthShort = (iso: string, l: string) => date(iso,l,{month:"short"});
export const fullDate = (iso: string, l: string) => date(iso,l,{weekday:"short",day:"numeric",month:"short",year:"numeric"});
export const timeStr = (iso: string, l: string) => date(iso,l,{hour:"numeric",minute:"2-digit",hour12:true});
export const money = (n: number, currency: string, l: string) => {
  const value = new Intl.NumberFormat(loc(l), { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);
  return l === "ar" ? value + " " + (currency === "SAR" ? "ر.س" : currency) : currency + " " + value;
};
export const number = (n: number, l: string) => new Intl.NumberFormat(l === "ar" ? "ar-SA" : "en-US").format(n);
