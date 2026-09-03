# Miyeon (미연)

AI Korean Beauty Discovery & Booking Platform — Core UX per the MIYEON product spec
(Explore → Personalize → SNIFF → AI Match → Book / Shop). Map and Google login were
originally ported from an external "Sniffood" map+login starter kit (referenced during
initial porting; not part of this repository).

## Stack

Vite + React + TypeScript + Tailwind + React Router. Supabase (auth + data) and
Leaflet/MapTiler (map). Chosen over the PRD's Next.js listing (§13) to reuse the
original starter kit's Vite-specific auth/map code directly instead of rewriting
it for the App Router.

레이어별 기능 설명: [`docs/architecture/`](docs/architecture/README.md).

## Getting started

```bash
npm install
cp .env.example .env.local   # optional — the app runs fully on demo data without this
npm run dev
```

Without `VITE_SUPABASE_URL`/`VITE_SUPABASE_ANON_KEY`, Google OAuth is skipped and
**Continue as demo** still signs you in locally (stored in `localStorage`). Every
data call falls back to `src/data/mock.ts` unless the place-discovery keys below
are set. Without `VITE_MAPTILER_API_KEY`, the map uses the free Carto Voyager
basemap instead of MapTiler.

### Live place discovery (optional)

Add these **server-only** keys to `.env.local` (no `VITE_` prefix — the Vite
proxy injects them so they never reach the browser):

```
KTO_SERVICE_KEY=          # data.go.kr, service MdclTursmService (의료관광정보)
GOOGLE_PLACES_API_KEY=    # Google Cloud Places API (New)
GEMINI_API_KEY=           # Google AI Studio / Gemini API — optional, powers "Get latest info"
```

