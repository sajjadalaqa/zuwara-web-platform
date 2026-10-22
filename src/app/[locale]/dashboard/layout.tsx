import {unstable_rethrow} from "next/navigation";
import {getProfile} from "./profile/service";
import DashboardShell from "./DashboardShell";
import NotificationBell from "./notifications/NotificationBell";
import SessionKeeper from "@/components/auth/SessionKeeper";
import { requireSession } from "@/lib/auth/session";

export default async function DashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const { user } = await requireSession();
  const profile=await getProfile().catch(error=>{unstable_rethrow(error);return null;});

  return (
    <DashboardShell
      user={{
        id: user.id,
        name: profile?.fullName ?? user.full_name,
        email: profile?.email ?? user.email ?? "",
        avatarUrl: profile?.avatarUrl ?? user.profile_image ?? undefined,
        unreadNotifications: 0,
        unreadMessages: 0,
      }}
      bell={<NotificationBell locale={locale} />}
    >
      <SessionKeeper />
      {children}
    </DashboardShell>
  );
}