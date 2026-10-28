---
title: "database_api.list_change_recovery_account_requests"
description: "복구 계정 변경 요청 목록을 반환합니다. 파라미터: start:object, limit:int, order:string"
outline: [2, 3]
---

# database_api.list_change_recovery_account_requests

<p class="api-badges"><span class="badge badge-since">since HF11</span></p>

## Purpose

복구 계정 변경 요청 목록을 반환합니다.  파라미터: `start:object`, `limit:int`, `order:string`

* `start`는 `order`에 따라 달라집니다(아래 참조)
* `limit`는 최대 1000입니다.
* `order`는 다음 중 하나입니다:
  * `by_account` - 계정 기준 정렬
    * `start`는 문자열: `account`
  * `by_effective_date` - 적용 날짜 기준 정렬
    * `start`는 두 값(`timestamp`, `account`)의 배열

| `start` (object) | `limit` (int) | `order` (string) | |
|----------------------------|---------------|-|
| `""` | 10 | `"by_account"` | 첫 10개 요청을 계정 기준 정렬로 조회합니다 |
| `["1960-01-01T00:00:00", ""]` | 10 | `"by_effective_date"` | 첫 10개 요청을 적용 날짜 기준 정렬로 조회합니다 |

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
    "method": "database_api.list_change_recovery_account_requests",
    "params": {
      "start": "alice",
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
    "method": "database_api.list_change_recovery_account_requests",
    "params": {
      "start": [
        "1960-01-01T00:00:00",
        ""
      ],
      "limit": 10,
      "order": "by_effective_date"
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
  "requests": [
    {
      "id": 99,
      "account_to_recover": "alice",
      "recovery_account": "bob",
      "effective_on": "1960-01-01T00:00:00"
    }
  ]
}
```

</div>
