import type { Metadata } from "next";
import styles from "./privacy.module.css";

type Props = { params: Promise<{ locale: string }> };

type Section = {
  id: string;
  title: string;
  body: string[];
  list?: string[];
  contact?: boolean;
};

type Content = {
  metaTitle: string;
  metaDescription: string;
  title: string;
  intro: string;
  updatedLabel: string;
  updated: string;
  tocLabel: string;
  notice: string;
  sections: Section[];
};

// Placeholder address: replace with the real privacy contact before launch.
const CONTACT_EMAIL = "privacy@example.com";

const en: Content = {
  metaTitle: "Privacy Policy | Zuwara",
  metaDescription: "How Zuwara collects, uses and protects your personal information.",
  title: "Privacy Policy",
  intro:
    "At Zuwara we respect your privacy. This page explains what information we collect, how we use and protect it, and the choices you have.",
  updatedLabel: "Last updated",
  updated: "October 1, 2026",
  tocLabel: "On this page",
  notice:
    "Placeholder content: this text is a dummy draft and must be reviewed and approved by a qualified legal adviser before the site goes live.",
  sections: [
    {
      id: "information-we-collect",
      title: "Information we collect",
      body: [
        "We collect information you give us directly, and information that is collected automatically when you use Zuwara.",
      ],
      list: [
        "Contact details such as your name, phone number and email address.",
        "Appointment and service request details.",
        "Messages you send through our contact form.",
        "Device and usage data such as browser type, pages visited and approximate location.",
      ],
    },
    {
      id: "how-we-use-information",
      title: "How we use your information",
      body: ["We use your information to:"],
      list: [
        "Arrange and manage your appointments and service requests.",
        "Respond to your questions and provide support.",
        "Improve our website, apps and services.",
        "Send service notices, and updates where you have agreed to receive them.",
        "Meet our legal and regulatory obligations.",
      ],
    },
    {
      id: "sharing",
      title: "Sharing your information",
      body: [
        "We share only what is needed with healthcare providers and home-service partners to fulfil your request, and with trusted vendors who help us run the platform. We do not sell your personal information.",
      ],
    },
    {
      id: "health-information",
      title: "Health information",
      body: [
        "Details you share about a medical need are treated as sensitive. We use them only to fulfil your request and limit access to authorised staff and the providers you choose.",
      ],
    },
    {
      id: "cookies",
      title: "Cookies",
      body: [
        "We use cookies and similar technologies to run the site, remember your preferences (such as language) and understand how the site is used. You can control cookies through your browser settings.",
      ],
    },
    {
      id: "retention",
      title: "How long we keep your data",
      body: [
        "We keep your information only for as long as needed for the purposes described in this policy or as required by law, then delete it or make it anonymous.",
      ],
    },
    {
      id: "security",
      title: "Security",
      body: [
        "We apply reasonable technical and organisational measures to protect your information from unauthorised access, disclosure or alteration. No method of electronic transmission or storage is completely secure.",
      ],
    },
    {
      id: "your-rights",
      title: "Your rights",
      body: ["Under applicable law you may have the right to:"],
      list: [
        "Access the personal data we hold about you.",
        "Ask us to correct inaccurate data.",
        "Ask us to delete your data.",
        "Withdraw your consent at any time.",
        "Object to or restrict how we process your data.",
      ],
    },
    {
      id: "children",
      title: "Children",
      body: [
        "Our services are not directed at children, and we do not knowingly collect information from children without the consent of a parent or guardian.",
      ],
    },
    {
      id: "changes",
      title: "Changes to this policy",
      body: [
        "We may update this policy from time to time. The latest version will always be on this page with its last updated date.",
      ],
    },
    {
      id: "contact",
      title: "Contact us",
      body: ["For any privacy question or request, contact us at:"],
      contact: true,
    },
  ],
};

