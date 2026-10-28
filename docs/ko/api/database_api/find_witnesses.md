---
title: "database_api.find_witnesses"
description: "위트니스 (witness)를 검색합니다."
outline: [2, 3]
---

# database_api.find_witnesses

## Purpose

위트니스 (witness)를 검색합니다.

## Parameters

<div class="code-card code-card-params">
<div class="code-card-title">PARAMETERS</div>

```json
{
  "owners": []
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
    "method": "database_api.find_witnesses",
    "params": {
      "owners": [
        "initminer"
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
  "witnesses": [
    {
      "id": 0,
      "owner": "initminer",
      "created": "1970-01-01T00:00:00",
      "url": "",
      "votes": 0,
      "virtual_last_update": "225400650183277777230188182",
      "virtual_position": "28933178228158941342755574680549120",
      "virtual_scheduled_time": "340253433742935705172215129634317850517",
      "total_missed": 88,
      "last_aslot": 1202,
      "last_confirmed_block_num": 1092,
      "pow_worker": 0,
      "signing_key": "STM8GC13uCZbP44HzMLV6zPZGwVQ8Nt4Kji8PapsPiNq1BK153XTX",
      "props": {
        "account_creation_fee": {
          "amount": "1",
          "precision": 3,
          "nai": "@@000000021"
        },
        "maximum_block_size": 131072,
        "sbd_interest_rate": 1000,
        "account_subsidy_budget": 797,
        "account_subsidy_decay": 347321
      },
      "sbd_exchange_rate": {
        "base": {
          "amount": "0",
          "precision": 3,
          "nai": "@@000000021"
        },
        "quote": {
          "amount": "0",
          "precision": 3,
          "nai": "@@000000021"
        }
      },
      "last_sbd_exchange_update": "1970-01-01T00:00:00",
      "last_work": "0000000000000000000000000000000000000000000000000000000000000000",
      "running_version": "0.0.0",
      "hardfork_version_vote": "0.0.0",
      "hardfork_time_vote": "2016-03-24T16:00:00",
      "available_witness_account_subsidies": 0
    }
  ]
}
```

</div>
