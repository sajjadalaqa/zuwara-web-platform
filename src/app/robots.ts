import type { MetadataRoute } from "next";
import { SITE_URL } from "@/data/site";
export default function robots():MetadataRoute.Robots{return{rules:{userAgent:"*",allow:"/",disallow:["/book","/login","/account","/checkout","/api"]},sitemap:`${SITE_URL}/sitemap.xml`,host:SITE_URL}}
