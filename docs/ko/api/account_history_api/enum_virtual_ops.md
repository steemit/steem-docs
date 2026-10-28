---
title: "account_history_api.enum_virtual_ops"
description: "블록 범위 내의 가상 오퍼레이션(virtual operation)을 반환합니다. 계정과 오퍼레이션 유형으로 선택적으로 필터링할 수 있습니다."
outline: [2, 3]
---

# account_history_api.enum_virtual_ops

<p class="api-badges"><span class="badge badge-since">since HF23</span></p>

## Purpose

블록 범위 내의 가상 오퍼레이션(virtual operation)을 반환합니다. 계정과 오퍼레이션 유형으로 선택적으로 필터링할 수 있습니다.

## Parameters

<div class="code-card code-card-params">
<div class="code-card-title">PARAMETERS</div>

```json
{
  "block_range_begin": 1,
  "block_range_end": 2
}
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
    "method": "account_history_api.enum_virtual_ops",
    "params": {
      "block_range_begin": 1,
      "block_range_end": 2
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
  "ops": [],
  "next_block_range_begin": 0
}
```

</div>
