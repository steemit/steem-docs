---
title: "market_history_api.get_market_history_buckets"
description: "플러그인이 추적하는 버킷 초 (bucket seconds)를 반환합니다."
outline: [2, 3]
---

# market_history_api.get_market_history_buckets

## Purpose

플러그인이 추적하는 버킷 초 (bucket seconds)를 반환합니다.

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
    "method": "market_history_api.get_market_history_buckets",
    "id": 1
  }'
```

</div>

## Response

<div class="code-card code-card-response">
<div class="code-card-title">RESPONSE</div>

```json
{
  "bucket_sizes": []
}
```

</div>
