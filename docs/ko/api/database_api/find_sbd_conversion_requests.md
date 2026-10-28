---
title: "database_api.find_sbd_conversion_requests"
description: "계정의 SBD 변환 요청 목록을 반환합니다. 파라미터: account:string"
outline: [2, 3]
---

# database_api.find_sbd_conversion_requests

## Purpose

계정의 SBD 변환 요청 목록을 반환합니다.  파라미터: `account:string`

| `account` (string) | |
|-------------------|-|
| `"steemit"` | steemit의 변환 요청을 조회합니다. |
| `"alice"` | alice의 변환 요청을 조회합니다. |

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

### Example 1

<div class="code-card code-card-example">
<div class="code-card-title">BASH</div>

```bash
curl -s https://api.steemit.com \
  -H 'Content-Type: application/json' \
  --data-binary '{
    "jsonrpc": "2.0",
    "method": "database_api.find_sbd_conversion_requests",
    "params": {
      "account": "steemit"
    },
    "id": 1
  }'
```

</div>

### Example 2

<div class="code-card code-card-example">
<div class="code-card-title">BASH</div>

```bash
curl -s https://api.steemit.com \
  -H 'Content-Type: application/json' \
  --data-binary '{
    "jsonrpc": "2.0",
    "method": "database_api.find_sbd_conversion_requests",
    "params": {
      "account": "alice"
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
