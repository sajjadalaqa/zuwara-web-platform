import { useUiText } from "@/i18n/use-ui-text";
import { Link } from "@/i18n/navigation";
import { Icon } from "./Icon";

export function PageHero({ eyebrow, title, description, action = true }: { eyebrow: string; title: string; description: string; action?: boolean }) {
  const uiText = useUiText();
  return (
    <section className="page-hero">
      <div className="container page-hero-grid">
        <div><span className="eyebrow">{eyebrow}</span><h1>{title}</h1></div>
        <div className="page-hero-copy">
          <p>{description}</p>
          {action && <div className="hero-actions"><Link href="/healthcare/doctors" className="button button-primary">{uiText("Book an appointment")}{" "}<Icon name="arrow" size={18}/></Link><Link href="/contact" className="text-link">{uiText("Talk to our team")}{" "}<Icon name="arrow" size={17}/></Link></div>}
        </div>
      </div>
    </section>
  );
}
