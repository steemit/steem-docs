---
title: "database_api.list_sbd_conversion_requests"
description: "계정의 SBD 전환 요청 목록을 반환합니다. 파라미터: start:array, limit:int, order:string"
outline: [2, 3]
---

# database_api.list_sbd_conversion_requests

## Purpose

계정의 SBD 전환 요청 목록을 반환합니다.  파라미터: `start:array`, `limit:int`, `order:string`

* `limit`는 최대 1000입니다.
* `order`는 다음 중 하나입니다:
  * `by_account` - accont(계정) 이름 기준 정렬
    * `start`는 두 값(`account`, `request_id`)의 배열
  * `by_conversion_date` - 전환 날짜 기준 정렬
    * `start`는 두 값(`timestamp`, `request_id`)의 배열

| `start` (array) | `limit` (int) | `order` (string) | |
|-------------------|-|-|-|
| `["steemit", 0]` | 10 | `by_account` | steemit의 전환 요청을 최대 10개 결과로, 계정 이름 기준 정렬로 조회합니다. |
| `["2018-12-07T16:54:03", 0]` | 10 | `by_conversion_date`| 이 날짜부터의 전환 요청을 최대 10개 결과로, 전환 날짜 기준 정렬로 조회합니다. |

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
    "method": "database_api.list_sbd_conversion_requests",
    "params": {
      "start": [
        "steemit",
        0
      ],
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
    "method": "database_api.list_sbd_conversion_requests",
    "params": {
      "start": [
        "2018-12-07T16:54:03",
        0
      ],
      "limit": 10,
      "order": "by_conversion_date"
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
      "id": 75677,
      "owner": "adenijiadeshina",
      "requestid": 3,
      "amount": {
        "amount": "311",
        "precision": 3,
        "nai": "@@000000013"
      },
      "conversion_date": "2018-12-06T20:42:42"
    }
  ]
}
```

</div>
