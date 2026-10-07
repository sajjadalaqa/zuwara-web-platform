import type { Profile } from "./types";

type Store = { profile: Profile; password: string };

declare global {
  // eslint-disable-next-line no-var
  var __zuwaraProfile: Store | undefined;
}

// TODO (backend): delete this file.
// Mock password for testing the password form: Zuwara@123
export function getStore(): Store {
  if (!globalThis.__zuwaraProfile) {
    globalThis.__zuwaraProfile = {
      profile: {
        id: "1",
        fullName: "Maryam ",
        email: "maryam@example.com",
        emailVerified: true,
        phone: "+966 50 123 4567",
        dateOfBirth: "1998-04-12",
        gender: "female",
        city: "Riyadh",
        memberSince: "2026-03-15T09:00:00Z",
      },
      password: "Zuwara@123",
    };
  }
  return globalThis.__zuwaraProfile;
}