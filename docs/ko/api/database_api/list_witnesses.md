---
title: "database_api.list_witnesses"
description: "위트니스 목록을 반환합니다. 파라미터: start:object; limit:int; order:string"
outline: [2, 3]
---

# database_api.list_witnesses

## Purpose

위트니스 목록을 반환합니다.  파라미터: `start:object`; `limit:int`; `order:string`

* `start`는 `order`에 따라 달라집니다(아래 참조)
* `limit`는 최대 1000입니다.
* `order`는 다음 중 하나입니다:
  * `by_name` - 이름 기준 정렬
    * `start`는 문자열 값: `account`
  * `by_vote_name` - 투표, 이름 기준 정렬
    * `start`는 두 값(`votes`, `account`)의 배열
  * `by_schedule_time` - 스케줄 시간 기준 정렬
    * `start`는 두 값(`virtual_scheduled_time`, `account`)의 배열

| `start` (object) | `limit` (int) | `order` (string) | |
|----------------------------|---------------|-|
| `""` | 10 | `"by_name"` | 첫 10개 위트니스를 계정 이름 기준 정렬로 조회합니다 |
| `[0, ""]` | 10 | `"by_vote_name"` | 첫 10개 위트니스를 투표 수 기준 정렬로 조회합니다 |
| `["473718186844702107410533306", "alice"]` | 10 | `"by_schedule_time"` | 첫 10개 위트니스를 스케줄 기준 정렬로 조회합니다 |

추가 참조: Paginated API Methods

## Parameters

<div class="code-card code-card-params">
<div class="code-card-title">PARAMETERS</div>

```json
{
  "start": null,
  "limit": 0,
  "order": "by_name"
}
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
    "method": "database_api.list_witnesses",
    "params": {
      "start": "",
      "limit": 10,
      "order": "by_name"
    },
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
    "method": "database_api.list_witnesses",
    "params": {
      "start": [
        0,
        ""
      ],
      "limit": 10,
      "order": "by_vote_name"
    },
    "id": 1
  }'
```

</div>

### Example 3

<div class="code-card code-card-example">
<div class="code-card-title">BASH</div>

```bash
curl -s https://api.steemit.com \
  -H 'Content-Type: application/json' \
  --data-binary '{
    "jsonrpc": "2.0",
    "method": "database_api.list_witnesses",
    "params": {
      "start": [
        "473718186844702107410533306",
        "alice"
      ],
      "limit": 10,
      "order": "by_schedule_time"
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
      "id": 6950,
      "owner": "a-0",
      "created": "1970-01-01T00:00:00",
      "url": "",
      "votes": 0,
      "virtual_last_update": "0",
      "virtual_position": "0",
      "virtual_scheduled_time": "340282366920938463463374607431768211455",
      "total_missed": 0,
      "last_aslot": 1063323,
      "last_confirmed_block_num": 1040423,
      "pow_worker": 0,
      "signing_key": "STM5RrTRNDhhrMaA24SzSeE5AvmUcutb1q1VZp1imnT8p871s3UjN",
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
      "last_work": "000000127cb0e335667f30100bc1a061175c2d789f808e0e9ac82ee70fa8e604",
      "running_version": "0.0.0",
      "hardfork_version_vote": "0.0.0",
      "hardfork_time_vote": "2016-03-24T16:00:00",
      "available_witness_account_subsidies": 0
    }
  ]
}
```

</div>
