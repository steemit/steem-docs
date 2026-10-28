---
title: "market_history_api.get_trade_history"
description: "내부 SBD:STEEM 마켓의 거래 이력 (trade history)을 반환합니다."
outline: [2, 3]
---

# market_history_api.get_trade_history

## Purpose

내부 SBD:STEEM 마켓의 거래 이력 (trade history)을 반환합니다.

## Parameters

<div class="code-card code-card-params">
<div class="code-card-title">PARAMETERS</div>

```json
{
  "start": "1970-01-01T00:00:00",
  "end": "1970-01-01T00:00:00",
  "limit": 1000
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
    "method": "market_history_api.get_trade_history",
    "params": {
      "start": "2018-01-01T00:00:00",
      "end": "2018-01-02T00:00:00",
      "limit": 10
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
  "trades": []
}
```

</div>
