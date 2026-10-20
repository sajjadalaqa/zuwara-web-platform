// src/app/[locale]/provider/page.tsx
import { getTranslations } from "next-intl/server";
import ProviderView from "./ProviderView";
import { getD4hProviders } from "@/lib/api/d4h/providers";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "providerPage" });
  return { title: t("metaTitle"), description: t("subtitle") };
}

export default async function ProviderPage({ params }: Props) {
  const { locale } = await params;
  const providers = await getD4hProviders(locale);
  return <ProviderView providers={providers} />;
}