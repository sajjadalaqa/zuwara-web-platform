import { requireSession } from "@/lib/auth/session";
import { homeServices, homeAddresses } from "@/lib/api/d4h/bookings";
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
  return <BookingFlow provider={provider} services={services} addresses={addresses}
    identity={{name:user.full_name,phone:user.country_code+user.phone_number,email:user.email??""}} />;
}
