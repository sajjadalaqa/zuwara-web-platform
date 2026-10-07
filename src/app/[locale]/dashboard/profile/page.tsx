import { BadgeCheck, CalendarDays, ShieldCheck, UserRound } from "lucide-react";
import AvatarUploader from "./AvatarUploader";
import DeleteAccount from "./DeleteAccount";
import PasswordForm from "./PasswordForm";
import ProfileForm from "./ProfileForm";
import { copy } from "./copy";
import { getProfile } from "./service";
import s from "./profile.module.css";

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const isAr = locale === "ar";
  const t = isAr ? copy.ar : copy.en;

  const profile = await getProfile();

  const since = new Intl.DateTimeFormat(isAr ? "ar-SA-u-ca-gregory" : "en-GB", {
    month: "long",
    year: "numeric",
    timeZone: "Asia/Riyadh",
  }).format(new Date(profile.memberSince));

  return (
    <div className={s.page}>
      <header className={s.head}>
        <h2>{t.title}</h2>
        <p>{t.subtitle}</p>
      </header>

      <section className={s.hero}>
        <AvatarUploader name={profile.fullName} avatarUrl={profile.avatarUrl} t={t} />
        <div className={s.heroText}>
          <h3>{profile.fullName}</h3>
          <p className={s.email}>{profile.email}</p>
          <div className={s.chips}>
            <span className={s.pill}>
              <BadgeCheck size={13} />
              {profile.emailVerified ? t.verified : t.unverified}
            </span>
            <span className={s.pill}>
              <CalendarDays size={13} />
              {t.memberSince} {since}
            </span>
          </div>
          <p className={s.heroHint}>{t.avatar.hint}</p>
        </div>
      </section>

      <div className={s.layout}>
        <section className={s.card}>
          <div className={s.cardHead}>
            <span className={s.cardIcon}><UserRound size={19} /></span>
            <div>
              <h2>{t.personal.title}</h2>
              <p>{t.personal.sub}</p>
            </div>
          </div>
          <ProfileForm profile={profile} t={t} />
        </section>

        <div className={s.side}>
          <section className={s.card}>
            <div className={s.cardHead}>
              <span className={s.cardIcon}><ShieldCheck size={19} /></span>
              <div>
                <h2>{t.security.title}</h2>
                <p>{t.security.sub}</p>
              </div>
            </div>
            <PasswordForm t={t} />
          </section>

          <section className={`${s.card} ${s.dangerCard}`}>
            <DeleteAccount t={t} locale={locale} />
          </section>
        </div>
      </div>
    </div>
  );
}