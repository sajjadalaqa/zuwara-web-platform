import { Icon } from "./Icon";

export function HeroSearch() {
  return (
    <form className="hero-search" action="/healthcare/doctors" method="get">
      <label className="search-field">
        <span>What care do you need?</span>
        <div><Icon name="search" size={19}/><select name="specialty" defaultValue=""><option value="">Doctor, specialty or service</option><option value="family-medicine">Family medicine</option><option value="general-medicine">General medicine</option><option value="mental-wellness">Mental wellness</option><option value="therapy">Therapy sessions</option></select></div>
      </label>
      <label className="search-field search-date">
        <span>Preferred date</span>
        <div><Icon name="calendar" size={19}/><input type="date" name="date" aria-label="Preferred appointment date"/></div>
      </label>
      <button type="submit" className="search-submit">Search consultants <Icon name="search" size={18}/></button>
    </form>
  );
}
