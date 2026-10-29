import { getUiText } from "@/i18n/server-ui-text";
import { BadgeCheck, CalendarDays, ShieldCheck, UserRound, Camera, MapPin, ArrowUpRight, Info } from "lucide-react";
import Link from "next/link";
import AvatarUploader from "./AvatarUploader";
import ProfileEditor from "./ProfileEditor";
import Form from "../_patient/Form";
import { copy } from "./copy";
import { getProfile } from "./service";
import s from "./profile.module.css";

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const uiText = await getUiText();
  const { locale } = await params;
  const isAr = locale === "ar";
  const t = isAr ? copy.ar : copy.en;

  const profile = await getProfile();
  const prefix = isAr ? "/ar" : "";
  const readOnlyNotice =
    uiText("Your phone is read-only. Profile changes are saved to your patient account.");

  const since = profile.memberSince
    ? new Intl.DateTimeFormat(isAr ? "ar-SA-u-ca-gregory" : "en-GB", {
        month: "long",
        year: "numeric",
        timeZone: "Asia/Riyadh",
      }).format(new Date(profile.memberSince))
    : "—";

  return (
    <div className={s.page}>
      <header className={s.head}>
        <span className={s.headingIcon}><UserRound size={25}/></span><div><span className={s.eyebrow}>{isAr ? "حسابك، بكل عناية" : "YOUR ACCOUNT, THOUGHTFULLY ORGANIZED"}</span><h1>{t.title}</h1>
        <p>{t.subtitle}</p></div>
      </header>

      <section className={s.hero}>
        <AvatarUploader
          name={profile.fullName}
          avatarUrl={profile.avatarUrl}
          uploadInputId="profile-photo-input"
          t={t}
          readOnly
        />
        <div className={s.heroText}>
          <h3>{profile.fullName}</h3>
          <p className={s.email}>{profile.email}</p>
          <div className={s.chips}>
            <span className={s.pill}>
              <BadgeCheck size={13} />
              {profile.emailVerified === undefined
                ? "—"
                : profile.emailVerified
                  ? t.verified
                  : t.unverified}
            </span>
            <span className={s.pill}>
              <CalendarDays size={13} />
              {t.memberSince} {since}
            </span>
          </div>
          <p className={s.heroHint}><Info size={13}/>{isAr ? "رقم هاتفك للقراءة فقط. تُحفظ التغييرات في حساب المريض الخاص بك." : readOnlyNotice}</p>

        </div>
      </section>

      <div className={s.layout}>
        <section className={s.card}>
          <div className={s.cardHead}>
            <span className={s.cardIcon}>
              <UserRound size={19} />
            </span>
            <div>
              <h2>{t.personal.title}</h2>
              <p>{t.personal.sub}</p>
            </div>
          </div>
          <ProfileEditor />
          <p>
            <Link className={s.addressLink} href={prefix + "/dashboard/addresses"}><MapPin size={15}/>
              {isAr
                ? "\u0627\u0644\u0639\u0646\u0627\u0648\u064a\u0646 \u0627\u0644\u0645\u062d\u0641\u0648\u0638\u0629"
                : "View saved addresses"}<ArrowUpRight size={15}/>
            </Link>
          </p>
        </section>

        <div className={s.side}><section className={s.card}><div className={s.cardHead}><span className={s.cardIcon}><Camera size={20}/></span><div><h2>{isAr ? "الصورة الشخصية" : uiText("Profile photo")}</h2><p>{isAr ? "أضف لمسة شخصية إلى حسابك." : "Add a personal touch to your account."}</p></div></div><div className={s.photoForm}>          <Form op="avatar" label={isAr ? "رفع الصورة الشخصية" : uiText("Upload profile photo")} uncertain>
            <label>
              <span>{isAr ? "JPEG أو PNG أو WebP، حتى ٢ ميجابايت" : uiText("JPEG, PNG or WebP, up to 2 MB")}</span>
              <input
                type="file"
                name="image"
                id="profile-photo-input"
                accept="image/jpeg,image/png,image/webp"
                required
              />
            </label>
          </Form></div></section>
          <section className={s.card}>
            <div className={s.cardHead}>
              <span className={s.cardIcon}>
                <ShieldCheck size={19} />
              </span>
              <div>
                <h2>
                  {isAr
                    ? "\u0623\u0645\u0627\u0646 \u0627\u0644\u062d\u0633\u0627\u0628"
                    : "Account security"}
                </h2>
                <p>
                  {isAr
                    ? "\u062a\u0633\u062c\u064a\u0644 \u0627\u0644\u062f\u062e\u0648\u0644 \u0628\u0631\u0645\u0632 \u062a\u062d\u0642\u0642 \u064a\u0631\u0633\u0644 \u0625\u0644\u0649 \u0627\u0644\u0647\u0627\u062a\u0641."
                    : "Sign-in uses a one-time code sent to your phone."}
                </p>
              </div>
            </div>
            <p>
              {isAr
                ? "\u0644\u0627 \u062a\u0634\u0627\u0631\u0643 \u0631\u0645\u0632 \u0627\u0644\u062a\u062d\u0642\u0642 \u0645\u0639 \u0623\u064a \u0634\u062e\u0635."
                : "Keep your one-time verification code private."}
            </p>
          </section>

          <section className={`${s.card} ${s.dangerCard}`}>
            <h2>{t.danger.title}</h2>
            <Link href={prefix + "/account-deletion"}>
              {isAr
                ? "\u0645\u0639\u0644\u0648\u0645\u0627\u062a \u062d\u0630\u0641 \u0627\u0644\u062d\u0633\u0627\u0628"
                : "Account-deletion information"}
            </Link>
          </section>
        </div>
      </div>
    </div>
  );
}
