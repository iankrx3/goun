# Miyeon 아키텍처별 기능 설명

Vite + React SPA. 서버는 Vite 개발/프리뷰 프록시뿐이고, 나머지 로직은 브라우저에서 돌아간다.

```
[브라우저]
  pages / components          UI, 라우팅
  hooks                       세션 · 저장 상태
  services                    인증 · 장소 조회 · 매칭 · 디스커버리
  data / types                퀴즈 카피, 카테고리 맵, mock, 도메인 모델
       │  /api/*
[Vite 프록시] plugins/miyeon-api-proxy.ts
       │
  data.go.kr MdclTursmService (KTO 의료관광)
  places.googleapis.com      (Google Places API New)
  generativelanguage.googleapis.com (optional) Gemini + Google Search grounding
  (optional) Supabase Auth
```

실패 시 항상 mock으로 연다. 키가 없어도 Explore / Map / 데모 로그인은 동작한다.

---

## 1. 셸 · 라우팅

| 파일 | 역할 |
|---|---|
| `src/main.tsx` | React 루트, `BrowserRouter` |
| `src/App.tsx` | 헤더, 라우트, 로그인 모달, 하단 탭바 |
| `src/components/NavHeader.tsx` | Explore / Map / Community 탭(데스크톱, `sm` 이상), Sign in·out |
| `src/components/BottomNav.tsx` | 같은 3탭을 아이콘+라벨로 보여주는 모바일 전용(`sm` 미만) 하단 탭바 |
| `src/index.css`, `tailwind.config.js` | Miyeon 브랜드 토큰 (Main/Sub1/Sub2/Neutral/Base), 폰트 |

**기능**

- `/` Explore 퀴즈 → Top 3
- `/map` 장소 핀/리스트 · 필터 · 검색 (skin/face만)
- `/community` 게시글 피드 (읽기 + 작성/좋아요/댓글/삭제)
- `/place/:id` 장소 상세 (웰니스 · 의료관광 배지, 저장)
- `/treatment/:id` 시술 상세 · Creatrip 제휴 링크
- `/curator/:id` 큐레이터 프로필 · 그 큐레이터가 등록한 장소 목록
- `/community/:id` 게시글 상세 · 댓글

로그인 여부로 라우트를 막지 않는다(단, 글쓰기·좋아요·댓글·삭제는 로그인 필요). 저장은 로그인 없이도 `localStorage`에 남는다.

모바일(`sm` 미만)에서는 상단 탭이 숨고 `BottomNav`가 뜬다. Map을 제외한 모든 라우트는 `App.tsx`의 `<main>`에 `pb-16`을 줘서 콘텐츠가 하단 탭바에 안 가리게 하고, Map은 풀블리드 레이아웃이라 자체적으로 줌/위치 버튼·선택 장소 시트를 모바일에서만 위로 띄운다.

---

## 2. 인증

| 레이어 | 파일 | 하는 일 |
|---|---|---|
| UI | `GoogleAuthModal.tsx` | Continue as demo / Continue with Google |
| Hook | `hooks/useAuth.ts` | 세션 hydrate, demo·Google·sign out |
| Service | `services/auth.ts` | demo `localStorage`, Google OAuth, return tab |
| Infra | `lib/supabase.ts` | `VITE_SUPABASE_*`가 있을 때만 클라이언트 생성 |

**Continue as demo**

- 유저: `Miyeon Demo` / `demo@miyeon.app`
- 키 `miyeon_mock_session`
- Supabase가 없어도 동작. 새로고침 유지. Sign out 시 삭제.

**Google**

- Supabase Auth `signInWithOAuth({ provider: 'google' })`
- 키가 없으면 모달이 안내만 하고 데모 로그인을 권한다.

---

## 3. 장소 디스커버리 엔진

카테고리(skin / face / hair / nails / makeup)를 Google Places + KTO 의료관광 결과로 바꿔 `Place` / `Treatment`를 만든다.

### 3.1 API 프록시

`plugins/miyeon-api-proxy.ts` — `vite.config.ts`의 `configureServer` / `configurePreviewServer`.

