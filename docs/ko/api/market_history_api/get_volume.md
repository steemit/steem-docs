---
title: "market_history_api.get_volume"
description: "지난 24시간의 마켓 거래량(volume)을 반환합니다."
outline: [2, 3]
---

# market_history_api.get_volume

## Purpose

지난 24시간의 마켓 거래량(volume)을 반환합니다.

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
    "method": "market_history_api.get_volume",
    "id": 1
  }'
```

</div>

## Response

<div class="code-card code-card-response">
<div class="code-card-title">RESPONSE</div>

```json
{
  "steem_volume": {
    "amount": "0",
    "precision": 3,
    "nai": "@@000000021"
  },
  "sbd_volume": {
    "amount": "0",
    "precision": 3,
    "nai": "@@000000013"
  }
}
```

</div>
