---
title: "condenser_api.get_savings_withdraw_from"
description: "계정에서 나가는 저축 인출 (savings withdraw)을 반환합니다. 파라미터: account:string"
outline: [2, 3]
---

# condenser_api.get_savings_withdraw_from

<p class="api-badges"><span class="badge badge-since">since HF14</span></p>

## Purpose

계정에서 나가는 저축 인출 (savings withdraw)을 반환합니다.  파라미터: `account:string`

| `account` (string) | |
|--------------------|-|
| `"steemit"` | "steemit" 계정의 저축 인출을 조회합니다. |

함께 보기: database_api.list_savings_withdrawals

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
    "method": "condenser_api.get_savings_withdraw_from",
    "params": [
      "steemit"
    ],
    "id": 1
  }'
```

</div>
