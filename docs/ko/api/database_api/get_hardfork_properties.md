---
title: "database_api.get_hardfork_properties"
description: "블록체인의 하드포크에 대한 현재 속성을 반환합니다."
outline: [2, 3]
---

# database_api.get_hardfork_properties

## Purpose

블록체인의 하드포크에 대한 현재 속성을 반환합니다.

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
    "method": "database_api.get_hardfork_properties",
    "id": 1
  }'
```

</div>

## Response

<div class="code-card code-card-response">
<div class="code-card-title">RESPONSE</div>

```json
{
  "id": 0,
  "processed_hardforks": [],
  "last_hardfork": 0,
  "current_hardfork_version": "0.0.0",
  "next_hardfork": "0.0.0",
  "next_hardfork_time": "1970-01-01T00:00:00"
}
```

</div>
