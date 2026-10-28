---
title: "database_api.list_proposals"
description: "지정된 작성자(creator) 또는 시작 날짜부터 모든 프로포절을 반환합니다. 파라미터: start:array; limit:int; order:string; order_direction:string; status:string"
outline: [2, 3]
---

# database_api.list_proposals

## Purpose

지정된 작성자(creator) 또는 시작 날짜부터 모든 프로포절을 반환합니다.  파라미터: `start:array`; `limit:int`; `order:string`; `order_direction:string`; `status:string`

* `start`는 `order`에 따라 달라집니다(아래 참조)
  * `creator` - 프로포절의 작성자  (계정 이름 문자열)
  * `start_date` - 프로포절의 시작 날짜 (날짜 문자열)
  * `end_date` - 프로포절의 종료 날짜 (날짜 문자열)
  * `total_votes` - 프로포절의 총 투표 수 (int)
* `limit`는 최대 1000입니다.
* `order`는 다음 중 하나입니다:
  * `by_creator` - 프로포절 작성자 기준 정렬
  * `by_start_date` - 프로포절 시작 날짜 기준 정렬
  * `by_end_date` - 프로포절 종료 날짜 기준 정렬
  * `by_total_votes` - 프로포절 총 투표 수 기준 정렬
* `order_direction`은 다음 중 하나입니다:
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
| `[""]` | 10 | `by_creator` | `ascending` | `active` | active 상태의 프로포절 10개를 작성자 기준 오름차순으로 나열합니다 |
| `["2019-08-07T16:54:03"]` | 1000 | `by_start_date` | `ascending` | `inactive` | inactive 상태의 프로포절 1000개를 시작 날짜 기준 오름차순으로, 2019-08-07T16:54:03 이후부터 나열합니다 |
| `["a"]` | 1 | `by_creator` | `ascending` | `expired` | "a"로 시작하는 계정의 expired 상태 프로포절 1개를 작성자 기준 오름차순으로 나열합니다 |
| `["alice"]` | 10 | `by_creator` | `ascending` | `all` | alice의 모든 상태 프로포절 10개를 작성자 기준 오름차순으로 나열합니다 |
| `[""]` | 1000 | `by_creator` | `ascending` | `votable` | votable 상태의 프로포절 1000개를 작성자 기준 오름차순으로 나열합니다 |
| `[10]` | 1000 | `by_total_votes` | `ascending` | `votable` | 최소 10표 이상 있는 votable 상태의 프로포절 1000개를 작성자 기준 오름차순으로 나열합니다 |

추가 참조: Paginated API Methods

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
    "method": "database_api.list_proposals",
    "params": {
      "start": [
        ""
      ],
      "limit": 10,
      "order": "by_creator",
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
    "method": "database_api.list_proposals",
    "params": {
      "start": [
        "2019-08-07T16:54:03"
      ],
      "limit": 1000,
      "order": "by_start_date",
      "order_direction": "ascending",
      "status": "inactive"
    },
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
    "method": "database_api.list_proposals",
    "params": {
      "start": [
        "a"
      ],
      "limit": 1,
      "order": "by_creator",
      "order_direction": "ascending",
      "status": "expired"
    },
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
    "method": "database_api.list_proposals",
    "params": {
      "start": [
        "alice"
      ],
      "limit": 10,
      "order": "by_creator",
      "order_direction": "ascending",
      "status": "all"
    },
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
    "method": "database_api.list_proposals",
    "params": {
      "start": [
        ""
      ],
      "limit": 1000,
      "order": "by_creator",
      "order_direction": "ascending",
      "status": "votable"
    },
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
    "method": "database_api.list_proposals",
    "params": {
      "start": [
        10
      ],
      "limit": 1000,
      "order": "by_total_votes",
      "order_direction": "ascending",
      "status": "votable"
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
  "proposals": [
    {
      "id": 0,
      "proposal_id": "1103806595072",
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
  ]
}
```

</div>
