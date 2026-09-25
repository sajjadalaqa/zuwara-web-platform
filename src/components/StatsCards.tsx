import styles from "./StatsCards.module.css";

// Display copy supplied in the homepage design reference.
const stats = [
  { value: "4,578+", title: "Home Patients Treated", description: "Across Riyadh, Jeddah & Central Region", tone: "purple", icon: <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M22 21v-2a4 4 0 0 0-3-3.87" /><circle cx="9" cy="7" r="4" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></> },
  { value: "48+", title: "Board-Certified Specialists", description: "SCFHS licensed & verified medical staff", tone: "pink", icon: <><path d="M6 3H4v5a5 5 0 0 0 10 0V3h-2M6 2v3M12 2v3M9 13v2a6 6 0 0 0 12 0v-2" /><circle cx="21" cy="10" r="2" /></> },
  { value: "99.4%", title: "Patient Satisfaction", description: "Rated 4.9/5 on App Store & Google Play", tone: "green", icon: <><circle cx="12" cy="12" r="10" /><path d="M8 14s1.5 3 4 3 4-3 4-3M8 8h.01M16 8h.01" /></> },
  { value: "25 min", title: "Average Dispatch Time", description: "Rapid nurse & emergency response in Riyadh", tone: "amber", icon: <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8Z" /> },
];

export function StatsCards() {
  return (
    <section className={styles.section} id="start" aria-label="Zuwara in numbers">
      <div className={`container ${styles.grid}`}>
        {stats.map((stat) => (
          <article className={`${styles.card} ${styles[stat.tone]}`} key={stat.title}>
            <div className={styles.top}>
              <span className={styles.icon}><svg width="27" height="27" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{stat.icon}</svg></span>
              <span className={styles.badge}>Verified</span>
            </div>
            <p className={styles.value}>{stat.value}</p>
            <h2>{stat.title}</h2>
            <p className={styles.description}>{stat.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
