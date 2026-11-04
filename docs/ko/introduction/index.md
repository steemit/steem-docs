---
title: 소개
description: Steem 개발자 문서가 다루는 내용과 사이트의 구성 방식.
---

# 소개

이 사이트는 Steem 블록체인의 개발자 문서입니다. 그 핵심은 완전한 JSON-RPC API 레퍼런스로, 모든 API 메서드가 빌드 시점에 단일 YAML 진실 공급원으로부터 생성되는 전용 페이지를 가집니다 — 개별 주소로 접근할 수 있고, 전체 검색이 가능하며, 여덟 개 언어로 제공됩니다.

## 사이트 구성

사이드바는 사이트의 실제 구조를 반영합니다:

- **API 레퍼런스** — [condenser_api](/api/condenser_api/)와 AppBase API 네임스페이스(account history, follow, market history, witness 등)의 JSON-RPC 레퍼런스로, 모든 메서드가 전용 페이지에 문서화되어 있습니다. 생성된 [API 인덱스](/api/)에 모든 API와 그 메서드가 정리되어 있습니다.
- **가이드** — 작업 중심 문서: [소개](/introduction/)(이 페이지), 커뮤니티 [퍼블릭 노드](/quickstart/) 목록을 담은 [빠른 시작](/quickstart/) 가이드, Steem 용어 [용어집](/glossary/), 그리고 [리소스](/resources/) 디렉터리([테스트넷](/testnet/) 섹션은 아직 준비 중).
- **서비스** — 체인 주변 서비스의 문서: 이미지 서비스 [ImageHoster](/services/imagehoster.html), [Jussi](/services/jussi.html)(문서 준비 중), [Steem DAO](/services/steem-dao.html).

## 언어

API 레퍼런스는 여덟 개 언어 — English, 简体中文, Русский, Français, Deutsch, Italiano, Español, 한국어 — 로 제공됩니다. 상단 내비게이션 바의 언어 메뉴에서 전환할 수 있습니다. 가이드 섹션은 현재 소개와 빠른 시작 두 페이지만 한국어로 제공되며, 나머지 페이지는 영어입니다.

## 외부 리소스

- [github.com/steemit](https://github.com/steemit) — Steem의 GitHub 조직으로, 블록체인 노드 소프트웨어([steemit/steem](https://github.com/steemit/steem))와 관련 저장소의 중심지입니다.
- [steemit.com FAQ](https://steemit.com/faq.html) — Steem, 그 토큰, 그리고 거버넌스에 대한 자주 묻는 질문의 답변.
- [steem-docs](https://github.com/steemit/steem-docs) — 이 사이트의 소스입니다. 오류나 누락을 발견하면 issue를 열거나 pull request를 보내 주세요.
