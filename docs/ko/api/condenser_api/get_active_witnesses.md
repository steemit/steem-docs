---
title: "condenser_api.get_active_witnesses"
description: "활성 위트니스(witness) 목록을 반환합니다."
outline: [2, 3]
---

# condenser_api.get_active_witnesses

## Purpose

활성 위트니스(witness) 목록을 반환합니다.

추가 참조: database_api.get_active_witnesses

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
    "method": "condenser_api.get_active_witnesses",
    "params": [],
    "id": 1
  }'
```

</div>
