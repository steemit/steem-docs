---
title: "condenser_api.get_recovery_request"
description: "계정의 복구 요청 (recovery request)을 반환합니다. 파라미터: account:string"
outline: [2, 3]
---

# condenser_api.get_recovery_request

<p class="api-badges"><span class="badge badge-since">since HF11</span></p>

## Purpose

계정의 복구 요청 (recovery request)을 반환합니다.  파라미터: `account:string`

| `account` (string) | |
|--------------------|-|
| `"steemit"` | "steemit" 계정의 복구 요청을 조회합니다. |

함께 보기: database_api.list_account_recovery_requests

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
    "method": "condenser_api.get_recovery_request",
    "params": [
      "steemit"
    ],
    "id": 1
  }'
```

</div>

## Response

<div class="code-card code-card-response">
<div class="code-card-title">RESPONSE</div>

```json
null
```

</div>
