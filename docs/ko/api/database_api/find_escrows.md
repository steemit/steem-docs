---
title: "database_api.find_escrows"
description: "에스크로(escrow) 목록을 반환합니다."
outline: [2, 3]
---

# database_api.find_escrows

<p class="api-badges"><span class="badge badge-since">since HF14</span></p>

## Purpose

에스크로(escrow) 목록을 반환합니다.

## Parameters

<div class="code-card code-card-params">
<div class="code-card-title">PARAMETERS</div>

```json
{
  "from": ""
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
    "method": "database_api.find_escrows",
    "params": {
      "from": "temp"
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
  "escrows": [
    {
      "id": 143,
      "escrow_id": 12345,
      "from": "temp",
      "to": "guest123",
      "agent": "smitop",
      "ratification_deadline": "2038-01-19T03:14:06",
      "escrow_expiration": "2038-01-19T03:14:07",
      "sbd_balance": {
        "amount": "0",
        "precision": 3,
        "nai": "@@000000013"
      },
      "steem_balance": {
        "amount": "1",
        "precision": 3,
        "nai": "@@000000021"
      },
      "pending_fee": {
        "amount": "1",
        "precision": 3,
        "nai": "@@000000021"
      },
      "to_approved": false,
      "agent_approved": false,
      "disputed": false
    }
  ]
}
```

</div>
