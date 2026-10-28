---
title: "debug_node_api.debug_get_witness_schedule"
description: "디버그 노드 (debug node)의 현재 위트니스 스케줄을 반환합니다."
outline: [2, 3]
---

# debug_node_api.debug_get_witness_schedule

<p class="api-badges"><span class="badge badge-disabled">disabled</span></p>

<p class="api-detail">Defined in the steem source (52dcfabb); the debug_node plugin is not enabled on public nodes.</p>

## Purpose

디버그 노드 (debug node)의 현재 위트니스 스케줄을 반환합니다.

## Parameters

<div class="code-card code-card-params">
<div class="code-card-title">PARAMETERS</div>

```json
{}
```

</div>

<p class="dead-note">⚠ steem 소스 코드에 정의되어 있지만, 퍼블릭 노드에서는 활성화되지 않았습니다.</p>

## Example

<div class="code-card code-card-example">
<div class="code-card-title">BASH</div>

```bash
# NOTE: this method is no longer served by public nodes
curl -s https://api.steemit.com \
  -H 'Content-Type: application/json' \
  --data-binary '{
    "jsonrpc": "2.0",
    "method": "debug_node_api.debug_get_witness_schedule",
    "params": {},
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
  "next_shuffle_block_num": 21573344,
  "current_shuffled_witnesses": [],
  "num_scheduled_witnesses": 192,
  "elected_weight": 49,
  "timeshare_weight": 73,
  "miner_weight": 1,
  "witness_pay_normalization_factor": 0,
  "median_props": {
    "account_creation_fee": {
      "amount": "0",
      "precision": 3,
      "nai": "@@000000021"
    },
    "maximum_block_size": 131072,
    "sbd_interest_rate": 1000,
    "account_subsidy_budget": 797,
    "account_subsidy_decay": 347321
  },
  "majority_version": "0.0.0",
  "max_voted_witnesses": 128,
  "max_miner_witnesses": 131,
  "max_runner_witnesses": 191,
  "hardfork_required_witnesses": 4,
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
