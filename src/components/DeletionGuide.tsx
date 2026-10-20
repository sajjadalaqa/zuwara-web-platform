import styles from "./DeletionGuide.module.css";

export type DeletionGuideContent = {
  eyebrow: string;
  title: string;
  intro: string;
  stepsTitle: string;
  stepsIntro: string;
  steps: string[];
  deletedTitle: string;
  deletedIntro: string;
  deleted: string[];
  retainedTitle: string;
  retainedIntro: string;
  retained: string[];
  timingTitle: string;
  timing: string;
  note: string;
  cardTitle: string;
  cardText: string;
  cardAction: string;
  emailLabel: string;
  emailSubject: string;
};

const CONTACT_EMAIL = "contact@zuwara.net";

export function DeletionGuide({ content, locale }: { content: DeletionGuideContent; locale: string }) {
  const mailto = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(content.emailSubject)}`;

  return (
    <div className={styles.page} dir={locale === "ar" ? "rtl" : "ltr"} lang={locale === "ar" ? "ar" : "en"}>
      <header className={styles.hero}>
        <div className="container">
          <p className={styles.eyebrow}>{content.eyebrow}</p>
          <h1 className={styles.title}>{content.title}</h1>
          <p className={styles.intro}>{content.intro}</p>
        </div>
      </header>

      <div className={`container ${styles.content}`}>
        <article className={styles.article}>
          <section className={styles.section}>
            <h2>{content.stepsTitle}</h2>
            <p>{content.stepsIntro}</p>
            <ol className={styles.steps}>
              {content.steps.map((step) => <li key={step}>{step}</li>)}
            </ol>
          </section>

          <section className={styles.section}>
            <h2>{content.deletedTitle}</h2>
            <p>{content.deletedIntro}</p>
            <ul className={styles.list}>
              {content.deleted.map((item) => <li key={item}>{item}</li>)}
            </ul>
          </section>

          <section className={styles.section}>
            <h2>{content.retainedTitle}</h2>
            <p>{content.retainedIntro}</p>
            <ul className={styles.list}>
              {content.retained.map((item) => <li key={item}>{item}</li>)}
            </ul>
          </section>

          <section className={styles.section}>
            <h2>{content.timingTitle}</h2>
            <p>{content.timing}</p>
            <p className={styles.note}><strong>{content.note}</strong></p>
          </section>
        </article>

        <aside className={styles.card} aria-label={content.cardTitle}>
          <h2>{content.cardTitle}</h2>
          <p>{content.cardText}</p>
          <a className={styles.button} href={mailto}>{content.cardAction}</a>
          <a className={styles.email} dir="ltr" href={mailto} aria-label={content.emailLabel}>
            {CONTACT_EMAIL}
          </a>
        </aside>
      </div>
    </div>
  );
}
