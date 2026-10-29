import { useUiText } from "@/i18n/use-ui-text";
import { Link } from "@/i18n/navigation";
import { JsonLd } from "./JsonLd";
import { SITE_URL } from "@/data/site";

export function Breadcrumbs({ items }: { items: Array<{ label: string; href?: string }> }) {
  const uiText = useUiText();
  return <>
    <nav className="breadcrumbs" aria-label={uiText("Breadcrumb")}><ol>{items.map((item, index) => <li key={`${uiText(item.label)}-${index}`}>{item.href && index < items.length - 1 ? <Link href={item.href}>{uiText(item.label)}</Link> : <span aria-current={index === items.length - 1 ? "page" : undefined}>{uiText(item.label)}</span>}</li>)}</ol></nav>
    <JsonLd data={{ "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: items.map((item, index) => ({ "@type": "ListItem", position: index + 1, name: item.label, ...(item.href ? { item: `${SITE_URL}${item.href}` } : {}) })) }} />
  </>;
}
