[← 목차](README.md)

## 6. 상세 · 커뮤니티 · 저장

**장소 상세** (`PlaceDetailPage.tsx`)

- 사진, 별점, Why people like it, 시술 목록
- 경로찾기 링크 (Google/Naver/Kakao Maps, `lib/directions.ts`) — 좌표 + `googlePlaceId` 기반, 새 탭
- `NearbyWellnessSection` · `MedicalTourismSection` (`src/components/badges/KtoBadges.tsx`) — 데이터 없으면 안 그림 (fail-silent)
- `GroundedInfo` (`src/components/place/GroundedInfo.tsx`) — "Get latest info" 버튼. 클릭 시에만 `services/gemini.ts` → `/api/gemini/ground` 호출, Google Search grounding으로 KTO/Places에 없는 최신 정보(영업시간 변경, 휴업 등) 요약 + 출처 링크. `GEMINI_API_KEY` 없으면 버튼 자체가 안 보임 (fail-silent)
- Save to My Map, Creatrip 제휴 링크(또는 Google website) — `lib/creatrip.ts`가 `utm_source`/`aff_id` 쿼리 파라미터를 자동으로 붙이고, 버튼 아래에 커미션 disclosure 문구(`CREATRIP_DISCLOSURE`)를 보여준다(Creatrip 제휴 정책 2번 항목).

**시술 상세** (`TreatmentDetailPage.tsx`) — 가격대, 다운타임, 강도, 연결된 장소. Creatrip CTA 아래 동일한 disclosure 문구.

**Creatrip 제휴 링크 검증** — `Place.bookingUrl`이 진짜 spot 페이지(`/en/spot/13165`)인지, 아직 안 채워진 홈 URL인지는 `lib/creatrip.ts#hasCreatripListing()`으로 판별한다. 실제 spot URL을 채우는 건 자동화하지 않는다: `scripts/resolve-creatrip-links.mjs`(`npm run resolve:creatrip`)가 `src/data/mock.ts`의 각 장소 이름+주소로 Gemini(Google Search grounding)에 물어 creatrip.com 페이지를 찾고, 모델 답변이 실제 grounding 출처에도 나오는 것만 "verified"로 `scripts/output/creatrip-links.json`에 남긴다 — mock.ts는 스크립트가 직접 고치지 않고, verified 결과만 사람이 검토해서 수동 반영한다.

**Curator 프로필** (`pages/CuratorProfilePage.tsx`, `/curator/:id`) — `services/places.ts`의 `fetchCreatorById` / `fetchCreatorPicksByCreatorId`로 큐레이터 정보(아바타·bio·소셜 링크)와 그 큐레이터가 큐레이션한 장소 목록(`PlaceCard`)을 보여준다. Map 탭 "Curated by Creators" 스트립에서 진입.

**Find My Match 결과의 광고 카드** (`ExplorePage.tsx`) — 매치 점수로 정해진 3개 결과(YOUR MATCH 등)의 순위는 절대 안 바꾸고, 같은 카테고리에서 `hasCreatripListing()`이 true면서 이미 매치된 3곳과 겹치지 않는 장소 중 rating이 가장 높은 곳을 별도의 `SponsoredPlaceCard`("광고 · 추천")로 결과 리스트 맨 위에 추가로 보여준다. 해당하는 장소가 없으면 아무것도 안 뜬다.

**커뮤니티** (`CommunityPage.tsx`, `PostDetailPage.tsx`, `services/community.ts`) — Supabase가 설정돼 있으면 `community_posts`/`post_likes`/`post_comments` 테이블을 쓰고, 아니거나 실패하면 `localStorage`(`lib/localCommunityStore.ts`) + `mockCommunityPosts`로 폴백. 글쓰기, 좋아요/취소, 댓글, 본인 게시글/댓글 삭제까지 된다(전부 로그인 필요). 팔로우는 아직 없음.

**My Map** (`hooks/useSavedPlaces.ts`) — 장소 id 배열, `miyeon_my_map`. 서버 테이블 없음.
