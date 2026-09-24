# Phase 3 — healthcare discovery and consultant profiles

## Delivered

- Searchable consultant directory at `/healthcare/doctors` using the existing read-only Zuwara APIs.
- Filters for English/Arabic keywords, specialty, optional consultation duration, date, consultation type, gender, sorting, and available slots.
- Real specialty index and dynamic specialty routes under `/healthcare/specialties`.
- Real consultant profile routes with canonical, readable slugs that retain the immutable doctor ID.
- Consultant profiles expose only approved public fields: names, classification, specialty, image, experience, rating, completed consultations, biography, credentials, services, expertise, experience, and awards when returned by the API.
- Date- and duration-aware appointment schedules showing available, booked, reserved, closed, and past states.
- Available slots hand off to secure sign-in. No booking or payment rule was reimplemented in Next.js.
- Dynamic SEO metadata, breadcrumbs, MedicalWebPage/Physician structured data, canonical URLs, and API-backed sitemap entries.
- Filtered search pages use `noindex,follow` to prevent duplicate-index bloat.
- Responsive directory, specialty, profile, and schedule interfaces aligned to the shared Zuwara design system.

## Existing API usage

- `POST /api/user/fetchHomeConsultants`
- `POST /api/user/searchDoctorByKeyword`
- `POST /api/user/searchDoctorV2`
- `POST /api/user/fetchDoctorProfile`

All calls are server-side, read-only, cached briefly, timeout protected, normalized into public TypeScript models, and rendered with safe empty/error states.

## Booking boundary

The website can display a slot as available, but availability may change. After sign-in, the existing Zuwara backend must validate and reserve the selected slot before payment. The Next.js website must not mark an appointment paid or bypass existing booking APIs.

## Verification

- ESLint passes.
- Next.js production build passes.
- Consultant directory, filtered directory, specialty index, a live specialty detail, and a live consultant profile return HTTP 200 locally.
- The verified consultant profile response renders both `Booked` and `Available` schedule states for the selected date and duration.
- Filtered directory output includes `noindex`.
