import { useUiText } from "@/i18n/use-ui-text";
import type { ReactNode } from "react";
import { MapPin, Plus, Navigation, House, Info, Pencil, Archive, MapPinned } from "lucide-react";
import type { Address } from "@/lib/api/patient-dashboard";
import Form from "../_patient/Form";
import s from "./addresses.module.css";

export function AddressesLayout({ar,children}:{ar:boolean;children:ReactNode}){
  const uiText = useUiText();
 return <div className={s.page}><header className={s.hero}><div><span className={s.eyebrow}>{ar?"الرعاية، حيث تحتاجها":"CARE, RIGHT WHERE YOU NEED IT"}</span><h1>{ar?"العناوين المحفوظة":uiText("Saved addresses")}</h1><p>{ar?"احتفظ بعناوين زياراتك المنزلية في مكان واحد.":"Keep your home-visit locations together in one place."}</p><a href="#add-address" className={s.primary}><Plus size={16}/>{ar?"إضافة عنوان":"Add an address"}</a></div><div className={s.art} aria-hidden="true"><MapPinned size={56} strokeWidth={1.3}/><span/></div></header>{children}</div>;
}
function AddressFields({ar,address}:{ar:boolean;address?:Address}){
  const uiText = useUiText();
 return <div className={s.fields}>
  <label className={s.full}>{ar?"العنوان":uiText("Address")}<input name="address" maxLength={1000} required defaultValue={address?.address} placeholder={ar?"الشارع، المبنى، الحي، المدينة":"Street, building, district, city"}/></label>
  <label>{ar?"خط العرض":"Latitude"}<input name="lat" type="number" step="any" required defaultValue={address?.lat??address?.latitude} placeholder="24.7136"/><span className={s.hint}>{ar?"من ‎-٩٠ إلى ٩٠":"Between −90 and 90"}</span></label>
  <label>{ar?"خط الطول":"Longitude"}<input name="long" type="number" step="any" required defaultValue={address?.long??address?.longitude} placeholder="46.6753"/><span className={s.hint}>{ar?"من ‎-١٨٠ إلى ١٨٠":"Between −180 and 180"}</span></label>
 </div>;
}
export default function AddressesUI({rows,ar}:{rows:Address[];ar:boolean}){
 const t=(en:string,arabic:string)=>ar?arabic:en;
 return <>
 <div className={s.toolbar}><span><MapPin size={16}/>{t("Your home-visit locations","عناوين زياراتك المنزلية")}</span><span className={s.count}>{rows.length} {t("saved addresses","عنوان محفوظ")}</span></div>
 <div className={s.workspace}>
  <section id="add-address" className={s.addCard}><div className={s.sectionHead}><span className={s.icon}><Plus size={23}/></span><div><h2>{t("Add a new address","إضافة عنوان جديد")}</h2><p>{t("Save the details of your care location.","احفظ تفاصيل موقع الرعاية.")}</p></div></div>
   <Form op="address-create" source="d4h" label={t("Save new address","حفظ العنوان الجديد")} uncertain><AddressFields ar={ar}/></Form>
   <div className={s.note}><Navigation size={17}/><p>{t("Enter the exact coordinates for your address so your saved location is accurate.","أدخل إحداثيات عنوانك بدقة ليكون الموقع المحفوظ صحيحاً.")}</p></div>
  </section>
  <section className={s.library}><div className={s.libraryHead}><div><span className={s.eyebrow}>{t("YOUR PLACES","أماكنك")}</span><h2>{t("Saved locations","المواقع المحفوظة")}</h2></div><span className={s.icon}><House size={21}/></span></div>
   {rows.length?<div className={s.list}>{rows.map(a=><article key={a.id} className={s.addressCard}>
    <div className={s.addressHeading}><span className={s.pin}><MapPin size={22}/></span><div><span className={s.reference}>{t("ADDRESS","عنوان")} #{a.id}</span><h3>{a.address}</h3></div></div>
    <div className={s.coordinates}><div><span>{t("Latitude","خط العرض")}</span><strong dir="ltr">{a.latitude??a.lat??"—"}</strong></div><div><span>{t("Longitude","خط الطول")}</span><strong dir="ltr">{a.longitude??a.long??"—"}</strong></div></div>
    <details className={s.edit}><summary><Pencil size={14}/>{t("Edit address","تعديل العنوان")}</summary><Form op="address-edit" source="d4h" id={a.id} label={t("Save changes","حفظ التغييرات")}><AddressFields ar={ar} address={a}/></Form></details>
    <div className={s.archive}><Archive size={14}/><Form op="address-delete" source="d4h" id={a.id} label={t("Archive address","أرشفة العنوان")}/></div>
   </article>)}</div>:<div className={s.empty}><span><MapPinned size={35}/></span><h3>{t("Make yourself at home","مكان لرعايتك")}</h3><p>{t("No saved addresses yet. Add your first location and keep it ready for your next home visit.","لا توجد عناوين محفوظة بعد. أضف موقعك الأول ليكون جاهزاً لزيارتك المنزلية القادمة.")}</p><a href="#add-address"><Plus size={15}/>{t("Add your first address","أضف عنوانك الأول")}</a></div>}
   <aside className={s.info}><Info size={18}/><div><h3>{t("Good to know","من الجيد أن تعرف")}</h3><p>{t("Address changes do not change existing bookings. Coverage and prices are checked during booking preview.","تغييرات العنوان لا تغيّر الحجوزات الحالية. يتم التحقق من التغطية والأسعار أثناء معاينة الحجز.")}</p></div></aside>
  </section>
 </div></>;
}