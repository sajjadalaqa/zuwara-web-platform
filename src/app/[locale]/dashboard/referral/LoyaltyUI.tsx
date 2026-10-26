import type { ReactNode } from "react";
import { Gift, Users, Sparkles, ArrowDownLeft, ArrowUpRight, History, Info, Search, UserPlus } from "lucide-react";
import type { Loyalty } from "@/lib/api/patient-dashboard";
import Form from "../_patient/Form";
import CopyField from "./CopyField";
import { stamp } from "../_care/ui";
import s from "./loyalty-page.module.css";
export function LoyaltyLayout({ar,children}:{ar:boolean;children:ReactNode}){
 return <div className={s.page}><header className={s.hero}><div><span className={s.eyebrow}>{ar?"رعاية نشاركها معاً":"GOOD CARE IS WORTH SHARING"}</span><h1>{ar?"الإحالة والولاء":"Referral & loyalty"}</h1><p>{ar?"رمز إحالتك ونقاط ولائك، في مكان واحد.":"Your referral code and loyalty points, all in one place."}</p><a href="#referral-code" className={s.primary}><Users size={16}/>{ar?"عرض رمز الإحالة":"View referral code"}</a></div><div className={s.art} aria-hidden="true"><Gift size={55} strokeWidth={1.3}/><Sparkles size={21}/></div></header>{children}</div>;
}
type Entry={id:number;type:string;points:number;direction:string;source:string;created_at:string};
export default function LoyaltyUI({loyalty:l,history,ar}:{loyalty:Loyalty;history:Entry[];ar:boolean}){
 const t=(en:string,arabic:string)=>ar?arabic:en;
 const nf=new Intl.NumberFormat(ar?"ar-SA":"en-GB");
 return <>
 <div className={s.stats}>
  <section className={s.balance}><span className={s.statIcon}><Sparkles size={21}/></span><div><p>{t("Your loyalty points","نقاط ولائك")}</p><strong>{nf.format(l.points)}<small>{t("points","نقطة")}</small></strong></div></section>
  <section className={s.stat}><span className={s.statIcon}><Users size={21}/></span><div><p>{t("Your referrals","إحالاتك")}</p><strong>{nf.format(l.referral_count)}<small>{t("referrals","إحالة")}</small></strong></div></section>
  <section className={s.stat}><span className={s.statIcon}><UserPlus size={21}/></span><div><p>{t("Referral limit","حد الإحالات")}</p><strong>{nf.format(l.max_referrals_per_user)}<small>{t("per account","لكل حساب")}</small></strong></div></section>
 </div>
 <div className={s.workspace}>
  <section id="referral-code" className={s.codeCard}><div className={s.sectionHead}><span className={s.icon}><Gift size={22}/></span><div><h2>{t("A little care to share","رعاية تشاركها مع الآخرين")}</h2><p>{t("Your personal referral code","رمز إحالتك الشخصي")}</p></div></div><span className={l.referral_enabled?s.enabled:s.disabled}>{l.referral_enabled?t("Referrals enabled","الإحالات مفعّلة"):t("Referrals disabled","الإحالات غير مفعّلة")}</span>
   {l.referral_code?<div className={s.copyWrap}><CopyField label={t("YOUR REFERRAL CODE","رمز إحالتك")} value={l.referral_code} copyLabel={t("Copy code","نسخ الرمز")} copiedLabel={t("Copied","تم النسخ")}/></div>:<p className={s.noCode}>{t("No referral code is available for this account.","لا يوجد رمز إحالة متاح لهذا الحساب.")}</p>}
   <div className={s.rewards}><div><span>{t("Referrer points","نقاط المُحيل")}</span><strong>{nf.format(l.referrer_points)}<small>{t("points","نقطة")}</small></strong></div><div><span>{t("Referred patient points","نقاط المريض المُحال")}</span><strong>{nf.format(l.referred_user_points)}<small>{t("points","نقطة")}</small></strong></div></div>
   <div className={s.note}><Info size={17}/><p>{t("Referral assignment applies at signup only. Points cannot be redeemed or converted to wallet credit here.","تُسجّل الإحالة أثناء إنشاء الحساب فقط. لا يمكن استبدال النقاط أو تحويلها إلى رصيد المحفظة هنا.")}</p></div>
  </section>
  <section className={s.checkCard}><div className={s.sectionHead}><span className={s.icon}><Search size={21}/></span><div><h2>{t("Have a referral code?","لديك رمز إحالة؟")}</h2><p>{t("Check a code before using it at signup.","تحقق من الرمز قبل استخدامه عند التسجيل.")}</p></div></div><Form op="referral-validate" source="d4h" label={t("Check referral code","تحقق من رمز الإحالة")}><label>{t("Referral code","رمز الإحالة")}<input name="referral_code" maxLength={150} required placeholder={t("Enter a referral code","أدخل رمز الإحالة")}/></label></Form><div className={s.checkHint}><Info size={16}/><p>{t("Checking a code does not apply a referral to an existing account.","التحقق من الرمز لا يضيف إحالة إلى حساب موجود.")}</p></div></section>
 </div>
 <section className={s.activity}><div className={s.activityHead}><div className={s.sectionHead}><span className={s.icon}><History size={21}/></span><div><h2>{t("Points activity","سجل النقاط")}</h2><p>{t("Keep track of your loyalty history.","تابع سجل نقاط ولائك.")}</p></div></div><span className={s.count}>{history.length} {t("on this page","في هذه الصفحة")}</span></div>
 {history.length?<div className={s.entries}>{history.map(r=><article key={r.id} className={s.entry}><span className={s.entryIcon}>{r.direction==="in"?<ArrowDownLeft size={20}/>:<ArrowUpRight size={20}/>}</span><div className={s.entryText}><h3>{r.type}</h3><p>{stamp(r.created_at,ar)}</p><details><summary>{t("Activity details","تفاصيل الحركة")}</summary><dl><div><dt>{t("Reference","المرجع")}</dt><dd>{r.id}</dd></div><div><dt>{t("Direction","الاتجاه")}</dt><dd>{r.direction}</dd></div><div><dt>{t("Source","المصدر")}</dt><dd>{r.source}</dd></div></dl></details></div><strong className={s.entryPoints}>{nf.format(r.points)}<small>{t("points","نقطة")}</small></strong></article>)}</div>:<div className={s.empty}><span><History size={30}/></span><h3>{t("Your points story starts here","سجل نقاطك يبدأ هنا")}</h3><p>{t("No loyalty history yet. When points activity is recorded, it will appear here.","لا يوجد سجل نقاط بعد. ستظهر حركات النقاط المسجّلة هنا.")}</p></div>}
 </section>
 </>;
}
export {s};