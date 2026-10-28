---
title: "condenser_api.get_witness_by_account"
description: "계정의 위트니스 (witness)를 반환합니다. 파라미터: account:string"
outline: [2, 3]
---

# condenser_api.get_witness_by_account

## Purpose

계정의 위트니스 (witness)를 반환합니다.  파라미터: `account:string`

| `account` (string) | |
|--------------------|-|
| `"steemit"` | "steemit"의 위트니스 계정을 조회합니다 (없으면 `null`). |

함께 보기: database_api.list_witnesses

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
    "method": "condenser_api.get_witness_by_account",
    "params": [
      "steemit"
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
  "id": 0,
  "owner": "",
  "created": "1970-01-01T00:00:00",
  "url": "",
  "votes": "0",
  "virtual_last_update": "0",
  "virtual_position": "0",
  "virtual_scheduled_time": "0",
  "total_missed": 0,
  "last_aslot": 0,
  "last_confirmed_block_num": 0,
  "pow_worker": 0,
  "signing_key": "",
  "props": {
    "account_creation_fee": "0.000 STEEM",
    "maximum_block_size": 65536,
    "sbd_interest_rate": 0
  },
  "sbd_exchange_rate": {
    "base": "0.000 SBD",
    "quote": "0.000 STEEM"
  },
  "last_sbd_exchange_update": "1970-01-01T00:00:00",
  "last_work": "",
  "running_version": "",
  "hardfork_version_vote": "",
  "hardfork_time_vote": "1970-01-01T00:00:00"
}
```

</div>
