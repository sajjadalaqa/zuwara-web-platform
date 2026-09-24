import Link from "next/link";
import { Icon } from "./Icon";

export function PageHero({ eyebrow, title, description, action = true }: { eyebrow: string; title: string; description: string; action?: boolean }) {
  return (
    <section className="page-hero">
      <div className="container page-hero-grid">
        <div><span className="eyebrow">{eyebrow}</span><h1>{title}</h1></div>
        <div className="page-hero-copy">
          <p>{description}</p>
          {action && <div className="hero-actions"><Link href="/book" className="button button-primary">Book an appointment <Icon name="arrow" size={18}/></Link><Link href="/contact" className="text-link">Talk to our team <Icon name="arrow" size={17}/></Link></div>}
        </div>
      </div>
    </section>
  );
}
