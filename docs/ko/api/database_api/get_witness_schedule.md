---
title: "database_api.get_witness_schedule"
description: "현재 위트니스 스케줄을 반환합니다."
outline: [2, 3]
---

# database_api.get_witness_schedule

## Purpose

현재 위트니스 스케줄을 반환합니다.

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
    "method": "database_api.get_witness_schedule",
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
  "current_virtual_time": "0",
  "next_shuffle_block_num": 76479392,
  "current_shuffled_witnesses": [],
  "num_scheduled_witnesses": 0,
  "elected_weight": 132,
  "timeshare_weight": 86,
  "miner_weight": 125,
  "witness_pay_normalization_factor": 32767,
  "median_props": {
    "account_creation_fee": {
      "amount": "1",
      "precision": 3,
      "nai": "@@000000021"
    },
    "maximum_block_size": 131072,
    "sbd_interest_rate": 1000,
    "account_subsidy_budget": 797,
    "account_subsidy_decay": 347321
  },
  "majority_version": "0.0.0",
  "max_voted_witnesses": 0,
  "max_miner_witnesses": 0,
  "max_runner_witnesses": 0,
  "hardfork_required_witnesses": 0,
  "account_subsidy_rd": {
    "resource_unit": 0,
    "budget_per_time_unit": 0,
    "pool_eq": 0,
    "max_pool_size": 0,
    "decay_params": {
      "decay_per_time_unit": 0,
      "decay_per_time_unit_denom_shift": 0
    },
    "min_decay": 0
  },
  "account_subsidy_witness_rd": {
    "resource_unit": 0,
    "budget_per_time_unit": 0,
    "pool_eq": 0,
    "max_pool_size": 0,
    "decay_params": {
      "decay_per_time_unit": 0,
      "decay_per_time_unit_denom_shift": 0
    },
    "min_decay": 0
  },
  "min_witness_account_subsidy_decay": 0
}
```

</div>
