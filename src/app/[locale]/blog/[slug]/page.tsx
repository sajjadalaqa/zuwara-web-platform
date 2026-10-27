import { notFound } from "next/navigation";
import { getBlog, getBlogs } from "@/lib/api/d4h/blogs";
import { pick } from "@/lib/blog";
import BlogPost from "./BlogPost";
type Props = {params: Promise<{locale:string;slug:string}>};
export async function generateMetadata({params}:Props){
 const {locale,slug}=await params;
 const post=await getBlog(slug,locale);
 if(!post)return {};
 return {title:pick(post.title,locale),description:pick(post.excerpt,locale)};
}
export default async function BlogPostPage({params}:Props){
 const {locale,slug}=await params;
 const post=await getBlog(slug,locale);
 if(!post)notFound();
 const posts=await getBlogs(locale);
 return <BlogPost key={post.slug} post={post} related={posts.filter(p=>p.slug!==post.slug).slice(0,6)}/>;
}