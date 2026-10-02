"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import styles from "./provider-detail.module.css";

export type ProviderInfo = {
  id: number | string;
  name: string;
  nameAr?: string;
  title?: string;
  titleAr?: string;
  image?: string;
  email?: string;
  joinedAt?: string;
  rating?: number;
  reviewsCount?: number;
  bookingsCompleted?: number;
  bio?: string;
  bioAr?: string;
};

const Icon = ({ d, size = 18 }: { d: string; size?: number }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
    <path d={d} />
  </svg>
);
const ICON = {
  mail: "M4 6h16v12H4zM4 7l8 6 8-6",
  check: "M5 12l5 5 9-10",
  calendar: "M4 6h16v14H4zM4 10h16M9 3v4M15 3v4",
  user: "M12 12a4 4 0 100-8 4 4 0 000 8zM4 21c0-4 3.6-7 8-7s8 3 8 7",
  back: "M15 6l-6 6 6 6",
  close: "M6 6l12 12M18 6L6 18",
  heart: "M12 20s-7-4.4-7-10a4 4 0 017-2.6A4 4 0 0119 10c0 5.6-7 10-7 10z",
};

function Stars({ value }: { value: number }) {
  return (
    <span className={styles.stars} aria-hidden="true">
      {[1, 2, 3, 4, 5].map((n) => (
        <svg key={n} viewBox="0 0 24 24" width="17" height="17"
          fill={n <= Math.round(value) ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round">
          <path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z" />
        </svg>
      ))}
    </span>
  );
}

export default function ProviderDetail({ provider: p }: { provider: ProviderInfo }) {
  const t = useTranslations("providerDetail");
  const isAr = useLocale() === "ar";

  const [imgFailed, setImgFailed] = useState(false);
  const [open, setOpen] = useState(false);

  const name = isAr && p.nameAr ? p.nameAr : p.name;
  const title = isAr && p.titleAr ? p.titleAr : p.title;
  const bio = isAr && p.bioAr ? p.bioAr : p.bio;
  const rating = p.rating ?? 0;
  const reviews = p.reviewsCount ?? 0;
  const bookings = p.bookingsCompleted ?? 0;
  const showImage = Boolean(p.image) && !imgFailed;

  const joined = p.joinedAt
  ? new Intl.DateTimeFormat(isAr ? "ar-SA-u-ca-gregory-nu-latn" : "en-US", { dateStyle: "long", timeZone: "UTC" })
      .format(new Date(p.joinedAt))
  : "—";

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [open]);

  const rows: [string, React.ReactNode][] = [
    [t("memberSince"), joined],
    ...(title ? ([[t("role"), title]] as [string, React.ReactNode][]) : []),
    ...(p.email ? ([[t("email"), <a key="m" href={`mailto:${p.email}`} dir="ltr">{p.email}</a>]] as [string, React.ReactNode][]) : []),
    [t("bookings"), t("bookingsDone", { count: bookings })],
  ];

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <Link href="/provider" className={styles.back}>
          <span className={styles.backIcon}><Icon d={ICON.back} size={16} /></span>
          {t("back")}
        </Link>

        <div className={styles.layout}>
          {/* Profile card */}
          <aside className={styles.profile}>
            <div className={styles.avatar}>
              {showImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={p.image} alt={name} onError={() => setImgFailed(true)} />
              ) : (
                <span aria-hidden="true">{name.trim().split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase()).join("")}</span>
              )}
            </div>

            <h1 className={styles.name}>{name}</h1>
            {title && <p className={styles.role}>{title}</p>}

            <div className={styles.rating}>
              <Stars value={rating} />
              <span>{t("reviews", { count: reviews })}</span>
            </div>

            <button type="button" className={styles.why} onClick={() => setOpen(true)}>
              <Icon d={ICON.heart} size={16} /> {t("why")}
            </button>

            <ul className={styles.facts}>
              {p.email && (
                <li>
                  <span><Icon d={ICON.mail} size={16} /> {t("email")}</span>
                  <a href={`mailto:${p.email}`} dir="ltr">{p.email}</a>
                </li>
              )}
              <li>
                <span><Icon d={ICON.check} size={16} /> {t("bookings")}</span>
                <strong>{t("bookingsDone", { count: bookings })}</strong>
              </li>
            </ul>

           <Link href={`/provider/${p.id}/book`} className={styles.book}>{t("book")}</Link>
          </aside>

          {/* Details */}
          <div className={styles.details}>
            <section className={styles.panel}>
              <h2 className={styles.heading}><Icon d={ICON.user} /> {t("personalInfo")}</h2>
              <dl className={styles.rows}>
                {rows.map(([k, v]) => (
                  <div key={k} className={styles.row}>
                    <dt>{k}</dt>
                    <dd>{v}</dd>
                  </div>
                ))}
              </dl>
            </section>

            <section className={styles.panel}>
              <h2 className={styles.heading}><Icon d={ICON.heart} /> {t("about")}</h2>
              {bio ? <p className={styles.bio}>{bio}</p> : <p className={styles.muted}>{t("noBio")}</p>}
            </section>

            <section className={styles.panel}>
              <h2 className={styles.heading}><Icon d={ICON.calendar} /> {t("reviewsTitle")}</h2>
              <div className={styles.emptyReviews}>
                <Stars value={0} />
                <p>{reviews === 0 ? t("noReviews") : t("reviews", { count: reviews })}</p>
              </div>
            </section>
          </div>
        </div>
      </div>

      {open && (
        <div className={styles.overlay} onClick={() => setOpen(false)}>
          <div className={styles.modal} role="dialog" aria-modal="true" aria-label={t("why")} onClick={(e) => e.stopPropagation()}>
            <button type="button" className={styles.close} onClick={() => setOpen(false)} aria-label={t("close")}>
              <Icon d={ICON.close} size={16} />
            </button>
            <h3>{t("whyTitle", { name })}</h3>
            {bio ? <p>{bio}</p> : <p className={styles.muted}>{t("noBio")}</p>}
            <ul className={styles.points}>
              <li>{t("point1")}</li>
              <li>{t("point2")}</li>
              <li>{t("point3")}</li>
            </ul>
            <Link href={`/provider/${p.id}/book`} className={styles.book} onClick={() => setOpen(false)}>{t("book")}</Link>
          </div>
        </div>
      )}
    </main>
  );
}