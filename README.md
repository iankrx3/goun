# Goun (고운)

AI Korean Beauty Discovery & Booking Platform — built from `Goun_PRD_v2_KTO_Design.md`.
Map and Google login are ported from `extract/` (the Sniffood map+login kit).

## Stack

Vite + React + TypeScript + Tailwind + React Router. Supabase (auth + data) and
Leaflet/MapTiler (map), matching `extract/README.md`. Chosen over the PRD's
Next.js listing (§13) to reuse the extract kit directly instead of rewriting
its Vite-specific auth/map code for the App Router.

## Getting started

```bash
npm install
cp .env.example .env.local   # optional — the app runs fully on demo data without this
npm run dev
```

Without `VITE_SUPABASE_URL`/`VITE_SUPABASE_ANON_KEY`, sign-in is disabled (with an
inline message) and every data call falls back to `src/data/mock.ts`. Without
`VITE_MAPTILER_API_KEY`, the map uses the free Carto Voyager basemap instead of
MapTiler. See `extract/README.md` for the Google OAuth + Supabase provider setup.

## What's implemented

- **Explore** (`src/pages/ExplorePage.tsx`) — Home → WHAT → VIBE → Constraints →
  AI transition → Top 3 matches, per PRD §2.
- **Map** (`src/pages/MapPage.tsx`, `src/components/MapView.tsx`) — ported from
  `extract/src/components/MapView.tsx`; category/pick filters, search, geolocation,
  and a Warm-Taupe KTO Wellness pin layer per §15.3.
- **Login** (`src/hooks/useAuth.ts`, `src/services/auth.ts`,
  `src/components/GoogleAuthModal.tsx`) — ported from `extract/`, restyled to the
  Goun brand tokens.
- **Place / Treatment detail** — Nearby Wellness and Medical Info KTO badges
  (§7.2/§7.3), fail-silent when their data is absent.
- **Community** — read-only feed (Post/Like/Comment are "MVP 이후" per §5).
- **My Map** (`src/hooks/useSavedPlaces.ts`) — save/unsave, stored in
  `localStorage` for now (no `saved_places` table yet).
- **AI matching** (`src/services/match.ts`) — a transparent client-side scorer
  implementing the §9 fit formula, standing in for the real LLM ranking engine
  in §13 until one exists.
- Brand design tokens, Bodoni Moda / Satoshi / Pretendard, from PRD §15.4.

## Known gaps vs. the PRD

- Creator profile pages, Creator Map, and Community write actions (post/like/
  follow) are not built — out of MVP scope per §11.
- Treatment/Place data is the bundled demo set in `src/data/mock.ts`, not a real
  database — wire `src/services/places.ts` to actual `places`/`treatments`/
  `creators`/`creator_picks` tables when they exist.
- `wellness_spots` / `medical_tourism_orgs` KTO batch tables (§7.6) don't exist;
  wellness/medical data is hand-authored per mock place. The real Swagger
  schema from data.go.kr still needs confirming per the PRD's open items.
- No nightly batch job, CDN image proxy, or geo-radius matching (§7.6) — all
  data is static.
