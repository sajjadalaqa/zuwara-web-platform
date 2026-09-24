import Image from "next/image";
import Link from "next/link";
import type { Service } from "@/data/site";
import { Icon } from "./Icon";

export function ServiceCard({ service, index }: { service: Service; index?: number }) {
  return (
    <article className="service-card">
      <div className="service-card-head"><span className="service-index">{String((index ?? 0) + 1).padStart(2, "0")}</span><div className="service-icon"><Image src={service.icon} alt="" width={34} height={34}/></div></div>
      <span className="eyebrow">{service.category}</span><h3>{service.title}</h3><p>{service.short}</p>
      <Link href={`/services/${service.slug}`} aria-label={`Learn about ${service.title}`}>Explore service <Icon name="arrow" size={17}/></Link>
    </article>
  );
}
