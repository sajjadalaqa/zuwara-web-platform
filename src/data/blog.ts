// src/data/blog.ts
// Example blog content. Later you can replace these helpers with API calls
// and keep the same shapes, so the UI does not change.

export type Bi = { en: string; ar: string };

export type Block =
  | { type: "p" | "h2" | "quote" | "tip"; text: Bi }
  | { type: "ul"; items: Bi[] };

export type BlogCategory = { id: string; name: Bi; icon: string };

export type BlogPostData = {
  slug: string;
  category: string;
  date: string; // ISO
  readMinutes: number;
  author: Bi;
  cover?: string; // optional image URL or /public path; a designed gradient cover is used when empty
  title: Bi;
  excerpt: Bi;
  content: Block[];
};

export const pick = (b: Bi, locale: string) => (locale === "ar" ? b.ar : b.en);

export const categories: BlogCategory[] = [
  { id: "home-care", name: { en: "Home Care", ar: "الرعاية المنزلية" }, icon: "M3 11l9-8 9 8M5 10v10h14V10M10 20v-6h4v6" },
  { id: "telehealth", name: { en: "Telehealth", ar: "الطب عن بُعد" }, icon: "M3 7h12v10H3zM15 11l6-3v8l-6-3" },
  { id: "wellness", name: { en: "Wellness", ar: "العافية" }, icon: "M5 19c0-8 5-14 14-14 0 9-6 14-14 14zM5 19l8-8" },
  { id: "nursing", name: { en: "Nursing", ar: "التمريض" }, icon: "M12 20s-7-4.4-7-10a4 4 0 017-2.6A4 4 0 0119 10c0 5.6-7 10-7 10z" },
  { id: "prevention", name: { en: "Prevention", ar: "الوقاية" }, icon: "M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z" },
];

