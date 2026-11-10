/** Only consultant profiles can be used as booking sign-in return destinations. */
export function consultantReturn(search: string): string | null {
  const params = new URLSearchParams(search);
  const rawValue = params.get("consultantReturn");
  let value: string | null = rawValue;
  // Browser URLs may percent-encode Arabic doctor names. Validate the decoded
  // path with the same alphabet used by doctorSlug, never arbitrary URLs.
  try { value = rawValue === null ? null : decodeURIComponent(rawValue); }
  catch { return null; }
  if (value === "/healthcare/doctors" && params.get("bookingFlow") === "public-instant") return value;
  return value && /^\/healthcare\/doctors\/[a-zA-Z0-9\u0600-\u06ff][a-zA-Z0-9\u0600-\u06ff-]{0,199}$/.test(value) ? value : null;
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
