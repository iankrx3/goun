[← 목차](README.md)

## 4. 매칭 (Explore)

| 레이어 | 파일 | 기능 |
|---|---|---|
| UI | `ExplorePage.tsx` | Home → Category(Treatments/Salon/Products) → Skin/Face → WHAT → VIBE → Constraints → AI 전환 → Top 3 |
| 퀴즈 카피 | `data/quiz.ts` | 카테고리별 concern, vibe 쌍(Subtle/Dramatic·Fast/Long-term·Needles), 여행기간/다운타임/예산 |
| 위젯 | `src/components/quiz/ModeSelect.tsx`, `CategoryRadial.tsx`, `PairChoice.tsx`, `AITransition.tsx`, `src/components/explore/ResultCard.tsx` | 카테고리 선택, 시술 선택 UI, 로딩, 매치 카드. `PairChoice`는 두 선택지 사이에 "OR" 배지를 얹어 이진 선택임을 드러낸다 |
| 스코러 | `services/match.ts` | 가중 합 (Concern/Result/Downtime/Budget/Timing/Location/Foreigner/Vibe). 상위 3개 |

흐름: 카테고리(Skin/Face)로 `discoverPlaces()` → 합성 시술 점수 → 실패 시 mock 시술. Treatments만 구현되어 있고 Salon/Products는 "Coming soon" 카드(`src/components/explore/ProductCommerce.tsx`)로만 존재한다.

가중치: Concern 0.25, Result 0.05, Downtime 0.15, Budget 0.15, Timing 0.15, Location 0.10, Foreigner 0.05, Vibe 0.10.

English-friendly 여부는 이제 항상 체크된 것으로 간주한다 (opt-in 체크박스 제거). KTO 매치면 Result 카드에 의료관광 한 줄을 붙인다.

LLM은 없다. `match.ts`가 투명한 클라이언트 스코러다.
