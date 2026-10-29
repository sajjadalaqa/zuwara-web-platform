import { useUiText } from "@/i18n/use-ui-text";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import type { Service } from "@/data/site";
import { Icon } from "./Icon";

export function ServiceCard({ service, index }: { service: Service; index?: number }) {
  const uiText = useUiText();
  return (
    <article className="service-card">
      <div className="service-card-head"><span className="service-index">{String((index ?? 0) + 1).padStart(2, "0")}</span><div className="service-icon"><Image src={service.icon} alt="" width={34} height={34}/></div></div>
      <span className="eyebrow">{uiText(service.category)}</span><h3>{uiText(service.title)}</h3><p>{uiText(service.short)}</p>
      <Link href={`/services/${service.slug}`} aria-label={`${uiText("Learn about")} ${uiText(service.title)}`}>{uiText("Explore service")}{" "}<Icon name="arrow" size={17}/></Link>
    </article>
  );
}
