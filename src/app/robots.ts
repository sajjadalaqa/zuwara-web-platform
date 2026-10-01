import type { MetadataRoute } from "next";
import { SITE_INDEXABLE, SITE_URL } from "@/data/site";
export default function robots():MetadataRoute.Robots{
  // Before go-live, crawling stays allowed so bots can see the noindex, nofollow header on every response.
  if(!SITE_INDEXABLE)return{rules:{userAgent:"*",allow:"/"}};
  return{rules:{userAgent:"*",allow:"/",disallow:["/book","/login","/account","/checkout","/api"]},sitemap:`${SITE_URL}/sitemap.xml`,host:SITE_URL}}
