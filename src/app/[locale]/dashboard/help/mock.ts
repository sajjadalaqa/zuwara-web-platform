import type { FaqCategory, SupportInfo } from "./types";

type Local = { question: string; answer: string };
export type StoredFaq = { id: string; category: FaqCategory; en: Local; ar: Local };

// TODO (backend): delete this file. Load FAQs from your CMS or API instead.
// These answers are sample text. Replace them with your real policies.
export const FAQS: StoredFaq[] = [
  {
    id: "f1", category: "appointments",
    en: { question: "How do I book an appointment?", answer: "Browse providers, pick a service and a time that suits you, then confirm and pay. You'll get a notification as soon as the provider accepts." },
    ar: { question: "كيف أحجز موعداً؟", answer: "تصفّح المزودين، اختر الخدمة والوقت المناسب لك، ثم أكّد الحجز وادفع. ستصلك إشعارات فور قبول المزود للموعد." },
  },
  {
    id: "f2", category: "appointments",
    en: { question: "Can I cancel or reschedule an appointment?", answer: "You can cancel a pending or accepted appointment from the Appointments page. Refunds follow our cancellation policy and go back to your wallet.\nTo change the time, cancel and book a new slot." },
    ar: { question: "هل يمكنني إلغاء الموعد أو تغييره؟", answer: "يمكنك إلغاء الموعد المعلّق أو المقبول من صفحة المواعيد. يخضع الاسترداد لسياسة الإلغاء ويعود المبلغ إلى محفظتك.\nلتغيير الوقت، ألغِ الموعد واحجز موعداً جديداً." },
  },
  {
    id: "f3", category: "appointments",
    en: { question: "How do I join a video consultation?", answer: "Open the appointment details page. The Join button unlocks 10 minutes before the session starts and stays active until it ends." },
    ar: { question: "كيف أنضم إلى استشارة مرئية؟", answer: "افتح صفحة تفاصيل الموعد. يُفتح زر الانضمام قبل بدء الجلسة بـ 10 دقائق ويبقى نشطاً حتى انتهائها." },
  },
  {
    id: "f4", category: "appointments",
    en: { question: "What happens if a provider declines my appointment?", answer: "You won't be charged, and any amount paid is returned to your wallet. You can book another provider right away." },
    ar: { question: "ماذا يحدث إذا رفض المزود موعدي؟", answer: "لن يتم خصم أي مبلغ منك، ويُعاد أي مبلغ مدفوع إلى محفظتك. يمكنك حجز مزود آخر فوراً." },
  },
  {
    id: "f5", category: "payments",
    en: { question: "How do I add money to my wallet?", answer: "Go to Wallet & Payments and tap Add funds. Choose an amount, then complete the payment securely with our payment partner." },
    ar: { question: "كيف أضيف رصيداً إلى محفظتي؟", answer: "اذهب إلى المحفظة والمدفوعات واضغط شحن الرصيد. اختر المبلغ ثم أكمل الدفع بأمان عبر شريك الدفع." },
  },
  {
    id: "f6", category: "payments",
    en: { question: "How long do refunds take?", answer: "Refunds to your wallet are instant once approved. Refunds to your original payment method can take 5 to 10 business days, depending on your bank." },
    ar: { question: "كم يستغرق الاسترداد؟", answer: "الاسترداد إلى محفظتك فوري بعد الموافقة. أما الاسترداد إلى وسيلة الدفع الأصلية فقد يستغرق من 5 إلى 10 أيام عمل حسب البنك." },
  },
  {
    id: "f7", category: "payments",
    en: { question: "Which payment methods can I use?", answer: "You can pay with the cards and methods supported by our payment partner, or from your Zuwara wallet balance." },
    ar: { question: "ما وسائل الدفع المتاحة؟", answer: "يمكنك الدفع بالبطاقات والوسائل التي يدعمها شريك الدفع لدينا، أو من رصيد محفظة زوارة." },
  },
  {
    id: "f8", category: "requests",
    en: { question: "How do service requests work?", answer: "Post what you need at home, such as nursing, lab tests or therapy. Verified providers send you offers, and you accept the one that suits you." },
    ar: { question: "كيف تعمل طلبات الخدمات؟", answer: "انشر ما تحتاجه في المنزل، مثل التمريض أو الفحوصات المخبرية أو الجلسات العلاجية. يرسل لك المزودون الموثوقون عروضهم وتقبل العرض الذي يناسبك." },
  },
  {
    id: "f9", category: "requests",
    en: { question: "Can I cancel a service request?", answer: "Yes, while it's still open. Once you accept an offer, contact support if you need to make a change." },
    ar: { question: "هل يمكنني إلغاء طلب الخدمة؟", answer: "نعم، طالما أنه ما زال مفتوحاً. بعد قبول عرض، تواصل مع الدعم إذا احتجت إلى أي تعديل." },
  },
  {
    id: "f10", category: "requests",
    en: { question: "Do I have to accept an offer?", answer: "No. You can wait for more offers, compare prices and ratings, or cancel the request." },
    ar: { question: "هل يجب أن أقبل عرضاً؟", answer: "لا. يمكنك انتظار المزيد من العروض ومقارنة الأسعار والتقييمات، أو إلغاء الطلب." },
  },
  {
    id: "f11", category: "account",
    en: { question: "How do I change my name or phone number?", answer: "Open My Profile and edit your details. Your email address can't be changed from there, so contact support if you need to update it." },
    ar: { question: "كيف أغيّر اسمي أو رقم جوالي؟", answer: "افتح ملفي الشخصي وعدّل بياناتك. لا يمكن تغيير البريد الإلكتروني من هناك، لذا تواصل مع الدعم إذا احتجت إلى تحديثه." },
  },
  {
    id: "f12", category: "account",
    en: { question: "I forgot my password. What should I do?", answer: "Use the Forgot password link on the login page to receive a reset link.\nOnce signed in, you can change your password anytime from My Profile." },
    ar: { question: "نسيت كلمة المرور. ماذا أفعل؟", answer: "استخدم رابط نسيت كلمة المرور في صفحة تسجيل الدخول لتصلك رسالة إعادة التعيين.\nبعد تسجيل الدخول يمكنك تغيير كلمة المرور في أي وقت من ملفي الشخصي." },
  },
  {
    id: "f13", category: "account",
    en: { question: "How do I delete my account?", answer: "Go to My Profile, scroll to Delete Account and confirm with your password. This permanently removes your data and can't be undone." },
    ar: { question: "كيف أحذف حسابي؟", answer: "اذهب إلى ملفي الشخصي ثم قسم حذف الحساب وأكّد بكلمة المرور. يؤدي ذلك إلى إزالة بياناتك نهائياً ولا يمكن التراجع عنه." },
  },
];

// TODO (backend): replace these PLACEHOLDER contact details with your real ones.
export const SUPPORT = {
  email: "support@zuwara.sa",
  phone: "+966 11 000 0000",
  whatsapp: "966500000000",
  hours: {
    en: "Sunday to Thursday, 9:00 AM to 6:00 PM (Riyadh time)",
    ar: "من الأحد إلى الخميس، 9:00 ص إلى 6:00 م (بتوقيت الرياض)",
  },
} satisfies Omit<SupportInfo, "hours"> & { hours: { en: string; ar: string } };