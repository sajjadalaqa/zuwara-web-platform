export function slugify(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\u0600-\u06ff]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 72);
}

export function doctorSlug(name: string, id: number): string {
  return `${slugify(name) || "consultant"}-${id}`;
}

export function specialtySlug(title: string, id: number): string {
  return `${slugify(title) || "specialty"}-${id}`;
}

export function idFromSlug(slug: string): number | null {
  const match = slug.match(/-(\d+)$/);
  if (!match) return null;
  const id = Number(match[1]);
  return Number.isInteger(id) && id > 0 ? id : null;
}
