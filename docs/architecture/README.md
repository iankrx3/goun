# Miyeon 아키텍처별 기능 설명

Vite + React SPA. 서버는 Vite 개발/프리뷰 프록시(및 Vercel 배포용 `api/`)뿐이고, 나머지 로직은 브라우저에서 돌아간다.

```
[브라우저]
  pages / components          UI, 라우팅
  hooks                       세션 · 저장 상태
  services                    인증 · 장소 조회 · 매칭 · 디스커버리
  data / types                퀴즈 카피, 카테고리 맵, mock, 도메인 모델
       │  /api/*
[Vite 프록시] plugins/miyeon-api-proxy.ts   (로컬 개발/프리뷰)
[Vercel 함수] api/**/*.ts                    (배포)
       │  둘 다 shared/apiProxy.ts의 상수를 공유
  data.go.kr MdclTursmService (KTO 의료관광)
  places.googleapis.com      (Google Places API New)
  generativelanguage.googleapis.com (optional) Gemini + Google Search grounding
  (optional) Supabase Auth
```

실패 시 항상 mock으로 연다. 키가 없어도 Explore / Map / 데모 로그인은 동작한다.

## 목차

1. [셸 · 라우팅](01-shell-routing.md)
2. [인증](02-auth.md)
3. [장소 디스커버리 엔진](03-discovery-engine.md)
4. [매칭 (Explore)](04-matching.md)
5. [맵](05-map.md)
6. [상세 · 커뮤니티 · 저장](06-detail-community-saved.md)
7. [도메인 모델](07-domain-model.md)
8. [기능 × 레이어](08-feature-matrix.md)
9. [환경 변수](09-env-vars.md)
10. [의도적으로 빠져 있는 것](10-known-gaps.md)
