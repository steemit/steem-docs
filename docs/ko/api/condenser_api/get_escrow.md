---
title: "condenser_api.get_escrow"
description: "id로 특정 계정의 에스크로 (escrow)를 반환합니다."
outline: [2, 3]
---

# condenser_api.get_escrow

<p class="api-badges"><span class="badge badge-since">since HF14</span></p>

## Purpose

id로 특정 계정의 에스크로 (escrow)를 반환합니다.

함께 보기: database_api.list_escrows

## Parameters

<div class="code-card code-card-params">
<div class="code-card-title">PARAMETERS</div>

```json
[
  "",
  0
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
    "method": "condenser_api.get_escrow",
    "params": [
      "steemit",
      1234
    ],
    "id": 1
  }'
```

</div>

## Response

<div class="code-card code-card-response">
<div class="code-card-title">RESPONSE</div>

```json
{
  "agent": "ongame",
  "agent_approved": true,
  "disputed": false,
  "escrow_expiration": "2018-11-24T17:31:26",
  "escrow_id": 1,
  "from": "addicttolife",
  "id": 158,
  "pending_fee": "0.000 STEEM",
  "ratification_deadline": "2018-11-23T17:31:26",
  "sbd_balance": "0.000 SBD",
  "steem_balance": "4.832 STEEM",
  "to": "fundition.help",
  "to_approved": true
}
```

</div>
