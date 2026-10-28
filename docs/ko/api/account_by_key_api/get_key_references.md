---
title: "account_by_key_api.get_key_references"
description: "해당 키를 자신의 owner 또는 active 권한 (authority)에 연결하고 있는 모든 계정을 반환합니다."
outline: [2, 3]
---

# account_by_key_api.get_key_references

<p class="api-badges"><span class="badge badge-since">since HF16</span></p>

## Purpose

해당 키를 자신의 owner 또는 active 권한 (authority)에 연결하고 있는 모든 계정을 반환합니다.

## Parameters

<div class="code-card code-card-params">
<div class="code-card-title">PARAMETERS</div>

```json
{
  "keys": []
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
    "method": "account_by_key_api.get_key_references",
    "params": {
      "keys": [
        "STM5jZtLoV8YbxCxr4imnbWn61zMB24wwonpnVhfXRmv7j6fk3dTH"
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
  "accounts": []
}
```

</div>
