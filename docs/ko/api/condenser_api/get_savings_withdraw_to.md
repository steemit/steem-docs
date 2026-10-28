---
title: "condenser_api.get_savings_withdraw_to"
description: "계정으로 들어오는 저축 인출(savings withdraw)을 반환합니다. 파라미터: account:string"
outline: [2, 3]
---

# condenser_api.get_savings_withdraw_to

<p class="api-badges"><span class="badge badge-since">since HF14</span></p>

## Purpose

계정으로 들어오는 저축 인출(savings withdraw)을 반환합니다.  파라미터: `account:string`

| `account` (string) | |
|--------------------|-|
| `"steemit"` | "steemit"이라는 이름의 계정의 저축 인출을 조회합니다. |

추가 참조: database_api.list_savings_withdrawals

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
    "method": "condenser_api.get_savings_withdraw_to",
    "params": [
      "steemit"
    ],
    "id": 1
  }'
```

</div>
