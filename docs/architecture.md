# Goun 아키텍처별 기능 설명

Vite + React SPA. 서버는 Vite 개발/프리뷰 프록시뿐이고, 나머지 로직은 브라우저에서 돌아간다.

```
[브라우저]
  pages / components          UI, 라우팅
  hooks                       세션 · 저장 상태
  services                    인증 · 장소 조회 · 매칭 · 디스커버리
  data / types                퀴즈 카피, 카테고리 맵, mock, 도메인 모델
       │  /api/*
[Vite 프록시] plugins/goun-api-proxy.ts
       │
  data.go.kr MdclTursmService (KTO 의료관광)
  places.googleapis.com      (Google Places API New)
  (optional) Supabase Auth
```

실패 시 항상 mock으로 연다. 키가 없어도 Explore / Map / 데모 로그인은 동작한다.

---

## 1. 셸 · 라우팅

| 파일 | 역할 |
|---|---|
| `src/main.tsx` | React 루트, `BrowserRouter` |
| `src/App.tsx` | 헤더, 라우트, 로그인 모달 |
| `src/components/NavHeader.tsx` | Explore / Map / Community 탭, Sign in·out |
| `src/index.css`, `tailwind.config.js` | Goun Rose / Warm Taupe 토큰, 폰트 |

**기능**

- `/` Explore 퀴즈 → Top 3
- `/map` 장소 핀 · 필터 · 검색
- `/community` 읽기 전용 피드
- `/place/:id` 장소 상세 (웰니스 · 의료관광 배지, 저장)
- `/treatment/:id` 시술 상세 · Creatrip 링크

로그인 여부로 라우트를 막지 않는다. 저장은 로그인 없이도 `localStorage`에 남는다.

---

## 2. 인증

| 레이어 | 파일 | 하는 일 |
|---|---|---|
| UI | `GoogleAuthModal.tsx` | Continue as demo / Continue with Google |
| Hook | `hooks/useAuth.ts` | 세션 hydrate, demo·Google·sign out |
| Service | `services/auth.ts` | demo `localStorage`, Google OAuth, return tab |
| Infra | `lib/supabase.ts` | `VITE_SUPABASE_*`가 있을 때만 클라이언트 생성 |

**Continue as demo**

- 유저: `Goun Demo` / `demo@goun.app`
- 키 `goun_mock_session`
- Supabase가 없어도 동작. 새로고침 유지. Sign out 시 삭제.

**Google**

- Supabase Auth `signInWithOAuth({ provider: 'google' })`
- 키가 없으면 모달이 안내만 하고 데모 로그인을 권한다.

---

## 3. 장소 디스커버리 엔진

카테고리(skin / face / hair / nails / makeup)를 Google Places + KTO 의료관광 결과로 바꿔 `Place` / `Treatment`를 만든다.

### 3.1 API 프록시

`plugins/goun-api-proxy.ts` — `vite.config.ts`의 `configureServer` / `configurePreviewServer`.

키는 `KTO_SERVICE_KEY`, `GOOGLE_PLACES_API_KEY` ( **`VITE_` 없음** ). 브라우저에 안 나간다.

| 프론트 | 업스트림 |
|---|---|
| `GET /api/health` | 키 장착 여부 `{ kto, google }` |
| `GET /api/kto/:op` | `https://apis.data.go.kr/B551011/MdclTursmService/:op` |
| `POST /api/places/search` | Places `searchNearby` / `searchText` |
| `GET /api/places/photo` | 사진 URI로 302. 이미지 URL에 Google 키 없음 |

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

### 3.4 조회 파사드 (`services/places.ts`)

순서: in-memory 카탈로그 → (있으면) Supabase 테이블 → `discoverAll()` → `src/data/mock.ts`.

Map · 상세 · 퀴즈가 같은 `Place.id`를 보게 카탈로그에 디스커버리 결과를 넣는다.

---

## 4. 매칭 (Explore)

| 레이어 | 파일 | 기능 |
|---|---|---|
| UI | `ExplorePage.tsx` | Home → WHAT → VIBE → Constraints → AI 전환 → Top 3 |
| 퀴즈 카피 | `data/quiz.ts` | 카테고리별 concern, vibe 쌍, 다운타임/예산 |
| 위젯 | `CategoryRadial`, `PairChoice`, `AITransition`, `ResultCard` | 선택 UI, 로딩, 매치 카드 |
| 스코러 | `services/match.ts` | PRD §9 가중 합. 상위 3개 |

