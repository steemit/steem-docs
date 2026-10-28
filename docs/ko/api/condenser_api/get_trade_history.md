---
title: "condenser_api.get_trade_history"
description: "내부 SBD:STEEM 마켓의 체결 이력을 반환합니다. 파라미터: start:timestamp; end:timestamp; limit:int 최대 1000"
outline: [2, 3]
---

# condenser_api.get_trade_history

## Purpose

내부 SBD:STEEM 마켓의 체결 이력을 반환합니다.  파라미터: `start:timestamp`; `end:timestamp`; `limit:int` 최대 1000

| `start` (timestamp) | `end` (timestamp) | `limit` (int) | |
|---------------------|-------------------|---------------|-|
| `"2018-01-01T00:00:00"` | `"2018-01-02T00:00:00"` | 10 | 2018년 1월 1일부터 2018년 1월 2일 사이의 체결 내역을 최대 10개 조회합니다. |

추가 참조: market_history_api.get_trade_history

## Parameters

<div class="code-card code-card-params">
<div class="code-card-title">PARAMETERS</div>

```json
[
  "1970-01-01T00:00:00",
  "1970-01-01T00:00:00",
  1000
]
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
    "method": "condenser_api.get_trade_history",
    "params": [
      "2018-01-01T00:00:00",
      "2018-01-02T00:00:00",
      10
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
    "current_pays": "0.000 SBD",
    "open_pays": "0.000 STEEM"
  }
]
```

</div>
