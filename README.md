# Miyeon (미연)

AI Korean Beauty Discovery & Booking Platform — Core UX per the MIYEON product spec
(Explore → Personalize → SNIFF → AI Match → Book / Shop). Map and Google login are ported
from `extract/` (the Sniffood map+login kit).

## Stack

Vite + React + TypeScript + Tailwind + React Router. Supabase (auth + data) and
Leaflet/MapTiler (map), matching `extract/README.md`. Chosen over the PRD's
Next.js listing (§13) to reuse the extract kit directly instead of rewriting
its Vite-specific auth/map code for the App Router.

레이어별 기능 설명: [`docs/architecture.md`](docs/architecture.md).

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
- Gemini key: from [Google AI Studio](https://aistudio.google.com/apikey). Place detail keeps Google Places + KTO as its data source; Gemini is only called on demand (the "Get latest info" button, `src/components/GroundedInfo.tsx`) with the Google Search grounding tool enabled, to surface things Places/KTO don't carry (hours changes, closures, recent notes). Without this key the button is hidden — fail-silent, like the KTO badges.

`src/services/discovery.ts` maps each beauty category to Google Place types and,
for `skin` / `face`, overlays KTO-certified medical-tourism orgs (badge +
languages). Hair / nails / makeup are Google-primary. If a key is missing or a
call fails, the app keeps serving mock data. KTO responses must be attributed
`자료: 한국관광공사` (already on the medical/wellness badges). Development
quota on data.go.kr is 1,000 calls/day — results are cached for 10 minutes.

## What's implemented

- **Explore** (`src/pages/ExplorePage.tsx`) — Home → WHAT → VIBE → Constraints →
  AI transition → Top 3 matches, per PRD §2.
- **Map** (`src/pages/MapPage.tsx`, `src/components/MapView.tsx`) — ported from
  `extract/src/components/MapView.tsx`; category/pick filters, search, geolocation,
  and a Warm-Taupe KTO Wellness pin layer per §15.3.
- **Login** (`src/hooks/useAuth.ts`, `src/services/auth.ts`,
  `src/components/GoogleAuthModal.tsx`) — Google OAuth when Supabase is
  configured, plus a local **Continue as demo** session that does not need keys.
- **Place discovery** (`src/services/discovery.ts`) — category engine over
  Google Places API (New) + KTO `MdclTursmService`. Vite proxy in
  `plugins/goun-api-proxy.ts` hides the keys and avoids browser CORS.
- **Place / Treatment detail** — Nearby Wellness and Medical Info KTO badges
  (§7.2/§7.3), fail-silent when their data is absent. Get-directions links to
  Google/Naver/Kakao Maps (`src/lib/directions.ts`), and an opt-in "Get latest
  info" lookup backed by Gemini + Google Search grounding
  (`src/components/GroundedInfo.tsx`) for anything Places/KTO don't cover.
- **Community** — read-only feed (Post/Like/Comment are "MVP 이후" per §5).
- **My Map** (`src/hooks/useSavedPlaces.ts`) — save/unsave, stored in
  `localStorage` for now (no `saved_places` table yet).
- **AI matching** (`src/services/match.ts`) — a transparent client-side scorer
  implementing the §9 fit formula, standing in for the real LLM ranking engine
  in §13 until one exists.
- Brand design tokens (Soft Cocoa / Dusty Rose / Soft Blush / Warm Beige / White) and
Satoshi / Pretendard typography, from the Miyeon brand board.

## Known gaps vs. the PRD

- Creator profile pages, Creator Map, and Community write actions (post/like/
  follow) are not built — out of MVP scope per §11.
- Treatment/Place data is live when `KTO_SERVICE_KEY` / `GOOGLE_PLACES_API_KEY`
  are set, otherwise the bundled demo set in `src/data/mock.ts`. Wire
  `src/services/places.ts` to actual `places`/`treatments`/`creators`/
  `creator_picks` tables when they exist.
- Nearby Wellness (`WellnessTursmService`) is still mock-only; medical-tourism
  badges on live `skin`/`face` places come from `MdclTursmService`.
- No nightly batch job. Discovery is on-demand with a 10-minute in-memory cache.
  The API proxy only runs under `vite` / `vite preview`, not on a static host.
