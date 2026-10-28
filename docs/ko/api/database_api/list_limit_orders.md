---
title: "database_api.list_limit_orders"
description: "지정가 주문(limit order) 목록을 반환합니다. 파라미터: start:array; limit:int; order:string"
outline: [2, 3]
---

# database_api.list_limit_orders

## Purpose

지정가 주문(limit order) 목록을 반환합니다.  파라미터: `start:array`; `limit:int`; `order:string`

* `start`는 `order`에 따라 달라집니다(아래 참조)
* `limit`는 최대 1000입니다.
* `order`는 다음 중 하나입니다:
  * `by_price` - 가격 기준 정렬
    * `start`는 두 값(`price`, `order_type`)의 배열
  * `by_account` - 계정 기준 정렬
    * `start`는 두 값(`account`, `order_id`)의 배열

| `start` (array) | `limit` (int) | `order` (string) | |
|----------------------------|---------------|-|
| `[{"base": {"amount": "85405", "precision": 3, "nai": "@@000000021"}, "quote": {"amount": "17192", "precision": 3, "nai": "@@000000013"}}, 0]` | 10 | `"by_price"` | 첫 10개 요청을 가격 기준 정렬로 조회합니다 |
| `["alice", 0]` | 10 | `"by_effective_date"` | 첫 10개 요청을 계정 기준 정렬로 조회합니다 |

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
    "method": "database_api.list_limit_orders",
    "params": {
      "start": [
        {
          "base": {
            "amount": "1000",
            "precision": 3,
            "nai": "@@000000021"
          },
          "quote": {
            "amount": "1",
            "precision": 3,
            "nai": "@@000000013"
          }
        },
        0
      ],
      "limit": 10,
      "order": "by_price"
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
    "method": "database_api.list_limit_orders",
    "params": {
      "start": [
        "alice",
        0
      ],
      "limit": 10,
      "order": "by_account"
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
  "orders": [
    {
      "id": 3155591,
      "created": "2018-12-05T06:34:21",
      "expiration": "2018-12-15T06:34:20",
      "seller": "teamsmooth-mm",
      "orderid": 2000,
      "for_sale": 197714,
      "sell_price": {
        "base": {
          "amount": "198513",
          "precision": 3,
          "nai": "@@000000021"
        },
        "quote": {
          "amount": "80000",
          "precision": 3,
          "nai": "@@000000013"
        }
      }
    }
  ]
}
```

</div>
