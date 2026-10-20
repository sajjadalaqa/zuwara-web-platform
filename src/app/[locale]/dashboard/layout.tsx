import DashboardShell from "./DashboardShell";
import NotificationBell from "./notifications/NotificationBell";
import SessionKeeper from "@/components/auth/SessionKeeper";
import { requireSession } from "@/lib/auth/session";
export default async function DashboardLayout({ children, params }: { children: React.ReactNode; params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const { user } = await requireSession();
  return <DashboardShell user={{ id: user.id, name: user.full_name, email: user.email ?? "",
    avatarUrl: user.profile_image ?? undefined, unreadNotifications: 0, unreadMessages: 0 }}
    bell={<NotificationBell locale={locale} />}><SessionKeeper />{children}</DashboardShell>;
}