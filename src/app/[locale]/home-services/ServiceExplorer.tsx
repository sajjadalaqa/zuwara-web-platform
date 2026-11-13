"use client";
import { useState } from "react";
import AddToCart from "@/components/cart/AddToCart";
import { Link } from "@/i18n/navigation";
import type { CatalogService } from "@/lib/api/d4h/catalog";
import { Search, SearchX, ArrowRight, ChevronDown, LayoutGrid } from "lucide-react";
import styles from "@/components/discovery/Discovery.module.css";

export default function ServiceExplorer({ services, locale }: { services: CatalogService[]; locale: string }) {
  const [query, setQuery] = useState("");
  const ar = locale === "ar";
  const t = (en: string, arabic: string) => ar ? arabic : en;
  const filtered = services.filter(s => (s.name + " " + (s.name_ar ?? "")).toLowerCase().includes(query.trim().toLowerCase()));
  return <section className={styles.results}>
    <div className={styles.toolbar}><div className={styles.sectionHeading}><span className={styles.panelIcon}><LayoutGrid size={19} /></span><div><h2 className={styles.sectionTitle}>{t("Available services", "الخدمات المتاحة")}</h2><p className={styles.sectionNote}>{t("Find the right care for you", "ابحث عن الرعاية المناسبة لك")}</p></div></div>
      <span className={styles.count} aria-live="polite">{filtered.length} / {services.length}</span>
    </div>
    <label className={styles.search}><Search size={18} aria-hidden="true" /><input type="search" value={query} onChange={e => setQuery(e.target.value)} placeholder={t("Search services in this category...", "ابحث عن خدمة")} aria-label={t("Search services", "ابحث عن خدمة")} /></label>
    <div className={styles.serviceList}>{filtered.map((s,index) => {
      const description = ar ? s.description_ar || s.description : s.description;
      return <article key={s.id} className={styles.serviceCard} data-tone={index % 4}>

        <div className={styles.serviceBody}><h3>{ar ? s.name_ar || s.name : s.name}</h3>
          {description && <p className={styles.description}>{description}</p>}

          <div className={styles.servicePurchase}>
            {s.price && <div className={styles.pricePanel}><span>{t("Service price", "سعر الخدمة")}</span><strong>{new Intl.NumberFormat(locale,{maximumFractionDigits:2}).format(Number(s.price.final))}<small>{s.price.currency}</small></strong></div>}
            <AddToCart service={s} />
            <Link className={styles.cardAction} href={"/provider?service_id=" + s.id}>{t("View providers", "عرض مقدمي الخدمة")}<ArrowRight size={16} aria-hidden="true" /></Link>
          </div>
          {description && <details className={styles.serviceDetails}><summary>{t("Service details", "تفاصيل الخدمة")}<ChevronDown size={14} /></summary><p>{description}</p></details>}

        </div>
      </article>;
    })}</div>
    {!filtered.length && <div className={styles.empty}><SearchX size={30} aria-hidden="true" /><h3>{t("No services found", "لا توجد خدمات")}</h3>{query && <button type="button" className={styles.primary} onClick={()=>setQuery("")}>{t("Clear search", "مسح البحث")}</button>}</div>}
  </section>;
}
