---
title: Steem DAO
description: Steem DAO — Steem Proposal System 뒤에서 온체인 금고와 프로포절(제안) 자금을 담당하는 메커니즘
---

# Steem DAO

Steem DAO는 2019년 8월 Hardfork 21에서 도입된 **Steem Proposal System (SPS, Steem 제안 시스템)** 뒤에서 동작하는 온체인 자금 조달 메커니즘입니다. 금고 계정인 `@steem.dao`와 **프로포절(제안, proposal)** 묶음 — 블록체인에 저장되고 스테이크홀더가 자신의 스테이크로 투표하며 매일 금고에서 스팀 달러 (SBD)로 지급되는 자금 요청 — 으로 구성됩니다.

프로포절은 체인이 개발과 인프라 작업에 자금을 대는 방식입니다. 누구나 프로포절을 만들 수 있고, 스테이크가 지지 규모를 결정하며, 금고는 스테이크홀더가 충분히 높게 랭킹을 매긴 프로포절에 지급합니다.

## 동작 방식

- **생성** — `create_proposal` 오퍼레이션이 프로포절을 체인에 저장합니다. 프로포절에는 생성자(creator)와 **수신자(receiver)** 계정(지급을 받는 주체), 시작일과 종료일, SBD로 표시되는 일일 보상, 그리고 해당 프로포절을 설명하는 토론 포스트를 가리키는 subject와 퍼머링크(permlink)가 있습니다.
- **투표** — 계정은 `update_proposal_votes` 오퍼레이션으로 프로포절에 투표(찬성 또는 반대)합니다. 투표 파워는 위트니스 (witness) 투표와 마찬가지로 스테이크 가중치가 적용되며, 각 프로포절은 베스팅 지분 (VESTS) 단위의 `total_votes` 값을 누적합니다.
- **일일 자금 지원** — 매일 활성 프로포절이 `total_votes` 순으로 랭킹이 매겨지고, 그날의 프로포절 예산이 소진될 때까지 순위 순서대로 자금이 지원됩니다. 예산 밖의 순위를 기록한 프로포절은 그날 아무것도 받지 못합니다.
- **Return Proposal (반환 프로포절)** — id 0 프로포절(@gtg의 "Return Proposal")은 오랜 관례입니다. 매우 큰 `daily_pay`를 갖고 있으며 찬성 상태로 유지되어, 그날 예산의 잔여분을 금고로 되돌려 보냅니다. 실제로는 지출 상한 역할을 합니다. Return Proposal과 작업 프로포절 사이에서 투표를 이동시키는 것으로 DAO가 매일 실제로 지출하는 금액이 결정됩니다.
- **제거** — 진행 중인 프로포절은 생성자가 `remove_proposal` 오퍼레이션으로 제거할 수 있으며, 투표는 언제든 추가하거나 취소할 수 있습니다.

## 금고

금고는 `@steem.dao` 계정입니다. 금고에는 미지출 예산 — 일일 인플레이션의 일부와 Return Proposal이 반환한 몫 — 이 보관되며, 스테이크홀더가 유입액보다 적게 쓰는 쪽에 투표하면 시간이 지남에 따라 금고는 늘어납니다. 2026년 11월 기준 금고에는 약 **259만 SBD**가 보관되어 있습니다.

실시간으로 조회해 보려면:

```bash
curl -sS -X POST https://api.steemit.com \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"condenser_api.get_accounts","params":[["steem.dao"]],"id":1}'
```

## 프로포절 조회

id로 특정 프로포절을 가져오려면:

```bash
curl -sS -X POST https://api.steemit.com \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"condenser_api.find_proposals","params":[[0,1,2]],"id":1}'
```

각 프로포절 객체에는 `proposal_id`, `creator`, `receiver`, `start_date`, `end_date`, `daily_pay`, `subject`, `permlink`, `total_votes`가 담겨 있습니다. 상태별로 정렬·필터할 수 있는 전체 목록은 `list_proposals`를 통해 조회할 수 있고, `total_votes` 뒤에 있는 개별 투표는 `list_proposal_votes`가 나열해 줍니다.

## 라이프사이클

프로포절은 `start_date`에 **활성** 상태가 되고, 활성 상태를 유지하며 일일 예산 안의 순위에 머무는 동안 자금을 지원받다가, `end_date`에 **만료** 상태가 됩니다. 가장 이른 프로포절들은 시스템이 2019년 8월 27일 출시된 때로 거슬러 올라갑니다 — id 0 프로포절인 Return Proposal은 종료일 2029년 12월 31일을 두고 아직 진행 중입니다.

## API 참조

| API | 목적 |
|---|---|
| [condenser_api.find_proposals](/api/condenser_api/find_proposals.html) | id로 프로포절 가져오기 |
| [condenser_api.list_proposals](/api/condenser_api/list_proposals.html) | 상태별 정렬·필터로 프로포절 목록 조회 |
| [condenser_api.list_proposal_votes](/api/condenser_api/list_proposal_votes.html) | `total_votes` 뒤의 투표 목록 조회 |
| [database_api.find_proposals](/api/database_api/find_proposals.html) | 플러그인 네이티브 변형 |
| [database_api.list_proposals](/api/database_api/list_proposals.html) | 플러그인 네이티브 변형 |
| [database_api.list_proposal_votes](/api/database_api/list_proposal_votes.html) | 플러그인 네이티브 변형 |

프로포절 생성, 투표, 제거(`create_proposal`, `update_proposal_votes`, `remove_proposal`)는 브로드캐스트 오퍼레이션입니다 — 서명된 트랜잭션이 필요하므로 단순 RPC 호출이 아니라 클라이언트 라이브러리의 브로드캐스트 워크플로에 속합니다.
