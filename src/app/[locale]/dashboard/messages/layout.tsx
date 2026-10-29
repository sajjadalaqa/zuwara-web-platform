import { getUiText } from "@/i18n/server-ui-text";
import Link from "next/link";
import { unstable_rethrow } from "next/navigation";
import MessagesShell from "./MessagesShell";
import { copy } from "./copy";
import { getConversations } from "./service";
import s from "./messages.module.css";
export default async function MessagesLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const uiText = await getUiText();
  const { locale } = await params,
    ar = locale === "ar",
    t = ar ? copy.ar : copy.en;
  let conversations;
  try {
    conversations = await getConversations(locale);
  } catch (error) {
    unstable_rethrow(error);
    return (
      <section className={s.emptyWrap}>
        <h2>
          {ar
            ? "\u062a\u0639\u0630\u0631 \u062a\u062d\u0645\u064a\u0644 \u0627\u0644\u0645\u062d\u0627\u062f\u062b\u0627\u062a"
            : "Conversations could not be loaded"}
        </h2>
        <p>{uiText("Please retry when the appointment service is available.")}</p>
        <a className={s.cta} href={(ar ? "/ar" : "") + "/dashboard/messages"}>
          {uiText("Try again")}{" "}</a>
        <Link href={(ar ? "/ar" : "") + "/dashboard"}>{uiText("Back to dashboard")}</Link>
      </section>
    );
  }
  const dateFormat = new Intl.DateTimeFormat(
    ar ? "ar-SA-u-ca-gregory" : "en-GB",
    { dateStyle: "medium", timeZone: "Asia/Riyadh" },
  );
  const items = conversations.map((c) => ({
    id: c.id,
    name: c.provider.name,
    avatarUrl: c.provider.avatarUrl,
    preview:
      (ar ? "\u0627\u0644\u0645\u0648\u0639\u062f " : "Appointment ") +
      c.appointmentNumber +
      " - " +
      (c.appointmentStatus || ""),
    time: c.appointmentAt ? dateFormat.format(new Date(c.appointmentAt)) : "",
    unread: c.unreadCount,
  }));
  return (
    <MessagesShell
      items={items}
      labels={{
        title: t.title,
        search: t.search,
        clear: t.clear,
        noMatch: t.noMatch,
        emptyTitle: t.empty.title,
        emptyText: t.empty.text,
        emptyCta: t.empty.cta,
      }}
    >
      {children}
    </MessagesShell>
  );
}
