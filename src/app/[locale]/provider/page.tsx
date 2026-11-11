// src/app/[locale]/provider/page.tsx
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import ProviderView from "./ProviderView";
import { getD4hProviders } from "@/lib/api/d4h/providers";

type Props = { params: Promise<{ locale: string }>; searchParams: Promise<{ service_id?: string | string[] }> };

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "providerPage" });
  return { title: t("metaTitle"), description: t("subtitle") };
}

export default async function ProviderPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const query = await searchParams;
  const service = Array.isArray(query.service_id) ? query.service_id[0] : query.service_id;
  if (service && (!/^[1-9]\d*$/.test(service) || !Number.isSafeInteger(Number(service)))) notFound();
  const providers = await getD4hProviders(locale, service ? Number(service) : undefined);
  return <ProviderView providers={providers} />;
}