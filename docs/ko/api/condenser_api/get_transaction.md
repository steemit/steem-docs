---
title: "condenser_api.get_transaction"
description: "트랜잭션 ID를 기준으로 트랜잭션의 상세 정보를 반환합니다. 파라미터: trx_id:string"
outline: [2, 3]
---

# condenser_api.get_transaction

## Purpose

트랜잭션 ID를 기준으로 트랜잭션의 상세 정보를 반환합니다.  파라미터: `trx_id:string`

| `trx_id` (string) | |
|-------------------|-|
| `"6fde0190a97835ea6d9e651293e90c89911f933c"` | 이 트랜잭션 ID와 정확히 일치하는 트랜잭션을 조회합니다. |

추가 참조: account_history_api.get_transaction

## Parameters

<div class="code-card code-card-params">
<div class="code-card-title">PARAMETERS</div>

```json
[
  ""
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
    "method": "condenser_api.get_transaction",
    "params": [
      "6fde0190a97835ea6d9e651293e90c89911f933c"
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
account_history_api_plugin not enabled
```

</div>
