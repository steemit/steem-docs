---
title: "account_history_api.get_transaction"
description: "트랜잭션 id로 해당 트랜잭션의 상세 정보를 반환합니다."
outline: [2, 3]
---

# account_history_api.get_transaction

<p class="api-badges"><span class="badge badge-deprecated">deprecated</span></p>

## Purpose

트랜잭션 id로 해당 트랜잭션의 상세 정보를 반환합니다.

## Parameters

<div class="code-card code-card-params">
<div class="code-card-title">PARAMETERS</div>

```json
{
  "id": "0000000000000000000000000000000000000000"
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
    "method": "account_history_api.get_transaction",
    "params": {
      "id": "6fde0190a97835ea6d9e651293e90c89911f933c"
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
  "ref_block_num": 0,
  "ref_block_prefix": 0,
  "expiration": "1970-01-01T00:00:00",
  "operations": [],
  "extensions": [],
  "signatures": [],
  "transaction_id": "0000000000000000000000000000000000000000",
  "block_num": 0,
  "transaction_num": 0
}
```

</div>

## Expected curl responses

<div class="code-card code-card-response">
<div class="code-card-title">EXPECTED RESPONSES</div>

```text
Could not find API account_history_api
```

</div>
