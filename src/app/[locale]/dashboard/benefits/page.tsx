import { TicketPercent, Building2, Info, Search, Tag } from "lucide-react";
import s from "./benefits.module.css";
import { getLocale } from "next-intl/server";
import { careList, type Coupon, type Contract } from "@/lib/api/zuwara/care";
import {

  Facts,

  Pager,
  currency,
  stamp,

} from "../_care/ui";
import CouponLookup from "./CouponLookup";
export default async function BenefitsPage({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string;
    contract_page?: string;
    date?: string;
  }>;
}) {
  const sp = await searchParams,
    ar = (await getLocale()) === "ar",
    prefix = ar ? "/ar" : "";
  const date = sp.date && /^\d{4}-\d{2}-\d{2}$/.test(sp.date) ? sp.date : "";
  const [coupons, contracts] = await Promise.all([
    careList<Coupon>("/coupons", Number(sp.page) || 1),
    careList<Contract>(
      "/corporate-contracts",
      Number(sp.contract_page) || 1,
      new URLSearchParams(date ? { date } : {}),
    ),
  ]);
  const t = (en: string, arabic: string) => ar ? arabic : en;
  const pageHref = (page: number, contractPage: number) => prefix + "/dashboard/benefits?" + new URLSearchParams({
    page: String(page), contract_page: String(contractPage), ...(date ? {date} : {}),
  });
  return <div className={s.page}>
    <header className={s.hero}><div><span className={s.eyebrow}>{t("A LITTLE EXTRA, FOR YOUR CARE","مزايا إضافية لرعايتك")}</span><h1>{t("Coupons & contracts","القسائم والعقود")}</h1><p>{t("Explore available offers and your corporate care benefits.","اكتشف العروض المتاحة ومزايا الرعاية المقدمة من شركتك.")}</p><a className={s.primary} href="#coupon-lookup"><Search size={16}/>{t("Check a coupon","تحقق من قسيمة")}</a></div><div className={s.ticketArt} aria-hidden="true"><TicketPercent size={52} strokeWidth={1.3}/><span>ZUWARA</span><i/></div></header>
    <div className={s.sectionNav}><a href="#coupons"><TicketPercent size={17}/>{t("Available coupons","القسائم المتاحة")}<span>{coupons.total}</span></a><a href="#contracts"><Building2 size={17}/>{t("Corporate contracts","عقود الشركات")}<span>{contracts.total}</span></a></div>
    <div className={s.workspace}>
      <section id="coupons" className={s.coupons}><div className={s.sectionHead}><div><span className={s.eyebrow}>{t("OFFERS FOR YOU","عروض لك")}</span><h2>{t("Available coupons","القسائم المتاحة")}</h2></div><span className={s.sectionIcon}><TicketPercent size={22}/></span></div>
        {coupons.items.length ? <div className={s.couponGrid}>{coupons.items.map(item=><article className={s.coupon} key={item.id}><div className={s.couponTop}><span className={s.discount}>{item.percentage}<small>%</small></span><span className={s.offerLabel}>{t("COUPON OFFER","عرض قسيمة")}</span></div><h3>{item.name}</h3><div className={s.code}><Tag size={14}/><span dir="ltr">{item.code}</span></div><Facts rows={[[t("Minimum amount","الحد الأدنى للمبلغ"),currency(item.minimum_amount_halalas,"SAR",ar)],[t("Maximum discount","الحد الأقصى للخصم"),currency(item.maximum_discount_halalas,"SAR",ar)],[t("Expires","تنتهي في"),stamp(item.expires_at,ar)],[t("Booking preview required","معاينة الحجز مطلوبة"),item.requires_booking_preview]]}/></article>)}</div>:<div className={s.empty}><span><TicketPercent size={35}/></span><h3>{t("No offers at the moment","لا توجد عروض حالياً")}</h3><p>{t("No public coupons are available for this account. Have a code? Check it using the coupon lookup.","لا توجد قسائم عامة متاحة لهذا الحساب. لديك رمز؟ تحقق منه باستخدام نموذج القسيمة.")}</p><a href="#coupon-lookup">{t("Check your coupon code","تحقق من رمز قسيمتك")}<Search size={14}/></a></div>}
        {(coupons.page>1||coupons.hasMore)&&<div className={s.pagination}><Pager data={coupons} href={page=>pageHref(page,contracts.page)}/></div>}
      </section>
      <aside className={s.sidebar}><div id="coupon-lookup" className={s.lookup}><CouponLookup/></div><div className={s.note}><Info size={19}/><div><h3>{t("Before you book","قبل الحجز")}</h3><p>{t("Coupon eligibility and the final discount are confirmed during your booking preview.","يتم تأكيد أهلية القسيمة والخصم النهائي أثناء معاينة الحجز.")}</p></div></div></aside>
    </div>
    <section id="contracts" className={s.contractSection}><div className={s.contractHeader}><div className={s.contractTitle}><span className={s.sectionIcon}><Building2 size={24}/></span><div><h2>{t("Corporate contracts","عقود الشركات")}</h2><p>{t("View the corporate care benefits linked to your account.","اطّلع على مزايا الرعاية المؤسسية المرتبطة بحسابك.")}</p></div></div><span className={s.readOnly}>{t("View only","للاطلاع فقط")}</span></div>
      <form className={s.dateForm}><label>{t("Valid on date","صالحة بتاريخ")}<input type="date" name="date" defaultValue={date}/></label><button>{t("Check contracts","تحقق من العقود")}</button></form>
      {contracts.items.length?<div className={s.contractGrid}>{contracts.items.map(item=><article className={s.contract} key={item.id}><h3><Building2 size={18}/>{item.name}</h3><Facts rows={[[t("Contract number","رقم العقد"),item.number],[t("Start date","تاريخ البداية"),item.start_date],[t("End date","تاريخ النهاية"),item.end_date],[t("Patient self-booking supported","الحجز الذاتي للمريض متاح"),item.patient_booking_supported]]}/></article>)}</div>:<div className={s.contractEmpty}><Building2 size={27}/><div><h3>{t("No corporate contracts found","لم يتم العثور على عقود شركات")}</h3><p>{t("No corporate contracts were returned for your account and this date.","لا توجد عقود شركات متاحة لحسابك في هذا التاريخ.")}</p></div></div>}
      <p className={s.contractNote}><Info size={14}/>{t("Corporate contracts are available to view here. Self-booking against a contract is currently unavailable.","عقود الشركات متاحة للاطلاع هنا. الحجز الذاتي بموجب العقد غير متاح حالياً.")}</p>
      {(contracts.page>1||contracts.hasMore)&&<div className={s.pagination}><Pager data={contracts} href={page=>pageHref(coupons.page,page)}/></div>}
    </section>
  </div>;
}