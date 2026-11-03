/** Only consultant profiles can be used as booking sign-in return destinations. */
export function consultantReturn(search: string): string | null {
  const value = new URLSearchParams(search).get("consultantReturn");
  return value && /^\/healthcare\/doctors\/[a-zA-Z0-9][a-zA-Z0-9-]{0,199}$/.test(value) ? value : null;
}

export function consultantAuthHref(path: string, search: string): string {
  const target = consultantReturn(search);
  const instant = new URLSearchParams(search).get("bookingFlow") === "instant";
  return target ? `${path}?consultantReturn=${encodeURIComponent(target)}${instant ? "&bookingFlow=instant" : ""}` : path;
}

export function consultantSignInDestination(search: string): string {
  const target = consultantReturn(search);
  const instant = new URLSearchParams(search).get("bookingFlow") === "instant";
  return target ? `${target}?bookingSignIn=success${instant ? "&bookingFlow=instant" : ""}` : "/dashboard";
}
