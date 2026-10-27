import { getBlogs } from "@/lib/api/d4h/blogs";
// src/app/[locale]/blog/page.tsx
import { getTranslations } from "next-intl/server";
import BlogView from "./BlogView";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ category?: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "blogPage" });
  return { title: t("metaTitle"), description: t("subtitle") };
}

export default async function BlogPage({ params, searchParams }: Props) {
  const [{ category }, { locale }] = await Promise.all([searchParams, params]);
  const posts = await getBlogs(locale);
  return <BlogView posts={posts} initialCategory={category ?? "all"} />;
}