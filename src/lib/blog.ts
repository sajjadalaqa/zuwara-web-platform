import type { Bi, BlogPostData, BlogCategory } from "@/data/blog";
export type { Bi, BlogPostData, BlogCategory };
export const categories: BlogCategory[] = [];
export const pick = (value: Bi, locale: string) => locale === "ar" ? value.ar || value.en : value.en || value.ar;
export const getCategory = (id: string): BlogCategory | undefined => categories.find(c=>c.id===id);
export function formatDate(value: string, locale: string) {
 if (!value || !Number.isFinite(Date.parse(value))) return "";
 return new Intl.DateTimeFormat(locale === "ar" ? "ar-SA-u-ca-gregory" : "en-GB", {dateStyle:"long",timeZone:"UTC"}).format(new Date(value));
}