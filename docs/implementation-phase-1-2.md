# Unified platform implementation — phases 1 and 2

## Delivered

- Unified public navigation and footer for Healthcare and Home Services.
- Centralized brand tokens, typography, spacing, buttons, inputs, focus states, and responsive containers.
- Complete homepage with dual-journey discovery, pathway storytelling, API-backed healthcare discovery, API-backed D4H categories, booking journeys, Post a Request, mobile experience, guidance, FAQ, and final calls to action.
- Server-only Zuwara and D4H API clients with separate types, normalization, timeouts, caching, and failure states.
- Public gateway pages for `/healthcare`, `/home-services`, `/how-it-works`, and `/help` so homepage and navigation links are valid.
- Updated homepage metadata, Organization/WebSite/FAQ structured data, sitemap, robots rules, canonicals, and remote-image policy.
- Removed fake consultant profiles from the production route catalogue; legacy consultant URLs now redirect to the real healthcare gateway.

## Live API connections

- Zuwara: `POST /api/user/fetchHomeConsultants`
  - Active healthcare categories
  - Real consultant profiles
  - Classification, specialty, rating, experience, starting price, and duration data
- D4H: `GET /api/category-list`
  - Active featured categories
  - Category media and service counts

## Deliberately deferred

- The general D4H service feed currently includes test/placeholder records. It is typed but is not published on the homepage until the backend provides a curated public feed or production data is cleaned.
- Doctor detail, specialty detail, service detail, provider, shop, and lab pages belong to phases 3 and 4.
- Authenticated booking, account, payment, wallet, tracking, and request actions remain owned by the existing Laravel/Flutter systems.
- Arabic is not yet a full localized route tree; the font and direction foundations are ready for the localization phase.

## Environment

Copy `.env.example` to `.env.local` and set `ZUWARA_API_KEY` on each deployment. All backend values are server-only. Do not expose them through `NEXT_PUBLIC_` variables.

## Verification

- ESLint passes.
- Next.js production build passes.
- Homepage and supporting public routes return HTTP 200 locally.
- Live Zuwara consultant data and live D4H categories are present in server-rendered HTML.
