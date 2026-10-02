// src/app/[locale]/Categories/page.tsx
import { getTranslations } from "next-intl/server";
import CategoriesView, { type Category } from "./CategoriesView" ;

type Props = { params: Promise<{ locale: string }> };

/**
 * TODO: replace with your real data source (the same one that produced the
 * 9 categories in your screenshot). Keep the shape { id, slug, name, nameAr, description }.
 * The fallback list below keeps the page working while you wire it up.
 */
async function getCategories(): Promise<Category[]> {
  // const res = await fetch(`${process.env.API_URL}/categories`, { next: { revalidate: 300 } });
  // if (res.ok) return (await res.json()).data;
  return [
    { id: 1, slug: "virtual-consultation", name: "Virtual Consultation", nameAr: "استشارة افتراضية", icon: "video" },
    { id: 2, slug: "instant-appointments", name: "Instant Appointments", nameAr: "مواعيد فورية", icon: "calendar" },
    { id: 3, slug: "therapy-sessions", name: "Therapy Sessions", nameAr: "جلسات علاجية", icon: "bag" },
    { id: 4, slug: "caregiver", name: "Caregiver", nameAr: "مقدم الرعاية", icon: "care" },
    { id: 5, slug: "x-rays-diagnostics", name: "X-Rays & Diagnostics", nameAr: "الأشعة والتشخيص", icon: "scan" },
    { id: 6, slug: "nursing", name: "Nursing", nameAr: "التمريض", icon: "nursing" },
    { id: 7, slug: "vaccinations", name: "Vaccinations", nameAr: "التطعيمات", icon: "syringe" },
    { id: 8, slug: "laboratory", name: "Laboratory", nameAr: "المختبر", icon: "lab" },
    { id: 9, slug: "iv-vitamins", name: "IV Vitamins", nameAr: "فيتامينات وريدية", icon: "pill" },
  ];
}

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "categoriesPage" });
  return { title: t("metaTitle"), description: t("subtitle") };
}

export default async function CategoriesPage() {
  const categories = await getCategories();
  return <CategoriesView categories={categories} />;
}