키는 `KTO_SERVICE_KEY`, `GOOGLE_PLACES_API_KEY`, `GEMINI_API_KEY` ( **`VITE_` 없음** ). 브라우저에 안 나간다.

| 프론트 | 업스트림 |
|---|---|
| `GET /api/health` | 키 장착 여부 `{ kto, google, gemini }` |
| `GET /api/kto/:op` | `https://apis.data.go.kr/B551011/MdclTursmService/:op` |
| `POST /api/places/search` | Places `searchNearby` / `searchText` |
| `GET /api/places/photo` | 사진 URI로 302. 이미지 URL에 Google 키 없음 |
| `POST /api/gemini/ground` | Gemini `generateContent` + `google_search` 툴 (grounding) |

키 없으면 `503 { error: 'not_configured' }`. 정적 호스팅에는 이 프록시가 없다.

### 3.2 클라이언트

| 파일 | 기능 |
|---|---|
| `services/googlePlaces.ts` | Nearby · Text Search, 사진 URL, health 캐시 |
| `services/kto.ts` | `searchKeyword`, `locationBasedList`, `detailMdclTursm` |
| `data/categorySearch.ts` | 카테고리 → Google type · 검색어 · KTO 키워드 |

기본 좌표는 강남 `(37.5172, 127.0473)`. `Near Me`여도 한국 밖이면 강남으로 되돌린다.

### 3.3 머지 (`services/discovery.ts`)

1. 카테고리별로 Google Nearby(+Text)와, skin/face면 KTO를 병렬 호출한다.
2. 이름 유사 + 거리 150m 이내면 같은 장소로 본다.
3. 사진·별점·가격은 Google, KTO 히트면 `medicalTourismMatch` (인증 배지 · 언어 · 진료과).
4. Google에 없는 KTO 기관도 장소로 남긴다.
5. 장소마다 합성 `Treatment` 하나 (`t-gp_…` / `t-kto_…`) — 퀴즈 카드가 시술 스키마를 쓰기 때문.
6. 10분 메모리 캐시. 실패하면 빈 배열 → 상위에서 mock.

| 카테고리 | Google `includedTypes` | KTO |
|---|---|---|
| skin | skin_care_clinic, spa, medical_clinic | dermatology, skin, 피부 |
| face | medical_clinic, spa | plastic, 성형 |
| hair | hair_salon, hair_care | 안 함 |
| nails | nail_salon | 안 함 |
| makeup | makeup_artist, beauty_salon | 안 함 |

웰니스(`WellnessTursmService`)는 엔진에 없고, mock 장소의 `nearbyWellness`만 쓴다.

### 3.4 지도 검색 (`searchPlacesByCategory`)

Map 탭 검색창은 이미 로드된 `places`를 이름/지역으로 즉시 필터링해서 보여주고(로컬 매치), 350ms 디바운스 후 `services/discovery.ts`의 `searchPlacesByCategory(['skin','face'], query, origin)`를 호출해 실제 Google Places 텍스트 검색 결과를 이어 붙인다(`components/MapView.tsx`).

- `discoverPlaces()`와 달리 Nearby 단계와 KTO 병합은 건너뛴다 — Nearby는 검색어를 안 쓰고, KTO 병합은 타이핑 응답 속도를 떨어뜨리므로 타입어헤드에는 부적합.
- 카테고리별로 `includedType`(해당 카테고리의 `googleTypes[0]`)을 걸어서, skin/face 지도에 hair/nails/makeup 업체가 섞여 들어오지 않게 한다.
- 결과는 (discovery 결과와 동일하게) `rememberDiscovery()`로 인메모리 카탈로그에 저장돼, 검색으로 찾은 장소를 클릭해 `/place/:id`로 들어가도 `fetchPlaceById`가 찾을 수 있다.
- 검색 결과를 클릭하면 지도에 아직 핀이 없을 수 있으므로(로컬 `places`에 없던 라이브 결과), `MapView`가 그 장소를 `places` state에 추가한 뒤 카메라를 이동시킨다. 카테고리 필터가 걸려 있으면 핀이 안 보일 수 있어 이때 필터도 "All"로 초기화한다.

### 3.5 조회 파사드 (`services/places.ts`)

