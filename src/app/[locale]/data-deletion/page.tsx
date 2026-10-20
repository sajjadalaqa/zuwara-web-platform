import type { Metadata } from "next";
import { DeletionGuide, type DeletionGuideContent } from "@/components/DeletionGuide";

type Props = { params: Promise<{ locale: string }> };

const content: Record<"en" | "ar", DeletionGuideContent> = {
  en: {
    eyebrow: "Zuwara privacy controls",
    title: "Request deletion of your Zuwara data",
    intro: "You can ask Zuwara to delete specific personal data without deleting your entire account. Zuwara is operated by ALAQA Business Services Company in Riyadh, Saudi Arabia.",
    stepsTitle: "Submit a data-deletion request",
    stepsIntro: "Use the following steps to tell us what you want removed:",
    steps: [
      "Select Request data deletion on this page to open an email to our privacy team.",
      "Send the request from the email address associated with your account and include your full name and registered phone number.",
      "Clearly list the data you want deleted. Never send your password or attach medical documents.",
      "We may contact you to verify your identity and clarify the scope of your request before deleting data.",
    ],
    deletedTitle: "Data you can ask us to delete",
    deletedIntro: "Depending on your use of Zuwara and the scope of your request, eligible data may include:",
    deleted: [
      "Profile details and contact information.",
      "Health-related information and documents that you provided.",
      "Communications, preferences, and app activity associated with your account.",
    ],
    retainedTitle: "Data that may not be deleted immediately",
    retainedIntro: "A deletion request does not apply to information that we must keep for legal, regulatory, healthcare, accounting, security, fraud-prevention, or dispute-resolution obligations.",
    retained: [
      "Records required by applicable healthcare or other laws.",
      "Transaction, payment, and accounting records that must be kept by law.",
      "Security and request-verification records needed to demonstrate compliance.",
    ],
    timingTitle: "Processing and confirmation",
    timing: "We will review and process verified requests as required by applicable law. We will confirm the outcome and explain if any requested information must be retained. Retained information remains protected and is removed when the applicable retention period ends.",
    note: "If you want to remove your account as well as its associated data, use the Account deletion page instead.",
    cardTitle: "Send your request",
    cardText: "Email our privacy team and describe the specific personal data you want deleted. We will use your registered contact details to verify the request.",
    cardAction: "Request data deletion",
    emailLabel: "Email contact@zuwara.net",
    emailSubject: "Zuwara data deletion request",
  },
  ar: {
    eyebrow: "إعدادات الخصوصية في زوارة",
    title: "طلب حذف بياناتك في زوارة",
    intro: "يمكنك أن تطلب من زوارة حذف بيانات شخصية محددة دون حذف حسابك بالكامل. تتولى شركة علاقة لخدمات الأعمال في الرياض، المملكة العربية السعودية، تشغيل زوارة.",
    stepsTitle: "تقديم طلب حذف البيانات",
    stepsIntro: "اتبع الخطوات التالية لتحديد البيانات التي تريد حذفها:",
    steps: [
      "اختر طلب حذف البيانات في هذه الصفحة لفتح رسالة إلى فريق الخصوصية.",
      "أرسل الطلب من البريد الإلكتروني المرتبط بحسابك، وأدرج اسمك الكامل ورقم الجوال المسجل.",
      "حدد بوضوح البيانات التي تريد حذفها. لا ترسل كلمة المرور أو ترفق مستندات طبية.",
      "قد نتواصل معك للتحقق من هويتك وتوضيح نطاق الطلب قبل حذف البيانات.",
    ],
    deletedTitle: "البيانات التي يمكنك طلب حذفها",
    deletedIntro: "بحسب استخدامك لزوارة ونطاق طلبك، قد تشمل البيانات المؤهلة للحذف ما يلي:",
    deleted: [
      "تفاصيل الملف الشخصي ومعلومات الاتصال.",
      "المعلومات والمستندات الصحية التي قدمتها.",
      "المراسلات والتفضيلات ونشاط التطبيق المرتبط بحسابك.",
    ],
    retainedTitle: "بيانات قد لا تُحذف فورًا",
    retainedIntro: "لا يشمل طلب الحذف المعلومات التي يجب الاحتفاظ بها للوفاء بالالتزامات النظامية أو التنظيمية أو الصحية أو المحاسبية أو الأمنية أو لمنع الاحتيال أو تسوية النزاعات.",
    retained: [
      "السجلات المطلوب الاحتفاظ بها بموجب الأنظمة الصحية أو غيرها من الأنظمة المعمول بها.",
      "سجلات المعاملات والدفع والمحاسبة التي يجب الاحتفاظ بها نظامًا.",
      "سجلات الأمان والتحقق من الطلب اللازمة لإثبات الامتثال.",
    ],
    timingTitle: "معالجة الطلب وتأكيده",
    timing: "سنراجع الطلبات التي تم التحقق منها ونعالجها وفقًا للأنظمة المعمول بها. سنؤكد النتيجة ونوضح إذا كان يجب الاحتفاظ بأي معلومات مطلوبة. تظل المعلومات المحتفظ بها محمية وتُحذف عند انتهاء مدة الاحتفاظ المطبقة.",
    note: "إذا كنت تريد حذف حسابك والبيانات المرتبطة به، فاستخدم صفحة حذف الحساب بدلًا من ذلك.",
    cardTitle: "أرسل طلبك",
    cardText: "راسل فريق الخصوصية وحدد البيانات الشخصية التي تريد حذفها. سنستخدم بيانات الاتصال المسجلة للتحقق من الطلب.",
    cardAction: "طلب حذف البيانات",
    emailLabel: "مراسلة contact@zuwara.net",
    emailSubject: "طلب حذف بيانات زوارة",
  },
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const isArabic = locale === "ar";
  return {
    title: isArabic ? "حذف البيانات" : "Data deletion",
    description: isArabic ? "كيفية طلب حذف بيانات شخصية محددة من زوارة." : "How to request deletion of specific personal data from Zuwara.",
    alternates: {
      canonical: isArabic ? "/ar/data-deletion" : "/data-deletion",
      languages: { "en-SA": "/data-deletion", "ar-SA": "/ar/data-deletion" },
    },
  };
}

export default async function DataDeletionPage({ params }: Props) {
  const { locale } = await params;
  return <DeletionGuide content={locale === "ar" ? content.ar : content.en} locale={locale} />;
}
