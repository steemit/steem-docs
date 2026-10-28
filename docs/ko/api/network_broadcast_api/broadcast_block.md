---
title: "network_broadcast_api.broadcast_block"
description: "블록을 브로드캐스트하는 데 사용합니다."
outline: [2, 3]
---

# network_broadcast_api.broadcast_block

## Purpose

블록을 브로드캐스트하는 데 사용합니다.

## Parameters

<div class="code-card code-card-params">
<div class="code-card-title">PARAMETERS</div>

```json
{
  "block": {
    "previous": "0000000000000000000000000000000000000000",
    "timestamp": "1970-01-01T00:00:00",
    "witness": "",
    "transaction_merkle_root": "0000000000000000000000000000000000000000",
    "extensions": [],
    "witness_signature": "0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000",
    "transactions": []
  }
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
    "method": "network_broadcast_api.broadcast_block",
    "params": {
      "block": {
        "previous": "0000000000000000000000000000000000000000",
        "timestamp": "1970-01-01T00:00:00",
        "witness": "",
        "transaction_merkle_root": "0000000000000000000000000000000000000000",
        "extensions": [],
        "witness_signature": "0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000",
        "transactions": []
      }
    },
    "id": 1
  }'
```

</div>

## Response

<div class="code-card code-card-response">
<div class="code-card-title">RESPONSE</div>

```json
{}
```

</div>

## Expected curl responses

<div class="code-card code-card-response">
<div class="code-card-title">EXPECTED RESPONSES</div>

```text
attempting to push a block that is too old
```

</div>
