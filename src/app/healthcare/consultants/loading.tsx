import { useUiText } from "@/i18n/use-ui-text";
export default function LoadingDoctors() {
  const uiText = useUiText();
  return <div className="container page-loading" role="status" aria-live="polite"><span className="loading-pulse"/><div><strong>{uiText("Loading consultants")}</strong><p>{uiText("Retrieving current healthcare profiles and availability.")}</p></div></div>;
}
