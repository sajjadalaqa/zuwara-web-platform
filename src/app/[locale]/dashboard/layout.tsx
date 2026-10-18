import DashboardShell from "./DashboardShell";
import NotificationBell from "./notifications/NotificationBell";
import { mockUser } from "./user";
import { getProfile } from "./profile/service";
import { getUnreadCount } from "./notifications/service";
import { getUnreadMessagesCount } from "./messages/service";

export default async function DashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  // TODO (backend): const user = await getCurrentUser(); if (!user) redirect("/login-page");
  const [profile, unreadNotifications, unreadMessages] = await Promise.all([
    getProfile(),
    getUnreadCount(),
    getUnreadMessagesCount(),
  ]);
  const user = {
    ...mockUser,
    name: profile.fullName,
    email: profile.email,
    avatarUrl: profile.avatarUrl,
    unreadNotifications,
    unreadMessages,
  };
  return (
    <DashboardShell user={user} bell={<NotificationBell locale={locale} />}>
      {children}
    </DashboardShell>
  );
}