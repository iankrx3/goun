[← 목차](README.md)

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
