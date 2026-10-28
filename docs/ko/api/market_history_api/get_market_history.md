---
title: "market_history_api.get_market_history"
description: "내부 SBD:STEEM 마켓의 시장 이력 (market history)을 반환합니다."
outline: [2, 3]
---

# market_history_api.get_market_history

## Purpose

내부 SBD:STEEM 마켓의 시장 이력 (market history)을 반환합니다.

## Parameters

<div class="code-card code-card-params">
<div class="code-card-title">PARAMETERS</div>

```json
{
  "bucket_seconds": 0,
  "start": "1970-01-01T00:00:00",
  "end": "1970-01-01T00:00:00"
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
    "method": "market_history_api.get_market_history",
    "params": {
      "bucket_seconds": 15,
      "start": "2018-01-01T00:00:00",
      "end": "2018-01-02T00:00:00"
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
    "method": "market_history_api.get_market_history",
    "params": {
      "bucket_seconds": 60,
      "start": "2018-01-01T00:00:00",
      "end": "2018-01-02T00:00:00"
    },
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
    "method": "market_history_api.get_market_history",
    "params": {
      "bucket_seconds": 300,
      "start": "2018-01-01T00:00:00",
      "end": "2018-01-02T00:00:00"
    },
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
    "method": "market_history_api.get_market_history",
    "params": {
      "bucket_seconds": 3600,
      "start": "2018-01-01T00:00:00",
      "end": "2018-01-02T00:00:00"
    },
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
    "method": "market_history_api.get_market_history",
    "params": {
      "bucket_seconds": 86400,
      "start": "2018-01-01T00:00:00",
      "end": "2018-01-02T00:00:00"
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
  "buckets": []
}
```

</div>
