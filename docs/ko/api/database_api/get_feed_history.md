---
title: "database_api.get_feed_history"
description: "피드 가격 값의 이력을 반환합니다."
outline: [2, 3]
---

# database_api.get_feed_history

## Purpose

피드 가격 값의 이력을 반환합니다.

## Parameters

<div class="code-card code-card-params">
<div class="code-card-title">PARAMETERS</div>

```json
{}
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
    "method": "database_api.get_feed_history",
    "id": 1
  }'
```

</div>

## Response

<div class="code-card code-card-response">
<div class="code-card-title">RESPONSE</div>

```json
{
  "id": 0,
  "current_median_history": {
    "base": {
      "amount": "0",
      "precision": 3,
      "nai": "@@000000021"
    },
    "quote": {
      "amount": "0",
      "precision": 3,
      "nai": "@@000000021"
    }
  },
  "price_history": []
}
```

</div>
