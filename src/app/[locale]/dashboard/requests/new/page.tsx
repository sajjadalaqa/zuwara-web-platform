import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { copy } from "../copy";
import { todayInRiyadh } from "../validation";
import RequestForm from "./RequestForm";
import s from "../requests.module.css";

export default async function NewRequestPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const isAr = locale === "ar";
  const t = isAr ? copy.ar : copy.en;
  const prefix = isAr ? "/ar" : "";
  const backHref = `${prefix}/dashboard/requests`;

  return (
    <div className={s.page}>
      <Link href={backHref} className={s.back}>
        <ArrowLeft size={16} className={s.rtlFlip} />
        {t.form.back}
      </Link>

      <header className={s.head}>
        <div>
          <h2>{t.form.heading}</h2>
          <p>{t.form.subtitle}</p>
        </div>
      </header>

      <RequestForm t={t} locale={locale} minDate={todayInRiyadh()} backHref={backHref} />
    </div>
  );
}