import { useUiText } from "@/i18n/use-ui-text";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { Icon } from "@/components/Icon";
import s from "./care-experience.module.css";
export function CareHero({
  directory = false,
  title,
}: {
  directory?: boolean;
  title?: string;
}) {
  const uiText = useUiText();
  return (
    <section className={s.hero}>
      <div className={s.heroInner}>
        <div className={s.heroCopy}>
          <span className={s.pill}>
            <Icon name="heart" size={14} /> {uiText("YOUR HEALTH, YOUR WAY")}{" "}</span>
          <h1>
            {title ??
              (directory ? (
                <>
                  {uiText("The right consultant.")}{" "}<br />
                  <em>{uiText("A better beginning.")}</em>
                </>
              ) : (
                <>
                  {uiText("Care that fits your life.")}<br/><em>{uiText("Every step of the way.")}</em>
                </>
              ))}
          </h1>
          <p>
            {directory
              ? "A little guidance can make all the difference. Explore our consultants, find your specialty and choose the care that feels right for you."
              : "From your first question to your next step forward, find care that fits your life. Connect with Zuwara consultants across a range of specialties."}
          </p>
          <div className={s.heroActions}>
            <Link
              href={directory ? "#consultant-directory" : "/healthcare/doctors"}
              className={s.primary}
            >
              {directory ? "Explore consultants" : "Find my consultant"}
              <Icon name="arrow" size={18} />
            </Link>
            <Link href="/healthcare/specialties" className={s.secondary}>
              {uiText("Explore specialties")}{" "}</Link>
          </div>
          <div className={s.heroNotes}>
            <span>
              <Icon name="video" size={16} /> {uiText("Consultation options")}{" "}</span>
            <span>
              <Icon name="calendar" size={16} /> {uiText("Choose your time")}{" "}</span>
          </div>
        </div>
        <div className={s.visual}>
          <div className={s.orbit} />
          <span className={s.spark}>
            <Icon name="spark" size={28} />
          </span>
          <div className={s.portrait}>
            <Image
              src="/images/therapy-consultant-transparent.png"
              alt=""
              fill
              sizes="(max-width: 760px) 85vw, 480px"
              priority
              className={s.heroImage}
            />
          </div>
          <div className={s.visualLabel}>
            <span>
              <Icon name="heart" size={21} />
            </span>
            <div>
              <strong>{uiText("Care with a human touch")}</strong>
              <small>{uiText("Here for your next step")}</small>
            </div>
          </div>
          <div className={s.visualTag}>
            <Icon name="video" size={20} />
            <span>{uiText("Care that connects")}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
