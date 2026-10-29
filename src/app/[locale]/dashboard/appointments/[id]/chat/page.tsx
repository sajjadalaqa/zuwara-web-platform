import { getUiText } from "@/i18n/server-ui-text";
import Link from "next/link";
import { notFound } from "next/navigation";
import { chatHistory } from "@/lib/api/zuwara/chat";
import { ZuwaraV2Error } from "@/lib/api/zuwara/v2";
import AppointmentChat from "./AppointmentChat";
import s from "./chat.module.css";
export default async function ChatPage({ params, searchParams }: { params: Promise<{ locale: string; id: string }>; searchParams: Promise<{ follow_up_id?: string }> }) {
  const uiText = await getUiText();
  const { id, locale } = await params;
  if (!/^[1-9]\d*$/.test(id)) notFound();
  const ar = locale === "ar";
  const href = (ar ? "/ar" : "") + "/dashboard/appointments/" + id;
  const { follow_up_id: followUpId } = await searchParams;
  let initial;
  try { initial = await chatHistory(id, undefined, followUpId); }
  catch (caught) {
    const timedOut = caught instanceof Error && (caught.name === "TimeoutError" || caught.name === "AbortError");
    const error = timedOut ? new ZuwaraV2Error(504, "CHAT_TIMEOUT") : caught;
    if (!(error instanceof ZuwaraV2Error)) throw error;
    if (error.status === 404) notFound();
    const reason = timedOut
      ? ar ? "\u0627\u0646\u062a\u0647\u062a \u0645\u0647\u0644\u0629 \u062a\u062d\u0645\u064a\u0644 \u0627\u0644\u0645\u062d\u0627\u062f\u062b\u0629. \u062d\u0627\u0648\u0644 \u0645\u062c\u062f\u062f\u0627\u064b." : "The chat request timed out after 15 seconds. Please retry. If this continues, contact support."
      : error.status === 409
      ? ar ? "\u0627\u0644\u0645\u062d\u0627\u062f\u062b\u0629 \u063a\u064a\u0631 \u0645\u062a\u0627\u062d\u0629 \u0644\u0647\u0630\u0627 \u0627\u0644\u0645\u0648\u0639\u062f \u062d\u0627\u0644\u064a\u0627\u064b." : "The backend cannot open this appointment's conversation in its current context."
      : error.status === 401 || error.status === 403
      ? ar ? "\u064a\u0631\u062c\u0649 \u062a\u0633\u062c\u064a\u0644 \u0627\u0644\u062f\u062e\u0648\u0644 \u0645\u062c\u062f\u062f\u0627\u064b." : "Please sign in again to access this conversation."
      : error.status === 429
      ? ar ? "\u064a\u0631\u062c\u0649 \u0627\u0644\u0645\u062d\u0627\u0648\u0644\u0629 \u0644\u0627\u062d\u0642\u0627\u064b." : "Too many requests. Please wait before retrying."
      : ar ? "\u062e\u062f\u0645\u0629 \u0627\u0644\u0645\u062d\u0627\u062f\u062b\u0629 \u063a\u064a\u0631 \u0645\u062a\u0627\u062d\u0629 \u0645\u0624\u0642\u062a\u0627\u064b." : "The backend chat service is temporarily unavailable. Please retry or contact support.";
    return <section className={s.chat} role="alert"><h1>{ar ? "\u062a\u0639\u0630\u0631 \u062a\u062d\u0645\u064a\u0644 \u0627\u0644\u0645\u062d\u0627\u062f\u062b\u0629" : "Conversation unavailable"}</h1><p>{reason}</p>
      {!timedOut ? <p>HTTP {error.status}</p> : null}{error.requestId && /^[a-zA-Z0-9_-]{1,128}$/.test(error.requestId) ? <p>{uiText("Request ID:")}{" "}<code>{error.requestId}</code></p> : null}
      <p><a href={href + "/chat" + (followUpId ? "?follow_up_id="+encodeURIComponent(followUpId) : "")}>{ar ? "\u062d\u0627\u0648\u0644 \u0645\u062c\u062f\u062f\u0627\u064b" : uiText("Try again")}</a></p><Link href={href}>{ar ? "\u0627\u0644\u0639\u0648\u062f\u0629 \u0625\u0644\u0649 \u0627\u0644\u0645\u0648\u0639\u062f" : "Back to appointment"}</Link>
    </section>;
  }
  return <div className={s.page}><Link className={s.backLink} href={href}>{ar ? "\u0627\u0644\u0639\u0648\u062f\u0629 \u0625\u0644\u0649 \u0627\u0644\u0645\u0648\u0639\u062f" : "Back to appointment"}</Link><h1>{ar ? "\u0645\u062d\u0627\u062f\u062b\u0629 \u0627\u0644\u0645\u0648\u0639\u062f" : "Appointment chat"}</h1><AppointmentChat id={id} initial={initial} followUpId={followUpId} /></div>;
}
