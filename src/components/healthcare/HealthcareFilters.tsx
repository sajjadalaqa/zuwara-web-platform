import Link from "next/link";
import type { ZuwaraCategory } from "@/lib/api/zuwara/types";

export type HealthcareFilterValues = {
  query?: string;
  category?: string;
  duration?: string;
  date?: string;
  consultationType?: string;
  gender?: string;
  availableToday?: string;
  sort?: string;
};

export function HealthcareFilters({ categories, values }: { categories: ZuwaraCategory[]; values: HealthcareFilterValues }) {
  return <form action="/healthcare/doctors" method="get" className="healthcare-filters">
    <div className="filter-title"><div><span>Refine your search</span><strong>Consultant filters</strong></div><Link href="/healthcare/doctors">Reset</Link></div>
    <label className="filter-full"><span>Name, specialty or classification</span><input type="search" name="query" defaultValue={values.query} placeholder="Search in English or Arabic" autoComplete="off"/></label>
    <label><span>Specialty</span><select name="category" defaultValue={values.category ?? ""}><option value="">All specialties</option>{categories.map(item=><option key={item.id} value={item.id}>{item.title}</option>)}</select></label>
    <label><span>Duration</span><select name="duration" defaultValue={values.duration ?? ""}><option value="">All durations</option>{[15,30,45,60].map(value=><option value={value} key={value}>{value} minutes</option>)}</select></label>
    <label><span>Preferred date</span><input type="date" name="date" defaultValue={values.date}/></label>
    <label><span>Consultation type</span><select name="consultation_type" defaultValue={values.consultationType ?? ""}><option value="">All types</option><option value="chat">Chat</option><option value="audio">Audio</option><option value="video">Video</option></select></label>
    <label><span>Consultant gender</span><select name="gender" defaultValue={values.gender ?? ""}><option value="">Any gender</option><option value="1">Male</option><option value="0">Female</option></select></label>
    <label><span>Sort</span><select name="sort" defaultValue={values.sort ?? ""}><option value="">Most experienced with patients</option><option value="3">Highest rated</option><option value="1">Price: low to high</option><option value="2">Price: high to low</option></select></label>
    <label className="filter-check"><input type="checkbox" name="available_today" value="1" defaultChecked={values.availableToday === "1"}/><span>Only show consultants with an available slot</span></label>
    <button type="submit" className="button button-primary filter-submit">Apply filters</button>
  </form>;
}
