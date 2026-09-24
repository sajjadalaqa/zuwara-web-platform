# Zuwara website design system

This system keeps the public website visually aligned with the Zuwara patient product while presenting healthcare and D4H home services as one coherent, editorial marketplace experience.

## Principles

- Use one clear visual hierarchy per section.
- Prefer whitespace, rules, and alignment over decorative containers.
- Do not turn every content group into a rounded card.
- Use gradients only when they communicate something important; the current system uses solid brand surfaces.
- Use shadows only for elevated navigation, search, and floating contextual elements.
- Use motion sparingly and respect `prefers-reduced-motion`.
- Keep claims and operational details grounded in verified product behavior.
- Use one shared brand system for both verticals. Differentiate journeys through content, iconography, and composition rather than introducing a second color palette.
- Keep healthcare and home-service data models visibly connected but technically separate.

## Brand palette

All website colors are centralized in `src/app/globals.css`.

| Token | Value | Use |
| --- | --- | --- |
| `--primary` | `#602D8C` | Main actions and brand accents |
| `--primary-dark` | `#3D165F` | High-contrast brand surfaces |
| `--primary-light` | `#F1EAF6` | Subtle selected and icon backgrounds |
| `--secondary` | `#BD9ABC` | Supporting brand detail |
| `--background` | `#FFFFFF` | Main page background |
| `--surface` | `#F8F7FA` | Alternate sections |
| `--border` | `#E5E1E8` | Dividers and controls |
| `--text-primary` | `#1E293B` | Headings and primary content |
| `--text-secondary` | `#64748B` | Supporting content |
| `--muted` | `#94A3B8` | Low-emphasis labels |
| `--success` | `#2E8E63` | Confirmed states only |
| `--warning` | `#D97706` | Warning states only |
| `--error` | `#BE1F39` | Error and destructive states only |

## Typography

- Manrope is self-hosted from the existing Flutter application and is the primary Latin typeface.
- Noto Naskh Arabic is self-hosted for Arabic and RTL content.
- Display and page headings use restrained sizes, 600 weight, compact line-height, and negative tracking.
- Body copy uses 400 weight and generous line-height for clinical readability.
- Labels and eyebrows use 700 weight and controlled letter spacing.

## Layout

- The primary content grid is capped at `1200px`.
- Desktop horizontal padding is `24px`; mobile padding is `14px`.
- Standard section spacing is responsive through `--section-space`.
- Page sections align to the same container unless an intentional full-width brand band is used.
- Buttons use a 10px radius; most content compositions remain square or minimally rounded.

## Component rules

- Primary actions use solid Zuwara purple.
- Secondary actions use a white surface and visible border.
- Lists use dividers when elevation is unnecessary.
- Consultant cards may use bordered image tiles because they represent comparable marketplace entities.
- Dynamic consultant and category content must come from the owning Laravel API; empty states replace invented data.
- Service collections use editorial rows, not floating cards.
- Product callouts may use a dark brand surface, but should not be repeated in adjacent sections.
- Search and form controls must retain visible labels, keyboard focus, and sufficient touch targets.

## Responsive behavior

- Navigation collapses below 900px.
- Two-column editorial layouts become single-column below 900px.
- Specialty categories become a horizontal snap list on small screens.
- Service and consultant grids reduce from three to two to one column.
- CTAs become full-width only when mobile space requires it.

## Data presentation

- Zuwara healthcare content is normalized in `src/lib/api/zuwara/`.
- D4H home-service content is normalized in `src/lib/api/d4h/`.
- Credentials stay in server-only environment variables and are never prefixed with `NEXT_PUBLIC_`.
- Public catalogue requests use five-minute revalidation and bounded timeouts.
- API failures render honest, actionable empty states without changing backend behavior.
