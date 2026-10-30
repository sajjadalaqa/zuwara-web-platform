"use client";

import type { ComponentProps } from "react";
import { Link, useRouter } from "@/i18n/navigation";
import { consultantAuthHref } from "@/lib/auth/consultant-return";

export function ConsultantAuthLink({ href, children, ...props }: Omit<ComponentProps<typeof Link>, "href"> & { href: string }) {
  const router = useRouter();
  return <Link {...props} href={href} onClick={event => {
    if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    const destination = consultantAuthHref(href, window.location.search);
    if (destination !== href) { event.preventDefault(); router.push(destination); }
  }}>{children}</Link>;
}
