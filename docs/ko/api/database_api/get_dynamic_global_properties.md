---
title: "database_api.get_dynamic_global_properties"
description: "현재 동적 전역 속성을 반환합니다. 참고: Understanding Dynamic Global Properties"
outline: [2, 3]
---

# database_api.get_dynamic_global_properties

## Purpose

현재 동적 전역 속성을 반환합니다.  참고: Understanding Dynamic Global Properties

## Parameters

<div class="code-card code-card-params">
<div class="code-card-title">PARAMETERS</div>

```json
{}
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
    "method": "database_api.get_dynamic_global_properties",
    "id": 1
  }'
```

</div>

## Response

<div class="code-card code-card-response">
<div class="code-card-title">RESPONSE</div>

```json
{
  "id": 0,
  "head_block_number": 0,
  "head_block_id": "0000000000000000000000000000000000000000",
  "time": "1970-01-01T00:00:00",
  "current_witness": "",
  "total_pow": "18446744073709551615",
  "num_pow_witnesses": 0,
  "virtual_supply": {
    "amount": "0",
    "precision": 3,
    "nai": "@@000000021"
  },
  "current_supply": {
    "amount": "0",
    "precision": 3,
    "nai": "@@000000021"
  },
  "confidential_supply": {
    "amount": "0",
    "precision": 3,
    "nai": "@@000000021"
  },
  "init_sbd_supply": {
    "amount": "0",
    "precision": 3,
    "nai": "@@000000013"
  },
  "current_sbd_supply": {
    "amount": "0",
    "precision": 3,
    "nai": "@@000000013"
  },
  "confidential_sbd_supply": {
    "amount": "0",
    "precision": 3,
    "nai": "@@000000013"
  },
  "total_vesting_fund_steem": {
    "amount": "0",
    "precision": 3,
    "nai": "@@000000021"
  },
  "total_vesting_shares": {
    "amount": "0",
    "precision": 6,
    "nai": "@@000000037"
  },
  "total_reward_fund_steem": {
    "amount": "0",
    "precision": 3,
    "nai": "@@000000021"
  },
  "total_reward_shares2": "0",
  "pending_rewarded_vesting_shares": {
    "amount": "0",
    "precision": 6,
    "nai": "@@000000037"
  },
  "pending_rewarded_vesting_steem": {
    "amount": "0",
    "precision": 3,
    "nai": "@@000000021"
  },
  "sbd_interest_rate": 0,
  "sbd_print_rate": 10000,
  "maximum_block_size": 0,
  "required_actions_partition_percent": 0,
  "current_aslot": 0,
  "recent_slots_filled": "0",
  "participation_count": 0,
  "last_irreversible_block_num": 0,
  "vote_power_reserve_rate": 40,
  "delegation_return_period": 3600,
  "reverse_auction_seconds": 0,
  "available_account_subsidies": 0,
  "sbd_stop_percent": 0,
  "sbd_start_percent": 0,
  "sbd_stop_adjust": 0,
  "next_maintenance_time": "1970-01-01T00:00:00",
  "last_budget_time": "1970-01-01T00:00:00",
  "content_reward_percent": 7500,
  "vesting_reward_percent": 1500,
  "sps_fund_percent": 0,
  "sps_interval_ledger": {
    "amount": "0",
    "precision": 3,
    "nai": "@@000000013"
  },
  "downvote_pool_percent": 0,
  "smt_creation_fee": {
    "amount": "1000",
    "precision": 3,
    "nai": "@@000000013"
  }
}
```

</div>
