"use client";
import { useUiText } from "@/i18n/use-ui-text";
import { useLocale } from "next-intl";
import { useEffect, useState } from "react";
import q from "./testimonials.module.css";

type Testimonial = {
  name: string;
  role: string;
  tag: string;
  initials: string;
  quote: string;
};

function TestimonialCard({ name, role, tag, quote, initials }: Testimonial) {
  const uiText = useUiText();
  return (
    <div className={q.card}>
      <div className={q.top}>
        <span className={q.quoteMark} aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="currentColor"><path d="M9.6 5C6.5 6.3 4 9.3 4 13.2V19h6.4v-6.2H7.2c0-2.3 1.2-3.9 3.2-4.9L9.6 5zm9 0c-3.1 1.3-5.6 4.3-5.6 8.2V19h6.4v-6.2h-3.2c0-2.3 1.2-3.9 3.2-4.9L18.6 5z" /></svg>
        </span>
        <span className={q.stars} role="img" aria-label={uiText("5 out of 5 stars")}>
          {Array.from({ length: 5 }).map((_, i) => (
            <svg key={i} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="m12 2.5 2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4l-5.9 3.1 1.2-6.5L2.5 9.4l6.6-.9L12 2.5z" /></svg>
          ))}
        </span>
      </div>
      <blockquote><p>{uiText(quote)}</p></blockquote>
      <div className={q.person}>
        <span className={q.avatar} aria-hidden="true">{uiText(name) === name ? initials : uiText(name).split(" ").slice(0, 2).map(part => part[0]).join("")}</span>
        <div className={q.who}><strong>{uiText(name)}</strong><span>{uiText(role)}</span></div>
        <span className={q.tag}>{uiText(tag)}</span>
      </div>
    </div>
  );
}

export function TestimonialsSlider({ items }: { items: readonly Testimonial[] }) {
  const uiText = useUiText();
  const locale = useLocale();
  const [perView, setPerView] = useState(3);
  const [{ index, step }, setPosition] = useState({ index: 0, step: 1 });
  const [paused, setPaused] = useState(false);

  // 3 cards on desktop, 2 on tablet, 1 on mobile
  useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      setPerView(w < 640 ? 1 : w < 1024 ? 2 : 3);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const maxIndex = Math.max(0, items.length - perView);
  const current = Math.min(index, maxIndex);

  const next = () => setPosition({ index: Math.min(current + 1, maxIndex), step: 1 });
  const prev = () => setPosition({ index: Math.max(current - 1, 0), step: -1 });

  // autoplay (paused on hover/focus, disabled for reduced motion)
  useEffect(() => {
    if (paused || maxIndex === 0) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(() => {
      setPosition((position) => {
        const index = Math.min(position.index, maxIndex);
        const step = index >= maxIndex ? -1 : index === 0 ? 1 : position.step;
        return { index: index + step, step };
      });
    }, 4500);
    return () => window.clearInterval(id);
  }, [paused, maxIndex]);

  return (
    <div
      className={q.slider}
      dir={locale === "ar" ? "rtl" : "ltr"}
      lang={locale}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setPaused(false);
      }}
    >
      <div className={q.viewport}>
        <ul
          className={q.track}
          style={{
            ["--per" as string]: perView,
            transform: `translateX(${locale === "ar" ? "" : "-"}${(current * 100) / perView}%)`,
          }}
        >
          {items.map((item) => (
            <li className={q.slide} key={item.name}>
              <TestimonialCard {...item} />
            </li>
          ))}
        </ul>
      </div>

      <div className={q.controls}>
        <button type="button" className={q.arrow} onClick={prev} disabled={current === 0} aria-label={uiText("Previous testimonials")}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m15 18-6-6 6-6" /></svg>
        </button>

        <div className={q.dots}>
          {Array.from({ length: maxIndex + 1 }).map((_, i) => (
            <button
              type="button"
              key={i}
              className={`${q.dot} ${i === current ? q.dotActive : ""}`}
              onClick={() => setPosition({ index: i, step: i < current ? -1 : i > current ? 1 : step })}
              aria-label={`${uiText("Go to slide")} ${i + 1}`}
              aria-current={i === current}
            />
          ))}
        </div>

        <button type="button" className={q.arrow} onClick={next} disabled={current === maxIndex} aria-label={uiText("Next testimonials")}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m9 18 6-6-6-6" /></svg>
        </button>
      </div>
    </div>
  );
}
