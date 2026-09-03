[← 목차](README.md)

## 5. 맵

| 파일 | 기능 |
|---|---|
| `pages/MapPage.tsx` | 지도/리스트 뷰 토글, 선택 장소 시트, 상세 이동, Save |
| `src/components/map/MapView.tsx` | Leaflet, 카테고리/픽 필터, 검색(로컬 + 라이브 Google), 내 위치, 핀 |
| `src/components/map/PlaceListView.tsx` | 지도 대신 보는 스크롤형 장소 리스트 |
| `src/components/place/SponsoredPlaceCard.tsx` | "광고" 배지 + 강조 테두리로 감싼 `PlaceCard` (리스트 최상단 / Explore 결과에서 재사용) |
| `data/mapCategories.ts` | Map 탭에 노출할 카테고리 목록(`ENABLED_MAP_CATEGORIES`) |

- **카테고리 제한**: 지금은 `skin`/`face`만 지도에 뜬다(`ENABLED_MAP_CATEGORIES`). hair/nails/makeup은 타입·퀴즈·discovery까지는 다 있지만 Map 탭에서만 걸러진다 — 나중에 켜려면 이 상수와 `CATEGORY_FILTERS` 칩 배열만 되돌리면 됨.
- 뷰티 핀: Miyeon Sub1 (Dusty Rose). 카테고리 아이콘.
- 웰니스 핀: Warm Taupe. mock `nearbyWellness`만.
- 타일: `VITE_MAPTILER_API_KEY` 있으면 MapTiler, 없으면 Carto Voyager.
- 데이터: `fetchPlaces()` / `fetchCreatorPicks()` (둘 다 skin/face로 필터링해서 state에 저장). 검색은 [§3.4](03-discovery-engine.md#34-지도-검색-searchplacesbycategory) 참고.
- **지도/리스트 토글**: `MapPage.tsx` 좌측 하단 버튼. 리스트뷰(`PlaceListView`)는 같은 skin/face 장소를 rating 내림차순으로 보여주고, `lib/creatrip.ts#hasCreatripListing()`이 true인(=실제 Creatrip spot 페이지가 검증된) 장소 중 하나를 최상단에 "광고 · 추천" 카드로, 나머지는 "광고" 배지만 붙여 표시한다. 제휴 페이지가 없는 장소는 그대로 배지 없이 보인다.
- **Curated by Creators** 스트립: 아바타를 누르면 지도 점프가 아니라 `/curator/:id` 큐레이터 프로필로 이동한다([§6](06-detail-community-saved.md)).
