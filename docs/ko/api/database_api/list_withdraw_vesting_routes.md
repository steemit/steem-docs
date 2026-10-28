---
title: "database_api.list_withdraw_vesting_routes"
description: "베스팅 인출 경로(vesting withdraw route) 목록을 반환합니다. 파라미터: start:array; limit:int; order:string"
outline: [2, 3]
---

# database_api.list_withdraw_vesting_routes

## Purpose

베스팅 인출 경로(vesting withdraw route) 목록을 반환합니다.  파라미터: `start:array`; `limit:int`; `order:string`

* `start`는 `order`에 따라 달라집니다(아래 참조)
* `limit`는 최대 1000입니다.
* `order`는 다음 중 하나입니다:
  * `by_withdraw_route` - 인출 경로 기준 정렬
    * `start`는 두 값(`from_account`, `to_account`)의 배열
  * `by_destination` - 목적지 기준 정렬
    * `start`는 두 값(`to_account`, `route_id`)의 배열

| `start` (array) | `limit` (int) | `order` (string) | |
|----------------------------|---------------|-|
| `["temp", ""]` | 10 | `"by_withdraw_route"` | 첫 10개 경로를 인출 경로 기준 정렬로 조회합니다 |
| `["", 0]` | 10 | `"by_destination"` | 첫 10개 경로를 목적지 기준 정렬로 조회합니다 |

추가 참조: Paginated API Methods

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
    "method": "database_api.list_withdraw_vesting_routes",
    "params": {
      "start": [
        "temp",
        ""
      ],
      "limit": 10,
      "order": "by_withdraw_route"
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
    "method": "database_api.list_withdraw_vesting_routes",
    "params": {
      "start": [
        "",
        0
      ],
      "limit": 10,
      "order": "by_destination"
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
  "routes": [
    {
      "id": 39503,
      "from_account": "temperature",
      "to_account": "luckdiver",
      "percent": 10000,
      "auto_vest": false
    }
  ]
}
```

</div>