순서: in-memory 카탈로그 → (있으면) Supabase 테이블 → `discoverAll()` → `src/data/mock.ts`.

Map · 상세 · 퀴즈가 같은 `Place.id`를 보게 카탈로그에 디스커버리 결과를 넣는다.

---

## 4. 매칭 (Explore)

| 레이어 | 파일 | 기능 |
|---|---|---|
| UI | `ExplorePage.tsx` | Home → Category(Treatments/Salon/Products) → Skin/Face → WHAT → VIBE → Constraints → AI 전환 → Top 3 |
| 퀴즈 카피 | `data/quiz.ts` | 카테고리별 concern, vibe 쌍(Subtle/Dramatic·Fast/Long-term·Needles), 여행기간/다운타임/예산 |
| 위젯 | `ModeSelect`, `CategoryRadial`, `PairChoice`, `AITransition`, `ResultCard` | 카테고리 선택, 시술 선택 UI, 로딩, 매치 카드. `PairChoice`는 두 선택지 사이에 "OR" 배지를 얹어 이진 선택임을 드러낸다 |
| 스코러 | `services/match.ts` | 가중 합 (Concern/Result/Downtime/Budget/Timing/Location/Foreigner/Vibe). 상위 3개 |

흐름: 카테고리(Skin/Face)로 `discoverPlaces()` → 합성 시술 점수 → 실패 시 mock 시술. Treatments만 구현되어 있고 Salon/Products는 "Coming soon" 카드로만 존재한다.

가중치: Concern 0.25, Result 0.05, Downtime 0.15, Budget 0.15, Timing 0.15, Location 0.10, Foreigner 0.05, Vibe 0.10.

English-friendly 여부는 이제 항상 체크된 것으로 간주한다 (opt-in 체크박스 제거). KTO 매치면 Result 카드에 의료관광 한 줄을 붙인다.

LLM은 없다. `match.ts`가 투명한 클라이언트 스코러다.

---

## 5. 맵

| 파일 | 기능 |
|---|---|
| `pages/MapPage.tsx` | 지도/리스트 뷰 토글, 선택 장소 시트, 상세 이동, Save |
| `components/MapView.tsx` | Leaflet, 카테고리/픽 필터, 검색(로컬 + 라이브 Google), 내 위치, 핀 |
| `components/PlaceListView.tsx` | 지도 대신 보는 스크롤형 장소 리스트 |
| `components/SponsoredPlaceCard.tsx` | "광고" 배지 + 강조 테두리로 감싼 `PlaceCard` (리스트 최상단 / Explore 결과에서 재사용) |
| `data/mapCategories.ts` | Map 탭에 노출할 카테고리 목록(`ENABLED_MAP_CATEGORIES`) |

- **카테고리 제한**: 지금은 `skin`/`face`만 지도에 뜬다(`ENABLED_MAP_CATEGORIES`). hair/nails/makeup은 타입·퀴즈·discovery까지는 다 있지만 Map 탭에서만 걸러진다 — 나중에 켜려면 이 상수와 `CATEGORY_FILTERS` 칩 배열만 되돌리면 됨.
- 뷰티 핀: Miyeon Sub1 (Dusty Rose). 카테고리 아이콘.
- 웰니스 핀: Warm Taupe. mock `nearbyWellness`만.
- 타일: `VITE_MAPTILER_API_KEY` 있으면 MapTiler, 없으면 Carto Voyager.
- 데이터: `fetchPlaces()` / `fetchCreatorPicks()` (둘 다 skin/face로 필터링해서 state에 저장). 검색은 §3.4 참고.
- **지도/리스트 토글**: `MapPage.tsx` 좌측 하단 버튼. 리스트뷰(`PlaceListView`)는 같은 skin/face 장소를 rating 내림차순으로 보여주고, `lib/creatrip.ts#hasCreatripListing()`이 true인(=실제 Creatrip spot 페이지가 검증된) 장소 중 하나를 최상단에 "광고 · 추천" 카드로, 나머지는 "광고" 배지만 붙여 표시한다. 제휴 페이지가 없는 장소는 그대로 배지 없이 보인다.
- **Curated by Creators** 스트립: 아바타를 누르면 지도 점프가 아니라 `/curator/:id` 큐레이터 프로필로 이동한다(§6).

