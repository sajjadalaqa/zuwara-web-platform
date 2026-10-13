import MessagesShell from "./MessagesShell";
import { copy } from "./copy";
import { getConversations } from "./service";
import { listTime } from "./time";

export default async function MessagesLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = locale === "ar" ? copy.ar : copy.en;

  const conversations = await getConversations(locale);

  const items = conversations.map((c) => ({
    id: c.id,
    name: c.provider.name,
    avatarUrl: c.provider.avatarUrl,
    preview: `${c.lastFrom === "me" ? `${t.you} ` : ""}${c.lastMessage}`,
    time: listTime(c.lastAt, locale, t),
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