import Link from "next/link";
import { JsonLd } from "./JsonLd";
import { SITE_URL } from "@/data/site";

export function Breadcrumbs({ items }: { items: Array<{ label: string; href?: string }> }) {
  return <>
    <nav className="breadcrumbs" aria-label="Breadcrumb"><ol>{items.map((item, index) => <li key={`${item.label}-${index}`}>{item.href && index < items.length - 1 ? <Link href={item.href}>{item.label}</Link> : <span aria-current={index === items.length - 1 ? "page" : undefined}>{item.label}</span>}</li>)}</ol></nav>
    <JsonLd data={{ "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: items.map((item, index) => ({ "@type": "ListItem", position: index + 1, name: item.label, ...(item.href ? { item: `${SITE_URL}${item.href}` } : {}) })) }} />
  </>;
}
