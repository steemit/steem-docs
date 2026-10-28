---
title: "database_api.find_owner_histories"
description: "오너 권한(owner authority) 이력을 반환합니다. 파라미터: owner:string"
outline: [2, 3]
---

# database_api.find_owner_histories

## Purpose

오너 권한(owner authority) 이력을 반환합니다.  파라미터: `owner:string`

| `owner` (string) | |
|--------------------|-|
| `"steemit"` | "steemit"이라는 이름의 계정의 오너 키 이력을 조회합니다. |
| `"alice"` | "alice"이라는 이름의 계정의 오너 키 이력을 조회합니다. |

## Parameters

<div class="code-card code-card-params">
<div class="code-card-title">PARAMETERS</div>

```json
{
  "owner": ""
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
    "method": "database_api.find_owner_histories",
    "params": {
      "owner": "steemit"
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
    "method": "database_api.find_owner_histories",
    "params": {
      "owner": "alice"
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
  "owner_auths": []
}
```

</div>
