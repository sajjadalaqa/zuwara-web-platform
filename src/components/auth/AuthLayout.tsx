import Image from "next/image";
import { Link } from "@/i18n/navigation";
import type { ReactNode } from "react";
import { Icon, type IconName } from "./icons";
import s from "./auth.module.css";

interface Props {
  children: ReactNode;
  wide?: boolean;
  headline?: string;
  tagline?: string;
}

const FEATURES: { icon: IconName; cls: string; title: string; sub: string }[] = [
  { icon: "shield", cls: s.fi1, title: "Verified providers", sub: "Trusted & background checked" },
  { icon: "clock", cls: s.fi2, title: "Flexible booking", sub: "When you need it" },
  { icon: "lock", cls: s.fi3, title: "Secure payments", sub: "Safe and hassle-free" },
];

export default function AuthLayout({
  children,
  wide,
  headline = "Care and help at home, made simple and trusted.",
  tagline = "One connected platform for your health and your home, with clear steps and details you can rely on.",
}: Props) {
  return (
    <main className={s.page}>
      <div className={s.topbar}>
        <Link href="/" className={s.back}>
          <Icon name="arrowLeft" size={16} /> <span>Back to home</span>
        </Link>
      </div>

      <div className={s.shell}>
        <aside className={s.brand}>
          {/* Background image: put yours at /public/images/auth-hero.png (a photo works great too) */}
          <Image src="/images/auth-hero.png" alt="" fill sizes="(max-width: 860px) 0px, 560px" priority className={s.bgImg} />

          <span className={s.tag}><i><Icon name="shield" size={14} /></i> Healthcare and home services</span>
          <div className={s.headline}>
            <h1>{headline}</h1>
            <p>{tagline}</p>
          </div>

          <div className={s.features}>
            {FEATURES.map((f) => (
              <div key={f.title} className={s.feature}>
                <i className={f.cls}><Icon name={f.icon} size={22} /></i>
                <div><b>{f.title}</b><small>{f.sub}</small></div>
              </div>
            ))}
          </div>
        </aside>

        <section className={s.formSide}>
          <div className={`${s.card} ${wide ? s.cardWide : ""}`}>{children}</div>
        </section>
      </div>
    </main>
  );
}