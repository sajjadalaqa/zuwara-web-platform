import { notFound } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { getD4hCategories, getD4hServices, getD4hSubcategories } from "@/lib/api/d4h/catalog";
import type { D4hCategory } from "@/lib/api/d4h/types";
import { ArrowRight, Grid2X2, Layers3, Stethoscope, ListFilter } from "lucide-react";
import { SafeImage } from "@/components/SafeImage";
import ServiceExplorer from "./ServiceExplorer";
import styles from "@/components/discovery/Discovery.module.css";

export default async function CategoryServices({ category, locale, subcategoryId }: { category: D4hCategory; locale: string; subcategoryId?: string }) {
  const ar = locale === "ar";
  const t = (en: string, arabic: string) => ar ? arabic : en;
  const [subcategories, catalog] = await Promise.all([getD4hSubcategories(category.id, locale), getD4hCategories(locale)]);
  if (subcategoryId && !subcategories.some(s => String(s.id) === subcategoryId)) notFound();
  const services = await getD4hServices(category.id, locale, subcategoryId ? Number(subcategoryId) : undefined);
  return <div className={styles.page}><div className="container">
    <Link href="/home-services" className={styles.back}><ArrowRight size={15} aria-hidden="true" />{t("All categories", "جميع الفئات")}</Link>
    <header className={styles.hero}><div className={styles.heroLayout}>
      <span className={styles.heroIcon}>{category.imageUrl ? <SafeImage src={category.imageUrl} alt="" width={44} height={44} fallbackIcon="home" /> : <Stethoscope size={32} aria-hidden="true" />}</span>
      <div className={styles.heroCopy}><span className={styles.eyebrow}>{t("Home services", "الخدمات المنزلية")}</span><h1 className={styles.title}>{category.name}</h1><p className={styles.intro}>{t("Choose a service, review the details, and find your provider.", "اختر خدمة وراجع التفاصيل وابحث عن مقدم الخدمة")}</p></div>
      <div className={styles.headerMetric}><strong>{category.serviceCount}</strong><span>{t("Services", "الخدمات")}</span></div>
    </div></header>
    <div className={styles.workspace}>
      <aside className={styles.sidebar}>
        <div className={styles.panel}><div className={styles.panelHead}><span className={styles.panelIcon}><Grid2X2 size={19} /></span><h2>{t("Browse categories", "تصفح الفئات")}</h2></div>
          <nav className={styles.categoryNav} aria-label={t("Categories", "الفئات")}>{catalog.categories.map(c => <Link key={c.id} href={c.href} aria-current={c.id === category.id ? "page" : undefined}><span>{c.name}</span><span className={styles.navCount}>{c.screenType ? <ArrowRight size={13} /> : c.serviceCount}</span></Link>)}</nav>
        </div>
        <section className={styles.panel}><div className={styles.panelHead}><span className={styles.panelIcon}><ListFilter size={18} /></span><h2>{t("Subcategories", "الفئات الفرعية")}</h2></div>
          {subcategories.length ? <div className={styles.chips}><Link href={category.href} className={styles.chip} aria-current={!subcategoryId ? "page" : undefined}>{t("All", "الكل")}</Link>{subcategories.map(s => <Link key={s.id} href={category.href + "&subcategory_id=" + s.id} className={styles.chip} aria-current={String(s.id) === subcategoryId ? "page" : undefined}>{ar ? s.name_ar || s.name : s.name}</Link>)}</div> : <p className={styles.subEmpty}><Layers3 size={17} />{t("All services are listed directly in this category.", "جميع الخدمات مدرجة في هذه الفئة")}</p>}
        </section>
      </aside>
      <ServiceExplorer services={services} locale={locale} />
    </div>
  </div></div>;
}