---

## 6. 상세 · 커뮤니티 · 저장

**장소 상세** (`PlaceDetailPage.tsx`)

- 사진, 별점, Why people like it, 시술 목록
- 경로찾기 링크 (Google/Naver/Kakao Maps, `lib/directions.ts`) — 좌표 + `googlePlaceId` 기반, 새 탭
- `NearbyWellnessSection` · `MedicalTourismSection` (`components/badges/KtoBadges.tsx`) — 데이터 없으면 안 그림 (fail-silent)
- `GroundedInfo` (`components/GroundedInfo.tsx`) — "Get latest info" 버튼. 클릭 시에만 `services/gemini.ts` → `/api/gemini/ground` 호출, Google Search grounding으로 KTO/Places에 없는 최신 정보(영업시간 변경, 휴업 등) 요약 + 출처 링크. `GEMINI_API_KEY` 없으면 버튼 자체가 안 보임 (fail-silent)
- Save to My Map, Creatrip 제휴 링크(또는 Google website) — `lib/creatrip.ts`가 `utm_source`/`aff_id` 쿼리 파라미터를 자동으로 붙이고, 버튼 아래에 커미션 disclosure 문구(`CREATRIP_DISCLOSURE`)를 보여준다(Creatrip 제휴 정책 2번 항목).

**시술 상세** (`TreatmentDetailPage.tsx`) — 가격대, 다운타임, 강도, 연결된 장소. Creatrip CTA 아래 동일한 disclosure 문구.

**Creatrip 제휴 링크 검증** — `Place.bookingUrl`이 진짜 spot 페이지(`/en/spot/13165`)인지, 아직 안 채워진 홈 URL인지는 `lib/creatrip.ts#hasCreatripListing()`으로 판별한다. 실제 spot URL을 채우는 건 자동화하지 않는다: `scripts/resolve-creatrip-links.mjs`(`npm run resolve:creatrip`)가 `src/data/mock.ts`의 각 장소 이름+주소로 Gemini(Google Search grounding)에 물어 creatrip.com 페이지를 찾고, 모델 답변이 실제 grounding 출처에도 나오는 것만 "verified"로 `scripts/output/creatrip-links.json`에 남긴다 — mock.ts는 스크립트가 직접 고치지 않고, verified 결과만 사람이 검토해서 수동 반영한다.

**Curator 프로필** (`pages/CuratorProfilePage.tsx`, `/curator/:id`) — `services/places.ts`의 `fetchCreatorById` / `fetchCreatorPicksByCreatorId`로 큐레이터 정보(아바타·bio·소셜 링크)와 그 큐레이터가 큐레이션한 장소 목록(`PlaceCard`)을 보여준다. Map 탭 "Curated by Creators" 스트립에서 진입.

**Find My Match 결과의 광고 카드** (`ExplorePage.tsx`) — 매치 점수로 정해진 3개 결과(YOUR MATCH 등)의 순위는 절대 안 바꾸고, 같은 카테고리에서 `hasCreatripListing()`이 true면서 이미 매치된 3곳과 겹치지 않는 장소 중 rating이 가장 높은 곳을 별도의 `SponsoredPlaceCard`("광고 · 추천")로 결과 리스트 맨 위에 추가로 보여준다. 해당하는 장소가 없으면 아무것도 안 뜬다.

**커뮤니티** (`CommunityPage.tsx`, `PostDetailPage.tsx`, `services/community.ts`) — Supabase가 설정돼 있으면 `community_posts`/`post_likes`/`post_comments` 테이블을 쓰고, 아니거나 실패하면 `localStorage`(`lib/localCommunityStore.ts`) + `mockCommunityPosts`로 폴백. 글쓰기, 좋아요/취소, 댓글, 본인 게시글/댓글 삭제까지 된다(전부 로그인 필요). 팔로우는 아직 없음.

**My Map** (`hooks/useSavedPlaces.ts`) — 장소 id 배열, `miyeon_my_map`. 서버 테이블 없음.

---

## 7. 도메인 모델 (`src/types.ts`)

