import { MessagesSquare } from "lucide-react";
import { copy } from "./copy";
import s from "./messages.module.css";

export default async function MessagesIndex({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = (locale === "ar" ? copy.ar : copy.en).select;

  return (
    <div className={s.placeholder}>
      <span className={s.phIcon}><MessagesSquare size={28} /></span>
      <h3>{t.title}</h3>
      <p>{t.text}</p>
    </div>
  );
}