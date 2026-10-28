---
title: "database_api.list_vesting_delegation_expirations"
description: "베스팅 위임 만료(vesting delegation expiration) 목록을 반환합니다. 파라미터: start:array, limit:int, order:string"
outline: [2, 3]
---

# database_api.list_vesting_delegation_expirations

<p class="api-badges"><span class="badge badge-since">since HF17</span></p>

## Purpose

베스팅 위임 만료(vesting delegation expiration) 목록을 반환합니다.  파라미터: `start:array`, `limit:int`, `order:string`

* `limit`는 최대 1000입니다.
* `order`는 다음 중 하나입니다:
  * `by_expiration` - 만료 기준 정렬
    * `start`는 두 값(`timestamp`, `expiration_id`)의 배열
  * `by_account_expiration` - 계정 만료 기준 정렬
    * `start`는 두 값의 배열: `account`, `timestamp`, `expiration_id`

| `start` (array) | `limit` (int) | `order` (string) | |
|-------------------|-|-|-|
| `["1970-01-01T00:00:00", 0]` | 10 | `by_expiration` | 위임(delegation)을 최대 10개 결과로, 만료 기준 정렬로 조회합니다. |
| `["alice", "1970-01-01T00:00:00", 0]` | 10 | `by_account_expiration`| 이 날짜부터의 위임을 최대 10개 결과로, 계정 만료 기준 정렬로 조회합니다. |

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
    "method": "database_api.list_vesting_delegation_expirations",
    "params": {
      "start": [
        "1970-01-01T00:00:00",
        0
      ],
      "limit": 10,
      "order": "by_expiration"
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
    "method": "database_api.list_vesting_delegation_expirations",
    "params": {
      "start": [
        "alice",
        "1970-01-01T00:00:00",
        0
      ],
      "limit": 10,
      "order": "by_account_expiration"
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
  "delegations": [
    {
      "id": 3076685,
      "delegator": "anonsteem",
      "vesting_shares": {
        "amount": "6050629930",
        "precision": 6,
        "nai": "@@000000037"
      },
      "expiration": "2018-12-05T07:07:15"
    }
  ]
}
```

</div>
