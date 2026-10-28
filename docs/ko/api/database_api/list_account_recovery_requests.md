---
title: "database_api.list_account_recovery_requests"
description: "계정 복구 요청 목록을 반환합니다. 파라미터: start:string, limit:int, order:string"
outline: [2, 3]
---

# database_api.list_account_recovery_requests

<p class="api-badges"><span class="badge badge-since">since HF11</span></p>

## Purpose

계정 복구 요청 목록을 반환합니다.  파라미터: `start:string`, `limit:int`, `order:string`

* `limit`는 최대 1000입니다.
* `order`는 다음 중 하나입니다:
  * `by_account` - accont(계정) 이름 기준 정렬
  * `by_expiration` - 만료 기준 정렬

| `account` (string) | `limit` (int) | `order` (string) | |
|--------------------|-|
| `"steemit"` | 10 | `"by_account"` | "steemit"이라는 이름의 계정의 복구 요청을 계정 이름 기준으로 조회합니다. |
| `["1960-01-01T00:00:00"]` | 10 | `"by_expiration"`| 날짜의 복구 요청을 만료 기준으로 조회합니다. |

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
    "method": "database_api.list_account_recovery_requests",
    "params": {
      "start": "",
      "limit": 10,
      "order": "by_account"
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
    "method": "database_api.list_account_recovery_requests",
    "params": {
      "start": [
        "1960-01-01T00:00:00"
      ],
      "limit": 10,
      "order": "by_expiration"
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
  "requests": []
}
```

</div>
