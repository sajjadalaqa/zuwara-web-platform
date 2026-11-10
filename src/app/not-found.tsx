import { getUiText } from "@/i18n/server-ui-text";
import { getLocale } from "next-intl/server";
import Link from "next/link";

export default async function NotFound() {
  const uiText = await getUiText();
  const locale = await getLocale();

  return (
    <section className="page-hero">
      <div className="container narrow">
        <span className="eyebrow eyebrow-light">404</span>
        <h1>{uiText("This page is not here.")}</h1>
        <p>{uiText("The link may have changed, or the page may not be part of this presentation build.")}</p>
        <Link href={locale === "ar" ? "/ar" : "/"} className="button button-light">{uiText("Return home")}</Link>
      </div>
    </section>
  );
}