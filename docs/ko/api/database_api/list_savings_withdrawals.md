---
title: "database_api.list_savings_withdrawals"
description: "저축 인출 (savings withdraw) 목록을 반환합니다. 파라미터: start:object, limit:int, order:string"
outline: [2, 3]
---

# database_api.list_savings_withdrawals

<p class="api-badges"><span class="badge badge-since">since HF14</span></p>

## Purpose

저축 인출 (savings withdraw) 목록을 반환합니다.  파라미터: `start:object`, `limit:int`, `order:string`

* `limit`는 최대 1000입니다.
* `order`는 다음 중 하나:
  * `by_from_id` - id 순
    * `start`는 `account`, `request_id` 두 값으로 이루어진 배열입니다
  * `by_complete_from_id` - id(완료) 순
    * `start`는 `timestamp`, `account`, `request_id` 세 값으로 이루어진 배열입니다
  * `by_to_complete` - 완료 순
    * `start`는 `account`, `timestamp`, `order_id` 세 값으로 이루어진 배열입니다

| `start` (object) | `limit` (int) | `order` (string) | |
|--------------------|-|-|-|
| `[0]` | `10` | `"by_from_id"` | id의 저축 인출을 조회합니다. |
| `["2018-12-07T16:54:03", "steemit", 0]` | `10` | `"by_complete_from_id"` | id의 저축 인출(완료)을 조회합니다. |
| `["", "1970-01-01T00:00:00", 0]` | `10` | `"by_to_complete"` | 완료된 저축 인출을 조회합니다. |

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
    "method": "database_api.list_savings_withdrawals",
    "params": {
      "start": [
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
    "method": "database_api.list_savings_withdrawals",
    "params": {
      "start": [
        "2018-12-07T16:54:03",
        "steemit",
        0
      ],
      "limit": 10,
      "order": "by_complete_from_id"
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
    "method": "database_api.list_savings_withdrawals",
    "params": {
      "start": [
        "",
        "1970-01-01T00:00:00",
        0
      ],
      "limit": 10,
      "order": "by_to_complete"
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
  "withdrawals": [
    {
      "id": 120083,
      "from": "adafnnys",
      "to": "adafnnys",
      "memo": "",
      "request_id": 1543942411,
      "amount": {
        "amount": "2413",
        "precision": 3,
        "nai": "@@000000013"
      },
      "complete": "2018-12-07T16:54:03"
    }
  ]
}
```

</div>
