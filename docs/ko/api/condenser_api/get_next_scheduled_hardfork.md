---
title: "condenser_api.get_next_scheduled_hardfork"
description: "다음에 예정된 하드포크를 반환합니다."
outline: [2, 3]
---

# condenser_api.get_next_scheduled_hardfork

## Purpose

다음에 예정된 하드포크를 반환합니다.
      
추가 참조: database_api.get_hardfork_properties

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
    "method": "condenser_api.get_next_scheduled_hardfork",
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
  "hf_version": "0.0.0",
  "live_time": "1970-01-01T00:00:00"
}
```

</div>
