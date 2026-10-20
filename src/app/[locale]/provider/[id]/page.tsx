// src/app/[locale]/provider/[id]/page.tsx
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import ProviderDetail from "./ProviderDetail";
import { getD4hProvider } from "@/lib/api/d4h/providers";

type Props = { params: Promise<{ locale: string; id: string }> };

export async function generateMetadata({ params }: Props) {
  const { locale, id } = await params;
  const t = await getTranslations({ locale, namespace: "providerDetail" });
  const p = await getD4hProvider(id, locale);
  return { title: p ? `${p.name} | ${t("metaSuffix")}` : t("metaSuffix") };
}

export default async function ProviderDetailPage({ params }: Props) {
  const { id, locale } = await params;
  const provider = await getD4hProvider(id, locale);
  if (!provider) notFound();
  return <ProviderDetail provider={provider} />;
}