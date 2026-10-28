---
title: "database_api.list_accounts"
description: "지정된 키 순으로 계정을 나열합니다. 파라미터: start:object, limit:int, order:string"
outline: [2, 3]
---

# database_api.list_accounts

## Purpose

지정된 키 순으로 계정을 나열합니다.  파라미터: `start:object`, `limit:int`, `order:string`

* `limit`는 최대 1000입니다.
* `order`는 다음 중 하나:
  * `by_name` - 계정 이름 순
  * `by_proxy` - 프록시 (proxy) 순
  * `by_next_vesting_withdrawal` - 다음 다음 베스팅 인출 순

| `start` (object) | `limit` (int) | `order` (string) |
|-------------------|-|
| `""` | `10` | `"by_name"` 처음부터 시작하는 계정을, 이름 순으로 최대 10개 조회합니다. |
| `["", ""]` | `10` | `"by_proxy"` 처음부터 시작하는 계정을, 프록시 순으로 최대 10개 조회합니다. |
| `["1960-01-01T00:00:00", ""]` | `10` | `"by_next_vesting_withdrawal"` 처음부터 시작하는 계정을, 다음 베스팅 인출 순으로 최대 10개 조회합니다. |

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
    "method": "database_api.list_accounts",
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
    "method": "database_api.list_accounts",
    "params": {
      "start": [
        "",
        ""
      ],
      "limit": 10,
      "order": "by_proxy"
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
    "method": "database_api.list_accounts",
    "params": {
      "start": [
        "1960-01-01T00:00:00",
        ""
      ],
      "limit": 10,
      "order": "by_next_vesting_withdrawal"
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
  "accounts": [
    {
      "id": 7184,
      "name": "a-0",
      "owner": {
        "weight_threshold": 1,
        "account_auths": [],
        "key_auths": [
          [
            "STM5RrTRNDhhrMaA24SzSeE5AvmUcutb1q1VZp1imnT8p871s3UjN",
            1
          ]
        ]
      },
      "active": {
        "weight_threshold": 1,
        "account_auths": [],
        "key_auths": [
          [
            "STM5RrTRNDhhrMaA24SzSeE5AvmUcutb1q1VZp1imnT8p871s3UjN",
            1
          ]
        ]
      },
      "posting": {
        "weight_threshold": 1,
        "account_auths": [],
        "key_auths": [
          [
            "STM5RrTRNDhhrMaA24SzSeE5AvmUcutb1q1VZp1imnT8p871s3UjN",
            1
          ]
        ]
      },
      "memo_key": "STM5RrTRNDhhrMaA24SzSeE5AvmUcutb1q1VZp1imnT8p871s3UjN",
      "json_metadata": "",
      "proxy": "",
      "last_owner_update": "1970-01-01T00:00:00",
      "last_account_update": "1970-01-01T00:00:00",
      "created": "2016-04-30T12:27:12",
      "mined": true,
      "recovery_account": "steem",
      "last_account_recovery": "1970-01-01T00:00:00",
      "reset_account": "null",
      "comment_count": 0,
      "lifetime_vote_count": 0,
      "post_count": 0,
      "can_vote": true,
      "voting_manabar": {
        "current_mana": 10000,
        "last_update_time": 1462019232
      },
      "balance": {
        "amount": "1",
        "precision": 3,
        "nai": "@@000000021"
      },
      "savings_balance": {
        "amount": "0",
        "precision": 3,
        "nai": "@@000000021"
      },
      "sbd_balance": {
        "amount": "0",
        "precision": 3,
        "nai": "@@000000013"
      },
      "sbd_seconds": "0",
      "sbd_seconds_last_update": "1970-01-01T00:00:00",
      "sbd_last_interest_payment": "1970-01-01T00:00:00",
      "savings_sbd_balance": {
        "amount": "0",
        "precision": 3,
        "nai": "@@000000013"
      },
      "savings_sbd_seconds": "0",
      "savings_sbd_seconds_last_update": "1970-01-01T00:00:00",
      "savings_sbd_last_interest_payment": "1970-01-01T00:00:00",
      "savings_withdraw_requests": 0,
      "reward_sbd_balance": {
        "amount": "0",
        "precision": 3,
        "nai": "@@000000013"
      },
      "reward_steem_balance": {
        "amount": "0",
        "precision": 3,
        "nai": "@@000000021"
      },
      "reward_vesting_balance": {
        "amount": "0",
        "precision": 6,
        "nai": "@@000000037"
      },
      "reward_vesting_steem": {
        "amount": "0",
        "precision": 3,
        "nai": "@@000000021"
      },
      "vesting_shares": {
        "amount": "13873020360",
        "precision": 6,
        "nai": "@@000000037"
      },
      "delegated_vesting_shares": {
        "amount": "0",
        "precision": 6,
        "nai": "@@000000037"
      },
      "received_vesting_shares": {
        "amount": "0",
        "precision": 6,
        "nai": "@@000000037"
      },
      "vesting_withdraw_rate": {
        "amount": "0",
        "precision": 6,
        "nai": "@@000000037"
      },
      "next_vesting_withdrawal": "1969-12-31T23:59:59",
      "withdrawn": 0,
      "to_withdraw": 0,
      "withdraw_routes": 0,
      "curation_rewards": 0,
      "posting_rewards": 0,
      "proxied_vsf_votes": [
        0,
        0,
        0,
        0
      ],
      "witnesses_voted_for": 0,
      "last_post": "1970-01-01T00:00:00",
      "last_root_post": "1970-01-01T00:00:00",
      "last_vote_time": "1970-01-01T00:00:00",
      "post_bandwidth": 0,
      "pending_claimed_accounts": 0,
      "is_smt": false
    }
  ]
}
```

</div>
