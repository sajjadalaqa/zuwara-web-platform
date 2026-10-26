import { Clock3 } from "lucide-react";
import { getPendingRecharge, paymentUrl } from "@/lib/api/zuwara/recharges";
import { confirmRechargeAction } from "./actions";
import s from "./wallet.module.css";
export default async function RechargeStatus({ locale }: { locale: string }) {
  const recharge = await getPendingRecharge();
  if (!recharge) return null;
  const ar = locale === "ar";
  if ("state" in recharge) return <section className={s.rechargeCard} role="status"><p>{ar ? "تعذر التأكد من طلب الشحن. أعد المحاولة بنفس المبلغ أو تواصل مع الدعم قبل الدفع مجدداً." : "The recharge request needs verification. Retry the same amount or contact support before paying again."}</p></section>;
  const labels: Record<string, string> = ar ? { credited: "تمت إضافة الرصيد", pending: "بانتظار تأكيد الدفع", creating: "جارٍ إنشاء طلب الشحن", needs_review: "طلب الشحن قيد المراجعة", failed: "لم يكتمل طلب الشحن" }
    : { credited: "Funds credited", pending: "Awaiting payment confirmation", creating: "Recharge is being created", needs_review: "Recharge needs review", failed: "Recharge did not complete" };
  return <section className={s.rechargeCard}>
    <div className={s.cardHead}><div className={s.rechargeHeading}><span className={s.statusIcon}><Clock3 size={21}/></span><div><span className={s.statusEyebrow}>{ar ? "حالة الشحن" : "RECHARGE STATUS"}</span><h2>{labels[recharge.status]}</h2></div></div></div>
    {recharge.status === "pending" && <div className={s.cardHead}>
      {recharge.payment_url && <a className={s.addBtn} href={paymentUrl(recharge.payment_url)}>{ar ? "متابعة الدفع" : "Resume payment"}</a>}
      <form action={confirmRechargeAction}><button className={s.addBtn}>{ar ? "التحقق من الدفع" : "Check payment"}</button></form>
    </div>}
    {["creating", "needs_review"].includes(recharge.status) && <p>{ar ? "تواصل مع الدعم قبل إنشاء دفعة جديدة." : "Contact support before starting another payment."}</p>}
  </section>;
}
