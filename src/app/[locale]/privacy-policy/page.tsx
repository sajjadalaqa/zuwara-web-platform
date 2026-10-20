import type { Metadata } from "next";
import styles from "./privacy.module.css";

type Props = { params: Promise<{ locale: string }> };

type ListItem = string | { label: string; text: string };

type Section = {
  id: string;
  title: string;
  body: string[];
  list?: ListItem[];
  after?: string[];
  email?: boolean;
  address?: boolean;
};

type Content = {
  metaTitle: string;
  metaDescription: string;
  title: string;
  intro: string;
  updatedLabel: string;
  updated: string;
  tocLabel: string;
  company: string;
  city: string;
  sections: Section[];
};

const CONTACT_EMAIL = "contact@zuwara.net";

const en: Content = {
  metaTitle: "Privacy Policy | Zuwara",
  metaDescription:
    "How Zuwara, operated by ALAQA Business Services Company, collects, uses, discloses and safeguards your information.",
  title: "Privacy Policy",
  intro:
    "Welcome to Zuwara, a service operated by ALAQA Business Services Company, based in Riyadh, Saudi Arabia. Your privacy is important to us. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our Zuwara mobile application (for both doctors and patients).",
  updatedLabel: "Last updated",
  updated: "October 18, 2026",
  tocLabel: "On this page",
  company: "ALAQA Business Services Company",
  city: "Riyadh, Saudi Arabia",
  sections: [
    {
      id: "information-we-collect",
      title: "Information We Collect",
      body: ["We collect the following types of information:"],
      list: [
        { label: "Personal Information", text: "Name, email address, phone number, date of birth, and gender." },
        {
          label: "Health Information",
          text: "Medical history, appointment details, prescriptions, and other health-related data (for patients); professional details and qualifications (for doctors).",
        },
        {
          label: "Usage Data",
          text: "Device information, IP address, app usage statistics, error logs, and user interaction data.",
        },
      ],
    },
    {
      id: "how-we-use-information",
      title: "How We Use Your Information",
      body: ["Your information is used to:"],
      list: [
        "Provide and manage healthcare consultation and appointment services.",
        "Facilitate communication between doctors and patients via messaging, video calls, and document sharing.",
        "Enhance app functionality, security, and user experience.",
        "Comply with regulatory and legal obligations.",
      ],
    },
    {
      id: "sharing",
      title: "Information Sharing and Disclosure",
      body: ["We do not sell your personal data. However, we may share information with:"],
      list: [
        "Authorized medical professionals for the purpose of delivering healthcare services.",
        "Third-party service providers involved in the operation, security, and maintenance of the Zuwara app.",
        "Legal authorities if required by applicable law or to respond to lawful requests and legal processes.",
      ],
    },
    {
      id: "security",
      title: "Data Security",
      body: [
        "We implement appropriate technical and organizational measures to safeguard your data. While we strive to protect your information, no digital system is completely secure. Users are responsible for maintaining the confidentiality of their account credentials.",
      ],
    },
    {
      id: "your-rights",
      title: "Your Rights",
      body: [
        "You have the right to access, correct, or delete your personal data. You may also withdraw consent where applicable. For such requests, contact us at:",
      ],
      email: true,
    },
    {
      id: "account-deletion",
      title: "Account Deletion",
      body: [
        "Zuwara provides users with the option to permanently delete their account and associated data. This can be done directly from within the app by going to the Profile section and tapping the Delete Account button. Once deleted, your personal and health-related data will no longer be accessible, except where retention is required by law.",
      ],
    },
    {
      id: "updates",
      title: "Updates to This Policy",
      body: [
        "This policy may be updated periodically. We will notify users of significant changes via the app or email. Continued use of the Zuwara platform indicates acceptance of the updated policy.",
      ],
    },
    {
      id: "contact",
      title: "Contact Us",
      body: ["If you have any questions or concerns regarding this Privacy Policy, please contact us:"],
      address: true,
      email: true,
    },
  ],
};

