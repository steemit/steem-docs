---
title: "condenser_api.get_current_median_history_price"
description: "현재 중위 이력 가격, 즉 위트니스가 제공하는 STEEM:SBD 환율을 반환합니다."
outline: [2, 3]
---

# condenser_api.get_current_median_history_price

## Purpose

현재 중위 이력 가격, 즉 위트니스가 제공하는 STEEM:SBD 환율을 반환합니다.

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
    "method": "condenser_api.get_current_median_history_price",
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
  "base": "0.000 STEEM",
  "quote": "0.000 STEEM"
}
```

</div>
