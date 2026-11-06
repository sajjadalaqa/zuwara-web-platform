import createMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";
import { routing } from "./i18n/routing";

const handleLocaleRouting = createMiddleware(routing);

export default function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const segment = pathname.split("/")[1];
  const hasLocalePrefix = routing.locales.some(locale => locale === segment);
  const savedLocale = request.cookies.get("NEXT_LOCALE")?.value;
  const hasSavedLocale = routing.locales.some(locale => locale === savedLocale);

  // Keep existing English/Arabic URL conventions, but start new visitors in Arabic.
  if (!hasLocalePrefix && !hasSavedLocale) {
    const destination = request.nextUrl.clone();
    destination.pathname = "/ar" + (pathname === "/" ? "" : pathname);
    return NextResponse.redirect(destination);
  }

  return handleLocaleRouting(request);
}

export const config = {
  matcher: "/((?!api|trpc|_next|_vercel|.*\\..*).*)",
};
