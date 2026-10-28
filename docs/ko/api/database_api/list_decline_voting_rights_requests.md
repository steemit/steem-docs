---
title: "database_api.list_decline_voting_rights_requests"
description: "투표권 포기 요청 목록을 반환합니다. 파라미터: start:object; limit:int; order:string"
outline: [2, 3]
---

# database_api.list_decline_voting_rights_requests

<p class="api-badges"><span class="badge badge-since">since HF14</span></p>

## Purpose

투표권 포기 요청 목록을 반환합니다.  파라미터: `start:object`; `limit:int`; `order:string`

* `start`는 `order`에 따라 달라집니다 (아래 참고)
* `limit`는 최대 1000입니다.
* `order`는 다음 중 하나:
  * `by_account` - 계정 순
    * `start`는 문자열입니다: `account`
  * `by_effective_date` - 적용일 (effective date) 순
    * `start`는 `timestamp`, `account` 두 값으로 이루어진 배열입니다

| `start` (object) | `limit` (int) | `order` (string) | |
|----------------------------|---------------|-|
| `""` | 10 | `"by_account"` | 처음 10개 요청을, 계정 순으로 조회합니다 |
| `["1960-01-01T00:00:00", ""]` | 10 | `"by_effective_date"` | 처음 10개 요청을, 적용일 순으로 조회합니다 |

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
    "method": "database_api.list_decline_voting_rights_requests",
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
    "method": "database_api.list_decline_voting_rights_requests",
    "params": {
      "start": [
        "1970-01-01T00:00:00",
        "",
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
  "requests": []
}
```

</div>
