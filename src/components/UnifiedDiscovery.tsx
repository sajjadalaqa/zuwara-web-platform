"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { Icon } from "./Icon";
import Link from "next/link";

type Journey = "healthcare" | "home-services";

const copy = {
  en: {
    tabsAria: "Choose a service journey",
    healthcare: "Healthcare",
    homeServices: "Home services",
    hcLabel: "Doctor, specialty or care need",
    hsLabel: "Service, category or provider",
    hcPlaceholder: "Try “Mental Health”",
    hsPlaceholder: "Try “Laboratory”",
    location: "Location",
    locationPlaceholder: "Choose your area",
    hcSubmit: "Find healthcare",
    hsSubmit: "Explore services",
    popular: "Popular:",
    hcChips: [
      { value: "Mental Health", label: "Mental Health" },
      { value: "Dermatology", label: "Dermatology" },
      { value: "Pediatrics", label: "Pediatrics" },
    ],
    hsChips: [
      { value: "Laboratory", label: "Laboratory" },
      { value: "Nursing", label: "Nursing" },
      { value: "Physiotherapy", label: "Physiotherapy" },
    ],
  },
  ar: {
    tabsAria: "اختر نوع الخدمة",
    healthcare: "الرعاية الصحية",
    homeServices: "الخدمات المنزلية",
    hcLabel: "طبيب أو تخصص أو احتياج صحي",
    hsLabel: "خدمة أو فئة أو مزود",
    hcPlaceholder: "جرّب «الصحة النفسية»",
    hsPlaceholder: "جرّب «المختبر»",
    location: "الموقع",
    locationPlaceholder: "اختر منطقتك",
    hcSubmit: "ابحث عن رعاية صحية",
    hsSubmit: "استكشف الخدمات",
    popular: "الأكثر طلباً:",
    hcChips: [
      { value: "Mental Health", label: "الصحة النفسية" },
      { value: "Dermatology", label: "الأمراض الجلدية" },
      { value: "Pediatrics", label: "طب الأطفال" },
    ],
    hsChips: [
      { value: "Laboratory", label: "المختبر" },
      { value: "Nursing", label: "التمريض" },
      { value: "Physiotherapy", label: "العلاج الطبيعي" },
    ],
  },
};

export function UnifiedDiscovery() {
  const params = useParams<{ locale?: string }>();
  const isAr = params?.locale === "ar";
  const t = isAr ? copy.ar : copy.en;
  const prefix = isAr ? "/ar" : "";

  const [journey, setJourney] = useState<Journey>("healthcare");
  const isHealthcare = journey === "healthcare";
  const base = `${prefix}${isHealthcare ? "/healthcare" : "/home-services"}`;
  const chips = isHealthcare ? t.hcChips : t.hsChips;

  return (
    <div className="discovery-shell">
      {/* dir="ltr" keeps the sliding highlight aligned with the active tab in Arabic too */}
      <div
        className="discovery-tabs"
        dir="ltr"
        role="tablist"
        aria-label={t.tabsAria}
        data-active={journey}
      >
        <span className="tab-indicator" aria-hidden="true" />
        <button
          type="button"
          role="tab"
          aria-selected={isHealthcare}
          className={isHealthcare ? "is-active" : ""}
          onClick={() => setJourney("healthcare")}
        >
          <Icon name="heart" size={17} /> {t.healthcare}
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={!isHealthcare}
          className={!isHealthcare ? "is-active" : ""}
          onClick={() => setJourney("home-services")}
        >
          <Icon name="home" size={17} /> {t.homeServices}
        </button>
      </div>

      <form
        key={journey}
        className="discovery-form"
        data-journey={journey}
        action={base}
        method="get"
      >
        <label>
          <span>{isHealthcare ? t.hcLabel : t.hsLabel}</span>
          <div>
            <Icon name="search" size={19} />
            <input
              type="search"
              name="query"
              placeholder={isHealthcare ? t.hcPlaceholder : t.hsPlaceholder}
              autoComplete="off"
            />
          </div>
        </label>
        {!isHealthcare && (
          <label className="discovery-location">
            <span>{t.location}</span>
            <div>
              <Icon name="location" size={19} />
              <input
                name="location"
                placeholder={t.locationPlaceholder}
                autoComplete="address-level2"
              />
            </div>
          </label>
        )}
        <div className="discovery-submit">
          <span aria-hidden="true">&nbsp;</span>
          <button type="submit">
            {isHealthcare ? t.hcSubmit : t.hsSubmit}
            <Icon name="arrow" size={18} />
          </button>
        </div>
      </form>

      <div className="discovery-chips">
        <span>{t.popular}</span>
        {chips.map((chip) => (
          <Link key={chip.value} href={`${base}?query=${encodeURIComponent(chip.value)}`}>
            {chip.label}
          </Link>
        ))}
      </div>
    </div>
  );
}