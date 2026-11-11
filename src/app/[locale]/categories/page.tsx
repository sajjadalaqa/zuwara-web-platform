// src/app/[locale]/Categories/page.tsx
import { getTranslations } from "next-intl/server";
import CategoriesView from "./CategoriesView";
import { getD4hCategories } from "@/lib/api/d4h/catalog";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "categoriesPage" });
  return { title: t("metaTitle"), description: t("subtitle") };
}

export default async function CategoriesPage({ params }: Props) {
  const { locale } = await params;
  const { categories } = await getD4hCategories(locale);
  return <CategoriesView categories={categories} />;
}