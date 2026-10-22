import Link from "next/link";
import { getLocale } from "next-intl/server";
import { requireSession } from "@/lib/auth/session";
import type { MissingFeature } from "@/lib/api/features";
import s from "./care.module.css";
const features: Record<
  MissingFeature,
  { title: string; ar: string; message: string; href: string; action: string }
> = {
  saved: {
    title: "Saved providers",
    ar: "\u0627\u0644\u0645\u0632\u0648\u062f\u0648\u0646 \u0627\u0644\u0645\u062d\u0641\u0648\u0638\u0648\u0646",
    message:
      "Viewing and changing saved providers is not available here yet. You can still browse providers and book available services.",
    href: "/provider",
    action: "Browse providers",
  },
  reviews: {
    title: "Reviews",
    ar: "\u0627\u0644\u062a\u0642\u064a\u064a\u0645\u0627\u062a",
    message:
      "Submitting and managing reviews is not available here yet. Your appointment history remains available.",
    href: "/dashboard/appointments",
    action: "View appointments",
  },
  complaints: {
    title: "Complaints",
    ar: "\u0627\u0644\u0634\u0643\u0627\u0648\u0649",
    message:
      "Online complaint submission and tracking are not available here yet. Please use Contact Us to reach support.",
    href: "/contact",
    action: "Contact us",
  },
  referral: {
    title: "Referral and loyalty",
    ar: "\u0627\u0644\u0625\u062d\u0627\u0644\u0629 \u0648\u0627\u0644\u0648\u0644\u0627\u0621",
    message:
      "Referral rewards and point redemption are not available here yet. Your wallet displays the balance confirmed by the platform.",
    href: "/dashboard/wallet",
    action: "View wallet",
  },
  requests: {
    title: "Service requests",
    ar: "\u0637\u0644\u0628\u0627\u062a \u0627\u0644\u062e\u062f\u0645\u0627\u062a",
    message:
      "General service requests and provider offers are not available here yet. You can book listed home-visit services directly.",
    href: "/provider",
    action: "Browse home-visit providers",
  },
};
export default async function UnavailableFeature({
  feature,
}: {
  feature: MissingFeature;
}) {
  await requireSession();
  const ar = (await getLocale()) === "ar",
    data = features[feature];
  return (
    <div className={s.page}>
      <header className={s.head}>
        <h1>{ar ? data.ar : data.title}</h1>
      </header>
      <section className={s.card}>
        <p>
          {ar
            ? "\u0647\u0630\u0647 \u0627\u0644\u062e\u062f\u0645\u0629 \u063a\u064a\u0631 \u0645\u062a\u0627\u062d\u0629 \u062d\u0627\u0644\u064a\u0627\u064b. \u0644\u0645\u0632\u064a\u062f \u0645\u0646 \u0627\u0644\u0645\u0633\u0627\u0639\u062f\u0629 \u064a\u0631\u062c\u0649 \u0627\u0644\u062a\u0648\u0627\u0635\u0644 \u0645\u0639 \u0627\u0644\u062f\u0639\u0645."
            : data.message}
        </p>
        <div className={s.actions}>
          <Link className={s.button} href={(ar ? "/ar" : "") + data.href}>
            {ar ? "\u0645\u062a\u0627\u0628\u0639\u0629" : data.action}
          </Link>
          <Link href={(ar ? "/ar" : "") + "/dashboard"}>
            {ar
              ? "\u0644\u0648\u062d\u0629 \u0627\u0644\u062a\u062d\u0643\u0645"
              : "Back to dashboard"}
          </Link>
        </div>
      </section>
    </div>
  );
}
