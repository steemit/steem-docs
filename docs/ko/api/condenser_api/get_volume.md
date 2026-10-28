---
title: "condenser_api.get_volume"
description: "지난 24시간의 마켓 거래량을 반환합니다."
outline: [2, 3]
---

# condenser_api.get_volume

## Purpose

지난 24시간의 마켓 거래량을 반환합니다.

함께 보기: market_history_api.get_volume

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
    "method": "condenser_api.get_volume",
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
  "steem_volume": "0.000 STEEM",
  "sbd_volume": "0.000 STEEM"
}
```

</div>
