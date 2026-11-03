---
title: 튜토리얼
description: Steem 공식 클라이언트 라이브러리를 위한 실습 튜토리얼과 사용 예제 — JavaScript/TypeScript용 steem-js와 Go용 steemgosdk.
---

# 튜토리얼

이 섹션은 두 개의 Steem 공식 클라이언트 라이브러리(client library)를 위한 실습 사용 예제를 모아 놓았습니다. 모든 예제는 각 라이브러리의 자체 문서에서 옮겨 왔으며, `https://api.steemit.com` 같은 공개 노드(node)에서 바로 실행해 볼 수 있습니다.

## 라이브러리

| 라이브러리 | 언어 | 패키지 / 모듈 | 저장소 |
|---------|----------|------------------|------------|
| steem-js | JavaScript / TypeScript | npm 패키지 `@steemit/steem-js` 1.2.4 | [steemit/steem-js](https://github.com/steemit/steem-js) |
| steemgosdk | Go | Go 모듈 `github.com/steemit/steemgosdk` | [steemit/steemgosdk](https://github.com/steemit/steemgosdk) |

두 라이브러리 모두 생성된 [API 레퍼런스](/ko/api/)가 메서드별로 문서화하는 동일한 JSON-RPC API를 사용합니다. 튜토리얼로 클라이언트 측 패턴을 익히고, API 레퍼런스로 각 메서드의 온와이어 세부 사항을 확인하세요.

## steem-js 페이지

- [빠른 시작](/ko/tutorials/steem-js/) - 설치, 브라우저 사용법, 설정(`config.set`, `api.setUrl`, `setOptions`, 여러 API 인스턴스), JSON-RPC 개요, API 라우팅, 엔드투엔드 사용 예제, TypeScript 지원과 오류 처리.
- [체인 데이터 읽기](/ko/tutorials/steem-js/read-api.html) - 모든 읽기 헬퍼: 태그 (tag), 블로그와 토론, 블록 (block), 전역 속성, 계정, 마켓, 투표, 콘텐츠, 위트니스 (witness), 그리고 로그인/팔로우 헬퍼와 오프라인 인증·포맷터·유틸리티.
- [브로드캐스트 오퍼레이션](/ko/tutorials/steem-js/broadcast.html) - `steem.broadcast` 오퍼레이션 전체 카탈로그, 프라미스/콜백 패턴, 멀티시그(multisig)와 트랜잭션 (transaction) 이진 직렬화.
- [서명된 호출과 서명 검증](/ko/tutorials/steem-js/signed-calls.html) - 인증된 `signedCall` 요청과 서명 검증 툴킷, 완전한 예제 가이드 포함.
- [RPC auth 테스트 마이그레이션](/ko/tutorials/steem-js/rpc-auth-migration.html) - `rpc-auth` 테스트 스위트를 steem-js로 옮긴 방법.

## steemgosdk 페이지

- [빠른 시작](/ko/tutorials/steemgosdk/) - 클라이언트 설정, 체인 읽기 API 예제, 키 생성 인증 예제, Steem URI 서명 예제.
- [브로드캐스트 오퍼레이션](/ko/tutorials/steemgosdk/broadcast.html) - 투표 (vote), 전송 (transfer), 댓글, 수혜자 (beneficiary)가 설정된 댓글 옵션, 다중 오퍼레이션 트랜잭션과 custom_json 브로드캐스트, 그리고 완전한 엔드투엔드 예제.
- [SignedCall API](/ko/tutorials/steemgosdk/signed-call.html) - Go에서 인증된 JSON-RPC 호출. steem-js의 서명된 호출과 상호 운용됩니다.

## 참고

- 튜토리얼은 현재 영어로만 제공되며, Guides 섹션과 같은 방침입니다.
- 예제는 각 라이브러리 문서에서 널리 알려진 테스트 키를 사용합니다. 프로덕션에서는 절대 사용하지 마십시오 — 인증 예제에서 보여주는 대로 자신만의 키를 생성하세요.
