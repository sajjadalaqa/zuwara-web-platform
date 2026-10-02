// src/app/[locale]/provider/[id]/page.tsx
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import ProviderDetail, { type ProviderInfo } from "./ProviderDetail";

type Props = { params: Promise<{ locale: string; id: string }> };

/**
 * TODO: connect your real "provider detail" API (the one behind /provider-detail/60).
 * Return null when the provider does not exist.
 * Shape: { id, name, nameAr?, title?, titleAr?, image?, email?, joinedAt (ISO date),
 *          rating (0-5), reviewsCount, bookingsCompleted, bio?, bioAr? }
 */
async function getProvider(id: string): Promise<ProviderInfo | null> {
  // const res = await fetch(`${process.env.API_URL}/providers/${id}`, { next: { revalidate: 300 } });
  // if (!res.ok) return null;
  // const p = (await res.json()).data;
  // return { id: p.id, name: p.name, title: p.designation, image: p.image_url, email: p.email,
  //          joinedAt: p.created_at, rating: p.avg_rating ?? 0, reviewsCount: p.reviews_count ?? 0,
  //          bookingsCompleted: p.completed_bookings ?? 0, bio: p.about };
  return {
    id,
    name: "Ruth Fletcher",
    title: "Nurse",
    image: "",
    email: "ruth@gmail.com",
    joinedAt: "2023-10-13",
    rating: 0,
    reviewsCount: 0,
    bookingsCompleted: 0,
    bio: "",
  };
}

export async function generateMetadata({ params }: Props) {
  const { locale, id } = await params;
  const t = await getTranslations({ locale, namespace: "providerDetail" });
  const p = await getProvider(id);
  return { title: p ? `${p.name} | ${t("metaSuffix")}` : t("metaSuffix") };
}

export default async function ProviderDetailPage({ params }: Props) {
  const { id } = await params;
  const provider = await getProvider(id);
  if (!provider) notFound();
  return <ProviderDetail provider={provider} />;
}