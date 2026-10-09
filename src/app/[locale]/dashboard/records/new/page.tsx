import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { copy } from "../copy";
import { todayInRiyadh } from "../validation";
import RecordForm from "./RecordForm";
import s from "../records.module.css";

export default async function NewRecordPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const isAr = locale === "ar";
  const t = isAr ? copy.ar : copy.en;
  const prefix = isAr ? "/ar" : "";
  const backHref = `${prefix}/dashboard/records`;

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

      <RecordForm t={t} locale={locale} maxDate={todayInRiyadh()} backHref={backHref} />
    </div>
  );
}