import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarPlus } from "lucide-react";
import { copy } from "../copy";
import { getConversation } from "../service";
import { clock, dayKey, dayLabel } from "../time";
import type { Message } from "../types";
import ChatBody from "./ChatBody";
import Composer from "./Composer";
import s from "../messages.module.css";

export default async function ChatPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  const isAr = locale === "ar";
  const t = isAr ? copy.ar : copy.en;
  const prefix = isAr ? "/ar" : "";

  const c = await getConversation(id, locale);
  if (!c) notFound();

  // Group messages by day (Saudi time) for the separators.
  const groups: { key: string; label: string; items: Message[] }[] = [];
  for (const m of c.messages) {
    const key = dayKey(m.createdAt);
    const last = groups[groups.length - 1];
    if (last && last.key === key) last.items.push(m);
    else groups.push({ key, label: dayLabel(m.createdAt, locale, t), items: [m] });
  }

  const initial = c.provider.name.replace(/^(Dr\.?|د\.)\s*/i, "").charAt(0).toUpperCase();

  return (
    <div className={s.chat}>
      <header className={s.chatHead}>
        <Link href={`${prefix}/dashboard/messages`} className={s.backBtn} aria-label={t.chat.back}>
          <ArrowLeft size={19} className={s.rtlFlip} />
        </Link>
        <span className={s.avatar}>
          {c.provider.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={c.provider.avatarUrl} alt="" />
          ) : (
            initial
          )}
        </span>
        <div className={s.chatWho}>
          <h2>{c.provider.name}</h2>
          <p>{c.provider.specialty}</p>
        </div>
        <Link href={`${prefix}/provider`} className={s.bookLink}>
          <CalendarPlus size={15} />
          <span>{t.chat.book}</span>
        </Link>
      </header>

      <ChatBody key={c.id} conversationId={c.id} unread={c.unreadCount} count={c.messages.length}>
        {groups.length === 0 && <p className={s.noMessages}>{t.chat.noMessages}</p>}
        {groups.map((g) => (
          <div key={g.key} className={s.group}>
            <div className={s.day}><span>{g.label}</span></div>
            {g.items.map((m) => (
              <div key={m.id} className={`${s.row} ${m.from === "me" ? s.me : s.them}`}>
                <div className={s.bubble}>{m.body}</div>
                <small>{clock(m.createdAt, locale)}</small>
              </div>
            ))}
          </div>
        ))}
      </ChatBody>

      <Composer
        conversationId={c.id}
        placeholder={t.chat.placeholder}
        sendLabel={t.chat.send}
        errors={t.errors}
      />
    </div>
  );
}