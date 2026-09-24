import Link from "next/link";
import { Icon } from "./Icon";

export function SectionIntro({ eyebrow, title, body, href, linkLabel, inverse = false }: {
  eyebrow: string;
  title: string;
  body: string;
  href?: string;
  linkLabel?: string;
  inverse?: boolean;
}) {
  return (
    <div className={`section-intro${inverse ? " section-intro-inverse" : ""}`}>
      <div>
        <span className="eyebrow">{eyebrow}</span>
        <h2>{title}</h2>
      </div>
      <div>
        <p>{body}</p>
        {href && linkLabel ? <Link href={href} className="text-link">{linkLabel}<Icon name="arrow" size={18} /></Link> : null}
      </div>
    </div>
  );
}
