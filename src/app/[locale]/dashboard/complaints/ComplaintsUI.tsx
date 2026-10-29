import { useUiText } from "@/i18n/use-ui-text";
import Link from "next/link";
import type { ReactNode } from "react";
import { MessageSquare, PenLine, Info, ArrowUpRight, ClipboardList, Clock3 } from "lucide-react";
import type { Complaint } from "@/lib/api/patient-dashboard";
import Form from "../_patient/Form";
import { stamp } from "../_care/ui";
import s from "./complaint-page.module.css";
export function ComplaintsLayout({ar,children}:{ar:boolean;children:ReactNode}){
  const uiText = useUiText();
 return <div className={s.page}><header className={s.hero}><div><span className={s.eyebrow}>{ar?"رأيك يهمنا":"WE VALUE YOUR FEEDBACK"}</span><h1>{ar?"الشكاوى":uiText("Complaints")}</h1><p>{ar?"شارك مخاوفك واطّلع على الشكاوى التي أرسلتها.":"Share a concern and keep track of your submitted complaints."}</p><a href="#new-complaint" className={s.primary}><PenLine size={16}/>{ar?"إرسال شكوى":"Submit a concern"}</a></div><div className={s.art} aria-hidden="true"><MessageSquare size={52} strokeWidth={1.3}/><span/><span/><span/></div></header>{children}</div>;
}
export default function ComplaintsUI({rows,base,ar}:{rows:Complaint[];base:string;ar:boolean}){
  const uiText = useUiText();
 const t=(en:string,arabic:string)=>ar?arabic:en;
 return <div className={s.workspace}>
 <section className={s.formCard} id="new-complaint"><div className={s.sectionHead}><span className={s.icon}><PenLine size={22}/></span><div><h2>{t("Tell us what happened","أخبرنا بما حدث")}</h2><p>{t("Help us understand your concern.","ساعدنا على فهم شكواك.")}</p></div></div>
 <Form op="complaint" source="zuwara" label={t("Submit complaint","إرسال الشكوى")} uncertain>
 <label>{t("Subject","الموضوع")}<input name="subject" maxLength={150} required placeholder={t("A short summary of your concern","ملخص قصير لشكواك")}/></label>
 <label>{t("Your message","رسالتك")}<textarea name="message" maxLength={5000} required rows={6} placeholder={t("Describe what happened and include any details that may help.","صف ما حدث وأضف التفاصيل التي قد تساعد.")}/><span className={s.hint}>{t("Up to 5,000 characters.","حتى ٥٠٠٠ حرف.")}</span></label>
 <label>{t("Appointment / visit reference (optional)","مرجع الموعد / الزيارة (اختياري)")}<input name="booking_id" type="number" step="1" placeholder={t("Enter reference number, if available","أدخل رقم المرجع إن وجد")}/></label>
 </Form><div className={s.note}><Info size={17}/><p>{t("Submitting a complaint does not trigger a refund or confirm an email/SMS notification. Replies are not available here.","إرسال الشكوى لا يؤدي إلى استرداد الأموال أو تأكيد إشعار بالبريد أو الرسائل النصية. الردود غير متاحة هنا.")}</p></div></section>
 <section className={s.library}><div className={s.libraryHead}><div><span className={s.eyebrow}>{t("YOUR CONCERNS","شكاواك")}</span><h2>{t("Submitted complaints","الشكاوى المرسلة")}</h2></div><span className={s.count}>{rows.length} {t("on this page","في هذه الصفحة")}</span></div>
 {rows.length?<div className={s.list}>{rows.map(r=><article className={s.complaint} key={r.id}><div className={s.complaintHead}><span className={s.icon}><MessageSquare size={20}/></span><h3>{r.subject}</h3><span className={s.status}>{r.status}</span></div><p className={s.message}>{r.message}</p><div className={s.date}><Clock3 size={13}/><span>{stamp(r.created_at,ar)}</span></div><details><summary>{t("Complaint details","تفاصيل الشكوى")}</summary><dl><div><dt>{t("Reference","المرجع")}</dt><dd>{r.id}</dd></div><div><dt>{t("Booking reference","مرجع الحجز")}</dt><dd>{r.booking_id??"—"}</dd></div><div><dt>{t("Last updated","آخر تحديث")}</dt><dd>{stamp(r.updated_at,ar)}</dd></div></dl></details><Link href={base+"/"+encodeURIComponent(r.id)+"?source=zuwara"}>{t("View complaint","عرض الشكوى")}<ArrowUpRight size={15}/></Link></article>)}</div>:<div className={s.empty}><span><ClipboardList size={35}/></span><h3>{t("No complaints submitted","لا توجد شكاوى مرسلة")}</h3><p>{t("Your submitted concerns will appear here. If something needs attention, use the form to tell us about it.","ستظهر شكاواك المرسلة هنا. إذا كان هناك ما يستدعي الانتباه، أخبرنا باستخدام النموذج.")}</p><a href="#new-complaint"><PenLine size={14}/>{t("Share a concern","شارك شكواك")}</a></div>}
 <aside className={s.tip}><Info size={18}/><div><h3>{t("A helpful description makes a difference","التفاصيل تساعد على فهم المشكلة")}</h3><p>{t("Include the appointment reference and a clear description when possible. Avoid sharing passwords or verification codes.","أضف مرجع الموعد ووصفاً واضحاً إن أمكن. تجنّب مشاركة كلمات المرور أو رموز التحقق.")}</p></div></aside>
 </section></div>;
}
export {s};