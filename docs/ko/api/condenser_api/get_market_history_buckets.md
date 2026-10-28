---
title: "condenser_api.get_market_history_buckets"
description: "플러그인이 추적하는 버킷(bucket) 초 단위 값을 반환합니다."
outline: [2, 3]
---

# condenser_api.get_market_history_buckets

## Purpose

플러그인이 추적하는 버킷(bucket) 초 단위 값을 반환합니다.

추가 참조: market_history_api.get_market_history_buckets

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
    "method": "condenser_api.get_market_history_buckets",
    "params": [],
    "id": 1
  }'
```

</div>

## Response

<div class="code-card code-card-response">
<div class="code-card-title">RESPONSE</div>

```json
[
  15,
  60,
  300,
  3600,
  86400
]
```

</div>
