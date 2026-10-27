import "server-only";
import { cache } from "react";
import { d4hV2, D4hV2Error } from "./v2";
import type { BlogPostData } from "@/lib/blog";
import type { Block } from "@/data/blog";
type Row = {
 id: number; title: string; excerpt: string; published_at: string | null;
 author: {name: string} | null; cover_image_url: string | null;
 content_html?: string; content_text?: string;
};
function text(value: string) {
 return value.replace(/<[^>]*>/g, "").replace(/&(#x[0-9a-f]+|#\d+|amp|lt|gt|quot|apos|nbsp);/gi, (match, entity: string) => {
  const named: Record<string,string>={amp:"&",lt:"<",gt:">",quot:'"',apos:"'",nbsp:" "};
  if (entity.startsWith("#")) {
   const code=entity[1].toLowerCase()==="x"?parseInt(entity.slice(2),16):parseInt(entity.slice(1),10);
   return Number.isFinite(code)&&code>0&&code<=0x10ffff?String.fromCodePoint(code):match;
  }
  return named[entity.toLowerCase()]??match;
 }).trim();
}
const bi=(value:string)=>({en:value,ar:value});
function content(row: Row): Block[] {
 const blocks: Block[]=[];
 // Only text is rendered through React. API HTML is never injected.
 if(row.content_html){
  for(const match of row.content_html.matchAll(/<(h[1-6]|p|blockquote|ul|ol)\b[^>]*>([\s\S]*?)<\/\1>/gi)){
   const tag=match[1].toLowerCase();
   if(tag==="ul"||tag==="ol"){
    const items=[...match[2].matchAll(/<li\b[^>]*>([\s\S]*?)<\/li>/gi)].map(m=>bi(text(m[1])));
    if(items.length)blocks.push({type:"ul",items});
   }else{
    const value=text(match[2].replace(/<br\s*\/?>/gi,"\n"));
    if(value)blocks.push({type:tag.startsWith("h")?"h2":tag==="blockquote"?"quote":"p",text:bi(value)});
   }
  }
 }
 return blocks.length?blocks:(row.content_text||"").split(/\n\s*\n/).map(value=>({type:"p" as const,text:bi(value.trim())})).filter(b=>b.text.en);
}
function map(row: Row): BlogPostData {
 if(!row||!Number.isSafeInteger(row.id)||row.id<1||typeof row.title!=="string")throw new D4hV2Error(502,"INVALID_BLOG");
 const words=(row.content_text||"").trim().split(/\s+/).filter(Boolean).length;
 return {slug:String(row.id),category:"",title:bi(row.title),excerpt:bi(row.excerpt||""),author:bi(row.author?.name||""),date:row.published_at||"",readMinutes:words?Math.max(1,Math.ceil(words/200)):0,cover:row.cover_image_url&&/^https?:\/\//.test(row.cover_image_url)?row.cover_image_url:undefined,content:content(row)};
}
export const getBlogs=cache(async(locale:string):Promise<BlogPostData[]>=>{
 const posts:BlogPostData[]=[];const seen=new Set<number>();
 for(let page=1;page<=100;page++){
  const response=await d4hV2<Row[]>("/blogs?"+new URLSearchParams({page:String(page),per_page:"50"}),{locale});
  if(!Array.isArray(response.data)||!response.meta?.pagination)throw new D4hV2Error(502,"INVALID_BLOG_LIST");
  let added=0;
  for(const row of response.data){if(!seen.has(row.id)){posts.push(map(row));seen.add(row.id);added++;}}
  if(!response.meta.pagination.has_more)return posts;
  if(!added)throw new D4hV2Error(502,"INVALID_PAGINATION");
 }
 throw new D4hV2Error(502,"INVALID_PAGINATION");
});
export const getBlog=cache(async(id:string,locale:string):Promise<BlogPostData|null>=>{
 if(!/^[1-9]\d*$/.test(id)||!Number.isSafeInteger(Number(id)))return null;
 try{
  const response=await d4hV2<Row>("/blogs/"+id,{locale});
  if(response.data?.id!==Number(id))throw new D4hV2Error(502,"INVALID_BLOG");
  return map(response.data);
 }catch(error){if(error instanceof D4hV2Error&&error.status===404)return null;throw error;}
});