| 타입 | 의미 |
|---|---|
| `BeautyCategory` | skin, face, hair, nails, makeup |
| `QuizAnswers` | 퀴즈 한 바퀴 |
| `Place` | 지도/상세 장소. `medicalTourismMatch`, `nearbyWellness`, `source` |
| `Treatment` | 시술. `placeId`로 Place에 붙음 |
| `MatchResult` | 시술 + 장소 + 점수 + reasons |
| `UserSession` | 로그인 여부, user, optional creator |
| `MedicalTourismMatch` | KTO 인증 기관 배지용 |
| `WellnessSpot` | 근처 웰니스 핀 (현재 mock) |
| `Creator` | 큐레이터 프로필(bio, avatar, 소셜 링크, picks_count) |
| `CreatorPick` | 큐레이터가 고른 장소 1건(장소 참조 + 코멘트) |

매퍼: `lib/mappers.ts` (Supabase row → Place/Creator/Session).

---

## 8. 기능 × 레이어

| 기능 | UI | Hook / 상태 | Service | 외부 |
|---|---|---|---|---|
| 데모 로그인 | Auth modal, header | `useAuth` | `signInAsDemo` | `localStorage` |
| Google 로그인 | Auth modal | `useAuth` | `signInWithGoogle` | Supabase OAuth |
| 퀴즈 → Top 3 | Explore, ResultCard | 페이지 state | `discoverPlaces` + `getMatches` | Google, KTO |
| 카테고리 장소 | Map 필터, 핀 | — | `fetchPlaces` → `discoverAll` | Google, KTO |
| 지도 검색 | MapView 검색창 | 로컬 debounce | `searchPlacesByCategory` | Google |
| Map 리스트뷰 · 광고 | `PlaceListView` | — | `fetchPlaces`, `hasCreatripListing` | — |
| 의료관광 배지 | Place detail, ResultCard | — | KTO `detailMdclTursm` 머지 | KTO |
| 웰니스 핀 | Map, Place detail | — | mock `nearbyWellness` | (미연동) |
| 저장 | 상세/맵 버튼 | `useSavedPlaces` | — | `localStorage` |
| 커뮤니티 | CommunityPage, PostDetailPage | — | `services/community.ts` | Supabase 또는 `localStorage` |
| 큐레이터 프로필 | CuratorProfilePage | — | `fetchCreatorById`/`fetchCreatorPicksByCreatorId` | Supabase 또는 mock |
| 예약 CTA + 광고 | Result / Place / Treatment | — | `bookingUrl` / `lib/creatrip.ts` | 외부 링크(제휴) |
| 하단 탭바(모바일) | `BottomNav` | — | — | — |

---

## 9. 환경 변수

| 변수 | 위치 | 용도 |
|---|---|---|
| `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` | 브라우저 | Google OAuth |
| `VITE_MAPTILER_API_KEY` | 브라우저 | 지도 타일 |
| `KTO_SERVICE_KEY` | Vite 서버 | 의료관광 Open API |
| `GOOGLE_PLACES_API_KEY` | Vite 서버 | Places API (New) |
| `GEMINI_API_KEY` | Vite 서버 | Gemini + Google Search grounding (장소 상세 "Get latest info", Creatrip 링크 검증 스크립트, 선택) |

전부 비어 있으면: 데모 로그인 + mock 장소 + Carto 지도.

---

## 10. 의도적으로 빠져 있는 것

- 커뮤니티 팔로우 (글쓰기/좋아요/댓글/삭제는 있음)
- Map 탭의 hair/nails/makeup (타입·퀴즈·discovery엔 있지만 `ENABLED_MAP_CATEGORIES`로 지도만 skin/face로 제한)
- `WellnessTursmService` 실시간 연동
- 시술 마스터 DB — 라이브 장소는 카테고리당 합성 Treatment 1개
- 정적 배포용 프록시 — `npm run dev` / `vite preview`에서만 `/api/*` 동작
- 실제 LLM 랭커 — `match.ts` 공식만
- `creators`/`creator_picks`/`places`/`treatments` 테이블의 SQL 스키마 파일(`supabase/`에는 `community_schema.sql`, `leads_schema.sql`만 있음) — 라이브 프로젝트에 이미 있다고 가정하고 코드가 조회한다
