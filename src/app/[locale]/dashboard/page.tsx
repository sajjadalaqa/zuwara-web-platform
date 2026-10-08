import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight, CalendarCheck, CalendarPlus, ChevronRight, FileText, Handshake,
  Heart, HeartPulse, MessageSquare, Stethoscope, Wallet, Zap,
} from "lucide-react";
import { mockStats, mockUser } from "./user";
import s from "./overview.module.css";
import { getProfile } from "./profile/service";
import { getSavedCount } from "./saved/service";
import { getWalletSummary } from "./wallet/service";
import { getRequestCounts } from "./requests/service";

const copy = {
  en: {
    welcome: "Welcome back,",
    sub: "Manage your appointments, requests and care all in one place.",
    book: "Book an Appointment",
    tagline: ["Better Care,", "Brighter Tomorrow"],
    stats: {
      appointments: "Upcoming appointments",
      saved: "Saved providers",
      wallet: "Wallet balance",
      requests: "Service requests",
    },
    qaTitle: "Quick Actions",
    qaSub: "Get started with your care journey",
    qa: {
      book: ["Book an Appointment", "Find the right provider for you"],
      requests: ["Service Requests", "Request a service or follow up"],
      find: ["Find a Provider", "Explore our trusted network"],
      messages: ["View Messages", "Check your conversations"],
    },
    promoEyebrow: "Your health matters",
    promoTitle: "Quality Care When You Need It",
    promoSub: "Book appointments, get support, and access your health records — all in one place.",
    learn: "Learn More",
    currency: "SAR",
  },
  ar: {
    welcome: "مرحباً بعودتك،",
    sub: "أدر مواعيدك وطلباتك ورعايتك الصحية في مكان واحد.",
    book: "احجز موعداً",
    tagline: ["رعاية أفضل،", "غدٌ أكثر إشراقاً"],
    stats: {
      appointments: "المواعيد القادمة",
      saved: "المزودون المحفوظون",
      wallet: "رصيد المحفظة",
      requests: "طلبات الخدمات",
    },
    qaTitle: "إجراءات سريعة",
    qaSub: "ابدأ رحلتك الصحية",
    qa: {
      book: ["احجز موعداً", "اعثر على المزود المناسب لك"],
      requests: ["طلبات الخدمات", "اطلب خدمة أو تابع طلباً"],
      find: ["ابحث عن مزود", "استكشف شبكتنا الموثوقة"],
      messages: ["عرض الرسائل", "تابع محادثاتك"],
    },
    promoEyebrow: "صحتك تهمنا",
    promoTitle: "رعاية عالية الجودة وقت حاجتك",
    promoSub: "احجز المواعيد، واحصل على الدعم، وتصفّح سجلاتك الصحية — كل ذلك في مكان واحد.",
    learn: "اعرف المزيد",
    currency: "ر.س",
  },
};

