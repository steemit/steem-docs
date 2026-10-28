---
title: "condenser_api.get_witnesses"
description: "현재 위트니스들을 반환합니다."
outline: [2, 3]
---

# condenser_api.get_witnesses

## Purpose

현재 위트니스들을 반환합니다.

함께 보기: database_api.list_witnesses

## Parameters

<div class="code-card code-card-params">
<div class="code-card-title">PARAMETERS</div>

```json
[
  [
    0
  ]
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
    "method": "condenser_api.get_witnesses",
    "params": [
      [
        28
      ]
    ],
    "id": 1
  }'
```

</div>
