"use client";
import { useUiText } from "@/i18n/use-ui-text";
export default function DoctorsError({ reset }: { reset: () => void }) {
  const uiText = useUiText();
  return <div className="container page-error" role="alert"><h1>{uiText("We couldn’t load consultants.")}</h1><p>{uiText("The healthcare service may be temporarily unavailable. No booking information was changed.")}</p><button type="button" className="button button-primary" onClick={reset}>{uiText("Try again")}</button></div>;
}