export default async function DashboardHome({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const isAr = locale === "ar";
  const t = isAr ? copy.ar : copy.en;
  const p = isAr ? "/ar" : "";
  const nf = new Intl.NumberFormat(isAr ? "ar-SA" : "en-US");

  // TODO (backend): replace with real data
  const profile = await getProfile();
const user = { ...mockUser, name: profile.fullName.split(" ")[0] };
  const [savedProviders, wallet, requestCounts] = await Promise.all([
  getSavedCount(),
  getWalletSummary(),
  getRequestCounts(),
]);
const stats = {
  ...mockStats,
  savedProviders,
  walletBalance: wallet.balance,
  serviceRequests: requestCounts.all,
};

  const statCards = [
    { href: "/dashboard/appointments", icon: CalendarCheck, value: nf.format(stats.upcomingAppointments), label: t.stats.appointments, tone: s.tPurple },
    { href: "/dashboard/saved", icon: Heart, value: nf.format(stats.savedProviders), label: t.stats.saved, tone: s.tMint },
    { href: "/dashboard/wallet", icon: Wallet, value: `${t.currency} ${nf.format(stats.walletBalance)}`, label: t.stats.wallet, tone: s.tRose },
    { href: "/dashboard/requests", icon: FileText, value: nf.format(stats.serviceRequests), label: t.stats.requests, tone: s.tIndigo },
  ];

  const actions = [
    { href: "/provider", icon: CalendarPlus, text: t.qa.book, tone: s.tPurple },
    { href: "/dashboard/requests", icon: FileText, text: t.qa.requests, tone: s.tMint },
    { href: "/provider", icon: Stethoscope, text: t.qa.find, tone: s.tRose },
    { href: "/dashboard/messages", icon: MessageSquare, text: t.qa.messages, tone: s.tIndigo },
  ];

  return (
    <div className={s.page}>
      {/* Hero */}
      <section className={s.hero}>
        <span className={s.blob1} />
        <span className={s.blob2} />
        <div className={s.heroPhoto}>
  <Image
    src="/images/dashboard-hero.png"
    alt=""
    fill
    sizes="(min-width: 1100px) 600px, 100vw"
    className={s.heroPhotoImg}
    priority
  />
</div>

        <div className={s.heroText}>
          <p className={s.eyebrow}>{t.welcome}</p>
          <h2 className={s.name}>
  <span>{user.name}</span>
  <Handshake aria-hidden="true" className={s.nameIcon} />
</h2>
          <p className={s.sub}>{t.sub}</p>
          <Link href={`${p}/provider`} className={s.heroBtn}>
            <CalendarPlus size={19} />
            {t.book}
            <ArrowRight size={18} className={s.rtlFlip} />
          </Link>
        </div>

        <div className={s.tagline}>
          <HeartPulse size={44} strokeWidth={1.5} />
          <span>{t.tagline[0]}<br />{t.tagline[1]}</span>
        </div>
      </section>

      {/* Stats */}
      <section className={s.stats}>
        {statCards.map((c) => {
          const Icon = c.icon;
          return (
            <Link key={c.label} href={`${p}${c.href}`} className={`${s.stat} ${c.tone}`}>
              <span className={s.statIcon}><Icon size={22} /></span>
              <span className={s.statBody}>
                <b>{c.value}</b>
                <small>{c.label}</small>
              </span>
              <ChevronRight size={18} className={`${s.statArrow} ${s.rtlFlip}`} />
            </Link>
          );
        })}
      </section>

      {/* Quick actions + promo */}
      <section className={s.panel}>
        <div>
          <div className={s.panelHead}>
            <span className={s.panelIcon}><Zap size={22} /></span>
            <div>
              <h2>{t.qaTitle}</h2>
              <p>{t.qaSub}</p>
            </div>
          </div>

          <div className={s.actions}>
            {actions.map((a) => {
              const Icon = a.icon;
              return (
                <Link key={a.text[0]} href={`${p}${a.href}`} className={`${s.action} ${a.tone}`}>
                  <span className={s.actionIcon}><Icon size={21} /></span>
                  <span className={s.actionText}>
                    <b>{a.text[0]}</b>
                    <small>{a.text[1]}</small>
                  </span>
                  <ChevronRight size={18} className={`${s.actionChev} ${s.rtlFlip}`} />
                </Link>
              );
            })}
          </div>
        </div>

        <aside className={s.promo}>
          <div className={s.promoPhoto}>
  <Image
    src="/images/dashboard-overview.png"
    alt=""
    fill
    sizes="(min-width: 1100px) 500px, 100vw"
    className={s.promoPhotoImg}
  />
</div>
          <div className={s.promoText}>
            <p className={s.promoEyebrow}>{t.promoEyebrow}</p>
            <h3 className={s.promoTitle}>{t.promoTitle}</h3>
            <p className={s.promoSub}>{t.promoSub}</p>
            <Link href={`${p}/categories`} className={s.promoBtn}>
              {t.learn}
              <ArrowRight size={17} className={s.rtlFlip} />
            </Link>
          </div>
        </aside>
      </section>
    </div>
  );
}