- KTO key: [한국관광공사_의료관광정보](https://www.data.go.kr/data/15143913/openapi.do) → 활용신청. Use the Decoding or Encoding key; the proxy normalises either.
- Google key: enable **Places API (New)** on a Cloud project. Restrict it to `localhost` HTTP referrers for local work.
- Gemini key: from [Google AI Studio](https://aistudio.google.com/apikey). Place detail keeps Google Places + KTO as its data source; Gemini is only called on demand (the "Get latest info" button, `src/components/place/GroundedInfo.tsx`) with the Google Search grounding tool enabled, to surface things Places/KTO don't carry (hours changes, closures, recent notes). Without this key the button is hidden — fail-silent, like the KTO badges.

`src/services/discovery.ts` maps each beauty category to Google Place types and,
for `skin` / `face`, overlays KTO-certified medical-tourism orgs (badge +
languages). Hair / nails / makeup are Google-primary. If a key is missing or a
call fails, the app keeps serving mock data. KTO responses must be attributed
`자료: 한국관광공사` (already on the medical/wellness badges). Development
quota on data.go.kr is 1,000 calls/day — results are cached for 10 minutes.

## What's implemented

- **Explore** (`src/pages/ExplorePage.tsx`) — Home → WHAT → VIBE → Constraints →
  AI transition → Top 3 matches, per PRD §2. The VIBE pair-choice screen shows
  an "OR" badge between each pair so it reads as a binary choice, not a grid.
- **Map** (`src/pages/MapPage.tsx`, `src/components/map/MapView.tsx`) — category/pick
  filters, search, geolocation, and a Warm-Taupe KTO Wellness pin layer per §15.3. Only
  `skin`/`face` categories are shown for now (`src/data/mapCategories.ts`) —
  hair/nails/makeup are still being built out. Search combines the already-loaded
  local places with a live, debounced Google Places text search constrained to
  `skin`/`face` place types (`services/discovery.ts#searchPlacesByCategory`), so
  typing a real business name finds it even if it isn't in the loaded set;
  picking a live result drops a new pin on the map. A map/list toggle
  (bottom-left) switches to `components/map/PlaceListView.tsx`, a scrollable,
  rating-sorted list of the same places.
- **Login** (`src/hooks/useAuth.ts`, `src/services/auth.ts`,
  `src/components/auth/GoogleAuthModal.tsx`) — Google OAuth when Supabase is
  configured, plus a local **Continue as demo** session that does not need keys.
- **Place discovery** (`src/services/discovery.ts`) — category engine over
  Google Places API (New) + KTO `MdclTursmService`. Vite proxy in
  `plugins/miyeon-api-proxy.ts` hides the keys and avoids browser CORS.
- **Place / Treatment detail** — Nearby Wellness and Medical Info KTO badges
  (§7.2/§7.3), fail-silent when their data is absent. Get-directions links to
  Google/Naver/Kakao Maps (`src/lib/directions.ts`), and an opt-in "Get latest
  info" lookup backed by Gemini + Google Search grounding
  (`src/components/place/GroundedInfo.tsx`) for anything Places/KTO don't cover.
- **Creatrip affiliate links** (`src/lib/creatrip.ts`) — Book-with-Creatrip CTAs
  (`ResultCard`, `PlaceDetailPage`, `TreatmentDetailPage`) are tagged with the
  Creatrip affiliate ID (`utm_source`/`aff_id` query params) and show a short
  commission-disclosure caption underneath, per Creatrip's affiliate policy.
  `hasCreatripListing()` tells apart a place with a real, spot-specific Creatrip
  page from one still pointing at the generic homepage; only the former is
  labeled "광고" (ad) — with one shown as a featured "광고 · 추천" pick — in the
  Map list view and on the Explore results screen (separate from, and never
  reordering, the 3 matched results). `scripts/resolve-creatrip-links.mjs`
  (`npm run resolve:creatrip`) is a one-off, read-only tool that asks Gemini
  (Google Search grounding) to find each demo place's real Creatrip page and
  reports whether the answer is corroborated by an actual search result —
  verified results are applied to `src/data/mock.ts` by hand, never
  auto-written.
- **Curator profiles** (`src/pages/CuratorProfilePage.tsx`, route
  `/curator/:id`) — a curator's bio, socials, and the full list of places they've
  curated (`services/places.ts#fetchCreatorById` /
  `#fetchCreatorPicksByCreatorId`). Reached by tapping a creator's avatar in the
  Map tab's "Curated by Creators" strip.
- **Community** (`src/services/community.ts`) — read/write feed backed by
  Supabase when configured, falling back to `localStorage` otherwise: create
  post, like/unlike, comment, and delete your own post/comment. Follow is not
  built.
- **My Map** (`src/hooks/useSavedPlaces.ts`) — save/unsave, stored in
  `localStorage` for now (no `saved_places` table yet).
- **AI matching** (`src/services/match.ts`) — a transparent client-side scorer
  implementing the §9 fit formula, standing in for the real LLM ranking engine
  in §13 until one exists.
- **Mobile bottom nav** (`src/components/layout/BottomNav.tsx`) — below the `sm`
  breakpoint, the top tab bar (`NavHeader`) hides and a thumb-reachable bottom
  tab bar takes over; desktop keeps the top nav.
- Brand design tokens (Soft Cocoa / Dusty Rose / Soft Blush / Warm Beige / White) and
Satoshi / Pretendard typography, from the Miyeon brand board.

## Known gaps vs. the PRD

- Community **follow** is not built (post/like/comment/delete all are).
- `hair`/`nails`/`makeup` are modeled end-to-end (types, quiz, discovery) but
  hidden from the Map tab until their UX is finished — see
  `src/data/mapCategories.ts`.
- Treatment/Place data is live when `KTO_SERVICE_KEY` / `GOOGLE_PLACES_API_KEY`
  are set, otherwise the bundled demo set in `src/data/mock.ts`. Wire
  `src/services/places.ts` to actual `places`/`treatments`/`creators`/
  `creator_picks` tables when they exist — there's no SQL schema file for
  those tables in this repo yet (`supabase/` only has `community_schema.sql`
  and `leads_schema.sql`).
- Nearby Wellness (`WellnessTursmService`) is still mock-only; medical-tourism
  badges on live `skin`/`face` places come from `MdclTursmService`.
- No nightly batch job. Discovery is on-demand with a 10-minute in-memory cache.
  The API proxy only runs under `vite` / `vite preview`, not on a static host.
