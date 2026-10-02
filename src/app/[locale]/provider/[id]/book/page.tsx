// src/app/[locale]/provider/[id]/book/page.tsx
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import BookingFlow, { type BookingProvider } from "./BookingFlow";

type Props = { params: Promise<{ locale: string; id: string }> };

// TODO: use the same provider source as your provider details page.
async function getProvider(id: string): Promise<BookingProvider | null> {
  return { id, name: "Ruth Fletcher", title: "Nurse", image: "" };
}

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "bookPage" });
  return { title: t("metaTitle") };
}

export default async function BookPage({ params }: Props) {
  const { id } = await params;
  const provider = await getProvider(id);
  if (!provider) notFound();
  return <BookingFlow provider={provider} />;
}