---
title: "condenser_api.get_ticker"
description: "내부 SBD:STEEM 마켓의 시세(ticker)를 반환합니다."
outline: [2, 3]
---

# condenser_api.get_ticker

## Purpose

내부 SBD:STEEM 마켓의 시세(ticker)를 반환합니다.

추가 참조: market_history_api.get_ticker

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
    "method": "condenser_api.get_ticker",
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
  "latest": "0.00000000000000000",
  "lowest_ask": "0.00000000000000000",
  "highest_bid": "0.00000000000000000",
  "percent_change": "0.00000000000000000",
  "steem_volume": "0.000 STEEM",
  "sbd_volume": "0.000 STEEM"
}
```

</div>
