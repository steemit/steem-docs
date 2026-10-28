---
title: "condenser_api.get_market_history"
description: "내부 SBD:STEEM 마켓의 마켓 히스토리를 반환합니다. 파라미터: bucket_seconds:int; start:timestamp; end:timestamp"
outline: [2, 3]
---

# condenser_api.get_market_history

## Purpose

내부 SBD:STEEM 마켓의 마켓 히스토리를 반환합니다.  파라미터: `bucket_seconds:int`; `start:timestamp`; `end:timestamp`

| `bucket_seconds` (int) | `start` (timestamp) | `end` (timestamp) | |
|------------------------|---------------------|-------------------|-|
| `15` | `"2018-01-01T00:00:00"` | `"2018-01-02T00:00:00"` | 2018년 1월 1일부터 2018년 1월 2일 사이의 마켓 히스토리를 15초 단위로 조회합니다. |
| `60` | `"2018-01-01T00:00:00"` | `"2018-01-02T00:00:00"` | 2018년 1월 1일부터 2018년 1월 2일 사이의 마켓 히스토리를 1분 단위로 조회합니다. |
| `300` | `"2018-01-01T00:00:00"` | `"2018-01-02T00:00:00"` | 2018년 1월 1일부터 2018년 1월 2일 사이의 마켓 히스토리를 5분 단위로 조회합니다. |
| `3600` | `"2018-01-01T00:00:00"` | `"2018-01-02T00:00:00"` | 2018년 1월 1일부터 2018년 1월 2일 사이의 마켓 히스토리를 1시간 단위로 조회합니다. |
| `86400` | `"2018-01-01T00:00:00"` | `"2018-01-02T00:00:00"` | 2018년 1월 1일부터 2018년 1월 2일 사이의 마켓 히스토리를 하루 단위로 조회합니다. |

추가 참조: market_history_api.get_market_history

## Parameters

<div class="code-card code-card-params">
<div class="code-card-title">PARAMETERS</div>

```json
[
  0,
  "1970-01-01T00:00:00",
  "1970-01-01T00:00:00"
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
    "method": "condenser_api.get_market_history",
    "params": [
      15,
      "2018-01-01T00:00:00",
      "2018-01-02T00:00:00"
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
    "method": "condenser_api.get_market_history",
    "params": [
      60,
      "2018-01-01T00:00:00",
      "2018-01-02T00:00:00"
    ],
    "id": 1
  }'
```

</div>

### Example 3

<div class="code-card code-card-example">
<div class="code-card-title">BASH</div>

```bash
curl -s https://api.steemit.com \
  -H 'Content-Type: application/json' \
  --data-binary '{
    "jsonrpc": "2.0",
    "method": "condenser_api.get_market_history",
    "params": [
      300,
      "2018-01-01T00:00:00",
      "2018-01-02T00:00:00"
    ],
    "id": 1
  }'
```

</div>

### Example 4

<div class="code-card code-card-example">
<div class="code-card-title">BASH</div>

```bash
curl -s https://api.steemit.com \
  -H 'Content-Type: application/json' \
  --data-binary '{
    "jsonrpc": "2.0",
    "method": "condenser_api.get_market_history",
    "params": [
      3600,
      "2018-01-01T00:00:00",
      "2018-01-02T00:00:00"
    ],
    "id": 1
  }'
```

</div>

### Example 5

<div class="code-card code-card-example">
<div class="code-card-title">BASH</div>

```bash
curl -s https://api.steemit.com \
  -H 'Content-Type: application/json' \
  --data-binary '{
    "jsonrpc": "2.0",
    "method": "condenser_api.get_market_history",
    "params": [
      86400,
      "2018-01-01T00:00:00",
      "2018-01-02T00:00:00"
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
    "id": 0,
    "open": "1970-01-01T00:00:00",
    "seconds": 0,
    "steem": {
      "high": 0,
      "low": 0,
      "open": 0,
      "close": 0,
      "volume": 0
    },
    "non_steem": {
      "high": 0,
      "low": 0,
      "open": 0,
      "close": 0,
      "volume": 0
    }
  }
]
```

</div>
