import DashboardShell from "./DashboardShell";
import { mockUser } from "./user";
import { getProfile } from "./profile/service";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  // TODO (backend): const user = await getCurrentUser(); if (!user) redirect("/login-page");
  const profile = await getProfile();
  const user = {
    ...mockUser,
    name: profile.fullName,
    email: profile.email,
    avatarUrl: profile.avatarUrl,
  };
  return <DashboardShell user={user}>{children}</DashboardShell>;
}