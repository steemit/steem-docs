---
title: "database_api.list_witness_votes"
description: "위트니스 (witness) 투표 목록을 반환합니다. 파라미터: start:array; limit:int; order:string"
outline: [2, 3]
---

# database_api.list_witness_votes

## Purpose

위트니스 (witness) 투표 목록을 반환합니다.  파라미터: `start:array`; `limit:int`; `order:string`

* `start`는 `order`에 따라 달라집니다 (아래 참고)
* `limit`는 최대 1000입니다.
* `order`는 다음 중 하나:
  * `by_account_witness` - 계정 위트니스 순
    * `start`는 `account`, `witness` 두 값으로 이루어진 배열입니다
  * `by_witness_account` - 위트니스 계정 순
    * `start`는 `witness`, `account` 두 값으로 이루어진 배열입니다

| `start` (array) | `limit` (int) | `order` (string) | |
|----------------------------|---------------|-|
| `["", ""]` | 10 | `"by_withdraw_route"` | 처음 10개 투표를, 계정 위트니스 순으로 조회합니다 |
| `["", ""]` | 10 | `"by_destination"` | 처음 10개 투표를, 위트니스 계정 순으로 조회합니다 |

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
    "method": "database_api.list_witness_votes",
    "params": {
      "start": [
        "",
        ""
      ],
      "limit": 10,
      "order": "by_account_witness"
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
    "method": "database_api.list_witness_votes",
    "params": {
      "start": [
        "",
        ""
      ],
      "limit": 10,
      "order": "by_witness_account"
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
  "votes": [
    {
      "id": 428961,
      "witness": "aggroed",
      "account": "a-0magic"
    }
  ]
}
```

</div>
