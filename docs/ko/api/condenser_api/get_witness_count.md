---
title: "condenser_api.get_witness_count"
description: "위트니스 총수를 반환합니다."
outline: [2, 3]
---

# condenser_api.get_witness_count

## Purpose

위트니스 총수를 반환합니다.

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
    "method": "condenser_api.get_witness_count",
    "params": [],
    "id": 1
  }'
```

</div>

## Response

<div class="code-card code-card-response">
<div class="code-card-title">RESPONSE</div>

```json
0
```

</div>
