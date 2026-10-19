import type { Metadata } from "next";
import { DeletionGuide, type DeletionGuideContent } from "@/components/DeletionGuide";

type Props = { params: Promise<{ locale: string }> };

const content: Record<"en" | "ar", DeletionGuideContent> = {
  en: {
    eyebrow: "Zuwara account controls",
    title: "Delete your Zuwara account",
    intro: "This page explains how Zuwara users can permanently delete their account and the data associated with it. Zuwara is operated by ALAQA Business Services Company in Riyadh, Saudi Arabia.",
    stepsTitle: "Delete your account",
    stepsIntro: "You can start the request in either of these ways:",
    steps: [
      "In the Zuwara app, open Profile and select Delete Account, then follow the confirmation steps.",
      "If you cannot access the app, select Request account deletion on this page and email us from the address or phone number associated with your account.",
      "Include your full name and registered phone number or email address. Never send your password or medical documents.",
      "We may contact you to verify that you own the account before completing the request.",
    ],
    deletedTitle: "What will be deleted",
    deletedIntro: "After verification, the account is permanently closed and data associated with it is deleted or anonymized, including:",
    deleted: [
      "Your profile and account contact information.",
      "Personal and health-related information stored in your Zuwara account.",
      "Uploaded documents, communications, preferences, and app activity associated with the account, unless retention is legally required.",
    ],
    retainedTitle: "What may be retained",
    retainedIntro: "Some information may be retained when required for legal, regulatory, healthcare, accounting, security, fraud-prevention, or dispute-resolution obligations.",
    retained: [
      "Records required by applicable healthcare or other laws.",
      "Transaction, payment, and accounting records that must be kept by law.",
      "Security and request-verification records needed to demonstrate compliance.",
    ],
    timingTitle: "Processing and confirmation",
    timing: "We will process verified requests as required by applicable law and confirm when the request is complete. Any information that must legally be retained is protected, used only for the required purpose, and removed when the applicable retention period ends.",
    note: "Deleting your account is permanent and cannot be undone.",
    cardTitle: "Cannot access the app?",
    cardText: "Email our privacy team to request permanent account deletion. Use the contact details registered to your Zuwara account so we can verify your request.",
    cardAction: "Request account deletion",
    emailLabel: "Email contact@zuwara.net",
    emailSubject: "Zuwara account deletion request",
  },
  ar: {
    eyebrow: "إعدادات حساب زوارة",
    title: "حذف حسابك في زوارة",
    intro: "توضح هذه الصفحة كيفية حذف حساب زوارة والبيانات المرتبطة به نهائيًا. تتولى شركة علاقة لخدمات الأعمال في الرياض، المملكة العربية السعودية، تشغيل زوارة.",
    stepsTitle: "حذف حسابك",
    stepsIntro: "يمكنك بدء الطلب بإحدى الطريقتين التاليتين:",
    steps: [
      "افتح الملف الشخصي في تطبيق زوارة، واختر حذف الحساب، ثم اتبع خطوات التأكيد.",
      "إذا تعذر عليك الدخول إلى التطبيق، فاختر طلب حذف الحساب في هذه الصفحة وأرسل الرسالة من البريد الإلكتروني أو رقم الجوال المرتبط بحسابك.",
      "أدرج اسمك الكامل ورقم الجوال أو البريد الإلكتروني المسجل. لا ترسل كلمة المرور أو المستندات الطبية.",
      "قد نتواصل معك للتحقق من ملكيتك للحساب قبل إكمال الطلب.",
    ],
    deletedTitle: "البيانات التي سيتم حذفها",
    deletedIntro: "بعد التحقق، يُغلق الحساب نهائيًا وتُحذف البيانات المرتبطة به أو تُجعل مجهولة الهوية، ومنها:",
    deleted: [
      "ملفك الشخصي ومعلومات الاتصال الخاصة بالحساب.",
      "المعلومات الشخصية والصحية المحفوظة في حساب زوارة.",
      "المستندات والمراسلات والتفضيلات ونشاط التطبيق المرتبط بالحساب، ما لم يكن الاحتفاظ بها مطلوبًا نظامًا.",
    ],
    retainedTitle: "البيانات التي قد نحتفظ بها",
    retainedIntro: "قد نحتفظ ببعض المعلومات عند الحاجة للوفاء بالالتزامات النظامية أو التنظيمية أو الصحية أو المحاسبية أو الأمنية أو لمنع الاحتيال أو تسوية النزاعات.",
    retained: [
      "السجلات المطلوب الاحتفاظ بها بموجب الأنظمة الصحية أو غيرها من الأنظمة المعمول بها.",
      "سجلات المعاملات والدفع والمحاسبة التي يجب الاحتفاظ بها نظامًا.",
      "سجلات الأمان والتحقق من الطلب اللازمة لإثبات الامتثال.",
    ],
    timingTitle: "معالجة الطلب وتأكيده",
    timing: "سنعالج الطلبات التي تم التحقق منها وفقًا للأنظمة المعمول بها، وسنؤكد لك عند اكتمال الطلب. تُحمى أي معلومات يجب الاحتفاظ بها نظامًا، ولا تُستخدم إلا للغرض المطلوب، وتُحذف عند انتهاء مدة الاحتفاظ المطبقة.",
    note: "حذف الحساب نهائي ولا يمكن التراجع عنه.",
    cardTitle: "هل يتعذر عليك الدخول إلى التطبيق؟",
    cardText: "راسل فريق الخصوصية لطلب حذف حسابك نهائيًا. استخدم بيانات الاتصال المسجلة في حساب زوارة حتى نتمكن من التحقق من طلبك.",
    cardAction: "طلب حذف الحساب",
    emailLabel: "مراسلة contact@zuwara.net",
    emailSubject: "طلب حذف حساب زوارة",
  },
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const isArabic = locale === "ar";
  return {
    title: isArabic ? "حذف الحساب" : "Account deletion",
    description: isArabic ? "كيفية طلب حذف حساب زوارة والبيانات المرتبطة به." : "How to request permanent deletion of your Zuwara account and associated data.",
    alternates: {
      canonical: isArabic ? "/ar/account-deletion" : "/account-deletion",
      languages: { "en-SA": "/account-deletion", "ar-SA": "/ar/account-deletion" },
    },
  };
}

export default async function AccountDeletionPage({ params }: Props) {
  const { locale } = await params;
  return <DeletionGuide content={locale === "ar" ? content.ar : content.en} locale={locale} />;
}
