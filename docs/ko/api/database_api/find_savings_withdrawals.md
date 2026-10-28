---
title: "database_api.find_savings_withdrawals"
description: "계정의 저축 인출 (savings withdraw) 목록을 반환합니다. 파라미터: account:string"
outline: [2, 3]
---

# database_api.find_savings_withdrawals

<p class="api-badges"><span class="badge badge-since">since HF14</span></p>

## Purpose

계정의 저축 인출 (savings withdraw) 목록을 반환합니다.  파라미터: `account:string`

| `account` (string) | |
|--------------------|-|
| `"steemit"` | "steemit" 계정의 저축 인출을 조회합니다. |

## Parameters

<div class="code-card code-card-params">
<div class="code-card-title">PARAMETERS</div>

```json
{
  "account": ""
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
    "method": "database_api.find_savings_withdrawals",
    "params": {
      "start": "temp"
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
  "withdrawals": []
}
```

</div>