const ar: Content = {
  metaTitle: "سياسة الخصوصية | زوارة",
  metaDescription:
    "كيف تجمع زوارة، التي تشغّلها شركة علاقة لخدمات الأعمال، معلوماتك وتستخدمها وتفصح عنها وتحميها.",
  title: "سياسة الخصوصية",
  intro:
    "مرحبًا بك في زوارة، وهي خدمة تشغّلها شركة علاقة لخدمات الأعمال ومقرها الرياض، المملكة العربية السعودية. خصوصيتك مهمة لنا. توضح سياسة الخصوصية هذه كيف نجمع معلوماتك ونستخدمها ونفصح عنها ونحميها عند استخدامك لتطبيق زوارة للجوال (للأطباء والمرضى على حد سواء).",
  updatedLabel: "آخر تحديث",
  updated: "١٨ أكتوبر ٢٠٢٦",
  tocLabel: "محتويات الصفحة",
  company: "شركة علاقة لخدمات الأعمال",
  city: "الرياض، المملكة العربية السعودية",
  sections: [
    {
      id: "information-we-collect",
      title: "المعلومات التي نجمعها",
      body: ["نجمع الأنواع التالية من المعلومات:"],
      list: [
        { label: "المعلومات الشخصية", text: "الاسم والبريد الإلكتروني ورقم الجوال وتاريخ الميلاد والجنس." },
        {
          label: "المعلومات الصحية",
          text: "التاريخ الطبي وتفاصيل المواعيد والوصفات الطبية وغيرها من البيانات المتعلقة بالصحة (للمرضى)؛ والبيانات المهنية والمؤهلات (للأطباء).",
        },
        {
          label: "بيانات الاستخدام",
          text: "معلومات الجهاز وعنوان IP وإحصاءات استخدام التطبيق وسجلات الأخطاء وبيانات تفاعل المستخدم.",
        },
      ],
    },
    {
      id: "how-we-use-information",
      title: "كيف نستخدم معلوماتك",
      body: ["تُستخدم معلوماتك من أجل:"],
      list: [
        "تقديم خدمات الاستشارات الصحية والمواعيد وإدارتها.",
        "تسهيل التواصل بين الأطباء والمرضى عبر الرسائل ومكالمات الفيديو ومشاركة المستندات.",
        "تحسين وظائف التطبيق وأمانه وتجربة المستخدم.",
        "الالتزام بالمتطلبات التنظيمية والنظامية.",
      ],
    },
    {
      id: "sharing",
      title: "مشاركة المعلومات والإفصاح عنها",
      body: ["نحن لا نبيع بياناتك الشخصية. ومع ذلك، قد نشارك المعلومات مع:"],
      list: [
        "الممارسين الصحيين المعتمدين لغرض تقديم خدمات الرعاية الصحية.",
        "مزودي الخدمات من الأطراف الثالثة المشاركين في تشغيل تطبيق زوارة وتأمينه وصيانته.",
        "الجهات النظامية إذا تطلّب ذلك النظام المعمول به، أو للاستجابة للطلبات والإجراءات النظامية.",
      ],
    },
    {
      id: "security",
      title: "أمن البيانات",
      body: [
        "نطبّق إجراءات تقنية وتنظيمية مناسبة لحماية بياناتك. ورغم سعينا لحماية معلوماتك، لا يوجد نظام رقمي آمن بالكامل. ويتحمّل المستخدمون مسؤولية الحفاظ على سرية بيانات الدخول إلى حساباتهم.",
      ],
    },
    {
      id: "your-rights",
      title: "حقوقك",
      body: [
        "يحق لك الاطلاع على بياناتك الشخصية أو تصحيحها أو حذفها. ويمكنك أيضًا سحب موافقتك متى كان ذلك ممكنًا. لتقديم هذه الطلبات، تواصل معنا عبر:",
      ],
      email: true,
    },
    {
      id: "account-deletion",
      title: "حذف الحساب",
      body: [
        "توفر زوارة للمستخدمين خيار حذف حساباتهم والبيانات المرتبطة بها نهائيًا. ويمكن ذلك مباشرة من داخل التطبيق بالانتقال إلى قسم الملف الشخصي والضغط على زر حذف الحساب. وبعد الحذف، لن تعود بياناتك الشخصية والصحية متاحة، إلا في الحالات التي يتطلب فيها النظام الاحتفاظ بها.",
      ],
    },
    {
      id: "updates",
      title: "تحديثات هذه السياسة",
      body: [
        "قد يتم تحديث هذه السياسة بشكل دوري. وسنُبلغ المستخدمين بالتغييرات الجوهرية عبر التطبيق أو البريد الإلكتروني. ويُعد استمرارك في استخدام منصة زوارة قبولًا للسياسة المحدّثة.",
      ],
    },
    {
      id: "contact",
      title: "تواصل معنا",
      body: ["إذا كانت لديك أي أسئلة أو استفسارات بشأن سياسة الخصوصية هذه، يُرجى التواصل معنا:"],
      address: true,
      email: true,
    },
  ],
};

const content: Record<"en" | "ar", Content> = { en, ar };

function getContent(locale: string): Content {
  return locale === "ar" ? content.ar : content.en;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const c = getContent(locale);
  return {
    title: c.metaTitle,
    description: c.metaDescription,
    alternates: {
      canonical: locale === "ar" ? "/ar/privacy-policy" : "/privacy-policy",
      languages: { "en-SA": "/privacy-policy", "ar-SA": "/ar/privacy-policy" },
    },
  };
}

export default async function PrivacyPage({ params }: Props) {
  const { locale } = await params;
  const c = getContent(locale);
  const isArabic = locale === "ar";

  return (
    <div className={styles.page} dir={isArabic ? "rtl" : "ltr"} lang={isArabic ? "ar" : "en"}>
      <header className={styles.hero}>
        <div className="container">
          <h1 className={styles.title}>{c.title}</h1>
          <p className={styles.intro}>{c.intro}</p>
          <p className={styles.updated}>
            <span>{c.updatedLabel}:</span> <strong>{c.updated}</strong>
          </p>
        </div>
      </header>

      <div className={`container ${styles.layout}`}>
        <nav className={styles.toc} aria-label={c.tocLabel}>
          <p className={styles.tocTitle}>{c.tocLabel}</p>
          <ol className={styles.tocList}>
            {c.sections.map((section) => (
              <li key={section.id}>
                <a href={`#${section.id}`}>{section.title}</a>
              </li>
            ))}
          </ol>
        </nav>

        <article className={styles.content}>
          {c.sections.map((section) => (
            <section key={section.id} id={section.id} className={styles.section}>
              <h2>{section.title}</h2>
              {section.body.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
              {section.list && (
                <ul className={styles.list}>
                  {section.list.map((item) =>
                    typeof item === "string" ? (
                      <li key={item}>{item}</li>
                    ) : (
                      <li key={item.label}>
                        <strong>{item.label}:</strong> {item.text}
                      </li>
                    ),
                  )}
                </ul>
              )}
              {section.address && (
                <address className={styles.address}>
                  <strong>{c.company}</strong>
                  <span>{c.city}</span>
                </address>
              )}
              {section.email && (
                <a className={styles.mail} dir="ltr" href={`mailto:${CONTACT_EMAIL}`}>
                  {CONTACT_EMAIL}
                </a>
              )}
            </section>
          ))}
        </article>
      </div>
    </div>
  );
}
