---
title: "condenser_api.get_key_references"
description: "오너(owner) 또는 액티브(active) 권한(authority)에 연결된 키를 가진 모든 계정을 반환합니다."
outline: [2, 3]
---

# condenser_api.get_key_references

<p class="api-badges"><span class="badge badge-since">since HF16</span></p>

## Purpose

오너(owner) 또는 액티브(active) 권한(authority)에 연결된 키를 가진 모든 계정을 반환합니다.

추가 참조: account_by_key_api.get_key_references

## Parameters

<div class="code-card code-card-params">
<div class="code-card-title">PARAMETERS</div>

```json
[
  [
    "STM5jZtLoV8YbxCxr4imnbWn61zMB24wwonpnVhfXRmv7j6fk3dTH"
  ]
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
    "method": "condenser_api.get_key_references",
    "params": [
      [
        "STM5jZtLoV8YbxCxr4imnbWn61zMB24wwonpnVhfXRmv7j6fk3dTH"
      ]
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
  [
    "steemit"
  ]
]
```

</div>
