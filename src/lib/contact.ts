export type ContactPayload = {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  message: string;
  website?: string; // hidden spam-trap field, must stay empty
};

export type ContactErrors = Partial<Record<keyof ContactPayload, string>>;

export type ContactResult =
  | { ok: true }
  | { ok: false; error: string; fieldErrors?: ContactErrors };

/** Used by BOTH the form (browser) and the API route (server). */
export function validateContact(values: ContactPayload): ContactErrors {
  const errors: ContactErrors = {};
  const digits = values.phone.replace(/\D/g, "");

  if (values.firstName.trim().length < 2) errors.firstName = "Please enter your first name.";
  if (values.lastName.trim().length < 2) errors.lastName = "Please enter your last name.";
  if (digits.length < 7 || digits.length > 15) errors.phone = "Please enter a valid phone number.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) errors.email = "Please enter a valid email address.";
  if (values.message.trim().length < 10) errors.message = "Please write at least 10 characters.";

  return errors;
}

/**
 * The ONLY place the form talks to the backend.
 * A backend developer can change the URL or request format here
 * without touching the form UI.
 */
export async function submitContact(payload: ContactPayload): Promise<ContactResult> {
  try {
    const response = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      return {
        ok: false,
        error: data?.error ?? "Something went wrong. Please try again.",
        fieldErrors: data?.fieldErrors,
      };
    }
    return { ok: true };
  } catch {
    return { ok: false, error: "We couldn't reach the server. Please check your connection and try again." };
  }
}