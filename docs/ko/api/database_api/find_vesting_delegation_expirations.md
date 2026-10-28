---
title: "database_api.find_vesting_delegation_expirations"
description: "계정의 만료 예정 베스팅 위임(vesting delegation)을 반환합니다. 파라미터: account:string"
outline: [2, 3]
---

# database_api.find_vesting_delegation_expirations

<p class="api-badges"><span class="badge badge-since">since HF17</span></p>

## Purpose

계정의 만료 예정 베스팅 위임(vesting delegation)을 반환합니다.  파라미터: `account:string`

| `account` (string) | | |
|----------------------------|---------------|-|
| `"steemit"` | | `steemit`의 만료 예정 베스팅을 조회합니다. |
| `"alice"` | | `alice`의 만료 예정 베스팅을 조회합니다. |

## Parameters

<div class="code-card code-card-params">
<div class="code-card-title">PARAMETERS</div>

```json
{
  "account": ""
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
    "method": "database_api.find_vesting_delegation_expirations",
    "params": {
      "account": "steemit"
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
    "method": "database_api.find_vesting_delegation_expirations",
    "params": {
      "account": "alice"
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
      "id": 3077902,
      "delegator": "steem",
      "vesting_shares": {
        "amount": "201417615",
        "precision": 6,
        "nai": "@@000000037"
      },
      "expiration": "2018-12-05T21:46:48"
    }
  ]
}
```

</div>
