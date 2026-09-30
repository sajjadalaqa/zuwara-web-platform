import Image from "next/image";
import Link from "next/link";
import styles from "./AboutSection.module.css";

const features = [
  { title: "Patient-First Home Care Model", description: "We bring certified doctors, sterile instruments, and medical lab tech straight to you." },
  { title: "Integrated with Saudi Health Platforms", description: "Seamless compatibility with Sehati, Wasfaty e-prescriptions, and NPHIES insurance." },
  { title: "Compassionate & Licensed Medical Staff", description: "Every team member is licensed by the Saudi Commission for Health Specialties (SCFHS)." },
] as const;

function CheckCircle({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <path d="m8.5 12.5 2.5 2.5 4.5-5" />
    </svg>
  );
}

export function AboutSection() {
  return (
    <section className={styles.section} id="about" aria-labelledby="about-heading">
      <div className={`container ${styles.grid}`}>
        <div className={styles.collage}>
          <div className={styles.colLeft}>
            <div className={`${styles.photo} ${styles.photoOne}`}>
              <Image src="/images/surgeons.jpg" alt="Surgeons gathered around an operating light" fill sizes="(max-width: 900px) 45vw, 240px" />
            </div>
            <div className={`${styles.photo} ${styles.photoThree}`}>
              <Image src="/images/injection.jpg" alt="A clinician administering an injection" fill sizes="(max-width: 900px) 45vw, 240px" />
            </div>
          </div>

          <div className={styles.colRight}>
            <div className={`${styles.photo} ${styles.photoTwo}`}>
              <Image src="/images/clinic.jpg" alt="A bright, modern clinic room" fill sizes="(max-width: 900px) 45vw, 240px" />
            </div>
            <div className={styles.vision}>
              <span className={styles.visionPill}>Vision 2030</span>
              <p className={styles.years}>10+ Years</p>
              <p className={styles.visionText}>Pioneering healthcare delivery &amp; telehealth tech across the Kingdom.</p>
              <div className={styles.accredited}>
                <span className={styles.accreditedIcon}><CheckCircle size={20} /></span>
                <div>
                  <strong>Saudi MOH Accredited</strong>
                  <small>License No: 14000389</small>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.copy}>
          <span className={styles.pill}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M12 2 4 5v6c0 5 3.4 9.2 8 11 4.6-1.8 8-6 8-11V5l-8-3Z" />
              <path d="m9 12 2 2 4-4" />
            </svg>
            About Zuwara
          </span>
          <h2 id="about-heading">
            Professionals and <span>Personalized Doctors Excellence</span>
          </h2>
          <p className={styles.lead}>
            Founded with a bold vision to make elite medical expertise and advanced health technology accessible, human, and effortless for families and enterprises of all sizes. Zuwara combines the warmth of personal home care with cutting-edge digital health tools.
          </p>

          <ul className={styles.features}>
            {features.map((feature) => (
              <li key={feature.title}>
                <span className={styles.featureIcon}><CheckCircle size={18} /></span>
                <div>
                  <strong>{feature.title}</strong>
                  <p>{feature.description}</p>
                </div>
              </li>
            ))}
          </ul>

          <Link href="/healthcare/doctors" className={styles.cta}>Book an Appointment</Link>
        </div>
      </div>
    </section>
  );
}