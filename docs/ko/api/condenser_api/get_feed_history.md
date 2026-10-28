---
title: "condenser_api.get_feed_history"
description: "피드 가격 (feed price) 값의 이력을 반환합니다."
outline: [2, 3]
---

# condenser_api.get_feed_history

## Purpose

피드 가격 (feed price) 값의 이력을 반환합니다.

함께 보기: database_api.get_feed_history

## Parameters

<div class="code-card code-card-params">
<div class="code-card-title">PARAMETERS</div>

```json
[]
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
    "method": "condenser_api.get_feed_history",
    "params": [],
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
    "base": "0.000 STEEM",
    "quote": "0.000 STEEM"
  },
  "price_history": []
}
```

</div>
