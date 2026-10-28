---
title: "condenser_api.get_state"
description: "경로의 상태를 반환합니다. 지원 중단(deprecated). 파라미터: path:string"
outline: [2, 3]
---

# condenser_api.get_state

<p class="api-badges"><span class="badge badge-deprecated">deprecated</span></p>

## Purpose

경로의 상태를 반환합니다.  **지원 중단(deprecated).**  파라미터: `path:string`

## Parameters

<div class="code-card code-card-params">
<div class="code-card-title">PARAMETERS</div>

```json
[
  ""
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
    "method": "condenser_api.get_state",
    "params": [
      "/@steemit"
    ],
    "id": 1
  }'
```

</div>

## Response

<div class="code-card code-card-response">
<div class="code-card-title">RESPONSE</div>

```json
{
  "current_route": "",
  "props": {
    "head_block_number": 0,
    "head_block_id": "0000000000000000000000000000000000000000",
    "time": "1970-01-01T00:00:00",
    "current_witness": "",
    "total_pow": "18446744073709551615",
    "num_pow_witnesses": 0,
    "virtual_supply": "0.000 STEEM",
    "current_supply": "0.000 STEEM",
    "confidential_supply": "0.000 STEEM",
    "current_sbd_supply": "0.000 STEEM",
    "confidential_sbd_supply": "0.000 STEEM",
    "total_vesting_fund_steem": "0.000 STEEM",
    "total_vesting_shares": "0.000 STEEM",
    "total_reward_fund_steem": "0.000 STEEM",
    "total_reward_shares2": "0",
    "pending_rewarded_vesting_shares": "0.000 STEEM",
    "pending_rewarded_vesting_steem": "0.000 STEEM",
    "sbd_interest_rate": 0,
    "sbd_print_rate": 10000,
    "maximum_block_size": 0,
    "current_aslot": 0,
    "recent_slots_filled": "0",
    "participation_count": 0,
    "last_irreversible_block_num": 0,
    "vote_power_reserve_rate": 40,
    "average_block_size": 0,
    "current_reserve_ratio": 1,
    "max_virtual_bandwidth": "0"
  },
  "tag_idx": {
    "trending": []
  },
  "tags": {},
  "content": {},
  "accounts": {},
  "witnesses": {},
  "discussion_idx": {},
  "witness_schedule": {
    "id": 0,
    "current_virtual_time": "0",
    "next_shuffle_block_num": 1,
    "current_shuffled_witnesses": [],
    "num_scheduled_witnesses": 1,
    "top19_weight": 1,
    "timeshare_weight": 5,
    "miner_weight": 1,
    "witness_pay_normalization_factor": 25,
    "median_props": {
      "account_creation_fee": "0.000 STEEM",
      "maximum_block_size": 131072,
      "sbd_interest_rate": 1000
    },
    "majority_version": "0.0.0",
    "max_voted_witnesses": 19,
    "max_miner_witnesses": 1,
    "max_runner_witnesses": 1,
    "hardfork_required_witnesses": 17
  },
  "feed_price": {
    "base": "0.000 STEEM",
    "quote": "0.000 STEEM"
  },
  "error": ""
}
```

</div>
