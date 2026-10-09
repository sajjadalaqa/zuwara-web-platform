"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Icon } from "@/components/Icon";
import { SafeImage } from "@/components/SafeImage";
import c from "./DoctorsCarousel.module.css";

export type CarouselDoctor = {
  id: string | number;
  name: string;
  nameAr?: string | null;
  imageUrl?: string | null;
  categoryTitle?: string | null;
  role?: string | null;
  rating: number;
  experienceYears: number;
  startingPrice: number | string;
  currency: string;
  href: string;
};

const ALL = "All";
const FALLBACK_CATEGORY = "Healthcare consultant";

export function DoctorsCarousel({ doctors }: { doctors: CarouselDoctor[] }) {
  const t = useTranslations("Doctors");

  const [active, setActive] = useState<string>(ALL);

  const trackRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);
  const drag = useRef({ active: false, startX: 0, startScroll: 0, moved: false });
  const [dragging, setDragging] = useState(false);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  // Only show categories that actually have doctors
  const categories = useMemo(() => {
    const counts = new Map<string, number>();
    doctors.forEach((d) => {
      const key = d.categoryTitle?.trim() || FALLBACK_CATEGORY;
      counts.set(key, (counts.get(key) ?? 0) + 1);
    });
    return [{ name: ALL, count: doctors.length }, ...Array.from(counts, ([name, count]) => ({ name, count }))];
  }, [doctors]);

  const visible = useMemo(
    () => (active === ALL ? doctors : doctors.filter((d) => (d.categoryTitle?.trim() || FALLBACK_CATEGORY) === active)),
    [doctors, active],
  );

  const updateArrows = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    setCanPrev(el.scrollLeft > 4);
    setCanNext(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  // Throttle scroll updates to once per animation frame
  const onScroll = useCallback(() => {
    if (rafRef.current !== null) return;
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null;
      updateArrows();
    });
  }, [updateArrows]);

  // Reset scroll + recalc arrows whenever the filter changes
  useEffect(() => {
    trackRef.current?.scrollTo({ left: 0, behavior: "auto" });
    updateArrows();
  }, [visible, updateArrows]);

  useEffect(() => {
    window.addEventListener("resize", updateArrows);
    return () => {
      window.removeEventListener("resize", updateArrows);
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [updateArrows]);

  const scrollByCard = (direction: 1 | -1) => {
    const el = trackRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>("article");
    const step = (card?.offsetWidth ?? 300) + 18;
    el.scrollBy({ left: direction * step, behavior: "smooth" });
  };

  // Mouse drag-to-scroll (touch and trackpad already scroll natively)
  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== "mouse" || e.button !== 0) return;
    const el = trackRef.current;
    if (!el) return;
    drag.current = { active: true, startX: e.clientX, startScroll: el.scrollLeft, moved: false };
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    const el = trackRef.current;
    if (!d.active || !el) return;
    const dx = e.clientX - d.startX;
    if (!d.moved && Math.abs(dx) > 5) {
      d.moved = true;
      setDragging(true);
    }
    if (d.moved) el.scrollLeft = d.startScroll - dx;
  };

  const endDrag = () => {
    if (!drag.current.active) return;
    drag.current.active = false;
    setDragging(false);
  };

  // Don't open a doctor link if the user was dragging
  const onClickCapture = (e: React.MouseEvent<HTMLDivElement>) => {
    if (drag.current.moved) {
      e.preventDefault();
      e.stopPropagation();
      drag.current.moved = false;
    }
  };

  if (doctors.length === 0) {
    return (
      <section className={c.section} aria-labelledby="doctors-carousel-heading">
        <div className={`container ${c.inner}`}>
          <div className={c.empty}>
            <span className={c.emptyIcon}><Icon name="user" size={26} /></span>
            <div>
              <h2 id="doctors-carousel-heading" className={c.emptyTitle}>{t("emptyTitle")}</h2>
              <p>{t("emptyText")}</p>
            </div>
            <Link href="/healthcare/doctors" className={c.viewAll}>
              {t("emptyCta")} <Icon name="arrow" size={16} />
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={c.section} aria-labelledby="doctors-carousel-heading">
      <div className={`container ${c.inner}`}>
        <header className={c.header}>
          <div>
            <span className={c.eyebrow}><i /> {t("eyebrow")}</span>
            <h2 id="doctors-carousel-heading">
              {t("headingStart")} <span>{t("headingHighlight")}</span>
            </h2>
          </div>
          <div className={c.headerSide}>
            <p>{t("intro")}</p>
          </div>
        </header>

        {/* Everything below stays English and left-to-right on every locale */}
        <div dir="ltr" lang="en">
          {/* ---------- specialty filters ---------- */}
          <div className={c.filters} role="group" aria-label={t("filterLabel")}>
            {categories.map((cat) => (
              <button
                key={cat.name}
                type="button"
                className={`${c.chip} ${active === cat.name ? c.chipActive : ""}`}
                aria-pressed={active === cat.name}
                onClick={() => setActive(cat.name)}
              >
                {cat.name}
                <span className={c.chipCount}>{cat.count}</span>
              </button>
            ))}
          </div>

          {/* ---------- scroller ---------- */}
          <div className={c.scroller}>
            <button
              type="button"
              className={`${c.nav} ${c.navPrev}`}
              onClick={() => scrollByCard(-1)}
              disabled={!canPrev}
              aria-label={t("prev")}
            >
              <Icon name="arrow" size={18} />
            </button>

            <div
              ref={trackRef}
              className={`${c.track} ${dragging ? c.dragging : ""}`}
              onScroll={onScroll}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={endDrag}
              onPointerLeave={endDrag}
              onPointerCancel={endDrag}
              onClickCapture={onClickCapture}
              tabIndex={0}
              role="region"
              aria-label={t("trackLabel")}
            >
              {visible.map((doctor) => (
                <article className={c.card} key={doctor.id}>
                  <div className={c.media}>
                    {doctor.imageUrl ? (
                      <SafeImage
                        src={doctor.imageUrl}
                        alt={`Profile photo of ${doctor.name}`}
                        fill
                        sizes="(max-width: 600px) 80vw, 320px"
                      />
                    ) : (
                      <div className={c.fallback}><Icon name="user" size={48} /></div>
                    )}
                    <span className={c.tag}>{doctor.categoryTitle?.trim() || FALLBACK_CATEGORY}</span>
                    {doctor.rating > 0 ? <span className={c.rating}>★ {doctor.rating.toFixed(1)}</span> : null}
                  </div>

                  <div className={c.body}>
                    <span className={c.role}>{doctor.role || "Consultant"}</span>
                    <h3>{doctor.name}</h3>
            

                    <div className={c.facts}>
                      {doctor.experienceYears > 0 ? <span>{doctor.experienceYears} years experience</span> : null}
                      <span>From {doctor.startingPrice} {doctor.currency}</span>
                    </div>

                    <Link href={doctor.href} className={c.link} draggable={false}>
                      View consultant <Icon name="arrow" size={17} />
                    </Link>
                  </div>
                </article>
              ))}
            </div>

            <button
              type="button"
              className={`${c.nav} ${c.navNext}`}
              onClick={() => scrollByCard(1)}
              disabled={!canNext}
              aria-label={t("next")}
            >
              <Icon name="arrow" size={18} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}