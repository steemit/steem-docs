---
title: "database_api.find_limit_orders"
description: "지정가 주문(limit order) 목록을 반환합니다."
outline: [2, 3]
---

# database_api.find_limit_orders

## Purpose

지정가 주문(limit order) 목록을 반환합니다.

## Parameters

<div class="code-card code-card-params">
<div class="code-card-title">PARAMETERS</div>

```json
{
  "account": ""
}
```

</div>

## Example

<div class="code-card code-card-example">
<div class="code-card-title">BASH</div>

```bash
curl -s https://api.steemit.com \
  -H 'Content-Type: application/json' \
  --data-binary '{
    "jsonrpc": "2.0",
    "method": "database_api.find_limit_orders",
    "params": {
      "account": "temp"
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
  "orders": []
}
```

</div>
