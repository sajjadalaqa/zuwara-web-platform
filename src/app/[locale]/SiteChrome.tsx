"use client";

import { usePathname } from "next/navigation";

export default function SiteChrome({ children, hideOnCheckout=false }: { children: React.ReactNode; hideOnCheckout?:boolean }) {
  const pathname = usePathname();
  const inDashboard = /^\/(?:(?:ar|en)\/)?dashboard(?:\/|$)/.test(pathname);
  const inCheckout=/^\/(?:(?:ar|en)\/)?(?:cart(?:\/|$)|provider\/[^/]+\/book(?:\/|$))/.test(pathname);
  if (inDashboard || (hideOnCheckout&&inCheckout)) return null;
  return <>{children}</>;
}