const messages: Record<string, [string, string]> = {
  NO_INSTANT_CONSULTANTS: ["No consultant is available for this instant request right now. Try again later or choose another consultant.", "لا يوجد استشاري متاح لهذا الطلب الفوري حالياً. حاول لاحقاً أو اختر استشارياً آخر."],
  INSTANT_UNAVAILABLE: ["This instant consultation is currently unavailable. Choose another consultant or try again later.", "هذه الاستشارة الفورية غير متاحة حالياً. اختر استشارياً آخر أو حاول لاحقاً."],
  INSTANT_V2_DISABLED: ["Instant consultations are temporarily unavailable. Please try again later.", "الاستشارات الفورية غير متاحة مؤقتاً. يرجى المحاولة لاحقاً."],
  ACTIVE_INSTANT_REQUEST: ["You already have an active instant request. Refresh status to continue with that request.", "لديك طلب استشارة فورية نشط. حدّث الحالة لمتابعة الطلب الحالي."],
  INSUFFICIENT_WALLET: ["Your wallet balance is too low for this consultation. Add funds or select another available payment method.", "رصيد محفظتك غير كافٍ لهذه الاستشارة. أضف رصيداً أو اختر طريقة دفع أخرى متاحة."],
  INSTANT_ATTEMPT_LIMIT: ["You have reached the request limit for this consultant. Choose another consultant or try again after the retry window.", "وصلت إلى الحد الأقصى للطلبات لهذا الاستشاري. اختر استشارياً آخر أو حاول بعد انتهاء فترة الانتظار."],
  INSTANT_PAYMENT_EXPIRED: ["The payment deadline has passed. Refresh the request to check its final status.", "انتهت مهلة الدفع. حدّث الطلب للتحقق من حالته النهائية."],
  INSTANT_NOT_PAYABLE: ["This request cannot accept a new payment. Refresh its status to check the next step.", "لا يمكن إجراء دفعة جديدة لهذا الطلب. حدّث حالته لمعرفة الخطوة التالية."],
  CHECKOUT_ALREADY_EXISTS: ["A checkout already exists for this request. Refresh status and continue with the existing payment.", "توجد عملية دفع لهذا الطلب بالفعل. حدّث الحالة وتابع عملية الدفع الحالية."],
  INSTANT_OPERATION_REVIEW: ["The previous operation needs review. Refresh the request or contact support before making another payment.", "تحتاج العملية السابقة إلى مراجعة. حدّث الطلب أو تواصل مع الدعم قبل إجراء دفعة أخرى."],
  INSTANT_PAYMENT_REVIEW: ["Your payment needs review. Check its status or contact support before paying again.", "تحتاج دفعتك إلى مراجعة. تحقق من حالتها أو تواصل مع الدعم قبل الدفع مجدداً."],
  OPERATION_BUSY: ["An earlier request is still being processed. Wait a moment, then refresh its status.", "لا يزال طلب سابق قيد المعالجة. انتظر قليلاً ثم حدّث حالته."],
  CONTRACT_BOOKING_REQUIRED: ["This consultation requires the corporate booking flow. Contact support to continue with your coverage.", "تتطلب هذه الاستشارة مسار حجز الشركات. تواصل مع الدعم للمتابعة باستخدام تغطيتك."],
  COUPON_UNAVAILABLE: ["This coupon is not available for this consultation. Review your selection before continuing.", "هذه القسيمة غير متاحة لهذه الاستشارة. راجع اختيارك قبل المتابعة."],
};

export function instantErrorMessage(code: string, locale: string, type?: "public" | "private"): string {
  if (["NO_INSTANT_CONSULTANTS", "INSTANT_UNAVAILABLE"].includes(code) && type) {
    const availability: [string, string] = type === "private"
      ? ["Your selected consultant cannot take this private instant request right now. Choose another consultant or try again later.", "الاستشاري الذي اخترته لا يستطيع استقبال طلبك الفوري الخاص حالياً. اختر استشارياً آخر أو حاول لاحقاً."]
      : ["No consultant is available for your public instant request with these selections right now. Try a different specialty or try again later.", "لا يوجد استشاري متاح لطلبك الفوري العام وفق هذه الخيارات حالياً. جرّب تخصصاً آخر أو حاول لاحقاً."];
    return availability[locale === "ar" ? 1 : 0];
  }
  const message = messages[code] ?? ["We couldn’t complete this step. Refresh the request to check its status. If a payment may be in progress, contact support before paying again.", "تعذر إكمال هذه الخطوة. حدّث الطلب للتحقق من حالته. إذا كانت هناك دفعة قيد المعالجة، تواصل مع الدعم قبل الدفع مجدداً."];
  return message[locale === "ar" ? 1 : 0];
}
