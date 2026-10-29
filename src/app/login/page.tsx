import { getUiText } from "@/i18n/server-ui-text";
import { useUiText } from "@/i18n/use-ui-text";
import type { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import { Icon } from "@/components/Icon";
import { PageHero } from "@/components/PageHero";

const pageMetadata: Metadata = {
  title: "Sign in",
  description: "Choose the appropriate Zuwara account experience.",
  robots: { index: false, follow: true },
};
export async function generateMetadata(): Promise<Metadata> {
  const uiText = await getUiText();
  return { ...pageMetadata, title: typeof pageMetadata.title === 'string' ? uiText(pageMetadata.title) : pageMetadata.title, description: pageMetadata.description ? uiText(pageMetadata.description) : undefined };
}


export default function LoginPage() {
  const uiText = useUiText();
  return <>
    <PageHero eyebrow={uiText("Account access")} title={uiText("One ecosystem, focused experiences.")} description={uiText("Choose the space designed for your role. Verified production destinations will be connected during platform integration.")} action={false}/>
    <section className="content-section"><div className="container">
      <div className="login-choices">
        <article className="login-choice"><Icon name="heart"/><h2>{uiText("Patient")}</h2><p>{uiText("Manage personal and family appointments, reports, payments and follow-up.")}</p><Link href="/login-page" className="text-link">{uiText("Continue to patient access")}{" "}<Icon name="arrow" size={17}/></Link></article>
        <article className="login-choice"><Icon name="video"/><h2>{uiText("Consultant")}</h2><p>{uiText("Access professional schedules, appointments, consultations and clinical workflows.")}</p><Link href="/contact" className="text-link">{uiText("Continue to consultant access")}{" "}<Icon name="arrow" size={17}/></Link></article>
        <article className="login-choice"><Icon name="shield"/><h2>{uiText("Company")}</h2><p>{uiText("Open the dedicated organizational experience for company healthcare programs.")}</p><Link href="/contact" className="text-link">{uiText("Continue to company access")}{" "}<Icon name="arrow" size={17}/></Link></article>
      </div>
      <p className="notice access-note">{uiText("Patient access uses secure phone and OTP sign-in.")}</p>
    </div></section>
  </>;
}
