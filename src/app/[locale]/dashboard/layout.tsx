import DashboardShell from "./DashboardShell";
import { mockUser } from "./user";
import { getProfile } from "./profile/service";
import { getUnreadCount } from "./notifications/service";
import { getUnreadMessagesCount } from "./messages/service";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
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
  return <DashboardShell user={user}>{children}</DashboardShell>;
}