import DashboardShell from "./DashboardShell";
import { mockUser } from "./user";
import { getProfile } from "./profile/service";
import { getUnreadCount } from "./notifications/service";
import NotificationBell from "./notifications/NotificationBell";

export default async function DashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // TODO (backend): const user = await getCurrentUser(); if (!user) redirect("/login-page");
  const [profile, unreadNotifications] = await Promise.all([getProfile(), getUnreadCount()]);
  const user = {
    ...mockUser,
    name: profile.fullName,
    email: profile.email,
    avatarUrl: profile.avatarUrl,
    unreadNotifications,
  };

  return (
    <DashboardShell user={user} bell={<NotificationBell locale={locale} />}>
      {children}
    </DashboardShell>
  );
}