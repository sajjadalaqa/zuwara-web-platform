"use client";
import { useState } from "react";
import { Star } from "lucide-react";
import s from "./review-page.module.css";
export default function ReviewRating({ar}:{ar:boolean}){
 const [value,setValue]=useState("");
 return <div className={s.ratingField}><span>{ar?"كيف تقيّم تجربتك؟":"How would you rate your experience?"}</span><div className={s.ratingControls}><div className={s.ratingButtons} role="group" aria-label={ar?"اختر التقييم":"Choose a rating"} dir="ltr">{[1,2,3,4,5].map(n=><button key={n} type="button" aria-label={ar?n+" من ٥":n+" out of 5"} aria-pressed={Number(value)===n} onClick={()=>setValue(current=>Number(current)===n?"":String(n))}><Star size={29} fill={n<=Number(value)?"currentColor":"none"}/></button>)}</div><label className={s.numericRating}><span>{ar?"التقييم (١ إلى ٥)":"Rating (1 to 5)"}</span><input name="rating" type="number" step="0.01" min="1" max="5" required value={value} onChange={e=>setValue(e.target.value)} placeholder="1–5"/></label></div></div>;
}