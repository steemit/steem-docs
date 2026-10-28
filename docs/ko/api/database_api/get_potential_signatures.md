---
title: "database_api.get_potential_signatures"
description: "이 메서드는 주어진 트랜잭션에 서명할 수 있는 모든 공개 키의 집합을 반환합니다. 이 호출은 지갑이 get_required_signatures를 호출해 최소 부분집합을 구하기 전에, 자신의 공개 키 집합을 관련 있는 부분집합만 남도록 걸러내는 데 사용할 수 있습니다."
outline: [2, 3]
---

# database_api.get_potential_signatures

## Purpose

이 메서드는 주어진 트랜잭션에 서명할 수 있는 모든 공개 키의 집합을 반환합니다.  이 호출은 지갑이 `get_required_signatures`를 호출해 최소 부분집합을 구하기 전에, 자신의 공개 키 집합을 관련 있는 부분집합만 남도록 걸러내는 데 사용할 수 있습니다.

## Parameters

<div class="code-card code-card-params">
<div class="code-card-title">PARAMETERS</div>

```json
{
  "trx": {
    "ref_block_num": 0,
    "ref_block_prefix": 0,
    "expiration": "1970-01-01T00:00:00",
    "operations": [],
    "extensions": [],
    "signatures": []
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
    "method": "database_api.get_potential_signatures",
    "params": {
      "trx": {
        "ref_block_num": 1097,
        "ref_block_prefix": 2181793527,
        "expiration": "2016-03-24T18:00:21",
        "operations": [
          {
            "type": "pow_operation",
            "value": {
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
          }
        ],
        "extensions": [],
        "signatures": []
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
{
  "keys": []
}
```

</div>
