---
title: "condenser_api.lookup_account_names"
description: "계정 이름을 조회합니다. accounts:[string]"
outline: [2, 3]
---

# condenser_api.lookup_account_names

## Purpose

계정 이름을 조회합니다.  `accounts:[string]`

함께 보기: database_api.find_accounts

## Parameters

<div class="code-card code-card-params">
<div class="code-card-title">PARAMETERS</div>

```json
[
  [
    "steemit"
  ]
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
    "method": "condenser_api.lookup_account_names",
    "params": [
      [
        "steemit"
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
    "id": 28,
    "name": "steemit",
    "owner": {
      "weight_threshold": 1,
      "account_auths": [],
      "key_auths": [
        [
          "STM5tfrdPG1Ycjwa9FuBUueDFFyygndBLXdVEEs2c9eRKScnFk6vM",
          1
        ],
        [
          "STM71f6yWztimJuREVyyMXNqAVbx1FzPVW6LLXNoQ35dHwKuszmHX",
          1
        ],
        [
          "STM7U3ymhUTuKME72dpdpQkdQvh722gTLjKBKtmKQPPWgtkr418Nf",
          1
        ]
      ]
    },
    "active": {
      "weight_threshold": 1,
      "account_auths": [],
      "key_auths": [
        [
          "STM5832HKCJzs6K3rRCsZ1PidTKgjF38ZJb718Y3pCW92HEMsCGPf",
          1
        ],
        [
          "STM7Q2rLBqzPzFeteQZewv9Lu3NLE69fZoLeL6YK59t7UmssCBNTU",
          1
        ]
      ]
    },
    "posting": {
      "weight_threshold": 1,
      "account_auths": [],
      "key_auths": [
        [
          "STM5jZtLoV8YbxCxr4imnbWn61zMB24wwonpnVhfXRmv7j6fk3dTH",
          1
        ],
        [
          "STM7xVFaqi8RxhWKZwuLA2bKrAiQmhnrbgvw4e2ChAsKYQbPjqUq2",
          1
        ],
        [
          "STM83dmDkQcZU9X8MWcxsTztSyutE6udrb55PvYgu7RLzStaoAt67",
          1
        ]
      ]
    },
    "memo_key": "STM5jZtLoV8YbxCxr4imnbWn61zMB24wwonpnVhfXRmv7j6fk3dTH",
    "json_metadata": "",
    "proxy": "",
    "last_owner_update": "2017-03-16T21:17:51",
    "last_account_update": "2017-03-16T23:10:36",
    "created": "2016-03-24T17:00:21",
    "mined": true,
    "recovery_account": "steem",
    "last_account_recovery": "1970-01-01T00:00:00",
    "reset_account": "null",
    "comment_count": 0,
    "lifetime_vote_count": 0,
    "post_count": 1,
    "can_vote": true,
    "voting_power": 9950,
    "last_vote_time": "2016-12-04T23:10:57",
    "balance": "0.006 STEEM",
    "savings_balance": "11006644.632 STEEM",
    "sbd_balance": "8581.890 SBD",
    "sbd_seconds": "18846158467785",
    "sbd_seconds_last_update": "2018-04-10T04:08:36",
    "sbd_last_interest_payment": "2018-03-15T17:58:24",
    "savings_sbd_balance": "0.000 SBD",
    "savings_sbd_seconds": "0",
    "savings_sbd_seconds_last_update": "1970-01-01T00:00:00",
    "savings_sbd_last_interest_payment": "1970-01-01T00:00:00",
    "savings_withdraw_requests": 0,
    "reward_sbd_balance": "0.000 SBD",
    "reward_steem_balance": "0.000 STEEM",
    "reward_vesting_balance": "0.000000 VESTS",
    "reward_vesting_steem": "0.000 STEEM",
    "vesting_shares": "90039851836.689703 VESTS",
    "delegated_vesting_shares": "0.000000 VESTS",
    "received_vesting_shares": "0.000000 VESTS",
    "vesting_withdraw_rate": "0.000000 VESTS",
    "next_vesting_withdrawal": "1969-12-31T23:59:59",
    "withdrawn": 0,
    "to_withdraw": 0,
    "withdraw_routes": 0,
    "curation_rewards": 0,
    "posting_rewards": 3548,
    "proxied_vsf_votes": [
      "28583799126",
      0,
      0,
      0
    ],
    "witnesses_voted_for": 0,
    "last_post": "2016-03-30T18:30:18",
    "last_root_post": "2016-03-30T18:30:18"
  }
]
```

</div>
