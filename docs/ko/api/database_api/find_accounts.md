---
title: "database_api.find_accounts"
description: "이름으로 계정을 조회하여 반환합니다. 파라미터: account:string array"
outline: [2, 3]
---

# database_api.find_accounts

## Purpose

이름으로 계정을 조회하여 반환합니다.  파라미터: `account:string array`

| `account` (string array) | |
|-------------------|-|
| `["steemit"]` | "steemit"이라는 이름의 계정을 조회합니다. |
| `["steemit", "alice"]` | "steemit"과 "alice"이라는 이름의 계정을 조회합니다. |

## Parameters

<div class="code-card code-card-params">
<div class="code-card-title">PARAMETERS</div>

```json
{
  "accounts": []
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
    "method": "database_api.find_accounts",
    "params": {
      "accounts": [
        "steemit"
      ]
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
    "method": "database_api.find_accounts",
    "params": {
      "accounts": [
        "steemit",
        "alice"
      ]
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
      "id": 28,
      "name": "steemit",
      "owner": {
        "weight_threshold": 1,
        "account_auths": [],
        "key_auths": [
          [
            "STM6Ezkzey8FWoEnnHHP4rxbrysJqoMmzwR2EdoD5p7FDsF64qxbQ",
            1
          ],
          [
            "STM7TCZKisQnvR69CK9BaL6W4SJn2cXYwkfWYRicoVGGzhtFswxMH",
            1
          ]
        ]
      },
      "active": {
        "weight_threshold": 1,
        "account_auths": [],
        "key_auths": [
          [
            "STM5VkLha96X5EQu3HSkJdD8SEuwazWtZrzLjUT6Sc5sopgghBYrz",
            1
          ],
          [
            "STM7u1BsoqLaoCu9XHi1wjWctLWSFCuvyagFjYMfga4QNWEjP7d3U",
            1
          ]
        ]
      },
      "posting": {
        "weight_threshold": 1,
        "account_auths": [],
        "key_auths": [
          [
            "STM6kXdRbWgoH9E4hvtTZeaiSbY8FmGXQavfJZ2jzkKjT5cWYgMBS",
            1
          ],
          [
            "STM6tDMSSKa8Bd9ss7EjqhXPEHTWissGXJJosAU94LLpC5tsCdo61",
            1
          ]
        ]
      },
      "memo_key": "STM5jZtLoV8YbxCxr4imnbWn61zMB24wwonpnVhfXRmv7j6fk3dTH",
      "json_metadata": "",
      "proxy": "",
      "last_owner_update": "2018-05-31T23:32:06",
      "last_account_update": "2018-05-31T23:32:06",
      "created": "2016-03-24T17:00:21",
      "mined": true,
      "recovery_account": "steem",
      "last_account_recovery": "1970-01-01T00:00:00",
      "reset_account": "null",
      "comment_count": 0,
      "lifetime_vote_count": 0,
      "post_count": 1,
      "can_vote": true,
      "voting_manabar": {
        "current_mana": "69835912701503862",
        "last_update_time": 1538171805
      },
      "balance": {
        "amount": "2806644634",
        "precision": 3,
        "nai": "@@000000021"
      },
      "savings_balance": {
        "amount": "0",
        "precision": 3,
        "nai": "@@000000021"
      },
      "sbd_balance": {
        "amount": "8716535",
        "precision": 3,
        "nai": "@@000000013"
      },
      "sbd_seconds": "0",
      "sbd_seconds_last_update": "2018-11-12T02:39:39",
      "sbd_last_interest_payment": "2018-11-12T02:39:39",
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
        "amount": "90039851836689703",
        "precision": 6,
        "nai": "@@000000037"
      },
      "delegated_vesting_shares": {
        "amount": "20203939135185841",
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
      "posting_rewards": 3548,
      "proxied_vsf_votes": [
        "14953279511",
        0,
        0,
        0
      ],
      "witnesses_voted_for": 0,
      "last_post": "2016-03-30T18:30:18",
      "last_root_post": "2016-03-30T18:30:18",
      "last_vote_time": "2016-12-04T23:10:57",
      "post_bandwidth": 0,
      "pending_claimed_accounts": 0,
      "is_smt": false
    }
  ]
}
```

</div>
