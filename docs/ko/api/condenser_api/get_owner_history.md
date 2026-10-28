---
title: "condenser_api.get_owner_history"
description: "계정의 오너 키 이력(owner history)을 반환합니다. 파라미터: account:string"
outline: [2, 3]
---

# condenser_api.get_owner_history

## Purpose

계정의 오너 키 이력(owner history)을 반환합니다.  파라미터: `account:string`

| `account` (string) | |
|--------------------|-|
| `"steemit"` | "steemit"이라는 이름의 계정의 오너 키 이력을 조회합니다. |

추가 참조: database_api.list_owner_histories

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
