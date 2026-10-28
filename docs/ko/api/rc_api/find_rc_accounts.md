---
title: "rc_api.find_rc_accounts"
description: "계정의 사용 가능한 Resource Credits (RC)를 반환합니다. 파라미터: accounts:string array"
outline: [2, 3]
---

# rc_api.find_rc_accounts

<p class="api-badges"><span class="badge badge-since">since HF20</span></p>

## Purpose

계정의 사용 가능한 Resource Credits (RC)를 반환합니다.  파라미터: `accounts:string array`

| `accounts` (string) | |
|---------------------|-|
| `"steemit"` | "steemit"이라는 이름의 계정의 사용 가능한 Resource Credits를 조회합니다. |
| `"alice"` | "alice"과 "bob"이라는 이름의 계정의 사용 가능한 Resource Credits를 조회합니다. |

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

### Example 1

<div class="code-card code-card-example">
<div class="code-card-title">BASH</div>

```bash
curl -s https://api.steemit.com \
  -H 'Content-Type: application/json' \
  --data-binary '{
    "jsonrpc": "2.0",
    "method": "rc_api.find_rc_accounts",
    "params": {
      "accounts": [
        "steemit"
      ]
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
    "method": "rc_api.find_rc_accounts",
    "params": {
      "accounts": [
        "alice",
        "bob"
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
  "rc_accounts": [
    {
      "account": "",
      "rc_manabar": {
        "current_mana": "0",
        "last_update_time": 0
      },
      "max_rc_creation_adjustment": {
        "amount": "0",
        "precision": 6,
        "nai": "@@000000037"
      },
      "max_rc": "0"
    }
  ]
}
```

</div>
