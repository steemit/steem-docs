---
title: "market_history_api.get_ticker"
description: "내부 SBD:STEEM 마켓의 시세(ticker)를 반환합니다."
outline: [2, 3]
---

# market_history_api.get_ticker

## Purpose

내부 SBD:STEEM 마켓의 시세(ticker)를 반환합니다.

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
    "method": "market_history_api.get_ticker",
    "id": 1
  }'
```

</div>

## Response

<div class="code-card code-card-response">
<div class="code-card-title">RESPONSE</div>

```json
{
  "latest": "0.00000000000000000",
  "lowest_ask": "0.00000000000000000",
  "highest_bid": "0.00000000000000000",
  "percent_change": "0.00000000000000000",
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
