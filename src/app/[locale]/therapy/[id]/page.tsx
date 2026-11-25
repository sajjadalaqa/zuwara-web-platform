import Link from "next/link";
import { notFound } from "next/navigation";
import { getLocale } from "next-intl/server";
import { ArrowLeft, ArrowUpRight, ChevronDown, Clock3, Flag, Layers3, Target, Video } from "lucide-react";
import type { Bilingual } from "@/lib/api/zuwara/care";
import { publicTherapyPlan } from "@/lib/therapy/public-plans";
import s from "./plan.module.css";

export default async function TherapyPlanPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[1-9]\d{0,9}$/.test(id)) notFound();

  const locale = await getLocale();
  const ar = locale === "ar";
  const copy = (en: string, arabic: string) => ar ? arabic : en;
  const localize = (value?: Bilingual | null) => value?.[ar ? "ar" : "en"] || value?.en || value?.ar || "";
  const catalog = ar ? "/ar/therapy" : "/therapy";
  const availability = catalog + "/" + id + "/availability";
  const plan = await publicTherapyPlan(id, locale).catch(() => undefined);
  if (plan === null) notFound();

  const back = (
    <Link href={catalog} className={s.back}>
      <ArrowLeft size={17} aria-hidden="true" />
      {copy("All therapy plans", "جميع الخطط العلاجية")}
    </Link>
  );

  if (!plan) {
    return (
      <div className={s.page} dir={ar ? "rtl" : "ltr"}>
        <div className={s.shell}>
          {back}
          <section className={s.panel}>
            <h1>{copy("This plan is temporarily unavailable", "هذه الخطة غير متاحة مؤقتًا")}</h1>
            <p>{copy("Please try again shortly.", "يرجى المحاولة مرة أخرى بعد قليل.")}</p>
          </section>
        </div>
      </div>
    );
  }

  const number = new Intl.NumberFormat(ar ? "ar-SA" : "en-SA");
  const money = new Intl.NumberFormat(ar ? "ar-SA" : "en-SA", { style: "currency", currency: "SAR" });
  const durations = plan.durations ?? [];
  const book = copy("Check availability", "تحقق من التوافر");
  const sections = [
    { title: copy("Plan goals", "أهداف الخطة"), items: plan.goals, Icon: Target },
    { title: copy("Therapy milestones", "مراحل العلاج"), items: plan.milestones, Icon: Flag },
  ];

  return (
    <div className={s.page} dir={ar ? "rtl" : "ltr"}>
      <div className={s.shell}>
        {back}
        <header className={s.hero}>
          <div className={s.intro}>
            <span className={s.format}><Video size={17} aria-hidden="true" />{copy("Online therapy", "علاج عن بُعد")}</span>
            <h1>{localize(plan.title)}</h1>
            {localize(plan.description) && <p>{localize(plan.description)}</p>}
            <Link href={availability} className={s.book}>{book}<ArrowUpRight size={18} aria-hidden="true" /></Link>
          </div>
        </header>
        <div className={s.layout}>
          <div className={s.content}>
            {sections.map(({ title, items, Icon }) => items?.length ? (
              <section className={s.panel} key={title}>
                <h2><Icon size={23} aria-hidden="true" />{title}</h2>
                <ul className={s.steps}>
                  {items.map(item => (
                    <li key={item.id}>
                      <h3>{localize(item.title)}</h3>
                      {localize(item.description) && <p>{localize(item.description)}</p>}
                    </li>
                  ))}
                </ul>
              </section>
            ) : null)}
            {!!plan.faqs?.length && (
              <section className={s.panel}>
                <h2>{copy("Frequently asked questions", "الأسئلة الشائعة")}</h2>
                <div className={s.faqs}>
                  {plan.faqs.map(faq => (
                    <details key={faq.id}>
                      <summary>{localize(faq.question)}<ChevronDown size={18} aria-hidden="true" /></summary>
                      <p>{localize(faq.answer)}</p>
                    </details>
                  ))}
                </div>
              </section>
            )}
          </div>
          <aside className={s.booking} aria-labelledby="session-options">
            <h2 id="session-options">{copy("Session options", "خيارات الجلسات")}</h2>
            <div className={s.sessionCount}>
              <Layers3 size={22} aria-hidden="true" />
              <span>{plan.sessions_recommended ? copy("Recommended sessions", "عدد الجلسات الموصى به") : copy("Sessions in this plan", "عدد الجلسات في الخطة")}</span>
              <strong>{number.format(plan.total_sessions)}</strong>
            </div>
            {!!durations.length && (
              <>
                <h3>{copy("Price per session", "السعر لكل جلسة")}</h3>
                <ul className={s.prices}>
                  {durations.map(duration => (
                    <li key={duration.duration_minutes}>
                      <span><Clock3 size={16} aria-hidden="true" />{number.format(duration.duration_minutes)} {copy("min", "دقيقة")}</span>
                      <strong>{money.format(duration.price_per_session_halalas / 100)}</strong>
                    </li>
                  ))}
                </ul>
              </>
            )}
            <Link href={availability} className={s.book}>{book}<ArrowUpRight size={18} aria-hidden="true" /></Link>
            <p>{copy("Sign in to choose a consultant and session times.", "سجّل الدخول لاختيار الاستشاري ومواعيد الجلسات.")}</p>
          </aside>
        </div>
      </div>
    </div>
  );
}
