import { useUiText } from "@/i18n/use-ui-text";
import { Link } from "@/i18n/navigation";
export default function NotFound(){
  const uiText = useUiText();return <section className="page-hero"><div className="container narrow"><span className="eyebrow eyebrow-light">404</span><h1>{uiText("This page is not here.")}</h1><p>{uiText("The link may have changed, or the page may not be part of this presentation build.")}</p><Link href="/" className="button button-light">{uiText("Return home")}</Link></div></section>}
