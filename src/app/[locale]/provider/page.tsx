// src/app/[locale]/provider/page.tsx
import { getTranslations } from "next-intl/server";
import ProviderView, { type Provider } from "./ProviderView";

type Props = { params: Promise<{ locale: string }> };

// TODO: replace with your real providers API
async function getProviders(): Promise<Provider[]> {
  return [
    { id: 1, name: "Rameen Imran", title: "Cardiologist", image: "" },
    { id: 2, name: "M S Khan", title: "Developer", image: "" },
    { id: 3, name: "Zuwara Home Healthcare", title: "Manager", image: "" },
    { id: 4, name: "Ruth Fletcher", title: "Nurse", image: "" },
    { id: 5, name: "Cynthia Gross", title: "Therapist", image: "" },
    { id: 6, name: "Test Tesrrtt", title: "Plumber", image: "" },
    { id: 7, name: "Test Tes", title: "Test", image: "" },
    { id: 8, name: "Test Ttt", title: "Test", image: "" },
  ];
}

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "providerPage" });
  return { title: t("metaTitle"), description: t("subtitle") };
}

export default async function ProviderPage() {
  const providers = await getProviders();
  return <ProviderView providers={providers} />;
}