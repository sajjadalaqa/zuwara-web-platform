/** Only consultant profiles can be used as booking sign-in return destinations. */
export function consultantReturn(search: string): string | null {
  const params = new URLSearchParams(search);
  const value = params.get("consultantReturn");
  if (value === "/healthcare/doctors" && params.get("bookingFlow") === "public-instant") return value;
  return value && /^\/healthcare\/doctors\/[a-zA-Z0-9][a-zA-Z0-9-]{0,199}$/.test(value) ? value : null;
}

export function consultantAuthHref(path: string, search: string): string {
  const target = consultantReturn(search);
  const flow = new URLSearchParams(search).get("bookingFlow");
  const suffix = flow === "instant" || flow === "public-instant" ? `&bookingFlow=${flow}` : "";
  return target ? `${path}?consultantReturn=${encodeURIComponent(target)}${suffix}` : path;
}

export function consultantSignInDestination(search: string): string {
  const target = consultantReturn(search);
  const flow = new URLSearchParams(search).get("bookingFlow");
  const suffix = flow === "instant" || flow === "public-instant" ? `&bookingFlow=${flow}` : "";
  return target ? `${target}?bookingSignIn=success${suffix}` : "/dashboard";
}
