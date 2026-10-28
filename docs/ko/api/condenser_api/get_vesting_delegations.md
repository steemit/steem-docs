---
title: "condenser_api.get_vesting_delegations"
description: "계정이 행한 베스팅 위임 (vesting delegation)을 반환합니다. 파라미터: delegator_account:string; start_account:string; limit:int 최대 1000"
outline: [2, 3]
---

# condenser_api.get_vesting_delegations

<p class="api-badges"><span class="badge badge-since">since HF17</span></p>

## Purpose

계정이 행한 베스팅 위임 (vesting delegation)을 반환합니다.  파라미터: `delegator_account:string`; `start_account:string`; `limit:int` 최대 1000

| `delegator_account` (string) | `start_account` (string) | `limit` (int) | |
|------------------------------|--------------------------|---------------|-|
| `"steemit"` | `null` | `10` | "steemit"이 행한 베스팅 위임을 최대 10건 조회합니다. |

함께 보기: database_api.list_vesting_delegations, Paginated API Methods, Paginated API Methods

## Parameters

<div class="code-card code-card-params">
<div class="code-card-title">PARAMETERS</div>

```json
[
  "",
  "",
  1
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
    "method": "condenser_api.get_vesting_delegations",
    "params": [
      "steemit",
      null,
      10
    ],
    "id": 1
  }'
```

</div>

## Response

<div class="code-card code-card-response">
<div class="code-card-title">RESPONSE</div>

```json
[
  {
    "id": 0,
    "delegator": "",
    "delegatee": "",
    "vesting_shares": "0.000000 VESTS",
    "min_delegation_time": "1970-01-01T00:00:00"
  }
]
```

</div>
