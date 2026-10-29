import { useUiText } from "@/i18n/use-ui-text";
import { useLocale } from "next-intl";
import { Icon } from "./Icon";

export function HeroSearch() {
  const uiText = useUiText();
  const locale = useLocale();
  return (
    <form className="hero-search" action={`${locale === "ar" ? "/ar" : ""}/healthcare/doctors`} method="get">
      <label className="search-field">
        <span>{uiText("What care do you need?")}</span>
        <div><Icon name="search" size={19}/><select name="specialty" defaultValue=""><option value="">{uiText("Doctor, specialty or service")}</option><option value="family-medicine">{uiText("Family medicine")}</option><option value="general-medicine">{uiText("General medicine")}</option><option value="mental-wellness">{uiText("Mental wellness")}</option><option value="therapy">{uiText("Therapy sessions")}</option></select></div>
      </label>
      <label className="search-field search-date">
        <span>{uiText("Preferred date")}</span>
        <div><Icon name="calendar" size={19}/><input type="date" name="date" aria-label={uiText("Preferred appointment date")}/></div>
      </label>
      <button type="submit" className="search-submit">{uiText("Search consultants")}{" "}<Icon name="search" size={18}/></button>
    </form>
  );
}
