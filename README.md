# Zuwara Web Platform — Public Website

Presentation-ready, SEO-oriented Next.js website for the future Zuwara TypeScript platform.

## Current scope

- Responsive public homepage based on the supplied design direction
- Service directory and statically generated service pages
- API-backed consultant and specialty directories
- Real consultant profiles with date- and duration-aware schedule states
- About, Contact, FAQ, Insights, Download and booking entry pages
- Arabic RTL proof page
- Route-level metadata, canonical URLs, Open Graph and Twitter metadata
- Structured Organization and Service data
- Generated sitemap and robots rules
- Security-oriented response headers
- Reusable design components and content models

## Data and integration boundaries

- No existing Zuwara, D4H, Flutter or React project was modified.
- Public catalogue data is read server-side from the existing Zuwara and D4H APIs.
- API credentials remain server-only and are never sent to browser components.
- The website does not duplicate booking, payment, wallet, appointment-state, or authentication rules. Available slots hand off to secure Zuwara sign-in; final validation remains with the existing backend.
- Filtered consultant-search combinations are excluded from indexing, while canonical directory, specialty, and profile routes remain discoverable.
- D4H service records are not published while its current public feed contains test/placeholder content.
- Contact form submission is intentionally disabled until an approved API exists.
- Legal pages are placeholders and must be replaced by approved legal content.
- App-store links must be verified before they are added.

## Commands

```bash
npm install
npm run dev
npm run lint
npm run build
npm start
```

Open `http://localhost:3000` during local development.

## Environment

Copy `.env.example` to `.env.local` and provide the server-only API values. Never rename API credentials with a `NEXT_PUBLIC_` prefix.

The current server-side compatibility clients are isolated by domain so they can later move behind the approved public NestJS API without changing public page contracts.
