import Link from "next/link";
import {
  ChevronDown, Clock, LifeBuoy, Mail, MessageCircle, Phone, SearchX,
} from "lucide-react";
import { number } from "../appointments/format";
import ContactForm from "./ContactForm";
import SearchBar from "./SearchBar";
import { copy } from "./copy";
import { getFaqs, getSupportInfo } from "./service";
import { FAQ_CATEGORIES, type CategoryFilter } from "./types";
import s from "./help.module.css";

const ORDER: CategoryFilter[] = ["all", ...FAQ_CATEGORIES];

type SearchParams = { q?: string; category?: string };

export default async function HelpPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<SearchParams>;
}) {
  const { locale } = await params;
  const sp = await searchParams;
  const isAr = locale === "ar";
  const t = isAr ? copy.ar : copy.en;
  const prefix = isAr ? "/ar" : "";

  const category: CategoryFilter = (FAQ_CATEGORIES as readonly string[]).includes(sp.category ?? "")
    ? (sp.category as CategoryFilter)
    : "all";
  const q = (sp.q ?? "").slice(0, 80);

  const [data, support] = await Promise.all([
    getFaqs({ q, category }, locale),
    getSupportInfo(locale),
  ]);

  const href = (cat: CategoryFilter) => {
    const u = new URLSearchParams();
    if (cat !== "all") u.set("category", cat);
    if (q) u.set("q", q);
    const qs = u.toString();
    return `${prefix}/dashboard/help${qs ? `?${qs}` : ""}`;
  };

  const channels = [
    {
      key: "whatsapp",
      icon: MessageCircle,
      label: t.contact.whatsapp,
      value: t.contact.whatsappSub,
      href: `https://wa.me/${support.whatsapp}`,
      external: true,
      tone: s.tMint,
      ltr: false,
    },
    {
      key: "email",
      icon: Mail,
      label: t.contact.email,
      value: support.email,
      href: `mailto:${support.email}`,
      external: false,
      tone: s.tPurple,
      ltr: true,
    },
    {
      key: "phone",
      icon: Phone,
      label: t.contact.phone,
      value: support.phone,
      href: `tel:${support.phone.replace(/\s/g, "")}`,
      external: false,
      tone: s.tIndigo,
      ltr: true,
    },
  ];

  return (
    <div className={s.page}>
      {/* ===== Hero + search ===== */}
      <section className={s.hero}>
        <span className={s.heroIcon}><LifeBuoy size={22} /></span>
        <p className={s.eyebrow}>{t.eyebrow}</p>
        <h2>{t.heroTitle}</h2>
        <p className={s.heroText}>{t.heroText}</p>
        <SearchBar q={q} category={category} placeholder={t.search} clearLabel={t.clear} />
      </section>

      {/* ===== Category chips ===== */}
      <nav className={s.tabs} aria-label="Categories">
        {ORDER.map((c) => (
          <Link
            key={c}
            href={href(c)}
            scroll={false}
            className={`${s.tab} ${c === category ? s.tabActive : ""}`}
          >
            <span>{t.tabs[c]}</span>
            <span className={s.count}>{number(data.counts[c] ?? 0, locale)}</span>
          </Link>
        ))}
      </nav>

      <div className={s.layout}>
        {/* ===== FAQ ===== */}
        <div className={s.main}>
          {data.items.length === 0 ? (
            <div className={s.empty}>
              <span className={s.emptyIcon}><SearchX size={26} /></span>
              <h3>{t.empty.title}</h3>
              <p>{t.empty.text}</p>
              <a href="#contact" className={s.ctaLink}>{t.empty.cta}</a>
            </div>
          ) : (
            <>
              <p className={s.total}>{number(data.items.length, locale)} {t.results}</p>
              <div className={s.faq}>
                {data.items.map((f) => (
                  <details key={f.id} className={s.item}>
                    <summary className={s.q}>
                      <span>{f.question}</span>
                      <ChevronDown size={18} className={s.chev} />
                    </summary>
                    <div className={s.a}>
                      {f.answer.split("\n").map((para, i) => (
                        <p key={i}>{para}</p>
                      ))}
                    </div>
                  </details>
                ))}
              </div>
            </>
          )}
        </div>

        {/* ===== Contact ===== */}
        <aside className={s.side} id="contact">
          <section className={s.card}>
            <div className={s.cardHead}>
              <h2>{t.contact.title}</h2>
              <p>{t.contact.text}</p>
            </div>

            <div className={s.channels}>
              {channels.map((c) => {
                const Icon = c.icon;
                return (
                  <a
                    key={c.key}
                    href={c.href}
                    className={`${s.channel} ${c.tone}`}
                    {...(c.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                  >
                    <span className={s.chIcon}><Icon size={18} /></span>
                    <span className={s.chText}>
                      <small>{c.label}</small>
                      <b dir={c.ltr ? "ltr" : undefined}>{c.value}</b>
                    </span>
                  </a>
                );
              })}
            </div>

            <p className={s.hours}>
              <Clock size={14} />
              <span><b>{t.contact.hours}:</b> {support.hours}</span>
            </p>
          </section>

          <section className={s.card}>
            <div className={s.cardHead}>
              <h2>{t.form.title}</h2>
            </div>
            <ContactForm t={t} />
          </section>
        </aside>
      </div>
    </div>
  );
}