---
title: "database_api.list_escrows"
description: "에스크로 (escrow) 목록을 반환합니다. 파라미터: start:array; limit:int; order:string"
outline: [2, 3]
---

# database_api.list_escrows

<p class="api-badges"><span class="badge badge-since">since HF14</span></p>

## Purpose

에스크로 (escrow) 목록을 반환합니다.  파라미터: `start:array`; `limit:int`; `order:string`

* `start`는 `order`에 따라 달라집니다 (아래 참고)
* `limit`는 최대 1000입니다.
* `order`는 다음 중 하나:
  * `by_from_id` - id 순
    * `start`는 `account`, `escrow_id` 두 값으로 이루어진 배열입니다
  * `by_ratification_deadline` - 승인 마감일 (ratification deadline) 순
    * `start`는 `is_approved`, `timestamp`, `escrow_id` 세 값으로 이루어진 배열입니다

| `start` (array) | `limit` (int) | `order` (string) | |
|----------------------------|---------------|-|
| `["alice", 99]` | 10 | `"by_from_id"` | 처음 10개 요청을, id 순으로 조회합니다 |
| `[true, "1960-01-01T00:00:00", 99]` | 10 | `"by_ratification_deadline"` | 처음 10개 요청을, 승인 마감일 순으로 조회합니다 |

함께 보기: Paginated API Methods

## Parameters

<div class="code-card code-card-params">
<div class="code-card-title">PARAMETERS</div>

```json
{
  "start": null,
  "limit": 0,
  "order": "by_name"
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
    "method": "database_api.list_escrows",
    "params": {
      "start": [
        "",
        0
      ],
      "limit": 10,
      "order": "by_from_id"
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
    "method": "database_api.list_escrows",
    "params": {
      "start": [
        true,
        "1970-01-01T00:00:00",
        0
      ],
      "limit": 10,
      "order": "by_ratification_deadline"
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
  "escrows": [
    {
      "id": 158,
      "escrow_id": 1,
      "from": "addicttolife",
      "to": "fundition.help",
      "agent": "ongame",
      "ratification_deadline": "2018-11-23T17:31:26",
      "escrow_expiration": "2018-11-24T17:31:26",
      "sbd_balance": {
        "amount": "0",
        "precision": 3,
        "nai": "@@000000013"
      },
      "steem_balance": {
        "amount": "4832",
        "precision": 3,
        "nai": "@@000000021"
      },
      "pending_fee": {
        "amount": "0",
        "precision": 3,
        "nai": "@@000000021"
      },
      "to_approved": true,
      "agent_approved": true,
      "disputed": false
    }
  ]
}
```

</div>