흐름: 카테고리로 `discoverPlaces()` → 합성 시술 점수 → 실패 시 mock 시술.

가중치: Concern 0.25, Result 0.15, Downtime 0.15, Budget 0.15, Timing 0.15, Location 0.10, Foreigner 0.05.

`Near Me`면 퀴즈 끝에 geolocation을 origin으로 넘긴다. KTO 매치면 Result 카드에 의료관광 한 줄을 붙인다.

LLM은 없다. `match.ts`가 투명한 클라이언트 스코러다.

---

## 5. 맵

| 파일 | 기능 |
|---|---|
| `pages/MapPage.tsx` | 선택 장소 시트, 상세 이동, Save |
| `components/MapView.tsx` | Leaflet, 카테고리/픽 필터, 검색, 내 위치, 핀 |

- 뷰티 핀: Goun Rose. 카테고리 아이콘.
- 웰니스 핀: Warm Taupe. mock `nearbyWellness`만.
- 타일: `VITE_MAPTILER_API_KEY` 있으면 MapTiler, 없으면 Carto Voyager.
- 데이터: `fetchPlaces()` / `fetchCreatorPicks()`.

---

## 6. 상세 · 커뮤니티 · 저장

**장소 상세** (`PlaceDetailPage.tsx`)

- 사진, 별점, Why people like it, 시술 목록
- `NearbyWellnessSection` · `MedicalTourismSection` (`components/badges/KtoBadges.tsx`) — 데이터 없으면 안 그림 (fail-silent)
- Save to My Map, Creatrip(또는 Google website)

**시술 상세** (`TreatmentDetailPage.tsx`) — 가격대, 다운타임, 강도, 연결된 장소.

**커뮤니티** (`CommunityPage.tsx`) — `mockCommunityPosts` 읽기 전용. 글쓰기/좋아요/팔로우는 없음.

**My Map** (`hooks/useSavedPlaces.ts`) — 장소 id 배열, `goun_my_map`. 서버 테이블 없음.

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

매퍼: `lib/mappers.ts` (Supabase row → Place/Creator/Session).

---

## 8. 기능 × 레이어

| 기능 | UI | Hook / 상태 | Service | 외부 |
|---|---|---|---|---|
| 데모 로그인 | Auth modal, header | `useAuth` | `signInAsDemo` | `localStorage` |
| Google 로그인 | Auth modal | `useAuth` | `signInWithGoogle` | Supabase OAuth |
| 퀴즈 → Top 3 | Explore, ResultCard | 페이지 state | `discoverPlaces` + `getMatches` | Google, KTO |
| 카테고리 장소 | Map 필터, 핀 | — | `fetchPlaces` → `discoverAll` | Google, KTO |
| 의료관광 배지 | Place detail, ResultCard | — | KTO `detailMdclTursm` 머지 | KTO |
| 웰니스 핀 | Map, Place detail | — | mock `nearbyWellness` | (미연동) |
| 저장 | 상세/맵 버튼 | `useSavedPlaces` | — | `localStorage` |
| 커뮤니티 | CommunityPage | — | — | mock |
| 예약 CTA | Result / Place / Treatment | — | `bookingUrl` / Creatrip | 외부 링크 |

---

## 9. 환경 변수

| 변수 | 위치 | 용도 |
|---|---|---|
| `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` | 브라우저 | Google OAuth |
| `VITE_MAPTILER_API_KEY` | 브라우저 | 지도 타일 |
| `KTO_SERVICE_KEY` | Vite 서버 | 의료관광 Open API |
| `GOOGLE_PLACES_API_KEY` | Vite 서버 | Places API (New) |

전부 비어 있으면: 데모 로그인 + mock 장소 + Carto 지도.

---

## 10. 의도적으로 빠져 있는 것

- Creator 프로필 / Creator Map / 커뮤니티 쓰기
- `WellnessTursmService` 실시간 연동
- 시술 마스터 DB — 라이브 장소는 카테고리당 합성 Treatment 1개
- 정적 배포용 프록시 — `npm run dev` / `vite preview`에서만 `/api/*` 동작
- 실제 LLM 랭커 — `match.ts` 공식만
