"use client";
import { useEffect, useRef, useState } from "react";
import { useLocale } from "next-intl";
import type { ChatPage, ChatMessage } from "@/lib/api/zuwara/chat";
import { chatHistoryAction, sendChatAction } from "./actions";
import s from "./chat.module.css";
export default function AppointmentChat({ id, initial }: { id: string; initial: ChatPage }) {
  const ar = useLocale() === "ar";
  const [messages, setMessages] = useState(initial.messages), [cursor, setCursor] = useState(initial.nextCursor);
  const [canSend, setCanSend] = useState(initial.canSend), [text, setText] = useState(""), [busy, setBusy] = useState(false), [error, setError] = useState("");
  const [retry, setRetry] = useState(false);
  const intent = useRef<{ text: string; key: string } | null>(null);
  const active = useRef(true), loading = useRef(false), sending = useRef(false);
  function merge(rows: ChatMessage[]) { setMessages(previous => [...new Map([...previous, ...rows].map(row => [row.id, row])).values()]); }
  useEffect(() => {
    active.current = true;
    const timer = setInterval(async () => {
      if (document.visibilityState !== "visible" || loading.current || sending.current) return;
      loading.current = true;
      try { const result = await chatHistoryAction(id); if (result.ok && active.current) { merge(result.page.messages); setCanSend(result.page.canSend); } }
      catch { /* Keep the last visible history; explicit reload is available. */ }
      finally { loading.current = false; }
    }, 15000);
    return () => { active.current = false; clearInterval(timer); };
  }, [id]);
  async function loadMore() {
    if (!cursor || loading.current) return;
    loading.current = true; setBusy(true); setError("");
    try { const result = await chatHistoryAction(id, cursor); if (!result.ok) throw new Error(); merge(result.page.messages); setCursor(result.page.nextCursor); }
    catch { setError(ar ? "تعذر تحميل الرسائل." : "Unable to load messages."); }
    finally { loading.current = false; setBusy(false); }
  }
  async function send(e: React.FormEvent) {
    e.preventDefault(); if (sending.current || !canSend || !text.trim()) return;
    const command = intent.current ??= { text, key: crypto.randomUUID() };
    sending.current = true; setBusy(true); setError("");
    try {
      const result = await sendChatAction(id, command.text, command.key);
      if (!result.ok) { if (!result.uncertain) intent.current = null; throw new Error(); }
      merge([result.message]); intent.current = null; setRetry(false); setText("");
    } catch { setRetry(Boolean(intent.current)); setError(ar ? "لم يتم تأكيد الإرسال. أعد المحاولة دون تغيير الرسالة." : "Delivery was not confirmed. Retry the same message."); }
    finally { sending.current = false; setBusy(false); }
  }
  const ordered = [...messages].sort((a,b) => (a.created_at ?? "").localeCompare(b.created_at ?? "") || a.id.localeCompare(b.id));
  return <section className={s.chat}>
    {cursor && <button disabled={busy} onClick={loadMore}>{ar ? "تحميل المزيد" : "Load more history"}</button>}
    <div className={s.messages} aria-live="polite">{ordered.map(row => <article key={row.id} className={row.sender.role === "patient" ? s.own : s.message}>
      <strong>{row.sender.name}</strong><p>{row.deleted ? ar ? "تم حذف الرسالة" : "Message deleted" : row.text}</p>
      {row.attachment_url && <a href={row.attachment_url} target="_blank" rel="noopener noreferrer">{ar ? "عرض المرفق" : "View attachment"}</a>}
      {row.created_at && Number.isFinite(Date.parse(row.created_at)) && <small>{new Intl.DateTimeFormat(ar ? "ar-SA" : "en-GB", { dateStyle: "short", timeStyle: "short", timeZone: "Asia/Riyadh" }).format(new Date(row.created_at))}</small>}
    </article>)}</div>
    {error && <p role="alert">{error}</p>}
    {canSend ? <form onSubmit={send} className={s.form}>
      <textarea aria-label={ar ? "رسالتك" : "Your message"} maxLength={4000} value={text} readOnly={busy || retry} onChange={e=>setText(e.target.value)} />
      <button disabled={busy || !text.trim()}>{retry ? ar ? "إعادة المحاولة" : "Retry delivery" : ar ? "إرسال" : "Send"}</button>
    </form> : <p>{ar ? "هذه المحادثة للقراءة فقط." : "This conversation is read-only."}</p>}
  </section>;
}

