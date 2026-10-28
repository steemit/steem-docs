---
title: "condenser_api.get_withdraw_routes"
description: "계정의 인출 경로 (withdraw route)를 반환합니다. 파라미터: account:string; type:string"
outline: [2, 3]
---

# condenser_api.get_withdraw_routes

## Purpose

계정의 인출 경로 (withdraw route)를 반환합니다.  파라미터: `account:string`; `type:string`

| `account` (string) | `type` (string) | |
|--------------------|-----------------|-|
| `"steemit"` | `"outgoing"` | "steemit"의 나가는 인출 경로를 조회합니다. |
| `"steemit"` | `"incoming"` | "steemit"의 들어오는 인출 경로를 조회합니다. |
| `"steemit"` | `"all"` | "steemit"의 모든 인출 경로를 조회합니다. |

함께 보기: database_api.list_withdraw_vesting_routes

## Parameters

<div class="code-card code-card-params">
<div class="code-card-title">PARAMETERS</div>

```json
[
  "",
  ""
]
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
    "method": "condenser_api.get_withdraw_routes",
    "params": [
      "steemit",
      "outgoing"
    ],
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
    "method": "condenser_api.get_withdraw_routes",
    "params": [
      "steemit",
      "incoming"
    ],
    "id": 1
  }'
```

</div>

### Example 3

<div class="code-card code-card-example">
<div class="code-card-title">BASH</div>

```bash
curl -s https://api.steemit.com \
  -H 'Content-Type: application/json' \
  --data-binary '{
    "jsonrpc": "2.0",
    "method": "condenser_api.get_withdraw_routes",
    "params": [
      "steemit",
      "all"
    ],
    "id": 1
  }'
```

</div>

## Response

<div class="code-card code-card-response">
<div class="code-card-title">RESPONSE</div>

```json
[
  {
    "id": 0,
    "from_account": "",
    "to_account": "",
    "percent": 0,
    "auto_vest": false
  }
]
```

</div>
