"use client";
import { useLocale } from "next-intl";
export default function BlogError({reset}:{reset:()=>void}){
 const ar=useLocale()==="ar";
 return <section style={{maxWidth:650,margin:"60px auto",padding:32,border:"1px solid #e4d5ef",borderRadius:20,background:"#fff",textAlign:"center"}}>
 <h2>{ar?"تعذر تحميل المقالات":"Articles could not be loaded"}</h2>
 <p>{ar?"يرجى المحاولة مرة أخرى بعد قليل.":"Please try again in a moment."}</p>
 <button onClick={reset} style={{padding:"12px 22px",border:0,borderRadius:10,color:"white",background:"#74369e",cursor:"pointer"}}>{ar?"إعادة المحاولة":"Try again"}</button>
 </section>;
}