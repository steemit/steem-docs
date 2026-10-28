---
title: "condenser_api.broadcast_transaction_synchronous"
description: "트랜잭션을 브로드캐스트하고, 동기적으로 처리될 때까지 기다립니다."
outline: [2, 3]
---

# condenser_api.broadcast_transaction_synchronous

## Purpose

트랜잭션을 브로드캐스트하고, 동기적으로 처리될 때까지 기다립니다.

## Parameters

<div class="code-card code-card-params">
<div class="code-card-title">PARAMETERS</div>

```json
[
  {
    "ref_block_num": 0,
    "ref_block_prefix": 0,
    "expiration": "1970-01-01T00:00:00",
    "operations": [],
    "extensions": [],
    "signatures": []
  }
]
```

</div>

## Example

### Example 1

<div class="code-card code-card-example">
<div class="code-card-title">BASH</div>

```bash
curl -s https://api.steemit.com \
  -H 'Content-Type: application/json' \
  --data-binary '{
    "jsonrpc": "2.0",
    "method": "condenser_api.broadcast_transaction_synchronous",
    "params": [
      {
        "ref_block_num": 1097,
        "ref_block_prefix": 2181793527,
        "expiration": "2016-03-24T18:00:21",
        "operations": [
          [
            "vote",
            {
              "voter": "steemit",
              "author": "alice",
              "permlink": "a-post-by-alice",
              "weight": 10000
            }
          ]
        ],
        "extensions": [],
        "signatures": []
      }
    ],
    "id": 1
  }'
```

</div>

### Example 2

<div class="code-card code-card-example">
<div class="code-card-title">BASH</div>

```bash
curl -s https://api.steemit.com \
  -H 'Content-Type: application/json' \
  --data-binary '{
    "jsonrpc": "2.0",
    "method": "condenser_api.broadcast_transaction_synchronous",
    "params": [
      {
        "ref_block_num": 1097,
        "ref_block_prefix": 2181793527,
        "expiration": "2016-03-24T18:00:21",
        "operations": [
          [
            "pow",
            {
              "worker_account": "cloop3",
              "block_id": "00000449f7860b82b4fbe2f317c670e9f01d6d9a",
              "nonce": 3899,
              "work": {
                "worker": "STM7P5TDnA87Pj9T4mf6YHrhzjC1KbPZpNxLWCcVcHxNYXakpoT4F",
                "input": "ae8e7c677119d22385f8c48026fee7aad7bba693bf788d7f27047f40b47738c0",
                "signature": "1f38fe9a3f9989f84bd94aa5bbc88beaf09b67f825aa4450cf5105d111149ba6db560b582c7dbb026c7fc9c2eb5051815a72b17f6896ed59d3851d9a0f9883ca7a",
                "work": "000e7b209d58f2e64b36e9bf12b999c6c7af168cc3fc41eb7f8a4bf796c174c3"
              },
              "props": {
                "account_creation_fee": "100.000 STEEM",
                "maximum_block_size": 131072,
                "sbd_interest_rate": 1000
              }
            }
          ]
        ],
        "extensions": [],
        "signatures": []
      }
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
  "id": "0000000000000000000000000000000000000000",
  "block_num": 0,
  "trx_num": 0,
  "expired": false
}
```

</div>

## Expected curl responses

<div class="code-card code-card-response">
<div class="code-card-title">EXPECTED RESPONSES</div>

```text
missing required posting authority
```

```text
Asset has to treated as object.
```

</div>
