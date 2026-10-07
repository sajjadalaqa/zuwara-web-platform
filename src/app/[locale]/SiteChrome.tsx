"use client";

import { usePathname } from "next/navigation";

export default function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const inDashboard = /^\/(?:(?:ar|en)\/)?dashboard(?:\/|$)/.test(pathname);
  if (inDashboard) return null;
  return <>{children}</>;
}