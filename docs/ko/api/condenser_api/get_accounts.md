---
title: "condenser_api.get_accounts"
description: "이름으로 계정을 조회하여 반환합니다. 파라미터: account:string array"
outline: [2, 3]
---

# condenser_api.get_accounts

## Purpose

이름으로 계정을 조회하여 반환합니다.  파라미터: `account:string array`

| `account` (string array) | |
|-------------------|-|
| `["steemit"]` | "steemit"이라는 이름의 계정을 조회합니다. |
| `["steemit", "alice"]` | "steemit"과 "alice"이라는 이름의 계정을 조회합니다. |

추가 참조: database_api.find_accounts

## Parameters

<div class="code-card code-card-params">
<div class="code-card-title">PARAMETERS</div>

```json
[
  [
    ""
  ]
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
    "method": "condenser_api.get_accounts",
    "params": [
      [
        "steemit"
      ]
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
    "method": "condenser_api.get_accounts",
    "params": [
      [
        "steemit",
        "alice"
      ]
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
    "name": "",
    "owner": {
      "weight_threshold": 0,
      "account_auths": [],
      "key_auths": [
        [
          "",
          0
        ],
        [
          "",
          0
        ],
        [
          "",
          0
        ]
      ]
    },
    "active": {
      "weight_threshold": 0,
      "account_auths": [],
      "key_auths": [
        [
          "",
          0
        ],
        [
          "",
          0
        ]
      ]
    },
    "posting": {
      "weight_threshold": 0,
      "account_auths": [],
      "key_auths": [
        [
          "",
          0
        ],
        [
          "",
          0
        ],
        [
          "",
          0
        ]
      ]
    },
    "memo_key": "",
    "json_metadata": "",
    "proxy": "",
    "last_owner_update": "2017-03-16T21:17:51",
    "last_account_update": "2017-03-16T23:10:36",
    "created": "2016-03-24T17:00:21",
    "mined": false,
    "recovery_account": "",
    "last_account_recovery": "1970-01-01T00:00:00",
    "reset_account": "null",
    "comment_count": 0,
    "lifetime_vote_count": 0,
    "post_count": 0,
    "can_vote": false,
    "voting_power": 0,
    "last_vote_time": "2016-12-04T23:10:57",
    "balance": "0.000 STEEM",
    "savings_balance": "0.0 STEEM",
    "sbd_balance": "0.0 SBD",
    "sbd_seconds": "",
    "sbd_seconds_last_update": "2018-04-10T04:08:36",
    "sbd_last_interest_payment": "2018-03-15T17:58:24",
    "savings_sbd_balance": "0.000 SBD",
    "savings_sbd_seconds": "",
    "savings_sbd_seconds_last_update": "1970-01-01T00:00:00",
    "savings_sbd_last_interest_payment": "1970-01-01T00:00:00",
    "savings_withdraw_requests": 0,
    "reward_sbd_balance": "0.000 SBD",
    "reward_steem_balance": "0.000 STEEM",
    "reward_vesting_balance": "0.000000 VESTS",
    "reward_vesting_steem": "0.000 STEEM",
    "vesting_shares": "0.000 VESTS",
    "delegated_vesting_shares": "0.000000 VESTS",
    "received_vesting_shares": "0.000000 VESTS",
    "vesting_withdraw_rate": "0.000000 VESTS",
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
    "last_post": "2016-03-30T18:30:18",
    "last_root_post": "2016-03-30T18:30:18",
    "vesting_balance": "0.000 STEEM",
    "reputation": "",
    "transfer_history": [],
    "market_history": [],
    "post_history": [],
    "vote_history": [],
    "other_history": [],
    "witness_votes": [],
    "tags_usage": [],
    "guest_bloggers": []
  }
]
```

</div>
