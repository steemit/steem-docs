---
title: "condenser_api.get_required_signatures"
description: "이 API는 부분 서명된 트랜잭션과, 소유자가 서명할 수 있는 공개 키 집합을 받아서, 트랜잭션에 서명을 추가해야 하는 공개 키의 최소 부분집합을 반환합니다. 파라미터: trx:object; available_keys:[string]"
outline: [2, 3]
---

# condenser_api.get_required_signatures

## Purpose

이 API는 부분 서명된 트랜잭션과, 소유자가 서명할 수 있는 공개 키 집합을 받아서, 트랜잭션에 서명을 추가해야 하는 공개 키의 최소 부분집합을 반환합니다. 파라미터: `trx:object`; `available_keys:[string]`

함께 보기: database_api.get_required_signatures

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
  },
  []
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
    "method": "condenser_api.get_required_signatures",
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
                "account_creation_fee": {
                  "amount": "100000",
                  "precision": 3,
                  "nai": "@@000000021"
                },
                "maximum_block_size": 131072,
                "sbd_interest_rate": 1000
              }
            }
          ]
        ],
        "extensions": [],
        "signatures": []
      },
      []
    ],
    "id": 1
  }'
```

</div>
