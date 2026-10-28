---
title: "database_api.list_vesting_delegation_expirations"
description: "베스팅 위임 만료 목록을 반환합니다. 파라미터: start:array, limit:int, order:string"
outline: [2, 3]
---

# database_api.list_vesting_delegation_expirations

<p class="api-badges"><span class="badge badge-since">since HF17</span></p>

## Purpose

베스팅 위임 만료 목록을 반환합니다.  파라미터: `start:array`, `limit:int`, `order:string`

* `limit`는 최대 1000입니다.
* `order`는 다음 중 하나:
  * `by_expiration` - 만료일 순
    * `start`는 `timestamp`, `expiration_id` 두 값으로 이루어진 배열입니다
  * `by_account_expiration` - 계정 만료 순
    * `start`는 `account`, `timestamp`, `expiration_id` 세 값으로 이루어진 배열입니다

| `start` (array) | `limit` (int) | `order` (string) | |
|-------------------|-|-|-|
| `["1970-01-01T00:00:00", 0]` | 10 | `by_expiration` | 위임을, 결과 10개로 제한하고 만료일 순으로 정렬하여 조회합니다. |
| `["alice", "1970-01-01T00:00:00", 0]` | 10 | `by_account_expiration`| 이 날짜 이후의 위임을, 결과 10개로 제한하고 계정 만료 순으로 정렬하여 조회합니다. |

함께 보기: Paginated API Methods

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
