"use client";
import { useState } from "react";
import { ArrowRight, Search, SearchX, Stethoscope } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { SpecialtyImage } from "@/components/healthcare/SpecialtyImage";
import styles from "./Discovery.module.css";
type Specialty = { id: number; title: string; imageUrl?: string | null; href: string };
export default function SpecialtyExplorer({ items, labels }: { items: Specialty[]; labels: { title: string; hint: string; search: string; explore: string; empty: string; clear: string } }) {
  const [query, setQuery] = useState("");
  const results = items.filter(item => item.title.toLowerCase().includes(query.trim().toLowerCase()));
  return <section>
    <div className={styles.toolbar}><div><h2 className={styles.sectionTitle}>{labels.title}</h2><p className={styles.sectionNote}>{labels.hint}</p></div>
      <label className={styles.search}><Search size={18} aria-hidden="true" /><input type="search" value={query} onChange={e => setQuery(e.target.value)} placeholder={labels.search} aria-label={labels.search} /><span className={styles.count} aria-live="polite">{results.length}</span></label>
    </div>
    <div className={styles.grid}>{results.map(item => <Link key={item.id} href={item.href} className={styles.specialtyCard}>
      <span className={styles.cardIcon}>{item.imageUrl ? <SpecialtyImage src={item.imageUrl} /> : <Stethoscope size={26} strokeWidth={1.7} aria-hidden="true" />}</span>
      <div className={styles.specialtyBody}><h3>{item.title}</h3><span className={styles.specialtyAction}>{labels.explore}</span></div>
      <span className={styles.specialtyArrow}><ArrowRight size={18} aria-hidden="true" /></span>
    </Link>)}</div>
    {!results.length && <div className={styles.empty}><SearchX size={30} aria-hidden="true" /><h3>{labels.empty}</h3>{query && <button className={styles.primary} type="button" onClick={()=>setQuery("")}>{labels.clear}</button>}</div>}
  </section>;
}
