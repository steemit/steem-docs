---
title: "condenser_api.get_open_orders"
description: "계정의 미체결 주문을 반환합니다. account:string"
outline: [2, 3]
---

# condenser_api.get_open_orders

## Purpose

계정의 미체결 주문을 반환합니다.  `account:string`

함께 보기: database_api.list_limit_orders

## Parameters

<div class="code-card code-card-params">
<div class="code-card-title">PARAMETERS</div>

```json
[
  ""
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
    "method": "condenser_api.get_open_orders",
    "params": [
      "steemit"
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
    "method": "condenser_api.get_open_orders",
    "params": [
      "alice"
    ],
    "id": 1
  }'
```

</div>