export const posts: BlogPostData[] = [
  {
    slug: "why-families-choose-healthcare-at-home",
    category: "home-care",
    date: "2026-09-18",
    readMinutes: 5,
    author: { en: "Zuwara Care Team", ar: "فريق زوارة للرعاية" },
    title: {
      en: "Why More Families Are Choosing Healthcare at Home",
      ar: "لماذا تختار المزيد من العائلات الرعاية الصحية في المنزل",
    },
    excerpt: {
      en: "From nursing visits to lab tests, care at home is helping families save time and keep their loved ones comfortable.",
      ar: "من زيارات التمريض إلى الفحوصات المخبرية، تساعد الرعاية المنزلية العائلات على توفير الوقت وإبقاء أحبّائهم في راحة.",
    },
    content: [
      {
        type: "p",
        text: {
          en: "A trip to the clinic can take half a day once you count the travel, the parking and the waiting room. For families caring for a parent, a newborn or someone recovering from illness, that time adds up quickly. This is why healthcare at home is becoming a natural choice for many households.",
          ar: "قد تستغرق زيارة العيادة نصف يوم إذا حسبنا الطريق والانتظار وموقف السيارة. وبالنسبة للعائلات التي تعتني بأحد الوالدين أو بمولود جديد أو بشخص يتعافى من مرض، يتراكم هذا الوقت بسرعة. ولهذا أصبحت الرعاية الصحية في المنزل خيارًا طبيعيًا لكثير من الأسر.",
        },
      },
      { type: "h2", text: { en: "Comfort where it matters most", ar: "الراحة حيث تحتاجها أكثر" } },
      {
        type: "p",
        text: {
          en: "Familiar surroundings help many people feel calmer during a visit. There is no need to move someone who is tired or in pain, and family members can stay close and take part in the conversation with the nurse or doctor.",
          ar: "تساعد البيئة المألوفة كثيرًا من الناس على الشعور بهدوء أكبر أثناء الزيارة. ولا حاجة لنقل شخص متعب أو يشعر بالألم، ويمكن لأفراد العائلة البقاء بجانبه والمشاركة في الحديث مع الممرض أو الطبيب.",
        },
      },
      { type: "h2", text: { en: "Less travel, less waiting", ar: "سفر أقل وانتظار أقل" } },
      {
        type: "ul",
        items: [
          { en: "No travel, traffic or parking to plan around", ar: "لا حاجة للتنقل أو الازدحام أو البحث عن موقف" },
          { en: "Appointments that fit around your day", ar: "مواعيد تناسب جدولك اليومي" },
          { en: "Family can stay involved in every step", ar: "تبقى العائلة حاضرة في كل خطوة" },
          { en: "One verified professional focused on you", ar: "مختص موثّق يركّز عليك وحدك" },
        ],
      },
      {
        type: "quote",
        text: {
          en: "The best care is the care that fits into your life, not the other way around.",
          ar: "أفضل رعاية هي التي تتأقلم مع حياتك، لا التي تطلب منك أن تتأقلم معها.",
        },
      },
      { type: "h2", text: { en: "What can be done at home?", ar: "ما الذي يمكن تقديمه في المنزل؟" } },
      {
        type: "p",
        text: {
          en: "Many everyday services can be delivered safely at home by licensed professionals:",
          ar: "يمكن تقديم كثير من الخدمات اليومية في المنزل بأمان عن طريق مختصين مرخّصين:",
        },
      },
      {
        type: "ul",
        items: [
          { en: "Nursing visits and ongoing care", ar: "زيارات التمريض والرعاية المستمرة" },
          { en: "Vaccinations for adults and children", ar: "التطعيمات للكبار والصغار" },
          { en: "Laboratory sample collection", ar: "سحب العينات المخبرية" },
          { en: "IV vitamins", ar: "الفيتامينات الوريدية" },
          { en: "Caregiver support for daily needs", ar: "دعم مقدّمي الرعاية للاحتياجات اليومية" },
        ],
      },
      {
        type: "tip",
        text: {
          en: "Not sure which service you need? Browse our categories or book an appointment and our team will guide you. For emergencies, always call your local emergency number.",
          ar: "لست متأكدًا من الخدمة المناسبة؟ تصفّح فئاتنا أو احجز موعدًا وسيرشدك فريقنا. وفي حالات الطوارئ، اتصل دائمًا برقم الطوارئ المحلي.",
        },
      },
    ],
  },
  {
    slug: "your-first-virtual-consultation-guide",
    category: "telehealth",
    date: "2026-09-25",
    readMinutes: 4,
    author: { en: "Zuwara Care Team", ar: "فريق زوارة للرعاية" },
    title: {
      en: "Your First Virtual Consultation: A Simple Guide",
      ar: "استشارتك الافتراضية الأولى: دليل بسيط",
    },
    excerpt: {
      en: "A few small steps before the call can help you get clear answers and make the most of your time with the doctor.",
      ar: "خطوات بسيطة قبل المكالمة تساعدك على الحصول على إجابات واضحة والاستفادة القصوى من وقتك مع الطبيب.",
    },
    content: [
      {
        type: "p",
        text: {
          en: "A virtual consultation lets you speak with a doctor by video from wherever you are. It works well for follow-ups, questions about symptoms and general advice. If it is your first time, a little preparation makes the call smoother.",
          ar: "تتيح لك الاستشارة الافتراضية التحدث مع الطبيب عبر الفيديو من أي مكان. وهي مناسبة للمتابعة والأسئلة حول الأعراض والنصائح العامة. وإن كانت تجربتك الأولى، فقليل من التحضير يجعل المكالمة أسهل.",
        },
      },
      { type: "h2", text: { en: "Before the call", ar: "قبل المكالمة" } },
      {
        type: "ul",
        items: [
          { en: "Find a quiet, well-lit spot with a steady internet connection", ar: "اختر مكانًا هادئًا ومضاءً جيدًا مع اتصال إنترنت مستقر" },
          { en: "Write down your symptoms and when they started", ar: "دوّن أعراضك ومتى بدأت" },
          { en: "List the medicines you take, including vitamins", ar: "اكتب الأدوية التي تتناولها، بما فيها الفيتامينات" },
          { en: "Keep any recent reports or prescriptions nearby", ar: "احتفظ بالتقارير أو الوصفات الحديثة بالقرب منك" },
          { en: "Prepare your questions so nothing is forgotten", ar: "جهّز أسئلتك حتى لا تنسى شيئًا" },
        ],
      },
      { type: "h2", text: { en: "During the call", ar: "أثناء المكالمة" } },
      {
        type: "p",
        text: {
          en: "Start with the main reason for your visit, then describe what you have noticed in your own words. Do not worry about medical terms. If something is unclear, ask the doctor to explain it again, and repeat the plan back so you are sure you understood.",
          ar: "ابدأ بالسبب الرئيسي لزيارتك، ثم صف ما لاحظته بكلماتك. لا تقلق من المصطلحات الطبية. وإن كان شيء غير واضح فاطلب من الطبيب إعادة شرحه، وكرّر الخطة بصوتك للتأكد من فهمك لها.",
        },
      },
      {
        type: "quote",
        text: {
          en: "There are no silly questions. Clear answers are the whole point of the call.",
          ar: "لا توجد أسئلة سخيفة. الإجابات الواضحة هي الغاية من المكالمة.",
        },
      },
      { type: "h2", text: { en: "After the call", ar: "بعد المكالمة" } },
      {
        type: "p",
        text: {
          en: "Check your prescriptions and any follow-up steps in your account, and book a follow-up if the doctor recommended one. If a visit in person or a home service such as a lab test is needed, you can arrange it from the same place.",
          ar: "راجع وصفاتك وأي خطوات متابعة في حسابك، واحجز موعد متابعة إن أوصى الطبيب بذلك. وإذا لزمت زيارة حضورية أو خدمة منزلية مثل فحص مخبري، يمكنك ترتيبها من المكان نفسه.",
        },
      },
      {
        type: "tip",
        text: {
          en: "Virtual consultations are not for emergencies. If you feel severe pain, trouble breathing or any sudden change, call your local emergency number straight away.",
          ar: "الاستشارات الافتراضية ليست للحالات الطارئة. إذا شعرت بألم شديد أو صعوبة في التنفس أو أي تغيّر مفاجئ، فاتصل برقم الطوارئ المحلي فورًا.",
        },
      },
    ],
  },
];

export const getPost = (slug: string) => posts.find((p) => p.slug === slug);
export const getCategory = (id: string) => categories.find((c) => c.id === id);
export const getRelated = (slug: string, category: string, limit = 2) => {
  const same = posts.filter((p) => p.slug !== slug && p.category === category);
  const rest = posts.filter((p) => p.slug !== slug && p.category !== category);
  return [...same, ...rest].slice(0, limit);
};

export function formatDate(iso: string, locale: string) {
  return new Intl.DateTimeFormat(locale === "ar" ? "ar-SA-u-nu-latn" : "en-US", {
    dateStyle: "long",
    timeZone: "UTC",
  }).format(new Date(iso));
}