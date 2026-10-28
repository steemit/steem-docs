---
title: "condenser_api.get_owner_history"
description: "계정의 오너 권한 (owner authority) 이력을 반환합니다. 파라미터: account:string"
outline: [2, 3]
---

# condenser_api.get_owner_history

## Purpose

계정의 오너 권한 (owner authority) 이력을 반환합니다.  파라미터: `account:string`

| `account` (string) | |
|--------------------|-|
| `"steemit"` | "steemit" 계정의 오너 이력을 조회합니다. |

함께 보기: database_api.list_owner_histories

## Parameters

<div class="code-card code-card-params">
<div class="code-card-title">PARAMETERS</div>

```json
[
  ""
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
    "method": "condenser_api.get_owner_history",
    "params": [
      "steemit"
    ],
    "id": 1
  }'
```

</div>
