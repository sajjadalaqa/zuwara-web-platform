import { requireSession } from "@/lib/auth/session";
import { homeServices, homeAddresses } from "@/lib/api/d4h/bookings";
import styles from "./booking.module.css";
import { Link } from "@/i18n/navigation";
// src/app/[locale]/provider/[id]/book/page.tsx
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import BookingFlow from "./BookingFlow";
import { getD4hProvider } from "@/lib/api/d4h/providers";

type Props = { params: Promise<{ locale: string; id: string }> };

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "bookPage" });
  return { title: t("metaTitle") };
}

export default async function BookPage({ params }: Props) {
  const { id, locale } = await params;
  const provider = await getD4hProvider(id, locale);
  if (!provider) notFound();
  const { user } = await requireSession();
  const [services, addresses] = await Promise.all([homeServices(provider.id), homeAddresses()]);
  if (!services.length || !addresses.length) return <main className={styles.page}><div className={styles.container}>
    <header className={styles.head}><h1>{locale === "ar" ? "احجز موعدك" : "Book your appointment"}</h1><p>{provider.name}</p></header>
    <section className={styles.card}><p>{!services.length
      ? locale === "ar" ? "لا توجد خدمات متاحة للحجز لدى مقدم الرعاية حالياً." : "This provider currently has no services available to book."
      : locale === "ar" ? "تحتاج إلى عنوان محفوظ لحجز زيارة منزلية. أضف عنوانك في تطبيق زوارة للزيارات أو تواصل مع الدعم." : "A saved address is required for a home visit. Add your address in Zuwara Visit or contact support."}</p>
      <Link className={styles.ghostLink} href={"/provider/" + provider.id}>{locale === "ar" ? "العودة إلى مقدم الرعاية" : "Back to provider"}</Link>
    </section></div></main>;
  return <BookingFlow provider={provider} services={services} addresses={addresses}
    identity={{name:user.full_name,phone:user.country_code+user.phone_number,email:user.email??""}} />;
}
