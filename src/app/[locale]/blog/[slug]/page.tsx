// src/app/[locale]/blog/[slug]/page.tsx
import { notFound } from "next/navigation";
import { getPost, pick, posts } from "@/data/blog";
import BlogPost from "./BlogPost";

type Props = { params: Promise<{ locale: string; slug: string }> };

export function generateStaticParams() {
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props) {
  const { locale, slug } = await params;
  const post = getPost(slug);
  if (!post) return {};
  return { title: `${pick(post.title, locale)} | Zuwara`, description: pick(post.excerpt, locale) };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  if (!getPost(slug)) notFound();
  return <BlogPost slug={slug} />;
}