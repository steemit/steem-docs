---
title: "database_api.list_proposal_votes"
description: "지정된 투표자 또는 proposal.id부터 모든 프로포절 (제안) 투표를 반환합니다. 파라미터: start:array; limit:int; order:string; order_direction:string; status:string"
outline: [2, 3]
---

# database_api.list_proposal_votes

## Purpose

지정된 투표자 또는 `proposal.id`부터 모든 프로포절 (제안) 투표를 반환합니다.  파라미터: `start:array`; `limit:int`; `order:string`; `order_direction:string`; `status:string`

* `start`는 `order`에 따라 달라집니다 (아래 참고)
  * `voter` - 프로포절의 투표자  (계정 이름 문자열)
  * `proposal.id` - 프로포절의 id (int)
* `limit`는 최대 1000입니다.
* `order`는 다음 중 하나:
  * `by_voter_proposal` - 프로포절 투표자 순
  * `by_proposal_voter` - `proposal.id` 순
* `order_direction`은 다음 중 하나:
  * `ascending`
  * `descending`
* `status`
  * `all`
  * `inactive`
  * `active`
  * `expired`
  * `votable`

| `start` (array) | `limit` (int) | `order` (string) | `order_direction` (string) | `status` (string) | |
|-------------------|-|-|-|-|-|
| `["alice"]` | 10 | `by_voter_proposal` | `ascending` | `active` | active 상태의 프로포절 10개를, 투표자 순 오름차순으로 나열합니다 |
| `[10]` | 1000 | `by_proposal_voter` | `ascending` | `votable` | 프로포절 10에 대한 투표 1000개를, `proposal.id` 순 오름차순으로 나열합니다 |

함께 보기: Paginated API Methods

## Parameters

<div class="code-card code-card-params">
<div class="code-card-title">PARAMETERS</div>

```json
{
  "start": null,
  "limit": 0,
  "order": "by_name",
  "order_direction": "ascending",
  "status": "all"
}
```

</div>

## Example

### Example 1

<div class="code-card code-card-example">
<div class="code-card-title">BASH</div>

```bash
curl -s https://api.steemit.com \
  -H 'Content-Type: application/json' \
  --data-binary '{
    "jsonrpc": "2.0",
    "method": "database_api.list_proposal_votes",
    "params": {
      "start": [
        ""
      ],
      "limit": 10,
      "order": "by_voter_proposal",
      "order_direction": "ascending",
      "status": "active"
    },
    "id": 1
  }'
```

</div>

### Example 2

<div class="code-card code-card-example">
<div class="code-card-title">BASH</div>

```bash
curl -s https://api.steemit.com \
  -H 'Content-Type: application/json' \
  --data-binary '{
    "jsonrpc": "2.0",
    "method": "database_api.list_proposal_votes",
    "params": {
      "start": [
        0
      ],
      "limit": 10,
      "order": "by_proposal_voter",
      "order_direction": "ascending",
      "status": "active"
    },
    "id": 1
  }'
```

</div>

## Response

<div class="code-card code-card-response">
<div class="code-card-title">RESPONSE</div>

```json
{
  "proposal_votes": [
    {
      "id": 0,
      "voter": "charlie",
      "proposal": {
        "id": 0,
        "proposal_id": 0,
        "creator": "alice",
        "receiver": "bob",
        "start_date": "2019-07-01T00:00:00",
        "end_date": "2019-08-01T23:59:59",
        "daily_pay": {
          "amount": "4800000",
          "precision": 3,
          "nai": "@@000000013"
        },
        "subject": "My Proposal",
        "permlink": "creator-proposal-permlink",
        "total_votes": "77351826710",
        "status": "active"
      }
    }
  ]
}
```

</div>
