---
title: "condenser_api.list_proposals"
description: "지정된 생성자 또는 시작 날짜부터 모든 프로포절 (제안)을 반환합니다. 파라미터: start:array; limit:int; order:string; order_direction:string; status:string"
outline: [2, 3]
---

# condenser_api.list_proposals

## Purpose

지정된 생성자 또는 시작 날짜부터 모든 프로포절 (제안)을 반환합니다.  파라미터: `start:array`; `limit:int`; `order:string`; `order_direction:string`; `status:string`

* `start`는 `order`에 따라 달라집니다 (아래 참고)
  * `creator` - 프로포절의 생성자  (계정 이름 문자열)
  * `start_date` - 프로포절의 시작 날짜 (날짜 문자열)
  * `end_date` - 프로포절의 종료 날짜 (날짜 문자열)
  * `total_votes` - 프로포절의 총 투표 수 (int)
* `limit`는 최대 1000입니다.
* `order`는 다음 중 하나:
  * `by_creator` - 프로포절 생성자 순
  * `by_start_date` - 프로포절 시작 날짜 순
  * `by_end_date` - 프로포절 종료 날짜 순
  * `by_total_votes` - 프로포절 총 투표 수 순
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
| `[""]` | 10 | `by_creator` | `ascending` | `active` | active 상태의 프로포절 10개를, 생성자 순 오름차순으로 나열합니다 |
| `["2019-08-07T16:54:03"]` | 1000 | `by_start_date` | `ascending` | `inactive` | 2019-08-07T16:54:03 이후의, inactive 상태 프로포절 1000개를, 시작 날짜 순 오름차순으로 나열합니다 |
| `["a"]` | 1 | `by_creator` | `ascending` | `expired` | "a"로 시작하는 계정 중, expired 상태 프로포절 1개를, 생성자 순 오름차순으로 나열합니다 |
| `["alice"]` | 10 | `by_creator` | `ascending` | `all` | alice의, 모든 상태 프로포절 10개를, 생성자 순 오름차순으로 나열합니다 |
| `[""]` | 1000 | `by_creator` | `ascending` | `votable` | votable 상태 프로포절 1000개를, 생성자 순 오름차순으로 나열합니다 |
| `[10]` | 1000 | `by_total_votes` | `ascending` | `votable` | 최소 10표 이상 가진, votable 상태 프로포절 1000개를, 생성자 순 오름차순으로 나열합니다 |

함께 보기: datbase_api.list_proposals

## Parameters

<div class="code-card code-card-params">
<div class="code-card-title">PARAMETERS</div>

```json
[
  [],
  0,
  "by_name",
  "ascending",
  "all"
]
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
    "method": "condenser_api.list_proposals",
    "params": [
      [
        ""
      ],
      10,
      "by_creator",
      "ascending",
      "active"
    ],
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
    "method": "condenser_api.list_proposals",
    "params": [
      [
        "2019-08-07T16:54:03"
      ],
      1000,
      "by_start_date",
      "ascending",
      "inactive"
    ],
    "id": 1
  }'
```

</div>

### Example 3

<div class="code-card code-card-example">
<div class="code-card-title">BASH</div>

```bash
curl -s https://api.steemit.com \
  -H 'Content-Type: application/json' \
  --data-binary '{
    "jsonrpc": "2.0",
    "method": "condenser_api.list_proposals",
    "params": [
      [
        "a"
      ],
      1,
      "by_creator",
      "ascending",
      "expired"
    ],
    "id": 1
  }'
```

</div>

### Example 4

<div class="code-card code-card-example">
<div class="code-card-title">BASH</div>

```bash
curl -s https://api.steemit.com \
  -H 'Content-Type: application/json' \
  --data-binary '{
    "jsonrpc": "2.0",
    "method": "condenser_api.list_proposals",
    "params": [
      [
        "alice"
      ],
      10,
      "by_creator",
      "ascending",
      "all"
    ],
    "id": 1
  }'
```

</div>

### Example 5

<div class="code-card code-card-example">
<div class="code-card-title">BASH</div>

```bash
curl -s https://api.steemit.com \
  -H 'Content-Type: application/json' \
  --data-binary '{
    "jsonrpc": "2.0",
    "method": "condenser_api.list_proposals",
    "params": [
      [
        ""
      ],
      1000,
      "by_creator",
      "ascending",
      "votable"
    ],
    "id": 1
  }'
```

</div>

### Example 6

<div class="code-card code-card-example">
<div class="code-card-title">BASH</div>

```bash
curl -s https://api.steemit.com \
  -H 'Content-Type: application/json' \
  --data-binary '{
    "jsonrpc": "2.0",
    "method": "condenser_api.list_proposals",
    "params": [
      [
        10
      ],
      1000,
      "by_total_votes",
      "ascending",
      "votable"
    ],
    "id": 1
  }'
```

</div>

## Response

<div class="code-card code-card-response">
<div class="code-card-title">RESPONSE</div>

```json
[
  {
    "id": 0,
    "proposal_id": "1103806595072",
    "creator": "alice",
    "receiver": "bob",
    "start_date": "2019-07-01T00:00:00",
    "end_date": "2019-08-01T23:59:59",
    "daily_pay": "4800.000 SBD",
    "subject": "My Proposal",
    "permlink": "creator-proposal-permlink",
    "total_votes": "77351826710",
    "status": "active"
  }
]
```

</div>
