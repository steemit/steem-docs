---
title: "market_history_api.get_recent_trades"
description: "내부 SBD:STEEM 마켓의 가장 최근 체결 내역(trade)을 반환합니다."
outline: [2, 3]
---

# market_history_api.get_recent_trades

## Purpose

내부 SBD:STEEM 마켓의 가장 최근 체결 내역(trade)을 반환합니다.

## Parameters

<div class="code-card code-card-params">
<div class="code-card-title">PARAMETERS</div>

```json
{
  "limit": 1000
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
    "method": "market_history_api.get_recent_trades",
    "params": {
      "limit": 10
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
    "method": "market_history_api.get_recent_trades",
    "params": {
      "limit": 500
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
