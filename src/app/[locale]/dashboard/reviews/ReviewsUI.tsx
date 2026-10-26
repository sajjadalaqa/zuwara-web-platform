import Link from "next/link";
import { Star, MessageSquare, Stethoscope, House, PenLine, Info, Quote } from "lucide-react";
import type { ReactNode } from "react";
import type { Review, Source } from "@/lib/api/patient-dashboard";
import Form from "../_patient/Form";
import { stamp } from "../_care/ui";
import Rating from "./ReviewRating";
import s from "./review-page.module.css";

export function ReviewsLayout({children,ar,backend,base}:{children:ReactNode;ar:boolean;backend:Source;base:string}) {
 const t=(en:string,arabic:string)=>ar?arabic:en;
 return <div className={s.page}>
  <header className={s.hero}><div><span className={s.eyebrow}>{t("YOUR EXPERIENCE MATTERS","تجربتك تهمنا")}</span><h1>{t("My reviews","تقييماتي")}</h1><p>{t("A few words from you can make care better for everyone.","كلمات قليلة منك تساعد على تحسين الرعاية للجميع.")}</p><a href="#write-review" className={s.primary}><PenLine size={16}/>{t("Write a review","اكتب تقييماً")}</a></div><div className={s.art} aria-hidden="true"><Quote size={38}/><div>{[1,2,3,4,5].map(n=><Star key={n} size={19} fill="currentColor"/>)}</div><i/><i/></div></header>
  <div className={s.toolbar}><nav className={s.tabs} aria-label={t("Review source","مصدر التقييم")}><Link href={base+"?source=zuwara"} aria-current={backend==="zuwara"?"page":undefined}><Stethoscope size={17}/>{t("Consultations","الاستشارات")}</Link><Link href={base+"?source=d4h"} aria-current={backend==="d4h"?"page":undefined}><House size={17}/>{t("Home visits","الزيارات المنزلية")}</Link></nav><span className={s.toolbarNote}><MessageSquare size={15}/>{t("Your voice helps shape better care","رأيك يساعد على تحسين الرعاية")}</span></div>
  {children}
 </div>;
}
export default function ReviewsUI({rows,ar,backend}:{rows:Review[];ar:boolean;backend:Source}){
 const t=(en:string,arabic:string)=>ar?arabic:en;
 return <div className={s.workspace}>
  <section className={s.formCard} id="write-review"><div className={s.sectionHead}><span className={s.icon}><PenLine size={22}/></span><div><h2>{t("Share your experience","شارك تجربتك")}</h2><p>{t("Tell us about a completed appointment or visit.","أخبرنا عن موعد أو زيارة مكتملة.")}</p></div></div>
   <Form op="review" source={backend} label={t("Submit review","إرسال التقييم")}>
    <label>{backend==="d4h"?t("Completed visit reference","مرجع الزيارة المكتملة"):t("Completed appointment reference","مرجع الموعد المكتمل")}<input name="id" type="number" step="1" required placeholder={t("Enter your reference number","أدخل رقم المرجع")}/></label>
    <Rating ar={ar}/>
    <label>{t("Your review","تقييمك")}<textarea name="comment" maxLength={2000} required placeholder={t("How was your experience? What went well, or could be better?","كيف كانت تجربتك؟ ما الذي أعجبك وما الذي يمكن تحسينه؟")} rows={5}/><span className={s.hint}>{t("Up to 2,000 characters. Please avoid sharing personal medical details.","حتى ٢٠٠٠ حرف. يرجى تجنّب مشاركة التفاصيل الطبية الشخصية.")}</span></label>
   </Form>
   <div className={s.notice}><Info size={17}/><p>{t("Please check your review before submitting. Reviews cannot be changed or deleted after submission.","يرجى مراجعة تقييمك قبل الإرسال. لا يمكن تعديل التقييم أو حذفه بعد الإرسال.")}</p></div>
  </section>
  <section className={s.library}><div className={s.libraryHead}><div><span className={s.eyebrow}>{t("YOUR FEEDBACK","آراؤك")}</span><h2>{t("Submitted reviews","التقييمات المرسلة")}</h2></div><span className={s.count}>{rows.length} {t("on this page","في هذه الصفحة")}</span></div>
   {rows.length?<div className={s.list}>{rows.map(r=><article className={s.review} key={r.id}><div className={s.reviewHead}><span className={s.icon}><MessageSquare size={20}/></span><div><h3>{r.appointment_id?t("Consultation review","تقييم الاستشارة"):r.booking_id?t("Home visit review","تقييم الزيارة المنزلية"):t("Care review","تقييم الرعاية")}</h3><time>{stamp(r.created_at,ar)}</time></div></div><div className={s.ratingLine}><span className={s.stars} role="img" aria-label={t(r.rating+" out of 5",r.rating+" من ٥")} dir="ltr">{[1,2,3,4,5].map(n=><Star size={16} key={n} fill={n<=r.rating?"currentColor":"none"}/>)}</span><strong>{r.rating}<small> / 5</small></strong></div><p className={s.comment}>{r.comment}</p><details><summary>{t("Review details","تفاصيل التقييم")}</summary><dl>{[[t("Reference","المرجع"),r.id],[t("Appointment","الموعد"),r.appointment_id],[t("Visit","الزيارة"),r.booking_id],[t("Consultant","الاستشاري"),r.consultant_id],[t("Service","الخدمة"),r.service_id]].filter(([,value])=>value!==undefined&&value!==null).map(([label,value])=><div key={String(label)}><dt>{label}</dt><dd>{value}</dd></div>)}</dl></details></article>)}</div>:<div className={s.empty}><span><MessageSquare size={33}/></span><h3>{t("Your story starts here","تجربتك تبدأ هنا")}</h3><p>{t("No reviews submitted in this account yet. After your appointment or visit, share a few words about your care.","لم ترسل تقييماً في هذا الحساب بعد. بعد موعدك أو زيارتك، شارك رأيك حول الرعاية.")}</p><a href="#write-review"><PenLine size={15}/>{t("Write your first review","اكتب تقييمك الأول")}</a></div>}
   <aside className={s.tip}><Star size={20}/><div><h3>{t("Small feedback. Meaningful impact.","رأي بسيط، أثر كبير.")}</h3><p>{t("Thoughtful, honest reviews help others feel more confident about their care.","تساعد التقييمات الصادقة الآخرين على اختيار الرعاية بثقة أكبر.")}</p></div></aside>
  </section>
 </div>;
}
export {s};