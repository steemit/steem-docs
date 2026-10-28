---
title: "database_api.verify_signatures"
description: "기존의 권한 (authority) 구조를 사용하여, 임의의 sha256 해시에 대해 계정의 서명을 검사하는 범용 API입니다."
outline: [2, 3]
---

# database_api.verify_signatures

## Purpose

기존의 권한 (authority) 구조를 사용하여, 임의의 sha256 해시에 대해 계정의 서명을 검사하는 범용 API입니다.

## Parameters

<div class="code-card code-card-params">
<div class="code-card-title">PARAMETERS</div>

```json
{
  "hash": "0000000000000000000000000000000000000000000000000000000000000000",
  "signatures": [],
  "required_owner": [],
  "required_active": [],
  "required_posting": [],
  "required_other": []
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
    "method": "database_api.verify_signatures",
    "params": {
      "hash": "0000000000000000000000000000000000000000000000000000000000000000",
      "signatures": [],
      "required_owner": [],
      "required_active": [],
      "required_posting": [],
      "required_other": []
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
  "valid": false
}
```

</div>
