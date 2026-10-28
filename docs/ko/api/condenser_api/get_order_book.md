---
title: "condenser_api.get_order_book"
description: "내부 마켓의 오더북(order book)을 반환합니다. 파라미터: limit:int 최대 500"
outline: [2, 3]
---

# condenser_api.get_order_book

## Purpose

내부 마켓의 오더북(order book)을 반환합니다.  파라미터: `limit:int` 최대 500

| `limit` (int) | |
|--------------------|-|
| `10` | 오더북에서 최대 10개 항목을 조회합니다. |
| `500` | 오더북에서 최대 500개 항목을 조회합니다. |

추가 참조: database_api.get_order_book, market_history_api.get_order_book

## Parameters

<div class="code-card code-card-params">
<div class="code-card-title">PARAMETERS</div>

```json
[
  0
]
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
    "method": "condenser_api.get_order_book",
    "params": [
      10
    ],
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
    "method": "condenser_api.get_order_book",
    "params": [
      50
    ],
    "id": 1
  }'
```

</div>

## Response

<div class="code-card code-card-response">
<div class="code-card-title">RESPONSE</div>

```json
{
  "bids": [],
  "asks": []
}
```

</div>
