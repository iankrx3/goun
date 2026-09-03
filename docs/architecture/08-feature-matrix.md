[← 목차](README.md)

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
