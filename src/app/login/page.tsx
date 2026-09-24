import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "@/components/Icon";
import { PageHero } from "@/components/PageHero";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Choose the appropriate Zuwara account experience.",
  robots: { index: false, follow: true },
};

export default function LoginPage() {
  return <>
    <PageHero eyebrow="Account access" title="One ecosystem, focused experiences." description="Choose the space designed for your role. Verified production destinations will be connected during platform integration." action={false}/>
    <section className="content-section"><div className="container">
      <div className="login-choices">
        <article className="login-choice"><Icon name="heart"/><h2>Patient</h2><p>Manage personal and family appointments, reports, payments and follow-up.</p><Link href="/download" className="text-link">Continue to patient access <Icon name="arrow" size={17}/></Link></article>
        <article className="login-choice"><Icon name="video"/><h2>Consultant</h2><p>Access professional schedules, appointments, consultations and clinical workflows.</p><Link href="/contact" className="text-link">Continue to consultant access <Icon name="arrow" size={17}/></Link></article>
        <article className="login-choice"><Icon name="shield"/><h2>Company</h2><p>Open the dedicated organizational experience for company healthcare programs.</p><Link href="/contact" className="text-link">Continue to company access <Icon name="arrow" size={17}/></Link></article>
      </div>
      <p className="notice access-note">This presentation build does not connect to live authentication. Final destinations will use approved Zuwara account and dashboard routes.</p>
    </div></section>
  </>;
}
