---
title: "database_api.list_vesting_delegations"
description: "베스팅 위임 (vesting delegation) 목록을 반환합니다. 파라미터: start:array, limit:int, order:string"
outline: [2, 3]
---

# database_api.list_vesting_delegations

<p class="api-badges"><span class="badge badge-since">since HF17</span></p>

## Purpose

베스팅 위임 (vesting delegation) 목록을 반환합니다.  파라미터: `start:array`, `limit:int`, `order:string`

* `limit`는 최대 1000입니다.
* `order`는 다음 중 하나:
  * `by_delegation` - 위임 순
    * `start`는 `delegator`, `delegatee` 두 값으로 이루어진 배열입니다

| `start` (array) | `limit` (int) | `order` (string) | |
|-------------------|-|-|-|
| `["", ""]` | 10 | `by_delegation` | 위임을, 결과 10개로 제한하고 위임 순으로 정렬하여 조회합니다. |

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

<div class="code-card code-card-example">
<div class="code-card-title">BASH</div>

```bash
curl -s https://api.steemit.com \
  -H 'Content-Type: application/json' \
  --data-binary '{
    "jsonrpc": "2.0",
    "method": "database_api.list_vesting_delegations",
    "params": {
      "start": [
        "",
        ""
      ],
      "limit": 10,
      "order": "by_delegation"
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
      "id": 554317,
      "delegator": "a-0-0-0",
      "delegatee": "a-0-0",
      "vesting_shares": {
        "amount": "6141067173",
        "precision": 6,
        "nai": "@@000000037"
      },
      "min_delegation_time": "2018-01-24T22:23:54"
    }
  ]
}
```

</div>
