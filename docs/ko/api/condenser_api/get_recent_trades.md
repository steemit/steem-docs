---
title: "condenser_api.get_recent_trades"
description: "내부 SBD:STEEM 마켓의 가장 최근 체결 내역(trade)을 반환합니다. 파라미터: limit:int 최대 1000"
outline: [2, 3]
---

# condenser_api.get_recent_trades

## Purpose

내부 SBD:STEEM 마켓의 가장 최근 체결 내역(trade)을 반환합니다.  파라미터: `limit:int` 최대 1000

| `limit` (int) | |
|--------------------|-|
| `10` | 최근 체결 내역을 최대 10개 조회합니다. |
| `500` | 최근 체결 내역을 최대 500개 조회합니다. |

추가 참조: market_history_api.get_recent_trades

## Parameters

<div class="code-card code-card-params">
<div class="code-card-title">PARAMETERS</div>

```json
[
  1
]
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
    "method": "condenser_api.get_recent_trades",
    "params": [
      10
    ],
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
    "method": "condenser_api.get_recent_trades",
    "params": [
      500
    ],
    "id": 1
  }'
```

</div>

## Response

<div class="code-card code-card-response">
<div class="code-card-title">RESPONSE</div>

```json
[
  {
    "date": "1970-01-01T00:00:00",
    "current_pays": "0.0 SBD",
    "open_pays": "0.0 STEEM"
  }
]
```

</div>
