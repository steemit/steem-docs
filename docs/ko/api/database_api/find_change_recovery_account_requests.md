---
title: "database_api.find_change_recovery_account_requests"
description: "복구 계정 변경 요청 목록을 반환합니다. 파라미터: account:array"
outline: [2, 3]
---

# database_api.find_change_recovery_account_requests

<p class="api-badges"><span class="badge badge-since">since HF11</span></p>

## Purpose

복구 계정 변경 요청 목록을 반환합니다.  파라미터: `account:array`

| `account` (array) | |
|--------------------|-|
| `["steemit"]` | "steemit"이라는 이름의 계정의 복구 요청을 조회합니다. |

## Parameters

<div class="code-card code-card-params">
<div class="code-card-title">PARAMETERS</div>

```json
{
  "accounts": []
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
    "method": "database_api.find_change_recovery_account_requests",
    "params": {
      "accounts": [
        "steemit"
      ]
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
  "requests": []
}
```

</div>
