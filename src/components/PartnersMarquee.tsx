import Image from "next/image";
import { Icon } from "@/components/Icon";
import styles from "./PartnersMarquee.module.css";

type Partner = {
  name: string;
  icon?: "heart" | "home" | "shield" | "calendar" | "location" | "check" | "search" | "arrow";
  logo?: string; // optional: use a real logo later, e.g. "/partners/aramco.png"
};

const partners: Partner[] = [
  { name: "Healthcare", icon: "heart" },
  { name: "Home services", icon: "home" },
  { name: "Secure payments", icon: "shield" },
  { name: "Appointments", icon: "calendar" },
  { name: "Nearby providers", icon: "location" },
  { name: "Verified", icon: "check" },
  { name: "Find care", icon: "search" },
  { name: "Trusted care", icon: "heart" },
];

function PartnerItem({ name, icon, logo }: Partner) {
  return (
    <li className={styles.item} title={name}>
      {logo ? (
        <Image
          src={logo}
          alt={name}
          width={112}
          height={112}
          style={{ width: "auto", height: "auto" }}
          className={styles.logo}
        />
      ) : icon ? (
        <span className={styles.icon} role="img" aria-label={name}>
          <Icon name={icon} size={30} />
        </span>
      ) : (
        <span className={styles.text}>{name}</span>
      )}
    </li>
  );
}

export function PartnersMarquee() {
  return (
    <section className={styles.section} aria-labelledby="partners-heading">
      <div className="container">
        <p id="partners-heading" className={styles.title}>Our partners</p>
      </div>

      <div className={styles.row}>
        <div className={styles.track}>
          <ul className={styles.group}>
            {partners.map((p) => <PartnerItem key={p.name} {...p} />)}
          </ul>
          {/* duplicate group makes the loop seamless */}
          <ul className={styles.group} aria-hidden="true">
            {partners.map((p) => <PartnerItem key={p.name} {...p} />)}
          </ul>
        </div>
      </div>
    </section>
  );
}