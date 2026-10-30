export function bookingPreviewError(code: string, arabic: boolean, fields: string[] = [], typeHint?: string): string {
  const text = (en: string, ar: string) => arabic ? ar : en;
  if (typeHint && /^This consultant does not offer [a-z_]+ consultations\.?$/i.test(typeHint)) {
    return text("This consultant does not currently offer that consultation type. Choose a different type or consultant.", "هذا الاستشاري لا يقدم هذا النوع من الاستشارات حالياً. اختر نوعاً آخر أو استشارياً آخر.");
  }
  if (code === "SLOT_UNAVAILABLE" || fields.includes("time") || fields.includes("date")) {
    return text("This appointment time is no longer available. Choose another time and review the price again.", "هذا الموعد لم يعد متاحاً. اختر وقتاً آخر وراجع السعر مجدداً.");
  }
  if (code === "INSUFFICIENT_WALLET") {
    return text("Your wallet balance is too low. Choose another payment method or top up your wallet.", "رصيد المحفظة غير كافٍ. اختر طريقة دفع أخرى أو اشحن محفظتك.");
  }
  if (code === "COUPON_UNAVAILABLE" || fields.some(field => field.startsWith("coupon_"))) {
    return text("This coupon cannot be applied. Check the code or remove it to continue.", "لا يمكن استخدام رمز الخصم. تحقق من الرمز أو أزله للمتابعة.");
  }
  if (fields.includes("consultation_type")) {
    return text("This consultation option could not be accepted. Reload the available options and try again.", "تعذر قبول خيار الاستشارة. حدّث الخيارات المتاحة وحاول مجدداً.");
  }
  if (fields.includes("patient_id") || code === "INVALID_PATIENT") {
    return text("Choose a valid patient for this appointment and try again.", "اختر مريضاً صالحاً لهذا الموعد وحاول مجدداً.");
  }
  if (fields.includes("problem")) {
    return text("Please explain your problem before reviewing the appointment price.", "يرجى شرح مشكلتك قبل مراجعة سعر الموعد.");
  }
  if (code === "VALIDATION_FAILED") {
    return text("Please check your appointment details and review the price again.", "يرجى التحقق من تفاصيل الموعد ومراجعة السعر مجدداً.");
  }
  return text("Unable to review the appointment price right now. Please try again shortly.", "تعذرت مراجعة سعر الموعد الآن. يرجى المحاولة بعد قليل.");
}