const ar: Content = {
  metaTitle: "سياسة الخصوصية | زوارة",
  metaDescription: "كيف تجمع زوارة معلوماتك الشخصية وتستخدمها وتحميها.",
  title: "سياسة الخصوصية",
  intro:
    "نحن في زوارة نحترم خصوصيتك. توضح هذه الصفحة المعلومات التي نجمعها، وكيف نستخدمها ونحميها، وما لديك من خيارات بشأنها.",
  updatedLabel: "آخر تحديث",
  updated: "١ أكتوبر ٢٠٢٦",
  tocLabel: "محتويات الصفحة",
  notice:
    "محتوى تجريبي: هذا النص مسودة افتراضية، ويجب مراجعته واعتماده من مستشار قانوني مختص قبل إطلاق الموقع.",
  sections: [
    {
      id: "information-we-collect",
      title: "المعلومات التي نجمعها",
      body: [
        "نجمع المعلومات التي تقدمها لنا مباشرة، إضافة إلى معلومات تُجمع تلقائيًا عند استخدامك لزوارة.",
      ],
      list: [
        "بيانات التواصل مثل الاسم ورقم الجوال والبريد الإلكتروني.",
        "تفاصيل المواعيد وطلبات الخدمة.",
        "الرسائل التي ترسلها عبر نموذج التواصل.",
        "بيانات الجهاز والاستخدام مثل نوع المتصفح والصفحات التي زرتها والموقع التقريبي.",
      ],
    },
    {
      id: "how-we-use-information",
      title: "كيف نستخدم معلوماتك",
      body: ["نستخدم معلوماتك من أجل:"],
      list: [
        "ترتيب مواعيدك وطلبات الخدمة وإدارتها.",
        "الرد على استفساراتك وتقديم الدعم.",
        "تحسين موقعنا وتطبيقاتنا وخدماتنا.",
        "إرسال إشعارات الخدمة، وإرسال التحديثات عند موافقتك على ذلك.",
        "الوفاء بالتزاماتنا النظامية.",
      ],
    },
    {
      id: "sharing",
      title: "مشاركة معلوماتك",
      body: [
        "نشارك فقط ما يلزم مع مقدمي الرعاية الصحية وشركاء الخدمات المنزلية لتنفيذ طلبك، ومع مزودين موثوقين يساعدوننا في تشغيل المنصة. نحن لا نبيع معلوماتك الشخصية.",
      ],
    },
    {
      id: "health-information",
      title: "المعلومات الصحية",
      body: [
        "تُعامل التفاصيل التي تشاركها بشأن حاجتك الطبية على أنها معلومات حساسة. نستخدمها فقط لتنفيذ طلبك، ونقصر الوصول إليها على الموظفين المخولين ومقدمي الخدمة الذين تختارهم.",
      ],
    },
    {
      id: "cookies",
      title: "ملفات تعريف الارتباط",
      body: [
        "نستخدم ملفات تعريف الارتباط وتقنيات مشابهة لتشغيل الموقع وتذكّر تفضيلاتك (مثل اللغة) وفهم كيفية استخدام الموقع. يمكنك التحكم بها من إعدادات متصفحك.",
      ],
    },
    {
      id: "retention",
      title: "مدة الاحتفاظ ببياناتك",
      body: [
        "نحتفظ بمعلوماتك للمدة اللازمة لتحقيق الأغراض الموضحة في هذه السياسة أو وفق ما تتطلبه الأنظمة، ثم نحذفها أو نجعلها مجهولة الهوية.",
      ],
    },
    {
      id: "security",
      title: "أمن المعلومات",
      body: [
        "نطبق إجراءات تقنية وتنظيمية معقولة لحماية معلوماتك من الوصول أو الإفصاح أو التعديل غير المصرح به. ومع ذلك، لا توجد وسيلة نقل أو تخزين إلكتروني آمنة بالكامل.",
      ],
    },
    {
      id: "your-rights",
      title: "حقوقك",
      body: ["وفقًا للأنظمة المعمول بها، قد يحق لك:"],
      list: [
        "الاطلاع على بياناتك الشخصية التي نحتفظ بها.",
        "طلب تصحيح البيانات غير الدقيقة.",
        "طلب حذف بياناتك.",
        "سحب موافقتك في أي وقت.",
        "الاعتراض على معالجة بياناتك أو تقييدها.",
      ],
    },
    {
      id: "children",
      title: "الأطفال",
      body: [
        "خدماتنا غير موجهة للأطفال، ولا نجمع عن قصد معلومات الأطفال دون موافقة ولي الأمر.",
      ],
    },
    {
      id: "changes",
      title: "التغييرات على هذه السياسة",
      body: [
        "قد نحدّث هذه السياسة من وقت لآخر. ستكون أحدث نسخة منها متاحة دائمًا في هذه الصفحة مع تاريخ آخر تحديث.",
      ],
    },
    {
      id: "contact",
      title: "تواصل معنا",
      body: ["لأي سؤال أو طلب يتعلق بالخصوصية، تواصل معنا عبر:"],
      contact: true,
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
  return { title: c.metaTitle, description: c.metaDescription };
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
          <p className={styles.notice} role="note">{c.notice}</p>

          {c.sections.map((section) => (
            <section key={section.id} id={section.id} className={styles.section}>
              <h2>{section.title}</h2>
              {section.body.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
              {section.list && (
                <ul className={styles.list}>
                  {section.list.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              )}
              {section.contact && (
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