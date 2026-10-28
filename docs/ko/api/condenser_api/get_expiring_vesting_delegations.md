---
title: "condenser_api.get_expiring_vesting_delegations"
description: "계정의 만료 예정인 베스팅 위임 (vesting delegation)을 반환합니다. 파라미터: account:string, after:timestamp"
outline: [2, 3]
---

# condenser_api.get_expiring_vesting_delegations

<p class="api-badges"><span class="badge badge-since">since HF17</span></p>

## Purpose

계정의 만료 예정인 베스팅 위임 (vesting delegation)을 반환합니다.  파라미터: `account:string`, `after:timestamp`

| `account` (string) | `after` (timestamp) | |
|----------------------------|---------------|-|
| `"steemit"` | `"2018-01-01T00:00:00"` | 2018년 1월 1일 이후에 만료되는 베스팅을 조회합니다. |
| `"alice"` | `"2017-12-01T00:00:00"` | 2017년 12월 1일 이후에 만료되는 베스팅을 조회합니다. |

## Parameters

<div class="code-card code-card-params">
<div class="code-card-title">PARAMETERS</div>

```json
[
  "",
  "1970-01-01T00:00:00"
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
    "method": "condenser_api.get_expiring_vesting_delegations",
    "params": [
      "steemit",
      "2018-01-01T00:00:00"
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
    "method": "condenser_api.get_expiring_vesting_delegations",
    "params": [
      "alice",
      "2017-12-01T00:00:00"
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
    "vesting_shares": "0.000000 VESTS",
    "expiration": "1970-01-01T00:00:00"
  }
]
```

</div>
